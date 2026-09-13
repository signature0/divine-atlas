'use client';
// SearchTrigger — the visible search affordance in the TopNav (DES-002).
// Opens the existing SearchOverlay by dispatching a window CustomEvent,
// keeping TopNav a server component and SearchOverlay the single owner
// of overlay state.
export const OPEN_SEARCH_EVENT = 'atlas:open-search';

export function SearchTrigger() {
  return (
    <button
      type="button"
      className="search-btn"
      aria-label="Open search (Command or Ctrl + K)"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT))}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="21" y2="21" />
      </svg>
      <span>Search ⌘K</span>
    </button>
  );
}
