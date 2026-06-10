# FlowBoard Masterclass — LAB 27 — Card Sorting: `Array.sort` and Stable Comparators

**Prerequisites:** LAB-26 — Card priority with TypeScript enums.

**What this lab adds:**
- `Array.sort()` mechanics — comparator functions, stability, in-place mutation
- `Array.toSorted()` — the immutable alternative (ES2023)
- Comparator composition — combining multiple sort keys
- Sort state per list — each list can have its own sort order
- Sort by: manual (drag), priority, creation date, title alphabetically

**Time:** 55–70 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. `Array.sort()` mutates the original array. What does this mean for React state, and what's the correct pattern?
> 2. A comparator function for `sort()` returns a number. What do negative, zero, and positive return values mean?
> 3. If you sort by priority first, and then by creation date for cards with equal priority — this is called a multi-key sort. How do you write a comparator that handles this?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Each list has a sort menu (a small dropdown in the list header) offering: Manual (drag order), Priority (Urgent → Low), Newest First, Oldest First, A–Z (title). Selecting a sort displays cards in that order. Selecting Manual restores drag order. Sort preference is stored in component state (not persisted — it resets on refresh).

---

## Concept: `Array.sort()` and Comparators

**The comparator function:**

```typescript
const arr = [3, 1, 4, 1, 5, 9];
arr.sort((a, b) => a - b);  // ascending: [1, 1, 3, 4, 5, 9]
arr.sort((a, b) => b - a);  // descending: [9, 5, 4, 3, 1, 1]
```

The comparator receives two elements `a` and `b` and returns:
- **Negative** → `a` comes before `b`
- **Zero** → `a` and `b` have the same order (preserved if sort is stable)
- **Positive** → `b` comes before `a`

**The mutation problem:**

```typescript
// 🚫 WRONG — mutates the array in state:
setState(prev => {
  prev.sort((a, b) => ...);  // mutates the original!
  return prev;               // returns same reference — React thinks nothing changed
});

// ✅ CORRECT — copy first, then sort:
setState(prev => [...prev].sort((a, b) => ...));

// ✅ Also CORRECT — ES2023 toSorted():
setState(prev => prev.toSorted((a, b) => ...));
```

`Array.toSorted()` was added in ES2023 and TypeScript 5.2+. It returns a new sorted array without mutating the original. It's the cleanest approach when available.

**Stable sort:**

A sort is "stable" when equal elements retain their original order. Modern JavaScript engines (V8, SpiderMonkey, JavaScriptCore) use stable sort — so `Array.sort()` is stable. This matters when you compose sort keys: sort by priority first, then by date — equal-priority cards remain in date order.

**Multi-key sort (comparator composition):**

```typescript
const PRIORITY_ORDER: Record<Priority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

function compareCards(a: Card, b: Card): number {
  // First: sort by priority (Urgent first)
  const priorityDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
  if (priorityDiff !== 0) return priorityDiff;
  
  // Tie-break: sort by creation date (newest first)
  return b.createdAt - a.createdAt;
}
```

The pattern: `if (primaryDiff !== 0) return primaryDiff; return secondaryComparator(a, b)`.

---

## Step 1 — Define sort types

Add to `src/types.ts`:

```typescript
export const SortOrder = {
  Manual: 'MANUAL',           // drag order (position field)
  PriorityDesc: 'PRIORITY',   // Urgent → Low
  NewestFirst: 'NEWEST',      // newest creation date first
  OldestFirst: 'OLDEST',      // oldest creation date first
  TitleAZ: 'TITLE_AZ',        // A → Z
} as const;

export type SortOrder = typeof SortOrder[keyof typeof SortOrder];
```

---

## Step 2 — Create comparator functions

Create `src/utils/cardSort.ts`:

