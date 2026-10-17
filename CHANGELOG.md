
## Phase 4 — Relic cards: artifacts get the card system (2026-10-17)

Authored by OpenCode worker (DeepSeek V4.1 Flash-free), QA'd by the orchestrator.

- `app/lib/relic-card.ts` — relic card as a VIEW over artifact data: tier→rarity
  map (legendary→mythic, major→rare, minor→common), power/guard/essence mapped
  from `power_profile` offense/defense/neutral buckets, bounded to card.ts ranges
  with seeded `hash32(id)` fallback; type_line from category + artifact_type +
  primary domain; element via existing `elementOf(domains)`.
- `app/components/RelicCard.tsx` — client flip wrapper (sibling of
  FlippableCard/DeityCard, not a fork): culture accent rules, double-rule frame
  with corner rivets, RELIC band, museum-plaque back face with provenance
  confidence tags (ATTESTED / MODERN INTERPRETATION / UNREVEALED) woven into the
  lore; both faces link to the dossier; flip demoted to ⟲ button, disabled under
  prefers-reduced-motion; broken-image → letter-seal fallback.
- `app/artifacts/VaultClient.tsx` — Tiles/Cards segmented radiogroup persisted to
  localStorage in useEffect; `.vault-cards-grid` mirrors deck sizing.
- `app/artifacts/[slug]/page.tsx` — relic-card callout atop the dossier rail with
  interpretive disclaimer.
- QA (Playwright, 20 checks, desktop 1440 + phone 380): toggle, 26 cards, 0 broken
  images, 0 h-overflow, flip aria-pressed both directions, click-through nav,
  mode persistence, no page errors. Worker bug found+fixed: hover handlers on the
  outer wrapper made the flip button a no-op on hover devices (pointerenter from
  the button toggled flip, click toggled back) — handlers moved to `.rc-flip-inner`.
- Vision QA: front frame coherent and distinct from deity cards; back face clean,
  no clipping. tsc / build (723 pages) / validate all green.
## Phase 5 — Pantheon card game (2026-10-17)

Authored by OpenCode worker (DeepSeek V4.1 Flash-free, session ses_eb720ac0), QA'd by the orchestrator.

- **Engine** `app/lib/pantheon.ts` (552 lines): pure deterministic reducer — mulberry32
  PRNG from one numeric seed, uid counter inside state, undo = replay log minus last.
  No React/Date.now/Math.random (audited). Pillars 20 HP, channel-only essence (+2 once
  per turn, cap 12), summoning sickness, intercept exchange, deck-out reshuffles discard,
  hand limit 7 (newest-end upkeep discard), DECK_SIZE 24 (Slavic pool caps legal decks
  at 26 — worker script-verified), one-sided combat, pillar damage = base PWR.
  Six culture synergies (Greek first-turn essence, Norse/Slavic domain GRD, Japanese
  sky-domain PWR, Egyptian relic cost, Mesopotamian primordial cost).
- **Data bridge**: `scripts/gen-duel-data.ts` → `public/duel-deck.json` (260 KB) →
  `app/lib/pantheon-data.ts` fs-free accessors; DuelClient fetches at runtime.
- **Pages**: `/how-to-play` (rules + wheel SVG + print rulebook), `/how-to-play/board`
  (SVG dueling mat, print-isolated, h1 added in QA fix), `/play` (hot-seat duel: seed
  input, phase strip, handoff curtain, pending-intercept region, undo, aria-live log,
  win alertdialog).
- **Tests** `scripts/enginetest.ts`: 15 pass — 6-culture deck legality, determinism,
  channel gating, undo/replay, element wheel, 20-seed self-play termination, full-game
  replay identity.
- **QA**: Playwright v2 (21 checks: gating, handoff, overflow, zero errors) + v3 scripted
  loop drove a real duel to "P1 topples the Cosmic Pillar, turn 7" through the UI.
  Vision pass: nav "NORS" clipping was a misread (programmatic check: all 12 links
  unclipped). One a11y defect found+fixed by worker: board page had no h1.
- tsc / build (726 pages) / validate green on orchestrator's own clean-tree run.
