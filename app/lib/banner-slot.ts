// THE DIVINE ATLAS — generated banner-art slot resolver (v2 Phase 3).
//
// SERVER-ONLY (build-time): this module reads the filesystem, so it must never
// be imported from a client component. It mirrors app/lib/art-slot.ts exactly:
// the existence check lives here; card/banner components stay pure and receive
// the resolved web path as a prop.
//
// Banner slots are `public/banners/<slot>.png` (21:9, 2016×864) and are the
// Phase-4 contract for Phase 5 art generation. Until a PNG exists at BUILD time
// the HeroBanner renders its own unique per-page CSS/SVG interim backdrop, so
// the site builds and never requests a missing image.
import fs from 'fs';
import path from 'path';

/** The 21:9 banner contract (matches the Phase-5 generation slots). */
export const BANNER_RATIO = '21:9';
export const BANNER_SIZE = '2016×864';
export const BANNER_DIR = 'banners';

/** Web path for a banner slot, e.g. `page-greek` → `/banners/page-greek.png`. */
export function bannerSlotPath(slot: string): string {
  return `/${BANNER_DIR}/${slot}.png`;
}

/** True when the generated banner PNG for a slot exists on disk at build time. */
export function bannerSlotExists(slot: string): boolean {
  const filePath = path.join(process.cwd(), 'public', BANNER_DIR, `${slot}.png`);
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Resolve a slot to its web path when art exists at build time, else null.
 * Prefers the WebP sibling (written alongside the PNG by the art pipeline),
 * mirroring app/lib/art-slot.ts; falls back to the PNG contract.
 */
export function resolveBannerSlot(slot: string): string | null {
  if (!bannerSlotExists(slot)) return null;
  const webp = path.join(process.cwd(), 'public', BANNER_DIR, `${slot}.webp`);
  try {
    if (fs.existsSync(webp)) return `/${BANNER_DIR}/${slot}.webp`;
  } catch {
    /* fall through to PNG */
  }
  return bannerSlotPath(slot);
}
