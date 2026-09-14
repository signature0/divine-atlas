---
type: handoff
from: orchestrator (hermes)
to: po (mazen)
date: 2026-09-14
stage: RELEASE (Gate 8)
---

# HANDOFF-014: QA/Design-Closeout → PO Release Decision

## Completed
- Final full-route QA sweep on the release prod build (:3002,
  BUILD_ID bK3Z-TkliafDmxiT_BdvR) — `qa/evidence/GATE8-final-sweep-2026-09-14.log`
  (555 routes + 5 negatives + 6 mobile checks).
- Release notes drafted — `docs/11-release/release-notes-v1.0.0.md`
  (shipped scope, coverage, accepted known issues, deployment, watch items).
- Deployment: prod build live on :3002 via a Hermes-managed background
  process (verified 200 on /, /deity/gre-zeus, /artifacts). `divine-atlas`
  systemd unit is `enabled` (auto-start on boot); live handoff to the unit
  blocked by headless polkit stall — `sudo systemctl restart divine-atlas`
  needed at the machine to complete it.
- `package.json` dev script isolated by default (`NEXT_DIST_DIR=.next-dev`,
  port 3100) so the 2026-09-14 clobber incident can't recur even if
  someone runs bare `npm run dev`.

## Key Decisions
- v1.0.0 scope = exactly what passed Gates 5–7: 6 cultures, 159 deities,
  44 myths, 19 artifacts, graph, comparator, domains, ⌘K search, design
  system. Phase-3+ board items (timeline, full search, map, genealogy,
  a11y) remain NEXT — release is an MVP cut, per Gate 2 scope.
- BUG-004 (slow remote-artwork settle, minor) accepted for v1.0.0 —
  listed in release notes as known issue, PO informed.
- Public exposure (tunnel/domain) is a PO decision — NOT part of v1.0.0.

## Unresolved
- PO ratification of Gate 8 (release ready) — this handoff + release notes
  are the decision package.
- Whether to expose the site publicly right after release (tunnel vs
  Tailscale-only vs VPS/domain) — PO call, post-Gate-8.
- systemd live handoff: run `sudo systemctl restart divine-atlas` at the
  machine (headless `systemctl start` stalls on polkit); then drop the
  Hermes background process serving :3002.

## Files the next agent must read (in order)
1. `docs/11-release/release-notes-v1.0.0.md`
2. `qa/evidence/GATE8-final-sweep-2026-09-14.log`
3. `decisions/gates.md`
4. `docs/00-project/roadmap.md` (NEXT/LATER buckets)

## Issues the next agent owns
- TASK-014: release target decision + release notes + final QA
  (notes + QA done; PO target decision = the Gate 8 approval itself).
- Post-Gate-8: MEASURE→LEARN loop starts at first post-release review
  (`docs/12-post-release/`, template in studio-os/templates/docs/).

## Next action
PO: approve Gate 8 (release ready) — ratify in `decisions/gates.md`;
then optionally decide public exposure.
