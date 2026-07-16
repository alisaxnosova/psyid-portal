/* eslint-disable @next/next/no-img-element */
/**
 * The official PsyID logo. Renders the exported brand assets directly
 * (public/brand/*), so the mark geometry and the Space Grotesk wordmark are
 * always exactly the approved logo — never a re-creation.
 *
 * `tone` picks the color-appropriate file: use `dark` on dark surfaces (light
 * wordmark), `light` on light surfaces (ink wordmark).
 *   - Mark          → horizontal lockup (mark + wordmark), or mark-only when wordmark=false
 *   - ConstellationGlyph → the mark only (square)
 */

type Tone = 'dark' | 'light';
type Size = 'sm' | 'md' | 'lg' | number;

const H = (s: Size) => (typeof s === 'number' ? s : ({ sm: 26, md: 34, lg: 52 }[s]));
const HORIZ_RATIO = 1800 / 600; // 3:1

export function ConstellationGlyph({ size = 32, tone = 'dark' }: { size?: number; tone?: Tone; mono?: boolean }) {
  const src = tone === 'light' ? '/brand/psyid-mark-light.png' : '/brand/psyid-mark-dark.png';
  return <img src={src} alt="PsyID" width={size} height={size} style={{ display: 'block', width: size, height: size, objectFit: 'contain' }} />;
}

export function Mark({ size = 'md', tone = 'dark', wordmark = true, subtitle }: {
  size?: Size; tone?: Tone; wordmark?: boolean; mono?: boolean; subtitle?: string;
}) {
  const h = H(size);
  if (!wordmark) return <ConstellationGlyph size={h} tone={tone} />;

  const src = tone === 'light' ? '/brand/psyid-horizontal-light.png' : '/brand/psyid-horizontal-dark.png';
  const img = (
    <img src={src} alt="PsyID" height={h} width={Math.round(h * HORIZ_RATIO)}
      style={{ display: 'block', height: h, width: 'auto', objectFit: 'contain' }} />
  );
  if (!subtitle) return img;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 12 }}>
      {img}
      <span aria-hidden style={{ width: 1, height: h * 0.5, background: 'currentColor', opacity: 0.25 }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500, fontSize: Math.round(h * 0.32), letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.7 }}>{subtitle}</span>
    </span>
  );
}

export default Mark;
