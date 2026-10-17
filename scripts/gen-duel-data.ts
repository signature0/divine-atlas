// scripts/gen-duel-data.ts — build the RUNTIME card pool for the hot-seat duel.
//
// Why this exists (PHASE5 addendum): app/lib/data.ts reads JSON from disk at
// build time (fs.readFileSync), so a client component can never import it. The
// /play duel therefore consumes a static, serializable snapshot:
//
//   public/duel-deck.json = { _meta, cards: ResolvedCard[], relics }
//
// `cards` is exactly `allCards()`; `relics` is the entity→relic attach map built
// from `artifactsForEntity` (the only game-legal way to equip a deity). The
// output is deterministic: stable array order, no timestamps, no randomness.
//
// Run:  npx tsx scripts/gen-duel-data.ts
import fs from 'fs';
import path from 'path';
import { allCards, artifactsForEntity, ALL_CULTURES } from '../app/lib/data';

export type DuelRelicRef = { slug: string; name: string };

const cards = allCards();

const relics: Record<string, DuelRelicRef[]> = {};
for (const card of cards) {
  // artifactsForEntity touches owner / associated / relationship edges; only
  // entities with at least one relic get an entry (keeps the map small).
  const refs: DuelRelicRef[] = artifactsForEntity(card.id).map((a) => ({ slug: a.slug, name: a.name }));
  if (refs.length) relics[card.id] = refs;
}

const payload = {
  _meta: {
    generator: 'scripts/gen-duel-data.ts',
    description: 'Runtime card pool for the /play hot-seat duel (see docs/audit/PHASE5-SPEC.md).',
    card_count: cards.length,
    relic_entities: Object.keys(relics).length,
    cultures: [...ALL_CULTURES],
  },
  cards,
  relics,
};

const outPath = path.join(process.cwd(), 'public', 'duel-deck.json');
fs.writeFileSync(outPath, JSON.stringify(payload) + '\n');

console.log(
  `wrote ${outPath} · ${cards.length} cards · ${Object.keys(relics).length} relic-owning entities`,
);
