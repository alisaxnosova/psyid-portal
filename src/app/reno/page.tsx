'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AXES, AXIS_BY_CODE } from '@/data/reno-axes';
import type { RenoQuestion } from '@/data/reno-axes';

/* ═══════════════════════════════════════════════════════════════════════════
   ReNo v1.1 — live assessment. Ported from the approved preview
   (docs/reno/preview/reno-v1.1-preview.html): Element Vault paper aesthetic,
   five-axis Likert bank, EN/RU. All backend plumbing (validate → session →
   answers-with-retries → progress → intake → complete) is preserved.
   ═══════════════════════════════════════════════════════════════════════════ */

type Lang = 'en' | 'ru';

const LANG_NAMES: Record<Lang, string> = { en: 'EN', ru: 'RU' };

/* ─── Scoped styles (from the preview, prefixed under .reno-v11) ─── */
const CSS = `
.reno-v11{
  --navy:#050C2E; --blue:#2244E0; --blue-soft:#6A85F0; --blue-tint:#DCE2FF;
  --violet:#8A5CD6; --coral:#FF5A5A; --orange:#FF7A3D;
  --ax1:#2244E0; --ax2:#6A85F0; --ax3:#8A5CD6; --ax4:#FF7A3D; --ax5:#FF5A5A;
  --paper:#F6F1EA; --paper-2:#EDE7DC; --paper-3:#E4DCCF;
  --ink:#0E1230; --ink-soft:#4F5470; --ink-mute:#8A8FA8;
  --line:#E0D9CE; --line-dark:#C8C0B4;
  --font:'Geist',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif;
  --mono:'Geist Mono',ui-monospace,'SF Mono',Menlo,monospace;
  --r-sm:12px; --r-md:18px; --r-lg:26px; --r-full:999px;
  --grad-coral:linear-gradient(135deg,var(--coral),var(--orange));
  min-height:100vh; background:var(--paper); color:var(--ink);
  font-family:var(--font); line-height:1.5; -webkit-font-smoothing:antialiased;
  display:flex; flex-direction:column;
}
.reno-v11 *{box-sizing:border-box}
.reno-v11 button{font-family:inherit;cursor:pointer;border:none;background:none;color:inherit}
.reno-v11 input,.reno-v11 select{font-family:inherit}
.reno-v11 .wrap{max-width:760px;margin:0 auto;padding:0 22px;width:100%}
.reno-v11 .topbar{position:sticky;top:0;z-index:20;background:rgba(246,241,234,.85);
  backdrop-filter:saturate(1.4) blur(12px);-webkit-backdrop-filter:saturate(1.4) blur(12px);
  border-bottom:1px solid var(--line)}
.reno-v11 .topbar .row{max-width:760px;margin:0 auto;padding:14px 22px;display:flex;align-items:center;gap:16px}
.reno-v11 .brand{display:inline-flex;align-items:center;gap:10px;font-weight:800;letter-spacing:-.03em;font-size:18px;color:var(--ink)}
.reno-v11 .brand .mk{width:26px;height:26px;flex:none}
.reno-v11 .brand i{font-style:normal;color:var(--orange)}
.reno-v11 .spacer{flex:1}
.reno-v11 .langtoggle{display:inline-flex;border:1px solid var(--line);border-radius:var(--r-full);overflow:hidden;background:#fff}
.reno-v11 .langtoggle button{padding:6px 13px;font-size:12px;font-weight:600;color:var(--ink-soft);letter-spacing:.02em}
.reno-v11 .langtoggle button.on{background:var(--ink);color:#fff}
.reno-v11 .progressbar{height:3px;background:var(--paper-3)}
.reno-v11 .progressbar .fill{height:100%;background:var(--grad-coral);transition:width .35s cubic-bezier(.4,0,.2,1);border-radius:0 3px 3px 0}
.reno-v11 .resume{background:var(--blue-tint);color:var(--navy);padding:10px 22px;font-size:13px;font-weight:600;text-align:center}
.reno-v11 .stage{flex:1;display:flex;flex-direction:column;justify-content:center;padding:56px 0}
.reno-v11 .fadewrap{transition:opacity .25s ease,transform .25s ease}
.reno-v11 .eyebrow{font-family:var(--mono);font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--ink-mute);margin-bottom:14px}
.reno-v11 h1{font-weight:800;letter-spacing:-.035em;font-size:clamp(30px,5vw,44px);line-height:1.05;margin:0}
.reno-v11 h2{font-weight:750;letter-spacing:-.03em;font-size:26px;line-height:1.12;margin:0}
.reno-v11 .lede{color:var(--ink-soft);font-size:17px;margin-top:16px;max-width:56ch}
.reno-v11 .card{background:#fff;border:1px solid var(--line);border-radius:var(--r-lg);padding:30px}
.reno-v11 .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:14px 26px;border-radius:var(--r-full);background:var(--ink);color:#fff;font-weight:650;font-size:15px;letter-spacing:.01em;transition:transform .12s,opacity .12s}
.reno-v11 .btn:hover{transform:translateY(-1px)}
.reno-v11 .btn:active{transform:translateY(0)}
.reno-v11 .btn.grad{background:var(--grad-coral)}
.reno-v11 .btn.ghost{background:transparent;color:var(--ink-soft);border:1px solid var(--line)}
.reno-v11 .btn.full{width:100%}
.reno-v11 .btn[disabled]{opacity:.4;pointer-events:none}
.reno-v11 .btnrow{display:flex;gap:12px;align-items:center;margin-top:30px;flex-wrap:wrap}
.reno-v11 .codebox{font-family:var(--mono);font-size:28px;letter-spacing:.25em;text-align:center;padding:14px 18px;
  border:1.5px solid var(--line);border-radius:var(--r-sm);background:#fff;color:var(--ink);width:100%;outline:none}
.reno-v11 .codebox:focus{border-color:var(--blue-soft);box-shadow:0 0 0 3px var(--blue-tint)}
.reno-v11 .flabel{font-size:13px;font-weight:600;color:var(--ink-soft);letter-spacing:.01em;display:block;margin-bottom:8px}
.reno-v11 .err{color:var(--coral);font-size:14px;margin-top:12px;font-weight:600}
.reno-v11 .footer{text-align:center;margin-top:20px;font-size:13px;color:var(--ink-mute)}
.reno-v11 .check{display:flex;gap:13px;align-items:flex-start;padding:18px;border:1px solid var(--line);border-radius:var(--r-md);background:var(--paper);cursor:pointer;margin-top:24px}
.reno-v11 .check input{margin-top:2px;width:20px;height:20px;accent-color:var(--orange);flex:none;cursor:pointer}
.reno-v11 .check span{font-size:15px;color:var(--ink)}
.reno-v11 .grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px 18px;margin-top:26px}
.reno-v11 .field{display:flex;flex-direction:column;gap:7px}
.reno-v11 .field.full{grid-column:1/-1}
.reno-v11 .field label{font-size:13px;font-weight:600;color:var(--ink-soft);letter-spacing:.01em}
.reno-v11 .field input,.reno-v11 .field select{padding:12px 14px;border:1px solid var(--line);border-radius:var(--r-sm);background:#fff;font-size:15px;color:var(--ink);width:100%}
.reno-v11 .field input:focus,.reno-v11 .field select:focus{outline:none;border-color:var(--blue-soft);box-shadow:0 0 0 3px var(--blue-tint)}
.reno-v11 .note{color:var(--ink-mute);font-size:13.5px;margin-top:14px}
.reno-v11 .qcount{font-family:var(--mono);font-size:12px;letter-spacing:.1em;color:var(--ink-mute);text-transform:uppercase}
.reno-v11 .qaxis{display:inline-flex;align-items:center;gap:8px;margin-top:18px;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-soft)}
.reno-v11 .qaxis .dot{width:9px;height:9px;border-radius:50%;display:inline-block}
.reno-v11 .qtext{font-weight:700;letter-spacing:-.025em;font-size:clamp(22px,3.6vw,30px);line-height:1.2;margin:14px 0 34px}
.reno-v11 .likert{display:flex;flex-direction:column;gap:10px}
.reno-v11 .lk{display:flex;align-items:center;gap:16px;width:100%;padding:16px 20px;border:1.5px solid var(--line);border-radius:var(--r-md);background:#fff;text-align:left;transition:border-color .12s,background .12s,transform .1s}
.reno-v11 .lk:hover{border-color:var(--blue-soft);transform:translateX(2px)}
.reno-v11 .lk.sel{border-color:transparent;background:var(--ink);color:#fff}
.reno-v11 .lk .dotnum{width:30px;height:30px;flex:none;border-radius:50%;border:2px solid var(--line-dark);display:grid;place-items:center;font-family:var(--mono);font-size:13px;font-weight:600;color:var(--ink-mute)}
.reno-v11 .lk.sel .dotnum{border-color:rgba(255,255,255,.5);color:#fff}
.reno-v11 .lk .lktext{font-size:16px;font-weight:600}
.reno-v11 .lk[disabled]{opacity:.55;pointer-events:none}
.reno-v11 .testnav{display:flex;justify-content:space-between;align-items:center;margin-top:30px}
.reno-v11 .linkbtn{font-size:14px;font-weight:600;color:var(--ink-soft)}
.reno-v11 .linkbtn[disabled]{opacity:.3;pointer-events:none}
.reno-v11 .offline{background:#FFF0EF;border:1px solid var(--coral);border-radius:var(--r-sm);padding:10px 16px;margin-bottom:16px;color:var(--coral);font-size:13px;font-weight:600}
.reno-v11 .done-icon{width:72px;height:72px;border-radius:50%;background:var(--grad-coral);margin:0 auto 26px;display:grid;place-items:center}
.reno-v11 .disc{font-size:12.5px;color:var(--ink-mute);margin-top:28px;line-height:1.6}
@media(max-width:560px){
  .reno-v11 .grid2{grid-template-columns:1fr}
  .reno-v11 .stage{padding:36px 0}
  .reno-v11 .card{padding:22px}
}
`;

