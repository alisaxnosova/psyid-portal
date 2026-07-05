import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { kvGet } from '@/lib/upstash';

const ADMINS_KEY = 'psyid:admins';

interface AdminRecord {
  email: string;
  name?: string;
  passwordHash: string;
  createdAt: string;
}

export async function POST(req: Request) {
  const { email, password } = (await req.json()) as { email?: string; password?: string };
  const secret = process.env.ADMIN_SECRET;
  const adminEmail = process.env.ADMIN_EMAIL ?? 'support@psyid.me';

  if (!secret) {
    return NextResponse.json({ error: 'ADMIN_SECRET not configured' }, { status: 503 });
  }

  const em = email?.toLowerCase().trim();

  // Primary env-based admin (email + ADMIN_SECRET as password).
  if (em && em === adminEmail.toLowerCase() && password === secret) {
    return NextResponse.json({ accessToken: secret });
  }

  // Additional admins registered in Redis (bcrypt-hashed passwords). They all
  // authenticate to the same ADMIN_SECRET token, so every admin route keeps working.
  if (em && password) {
    const admins = (await kvGet<AdminRecord[]>(ADMINS_KEY)) ?? [];
    const rec = admins.find(a => a.email.toLowerCase() === em);
    if (rec && (await bcrypt.compare(password, rec.passwordHash))) {
      return NextResponse.json({ accessToken: secret });
    }
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
