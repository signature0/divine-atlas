'use client';
// Client-only hero motion: subtle banner parallax (≤40px) and the scroll cue.
// Everything reads `window`/matchMedia inside effects or event handlers, never
// during render, so the static-export HTML stays hydration-safe.
import { useEffect, useRef } from 'react';
import { BannerBackdrop } from './BannerBackdrop';
import { ChevronDownIcon } from './icons';

const MAX_PARALLAX = 40;

export function HeroBannerMedia({ variant, imageSlot }: { variant: string; imageSlot?: string | null }) {
  const parallaxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const y = Math.min(MAX_PARALLAX, Math.max(0, window.scrollY * 0.12));
        if (parallaxRef.current) parallaxRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="hero-banner-media" aria-hidden="true">
      <div className="hero-banner-parallax" ref={parallaxRef}>
        <BannerBackdrop variant={variant} />
        {imageSlot ? (
          <img className="hero-banner-img" src={imageSlot} alt="" loading="lazy" decoding="async" />
        ) : null}
      </div>
    </div>
  );
}

export function HeroScrollCue() {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const hero = e.currentTarget.closest('.hero-banner');
    const next = hero?.nextElementSibling as HTMLElement | null;
    e.preventDefault();
    if (!next) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    next.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };
  return (
    <a href="#main" className="hero-scroll-cue" aria-label="Scroll to the page content" onClick={onClick}>
      <ChevronDownIcon />
    </a>
  );
}
