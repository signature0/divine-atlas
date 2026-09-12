import Link from 'next/link';
import { ALL_CULTURES, loadCulture } from '../lib/data';

export function TopNav() {
  const active = ALL_CULTURES.map((c) => loadCulture(c).meta);
  return (
    <nav className="topnav" aria-label="Primary">
      <div className="container inner">
        <Link href="/" className="brand" aria-label="The Divine Atlas — home">
          The Divine Atlas <span className="star">★</span>
        </Link>
        <div className="links">
          {active.map((c) => (
            <Link key={c.id} href={`/culture/${c.id}`}>{c.name.replace(' Mythology', '').replace('Ancient ', '').replace(' Religion', '')}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
