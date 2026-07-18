'use client';

import { useEffect, useState } from 'react';
import { deviceTier } from './perf';

interface Star { top: string; left: string; w: number; o: number; d: number; delay: number; glow: number }

/**
 * Decorative twinkling + glowing starfield for cosmic surfaces. Bigger stars carry a
 * soft white halo (box-shadow) so they read as glowing points of light, matching the
 * Personality DNA look. Generated on the client after mount (avoids hydration mismatch);
 * freezes under prefers-reduced-motion via globals.css.
 *
 * `fixed` renders it as a full-viewport background layer (used site-wide on the Home);
 * otherwise it fills its positioned parent (used inside hero bands / the portal).
 */
export function Starfield({ count = 130, fixed = false }: { count?: number; fixed?: boolean }) {
  const [stars, setStars] = useState<Star[]>([]);
  useEffect(() => {
    // Old machines: fewer stars, and no per-star box-shadow glow (glow forces
    // expensive repaints on hundreds of animating DOM nodes).
    const tier = deviceTier();
    const n = Math.max(1, Math.round(count * tier.particleScale));
    setStars(Array.from({ length: n }, () => {
      const w = +(Math.random() * 1.9 + 0.5).toFixed(2);
      const o = +(Math.random() * 0.6 + 0.28).toFixed(2);
      return {
        top: (Math.random() * 100).toFixed(2) + '%',
        left: (Math.random() * 100).toFixed(2) + '%',
        w,
        o,
        d: +(Math.random() * 3 + 2).toFixed(2),
        delay: +(Math.random() * 4).toFixed(2),
        // larger stars glow more; small ones stay crisp. Glow off entirely on low-end.
        glow: !tier.lowEnd && w > 1.1 ? +(w * 2.4).toFixed(1) : 0,
      };
    }));
  }, [count]);

  return (
    <div className="stars" aria-hidden="true" style={fixed ? { position: 'fixed' } : undefined}>
      {stars.map((s, i) => (
        <i key={i} style={{
          top: s.top, left: s.left, width: s.w, height: s.w,
          ['--o' as string]: s.o, ['--d' as string]: s.d + 's', animationDelay: s.delay + 's',
          boxShadow: s.glow ? `0 0 ${s.glow}px ${(s.glow * 0.35).toFixed(1)}px rgba(255,255,255,${(s.o * 0.55).toFixed(2)})` : undefined,
        }} />
      ))}
    </div>
  );
}

export default Starfield;
