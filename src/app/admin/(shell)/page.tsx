'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { admin, AdminStats, isAdminLoggedIn } from '@/lib/adminApi';

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e8eaed' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </div>
      <div style={{ fontSize: 36, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

function FunnelBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{value} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 8, background: '#f3f4f6', borderRadius: 100 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 100 }} />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/admin/login'); return; }
    admin.stats()
      .then(setStats)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <span style={{ color: '#6b7280' }}>Загрузка...</span>
    </div>
  );

  if (error) return (
    <div style={{ background: 'white', borderRadius: 16, padding: 32, textAlign: 'center', border: '1px solid #e8eaed' }}>
      <div style={{ fontSize: 15, color: '#dc2626' }}>{error}</div>
    </div>
  );

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Dashboard</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>Общая картина по сервису</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard label="Всего пользователей" value={stats?.totalUsers ?? 0} />
        <StatCard label="Тестов начато" value={stats?.totalAttempts ?? 0} />
        <StatCard label="Тестов завершено" value={stats?.completedAttempts ?? 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e8eaed' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Воронка</div>
          <FunnelBar label="Зарегистрировались" value={stats?.totalUsers ?? 0} max={stats?.totalUsers ?? 1} color="#6366f1" />
          <FunnelBar label="Начали тест" value={stats?.totalAttempts ?? 0} max={stats?.totalUsers ?? 1} color="#8b5cf6" />
          <FunnelBar label="Завершили тест" value={stats?.completedAttempts ?? 0} max={stats?.totalUsers ?? 1} color="#a855f7" />
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: 24, border: '1px solid #e8eaed' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#111827', marginBottom: 20 }}>Сегодня</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Новых пользователей', value: stats?.todayUsers ?? 0, color: '#6366f1' },
              { label: 'Тестов начато', value: stats?.todayAttempts ?? 0, color: '#8b5cf6' },
              { label: 'Тестов завершено', value: stats?.todayCompleted ?? 0, color: '#a855f7' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: 14, color: '#374151' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#111827' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
