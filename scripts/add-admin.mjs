// Register an additional admin into Redis (psyid:admins).
// Usage: node scripts/add-admin.mjs <email> <password> [name]
import fs from 'node:fs';
import path from 'node:path';
import Redis from 'ioredis';
import bcrypt from 'bcryptjs';

const [, , email, password, name] = process.argv;
if (!email || !password) {
  console.error('Usage: node scripts/add-admin.mjs <email> <password> [name]');
  process.exit(1);
}

// Load KV_REST_API_REDIS_URL from .env.local
const envPath = path.join(process.cwd(), '.env.local');
const env = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
    }),
);
const url = env.KV_REST_API_REDIS_URL ?? env.KV_REST_API_URL;
if (!url) { console.error('No KV_REST_API_REDIS_URL in .env.local'); process.exit(1); }

const redis = new Redis(url, { maxRetriesPerRequest: 3 });
const KEY = 'psyid:admins';

const raw = await redis.get(KEY);
const admins = raw ? JSON.parse(raw) : [];
const em = email.toLowerCase().trim();

if (admins.some(a => a.email.toLowerCase() === em)) {
  console.log(`Admin ${em} already exists — updating password.`);
}
const passwordHash = await bcrypt.hash(password, 10);
const rec = { email: em, name: name ?? '', passwordHash, createdAt: new Date().toISOString() };
const next = admins.filter(a => a.email.toLowerCase() !== em).concat(rec);

await redis.set(KEY, JSON.stringify(next));
console.log(`✓ Registered admin ${em}. Total admins: ${next.length}`);
await redis.quit();
