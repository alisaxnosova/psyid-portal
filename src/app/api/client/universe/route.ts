import { NextResponse } from 'next/server';
import { kvGet, kvKeys } from '@/lib/upstash';
import { getSession, getPortalUser, ensureAccessCode } from '@/lib/portalAuth';
import { isV12Session } from '@/lib/scoreSessionAuto';
import { scoreSessionV12 } from '@/lib/renoScoreV12';
import { scoreSession } from '@/lib/renoScore';
import { codeOf, type Profile } from '@/components/galaxy/model';
import type { AccessCode } from '@/app/api/codes/route';
import type { RenoSession } from '@/app/api/reno/types';

/**
 * Drives the portal "personality universe" (5-axis). Additive to /api/client/results
 * (which stays 4-axis for the report stack) — reads sessions and scores them into the
 * galaxy Profile shape {t,s}[] in AXES order (energy, info, decision, structure, emotion).
 * v1.2 sessions use the five-axis engine; legacy sessions map their four axes with the
 * emotional-response axis held at center.
 */

const CODES_KEY = 'psyid:codes';
const V12_CODES = ['EO', 'IF', 'DB', 'SP', 'ER'] as const;

const posToAxis = (pos: number) => (pos >= 50 ? { t: 'plus' as const, s: (pos - 50) * 2 } : { t: 'minus' as const, s: (50 - pos) * 2 });

function profileForSession(s: RenoSession): { profile: Profile; legacy: boolean } {
  if (isV12Session(s)) {
    const v12 = scoreSessionV12(s.answers);
    return { profile: V12_CODES.map((c) => posToAxis(v12.byCode[c].position)), legacy: false };
  }
  // legacy 4-axis → positions toward each plus pole; emotion held at center (balanced)
  const p = scoreSession(s.answers).pct;
  const positions = [p.E, p.S, p.T, p.J, 50];
  return { profile: positions.map(posToAxis), legacy: true };
}

const MONTHS_RU = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${MONTHS_RU[d.getMonth()]} ${d.getFullYear()}`;
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const session = await getSession(authHeader.replace(/^Bearer\s+/i, ''));
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const portalUser = await getPortalUser(session.email);
    if (!portalUser) return NextResponse.json({ hasResult: false, sessions: [] });

    const accessCode = await ensureAccessCode(portalUser);
    const codes = (await kvGet<AccessCode[]>(CODES_KEY)) ?? [];
    const codeId = codes.find((c) => c.code === accessCode)?.id;

    const keys = codeId ? await kvKeys('psyid:reno-session:*') : [];
    const stored = (await Promise.all(keys.map((k) => kvGet<RenoSession>(k)))).filter(
      (s): s is RenoSession => !!s && s.status === 'completed' && s.codeId === codeId,
    );
    stored.sort((a, b) => new Date(a.completedAt ?? a.createdAt).getTime() - new Date(b.completedAt ?? b.createdAt).getTime());

    const sessions = stored.map((s, i) => {
      const { profile, legacy } = profileForSession(s);
      const when = s.completedAt ?? s.createdAt;
      return {
        id: s.id,
        no: i + 1,
        dateISO: when,
        date: fmtDate(when),
        code: codeOf(profile),
        profile,
        legacy,
        latest: i === stored.length - 1,
      };
    });

    const latest = sessions[sessions.length - 1] ?? null;
    const name = portalUser.name || session.email.split('@')[0];

    return NextResponse.json({
      hasResult: sessions.length > 0,
      name,
      accessCode,
      code: latest?.code ?? null,
      profile: latest?.profile ?? null,
      sessions,
    });
  } catch (err) {
    console.error('[client/universe]', err);
    return NextResponse.json({ message: 'Failed to load universe.' }, { status: 500 });
  }
}
