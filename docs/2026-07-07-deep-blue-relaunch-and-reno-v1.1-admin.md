# 2026-07-07 — Deep-blue relaunch + ReNo v1.1 five-axis admin

Session passover. Two big threads shipped to **psyid.me** (prod, `master` auto-deploys +
`vercel --prod`): (1) a public-site relaunch on the Element Vault design, and (2) installing the
new **ReNo v1.1 five-axis** methodology into the admin. Commits this session: `8b359b0` →
`24a1fca` (9 commits).

## 1 · Public site — relaunched on the Element Vault
- **New homepage** ([SiteLanding.tsx](../src/components/landing/SiteLanding.tsx)) built from the
  real Element Vault: **constellation logo** (5 axis-dots on a faint pentagon, white web on dark),
  **Geist/Geist Mono**, warm paper `#F6F1EA`, **deep-blue** cover-gradient hero, passport card,
  pentagon radar, signature tiles, five-axis section. Adult "know who you actually are" copy.
- **New `/methodology` page** ([page](<../src/app/methodology/page.tsx>)) — IP-safe ReNo write-up
  (5 axes, band scale, "we'd rather show reasoning than recipe").
- **Auth pages restyled** to the same system via shared `.auth-*` CSS:
  [register](<../src/app/register/page.tsx>), [login](<../src/app/login/page.tsx>),
  [admin/login](<../src/app/admin/login/page.tsx>) — **logic unchanged**, EN copy.
- Shared, **auth-aware** [PsidNav](../src/components/landing/PsidNav.tsx) /
  [PsidFooter](../src/components/landing/PsidFooter.tsx) / [PsidLogo](../src/components/landing/PsidLogo.tsx).
  Footer links everything real: `/reno`, `/register`, `/login`, `/portal`, `/methodology`,
  `/admin/login`.
- Fixes: responsive overflow (radar was fixed 412px → `max-width:100%`); removed the forced
  `::-webkit-scrollbar` that showed a **white gutter over the dark hero on macOS** (now native).
- Design system lives in [globals.css](../src/app/globals.css) as the scoped **`.psid-site`**
  block (Vault tokens `--ax1..5`, `--grad-hero`, band scale, radar, etc.).
- **Placeholders still in copy:** prices **$4.99 / $49.99**, testimonial "Daniel R., 34".

## 2 · ReNo v1.1 — five-axis data + admin
Axes: **EO** Energy (O/W) · **IF** Information (C/A) · **DB** Decision (L/V) · **SP** Structure
(D/F) · **ER** Emotional Response (S/R, new, excluded from the 4-letter headline type). Continuous
**position 0–100** (100 = plus pole, 50 = balanced) → **bands 0–5** (display only) → signature
`W2·A4·V3·F4·S2`.

- **Source of truth** committed to [docs/reno/](reno/): methodology + question-bank HTML, Element
  Vault, source PDFs, `reno_v1.1_questions.tsv` (94 Likert items), `ReNo_AnswerKey_v1.2.xlsx/.json`.
  See [docs/reno/README.md](reno/README.md).
- **Schema** [src/data/reno-axes.ts](../src/data/reno-axes.ts): `AXES`, `BANDS`, `toCode()`,
  `RenoQuestion`.
- **Data**: [questions.json](../src/app/reno/data/questions.json) = 94 new Likert items
  (`id/axis/pole/reverse/text{en,ru}`); old bank preserved as `questions.v1-4axis.json`.
  [answer-key.json](../src/app/reno/data/answer-key.json) + [answer-key.ts](../src/app/reno/data/answer-key.ts)
  = interpretive key (5 axes × 11 cells, EN/RU).
- **Admin reworked** (already on-brand; only the sidebar logo was swapped square→constellation):
  - **Questions** — new Likert schema, axis filters, pole+reverse chips, EN/RU, "Reset to default".
  - **Answer key** — 5 axes × 11 cells (code/band/position/descriptor/framing), EN/RU.
  - **Cognitive Profiles** (`/admin/assessments`) — rebuilt as a 5-axis interpretive explorer
    (sliders → live answer-key descriptor + framing, signature, EN/RU). Old 4-axis report-preview dropped.
  - **Results** — default view is a **ReNo v1.1** placeholder; legacy MBTI tables archived behind
    a **"v1.0 archive"** toggle (kept, not deleted).

## Key architecture decision — v1/v2 decoupling (prod-safe)
The new bank is a **format change** (forced-choice → Likert), so the **live test was NOT flipped**.
- `/reno` + `/api/reno/questions` + `renoScore.ts` still read the **legacy 4-axis bank** (import
  `questions.v1-4axis.json`, Redis key `psyid:questions`). Verified live: `/api/reno/questions`
  returns 94 items with `options` (old shape).
- Admin manages the **new v2 bank** separately: `/api/admin/questions` uses key
  **`psyid:questions:v2`** (fallback = bundled `questions.json`), with GET/PUT/DELETE(reset).
- So nothing a real test-taker touches changed yet.

## NOT done — next steps (both behavior-changing, paused for go-ahead)
- **Phase 5 — flip the live test.** Rewrite `renoScore.ts` for Likert (reverse-aware → 0–100 →
  band → signature), rebuild `/reno` as an agree-scale, point it at `psyid:questions:v2`, update
  score consumers (`api/client/results`, `api/admin/results`, `api/admin/dashboard`,
  `lib/report-generator/*`, `app/results/*`) + retire old `profiles.ts`. This is what makes the
  Results "v1.1" tab start filling.
- **Phase 6 — bilingual EN/RU** across the whole public site (a small `lang.tsx` provider + EN/RU
  dicts + nav toggle). Drop any leftover es/fr/ar. Data is already EN/RU-only.
- Swap placeholder prices/testimonial for real ones.

## Gotchas / notes
- **Next.js 16.2.4 is customized** — read `node_modules/next/dist/docs/` before framework changes
  (per repo AGENTS.md). Server components are default; landing/admin use client where needed.
- **Screenshots**: admin needs auth. Locally, start dev with `ADMIN_SECRET=testsecret` and set
  `localStorage.admin_access_token='testsecret'`; Redis unconfigured → serves bundled data.
- **Infra/creds** (Redis URL, `ADMIN_SECRET`, backend) are in Vercel env + the reno-psyid project
  memory — intentionally NOT in this git-committed file.
- Full plan for the ReNo migration: `~/.claude/plans/humble-snuggling-lobster.md`.
