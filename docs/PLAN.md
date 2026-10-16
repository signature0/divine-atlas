# Divine Atlas — Overhaul Plan (2026-10-17)

Branch: `atlas-overhaul-2026-10` (backup of pre-change state: commit `8cf0dce`).
Worker: OpenCode CLI (`opencode run`) on `opencode/deepseek-v4.1-flash-free`, orchestrated phase-by-phase by Hermes. Every phase: implement → verify (`npm run validate` + `npx tsc --noEmit` + `npm run build`) → changelog → commit.

## Project map (as read)
- **Stack:** Next.js 15 static export (`output: export`, `images: unoptimized`) → Cloudflare-Pages-friendly. No server code allowed.
- **Data:** `data/<culture>/{entities,artifacts,myths,relationships,artworks,sources,cosmology,timeline,uncertainties}.json` for japanese, greek, norse, egyptian, slavic, mesopotamian. Slavic has **no artifacts.json** yet.
- **Entities:** 159 total (jpn 21, gre 41, nor 40, egy 25, slv 13, mes 19). Schema: id, culture, name, native_name, alternative_names, classification, gender, domains, symbols, animals, weapons, sacred_objects, parents/siblings/partners/children/allies/enemies (entity-id lists), associated_realms/places, major_myths, primary_sources, description_short/long, interesting_facts, evidence_status, uncertainty_notes.
- **Artifacts:** 18 total (jpn 4, gre 5, nor 6, egy 3, mes 1) — already a structured type with owner, origin_story, creation_story, abilities, tier, power_profile, source_confidence.
- **UI:** `app/components/` — DeityCard, CardDeck, FlippableCard, RelationshipGraph, GenealogyGraph, GraphViewSwitch, CosmologyMap, SearchOverlay, TopNav, ArtworkFigure, StoryProse, SourceFootnote, PrintButton. Pages: `/`, `/cards`, `/cards/[id]` (print sheets), `/artifacts`, `/graph`, `/stories`, `/compare`, `/culture/[c]`, `/deity/[id]`, `/myths/[id]`, `/domain/[d]`, `/about`.
- **Generated card art:** `public/cards/<culture>/<culture>-<id>.png` — 178 PNGs, 1024×1440 (5:7), 513 MB, currently **untracked** (gitignoring; too heavy for git, deploy separately).
- **Known data smell found during recon:** `mes-apas` has `name: "An (the heavens)"` but id says "apas" — id/name mismatch class of bugs to hunt in Phase 1.
- **Prior design docs:** `docs/01-discovery/board-game-concept.md` (Phase 5 seed), `docs/04-technical/ADR-004-deck.md`, `docs/DATA-SCHEMA.md`.

## Phases
1. **Content audit** — per-culture pass over entities+artifacts: names/spellings/genders/domains/symbols/family relations vs. primary sources; duplicate detection; schema consistency; id/name mismatches; broken cross-reference ids. Log every fix in CHANGELOG; uncertain/disputed → `docs/UNCERTAIN.md` (never silently "fixed").
2. **Graph redesign** — canvas/SVG graph: color per religion, node size by degree/importance, readable labels, wheel-zoom + drag-pan + pinch/touch, religion filter chips, search-to-focus, tap → highlight neighbors + dim rest. Mobile-first (380px), no hairball: force layout with pan/zoom + neighborhood focus instead of full-graph legibility.
3. **Card UI/UX (phone-first)** — card hierarchy: art → name+religion badge → domain/title → one-line summary → stats/symbols → details-on-expand. Grid + list + fanned "hand" layouts. Tap-to-expand → full-screen detail (story, family, domains, symbols, relics, sources) with swipe-down/back close, `prefers-reduced-motion` respected. Site-wide polish: nav, spacing, type scale, dark theme, loading states, a11y.
4. **Relic cards** — artifacts get the card system treatment (distinct frame from god cards), rendered at `/artifacts` + `/artifacts/[id]`; add missing artifacts (esp. Slavic artifacts.json) so every religion is represented.
5. **Card game** — original game ("Pantheon") using existing stats (essence/power/guard already on cards) + domain-derived abilities + pantheon synergies. Full rules doc, printable SVG/HTML board, `/how-to-play` page (quick start, turn walkthrough, card anatomy, glossary, example round, print CSS).
6. **Card art** — per-religion art style guide (`docs/ART_STYLES.md`); image prompt per entity+artifact in `data/art-prompts.json` (subject, explicit gender, age, pose, clothing, relics, setting, mood, composition, style tag, 5:7 aspect, negative prompt) matching existing 1024×1440 placeholder slot; wire cards to load `/cards/<culture>/<id>.png` by filename with graceful fallback.
7. **QA** — Playwright: 380px + desktop viewports, links, console errors, images, a11y (contrast/focus/alt), build clean.
8. **Report** — `docs/FINAL_REPORT.md`.

## Ground rules
- Never delete content unless factually wrong; fix or flag.
- Static export must keep building (`npm run build` green each phase).
- No paid services.
