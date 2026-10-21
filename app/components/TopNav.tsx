'use client';
// TopNav (v2 Phase 2) — primary-only navigation.
// Desktop: Religions ▾ · Relics · Cards · Search · More ▾ (grouped).
// Mobile: compact header (brand + search + menu) + fixed bottom tab bar
// (Home · Religions · Relics · Cards · More) with a slide-up More sheet.
// Client component: dropdowns, pathname highlight, keyboard + outside-click
// dismissal. No window reads during render (hydration-safe for static export).
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SearchTrigger } from './SearchTrigger';
import {
  AboutIcon,
  BoardIcon,
  BookIcon,
  BrandIcon,
  CardsIcon,
  ChevronDownIcon,
  CloseIcon,
  CompareIcon,
  GraphIcon,
  HomeIcon,
  MenuIcon,
  MoreIcon,
  PlayIcon,
  RelicIcon,
  ReligionsIcon,
  StoriesIcon,
  cultureIcons,
} from './icons';
import type { IconComponent } from './icons';

type Section = 'religions' | 'relics' | 'cards' | 'play' | 'explore' | 'about' | null;

const PANTHEONS: { id: string; label: string }[] = [
  { id: 'japanese', label: 'Japanese' },
  { id: 'greek', label: 'Greek' },
  { id: 'norse', label: 'Norse' },
  { id: 'egyptian', label: 'Egyptian' },
  { id: 'slavic', label: 'Slavic' },
  { id: 'mesopotamian', label: 'Mesopotamian' },
];

type MenuItem = { label: string; href: string; Icon: IconComponent };
const MORE_GROUPS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Play',
    items: [
      { label: 'Play', href: '/play', Icon: PlayIcon },
      { label: 'How to Play', href: '/how-to-play', Icon: BookIcon },
      { label: 'Dueling Mat', href: '/how-to-play/board', Icon: BoardIcon },
    ],
  },
  {
    title: 'Explore',
    items: [
      { label: 'Graph', href: '/graph', Icon: GraphIcon },
      { label: 'Stories', href: '/stories', Icon: StoriesIcon },
      { label: 'Compare', href: '/compare', Icon: CompareIcon },
      { label: 'Print & Play', href: '/print', Icon: BoardIcon },
    ],
  },
  {
    title: 'About',
    items: [{ label: 'About the Atlas', href: '/about', Icon: AboutIcon }],
  },
];

function sectionOf(pathname: string): Section {
  if (!pathname) return null;
  if (
    pathname.startsWith('/culture') ||
    pathname.startsWith('/deity') ||
    pathname.startsWith('/myths') ||
    pathname.startsWith('/domain')
  )
    return 'religions';
  if (pathname.startsWith('/artifacts')) return 'relics';
  if (pathname.startsWith('/cards')) return 'cards';
  if (pathname.startsWith('/play') || pathname.startsWith('/how-to-play')) return 'play';
  if (pathname.startsWith('/graph') || pathname.startsWith('/stories') || pathname.startsWith('/compare') || pathname.startsWith('/print'))
    return 'explore';
  if (pathname.startsWith('/about')) return 'about';
  return null;
}

