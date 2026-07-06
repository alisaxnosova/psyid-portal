// Sync loop: read the edited TSVs in content-export/ and regenerate the
// content catalogs the site reads from (src/content/*.json).
// Run: node scripts/sync-content.mjs   (then build + deploy)
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const inDir = path.join(root, 'content-export');
const outDir = path.join(root, 'src/content');
fs.mkdirSync(outDir, { recursive: true });

function readTsv(file) {
  const p = path.join(inDir, file);
  if (!fs.existsSync(p)) return null;
  const lines = fs.readFileSync(p, 'utf8').split(/\r?\n/).filter(l => l.trim() !== '');
  const header = lines[0].split('\t');
  return lines.slice(1).map(line => {
    const cols = line.split('\t');
    const row = {};
    header.forEach((h, i) => { row[h] = cols[i] ?? ''; });
    return row;
  });
}

function writeJson(name, obj) {
  fs.writeFileSync(path.join(outDir, name), JSON.stringify(obj, null, 2) + '\n');
  console.log(`✓ src/content/${name} — ${Object.keys(obj).length} keys`);
}

// ── Answer-key descriptions → { key: { en, ru, es, fr, ar } } ──
const desc = readTsv('answer-key-descriptions.tsv');
if (desc) {
  const cat = {};
  for (const r of desc) {
    cat[r.key] = { en: r.en, ru: r.ru, es: r.es, fr: r.fr, ar: r.ar };
  }
  writeJson('descriptions.json', cat);
}

// ── UI surfaces → { key: { en, ru } } (fallback catalogs) ──
for (const [file, name] of [['landing.tsv', 'landing.json'], ['admin.tsv', 'admin.json'], ['portal.tsv', 'portal.json']]) {
  const rows = readTsv(file);
  if (!rows) continue;
  const cat = {};
  for (const r of rows) cat[r.key] = { en: r.en, ru: r.ru };
  writeJson(name, cat);
}

console.log('\nDone. Rebuild + deploy to publish.');
