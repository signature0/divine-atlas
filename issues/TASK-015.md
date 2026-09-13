---
id: TASK-015
title: Integrate artifact datasets (6 cultures) into data/<culture>/
type: RESEARCH
status: DONE
priority: high
owner: hermes
severity:
created: 2026-09-13
updated: 2026-09-13
source: docs/03-requirements/requirements-artifacts.md
implements: [REQ-017, REQ-018, REQ-019, REQ-020, REQ-021, REQ-022, REQ-023, ADR-002]
depends_on: []
blocks: [TASK-016, TASK-017, TASK-018]
evidence: [research/artifacts/*/artifacts.json, data/<culture>/artifacts.json, data/<culture>/artifact_artworks.json]
qa_result:
---

## Description
The 6 culture research agents produce verified artifact JSON in
`research/artifacts/<culture>/` (artifacts.json, artifact_artworks.json,
sources.md, notes.md). This issue = integrate them into the app's canonical
input `data/<culture>/` following ADR-002, and extend the "no invented
claims" validator to cover artifacts.

## Steps
1. Wait for all 6 research batches (Norse, Greek, Japanese, Egyptian,
   Mesopotamian, Slavic) to land in `research/artifacts/`.
2. Review each `notes.md` + `artifacts.json` against the contract: schema
   field names, image honesty (label + honesty_note + image_type present for
   every artifact), [S#] markers resolve, entity/myth ids exist in
   `data/<culture>/entities.json` / `myths.json`, power values are 0–10 ints,
   rank tier/letter in allowed enums, source_confidence HIGH/MEDIUM/LOW.
3. Copy/refine `artifacts.json` + `artifact_artworks.json` into
   `data/<culture>/`. Merge artifact sources into `data/<culture>/sources.md`
   (extend the [S#] numbering so it does not collide with existing refs —
   renumber artifact refs to continue the culture's existing max S#).
4. Add the artifact↔entity relationship edges to
   `data/<culture>/relationships.json` (OWNS / CREATED / USED / etc.) with
   confidence + sources.
5. Extend `scripts/validate.mjs` with the artifact checks (see
   requirements-artifacts.md NFR-ART-003). Keep the existing checks green.

## Acceptance Criteria
- [ ] All 6 cultures have `data/<culture>/artifacts.json` (may be `[]` for a
      culture with nothing yet — Slavic may be 1–3).
- [ ] Every artifact: unique `slug`, `hero_artwork` set, `image.label` +
      `image.honesty_note` + `image.image_type` present, ≥1 ability with
      `certainty`, `power_profile` 0–10 ints, `rank.tier` + `rank.letter` valid,
      `source_confidence` set.
- [ ] Every `owner`/`creator`/`associated_*`/`major_myths` id resolves to a
      real entity/myth id in that culture.
- [ ] Every `[S#]` in artifact text resolves to a line in that culture's
      `sources.md`.
- [ ] `node scripts/validate.mjs` is green (no new failures).
- [ ] At least 10 artifacts total with a verified 200 `image_url` (the "first
      ten exceptionally polished").

## Implementation Reference
{filled by Hermes on completion}

## QA Notes
{filled by QA}


status IN_PROGRESS -> DONE (2026-09-13) — 19 artifacts across 5 cultures in data/<culture>/artifacts.json; 36 relationship edges added; backfilled missing confidence/sources on 20 edges; validate.mjs green
