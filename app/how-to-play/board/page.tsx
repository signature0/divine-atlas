import type { Metadata } from 'next';
import Link from 'next/link';
import { PrintButton } from '../../components/PrintButton';
import { ELEMENT_LABELS, ELEMENT_COLORS } from '../../lib/card';
import { PILLAR_HP, ESSENCE_CAP, DECK_SIZE, FIELD_SLOTS, CHANNEL_GAIN, ELEMENT_ADVANTAGE_PAIRS } from '../../lib/pantheon';

export const metadata: Metadata = {
  title: 'Printable board — Pantheon',
  description: 'A print-ready Pantheon duelling mat: two player zones, field slots, essence tracker, Cosmic Pillar life track, the elemental wheel and a turn-flow strip. One page, A4 or Letter.',
};

const WHEEL = ['fire', 'earth', 'water', 'storm', 'life', 'mind', 'war'] as const;

function dots(n: number, x: number, y: number, gap: number, r: number, perRow: number, keyPrefix: string) {
  return Array.from({ length: n }).map((_, i) => {
    const col = i % perRow;
    const row = Math.floor(i / perRow);
    return <circle key={`${keyPrefix}-${i}`} cx={x + col * gap} cy={y + row * gap} r={r} fill="#fff" stroke="#333" strokeWidth="1" />;
  });
}

function PlayerZone({ label, y }: { label: string; y: number }) {
  return (
    <g>
      <rect x="30" y={y} width="720" height="330" rx="10" fill="#fff" stroke="#111" strokeWidth="1.6" />
      <text x="46" y={y + 28} fontSize="18" fill="#111" fontWeight="700" style={{ fontFamily: 'Georgia, serif' }}>{label}</text>
      <text x="734" y={y + 28} fontSize="11" fill="#666" textAnchor="end" style={{ fontFamily: 'monospace' }}>COSMIC PILLAR {PILLAR_HP} → 0</text>

      {/* field slots */}
      {Array.from({ length: FIELD_SLOTS }).map((_, i) => (
        <g key={i}>
          <rect x={46 + i * 160} y={y + 44} width="148" height="132" rx="6" fill="#fafafa" stroke="#333" strokeWidth="1.2" />
          <text x={46 + i * 160 + 74} y={y + 112} fontSize="10" fill="#999" textAnchor="middle" style={{ fontFamily: 'monospace' }}>FIELD {i + 1}</text>
        </g>
      ))}

      {/* pillar track 20 -> 0 */}
      <text x="558" y={y + 60} fontSize="9" fill="#666" style={{ fontFamily: 'monospace' }}>PILLAR</text>
      {dots(PILLAR_HP, 566, y + 76, 21, 7, 10, 'p')}
      <text x="566" y={y + 132} fontSize="9" fill="#999" style={{ fontFamily: 'monospace' }}>{PILLAR_HP}</text>
      <text x="766" y={y + 132} fontSize="9" fill="#999" textAnchor="end" style={{ fontFamily: 'monospace' }}>0</text>

      {/* relic row */}
      <text x="46" y={y + 196} fontSize="9" fill="#666" style={{ fontFamily: 'monospace' }}>RELICS (one per deity)</text>
      {Array.from({ length: FIELD_SLOTS }).map((_, i) => (
        <rect key={i} x={46 + i * 160} y={y + 204} width="148" height="34" rx="5" fill="#fff" stroke="#888" strokeWidth="1" strokeDasharray="4 3" />
      ))}

      {/* essence track 0-12 */}
      <text x="46" y={y + 264} fontSize="9" fill="#666" style={{ fontFamily: 'monospace' }}>ESSENCE (0 → {ESSENCE_CAP})</text>
      {dots(ESSENCE_CAP, 56, y + 282, 52, 9, ESSENCE_CAP, 'e')}
      {Array.from({ length: ESSENCE_CAP + 1 }).map((_, i) => (
        <text key={i} x={56 + i * 52} y={y + 308} fontSize="8" fill="#999" textAnchor="middle" style={{ fontFamily: 'monospace' }}>{i}</text>
      ))}
    </g>
  );
}

