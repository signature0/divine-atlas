import Link from 'next/link';

// DES-008 — the approved 404 concept (INFORMATION-ARCHITECTURE.md): "a lost tablet…
// this page is in the Duat". In-world copy only (no dev artifacts), a cracked clay
// tablet with an ankh as the motif, ochre undertone. All colors via tokens.
export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound-glow" aria-hidden />
      {/* cracked tablet with ankh + inscription — decorative, hidden from AT */}
      <svg className="notfound-tablet" viewBox="0 0 120 150" fill="none" aria-hidden="true" focusable="false">
        <rect className="t-edge" x="14" y="10" width="92" height="130" rx="10" />
        <circle className="t-ankh" cx="60" cy="36" r="10" />
        <line className="t-ankh" x1="60" y1="46" x2="60" y2="74" />
        <line className="t-ankh" x1="46" y1="56" x2="74" y2="56" />
        <g>
          <line className="t-scribe" x1="30" y1="90" x2="46" y2="90" />
          <line className="t-scribe" x1="52" y1="90" x2="72" y2="90" />
          <line className="t-scribe" x1="78" y1="90" x2="90" y2="90" />
          <line className="t-scribe" x1="30" y1="102" x2="58" y2="102" />
          <line className="t-scribe" x1="64" y1="102" x2="84" y2="102" />
          <line className="t-scribe" x1="30" y1="114" x2="44" y2="114" />
          <line className="t-scribe" x1="50" y1="114" x2="76" y2="114" />
          <line className="t-scribe" x1="58" y1="126" x2="80" y2="126" />
        </g>
        <polyline className="t-crack" points="99,134 86,116 92,102 80,86" />
      </svg>
      <span className="eyebrow">Lost in the Duat — 404</span>
      <h1 className="display-l" style={{ marginTop: 14 }}>This tablet is in the Duat.</h1>
      <p className="muted" style={{ marginTop: 16, maxWidth: 460 }}>
        The path you followed was never inscribed. It lies in the black sands of the underworld,
        and no scribe of the night keeps its record.
      </p>
      <div style={{ marginTop: 32 }}>
        <Link href="/" className="btn">← Return to the galleries</Link>
      </div>
      <p className="mono faint" style={{ marginTop: 20 }}>Or search the codex — ⌘K</p>
    </div>
  );
}
