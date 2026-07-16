'use client';

import { useEffect, useState } from 'react';

interface Star { top: string; left: string; w: number; o: number; d: number; delay: number }

/**
 * Decorative twinkling starfield for cosmic surfaces. Generated on the client after
 * mount (avoids hydration mismatch); freezes under prefers-reduced-motion via globals.css.
 */
export function Starfield({ count = 130 }: { count?: number }) {
  const [stars, setStars] = useState<Star[]>([]);
  useEffect(() => {
    setStars(Array.from({ length: count }, () => ({
      top: (Math.random() * 100).toFixed(2) + '%',
      left: (Math.random() * 100).toFixed(2) + '%',
      w: +(Math.random() * 1.7 + 0.6).toFixed(2),
      o: +(Math.random() * 0.6 + 0.25).toFixed(2),
      d: +(Math.random() * 3 + 2).toFixed(2),
      delay: +(Math.random() * 4).toFixed(2),
    })));
  }, [count]);

  return (
    <div className="stars" aria-hidden="true">
      {stars.map((s, i) => (
        <i key={i} style={{
          top: s.top, left: s.left, width: s.w, height: s.w,
          ['--o' as string]: s.o, ['--d' as string]: s.d + 's', animationDelay: s.delay + 's',
        }} />
      ))}
    </div>
  );
}

export default Starfield;
