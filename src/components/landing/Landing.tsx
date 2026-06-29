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

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  en: {
    nav_how: 'How it works', nav_explore: 'Explore', nav_passport: 'Passport',
    nav_price: 'Pricing', nav_faq: 'FAQ', nav_cta: 'Take test →', nav_specialists: 'Admins',
    badge: 'PSYID · Your Psychological Passport',
    hero_h1a: 'Discover who you are', hero_h1b: 'and what career fits you',
    hero_p: 'A 15-minute assessment maps your 4 character axes, surfaces your core strengths, and shows the careers where you\'ll naturally excel.',
    hero_cta: 'Take the free assessment', hero_sample: 'View sample',
    hero_free: 'Free', hero_min: '15 minutes', hero_instant: 'instant results',
    radar_energy: 'Energy', radar_attention: 'Attention', radar_decisions: 'Decisions', radar_structure: 'Structure',
    profile_label: 'Profile ·', profile_demo: 'Dreamer-Explorer',
    feat1_t: 'Psychological Passport', feat1_d: '24 pages — digital and print. Clear, honest language — no clinical jargon.',
    feat2_t: 'Strengths Map', feat2_d: 'What you genuinely do best, where to direct your energy, and where to stop forcing it.',
    feat3_t: 'Career Directions', feat3_d: 'Roles, industries, and work styles where you\'ll actually be at your best.',
    how_tag: 'How it works',
    how_h2a: 'Three steps to a', how_h2b: 'passport', how_h2c: ', not a label.',
    how_p: 'No clinical questionnaires or scary jargon. You work through a series of real-life scenarios.',
    step1_l: 'Step 01', step1_t: 'You take the assessment', step1_d: '15 minutes on any device. Not a quiz — a series of real-life scenarios most people find surprisingly enjoyable.',
    step2_l: 'Step 02', step2_t: 'We build your passport', step2_d: 'Your answers map onto 4 character axes. Every statement is reviewed by a psychologist, with a confidence score for each insight.',
    step3_l: 'Step 03', step3_t: 'You see your map', step3_d: 'Digital passport the same day. Print within a week. Inside: strengths, career directions, and 3 experiments to try this month.',
    explore_tag: 'Try it · 20 seconds',
    explore_h2a: 'Build your profile across', explore_h2b: '4 axes',
    explore_p: 'Move the dots on each axis — the shape shifts and a live description appears. That\'s how the passport works, just 24 pages deeper.',
    axis_energy_title: 'Energy', axis_energy_sub: 'how you recharge', axis_energy_left: 'Alone', axis_energy_right: 'With others',
    axis_attn_title: 'Attention', axis_attn_sub: 'where it naturally goes', axis_attn_left: 'Facts', axis_attn_right: 'Ideas',
    axis_decs_title: 'Decisions', axis_decs_sub: 'what they\'re based on', axis_decs_left: 'Logic', axis_decs_right: 'Feelings',
    axis_struct_title: 'Structure', axis_struct_sub: 'what feels natural', axis_struct_left: 'Plan', axis_struct_right: 'Flow',
    inside_tag: 'Inside the Passport',
    inside_h2a: 'Six things you\'ll', inside_h2b: 'discover',
    inside_p: 'Each section answers a question people actually ask before taking the assessment.',
    chip1: 'How you connect with new people',
    chip2: 'How you make decisions under pressure',
    chip3: 'What actually recharges you',
    chip4: 'Where to push yourself, where to let go',
    chip5: 'Careers you\'d genuinely excel in',
    chip6: 'Three experiments to try this month',
    passport_page: 'Page 14 / 24', passport_section: 'Section · Decisions',
    passport_quote: '"Lisa makes decisions after sitting with two good options. Rushed choices go poorly.',
    passport_bold: 'Give her a night', passport_footer1: 'PsyID · Psychological Passport',
    passport_conf: 'Confidence · 0.82',
    stats_tag: 'Methodology',
    stats_h2: 'Rigorous where it matters.',
    stats_p: 'Every item went through two rounds of expert review and field testing. No labels — just patterns.',
    stat1_l: 'character axes calibrated for adult life and careers',
    stat2_l: 'psychologists review every statement',
    stat3_l: 'people in the pre-release sample',
    stat4_l: 'average confidence score across passport statements',
    testi_q: '"I expected another personality test. I got a document that finally explains how I think — and what I should be doing with my career."',
    testi_author: 'Masha K.', testi_meta: 'designer · Tbilisi',
    price_tag: 'Pricing',
    price_h2a: 'Two ways to', price_h2b: 'start',
    price_sub: 'No subscription. Free delivery in Russia and Georgia.',
    plan1_name: 'Standard', plan1_price: '₽4 900', plan1_sub: 'Complete passport — digital and print.',
    plan1_f1: '24-page psychological passport', plan1_f2: 'Print version — delivery in 5 days',
    plan1_f3: 'Digital version + shareable card', plan1_f4: 'List of 3 experiments to try this month',
    plan1_cta: 'Start →',
    plan2_name: 'Passport + Consultation', plan2_price: '₽7 900',
    plan2_sub: 'Everything in Standard, plus a session with a psychology-trained career consultant.',
    plan2_badge: 'Recommended',
    plan2_f1: 'Everything in Standard', plan2_f2: '45-minute consultation with a psychologist',
    plan2_f3: 'Career next-steps plan', plan2_f4: '30 days of email support',
    plan2_cta: 'Start →',
    faq_tag: 'FAQ',
    faq_h2a: 'Questions people', faq_h2b: 'ask', faq_h2c: ' most often.',
    faq_p: 'The things people write to us before taking the assessment.',
    faq_q1: 'Isn\'t this just another MBTI test?',
    faq_a1: 'No. MBTI gives you a label. PsyID is a 24-page document reviewed by psychologists. Every statement is grounded in your specific answers and comes with a confidence score — so you always know how certain we are.',
    faq_q2: 'Won\'t this box me in?',
    faq_a2: 'That\'s our concern too. The passport is a starting point, not a verdict. It opens a conversation: "here\'s what we noticed, here\'s what to try." You change and grow — it says so on the first page.',
    faq_q3: 'Is this for career changers or people just starting out?',
    faq_a3: 'Both — and everyone in between. Whether you\'re switching careers, choosing your first path, or just wanting more clarity about yourself, the passport meets you where you are.',
    faq_q4: 'How long does it take?',
    faq_a4: 'About 15 minutes on any screen. Digital passport arrives the same day; the printed version within five days.',
    faq_q5: 'Who can see my results?',
    faq_a5: 'Only you. Your data is private by default. You decide whether to share your card with anyone — we never publish or sell anything, ever.',
    cta_h2a: 'Give yourself a chance to', cta_h2b: 'know yourself',
    cta_p: '15 minutes today — a map you\'ll use for years. The assessment is free.',
    cta_btn: 'Take the free assessment ↗', cta_sample: 'View sample',
    foot_tagline: 'Your psychological passport. Built with psychologists.',
    foot_prod: 'Product', foot_comp: 'Company', foot_contact: 'Contact',
    foot_link_how: 'How it works', foot_link_explore: 'Explore',
    foot_link_passport: 'Passport', foot_link_price: 'Pricing',
    foot_link_about: 'About us', foot_link_method: 'Methodology',
    foot_link_schools: 'For Organizations', foot_link_journal: 'Blog',
    foot_link_email: 'support@psyid.me', foot_link_tg: 'Telegram',
    foot_link_ig: 'Instagram', foot_link_press: 'Press Kit',
    foot_copy: '© 2026 PsyID · psyid.me', foot_legal: 'Privacy · Terms',
    foot_admin: 'Admin Portal',
    lang_toggle: 'RU',
  },
  ru: {
    nav_how: 'Как работает', nav_explore: 'Подобрать', nav_passport: 'Паспорт',
    nav_price: 'Цены', nav_faq: 'Вопросы', nav_cta: 'Пройти тест →', nav_specialists: 'Admins',
    badge: 'PSYID · Ваш психологический паспорт',
    hero_h1a: 'Узнайте кто вы', hero_h1b: 'и какая карьера вам подходит',
    hero_p: 'Тест за 15 минут строит психологический паспорт: 4 оси характера, ваши сильные стороны и карьерные направления, в которых вы будете по-настоящему эффективны.',
    hero_cta: 'Пройти тест бесплатно', hero_sample: 'Смотреть пример',
    hero_free: 'Бесплатно', hero_min: '15 минут', hero_instant: 'результат сразу',
    radar_energy: 'Энергия', radar_attention: 'Внимание', radar_decisions: 'Решения', radar_structure: 'Структура',
    profile_label: 'Профиль ·', profile_demo: 'Мечтатель-исследователь',
    feat1_t: 'Психологический паспорт', feat1_d: '24 страницы — печатный и цифровой. Понятный язык без клинического жаргона.',
    feat2_t: 'Карта сильных сторон', feat2_d: 'Что вам на самом деле даётся лучше всего, куда направлять усилия, а где — отпустить.',
    feat3_t: 'Карьерные направления', feat3_d: 'Роли, сферы и стили работы, в которых вы будете действительно эффективны.',
    how_tag: 'Как это работает',
    how_h2a: 'Три шага — и у вас в руках', how_h2b: 'паспорт', how_h2c: ', а не ярлык.',
    how_p: 'Никаких клинических опросников и пугающей лексики. Вы проходите серию жизненных сценариев.',
    step1_l: 'Шаг 01', step1_t: 'Вы проходите тест', step1_d: '15 минут на любом экране. Не опросник, а серия жизненных сценариев — большинству людей на удивление нравится.',
    step2_l: 'Шаг 02', step2_t: 'Мы строим паспорт', step2_d: 'Ответы ложатся в 4 оси характера. Каждое утверждение прошло экспертизу, у каждого вывода — оценка уверенности.',
    step3_l: 'Шаг 03', step3_t: 'Вы видите карту', step3_d: 'Цифровой паспорт в тот же день. Печатный — через неделю. Внутри: сильные стороны, карьерные пути и 3 эксперимента на ближайший месяц.',
    explore_tag: 'Попробуйте · 20 секунд',
    explore_h2a: 'Соберите профиль по', explore_h2b: '4 осям',
    explore_p: 'Двигайте точки на каждой оси — фигура меняется и появляется живое описание. Так и работает паспорт, только на 24 страницы глубже.',
    axis_energy_title: 'Энергия', axis_energy_sub: 'как восстанавливаетесь', axis_energy_left: 'В одиночестве', axis_energy_right: 'С другими',
    axis_attn_title: 'Внимание', axis_attn_sub: 'на что направлено', axis_attn_left: 'Факты', axis_attn_right: 'Идеи',
    axis_decs_title: 'Решения', axis_decs_sub: 'на чём основаны', axis_decs_left: 'Логика', axis_decs_right: 'Чувства',
    axis_struct_title: 'Структура', axis_struct_sub: 'что комфортнее', axis_struct_left: 'План', axis_struct_right: 'Свобода',
    inside_tag: 'Внутри паспорта',
    inside_h2a: 'Шесть вещей, которые вы', inside_h2b: 'узнаете',
    inside_p: 'Каждый раздел отвечает на вопрос, который нам задают до прохождения теста.',
    chip1: 'Как вы знакомитесь с новыми людьми',
    chip2: 'Как принимаете решения под давлением',
    chip3: 'Что на самом деле вас восстанавливает',
    chip4: 'Где давить на себя, где отпустить',
    chip5: 'Карьеры, в которых вы будете эффективны',
    chip6: 'Три эксперимента на ближайший месяц',
    passport_page: 'Страница 14 / 24', passport_section: 'Раздел · Решения',
    passport_quote: '«Маша принимает решения, посидев с двумя хорошими вариантами. Поспешные выборы идут плохо.',
    passport_bold: 'Дайте ей ночь', passport_footer1: 'PsyID · Психологический паспорт',
    passport_conf: 'Уверенность · 0.82',
    stats_tag: 'Методология',
    stats_h2: 'Строго там, где это важно.',
    stats_p: 'Каждый пункт прошёл два круга экспертизы и серию полевых проверок. Никаких ярлыков — только паттерны.',
    stat1_l: 'оси характера, адаптированные под взрослую жизнь и карьеру',
    stat2_l: 'психолога рецензируют каждое утверждение',
    stat3_l: 'человек в выборке до релиза',
    stat4_l: 'средняя уверенность утверждений в паспорте',
    testi_q: '«Я ждала очередного теста. И получила документ, который наконец объясняет, как я думаю — и куда мне идти в карьере».',
    testi_author: 'Маша К.', testi_meta: 'дизайнер · Тбилиси',
    price_tag: 'Цена',
    price_h2a: 'Два способа', price_h2b: 'начать',
    price_sub: 'Без подписки. Бесплатная доставка в РФ и Грузии.',
    plan1_name: 'Стандарт', plan1_price: '₽4 900', plan1_sub: 'Полный паспорт — печатный и цифровой.',
    plan1_f1: '24-страничный психологический паспорт', plan1_f2: 'Печатная версия — доставка за 5 дней',
    plan1_f3: 'Цифровая версия + карточка для пересылки', plan1_f4: 'Список из 3 экспериментов на месяц',
    plan1_cta: 'Начать →',
    plan2_name: 'Паспорт + консультация', plan2_price: '₽7 900',
    plan2_sub: 'Всё из Стандарта, плюс сессия с карьерным психологом.',
    plan2_badge: 'Рекомендуем',
    plan2_f1: 'Всё из «Стандарта»', plan2_f2: '45-минутная консультация с психологом',
    plan2_f3: 'План карьерных следующих шагов', plan2_f4: 'Поддержка по почте в течение 30 дней',
    plan2_cta: 'Начать →',
    faq_tag: 'Вопросы',
    faq_h2a: 'То, что нас', faq_h2b: 'спрашивают', faq_h2c: ' чаще всего.',
    faq_p: 'То, о чём пишут до того, как пройти тест.',
    faq_q1: 'Это не очередной тест MBTI?',
    faq_a1: 'Нет. MBTI даёт ярлык. PsyID — это 24-страничный документ, прошедший экспертизу психологов. Каждое утверждение опирается на ваши конкретные ответы и сопровождается оценкой уверенности — вы всегда знаете, насколько мы в этом уверены.',
    faq_q2: 'Не загонит ли это меня в рамки?',
    faq_a2: 'Это наш страх тоже. Паспорт — стартовая точка, а не приговор. Он открывает разговор: «вот что мы заметили, вот что можно попробовать». Вы меняетесь — об этом написано на первой странице.',
    faq_q3: 'Это для смены карьеры или тех, кто только начинает?',
    faq_a3: 'Для всех — и для тех, кто посередине. Смена карьеры, первый выбор направления или просто желание лучше понять себя — паспорт встречает вас там, где вы сейчас.',
    faq_q4: 'Сколько занимает тест?',
    faq_a4: 'Около 15 минут на любом экране. Цифровой паспорт — в тот же день, печатный — в течение пяти дней.',
    faq_q5: 'Кто увидит результаты?',
    faq_a5: 'Только вы. По умолчанию данные приватны. Вы сами решаете, делиться ли с кем-то — мы не публикуем и не продаём ничего никогда.',
    cta_h2a: 'Дайте себе шанс', cta_h2b: 'понять себя',
    cta_p: '15 минут сегодня — карта, которой можно пользоваться годами. Тест бесплатный.',
    cta_btn: 'Пройти тест бесплатно ↗', cta_sample: 'Смотреть пример',
    foot_tagline: 'Ваш психологический паспорт. Разработан вместе с психологами.',
    foot_prod: 'Продукт', foot_comp: 'Компания', foot_contact: 'Связаться',
    foot_link_how: 'Как это работает', foot_link_explore: 'Попробовать',
    foot_link_passport: 'Паспорт', foot_link_price: 'Цены',
    foot_link_about: 'О нас', foot_link_method: 'Методология',
    foot_link_schools: 'Для организаций', foot_link_journal: 'Журнал',
    foot_link_email: 'support@psyid.me', foot_link_tg: 'Telegram',
    foot_link_ig: 'Instagram', foot_link_press: 'Пресс-кит',
    foot_copy: '© 2026 PsyID · psyid.me', foot_legal: 'Приватность · Условия',
    foot_admin: 'Портал администратора',
    lang_toggle: 'EN',
  },
} as const;

