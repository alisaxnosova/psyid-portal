import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { password } = (await req.json()) as { password?: string };
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    return NextResponse.json({ error: 'ADMIN_SECRET not configured' }, { status: 503 });
  }
  if (!password || password !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ accessToken: secret });
}
