// THE DIVINE ATLAS — HeroBanner (v2 Phase 3).
//
// A reusable, server-compatible banner: full-bleed media layer + dark
// bottom-weighted scrim + title (h1/h2 per page context) + tagline. When the
// generated art slot for a page does not exist at build time, the banner falls
// back to a UNIQUE per-page CSS/SVG interim backdrop — layered gradients plus a
// large low-opacity culture icon, tinted from that culture's palette. There is
// never one shared image across pages.
//
// Pure rendering only: it imports no `fs` module, so it can be used from both
// server pages and the client HomeCarousel. Slot resolution happens in the
// server-only app/lib/banner-slot.ts and arrives as the `imageSlot` prop.
import type { CSSProperties, ReactNode } from 'react';
import {
  cultureIcons,
  RelicIcon,
  CardsIcon,
  PlayIcon,
  GraphIcon,
  StoriesIcon,
  CompareIcon,
  AboutIcon,
  BrandIcon,
  type IconComponent,
} from './icons';

export type BannerVariant = { icon: IconComponent; accent: string; accent2: string };

/** One distinct palette + glyph per page family (culture accents mirror globals.css). */
export const BANNER_VARIANTS: Record<string, BannerVariant> = {
  japanese: { icon: cultureIcons.japanese, accent: '#c0392b', accent2: '#c9a227' },
  greek: { icon: cultureIcons.greek, accent: '#c9a227', accent2: '#7d8ca3' },
  norse: { icon: cultureIcons.norse, accent: '#5b8db8', accent2: '#b5654a' },
  egyptian: { icon: cultureIcons.egyptian, accent: '#c8a24a', accent2: '#2f7f7a' },
  slavic: { icon: cultureIcons.slavic, accent: '#8a9a5b', accent2: '#b5654a' },
  mesopotamian: { icon: cultureIcons.mesopotamian, accent: '#3f7ca6', accent2: '#b08d57' },
  relics: { icon: RelicIcon, accent: '#c8a24a', accent2: '#2f7f7a' },
  cards: { icon: CardsIcon, accent: '#7d8ca3', accent2: '#c9a227' },
  play: { icon: PlayIcon, accent: '#b5654a', accent2: '#5b8db8' },
  graph: { icon: GraphIcon, accent: '#2f7f7a', accent2: '#8a9a5b' },
  stories: { icon: StoriesIcon, accent: '#b08d57', accent2: '#7d8ca3' },
  compare: { icon: CompareIcon, accent: '#8a9a5b', accent2: '#c8a24a' },
  about: { icon: AboutIcon, accent: '#868171', accent2: '#c8a24a' },
  default: { icon: BrandIcon, accent: '#c8a24a', accent2: '#2f7f7a' },
};

function variantFor(key?: string): BannerVariant {
  return (key && BANNER_VARIANTS[key]) || BANNER_VARIANTS.default;
}

/** The unique per-page interim backdrop, reusable by the banner and the carousel. */
export function BannerBackdrop({ variant }: { variant: string }) {
  const v = variantFor(variant);
  const Icon = v.icon;
  return (
    <div
      className={`hero-backdrop hero-backdrop--${variant}`}
      data-backdrop={variant}
      aria-hidden="true"
      style={{ ['--hb-accent' as string]: v.accent, ['--hb-accent2' as string]: v.accent2 } as CSSProperties}
    >
      <span className="hero-backdrop-icon"><Icon /></span>
    </div>
  );
}

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
      <div className="hero-banner-media" aria-hidden="true">
        <BannerBackdrop variant={variant} />
        {imageSlot ? (
          <img className="hero-banner-img" src={imageSlot} alt="" loading="lazy" decoding="async" />
        ) : null}
      </div>
      <div className="hero-banner-scrim" aria-hidden="true" />
      <div className="container hero-banner-content">
        {eyebrow ? <span className="eyebrow hero-banner-eyebrow">{eyebrow}</span> : null}
        <Heading className="hero-banner-title">{title}</Heading>
        {native ? <div className="hero-banner-native native">{native}</div> : null}
        {tagline ? <p className="hero-banner-tagline">{tagline}</p> : null}
        {children ? <div className="hero-banner-actions">{children}</div> : null}
      </div>
    </section>
  );
}

/** First sentence of a block of copy, for one-line taglines. */
export function firstSentence(text: string): string {
  const m = (text || '').trim().match(/^[^.!?]*[.!?]/);
  return (m ? m[0] : text || '').trim();
}
