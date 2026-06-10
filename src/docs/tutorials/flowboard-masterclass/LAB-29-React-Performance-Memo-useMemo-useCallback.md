# FlowBoard Masterclass — LAB 29 — React Performance: Profiler, `React.memo`, `useMemo`, `useCallback`

**Prerequisites:** LAB-28 — Keyboard accessibility. Full-featured FlowBoard.

**What this lab adds:**
- React DevTools Profiler — measuring component render time and frequency
- The three causes of re-renders — state change, parent re-render, context change
- `React.memo` — skipping re-renders when props haven't changed
- `useMemo` — caching expensive computed values
- `useCallback` — stabilizing function references
- When NOT to optimize — the cost of premature optimization

**Time:** 70–85 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. A parent component re-renders. Which of its children will re-render by default?
> 2. `React.memo` wraps a component and compares props before re-rendering. What comparison does it use by default, and what is the implication for object and function props?
> 3. `useCallback(fn, [deps])` and `useMemo(() => fn, [deps])` are related. What is the difference?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

You will profile FlowBoard, identify which components re-render unnecessarily when a card is added, and apply targeted optimizations. You will also learn to use the Profiler to verify the optimizations work.

---

## Concept: Why Components Re-render

React re-renders a component when:
1. **Its state changes** — via `useState` or `useReducer`
2. **Its parent re-renders** — React re-renders all children by default
3. **A context it subscribes to changes** — via `useContext`

**The problem:**

```
App (state: boards)
  ↓ re-renders when any card changes
  Sidebar  ← re-renders even though only a card changed
  Board    ← re-renders (expected)
    List 1  ← re-renders (expected: has a card)
    List 2  ← re-renders even though nothing in List 2 changed
      Card A  ← re-renders even though Card A didn't change
      Card B  ← re-renders even though Card B didn't change
```

When you add one card to List 1, every `Card` in List 2 also re-renders. With 100 cards across 5 lists, adding one card triggers 95+ unnecessary re-renders. Each re-render is cheap individually, but they add up — and each creates new virtual DOM nodes that React must diff.

---

## Concept: Profiling with React DevTools

**Setup:**

1. Install React DevTools browser extension (Chrome/Firefox)
2. Open DevTools → "⚛ Profiler" tab
3. Click the record button (◉)
4. Perform an action in the app (e.g., add a card)
5. Click stop
6. View the flamegraph

**Reading the flamegraph:**

Each bar is a component. Bar width = render time. Gray = not re-rendered. Colored = re-rendered (brighter = slower).

**The "ranked chart":**

Shows components ordered by render time. Click a bar to see why it rendered: "Props changed", "State changed", "Hooks changed", "Parent component rendered".

**What you'll find in FlowBoard before optimization:**

Adding a card in List 1 will show all `Card` components in other lists re-rendering with reason "Parent component rendered" — they're being re-rendered by `Board` re-rendering, which is re-rendered by the state update.

---

## Concept: `React.memo`

`React.memo` is a Higher-Order Component (HOC) that wraps a component and memoizes it. On re-render, if the props haven't changed, it skips the render entirely.

```tsx
// Without memo: re-renders every time parent re-renders
export function Card({ card, onDelete }) {
  console.log('Card rendered:', card.id);
  return <div>{card.title}</div>;
}

// With memo: only re-renders if props change
export const Card = React.memo(function Card({ card, onDelete }) {
  console.log('Card rendered:', card.id);
  return <div>{card.title}</div>;
});
```

**Default comparison — reference equality (Object.is):**

```typescript
// Props compared with Object.is for each key:
oldProps.card === newProps.card    // true only if same object reference
oldProps.onDelete === newProps.onDelete  // true only if same function reference
```

If `card` is `{ id: '1', title: 'Fix bug' }` but a new object is created on every render (even with the same values), `React.memo` won't help — the reference is different.

---

## Concept: `useMemo` and `useCallback`

**`useMemo`** — caches a computed value:

```typescript
// Expensive: called every render
const sortedCards = sortCards(cards, sortOrder);

// Memoized: only recomputed when cards or sortOrder changes
const sortedCards = useMemo(
  () => sortCards(cards, sortOrder),
  [cards, sortOrder]
);
```

**`useCallback`** — caches a function reference:

