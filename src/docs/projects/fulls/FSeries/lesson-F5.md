# Lesson F5: Controlled Inputs

**What you will build**
A real login form, calling the backend's `POST /login`, extending `useState` (already taught in F3) to form inputs instead of fetched data. The problem we're solving: nothing built so far accepts typed user input — every value has come from the backend. A form needs React to actually own what's in each field, not just read it after the fact.

**What you need to know first**
F3 (`useState`). F2 (`apiFetch<T>`, `RequestInit`).

---

## Concept Unit: Controlled Inputs

### The Problem

A plain HTML `<input>` manages its own value internally, in the DOM, invisible to React unless explicitly asked. To validate as someone types, disable a submit button until both fields are filled, or simply know the current value to send on submit, React needs to be the actual source of truth for that value — not the DOM.

### Introduce the concept in isolation

Create `frontend/src/lab/EchoInput.tsx`:

```tsx
import { useState } from "react";

function EchoInput() {
    const [text, setText] = useState("");
    return (
        <div>
            <input value={text} onChange={(e) => setText(e.target.value)} />
            <p>You typed: {text}</p>
        </div>
    );
}
```

Render it and type — each keystroke updates the `<p>` immediately.

*What this proves:* the input's displayed value is `{text}` — a piece of state, not something the DOM manages independently. `onChange` fires on every keystroke, and `setText(e.target.value)` updates state with what was just typed; React then re-renders the input with `value={text}`, which is what makes the character actually *appear*. This is a genuinely circular-looking flow — the input's value comes from state that the input itself updates — and that circularity is precisely what "controlled" means: nothing appears in the field that state didn't put there.

### Explain the mechanism

