'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { admin, AdminAttempt, isAdminLoggedIn } from '@/lib/adminApi';
import { useAdminLang } from '@/lib/adminLang';

const C = { ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8', line: '#E5DED2', bone: '#F6F1EA', orange: '#FF7A3D', orangeHot: '#FF9540', coral: '#FF5A5A', blue: '#2244E0', gold: '#FFC074' };

function formatDate(iso: string, lang: 'en' | 'ru') {
  return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusBadge({ status, t }: { status: string; t: (k: string) => string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    COMPLETED:   { label: t('res_done'),   bg: 'rgba(255,149,64,0.12)', color: C.orangeHot },
    IN_PROGRESS: { label: t('res_inprog'), bg: 'rgba(255,198,116,0.18)', color: '#B8800A'  },
    CREATED:     { label: t('res_created'), bg: C.bone,                  color: C.inkMute  },
  };
  const s = map[status] ?? { label: status, bg: C.bone, color: C.inkMute };
  return (
    <span style={{ padding: '3px 10px', borderRadius: 999, background: s.bg, color: s.color, fontSize: 12, fontWeight: 700 }}>
      {s.label}
    </span>
  );
}

export default function AdminResultsPage() {
  const router = useRouter();
  const { t, lang } = useAdminLang();
  const [attempts, setAttempts] = useState<AdminAttempt[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [filter, setFilter]     = useState<'all' | 'COMPLETED' | 'IN_PROGRESS'>('all');

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/admin/login'); return; }
    admin.attempts().then(setAttempts).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [router]);

  const filtered   = filter === 'all' ? attempts : attempts.filter(a => a.status === filter);
  const completed  = attempts.filter(a => a.status === 'COMPLETED').length;
  const inProgress = attempts.filter(a => a.status === 'IN_PROGRESS').length;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>{t('res_title')}</h1>
        <p style={{ fontSize: 13, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>
          {loading ? '...' : `${attempts.length} ${t('res_total')} · ${completed} ${t('res_compl')} · ${inProgress} ${t('res_prog')}`}
        </p>
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([
          { key: 'all' as const,         label: t('all')          },
          { key: 'COMPLETED' as const,   label: t('filter_compl') },
          { key: 'IN_PROGRESS' as const, label: t('filter_prog')  },
        ]).map(f => {
          const active = filter === f.key;
          return (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '8px 16px', borderRadius: 999, fontSize: 13, fontWeight: 600,
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

      {/* Table */}
      <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${C.line}`, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
          padding: '12px 20px', background: C.bone, borderBottom: `1px solid ${C.line}`,
          fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700,
          color: C.inkMute, textTransform: 'uppercase', letterSpacing: '0.10em',
        }}>
          <div>{t('res_user')}</div><div>{t('res_profile')}</div><div>{t('res_status')}</div><div>{t('res_date')}</div>
        </div>

        {loading && <div style={{ padding: 48, textAlign: 'center', color: C.inkMute }}>{t('loading')}</div>}
        {error   && <div style={{ padding: 48, textAlign: 'center', color: C.coral }}>{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', color: C.inkMute }}>{t('nothing_found')}</div>
        )}

        {!loading && !error && filtered.map((attempt, i) => (
          <div key={attempt.id} style={{
            display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
            padding: '14px 20px', borderBottom: i < filtered.length - 1 ? `1px solid ${C.bone}` : 'none',
            alignItems: 'center',
          }}>
            <div>
              {attempt.user ? (
                <>
                  <Link href={`/admin/users/${attempt.user.id}`} style={{ fontSize: 14, fontWeight: 600, color: C.blue }}>
                    {attempt.user.fullName ?? attempt.user.email}
                  </Link>
                  <div style={{ fontSize: 12, color: C.inkMute, marginTop: 1 }}>{attempt.user.email}</div>
                </>
              ) : (
                <span style={{ fontSize: 13, color: C.inkMute }}>{t('res_anon')}</span>
              )}
            </div>
            <div style={{ fontSize: 13, color: C.inkSoft }}>{attempt.topProfile ?? <span style={{ color: C.inkMute }}>—</span>}</div>
            <div><StatusBadge status={attempt.status} t={t as (k: string) => string}/></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: C.inkMute }}>{formatDate(attempt.completedAt ?? attempt.createdAt, lang)}</span>
              {attempt.status === 'COMPLETED' && (
                <Link href={`/admin/results/${attempt.id}`} style={{ fontSize: 13, color: C.orangeHot, fontWeight: 700 }}>→</Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
