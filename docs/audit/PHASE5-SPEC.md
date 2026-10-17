# Phase 5 spec — "Pantheon" card game + How to Play (Divine Atlas)

You are implementing Phase 5 of a plan on branch `atlas-overhaul-2026-10`. Build the card game defined by `docs/01-discovery/board-game-concept.md` (read it first — it is the design brief; the "Pillars" win condition is the ratified choice) as a **print-and-play game with a full rules site and a hot-seat digital duel**. Static export only — no server, no accounts, no networking.

Read first: `docs/01-discovery/board-game-concept.md`, `app/lib/card.ts` (deriveCard: element/rarity/stats), `app/lib/data.ts` (allCards, allArtifacts, artifactsForEntity), `app/components/DeityCard.tsx`, `app/cards/page.tsx` (page chrome patterns), `app/globals.css` (design tokens: --gold, --accent, --line, fonts, .btn, .chip, .eyebrow, .section-sm, .container).

## Hard constraints
- Next.js 15 static export; all new pages prerender (`generateStaticParams` where params exist). No new npm dependencies.
- Game rules must be derivable from data the site already ships (element, rarity, essence/PWR/GRD, domains, artifacts). Any game-facing number you introduce (pillar HP, hand size, etc.) is a DESIGN choice — list every one in a table at the bottom of the rules page, labelled "design choice, not mythology".
- Respect `prefers-reduced-motion`; keyboard accessible; no console errors; no horizontal overflow at 380px.
- Do not modify `app/lib/card.ts` derivation or any data JSON.

