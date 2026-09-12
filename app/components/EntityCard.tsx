import Link from 'next/link';
import { Entity, Artwork } from '../lib/types';

export function EntityCard({ entity, art }: { entity: Entity; art?: Artwork }) {
  const thumb = art?.image_url;
  return (
    <Link href={`/deity/${entity.id}`} className="card entity-card" style={{ display: 'block' }}>
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="thumb" src={thumb} alt={art?.alt || entity.name} loading="lazy" decoding="async" />
      ) : (
        <div className="seal" aria-hidden>{entity.name.slice(0, 2).toUpperCase()}</div>
      )}
      <div className="name">{entity.name}</div>
      {entity.native_name && <div className="native-name native">{entity.native_name}</div>}
      <div>
        <span className="chip chip-accent">{entity.classification}</span>
        {entity.domains.slice(0, 2).map((d) => <span key={d} className="chip">{d}</span>)}
      </div>
    </Link>
  );
}
