'use client';

import Link from 'next/link';
import { PRODUCTS } from '@/data/reno';
import { ProductCard } from '@/components/landing/ProductCard';

export default function PricingPage() {
  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 48px 120px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div className="eyebrow" style={{ marginBottom: 16 }}>Тарифы</div>
        <h1 className="serif" style={{ fontSize: 72, letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 20 }}>
          Выберите <span className="grad-text">глубину отчёта</span>
        </h1>
        <p style={{ fontSize: 17, color: 'var(--ink-2)', maxWidth: 560, margin: '0 auto' }}>
          Основа — одинакова. Чем глубже тариф, тем подробнее разбор компенсаций, напряжения и рекомендаций под конкретные роли.
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 60 }}>
        {PRODUCTS.map((p, i) => (
          <ProductCard key={p.id} product={p} featured={i === 1} />
        ))}
      </div>

      {/* Comparison table */}
      <div className="card" style={{ padding: 48, background: 'var(--bg-2)', marginBottom: 40 }}>
        <div className="eyebrow" style={{ marginBottom: 20 }}>Сравнение тарифов</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 0 }}>
          <div style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, color: 'var(--ink-3)' }}>ЧТО ВХОДИТ</div>
          <div style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>Базовый</div>
          <div style={{
            padding: '16px 20px', fontSize: 13, fontWeight: 600, textAlign: 'center',
            background: 'var(--grad-hero)', color: 'white', borderRadius: '12px 12px 0 0',
          }}>Полный</div>
          <div style={{ padding: '16px 20px', fontSize: 13, fontWeight: 600, textAlign: 'center' }}>Команда</div>
          {[
            ['Карта 7 осей с интенсивностью', '✓', '✓', '✓'],
            ['Фасетная детализация', 'кратко', '✓', '✓'],
            ['Компенсации', '—', '✓', '✓'],
            ['Индекс напряжения и зоны риска', '—', '✓', '✓'],
            ['Рекомендации под роли', '—', '✓', '✓'],
            ['Карта совместимости команды', '—', '—', '✓'],
            ['Отчёт по распределению ролей', '—', '—', '✓'],
            ['Админ-панель и экспорт', '—', '—', '✓'],
            ['PDF-отчёт', '6 стр.', '22 стр.', '22 стр. × N'],
            ['Повторный тест', 'платно', '1 бесп.', 'безлим.'],
          ].map((row, i) => (
            <div key={i} style={{ display: 'contents' }}>
              <div style={{ padding: '14px 20px', fontSize: 14, borderTop: '1px solid var(--line)' }}>{row[0]}</div>
              <div style={{ padding: '14px 20px', fontSize: 14, textAlign: 'center', borderTop: '1px solid var(--line)', color: row[1] === '—' ? 'var(--ink-3)' : 'var(--ink)' }}>{row[1]}</div>
              <div style={{ padding: '14px 20px', fontSize: 14, textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.15)', background: 'var(--grad-hero)', color: row[2] === '—' ? 'rgba(255,255,255,0.5)' : 'white' }}>{row[2]}</div>
              <div style={{ padding: '14px 20px', fontSize: 14, textAlign: 'center', borderTop: '1px solid var(--line)', color: row[3] === '—' ? 'var(--ink-3)' : 'var(--ink)' }}>{row[3]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div className="eyebrow" style={{ textAlign: 'center', marginBottom: 20 }}>Частые вопросы</div>
        {[
          ['Сколько времени занимает тест?', '20–25 минут. Можно прерваться — ответы сохраняются.'],
          ['Можно ли пройти повторно?', 'Да. На «Полном» — один бесплатный повтор через 6 мес. На «Команде» — без ограничений.'],
          ['Чем это отличается от MBTI и других тестов?', 'Мы не относим вас к типу. Измеряем 7 осей с градацией, отделяем естественное поведение от компенсаций и строим модель напряжения. Это рабочая инженерная модель, а не «характеристика».'],
          ['Кто видит результаты?', 'Только вы. На тарифе «Команда» владелец может запросить ограниченный доступ, но только с вашего согласия.'],
        ].map(([q, a], i) => (
          <details key={i} style={{ borderTop: '1px solid var(--line)', padding: '20px 0' }}>
            <summary style={{
              fontSize: 17, fontWeight: 600, cursor: 'pointer',
              listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              {q}<span style={{ color: 'var(--ink-3)', fontSize: 20, lineHeight: 1 }}>+</span>
            </summary>
            <div style={{ fontSize: 15, color: 'var(--ink-2)', marginTop: 12, lineHeight: 1.6 }}>{a}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
