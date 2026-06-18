'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminLogout } from '@/lib/adminApi';

const NAV = [
  { href: '/admin', label: 'Dashboard', exact: true },
  { href: '/admin/users', label: 'Пользователи' },
  { href: '/admin/results', label: 'Результаты тестов' },
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
  if (type === 'users') return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="6" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M1 13c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M11 7.5c1.5 0 3 1 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="12" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

const icons = ['dashboard', 'users', 'results'];

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f5f7' }}>
      <aside style={{
        width: 220, flexShrink: 0,
        background: '#1a1a2e', color: 'white',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        <div style={{ padding: '24px 20px 20px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 4 }}>
            PsyID
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>Admin Panel</div>
        </div>

        <div style={{ width: '100%', height: 1, background: 'rgba(255,255,255,0.08)' }} />

        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', padding: '0 8px 10px', textTransform: 'uppercase' }}>
            Навигация
          </div>
          {NAV.map((item, i) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 8, marginBottom: 2,
                background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                color: isActive ? 'white' : 'rgba(255,255,255,0.55)',
                fontWeight: isActive ? 600 : 400, fontSize: 13,
              }}>
                <NavIcon type={icons[i] ?? 'results'} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/" style={{
            display: 'block', padding: '9px 10px', borderRadius: 8, marginBottom: 4,
            color: 'rgba(255,255,255,0.4)', fontSize: 13,
          }}>
            ← Вернуться на сайт
          </Link>
          <button onClick={adminLogout} style={{
            width: '100%', padding: '9px 10px', borderRadius: 8,
            background: 'transparent', color: 'rgba(255,255,255,0.4)',
            fontSize: 13, cursor: 'pointer', border: 'none', textAlign: 'left',
          }}>
            Выйти
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0, padding: 32 }}>
        {children}
      </div>
    </div>
  );
}
