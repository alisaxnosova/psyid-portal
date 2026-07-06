"""
Fetches questions from the ReNo API and outputs a multilingual CSV
with Russian (original) + English, Spanish, French, Arabic translations.
"""

import csv
import json
import time
import urllib.parse
import urllib.request

API_URL = "http://159.194.222.35:3010/api/methodologies/testpersonal"
OUTPUT   = "/Users/alisanosova/Desktop/reno_questions_multilingual.csv"
LANGS    = [("en", "English"), ("es", "Spanish"), ("fr", "French"), ("ar", "Arabic")]


def translate(text: str, target_lang: str) -> str:
    if not text.strip():
        return ""
    url = (
        "https://translate.googleapis.com/translate_a/single"
        f"?client=gtx&sl=ru&tl={target_lang}&dt=t&q={urllib.parse.quote(text)}"
    )
    try:
        with urllib.request.urlopen(url, timeout=10) as r:
            data = json.loads(r.read())
        return "".join(part[0] for part in data[0] if part[0])
    except Exception as e:
        print(f"  [warn] translation failed ({target_lang}): {e}")
        return text


# ── Fetch questions ────────────────────────────────────────────────────────

print("Fetching questions from API...")
with urllib.request.urlopen(API_URL) as resp:
    data = json.loads(resp.read().decode())

questions = data["versions"][0]["questions"]
print(f"  {len(questions)} questions found.")

# ── Collect all unique texts to translate ─────────────────────────────────

unique_texts = set()
for q in questions:
    unique_texts.add(q["text"])
    for opt in q["options"]:
        unique_texts.add(opt["text"])

print(f"  {len(unique_texts)} unique texts to translate into {len(LANGS)} languages...")

# ── Translate all unique texts (with cache) ───────────────────────────────

cache: dict[str, dict[str, str]] = {}
total = len(unique_texts) * len(LANGS)
done  = 0

for text in sorted(unique_texts):
    cache[text] = {}
    for lang_code, lang_name in LANGS:
        done += 1
        print(f"  [{done}/{total}] {lang_name}: {text[:50]}...", end="\r")
        cache[text][lang_code] = translate(text, lang_code)
        time.sleep(0.05)  # be polite to the API

print(f"\n  Translation complete.")

# ── Build CSV rows ────────────────────────────────────────────────────────

max_opts = max(len(q["options"]) for q in questions)

def opt_headers(i: int) -> list[str]:
    letter = chr(ord("A") + i)
    base = [f"Option {letter} Code", f"Option {letter} Text (RU)"]
    for _, lang_name in LANGS:
        base.append(f"Option {letter} Text ({lang_name})")
    base += [f"Option {letter} Key", f"Option {letter} Score"]
    return base

headers = ["#", "Question Code", "Question Text (RU)"]
for _, lang_name in LANGS:
    headers.append(f"Question Text ({lang_name})")
for i in range(max_opts):
    headers += opt_headers(i)

rows = [headers]

for q in questions:
    row = [q["order"], q["code"], q["text"]]
    for lang_code, _ in LANGS:
        row.append(cache[q["text"]][lang_code])

    for opt in q["options"]:
        key_scores = opt.get("keyScores", [])
        key_code = key_scores[0]["key"]["code"] if key_scores else ""
        score    = key_scores[0]["score"]       if key_scores else ""
        row.append(opt["code"])
        row.append(opt["text"])
        for lang_code, _ in LANGS:
            row.append(cache[opt["text"]][lang_code])
        row += [key_code, score]

    while len(row) < len(headers):
        row.append("")
    rows.append(row)

# ── Write CSV ─────────────────────────────────────────────────────────────

with open(OUTPUT, "w", newline="", encoding="utf-8-sig") as f:
    csv.writer(f).writerows(rows)

print(f"\nSaved {len(rows)-1} rows to:\n{OUTPUT}")
