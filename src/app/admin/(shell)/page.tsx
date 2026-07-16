'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminLoggedIn } from '@/lib/adminApi';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
} from 'recharts';

function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_access_token');
}

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8',
  line: '#E5DED2', bone: '#F6F1EA', white: '#ffffff',
  orange: '#FF7A3D', orangeHot: '#FF9540', orangeLight: 'rgba(255,149,64,0.12)',
  green: '#1DA36A', greenLight: 'rgba(29,163,106,0.12)',
  coral: '#FF5A5A',
  violet: '#8A5CD6', violetLight: 'rgba(138,92,214,0.12)',
  blue: '#2244E0', blueLight: 'rgba(34,68,224,0.12)',
  purple: '#7B3FBE',
};

const TYPE_COLOR: Record<string, string> = {
  INTJ: C.violet, INTP: C.violet, ENTJ: C.violet, ENTP: C.violet,
  INFJ: C.purple, INFP: C.purple, ENFJ: C.purple, ENFP: C.purple,
  ISTJ: C.blue,   ISFJ: C.blue,   ESTJ: C.blue,   ESFJ: C.blue,
  ISTP: C.inkSoft, ISFP: C.inkSoft, ESTP: C.inkSoft, ESFP: C.inkSoft,
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface DashData {
  pulse: {
    completedToday: number; completedYesterday: number;
    startedToday: number; startedYesterday: number;
    avgMinsToday: number | null; avgMinsYesterday: number | null;
    sourceBreakdown: { source: string; count: number }[];
  };
  trend: { daily: { date: string; count: number }[] };
  geo: { byCountry: { country: string; count: number }[] };
  profiles: {
    typeBreakdown: { type: string; count: number }[];
    axisPct: { EI: number[]; SN: number[]; FT: number[]; JP: number[] };
  };
  dropoff: {
    blocks: { label: string; fromQ: number; toQ: number; reached: number; completed: number; dropoffPct: number }[];
  };
  meta: { totalCompleted: number; totalStarted: number; lastUpdated: string };
}

// ── Small helpers ─────────────────────────────────────────────────────────────
function delta(now: number, prev: number) {
  const d = now - prev;
  if (d === 0) return null;
  return { value: Math.abs(d), up: d > 0 };
}

function deltaPct(now: number, prev: number) {
  if (prev === 0) return null;
  const d = Math.round(((now - prev) / prev) * 100);
  if (d === 0) return null;
  return { value: Math.abs(d), up: d > 0 };
}

function fmtMins(m: number | null) {
  if (m === null) return '—';
  if (m < 1) return `${Math.round(m * 60)}s`;
  return `${m.toFixed(1)} min`;
}

function histogram(values: number[], buckets = 10): number[] {
  const counts = Array(buckets).fill(0);
  for (const v of values) {
    const idx = Math.min(Math.floor(v / (100 / buckets)), buckets - 1);
    counts[idx]++;
  }
  return counts;
}

// ── UI atoms ──────────────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: C.white, borderRadius: 20, border: `1px solid ${C.line}`, ...style }}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: C.inkMute,
      textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace", marginBottom: 20,
    }}>{children}</div>
  );
}

function Delta({ d, invert }: { d: { value: number; up: boolean } | null; invert?: boolean }) {
  if (!d) return null;
  const good = invert ? !d.up : d.up;
  return (
    <span style={{
      fontSize: 11, fontWeight: 700, fontFamily: "'Geist Mono', monospace",
      color: good ? C.green : C.coral,
      background: good ? C.greenLight : 'rgba(255,90,90,0.10)',
      padding: '2px 7px', borderRadius: 6, marginLeft: 8,
    }}>
      {d.up ? '▲' : '▼'} {d.value}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, deltaEl, sub }: {
  label: string;
  value: React.ReactNode;
  deltaEl?: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <Card style={{ padding: '24px 28px', flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: C.inkMute, textTransform: 'uppercase', fontFamily: "'Geist Mono',monospace", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontSize: 36, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>
          {value}
        </span>
        {deltaEl}
      </div>
      {sub && <div style={{ marginTop: 8, fontSize: 12, color: C.inkMute }}>{sub}</div>}
    </Card>
  );
}

// ── Trend range toggle ────────────────────────────────────────────────────────
type Range = 7 | 30 | 90 | 'all';

function RangeBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 12px', borderRadius: 8, border: `1.5px solid ${active ? C.orangeHot : C.line}`,
      background: active ? C.orangeLight : 'transparent',
      color: active ? C.orangeHot : C.inkMute,
      fontSize: 11, fontWeight: 700, fontFamily: "'Geist Mono',monospace",
      cursor: 'pointer', transition: 'all .15s',
    }}>{label}</button>
  );
}

