'use client';

/**
 * Site copy accessor for the public marketing site + subscriber portal.
 *
 * The product is English-only. This module keeps the small `useSiteLang()` /
 * `t()` surface that components already consume, but there is no longer a
 * locale — every lookup resolves to the English string in the sheet-editable
 * catalogs (src/content/{landing,portal}.json).
 *
 * Copy source of truth: src/content/{landing,portal}.json. These are edited
 * directly; the content-export/*.tsv pipeline stays as an optional round-trip
 * for non-dev editors.
 */

import { createContext, useContext } from 'react';
import LANDING from '@/content/landing.json';
import PORTAL from '@/content/portal.json';

type Catalog = Record<string, { en: string }>;

// Portal keys can shadow landing keys where they overlap; merge is portal-last.
const CATALOG: Catalog = { ...(LANDING as Catalog), ...(PORTAL as Catalog) };

export function translate(key: string): string {
  return CATALOG[key]?.en ?? key;
}

interface SiteLangCtx {
  // The product is English-only; `lang` is retained as a constant so the
  // components that thread it (bilingual-shaped data, `[lang]` accessors)
  // keep resolving to English without a wide refactor.
  lang: 'en';
  t: (key: string) => string;
}

const Ctx = createContext<SiteLangCtx>({ lang: 'en', t: (k) => translate(k) });

export function SiteLangProvider({ children }: { children: React.ReactNode }) {
  return <Ctx.Provider value={{ lang: 'en', t: (k) => translate(k) }}>{children}</Ctx.Provider>;
}

export const useSiteLang = () => useContext(Ctx);