/* ─── Copy (EN/RU) ─── */
const T = {
  en: {
    lang_html: 'en',
    eyebrow: 'ReNo Assessment',
    heading: 'Welcome',
    subtitle: 'Enter the access code you received to begin your assessment.',
    code_label: 'Access code',
    code_ph: '000000',
    btn_begin: 'Begin →',
    btn_loading: 'Checking…',
    err_not_found: 'Code not found. Please check your entry.',
    err_already_used: 'This code has already been used. Please contact your provider.',
    err_expired: 'This code has expired.',
    err_network: 'Something went wrong. Please try again.',
    err_cooldown: 'You have already completed the assessment. You can take it again after {date}.',
    footer: 'Your answers are confidential and secure.',

    disclaimer_eyebrow: 'Step 1 of 3',
    disclaimer_heading: 'Before you begin',
    disclaimer_body: 'This assessment maps how you tend to think, decide, and respond across five dimensions of temperament. It takes about 15–20 minutes. Answer honestly and go with your first instinct — there are no right or wrong answers, and no pole is “better” than the other.',
    btn_continue: 'Continue →',

    consent_eyebrow: 'Step 2 of 3',
    consent_heading: 'Data consent',
    consent_body: 'Your results will be shared only with the specialist who issued your access code. Anonymous, aggregated data may be used for research purposes.',
    consent_check: 'I consent to the processing of my personal data.',
    consent_err: 'Please give your consent to continue.',

    intake_eyebrow: 'Step 3 of 3 · Optional',
    intake_heading: 'A few details',
    intake_note: 'This information is used for research purposes only. All fields are optional — feel free to skip.',
    intake_age: 'Age',
    intake_age_ph: '16+',
    intake_sex: 'Sex / gender identity',
    intake_country: 'Country',
    intake_native_language: 'Native language',
    intake_education: 'Education level',
    intake_occupation: 'Occupation / industry',
    intake_occupation_ph: 'e.g. Software engineer, Healthcare',
    intake_employment: 'Employment status',
    intake_relationship: 'Relationship status',
    intake_select_ph: 'Select…',
    intake_skip: 'Skip',
    intake_begin: 'Begin the test →',

    test_of: 'of',
    test_back: '← Back',
    test_next: 'Next',
    test_finish: 'See results →',
    test_offline: 'Could not save your answer. Please check your connection.',
    scale: ['Strongly disagree', 'Disagree', 'Neither agree nor disagree', 'Agree', 'Strongly agree'],

    complete_heading: 'Thank you',
    complete_loading: 'Finalizing…',
    complete_portal_body: 'Your assessment is complete and your personality passport is ready.',
    complete_portal_btn: 'Go to your portal →',
    complete_ext_body: 'Your assessment is complete. Your results will be prepared and sent to you within 24 hours. You may now close this page.',
    resume_note: 'Welcome back — continuing where you left off.',
  },
  ru: {
    lang_html: 'ru',
    eyebrow: 'Тестирование ReNo',
    heading: 'Добро пожаловать',
    subtitle: 'Введите полученный код доступа, чтобы начать тестирование.',
    code_label: 'Код доступа',
    code_ph: '000000',
    btn_begin: 'Начать →',
    btn_loading: 'Проверяем…',
    err_not_found: 'Код не найден. Проверьте правильность ввода.',
    err_already_used: 'Этот код уже был использован. Свяжитесь с вашим специалистом.',
    err_expired: 'Срок действия кода истёк.',
    err_network: 'Что-то пошло не так. Попробуйте ещё раз.',
    err_cooldown: 'Вы уже проходили тест. Пройти его снова можно после {date}.',
    footer: 'Ваши ответы конфиденциальны и защищены.',

    disclaimer_eyebrow: 'Шаг 1 из 3',
    disclaimer_heading: 'Перед началом',
    disclaimer_body: 'Этот тест показывает, как вы склонны думать, принимать решения и реагировать по пяти измерениям темперамента. Он занимает около 15–20 минут. Отвечайте честно и доверяйте первому ощущению — правильных и неправильных ответов нет, и ни один полюс не «лучше» другого.',
    btn_continue: 'Продолжить →',

    consent_eyebrow: 'Шаг 2 из 3',
    consent_heading: 'Согласие на обработку данных',
    consent_body: 'Результаты тестирования будут переданы только специалисту, выдавшему код доступа. Обезличенные данные могут использоваться в исследовательских целях.',
    consent_check: 'Я согласен(на) с обработкой моих персональных данных.',
    consent_err: 'Необходимо согласие для продолжения.',

    intake_eyebrow: 'Шаг 3 из 3 · Опционально',
    intake_heading: 'Немного о вас',
    intake_note: 'Эта информация используется только в исследовательских целях. Все поля необязательны.',
    intake_age: 'Возраст',
    intake_age_ph: '16+',
    intake_sex: 'Пол / гендерная идентичность',
    intake_country: 'Страна',
    intake_native_language: 'Родной язык',
    intake_education: 'Образование',
    intake_occupation: 'Профессия / отрасль',
    intake_occupation_ph: 'например, Программист, Медицина',
    intake_employment: 'Занятость',
    intake_relationship: 'Семейное положение',
    intake_select_ph: 'Выберите…',
    intake_skip: 'Пропустить',
    intake_begin: 'Начать тест →',

    test_of: 'из',
    test_back: '← Назад',
    test_next: 'Далее',
    test_finish: 'К результатам →',
    test_offline: 'Не удалось сохранить ответ. Проверьте соединение.',
    scale: ['Совершенно не согласен(на)', 'Не согласен(на)', 'Нейтрально', 'Согласен(на)', 'Полностью согласен(на)'],

    complete_heading: 'Спасибо',
    complete_loading: 'Завершаем…',
    complete_portal_body: 'Тест завершён, ваш паспорт личности готов.',
    complete_portal_btn: 'Перейти в кабинет →',
    complete_ext_body: 'Тест завершён. Ваши результаты будут подготовлены и отправлены вам в течение 24 часов. Вы можете закрыть эту страницу.',
    resume_note: 'С возвращением — продолжаем с того места, где вы остановились.',
  },
} as const;

