import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export interface AccessCode {
  id: string;
  code: string;
  status: 'UNUSED' | 'USED';
  invoice_ref: string | null;
  note: string | null;
  created_at: string;
  used_at: string | null;
}

const CODES_KEY = 'psyid:codes';
const BACKEND = process.env.BACKEND_URL ?? 'http://159.194.222.35:3010';

async function verifyAdmin(req: Request): Promise<boolean> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return false;
  try {
    const res = await fetch(`${BACKEND}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!process.env.KV_REST_API_URL) {
    return NextResponse.json({ error: 'kv_not_configured', codes: [] }, { status: 503 });
  }
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const codes: AccessCode[] = (await kv.get<AccessCode[]>(CODES_KEY)) ?? [];
  return NextResponse.json({ codes });
}

export async function POST(req: Request) {
  if (!process.env.KV_REST_API_URL) {
    return NextResponse.json({ error: 'kv_not_configured' }, { status: 503 });
  }
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json() as AccessCode;
  const codes: AccessCode[] = (await kv.get<AccessCode[]>(CODES_KEY)) ?? [];
  codes.unshift(body);
  await kv.set(CODES_KEY, codes);
  return NextResponse.json({ code: body });
}
