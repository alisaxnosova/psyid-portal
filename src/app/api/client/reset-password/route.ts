import { NextResponse } from 'next/server';
import { kvGet, kvSet, kvDel } from '@/lib/upstash';
import { resetPortalPassword } from '@/lib/portalAuth';
import type { PendingReset } from '../forgot-password/route';

const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  try {
    const { email, code, password } = (await req.json()) as { email?: string; code?: string; password?: string };
    if (!email || !code || !password) {
      return NextResponse.json({ error: 'Email, code and new password are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const key = `psyid:reset:${email.toLowerCase().trim()}`;
    const pending = await kvGet<PendingReset>(key);

    if (!pending) {
      return NextResponse.json({ error: 'Code not found or expired. Please request a new one.' }, { status: 400 });
    }
    if (Date.now() > pending.expiresAt) {
      await kvDel(key);
      return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 });
    }
    if (pending.attempts >= MAX_ATTEMPTS) {
      await kvDel(key);
      return NextResponse.json({ error: 'Too many incorrect attempts. Please request a new code.' }, { status: 400 });
    }
    if (pending.code !== code.trim()) {
      await kvSet(key, { ...pending, attempts: pending.attempts + 1 }, 15 * 60);
      const left = MAX_ATTEMPTS - pending.attempts - 1;
      return NextResponse.json({ error: `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} remaining.` }, { status: 400 });
    }

    const ok = await resetPortalPassword(pending.email, password);
    await kvDel(key);
    if (!ok) {
      return NextResponse.json({ error: 'Account not found.' }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[reset-password]', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
