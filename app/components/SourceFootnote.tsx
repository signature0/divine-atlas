'use client';
// Renders [S#] markers in a text string as hoverable citation chips that
// resolve to that culture's sources.md bibliography entry.
import { useState, ReactNode } from 'react';
import { SourceRef } from '../lib/types';

type Props = {
  text: string;
  sources: SourceRef[]; // for this culture
};

function chip(ref: string, source: SourceRef | undefined): ReactNode {
  return (
    <span className="src-wrap" style={{ position: 'relative', display: 'inline-block' }}>
      <span
        className="src"
        tabIndex={0}
        aria-label={`Source ${ref}: ${source?.name || 'unknown'}`}
      >
        [{ref}]
      </span>
      <span
        className="src-pop"
        role="tooltip"
        style={{
          position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)',
          width: 280, background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 4,
          padding: '10px 12px', zIndex: 30, fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
          lineHeight: 1.5, color: 'var(--ink-0)', boxShadow: '0 8px 24px rgba(0,0,0,.5)',
          whiteSpace: 'normal',
        }}
      >
        <strong style={{ color: 'var(--gold)' }}>{ref} · {source?.name || 'source'}</strong>
        {/* spans, not divs: this chip is often nested inside a <p>, and a <div>
            inside <p> is invalid HTML → browser auto-closes the <p> → hydration #418 */}
        {source?.date && <span style={{ color: 'var(--ink-1)', marginTop: 4, display: 'block' }}>{source.date}</span>}
        {source?.type && <span style={{ color: 'var(--ink-2)', display: 'block' }}>{source.type}</span>}
        {source?.url && (
          <a href={source.url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-text)' }}>
            Open source ↗
          </a>
        )}
      </span>
      <style>{`
        .src-wrap .src-pop { display:none; }
        .src-wrap:hover .src-pop, .src-wrap .src:focus + .src-pop { display:block; }
      `}</style>
    </span>
  );
}

export function SourceFootnote({ text, sources }: Props) {
  const byRef = new Map(sources.map((s) => [s.ref, s]));
  const parts = (text || '').split(/(\[S\d+\])/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[(S\d+)\]$/);
        if (m) return <span key={i}>{chip(m[1], byRef.get(m[1]))}</span>;
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}
