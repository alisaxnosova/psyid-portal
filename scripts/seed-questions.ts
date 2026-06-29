/**
 * Seeds the questions into Redis key `psyid:questions`.
 * Run: npx tsx scripts/seed-questions.ts
 */

import Redis from 'ioredis';
import { readFileSync } from 'fs';
import { join } from 'path';

const redisUrl = process.env.KV_REST_API_REDIS_URL;
if (!redisUrl) {
  console.error('KV_REST_API_REDIS_URL is not set');
  process.exit(1);
}

const redis = new Redis(redisUrl);

async function main() {
  const questionsPath = join(__dirname, '../src/app/reno/data/questions.json');
  const questions = JSON.parse(readFileSync(questionsPath, 'utf8'));
  const json = JSON.stringify(questions);
  const kb = (Buffer.byteLength(json, 'utf8') / 1024).toFixed(1);
  console.log(`Seeding ${questions.length} questions (~${kb} KB) to Redis key psyid:questions...`);
  await redis.set('psyid:questions', json);
  console.log('✅ Done.');
  await redis.quit();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
