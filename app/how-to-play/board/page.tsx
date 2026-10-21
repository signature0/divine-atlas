import type { Metadata } from 'next';
import Link from 'next/link';
import { PrintButton } from '../../components/PrintButton';
import { ELEMENT_LABELS, ELEMENT_COLORS } from '../../lib/card';
import {
  PILLAR_HP, PILLAR_HP_BY_PLAYERS, ESSENCE_CAP, DECK_SIZE, FIELD_SLOTS, CHANNEL_GAIN,
  ESSENCE_RAMP, ELEMENT_ADVANTAGE_PAIRS,
} from '../../lib/pantheon';

export const metadata: Metadata = {
  title: 'Printable board — Pantheon',
  description: 'A print-ready Pantheon mat with four seat zones for 2–4 player free-for-all: field slots, essence trackers, Cosmic Pillar life tracks, a relic row and the elemental wheel. One page, A3 (or scale to A4/Letter).',
};

const WHEEL = ['fire', 'earth', 'water', 'storm', 'life', 'mind', 'war'] as const;
const MAX_PILLAR_DOTS = PILLAR_HP_BY_PLAYERS[4]; // 24 — enough for every mode

function dots(n: number, x: number, y: number, gap: number, r: number, perRow: number, keyPrefix: string) {
  return Array.from({ length: n }).map((_, i) => {
    const col = i % perRow;
    const row = Math.floor(i / perRow);
    return <circle key={`${keyPrefix}-${i}`} cx={x + col * gap} cy={y + row * gap} r={r} fill="#fff" stroke="#333" strokeWidth="1" />;
  });
}

/** One seat mat. Sized so four fit on a single A3 sheet (use only the zones you need). */
function PlayerZone({ label, x, y, w = 380, h = 356 }: { label: string; x: number; y: number; w?: number; h?: number }) {
  const pad = 14;
  const slotW = (w - pad * 2 - 16) / FIELD_SLOTS;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="10" fill="#fff" stroke="#111" strokeWidth="1.6" />
      <text x={x + pad} y={y + 24} fontSize="15" fill="#111" fontWeight="700" style={{ fontFamily: 'Georgia, serif' }}>{label}</text>
      <text x={x + w - pad} y={y + 24} fontSize="9" fill="#666" textAnchor="end" style={{ fontFamily: 'monospace' }}>PILLAR → 0</text>

      {/* field slots */}
      {Array.from({ length: FIELD_SLOTS }).map((_, i) => (
        <g key={i}>
          <rect x={x + pad + i * (slotW + 8)} y={y + 36} width={slotW} height="86" rx="6" fill="#fafafa" stroke="#333" strokeWidth="1.2" />
          <text x={x + pad + i * (slotW + 8) + slotW / 2} y={y + 84} fontSize="8" fill="#999" textAnchor="middle" style={{ fontFamily: 'monospace' }}>FIELD {i + 1}</text>
        </g>
      ))}

      {/* pillar track (up to 24) */}
      <text x={x + pad} y={y + 140} fontSize="8" fill="#666" style={{ fontFamily: 'monospace' }}>COSMIC PILLAR</text>
      {dots(MAX_PILLAR_DOTS, x + pad + 3, y + 150, 28, 5, 12, `p${label}`)}

      {/* relic row */}
      <text x={x + pad} y={y + 196} fontSize="8" fill="#666" style={{ fontFamily: 'monospace' }}>RELICS (one per deity)</text>
      {Array.from({ length: FIELD_SLOTS }).map((_, i) => (
        <rect key={i} x={x + pad + i * (slotW + 8)} y={y + 204} width={slotW} height="28" rx="5" fill="#fff" stroke="#888" strokeWidth="1" strokeDasharray="4 3" />
      ))}

      {/* essence track 0-12 */}
      <text x={x + pad} y={y + 256} fontSize="8" fill="#666" style={{ fontFamily: 'monospace' }}>ESSENCE (0 → {ESSENCE_CAP})</text>
      {dots(ESSENCE_CAP, x + pad + 5, y + 268, 29, 6, ESSENCE_CAP, `e${label}`)}
      {Array.from({ length: ESSENCE_CAP + 1 }).map((_, i) => (
        <text key={i} x={x + pad + 5 + i * 29} y={y + 292} fontSize="7" fill="#999" textAnchor="middle" style={{ fontFamily: 'monospace' }}>{i}</text>
      ))}
      <text x={x + pad} y={y + h - 12} fontSize="7" fill="#aaa" style={{ fontFamily: 'monospace' }}>hand limit 7 · deck {DECK_SIZE} · {FIELD_SLOTS} slots</text>
    </g>
  );
}

