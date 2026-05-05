'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/Logo';
import { useAuth, logout } from '@/lib/useAuth';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Главная', exact: true },
  { href: '/dashboard/profile', label: 'Профиль ребёнка' },
  { href: '/dashboard/professions', label: 'Профессии' },
  { href: '/dashboard/library', label: 'Библиотека', locked: true },
  { href: '/dashboard/roadmap', label: 'Дорожная карта', locked: true },
  { href: '/dashboard/consultations', label: 'Консультации', locked: true, tag: 'Скоро' },
  { href: '/dashboard/history', label: 'История' },
];

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
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
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-2)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 260, flexShrink: 0,
        background: 'white', borderRight: '1px solid var(--line)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 0' }}>
          <Link href="/" style={{ display: 'inline-block' }}>
            <Logo />
          </Link>
        </div>

        {/* User info */}
        <div style={{
          margin: '20px 12px', padding: '14px 16px',
          background: 'var(--bg-2)', borderRadius: 14,
          display: 'flex', gap: 10, alignItems: 'center',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--grad-cta)', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, flexShrink: 0,
          }}>{initial}</div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {displayName}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>Бесплатный план</div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '0 12px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--ink-3)', padding: '4px 10px 10px', textTransform: 'uppercase' }}>
            Личный кабинет
          </div>
          {NAV_ITEMS.map(item => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <div key={item.href}>
                {item.locked ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 10, marginBottom: 2,
                    color: 'var(--ink-3)', cursor: 'default', userSelect: 'none',
                  }}>
                    <LockIcon />
                    <span style={{ fontSize: 14, flex: 1 }}>{item.label}</span>
                    {item.tag && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                        background: 'var(--bg-3)', color: 'var(--ink-3)',
                        padding: '2px 6px', borderRadius: 100, textTransform: 'uppercase',
                      }}>{item.tag}</span>
                    )}
                  </div>
                ) : (
                  <Link href={item.href} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 12px', borderRadius: 10, marginBottom: 2,
                    background: isActive ? 'rgba(75, 30, 142, 0.08)' : 'transparent',
                    color: isActive ? 'var(--violet)' : 'var(--ink-2)',
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 14,
                    transition: 'background .15s, color .15s',
                  }}>
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 12px 20px', borderTop: '1px solid var(--line)', marginTop: 16 }}>
          <Link href="/test" style={{
            display: 'block', textAlign: 'center',
            padding: '9px 14px', borderRadius: 10, marginBottom: 8,
            background: 'var(--bg-2)', color: 'var(--ink-2)',
            fontSize: 13, fontWeight: 500,
          }}>
            Пройти тест заново
          </Link>
          <button onClick={logout} style={{
            width: '100%', padding: '9px 14px', borderRadius: 10,
            background: 'transparent', color: 'var(--ink-3)',
            fontSize: 13, cursor: 'pointer', border: 'none',
          }}>
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
