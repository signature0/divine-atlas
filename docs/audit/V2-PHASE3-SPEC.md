# PHASE 3 (v2) SPEC — Hero banners + home carousel

You are the Phase 3 worker (branch `atlas-v2-2026-10`). Read `docs/PLAN.md` §3 Phase 3. Phase 2 (new nav + `app/components/icons.tsx` + mobile tab bar) has LANDED — build on it, do not modify nav behavior.

## Deliverable 1 — `HeroBanner` component (`app/components/HeroBanner.tsx`)
Reusable server-compatible component (no client JS needed unless a subtle parallax is trivial — prefer none). Props: `title`, `tagline`, `imageSlot` (art path or null), `culture?` (for accent tint), `children?` (optional actions).
- Layout: full-bleed banner, min-height ~clamp(180px, 38vw, 320px) desktop / ~170px at 380px; image layer + gradient scrim (dark, bottom-weighted) so white title text passes WCAG AA at all viewports; title (h1 or h2 per page context — check each page's existing heading and keep exactly ONE h1 per page), tagline below.
- Image: `<img loading="lazy" decoding="async">` when art exists; when art slot is empty, render a **unique per-page CSS/SVG interim backdrop** — layered gradients + a large low-opacity culture icon from `icons.tsx` (six pantheons each get a distinct palette pulled from their `--accent` in globals.css). NEVER one shared image across pages.
- Text overlay readable at 380px: title ≥ 22px, tagline ≥ 14px, scrim contrast-checked.

## Deliverable 2 — apply to all main pages
Add a HeroBanner at the top of: `/culture/japanese|greek|norse|egyptian|slavic|mesopotamian` (title = culture name + native-script epithet if the page has one, tagline = 1-line pantheon hook drawn from existing page copy — do not invent new mythology), `/artifacts` (Relics), `/cards`, `/play`, `/graph`, `/stories`, `/compare`, `/about`. Vault == /artifacts (same page). Each banner's interim backdrop must be visually distinct (culture accent + icon).
- Where a page already has a text header, replace it with the HeroBanner (keep any stats/counts row below it).
- Keep exactly one `<h1>` per page (Phase 7 QA gate counts them!). If the page's current h1 is the title, the banner title becomes the h1 and the old header is removed; if the banner sits above a section h1, banner title is h2.

## Deliverable 3 — home hero carousel (`app/components/HomeCarousel.tsx`, client)
Replace the static `.home-hero` in `app/page.tsx` with a carousel showcasing site content:
- Slides (6–8): each of the six pantheons (link to /culture/<id>), Relics (/artifacts), Cards (/cards), the Game (/play), the Graph (/graph), Stories (/stories). Each slide: backdrop (same unique interim art as its page banner — reuse the backdrop component), title, one-line tagline, "Explore →" link (whole slide clickable via a real `<a>`).
- Behavior: auto-advance 6s; pause on hover AND touchstart AND when `document.hidden`; resume on leave; swipe (pointer/touch drag, threshold ~40px); prev/next arrows; dot indicators (aria-label "Go to slide N"); `role="region"` + `aria-roledescription="carousel"` + `aria-label="Site highlights"`; slides `aria-hidden` when inactive; focusable content only on active slide.
- `prefers-reduced-motion: reduce` → no auto-advance, no transition (instant slide swap).
- Keyboard: arrows move slides when carousel focused; Home/End jump; Enter activates link.
- Hydration-safe: no window/matchMedia during render — all in useEffect; initial slide 0 on both server and client.
- Lazy: only first 2 slides' backdrops render eagerly; rest render on first approach (simple state flag on first advance is fine).

## Deliverable 4 — banner art slots (contract for Phase 5)
- Define banner art filenames: `public/banners/<slot>.png` with slots: `home-slide-<culture>` ×6, `home-slide-relics`, `home-slide-cards`, `home-slide-game`, `home-slide-graph`, `home-slide-stories`, plus page banners `page-<culture>` ×6, `page-relics`, `page-cards`, `page-play`, `page-graph`, `page-stories`, `page-compare`, `page-about`. Ratio 21:9 (2016×864). Document this in `docs/ART_STYLES.md` (append a "Banner slots" section) and add entries to `data/art-prompts.json` under a new top-level key `banners` (array, same field shape as `items`, kind `banner`, composition = wide landscape, subject = pantheon-defining myth scene per slide — grounded in existing myths data, no invention).
- `HeroBanner` checks slot existence at BUILD time via a small server-only helper (mirror the pattern in `app/lib/art-slot.ts` — existsSync in a build-time lib, never in client components). Client pages (cards/play are client-rendered below the fold?) — check each page: if a page is a server component, pass the resolved path as a prop; do NOT import fs libs into client components.

## Gates you MUST run and pass
`npx tsc --noEmit && npm run build && npm run validate`
Then verify in `out/`: every main page HTML contains its hero markup with a distinct backdrop class/slot; `grep -c '<h1' out/index.html out/cards.html out/artifacts.html out/play.html out/graph.html out/stories.html out/compare.html out/about.html out/culture/*.html` → exactly 1 each; carousel markup present in index.html with dots + arrows.

Print: files changed, banner slot list, h1 counts, gate statuses. Do NOT run `git add` or `git commit`.
