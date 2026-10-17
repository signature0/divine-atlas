# PHASE 6 (v2) SPEC — Card game: 2–4 players + How to Play page

You are the Phase 6 worker (branch `atlas-v2-2026-10`). Read `docs/PLAN.md` §3 Phase 6. Current state: "Pantheon" is a working **2-player** hot-seat duel — pure deterministic reducer engine `app/lib/pantheon.ts` (552 lines, mulberry32 seed, action log + replay-undo, 15-test suite `scripts/enginetest.ts`), client bridge `app/lib/pantheon-data.ts` fed by `public/duel-deck.json` (via `scripts/gen-duel-data.ts`), UI `app/components/play/DuelClient.tsx` + `DuelCard.tsx`, rules `/how-to-play`, printable mat `/how-to-play/board`. Constants: PILLAR_HP=20, DECK_SIZE=24, HAND_START=3, HAND_CAP=7, FIELD_SLOTS=3, ESSENCE_CAP=12, ESSENCE_PER_TURN=2, ESSENCE_START=3, RELIC_COST=3, ELEMENT_BONUS=2.

## D1 — Extend the engine to 2–4 players (PURE reducer rules stay sacred)
- `createGame({ seed, players: 2|3|4, deckCultures? })` — seats take turns in order; each seat has own deck/hand/field/pillar/essence.
- **Free-for-all targeting:** on ATTACK the active player chooses any enemy deity or enemy pillar (default: current target = leftmost alive enemy pillar; UI exposes target selection). No team mode.
- **Balance for FFA (document choices in code comments + rules):**
  - Pillar HP scales: 2P=20, 3P=20, 4P=24 (more attackers → slightly more HP; keep simple).
  - ESSENCE_PER_TURN ramps: turn 1-2 = 2, turn 3-4 = 3, turn 5+ = 4 (cap 12) — keeps 4-player games from stalling. (Adjust if your self-play tests disagree; justify in comments.)
  - Draw 1/turn as now; deck-out reshuffle as now.
- **Determinism:** all randomness from the single seed; UIDs from in-state counter; NO Math.random/Date.now/React/require. Undo = replay log minus last. Keep the existing 2P behavior byte-identical for the same seed (regression: existing 15 tests must still pass unchanged — if a test encodes 2P-specific constants, adapt minimally and note it).
- **Win/lose:** last seat standing; on a seat's pillar falling they're eliminated (their field deities banish, hand discards); game ends immediately when ≤1 seat remains. Action log records eliminations.

## D2 — Engine tests (extend `scripts/enginetest.ts`)
Add ≥6 tests: 3P and 4P self-play to completion across 10 seeds each (no crashes, exactly one winner, log replays identical); elimination removes hand/field; targeting an enemy deity vs pillar both legal; essence ramp values; 2P regression (same seed → same final state as before your change — snapshot the old final-state hash by running the CURRENT engine first, record it, assert it after). Run `npx tsx scripts/enginetest.ts` — ALL pass.

## D3 — UI: seat setup + targeting
- `/play`: setup panel gains player count selector (2/3/4, default 2) — hot-seat passes device around; current-seat banner prominent; non-active seats' hands hidden (back-of-card or collapsed) with a "reveal hand" hold-to-peek button (privacy for hot-seat).
- Targeting: when ATTACK selected, enemy deities/pillars become clickable targets (aria-labels "Attack <name>" / "Attack <seat> pillar"); keyboard accessible.
- Action log shows seat names ("Seat 2 attacks Seat 4's pillar").
- Keep seed input + shareable-seed behavior; extend to include player count in the share string.

## D4 — How to Play page (rewrite `/how-to-play` to the brief's structure)
Sections: Quick start (30-second version) · Card anatomy (illustrated — reuse DuelCard renderings or annotated SVG) · Turn walkthrough step-by-step (numbered, with the phase order) · Keyword glossary (Channel, Essence, Pillar, Banish, Intercept, Domain, Element bonus, Relic, Synergy…) · Worked example round (concrete: seed X, seat hands, play-by-play from the engine — generate by running the engine and transcribing a real opening, do not invent) · FAQ (mulligan, deck-out reshuffle, ties, 3-4 player differences, hot-seat privacy). Update for 2-4 players throughout. Printable mat page: add 3rd/4th seat zones (SVG/HTML, print CSS).

## D5 — Rules doc
`docs/GAME_RULES.md` (new): full rules as shipped (goal, setup, turn structure, card types, stat derivation from mythology, culture synergies table, win conditions, 2/3/4-player differences, balance notes incl. the ramp/HP scaling rationale). This is the source the PDF booklet (Phase 7) will render.

## Gates you MUST run and pass
`npx tsc --noEmit && npx tsx scripts/gen-duel-data.ts && npx tsx scripts/enginetest.ts && npm run build && npm run validate`
Print: test counts (old 15 + new), 2P regression hash match, files changed. Do NOT run `git add` or `git commit`.
