import type { Metadata, Viewport } from 'next';
import './globals.css';

// Self-hosted fonts (Google Fonts CDN is unreachable from this machine)
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/noto-serif-jp/400.css';
import '@fontsource/noto-serif-jp/700.css';

import { TopNav } from './components/TopNav';
import { SearchOverlay } from './components/SearchOverlay';
import { allCultures } from './lib/data';

export const metadata: Metadata = {
  title: {
    default: 'The Divine Atlas — An interactive museum of world mythology',
    template: '%s · The Divine Atlas',
  },
  description:
    'An interactive codex of the world\'s mythologies — Japanese, Greek, Norse, Egyptian, Slavic, and Mesopotamian. A graph, not a family tree: every claim carried by its sources, every uncertainty preserved.',
  openGraph: {
    title: 'The Divine Atlas — An interactive museum of world mythology',
    description:
      'Six pantheons as one living codex: 184 illustrated deity cards, myths, relics, a relationship graph, and a printable card game.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1216, height: 640, alt: 'A council of six throned gods — one from each pantheon — under a golden constellation vault.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Divine Atlas — An interactive museum of world mythology',
    description:
      'Six pantheons as one living codex: 184 illustrated deity cards, myths, relics, a relationship graph, and a printable card game.',
    images: ['/og-image.png'],
  },
};

export const viewport: Viewport = {
  themeColor: '#0b0b0e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const all = allCultures();
  const entities = Object.values(all).flatMap((d) => d.entities);
  const myths = Object.values(all).flatMap((d) => d.myths);
  const artifacts = Object.values(all).flatMap((d) => d.artifacts);
  return (
    <html lang="en">
      <body>
        {/* DES-006: skip link — first tab stop on every page, hidden until focused (.skip-link in globals.css) */}
        <a className="skip-link" href="#main">Skip to content</a>
        <TopNav />
        <SearchOverlay entities={entities} myths={myths} artifacts={artifacts} />
        <main id="main" tabIndex={-1}>{children}</main>
        <footer className="site-footer">
          <div className="container footer-inner small">
            <div className="footer-notes">
              <span><strong className="footer-strong">The Divine Atlas</strong> — a museum of the world&apos;s divine imagination</span>
              {/* DES-008: drop the 'Version 1:' dev artifact — in-world footer voice */}
              <span>Six galleries: Japanese · Greek · Norse · Egyptian · Slavic · Mesopotamian</span>
              <span><a href="/print">Print &amp; play</a> — the deck, mat &amp; rulebook, ready for the table</span>
              <span>Every nontrivial claim carries a source. Uncertainties are preserved, not resolved.</span>
              <span>Artwork: public domain / open license, always attributed.</span>
              {/* Phase 5 note kept in the detail overlay too — one honest credit, both places */}
              <span>Card art labelled &ldquo;generated reconstruction&rdquo; is an interpretive, machine-generated reconstruction from each figure&rsquo;s sourced attributes — not archival artwork.</span>
            </div>
            <div className="footer-credit">
              <p className="footer-design">Design by <span className="footer-name">Mazen Pasha</span></p>
              <p className="footer-mail-line"><a className="footer-mail" href="mailto:maz.basha@gmail.com">maz.basha@gmail.com</a></p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
