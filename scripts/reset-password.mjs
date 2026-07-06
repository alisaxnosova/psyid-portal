// Reset a portal user's password. Usage: node scripts/reset-password.mjs <email> [newPassword]
import fs from 'node:fs';
import path from 'node:path';
import Redis from 'ioredis';
import bcrypt from 'bcryptjs';

const [, , emailArg, pwArg] = process.argv;
if (!emailArg) { console.error('Usage: node scripts/reset-password.mjs <email> [newPassword]'); process.exit(1); }
const email = emailArg.toLowerCase().trim();

const env = Object.fromEntries(
  fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const url = env.KV_REST_API_REDIS_URL ?? env.KV_REST_API_URL;
const redis = new Redis(url, { maxRetriesPerRequest: 3 });

const key = `psyid:portal-user:${email}`;
const raw = await redis.get(key);
if (!raw) {
  console.log(`NOT FOUND: no portal user for ${email}`);
  await redis.quit();
  process.exit(0);
}
const user = JSON.parse(raw);
console.log(`Found: ${user.name || '(no name)'} · created ${user.createdAt} · accessCode ${user.accessCode ?? '—'}`);

if (pwArg) {
  user.passwordHash = await bcrypt.hash(pwArg, 10);
  await redis.set(key, JSON.stringify(user));
  console.log(`✓ Password reset for ${email} → "${pwArg}"`);
} else {
  console.log('(no new password given — read only, nothing changed)');
}
await redis.quit();
