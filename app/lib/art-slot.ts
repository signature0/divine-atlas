// THE DIVINE ATLAS — generated card-art slot resolver (Phase 6).
//
// SERVER-ONLY (build-time): this module reads the filesystem, so it must never
// be imported from a client component. The card faces import app/lib/card.ts,
// which stays pure (artSlotPath lives there); the existence check lives here.
//
// The generated art (178 PNGs at public/cards/<culture>/<culture>-<id>.png,
// 1024×1440, gitignored + deployed separately) is wired to each card by its
// deterministic slot. Deity image_url is resolved in app/lib/data.ts's
// allCards() and relic image_url in app/lib/relic-card.ts's deriveRelicCard();
// both are build-time loaders that already run fs (see data.ts's loadJSON).
//
// A slot counts as present only when the PNG actually exists at BUILD time.
// Builds without public/cards/ simply fall through to the existing archival
// artwork (or the card face's letter fallback), so the site still builds and
// never requests a missing image.
import fs from 'fs';
import path from 'path';
import { artSlotPath, artSlotWebPath } from './card';

// Generated art is NOT archival: this credit never claims a museum institution.
export const GENERATED_ART_CREDIT = 'generated reconstruction · The Divine Atlas';

function fileExists(webPath: string): boolean {
  const filePath = path.join(process.cwd(), 'public', webPath.replace(/^\//, ''));
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/** True when the deterministic generated PNG for a card exists on disk at build time. */
export function artSlotExists(culture: string, id: string): boolean {
  return fileExists(artSlotPath(culture, id));
}

/**
 * The generated-art URL for a card, or null when no generated art exists.
 * Prefers the WebP sibling written by scripts/optimize-art.py (inline-asset
 * budget, Phase 9) and falls back to the canonical PNG. Returns null so a build
 * without public/cards/ falls through to archival art / the letter fallback.
 */
export function artSlotUrl(culture: string, id: string): string | null {
  const webp = artSlotWebPath(culture, id);
  if (fileExists(webp)) return webp;
  const png = artSlotPath(culture, id);
  if (fileExists(png)) return png;
  return null;
}