```typescript
// New function created every render → breaks React.memo on children
const handleDelete = (id) => onDeleteCard(listId, id);

// Stable reference → React.memo sees same function
const handleDelete = useCallback(
  (id) => onDeleteCard(listId, id),
  [listId, onDeleteCard]
);
```

**The relationship:** `useCallback(fn, deps)` is exactly `useMemo(() => fn, deps)` — just more readable for functions.

---

## Step 1 — Profile before optimization

Before making any changes, profile the app:

1. Open React DevTools Profiler
2. Click Record
3. Add a card to List 1
4. Stop recording
5. Note in your notebook which components re-rendered and why

You should observe:
- `Board` re-renders ← state changed
- All `List` components re-render ← "Parent rendered"
- All `Card` components in other lists re-render ← "Parent rendered"
- `Sidebar` may also re-render ← "Parent rendered"

---

## Step 2 — Memoize `Card`

Update `Card.tsx`:

```tsx
import { memo } from 'react';

// Wrap the entire component:
export const Card = memo(function Card({ card, ...props }: CardProps) {
  // ... same as before
});
```

But this alone won't help if `onDelete`, `onMoveLeft`, etc. are new function references every render.

---

## Step 3 — Stabilize callbacks with `useCallback` in `useBoardState`

The issue: `useBoardState` creates new function references on every state update because the functions close over the latest state. Wrapping in `useCallback` with appropriate dependencies stabilizes them:

```typescript
const handleDeleteCard = useCallback(
  async (listId: string, cardId: string) => {
    // ... same implementation
  },
  [activeBoard?.id]  // only changes when active board changes
);

const handleAddCard = useCallback(
  async (listId: string, title: string) => {
    // ... same implementation
  },
  [activeBoard?.id]
);

const handleMoveCard = useCallback(
  async (cardId: string, fromListId: string, toListId: string) => {
    // ... same implementation
  },
  [activeBoard?.id]
);
```

**Why this works:** The handlers' implementations depend on `activeBoard` — but only on its `id` (to know which board to update). By listing `activeBoard?.id` as the dependency, the function reference stays stable as long as the board ID doesn't change — even if other board data changes (like when a card is added).

---

## Step 4 — Memoize the `List` component

Update `List.tsx`:

```tsx
import { memo } from 'react';

export const List = memo(function List({ cards, listId, title, ...handlers }: ListProps) {
  // The list only re-renders when its specific cards change or handlers change
});
```

But now there's a subtlety: `handlers` passed from `Board` must be stable. Use `useCallback` in `Board.tsx` for the per-list callbacks, or lift the handlers to `useBoardState` level where they're already memoized.

---

## Step 5 — Profile after optimization

Repeat the profiling steps:

1. Open React DevTools Profiler
2. Click Record
3. Add a card to List 1
4. Stop recording
5. Compare with the before profile

You should now see:
- `Board` re-renders ← state changed (still)
- `List 1` re-renders ← props changed (its cards changed)
- `List 2`, `List 3`, etc. — **grayed out** (skipped)
- `Card` components in List 1 that didn't change — **grayed out** (skipped)

---

## Step 6 — Memoize the `Sidebar`

The `Sidebar` re-renders every time any board data changes. Since the sidebar only needs board IDs and titles, it can be memoized:

```tsx
export const Sidebar = memo(function Sidebar({ boards, selectedBoardId, onSelect, onDelete }: SidebarProps) {
  // ...
});
```

And in `BoardPage.tsx`, stabilize the `onSelect` and `onDelete` callbacks with `useCallback`.

---

## When NOT to Optimize

**The rule of thumb:** Profile first. Optimize only what the profiler shows is a problem.

**The cost of `React.memo`:**

Every `React.memo` call adds a shallow comparison of all props on every render. If the comparison is cheap and the re-render would be cheap, you've added work for no benefit — sometimes making things slower.

**The cost of `useCallback` and `useMemo`:**

Both create and maintain a dependency array. React checks whether dependencies changed on every render. For trivial computations, `useMemo` adds more work than it saves.

**The 3 questions to ask before optimizing:**

1. Does the profiler show this component is slow? (> 1ms render time)
2. Does it render more often than its props change?
3. Is there real user-visible impact (jank, dropped frames)?

If the answer to any of these is "no," don't optimize.

---

### SAVE AND TRY (profiling)

