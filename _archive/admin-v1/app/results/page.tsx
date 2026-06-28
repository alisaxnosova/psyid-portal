'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { admin, AdminAttempt, isAdminLoggedIn } from '@/lib/adminApi';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    COMPLETED: { label: 'Завершён', bg: '#f0fdf4', color: '#16a34a' },
    IN_PROGRESS: { label: 'В процессе', bg: '#fefce8', color: '#ca8a04' },
    CREATED: { label: 'Создан', bg: '#f3f4f6', color: '#6b7280' },
  };
  const s = map[status] ?? { label: status, bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{ padding: '3px 8px', borderRadius: 100, background: s.bg, color: s.color, fontSize: 12, fontWeight: 600 }}>
      {s.label}
    </span>
  );
}

export default function AdminResultsPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<AdminAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'COMPLETED' | 'IN_PROGRESS'>('all');

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/login'); return; }
    admin.attempts()
      .then(setAttempts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = filter === 'all' ? attempts : attempts.filter(a => a.status === filter);

  const completed = attempts.filter(a => a.status === 'COMPLETED').length;
  const inProgress = attempts.filter(a => a.status === 'IN_PROGRESS').length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Результаты тестов</h1>
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          {loading ? '...' : `${attempts.length} всего · ${completed} завершено · ${inProgress} в процессе`}
        </p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {([
          { key: 'all', label: 'Все' },
          { key: 'COMPLETED', label: 'Завершённые' },
          { key: 'IN_PROGRESS', label: 'В процессе' },
        ] as const).map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)} style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', border: '1.5px solid',
            borderColor: filter === f.key ? '#6366f1' : '#e8eaed',
            background: filter === f.key ? '#eef2ff' : 'white',
            color: filter === f.key ? '#6366f1' : '#374151',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8eaed', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
          padding: '12px 20px', background: '#f9fafb',
          borderBottom: '1px solid #e8eaed',
          fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          <div>Пользователь</div>
          <div>Профиль</div>
          <div>Статус</div>
          <div>Дата</div>
        </div>

        {loading && <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Загрузка...</div>}
        {error && <div style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Ничего не найдено</div>
        )}

        {!loading && !error && filtered.map((attempt, i) => (
          <div key={attempt.id} style={{
            display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr',
            padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
            alignItems: 'center',
          }}>
            <div>
              {attempt.user ? (
                <>
                  <Link href={`/admin/users/${attempt.user.id}`} style={{ fontSize: 14, fontWeight: 600, color: '#6366f1' }}>
                    {attempt.user.fullName ?? attempt.user.email}
                  </Link>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{attempt.user.email}</div>
                </>
              ) : (
                <span style={{ fontSize: 13, color: '#9ca3af' }}>Анонимный</span>
              )}
            </div>
            <div style={{ fontSize: 13, color: '#374151' }}>
              {attempt.topProfile ?? <span style={{ color: '#9ca3af' }}>—</span>}
            </div>
            <div><StatusBadge status={attempt.status} /></div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#6b7280' }}>
                {formatDate(attempt.completedAt ?? attempt.createdAt)}
              </span>
              {attempt.status === 'COMPLETED' && (
                <Link href={`/admin/results/${attempt.id}`} style={{ fontSize: 12, color: '#6366f1', fontWeight: 600 }}>
                  →
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
