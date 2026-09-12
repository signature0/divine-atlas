'use client';
// ⌘K command palette over entities + myths. Data is passed in from the server
// layout (this is a client component; it must not import app/lib/data, which
// is server-only because it reads the filesystem).
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Entity, Myth } from '../lib/types';

type SearchResult = { entities: Entity[]; myths: Myth[] };

export function SearchOverlay({
  entities,
  myths,
}: {
  entities: Entity[];
  myths: Myth[];
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const flat: { label: string; sub: string; href: string; kind: string }[] = [];
  const qn = q.toLowerCase().trim();
  if (qn) {
    for (const e of entities) {
      const hay = [e.name, e.native_name, ...(e.alternative_names || []), e.classification, ...e.domains]
        .filter(Boolean).join(' ').toLowerCase();
      if (hay.includes(qn)) flat.push({ label: e.name, sub: `${e.classification} · ${e.culture}`, href: `/deity/${e.id}`, kind: 'entity' });
    }
    for (const m of myths) {
      const hay = [m.title, m.summary].join(' ').toLowerCase();
      if (hay.includes(qn)) flat.push({ label: m.title, sub: `myth · ${m.culture}`, href: `/culture/${m.culture}#myth-${m.id}`, kind: 'myth' });
    }
  }
  const shown = flat.slice(0, 12);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 10);
      } else if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => { setActive(0); }, [q]);

  if (!open) return null;

  return (
    <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Search the Atlas"
      onClick={() => setOpen(false)}>
      <div className="search-panel" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, shown.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            if (e.key === 'Enter' && shown[active]) { window.location.href = shown[active].href; }
          }}
          placeholder="Search gods, myths, domains, symbols… (159 entities · 44 myths)"
          className="mono"
          aria-label="Search"
        />
        <div className="search-results">
          {!qn && (
            <div className="small" style={{ padding: '14px 16px', color: 'var(--ink-2)' }}>
              Type to search. ↑↓ to navigate, Enter to open.
            </div>
          )}
          {qn && !shown.length && (
            <div className="small" style={{ padding: '14px 16px', color: 'var(--ink-2)' }}>No matches.</div>
          )}
          {shown.map((r, i) => (
            <Link key={r.href + r.label} href={r.href}
              onClick={() => setOpen(false)}
              className="search-result"
              style={i === active ? { background: 'var(--bg-2)' } : undefined}
              onMouseEnter={() => setActive(i)}>
              <span className={`search-kind kind-${r.kind}`}>{r.kind}</span>
              <span className="search-label">{r.label}</span>
              <span className="search-sub">{r.sub}</span>
            </Link>
          ))}
        </div>
        <div className="search-foot mono">
          <span>ESC to close</span>
          <span>THE DIVINE ATLAS</span>
        </div>
      </div>
    </div>
  );
}
