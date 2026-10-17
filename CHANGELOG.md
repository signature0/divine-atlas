
## v2 Phase 5 — Unique-art gate + credit note + prompt contract (2026-10-17)

Authored by OpenCode worker. Implements `docs/audit/V2-PHASE5-SPEC.md`.

- **`scripts/check-art-duplicates.mjs`** (new) — the enforced unique-art gate.
  Exact tier: SHA-256 per `public/cards/**` + `public/banners/**` PNG → any shared
  digest FAILs. Perceptual tier: `scripts/dhash.py` (Pillow, new) prints a 64-bit
  dHash + a 16×16 luminance fingerprint per image; a pair FAILs only when the
  dHash Hamming distance ≤ 5 **and** the luminance MAD < 1.0. Rationale: this
  corpus is deliberately style-consistent (one centered-figure template per
  culture), so a raw 64-bit dHash ≤ 5 yields 136 false candidate pairs between
  genuinely different deities; calibrated, a true re-encode/resample is dHash
  distance 0 with MAD < 0.1 while the closest distinct pair is MAD 3.0. If
  python3/PIL is absent the perceptual tier SKIPs with a warning (exact tier
  still gates). Also reports orphan PNGs (warn) and missing slots (warn).
- **Orphan resolved:** moved `mesopotamian-mes-erishkigal-consort.png` (the
  merged-away Phase-1 duplicate, matching no prompt slot) to
  `public/cards/_orphans/` (inside the gitignored `public/cards/`; the scanner
  excludes `_orphans/`). 177/184 card slots now matched; 7 Slavic slots + 24
  banner slots legitimately pending art.
- **`scripts/check-prompts.mjs`** (new) — field contract over all 184 items + 24
  banners (subject/name, explicit gender, ratio-bearing composition, style tag,
  setting, mood, negative prompt, slot pattern; `pan` allowed for shared banners
  only). `npm run check:prompts`.
- **`package.json`** — `check:art` and `check:prompts` scripts; `validate` now
  ends with `&& npm run check:art`.
- **Credit note off the art (D3):** removed `.tc-art-credit` (DeityCard) and
  `.rc-art-credit` (RelicCard) from the card faces; the credit now renders in the
  CardDetailOverlay footer (`.cd-credit`), on the artifact detail callout
  (`.rel-callout-credit`), and as a subtle 11px note on `/about`.
- **`docs/ART_STYLES.md`** — reconciled ratios in a new §0 (card 5:7/1024×1440,
  banner 21:9/2016×864, safe margins) + documented the prompt field-contract
  mapping; corrected stale `_meta.*` references to the JSON's real top-level
  fields.
- Gates: `npx tsc --noEmit`, `npm run build`, `npm run validate`,
  `npm run check:art`, `npm run check:prompts` all green.

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
## Phase 6 — Card art wiring + style guide (2026-10-17)

Authored by OpenCode worker (DeepSeek V4.1 Flash-free, session phase6-art-wiring), QA'd by the orchestrator.

- `docs/ART_STYLES.md` — per-religion art style guide derived solely from
  `docs/audit/gen_art_prompts.py` + `data/art-prompts.json` `_meta` (style tags,
  gender/age rules, pose/relic vocabulary, 5:7 1024×1440 PNG contract, negative
  prompt default, slot naming). Nothing invented; prompts JSON untouched.
- **Art-slot wiring** (the 178 orphaned generated PNGs are now live):
  - `app/lib/card.ts` — pure `artSlotPath(culture, id)` = single source of slot naming.
  - `app/lib/art-slot.ts` (new, server-only) — `artSlotExists()` build-time
    `fs.existsSync`; imported ONLY by build-time loaders (`data.ts`, `relic-card.ts`),
    never client components (audited).
  - `data.ts allCards()` + `relic-card.ts deriveRelicCard()` resolve `image_url`
    slot-first when the PNG exists at build time; else unchanged archival behavior.
  - Honest credit: generated slots say "generated reconstruction · The Divine Atlas",
    never a museum institution; real artwork keeps its archival credit.
- **Broken-image fallbacks**: `DeityCard` (DeityArt) and `CardDetailOverlay`
  (CdHeroArt) now use the same letter-seal onError pattern RelicCard already had.
- **QA (orchestrator)**: programmatic slot audit — 177 unique `/cards/` img refs in
  built HTML, 0 mismatched vs prompt slots, 0 missing files, 0 on-disk slots left
  unwired. Presence/absence rebuild verified by worker (absent → 0 refs, 110 letter
  seals, archival fallbacks). Playwright: deck 36/36 + vault 19/19 art images loaded
  (lazy-load settle), print sheet hero loads, zero 4xx on /cards/ assets. Vision:
  art fits frames, no distortion, layout intact. tsc/build/validate green on a clean
  rebuild.
## Phase 7 — Site-wide QA sweep + a11y fixes (2026-10-17)

Authored by OpenCode worker (DeepSeek V4.1 Flash-free, sessions phase7-a11y-fixes,
phase7-h1-scoping, phase7-contrast-fix), audits + verification by the orchestrator.

- **Sweep (orchestrator, Playwright)**: all 723 static routes x 2 viewports
  (1440x900, 380x780): zero page/console errors, zero failed/4xx requests, zero
  horizontal overflow, every img has alt, every internal link resolves to a built
  page, landmarks/labels spot-checked on 5 key pages.
- **h1 defect**: 159 print sheets had no <h1>. First worker pass made DeityCard's
  name an h1 unconditionally — orchestrator caught the leak (cards.html 37 h1s,
  print.html 158, index.html 7). Scoped fix: `asHeading` prop on DeityCard, true
  only on the single-card print sheet; real page h1 on the full-deck sheet.
  Verified: all 723 pages have exactly 1 h1.
- **Contrast defect (orchestrator WCAG probe)**: raw culture/element accent colors
  used as text on dark surfaces (7 samples, worst 3.28:1). Extended the DES-005
  convention: ELEMENT_TEXT_COLORS + CULTURE_TEXT_COLORS (AA >=4.6:1 text variants)
  applied to .tc-culture, .tc-print (--tc-el-text), deck element chips, rules
  element table. Raw colors kept for borders/backgrounds/graph nodes. Re-audit:
  0 low-contrast samples across 11 key pages.
- **Regression**: phase 4/5/6 Playwright suites re-run green; engine 15/15;
  tsc/build/validate green on clean rebuild.
