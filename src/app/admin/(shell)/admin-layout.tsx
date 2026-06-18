'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminLogout } from '@/lib/adminApi';
import { useAdminLang, TKey, AdminLang } from '@/lib/adminLang';

const NAV: { href: string; key: TKey; icon: string; exact?: boolean; built: boolean }[] = [
  { href: '/admin',                      key: 'nav_dashboard',    icon: 'dashboard', exact: true, built: true  },
  { href: '/admin/questions',            key: 'nav_assessments',  icon: 'questions',              built: true  },
  { href: '/admin/report-templates',     key: 'nav_report_tmpls', icon: 'report',                 built: false },
  { href: '/admin/users',                key: 'nav_users',        icon: 'users',                  built: false },
  { href: '/admin/results',              key: 'nav_results',      icon: 'results',                built: false },
  { href: '/admin/orders',               key: 'nav_orders',       icon: 'orders',                 built: false },
  { href: '/admin/billing',              key: 'nav_billing',      icon: 'billing',                built: false },
  { href: '/admin/analytics',            key: 'nav_analytics',    icon: 'analytics',              built: false },
  { href: '/admin/assessment-analytics', key: 'nav_assess_ana',   icon: 'chart',                  built: false },
];

function NavIcon({ type }: { type: string }) {
  if (type === 'dashboard') return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
  if (type === 'questions') return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 5.5c-1.1 0-2 .9-2 2 0 .8.5 1.5 1.2 1.8L8 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="8" cy="11.5" r=".75" fill="currentColor"/>
    </svg>
  );
  if (type === 'report') return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 1.5h6.5L13 5v9.5a1 1 0 01-1 1H3a1 1 0 01-1-1v-12a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M9.5 1.5V5H13" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M5 8h6M5 11h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
  if (type === 'users') return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1 13c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M11 7.5c1.5 0 3 1 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="12" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
  if (type === 'results') return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
  if (type === 'orders') return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1L1.5 4.5v7L8 15l6.5-3.5v-7L8 1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M1.5 4.5L8 8M8 8v7M14.5 4.5L8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M4.75 2.75L11.25 6.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
  if (type === 'billing') return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 4.5v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M6 6.5h2.5a1.5 1.5 0 010 3H7a1.5 1.5 0 000 3H9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
  if (type === 'analytics') return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="9" width="3" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="6.5" y="6" width="3" height="8.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="11.5" y="2" width="3" height="12.5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
  if (type === 'chart') return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <polyline points="1,12 5,7 9,9.5 13,3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <circle cx="1"  cy="12"  r="1.5" fill="currentColor"/>
      <circle cx="5"  cy="7"   r="1.5" fill="currentColor"/>
      <circle cx="9"  cy="9.5" r="1.5" fill="currentColor"/>
      <circle cx="13" cy="3"   r="1.5" fill="currentColor"/>
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t, lang, setLang } = useAdminLang();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F6F1EA', fontFamily: "'Geist', 'Onest', system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'linear-gradient(180deg, #050C2E 0%, #0B1A56 100%)',
        color: 'white', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Brand */}
        <div style={{ padding: '24px 20px 20px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 32, height: 32, borderRadius: 10, background: 'white', position: 'relative', flexShrink: 0, overflow: 'hidden', display: 'inline-block' }}>
              <span style={{ position: 'absolute', left: 5, top: 5, width: 9, height: 9, borderRadius: '50%', background: '#2244E0' }}/>
              <span style={{ position: 'absolute', right: 5, bottom: 5, width: 9, height: 9, borderRadius: 3, background: '#FF9540' }}/>
            </span>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: '#fff' }}>
              Psy<span style={{ color: '#FF9540' }}>ID</span>
            </span>
          </Link>
          <div style={{ marginTop: 10, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace" }}>
            Admin Panel
          </div>
        </div>

        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.08)' }}/>

        {/* Nav */}
        <nav style={{ padding: '14px 12px', flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.28)', padding: '0 8px 10px', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace" }}>
            {t('nav_section')}
          </div>
          {NAV.map((item) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 10px', borderRadius: 10, marginBottom: 1,
                background: active ? 'rgba(255,149,64,0.18)' : 'transparent',
                color: active ? '#FF9540' : item.built ? 'rgba(255,255,255,0.52)' : 'rgba(255,255,255,0.32)',
                fontWeight: active ? 600 : 400, fontSize: 13,
                borderLeft: active ? '2px solid #FF9540' : '2px solid transparent',
                transition: 'all .15s',
              }}>
                <NavIcon type={item.icon}/>
                <span style={{ flex: 1 }}>{t(item.key)}</span>
                {!item.built && (
                  <span style={{
                    fontSize: 8, fontWeight: 800, padding: '2px 5px', borderRadius: 4,
                    background: 'rgba(255,149,64,0.15)', color: 'rgba(255,149,64,0.7)',
                    fontFamily: "'Geist Mono', monospace", letterSpacing: '0.06em', flexShrink: 0,
                  }}>
                    SOON
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Language toggle */}
        <div style={{ padding: '12px 12px 0' }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.28)', padding: '0 8px 8px', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace" }}>
            Language
          </div>
          <div style={{ display: 'flex', gap: 4, padding: '0 0 12px' }}>
            {(['en', 'ru'] as AdminLang[]).map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                flex: 1, padding: '7px 0', borderRadius: 8, cursor: 'pointer', border: '1px solid',
                borderColor: lang === l ? 'rgba(255,149,64,0.5)' : 'rgba(255,255,255,0.1)',
                background: lang === l ? 'rgba(255,149,64,0.18)' : 'transparent',
                color: lang === l ? '#FF9540' : 'rgba(255,255,255,0.3)',
                fontSize: 11, fontWeight: 800,
                fontFamily: "'Geist Mono', monospace", letterSpacing: '0.06em',
                textTransform: 'uppercase', transition: 'all .15s',
              }}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Footer links */}
        <div style={{ padding: '12px 12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 10px', borderRadius: 10, marginBottom: 4,
            color: 'rgba(255,255,255,0.35)', fontSize: 13, transition: 'color .15s',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {t('nav_to_site')}
          </Link>
          <button onClick={adminLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 10px', borderRadius: 10, background: 'transparent',
            color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer',
            border: 'none', textAlign: 'left', fontFamily: 'inherit', transition: 'color .15s',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 7h7M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {t('nav_logout')}
          </button>
        </div>
      </aside>

      {/* ── Content ── */}
      <div style={{ flex: 1, minWidth: 0, padding: 32, overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
