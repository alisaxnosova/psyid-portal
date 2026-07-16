'use client';

import { useSiteLang } from '@/lib/siteLang';

/**
 * EN/RU language switch. `tone` adapts it to a dark (cosmic) or light (paper)
 * surface. Used in the site nav + footer and the portal top bar.
 */
export function LocaleToggle({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const { lang, setLang } = useSiteLang();
  const dark = tone === 'dark';

  const base: React.CSSProperties = {
    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
    letterSpacing: '0.08em', padding: '5px 9px', borderRadius: 'var(--r-full)',
    cursor: 'pointer', border: 'none', background: 'none', transition: 'color .15s, background .15s',
    lineHeight: 1,
  };
  const activeColor = dark ? '#fff' : 'var(--ink)';
  const idleColor = dark ? 'rgba(255,255,255,.4)' : 'var(--ink-mute)';

  return (
    <div
      role="group"
      aria-label="Language"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 2,
        border: `1px solid ${dark ? 'var(--space-brd)' : 'var(--line)'}`,
        borderRadius: 'var(--r-full)', padding: 2,
        background: dark ? 'var(--space-panel)' : '#fff',
      }}
    >
      {(['ru', 'en'] as const).map((l) => {
        const on = lang === l;
        return (
          <button
            key={l}
            type="button"
            aria-pressed={on}
            onClick={() => setLang(l)}
            style={{
              ...base,
              color: on ? activeColor : idleColor,
              background: on ? (dark ? 'var(--space-hi)' : 'var(--paper-2)') : 'transparent',
            }}
          >
            {l.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
