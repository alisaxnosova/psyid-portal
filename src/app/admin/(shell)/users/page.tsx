'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { admin, AdminUser, isAdminLoggedIn } from '@/lib/adminApi';
import { useAdminLang } from '@/lib/adminLang';
import type { AccessCode } from '@/app/api/codes/route';

const C = { ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8', line: '#E5DED2', bone: '#F6F1EA', orange: '#FF7A3D', orangeHot: '#FF9540', coral: '#FF5A5A', blue: '#2244E0', green: '#1DA36A' };

type Tab = 'external' | 'portal' | 'admins';

interface Result {
  sessionId: string;
  codeId: string;
  code: string;
  type: string;
  status: string;
  completedAt: string | null;
}

interface ExternalUser {
  name: string;
  codes: AccessCode[];
  results: Result[];
}

function formatDate(iso: string | null, lang: 'en' | 'ru') {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function Pill({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{ padding: '2px 9px', borderRadius: 999, background: bg, color, fontSize: 11, fontWeight: 700, fontFamily: "'Geist Mono', monospace" }}>
      {label}
    </span>
  );
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('admin_access_token');
}

// ─── External Users tab ───────────────────────────────────────────────────────

function ExternalUsersTab() {
  const { t, lang } = useAdminLang();
  const [codes, setCodes]       = useState<AccessCode[]>([]);
  const [results, setResults]   = useState<Result[]>([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    const token = getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch('/api/codes', { headers }).then(r => r.ok ? r.json() : { codes: [] }),
      fetch('/api/admin/results', { headers }).then(r => r.ok ? r.json() : { results: [] }),
    ]).then(([codesData, resultsData]) => {
      setCodes((codesData as { codes: AccessCode[] }).codes ?? []);
      setResults((resultsData as { results: Result[] }).results ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const externalUsers: ExternalUser[] = Object.values(
    codes.reduce<Record<string, ExternalUser>>((acc, code) => {
      // External = manually-generated Etsy codes only. Portal registrants get an
      // auto-generated code stamped with portalUserEmail; those belong to the
      // Portal tab, not here.
      if (!code.user_name || code.portalUserEmail) return acc;
      const key = code.user_name.toLowerCase();
      if (!acc[key]) acc[key] = { name: code.user_name, codes: [], results: [] };
      acc[key].codes.push(code);
      const linkedResult = results.find(r => r.codeId === code.id);
      if (linkedResult) acc[key].results.push(linkedResult);
      return acc;
    }, {})
  ).filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div style={{ padding: 48, textAlign: 'center', color: C.inkMute }}>Loading…</div>;

  if (externalUsers.length === 0 && !search) return (
    <div style={{ padding: '48px 32px', textAlign: 'center', color: C.inkMute, fontSize: 14, lineHeight: 1.6 }}>
      {t('users_ext_none')}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <input
          placeholder={`${t('search')} ${t('users_ext_name').toLowerCase()}...`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${C.line}`, fontSize: 13, color: C.ink, background: 'white', width: 240, outline: 'none', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 80px 80px 1fr 1fr', padding: '11px 20px', background: C.bone, borderBottom: `1px solid ${C.line}`, fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700, color: C.inkMute, textTransform: 'uppercase', letterSpacing: '0.10em' }}>
          <div>{t('users_ext_name')}</div>
          <div>{t('users_ext_codes')}</div>
          <div>{t('users_ext_used')}</div>
          <div>{t('users_ext_refs')}</div>
          <div>{t('users_ext_last')}</div>
        </div>

        {externalUsers.map((user, i) => {
          const usedCodes   = user.codes.filter(c => c.status === 'USED' || c.status === 'IN_PROGRESS');
          const lastDate    = [...user.codes].sort((a, b) => (b.used_at ?? b.created_at).localeCompare(a.used_at ?? a.created_at))[0];
          const refs        = [...new Set(user.codes.map(c => c.invoice_ref).filter(Boolean))].join(', ');
          const isOpen      = expanded === user.name;

          return (
            <div key={user.name}>
              <div
                onClick={() => setExpanded(isOpen ? null : user.name)}
                style={{
                  display: 'grid', gridTemplateColumns: '2fr 80px 80px 1fr 1fr',
                  padding: '14px 20px', borderBottom: `1px solid ${C.bone}`,
                  alignItems: 'center', cursor: 'pointer', transition: 'background .12s',
                  background: isOpen ? '#FEF9F5' : undefined,
                }}
                onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = C.bone; }}
                onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${C.blue}, ${C.orangeHot})`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                    {user.name[0].toUpperCase()}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>{user.name}</span>
                  <Pill label="External" bg="rgba(34,68,224,0.08)" color={C.blue} />
                </div>
                <div style={{ fontSize: 14, color: C.inkSoft }}>{user.codes.length}</div>
                <div>
                  {usedCodes.length > 0
                    ? <Pill label={String(usedCodes.length)} bg="rgba(255,149,64,0.12)" color={C.orangeHot} />
                    : <span style={{ color: C.inkMute, fontSize: 13 }}>—</span>}
                </div>
                <div style={{ fontSize: 12, color: C.inkSoft, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {refs || <span style={{ color: C.inkMute }}>—</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, color: C.inkMute }}>
                    {formatDate(lastDate?.used_at ?? lastDate?.created_at ?? null, lang)}
                  </span>
                  <span style={{ fontSize: 16, color: C.inkMute, transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform .2s', display: 'inline-block' }}>›</span>
                </div>
              </div>

              {isOpen && (
                <div style={{ background: '#FEF9F5', borderBottom: `1px solid ${C.bone}`, padding: '0 20px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: C.inkMute, letterSpacing: '0.10em', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace", padding: '12px 0 10px' }}>
                    {t('users_ext_expand')}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {user.codes.map(code => {
                      const result = results.find(r => r.codeId === code.id);
                      return (
                        <div key={code.id} style={{ display: 'grid', gridTemplateColumns: '120px 100px 1fr 1fr auto', gap: 12, alignItems: 'center', background: 'white', borderRadius: 10, padding: '10px 14px', border: `1px solid ${C.line}` }}>
                          <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 16, fontWeight: 900, letterSpacing: '0.10em', color: C.ink }}>{code.code}</span>
                          <Pill
                            label={code.status === 'USED' ? (lang === 'en' ? 'Used' : 'Использован') : code.status === 'IN_PROGRESS' ? 'In Progress' : (lang === 'en' ? 'Unused' : 'Не использован')}
                            bg={code.status === 'USED' ? C.bone : code.status === 'IN_PROGRESS' ? 'rgba(34,68,224,0.10)' : 'rgba(255,149,64,0.12)'}
                            color={code.status === 'USED' ? C.inkMute : code.status === 'IN_PROGRESS' ? C.blue : C.orangeHot}
                          />
                          <span style={{ fontSize: 12, color: C.inkSoft }}>{code.invoice_ref || <span style={{ color: C.inkMute }}>—</span>}</span>
                          <span style={{ fontSize: 12, color: C.inkMute }}>{formatDate(code.used_at ?? code.created_at, lang)}</span>
                          {result ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Pill label={result.type} bg="rgba(255,149,64,0.12)" color={C.orangeHot} />
                              <Link href={`/admin/results`} style={{ fontSize: 11, color: C.blue, fontWeight: 600 }}>
                                {t('users_ext_result')} →
                              </Link>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: C.inkMute }}>{t('users_ext_notest')}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {externalUsers.length === 0 && search && (
          <div style={{ padding: '40px 32px', textAlign: 'center', color: C.inkMute, fontSize: 14 }}>{t('nothing_found')}</div>
        )}
      </div>
    </div>
  );
}

// ─── Portal Users tab ────────────────────────────────────────────────────────

interface PortalUser { email: string; name: string; userId: string; accessCode?: string; registeredAt: string; }

function PortalUsersTab() {
  const { t, lang } = useAdminLang();
  const [users, setUsers]     = useState<PortalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    const token = getToken();
    fetch('/api/admin/portal-users', { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.json())
      .then((d: { users?: PortalUser[]; error?: string }) => {
        if (d.error) throw new Error(d.error);
        setUsers(d.users ?? []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <input
          placeholder={t('users_ph')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '9px 14px', borderRadius: 10, border: `1.5px solid ${C.line}`, fontSize: 13, color: C.ink, background: 'white', width: 280, outline: 'none', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 130px 1fr 1fr', padding: '11px 20px', background: C.bone, borderBottom: `1px solid ${C.line}`, fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700, color: C.inkMute, textTransform: 'uppercase', letterSpacing: '0.10em' }}>
          <div>{t('users_user')}</div><div>Access Code</div><div>Status</div><div>{t('users_joined')}</div>
        </div>

        {loading && <div style={{ padding: 48, textAlign: 'center', color: C.inkMute }}>{t('loading')}</div>}
        {error   && <div style={{ padding: 48, textAlign: 'center', color: C.coral }}>{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: C.inkMute }}>{t('users_none')}</div>
        )}

        {!loading && !error && filtered.map((user, i) => (
          <div key={user.userId}
            style={{ display: 'grid', gridTemplateColumns: '2fr 130px 1fr 1fr', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.bone}` : 'none', alignItems: 'center' }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>{user.name || '—'}</div>
              <div style={{ fontSize: 12, color: C.inkMute, marginTop: 2 }}>{user.email}</div>
            </div>
            <div>
              {user.accessCode
                ? <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 16, fontWeight: 900, letterSpacing: '0.10em', color: C.ink }}>{user.accessCode}</span>
                : <span style={{ fontSize: 13, color: C.inkMute }}>—</span>}
            </div>
            <div>
              <Pill label="Portal" bg="rgba(29,163,106,0.10)" color={C.green} />
            </div>
            <div style={{ fontSize: 13, color: C.inkMute }}>{formatDate(user.registeredAt, lang)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Admins tab ───────────────────────────────────────────────────────────────

function AdminsTab() {
  return (
    <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.bone}`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, #050C2E, #2244E0)`, display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>A</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>Admin</div>
          <div style={{ fontSize: 12, color: C.inkMute, marginTop: 1 }}>support@psyid.me</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <Pill label="Admin" bg="rgba(34,68,224,0.10)" color={C.blue} />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const router = useRouter();
  const { t }  = useAdminLang();
  const [tab, setTab] = useState<Tab>('portal');

  useEffect(() => {
    if (!isAdminLoggedIn()) router.push('/admin/login');
  }, [router]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'portal',   label: t('users_tab_portal') },
    { key: 'external', label: t('users_tab_ext')    },
    { key: 'admins',   label: t('users_tab_admins') },
  ];

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>{t('users_title')}</h1>
        <p style={{ fontSize: 13, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>
          External · Portal · Admin users
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(tb => {
          const active = tab === tb.key;
          return (
            <button key={tb.key} onClick={() => setTab(tb.key)} style={{
              padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', border: '1.5px solid',
              borderColor: active ? C.orangeHot : C.line,
              background: active ? 'rgba(255,149,64,0.10)' : 'white',
              color: active ? C.orangeHot : C.inkSoft,
              fontFamily: 'inherit', transition: 'all .15s',
            }}>
              {tb.label}
            </button>
          );
        })}
      </div>

      {tab === 'external' && <ExternalUsersTab />}
      {tab === 'portal'   && <PortalUsersTab   />}
      {tab === 'admins'   && <AdminsTab        />}
    </div>
  );
}
