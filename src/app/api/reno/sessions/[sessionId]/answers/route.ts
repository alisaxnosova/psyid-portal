import { NextResponse } from 'next/server';
import { kvConfigured, kvGet, kvSet } from '@/lib/upstash';
import type { RenoSession } from '@/app/api/reno/types';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!kvConfigured()) return NextResponse.json({ ok: false, error: 'server_error' }, { status: 503 });

  const { sessionId } = await params;
  const { questionId, answerId, answeredAt, questionIndex, responseTimeMs } = (await req.json()) as {
    questionId: string;
    answerId: string;
    answeredAt: string;
    questionIndex: number;
    responseTimeMs?: number;
  };

  const session = await kvGet<RenoSession>(`psyid:reno-session:${sessionId}`);
  if (!session) return NextResponse.json({ ok: false, error: 'session_not_found' }, { status: 404 });

  // Idempotent: overwrite existing answer for this questionId
  const updated = [...session.answers];
  const existing = updated.findIndex(a => a.questionId === questionId);
  const entry = { questionId, answerId, answeredAt, ...(responseTimeMs != null ? { responseTimeMs } : {}) };
  if (existing >= 0) {
    updated[existing] = entry;
  } else {
    updated.push(entry);
  }

  await kvSet(`psyid:reno-session:${sessionId}`, {
    ...session,
    answers: updated,
    lastIndex: Math.max(session.lastIndex, questionIndex),
    status: 'in_progress',
  });

  return NextResponse.json({ ok: true });
}
