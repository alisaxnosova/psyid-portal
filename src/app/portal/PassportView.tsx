'use client';

import React from 'react';
import { logout } from '@/lib/useAuth';

/* ────────────────────────────────────────────────────────────
   PsyID Passport — interactive page-turn booklet for the client
   portal, shown after the user completes their first assessment.
   Identity / code / radar / axes come from the real scored
   session; the narrative copy is derived from the personality
   code (placeholder framing, refined later).
   ──────────────────────────────────────────────────────────── */

/* ── Types ── */
export interface Holder {
  name: string;
  nameLatin: string;
  initials: string;
  memberSince: string;
  passportNo: string;
  nationality: string;
  handle: string;
}
export interface ApiAssessment {
  id: string;
  no: string;
  dateISO: string;
  date: string;
  tier: string;
  tierCode: string;
  code: string;
  vals: number[];
  nearBoundary: string[];
  confidence: number;
}
interface Career { n: string; d: string; fit: number; }
interface Experiment { l: string; h: string; p: string; }
interface Assessment extends ApiAssessment {
  strong: boolean[];
  profile: string;
  summary: string;
  strengths: string[];
  watch: string[];
  careers: Career[];
  exps: Experiment[];
  latest?: boolean;
}

/* ── Axes (adult framing; no "MBTI"/function notation surfaced) ── */
const AXES = [
  { key: 'energy',    name: 'Энергия',   left: 'Интроверсия', right: 'Экстраверсия',  lp: 'I', rp: 'E' },
  { key: 'attention', name: 'Внимание',  left: 'Сенсорика',   right: 'Интуиция',       lp: 'S', rp: 'N' },
  { key: 'decisions', name: 'Решения',   left: 'Логика',      right: 'Чувства',        lp: 'T', rp: 'F' },
  { key: 'structure', name: 'Структура', left: 'Гибкость',    right: 'Планирование',   lp: 'P', rp: 'J' },
] as const;

/* ── Narrative derivation from the 4-letter code ── */
const PROFILE: Record<string, string> = {
  INTJ: 'Стратег-архитектор', INTP: 'Архитектор-аналитик', ENTJ: 'Командир-стратег', ENTP: 'Изобретатель-полемист',
  INFJ: 'Идеалист-наставник', INFP: 'Идеалист-исследователь', ENFJ: 'Наставник-организатор', ENFP: 'Вдохновитель-катализатор',
  ISTJ: 'Хранитель-логист', ISFJ: 'Защитник-опекун', ESTJ: 'Управляющий-администратор', ESFJ: 'Дипломат-хозяин',
  ISTP: 'Мастер-виртуоз', ISFP: 'Художник-созерцатель', ESTP: 'Деятель-предприниматель', ESFP: 'Артист-энтузиаст',
};
const L_STRENGTH: Record<string, string> = {
  E: 'Заряжающий энтузиазм', I: 'Глубина мысли', S: 'Внимание к деталям', N: 'Воображение',
  T: 'Системность', F: 'Эмпатия', J: 'Организованность', P: 'Гибкость',
};
const L_WATCH: Record<string, string> = {
  E: 'Распыляется на многое', I: 'Легко откладывает контакт', S: 'Недооценивает дальний горизонт', N: 'Перегружается идеями',
  T: 'Может звучать резко', F: 'Берёт на себя чужое', J: 'Тяжело переносит хаос', P: 'Откладывает решения',
};
const CAREERS: Record<string, Career[]> = {
  NF: [{ n: 'UX-исследователь', d: 'Люди и мотивация', fit: 0.86 }, { n: 'Психолог / коуч', d: 'Глубина и эмпатия', fit: 0.83 }, { n: 'Автор / сценарист', d: 'Смысл и истории', fit: 0.80 }],
  NT: [{ n: 'Продукт-стратег', d: 'Системы и гипотезы', fit: 0.90 }, { n: 'Инженер / архитектор', d: 'Модели и логика', fit: 0.87 }, { n: 'Аналитик данных', d: 'Паттерны и точность', fit: 0.84 }],
  SF: [{ n: 'Наставник / педагог', d: 'Забота и структура', fit: 0.87 }, { n: 'HR / People-партнёр', d: 'Развитие людей', fit: 0.84 }, { n: 'Сервис-дизайнер', d: 'Практика и люди', fit: 0.80 }],
  ST: [{ n: 'Операционный менеджер', d: 'Процессы и порядок', fit: 0.88 }, { n: 'Инженер-практик', d: 'Точность и результат', fit: 0.85 }, { n: 'Финансовый аналитик', d: 'Данные и дисциплина', fit: 0.82 }],
};

function deriveNarrative(a: ApiAssessment): Assessment {
  const [e, n, f, j] = a.vals;
  const strong = a.vals.map(v => Math.abs(v - 0.5) >= 0.22);
  const L = { energy: e >= 0.5 ? 'E' : 'I', attn: n >= 0.5 ? 'N' : 'S', dec: f >= 0.5 ? 'F' : 'T', str: j >= 0.5 ? 'J' : 'P' };
  const temperament = L.attn + L.dec; // NF | NT | SF | ST

  const energyPhrase = L.energy === 'E'
    ? 'Энергию черпает вовне и заражает ею других'
    : 'Черпает силу изнутри и мыслит вглубь';
  const tempPhrase = {
    NF: 'ведёт за смыслом и видит потенциал в людях',
    NT: 'строит модели мира и проверяет их на прочность',
    SF: 'заботится о людях и держит порядок вокруг',
    ST: 'опирается на факты и доводит начатое до результата',
  }[temperament] ?? 'сочетает разные грани характера по-своему';

  const strExp: Experiment = L.str === 'P'
    ? { l: 'Опыт 01', h: 'Малый дедлайн', p: 'Ставь себе мягкий срок на задачи, которые тянутся: ограничение освобождает, а не сковывает.' }
    : { l: 'Опыт 01', h: 'День без плана', p: 'Раз в неделю оставляй пару часов совсем без плана — гибкость тоже навык.' };
  const enExp: Experiment = L.energy === 'E'
    ? { l: 'Опыт 02', h: 'Тихий час', p: 'Выдели 30 минут тишины в день без входящих — идеям нужна пауза, чтобы дозреть.' }
    : { l: 'Опыт 02', h: 'Скажи вслух', p: 'Раз в неделю проговори вслух то, что обдумывал молча — так связь с людьми крепнет.' };

  const letters = [L.energy, L.attn, L.dec, L.str];
  return {
    ...a,
    strong,
    profile: PROFILE[a.code] ?? 'Личностный профиль',
    summary: `${energyPhrase}, ${tempPhrase}.`,
    strengths: letters.map(l => L_STRENGTH[l]!),
    watch: letters.filter((_, i) => !strong[i] || true).slice(0, 3).map(l => L_WATCH[l]!),
    careers: CAREERS[temperament] ?? CAREERS.NT!,
    exps: [strExp, enExp],
  };
}

