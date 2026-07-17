# 07-17-26 · Universe Rebrand — session handoff

Full brand overhaul of **psyid-portal** (deploys to psyid.me) from the old "personality
passport" look to the approved **"Personality Universe"** brand, across all three
surfaces (marketing site · subscriber portal · admin), **bilingual EN/RU**.

Source of truth: `~/Downloads/design_handoff_psyid_master` (design), the ReNo 2.0
whitepaper (`~/Downloads/ReNo_2.0_Methodology_Whitepaper.md`), the marketing strategy
(`PsyID-Marketing-Strategy-{EN,RU}.html`) + playbook, and the official logo export
(`~/Downloads/logo-export 3/`).

Ships live via git push → Vercel auto-deploy from `master`. All work below is on `master`
(commits `4647bf3` … `ab6e8a4`); build + `tsc` green at each step.

---

## What shipped

### Foundations (shared)
- **Design tokens** promoted to real `:root` in `src/app/globals.css` (Element Vault
  palette; old magenta/Onest brand removed, back-compat aliases kept). Cosmic surface
  classes `.surface-space/-deep/-nebula/-paper`, glowing `.stars`, global
  `prefers-reduced-motion`. New marketing scope **`.usite`** (cosmic→paper). Body font = Geist.
- **Bilingual i18n** — `src/lib/siteLang.tsx` (context + `t()`, default RU, EN toggle,
  `localStorage psyid-lang`, browser-lang detect) mirrors `adminLang`. Copy lives in
  `src/content/landing.json` (rewritten to universe copy); prose-dense pages use inline
  `L({ru,en})`. `src/components/shared/LocaleToggle.tsx` in nav/footer/portal.
- **Galaxy engine** `src/components/galaxy/` — one canvas 3D engine driven by a `Profile`
  (`{t,s}[]`, distance & size = f(score)): `model.ts` (AXES incl. bilingual poles/desc +
  `buildGraph`), `GalaxyCanvas.tsx` (project/draw/interact, reduced-motion aware),
  `Starfield.tsx` (glowing twinkles), `index.tsx` (`DecorativeGalaxy` marketing preset).
- **Logo** — `src/components/shared/Mark.tsx` renders the **official exported PNGs** in
  `public/brand/` (Space Grotesk wordmark; `dark`/`light` + horizontal/mark-only). Do NOT
  re-create the mark in SVG — earlier attempts diverged (wrong coords, faint outline, wrong
  font). Use `tone` to match the surface.

### Marketing site (Part A) — `.usite`, cosmic→paper, bilingual
- **Home** `src/components/landing/SiteLanding.tsx`: full-galaxy hero, `§ your code`
  (CodeMorph ticker), `§ how it grows`, `§ rigor strip`, `§ social proof`, **`§ pricing`
  (5th section)**, `§ final CTA`. Site-wide **fixed glowing starfield** behind all sections.
- **Methodology** `src/app/methodology/MethodologyView.tsx`: five axes, 0–100 scale/bands,
  **three-level hierarchy (Stars=axis / Planets=facet / Moons=nuance)**, vocabulary map,
  honest limits. Aligned to the ReNo 2.0 whitepaper.
- **Professions** (new route) + **Sources** (new route): RIASEC×ReNo match cards; grouped
  literature list.
- Nav/footer rebuilt: `PsidNav.tsx` full-bleed **3-col grid (logo / centered tabs /
  actions)** + mobile menu + locale toggle; `PsidFooter.tsx` edge-to-edge, brand promise,
  **PsyID Youth** column (marked "soon"). Content band widened to 1440.

### Portal (Part B) — passport retired, interactive universe
- `src/app/portal/page.tsx` fetches **`GET /api/client/universe`** (new, additive route)
  and renders `PortalUniverse.tsx`: interactive galaxy home, stage rail (01 universe /
  02 directions / 03–05 «скоро»), node detail cards (core/center/module/session), first-visit
  arrival overlay (`localStorage psyid_dna_seen`, `?replay`), stage-02 profession matches.
