'use client';
// Triggers the browser's native "Save as PDF" / print dialog. We rely on the
// browser's vector PDF writer rather than a JS PDF lib: text stays crisp, no
// heavy dependency, and the @media print rules in globals.css isolate the card.
export function PrintButton({ label = 'Save as PDF' }: { label?: string }) {
  return (
    <button className="btn btn-secondary print-btn" onClick={() => window.print()}>
      {label} <span aria-hidden="true">⤓</span>
    </button>
  );
}
