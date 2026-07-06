// Export the 94 assessment questions + answers (latest admin-edited version from
// Redis psyid:questions, fallback to the JSON seed) to an editable TSV, all 5 langs.
// Run: node scripts/export-questions.mjs
import fs from 'node:fs';
import path from 'node:path';
import Redis from 'ioredis';

const root = process.cwd();
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, '.env.local'), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const redis = new Redis(env.KV_REST_API_REDIS_URL ?? env.KV_REST_API_URL, { maxRetriesPerRequest: 3 });

const raw = await redis.get('psyid:questions');
let source = 'Redis (admin-edited)';
let questions;
if (raw) {
  questions = JSON.parse(raw);
} else {
  questions = JSON.parse(fs.readFileSync(path.join(root, 'src/app/reno/data/questions.json'), 'utf8'));
  source = 'questions.json (no admin edits saved)';
}
await redis.quit();

const LANGS = ['en', 'ru', 'es', 'fr', 'ar'];
const esc = (s) => String(s ?? '').replace(/\t/g, ' ').replace(/\r?\n/g, ' ').trim();
const rows = [['qid', 'axis', 'type', 'kind', 'optionId', 'key', 'score', ...LANGS].join('\t')];

for (const q of questions) {
  rows.push([q.id, q.axis ?? '', q.type ?? '', 'question', '', '', '', ...LANGS.map(l => esc(q.text?.[l]))].join('\t'));
  for (const o of q.options ?? []) {
    rows.push([q.id, q.axis ?? '', q.type ?? '', 'option', o.id ?? '', o.key ?? '', o.score ?? '', ...LANGS.map(l => esc(o.text?.[l]))].join('\t'));
  }
}

const out = path.join(root, 'content-export', 'questions.tsv');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, rows.join('\n') + '\n');
console.log(`✓ questions.tsv — ${questions.length} questions, ${rows.length - 1} rows`);
console.log(`  source: ${source}`);
