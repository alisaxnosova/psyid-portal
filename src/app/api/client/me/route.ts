import { NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://159.194.222.35:3010/api';

export async function GET(req: Request) {
  try {
    const token = req.headers.get('Authorization');
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: token },
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[client/me]', err);
    return NextResponse.json({ message: 'Failed to fetch user.' }, { status: 500 });
  }
}
