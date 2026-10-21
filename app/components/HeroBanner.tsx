// THE DIVINE ATLAS — HeroBanner (v2 Phase 3; full-screen in Phase 11).
//
// A reusable, server-compatible banner: full-bleed media layer + left-weighted
// scrim + left-aligned copy. Page-level heroes fill the first viewport
// (100svh), sit clear of the sticky nav (--nav-h), and add a subtle parallax +
// scroll cue through a small client child. Home carousel slides reuse only the
// BannerBackdrop at their existing height — the carousel is not a hero.
//
// Pure rendering only: it imports no `fs` module, so it can be used from both
// server pages and the client HomeCarousel. Slot resolution happens in the
// server-only app/lib/banner-slot.ts and arrives as the `imageSlot` prop.
import type { CSSProperties, ReactNode } from 'react';
import { BANNER_VARIANTS, BannerBackdrop } from './BannerBackdrop';
import { HeroBannerMedia, HeroScrollCue } from './HeroBannerEffects';

export { BANNER_VARIANTS, BannerBackdrop } from './BannerBackdrop';

export type HeroBannerProps = {
  /** Banner title. Becomes the page's single h1 unless `as="h2"`. */
  title: string;
  /** One-line hook drawn from existing page copy. */
  tagline?: string;
  /** Resolved banner PNG web path (build-time), or null → interim backdrop. */
  imageSlot?: string | null;
  /** Backdrop/tint key: a culture id or page key (`relics`, `cards`, `play`…). */
  culture?: string;
  /** Banner art slot name, used for the `data-banner` marker (defaults to `culture`). */
  slot?: string;
  /** Small kicker above the title. */
  eyebrow?: string;
  /** Native-script epithet (culture pages). */
  native?: string;
  /** Heading level — keep exactly ONE h1 per page. */
  as?: 'h1' | 'h2';
  /** Optional actions rendered under the tagline. */
  children?: ReactNode;
};

export function HeroBanner({
  title,
  tagline,
  imageSlot = null,
  culture = 'default',
  slot,
  eyebrow,
  native,
  as: Heading = 'h1',
  children,
}: HeroBannerProps) {
  const variant = BANNER_VARIANTS[culture] ? culture : 'default';
  const v = BANNER_VARIANTS[variant];
  const bannerSlot = slot || variant;
  const style = {
    ['--hb-accent' as string]: v.accent,
    ['--hb-accent2' as string]: v.accent2,
  } as CSSProperties;
  return (
    <section className="hero-banner" data-banner={bannerSlot} style={style}>
      <HeroBannerMedia variant={variant} imageSlot={imageSlot} />
      <div className="hero-banner-scrim" aria-hidden="true" />
      <div className="container hero-banner-content">
        <div className="hero-banner-copy">
          {eyebrow ? <span className="eyebrow hero-banner-eyebrow">{eyebrow}</span> : null}
          <Heading className="hero-banner-title">{title}</Heading>
          {native ? <div className="hero-banner-native native">{native}</div> : null}
          {tagline ? <p className="hero-banner-tagline">{tagline}</p> : null}
          {children ? <div className="hero-banner-actions">{children}</div> : null}
        </div>
      </div>
      <HeroScrollCue />
    </section>
  );
}

/** First sentence of a block of copy, for one-line taglines. */
export function firstSentence(text: string): string {
  const m = (text || '').trim().match(/^[^.!?]*[.!?]/);
  return (m ? m[0] : text || '').trim();
}