export default function BoardPage() {
  return (
    <div className="board-page card-print-page">
      <div className="container print-toolbar board-toolbar" style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--bg-0)' }}>
        <Link href="/how-to-play" className="btn" style={{ padding: '6px 12px' }}>← Rules</Link>
        <div className="print-hint mono" style={{ color: 'var(--ink-2)', fontSize: '0.64rem' }}>
          One page · A4 or Letter · two duelling mats per sheet if you print two
        </div>
        <PrintButton label="Print sheet" />
      </div>

      <div className="container">
        <h1 className="board-title">Pantheon duelling mat</h1>
        <p className="muted print-intro" style={{ maxWidth: 760, lineHeight: 1.6, marginTop: 18 }}>
          The print-and-play mat. Tick the essence circles with a pencil as your pool grows (start at
          2, +{CHANNEL_GAIN} a turn, cap {ESSENCE_CAP}); mark destroyed Pillar circles from {PILLAR_HP} downward.
          Each side has {FIELD_SLOTS} field slots, a relic row, and its own Pillar track. Build a{' '}
          {DECK_SIZE}-card deck per player from one pantheon, then use the wheel and the flow strip.
        </p>
      </div>

      <div className="board-sheet-wrap">
        <svg className="board-svg" viewBox="0 0 780 1080" role="img" aria-label="Pantheon duelling mat">
          <rect x="0" y="0" width="780" height="1080" fill="#fff" />
          <text x="390" y="42" fontSize="22" fill="#111" textAnchor="middle" fontWeight="700" style={{ fontFamily: 'Georgia, serif' }}>THE DIVINE ATLAS · PANTHEON — DUELING MAT</text>

          <PlayerZone label="PLAYER 2" y={62} />
          <PlayerZone label="PLAYER 1" y={412} />

          {/* elemental wheel, small, bottom-left */}
          <g transform="translate(90, 850)">
            <text x="62" y="-16" fontSize="10" fill="#666" textAnchor="middle" style={{ fontFamily: 'monospace' }}>ELEMENTAL WHEEL</text>
            <circle cx="62" cy="62" r="58" fill="none" stroke="#ddd" strokeWidth="1" strokeDasharray="2 3" />
            {WHEEL.map((el, i) => {
              const a = (-90 + i * (360 / WHEEL.length)) * (Math.PI / 180);
              const x = 62 + 58 * Math.cos(a);
              const y = 62 + 58 * Math.sin(a);
              return (
                <g key={el}>
                  <circle cx={x} cy={y} r="13" fill="#fff" stroke={ELEMENT_COLORS[el]} strokeWidth="1.4" />
                  <text x={x} y={y + 3} fontSize="7" textAnchor="middle" fill={ELEMENT_COLORS[el]} style={{ fontFamily: 'monospace' }}>{ELEMENT_LABELS[el].slice(0, 4)}</text>
                </g>
              );
            })}
            {ELEMENT_ADVANTAGE_PAIRS.map(([from, to]) => {
              const pos = (el: string) => {
                const i = WHEEL.indexOf(el as (typeof WHEEL)[number]);
                const a = (-90 + i * (360 / WHEEL.length)) * (Math.PI / 180);
                return [62 + 58 * Math.cos(a), 62 + 58 * Math.sin(a)] as const;
              };
              const [x1, y1] = pos(from); const [x2, y2] = pos(to);
              const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
              return <line key={`${from}-${to}`} x1={x1} y1={y1} x2={x2 - (dx / len) * 15} y2={y2 - (dy / len) * 15} stroke="#555" strokeWidth="1" />;
            })}
          </g>

          {/* turn-flow reminder strip */}
          <g transform="translate(250, 850)">
            <rect x="0" y="0" width="470" height="150" rx="8" fill="#fafafa" stroke="#111" strokeWidth="1.2" />
            <text x="16" y="26" fontSize="11" fill="#111" fontWeight="700" style={{ fontFamily: 'monospace' }}>TURN FLOW</text>
            {[
              ['1 · DRAW', 'Draw 1 card'],
              ['2 · CHANNEL', `+${CHANNEL_GAIN} essence (cap ${ESSENCE_CAP})`],
              ['3 · MAIN', 'Summon · Attach relic · Strike'],
              ['4 · UPKEEP', 'Discard to 7 · ready your deities'],
            ].map(([a, b], i) => (
              <g key={a} transform={`translate(16, ${44 + i * 27})`}>
                <text x="0" y="0" fontSize="10" fill="#111" fontWeight="700" style={{ fontFamily: 'monospace' }}>{a}</text>
                <text x="118" y="0" fontSize="10" fill="#555" style={{ fontFamily: 'monospace' }}>{b}</text>
              </g>
            ))}
            <text x="16" y="140" fontSize="8" fill="#999" style={{ fontFamily: 'monospace' }}>Summoning sickness · one strike per deity per turn · pillar at 0 = defeat</text>
          </g>

          <text x="390" y="1050" fontSize="9" fill="#aaa" textAnchor="middle" style={{ fontFamily: 'monospace' }}>print &amp; play · thedivineatlas · every number is a design choice, not mythology</text>
        </svg>
      </div>
    </div>
  );
}
