import type { Metadata } from 'next';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { HeroBanner } from '../components/HeroBanner';
import { resolveBannerSlot } from '../lib/banner-slot';

export const metadata: Metadata = {
  title: 'Print & play',
  description:
    'Download the print-ready Divine Atlas tabletop set: the full 184-card deck (fronts and backs), a duelling mat (A3/A4), the Pantheon rules booklet and reference sheets — plus printing instructions.',
};

// The generated set. Sizes are read from disk at build time; page counts and
// paper specs mirror scripts/make-pdfs.py exactly. When a file has not been
// generated in this checkout the row degrades to a "run the script" note rather
// than failing the build.
type PrintFile = {
  file: string;
  title: string;
  paper: string;
  pages: string;
  what: string;
  note?: string;
};

const PRINT_DIR = path.join(process.cwd(), 'public', 'print');

const FILES: PrintFile[] = [
  {
    file: 'cards-fronts.pdf',
    title: 'Card fronts — full deck',
    paper: 'A4 portrait',
    pages: '21 pages · 9 cards/page',
    what: 'All 184 card faces (158 deities + 26 relics) at true poker size (63.5 × 88.8 mm) with 3 mm bleed and crop marks.',
    note: 'Missing art (7 Slavic relic slots) is a styled placeholder panel, never blank.',
  },
  {
    file: 'cards-backs.pdf',
    title: 'Card backs — full deck',
    paper: 'A4 portrait',
    pages: '21 pages · 9 cards/page',
    what: 'The matching card backs, pre-arranged for duplex printing. Imposition is aligned to the fronts sheet for a short-edge flip.',
  },
  {
    file: 'board-a3.pdf',
    title: 'Duelling mat — A3',
    paper: 'A3 landscape',
    pages: '1 page',
    what: 'The Pantheon free-for-all mat with four seat zones, field slots, relic rows, Pillar and essence tracks, the elemental wheel and shared deck/discard/relic zones.',
    note: 'Best from a poster shop at 100%.',
  },
  {
    file: 'board-a4.pdf',
    title: 'Duelling mat — A4',
    paper: 'A4 landscape',
    pages: '1 page',
    what: 'The same mat scaled to fit a home printer. Print two if you want the A3-format zones larger.',
  },
  {
    file: 'rules-booklet.pdf',
    title: 'Pantheon — rules booklet',
    paper: 'A5 portrait',
    pages: '9 pages',
    what: 'The complete as-shipped rules (goal, setup, turn structure, stat derivation, deck-building, the wheel, synergies, balance, glossary), rendered from docs/GAME_RULES.md with a cover and table of contents.',
    note: 'Saddle-stitch friendly (fold in half).',
  },
  {
    file: 'reference-sheets.pdf',
    title: 'Reference sheets & tokens',
    paper: 'A4 portrait',
    pages: '2 pages',
    what: 'The element cycle, essence and Pillar trackers, the keyword quick-reference, the culture synergy table and cut-out tokens with crop marks.',
  },
];

function sizeLabel(p: string): string | null {
  try {
    const b = fs.statSync(p).size;
    return b > 1024 * 1024 ? `${(b / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`;
  } catch {
    return null;
  }
}

const CARD_BACKS = [
  { file: 'card-back.svg', label: 'Generic' },
  { file: 'card-back-japanese.svg', label: 'Japanese' },
  { file: 'card-back-greek.svg', label: 'Greek' },
  { file: 'card-back-norse.svg', label: 'Norse' },
  { file: 'card-back-egyptian.svg', label: 'Egyptian' },
  { file: 'card-back-slavic.svg', label: 'Slavic' },
  { file: 'card-back-mesopotamian.svg', label: 'Mesopotamian' },
];

