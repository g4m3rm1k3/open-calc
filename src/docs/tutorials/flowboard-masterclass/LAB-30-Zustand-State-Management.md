# FlowBoard Masterclass — LAB 30 — Zustand: Modern Global State Management

**Prerequisites:** LAB-29 — React performance optimization. `useBoardState` custom hook.

**What this lab adds:**
- Why local state and Context fall short at scale
- Zustand — minimal, flexible global state
- `create`, `useStore`, `set`, `get` — the core Zustand API
- Async actions in Zustand
- Selectors — subscribing to specific state slices for performance
- Migrating `useBoardState` to a Zustand store

**Time:** 80–95 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. React Context re-renders all consumers every time the context value changes. Why is this a problem for global app state?
> 2. Zustand uses "selectors" to subscribe to specific state slices. How does this help performance?
> 3. Redux uses a global dispatcher, actions, and reducers. Zustand doesn't. What does Zustand use instead, and what tradeoff does this make?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

You will migrate FlowBoard's board state from the `useBoardState` custom hook to a Zustand store. Components will subscribe to only the state they need — a card component only re-renders when its specific card changes, not when any board state changes.

---

## Concept: Why Context Falls Short

Context was designed for relatively static data (theme, locale, current user). Using it for frequently-changing data (board state) causes problems:

```tsx
const BoardContext = createContext({ boards, setBoardState });

// Every component that calls useContext(BoardContext) re-renders
// when *anything* in the context changes.

function CardTitle({ cardId }) {
  const { boards } = useContext(BoardContext);  // subscribes to ALL board changes
  const title = findCardTitle(boards, cardId);
  return <span>{title}</span>;
}
// CardTitle re-renders when ANY card in ANY list changes,
// even if only a different card's priority changed.
```

**The problem in numbers:** 100 cards, 5 lists. Change one card's priority. All 100 `CardTitle` components re-render. `React.memo` helps but requires careful prop stabilization at every level.

**Context is appropriate for:**
- Authentication state (rarely changes)
- Theme/locale (rarely changes)
- Router (URL-based changes)

---

## Concept: How Zustand Works

Zustand is a small (~1KB) state library built on React hooks. It creates a store outside the React tree and connects components to it via hooks.

**Creating a store:**

```typescript
import { create } from 'zustand';

interface CounterStore {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterStore>((set) => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
  decrement: () => set(state => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));
```

**Using in a component:**

```tsx
function Counter() {
  const count = useCounterStore(state => state.count);
  const increment = useCounterStore(state => state.increment);
  return <button onClick={increment}>{count}</button>;
}
```

The `state => state.count` selector means: this component only re-renders when `count` changes — not when `increment` (a function) changes, not when any other state changes.

**How it differs from Context:**

| | Context | Zustand |
|---|---|---|
| Re-renders | All consumers on any change | Only consumers of changed slice |
| Boilerplate | Provider + createContext | Just `create()` |
| Async actions | Need useEffect in components | Direct in store actions |
| DevTools | Limited | Zustand DevTools middleware |
| Outside React | Not possible | Full access via `store.getState()` |

---

## Step 1 — Install Zustand

```bash
npm install zustand
```

---

## Step 2 — Create the board store

Create `src/store/boardStore.ts`:

