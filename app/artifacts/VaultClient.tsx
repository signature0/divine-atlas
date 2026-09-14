'use client';
import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { VaultItem } from './page';

type Props = {
  items: VaultItem[];
  cultures: string[];
  categories: string[];
  tiers: string[];
  owners: string[];
};

const CULTURE_LABELS: Record<string, string> = {
  japanese: 'Japanese', greek: 'Greek', norse: 'Norse',
  egyptian: 'Egyptian', slavic: 'Slavic', mesopotamian: 'Mesopotamian',
};

export function VaultClient({ items, cultures, categories, tiers, owners }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  // ---- filter state, seeded from the URL (shareable) ----
  const [culture, setCulture] = useState(sp.get('culture') || 'all');
  const [category, setCategory] = useState(sp.get('category') || 'all');
  const [tier, setTier] = useState(sp.get('tier') || 'all');
  const [owner, setOwner] = useState(sp.get('owner') || 'all');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState(sp.get('sort') || 'rank');

  // push filter state to the URL (replace, no history spam)
  useEffect(() => {
    const p = new URLSearchParams();
    if (culture !== 'all') p.set('culture', culture);
    if (category !== 'all') p.set('category', category);
    if (tier !== 'all') p.set('tier', tier);
    if (owner !== 'all') p.set('owner', owner);
    if (sort !== 'rank') p.set('sort', sort);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [culture, category, tier, owner, sort, pathname, router]);

  const filtered = useMemo(() => {
    const needle = q.toLowerCase().trim();
    const hay = (i: VaultItem) =>
      [i.name, i.nativeName, ...i.altNames, i.artifactType, i.categoryLabel,
        i.ownerName, i.creatorName, ...i.domains, i.culture, i.tierLabel, i.rank]
        .filter(Boolean).join(' ').toLowerCase();
    let out = items.filter((i) =>
      (culture === 'all' || i.culture === culture) &&
      (category === 'all' || i.category === category) &&
      (tier === 'all' || i.tier === tier) &&
      (owner === 'all' || i.ownerName === owner) &&
      (!needle || hay(i).includes(needle))
    );
    out = [...out].sort((a, b) => {
      switch (sort) {
        case 'name': return a.name.localeCompare(b.name);
        case 'culture': return a.culture.localeCompare(b.culture) || a.name.localeCompare(b.name);
        case 'confidence': return b.sourceConfidence.localeCompare(a.sourceConfidence);
        case 'tier': return b.tierOrder - a.tierOrder || a.name.localeCompare(b.name);
        case 'rank':
        default:
          return b.rankOrder - a.rankOrder || b.tierOrder - a.tierOrder || a.name.localeCompare(b.name);
      }
    });
    return out;
  }, [items, culture, category, tier, owner, q, sort]);

  const hasFilters = culture !== 'all' || category !== 'all' || tier !== 'all' || owner !== 'all' || q;
  const clearAll = () => { setCulture('all'); setCategory('all'); setTier('all'); setOwner('all'); setQ(''); setSort('rank'); };

  return (
    <div className="vault">
      {/* Search */}
      <div className="vault-search">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the vault — hammer, sword, mirror, Thor, thunder, protection…"
          aria-label="Search artifacts"
        />
        <span className="vault-count">{filtered.length} of {items.length} relics</span>
      </div>

      {/* Filter bars */}
      <div className="vault-filters">
        <FilterRow label="Tradition" value={culture} onChange={setCulture}
          options={[[ 'all', 'All' as string] as [string, string], ...cultures.map((c) => [c, CULTURE_LABELS[c] || c] as [string, string])]} />
        <FilterRow label="Object type" value={category} onChange={setCategory}
          options={[['all', 'All'] as [string, string], ...categories.map((c) => [c, categoryLabel(c)] as [string, string])]} />
        <FilterRow label="Atlas class" value={tier} onChange={setTier}
          options={[['all', 'All'] as [string, string], ...tiers.map((t) => [t, tierLabel(t)] as [string, string])]} />
        <FilterRow label="Owner" value={owner} onChange={setOwner}
          options={[['all', 'All'] as [string, string], ...owners.map((o) => [o, o] as [string, string])]} />
      </div>

      {/* Sort + clear */}
      <div className="vault-toolbar">
        <label className="vault-sort">
          Sort
          <select className="select-ctl" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort artifacts">
            <option value="rank">Atlas rank</option>
            <option value="tier">Atlas class</option>
            <option value="name">Name A–Z</option>
            <option value="culture">Tradition</option>
            <option value="confidence">Source confidence</option>
          </select>
        </label>
        {hasFilters && (
          <button className="chip-btn" onClick={clearAll}>Clear filters ✕</button>
        )}
        {/* DES-010: interpretive disclaimer relocated from the masthead into the filter row */}
        <span className="vault-note">Atlas classifications and power profiles are interpretive — read, not historical fact.</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="vault-empty">
          No relics match. <button className="chip-btn" onClick={clearAll}>Clear filters</button>
        </div>
      ) : (
        <div className="vault-grid">
          {filtered.map((i) => (
            <ArtifactCard key={i.id} item={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function categoryLabel(c: string): string {
  const m: Record<string, string> = {
    weapon: 'Weapon', armor: 'Armor', jewelry: 'Jewelry', clothing: 'Clothing',
    sacred_object: 'Sacred Object', tool: 'Tool', regalia: 'Regalia', vehicle: 'Vehicle',
    vessel: 'Vessel', instrument: 'Musical Instrument', magical_object: 'Magical Object',
    book: 'Book', stone: 'Sacred Stone', other: 'Object',
  };
  return m[c] || c;
}
function tierLabel(t: string): string {
  const m: Record<string, string> = {
    minor: 'Minor', sacred: 'Sacred', legendary: 'Legendary',
    divine: 'Divine', cosmic: 'Cosmic', primordial: 'Primordial',
  };
  return m[t] || t;
}

function FilterRow({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="vault-frow">
      <span className="vault-flabel">{label}</span>
      <div className="vault-chips">
        {options.map(([val, lab]) => (
          <button
            key={val}
            className={value === val ? 'chip-btn active' : 'chip-btn'}
            onClick={() => onChange(val)}
          >
            {lab}
          </button>
        ))}
      </div>
    </div>
  );
}

function ArtifactCard({ item: i }: { item: VaultItem }) {
  // DES-012: when a remote image fails to load, the letter-seal must render —
  // no card may show a broken image. Two paths, because error events that fire
  // BEFORE React hydration (instant failures / aborted loads) never reach onError:
  //  1) onError — catches failures after hydration;
  //  2) mount-time check — an <img> already in the error state (complete &&
  //     naturalWidth === 0) is swapped immediately. (Verified: without (2),
  //     12/19 aborted images stayed broken; with it, all 19 render seals.)
  const [imgBroken, setImgBroken] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setImgBroken(true);
  }, []);
  return (
    <Link href={`/artifacts/${i.slug}`} className="vault-card" data-culture={i.culture}>
      <div className="vault-card-media">
        {i.imageURL && !imgBroken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img ref={imgRef} src={i.imageURL} alt={i.name} loading="lazy" onError={() => setImgBroken(true)} />
        ) : (
          <div className="vault-card-seal">{i.name.charAt(0)}</div>
        )}
        <span className="vault-card-rank">{i.rank}</span>
        <span className="vault-card-culture">{CULTURE_LABELS[i.culture] || i.culture}</span>
        {/* provenance label — always state what the image is */}
        <span className="vault-card-imgtype">{i.imageType.toLowerCase()}</span>
      </div>
      <div className="vault-card-body">
        <div className="vault-card-top">
          <h3 className="vault-card-name">{i.name}</h3>
          {i.nativeName && i.nativeName !== i.name && (
            <span className="vault-card-native">{i.nativeName}</span>
          )}
        </div>
        <div className="vault-card-meta">
          <span className="chip chip-accent">{i.categoryLabel}</span>
          <span className="chip">{i.tierLabel} · {i.rank}</span>
        </div>
        {i.ownerName && <p className="vault-card-owner">Wielder / owner — {i.ownerName}</p>}
        <p className="vault-card-short">{stripRefs(i.short)}</p>
        <span className="vault-card-cta">View Artifact →</span>
      </div>
    </Link>
  );
}

function stripRefs(s: string): string {
  return s.replace(/\*\*\[S\d+\]\*\*/g, '').replace(/\[S\d+\]/g, '');
}
