import { NextResponse } from 'next/server';
import { kvConfigured, kvGet } from '@/lib/upstash';
import type { RenoSession } from '@/app/api/reno/types';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!kvConfigured()) return NextResponse.json({ answers: [], lastIndex: 0 });

  const { sessionId } = await params;
  const session = await kvGet<RenoSession>(`psyid:reno-session:${sessionId}`);
  if (!session) return NextResponse.json({ answers: [], lastIndex: 0 });

  return NextResponse.json({
    answers: session.answers,
    lastIndex: session.lastIndex,
    intake: session.intake,
    status: session.status,
  });
}
