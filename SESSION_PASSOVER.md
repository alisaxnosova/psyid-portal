# Session Passover — PsyID Career Compass

_Last updated: 2026-07-05_

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
