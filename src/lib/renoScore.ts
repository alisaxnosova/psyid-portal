// The live test + scoring still run on the legacy 4-axis bank until the ReNo v1.1
// Likert migration (Phase 5). The new 5-axis bank lives in questions.json and is
// managed from the admin under a separate Redis key (psyid:questions:v2).
import questionsData from '@/app/reno/data/questions.v1-4axis.json';

interface RawAnswer { questionId: string; answerId: string; }
interface QuestionOption { id: string; key: string; score: number; }
interface Question { id: string; options: QuestionOption[]; }

const QUESTIONS = questionsData as unknown as Question[];
const Q_MAP = new Map(QUESTIONS.map(q => [q.id, q]));

// Axes where the dominant side is below this threshold are flagged as near-boundary
const NEAR_BOUNDARY_THRESHOLD = 55;

export interface RenoScore {
  type: string;
  scores: Record<string, number>;
  pct: { E: number; I: number; S: number; N: number; F: number; T: number; J: number; P: number };
  nearBoundary: string[]; // axes where dominant % < threshold, e.g. ['EI', 'JP']
}

export function scoreSession(answers: RawAnswer[]): RenoScore {
  const s: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, F: 0, T: 0, J: 0, P: 0 };

  for (const ans of answers) {
    const q = Q_MAP.get(ans.questionId);
    if (!q) continue;
    const opt = q.options.find(o => o.id === ans.answerId);
    if (!opt || !Object.prototype.hasOwnProperty.call(s, opt.key)) continue;
    s[opt.key] += opt.score;
  }

  const p = (a: number, b: number) => (a + b === 0 ? 50 : Math.round((a / (a + b)) * 100));
  const pct = { E: p(s.E, s.I), I: p(s.I, s.E), S: p(s.S, s.N), N: p(s.N, s.S), F: p(s.F, s.T), T: p(s.T, s.F), J: p(s.J, s.P), P: p(s.P, s.J) };

  const dominantPct = (a: keyof typeof pct, b: keyof typeof pct) => Math.max(pct[a], pct[b]);
  const nearBoundary: string[] = [];
  if (dominantPct('E', 'I') < NEAR_BOUNDARY_THRESHOLD) nearBoundary.push('EI');
  if (dominantPct('S', 'N') < NEAR_BOUNDARY_THRESHOLD) nearBoundary.push('SN');
  if (dominantPct('F', 'T') < NEAR_BOUNDARY_THRESHOLD) nearBoundary.push('FT');
  if (dominantPct('J', 'P') < NEAR_BOUNDARY_THRESHOLD) nearBoundary.push('JP');

  return {
    type:
      (s.E >= s.I ? 'E' : 'I') +
      (s.S >= s.N ? 'S' : 'N') +
      (s.F >= s.T ? 'F' : 'T') +
      (s.J >= s.P ? 'J' : 'P'),
    scores: s,
    pct,
    nearBoundary,
  };
}
