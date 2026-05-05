'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { attempts, AttemptResult } from '@/lib/renoApi';
import { AXES, intensity } from '@/data/reno';
import { AxisBar } from '@/components/shared/AxisBar';

function mapAxes(result: AttemptResult) {
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
      intensityLabel: intensity(Math.abs(signed)),
      interpretationTitle: ds.interpretation?.title,
      interpretationDesc: ds.interpretation?.description ?? undefined,
      axisInfo: info,
    };
  });
}

export default function ProfilePage() {
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
    return <div style={{ padding: 40, color: 'var(--ink-3)' }}>Загружаем профиль...</div>;
  }

  if (!result) {
    return (
      <div style={{ padding: '32px 40px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 8 }}>
          Личный кабинет
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 32 }}>Профиль ребёнка</h1>
        <div style={{
          background: 'white', borderRadius: 18, padding: 40, textAlign: 'center',
          border: '1px solid var(--line)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Тест ещё не пройден</div>
          <div style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 20 }}>Пройдите тест, чтобы увидеть профиль</div>
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

  const axes = mapAxes(result);
  const topProfile = result.profileMatches[0];

  return (
    <div style={{ padding: '32px 40px 80px', maxWidth: 960 }}>
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 8 }}>
          Личный кабинет
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          Профиль ребёнка
        </h1>
      </div>

      {/* Profile header */}
      {topProfile && (
        <div style={{
          background: 'var(--grad-hero)', color: 'white',
          borderRadius: 18, padding: '24px 28px', marginBottom: 24,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              Психотип
            </div>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{topProfile.profile.title}</div>
            {topProfile.profile.description && (
              <div style={{ fontSize: 13, opacity: 0.75, marginTop: 6, maxWidth: 480, lineHeight: 1.5 }}>
                {topProfile.profile.description}
              </div>
            )}
          </div>
          <div style={{
            fontSize: 48, fontWeight: 900, opacity: 0.2, flexShrink: 0,
            letterSpacing: '-0.04em', lineHeight: 1,
          }}>
            {topProfile.matchPercent}%
          </div>
        </div>
      )}

      {/* Axes grid */}
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--ink)' }}>
        Психологические оси
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
        {axes.map(a => (
          <div key={a.id} style={{
            background: 'white', borderRadius: 16, padding: 24,
            border: '1px solid var(--line)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: a.color, textTransform: 'uppercase', marginBottom: 4 }}>
                  {a.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  выраженность: <b style={{ color: a.color }}>{a.intensityLabel}</b>
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: a.color }}>
                {a.value > 0 ? '+' : ''}{a.value}
              </div>
            </div>

            {a.axisInfo ? (
              <AxisBar axis={a.axisInfo} value={a.value} compensation={0} />
            ) : (
              <div style={{ height: 10, background: 'var(--bg-3)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${Math.abs(a.value)}%`,
                  background: a.color,
                  borderRadius: 100,
                  marginLeft: a.value < 0 ? 0 : '50%',
                }} />
              </div>
            )}

            {a.interpretationTitle && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: a.color, marginBottom: 4 }}>
                  {a.interpretationTitle}
                </div>
                {a.interpretationDesc && (
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                    {a.interpretationDesc}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Profile matches */}
      {result.profileMatches.length > 0 && (
        <>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, color: 'var(--ink)' }}>
            Близкие психотипы
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {result.profileMatches.slice(0, 5).map((m, i) => (
              <div key={i} style={{
                background: 'white', borderRadius: 14, padding: '16px 20px',
                border: '1px solid var(--line)',
                display: 'flex', alignItems: 'center', gap: 16,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: i === 0 ? 'var(--violet)' : 'var(--bg-3)',
                  color: i === 0 ? 'white' : 'var(--ink-3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, flexShrink: 0,
                }}>
                  {m.rank}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{m.profile.title}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: i === 0 ? 'var(--violet)' : 'var(--ink-2)' }}>
                    {m.matchPercent}%
                  </div>
                  <div style={{ height: 4, width: 80, background: 'var(--bg-3)', borderRadius: 100, marginTop: 4 }}>
                    <div style={{ height: '100%', width: `${m.matchPercent}%`, background: i === 0 ? 'var(--grad-cta)' : 'var(--bg-3)', borderRadius: 100 }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
