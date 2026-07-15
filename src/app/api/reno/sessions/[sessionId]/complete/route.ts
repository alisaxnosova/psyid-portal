import { NextResponse } from 'next/server';
import { kvConfigured, kvGet, kvSet, kvIncr } from '@/lib/upstash';
import type { RenoSession } from '@/app/api/reno/types';
import type { AccessCode } from '@/app/api/codes/route';

const CODES_KEY = 'psyid:codes';

// A research participant ID is only assigned to valid subjects: those who consented
// to research use AND actually provided demographic data (i.e. did not skip intake).
// Non-consenting or demographics-skipping takers still get their result — just no number.
function isResearchSubject(s: RenoSession): boolean {
  const k = s.intake;
  if (!k || k.researchConsent !== true) return false;
  return Boolean(
    k.age || k.sex || k.country || k.nativeLanguage || k.education ||
    k.occupation || k.employmentStatus || k.relationshipStatus,
  );
}

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

  // Assign a gapless sequential participant ID, once, to valid research subjects.
  // Portal users draw from the 'P' sequence; external/Etsy takers from 'E'.
  let participantId = session.participantId;
  if (!participantId && isResearchSubject(session)) {
    const prefix = session.userType === 'portal' ? 'P' : 'E';
    const n = await kvIncr(`psyid:participant-seq:${prefix}`);
    if (n > 0) participantId = `${prefix}-${String(n).padStart(5, '0')}`;
  }

  await Promise.all([
    kvSet(`psyid:reno-session:${sessionId}`, {
      ...session,
      status: 'completed',
      completedAt,
      ...(participantId ? { participantId } : {}),
    }),
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
