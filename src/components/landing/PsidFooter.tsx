'use client';

import Link from 'next/link';
import { useSiteLang } from '@/lib/siteLang';
import { Mark } from '@/components/shared/Mark';
import { LocaleToggle } from '@/components/shared/LocaleToggle';

export function PsidFooter() {
  const { t } = useSiteLang();
  return (
    <footer style={{ position: 'relative', zIndex: 2, borderTop: '1px solid var(--space-brd)', color: 'var(--space-fg)' }}>
      <div className="wrap" style={{ padding: '56px 0 40px' }}>
        <div className="psid-foot-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: 36 }}>
          <div>
            <Mark tone="dark" size="md" />
            <p style={{ marginTop: 14, fontSize: 13.5, lineHeight: 1.6, color: 'var(--space-fg-m)', maxWidth: '32ch' }}>
              {t('foot_promise')}
            </p>
            <div style={{ marginTop: 18 }}><LocaleToggle tone="dark" /></div>
          </div>

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

        <div style={{
          display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
          marginTop: 44, paddingTop: 22, borderTop: '1px solid var(--space-brd)',
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--space-fg-m)',
        }}>
          <span>{t('foot_copy')}</span>
          <span>{t('foot_promise')}</span>
        </div>
      </div>

      <style>{`@media (max-width: 900px){ .psid-foot-grid{ grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 560px){ .psid-foot-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </footer>
  );
}

function FootCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--space-fg-m)', margin: '0 0 14px' }}>{title}</h4>
      {links.map((l) => (
        <Link key={l.href + l.label} href={l.href} style={{ display: 'block', fontSize: 14, marginBottom: 9, color: 'var(--space-fg-s)' }}>{l.label}</Link>
      ))}
    </div>
  );
}
