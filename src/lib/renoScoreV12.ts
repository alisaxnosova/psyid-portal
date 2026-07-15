// ReNo v1.2 — Likert scoring (Phase 5 cutover). Pure, server- and client-safe.
//
// Input: raw answers { questionId, answerId } where answerId is the Likert value
// "1".."5" (1 = strongly disagree … 5 = strongly agree). Reverse-keyed items are
// flipped so agreement always points toward the axis plus-pole.
//
// Pipeline per axis:  mean(agreement 0..1) → position 0..100 (100 = plus pole)
//                     → intensity |pos-50|*2 → band 0..5 → answer-key cell.
//
// The legacy 4-axis scorer (renoScore.ts) is intentionally left in place for the
// admin v1.0 archive; new sessions run through this module.
import { AXES, type Axis, type AxisCode } from '@/data/reno-axes';
import { answerKey, type AnswerKeyCell } from '@/app/reno/data/answer-key';
import questionsData from '@/app/reno/data/questions.json';
import type { RenoQuestion } from '@/data/reno-axes';

const QUESTIONS = questionsData as unknown as RenoQuestion[];

export interface AxisScoreV12 {
  code: AxisCode;
  position: number;   // 0..100 (100 = plus pole)
  intensity: number;  // 0..100 (distance from balanced, ×2)
  band: number;       // 0..5 (display only)
  poleLetter: string; // dominant pole letter, or '—' when balanced
  signature: string;  // e.g. "O4", or "—" when balanced
  cell: AnswerKeyCell | null;
  answered: number;
  total: number;
}

export interface RenoScoreV12 {
  axes: AxisScoreV12[];
  byCode: Record<AxisCode, AxisScoreV12>;
  type: string;      // 4-letter headline (excludes ER)
  signature: string; // full 5-axis signature, e.g. "W2 · A4 · V3 · F4 · S2"
}

export interface RawAnswerV12 {
  questionId: string;
  answerId: string;
}

function itemsFor(code: AxisCode): RenoQuestion[] {
  return QUESTIONS.filter(q => q.axis === code);
}

function cellFor(code: AxisCode, position: number): AnswerKeyCell | null {
  const cells = [...(answerKey[code] ?? [])].sort(
    (a, b) => (b.posMin ?? 0) - (a.posMin ?? 0),
  );
  return cells.find(c => position >= (c.posMin ?? 0)) ?? cells[cells.length - 1] ?? null;
}

function scoreAxis(axis: Axis, byId: Map<string, string>): AxisScoreV12 {
  const items = itemsFor(axis.code);
  let sum = 0;
  let n = 0;
  for (const q of items) {
    const raw = byId.get(q.id);
    if (raw == null) continue;
    const r = Number(raw);
    if (!Number.isFinite(r) || r < 1 || r > 5) continue;
    const v = q.reverse ? (5 - r) / 4 : (r - 1) / 4; // 0..1 toward plus pole
    sum += v;
    n += 1;
  }
  const position = n ? (sum / n) * 100 : 50;
  const intensity = Math.abs(position - 50) * 2;
  const cell = cellFor(axis.code, position);
  const balanced = !cell || cell.pole === '0';
  const poleLetter = balanced ? '—' : position >= 50 ? axis.plus.letter : axis.minus.letter;
  return {
    code: axis.code,
    position,
    intensity,
    band: cell?.band ?? 0,
    poleLetter,
    signature: cell?.code ?? '—',
    cell,
    answered: n,
    total: items.length,
  };
}

export function scoreSessionV12(answers: RawAnswerV12[]): RenoScoreV12 {
  const byId = new Map(answers.map(a => [a.questionId, a.answerId]));
  const axes = AXES.map(a => scoreAxis(a, byId));
  const byCode = Object.fromEntries(axes.map(s => [s.code, s])) as Record<AxisCode, AxisScoreV12>;

  const type = AXES.filter(a => !a.excludeFromType)
    .map(a => {
      const s = byCode[a.code];
      return s.position >= 50 ? a.plus.letter : a.minus.letter;
    })
    .join('');

  const signature = axes.map(s => s.signature).join(' · ');

  return { axes, byCode, type, signature };
}
