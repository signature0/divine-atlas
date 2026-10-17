# PHASE 9 (v2) SPEC — Full QA sweep + docs/FINAL_REPORT.md

You are the Phase 9 worker (branch `atlas-v2-2026-10`). Read `docs/PLAN.md` §3 Phase 9 and the v2 brief's Phase 9 + FINAL requirements. This is the last phase: everything from Phases 1–8 must pass a full-site QA sweep, and `docs/FINAL_REPORT.md` must be written.

## D1 — Static build QA sweep (all viewports)
Serve `out/` (e.g. `python3 -m http.server 8899 -d out` in background; kill when done) and run a programmatic sweep (extend/reuse `scripts/qa-sweep.mjs` / Playwright harness already in repo — check what exists first and reuse it):
- **Routes:** every page in `out/**/*.html` (should be ~723+ routes incl. new /print, hero-banner pages, how-to-play). At 380px AND 1440px: 0 console errors, 0 failed requests (404s for images/PDFs/fonts), 0 horizontal overflow (`document.documentElement.scrollWidth <= clientWidth + 1`).
- **Broken links:** internal hrefs resolve to existing files in `out/` (account for trailing-slash/`.html` export conventions). List any broken link with source page.
- **Images:** every `<img>` on sampled pages (all 6 culture pages, /cards, /relics, /print, /how-to-play, /play, /graph, /stories, /compare, /vault, home) loads (naturalWidth>0) and has alt text (or explicit empty alt for decorative). Report lazy-loading coverage on card grids/banners.
- **Performance:** no page references an uncompressed asset > ~2 MB (cards-fronts.pdf is exempt — it is a download, not an inline asset; check it is `loading`-neutral, i.e. a plain link). Banners/cards lazy-loaded below the fold.
- **A11y:** keyboard pass on the new v2 surfaces at 380px: primary nav + More menu + mobile tab bar reachable and operable by Tab/Enter/Escape; card overlay focus trap + Escape close; hero carousel keyboard controls + prefers-reduced-motion respected (emulate `prefers-reduced-motion: reduce` — carousel must not auto-advance); footer mailto link focusable. Color contrast: reuse the WCAG probe from the prior overhaul if present in scripts/ (grep for contrast) — 0 low-contrast failures on key pages.
- **Print CSS:** footer/`@media print` check on one page (emulate print media; no layout break).

Fix what you find (this is implementation work — you may edit app code), re-run until green, and record before/after counts.

## D2 — Gates re-run (fresh, in this order)
`npx tsc --noEmit` → `npx tsx scripts/gen-duel-data.ts` → `npx tsx scripts/enginetest.ts` → `npm run build` → `npm run validate` → `npm run check:art` → `npm run check:prompts` → `python3 scripts/make-pdfs.py all` → `python3 scripts/verify-pdfs.py`. Record pass/fail + key counts for each.

## D3 — docs/FINAL_REPORT.md (the required artifact)
Write `docs/FINAL_REPORT.md` with the 9 required sections from the brief, honestly:
1. **Executive summary** — what v2 delivered (Phases 1–8), branch `atlas-v2-2026-10`, commit range.
2. **Phase-by-phase log** — per phase: what was built, worker (all OpenCode/DeepSeek `deepseek-v4.1-flash-free` sessions — list the session titles from git commit messages), verification evidence (gate outputs, test counts, QA numbers).
3. **Content audit outcomes** — corrections count, description rewrites, stat rebalance, pointer to docs/AUDIT_REPORT.md + docs/UNCERTAIN.md (list open uncertain items).
4. **Art & assets** — unique-art status, duplicate gate results (sha256 + dHash), prompts contract, banner slots, card backs, honest note on the 7 Slavic relic art slots (placeholder panels in PDFs / interim state).
5. **Game** — 2–4P FFA engine, 2P byte-compat regression hash, test counts, How-to-Play structure.
6. **Print pipeline** — PDF inventory with sizes, imposition decision (9-up 3×3 A4, why 10-up was impossible), duplex short-edge math, font limitation (base-14, native scripts omitted), 300 DPI verification.
7. **QA results** — D1 sweep numbers (routes checked, viewports, console errors, broken links, images, a11y, contrast, perf), before/after fixes made in this phase.
8. **Known limitations & honest gaps** — anything NOT done or approximated (e.g. woff2→TTF not done, native scripts absent from PDFs, image generation pipeline external, anything the sweep flags as accepted).
9. **Resume instructions** — how to rebuild everything from a clean checkout: npm install, gen scripts, make-pdfs requirements (python3 + reportlab + Pillow + poppler), how to re-run every gate, how to regenerate PDFs, where each spec/report lives. Include the note that no OpenCode/DeepSeek stop occurred (or if one did, exactly what/when/how to resume — check git history; if a phase was re-dispatched, say so honestly).

Do NOT fabricate numbers — every figure in the report must come from a command you actually ran in this session (paste the command next to the number).

## Gates you MUST run and pass before finishing
All of D2 green + the D1 sweep reporting 0 console errors / 0 broken links / 0 overflow failures (or an explicit, documented exception list in FINAL_REPORT §8 — no silent exceptions).

## Output
Print: D2 gate table, D1 sweep summary, list of fixes made in Phase 9, files changed. Do NOT run `git add` or `git commit`.
