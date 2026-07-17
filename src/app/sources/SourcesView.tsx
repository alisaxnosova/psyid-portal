'use client';

import Link from 'next/link';
import { useSiteLang } from '@/lib/siteLang';
import { PsidNav } from '@/components/landing/PsidNav';
import { PsidFooter } from '@/components/landing/PsidFooter';
import { Starfield } from '@/components/galaxy';
import { ConstellationGlyph } from '@/components/shared/Mark';

type Bi = { en: string; ru?: string };

// Bibliographic citations are language-neutral (author + published title); only the
// group headers and framing are translated.
const GROUPS: { head: Bi; sub: Bi; refs: string[] }[] = [
  {
    head: { en: 'The hierarchy of traits' },
    sub: { en: 'Why an axis opens into planets and moons' },
    refs: [
      'Goldberg, L. R. — The structure of phenotypic personality traits. American Psychologist, 48.',
      'Costa, P. T., Jr., & McCrae, R. R. — Domains and facets: Hierarchical personality assessment using the Revised NEO-PI. Journal of Personality Assessment, 64.',
      'DeYoung, C. G., Quilty, L. C., & Peterson, J. B. — Between facets and domains: 10 aspects of the Big Five. JPSP, 93.',
      'Mõttus, R., et al. — Personality traits below facets: validity, stability, heritability and utility of personality nuances. JPSP, 112.',
      'Condon, D. M., et al. — Bottom-up construction of a personality taxonomy. European Journal of Psychological Assessment, 36.',
    ],
  },
  {
    head: { en: 'Context and lenses' },
    sub: { en: 'Why the same trait shifts at work and in relationships' },
    refs: [
      'Schmit, M. J., et al. — Frame-of-reference effects on personality scale scores and criterion-related validity. JAP, 80.',
      'Lievens, F., De Corte, W., & Schollaert, E. — A closer look at the frame-of-reference effect. JAP, 93.',
      'Shaffer, J. A., & Postlethwaite, B. E. — A matter of context: contextualized vs. noncontextualized personality measures. Personnel Psychology, 65.',
      'Tett, R. P., & Burnett, D. D. — A personality trait-based interactionist model of job performance. JAP, 88.',
      'Fleeson, W. — Traits as density distributions of states. JPSP, 80. · Fleeson, W., & Jayawickreme, E. — Whole Trait Theory. JRP, 56.',
      'Mischel, W., & Shoda, Y. — A cognitive-affective system theory of personality. Psychological Review, 102.',
    ],
  },
  {
    head: { en: 'Stability and change' },
    sub: { en: 'Why a new layer of light means something' },
    refs: [
      'Roberts, B. W., & DelVecchio, W. F. — The rank-order consistency of personality traits from childhood to old age. Psychological Bulletin, 126.',
    ],
  },
  {
    head: { en: 'Origins of the typology' },
    sub: { en: 'Where the idea of axes grew from — and what we did not take' },
    refs: [
      'Jung, C. G. — Psychological Types.',
      'Lawrence, G. — People Types and Tiger Stripes (3rd ed.). CAPT.',
    ],
  },
  {
    head: { en: 'Motivation and meaning' },
    sub: { en: 'Why the result is support, not a verdict' },
    refs: [
      'Deci, E. L., & Ryan, R. M. — The "what" and "why" of goal pursuits. Psychological Inquiry, 11.',
    ],
  },
  {
    head: { en: 'Professions, behaviour, energy' },
    sub: { en: 'The applied layer: directions and burnout' },
    refs: [
      'Holland, J. L. — Making Vocational Choices (3rd ed.). PAR.',
      'Marston, W. M. — Emotions of Normal People. (Basis of the DISC tradition behind the behaviour-style lens.)',
      'Demerouti, E., et al. — The Job Demands–Resources model of burnout. JAP, 86.',
      'Hobfoll, S. E. — Conservation of resources: a new attempt at conceptualizing stress. American Psychologist, 44.',
    ],
  },
  {
    head: { en: 'The Russian career-guidance school' },
    sub: { en: 'Localizing the direction matching' },
    refs: [
      'Klimov, E. A. — works on the psychology of professional self-determination.',
      'Pryazhnikov, N. S. — works on professional and personal self-determination.',
      'Leontiev, D. A. — works on the psychology of meaning and personal potential.',
    ],
  },
  {
    head: { en: 'How the scales are built' },
    sub: { en: 'The discipline of instrument development' },
    refs: [
      'DeVellis, R. F. — Scale Development: Theory and Applications (4th ed.). SAGE.',
    ],
  },
];

