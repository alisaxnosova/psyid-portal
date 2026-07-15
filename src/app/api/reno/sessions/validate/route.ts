import { NextResponse } from 'next/server';
import { kvConfigured, kvGet, kvSet } from '@/lib/upstash';
import type { AccessCode } from '@/app/api/codes/route';
import type { RenoSession, RenoSessionsMap } from '@/app/api/reno/types';

const CODES_KEY = 'psyid:codes';
const RENO_SESSIONS_MAP_KEY = 'psyid:reno-sessions';

// Registered portal users may retake the assessment at most once every 6 months.
const PORTAL_COOLDOWN_MS = 182 * 24 * 60 * 60 * 1000;

function detectDevice(req: Request): 'mobile' | 'desktop' | 'unknown' {
  const ua = req.headers.get('user-agent') ?? '';
  if (/mobile|android|iphone|ipad|ipod/i.test(ua)) return 'mobile';
  if (ua) return 'desktop';
  return 'unknown';
}

export async function POST(req: Request) {
  if (!kvConfigured()) {
    return NextResponse.json({ valid: false, reason: 'server_error' }, { status: 503 });
  }

  const { code } = (await req.json()) as { code?: string };
  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ valid: false, reason: 'invalid_format' });
  }

  const codes: AccessCode[] = (await kvGet<AccessCode[]>(CODES_KEY)) ?? [];
  const found = codes.find(c => c.code === code);

  if (!found) return NextResponse.json({ valid: false, reason: 'not_found' });

  const isPortal = !!found.portalUserEmail;
  const sessionsMap: RenoSessionsMap = (await kvGet<RenoSessionsMap>(RENO_SESSIONS_MAP_KEY)) ?? {};

  // Portal (registered) users: yearly cooldown instead of a permanent lock.
  // On completion the code's `used_at` is set to the completion time.
  if (isPortal && found.status === 'USED') {
    const last = found.used_at ? new Date(found.used_at).getTime() : null;
    if (last && Date.now() - last < PORTAL_COOLDOWN_MS) {
      return NextResponse.json({
        valid: false,
        reason: 'cooldown',
        availableAt: new Date(last + PORTAL_COOLDOWN_MS).toISOString(),
      });
    }
    // Cooldown elapsed → allow a fresh retake (falls through to session creation below).
  }

  // Completed — permanently blocked (external/Etsy codes only).
  if (found.status === 'USED' && !isPortal) {
    return NextResponse.json({ valid: false, reason: 'already_used' });
  }

  // In progress — resume existing session
  if (found.status === 'IN_PROGRESS') {
    const existingSessionId = sessionsMap[found.id];
    if (existingSessionId) {
      const session = await kvGet<RenoSession>(`psyid:reno-session:${existingSessionId}`);
      if (session && session.status !== 'completed') {
        return NextResponse.json({ valid: true, resumable: true, sessionId: existingSessionId });
      }
    }
    // Session missing or completed — treat as fresh
  }

  // Fresh code (or portal retake past cooldown) — create session, mark IN_PROGRESS.
  const isRetake = found.status === 'USED';
  const sessionId = `reno_${found.id}_${Date.now()}`;
  const newSession: RenoSession = {
    id: sessionId,
    codeId: found.id,
    userType: isPortal ? 'portal' : 'third_party',
    source: 'direct',
    status: 'started',
    ...(isRetake ? { isRetake: true } : {}),
    device: detectDevice(req),
    answers: [],
    lastIndex: 0,
    createdAt: new Date().toISOString(),
  };

  const idx = codes.findIndex(c => c.id === found.id);
  codes[idx] = { ...codes[idx], status: 'IN_PROGRESS', used_at: new Date().toISOString() };

  await Promise.all([
    kvSet(CODES_KEY, codes),
    kvSet(`psyid:reno-session:${sessionId}`, newSession),
    kvSet(RENO_SESSIONS_MAP_KEY, { ...sessionsMap, [found.id]: sessionId }),
  ]);

  return NextResponse.json({ valid: true, sessionId });
}
