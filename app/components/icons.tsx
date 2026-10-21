// THE DIVINE ATLAS — shared nav icon set (v2 Phase 2).
// One consistent line style: 24×24 viewBox, stroke = currentColor, no fills,
// 1.75 stroke width, round caps/joins. Pure inline SVG, no external deps.
// Every glyph is a handful of nodes so it stays crisp at 14–24 px.
import type { SVGProps, ReactElement } from 'react';

export type IconProps = SVGProps<SVGSVGElement>;
export type IconComponent = (props: IconProps) => ReactElement;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={24}
      height={24}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ---- brand ---- */
export const BrandIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 2.5 L14 10 L21.5 12 L14 14 L12 21.5 L10 14 L2.5 12 L10 10 Z" />
  </Base>
);

/* ---- religion glyphs (one recognizable mythic mark per pantheon) ---- */
// Japanese — torii gate
export const ToriiIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 5 H21" />
    <path d="M4.5 8.5 H19.5" />
    <path d="M6.5 5 V20" />
    <path d="M17.5 5 V20" />
    <path d="M12 5 V8.5" />
  </Base>
);

// Greek — lightning bolt (Zeus)
export const GreekIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M13.5 2.5 L5 13 H11 L10.5 21.5 L19 10.5 H12.5 Z" />
  </Base>
);

// Norse — Mjölnir (Thor's hammer)
export const MjolnirIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5.5 9.5 H18.5 L17 14.5 H7 Z" />
    <path d="M12 14.5 V21.5" />
    <path d="M5.5 12 H18.5" />
  </Base>
);

// Egyptian — ankh
export const AnkhIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 2.75 C9.5 2.75 8 4.75 8 7 C8 9 9.75 10.6 12 10.6 C14.25 10.6 16 9 16 7 C16 4.75 14.5 2.75 12 2.75 Z" />
    <path d="M12 10.6 V21.25" />
    <path d="M7.5 13.75 H16.5" />
  </Base>
);

// Slavic — six-spoke Kolovrat-style thunder sign (PO 2026-10-21).
// Each spoke runs from the inner ring (r≈2.2) to r=6, then bends ~60° out to
// r≈8.5 at the tip. Deliberately distinct from the 8-point cuneiform star and
// Thor's hammer; the bent spokes stay legible down to 16px.
export const RosetteIcon = (p: IconProps) => (
  <Base {...p}>
    {/* Slavic thunder sign (Kolovrat-style) per PO 2026-10-21 */}
    <circle cx="12" cy="12" r="2.2" />
    <path d="M12 9.8 L12 6 L19.36 7.75" />
    <path d="M12 9.8 L12 6 L19.36 7.75" transform="rotate(60 12 12)" />
    <path d="M12 9.8 L12 6 L19.36 7.75" transform="rotate(120 12 12)" />
    <path d="M12 9.8 L12 6 L19.36 7.75" transform="rotate(180 12 12)" />
    <path d="M12 9.8 L12 6 L19.36 7.75" transform="rotate(240 12 12)" />
    <path d="M12 9.8 L12 6 L19.36 7.75" transform="rotate(300 12 12)" />
  </Base>
);

// Mesopotamian — cuneiform / Ishtar eight-point star
export const CuneiformStarIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9.5 3.5 H14.5 V9.5 H20.5 V14.5 H14.5 V20.5 H9.5 V14.5 H3.5 V9.5 H9.5 Z" />
    <path d="M12 2.5 L21.5 12 L12 21.5 L2.5 12 Z" />
  </Base>
);

/* ---- nav / action glyphs ---- */
export const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 11 L12 4 L20.5 11" />
    <path d="M5.5 9.5 V20 H18.5 V9.5" />
    <path d="M9.75 20 V14 H14.25 V20" />
  </Base>
);

// Relics — amphora (artifact vessel)
export const RelicIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M9 7 C6.5 9 5.5 12.5 6.5 16 C7.2 18.6 9.2 20.2 12 20.2 C14.8 20.2 16.8 18.6 17.5 16 C18.5 12.5 17.5 9 15 7 Z" />
    <path d="M9 7 H15" />
    <path d="M10.25 7 V4.75 H13.75 V7" />
    <path d="M9.75 20.2 H14.25" />
    <path d="M9 7.5 C6.75 8 6.25 10 7.5 11.25" />
    <path d="M15 7.5 C17.25 8 17.75 10 16.5 11.25" />
  </Base>
);

