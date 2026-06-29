import { NextResponse } from 'next/server';
import { kvGet, kvSet, kvDel } from '@/lib/upstash';
import type { PendingRegistration } from '../pre-register/route';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3010/api';
const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json() as { email?: string; code?: string };

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required.' }, { status: 400 });
    }

    const key = `psyid:verify:${email.toLowerCase().trim()}`;
    const pending = await kvGet<PendingRegistration>(key);

    if (!pending) {
      return NextResponse.json({ error: 'Code not found. Please start registration again.' }, { status: 400 });
    }

    if (Date.now() > pending.expiresAt) {
      await kvDel(key);
      return NextResponse.json({ error: 'Code expired. Please start registration again.' }, { status: 400 });
    }

    if (pending.attempts >= MAX_ATTEMPTS) {
      await kvDel(key);
      return NextResponse.json({ error: 'Too many incorrect attempts. Please start registration again.' }, { status: 400 });
    }

    if (pending.code !== code.trim()) {
      await kvSet(key, { ...pending, attempts: pending.attempts + 1 });
      const left = MAX_ATTEMPTS - pending.attempts - 1;
      return NextResponse.json({
        error: `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} remaining.`,
      }, { status: 400 });
    }

    // Code valid — create account in backend
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: pending.email,
        password: pending.password,
        name: pending.name || undefined,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({} as { message?: string })) as { message?: string };
      if (res.status === 409) {
        await kvDel(key);
        return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 });
      }
      return NextResponse.json({ error: body.message ?? 'Account creation failed. Please try again.' }, { status: res.status });
    }

    const tokens = await res.json();
    await kvDel(key);

    return NextResponse.json({ tokens });
  } catch (err) {
    console.error('[verify-email]', err);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