/* ─── Intake option lists (EN/RU) ─── */
const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Argentina','Armenia','Australia','Austria','Azerbaijan',
  'Bahrain','Bangladesh','Belarus','Belgium','Bolivia','Brazil','Bulgaria','Cambodia',
  'Canada','Chile','China','Colombia','Croatia','Cuba','Czech Republic','Denmark',
  'Ecuador','Egypt','Estonia','Ethiopia','Finland','France','Georgia','Germany',
  'Ghana','Greece','Guatemala','Hungary','India','Indonesia','Iran','Iraq',
  'Ireland','Israel','Italy','Japan','Jordan','Kazakhstan','Kenya','Kuwait',
  'Kyrgyzstan','Latvia','Lebanon','Lithuania','Malaysia','Mexico','Moldova',
  'Morocco','Nepal','Netherlands','New Zealand','Nigeria','Norway','Pakistan',
  'Palestine','Peru','Philippines','Poland','Portugal','Qatar','Romania','Russia',
  'Saudi Arabia','Serbia','Singapore','Slovakia','South Africa','South Korea',
  'Spain','Sri Lanka','Sweden','Switzerland','Syria','Taiwan','Tajikistan',
  'Thailand','Tunisia','Turkey','Turkmenistan','Ukraine','United Arab Emirates',
  'United Kingdom','United States','Uzbekistan','Venezuela','Vietnam','Yemen','Other',
];

