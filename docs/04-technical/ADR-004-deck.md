# ADR-004 — The Deck: deities as derived trading cards

> Owner: orchestrator · Status: IMPLEMENTED (2026-10-04) · Supersedes nothing.
> Source: PO direction (2026-10-04). Companion: TASK-023.

## Context
The Atlas is a data-first codex: "content is data, presentation never hardcodes a
god" (DATA-SCHEMA rule). PO wants a trading-card reading of the Atlas in the
spirit of MTG / Yu-Gi-Oh — one card per god, **all six pantheons**, printable PDF
cards, and (later) a board-game concept.

## Decision
A deity card is a **VIEW over an Entity**, never a new source of truth.
`deriveCard(entity, index)` in `app/lib/card.ts` computes every card field from
data the site already ships. Consequences:

1. **Adding a culture = a folder of cards for free.** No per-culture card
   components, no manual entry — the engine maps any Entity.
2. **No invented claims.** The "no invented claims" gate still applies: flavor is
   `description_short`, refs are `primary_sources` `[S#]`, symbols/weapons/objects
   are the entity's own fields.
3. **Interpretive stats are labeled.** PWR / GRD / Essence are *not* historical
   facts — they are a game-facing reading, in the same spirit as the Vault's
   `tier`/`rank`/`power_profile`. They are seeded by a **stable hash of the entity
   id** (FNV-1a → mulberry32 PRNG), so a given god always rolls the same card on
   every build and machine. Reproducibility matters for a collectible deck.

## Card anatomy (MTG-inspired, museum-codex finish)
- **Element** — from `domains` via a rule table (11 elements; unassigned → Void).
  Each element has a muted archival color + a hand-drawn SVG sigil (crisp at any
  size, prints clean, zero external assets).
- **Rarity** — from `classification` (primordial→Mythic, deity→Rare,
  minor/hero/monster→Uncommon, spirit/realm/object→Common).
- **Type line** — `CLASSIFICATION · ELEMENT` (e.g. "DEITY · Fire").
- **Essence cost** (header) — summoning cost, scaled to the god's heft.
- **PWR / GRD pips** — 1–12, seeded.
- **Art window** — the entity's hero artwork (open-licensed, credited), or a
  monogram fallback when absent (109/159 have a live image).
- **Flavor + [S#]**, **set code** `DA-<CCY>-<nnn>`, **reverse plate**.

## Why not a real game engine / PDF lib
- No game state is needed to *show* cards; the flip is CSS 3D, gated by
  `prefers-reduced-motion`.
- Print uses the **browser's native PDF writer** (crisp vector text, no fragile JS
  PDF dependency) at true TCG metrics (63.5×88.9 mm, `@page` A4, 3 mm bleed).
- A board game is a *separate* product (see docs/01-discovery/board-game-concept.md);
  the deck is its proof-of-concept card layer.

## Consequences
- `/cards` is dynamic (searchParams); `/cards/[id]` and `/cards/print` are SSG.
- The Vault (ADR-002) and the Deck share design language but are independent views;
  a god can appear as both a Vault artifact-holder and a card.
- Future: illustrated card art (ComfyUI) + a ruleset would consume `deriveCard`
  unchanged; only the presentation layer grows.
