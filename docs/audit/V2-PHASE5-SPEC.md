# PHASE 5 (v2) SPEC — Unique art enforcement + duplicate check + credit note

You are the Phase 5 worker (branch `atlas-v2-2026-10`). Read `docs/PLAN.md` §3 Phase 5. Prior phases landed: card system with 5:7 art boxes (Phase 4), 24 banner slots + prompts (Phase 3), 177/184 card art PNGs on disk. This phase makes uniqueness an ENFORCED gate and fixes the credit-note placement.

## D1 — Automated duplicate-art check (the brief's hard requirement)
New script `scripts/check-art-duplicates.mjs` (Node, stdlib + crypto only — NO new npm deps):
- Scans `public/cards/*.png` and `public/banners/*.png` (banners may not exist yet — handle empty dir gracefully).
- **Exact duplicates:** SHA-256 per file; any two files with the same hash → FAIL listing the groups.
- **Near-duplicates:** perceptual hash — implement a small dHash (difference hash) inline: decode PNG via zlib manually is too much; instead use the **byte-level approach**: downscale is not possible without a codec... ALTERNATIVE (accepted approach): compare file sizes + first/last 4KB hashes as a cheap prefilter, AND do a true perceptual check by spawning `python3` with PIL (Pillow IS installed on this machine: `python3 -c "from PIL import Image"` works) — write a tiny helper `scripts/dhash.py` that prints `filename,64-bit-hex-dhash` per image; the mjs script shells out to it once for all files, then Hamming-distance ≤ 5 → near-duplicate FAIL. If python3/PIL is unavailable at runtime, the script must SKIP the perceptual tier with a loud warning (exit 0 for that tier only) — exact-hash tier always runs.
- Also verifies: every wired art slot in `app/lib/art-slot.ts`'s domain (i.e. every card id from `allCards()` via `scripts/gen-duel-data.ts`-style import, or simpler: every `public/cards/*.png` filename matches the `<culture>-<id>-<slot>` pattern of an existing prompt entry in `data/art-prompts.json`) — report orphan PNGs (warn, not fail) and missing-art slots (warn with the list; currently 7 Slavic slots legitimately await art).
- Exit codes: 0 = clean (warnings allowed), 1 = duplicates found.
- Wire into package.json as `"check:art": "node scripts/check-art-duplicates.mjs"` and call it at the END of the existing `validate` script (append `&& npm run check:art` to validate, or add to build pipeline — check package.json scripts and pick the least invasive spot that CI-less local flow will run; document choice in a comment).

## D2 — Run it, report, fix what it finds
Run `npm run check:art`. Current known state: 1 orphan PNG `mesopotamian-mes-erishkigal-consort.png` matches no prompt slot — investigate: if it matches a slot under a slightly different filename (typo), rename to the canonical slot name; if truly orphaned, move it to `public/cards/_orphans/` (gitignored dir? check .gitignore — public/cards is gitignored entirely, so just move it) and note in report. ZERO exact or near duplicates expected (all 177 PNGs were generated uniquely — md5 spot-checks passed before). If the perceptual tier flags false positives (e.g. same-character variants), tune threshold down (≤3) rather than disabling, and document.

## D3 — Credit note off the art
The "generated reconstruction · The Divine Atlas" caption currently renders ON the card art (DeityCard `.tc-art` area). Move it: remove from card face; add to (a) CardDetailOverlay footer and (b) site footer area if a slot exists (do NOT add the Mazen footer yet — Phase 8 owns that; just the detail overlay + a small note on /about). Keep it subtle, 11px, muted.

## D4 — ART_STYLES.md + prompts consistency
- `docs/ART_STYLES.md`: ensure the 5:7 card ratio + 21:9 banner ratio + safe-margin composition rules are stated (Phase 3/4 may have added; reconcile duplicates/contradictions).
- `data/art-prompts.json`: every item + banner must have: subject, gender (explicit), appearance, pose, clothing, relics, setting, mood, composition (with ratio), style tag, negative prompt, filename/slot. Write a small validation into `scripts/check-art-duplicates.mjs`? NO — keep that script art-only; instead extend the existing `npm run validate` pipeline ONLY if a prompts validator already exists; otherwise add `scripts/check-prompts.mjs` + `check:prompts` script that enforces the field contract on all 184+24 entries (fail on missing fields). Run it; fix any gaps by completing the prompt text from the entity's own data (no invention beyond sourced myths).

## Gates you MUST run and pass
`npx tsc --noEmit && npm run build && npm run validate && npm run check:art && npm run check:prompts`
Print: duplicate-check output (exact + perceptual tiers), orphan/missing list, prompts validation result, files changed. Do NOT run `git add` or `git commit`.
