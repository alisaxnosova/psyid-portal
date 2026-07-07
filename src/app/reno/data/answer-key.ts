import raw from './answer-key.json';
import type { AxisCode, Lang } from '@/data/reno-axes';

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

export function cellDescriptor(c: AnswerKeyCell, lang: Lang): string {
  return lang === 'ru' ? c.ru || c.en : c.en;
}
