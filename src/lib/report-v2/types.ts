// report-v2 — composed-report structure.
//
// The engine emits this neutral, presentation-free structure; renderers (HTML now,
// @react-pdf later) turn it into output. A ComposedReport is a pure function of
// (positions, contentVersion, tier, lang) — see compose.ts — which is what makes the
// same profile reproduce byte-for-byte across test takers.
import type { AxisCode } from '@/data/reno-axes';
import type { ReportLayer } from './content';

export type ReportTier = 'basic' | 'detailed' | 'full';
export type Lang = 'en' | 'ru';

/** 0..100 position per axis (100 = plus pole) — the sole numeric input to a report. */
export type Positions = Record<AxisCode, number>;

export interface ReportHolder {
  name?: string;
  passportNo?: string;
}

/** One composed block. `source` records provenance for auditability. */
export interface ReportBlock {
  id: string;                              // stable, e.g. 'axis:EO'
  layer: ReportLayer;
  heading: string;                         // localized
  body: string[];                          // localized paragraphs
  meta?: Record<string, string | number>;  // code, band, position, intensity, …
  source?: { key: string; band?: number; version: string };
}

export interface ReportSection {
  id: string;
  title: string;
  blocks: ReportBlock[];
}

export interface ComposedReport {
  tier: ReportTier;
  lang: Lang;
  contentVersion: string;
  word: string;               // archetype headline, e.g. 'Contemplative' — the report title
  archetype: string;          // 5-letter pole code, e.g. 'WAVFS'
  signature: string;          // 'W2 · A4 · V3 · F4 · S2'
  holder?: ReportHolder;
  sections: ReportSection[];
}
