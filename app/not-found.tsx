import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container section" style={{ paddingTop: 120, textAlign: 'center' }}>
      <span className="eyebrow">404</span>
      <h1 className="display-l" style={{ marginTop: 12 }}>This deity is not in the Atlas</h1>
      <p className="muted" style={{ marginTop: 16 }}>The path you followed does not exist. Perhaps it belongs to a culture still to come.</p>
      <div style={{ marginTop: 32 }}>
        <Link href="/" className="btn">← Return to the galleries</Link>
      </div>
    </div>
  );
}
