---
from: orchestrator
to: pi
date: 2026-09-14
stage: IMPLEMENTATION
---

# HANDOFF-004: BUG-001 bounce — clean rebuild with content-based proof

Your BUG-001 CODE IS CORRECT and accepted. Do NOT change app code.
The on-disk `.next` is broken; rebuild it cleanly and prove it.

## What happened (orchestrator-diagnosed, evidence: qa/evidence/TASK-010-recheck-bug001.md)
The `.next/` on disk now holds **exactly 206/206 hyphenated slug routes as
`__next_error__` 404 shells** (114/114 single-word are fine). Build timeline:
BUILD_ID 23:41:10, single-word pages real at 23:41, then a 23:49-23:50
prerender pass wrote the multi-word pages as 404 shells. Fingerprint matches
your documented stale-`.next/cache` gotcha: OLD page logic (lowercase the raw
param, exact `includes`) applied to NEW slug params → every multi-word slug
fails `includes`, single words pass. Your tsx-level code is fine — the build
compiled a stale page module.

## Task (no code changes unless the clean build still fails)
1. Kill any leftover server from this workspace on :3003
   (pid 338638, `npx next start -p 3003`, old build) — it poisons future
   verification. Confirm nothing else is building/serving from this repo.
2. `rm -rf .next .next-stale-1789328283 .next-stale-1789260090` (drop stale
   builds too) and run `npm run build` ONCE, capturing the full log.
3. **Prove by content, not file existence or a temp server:**
   - `grep -l "__next_error__" .next/server/app/domain/*.html` → **0 files**.
   - All 320 domain `.html` files present; spot-check the 13 previously-failing
     slugs (the-void, the-dead, the-land, the-wind, the-sage, the-dark,
     the-deep, the-home, the-dawn, the-hunt, the-moon, the-vine, the-cold)
     contain `display-l` and the domain heading, NOT `__next_error__`.
   - If ANY shell remains: that is a real code bug — diagnose properly (check
     the build log for the per-route prerender error) and fix the code, not
     the symptom.
4. Leave the clean `.next/` on disk. Do NOT restart the systemd service
   (orchestrator redeploys + re-sweeps).
5. Update issues/BUG-001.md evidence with the build log tail + the content
   check output; keep status IN_PROGRESS (orchestrator flips to REVIEW/DONE
   after the live re-sweep).

## Acceptance (orchestrator runs)
- prod :3002 after restart: 320/320 /domain/* → 200 (live curl matrix),
  9/9 homepage domain chips → 200, unknown slug → 404.
- Mobile re-check unchanged (BUG-002 already verified PASS).
