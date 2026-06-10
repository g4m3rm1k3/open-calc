# FlowBoard Masterclass — LAB 16 — Fetching Real Data: `useEffect` for Data Fetching

**Prerequisites:** LAB-15 — FastAPI running on port 8000 with `/api/ping`.

**What this lab adds:**
- `useEffect` for data fetching — the canonical pattern
- Loading state — showing a spinner while data arrives
- REST (Representational State Transfer) — what makes an API "RESTful"
- JSON response contracts — agreeing on shapes between frontend and backend
- The `/api/boards` GET endpoint
- Replacing `localStorage` initialization with a server fetch

**Time:** 65–80 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Data fetching in `useEffect` has a well-known problem: the component might unmount before the fetch completes, causing a "can't set state on unmounted component" warning. What do you think the fix looks like?
> 2. While the boards are loading from the server, what should the UI show? What are the trade-offs between a spinner, a skeleton, and nothing?
> 3. REST APIs use URLs to identify resources. `/api/boards` returns all boards. What URL would you expect for a single board with ID `board-1`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The boards endpoint serves data. The frontend fetches it on load. While loading, the UI shows a spinner. Once loaded, the board appears and works exactly as before — but the data now comes from the server.

```
Browser (startup)               Server
      │                              │
      │  GET /api/boards             │
      │ ─────────────────────────→   │
      │                              │
      │  (spinner shown)             │
      │                              │
      │  200 OK                      │
      │  [board1, board2]            │
      │ ←─────────────────────────   │
      │                              │
      │  (spinner hidden)            │
      │  (boards rendered)           │
```

---

## Concept: REST — Representational State Transfer

**What it is:** An architectural style for web APIs. RESTful APIs use:
- URLs to identify resources (nouns: `/boards`, `/boards/123/cards`)
- HTTP methods for operations (verbs: GET = read, POST = create, PUT/PATCH = update, DELETE = remove)
- Stateless requests — each request contains all needed info; the server does not remember previous requests
- JSON as the data format

**The FlowBoard REST conventions:**

| Action | Method | Path | Body |
|---|---|---|---|
| Get all boards | `GET` | `/api/boards` | — |
| Get one board | `GET` | `/api/boards/{id}` | — |
| Create a board | `POST` | `/api/boards` | `{ title: string }` |
| Update a board | `PATCH` | `/api/boards/{id}` | `{ title?: string }` |
| Delete a board | `DELETE` | `/api/boards/{id}` | — |
| Add a card | `POST` | `/api/boards/{boardId}/lists/{listId}/cards` | `{ title, description }` |

The pattern: collections at `/resource`, items at `/resource/{id}`, nested resources with full paths.

**You will see this again in:** Every web API. GitHub, Stripe, Twitter, any "developer API" follows these conventions. Knowing REST means you can use any API with minimal documentation.

---

## Concept: `useEffect` for Data Fetching — The Pattern

**The canonical pattern:**

```tsx
const [data, setData] = useState<Board[] | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  let cancelled = false;  // ← the cancellation flag

  async function fetchData() {
    try {
      const response = await fetch('http://localhost:8000/api/boards');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      if (!cancelled) setData(json);       // ← only update if still mounted
    } catch (err) {
      if (!cancelled) setError(String(err));
    } finally {
      if (!cancelled) setLoading(false);
    }
  }

  fetchData();

  // Cleanup function — runs when the component unmounts or effect re-runs
  return () => { cancelled = true; };
}, []);
```

**The three states you always need:**
- `loading` — show a spinner
- `data` — show the content
- `error` — show an error message

These three cover all possible states of an async operation. Code that only handles `data` will show stale content or an empty screen during loading and hide errors silently.

**The cancellation pattern:**

When a component unmounts while a fetch is in-flight, the fetch still completes. When it does, it tries to call `setData` — but the component is gone. React will warn: "Can't perform a React state update on an unmounted component."

The `cancelled` flag prevents this: the cleanup function sets `cancelled = true`. The `if (!cancelled)` checks prevent state updates after unmount.

**You will see this again in:** Every data-fetching hook in the app. Lab 16 introduces the raw pattern; Lab 37 will replace it with `useMemo`/`useCallback` optimizations; future labs will use dedicated fetching libraries like React Query that wrap this pattern.

---

## Step 1 — Build the `/api/boards` endpoint

Update `backend/main.py` to serve boards data:

```python
# backend/main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import uuid

app = FastAPI(title="FlowBoard API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Pydantic models --- 
# Pydantic validates request and response data automatically.
# These models describe the shapes of data the API accepts and returns.

class CardData(BaseModel):
    id: str
    title: str
    description: str
    createdAt: int  # Unix timestamp in milliseconds

class ListData(BaseModel):
    id: str
    title: str
    cards: list[CardData]

class BoardData(BaseModel):
    id: str
    title: str
    lists: list[ListData]

class CreateBoardRequest(BaseModel):
    title: str


# --- In-memory data store ---
# For now, boards are stored in a Python list.
# Lab 19 will replace this with a real database.

INITIAL_BOARDS: list[dict] = [
    {
        "id": "board-1",
        "title": "My Project",
        "lists": [
            {
                "id": "list-todo",
                "title": "To Do",
                "cards": [
                    {"id": "card-1", "title": "Fix login button", "description": "Does not respond on mobile.", "createdAt": 1700000000000},
                    {"id": "card-2", "title": "Update homepage hero", "description": "New design in Figma.", "createdAt": 1700000000000},
                ]
            },
            {
                "id": "list-in-progress",
                "title": "In Progress",
                "cards": [
                    {"id": "card-4", "title": "Design new dashboard", "description": "Working with design team.", "createdAt": 1700000000000},
                ]
            },
            {
                "id": "list-done",
                "title": "Done",
                "cards": []
            }
        ]
    },
    {
        "id": "board-2",
        "title": "Team Work",
        "lists": [
            {"id": "list-team-todo", "title": "Backlog", "cards": [
                {"id": "card-10", "title": "Define sprint goals", "description": "Q3 planning.", "createdAt": 1700000000000}
            ]},
            {"id": "list-team-in-progress", "title": "In Progress", "cards": []},
            {"id": "list-team-done", "title": "Done", "cards": []}
        ]
    }
]

# boards is the in-memory store — starts with the initial data
boards: list[dict] = INITIAL_BOARDS.copy()


# --- Routes ---

@app.get("/api/ping")
async def ping():
    return {"message": "pong", "version": "0.1.0"}


@app.get("/api/boards", response_model=list[BoardData])
async def get_boards():
    """Return all boards."""
    return boards


@app.post("/api/boards", response_model=BoardData, status_code=201)
async def create_board(request: CreateBoardRequest):
    """Create a new board with default lists."""
    new_board = {
        "id": f"board-{uuid.uuid4().hex[:8]}",
        "title": request.title,
        "lists": [
            {"id": f"list-{uuid.uuid4().hex[:8]}", "title": "To Do", "cards": []},
            {"id": f"list-{uuid.uuid4().hex[:8]}", "title": "Done", "cards": []},
        ]
    }
    boards.append(new_board)
    return new_board
```

**Note:** `uuid.uuid4().hex[:8]` generates a random 8-character hex string for IDs — more robust than `Date.now()` from JavaScript because IDs come from the server now.

### SAVE AND TRY

The backend reloads automatically (`--reload` flag). Visit `http://localhost:8000/api/boards`. You should see the full boards JSON array.

Visit `http://localhost:8000/docs` — the `/api/boards` GET and POST endpoints appear with full documentation.

---

## Step 2 — Create TypeScript types for API responses

Create `src/api/types.ts` — TypeScript types that match the API's response shapes:

```ts
// src/api/types.ts
// These types describe what the API returns.
// They should always match the Pydantic models in backend/main.py.

export interface ApiCard {
  id: string;
  title: string;
  description: string;
  createdAt: number;
}

export interface ApiList {
  id: string;
  title: string;
  cards: ApiCard[];
}

export interface ApiBoard {
  id: string;
  title: string;
  lists: ApiList[];
}
```

Notice these are identical to the `Card`, `List`, `Board` types in `src/types.ts`. That is intentional — right now the API and the app share the same shape. They may diverge in later labs (e.g., the API may return `camelCase` but the database uses `snake_case`). Having separate files makes future divergence manageable.

---

## Step 3 — Create an API client module

Create `src/api/boardsApi.ts`:

```ts
// src/api/boardsApi.ts
// Functions for communicating with the backend boards API.
// All network logic lives here — components never call fetch directly.

import { ApiBoard } from './types';

const API_BASE = 'http://localhost:8000';

export async function fetchBoards(): Promise<ApiBoard[]> {
  const response = await fetch(`${API_BASE}/api/boards`);
  if (!response.ok) {
    throw new Error(`Failed to fetch boards: HTTP ${response.status}`);
  }
  return response.json() as Promise<ApiBoard[]>;
}

export async function createBoard(title: string): Promise<ApiBoard> {
  const response = await fetch(`${API_BASE}/api/boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create board: HTTP ${response.status}`);
  }
  return response.json() as Promise<ApiBoard>;
}
```