## 1. Rules document — `/how-to-play` (new page, static)
A single well-designed page (this is the deliverable's heart). Sections, in order:
1. **Quick start** — 60-second version: what's in a 30-card deck, table setup, first-turn flow, how a duel ends. Numbered, skimmable.
2. **Card anatomy** — annotated diagram of a card (reuse `DeityCard size="lg"` in a callout with labeled arrows/notes: essence cost, element sigil, PWR/GRD pips, type line, flavor + [S#]).
3. **The loop** — turn structure: Draw (1) → Channel (+2 essence, cap 12) → Main (summon / attach relic / strike, any order) → Upkeep. Full rules for summoning sickness, targeting, combat math (attacker PWR vs defender GRD; element advantage = +2 PWR per the wheel below), pillar strikes, relic attachment (one per deity, from `artifactsForEntity`), rarity deck-building legality (max 1 Mythic, 2 Rare per copy otherwise unlimited within a 30-card single-pantheon deck).
4. **Elemental wheel** — the concept doc's interactions rendered as a readable diagram (SVG ring): Fire>Earth>Water>Fire, Storm>Life, Mind>War, Light/Death/Sky/Void neutral. State it as a table too.
5. **Pantheon synergies** — each of the 6 cultures gets one signature ability derived from its data (e.g. Norse: +1 GRD to deities whose domains include war or death; Egyptian: relics cost 1 less essence; Greek: once per turn reroll... NO — keep deterministic: e.g. Greek: +1 essence on turn 1; Japanese: +1 PWR to sky/light deities; Slavic: +1 GRD to nature/fertility domains; Mesopotamian: primordial deities cost 1 less). Design 6 clean, deterministic, one-line synergies; print them in a table with the data rationale.
6. **Example round** — a full transcript of turns 1–3 between two named sample players using REAL cards (pick actual ids from the data, e.g. gre-zeus vs nor-thor), showing essence, field, and each decision. This must be consistent with the rules as written.
7. **Glossary** — Essence, Channel, Summon, Strike, Pillar, Relic, Element advantage, Pantheon, Sickness, Mythic.
8. **Design-choices table** — every number/rule that is ours, not mythology's.
9. Print CSS (`@media print`): the page prints clean as a rulebook (page-break before major sections, hide nav/buttons).
Link `/how-to-play` from TopNav (add "Play" item) and from `/cards` hero buttons.

## 2. Printable board — `/how-to-play/board` (new static page)
A print-ready SVG "dueling mat" sheet: two player zones (field 3 slots, relic row, essence tracker 0–12 as a track of 12 circles to tick), a Cosmic Pillar life track 20→0 per player, the elemental wheel printed small in a corner, and a turn-flow reminder strip. One A4/Letter page, `@page` CSS, black-on-white-friendly (the site is dark; the print sheet must print legibly on paper — use a `@media print` light treatment). Include a "Print sheet" button using the existing PrintButton pattern if present, else `window.print()`.

## 3. Hot-seat duel — `/play` (new client page, static export)
A self-contained 2-player hot-seat prototype proving the rules on real data:
- Setup screen: each player picks a pantheon (6 chips) → deck = that culture's cards shuffled with a seeded PRNG (seed shown on screen so a duel is reproducible; `mulberry32`-style, seed from a text input or random-once-per-session stored in state).
- Board: two player halves (opponent's half rotated 180° visually is NOT required — label P1/P2 clearly; hot-seat: active player's half is interactive, the other is dimmed with a "pass the phone / tap to hide" curtain button between turns so hidden hands stay hidden).
- State machine (pure reducer in `app/lib/pantheon.ts` — exportable, unit-testable, no React inside): initial state, draw, channel, summon (cost check, sickness), attach relic, strike (element advantage +2, pillar damage when no blockers... keep blockers simple: defender chooses any their deity intercepts, else pillar), death → discard, win when pillar ≤ 0. Undo = keep full action log, replay from seed (implement `undo` as replay-minus-last).
- UI: tap a card in hand → highlight legal targets → tap target. Log panel (mono, last 12 actions). New-duel button. All state in memory (no localStorage needed).
- Keep it robust: illegal actions are disabled, not error-toasted. No console errors.

## 4. Files you may touch
New: `app/how-to-play/page.tsx`, `app/how-to-play/board/page.tsx`, `app/play/page.tsx`, `app/lib/pantheon.ts`, `app/components/play/*` (as needed), `app/globals.css` (append). Modified: `app/components/TopNav.tsx` (one nav item), `app/cards/page.tsx` (one hero button). Nothing else.

## Verification (all three must pass; run them yourself and fix failures)
1. `npx tsc --noEmit` → zero errors
2. `npm run build` → exit 0, static export, no errors/warnings
3. `npm run validate` → ✓ no errors

Reply DONE when all three pass, or list what still fails.

## Addendum — environment pitfalls (read before coding)
- `app/lib/data.ts` is BUILD-TIME (fs.readFileSync). A client component cannot import it.
  `/play` needs the card pool at RUNTIME. Required bridge:
  1. `scripts/gen-duel-data.ts` (run with `npx tsx`): imports `allCards()` and builds the
     entity→relic attach map from `artifactsForEntity`, writes `public/duel-deck.json`
     shaped `{ _meta, cards: ResolvedCard[], relics: Record<entityId, {slug,name}[]> }`.
  2. `app/lib/pantheon-data.ts`: fs-free store — `setDuelDeck(cards, relics)`,
     `duelDeckReady()`, `duelCard(id)`, `duelAllCards()`, `duelRelicsForEntity(id)`.
  3. `app/lib/pantheon.ts` (engine) reads cards ONLY through `pantheon-data.ts`.
  4. `DuelClient` fetches `/duel-deck.json` in useEffect → `setDuelDeck` → render duel.
     Loading line until ready; error line on fetch failure.
- Server components cannot have onClick: the board page's print button must be a separate
  tiny `'use client'` component calling `window.print()`.
- Engine purity is strict: no React, no Date.now, no Math.random, no module-level mutable
  state. UIDs from a counter INSIDE state. Undo = replay action log minus last.
- Deck legality: script-check that EVERY culture can build a legal deck under your rarity
  rule before fixing DECK_SIZE (pool ~26/culture; 30 may be illegal — verify, adjust).
- Mulligan/draw: be consistent which array end is the deck top; dumping hand to bottom must
  not redraw the same cards.
- Do NOT run git add/commit. Leave changes in the working tree.
