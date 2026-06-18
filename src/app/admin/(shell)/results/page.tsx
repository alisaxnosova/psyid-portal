'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { admin, AdminUser, AdminAttempt, isAdminLoggedIn } from '@/lib/adminApi';
import { useAdminLang } from '@/lib/adminLang';

const C = {
  ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8',
  line: '#E5DED2', bone: '#F6F1EA',
  orange: '#FF7A3D', orangeHot: '#FF9540', coral: '#FF5A5A',
  blue: '#2244E0', green: '#1DA36A',
};

type Tab = 'users' | 'results' | 'research';

function formatDate(iso: string, lang: 'en' | 'ru') {
  return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'ru-RU', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function shortId(id: string) {
  return id.slice(0, 8) + '…';
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    COMPLETED:   { label: 'Completed',   bg: 'rgba(255,149,64,0.12)',  color: C.orangeHot },
    IN_PROGRESS: { label: 'In Progress', bg: 'rgba(255,198,116,0.18)', color: '#B8800A'   },
    CREATED:     { label: 'Created',     bg: C.bone,                   color: C.inkMute   },
  };
  const s = map[status] ?? { label: status, bg: C.bone, color: C.inkMute };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 999,
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 700,
      fontFamily: "'Geist Mono', monospace", letterSpacing: '0.04em',
    }}>
      {s.label}
    </span>
  );
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
      padding: '13px 16px',
      fontSize: mono ? 12 : 13,
      color: mono ? C.inkMute : C.ink,
      fontFamily: mono ? "'Geist Mono', monospace" : 'inherit',
      borderBottom: `1px solid ${C.bone}`,
      whiteSpace: 'nowrap',
    }}>{children}</td>
  );
}

