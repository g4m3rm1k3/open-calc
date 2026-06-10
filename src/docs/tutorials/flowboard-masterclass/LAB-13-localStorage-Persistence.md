# FlowBoard Masterclass — LAB 13 — Persistence: `localStorage` and `useEffect`

**Prerequisites:** LAB-12 — Card moving. Full board state in `App.tsx`. All board operations working.

**What this lab adds:**
- `useEffect` — running code in response to state changes (or once on mount)
- `localStorage` — browser key/value storage that survives page refresh
- Serialization round-trip — JSON.stringify and JSON.parse, what they preserve and what they don't
- Initializing state from storage
- The `useEffect` dependency array — when effects run

**Time:** 50–65 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. React components are functions that re-run on every render. If `localStorage.setItem` is called in the component body (not inside any handler), what problem would that cause?
> 2. `JSON.stringify({ a: 1, b: new Date() })` produces `'{"a":1,"b":"2024-01-01T00:00:00.000Z"}'`. What do you get back when you `JSON.parse` that? Is `b` a `Date` object or a string?
> 3. What should the app do if it loads and `localStorage` has no saved data — no boards key exists yet?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

Board data persists across page refreshes. Add cards, move them, create new boards — refresh the page — everything is exactly as you left it.

No visible UI change. The test is: make changes, reload the page (`Ctrl+R` / `Cmd+R`), see the same state.

---

## Concept: `useEffect`

**What it is:** `useEffect` is a React hook that runs a side effect after a render. "Side effect" means anything that reaches outside the component — writing to `localStorage`, fetching data from a server, updating the document title, setting up timers.

**Why you cannot put side effects in the component body:**

```tsx
function App() {
  const [boards, setBoards] = useState<Board[]>([...]);

  // BAD — runs on EVERY render, even renders caused by unrelated changes
  localStorage.setItem('boards', JSON.stringify(boards));

  return <div>...</div>;
}
```

The component body runs on every render. Any trivial state change (like typing in an input) triggers a re-render, which triggers the `localStorage.setItem`. This is wasteful — you are re-serializing and writing the full boards array on every keystroke.

`useEffect` gives you control over when the effect runs.

**The syntax:**

```tsx
useEffect(() => {
  // side effect code here
}, [dependency1, dependency2]);
//  ↑ dependency array: effect runs when any of these change
```

**Three forms:**

```tsx
// 1. Run after every render (no dependency array)
useEffect(() => { doSomethingEveryRender(); });

// 2. Run once after the first render only (empty dependency array)
useEffect(() => { doOnMount(); }, []);

// 3. Run after first render AND whenever dependency changes
useEffect(() => { doWhenBoardsChanges(); }, [boards]);
```

For `localStorage` sync, you want form 3: run whenever `boards` changes.

**You will see this again in:** Data fetching (Lab 16), document title updates, setting up and tearing down event listeners, synchronizing with external systems (WebSockets, timers). `useEffect` is the bridge between React's render world and the outside world.

---

## Concept: The Serialization Round-Trip

**What it is:** The process of converting JavaScript data to a string (serialization) for storage, and then converting it back to data (deserialization) for use.

**`JSON.stringify` and `JSON.parse`:**

```ts
const data = { id: 'card-1', title: 'Fix login', createdAt: 1700000000000 };

// Serialization — converts object to string
const stored = JSON.stringify(data);
// stored = '{"id":"card-1","title":"Fix login","createdAt":1700000000000}'

// Deserialization — converts string back to object
const parsed = JSON.parse(stored);
// parsed = { id: 'card-1', title: 'Fix login', createdAt: 1700000000000 }
```

**What JSON does NOT preserve:**

- `Date` objects become strings: `new Date()` → `"2024-01-01T00:00:00.000Z"` — `JSON.parse` gives you a string, not a `Date`
- Functions are dropped: `{ fn: () => {} }` → `{}` after round-trip
- `undefined` values are dropped: `{ a: undefined }` → `{}`
- `Map`, `Set`, `WeakMap` — not preserved

**For FlowBoard:** The `Board`, `List`, `Card` types contain only strings and numbers — the serialization round-trip is lossless. `createdAt: number` (timestamp) survives perfectly. No `Date` objects, no functions. We are safe.

**TypeScript limitation:** `JSON.parse` returns `any`. You need to validate or cast the result. We will use a simple cast — proper runtime validation comes in the API labs.

