'use client';
// SearchTrigger — the visible search affordance in the TopNav (DES-002).
// Opens the existing SearchOverlay by dispatching a window CustomEvent,
// keeping SearchOverlay the single owner of overlay state.
import { SearchIcon } from './icons';

export const OPEN_SEARCH_EVENT = 'atlas:open-search';

export function SearchTrigger() {
  return (
    <button
      type="button"
      className="search-btn"
      aria-label="Open search (Command or Ctrl + K)"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_SEARCH_EVENT))}
    >
      <SearchIcon />
      <span>Search ⌘K</span>
    </button>
  );
}
