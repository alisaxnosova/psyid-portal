'use client';

import { useState, useEffect } from 'react';
import { useAdminLang } from '@/lib/adminLang';

const C = {
  ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8',
  line: '#E5DED2', bone: '#F6F1EA',
  orange: '#FF7A3D', orangeHot: '#FF9540',
  green: '#1DA36A', coral: '#FF5A5A', blue: '#2244E0',
};

const CODES_KEY = 'psyid_admin_codes';

interface AccessCode {
  id: string;
  code: string;
  status: 'UNUSED' | 'USED';
  invoice_ref: string | null;
  note: string | null;
  created_at: string;
  used_at: string | null;
}

type Tab = 'codes' | 'users' | 'results' | 'research';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function shortId(id: string) {
  return id.slice(0, 8) + '…';
}

function TH({ children, width }: { children: React.ReactNode; width?: number | string }) {
  return (
    <th style={{
      padding: '11px 16px', textAlign: 'left',
      fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700,
      color: C.inkMute, textTransform: 'uppercase', letterSpacing: '0.10em',
      background: C.bone, borderBottom: `1px solid ${C.line}`,
      whiteSpace: 'nowrap', width,
    }}>{children}</th>
  );
}

function TD({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td style={{
      padding: '13px 16px', fontSize: mono ? 12 : 13,
      color: mono ? C.inkMute : C.ink,
      fontFamily: mono ? "'Geist Mono', monospace" : 'inherit',
      borderBottom: `1px solid ${C.bone}`,
      whiteSpace: 'nowrap',
    }}>{children}</td>
  );
}

