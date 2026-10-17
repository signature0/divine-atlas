# Phase 4 Spec — Relic Cards (artifacts get the card system)

Repo: /AI/agents/workspaces/divine-atlas (branch atlas-overhaul-2026-10).
Next.js 15 **static export** (`output: export`). No new npm deps. Pure React + CSS.
SSR/hydration-safe: no Math.random(), no window/localStorage during render, deterministic output (same build = same HTML).

## Goal
Artifacts (26 across 6 cultures, `data/*/artifacts.json`) get a trading-card treatment with a frame that is **visually distinct from deity cards**, rendered in a card mode on `/artifacts` and as a callout on `/artifacts/[slug]`.

## 1. `app/lib/relic-card.ts` (new)
Mirror the philosophy of `app/lib/card.ts` (read it first): a card is a VIEW over data, never a new source of truth; deterministic; interpretive stats labelled as such.

```ts
export interface RelicCard {
  id: string; culture: string; slug: string;
  name: string; native_name?: string;
  type_line: string;        // "RELIC · Hammer · Thunder" (categoryLabel-ish + artifact_type + primary domain)
  element: CardElement;     // reuse elementOf(domains) from card.ts
  rarity: CardRarity;       // tier→rarity map below
  stats: CardStats;         // derived from a.power_profile (see below)
  flavor: string;           // description_short (may contain [S#])
  long: string;             // description_long
  symbols: string[]; domains: string[];
  ownerName?: string; creatorName?: string;
  status: string;           // current_status human label
  set_code: string;         // "DA-R-EGY-003" (culture code + index)
  image_url: string | null; // artwork url if present
  image_credit?: string;
}
export function deriveRelicCard(a: Artifact, index: number): RelicCard
```

- **tier→rarity**: minor→common, sacred→uncommon, legendary→rare, divine/cosmic/primordial→mythic.
- **stats from power_profile**: power_profile is `PowerAttribute[]` (check types.ts for its shape — attribute+value). Map to power/guard/essence deterministically: power = mean of offensive-ish attributes, guard = defensive-ish, essence = rest; if the shape doesn't split cleanly, derive from hash32(id) like card.ts does, but BOUND the same ranges card.ts uses so relic and deity stats are comparable. Document the mapping in a comment. Interpretive — say so.
- Reuse exports from `card.ts` (elementOf, ELEMENT_LABELS, RARITY_LABELS, hash32 if exported — if not exported, export it; do not duplicate).

## 2. `app/components/RelicCard.tsx` (new)
A card frame clearly distinct from deity cards:
- Same 5:7 card geometry and front/back flip mechanics as `FlippableCard.tsx` (reuse it if it accepts children/variant; otherwise a sibling component — do NOT fork-and-modify deity internals).
- **Distinct frame**: relic frame uses the vault accent (`--accent`, teal) instead of deity gold (`--gold`), a different corner treatment (e.g. double-rule border or rivet/engraving motif via CSS), and a "RELIC" band where deity cards show rarity pips style. Keep culture color badge.
- Front: image (or letter-seal fallback like VaultClient's ArtifactCard does — copy that broken-image pattern), name + native, type line, element chip, PWR/GRD stats, rarity, owner line ("Wielder — Thor"), flavor 2-line clamp.
- Back: long description (strip [S#] for display), abilities list (name + cost/effect if present in data), status, creator, sources count.
- The whole card is a `Link` to `/artifacts/${slug}` (detail page already exists — no overlay needed here).
- `prefers-reduced-motion`: no flip animation (match how Phase 3 handled it).

## 3. `/artifacts` — card mode
`app/artifacts/VaultClient.tsx`: add a layout toggle (Tiles / Cards) next to the sort control, same segmented-radiogroup pattern as the deck's layout bar (reuse `.deck-layoutbar` classes or add `.vault-layoutbar` mirroring it). Persist choice to localStorage inside useEffect only. Cards mode renders `RelicCard` in a responsive grid (reuse `.deck-grid` sizing conventions: 2-up at 380px, more columns on desktop). Tiles mode = existing vault grid, unchanged.

## 4. `/artifacts/[slug]` — card callout
Add a section showing the relic's own `RelicCard` (front side, non-flipping is fine — or flipping) next to/above the existing content, plus a one-line interpretive disclaimer ("Card stats are interpretive, derived from the Atlas power profile."). Match the existing page structure (read it first; it's a server component — the card itself must be usable in server context: RelicCard must not use hooks that break SSR; the flip state can live in a small client wrapper if needed).

## 5. CSS
Add `.rc-*` (relic card) blocks in `app/globals.css` near the `.tc-*`/`.vault-*` blocks. Frame distinct but same design language (tokens only: --gold, --accent, --line, fonts). No layout overflow at 380px (documentElement.scrollWidth === clientWidth).

## Constraints / non-goals
- Do NOT touch deity card components' behavior (export-only changes allowed).
- Do NOT add relics to the `/cards` deck (that stays the deity deck).
- No new dependencies. No server code. `npm run build` must stay green.
- All 26 artifacts must render a card with zero broken images (seal fallback) — verify.

## Verification (worker must run all three, report results)
1. `npx tsc --noEmit` → 0 errors
2. `npm run build` → green static export
3. `npx eslint app/` → 0 errors
Then print `DONE`.
