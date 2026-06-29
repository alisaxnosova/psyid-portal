import { NextResponse } from 'next/server';
import { kvSet } from '@/lib/upstash';
import { sendVerificationCode } from '@/lib/email';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export interface PendingRegistration {
  code: string;
  name: string;
  email: string;
  password: string;
  expiresAt: number;
  attempts: number;
}

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json() as { name?: string; email?: string; password?: string };

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const key = `psyid:verify:${email.toLowerCase().trim()}`;
    const code = generateCode();
    const pending: PendingRegistration = {
      code,
      name: name?.trim() ?? '',
      email: email.toLowerCase().trim(),
      password,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      attempts: 0,
    };

    await kvSet(key, pending);
    await sendVerificationCode(email.trim(), code);

    return NextResponse.json({ sent: true });
  } catch (err) {
    console.error('[pre-register]', err);
    const message = err instanceof Error ? err.message : 'Failed to send verification email.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
