'use client';
// Comparator: attribute-by-attribute overlap + explicit verdicts.
// Client component: receives its dataset as props from the server page
// (app/lib/data is server-only — it reads the filesystem).
import { useState } from 'react';
import Link from 'next/link';
import { Entity, CultureData, Culture } from '../lib/types';
import { SourceFootnote } from '../components/SourceFootnote';

type All = { entity: Entity; data: CultureData };

function verdicts(a: All, b: All): string[] {
  const out: string[] = [];
  const ea = a.entity, eb = b.entity;
  const sharedDom = ea.domains.filter((x) => eb.domains.includes(x));
  const sharedSym = (ea.symbols || []).filter((x) => (eb.symbols || []).includes(x));
  const sharedAnim = (ea.animals || []).filter((x) => (eb.animals || []).includes(x));
  if (sharedDom.length >= 2) out.push(`SIMILARITY — both rule over ${sharedDom.join(' & ')}.`);
  else if (sharedDom.length === 1) out.push(`PARTIAL SIMILARITY — both bear the domain of ${sharedDom[0]}.`);
  if (sharedSym.length) out.push(`SHARED SYMBOL — ${sharedSym.join(', ')}.`);
  if (sharedAnim.length) out.push(`SHARED ANIMAL — ${sharedAnim.join(', ')}.`);
  if (ea.culture === eb.culture) out.push('SAME TRADITION — different figures within one mythology.');
  else out.push('NO KNOWN HISTORICAL CONNECTION recorded in the primary sources — this comparison is structural, not attested.');
  if (ea.domains.length && eb.domains.length && !sharedDom.length) out.push('DIFFERENCE — no shared domains in the recorded data.');
  return out;
}

const sel: React.CSSProperties = {
  background: 'var(--bg-2)', color: 'var(--ink-0)', border: '1px solid var(--line)',
  borderRadius: 3, padding: '10px 14px', fontSize: '0.78rem', minWidth: 220, fontFamily: 'var(--font-mono)',
};

function labelOf(c: string): string {
  return c === 'japanese' ? 'Japanese' : c === 'greek' ? 'Greek' : c === 'norse' ? 'Norse'
    : c === 'egyptian' ? 'Egyptian' : c === 'slavic' ? 'Slavic' : c === 'mesopotamian' ? 'Mesopotamian' : c;
}
function grouped(all: All[]): [string, Entity[]][] {
  const map = new Map<string, Entity[]>();
  for (const { entity, data } of all) {
    const arr = map.get(data.culture) || [];
    arr.push(entity);
    map.set(data.culture, arr);
  }
  return [...map.entries()];
}

export function CompareWidget({ all }: { all: All[] }) {
  const [aid, setAid] = useState(all[0]?.entity.id || '');
  const [bid, setBid] = useState(all.find((x) => x.entity.id !== all[0]?.entity.id)?.entity.id || all[1]?.entity.id || all[0]?.entity.id || '');
  if (!all.length) return null;
  const a = all.find((x) => x.entity.id === aid) || all[0];
  const b = all.find((x) => x.entity.id === bid) || all[1] || all[0];

  const rows: [string, string, string][] = [
    ['Culture', a.data.meta.name, b.data.meta.name],
    ['Classification', a.entity.classification, b.entity.classification],
    ['Gender', a.entity.gender || '—', b.entity.gender || '—'],
    ['Domains', a.entity.domains.join(', '), b.entity.domains.join(', ')],
    ['Symbols', (a.entity.symbols || []).join(', ') || '—', (b.entity.symbols || []).join(', ') || '—'],
    ['Animals', (a.entity.animals || []).join(', ') || '—', (b.entity.animals || []).join(', ') || '—'],
    ['Weapons', (a.entity.weapons || []).join(', ') || '—', (b.entity.weapons || []).join(', ') || '—'],
    ['Sacred objects', (a.entity.sacred_objects || []).join(', ') || '—', (b.entity.sacred_objects || []).join(', ') || '—'],
  ];
  const vs = verdicts(a, b);

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
        <select className="mono" value={aid} onChange={(e) => setAid(e.target.value)} style={sel} aria-label="First deity">
          {grouped(all).map(([c, items]) => (
            <optgroup key={c} label={labelOf(c)}>
              {items.map((e) => <option key={e.id} value={e.id}>{e.name} — {labelOf(c)}</option>)}
            </optgroup>
          ))}
        </select>
        <select className="mono" value={bid} onChange={(e) => setBid(e.target.value)} style={sel} aria-label="Second deity">
          {grouped(all).map(([c, items]) => (
            <optgroup key={c} label={labelOf(c)}>
              {items.map((e) => <option key={e.id} value={e.id}>{e.name} — {labelOf(c)}</option>)}
            </optgroup>
          ))}
        </select>
      </div>

      <div style={{ border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', borderBottom: '1px solid var(--line)', background: 'var(--bg-1)' }}>
          <div className="mono" style={{ padding: '12px 16px', color: 'var(--ink-2)', fontSize: '0.66rem' }}>ATTRIBUTE</div>
          <div className="mono" style={{ padding: '12px 16px', color: 'var(--accent)', fontSize: '0.7rem' }}>{a.entity.name}</div>
          <div className="mono" style={{ padding: '12px 16px', color: 'var(--accent-2)', fontSize: '0.7rem', borderLeft: '1px solid var(--line)' }}>{b.entity.name}</div>
        </div>
        {rows.map(([label, av, bv], i) => (
          <div key={label} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 1fr', borderBottom: i < rows.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <div className="mono" style={{ padding: '12px 16px', color: 'var(--ink-2)', fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
            <div className="small" style={{ padding: '12px 16px' }}>{av}</div>
            <div className="small" style={{ padding: '12px 16px', borderLeft: '1px solid var(--line)' }}>{bv}</div>
          </div>
        ))}
      </div>

      <h2 style={{ marginTop: 36, marginBottom: 16 }}>Verdict</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 760 }}>
        {vs.map((v, i) => (
          <div key={i} className="small" style={{ borderLeft: `2px solid ${v.startsWith('NO') ? 'var(--ink-2)' : 'var(--accent)'}`, paddingLeft: 12, color: 'var(--ink-0)' }}>{v}</div>
        ))}
      </div>

      <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 900 }}>
        {[a, b].map((x) => (
          <div key={x.entity.id} className="card" style={{ padding: 18 }}>
            <Link href={`/deity/${x.entity.id}`} style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--accent)' }}>
              {x.entity.name} →
            </Link>
            {x.entity.native_name && <div className="native" style={{ color: 'var(--ink-2)', fontSize: '0.9rem' }}>{x.entity.native_name}</div>}
            <p className="small muted" style={{ margin: '10px 0 0' }}>
              <SourceFootnote text={x.entity.description_short} sources={x.data.sources} />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
