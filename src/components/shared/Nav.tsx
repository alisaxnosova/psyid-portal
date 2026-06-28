'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';
import { useAuth, logout } from '@/lib/useAuth';

export function Nav() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const isHome = pathname === '/';

  if (pathname === '/' || pathname.startsWith('/dashboard') || pathname.startsWith('/start') || pathname.startsWith('/reno') || pathname.startsWith('/admin')) return null;

  return (
    <>
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(18px)',
        borderBottom: '1px solid var(--line)',
        padding: '0 48px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <Link href="/"><Logo /></Link>

        {isHome && (
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { href: '#methodology', label: 'Как работает' },
              { href: '#programs', label: 'Программы' },
              { href: '#reviews', label: 'Отзывы' },
            ].map(item => (
              <a key={item.href} href={item.href} style={{
                padding: '8px 14px', borderRadius: 100,
                fontSize: 14, fontWeight: 500, color: 'var(--ink-2)',
                transition: 'all .2s', display: 'inline-block',
              }}>{item.label}</a>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/admin" title="Admin" style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: '50%',
            color: 'var(--ink-3)', border: '1.5px solid var(--line)',
            background: 'white', flexShrink: 0,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5 2.5a2.5 2.5 0 0 0-3.45 2.3l-6.3 6.3a2.5 2.5 0 1 0 1.15 1.15l6.3-6.3A2.5 2.5 0 0 0 13.5 2.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
          {!loading && !user && (
            <>
              <Link href="/login" style={{
                padding: '9px 18px', fontSize: 14, fontWeight: 500,
                color: 'var(--ink-2)', borderRadius: 100,
              }}>Войти</Link>
              <Link href="/test" className="btn-primary" style={{ padding: '10px 20px', fontSize: 14 }}>
                Пройти тест бесплатно
              </Link>
            </>
          )}
          {!loading && user && (
            <>
              <Link href="/dashboard" style={{
                padding: '9px 18px', fontSize: 14, fontWeight: 500,
                color: 'var(--ink-2)',
              }}>Личный кабинет</Link>
              <button onClick={logout} style={{
                padding: '9px 18px', fontSize: 14, fontWeight: 500,
                color: 'var(--ink-3)', borderRadius: 100,
                border: '1.5px solid var(--line)', background: 'white',
                cursor: 'pointer',
              }}>Выйти</button>
            </>
          )}
        </div>
      </div>

      {isHome && (
        <div style={{
          background: 'var(--bg-2)', padding: '9px 48px',
          fontSize: 13, fontWeight: 500, color: 'var(--ink-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          borderBottom: '1px solid var(--line)',
        }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5ED4E8', display: 'inline-block' }} />
          Бесплатный тест доступен прямо сейчас -{' '}
          <Link href="/test" style={{ color: 'var(--violet)', fontWeight: 600 }}>
            пройти за 15 минут →
          </Link>
        </div>
      )}
    </>
  );
}
