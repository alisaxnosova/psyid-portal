# Session Passover — PsyID Career Compass

_Last updated: 2026-07-05_

---

## 2026-07-05 (latest) — Passport English, retake cooldown, funnel, plan tier, Full mockup

- **Passport → English** + terminology fix: "assessment / profile" everywhere; killed
  every «оценка» (reads as "grade" in RU). `PassportView.tsx` copy is now EN.
- **Careers 7 / growth 4:** `deriveNarrative()` now yields 7 best-fit careers per
  temperament (NF/NT/SF/ST) and 4 growth experiments (one per axis, phrased by dominant
  side).
- **Yearly retake cooldown:** `reno/sessions/validate` — portal codes (`portalUserEmail`
  set) are no longer permanently locked on `USED`; blocked only if `used_at` is < 365 days
  ago (`reason:'cooldown'`, returns `availableAt`). External/Etsy codes still permanent.
  Reno code screen shows `err_cooldown` with the available date (all 5 langs).
- **Completion funnel branches by userType:** validate tags portal sessions
  `userType:'portal'`; `complete` route returns `isPortal` + `redirectUrl` →
  `/portal` for portal takers (see their passport), `https://psyid.me` for Etsy. Reno
  `CompleteStage` shows `complete_portal_body` + "View your passport" for portal users.
