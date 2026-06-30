import { NextResponse } from 'next/server';
import { kvGet } from '@/lib/upstash';
import questionsJson from '@/app/reno/data/questions.json';

// Public — no auth needed. Reads live questions from Redis, falls back to bundled JSON.
export async function GET() {
  const cached = await kvGet<unknown[]>('psyid:questions');
  const questions = cached ?? questionsJson;
  return NextResponse.json({ questions }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}
