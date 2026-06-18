'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { admin, AdminUser, isAdminLoggedIn } from '@/lib/adminApi';
import { useAdminLang } from '@/lib/adminLang';

const C = { ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8', line: '#E5DED2', bone: '#F6F1EA', orange: '#FF7A3D', orangeHot: '#FF9540', coral: '#FF5A5A', blue: '#2244E0' };

function formatDate(iso: string, lang: 'en' | 'ru') {
  return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { t, lang } = useAdminLang();
  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/admin/login'); return; }
    admin.users().then(setUsers).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [router]);

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.fullName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>{t('users_title')}</h1>
          <p style={{ fontSize: 13, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>
            {loading ? '...' : `${users.length} ${t('users_count')}`}
          </p>
        </div>
        <input
          placeholder={t('users_ph')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '10px 16px', borderRadius: 12, border: `1.5px solid ${C.line}`,
            fontSize: 14, color: C.ink, background: 'white', width: 280, outline: 'none',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
          padding: '12px 20px', background: C.bone, borderBottom: `1px solid ${C.line}`,
          fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700,
          color: C.inkMute, textTransform: 'uppercase', letterSpacing: '0.10em',
        }}>
          <div>{t('users_user')}</div><div>{t('users_tests')}</div><div>{t('users_done')}</div><div>{t('users_joined')}</div>
        </div>

        {loading && <div style={{ padding: 48, textAlign: 'center', color: C.inkMute }}>{t('loading')}</div>}
        {error   && <div style={{ padding: 48, textAlign: 'center', color: C.coral }}>{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: C.inkMute }}>{t('users_none')}</div>
        )}

        {!loading && !error && filtered.map((user, i) => (
          <Link key={user.id} href={`/admin/users/${user.id}`}
            style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
              padding: '14px 20px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.bone}` : 'none',
              alignItems: 'center', color: 'inherit', transition: 'background .12s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = C.bone)}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>
                {user.fullName ?? user.firstName ?? '—'}
              </div>
              <div style={{ fontSize: 12, color: C.inkMute, marginTop: 2 }}>{user.email}</div>
            </div>
            <div style={{ fontSize: 14, color: C.inkSoft }}>{user.attemptsCount}</div>
            <div>
              {user.completedCount > 0 ? (
                <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 999, background: 'rgba(255,149,64,0.12)', color: C.orangeHot, fontSize: 12, fontWeight: 700 }}>
                  {user.completedCount}
                </span>
              ) : (
                <span style={{ fontSize: 14, color: C.inkMute }}>—</span>
              )}
            </div>
            <div style={{ fontSize: 13, color: C.inkMute }}>{formatDate(user.createdAt, lang)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
