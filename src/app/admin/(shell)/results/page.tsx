'use client';

import { useState, useEffect, useCallback } from 'react';
function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_access_token');
}

const C = {
  ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8',
  line: '#E5DED2', bone: '#F6F1EA',
  orange: '#FF7A3D', orangeHot: '#FF9540',
  green: '#1DA36A', coral: '#FF5A5A', blue: '#2244E0',
  violet: '#4B1E8E', purple: '#7B3FBE',
};

type Tab = 'results' | 'research';

interface ResultRow {
  sessionId: string;
  codeId: string;
  code: string;
  type: string;
  pct: { E: number; I: number; S: number; N: number; F: number; T: number; J: number; P: number };
  scores: Record<string, number>;
  intake: { consent: boolean; age?: number; education?: string; country?: string } | null;
  answersCount: number;
  createdAt: string;
  completedAt: string | null;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function TH({ children, w }: { children: React.ReactNode; w?: number | string }) {
  return (
    <th style={{
      padding: '11px 14px', textAlign: 'left',
      fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700,
      color: C.inkMute, textTransform: 'uppercase', letterSpacing: '0.10em',
      background: C.bone, borderBottom: `1px solid ${C.line}`,
      whiteSpace: 'nowrap', width: w,
    }}>{children}</th>
  );
}

function TD({ children, mono, muted }: { children: React.ReactNode; mono?: boolean; muted?: boolean }) {
  return (
    <td style={{
      padding: '13px 14px', fontSize: mono ? 12 : 13,
      color: muted ? C.inkMute : mono ? C.inkSoft : C.ink,
      fontFamily: mono ? "'Geist Mono', monospace" : 'inherit',
      borderBottom: `1px solid ${C.bone}`,
      whiteSpace: 'nowrap', verticalAlign: 'middle',
    }}>{children}</td>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    INTJ: C.violet, INTP: C.violet, ENTJ: C.violet, ENTP: C.violet,
    INFJ: C.purple, INFP: C.purple, ENFJ: C.purple, ENFP: C.purple,
    ISTJ: C.blue, ISFJ: C.blue, ESTJ: C.blue, ESFJ: C.blue,
    ISTP: C.inkSoft, ISFP: C.inkSoft, ESTP: C.inkSoft, ESFP: C.inkSoft,
  };
  const bg = colors[type] ?? C.inkMute;
  return (
    <span style={{
      display: 'inline-block', padding: '4px 10px', borderRadius: 8,
      background: bg, color: 'white',
      fontFamily: "'Geist Mono', monospace", fontSize: 13, fontWeight: 800,
      letterSpacing: '0.05em',
    }}>
      {type}
    </span>
  );
}

function AxisBar({ label, pct, color }: { label: string; pct: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 90 }}>
      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700, color: C.inkMute, width: 10 }}>{label}</span>
      <div style={{ flex: 1, height: 5, background: C.bone, borderRadius: 99, overflow: 'hidden', minWidth: 48 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: C.inkMute, width: 28 }}>{pct}%</span>
    </div>
  );
}

