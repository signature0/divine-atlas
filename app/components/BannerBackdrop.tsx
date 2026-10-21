// Shared page-backdrop art for hero banners and the home carousel (v2 Phase 11).
// Pure rendering only: no fs, no window — safe on server and client.
import type { CSSProperties } from 'react';
import {
  cultureIcons,
  RelicIcon,
  CardsIcon,
  PlayIcon,
  GraphIcon,
  StoriesIcon,
  CompareIcon,
  AboutIcon,
  BoardIcon,
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
  print: { icon: BoardIcon, accent: '#c8a24a', accent2: '#7d8ca3' },
  default: { icon: BrandIcon, accent: '#c8a24a', accent2: '#2f7f7a' },
};

export function variantFor(key?: string): BannerVariant {
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
