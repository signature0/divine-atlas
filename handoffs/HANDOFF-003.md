---
from: orchestrator
to: pi
date: 2026-09-13
stage: IMPLEMENTATION
---

# HANDOFF-003: Fix two release-blocking bugs (BUG-001 + BUG-002)

QA pass (TASK-010) is DONE and blocked Gate 6. Fix these two. Each has a
verified root cause, repro, and acceptance test below. Do NOT change data,
schema, or anything beyond what's specified.

## BUG-001 (CRITICAL) — multi-word /domain/[domain] routes 404 in production
- 206/320 domain routes 404 on prod (`next start`) because their param contains
  a space / paren / apostrophe. Single-word (114) all 200.
- The HTML files exist in `.next/server/app/domain/` (e.g. `the void.html`) and
  are in the prerender manifest under the RAW key (`/domain/the void`), but the
  prod static-file lookup builds the path from the encoded URL segment
  (`the%20dead.html`) which never matches the literal-space filename.
- The homepage links `/domain/the%20dead`, `/the%20underworld`, `/the%20earth`
  → all 404. Front page has ≥3 broken links.

### Fix (slugify the domain route param)
1. `app/domain/[domain]/page.tsx`:
   - `generateStaticParams` returns the **slug** of each domain, not the raw
     string. Slug = lowercase, trim, replace runs of non-alphanumeric with `-`,
     drop leading/trailing `-`. (Keep a stable mapping so the page can resolve
     back to the raw domain for matching.)
   - Inside the component, resolve the raw domain string from the slug (reverse
     the same slug function over the full domain set) and match entities against
     the **raw** domain exactly as today (`e.domains.includes(domain)`).
2. `app/page.tsx` (the "Where the gods overlap" section): emit
   `href={`/domain/${slug}`}` where `slug` is the same slug function applied to
   the domain.
3. Make the slug function a shared util (e.g. `app/lib/domain.ts`) so the page
   and homepage can't drift.
- IMPORTANT: the slug must be 1:1 with the raw domain set. If two distinct raw
  domains slugify to the same string, prefer a lossless scheme (e.g. keep the
  raw string but URL-encode differently) — verify uniqueness before shipping.

### Acceptance (orchestrator verifies after redeploy — you only need build green)
- `npm run build` succeeds with the new slugs prerendered; `validate.mjs` +
  `tsc --noEmit` green. The orchestrator then redeploys + re-sweeps and expects
  all 320 `/domain/*` routes → 200 and 0 404s on the homepage domain chips.

## BUG-002 (MAJOR) — mobile top-nav forces 643px viewport (horizontal scroll)
- `.topnav .links { display:flex; gap:18px; margin-left:auto }` (globals.css:156)
  lays 9 nav links out non-wrapping (~549px) on a 390px phone → the whole
  document inflates to 643px wide → horizontal scroll on every mobile page.

### Fix
- At a mobile breakpoint (e.g. `@media (max-width: 720px)`): let
  `.topnav .links` `flex-wrap: wrap` and reduce `gap` + `font-size` (or collapse
  into a hamburger `<details>` if wrap looks cramped — your call, but it must
  not overflow).
- Add `overflow-x: hidden` (or `overflow-x: clip`) on `<html>` as a safety net so
  nothing else can force sideways scroll.

### Acceptance
- Playwright mobile context (390×844, isMobile) reports
  `document.documentElement.scrollWidth <= clientWidth` on `/`,
  `/culture/japanese`, `/myths/gre-creation` (no horizontal overflow).
- Nav links still reachable on mobile.

## Process
1. Make the code changes. `npm run build` (SSG) so the new `/domain/` slugs are
   prerendered. `node scripts/validate.mjs` + `npx tsc --noEmit`.
2. Update `issues/BUG-001.md` and `issues/BUG-002.md`: frontmatter
   `status: REVIEW`, fill `evidence:` with the commit SHAs, and append a "## Fix"
   section noting exactly what changed.
3. Commit (one commit is fine — name both BUG ids in the message).
4. **STOP after the build + commit — do NOT restart the prod service.** The
   orchestrator (Hermes) handles the systemd `divine-atlas` redeploy + the
   qa-sweep re-run + verification, since that needs sudo. Leave the new build on
   disk (`.next/`) and tell me in your report that the build is ready for redeploy.

Do NOT touch BUG-003/BUG-004 (non-blocking, backlog). Do NOT change the
networkidle→load change in qa-sweep.mjs (already correct).
