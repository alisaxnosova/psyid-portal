// report-v2 — the content library.
//
// A report is a deterministic composition of pre-authored, versioned ContentCells
// selected by a person's measured bands. This file defines the atomic unit and the
// L1 (per-axis band) source, which is already authored: the interpretive answer key
// (`answer-key.json`, 55 cells). Later layers (overview, shadow, applications…) add
// their own sources behind this same shape without changing the engine.
import { answerKey, type AnswerKeyCell } from '@/app/reno/data/answer-key';
import type { AxisCode, Bilingual } from '@/data/reno-axes';

export type ReportLayer =
  | 'identity'
  | 'overview'
  | 'axis'
  | 'interaction'
  | 'shadow'
  | 'growth'
  | 'application'
  | 'thematic'
  | 'action';

export type Product = 'adult' | 'youth';

/**
 * The atomic, versioned unit of report content. Every rendered sentence traces back
 * to exactly one of these, so a report is fully auditable and — given the same
 * profile + content version — fully reproducible.
 */
export interface ContentCell {
  layer: ReportLayer;
  key: string;          // axis code, type code, combo key, …
  pole?: string;        // pole letter, or '0' for the balanced centre
  band?: number;        // 0..5 when band-scoped
  product?: Product;    // adult|youth when age-scoped; omit = both
  version: string;      // content version that authored this cell
  text: Bilingual;
  framing?: Bilingual;  // author guidance / display note (not user prose)
}

/** Version tag for the L1 answer-key cells (bump on any edit to answer-key.json). */
export const L1_VERSION = 'answer-key@1.2';

function fromAnswerKey(code: AxisCode, c: AnswerKeyCell): ContentCell {
  return {
    layer: 'axis',
    key: code,
    pole: c.pole,
    band: c.band,
    version: L1_VERSION,
    text: { en: c.en, ru: c.ru },
    framing: c.framing,
  };
}

/**
 * L1: the per-axis band cell for a given pole+band code (e.g. "W2", or "—" for the
 * balanced centre). Returns null only if the answer key is missing that cell — the
 * caller decides how to degrade.
 */
export function axisCell(code: AxisCode, cellCode: string): ContentCell | null {
  const c = (answerKey[code] ?? []).find(x => x.code === cellCode);
  return c ? fromAnswerKey(code, c) : null;
}
