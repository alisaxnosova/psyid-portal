'use client';

import { useAdminLang } from '@/lib/adminLang';

const C = { ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8', line: '#E5DED2', bone: '#F6F1EA', orangeHot: '#FF9540', blue: '#2244E0' };

const FEATURES = [
  {
    icon: '💰',
    en: { title: 'Revenue Tracking', desc: 'Real-time revenue dashboard — total, monthly, and by product tier.' },
    ru: { title: 'Отслеживание выручки', desc: 'Дашборд выручки в реальном времени — суммарно, по месяцам и по тарифным планам.' },
  },
  {
    icon: '↩️',
    en: { title: 'Refunds', desc: 'Log and track refund requests. See refund rate and impact on monthly net revenue.' },
    ru: { title: 'Возвраты', desc: 'Фиксируйте и отслеживайте запросы на возврат. Просматривайте процент возвратов и их влияние на чистую выручку.' },
  },
  {
    icon: '🏢',
    en: { title: 'Third-Party Imports', desc: 'Track revenue from B2B partners and resellers. Reconcile against access code usage.' },
    ru: { title: 'Импорт от партнёров', desc: 'Отслеживайте выручку от B2B-партнёров и реселлеров. Сверяйте с использованием кодов доступа.' },
  },
  {
    icon: '🛒',
    en: { title: 'Direct Website Sales', desc: 'Track upgrades purchased on psyid.com — by tier, by date, by user segment.' },
    ru: { title: 'Прямые продажи с сайта', desc: 'Отслеживайте апгрейды, купленные на psyid.com — по тарифу, дате и сегменту пользователей.' },
  },
  {
    icon: '📆',
    en: { title: 'Monthly Reports', desc: 'Downloadable monthly P&L summaries. Export to CSV or PDF.' },
    ru: { title: 'Ежемесячные отчёты', desc: 'Загружаемые ежемесячные сводки доходов и расходов. Экспорт в CSV или PDF.' },
  },
  {
    icon: '📊',
    en: { title: 'Financial Analytics', desc: 'Charts for revenue trends, average order value, and LTV by cohort.' },
    ru: { title: 'Финансовая аналитика', desc: 'Графики трендов выручки, среднего чека и LTV по когортам.' },
  },
];

const MOCK_STATS = [
  { en: 'Total Revenue', ru: 'Общая выручка', value: '$—' },
  { en: 'This Month', ru: 'Этот месяц', value: '$—' },
  { en: 'Refunds', ru: 'Возвраты', value: '$—' },
  { en: 'Net Revenue', ru: 'Чистая выручка', value: '$—' },
];

export default function BillingPage() {
  const { t, lang } = useAdminLang();

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>
            {t('nav_billing')}
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
            ? 'Revenue tracking, refunds, third-party imports, and direct website sales. Monthly reports and financial analytics.'
            : 'Отслеживание выручки, возвратов, сторонних импортов и прямых продаж. Ежемесячные отчёты и финансовая аналитика.'}
        </p>
      </div>

      {/* Mock stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24, opacity: 0.4 }}>
        {MOCK_STATS.map(s => (
          <div key={s.en} style={{ background: 'white', borderRadius: 18, padding: '20px 22px', border: `1.5px solid ${C.line}` }}>
            <div style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700, color: C.inkMute, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.10em' }}>
              {lang === 'en' ? s.en : s.ru}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em' }}>{s.value}</div>
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
