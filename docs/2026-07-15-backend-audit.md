# 2026-07-15 — Backend audit, archive map & connectivity

Snapshot after the ReNo v1.1 flip. Purpose: confirm the backend is clean, everything is
connected, and old versions are accounted for (what's archived vs. what's still load-bearing).

## 1 · Live pages — all reachable (HTTP 200 on psyid.me)

**Public:** `/` · `/reno` · `/login` · `/register` · `/forgot-password` · `/methodology` ·
`/pricing` · `/portal` · `/results` · `/results/report`
**Admin:** `/admin/login` · `/admin` (+ shell pages below)

Nav/footer links (`PsidNav`, `PsidFooter`) point only to real routes: `/`, `/reno`, `/login`,
`/register`, `/portal`, `/methodology`, `/admin/login`. **No broken links.**

## 2 · Scoring & data — v1.1 is live, v1.0 is archived

| Concern | v1.1 (LIVE) | v1.0 (legacy) |
|---|---|---|
| Question bank | `src/app/reno/data/questions.json` (94 Likert, Redis `psyid:questions:v2`) | `questions.v1-4axis.json` (Redis `psyid:questions`) — **archived, unused by the live test** |
| Scorer | `src/lib/renoScoreV11.ts` | `src/lib/renoScore.ts` |
| Answer key | `answer-key.json` / `answer-key.ts`, `src/data/reno-axes.ts` | `profiles.ts`, `src/data/reno.ts`, `content/descriptions.json` |

Sessions are auto-detected by answer shape (`'1'..'5'` = v1.1; `'a'/'b'` = legacy) and scored
with the matching engine everywhere it matters (admin results + dashboard done this session).

## 3 · ⚠️ Old versions that CANNOT be archived yet (still imported)

These are legacy but still load-bearing for the **reporting stack that hasn't been cut over**:
`profiles.ts`, `reno.ts`, `descriptions.json`, `renoScore.ts`, `questions.v1-4axis.json`.

Consumers still on legacy scoring: `/results` (legacy NestJS `?id=` page), `/api/client/results`
(portal passport), `report-generator/*`, `report-preview`, `career-report`. **Physically moving
these files now would break the build.** They can be moved into an archive folder only *after*
the reporting cutover (tracked task). Until then they stay in place, clearly labelled legacy.

## 4 · Dead / placeholder pages (no functionality; not duplicates)

- `admin/report-templates` — **orphaned** (not in the sidebar), "coming soon" placeholder.
- `admin/analytics`, `admin/assessment-analytics` — roadmap placeholders (feature cards, no data).
- `/results` (public) — legacy NestJS attempt page, **not linked from the current Redis flow**;
  retire it alongside the portal/passport revamp.

None were deleted (they're harmless roadmap stubs and low-risk); flagged here for a deliberate
decision rather than a silent removal.

## 5 · Verified clean

- `npm run build` green · `tsc --noEmit` clean.
- No `.env`/secret files tracked in git (`.env.local` is gitignored).
- Prod Redis: 13 codes (11 portal / 2 external); portal freezes reset 2026-07-15 so all portal
  users can retake v1.1; participant sequence `E` at 1 (your external test), `P` unstarted.

## 6 · Recommended next (in order)

1. **Reporting cutover** — move `/api/client/results` + portal passport + `report-generator`
   onto `renoScoreV11`; then physically archive the §3 legacy files into `docs/legacy/`.
2. Retire the legacy `/results` page with the passport revamp.
3. Decide keep/remove for the `admin` placeholder pages.
