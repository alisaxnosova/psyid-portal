# 07-16-26 Reno Flip

Session handoff. Everything below is **live on psyid.me** unless marked otherwise.

**Deploy pipeline:** `npm run build` → `git push alisa master` → `vercel deploy --prod --yes`
(master auto-deploys; explicit deploy used throughout). Authorized to ship without asking.

---

## ✅ Shipped this session

### 1. The live test is now ReNo v1.2 (was still the legacy 4-axis test)
- `/reno` rebuilt as a React port of the approved preview: Element Vault paper aesthetic,
  constellation mark, **EN/RU only** (es/fr/ar dropped), **5-point Likert agree-scale** over the
  94-item five-axis bank.
- `/api/reno/questions` now serves the **v2 bank** (`psyid:questions:v2` → bundled `questions.json`).
  Answers stored as Likert `'1'..'5'`.
- New scorer **`src/lib/renoScoreV12.ts`** — reverse-aware → position 0–100 → band → signature.
- All backend plumbing preserved (validate → session → answers-with-retries → resume → intake →
  complete). Deterministic question interleave so axes don't clump and resume stays stable.
- **Verified:** coherent max-plus responder → `OCLD`, max-minus → `WAVF`, all-neutral → 50/balanced.
- Legacy `renoScore.ts` deliberately kept — the reporting stack still imports it.

### 2. Fixed the phantom ESFJ bug
The legacy MBTI scorer was running on Likert answers → no answer matched an old option → all-zeros
→ **ties to ESFJ every time**. Now `/api/admin/results` + `/api/admin/dashboard` detect v1.2
sessions (answers all `'1'..'5'`) and score with `renoScoreV12`. The admin **Results → ReNo v1.2**
tab is a real table now (was a placeholder); the v1.0 archive shows only genuine legacy rows.

### 3. Research consent + sequential participant IDs
- New **step 3 slide**: research participation — explains demographics, consent/decline.
  Decline → straight to test (no demographics, no ID). Mandatory data-consent unchanged.
- **Participant IDs**: `P-00001` (portal) / `E-00001` (external), gapless via `kvIncr` on
  `psyid:participant-seq:{P|E}`, assigned **on completion**, idempotent.
- **Gated**: only if `researchConsent === true` **AND** ≥1 demographic field present.
- Kept **separate from the still-random access code** — codes stay unguessable (rejected
  sequential codes as enumerable).
- **No backfill** — old-test participants get nothing; sequence starts fresh with v1.2.

### 4. Completion screen branches
Portal user → button to `/portal`. External/Etsy one-time-code → "results sent within 24h, you may
close this page." Uses the existing `isPortal` flag.

### 5. Cooldown + prod freeze reset
Portal retake cooldown **1yr → 6 months**. **All 11 portal codes reset** in prod Redis
(status `UNUSED`, `used_at` null) so everyone can retake v1.2 — incl. Alisa's `304251`. External
codes untouched. Backup taken before the write.

### 6. v1.1 → v1.2 rename (125 refs, 14 files)
`renoScoreV11.ts`→`renoScoreV12.ts`, schema `'v1.2'`, `.reno-v12` CSS scope, all labels/comments.
Data keys untouched (`psyid:questions:v2`, `questions.v1-4axis.json`). **Genuine v1.1 source docs in
`docs/reno/` deliberately NOT relabelled** — renaming a v1.1 document to "v1.2" would misrepresent it.

### 7. Whitepaper consistency audit
- **Verified conformance**: axes/poles (O/W, C/A, L/V, D/F, S/R), the band↔intensity table, and the
  signature all match the v1.2 whitepaper exactly.
- **Removed a live IP violation**: homepage FAQ said *"the first four are the classic MBTI
  dimensions"* — §02 bans trademark use / implying validation transfer. Now "build on Jung's typology".
- **Archived**: `Landing.tsx` (dead old homepage, MBTI copy + 16-type names) and `/pricing`
  (was live, linked from nowhere, advertising a **superseded 7-axis** tension/compensation model).
  Both → `docs/legacy/`. `/pricing` now 404s by design.
- All live routes 200; nav/footer links resolve. See `docs/2026-07-15-backend-audit.md`.

### 8. ER pole renamed + RU glossary approved and applied
- ER minus pole **Sensitive → Reactive** (matches whitepaper appendix). Pole letter `R` unchanged →
  no rescoring.
- **Approved glossary applied live**: `Ориентация энергии`→**`Направленность энергии`** ·
  `Организация`→**`Организация жизни`** · Band 1 `Слабый`(= "weak")→**`Лёгкий`** ·
  `TestPersonal v1`→**`ReNo v1.2`** (a stale product name shipping live in admin, both languages).

### 9. /reno polish
Removed intake Skip button, removed the internal axis marker above questions, orange→blue Element
Vault progress gradient, brighter aura background.

---

## 📄 Deliverables (Google Drive)

