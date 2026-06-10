# FlowBoard Masterclass — LAB 22 — React Router: Pages and Protected Routes

**Prerequisites:** LAB-21 — Authentication works. Login/register form. JWT stored in localStorage.

**What this lab adds:**
- React Router v6 — client-side routing in a single-page app
- Routes — mapping URLs to components
- `useNavigate` — programmatic navigation
- `useParams` — reading URL parameters
- Protected routes — redirect to login if not authenticated
- URL-based board selection — `/boards/:boardId` as a URL

**Time:** 70–85 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. FlowBoard is a Single Page Application — there is only one HTML file. When the URL changes from `/boards/board-1` to `/boards/board-2`, the server is not involved. What in the browser handles this change?
> 2. A user bookmarks `/boards/my-project-board`. They share the link with a colleague who is not logged in. What should happen when the colleague opens the URL?
> 3. `useParams()` reads URL path parameters. Given the route `/boards/:boardId`, what does `useParams()` return when the URL is `/boards/board-abc-123`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The app gains real URLs:
- `/` — redirects to `/boards` (or `/login` if not authenticated)
- `/login` — the login/register form
- `/boards` — the boards list (redirects to first board or create board prompt)
- `/boards/:boardId` — a specific board by ID

Navigating between boards updates the URL. The back button works. Sharing a URL opens that specific board.

---

## Concept: Client-Side Routing

**How routing works in SPAs:**

When you visit `https://flowboard.app/boards/board-1`, the browser loads `index.html` — the same HTML file for every URL. React Router intercepts URL changes and renders the appropriate component without a server round-trip.

There are two history mechanisms:
- **Hash routing:** `/#/boards/board-1` — the `#` part is never sent to the server. Works everywhere but ugly URLs.
- **Browser history:** `/boards/board-1` — real URLs. Requires the server to serve `index.html` for all paths (or you get 404 on refresh). This is what we'll use.

**The component hierarchy:**

```tsx
<BrowserRouter>          // watches URL changes
  <Routes>               // matches URL to route
    <Route path="/login" element={<LoginPage />} />
    <Route path="/boards/:boardId" element={<BoardPage />} />
  </Routes>
</BrowserRouter>
```

**You will see this again in:** Every multi-page React app. React Router is the standard routing library for React.

---

## Concept: Protected Routes

A "protected route" is a route that requires authentication. If the user is not logged in, they are redirected to the login page.

**The pattern:**

```tsx
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuthContext();
  
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}

// Usage:
<Route path="/boards/:boardId" element={
  <ProtectedRoute>
    <BoardPage />
  </ProtectedRoute>
} />
```

