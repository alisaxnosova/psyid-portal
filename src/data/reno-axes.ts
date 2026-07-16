// ReNo v1.2 — the five axes. Single source of truth for admin + scoring + display.
// Codes/poles/colours match the Element Vault and the Interpretive Answer Key v1.2.

export type Lang = 'en' | 'ru';
export type AxisCode = 'EO' | 'IF' | 'DB' | 'SP' | 'ER';
export type Bilingual = { en: string; ru: string };

export interface AxisPole {
  /** Single-letter code used in the signature, e.g. O / W. */
  letter: string;
  label: Bilingual;
}

export interface Axis {
  code: AxisCode;
  /** 1..5, drives --ax1..5 hue order. */
  index: number;
  name: Bilingual;
  /** Reference pole = position 100. */
  plus: AxisPole;
  /** Opposite pole = position 0. */
  minus: AxisPole;
  color: string;
  /** ER never appears in the 4-letter headline type — only in the full signature. */
  excludeFromType?: boolean;
}

export const AXES: Axis[] = [
  { code: 'EO', index: 1, name: { en: 'Energy Orientation', ru: 'Направленность энергии' },
    plus: { letter: 'O', label: { en: 'Outward', ru: 'Вовне' } },
    minus: { letter: 'W', label: { en: 'Inward', ru: 'Внутрь' } }, color: '#2244E0' },
  { code: 'IF', index: 2, name: { en: 'Information Focus', ru: 'Фокус восприятия' },
    plus: { letter: 'C', label: { en: 'Concrete', ru: 'Конкретика' } },
    minus: { letter: 'A', label: { en: 'Abstract', ru: 'Абстракция' } }, color: '#6A85F0' },
  { code: 'DB', index: 3, name: { en: 'Decision Basis', ru: 'Основа решений' },
    plus: { letter: 'L', label: { en: 'Logic', ru: 'Логика' } },
    minus: { letter: 'V', label: { en: 'Values', ru: 'Ценности' } }, color: '#8A5CD6' },
  { code: 'SP', index: 4, name: { en: 'Structure Preference', ru: 'Организация жизни' },
    plus: { letter: 'D', label: { en: 'Ordered', ru: 'Упорядоченность' } },
    minus: { letter: 'F', label: { en: 'Flexible', ru: 'Гибкость' } }, color: '#FF7A3D' },
  { code: 'ER', index: 5, name: { en: 'Emotional Response', ru: 'Эмоциональный отклик' },
    plus: { letter: 'S', label: { en: 'Steady', ru: 'Устойчивость' } },
    minus: { letter: 'R', label: { en: 'Reactive', ru: 'Реактивность' } }, color: '#FF5A5A',
    excludeFromType: true },
];

/** A ReNo v1.2 question: one normative Likert statement mapped to an axis + pole. */
export interface RenoQuestion {
  id: string;
  axis: AxisCode;
  /** Which pole agreement points toward (before `reverse`). */
  pole: string;
  reverse: boolean;
  text: Bilingual;
}

export const AXIS_BY_CODE: Record<AxisCode, Axis> = Object.fromEntries(
  AXES.map((a) => [a.code, a]),
) as Record<AxisCode, Axis>;

export const AXIS_COLORS: Record<AxisCode, string> = Object.fromEntries(
  AXES.map((a) => [a.code, a.color]),
) as Record<AxisCode, string>;

/** 0–5 band scale. `band` is display only; `intensityMin/Max` = |position−50|×2. */
export interface Band {
  band: number;
  label: Bilingual;
  intensityMin: number;
  intensityMax: number;
}

export const BANDS: Band[] = [
  { band: 5, label: { en: 'Maximal', ru: 'Максимальный' }, intensityMin: 81, intensityMax: 100 },
  { band: 4, label: { en: 'Strong', ru: 'Сильный' }, intensityMin: 61, intensityMax: 80 },
  { band: 3, label: { en: 'Pronounced', ru: 'Выраженный' }, intensityMin: 41, intensityMax: 60 },
  { band: 2, label: { en: 'Moderate', ru: 'Умеренный' }, intensityMin: 21, intensityMax: 40 },
  { band: 1, label: { en: 'Slight', ru: 'Лёгкий' }, intensityMin: 6, intensityMax: 20 },
  { band: 0, label: { en: 'Balanced', ru: 'Сбалансированный' }, intensityMin: 0, intensityMax: 5 },
];

/** Continuous position (0–100, 100 = reference/plus pole) → pole letter + band digit, e.g. "O4". */
export function toCode(axis: Axis, position: number): string {
  const intensity = Math.abs(position - 50) * 2;
  const band = BANDS.find((b) => intensity >= b.intensityMin && intensity <= b.intensityMax)?.band ?? 0;
  if (band === 0) return '—';
  const pole = position >= 50 ? axis.plus.letter : axis.minus.letter;
  return `${pole}${band}`;
}
