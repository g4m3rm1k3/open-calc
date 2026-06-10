# Sprint 4 · Lesson 4 — React: login form, token storage, auth state

## What you will build

By the end of this lesson, the React app has a login form. Successful login stores the JWT in `localStorage`. Every subsequent API call sends `Authorization: Bearer <token>` in the header. The app detects expired tokens (401 responses) and redirects to the login page. A logout button clears the token. You will understand the tradeoffs between `localStorage`, `sessionStorage`, and cookies for token storage.

---

## What you need to know first

- Sprint 4 L3: Protected endpoints return 401 without a token.
- Sprint 1 L4: `fetch`, `async/await`, `useEffect`, `useState`, CORS.
- Sprint 2 L4: Controlled inputs, `event.preventDefault()`.

---

## The lesson

---

### 1. Token storage: the options and their tradeoffs

**The problem:** The JWT arrives in the login response body. Where should the React app store it? The answer depends on security and convenience tradeoffs you must consciously choose.

**`localStorage`:** Persists data across browser sessions and tabs. `localStorage.setItem("token", jwt)` stores the token. `localStorage.getItem("token")` retrieves it. Data survives page reload and browser restart until explicitly cleared.

*Security tradeoff:* `localStorage` is accessible by any JavaScript on the page — including injected scripts from an XSS attack. If your app renders user-provided HTML (even accidentally via a buggy library), an attacker can execute `fetch('/steal-data', {body: localStorage.getItem("token")})`. This is a real attack vector that has affected major sites.

*Practical reality:* If your app has XSS vulnerabilities, a `localStorage` token is the least of your problems — the attacker can do anything authenticated JavaScript can do. The XSS prevention in Sprint 6 is more important than where you store the token.

**`sessionStorage`:** Same API as `localStorage`, but data is cleared when the tab closes. A user closing the browser is logged out. Each tab has its own `sessionStorage` — opening a link in a new tab starts the user logged out in that tab.

**`HttpOnly` cookies:** Cookies with the `HttpOnly` flag cannot be read by JavaScript at all — they are attached to requests by the browser automatically. This prevents XSS from stealing the token. The tradeoff: cookies are sent to every request to the same domain (including non-API requests), which enables **CSRF (Cross-Site Request Forgery)** attacks — a different attack vector that requires `SameSite=Strict` cookie configuration to mitigate.

**For this curriculum:** You will use `localStorage`. It is the most common approach for SPAs, it is easy to understand and debug (you can see the token in the browser devtools under Application → Local Storage), and the XSS protection in Sprint 6 addresses the primary risk. A production hardening step would be to migrate to `HttpOnly` cookies.

**CS lens — browser storage as a key-value store.** `localStorage` and `sessionStorage` are browser-managed key-value stores with string keys and string values. They are synchronous (unlike `IndexedDB`, which is asynchronous), persistent (unlike in-memory JavaScript variables, which are cleared on reload), and origin-scoped (a script on `evil.com` cannot read `localStorage` set by `yourapp.com`). The origin restriction is why `localStorage` is still safer than an in-memory global: cross-origin JavaScript cannot read it.

---

### 2. Create the auth utilities module

Create `frontend/src/auth.ts`:

```typescript
const TOKEN_KEY = "workorders_access_token"

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export function isLoggedIn(): boolean {
  return getToken() !== null
}

export function authHeader(): Record<string, string> {
  const token = getToken()
  if (token === null) return {}
  return { Authorization: `Bearer ${token}` }
}
```

**Walkthrough:**

`TOKEN_KEY = "workorders_access_token"` — the `localStorage` key name. Using a specific key name (not just `"token"`) avoids collision with other libraries or apps that might also store something called `"token"` in `localStorage`. It is a constant because it is used in multiple functions — changing the name in one place changes it everywhere.

`localStorage.setItem(TOKEN_KEY, token)` — stores the token. `localStorage` is a browser global object — available in every browser JavaScript context. The stored value persists across page reloads and browser restarts until explicitly removed.

