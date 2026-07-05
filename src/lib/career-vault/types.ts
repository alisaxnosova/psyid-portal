// Career Vault — professions classified to personality codes by the PsyID method.
// Hierarchy: Sphere → Industry → Function → Occupation.
// NOTE: cognitive-function notation (Ni/Te/Si/Fe…) and mbti_fit are INTERNAL admin
// data only. Never surface "MBTI" or function notation in public/user-facing output.

export type TypeCode =
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export const ALL_TYPES: TypeCode[] = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

export interface Dichotomy {
  tendency: string;          // e.g. "balanced", "moderate-S", "strong-J"
  weight: string;            // "low" | "medium" | "high"
}

export interface OccupationPersonality {
  cognitive_demand?: string[];               // function notation, internal
  function_pair?: string;                    // e.g. "SF"
  mbti_fit: { high: string[]; moderate: string[] };   // ranked fit tiers (type codes)
  dichotomies?: { EI?: Dichotomy; SN?: Dichotomy; TF?: Dichotomy; JP?: Dichotomy };
}

export interface Occupation {
  id: string;
  name: string;
  personality: OccupationPersonality;
  specializations?: string[];
  specialization_notes?: Record<string, string>;
  contexts?: string[];                       // context ids
}

export interface VaultFunction {
  id: string;
  name: string;
  occupations: Occupation[];
}

export interface Industry {
  id: string;
  name: string;
  functions: VaultFunction[];
}

export interface Context {
  id: string;
  name: string;
  personality_overlay?: { amplifies?: string[]; notes?: string };
}

export interface Sphere {
  id: string;
  sphere: string;            // display name, e.g. "Healthcare"
  description?: string;
  contexts: Context[];
  industries: Industry[];
}

// ── helpers ──────────────────────────────────────────────────────────────────

export function makeId(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export interface OccRef {
  occupation: Occupation;
  industry: Industry;
  fn: VaultFunction;
}

/** Flatten a sphere into every occupation with its industry/function context. */
export function flattenOccupations(sphere: Sphere): OccRef[] {
  const out: OccRef[] = [];
  for (const industry of sphere.industries) {
    for (const fn of industry.functions) {
      for (const occupation of fn.occupations) {
        out.push({ occupation, industry, fn });
      }
    }
  }
  return out;
}

/** Invert the vault: for each type code, the occupations that list it as high / moderate fit. */
export function occupationsByType(sphere: Sphere): Record<string, { high: OccRef[]; moderate: OccRef[] }> {
  const map: Record<string, { high: OccRef[]; moderate: OccRef[] }> = {};
  for (const t of ALL_TYPES) map[t] = { high: [], moderate: [] };
  for (const ref of flattenOccupations(sphere)) {
    for (const t of ref.occupation.personality.mbti_fit?.high ?? []) {
      if (map[t]) map[t].high.push(ref);
    }
    for (const t of ref.occupation.personality.mbti_fit?.moderate ?? []) {
      if (map[t]) map[t].moderate.push(ref);
    }
  }
  return map;
}
