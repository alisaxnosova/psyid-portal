import { NextResponse } from 'next/server';
import { kvGet, kvKeys } from '@/lib/upstash';
import { getSession, getPortalUser, ensureAccessCode } from '@/lib/portalAuth';
import { scoreSessionAuto } from '@/lib/scoreSessionAuto';
import { profiles } from '@/app/reno/data/profiles';
import descriptions from '@/content/descriptions.json';
import type { AccessCode } from '@/app/api/codes/route';
import type { RenoSession } from '@/app/api/reno/types';

const CODES_KEY = 'psyid:codes';

// Editable content catalog (regenerated from the Google Sheet by scripts/sync-content.mjs).
// Any key present here overrides the profiles.ts default text.
const CATALOG = descriptions as Record<string, Record<string, string>>;
const catText = (key: string, lang: string, fallback: string) => CATALOG[key]?.[lang] || fallback;

// Maps each display axis to the answer-key profiles[] axis and its dominant/other poles.
const AXIS_MAP = [
  { key: 'energy',    name: 'Energy',    left: 'Introversion', right: 'Extraversion', rp: 'E' as const, lp: 'I' as const, pi: 0 },
  { key: 'attention', name: 'Attention', left: 'Sensing',      right: 'Intuition',    rp: 'N' as const, lp: 'S' as const, pi: 1 },
  { key: 'decisions', name: 'Decisions', left: 'Thinking',     right: 'Feeling',      rp: 'F' as const, lp: 'T' as const, pi: 2 },
  { key: 'structure', name: 'Structure', left: 'Flexibility',  right: 'Planning',     rp: 'J' as const, lp: 'P' as const, pi: 3 },
];

interface AxisDetail {
  key: string; name: string; left: string; right: string;
  val: number;          // right-pole fraction 0..1 (for the slider)
  bandLabel: string;    // authentic answer-key band label
  poleLabel: string;    // which side they lean (Extraversion / Introversion …)
  dims: { label: string; text: string }[]; // authentic per-dimension descriptions
}

// Match a score to the authentic answer-key band and surface its specialist copy (English).
function buildAxes(pct: Record<string, number>): AxisDetail[] {
  return AXIS_MAP.map(ax => {
    const rightPct = pct[ax.rp]!;
    const leftPct = pct[ax.lp]!;
    const dominant = rightPct >= 50 ? ax.rp : ax.lp;
    const domPct = Math.max(rightPct, leftPct);
    const axis = profiles[ax.pi];
    const level = axis?.levels.find(l => l.pole === dominant && domPct >= l.min && domPct <= l.max) ?? null;
    const dimLabels = axis?.dimLabels.en ?? [];
    const dimTexts = level?.dims.en ?? [];
    const lang = 'en';
    const band = level ? `${axis!.axis}.${level.pole}_${level.min}-${level.max}` : '';
    return {
      key: ax.key, name: ax.name, left: ax.left, right: ax.right,
      val: rightPct / 100,
      bandLabel: catText(`${band}.label`, lang, level?.label.en ?? ''),
      poleLabel: dominant === ax.rp ? ax.right : ax.left,
      dims: dimTexts.map((text, i) => ({
        label: catText(`${axis!.axis}.dimName.${i}`, lang, dimLabels[i] ?? ''),
        text: catText(`${band}.dim.${i}`, lang, text),
      })),
    };
  });
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'PS';
  const letters = parts.slice(0, 2).map(p => p[0]!.toUpperCase()).join('');
  return letters || 'PS';
}

