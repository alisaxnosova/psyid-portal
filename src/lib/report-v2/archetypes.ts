// report-v2 — the 32 archetype words (L2 headline layer).
//
// Every profile resolves to one word: the dominant pole of each of the five axes
// (Energy O/W · Info C/A · Decision L/V · Structure D/F · Emotion S/R) forms a
// 5-letter code, and each of the 2^5 = 32 codes is one archetype word + definition.
// The word is the report's title and the product's marketing hook ("Word.").
//
// The product is English-only.
import type { AxisCode, Bilingual } from '@/data/reno-axes';
import type { Positions } from './types';

export interface Archetype {
  code: string;            // 5-letter pole code, e.g. 'WAVFS'
  n: number;               // 1..32, catalogue index
  word: Bilingual;
  definition: Bilingual;
}

const A = (
  n: number,
  code: string,
  wordEn: string,
  defEn: string,
): Archetype => ({ n, code, word: { en: wordEn }, definition: { en: defEn } });

export const ARCHETYPES: Record<string, Archetype> = Object.fromEntries(
  [
    A(1, 'OCLDS', 'Commanding', 'decides on the facts, then builds the structure to make it land.'),
    A(2, 'OCLDR', 'Relentless', 'the same will to close and control — with urgency behind it.'),
    A(3, 'OCLFS', 'Pragmatic', "fixes what's in front of them, unhurried, no plan required."),
    A(4, 'OCLFR', 'Kinetic', 'quick, hot, alive on the live problem.'),
    A(5, 'OCVDS', 'Dependable', 'holds the people and the logistics together, without being asked.'),
    A(6, 'OCVDR', 'Protective', 'organizes around people and feels every stake.'),
    A(7, 'OCVFS', 'Unbothered', 'present, warm, and unhurried by the room.'),
    A(8, 'OCVFR', 'Spirited', 'lively and immediate; feeling right on the surface.'),
    A(9, 'OALDS', 'Strategic', 'turns pattern into plan, then moves people through it.'),
    A(10, 'OALDR', 'Ambitious', 'the same vision-to-plan drive, powered by urgency.'),
    A(11, 'OALFS', 'Inventive', 'thinks out loud, tests everything, keeps the options open.'),
    A(12, 'OALFR', 'Electric', 'idea-play at speed; sparks and provokes.'),
    A(13, 'OAVDS', 'Inspiring', 'carries a vision for people and organizes them toward it.'),
    A(14, 'OAVDR', 'Fervent', 'a vision for people, carried with visible conviction.'),
    A(15, 'OAVFS', 'Buoyant', 'possibility and warmth, easy in the current.'),
    A(16, 'OAVFR', 'Exuberant', 'radiates possibility; momentum straight from feeling.'),
    A(17, 'WCLDS', 'Meticulous', 'the detail right, and the system to keep it right.'),
    A(18, 'WCLDR', 'Exacting', 'precision with real stakes; errors land hard.'),
    A(19, 'WCLFS', 'Studious', 'takes it apart alone, until it makes sense.'),
    A(20, 'WCLFR', 'Probing', 'digs at the problem in private, with intensity.'),
    A(21, 'WCVDS', 'Steadfast', 'steady care, given quietly, no credit needed.'),
    A(22, 'WCVDR', 'Tender', 'quiet, dutiful care that feels every bit of it.'),
    A(23, 'WCVFS', 'Gentle', 'present and kind in small, concrete ways.'),
    A(24, 'WCVFR', 'Attuned', "reads the room's feeling before it's spoken."),
    A(25, 'WALDS', 'Incisive', 'cuts to the underlying structure and names it.'),
    A(26, 'WALDR', 'Searching', 'drives at the deep structure, and never quite stops.'),
    A(27, 'WALFS', 'Inquisitive', 'follows the question wherever it leads, for its own sake.'),
    A(28, 'WALFR', 'Absorbed', 'disappears into the idea; consumed by the chase.'),
    A(29, 'WAVDS', 'Principled', "quiet conviction, moving steadily toward what's right."),
    A(30, 'WAVDR', 'Earnest', 'conviction felt deeply and held close.'),
    A(31, 'WAVFS', 'Contemplative', 'an inner world of meaning, guided by what feels true.'),
    A(32, 'WAVFR', 'Idealistic', 'meaning and imagination, felt at full intensity.'),
  ].map(a => [a.code, a]),
);

/** Dominant pole of each axis → the 5-letter archetype code (balanced axes lean plus). */
export function archetypeCode(positions: Positions): string {
  const pole = (code: AxisCode, plus: string, minus: string) =>
    positions[code] >= 50 ? plus : minus;
  return (
    pole('EO', 'O', 'W') +
    pole('IF', 'C', 'A') +
    pole('DB', 'L', 'V') +
    pole('SP', 'D', 'F') +
    pole('ER', 'S', 'R')
  );
}

export function archetypeFor(positions: Positions): Archetype {
  return ARCHETYPES[archetypeCode(positions)];
}
