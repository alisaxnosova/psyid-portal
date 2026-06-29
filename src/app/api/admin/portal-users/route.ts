import { NextResponse } from 'next/server';
import { kvGet } from '@/lib/upstash';

const BACKEND = process.env.BACKEND_URL ?? 'http://159.194.222.35:3010';

async function verifyAdmin(req: Request): Promise<boolean> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return false;
  const secret = process.env.ADMIN_SECRET;
  if (secret && token === secret) return true;
  try {
    const res = await fetch(`${BACKEND}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch { return false; }
}

interface PortalUser {
  email: string;
  name: string;
  userId: string;
  accessCode?: string;
  registeredAt: string;
}

export async function GET(req: Request) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const users = await kvGet<PortalUser[]>('psyid:portal-users') ?? [];
  return NextResponse.json({ users });
}
