'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { attempts, AttemptResult } from '@/lib/renoApi';

const PROFESSIONS_BY_TYPE: Record<string, string[]> = {
  default: [
    'Разработчик программного обеспечения',
    'Архитектор',
    'Исследователь данных',
    'Стратегический консультант',
    'Финансовый аналитик',
    'Продуктовый менеджер',
    'Предприниматель',
    'Юрист',
    'Врач',
    'Психолог',
    'Педагог',
    'Журналист',
  ],
};

export default function ProfessionsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    attempts.list(user.id).then(async list => {
      const done = list.find(a => a.status === 'COMPLETED');
      if (done) {
        const r = await attempts.result(done.id).catch(() => null);
        setResult(r);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return <div style={{ padding: 40, color: 'var(--ink-3)' }}>Загружаем профессии...</div>;
  }

  const topProfile = result?.profileMatches?.[0];
  const professions = PROFESSIONS_BY_TYPE.default;
  const FREE_COUNT = 3;

  if (!result) {
    return (
      <div style={{ padding: '32px 40px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 8 }}>
          Личный кабинет
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>Профессии</h1>
        <div style={{
          background: 'white', borderRadius: 18, padding: 40, textAlign: 'center',
          border: '1px solid var(--line)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Тест ещё не пройден</div>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 20 }}>
            Пройдите тест, чтобы увидеть подходящие профессии
          </div>
          <Link href="/test" style={{
            display: 'inline-block', background: 'var(--violet)', color: 'white',
            padding: '12px 24px', borderRadius: 100, fontWeight: 700, fontSize: 14,
          }}>
            Пройти тест
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 40px 80px', maxWidth: 960 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 8 }}>
          Личный кабинет
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          Профессии
        </h1>
        {topProfile && (
          <div style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 6 }}>
            Подобраны для психотипа <b style={{ color: 'var(--ink)' }}>{topProfile.profile.title}</b>
          </div>
        )}
      </div>

      {/* Free professions */}
      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        Топ-3 совместимости - бесплатно
      </div>
      <div style={{ display: 'grid', gap: 10, marginBottom: 24 }}>
        {professions.slice(0, FREE_COUNT).map((p, i) => (
          <div key={i} style={{
            background: 'white', borderRadius: 14, padding: '18px 22px',
            border: '1px solid var(--line)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: i === 0 ? 'var(--violet)' : i === 1 ? 'var(--magenta)' : 'var(--bg-3)',
              color: i < 2 ? 'white' : 'var(--ink-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, flexShrink: 0,
            }}>
              {i + 1}
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{p}</div>
          </div>
        ))}
      </div>

      {/* Locked professions */}
      <div style={{ position: 'relative' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Полный список - {professions.length - FREE_COUNT} профессий
        </div>
        <div style={{ display: 'grid', gap: 10, filter: 'blur(3px)', pointerEvents: 'none', userSelect: 'none' }}>
          {professions.slice(FREE_COUNT, FREE_COUNT + 4).map((p, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: 14, padding: '18px 22px',
              border: '1px solid var(--line)',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, background: 'var(--bg-3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: 'var(--ink-3)', flexShrink: 0,
              }}>
                {FREE_COUNT + i + 1}
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)' }}>{p}</div>
            </div>
          ))}
        </div>
        {/* Unlock overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(245,244,250,0.9) 40%)',
        }}>
          <div style={{
            background: 'white', borderRadius: 20, padding: '28px 36px',
            boxShadow: '0 20px 50px -10px rgba(0,0,0,0.15)',
            textAlign: 'center', border: '1px solid var(--line)',
            maxWidth: 340,
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              Откройте полный список профессий
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20, lineHeight: 1.5 }}>
              {professions.length - FREE_COUNT} профессий с описанием навыков, зарплат и путей развития
            </div>
            <button style={{
              padding: '12px 24px', borderRadius: 100,
              background: 'var(--grad-cta)', color: 'white',
              fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 'none',
            }}>
              Открыть за 3 000 ₽
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