export default function BoardPage() {
  return (
    <div className="board-page card-print-page">
      <div className="container print-toolbar board-toolbar" style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--bg-0)' }}>
        <Link href="/how-to-play" className="btn btn-secondary" style={{ padding: '6px 12px' }}>← Rules</Link>
        <div className="print-hint mono" style={{ color: 'var(--ink-2)', fontSize: '0.64rem' }}>
          One sheet · A3 (or A4/Letter scaled) · four seat zones — use only the seats you need
        </div>
        <PrintButton label="Print sheet" />
      </div>

      <div className="container">
        <h1 className="board-title">Pantheon free-for-all mat</h1>
        <p className="muted print-intro" style={{ maxWidth: 760, lineHeight: 1.6, marginTop: 18 }}>
          The print-and-play mat, now with <b>four seat zones</b> for 2–4 player free-for-all games. Tick the essence
          circles as your pool grows (start at 2, +{CHANNEL_GAIN} in 2P or the 3–4P ramp {ESSENCE_RAMP.map((r) => r.gain).join('/')},
          cap {ESSENCE_CAP}); mark destroyed Pillar circles from your starting total downward ({PILLAR_HP} for 2–3 players,
          {' '}{PILLAR_HP_BY_PLAYERS[4]} for four). Each seat has {FIELD_SLOTS} field slots, a relic row, its own Pillar track and
          an essence track. Build a {DECK_SIZE}-card deck per seat from one pantheon, then use the wheel and the flow strip.
        </p>
      </div>

      <div className="board-sheet-wrap">
        <svg className="board-svg board-svg-wide" viewBox="0 0 820 1140" role="img" aria-label="Pantheon free-for-all duelling mat with four seat zones">
          <rect x="0" y="0" width="820" height="1140" fill="#fff" />
          <text x="410" y="42" fontSize="21" fill="#111" textAnchor="middle" fontWeight="700" style={{ fontFamily: 'Georgia, serif' }}>THE DIVINE ATLAS · PANTHEON — FREE-FOR-ALL MAT (2–4 SEATS)</text>

          <PlayerZone label="SEAT 1" x={16} y={62} />
          <PlayerZone label="SEAT 2" x={424} y={62} />
          <PlayerZone label="SEAT 3" x={16} y={436} />
          <PlayerZone label="SEAT 4" x={424} y={436} />

          {/* elemental wheel, bottom-left */}
          <g transform="translate(70, 850)">
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
            <rect x="0" y="0" width="500" height="168" rx="8" fill="#fafafa" stroke="#111" strokeWidth="1.2" />
            <text x="16" y="26" fontSize="11" fill="#111" fontWeight="700" style={{ fontFamily: 'monospace' }}>TURN FLOW (clockwise seats)</text>
            {[
              ['1 · DRAW', 'Draw 1 card'],
              ['2 · CHANNEL', `+${CHANNEL_GAIN} (2P) or ramp ${ESSENCE_RAMP.map((r) => r.gain).join('/')} (3–4P) · cap ${ESSENCE_CAP}`],
              ['3 · MAIN', 'Summon · Attach relic · Strike any living enemy seat'],
              ['4 · UPKEEP', 'Discard to 7 · ready your deities · pass to the next living seat'],
            ].map(([a, b], i) => (
              <g key={a} transform={`translate(16, ${48 + i * 28})`}>
                <text x="0" y="0" fontSize="10" fill="#111" fontWeight="700" style={{ fontFamily: 'monospace' }}>{a}</text>
                <text x="118" y="0" fontSize="10" fill="#555" style={{ fontFamily: 'monospace' }}>{b}</text>
              </g>
            ))}
            <text x="16" y="160" fontSize="8" fill="#999" style={{ fontFamily: 'monospace' }}>Summoning sickness · one strike per deity per turn · Pillar at 0 = that seat is eliminated · last seat standing wins</text>
          </g>

          <text x="410" y="1110" fontSize="9" fill="#aaa" textAnchor="middle" style={{ fontFamily: 'monospace' }}>print &amp; play · thedivineatlas · every number is a design choice, not mythology</text>
        </svg>
      </div>
    </div>
  );
}
