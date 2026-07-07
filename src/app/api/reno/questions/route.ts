import { NextResponse } from 'next/server';
import { kvGet } from '@/lib/upstash';
// Live test still serves the legacy 4-axis bank (key `psyid:questions`) until the
// ReNo v1.1 Likert migration. The new 5-axis bank is managed separately in admin.
import questionsJson from '@/app/reno/data/questions.v1-4axis.json';

// Public — no auth needed. Reads live questions from Redis, falls back to bundled JSON.
export async function GET() {
  const cached = await kvGet<unknown[]>('psyid:questions');
  const questions = cached ?? questionsJson;
  return NextResponse.json({ questions }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
