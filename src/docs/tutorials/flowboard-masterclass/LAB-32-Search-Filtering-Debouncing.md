# FlowBoard Masterclass — LAB 32 — Search, Filtering, and Debouncing

**Prerequisites:** LAB-31 — List operations. Zustand store with all board state.

**What this lab adds:**
- Real-time card search across all lists
- Multi-select filter panel: priority + assignee (future)
- Debouncing input — preventing excessive re-computation
- `useTransition` — React 18's mechanism for marking non-urgent updates
- Highlighting matched text in search results
- URL-based search state — share a filtered view by URL

**Time:** 70–85 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. A user types quickly in a search box. Without debouncing, the filter runs on every keystroke. Why is this a problem if the filter function is fast (< 1ms)? What if it's slow (API call)?
> 2. React 18's `useTransition` marks state updates as "non-urgent." What does this mean for the user experience?
> 3. Highlighting matched text requires wrapping the matching substring in a `<mark>` or `<span>`. Given the string `"Fix navigation bug"` and the query `"nav"`, how do you split the string to render it as `Fix ` + `<mark>nav</mark>` + `igation bug`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A search bar in the board header filters cards in real time. As you type, non-matching cards are hidden and matching text is highlighted in yellow. The search query is stored in the URL (`?q=nav`) so you can share filtered views. A clear button resets the search.

---

## Concept: Debouncing

**The problem:**

```
User types: "n" → "na" → "nav" → "navi"
Without debounce: filter runs 4 times
With 300ms debounce: filter runs 1 time (after "navi" + 300ms of silence)
```

For fast in-memory filtering, debouncing is cosmetic — the UI feels slightly less "sticky." For API search calls, debouncing is essential — without it, every keystroke fires a network request. A user typing "navigation" at 100ms/character fires 10 requests; only the last result matters.

**Implementing debounce with `useEffect`:**

```typescript
function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);  // cleanup cancels the timer if value changes before delay
  }, [value, delay]);

  return debounced;
}
```

Usage:
```typescript
const [searchInput, setSearchInput] = useState('');
const debouncedSearch = useDebounced(searchInput, 300);

// Only recomputes when debouncedSearch changes (after 300ms of no typing):
const filteredCards = useMemo(() => filterCards(cards, debouncedSearch), [cards, debouncedSearch]);
```

**Alternative: Lodash `_.debounce`:**
```typescript
import { debounce } from 'lodash';

const handleSearch = useMemo(
  () => debounce((value: string) => setDebouncedSearch(value), 300),
  []
);
```

This lab uses the custom hook approach (no lodash dependency).

---

## Concept: `useTransition` (React 18)

`useTransition` lets you mark a state update as "non-urgent" — React can interrupt it to handle more urgent updates (like typing in an input):

```typescript
const [isPending, startTransition] = useTransition();

function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
  const value = e.target.value;

  // Urgent: update the input immediately (so typing feels instant)
  setSearchInput(value);

  // Non-urgent: the filtered results can wait
  startTransition(() => {
    setSearchQuery(value);
  });
}
```

When `isPending` is true (the transition is being computed), you can show a subtle loading indicator without blocking the input.

**When to use `useTransition`:** When you have an input that drives a slow render. The input update must feel instant; the results can lag slightly. Without `useTransition`, a slow filter computation on each keystroke makes the input itself feel laggy.

---

## Step 1 — Create the `useDebounced` hook

Create `src/hooks/useDebounced.ts`:

```typescript
// src/hooks/useDebounced.ts

import { useState, useEffect } from 'react';

export function useDebounced<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

---

## Step 2 — Add search to URL with `useSearchParams`

React Router's `useSearchParams` hook reads and writes URL query parameters:

```typescript
import { useSearchParams } from 'react-router-dom';

function BoardHeader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') ?? '';

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    if (value) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  }

  // ...
}
```

The URL becomes `/boards/board-1?q=nav` — shareable, bookmarkable, back-button-compatible.

---

## Step 3 — Create the `SearchBar` component

Create `src/components/SearchBar.tsx`:

```tsx
// src/components/SearchBar.tsx

