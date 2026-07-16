'use client';

/**
 * Galaxy engine — public surface. `DecorativeGalaxy` is the marketing-hero preset
 * (auto-rotating, non-interactive). For the interactive portal universe, use
 * `GalaxyCanvas` directly with a real profile + onPick/focus wiring.
 */

import { useMemo } from 'react';
import { GalaxyCanvas } from './GalaxyCanvas';
import { buildGraph, DEFAULT_PROFILE, type Profile } from './model';

export { GalaxyCanvas } from './GalaxyCanvas';
export type { GalaxyCanvasProps, PaletteKey, LabelMode } from './GalaxyCanvas';
export { Starfield } from './Starfield';
export * from './model';

/** Decorative marketing galaxy: a demo universe with dust halo, endlessly rotating. */
export function DecorativeGalaxy({
  profile = DEFAULT_PROFILE.axes, sizeK = 1, centerY = 0.5, glow = 1, speed = 1,
}: { profile?: Profile; sizeK?: number; centerY?: number; glow?: number; speed?: number }) {
  const graph = useMemo(() => buildGraph(profile, {
    modules: [{ key: 'riasec', axis: 1, locked: false }, { key: 'values', axis: 2, locked: false }, { key: 'burnout', axis: 4, locked: true }, { key: 'team', axis: 3, locked: true }],
    sessions: 4,
    dust: 96,
    pentagonWeb: true,
  }), [profile]);

  return (
    <GalaxyCanvas
      graph={graph}
      interactive={false}
      palette="transparent"
      showLabels="none"
      pentagon="woven"
      glow={glow}
      speed={speed}
      sizeK={sizeK}
      centerY={centerY}
    />
  );
}
