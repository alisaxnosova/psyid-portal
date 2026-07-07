# ReNo v1.1 — source of truth

The methodology, question bank, and answer key behind the PsyID assessment. Keep these in sync
with the running data files.

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

## Documents
- `ReNo-Methodology-EN/RU.html` — the v1.1 methodology whitepaper.
- `ReNo-QuestionBank-EN/RU.html` — item format, axis map, scoring key, construction rules.
- `PsyID-Element-Vault.html` — the design system (tokens, radar, signature, band scale).
- `ReNo_Methodology_v1.1.pdf`, `ReNo_QuestionBank_Methodology.pdf` — source PDFs.

## Data (the real, importable content)
- `reno_v1.1_questions.tsv` — 94 normative Likert items (`qid·axis·pole·reverse·en·ru`).
  → imported to `src/app/reno/data/questions.json`.
- `ReNo_AnswerKey_v1.2.xlsx` / `.json` — Interpretive Answer Key, 5 axis tabs × 11 cells
  (`Code·Band·Level·Pole·Position·EN·RU·Framing`). → imported to
  `src/app/reno/data/answer-key.json`.

Schema lives in `src/data/reno-axes.ts`. Languages: **EN + RU only**.
