# Release Notes — v1.0.0 (2026-09-14) — RELEASED

> Gate 8: **PASSED — ratified by Mazen (PO) 2026-09-14** · git tag `v1.0.0` · Project: The Divine Atlas · PO: Mazen · Orchestrator: Hermes · Engineer: Pi

## What Shipped

- **Six fully browsable cultures** — Japanese, Greek, Norse, Egyptian, Slavic,
  Mesopotamian: home, culture landing pages, 159 deity profiles (109 with
  verified open-license artwork), 44 myth pages in story mode (REQ-001…003,
  REQ-007).
- **The Divine Vault** — 19 sacred artifacts across 5 cultures: image-led
  collection with instant filters/search/sort, detail pages with power
  profiles, classification and provenance; artifact nodes wired into the
  relationship graph + deity cross-links (REQ-017…021, ADR-002).
- **Relationship graph explorer** `/graph` — BFS-centered + global cluster
  views, deity and artifact nodes (REQ-006).
- **Comparator** `/compare` — side-by-side deity comparison (REQ-013).
- **Domain pages** — one page per domain across all cultures (REQ-014).
- **⌘K search overlay** — live search over deities, myths, artifacts
  (REQ-009, basic index; full inverted index is NEXT).
- **Museum-editorial design system** — per-culture palettes from
  `tokens.json`, gold rank badges, seal fallbacks, AA-verified contrast
  (docs/DESIGN-SYSTEM.md; all 12 critic DES-xxx issues closed 2026-09-14).
- **Data integrity pipeline** — `validate.mjs` schema gate + 176 verified
  open-license artworks with honesty labels (TECH-001, 002, 005).
- **Robustness fixes** — bad slugs 404 instead of 500 (BUG-003, eff540b);
  dev/prod build isolation so the running server can never be clobbered
  (BUG-001 incident, next.config.js + `dev` script).

## Requirements Delivered (coverage)

SHIPPED: REQ-001–003, 006, 007, 013–016 · REQ-017–021 (artifacts) ·
REQ-009 (basic) · TECH-001/002/004/005/006 · UX-001–005.
`board.py coverage`: all shipped REQs carry implementing issues; remaining
open items are explicitly Phase-3+ backlog (below), not release blockers.

## Known Issues (accepted)

- BUG-004 (minor, accepted): deity/myth pages with remote artwork can take
  13–19 s to settle; lazy images never go idle. Cosmetic timing, no broken
  state. PO informed — release proceeds.
- REQ-004/005 (partial): pantheon filters + genealogy/cosmology sub-views
  exist only partially on culture landings — full views are NEXT.
- 50 minor deities (of 159) ship without artwork — seal fallback renders
  their name; backfill is TASK-013 (NEXT).

## Deployment

- **Target:** homelab box, port 3002 — **owned by systemd** since
  2026-09-14 (Gate 8 ratification).
- **Service:** `divine-atlas.service` (`npm run start` → `next start -p
  3002`, NODE_ENV=production, WorkingDirectory=`/AI/agents/workspaces/
  divine-atlas`, Restart=always, 2G MemoryMax) — **active + enabled**
  (auto-start on boot). Verified 200 on /, /deity/gre-zeus, /artifacts;
  correct 404s for backlog routes and bad slugs.
- **Handoff note:** non-interactive `systemctl` writes from the agent
  session stall on headless polkit; the live handoff was completed via
  `SUDO_ASKPASS=~/askpass.sh sudo -A systemctl start divine-atlas`
  (PO-approved), after freeing the port from the interim Hermes background
  process.
- **Build:** prod `.next` (BUILD_ID bK3Z-TkliafDmxiT_BdvR); dev runs
  isolated on :3100 / `.next-dev` — they can never share a dist dir.
- **Verified:** final full-route sweep on the release build (555 routes:
  555×200, 0 console/page errors, 0 failed requests, 0 mobile overflow,
  all 5 negative routes 404) — `qa/evidence/GATE8-final-sweep-2026-09-14.log`.
- `tsc --noEmit` clean · `validate.mjs` clean.
- Public exposure (tunnel/domain) is a PO decision — not included in v1.0.0.

## Post-Launch Watch

- :3002 uptime via `systemctl status divine-atlas` (survives reboots now).
- Remote-image host availability (Met Museum / Wikimedia) — watch for
  403/429 in sweep failedReqs on the next full QA.
- BUG-004 settle-time if it degrades further (Lighthouse on a slow
  3G profile, next QA pass).
- Culture-expansion proof: 7th culture (Celtic or Chinese) is the first
  NEXT milestone.
