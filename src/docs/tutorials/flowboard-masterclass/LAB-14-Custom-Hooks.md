# FlowBoard Masterclass — LAB 14 — Custom Hooks: Extracting State Logic

**Prerequisites:** LAB-13 — `localStorage` persistence. `App.tsx` has two `useState` calls, two `useEffect` calls, and three handler functions.

**What this lab adds:**
- Custom hooks — what they are and why they exist
- The `use` naming convention and what it enforces
- Extracting state + effects + handlers into `useBoardState`
- The separation of "what data is" from "how data is displayed"
- Testing state logic without any React components

**Time:** 45–55 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. `App.tsx` currently has state logic, localStorage sync, and rendering all in one function. What problem does this cause as the app grows — what becomes harder?
> 2. Custom hooks must start with `use`. Why do you think React enforces this naming convention?
> 3. A custom hook is just a function that calls other hooks. What do you think it can return — just state variables, or also functions?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

No visible UI change. `App.tsx` shrinks significantly. All the state logic moves to `src/hooks/useBoardState.ts`. The test: the app works identically, but `App.tsx` contains only rendering code.

**Before:**

```tsx
// App.tsx — ~80 lines — mixed concerns
function App() {
  const [boards, setBoards] = useState<Board[]>(() => { ...storage logic... });
  const [selectedBoardId, setSelectedBoardId] = useState<string>(() => { ...storage logic... });
  const activeBoard = boards.find(b => b.id === selectedBoardId)!;
  useEffect(() => { localStorage.setItem(...) }, [boards]);
  useEffect(() => { localStorage.setItem(...) }, [selectedBoardId]);
  function handleAddCard(...) { ...boardUtils... }
  function handleDeleteCard(...) { ...boardUtils... }
  function handleMoveCard(...) { ...boardUtils... }
  function handleCreateBoard() { ... }
  function handleReset() { ... }
  return ( ...JSX... )
}
```

**After:**

```tsx
// App.tsx — ~20 lines — only rendering
function App() {
  const { activeBoard, boards, selectedBoardId, ...handlers } = useBoardState();
  return ( ...JSX... )
}
```

---

## Concept: Custom Hooks

**What it is:** A function that calls React hooks (`useState`, `useEffect`, etc.) and returns something useful. It must start with `use` to be recognized by React's hook system.

**The problem they solve:**

As components grow, they accumulate state, effects, and handlers. A component that does authentication, data fetching, error handling, and rendering is hard to read and impossible to test in pieces. Custom hooks extract the non-rendering logic into a separate function, leaving the component responsible only for rendering.

**The `use` prefix rule:**

React enforces that hooks are only called from:
1. React component functions
2. Other hooks (functions starting with `use`)

If you name a function `getBoardState` and call hooks inside it, React's linter will warn you. If you name it `useBoardState`, React knows it follows the hooks rules — and ESLint's `rules-of-hooks` validates it correctly.

The `use` prefix is a contract: "this function uses hooks and must be called following the rules of hooks."

**What a custom hook can return:**

Anything — a single value, an object with multiple values and functions, a tuple. The convention for custom hooks is to return an object when returning multiple things:

```tsx
function useBoardState() {
  // ... state, effects, handlers ...
  return {
    boards,
    activeBoard,
    selectedBoardId,
    handleAddCard,
    handleDeleteCard,
    // etc.
  };
}
```

**You will see this again in:** `useAuth` (authentication state + login/logout functions), `useFetch` (loading/data/error state + refetch function), `useLocalStorage` (get/set with automatic serialization), `useDebounce` (debounced value from raw input). Custom hooks are how the React ecosystem packages reusable stateful logic.

---

## Step 1 — Create `src/hooks/useBoardState.ts`

Create `src/hooks/useBoardState.ts`:

