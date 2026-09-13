# Roadmap — The Divine Atlas

> Owner: PM · Status: active · Updated: 2026-09-13

## MVP (Gate 8 release scope)
- All six cultures fully browsable (home, culture landing, deity profiles, compare) — DONE
- Relationship graph explorer `/graph` (REQ-006)
- Story mode `/myths/[id]` (REQ-007)
- Global timeline `/timeline` (REQ-008)
- Global search overlay wired to a real index (REQ-009)
- Sources/methodology pages (REQ-010)
- QA: Playwright route sweep + visual regression baselines 390/768/1440/1920 (Gate 6)
- Design critique pass (Gate 7)

## DIVINE ARTIFACTS / RELICS — "The Divine Vault" (Gate 2 addendum, PO 2026-09-13)
A new top-level wing alongside Cultures/Graph: sacred objects of gods, heroes,
monsters. Data-driven (ADR-002); adding an artifact = adding JSON.
- **MVP slice (prototype, "first ten exceptionally polished"):**
  - Artifact dataset: 6 cultures integrated into `data/<culture>/artifacts.json`
    + `artifact_artworks.json`, verified open-license images with honesty labels
    (TASK-015).
  - `/artifacts` collection — The Divine Vault: card grid, culture filter
    (instant, URL-synced), type/rank/sort, search (REQ-017).
  - `/artifacts/[slug]` detail — power profile, ability cards, sources,
    artworks, source confidence (REQ-018).
  - Graph + deity-page + search integration; `/relic` reveal; artifact compare
    (REQ-019…023).
  - `validate.mjs` artifact checks green (NFR-ART-003).
- **NEXT (expansion, after the ten):**
  - Remaining suggested artifacts (Skíðblaðnir, Draupnir, Gjallarhorn,
    Ame-no-Nuboko, Pandora's jar, Golden Fleece, Apollo/Artemis bows,
    Megingjörð, Freyja's cloak, Egyptian crowns/staffs, Mesopotamian regalia).
  - Special Collections (curated sets: Weapons of the Gods, Divine Jewelry,
    Objects of Creation/Death, The Three Sacred Treasures of Japan, …) (REQ-024).
  - Full secondary-filter exposure (POWER, OWNER, MATERIAL, ERA).
- **LATER:** place/realm/source/artwork as first-class graph node types
  (the artifact system is the proof-of-concept for that generalization).

## NEXT (post-release, first iteration)
- World map `/map` (REQ-011) — IA spec'd, not built
- "Reveal a God" random spotlight (REQ-012)
- Remaining 20 minor deities' artwork (IMPROVEMENT)
- Pantheon filter + genealogy views per culture (REQ-004/005 — currently only
  culture landing exists; pantheon/genealogy/cosmology/myths sub-views are
  partial on the landing page)
- A11y pass: axe audit, focus states, reduced-motion (TECH-003)
- 7th culture as expansion proof (Celtic or Chinese)

## LATER
- Remaining 14 "coming soon" cultures (data-only expansion)
- DEIFIED_AS edge type + pop-culture lane (schema already reserved)
- i18n / native-script display polish
- SSG + image optimization for performance

## CUT
- Database / CMS — JSON files + `integrate.mjs` pipeline is the v1 model (ADR-001)
- User accounts, comments, favorites — out of product identity (museum, not social)

## Scope challenges (weak evidence → challenged)
- REQ-012 "Reveal a God": HYPOTHESIS [EV-001] that random discovery drives
  return visits — no data yet. Kept in NEXT, not MVP.
