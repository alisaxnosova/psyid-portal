// Export the answer-key descriptions (profiles.ts) to an editable TSV.
// One row per band label / dimension name / dimension description, all 5 languages.
// Run: npx tsx scripts/export-descriptions.ts
import fs from 'node:fs';
import path from 'node:path';
import { profiles } from '../src/app/reno/data/profiles';

const LANGS = ['en', 'ru', 'es', 'fr', 'ar'] as const;
const esc = (s: unknown) => String(s ?? '').replace(/\t/g, ' ').replace(/\r?\n/g, ' ').trim();

const rows: string[] = [];
rows.push(['axis', 'band', 'kind', 'key', ...LANGS].join('\t'));

for (const axis of profiles) {
  // Dimension names (shared across bands of this axis)
  axis.dimLabels.en.forEach((_, i) => {
    rows.push([
      axis.axis, '', 'dimension-name', `${axis.axis}.dimName.${i}`,
      ...LANGS.map(l => esc(axis.dimLabels[l][i])),
    ].join('\t'));
  });
  for (const lvl of axis.levels) {
    const band = `${lvl.pole}_${lvl.min}-${lvl.max}`;
    rows.push([
      axis.axis, band, 'band-label', `${axis.axis}.${band}.label`,
      ...LANGS.map(l => esc(lvl.label[l])),
    ].join('\t'));
    lvl.dims.en.forEach((_, i) => {
      rows.push([
        axis.axis, band, 'description', `${axis.axis}.${band}.dim.${i}`,
        ...LANGS.map(l => esc(lvl.dims[l]?.[i])),
      ].join('\t'));
    });
  }
}

const out = path.join(process.cwd(), 'content-export', 'answer-key-descriptions.tsv');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, rows.join('\n') + '\n');
console.log(`✓ answer-key-descriptions.tsv — ${rows.length - 1} rows`);
