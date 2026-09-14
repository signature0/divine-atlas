# Design Critique — The Divine Atlas (TASK-011 · Gate 7)

**Date:** 2026-09-14
**Critic:** Hermes (adversarial mode, role 08)
**Target:** prod `http://localhost:3002/` (post-QA build, BUG-001/002 fixed)
**Contracts:** `docs/DESIGN-SYSTEM.md`, `docs/INFORMATION-ARCHITECTURE.md`, `docs/06-ux-ui/*`
**Evidence:** `qa/evidence/TASK-011-*.png` (1440 + 390), `TASK-011-audit.json`, `TASK-011-contrast-fails.json`, probe scripts `scripts/critic-*.mjs`

## Verdict

**FAIL → RESOLVED (2026-09-14).** Original critique: 4 CRITICAL / 4 MAJOR open. All 12 DES
issues (4 CRITICAL, 4 MAJOR, 4 MINOR) are now **DONE** — fixed by Pi/Brand, independently
re-verified by the orchestrator (probe re-runs), and passed a 11/11 Gate-7 QA re-sweep on live
prod `:3002` (`qa/evidence/GATE7-resweep-*.json`). The site is genuinely well-crafted
(restrained museum-editorial system, honest grid, good micro-copy, zero generic-AI-aesthetic
tells: no glassmorphism, no gradient headings, no glowing cards, no filler icons). The original
failures were spec deviations, a site-wide mobile break, and an a11y contract violation — all
closed. See the per-issue status table below.

### Resolution status (all closed 2026-09-14)

| id | sev | owner | fix (commit) | orchestrator verification |
|---|---|---|---|---|
| DES-001 | CRITICAL | Pi | mobile deity overflow fixed (`minmax(0,1fr)` track) | probe: 0 overflow @390 across 159 deity pages |
| DES-002 | CRITICAL | Pi | Compare + Stories added to nav (discoverable) | nav present desktop + mobile |
| DES-003 | CRITICAL | Pi | nav restructure, no orphan row | nav audit clean |
| DES-004 | CRITICAL | Pi | 404 "Lost in the Duat" in-world | /404 themed, 200 |
| DES-005 | MAJOR | Brand | per-culture AA tokens + `--accent-badge-text` | contrast re-audit 0 fails / 12 pages |
| DES-006 | MAJOR | Pi | graph legend AT-exposed | 113 labeled edges |
| DES-007 | MAJOR | Pi | skip link + hero above fold @390 | a11y + fold probe pass |
| DES-008 | MAJOR | Pi | 404 theming (see DES-004) | /404 themed |
| DES-009 | MINOR | Pi | `ec661c0` expansion chips → /about, 1-line home mention | probe-des009: 0 home chips, 11/11 about |
| DES-010 | MINOR | Pi | `68b7d2c` vault header void closed, disclaimer in toolbar | probe-des010: grid 720 <900, mobile no-overflow |
| DES-011 | MINOR | Pi | `8445ed2` identical rel rows grouped | probe-des011: Zeus 1 sib row, Susanoo 10/13 |
| DES-012 | MINOR | Pi | `7f0d738` single gold badge + robust seal fallback (post-hydration check) | probe-des012: forced-fail 19/19 seals, 0 broken |

**QA re-sweep (prod :3002):** 11/11 checks pass, 0 contrast fails — `qa/evidence/GATE7-resweep-*.json`.

---

## Findings (ordered by severity)

### CRITICAL

#### DES-001 — Every deity page (159/159) has horizontal overflow at mobile width
- **Where:** all `/deity/[id]` pages, 390px viewport.
- **What:** `document.scrollWidth = 1002px` on a 390px viewport. Verified on all 159 deity ids
  (probe `scripts/critic-probes.mjs`). The `.profile-grid` mobile override
  (`globals.css:106` → `grid-template-columns: 1fr`) uses plain `1fr`, whose implicit min size is
  `auto`; a descendant's min-content (long unbreakable run of citation spans / inline source
  tooltips, `max-width:720px` block) forces the track to 1002px. The 1440px layout is fine
  (`minmax(0,1fr) 360px`), so this is purely the mobile branch.
- **Why:** every deity profile is a main path. Mobile users get horizontal scroll on the single most
  visited template (159 pages). Same failure class as BUG-002, which QA just cleared — QA's sampled
  routes didn't include a deity page at 390px, so the visual-regression baselines missed it.
- **Fix (verified):** `@media (max-width:1000px){ .profile-grid{ grid-template-columns: minmax(0,1fr); } }`
  — live-injected fix measured 1002→390 on `/deity/gre-zeus`. Add `min-width:0` to grid children as
  belt-and-braces. Re-run full mobile sweep over all 159 ids.
