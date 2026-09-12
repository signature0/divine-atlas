'use client';
// Cosmology map: realm boxes positioned on a 0–100 canvas. Click → list its entities.
import { useState } from 'react';
import Link from 'next/link';
import { Cosmology, Realm, Entity } from '../lib/types';
import { SourceFootnote } from './SourceFootnote';
import { SourceRef } from '../lib/types';

export function CosmologyMap({ cosmology, entities, sources }: {
  cosmology: Cosmology; entities: Entity[]; sources: SourceRef[];
}) {
  const [active, setActive] = useState<Realm | null>(null);
  const byId = new Map(entities.map((e) => [e.id, e]));
  const realms = cosmology.realms || [];

  if (cosmology.traditions?.length) {
    // multi-tradition (Egyptian): tabs
    return <TraditionTabs cosmology={cosmology} byId={byId} sources={sources} />;
  }

  return (
    <div>
      {cosmology.structure_notes && (
        <p className="small muted" style={{ marginBottom: 18, maxWidth: 720 }}>
          <SourceFootnote text={cosmology.structure_notes} sources={sources} />
        </p>
      )}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden' }}>
        {realms.map((r) => {
          const L: { x: number; y: number; w?: number; h?: number; r?: number } = r.layout || { x: 5, y: 5 };
          const isCircle = typeof L.r === 'number' && typeof L.w !== 'number';
          let left: number, top: number, w: number, h: number;
          if (isCircle) {
            // circle data: x is a 0–1 fraction of width, y a 0–1 fraction of
            // height, r a 0–1 fraction of width (the container is 16:9).
            w = L.r! * 200;                    // diameter as % of width
            h = L.r! * 200 * (16 / 9);         // same px, expressed as % of height
            left = L.x * 100 - w / 2;
            top = L.y * 100 - h / 2;
          } else {
            // rect data: x/y/w/h are 0–100 units, x/y = top-left corner.
            left = L.x ?? 5; top = L.y ?? 5;
            w = L.w ?? 40; h = L.h ?? 20;
          }
          return (
          <button key={r.id}
            onClick={() => setActive(active?.id === r.id ? null : r)}
            aria-label={`Realm: ${r.name}`}
            style={{
              position: 'absolute', left: `${left}%`, top: `${top}%`,
              width: `${w}%`, height: `${h}%`,
              border: `1px solid ${active?.id === r.id ? 'var(--accent)' : 'var(--line)'}`,
              background: active?.id === r.id ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'color-mix(in srgb, var(--bg-2) 70%, transparent)',
              borderRadius: isCircle ? '50%' : 4, padding: isCircle ? 6 : '8px 10px', textAlign: 'left', cursor: 'pointer',
              color: 'var(--ink-0)', transition: 'all .2s var(--ease)',
              display: isCircle ? 'flex' : 'block', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
            }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(0.6rem, 1.2vw, 1rem)', fontWeight: 600, display: 'block', textAlign: 'center', lineHeight: 1.25 }}>{r.name}</span>
            {r.native_name && <span className="native" style={{ fontSize: '0.72rem', color: 'var(--ink-2)' }}>{r.native_name}</span>}
          </button>
          );
        })}
      </div>
      {active && (
        <div style={{ marginTop: 18 }}>
          <div className="attr-label">{active.name} — description</div>
          <p className="small muted" style={{ maxWidth: 720, margin: '4px 0 12px' }}>
            <SourceFootnote text={active.description} sources={sources} />
          </p>
          <div className="mono faint" style={{ marginBottom: 8 }}>ENTITIES ASSOCIATED</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {active.entities.map((id) => {
              const e = byId.get(id);
              return e ? (
                <Link key={id} href={`/deity/${id}`} className="chip" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>{e.name}</Link>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TraditionTabs({ cosmology, byId, sources }: {
  cosmology: Cosmology; byId: Map<string, Entity>; sources: SourceRef[];
}) {
  const [tab, setTab] = useState(cosmology.traditions![0].id);
  const t = cosmology.traditions!.find((x) => x.id === tab)!;
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        {cosmology.traditions!.map((tr) => (
          <button key={tr.id} className={`chip-btn ${tr.id === tab ? 'active' : ''}`} onClick={() => setTab(tr.id)}>
            {tr.name}
          </button>
        ))}
      </div>
      <p className="small muted" style={{ maxWidth: 760, marginBottom: 16 }}>
        <SourceFootnote text={t.notes} sources={sources} />
      </p>
      {(t.realms || []).map((r) => (
        <div key={r.id} style={{ border: '1px solid var(--line)', borderRadius: 4, padding: 14, marginBottom: 12, background: 'var(--bg-2)' }}>
          <h3 style={{ marginBottom: 4 }}>{r.name}</h3>
          <p className="small muted" style={{ margin: '4px 0 10px' }}><SourceFootnote text={r.description} sources={sources} /></p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {r.entities.map((id) => byId.get(id) ? (
              <Link key={id} href={`/deity/${id}`} className="chip" style={{ fontSize: '0.72rem', padding: '4px 10px' }}>{byId.get(id)!.name}</Link>
            ) : null)}
          </div>
        </div>
      ))}
    </div>
  );
}
