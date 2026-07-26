# Lesson F7: Auth Token Handling

**What you will build**
Persistent token storage surviving page reloads, and automatic attachment of that token to every authenticated request — the frontend half of backend Lesson 14's `Depends(get_current_member)`. The problem we're solving: F5's login token currently lives only in `LoginForm`'s own `useState` — refresh the page, and it's gone. Worse, nothing yet actually sends it anywhere; every authenticated backend route (`POST /posts`, likes, follows, recommendations, admin analytics) would currently reject every request.

**What you need to know first**
F5 (login, `TokenResponse`). F2 (`apiFetch<T>`, `RequestInit`).

---

## Concept Unit: Persisting the Token

### The Problem

`useState` (F3) is discarded the instant a component unmounts — and a full page reload unmounts everything. A real session needs to survive that.

### Introduce the concept in isolation

Create `frontend/src/lab/storage_demo.ts`:

```typescript
localStorage.setItem("greeting", "hello");
console.log(localStorage.getItem("greeting"));
console.log(localStorage.getItem("nonexistent"));
```

Run it in a browser console — `"hello"` and `null` print. Reload the page, run `localStorage.getItem("greeting")` again — still `"hello"`, surviving the reload.

*What this proves:* `localStorage` persists genuinely outside of any component's lifecycle, across full page reloads — unlike every piece of state built so far in this project, all of which lived inside React and was discarded on unmount.

### Explain the mechanism, and an honest security tradeoff

`localStorage` is a browser-provided, per-origin key-value store, readable by *any* JavaScript running on the page — including, critically, malicious JavaScript injected via an XSS vulnerability, should one ever exist. Storing a JWT here means a successful XSS attack could steal it directly. The more secure alternative — an `httpOnly` cookie, invisible to JavaScript entirely — requires backend cookie-setting support this project's backend doesn't currently have (flagged honestly here as a real, deferred gap, not solved in this lesson). `localStorage` is used here as the pragmatic, common choice for a project at this stage, with this tradeoff named explicitly rather than silently accepted.

### Discard the throwaway example

Delete `frontend/src/lab/storage_demo.ts`. Build real token storage helpers.

### Project Change

* **Files affected:** Create `src/auth/tokenStorage.ts`.
* **Change type:** Add.

### The New Code

```typescript
// src/auth/tokenStorage.ts
const TOKEN_KEY = "access_token";

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}
```

### Mechanical walkthrough

