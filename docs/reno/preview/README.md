# ReNo v1.1 — standalone test preview (dummy)

A **self-contained, single-file** run of the whole new **ReNo v1.1 five-axis Likert** test, built for
review/approval **before** anything on prod changes. Open
[`reno-v1.1-preview.html`](reno-v1.1-preview.html) directly in a browser — no server, no build, no
network, no access code. Nothing here touches the live `/reno` test or any live data.

## What it is
- **Full end-to-end flow:** disclaimer → data consent → optional intake → **94-item Likert test**
  (one shared 5-point agree scale) → **results** (pentagon radar, 4-letter type, full signature
  `O3·A5·V3·D5·S1`, per-axis band descriptor + framing). **EN/RU** toggle throughout.
- **Dev quick-fill** (bottom-right ⚡): fills a distinctive random profile and jumps to results, so the
  results screen can be reviewed without answering all 94.
- Uses the **already-created** v1.1 content, not new questions:
  - 94 items from `src/app/reno/data/questions.json`
  - interpretive answer key from `src/app/reno/data/answer-key.json`
  - axis schema/colours from `src/data/reno-axes.ts` + the `.psid-site` Element Vault tokens.

## Scoring (ReNo v1.1 — QuestionBank §05)
Response `r` = 1–5. `value = reverse ? (5−r)/4 : (r−1)/4` → `X = mean(values)×100` →
`intensity = |X−50|×2` → descriptor = the answer-key cell whose `[posMin,posMax]` contains `X`.
The 5 cell codes form the signature; the 4 non-ER axes form the headline type (ER colours guidance
only). Note: because ~half the items on each axis are reverse-keyed, answering the *same* number on
every item correctly scores as **balanced** — that is the intended property of a normative scale.

## Regenerate
The HTML is generated — edit the template, not the output:
```
python3 docs/reno/preview/build.py    # _preview.template.html + JSON data -> reno-v1.1-preview.html
```

## Status / next
This is the **dummy for approval only**. After sign-off, the approved flow gets ported into the real
app (passover "Phase 5": Likert `renoScore.ts`, `/reno` rebuilt on the v2 bank, score consumers
updated). The legacy 4-axis test is preserved at git tag **`legacy/reno-v1.0-4axis`** and stays live
until that flip.
