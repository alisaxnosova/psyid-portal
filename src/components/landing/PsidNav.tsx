'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { useSiteLang } from '@/lib/siteLang';
import { Mark } from '@/components/shared/Mark';
import { LocaleToggle } from '@/components/shared/LocaleToggle';

const LINKS = [
  { href: '/', key: 'nav_home' },
  { href: '/methodology', key: 'nav_method' },
  { href: '/professions', key: 'nav_prof' },
  { href: '/sources', key: 'nav_sources' },
];

export function PsidNav() {
  const { isLoggedIn } = useAuth();
  const { t } = useSiteLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 30 }}>
      <div className="wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 78 }}>
        <Link href="/" aria-label="PsyID"><Mark tone="dark" size="md" /></Link>

        {/* desktop links */}
        <div className="psid-nav-links" style={{ display: 'flex', gap: 6 }}>
          {LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link key={l.href} href={l.href} style={{
                fontSize: 14, fontWeight: 500, padding: '8px 13px', borderRadius: 'var(--r-full)',
                color: active ? '#fff' : 'var(--space-fg-s)', transition: 'color .16s, background .16s',
              }}>{t(l.key)}</Link>
            );
          })}
        </div>

        <div className="psid-nav-right" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <LocaleToggle tone="dark" />
          <Link href={isLoggedIn ? '/portal' : '/login'} style={{ fontSize: 14, fontWeight: 500, color: 'var(--space-fg-s)' }}>
            {isLoggedIn ? t('nav_portal') : t('nav_login')}
          </Link>
          <Link className="btn btn-orange sm" href="/reno">{t('nav_cta')} →</Link>
        </div>

        {/* mobile toggle */}
        <button
          className="psid-nav-burger"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          style={{
            display: 'none', width: 42, height: 42, borderRadius: 'var(--r-full)',
            border: '1px solid var(--space-brd)', background: 'var(--space-panel)', color: '#fff',
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            {open
              ? <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              : <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
          </svg>
        </button>
      </div>

      {/* mobile drawer */}
      {open && (
        <div className="psid-nav-drawer" style={{
          margin: '0 20px', padding: 16, borderRadius: 'var(--r-lg)',
          background: 'rgba(8,12,34,.92)', border: '1px solid var(--space-brd)', backdropFilter: 'blur(16px)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} style={{ padding: '11px 12px', borderRadius: 'var(--r-sm)', color: 'var(--space-fg)', fontSize: 16, fontWeight: 500 }}>
              {t(l.key)}
            </Link>
          ))}
          <div style={{ height: 1, background: 'var(--space-brd)', margin: '6px 0' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 12px 8px' }}>
            <Link href={isLoggedIn ? '/portal' : '/login'} onClick={() => setOpen(false)} style={{ color: 'var(--space-fg-s)', fontSize: 15, fontWeight: 500 }}>
              {isLoggedIn ? t('nav_portal') : t('nav_login')}
            </Link>
            <LocaleToggle tone="dark" />
          </div>
          <Link className="btn btn-orange" href="/reno" onClick={() => setOpen(false)} style={{ justifyContent: 'center', margin: '4px 8px 4px' }}>
            {t('nav_cta')} →
          </Link>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .psid-nav-links, .psid-nav-right { display: none !important; }
          .psid-nav-burger { display: inline-flex !important; }
        }
      `}</style>
    </nav>
  );
}
