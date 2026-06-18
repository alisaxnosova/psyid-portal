'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { CSSProperties } from 'react';

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  navy1:      '#050C2E',
  navy2:      '#0B1A56',
  blue:       '#2244E0',
  blueSoft:   '#6A85F0',
  coral:      '#FF5A5A',
  orange:     '#FF7A3D',
  orangeHot:  '#FF9540',
  gold:       '#FFC074',
  bone:       '#F6F1EA',
  paper:      '#FBF7F1',
  ink:        '#0E1230',
  inkSoft:    '#4F5470',
  inkMute:    '#8A8FA8',
  line:       '#E5DED2',
};

// ── Profiles ──────────────────────────────────────────────────────────────────
const PROFILES: Record<string, [string, string]> = {
  'I,S,T,J': ['Опора',              'Надёжен до основания. Любит чёткие правила, законченные задачи, план, который пройдёт встречи с реальностью.'],
  'I,S,F,J': ['Хранитель',          'Помнит у всех всё. Постоянный, верный, первым замечает, что у друга плохой день.'],
  'I,N,T,J': ['Стратег',            'Играет в долгую. Тихо строит план в голове, пока остальные ещё обсуждают.'],
  'I,N,F,J': ['Тихий архитектор',   'Рано видит людей насквозь, заботится о тонкостях. Закрытый, целеустремлённый, удивительно настойчивый.'],
  'I,S,T,P': ['Мастер-наладчик',    'Спокоен под давлением, бесконечно практичен. Дайте сломанное и немного пространства.'],
  'I,S,F,P': ['Мастер',             'Учится руками, чувствует тонко. Мягкий снаружи — твёрдый внутри о важном.'],
  'I,N,T,P': ['Исследователь',      'Живёт в идеях. С удовольствием разбирает мир на кусочки — и иногда забывает рассказать о выводах.'],
  'I,N,F,P': ['Мечтатель',          'Тихо изобретательный, ведомый внутренним компасом. Нужно пространство — и крепко берётся, когда выбрал.'],
  'E,S,T,J': ['Организатор',        'Делает дела и приводит порядок. Ясный, справедливый, хорош в роли лидера.'],
  'E,S,F,J': ['Хозяин',             'Клей любой компании. Тёплый, практичный, незаметно следит, чтобы всем было хорошо.'],
  'E,N,T,J': ['Командор',           'Видит цель и путь к ней мгновенно. Рождён организовывать людей.'],
  'E,N,F,J': ['Капитан',            'Соединяет людей и помогает им расти. Ведёт сердцем, помнит имена.'],
  'E,S,T,P': ['Деятель',            'Сначала действие, потом теория. Любит вызов, риск и задачи, которые надо решить сейчас.'],
  'E,S,F,P': ['Артист',             'Живёт здесь и сейчас, приносит праздник. Учится на ногах, перед публикой.'],
  'E,N,T,P': ['Спорщик',            'Любит спор ради спора. Быстрый, дерзкий, не выносит очевидных ответов.'],
  'E,N,F,P': ['Искра',              'Фонтан идей и энтузиазма. Зажигает комнату, потом три проекта — одновременно.'],
};

// ── Radar helpers ─────────────────────────────────────────────────────────────
type AxisKey = 'top' | 'right' | 'bot' | 'left';
const CX = 230, CY = 230;
const rad    = (v: number) => 60 + (Math.abs(v) / 2) * 150;
const pt     = (axis: AxisKey, r: number) => {
  if (axis === 'top')   return { x: CX,     y: CY - r };
  if (axis === 'right') return { x: CX + r, y: CY     };
  if (axis === 'bot')   return { x: CX,     y: CY + r };
  return                       { x: CX - r, y: CY     };
};
const letter = (axis: AxisKey, v: number) => {
  if (axis === 'top')   return v >= 0 ? 'E' : 'I';
  if (axis === 'right') return v >= 0 ? 'N' : 'S';
  if (axis === 'bot')   return v >= 0 ? 'F' : 'T';
  return                       v >= 0 ? 'P' : 'J';
};

const TAG: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  fontFamily: "'Geist Mono', monospace", fontSize: 11.5, letterSpacing: '0.12em',
  textTransform: 'uppercase', color: C.inkMute,
};
const FLOAT_LABEL: CSSProperties = {
  position: 'absolute', fontFamily: "'Geist Mono', monospace",
  fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
  color: 'rgba(255,255,255,0.75)', padding: '7px 11px',
  background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)',
  borderRadius: 999, backdropFilter: 'blur(10px)', whiteSpace: 'nowrap',
};

const DOT = <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.orange, display: 'inline-block', flexShrink: 0 }}/>;

