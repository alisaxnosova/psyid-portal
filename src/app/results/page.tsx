'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AXES, DEMO_PROFILE, intensity } from '@/data/reno';
import { ProfileGlyph } from '@/components/shared/ProfileGlyph';
import { AxisBar } from '@/components/shared/AxisBar';
import { Tag } from '@/components/shared/Tag';
import { attempts, AttemptResult, isLoggedIn } from '@/lib/renoApi';

type Tab = 'profile' | 'tension' | 'roles';

interface DisplayAxis {
  id: string;
  name: string;
  short: string;
  color: string;
  value: number;
  compensation: number;
  leftLabel: string;
  rightLabel: string;
  intensityLabel: string;
  interpretationTitle?: string;
  interpretationDescription?: string;
}

interface DisplayData {
  profileTitle: string;
  topMatchPercent: number;
  tensionIndex: number;
  completedAt: string;
  axes: DisplayAxis[];
  topProfiles: { title: string; matchPercent: number; rank: number }[];
  summary: string;
  isDemo: boolean;
}

function mapResultToDisplay(result: AttemptResult): DisplayData {
  const axes: DisplayAxis[] = result.dichotomyScores.map(ds => {
    const axisInfo = AXES.find(a => a.id === ds.dichotomy.code) ?? {
      id: ds.dichotomy.code, name: ds.dichotomy.title,
      short: ds.dichotomy.code, color: '#4B1E8E',
      left: { label: 'L', code: '', desc: '' }, right: { label: 'R', code: '', desc: '' },
    };
    const signed = ds.leftRawScore > ds.rightRawScore
      ? -Math.round(ds.strengthPercent)
      : Math.round(ds.strengthPercent);
    return {
      id: axisInfo.id,
      name: axisInfo.name,
      short: axisInfo.short,
      color: axisInfo.color,
      value: signed,
      compensation: 0,
      leftLabel: axisInfo.left.label,
      rightLabel: axisInfo.right.label,
      intensityLabel: intensity(Math.abs(signed)),
      interpretationTitle: ds.interpretation?.title,
      interpretationDescription: ds.interpretation?.description ?? undefined,
    };
  });

  const topProfile = result.profileMatches[0];
  const tensionIndex = axes.reduce((sum, a) => sum + Math.abs(a.value), 0) / Math.max(axes.length, 1);

  return {
    profileTitle: topProfile?.profile.title ?? 'Профиль',
    topMatchPercent: topProfile?.matchPercent ?? 0,
    tensionIndex: Math.round(tensionIndex),
    completedAt: result.completedAt
      ? new Date(result.completedAt).toLocaleDateString('ru-RU')
      : '',
    axes,
    topProfiles: result.profileMatches.map(m => ({
      title: m.profile.title,
      matchPercent: m.matchPercent,
      rank: m.rank,
    })),
    summary: result.summary ?? '',
    isDemo: false,
  };
}

function mapDemoToDisplay(): DisplayData {
  const p = DEMO_PROFILE;
  const axes: DisplayAxis[] = AXES.map(a => {
    const ax = p.axes[a.id];
    return {
      id: a.id, name: a.name, short: a.short, color: a.color,
      value: ax.value, compensation: ax.compensation,
      leftLabel: a.left.label, rightLabel: a.right.label,
      intensityLabel: intensity(Math.abs(ax.value)),
    };
  });
  return {
    profileTitle: 'Абстрактный инициатор',
    topMatchPercent: 82,
    tensionIndex: 58,
    completedAt: p.date,
    axes,
    topProfiles: p.roles.map((r, i) => ({ title: r.title, matchPercent: r.fit, rank: i + 1 })),
    summary: p.summary,
    isDemo: true,
  };
}