Having all fetch calls in one module means:
- You change the base URL in one place
- You add auth headers in one place (Lab 21)
- Unit tests mock one module

---

## Step 4 — Update `useBoardState` to fetch from the server

Update `src/hooks/useBoardState.ts` to load boards from the API instead of localStorage:

```ts
// useBoardState.ts — updated for server-side data

import { useState, useEffect } from 'react';
import { Board, Card } from '../types';
import { addCardToList, deleteCardFromList, moveCard } from '../utils/boardUtils';
import { fetchBoards, createBoard } from '../api/boardsApi';
import { ApiBoard } from '../api/types';

// Convert API board to the local Board type
// Right now they are identical — but this mapper is the right place 
// to handle any future differences between API shape and UI shape.
function apiToBoard(api: ApiBoard): Board {
  return api as Board;
}

export function useBoardState() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch boards on mount ---
  useEffect(() => {
    let cancelled = false;

    async function loadBoards() {
      try {
        const apiBoards = await fetchBoards();
        if (cancelled) return;
        const mapped = apiBoards.map(apiToBoard);
        setBoards(mapped);
        setSelectedBoardId(mapped[0]?.id ?? '');
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBoards();
    return () => { cancelled = true; };
  }, []); // Run once on mount

  // activeBoard: derived, not stored
  const activeBoard = boards.find(b => b.id === selectedBoardId) ?? null;

  // --- Handlers (still updating local state for now) ---
  // In Lab 17, these handlers will also POST/PATCH/DELETE to the API.
  // For now, the server only serves the initial data — local mutations are still
  // local to this session (not persisted between refreshes).

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

  async function handleCreateBoard(): Promise<void> {
    try {
      const title = `New Board ${boards.length + 1}`;
      const apiBoard = await createBoard(title);
      const newBoard = apiToBoard(apiBoard);
      setBoards(prev => [...prev, newBoard]);
      setSelectedBoardId(newBoard.id);
    } catch (err) {
      console.error('Failed to create board:', err);
    }
  }

  function handleSelectBoard(boardId: string): void {
    setSelectedBoardId(boardId);
  }

  function handleRenameBoard(boardId: string, newTitle: string): void {
    setBoards(prev => prev.map(board =>
      board.id === boardId ? { ...board, title: newTitle } : board
    ));
  }

  return {
    boards,
    activeBoard,
    selectedBoardId,
    loading,
    error,
    handleAddCard,
    handleDeleteCard,
    handleMoveCard,
    handleCreateBoard,
    handleSelectBoard,
    handleRenameBoard,
  };
}
```

---

## Step 5 — Update `App.tsx` to handle loading and error states

```tsx
// App.tsx — updated to handle loading/error

function App() {
  const {
    boards,
    activeBoard,
    selectedBoardId,
    loading,
    error,
    handleAddCard,
    handleDeleteCard,
    handleMoveCard,
    handleCreateBoard,
    handleSelectBoard,
    handleRenameBoard,
  } = useBoardState();

  const isDev = import.meta.env.DEV;

  // Loading state
  if (loading) {
    return (
      <div className="app-layout">
        <header className="app-header">
          <span className="app-name">FlowBoard</span>
        </header>
        <div className="app-loading">
          <p>Loading boards...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="app-layout">
        <header className="app-header">
          <span className="app-name">FlowBoard</span>
        </header>
        <div className="app-error">
          <p>Could not connect to server.</p>
          <p className="error-detail">{error}</p>
          <p>Is the backend running? Start it with: <code>uvicorn main:app --reload</code></p>
        </div>
      </div>
    );
  }

  // Main app — activeBoard is guaranteed non-null here (boards loaded successfully)
  if (!activeBoard) return null;

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-name">FlowBoard</span>
        <span className="board-title-text">{activeBoard.title}</span>
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
```

Add loading/error styles to `App.css`:

```css
.app-loading,
.app-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #4a5568;
  gap: 8px;
}

.error-detail {
  font-size: 12px;
  color: #e53e3e;
  font-family: monospace;
}

.app-error code {
  background: #edf2f7;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}
```

### SAVE AND TRY

Save. With the backend running:

1. Refresh the page — see "Loading boards..." briefly, then the boards appear
2. The boards come from the server — "My Project" and "Team Work" with their initial cards

**Test offline error state:** Stop the backend. Refresh the page. You should see the error state with the help message. Start the backend and refresh again — normal operation returns.

---

