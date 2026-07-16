import { NextResponse } from 'next/server';
import { kvGet, kvKeys } from '@/lib/upstash';
import { scoreSession } from '@/lib/renoScore';
import { isV12Session } from '@/lib/scoreSessionAuto';
import type { RenoSession } from '@/app/api/reno/types';

const BACKEND = process.env.BACKEND_URL ?? 'http://159.194.222.35:3010';

async function verifyAdmin(req: Request): Promise<boolean> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) return false;
  const secret = process.env.ADMIN_SECRET;
  if (secret && token === secret) return true;
  try {
    const res = await fetch(`${BACKEND}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch { return false; }
}

function toDateStr(iso: string) {
  return iso.slice(0, 10); // YYYY-MM-DD
}

function dayStr(offsetFromToday: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetFromToday);
  return d.toISOString().slice(0, 10);
}

const BLOCKS = [
  { label: 'Q1–10',   fromQ: 0,  toQ: 10  },
  { label: 'Q11–20',  fromQ: 10, toQ: 20  },
  { label: 'Q21–30',  fromQ: 20, toQ: 30  },
  { label: 'Q31–40',  fromQ: 30, toQ: 40  },
  { label: 'Q41–50',  fromQ: 40, toQ: 50  },
  { label: 'Q51–60',  fromQ: 50, toQ: 60  },
  { label: 'Q61–70',  fromQ: 60, toQ: 70  },
  { label: 'Q71–80',  fromQ: 70, toQ: 80  },
  { label: 'Q81–94',  fromQ: 80, toQ: 94  },
];

export async function GET(req: Request) {
  if (!await verifyAdmin(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sessionKeys = await kvKeys('psyid:reno-session:*');
  if (sessionKeys.length === 0) {
    return NextResponse.json(emptyResponse());
  }

  const sessions = (
    await Promise.all(sessionKeys.map(key => kvGet<RenoSession>(key)))
  ).filter((s): s is RenoSession => !!s && s.userType !== 'youth');

  const today     = dayStr(0);
  const yesterday = dayStr(-1);

  const completed  = sessions.filter(s => s.status === 'completed');
  const allStarted = sessions;

  // ── Pulse ─────────────────────────────────────────────────────────────────
  const completedToday     = completed.filter(s => toDateStr(s.completedAt ?? '') === today).length;
  const completedYesterday = completed.filter(s => toDateStr(s.completedAt ?? '') === yesterday).length;
  const startedToday       = allStarted.filter(s => toDateStr(s.createdAt) === today).length;
  const startedYesterday   = allStarted.filter(s => toDateStr(s.createdAt) === yesterday).length;

  function avgMins(sessions: RenoSession[]) {
    const times = sessions
      .filter(s => s.completedAt)
      .map(s => (new Date(s.completedAt!).getTime() - new Date(s.createdAt).getTime()) / 60000);
    return times.length ? Math.round(times.reduce((a, b) => a + b, 0) / times.length * 10) / 10 : null;
  }

  const avgMinsToday     = avgMins(completed.filter(s => toDateStr(s.completedAt ?? '') === today));
  const avgMinsYesterday = avgMins(completed.filter(s => toDateStr(s.completedAt ?? '') === yesterday));

  const sourceCounts: Record<string, number> = {};
  for (const s of completed) {
    const src = s.source ?? 'direct';
    sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
  }
  const sourceBreakdown = Object.entries(sourceCounts)
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);

  // ── Trend (last 90 days) ───────────────────────────────────────────────────
  const dailyMap: Record<string, number> = {};
  for (let i = 89; i >= 0; i--) dailyMap[dayStr(-i)] = 0;
  for (const s of completed) {
    const d = toDateStr(s.completedAt ?? '');
    if (dailyMap[d] !== undefined) dailyMap[d]++;
  }
  const daily = Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // ── Geo ───────────────────────────────────────────────────────────────────
  const countryCounts: Record<string, number> = {};
  for (const s of completed) {
    const c = s.intake?.country;
    if (c) countryCounts[c] = (countryCounts[c] ?? 0) + 1;
  }
  const byCountry = Object.entries(countryCounts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  // ── Profiles ──────────────────────────────────────────────────────────────
  const typeCounts: Record<string, number> = {};
  const eiPct: number[] = [];
  const snPct: number[] = [];
  const ftPct: number[] = [];
  const jpPct: number[] = [];

  for (const s of completed) {
    // Skip ReNo v1.2 (Likert) sessions — the legacy MBTI scorer can't read them and
    // would mis-classify every one as ESFJ. They belong to the five-axis analytics.
    if (isV12Session(s)) continue;
    const score = scoreSession(s.answers);
    typeCounts[score.type] = (typeCounts[score.type] ?? 0) + 1;
    eiPct.push(score.pct.E);
    snPct.push(score.pct.S);
    ftPct.push(score.pct.F);
    jpPct.push(score.pct.J);
  }

  const typeBreakdown = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // ── Drop-off ──────────────────────────────────────────────────────────────
  const blocks = BLOCKS.map(b => {
    const reached   = sessions.filter(s => s.answers.length >= b.fromQ + 1 || s.status === 'completed').length;
    const passed    = sessions.filter(s => s.answers.length >= b.toQ || s.status === 'completed').length;
    const dropoffPct = reached > 0 ? Math.round((1 - passed / reached) * 100) : 0;
    return { ...b, reached, completed: passed, dropoffPct };
  });

  return NextResponse.json({
    pulse: {
      completedToday, completedYesterday,
      startedToday, startedYesterday,
      avgMinsToday, avgMinsYesterday,
      sourceBreakdown,
    },
    trend: { daily },
    geo: { byCountry },
    profiles: {
      typeBreakdown,
      axisPct: { EI: eiPct, SN: snPct, FT: ftPct, JP: jpPct },
    },
    dropoff: { blocks },
    meta: {
      totalCompleted: completed.length,
      totalStarted: allStarted.length,
      lastUpdated: new Date().toISOString(),
    },
  });
}

function emptyResponse() {
  return {
    pulse: { completedToday: 0, completedYesterday: 0, startedToday: 0, startedYesterday: 0, avgMinsToday: null, avgMinsYesterday: null, sourceBreakdown: [] },
    trend: { daily: [] },
    geo: { byCountry: [] },
    profiles: { typeBreakdown: [], axisPct: { EI: [], SN: [], FT: [], JP: [] } },
    dropoff: { blocks: [] },
    meta: { totalCompleted: 0, totalStarted: 0, lastUpdated: new Date().toISOString() },
  };
}
