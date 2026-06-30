'use client';

import Link from 'next/link';
import { AXES } from '@/data/reno';

export default function MethodologyPage() {
  return (
    <div>
      {/* Hero */}
      <section style={{ background: 'var(--grad-hero)', color: 'white', padding: '80px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-20%', right: '10%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, #E6337C, transparent 70%)',
          opacity: 0.4, filter: 'blur(60px)', pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative' }}>
          <div className="eyebrow" style={{ color: '#FFC34A', marginBottom: 16 }}>Методика ReNo</div>
          <h1 className="serif" style={{ fontSize: 72, letterSpacing: '-0.035em', lineHeight: 1.02, marginBottom: 24 }}>
            Не тип, а{' '}
            <span style={{
              background: 'linear-gradient(95deg, #FF6EA5, #FFC34A)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
            }}>рабочая модель</span> человека
          </h1>
          <p style={{ fontSize: 19, opacity: 0.85, lineHeight: 1.55, maxWidth: 720 }}>
            Ядро методики — количественная модель устойчивых поведенческих предпочтений, их интенсивности, компенсаций и точек напряжения.
          </p>
        </div>
      </section>

      {/* Principles */}
      <section style={{ maxWidth: 1000, margin: '80px auto', padding: '0 48px' }}>
        {[
          { n: '01', t: 'Дихотомии', d: 'Семь измеряемых осей поведения — от внимания до темпа. Каждая описывает, как человек предпочитает действовать в данной зоне.' },
          { n: '02', t: 'Интенсивность', d: 'По каждой оси рассчитывается степень выраженности: слабая, умеренная, выраженная, доминирующая. Большинство людей не крайние.' },
          { n: '03', t: 'Фасеты', d: 'Внутри каждой оси — уточняющие параметры. Например, под «структурой» разбираются дедлайны, регламенты, терпимость к неопределённости.' },
          { n: '04', t: 'Компенсации', d: 'Как человек ведёт себя вне естественного профиля. Система фиксирует, где поведение естественное, а где — вынужденное.' },
          { n: '05', t: 'Профиль напряжения', d: 'Строится на расхождениях между естественным и требуемым поведением. Показывает зоны риска выгорания и потери эффективности.' },
          { n: '06', t: 'Предиктивная часть', d: 'Модель даёт прогноз: где человек будет эффективен, а где — сломается под нагрузкой. Учитывает роль, задачи и среду.' },
        ].map(s => (
          <div key={s.n} style={{
            display: 'grid', gridTemplateColumns: '120px 1fr', gap: 40,
            padding: '32px 0', borderTop: '1px solid var(--line)',
          }}>
            <div className="mono" style={{ fontSize: 32, color: 'var(--magenta)', fontWeight: 500 }}>{s.n}</div>
            <div>
              <div className="serif" style={{ fontSize: 32, letterSpacing: '-0.02em', marginBottom: 12 }}>{s.t}</div>
              <div style={{ fontSize: 16, color: 'var(--ink-2)', lineHeight: 1.6 }}>{s.d}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Axes list */}
      <section style={{ background: 'var(--bg-2)', padding: '100px 48px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Семь осей</div>
          <h2 className="serif" style={{ fontSize: 48, letterSpacing: '-0.025em', marginBottom: 48, lineHeight: 1.1 }}>
            Полный список дихотомий
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {AXES.map((a, i) => (
              <div key={a.id} style={{
                background: 'white', borderRadius: 18, padding: '28px 32px',
                display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: 32, alignItems: 'center',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: a.color,
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700,
                }}>0{i + 1}</div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{a.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>ось {i + 1} из 7</div>
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: 13, alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.left.label}</div>
                    <div style={{ color: 'var(--ink-3)', marginTop: 2 }}>{a.left.desc}</div>
                  </div>
                  <div style={{ color: a.color, fontSize: 20 }}>↔</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{a.right.label}</div>
                    <div style={{ color: 'var(--ink-3)', marginTop: 2 }}>{a.right.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 1000, margin: '100px auto', padding: '0 48px' }}>
        <div style={{
          background: 'var(--grad-hero)', color: 'white', borderRadius: 28, padding: 60,
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at center, rgba(255,110,165,0.3), transparent 60%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <h2 className="serif" style={{ fontSize: 48, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: 24 }}>
              Попробуйте методику
            </h2>
            <p style={{ fontSize: 17, opacity: 0.85, maxWidth: 500, margin: '0 auto 32px', lineHeight: 1.5 }}>
              20–25 минут — и у вас полный профиль по всем семи осям с фасетами и компенсациями.
            </p>
            <Link href="/reno" className="btn-primary" style={{ padding: '16px 32px', fontSize: 15 }}>
              Начать тест — 2 490 ₽
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