export default function SourcesView() {
  const { lang, t } = useSiteLang();
  const L = (b: Bi) => b[lang];

  return (
    <div className="usite">
      <header className="surface-deep" style={{ position: 'relative', overflow: 'hidden' }}>
        <Starfield count={80} />
        <PsidNav />
        <div className="wrap" style={{ position: 'relative', zIndex: 5, padding: '132px 0 clamp(56px,8vw,96px)' }}>
          <div style={{ marginBottom: 26 }}><ConstellationGlyph size={76} tone="dark" /></div>
          <div className="eyebrow dash" style={{ marginBottom: 18 }}>{L({ en: 'Sources' })}</div>
          <h1 className="h-hero" style={{ maxWidth: '14ch' }}>{L({ en: 'What all of this is built on' })}</h1>
          <p className="lead" style={{ marginTop: 22 }}>{L({ en: 'Everything that shines in your universe was measured. And what we measure with rests on open science. Here are the works the ReNo method stands on.' })}</p>
        </div>
      </header>

      <main className="surface-paper">
        <section className="section"><div className="wrap wrap-narrow">
          <div style={{ background: 'var(--paper-2)', borderLeft: '3px solid var(--orange)', borderRadius: '0 var(--r-md) var(--r-md) 0', padding: '24px 26px', marginBottom: 48 }}>
            <div className="eyebrow" style={{ color: 'var(--ink-mute)', marginBottom: 10 }}>{L({ en: 'The rule of the stack' })}</div>
            <p style={{ fontSize: 15.5, color: 'var(--ink-soft)', lineHeight: 1.65 }}>{L({ en: 'Every promise on the site traces to a construct in the method, and every construct to a published study. Beauty on the surface, rigor one tap deep.' })}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {GROUPS.map((g, gi) => (
              <div key={gi}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 21, letterSpacing: '-.02em', color: 'var(--ink)' }}>{L(g.head)}</h2>
                <div style={{ fontSize: 13.5, color: 'var(--ink-mute)', marginTop: 3, marginBottom: 16 }}>{L(g.sub)}</div>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {g.refs.map((r, ri) => (
                    <li key={ri} style={{ fontSize: 14.5, color: 'var(--ink-soft)', lineHeight: 1.55, paddingLeft: 18, borderLeft: '2px solid var(--line)' }}>{r}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, display: 'grid', gap: 16 }}>
            <div className="pcard" style={{ padding: '20px 24px' }}>
              <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{L({ en: 'This is not a clinical instrument' })}</div>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{L({ en: 'ReNo describes the normal personality and does not replace a consultation with a specialist. This list explains the approach; it does not diagnose.' })}</p>
            </div>
            <div className="pcard" style={{ padding: '20px 24px' }}>
              <div style={{ fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{L({ en: 'Validation is ongoing' })}</div>
              <p style={{ fontSize: 14, color: 'var(--ink-soft)', lineHeight: 1.6 }}>{L({ en: 'The instrument is checked against reference measures within a validation program. Current status lives in the open changelog.' })}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 34 }}>
            <Link className="btn btn-ink" href="/methodology">{L({ en: 'To the methodology' })} <span className="ar">→</span></Link>
            <Link className="btn btn-outline" href="/reno">{t('nav_cta')}</Link>
          </div>
        </div></section>
      </main>

      <PsidFooter />
    </div>
  );
}
