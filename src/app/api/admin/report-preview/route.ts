import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { profiles, getLevelFromSlider } from '@/app/reno/data/profiles';
import type { Lang } from '@/app/reno/data/profiles';

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

export async function POST(req: NextRequest) {
  if (!verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json() as {
    sliders: { EI: number; SN: number; TF: number; JP: number };
    lang: Lang;
  };
  const { sliders, lang } = body;

  const langName = LANG_NAMES[lang] ?? 'English';

  // Build per-axis context from profile levels
  const axisContexts = profiles.map(axis => {
    const level = getLevelFromSlider(axis, sliders[axis.axis as keyof typeof sliders] ?? 0);
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

Write the full narrative report in ${langName} only. No headings, no bullet points — just flowing paragraphs.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = (message.content[0] as { text: string }).text;
  return NextResponse.json({ narrative: text });
}
