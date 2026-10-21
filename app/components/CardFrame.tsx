'use client';
// Shared card tile skeleton (v2 Phase 11, E1).
//
// DeityCard and RelicCard both render through these primitives so the outer
// poker frame, art box, and stat strip cannot drift apart. Relic-specific
// content (the RELIC band, owner line) is passed as children.
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ELEMENT_COLORS, ELEMENT_TEXT_COLORS, type CardElement } from '../lib/card';

export function CardArt({
  src,
  alt,
  fallback,
}: {
  src?: string | null;
  alt: string;
  fallback: string;
}) {
  const [broken, setBroken] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setBroken(true);
  }, []);
  if (src && !broken) {
    return (
      <div className="tc-art">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      </div>
    );
  }
  return (
    <div className="tc-art">
      <div className="tc-art-fallback"><span>{fallback}</span></div>
    </div>
  );
}

export function CardShell({
  size = 'md',
  element,
  accent,
  variant,
  style,
  children,
}: {
  size?: 'sm' | 'md' | 'lg';
  element: CardElement;
  accent: string;
  variant?: 'relic';
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      className={`tc tc-${size}${variant ? ` tc-${variant}` : ''}`}
      style={{
        '--tc-el': ELEMENT_COLORS[element],
        '--tc-el-text': ELEMENT_TEXT_COLORS[element],
        '--tc-culture': accent,
        ...style,
      } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function CardFace({ children }: { children: ReactNode }) {
  return <div className="tc-face">{children}</div>;
}

export function CardStatRow({ power, guard }: { power: number; guard: number }) {
  return (
    <div className="tc-stats">
      <div className="tc-stat">
        <span className="tc-stat-label">PWR</span>
        <span className="tc-stat-val">{power}</span>
      </div>
      <div className="tc-stat tc-stat-right">
        <span className="tc-stat-label">GRD</span>
        <span className="tc-stat-val">{guard}</span>
      </div>
    </div>
  );
}
