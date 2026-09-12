# ADR-001 — Static JSON content model, no database

> Status: accepted · Date: 2026-09-12 (retro-recorded 2026-09-13) · Owner: PO + TBA

## Context
Content is research-derived data (entities/relationships/myths/artworks) that
is edited by a deterministic pipeline, not by end users. A database would add
schema migrations, an ORM, and runtime query complexity for zero user-facing
benefit at v1 scale.

## Decision
- All content lives in `data/<culture>/*.json`, loaded and indexed at build
  time (`app/lib/data.ts`).
- `research/<culture>/` is the immutable provenance trail; `integrate.mjs`
  is the one-way door into `data/`.
- `cultures.json` is the single registry that activates cultures — adding a
  culture is a folder + one entry, zero code changes.
- `scripts/validate.mjs` is the integrity gate ("no invented claims"),
  runnable in dev and build.

## Consequences
- (+) Adding a culture is pure data work (15 cultures pre-registered as
  "coming soon").
- (+) Content is diffable, reviewable in PRs, and portable.
- (−) Search is an in-memory index; fine to ~20 cultures, revisit if we add
  full-text search across huge fields.
- (−) No runtime updates — content changes require a rebuild (acceptable:
  this is a museum, not a feed).

## Alternatives considered
- SQLite + ORM: rejected — no user writes, no join-heavy queries.
- Headless CMS: rejected — research provenance + variant data don't fit a
  form-based CMS; would break the audit trail.
