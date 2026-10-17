'use client';

// THE DIVINE ATLAS — home hero carousel (v2 Phase 3).
//
// Showcases the site's content categories. Accessible by construction:
// region + aria-roledescription="carousel", auto-advance that pauses on hover,
// touch and document.hidden, pointer/touch swipe, prev/next arrows, dot
// indicators, full keyboard support, aria-hidden/inert on inactive slides and
// `prefers-reduced-motion` (no auto-advance, instant swap). Hydration-safe:
// every window/matchMedia read happens in useEffect; the initial slide is 0 on
// both server and client. Only the first two backdrops render eagerly.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BannerBackdrop } from './HeroBanner';

export type CarouselSlide = {
  key: string;
  href: string;
  eyebrow?: string;
  title: string;
  tagline: string;
  /** Backdrop/tint key — the same unique interim art as the page banner. */
  variant: string;
  /** Resolved banner PNG (build-time), or null → interim backdrop. */
  imageSlot: string | null;
};

const AUTOPLAY_MS = 6000;
const SWIPE_THRESHOLD = 40;
const EAGER_SLIDES = 2;

export function HomeCarousel({ slides }: { slides: CarouselSlide[] }) {
  const router = useRouter();
  const n = slides.length;
  const [index, setIndex] = useState(0);
  const [advanced, setAdvanced] = useState(false);
  const [hover, setHover] = useState(false);
  const [touching, setTouching] = useState(false);
  const [docHidden, setDocHidden] = useState(false);
  const [reduced, setReduced] = useState(false);
  const drag = useRef({ x: 0, active: false });
  const moved = useRef(false);

  const go = useCallback(
    (i: number) => {
      if (n === 0) return;
      setIndex(((i % n) + n) % n);
      setAdvanced(true);
    },
    [n],
  );
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  // Reduced motion — read only in the browser, never during render.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // Pause when the tab is hidden.
  useEffect(() => {
    const onVis = () => setDocHidden(document.hidden);
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  const paused = hover || touching || docHidden || reduced;

  // Auto-advance 6s; never under reduced motion, never while paused.
  useEffect(() => {
    if (paused || n < 2) return;
    const t = window.setInterval(() => {
      setAdvanced(true);
      setIndex((i) => (i + 1) % n);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(t);
  }, [paused, n]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(n - 1); }
    else if (e.key === 'Enter') {
      // Let a focused link activate itself; otherwise open the active slide.
      if ((e.target as HTMLElement)?.tagName !== 'A') {
        e.preventDefault();
        router.push(slides[index].href);
      }
    }
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, active: true };
    moved.current = false;
    setTouching(true);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.x;
    drag.current.active = false;
    setTouching(false);
    if (Math.abs(dx) > SWIPE_THRESHOLD) {
      moved.current = true;
      if (dx < 0) next(); else prev();
    }
  };
  const onPointerCancel = () => {
    drag.current.active = false;
    setTouching(false);
  };
  const onClickCapture = (e: React.MouseEvent) => {
    if (moved.current) {
      e.preventDefault();
      e.stopPropagation();
      moved.current = false;
    }
  };

  if (n === 0) return null;

  return (
    <div
      className="home-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Site highlights"
      tabIndex={0}
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setHover(false); }}
    >
      <div
        className="home-carousel-viewport"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
        onClickCapture={onClickCapture}
      >
        {slides.map((s, i) => {
          const active = i === index;
          const showBackdrop = i < EAGER_SLIDES || advanced;
          return (
            <a
              key={s.key}
              href={s.href}
              className={`carousel-slide${active ? ' is-active' : ''}`}
              aria-hidden={!active}
              tabIndex={active ? 0 : -1}
              inert={!active}
            >
              {showBackdrop ? <BannerBackdrop variant={s.variant} /> : <span className="carousel-slide-blank" aria-hidden="true" />}
              {showBackdrop && s.imageSlot ? (
                <img
                  className="carousel-slide-img"
                  src={s.imageSlot}
                  alt=""
                  loading={i < EAGER_SLIDES ? 'eager' : 'lazy'}
                  decoding="async"
                />
              ) : null}
              <span className="carousel-slide-scrim" aria-hidden="true" />
              <span className="container carousel-slide-content">
                {s.eyebrow ? <span className="eyebrow carousel-slide-eyebrow">{s.eyebrow}</span> : null}
                <h2 className="carousel-slide-title">{s.title}</h2>
                <p className="carousel-slide-tagline">{s.tagline}</p>
                <span className="carousel-slide-cta">Explore →</span>
              </span>
            </a>
          );
        })}
      </div>

      <div className="carousel-controls">
        <button type="button" className="carousel-arrow" aria-label="Previous slide" onClick={prev}>‹</button>
        <div className="carousel-dots">
          {slides.map((s, i) => (
            <button
              key={s.key}
              type="button"
              className={`carousel-dot${i === index ? ' is-active' : ''}`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => go(i)}
            />
          ))}
        </div>
        <button type="button" className="carousel-arrow" aria-label="Next slide" onClick={next}>›</button>
      </div>
    </div>
  );
}
