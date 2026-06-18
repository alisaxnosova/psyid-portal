'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { adminLogout } from '@/lib/adminApi';

const NAV = [
  { href: '/admin',           label: 'Dashboard',         exact: true },
  { href: '/admin/users',     label: 'Пользователи'                   },
  { href: '/admin/results',   label: 'Результаты'                     },
  { href: '/admin/questions', label: 'Вопросы'                        },
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
  if (type === 'questions') return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 5.5c-1.1 0-2 .9-2 2 0 .8.5 1.5 1.2 1.8L8 9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="8" cy="11.5" r=".75" fill="currentColor"/>
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="1.5" y="3" width="13" height="10" rx="2" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

const icons = ['dashboard', 'users', 'results', 'questions'];

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F6F1EA', fontFamily: "'Geist', 'Onest', system-ui, sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 232, flexShrink: 0,
        background: 'linear-gradient(180deg, #050C2E 0%, #0B1A56 100%)',
        color: 'white', display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Brand */}
        <div style={{ padding: '24px 20px 22px' }}>
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
        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.28)', padding: '0 8px 10px', textTransform: 'uppercase', fontFamily: "'Geist Mono', monospace" }}>
            Навигация
          </div>
          {NAV.map((item, i) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 10, marginBottom: 2,
                background: active ? 'rgba(255,149,64,0.18)' : 'transparent',
                color: active ? '#FF9540' : 'rgba(255,255,255,0.52)',
                fontWeight: active ? 600 : 400, fontSize: 13,
                borderLeft: active ? '2px solid #FF9540' : '2px solid transparent',
                transition: 'all .15s',
              }}>
                <NavIcon type={icons[i] ?? 'results'}/>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer links */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 10px', borderRadius: 10, marginBottom: 4,
            color: 'rgba(255,255,255,0.35)', fontSize: 13, transition: 'color .15s',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            На сайт
          </Link>
          <button onClick={adminLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 10px', borderRadius: 10, background: 'transparent',
            color: 'rgba(255,255,255,0.35)', fontSize: 13, cursor: 'pointer',
            border: 'none', textAlign: 'left', fontFamily: 'inherit', transition: 'color .15s',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 7h7M9 4l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 2H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            Выйти
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
