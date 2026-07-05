import { kvGet, kvSet } from '@/lib/upstash';
import type { Sphere } from './types';
import healthcareSeed from '@/data/career-vault/healthcare.json';

// Committed seed spheres (source of truth in git). New spheres: drop the JSON in
// src/data/career-vault/ and add it here.
const SEEDS: Sphere[] = [healthcareSeed as unknown as Sphere];

const INDEX_KEY = 'psyid:career-vault:index';
const sphereKey = (id: string) => `psyid:career-vault:sphere:${id}`;

/**
 * Return all spheres from Redis, seeding any sphere that isn't there yet from the
 * committed JSON. Seeding never overwrites an existing (possibly edited) sphere.
 */
export async function getSpheres(): Promise<Sphere[]> {
  const index = (await kvGet<string[]>(INDEX_KEY)) ?? [];
  const known = new Set(index);
  let indexDirty = false;

  // Seed missing spheres
  for (const seed of SEEDS) {
    if (!known.has(seed.id)) {
      await kvSet(sphereKey(seed.id), seed);
      known.add(seed.id);
      indexDirty = true;
    }
  }
  if (indexDirty) await kvSet(INDEX_KEY, [...known]);

  const spheres = await Promise.all([...known].map(id => kvGet<Sphere>(sphereKey(id))));
  return spheres.filter((s): s is Sphere => !!s);
}

export async function saveSphere(sphere: Sphere): Promise<void> {
  const index = (await kvGet<string[]>(INDEX_KEY)) ?? [];
  if (!index.includes(sphere.id)) {
    index.push(sphere.id);
    await kvSet(INDEX_KEY, index);
  }
  await kvSet(sphereKey(sphere.id), sphere);
}

export async function getSphere(id: string): Promise<Sphere | null> {
  return (await kvGet<Sphere>(sphereKey(id))) ?? null;
}
