# TASK-010 — Domain 404 deep-dive (corrected)

## CONFIRMED (production-only evidence)
- Build contains **320** `/domain/[domain]` static routes.
- **114 single-word** domains (no space/paren/aprophe) → all **200** on prod :3002.
- **206 multi-word/special** domains (space, paren, apostrophe) → all **404** on prod :3002.
- The HTML files **exist** in `.next/server/app/domain/` (e.g. `the void.html`,
  `the dead.html`, `the 'devil' (a Christianization...).html`) and the routes are
  **listed in the prerender manifest** with the RAW (unencoded) param key
  (e.g. `/domain/the void`).
- The live **homepage** emits `href="/domain/the%20dead"`, `/domain/the%20underworld`,
  `/domain/the%20earth` → all 404. So the front page has ≥3 broken links.

## Mechanism
The static-file lookup derives the on-disk path from the encoded URL segment
(`the%20dead.html`) which does not match the literal-space filename on disk
(`the dead.html`). Next.js App Router static serving does not percent-decode the
param when locating the prerendered file. Single-word params have no encoding, so
they match and serve.

## STRUCK — invalid evidence (do NOT rely on this)
An earlier "dev mode returns 200 for `/domain/the%20void`" observation was
**invalid**: port 3010 was occupied by an unrelated Docker container running a
different SPA (Vite/React, catch-all 200 for any path — `/totally/bogus/xyz`
also returned 200 with that app's HTML/CSP). The `next dev -p 3010` launch had
failed with EADDRINUSE, so that test hit the wrong server. The prod 404 vs prod
200 split above is the only valid evidence and is internally consistent.

## Filed
BUG-001 (critical) — slugify domain route param; verify 320/320 → 200 on re-sweep.
