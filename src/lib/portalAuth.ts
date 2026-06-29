import bcrypt from 'bcryptjs';
import { kvGet, kvSet, kvDel } from './upstash';
import { randomBytes } from 'crypto';

export interface PortalUser {
  email: string;
  name: string;
  passwordHash: string;
  backendUserId: string | null;
  createdAt: string;
}

export interface PortalSession {
  email: string;
  name: string;
  userId: string;
}

function userKey(email: string) {
  return `psyid:portal-user:${email.toLowerCase().trim()}`;
}

function sessionKey(token: string) {
  return `psyid:portal-session:${token}`;
}

export async function createPortalUser(
  email: string,
  name: string,
  password: string,
  backendUserId: string | null,
): Promise<void> {
  const passwordHash = await bcrypt.hash(password, 10);
  const user: PortalUser = {
    email: email.toLowerCase().trim(),
    name,
    passwordHash,
    backendUserId,
    createdAt: new Date().toISOString(),
  };
  await kvSet(userKey(email), user);
}

export async function getPortalUser(email: string): Promise<PortalUser | null> {
  return kvGet<PortalUser>(userKey(email));
}

export async function verifyPortalPassword(email: string, password: string): Promise<PortalUser | null> {
  const user = await getPortalUser(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}

export async function createSession(user: PortalUser): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const session: PortalSession = {
    email: user.email,
    name: user.name,
    userId: user.backendUserId ?? `portal_${user.email}`,
  };
  // 30-day expiry
  await kvSet(sessionKey(token), session, 60 * 60 * 24 * 30);
  return token;
}

export async function getSession(token: string): Promise<PortalSession | null> {
  return kvGet<PortalSession>(sessionKey(token));
}

export async function deleteSession(token: string): Promise<void> {
  await kvDel(sessionKey(token));
}
