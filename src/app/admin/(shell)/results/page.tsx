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

interface Intake {
  consent: boolean;
  age?: number;
  sex?: string;
  country?: string;
  nativeLanguage?: string;
  education?: string;
  occupation?: string;
  employmentStatus?: string;
  relationshipStatus?: string;
}

interface ResultRow {
  sessionId: string;
  codeId: string;
  code: string;
  status: string;
  device: 'mobile' | 'desktop' | 'unknown';
  type: string;
  nearBoundary: string[];
  pct: { E: number; I: number; S: number; N: number; F: number; T: number; J: number; P: number };
  scores: Record<string, number>;
  intake: Intake | null;
  answersCount: number;
  avgResponseTimeMs: number | null;
  createdAt: string;
  completedAt: string | null;
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function ms(ms: number | null) {
  if (ms === null) return '—';
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
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
    ISTJ: C.blue,   ISFJ: C.blue,   ESTJ: C.blue,   ESFJ: C.blue,
    ISTP: C.inkSoft, ISFP: C.inkSoft, ESTP: C.inkSoft, ESFP: C.inkSoft,
  };
  const bg = colors[type] ?? C.inkMute;
  return (
    <span style={{
      display: 'inline-block', padding: '4px 10px', borderRadius: 8,
      background: bg, color: 'white',
      fontFamily: "'Geist Mono', monospace", fontSize: 13, fontWeight: 800,
      letterSpacing: '0.05em',
    }}>{type}</span>
  );
}

function DeviceBadge({ device }: { device: string }) {
  const icon = device === 'mobile' ? '📱' : device === 'desktop' ? '🖥' : '?';
  return (
    <span style={{ fontSize: 12, color: C.inkMute, fontFamily: "'Geist Mono', monospace" }}>
      {icon} {device}
    </span>
  );
}

