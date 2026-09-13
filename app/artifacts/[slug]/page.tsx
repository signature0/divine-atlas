import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  loadCulture, ALL_CULTURES, artifactBySlug, entityById,
  artifactsForMyth, artifactRelationships,
} from '../../lib/data';
import {
  TIER_LABELS, CATEGORY_LABELS, STATUS_LABELS, CONFIDENCE_LABELS, CONFIDENCE_NOTES,
  CULTURE_NAMES,
} from '../../lib/types';
import { SourceFootnote } from '../../components/SourceFootnote';

export function generateStaticParams() {
  const slugs: string[] = [];
  for (const c of ALL_CULTURES) for (const a of loadCulture(c).artifacts) slugs.push(a.slug);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = artifactBySlug(slug);
  if (!a) return { title: 'Not found' };
  return { title: `${a.name} — The Divine Vault`, description: a.description_short };
}

const CERT_LABELS: Record<string, string> = {
  attested: 'Attested', likely: 'Likely', later_tradition: 'Later tradition',
  modern_interpretation: 'Modern interpretation', uncertain: 'Uncertain',
};

export default async function ArtifactPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = artifactBySlug(slug);
  if (!a) notFound();
  const d = loadCulture(a.culture);
  const rels = artifactRelationships(a.id);
  const cultureLabel = CULTURE_NAMES[a.culture] || a.culture;

  return (
    <div data-culture={a.culture}>
      <header style={{ padding: '56px 0 24px', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <nav className="mono" style={{ fontSize: '0.66rem', color: 'var(--ink-2)', marginBottom: 16 }}>
            <Link href="/artifacts">The Divine Vault</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <Link href={`/culture/${a.culture}`}>{cultureLabel}</Link>
            <span style={{ margin: '0 8px' }}>/</span>
            <span style={{ color: 'var(--ink-1)' }}>{a.name}</span>
          </nav>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexWrap: 'wrap' }}>
            <h1 className="display-l" style={{ marginTop: 0 }}>{a.name}</h1>
            {a.native_name && a.native_name !== a.name && (
              <span className="native" style={{ fontSize: '1.3rem', color: 'var(--ink-2)' }}>{a.native_name}</span>
            )}
          </div>
          {(a.alternative_names?.length ?? 0) > 0 && (
            <p className="mono" style={{ color: 'var(--ink-2)', fontSize: '0.72rem', marginTop: 8 }}>
              also known as {a.alternative_names.join(' · ')}
            </p>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            <span className="chip chip-accent">{CATEGORY_LABELS[a.category]} · {a.artifact_type}</span>
            <span className="chip">{cultureLabel}</span>
            <span className="chip">Atlas class — {TIER_LABELS[a.tier]} ({a.rank})</span>
            <span className="chip">Status: {STATUS_LABELS[a.current_status]}</span>
            <span className="chip">Sources: {CONFIDENCE_LABELS[a.source_confidence]} confidence</span>
          </div>
        </div>
      </header>

      <div className="container section">
        <div className="art-detail">
          {/* MAIN */}
          <div>
            {/* Hero image with provenance */}
            <figure className="art-hero" style={{ margin: '0 0 40px' }}>
              {a.artwork.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.artwork.image_url} alt={a.artwork.title} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontFamily: 'var(--font-display)', fontSize: '4rem' }}>
                  {a.name.charAt(0)}
                </div>
              )}
              <span className="imgtype">{a.artwork.image_type}</span>
              <figcaption className="cap">
                <span className="lbl">You are looking at</span>
                {a.artwork.depicts}
                <span style={{ display: 'block', marginTop: 4, color: 'var(--ink-2)' }}>
                  {a.artwork.title}{a.artwork.artist ? ` — ${a.artwork.artist}` : ''} · {a.artwork.institution} · {a.artwork.date} · {a.artwork.license} · {a.artwork.copyright_status}
                </span>
              </figcaption>
            </figure>

            {/* Overview */}
            <Section title="Overview">
              <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--ink-1)' }}>
                <SourceFootnote text={a.description_long} sources={d.sources} />
              </p>
              {a.creator_name && (
                <p className="mono" style={{ fontSize: '0.72rem', color: 'var(--ink-2)', marginTop: 12 }}>
                  Attributed maker — {a.creator_name}
                </p>
              )}
            </Section>

            {/* Creation / origin */}
            {(a.creation_story || a.origin_story) && (
              <Section title="Creation &amp; Origin">
                {a.creation_story && (
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--ink-1)' }}>
                    <SourceFootnote text={a.creation_story} sources={d.sources} />
                  </p>
                )}
                {a.origin_story && (
                  <p style={{ fontSize: '0.95rem', lineHeight: 1.7, color: 'var(--ink-1)', marginTop: a.creation_story ? 12 : 0 }}>
                    <SourceFootnote text={a.origin_story} sources={d.sources} />
                  </p>
                )}
              </Section>
            )}

            {/* Power profile */}
            <Section title="Atlas Power Profile" disc="Interpretive, 0–10. An Atlas editorial reading — not a historical or canonical ranking.">
              <div className="power-profile">
                {a.power_profile.map((p) => (
                  <div className="power-row" key={p.attribute}>
                    <span className="power-attr">{p.attribute}</span>
                    <span className="power-val">{p.value}</span>
                    <div className="power-bar" role="img" aria-label={`${p.attribute} ${p.value} of 10`}>
                      <div className="power-fill" style={{ width: `${p.value * 10}%` }} />
                    </div>
                    <p className="power-exp">{p.explanation}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* Abilities */}
            <Section title="Named Abilities" disc="Each ability carries a certainty level — how firmly the sources support it.">
              <div className="ability-list">
                {a.abilities.map((ab) => (
                  <div className="ability-card" key={ab.name}>
                    <div className="ability-name">{ab.name}</div>
                    <span className={`ability-cert cert-${ab.certainty}`}>{CERT_LABELS[ab.certainty] || ab.certainty}</span>
                    <p className="ability-desc">{ab.description}</p>
                    {ab.source && <p className="ability-src">Source — {ab.source}</p>}
                  </div>
                ))}
              </div>
            </Section>

            {/* Limitations */}
            {(a.limitations?.length ?? 0) > 0 && (
              <Section title="Limitations &amp; Constraints">
                <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--ink-1)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {a.limitations!.map((l, i) => <li key={i}><SourceFootnote text={l} sources={d.sources} /></li>)}
                </ul>
              </Section>
            )}

            {/* Facts */}
            {(a.interesting_facts?.length ?? 0) > 0 && (
              <Section title="Notable Facts">
                <ul style={{ margin: 0, paddingLeft: 18, color: 'var(--ink-1)', fontSize: '0.9rem', lineHeight: 1.7 }}>
                  {a.interesting_facts!.map((f, i) => <li key={i}><SourceFootnote text={f} sources={d.sources} /></li>)}
                </ul>
              </Section>
            )}

            {/* Uncertainty */}
            {(a.uncertainty_notes?.length ?? 0) > 0 && (
              <Section title="Where the record is thin">
                <div className="framing" style={{ marginTop: 0 }}>
                  <span className="eyebrow">Interpretation note</span>
                  <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--ink-1)', fontSize: '0.88rem', lineHeight: 1.7 }}>
                    {a.uncertainty_notes!.map((u, i) => <li key={i}><SourceFootnote text={u} sources={d.sources} /></li>)}
                  </ul>
                </div>
              </Section>
            )}

            {/* Cross-links: gods & myths this artifact is woven into */}
            <Section title="Woven into the Atlas" disc="Every link here is a real graph relationship — the artifact is part of the same mythology, not a side table.">
              <XLinks
                deityIds={uniqueIds([...(a.associated_deities || []), ...(a.associated_heroes || []), ...(a.associated_monsters || []), ...(a.previous_owners || [])])}
                owner={a.owner ? { id: a.owner, name: a.owner_name || null } : null}
                monsterIds={a.associated_monsters || []}
                mythIds={a.major_myths || []}
                rels={rels}
              />
            </Section>
          </div>

          {/* RAIL */}
          <aside className="art-rail">
            <div className="class-block">
              <div className="mono" style={{ fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-2)' }}>Atlas Classification</div>
              <div className="class-tier">{TIER_LABELS[a.tier]}</div>
              <div className="class-rank">Compact rank — {a.rank}</div>
              {a.tier_rationale && (
                <p className="class-disc">{a.tier_rationale}</p>
              )}
              <div className="class-disc" style={{ marginTop: 12 }}>
                Rating is editorial, produced per the documented Atlas methodology — never a claim about the sources.
              </div>
            </div>

            <div className="class-block">
              <div className="mono" style={{ fontSize: '0.58rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-2)', marginBottom: 8 }}>Source Confidence</div>
              <div style={{ fontSize: '1.1rem', fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--accent)' }}>{CONFIDENCE_LABELS[a.source_confidence]} confidence</div>
              <p style={{ fontSize: '0.78rem', color: 'var(--ink-2)', marginTop: 6, lineHeight: 1.5 }}>{CONFIDENCE_NOTES[a.source_confidence]}</p>
              {a.confidence_note && (
                <p style={{ fontSize: '0.78rem', color: 'var(--ink-1)', marginTop: 8, lineHeight: 1.55, borderTop: '1px solid var(--line)', paddingTop: 8 }}>
                  <SourceFootnote text={a.confidence_note} sources={d.sources} />
                </p>
              )}
            </div>

            <div className="class-block" style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              <FactRow k="Culture" v={cultureLabel} />
              {a.owner_name && <FactRow k="Wielder / Owner" v={a.owner_name} />}
              {a.material && <FactRow k="Material" v={a.material} />}
              {a.appearance && <FactRow k="Appearance" v={a.appearance} />}
              {(a.symbols?.length ?? 0) > 0 && <FactRow k="Symbols" v={a.symbols!.join(' · ')} />}
              <FactRow k="Current status" v={STATUS_LABELS[a.current_status]} />
              {a.status_note && <FactRow k="Status note" v={a.status_note} />}
              {(a.domains?.length ?? 0) > 0 && <FactRow k="Domains" v={a.domains!.join(' · ')} />}
              {(a.associated_realms?.length ?? 0) > 0 && <FactRow k="Realms" v={a.associated_realms!.join(' · ')} />}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Section({ title, disc, children }: { title: string; disc?: string; children: ReactNode }) {
  return (
    <section style={{ marginBottom: 44 }}>
      <h2 style={{ fontSize: '1.4rem', marginBottom: 4 }}>{title}</h2>
      {disc && <p className="mono" style={{ fontSize: '0.62rem', letterSpacing: '0.08em', color: 'var(--ink-2)', margin: '0 0 16px' }}>{disc}</p>}
      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 18 }}>{children}</div>
    </section>
  );
}

function FactRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="art-fact">
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}

function uniqueIds(ids: (string | undefined)[]): string[] {
  return [...new Set(ids.filter(Boolean) as string[])];
}

function XLinks({ deityIds, owner, monsterIds, mythIds, rels }: {
  deityIds: string[];
  owner: { id: string; name: string | null } | null;
  monsterIds: string[];
  mythIds: string[];
  rels: { from: string; to: string; type: string; note: string; confidence: string }[];
}) {
  const seen = new Set<string>();
  const persons: { id: string; name: string; kind: string; rel?: string }[] = [];
  const push = (id: string | undefined, kind: string, rel?: string) => {
    if (!id || seen.has(id)) return;
    const e = entityById(id);
    if (!e) return;
    seen.add(id);
    persons.push({ id, name: e.name, kind, rel });
  };
  if (owner) push(owner.id, 'owner', 'wields / owns');
  for (const id of deityIds) push(id, 'associated');
  for (const id of monsterIds) push(id, 'foe');
  for (const r of rels) {
    for (const end of [r.from, r.to]) {
      if (entityById(end)) push(end, 'linked', r.type.replace('_', ' ').toLowerCase());
    }
  }
  return (
    <div className="xlinks">
      {persons.map((p) => (
        <Link key={p.id} href={`/deity/${p.id}`} className="xlink">
          <span className="kind">{p.rel || p.kind}</span> {p.name}
        </Link>
      ))}
      {mythIds.map((m) => {
        // Myth ids carry a culture PREFIX (gre-, nor-, …) that differs from the
        // directory key (greek, norse, …) — resolve by scanning all cultures.
        let myth = null;
        for (const c of ALL_CULTURES) {
          const hit = loadCulture(c).myths.find((x) => x.id === m);
          if (hit) { myth = hit; break; }
        }
        if (!myth) return null;
        const mc = myth.culture;
        return (
          <Link key={m} href={`/culture/${mc}#myth-${myth.id}`} className="xlink">
            <span className="kind">myth</span> {myth.title}
          </Link>
        );
      })}
      {persons.length === 0 && mythIds.length === 0 && (
        <span className="muted small">No direct graph links recorded for this artifact yet.</span>
      )}
    </div>
  );
}
