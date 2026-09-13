// THE DIVINE ATLAS — domain slug util (shared by /domain/[domain] + homepage chips).
//
// The /domain/[domain] route param is a SLUG (lowercase, hyphenated ASCII),
// never the raw domain string: raw strings contain spaces / parens / apostrophes
// that break prod static-file lookup (BUG-001). Slugs are 1:1 with the raw
// domain set (verified over all 320 domains); domainFromSlug() resolves back to
// the exact raw string so matching stays `e.domains.includes(raw)` as before.
// NOTE: this must stay in sync with the inline slug in scripts/qa-sweep.mjs.
import { ALL_CULTURES, loadCulture } from './data';

/** Slug = lowercase, trim, runs of non-alphanumeric → '-', drop leading/trailing '-'. */
export function domainSlug(domain: string): string {
  return domain.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

let _domains: string[] | null = null;
/** All raw domain strings across every culture (deduped, sorted — stable order). */
export function allDomains(): string[] {
  if (_domains) return _domains;
  const set = new Set<string>();
  for (const c of ALL_CULTURES) for (const e of loadCulture(c).entities) e.domains.forEach((d) => set.add(d));
  _domains = [...set].sort();
  return _domains;
}

let _bySlug: Map<string, string> | null = null;
/** Resolve the raw domain string from its slug (undefined if the slug is unknown). */
export function domainFromSlug(slug: string): string | undefined {
  if (!_bySlug) {
    _bySlug = new Map();
    for (const raw of allDomains()) {
      const s = domainSlug(raw);
      if (_bySlug.has(s)) {
        // Slugs must be 1:1 with the raw set; a collision means the routing
        // scheme is ambiguous — fail loudly at build time instead of serving a
        // wrong page silently.
        console.warn(`[domain] SLUG COLLISION: "${_bySlug.get(s)}" and "${raw}" both slugify to "${s}"`);
        continue;
      }
      _bySlug.set(s, raw);
    }
  }
  return _bySlug.get(slug);
}

/** All domain slugs, 1:1 with the raw domain set (used by generateStaticParams). */
export function allDomainSlugs(): string[] {
  return allDomains().map(domainSlug);
}
