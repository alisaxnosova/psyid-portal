import Redis from 'ioredis';

const REDIS_URL = process.env.KV_REST_API_REDIS_URL ?? process.env.KV_REST_API_URL;

let client: Redis | null = null;

function getClient(): Redis | null {
  if (!REDIS_URL) return null;
  if (!client) {
    client = new Redis(REDIS_URL, { lazyConnect: true, maxRetriesPerRequest: 2 });
  }
  return client;
}

export function kvConfigured(): boolean {
  return !!REDIS_URL;
}

export async function kvGet<T>(key: string): Promise<T | null> {
  const redis = getClient();
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function kvSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const redis = getClient();
  if (!redis) return;
  try {
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, JSON.stringify(value));
    } else {
      await redis.set(key, JSON.stringify(value));
    }
  } catch {
    // silent — callers handle missing data gracefully
  }
}

export async function kvDel(key: string): Promise<void> {
  const redis = getClient();
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {
    // silent
  }
}

// Scan for all keys matching a glob pattern. More reliable than maintaining
// a manual index map (which can lose entries under concurrent writes).
export async function kvKeys(pattern: string): Promise<string[]> {
  const redis = getClient();
  if (!redis) return [];
  const keys: string[] = [];
  let cursor = '0';
  try {
    do {
      const [next, batch] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', '200');
      keys.push(...batch);
      cursor = next;
    } while (cursor !== '0');
  } catch {
    // silent
  }
  return keys;
}
