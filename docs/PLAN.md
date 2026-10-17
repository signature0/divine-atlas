# Divine Atlas — v2 Master Plan

**Brief:** 9-phase v2 overhaul (content audit → navigation → hero banners → card redesign → unique art → card game → print PDFs → footer → QA), ending in `docs/FINAL_REPORT.md`.
**Branch:** `atlas-v2-2026-10`
**Author:** Hermes (orchestrator), planning pass. Every gap below was checked against the actual code, not assumed.
**Date:** 2026-10-17
**Supersedes:** the pre-v2 overhaul plan (`atlas-overhaul-2026-10`, kept on its own branch; root `FINAL_REPORT.md` describes it).

---

## 1. Verified gap table (phase → status → evidence)

| Phase | Status | Evidence (file:line) |
|---|---|---|
| **1. Content audit** | **PARTIAL** | Prior audit done: `docs/audit/PHASE1-FINDINGS.md:1` (69 corrections, all graded F/G/S/U), `docs/UNCERTAIN.md:1` (30+ disputed items preserved). **`docs/AUDIT_REPORT.md` MISSING** — `docs/` has no such file (confirmed by `ls docs`). Description quality is ~complete but not purpose-built: `data/*/entities.json` → 158 entities, 0 empty `description_short`/`description_long`, only 2 short <60 chars and 2 long <180 chars. No card-summary-line vs long-story split, no PWR/GRD-vs-mythology balance review documented. |
| **2. Navigation redesign** | **MISSING** | `app/components/TopNav.tsx:14-24` — one flat `.links` block: Deck, Play, Vault, Graph, Stories, Compare + 6 inline culture links. No dropdown/mega-menu, no "More" menu, no SVG nav-icon set, no mobile bottom tab bar / slide-out. Only icon system that exists is the per-element `Sigil` used on cards (`DeityCard.tsx:44`), not nav icons. |
| **3. Hero banners** | **MISSING/PARTIAL** | No hero-banner component anywhere (`grep` for `HeroBanner`/`PageHero`/`SiteHeader` → nothing). Home is a text hero: `app/page.tsx:40-61` (`.home-hero`, 0.05-opacity gradients, no image, no carousel). Other pages get text headers only (`app/cards/page.tsx:28`, `app/play/page.tsx:13`, `app/culture/[culture]/page.tsx:42`). `FramingBanner.tsx:3-9` is a one-line text strip, not a banner. No carousel, no swipe/dots/auto-advance, no `prefers-reduced-motion` banner handling. |
| **4. Card redesign (phone-first)** | **PARTIAL** | Card system exists: `CardDetailOverlay.tsx:69` (tap-to-expand dialog, focus trap, swipe-down, deep-link), `CardDeck.tsx`, grid/list/hand in `app/cards`, `RelicCard.tsx`. **Flip buttons STILL EXIST** and must be removed per brief: `FlippableCard.tsx:55-64` (`aria-label={... 'Flip card to reverse'}`) and `RelicCard.tsx:209-220` (`aria-label={... 'Flip relic to reverse'}`). **Art-box mismatch:** card ratio is `2.5/3.5 = 0.7143` (`globals.css:410`), PNGs are `1024×1440 = 0.7111` (measured `greek-gre-aegis.png`), and the art *window* is a sub-region of the face (`globals.css:458-461`, `object-fit: cover`) — so images are cropped, not generated to the art box. Relic card exists and is visually distinct (`RelicCard.tsx:107-111` "RELIC" band, vault frame). |
| **4b. Relic card type** | **DONE** | 26 artifacts across 6 cultures (`data/<culture>/artifacts.json`; slavic added Phase 4). `RelicCard.tsx` shows owner/wielder, rarity, flavor, abilities; visually distinct frame. Gap is only the shared card-system rework (flip removal, art box). |
| **5. Unique card art** | **PARTIAL** | 184 deterministic prompts (`data/art-prompts.json` → `items`, 184). Style guide `docs/ART_STYLES.md`. **178/184 PNGs on disk** — 7 Slavic slots missing (`public/cards/slavic/slavic-slv-{perun-axe,perun-belt,veles-shapeshift,mokosh-spindle,morana-effigy,jarilo-green-oak,svarog-forge-tongs}.png`), 1 orphan (`public/cards/mesopotamian/mesopotamian-mes-erishkigal-consort.png`, the merged-away duplicate). **No automated hash/similarity duplicate check exists** (no such script in `scripts/`). Caption sits ON the art: `DeityCard.tsx:117` + `art-slot.ts:22` (`GENERATED_ART_CREDIT = 'generated reconstruction · The Divine Atlas'`), likewise `RelicCard.tsx:127` — brief wants it in detail/footer. Banners have no art slots yet (Phase 3 creates them). |
| **6. Card game** | **PARTIAL** | "Pantheon" exists: pure 2-player engine `app/lib/pantheon.ts` (552 lines, seeded, replay-identical), rules at `app/how-to-play/page.tsx:37` ("A two-player elemental duelling game"), printable mat `app/how-to-play/board`, digital hot-seat `app/play`. **Engine is hard-coded to 2 players:** `type PlayerId = 0 \| 1` (`pantheon.ts:38`), `players: [PlayerState, PlayerState]` (`pantheon.ts:83`), `other()` two-way (`pantheon.ts:225-226`). Brief wants **2–4 players**. |
| **7. Print-ready PDFs** | **MISSING** | No PDF pipeline and no PDF dependency: `ls node_modules \| grep -i pdf` → empty; `package.json` has no pdf lib; only browser print CSS exists (`app/cards/print/page.tsx`, `globals.css:677+`). Card backs exist but are browser-rendered only: `DeityCard.tsx:87-94` (`.tc-back`), `RelicCard.tsx:70-101` (`.rc-back`). No 63×88 mm/bleed/crop-mark script, no board/rules-booklet PDF, no site Download/Print page. |
| **8. Footer** | **MISSING** | Site footer exists (`app/layout.tsx:49-57`: brand, six galleries, sourcing note, artwork note) but has **no "Design by Mazen Pasha" and no `mailto:`** (grep for `mazen`/`mailto` → nothing). |
| **9. QA** | **PARTIAL** | Prior sweep green: 723 routes × 2 viewports (root `FINAL_REPORT.md`, Phase 7 row); harness in `scripts/qa-sweep.mjs`, `qa-mobile*.mjs`, `validate.mjs`. Must be re-run after every v2 phase; `docs/FINAL_REPORT.md` (the v2 required artifact) does not exist yet — only the root `FINAL_REPORT.md` from the prior overhaul. |

