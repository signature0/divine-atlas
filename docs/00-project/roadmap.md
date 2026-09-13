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
- **MVP slice — DONE 2026-09-13 (TASK-015…018, commits 7dd7b43 / ab807f9 / 8542d7c):**
  - Artifact dataset: 19 artifacts across 5 cultures in
    `data/<culture>/artifacts.json`, verified open-license images with honesty
    labels (image_type; reconstructions never posed as ancient) (TASK-015).
    36 relationship edges wire artifacts into the entity graph.
  - `/artifacts` collection — The Divine Vault: 19-card image-led grid,
    instant tradition/type/class/owner filters (URL-synced), live search,
    5 sort modes, count, empty state (TASK-016, REQ-017).
  - `/artifacts/[slug]` detail — hero artwork with provenance + image_type,
    ATLAS POWER PROFILE bars with per-value explanations, named ability cards
    with certainty badges, ATLAS CLASSIFICATION (tier + compact rank +
    editorial disclaimer), source confidence, limitations, uncertainty notes,
    cross-links (TASK-017, REQ-018).
  - Integration: artifact nodes + edges in RelationshipGraph (centered BFS +
    global clusters, endpoint-aware routing), deity pages gain an
    "Artifacts of <name>" section + artifact relationship group, ⌘K search
    surfaces artifacts (TASK-018, REQ-019…021).
  - `validate.mjs` artifact checks green (endpoints, enums, power 0–10,
    list-field shape, relationship fields) — `✓ no errors` (NFR-ART-003).
  - QA: 16/16 headless Playwright checks (filters, search, sort, detail,
    deity cross-links, graph, console clean); `next build` green, all 19
    detail pages prerendered.
  - Deferred (documented, not failures): artifact compare (the deity
    comparator is domain-shaped; needs a power-profile comparator), `/relic`
    route (does not exist in the app — no route to integrate with).
- **NEXT (expansion, after the first batch):**
  - Remaining suggested artifacts (Pandora's jar, Golden Fleece,
    Apollo/Artemis bows, Megingjörð, Freyja's cloak, Slavic attested objects
    — max 3, quality over quantity) (Slavic intentionally skipped this round:
    no artifact met the "reasonably supported by historical or folkloric
    sources" bar with a verifiable image).
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
