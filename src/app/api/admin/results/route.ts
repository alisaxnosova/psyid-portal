import { NextResponse } from 'next/server';
import { kvGet } from '@/lib/upstash';
import { scoreSession } from '@/lib/renoScore';
import type { RenoSession, RenoSessionsMap } from '@/app/api/reno/types';

const BACKEND = process.env.BACKEND_URL ?? 'http://159.194.222.35:3010';

async function verifyAdmin(req: Request): Promise<boolean> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return false;
  const secret = process.env.ADMIN_SECRET;
  if (secret && token === secret) return true;
  try {
    const res = await fetch(`${BACKEND}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch { return false; }
}

export async function GET(req: Request) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionMap = await kvGet<RenoSessionsMap>('psyid:reno-sessions');
  if (!sessionMap) return NextResponse.json({ results: [] });

  const sessionIds = Object.values(sessionMap);
  const sessions = await Promise.all(
    sessionIds.map(id => kvGet<RenoSession>(`psyid:reno-session:${id}`))
  );

  const codesRaw = await kvGet<{ id: string; code: string }[]>('psyid:codes');
  const codeMap = new Map((codesRaw ?? []).map(c => [c.id, c.code]));

  const results = sessions
    .filter((s): s is RenoSession => !!s && s.status === 'completed')
    .map(s => {
      const score = scoreSession(s.answers);
      return {
        sessionId: s.id,
        codeId: s.codeId,
        code: codeMap.get(s.codeId) ?? '—',
        status: s.status,
        type: score.type,
        pct: score.pct,
        scores: score.scores,
        intake: s.intake ?? null,
        answersCount: s.answers.length,
        createdAt: s.createdAt,
        completedAt: s.completedAt ?? null,
      };
    })
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));

  return NextResponse.json({ results });
}
