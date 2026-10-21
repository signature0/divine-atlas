// Tag helpers shared by the card overlay chips and the /cards tag filter.
// Pure client-safe functions: no fs, no window.
export function tagSlug(value: string): string {
  return (value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function tagHref(value: string): string {
  return `/cards?tag=${encodeURIComponent(tagSlug(value))}`;
}

export function cardTagSlugs(card: {
  domains?: string[];
  symbols?: string[];
  weapons?: string[];
  sacred_objects?: string[];
}): string[] {
  return [
    ...(card.domains || []),
    ...(card.symbols || []),
    ...(card.weapons || []),
    ...(card.sacred_objects || []),
  ].map(tagSlug).filter(Boolean);
}