const NATIVE_LANGUAGES = [
  'Arabic','Bengali','Chinese (Cantonese)','Chinese (Mandarin)','Czech','Danish',
  'Dutch','English','Estonian','Finnish','French','German','Greek','Hebrew',
  'Hindi','Hungarian','Indonesian','Italian','Japanese','Kazakh','Korean',
  'Latvian','Lithuanian','Malay','Nepali','Norwegian','Persian / Farsi',
  'Polish','Portuguese','Romanian','Russian','Serbian','Slovak','Spanish',
  'Swahili','Swedish','Tagalog / Filipino','Tamil','Thai','Turkish',
  'Ukrainian','Urdu','Uzbek','Vietnamese','Other',
];

const SEX_OPTIONS: Record<Lang, string[]> = {
  en: ['Female', 'Male', 'Non-binary / gender diverse', 'Prefer not to say'],
  ru: ['Женщина', 'Мужчина', 'Небинарная идентичность', 'Не хочу указывать'],
};
const EDUCATION_OPTIONS: Record<Lang, string[]> = {
  en: ['High school', 'Some college', "Bachelor's degree", "Master's degree", 'Doctoral degree', 'Prefer not to say'],
  ru: ['Среднее', 'Неполное высшее', 'Бакалавр', 'Магистр', 'Доктор наук', 'Не хочу указывать'],
};
const EMPLOYMENT_OPTIONS: Record<Lang, string[]> = {
  en: ['Employed (full-time)', 'Employed (part-time)', 'Self-employed', 'Student', 'Job-seeking', 'Career transitioning', 'Not employed', 'Prefer not to say'],
  ru: ['Работаю полный день', 'Работаю неполный день', 'Самозанятый(ая)', 'Студент(ка)', 'В поиске работы', 'Смена карьеры', 'Не работаю', 'Не хочу указывать'],
};
const RELATIONSHIP_OPTIONS: Record<Lang, string[]> = {
  en: ['Single', 'In a relationship', 'Married / partnered', 'Divorced / separated', 'Widowed', 'Prefer not to say'],
  ru: ['Не в отношениях', 'В отношениях', 'В браке / с партнёром', 'В разводе / разлучён(а)', 'Вдовец / вдова', 'Не хочу указывать'],
};