## 🎯 Challenge: Add a loading skeleton instead of "Loading boards..."

**You know:** Conditional rendering, CSS animations, the loading state

**Task:** Instead of "Loading boards...", show a skeleton version of the layout — a dark sidebar with grey placeholder bars, and a board area with two grey placeholder columns. Use CSS `@keyframes` animation to make the placeholder bars "shimmer."

**Hints:**
- The skeleton is just `<div>` elements with grey backgrounds and rounded corners
- CSS `@keyframes` for shimmer: animate `background-position` on a gradient
- `animation: shimmer 1.5s infinite` on skeleton elements

---

<details>
<summary>▶ Show Solution</summary>

Create `src/components/LoadingSkeleton.tsx`:
```tsx
import './LoadingSkeleton.css';

export function LoadingSkeleton() {
  return (
    <div className="skeleton-layout">
      <div className="skeleton-sidebar">
        <div className="skeleton-bar skeleton-bar--short" />
        <div className="skeleton-bar" />
        <div className="skeleton-bar" />
      </div>
      <div className="skeleton-board">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton-column">
            <div className="skeleton-bar skeleton-bar--title" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

Create `src/components/LoadingSkeleton.css`:
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton-bar,
.skeleton-card {
  background: linear-gradient(90deg, #e2e8f0 25%, #edf2f7 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

.skeleton-layout { display: flex; height: calc(100vh - 52px); }
.skeleton-sidebar { width: 220px; background: #2d3748; padding: 16px 8px; display: flex; flex-direction: column; gap: 10px; }
.skeleton-bar { height: 14px; }
.skeleton-bar--short { width: 60%; }
.skeleton-bar--title { height: 16px; margin-bottom: 8px; }
.skeleton-board { display: flex; gap: 12px; padding: 20px 24px; flex: 1; }
.skeleton-column { width: 260px; background: #edf2f7; border-radius: 12px; padding: 12px; display: flex; flex-direction: column; gap: 8px; }
.skeleton-card { height: 60px; }
```

In `App.tsx`, replace the loading div with `<LoadingSkeleton />`.

**Key insight:** A skeleton loader shows the shape of the content before it arrives. Users perceive skeleton screens as faster than spinners because the layout does not "jump" — it transitions smoothly from skeleton to real content. The shimmer animation communicates "loading in progress" without requiring a spinner icon.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| `GET /api/boards` returns JSON array | `http://localhost:8000/api/boards` in browser |
| `POST /api/boards` creates a board | Try in `/docs` Swagger UI |
| Frontend shows loading state on startup | Brief "Loading boards..." before boards appear |
| Frontend shows error state when server is down | Stop server → refresh → error message |
| Boards load from server (not localStorage) | Check: no `flowboard-boards` key in localStorage |
| `src/api/boardsApi.ts` exists | VS Code Explorer |
| `src/api/types.ts` exists with API types | VS Code Explorer |
| Cancellation flag prevents state update after unmount | Check useEffect in useBoardState |
| No TypeScript errors | Problems panel clean |
| No console errors (with server running) | Browser Console clean |

---

## Quick Check Answers

**1. What is the fix for the "state update on unmounted component" problem?**

A cancellation flag: a `let cancelled = false` variable declared before the async function, set to `true` in the cleanup function `return () => { cancelled = true; }`. Every `setState` call inside the async function checks `if (!cancelled)` before executing. This is the standard React pattern before libraries like React Query automated it. The cleanup function runs when the component unmounts or before the effect re-runs.

**2. Spinner vs skeleton vs nothing — the trade-offs:**

Nothing: bad. The user sees a blank screen and does not know if the app is working. Spinner: acceptable. Communicates "loading is happening." But the layout jumps when content arrives — the page goes from spinner (tiny) to full layout (large). Skeleton: best. Shows the shape of the upcoming content. When real content arrives, the layout is already in place — minimal visual jump. The skeleton also implicitly communicates what kind of content is loading (columns, cards) rather than just "something is happening."

**3. What URL pattern for a single board?**

`/api/boards/board-1` — the collection path plus the specific item's ID. This is the REST convention: `/api/boards` for the collection, `/api/boards/{id}` for an individual item. The `{id}` is a path parameter — FastAPI routes it as `@app.get("/api/boards/{board_id}")`.

---

## Next Lab

In **LAB-17**, you will wire up the add-card operation to POST to the API. Cards will be created on the server and returned with server-generated IDs. You will learn about request bodies, the HTTP POST method, optimistic UI updates — showing the card immediately while the server request is in-flight — and how to handle API errors gracefully.
