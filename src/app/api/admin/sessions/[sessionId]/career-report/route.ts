import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvSet } from '@/lib/upstash';
import { scoreSession } from '@/lib/renoScore';
import { generateReport } from '@/lib/report-generator';
import type { ReportInput } from '@/lib/report-generator';

// Allow up to 5 minutes — 16 Claude calls with concurrency 4 can take 2-3 min
export const maxDuration = 300;

interface RenoSession {
  id: string;
  answers: { questionId: string; answerId: string; answeredAt?: string; responseTimeMs?: number }[];
  status: string;
  code?: string;
  intake?: {
    firstName?: string;
    age?: number;
    country?: string;
    occupation?: string;
    employmentStatus?: string;
  };
  completedAt?: string;
}

function verifyAdmin(req: NextRequest): boolean {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  return !!token && !!process.env.ADMIN_SECRET && token === process.env.ADMIN_SECRET;
}

// GET: check if a report already exists
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { sessionId } = await params;
  const cached = await kvGet<string>(`psyid:career-report:${sessionId}`);
  return NextResponse.json({ exists: !!cached });
}

// POST: generate (or regenerate) the career report
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;
  const body = await req.json().catch(() => ({})) as { force?: boolean };

  // Return cached unless force=true
  if (!body.force) {
    const cached = await kvGet<string>(`psyid:career-report:${sessionId}`);
    if (cached) return NextResponse.json({ ok: true, cached: true });
  }

  const session = await kvGet<RenoSession>(`psyid:reno-session:${sessionId}`);
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  if (session.status !== 'completed') {
    return NextResponse.json({ error: 'Session not completed' }, { status: 400 });
  }

  try {
    const score = scoreSession(session.answers);

    const input: ReportInput = {
      sessionId,
      score,
      code: session.code,
      intake: session.intake,
      completedAt: session.completedAt,
    };

    const html = await generateReport(input);

    // Cache for 30 days (TTL in seconds)
    await kvSet(`psyid:career-report:${sessionId}`, html, 60 * 60 * 24 * 30);

    return NextResponse.json({ ok: true, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[career-report] generation failed:', message);
    return NextResponse.json({ error: 'Generation failed', detail: message }, { status: 500 });
  }
}
