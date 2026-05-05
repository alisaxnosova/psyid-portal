'use client';

import Link from 'next/link';
import { ProfileGlyph } from '@/components/shared/ProfileGlyph';

const DEMO_AXES = {
  E: { value: 64 }, N: { value: -21 }, T: { value: 87 }, J: { value: 33 },
};

const AXES_INFO = [
  { id: 'E', name: 'Вектор внимания', color: '#E6337C', left: 'Внутренний', right: 'Внешний', desc: 'Откуда ребёнок черпает энергию — из общения или из уединения' },
  { id: 'N', name: 'Восприятие мира', color: '#8A2FBF', left: 'Конкретное', right: 'Абстрактное', desc: 'Факты и детали или идеи и паттерны — что ближе ребёнку' },
  { id: 'T', name: 'Принятие решений', color: '#FF6EA5', left: 'Логическое', right: 'Ценностное', desc: 'Опирается на критерии или на людей и контекст' },
  { id: 'J', name: 'Организация жизни', color: '#FF8E3C', left: 'Структурный', right: 'Гибкий', desc: 'Предпочитает план и порядок или остаётся открытым к изменениям' },
];

const PRODUCTS = [
  {
    id: 'free', name: 'Бесплатно', price: 0,
    desc: 'Базовый психологический паспорт',
    features: ['4 оси с интенсивностью', 'Топ-3 подходящих профессии', 'Краткий психотип ребёнка', 'Онлайн-отчёт'],
    tag: null,
    cta: 'Пройти тест бесплатно',
    ctaHref: '/test',
  },
  {
    id: 'full', name: 'Полный паспорт', price: 3000,
    desc: 'Развёрнутый профиль с профессиями',
    features: ['Всё из бесплатного', 'Полный список профессий', 'Дорожная карта развития', 'Библиотека материалов', 'PDF-отчёт 20 страниц'],
    tag: 'Хит',
    cta: 'Получить полный паспорт',
    ctaHref: '/test',
  },
  {
    id: 'premium', name: 'С консультацией', price: 6000,
    desc: 'Паспорт + живая консультация специалиста',
    features: ['Всё из полного паспорта', 'Консультация 60 мин.', 'Повторный тест через год', 'Поддержка в мессенджере'],
    tag: null,
    cta: 'Записаться',
    ctaHref: '/test',
  },
];

const REVIEWS = [
  { text: 'Дочь всегда спорила из-за выбора секций. После паспорта поняли, что она «внутренний» тип — и записались на шахматы. Через месяц она сама просит на турниры.', name: 'Анна К.', role: 'Мама, дочь 11 лет' },
  { text: 'Сын хотел в программисты, я видела в нём гуманитария. Результат показал: логика сильная, но ценностный фокус тоже выражен. Пошёл в геймдизайн — доволен оба.', name: 'Светлана М.', role: 'Мама, сын 14 лет' },
  { text: 'Главное — это конкретика. Не «ваш ребёнок творческий», а «организация 87%, структурный тип — подходят роли с чётким результатом». Это работает.', name: 'Дмитрий П.', role: 'Папа, сын 13 лет' },
];