import { useRef, useEffect } from 'react';
import './SearchBar.css';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search cards...' }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Ctrl+K or Cmd+K to focus
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="search-bar">
      <span className="search-bar-icon" aria-hidden="true">🔍</span>
      <input
        ref={inputRef}
        className="search-bar-input"
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search cards"
      />
      {value && (
        <button
          className="search-bar-clear"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>
  );
}
```

Create `src/components/SearchBar.css`:

```css
.search-bar {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 6px;
  padding: 0 10px;
  gap: 8px;
  transition: background 0.15s, border-color 0.15s;
}

.search-bar:focus-within {
  background: white;
  border-color: white;
}

.search-bar:focus-within .search-bar-icon { color: #718096; }

.search-bar-icon { color: rgba(255,255,255,0.8); font-size: 14px; }

.search-bar-input {
  background: none;
  border: none;
  outline: none;
  color: white;
  font-size: 14px;
  width: 200px;
  padding: 7px 0;
}

.search-bar:focus-within .search-bar-input { color: #2d3748; }

.search-bar-input::placeholder { color: rgba(255,255,255,0.6); }
.search-bar:focus-within .search-bar-input::placeholder { color: #a0aec0; }

/* Remove browser's default search input clear button */
.search-bar-input::-webkit-search-cancel-button { display: none; }

.search-bar-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: rgba(255,255,255,0.7);
  font-size: 12px;
  padding: 2px;
}

.search-bar:focus-within .search-bar-clear { color: #718096; }
```

---

## Step 4 — Create `HighlightedText` component

Create `src/components/HighlightedText.tsx`:

```tsx
// src/components/HighlightedText.tsx
// Renders text with the matching substring highlighted.

interface HighlightedTextProps {
  text: string;
  query: string;
}

export function HighlightedText({ text, query }: HighlightedTextProps) {
  if (!query.trim()) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex === -1) return <>{text}</>;

  const before = text.slice(0, matchIndex);
  const match = text.slice(matchIndex, matchIndex + lowerQuery.length);
  const after = text.slice(matchIndex + lowerQuery.length);

  return (
    <>
      {before}
      <mark className="search-highlight">{match}</mark>
      {after}
    </>
  );
}
```

Add to `index.css` or `App.css`:

```css
.search-highlight {
  background: #fef08a;    /* yellow-200 */
  color: #1a202c;
  border-radius: 2px;
  padding: 0 1px;
}
```

---

## Step 5 — Wire search into the board display

Add to the Zustand store:

```typescript
// In boardStore.ts:
searchQuery: string;
setSearchQuery: (query: string) => void;
```

Add `selectDisplayBoard` selector to filter by search:

```typescript
// In boardSelectors.ts:
export const selectDisplayBoard = (state: BoardStore) => {
  const board = selectActiveBoard(state);
  if (!board) return null;

  const query = state.searchQuery.toLowerCase().trim();

  // Filter + search + sort
  return {
    ...board,
    lists: board.lists
      .filter(list => !list.isArchived)
      .map(list => ({
        ...list,
        cards: list.cards
          .filter(card => !state.priorityFilter || card.priority === state.priorityFilter)
          .filter(card => !query || card.title.toLowerCase().includes(query) || card.description.toLowerCase().includes(query))
          .with(/* apply sort */),
      })),
  };
};
```

Update `Card.tsx` to use `HighlightedText` when a search is active:

```tsx
import { HighlightedText } from './HighlightedText';
import { useBoardStore } from '../store/boardStore';

// In Card component:
const searchQuery = useBoardStore(state => state.searchQuery);

// In JSX:
<h3 className="card-title">
  <HighlightedText text={card.title} query={searchQuery} />
</h3>
```

### SAVE AND TRY

1. Type in the search bar — non-matching cards disappear, matching text is highlighted
2. Try Ctrl+K / Cmd+K to focus the search bar
3. Check the URL — it updates with `?q=yourquery`
4. Copy the URL and open in a new tab — search is preserved
5. Press the clear button — all cards return

---

## 🎯 Challenge: Search across card descriptions

**You know:** The `Card` interface has a `description` field. The current search only matches `card.title`.

**Task:** Extend the search to also match `card.description`. When a description match occurs (not the title), show a small "In description" indicator below the card title.

**Hints:**
- In the filter function, check both `card.title` and `card.description`
- Track `matchesTitle` and `matchesDescription` separately
- Pass both to `Card.tsx` as props, or derive them in `Card.tsx` from the search query
- Add a `<span className="card-desc-match">In description</span>` when description matches but title doesn't

---

<details>
<summary>▶ Show Solution</summary>

```typescript
// Filter update in selectDisplayBoard:
.filter(card => {
  if (!query) return true;
  const titleMatch = card.title.toLowerCase().includes(query);
  const descMatch = card.description.toLowerCase().includes(query);
  return titleMatch || descMatch;
})
```

```tsx
// In Card.tsx:
const searchQuery = useBoardStore(state => state.searchQuery);
const query = searchQuery.toLowerCase().trim();
const titleMatches = query && card.title.toLowerCase().includes(query);
const descMatches = query && !titleMatches && card.description.toLowerCase().includes(query);

// In JSX:
{descMatches && (
  <span className="card-desc-match">📄 In description</span>
)}
```

```css
.card-desc-match {
  font-size: 11px;
  color: #718096;
  font-style: italic;
  display: block;
  margin-top: 2px;
}
```

**Key insight:** The reason to distinguish "title match" from "description match" is user experience — cards that match in the title are typically more relevant and should feel more "found." Cards that match only in the description are found but the visible title doesn't show why. The indicator explains to the user why this card appeared in their results.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| Search bar in board header | Visible in board header area |
| Typing filters cards in real time | Type "Fix" → only matching cards |
| Matched text highlighted in yellow | Matching text has yellow background |
| Clear button resets search | × button → all cards return |
| Ctrl+K focuses search bar | Press Ctrl+K → cursor in search bar |
| URL updates with `?q=` | Type query → URL shows `?q=query` |
| Open URL in new tab preserves search | Copy URL → paste → search active |
| Non-matching cards hidden (not deleted) | Search → clear → all cards back |
| Empty search shows all cards | Empty query → no filtering |
| Search + priority filter combine | Priority filter + search both active |
| `useDebounced` hook used | Check useDebounced.ts |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. Debouncing — why even for fast filters:**

For fast in-memory filters (< 1ms), debouncing is about reducing React work, not about the filter speed. Each keystroke triggers a `setState` → React re-renders the component → runs the filter → updates all card components. With 300ms debounce, a user typing "navigation" (10 chars in ~700ms) triggers 1 render instead of 10. This is a minor but real improvement on complex boards. For API searches, debouncing is essential: a 300ms debounce on a "search as you type" API call reduces 10 network requests to 1, with much lower server load and no need to handle out-of-order responses.

**2. `useTransition` non-urgent updates:**

React renders urgent updates (like typing in an input) synchronously — the input must feel instant. `useTransition` marks other state updates as "interruptible" — React can start computing them, then pause if an urgent update arrives (like another keystroke), then resume. This means: the search input never blocks due to a slow render. `isPending` is true while the transition is pending; you can show a loading indicator or dim the results while the new query is being computed. Practically, this matters most when the number of cards is very large (hundreds per board) and each render is slow enough that a 60fps input would drop frames.

**3. Splitting a string for highlighted text:**

```typescript
const text = "Fix navigation bug";
const query = "nav";
const matchIndex = text.toLowerCase().indexOf(query.toLowerCase());  // 4
const before = text.slice(0, 4);                    // "Fix "
const match = text.slice(4, 4 + query.length);      // "nav"
const after = text.slice(4 + query.length);         // "igation bug"
```

Then render: `{before}<mark>{match}</mark>{after}`. The key insight is using `indexOf()` on the lowercased version to find a case-insensitive match, but slicing from the original string to preserve the original casing in the output. This is why "Fix NAVigation bug" with query "nav" highlights "NAV" (not "nav").

---

## Next Lab

In **LAB-33**, you will add **virtual scrolling** to handle boards with many cards. You will learn why the DOM has performance limits, how virtual lists work conceptually, and use `@tanstack/react-virtual` to render only visible cards.