```ts
// useBoardState.ts
// A custom hook that encapsulates all board state management:
// - Reading/writing to localStorage
// - The boards array and selected board ID
// - All board-mutation handlers

import { useState, useEffect } from 'react';
import { Board, Card } from '../types';
import { addCardToList, deleteCardFromList, moveCard } from '../utils/boardUtils';

const STORAGE_KEY = 'flowboard-boards';
const SELECTED_BOARD_KEY = 'flowboard-selected-board';

// Default initial data — used when no storage exists
const INITIAL_BOARDS: Board[] = [
  {
    id: 'board-1',
    title: 'My Project',
    lists: [
      {
        id: 'list-todo',
        title: 'To Do',
        cards: [
          { id: 'card-1', title: 'Fix login button', description: 'Does not respond on mobile.', createdAt: Date.now() },
          { id: 'card-2', title: 'Update homepage hero', description: 'New design in Figma.', createdAt: Date.now() },
        ],
      },
      {
        id: 'list-in-progress',
        title: 'In Progress',
        cards: [
          { id: 'card-4', title: 'Design new dashboard', description: 'Working with design team.', createdAt: Date.now() },
        ],
      },
      {
        id: 'list-done',
        title: 'Done',
        cards: [],
      },
    ],
  },
  {
    id: 'board-2',
    title: 'Team Work',
    lists: [
      { id: 'list-team-todo', title: 'Backlog', cards: [
        { id: 'card-10', title: 'Define sprint goals', description: 'Q3 planning session.', createdAt: Date.now() },
      ]},
      { id: 'list-team-in-progress', title: 'In Progress', cards: [] },
      { id: 'list-team-done', title: 'Done', cards: [] },
    ],
  },
];

export function useBoardState() {
  // --- State ---

  const [boards, setBoards] = useState<Board[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored) as Board[];
    } catch { /* corrupted storage — use defaults */ }
    return INITIAL_BOARDS;
  });

  const [selectedBoardId, setSelectedBoardId] = useState<string>(() => {
    const stored = localStorage.getItem(SELECTED_BOARD_KEY);
    if (stored && boards.some(b => b.id === stored)) return stored;
    return boards[0]?.id ?? '';
  });

  // --- Derived state ---
  // activeBoard is not stored separately — always derived from boards + selectedBoardId
  const activeBoard = boards.find(b => b.id === selectedBoardId)!;

  // --- Effects: sync to localStorage ---

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('FlowBoard: localStorage quota exceeded — changes not saved');
      }
    }
  }, [boards]);

  useEffect(() => {
    localStorage.setItem(SELECTED_BOARD_KEY, selectedBoardId);
  }, [selectedBoardId]);

  // --- Handlers ---

  function handleAddCard(listId: string, cardTitle: string): void {
    const newCard: Card = {
      id: `card-${Date.now()}`,
      title: cardTitle,
      description: '',
      createdAt: Date.now(),
    };
    setBoards(prev => prev.map(board => {
      if (board.id !== selectedBoardId) return board;
      return { ...board, lists: addCardToList(board.lists, listId, newCard) };
    }));
  }

  function handleDeleteCard(listId: string, cardId: string): void {
    setBoards(prev => prev.map(board => {
      if (board.id !== selectedBoardId) return board;
      return { ...board, lists: deleteCardFromList(board.lists, listId, cardId) };
    }));
  }

  function handleMoveCard(cardId: string, fromListId: string, toListId: string): void {
    setBoards(prev => prev.map(board => {
      if (board.id !== selectedBoardId) return board;
      return { ...board, lists: moveCard(board.lists, cardId, fromListId, toListId) };
    }));
  }

  function handleCreateBoard(): void {
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      title: `New Board ${boards.length + 1}`,
      lists: [
        { id: `list-${Date.now()}-todo`, title: 'To Do', cards: [] },
        { id: `list-${Date.now()}-done`, title: 'Done', cards: [] },
      ],
    };
    setBoards(prev => [...prev, newBoard]);
    setSelectedBoardId(newBoard.id);
  }

  function handleReset(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(SELECTED_BOARD_KEY);
    setBoards(INITIAL_BOARDS);
    setSelectedBoardId(INITIAL_BOARDS[0].id);
  }

  function handleSelectBoard(boardId: string): void {
    setSelectedBoardId(boardId);
  }

  function handleRenameBoard(boardId: string, newTitle: string): void {
    setBoards(prev => prev.map(board =>
      board.id === boardId ? { ...board, title: newTitle } : board
    ));
  }

  // --- Return ---
  // Return everything the component needs — state values and handlers
  return {
    boards,
    activeBoard,
    selectedBoardId,
    handleAddCard,
    handleDeleteCard,
    handleMoveCard,
    handleCreateBoard,
    handleReset,
    handleSelectBoard,
    handleRenameBoard,
  };
}
```

---

## Step 2 — Simplify `App.tsx`

Replace all the state and handler logic with a single hook call:

```tsx
// App.tsx — full file after refactor

import { Board as BoardComponent } from './components/Board';
import { Sidebar } from './components/Sidebar';
import { useBoardState } from './hooks/useBoardState';
import './App.css';

function App() {
  const {
    boards,
    activeBoard,
    selectedBoardId,
    handleAddCard,
    handleDeleteCard,
    handleMoveCard,
    handleCreateBoard,
    handleReset,
    handleSelectBoard,
    handleRenameBoard,
  } = useBoardState();

  const isDev = import.meta.env.DEV;

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-name">FlowBoard</span>
        <span className="board-title-text">{activeBoard.title}</span>
        {isDev && (
          <button className="dev-reset-btn" onClick={handleReset}>
            Reset
          </button>
        )}
      </header>

      <div className="app-body">
        <Sidebar
          boards={boards}
          selectedBoardId={selectedBoardId}
          onSelectBoard={handleSelectBoard}
          onCreateBoard={handleCreateBoard}
          onRenameBoard={handleRenameBoard}
        />

        <BoardComponent
          id={activeBoard.id}
          title={activeBoard.title}
          lists={activeBoard.lists}
          onAddCard={handleAddCard}
          onDeleteCard={handleDeleteCard}
          onMoveCard={handleMoveCard}
        />
      </div>
    </div>
  );
}

export default App;
```

