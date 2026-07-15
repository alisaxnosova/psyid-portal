import { NextResponse } from 'next/server';
import { kvGet } from '@/lib/upstash';
// ReNo v1.1 (Phase 5): the live test serves the 5-axis Likert bank. Admin manages it
// under `psyid:questions:v2`; the bundled JSON is the fallback / default.
import questionsJson from '@/app/reno/data/questions.json';

// Public — no auth needed. Reads live questions from Redis, falls back to bundled JSON.
export async function GET() {
  const cached = await kvGet<unknown[]>('psyid:questions:v2');
  const questions = cached ?? questionsJson;
  return NextResponse.json({ questions }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
