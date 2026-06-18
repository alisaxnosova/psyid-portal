'use client';

import { useAdminLang } from '@/lib/adminLang';

const C = { ink: '#0E1230', inkSoft: '#4F5470', inkMute: '#8A8FA8', line: '#E5DED2', bone: '#F6F1EA', orangeHot: '#FF9540' };

const FEATURES = [
  {
    icon: '🔍',
    en: { title: 'Track by Order ID', desc: 'Look up any third-party order by its unique ID. See full order history and status.' },
    ru: { title: 'Поиск по ID заказа', desc: 'Найдите любой сторонний заказ по уникальному ID. Просматривайте историю и статус заказа.' },
  },
  {
    icon: '🔑',
    en: { title: 'Access Codes', desc: 'View, generate, and invalidate single-use or multi-use access codes tied to each order.' },
    ru: { title: 'Коды доступа', desc: 'Просматривайте, генерируйте и аннулируйте одноразовые или многоразовые коды доступа для каждого заказа.' },
  },
  {
    icon: '📊',
    en: { title: 'Order Status', desc: 'Track status: Pending, Active, Completed, Expired. Filter and export by date range.' },
    ru: { title: 'Статус заказа', desc: 'Отслеживайте статус: Ожидает, Активен, Завершён, Истёк. Фильтрация и экспорт по периоду.' },
  },
  {
    icon: '🏢',
    en: { title: 'B2B Client Management', desc: 'Assign orders to business clients. Track volume, usage rate, and renewal dates.' },
    ru: { title: 'Управление B2B-клиентами', desc: 'Привязывайте заказы к бизнес-клиентам. Отслеживайте объём, использование и даты продления.' },
  },
  {
    icon: '⚡',
    en: { title: 'Bulk Code Generation', desc: 'Generate batches of access codes for large orders. Set expiration and usage limits.' },
    ru: { title: 'Массовая генерация кодов', desc: 'Генерируйте пакеты кодов доступа для крупных заказов. Устанавливайте срок действия и лимиты использования.' },
  },
  {
    icon: '📋',
    en: { title: 'Instruction PDF', desc: 'Auto-generate a templated PDF with access code and test instructions for each order.' },
    ru: { title: 'PDF с инструкцией', desc: 'Автоматически создавайте PDF с кодом доступа и инструкциями по тесту для каждого заказа.' },
  },
];

const EXAMPLE = [
  { order: '12345', code: 'ABC123', status: 'Completed' },
  { order: '12346', code: 'DEF456', status: 'Active' },
  { order: '12347', code: 'GHI789', status: 'Pending' },
];

export default function OrdersPage() {
  const { t, lang } = useAdminLang();

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.ink, letterSpacing: '-0.03em', margin: 0 }}>
            {t('nav_orders')}
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
            ? 'Track third-party orders by order ID, access code, and status. Manage B2B clients and bulk test purchases.'
            : 'Отслеживайте сторонние заказы по ID заказа, коду доступа и статусу. Управляйте B2B-клиентами и оптовыми заказами.'}
        </p>
      </div>

      {/* Preview table */}
      <div style={{ background: 'white', borderRadius: 18, border: `1.5px solid ${C.line}`, overflow: 'hidden', marginBottom: 24, opacity: 0.5 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '12px 20px', background: C.bone, borderBottom: `1px solid ${C.line}`, fontFamily: "'Geist Mono', monospace", fontSize: 10, fontWeight: 700, color: C.inkMute, textTransform: 'uppercase', letterSpacing: '0.10em' }}>
          <div>{lang === 'en' ? 'Order ID' : 'ID заказа'}</div>
          <div>{lang === 'en' ? 'Access Code' : 'Код доступа'}</div>
          <div>{lang === 'en' ? 'Status' : 'Статус'}</div>
        </div>
        {EXAMPLE.map((row, i) => (
          <div key={row.order} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '13px 20px', borderBottom: i < EXAMPLE.length - 1 ? `1px solid ${C.bone}` : 'none', alignItems: 'center' }}>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, fontWeight: 700, color: C.ink }}>{row.order}</span>
            <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 13, color: C.inkSoft }}>{row.code}</span>
            <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: row.status === 'Completed' ? 'rgba(255,149,64,0.12)' : row.status === 'Active' ? 'rgba(34,68,224,0.10)' : C.bone, color: row.status === 'Completed' ? C.orangeHot : row.status === 'Active' ? '#2244E0' : C.inkMute, display: 'inline-block' }}>{row.status}</span>
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
