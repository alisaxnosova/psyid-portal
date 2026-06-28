import { NextResponse } from 'next/server';
import { kvGet, kvSet, kvDel } from '@/lib/upstash';
import type { RenoSessionsMap } from '@/app/api/reno/types';

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

export async function DELETE(req: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sessionId } = await params;

  const sessionsMap = await kvGet<RenoSessionsMap>('psyid:reno-sessions');
  if (!sessionsMap) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Find codeId whose sessionId matches
  const codeId = Object.keys(sessionsMap).find(k => sessionsMap[k] === sessionId);

  await Promise.all([
    kvDel(`psyid:reno-session:${sessionId}`),
    codeId
      ? kvSet('psyid:reno-sessions', Object.fromEntries(
          Object.entries(sessionsMap).filter(([k]) => k !== codeId)
        ))
      : Promise.resolve(),
  ]);

  return NextResponse.json({ ok: true });
}
