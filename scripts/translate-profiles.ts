/**
 * One-time translation script — resumes from checkpoint if interrupted.
 * Run: npx tsx scripts/translate-profiles.ts
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { profiles } from '../src/app/reno/data/profiles';
import type { AxisProfiles, ProfileLevel, Lang } from '../src/app/reno/data/profiles';

const client = new Anthropic();
const CHECKPOINT_PATH = join(__dirname, '.translate-checkpoint.json');
const PROFILES_PATH   = join(__dirname, '../src/app/reno/data/profiles.ts');

function stripFences(text: string): string {
  return text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/m, '').trim();
}

async function callClaude(prompt: string, maxRetries = 3): Promise<string> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const msg = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      });
      return (msg.content[0] as { text: string }).text;
    } catch (e) {
      if (attempt === maxRetries) throw e;
      console.log(`  ↺ retry ${attempt}/${maxRetries}...`);
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
  throw new Error('unreachable');
}

interface Checkpoint {
  // axis → 'done' (for dimLabels) or level index → translated data
  [axisKey: string]: unknown;
}

function loadCheckpoint(): Checkpoint {
  if (existsSync(CHECKPOINT_PATH)) {
    return JSON.parse(readFileSync(CHECKPOINT_PATH, 'utf8')) as Checkpoint;
  }
  return {};
}

function saveCheckpoint(cp: Checkpoint) {
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(cp, null, 2), 'utf8');
}

// ── Translation helpers ───────────────────────────────────────────────────────

async function translateDimLabels(axis: AxisProfiles): Promise<Record<Lang, string[]>> {
  const prompt = `Translate these 10 MBTI ${axis.axis} axis dimension header labels from Russian to English, Spanish, French, and Arabic.

Return ONLY valid JSON (no markdown, no explanation):
{
  "en": ["label1", ..., "label10"],
  "es": [...],
  "fr": [...],
  "ar": [...]
}

Source (Russian):
${JSON.stringify(axis.dimLabels.ru, null, 2)}`;

  const raw = await callClaude(prompt);
  const parsed = JSON.parse(stripFences(raw)) as Record<string, string[]>;
  return { ru: axis.dimLabels.ru, en: parsed.en, es: parsed.es, fr: parsed.fr, ar: parsed.ar };
}

async function translateLevel(axisName: string, level: ProfileLevel): Promise<{
  label: Record<Lang, string>;
  dims: Record<Lang, string[]>;
}> {
  const prompt = `Translate the following MBTI personality profile content from Russian to English, Spanish, French, and Arabic.

This is for the ${axisName} axis, level "${level.label.ru}".

Return ONLY valid JSON (no markdown fences, no explanation):
{
  "label": { "en": "...", "es": "...", "fr": "...", "ar": "..." },
  "dims": {
    "en": ["dim1","dim2","dim3","dim4","dim5","dim6","dim7","dim8","dim9","dim10"],
    "es": ["...","...","...","...","...","...","...","...","...","..."],
    "fr": ["...","...","...","...","...","...","...","...","...","..."],
    "ar": ["...","...","...","...","...","...","...","...","...","..."]
  }
}

Source:
${JSON.stringify({ label: level.label.ru, dims: level.dims.ru }, null, 2)}

Rules:
- Translate naturally, not word-for-word
- Keep behavioral, descriptive, neutral tone
- Each dims array must have exactly ${level.dims.ru.length} strings
- The label is a concise personality level name`;

  const raw = await callClaude(prompt);
  const parsed = JSON.parse(stripFences(raw)) as {
    label: { en: string; es: string; fr: string; ar: string };
    dims: { en: string[]; es: string[]; fr: string[]; ar: string[] };
  };
  return {
    label: { ru: level.label.ru, en: parsed.label.en, es: parsed.label.es, fr: parsed.label.fr, ar: parsed.label.ar },
    dims:  { ru: level.dims.ru,  en: parsed.dims.en,  es: parsed.dims.es,  fr: parsed.dims.fr,  ar: parsed.dims.ar  },
  };
}

// ── File generation ───────────────────────────────────────────────────────────

function q(s: string)  { return JSON.stringify(s); }
function arr(a: string[], indent: number) {
  const pad = ' '.repeat(indent);
  return `[\n${a.map(s => `${pad}  ${q(s)}`).join(',\n')},\n${pad}]`;
}
function langRecord5(r: Record<Lang, string>) {
  return `{ ru: ${q(r.ru)}, en: ${q(r.en)}, es: ${q(r.es)}, fr: ${q(r.fr)}, ar: ${q(r.ar)} }`;
}
function dimsBlock(d: Record<Lang, string[]>, indent: number) {
  const pad = ' '.repeat(indent);
  const langs: Lang[] = ['ru','en','es','fr','ar'];
  return `{\n${langs.map(l => `${pad}  ${l}: ${arr(d[l] ?? [], indent + 4)}`).join(',\n')},\n${pad}}`;
}

function generateFile(translatedProfiles: AxisProfiles[]): string {
  const axisNames = ['E / I', 'S / N', 'T / F', 'J / P'];
  const axisBlocks = translatedProfiles.map((axis, ai) => {
    const levelBlocks = axis.levels.map(level => `    {
      pole: '${level.pole}', min: ${level.min}, max: ${level.max},
      label: ${langRecord5(level.label)},
      dims: ${dimsBlock(level.dims, 6)},
    }`);

    const dl = axis.dimLabels;
    const dimLabelBlock = `{
    ru: ${arr(dl.ru, 4)},
    en: ${arr(dl.en ?? [], 4)},
    es: ${arr(dl.es ?? [], 4)},
    fr: ${arr(dl.fr ?? [], 4)},
    ar: ${arr(dl.ar ?? [], 4)},
  }`;

    return `// ${'─'.repeat(60)}
// ${axisNames[ai]}  AXIS
// ${'─'.repeat(60)}
const ${axis.axis}: AxisProfiles = {
  axis: '${axis.axis}',
  leftPole: '${axis.leftPole}',
  rightPole: '${axis.rightPole}',
  dimLabels: ${dimLabelBlock},
  levels: [
${levelBlocks.join(',\n')}
  ],
};`;
  });

  return `export type Lang = 'ru' | 'en' | 'es' | 'fr' | 'ar';

export interface ProfileLevel {
  pole: string;
  label: Record<Lang, string>;
  min: number;
  max: number;
  dims: Record<Lang, string[]>;
}

export interface AxisProfiles {
  axis: 'EI' | 'SN' | 'TF' | 'JP';
  leftPole: string;
  rightPole: string;
  dimLabels: Record<Lang, string[]>;
  levels: ProfileLevel[];
}

${axisBlocks.join('\n\n')}

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────
export const profiles: AxisProfiles[] = [EI, SN, TF, JP];

export function getAxisProfiles(axis: 'EI' | 'SN' | 'TF' | 'JP'): AxisProfiles {
  return profiles.find(a => a.axis === axis)!;
}

export function getLevelByScore(axis: AxisProfiles, score: number, pole: string): ProfileLevel {
  if (score === 0 || pole === 'balanced') {
    return axis.levels.find(l => l.pole === 'balanced')!;
  }
  return (
    axis.levels.find(l => l.pole === pole && score >= l.min && score <= l.max) ??
    axis.levels.find(l => l.pole === 'balanced')!
  );
}

export function getLevelFromPct(
  axis: AxisProfiles,
  pct: Record<string, number>,
): ProfileLevel {
  const lPct = pct[axis.leftPole] ?? 50;
  const rPct = pct[axis.rightPole] ?? 50;
  if (Math.round(lPct) === Math.round(rPct)) {
    return axis.levels.find(l => l.pole === 'balanced')!;
  }
  const dominant = lPct > rPct ? axis.leftPole : axis.rightPole;
  const dominantPct = Math.max(lPct, rPct);
  const score = Math.round((dominantPct - 50) * 2);
  return getLevelByScore(axis, score, dominant);
}

export function getLevelFromSlider(axis: AxisProfiles, sliderValue: number): ProfileLevel {
  if (sliderValue === 0) return axis.levels.find(l => l.pole === 'balanced')!;
  const pole = sliderValue < 0 ? axis.leftPole : axis.rightPole;
  const score = Math.abs(sliderValue);
  return getLevelByScore(axis, score, pole);
}
`;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const cp = loadCheckpoint();
  const total = profiles.reduce((a, ax) => a + ax.levels.length, 0) + profiles.length; // levels + dimLabels
  let done = Object.keys(cp).reduce((a, k) => {
    const v = cp[k];
    if (v === 'done') return a + 1; // dimLabels key
    return a + Object.keys(v as object).length;
  }, 0);

  console.log(`Starting translation — 4 axes, ${total} API calls total`);
  console.log(`Checkpoint: ${done} already done, ${total - done} remaining\n${'─'.repeat(50)}`);

  const translatedProfiles: AxisProfiles[] = [];

  for (const axis of profiles) {
    const dimKey = `${axis.axis}:dimLabels`;
    let dimLabels: Record<Lang, string[]>;

    if (cp[dimKey] === 'done' && cp[`${axis.axis}:dimLabels:data`]) {
      dimLabels = cp[`${axis.axis}:dimLabels:data`] as Record<Lang, string[]>;
      console.log(`▸ ${axis.axis} dim labels — skipped (cached)`);
    } else {
      process.stdout.write(`▸ ${axis.axis} dim labels... `);
      dimLabels = await translateDimLabels(axis);
      cp[dimKey] = 'done';
      cp[`${axis.axis}:dimLabels:data`] = dimLabels;
      saveCheckpoint(cp);
      done++;
      console.log(`✓ (${done}/${total})`);
    }

    const translatedLevels: ProfileLevel[] = [];

    for (let i = 0; i < axis.levels.length; i++) {
      const level = axis.levels[i];
      const levelKey = `${axis.axis}:level:${i}`;

      if (cp[levelKey]) {
        const cached = cp[levelKey] as { label: Record<Lang, string>; dims: Record<Lang, string[]> };
        translatedLevels.push({ ...level, label: cached.label, dims: cached.dims });
        console.log(`  ${axis.axis}[${i}] ${level.label.ru} — skipped (cached)`);
      } else {
        process.stdout.write(`  ${axis.axis}[${i}] ${level.label.ru}... `);
        const translated = await translateLevel(axis.axis, level);
        cp[levelKey] = translated;
        saveCheckpoint(cp);
        done++;
        translatedLevels.push({ ...level, label: translated.label, dims: translated.dims });
        console.log(`✓ ${translated.label.en} (${done}/${total})`);
      }
    }

    translatedProfiles.push({ ...axis, dimLabels, levels: translatedLevels });
  }

  writeFileSync(PROFILES_PATH, generateFile(translatedProfiles), 'utf8');
  console.log(`\n✅ Done! profiles.ts updated with all 5 languages.`);
  console.log(`   You can delete the checkpoint: ${CHECKPOINT_PATH}`);
}

main().catch(e => { console.error('\n✗', e.message); process.exit(1); });
