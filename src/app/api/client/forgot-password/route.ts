import { NextResponse } from 'next/server';
import { kvSet } from '@/lib/upstash';
import { getPortalUser } from '@/lib/portalAuth';
import { sendPasswordResetCode } from '@/lib/email';

export interface PendingReset {
  code: string;
  email: string;
  expiresAt: number;
  attempts: number;
}

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) return NextResponse.json({ error: 'Email is required.' }, { status: 400 });

    const normalized = email.toLowerCase().trim();

    // Only send a code if the account exists — but always respond success so we
    // never reveal whether an email is registered.
    const user = await getPortalUser(normalized);
    if (user) {
      const code = generateCode();
      const pending: PendingReset = {
        code,
        email: normalized,
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0,
      };
      await kvSet(`psyid:reset:${normalized}`, pending, 15 * 60);
      try {
        await sendPasswordResetCode(normalized, code);
      } catch (e) {
        console.error('[forgot-password] email send failed', e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[forgot-password]', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
