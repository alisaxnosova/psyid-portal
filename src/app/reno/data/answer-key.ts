import raw from './answer-key.json';
import { AXIS_BY_CODE, classify, type AxisCode, type Lang } from '@/data/reno-axes';

/** One interpretive cell: a pole+band and its bilingual descriptor. */
export interface AnswerKeyCell {
  code: string;          // e.g. "O4", or "—" for balanced
  band: number;          // 0..5 (display only)
  pole: string;          // pole letter, or "0" for balanced
  posMin: number | null; // continuous position range (0..100, 100 = plus pole)
  posMax: number | null;
  en: string;
  ru: string;
  framing: { en: string; ru: string };
}

export type AnswerKey = Record<AxisCode, AnswerKeyCell[]>;

export const answerKey = raw as AnswerKey;

/**
 * Select the interpretive cell for a continuous position, via the §6 band classifier
 * in reno-axes (the single source of truth). Selecting by pole+band code — rather than
 * by the cell's posMin/posMax range — guarantees this matches toCode() and the v12
 * scorer exactly, including at band edges. posMin/posMax on the cells are documentation.
 */
export function cellForPosition(axisCode: AxisCode, position: number): AnswerKeyCell | null {
  const { code } = classify(AXIS_BY_CODE[axisCode], position);
  const cells = answerKey[axisCode] ?? [];
  return cells.find(c => c.code === code) ?? cells.find(c => c.band === 0) ?? null;
}

export function cellDescriptor(c: AnswerKeyCell, lang: Lang): string {
  return lang === 'ru' ? c.ru || c.en : c.en;
}
