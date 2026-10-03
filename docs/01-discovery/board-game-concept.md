# Board-game concept study — "Pantheon"

> Status: STUDY (PO scope, 2026-10-04) · Owner: orchestrator · Feasible, not yet built.
> Companion: ADR-004, TASK-023. This is a concept + a clear build path, not a
> finished game.

## Can we make a board game from this? — Yes, and the data already supports it.
The Atlas gives us, per god: an element, a rarity, PWR/GRD/Essence, domains,
symbols, weapons, sacred objects, and (via the Vault) owned artifacts. That is
exactly the input a card-driven board game needs. No new data is required to
prototype — `deriveCard()` *is* the game's card model.

## Recommended concept: "Pantheon" — a 2–4 player elemental dueling game
A lightweight, 30–45 min, 2–4 player card game where players are **priests
channeling their own pantheon** and win by toppling the opposing **Cosmic
Pillars**.

### Core loop
1. **Summon** — spend **Essence** to bring a deity card to the field (essence =
   mana/cost; PWR = attack; GRD = health/block).
2. **Channel** — each deity's **element** interacts with the board (Fire > Earth
   > Water > Fire; Storm > Life; Mind > War; Light/Death are wild).
3. **Strikes** — deities attack opposing deities or a player's pillar directly.
   Artifact cards (from the Vault) attach to a deity as equipment.
4. **Win** — reduce an opponent's **Cosmic Pillar** (life total) to 0.

### Why this fits the Atlas
- **159 cards, 6 pantheons** → each player picks a culture and drafts/builds a
  themed 30-card deck from it (rarity governs build legality: Common always,
  Mythic rare in a deck — a real deckbuilding layer).
- **Elements + domains** create a readable rock-paper-scissors meta that a player
  can *learn*, not guess.
- **Artifacts as equipment** reuses the Vault data, so the two systems reward each
  other.
- **Interpretive stats** are fine for a *game* — they're explicitly game-facing
  (we never claim "Ra is 7/12 in reality").

### Win-condition variants (design options for the PO to pick)
- **Pillars** (above) — cleanest, most board-game.
- **Relic race** — race to claim N sacred relics on a shared map (uses sacred_objects).
- **Theodicea** — cooperative: players jointly hold back "Chaos" (a shared deck)
  to defend the world (a co-op twist on the same cards).

## Build path (incremental, each step shippable)
1. **Card layer** — DONE (`/cards` + print PDFs). You can *print* a Pantheon deck
   today: pick a pantheon, print its cards, play the dueling loop on paper.
2. **Rulebook** — a one-page rules PDF (we can render it the same way).
3. **Digital prototype** — a Next.js `/play` room: drag-to-summon, essence pool,
   element check, pillar HP. Reuses `deriveCard` + `DeityCard`. No engine needed.
4. **Print & Play** — a boxed layout: 6 pillar tokens, an elemental mat, 6 culture
   sleeves. The print sheet already outputs TCG-accurate cards.

## Open questions for the PO
- Solo/duel only, or 2–4 player? (affects table size + pillar count)
- One shared elemental wheel, or each pantheon has a signature element?
- Do we generate **illustrated card art** (ComfyUI, per-culture style) for the
  print-and-play edition, or keep the open-licensed photos?
- Scope: stop at **print-and-play + one-page rules**, or build the **digital
  `/play` prototype**?

## Effort estimate
- Print-and-play + rules PDF: small (deck + 1 page).
- Digital `/play` prototype: medium (a self-contained game room on existing data).
- Illustrated art edition: medium (generation + curation pass, 6 culture styles).
