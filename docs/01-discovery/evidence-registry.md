# Evidence Registry — The Divine Atlas

> Owner: BA (retro-documented by orchestrator) · Updated: 2026-09-13
> Labels: FACT (verified) · OBSERVATION · ASSUMPTION · HYPOTHESIS · RECOMMENDATION

| ID | Claim | Label | Evidence | Status |
|---|---|---|---|---|
| EV-001 | Readers prefer graph exploration + story mode over encyclopedic lists | HYPOTHESIS | PO taste decision in Phase 1 chat; no user data | UNTESTED |
| EV-002 | Six v1 culture datasets complete & validated | FACT | `node scripts/validate.mjs` → "✓ no errors" (2026-09-13); 169e/256r/44m/176 art | VERIFIED |
| EV-003 | 95/115 major deities display verified open-license artwork | FACT | `scripts/qa.mjs` 9/9 zero broken images (2026-09-12); browser-verified sample in milestone log | VERIFIED |
| EV-004 | Static JSON scales to ~20 cultures without a DB | ASSUMPTION | 6 cultures ≈ small JSON; `cultures.json` registry pattern | UNTESTED at 20 |
| EV-005 | Met Open Access + Wikimedia Commons cover v1 art needs | FACT | 818→2,036 verified candidates collected (`commons_collect.py`, `met_collect.py`) | VERIFIED |
| EV-006 | All 176 artwork source_urls return HTTP 200 | FACT | bulk verify 2026-09-12; Wikimedia 429s re-verified individually via Commons API + byte-fetch | VERIFIED (stale-check due: 30 days) |
| EV-007 | Playwright smoke: 9/9 routes render with zero console errors | FACT | `scripts/qa.mjs` output 2026-09-12, commit `95b2ebe` | VERIFIED (re-run at Gate 6) |
| EV-008 | Egyptian parallel-creation-tradition model is correct (no merged genealogy exists) | OBSERVATION | Heliopolitan/Memphite/Hermopolitan traditions documented; `research/MYTHOLOGY-MODEL.md` §2 | SCHOLARLY CONSENSUS |
| EV-009 | Slavic data is heavily `reconstructed` by nature of sources | FACT | Primary Slavic sources are late/fragmentary; every reconstructed edge labeled | VERIFIED |
| EV-010 | Comparator "no false equivalence" rule prevents thunder-god equation fallacy | RECOMMENDATION | Mythology scholarship (shared domain ≠ identity); Marduk–Bel, Inanna–Ishtar are real attested links | ADOPTED |
| EV-011 | "Written date ≠ myth date" callout is required on timeline | RECOMMENDATION | Standard historiography practice | ADOPTED |
