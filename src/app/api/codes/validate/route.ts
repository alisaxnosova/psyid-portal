import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { AccessCode } from '../route';

const CODES_KEY = 'psyid:codes';

// Public endpoint — no admin auth needed
// Only returns whether a code is valid, never exposes the full list
export async function POST(req: Request) {
  if (!process.env.KV_REST_API_URL) {
    // KV not set up — let the frontend fall back to localStorage validation
    return NextResponse.json({ error: 'kv_not_configured' }, { status: 503 });
  }

  const { code } = await req.json() as { code: string };
  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ valid: false, reason: 'invalid_format' });
  }

  const codes: AccessCode[] = (await kv.get<AccessCode[]>(CODES_KEY)) ?? [];
  const found = codes.find(c => c.code === code);

  if (!found)                   return NextResponse.json({ valid: false, reason: 'not_found' });
  if (found.status === 'USED')  return NextResponse.json({ valid: false, reason: 'already_used' });

  return NextResponse.json({ valid: true, id: found.id });
}
