// Extract UI strings from the two bilingual dictionaries (adminLang.tsx, Landing.tsx)
// into importable TSV files (surface, key, en, ru). Run: node scripts/export-content.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'content-export');
fs.mkdirSync(outDir, { recursive: true });

const tsvEscape = (s) => String(s).replace(/\t/g, ' ').replace(/\r?\n/g, ' ').trim();
const unescape = (s) => s.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\\\/g, '\\');

function writeTsv(file, rows) {
  const header = 'surface\tkey\ten\tru';
  const body = rows.map(r => [r.surface, r.key, tsvEscape(r.en), tsvEscape(r.ru)].join('\t')).join('\n');
  fs.writeFileSync(path.join(outDir, file), header + '\n' + body + '\n');
  console.log(`✓ ${file} — ${rows.length} rows`);
}

// ── Admin: entries of the form  key: { en: '...', ru: '...' } ──
const adminSrc = fs.readFileSync(path.join(root, 'src/lib/adminLang.tsx'), 'utf8');
const adminRows = [];
const adminRe = /(\w+):\s*\{\s*en:\s*'((?:[^'\\]|\\.)*)'\s*,\s*ru:\s*'((?:[^'\\]|\\.)*)'\s*\}/g;
let m;
while ((m = adminRe.exec(adminSrc))) {
  adminRows.push({ surface: 'Admin', key: m[1], en: unescape(m[2]), ru: unescape(m[3]) });
}
writeTsv('admin.tsv', adminRows);

// ── Landing: T = { en: { key: '...' }, ru: { key: '...' } } ──
const landSrc = fs.readFileSync(path.join(root, 'src/components/landing/Landing.tsx'), 'utf8');
const tStart = landSrc.indexOf('const T = {');
const tBody = landSrc.slice(tStart, landSrc.indexOf('\n};', tStart));
const ruIdx = tBody.indexOf('ru: {');
const enBlock = tBody.slice(0, ruIdx);
const ruBlock = tBody.slice(ruIdx);
const kvRe = /(\w+):\s*'((?:[^'\\]|\\.)*)'/g;
const grab = (block) => {
  const map = {};
  let mm;
  while ((mm = kvRe.exec(block))) map[mm[1]] = unescape(mm[2]);
  return map;
};
const en = grab(enBlock);
const ru = grab(ruBlock);
const landRows = Object.keys(en).map(k => ({ surface: 'Landing', key: k, en: en[k], ru: ru[k] ?? '' }));
writeTsv('landing.tsv', landRows);

console.log('\nDone. Files in content-export/. Missing RU on landing:',
  landRows.filter(r => !r.ru).map(r => r.key).join(', ') || 'none');