// ── Histogram bar ─────────────────────────────────────────────────────────────
function HistBar({ pct, max }: { pct: number; max: number }) {
  const h = max > 0 ? Math.round((pct / max) * 60) : 0;
  return (
    <div style={{
      width: 18, height: 60, display: 'flex', alignItems: 'flex-end',
    }}>
      <div style={{
        width: '100%', height: h, background: C.violet, borderRadius: '3px 3px 0 0',
        transition: 'height .3s',
      }} />
    </div>
  );
}

// ── Axis histogram panel ──────────────────────────────────────────────────────
function AxisHistogram({ label, leftLabel, rightLabel, values }: {
  label: string; leftLabel: string; rightLabel: string; values: number[];
}) {
  const buckets = histogram(values, 10);
  const max = Math.max(...buckets, 1);
  const dominant = values.length
    ? values.filter(v => v >= 50).length / values.length >= 0.5 ? leftLabel : rightLabel
    : '—';

  return (
    <Card style={{ padding: '20px 24px', flex: 1, minWidth: 200 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: C.inkMute, textTransform: 'uppercase', fontFamily: "'Geist Mono',monospace", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 12, color: C.inkSoft, marginBottom: 16 }}>
        Dominant: <b style={{ color: C.ink }}>{dominant}</b>
      </div>
      <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end', marginBottom: 6 }}>
        {buckets.map((b, i) => <HistBar key={i} pct={b} max={max} />)}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.inkMute, fontFamily: "'Geist Mono',monospace" }}>
        <span>← {leftLabel} 100%</span>
        <span>{rightLabel} 100% →</span>
      </div>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [view, setView]     = useState<'adult' | 'youth'>('adult');
  const [data, setData]     = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');
  const [range, setRange]   = useState<Range>(30);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    if (!isAdminLoggedIn()) router.push('/admin/login');
  }, [router]);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = getAdminToken();
      const res = await fetch('/api/admin/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setData(await res.json() as DashData);
    } catch {
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const trendData = useMemo(() => {
    if (!data) return [];
    const all = data.trend.daily;
    if (range === 'all') return all;
    return all.slice(-range);
  }, [data, range]);

  const fmtDate = (d: string) => {
    const dt = new Date(d + 'T00:00:00Z');
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  };

  const totalToday    = data ? data.pulse.completedToday    : 0;
  const totalYest     = data ? data.pulse.completedYesterday : 0;
  const startToday    = data ? data.pulse.startedToday      : 0;
  const startYest     = data ? data.pulse.startedYesterday  : 0;
  const rateToday     = startToday  > 0 ? Math.round((totalToday / startToday)   * 100) : 0;
  const rateYest      = startYest   > 0 ? Math.round((totalYest  / startYest)    * 100) : 0;

  return (
    <div style={{ fontFamily: "'Geist', 'Onest', system-ui, sans-serif" }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 12, color: C.inkMute, marginTop: 5, fontFamily: "'Geist Mono',monospace" }}>
            {data ? `Updated ${new Date(data.meta.lastUpdated).toLocaleTimeString()}` : 'Loading…'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>

          {/* Adult / Youth toggle */}
          <div style={{ display: 'flex', background: C.bone, borderRadius: 12, padding: 4, border: `1px solid ${C.line}` }}>
            <button
              onClick={() => setView('adult')}
              style={{
                padding: '7px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
                background: view === 'adult' ? C.white : 'transparent',
                color: view === 'adult' ? C.ink : C.inkMute,
                fontWeight: view === 'adult' ? 700 : 400, fontSize: 13,
                boxShadow: view === 'adult' ? `0 1px 4px rgba(0,0,0,.08)` : 'none',
                transition: 'all .15s', fontFamily: 'inherit',
              }}>
              PsyID Adult
            </button>
            <button
              disabled
              style={{
                padding: '7px 18px', borderRadius: 9, border: 'none', cursor: 'not-allowed',
                background: 'transparent', color: C.inkMute,
                fontSize: 13, fontFamily: 'inherit', opacity: 0.5,
              }}>
              PsyID Youth — Coming Soon
            </button>
          </div>

          <button onClick={load} disabled={loading} style={{
            padding: '9px 18px', borderRadius: 12, border: `1.5px solid ${C.line}`,
            background: C.white, color: C.inkSoft, fontSize: 13,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}>
            {loading ? 'Loading…' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 18px', borderRadius: 12, background: 'rgba(255,90,90,0.08)', border: `1px solid rgba(255,90,90,0.2)`, color: C.coral, fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* ── Section A: Daily Pulse ──────────────────────────────────────── */}
      <SectionLabel>Section A — Daily Pulse</SectionLabel>
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>

        <StatCard
          label="Tests Completed"
          value={loading ? '—' : totalToday}
          deltaEl={<Delta d={delta(totalToday, totalYest)} />}
          sub={`${data?.meta.totalCompleted ?? 0} all-time`}
        />

        <StatCard
          label="Completion Rate"
          value={loading ? '—' : `${rateToday}%`}
          deltaEl={<Delta d={delta(rateToday, rateYest)} />}
          sub={`${startToday} started today`}
        />

        <StatCard
          label="Avg Time to Complete"
          value={loading ? '—' : fmtMins(data?.pulse.avgMinsToday ?? null)}
          deltaEl={data ? <Delta invert d={deltaPct(data.pulse.avgMinsToday ?? 0, data.pulse.avgMinsYesterday ?? 0)} /> : null}
          sub="vs yesterday"
        />

        <StatCard
          label="Source Breakdown"
          value={''}
          sub={
            loading ? 'Loading…' : data && data.pulse.sourceBreakdown.length > 0
              ? (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: -4 }}>
                  {data.pulse.sourceBreakdown.map(s => (
                    <span key={s.source} style={{
                      padding: '3px 10px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                      background: C.orangeLight, color: C.orangeHot,
                      fontFamily: "'Geist Mono',monospace", textTransform: 'capitalize',
                    }}>
                      {s.source}: {s.count}
                    </span>
                  ))}
                </div>
              )
              : <span style={{ color: C.inkMute }}>No completions yet</span>
          }
        />
      </div>

      {/* ── Section B: Trends ──────────────────────────────────────────── */}
      <SectionLabel>Section B — Trends</SectionLabel>
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>

        {/* Tests over time */}
        <Card style={{ flex: 2, minWidth: 320, padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: C.inkMute, textTransform: 'uppercase', fontFamily: "'Geist Mono',monospace" }}>Tests Over Time</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.ink, marginTop: 4 }}>
                {trendData.reduce((a, d) => a + d.count, 0)} completed
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {([7, 30, 90, 'all'] as Range[]).map(r => (
                <RangeBtn key={r} label={r === 'all' ? 'All' : `${r}d`} active={range === r} onClick={() => setRange(r)} />
              ))}
            </div>
          </div>
          {loading || trendData.length === 0
            ? <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.inkMute, fontSize: 13 }}>No data yet</div>
            : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={trendData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={fmtDate}
                    tick={{ fontSize: 10, fill: C.inkMute, fontFamily: "'Geist Mono',monospace" }}
                    tickLine={false} axisLine={false}
                    interval={range === 7 ? 0 : range === 30 ? 4 : 13}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: C.inkMute, fontFamily: "'Geist Mono',monospace" }}
                    tickLine={false} axisLine={false} allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12, fontFamily: "'Geist Mono',monospace" }}
                    labelFormatter={(d) => fmtDate(String(d))}
                    formatter={(v) => [v, 'Completed']}
                  />
                  <Line type="monotone" dataKey="count" stroke={C.violet} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )
          }
        </Card>

        {/* Geographic distribution */}
        <Card style={{ flex: 1, minWidth: 260, padding: '24px 28px', overflowY: 'auto', maxHeight: 340 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: C.inkMute, textTransform: 'uppercase', fontFamily: "'Geist Mono',monospace", marginBottom: 16 }}>
            Geographic Distribution
          </div>
          {loading
            ? <div style={{ color: C.inkMute, fontSize: 13 }}>Loading…</div>
            : !data?.geo.byCountry.length
              ? <div style={{ color: C.inkMute, fontSize: 13 }}>No country data yet</div>
              : data.geo.byCountry.map((row, i) => {
                  const maxCount = data.geo.byCountry[0].count;
                  return (
                    <div key={row.country} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 11, fontFamily: "'Geist Mono',monospace", color: C.inkMute, width: 18, textAlign: 'right' }}>{i + 1}</span>
                      <span style={{ fontSize: 13, color: C.ink, minWidth: 110, flexShrink: 0 }}>{row.country}</span>
                      <div style={{ flex: 1, height: 6, background: C.bone, borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ width: `${(row.count / maxCount) * 100}%`, height: '100%', background: C.blue, borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 11, fontFamily: "'Geist Mono',monospace", color: C.inkMute, width: 24, textAlign: 'right' }}>{row.count}</span>
                    </div>
                  );
                })
          }
          {!loading && !data?.geo.byCountry.length && null}
        </Card>
      </div>

      {/* ── Section C: Profile Intelligence ────────────────────────────── */}
      <SectionLabel>Section C — Profile Intelligence</SectionLabel>

      {/* Profile type breakdown */}
      <Card style={{ padding: '24px 28px', marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: C.inkMute, textTransform: 'uppercase', fontFamily: "'Geist Mono',monospace", marginBottom: 20 }}>
          Profile Type Distribution
        </div>
        {loading
          ? <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.inkMute, fontSize: 13 }}>Loading…</div>
          : !data?.profiles.typeBreakdown.length
            ? <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.inkMute, fontSize: 13 }}>No profiles yet</div>
            : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={data.profiles.typeBreakdown} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.line} vertical={false} />
                  <XAxis dataKey="type" tick={{ fontSize: 11, fill: C.inkMute, fontFamily: "'Geist Mono',monospace", fontWeight: 700 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: C.inkMute, fontFamily: "'Geist Mono',monospace" }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: `1px solid ${C.line}`, fontSize: 12, fontFamily: "'Geist Mono',monospace" }}
                    formatter={(v) => [v, 'Count']}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {data.profiles.typeBreakdown.map((entry) => (
                      <Cell key={entry.type} fill={TYPE_COLOR[entry.type] ?? C.inkSoft} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )
        }
      </Card>

      {/* Axis histograms */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'EI' as const, label: 'Attention Vector',    leftLabel: 'Extraversion', rightLabel: 'Introversion' },
          { key: 'SN' as const, label: 'World Perception',    leftLabel: 'Sensing',      rightLabel: 'Intuition'    },
          { key: 'FT' as const, label: 'Decision-Making',     leftLabel: 'Feeling',      rightLabel: 'Thinking'     },
          { key: 'JP' as const, label: 'Life Organization',   leftLabel: 'Judging',      rightLabel: 'Perceiving'   },
        ].map(ax => (
          <AxisHistogram
            key={ax.key}
            label={ax.label}
            leftLabel={ax.leftLabel}
            rightLabel={ax.rightLabel}
            values={data?.profiles.axisPct[ax.key] ?? []}
          />
        ))}
      </div>

      {/* Drop-off table */}
      <Card style={{ marginBottom: 28, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 0', fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: C.inkMute, textTransform: 'uppercase', fontFamily: "'Geist Mono',monospace" }}>
          Drop-off Analysis — sorted by highest drop-off
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Block', 'Reached', 'Passed Through', 'Drop-off %', ''].map(h => (
                  <th key={h} style={{
                    padding: '12px 20px', textAlign: h === '' ? 'left' : 'left',
                    fontFamily: "'Geist Mono',monospace", fontSize: 10, fontWeight: 700,
                    color: C.inkMute, letterSpacing: '0.10em', textTransform: 'uppercase',
                    background: C.bone, borderBottom: `1px solid ${C.line}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: C.inkMute, fontSize: 13 }}>Loading…</td></tr>
              )}
              {!loading && (!data?.dropoff.blocks.length) && (
                <tr><td colSpan={5} style={{ padding: '48px 20px', textAlign: 'center', color: C.inkMute, fontSize: 13 }}>No session data yet</td></tr>
              )}
              {!loading && [...(data?.dropoff.blocks ?? [])].sort((a, b) => b.dropoffPct - a.dropoffPct).map(b => (
                <tr key={b.label}
                  onMouseEnter={e => (e.currentTarget.style.background = C.bone)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  style={{ transition: 'background .1s' }}
                >
                  <td style={{ padding: '13px 20px', fontFamily: "'Geist Mono',monospace", fontWeight: 700, fontSize: 13, color: C.ink, borderBottom: `1px solid ${C.bone}` }}>{b.label}</td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: C.inkSoft, borderBottom: `1px solid ${C.bone}` }}>{b.reached}</td>
                  <td style={{ padding: '13px 20px', fontSize: 13, color: C.inkSoft, borderBottom: `1px solid ${C.bone}` }}>{b.completed}</td>
                  <td style={{ padding: '13px 20px', borderBottom: `1px solid ${C.bone}` }}>
                    <span style={{
                      fontFamily: "'Geist Mono',monospace", fontWeight: 800, fontSize: 13,
                      color: b.dropoffPct >= 20 ? C.coral : b.dropoffPct >= 10 ? C.orange : C.green,
                    }}>
                      {b.dropoffPct}%
                    </span>
                  </td>
                  <td style={{ padding: '13px 20px', borderBottom: `1px solid ${C.bone}`, minWidth: 140 }}>
                    <div style={{ height: 5, background: C.bone, borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{
                        width: `${b.dropoffPct}%`, height: '100%', borderRadius: 99,
                        background: b.dropoffPct >= 20 ? C.coral : b.dropoffPct >= 10 ? C.orange : C.green,
                      }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── Section D: Data Export ──────────────────────────────────────── */}
      <SectionLabel>Section D — Data Export</SectionLabel>
      <Card style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 4 }}>Export Research Dataset</div>
            <div style={{ fontSize: 13, color: C.inkSoft, maxWidth: 480 }}>
              CSV export of all anonymized session records. No PII included. Scoped to Adult View only.
              {data && <span style={{ color: C.inkMute }}> {data.meta.totalCompleted} records available.</span>}
            </div>
          </div>
          <ExportPanel data={data} />
        </div>
      </Card>

    </div>
  );
}

// ── Export panel (separate component for clean state) ─────────────────────────
function ExportPanel({ data }: { data: DashData | null }) {
  const [exporting, setExporting] = useState(false);
  const [filterSource, setFilterSource] = useState('all');
  const [filterType,   setFilterType]   = useState('all');

  async function handleExport() {
    setExporting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin_access_token') : null;
      const res = await fetch('/api/admin/results', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch results');
      const { results } = await res.json() as {
        results: {
          sessionId: string; code: string; type: string; source?: string;
          intake: { country?: string } | null;
          scores: Record<string, number>;
          pct: Record<string, number>;
          avgResponseTimeMs: number | null;
          createdAt: string; completedAt: string | null;
        }[]
      };

      let rows = results;
      if (filterSource !== 'all') rows = rows.filter(r => (r.source ?? 'direct') === filterSource);
      if (filterType !== 'all') rows = rows.filter(r => r.type === filterType);

      const header = [
        'session_id_hash', 'user_type', 'source', 'country', 'date_completed',
        'profile_type', 'completion_time_mins',
        'E_score', 'I_score', 'S_score', 'N_score', 'F_score', 'T_score', 'J_score', 'P_score',
        'E_pct', 'I_pct', 'S_pct', 'N_pct', 'F_pct', 'T_pct', 'J_pct', 'P_pct',
      ];

      const csvRows = [
        header,
        ...rows.map(r => [
          r.sessionId.slice(-12),
          'third_party',
          r.source ?? 'direct',
          r.intake?.country ?? '',
          r.completedAt?.slice(0, 10) ?? '',
          r.type,
          r.avgResponseTimeMs !== null ? (r.avgResponseTimeMs / 60000).toFixed(2) : '',
          r.scores.E ?? 0, r.scores.I ?? 0, r.scores.S ?? 0, r.scores.N ?? 0,
          r.scores.F ?? 0, r.scores.T ?? 0, r.scores.J ?? 0, r.scores.P ?? 0,
          r.pct.E ?? 50, r.pct.I ?? 50, r.pct.S ?? 50, r.pct.N ?? 50,
          r.pct.F ?? 50, r.pct.T ?? 50, r.pct.J ?? 50, r.pct.P ?? 50,
        ]),
      ];

      const csv = csvRows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `psyid_adult_export_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed. Try again.');
    } finally {
      setExporting(false);
    }
  }

  const sel: React.CSSProperties = {
    padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${C.line}`,
    fontSize: 13, color: C.ink, background: C.white, fontFamily: 'inherit', cursor: 'pointer',
  };

  const types = data?.profiles.typeBreakdown.map(t => t.type) ?? [];

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
      <select value={filterSource} onChange={e => setFilterSource(e.target.value)} style={sel}>
        <option value="all">All sources</option>
        <option value="direct">Direct</option>
        <option value="etsy">Etsy</option>
        <option value="fiverr">Fiverr</option>
      </select>
      <select value={filterType} onChange={e => setFilterType(e.target.value)} style={sel}>
        <option value="all">All types</option>
        {types.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <button
        onClick={handleExport}
        disabled={exporting || !data || data.meta.totalCompleted === 0}
        style={{
          padding: '9px 22px', borderRadius: 12, border: 'none',
          background: C.violet, color: 'white', fontWeight: 700, fontSize: 13,
          cursor: exporting || !data || data.meta.totalCompleted === 0 ? 'not-allowed' : 'pointer',
          opacity: exporting || !data || data.meta.totalCompleted === 0 ? 0.5 : 1,
          fontFamily: 'inherit', transition: 'opacity .15s',
        }}
      >
        {exporting ? 'Exporting…' : '↓ Export CSV'}
      </button>
    </div>
  );
}