function ExpandedRow({ r }: { r: ResultRow }) {
  const axes = [
    { left: 'E', right: 'I', dominant: r.type[0], pct: r.pct },
    { left: 'S', right: 'N', dominant: r.type[1], pct: r.pct },
    { left: 'F', right: 'T', dominant: r.type[2], pct: r.pct },
    { left: 'J', right: 'P', dominant: r.type[3], pct: r.pct },
  ];

  return (
    <tr>
      <td colSpan={8} style={{ background: '#FAFAF9', borderBottom: `1px solid ${C.line}`, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          {/* Axis detail */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Geist Mono',monospace", marginBottom: 10 }}>Axis Scores</div>
            {axes.map(ax => (
              <div key={ax.left} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 100, display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, fontWeight: ax.dominant === ax.left ? 800 : 400, color: ax.dominant === ax.left ? C.ink : C.inkMute, width: 12 }}>{ax.left}</span>
                  <div style={{ flex: 1, height: 6, background: C.bone, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${ax.pct[ax.left as keyof typeof ax.pct]}%`, height: '100%', background: C.violet, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10, color: C.inkMute, width: 28 }}>{ax.pct[ax.left as keyof typeof ax.pct]}%</span>
                </div>
                <span style={{ color: C.inkMute, fontSize: 10 }}>vs</span>
                <div style={{ width: 100, display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, fontWeight: ax.dominant === ax.right ? 800 : 400, color: ax.dominant === ax.right ? C.ink : C.inkMute, width: 12 }}>{ax.right}</span>
                  <div style={{ flex: 1, height: 6, background: C.bone, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${ax.pct[ax.right as keyof typeof ax.pct]}%`, height: '100%', background: C.orange, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10, color: C.inkMute, width: 28 }}>{ax.pct[ax.right as keyof typeof ax.pct]}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Intake */}
          {r.intake && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Geist Mono',monospace", marginBottom: 10 }}>Intake</div>
              {r.intake.age && <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 5 }}>Age: <b style={{ color: C.ink }}>{r.intake.age}</b></div>}
              {r.intake.education && <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 5 }}>Education: <b style={{ color: C.ink }}>{r.intake.education}</b></div>}
              {r.intake.country && <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 5 }}>Country: <b style={{ color: C.ink }}>{r.intake.country}</b></div>}
            </div>
          )}

          {/* Session meta */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Geist Mono',monospace", marginBottom: 10 }}>Session</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>ID: {r.sessionId.slice(0, 20)}…</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>Answers: {r.answersCount} / 94</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute }}>Started: {fmt(r.createdAt)}</div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function AdminResultsPage() {
  const [tab, setTab] = useState<Tab>('results');
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAdminToken();
      const res = await fetch('/api/admin/results', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json() as { results: ResultRow[] };
      setResults(data.results);
    } catch {
      setError('Could not load results. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const tabs: { key: Tab; label: string; table: string }[] = [
    { key: 'results',  label: 'Table B', table: 'Assessment Results' },
    { key: 'research', label: 'Table C', table: 'Research Dataset'   },
  ];

  const researchRows = results.filter(r => r.intake);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>Results</h1>
          <p style={{ fontSize: 13, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>
            {loading ? 'Loading…' : `${results.length} completed · scored in real-time`}
          </p>
        </div>
        <button onClick={load} disabled={loading} style={{
          padding: '9px 18px', borderRadius: 12, border: `1.5px solid ${C.line}`,
          background: 'white', color: C.inkSoft, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'inherit', transition: 'all .15s',
        }}>
          {loading ? 'Refreshing…' : '↻ Refresh'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(tb => {
          const active = tab === tb.key;
          return (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{
              padding: '8px 16px', borderRadius: 12, fontSize: 13, cursor: 'pointer',
              border: `1.5px solid ${active ? C.orangeHot : C.line}`,
              background: active ? 'rgba(255,149,64,0.10)' : 'white',
              color: active ? C.orangeHot : C.inkSoft,
              fontFamily: 'inherit', fontWeight: active ? 700 : 400,
              transition: 'all .15s',
            }}>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700, color: active ? C.orangeHot : C.inkMute, marginRight: 8 }}>{tb.label}</span>
              {tb.table}
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 18px', borderRadius: 12, background: 'rgba(255,90,90,0.08)', border: `1px solid rgba(255,90,90,0.2)`, color: C.coral, fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Table card */}
      <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>

          {/* ── TABLE B: Assessment Results ── */}
          {tab === 'results' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  <TH w={70}>code</TH>
                  <TH w={90}>type</TH>
                  <TH>E / I</TH>
                  <TH>S / N</TH>
                  <TH>F / T</TH>
                  <TH>J / P</TH>
                  <TH w={170}>completed</TH>
                  <TH w={40}>{''}</TH>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} style={{ padding: '64px 32px', textAlign: 'center', color: C.inkMute, fontSize: 13 }}>Loading…</td></tr>
                )}
                {!loading && results.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '72px 32px', textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 8 }}>No completed tests yet</div>
                      <div style={{ fontSize: 13, color: C.inkMute }}>Completed results will appear here once someone finishes the assessment.</div>
                    </td>
                  </tr>
                )}
                {results.map(r => {
                  const isOpen = expanded === r.sessionId;
                  return (
                    <>
                      <tr
                        key={r.sessionId}
                        onClick={() => setExpanded(isOpen ? null : r.sessionId)}
                        onMouseEnter={e => (e.currentTarget.style.background = C.bone)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        style={{ cursor: 'pointer', transition: 'background .1s' }}
                      >
                        <TD>
                          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 15, fontWeight: 800, letterSpacing: '0.08em', color: C.ink }}>{r.code}</span>
                        </TD>
                        <TD><TypeBadge type={r.type} /></TD>
                        <TD>
                          <AxisBar label={r.type[0]} pct={r.pct[r.type[0] as 'E' | 'I']} color={C.violet} />
                        </TD>
                        <TD>
                          <AxisBar label={r.type[1]} pct={r.pct[r.type[1] as 'S' | 'N']} color={C.violet} />
                        </TD>
                        <TD>
                          <AxisBar label={r.type[2]} pct={r.pct[r.type[2] as 'F' | 'T']} color={C.violet} />
                        </TD>
                        <TD>
                          <AxisBar label={r.type[3]} pct={r.pct[r.type[3] as 'J' | 'P']} color={C.violet} />
                        </TD>
                        <TD mono muted>{r.completedAt ? fmt(r.completedAt) : '—'}</TD>
                        <TD>
                          <span style={{ color: C.inkMute, fontSize: 16, display: 'block', textAlign: 'center', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
                        </TD>
                      </tr>
                      {isOpen && <ExpandedRow key={`${r.sessionId}-exp`} r={r} />}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* ── TABLE C: Research Dataset ── */}
          {tab === 'research' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
              <thead>
                <tr>
                  <TH w={70}>code</TH>
                  <TH w={90}>type</TH>
                  <TH>age</TH>
                  <TH>education</TH>
                  <TH>country</TH>
                  <TH>E</TH><TH>I</TH><TH>S</TH><TH>N</TH><TH>F</TH><TH>T</TH><TH>J</TH><TH>P</TH>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={13} style={{ padding: '64px 32px', textAlign: 'center', color: C.inkMute, fontSize: 13 }}>Loading…</td></tr>
                )}
                {!loading && researchRows.length === 0 && (
                  <tr>
                    <td colSpan={13} style={{ padding: '72px 32px', textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 8 }}>No research data yet</div>
                      <div style={{ fontSize: 13, color: C.inkMute }}>Participants who fill in the optional intake fields will appear here.</div>
                    </td>
                  </tr>
                )}
                {researchRows.map(r => (
                  <tr key={r.sessionId}
                    onMouseEnter={e => (e.currentTarget.style.background = C.bone)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    style={{ transition: 'background .1s' }}
                  >
                    <TD><span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 15, fontWeight: 800, letterSpacing: '0.08em' }}>{r.code}</span></TD>
                    <TD><TypeBadge type={r.type} /></TD>
                    <TD mono>{r.intake?.age ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                    <TD>{r.intake?.education ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                    <TD>{r.intake?.country ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                    {(['E','I','S','N','F','T','J','P'] as const).map(k => (
                      <TD key={k} mono muted>{r.scores[k] ?? 0}</TD>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 20px', borderTop: `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: "'Geist Mono', monospace", fontSize: 11, color: C.inkMute,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block', flexShrink: 0 }} />
          {tab === 'results' && `${results.length} completed result${results.length !== 1 ? 's' : ''} · live from Redis`}
          {tab === 'research' && `${researchRows.length} participants with research data`}
        </div>
      </div>
    </div>
  );
}
