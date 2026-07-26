# Lesson F3: First Component

**What you will build**
A real Vite project with one component, rendering the actual list of members from the running backend on screen for the first time. The problem we're solving: everything built in F1-F2 has run in scripts, printing to a terminal — nothing has been *seen* yet. Getting real fetched data on screen honestly requires two hooks (`useState`, `useEffect`) the original curriculum map deferred to F5 and F12 — this lesson gives both their real, proper first explanation now, since rendering fetched data genuinely can't happen without them; F5 and F12 will build deeper on this foundation rather than starting from zero.

**What you need to know first**
F2 (`getMembers()`, `apiFetch<T>`). Interlude E (`async`/`await`).

---

## Concept Unit: JSX Is Not HTML — It's Syntactic Sugar

### The Problem

React components are conventionally written with what looks like HTML directly inside JavaScript/TypeScript — syntactically, that shouldn't be possible in either language. Understanding what this actually compiles to matters before writing a single component, the same way Lesson F1 insisted on understanding what TypeScript's types compile *away* to.

### Introduce the concept in isolation

Create `lab_jsx.tsx`:

```tsx
const element = <h1>Hello, {2 + 2}</h1>;
console.log(element);
```

Compile it (Vite/the TypeScript+JSX toolchain handles this automatically in a real project; here, inspecting the transform directly):

```bash
npx tsc --jsx react-jsx --outDir dist lab_jsx.tsx
cat dist/lab_jsx.js
```

Output (abridged to the relevant transformed line):

```javascript
const element = (0, jsx_runtime_1.jsx)("h1", { children: ["Hello, ", 4] });
console.log(element);
```

*What this proves:* `<h1>Hello, {2 + 2}</h1>` was never real HTML at all — it compiled to a plain function call, `jsx("h1", {children: [...]})`, producing a plain JavaScript object describing "an `h1` element with this content," not any actual rendered output. `{2 + 2}` inside the JSX was evaluated as ordinary JavaScript (`4`) and embedded into that object — `{}` inside JSX is the escape hatch back into real code, exactly analogous to `${}` inside a template string.

### Explain the mechanism

