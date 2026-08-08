# Frontend Lesson 2 — Login, Token Storage, and Protected Routes

**Track:** Developer Social Network — Slice 2 (Frontend)
**Depth:** Heavy — `useContext` is a genuinely new React concept, and "where do you even put a logged-in user" is a real design question, not just syntax
**Goal:** A login form that calls Backend Lesson 2's `/login`, stores the resulting token, shares "who's logged in" across the whole app via React Context, and a `ProtectedRoute` component that redirects unauthenticated users away from pages that require login.

---

## 0. The actual problem this lesson solves

After login, *which* component in the app should know "the user is logged in, and here's who they are"? The signup form (Frontend Lesson 1) didn't need to answer this — it just fired one request and was done. But now, potentially dozens of components across the app (a profile page, a "new post" button, a logout link) all need access to the same piece of information: is someone logged in, and who. Passing that down manually through every layer of components (called "prop drilling") gets unwieldy fast. **Context** is React's built-in answer: a way to make a piece of state available to any component in the tree, without threading it through every intermediate component's props by hand.

---

## 1. `useContext` — explained from zero

Creating a context has three parts: define it, provide it (make the value available), and consume it (read the value from a component that needs it).

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('token', newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

Reading the new pieces:
- **`createContext<AuthContextValue | undefined>(undefined)`** — creates the context itself, starting with no value (`undefined`) until a `Provider` supplies one. The `<AuthContextValue | undefined>` is a TypeScript **generic** — telling `createContext` exactly what type of value this context will eventually hold, so anything reading from it later gets real type-checking instead of `any`.
- **`{ children }: { children: ReactNode }`** — `AuthProvider` takes a special prop called `children`, which represents whatever JSX gets nested *inside* `<AuthProvider>...</AuthProvider>` when it's used. `ReactNode` is the TypeScript type for "anything React can render" (a component, text, a list of components, etc.).
- **`<AuthContext.Provider value={{ user, token, login, logout }}>`** — this is what actually makes the context's value available to every component nested inside it. Any component anywhere within `{children}` — no matter how deeply nested — can now read `user`, `token`, `login`, and `logout` directly, without them being passed as props at every level in between.
- **`useAuth()`** — a small custom wrapper around `useContext(AuthContext)`, which does two useful things: it's shorter to call everywhere (`useAuth()` instead of `useContext(AuthContext)`), and it throws a clear error if someone tries to use it *outside* an `AuthProvider` — catching a real, easy-to-make mistake immediately instead of producing a confusing `undefined`-related bug somewhere else later.

**`localStorage`** — the browser's built-in persistent key-value storage, which survives page refreshes and browser restarts (unlike React state, which resets on refresh). Storing the token there means a logged-in user stays logged in across page reloads, not just within a single session of the app being open.

---

## 2. Wiring the provider around the app

```typescript
// src/App.tsx
import { AuthProvider } from './context/AuthContext';
// ... other imports

function App() {
  return (
    <AuthProvider>
      {/* the rest of the app - routes, pages, etc. - goes here */}
    </AuthProvider>
  );
}

export default App;
```

Wrapping the entire app in `<AuthProvider>` once, at the top, is what makes `useAuth()` usable from *any* component anywhere inside — this single wrapping point is the whole mechanism.

---

## 3. Test-first — the login form

```typescript
// src/components/LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('calls login and stores the token on successful submission', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 'fake-jwt-token', token_type: 'bearer' }),
    });

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    await user.type(screen.getByLabelText(/username/i), 'dana');
    await user.type(screen.getByLabelText(/password/i), 'correct-password');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(localStorage.getItem('token')).toBe('fake-jwt-token');
  });

  it('shows an error message on failed login', async () => {
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 401 });

    const user = userEvent.setup();
    render(
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    );

    await user.type(screen.getByLabelText(/username/i), 'dana');
    await user.type(screen.getByLabelText(/password/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /log in/i }));

    expect(await screen.findByText(/incorrect username or password/i)).toBeInTheDocument();
  });
});
```

**Notice `<LoginForm />` is wrapped in `<AuthProvider>` inside the test** — since `LoginForm` will use `useAuth()` internally, and Section 1's `useAuth` throws an error outside a provider, the test has to supply one, just like `App.tsx` does for the real app.

**`screen.findByText(...)`, not `getByText(...)`** — `findBy` queries are asynchronous; they wait for the element to appear, retrying briefly before failing. This matters here because the error message only appears *after* the fake API call resolves, which happens asynchronously — `getBy` would fail immediately, before the response has had a chance to come back.

Run this — it fails, since `LoginForm` doesn't exist yet. Red.

---

## 4. Green — the login form

```typescript
// src/components/LoginForm.tsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    const response = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      setErrorMessage('Incorrect username or password');
      return;
    }

    const data = await response.json();

    const meResponse = await fetch('http://localhost:8000/me', {
      headers: { Authorization: `Bearer ${data.access_token}` },
    });
    const userData = await meResponse.json();

    login(userData, data.access_token);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username">Username</label>
      <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />

      <label htmlFor="password">Password</label>
      <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      {errorMessage && <p role="alert">{errorMessage}</p>}

      <button type="submit">Log In</button>
    </form>
  );
}
```

**`const { login } = useAuth();`** — destructuring (Frontend Lesson 1, Section 4) the `login` function straight out of the context's value, ready to call once credentials are confirmed valid.

**`{errorMessage && <p role="alert">{errorMessage}</p>}`** — a common JSX pattern worth explaining directly: `&&` is JavaScript's logical AND. If `errorMessage` is `null` (falsy), the whole expression short-circuits to `null`, and React renders nothing. If `errorMessage` holds a real string (truthy), the expression evaluates to the `<p>` element, and React renders it. This is JSX's standard way of conditionally rendering something — "show this element only if this condition is true" — without needing a full `if` statement.

**Why a second fetch to `/me` after login** — `/login` (Backend Lesson 2) only returns a token, not the full user object; `/me` (also Backend Lesson 2) is the endpoint that returns the actual user data for a given valid token. This two-step flow — get a token, then use it to fetch who you are — is a completely standard pattern, not a workaround.

Run the tests again — green.

---

## 5. The protected-route pattern

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { token } = useAuth();

  if (token === null) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
```

`<Navigate to="/login" replace />` — a component from `react-router-dom` that performs a redirect the moment it renders. `replace` means the redirect replaces the current entry in browser history, rather than adding a new one — so clicking the browser's "back" button after being redirected doesn't just bounce the user right back to the protected page they were denied.

`<>{children}</>` — an empty pair of angle brackets is a **React Fragment**: a way to group multiple children (or in this case, just pass `children` through) without adding an actual extra `<div>` or other wrapper element to the rendered HTML. Used here because `ProtectedRoute` itself shouldn't introduce any visible wrapper — it's purely a gatekeeping decision, not a piece of UI.

**Usage, wiring it into routes:**

```typescript
<Route path="/profile" element={
  <ProtectedRoute>
    <ProfilePage />
  </ProtectedRoute>
} />
```

Any page wrapped this way now automatically redirects to `/login` if there's no valid token in context — a single reusable pattern, the same "write it once, apply everywhere" idea as Backend Lesson 2's `get_current_user` dependency.

---

## 6. Challenges before Slice 3

1. Write a test first: confirm that `ProtectedRoute` renders its children normally when a token *is* present in context (you'll need to render it wrapped in an `AuthProvider` where `login(...)` has already been called, or a test-only context value). Then confirm the existing implementation already passes, or fix it if not.
2. Right now, if `localStorage` has a token from a previous session but the app just freshly loaded, `AuthContext`'s `user` and `token` state both start as `null` — meaning a returning user briefly looks logged out until something re-checks. Sketch (in words, or in code if you want to implement it) what `AuthProvider` would need to do on startup to fix this.
3. Explain, in your own words, why `useAuth()` throwing an error outside an `AuthProvider` is a *better* design than just returning `undefined` silently — tie this back to the Testing interlude's Section 3 judgment question about how bad a silent failure would be here.
4. The `login` function in `AuthContext` writes directly to `localStorage`. Is this a good place for that side effect to live, or would it be cleaner somewhere else? There's no single right answer — reason through the tradeoff explicitly; this is exactly the kind of judgment call Slice 6's architecture lessons will give you more formal vocabulary for.

---

## What's next

Slice 3 adds posts — the core feature of the app — with a Data Structures & Big-O interlude covering pagination on the backend side, and list rendering, `useEffect`, and pagination UI on the frontend. Say the word when you're ready.