// Transliterate a Cyrillic/Latin name into A–Z for the MRZ-style latin line.
function toLatin(name: string): string {
  const map: Record<string, string> = {
    а: 'A', б: 'B', в: 'V', г: 'G', д: 'D', е: 'E', ё: 'E', ж: 'ZH', з: 'Z', и: 'I',
    й: 'Y', к: 'K', л: 'L', м: 'M', н: 'N', о: 'O', п: 'P', р: 'R', с: 'S', т: 'T',
    у: 'U', ф: 'F', х: 'KH', ц: 'TS', ч: 'CH', ш: 'SH', щ: 'SCH', ъ: '', ы: 'Y',
    ь: '', э: 'E', ю: 'YU', я: 'YA',
  };
  return name
    .toLowerCase()
    .split('')
    .map(ch => (ch === ' ' ? '  ' : map[ch] ?? (/[a-z]/.test(ch) ? ch.toUpperCase() : '')))
    .join('')
    .trim() || 'PSYID HOLDER';
}

interface AssessmentPayload {
  id: string;
  no: string;
  dateISO: string;
  date: string;
  tier: string;
  tierCode: string;
  code: string;
  vals: number[];           // [energy, attention, decisions, structure] 0..1
  nearBoundary: string[];
  confidence: number;
  axes: AxisDetail[];       // authentic answer-key band descriptions
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const session = await getSession(token);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const portalUser = await getPortalUser(session.email);
    if (!portalUser) return NextResponse.json({ hasResult: false, assessments: [] });

    const accessCode = await ensureAccessCode(portalUser);
    const codes = (await kvGet<AccessCode[]>(CODES_KEY)) ?? [];
    const codeRec = codes.find(c => c.code === accessCode);
    const codeId = codeRec?.id;

    // Collect every completed reno session that belongs to this portal user's code.
    const keys = codeId ? await kvKeys('psyid:reno-session:*') : [];
    const sessions = (await Promise.all(keys.map(k => kvGet<RenoSession>(k)))).filter(
      (s): s is RenoSession => !!s && s.status === 'completed' && s.codeId === codeId,
    );
    sessions.sort((a, b) => {
      const ta = new Date(a.completedAt ?? a.createdAt).getTime();
      const tb = new Date(b.completedAt ?? b.createdAt).getTime();
      return ta - tb;
    });

    // Everyone who has completed an assessment so far is grandfathered onto the
    // Full plan. When paid tiers exist, set `plan` explicitly on the portal user.
    const plan = portalUser.plan ?? 'full';
    const tier = plan === 'full' ? 'Full' : 'Basic';
    const tierCode = plan === 'full' ? 'FULL' : 'STD';

    const assessments: AssessmentPayload[] = sessions.map((s, i) => {
      const score = scoreSessionAuto(s);
      const p = score.pct;
      const vals = [p.E / 100, p.N / 100, p.F / 100, p.J / 100];
      const dominants = [
        Math.max(p.E, p.I), Math.max(p.S, p.N), Math.max(p.F, p.T), Math.max(p.J, p.P),
      ];
      const confidence = dominants.reduce((a, b) => a + b, 0) / dominants.length / 100;
      const when = s.completedAt ?? s.createdAt;
      return {
        id: s.id,
        no: String(i + 1).padStart(4, '0'),
        dateISO: when,
        date: fmtDate(when),
        tier,
        tierCode,
        code: score.type,
        vals,
        nearBoundary: score.nearBoundary,
        confidence: Number(confidence.toFixed(2)),
        axes: buildAxes(p as unknown as Record<string, number>),
      };
    });

    const year = new Date(portalUser.createdAt || Date.now()).getFullYear();
    const holder = {
      name: portalUser.name || session.email.split('@')[0],
      nameLatin: toLatin(portalUser.name || session.email.split('@')[0]),
      initials: initialsFrom(portalUser.name || session.email),
      memberSince: String(year),
      passportNo: `PSY-${year}-${accessCode}`,
      nationality: 'PSYID · PERSONALITY',
      handle: '@' + session.email.split('@')[0],
      plan,
    };

    return NextResponse.json({ hasResult: assessments.length > 0, holder, assessments });
  } catch (err) {
    console.error('[client/results]', err);
    return NextResponse.json({ message: 'Failed to load results.' }, { status: 500 });
  }
}