- **Evidence:** `TASK-011-zeus_390.png`, `critic-probes.mjs` output (159/159 @1002px).

#### DES-002 — Top nav omits the search affordance required by the IA contract
- **Where:** `app/components/TopNav.tsx` (all pages).
- **What:** IA `INFORMATION-ARCHITECTURE.md` §Navigation model requires the persistent top bar to
  carry: *wordmark · primary links · **search icon (opens ⌘K overlay)** · culture theme dot*. The
  ⌘K listener exists (`SearchOverlay.tsx:43-53`) but there is **no visible trigger anywhere** — no
  icon, no "Search ⌘K" chip. Mobile strategy ("wordmark + search + menu") has neither search nor a
  collapsed menu.
- **Why:** search is the fastest route to any of 159 entities / 44 myths / 175 artifacts; a power
  feature with zero discoverability is effectively absent. Deviation from approved spec, not taste.
- **Fix:** add a search chip (magnifier + "Search ⌘K") to `TopNav` that opens the overlay
  (lift `open` state up, or dispatch a CustomEvent / context); keep ⌘K as the power-user path.
- **Evidence:** `TASK-011-home_1440.png`, `TASK-011-home_390.png` (no search element in DOM).

#### DES-003 — Nav primary links deviate from the IA navigation model; mobile wraps into an orphan row
- **Where:** `TopNav.tsx` (all pages).
- **What:** IA specifies primary = *Cultures · Graph · Stories · Compare · Map · Timeline*. Shipped
  nav = *Vault · Graph · 6 culture names*. Missing: **Stories** (story mode lives only behind
  per-culture myth lists), **Compare** (`/compare` exists, 200, unlinked), Map/Timeline (TASK-003/006
  still BACKLOG — acceptable, but the nav should not imply they exist). Mobile: the 8 links wrap into
  6+2, leaving an orphaned `SLAVIC · MESOPOTAMIAN` row with a long empty right side (screenshot
  confirmed).
- **Why:** users cannot reach Compare or story mode without already being inside a culture page;
  the IA's "one museum, many galleries" model is undermined when cross-cutting rooms have no door.
