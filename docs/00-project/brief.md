# Project Brief — The Divine Atlas

> Owner: orchestrator · Status: approved (retro-documented) · Updated: 2026-09-13

## One-liner
A museum-grade, graph-based digital explorer of world mythology where every
claim is source-cited, every variant is preserved, and nothing is invented.

## Product Vision
A single "museum" where six (later 20+) mythological traditions are explored
with the rigor of a codex and the beauty of a high-end exhibition. Deities are
nodes in a relationship graph; myths are stories that walk the graph;
disagreements between ancient sources are first-class citizens, not footnotes.

## Business Goals
- Ship a v1 public site with 6 cultures and a clean expansion path to 20+.
- Demonstrate the Studio OS multi-agent pipeline end-to-end (this project is
  the framework's reference project).
- Zero invented claims — the data integrity validator (`scripts/validate.mjs`)
  is the project's quality bar and must stay green in CI.

## Stakeholders
| Who | Role | Involvement |
|---|---|---|
| Mazen | Product Owner / Client | Approves gates, final say on taste/scope |
| Hermes | Orchestrator | Runs pipeline, verifies gates 5-6 with evidence |
| Pi (Qwen 3.8 27B) | Engineering | Implementation via `pi-engineer.sh` |

## Assumptions
- HYPOTHESIS: readers (mythology enthusiasts, students, designers) prefer
  graph exploration + story mode over encyclopedic lists. [EV-001]
- FACT: the six v1 cultures' datasets are complete and validated. [EV-002]
- FACT: open-license artwork (Met Open Access, Wikimedia Commons, museum PD)
  covers 95/115 major deities; the remaining 20 are minor figures. [EV-003]
- ASSUMPTION: static JSON (no DB) scales fine to ~20 cultures. [EV-004]

## Open Questions
- Release target (GitHub Pages / Vercel / self-hosted) → PO, before Gate 8
- Whether "coming soon" cultures should show placeholder pages in v1 → PO, Gate 2

## Success Metrics
- `validate.mjs` green on every commit (no dangling refs, all [S#] resolve)
- QA: 100% of routes render with zero console errors (Playwright)
- Visual regression: PASS at 390/768/1440/1920px (Gate 6)
- All deity profile pages display a linked artwork or an explicit "no image"
  treatment (currently 95/115 major deities have verified art)
