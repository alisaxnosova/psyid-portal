import { NextResponse } from 'next/server';
import { kvConfigured, kvGet, kvSet } from '@/lib/upstash';

export interface AccessCode {
  id: string;
  code: string;
  status: 'UNUSED' | 'IN_PROGRESS' | 'USED';
  invoice_ref: string | null;
  note: string | null;
  user_name: string | null;
  created_at: string;
  used_at: string | null;
}

const CODES_KEY = 'psyid:codes';
const BACKEND = process.env.BACKEND_URL ?? 'http://159.194.222.35:3010';

async function verifyAdmin(req: Request): Promise<boolean> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return false;

  // Static secret — no backend dependency
  const secret = process.env.ADMIN_SECRET;
  if (secret && token === secret) return true;

  // Backend fallback (3 s timeout)
  try {
    const res = await fetch(`${BACKEND}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!kvConfigured()) {
    return NextResponse.json({ error: 'kv_not_configured', codes: [] }, { status: 503 });
  }
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const codes: AccessCode[] = (await kvGet<AccessCode[]>(CODES_KEY)) ?? [];
  return NextResponse.json({ codes });
}

export async function POST(req: Request) {
  if (!kvConfigured()) {
    return NextResponse.json({ error: 'kv_not_configured' }, { status: 503 });
  }
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = (await req.json()) as AccessCode;
  const codes: AccessCode[] = (await kvGet<AccessCode[]>(CODES_KEY)) ?? [];
  codes.unshift(body);
  await kvSet(CODES_KEY, codes);
  return NextResponse.json({ code: body });
}
