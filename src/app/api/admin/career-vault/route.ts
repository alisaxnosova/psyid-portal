import { NextResponse } from 'next/server';
import { kvConfigured } from '@/lib/upstash';
import { getSpheres, saveSphere } from '@/lib/career-vault/store';
import type { Sphere } from '@/lib/career-vault/types';

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

export async function GET(req: Request) {
  if (!kvConfigured()) {
    return NextResponse.json({ error: 'kv_not_configured', spheres: [] }, { status: 503 });
  }
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const spheres = await getSpheres();

  // ?export=1 → downloadable JSON snapshot for re-committing to git.
  const url = new URL(req.url);
  if (url.searchParams.get('export') === '1') {
    const body = spheres.length === 1 ? spheres[0] : spheres;
    return new NextResponse(JSON.stringify(body, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="career-vault-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  }

  return NextResponse.json({ spheres });
}

export async function PUT(req: Request) {
  if (!kvConfigured()) {
    return NextResponse.json({ error: 'kv_not_configured' }, { status: 503 });
  }
  if (!(await verifyAdmin(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sphere = (await req.json()) as Sphere;
  if (!sphere?.id || !Array.isArray(sphere.industries)) {
    return NextResponse.json({ error: 'invalid_sphere' }, { status: 400 });
  }
  await saveSphere(sphere);
  return NextResponse.json({ ok: true });
}