| Doc | Status |
|---|---|
| `2026-07-16-reno-glossary-ru-filled` | ✅ **APPROVED** — applied to code |
| `2026-07-16-reno-ru-style-guide` | ❌ **Tone REJECTED** ("babies the user"). Grammar rules (Вы+plural) unaffected |
| `2026-07-15-reno-report-content-library` | 375 keys, 4 layers. Titles + level words prefilled |
| `2026-07-15-reno-descriptors-all-axes` | 55 level words + 32 five-axis combos |
| `2026-07-15-reno-type-descriptors` | 16 four-axis combos (superseded by the above) |
| `2026-07-16 Black Holes — spec for v1.3` | Written, **not yet in the methodology** |

---

## ❌ NOT accomplished — open work, roughly in priority order

### 1. Reporting cutover ← **TOP, and now a live risk**
`/results` (legacy NestJS `?id=`, dead for the Redis flow), **the portal passport**
(`/api/client/results`), and `report-generator/*` **still use the legacy `scoreSession`**.
**I enabled portal retakes this session**, so a portal user who retakes v1.2 will see a rough/legacy
passport. Move them onto `renoScoreV12`.

### 2. Reports are AI-generated per session → cannot be standardized
`report-generator/generateSection.ts` calls the Claude API **at render time**, cached per
**`sessionId`** (`psyid:report:{sessionId}:{lang}`). Two users with an identical signature get
**different reports**. Alisa's requirement is the opposite. Fix: move the LLM to **author-time**
(draft the library once → human review → freeze to JSON → zero AI at render).

### 3. Career vault → 5-axis ← **blocks the 20-page report**
`src/data/career-vault/healthcare.json` (19 industries / 79 functions / **140 occupations**) is still
on the **old MBTI 4-letter schema** (`mbti_fit.high/moderate`). The Level 2 "Where do I fit?" section
(~4–6 pages) can't be authored until this is converted. Decision made: **convert healthcare first**,
then write a career-classification methodology doc (also not started).

### 4. 20-page report content not authored
Current library = **375 keys ≈ 8–10 pages**, not 20. Needs **~900–1,100 keys (~1,800–2,200 strings
EN+RU)**: ~10 fields per axis cell (55 × 10 = 550) + the **entire missing Level 2 layer** (RIASEC,
SDT motivation, career). Plan: author **per-axis batches** (~220 strings each) so batch 1 can be
reviewed before the rest.

### 5. Style guide tone needs a rewrite
Rejected as too soft. New direction: **Black Holes** — frank, named failure modes for adults; kinder
language for Youth only. Spec written (`docs/2026-07-16-black-holes-shadow-traps.md`), **not yet in
the methodology**. ⚠️ **§13 must be EDITED, not just extended** — it currently says the shadow is
"never a deficit", which contradicts adult black holes.

### 6. Russian register is inconsistent (root cause of "bad translation")
Three incompatible registers ship at once:
- `questions.json` — 1st person `я`, 3 items with `(а)` brackets
- `answer-key.json` — 3rd person, gender-neutral
- `descriptions.json` — **68 strings in 3rd-person MASCULINE (`его`)** — the report describes a *man*

Proposed fix (unapproved): address the reader as **Вы** → agreement becomes **plural** → **plural
doesn't mark gender** → `пришёл(а)`→`пришли`, `Вы решительный`→`Вы решительны`. Fixes gender by
construction rather than word-by-word.

### 7. Blocked on assets from Alisa
- **New client portal HTML** (she was going to send it)
- **New logo set** — swap across every live page (admin, client, test, main)
- **Passport flip/stamp animation** — HTML reference from Claude Design

### 8. Housekeeping
- **Legacy files can't be archived until the cutover**: `profiles.ts`, `reno.ts`,
  `descriptions.json`, `renoScore.ts`, `questions.v1-4axis.json`.
- **Orphaned catalogs** (0 imports): `landing.json` (149 keys), `portal.json` (67) — hold stale v1.0
  axis names, MBTI copy, and the `Новая оценка` bug. Recommend archiving.
- **`ReNo_Methodology_v1.2.pdf` is NOT in the repo** — only the superseded v1.1 PDF. Should be added.
- **Admin placeholder pages**: `analytics`, `assessment-analytics`, orphaned `report-templates` —
  roadmap stubs, need a keep/remove decision.
- **Placeholders still in copy**: prices $4.99 / $49.99, testimonial "Daniel R., 34".

---

## Key decisions made (don't re-litigate)

- **Sequential access codes → rejected.** Enumerable = anyone could type `00002` and take someone
  else's test. Participant ID is a separate field on a still-random code.
- **Participant numbering starts fresh** with v1.2. Old-test takers get no number.
- **Pole letters stay O/W** (considered O/I — `I1` reads as `11`; the whitepaper's own §04 bans it).
- **Band 0 stays `Сбалансированный`**, not the whitepaper's `Амбиверт` (ambivert is meaningless on
  Structure or Decision). **Fix the whitepaper, not the code.**
- **The report must be composed, not generated**: ~375 reviewed blocks compose into 161,051 unique
  documents (11 states⁵). Same signature → byte-identical report. No 161k lookup table.

## Prod state at handoff

Redis: **13 codes** (11 portal — all reset to UNUSED; 2 external — still USED).
Participant sequence: **`E` = 1** (Alisa's own external test = `E-00001`), **`P` unstarted**.
Content version stamping (so the paper can reproduce what a participant read) — **proposed, not built**.
