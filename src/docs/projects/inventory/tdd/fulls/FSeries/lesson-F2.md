# Lesson F2: Talking to a Real API

**What you will build**
A typed function that calls the real backend's `GET /members` and returns actual data, plus a generic `apiFetch<T>` wrapper the rest of this project will reuse for every future endpoint. The problem we're solving: `fetch` returns a Promise (Interlude E), but naively used it has a real, commonly-missed gotcha — and repeating error-handling boilerplate for every one of the 21 backend routes would be exactly the kind of duplication backend Lesson 16 already taught you to recognize and fix.

**What you need to know first**
F1 (`types/api.ts`, `ApiResult<T>`). Interlude E (`async`/`await`, Promises, `try`/`catch`).

---

## Concept Unit: `fetch`, and the Gotcha That Catches Almost Everyone

### The Problem

Calling the real backend means handling two things that can go wrong differently: the network request itself failing (no connection, DNS failure), and the request *succeeding* but the server responding with an error status like `404` or `500`. `fetch` treats these two cases very differently, and assuming otherwise is a real, common bug.

### Introduce the concept in isolation

Make sure the backend is running (`uvicorn main:app --port 8000` from the consolidated backend). Create `lab_fetch.ts`:

```typescript
async function tryFetch(url: string) {
    const response = await fetch(url);
    console.log("status:", response.status, "ok:", response.ok);
    const data = await response.json();
    console.log("data:", data);
}

tryFetch("http://localhost:8000/members");
tryFetch("http://localhost:8000/members/99999");  // doesn't exist
```

Run it (compiled to JS, or via `ts-node`):

```bash
npx ts-node lab_fetch.ts
```

Output:

```text
status: 200 ok: true
data: [ { id: 1, username: 'ada' }, { id: 2, username: 'grace' } ]
status: 404 ok: false
data: { detail: 'Member not found' }
```

*What this proves — and this is the gotcha:* the second call, hitting a nonexistent member, did **not** throw an exception, and no `catch` block would have caught it. `fetch`'s Promise only rejects on a genuine network failure (no connection at all) — a `404` or `500` is, as far as `fetch` itself is concerned, a *successful* fetch that happens to carry an error status. `response.ok` (`true` only for status codes 200-299) is the actual signal that has to be checked explicitly.

### Explain the mechanism

`fetch` resolves its Promise the moment response *headers* arrive — `response.status` and `response.ok` are available immediately at that point, before the response body has necessarily finished downloading. `response.json()` is a *second*, separate async step, parsing the body once it's fully received. This two-stage design is deliberate: it lets code decide what to do based on the status *before* committing to parsing a potentially large body — but it also means nothing about this two-step process ever throws just because the *status* was 404 or 500. Only checking `response.ok` explicitly catches that.

### Discard the throwaway example

Delete `lab_fetch.ts`. Build a real, typed function that checks this correctly.

### Project Change

* **Files affected:** Create `api/members.ts`.
* **Change type:** Add.

### The New Code