// ── Profiles ──────────────────────────────────────────────────────────────────
const PROFILES_RU: Record<string, [string, string]> = {
  'I,S,T,J': ['Опора',              'Надёжен до основания. Любит чёткие правила, законченные задачи, план, который пройдёт встречи с реальностью.'],
  'I,S,F,J': ['Хранитель',          'Помнит у всех всё. Постоянный, верный, первым замечает, что у коллеги плохой день.'],
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

const PROFILES_EN: Record<string, [string, string]> = {
  'I,S,T,J': ['Foundation',       'Reliable to the core. Loves clear rules, finished tasks, and plans that hold up in the real world.'],
  'I,S,F,J': ['Guardian',         'Remembers everything about everyone. Steady, loyal, first to notice when a colleague is having a rough day.'],
  'I,N,T,J': ['Strategist',       'Plays the long game. Quietly building a plan in their head while everyone else is still discussing.'],
  'I,N,F,J': ['Quiet Architect',  'Reads people deeply, cares about nuance. Reserved, purposeful, and surprisingly persistent.'],
  'I,S,T,P': ['Craftsman',        'Calm under pressure, endlessly practical. Give them something broken and some space.'],
  'I,S,F,P': ['Artisan',          'Learns by doing, feels deeply. Soft on the outside — firm inside on what matters.'],
  'I,N,T,P': ['Explorer',         'Lives in ideas. Happily takes the world apart — and sometimes forgets to share the conclusions.'],
  'I,N,F,P': ['Dreamer',          'Quietly inventive, guided by an inner compass. Needs space — then commits deeply once they choose.'],
  'E,S,T,J': ['Organizer',        'Gets things done and brings order. Clear, fair, excellent in a leadership role.'],
  'E,S,F,J': ['Host',             'The glue of any group. Warm, practical, quietly making sure everyone is okay.'],
  'E,N,T,J': ['Commander',        'Sees the goal and the path instantly. Born to organize people.'],
  'E,N,F,J': ['Captain',          'Connects people and helps them grow. Leads with heart, remembers names.'],
  'E,S,T,P': ['Doer',             'Action first, theory later. Loves challenge, risk, and problems that need solving right now.'],
  'E,S,F,P': ['Performer',        'Lives in the moment, brings the energy. Learns on their feet, in front of an audience.'],
  'E,N,T,P': ['Debater',          'Loves debate for its own sake. Fast, bold, can\'t stand obvious answers.'],
  'E,N,F,P': ['Spark',            'A fountain of ideas and enthusiasm. Lights up the room, then three projects — simultaneously.'],
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
  const [lang, setLang]       = useState<'en' | 'ru'>('en');
  const [vals, setVals]       = useState<Record<AxisKey, number>>({ top: 0, right: 1, bot: 2, left: -1 });
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const t = T[lang];
  const PROFILES = lang === 'en' ? PROFILES_EN : PROFILES_RU;

  const pT = pt('top',   rad(vals.top));
  const pR = pt('right', rad(vals.right));
  const pB = pt('bot',   rad(vals.bot));
  const pL = pt('left',  rad(vals.left));
  const polyPts  = `${pT.x},${pT.y} ${pR.x},${pR.y} ${pB.x},${pB.y} ${pL.x},${pL.y}`;
  const bloomRx  = Math.max(rad(vals.left), rad(vals.right)) * 0.55 + 20;
  const bloomRy  = Math.max(rad(vals.top),  rad(vals.bot))   * 0.85;
  const typeCode = (['top','right','bot','left'] as AxisKey[]).map(a => letter(a, vals[a])).join(',');
  const [profName, profDesc] = PROFILES[typeCode] ?? (lang === 'en' ? ['Your Profile', 'A unique blend of all four axes.'] : ['Свой профиль', 'Уникальная смесь всех четырёх осей.']);
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
            display: 'flex', alignItems: 'center',
            background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.12)', borderRadius: 999,
            padding: '8px 8px 8px 20px',
          }}>
            {/* Logo — flex:1 left */}
            <div style={{ flex: 1 }}>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 20, letterSpacing: '-0.03em', color: '#fff' }}>
                <span style={{ width: 30, height: 30, borderRadius: 9, background: '#fff', position: 'relative', flexShrink: 0, overflow: 'hidden', display: 'inline-block' }}>
                  <span style={{ position: 'absolute', left: 5, top: 5, width: 9, height: 9, borderRadius: '50%', background: C.blue }}/>
                  <span style={{ position: 'absolute', right: 5, bottom: 5, width: 9, height: 9, borderRadius: 3, background: C.orangeHot }}/>
                </span>
                Psy<span style={{ color: C.orangeHot }}>ID</span>
              </Link>
            </div>

            {/* Nav links — truly centered */}
            <div className="r-nav-links">
              {([[`#how`, t.nav_how],[`#explore`, t.nav_explore],[`#inside`, t.nav_passport],[`#price`, t.nav_price],[`#faq`, t.nav_faq]] as [string,string][]).map(([h, l]) => (
                <a key={h} href={h} style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.78)' }}>{l}</a>
              ))}
            </div>

            {/* Actions — flex:1 right */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => setLang(lang === 'en' ? 'ru' : 'en')}
                style={{
                  background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)',
                  color: '#fff', borderRadius: 999, padding: '6px 13px',
                  fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: '0.12em',
                  textTransform: 'uppercase', cursor: 'pointer', fontWeight: 600,
                }}
              >
                {t.lang_toggle}
              </button>
              <Link href="/admin" style={{
                background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.22)',
                color: 'rgba(255,255,255,0.82)', borderRadius: 999, padding: '6px 14px',
                fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              }}>
                {t.nav_specialists}
              </Link>
              <Link href="/register" style={{ background: '#fff', color: C.ink, padding: '9px 18px', borderRadius: 999, fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap' }}>
                {t.nav_cta}
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Hero body ── */}
        <div className="r-wrap r-hero">
          <div className="r-hero-text">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(14px)',
              border: '1px solid rgba(255,255,255,0.16)', borderRadius: 999,
              padding: '9px 16px 9px 12px', marginBottom: 28,
              fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: '0.10em', textTransform: 'uppercase', color: '#fff', fontWeight: 500,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: `linear-gradient(135deg, ${C.orangeHot}, ${C.coral})`, boxShadow: `0 0 10px ${C.orangeHot}`, display: 'inline-block', flexShrink: 0 }}/>
              {t.badge}
            </div>

            <h1 style={{ fontSize: 'clamp(40px, 5.5vw, 82px)', fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.02, color: '#fff', margin: 0 }}>
              {t.hero_h1a}{' '}
              <span style={{ background: 'linear-gradient(95deg, #FF6385, #FF7E6B)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>—</span>
              <br/>
              <span style={{ background: 'linear-gradient(95deg, #FF9447, #FFC474)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{t.hero_h1b}</span>
            </h1>

            <p style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', lineHeight: 1.55, color: 'rgba(255,255,255,0.78)', maxWidth: '46ch', margin: '28px 0 32px' }}>
              {t.hero_p}
            </p>

            <div className="r-hero-cta" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <Link href="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: 10, borderRadius: 999,
                padding: '14px 24px', fontWeight: 700, fontSize: 15, color: '#fff',
                background: 'linear-gradient(95deg, #FF5C72, #FF8A45)',
                boxShadow: '0 12px 28px -8px rgba(255,114,80,.6)',
              }}>
                {t.hero_cta} <span>↗</span>
              </Link>
              <button style={{ borderRadius: 999, padding: '12px 20px', fontWeight: 600, fontSize: 14, background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.4)', cursor: 'pointer', fontFamily: 'inherit' }}>
                {t.hero_sample}
              </button>
            </div>

            <div style={{ marginTop: 24, fontFamily: "'Geist Mono', monospace", fontSize: 12, letterSpacing: '0.06em', color: 'rgba(255,255,255,0.55)' }}>
              <b style={{ color: '#fff', fontWeight: 500 }}>{t.hero_free}</b>
              <span style={{ margin: '0 10px', opacity: 0.4 }}>·</span>
              <b style={{ color: '#fff', fontWeight: 500 }}>{t.hero_min}</b>
              <span style={{ margin: '0 10px', opacity: 0.4 }}>·</span>
              <b style={{ color: '#fff', fontWeight: 500 }}>{t.hero_instant}</b>
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
            <div style={{ ...FLOAT_LABEL, top: '6%', left: '50%', transform: 'translateX(-50%)' }}>{t.radar_energy}<b style={{ color: '#fff', fontFamily: 'inherit', fontSize: 14, marginLeft: 6 }}>0.74</b></div>
            <div style={{ ...FLOAT_LABEL, right: 0, top: '50%', transform: 'translateY(-50%)' }}>{t.radar_attention}<b style={{ color: '#fff', fontFamily: 'inherit', fontSize: 14, marginLeft: 6 }}>0.61</b></div>
            <div style={{ ...FLOAT_LABEL, bottom: '6%', left: '50%', transform: 'translateX(-50%)' }}>{t.radar_decisions}<b style={{ color: '#fff', fontFamily: 'inherit', fontSize: 14, marginLeft: 6 }}>0.83</b></div>
            <div style={{ ...FLOAT_LABEL, left: 0, top: '50%', transform: 'translateY(-50%)' }}>{t.radar_structure}<b style={{ color: '#fff', fontFamily: 'inherit', fontSize: 14, marginLeft: 6 }}>0.42</b></div>
            <div style={{
              position: 'absolute', right: 16, bottom: 16,
              background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.16)',
              padding: '10px 14px', borderRadius: 14, backdropFilter: 'blur(14px)',
              fontFamily: "'Geist Mono', monospace", fontSize: 10, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.06em',
            }}>
              {t.profile_label}{' '}
              <b style={{ display: 'block', color: '#fff', fontFamily: 'inherit', fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', marginTop: 2 }}>
                {t.profile_demo}
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
              title: t.feat1_t, desc: t.feat1_d },
            { grad: `linear-gradient(135deg, ${C.coral}, ${C.orangeHot})`,
              icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M3 18L9 12l4 2 6-8" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="9" cy="12" r="1.5" fill="#fff"/><circle cx="13" cy="14" r="1.5" fill="#fff"/><circle cx="19" cy="6" r="1.5" fill="#fff"/></svg>,
              title: t.feat2_t, desc: t.feat2_d },
            { grad: `linear-gradient(135deg, ${C.orangeHot}, ${C.gold})`,
              icon: <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="#fff" strokeWidth="1.8"/><circle cx="11" cy="11" r="3" fill="#fff"/><line x1="11" y1="3" x2="11" y2="6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/><line x1="11" y1="16" x2="11" y2="19" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/><line x1="3" y1="11" x2="6" y2="11" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/><line x1="16" y1="11" x2="19" y2="11" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/></svg>,
              title: t.feat3_t, desc: t.feat3_d },
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
          <div style={{ maxWidth: 680, marginBottom: 48, margin: '0 auto 48px' }}>
            <div style={TAG}>{DOT}{t.how_tag}</div>
            <h2 style={{ fontSize: 'clamp(32px,4vw,56px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '16px 0 0' }}>
              {t.how_h2a}{' '}
              <span style={{ background: `linear-gradient(95deg, ${C.blue}, ${C.blueSoft})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{t.how_h2b}</span>
              {t.how_h2c}
            </h2>
            <p style={{ fontSize: 16, color: C.inkSoft, margin: '18px 0 0' }}>{t.how_p}</p>
          </div>
          <div className="r-steps">
            {[
              { n: '1', l: t.step1_l, t: t.step1_t, d: t.step1_d, g: `linear-gradient(135deg, ${C.blue}, ${C.blueSoft})` },
              { n: '2', l: t.step2_l, t: t.step2_t, d: t.step2_d, g: `linear-gradient(135deg, ${C.coral}, ${C.orangeHot})` },
              { n: '3', l: t.step3_l, t: t.step3_t, d: t.step3_d, g: `linear-gradient(135deg, ${C.orangeHot}, ${C.gold})` },
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
          <div style={{ maxWidth: 680, margin: '0 auto 48px' }}>
            <div style={{ ...TAG, color: 'rgba(255,255,255,0.55)' }}>{DOT}{t.explore_tag}</div>
            <h2 style={{ fontSize: 'clamp(32px,4vw,56px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#fff', margin: '16px 0 0' }}>
              {t.explore_h2a}{' '}
              <span style={{ background: `linear-gradient(95deg, ${C.orangeHot}, ${C.gold})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{t.explore_h2b}</span>.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', margin: '18px 0 0' }}>{t.explore_p}</p>
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
                  <text x="230" y="14" textAnchor="middle">{t.radar_energy.toUpperCase()}</text>
                  <text x="450" y="234" textAnchor="end">{t.radar_attention.toUpperCase()}</text>
                  <text x="230" y="454" textAnchor="middle">{t.radar_decisions.toUpperCase()}</text>
                  <text x="10" y="234" textAnchor="start">{t.radar_structure.toUpperCase()}</text>
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
                { key: 'top'   as AxisKey, title: t.axis_energy_title,  sub: t.axis_energy_sub,  left: t.axis_energy_left,  right: t.axis_energy_right  },
                { key: 'right' as AxisKey, title: t.axis_attn_title,    sub: t.axis_attn_sub,    left: t.axis_attn_left,    right: t.axis_attn_right    },
                { key: 'bot'   as AxisKey, title: t.axis_decs_title,    sub: t.axis_decs_sub,    left: t.axis_decs_left,    right: t.axis_decs_right    },
                { key: 'left'  as AxisKey, title: t.axis_struct_title,  sub: t.axis_struct_sub,  left: t.axis_struct_left,  right: t.axis_struct_right  },
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
              <div style={TAG}>{DOT}{t.inside_tag}</div>
              <h2 style={{ fontSize: 'clamp(32px,4vw,56px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '16px 0 0' }}>
                {t.inside_h2a}{' '}
                <span style={{ background: `linear-gradient(95deg, ${C.coral}, ${C.orangeHot})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{t.inside_h2b}</span>.
              </h2>
              <p style={{ fontSize: 16, color: C.inkSoft, margin: '18px 0 0' }}>{t.inside_p}</p>
            </div>
            <div className="r-chips">
              {[
                { n: '01', txt: t.chip1 }, { n: '02', txt: t.chip2 },
                { n: '03', txt: t.chip3 }, { n: '04', txt: t.chip4 },
                { n: '05', txt: t.chip5 }, { n: '06', txt: t.chip6 },
              ].map(c => (
                <div key={c.n} style={{ background: C.bone, border: `1px solid ${C.line}`, borderRadius: 18, padding: '18px 18px 20px' }}>
                  <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.orange, fontWeight: 600 }}>{c.n}</div>
                  <div style={{ fontWeight: 700, fontSize: 15, marginTop: 10, lineHeight: 1.25, letterSpacing: '-0.01em' }}>{c.txt}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: `linear-gradient(135deg, ${C.navy1} 0%, ${C.navy2} 60%, #1A2D6E 100%)`, color: '#fff', borderRadius: 28, padding: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', right: -60, top: -60, width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,128,72,0.3) 0%, transparent 70%)', pointerEvents: 'none' }}/>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', position: 'relative' }}>
              <span>{t.passport_page}</span><span>{t.passport_section}</span>
            </div>
            <div style={{ fontWeight: 500, fontSize: 'clamp(18px, 2vw, 24px)', lineHeight: 1.4, margin: '24px 0', letterSpacing: '-0.01em', position: 'relative' }}>
              {t.passport_quote}{' '}
              <b style={{ background: `linear-gradient(95deg, ${C.orangeHot}, ${C.gold})`, color: '#fff', padding: '0 7px', borderRadius: 5, fontWeight: 700 }}>{t.passport_bold}</b>».
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 16, fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', position: 'relative' }}>
              <span>{t.passport_footer1}</span>
              <span style={{ color: C.gold }}>{t.passport_conf}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ STATS ════════════════ */}
      <section className="r-section" style={{ position: 'relative', overflow: 'hidden', color: '#fff' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: -1, background: 'linear-gradient(95deg, #1228A0 0%, #2244E0 35%, #FF5A6E 70%, #FF823F 100%)' }}/>
        <div className="r-wrap">
          <div style={{ maxWidth: 640, margin: '0 auto 0' }}>
            <div style={{ ...TAG, color: 'rgba(255,255,255,0.65)' }}>{DOT}{t.stats_tag}</div>
            <h2 style={{ fontSize: 'clamp(32px,4vw,56px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, color: '#fff', margin: '16px 0 18px' }}>
              {t.stats_h2}
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', margin: 0 }}>{t.stats_p}</p>
          </div>
          <div className="r-stats">
            {[
              { n: '4',    l: t.stat1_l },
              { n: '2',    l: t.stat2_l },
              { n: '412',  l: t.stat3_l },
              { n: '0.85', l: t.stat4_l },
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
            {t.testi_q}
          </p>
          <div style={{ marginTop: 28, fontFamily: "'Geist Mono', monospace", fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', color: C.inkMute }}>
            — <b style={{ color: C.ink, fontWeight: 600 }}>{t.testi_author}</b> · {t.testi_meta}
          </div>
        </div>
      </section>

      {/* ════════════════ PRICING ════════════════ */}
      <section id="price" style={{ padding: '0 0 90px' }}>
        <div className="r-wrap">
          <div style={{ maxWidth: 640, margin: '0 auto 48px' }}>
            <div style={TAG}>{DOT}{t.price_tag}</div>
            <h2 style={{ fontSize: 'clamp(32px,4vw,56px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '16px 0 0' }}>
              {t.price_h2a}{' '}
              <span style={{ background: `linear-gradient(95deg, ${C.coral}, ${C.orangeHot})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{t.price_h2b}</span>.
            </h2>
            <p style={{ fontSize: 16, color: C.inkSoft, margin: '18px 0 0' }}>{t.price_sub}</p>
          </div>
          <div className="r-price">
            <div style={{ borderRadius: 28, padding: '36px 32px', border: `1px solid ${C.line}`, background: '#fff', display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.inkMute }}>{t.plan1_name}</div>
              <div style={{ fontWeight: 800, fontSize: 'clamp(48px,5vw,68px)', letterSpacing: '-0.04em', margin: '16px 0 4px', lineHeight: 1 }}>{t.plan1_price}</div>
              <div style={{ color: C.inkSoft, fontSize: 14, marginBottom: 24 }}>{t.plan1_sub}</div>
              <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
                {[t.plan1_f1, t.plan1_f2, t.plan1_f3, t.plan1_f4].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14 }}>
                    <span style={{ color: C.orange, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/test" style={{ display: 'flex', justifyContent: 'center', padding: '13px 20px', borderRadius: 999, background: 'transparent', color: C.ink, border: `1.5px solid ${C.ink}`, fontWeight: 600, fontSize: 14 }}>
                {t.plan1_cta}
              </Link>
            </div>

            <div style={{ borderRadius: 28, padding: '36px 32px', background: `linear-gradient(135deg, ${C.ink} 0%, #1A2056 100%)`, color: '#fff', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', right: -80, bottom: -80, width: 280, height: 280, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,128,72,0.3) 0%, transparent 70%)', pointerEvents: 'none' }}/>
              <div style={{ position: 'absolute', top: 20, right: 20, background: `linear-gradient(95deg, ${C.coral}, ${C.orangeHot})`, color: '#fff', fontFamily: "'Geist Mono', monospace", fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', padding: '6px 12px', borderRadius: 999, fontWeight: 600 }}>{t.plan2_badge}</div>
              <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.orangeHot, position: 'relative' }}>{t.plan2_name}</div>
              <div style={{ fontWeight: 800, fontSize: 'clamp(48px,5vw,68px)', letterSpacing: '-0.04em', margin: '16px 0 4px', lineHeight: 1, position: 'relative', background: `linear-gradient(95deg, #fff 0%, ${C.gold} 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{t.plan2_price}</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 24, position: 'relative' }}>{t.plan2_sub}</div>
              <ul style={{ listStyle: 'none', margin: '0 0 24px', padding: 0, display: 'flex', flexDirection: 'column', gap: 10, flex: 1, position: 'relative' }}>
                {[t.plan2_f1, t.plan2_f2, t.plan2_f3, t.plan2_f4].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 14 }}>
                    <span style={{ color: C.orangeHot, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/test" style={{ display: 'flex', justifyContent: 'center', padding: '14px 20px', borderRadius: 999, background: 'linear-gradient(95deg, #FF5C72, #FF8A45)', color: '#fff', fontWeight: 700, fontSize: 14, boxShadow: '0 12px 28px -8px rgba(255,114,80,.6)', position: 'relative' }}>
                {t.plan2_cta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ FAQ ════════════════ */}
      <section id="faq" style={{ padding: '0 0 90px' }}>
        <div className="r-wrap r-faq">
          <div>
            <div style={TAG}>{DOT}{t.faq_tag}</div>
            <h2 style={{ fontSize: 'clamp(32px,4vw,56px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.05, margin: '16px 0 0' }}>
              {t.faq_h2a}{' '}
              <span style={{ background: `linear-gradient(95deg, ${C.blue}, ${C.blueSoft})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{t.faq_h2b}</span>
              {t.faq_h2c}
            </h2>
            <p style={{ fontSize: 16, color: C.inkSoft, margin: '18px 0 0' }}>{t.faq_p}</p>
          </div>
          <div style={{ borderTop: `1px solid ${C.line}` }}>
            {[
              { q: t.faq_q1, a: t.faq_a1 },
              { q: t.faq_q2, a: t.faq_a2 },
              { q: t.faq_q3, a: t.faq_a3 },
              { q: t.faq_q4, a: t.faq_a4 },
              { q: t.faq_q5, a: t.faq_a5 },
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
              {t.cta_h2a}{' '}
              <span style={{ background: `linear-gradient(95deg, ${C.orangeHot}, ${C.gold})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{t.cta_h2b}</span>.
            </h2>
            <p style={{ fontSize: 'clamp(15px,1.5vw,18px)', color: 'rgba(255,255,255,0.82)', maxWidth: '44ch', margin: '22px auto 32px' }}>
              {t.cta_p}
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, borderRadius: 999, padding: '14px 24px', fontWeight: 700, fontSize: 15, background: 'linear-gradient(95deg, #FF5C72, #FF8A45)', color: '#fff', boxShadow: '0 12px 28px -8px rgba(255,114,80,.6)' }}>
                {t.cta_btn}
              </Link>
              <button style={{ borderRadius: 999, padding: '12px 20px', fontWeight: 600, fontSize: 14, background: 'transparent', color: '#fff', border: '1.5px solid rgba(255,255,255,.4)', cursor: 'pointer', fontFamily: 'inherit' }}>
                {t.cta_sample}
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
              <p style={{ color: C.inkSoft, fontSize: 14, maxWidth: '28ch', lineHeight: 1.6 }}>{t.foot_tagline}</p>
            </div>
            {[
              { h: t.foot_prod,    links: [['#how', t.foot_link_how],['#explore', t.foot_link_explore],['#inside', t.foot_link_passport],['#price', t.foot_link_price]] },
              { h: t.foot_comp,    links: [['#', t.foot_link_about],['#', t.foot_link_method],['#', t.foot_link_schools],['#', t.foot_link_journal]] },
              { h: t.foot_contact, links: [['#', t.foot_link_email],['#', t.foot_link_tg],['#', t.foot_link_ig],['#', t.foot_link_press]] },
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
            <span>{t.foot_copy}</span>
            <div style={{ display: 'flex', gap: 16 }}>
              <span>{t.foot_legal}</span>
              <Link href="/admin" style={{ color: C.inkMute, opacity: 0.6 }}>{t.foot_admin}</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