`<Navigate to="/login" replace />` performs a redirect. `replace` replaces the history entry (so the back button doesn't loop back to the protected page).

---

## Step 1 — Install React Router

```powershell
# In the flowbard/ frontend directory:
npm install react-router-dom
```

---

## Step 2 — Create the route structure

Update `main.tsx`:

```tsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
```

Create `src/components/ProtectedRoute.tsx`:

```tsx
// src/components/ProtectedRoute.tsx

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

---

## Step 3 — Rewrite `App.tsx` with routes

```tsx
// App.tsx — route-based layout

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './components/AuthPage';
import { BoardPage } from './pages/BoardPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuthContext } from './context/AuthContext';
import './App.css';

function App() {
  const { user } = useAuthContext();

  return (
    <Routes>
      {/* Public route: login */}
      <Route
        path="/login"
        element={user ? <Navigate to="/boards" replace /> : <AuthPage />}
      />

      {/* Protected route: board view */}
      <Route
        path="/boards/:boardId"
        element={
          <ProtectedRoute>
            <BoardPage />
          </ProtectedRoute>
        }
      />

      {/* Protected route: boards root — redirect to first board */}
      <Route
        path="/boards"
        element={
          <ProtectedRoute>
            <BoardsRedirect />
          </ProtectedRoute>
        }
      />

      {/* Catch-all: redirect to /boards */}
      <Route path="*" element={<Navigate to="/boards" replace />} />
    </Routes>
  );
}

// Redirect from /boards to /boards/:firstBoardId
// (or show "create your first board" if no boards exist)
function BoardsRedirect() {
  const { boards, loading } = useBoardStateForRedirect();

  if (loading) return null;

  if (boards.length > 0) {
    return <Navigate to={`/boards/${boards[0].id}`} replace />;
  }

  // No boards — show the create prompt
  return <Navigate to="/boards/new" replace />;
}

export default App;
```

---

## Step 4 — Create the `BoardPage`

Create `src/pages/BoardPage.tsx`:

```tsx
// src/pages/BoardPage.tsx

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Board as BoardComponent } from '../components/Board';
import { Sidebar } from '../components/Sidebar';
import { useAuthContext } from '../context/AuthContext';
import { useBoardState } from '../hooks/useBoardState';
import '../App.css';

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const {
    boards,
    activeBoard,
    loading,
    error,
    handleAddCard,
    handleDeleteCard,
    handleMoveCard,
    handleCreateBoard,
    handleRenameBoard,
    toastError,
  } = useBoardState(boardId!);  // boardId from URL

  // Auto-logout on 401
  useEffect(() => {
    if (error?.includes('UNAUTHORIZED')) {
      logout();
    }
  }, [error, logout]);

  // Navigate to first board if current boardId is invalid
  useEffect(() => {
    if (!loading && !error && !activeBoard && boards.length > 0) {
      navigate(`/boards/${boards[0].id}`, { replace: true });
    }
  }, [loading, error, activeBoard, boards, navigate]);

  function handleSelectBoard(id: string) {
    navigate(`/boards/${id}`);
  }

  async function handleCreateNewBoard() {
    const newBoard = await handleCreateBoard();
    if (newBoard) {
      navigate(`/boards/${newBoard.id}`);
    }
  }

  if (loading) {
    return (
      <div className="app-layout">
        <header className="app-header"><span className="app-name">FlowBoard</span></header>
        <div className="app-loading"><p>Loading...</p></div>
      </div>
    );
  }

  if (error && !error.includes('UNAUTHORIZED')) {
    return (
      <div className="app-layout">
        <header className="app-header"><span className="app-name">FlowBoard</span></header>
        <div className="app-error">
          <p>Could not connect to server.</p>
          <p>Is the backend running? <code>uvicorn main:app --reload</code></p>
        </div>
      </div>
    );
  }

  if (!activeBoard) return null;

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-name">FlowBoard</span>
        <span className="board-title-text">{activeBoard.title}</span>
        <div className="header-actions">
          <span className="header-username">{user?.username}</span>
          <button className="header-logout-btn" onClick={logout}>Log out</button>
        </div>
      </header>

      <div className="app-body">
        <Sidebar
          boards={boards}
          selectedBoardId={boardId!}
          onSelectBoard={handleSelectBoard}
          onCreateBoard={handleCreateNewBoard}
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

      {toastError && <div className="toast-error" role="alert">{toastError}</div>}
    </div>
  );
}
```

---

## Step 5 — Update `useBoardState` to accept a boardId parameter

Update `src/hooks/useBoardState.ts`:

```ts
// useBoardState.ts — accept boardId from URL

