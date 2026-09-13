import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ALL_CULTURES, loadCulture } from '../../lib/data';
import { allDomainSlugs, domainFromSlug } from '../../lib/domain';
import { EntityCard } from '../../components/EntityCard';

// Route param is the SLUG (BUG-001): raw domain strings contain spaces/parens
// that prod static-file lookup can't match. generateStaticParams emits slugs;
// the component resolves the exact raw domain back from the slug.
export function generateStaticParams() {
  return allDomainSlugs().map((slug) => ({ domain: slug }));
}

export default async function DomainPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain: slug } = await params;
  const domain = domainFromSlug(slug);
  if (!domain) notFound();
  const matches: { e: ReturnType<typeof loadCulture>['entities'][number]; art?: ReturnType<typeof loadCulture>['artworks'][number] }[] = [];
  for (const c of ALL_CULTURES) {
    const d = loadCulture(c);
    for (const e of d.entities) {
      if (e.domains.includes(domain)) {
        const art = d.artworks.find((a) => e.artworks?.includes(a.id) || e.hero_artwork === a.id);
        matches.push({ e, art });
      }
    }
  }
  if (!matches.length) notFound();

  return (
    <section className="section" style={{ paddingTop: 64 }}>
      <div className="container">
        <span className="eyebrow">Divine archetype</span>
        <h1 className="display-l" style={{ marginTop: 10, textTransform: 'capitalize' }}>{domain}</h1>
        <hr className="mat-band" style={{ width: 120 }} />
        <p className="muted small" style={{ marginTop: 16, maxWidth: 640 }}>
          {matches.length} deities across {new Set(matches.map((m) => m.e.culture)).size} cultures bear the domain of <strong style={{ color: 'var(--ink-0)' }}>{domain}</strong>.
          This is the same data the comparator uses.
        </p>
        <div className="grid-3" style={{ marginTop: 36 }}>
          {matches.map(({ e, art }) => <EntityCard key={e.id} entity={e} art={art} />)}
        </div>
        <div style={{ marginTop: 32 }}>
          <Link href="/" className="btn">← All galleries</Link>
        </div>
      </div>
    </section>
  );
}
