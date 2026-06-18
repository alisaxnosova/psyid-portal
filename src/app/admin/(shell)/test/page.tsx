'use client';

import { useState, useEffect, useRef } from 'react';
import { useAdminLang, TKey } from '@/lib/adminLang';

const C = {
  ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8',
  line: '#E5DED2', bone: '#F6F1EA',
  orange: '#FF7A3D', orangeHot: '#FF9540', coral: '#FF5A5A',
  green: '#1DA36A', blue: '#2244E0',
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

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AdminCodesPage() {
  const { t, lang } = useAdminLang();

  const [codes, setCodes]         = useState<AccessCode[]>([]);
  const [invoiceRef, setInvoiceRef] = useState('');
  const [note, setNote]           = useState('');
  const [lastCode, setLastCode]   = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'UNUSED' | 'USED'>('all');
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load codes from localStorage
  useEffect(() => {
    const raw = localStorage.getItem(CODES_KEY);
    if (raw) {
      try { setCodes(JSON.parse(raw)); } catch { setCodes([]); }
    }
  }, []);

  function saveCodes(updated: AccessCode[]) {
    setCodes(updated);
    localStorage.setItem(CODES_KEY, JSON.stringify(updated));
  }

  function handleGenerate() {
    const code: AccessCode = {
      id: generateId(),
      code: generateCode(),
      status: 'UNUSED',
      invoice_ref: invoiceRef.trim() || null,
      note: note.trim() || null,
      created_at: new Date().toISOString(),
      used_at: null,
    };
    saveCodes([code, ...codes]);
    setLastCode(code.code);
    setInvoiceRef('');
    setNote('');
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setLastCode(code);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  function handleDelete(id: string) {
    saveCodes(codes.filter(c => c.id !== id));
    if (lastCode && codes.find(c => c.id === id)?.code === lastCode) setLastCode(null);
  }

  const filtered = filterStatus === 'all' ? codes : codes.filter(c => c.status === filterStatus);
  const unusedCount = codes.filter(c => c.status === 'UNUSED').length;
  const usedCount   = codes.filter(c => c.status === 'USED').length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>
          {t('codes_title')}
        </h1>
        <p style={{ fontSize: 13, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>
          {t('codes_sub')} · {codes.length} total · {unusedCount} unused · {usedCount} used
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── Generate card ── */}
        <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${C.line}`, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 18 }}>
            {t('codes_gen_heading')}
          </div>

          {/* Invoice ref */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.inkMute, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Geist Mono', monospace" }}>
              {t('codes_invoice')}
            </label>
            <input
              value={invoiceRef}
              onChange={e => setInvoiceRef(e.target.value)}
              placeholder={t('codes_invoice_ph')}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: `1.5px solid ${C.line}`, fontSize: 14, color: C.ink,
                background: C.bone, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Note */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.inkMute, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Geist Mono', monospace" }}>
              {t('codes_note')}
            </label>
            <input
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={t('codes_note_ph')}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: `1.5px solid ${C.line}`, fontSize: 14, color: C.ink,
                background: C.bone, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleGenerate} style={{
              flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: C.orangeHot, color: 'white',
              fontSize: 14, fontWeight: 800, fontFamily: 'inherit',
              transition: 'opacity .15s',
            }}>
              {t('codes_gen_btn')}
            </button>
            <a href="/start" target="_blank" rel="noopener noreferrer" style={{
              padding: '12px 16px', borderRadius: 12,
              border: `1.5px solid ${C.line}`, color: C.inkSoft,
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
              display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
              transition: 'border-color .15s',
            }}>
              {t('codes_open_test')}
            </a>
          </div>

          {/* Generated code display */}
          {lastCode && (
            <div style={{
              marginTop: 20, padding: '16px 20px', borderRadius: 14,
              background: 'rgba(255,149,64,0.08)', border: `1.5px solid rgba(255,149,64,0.25)`,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.orangeHot, letterSpacing: '0.10em', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace", marginBottom: 8 }}>
                Latest Code
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 32, fontWeight: 900, color: C.ink, letterSpacing: '0.12em' }}>
                  {lastCode}
                </span>
                <button onClick={() => handleCopy(lastCode)} style={{
                  padding: '8px 14px', borderRadius: 10, border: `1.5px solid ${C.line}`,
                  background: copied ? C.green : 'white', color: copied ? 'white' : C.inkSoft,
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all .15s',
                }}>
                  {copied ? t('codes_copied') : t('codes_copy')}
                </button>
              </div>
            </div>
          )}

          {/* Local storage note */}
          <div style={{ marginTop: 16, display: 'flex', gap: 6, alignItems: 'flex-start' }}>
            <div style={{ width: 14, height: 14, flexShrink: 0, marginTop: 1 }}>
              <svg viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke={C.inkMute} strokeWidth="1.2"/><path d="M7 4.5V7.5m0 2v.4" stroke={C.inkMute} strokeWidth="1.2" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontSize: 11, color: C.inkMute, lineHeight: 1.5 }}>
              {t('codes_local_note')}
            </span>
          </div>
        </div>

        {/* ── Codes list ── */}
        <div>
          {/* Filter pills */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {([
              { key: 'all' as const,    label: `All (${codes.length})`          },
              { key: 'UNUSED' as const, label: `${t('codes_unused')} (${unusedCount})` },
              { key: 'USED' as const,   label: `${t('codes_used')} (${usedCount})`     },
            ]).map(f => {
              const active = filterStatus === f.key;
              return (
                <button key={f.key} onClick={() => setFilterStatus(f.key)} style={{
                  padding: '7px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', border: '1.5px solid',
                  borderColor: active ? C.orangeHot : C.line,
                  background: active ? 'rgba(255,149,64,0.10)' : 'white',
                  color: active ? C.orangeHot : C.inkSoft,
                  fontFamily: 'inherit', transition: 'all .15s',
                }}>
                  {f.label}
                </button>
              );
            })}
          </div>

          <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '52px 32px', textAlign: 'center', color: C.inkMute, fontSize: 14 }}>
                {t('codes_none')}
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {(['codes_col_code', 'codes_col_status', 'codes_col_invoice', 'codes_col_note', 'codes_col_created', 'codes_col_used', ''] as (TKey | '')[]).map((k, i) => (
                      <th key={i} style={{
                        padding: '11px 16px', textAlign: 'left',
                        fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700,
                        color: C.inkMute, textTransform: 'uppercase', letterSpacing: '0.10em',
                        background: C.bone, borderBottom: `1px solid ${C.line}`, whiteSpace: 'nowrap',
                      }}>
                        {k ? t(k as TKey) : ''}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}
                      onMouseEnter={e => (e.currentTarget.style.background = C.bone)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      style={{ transition: 'background .1s' }}
                    >
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.bone}` }}>
                        <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 18, fontWeight: 900, letterSpacing: '0.10em', color: C.ink }}>
                          {c.code}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.bone}` }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 999,
                          background: c.status === 'USED' ? C.bone : 'rgba(255,149,64,0.12)',
                          color: c.status === 'USED' ? C.inkMute : C.orangeHot,
                          fontSize: 11, fontWeight: 700,
                          fontFamily: "'Geist Mono', monospace",
                        }}>
                          {c.status === 'USED' ? t('codes_used') : t('codes_unused')}
                        </span>
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: C.inkSoft, borderBottom: `1px solid ${C.bone}` }}>
                        {c.invoice_ref || <span style={{ color: C.inkMute }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 13, color: C.inkSoft, borderBottom: `1px solid ${C.bone}` }}>
                        {c.note || <span style={{ color: C.inkMute }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: C.inkMute, fontFamily: "'Geist Mono', monospace", borderBottom: `1px solid ${C.bone}`, whiteSpace: 'nowrap' }}>
                        {formatDate(c.created_at)}
                      </td>
                      <td style={{ padding: '13px 16px', fontSize: 12, color: C.inkMute, fontFamily: "'Geist Mono', monospace", borderBottom: `1px solid ${C.bone}`, whiteSpace: 'nowrap' }}>
                        {c.used_at ? formatDate(c.used_at) : <span style={{ color: C.inkMute }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.bone}` }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => handleCopy(c.code)} style={{
                            padding: '5px 10px', borderRadius: 8, border: `1px solid ${C.line}`,
                            background: 'transparent', color: C.inkMute, fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit',
                          }}>
                            {t('codes_copy')}
                          </button>
                          <button onClick={() => handleDelete(c.id)} style={{
                            padding: '5px 10px', borderRadius: 8, border: `1px solid rgba(255,90,90,0.2)`,
                            background: 'transparent', color: C.coral, fontSize: 11, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit',
                          }}>
                            {t('codes_del')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
