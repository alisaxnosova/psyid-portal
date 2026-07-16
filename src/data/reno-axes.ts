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
  { band: 1, label: { en: 'Slight', ru: 'Лёгкий' }, intensityMin: 8, intensityMax: 20 },
  { band: 0, label: { en: 'Balanced', ru: 'Сбалансированный' }, intensityMin: 0, intensityMax: 7 },
];

/**
 * Strength/intensity → band, per methodology §6:
 *   0 balanced (s < 8) · 1 slight (≤20) · 2 noticeable (≤40) ·
 *   3 pronounced (≤60) · 4 strong (≤80) · 5 very strong (>80).
 * Single source of truth: scoring, toCode(), and the admin explorer all route band
 * computation through here, so they can never disagree at a boundary. Gap-free and
 * fraction-safe (an intensity of 7.5 or 20.5 lands in exactly one band).
 */
export function bandForIntensity(intensity: number): number {
  const i = Math.abs(intensity);
  if (i < 8) return 0;
  if (i <= 20) return 1;
  if (i <= 40) return 2;
  if (i <= 60) return 3;
  if (i <= 80) return 4;
  return 5;
}

export interface AxisClassification {
  position: number;   // 0..100 (100 = plus pole)
  intensity: number;  // |position−50|×2
  band: number;       // 0..5 (display only), from bandForIntensity
  poleLetter: string; // dominant pole letter, or '—' when balanced (band 0)
  code: string;       // e.g. "O4", or "—" when balanced
}

/** Continuous position → full §6 classification (position, intensity, band, pole, code). */
export function classify(axis: Axis, position: number): AxisClassification {
  const intensity = Math.abs(position - 50) * 2;
  const band = bandForIntensity(intensity);
  const poleLetter = band === 0 ? '—' : position >= 50 ? axis.plus.letter : axis.minus.letter;
  const code = band === 0 ? '—' : `${poleLetter}${band}`;
  return { position, intensity, band, poleLetter, code };
}

/** Continuous position (0–100, 100 = reference/plus pole) → pole letter + band digit, e.g. "O4". */
export function toCode(axis: Axis, position: number): string {
  return classify(axis, position).code;
}
