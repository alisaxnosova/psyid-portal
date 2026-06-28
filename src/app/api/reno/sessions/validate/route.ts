import { NextResponse } from 'next/server';
import { kvConfigured, kvGet, kvSet } from '@/lib/upstash';
import type { AccessCode } from '@/app/api/codes/route';
import type { RenoSession, RenoSessionsMap } from '@/app/api/reno/types';

const CODES_KEY = 'psyid:codes';
const RENO_SESSIONS_MAP_KEY = 'psyid:reno-sessions';

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

  const sessionsMap: RenoSessionsMap = (await kvGet<RenoSessionsMap>(RENO_SESSIONS_MAP_KEY)) ?? {};

  // Completed — permanently blocked
  if (found.status === 'USED') {
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

  // Fresh code — create session, mark IN_PROGRESS (not USED until completed)
  const sessionId = `reno_${found.id}_${Date.now()}`;
  const newSession: RenoSession = {
    id: sessionId,
    codeId: found.id,
    status: 'started',
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
