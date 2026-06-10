# FlowBoard Masterclass — LAB 21 — Login UI: Forms, Tokens, and Auth State

**Prerequisites:** LAB-20 — Backend has `/api/auth/register` and `/api/auth/login`. Returns a JWT.

**What this lab adds:**
- React forms — controlled inputs with validation feedback
- `useContext` — sharing auth state across the component tree
- Token storage — localStorage for the JWT
- The `Authorization` header — automatically added to all API calls
- Redirect on 401 — auto-logout when the token expires
- Login, register, and logout UI

**Time:** 80–100 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. `useContext` lets any component read shared state without prop drilling. What problem does prop drilling cause, and why doesn't moving state higher in the tree always solve it?
> 2. Storing the JWT in localStorage means any JavaScript on the page can read it. What is the risk, and what is the alternative?
> 3. When the user refreshes the page, React state is lost. How do you keep the user logged in after a refresh?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

If no token exists in storage, the app shows a login/register form instead of the board. After login, the board appears. Logout clears the token and returns to the login screen. All API calls include the `Authorization: Bearer <token>` header automatically.

```
App loads
  → No token in storage?  → Show <AuthPage />
  → Token exists?         → Verify with /api/auth/me
      → Valid?   → Show <BoardApp />
      → Invalid? → Clear token, show <AuthPage />
```

---

## Concept: `useContext` — Sharing State Without Prop Drilling

**The problem — prop drilling:**

```
App (has token)
  └── BoardLayout (doesn't need token, but must pass it down)
        └── Header (doesn't need token, but must pass it down)
              └── UserMenu (needs token for logout button)
```

`token` has to pass through `BoardLayout` and `Header` even though they don't use it. Every intermediate component becomes a messenger for data it doesn't care about.

**The React Context solution:**

```tsx
// 1. Create context
const AuthContext = createContext<AuthContextValue>(null!);

// 2. Provide it high in the tree
function App() {
  const auth = useAuth();  // custom hook with token state
  return (
    <AuthContext.Provider value={auth}>
      <BoardLayout />
    </AuthContext.Provider>
  );
}

// 3. Consume it anywhere in the tree
function UserMenu() {
  const { logout } = useContext(AuthContext);
  return <button onClick={logout}>Log out</button>;
}
```

`UserMenu` reads `logout` directly from context — no prop passing through `BoardLayout` or `Header`. The "tunnel" skips all intermediate components.

**When to use context:**

- Auth state (who is logged in — needed across the whole app)
- Theme (dark/light mode — needed by every component)
- Language/locale (i18n — needed everywhere)
- NOT for: data that only one component needs (local state is better)
- NOT for: data that changes frequently (every context update re-renders all consumers)

**You will see this again in:** Auth throughout this course, theming (Lab 25), React Router (Lab 22).

---

## Step 1 — Update `boardsApi.ts` to include auth headers

Update the `API_BASE` and add a token utility:

```ts
// src/api/boardsApi.ts — add auth headers

const API_BASE = 'http://localhost:8000';

// Get the token from storage — called at request time, not module init time
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('flowboard-token');
  if (!token) return { 'Content-Type': 'application/json' };
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
}

// Update all fetch calls to use getAuthHeaders() instead of hardcoded headers:
// For example:
export async function fetchBoards(): Promise<ApiBoard[]> {
  const response = await fetch(`${API_BASE}/api/boards`, {
    headers: getAuthHeaders(),
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (!response.ok) throw new Error(`Failed to fetch boards: HTTP ${response.status}`);
  return response.json() as Promise<ApiBoard[]>;
}

// Update all other functions similarly — add headers: getAuthHeaders() to each fetch call
// and add: if (response.status === 401) throw new Error('UNAUTHORIZED');
```

**Important:** Update `fetchBoards`, `createBoard`, `createCard`, `deleteCard`, `moveCard`, `updateCard` to all use `getAuthHeaders()` and handle 401.

---

## Step 2 — Create an auth API module

Create `src/api/authApi.ts`:

```ts
// src/api/authApi.ts

const API_BASE = 'http://localhost:8000';

export interface UserInfo {
  id: string;
  username: string;
}

export async function register(username: string, password: string): Promise<UserInfo> {
  const response = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (response.status === 409) throw new Error('USERNAME_TAKEN');
  if (response.status === 422) {
    const data = await response.json();
    throw new Error(`VALIDATION:${data.detail}`);
  }
  if (!response.ok) throw new Error(`Register failed: ${response.status}`);
  return response.json() as Promise<UserInfo>;
}

export async function login(username: string, password: string): Promise<string> {
  const response = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (response.status === 401) throw new Error('INVALID_CREDENTIALS');
  if (!response.ok) throw new Error(`Login failed: ${response.status}`);
  const data = await response.json();
  return data.access_token as string;
}

export async function getMe(token: string): Promise<UserInfo> {
  const response = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (response.status === 401) throw new Error('UNAUTHORIZED');
  if (!response.ok) throw new Error(`Auth check failed: ${response.status}`);
  return response.json() as Promise<UserInfo>;
}
```

---

## Step 3 — Create the auth context and hook

