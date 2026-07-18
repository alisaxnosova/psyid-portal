'use client';

/**
 * Shared performance tiering for the galaxy + starfield.
 *
 * Old / low-power machines (few CPU cores, little RAM, or a coarse pointer) get:
 *   • a lower device-pixel-ratio cap  → far fewer pixels to paint on Retina
 *   • a 30fps frame budget            → half the per-frame work
 *   • fewer decorative particles       → fewer gradients + DOM nodes
 * The look is preserved on capable machines; only the heavy cases are trimmed.
 */

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export interface DeviceTier {
  lowEnd: boolean;
  dprCap: number;   // clamp devicePixelRatio to this
  fps: number;      // target frame rate
  particleScale: number; // multiplier for decorative particle counts
}

export function deviceTier(): DeviceTier {
  if (typeof navigator === 'undefined') return { lowEnd: false, dprCap: 1.5, fps: 60, particleScale: 1 };
  const cores = navigator.hardwareConcurrency || 8;
  // deviceMemory is Chromium-only; treat "unknown" as capable.
  const mem = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 8;
  const lowEnd = cores <= 4 || mem <= 4;
  return lowEnd
    ? { lowEnd: true, dprCap: 1.25, fps: 30, particleScale: 0.5 }
    : { lowEnd: false, dprCap: 1.5, fps: 60, particleScale: 1 };
}
