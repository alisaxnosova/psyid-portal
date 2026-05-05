'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { attempts, AttemptResult } from '@/lib/renoApi';
import { AXES, intensity } from '@/data/reno';

interface AttemptSummary {
  id: string;
  status: string;
  completedAt: string | null;
  createdAt: string;
}

interface AxisDisplay {
  id: string;
  name: string;
  color: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
  intensityLabel: string;
}

function mapAxes(result: AttemptResult): AxisDisplay[] {
  return result.dichotomyScores.map(ds => {
    const info = AXES.find(a => a.id === ds.dichotomy.code);
    const signed = ds.leftRawScore > ds.rightRawScore
      ? -Math.round(ds.strengthPercent)
      : Math.round(ds.strengthPercent);
    return {
      id: ds.dichotomy.code,
      name: info?.name ?? ds.dichotomy.title,
      color: info?.color ?? 'var(--violet)',
      value: signed,
      leftLabel: info?.left.label ?? 'L',
      rightLabel: info?.right.label ?? 'R',
      intensityLabel: intensity(Math.abs(signed)),
    };
  });
}

function AxisCard({ axis }: { axis: AxisDisplay }) {
  const pct = Math.abs(axis.value);
  const dominant = axis.value > 0 ? axis.rightLabel : axis.leftLabel;
  const fill = axis.value > 0 ? (50 + pct / 2) : (50 - pct / 2);

  return (
    <div style={{
      background: 'white', borderRadius: 16, padding: 20,
      border: '1px solid var(--line)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: axis.color, textTransform: 'uppercase', marginBottom: 4 }}>
            {axis.name}
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{dominant}</div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{axis.intensityLabel}</div>
        </div>
        <div style={{
          fontSize: 22, fontWeight: 800, color: axis.color,
          fontVariantNumeric: 'tabular-nums',
        }}>{pct}<span style={{ fontSize: 13, fontWeight: 600 }}>%</span></div>
      </div>

      <div style={{ position: 'relative', height: 8, background: 'var(--bg-3)', borderRadius: 100 }}>
        <div style={{
          position: 'absolute', left: `${fill > 50 ? 50 : fill}%`,
          width: `${Math.abs(fill - 50)}%`, height: '100%',
          background: axis.color, borderRadius: 100,
        }} />
        <div style={{
          position: 'absolute', left: '50%', top: -2,
          width: 2, height: 12, background: 'var(--line)', transform: 'translateX(-50%)',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={{ fontSize: 11, color: axis.value < 0 ? axis.color : 'var(--ink-3)', fontWeight: axis.value < 0 ? 700 : 400 }}>
          {axis.leftLabel}
        </span>
        <span style={{ fontSize: 11, color: axis.value > 0 ? axis.color : 'var(--ink-3)', fontWeight: axis.value > 0 ? 700 : 400 }}>
          {axis.rightLabel}
        </span>
      </div>
    </div>
  );
}

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
  const [history, setHistory] = useState<AttemptSummary[]>([]);
  const [lastResult, setLastResult] = useState<AttemptResult | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }

    attempts.list(user.id)
      .then(async list => {
        setHistory(list);
        const completed = list.find(a => a.status === 'COMPLETED');
        if (completed) {
          const result = await attempts.result(completed.id).catch(() => null);
          setLastResult(result);
        }
      })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, [user, authLoading, router]);

  if (authLoading || dataLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span style={{ fontSize: 16, color: 'var(--ink-3)' }}>Загружаем кабинет...</span>
      </div>
    );
  }

  const topProfile = lastResult?.profileMatches?.[0];
  const axes = lastResult ? mapAxes(lastResult) : null;
  const completedCount = history.filter(a => a.status === 'COMPLETED').length;
  const hasTest = completedCount > 0;
  const hasPlan = false;

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
          <ProgressStep n={1} label="Тест пройден" done={hasTest} active={!hasTest} />
          <div style={{ flex: 1, height: 2, background: hasTest ? 'var(--violet)' : 'var(--bg-3)', margin: '0 12px', transition: 'background .3s' }} />
          <ProgressStep n={2} label="Паспорт получен" done={hasTest} active={hasTest} />
          <div style={{ flex: 1, height: 2, background: hasPlan ? 'var(--violet)' : 'var(--bg-3)', margin: '0 12px' }} />
          <ProgressStep n={3} label="Программа выбрана" done={hasPlan} active={hasTest && !hasPlan} />
        </div>
      </div>

      {!hasTest ? (
        /* No test taken yet */
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
          <Link href="/test" style={{
            display: 'inline-block', background: 'white', color: 'var(--violet)',
            padding: '14px 28px', borderRadius: 100, fontWeight: 700, fontSize: 15,
          }}>
            Пройти тест бесплатно
          </Link>
        </div>
      ) : (
        <>
          {/* Profile card */}
          {topProfile && (
            <div style={{
              background: 'var(--grad-hero)', color: 'white',
              borderRadius: 20, padding: 28, marginBottom: 20,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              gap: 20,
            }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', opacity: 0.7, marginBottom: 8, textTransform: 'uppercase' }}>
                  Психотип ребёнка
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 6 }}>{topProfile.profile.title}</div>
                <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 20 }}>
                  Совпадение {topProfile.matchPercent}%
                </div>
                <Link href={`/results?id=${lastResult?.id}`} style={{
                  display: 'inline-block', background: 'white', color: 'var(--violet)',
                  padding: '10px 20px', borderRadius: 100, fontSize: 13, fontWeight: 700,
                }}>
                  Открыть полный отчёт
                </Link>
              </div>
              <div style={{
                textAlign: 'right', flexShrink: 0,
                fontSize: 60, fontWeight: 900, opacity: 0.15, letterSpacing: '-0.04em',
                lineHeight: 1, fontVariantNumeric: 'tabular-nums',
              }}>
                {topProfile.matchPercent}%
              </div>
            </div>
          )}

          {/* Axes */}
          {axes && axes.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Психологические оси</div>
                <Link href="/dashboard/profile" style={{ fontSize: 13, color: 'var(--violet)', fontWeight: 600 }}>
                  Подробнее
                </Link>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
                {axes.map(a => <AxisCard key={a.id} axis={a} />)}
              </div>
            </>
          )}

          {/* Upsell */}
          <div style={{
            background: 'white', borderRadius: 18, padding: 28,
            border: '1.5px solid var(--line)',
            display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 240 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--violet)', textTransform: 'uppercase', marginBottom: 8 }}>
                Полный психологический паспорт
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
                Разблокируйте полный отчёт
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, marginBottom: 16 }}>
                Фасеты по каждой оси, расширенный список профессий, дорожная карта развития и доступ к библиотеке материалов.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Фасеты характера', 'Все профессии', 'Дорожная карта', 'Библиотека'].map(t => (
                  <span key={t} style={{
                    padding: '4px 10px', borderRadius: 100,
                    background: 'var(--bg-2)', fontSize: 12, color: 'var(--ink-2)',
                  }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 4 }}>от</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.03em' }}>
                3 000<span style={{ fontSize: 18 }}>₽</span>
              </div>
              <button style={{
                marginTop: 12, padding: '12px 24px', borderRadius: 100,
                background: 'var(--grad-cta)', color: 'white',
                fontWeight: 700, fontSize: 14, cursor: 'pointer', border: 'none',
                display: 'block', width: '100%',
              }}>
                Оформить
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
