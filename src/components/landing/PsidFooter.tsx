'use client';

import Link from 'next/link';
import { useSiteLang } from '@/lib/siteLang';
import { Mark } from '@/components/shared/Mark';

export function PsidFooter() {
  const { t } = useSiteLang();
  return (
    <footer style={{ position: 'relative', zIndex: 2, borderTop: '1px solid var(--space-brd)', color: 'var(--space-fg)' }}>
      <div style={{ padding: '64px clamp(24px,4vw,72px) 44px', maxWidth: 1720, margin: '0 auto' }}>
        {/* brand hugs the left edge, the link columns hug the right — fills the band edge-to-edge */}
        <div className="psid-foot-top" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '40px 64px' }}>
          <div style={{ maxWidth: 360, minWidth: 260 }}>
            <Mark tone="dark" size={76} />
            <p style={{ marginTop: 20, fontSize: 14.5, lineHeight: 1.6, color: 'var(--space-fg-m)' }}>
              {t('foot_promise')}
            </p>
            <Link className="btn btn-orange" href="/login" style={{ marginTop: 22 }}>
              {t('foot_cta')} <span style={{ marginLeft: 2 }}>→</span>
            </Link>
            <p style={{ marginTop: 12, fontSize: 13, lineHeight: 1.5, color: 'var(--space-fg-m)' }}>
              {t('foot_cta_sub')}{' '}
              <Link href="/register" style={{ color: 'var(--orange)', fontWeight: 600 }}>{t('foot_cta_sub_link')}</Link>
            </p>
          </div>

          <div className="psid-foot-cols" style={{ display: 'flex', flexWrap: 'wrap', gap: 'clamp(48px, 7vw, 104px)' }}>
            <FootCol title={t('foot_col_product')} links={[
              { href: '/register', label: t('nav_cta') },
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
            <div style={{ minWidth: 120 }}>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--space-fg-m)', margin: '0 0 14px' }}>{t('foot_col_youth')}</h4>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--space-fg-s)' }}>
                {t('foot_youth_line')}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--space-fg-m)', border: '1px solid var(--space-brd)', borderRadius: 999, padding: '2px 7px' }}>{t('foot_soon')}</span>
              </span>
            </div>
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
