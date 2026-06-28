import { NextResponse } from 'next/server';
import { kvConfigured, kvGet, kvSet } from '@/lib/upstash';
import type { RenoSession } from '@/app/api/reno/types';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!kvConfigured()) return NextResponse.json({ ok: false, error: 'server_error' }, { status: 503 });

  const { sessionId } = await params;
  const body = (await req.json()) as RenoSession['intake'];

  const session = await kvGet<RenoSession>(`psyid:reno-session:${sessionId}`);
  if (!session) return NextResponse.json({ ok: false, error: 'session_not_found' }, { status: 404 });

  await kvSet(`psyid:reno-session:${sessionId}`, {
    ...session,
    intake: body,
    status: 'intake_done',
  });

  return NextResponse.json({ ok: true });
}
