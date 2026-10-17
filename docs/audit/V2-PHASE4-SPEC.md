# PHASE 4 (v2) SPEC — Card redesign (phone-first) + ART BOX FIX

You are the Phase 4 worker (branch `atlas-v2-2026-10`). Read `docs/PLAN.md` §3 Phase 4. Phases 1–3 landed (audit report, new nav + icons, hero banners). This phase reworks the card system itself.

## D1 — Remove ALL flip affordances
- `app/components/FlippableCard.tsx`: remove the flip button (`aria-label 'Flip card to reverse'`, ~lines 55-64) and any hover-flip pointer handlers. The reverse content (back face) stays reachable ONLY via the detail overlay (CardDetailOverlay already shows full info). If FlippableCard becomes a pointless wrapper after this, inline it or simplify — but keep every call site compiling.
- `app/components/RelicCard.tsx`: remove the flip button (~lines 209-220) and hover-flip logic; keep `.rc-back` content available in the relic detail view (verify the artifact detail page shows provenance/abilities — it does per Phase 4 v1 work; if any back-face fact exists ONLY on the back, add it to the detail page instead of deleting it).
- Remove now-dead CSS (`.rc-flip*`, hover transforms, flip buttons) — grep globals.css for users before deleting.
- QA contract: `grep -rn "Flip" app/components/` must return nothing; no `aria-pressed` flip buttons in built HTML.

## D2 — Card hierarchy (phone-first, 380px first)
Front face, top→bottom:
1. **Art** (see D3) — dominant, ~55-60% of card height.
2. **Name + native name** (name large ≥15px at 380px, native script smaller, same line or below).
3. **Religion badge + type** (culture chip with icon from icons.tsx + kind: Deity/Relic/Place… small, tidy).
4. **One-line summary** = `description_short` (clamp 2 lines, ellipsis).
5. **Key stats** — PWR/GRD only, compact, high contrast.
6. Everything else (rarity, ID, source tags, element, domains) → small/tidy footer strip or detail view only. Less clutter than current cards.
- Larger higher-contrast text throughout (body ≥13px, stats ≥14px bold); check contrast AA on card surface #17171e (DES-005 `--accent-text` convention for culture colors — reuse `CULTURE_TEXT_COLORS`/`ELEMENT_TEXT_COLORS` from card.ts).
- Tap card → existing `CardDetailOverlay` (lift-and-grow animation already exists — verify it still feels smooth; keep swipe-down/tap-outside/back close + reduced-motion). Detail view must contain: large art, full story (description_long), family, domains, symbols, relics, stats, sources — audit the overlay and fill any missing section.
- Layout modes grid / compact list / hand: keep all three working after the face rework (CardDeck + hand view in /cards).

## D3 — ART BOX FIX (the cropping bug)
Current bug: art window is a sub-region with `object-fit: cover` (globals.css ~410, 458-461) while PNGs are 1024×1440 (0.7111) — faces get cropped.
- Lock ONE aspect ratio for the art box: **5:7 (0.7143)** — matches existing PNGs within 0.5%. Set the art box to exactly `aspect-ratio: 5/7` and the image to `width:100%; height:100%; object-fit: cover` (cover now becomes a no-op fallback, not a cropper).
- Measure the actual rendered box at 380/768/1440 and confirm the ratio holds (no letterboxing gaps, no overflow).
- Update `docs/ART_STYLES.md`: art ratio 5:7, composition rule "full figure or head-and-shoulders with relic, safe margins ≥8% top/bottom, subject never touches frame edges" — this is the contract future art generation follows.
- Update `data/art-prompts.json`: ensure every item's composition/prompt text states the 5:7 framing + safe margins (programmatic append is fine: add "Composition: 5:7 portrait, subject fully inside frame with safe margins." to prompts lacking it — do a scripted pass, don't hand-edit 184 entries).
- Relic cards use the SAME art box ratio (their art may be smaller but ratio identical).

## D3b — FIX nested-anchor hydration bug (pre-existing, homepage)
`app/page.tsx` deck teaser wraps `<DeityCard>` in `<Link className="deck-teaser-item">` — but DeityCard's own footer renders a print `<Link>` (`tc-print`), producing `<a>…<a>…</a>…</a>` → React error #418 on EVERY homepage load (dev console: "In HTML, `<a>` cannot be a descendant of `<a>`"). Fix: give DeityCard a prop (e.g. `interactive?: boolean`, default true) that suppresses the inner print link (render nothing or a `<span>`) when embedded inside an outer anchor; homepage passes `interactive={false}` (the outer teaser link already goes to the card page). Grep ALL other DeityCard/RelicCard usages for the same pattern (any card inside a Link/anchor) and apply the same suppression. Acceptance: dev-server homepage logs ZERO hydration errors; built homepage has no `<a>` inside `<a>` (verify with python3 html.parser walk).

## D3c — Stale copy: flip references
The /cards page hero copy says "hovering flips a card" (and possibly other pages/docs mention flipping). After D1, grep ALL of `app/` for "flip" (case-insensitive, user-facing strings + comments) and rewrite affected copy (e.g. "hovering flips a card" → "tapping opens the full card"). Keep code comments accurate.

## D4 — Relic card polish
Keep the distinct relic frame (RELIC band, museum-plaque back in detail view) but align it to the new hierarchy: art → name + native → owner-god badge + RELIC type → one-line flavor → rarity + tier stats. Remove any leftover flip/back-face-only facts per D1.

## Constraints
- Static export, hydration-safe, no new deps, no window/localStorage during render.
- Do NOT touch: nav/tab bar (Phase 2), hero banners (Phase 3), data JSON content (Phase 1), game engine (Phase 6).
- Card art files: read-only. Do not modify `public/cards/`.
- Keep `asHeading` prop behavior from prior work (print sheet h1 scoping) intact.

## Gates you MUST run and pass
`npx tsc --noEmit && npm run build && npm run validate`
Self-verify: `grep -rn "Flip" app/components/ | grep -vi "flippablecard.tsx:" | head` → empty (file may remain if still imported; ideally delete it and its CSS); built `out/cards.html` renders (client-side, so just confirm build includes it); ratio: grep the new `aspect-ratio` rule.
Print: files changed, what moved to detail view, ratio contract text, gate statuses. Do NOT run `git add` or `git commit`.
