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
  violet: '#8A5CD6', purple: '#7B3FBE',
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

interface AxisV12 {
  code: string;      // EO | IF | DB | SP | ER
  position: number;  // 0..100 (100 = plus pole)
  band: number;      // 0..5
  poleLetter: string;// e.g. O / W, or — when balanced
  signature: string; // e.g. O4, or — when balanced
}

interface ResultRow {
  sessionId: string;
  codeId: string;
  code: string;
  participantId: string | null;
  userName: string | null;
  invoiceRef: string | null;
  status: string;
  device: 'mobile' | 'desktop' | 'unknown';
  schema: 'v1.0' | 'v1.2';
  type: string;
  signature?: string;
  axesV12?: AxisV12[];
  nearBoundary: string[];
  pct: { E: number; I: number; S: number; N: number; F: number; T: number; J: number; P: number };
  scores: Record<string, number>;
  intake: Intake | null;
  answersCount: number;
  avgResponseTimeMs: number | null;
  createdAt: string;
  completedAt: string | null;
}

const AX_META: Record<string, { name: string; short: string; color: string }> = {
  EO: { name: 'Energy',      short: 'EO', color: '#2244E0' },
  IF: { name: 'Information', short: 'IF', color: '#6A85F0' },
  DB: { name: 'Decision',    short: 'DB', color: '#8A5CD6' },
  SP: { name: 'Structure',   short: 'SP', color: '#FF7A3D' },
  ER: { name: 'Emotional',   short: 'ER', color: '#FF5A5A' },
};

function ParticipantBadge({ id }: { id: string | null }) {
  if (!id) return <span style={{ color: '#8A8FA8', fontSize: 11, fontFamily: "'Geist Mono',monospace" }}>—</span>;
  const color = id.startsWith('P') ? '#2244E0' : '#FF7A3D';
  return <span style={{ fontFamily: "'Geist Mono',monospace", fontSize: 12, fontWeight: 800, color }}>{id}</span>;
}

function SignatureCells({ axes }: { axes: AxisV12[] }) {
  return (
    <span style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {axes.map(a => {
        const meta = AX_META[a.code];
        const balanced = a.signature === '—';
        return (
          <span key={a.code} title={`${meta?.name ?? a.code} · ${a.position}/100`} style={{
            padding: '2px 7px', borderRadius: 6, fontSize: 11, fontWeight: 800,
            fontFamily: "'Geist Mono',monospace",
            background: balanced ? '#F6F1EA' : `${meta?.color}18`,
            color: balanced ? '#8A8FA8' : meta?.color,
            border: `1px solid ${balanced ? '#E5DED2' : `${meta?.color}40`}`,
          }}>{a.signature}</span>
        );
      })}
    </span>
  );
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

// Test-taker identity: prefer the attached name, fall back to the Etsy invoice /
// reference, and only show the raw code when neither is set.
function takerLabel(r: Pick<ResultRow, 'userName' | 'invoiceRef' | 'code'>): string {
  return r.userName?.trim() || r.invoiceRef?.trim() || r.code;
}

function TakerCell({ r }: { r: ResultRow }) {
  const label = takerLabel(r);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: C.ink, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
      {label !== r.code && (
        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: C.inkMute }}>{r.code}</span>
      )}
    </div>
  );
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

type ReportLang = 'ru' | 'en' | 'es' | 'fr' | 'ar';
const REPORT_LANGS: ReportLang[] = ['ru', 'en', 'es', 'fr', 'ar'];