export default function Landing() {
  const [vals, setVals]       = useState<Record<AxisKey, number>>({ top: 0, right: 1, bot: 2, left: -1 });
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const pT = pt('top',   rad(vals.top));
  const pR = pt('right', rad(vals.right));
  const pB = pt('bot',   rad(vals.bot));
  const pL = pt('left',  rad(vals.left));
  const polyPts  = `${pT.x},${pT.y} ${pR.x},${pR.y} ${pB.x},${pB.y} ${pL.x},${pL.y}`;
  const bloomRx  = Math.max(rad(vals.left), rad(vals.right)) * 0.55 + 20;
  const bloomRy  = Math.max(rad(vals.top),  rad(vals.bot))   * 0.85;
  const typeCode = (['top','right','bot','left'] as AxisKey[]).map(a => letter(a, vals[a])).join(',');
  const [profName, profDesc] = PROFILES[typeCode] ?? ['Свой профиль', 'Уникальная смесь всех четырёх осей.'];
  const setAxis  = (axis: AxisKey, v: number) => setVals(p => ({ ...p, [axis]: v }));

  return (
    <div style={{ fontFamily: "'Geist', 'Onest', system-ui, sans-serif", background: C.paper }}>

      {/* ════════════════ HERO ════════════════ */}
      <header className="r-hero-wrap" style={{ position: 'relative', overflow: 'hidden', color: '#fff', isolation: 'isolate' }}>
        <div style={{
          position: 'absolute', inset: 0, zIndex: -2,
          background: `
            radial-gradient(ellipse 65% 55% at 88% 88%, rgba(255,165,72,.85) 0%, transparent 60%),
            radial-gradient(ellipse 55% 45% at 72% 70%, rgba(255,98,82,.85) 0%, transparent 65%),
            radial-gradient(ellipse 50% 50% at 30% 38%, rgba(58,98,232,.85) 0%, transparent 60%),
            radial-gradient(ellipse 70% 70% at 12% 12%, rgba(15,30,110,1) 0%, transparent 60%),
            linear-gradient(125deg, #050B36 0%, #0E1F6E 30%, #4B266A 55%, #B23A4C 75%, #FF823F 100%)
          `,
        }}/>

        {/* ── Nav ── */}
        <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 60, padding: '20px 28px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999,
            padding: '8px 8px 8px 20px',
          }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em', color: '#fff', flexShrink: 0 }}>
              <span style={{ width: 30, height: 30, borderRadius: 9, background: '#fff', position: 'relative', flexShrink: 0, overflow: 'hidden', display: 'inline-block' }}>
                <span style={{ position: 'absolute', left: 5, top: 5, width: 9, height: 9, borderRadius: '50%', background: C.blue }}/>
                <span style={{ position: 'absolute', right: 5, bottom: 5, width: 9, height: 9, borderRadius: 3, background: C.orangeHot }}/>
              </span>
              Psy<span style={{ color: C.orangeHot }}>ID</span>
            </Link>

            <div className="r-nav-links">
              {[['#how','Как работает'],['#explore','Подобрать'],['#inside','Паспорт'],['#price','Цены'],['#faq','Вопросы']].map(([h, l]) => (
                <a key={h} href={h} style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.78)' }}>{l}</a>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <Link href="/admin" title="Admin" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)',
                color: 'rgba(255,255,255,0.65)',
              }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M13.5 2.5a2.5 2.5 0 0 0-3.45 2.3l-6.3 6.3a2.5 2.5 0 1 0 1.15 1.15l6.3-6.3A2.5 2.5 0 0 0 13.5 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href="/test" style={{ background: '#fff', color: C.ink, padding: '9px 18px', borderRadius: 999, fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                Пройти тест →
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Hero body ── */}
        <div className="r-wrap r-hero">
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.16)', borderRadius: 999,
              padding: '9px 16px 9px 12px', marginBottom: 28,
              fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#fff', fontWeight: 500,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orangeHot}, ${C.coral})`, boxShadow: `0 0 10px ${C.orangeHot}`, display: 'inline-block', flexShrink: 0 }}/>
              PSYID · Психологический паспорт ребёнка
            </div>

            <h1 style={{ fontSize: 'clamp(40px, 5.5vw, 82px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.02, color: '#fff', maxWidth: '14ch', margin: 0 }}>
              Помогите ребёнку найти{' '}
              <span style={{ background: 'linear-gradient(95deg, #FF6385, #FF7E6B)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>себя</span>
              {' '}—<br/>
              <span style={{ background: 'linear-gradient(95deg, #FF9447, #FFC474)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>не навязывая</span>
            </h1>

            <p style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', lineHeight: 1.55, color: 'rgba(255,255,255,0.78)', maxWidth: '46ch', margin: '28px 0 32px' }}>
              Тест за 15 минут строит психологический паспорт: 4 оси характера, сильные стороны и профессии, в которых ребёнок будет по-настоящему эффективен.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/test" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10, borderRadius: 999,
                padding: '14px 24px', fontWeight: 700, fontSize: 15, color: '#fff',
                background: 'linear-gradient(95deg, #FF5C72, #FF8A45)',
                boxShadow: '0 12px 28px -8px rgba(255,114,80,.6)',
              }}>
                Пройти тест бесплатно <span>↗</span>
              </Link>
              <button style={{ borderRadius: 999, padding: '12px 20px', fontWeight: 600, fontSize: 14, background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.4)', cursor: 'pointer', fontFamily: 'inherit' }}>
                Смотреть пример
              </button>
            </div>

            <div style={{ marginTop: 24, fontFamily: "'Geist Mono', monospace", fontSize: 12, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.55)' }}>
              <b style={{ color: '#fff', fontWeight: 500 }}>Бесплатно</b>
              <span style={{ margin: '0 10px', opacity: 0.4 }}>·</span>
              <b style={{ color: '#fff', fontWeight: 500 }}>15 минут</b>
              <span style={{ margin: '0 10px', opacity: 0.4 }}>·</span>
              <b style={{ color: '#fff', fontWeight: 500 }}>результат сразу</b>
            </div>
          </div>

          {/* ── Static radar ── */}
          <div className="radar-stage" style={{ position: 'relative', display: 'grid', placeItems: 'center' }}>
            <svg viewBox="0 0 460 460" style={{ width: '100%', maxWidth: 480, height: 'auto', filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.3))' }} aria-hidden="true">
              <defs>
                <radialGradient id="hBloom" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FF6B7A" stopOpacity="0.95"/>
                  <stop offset="40%" stopColor="#FF5A4D" stopOpacity="0.65"/>
                  <stop offset="100%" stopColor="#FF6B7A" stopOpacity="0"/>
                </radialGradient>
                <radialGradient id="hDot" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#fff"/>
                  <stop offset="60%" stopColor="#FFD3A5"/>
                  <stop offset="100%" stopColor="#FF8C42"/>
                </radialGradient>
                <filter id="hGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="14" result="blur"/>
                  <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <g stroke="rgba(255,255,255,0.18)" strokeWidth="1" fill="none">
                <circle cx="230" cy="230" r="210"/><circle cx="230" cy="230" r="160"/>
                <circle cx="230" cy="230" r="110"/><circle cx="230" cy="230" r="60"/>
              </g>
              <g stroke="rgba(255,255,255,0.22)" strokeWidth="1">
                <line x1="230" y1="20" x2="230" y2="440"/>
                <line x1="20" y1="230" x2="440" y2="230"/>
              </g>
              <ellipse cx="230" cy="230" rx="60" ry="170" fill="url(#hBloom)" filter="url(#hGlow)" opacity="0.85"/>
              <polygon points="230,50 350,230 230,410 110,230" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.5"/>
              <circle cx="230" cy="50"  r="6" fill="url(#hDot)" stroke="#fff" strokeWidth="1.5"/>
              <circle cx="350" cy="230" r="6" fill="url(#hDot)" stroke="#fff" strokeWidth="1.5"/>
              <circle cx="230" cy="410" r="6" fill="url(#hDot)" stroke="#fff" strokeWidth="1.5"/>
              <circle cx="110" cy="230" r="6" fill="url(#hDot)" stroke="#fff" strokeWidth="1.5"/>
            </svg>
            <div style={{ ...FLOAT_LABEL, top: '6%', left: '50%', transform: 'translateX(-50%)' }}>Энергия<b style={{ color: '#fff', fontFamily: 'inherit', fontSize: 14, marginLeft: 6 }}>0.74</b></div>
            <div style={{ ...FLOAT_LABEL, right: 0, top: '50%', transform: 'translateY(-50%)' }}>Внимание<b style={{ color: '#fff', fontFamily: 'inherit', fontSize: 14, marginLeft: 6 }}>0.61</b></div>
            <div style={{ ...FLOAT_LABEL, bottom: '6%', left: '50%', transform: 'translateX(-50%)' }}>Решения<b style={{ color: '#fff', fontFamily: 'inherit', fontSize: 14, marginLeft: 6 }}>0.83</b></div>
            <div style={{ ...FLOAT_LABEL, left: 0, top: '50%', transform: 'translateY(-50%)' }}>Структура<b style={{ color: '#fff', fontFamily: 'inherit', fontSize: 14, marginLeft: 6 }}>0.42</b></div>
            <div style={{
              position: 'absolute', right: 16, bottom: 16,
              background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.16)',
              padding: '10px 14px', borderRadius: 14, backdropFilter: 'blur(14px)',
              fontFamily: "'Geist Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.06em',
            }}>
              Профиль ·{' '}
              <b style={{ display: 'block', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', marginTop: 2 }}>
                Мечтатель-исследователь
              </b>
            </div>
          </div>
        </div>
      </header>

      {/* ════════════════ FEATURES ════════════════ */}
      <section style={{ background: C.ink, color: '#fff', padding: '72px 0' }}>
        <div className="r-wrap r-feat">
          {[
            { grad: `linear-gradient(135deg, ${C.blue}, ${C.blueSoft})`,
              icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="2" width="16" height="20" rx="3" stroke="#fff" strokeWidth="1.8"/><line x1="6" y1="8" x2="14" y2="8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/><line x1="6" y1="12" x2="14" y2="12" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/><line x1="6" y1="16" x2="11" y2="16" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>,
              title: 'Психологический паспорт', desc: '24 страницы — печатный и цифровой. Понятный язык для родителя, бережный — для ребёнка.' },
            { grad: `linear-gradient(135deg, ${C.coral}, ${C.orangeHot})`,
              icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 18L9 12l4 2 6-8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="12" r="1.5" fill="#fff"/><circle cx="13" cy="14" r="1.5" fill="#fff"/><circle cx="19" cy="6" r="1.5" fill="#fff"/></svg>,
              title: 'Карта сильных сторон', desc: 'Что у ребёнка получается лучше всего, куда стоит направлять усилия, а где — отпустить.' },
            { grad: `linear-gradient(135deg, ${C.orangeHot}, ${C.gold})`,
              icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="#fff" strokeWidth="1.8"/><circle cx="11" cy="11" r="3" fill="#fff"/><line x1="11" y1="3" x2="11" y2="6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/><line x1="11" y1="16" x2="11" y2="19" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/><line x1="3" y1="11" x2="6" y2="11" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/><line x1="16" y1="11" x2="19" y2="11" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>,
              title: 'Подходящие направления', desc: 'Профессии, увлечения и виды занятий, в которых ребёнок будет по-настоящему эффективен.' },
          ].map((f, i) => (
            <div key={i} style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0))', borderRadius: 20, padding: '28px 24px 26px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center', marginBottom: 20, background: f.grad }}>{f.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', margin: 0, lineHeight: 1.55 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section id="how" className="r-section">
        <div className="r-wrap">
          <div style={{ maxWidth: 680, marginBottom: 48 }}>
            <div style={TAG}>{DOT}Как это работает</div>
            <h2 style={{ fontSize: 'clamp(32px,4vw,56px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '16px 0 0' }}>
              Три шага — и у вас в руках{' '}
              <span style={{ background: `linear-gradient(95deg, ${C.blue}, ${C.blueSoft})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>паспорт</span>
              , а не приговор.
            </h2>
            <p style={{ fontSize: 16, color: C.inkSoft, margin: '18px 0 0' }}>
              Нет клинических опросников и пугающей лексики. Ребёнок проходит сценарии, написанные для его возраста.
            </p>
          </div>
          <div className="r-steps">
            {[
              { n: '1', l: 'Шаг 01', t: 'Ребёнок проходит тест', d: '15 минут на любом экране. Не опросник, а серия сценариев — детям обычно нравится.', g: `linear-gradient(135deg, ${C.blue}, ${C.blueSoft})` },
              { n: '2', l: 'Шаг 02', t: 'Мы строим паспорт',     d: 'Ответы ложатся в 4 оси характера. Каждое утверждение проверяет психолог, у каждого вывода есть оценка уверенности.', g: `linear-gradient(135deg, ${C.coral}, ${C.orangeHot})` },
              { n: '3', l: 'Шаг 03', t: 'Вы видите карту',       d: 'На день — цифровой паспорт. На неделю — печатный. Внутри: сильные стороны, профессии и 3 эксперимента на четверть.', g: `linear-gradient(135deg, ${C.orangeHot}, ${C.gold})` },
            ].map(s => (
              <div key={s.n} style={{ background: '#fff', border: `1px solid ${C.line}`, borderRadius: 28, padding: '32px 26px 30px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '6px 14px 6px 6px', background: '#F0EAE0', borderRadius: 999, marginBottom: 20, fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.inkSoft }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: s.g, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12 }}>{s.n}</span>
                  {s.l}
                </div>
                <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 10 }}>{s.t}</h3>
                <p style={{ color: C.inkSoft, fontSize: 14.5, margin: 0, lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ EXPLORER ════════════════ */}
      <section id="explore" className="r-section" style={{ background: C.ink, color: '#fff', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: -1, background: `radial-gradient(ellipse 50% 50% at 80% 30%, rgba(255,128,72,0.25) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(48,87,224,0.30) 0%, transparent 60%)` }}/>
        <div className="r-wrap">
          <div style={{ maxWidth: 680, marginBottom: 48 }}>
            <div style={{ ...TAG, color: 'rgba(255,255,255,0.55)' }}>{DOT}Попробуйте · 20 секунд</div>
            <h2 style={{ fontSize: 'clamp(32px,4vw,56px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#fff', margin: '16px 0 0' }}>
              Соберите профиль по{' '}
              <span style={{ background: `linear-gradient(95deg, ${C.orangeHot}, ${C.gold})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>4 осям</span>.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', margin: '18px 0 0' }}>
              Двигайте точки на каждой оси — фигура меняется и появляется живое описание. Так и работает паспорт, только на 24 страницы глубже.
            </p>
          </div>

          <div className="r-two">
            <div>
              <svg viewBox="0 0 460 460" style={{ width: '100%', maxWidth: 480, height: 'auto', display: 'block', margin: '0 auto' }} aria-hidden="true">
                <defs>
                  <radialGradient id="eBloom" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FF7A65" stopOpacity="0.95"/>
                    <stop offset="50%" stopColor="#FF5A4D" stopOpacity="0.55"/>
                    <stop offset="100%" stopColor="#FF7A65" stopOpacity="0"/>
                  </radialGradient>
                  <radialGradient id="eDot" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fff"/>
                    <stop offset="60%" stopColor="#FFD3A5"/>
                    <stop offset="100%" stopColor="#FF8C42"/>
                  </radialGradient>
                  <filter id="eGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="16" result="blur"/>
                    <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                  </filter>
                </defs>
                <g stroke="rgba(255,255,255,0.16)" strokeWidth="1" fill="none">
                  <circle cx="230" cy="230" r="210"/><circle cx="230" cy="230" r="160"/>
                  <circle cx="230" cy="230" r="110"/><circle cx="230" cy="230" r="60"/>
                </g>
                <g stroke="rgba(255,255,255,0.22)" strokeWidth="1">
                  <line x1="230" y1="20" x2="230" y2="440"/>
                  <line x1="20" y1="230" x2="440" y2="230"/>
                </g>
                <g fill="rgba(255,255,255,0.65)" fontFamily="monospace" fontSize="11" letterSpacing="2">
                  <text x="230" y="14" textAnchor="middle">ЭНЕРГИЯ</text>
                  <text x="450" y="234" textAnchor="end">ВНИМАНИЕ</text>
                  <text x="230" y="454" textAnchor="middle">РЕШЕНИЯ</text>
                  <text x="10" y="234" textAnchor="start">СТРУКТУРА</text>
                </g>
                <ellipse cx="230" cy="230" rx={bloomRx} ry={bloomRy} fill="url(#eBloom)" filter="url(#eGlow)" opacity="0.85"/>
                <polygon points={polyPts} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1.6"/>
                <circle cx="230"  cy={pT.y} r="7" fill="url(#eDot)" stroke="#fff" strokeWidth="1.6"/>
                <circle cx={pR.x} cy="230"  r="7" fill="url(#eDot)" stroke="#fff" strokeWidth="1.6"/>
                <circle cx="230"  cy={pB.y} r="7" fill="url(#eDot)" stroke="#fff" strokeWidth="1.6"/>
                <circle cx={pL.x} cy="230"  r="7" fill="url(#eDot)" stroke="#fff" strokeWidth="1.6"/>
              </svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {([
                { key: 'top'   as AxisKey, title: 'Энергия',   sub: 'как восстанавливается', left: 'В одиночестве', right: 'С другими' },
                { key: 'right' as AxisKey, title: 'Внимание',  sub: 'на что направлено',     left: 'Факты',        right: 'Идеи'      },
                { key: 'bot'   as AxisKey, title: 'Решения',   sub: 'на чём основаны',       left: 'Логика',       right: 'Чувства'   },
                { key: 'left'  as AxisKey, title: 'Структура', sub: 'что комфортнее',         left: 'План',         right: 'Свобода'   },
              ] as const).map(ax => (
                <div key={ax.key} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 16, padding: '16px 18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>{ax.title}</span>
                    <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>{ax.sub}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 30px 30px 30px 30px 30px 1fr', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{ax.left}</span>
                    {([-2,-1,0,1,2] as const).map(v => {
                      const sel = vals[ax.key] === v;
                      return (
                        <button key={v} onClick={() => setAxis(ax.key, v)} style={{
                          height: 30, borderRadius: 8, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.10)',
                          background: sel ? `linear-gradient(135deg, ${C.orangeHot}, ${C.coral})` : 'rgba(255,255,255,0.06)',
                          boxShadow: sel ? '0 6px 16px -4px rgba(255,128,72,.6)' : 'none',
                          transition: 'all .15s', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <span style={{ width: sel ? 7 : 5, height: sel ? 7 : 5, borderRadius: '50%', background: sel ? '#fff' : 'rgba(255,255,255,0.4)', transition: 'all .15s', display: 'inline-block' }}/>
                        </button>
                      );
                    })}
                    <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.8)', fontWeight: 500, textAlign: 'right' }}>{ax.right}</span>
                  </div>
                </div>
              ))}

              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 20, padding: '22px 24px', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: '-0.04em', lineHeight: 1, background: `linear-gradient(95deg, ${C.orangeHot}, ${C.gold})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                  {typeCode.replace(/,/g, '')}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em' }}>{profName}</div>
                  <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.65)', marginTop: 5, lineHeight: 1.5 }}>{profDesc}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ INSIDE PASSPORT ════════════════ */}
      <section id="inside" className="r-section" style={{ background: '#fff' }}>
        <div className="r-wrap r-inside">
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={TAG}>{DOT}Внутри паспорта</div>
              <h2 style={{ fontSize: 'clamp(32px,4vw,56px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '16px 0 0' }}>
                Шесть вещей, которые вы{' '}
                <span style={{ background: `linear-gradient(95deg, ${C.coral}, ${C.orangeHot})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>узнаете</span>.
              </h2>
              <p style={{ fontSize: 16, color: C.inkSoft, margin: '18px 0 0' }}>
                Каждый раздел отвечает на вопрос, который родители реально задают нам перед тестом.
              </p>
            </div>
            <div className="r-chips">
              {[
                { n: '01', t: 'Как знакомится с новыми людьми' },
                { n: '02', t: 'Как выбирает между двумя хорошими вариантами' },
                { n: '03', t: 'Что восстанавливает силы после школы' },
                { n: '04', t: 'Где подтолкнуть, где отступить' },
                { n: '05', t: 'Профессии, в которых будет эффективен' },
                { n: '06', t: 'Три эксперимента на эту четверть' },
              ].map(c => (
                <div key={c.n} style={{ background: C.bone, border: `1px solid ${C.line}`, borderRadius: 18, padding: '18px 18px 20px' }}>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.orange, fontWeight: 600 }}>{c.n}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginTop: 10, lineHeight: 1.25, letterSpacing: '-0.01em' }}>{c.t}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: `linear-gradient(135deg, ${C.navy1} 0%, ${C.navy2} 60%, #1A2D6E 100%)`, color: '#fff', borderRadius: 28, padding: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -60, top: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,128,72,0.3) 0%, transparent 70%)', pointerEvents: 'none' }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', position: 'relative' }}>
              <span>Страница 14 / 24</span><span>Раздел · Решения</span>
            </div>
            <div style={{ fontWeight: 500, fontSize: 'clamp(18px, 2vw, 24px)', lineHeight: 1.4, margin: '24px 0', letterSpacing: '-0.01em', position: 'relative' }}>
              «Лиза принимает решения, посидев с двумя хорошими вариантами. Поспешные выборы идут плохо.{' '}
              <b style={{ background: `linear-gradient(95deg, ${C.orangeHot}, ${C.gold})`, color: '#fff', padding: '0 7px', borderRadius: 5, fontWeight: 700 }}>Дайте ей ночь</b>».
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', position: 'relative' }}>
              <span>PsyID · Психологический паспорт</span>
              <span style={{ color: C.gold }}>Уверенность · 0.82</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ STATS ════════════════ */}
      <section className="r-section" style={{ position: 'relative', overflow: 'hidden', color: '#fff' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: -1, background: 'linear-gradient(95deg, #1228A0 0%, #2244E0 35%, #FF5A6E 70%, #FF823F 100%)' }}/>
        <div className="r-wrap">
          <div style={{ maxWidth: 640, marginBottom: 0 }}>
            <div style={{ ...TAG, color: 'rgba(255,255,255,0.65)' }}>{DOT}Методология</div>
            <h2 style={{ fontSize: 'clamp(32px,4vw,56px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#fff', margin: '16px 0 18px', maxWidth: '18ch' }}>
              Строго там, где это важно.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', margin: 0 }}>
              Каждый пункт прошёл два круга экспертизы и серию полевых проверок. Никаких ярлыков.
            </p>
          </div>
          <div className="r-stats">
            {[
              { n: '4',    l: 'оси характера, адаптированные для возраста 8–14' },
              { n: '2',    l: 'детских психолога рецензируют каждый пункт' },
              { n: '412',  l: 'детей в выборке до релиза' },
              { n: '0.85', l: 'средняя уверенность утверждений в паспорте' },
            ].map(s => (
              <div key={s.n} style={{ border: '1px solid rgba(255,255,255,0.18)', borderRadius: 18, padding: '24px 22px', background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(10px)' }}>
                <div style={{ fontWeight: 800, fontSize: 'clamp(40px, 4vw, 60px)', letterSpacing: '-0.04em', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 13, marginTop: 12, color: 'rgba(255,255,255,0.82)', lineHeight: 1.4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ TESTIMONIAL ════════════════ */}
      <section className="r-section" style={{ textAlign: 'center' }}>
        <div className="r-wrap">
          <p style={{ fontWeight: 600, fontSize: 'clamp(22px,3vw,44px)', lineHeight: 1.25, letterSpacing: '-0.025em', maxWidth: '24ch', margin: '0 auto' }}>
            «Я ждала очередного теста. И получила{' '}
            <span style={{ background: `linear-gradient(95deg, ${C.coral}, ${C.orangeHot})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>документ</span>
            , который наконец объясняет, как моя дочь смотрит на мир».
          </p>
          <div style={{ marginTop: 28, fontFamily: "'Geist Mono', monospace", fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.inkMute }}>
            — <b style={{ color: C.ink, fontWeight: 600 }}>Анна Д.</b> · мама двоих · Тбилиси
          </div>
        </div>
      </section>

      {/* ════════════════ PRICING ════════════════ */}
      <section id="price" style={{ padding: '0 0 90px' }}>
        <div className="r-wrap">
          <div style={{ maxWidth: 640, marginBottom: 48 }}>
            <div style={TAG}>{DOT}Цена</div>
            <h2 style={{ fontSize: 'clamp(32px,4vw,56px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '16px 0 0' }}>
              Два способа{' '}
              <span style={{ background: `linear-gradient(95deg, ${C.coral}, ${C.orangeHot})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>начать</span>.
            </h2>
            <p style={{ fontSize: 16, color: C.inkSoft, margin: '18px 0 0' }}>Без подписки. Бесплатная доставка в РФ и Грузии.</p>
          </div>
          <div className="r-price">
            <div style={{ borderRadius: 28, padding: '36px 32px', border: `1px solid ${C.line}`, background: '#fff', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.inkMute }}>Стандарт</div>
              <div style={{ fontWeight: 800, fontSize: 'clamp(48px,5vw,68px)', letterSpacing: '-0.04em', margin: '16px 0 4px', lineHeight: 1 }}>₽4 900</div>
              <div style={{ color: C.inkSoft, fontSize: 14, marginBottom: 24 }}>Полный паспорт — печатный и цифровой.</div>
              <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {['24-страничный психологический паспорт','Печатная версия — доставка за 5 дней','Цифровая версия + карточка для пересылки','Список из 3 экспериментов на четверть'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14 }}>
                    <span style={{ color: C.orange, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/test" style={{ display: 'flex', justifyContent: 'center', padding: '13px 20px', borderRadius: 999, background: 'transparent', color: C.ink, border: `1.5px solid ${C.ink}`, fontWeight: 600, fontSize: 14 }}>
                Начать →
              </Link>
            </div>

            <div style={{ borderRadius: 28, padding: '36px 32px', background: `linear-gradient(135deg, ${C.ink} 0%, #1A2056 100%)`, color: '#fff', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -80, bottom: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,128,72,0.3) 0%, transparent 70%)', pointerEvents: 'none' }}/>
              <div style={{ position: 'absolute', top: 20, right: 20, background: `linear-gradient(95deg, ${C.coral}, ${C.orangeHot})`, color: '#fff', fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '6px 12px', borderRadius: 999, fontWeight: 600 }}>Рекомендуем</div>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.orangeHot, position: 'relative' }}>Паспорт + консультация</div>
              <div style={{ fontWeight: 800, fontSize: 'clamp(48px,5vw,68px)', letterSpacing: '-0.04em', margin: '16px 0 4px', lineHeight: 1, position: 'relative', background: `linear-gradient(95deg, #fff 0%, ${C.gold} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>₽7 900</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 24, position: 'relative' }}>Всё, что в Стандарте, плюс человек, который разберёт паспорт вместе с вами.</div>
              <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, position: 'relative' }}>
                {['Всё из «Стандарта»','45-минутная консультация с детским психологом','План следующих шагов','Поддержка по почте в течение 30 дней'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14 }}>
                    <span style={{ color: C.orangeHot, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/test" style={{ display: 'flex', justifyContent: 'center', padding: '14px 20px', borderRadius: 999, background: 'linear-gradient(95deg, #FF5C72, #FF8A45)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 12px 28px -8px rgba(255,114,80,.6)', position: 'relative' }}>
                Начать →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section id="faq" style={{ padding: '0 0 90px' }}>
        <div className="r-wrap r-faq">
          <div>
            <div style={TAG}>{DOT}Вопросы</div>
            <h2 style={{ fontSize: 'clamp(32px,4vw,56px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '16px 0 0' }}>
              Что родители{' '}
              <span style={{ background: `linear-gradient(95deg, ${C.blue}, ${C.blueSoft})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>спрашивают</span>{' '}
              чаще всего.
            </h2>
            <p style={{ fontSize: 16, color: C.inkSoft, margin: '18px 0 0' }}>То, о чём пишут нам до того, как пройти тест.</p>
          </div>
          <div style={{ borderTop: `1px solid ${C.line}` }}>
            {[
              { q: 'Это не очередной тест из интернета?',  a: 'Нет. Тесты «на каждый день» дают ярлык и гороскоп. PsyID — это 24-страничный документ, прошедший рецензию у психологов. Каждое утверждение опирается на конкретные выборы ребёнка и сопровождается оценкой уверенности.' },
              { q: 'Не загонит ли это ребёнка в рамки?',   a: 'Главный страх — наш тоже. Паспорт построен как стартовая линия, а не приговор. Он открывает разговор: «вот что мы заметили, вот что можно попробовать». Дети растут и меняются — об этом сказано на первой странице.' },
              { q: 'Для какого возраста?',                  a: 'Адаптировано и протестировано для детей 8–14 лет. Формулировки и сценарии написаны под их язык, родительские разделы — под ваш.' },
              { q: 'Сколько занимает тест?',                a: 'Около 15 минут на любом экране, дома. Цифровой паспорт приходит в течение суток, печатный — в течение пяти дней.' },
              { q: 'Кто увидит результаты?',                a: 'Только вы. По умолчанию данные приватны. Вы сами выбираете, делиться ли карточкой с учителем или тренером — мы не публикуем и не продаём ничего никогда.' },
            ].map((item, i) => (
              <div key={i} style={{ borderBottom: `1px solid ${C.line}` }}>
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                  width: '100%', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer',
                  padding: '24px 0', display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 'clamp(16px, 1.5vw, 20px)', letterSpacing: '-0.02em', color: C.ink,
                }}>
                  {item.q}
                  <span style={{
                    flexShrink: 0, width: 30, height: 30, borderRadius: '50%',
                    background: openFaq === i ? `linear-gradient(135deg, ${C.coral}, ${C.orangeHot})` : C.bone,
                    display: 'grid', placeItems: 'center', fontSize: 18,
                    color: openFaq === i ? '#fff' : C.orange,
                    transform: openFaq === i ? 'rotate(45deg)' : 'none',
                    transition: 'all .25s',
                  }}>+</span>
                </button>
                {openFaq === i && (
                  <p style={{ color: C.inkSoft, fontSize: 15, margin: '0 0 24px', maxWidth: '58ch', lineHeight: 1.6 }}>{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section style={{ padding: '0 28px 100px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="r-final" style={{ position: 'relative', overflow: 'hidden', borderRadius: 36, textAlign: 'center', color: '#fff', isolation: 'isolate' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: -1, background: `radial-gradient(ellipse 60% 60% at 75% 80%, rgba(255,165,72,0.85) 0%, transparent 60%), radial-gradient(ellipse 55% 50% at 30% 35%, rgba(48,87,224,0.85) 0%, transparent 60%), linear-gradient(125deg, #0A1240 0%, #1A2A82 40%, #6B2A6A 70%, #FF7335 100%)` }}/>
            <h2 style={{ fontWeight: 800, fontSize: 'clamp(32px,4.5vw,64px)', letterSpacing: '-0.04em', maxWidth: '18ch', margin: '0 auto' }}>
              Дайте ребёнку шанс{' '}
              <span style={{ background: `linear-gradient(95deg, ${C.orangeHot}, ${C.gold})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>быть собой</span>.
            </h2>
            <p style={{ fontSize: 'clamp(15px,1.5vw,18px)', color: 'rgba(255,255,255,0.82)', maxWidth: '44ch', margin: '22px auto 32px' }}>
              15 минут сегодня — карта, которой можно пользоваться годами. Тест бесплатный.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/test" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, borderRadius: 999, padding: '14px 24px', fontWeight: 700, fontSize: 15, background: 'linear-gradient(95deg, #FF5C72, #FF8A45)', color: '#fff', boxShadow: '0 12px 28px -8px rgba(255,114,80,.6)' }}>
                Пройти тест бесплатно ↗
              </Link>
              <button style={{ borderRadius: 999, padding: '12px 20px', fontWeight: 600, fontSize: 14, background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.4)', cursor: 'pointer', fontFamily: 'inherit' }}>
                Смотреть пример
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ FOOTER ════════════════ */}
      <footer style={{ borderTop: `1px solid ${C.line}`, padding: '56px 0 36px', background: C.paper }}>
        <div className="r-wrap">
          <div className="r-foot">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em', color: C.ink, marginBottom: 14 }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: C.ink, position: 'relative', flexShrink: 0, overflow: 'hidden', display: 'inline-block' }}>
                  <span style={{ position: 'absolute', left: 5, top: 5, width: 9, height: 9, borderRadius: '50%', background: C.blue }}/>
                  <span style={{ position: 'absolute', right: 5, bottom: 5, width: 9, height: 9, borderRadius: 3, background: C.orange }}/>
                </span>
                Psy<span style={{ color: C.orange }}>ID</span>
              </div>
              <p style={{ color: C.inkSoft, fontSize: 14, maxWidth: '28ch', lineHeight: 1.6 }}>Психологический паспорт для вашего ребёнка. Разработан вместе с детскими психологами.</p>
            </div>
            {[
              { h: 'Продукт',   links: [['#how','Как это работает'],['#explore','Попробовать'],['#inside','Паспорт'],['#price','Цены']] },
              { h: 'Компания',  links: [['#','О нас'],['#','Методология'],['#','Для школ'],['#','Журнал']] },
              { h: 'Связаться', links: [['#','hello@psyid.com'],['#','Telegram'],['#','Instagram'],['#','Пресс-кит']] },
            ].map(col => (
              <div key={col.h}>
                <h4 style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.inkMute, margin: '0 0 14px', fontWeight: 700 }}>{col.h}</h4>
                {col.links.map(([href, label]) => (
                  <a key={label} href={href} style={{ display: 'block', color: C.inkSoft, fontSize: 14, marginBottom: 9 }}>{label}</a>
                ))}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginTop: 40, paddingTop: 20, borderTop: `1px solid ${C.line}`, fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.inkMute }}>
            <span>© 2026 PsyID · Тбилиси · Берлин</span>
            <span>Приватность · Условия</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
