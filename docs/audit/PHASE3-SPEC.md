# Phase 3 spec — Card UI/UX, phone-first (Divine Atlas)

You are implementing Phase 3 of a plan on branch `atlas-overhaul-2026-10`. Goal: make The Deck (`/cards`) phone-first and give cards a tap-to-expand full-screen detail view. Work only in the files listed under "Files you may touch".

Read first: `app/components/FlippableCard.tsx`, `app/components/DeityCard.tsx`, `app/components/CardDeck.tsx`, `app/cards/page.tsx`, `app/lib/card.ts`, `app/lib/data.ts` (ResolvedCard, allArtifacts, artifactsForEntity, entityById), the `.tc*`/`.deck*` blocks of `app/globals.css`, and `app/graph/GraphExplorer.tsx` (for the existing client query-param pattern).

## Hard constraints
- Next.js 15 **static export** (`output: export`). No server code, no `searchParams` on server pages. Any URL state must be read/written client-side (`history.pushState` + `popstate`), like `/graph` and `/cards` already do.
- No new npm dependencies. Pure React + CSS.
- SSR/hydration-safe: no `Math.random()`, no `localStorage`/`window` reads during render (only inside `useEffect`), any computed layout values rounded to 1/100 like the graph code does.
- Respect `prefers-reduced-motion` everywhere (matchMedia pattern already in FlippableCard): expand/slide animations become instant, fan hover transforms dropped.
- Accessibility: the detail overlay is a dialog — `role="dialog"` `aria-modal="true"` `aria-label="<name> card details"`, focus moves into it on open and returns to the card on close, Tab is trapped inside, Escape closes, body scroll locked while open. All interactive elements keyboard-reachable with visible focus.
- Do not change `app/lib/card.ts` stat derivation or any data JSON. Cards remain a pure view over entity data — no invented claims.

## 1. Tap-to-expand detail overlay (the core feature)
New client component `app/components/CardDetailOverlay.tsx`, rendered by `CardDeck`.

Interaction model change in `FlippableCard.tsx`:
- **Tap/click/Enter on the card body = open the detail overlay** (new behavior).
- **Flip is demoted**: keep the 3D flip only on pointer-hover devices (`matchMedia('(hover: hover)')` — hover flips as today). On touch devices no flip. Add a small circular ⟲ button in the card's bottom-right corner (stopPropagation) that toggles the flip on ALL devices, so the reverse plate stays reachable.
- Card gets `aria-haspopup="dialog"`; keep `aria-label` updated.

Overlay content (phone-first, single column, scrollable):
- Hero art area (existing `image_url` or the initials-seal fallback from `.tc-art-fallback`), culture badge (culture color chip, like the graph detail panel), name + native name, type line with element sigil, rarity label.
- Stats row: Essence / PWR / GRD — big numbers with the element color, plus the existing pips.
- Story: `long` description (render `[S#]` refs as small superscript chips that scroll to the sources section).
- Domains chips, Symbols chips, Weapons + sacred objects (only when non-empty).
- Relics: artifacts owned by this entity — compute client-side from a `relics` prop you add to `CardDeck` (see §3). Each relic row links to `/artifacts/<slug>`.
- Family: partners/parents/children from the card's entity — pass through as names+ids; each links to `/deity/<id>`.
- Sources: the `[S#]` entries from the entity's `primary_sources` (numbered list matching the chips).
- Footer buttons: "Open profile" (`/deity/<id>`), "Print card" (`/cards/<id>`), close ×.

Mechanics:
- Open: `history.pushState({card:<id>})`; close on popstate, Escape, backdrop click, ×, or **swipe-down** (pointer events on the header/handle: drag down >80px or fast flick → close; card follows finger with translateY, snaps back otherwise; `touch-action: none` on the handle only).
- Animation: slide-up + fade (200ms ease-out); under reduced-motion: instant.
- URL sync: on mount, if `?card=<id>` matches a card, open it (so links are shareable); opening pushes `?card=`, closing uses `history.back()` when the overlay was opened from the URL, else `pushState` clean.

## 2. Layout modes: Grid / List / Hand
Add a segmented control (3 buttons, `role="radiogroup"`, labels Grid/List/Hand) to `deck-controls`, persisted to `localStorage('deck-layout')` (read in useEffect; default Grid).
- **Grid**: current responsive `.deck-grid` (keep).
- **List**: one row per card — 56px mini card front (reuse `DeityCard size="sm"` scaled in a fixed-ratio box), name, type line, culture badge, PWR/GRD numbers, chevron; row tap opens the overlay. Stacks cleanly at 380px.
- **Hand**: fanned hand of the first 10 filtered cards — CSS transforms only: each card `rotate((i - (n-1)/2) * 4deg) translateY(|i-(n-1)/2|² * 2px)`, `transform-origin: 50% 120%`, overlap via negative margin; hover/focus lifts the card (translateY(-14px) rotate(0)) and raises z-index; on touch devices (no hover) tapping a card opens the overlay directly. Container height ~340px, horizontally scrollable if needed. Below the hand: "View as grid →" hint.
- Layout mode affects only the card area; controls stay.

## 3. Data plumbing
- `CardDeck` gains a `relics` prop: `Record<entityId, {slug,name,category}[]>` built server-side in `app/cards/page.tsx` from `allArtifacts()` (owner field), passed serializable.
- Family + sources: extend the `ResolvedCard`-based prop minimally — in `app/lib/data.ts` `allCards()`, attach `family: {partners:string[], parents:string[], children:string[]}` (id+name pairs, resolved via the culture's entities) and `sources: {ref:string,text:string}[]` (from entity `primary_sources`, ref = `[S1]`… matching how `flavor` renders them — check `card.ts` for the exact ref format and reuse it). Keep types in `data.ts`; do not touch `card.ts` derivation logic.
- Entity fields not on ResolvedCard (partners etc.) come from the Entity in `allCards()` — you have it there.

## 4. Polish (small, targeted)
- Card name overflow: `line-clamp: 2` (long names like "Amaterasu Ōmikami" must not clip mid-glyph).
- Filter chips row: horizontal scroll with edge fade on mobile (`scroll-snap`), never wrap to 5 rows.
- Loading state: when `filtered.length` changes after typing, debounce search input 120ms and show a subtle "filtering…" mono label in the count line while the debounce is pending.
- Ensure the deck section has no horizontal overflow at 380px.

## Files you may touch
`app/components/FlippableCard.tsx`, `app/components/CardDeck.tsx`, `app/components/CardDetailOverlay.tsx` (new), `app/cards/page.tsx`, `app/lib/data.ts` (additive only), `app/globals.css` (append new blocks; do not rewrite existing `.tc*` rules).

## Verification (all three must pass; run them yourself and fix failures)
1. `npx tsc --noEmit` → zero errors
2. `npm run build` → exit 0, static export, no errors/warnings
3. `npm run validate` → ✓ no errors

Reply DONE when all three pass, or list what still fails.