function TensionChart({ axes }: { axes: DisplayAxis[] }) {
  return (
    <div style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 16, padding: 24 }}>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 16, fontWeight: 600, letterSpacing: '0.05em' }}>
        ИНТЕНСИВНОСТЬ ПО ОСЯМ
      </div>
      {axes.map(a => (
        <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ fontSize: 12, width: 110, opacity: 0.8 }}>{a.short}</div>
          <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.15)', borderRadius: 100 }}>
            <div style={{ height: '100%', width: `${Math.abs(a.value)}%`, background: a.color, borderRadius: 100 }} />
          </div>
          <div className="mono" style={{ fontSize: 11, opacity: 0.7, width: 32, textAlign: 'right' }}>
            {Math.abs(a.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('id');
  const [tab, setTab] = useState<Tab>('profile');
  const [data, setData] = useState<DisplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loggedIn = isLoggedIn();

  useEffect(() => {
    if (attemptId) {
      attempts.result(attemptId)
        .then(r => setData(mapResultToDisplay(r)))
        .catch(e => { setError(e.message); setData(mapDemoToDisplay()); })
        .finally(() => setLoading(false));
    } else {
      setData(mapDemoToDisplay());
      setLoading(false);
    }
  }, [attemptId]);

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="serif" style={{ fontSize: 24, color: 'var(--ink-3)' }}>Загружаем отчёт...</div>
      </div>
    );
  }

  if (!data) return null;

  const glyphAxes = Object.fromEntries(data.axes.map(a => [a.id, { value: a.value }]));
  const dominantAxes = data.axes.filter(a => Math.abs(a.value) >= 70);

  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'var(--grad-hero)', color: 'white', padding: '48px 48px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '0%', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, #E6337C 0%, transparent 70%)',
          opacity: 0.4, filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, fontSize: 13, opacity: 0.8 }}>
            <span>Отчёт · {data.completedAt}</span>
            {data.isDemo && (
              <Tag color="#FFC34A">Демо-режим</Tag>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 60, alignItems: 'center' }}>
            <div>
              <div className="eyebrow" style={{ color: '#FFC34A', marginBottom: 16 }}>Ваш профиль</div>
              <h1 className="serif" style={{ fontSize: 56, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 24 }}>
                <span style={{
                  background: 'linear-gradient(95deg, #FF6EA5, #FFC34A)',
                  WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                }}>{data.profileTitle}</span>
                {!data.isDemo && (
                  <> · <span style={{ color: '#FFC34A' }}>{data.topMatchPercent}%</span></>
                )}
              </h1>
              {data.summary && (
                <p style={{ fontSize: 16, opacity: 0.85, lineHeight: 1.55, maxWidth: 540 }}>{data.summary}</p>
              )}
              {error && (
                <div style={{ fontSize: 13, opacity: 0.7, marginTop: 12 }}>Показан демо-режим: {error}</div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ProfileGlyph axes={glyphAxes} size={340} showLabels />
            </div>
          </div>
        </div>
      </section>

      {/* Metrics strip */}
      <section style={{ maxWidth: 1280, margin: '-40px auto 0', padding: '0 48px', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16,
          background: 'white', padding: 32, borderRadius: 22,
          boxShadow: '0 20px 50px -20px rgba(0,0,0,0.12)', border: '1px solid var(--line)',
        }}>
          {[
            { l: 'Индекс напряжения', v: String(data.tensionIndex), s: '/100', color: '#E6337C', note: data.tensionIndex >= 70 ? 'высокий' : data.tensionIndex >= 40 ? 'умеренный' : 'низкий' },
            { l: 'Доминирующих осей', v: String(dominantAxes.length), s: `из ${data.axes.length}`, color: '#8A2FBF', note: dominantAxes.map(a => a.short).join(', ') || 'нет' },
            { l: 'Совпадение с профилем', v: String(data.topMatchPercent), s: '%', color: '#4B1E8E', note: data.profileTitle },
            { l: 'Осей измерено', v: String(data.axes.length), s: '', color: '#FF8E3C', note: 'методика ReNo' },
          ].map((m, i) => (
            <div key={i} style={{ padding: '0 8px', borderRight: i < 3 ? '1px solid var(--line)' : 'none' }}>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8, fontWeight: 600, letterSpacing: '0.05em' }}>{m.l}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span className="serif" style={{ fontSize: 48, color: m.color, letterSpacing: '-0.02em' }}>{m.v}</span>
                <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>{m.s}</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4 }}>{m.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section style={{ maxWidth: 1280, margin: '60px auto 0', padding: '0 48px' }}>
        <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--line)', marginBottom: 32 }}>
          {([
            ['profile', 'Карта дихотомий'],
            ['tension', 'Интенсивность'],
            ['roles', 'Совпадение профилей'],
          ] as [Tab, string][]).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '16px 22px', fontSize: 14, fontWeight: 600,
              color: tab === id ? 'var(--ink)' : 'var(--ink-3)',
              borderBottom: tab === id ? '2px solid var(--magenta)' : '2px solid transparent',
              marginBottom: -1,
            }}>{label}</button>
          ))}
        </div>

        {tab === 'profile' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
            {data.axes.map(a => {
              const axisInfo = AXES.find(ax => ax.id === a.id);
              return (
                <div key={a.id} className="card" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                      <div className="eyebrow" style={{ color: a.color, marginBottom: 6 }}>{a.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                        интенсивность: <b style={{ color: a.color }}>{a.intensityLabel}</b>
                      </div>
                    </div>
                    <div className="mono" style={{ fontSize: 22, color: a.color, fontWeight: 600 }}>
                      {a.value > 0 ? '+' : ''}{a.value}
                    </div>
                  </div>
                  {axisInfo ? (
                    <AxisBar axis={axisInfo} value={a.value} compensation={a.compensation} />
                  ) : (
                    <div style={{ height: 12, background: 'var(--bg-3)', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${Math.abs(a.value)}%`, background: a.color, borderRadius: 100, marginLeft: a.value < 0 ? 0 : '50%' }} />
                    </div>
                  )}
                  {a.interpretationTitle && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: a.color, marginBottom: 6 }}>{a.interpretationTitle}</div>
                      {a.interpretationDescription && (
                        <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>{a.interpretationDescription}</div>
                      )}
                    </div>
                  )}
                  {data.isDemo && axisInfo && (
                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--line)', fontSize: 13 }}>
                      <div style={{ color: 'var(--ink-3)', marginBottom: 8, fontWeight: 600 }}>Фасеты</div>
                      {Object.entries(DEMO_PROFILE.axes[a.id]?.facets ?? {}).map(([k, v], i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                          <span style={{ color: 'var(--ink-2)' }}>{k}</span>
                          <span style={{ fontWeight: 500 }}>{v}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'tension' && (
          <div>
            <div style={{
              background: 'var(--grad-hero)', color: 'white', borderRadius: 24, padding: 48,
              marginBottom: 28, position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
                <div>
                  <div className="eyebrow" style={{ color: '#FFC34A', marginBottom: 12 }}>Индекс напряжения</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
                    <span className="serif" style={{ fontSize: 100, letterSpacing: '-0.04em', lineHeight: 1 }}>{data.tensionIndex}</span>
                    <span style={{ fontSize: 20, opacity: 0.7 }}>/100</span>
                  </div>
                  <div style={{ fontSize: 16, opacity: 0.9, lineHeight: 1.5 }}>
                    {data.tensionIndex >= 70
                      ? 'Высокий. Выраженные доминанты по нескольким осям - есть риск выгорания.'
                      : data.tensionIndex >= 40
                      ? 'Умеренный. Профиль с заметными предпочтениями, без критических перегрузок.'
                      : 'Низкий. Гибкий профиль, хорошая адаптивность.'}
                  </div>
                </div>
                <TensionChart axes={data.axes} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              {dominantAxes.map((a, i) => (
                <div key={a.id} className="card" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, background: a.color,
                      color: 'white', fontWeight: 700, fontSize: 14,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>!</div>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>{a.name}</div>
                      <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                        Доминирующая ось ({Math.abs(a.value)}%). {a.interpretationTitle ?? a.intensityLabel + ' выраженность.'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'roles' && (
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Совпадение с профилями методики</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              {data.topProfiles.map((r, i) => (
                <div key={i} className="card" style={{ padding: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>#{r.rank}</div>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>{r.title}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="mono" style={{ fontSize: 26, color: 'var(--magenta)', fontWeight: 600 }}>
                      {r.matchPercent}<span style={{ fontSize: 14 }}>%</span>
                    </div>
                    <div style={{ width: 100, height: 4, background: 'var(--bg-3)', borderRadius: 100, marginTop: 6 }}>
                      <div style={{ height: '100%', width: `${r.matchPercent}%`, background: 'var(--grad-cta)', borderRadius: 100 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <div style={{ height: 80 }} />

      <section style={{ maxWidth: 1280, margin: '0 auto 80px', padding: '0 48px' }}>
        <div style={{
          background: 'var(--bg-2)', borderRadius: 24, padding: 40,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24,
        }}>
          {data.isDemo ? (
            <>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Это демо-паспорт</div>
                <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>Пройдите тест, чтобы получить психологический паспорт вашего ребёнка</div>
              </div>
              <Link href="/test" className="btn-primary" style={{ padding: '14px 28px' }}>
                Пройти тест бесплатно →
              </Link>
            </>
          ) : !loggedIn ? (
            <>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Сохраните психологический паспорт</div>
                <div style={{ fontSize: 14, color: 'var(--ink-2)', maxWidth: 420 }}>
                  Зарегистрируйтесь бесплатно — паспорт сохранится в личном кабинете. Сможете вернуться в любой момент.
                </div>
              </div>
              <Link href={`/register?attemptId=${attemptId}`} className="btn-primary" style={{ padding: '14px 28px' }}>
                Сохранить паспорт →
              </Link>
            </>
          ) : (
            <>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Паспорт сохранён в кабинете</div>
                <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>Доступен в личном кабинете в любое время</div>
              </div>
              <Link href="/dashboard" className="btn-dark" style={{ padding: '14px 28px' }}>
                Перейти в кабинет →
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="serif" style={{ fontSize: 24, color: 'var(--ink-3)' }}>Загружаем отчёт...</div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
