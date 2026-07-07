import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvSet, kvDel } from '@/lib/upstash';
// New ReNo v1.1 5-axis Likert bank. Managed under its own Redis key so it stays
// independent of the live 4-axis test (`psyid:questions`) until Phase 5 flips it.
import questionsJson from '@/app/reno/data/questions.json';

const KEY = 'psyid:questions:v2';

function verifyAdmin(req: NextRequest): boolean {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const secret = process.env.ADMIN_SECRET;
  return !!token && !!secret && token === secret;
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const cached = await kvGet<unknown[]>(KEY);
  return NextResponse.json({ questions: cached ?? questionsJson, source: cached ? 'redis' : 'bundled' });
}

export async function PUT(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { questions } = (await req.json()) as { questions: unknown[] };
  await kvSet(KEY, questions);
  return NextResponse.json({ ok: true });
}

// Reset to the bundled v1.1 bank (clears admin edits).
export async function DELETE(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await kvDel(KEY);
  return NextResponse.json({ ok: true, questions: questionsJson });
}