/* ────────────────────────── Radar ────────────────────────── */
function Radar({ vals, size = 300, accent = '#FF7A3D' }: { vals: number[]; size?: number; accent?: string }) {
  const c = size / 2;
  const maxR = size / 2 - 18;
  const ang = [-90, 0, 90, 180].map(d => (d * Math.PI) / 180);
  const pts = vals.map((v, i) => {
    const r = maxR * (0.16 + 0.84 * v);
    return [c + r * Math.cos(ang[i]!), c + r * Math.sin(ang[i]!)];
  });
  const poly = pts.map(p => p.join(',')).join(' ');
  const rings = [1, 0.72, 0.46, 0.22];
  const axPt = (i: number, r: number) => [c + maxR * r * Math.cos(ang[i]!), c + maxR * r * Math.sin(ang[i]!)];
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ display: 'block' }}>
      <g stroke="rgba(14,18,48,.14)" strokeWidth="1" fill="none">
        {rings.map((r, k) => (
          <polygon key={k} points={[0, 1, 2, 3].map(i => axPt(i, r).join(',')).join(' ')} />
        ))}
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1={c} y1={c} x2={axPt(i, 1)[0]} y2={axPt(i, 1)[1]} />
        ))}
      </g>
      <polygon points={poly} fill={accent + '22'} stroke={accent} strokeWidth="2" />
      {pts.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="4.5" fill={accent} />
      ))}
    </svg>
  );
}

function CodeChips({ a, big }: { a: Assessment; big?: boolean }) {
  const letters = a.code.split('');
  return (
    <div className="res-code" style={big ? { gap: 10 } : undefined}>
      {letters.map((Lt, i) => (
        <span key={i} className={'res-chip' + (a.strong[i] ? ' hi' : '')} style={big ? { fontSize: 22, padding: '10px 18px' } : undefined}>
          {Lt}
        </span>
      ))}
    </div>
  );
}

