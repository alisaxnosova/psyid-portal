import { NextResponse } from 'next/server';
import { kvConfigured, kvGet, kvSet } from '@/lib/upstash';
import type { RenoSession } from '@/app/api/reno/types';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!kvConfigured()) return NextResponse.json({ ok: false, error: 'server_error' }, { status: 503 });

  const { sessionId } = await params;
  const session = await kvGet<RenoSession>(`psyid:reno-session:${sessionId}`);
  if (!session) return NextResponse.json({ ok: false, error: 'session_not_found' }, { status: 404 });

  await kvSet(`psyid:reno-session:${sessionId}`, {
    ...session,
    status: 'completed',
    completedAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, redirectUrl: 'https://psyid.com' });
}
