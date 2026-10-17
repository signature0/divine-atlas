
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