function NearBoundaryPills({ axes }: { axes: string[] }) {
  if (!axes.length) return <span style={{ color: C.inkMute, fontSize: 11 }}>—</span>;
  return (
    <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {axes.map(a => (
        <span key={a} style={{
          padding: '2px 6px', borderRadius: 5, fontSize: 10, fontWeight: 700,
          background: 'rgba(255,149,64,0.15)', color: C.orangeHot,
          fontFamily: "'Geist Mono', monospace",
        }}>{a}</span>
      ))}
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

function IntakeField({ label, value }: { label: string; value?: string | number }) {
  if (!value) return null;
  return (
    <div style={{ fontSize: 13, color: C.inkSoft, marginBottom: 5 }}>
      {label}: <b style={{ color: C.ink }}>{value}</b>
    </div>
  );
}

function ExpandedRow({ r }: { r: ResultRow }) {
  const axes = [
    { left: 'E' as const, right: 'I' as const },
    { left: 'S' as const, right: 'N' as const },
    { left: 'F' as const, right: 'T' as const },
    { left: 'J' as const, right: 'P' as const },
  ];

  return (
    <tr>
      <td colSpan={11} style={{ background: '#FAFAF9', borderBottom: `1px solid ${C.line}`, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>

          {/* Axis scores */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Geist Mono',monospace", marginBottom: 10 }}>Axis Scores</div>
            {axes.map(ax => (
              <div key={ax.left} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                <div style={{ width: 100, display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, fontWeight: r.type.includes(ax.left) ? 800 : 400, color: r.type.includes(ax.left) ? C.ink : C.inkMute, width: 12 }}>{ax.left}</span>
                  <div style={{ flex: 1, height: 6, background: C.bone, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${r.pct[ax.left]}%`, height: '100%', background: C.violet, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10, color: C.inkMute, width: 28 }}>{r.pct[ax.left]}%</span>
                </div>
                <span style={{ color: C.inkMute, fontSize: 10 }}>vs</span>
                <div style={{ width: 100, display: 'flex', gap: 4, alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 11, fontWeight: r.type.includes(ax.right) ? 800 : 400, color: r.type.includes(ax.right) ? C.ink : C.inkMute, width: 12 }}>{ax.right}</span>
                  <div style={{ flex: 1, height: 6, background: C.bone, borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${r.pct[ax.right]}%`, height: '100%', background: C.orange, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 10, color: C.inkMute, width: 28 }}>{r.pct[ax.right]}%</span>
                </div>
              </div>
            ))}
          </div>

          {/* Intake demographics */}
          {r.intake && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Geist Mono',monospace", marginBottom: 10 }}>Demographics</div>
              <IntakeField label="Age"                value={r.intake.age} />
              <IntakeField label="Sex"                value={r.intake.sex} />
              <IntakeField label="Country"            value={r.intake.country} />
              <IntakeField label="Native language"    value={r.intake.nativeLanguage} />
              <IntakeField label="Education"          value={r.intake.education} />
              <IntakeField label="Occupation"         value={r.intake.occupation} />
              <IntakeField label="Employment"         value={r.intake.employmentStatus} />
              <IntakeField label="Relationship"       value={r.intake.relationshipStatus} />
            </div>
          )}

          {/* Session meta */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Geist Mono',monospace", marginBottom: 10 }}>Session</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>ID: {r.sessionId.slice(0, 22)}…</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>Answers: {r.answersCount} / 94</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>Avg response: {ms(r.avgResponseTimeMs)}</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>Device: {r.device}</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute }}>Started: {fmt(r.createdAt)}</div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function AdminResultsPage() {
  const [tab, setTab]           = useState<Tab>('results');
  const [results, setResults]   = useState<ResultRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const deleteResult = useCallback(async (sessionId: string) => {
    if (!confirm('Delete this result permanently? This cannot be undone.')) return;
    setDeleting(sessionId);
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/results/${sessionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`${res.status}`);
      setResults(prev => prev.filter(r => r.sessionId !== sessionId));
      if (expanded === sessionId) setExpanded(null);
    } catch {
      alert('Failed to delete. Try again.');
    } finally {
      setDeleting(null);
    }
  }, [expanded]);

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
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr>
                  <TH w={70}>code</TH>
                  <TH w={90}>type</TH>
                  <TH>E / I</TH>
                  <TH>S / N</TH>
                  <TH>F / T</TH>
                  <TH>J / P</TH>
                  <TH w={110}>near boundary</TH>
                  <TH w={90}>device</TH>
                  <TH w={160}>completed</TH>
                  <TH w={40}>{''}</TH>
                  <TH w={40}>{''}</TH>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={11} style={{ padding: '64px 32px', textAlign: 'center', color: C.inkMute, fontSize: 13 }}>Loading…</td></tr>
                )}
                {!loading && results.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ padding: '72px 32px', textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 8 }}>No completed tests yet</div>
                      <div style={{ fontSize: 13, color: C.inkMute }}>Results will appear here once someone finishes the assessment.</div>
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
                        <TD><AxisBar label={r.type[0]} pct={r.pct[r.type[0] as 'E' | 'I']} color={C.violet} /></TD>
                        <TD><AxisBar label={r.type[1]} pct={r.pct[r.type[1] as 'S' | 'N']} color={C.violet} /></TD>
                        <TD><AxisBar label={r.type[2]} pct={r.pct[r.type[2] as 'F' | 'T']} color={C.violet} /></TD>
                        <TD><AxisBar label={r.type[3]} pct={r.pct[r.type[3] as 'J' | 'P']} color={C.violet} /></TD>
                        <TD><NearBoundaryPills axes={r.nearBoundary} /></TD>
                        <TD><DeviceBadge device={r.device} /></TD>
                        <TD mono muted>{r.completedAt ? fmt(r.completedAt) : '—'}</TD>
                        <TD>
                          <span style={{ color: C.inkMute, fontSize: 16, display: 'block', textAlign: 'center', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span>
                        </TD>
                        <TD>
                          <button
                            onClick={e => { e.stopPropagation(); deleteResult(r.sessionId); }}
                            disabled={deleting === r.sessionId}
                            title="Delete result"
                            style={{
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              width: 28, height: 28, borderRadius: 7, border: 'none',
                              background: 'transparent', cursor: deleting === r.sessionId ? 'not-allowed' : 'pointer',
                              color: C.inkMute, transition: 'all .15s', padding: 0,
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = C.coral, e.currentTarget.style.background = 'rgba(255,90,90,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.color = C.inkMute, e.currentTarget.style.background = 'transparent')}
                          >
                            {deleting === r.sessionId
                              ? <span style={{ fontSize: 10 }}>…</span>
                              : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5.5 6v4M8.5 6v4M3 3.5l.7 7.3a1 1 0 001 .7h4.6a1 1 0 001-.7L11 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            }
                          </button>
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
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
              <thead>
                <tr>
                  <TH w={70}>code</TH>
                  <TH w={80}>type</TH>
                  <TH>age</TH>
                  <TH>sex</TH>
                  <TH>country</TH>
                  <TH>language</TH>
                  <TH>education</TH>
                  <TH>employment</TH>
                  <TH>relationship</TH>
                  <TH>occupation</TH>
                  <TH>avg resp</TH>
                  <TH>device</TH>
                  <TH>E</TH><TH>I</TH><TH>S</TH><TH>N</TH><TH>F</TH><TH>T</TH><TH>J</TH><TH>P</TH>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={20} style={{ padding: '64px 32px', textAlign: 'center', color: C.inkMute, fontSize: 13 }}>Loading…</td></tr>
                )}
                {!loading && researchRows.length === 0 && (
                  <tr>
                    <td colSpan={20} style={{ padding: '72px 32px', textAlign: 'center' }}>
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
                    <TD><span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, fontWeight: 800, letterSpacing: '0.08em' }}>{r.code}</span></TD>
                    <TD><TypeBadge type={r.type} /></TD>
                    <TD mono>{r.intake?.age ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                    <TD>{r.intake?.sex ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                    <TD>{r.intake?.country ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                    <TD>{r.intake?.nativeLanguage ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                    <TD>{r.intake?.education ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                    <TD>{r.intake?.employmentStatus ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                    <TD>{r.intake?.relationshipStatus ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                    <TD>{r.intake?.occupation ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                    <TD mono muted>{ms(r.avgResponseTimeMs)}</TD>
                    <TD mono muted>{r.device}</TD>
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
          {tab === 'results'  && `${results.length} completed result${results.length !== 1 ? 's' : ''} · live from Redis`}
          {tab === 'research' && `${researchRows.length} participant${researchRows.length !== 1 ? 's' : ''} with research data`}
        </div>
      </div>
    </div>
  );
}