```typescript
// src/utils/cardSort.ts
// Pure comparator functions for card sorting.
// Each returns a negative/zero/positive number per the Array.sort() contract.

import { Card, Priority, SortOrder } from '../types';

const PRIORITY_ORDER: Record<Priority, number> = {
  URGENT: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
};

function byPriority(a: Card, b: Card): number {
  return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
}

function byDateDesc(a: Card, b: Card): number {
  return b.createdAt - a.createdAt;  // newest first
}

function byDateAsc(a: Card, b: Card): number {
  return a.createdAt - b.createdAt;  // oldest first
}

function byTitleAZ(a: Card, b: Card): number {
  return a.title.localeCompare(b.title);
}

export function sortCards(cards: Card[], order: SortOrder): Card[] {
  // MANUAL order = use position field (already ordered from API)
  if (order === 'MANUAL') return cards;

  // Copy first — never mutate the original!
  const copy = [...cards];

  switch (order) {
    case 'PRIORITY':
      return copy.sort((a, b) => {
        const primary = byPriority(a, b);
        return primary !== 0 ? primary : byDateDesc(a, b);  // tie-break by date
      });

    case 'NEWEST':
      return copy.sort(byDateDesc);

    case 'OLDEST':
      return copy.sort(byDateAsc);

    case 'TITLE_AZ':
      return copy.sort(byTitleAZ);

    default:
      // Exhaustive check — TypeScript will error if a new SortOrder is added without handling
      const _exhaustive: never = order;
      return cards;
  }
}
```

---

## Step 3 — Add sort state to `useBoardState`

```typescript
// Sort state: per-list sort order
const [listSortOrders, setListSortOrders] = useState<Record<string, SortOrder>>({});

function handleSetListSort(listId: string, order: SortOrder): void {
  setListSortOrders(prev => ({ ...prev, [listId]: order }));
}

// Apply sort to the active board's lists when deriving the displayed board:
const sortedActiveBoard = useMemo(() => {
  if (!filteredActiveBoard) return null;
  return {
    ...filteredActiveBoard,
    lists: filteredActiveBoard.lists.map(list => ({
      ...list,
      cards: sortCards(list.cards, listSortOrders[list.id] ?? 'MANUAL'),
    })),
  };
}, [filteredActiveBoard, listSortOrders]);

return {
  // ...
  listSortOrders,
  handleSetListSort,
  activeBoard: sortedActiveBoard,
};
```

---

## Step 4 — Add sort dropdown to `List` header

Update `List.tsx`:

```tsx
import { SortOrder } from '../types';

interface ListProps {
  // ... existing ...
  sortOrder?: SortOrder;
  onSetSort?: (order: SortOrder) => void;
}

// In JSX, add to the list header:
<select
  className="list-sort-select"
  value={sortOrder ?? 'MANUAL'}
  onChange={e => onSetSort?.(e.target.value as SortOrder)}
>
  <option value="MANUAL">Manual</option>
  <option value="PRIORITY">Priority</option>
  <option value="NEWEST">Newest First</option>
  <option value="OLDEST">Oldest First</option>
  <option value="TITLE_AZ">A–Z</option>
</select>
```

Add to `List.css`:

```css
.list-sort-select {
  font-size: 11px;
  background: transparent;
  border: 1px solid rgba(0,0,0,0.15);
  border-radius: 4px;
  padding: 2px 4px;
  cursor: pointer;
  color: #718096;
  margin-left: auto;
}

.list-sort-select:focus { outline: none; border-color: #4299e1; }
```

### SAVE AND TRY

1. Click the sort dropdown in a list header
2. Select "Priority" — Urgent cards appear first
3. Add two cards with different priorities — the Urgent one stays at top
4. Switch to "A–Z" — cards in alphabetical order
5. Switch back to "Manual" — drag order restored

---

## 🎯 Challenge: Persist sort preferences to localStorage

**You know:** `localStorage`, JSON serialization, `useEffect`, the `useBoardState` pattern.

