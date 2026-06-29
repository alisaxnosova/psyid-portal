import { NextResponse } from 'next/server';
import { getSession } from '@/lib/portalAuth';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://159.194.222.35:3010/api';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace(/^Bearer\s+/i, '');

    // Check Redis session first
    const session = await getSession(token);
    if (session) {
      return NextResponse.json({
        id: session.userId,
        email: session.email,
        fullName: session.name || null,
        firstName: session.name ? session.name.split(' ')[0] : null,
        createdAt: '',
      });
    }

    // Fall back to backend
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: authHeader },
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error('[client/me]', err);
    return NextResponse.json({ message: 'Failed to fetch user.' }, { status: 500 });
  }
}
