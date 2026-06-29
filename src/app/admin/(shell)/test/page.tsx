'use client';

import { useState, useEffect, useRef } from 'react';
import { useAdminLang, TKey } from '@/lib/adminLang';

const C = {
  ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8',
  line: '#E5DED2', bone: '#F6F1EA',
  orange: '#FF7A3D', orangeHot: '#FF9540', coral: '#FF5A5A',
  green: '#1DA36A', blue: '#2244E0',
};

const LOCAL_KEY = 'psyid_admin_codes';

export interface AccessCode {
  id: string;
  code: string;
  status: 'UNUSED' | 'IN_PROGRESS' | 'USED';
  invoice_ref: string | null;
  note: string | null;
  user_name: string | null;
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

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_access_token');
}

function localRead(): AccessCode[] {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]'); } catch { return []; }
}

function localWrite(codes: AccessCode[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(codes));
}

export default function AdminCodesPage() {
  const { t } = useAdminLang();

  const [codes, setCodes]             = useState<AccessCode[]>([]);
  const [kvReady, setKvReady]         = useState<boolean | null>(null); // null = loading
  const [userName, setUserName]       = useState('');
  const [invoiceRef, setInvoiceRef]   = useState('');
  const [note, setNote]               = useState('');
  const [lastCode, setLastCode]       = useState<string | null>(null);
  const [copied, setCopied]           = useState(false);
  const [generating, setGenerating]   = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'UNUSED' | 'USED'>('all');
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: check if KV is configured, then load codes
  useEffect(() => {
    loadCodes();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCodes() {
    const token = getToken();
    try {
      const res = await fetch('/api/codes', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.status === 503) {
        // KV not configured — use localStorage
        setKvReady(false);
        setCodes(localRead());
        return;
      }
      if (res.ok) {
        const { codes: remote } = await res.json() as { codes: AccessCode[] };
        setKvReady(true);
        setCodes(remote);
        // Sync local → KV if local has data and KV is empty
        if (remote.length === 0) {
          const local = localRead();
          if (local.length > 0) {
            await uploadLocal(local, token);
            setCodes(local);
          }
        }
        return;
      }
    } catch { /* network error */ }
    setKvReady(false);
    setCodes(localRead());
  }

  async function uploadLocal(local: AccessCode[], token: string | null) {
    for (const c of [...local].reverse()) {
      await fetch('/api/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(c),
      });
    }
  }

  async function handleGenerate() {
    setGenerating(true);
    const code: AccessCode = {
      id: generateId(),
      code: generateCode(),
      status: 'UNUSED',
      user_name: userName.trim() || null,
      invoice_ref: invoiceRef.trim() || null,
      note: note.trim() || null,
      created_at: new Date().toISOString(),
      used_at: null,
    };
    const token = getToken();
    if (kvReady) {
      await fetch('/api/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(code),
      });
      await loadCodes();
    } else {
      const updated = [code, ...localRead()];
      localWrite(updated);
      setCodes(updated);
    }
    setLastCode(code.code);
    setUserName('');
    setInvoiceRef('');
    setNote('');
    setGenerating(false);
  }

  function handleCopy(code: string) {
    navigator.clipboard.writeText(code).catch(() => {});
    setLastCode(code);
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  async function handleDelete(id: string) {
    const token = getToken();
    if (kvReady) {
      await fetch(`/api/codes/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      await loadCodes();
    } else {
      const updated = localRead().filter(c => c.id !== id);
      localWrite(updated);
      setCodes(updated);
    }
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

      {/* KV status banner */}
      {kvReady === false && (
        <div style={{
          marginBottom: 20, padding: '14px 18px', borderRadius: 14,
          background: 'rgba(255,149,64,0.08)', border: `1.5px solid rgba(255,149,64,0.25)`,
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="9" cy="9" r="8" stroke={C.orangeHot} strokeWidth="1.5"/>
            <path d="M9 5.5V9.5m0 2.5v.4" stroke={C.orangeHot} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 4 }}>
              Cross-device sync not active — codes stored in this browser only
            </div>
            <div style={{ fontSize: 12, color: C.inkSoft, lineHeight: 1.55 }}>
              To enable cross-device sync: go to your{' '}
              <strong>Vercel dashboard → Storage → Create KV Database</strong>, then link it to this project.
              Env vars <code style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11 }}>KV_REST_API_URL</code> and{' '}
              <code style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11 }}>KV_REST_API_TOKEN</code> will be added automatically.
              Existing codes will migrate on next load.
            </div>
          </div>
        </div>
      )}

      {kvReady === true && (
        <div style={{
          marginBottom: 20, padding: '10px 16px', borderRadius: 12,
          background: 'rgba(29,163,106,0.08)', border: `1px solid rgba(29,163,106,0.2)`,
          display: 'flex', gap: 8, alignItems: 'center', fontSize: 13,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block' }} />
          <span style={{ color: C.green, fontWeight: 600 }}>Cross-device sync active</span>
          <span style={{ color: C.inkMute }}>— codes stored in Vercel KV</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, alignItems: 'start' }}>

        {/* ── Generate card ── */}
        <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${C.line}`, padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.ink, marginBottom: 18 }}>
            {t('codes_gen_heading')}
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: C.inkMute, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Geist Mono', monospace" }}>
              {t('codes_user')}
            </label>
            <input
              value={userName}
              onChange={e => setUserName(e.target.value)}
              placeholder={t('codes_user_ph')}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: `1.5px solid ${C.line}`, fontSize: 14, color: C.ink,
                background: C.bone, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>

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

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={handleGenerate} disabled={generating} style={{
              flex: 1, padding: '12px 0', borderRadius: 12, border: 'none', cursor: generating ? 'default' : 'pointer',
              background: generating ? C.line : C.orangeHot, color: 'white',
              fontSize: 14, fontWeight: 800, fontFamily: 'inherit', transition: 'background .15s',
            }}>
              {generating ? '…' : t('codes_gen_btn')}
            </button>
            <a href="/reno" target="_blank" rel="noopener noreferrer" style={{
              padding: '12px 16px', borderRadius: 12,
              border: `1.5px solid ${C.line}`, color: C.inkSoft,
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
              display: 'flex', alignItems: 'center', whiteSpace: 'nowrap',
            }}>
              {t('codes_open_test')}
            </a>
          </div>

          {/* Last generated code */}
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
                  fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
                }}>
                  {copied ? t('codes_copied') : t('codes_copy')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Codes list ── */}
        <div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
            {([
              { key: 'all' as const,    label: `All (${codes.length})`           },
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
            {kvReady === null && (
              <div style={{ padding: '52px 32px', textAlign: 'center', color: C.inkMute, fontSize: 14 }}>Loading…</div>
            )}
            {kvReady !== null && filtered.length === 0 && (
              <div style={{ padding: '52px 32px', textAlign: 'center', color: C.inkMute, fontSize: 14 }}>
                {t('codes_none')}
              </div>
            )}
            {kvReady !== null && filtered.length > 0 && (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {(['codes_col_code', 'codes_col_user', 'codes_col_status', 'codes_col_invoice', 'codes_col_note', 'codes_col_created', 'codes_col_used', ''] as (TKey | '')[]).map((k, i) => (
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
                      <td style={{ padding: '13px 16px', fontSize: 13, color: C.ink, fontWeight: 600, borderBottom: `1px solid ${C.bone}` }}>
                        {c.user_name || <span style={{ color: C.inkMute }}>—</span>}
                      </td>
                      <td style={{ padding: '13px 16px', borderBottom: `1px solid ${C.bone}` }}>
                        <span style={{
                          padding: '3px 10px', borderRadius: 999,
                          background: c.status === 'USED' ? C.bone : c.status === 'IN_PROGRESS' ? 'rgba(34,68,224,0.10)' : 'rgba(255,149,64,0.12)',
                          color: c.status === 'USED' ? C.inkMute : c.status === 'IN_PROGRESS' ? '#2244E0' : C.orangeHot,
                          fontSize: 11, fontWeight: 700, fontFamily: "'Geist Mono', monospace", whiteSpace: 'nowrap',
                        }}>
                          {c.status === 'USED' ? t('codes_used') : c.status === 'IN_PROGRESS' ? 'In Progress' : t('codes_unused')}
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
                          }}>{t('codes_copy')}</button>
                          {(c as { portalUserEmail?: string }).portalUserEmail ? (
                            <span title={`Tied to ${(c as { portalUserEmail?: string }).portalUserEmail} — cannot be deleted`} style={{
                              padding: '5px 10px', borderRadius: 8, border: `1px solid ${C.line}`,
                              background: 'transparent', color: C.inkMute, fontSize: 11, fontWeight: 600,
                              cursor: 'not-allowed', fontFamily: 'inherit', userSelect: 'none',
                            }}>🔒</span>
                          ) : (
                            <button onClick={() => handleDelete(c.id)} style={{
                              padding: '5px 10px', borderRadius: 8, border: `1px solid rgba(255,90,90,0.2)`,
                              background: 'transparent', color: C.coral, fontSize: 11, fontWeight: 600,
                              cursor: 'pointer', fontFamily: 'inherit',
                            }}>{t('codes_del')}</button>
                          )}
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
