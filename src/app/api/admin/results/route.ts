import { NextResponse } from 'next/server';
import { kvGet, kvKeys } from '@/lib/upstash';
import { scoreSession } from '@/lib/renoScore';
import type { RenoSession } from '@/app/api/reno/types';

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

  const sessionKeys = await kvKeys('psyid:reno-session:*');
  const sessions = await Promise.all(
    sessionKeys.map(key => kvGet<RenoSession>(key))
  );

  const codesRaw = await kvGet<{ id: string; code: string; user_name?: string | null; invoice_ref?: string | null }[]>('psyid:codes');
  const codeMap = new Map((codesRaw ?? []).map(c => [c.id, c]));

  const results = sessions
    .filter((s): s is RenoSession => !!s && s.status === 'completed')
    .map(s => {
      const score = scoreSession(s.answers);
      const codeEntry = codeMap.get(s.codeId);
      return {
        sessionId: s.id,
        codeId: s.codeId,
        code: codeEntry?.code ?? '—',
        userName: codeEntry?.user_name ?? null,
        invoiceRef: codeEntry?.invoice_ref ?? null,
        status: s.status,
        device: s.device ?? 'unknown',
        type: score.type,
        nearBoundary: score.nearBoundary,
        pct: score.pct,
        scores: score.scores,
        intake: s.intake ?? null,
        answersCount: s.answers.length,
        avgResponseTimeMs: s.answers.length
          ? Math.round(s.answers.reduce((sum, a) => sum + (a.responseTimeMs ?? 0), 0) / s.answers.length)
          : null,
        createdAt: s.createdAt,
        completedAt: s.completedAt ?? null,
      };
    })
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));

  return NextResponse.json({ results });
}
