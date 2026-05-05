'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { attempts } from '@/lib/renoApi';

interface AttemptSummary {
  id: string;
  status: string;
  completedAt: string | null;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'сегодня';
  if (days === 1) return 'вчера';
  if (days < 7) return `${days} дн. назад`;
  if (days < 30) return `${Math.floor(days / 7)} нед. назад`;
  return `${Math.floor(days / 30)} мес. назад`;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  COMPLETED: { label: 'Завершён', color: '#16A34A' },
  IN_PROGRESS: { label: 'В процессе', color: '#D97706' },
  ABANDONED: { label: 'Отменён', color: 'var(--ink-3)' },
};

export default function HistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<AttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    attempts.list(user.id)
      .then(setHistory)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div style={{ padding: 40, color: 'var(--ink-3)' }}>Загружаем историю...</div>;
  }

  return (
    <div style={{ padding: '32px 40px 80px', maxWidth: 960 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 8 }}>
          Личный кабинет
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          История тестирований
        </h1>
      </div>

      {history.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: 18, padding: 40, textAlign: 'center',
          border: '1px solid var(--line)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Нет тестирований</div>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 20 }}>
            Первое тестирование создаст историю
          </div>
          <Link href="/test" style={{
            display: 'inline-block', background: 'var(--violet)', color: 'white',
            padding: '12px 24px', borderRadius: 100, fontWeight: 700, fontSize: 14,
          }}>
            Пройти тест
          </Link>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: 18, border: '1px solid var(--line)', overflow: 'hidden' }}>
          {history.map((a, i) => {
            const st = STATUS_MAP[a.status] ?? { label: a.status, color: 'var(--ink-3)' };
            return (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 24px',
                borderTop: i > 0 ? '1px solid var(--line)' : 'none',
              }}>
                <div style={{
                  width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                  background: st.color,
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
                    Тест {i + 1 < 10 ? `0${history.length - i}` : history.length - i}
                  </div>
                  <div style={{ fontSize: 12, color: st.color, fontWeight: 500 }}>{st.label}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  {timeAgo(a.completedAt ?? a.createdAt)}
                </div>
                {a.status === 'COMPLETED' && (
                  <Link href={`/results?id=${a.id}`} style={{
                    padding: '7px 14px', borderRadius: 100,
                    background: 'var(--bg-2)', color: 'var(--violet)',
                    fontSize: 13, fontWeight: 600,
                  }}>
                    Открыть
                  </Link>
                )}
                {a.status === 'IN_PROGRESS' && (
                  <Link href="/test" style={{
                    padding: '7px 14px', borderRadius: 100,
                    background: 'var(--bg-2)', color: 'var(--ink-2)',
                    fontSize: 13, fontWeight: 600,
                  }}>
                    Продолжить
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