This is **syntactic sugar** — the identical framing Interlude E used for `async`/`await` over Promises. JSX isn't a new language feature the JavaScript engine understands; it's special syntax a build tool (here, `tsc`'s JSX transform, which Vite uses the same way) rewrites into ordinary function calls before anything actually runs. `jsx("h1", {...})` returns a plain JavaScript object — not real DOM, not anything visible yet — just a description of what *should* eventually appear. Turning that description into actual pixels on screen is React's job, not JSX's.

### Discard the throwaway example

Delete `lab_jsx.tsx` and `dist/`. Set up the real project.

### Project Change

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

* **Files affected:** New Vite project (`frontend/`).
* **Change type:** Add.

---

## Concept Unit: Components, `useState`, and `useEffect`

### The Problem

A React component is, underneath, a function — but a function needs a way to (1) hold onto data that changes over time (the fetched members, once they arrive) and (2) trigger a side effect (fetching) at the right moment (once, when the component first appears), *without* React re-running the fetch on every single re-render. Neither of these is possible with a plain function's ordinary local variables, which Interlude A already established are discarded and recreated fresh on every call.

### Introduce the concept in isolation

Create `frontend/src/Counter.tsx`:

```tsx
import { useState } from "react";

function Counter() {
    const [count, setCount] = useState(0);
    return (
        <button onClick={() => setCount(count + 1)}>
            Clicked {count} times
        </button>
    );
}

export default Counter;
```

Temporarily render it in `frontend/src/App.tsx` and run:

```bash
npm run dev
```

Clicking the button repeatedly shows the count incrementing on screen, persisting across clicks despite `Counter` being, mechanically, just a function.

*What this proves:* `count` survives between renders — clicking the button doesn't reset it back to `0`, even though `Counter()` genuinely does run again on every click. `useState(0)` isn't an ordinary local variable (which Interlude A's stack-frame model would predict gets discarded and recreated every call) — React stores `count`'s actual value *outside* the function itself, associated with this specific component instance, and hands it back in on every re-render.

### Explain the mechanism

`useState(0)` returns a pair: the current value, and a function (`setCount`) that updates it *and* tells React "re-render this component." Calling `setCount` doesn't mutate `count` directly (consistent with Interlude A's caution about mutation) — it schedules a fresh render, during which `useState(0)` runs again but returns the *new*, updated value instead of the initial `0` this time. This is worth being precise about: `Counter()` really does run again from the top on every click; what persists isn't a variable inside the function, but state React manages on the function's behalf, external to any single call.

### Now, the second hook — fetching data once, on mount

Create `frontend/src/MemberList.tsx`:

```tsx
import { useState, useEffect } from "react";
import { getMembers } from "../api/members";
import type { Member } from "../types/api";

function MemberList() {
    const [members, setMembers] = useState<Member[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getMembers()
            .then(setMembers)
            .catch((err) => setError(err.message));
    }, []);

    if (error) return <p>Error: {error}</p>;

    return (
        <ul>
            {members.map((member) => (
                <li key={member.id}>{member.username}</li>
            ))}
        </ul>
    );
}

export default MemberList;
```

Render `<MemberList />` in `App.tsx`, run `npm run dev`, and open the page — the real members from the running backend (`ada`, `grace`) appear as a list.

### Mechanical walkthrough

1. `useState<Member[]>([])`: (already-established `useState` from isolation, now with a generic type argument, directly reusing F1's generics). Starts as an empty array; `setMembers` will later replace it with the real fetched list.
2. `useEffect(() => { ... }, [])`: (first appearance). Registers a **side effect** — code with a consequence outside of just computing a render output (here: a network call) — to run after the component renders. The second argument, `[]` (an empty **dependency array**), tells React "run this effect once, after the first render, and never again automatically." A full explanation of *why* the dependency array works this way, and what happens with other values inside it, is deliberately deferred to F12 — this is enough to use it correctly for a fetch-once-on-mount case, which is the majority of real usage.
3. `getMembers().then(setMembers).catch(...)`: (already-established Promise `.then()`/`.catch()` chain from Interlude E, real usage). Notice this is `.then()`, not `await` — a React component function itself cannot be declared `async` (a real, easy-to-hit trap worth naming directly: React expects a component function to return JSX synchronously, not a Promise), so the async work happens inside a plain `.then()` chain within the synchronous `useEffect` callback instead.
4. `key={member.id}`: (first appearance). React requires a stable, unique `key` on each item in a rendered list — used internally to track which specific item is which across re-renders, so it can update efficiently rather than assuming the whole list changed.

### CS Lens

**State living outside the function's own stack frame is exactly the reference/heap distinction from Interlude A, applied to a UI framework's internal model.** `Counter()`'s local variables would be freshly created and discarded every call, per the ordinary stack-frame model — `useState`'s actual storage is deliberately *external* to that, which is precisely what lets it persist. Recognizing this as a variation on an already-understood mechanism, rather than "React magic," is the real payoff of having built that mental model back in the backend track.

### SE Lens

**A component can't be `async` — this is a structural constraint worth understanding, not just memorizing.** React needs to call a component function and get JSX back *immediately*, synchronously, to know what to render right now — an `async` function always returns a Promise, never the real value directly, which is incompatible with how React actually calls components. `useEffect` is the sanctioned place for async work precisely because it runs *after* rendering already happened, not as part of producing the render output itself.

### Commands needed

```bash
npm run dev
```

### Run it. Show the real output.

Opening the dev server's URL shows a real, rendered list: `ada`, `grace` — sourced live from the backend's `social.db`, through `getMembers()`, through `apiFetch<T>`, through the browser's real network stack.

### Connecting sentence

One component, rendering real data. The next lesson splits this into properly composed pieces — right now, `MemberList` does everything itself; real applications split rendering, fetching, and layout into smaller, reusable components.

---

## Closing

**Connect the pieces**
JSX compiles to plain function calls describing UI, not real HTML — React's actual job is turning that description into rendered output. `useState` gives `MemberList` a place to hold fetched data that survives across re-renders, external to the function's own stack frame. `useEffect` with an empty dependency array runs the fetch exactly once, after the first render, using a `.then()` chain rather than `await` directly, since a component function itself can never be `async`.

**What breaks without this**
Without `useEffect`'s empty dependency array specifically, calling `getMembers()` directly in the component's own function body (not inside `useEffect`) would refetch on *every single render* — including the very re-render that `setMembers` itself triggers once the data arrives, producing an infinite fetch loop, a real and common beginner mistake this lesson's structure avoids by construction.

**Exercises**
1. Add a loading state (`const [loading, setLoading] = useState(true)`), set it to `false` once the fetch resolves (in both the `.then()` and `.catch()` branches), and render `<p>Loading...</p>` while `loading` is `true`.
2. Temporarily remove the `[]` dependency array from `useEffect` entirely, observe what happens (open the browser's network tab), then restore it — direct, observed proof of the infinite-loop risk named above.

**Definition of Done**
* [x] Real Vite + React + TypeScript project running.
* [x] `MemberList` renders live data from the actual backend via `getMembers()`.
* [x] Can explain, without notes, why a React component function can never be declared `async`.
* [x] Commit: `feat: first component rendering live member data via useState/useEffect`

---

## Context Snapshot (End of Lesson F3)

**Frontend File Tree:** `frontend/` (real Vite project), `src/MemberList.tsx`, `src/Counter.tsx` (throwaway, can be removed)

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| JSX (compiles to function calls) | F3 | Syntactic sugar over `jsx(...)` calls producing plain description objects, not real DOM |
| `useState` | F3 | State persisted outside the component function's own call, across re-renders |
| Side effect (React) | F3 | Code with consequences beyond computing a render output — network calls, timers, etc. |
| `useEffect` + dependency array (basic use) | F3 | Runs after render; `[]` means "once, on mount" — full mechanics deferred to F12 |
| `key` prop (lists) | F3 | Stable identity React uses to track list items efficiently across re-renders |
| Component can't be `async` | F3 | Must return JSX synchronously; async work happens inside `useEffect` instead |

**Lesson Completion State:**
- Completed: F1, Interlude E, F2, F3
- Next: F4 — Props and Composition

**Curriculum map note:** F5 ("State and Controlled Inputs") and F12 ("`useEffect`, Explained Mechanically") originally introduced these hooks from scratch — both now build on this lesson's real first appearance instead. F5 extends `useState` to controlled form inputs; F12 covers the dependency array's full mechanics (non-empty arrays, stale closures, cleanup functions) rather than reintroducing the hook itself.
