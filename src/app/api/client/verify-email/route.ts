import { NextResponse } from 'next/server';
import { kvGet, kvSet, kvDel } from '@/lib/upstash';
import { createPortalUser, createSession, getPortalUser } from '@/lib/portalAuth';
import type { PendingRegistration } from '../pre-register/route';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://159.194.222.35:3010/api';
const MAX_ATTEMPTS = 5;

interface PortalUserRecord {
  email: string;
  name: string;
  userId: string;
  registeredAt: string;
}

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

    // Code is valid — attempt backend registration
    type BackendTokens = { accessToken: string; refreshToken: string; userId: string };
    let backendUserId: string | null = null;
    let backendTokens: BackendTokens | null = null;

    try {
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

      if (res.ok) {
        backendTokens = await res.json() as BackendTokens;
        backendUserId = backendTokens.userId;
      }
      // 409 = account already exists on backend — we'll create/update Redis credentials below
    } catch {
      // Backend unreachable — fall through to Redis-only auth
    }

    await kvDel(key);

    // Always store/update credentials in Redis so user can log in via Redis auth
    const existing = await getPortalUser(pending.email);
    if (!existing) {
      await createPortalUser(pending.email, pending.name, pending.password, backendUserId);
    }

    // Store in portal-users list for admin view
    const portalUsers = await kvGet<PortalUserRecord[]>('psyid:portal-users') ?? [];
    if (!portalUsers.find(u => u.email === pending.email)) {
      portalUsers.push({
        email: pending.email,
        name: pending.name,
        userId: backendUserId ?? `portal_${pending.email}`,
        registeredAt: new Date().toISOString(),
      });
      await kvSet('psyid:portal-users', portalUsers);
    }

    // If backend gave us tokens, use them; otherwise create a Redis session
    if (backendTokens) {
      return NextResponse.json({ tokens: backendTokens });
    }

    // Create a Redis session so user is logged in immediately after registration
    const user = await getPortalUser(pending.email);
    if (!user) {
      return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
    }
    const sessionToken = await createSession(user);
    return NextResponse.json({
      tokens: {
        accessToken: sessionToken,
        refreshToken: sessionToken,
        userId: user.backendUserId ?? `portal_${user.email}`,
      },
    });
  } catch (err) {
    console.error('[verify-email]', err);
    return NextResponse.json({ error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