/* ─── Deterministic interleave so axes don't clump (stable across resumes) ─── */
function interleave(qs: RenoQuestion[]): RenoQuestion[] {
  const byAxis: Record<string, RenoQuestion[]> = {};
  AXES.forEach(a => { byAxis[a.code] = []; });
  qs.forEach(q => { if (byAxis[q.axis]) byAxis[q.axis].push(q); });
  const order: RenoQuestion[] = [];
  let more = true, i = 0;
  while (more) {
    more = false;
    for (const a of AXES) {
      const list = byAxis[a.code];
      if (i < list.length) { order.push(list[i]); more = true; }
    }
    i++;
  }
  return order;
}

type Stage = 'code' | 'disclaimer' | 'consent' | 'intake' | 'test' | 'complete';
type Copy = (typeof T)[Lang];

/* ─── Constellation brand mark ─── */
function BrandMark() {
  const pts: [number, number][] = [];
  for (let k = 0; k < 5; k++) {
    const ang = (-90 + k * 72) * Math.PI / 180;
    pts.push([50 + 40 * Math.cos(ang), 50 + 40 * Math.sin(ang)]);
  }
  const poly = pts.map(p => p.join(',')).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="mk" aria-hidden="true">
      <polygon points={poly} fill="none" stroke="currentColor" strokeOpacity="0.28" strokeWidth="2" />
      {pts.map((p, k) => (
        <circle key={k} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r="7" fill={`var(--ax${k + 1})`} />
      ))}
    </svg>
  );
}

/* ─── Top bar ─── */
function TopBar({ lang, onLang, progress }: { lang: Lang; onLang: (l: Lang) => void; progress: number | null }) {
  return (
    <div className="topbar">
      <div className="row">
        <span className="brand"><BrandMark />Psy<i>ID</i></span>
        <span className="spacer" />
        <span className="langtoggle">
          {(['en', 'ru'] as Lang[]).map(l => (
            <button key={l} className={lang === l ? 'on' : ''} onClick={() => onLang(l)}>{LANG_NAMES[l]}</button>
          ))}
        </span>
      </div>
      {progress != null && (
        <div className="progressbar"><div className="fill" style={{ width: `${progress}%` }} /></div>
      )}
    </div>
  );
}

/* ─── Stage 1: Code entry ─── */
function CodeStage({ t, onSuccess }: { t: Copy; onSuccess: (sessionId: string, resumable: boolean) => void }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleSubmit = useCallback(async () => {
    if (code.length !== 6 || loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reno/sessions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error('network');
      const data = (await res.json()) as {
        valid: boolean;
        reason?: 'not_found' | 'already_used' | 'expired' | 'server_error' | 'cooldown';
        sessionId?: string;
        resumable?: boolean;
        availableAt?: string;
      };
      if (data.valid && data.sessionId) {
        sessionStorage.setItem('reno_session_id', data.sessionId);
        onSuccess(data.sessionId, !!data.resumable);
      } else if (data.reason === 'cooldown') {
        const when = data.availableAt
          ? new Date(data.availableAt).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })
          : '';
        setError(t.err_cooldown.replace('{date}', when));
      } else {
        const msgs: Partial<Record<string, string>> = {
          not_found: t.err_not_found,
          already_used: t.err_already_used,
          expired: t.err_expired,
        };
        setError(msgs[data.reason ?? ''] ?? t.err_network);
      }
    } catch {
      setError(t.err_network);
    } finally {
      setLoading(false);
    }
  }, [code, loading, onSuccess, t]);

  return (
    <div>
      <div className="card">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 style={{ fontSize: 32 }}>{t.heading}</h1>
        <p className="lede" style={{ fontSize: 15, marginTop: 12, marginBottom: 26 }}>{t.subtitle}</p>
        <label className="flabel" htmlFor="reno-code">{t.code_label}</label>
        <input
          ref={inputRef}
          id="reno-code"
          className="codebox"
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          value={code}
          placeholder={t.code_ph}
          aria-label={t.code_label}
          onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
        />
        {error && <p className="err">{error}</p>}
        <div className="btnrow">
          <button className="btn grad full" onClick={handleSubmit} disabled={code.length !== 6 || loading}>
            {loading ? t.btn_loading : t.btn_begin}
          </button>
        </div>
      </div>
      <p className="footer">{t.footer}</p>
    </div>
  );
}