**Task:** Currently, sort preferences reset on page refresh. Persist `listSortOrders` to localStorage under the key `'flowboard-sort-orders'`. Restore them on mount.

**Hints:**
- `useEffect` to save when `listSortOrders` changes
- Lazy initializer for `useState` to restore on mount
- `JSON.parse(localStorage.getItem(...) ?? '{}')`
- Wrap in `try/catch` in case localStorage is unavailable or data is corrupted

---

<details>
<summary>▶ Show Solution</summary>

```typescript
const SORT_STORAGE_KEY = 'flowboard-sort-orders';

// Lazy initializer restores persisted sort orders:
const [listSortOrders, setListSortOrders] = useState<Record<string, SortOrder>>(() => {
  try {
    const stored = localStorage.getItem(SORT_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
});

// Persist on change:
useEffect(() => {
  try {
    localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(listSortOrders));
  } catch {
    // localStorage unavailable (private browsing with storage limit, etc.)
  }
}, [listSortOrders]);
```

**Key insight:** The lazy initializer pattern (`useState(() => {...})`) runs the function only once — on mount. If you used `useState(JSON.parse(localStorage...))` without the function wrapper, `localStorage.getItem` would be called on every render, not just the first one. The function wrapper ensures it's called exactly once. This is the correct pattern for expensive initial state computation (reading from storage, parsing JSON, etc.).

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| Sort dropdown in each list header | List headers show sort selector |
| Priority sort: Urgent first | Set sort to Priority → Urgent cards at top |
| Newest First sorts by creation date | Check by adding cards in order |
| Oldest First reverses the date order | Oldest cards at top |
| A–Z sorts alphabetically | Cards in alphabetical order |
| Manual restores drag order | Switch to Manual → drag order preserved |
| Sort applied per-list independently | Each list can have different sort |
| `sortCards()` is a pure function | Check cardSort.ts — no side effects |
| Original cards array never mutated | Check: `[...cards].sort(...)` not `cards.sort(...)` |
| `localeCompare` used for title sort | Check byTitleAZ function |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. `Array.sort()` mutates — what to do in React:**

`Array.sort()` mutates the array in place and returns the same array. In React, state must not be mutated because React uses reference equality to detect changes. If you sort in place and return the same array reference, React sees no change and doesn't re-render. The pattern is always: copy first, then sort. `[...arr].sort(comparator)` creates a shallow copy (new reference) before sorting. `arr.toSorted(comparator)` (ES2023) does the same thing. Both give you a new sorted array without touching the original.

**2. What negative, zero, and positive return values mean:**

`sort(comparator(a, b))`:
- **Negative (< 0)**: `a` should come before `b` in the result.
- **Zero (=== 0)**: `a` and `b` have equal order. In a stable sort (all modern JS engines), they retain their relative order from the input.
- **Positive (> 0)**: `b` should come before `a`.

A common mnemonic: if the comparator returns `a - b`, you get ascending order (smaller numbers first). `b - a` gives descending. For strings, `a.localeCompare(b)` returns negative/zero/positive following the same contract.

**3. Multi-key sort comparator:**

```typescript
function compare(a: Card, b: Card): number {
  const primary = comparePriority(a, b);
  if (primary !== 0) return primary;       // primary key decides
  return compareDate(a, b);                // secondary key for ties
}
```

The pattern is: run the primary comparator; if it returns non-zero, that's the answer. If it returns zero (equal on the primary key), run the secondary comparator. You can chain arbitrarily many comparators this way. In practice, this is clean with a helper: `const chain = (...comparators) => (a, b) => comparators.reduce((r, fn) => r !== 0 ? r : fn(a, b), 0)`.

---

## Next Lab

In **LAB-28**, you will add **keyboard accessibility** to FlowBoard. You will learn about `aria-label`, `role`, `tabIndex`, focus management, and how to audit your app with a screen reader. Many developers skip accessibility until the end — you'll see why that's a mistake, and how adding it incrementally is much easier.
