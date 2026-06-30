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
        background: done ? '#FF9540' : active ? 'white' : '#E8E4DC',
        border: active ? '2px solid #FF9540' : 'none',
        color: done ? 'white' : active ? '#FF9540' : '#8A8596',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700,
      }}>
        {done ? (
          <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
            <path d="M1.5 5L5 8.5L11.5 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : n}
      </div>
      <span style={{ fontSize: 14, color: done ? '#14111C' : active ? '#14111C' : '#8A8596', fontWeight: done || active ? 600 : 400 }}>
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
    <div style={{ padding: '36px 40px 80px', maxWidth: 960, fontFamily: "'Geist', 'Onest', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#8A8596', textTransform: 'uppercase', marginBottom: 6, fontFamily: "'Geist Mono', monospace" }}>
          Dashboard
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.025em', color: '#14111C' }}>
          Главная
        </h1>
      </div>

      {/* Journey progress */}
      <div style={{
        background: 'white', borderRadius: 16, padding: 24,
        border: '1px solid #E8E4DC', marginBottom: 16,
      }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#8A8596', textTransform: 'uppercase', marginBottom: 16, fontFamily: "'Geist Mono', monospace" }}>
          Ваш путь
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <ProgressStep n={1} label="Тест пройден" done={false} active={true} />
          <div style={{ flex: 1, height: 2, background: '#E8E4DC', margin: '0 12px' }} />
          <ProgressStep n={2} label="Паспорт получен" done={false} active={false} />
          <div style={{ flex: 1, height: 2, background: '#E8E4DC', margin: '0 12px' }} />
          <ProgressStep n={3} label="Программа выбрана" done={false} active={false} />
        </div>
      </div>

      {/* No test CTA */}
      <div style={{
        background: 'linear-gradient(135deg, #050C2E 0%, #0B1A56 60%, #1A2A7A 100%)',
        color: 'white', borderRadius: 20, padding: 40, textAlign: 'center',
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.45)', marginBottom: 12, textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace" }}>
          Первый шаг
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 12, letterSpacing: '-0.02em' }}>Пройдите тест вместе с ребёнком</div>
        <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 28, lineHeight: 1.6 }}>
          15 минут — и вы узнаете психотип, сильные стороны и подходящие профессии
        </div>
        <Link href="/reno" style={{
          display: 'inline-block',
          background: 'linear-gradient(95deg, #FF9540 0%, #E6337C 100%)',
          color: 'white',
          padding: '14px 32px', borderRadius: 100, fontWeight: 700, fontSize: 15,
          letterSpacing: '-0.01em',
        }}>
          Пройти тест →
        </Link>
      </div>
    </div>
  );
}
