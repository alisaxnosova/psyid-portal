# Legacy archive

Superseded code kept for reference. Nothing here is compiled or imported — files carry a
`.bak` extension because `tsconfig.json` includes `**/*.tsx` globally, so a live `.tsx`
extension here would still be typechecked.

| File | Superseded by | Archived | Why |
|---|---|---|---|
| `Landing.tsx.bak` | `src/components/landing/SiteLanding.tsx` | 2026-07-15 | The old homepage. Dead code — `src/app/page.tsx` renders `SiteLanding`. Also carried MBTI trademark copy and the legacy 16-type names (`'I,S,F,J': ['Guardian', …]`), which the ReNo Methodology v1.2 whitepaper (§02 IP, §04 naming discipline) forbids on public surfaces. |
| `pricing-page.tsx.bak` | — (nothing yet) | 2026-07-15 | Was live at `/pricing` but linked from nowhere. Described a **superseded 7-axis model** ("Карта 7 осей", "индекс напряжения", "компенсаций") that does not exist in ReNo v1.2, plus an MBTI comparison. Could not be corrected without inventing tier claims — the tension/compensation features aren't in the whitepaper. **Rebuild from scratch when real prices/tiers exist** (current $4.99/$49.99 are placeholders). Restore with: `git mv docs/legacy/pricing-page.tsx.bak src/app/pricing/page.tsx`. |

## Still-live legacy (NOT archivable yet)

These are legacy but **still imported** by the reporting stack, which has not been cut over
to `renoScoreV12`. Moving them breaks the build. Archive them only after that cutover:

`src/lib/renoScore.ts` · `src/app/reno/data/questions.v1-4axis.json` ·
`src/app/reno/data/profiles.ts` · `src/data/reno.ts` · `src/content/descriptions.json`

Consumers still on legacy scoring: `/results` (legacy NestJS `?id=` page),
`/api/client/results` (portal passport), `report-generator/*`, `report-preview`,
`career-report`. See `docs/2026-07-15-backend-audit.md`.