1. Three small, named functions rather than calling `localStorage` directly everywhere: (already-established encapsulation instinct from backend Lesson 16's `PostRepository`). Every future piece of code depends on `getToken()`'s interface, not on `localStorage` directly — if storage strategy ever changes (to a cookie-based approach, closing the gap named above), only this one file needs to change.

### CS Lens

**Persistent client-side storage as the frontend's equivalent of the backend's database — same durability idea (Interlude D), a much smaller scale.** `localStorage` surviving a reload is structurally the same property SQLite's disk-backed storage has over Python's in-memory objects — durable across the "process" (here, the page) restarting.

### SE Lens

**Naming a security tradeoff honestly, even when not fully solving it, is itself the correct engineering behavior.** The `httpOnly` cookie alternative is real and more secure — deferring it here, explicitly, with the reason stated, is meaningfully different from never having considered it at all.

---

## Concept Unit: Attaching the Token Automatically

### The Problem

Even with the token stored, nothing currently sends it. Every authenticated backend route expects `Authorization: Bearer <token>` (backend Lesson 14) — repeating that header manually in every future API call would be exactly the duplication backend Lesson 16 already taught you to centralize instead.

### Project Change

* **Files affected:** `api/client.ts`.
* **Change type:** Modify.

### The New Code

```typescript
// api/client.ts — modified
import { getToken } from "../auth/tokenStorage";

const API_BASE = "http://localhost:8000";

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = getToken();
    const headers = {
        ...options.headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.detail ?? `Request failed: ${response.status}`);
    }
    if (response.status === 204) {
        return undefined as T;
    }
    return response.json();
}
```

```typescript
// src/LoginForm.tsx — persist the token on success
import { setToken } from "../auth/tokenStorage";
// ...
const result = await login(username, password);
setToken(result.access_token);
```

### Mechanical walkthrough

1. `...options.headers, ...(token ? {Authorization: ...} : {})`: (first appearance of the **spread operator**, `...`, used to merge objects). Combines any headers the caller already specified with the auth header, added only if a token actually exists — a request made before login simply omits it, rather than sending `Authorization: Bearer null`.
2. This one change makes every existing `apiFetch<T>` call in the entire project — `getMembers()`, `login()`, any future call — automatically authenticated, with zero changes needed to any of them: (worth stating directly). This is the concrete payoff of F2's centralization decision, exactly the way backend Lesson 16's payoff arrived in Lesson 18 as testability — here it arrives as "add one feature, every caller benefits."

### CS Lens

**This is the frontend mirror of backend Lesson 14's `Depends(get_current_member)`, running in the opposite direction.** The backend dependency *verifies* an incoming token and produces a trusted identity; this frontend change *attaches* an outgoing token so the backend has something to verify. Same concept — proving identity across a boundary — implemented on each side of that boundary.

### SE Lens

**Centralizing this in `apiFetch` means every future authenticated route "just works" the moment it's added, with no risk of forgetting the header on any individual call.** This eliminates an entire class of bug: a route working in one place and mysteriously failing with `401` in another, purely because one call site forgot to attach the token by hand.

### Commands needed

```bash
npm run dev
```

### Run it. Show the real output.

Logging in, then calling any authenticated endpoint (e.g., a manually-triggered `apiFetch("/recommendations")`) succeeds without any change to that call — the header is attached automatically, invisibly, and correctly.

---

## Closing

**Connect the pieces**
`tokenStorage.ts` persists the token across reloads via `localStorage`, a named, honest security tradeoff against `httpOnly` cookies. `apiFetch<T>` reads it on every call and attaches `Authorization: Bearer <token>` automatically — the frontend counterpart to backend Lesson 14's server-side verification, closing the authentication loop end-to-end for the first time.

**What breaks without this**
Without automatic attachment, every authenticated call site would need to remember to add the header manually — exactly the class of easy-to-forget, silently-401-failing bug backend Lesson 16 eliminated for authorization logic, now shown up on the frontend instead.

**Exercises**
1. Add a `logout()` function calling `clearToken()`, and a logout button that calls it, then confirm a subsequent authenticated request correctly fails with `401`.
2. Handle a `401` response globally inside `apiFetch` itself — if a response is `401`, call `clearToken()` automatically, since an expired or invalid token should never silently keep being sent.

**Definition of Done**
* [x] Token persists across page reloads via `localStorage`, tradeoff named explicitly.
* [x] `apiFetch<T>` attaches the token automatically to every request.
* [x] Can explain, without notes, the XSS risk `localStorage` carries and what the more secure alternative would require.
* [x] Commit: `feat: persistent token storage with automatic request authentication`

---

## Context Snapshot (End of Lesson F7)

**Frontend File Tree:** adds `src/auth/tokenStorage.ts`; modifies `api/client.ts`, `src/LoginForm.tsx`

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| `localStorage` | F7 | Persistent, per-origin, JS-readable browser storage — survives reloads |
| XSS risk of `localStorage` (named, not solved) | F7 | Any JS on the page, including injected malicious JS, can read it |
| Spread operator (`...`) | F7 | Merges/copies object or array contents |

**Lesson Completion State:**
- Completed: F1-F7, Interludes E, F
- Next: F8 — Global State Without Prop-Drilling (`AuthContext`)

**Maps to backend:** completes the authentication loop with backend Lesson 14 end-to-end — token issued server-side, stored and attached client-side, verified server-side on every subsequent call.
