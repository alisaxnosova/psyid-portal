import { NextResponse } from 'next/server';

const BACKEND = process.env.BACKEND_URL ?? 'http://159.194.222.35:3010';

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    return NextResponse.json({ error: 'ADMIN_SECRET not configured' }, { status: 503 });
  }

  // Option 1: password matches ADMIN_SECRET directly
  if (password === secret) {
    return NextResponse.json({ accessToken: secret });
  }

  // Option 2: verify email+password with the backend
  // If backend confirms, issue ADMIN_SECRET token (so Vercel can verify it locally)
  try {
    const res = await fetch(`${BACKEND}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      signal: AbortSignal.timeout(5000),
    });
    if (res.ok) {
      return NextResponse.json({ accessToken: secret });
    }
  } catch {
    // backend unreachable — fall through to 401
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