An input with a `value` prop set from state, updated via `onChange`, is a **controlled input** — React fully owns its value at every moment. An input with no `value` prop (using the DOM's own internal value, read only when needed, e.g. via a ref) is **uncontrolled** — simpler for a one-off case, but unable to validate live or easily reset from outside.

### Discard the throwaway example

Delete `frontend/src/lab/`. Build the real login form.

### Project Change

* **Files affected:** Create `src/LoginForm.tsx`.
* **Change type:** Add.

### The New Code

```tsx
// src/LoginForm.tsx
import { useState } from "react";

function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (
        <form>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
            />
            <button type="submit">Log in</button>
        </form>
    );
}

export default LoginForm;
```

### Mechanical walkthrough

1. Two independent `useState` calls: (already-established from F3, extended to two fields instead of one array). Each field owns its own piece of state — `username` and `password` are entirely separate, updated independently.
2. `type="password"`: (first appearance, plain HTML attribute). Masks the input visually; the actual controlled-value mechanism underneath is identical to the username field.

### CS Lens

**Single source of truth, applied to UI state.** A controlled input has exactly one place its value can come from — React state — eliminating an entire class of bug where the DOM's actual displayed value and what the application *thinks* the value is could drift apart. This is the UI-layer version of backend Lesson 8's denormalization caution: two places claiming to hold the same value is a synchronization risk; one place is not.

### SE Lens

**Controlled inputs cost a re-render per keystroke, in exchange for validation and control.** For a form this small, that cost is irrelevant. It's worth knowing it exists as a real, if usually negligible, tradeoff — the same space-time-adjacent tradeoff shape from backend Lesson 23, now showing up as "re-render frequency" instead of "cache staleness."

---

## Concept Unit: Submitting the Form

### The Problem

The form currently does nothing on submit — clicking the button, or pressing Enter, needs to prevent the browser's default full-page-reload form behavior, then actually call the backend's `POST /login`.

### The failing test (conceptual — verified by hand for this lesson; F14 formalizes frontend testing)

Manually: submitting with a real seeded account's credentials should show a success state; wrong credentials should show the backend's actual `401` message.

### Introduce the concept in isolation

Create `frontend/src/lab/PreventDefault.tsx`:

```tsx
function PreventDefault() {
    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log("Submitted without a page reload");
    }
    return (
        <form onSubmit={handleSubmit}>
            <button type="submit">Submit</button>
        </form>
    );
}
```

Click submit — `"Submitted without a page reload"` logs, and the page genuinely does not reload, which it would by default without `e.preventDefault()`.

*What this proves:* a browser's native, decades-old default is to reload the page on form submission — `e.preventDefault()` is the explicit opt-out, necessary for any form React is meant to handle itself via JavaScript rather than a real page navigation.

### Discard the throwaway example

Delete `frontend/src/lab/`. Wire real submission into `LoginForm`.

### Project Change

* **Files affected:** `src/LoginForm.tsx`. Create `api/auth.ts`.
* **Change type:** Add + Modify.

### The New Code

```typescript
// api/auth.ts
import type { TokenResponse } from "../types/api";
import { apiFetch } from "./client";

export function login(username: string, password: string): Promise<TokenResponse> {
    return apiFetch<TokenResponse>("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
}
```

```tsx
// src/LoginForm.tsx — add submission handling
import { useState } from "react";
import { login } from "../api/auth";

function LoginForm() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            const result = await login(username, password);
            setToken(result.access_token);
        } catch (err) {
            setError((err as Error).message);
        }
    }

    if (token) return <p>Logged in. Token: {token.slice(0, 20)}...</p>;

    return (
        <form onSubmit={handleSubmit}>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
            {error && <p style={{ color: "red" }}>{error}</p>}
            <button type="submit">Log in</button>
        </form>
    );
}

export default LoginForm;
```

### Mechanical walkthrough

1. `method: "POST", headers: {...}, body: JSON.stringify(...)`: (already-established `RequestInit` from F2, real usage). `JSON.stringify` converts the JS object to a JSON string — the backend's `LoginRequest` Pydantic model (backend Lesson 14) expects exactly this shape, matched by hand here since no codegen exists (flagged back in F1).
2. `async function handleSubmit`: (already-established `async`/`await` from Interlude E, first use inside an event handler rather than `useEffect`). Unlike a component function itself, an event handler *can* be `async` — it's not called the way React calls a component (expecting synchronous JSX back), it's called the way any event callback is, with no such constraint.
3. `(err as Error).message`: (first appearance of a **type assertion**, `as`). TypeScript's `catch` clause types its caught value as `unknown` by default (it could genuinely be anything thrown), so accessing `.message` requires asserting it's actually an `Error` first — a real, honest gap: this assertion is trusted, not verified, the same category of risk F1 named for any assumption about runtime data a compile-time type can't actually guarantee.

### CS Lens

**Optimistic vs. pessimistic UI update ordering, previewed.** This form is deliberately pessimistic: it waits for the server's real response before showing success or failure. Lesson F16 revisits this tradeoff directly for likes/follows, where waiting for the round-trip feels sluggish enough that updating immediately (optimistically) and rolling back on failure becomes the better choice — login is a case where waiting is clearly correct instead, since showing "logged in" before the server actually confirms it would be actively misleading.

### SE Lens

**Reusing the backend's exact error message, again.** `(err as Error).message` will contain whatever `apiFetch` threw — which, per F2, is the backend's own `detail` field whenever available (`"Invalid username or password"`, backend Lesson 14's deliberately uniform failure message). The frontend never invents its own wrong-password copy; it displays exactly what the backend, which actually knows what went wrong, decided to say.

### Commands needed

```bash
npm run dev
```

### Run it. Show the real output.

Submitting real credentials (seeded via `POST /accounts` first) shows a truncated real JWT. Submitting wrong credentials shows the backend's exact `"Invalid username or password"` message, styled in red.

---

## Closing

**Connect the pieces**
`username` and `password` are fully React-owned, controlled state. `handleSubmit` prevents the browser's native reload, calls `login()` (built on F2's `apiFetch<T>`), and either stores the real token or displays the backend's own error message — nothing about login's actual logic lives in the frontend; it only calls the backend and reflects what comes back.

**What breaks without this**
Without `e.preventDefault()`, submitting the form would trigger a full page reload to nowhere meaningful (no server-rendered page exists at this URL for a plain form POST), losing all component state instantly and never actually calling `login()` at all.

**Exercises**
1. Disable the submit button while a request is in flight (`const [submitting, setSubmitting] = useState(false)`), prevent double-submission.
2. Add a minimum-length client-side check on `password` before calling `login()` at all, mirroring backend Lesson 13's `Field(min_length=8)` — and consider, in a sentence, why this frontend check doesn't remove the need for the backend's own check (a direct callback to backend Lesson 4's trust-boundary material: never trust that client-side validation alone was actually enforced).

**Definition of Done**
* [x] Username and password are controlled inputs.
* [x] Submission calls the real `POST /login`, handling both success and the backend's real error message.
* [x] Can explain, without notes, why an event handler can be `async` but a component function cannot.
* [x] Commit: `feat: controlled login form calling real backend authentication`

---

## Context Snapshot (End of Lesson F5)

**Frontend File Tree:** adds `src/LoginForm.tsx`, `api/auth.ts`

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Controlled input | F5 | An input whose value is fully owned by React state, not the DOM |
| Uncontrolled input (contrast) | F5 | DOM-owned value, read only when needed |
| `e.preventDefault()` | F5 | Opts out of a browser's native default behavior (here, full-page reload on submit) |
| Type assertion (`as`) | F5 | Trusting a value's type without runtime verification |
| Event handlers can be `async` (contrast with components) | F5 | Not subject to the same synchronous-return constraint as a component function |

**Lesson Completion State:**
- Completed: F1-F5, Interlude E
- Next: Interlude F — Closures and Stale State

**Maps to backend:** `login()`'s request body shape matches `LoginRequest` (backend Lesson 14) exactly; the error path exercises backend Lesson 14's uniform-failure-message design end-to-end for the first time on the frontend.
