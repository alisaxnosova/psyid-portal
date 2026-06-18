import { NextResponse } from 'next/server';
import { kvConfigured, kvGet, kvSet } from '@/lib/upstash';
import type { AccessCode } from '../route';

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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!kvConfigured()) return NextResponse.json({ error: 'kv_not_configured' }, { status: 503 });
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const patch = (await req.json()) as Partial<AccessCode>;
  const codes: AccessCode[] = (await kvGet<AccessCode[]>(CODES_KEY)) ?? [];
  const idx = codes.findIndex(c => c.id === id);
  if (idx < 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  codes[idx] = { ...codes[idx], ...patch };
  await kvSet(CODES_KEY, codes);
  return NextResponse.json({ code: codes[idx] });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!kvConfigured()) return NextResponse.json({ error: 'kv_not_configured' }, { status: 503 });
  if (!(await verifyAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const codes: AccessCode[] = (await kvGet<AccessCode[]>(CODES_KEY)) ?? [];
  const updated = codes.filter(c => c.id !== id);
  await kvSet(CODES_KEY, updated);
  return NextResponse.json({ ok: true });
}
