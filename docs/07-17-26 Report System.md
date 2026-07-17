# 07-17-26 — Report System (scoring · engine · vault · tiers)

Session handoff. Covers the ReNo scoring conformance, the legacy→v1.2 cutover, the new
`report-v2` composition engine, the 32 archetype words, the master Element Vault, and the
three report tiers designed in the new dark "Personality DNA" universe theme.

---

## TL;DR — what shipped

| Area | State | Where |
|---|---|---|
| Band math conformed to methodology §6 | **Done, in prod** | `src/data/reno-axes.ts`, `answer-key.json` |
| Legacy scoring cutover (passport/reports → v1.2) | **Done, in prod** | `src/lib/scoreSessionAuto.ts` |
| `report-v2` deterministic engine (Basic tier) | **Done, in git, not wired to a route** | `src/lib/report-v2/*` |
| 32 archetype words (EN + RU) | **Done, in git** | `src/lib/report-v2/archetypes.ts` |
| Master Element Vault (single source of truth) | **Done, in git** | `docs/reno/Element-Vault-Master.html` |
| 3 report tiers (Basic / Detailed / Full) | **Designed as artifact mocks** — not engine-generated yet | artifact URLs below |

**Artifacts (private, on claude.ai):**
- Master Element Vault → `https://claude.ai/code/artifact/6832bee9-5245-48ec-92f0-9ab7b3f5379c`
- Full report, all 3 tiers, EN/RU → `https://claude.ai/code/artifact/6be27eac-9d80-43fa-98b7-d99ddee344ce`

**Design sources (local, not in repo):**
`~/Downloads/design_handoff_psyid_master/` (00 Design System + Part A marketing + Part B Personality DNA) ·
`~/Downloads/logo-export 3/` (official PsyID logo PNG/SVG exports).

---

## 1. Scoring — band math conformed to §6 (commit `f223b4a`)

The band boundaries had drifted from the frozen §6 spec and were computed in **four**
places that could disagree at an edge. Fixed:
- New single source of truth in `reno-axes.ts`: `bandForIntensity(i)` — `0` balanced `s<8`,
  then `≤20/≤40/≤60/≤80/>80` — plus `classify(axis,pos)`. `toCode()`, the v12 scorer, the
  admin explorer, and `answer-key.cellForPosition()` all route through it.
- Fixed the balanced zone (`<5`→`<8`), a fraction-gap bug (`intensity 5.5` → unbanded), and
  band-edge overlap.
- `answer-key.json` (55 band cells) conformed to §8.5: `"creative disorder"→"creative clutter"`
  (EN); **16 RU cells de-gendered** (masculine short-forms → neutral) per the approved glossary.

**No data migration:** raw answers are the record (§6.3); bands recompute on read.

## 2. Legacy scoring cutover (commit `d10e365`)

Portal passport (`/api/client/results`), PDF report, and career-report scored every session
with the legacy 4-axis MBTI engine → a v1.2 Likert session collapsed to all-zeros → **phantom
ESFJ**. Fixed with `src/lib/scoreSessionAuto.ts`:
- `isV12Session(s)` — detect engine by answer shape (`'1'..'5'` vs `'a'/'b'`).
- `renoScoreV12ToLegacy(v12)` — adapter mapping the five-axis score → legacy `RenoScore` shape.
  Axes map 1:1: **O↔E, C↔S, L↔T, D↔J**; **ER (Steady/Reactive) is dropped** (legacy report is
  four-axis). Tie-breaks + near-boundary match the legacy scorer exactly.
- `scoreSessionAuto(s)` — the three routes changed one line each.
- Detection predicate **deduped**: admin/results + dashboard import the shared `isV12Session`.
- **Out of scope:** `/results` = legacy NestJS `?id=` viewer via `renoApi`, not on this path.
- Report *content* is still the legacy 4-axis format — only the scoring input was corrected.
  The methodology-native report is `report-v2` (§3).

## 3. `report-v2` — deterministic composition engine (`src/lib/report-v2/`)

**The answer to "how do you standardize a 20-page report across test takers": compose, don't
generate.** A report is a **pure function** `render(positions, contentVersion, tier, lang)` —
same profile → byte-identical output, no LLM, no randomness. Personalization is the *selection*
of pre-authored, versioned cells by measured band, never generation (this is what §7.5
falsifiability + §9.2 versioning require).

- `content.ts` — `ContentCell` schema (atomic, versioned unit) + L1 source adapting the 55
  authored `answer-key.json` band cells.
- `types.ts` — `ComposedReport`/`Section`/`Block` (presentation-free).
- `compose.ts` — `composeReport()`; Basic tier = L0 identity + L1 axes. `CONTENT_VERSION`.
- `render-html.ts` — deterministic HTML (currently **neutral/minimal** — the dark-universe
  styling in the artifacts is NOT yet in here; see Next steps).
- `archetypes.ts` — the 32 words (§4).
- `index.ts` — `positionsFromV12()`, `reportKey()` (cache key **by profile**, not session).

Verified end to end (composes the whitepaper sample W2·A4·V3·F4·S2 in EN+RU; same profile →
identical HTML; same cache key across holders). `tsc`+`eslint`+`build` green.
**Not yet wired to any route** — dormant lib.

## 4. The 32 archetype words — the report title / brand hook (`archetypes.ts`)

