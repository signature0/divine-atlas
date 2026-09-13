import Link from 'next/link';
import { ALL_CULTURES, loadCulture } from '../lib/data';
import { SearchTrigger } from './SearchTrigger';

export function TopNav() {
  const active = ALL_CULTURES.map((c) => loadCulture(c).meta);
  return (
    <nav className="topnav" aria-label="Primary">
      <div className="container inner">
        <Link href="/" className="brand" aria-label="The Divine Atlas — home">
          The Divine Atlas <span className="star">★</span>
        </Link>
        <SearchTrigger />
        <div className="links">
          <Link href="/artifacts">Vault</Link>
          <Link href="/graph">Graph</Link>
          {/* DES-003: IA primary links. Map/Timeline stay out — still BACKLOG (TASK-003/006); no dead labels. */}
          <Link href="/stories">Stories</Link>
          <Link href="/compare">Compare</Link>
          {active.map((c) => (
            <Link key={c.id} href={`/culture/${c.id}`}>{c.name.replace(' Mythology', '').replace('Ancient ', '').replace(' Religion', '')}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