```typescript
// src/store/boardStore.ts
// Zustand store for all board state.

import { create } from 'zustand';
import { Board, Card, SortOrder, Priority } from '../types';
import * as boardsApi from '../api/boardsApi';

// ─── State shape ───────────────────────────────────────────────────────────────

interface BoardStore {
  // State
  boards: Board[];
  selectedBoardId: string | null;
  isLoading: boolean;
  error: string | null;
  priorityFilter: Priority | null;
  listSortOrders: Record<string, SortOrder>;
  selectedCard: { card: Card; listId: string } | null;
  undoMessage: { boardId: string; title: string } | null;
  toastError: string | null;

  // Actions — loading
  loadBoards: () => Promise<void>;
  selectBoard: (boardId: string) => void;

  // Actions — boards
  createBoard: (title: string) => Promise<Board | null>;
  renameBoard: (boardId: string, title: string) => Promise<void>;
  deleteBoard: (boardId: string) => void;
  undoDelete: () => void;

  // Actions — cards
  addCard: (listId: string, title: string) => Promise<void>;
  deleteCard: (listId: string, cardId: string) => void;
  moveCard: (cardId: string, fromListId: string, toListId: string) => Promise<void>;
  updateCard: (listId: string, cardId: string, updates: Partial<Card>) => Promise<void>;
  reorderCards: (listId: string, orderedCardIds: string[]) => Promise<void>;

  // Actions — UI state
  setPriorityFilter: (priority: Priority | null) => void;
  setListSortOrder: (listId: string, order: SortOrder) => void;
  openCard: (listId: string, card: Card) => void;
  closeCard: () => void;
  clearError: () => void;
}

// ─── Store definition ──────────────────────────────────────────────────────────

export const useBoardStore = create<BoardStore>((set, get) => ({
  // Initial state
  boards: [],
  selectedBoardId: null,
  isLoading: false,
  error: null,
  priorityFilter: null,
  listSortOrders: {},
  selectedCard: null,
  undoMessage: null,
  toastError: null,

  // ─── Loading ────────────────────────────────────────────────────────────────

  loadBoards: async () => {
    set({ isLoading: true, error: null });
    try {
      const apiBoards = await boardsApi.fetchBoards();
      const boards = apiBoards.map(boardsApi.apiBoardToBoard);
      const selectedBoardId = get().selectedBoardId ?? boards[0]?.id ?? null;
      set({ boards, selectedBoardId, isLoading: false });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to load boards';
      set({ error, isLoading: false });
    }
  },

  selectBoard: (boardId) => set({ selectedBoardId: boardId }),

  // ─── Board CRUD ─────────────────────────────────────────────────────────────

  createBoard: async (title) => {
    try {
      const apiBoard = await boardsApi.createBoard(title);
      const board = boardsApi.apiBoardToBoard(apiBoard);
      set(state => ({
        boards: [...state.boards, board],
        selectedBoardId: board.id,
      }));
      return board;
    } catch (err) {
      set({ toastError: 'Failed to create board' });
      return null;
    }
  },

  renameBoard: async (boardId, title) => {
    // Optimistic
    set(state => ({
      boards: state.boards.map(b =>
        b.id === boardId ? { ...b, title } : b
      ),
    }));
    try {
      await boardsApi.updateBoard(boardId, { title });
    } catch (err) {
      set({ toastError: 'Failed to rename board' });
      // Could rollback here — omitted for brevity
    }
  },

  deleteBoard: (boardId) => {
    const board = get().boards.find(b => b.id === boardId);
    if (!board) return;

    set(state => ({
      boards: state.boards.filter(b => b.id !== boardId),
      selectedBoardId: state.selectedBoardId === boardId
        ? state.boards.find(b => b.id !== boardId)?.id ?? null
        : state.selectedBoardId,
      undoMessage: { boardId, title: board.title },
    }));

    const timeout = setTimeout(async () => {
      set({ undoMessage: null });
      try {
        await boardsApi.deleteBoard(boardId);
      } catch (err) {
        // Too late to undo — show error but board is already gone from UI
        set({ toastError: 'Failed to delete board from server' });
      }
    }, 5000);

    // Store timeout in a ref outside Zustand (Zustand state should be serializable)
    pendingDeleteTimeouts[boardId] = timeout;
  },

  undoDelete: () => {
    const { undoMessage, boards } = get();
    if (!undoMessage) return;

    clearTimeout(pendingDeleteTimeouts[undoMessage.boardId]);
    delete pendingDeleteTimeouts[undoMessage.boardId];

    // Need to restore the board — re-fetch from server is cleanest
    get().loadBoards();
    set({ undoMessage: null });
  },

  // ─── Card CRUD ──────────────────────────────────────────────────────────────

  addCard: async (listId, title) => {
    const tempId = `temp-${Date.now()}`;
    const tempCard: Card = {
      id: tempId,
      title,
      description: '',
      priority: 'LOW',
      createdAt: Date.now(),
    };

    // Optimistic
    set(state => ({
      boards: updateListInBoards(state.boards, state.selectedBoardId, listId, list => ({
        ...list,
        cards: [...list.cards, tempCard],
      })),
    }));

    try {
      const apiCard = await boardsApi.createCard(state.selectedBoardId!, listId, title);
      const newCard = boardsApi.apiCardToCard(apiCard);

      // Replace temp card with real card
      set(state => ({
        boards: updateListInBoards(state.boards, state.selectedBoardId, listId, list => ({
          ...list,
          cards: list.cards.map(c => c.id === tempId ? newCard : c),
        })),
      }));
    } catch (err) {
      // Rollback
      set(state => ({
        boards: updateListInBoards(state.boards, state.selectedBoardId, listId, list => ({
          ...list,
          cards: list.cards.filter(c => c.id !== tempId),
        })),
        toastError: 'Failed to add card',
      }));
    }
  },

  deleteCard: (listId, cardId) => {
    // Immediate remove + API call (no undo for cards)
    set(state => ({
      boards: updateListInBoards(state.boards, state.selectedBoardId, listId, list => ({
        ...list,
        cards: list.cards.filter(c => c.id !== cardId),
      })),
    }));
    boardsApi.deleteCard(state.selectedBoardId!, listId, cardId).catch(() => {
      set({ toastError: 'Failed to delete card' });
    });
  },

  // ... (moveCard, updateCard, reorderCards follow the same optimistic pattern)

  // ─── UI state ───────────────────────────────────────────────────────────────

  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  setListSortOrder: (listId, order) => set(state => ({
    listSortOrders: { ...state.listSortOrders, [listId]: order },
  })),
  openCard: (listId, card) => set({ selectedCard: { card, listId } }),
  closeCard: () => set({ selectedCard: null }),
  clearError: () => set({ toastError: null }),
}));

// ─── Helpers ────────────────────────────────────────────────────────────────────

// Outside Zustand because timeouts are not serializable
const pendingDeleteTimeouts: Record<string, ReturnType<typeof setTimeout>> = {};

function updateListInBoards(
  boards: Board[],
  boardId: string | null,
  listId: string,
  updater: (list: Board['lists'][number]) => Board['lists'][number]
): Board[] {
  if (!boardId) return boards;
  return boards.map(board =>
    board.id !== boardId ? board : {
      ...board,
      lists: board.lists.map(list =>
        list.id !== listId ? list : updater(list)
      ),
    }
  );
}
```

