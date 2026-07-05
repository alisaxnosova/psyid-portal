import { NextResponse } from 'next/server';
import { kvConfigured, kvGet, kvSet } from '@/lib/upstash';
import type { RenoSession } from '@/app/api/reno/types';
import type { AccessCode } from '@/app/api/codes/route';

const CODES_KEY = 'psyid:codes';

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!kvConfigured()) return NextResponse.json({ ok: false, error: 'server_error' }, { status: 503 });

  const { sessionId } = await params;
  const session = await kvGet<RenoSession>(`psyid:reno-session:${sessionId}`);
  if (!session) return NextResponse.json({ ok: false, error: 'session_not_found' }, { status: 404 });

  const completedAt = new Date().toISOString();

  // Mark session completed + mark the code as USED (only happens on full completion)
  const codes = await kvGet<AccessCode[]>(CODES_KEY) ?? [];
  const idx = codes.findIndex(c => c.id === session.codeId);
  if (idx !== -1) codes[idx] = { ...codes[idx], status: 'USED', used_at: completedAt };

  await Promise.all([
    kvSet(`psyid:reno-session:${sessionId}`, { ...session, status: 'completed', completedAt }),
    kvSet(CODES_KEY, codes),
  ]);

  // Portal (registered) users go back to their portal to see the personality
  // passport; external/Etsy takers see the "results sent to your specialist" screen.
  const isPortal = session.userType === 'portal';
  return NextResponse.json({
    ok: true,
    isPortal,
    redirectUrl: isPortal ? 'https://psyid.me/portal' : 'https://psyid.me',
  });
}
