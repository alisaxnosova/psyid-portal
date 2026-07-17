# Personality Universe — portal visualization handoff

**Date:** 2026-07-17 · **Product:** PsyID subscriber portal (the paid product) · **Methodology:** ReNo 2.0 · **Language:** Russian (shipping)

This documents the interactive "Personality Universe" — the logged-in home where a subscriber explores their personality as a living 3D galaxy. It replaces the older static "Personality DNA" template. Two files were produced in this session; both are self-contained HTML you open in a browser.

---

## 1. Files

| File | What it is | Status |
|---|---|---|
| `mockups/personality-universe.html` | **The chosen direction** — the portal candidate. Elevated "Concept A" (deep-zoom galaxy) with drill-down, detail cards, the exploration/unlock loop, and the time-spiral. | Working, iterating |
| `mockups/personality-universe-concepts.html` | 3-concept comparison gallery (tabs): **A Погружение** (deep-zoom), **B Линзы** (context lenses), **C Атлас** (flat star-chart). Used to pick a direction. | Reference only |
| `mockups/personality-portal.html` | Pre-existing older mockup. | Untouched |

**Reference (not in this repo, provided as context):** `PsyID Personality DNA.html` (original template), `ReNo-2.0-Methodology-EN/RU.html` (the whitepaper — source of truth for constructs), `PsyID-Marketing-Strategy-EN/RU.html` (the celestial vocabulary + shadow framing), `PsyID — Vision · Passport to Universe.html`.

**Tech:** vanilla JS + hand-rolled 2D-canvas 3D projection. **No React, no build step, no CDN except Geist/Geist Mono fonts.** This was deliberate so it ports cleanly into the real Next.js portal (`src/app`) later, driven by real scores.

---

## 2. How the user reached this direction

- Asked for 3 mockups → picked **Concept A** ("Погружение", deep-zoom galaxy).
- Wanted: (a) **zoom into any node to uncover the next layer**, (b) **click any node → a description card** like the reference, (c) a **dreamier** look, (d) crucially — the universe must **feel deliberately unfinished**, with **mini-tests as the way to "unlock"/light up more of yourself** (the core paid-product loop).
- Then: removed RIASEC/values modules (copyright concern), softened the card blur/dim, made the drill transition slick, and reorganized the time-sessions so they integrate into the galaxy instead of dangling as a tail.

---

## 3. The visual model (what maps to what)

Drill hierarchy: **Вселенная → ось (система) → фасета → нюансы.** Tap a node → card → «Погрузиться» dives a level deeper. Breadcrumb (top) + **Esc** climb back up.

| Methodology construct (ReNo 2.0) | Visual | Notes |
|---|---|---|
| 5 axes (§3) | **Core stars** (pentagon, per-axis hue) | Always lit — the fixed core from the base test. Size/distance = f(score). |
| Facets (§4.1) | **Planets** orbiting an axis star | Lit = measured; **dashed/dim = "в дымке" (estimated from base test)**. |
| Nuances (§4.2) | **Moons** around a facet | Crisp = «в фокусе» (refined); dashed = «в дымке» (estimated). |
| Shadow self / failure mode (§8.5) | **Black hole** at the edge of an over-extended axis's system | Band-gated: only axes at band ≥ 4 get one. Card carries the failure-mode text + "event horizon" reassurance. |
| Longitudinal sessions / retests (§7.4) | **Gold spiral** inside the galaxy disk | Each = one full re-test snapshot. Newest = "now" near core & brightest; older wind outward & fade. Tap → snapshot code + «что изменилось» diff. |
| Thematic modules/reports (§8.4) | **Constellations** hanging off an axis | Locked = dashed "+"; done = lit. Unlock via mini-test. |
| Profile code + bands (§6) | Mono code `W2·A4·V3·F4·S2`, band digit on stars | Raw 0–100 is the record; band is display only. |
| Center | White **"ядро · это ты"** | The person; card shows profile name + code. |

**Dreaminess:** layered **nebula background** (tints to the axis hue as you descend) + additive **glow bloom** on lit nodes + ambient central glow + twinkling starfield + dust.

---

## 4. The exploration / unlock loop (the heart of the paid product)

The universe is **deliberately unfinished**. Growth has two directions:
- **Breadth** = light up more facets / nuances / modules.
- **Depth** = the yearly retests (the gold spiral) — see what changed.

Mini-test tiers (each CTA actually fires in the mockup — node ignites with a pulse, children appear, the **«Исследовано NN%»** ring in the nav ticks up, a toast pops):

| Layer | Starts as | Mini-test | Result |
|---|---|---|---|
| Оси | always lit | — | the fixed core |
| Созвездия/модули | locked | «Пройти мини-тест · 5–7 мин» | constellation ignites |
| Фасеты | «в дымке» | «Уточнить фасету · 4 мин» | planet brightens + spawns nuance-moons |
| Нюансы | «в дымке» | «Навести резкость · 2 мин» | moon sharpens to «в фокусе» |

Framing rule (from marketing strategy): paying = **lighting up more of yourself**, never a paywall.

---

## 5. Interactions