---

## Step 3 — Create derived state selectors

Create `src/store/boardSelectors.ts`:

```typescript
// src/store/boardSelectors.ts
// Selector functions — derive computed state from the store.
// Components use these to subscribe to only the data they need.

import { BoardStore } from './boardStore';
import { sortCards } from '../utils/cardSort';

// Active board (before filters/sort)
export const selectActiveBoard = (state: BoardStore) =>
  state.boards.find(b => b.id === state.selectedBoardId) ?? null;

// Active board with filter + sort applied
export const selectDisplayBoard = (state: BoardStore) => {
  const board = selectActiveBoard(state);
  if (!board) return null;

  // Apply priority filter
  const filtered = state.priorityFilter
    ? {
        ...board,
        lists: board.lists.map(list => ({
          ...list,
          cards: list.cards.filter(c => c.priority === state.priorityFilter),
        })),
      }
    : board;

  // Apply per-list sort
  return {
    ...filtered,
    lists: filtered.lists.map(list => ({
      ...list,
      cards: sortCards(list.cards, state.listSortOrders[list.id] ?? 'MANUAL'),
    })),
  };
};

// Board titles for sidebar (minimal re-renders)
export const selectBoardSummaries = (state: BoardStore) =>
  state.boards.map(b => ({ id: b.id, title: b.title }));
```

---

## Step 4 — Update components to use the store

Update `Sidebar.tsx`:

```tsx
import { useBoardStore } from '../store/boardStore';
import { selectBoardSummaries } from '../store/boardSelectors';

export function Sidebar() {
  // Only re-renders when board titles/IDs change (not card data)
  const boards = useBoardStore(selectBoardSummaries);
  const selectedBoardId = useBoardStore(state => state.selectedBoardId);
  const selectBoard = useBoardStore(state => state.selectBoard);
  const deleteBoard = useBoardStore(state => state.deleteBoard);
  
  // ... same JSX
}
```

Update `BoardPage.tsx`:

```tsx
import { useBoardStore } from '../store/boardStore';
import { selectDisplayBoard } from '../store/boardSelectors';
import { useEffect } from 'react';

export function BoardPage() {
  const { boardId } = useParams();
  const activeBoard = useBoardStore(selectDisplayBoard);
  const isLoading = useBoardStore(state => state.isLoading);
  const loadBoards = useBoardStore(state => state.loadBoards);
  const addCard = useBoardStore(state => state.addCard);
  // ...

  useEffect(() => { loadBoards(); }, [loadBoards]);

  // ... same JSX using store actions
}
```

