'use client';

import { useAdminLang } from '@/lib/adminLang';

const C = { ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8', line: '#E5DED2', bone: '#F6F1EA', orangeHot: '#FF9540', blue: '#2244E0', coral: '#FF5A5A' };

const FUNNEL = [
  { en: 'Visitors',          ru: 'Посетители',            pct: 100, color: C.blue      },
  { en: 'Registrations',     ru: 'Регистрации',           pct: 68,  color: '#6A85F0'   },
  { en: 'Started Test',      ru: 'Начали тест',           pct: 44,  color: C.orangeHot },
  { en: 'Completed Test',    ru: 'Завершили тест',        pct: 29,  color: '#FF5A5A'   },
  { en: 'Purchased Upgrade', ru: 'Купили апгрейд',        pct: 8,   color: '#FFC074'   },
];

const FEATURES = [
  {
    icon: '🔭',
    en: { title: 'Full Funnel Analysis', desc: 'Track every step from landing visit to paid upgrade. Identify where users drop off.' },
    ru: { title: 'Полный анализ воронки', desc: 'Отслеживайте каждый шаг от первого визита до оплаченного апгрейда. Находите точки оттока.' },
  },
  {
    icon: '📈',
    en: { title: 'Conversion Rates', desc: 'Step-to-step conversion rates. Week-over-week and month-over-month comparisons.' },
    ru: { title: 'Конверсия', desc: 'Конверсия на каждом шаге воронки. Сравнение по неделям и месяцам.' },
  },
  {
    icon: '📅',
    en: { title: 'Date Range Filters', desc: 'Filter all analytics by custom date ranges. Compare two periods side by side.' },
    ru: { title: 'Фильтры по датам', desc: 'Фильтруйте всю аналитику по произвольному периоду. Сравнивайте два периода рядом.' },
  },
  {
    icon: '🌍',
    en: { title: 'Traffic Sources', desc: 'Understand where users come from — direct, organic, social, referral.' },
    ru: { title: 'Источники трафика', desc: 'Откуда приходят пользователи — прямые заходы, органика, соцсети, реферралы.' },
  },
  {
    icon: '📤',
    en: { title: 'Export Reports', desc: 'Export analytics data to CSV or PDF for stakeholder reporting.' },
    ru: { title: 'Экспорт отчётов', desc: 'Экспортируйте данные аналитики в CSV или PDF для отчётности.' },
  },
  {
    icon: '🔔',
    en: { title: 'Alerts', desc: 'Set thresholds for conversion drops. Get notified when a step falls below target.' },
    ru: { title: 'Оповещения', desc: 'Устанавливайте пороги снижения конверсии. Получайте уведомления при падении ниже цели.' },
  },
];

export default function AnalyticsPage() {
  const { t, lang } = useAdminLang();

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>
            {t('nav_analytics')}
          </h1>
          <span style={{
            padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 800,
            background: 'rgba(255,149,64,0.15)', color: C.orangeHot,
            fontFamily: "'Geist Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            {t('coming_soon')}
          </span>
        </div>
        <p style={{ fontSize: 14, color: C.inkMute, marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
          {lang === 'en'
            ? 'Full funnel tracking from first visit to paid upgrade. Understand where users drop off and optimize every step.'
            : 'Полное отслеживание воронки от первого визита до оплаченного апгрейда. Находите точки оттока и оптимизируйте каждый шаг.'}
        </p>
      </div>

      {/* Funnel preview */}
      <div style={{ background: 'white', borderRadius: 18, padding: '24px 28px', border: `1.5px solid ${C.line}`, marginBottom: 24, opacity: 0.55 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 20 }}>
          {lang === 'en' ? 'Conversion Funnel' : 'Воронка конверсии'}
        </div>
        {FUNNEL.map((step) => (
          <div key={step.en} style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: C.inkSoft, fontWeight: 500 }}>{lang === 'en' ? step.en : step.ru}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.ink, fontFamily: "'Geist Mono', monospace" }}>{step.pct}%</span>
            </div>
            <div style={{ height: 8, background: C.bone, borderRadius: 100 }}>
              <div style={{ height: '100%', width: `${step.pct}%`, background: step.color, borderRadius: 100 }}/>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {FEATURES.map((f) => {
          const content = lang === 'en' ? f.en : f.ru;
          return (
            <div key={f.en.title} style={{ background: 'white', borderRadius: 18, padding: '22px 22px', border: `1.5px solid ${C.line}`, opacity: 0.6 }}>
              <div style={{ fontSize: 24, marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 8 }}>{content.title}</div>
              <div style={{ fontSize: 13, color: C.inkSoft, lineHeight: 1.6 }}>{content.desc}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