Legend: **DONE** = meets brief · **PARTIAL** = exists but misses named requirements · **MISSING** = absent.

---

## 2. Project map (updated from the prior plan; stale items corrected)

- **Stack:** Next.js 15 (`^15.5.25`), React 19, static export (`next.config.js` `output: export`, `images.unoptimized`), Cloudflare-Pages-friendly. No server code. Self-hosted fonts. No new runtime deps except as flagged in §5.
- **Data:** `data/<culture>/{entities,artifacts,myths,relationships,artworks,sources,cosmology,timeline,uncertainties}.json` for japanese, greek, norse, egyptian, slavic, mesopotamian.
  - **Entities: 158** (jpn 21, gre 41, nor 40, egy 25, slv 13, mes 18). *(Prior plan said 159 / mes 19 — one Mesopotamian duplicate was merged in Phase 1.)*
  - **Artifacts: 26** (jpn 4, gre 5, nor 6, egy 3, slv 7, mes 1). *(Prior plan said 18; Slavic's 7 relics + Phase-4 work added the rest.)*
  - **Myths: 44**; Schema in `docs/DATA-SCHEMA.md`.
- **Card art:** `public/cards/<culture>/<culture>-<id>.png`, 1024×1440 (≈5:7), 178 present. **Untracked, ~513 MB, gitignored** (`.gitignore`: `public/cards/`) — deploy separately; do not commit.
- **Art prompts:** `data/art-prompts.json` — 184 items `{id,kind,culture,name,gender,slot,prompt,negative_prompt}`; style guide `docs/ART_STYLES.md`.
- **UI:** `app/components/` — DeityCard, RelicCard, FlippableCard, CardDeck, CardDetailOverlay, EntityCard, TopNav, SearchTrigger/SearchOverlay, RelationshipGraph, GenealogyGraph, GraphViewSwitch, CosmologyMap, FramingBanner, ArtworkFigure, StoryProse, SourceFootnote, PrintButton, `play/{DuelCard,DuelClient}`.
- **Pages:** `/`, `/cards`, `/cards/[id]`, `/cards/print`, `/artifacts`, `/artifacts/[slug]`, `/graph`, `/stories`, `/compare`, `/culture/[culture]`, `/deity/[id]`, `/myths/[id]`, `/domain/[domain]`, `/play`, `/how-to-play`, `/how-to-play/board`, `/about`, `not-found`.
- **Game engine:** `app/lib/pantheon.ts` (2-player, pure/deterministic) + `pantheon-data.ts` (fs-free snapshot) + `scripts/enginetest.ts`.
- **Verification:** `npm run validate` (`scripts/validate.mjs` — "no invented claims" enforcement), `npx tsc --noEmit`, `npm run build`, Playwright harnesses in `scripts/`.
- **Known data smells still open:** legacy ids kept for URL stability (`mes-apas`=An, `nor-sid`=Svaðilfari, `egy-isfet`=Isis, `nor-loomi`=Loki, `nor-anguela`=Angrboða) — see `docs/UNCERTAIN.md:44`; 1 orphan PNG; 7 missing Slavic PNGs.

---

## 3. Phase-by-phase plan (v2)

Global dispatch rule for every phase: an OpenCode worker (`opencode/deepseek-v4.1-flash-free`) implements from a phase spec under `docs/audit/`; Hermes verifies with `npm run validate` + `npx tsc --noEmit` + `npm run build` + a Playwright functional pass **before** the next phase; commit only after green, updating `docs/CHANGELOG.md`. The orchestrator writes a `PHASE<N>-SPEC.md` before each phase.

### Phase 1 — Content audit → `docs/AUDIT_REPORT.md`
- **Deliverables:** `docs/AUDIT_REPORT.md` covering all religions/gods/relics/stories/comparisons: per-fix **before / after / why** (reuse the 69 items in `PHASE1-FINDINGS.md` and the fixlog in `docs/CHANGELOG.md`); missing content; weak descriptions with suggested rewrites; per-card **summary line + longer detail story**; explicit PWR/GRD stat consistency & balance review vs mythology. Debatable items stay in `docs/UNCERTAIN.md` (already populated).
- **Acceptance:** every F1–F40/S1–S11/G1–G7 entry from `PHASE1-FINDINGS.md` is either reported-fixed with before/after or cross-referenced to `UNCERTAIN.md`; description rewrites supplied for the weakest god/artifact summaries; stats table flags any card whose PWR/GRD diverges from source evidence.
- **Notes:** do not silently change data; this phase authors a report only (data fixes already landed). Keep `description_short` as the card summary line and `description_long` as the detail story.

### Phase 2 — Navigation redesign
- **Deliverables:** rework `TopNav.tsx` to primary-only: **Religions** (dropdown/mega-menu, six pantheons) · Relics · Cards · search icon (`SearchTrigger`) · **More** (Play, Vault/Artifacts, Graph, Stories, Compare, everything else), grouped. Custom **SVG icon set** (consistent line style) for the 6 religions + Relics, Cards, Play, Graph, Stories, Compare, Vault. Phone: compact header + bottom tab bar or slide-out, ≥44 px targets, active-page highlight, search shortcut retained.
- **Acceptance:** at 380 px no horizontal overflow; every icon is inline SVG (no icon-font/CDN); active route highlighted; keyboard opens/closes menus; reduced-motion respected; search reachable in one tap.
- **Notes:** new `app/components/icons.tsx` (or similar) for the shared set; reuse on menus and cards.

### Phase 3 — Hero banners (+ home carousel)
- **Deliverables:** a reusable `HeroBanner` used on all main pages (6 religion pages, Relics, Cards, Play, Graph, Stories, Compare, Vault): unique image, title, tagline, mobile-readable overlay. Home hero becomes a **carousel** over all content categories: auto-advance, pause on hover/touch, swipe, dots/arrows, keyboard accessible, `prefers-reduced-motion`, lazy-loaded.
- **Acceptance:** each page has a distinct banner image + title + tagline; carousel pauses on interaction, is swipeable and arrow/dot navigable, respects reduced-motion, lazy-loads; text passes contrast on the image at 380 px.
- **Notes:** banner art is generated under the Phase-5 rules; until then use per-page CSS/SVG interim art (never one shared image). Coordinate filenames with Phase 5 slots.

### Phase 4 — Card redesign (phone-first) + ART BOX FIX
- **Deliverables:**
  - **Remove** the flip affordance from `FlippableCard.tsx:55-64` and `RelicCard.tsx:209-220`; keep the reverse content only in the detail view.
  - Hierarchy art → name+native → religion badge+type → one-line summary → key stats; rest only in `CardDetailOverlay`. Larger, higher-contrast text; tidy rarity/ID/source tags.
  - Expanded view keeps large art, full story, family, domains, symbols, relics, stats, sources; close via swipe-down / tap-outside / back; reduced-motion respected. Layouts grid / compact list / hand retained.
  - **ART BOX FIX:** measure the real art placeholder, lock ONE aspect ratio, regenerate images at exactly that ratio with full-figure composition + safe margins; `object-fit:cover` only as fallback; verify nothing important is cut at every breakpoint.
  - Relic card polish (distinct from god cards) consistent with the new hierarchy.
- **Acceptance:** no flip button anywhere; one documented art ratio shared by CSS and `data/art-prompts.json`; at 380/768/1440 px the focal subject is never cropped; overlay opens/closes by all four paths with keyboard + reduced-motion.
- **Notes:** the fix is a data+CSS contract — write the chosen ratio into `docs/ART_STYLES.md` and the prompt `composition` fields before Phase 5 art runs.

### Phase 5 — Unique card art + duplicate gate
- **Deliverables:** unique art for **every** god card, relic card, and banner; an **automated hash/similarity duplicate check that FAILS on duplicates**, with its result written into the phase report; art grounded in original legend (explicit gender/age/appearance/attributes/animals/clothing/held relics/signature myth/setting/mood; traditional mythology, not pop culture; personality per deity); per-religion style sets documented in `docs/ART_STYLES.md`; per-card prompt fields (subject, gender, appearance, pose, clothing, relics, setting, mood, composition for the exact aspect ratio, style tag, negative prompt, filename) in `data/art-prompts.json`. If an image-gen tool is reachable from OpenCode, generate + wire; **else** ship prompts + unique per-card SVG/CSS interim illustrations wired by filename. **Never one shared image.** Move the "generated reconstruction" note off the art (`DeityCard.tsx:117`, `RelicCard.tsx:127`, `art-slot.ts:22`) into the detail view/footer.
- **Acceptance:** duplicate-gate script exits non-zero on any repeated/near-identical image and exits 0 on the real set; 184/184 card slots + all banner slots have a unique asset or a unique interim SVG; report records hashes; caption no longer over the art.
- **Notes:** the 7 missing Slavic PNGs and the 1 orphan (`mes-erishkigal-consort`) are resolved here. The existing external PNG pipeline writes into `public/cards/`; the plan assumes that as the default and treats in-OpenCode generation as optional. **Do not run a real generation during planning.**

### Phase 6 — Card game 2–4 players
- **Deliverables:** extend the game to **2–4 players** (or, if the user prefers, document a 2-player-only scope — see §5), including goal, setup, turn structure, card types, myth-derived stats/abilities, religion synergies, win conditions, balance notes; board as SVG/HTML if needed. "How to Play" page: quick start, illustrated card anatomy, step-by-step turn walkthrough, keyword glossary, worked example round, FAQ.
- **Acceptance:** engine + UI play correctly with 2, 3 and 4 seats (rotating turn order, per-seat pillars, `scripts/enginetest.ts` extended); deterministic replay still byte-identical; rules page covers every keyword used.
- **Notes:** `pantheon.ts` is currently 2-player by construction (`PlayerId`, `players` tuple, `other()`); this is the main refactor of the phase — widen the tuple, generalize `active`/turn advance, keep purity and seeded RNG.

### Phase 7 — Print-ready PDFs
- **Deliverables:** card-back design (unique pattern/border/logo matching site style; optional per-religion variants); a **regenerable repo script** producing: (1) all god+relic cards at **63×88 mm poker size, 3 mm bleed, crop marks**, fronts/backs arranged for duplex; (2) board A3 (+A4 if practical); (3) rules booklet; (4) tokens/reference sheets if needed. A site **Download/Print** page: links + printing instructions (paper, duplex flip, cutting).
- **Acceptance:** PDFs open, fonts embedded, images ~300 DPI, front/back positions align; script re-runs cleanly from `package.json`; page reachable and linked from nav/footer.
- **Notes:** **PDF-library decision is an open question (§5).** Prefer zero-dep PDF writing (hand-rolled PDF via Node `fs`/`zlib`, both already available) or a script using only existing `node_modules`; a new npm dependency requires prior approval per ground rules.

### Phase 8 — Footer
- **Deliverables:** every page footer shows **"Design by Mazen Pasha"** with a clickable **`mailto:maz.basha@gmail.com`**, clean and readable on mobile, alongside the existing footer copy (`app/layout.tsx:49-57`).
- **Acceptance:** text + mailto present on every route; tap target adequate at 380 px; contrast AA.

### Phase 9 — QA + final report
- **Deliverables:** phone/tablet/desktop viewport pass; console errors; broken links; image loading/sizes; performance (compression + lazy-load); a11y (contrast, focus order, alt text, keyboard); clean build/deploy. Then `docs/FINAL_REPORT.md` with the **9 required sections**, including any OpenCode/DeepSeek stop point and resume instructions.
- **Acceptance:** 0 console errors and 0 broken links at 380/768/1440; `npm run build` green; `npm run validate` clean; `docs/FINAL_REPORT.md` complete with resume instructions.

---

## 4. Ground rules

- **Static export only** (`output: export`); free hosting; no paid services.
- **No new npm dependencies** unless a phase proves one unavoidable **and** the plan flags it for user approval first (esp. Phase 7 PDFs — check `node_modules` first).
- **Mobile-first 380 px**, then tablet/desktop. SSR/hydration-safe. `prefers-reduced-motion` respected everywhere.
- Every phase: implement → verify (`validate` + `tsc --noEmit` + `build` + functional QA) → `docs/CHANGELOG.md` → commit. Never proceed on red.
- Never delete content unless factually wrong; fix or flag. Uncertain → `docs/UNCERTAIN.md`, never silent.
- Generated card art stays out of git (`.gitignore` `public/cards/`); deploy separately.
- Only `docs/PLAN.md` is written by this planning pass; no implementation, no commits.

---

## 5. Open questions needing user approval

1. **PDF library (Phase 7).** Zero-dep hand-rolled PDF writer vs adding one dependency (e.g. a PDF lib). Ground rules forbid new deps without approval. **Recommendation:** zero-dep for the card/board/booklet PDFs (Node `fs` + `zlib` are already available). *Approve zero-dep, or name the allowed dependency?*
2. **Game player count (Phase 6).** Extend the engine to 2–4 players (larger refactor of `pantheon.ts`), or accept and document a 2-player-only scope? *Brief says 2–4; confirm scope.*
3. **Image generation (Phase 5).** If no image-gen tool is reachable from OpenCode, is the explicit fallback — prompts + unique per-card SVG/CSS interim illustrations wired by filename — acceptable, with real PNGs supplied later by the existing external pipeline? *Confirm fallback is acceptable.*
4. **Home carousel scope (Phase 3).** Confirm the home hero should auto-advance by default (with pause/swipe/reduced-motion) rather than be static.
5. **Legacy id migration.** `docs/UNCERTAIN.md:44` flags legacy ids kept for URL stability. Leave as-is for v2, or schedule a redirect-mapped id cleanup? *Recommend leave for v2.*
6. **Banner image slots.** Confirm banners are new art slots (generated per Phase 5) rather than reuse of existing card art.

---

## 6. Verified gap table (for the record)

| Phase | Status |
|---|---|
| 1. Content audit | PARTIAL — report missing (`docs/AUDIT_REPORT.md` absent); findings + UNCERTAIN done |
| 2. Navigation | MISSING — flat `TopNav.tsx:14-24`; no dropdown/More/icons/bottom nav |
| 3. Hero banners | MISSING/PARTIAL — no banner component; text-only home (`page.tsx:40-61`) |
| 4. Card redesign | PARTIAL — flip buttons remain (`FlippableCard.tsx:55-64`, `RelicCard.tsx:209-220`); art-box ratio mismatch (`globals.css:410,458-461` vs 1024×1440 PNGs) |
| 5. Unique art | PARTIAL — 178/184 PNGs (7 Slavic missing, 1 orphan); no duplicate gate; caption on art (`DeityCard.tsx:117`, `art-slot.ts:22`) |
| 6. Card game | PARTIAL — 2-player engine (`pantheon.ts:38,83,225-226`); brief wants 2–4 |
| 7. Print PDFs | MISSING — no pipeline, no PDF dep; browser print only |
| 8. Footer | MISSING — footer exists (`layout.tsx:49-57`) but no "Design by Mazen Pasha"/mailto |
| 9. QA | PARTIAL — prior 723-route sweep green; `docs/FINAL_REPORT.md` absent; must re-run post-v2 |
