# BUG-001 re-check (orchestrator, 2026-09-14)

## Verdict: Pi's CODE is correct. The on-disk `.next` is a broken build.
The fix (slugified `/domain/[domain]` param) is committed and logically sound —
but the `.next/` directory currently on disk is NOT the good build Pi verified.

## Evidence

### 1) The code is provably correct
- `npx tsx` probe of the real `app/lib/domain.ts`: **320 slugs, 0 unresolved,
  0 collisions**; `domainFromSlug('the-void')→"the void"`, `('the-nile-s-flood')
  →"the Nile's flood"`, etc.
- Every one of the 13 spot-checked failing slugs resolves to a raw domain that
  has **1–7 matching entities** → the page's `notFound()` should never fire for
  them. So the page logic cannot be the cause.
- `npx tsc --noEmit` ✓, `node scripts/validate.mjs` ✓.

### 2) The on-disk `.next` is broken (content-verified, not file-existence)
- `grep -l "__next_error__" .next/server/app/domain/*.html` → **exactly 206**
  files, which is **exactly the 206 hyphenated (multi-word) slugs**. All 114
  single-word slugs are real pages. Pattern is 100% clean: every multi-word
  slug = 404 shell, every single-word slug = real page.
- `.meta` for the shells records `"status":404`.
- No shells anywhere else in the build (only `/domain/`).
- Live prod :3002 (server started 21:15) confirms: `/domain/war`→200 but
  `/domain/the-void`, `/domain/the-dead`, `/domain/calm-winds`,
  `/domain/the-nile-s-flood`→404. 3 homepage chips 404: the-dead, the-earth,
  the-underworld.

### 3) Build timeline (the smoking gun)
```
23:38:03  Pi moves stale .next aside (.next-stale-1789328283)
23:41:10  BUILD_ID + prerender-manifest written   <- Pi's CLEAN build
23:41:13  war.html written (513,840 B, REAL page) <- Pi's good build
   ...
23:49:47-23:50:05
          A SECOND build pass re-writes ONLY the hyphenated domain
          .html/.rsc/.meta as 404 shells (the-void.html now 494,981 B shell),
          leaving single-word routes (war.html) and the 23:41 manifests
          untouched.
```
The currently-on-disk `the-void.html` (494,981 B shell, 23:49:47) is therefore
**NOT** from Pi's verified-good 23:41 build — it was clobbered ~8 min later.
Pi verified 320/320 on a temp server (`:3050`) against the 23:41 good build;
the final on-disk state is the 23:49 broken one.

### 4) This matches a KNOWN, DOCUMENTED gotcha
Pi's own `docs/07-development/dev-notes.md`:
> "the first build after this change wrote 207 `__next_error__` 404 shells for
> multi-slug routes (suspected stale `.next/cache` of the page module). Moving
> `.next` aside and rebuilding from clean produced 320/320 real pages. If a
> future build shows `__next_error__` shells under `.next/server/app/domain/`,
> clean-rebuild before debugging the code."

The shell count (207 ≈ 206) and the exact multi-word-only pattern are the
fingerprint of that stale-`.next/cache` bug recurring on the 23:49 build.

## Required to close
1. **Clean rebuild:** `rm -rf .next && npm run build` (no warm cache).
2. **Prove by content, not file existence:** after the build,
   `grep -l "__next_error__" .next/server/app/domain/*.html` must return **0**
   files (and all 320 domain `.html` must be the ~495 KB+ real-page size, not
   the 494,981 B shell size).
3. Leave that clean `.next/` on disk; orchestrator restarts `divine-atlas`
   and re-runs the domain + homepage-chip sweep.

## Note for orchestrator
Stale `next-server` on `:3003` (pid 338638, `npm start`-family, old build, not
the systemd prod service) is still running — Pi flagged it; safe to clean up.
Prod `:3002` is the systemd `divine-atlas` service (started 21:15).