`App.tsx` now has one job: rendering. The hook has one job: state management. Each is readable in isolation.

### SAVE AND TRY

Save. Fix any TypeScript errors. In the browser, verify:
- All boards visible in sidebar
- Adding, deleting, moving cards work
- Refresh — state persists
- Reset button clears storage

---

## Step 3 — Observe the separation benefit

Open `useBoardState.ts`. Notice what it contains:
- State declarations
- Storage read/write effects
- Business logic handlers

Open `App.tsx`. Notice what it contains:
- One hook call
- JSX

Neither file needs to know the internal details of the other. If you need to change how storage works (e.g., switch from localStorage to IndexedDB), you change `useBoardState.ts`. If you need to change the UI layout, you change `App.tsx`. No changes bleed between the two files.

This is the **Single Responsibility Principle** — each module has one reason to change.

---

## 🎯 Challenge: Create a generic `useLocalStorage` hook

**You know:** Custom hooks, `useState` with lazy initializer, `useEffect`

**Task:** Create `src/hooks/useLocalStorage.ts` that exports a generic `useLocalStorage<T>` hook. It should work like `useState` but automatically read from and write to a storage key:

```tsx
// Usage:
const [boards, setBoards] = useLocalStorage<Board[]>('flowboard-boards', INITIAL_BOARDS);
// 'boards' is read from storage on first render (or falls back to INITIAL_BOARDS)
// Calling setBoards updates both React state and localStorage automatically
```

Then refactor `useBoardState.ts` to use `useLocalStorage` for both `boards` and `selectedBoardId`.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// src/hooks/useLocalStorage.ts

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item) return JSON.parse(item) as T;
    } catch { /* ignore */ }
    return initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`useLocalStorage: could not save key "${key}"`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
}
```

In `useBoardState.ts`, replace:
```ts
const [boards, setBoards] = useState<Board[]>(() => { ...storage logic... });
// useEffect for boards sync
```

With:
```ts
import { useLocalStorage } from './useLocalStorage';
const [boards, setBoards] = useLocalStorage<Board[]>(STORAGE_KEY, INITIAL_BOARDS);
// useEffect for boards removed — handled by useLocalStorage
```

**Key insight:** `useLocalStorage` is a hook that abstracts a specific pattern: "a piece of state that is always synchronized with a storage key." Once extracted, it can be used anywhere in the app — settings, user preferences, UI state. The generic `<T>` type parameter makes it work with any serializable type without losing TypeScript safety. This is a real-world hook that appears in popular libraries like `usehooks-ts` and `react-use`.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| `src/hooks/useBoardState.ts` exists | VS Code Explorer |
| `App.tsx` has zero `useState` / `useEffect` calls | Search in App.tsx |
| All board operations still work | Test add, delete, move interactively |
| Persistence still works | Refresh page — state preserved |
| `useBoardState` returns all handlers | Check the return statement |
| TypeScript types for the return value are correct | Hover over destructured values in App.tsx — types correct |
| No TypeScript errors | Problems panel clean |
| No console errors | Browser Console clean |

---

## Quick Check Answers

**1. What becomes harder as App.tsx grows with mixed concerns?**

Multiple things. Reading — to understand the rendering, you must mentally skip over state logic, and vice versa. Testing — to test a handler function, you must render the full component (which requires a DOM). Reusing — if another component needs similar state logic, you either duplicate it or tangle the two components together. Finding the right place to make a change — "where does `handleMoveCard` live?" becomes a search problem in a 200-line file. Custom hooks solve all of these: the hook is readable in isolation, testable without a DOM, reusable in any component, and easy to find.

**2. Why does React enforce the `use` naming convention?**

Because React's hooks rules (hooks can only be called at the top level of a component or another hook — not inside conditions or loops) must be validated statically. The ESLint `eslint-plugin-react-hooks` plugin checks these rules. To know which functions are hooks and which are regular functions, it uses the `use` prefix as a reliable signal. Without this convention, the linter cannot know whether `getBoardState` contains hooks and whether calling it inside a condition is safe. The convention makes the rules checkable.

**3. Can custom hooks return functions as well as state?**

Yes — they can return anything. The most common pattern is returning an object with state values and handler functions together, as in `useBoardState`. The hook is the "interface" to a piece of behavior: it says "here is the data you can read, and here are the actions you can take." The component that uses it does not need to know how any of it works internally.

---

## Next Lab

In **LAB-15**, you will build the backend. A Python FastAPI server will run alongside Vite. You will install Python dependencies, write your first route, and make the browser fetch a response from your own server. This introduces the HTTP request/response cycle, `async/await`, and the fundamental architecture of a client-server app.
