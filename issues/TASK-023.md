---
id: TASK-023
title: The Deck — every deity as a collectible trading card (gallery + print PDF + flip)
type: TASK
status: IMPLEMENTED
priority: high
owner: orchestrator
severity:
created: 2026-10-04
updated: 2026-10-04
source: PO direction — "apply our design/animation experience; research MTG/Yu-Gi-Oh; a card per god, all pantheons; later printable PDF cards + a board-game concept"
implements: [REQ-023, REQ-024, REQ-025]
---

# TASK-023: The Deck — deity trading cards

## Context
PO wants the existing design/animation experience applied as a new section: a
trading-card reading of the Atlas in the spirit of Magic: The Gathering / Yu-Gi-Oh.
Scope was explicitly expanded from "Egyptian gods" to **every god in every
pantheon** — all 159 entities across the 6 cultures, with printable PDF cards and
an eye toward a board-game concept.

The project's iron rule (DATA-SCHEMA) holds: **content is data, presentation never
hardcodes a god.** So the deck is a *derived view* of the existing entity data —
no new data files, no invented claims.

## What was built
- **Card engine** `app/lib/card.ts` (ADR-004): `deriveCard(entity, index)` maps an
  Entity → a card deterministically.
  - **Element** from `domains` (rule table: light/storm/fire/water/earth/life/
    death/war/mind/sky/void).
  - **Rarity** from `classification` (primordial→mythic, deity→rare,
    minor/hero/monster→uncommon, spirit/realm/object→common).
  - **Stats (PWR/GRD/Essence)** seeded by a stable hash of the entity id
    (mulberry32) — reproducible across builds/machines, **labeled interpretive**
    (same convention as the Vault's tier/rank/power_profile).
  - **Set code** `DA-<CCY>-<nnn>` per culture; **source refs** `[S#]` carried from
    `primary_sources`.
- **Accessors** in `app/lib/data.ts`: `allCards()`, `cardFor(id)`,
  `cardsForCulture(c)` — attach each card's hero image + credit.
- **Components**: `DeityCard` (presentational face + reverse plate, per-element
  SVG sigils), `FlippableCard` (3D flip; reduced-motion → static front),
  `CardDeck` (client filters: culture/element/rarity + search + show-more),
  `PrintButton` (browser-native Save-as-PDF).
- **Routes**:
  - `/cards` — the deck (dynamic, `?culture=` supported), "how to read a card"
    legend, pantheon chips.
  - `/cards/[id]` — print-ready sheet, true TCG 63.5×88.9 mm, front + reverse,
    crop/bleed note, Save-as-PDF.
  - `/cards/print` — full-deck sheet (159 front faces).
- **Nav + home**: "Deck" link in `TopNav`; home "The Deck" teaser = the
  highest-essence card per pantheon (derived, 6 anchors).
- **CSS** `globals.css`: `.tc-*` card system (2.5:3.5 TCG ratio), `.deck-*` pages,
  `@media print` isolation + `@page` A4, reduced-motion off-switches.

## Verification (2026-10-04)
- `npm run build` (prod `.next`): **✓ 719/719 static pages**, 0 errors.
  `/cards/[id]` = 159 SSG sheets + `/cards/print`.
- Dev `:3100`: `/cards`, `/cards/egy-ra`, `/cards/print`, `/` all **200**.
- Data cross-check from JSON: **159 cards**, 109 with live hero image (69%),
  rarity = 12 mythic / 115 rare / 12 uncommon / 20 common; per-culture counts
  match entity files (jpn21 gre41 nor40 egy25 slv13 mes19).
- Sample derivation (Ra): type "DEITY · Fire", essence 5, PWR 4 / GRD 7,
  set DA-EGY-013 — deterministic.
- 109 image refs all valid; spot-checked wikimedia URLs return 200.

## Deploy (BLOCKED — needs PO sudo)
Prod `:3002` (divine-atlas.service) still serves the pre-Deck build; the new build
is in `.next/` and live on dev `:3100`. `systemctl restart divine-atlas` requires
sudo and was not consented this session. **PO action: `sudo systemctl restart
divine-atlas`** (or approve the restart) to expose The Deck on `:3002`.

## Acceptance criteria
- [x] A card is generated for **every** entity in **all six** cultures (159).
- [x] Card fields derived from verified data; stats explicitly labeled interpretive.
- [x] Gallery with filters (culture/element/rarity) + search; no page reload.
- [x] 3D flip on hover/tap/keyboard; disabled under prefers-reduced-motion.
- [x] Per-card print sheet at true TCG size with a Save-as-PDF control.
- [x] Full-deck print sheet.
- [x] Nav entry + home teaser; design language matches the museum-codex system.
- [ ] Deployed to `:3002` (awaiting PO sudo restart).
- [ ] (Next, PO scope) Board-game concept + illustrated card art pipeline.
