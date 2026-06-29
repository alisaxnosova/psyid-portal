/**
 * One-time translation script.
 * Run: npx tsx scripts/translate-profiles.ts
 *
 * For each axis level it sends all 10 Russian dim descriptions + the level label
 * to Claude in one call, getting back EN / ES / FR / AR translations.
 * Writes the fully-translated profiles.ts when done.
 */

import Anthropic from '@anthropic-ai/sdk';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { profiles } from '../src/app/reno/data/profiles';
import type { AxisProfiles, ProfileLevel, Lang } from '../src/app/reno/data/profiles';

const client = new Anthropic();

interface TranslatedLevel {
  label: Record<Lang, string>;
  dims: Record<Lang, string[]>;
}

async function translateLevel(
  axisName: string,
  level: ProfileLevel,
): Promise<TranslatedLevel> {
  const payload = {
    label: level.label.ru,
    dims: level.dims.ru,
  };

  const prompt = `You are a professional psychology assessment translator. Translate the following MBTI personality profile content from Russian to English, Spanish, French, and Arabic.

The content is for the ${axisName} axis, level "${payload.label}".

Return ONLY a JSON object with this exact shape (no markdown, no explanation):
{
  "label": { "en": "...", "es": "...", "fr": "...", "ar": "..." },
  "dims": {
    "en": ["dim1", "dim2", "dim3", "dim4", "dim5", "dim6", "dim7", "dim8", "dim9", "dim10"],
    "es": [...],
    "fr": [...],
    "ar": [...]
  }
}

Source JSON:
${JSON.stringify(payload, null, 2)}

Rules:
- Translate naturally — do not be overly literal
- Maintain the second-person or third-person perspective of the original
- Keep the same tone (descriptive, behavioral, neutral)
- Each dims array must have exactly ${payload.dims.length} elements
- The label should be a concise personality level name (e.g. "Maximum Extrovert")`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = (message.content[0] as { text: string }).text.trim();
  const parsed = JSON.parse(text) as {
    label: { en: string; es: string; fr: string; ar: string };
    dims: { en: string[]; es: string[]; fr: string[]; ar: string[] };
  };

  return {
    label: {
      ru: level.label.ru,
      en: parsed.label.en,
      es: parsed.label.es,
      fr: parsed.label.fr,
      ar: parsed.label.ar,
    },
    dims: {
      ru: level.dims.ru,
      en: parsed.dims.en,
      es: parsed.dims.es,
      fr: parsed.dims.fr,
      ar: parsed.dims.ar,
    },
  };
}