### SAVE AND TRY

1. Open the app — boards load from server as before
2. Add a card to List 1
3. Open React DevTools Profiler, record, add a card, stop
4. Verify that `Sidebar` does NOT re-render (it subscribes to `selectBoardSummaries` which only includes titles)
5. Verify that lists in other boards don't re-render

---

## 🎯 Challenge: Add `devtools` middleware to the Zustand store

**You know:** Zustand, Redux DevTools browser extension.

**Task:** Install the Redux DevTools browser extension (if not already installed). Add the `devtools` middleware from `zustand/middleware` to the board store so you can see state changes and actions in the Redux DevTools panel.

**Hints:**
```typescript
import { devtools } from 'zustand/middleware';

export const useBoardStore = create<BoardStore>()(
  devtools(
    (set, get) => ({ /* store */ }),
    { name: 'FlowBoard' }
  )
);
```

Note the extra `()` after `create<BoardStore>` — required when using middleware.

---

<details>
<summary>▶ Show Solution</summary>

```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { BoardStore } from './types';

export const useBoardStore = create<BoardStore>()(
  devtools(
    (set, get) => ({
      // ... same store definition
    }),
    {
      name: 'FlowBoard',      // appears as the store name in DevTools
      enabled: import.meta.env.DEV,  // only in development
    }
  )
);
```

You can also name individual actions for the DevTools timeline:
```typescript
set({ selectedBoardId: boardId }, false, 'selectBoard');
//                                ↑ replace  ↑ action name in DevTools
```

**Key insight:** The extra `()` in `create<BoardStore>()` vs `create<BoardStore>` is required by TypeScript when using middleware — this is the "curried" form of `create` that supports the middleware chaining pattern. The middleware wraps `set` to record each state change as a named action. This is invaluable for debugging: you can see exactly which action caused a state change, inspect the before/after state, and even "time travel" by replaying actions.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| Zustand installed | `package.json` includes `zustand` |
| Store created in `src/store/boardStore.ts` | File exists |
| Selectors in `src/store/boardSelectors.ts` | File exists |
| `Sidebar` uses `selectBoardSummaries` | Check Sidebar.tsx imports |
| `Sidebar` doesn't re-render on card add | Profiler shows Sidebar grayed out |
| `BoardPage` uses `selectDisplayBoard` | Check BoardPage.tsx imports |
| Async actions work (load, add, delete) | App functions normally |
| `useBoardState` hook removed | No longer used |
| DevTools middleware added | State changes visible in Redux DevTools |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. Why Context falls short for frequently-changing state:**

React Context re-renders every component that calls `useContext(TargetContext)` whenever the context value changes — regardless of which part of the value changed. If the context value is `{ boards, selectedBoardId, priorityFilter, ... }`, and a single card's priority changes, every single consumer re-renders: the Sidebar, every List, every Card, even components that only use `selectedBoardId`. This leads to the same problem as not using `React.memo` at all. Zustand's selector model — `useStore(state => state.specificThing)` — only re-renders when `specificThing` changes, so the Sidebar only re-renders when the board list changes, not when a card changes.

**2. How selectors help performance:**

A Zustand selector is a function `(state) => T` that extracts the specific slice of state a component needs. Zustand compares the selector's return value before and after a state change using `Object.is`. If the value didn't change, the component doesn't re-render. This means `useBoardStore(state => state.selectedBoardId)` only triggers a re-render when `selectedBoardId` specifically changes. A component subscribing to a derived value (like `selectBoardSummaries`) only re-renders when the board titles/IDs change — not when cards are added.

**3. Zustand vs Redux tradeoffs:**

Redux requires: actions (plain objects with a `type`), reducers (pure functions), and a dispatcher (dispatching actions). This enforces a strict unidirectional data flow and makes state changes traceable. Zustand uses direct `set` calls inside "actions" that are just regular functions in the store. This is less prescriptive and requires much less boilerplate. The tradeoff: Zustand actions are harder to trace (they're function calls, not named action objects), and the DevTools integration (added as middleware) is less detailed by default. Redux's strict pattern is better for large teams where predictability and auditability are paramount; Zustand's flexibility is better for smaller teams and codebases where developer velocity matters more.

---

## Next Lab

In **LAB-31**, you will add **list-level operations** — creating and deleting lists, renaming list titles, and archiving lists. This builds on the Zustand store pattern and introduces a common UX challenge: multi-step interactions that span multiple components.