- `/api/client/universe/route.ts` maps the v1.2 scorer (`byCode` positions) → 5-axis
  `Profile`; legacy 4-axis sessions map with the emotion axis held at center. **Self-contained**
  (inlines the v1.2 Likert detection) — independent of the scoring refactor.
- **Passport deleted**: `PassportView.tsx` + `FullReport.tsx` gone; `/results` → redirects
  to `/portal` (admin `/results/report` viewer kept). PDF report stack untouched.

### Admin
- Shell on shared tokens (navy/Geist/orange). **Users tab defaults to Portal** (first).
  Old deep-violet chart accents → `#8A5CD6`. Logo → official Mark.

### Logo fix (the long one)
- All live pages now use the **official Space Grotesk logo**, color-appropriate:
  **dark** on cosmic/dark surfaces (nav, footer, portal, science heroes, all auth pages,
  admin sidebar, forgot-password); **light** on the paper **test page** (`/reno`).
- Replaced every inline SVG mark, the old box-with-two-dots logo, and Geist/Onest text
  wordmarks.

### Copy correctness
- Retests are **every 6 months**, not yearly (matches portal cooldown): grow card,
  testimonial, and tier 3 (renamed *Annual ritual → Growth ritual*).
- Stripped remaining **"Personality Passport"** language from auth pages → "PsyID · ReNo 2.0".

### Archived (git history kept, excluded from build via `tsconfig` `exclude: ["archive"]`)
`archive/legacy-ui/`: `PsidLogo`, `ProductCard`, shared `Logo/Nav/Tag/AxisBar/ProfileGlyph`,
`data/reno.ts`.

---

## ⚠️ Outstanding / decisions for the owner

1. **Pricing numbers are placeholders** — `$12 one-time / $6 mo / $49 yr`, all editable in
   one place: `src/content/landing.json` keys `tier1/2/3_*`, EN+RU. The three "Begin"
   buttons all point to `/reno`; wire real checkout/Etsy links per tier when available.
2. **Social-proof counter left blank** (`landing.json social_count:""`, section hidden) —
   the handoff's "128 400" is fabricated and clashes with the brand promise. Set a real number.
3. **EN marketing prose is my faithful translation** of the final RU (handoff designed RU
   only). Worth a copy-review pass.
4. **Legacy 4-axis scorer NOT archived** — `src/lib/renoScore.ts` + answer-key
   (`reno/data/profiles`, `content/descriptions.json`) are still load-bearing for the **PDF
   report generator** (`lib/report-generator/*`, `components/pdf/RenoReport.tsx`) and admin
   dashboard/results. Retiring them requires porting the report stack to the v1.2 five-axis
   engine first — a separate task.
5. **Logo is raster (PNG)** from your export. Sharp at nav sizes; if you want crisp-at-any-size
   + theme-toggle, swap for an SVG reproduction using Space Grotesk (files in
   `~/Downloads/logo-export 3/`, master SVG in `PsyID-Logo-Master.html`).

---

## Key file map
- Tokens/CSS: `src/app/globals.css` · i18n: `src/lib/siteLang.tsx`, `src/content/landing.json`
- Logo: `src/components/shared/Mark.tsx`, `public/brand/*`
- Galaxy: `src/components/galaxy/{model,GalaxyCanvas,Starfield,index}.tsx`
- Marketing: `src/components/landing/{SiteLanding,PsidNav,PsidFooter}.tsx`,
  `src/app/{methodology,professions,sources}/*`
- Portal: `src/app/portal/{page,PortalUniverse}.tsx`, `src/app/api/client/universe/route.ts`
- Admin: `src/app/admin/(shell)/{admin-layout,users/page}.tsx`

## Verify
`npm run build` + `npx tsc --noEmit` green. Walk each surface in EN and RU via the toggle;
galaxy drag/zoom/tap + reduced-motion; `/reno` complete → portal universe → arrival →
directions; `/results`→`/portal`; admin opens on Portal tab; PDF report still generates.
Logo: hard-refresh (Cmd+Shift+R) after deploy — dark on dark pages, light on `/reno`.