export function TopNav() {
  const pathname = usePathname() || '/';
  const section = sectionOf(pathname);
  const [open, setOpen] = useState<'religions' | 'more' | null>(null); // desktop dropdowns
  const [sheet, setSheet] = useState<'religions' | 'more' | null>(null); // mobile sheet
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const religionsRef = useRef<HTMLButtonElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);

  const isMoreActive =
    section === 'play' || section === 'explore' || section === 'about' || open === 'more';
  const isMoreTabActive = isMoreActive || sheet === 'more';

  // Route change closes every menu.
  useEffect(() => {
    setOpen(null);
    setSheet(null);
  }, [pathname]);

  // Glass bar gains a slightly more opaque background after 8px of scroll.
  // Passive listener + one rAF per burst: no layout reads and no thrash.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 8);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  // Desktop dropdown: Escape + outside click, focus returns to its trigger.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const trigger = open === 'religions' ? religionsRef.current : moreRef.current;
      setOpen(null);
      trigger?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  // Mobile sheet: Escape closes.
  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheet(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [sheet]);

  const toggle = (which: 'religions' | 'more') =>
    setOpen((v) => (v === which ? null : which));
  const toggleSheet = (which: 'religions' | 'more') =>
    setSheet((v) => (v === which ? null : which));

  const religionsMenu = (
    <div className="nav-dd-grid">
      {PANTHEONS.map((p) => {
        const Icon = cultureIcons[p.id];
        return (
          <Link
            key={p.id}
            href={`/culture/${p.id}`}
            role="menuitem"
            className="nav-dd-item"
            onClick={() => setOpen(null)}
          >
            <Icon className="nav-dd-icon" />
            <span className="nav-dd-label">{p.label}</span>
          </Link>
        );
      })}
    </div>
  );

  return (
    <>
      <nav className={`topnav${scrolled ? ' scrolled' : ''}`} aria-label="Primary" ref={navRef}>
        <div className="container inner">
          <Link href="/" className="brand" aria-label="The Divine Atlas — home">
            <BrandIcon className="brand-mark" />
            <span>The Divine Atlas</span>
          </Link>

          {/* Desktop primary nav */}
          <div className="nav-desktop">
            <div className="nav-menu">
              <button
                ref={religionsRef}
                type="button"
                className={`nav-item${section === 'religions' ? ' is-active' : ''}`}
                aria-haspopup="true"
                aria-expanded={open === 'religions'}
                aria-controls="nav-religions"
                onClick={() => toggle('religions')}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setOpen('religions');
                  }
                }}
              >
                <ReligionsIcon className="nav-icon" />
                <span>Religions</span>
                <ChevronDownIcon className="nav-chevron" />
              </button>
              <div
                id="nav-religions"
                className={`nav-dd nav-dd-religions${open === 'religions' ? ' open' : ''}`}
                role="menu"
                hidden={open !== 'religions'}
              >
                {religionsMenu}
              </div>
            </div>

            <Link
              href="/artifacts"
              className={`nav-item${section === 'relics' ? ' is-active' : ''}`}
            >
              <RelicIcon className="nav-icon" />
              <span>Relics</span>
            </Link>

            <Link href="/cards" className={`nav-item${section === 'cards' ? ' is-active' : ''}`}>
              <CardsIcon className="nav-icon" />
              <span>Cards</span>
            </Link>

            <SearchTrigger />

            <div className="nav-menu">
              <button
                ref={moreRef}
                type="button"
                className={`nav-item${isMoreActive ? ' is-active' : ''}`}
                aria-haspopup="true"
                aria-expanded={open === 'more'}
                aria-controls="nav-more"
                onClick={() => toggle('more')}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setOpen('more');
                  }
                }}
              >
                <MoreIcon className="nav-icon" />
                <span>More</span>
                <ChevronDownIcon className="nav-chevron" />
              </button>
              <div
                id="nav-more"
                className={`nav-dd nav-dd-more${open === 'more' ? ' open' : ''}`}
                role="menu"
                hidden={open !== 'more'}
              >
                {MORE_GROUPS.map((group) => (
                  <div key={group.title} className="nav-dd-group">
                    <span className="nav-dd-group-title">{group.title}</span>
                    {group.items.map((item) => {
                      const Icon = item.Icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          role="menuitem"
                          className="nav-dd-item"
                          onClick={() => setOpen(null)}
                        >
                          <Icon className="nav-dd-icon" />
                          <span className="nav-dd-label">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile compact controls */}
          <div className="nav-mobile-actions">
            <SearchTrigger />
            <button
              type="button"
              className="nav-hamburger"
              aria-label="Open menu"
              aria-haspopup="true"
              aria-expanded={sheet === 'more'}
              onClick={() => toggleSheet('more')}
            >
              <MenuIcon className="nav-icon" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <nav className="tabbar" aria-label="Primary mobile">
        <Link href="/" className={`tab${pathname === '/' ? ' is-active' : ''}`}>
          <HomeIcon className="tab-icon" />
          <span className="tab-label">Home</span>
        </Link>
        <button
          type="button"
          className={`tab${section === 'religions' ? ' is-active' : ''}`}
          aria-haspopup="true"
          aria-expanded={sheet === 'religions'}
          onClick={() => toggleSheet('religions')}
        >
          <ReligionsIcon className="tab-icon" />
          <span className="tab-label">Religions</span>
        </button>
        <Link href="/artifacts" className={`tab${section === 'relics' ? ' is-active' : ''}`}>
          <RelicIcon className="tab-icon" />
          <span className="tab-label">Relics</span>
        </Link>
        <Link href="/cards" className={`tab${section === 'cards' ? ' is-active' : ''}`}>
          <CardsIcon className="tab-icon" />
          <span className="tab-label">Cards</span>
        </Link>
        <button
          type="button"
          className={`tab${isMoreTabActive ? ' is-active' : ''}`}
          aria-haspopup="true"
          aria-expanded={sheet === 'more'}
          onClick={() => toggleSheet('more')}
        >
          <MoreIcon className="tab-icon" />
          <span className="tab-label">More</span>
        </button>
      </nav>

      {/* Slide-up sheet (mobile) */}
      {sheet && (
        <div className="sheet-root">
          <button
            type="button"
            className="sheet-scrim"
            aria-label="Close menu"
            onClick={() => setSheet(null)}
          />
          <div
            className="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={sheet === 'more' ? 'More' : 'Religions'}
          >
            <div className="sheet-head">
              <span className="sheet-title">{sheet === 'more' ? 'More' : 'Religions'}</span>
              <button
                type="button"
                className="sheet-close"
                aria-label="Close"
                onClick={() => setSheet(null)}
                autoFocus
              >
                <CloseIcon className="nav-icon" />
              </button>
            </div>
            <div className="sheet-body">
              {sheet === 'religions' ? (
                <div className="sheet-religions">
                  {PANTHEONS.map((p) => {
                    const Icon = cultureIcons[p.id];
                    return (
                      <Link
                        key={p.id}
                        href={`/culture/${p.id}`}
                        className="sheet-item"
                        onClick={() => setSheet(null)}
                      >
                        <Icon className="nav-dd-icon" />
                        <span>{p.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <>
                  {MORE_GROUPS.map((group) => (
                    <div key={group.title} className="sheet-section">
                      <span className="sheet-group-title">{group.title}</span>
                      {group.items.map((item) => {
                        const Icon = item.Icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="sheet-item"
                            onClick={() => setSheet(null)}
                          >
                            <Icon className="nav-dd-icon" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                  <div className="sheet-section">
                    <span className="sheet-group-title">Religions</span>
                    <div className="sheet-religions">
                      {PANTHEONS.map((p) => {
                        const Icon = cultureIcons[p.id];
                        return (
                          <Link
                            key={p.id}
                            href={`/culture/${p.id}`}
                            className="sheet-item"
                            onClick={() => setSheet(null)}
                          >
                            <Icon className="nav-dd-icon" />
                            <span>{p.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