`localStorage.getItem(TOKEN_KEY)` — retrieves the token. Returns `null` if the key does not exist. TypeScript types this as `string | null`.

`localStorage.removeItem(TOKEN_KEY)` — deletes the key. This is the logout operation: remove the token; subsequent `getToken()` calls return `null`; subsequent `authHeader()` calls return an empty object; subsequent API calls receive 401; the React app redirects to login.

`authHeader()` — builds the `Authorization` header object to spread into every `fetch` call:

```typescript
await fetch('http://localhost:8000/orders', {
  headers: {
    'Content-Type': 'application/json',
    ...authHeader(),
  }
})
```

`...authHeader()` — the **spread operator** on an object. It expands the returned object's key-value pairs into the parent object. If `authHeader()` returns `{ Authorization: "Bearer eyJ..." }`, the spread includes that header. If `authHeader()` returns `{}` (not logged in), no Authorization header is added.

**CS lens — module as a facade.** `auth.ts` is a **facade** — a simplified interface over a more complex subsystem (browser storage). Instead of scattering `localStorage.getItem("workorders_access_token")` throughout the codebase, every component imports `getToken()`. If you later change the storage mechanism (e.g., move to cookies), you change `auth.ts` — nothing else. The facade is the contract; the implementation is an internal detail.

**SE lens — the constant key as a single source of truth.** `TOKEN_KEY` is defined once. If you later rename it (e.g., `"workorders_v2_token"` after a security incident requiring all users to re-login), you change one line. Without the constant, you would search every file for `"workorders_access_token"` and hope you found every occurrence.

---

### 3. Create the Zustand auth store

**The problem:** Multiple React components need to know whether the user is logged in: the main app (to show login vs. dashboard), the nav bar (to show a logout button), the fetch calls (to include the token). Lifting this state to a common ancestor and prop-drilling it through every component is feasible but tedious. A global state store is the cleaner solution.

Install Zustand:

```
npm install zustand
```

**Walkthrough:** `npm install zustand` downloads the `zustand` package and adds it to `package.json`'s `dependencies`. Zustand is a minimalist React state management library. It is not Redux (which requires actions, reducers, and a provider) — it is a hook that creates a global store in a few lines.

Create `frontend/src/store/authStore.ts`:

```typescript
import { create } from 'zustand'
import { saveToken, clearToken, getToken } from '../auth'

interface AuthState {
  token: string | null
  isAuthenticated: boolean
  login: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: getToken(),
  isAuthenticated: getToken() !== null,

  login: (token: string) => {
    saveToken(token)
    set({ token, isAuthenticated: true })
  },

  logout: () => {
    clearToken()
    set({ token: null, isAuthenticated: false })
  },
}))
```

**Walkthrough:**

`create<AuthState>((set) => ({ ... }))` — `create` is Zustand's store factory. It takes a function that receives `set` (a function to update state) and returns the initial state object with its methods. `<AuthState>` is the TypeScript generic parameter — the type of the store's state.

`token: getToken()` — initialises the token from `localStorage` when the store is first created. If the user had a token from a previous session (still in `localStorage`), they are immediately authenticated on page load — they do not have to log in again.

`isAuthenticated: getToken() !== null` — initialises based on whether a token exists. This is the source of truth React components read to determine what to render.

`login: (token: string) => { saveToken(token); set({ token, isAuthenticated: true }) }` — called after a successful login API call. Stores the token in `localStorage` (via `saveToken`) and updates the Zustand state. `set({ token, isAuthenticated: true })` — `set` merges the provided object into the current state. Other state fields (`logout`) are unchanged.

`logout: () => { clearToken(); set({ token: null, isAuthenticated: false }) }` — clears `localStorage` and resets state. All components reading `isAuthenticated` re-render.

**CS lens — reactive state as a publish-subscribe system.** Zustand implements a **publish-subscribe** pattern: the store is the publisher; components that call `useAuthStore()` are subscribers. When `set(...)` is called, Zustand notifies all subscribed components and triggers re-renders. Components only re-render when the specific parts of state they read change — Zustand's default selector optimises this. This is the observer pattern at the state layer.

