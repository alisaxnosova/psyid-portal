import { NextResponse } from 'next/server';
import { verifyPortalPassword, createSession } from '@/lib/portalAuth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://159.194.222.35:3010/api';

export async function POST(req: Request) {
  try {
    const body = await req.json() as { email?: string; password?: string };
    const { email, password } = body;

    // Check Redis-based credentials first
    if (email && password) {
      const user = await verifyPortalPassword(email, password);
      if (user) {
        const token = await createSession(user);
        return NextResponse.json({
          accessToken: token,
          refreshToken: token,
          userId: user.backendUserId ?? `portal_${user.email}`,
        });
      }
    }

    // Fall back to backend
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[client/login]', err);
    return NextResponse.json({ message: 'Login failed. Please try again.' }, { status: 500 });
  }
}