/* ── Results reader sections ── */
function Overview({ a }: { a: Assessment }) {
  return (
    <div className="res-page">
      <div className="res-grid2">
        <div>
          <div className="res-eye or">— Обзор профиля —</div>
          <h2 className="res-h2">{a.profile}</h2>
          <CodeChips a={a} big />
          <p className="res-summary">{a.summary}</p>
          <div className="res-conf">
            <div className="cval">{a.confidence.toFixed(2)}</div>
            <div className="clbl">Средняя уверенность<br />утверждений в профиле</div>
          </div>
        </div>
        <div className="res-radar-wrap">
          <Radar vals={a.vals} />
          <div className="res-axis-grid">
            {AXES.map((ax, i) => (
              <div className="res-axis-lbl" key={ax.key}>
                <div className="ak">{ax.name}</div>
                <div className="av">{a.vals[i]! >= 0.5 ? ax.right : ax.left}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AxesDetail({ a }: { a: Assessment }) {
  return (
    <div className="res-page">
      <div className="res-eye bl">— Четыре оси характера —</div>
      <h2 className="res-h2 sm">Где ты на каждой шкале</h2>
      <div className="dicho-list">
        {AXES.map((ax, i) => {
          const v = a.vals[i]!;
          const dist = Math.abs(v - 0.5) * 200;
          return (
            <div className="dicho" key={ax.key}>
              <div className="dicho-head">
                <span className="dt">{ax.name}</span>
                <span className="ds">{Math.round(dist)}% к «{v >= 0.5 ? ax.right : ax.left}»</span>
              </div>
              <div className="spec">
                <div className="spec-labels"><span>{ax.left}</span><span>{ax.right}</span></div>
                <div className="spec-track"><div className="spec-thumb" style={{ left: v * 100 + '%' }} /></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Strengths({ a }: { a: Assessment }) {
  return (
    <div className="res-page">
      <div className="res-eye or">— Сильные стороны и путь —</div>
      <h2 className="res-h2 sm">Что тебе даётся легко</h2>
      <div className="res-grid2 top">
        <div>
          <div className="col-head or">Сильные стороны</div>
          <div className="chips">
            {a.strengths.map((s, i) => (
              <span key={i} className={'chip' + (i === 0 ? ' hi' : '')}>{s}</span>
            ))}
          </div>
          <div className="watchout">
            <div className="wh">На чём стоит следить</div>
            <ul>
              {a.watch.map((w, i) => (
                <li key={i}><span className="b" />{w}</li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <div className="col-head bl">Направления, где ты в своей среде</div>
          <div className="careers">
            {a.careers.map((c, i) => (
              <div className="career" key={i}>
                <div className="cbody">
                  <div className="cn">{c.n}</div>
                  <div className="cd">{c.d}</div>
                  <div className="fit"><div className="fill" style={{ width: c.fit * 100 + '%' }} /></div>
                </div>
                <div className="cfit">{Math.round(c.fit * 100)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Experiments({ a }: { a: Assessment }) {
  return (
    <div className="res-page res-exp">
      <div className="res-eye lt">— Эксперименты роста —</div>
      <h2 className="res-h2 white">Две вещи, чтобы попробовать</h2>
      <p className="exp-sub">Не задания и не диагноз — маленькие опыты на ближайшую пару недель.</p>
      <div className="exp-cards">
        {a.exps.map((e, i) => (
          <div className="exp-card" key={i}>
            <div className="num">{i + 1}</div>
            <div>
              <div className="ec-label">{e.l}</div>
              <h3>{e.h}</h3>
              <p>{e.p}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SECTIONS = [
  { id: 'overview', label: 'Обзор', C: Overview },
  { id: 'axes', label: 'Оси', C: AxesDetail },
  { id: 'strengths', label: 'Сильные стороны', C: Strengths },
  { id: 'exp', label: 'Рост', C: Experiments },
] as const;

function ResultsReader({ assessment, onClose }: { assessment: Assessment; onClose: () => void }) {
  const [i, setI] = React.useState(0);
  const a = assessment;
  const next = React.useCallback(() => setI(v => Math.min(SECTIONS.length - 1, v + 1)), []);
  const prev = React.useCallback(() => setI(v => Math.max(0, v - 1)), []);
  React.useEffect(() => { setI(0); }, [a.id]);
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, next, prev]);

  const Sec = SECTIONS[i]!.C;
  return (
    <div className="results-overlay">
      <div className="res-top">
        <button className="res-back" onClick={onClose}>
          <span className="ar">←</span> Паспорт
        </button>
        <div className="res-id">
          <span className="brand">Psy<i>ID</i></span>
          <span className="sep">·</span>
          <span className="mono">№ {a.no} · {a.date}</span>
          <span className="sep">·</span>
          <span className="mono strong">{a.code}</span>
        </div>
        <div className="res-tier">{a.tier}</div>
      </div>

      <div className="res-scroll">
        <div className="res-stage" key={i}>
          <Sec a={a} />
        </div>
      </div>

      <div className="res-nav">
        <button className="rn-btn" onClick={prev} disabled={i === 0}>←</button>
        <div className="rn-tabs">
          {SECTIONS.map((s, k) => (
            <button key={s.id} className={'rn-tab' + (k === i ? ' on' : '')} onClick={() => setI(k)}>
              <span className="rn-dot" />{s.label}
            </button>
          ))}
        </div>
        <button className="rn-btn" onClick={next} disabled={i === SECTIONS.length - 1}>→</button>
      </div>
    </div>
  );
}

/* ────────────────────────── Passport booklet ────────────────────────── */
const PAGE_W = 366;
const PAGE_H = 508;
const INKS = ['#C0392B', '#1A33B5', '#B26A12', '#2C6E49'];

const COVER = {
  bg: 'linear-gradient(135deg,#0b1440 0%,#0a1030 55%,#070a22 100%)',
  foil: '#E9C877', text: '#F6EFD8',
};

function Crest({ color, size = 66 }: { color: string; size?: number }) {
  const c = size / 2, r = size / 2 - 4;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ display: 'block' }}>
      <g stroke={color} strokeOpacity="0.9" strokeWidth="1" fill="none">
        <polygon points={`${c},${c - r} ${c + r},${c} ${c},${c + r} ${c - r},${c}`} />
        <polygon points={`${c},${c - r * 0.6} ${c + r * 0.6},${c} ${c},${c + r * 0.6} ${c - r * 0.6},${c}`} />
        <line x1={c} y1={c - r} x2={c} y2={c + r} />
        <line x1={c - r} y1={c} x2={c + r} y2={c} />
      </g>
      <g fill={color}>
        <circle cx={c} cy={c - r * 0.78} r="2.4" />
        <circle cx={c + r * 0.78} cy={c} r="2.4" />
        <circle cx={c} cy={c + r * 0.55} r="2.4" />
        <circle cx={c - r * 0.4} cy={c} r="2.4" />
      </g>
    </svg>
  );
}

function Stamp({ a, style, ink, rot, onOpen }: { a: Assessment; style: string; ink: string; rot: number; onOpen: (a: Assessment) => void }) {
  const common: React.CSSProperties = { ['--ink' as string]: ink, transform: `rotate(${rot}deg)` };
  const label = 'Открыть результаты →';
  let inner: React.ReactNode;
  if (style === 'wax') {
    inner = (
      <div className="stamp stamp-wax" style={common} onClick={() => onOpen(a)} title={label}>
        <div className="sw-blob">
          <div className="sw-code">{a.code}</div>
          <div className="sw-ring">PSYID · ОЦЕНКА · {a.tierCode}</div>
        </div>
        <div className="sw-date">{a.date}</div>
      </div>
    );
  } else if (style === 'seal') {
    inner = (
      <div className="stamp stamp-seal" style={common} onClick={() => onOpen(a)} title={label}>
        <svg viewBox="0 0 120 120" className="ss-ring">
          <defs>
            <path id={'arc-' + a.id} d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
          </defs>
          <circle cx="60" cy="60" r="55" fill="none" stroke="var(--ink)" strokeWidth="1.4" />
          <circle cx="60" cy="60" r="47" fill="none" stroke="var(--ink)" strokeWidth="2.4" />
          <text className="ss-arc-top"><textPath href={'#arc-' + a.id} startOffset="25%" textAnchor="middle">PSYID · ЛИЧНОСТЬ</textPath></text>
          <text className="ss-arc-bot"><textPath href={'#arc-' + a.id} startOffset="75%" textAnchor="middle">ОЦЕНКА · {a.tierCode}</textPath></text>
        </svg>
        <div className="ss-center">
          <div className="ss-code">{a.code}</div>
          <div className="ss-date">{a.date}</div>
        </div>
      </div>
    );
  } else {
    inner = (
      <div className="stamp stamp-visa" style={common} onClick={() => onOpen(a)} title={label}>
        <div className="sv-corner tl">PSYID</div>
        <div className="sv-corner tr">№{a.no}</div>
        <div className="sv-code">{a.code}</div>
        <div className="sv-date">{a.date.toUpperCase()}</div>
      </div>
    );
  }
  return <div className="stamp-wrap">{inner}<span className="stamp-hint">{label}</span></div>;
}

function Cover({ holder, onOpen }: { holder: Holder; onOpen: () => void }) {
  return (
    <div className="face cover-face" style={{ background: COVER.bg, ['--foil' as string]: COVER.foil, ['--ctext' as string]: COVER.text }} onClick={onOpen}>
      <div className="cover-frame" />
      <div className="cover-top">
        <div className="cover-nation">{holder.nationality}</div>
      </div>
      <div className="cover-crest"><Crest color={COVER.foil} size={78} /></div>
      <div className="cover-title">
        <div className="ct-1">ПАСПОРТ</div>
        <div className="ct-2">ЛИЧНОСТИ</div>
      </div>
      <div className="cover-sub">Psy<i>ID</i> · PERSONALITY PASSPORT</div>
      <div className="cover-foot">
        <span className="cf-no">{holder.passportNo}</span>
        <span className="cf-hint">нажмите, чтобы открыть →</span>
      </div>
    </div>
  );
}

function Endpaper({ holder, back }: { holder: Holder; back?: boolean }) {
  return (
    <div className={'face endpaper' + (back ? ' ep-back' : '')}>
      <div className="ep-water"><Crest color="#0E1230" size={220} /></div>
      {!back ? (
        <div className="ep-note">
          <div className="ep-eye">— Личный документ —</div>
          <p>Этот паспорт принадлежит <b>{holder.name}</b> и описывает личность так, как её увидел тест PsyID. Он растёт вместе с вами: каждая новая оценка добавляет штамп.</p>
          <div className="ep-handle">{holder.handle}</div>
        </div>
      ) : (
        <div className="ep-note center">
          <div className="ep-eye">— Продолжение следует —</div>
          <p>Свободные страницы ждут ваших следующих оценок. Личность — это не диагноз, а маршрут.</p>
        </div>
      )}
    </div>
  );
}

function Field({ k, v, mono, sm }: { k: string; v: string; mono?: boolean; sm?: boolean }) {
  return (
    <div className={'field' + (sm ? ' sm' : '')}>
      <div className="fk">{k}</div>
      <div className={'fv' + (mono ? ' mono' : '')}>{v}</div>
    </div>
  );
}

function Identity({ holder, assessments }: { holder: Holder; assessments: Assessment[] }) {
  const latest = assessments.find(a => a.latest) ?? assessments[assessments.length - 1]!;
  const mrz1 = ('P<PSYID<' + holder.nameLatin.replace(/\s+/g, '<') + '<'.repeat(20)).slice(0, 40);
  const mrz2 = (holder.passportNo.replace(/-/g, '') + 'PSY' + latest.code + '<'.repeat(20)).slice(0, 40);
  return (
    <div className="face id-page">
      <div className="page-band">
        <span className="brand">Psy<i>ID</i></span>
        <span className="pb-r">СТРАНИЦА ДАННЫХ</span>
      </div>
      <div className="id-body">
        <div className="id-photo">
          <div className="id-photo-inner">{holder.initials}</div>
          <div className="id-photo-cap">ФОТО</div>
        </div>
        <div className="id-fields">
          <Field k="Владелец / Holder" v={holder.name} />
          <Field k="Тип документа" v="Личностный профиль" />
          <div className="id-row2">
            <Field k="Участник с" v={holder.memberSince} sm />
            <Field k="Оценок" v={String(assessments.length)} sm />
          </div>
          <Field k="№ паспорта" v={holder.passportNo} mono />
          <div className="id-sign">
            <div className="sig-line" />
            <span>Подпись владельца</span>
          </div>
        </div>
      </div>
      <div className="mrz">
        <div>{mrz1}</div>
        <div>{mrz2}</div>
      </div>
    </div>
  );
}

function Intro() {
  return (
    <div className="face intro-page">
      <div className="page-band">
        <span className="brand">Psy<i>ID</i></span>
        <span className="pb-r">КАК ЧИТАТЬ ПАСПОРТ</span>
      </div>
      <div className="intro-body">
        <div className="ep-eye or">— Штампы оценок —</div>
        <h3 className="intro-h">Каждый штамп —<br />одна пройденная оценка.</h3>
        <ol className="intro-list">
          <li><span className="il-n">01</span><div><b>Листайте страницы</b> — нажимайте на угол или на стрелки внизу.</div></li>
          <li><span className="il-n">02</span><div><b>Нажмите на штамп</b> — откроется полный разбор этой оценки.</div></li>
          <li><span className="il-n">03</span><div><b>Свободные страницы</b> заполняются, когда вы проходите новую оценку.</div></li>
        </ol>
        <div className="intro-legend">
          На штампе — дата, код личности и уровень оценки.
        </div>
      </div>
    </div>
  );
}

function slotPos(i: number, off: number) {
  const spots = [
    { top: '9%', left: '10%' }, { top: '40%', left: '42%' },
    { top: '68%', left: '8%' }, { top: '30%', left: '8%' },
  ];
  return spots[(i + off) % spots.length]!;
}
function rots(i: number, off: number) {
  const r = [-7, 5, -3, 8, -5];
  return r[(i + off) % r.length]!;
}

function VisaPage({ label, stamps, locked, stampStyle, onOpen, gridOffset }: {
  label: string; stamps: Assessment[]; locked?: string[]; stampStyle: string; onOpen: (a: Assessment) => void; gridOffset: number;
}) {
  return (
    <div className="face visa-page">
      <div className="page-band ghost">
        <span className="brand">Psy<i>ID</i></span>
        <span className="pb-r">{label}</span>
      </div>
      <div className="visa-grid" />
      <div className="visa-stamps">
        {stamps.map((a, i) => (
          <div key={a.id} className="stamp-slot" style={slotPos(i, gridOffset)}>
            <Stamp a={a} style={stampStyle} ink={INKS[i % INKS.length]!} rot={rots(i, gridOffset)} onOpen={onOpen} />
          </div>
        ))}
        {(locked ?? []).map((_, i) => (
          <div key={'lock' + i} className="stamp-slot locked" style={slotPos(stamps.length + i, gridOffset)}>
            <div className="lock-stamp">
              <div className="lk-ico">＋</div>
              <div className="lk-t">Свободно</div>
              <div className="lk-s">Пройти оценку</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BackCover({ holder }: { holder: Holder }) {
  // Deterministic barcode heights (avoid render-time randomness → hydration-safe).
  const seed = holder.passportNo.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const bars = Array.from({ length: 38 }, (_, i) => 2 + ((seed * (i + 3)) % 4));
  return (
    <div className="face back-cover">
      <div className="bc-top">
        <div>
          <div className="bc-brand">Psy<i>ID</i></div>
          <div className="bc-tag">Личность — это маршрут, а не диагноз.</div>
        </div>
        <div className="bc-code">
          <div className="bc-lines">{bars.map((h, i) => <span key={i} style={{ height: h * 9 }} />)}</div>
          <div className="bc-str">{holder.passportNo}</div>
        </div>
      </div>
      <div className="bc-foot">
        <span>© PSYID · {holder.memberSince}—2026</span>
        <span className="bc-url">psyid.me/passport</span>
      </div>
    </div>
  );
}

function Passport({ holder, assessments, stampStyle, onOpenResults }: {
  holder: Holder; assessments: Assessment[]; stampStyle: string; onOpenResults: (a: Assessment) => void;
}) {
  const [flipped, setFlipped] = React.useState(0);
  const [active, setActive] = React.useState<number | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const visaA = assessments.slice(0, 2);
  const visaB = assessments.slice(2, 4);
  const visaC = assessments.slice(4);

  const leaves: [React.ReactNode, React.ReactNode][] = [
    [<Cover holder={holder} onOpen={() => turn(1)} />, <Endpaper holder={holder} />],
    [<Identity holder={holder} assessments={assessments} />, <Intro />],
    [<VisaPage label="ОЦЕНКИ · I" stamps={visaA} stampStyle={stampStyle} onOpen={onOpenResults} gridOffset={0} />,
     <VisaPage label="ОЦЕНКИ · II" stamps={visaB} stampStyle={stampStyle} onOpen={onOpenResults} gridOffset={2} />],
    [<VisaPage label="ОЦЕНКИ · III" stamps={visaC} locked={['', '']} stampStyle={stampStyle} onOpen={onOpenResults} gridOffset={1} />,
     <Endpaper holder={holder} back />],
    [<BackCover holder={holder} />, <div className="face blank-cover" />],
  ];
  const TOTAL = leaves.length;

  function mark(k: number) {
    setActive(k);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setActive(null), 950);
  }
  function turn(to: number) {
    const t = Math.max(0, Math.min(TOTAL, to));
    if (t === flipped) return;
    mark(t > flipped ? flipped : t);
    setFlipped(t);
  }
  const next = () => turn(flipped + 1);
  const prev = () => turn(flipped - 1);

  function zFor(k: number) {
    if (k === active) return 900;
    return k < flipped ? TOTAL + k : TOTAL - k;
  }

  const open = flipped > 0;
  const isClosed = flipped === 0;
  const atEnd = flipped >= TOTAL;

  return (
    <div className={'book-scene anim-page-turn' + (open ? ' is-open' : ' is-closed')}>
      <div className="book" style={{ width: PAGE_W * 2, height: PAGE_H, transform: `translateX(${open ? 0 : -PAGE_W / 2}px)` }}>
        <div className="book-spine" />
        <div className="edge edge-right" style={{ opacity: atEnd ? 0 : 1 }} />
        <div className="edge edge-left" style={{ opacity: open ? 1 : 0 }} />
        {leaves.map((lf, k) => {
          const isFlipped = k < flipped;
          return (
            <div key={k} className={'leaf' + (isFlipped ? ' flipped' : '') + (k === 0 ? ' leaf-cover' : '')}
              style={{ width: PAGE_W, height: PAGE_H, zIndex: zFor(k) }}>
              <div className="leaf-face leaf-front">
                {lf[0]}
                <div className="turn-corner" onClick={next} title="Следующая страница" />
                <div className="page-shade sh-front" />
              </div>
              <div className="leaf-face leaf-back">
                {lf[1]}
                <div className="turn-corner tc-left" onClick={prev} title="Предыдущая страница" />
                <div className="page-shade sh-back" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="book-controls">
        <button className="bc-btn" onClick={prev} disabled={isClosed}>←</button>
        <div className="bc-progress">
          {Array.from({ length: TOTAL + 1 }).map((_, i) => (
            <span key={i} className={'bcp' + (i === flipped ? ' on' : '')} onClick={() => turn(i)} />
          ))}
        </div>
        <button className="bc-btn" onClick={next} disabled={atEnd}>→</button>
      </div>
      {isClosed && <div className="open-hint" onClick={next}>Нажмите на паспорт, чтобы открыть</div>}
    </div>
  );
}

/* ────────────────────────── Fit scale ────────────────────────── */
const BOOK_NAT_W = 760;
const BOOK_NAT_H = 636;

function useFitScale(ref: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = React.useState(1);
  React.useEffect(() => {
    function fit() {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const s = Math.min(1.05, (r.width - 40) / BOOK_NAT_W, (r.height - 24) / BOOK_NAT_H);
      setScale(Math.max(0.4, s));
    }
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [ref]);
  return scale;
}

/* ────────────────────────── Public component ────────────────────────── */
export default function PassportView({ holder, assessments: apiAssessments }: { holder: Holder; assessments: ApiAssessment[] }) {
  const [openResult, setOpenResult] = React.useState<Assessment | null>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const scale = useFitScale(stageRef);

  const assessments = React.useMemo(() => {
    const list = apiAssessments.map(deriveNarrative);
    if (list.length) list[list.length - 1]!.latest = true;
    return list;
  }, [apiAssessments]);

  return (
    <div className="portal">
      <style dangerouslySetInnerHTML={{ __html: PASSPORT_CSS }} />
      <nav className="topnav">
        <div className="tn-brand">
          <span className="tn-mk" />
          <span>Psy<i>ID</i></span>
          <span className="tn-div" />
          <span className="tn-sub">Портал</span>
        </div>
        <div className="tn-right">
          <span className="tn-link">Мой паспорт</span>
          <a className="tn-link" href="/reno">Новая оценка</a>
          <button className="tn-link" onClick={logout} style={{ background: 'none', border: 'none' }}>Выйти</button>
          <div className="tn-avatar" title={holder.name}>{holder.initials}</div>
        </div>
      </nav>

      <div className="stage" ref={stageRef}>
        <div className="book-fit" style={{ transform: `scale(${scale})` }}>
          <Passport
            holder={holder}
            assessments={assessments}
            stampStyle="visa"
            onOpenResults={a => setOpenResult(a)}
          />
        </div>
      </div>

      <div className={'results-mount' + (openResult ? ' show' : '')}>
        {openResult && <ResultsReader assessment={openResult} onClose={() => setOpenResult(null)} />}
      </div>
    </div>
  );
}

/* ────────────────────────── Styles ────────────────────────── */
const PASSPORT_CSS = `
.portal{
  --navy:#050C2E; --blue:#2244E0; --blue-s:#6A85F0;
  --coral:#FF5A5A; --orange:#FF7A3D; --gold:#FFC074;
  --paper:#F1EADD; --paper-2:#F8F3EA; --page:#FBF7F0; --page-2:#F3ECE0;
  --ink:#0E1230; --ink-s:#4F5470; --ink-m:#8A8FA8; --line:#E3DBCC;
  --sans:'Geist',system-ui,sans-serif; --mono:'Geist Mono',ui-monospace,monospace;
  font-family:var(--sans); color:var(--ink);
  height:100vh; display:flex; flex-direction:column; overflow:hidden;
  background:
    radial-gradient(ellipse 90% 60% at 50% -10%, #FCF7EF 0%, transparent 60%),
    radial-gradient(ellipse 70% 50% at 50% 120%, #EAE0CF 0%, transparent 55%),
    var(--paper);
  -webkit-font-smoothing:antialiased; font-feature-settings:"ss01","ss03";
}
.portal i{ font-style:normal; }
.portal button{ font-family:inherit; cursor:pointer; }
.mono{ font-family:var(--mono); }

.topnav{ display:flex; justify-content:space-between; align-items:center; padding:18px 30px; flex:none; z-index:5; }
.tn-brand{ display:flex; align-items:center; gap:11px; font-weight:800; font-size:20px; letter-spacing:-.03em; }
.tn-brand i{ color:var(--orange); }
.tn-mk{ width:26px; height:26px; border-radius:8px; background:var(--ink); position:relative; flex:none; }
.tn-mk::before{ content:""; position:absolute; left:5px; top:5px; width:7px; height:7px; border-radius:50%; background:var(--blue-s); }
.tn-mk::after{ content:""; position:absolute; right:5px; bottom:5px; width:7px; height:7px; border-radius:2px; background:var(--orange); }
.tn-div{ width:1px; height:18px; background:var(--line); }
.tn-sub{ font-family:var(--mono); font-size:11px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-m); font-weight:500; }
.tn-right{ display:flex; align-items:center; gap:22px; }
.tn-link{ font-size:14px; font-weight:500; color:var(--ink-s); cursor:pointer; transition:color .15s; text-decoration:none; padding:0; }
.tn-link:hover{ color:var(--ink); }
.tn-avatar{ width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,var(--blue),var(--coral)); color:#fff; display:grid; place-items:center; font-size:13px; font-weight:700; letter-spacing:.02em; }

.stage{ flex:1; display:grid; place-items:center; min-height:0; position:relative; }
.book-fit{ transform-origin:center center; filter:drop-shadow(0 34px 46px rgba(40,28,14,.24)); }

.book-scene{ position:relative; width:760px; display:flex; flex-direction:column; align-items:center; gap:26px; }
.book{ position:relative; transition:transform .9s cubic-bezier(.6,.02,.2,1); perspective:2400px; }
.edge{ position:absolute; top:6px; bottom:6px; width:12px; border-radius:3px;
  background:repeating-linear-gradient(to right,#efe7d7 0 1.5px,#e2d8c4 1.5px 3px);
  transition:opacity .5s; box-shadow:inset 0 0 6px rgba(0,0,0,.08); }
.edge-right{ right:-9px; }
.edge-left{ left:-9px; }
.book-spine{ position:absolute; top:0; bottom:0; left:50%; width:2px; transform:translateX(-1px);
  background:linear-gradient(to bottom, rgba(0,0,0,.16), rgba(0,0,0,.05)); z-index:60; pointer-events:none; opacity:0; transition:opacity .5s; }
.book-scene.is-open .book-spine{ opacity:1; }
.leaf{ position:absolute; top:0; left:50%; transform-origin:left center; transform-style:preserve-3d; transition:transform .9s cubic-bezier(.55,.05,.25,1); }
.leaf.flipped{ transform:rotateY(-180deg); }
.leaf-face{ position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden; overflow:hidden; border-radius:4px 12px 12px 4px; background:var(--page); }
.leaf-front{ transform:rotateY(0deg); box-shadow:inset 3px 0 10px rgba(0,0,0,.05); }
.leaf-back{ transform:rotateY(180deg); border-radius:12px 4px 4px 12px; box-shadow:inset -3px 0 10px rgba(0,0,0,.05); }
.leaf-cover .leaf-face{ border-radius:6px 14px 14px 6px; }
.page-shade{ position:absolute; inset:0; pointer-events:none; opacity:0; transition:opacity .45s; }
.sh-front{ background:linear-gradient(90deg, rgba(0,0,0,.14), transparent 32%); }
.sh-back{ background:linear-gradient(270deg, rgba(0,0,0,.14), transparent 32%); }
.turn-corner{ position:absolute; bottom:0; right:0; width:74px; height:92px; cursor:pointer; z-index:40; background:linear-gradient(315deg, rgba(0,0,0,.06), transparent 55%); border-radius:0 0 12px 0; }
.turn-corner:hover{ background:linear-gradient(315deg, rgba(0,0,0,.13), transparent 60%); }
.turn-corner.tc-left{ right:auto; left:0; border-radius:0 0 0 12px; background:linear-gradient(225deg, rgba(0,0,0,.06), transparent 55%); }
.turn-corner.tc-left:hover{ background:linear-gradient(225deg, rgba(0,0,0,.13), transparent 60%); }

.face{ position:absolute; inset:0; padding:30px 30px; display:flex; flex-direction:column; overflow:hidden; }
.page-band{ display:flex; justify-content:space-between; align-items:center; padding-bottom:12px; border-bottom:1px solid var(--line); flex:none; }
.page-band.ghost{ border-color:rgba(0,0,0,.06); }
.page-band .brand{ font-weight:800; font-size:15px; letter-spacing:-.03em; }
.page-band .brand i{ color:var(--orange); }
.page-band .pb-r{ font-family:var(--mono); font-size:9.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-m); }

.cover-face{ color:var(--ctext); align-items:center; text-align:center; padding:44px 34px; cursor:pointer; }
.cover-face::after{ content:""; position:absolute; inset:0; background:radial-gradient(ellipse 120% 80% at 30% 10%, rgba(255,255,255,.10), transparent 55%); pointer-events:none; }
.cover-frame{ position:absolute; inset:16px; border:1.5px solid var(--foil); opacity:.5; border-radius:6px; pointer-events:none; }
.cover-frame::before{ content:""; position:absolute; inset:5px; border:1px solid var(--foil); opacity:.55; border-radius:3px; }
.cover-top{ margin-top:8px; }
.cover-nation{ font-family:var(--mono); font-size:10px; letter-spacing:.34em; color:var(--foil); opacity:.9; }
.cover-crest{ margin:auto 0 0; display:flex; justify-content:center; }
.cover-title{ margin-top:20px; }
.ct-1,.ct-2{ font-weight:800; letter-spacing:.02em; line-height:.98; color:var(--ctext); font-size:34px; }
.cover-sub{ margin-top:16px; font-family:var(--mono); font-size:10px; letter-spacing:.2em; color:var(--foil); }
.cover-sub i{ color:var(--foil); }
.cover-foot{ margin-top:auto; width:100%; display:flex; flex-direction:column; gap:8px; align-items:center; }
.cf-no{ font-family:var(--mono); font-size:11px; letter-spacing:.2em; color:var(--ctext); opacity:.6; }
.cf-hint{ font-family:var(--mono); font-size:10px; letter-spacing:.14em; color:var(--foil); opacity:.9; animation:psypulse 2.4s ease-in-out infinite; }
@keyframes psypulse{ 0%,100%{ opacity:.35; } 50%{ opacity:1; } }

.endpaper{ background:var(--page-2); justify-content:center; align-items:center; text-align:center; padding:44px 40px; }
.ep-water{ position:absolute; inset:0; display:grid; place-items:center; opacity:.05; }
.ep-note{ position:relative; max-width:30ch; }
.ep-note.center{ text-align:center; }
.ep-eye{ font-family:var(--mono); font-size:10px; letter-spacing:.2em; text-transform:uppercase; color:var(--ink-m); margin-bottom:16px; }
.ep-eye.or{ color:var(--orange); }
.ep-note p{ font-size:15px; line-height:1.65; color:var(--ink-s); }
.ep-note b{ color:var(--ink); font-weight:600; }
.ep-handle{ margin-top:20px; font-family:var(--mono); font-size:12px; letter-spacing:.08em; color:var(--blue); }

.id-page{ background:var(--page); }
.id-body{ flex:1; display:flex; gap:22px; padding-top:24px; }
.id-photo{ flex:none; width:118px; display:flex; flex-direction:column; gap:8px; }
.id-photo-inner{ width:118px; height:146px; border-radius:10px; background:repeating-linear-gradient(135deg,#e9e0d0 0 7px,#e3d9c7 7px 14px); border:1px solid var(--line); display:grid; place-items:center; font-size:40px; font-weight:800; color:var(--ink); letter-spacing:-.02em; box-shadow:inset 0 0 0 4px var(--page); }
.id-photo-cap{ font-family:var(--mono); font-size:9px; letter-spacing:.22em; color:var(--ink-m); text-align:center; }
.id-fields{ flex:1; display:flex; flex-direction:column; gap:13px; }
.id-row2{ display:flex; gap:16px; }
.field .fk{ font-family:var(--mono); font-size:8.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-m); margin-bottom:3px; }
.field .fv{ font-size:16px; font-weight:600; letter-spacing:-.01em; color:var(--ink); }
.field.sm .fv{ font-size:15px; }
.field .fv.mono{ font-family:var(--mono); font-weight:500; font-size:14px; letter-spacing:.02em; }
.id-sign{ margin-top:6px; }
.id-sign .sig-line{ height:26px; border-bottom:1.5px solid var(--ink-s); width:150px; background:linear-gradient(105deg,transparent 40%, rgba(34,68,224,.12) 42% 60%, transparent 62%); }
.id-sign span{ font-family:var(--mono); font-size:8.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-m); }
.mrz{ flex:none; margin-top:auto; padding-top:12px; border-top:1px dashed var(--line); font-family:var(--mono); font-size:12px; letter-spacing:.16em; color:var(--ink-s); line-height:1.7; white-space:nowrap; overflow:hidden; }

.intro-page{ background:var(--page); }
.intro-body{ flex:1; padding-top:22px; display:flex; flex-direction:column; }
.intro-h{ font-size:25px; font-weight:800; letter-spacing:-.03em; line-height:1.05; margin:8px 0 22px; }
.intro-list{ list-style:none; display:flex; flex-direction:column; gap:16px; margin:0; padding:0; }
.intro-list li{ display:flex; gap:14px; align-items:flex-start; font-size:14px; color:var(--ink-s); line-height:1.5; }
.intro-list b{ color:var(--ink); font-weight:600; }
.il-n{ flex:none; width:28px; height:28px; border-radius:8px; background:var(--ink); color:#fff; font-family:var(--mono); font-size:12px; font-weight:600; display:grid; place-items:center; }
.intro-legend{ margin-top:auto; padding:14px 16px; background:var(--page-2); border-radius:12px; font-family:var(--mono); font-size:11px; letter-spacing:.02em; color:var(--ink-s); line-height:1.5; }

.visa-page{ background:var(--page); }
.visa-grid{ position:absolute; inset:0; opacity:.5; pointer-events:none; background-image:radial-gradient(circle, rgba(14,18,48,.05) 1px, transparent 1.4px); background-size:20px 20px; -webkit-mask-image:radial-gradient(ellipse 90% 80% at 50% 50%, #000 55%, transparent 88%); mask-image:radial-gradient(ellipse 90% 80% at 50% 50%, #000 55%, transparent 88%); }
.visa-stamps{ position:absolute; inset:56px 24px 24px; }
.stamp-slot{ position:absolute; width:150px; z-index:45; }
.stamp-wrap{ position:relative; display:inline-block; }
.stamp{ cursor:pointer; mix-blend-mode:multiply; transition:transform .2s ease, filter .2s ease; transform-origin:center; }
.stamp-wrap:hover .stamp{ filter:drop-shadow(0 6px 12px rgba(0,0,0,.18)); }
.stamp-wrap:hover .stamp-seal,.stamp-wrap:hover .stamp-visa,.stamp-wrap:hover .stamp-wax{ transform:scale(1.06) rotate(0deg) !important; }
.stamp-hint{ position:absolute; left:50%; top:-26px; transform:translateX(-50%) translateY(4px); font-family:var(--mono); font-size:10px; letter-spacing:.06em; white-space:nowrap; color:#fff; background:var(--ink); padding:5px 10px; border-radius:7px; opacity:0; pointer-events:none; transition:opacity .18s, transform .18s; z-index:20; }
.stamp-wrap:hover .stamp-hint{ opacity:1; transform:translateX(-50%) translateY(0); }
.stamp-seal{ position:relative; width:116px; height:116px; color:var(--ink); }
.ss-ring{ position:absolute; inset:0; width:116px; height:116px; }
.ss-arc-top,.ss-arc-bot{ font-family:var(--mono); font-size:9px; letter-spacing:.14em; fill:var(--ink); font-weight:600; }
.ss-center{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; }
.ss-code{ font-family:var(--mono); font-weight:700; font-size:24px; letter-spacing:.04em; color:var(--ink); }
.ss-date{ font-family:var(--mono); font-size:9px; letter-spacing:.1em; color:var(--ink); opacity:.85; }
.stamp-visa{ position:relative; width:150px; height:92px; color:var(--ink); border:2px solid var(--ink); border-radius:3px; box-shadow:inset 0 0 0 1px var(--page), inset 0 0 0 4px var(--ink); padding:9px 12px; display:flex; flex-direction:column; justify-content:center; align-items:center; }
.stamp-visa::before{ content:""; position:absolute; inset:4px; border:1px solid var(--ink); border-radius:2px; }
.sv-corner{ position:absolute; font-family:var(--mono); font-size:8px; letter-spacing:.1em; color:var(--ink); }
.sv-corner.tl{ top:7px; left:9px; } .sv-corner.tr{ top:7px; right:9px; }
.sv-code{ font-family:var(--mono); font-weight:700; font-size:26px; letter-spacing:.06em; color:var(--ink); }
.sv-date{ position:absolute; bottom:8px; font-family:var(--mono); font-size:8px; letter-spacing:.14em; color:var(--ink); }
.stamp-wax{ position:relative; width:120px; display:flex; flex-direction:column; align-items:center; gap:8px; mix-blend-mode:normal; }
.sw-blob{ width:92px; height:92px; border-radius:47% 53% 50% 50% / 52% 48% 52% 48%; background:radial-gradient(circle at 38% 32%, color-mix(in srgb, var(--ink) 70%, #fff) 0%, var(--ink) 55%, color-mix(in srgb, var(--ink) 65%, #000) 100%); box-shadow:0 6px 14px rgba(0,0,0,.28), inset 0 -6px 10px rgba(0,0,0,.35), inset 0 4px 8px rgba(255,255,255,.25); display:flex; flex-direction:column; align-items:center; justify-content:center; position:relative; }
.sw-code{ font-family:var(--mono); font-weight:700; font-size:21px; letter-spacing:.04em; color:#fff; text-shadow:0 1px 1px rgba(0,0,0,.4); }
.sw-ring{ position:absolute; bottom:12px; font-family:var(--mono); font-size:6px; letter-spacing:.04em; color:rgba(255,255,255,.75); text-align:center; width:74px; }
.sw-date{ font-family:var(--mono); font-size:9px; letter-spacing:.12em; color:var(--ink-s); }
.stamp-slot.locked .lock-stamp{ width:110px; height:110px; border-radius:50%; border:2px dashed var(--ink-m); opacity:.5; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; color:var(--ink-m); }
.lk-ico{ font-size:22px; font-weight:400; }
.lk-t{ font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; }
.lk-s{ font-size:10px; }

.back-cover{ background:linear-gradient(135deg,#12142e,#0a0c1e); color:#fff; justify-content:space-between; padding:36px 32px; }
.blank-cover{ background:linear-gradient(135deg,#12142e,#0a0c1e); }
.bc-top{ display:flex; justify-content:space-between; align-items:flex-start; }
.bc-brand{ font-weight:800; font-size:20px; letter-spacing:-.03em; }
.bc-brand i{ color:var(--orange); }
.bc-tag{ font-size:12px; color:rgba(255,255,255,.5); max-width:22ch; margin-top:8px; line-height:1.5; }
.bc-code{ display:flex; flex-direction:column; align-items:flex-end; gap:8px; }
.bc-lines{ display:flex; gap:2px; align-items:flex-end; height:44px; }
.bc-lines span{ width:2px; background:rgba(255,255,255,.6); border-radius:1px; }
.bc-str{ font-family:var(--mono); font-size:10px; letter-spacing:.16em; color:rgba(255,255,255,.4); }
.bc-foot{ display:flex; justify-content:space-between; align-items:flex-end; padding-top:18px; border-top:1px solid rgba(255,255,255,.1); font-family:var(--mono); font-size:9.5px; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.4); }
.bc-url{ color:var(--orange); }

.book-controls{ display:flex; align-items:center; gap:18px; }
.bc-btn{ width:44px; height:44px; border-radius:50%; background:#fff; border:1px solid var(--line); font-size:17px; color:var(--ink); display:grid; place-items:center; transition:.18s; box-shadow:0 4px 14px rgba(30,20,10,.08); }
.bc-btn:hover:not(:disabled){ background:var(--ink); color:#fff; transform:translateY(-1px); }
.bc-btn:disabled{ opacity:.32; cursor:default; }
.bc-progress{ display:flex; gap:8px; align-items:center; }
.bcp{ width:8px; height:8px; border-radius:50%; background:var(--line); cursor:pointer; transition:.18s; }
.bcp:hover{ background:var(--ink-m); }
.bcp.on{ background:linear-gradient(135deg,var(--orange),var(--coral)); transform:scale(1.25); }
.open-hint{ font-family:var(--mono); font-size:11px; letter-spacing:.1em; color:var(--ink-m); cursor:pointer; }
.book-scene.is-open .open-hint{ display:none; }

.results-mount{ position:fixed; inset:0; z-index:100; pointer-events:none; }
.results-mount.show{ pointer-events:auto; }
.results-overlay{ position:absolute; inset:0; background:var(--paper-2); display:flex; flex-direction:column; transform:translateY(2%); opacity:0; animation:psyRiseIn .5s cubic-bezier(.2,.8,.2,1) forwards; }
@keyframes psyRiseIn{ to{ transform:translateY(0); opacity:1; } }
.res-top{ display:flex; align-items:center; justify-content:space-between; padding:16px 30px; border-bottom:1px solid var(--line); flex:none; background:var(--page); }
.res-back{ display:flex; align-items:center; gap:8px; font-size:14px; font-weight:600; color:var(--ink); padding:8px 16px 8px 12px; border:1px solid var(--line); border-radius:999px; transition:.18s; background:none; }
.res-back:hover{ background:var(--ink); color:#fff; }
.res-back .ar{ font-size:16px; }
.res-id{ display:flex; align-items:center; gap:10px; font-size:13px; }
.res-id .brand{ font-weight:800; letter-spacing:-.03em; } .res-id .brand i{ color:var(--orange); }
.res-id .sep{ color:var(--ink-m); }
.res-id .mono{ font-family:var(--mono); font-size:12px; letter-spacing:.06em; color:var(--ink-s); }
.res-id .mono.strong{ color:var(--ink); font-weight:600; }
.res-tier{ font-family:var(--mono); font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:#fff; background:linear-gradient(135deg,var(--blue),var(--coral)); padding:6px 14px; border-radius:999px; }
.res-scroll{ flex:1; overflow-y:auto; display:flex; justify-content:center; padding:44px 30px 40px; }
.res-stage{ width:100%; max-width:940px; animation:psyFadeSec .4s ease; }
@keyframes psyFadeSec{ from{ opacity:0; transform:translateY(8px); } to{ opacity:1; transform:translateY(0); } }
.res-eye{ font-family:var(--mono); font-size:11px; letter-spacing:.2em; text-transform:uppercase; margin-bottom:12px; }
.res-eye.or{ color:var(--orange); } .res-eye.bl{ color:var(--blue); } .res-eye.lt{ color:rgba(255,255,255,.55); }
.res-h2{ font-size:42px; font-weight:800; letter-spacing:-.035em; line-height:1.02; }
.res-h2.sm{ font-size:34px; margin-bottom:30px; }
.res-h2.white{ color:#fff; }
.res-grid2{ display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:center; }
.res-grid2.top{ align-items:start; }
.res-code{ display:flex; gap:8px; margin:20px 0; }
.res-chip{ font-family:var(--mono); font-weight:600; font-size:16px; padding:7px 13px; border-radius:9px; border:1.5px solid var(--line); background:#fff; color:var(--ink); }
.res-chip.hi{ background:linear-gradient(135deg,var(--coral),var(--orange)); border-color:transparent; color:#fff; }
.res-summary{ font-size:16px; line-height:1.6; color:var(--ink-s); max-width:42ch; }
.res-conf{ margin-top:24px; display:inline-flex; gap:14px; align-items:center; padding:14px 18px; background:var(--page-2); border-radius:14px; }
.res-conf .cval{ font-size:30px; font-weight:800; letter-spacing:-.03em; background:linear-gradient(95deg,var(--orange),var(--gold)); -webkit-background-clip:text; background-clip:text; color:transparent; }
.res-conf .clbl{ font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-m); line-height:1.6; }
.res-radar-wrap{ background:#fff; border:1px solid var(--line); border-radius:22px; padding:26px; }
.res-axis-grid{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:16px; }
.res-axis-lbl{ background:var(--paper-2); border-radius:12px; padding:11px 14px; }
.res-axis-lbl .ak{ font-family:var(--mono); font-size:9px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-m); }
.res-axis-lbl .av{ font-size:16px; font-weight:700; letter-spacing:-.01em; color:var(--ink); }
.dicho-list{ display:flex; flex-direction:column; gap:22px; }
.dicho{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:24px 26px; }
.dicho-head{ display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
.dicho-head .dt{ font-size:19px; font-weight:700; letter-spacing:-.02em; }
.dicho-head .ds{ font-family:var(--mono); font-size:11px; color:var(--orange); background:rgba(255,122,61,.1); padding:5px 11px; border-radius:999px; }
.spec-labels{ display:flex; justify-content:space-between; margin-bottom:8px; }
.spec-labels span{ font-family:var(--mono); font-size:10px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-m); }
.spec-track{ height:12px; border-radius:999px; position:relative; background:linear-gradient(90deg,var(--blue),#8BA0F0 30%,#F0B0B0 70%,var(--coral)); }
.spec-thumb{ position:absolute; top:50%; transform:translate(-50%,-50%); width:22px; height:22px; border-radius:50%; background:#fff; border:3px solid var(--ink); box-shadow:0 4px 12px rgba(0,0,0,.25); }
.col-head{ font-family:var(--mono); font-size:10.5px; letter-spacing:.16em; text-transform:uppercase; margin-bottom:16px; }
.col-head.or{ color:var(--orange); } .col-head.bl{ color:var(--blue); }
.chips{ display:flex; flex-wrap:wrap; gap:9px; margin-bottom:28px; }
.chip{ padding:9px 16px; border-radius:999px; font-size:14px; font-weight:600; border:1.5px solid var(--line); background:#fff; }
.chip.hi{ background:linear-gradient(95deg,var(--orange),var(--gold)); border-color:transparent; color:#fff; }
.watchout{ background:#fff; border:1px solid var(--line); border-radius:16px; padding:20px 22px; }
.watchout .wh{ font-family:var(--mono); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:var(--ink-m); margin-bottom:12px; }
.watchout ul{ list-style:none; display:flex; flex-direction:column; gap:9px; margin:0; padding:0; }
.watchout li{ display:flex; gap:10px; align-items:flex-start; font-size:14px; color:var(--ink-s); }
.watchout li .b{ flex:none; width:6px; height:6px; border-radius:50%; background:var(--coral); margin-top:6px; }
.careers{ display:flex; flex-direction:column; gap:10px; }
.career{ background:#fff; border:1px solid var(--line); border-radius:14px; padding:14px 18px; display:flex; align-items:center; gap:16px; }
.career .cbody{ flex:1; }
.career .cn{ font-weight:600; font-size:15px; letter-spacing:-.01em; }
.career .cd{ font-size:12.5px; color:var(--ink-m); margin-bottom:6px; }
.career .fit{ height:4px; border-radius:999px; background:var(--line); overflow:hidden; }
.career .fit .fill{ height:100%; background:linear-gradient(90deg,var(--blue),var(--coral)); border-radius:999px; }
.career .cfit{ font-family:var(--mono); font-size:16px; font-weight:600; color:var(--ink); flex:none; }
.res-exp{ background:
  radial-gradient(ellipse 55% 45% at 88% 88%, rgba(255,165,72,.5) 0%, transparent 55%),
  radial-gradient(ellipse 45% 40% at 12% 15%, rgba(50,90,224,.5) 0%, transparent 55%),
  linear-gradient(150deg,#070E38 0%,#0F1E72 50%,#35105A 80%,#7A2A2A 100%);
  border-radius:26px; padding:44px 42px; color:#fff; }
.exp-sub{ font-size:15px; color:rgba(255,255,255,.65); max-width:44ch; margin-bottom:32px; line-height:1.5; }
.exp-cards{ display:flex; flex-direction:column; gap:18px; }
.exp-card{ background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1); border-radius:20px; padding:24px 26px; display:grid; grid-template-columns:auto 1fr; gap:20px; align-items:start; backdrop-filter:blur(8px); }
.exp-card .num{ width:44px; height:44px; border-radius:13px; display:grid; place-items:center; font-size:20px; font-weight:800; background:linear-gradient(135deg,var(--coral),var(--orange)); }
.exp-card:nth-child(2) .num{ background:linear-gradient(135deg,var(--blue),var(--blue-s)); }
.exp-card .ec-label{ font-family:var(--mono); font-size:10px; letter-spacing:.16em; text-transform:uppercase; color:rgba(255,255,255,.5); margin-bottom:6px; }
.exp-card h3{ font-size:20px; font-weight:700; letter-spacing:-.02em; margin-bottom:8px; }
.exp-card p{ font-size:14.5px; color:rgba(255,255,255,.72); line-height:1.6; }
.res-nav{ display:flex; align-items:center; justify-content:center; gap:18px; padding:16px 30px; border-top:1px solid var(--line); flex:none; background:var(--page); }
.rn-btn{ width:40px; height:40px; border-radius:50%; background:#fff; border:1px solid var(--line); font-size:16px; color:var(--ink); transition:.18s; }
.rn-btn:hover:not(:disabled){ background:var(--ink); color:#fff; }
.rn-btn:disabled{ opacity:.3; cursor:default; }
.rn-tabs{ display:flex; gap:6px; background:var(--paper-2); padding:5px; border-radius:999px; }
.rn-tab{ display:flex; align-items:center; gap:7px; padding:8px 15px; border-radius:999px; font-size:13px; font-weight:500; color:var(--ink-s); transition:.18s; background:none; }
.rn-tab .rn-dot{ width:6px; height:6px; border-radius:50%; background:var(--line); transition:.18s; }
.rn-tab:hover{ color:var(--ink); }
.rn-tab.on{ background:#fff; color:var(--ink); font-weight:600; box-shadow:0 2px 8px rgba(0,0,0,.06); }
.rn-tab.on .rn-dot{ background:linear-gradient(135deg,var(--orange),var(--coral)); }
@media (max-width:820px){
  .res-grid2{ grid-template-columns:1fr; gap:28px; }
  .res-h2{ font-size:32px; } .res-h2.sm{ font-size:26px; }
  .rn-tab span:not(.rn-dot){ display:none; }
}
`;
