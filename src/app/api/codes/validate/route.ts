import { NextResponse } from 'next/server';
import { kvConfigured, kvGet } from '@/lib/upstash';
import type { AccessCode } from '../route';

const CODES_KEY = 'psyid:codes';

// Public endpoint — no admin auth needed
export async function POST(req: Request) {
  if (!kvConfigured()) {
    return NextResponse.json({ error: 'kv_not_configured' }, { status: 503 });
  }

  const { code } = (await req.json()) as { code: string };
  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ valid: false, reason: 'invalid_format' });
  }

  const codes: AccessCode[] = (await kvGet<AccessCode[]>(CODES_KEY)) ?? [];
  const found = codes.find(c => c.code === code);

  if (!found)                  return NextResponse.json({ valid: false, reason: 'not_found' });
  if (found.status === 'USED') return NextResponse.json({ valid: false, reason: 'already_used' });

  return NextResponse.json({ valid: true, id: found.id });
}
