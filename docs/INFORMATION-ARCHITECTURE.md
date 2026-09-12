# THE DIVINE ATLAS — INFORMATION ARCHITECTURE
Phase 2 document. Route map, page inventory, and navigation model.

## Route map (Next.js App Router)

```
/                          Home — hero, pantheon cards, archetypes, compare CTA, stories CTA, graph CTA, "Reveal a God"
/cultures                  Index of traditions (with status: active vs. coming soon)
/cultures/[cultureId]      Culture landing — framing, cosmology map, pantheon overview, genealogy, key myths, sources
/cultures/[cultureId]/pantheon        Pantheon grid (all entities, filterable by class/domain)
/cultures/[cultureId]/genealogy       Family tree view (generation layers; Egyptian: parallel traditions)
/cultures/[cultureId]/cosmology       Cosmology map (clickable realms → associated entities)
/cultures/[cultureId]/myths           Myth list for the culture
/cultures/[cultureId]/art             Art gallery for the culture
/entities/[id]               DEITY PROFILE (cinematic) — god of any culture
/myths/[id]                  STORY MODE — narrative experience
/graph                       DIVINE RELATIONSHIP EXPLORER (global, cross-culture)
/graph?from=<id>             Graph seeded at an entity
/compare                     COMPARATOR (select 2–4 entities)
/compare?a=..&b=..           Pre-filled comparison
/cosmology                   Cosmology explorer index (all cultures' maps)
/map                         WORLD MAP (historical regions → cultures)
/timeline                    Global source/civilization timeline
/search?q=                   Global search results (entities, myths, domains, symbols, places)
/random                       "Reveal a God" — random entity spotlight
/sources                     Master bibliography (all [S#] across cultures)
/methodology                 How we handle variants, uncertainty, living traditions
/404                         Custom (a lost tablet… "this page is in the Duat")
```

## Page inventory & content model

| Page | Data source | Signature interaction |
|---|---|---|
| Home | `cultures.json`, archetypes (derived) | "Reveal a God" button; archetype chips filter entities client-side |
| Culture landing | `research/<c>/*` | Cosmology mini-map; framing banner (living religion vs historical) |
| Pantheon grid | entities.json | Filter by class/domain/gender; card hover = short desc |
| Genealogy | entities + relationships (kinship edges) | SVG layered tree; Egyptian = multiple trees (Ennead/Ogdoad/Memphite tabs) |
| Cosmology map | cosmology.json | Clickable realm boxes; hover shows resident entities; click → filtered pantheon |
| Deity profile | entity + relationships + myths + artworks | Sticky section nav; relationship graph inset (2-hop); variant callouts |
| Story mode | myths.json | Scrollytelling: chapters, inline entity chips, variant accordions, source footer per chapter |
| Relationship explorer | all relationships | Graph canvas (React Flow): filters by relationship type, "show ancestors/descendants/enemies/myths/entire pantheon", legend, hover explanations |
| Comparator | selected entities | Side-by-side attribute table + explicit similarity/difference/connection verdicts |
| World map | cultures.json (regions) | SVG map; historical regions (not modern borders); click → culture |
| Timeline | timeline.json (all) | Horizontal scroll; era bands; "written ≠ originated" callouts |
| Search | in-memory index built from all JSON (no DB) | Debounced; faceted results; domain/symbol search ("thunder" → thunder gods) |
| Random | entities (weighted by profile completeness) | Card flip animation; "Reveal another" |

## Navigation model

Top bar (persistent):
- Wordmark "THE DIVINE ATLAS" (left)
- Primary: Cultures · Graph · Stories · Compare · Map · Timeline
- Search icon (opens command-palette overlay, ⌘K)
- Culture theme indicator (dot in the current culture's accent color when inside a culture section)

Culture context: entering any `/cultures/[id]/...` route applies that culture's palette + display typeface via CSS variables (see DESIGN-SYSTEM.md). The chrome (grid, nav, components) never changes — only palette and texture accents. This is the "one museum, many galleries" principle.

## Mobile strategy
- Top bar collapses: wordmark + search + menu.
- Culture sections become a horizontally scrollable strip on home.
- Relationship graph: pinch-zoom + "focus mode" (linear list fallback with back/next — graph is a progressive enhancement).
- Genealogy: vertical stack on mobile, horizontal on desktop ≥1024px.
- Story mode: single column, full-bleed images with caption bars.

## Accessibility targets (WCAG 2.1 AA)
- Full keyboard navigation for graph (arrow keys move focus between nodes, Enter opens profile) and map.
- Every graph edge has a text description exposed via aria-label and the legend.
- Color is never the only signal (relationship types get icons + colors).
- Reduced-motion media query: disable parallax/flip animations.
- All artwork images: meaningful alt text from data (subject + attribution).
- Focus-visible outlines in culture accent color.