export function useBoardState(selectedBoardId?: string) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  // Fetch boards on mount
  useEffect(() => {
    let cancelled = false;
    async function loadBoards() {
      try {
        const apiBoards = await fetchBoards();
        if (!cancelled) setBoards(apiBoards.map(apiToBoard));
      } catch (err) {
        if (!cancelled) setError(String(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadBoards();
    return () => { cancelled = true; };
  }, []);

  // activeBoard: derived from URL parameter
  const activeBoard = selectedBoardId
    ? boards.find(b => b.id === selectedBoardId) ?? null
    : boards[0] ?? null;

  // ... (rest of the handlers remain the same, but use selectedBoardId directly)
  
  // handleCreateBoard now returns the new board for navigation
  async function handleCreateBoard(): Promise<Board | null> {
    try {
      const title = `New Board ${boards.length + 1}`;
      const apiBoard = await createBoardApi(title);
      const newBoard = apiToBoard(apiBoard);
      setBoards(prev => [...prev, newBoard]);
      return newBoard;
    } catch (err) {
      console.error('Failed to create board:', err);
      return null;
    }
  }

  return {
    boards,
    activeBoard,
    loading,
    error,
    toastError,
    handleAddCard,
    handleDeleteCard,
    handleMoveCard,
    handleCreateBoard,
    handleSelectBoard: (id: string) => id,  // navigation handled by BoardPage
    handleRenameBoard,
  };
}
```

### SAVE AND TRY

1. Navigate to `http://localhost:5173` — redirects to `/boards`
2. Log in — redirects to `/boards/{firstBoardId}`
3. Click a different board in the sidebar — URL changes to `/boards/{boardId}`
4. Press Back — returns to previous board
5. Bookmark the URL — opening it later shows that board (if logged in)
6. Refresh — same board still active (URL preserved)

---

## 🎯 Challenge: Create a "Not Found" board page

**You know:** React Router, `useNavigate`, conditional rendering

**Task:** When someone navigates to `/boards/nonexistent-id` (an ID that doesn't exist), instead of an empty screen, show a "Board not found" message with a button that navigates to the first board (or the boards list if there are none).

**Hints:**
- In `BoardPage`, after loading completes: `if (!activeBoard && !loading)`
- Show: "Board not found" with a "Go to my boards" button
- `navigate('/boards', { replace: true })` to go to the boards list

---

<details>
<summary>▶ Show Solution</summary>

In `BoardPage.tsx`:
```tsx
// After loading completes, if board not found:
if (!loading && !activeBoard && !error) {
  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-name">FlowBoard</span>
      </header>
      <div className="app-error">
        <p>Board not found.</p>
        <button onClick={() => navigate('/boards', { replace: true })}>
          Go to my boards
        </button>
      </div>
    </div>
  );
}
```

**Key insight:** URL-based routing creates a new class of error: the URL can reference resources that don't exist (deleted boards, wrong IDs, shared links after a board is removed). Every resource-based URL needs a "not found" handler. This is the same concept as HTTP 404 — at the URL level in React Router. Designing for the "resource deleted" case prevents users from getting stuck on a blank screen.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| Visiting `/` redirects to `/boards` | Open `http://localhost:5173` |
| Unauthenticated visit to `/boards` redirects to `/login` | Clear token → visit `/boards` |
| Login redirects to `/boards` | Log in → URL changes to `/boards/{id}` |
| Board selection changes URL | Click board in sidebar → URL updates |
| Browser back/forward works | Navigate between boards → use Back button |
| URL survives refresh | Navigate to board → refresh → same board shown |
| `/login` redirects to `/boards` if already logged in | Visit `/login` while logged in → redirect |
| Invalid board ID shows not found | Visit `/boards/fake-id` → not found message |
| `useParams` returns `boardId` | Check in DevTools or console.log |
| No TypeScript errors | Problems panel clean |

---

## Quick Check Answers

**1. What handles URL changes in an SPA?**

The browser's History API (`window.history.pushState` and `window.history.popState`). React Router calls `pushState` when you navigate programmatically (`useNavigate`) or click a `<Link>` component. It listens for `popstate` events (browser back/forward) and updates its internal state. When React Router's state changes, it re-renders the matched route component. The server is never contacted — it's all in the browser.

**2. What should happen when an unauthenticated user opens a board link?**

Redirect to login, then redirect back to the originally requested URL after successful login. This is called "auth redirect." The implementation: store the original URL (`/boards/board-1`) before redirecting to `/login`. After login, redirect to the stored URL instead of `/boards`. In our current implementation, the user just goes to `/boards` after login — the original URL is lost. A more complete implementation would store `location` before the redirect: `<Navigate to={`/login?next=${location.pathname}`} />` and read the `next` parameter after login.

**3. What does `useParams()` return for `/boards/:boardId`?**

`{ boardId: 'board-abc-123' }` — an object where keys are the parameter names (without `:`) and values are the matched URL segments. `useParams<{ boardId: string }>()` adds TypeScript types to the return value.

---

## Next Lab

In **LAB-23**, you will add board renaming directly in the header — clicking the board title turns it into an editable field that sends a PATCH request. You will also add soft delete — boards are marked as deleted rather than removed, with a 5-second undo window.