- **Plan tier:** `PortalUser.plan?: 'basic'|'full'`. `/api/client/results` returns
  `holder.plan` (defaults to `'full'` — everyone who's completed so far is grandfathered);
  passport nav shows a Full/Basic badge; tier/tierCode on stamps derive from plan.
- **Full-plan vision mocked up:** `mockups/personality-portal.html` (also copied to
  `public/personality-portal.html` → live at https://psyid.me/personality-portal.html).
  A separate per-user "personality portal" (NOT a booklet) that a stamp opens into — the
  20-pager adapted to web, standardized sections, with a live Basic⇄Full toggle. Basic =
  snapshot/type/axes/superpowers/7 careers/4 growth; Full unlocks blind spots, misreads,
  work environments, money & risk, relationships, full 30-day plan + 20-page PDF download.
  **Next build:** turn this mockup into a real `/portal/report/[sessionId]` page wired to
  the generated per-type content, gated by `plan`. Data-source decision still open (the
  20-pager is AI-generated HTML per session; either restructure the generator to emit
  structured sections or generate on demand).

---

## 2026-07-05 (later) — Client portal: personality passport after first test

`/portal` (the canonical client cabinet — register + login both redirect here) now
transforms from the placeholder card layout into an **interactive "Паспорт личности"
booklet** once the user has completed their first assessment. Ported from a Claude
Design prototype (`PsyID Client Portal.html`).

- **New:** `src/app/portal/PassportView.tsx` — page-turn book (cover → data page → visa
  pages with per-assessment stamps → back cover), plus a navigable **ResultsReader**
  overlay opened by clicking a stamp (Обзор / Оси / Сильные стороны / Рост). All CSS is
  injected via a scoped `<style>` under `.portal` (vars scoped to `.portal`, not `:root`,
  to avoid colliding with the app's global tokens). Tweaks-panel scaffold from the
  prototype was dropped.
- **New:** `GET /api/client/results` — Bearer (portal session token). Resolves the portal
  user → their access code → `codeId`, scans `psyid:reno-session:*` for **completed**
  sessions with that codeId, scores each via `scoreSession`, returns `{ hasResult, holder,
  assessments[] }`. `vals = [pctE, pctN, pctF, pctJ]/100`; `code = score.type`.
- **Gating:** `src/app/portal/page.tsx` fetches `/api/client/results` after auth; if
  `hasResult` → `<PassportView>`, else the existing placeholder portal.
- **Narrative is placeholder** (RU), derived client-side in `deriveNarrative()` from the
  code/axes (profile label, summary, strengths, watch-outs, careers, 2 growth experiments).
  Identity/code/radar/axis positions are REAL (from the scored session). User will refine
  copy later ("going granular" on every page).
- **Not done yet / follow-ups:** wire real report content into the narrative sections;
  the reno completion funnel still tags portal takers as `third_party` and shows the Etsy
  "results sent to your specialist" end screen — needs to branch on `code.portalUserEmail`
  → tag session `portal` and redirect back to `/portal` after completion. `/results` CTA
  still points at the stray `/dashboard` cabinet.
- Bilingual (EN/RU) portal was requested earlier but the passport is RU-only for now.

---

## 2026-07-05 (later session) — Admin portal: users/results/vault

All shipped, committed, pushed (`alisa` remote), and deployed to https://psyid.me.

1. **External vs Portal users fixed** (`ca9e12e`). External Users tab was listing
   portal/website registrants too, because portal registration auto-creates an
   access code with a `user_name`. Fix: `ExternalUsersTab` now skips any code with a
   `portalUserEmail` (that field is stamped only on portal-generated codes). External
   = manual Etsy codes only. File: `src/app/admin/(shell)/users/page.tsx`.
2. **Results tab shows test-taker identity** (`9ea22ad`) instead of raw code. Resolves
   name → invoice/reference → code (helper `takerLabel`), raw code kept as a small
   subtitle. `/api/admin/results` now joins `user_name` + `invoice_ref` from the code.
   Files: `results/page.tsx`, `api/admin/results/route.ts`.
3. **Access-codes table overflow fixed** (`76d631f`, `4e27952`). Real cause: the page
   is a `360px 1fr` CSS grid; a `1fr` track defaults to `min-width:auto` and refused to
   shrink below the table's width, overflowing the whole page. Fix: `min-width:0` on the
   codes-list grid child + wrap table in `overflow-x:auto` w/ `minWidth`.
   File: `test/page.tsx`.
4. **Career Vault — NEW admin page** (`4c8746a` data, `a32c892` feature).
   `/admin/career-vault`: visual repository of professions classified to personality
   codes. The dataset lived at `~/career-database/healthcare.json` **outside the repo**
   (why it seemed "lost") — now committed at `src/data/career-vault/healthcare.json`
   (19 industries / 140 occupations). Schema: sphere → industry → function → occupation;
   each occupation has `personality.mbti_fit.high/moderate` (ranked fit tiers),
   `cognitive_demand`, `dichotomies`, `specializations`, `contexts`.
   - Two views (toggle): **By Industry** and **By Personality Code** (inverted index).
   - Add/edit/delete occupations; ranked-fit editor cycles each type High→Moderate→off.
   - **Storage:** Redis `psyid:career-vault:*`, seeded from the committed JSON (git =
     source of truth). **Export JSON** button downloads the live vault to re-commit.
   - **IP:** cognitive-function notation (Ni/Te…) + `mbti_fit` are internal admin only —
     never surface "MBTI"/function notation in public reports.
   - Files: `src/lib/career-vault/{types,store}.ts`, `api/admin/career-vault/route.ts`,
     `admin/(shell)/career-vault/page.tsx`, nav + i18n in `admin-layout.tsx` / `adminLang.tsx`.
   - **TODO next:** add/edit of new industries & functions (only occupation-level CRUD so
     far); auto/scheduled export-to-git so edits don't drift from the committed seed;
     add more spheres beyond Healthcare (drop JSON in `src/data/career-vault/`, register
     in `SEEDS` in `store.ts`).

---


## Status: all work shipped, committed, pushed

Everything below is **deployed to production** (https://psyid.me), **committed** to
`master` (`1a1afe5`), and **pushed** to GitHub (`alisaxnosova/psyid-portal`).

---

## What was accomplished this session

1. **Career PDF generation fixed** (the main work — see below).
2. **Dashboard undercount fixed** — was showing 2 sessions instead of all. Switched
   from a race-prone `{ [codeId]: sessionId }` index map to Redis `SCAN` via
   `kvKeys('psyid:reno-session:*')`. Files: `src/lib/upstash.ts` (new `kvKeys`),
   `src/app/api/admin/dashboard/route.ts`, `src/app/api/admin/results/route.ts`.
3. **Demographic bias removed** — career prompts no longer feed the user's
   `occupation` into recommendations. Removed from `careersPrompt` and
   `actionPlanPrompt` in `src/lib/report-generator/section-prompts.ts`.
   Recommendations are now driven purely by personality scores.
4. **`libnss3.so` cold-start crash fixed** — `@sparticuz/chromium` only extracts its
   lib bundle when `AWS_EXECUTION_ENV` is set, and Vercel doesn't set it. Fix:
   `process.env['AWS_EXECUTION_ENV'] ??= 'AWS_Lambda_nodejs20.x'` **before** importing
   chromium, in the career-pdf route.

---

## The PDF fix — root cause & solution (most important)

**File:** `src/app/api/admin/sessions/[sessionId]/career-pdf/route.ts`

**Design context:**
- The report is a fixed **20-page** design assembled in
  `src/lib/report-generator/index.ts`.
- CSS + page structure live in `src/lib/report-generator/page-builders.ts`.
- Each `.page` = one A4 sheet (794×1123px), flex column:
  `.page-header` / `.body-pad` (flex:1) / `.page-footer`. The footer pins to the
  bottom via `.body-pad{flex:1}`.
- There's a `@media print` block at ~`page-builders.ts:146` that also constrains
  `.page` — earlier inline-style attempts were silently overridden by it.

**Root cause:** body copy is AI-generated and its length varies. When a page's
content exceeds 1123px, Puppeteer paginated the overflow onto a half-empty
continuation sheet → 36 pages of whitespace. Clipping (`overflow:hidden` + fixed
height) instead cut content off. Neither acceptable.

**Solution (in the route's `page.evaluate`):**
1. `await page.evaluateHandle('document.fonts.ready')` before measuring — measuring
   against fallback fonts gives wrong heights. This is essential.
2. Flatten the on-screen `.viewer` chrome; remove `.page-label`s.
3. Per `.page`, drop the min-height floor and measure natural height:
   - **Fits (≤ 1123+8px):** lock to exactly 1123px, `overflow:hidden`. Footer pins
     correctly via flex.
   - **Overflows:** wrap in a fixed 794×1123 A4 frame whose **background is
     color-matched** to the page (so the small side margins from uniform scaling are
     invisible), then `transform: scale(1123/naturalH)` with
     `transform-origin: top center`. Nothing clipped, nothing split.
4. `page.pdf({ format:'A4', printBackground:true, margin:0 })`.

**Verified locally** through real Chrome (`/Applications/Google Chrome.app/...`) +
puppeteer-core against the actual `REPORT_CSS`: exactly 20 physical PDF pages, every
one 1123px tall, 0 splits — even with 9/20 pages force-overflowed. (Test was a
throwaway `__pdftest.ts` at repo root, since deleted.)

**Known trade-off:** a page whose AI copy runs very long renders slightly shrunk
(header/footer/body scale together). Deliberate — better small than cut off. To fix a
specific offender, trim that section's prompt output; don't touch the PDF route.

---

## Architecture quick-reference

- **Storage:** Redis (ioredis) via `src/lib/upstash.ts` — `kvGet/kvSet/kvDel/kvKeys`.
- **Report HTML** is stored at Redis key `psyid:career-report:${sessionId}`.
- **Sessions** at `psyid:reno-session:*` (use `kvKeys` to enumerate, never a manual
  index map — concurrent writes lose entries).
- **Two report routes:**
  - `src/app/api/career-report/[sessionId]/route.ts` — public HTML view (+ `?print=true`
    browser-print path).
  - `src/app/api/admin/sessions/[sessionId]/career-pdf/route.ts` — admin server-side
    PDF download (the one fixed this session).
- **PDF stack:** `@sparticuz/chromium@131` + `puppeteer-core@22` on Vercel.

---

## Constraints & conventions (still apply)

- **IP:** never use "MBTI" / "Myers-Briggs", never cognitive-function notation
  (Ni/Ne/Ti/Te). Use the slider/type language the report already uses.
- **`AGENTS.md`:** this is a modified Next.js — read `node_modules/next/dist/docs/`
  before writing Next-specific code; conventions may differ from training data.
- **Git:** commit + **always push to GitHub** (no need to ask). Default remote for this
  repo is `alisa` → `git@github.com:alisaxnosova/psyid-portal.git`.
- **Deploy:** `vercel --prod --yes` from repo root; aliases to https://psyid.me.

---

## Open / housekeeping

- Untracked file `scripts/.translate-checkpoint.json` — left alone, not committed.
- Gmail + Google Calendar MCP connectors need re-auth via claude.ai connector settings
  (came up unauthenticated after an app restart). Not blocking anything.
- Working tree otherwise clean; `master` is up to date with GitHub.