**You will see this again in:** API responses (JSON from server → TypeScript object), form submissions, any time data crosses a process boundary (browser ↔ localStorage, browser ↔ server). Understanding the serialization round-trip prevents subtle bugs when working with dates, special values, and non-serializable types.

---

## Concept: Initializing State from Storage

**The pattern:**

Instead of a plain initial value, pass a function to `useState`. React calls this function once on mount to get the initial state:

```tsx
const [boards, setBoards] = useState<Board[]>(() => {
  // This function runs ONCE — not on every render
  const stored = localStorage.getItem('boards');
  if (stored) {
    try {
      return JSON.parse(stored) as Board[];
    } catch {
      // Corrupted data — fall back to default
      return INITIAL_BOARDS;
    }
  }
  return INITIAL_BOARDS;
});
```

This is called a **lazy initializer** — the function is only called on the first render. Subsequent renders use the current state, not the initializer.

**Why `try/catch`:** `JSON.parse` throws on invalid JSON. If `localStorage` has corrupted data (from a browser crash, a manual edit, or a previous version of the app), the parse would throw and crash the app. The `try/catch` falls back to the default data gracefully.

---

## Step 1 — Read boards from `localStorage` on startup

Update the `useState` call in `App.tsx` to use a lazy initializer:

```tsx
// App.tsx — updated useState

const STORAGE_KEY = 'flowboard-boards';

const [boards, setBoards] = useState<Board[]>(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Board[];
    }
  } catch {
    // Ignore parse errors — corrupted data falls back to default
  }
  return INITIAL_BOARDS;
});
```

### SAVE AND TRY

Save. The page loads with the default data (nothing in storage yet). Open DevTools → Application → Local Storage → `http://localhost:5173`. The `flowboard-boards` key does not exist yet.

---

## Step 2 — Write boards to `localStorage` whenever they change

Add a `useEffect` to sync `boards` to storage:

```tsx
// App.tsx — add after useState declarations

import { useState, useEffect } from 'react';

// Inside App function:
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
}, [boards]);
// Dependency: [boards] — runs after first render and whenever boards changes
```

### SAVE AND TRY

Save. In the browser:
1. Add a card to any list
2. Open DevTools → Application → Local Storage → `http://localhost:5173`
3. Look for `flowboard-boards` — it should contain the JSON of your boards
4. Now refresh the page (`Ctrl+R` / `Cmd+R`)

**You should see:** The board loads with the card you added. The data survived the refresh!

**Test more operations:** Move a card, create a new board, add cards to the new board. Refresh. Everything is restored.

---

## Step 3 — Also persist the selected board ID

When you reload, the app should remember which board you were looking at. Add storage for `selectedBoardId`:

```tsx
// App.tsx — updated selectedBoardId state

const SELECTED_BOARD_KEY = 'flowboard-selected-board';

const [selectedBoardId, setSelectedBoardId] = useState<string>(() => {
  const stored = localStorage.getItem(SELECTED_BOARD_KEY);
  // Verify the stored ID still exists in boards before using it
  if (stored && boards.some(b => b.id === stored)) {
    return stored;
  }
  // Fall back to first board
  return boards[0]?.id ?? '';
});

// Add a useEffect to sync selectedBoardId:
useEffect(() => {
  localStorage.setItem(SELECTED_BOARD_KEY, selectedBoardId);
}, [selectedBoardId]);
```

Note: `boards.some(b => b.id === stored)` validates that the stored ID still exists. If the board was deleted, we fall back to the first board.

### SAVE AND TRY

Save. Switch to "Team Work", add a card, refresh. The app opens to "Team Work" with the added card.

---

## Step 4 — Add a "Reset to defaults" option for development

During development you will sometimes want to clear storage and start fresh. Add a dev-only reset button:

```tsx
// App.tsx — inside App function

// Only show in development mode
const isDev = import.meta.env.DEV;

function handleReset() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(SELECTED_BOARD_KEY);
  // Reset state directly
  setBoards(INITIAL_BOARDS);
  setSelectedBoardId(INITIAL_BOARDS[0].id);
}

// In JSX, add to header:
{isDev && (
  <button className="dev-reset-btn" onClick={handleReset}>
    Reset
  </button>
)}
```

In `App.css`:
```css
.dev-reset-btn {
  margin-left: auto;   /* push to the right end of the header */
  background: rgba(255,255,255,0.1);
  border: 1px solid rgba(255,255,255,0.3);
  color: rgba(255,255,255,0.7);
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.dev-reset-btn:hover {
  background: rgba(255,255,255,0.2);
}
```