**SE lens — co-locating storage and state.** The `login` function both saves to `localStorage` and updates React state. This co-location guarantees they are always in sync: you cannot call one without the other. If they were separate operations, a bug could leave `localStorage` updated but Zustand state stale (or vice versa), creating split-brain auth state.

---

### 4. Build the LoginForm component

Create `frontend/src/components/LoginForm.tsx`:

```typescript
import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

function LoginForm() {
  const login = useAuthStore(state => state.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail ?? 'Login failed')
      }

      const data = await response.json()
      login(data.access_token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h1>Work Orders — Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
    </div>
  )
}

export default LoginForm
```

**Walkthrough:**

`useAuthStore(state => state.login)` — subscribes to the `login` function from the store. The selector `state => state.login` extracts only `login`. If other parts of the store change (e.g., `token` or `isAuthenticated`), this component does not re-render — it only subscribed to `login`, which never changes.

`type="password"` — the HTML `type` attribute on the input. `type="password"` makes the browser mask the input with dots. This is a browser security feature — it prevents shoulder-surfing and marks the field as a credential for password managers.

`autoComplete="username"` and `autoComplete="current-password"` — hints to the browser and password managers. `current-password` tells the browser this is the existing password for the account (as opposed to `new-password` on a registration form). Password managers use these hints to autofill the right credentials for the right fields.

`login(data.access_token)` — calls the Zustand action with the token string. `data.access_token` is from the server's `TokenResponse` JSON. This single call stores the token in `localStorage` and updates React state — both operations guaranteed to happen together.

**Security lens — never log passwords.** The password value (`password` state variable) must never be logged, stored, or included in error reports. `console.log(username, password)` during debugging is a common mistake. If you use an error tracking service (Sentry, Sprint 8), configure it to scrub fields named `password` from captured data. The password exists in memory only for the duration of the login attempt; after `handleSubmit` completes, it is garbage collected.

---

### 5. Update `App.tsx` to handle auth state and 401s

**The problem:** App needs to show `LoginForm` when not authenticated, the work orders UI when authenticated, and handle 401 responses by redirecting to login.

Replace `frontend/src/App.tsx`:

```typescript
import { useState, useEffect } from 'react'
import { WorkOrder } from './types'
import { useAuthStore } from './store/authStore'
import { authHeader } from './auth'
import LoginForm from './components/LoginForm'
import WorkOrderList from './components/WorkOrderList'
import WorkOrderDetail from './components/WorkOrderDetail'
import CreateOrderForm from './components/CreateOrderForm'

function App() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const logout = useAuthStore(state => state.logout)

  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    async function loadOrders() {
      try {
        const response = await fetch('http://localhost:8000/orders', {
          headers: authHeader(),
        })
        if (response.status === 401) {
          logout()
          return
        }
        if (!response.ok) throw new Error('Failed to load orders')
        const data: WorkOrder[] = await response.json()
        setOrders(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setIsLoading(false)
      }
    }
    loadOrders()
  }, [isAuthenticated, logout])

  if (!isAuthenticated) {
    return <LoginForm />
  }

  if (isLoading) return <div>Loading work orders...</div>
  if (error) return <div>Error: {error}</div>

  if (selectedOrder) {
    return <WorkOrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Work Orders</h1>
        <button onClick={logout}>Log out</button>
      </div>
      <WorkOrderList orders={orders} onSelect={setSelectedOrder} />
      <hr />
      <CreateOrderForm onCreated={order => setOrders(current => [...current, order])} />
    </div>
  )
}

export default App
```

**Walkthrough:**

`useAuthStore(state => state.isAuthenticated)` — subscribes to `isAuthenticated`. When `isAuthenticated` changes (login or logout), this component re-renders.

`if (!isAuthenticated) return <LoginForm />` — if not authenticated, render only the login form. No API calls, no work orders UI. This is the **route guard** pattern — showing different UI based on authentication state.