function ComingSoonTable({ columns }: { columns: string[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
      <thead>
        <tr>{columns.map(c => <TH key={c}>{c}</TH>)}</tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan={columns.length} style={{ padding: '72px 32px', textAlign: 'center' }}>
            <div style={{ maxWidth: 380, margin: '0 auto' }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'rgba(255,149,64,0.08)', margin: '0 auto 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2a8 8 0 100 16A8 8 0 0010 2zm0 4.5V11m0 3v.5" stroke={C.orangeHot} strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 8 }}>New endpoint coming soon</div>
              <div style={{ fontSize: 13, color: C.inkMute, lineHeight: 1.6 }}>
                This table will connect to the new backend API. Building out fresh — no legacy endpoints.
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default function AdminDatabasePage() {
  const { lang } = useAdminLang();
  const [tab, setTab] = useState<Tab>('codes');
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const raw = localStorage.getItem(CODES_KEY);
    if (raw) {
      try { setCodes(JSON.parse(raw)); } catch { setCodes([]); }
    }
  }, []);

  // Re-read when tab switches to codes (picks up newly generated ones)
  useEffect(() => {
    if (tab !== 'codes') return;
    const raw = localStorage.getItem(CODES_KEY);
    if (raw) {
      try { setCodes(JSON.parse(raw)); } catch { setCodes([]); }
    }
  }, [tab]);

  const filteredCodes = codes.filter(c =>
    !search ||
    c.code.includes(search) ||
    (c.invoice_ref ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.note ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const unusedCount = codes.filter(c => c.status === 'UNUSED').length;
  const usedCount   = codes.filter(c => c.status === 'USED').length;

  const tabs: { key: Tab; label: string; table: string; count?: number }[] = [
    { key: 'codes',    label: 'Table D', table: 'Access Codes',        count: codes.length  },
    { key: 'users',    label: 'Table A', table: 'Users'                                      },
    { key: 'results',  label: 'Table B', table: 'Assessment Results'                         },
    { key: 'research', label: 'Table C', table: 'Research Dataset'                           },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>
            Database
          </h1>
          <p style={{ fontSize: 13, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>
            {`${codes.length} codes · ${unusedCount} unused · ${usedCount} used`}
          </p>
        </div>
        {tab === 'codes' && (
          <input
            placeholder="Search codes, invoice, note…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${C.line}`,
              fontSize: 14, color: C.ink, background: 'white', width: 260, outline: 'none',
              fontFamily: 'inherit',
            }}
          />
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map(tb => {
          const active = tab === tb.key;
          return (
            <button key={tb.key} onClick={() => { setTab(tb.key); setSearch(''); }} style={{
              padding: '8px 16px', borderRadius: 12, fontSize: 13, cursor: 'pointer',
              border: `1.5px solid ${active ? C.orangeHot : C.line}`,
              background: active ? 'rgba(255,149,64,0.10)' : 'white',
              color: active ? C.orangeHot : C.inkSoft,
              fontFamily: 'inherit', fontWeight: active ? 700 : 400,
              transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700, color: active ? C.orangeHot : C.inkMute }}>
                {tb.label}
              </span>
              <span>{tb.table}</span>
              {tb.count !== undefined && (
                <span style={{
                  background: active ? 'rgba(255,149,64,0.15)' : C.bone,
                  color: active ? C.orangeHot : C.inkMute,
                  borderRadius: 999, padding: '1px 7px',
                  fontSize: 11, fontWeight: 700,
                  fontFamily: "'Geist Mono', monospace",
                }}>
                  {tb.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table card */}
      <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>

          {/* ── TABLE D: Access Codes ── */}
          {tab === 'codes' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr>
                  <TH width={90}>code_id</TH>
                  <TH width={100}>code</TH>
                  <TH width={120}>status</TH>
                  <TH width={200}>invoice_ref</TH>
                  <TH width={200}>note</TH>
                  <TH width={170}>created_at</TH>
                  <TH>used_at</TH>
                </tr>
              </thead>
              <tbody>
                {filteredCodes.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: '64px 32px', textAlign: 'center' }}>
                      <div style={{ maxWidth: 360, margin: '0 auto' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 8 }}>
                          {search ? 'No codes match your search' : 'No access codes yet'}
                        </div>
                        <div style={{ fontSize: 13, color: C.inkMute, lineHeight: 1.6 }}>
                          {search
                            ? 'Try a different search term.'
                            : 'Go to Access Codes in the sidebar to generate your first code.'
                          }
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
                {filteredCodes.map(c => (
                  <tr key={c.id}
                    onMouseEnter={e => (e.currentTarget.style.background = C.bone)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    style={{ transition: 'background .1s' }}
                  >
                    <TD mono>{shortId(c.id)}</TD>
                    <TD>
                      <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 16, fontWeight: 800, letterSpacing: '0.08em', color: C.ink }}>
                        {c.code}
                      </span>
                    </TD>
                    <TD>
                      <span style={{
                        padding: '3px 10px', borderRadius: 999,
                        background: c.status === 'USED' ? C.bone : 'rgba(255,149,64,0.12)',
                        color: c.status === 'USED' ? C.inkMute : C.orangeHot,
                        fontSize: 11, fontWeight: 700,
                        fontFamily: "'Geist Mono', monospace",
                      }}>
                        {c.status}
                      </span>
                    </TD>
                    <TD>{c.invoice_ref || <span style={{ color: C.inkMute }}>—</span>}</TD>
                    <TD>{c.note || <span style={{ color: C.inkMute }}>—</span>}</TD>
                    <TD mono>{formatDate(c.created_at)}</TD>
                    <TD mono>{c.used_at ? formatDate(c.used_at) : <span style={{ color: C.inkMute }}>—</span>}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── TABLE A: Users ── */}
          {tab === 'users' && (
            <ComingSoonTable columns={['user_id', 'name', 'email', 'account', 'tests', 'completed', 'joined']} />
          )}

          {/* ── TABLE B: Assessment Results ── */}
          {tab === 'results' && (
            <ComingSoonTable columns={['result_id', 'user_id', 'user', 'personality_type', 'status', 'test_start', 'test_end']} />
          )}

          {/* ── TABLE C: Research Dataset ── */}
          {tab === 'research' && (
            <ComingSoonTable columns={['research_id', 'age', 'education', 'country', 'occupation', 'language', 'research_consent', 'scores']} />
          )}

        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 20px', borderTop: `1px solid ${C.line}`,
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: "'Geist Mono', monospace", fontSize: 11, color: C.inkMute,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block', flexShrink: 0 }} />
          {tab === 'codes' && `${filteredCodes.length} row${filteredCodes.length !== 1 ? 's' : ''}${search ? ` (filtered from ${codes.length})` : ''} · stored locally`}
          {tab !== 'codes' && 'awaiting new endpoint'}
        </div>
      </div>
    </div>
  );
}
