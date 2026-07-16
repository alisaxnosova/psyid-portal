import { NextResponse } from 'next/server';
import { kvGet, kvKeys } from '@/lib/upstash';
import { scoreSession } from '@/lib/renoScore';
import { scoreSessionV12 } from '@/lib/renoScoreV12';
import { isV12Session } from '@/lib/scoreSessionAuto';
import type { RenoSession } from '@/app/api/reno/types';

const BACKEND = process.env.BACKEND_URL ?? 'http://159.194.222.35:3010';

// ReNo v1.2 sessions store Likert answers ('1'..'5'); legacy sessions store
// forced-choice option ids ('a'/'b'). Detect by answer shape so each session is
// scored with the matching engine — never the old MBTI scorer on new data.
const EMPTY_PCT = { E: 0, I: 0, S: 0, N: 0, F: 0, T: 0, J: 0, P: 0 };

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
      const codeEntry = codeMap.get(s.codeId);
      const common = {
        sessionId: s.id,
        codeId: s.codeId,
        code: codeEntry?.code ?? '—',
        participantId: s.participantId ?? null,
        userName: codeEntry?.user_name ?? null,
        invoiceRef: codeEntry?.invoice_ref ?? null,
        status: s.status,
        device: s.device ?? 'unknown',
        intake: s.intake ?? null,
        answersCount: s.answers.length,
        avgResponseTimeMs: s.answers.length
          ? Math.round(s.answers.reduce((sum, a) => sum + (a.responseTimeMs ?? 0), 0) / s.answers.length)
          : null,
        createdAt: s.createdAt,
        completedAt: s.completedAt ?? null,
      };

      if (isV12Session(s)) {
        const v12 = scoreSessionV12(s.answers);
        return {
          ...common,
          schema: 'v1.2' as const,
          type: v12.type,                 // 4-letter headline, e.g. OCLD (excludes ER)
          signature: v12.signature,       // e.g. "W2 · A4 · V3 · F4 · S2"
          axesV12: v12.axes.map(a => ({
            code: a.code,
            position: Math.round(a.position),
            band: a.band,
            poleLetter: a.poleLetter,
            signature: a.signature,
          })),
          // legacy fields kept nominal so the shared row type stays simple
          nearBoundary: [] as string[],
          pct: EMPTY_PCT,
          scores: {} as Record<string, number>,
        };
      }

      const score = scoreSession(s.answers);
      return {
        ...common,
        schema: 'v1.0' as const,
        type: score.type,
        signature: undefined,
        axesV12: undefined,
        nearBoundary: score.nearBoundary,
        pct: score.pct,
        scores: score.scores,
      };
    })
    .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''));

  return NextResponse.json({ results });
}