```typescript
// api/members.ts
import type { Member } from "../types/api";

const API_BASE = "http://localhost:8000";

export async function getMembers(): Promise<Member[]> {
    const response = await fetch(`${API_BASE}/members`);
    if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.status}`);
    }
    return response.json();
}
```

### Mechanical walkthrough

1. `import type { Member } from "../types/api"`: (first appearance of `import type`). A TypeScript-specific import form for types only — makes clear this import exists purely for compile-time checking (Lesson F1's core distinction) and contributes nothing to the actual compiled JavaScript output.
2. `if (!response.ok) { throw new Error(...) }`: (already-established `response.ok` gotcha from isolation, now handled correctly). Converts `fetch`'s silent non-throwing behavior on HTTP errors into a real, catchable exception — the explicit fix for exactly the gap the isolation example demonstrated.
3. `Promise<Member[]>`: (already-established generic syntax from F1, applied to a function's return type). States precisely what this function eventually resolves to — the compiler will catch a caller treating the result as anything other than an array of `Member`.

### CS Lens

**Fail-fast at the boundary, the frontend version of a pattern you've already learned.** This mirrors backend Lesson 4's SE Lens almost exactly ("push validation to the boundary; let the inside of the function assume the input is already trustworthy") — except here the boundary is the network call itself, and the goal is converting a silent failure mode (`fetch` not throwing on `404`) into a loud one, as early as possible.

### SE Lens

**This exact gotcha is why some HTTP libraries (like `axios`) throw automatically on non-2xx responses, and `fetch` deliberately doesn't.** Neither design is simply "correct" — `fetch`'s choice gives more control (useful if you sometimes want to inspect a `404` without treating it as exceptional), at the direct cost of this easy-to-miss trap. Knowing *why* the trap exists, rather than just memorizing "always check `response.ok`," is what lets you evaluate that tradeoff yourself later, on other APIs or libraries.

### Commands needed

```bash
npx ts-node -e "import('./api/members').then(m => m.getMembers().then(console.log))"
```

### Run it. Show the real output.

```text
[ { id: 1, username: 'ada' }, { id: 2, username: 'grace' } ]
```

### Connecting sentence

`getMembers` works, but this exact pattern — fetch, check `response.ok`, parse JSON, type the result — will need to repeat for every one of the backend's 21 routes. Lesson 16 already taught you what to do when that happens.

---

## Concept Unit: A Generic, Reusable Fetch Wrapper

### The Problem

Copying `getMembers`'s body for `getFeed`, `login`, `getPostDetail`, and every other endpoint means the exact same `response.ok` check duplicated 21 times — precisely the pattern backend Lesson 16 fixed with `PostRepository`, just not yet recognized here.

### Introduce the concept in isolation

Create `lab_generic_fetch.ts`:

```typescript
async function apiFetch<T>(url: string): Promise<T> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
    }
    return response.json() as Promise<T>;
}

interface Cat { name: string }
interface Dog { breed: string }

async function demo() {
    const cat = await apiFetch<Cat>("https://example.com/cat.json");
    const dog = await apiFetch<Dog>("https://example.com/dog.json");
}
```

*What this proves, without even needing to run it:* `apiFetch<Cat>` and `apiFetch<Dog>` are both valid, fully type-checked calls to the *same single function* — `tsc` knows `cat` is a `Cat` and `dog` is a `Dog`, purely from the type argument supplied at each call site, exactly the same generic mechanism as F1's `Box<T>`, now applied to a real async function instead of a toy example.

### Discard the throwaway example

Delete `lab_generic_fetch.ts`. Build the real, shared wrapper.

### Project Change

* **Files affected:** Create `api/client.ts`. Modify `api/members.ts`.
* **Change type:** Add + Modify.

### The New Code

```typescript
// api/client.ts
const API_BASE = "http://localhost:8000";

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE}${path}`, options);
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
// api/members.ts — simplified
import type { Member } from "../types/api";
import { apiFetch } from "./client";

export function getMembers(): Promise<Member[]> {
    return apiFetch<Member[]>("/members");
}
```

### Mechanical walkthrough

