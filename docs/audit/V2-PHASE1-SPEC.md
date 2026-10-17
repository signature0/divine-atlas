# PHASE 1 (v2) SPEC — Content audit report + description rewrites + stat balance

You are the Phase 1 worker for the Divine Atlas v2 overhaul (branch `atlas-v2-2026-10`). Read `docs/PLAN.md` §3 Phase 1 first. Prior audit work already landed on this repo: `docs/audit/PHASE1-FINDINGS.md` (69 corrections, graded F1–F40 / S1–S11 / G1–G7), `docs/UNCERTAIN.md` (disputed items), and the fixlog in `docs/CHANGELOG.md`. Data fixes are DONE — this phase authors the report, strengthens weak descriptions, and reviews stat balance.

## Deliverable 1 — `docs/AUDIT_REPORT.md` (the brief's required artifact)
Structure:
1. **Method** — what was audited (6 cultures, 158 entities, 26 artifacts, 44 myths, comparisons), against which source classes (Hesiod/Homer, Edda/Snorri, Pyramid Texts/Plutarch, Rig Veda/Avesta, Kojiki/Nihon Shoki, Primary Chronicle/folk collections, etc. — use the sources already in `data/*/sources.json`).
2. **Corrections table** — every F/S/G item from `PHASE1-FINDINGS.md` as: id | before | after | why (source). Cross-reference `docs/UNCERTAIN.md` for debatable items instead of re-deciding them.
3. **Missing content** — gaps worth adding later (e.g. 7 Slavic relic art slots, thin domains), listed not invented.
4. **Weak descriptions** — the ones you found and rewrote (below), before/after.
5. **Stat balance review** — table per culture: each card's PWR/GRD vs mythological standing; flag outliers; list any adjustments made (before/after/why) and any you deliberately left alone.

## Deliverable 2 — description rewrites (in-place, data JSON)
- Scan all 158 entities + 26 artifacts: `description_short` is the CARD SUMMARY LINE (≤~140 chars, vivid, concrete, myth-anchored — no generic "powerful god of X" filler); `description_long` is the DETAIL STORY (proper mini-narrative, 2–5 sentences).
- Rewrite the weakest (including the 2 shorts <60 chars and 2 longs <180 chars the plan flagged, plus any generic/flat ones you find). Accuracy first: stay strictly within myths already sourced in the repo (`myths/`, `sources.json`) — the `npm run validate` gate enforces no invented claims, and you must not add unsourced claims either.
- Native-script names, gender, epithets must match existing audited fields — do not reintroduce errors.

## Deliverable 3 — PWR/GRD consistency pass
- Rubric (document it in the report): PWR = mythological power/sovereignty tier (sky-father/creator ≈ top; minor local/nymph-tier ≈ bottom); GRD = protective/defensive role in sources.
- Find clear inconsistencies (e.g. a nymph-tier figure outranking a pantheon head, or a guardian deity with bottom-tier GRD). Fix ONLY clear-cut cases in the data; borderline stays as-is and gets a note in the report. Every change: before/after/why in the report.

## Gates you MUST run and pass before finishing
`npx tsc --noEmit && npm run build && npm run validate`
Then print: number of descriptions rewritten, stats adjusted, and the AUDIT_REPORT.md section list.

## Hard rules
- Do NOT run `git add` or `git commit`.
- Do NOT touch files outside: `docs/AUDIT_REPORT.md`, `data/*/entities.json`, `data/*/artifacts.json` (descriptions/stats only — no structural changes, no new/removed entries).
- Uncertain/debatable content: never silently change; it belongs in `docs/UNCERTAIN.md` (append only if you genuinely find new disputes, with your reasoning).