export default function PrintPage() {
  const rows = FILES.map((f) => ({ ...f, size: sizeLabel(path.join(PRINT_DIR, f.file)) }));
  const deckSize = sizeLabel(path.join(PRINT_DIR, 'cards-fronts.pdf'));

  return (
    <div className="print-hub">
      <HeroBanner
        as="h1"
        slot="page-print"
        culture="print"
        eyebrow="Print"
        title="Print &amp; play"
        tagline="The whole Atlas, ready for the table: the full 184-card deck, a duelling mat, the rules booklet and reference sheets — generated from the same data the site ships."
        imageSlot={resolveBannerSlot('page-print')}
      >
        <Link href="/how-to-play" className="btn btn-primary">How to play</Link>
        <Link href="/how-to-play/board" className="btn btn-secondary">Board (on-screen)</Link>
        <Link href="/cards" className="btn btn-secondary">The Deck</Link>
      </HeroBanner>

      <section className="section-sm">
        <div className="container">
          <p className="print-hub-lead">
            Every file below is built by <span className="mono">scripts/make-pdfs.py</span> from
            <span className="mono"> public/duel-deck.json</span> and the <span className="mono">data/</span> corpus —
            the same source the website renders. Nothing is hand-uploaded, so the printed game and the site never drift.
            Regenerate with <span className="mono">python3 scripts/make-pdfs.py all</span>; see
            <span className="mono"> docs/PRINT.md</span>.
          </p>

          <h2 className="print-hub-h2">The files</h2>
          <div className="print-hub-grid">
            {rows.map((f) => (
              <article className="print-file" key={f.file}>
                <header className="print-file-head">
                  <h3>{f.title}</h3>
                  {f.size ? (
                    <a className="btn btn-secondary print-file-dl" href={`/print/${f.file}`} download>
                      Download ⤓
                    </a>
                  ) : (
                    <span className="print-file-missing mono">not generated</span>
                  )}
                </header>
                <div className="print-file-meta mono">
                  <span>{f.paper}</span>
                  <span>{f.pages}</span>
                  {f.size ? <span>{f.size}</span> : <span>run the script</span>}
                </div>
                <p>{f.what}</p>
                {f.note ? <p className="print-file-note">{f.note}</p> : null}
              </article>
            ))}
          </div>
          {!deckSize ? (
            <p className="print-hub-lead" style={{ color: 'var(--ink-2)' }}>
              The PDFs are not present in this checkout — run <span className="mono">python3 scripts/make-pdfs.py all</span> to
              generate them into <span className="mono">public/print/</span>.
            </p>
          ) : null}

          <h2 className="print-hub-h2">Card back</h2>
          <p className="print-hub-copy">
            A site-styled back: charcoal ground, a gold geometric lattice, a double rule inside the trim and the
            wordmark at the centre, with a per-pantheon accent and glyph. The generator emits both a generic back and
            six culture variants as vector SVG — the deck PDFs use crisp vector backs (no raster).
          </p>
          <div className="print-back-row">
            {CARD_BACKS.map((b) => (
              <a key={b.file} className="print-back" href={`/print/${b.file}`} download>
                {/* static SVG preview — a plain img keeps the export dependency-free */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/print/${b.file}`} alt={`The Divine Atlas card back — ${b.label}`} loading="lazy" />
                <span className="mono">{b.label}</span>
              </a>
            ))}
          </div>

          <h2 className="print-hub-h2">Printing instructions</h2>
          <ol className="print-steps">
            <li>
              <h3>Paper</h3>
              <p>
                250–300 gsm card stock for the cards (A4). Heavier stock shuffles and sleeves better and stops the
                back showing through. The rules booklet and reference sheets print fine on 100–160 gsm.
              </p>
            </li>
            <li>
              <h3>Scaling — actual size, 100%</h3>
              <p>
                Turn <b>“Fit to page” off</b> and set scaling to <b>100%</b>. Any shrink moves the crop marks and the
                backs out of register; the whole set assumes true size.
              </p>
            </li>
            <li>
              <h3>Duplex — flip on the short edge</h3>
              <p>
                Print <span className="mono">cards-fronts.pdf</span> first, then <span className="mono">cards-backs.pdf</span> on
                the reverse of the same sheets with <b>“Print on both sides” → “Flip on short edge”</b>. The backs sheet is
                pre-rotated 180° in the grid, which is exactly the correction a short-edge (portrait) turn needs, so every
                back lands behind its front. If your printer’s backs come out upside-down or mirrored, switch the setting
                to <b>“flip on long edge”</b> (some printers label the axes the other way) and print one test sheet first.
              </p>
            </li>
            <li>
              <h3>Check before you cut</h3>
              <p>
                Print one test sheet on plain paper and hold it to the light: each back should sit behind its own front.
                Sort out orientation on plain paper before committing card stock.
              </p>
            </li>
            <li>
              <h3>Cutting</h3>
              <p>
                The bleed extends 3 mm past each trim and short <b>crop marks</b> sit on the sheet edges (and the corners of
                the cut-out tokens on the reference sheets). Cut with a steel ruler and a craft knife or a paper trimmer
                along the mark lines. Trim the deck with a corner rounder if you like.
              </p>
            </li>
            <li>
              <h3>Sleeving</h3>
              <p>
                The cards are standard poker size (63.5 × 88.8 mm), so they fit any “standard / TCG” sleeve (e.g. 66 × 91 mm).
                Sleeve before the first game to protect the printed faces.
              </p>
            </li>
            <li>
              <h3>Board</h3>
              <p>
                The mat comes as <b>A3 landscape</b> (poster shop, print at 100%) and <b>A4 landscape</b> (home printer).
                The A4 version is the same layout at 70.7%; print two and butt them together if you want the A3 zones larger.
              </p>
            </li>
            <li>
              <h3>Rules booklet</h3>
              <p>
                <span className="mono">rules-booklet.pdf</span> is A5 with margins already set for a fold. For saddle-stitch,
                print <b>double-sided, flip on the short edge</b>, fold the stack in half along the spine and staple
                twice through the fold. A single-sided copy reads fine too.
              </p>
            </li>
          </ol>

          <h2 className="print-hub-h2">Before you hit print</h2>
          <ul className="print-notes">
            <li>
              <b>Colour:</b> the files are sRGB. Let the printer manage colour; there is no CMYK conversion in the
              generator, so screen colours and ink colours may differ slightly. Amateur “ink-saver” modes will mute the gold.
            </li>
            <li>
              <b>Fonts:</b> the PDFs use the standard PDF fonts (Helvetica / Times / Courier), which every printer has.
              Native-script names (Greek, Japanese, cuneiform…) are <b>omitted</b> from the printed cards rather than shown as
              missing-glyph boxes — the Latin names, types, stats and set codes are always present.
            </li>
            <li>
              <b>Resolution:</b> card art is embedded as JPEG at just over 300 DPI at printed size, so it stays sharp on
              card stock while keeping the deck PDF a workable size.
            </li>
            <li>
              <b>Numbers:</b> PWR / GRD / essence and all game values are an interpretive design layer, not mythology —
              the names, elements, domains and sources come from the Atlas’s cited corpus.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
