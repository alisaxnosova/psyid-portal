import bcrypt from 'bcryptjs';
import { kvGet, kvSet, kvDel } from './upstash';
import { randomBytes } from 'crypto';

const CODES_KEY = 'psyid:codes';

interface StoredCode { id: string; code: string; portalUserEmail?: string; }
interface StoredPortalUserRecord { email: string; name: string; userId: string; accessCode?: string; registeredAt: string; }

export interface PortalUser {
  email: string;
  name: string;
  passwordHash: string;
  backendUserId: string | null;
  accessCode: string | null;
  createdAt: string;
  // Plan tier. Absent = grandfathered to 'full' (everyone who has completed so far).
  // Set explicitly once paid tiers exist.
  plan?: 'basic' | 'full';
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
  accessCode: string | null = null,
): Promise<void> {
  const passwordHash = await bcrypt.hash(password, 10);
  const user: PortalUser = {
    email: email.toLowerCase().trim(),
    name,
    passwordHash,
    backendUserId,
    accessCode,
    createdAt: new Date().toISOString(),
  };
  await kvSet(userKey(email), user);
}

export async function getPortalUser(email: string): Promise<PortalUser | null> {
  return kvGet<PortalUser>(userKey(email));
}

// Sets a new password for an existing portal user. Returns false if no such user.
export async function resetPortalPassword(email: string, newPassword: string): Promise<boolean> {
  const user = await getPortalUser(email);
  if (!user) return false;
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await kvSet(userKey(email), { ...user, passwordHash });
  return true;
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

function newId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// Ensures a portal user has an access code; generates and saves one if missing.
export async function ensureAccessCode(user: PortalUser): Promise<string> {
  if (user.accessCode) return user.accessCode;

  // Generate a unique 6-digit code not already in psyid:codes
  const allCodes = await kvGet<StoredCode[]>(CODES_KEY) ?? [];
  const used = new Set(allCodes.map(c => c.code));
  let code: string;
  do {
    code = String(Math.floor(100000 + Math.random() * 900000));
  } while (used.has(code));

  // Save to psyid:codes
  const fullCode = {
    id: newId(),
    code,
    status: 'UNUSED',
    user_name: user.name || user.email,
    invoice_ref: null,
    note: 'Auto-generated for portal registration',
    created_at: new Date().toISOString(),
    used_at: null,
    portalUserEmail: user.email,
  };
  allCodes.unshift(fullCode);
  await kvSet(CODES_KEY, allCodes);

  // Update portal user record
  const updated: PortalUser = { ...user, accessCode: code };
  await kvSet(userKey(user.email), updated);

  // Update psyid:portal-users list
  const portalUsers = await kvGet<StoredPortalUserRecord[]>('psyid:portal-users') ?? [];
  const idx = portalUsers.findIndex(u => u.email === user.email);
  if (idx >= 0) {
    portalUsers[idx] = { ...portalUsers[idx], accessCode: code };
  } else {
    portalUsers.push({
      email: user.email,
      name: user.name,
      userId: user.backendUserId ?? `portal_${user.email}`,
      accessCode: code,
      registeredAt: user.createdAt,
    });
  }
  await kvSet('psyid:portal-users', portalUsers);

  return code;
}
