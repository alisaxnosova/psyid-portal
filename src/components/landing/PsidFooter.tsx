'use client';

import Link from 'next/link';
import { useSiteLang } from '@/lib/siteLang';
import { Mark } from '@/components/shared/Mark';
import { LocaleToggle } from '@/components/shared/LocaleToggle';

export function PsidFooter() {
  const { t } = useSiteLang();
  return (
    <footer style={{ position: 'relative', zIndex: 2, borderTop: '1px solid var(--space-brd)', color: 'var(--space-fg)' }}>
      <div className="wrap" style={{ paddingTop: 64, paddingBottom: 44 }}>
        {/* brand hugs the left edge, the link columns hug the right — fills the band edge-to-edge */}
        <div className="psid-foot-top" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '40px 64px' }}>
          <div style={{ maxWidth: 340, minWidth: 240 }}>
            <Mark tone="dark" size="md" />
            <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, color: 'var(--space-fg-m)' }}>
              {t('foot_promise')}
            </p>
            <div style={{ marginTop: 20 }}><LocaleToggle tone="dark" /></div>
          </div>

          <div className="psid-foot-cols" style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(48px, 7vw, 104px)' }}>
            <FootCol title={t('foot_col_product')} links={[
              { href: '/reno', label: t('nav_cta') },
              { href: '/portal', label: t('foot_link_galaxy') },
              { href: '/professions', label: t('foot_link_directions') },
            ]} />
            <FootCol title={t('foot_col_science')} links={[
              { href: '/methodology', label: t('foot_link_method') },
              { href: '/professions', label: t('foot_link_match') },
              { href: '/sources', label: t('foot_link_sources') },
            ]} />
            <FootCol title={t('foot_col_contact')} links={[
              { href: 'mailto:hello@psyid.me', label: t('foot_link_email') },
              { href: '/admin/login', label: t('foot_admin') },
            ]} />
          </div>
        </div>

        <div style={{
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--space-brd)',
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--space-fg-m)',
        }}>
          <span>{t('foot_copy')}</span>
          <span>psyid.me</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 720px){
          .psid-foot-top{ gap: 36px !important; }
          .psid-foot-cols{ gap: 40px 48px !important; }
        }
      `}</style>
    </footer>
  );
}

function FootCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div style={{ minWidth: 120 }}>
      <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--space-fg-m)', margin: '0 0 14px' }}>{title}</h4>
      {links.map((l) => (
        <Link key={l.href + l.label} href={l.href} style={{ display: 'block', fontSize: 14, marginBottom: 10, color: 'var(--space-fg-s)' }}>{l.label}</Link>
      ))}
    </div>
  );
}
