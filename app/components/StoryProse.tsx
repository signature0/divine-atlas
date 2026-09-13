// StoryProse — narrative prose with two inline annotation layers:
//   1. entity names rendered as chips that link to /deity/[id]
//   2. [S#] citation chips that resolve to the culture's bibliography (SourceFootnote)
//
// Matching is per culture, case-sensitive and boundary-aware: a name only chips
// when it is not embedded in a longer word and is not the tail of a hyphenated
// compound (e.g. "Orochi" inside "Yamata-no-Orochi"). Longest names are tried
// first so "Horus the Elder" wins over "Horus". Primary entity names plus a
// hyphenated variant ("Yamata no Orochi" → "Yamata-no-Orochi") are matched;
// free-text alternative_names (e.g. "the Sun Goddess") are deliberately NOT
// matched, since they read as description, not as a name.
import Link from 'next/link';
import { Fragment } from 'react';
import { loadCulture } from '../lib/data';
import { SourceFootnote } from './SourceFootnote';
import type { SourceRef } from '../lib/types';

type Matcher = { re: RegExp; byName: Map<string, string> } | null;
const cache = new Map<string, Matcher>();

function matcherFor(culture: string): Matcher {
  const hit = cache.get(culture);
  if (hit !== undefined) return hit;
  let m: Matcher = null;
  try {
    const d = loadCulture(culture);
    const names: { name: string; id: string }[] = [];
    for (const e of d.entities) {
      if (e.name && e.name.trim()) {
        names.push({ name: e.name, id: e.id });
        const hyphen = e.name.replace(/ +/g, '-');
        if (hyphen !== e.name) names.push({ name: hyphen, id: e.id });
      }
    }
    if (names.length) {
      names.sort((a, b) => b.name.length - a.name.length);
      const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      m = {
        re: new RegExp(
          `(?<![\\p{L}\\p{N}-])(${names.map((n) => esc(n.name)).join('|')})(?![\\p{L}\\p{N}])`,
          'gu'
        ),
        byName: new Map(names.map((n) => [n.name, n.id])),
      };
    }
  } catch {
    m = null;
  }
  cache.set(culture, m);
  return m;
}

export function StoryProse({
  text,
  culture,
  sources,
}: {
  text: string;
  culture: string;
  sources: SourceRef[];
}) {
  const m = matcherFor(culture);
  if (!m || !text) return <SourceFootnote text={text || ''} sources={sources} />;
  // split() with one capturing group returns [text, name, text, name, ...]
  const parts = text.split(m.re);
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2 === 1) {
          const id = m.byName.get(p);
          return id ? (
            <Link key={i} href={`/deity/${id}`} className="entity-chip">
              {p}
            </Link>
          ) : (
            <Fragment key={i}>{p}</Fragment>
          );
        }
        return p ? (
          <Fragment key={i}>
            <SourceFootnote text={p} sources={sources} />
          </Fragment>
        ) : null;
      })}
    </>
  );
}
