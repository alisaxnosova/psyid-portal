'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { admin, AdminStats, isAdminLoggedIn } from '@/lib/adminApi';

const C = { ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8', line: '#E5DED2', paper: '#FBF7F1', bone: '#F6F1EA', orange: '#FF7A3D', orangeHot: '#FF9540', coral: '#FF5A5A', blue: '#2244E0' };

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div style={{ background: 'white', borderRadius: 20, padding: '24px 28px', border: `1px solid ${C.line}` }}>
      <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700, color: C.inkMute, marginBottom: 12, textTransform: 'uppercase' as const, letterSpacing: '0.12em' }}>
        {label}
      </div>
      <div style={{ fontSize: 44, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1, background: `linear-gradient(135deg, ${accent}, ${accent}aa)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
        {value}
      </div>
    </div>
  );
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: C.inkSoft, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{value} <span style={{ color: C.inkMute, fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 6, background: C.bone, borderRadius: 100 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100, transition: 'width .4s' }}/>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats]   = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/admin/login'); return; }
    admin.stats().then(setStats).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: C.inkMute }}>Загрузка...</div>;
  if (error)   return <div style={{ background: 'white', borderRadius: 16, padding: 32, textAlign: 'center', border: `1px solid ${C.line}`, color: C.coral }}>{error}</div>;

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: C.inkMute, marginTop: 6, fontFamily: "'Geist Mono', monospace" }}>Общая картина · PsyID</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Всего пользователей" value={stats?.totalUsers      ?? 0} accent={C.blue}      />
        <StatCard label="Тестов начато"        value={stats?.totalAttempts   ?? 0} accent={C.orangeHot} />
        <StatCard label="Тестов завершено"     value={stats?.completedAttempts ?? 0} accent={C.coral}  />
      </div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'white', borderRadius: 20, padding: '24px 28px', border: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 22, letterSpacing: '-0.01em' }}>Воронка</div>
          <FunnelBar label="Зарегистрировались" value={stats?.totalUsers        ?? 0} max={stats?.totalUsers ?? 1} color={C.blue}      />
          <FunnelBar label="Начали тест"         value={stats?.totalAttempts     ?? 0} max={stats?.totalUsers ?? 1} color={C.orangeHot} />
          <FunnelBar label="Завершили тест"      value={stats?.completedAttempts ?? 0} max={stats?.totalUsers ?? 1} color={C.coral}     />
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: '24px 28px', border: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.ink, marginBottom: 22, letterSpacing: '-0.01em' }}>Сегодня</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Новых пользователей', value: stats?.todayUsers    ?? 0, color: C.blue      },
              { label: 'Тестов начато',        value: stats?.todayAttempts ?? 0, color: C.orangeHot },
              { label: 'Тестов завершено',     value: stats?.todayCompleted ?? 0, color: C.coral   },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: C.bone, borderRadius: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }}/>
                  <span style={{ fontSize: 14, color: C.inkSoft }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 26, fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
