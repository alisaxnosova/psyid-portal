// report-v2 — the deterministic composition engine.
//
// composeReport() is a pure function: same (positions, contentVersion, tier, lang)
// → same ComposedReport. No LLM, no randomness, no clock. Personalization is the
// *selection* of authored cells by measured band, never generation. Tiers include
// progressively more layers (§8.4: depth scales with measurement); Phase 1 ships the
// Basic tier (L0 identity + L1 per-axis cells) from the existing answer key.
import { AXES, BANDS, classify, type AxisCode, type Bilingual } from '@/data/reno-axes';
import { axisCell } from './content';
import { archetypeFor } from './archetypes';
import type {
  ComposedReport,
  Lang,
  Positions,
  ReportBlock,
  ReportHolder,
  ReportSection,
  ReportTier,
} from './types';

/** Bump when any Phase-1 layer's structure or selection logic changes. */
export const CONTENT_VERSION = 'report-v2@0.1';

const tx = (b: Bilingual, lang: Lang) => (lang === 'ru' ? b.ru || b.en : b.en);
const bandLabel = (band: number, lang: Lang): string => {
  const b = BANDS.find(x => x.band === band);
  return b ? tx(b.label, lang) : '';
};

/** Which top-level sections each tier renders. Detailed/Full expand in later phases. */
const TIER_SECTIONS: Record<ReportTier, ReadonlyArray<'identity' | 'axes'>> = {
  basic: ['identity', 'axes'],
  detailed: ['identity', 'axes'],
  full: ['identity', 'axes'],
};

export interface ComposeInput {
  positions: Positions;
  tier: ReportTier;
  lang: Lang;
  holder?: ReportHolder;
}

interface AxisView {
  code: AxisCode;
  name: string;
  signature: string;   // 'W2', or '—'
  band: number;
  bandLabel: string;
  poleLabel: string;   // 'Inward', or 'Balanced'
  position: number;
  intensity: number;
}

function axisView(code: AxisCode, positions: Positions, lang: Lang): AxisView {
  const axis = AXES.find(a => a.code === code)!;
  const c = classify(axis, positions[code]);
  const poleLabel =
    c.band === 0
      ? bandLabel(0, lang)
      : tx(c.position >= 50 ? axis.plus.label : axis.minus.label, lang);
  return {
    code,
    name: tx(axis.name, lang),
    signature: c.code,
    band: c.band,
    bandLabel: bandLabel(c.band, lang),
    poleLabel,
    position: Math.round(c.position),
    intensity: Math.round(c.intensity),
  };
}

function signatureOf(positions: Positions): string {
  return AXES.map(a => classify(a, positions[a.code]).code).join(' · ');
}

function identitySection(
  positions: Positions,
  lang: Lang,
  holder?: ReportHolder,
): ReportSection {
  const arch = archetypeFor(positions);
  const views = AXES.map(a => axisView(a.code, positions, lang));
  const meta: Record<string, string | number> = {
    word: tx(arch.word, lang),
    archetype: arch.code,
    signature: views.map(v => v.signature).join(' · '),
  };
  for (const v of views) {
    meta[`${v.code}:code`] = v.signature;
    meta[`${v.code}:position`] = v.position; // feeds the pentagon
  }
  return {
    id: 'identity',
    title: holder?.name ?? '',
    blocks: [
      {
        // The archetype word is the report title, rendered as the brand mark "Word."
        // (with the trailing period). The clean word stays on `meta.word`/report.word.
        id: 'identity',
        layer: 'identity',
        heading: `${tx(arch.word, lang)}.`,
        body: [tx(arch.definition, lang)],
        meta,
      },
    ],
  };
}

function axesSection(positions: Positions, lang: Lang): ReportSection {
  const blocks: ReportBlock[] = AXES.map(axis => {
    const v = axisView(axis.code, positions, lang);
    const cell = axisCell(axis.code, v.signature);
    const heading =
      v.band === 0
        ? `${v.name} — ${v.poleLabel}`
        : `${v.name} — ${v.poleLabel} · ${v.bandLabel}`;
    return {
      id: `axis:${axis.code}`,
      layer: 'axis',
      heading,
      body: cell ? [tx(cell.text, lang)] : [],
      meta: {
        code: v.signature,
        band: v.band,
        position: v.position,
        intensity: v.intensity,
      },
      source: cell ? { key: axis.code, band: v.band, version: cell.version } : undefined,
    };
  });
  return {
    id: 'axes',
    title: lang === 'ru' ? 'Пять осей' : 'The five axes',
    blocks,
  };
}

export function composeReport({ positions, tier, lang, holder }: ComposeInput): ComposedReport {
  const builders = {
    identity: () => identitySection(positions, lang, holder),
    axes: () => axesSection(positions, lang),
  } as const;

  const sections = TIER_SECTIONS[tier].map(id => builders[id]());
  const arch = archetypeFor(positions);

  return {
    tier,
    lang,
    contentVersion: CONTENT_VERSION,
    word: tx(arch.word, lang),
    archetype: arch.code,
    signature: signatureOf(positions),
    holder,
    sections,
  };
}