`if (!isAuthenticated) return` at the top of `loadOrders`' enclosing `useEffect` — prevents the data fetch from running before authentication. The dependency array `[isAuthenticated, logout]` means: re-run this effect whenever `isAuthenticated` changes. When the user logs in, `isAuthenticated` becomes `true`, the effect re-runs, and the orders are fetched.

`if (response.status === 401) { logout(); return }` — handles expired or invalid tokens. A 401 on a data request means the token has expired. `logout()` clears the token and sets `isAuthenticated: false`. The Zustand state update triggers a re-render; `!isAuthenticated` is now true; `<LoginForm />` renders. The user sees the login form without an error message — a graceful expiry.

`headers: authHeader()` — spreads the `Authorization: Bearer <token>` header into every fetch call. When the token is present, the header is included. When absent (before login), no header is added.

**CS lens — the reactive dependency array as a side-effect contract.** The `useEffect` dependency array `[isAuthenticated, logout]` is React's mechanism for controlling when effects re-run. It is a **contract**: "this effect depends on `isAuthenticated` and `logout`; re-run it whenever they change." Omitting `isAuthenticated` from the array would cause a stale closure — the effect would capture the initial `isAuthenticated: false` value and never re-run when login succeeds. React's linter (`eslint-plugin-react-hooks`) enforces this contract by warning about missing dependencies.

**SE lens — handling 401 at every fetch point.** Every fetch call in your app needs to handle 401. With a centralised `authHeader()` function, adding the header is already one line. Handling 401 still requires checking `response.status === 401` in each fetch call. In a larger application, you would create a `fetchWithAuth` wrapper that handles both the header and the 401 redirect automatically — a pattern Sprint 7 explores in the service layer context.

---

## Connect the pieces

The full authentication cycle is complete:

1. User visits the app — `isAuthenticated: false` (no token in `localStorage`) → `<LoginForm />` renders
2. User submits credentials → `POST /auth/login` → server verifies bcrypt hash → server issues JWT
3. `login(token)` stores token in `localStorage`, sets `isAuthenticated: true`
4. `App` re-renders, `isAuthenticated: true` → orders fetch fires with `Authorization: Bearer <token>`
5. Server verifies JWT signature and expiry, returns orders
6. User works in the app for 30 minutes, token expires
7. Next API call returns 401 → `logout()` → `isAuthenticated: false` → `<LoginForm />` renders

Sprint 5 tests this entire flow without a browser. Sprint 6 adds rate limiting to the login endpoint and moves the secret key to an environment variable.

---

## What breaks without this

**Token not sent after page reload:** If you store the token in React state only (not `localStorage`), it disappears on reload. Every page reload requires re-logging in. Fix: always initialise Zustand state from `localStorage` (as done here: `token: getToken()`).

**401 not handled → blank loading screen:** If a fetch call receives 401 (expired token) but you only handle `!response.ok` generically, the app shows "Error: Failed to load orders" instead of redirecting to login. Check `response.status === 401` specifically before the generic error case.

**Password logged in error report:** If a `catch` block logs `err` and `err` contains the request body (some fetch error objects include the request), the password appears in logs. Always log sanitised errors, not raw network objects.

---

## Definition of done

- [ ] Visiting the app when not logged in shows `<LoginForm />` only
- [ ] Logging in with valid credentials fetches and displays the orders list
- [ ] Logging in with invalid credentials shows an error message (no page reload)
- [ ] The token appears in browser DevTools → Application → Local Storage
- [ ] Refreshing the page while logged in does not require re-login
- [ ] Clicking "Log out" returns to the login form and clears the token from Local Storage
- [ ] You can explain the tradeoffs between `localStorage` and `HttpOnly` cookies
- [ ] You can explain what happens when a 401 is received on a data fetch

**Git commit:**

```
git add frontend/src/
git commit -m "Add React auth flow: Zustand auth store, login form, token in localStorage, 401 handling and redirect to login"
```

This commit marks the end of Sprint 4. Authentication is complete: bcrypt passwords, JWT tokens, protected endpoints, and a React UI that manages the auth lifecycle. Sprint 5 writes automated tests for all of it.
