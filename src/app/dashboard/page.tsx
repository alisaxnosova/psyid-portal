'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';

function ProgressStep({ n, label, done, active }: { n: number; label: string; done: boolean; active: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
        background: done ? 'var(--violet)' : active ? 'white' : 'var(--bg-3)',
        border: active ? '2px solid var(--violet)' : 'none',
        color: done ? 'white' : active ? 'var(--violet)' : 'var(--ink-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700,
      }}>
        {done ? (
          <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
            <path d="M1.5 5L5 8.5L11.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : n}
      </div>
      <span style={{ fontSize: 14, color: done ? 'var(--ink)' : active ? 'var(--ink)' : 'var(--ink-3)', fontWeight: done || active ? 600 : 400 }}>
        {label}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span style={{ fontSize: 16, color: 'var(--ink-3)' }}>Загружаем кабинет...</span>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px 80px', maxWidth: 960 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 8 }}>
          Личный кабинет
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          Главная
        </h1>
      </div>

      {/* Journey progress */}
      <div style={{
        background: 'white', borderRadius: 18, padding: 24,
        border: '1px solid var(--line)', marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 18 }}>Ваш путь</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          <ProgressStep n={1} label="Тест пройден" done={false} active={true} />
          <div style={{ flex: 1, height: 2, background: 'var(--bg-3)', margin: '0 12px' }} />
          <ProgressStep n={2} label="Паспорт получен" done={false} active={false} />
          <div style={{ flex: 1, height: 2, background: 'var(--bg-3)', margin: '0 12px' }} />
          <ProgressStep n={3} label="Программа выбрана" done={false} active={false} />
        </div>
      </div>

      {/* No test CTA */}
      <div style={{
        background: 'var(--grad-hero)', color: 'white',
        borderRadius: 20, padding: 40, textAlign: 'center',
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7, marginBottom: 12, textTransform: 'uppercase' }}>
          Первый шаг
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Пройдите тест вместе с ребёнком</div>
        <div style={{ fontSize: 15, opacity: 0.8, marginBottom: 28, lineHeight: 1.5 }}>
          15 минут — и вы узнаете психотип, сильные стороны и подходящие профессии
        </div>
        <Link href="/start" style={{
          display: 'inline-block', background: 'white', color: 'var(--violet)',
          padding: '14px 28px', borderRadius: 100, fontWeight: 700, fontSize: 15,
        }}>
          Пройти тест
        </Link>
      </div>
    </div>
  );
}