export default function Landing() {
  return (
    <div>
      {/* HERO */}
      <section style={{
        position: 'relative',
        background: 'var(--grad-hero)',
        color: 'white',
        padding: '60px 48px 180px',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '20%', right: '5%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, #E6337C 0%, transparent 70%)',
          opacity: 0.5, filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '30%',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, #FF6EA5 0%, transparent 70%)',
          opacity: 0.3, filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 60, alignItems: 'center', minHeight: 520 }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 100,
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)',
              fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: 28,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5ED4E8', flexShrink: 0 }} />
              PsyID · Психологический паспорт ребёнка
            </div>

            <h1 className="serif" style={{
              fontSize: 80, lineHeight: 1.02, letterSpacing: '-0.035em',
              marginBottom: 24, fontWeight: 700,
            }}>
              Помогите<br/>ребёнку найти{' '}
              <span style={{
                background: 'linear-gradient(95deg, #FF6EA5, #FFC34A)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              }}>себя —<br/>не навязывая</span>
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.55, opacity: 0.85, maxWidth: 540, marginBottom: 36 }}>
              Тест за 15 минут строит психологический паспорт: 4 оси характера, сильные стороны и профессии, в которых ребёнок будет по-настоящему эффективен.
            </p>

            <div style={{ display: 'inline-block', background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(20px)', borderRadius: 100, padding: 6, marginBottom: 16 }}>
              <Link href="/test" className="btn-primary" style={{ padding: '16px 32px', fontSize: 16 }}>
                Пройти тест бесплатно
              </Link>
            </div>
            <div style={{ fontSize: 13, opacity: 0.75, marginLeft: 8 }}>
              Бесплатно · 15 минут · результат сразу
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle, rgba(255,110,165,0.4), transparent 60%)',
              filter: 'blur(40px)', pointerEvents: 'none',
            }} />
            <ProfileGlyph axes={DEMO_AXES} size={420} showLabels />
          </div>
        </div>
      </section>

      {/* Product cards overlapping hero */}
      <section style={{ maxWidth: 1280, margin: '-120px auto 0', padding: '0 48px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.id} product={p} featured={i === 1} />
          ))}
        </div>
      </section>

      {/* Social proof strip */}
      <section style={{ maxWidth: 1280, margin: '80px auto 0', padding: '0 48px' }}>
        <div style={{ display: 'flex', gap: 48, justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { n: '1 500+', l: 'родителей прошли тест' },
            { n: '98%', l: 'говорят «это точно про нашего ребёнка»' },
            { n: '30 дней', l: 'гарантия возврата' },
            { n: '15 мин', l: 'время прохождения' },
          ].map(s => (
            <div key={s.n} style={{ textAlign: 'center' }}>
              <div className="serif" style={{ fontSize: 40, letterSpacing: '-0.03em', color: 'var(--violet)' }}>{s.n}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', maxWidth: 160, lineHeight: 1.4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pain points */}
      <section style={{ maxWidth: 1280, margin: '120px auto', padding: '0 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'flex-start', marginBottom: 64 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 16 }}>Почему это важно</div>
            <h2 className="serif" style={{ fontSize: 56, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              С чем приходят родители перед тестом
            </h2>
          </div>
          <div>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)', marginBottom: 20 }}>
              Мы провели более 50 глубинных интервью с родителями детей 10-16 лет. Вот что они говорят.
            </p>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)' }}>
              Общая боль одна: ребёнок не знает, кем хочет стать — а родители боятся навязать своё и одновременно боятся совсем отпустить.
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {[
            { icon: '🤷', t: '«Всё нравится, но ничего не горит»', d: 'Ребёнок перепробовал кружки и секции, но ни к чему нет настоящей страсти. Родители не знают, это нормально или сигнал.' },
            { icon: '⚔️', t: 'Конфликт «я хочу» vs «надо»', d: 'Ребёнок хочет в блогеры, родители видят инженера. Спорят — но оба действуют интуитивно, без данных.' },
            { icon: '🧩', t: '«Он странный» — или просто другой?', d: 'Ребёнок не такой, как одноклассники. Родители не понимают: это особенность характера или проблема, которую надо решать.' },
            { icon: '🎓', t: 'Куда поступать через 2-3 года?', d: 'Время поджимает. Нужно выбирать профиль в школе, факультет — а ясности нет.' },
          ].map((p, i) => (
            <div key={i} style={{
              border: '1px solid var(--line)', borderRadius: 20, padding: 28,
              background: 'white', display: 'flex', gap: 20,
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: 'var(--bg-2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
              }}>{p.icon}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{p.t}</div>
                <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>{p.d}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 axes */}
      <section style={{ background: 'var(--bg-2)', padding: '120px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'flex-start', marginBottom: 64 }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: 16 }}>Ядро методики</div>
              <h2 className="serif" style={{ fontSize: 56, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                4 оси, по которым дети{' '}
                <span className="grad-text">реально отличаются</span>
              </h2>
            </div>
            <div>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)', marginBottom: 20 }}>
                Каждая ось - это не «да/нет», а шкала с выраженностью: слабое, умеренное, сильное предпочтение.
              </p>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: 'var(--ink-2)' }}>
                Большинство тестов делят детей на коробки. Мы строим многомерный профиль - и показываем, где ребёнок естественен, а где ему приходится себя ломать.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {AXES_INFO.map((a, i) => (
              <div key={a.id} style={{
                border: '1px solid var(--line)', borderRadius: 20, padding: 28,
                display: 'flex', gap: 20, background: 'white',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: a.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: 14,
                }}>0{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{a.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 14 }}>
                    {a.left} ↔ {a.right}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.4, marginBottom: 14 }}>{a.desc}</div>
                  <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 100, position: 'relative' }}>
                    <div style={{
                      position: 'absolute', left: '20%', right: '20%',
                      top: 0, bottom: 0, background: a.color, borderRadius: 100, opacity: 0.4,
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: 1280, margin: '120px auto', padding: '0 48px' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Как это работает</div>
          <h2 className="serif" style={{ fontSize: 56, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            От вопросов до{' '}
            <span className="grad-text">рабочей карты</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { n: '01', t: 'Отвечаете вместе с ребёнком', d: '30-40 утверждений. Карточки: «совсем нет», «когда как», «это про меня». 15 минут.' },
            { n: '02', t: 'Алгоритм строит профиль', d: '4 оси с интенсивностью. Без жёстких типов - только живая конфигурация.' },
            { n: '03', t: 'Профессии по совместимости', d: 'Топ-3 бесплатно. Полный список (40+) в платном паспорте с описаниями.' },
            { n: '04', t: 'Получаете паспорт', d: 'Психотип + сильные стороны + зоны развития + профессии. Онлайн и PDF.' },
          ].map(s => (
            <div key={s.n} className="card" style={{ padding: 28 }}>
              <div className="mono" style={{ fontSize: 32, color: 'var(--magenta)', fontWeight: 500, marginBottom: 20 }}>{s.n}</div>
              <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{s.t}</div>
              <div style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.5 }}>{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section style={{ maxWidth: 1280, margin: '0 auto 120px', padding: '0 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: 'var(--bg-2)', borderRadius: 28, padding: 48 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 16, letterSpacing: '0.08em' }}>
              ОБЫЧНЫЕ ПРОФОРИЕНТАЦИОННЫЕ ТЕСТЫ
            </div>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                'Делят детей на жёсткие типы и профессии',
                'Не учитывают интенсивность предпочтений',
                'Результат устаревает через год',
                'Только «левое полушарие» или «правое»',
                'Нет понимания, почему именно эти профессии',
              ].map(x => (
                <li key={x} style={{ display: 'flex', gap: 12, fontSize: 15, color: 'var(--ink-2)' }}>
                  <span style={{ color: 'var(--ink-3)', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>✕</span>{x}
                </li>
              ))}
            </ul>
          </div>
          <div style={{
            background: 'var(--grad-hero)', color: 'white',
            borderRadius: 28, padding: 48, position: 'relative', overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', top: '-30%', right: '-20%',
              width: 400, height: 400, borderRadius: '50%',
              background: 'radial-gradient(circle, #FF6EA5 0%, transparent 70%)',
              opacity: 0.5, filter: 'blur(40px)', pointerEvents: 'none',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.7, marginBottom: 16, letterSpacing: '0.1em' }}>
                PSYID
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  'Живой профиль — 4 оси с интенсивностью',
                  'Показывает выраженность каждой черты',
                  'Актуален годами: можно пересдать бесплатно',
                  'Профессии с объяснением «почему подходит»',
                  'Дорожная карта развития под психотип',
                ].map(x => (
                  <li key={x} style={{ display: 'flex', gap: 12, fontSize: 15 }}>
                    <span style={{ color: '#FF6EA5', fontSize: 18, lineHeight: 1, flexShrink: 0 }}>✓</span>{x}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section style={{ background: 'var(--bg-2)', padding: '120px 48px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div className="eyebrow" style={{ marginBottom: 16 }}>Отзывы</div>
          <h2 className="serif" style={{ fontSize: 52, letterSpacing: '-0.025em', marginBottom: 48, maxWidth: 780, lineHeight: 1.1 }}>
            Что говорят родители после теста
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {REVIEWS.map((r, i) => (
              <div key={i} className="card" style={{ padding: 32 }}>
                <div style={{ color: 'var(--magenta)', fontSize: 20, marginBottom: 16 }}>★★★★★</div>
                <div style={{ fontSize: 16, lineHeight: 1.55, marginBottom: 24, color: 'var(--ink-2)' }}>«{r.text}»</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 20, borderTop: '1px solid var(--line)' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', background: 'var(--grad)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 600, fontSize: 16, flexShrink: 0,
                  }}>{r.name[0]}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{r.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Big CTA */}
      <section style={{ maxWidth: 1280, margin: '80px auto 120px', padding: '0 48px' }}>
        <div style={{
          background: 'var(--grad-hero)', color: 'white',
          borderRadius: 32, padding: '80px 60px',
          position: 'relative', overflow: 'hidden', textAlign: 'center',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, rgba(230,51,124,0.4), transparent 60%)',
            pointerEvents: 'none',
          }} />
          <div style={{ position: 'relative' }}>
            <h2 className="serif" style={{
              fontSize: 64, letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 20,
            }}>
              15 минут —<br/>и у вас есть{' '}
              <em style={{
                background: 'linear-gradient(95deg, #FF6EA5, #FFC34A)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                fontStyle: 'normal',
              }}>паспорт ребёнка.</em>
            </h2>
            <p style={{ fontSize: 18, opacity: 0.8, marginBottom: 36, maxWidth: 600, margin: '0 auto 36px' }}>
              Не гороскоп и не анкета. Психологическая модель, с которой работают педагоги, психологи и сами дети.
            </p>
            <Link href="/test" className="btn-primary" style={{ padding: '18px 36px', fontSize: 16 }}>
              Начать тест бесплатно →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-2)', padding: '60px 48px 40px', borderTop: '1px solid var(--line)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 12 }}>
              Psy<span style={{ color: 'var(--violet)' }}>ID</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', maxWidth: 300, lineHeight: 1.5 }}>
              Платформа психологического профилирования детей. Помогаем родителям понять ребёнка без навязывания.
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 16 }}>© 2026 PsyID</div>
          </div>
          <div style={{ display: 'flex', gap: 48, fontSize: 14 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Продукт</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--ink-2)' }}>
                <Link href="/test">Пройти тест</Link>
                <Link href="/results">Пример отчёта</Link>
                <Link href="/dashboard">Личный кабинет</Link>
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>Компания</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--ink-2)' }}>
                <a href="#how">Как работает</a>
                <a href="#programs">Программы</a>
                <a href="#team">Команда</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product, featured }: {
  product: typeof PRODUCTS[0]; featured: boolean;
}) {
  const discount = 0;
  return (
    <div style={{
      background: featured ? 'var(--grad-hero)' : 'white',
      color: featured ? 'white' : 'var(--ink)',
      border: featured ? 'none' : '1px solid var(--line)',
      borderRadius: 22, padding: 32,
      position: 'relative', overflow: 'hidden',
      transition: 'transform .3s, box-shadow .3s',
      boxShadow: featured ? '0 20px 50px -15px rgba(75, 30, 142, 0.5)' : '0 10px 30px -15px rgba(0,0,0,0.1)',
    }}>
      {featured && (
        <div style={{
          position: 'absolute', top: '-40%', right: '-30%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, #FF6EA5 0%, transparent 70%)',
          opacity: 0.4, filter: 'blur(30px)', pointerEvents: 'none',
        }} />
      )}
      <div style={{ position: 'relative' }}>
        {product.tag && (
          <div style={{
            display: 'inline-block', padding: '4px 12px', borderRadius: 100,
            background: featured ? 'white' : 'var(--magenta)',
            color: featured ? 'var(--violet)' : 'white',
            fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', marginBottom: 16,
          }}>{product.tag.toUpperCase()}</div>
        )}

        <div style={{
          fontSize: 12, fontWeight: 600, letterSpacing: '0.1em',
          opacity: featured ? 0.7 : 0.5, marginBottom: 10, textTransform: 'uppercase',
        }}>
          {product.id === 'free' ? 'БЕСПЛАТНО' : `ТАРИФ · ${product.id.toUpperCase()}`}
        </div>
        <div className="serif" style={{ fontSize: 28, letterSpacing: '-0.02em', marginBottom: 8 }}>
          {product.name}
        </div>
        <div style={{ fontSize: 14, opacity: featured ? 0.8 : 0.7, marginBottom: 24 }}>{product.desc}</div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 24 }}>
          {product.price === 0 ? (
            <span className="serif" style={{ fontSize: 36, letterSpacing: '-0.03em' }}>Бесплатно</span>
          ) : (
            <span className="serif" style={{ fontSize: 36, letterSpacing: '-0.03em' }}>
              {product.price.toLocaleString('ru')} ₽
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {product.features.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13.5 }}>
              <span style={{ color: featured ? '#FFC34A' : 'var(--magenta)', flexShrink: 0 }}>✓</span>
              {f}
            </div>
          ))}
        </div>

        <Link href={product.ctaHref} style={{
          display: 'block', width: '100%', padding: '14px', borderRadius: 100,
          background: featured ? 'white' : 'var(--ink)',
          color: featured ? 'var(--violet)' : 'white',
          fontSize: 14, fontWeight: 600, textAlign: 'center',
        }}>
          {product.cta} →
        </Link>
      </div>
    </div>
  );
}
