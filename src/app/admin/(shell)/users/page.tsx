'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { admin, AdminUser, isAdminLoggedIn } from '@/lib/adminApi';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAdminLoggedIn()) { router.push('/admin/login'); return; }
    admin.users()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [router]);

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.fullName ?? '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', letterSpacing: '-0.02em' }}>Пользователи</h1>
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {loading ? '...' : `${users.length} аккаунтов`}
          </p>
        </div>
        <input
          placeholder="Поиск по email или имени..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: '9px 14px', borderRadius: 10, border: '1.5px solid #e8eaed',
            fontSize: 14, color: '#111827', background: 'white', width: 280, outline: 'none',
          }}
        />
      </div>

      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e8eaed', overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
          padding: '12px 20px', background: '#f9fafb',
          borderBottom: '1px solid #e8eaed',
          fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          <div>Пользователь</div>
          <div>Тестов начато</div>
          <div>Завершено</div>
          <div>Дата регистрации</div>
        </div>

        {loading && <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Загрузка...</div>}
        {error && <div style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Пользователи не найдены</div>
        )}

        {!loading && !error && filtered.map((user, i) => (
          <Link key={user.id} href={`/admin/users/${user.id}`} style={{
            display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr',
            padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
            alignItems: 'center', color: 'inherit', transition: 'background .1s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                {user.fullName ?? user.firstName ?? '—'}
              </div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{user.email}</div>
            </div>
            <div style={{ fontSize: 14, color: '#374151' }}>{user.attemptsCount}</div>
            <div>
              {user.completedCount > 0 ? (
                <span style={{
                  display: 'inline-block', padding: '3px 8px', borderRadius: 100,
                  background: '#f0fdf4', color: '#16a34a', fontSize: 12, fontWeight: 600,
                }}>
                  {user.completedCount}
                </span>
              ) : (
                <span style={{ fontSize: 14, color: '#9ca3af' }}>0</span>
              )}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{formatDate(user.createdAt)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