async function translateDimLabels(
  axis: AxisProfiles,
): Promise<Record<Lang, string[]>> {
  const prompt = `Translate these 10 MBTI ${axis.axis} axis dimension header labels from Russian to English, Spanish, French, and Arabic.

Return ONLY a JSON object:
{
  "en": ["label1", ..., "label10"],
  "es": [...],
  "fr": [...],
  "ar": [...]
}

Source (Russian):
${JSON.stringify(axis.dimLabels.ru, null, 2)}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = (message.content[0] as { text: string }).text.trim();
  const parsed = JSON.parse(text) as Record<string, string[]>;

  return {
    ru: axis.dimLabels.ru,
    en: parsed.en,
    es: parsed.es,
    fr: parsed.fr,
    ar: parsed.ar,
  };
}

function formatString(s: string): string {
  return JSON.stringify(s);
}

function formatStringArray(arr: string[], indent: number): string {
  const pad = ' '.repeat(indent);
  const inner = arr.map(s => `${pad}  ${formatString(s)}`).join(',\n');
  return `[\n${inner},\n${pad}]`;
}

function formatLangRecord(record: Record<Lang, string>, indent: number): string {
  const pad = ' '.repeat(indent);
  return `{ ru: ${formatString(record.ru)}, en: ${formatString(record.en)}, es: ${formatString(record.es)}, fr: ${formatString(record.fr)}, ar: ${formatString(record.ar)} }`;
}

function formatDims(dims: Record<Lang, string[]>, indent: number): string {
  const pad = ' '.repeat(indent);
  const langs: Lang[] = ['ru', 'en', 'es', 'fr', 'ar'];
  const entries = langs.map(l => {
    return `${pad}  ${l}: ${formatStringArray(dims[l] ?? [], indent + 4)}`;
  });
  return `{\n${entries.join(',\n')},\n${pad}}`;
}

function generateProfilesTs(translatedProfiles: AxisProfiles[]): string {
  const axisBlocks = translatedProfiles.map(axis => {
    const levelBlocks = axis.levels.map(level => {
      return `    {
      pole: '${level.pole}', min: ${level.min}, max: ${level.max},
      label: ${formatLangRecord(level.label, 6)},
      dims: ${formatDims(level.dims, 6)},
    }`;
    });

    const dimLabelBlock = `{
    ru: ${formatStringArray(axis.dimLabels.ru, 4)},
    en: ${formatStringArray(axis.dimLabels.en ?? [], 4)},
    es: ${formatStringArray(axis.dimLabels.es ?? [], 4)},
    fr: ${formatStringArray(axis.dimLabels.fr ?? [], 4)},
    ar: ${formatStringArray(axis.dimLabels.ar ?? [], 4)},
  }`;

    return `const ${axis.axis}: AxisProfiles = {
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

// ─────────────────────────────────────────────────────────────
// E / I  AXIS
// ─────────────────────────────────────────────────────────────
${axisBlocks[0]}

// ─────────────────────────────────────────────────────────────
// S / N  AXIS
// ─────────────────────────────────────────────────────────────
${axisBlocks[1]}

// ─────────────────────────────────────────────────────────────
// T / F  AXIS
// ─────────────────────────────────────────────────────────────
${axisBlocks[2]}

// ─────────────────────────────────────────────────────────────
// J / P  AXIS
// ─────────────────────────────────────────────────────────────
${axisBlocks[3]}

// ─────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────
export const profiles: AxisProfiles[] = [EI, SN, TF, JP];

export function getAxisProfiles(axis: 'EI' | 'SN' | 'TF' | 'JP'): AxisProfiles {
  return profiles.find(a => a.axis === axis)!;
}

/** Looks up a level from a score (0–100) and pole letter, or 'balanced' when score === 0. */
export function getLevelByScore(axis: AxisProfiles, score: number, pole: string): ProfileLevel {
  if (score === 0 || pole === 'balanced') {
    return axis.levels.find(l => l.pole === 'balanced')!;
  }
  return (
    axis.levels.find(l => l.pole === pole && score >= l.min && score <= l.max) ??
    axis.levels.find(l => l.pole === 'balanced')!
  );
}

/**
 * Derives a ProfileLevel from the pct map produced by renoScore.ts.
 * pct.E + pct.I === 100, etc.
 * The "score" fed into getLevelByScore is (dominantPct - 50) * 2, mapping 50%→0 and 100%→100.
 */
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

/** Converts a slider value (−100 … +100) to a ProfileLevel. */
export function getLevelFromSlider(axis: AxisProfiles, sliderValue: number): ProfileLevel {
  if (sliderValue === 0) return axis.levels.find(l => l.pole === 'balanced')!;
  const pole = sliderValue < 0 ? axis.leftPole : axis.rightPole;
  const score = Math.abs(sliderValue);
  return getLevelByScore(axis, score, pole);
}
`;
}

async function main() {
  const profilesPath = join(__dirname, '../src/app/reno/data/profiles.ts');
  const total = profiles.reduce((acc, ax) => acc + ax.levels.length + 1, 0); // +1 for dimLabels per axis
  let done = 0;

  console.log(`Starting translation: ${profiles.length} axes, ${profiles.reduce((a, ax) => a + ax.levels.length, 0)} levels total`);
  console.log('Each call translates 10 dim descriptions + 1 label into EN/ES/FR/AR');
  console.log('---');

  const translatedProfiles: AxisProfiles[] = [];

  for (const axis of profiles) {
    console.log(`\n▸ Axis ${axis.axis}: translating dim labels...`);
    const translatedDimLabels = await translateDimLabels(axis);
    done++;
    console.log(`  ✓ dim labels done (${done}/${total})`);

    const translatedLevels: ProfileLevel[] = [];
    for (const level of axis.levels) {
      console.log(`  translating ${level.label.ru}...`);
      const translated = await translateLevel(axis.axis, level);
      translatedLevels.push({
        ...level,
        label: translated.label,
        dims: translated.dims,
      });
      done++;
      console.log(`  ✓ ${translated.label.en} (${done}/${total})`);
    }

    translatedProfiles.push({
      ...axis,
      dimLabels: translatedDimLabels,
      levels: translatedLevels,
    });
  }

  const output = generateProfilesTs(translatedProfiles);
  writeFileSync(profilesPath, output, 'utf8');
  console.log(`\n✅ Done. Updated ${profilesPath}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
