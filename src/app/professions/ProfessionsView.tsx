'use client';

import Link from 'next/link';
import { useSiteLang } from '@/lib/siteLang';
import { PsidNav } from '@/components/landing/PsidNav';
import { PsidFooter } from '@/components/landing/PsidFooter';
import { Starfield } from '@/components/galaxy';
import { ConstellationGlyph } from '@/components/shared/Mark';

type Bi = { ru: string; en: string };

export default function ProfessionsView() {
  const { lang, t } = useSiteLang();
  const L = (b: Bi) => b[lang];

  const FORMULA: [Bi, Bi, Bi][] = [
    [{ ru: 'Основа', en: 'The floor' }, { ru: 'Модель Голланда', en: "Holland's model" }, { ru: 'Классическая карта из шести типов интересов и рабочих сред — надёжный «пол», на котором стоит подбор.', en: 'The classic map of six interest types and work environments — the solid floor the matching stands on.' }],
    [{ ru: 'Твоё взвешивание', en: 'Your weighting' }, { ru: 'Профиль ReNo', en: 'Your ReNo profile' }, { ru: 'Твои пять осей расставляют веса внутри карты интересов: что ведущее, а что фон.', en: 'Your five axes set the weights inside the interest map: what leads and what is background.' }],
    [{ ru: 'Результат', en: 'The result' }, { ru: 'Число совпадения', en: 'A fit number' }, { ru: 'Оценка 0–100: насколько среда профессии совпадает с твоей природой. Выше — меньше усилий, чтобы быть собой.', en: "A 0–100 score: how far a profession's environment fits your nature. Higher means less effort to be yourself." }],
  ];

  const RIASEC: [string, Bi, Bi][] = [
    ['R', { ru: 'Реалистический', en: 'Realistic' }, { ru: 'Руки, техника, материя. Делать, чинить, строить — там, где виден результат.', en: 'Hands, tools, matter. Making, fixing, building — where the result is visible.' }],
    ['I', { ru: 'Исследовательский', en: 'Investigative' }, { ru: 'Разобраться, как устроено. Анализ, гипотезы, поиск закономерностей.', en: 'Figuring out how things work. Analysis, hypotheses, finding patterns.' }],
    ['A', { ru: 'Артистический', en: 'Artistic' }, { ru: 'Создавать смыслы и формы. Свобода, выражение, оригинальность.', en: 'Making meaning and form. Freedom, expression, originality.' }],
    ['S', { ru: 'Социальный', en: 'Social' }, { ru: 'Быть с людьми и для людей. Учить, помогать, развивать других.', en: 'With people and for people. Teaching, helping, growing others.' }],
    ['E', { ru: 'Предприимчивый', en: 'Enterprising' }, { ru: 'Вести и убеждать. Инициатива, влияние, цель и её достижение.', en: 'Leading and persuading. Initiative, influence, goals and reaching them.' }],
    ['C', { ru: 'Конвенциональный', en: 'Conventional' }, { ru: 'Порядок в системе. Данные, точность, структура и ясные правила.', en: 'Order in a system. Data, precision, structure and clear rules.' }],
  ];

  const MATCHES: { name: Bi; fit: number; tag: string; why: Bi; chips: string[] }[] = [
    { name: { ru: 'Автор / сценарист', en: 'Writer / screenwriter' }, fit: 91, tag: 'A · I', why: { ru: 'Твоя абстракция и работа по ценностям — это про смыслы и истории. Гибкий режим даёт свободу вынашивать идею.', en: 'Your abstraction and values-led decisions are about meaning and story. A flexible mode gives room to grow an idea.' }, chips: ['A4', 'F4', 'V3'] },
    { name: { ru: 'UX-исследователь', en: 'UX researcher' }, fit: 86, tag: 'I · A', why: { ru: 'Тихая внимательность и целостное мышление помогают видеть мотивацию людей раньше, чем они сами её осознают.', en: 'Quiet attentiveness and whole-picture thinking let you see what drives people before they know it themselves.' }, chips: ['A4', 'W2', 'S2'] },
    { name: { ru: 'Продуктовый дизайнер', en: 'Product designer' }, fit: 82, tag: 'A · E', why: { ru: 'Ты держишь картину целиком и решаешь по ценностям — сочетание, из которого рождаются продукты «для людей».', en: 'You hold the whole picture and decide by values — the mix that makes products "for people".' }, chips: ['A4', 'V3', 'F4'] },
    { name: { ru: 'Психолог / коуч', en: 'Psychologist / coach' }, fit: 80, tag: 'S · I', why: { ru: 'Глубина, эмпатия и спокойствие под нагрузкой. Работа один на один — твоя естественная среда, а не сцена.', en: 'Depth, empathy and calm under load. One-on-one work is your natural environment, not a stage.' }, chips: ['S2', 'W2', 'V3'] },
    { name: { ru: 'Исследователь / R&D', en: 'Researcher / R&D' }, fit: 78, tag: 'I · A', why: { ru: 'Любопытство к абстрактному и терпимость к неопределённости. Открытые рамки — топливо, а не риск.', en: 'Curiosity for the abstract and tolerance for uncertainty. Open frames are fuel, not risk.' }, chips: ['A4', 'F4', 'W2'] },
    { name: { ru: 'Куратор / редактор', en: 'Curator / editor' }, fit: 74, tag: 'A · C', why: { ru: 'Чувство целого и вкус к смыслам. Ты собираешь чужие идеи в стройную картину лучше, чем создаёшь шум.', en: "A sense of the whole and a taste for meaning. You gather others' ideas into a clean picture better than you make noise." }, chips: ['A4', 'V3', 'F4'] },
  ];

  return (
    <div className="usite">
      <header className="surface-deep" style={{ position: 'relative', overflow: 'hidden' }}>
        <Starfield count={80} />
        <PsidNav />
        <div className="wrap" style={{ position: 'relative', zIndex: 5, padding: '132px 0 clamp(56px,8vw,96px)' }}>
          <div style={{ marginBottom: 26 }}><ConstellationGlyph size={56} tone="dark" /></div>
          <div className="eyebrow dash blue" style={{ marginBottom: 18 }}>{L({ ru: 'Направления · RIASEC × ReNo', en: 'Directions · RIASEC × ReNo' })}</div>
          <h1 className="h-hero" style={{ maxWidth: '15ch' }}>{L({ ru: 'Профессии, где ты в своей среде', en: 'Professions where you are in your element' })}</h1>
          <p className="lead" style={{ marginTop: 22 }}>{L({ ru: 'Не «кем стать», а где твоя природа работает на тебя. Мы не назначаем профессию — мы оцениваем, насколько тебе придётся себя ломать. Направление — это гипотеза, а не приговор.', en: "Not which job, but where your nature works for you. We don't assign a profession — we estimate how much you'd have to bend yourself. A direction is a hypothesis, not a verdict." })}</p>
        </div>
      </header>

      <main className="surface-paper">
        {/* formula */}
        <section className="section"><div className="wrap">
          <div style={{ maxWidth: 620, marginBottom: 40 }}>
            <div className="eyebrow dash violet" style={{ marginBottom: 16 }}>{L({ ru: 'Как считается совпадение', en: 'How the fit is computed' })}</div>
            <h2 className="h-2">{L({ ru: 'Две проверенные карты, наложенные друг на друга', en: 'Two proven maps, laid over each other' })}</h2>
          </div>
          <div className="grid g-3">
            {FORMULA.map(([label, title, body], i) => (
              <div key={i} className="pcard" style={{ padding: 26 }}>
                <div className="eyebrow" style={{ color: 'var(--ink-mute)', marginBottom: 12 }}>{L(label)}</div>
                <h3 className="h-3" style={{ color: 'var(--ink)', marginBottom: 10 }}>{L(title)}</h3>
                <p style={{ fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{L(body)}</p>
              </div>
            ))}
          </div>
        </div></section>

        {/* RIASEC */}
        <section className="section" style={{ paddingTop: 0 }}><div className="wrap">
          <div style={{ maxWidth: 640, marginBottom: 36 }}>
            <div className="eyebrow dash violet" style={{ marginBottom: 16 }}>{L({ ru: 'Карта интересов', en: 'The interest map' })}</div>
            <h2 className="h-2" style={{ marginBottom: 14 }}>{L({ ru: 'Шесть типов среды', en: 'Six kinds of environment' })}</h2>
            <p style={{ fontSize: 16, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{L({ ru: 'RIASEC — не про личность, а про то, в какой рабочей среде тебе интересно. У большинства ведущих — два-три типа.', en: 'RIASEC is not about personality but about which work environment interests you. Most people lead with two or three types.' })}</p>
          </div>
          <div className="grid g-3">
            {RIASEC.map(([letter, name, desc]) => (
              <div key={letter} className="pcard" style={{ padding: 24, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, flex: 'none', borderRadius: 10, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff', background: 'var(--grad-blue)' }}>{letter}</div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{L(name)}</div>
                  <div style={{ fontSize: 13.5, color: 'var(--ink-soft)', lineHeight: 1.55 }}>{L(desc)}</div>
                </div>
              </div>
            ))}
          </div>
        </div></section>

        {/* example matches */}
        <section className="section" style={{ paddingTop: 0 }}><div className="wrap">
          <div style={{ maxWidth: 640, marginBottom: 36 }}>
            <div className="eyebrow dash violet" style={{ marginBottom: 16 }}>{L({ ru: 'Пример подбора', en: 'A worked example' })}</div>
            <h2 className="h-2" style={{ marginBottom: 12 }}>{L({ ru: 'Как это выглядит для одного профиля', en: 'What it looks like for one profile' })}</h2>
            <p style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--ink-soft)' }}>
              {L({ ru: 'Для профиля', en: 'For the profile' })} <span className="code-pill" style={{ color: 'var(--ink)', background: 'var(--paper-2)', borderColor: 'var(--line)' }}>W2·A4·V3·F4·S2</span>
            </p>
          </div>
          <div className="grid g-2">
            {MATCHES.map((m, i) => (
              <div key={i} className="pcard" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--ink)' }}>{L(m.name)}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--ink-mute)', marginTop: 3 }}>{m.tag}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 30, letterSpacing: '-.03em', background: 'var(--grad-coral)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', lineHeight: 1 }}>{m.fit}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '.08em', color: 'var(--ink-mute)' }}>{L({ ru: 'совпад.', en: 'fit' })}</div>
                  </div>
                </div>
                <div style={{ height: 4, borderRadius: 999, background: 'var(--line)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${m.fit}%`, background: 'linear-gradient(90deg,var(--blue),var(--coral))', borderRadius: 999 }} />
                </div>
                <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{L(m.why)}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 'auto' }}>
                  {m.chips.map((c) => <span key={c} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999, border: '1px solid var(--line)', color: 'var(--ink-soft)' }}>{c}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div></section>

        {/* honesty + CTA */}
        <section className="section" style={{ paddingTop: 0 }}><div className="wrap wrap-narrow">
          <div style={{ background: 'var(--paper-2)', borderLeft: '3px solid var(--orange)', borderRadius: '0 var(--r-md) var(--r-md) 0', padding: '26px 28px', marginBottom: 32 }}>
            <div className="eyebrow" style={{ color: 'var(--ink-mute)', marginBottom: 12 }}>{L({ ru: 'Честно о совпадении', en: 'Honestly about the fit' })}</div>
            <h3 className="h-3" style={{ color: 'var(--ink)', marginBottom: 10 }}>{L({ ru: 'Гипотеза, а не приговор', en: 'A hypothesis, not a verdict' })}</h3>
            <p style={{ fontSize: 15, color: 'var(--ink-soft)', lineHeight: 1.65 }}>{L({ ru: 'Число совпадения — это оценка среды, а не предсказание успеха или зарплаты. Высокое совпадение значит, что тебе будет легче быть собой; низкое — что среда потребует больше усилий, но не закрывает дверь.', en: "The fit number rates an environment, not your success or salary. A high fit means it's easier to be yourself; a low one means the environment asks more effort — but it doesn't close the door." })}</p>
          </div>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <Link className="btn btn-orange" href="/reno">{L({ ru: 'Хочешь увидеть свой список?', en: 'Want to see your list?' })} <span className="ar">→</span></Link>
            <Link className="btn btn-outline" href="/methodology">{t('nav_method')}</Link>
          </div>
        </div></section>
      </main>

      <PsidFooter />
    </div>
  );
}