`import.meta.env.DEV` is a Vite-injected boolean: `true` during `npm run dev`, `false` in the built production output. The button only appears in development.

### SAVE AND TRY

Save. A "Reset" button appears in the header. Click it — boards reset to default. Refresh — still at defaults (storage was cleared).

---

## 🎯 Challenge: Detect and handle storage quota exceeded

**You know:** `useEffect`, `localStorage`, `try/catch`

**Task:** `localStorage.setItem` throws a `DOMException` with `name === 'QuotaExceededError'` when the browser's storage limit is reached (~5MB for most browsers). Update the `useEffect` that writes to storage to catch this error and show a warning to the user (a simple `console.warn` is acceptable, but a visible banner in the UI is better).

**Hints:**
- Wrap `localStorage.setItem(...)` in `try/catch`
- The error type is `DOMException`; check `(error as DOMException).name === 'QuotaExceededError'`
- A piece of state `const [storageWarning, setStorageWarning] = useState(false)` can toggle a warning banner
- Clear the warning when it resolves (after a successful write, or when the user dismisses it)

---

<details>
<summary>▶ Show Solution</summary>

```tsx
// App.tsx — updated useEffect

const [storageWarning, setStorageWarning] = useState(false);

useEffect(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
    setStorageWarning(false);  // clear warning on success
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      setStorageWarning(true);
    }
  }
}, [boards]);

// In JSX, before the Board component:
{storageWarning && (
  <div className="storage-warning">
    ⚠ Storage limit reached — changes may not be saved.
    <button onClick={() => setStorageWarning(false)}>×</button>
  </div>
)}
```

**Key insight:** Error handling for side effects belongs in the `useEffect`, not in the event handler that triggered the state change. The event handler's job is to update state. The `useEffect`'s job is to sync that state to storage. If syncing fails, the effect is the right place to respond. This separation keeps each piece of code responsible for one thing.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| Adding a card persists after page refresh | Add card → refresh → card still there |
| Moving a card persists after refresh | Move card → refresh → card in new position |
| Creating a new board persists after refresh | Create board → refresh → board appears in sidebar |
| Selected board is remembered after refresh | Switch to board 2 → refresh → board 2 is active |
| `localStorage` key appears in DevTools | Application → Local Storage → `flowboard-boards` |
| App loads correctly on first visit (no storage) | Clear storage → refresh → default data loads |
| Corrupted storage falls back to defaults | Set `flowboard-boards` to `invalid json` in DevTools → refresh → default data |
| Dev "Reset" button clears storage | Click Reset → refresh → default data |
| `useEffect` has `[boards]` dependency | Check the useEffect call |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. What happens if `localStorage.setItem` is called in the component body?**

It runs on every render. Every keystroke in the "add card" input causes a re-render (the input's `inputValue` state changes). Each re-render would serialize and write the entire boards array to storage. With 10 cards, this might be fast. With 1000 cards across multiple boards, it becomes a performance problem. More importantly, it would also run during renders triggered by unrelated state (like a modal opening). `useEffect` with a `[boards]` dependency only runs when `boards` actually changes — not on every keystroke in a text input.

**2. What does `JSON.parse` give back for a `Date` field?**

A string — `"2024-01-01T00:00:00.000Z"`. `JSON.stringify` converts `Date` to an ISO string. `JSON.parse` does not know that the string represents a date — it gives back a plain string. If your code later calls `.getTime()` on it, it will throw because strings do not have a `getTime` method. This is why the FlowBoard data model uses `createdAt: number` (a Unix timestamp) instead of `createdAt: Date` — numbers survive the JSON round-trip without any special handling.

**3. What should the app do if no saved data exists in localStorage?**

Fall back to the default initial data (`INITIAL_BOARDS`). The `if (stored) { ... }` check handles this: if `localStorage.getItem` returns `null` (key does not exist), the condition is false and the function returns `INITIAL_BOARDS`. This is the new-user experience — they arrive at the app for the first time and see a sensible default board instead of an empty screen.

---

## Next Lab

In **LAB-14**, you will extract the board state logic (reading from storage, saving to storage, all the handlers) into a custom React hook called `useBoardState`. You will learn why custom hooks exist, what the naming convention means, and how separating state logic from UI components makes both easier to understand and test.