Create `src/context/AuthContext.tsx`:

```tsx
// src/context/AuthContext.tsx

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserInfo, getMe } from '../api/authApi';

const TOKEN_KEY = 'flowboard-token';

interface AuthContextValue {
  user: UserInfo | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount: validate the stored token by calling /api/auth/me
  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    getMe(token)
      .then(userInfo => {
        if (!cancelled) setUser(userInfo);
      })
      .catch(() => {
        // Token is invalid or expired — clear it
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY);
          setToken(null);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  function login(newToken: string, userInfo: UserInfo) {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(userInfo);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access auth context
export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuthContext must be used inside <AuthProvider>');
  }
  return ctx;
}
```

---

## Step 4 — Create the login/register form

Create `src/components/AuthPage.tsx`:

```tsx
// src/components/AuthPage.tsx

import { useState } from 'react';
import { login as apiLogin, register as apiRegister, getMe } from '../api/authApi';
import { useAuthContext } from '../context/AuthContext';
import './AuthPage.css';

type Mode = 'login' | 'register';

export function AuthPage() {
  const { login } = useAuthContext();
  const [mode, setMode] = useState<Mode>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'register') {
        await apiRegister(username, password);
        // After registration, immediately log in
      }

      const token = await apiLogin(username, password);
      const userInfo = await getMe(token);
      login(token, userInfo);

    } catch (err) {
      const message = String(err);
      if (message.includes('USERNAME_TAKEN')) setError('That username is already taken.');
      else if (message.includes('INVALID_CREDENTIALS')) setError('Invalid username or password.');
      else if (message.includes('VALIDATION:')) setError(message.replace('Error: VALIDATION:', ''));
      else setError('Something went wrong. Is the server running?');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">FlowBoard</h1>
        <p className="auth-subtitle">
          {mode === 'login' ? 'Sign in to your boards' : 'Create an account'}
        </p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            Username
            <input
              className="auth-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete={mode === 'register' ? 'username' : 'username'}
              required
              minLength={3}
            />
          </label>

          <label className="auth-label">
            Password
            <input
              className="auth-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              required
              minLength={8}
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? (
            <>New to FlowBoard? <button className="auth-link" onClick={() => { setMode('register'); setError(null); }}>Create an account</button></>
          ) : (
            <>Already have an account? <button className="auth-link" onClick={() => { setMode('login'); setError(null); }}>Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}
```

Create `src/components/AuthPage.css`:

```css
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a202c;
}

.auth-card {
  background: white;
  border-radius: 12px;
  padding: 36px 40px;
  width: 360px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
}

.auth-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 4px 0;
}

.auth-subtitle {
  color: #718096;
  font-size: 14px;
  margin: 0 0 24px 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #4a5568;
}

.auth-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.15s;
}

.auth-input:focus {
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66,153,225,0.15);
}

.auth-error {
  color: #e53e3e;
  font-size: 13px;
  margin: 0;
}

.auth-submit {
  padding: 10px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s;
}

.auth-submit:hover:not(:disabled) { background: #3182ce; }
.auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.auth-switch {
  text-align: center;
  font-size: 13px;
  color: #718096;
  margin: 16px 0 0 0;
}

.auth-link {
  background: none;
  border: none;
  color: #4299e1;
  cursor: pointer;
  font-size: 13px;
  text-decoration: underline;
  padding: 0;
}
```

---

## Step 5 — Wire auth into `App.tsx`

Update `main.tsx` to add the provider:

```tsx
// main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
```

Update `App.tsx` to show auth page or board based on auth state:

```tsx
// App.tsx

import { AuthPage } from './components/AuthPage';
import { useAuthContext } from './context/AuthContext';
import { useBoardState } from './hooks/useBoardState';
// ... other imports

function App() {
  const { user, isLoading: authLoading, logout } = useAuthContext();

  // Show nothing while checking stored token
  if (authLoading) {
    return (
      <div className="app-layout">
        <header className="app-header"><span className="app-name">FlowBoard</span></header>
        <div className="app-loading"><p>Checking authentication...</p></div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  // Show main app
  return <BoardApp onLogout={logout} username={user.username} />;
}

// Separate component for the board app (so useBoardState only runs when logged in)
function BoardApp({ onLogout, username }: { onLogout: () => void; username: string }) {
  const {
    boards, activeBoard, selectedBoardId,
    loading, error,
    handleAddCard, handleDeleteCard, handleMoveCard, handleCreateBoard,
    handleSelectBoard, handleRenameBoard,
    toastError,
  } = useBoardState();

  // Handle 401 from API — token expired
  useEffect(() => {
    if (error?.includes('UNAUTHORIZED')) {
      onLogout();
    }
  }, [error, onLogout]);

  if (loading) { /* ... loading state ... */ }
  if (error && !error.includes('UNAUTHORIZED')) { /* ... error state ... */ }
  if (!activeBoard) return null;

  return (
    <div className="app-layout">
      <header className="app-header">
        <span className="app-name">FlowBoard</span>
        <span className="board-title-text">{activeBoard.title}</span>
        <div className="header-actions">
          <span className="header-username">{username}</span>
          <button className="header-logout-btn" onClick={onLogout}>Log out</button>
        </div>
      </header>

      <div className="app-body">
        <Sidebar ... />
        <BoardComponent ... />
      </div>

      {toastError && <div className="toast-error" role="alert">{toastError}</div>}
    </div>
  );
}

export default App;
```

