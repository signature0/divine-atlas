/** @type {import('next').NextConfig} */
const nextConfig = {
  // 2026-09-14 incident (BUG-001 follow-up): dev and prod must never share a
  // dist dir — a `next dev` on the default `.next/` clobbered the prod build
  // served by `next start :3002` (400s on static assets). Dev runs with
  // NEXT_DIST_DIR=.next-dev (Next 15.5 has no `-D` CLI flag, so the isolation
  // is env-gated here; prod build keeps the default `.next`).
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // 2026-10-15: static export for Cloudflare Pages hosting. Every route is
  // pre-rendered via generateStaticParams (no server features), so the site
  // ships as plain static files in `out/`. Local dev (next dev) is unaffected;
  // local preview of the prod build is `npx serve out` (next start is not used
  // on a static host).
  output: process.env.NEXT_STATIC === '0' ? undefined : 'export',
  // Remote open-access image hosts only (verified, open license)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.metmuseum.org' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'thumb.wikimedia.org' },
    ],
  },
}

module.exports = nextConfig
