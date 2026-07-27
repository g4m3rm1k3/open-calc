# Interlude F: Closures and Stale State

**What you will build**
Nothing new — a deliberately broken counter, demonstrating a real, common React bug class caused by closures capturing outdated state, then the fix. The problem we're solving: F3 explained that `useState`'s value survives across renders by living outside the function's own stack frame — but the *function itself* still closes over whatever value was current at the moment it was created, which causes a specific, well-known class of bug the moment a callback outlives the render it was created in.

**What you need to know first**
Backend Interlude A (reference/aliasing — the same underlying mechanism, new context). F3 (`useState`).

**Exemption from the failing-test-first rule:** demonstrates a real bug directly, per this project's Interlude convention.

---

## Concept Unit: The Bug

### Demonstrate the behavior

Create `frontend/src/lab/BrokenCounter.tsx`:

```tsx
import { useState, useEffect } from "react";

function BrokenCounter() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            console.log("Interval sees count as:", count);
            setCount(count + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return <p>Count: {count}</p>;
}
```

Render it and watch the console for several seconds.

Output:

```text
Interval sees count as: 0
Interval sees count as: 0
Interval sees count as: 0
...
```

*What this proves — the bug, directly:* the displayed `<p>Count: {count}</p>` also stays stuck at `1` after the first tick, never incrementing further, despite `setCount` being called every second. The interval's callback keeps reporting `count` as `0`, forever, even though a *new* render (with a fresh `count`) genuinely happens each time `setCount` is called.

### Explain the mechanism

A **closure** is a function that "remembers" the variables in scope at the moment it was created — the callback passed to `setInterval` closed over `count` as it was during the *one* render when `useEffect`'s `[]` dependency array meant the effect (and everything inside it, including this callback) ran exactly once, and never again. Every subsequent tick calls that *same*, original callback — still holding `count`'s value from that first render, permanently, because a closure captures a reference to that specific value at creation time, and this callback was never recreated. This is structurally the identical mechanism as backend Interlude A's aliasing bug: a reference to something that changed elsewhere, still pointing at the old snapshot, because nothing re-established the reference.

### The fix

```tsx
useEffect(() => {
    const interval = setInterval(() => {
        setCount((prevCount) => prevCount + 1);
    }, 1000);
    return () => clearInterval(interval);
}, []);
```

*What this proves:* `setCount((prevCount) => prevCount + 1)` — the **functional update** form — doesn't reference the closed-over `count` at all. React calls this function with whatever the *actual current* state is at the moment the update is applied, regardless of what the closure captured when it was created. The count now increments correctly, every second, indefinitely.

### CS Lens

**A closure is a reference to a specific captured environment — a variation on Interlude A's aliasing problem, not a new mechanism.** `count` inside the interval's original callback isn't re-read from `useState` on each tick; it's the literal value that existed in that one render's scope, permanently. The functional update form sidesteps this entirely by not closing over the value at all — it asks React for the current value at the moment the update actually runs, instead.

### SE Lens

**Prefer the functional update form whenever a new state value depends on the previous one, inside any callback that might outlive its render.** This isn't specific to intervals — the identical bug shows up in event handlers, timeouts, and async callbacks whenever `[]` or a stale dependency array means the callback was created once and reused. Recognizing "this callback references state, and might run again later" as the trigger for using the functional form is the actual transferable skill here, more than memorizing this one example.

---

## Closing

**Connect the pieces**
`useState`'s stored value survives across renders (F3), but any callback created during a specific render closes over that render's *specific* values — a closure, capturing a snapshot, not a live connection back to future state. The functional update form (`setCount(prev => prev + 1)`) avoids depending on the closure at all, asking for the true current value only when the update actually applies.

**What breaks without this**
The exact bug demonstrated above — a counter that appears to try incrementing but silently gets stuck — is a genuinely common, real-world React bug, precisely because it produces no error, no warning, just quietly wrong behavior, the same silent-failure category as backend Lesson 19's missing `LEFT JOIN`.

**Exercises**
1. Reproduce the bug with a `setTimeout` instead of `setInterval`, confirming the same stale-closure behavior shows up there too.
2. Predict, before running it, what a version of `BrokenCounter` with `count` *added* to the dependency array (`[count]` instead of `[]`) would do differently — then verify, and explain in a sentence why that "fixes" the staleness but introduces a different problem (a new interval created on every single tick, never actually accumulating a steady one-second rhythm).

**Definition of Done**
* [x] Reproduced the stale-closure bug directly, observed via `console.log`.
* [x] Fixed it using the functional update form, confirmed by the counter incrementing correctly.
* [x] Can explain, without notes, why this is the same underlying mechanism as backend Interlude A's aliasing bug.

---

## Context Snapshot (End of Interlude F)

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Closure | Interlude F | A function retaining a reference to its creation-time scope |
| Stale closure (bug) | Interlude F | A closure referencing outdated state because it was never recreated |
| Functional state update (`setX(prev => ...)`) | Interlude F | Requests the true current state at update time, sidestepping closure staleness |

**Lesson Completion State:**
- Completed: F1-F5, Interludes E, F — **Phase F2 complete**
- Next: F6 — Routing