Add styles to `App.css`:

```css
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: auto;
}

.header-username {
  font-size: 13px;
  color: rgba(255,255,255,0.7);
}

.header-logout-btn {
  font-size: 12px;
  padding: 4px 10px;
  background: transparent;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 4px;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
}

.header-logout-btn:hover {
  background: rgba(255,255,255,0.1);
}
```

### SAVE AND TRY

1. Refresh the page — you see the login form (token was cleared from Lab 13's localStorage reset, or try clearing it manually)
2. Register a new user
3. Log in — the board app appears
4. Refresh — still logged in (token in localStorage)
5. Log out — returns to login form
6. Log in again — your boards are empty (new user); create some boards and cards
7. Refresh — boards persist (stored in the database under your user)

---

## 🎯 Challenge: Show an error when login form is submitted but the server is offline

**You know:** `try/catch` in the submit handler, error state, toast messages

**Task:** When the user clicks "Sign In" and the server is completely unreachable (not the same as wrong credentials), show a specific message: "Cannot connect to server. Is the backend running?" The current catch block shows a generic message for all errors — distinguish network errors from credential errors.

**Hints:**
- A `TypeError: Failed to fetch` indicates a network error (server unreachable)
- `err instanceof TypeError` or `message.includes('fetch')` can distinguish it
- Show the error inline in the form, not as a toast

---

<details>
<summary>▶ Show Solution</summary>

In `handleSubmit` in `AuthPage.tsx`:
```tsx
} catch (err) {
  const message = String(err);
  if (err instanceof TypeError && message.includes('fetch')) {
    setError('Cannot connect to server. Is the backend running?');
  } else if (message.includes('USERNAME_TAKEN')) {
    setError('That username is already taken.');
  } else if (message.includes('INVALID_CREDENTIALS')) {
    setError('Invalid username or password.');
  } else if (message.includes('VALIDATION:')) {
    setError(message.replace('Error: VALIDATION:', ''));
  } else {
    setError('Something went wrong. Please try again.');
  }
}
```

**Key insight:** Error messages in auth forms require careful calibration. Too vague ("Something went wrong") leaves users helpless. Too specific ("User not found" vs "Wrong password") helps attackers. The solution is to be specific about non-security issues (server offline — helps developers and users diagnose the problem) while being generic about security issues (wrong credentials — gives nothing away to attackers).

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| Login form appears when not authenticated | Clear localStorage → refresh → login form |
| Register creates a new user | Submit register form → success → logged in |
| Login with wrong password shows error | Try wrong password → error message |
| After login, board app appears | Log in → board shown |
| Refresh keeps user logged in | Log in → refresh → still logged in |
| Logout returns to login form | Click "Log out" → login form shown |
| API calls include Authorization header | Check Network tab in DevTools — see Bearer token |
| New user starts with no boards | Register → empty sidebar |
| Created boards visible after refresh | Create board → refresh → board still there |
| `AuthContext` wraps the app | Check `main.tsx` |
| `useAuthContext` throws if used outside provider | Check the null check in the hook |

---

## Quick Check Answers

**1. Why doesn't moving state higher always solve prop drilling?**

Moving state up helps — but only if the component that needs the state is a nearby ancestor. Auth state needs to be available to components deep in the tree (header username display, logout button in menus, any API call). Moving auth state to `App` and passing it down through every intermediate component is exactly the prop drilling problem — all those intermediaries become aware of auth state they don't care about. Context provides a tunnel that bypasses the chain.

**2. The risk of storing JWT in localStorage:**

Any JavaScript on the page can call `localStorage.getItem('flowboard-token')`. If your app has an XSS (cross-site scripting) vulnerability — where attacker-controlled JavaScript runs in your origin — the token is stolen. The alternative is `HttpOnly` cookies: cookies that JavaScript cannot read, only the browser sends them automatically on every request. HttpOnly cookies are immune to JavaScript theft. The trade-off: CSRF (cross-site request forgery) attacks become possible with cookies. For a learning project, localStorage is acceptable. For production, use HttpOnly cookies or a short-lived access token in memory + a refresh token in an HttpOnly cookie.

**3. How do you keep the user logged in after a page refresh?**

Store the token in localStorage. On mount, the `AuthProvider` reads the token from localStorage, validates it with `GET /api/auth/me`, and if valid, sets the user state. The user appears logged in even after a refresh because the token is loaded from persistent storage before the app renders. The `/api/auth/me` call is the validation step — it confirms the token is still valid (not expired, not from a different server). Without this check, a stored token that expired while the user was away would still show the app — until the first API call failed with 401.

---

## Next Lab

In **LAB-22**, you will add React Router to handle multiple pages — the login page, the board page, and an individual card detail page. You will implement protected routes that redirect to login if the user is not authenticated, and URL-based navigation so users can bookmark and share specific boards.
