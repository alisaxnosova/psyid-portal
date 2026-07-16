'use client';

import Link from 'next/link';
import { useSiteLang } from '@/lib/siteLang';
import { PsidNav } from '@/components/landing/PsidNav';
import { PsidFooter } from '@/components/landing/PsidFooter';
import { Starfield, AXES } from '@/components/galaxy';
import { ConstellationGlyph } from '@/components/shared/Mark';

type Bi = { ru: string; en: string };

export default function MethodologyView() {
  const { lang, t } = useSiteLang();
  const L = (b: Bi) => b[lang];

  const BANDS: [string, string, Bi][] = [
    ['5', '#FF5A5A', { ru: 'очень сильный', en: 'very strong' }],
    ['4', '#FF7A3D', { ru: 'сильный', en: 'strong' }],
    ['3', '#8A5CD6', { ru: 'выраженный', en: 'pronounced' }],
    ['2', '#6A85F0', { ru: 'заметный наклон', en: 'a clear lean' }],
    ['1', '#2244E0', { ru: 'лёгкий наклон', en: 'a slight lean' }],
    ['0', '', { ru: 'в балансе', en: 'balanced' }],
  ];

  // playbook vocabulary map: surface word → science term
  const VOCAB: [Bi, Bi][] = [
    [{ ru: 'твоя вселенная', en: 'your universe' }, { ru: 'профиль', en: 'profile' }],
    [{ ru: 'звезда ядра', en: 'core star' }, { ru: 'ось', en: 'axis' }],
    [{ ru: 'планета', en: 'planet' }, { ru: 'фасет', en: 'facet' }],
    [{ ru: 'спутник', en: 'moon' }, { ru: 'нюанс оценки', en: 'nuance / estimated score' }],
    [{ ru: 'линза', en: 'lens' }, { ru: 'контекстная рамка', en: 'contextual frame' }],
    [{ ru: 'созвездие', en: 'constellation' }, { ru: 'тематический отчёт', en: 'thematic report' }],
    [{ ru: 'новый слой света', en: 'a new layer of light' }, { ru: 'лонгитюдный замер', en: 'longitudinal session' }],
    [{ ru: 'твой код', en: 'your code' }, { ru: 'код профиля', en: 'profile code' }],
  ];

  const AXIS_COPY: Bi[] = [
    { ru: 'Откуда берётся энергия — от людей и движения снаружи или из тишины внутри.', en: 'Where energy comes from — the outer world of people and motion, or the quiet within.' },
    { ru: 'Чему ты доверяешь — фактам и деталям или общей картине и связям.', en: 'What you trust — facts and detail, or the whole picture and the links between things.' },
    { ru: 'Как ты решаешь — расчётом и принципами или ценностями и людьми.', en: 'How you decide — by reasoning and principle, or by values and people.' },
    { ru: 'Как встречаешь день — с планом или сохраняя простор для манёвра.', en: 'How you meet the day — with a plan, or by keeping room to move.' },
    { ru: 'Как проходишь напряжение — ровно или живо и реактивно. Новое в ReNo 2.0.', en: 'How you meet pressure — steady, or vivid and reactive. New in ReNo 2.0.' },
  ];

  return (
    <div className="usite">
      {/* cosmic hero band */}
      <header className="surface-deep" style={{ position: 'relative', overflow: 'hidden' }}>
        <Starfield count={80} />
        <PsidNav />
        <div className="wrap" style={{ position: 'relative', zIndex: 5, padding: '132px 0 clamp(56px,8vw,96px)' }}>
          <div style={{ marginBottom: 26 }}><ConstellationGlyph size={56} tone="dark" /></div>
          <div className="eyebrow dash" style={{ marginBottom: 18 }}>{L({ ru: 'Методология · ReNo 2.0', en: 'Methodology · ReNo 2.0' })}</div>
          <h1 className="h-hero" style={{ maxWidth: '16ch' }}>{L({ ru: 'Красота — снаружи. Методология — внутри.', en: 'Beauty on the surface. Method underneath.' })}</h1>
          <p className="lead" style={{ marginTop: 22 }}>{L({ ru: 'Красивая вселенная держится на строгой мерке. Вот как ReNo читает тебя — достаточно, чтобы доверять результату.', en: 'A beautiful universe rests on a strict measure. Here is how ReNo reads you — enough to trust the result.' })}</p>
        </div>
      </header>

      {/* paper body */}
      <main className="surface-paper">
        {/* main principle */}
        <section className="section"><div className="wrap wrap-narrow">
          <blockquote style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(22px,3vw,32px)', letterSpacing: '-.02em', lineHeight: 1.35, color: 'var(--ink)', borderLeft: '3px solid var(--orange)', paddingLeft: 24, maxWidth: '26ch' }}>
            {L({ ru: 'Всё, что светится в твоей вселенной, — измерено. Ничего не выдумано.', en: 'Everything that shines in your universe was measured. Nothing was invented.' })}
          </blockquote>
        </div></section>

        {/* five axes */}
        <section className="section" style={{ paddingTop: 0 }}><div className="wrap wrap-narrow">
          <div className="eyebrow dash violet" style={{ marginBottom: 16 }}>{L({ ru: 'Система координат', en: 'The coordinate system' })}</div>
          <h2 className="h-2" style={{ marginBottom: 32 }}>{L({ ru: 'Пять осей характера', en: 'Five axes of character' })}</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {AXES.map((ax, i) => (
              <div key={ax.key} style={{ display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 18, alignItems: 'center', padding: '20px 0', borderTop: '1px solid var(--line)', ...(i === AXES.length - 1 ? { borderBottom: '1px solid var(--line)' } : {}) }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 15, color: '#fff', background: ax.hue }}>{ax.plus.L}</div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-.02em', color: 'var(--ink)' }}>{ax.name[lang]}{i === 4 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--navy)', background: 'var(--gold)', padding: '2px 7px', borderRadius: 999, marginLeft: 8 }}>{L({ ru: 'новое', en: 'new' })}</span>}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginTop: 2 }}>{L(AXIS_COPY[i])}</div>
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ink-mute)', whiteSpace: 'nowrap' }}>{ax.plus.L} · {ax.minus.L}</div>
              </div>
            ))}
          </div>
        </div></section>

        {/* continuous scale + bands */}
        <section className="section" style={{ paddingTop: 0 }}><div className="wrap wrap-narrow">
          <div className="eyebrow dash violet" style={{ marginBottom: 16 }}>{L({ ru: 'Шкалы, а не типы', en: 'Scales, not types' })}</div>
          <h2 className="h-2" style={{ marginBottom: 20 }}>{L({ ru: 'Непрерывная шкала 0–100', en: 'A continuous 0–100 scale' })}</h2>
          <p style={{ fontSize: 17, lineHeight: 1.72, color: 'var(--ink-soft)', maxWidth: '62ch', marginBottom: 28 }}>
            {L({ ru: 'Каждая ось измеряется непрерывно, а потом переводится в то, что легко прочесть: полюс — куда ты склоняешься — и полосу от 0 до 5, насколько сильно. Полоса — это способ прочтения, а не сама математика. Все расчёты идут по сырому баллу.', en: 'Each axis is measured continuously, then translated into something readable: a pole — which way you lean — and a band from 0 to 5 for how strongly. The band is a reading aid, never the maths. Every calculation runs on the raw score.' })}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {BANDS.map(([digit, bg, word]) => (
              <div key={digit} style={{ display: 'grid', gridTemplateColumns: '44px 1fr', gap: 16, alignItems: 'center', padding: '12px 16px', background: '#fff', border: '1px solid var(--line)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: bg ? '#fff' : 'var(--ink)', background: bg || 'var(--line-dark)' }}>{digit}</div>
                <div style={{ fontSize: 14, color: 'var(--ink-soft)' }}>{L(word)}</div>
              </div>
            ))}
          </div>
        </div></section>

        {/* vocabulary */}
        <section className="section" style={{ paddingTop: 0 }}><div className="wrap wrap-narrow">
          <div className="eyebrow dash violet" style={{ marginBottom: 16 }}>{L({ ru: 'Словарь', en: 'Vocabulary' })}</div>
          <h2 className="h-2" style={{ marginBottom: 12 }}>{L({ ru: 'Чудо — снаружи, конструкт — на глубине', en: 'Wonder on the surface, a construct underneath' })}</h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: 'var(--ink-soft)', maxWidth: '58ch', marginBottom: 28 }}>{L({ ru: 'Каждое слово из вселенной опирается на конструкт из методологии.', en: 'Every word from the universe maps onto a construct from the methodology.' })}</p>
          <div style={{ border: '1px solid var(--line)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
            {VOCAB.map(([surface, science], i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '13px 18px', background: '#fff', borderTop: i ? '1px solid var(--line)' : 'none' }}>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{L(surface)}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-mute)' }}>{L(science)}</span>
              </div>
            ))}
          </div>
        </div></section>

        {/* honest limits + CTA */}
        <section className="section" style={{ paddingTop: 0 }}><div className="wrap wrap-narrow">
          <div style={{ background: 'var(--paper-2)', borderLeft: '3px solid var(--orange)', borderRadius: '0 var(--r-md) var(--r-md) 0', padding: '26px 28px' }}>
            <div className="eyebrow" style={{ color: 'var(--ink-mute)', marginBottom: 12 }}>{L({ ru: 'Честно', en: 'Honestly' })}</div>
            <p style={{ fontSize: 15.5, color: 'var(--ink-soft)', lineHeight: 1.65 }}>{L({ ru: 'Полный инструмент — вопросы, ключ и калибровка — в валидации и остаётся закрытым. Эта страница показывает форму метода, а не его машинерию. Мы скорее покажем рассуждение, чем рецепт.', en: "The full instrument — the questions, the key, and the calibration — is in validation and stays closed. This page shows the shape of the method, not its machinery. We'd rather show our reasoning than our recipe." })}</p>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 34 }}>
            <Link className="btn btn-orange" href="/reno">{t('nav_cta')} <span className="ar">→</span></Link>
            <Link className="btn btn-outline" href="/sources">{L({ ru: 'Источники', en: 'Sources' })}</Link>
          </div>
        </div></section>
      </main>

      <PsidFooter />
    </div>
  );
}
