---
id: TASK-002
title: Story mode (/myths/[id])
type: STORY
status: REVIEW
priority: high
owner: pi
severity:
created: 2026-09-13
updated: 2026-09-13
source: docs/03-requirements/requirements.md
implements: [REQ-007]
depends_on: []
blocks: []
evidence:
  - commit be0f41d (route: app/myths/[id]/page.tsx, app/components/StoryProse.tsx, globals.css story-mode tokens; 1-line CTAs on culture/deity pages)
  - commit 037df80 (data fix: egyptian/mesopotamian variants {label,text} -> {name,description} per schema)
  - files: app/myths/[id]/page.tsx, app/components/StoryProse.tsx, app/globals.css, app/culture/[culture]/page.tsx, app/deity/[id]/page.tsx, data/egyptian/myths.json, data/mesopotamian/myths.json, docs/07-development/dev-notes.md
  - node scripts/validate.mjs: "✓ no errors"
  - npx tsc --noEmit: exit 0
  - next build: /myths/[id] SSG with all 44 paths (7 jpn + 11 gre + 7 nor + 8 egy + 5 slv + 6 mes)
  - prod :3002 (systemd divine-atlas) restarted; DOM-only checks on ALL 44 pages pass: display-type chapter headings (h2.display-l per chapter, in order), entity chips -> /deity/[id] (520 chips, incl. hyphen variant Yamata-no-Orochi -> /deity/jpn-yamata-no-orochi), variant accordions <details open> on all 13 myths with non-empty variants (both/all versions visible, none truncated; 6 myths have variants:[] -> no accordion by design), per-chapter [S#] footnote chips resolving via culture sources, uncertainty callout on all 38 myths with uncertainty_notes, framing banners on all 44, artwork hero + interleaved figures with alt text on 3 illustrated Japanese myths (jpn-creation-islands, jpn-amaterasu-cave, jpn-susanoo-orochi)
  - spot-check >=2 per culture: done for all 44 (superset)
  - 404 for unknown id (/myths/nope-123 -> 404)
qa_result:
---

## Description
Scrollytelling myth pages from `myths.json` (chapters structure already
present). This is the "stories" experience the IA doc defines: narrative
mode, not an encyclopedic entry.

## Acceptance Criteria
- [ ] `/myths/[id]` renders chapters in order with display-type headings
- [ ] Entity names inline as chips linking to deity profiles
- [ ] Variant accordions where `myth.variants` exists (both versions visible)
- [ ] Per-chapter source footnotes ([S#] → culture bibliography)
- [ ] `uncertainty_notes` surfaced as a reader-facing callout
- [ ] Illustrated chapters show artwork figures with alt text (TECH-005)
- [ ] Works for all 44 myths across 6 cultures (spot-check ≥2 per culture)

## Implementation Reference
Commits be0f41d + 037df80. New: app/myths/[id]/page.tsx (SSG, generateStaticParams over all 44 myths, prev/next within culture), app/components/StoryProse.tsx (per-culture name matcher: primary names + hyphen variants, case-sensitive, boundary-aware, longest-first; [S#] via existing SourceFootnote). CSS: .entity-chip, .story-col, .chapter, .chapter-src, .story-figure, .uncertainty-callout, .variant-acc (globals.css, existing tokens only). Art: first artwork = hero plate, rest distributed evenly across chapters (schema has no per-chapter art map — see docs/07-development/dev-notes.md). CTAs: culture page myth card -> /myths/[id]; deity page myth card -> /myths/[id]. Data fix: 6 variant entries in egyptian/mesopotamian myths.json renamed {label,text} -> {name,description} per docs/DATA-SCHEMA.md.

## QA Notes
{filled by QA}