- **Drag** = rotate. **Wheel/pinch** = zoom. **Tap node** = detail card. **Tap empty / ✕ / Esc** = close card.
- **«Погрузиться»** button on a card = drill into that node's system.
- **Breadcrumb** (Вселенная › Ось › Фасета) or **Esc** = climb up.
- **Drill transition:** an anchored **cross-dissolve dive** — the old level flies *into the tapped star's screen position* and dissolves while the new level fades up simultaneously (no black frame). Camera is frozen during the move so nothing jumps. Ascend pulls back out. Easing = `easeInOutCubic`; speed dial = `trans+=0.028` in `frame()`.
- **Card open:** universe stays sharp (scrim blur removed) and barely dims (0.72) — the tapped node just gets a ring. Per user request.

---

## 6. Sample data (all in `personality-universe.html`)

- **Profile:** «Лиза Морозова», code **W2·A4·V3·F4·S2** (the `reflective` profile).
- **Axes/facets:** `var AXES` — 5 axes, each with 4 facets + nuances, RU descriptions. Facet set follows whitepaper Table 2.
- **Modules:** `var MODULES` — currently **«Энергия · и выгорание»** and **«Стиль · в команде»**, both **locked**. (RIASEC «Интересы» and «Ценности в работе» were **removed** — see §7.)
- **Sessions:** `var SESSIONS` — 4 dated snapshots, each with its own code + note; newest flagged `latest`.
- **Shadow text:** `var SHADOW` — failure-mode copy for the band-4 axes (info, structure).
- **State (mutable):** `var ST = {facet, nuance, module}` — what's measured/focused/done. `coverage()` computes the %.

---

## 7. Key decisions & fixes this session

- **Removed RIASEC + "Ценности в работе" modules** — user flagged public RIASEC references as a copyright/trademark risk. Grep confirms **0 RIASEC mentions** left in the portal file. (The Decision-axis pole «Ценности» is a core axis and stays.) *If a lit example module is wanted later, add a neutral, non-infringing one — do not name Holland/RIASEC in consumer-facing copy.*
- **Fixed a render-killing bug:** `nodes = universeNodes()` ran before `var CR = 200` was assigned (hoisting) → all coords `NaN` → `createRadialGradient` threw every frame → only the center node drew + heavy lag. Fixed ordering; added a silent `isFinite` guard in `renderSet` so a stray NaN can never blank the galaxy again.
- **Softened card scrim** (no blur) and node dim, per feedback.
- **Reworked drill transition** into the anchored cross-dissolve (§5).
- **Reorganized gold sessions** from a "tail" into an in-disk spiral arm (§3).

---

## 8. What's still missing from the methodology (recommended next steps)

1. **Контекстные линзы / frame-of-reference layer (§5)** — *the biggest gap and the product's differentiator.* The same universe shifts per life-sphere (Работа / Отношения / Семья / Стресс) as **deltas from baseline** with a ghost trail ("твоя вселенная сдвигается, когда ты входишь в офис"). Demoed in Concept B of the concepts file; **not yet in the portal.** Recommended: a lens toggle at top.
2. **Зона роста / growth edge (§8.5)** — distinct from the shadow black hole: the least-developed *opposite* pole, framed constructively. Quick add (marker on the weakest axis + card).
3. **Session "rewind"** — tap a past gold session → the universe morphs to that snapshot with a ghost of "now" overlaid. The literal "watch yourself change." Natural next step for the time-spiral.
4. Minor/optional: if-then behavioral signatures on refined nuances; a proper "в балансе" (band 0) treatment; confidence/error band (partly covered by hazy/focus).

Priority: **lenses → growth edge → rewind.**

---

## 9. Running & verifying

- **Open:** double-click the HTML, or `open "mockups/personality-universe.html"`.
- **Headless smoke test** (no browser window; the image-preview Read prompts, so verify via console instead):
  ```bash
  CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
  "$CHROME" --headless=new --disable-gpu --enable-logging=stderr --v=1 \
    --window-size=1400,900 --virtual-time-budget=1600 \
    --screenshot=/tmp/pu.png "file://$PWD/mockups/personality-universe.html" 2>/tmp/pu.log
  grep -cE 'CONSOLE.*(Uncaught|TypeError|BAD)' /tmp/pu.log   # expect 0
  ```
  A canvas-content probe (inject `getImageData` + a draw counter, log to console) confirms node counts without opening the image.

---

## 10. Porting notes (into the real Next.js portal)

- Drive the 3D from **personality scores**, never pixel coordinates — distance-from-center and node size are `f(score)`. The engine math is portable (plain 2D canvas + manual projection; can stay vanilla or move to three.js/r3f).
- Keep it an isolated client component; respect `prefers-reduced-motion` in production (freeze rotation/twinkle — not handled in the mockup).
- Self-host Geist / Geist Mono (mockup uses Google Fonts CDN).
- Axis hues carry meaning — keep them exact: `#3A63F0 #6A85F0 #8A5CD6 #FF7A3D #FF5A5A`; gold sessions `#EBD98A`.
- Shipping language is Russian; structure for a later EN locale.
- ⚠️ This repo's Next.js has breaking changes from stock — read `node_modules/next/dist/docs/` before writing portal code (see repo `AGENTS.md`).