- **Fix:** add Compare + Stories entries (or a compact "Rooms" overflow on mobile); if Map/Timeline
  stay BACKLOG, leave them out of the nav (don't show dead labels).
- **Evidence:** `TASK-011-home_390.png`, `app/components/TopNav.tsx`.

#### DES-004 — Graph legend is `aria-hidden` — violates the a11y contract
- **Where:** `/graph`, `GenealogyGraph.tsx:563`.
- **What:** the edge-legend `<div>` (marriage ♥, Creation, Conflict, …) has `aria-hidden` with no
  visible alternative. IA a11y targets require: *"Every graph edge has a text description exposed via
  aria-label and the legend."*
- **Why:** screen-reader users get a 150+-node genealogy canvas whose edge categories are only
  encoded by color/dash/♥ — with the legend hidden, color *is* the only signal, directly violating
  "Color is never the only signal".
- **Fix:** remove `aria-hidden` and make the legend a real `<ul>` with text labels (it already is
  text; just expose it). Optionally duplicate edge-category names into each edge path's `aria-label`.
- **Evidence:** `TASK-011-graph_1440.png`, `GenealogyGraph.tsx:563`.

### MAJOR

#### DES-005 — Culture accent colors fail WCAG AA on small text
- **Where:** home culture cards, culture landing headers, chips, vault rank badges.
- **What:** 33 contrast failures logged (`TASK-011-contrast-fails.json`). Worst: Japanese vermilion
  `rgb(192,57,43)` on `#171716`/`#17171e` at 10.9–11.5px = **3.28–3.61:1** (needs 4.5); Norse
  copper and Egyptian teal similar (3.77–4.18). `--ink-2` `rgb(124,120,105)` sits at 4.03–4.44 on
  card surfaces — under 4.5 at small sizes. DESIGN-SYSTEM claims "AA contrast"; it does not hold for
  accent-on-surface at label sizes.
- **Why:** the accent carries culture identity in exactly the small labels where it fails —
  eyebrow/period text, "Explore →", tier chips.
- **Fix:** define per-culture `--accent-text` (lightened, ≥4.5:1) for text uses; keep saturated
  `--accent` for rules/badges (non-text). Bump `--ink-2` one step for small text or restrict it to
  ≥14px.
- **Evidence:** `TASK-011-contrast-fails.json` (33 rows), `TASK-011-home_1440.png`.

#### DES-006 — No skip link (DESIGN-SYSTEM a11y summary)
- **Where:** `app/layout.tsx` (all pages).
- **What:** DESIGN-SYSTEM.md:139 requires "Skip link; landmarks (nav/main/aside); focus-visible
  accent outline". `main id="main"` exists; there is **no skip-to-content anchor** and no
  `aside` landmark (attribute rail is a plain `<aside>`? — it is `<aside class="attribute-rail">`,
  fine; skip link is the gap).
- **Why:** keyboard users tab through 8 nav links on *every* page of a 200+ page site before content.
- **Fix:** `<a class="skip-link" href="#main">Skip to content</a>` + CSS (visually hidden until
  focus). ~10 lines.
- **Evidence:** `app/layout.tsx` grep (no skip anchor).

#### DES-007 — Home hero wastes the first mobile viewport
- **Where:** `/` hero, 390px.
- **What:** hero `padding: 120px 0 80px` + 2-row nav pushes the H1 below the fold on a 390×844
  screen; first paint is mostly empty dark space (screenshot: large blank band between nav divider
  and eyebrow).
- **Why:** the value proposition (the H1 + one-line codex description) is what a mobile visitor sees
  first — and it isn't visible without scrolling.
- **Fix:** collapse hero top padding at ≤560px (e.g. `padding: 56px 0 40px`), single-row compact nav
  (see DES-003).
- **Evidence:** `TASK-011-home_390.png`.

#### DES-008 — 404 misses its approved theme ("a lost tablet in the Duat")
- **Where:** `app/not-found.tsx`.
- **What:** the page is an elegant *generic* dark-editorial 404 (good type, good micro-copy,
  correct grid) but contains zero in-world cues of the brief: no tablet/inscription motif, no Duat
  tone, generic star glyph in the brand, and `Version 1:` in the footer breaks the mythic voice.
  Composition is also top-heavy: hero in the upper third, footer floating mid-page, ~300px dead
  black below.
- **Why:** this page is a brand moment (every dead link lands here); the concept was approved in
  the UX spec and is absent from pixels and words.
- **Fix:** rewrite copy in-world ("This name was never carved…"), swap star for a culture-neutral
  mark or ankh/djed for the 404, add a faint ochre undertone to the glow, ground the footer to the
  bottom with a hairline rule, drop `Version 1:`.
- **Evidence:** `TASK-011-notfound_1440.png`.

### MINOR / POLISH (backlog)

| id | where | what | fix |
|---|---|---|---|
| DES-009 | home, all viewports | "Expansion path / Coming soon" section (11 culture chips) reads as roadmap scaffolding on a museum facade — the only section that breaks the in-world voice on the front door | move to `/about` (How this is built) or cut; keep 1-line mention |
| DES-010 | `/artifacts` | large void between hero (`mat-band` + lede) and the filter bar at 1440 — first ~250px of the page is empty surface; card grid starts far below fold | tighten header padding, or move the "interpretive — read, not fact" line into the filter row |
| DES-011 | deity pages, relationship list | identical repeated notes: all 5 of Zeus' `SIBLING_OF` rows carry the same "First-born children of Cronus and Rhea." — reads as placeholder filler and inflates the "(29)" count | dedupe in UI (group siblings into one row) or enrich per-row notes in data |
| DES-012 | `/artifacts` cards | rank badge uses per-culture `--accent` background → rarity indicator looks like a random rainbow across the grid (see `TASK-011-vault_1440.png`); also 7/19 remote Wikimedia images not loaded at capture (related to BUG-004 settle issue) | single gold/neutral badge color for rank, accent reserved for culture tags; image fallback seal already exists — verify it fires on error |

**Not findings (checked, passed):** no generic-AI aesthetics detected (no glassmorphism/gradient
headings/glowing cards/filler icons); grid gutters honest on 404/vault; source-tooltip pattern is
consistent; story-mode reading column is comfortable; vault card anatomy is strong (seal fallback,
attribution, tier chip); culture palettes apply correctly per section.

---

## Gate 7 package for PO

- **Blocking:** DES-001…004 (4 CRITICAL). All have verified, small fixes (DES-001 fix already
  measured working; DES-002/004 are ~20-line changes; DES-003 is a nav decision).
- **Recommended path:** PO approves critique → DES-001..004 route to Pi (DES-005 to Brand for the
  token change) → QA re-sweep (mobile deity sweep + contrast re-audit) → critic retest → Gate 7 pass.
- MINOR items (DES-009..012) can ride with the release or the a11y pass (TASK-012), PO's call.
