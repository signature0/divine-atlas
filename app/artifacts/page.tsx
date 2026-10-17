import type { Metadata } from 'next';
import { Suspense } from 'react';
import { allArtifacts, allRelicCards } from '../lib/data';
import type { RelicCard as RelicCardData } from '../lib/relic-card';
import { TIER_LABELS, RANK_ORDER, TIER_ORDER, CATEGORY_LABELS, STATUS_LABELS, CONFIDENCE_LABELS } from '../lib/types';
import { VaultClient } from './VaultClient';

export const metadata: Metadata = {
  title: 'The Divine Vault — Artifacts & Relics',
  description: 'Every mythological artifact in the Atlas — weapons, regalia, sacred objects — in one interconnected archive.',
};

import { Artifact, ArtifactTier, CompactRank, ArtifactCategory, ArtifactStatus, SourceConfidence } from '../lib/types';

type VaultItem = {
  id: string;
  slug: string;
  culture: string;
  name: string;
  nativeName: string | null;
  altNames: string[];
  category: ArtifactCategory;
  categoryLabel: string;
  artifactType: string;
  domains: string[];
  ownerName: string | null;
  owner: string | null;
  creatorName: string | null;
  tier: ArtifactTier;
  tierLabel: string;
  rank: CompactRank;
  rankOrder: number;
  tierOrder: number;
  status: ArtifactStatus;
  statusLabel: string;
  sourceConfidence: SourceConfidence;
  confidenceLabel: string;
  short: string;
  imageURL: string | null;
  imageType: string;
  imageDepicts: string;
  imageInstitution: string;
  imageLicense: string;
  imageTitle: string;
};

function mapItem(a: Artifact): VaultItem {
  return {
    id: a.id,
    slug: a.slug,
    culture: a.culture,
    name: a.name,
    nativeName: a.native_name || null,
    altNames: a.alternative_names || [],
    category: a.category,
    categoryLabel: CATEGORY_LABELS[a.category],
    artifactType: a.artifact_type,
    domains: a.domains,
    ownerName: a.owner_name || null,
    owner: a.owner || null,
    creatorName: a.creator_name || null,
    tier: a.tier,
    tierLabel: TIER_LABELS[a.tier],
    rank: a.rank,
    rankOrder: RANK_ORDER[a.rank],
    tierOrder: TIER_ORDER[a.tier],
    status: a.current_status,
    statusLabel: STATUS_LABELS[a.current_status],
    sourceConfidence: a.source_confidence,
    confidenceLabel: CONFIDENCE_LABELS[a.source_confidence],
    short: a.description_short,
    imageURL: a.artwork.image_url,
    imageType: a.artwork.image_type,
    imageDepicts: a.artwork.depicts,
    imageInstitution: a.artwork.institution,
    imageLicense: a.artwork.license,
    imageTitle: a.artwork.title,
  };
}

export default function VaultPage() {
  const items = allArtifacts().map(mapItem);
  // Relic cards for the Cards layout (derived, serializable, deterministic).
  const relicCards: Record<string, RelicCardData> = {};
  for (const r of allRelicCards()) relicCards[r.id] = r;
  // culture facets present in the catalog
  const cultures = [...new Set(items.map((i) => i.culture))].sort();
  const categories = [...new Set(items.map((i) => i.category))].sort();
  const tiers = [...new Set(items.map((i) => i.tier))].sort((a, b) => TIER_ORDER[a] - TIER_ORDER[b]);
  const owners = [...new Set(items.map((i) => i.ownerName).filter(Boolean))] as string[];

  return (
    <div>
      {/* DES-010: tightened header padding (64/28 -> 44/20) and 96px section top -> 32px so the
          filter bar + first card row reach the fold at 1440; disclaimer moved to the filter row. */}
      <header style={{ padding: '44px 0 20px', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <span className="eyebrow">The Divine Vault · Artifacts &amp; Relics</span>
          <h1 className="display-l" style={{ marginTop: 10 }}>Every sacred object, one archive</h1>
          <hr className="mat-band" style={{ width: 140 }} />
          <p className="muted small" style={{ maxWidth: 720, marginTop: 12 }}>
            Hammers and mirrors, crowns and tablets — the objects gods made, wielded, and lost.
            Filter by tradition, object type, or Atlas classification; search by name, power, or owner.
          </p>
        </div>
      </header>
      <div className="container section" style={{ paddingTop: 32 }}>
        <Suspense fallback={<div className="muted" style={{ padding: '40px 0' }}>Opening the vault…</div>}>
          <VaultClient
            items={items}
            relicCards={relicCards}
            cultures={cultures}
            categories={categories}
            tiers={tiers}
            owners={owners}
          />
        </Suspense>
      </div>
    </div>
  );
}

export type { VaultItem };
