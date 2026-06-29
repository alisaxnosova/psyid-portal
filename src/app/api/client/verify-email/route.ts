import { NextResponse } from 'next/server';
import { kvGet, kvSet, kvDel } from '@/lib/upstash';
import { createPortalUser, createSession, getPortalUser } from '@/lib/portalAuth';
import type { AccessCode } from '@/app/api/codes/route';
import type { PendingRegistration } from '../pre-register/route';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://159.194.222.35:3010/api';
const CODES_KEY = 'psyid:codes';
const MAX_ATTEMPTS = 5;

interface PortalUserRecord {
  email: string;
  name: string;
  userId: string;
  accessCode: string;
  registeredAt: string;
}

function newId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

async function generateUniqueTestCode(): Promise<string> {
  const existing = await kvGet<AccessCode[]>(CODES_KEY) ?? [];
  const used = new Set(existing.map(c => c.code));
  let code: string;
  do {
    code = String(Math.floor(100000 + Math.random() * 900000));
  } while (used.has(code));
  return code;
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
      // 409 = account already exists on backend — fall through to Redis-only auth
    } catch {
      // Backend unreachable — fall through to Redis-only auth
    }

    await kvDel(key);

    // Generate or reuse test access code for this user
    const existing = await getPortalUser(pending.email);
    let testCode = existing?.accessCode ?? null;

    if (!testCode) {
      testCode = await generateUniqueTestCode();

      // Persist the test access code in psyid:codes
      const allCodes = await kvGet<AccessCode[]>(CODES_KEY) ?? [];
      const newEntry: AccessCode = {
        id: newId(),
        code: testCode,
        status: 'UNUSED',
        user_name: pending.name || pending.email,
        invoice_ref: null,
        note: 'Auto-generated for portal registration',
        created_at: new Date().toISOString(),
        used_at: null,
        portalUserEmail: pending.email,
      };
      allCodes.unshift(newEntry);
      await kvSet(CODES_KEY, allCodes);
    }

    // Store/update credentials in Redis
    if (!existing) {
      await createPortalUser(pending.email, pending.name, pending.password, backendUserId, testCode);
    }

    // Store in portal-users list for admin view (with access code)
    const portalUsers = await kvGet<PortalUserRecord[]>('psyid:portal-users') ?? [];
    const portalIdx = portalUsers.findIndex(u => u.email === pending.email);
    const portalEntry: PortalUserRecord = {
      email: pending.email,
      name: pending.name,
      userId: backendUserId ?? `portal_${pending.email}`,
      accessCode: testCode,
      registeredAt: new Date().toISOString(),
    };
    if (portalIdx < 0) {
      portalUsers.push(portalEntry);
    } else {
      portalUsers[portalIdx] = { ...portalUsers[portalIdx], accessCode: testCode };
    }
    await kvSet('psyid:portal-users', portalUsers);

    // Return backend tokens if available, otherwise create a Redis session
    if (backendTokens) {
      return NextResponse.json({ tokens: backendTokens });
    }

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