// Cards — two overlapping card rectangles
export const CardsIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="8" y="3.5" width="11" height="14" rx="1.5" />
    <rect x="5" y="6.5" width="11" height="14" rx="1.5" />
  </Base>
);

// Play — crossed swords
export const PlayIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M19 5 L7.5 16.5" />
    <path d="M5 5 L16.5 16.5" />
    <path d="M7.5 16.5 L4.5 19.5" />
    <path d="M16.5 16.5 L19.5 19.5" />
    <path d="M6 15 L9.5 18.5" />
    <path d="M18 15 L14.5 18.5" />
  </Base>
);

// Graph — node-link cluster
export const GraphIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="2.2" />
    <circle cx="5" cy="6" r="2.2" />
    <circle cx="19" cy="6" r="2.2" />
    <circle cx="12" cy="19.5" r="2.2" />
    <path d="M6.6 7.4 L10.4 10.5" />
    <path d="M17.4 7.4 L13.6 10.5" />
    <path d="M12 14.2 V17.3" />
  </Base>
);

// Stories — open scroll / book
export const StoriesIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 6 C9.25 4.5 6.25 4.5 4 5.5 V18 C6.25 17 9.25 17 12 18.5 C14.75 17 17.75 17 20 18 V5.5 C17.75 4.5 14.75 4.5 12 6 Z" />
    <path d="M12 6 V18.5" />
  </Base>
);

// Compare — balance scales
export const CompareIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 6.5 H20" />
    <path d="M12 3.5 V20" />
    <path d="M8.5 20 H15.5" />
    <path d="M4 6.5 L1.75 12 H6.25 Z" />
    <path d="M20 6.5 L17.75 12 H22.25 Z" />
  </Base>
);

// Vault — arched vault door
export const VaultIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 21 V10.5 A7 7 0 0 1 19 10.5 V21" />
    <path d="M8.5 21 V11 A3.5 3.5 0 0 1 15.5 11 V21" />
    <path d="M3 21 H21" />
    <path d="M8.5 15.5 H15.5" />
  </Base>
);

// Search — magnifier
export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M16.5 16.5 L21 21" />
  </Base>
);

// More — three dots
export const MoreIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </Base>
);

export const MenuIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3.5 6.5 H20.5" />
    <path d="M3.5 12 H20.5" />
    <path d="M3.5 17.5 H20.5" />
  </Base>
);

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6 L18 18" />
    <path d="M18 6 L6 18" />
  </Base>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 9.5 L12 15.5 L18 9.5" />
  </Base>
);

// Religions — temple (aggregate glyph for the dropdown trigger)
export const ReligionsIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M3 10 L12 4 L21 10" />
    <path d="M5 10 H19" />
    <path d="M7 10 V18" />
    <path d="M12 10 V18" />
    <path d="M17 10 V18" />
    <path d="M6 18 H18" />
    <path d="M4 21 H20" />
  </Base>
);

// Book — rules / how to play
export const BookIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 3.5 H16 A2 2 0 0 1 18 5.5 V18.5 A2 2 0 0 1 16 20.5 H6 Z" />
    <path d="M6 3.5 V20.5" />
    <path d="M9 8 H15" />
    <path d="M9 11.5 H15" />
  </Base>
);

// Board — duelling mat / grid
export const BoardIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
    <path d="M12 4.5 V19.5" />
    <path d="M3.5 12 H20.5" />
  </Base>
);

// About — info
export const AboutIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11 V16.5" />
    <path d="M12 7.75 V8.25" />
  </Base>
);

/* ---- registry: culture id → religion glyph ---- */
export const cultureIcons: Record<string, IconComponent> = {
  japanese: ToriiIcon,
  greek: GreekIcon,
  norse: MjolnirIcon,
  egyptian: AnkhIcon,
  slavic: RosetteIcon,
  mesopotamian: CuneiformStarIcon,
};
