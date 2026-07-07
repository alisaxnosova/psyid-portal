import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvSet } from '@/lib/upstash';
import questionsJson from '@/app/reno/data/questions.json';

function verifyAdmin(req: NextRequest): boolean {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const secret = process.env.ADMIN_SECRET;
  return !!token && !!secret && token === secret;
}

interface Question {
  id: string;
  [key: string]: unknown;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ questionId: string }> },
) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { questionId } = await params;
  const updatedQuestion = (await req.json()) as Question;

  const cached = await kvGet<Question[]>('psyid:questions:v2');
  const questions = (cached ?? (questionsJson as unknown as Question[])).map(q =>
    q.id === questionId ? { ...q, ...updatedQuestion } : q,
  );

  await kvSet('psyid:questions:v2', questions);
  return NextResponse.json({ ok: true, question: questions.find(q => q.id === questionId) });
}