/* ─── Stage 2: Disclaimer ─── */
function DisclaimerStage({ t, onContinue }: { t: Copy; onContinue: () => void }) {
  return (
    <div className="stage">
      <div className="eyebrow">{t.disclaimer_eyebrow}</div>
      <h1>{t.disclaimer_heading}</h1>
      <p className="lede">{t.disclaimer_body}</p>
      <div className="btnrow"><button className="btn grad" onClick={onContinue}>{t.btn_continue}</button></div>
    </div>
  );
}

/* ─── Stage 3: Consent ─── */
function ConsentStage({ t, onContinue }: { t: Copy; onContinue: () => void }) {
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  return (
    <div className="stage">
      <div className="eyebrow">{t.consent_eyebrow}</div>
      <h1>{t.consent_heading}</h1>
      <p className="lede">{t.consent_body}</p>
      <label className="check">
        <input type="checkbox" checked={checked} onChange={e => { setChecked(e.target.checked); setError(''); }} />
        <span>{t.consent_check}</span>
      </label>
      {error && <p className="err">{error}</p>}
      <div className="btnrow">
        <button className="btn grad" onClick={() => (checked ? onContinue() : setError(t.consent_err))}>{t.btn_continue}</button>
      </div>
    </div>
  );
}

/* ─── Stage 4: Intake ─── */
function IntakeStage({ t, sessionId, lang, onContinue }: { t: Copy; sessionId: string; lang: Lang; onContinue: () => void }) {
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('');
  const [country, setCountry] = useState('');
  const [nativeLanguage, setNativeLanguage] = useState('');
  const [education, setEducation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [employment, setEmployment] = useState('');
  const [relationship, setRelationship] = useState('');
  const [loading, setLoading] = useState(false);

  async function save(skip = false) {
    setLoading(true);
    try {
      await fetch(`/api/reno/sessions/${sessionId}/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consent: true,
          ...(!skip && age && !isNaN(parseInt(age, 10)) ? { age: parseInt(age, 10) } : {}),
          ...(!skip && sex ? { sex } : {}),
          ...(!skip && country ? { country } : {}),
          ...(!skip && nativeLanguage ? { nativeLanguage } : {}),
          ...(!skip && education ? { education } : {}),
          ...(!skip && occupation.trim() ? { occupation: occupation.trim() } : {}),
          ...(!skip && employment ? { employmentStatus: employment } : {}),
          ...(!skip && relationship ? { relationshipStatus: relationship } : {}),
        }),
      });
    } catch {
      // intake is optional — proceed regardless
    }
    setLoading(false);
    onContinue();
  }

  const ph = t.intake_select_ph;
  const sel = (label: string, value: string, setter: (v: string) => void, opts: string[], full = false) => (
    <div className={`field${full ? ' full' : ''}`}>
      <label>{label}</label>
      <select value={value} onChange={e => setter(e.target.value)}>
        <option value="">{ph}</option>
        {opts.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="stage">
      <div className="eyebrow">{t.intake_eyebrow}</div>
      <h1>{t.intake_heading}</h1>
      <p className="note">{t.intake_note}</p>
      <div className="grid2">
        <div className="field">
          <label>{t.intake_age}</label>
          <input type="number" min={16} max={99} inputMode="numeric" placeholder={t.intake_age_ph} value={age} onChange={e => setAge(e.target.value)} />
        </div>
        {sel(t.intake_sex, sex, setSex, SEX_OPTIONS[lang])}
        {sel(t.intake_country, country, setCountry, COUNTRIES)}
        {sel(t.intake_native_language, nativeLanguage, setNativeLanguage, NATIVE_LANGUAGES)}
        {sel(t.intake_education, education, setEducation, EDUCATION_OPTIONS[lang])}
        {sel(t.intake_employment, employment, setEmployment, EMPLOYMENT_OPTIONS[lang])}
        <div className="field full">
          <label>{t.intake_occupation}</label>
          <input placeholder={t.intake_occupation_ph} value={occupation} onChange={e => setOccupation(e.target.value)} />
        </div>
        {sel(t.intake_relationship, relationship, setRelationship, RELATIONSHIP_OPTIONS[lang])}
      </div>
      <div className="btnrow">
        <button className="btn grad" onClick={() => save()} disabled={loading}>{loading ? '…' : t.intake_begin}</button>
        <button className="btn ghost" onClick={() => save(true)} disabled={loading}>{t.intake_skip}</button>
      </div>
    </div>
  );
}

/* ─── Stage 5: Test engine (Likert) ─── */
function TestStage({ t, sessionId, lang, onProgress, onComplete }: {
  t: Copy;
  sessionId: string;
  lang: Lang;
  onProgress: (answered: number, total: number) => void;
  onComplete: () => void;
}) {
  const [order, setOrder] = useState<RenoQuestion[]>([]);
  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState<number | null>(null);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [locked, setLocked] = useState(false);
  const [fading, setFading] = useState(false);
  const [offline, setOffline] = useState(false);
  const shownAt = useRef<number>(Date.now());

  // Fetch the live v1.1 bank, interleave deterministically.
  useEffect(() => {
    fetch('/api/reno/questions')
      .then(r => r.json())
      .then((d: { questions: RenoQuestion[] }) => {
        setOrder(interleave(d.questions ?? []));
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  useEffect(() => { shownAt.current = Date.now(); }, [index]);

  // Resume: place the user at the first unanswered question.
  useEffect(() => {
    if (!ready || order.length === 0) return;
    fetch(`/api/reno/sessions/${sessionId}/progress`)
      .then(r => r.json())
      .then((data: { answers?: { questionId: string; answerId: string }[] }) => {
        const map: Record<string, number> = {};
        (data.answers ?? []).forEach(a => { const v = Number(a.answerId); if (v >= 1 && v <= 5) map[a.questionId] = v; });
        setResponses(map);
        const answered = data.answers?.length ?? 0;
        setIndex(Math.min(answered, order.length - 1));
      })
      .catch(() => setIndex(0));
  }, [sessionId, ready, order.length]);

  useEffect(() => {
    if (order.length) onProgress(Object.keys(responses).length, order.length);
  }, [responses, order.length, onProgress]);

  async function saveAnswer(questionId: string, answerId: string, idx: number, responseTimeMs: number): Promise<boolean> {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(`/api/reno/sessions/${sessionId}/answers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId,
            answerId,
            answeredAt: new Date().toISOString(),
            questionIndex: idx,
            responseTimeMs,
          }),
        });
        if (res.ok) return true;
      } catch { /* retry */ }
      if (attempt < 2) await new Promise(r => setTimeout(r, 600 * (attempt + 1)));
    }
    return false;
  }

  async function choose(value: number) {
    if (locked || index === null) return;
    const q = order[index];
    const responseTimeMs = Date.now() - shownAt.current;
    setLocked(true);
    setOffline(false);
    setResponses(prev => ({ ...prev, [q.id]: value }));

    const saved = await saveAnswer(q.id, String(value), index, responseTimeMs);
    if (!saved) {
      setOffline(true);
      setResponses(prev => { const n = { ...prev }; delete n[q.id]; return n; });
      setLocked(false);
      return;
    }

    await new Promise(r => setTimeout(r, 320));
    if (index >= order.length - 1) {
      onComplete();
      return;
    }
    setFading(true);
    await new Promise(r => setTimeout(r, 220));
    setIndex(i => (i ?? 0) + 1);
    setLocked(false);
    setFading(false);
  }

  function nav(delta: number) {
    if (index === null) return;
    setIndex(i => Math.min(order.length - 1, Math.max(0, (i ?? 0) + delta)));
  }

  if (!ready || order.length === 0 || index === null) {
    return <div className="stage" style={{ textAlign: 'center', color: 'var(--ink-mute)' }}>…</div>;
  }

  const q = order[index];
  const axis = AXIS_BY_CODE[q.axis];
  const cur = responses[q.id];
  const isLast = index === order.length - 1;

  return (
    <div className="stage">
      {offline && <div className="offline">{t.test_offline}</div>}
      <div className="qcount">{index + 1} {t.test_of} {order.length}</div>
      <div className="qaxis"><span className="dot" style={{ background: axis.color }} />{axis.name[lang]}</div>
      <div className="fadewrap" style={{ opacity: fading ? 0 : 1, transform: fading ? 'translateX(16px)' : 'none' }}>
        <div className="qtext">{q.text[lang]}</div>
        <div className="likert">
          {[1, 2, 3, 4, 5].map(r => (
            <button key={r} className={`lk${cur === r ? ' sel' : ''}`} disabled={locked} onClick={() => choose(r)}>
              <span className="dotnum">{r}</span>
              <span className="lktext">{t.scale[r - 1]}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="testnav">
        <button className="linkbtn" onClick={() => nav(-1)} disabled={index === 0 || locked}>{t.test_back}</button>
        {isLast
          ? <button className="btn grad" onClick={() => cur != null && choose(cur)} disabled={cur == null || locked}>{t.test_finish}</button>
          : <button className="linkbtn" onClick={() => nav(1)} disabled={cur == null || locked}>{t.test_next}</button>}
      </div>
    </div>
  );
}

/* ─── Stage 6: Complete ─── */
function CompleteStage({ t, sessionId }: { t: Copy; sessionId: string | null }) {
  const [result, setResult] = useState<{ isPortal: boolean; redirectUrl: string } | null>(null);
  const [apiErr, setApiErr] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const complete = useCallback(async () => {
    if (!sessionId) return;
    setRetrying(true);
    setApiErr(false);
    try {
      const res = await fetch(`/api/reno/sessions/${sessionId}/complete`, { method: 'POST' });
      if (res.ok) {
        const d = (await res.json()) as { isPortal?: boolean; redirectUrl?: string };
        setResult({ isPortal: !!d.isPortal, redirectUrl: d.redirectUrl || 'https://psyid.me/portal' });
      } else {
        setApiErr(true);
      }
    } catch {
      setApiErr(true);
    } finally {
      setRetrying(false);
    }
  }, [sessionId]);

  useEffect(() => { complete(); }, [complete]);

  // Revisits should start fresh.
  useEffect(() => {
    sessionStorage.removeItem('reno_stage');
    sessionStorage.removeItem('reno_session_id');
  }, []);

  const body = result?.isPortal ? t.complete_portal_body : t.complete_ext_body;

  return (
    <div className="card" style={{ textAlign: 'center', padding: '48px 40px' }}>
      <div className="done-icon">
        <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
          <path d="M7 15l6 6 10-12" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2>{t.complete_heading}</h2>
      <p className="lede" style={{ margin: '14px auto 30px', fontSize: 15 }}>
        {apiErr ? t.complete_ext_body : !result ? t.complete_loading : body}
      </p>
      {/* Portal takers get a way back to their passport; external one-time-code takers
          simply close the page (results are delivered by their specialist). */}
      {!apiErr && result?.isPortal && (
        <a href={result.redirectUrl} className="btn grad" style={{ textDecoration: 'none' }}>{t.complete_portal_btn}</a>
      )}
      {apiErr && (
        <button className="btn ghost" onClick={complete} disabled={retrying}>{retrying ? '…' : '↻'}</button>
      )}
    </div>
  );
}

/* ═══ Main page ═══ */
export default function RenoPage() {
  const [lang, setLang] = useState<Lang>('en');
  const [stage, setStage] = useState<Stage>('code');
  const [fading, setFading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [resume, setResume] = useState('');
  const [progress, setProgress] = useState(0);

  const t = T[lang];

  // Restore an in-progress session (same-tab navigation / refresh).
  useEffect(() => {
    const sid = sessionStorage.getItem('reno_session_id');
    const saved = sessionStorage.getItem('reno_stage') as Stage | null;
    if (sid && saved && saved !== 'code') { setSessionId(sid); setStage(saved); }
  }, []);

  useEffect(() => {
    if (stage !== 'code') sessionStorage.setItem('reno_stage', stage);
  }, [stage]);

  useEffect(() => { document.documentElement.lang = t.lang_html; }, [t.lang_html]);

  function goToStage(next: Stage) {
    setFading(true);
    setTimeout(() => { setStage(next); setFading(false); }, 250);
  }

  const handleProgress = useCallback((answered: number, total: number) => {
    setProgress(total ? Math.round((answered / total) * 100) : 0);
  }, []);

  function handleCodeSuccess(sid: string, resumable: boolean) {
    setSessionId(sid);
    if (resumable) { setResume(t.resume_note); goToStage('test'); }
    else goToStage('disclaimer');
  }

  return (
    <div className="reno-v11">
      <style>{CSS}</style>
      <TopBar lang={lang} onLang={setLang} progress={stage === 'test' ? progress : null} />
      {resume && <div className="resume">{resume}</div>}
      <div className="wrap" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="fadewrap" style={{ flex: 1, display: 'flex', flexDirection: 'column', opacity: fading ? 0 : 1, transform: fading ? 'translateY(8px)' : 'none' }}>
          {stage === 'code' && (
            <div className="stage"><CodeStage t={t} onSuccess={handleCodeSuccess} /></div>
          )}
          {stage === 'disclaimer' && <DisclaimerStage t={t} onContinue={() => goToStage('consent')} />}
          {stage === 'consent' && <ConsentStage t={t} onContinue={() => goToStage('intake')} />}
          {stage === 'intake' && <IntakeStage t={t} sessionId={sessionId!} lang={lang} onContinue={() => goToStage('test')} />}
          {stage === 'test' && <TestStage t={t} sessionId={sessionId!} lang={lang} onProgress={handleProgress} onComplete={() => goToStage('complete')} />}
          {stage === 'complete' && <div className="stage"><CompleteStage t={t} sessionId={sessionId} /></div>}
        </div>
      </div>
    </div>
  );
}
