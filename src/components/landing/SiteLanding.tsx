'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSiteLang } from '@/lib/siteLang';
import { PsidNav } from './PsidNav';
import { PsidFooter } from './PsidFooter';
import { DecorativeGalaxy, Starfield, AXES } from '@/components/galaxy';

/* ── Animated personality-code ticker (§ Твой код) ── */
const CODES = ['W2·A4·V3·F4·S2', 'O3·C4·L3·D4·R2', 'W3·A3·V4·F2·S3', 'O2·A5·L2·D3·R4'];
function CodeMorph() {
  const [i, setI] = useState(0);
  const [show, setShow] = useState(true);
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    const t = setInterval(() => {
      setShow(false);
      setTimeout(() => { setI((v) => (v + 1) % CODES.length); setShow(true); }, 450);
    }, 2600);
    return () => clearInterval(t);
  }, []);
  const segs = CODES[i].split('·');
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, opacity: show ? 1 : 0, transition: 'opacity .45s ease' }}>
      {segs.map((seg, k) => (
        <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 'clamp(26px,4vw,40px)', letterSpacing: '.02em', color: AXES[k].hue }}>{seg}</span>
          {k < segs.length - 1 && <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--space-fg-m)' }} />}
        </span>
      ))}
    </div>
  );
}

export default function SiteLanding() {
  const { t } = useSiteLang();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.rv');
    if (!els) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const GROW = [
    { t: t('grow1_t'), d: t('grow1_d'), hue: 'var(--ax1)' },
    { t: t('grow2_t'), d: t('grow2_d'), hue: 'var(--ax3)' },
    { t: t('grow3_t'), d: t('grow3_d'), hue: 'var(--gold)' },
  ];
  const RIGOR = [t('rigor_1'), t('rigor_2'), t('rigor_3'), t('rigor_4')];
  const TESTI = [
    { q: t('testi1_q'), by: t('testi1_by') },
    { q: t('testi2_q'), by: t('testi2_by') },
    { q: t('testi3_q'), by: t('testi3_by') },
  ];
  const count = t('social_count');

  return (
    <div className="usite" ref={rootRef}>
      {/* ── HERO ── */}
      <header className="surface-space" style={{ position: 'relative', minHeight: '100svh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <Starfield count={120} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          <DecorativeGalaxy sizeK={1.05} centerY={0.52} />
        </div>
        {/* radial scrim to keep hero text legible over the moving galaxy */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'radial-gradient(ellipse 60% 55% at 50% 46%, rgba(6,10,32,.72) 0%, rgba(6,10,32,.28) 45%, transparent 72%)', pointerEvents: 'none' }} />

        <PsidNav />

        <div className="wrap" style={{ position: 'relative', zIndex: 5, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', paddingTop: 100, paddingBottom: 80 }}>
          <div className="eyebrow dash" style={{ marginBottom: 22 }}>{t('hero_eyebrow')}</div>
          <h1 className="h-hero" style={{ maxWidth: '16ch' }}>
            {t('hero_h1a')} <span className="grad-o">{t('hero_h1b')}</span>
          </h1>
          <p className="lead" style={{ margin: '26px auto 0', textAlign: 'center' }}>{t('hero_p')}</p>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center', marginTop: 34 }}>
            <Link className="btn btn-orange" href="/reno">{t('hero_cta')} <span className="ar">→</span></Link>
            <Link className="btn btn-ghost-white" href="/methodology">{t('hero_cta2')}</Link>
          </div>
          <div style={{ marginTop: 30, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--space-fg-m)' }}>
            {t('hero_micro')}
          </div>
        </div>
      </header>

      {/* ── § YOUR CODE ── */}
      <section className="section">
        <div className="wrap" style={{ textAlign: 'center' }}>
          <div className="eyebrow dash rv" style={{ marginBottom: 20 }}>{t('code_eyebrow')}</div>
          <h2 className="h-2 rv" style={{ maxWidth: '18ch', margin: '0 auto' }}>{t('code_h')}</h2>
          <div className="rv" style={{ margin: '38px 0' }}><CodeMorph /></div>
          <p className="lead rv" style={{ margin: '0 auto', textAlign: 'center' }}>{t('code_p')}</p>
        </div>
      </section>

      {/* ── § HOW IT GROWS ── */}
      <section className="section">
        <div className="wrap">
          <div className="rv" style={{ maxWidth: 620, marginBottom: 48 }}>
            <div className="eyebrow dash blue" style={{ marginBottom: 16 }}>{t('grow_eyebrow')}</div>
            <h2 className="h-2">{t('grow_ha')} <span className="grad-o">{t('grow_hb')}</span></h2>
          </div>
          <div className="grid g-3">
            {GROW.map((c, k) => (
              <div key={k} className="glass rv" style={{ padding: 28 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, display: 'grid', placeItems: 'center', marginBottom: 20, background: c.hue, boxShadow: `0 10px 30px -12px ${c.hue}` }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#fff', boxShadow: '0 0 10px rgba(255,255,255,.8)' }} />
                </div>
                <h3 className="h-3" style={{ marginBottom: 10 }}>{c.t}</h3>
                <p className="body-t">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── § RIGOR STRIP ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="surface-deep rv" style={{ borderRadius: 'var(--r-xl)', border: '1px solid var(--space-brd)', padding: 'clamp(28px,4vw,44px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 24, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px 28px' }}>
              {RIGOR.map((item, k) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '.02em', color: 'var(--space-fg-s)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: AXES[k % 5].hue }} />
                  {item}
                </div>
              ))}
            </div>
            <Link className="btn btn-ghost-white sm" href="/methodology">{t('rigor_cta')} <span className="ar">→</span></Link>
          </div>
        </div>
      </section>

      {/* ── § SOCIAL PROOF ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          {count && (
            <div className="rv" style={{ marginBottom: 44 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(46px,8vw,84px)', letterSpacing: '-.04em', lineHeight: 1, background: 'var(--grad-orange)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>{count}</div>
              <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--space-fg-m)' }}>{t('social_label')}</div>
            </div>
          )}
          <div className="grid g-3">
            {TESTI.map((c, k) => (
              <div key={k} className="glass rv" style={{ padding: 28, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {AXES.map((a) => <span key={a.key} style={{ width: 7, height: 7, borderRadius: '50%', background: a.hue }} />)}
                </div>
                <p style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--space-fg)' }}>«{c.q}»</p>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '.08em', color: 'var(--space-fg-m)', marginTop: 'auto' }}>{c.by}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── § FINAL CTA ── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="surface-nebula rv" style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--r-xl)', border: '1px solid var(--space-brd)', padding: 'clamp(52px,8vw,88px) clamp(24px,5vw,56px)', textAlign: 'center' }}>
            <Starfield count={40} />
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="eyebrow dash" style={{ justifyContent: 'center', marginBottom: 18 }}>{t('final_eyebrow')}</div>
              <h2 className="h-2" style={{ maxWidth: '18ch', margin: '0 auto' }}>{t('final_h')}</h2>
              <p className="lead" style={{ margin: '18px auto 32px', textAlign: 'center' }}>{t('final_p')}</p>
              <Link className="btn btn-orange" href="/reno">{t('final_cta')} <span className="ar">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      <PsidFooter />
    </div>
  );
}
