import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { loadCulture, ALL_CULTURES, entityById, artifactRelationships } from '../../lib/data';
import { TIER_LABELS } from '../../lib/types';
import { GraphViewSwitch } from '../../components/GraphViewSwitch';
import { ArtworkFigure } from '../../components/ArtworkFigure';
import { SourceFootnote } from '../../components/SourceFootnote';

export function generateStaticParams() {
  const ids: string[] = [];
  for (const c of ALL_CULTURES) for (const e of loadCulture(c).entities) ids.push(e.id);
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const e = entityById(id);
  if (!e) return { title: 'Not found' };
  return { title: e.name, description: e.description_short };
}

export default async function DeityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = entityById(id);
  if (!e) notFound();
  const d = loadCulture(e.culture);
  const artById = new Map(d.artworks.map((a) => [a.id, a]));
  const hero = (e.hero_artwork && artById.get(e.hero_artwork)) || (e.artworks?.[0] && artById.get(e.artworks[0]));
  const byId = new Map(d.entities.map((x) => [x.id, x]));
  // Resolve a relationship endpoint: entities → /deity, artifacts → /artifacts.
  const artMap = new Map(d.artifacts.map((x) => [x.id, x]));
  const resolveRel = (id: string): { name: string; href: string } => {
    const ent = byId.get(id);
    if (ent) return { name: ent.name, href: `/deity/${id}` };
    const art = artMap.get(id);
    if (art) return { name: art.name, href: `/artifacts/${art.slug}` };
    return { name: id, href: '#' };
  };

  // this entity's relationships
  const rels = d.relationships.filter((r) => r.from === e.id || r.to === e.id);
  const relGroups: { title: string; items: typeof rels }[] = [
    { title: 'Family & kinship', items: rels.filter((r) => ['PARENT_OF', 'CHILD_OF', 'SIBLING_OF'].includes(r.type)) },
    { title: 'Partners', items: rels.filter((r) => r.type === 'PARTNER_OF') },
    { title: 'Creation', items: rels.filter((r) => ['CREATED', 'CREATED_BY'].includes(r.type)) },
    { title: 'Conflict & enmity', items: rels.filter((r) => ['KILLED', 'FOUGHT', 'ENEMY_OF'].includes(r.type)) },
    { title: 'Alliances & rule', items: rels.filter((r) => ['ALLY_OF', 'RULES', 'ASSOCIATED_WITH', 'SUCCESSOR_OF'].includes(r.type)) },
    { title: 'Artifacts', items: rels.filter((r) => ['OWNS', 'FORGED', 'FOUND', 'STOLE', 'GIFTED', 'INHERITED', 'USED', 'DESTROYED', 'SEALED', 'CONTAINS', 'PROTECTS', 'UNLOCKS', 'CONTROLS', 'CREATED_BY'].includes(r.type)) },
  ];

  const myths = d.myths.filter((m) => m.participants.includes(e.id) || (e.major_myths || []).includes(m.id));

  // Artifacts this entity is woven into: owner / previous owner / related by edge.
  const entityArtifacts = d.artifacts.filter((a) => {
    if (a.owner === e.id || (a.previous_owners || []).includes(e.id)) return true;
    return artifactRelationships(a.id).some((r) => r.from === e.id || r.to === e.id);
  });

  return (
    <div data-culture={e.culture}>
      {/* hero */}
      <header style={{ padding: '56px 0 0', borderBottom: '1px solid var(--line)', background: `linear-gradient(180deg, ${d.meta.palette.surface} 0%, var(--bg-0) 100%)` }}>
        <div className="container">
          <div className="profile-grid">
            <div>
              <span className="eyebrow">{d.meta.name} · {e.classification}</span>
              <h1 className="display-xl" style={{ marginTop: 10 }}>{e.name}</h1>
              {e.native_name && <div className="native" style={{ fontSize: '1.5rem', color: 'var(--ink-1)', marginTop: 4 }}>{e.native_name}</div>}
              {e.alternative_names?.length ? (
                <div className="mono" style={{ color: 'var(--ink-2)', marginTop: 8, fontSize: '0.7rem' }}>
                  also: {e.alternative_names.join(' · ')}
                </div>
              ) : null}
              <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <span className="chip chip-accent">{e.classification}</span>
                {e.domains.map((dom) => <span key={dom} className="chip">{dom}</span>)}
                {e.evidence_status && <span className="chip" style={{ borderColor: 'var(--accent-2)', color: 'var(--accent-2)' }}>{e.evidence_status}</span>}
              </div>
              <p style={{ marginTop: 22, maxWidth: 640, color: 'var(--ink-0)', lineHeight: 1.7 }}>
                <SourceFootnote text={e.description_short} sources={d.sources} />
              </p>
            </div>
            {hero ? <ArtworkFigure art={hero} hero /> : (
              <div className="hero-art" style={{ minHeight: 460, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '6rem', color: 'var(--accent)', opacity: 0.4 }}>{e.name.slice(0, 2).toUpperCase()}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container section">
        <div className="profile-grid">
          {/* main column */}
          <div>
            {/* long description */}
            <span className="eyebrow">The account</span>
            <h2 style={{ marginTop: 8, marginBottom: 16 }}>Who they are</h2>
            <hr className="mat-band" style={{ width: 100 }} />
            <div style={{ marginTop: 18, maxWidth: 720, color: 'var(--ink-0)', lineHeight: 1.75, fontSize: '1.02rem' }}>
              <SourceFootnote text={e.description_long} sources={d.sources} />
            </div>

            {/* interesting facts */}
            {e.interesting_facts?.length ? (
              <div style={{ marginTop: 32 }}>
                <span className="eyebrow">Worth knowing</span>
                <ul style={{ marginTop: 12, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 720 }}>
                  {e.interesting_facts.map((f, i) => (
                    <li key={i} className="small" style={{ color: 'var(--ink-0)', borderLeft: '2px solid var(--accent)', paddingLeft: 12 }}>
                      <SourceFootnote text={f} sources={d.sources} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* uncertainties */}
            {e.uncertainty_notes?.length ? (
              <div style={{ marginTop: 32, maxWidth: 720 }}>
                <span className="eyebrow">Uncertainties & variants</span>
                <ul style={{ marginTop: 12, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {e.uncertainty_notes.map((f, i) => (
                    <li key={i} className="small" style={{ color: 'var(--ink-1)', borderLeft: '2px dashed var(--ink-2)', paddingLeft: 12 }}>
                      <SourceFootnote text={f} sources={d.sources} />
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* relationships, grouped */}
            <div style={{ marginTop: 40 }}>
              <span className="eyebrow">Relationships ({rels.length})</span>
              <h2 style={{ marginTop: 8, marginBottom: 16 }}>Connections</h2>
              <hr className="mat-band" style={{ width: 100 }} />
              {relGroups.filter((g) => g.items.length).map((g) => (
                <div key={g.title} style={{ marginTop: 24 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: 8, color: 'var(--ink-1)' }}>{g.title}</h3>
                  <div className="rel-list">
                    {g.items.map((r, i) => {
                      const other = r.from === e.id ? r.to : r.from;
                      const o = resolveRel(other);
                      return (
                        <div key={i} className="rel-item">
                          <span className={`rel-type conf-${r.confidence}`}>{r.type}</span>
                          <span className="rel-note">
                            {r.from === e.id ? '→' : '←'} <a href={o.href}>{o.name}</a> — {r.note}
                            <span className="mono" style={{ color: 'var(--ink-2)', marginLeft: 6, fontSize: '0.62rem' }}>{r.sources.map((s) => `[${s}]`).join(' ')}</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              {!rels.length && <p className="small faint">No typed relationships recorded for this entity.</p>}
            </div>

            {/* local graph */}
            <div style={{ marginTop: 48 }}>
              <span className="eyebrow">Local graph</span>
              <h2 style={{ marginTop: 8, marginBottom: 16 }}>Their corner of the divine world</h2>
              <hr className="mat-band" style={{ width: 100 }} />
              <div style={{ marginTop: 20 }}>
                <GraphViewSwitch data={d} centerId={e.id} />
              </div>
            </div>
          </div>

          {/* attribute rail */}
          <aside className="attribute-rail" aria-label="Attributes">
            <div className="attr-row"><div className="attr-label">Culture</div><div className="attr-value">{d.meta.name}</div></div>
            {e.domains.length ? <div className="attr-row"><div className="attr-label">Domains</div><div className="attr-value">{e.domains.join(', ')}</div></div> : null}
            {e.symbols?.length ? <div className="attr-row"><div className="attr-label">Symbols</div><div className="attr-value">{e.symbols.join(', ')}</div></div> : null}
            {e.animals?.length ? <div className="attr-row"><div className="attr-label">Animals</div><div className="attr-value">{e.animals.join(', ')}</div></div> : null}
            {e.weapons?.length ? <div className="attr-row"><div className="attr-label">Weapons</div><div className="attr-value">{e.weapons.join(', ')}</div></div> : null}
            {e.sacred_objects?.length ? <div className="attr-row"><div className="attr-label">Sacred objects</div><div className="attr-value">{e.sacred_objects.join(', ')}</div></div> : null}
            {e.associated_realms?.length ? (
              <div className="attr-row">
                <div className="attr-label">Realms</div>
                <div className="attr-value" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {(d.cosmology.realms || []).filter((r) => e.associated_realms?.includes(r.id)).map((r) => (
                    <span key={r.id} className="chip">{r.name}</span>
                  ))}
                </div>
              </div>
            ) : null}
            {e.associated_places?.length ? <div className="attr-row"><div className="attr-label">Places</div><div className="attr-value">{e.associated_places.join(', ')}</div></div> : null}
            {e.primary_sources?.length ? (
              <div className="attr-row">
                <div className="attr-label">Primary sources</div>
                <div className="attr-value" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {e.primary_sources.map((s) => (
                    <div key={s.ref} className="mono" style={{ fontSize: '0.68rem', color: 'var(--ink-1)' }}>
                      <span style={{ color: 'var(--gold)' }}>[{s.ref}]</span> {s.name}{s.url ? ' ↗' : ''}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        {/* myths involving this entity */}
        {myths.length ? (
          <section style={{ marginTop: 64 }}>
            <span className="eyebrow">Myths featuring {e.name}</span>
            <h2 style={{ marginTop: 8, marginBottom: 24 }}>{myths.length} {myths.length === 1 ? 'story' : 'stories'}</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {myths.map((m) => (
                <div key={m.id} className="card" style={{ display: 'block', padding: 20 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>
                    <a href={`/culture/${d.culture}#myth-${m.id}`} style={{ color: 'var(--ink-0)', textDecoration: 'none' }}>{m.title}</a>
                  </h3>
                  <p className="small muted" style={{ margin: '8px 0 0' }}><SourceFootnote text={m.summary} sources={d.sources} /></p>
                  <p style={{ margin: '10px 0 0' }} className="mono">
                    <a href={`/myths/${m.id}`} style={{ color: 'var(--accent)', fontSize: '0.62rem', letterSpacing: '0.1em', textDecoration: 'none' }}>
                      READ THE STORY →
                    </a>
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {/* artifacts associated with this entity */}
        {entityArtifacts.length ? (
          <section style={{ marginTop: 64 }}>
            <span className="eyebrow">Artifacts of {e.name}</span>
            <h2 style={{ marginTop: 8, marginBottom: 8 }}>Objects they wielded, forged, or were bound to</h2>
            <p className="mono" style={{ color: 'var(--ink-2)', fontSize: '0.66rem', marginBottom: 24, letterSpacing: '0.06em' }}>
              INTERPRETIVE CLASSIFICATION · FULL PROFILE IN THE DIVINE VAULT
            </p>
            <div className="grid-3">
              {entityArtifacts.map((a) => (
                <Link key={a.id} href={`/artifacts/${a.slug}`} className="card" style={{ display: 'block', padding: 14 }}>
                  <div style={{ width: '100%', aspectRatio: '4/3', overflow: 'hidden', borderRadius: 3, background: 'var(--surface)' }}>
                    {a.artwork.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.artwork.image_url} alt={a.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '2.4rem', color: 'var(--accent)' }}>{a.name.charAt(0)}</div>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginTop: 10, fontWeight: 600 }}>{a.name}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                    <span className="chip chip-accent" style={{ marginTop: 0 }}>{a.rank} · {TIER_LABELS[a.tier]}</span>
                    <span className="chip" style={{ marginTop: 0 }}>{a.owner === e.id ? 'Wielded by ' + e.name : 'Associated'}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* artworks of this entity */}
        {e.artworks?.length ? (
          <section style={{ marginTop: 64 }}>
            <span className="eyebrow">Artworks</span>
            <h2 style={{ marginTop: 8, marginBottom: 24 }}>Depictions</h2>
            <div className="grid-3">
              {e.artworks.map((aid) => {
                const a = artById.get(aid);
                return a ? (
                  <figure key={a.id} style={{ margin: 0 }}>
                    <ArtworkFigure art={a} />
                    <figcaption className="small muted" style={{ marginTop: 8 }}>{a.title} · {a.date}</figcaption>
                  </figure>
                ) : null;
              })}
            </div>
          </section>
        ) : null}

        <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid var(--line)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href={`/culture/${d.culture}`} className="btn">← {d.meta.name}</Link>
          <Link href="/" className="btn">All galleries</Link>
        </div>
      </div>
    </div>
  );
}