1. `options?: RequestInit`: (first appearance of an optional parameter, `?`). `RequestInit` is a built-in TypeScript type describing `fetch`'s second argument (method, headers, body) — optional here because a plain `GET` (like `getMembers`) needs none of it, while a future `POST` (Lesson F5's login form) will.
2. `body?.detail ?? \`Request failed: ${response.status}\``: (first appearance of `??`, the **nullish coalescing operator**). Uses the backend's own `HTTPException` detail message (Lesson 3's `{"detail": "..."}` shape) when available, falling back to a generic message only if the error body couldn't be parsed at all — directly reusing the backend's own error messages instead of inventing new ones on the frontend.
3. `if (response.status === 204) { return undefined as T; }`: (first appearance of handling backend Lesson 6's `204 No Content` specifically). `response.json()` would throw trying to parse an empty body — this check avoids that for exactly the routes (like `DELETE /posts/{id}`) that correctly return nothing.
4. `getMembers` now one line: (already-established generic call pattern from isolation). Every future endpoint function will follow this identical shape — call `apiFetch<SomeType>(path)`, nothing else.

### CS Lens

**This is Lesson 16's Dependency Inversion, restated on the frontend.** Every future component will depend on `getMembers()`'s *interface* (a function returning `Promise<Member[]>`), not on `fetch`, URLs, or error-handling details directly — exactly the same inversion that let backend routes depend on `PostRepository`'s interface instead of raw SQL. The concrete payoff will be identical too: components built this way can be tested against a mocked `getMembers`, the frontend equivalent of backend Lesson 18's `MagicMock`.

### SE Lens

**Centralizing error messages at the boundary means the UI can trust them.** Every future component that calls `apiFetch` can display `error.message` directly to a user, confident it's either the backend's own deliberate, human-readable `detail` message (Lesson 14's login errors, Lesson 6's `403`/`404` messages) or a clear generic fallback — never a raw, confusing browser network error.

### Commands needed

```bash
npx ts-node -e "import('./api/members').then(m => m.getMembers().then(console.log))"
```

### Run it. Show the real output.

```text
[ { id: 1, username: 'ada' }, { id: 2, username: 'grace' } ]
```

### Connecting sentence

Data can now be fetched, typed, and correctly error-handled. Nothing has rendered on screen yet — Phase F2 starts exactly there, with the first real React component.

---

## Closing

**Connect the pieces**
`apiFetch<T>` checks `response.ok` explicitly (closing the gap `fetch` leaves open by design), surfaces the backend's own error messages via `??`, and handles `204` responses correctly — all in one place. `getMembers()` and every future endpoint function reduce to a single line calling it, the same abstraction-over-duplication instinct as backend Lesson 16, now protecting the frontend from the identical class of copy-pasted-then-silently-diverging bug.

**What breaks without this**
Without checking `response.ok`, a `404` or `500` from the backend would be silently treated as a successful response containing an error-shaped JSON body — a UI built on that assumption would try to render `{"detail": "Member not found"}` as if it were real member data, producing a confusing, broken-looking screen with no exception ever thrown to explain why.

**Exercises**
1. Add `getFeed(limit?: number): Promise<FeedPost[]>` and `getPostDetail(id: number): Promise<PostDetail>` to a new `api/posts.ts`, both built on `apiFetch<T>`.
2. Deliberately stop the backend server, run `getMembers()` again, and observe what error actually gets thrown — confirm it's a genuine network failure this time, distinct from the `404` case, and that both are now caught by the same `try`/`catch` a caller would use.

**Definition of Done**
* [x] `apiFetch<T>` checks `response.ok` explicitly, closing `fetch`'s known gotcha.
* [x] Backend error messages surfaced via the response body's `detail` field.
* [x] `204 No Content` handled without attempting to parse an empty body.
* [x] Commit: `feat: generic typed API client with correct HTTP error handling`

---

## Context Snapshot (End of Lesson F2)

**Frontend File Tree:** `types/api.ts`, `api/client.ts`, `api/members.ts`

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| `response.ok` gotcha | F2 | `fetch` only rejects on network failure, not on HTTP error status codes |
| `import type` | F2 | A type-only import, contributing nothing to compiled output |
| Optional parameter (`?`) | F2 | A parameter that may be omitted, given a default meaning by its absence |
| Nullish coalescing (`??`) | F2 | Falls back to a default only when the left side is `null`/`undefined` |

**Lesson Completion State:**
- Completed: F1, Interlude E, F2 — **Phase F1 complete**
- Next: F3 — First Component (Vite setup, JSX, rendering real data)

**Maps to backend:** `apiFetch<T>` consumes the backend's `HTTPException` detail messages directly (backend Lesson 3) and correctly handles `204` (backend Lesson 6) — first real frontend/backend contract point exercised end-to-end.