Every profile resolves to **one word**, the report's title, formatted as the brand mark
**`Word.`** (trailing period, gold on the dark hero). Derived: the dominant pole of each of the
5 axes → a 5-letter code (`O/W·C/A·L/V·D/F·S/R`), one of 2^5 = 32 words.
- **EN is final** (the merch wording: Relentless / Kinetic / Unbothered included).
- **RU is filled for all 32 (draft)** — `Командующий … Созерцатель … Идеалист`. Needs sign-off;
  some choices are debatable (`Кинетик`, `Искрящий`, `Окрылённый`, `Ликующий`).
- Sample used throughout: **WAVFS → "Contemplative." / "Созерцатель."**

## 5. Master Element Vault (`docs/reno/Element-Vault-Master.html`)

Single source of truth merging the old ReNo v1.2 vault + the new 5-axis handoff, **retiring the
passport/document metaphor** in favour of the universe + node detail cards. Dark specimen shell
(`#16141D`), left sidebar, full-width, the **real exported PsyID logo (PNG)**.
- **Tokens reconciled** (canonical `00` + shipping code win): axis hues
  `#2244E0·#6A85F0·#8A5CD6·#FF7A3D·#FF5A5A`, paper `#F6F1EA`, ink `#0E1230`, UI gold `#FFC074`,
  **star-gold `#EBD98A`** kept separate. The Part B README's `#3A63F0/#F1EADD/#EBD98A` are
  superseded (noted in the vault).
- Logo wordmark is **Space Grotesk** (not the UI's Geist); mark = pentagon + 5 axis dots.

## 6. The three report tiers (dark "Personality DNA" universe)

Designed as artifact mocks of the sample profile, bilingual (EN/RU toggle), subtle 130-dot
starfield (the DNA `twk` technique), dark glass cards. **Tiers = layer subsets (§8.4).**

- **Basic** — identity (`Word.` + definition + signature) + the five axes as **Core (axis)
  detail cards** (spectrum thumb at `clamp(50%, 50 + s·0.46, 96%)`, band pill + band-word note).
- **Detailed** — + **Shadow Self**: Growth Edge (gold north-star, the least-practised pole) +
  **Black Holes** (event-horizon orbs). Band-gated (only bands 4–5 earn one; sample got A4+F4,
  capped 2–3), adult 18+, frank per the `docs/2026-07-16-black-holes-shadow-traps.md` draft
  (behaviour-and-cost, no clinical vocab).
- **Full** — + **Professions (RIASEC × PsyID)** 6 match cards (fit 91→71, reason + per-axis
  chips + fit bar) + **Action plan** (3 moves: lean-in / work-the-edge / watch-the-trap).

⚠️ **These are hand-authored mocks of ONE sample profile — not engine-generated.**

---

## Open decisions (blocking full engine wiring)

1. **Band words** — design `в балансе · лёгкий наклон · заметный наклон · выраженный · сильный ·
   очень сильный` vs code `Сбалансированный · Лёгкий · Умеренный · Выраженный · Сильный ·
   Максимальный`. Pick one → align `reno-axes.ts` + memory `reno-language-standards`.
2. **Axis names** — design `Энергия/Информация/Решения/Структура/Реакция` vs code
   `Направленность энергии/Фокус восприятия/…`. Same.
3. **RU register on the 55 answer-key cells** — currently impersonal 3rd-person
   (`Предпочитает…`); reports must address the reader **Вы + plural** (`Предпочитаете…`). The
   tier mocks already use the corrected register for the 5 sample cells; the other 50 await the
   batch. (Gender-neutral by construction — plural doesn't mark gender.)
4. **32 RU words** — sign off / refine the draft translations.

## Next steps (a build session of its own)

1. **Wire the tiers into `report-v2`.** Author the new content layers as versioned data keyed by
   profile, exactly like the 55 axis cells already are:
   - L2 archetype (done — `archetypes.ts`),
   - L4 growth-edge + black-holes (band-gated, per-axis-pole, adult-only),
   - L5 professions (compute profile→RIASEC→top-N; authored rationales),
   - L7 action plan.
2. **Port the dark-universe design into a real renderer** — either `render-html.ts` (currently
   neutral) or a `@react-pdf` / portal renderer, so every profile generates the artifact look.
3. Resolve the terminology conflicts (1–2 above), then align `reno-axes.ts`.
4. Batch the RU register fix across all 55 cells (show before/after per the earlier agreement).

## Environment / gotchas

- **Concurrent brand session** was committing on a loop this session (`feat(brand): …` commits
  `4647bf3`→`b40c13c`: starfield, pricing, footer, universe rebrand). It runs `git add -A`, so
  it **swept `report-v2` + the master vault into its commits**. Two agents on one working tree =
  collision risk. Stage explicitly (never `git add -A`) and expect the tree to look "clean"
  because the other loop grabbed your files.
- Commit trail this session: `f223b4a` (band §6) · `d10e365` (cutover) · `7af59fb` (report-v2,
  mixed with brand WIP by the loop) · plus RU-archetypes + master-vault-logo commits.
- Sample profile for all mocks: **W2·A4·V3·F4·S2 → "Contemplative." / "Созерцатель."**

Relates to [[project_reno]], [[reno-language-standards]].
