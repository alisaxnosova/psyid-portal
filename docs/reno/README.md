# ReNo v1.2 — source of truth

The methodology, question bank, and answer key behind the PsyID assessment. Keep these in sync
with the running data files.

> **Version note (2026-07-15).** The current methodology is **v1.2**. v1.1 was never released —
> it was revised into v1.2 — so the codebase, the live `/reno` test, and the public site all say
> **v1.2**. The v1.1 documents in this folder are kept as **superseded source artifacts** and are
> deliberately *not* relabelled (renaming a v1.1 document to "v1.2" would misrepresent it).
> ⚠️ **Add `ReNo_Methodology_v1.2.pdf` here** — it is the authoritative whitepaper and is not yet
> in the repo. The Answer Key was already v1.2, which is why the live scoring conforms.

## Model
Five axes, each scored on a continuous **position 0–100** (100 = the reference/plus pole,
50 = balanced). Intensity = `|position − 50| × 2`, bucketed into **bands 0–5** (display only —
store and analyse the continuous position). A profile reads as a signature, e.g. `W2·A4·V3·F4·S2`.

| # | Axis | Code | + pole (100) | − pole (0) |
|---|------|------|--------------|------------|
| 1 | Energy Orientation | EO | O Outward | W Inward |
| 2 | Information Focus | IF | C Concrete | A Abstract |
| 3 | Decision Basis | DB | L Logic | V Values |
| 4 | Structure Preference | SP | D Ordered | F Flexible |
| 5 | Emotional Response | ER | S Steady | R Sensitive |

Axis 5 (ER) never appears in the 4-letter headline type — it only colours guidance.

**On the ER minus pole:** the v1.2 whitepaper's code appendix formally names it `R — Reactive`,
while its ethics section (§13) prescribes the strengths-based frame **“Sensitive ↔ Steady”** and
bans *neurotic / unstable / anxious*. We surface **Sensitive** (matching the Answer Key); the pole
letter `R` is unchanged, so codes stay identical.

## Documents
- `ReNo-Methodology-EN/RU.html` — **v1.1, superseded** by the v1.2 whitepaper.
- `ReNo-QuestionBank-EN/RU.html` — item format, axis map, scoring key, construction rules (v1.1).
- `PsyID-Element-Vault.html` — the design system (tokens, radar, signature, band scale).
- `ReNo_Methodology_v1.1.pdf`, `ReNo_QuestionBank_Methodology.pdf` — superseded source PDFs.
- `ReNo_Methodology_v1.2.pdf` — **the current whitepaper (missing — please add).**

## Data (the real, importable content)
- `reno_v1.1_questions.tsv` — 94 normative Likert items (`qid·axis·pole·reverse·en·ru`).
  → imported to `src/app/reno/data/questions.json`.
- `ReNo_AnswerKey_v1.2.xlsx` / `.json` — Interpretive Answer Key, 5 axis tabs × 11 cells
  (`Code·Band·Level·Pole·Position·EN·RU·Framing`). → imported to
  `src/app/reno/data/answer-key.json`.

Schema lives in `src/data/reno-axes.ts`. Languages: **EN + RU only**.