1. Before applying `React.memo` to `Card`, profile: add a card, count how many components rendered
2. Apply `React.memo` to `Card`
3. Profile again: add a card, confirm other list cards no longer render
4. Apply `React.memo` to `List` and `Sidebar`
5. Profile once more: confirm only the affected list re-renders

---

## 🎯 Challenge: Memoize the `sortCards` call with `useMemo`

**You know:** `useMemo`, `sortCards` from Lab 27, how sorting works.

**Task:** In `useBoardState`, the active board is re-derived on every render (including the sorting logic). Memoize the final `activeBoard` (after filtering and sorting) using `useMemo` with appropriate dependencies.

**Hints:**
- `const activeBoard = useMemo(() => ..., [boards, selectedBoardId, priorityFilter, listSortOrders])`
- All four values are dependencies because any of them could change the output
- This is a good use of `useMemo` because the derivation involves array operations across all cards

---

<details>
<summary>▶ Show Solution</summary>

```typescript
const activeBoard = useMemo(() => {
  const board = boards.find(b => b.id === selectedBoardId);
  if (!board) return null;

  // Apply priority filter
  const filtered = priorityFilter
    ? {
        ...board,
        lists: board.lists.map(list => ({
          ...list,
          cards: list.cards.filter(c => c.priority === priorityFilter),
        })),
      }
    : board;

  // Apply sort orders
  return {
    ...filtered,
    lists: filtered.lists.map(list => ({
      ...list,
      cards: sortCards(list.cards, listSortOrders[list.id] ?? 'MANUAL'),
    })),
  };
}, [boards, selectedBoardId, priorityFilter, listSortOrders]);
```

**Key insight:** `useMemo` is most valuable when the computation (1) is called frequently, (2) is genuinely expensive (involves multiple array operations across many items), and (3) the dependencies change less often than the component renders. Deriving the active board involves `.find()`, `.map()`, `.filter()`, and `Array.sort()` — each proportional to the number of cards. With `useMemo`, this derivation runs only when boards/filter/sort actually changes, not on every render triggered by unrelated state (like an unrelated input's `onChange`).

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| Profiler installed | React DevTools shows Profiler tab |
| Profile before: other-list cards render | Record → add card → see all cards in flamegraph |
| Profile after: other-list cards skip | Record → add card → gray bars for unchanged cards |
| `Card` wrapped in `React.memo` | Check Card.tsx |
| `List` wrapped in `React.memo` | Check List.tsx |
| `Sidebar` wrapped in `React.memo` | Check Sidebar.tsx |
| `handleDeleteCard` wrapped in `useCallback` | Check useBoardState.ts |
| `activeBoard` memoized with `useMemo` | Check useBoardState.ts |
| App still works correctly | Add, delete, move, drag cards |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. When a parent re-renders, which children re-render?**

By default, all of them — regardless of whether their props changed. React's default behavior is to re-render the entire subtree when a component re-renders. This is by design: React is fast enough by default that the virtual DOM diffing is cheaper than the comparison logic it would take to determine whether a re-render is necessary. `React.memo` is the opt-in mechanism to skip this default behavior.

**2. `React.memo`'s default comparison and its implications:**

It uses `Object.is` (reference equality) for each prop. For primitive values (`string`, `number`, `boolean`), this is value equality. For objects and functions, it's reference equality — two objects with identical contents are NOT equal if they're different object instances. This means: if you pass `card={{ id: '1', title: 'Fix bug' }}` as a prop and a new object is created each render (even with the same values), `React.memo` will always re-render. The fix is to pass the same object reference (from a stable state array slot) or to use `useMemo` to create a stable reference.

**3. Difference between `useCallback` and `useMemo` for functions:**

`useCallback(fn, deps)` returns the memoized function itself. `useMemo(() => fn, deps)` returns the result of calling `() => fn` — which is also the function. They're identical. `useCallback` is syntactic sugar for the common case of memoizing functions. `useMemo` is more general — it can memoize any value. Prefer `useCallback` for functions (clearer intent) and `useMemo` for computed values.

---

## Next Lab

In **LAB-30**, you will learn **Zustand** — a modern, lightweight state management library. You will see why global state becomes necessary as the app grows, refactor `useBoardState` into a Zustand store, and understand how Zustand compares to Context and Redux.
