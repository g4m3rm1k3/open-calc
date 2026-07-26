# Lesson F8: Global State Without Prop-Drilling

**What you will build**
An `AuthContext` making the current member's login status and identity available anywhere in the component tree, without passing it down as props through every intermediate component. The problem we're solving: F7 gave us a stored token, but nothing yet makes "is someone logged in, and who" available to, say, a `Navbar` component or a route guard, without manually threading it down through every layer of components between `App` and wherever it's actually needed.

**What you need to know first**
F4 (props, unidirectional data flow). F7 (`tokenStorage.ts`).

---

## Concept Unit: The Prop-Drilling Problem, and Context

### The Problem

Suppose `App` knows whether someone's logged in, but a deeply nested component — `PostDetailPage` → `CommentSection` → `CommentForm` — needs that same information, only to decide whether to show a "log in to comment" message. Passing it down as a prop through `PostDetailPage` and `CommentSection`, neither of which actually *uses* the value themselves, just to relay it further, is **prop-drilling** — and it gets worse, not better, as the tree grows.

### Introduce the concept in isolation

Create `frontend/src/lab/ContextDemo.tsx`:

```tsx
import { createContext, useContext } from "react";

const ThemeContext = createContext("light");

function DeeplyNested() {
    const theme = useContext(ThemeContext);
    return <p>Current theme: {theme}</p>;
}

function Middle() {
    return <DeeplyNested />;
}

function App() {
    return (
        <ThemeContext.Provider value="dark">
            <Middle />
        </ThemeContext.Provider>
    );
}
```

Render `<App />` — `"Current theme: dark"` renders, despite `Middle` never mentioning `theme` anywhere in its own code.

*What this proves:* `DeeplyNested` read `theme` directly via `useContext(ThemeContext)`, with `Middle` sitting entirely uninvolved in between — no props were passed through it at all. `ThemeContext.Provider value="dark"` makes `"dark"` available to *any* descendant that asks for it, at any depth, without each intermediate layer needing to know or care.

### Explain the mechanism

`createContext` defines a named "channel" with a default value. `Provider` overrides that value for its entire subtree. `useContext` reads whatever value is currently active for the nearest enclosing `Provider`, regardless of how many component layers separate the two. This is a genuinely different data-flow mechanism from F4's props — not a replacement for them, an addition alongside them, for the specific case where many components at very different depths need the same value.

### Discard the throwaway example

Delete `frontend/src/lab/ContextDemo.tsx`. Build the real `AuthContext`.

### Project Change

* **Files affected:** Create `src/auth/AuthContext.tsx`.
* **Change type:** Add.

### The New Code

```tsx
// src/auth/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import { getToken, setToken as saveToken, clearToken } from "./tokenStorage";

interface AuthContextValue {
    token: string | null;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setTokenState] = useState<string | null>(getToken());

    useEffect(() => {
        setTokenState(getToken());
    }, []);

    function login(newToken: string) {
        saveToken(newToken);
        setTokenState(newToken);
    }

    function logout() {
        clearToken();
        setTokenState(null);
    }

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
```

```tsx
// src/App.tsx — wrap the whole app
import { AuthProvider } from "./auth/AuthContext";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>{/* ...existing routes... */}</BrowserRouter>
        </AuthProvider>
    );
}
```

### Mechanical walkthrough

1. `createContext<AuthContextValue | null>(null)`: (already-established generics from F1, union type from F2, applied together). Defaults to `null` — meaningful specifically as "no `AuthProvider` exists above this point," distinct from "logged out," which is represented instead by `token` being `null` *inside* a real context value.
2. `useAuth()` throwing if `context === null`: (first appearance of a **custom hook** wrapping a raw context read with a safety check). This converts a silent, confusing bug (using `useAuth` outside `AuthProvider`, getting `null` and crashing later on `.token`) into a loud, immediate, clearly-worded one — the same fail-loud instinct as backend Lesson 3's explicit `404` check.
3. `login`/`logout` functions provided *through* the context, not just the raw token: (worth noting deliberately). Any component can now trigger a real login/logout state change, not just read the current value — Context can carry functions exactly as easily as data, since it's really just "a value made ambiently available," and a function is a perfectly ordinary value.

### CS Lens

**Context as implicit dependency provision — directly parallel to backend `Depends()`, with a real, deliberate difference.** `Depends(get_current_member)` makes identity available to a route *explicitly*, declared in that specific function's signature. Context makes `useAuth()`'s value available *implicitly* to any descendant that asks, with no signature declaring the dependency anywhere in the component tree structure itself. Both solve "make this available without manually passing it everywhere," using genuinely different mechanisms suited to genuinely different constraints — a route's dependencies are usually a short, explicit, known list; a deep component tree's cross-cutting concerns (auth, theme) usually aren't.

### SE Lens

**Context is not a replacement for props, and overusing it is a real anti-pattern.** Genuinely local, parent-to-child data (F4's `member` prop passed to `MemberItem`) should stay as props — explicit, typed, traceable. Context is specifically for the smaller set of values that are truly cross-cutting (auth status, theme, locale) and would otherwise require drilling through many uninvolved layers. Reaching for Context by default, for everything, trades away the explicit traceability unidirectional props gave you in F4, for a convenience that isn't actually needed most of the time.

### Commands needed

```bash
npm run dev
```

### Run it. Show the real output.

`LoginForm`, updated to call `useAuth().login(token)` instead of managing its own token state, now makes the login status available to any component anywhere in the tree — a `Navbar` (built as an exercise) can show "Log out" only when `useAuth().token` is non-null, with zero props threaded through any intermediate component.

---

## Closing

**Connect the pieces**
`AuthContext` makes `token`, `login`, and `logout` available to any descendant of `AuthProvider`, at any depth, without prop-drilling. `useAuth()` wraps the raw `useContext` call with a clear failure if used outside the provider — a custom hook, a pattern that'll recur for any Context this project adds later.

**What breaks without this**
Without Context, every component needing to know login status — a navbar, a protected route, a comment form's placeholder text — would need that information threaded down as a prop through every layer between `App` and itself, even through components with no other reason to know or care about auth at all.

**Exercises**
1. Update `LoginForm` to call `useAuth().login(...)` instead of its own local token state, removing the now-redundant `useState` for the token.
2. Build a `Navbar` component, rendered once in `App`, showing "Log in" or "Log out" based on `useAuth().token` — direct proof of accessing auth state with zero props passed to it.

**Definition of Done**
* [x] `AuthContext`/`AuthProvider` built, wrapping the whole app.
* [x] `useAuth()` custom hook, failing loudly if misused outside the provider.
* [x] Can explain, without notes, when Context is the right tool versus when props still are.
* [x] Commit: `feat: AuthContext for app-wide auth state without prop-drilling`

---

## Context Snapshot (End of Lesson F8)

**Frontend File Tree:** adds `src/auth/AuthContext.tsx`; modifies `src/App.tsx`

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Prop-drilling | F8 | Passing data through uninvolved intermediate components just to relay it deeper |
| `createContext`/`Provider`/`useContext` | F8 | React's mechanism for making a value ambiently available to any descendant |
| Custom hook | F8 | A function wrapping one or more built-in hooks with additional logic (here, a safety check) |

**Lesson Completion State:**
- Completed: F1-F8, Interludes E, F — **Phase F3 complete**
- Next: F9 — shadcn/ui and Tailwind Fundamentals

**Maps to backend:** `AuthContext`'s `token`/`login`/`logout` triad is the client-side session-state counterpart to backend Lesson 14's server-side JWT issuance and verification.
