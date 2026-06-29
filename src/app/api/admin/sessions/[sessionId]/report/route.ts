import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { kvGet, kvSet } from '@/lib/upstash';
import { profiles, getLevelFromPct } from '@/app/reno/data/profiles';
import type { Lang } from '@/app/reno/data/profiles';
import { scoreSession } from '@/lib/renoScore';

interface RenoSession {
  id: string;
  answers: { questionId: string; answerId: string }[];
  status: string;
}

const client = new Anthropic();

function verifyAdmin(req: NextRequest): boolean {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  const secret = process.env.ADMIN_SECRET;
  return !!token && !!secret && token === secret;
}

const LANG_NAMES: Record<Lang, string> = {
  ru: 'Russian',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  ar: 'Arabic',
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId } = await params;
  const lang = (req.nextUrl.searchParams.get('lang') as Lang) ?? 'en';
  const cacheKey = `psyid:report:${sessionId}:${lang}`;
  const cached = await kvGet<string>(cacheKey);
  if (cached) return NextResponse.json({ narrative: cached, cached: true });

  return NextResponse.json({ narrative: null });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId } = await params;
  const { lang } = (await req.json()) as { lang: Lang };
  const cacheKey = `psyid:report:${sessionId}:${lang}`;

  // Return cached version if it exists
  const cached = await kvGet<string>(cacheKey);
  if (cached) return NextResponse.json({ narrative: cached, cached: true });

  // Load session
  const session = await kvGet<RenoSession>(`psyid:reno-session:${sessionId}`);
  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  if (session.status !== 'completed') {
    return NextResponse.json({ error: 'Session not completed' }, { status: 400 });
  }

  const scored = scoreSession(session.answers);
  const pct: Record<string, number> = scored.pct;

  const langName = LANG_NAMES[lang] ?? 'English';

  const axisContexts = profiles.map(axis => {
    const level = getLevelFromPct(axis, pct as Record<string, number>);
    const dims = level.dims[lang]?.length ? level.dims[lang] : level.dims.ru;
    const label = level.label[lang] || level.label.ru;
    const dimLabels = axis.dimLabels[lang]?.length ? axis.dimLabels[lang] : axis.dimLabels.ru;

    const dimLines = dimLabels
      .map((lbl, i) => `  - ${lbl}: ${dims[i] ?? ''}`)
      .join('\n');

    return `## ${axis.axis} Axis — ${label}\n${dimLines}`;
  });

  const prompt = `You are an expert psychologist writing a personalized personality report. Based on the MBTI-style profile data below, write a cohesive, warm, insightful narrative personality report in ${langName}.

Address the reader directly as "you" throughout. Write 4–6 paragraphs. Each paragraph should naturally weave together insights from one or two axes, rather than listing bullet points. The tone should be empowering and professional — not clinical. Avoid mentioning MBTI jargon or axis names directly; instead describe the person's patterns and tendencies in plain language.

Profile data (behavioral descriptors per axis):
${axisContexts.join('\n\n')}

MBTI type: ${scored.type}

Write the full narrative report in ${langName} only. No headings, no bullet points — just flowing paragraphs.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const narrative = (message.content[0] as { type: string; text: string }).text;

  // Cache the result
  await kvSet(cacheKey, narrative);

  return NextResponse.json({ narrative, cached: false });
}
