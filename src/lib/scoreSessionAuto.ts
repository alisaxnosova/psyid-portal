// Single entry point for scoring a stored session into the legacy `RenoScore` shape
// that the report-generator and portal passport consume. It detects which engine a
// session belongs to and routes v1.2 (five-axis Likert) sessions through an adapter,
// so retaking the current test no longer produces a legacy/garbage passport.
import { scoreSession, type RenoScore } from '@/lib/renoScore';
import { scoreSessionV12, type RenoScoreV12 } from '@/lib/renoScoreV12';

// The minimal shape both engines need. Decoupled from the several RenoSession
// variants across the codebase (admin route vs api/reno types) — any session with
// answers fits structurally, so callers pass whichever RenoSession they hold.
interface ScorableSession {
  answers: { questionId: string; answerId: string }[];
}

/**
 * ReNo v1.2 sessions store Likert answers ('1'..'5'); legacy sessions store
 * forced-choice option ids ('a'/'b'). Detect by answer shape so each session is
 * scored with the matching engine — never the old MBTI scorer on Likert data
 * (which collapses to all-zeros → the "phantom ESFJ").
 */
export function isV12Session(s: ScorableSession): boolean {
  return s.answers.length > 0 && s.answers.every(a => /^[1-5]$/.test(a.answerId));
}

/**
 * Adapt a five-axis v1.2 score into the legacy 4-axis MBTI `RenoScore` shape. The
 * axes map one-to-one:
 *   EO Outward↔E / Inward↔I · IF Concrete↔S / Abstract↔N ·
 *   DB Logic↔T / Values↔F · SP Ordered↔J / Flexible↔P
 * A v1.2 position (0..100 toward the plus pole) is the plus-pole percentage directly.
 * ER (Steady/Reactive) has no MBTI counterpart and is intentionally dropped — the
 * legacy report is four-axis. Tie-breaks match the legacy scorer exactly (E/S/J win
 * ties on the plus pole; the third letter resolves to F unless T is strictly greater).
 * `scores` (raw sums) is left empty: the report-generator never reads it.
 */
export function renoScoreV12ToLegacy(v12: RenoScoreV12): RenoScore {
  const round = (n: number) => Math.round(n);
  const E = round(v12.byCode.EO.position);
  const S = round(v12.byCode.IF.position);
  const T = round(v12.byCode.DB.position);
  const J = round(v12.byCode.SP.position);
  const pct = { E, I: 100 - E, S, N: 100 - S, T, F: 100 - T, J, P: 100 - J };

  const NEAR_BOUNDARY_THRESHOLD = 55;
  const nearBoundary: string[] = [];
  if (Math.max(pct.E, pct.I) < NEAR_BOUNDARY_THRESHOLD) nearBoundary.push('EI');
  if (Math.max(pct.S, pct.N) < NEAR_BOUNDARY_THRESHOLD) nearBoundary.push('SN');
  if (Math.max(pct.F, pct.T) < NEAR_BOUNDARY_THRESHOLD) nearBoundary.push('FT');
  if (Math.max(pct.J, pct.P) < NEAR_BOUNDARY_THRESHOLD) nearBoundary.push('JP');

  const type =
    (pct.E >= 50 ? 'E' : 'I') +
    (pct.S >= 50 ? 'S' : 'N') +
    (pct.T > 50 ? 'T' : 'F') +
    (pct.J >= 50 ? 'J' : 'P');

  return { type, scores: {}, pct, nearBoundary };
}

/** Score any stored session into the legacy RenoScore shape, v1.2 via the adapter. */
export function scoreSessionAuto(s: ScorableSession): RenoScore {
  return isV12Session(s)
    ? renoScoreV12ToLegacy(scoreSessionV12(s.answers))
    : scoreSession(s.answers);
}
