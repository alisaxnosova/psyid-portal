# Legacy scripts

One-off Python tools (June 2026) that built the original multilingual question set.
They hit the old NestJS backend (`159.194.222.35:3010`) and are **superseded** — kept
for reference only.

- `build_multilingual_csv.py` — built the RU→EN/ES/FR/AR question CSV with Claude-written
  translations baked in (produced the 5-language `src/app/reno/data/questions.json`).
- `translate_questions.py` — same, but via Google Translate.
- `export_questions_to_sheets.py` — pushed questions from the API into a Google Sheet.

**Use instead:** `scripts/export-questions.mjs` (exports the live, admin-edited questions
straight from Redis/JSON — no old backend required).
