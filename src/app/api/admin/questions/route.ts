import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvSet } from '@/lib/upstash';
import questionsJson from '@/app/reno/data/questions.json';

function verifyAdmin(req: NextRequest): boolean {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const secret = process.env.ADMIN_SECRET;
  return !!token && !!secret && token === secret;
}

export async function GET(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cached = await kvGet<unknown[]>('psyid:questions');
  const questions = cached ?? questionsJson;
  return NextResponse.json({ questions });
}

export async function PUT(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { questions } = (await req.json()) as { questions: unknown[] };
  await kvSet('psyid:questions', questions);
  return NextResponse.json({ ok: true });
}
