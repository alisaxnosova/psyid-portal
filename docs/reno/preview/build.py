#!/usr/bin/env python3
"""Build the standalone ReNo v1.1 preview.

Inlines the real, already-created v1.1 content into a single self-contained HTML
file — no external requests, no app/bundler deps. Sources of truth:
  - src/app/reno/data/questions.json   (94 Likert items)
  - src/app/reno/data/answer-key.json  (5 axes x 11 interpretive cells)

Run from anywhere:  python3 docs/reno/preview/build.py
Output:             docs/reno/preview/reno-v1.1-preview.html
"""
import json, pathlib

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[2]  # repo root (docs/reno/preview -> repo)

questions = json.loads((ROOT / "src/app/reno/data/questions.json").read_text("utf-8"))
answer_key = json.loads((ROOT / "src/app/reno/data/answer-key.json").read_text("utf-8"))

assert len(questions) == 94, f"expected 94 questions, got {len(questions)}"
for code in ("EO", "IF", "DB", "SP", "ER"):
    assert code in answer_key, f"answer key missing axis {code}"

data = {"questions": questions, "answerKey": answer_key}
# compact JSON, safe to embed inside <script type="application/json">
payload = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

template = (HERE / "_preview.template.html").read_text("utf-8")
assert "__RENO_DATA__" in template, "template marker missing"
out = template.replace("__RENO_DATA__", payload)

dest = HERE / "reno-v1.1-preview.html"
dest.write_text(out, "utf-8")
print(f"wrote {dest.relative_to(ROOT)}  ({len(out):,} bytes, {len(questions)} items)")
