/**
 * The PsyID constellation mark — the official brand logo.
 * A faint pentagon with a colored dot at each vertex (the five axes, in order)
 * plus a white center dot, next to the "PsyID" wordmark (ID in orange).
 *
 * Self-contained (no dependency on any page's CSS scope) so it renders identically
 * on the marketing site, the portal, and the admin shell. Spec from
 * "00 - Design System - Element Vault".
 */

const AXIS_HUES = ['#2244E0', '#6A85F0', '#8A5CD6', '#FF7A3D', '#FF5A5A'];
// Official mark geometry (from logo-export master): pentagon vertices on a 100×100
// viewBox, axis order (top, clockwise). Thin faint outline, five dots, NO center dot.
const PTS: [number, number][] = [[50, 16], [84, 40], [71, 79], [29, 79], [16, 40]];

type Tone = 'dark' | 'light';

export function ConstellationGlyph({ size = 32, mono = false, tone = 'dark' }: {
  size?: number; mono?: boolean; tone?: Tone;
}) {
  const stroke = mono ? 'currentColor' : (tone === 'dark' ? 'rgba(210,218,255,0.22)' : 'var(--line-dark)');
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
      <polygon
        points={PTS.map((p) => p.join(',')).join(' ')}
        fill="none" stroke={stroke} strokeOpacity={mono ? 0.4 : 1} strokeWidth={1.5}
      />
      {PTS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={7} fill={mono ? 'currentColor' : AXIS_HUES[i]} />
      ))}
    </svg>
  );
}

export function Mark({
  size = 'md', tone = 'dark', mono = false, wordmark = true, subtitle,
}: {
  size?: 'sm' | 'md' | 'lg' | number;
  tone?: Tone;
  mono?: boolean;
  wordmark?: boolean;
  subtitle?: string;
}) {
  const glyphPx = typeof size === 'number' ? size : ({ sm: 24, md: 32, lg: 48 }[size]);
  const fontPx = typeof size === 'number' ? Math.round(size * 0.62) : ({ sm: 16, md: 22, lg: 36 }[size]);
  const wordColor = mono ? 'currentColor' : (tone === 'dark' ? '#fff' : 'var(--ink)');

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, color: wordColor }}>
      <ConstellationGlyph size={glyphPx} mono={mono} tone={tone} />
      {wordmark && (
        <span style={{
          display: 'inline-flex', alignItems: 'baseline', gap: subtitle ? 10 : 0,
          fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: '-0.03em',
          fontSize: fontPx, lineHeight: 1,
        }}>
          <span>Psy<i style={{ fontStyle: 'normal', color: mono ? 'currentColor' : 'var(--orange)' }}>ID</i></span>
          {subtitle && (
            <>
              <span aria-hidden style={{ opacity: 0.3, fontWeight: 400 }}>·</span>
              <span style={{
                fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: Math.round(fontPx * 0.5),
                letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7,
              }}>{subtitle}</span>
            </>
          )}
        </span>
      )}
    </span>
  );
}

export default Mark;
