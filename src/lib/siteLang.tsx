'use client';

/**
 * Bilingual (EN/RU) i18n for the public marketing site + subscriber portal.
 * Mirrors the admin i18n pattern (see src/lib/adminLang.tsx) but reads its copy
 * from the sheet-editable catalogs in src/content/*.json. Default language is RU
 * (the shipping language); EN is available via the locale toggle.
 *
 * Copy source of truth: src/content/{landing,portal}.json. These are edited
 * directly for the rebrand; the content-export/*.tsv pipeline stays as an
 * optional round-trip for non-dev editors.
 */

import { createContext, useContext, useEffect, useState } from 'react';
import LANDING from '@/content/landing.json';
import PORTAL from '@/content/portal.json';

export type SiteLang = 'en' | 'ru';

type Catalog = Record<string, Record<string, string>>;

// Portal keys can shadow landing keys where they overlap; merge is portal-last.
const CATALOG: Catalog = { ...(LANDING as Catalog), ...(PORTAL as Catalog) };

const DEFAULT_LANG: SiteLang = 'ru';
const STORAGE_KEY = 'psyid-lang';

export function translate(key: string, lang: SiteLang): string {
  return CATALOG[key]?.[lang] ?? CATALOG[key]?.en ?? key;
}

interface SiteLangCtx {
  lang: SiteLang;
  setLang: (l: SiteLang) => void;
  toggle: () => void;
  t: (key: string) => string;
}

const Ctx = createContext<SiteLangCtx>({
  lang: DEFAULT_LANG,
  setLang: () => {},
  toggle: () => {},
  t: (k) => translate(k, DEFAULT_LANG),
});

export function SiteLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<SiteLang>(DEFAULT_LANG);

  // Hydrate from storage (and, first visit, from the browser's preferred language).
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as SiteLang | null;
    if (saved === 'en' || saved === 'ru') { setLangState(saved); return; }
    const browser = navigator.language?.toLowerCase() ?? '';
    if (browser.startsWith('en')) setLangState('en');
  }, []);

  // Keep <html lang> in sync for a11y / SEO.
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  function setLang(l: SiteLang) {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* private mode */ }
  }

  return (
    <Ctx.Provider value={{ lang, setLang, toggle: () => setLang(lang === 'ru' ? 'en' : 'ru'), t: (k) => translate(k, lang) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useSiteLang = () => useContext(Ctx);
