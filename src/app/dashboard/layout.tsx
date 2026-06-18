'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, logout } from '@/lib/useAuth';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Главная', exact: true },
  { href: '/dashboard/profile', label: 'Профиль' },
  { href: '/dashboard/professions', label: 'Профессии' },
  { href: '/dashboard/library', label: 'Библиотека', locked: true },
  { href: '/dashboard/roadmap', label: 'Дорожная карта', locked: true },
  { href: '/dashboard/consultations', label: 'Консультации', locked: true, soon: true },
  { href: '/dashboard/history', label: 'История' },
];

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0, opacity: 0.45 }}>
      <rect x="2" y="5.5" width="9" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      <path d="M4 5.5V4a2.5 2.5 0 0 1 5 0v1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const displayName = user?.firstName ?? user?.email?.split('@')[0] ?? 'Пользователь';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F6F1EA', fontFamily: "'Geist', 'Onest', system-ui, sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: 252, flexShrink: 0,
        background: 'linear-gradient(180deg, #050C2E 0%, #0B1A56 100%)',
        color: 'white',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>

        {/* Brand */}
        <div style={{ padding: '24px 20px 20px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 32, height: 32, borderRadius: 10, background: 'white',
              position: 'relative', flexShrink: 0, overflow: 'hidden', display: 'inline-block',
            }}>
              <span style={{ position: 'absolute', left: 5, top: 5, width: 9, height: 9, borderRadius: '50%', background: '#2244E0' }}/>
              <span style={{ position: 'absolute', right: 5, bottom: 5, width: 9, height: 9, borderRadius: 3, background: '#FF9540' }}/>
            </span>
            <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.03em', color: '#fff' }}>
              Psy<span style={{ color: '#FF9540' }}>ID</span>
            </span>
          </Link>
          <div style={{ marginTop: 10, fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace" }}>
            Личный кабинет
          </div>
        </div>

        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.08)' }}/>

        {/* User chip */}
        <div style={{ margin: '14px 12px', padding: '12px 14px', background: 'rgba(255,255,255,0.06)', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #FF9540 0%, #E6337C 100%)',
            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700,
          }}>{initial}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.9)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 1 }}>Бесплатный план</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '4px 12px', flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.28)', padding: '0 8px 10px', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace" }}>
            Навигация
          </div>
          {NAV_ITEMS.map(item => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <div key={item.href}>
                {item.locked ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '8px 10px', borderRadius: 10, marginBottom: 1,
                    color: 'rgba(255,255,255,0.28)', cursor: 'default',
                    fontSize: 13, userSelect: 'none',
                    borderLeft: '2px solid transparent',
                  }}>
                    <LockIcon />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {item.soon && (
                      <span style={{
                        fontSize: 8, fontWeight: 800, padding: '2px 5px', borderRadius: 4,
                        background: 'rgba(255,149,64,0.15)', color: 'rgba(255,149,64,0.6)',
                        fontFamily: "'Geist Mono', monospace", letterSpacing: '0.06em',
                      }}>SOON</span>
                    )}
                  </div>
                ) : (
                  <Link href={item.href} style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '8px 10px', borderRadius: 10, marginBottom: 1,
                    background: isActive ? 'rgba(255,149,64,0.18)' : 'transparent',
                    color: isActive ? '#FF9540' : 'rgba(255,255,255,0.52)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 13,
                    borderLeft: isActive ? '2px solid #FF9540' : '2px solid transparent',
                    transition: 'all .15s',
                  }}>
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '12px 12px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/start" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 10px', borderRadius: 10, marginBottom: 4,
            color: 'rgba(255,255,255,0.35)', fontSize: 13, transition: 'color .15s',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M5.5 7h3M7 5.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            Пройти тест заново
          </Link>
          <button onClick={logout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 10px', borderRadius: 10, background: 'transparent',
            color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer',
            border: 'none', textAlign: 'left', fontFamily: 'inherit', transition: 'color .15s',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 7h7M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Выйти из аккаунта
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
