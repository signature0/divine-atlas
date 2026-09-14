// Artwork figure with lazy loading, explicit aspect, and always-on attribution.
// Plain <img> (not next/image): the remote CDNs (Met, Wikimedia) are slow via the
// Next optimizer on this box (server-side fetch timeouts); browsers load them fine
// directly. All URLs are verified open-license and listed in data/<culture>/artworks.json.
import { Artwork } from '../lib/types';

export function ArtworkFigure({ art, hero = false }: { art: Artwork; hero?: boolean }) {
  if (!art.image_url) {
    // no direct image (source page only) — show an archival plate
    return (
      <figure className="hero-art" style={{ minHeight: hero ? 320 : 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 20, color: 'var(--ink-1)' }}>
          <div className="mono" style={{ color: 'var(--accent-text)', marginBottom: 8 }}>{art.license}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>{art.title}</div>
          <div className="small faint" style={{ marginTop: 6 }}>
            {art.museum} · <a href={art.source_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-text)' }}>view at source ↗</a>
          </div>
        </div>
      </figure>
    );
  }
  return (
    <figure className="hero-art">
      <img
        src={art.image_url}
        alt={art.alt || `${art.subject} — ${art.title}`}
        width={hero ? 1600 : 800}
        height={hero ? 1000 : 600}
        style={{ width: '100%', height: hero ? 460 : 280, objectFit: 'cover', display: 'block' }}
        className={hero ? 'kenburns' : undefined}
        loading={hero ? 'eager' : 'lazy'}
        decoding="async"
      />
      <figcaption className="caption">
        {art.title} · {art.artist} · {art.date} · {art.museum} · {art.license}
      </figcaption>
    </figure>
  );
}
