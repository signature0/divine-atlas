// THE DIVINE ATLAS — Pantheon duel data bridge (PHASE5 addendum).
//
// app/lib/data.ts is build-time only (fs.readFileSync): a client component may
// not import it. /play therefore loads the serializable snapshot written by
// scripts/gen-duel-data.ts into public/duel-deck.json and hands it to this
// fs-free store once, at runtime. The pure engine (app/lib/pantheon.ts) reads
// cards EXCLUSIVELY through these accessors, so the same engine runs in the
// browser and in scripts/enginetest.ts.
//
// This module holds mutable module state on purpose (a cache); the ENGINE does
// not — that purity rule lives in pantheon.ts.
import type { CardElement, CardRarity } from './card';

// The subset of a ResolvedCard the duel needs. The JSON carries the full
// ResolvedCard; extra fields are ignored.
export interface DuelCardData {
  id: string;
  culture: string;
  name: string;
  native_name?: string;
  classification: string;
  element: CardElement;
  type_line: string;
  flavor: string;
  domains: string[];
  symbols: string[];
  weapons: string[];
  stats: { power: number; guard: number; essence: number };
  rarity: CardRarity;
  set_code: string;
  source_refs?: string[];
  image_url?: string | null;
  image_credit?: string;
}

export interface DuelRelicRef {
  slug: string;
  name: string;
}

export interface DuelDeckPayload {
  _meta?: Record<string, unknown>;
  cards: DuelCardData[];
  relics: Record<string, DuelRelicRef[]>;
}

let _cards: DuelCardData[] = [];
let _byId: Map<string, DuelCardData> = new Map();
let _relics: Record<string, DuelRelicRef[]> = {};
let _ready = false;

/** Install the runtime card pool. Called once by DuelClient after fetch. */
export function setDuelDeck(cards: DuelCardData[], relics: Record<string, DuelRelicRef[]>): void {
  _cards = Array.isArray(cards) ? cards : [];
  _byId = new Map(_cards.map((c) => [c.id, c]));
  _relics = relics || {};
  _ready = true;
}

/** True once setDuelDeck has run (i.e. the JSON loaded successfully). */
export function duelDeckReady(): boolean {
  return _ready;
}

/** The card for one entity id, or undefined. */
export function duelCard(id: string): DuelCardData | undefined {
  return _byId.get(id);
}

/** Every card in the runtime pool (stable order = JSON order). */
export function duelAllCards(): DuelCardData[] {
  return _cards;
}

/** Relics attached to one entity id (artifact owner/association map). */
export function duelRelicsForEntity(id: string): DuelRelicRef[] {
  return _relics[id] || [];
}
