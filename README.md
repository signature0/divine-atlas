# The Divine Atlas — Interactive World Mythology Explorer

> Studio OS project · Created 2026-09-12 (pre-Studio-OS) · Adopted into Studio OS 2026-09-13 · PO: Mazen · Orchestrator: Hermes · Engineer: Pi

## Status
- **Stage:** IMPLEMENTATION (Phase 2 shipped; QA + design review next — Gates 5–7 pending)
- **Last updated:** 2026-09-13
- **Next action:** formal QA pass (Gate 6) + design critique (Gate 7), then PO Gate 8 (release readiness)

## What this is
A "digital museum / ancient manuscript codex" explorer for world mythology.
Graph-based (not tree-based), variant-preserving, source-cited by default.
Explicitly **not** Wikipedia-styled and **not** a fantasy game.

Six cultures live (Japanese, Greek, Norse, Egyptian, Slavic, Mesopotamian):
169 entities · 256 relationships · 44 myths · 176 verified open-license artworks.
15 more cultures are drop-in via data only (see `data/cultures.json`).

## Where things live
| Area | Path |
|---|---|
| Project docs (knowledge base) | `docs/00-project/ … 12-post-release/` |
| Pre-existing architecture docs | `docs/DATA-SCHEMA.md` · `docs/INFORMATION-ARCHITECTURE.md` · `docs/DESIGN-SYSTEM.md` |
| Requirements (REQ/TECH/UX) | `docs/03-requirements/requirements.md` |
| Evidence registry (EV) | `docs/01-discovery/evidence-registry.md` |
| Roadmap / scope (MVP · NEXT · LATER) | `docs/00-project/roadmap.md` (owned by PM) |
| Research provenance ("show your work") | `research/` (per-culture JSON + `MYTHOLOGY-MODEL.md`) |
| Content data (app input) | `data/<culture>/*.json` + `data/cultures.json` |
| Board (issues) | `issues/` — run `board.py board` |
| Decisions (ADR + gates) | `decisions/` |
| Handoffs | `handoffs/` |
| QA evidence + visual baselines | `qa/` (evidence/ + baseline/) |
| Code (Next.js 15, App Router) | `app/` |
| Scripts (validate/integrate/qa) | `scripts/` |

## Board quick commands
```bash
B="python3 /AI/agents/workspaces/studio-os/scripts/board.py"
$B board            # kanban
$B coverage         # requirement traceability
$B research         # evidence registry (EV-xxx) + flags
$B gates            # quality gates
$B show REQ-001     # one issue + its trace chain
```

## Conventions (read before working here)
- `/AI/agents/workspaces/studio-os/STUDIO-MAP.md` — front door (source order, "never guess" rule)
- `/AI/agents/workspaces/studio-os/CONVENTIONS.md` — IDs, frontmatter, git, correction routing (§9)
- `/AI/agents/workspaces/studio-os/ORCHESTRATION.md` — pipeline, gates, handoffs

## Run it
```bash
npm install
npm run dev          # dev server, port 3002
node scripts/validate.mjs   # data integrity gate ("no invented claims")
node scripts/qa.mjs         # Playwright smoke (needs running server)
```

## Document index
| Doc | Status |
|---|---|
| 00-project/brief.md | approved (retro-documented from Phase 1-2 work) |
| 00-project/plan.md | approved |
| 00-project/roadmap.md | active |
| 01-discovery/evidence-registry.md | active |
| 03-requirements/requirements.md | draft — pending PO Gate 2 |
| DATA-SCHEMA.md · INFORMATION-ARCHITECTURE.md · DESIGN-SYSTEM.md | shipped with code |