function ExpandedRow({ r }: { r: ResultRow }) {
  const [reportLang, setReportLang] = useState<ReportLang>('en');
  const [narrative, setNarrative]   = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [genError, setGenError]     = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);

  // Career Compass state
  const [compassLoading, setCompassLoading]       = useState(false);
  const [compassReady, setCompassReady]           = useState(false);
  const [compassError, setCompassError]           = useState('');
  const [compassPdfLoading, setCompassPdfLoading] = useState(false);

  const generateCompass = async (force = false) => {
    setCompassLoading(true);
    setCompassError('');
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/sessions/${r.sessionId}/career-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ force }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { detail?: string; error?: string };
        throw new Error(body.detail ?? body.error ?? `HTTP ${res.status}`);
      }
      setCompassReady(true);
    } catch (e) {
      setCompassError((e as Error).message);
    } finally {
      setCompassLoading(false);
    }
  };

  const downloadCareerPdf = async () => {
    setCompassPdfLoading(true);
    setCompassError('');
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/sessions/${r.sessionId}/career-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { detail?: string; error?: string };
        throw new Error(body.detail ?? body.error ?? `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `career-compass-${r.code}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setCompassError((e as Error).message);
    } finally {
      setCompassPdfLoading(false);
    }
  };

  // Check on mount if a report already exists
  useEffect(() => {
    const token = getAdminToken();
    fetch(`/api/admin/sessions/${r.sessionId}/career-report`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then((d: { exists?: boolean }) => { if (d.exists) setCompassReady(true); })
      .catch(() => {});
  }, [r.sessionId]);

  const generateReport = async () => {
    setGenLoading(true);
    setGenError('');
    try {
      const token = getAdminToken();
      const res = await fetch(`/api/admin/sessions/${r.sessionId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lang: reportLang }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { narrative: string };
      setNarrative(data.narrative);
    } catch (e) {
      setGenError((e as Error).message);
    } finally {
      setGenLoading(false);
    }
  };

  const downloadPdf = async () => {
    if (!narrative) return;
    setPdfLoading(true);
    try {
      const { pdf } = await import('@react-pdf/renderer');
      const { default: RenoReport } = await import('@/components/pdf/RenoReport');
      const blob = await pdf(
        <RenoReport
          mbtiType={r.type}
          narrative={narrative}
          codeRef={r.code}
          date={r.completedAt ? new Date(r.completedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
          lang={reportLang}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `psyid-report-${r.type}-${r.code}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('PDF generation failed: ' + (e as Error).message);
    } finally {
      setPdfLoading(false);
    }
  };

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
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>Taker: {takerLabel(r)}</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>Code: {r.code}{r.invoiceRef ? ` · ${r.invoiceRef}` : ''}</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>ID: {r.sessionId.slice(0, 22)}…</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>Answers: {r.answersCount} / 94</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>Avg response: {ms(r.avgResponseTimeMs)}</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>Device: {r.device}</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute }}>Started: {fmt(r.createdAt)}</div>
          </div>

          {/* Report generation */}
          <div style={{ flex: '1 1 320px', maxWidth: 480 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Geist Mono',monospace", marginBottom: 10 }}>AI Report</div>

            {/* Language */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
              {REPORT_LANGS.map(l => {
                const active = l === reportLang;
                return (
                  <button key={l} onClick={() => { setReportLang(l); setNarrative(''); }} style={{
                    padding: '5px 10px', borderRadius: 7, border: '1.5px solid',
                    borderColor: active ? C.orangeHot : C.line,
                    background: active ? 'rgba(255,149,64,0.10)' : 'white',
                    color: active ? C.orangeHot : C.inkSoft,
                    fontSize: 11, fontWeight: 700, fontFamily: "'Geist Mono',monospace",
                    cursor: 'pointer', transition: 'all .12s',
                  }}>{l.toUpperCase()}</button>
                );
              })}
            </div>

            {/* Generate / Download buttons */}
            <div style={{ display: 'flex', gap: 8, marginBottom: narrative ? 14 : 0 }}>
              <button
                onClick={e => { e.stopPropagation(); generateReport(); }}
                disabled={genLoading}
                style={{
                  padding: '8px 16px', borderRadius: 10, border: 'none',
                  background: genLoading ? C.inkMute : C.orangeHot, color: 'white',
                  fontSize: 12, fontWeight: 700, cursor: genLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'background .15s',
                }}
              >
                {genLoading ? 'Generating…' : narrative ? 'Regenerate' : 'Generate Report'}
              </button>

              {narrative && (
                <button
                  onClick={e => { e.stopPropagation(); downloadPdf(); }}
                  disabled={pdfLoading}
                  style={{
                    padding: '8px 16px', borderRadius: 10,
                    border: `1.5px solid ${C.blue}`,
                    background: 'rgba(34,68,224,0.08)', color: C.blue,
                    fontSize: 12, fontWeight: 700, cursor: pdfLoading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', transition: 'all .15s',
                  }}
                >
                  {pdfLoading ? 'Generating PDF…' : '↓ Download PDF'}
                </button>
              )}
            </div>

            {genError && <div style={{ fontSize: 11, color: C.coral, marginTop: 6 }}>{genError}</div>}

            {narrative && (
              <div style={{
                marginTop: 12, padding: '12px 16px', borderRadius: 12,
                background: 'white', border: `1px solid ${C.line}`,
                fontSize: 12, lineHeight: 1.65, color: C.inkSoft,
                maxHeight: 200, overflowY: 'auto',
                whiteSpace: 'pre-line',
              }}>
                {narrative}
              </div>
            )}
          </div>

          {/* ── Career Compass ── */}
          <div style={{ flex: '0 0 260px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.inkMute, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Geist Mono',monospace", marginBottom: 10 }}>Career Compass</div>
            <div style={{ fontSize: 11, color: C.inkMute, marginBottom: 10, lineHeight: 1.5 }}>
              20-page visual report — AI-generated per session.
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={e => { e.stopPropagation(); generateCompass(false); }}
                disabled={compassLoading}
                style={{
                  padding: '8px 14px', borderRadius: 10, border: 'none',
                  background: compassLoading ? C.inkMute : (compassReady ? C.green : C.violet),
                  color: 'white', fontSize: 12, fontWeight: 700,
                  cursor: compassLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', transition: 'background .15s',
                }}
              >
                {compassLoading ? 'Generating…' : compassReady ? '✓ Generated' : 'Generate Compass'}
              </button>

              {compassReady && (
                <>
                  <a
                    href={`/results/report?session=${r.sessionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{
                      padding: '8px 14px', borderRadius: 10,
                      border: `1.5px solid ${C.violet}`,
                      background: 'rgba(138,92,214,0.08)', color: C.violet,
                      fontSize: 12, fontWeight: 700, textDecoration: 'none',
                      fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center',
                    }}
                  >
                    ↗ View
                  </a>
                  <button
                    onClick={e => { e.stopPropagation(); downloadCareerPdf(); }}
                    disabled={compassPdfLoading}
                    style={{
                      padding: '8px 14px', borderRadius: 10,
                      border: `1.5px solid ${C.blue}`,
                      background: 'rgba(34,68,224,0.08)', color: C.blue,
                      fontSize: 12, fontWeight: 700,
                      cursor: compassPdfLoading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {compassPdfLoading ? 'Generating…' : '↓ PDF'}
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); generateCompass(true); }}
                    disabled={compassLoading}
                    style={{
                      padding: '8px 14px', borderRadius: 10,
                      border: `1.5px solid ${C.line}`,
                      background: 'white', color: C.inkMute,
                      fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    ↺ Redo
                  </button>
                </>
              )}
            </div>
            {compassError && <div style={{ fontSize: 11, color: C.coral, marginTop: 6 }}>{compassError}</div>}
          </div>
        </div>
      </td>
    </tr>
  );
}

const SECTION_LABEL: React.CSSProperties = {
  fontSize: 10, fontWeight: 700, color: C.inkMute, letterSpacing: '0.1em',
  textTransform: 'uppercase', fontFamily: "'Geist Mono',monospace", marginBottom: 10,
};

function AxisPositionBar({ ax }: { ax: AxisV12 }) {
  const meta = AX_META[ax.code];
  const balanced = ax.signature === '—';
  const half = Math.abs(ax.position - 50);
  const width = (half / 50) * 50;             // 0..50 (% of full bar)
  const left = ax.position >= 50 ? 50 : 50 - width;
  return (
    <div style={{ marginBottom: 11 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>
        <span>{meta?.name ?? ax.code}</span>
        <span style={{ color: balanced ? C.inkMute : meta?.color, fontWeight: 800 }}>{ax.signature} · {ax.position}/100</span>
      </div>
      <div style={{ position: 'relative', height: 8, background: C.bone, borderRadius: 99 }}>
        <div style={{ position: 'absolute', left: '50%', top: -2, bottom: -2, width: 1.5, background: C.line }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${left}%`, width: `${width}%`, background: balanced ? C.inkMute : meta?.color, borderRadius: 99 }} />
      </div>
    </div>
  );
}

function ExpandedRowV12({ r }: { r: ResultRow }) {
  return (
    <tr>
      <td colSpan={8} style={{ background: '#FAFAF9', borderBottom: `1px solid ${C.line}`, padding: '16px 20px' }}>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', maxWidth: 440 }}>
            <div style={SECTION_LABEL}>Five axes · continuous position</div>
            {(r.axesV12 ?? []).map(ax => <AxisPositionBar key={ax.code} ax={ax} />)}
          </div>

          {r.intake && (
            <div>
              <div style={SECTION_LABEL}>Demographics</div>
              <IntakeField label="Age"             value={r.intake.age} />
              <IntakeField label="Sex"             value={r.intake.sex} />
              <IntakeField label="Country"         value={r.intake.country} />
              <IntakeField label="Native language" value={r.intake.nativeLanguage} />
              <IntakeField label="Education"       value={r.intake.education} />
              <IntakeField label="Occupation"      value={r.intake.occupation} />
              <IntakeField label="Employment"      value={r.intake.employmentStatus} />
              <IntakeField label="Relationship"    value={r.intake.relationshipStatus} />
            </div>
          )}

          <div>
            <div style={SECTION_LABEL}>Session</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>Participant: {r.participantId ?? '— (no research consent)'}</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>Type: {r.type} · {r.signature}</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>Taker: {takerLabel(r)}</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>Code: {r.code}</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>Answers: {r.answersCount} / 94</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute, marginBottom: 4 }}>Avg response: {ms(r.avgResponseTimeMs)}</div>
            <div style={{ fontSize: 12, fontFamily: "'Geist Mono',monospace", color: C.inkMute }}>Started: {fmt(r.createdAt)}</div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function AdminResultsPage() {
  const [version, setVersion]   = useState<'v12' | 'v10'>('v12');
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

  const v12Rows = results.filter(r => r.schema === 'v1.2');
  const v10Rows = results.filter(r => r.schema !== 'v1.2');
  const v12Research = v12Rows.filter(r => r.intake);
  const researchRows = v10Rows.filter(r => r.intake);

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

      {/* Version switcher — new v1.2 results vs archived v1.0 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
        {([['v12', 'ReNo v1.2', 'five-axis · live'], ['v10', 'v1.0 archive', 'legacy MBTI']] as const).map(([key, label, sub]) => {
          const active = version === key;
          return (
            <button key={key} onClick={() => setVersion(key)} style={{
              padding: '9px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
              border: `1.5px solid ${active ? C.blue : C.line}`,
              background: active ? 'rgba(34,68,224,0.07)' : 'white', transition: 'all .15s',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: active ? C.blue : C.ink }}>{label}</div>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: C.inkMute, marginTop: 1 }}>{sub}</div>
            </button>
          );
        })}
      </div>

      {version === 'v12' && (<>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(tb => {
          const active = tab === tb.key;
          return (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{
              padding: '8px 16px', borderRadius: 12, fontSize: 13, cursor: 'pointer',
              border: `1.5px solid ${active ? C.blue : C.line}`,
              background: active ? 'rgba(34,68,224,0.08)' : 'white',
              color: active ? C.blue : C.inkSoft,
              fontFamily: 'inherit', fontWeight: active ? 700 : 400, transition: 'all .15s',
            }}>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700, color: active ? C.blue : C.inkMute, marginRight: 8 }}>{tb.label}</span>
              {tb.table}
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{ padding: '12px 18px', borderRadius: 12, background: 'rgba(255,90,90,0.08)', border: `1px solid rgba(255,90,90,0.2)`, color: C.coral, fontSize: 13, marginBottom: 16 }}>{error}</div>
      )}

      <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>

          {/* ── TABLE B (v1.2): Assessment Results ── */}
          {tab === 'results' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
              <thead>
                <tr>
                  <TH w={170}>test taker</TH>
                  <TH w={100}>participant</TH>
                  <TH w={80}>type</TH>
                  <TH>signature</TH>
                  <TH w={90}>device</TH>
                  <TH w={160}>completed</TH>
                  <TH w={40}>{''}</TH>
                  <TH w={40}>{''}</TH>
                </tr>
              </thead>
              <tbody>
                {loading && (<tr><td colSpan={8} style={{ padding: '64px 32px', textAlign: 'center', color: C.inkMute, fontSize: 13 }}>Loading…</td></tr>)}
                {!loading && v12Rows.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: '72px 32px', textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 8 }}>No ReNo v1.2 results yet</div>
                    <div style={{ fontSize: 13, color: C.inkMute }}>New five-axis completions will appear here.</div>
                  </td></tr>
                )}
                {v12Rows.map(r => {
                  const isOpen = expanded === r.sessionId;
                  return (
                    <>
                      <tr key={r.sessionId}
                        onClick={() => setExpanded(isOpen ? null : r.sessionId)}
                        onMouseEnter={e => (e.currentTarget.style.background = C.bone)}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                        style={{ cursor: 'pointer', transition: 'background .1s' }}
                      >
                        <TD><TakerCell r={r} /></TD>
                        <TD><ParticipantBadge id={r.participantId} /></TD>
                        <TD><span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 8, background: C.ink, color: 'white', fontFamily: "'Geist Mono',monospace", fontSize: 13, fontWeight: 800, letterSpacing: '0.06em' }}>{r.type}</span></TD>
                        <TD>{r.axesV12 ? <SignatureCells axes={r.axesV12} /> : '—'}</TD>
                        <TD><DeviceBadge device={r.device} /></TD>
                        <TD mono muted>{r.completedAt ? fmt(r.completedAt) : '—'}</TD>
                        <TD><span style={{ color: C.inkMute, fontSize: 16, display: 'block', textAlign: 'center', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>▾</span></TD>
                        <TD>
                          <button onClick={e => { e.stopPropagation(); deleteResult(r.sessionId); }} disabled={deleting === r.sessionId} title="Delete result"
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 7, border: 'none', background: 'transparent', cursor: deleting === r.sessionId ? 'not-allowed' : 'pointer', color: C.inkMute, transition: 'all .15s', padding: 0 }}
                            onMouseEnter={e => (e.currentTarget.style.color = C.coral, e.currentTarget.style.background = 'rgba(255,90,90,0.08)')}
                            onMouseLeave={e => (e.currentTarget.style.color = C.inkMute, e.currentTarget.style.background = 'transparent')}
                          >
                            {deleting === r.sessionId ? <span style={{ fontSize: 10 }}>…</span> : <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v1M5.5 6v4M8.5 6v4M3 3.5l.7 7.3a1 1 0 001 .7h4.6a1 1 0 001-.7L11 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </button>
                        </TD>
                      </tr>
                      {isOpen && <ExpandedRowV12 key={`${r.sessionId}-exp`} r={r} />}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* ── TABLE C (v1.2): Research Dataset ── */}
          {tab === 'research' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1160 }}>
              <thead>
                <tr>
                  <TH w={150}>test taker</TH>
                  <TH w={90}>participant</TH>
                  <TH w={70}>type</TH>
                  <TH>age</TH><TH>sex</TH><TH>country</TH><TH>language</TH><TH>education</TH><TH>employment</TH><TH>relationship</TH><TH>occupation</TH>
                  <TH>EO</TH><TH>IF</TH><TH>DB</TH><TH>SP</TH><TH>ER</TH>
                </tr>
              </thead>
              <tbody>
                {loading && (<tr><td colSpan={16} style={{ padding: '64px 32px', textAlign: 'center', color: C.inkMute, fontSize: 13 }}>Loading…</td></tr>)}
                {!loading && v12Research.length === 0 && (
                  <tr><td colSpan={16} style={{ padding: '72px 32px', textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 8 }}>No research participants yet</div>
                    <div style={{ fontSize: 13, color: C.inkMute }}>Consenting takers who provide demographics appear here with a P-/E- number.</div>
                  </td></tr>
                )}
                {v12Research.map(r => {
                  const byCode = (c: string) => r.axesV12?.find(a => a.code === c);
                  return (
                    <tr key={r.sessionId}
                      onMouseEnter={e => (e.currentTarget.style.background = C.bone)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      style={{ transition: 'background .1s' }}
                    >
                      <TD><TakerCell r={r} /></TD>
                      <TD><ParticipantBadge id={r.participantId} /></TD>
                      <TD mono>{r.type}</TD>
                      <TD mono>{r.intake?.age ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                      <TD>{r.intake?.sex ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                      <TD>{r.intake?.country ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                      <TD>{r.intake?.nativeLanguage ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                      <TD>{r.intake?.education ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                      <TD>{r.intake?.employmentStatus ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                      <TD>{r.intake?.relationshipStatus ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                      <TD>{r.intake?.occupation ?? <span style={{ color: C.inkMute }}>—</span>}</TD>
                      {(['EO', 'IF', 'DB', 'SP', 'ER'] as const).map(code => {
                        const ax = byCode(code);
                        return <TD key={code} mono muted>{ax ? `${ax.signature}·${ax.position}` : '—'}</TD>;
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Geist Mono', monospace", fontSize: 11, color: C.inkMute }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block', flexShrink: 0 }} />
          {tab === 'results'  && `${v12Rows.length} five-axis result${v12Rows.length !== 1 ? 's' : ''} · scored live with ReNo v1.2`}
          {tab === 'research' && `${v12Research.length} participant${v12Research.length !== 1 ? 's' : ''} with research consent + demographics`}
        </div>
      </div>
      </>)}

      {version === 'v10' && (<>

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
                  <TH w={180}>test taker</TH>
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
                {!loading && v10Rows.length === 0 && (
                  <tr>
                    <td colSpan={11} style={{ padding: '72px 32px', textAlign: 'center' }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 8 }}>No legacy (v1.0) results</div>
                      <div style={{ fontSize: 13, color: C.inkMute }}>Old MBTI-format results live here. New five-axis results are under ReNo v1.2.</div>
                    </td>
                  </tr>
                )}
                {v10Rows.map(r => {
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
                        <TD><TakerCell r={r} /></TD>
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
                  <TH w={160}>test taker</TH>
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
                    <TD><TakerCell r={r} /></TD>
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
          {tab === 'results'  && `${v10Rows.length} legacy result${v10Rows.length !== 1 ? 's' : ''} · v1.0 archive`}
          {tab === 'research' && `${researchRows.length} participant${researchRows.length !== 1 ? 's' : ''} with research data`}
        </div>
      </div>
      </>)}
    </div>
  );
}
