# Phase 6 spec — Card art: style guide + prompt wiring

Goal: the generated card art (178 PNGs at `public/cards/<culture>/<culture>-<id>.png`,
5:7 1024×1440, gitignored, deployed separately) is currently ORPHANED — no code loads it.
Wire every card to its deterministic art slot with graceful fallback, and document the
art style system. `data/art-prompts.json` (184 items) already exists and is committed —
do NOT regenerate or modify it.

## Deliverables

### 1. `docs/ART_STYLES.md` — per-religion art style guide
Read `docs/audit/gen_art_prompts.py` (the generator that produced art-prompts.json) and
`data/art-prompts.json` `_meta`. Document, per culture (greek, norse, egyptian, slavic,
mesopotamian, japanese):
- the style tag embedded in prompts (palette, medium reference, composition rules)
- gender/age handling rules, pose vocabulary, relic/attribute vocabulary
- aspect ratio + resolution contract (5:7, 1024×1440, PNG)
- the negative-prompt default and why
- file-slot naming contract: `public/cards/<culture>/<culture>-<id>.png`
Derive everything from the actual generator + data — invent nothing.

### 2. Art-slot wiring (build-time resolve + runtime fallback)
- In `app/lib/card.ts` (deity cards) and `app/lib/relic-card.ts` (relic cards): resolve
  `image_url` to the deterministic slot path `/cards/<culture>/<culture>-<id>.png`
  (deities; relics use the artifact id slot the generator used — check the `slot` field
  in art-prompts.json items with kind "relic"/"artifact" and match it exactly).
  BUT only when the file exists at BUILD time: `fs.existsSync` in the build-time lib is
  fine (data.ts already does fs at build). When missing → keep current behavior
  (null → letter fallback).
- Runtime robustness: `DeityCard.tsx` currently renders `<img>` with NO onError handler
  (broken-image flash when art is deployed separately and missing). Add the same
  letter-seal onError fallback pattern RelicCard.tsx already uses (see its
  `useState(broken)` + `onError` + `tc-art-fallback`). Apply to DeityCard and any other
  card surface that renders `image_url` (check `app/cards/[id]/page.tsx` print sheet and
  `app/components/FlippableCard.tsx`).
- `image_credit` must stay honest: generated-slot art is NOT archival — when the slot
  path is used, credit should read as the existing "archival reconstruction" fallback or
  a "generated reconstruction" label; do NOT claim a museum institution for generated art.
  Real artwork `image_url` from data keeps its existing credit.
- SSR/hydration-safe: existsSync runs at build (server), not in client components.

### 3. Verify
- `npx tsc --noEmit` → 0 errors
- `npm run build` → exit 0, static export
- `npm run validate` → ✓ no errors
- Quick check: with `public/cards/` present, grep the built HTML for `/cards/greek/` img
  srcs; then temporarily `mv public/cards /tmp/cards-bak`, rebuild, confirm HTML has zero
  `/cards/` img srcs and letter fallbacks instead, then `mv /tmp/cards-bak public/cards`.

## Rules
- No new npm dependencies. Pure React + CSS.
- Do NOT modify data/art-prompts.json or docs/audit/gen_art_prompts.py.
- Do NOT run git add/commit.
- Deterministic builds: no Date.now/Math.random in render path.