export default function AdminDatabasePage() {
  const router = useRouter();
  const { lang } = useAdminLang();

  const [tab, setTab]           = useState<Tab>('results');
  const [users, setUsers]       = useState<AdminUser[]>([]);
  const [attempts, setAttempts] = useState<AdminAttempt[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/admin/login'); return; }
    Promise.all([admin.users(), admin.attempts()])
      .then(([u, a]) => { setUsers(u); setAttempts(a); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  const filteredUsers = users.filter(u =>
    !search ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.fullName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().startsWith(search.toLowerCase())
  );

  const filteredAttempts = attempts.filter(a =>
    !search ||
    (a.user?.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (a.user?.fullName ?? '').toLowerCase().includes(search.toLowerCase()) ||
    a.id.toLowerCase().startsWith(search.toLowerCase()) ||
    (a.topProfile ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const tabs: { key: Tab; label: string; table: string; count: number | null }[] = [
    { key: 'users',    label: 'Table A', table: 'Users',              count: loading ? null : users.length    },
    { key: 'results',  label: 'Table B', table: 'Assessment Results', count: loading ? null : attempts.length },
    { key: 'research', label: 'Table C', table: 'Research Dataset',   count: 0 },
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
            {loading ? 'Loading…' : `${users.length} users · ${attempts.length} attempts · 3 tables`}
          </p>
        </div>
        <input
          placeholder="Search by email, name, ID…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${C.line}`,
            fontSize: 14, color: C.ink, background: 'white', width: 280, outline: 'none',
            fontFamily: 'inherit',
          }}
        />
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
              <span style={{
                fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700,
                color: active ? C.orangeHot : C.inkMute,
              }}>
                {tb.label}
              </span>
              <span>{tb.table}</span>
              {tb.count !== null && (
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

      {error && (
        <div style={{ padding: '14px 20px', borderRadius: 12, background: 'rgba(255,90,90,0.08)', color: C.coral, fontSize: 14, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Table card */}
      <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>

          {/* ── TABLE A: Users ── */}
          {tab === 'users' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr>
                  <TH width={120}>user_id</TH>
                  <TH width={180}>name</TH>
                  <TH width={230}>email</TH>
                  <TH width={110}>account</TH>
                  <TH width={80}>tests</TH>
                  <TH width={100}>completed</TH>
                  <TH>joined</TH>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: C.inkMute, fontSize: 14 }}>Loading…</td></tr>
                )}
                {!loading && filteredUsers.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: C.inkMute, fontSize: 14 }}>No rows found</td></tr>
                )}
                {!loading && filteredUsers.map(u => (
                  <tr key={u.id}
                    onMouseEnter={e => (e.currentTarget.style.background = C.bone)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    style={{ transition: 'background .1s' }}
                  >
                    <TD mono>{shortId(u.id)}</TD>
                    <TD>
                      <span style={{ fontWeight: 600, color: C.ink }}>
                        {u.fullName ?? u.firstName ?? <span style={{ color: C.inkMute }}>—</span>}
                      </span>
                    </TD>
                    <TD mono>{u.email}</TD>
                    <TD>
                      <span style={{
                        padding: '2px 8px', borderRadius: 6,
                        background: C.bone, fontSize: 11,
                        color: C.inkMute, fontFamily: "'Geist Mono', monospace",
                      }}>
                        user
                      </span>
                    </TD>
                    <TD mono>{u.attemptsCount}</TD>
                    <TD>
                      {u.completedCount > 0
                        ? <span style={{ color: C.orangeHot, fontWeight: 700, fontFamily: "'Geist Mono', monospace", fontSize: 12 }}>{u.completedCount}</span>
                        : <span style={{ color: C.inkMute }}>—</span>
                      }
                    </TD>
                    <TD mono>{formatDate(u.createdAt, lang)}</TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── TABLE B: Assessment Results ── */}
          {tab === 'results' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
              <thead>
                <tr>
                  <TH width={120}>result_id</TH>
                  <TH width={120}>user_id</TH>
                  <TH width={210}>user</TH>
                  <TH width={190}>personality_type</TH>
                  <TH width={140}>status</TH>
                  <TH width={180}>test_start</TH>
                  <TH>test_end</TH>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: C.inkMute, fontSize: 14 }}>Loading…</td></tr>
                )}
                {!loading && filteredAttempts.length === 0 && (
                  <tr><td colSpan={7} style={{ padding: 48, textAlign: 'center', color: C.inkMute, fontSize: 14 }}>No rows found</td></tr>
                )}
                {!loading && filteredAttempts.map(a => (
                  <tr key={a.id}
                    onMouseEnter={e => (e.currentTarget.style.background = C.bone)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    style={{ transition: 'background .1s' }}
                  >
                    <TD mono>{shortId(a.id)}</TD>
                    <TD mono>
                      {a.user
                        ? <Link href={`/admin/users/${a.user.id}`} style={{ color: C.blue }}>{shortId(a.user.id)}</Link>
                        : <span style={{ color: C.inkMute }}>—</span>
                      }
                    </TD>
                    <TD>
                      {a.user ? (
                        <>
                          <Link href={`/admin/users/${a.user.id}`} style={{ fontSize: 13, fontWeight: 600, color: C.blue, display: 'block' }}>
                            {a.user.fullName ?? a.user.email}
                          </Link>
                          <span style={{ fontSize: 11, color: C.inkMute, fontFamily: "'Geist Mono', monospace" }}>
                            {a.user.email}
                          </span>
                        </>
                      ) : (
                        <span style={{ color: C.inkMute, fontSize: 12 }}>anonymous</span>
                      )}
                    </TD>
                    <TD>
                      {a.topProfile
                        ? <span style={{ fontWeight: 600, color: C.ink }}>{a.topProfile}</span>
                        : <span style={{ color: C.inkMute }}>—</span>
                      }
                    </TD>
                    <TD><StatusBadge status={a.status} /></TD>
                    <TD mono>{formatDate(a.createdAt, lang)}</TD>
                    <TD mono>
                      {a.completedAt
                        ? formatDate(a.completedAt, lang)
                        : <span style={{ color: C.inkMute }}>—</span>
                      }
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* ── TABLE C: Research Dataset ── */}
          {tab === 'research' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 960 }}>
              <thead>
                <tr>
                  <TH width={130}>research_id</TH>
                  <TH width={80}>age</TH>
                  <TH width={150}>education</TH>
                  <TH width={150}>country</TH>
                  <TH width={170}>occupation</TH>
                  <TH width={110}>language</TH>
                  <TH width={140}>research_consent</TH>
                  <TH>scores</TH>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} style={{ padding: '72px 32px', textAlign: 'center' }}>
                    <div style={{ maxWidth: 440, margin: '0 auto' }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: 'rgba(255,149,64,0.08)', margin: '0 auto 18px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5.5v5.5m0 3.5v.5" stroke={C.orangeHot} strokeWidth="1.7" strokeLinecap="round"/>
                        </svg>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: C.ink, marginBottom: 10 }}>
                        Research Dataset is empty
                      </div>
                      <div style={{ fontSize: 13, color: C.inkMute, lineHeight: 1.65 }}>
                        Rows will appear here when participants complete the onboarding flow
                        with research consent checked. The backend endpoint for this table
                        is not yet built.
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          )}

        </div>

        {/* Footer */}
        {!loading && !error && (
          <div style={{
            padding: '10px 20px', borderTop: `1px solid ${C.line}`,
            display: 'flex', alignItems: 'center', gap: 8,
            fontFamily: "'Geist Mono', monospace", fontSize: 11, color: C.inkMute,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.green, display: 'inline-block', flexShrink: 0 }} />
            {tab === 'users'    && `${filteredUsers.length} row${filteredUsers.length !== 1 ? 's' : ''}${search ? ` (filtered from ${users.length})` : ''}`}
            {tab === 'results'  && `${filteredAttempts.length} row${filteredAttempts.length !== 1 ? 's' : ''}${search ? ` (filtered from ${attempts.length})` : ''}`}
            {tab === 'research' && '0 rows'}
          </div>
        )}
      </div>
    </div>
  );
}
