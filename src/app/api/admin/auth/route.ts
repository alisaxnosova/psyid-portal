import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  const secret = process.env.ADMIN_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL ?? 'support@psyid.me';

  if (!secret) {
    return NextResponse.json({ error: 'ADMIN_SECRET not configured' }, { status: 503 });
  }

  if (
    email?.toLowerCase().trim() === adminEmail.toLowerCase() &&
    password === secret
  ) {
    return NextResponse.json({ accessToken: secret });
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
