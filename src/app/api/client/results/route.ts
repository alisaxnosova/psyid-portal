import { NextResponse } from 'next/server';
import { kvGet, kvKeys } from '@/lib/upstash';
import { getSession, getPortalUser, ensureAccessCode } from '@/lib/portalAuth';
import { scoreSession } from '@/lib/renoScore';
import type { AccessCode } from '@/app/api/codes/route';
import type { RenoSession } from '@/app/api/reno/types';

const CODES_KEY = 'psyid:codes';

const RU_MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

function ruDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getDate()).padStart(2, '0')} ${RU_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
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

    const assessments: AssessmentPayload[] = sessions.map((s, i) => {
      const score = scoreSession(s.answers);
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
        date: ruDate(when),
        tier: 'Базовый',
        tierCode: 'STD',
        code: score.type,
        vals,
        nearBoundary: score.nearBoundary,
        confidence: Number(confidence.toFixed(2)),
      };
    });

    const year = new Date(portalUser.createdAt || Date.now()).getFullYear();
    const holder = {
      name: portalUser.name || session.email.split('@')[0],
      nameLatin: toLatin(portalUser.name || session.email.split('@')[0]),
      initials: initialsFrom(portalUser.name || session.email),
      memberSince: String(year),
      passportNo: `PSY-${year}-${accessCode}`,
      nationality: 'PSYID · ЛИЧНОСТЬ',
      handle: '@' + session.email.split('@')[0],
    };

    return NextResponse.json({ hasResult: assessments.length > 0, holder, assessments });
  } catch (err) {
    console.error('[client/results]', err);
    return NextResponse.json({ message: 'Failed to load results.' }, { status: 500 });
  }
}
