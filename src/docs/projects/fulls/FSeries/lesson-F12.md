# Lesson F12: `useEffect`'s Dependency Array, Fully Explained

**What you will build**
Nothing new running — this lesson gives the dependency array the full mechanical explanation F3 deliberately deferred, and formalizes cleanup functions, which Interlude F used (`return () => clearInterval(interval)`) without explaining precisely. The problem we're solving: F3 said `[]` means "run once, on mount" and stopped there; real components need effects that re-run when *specific* values change, and Interlude F's stale-closure bug is, underneath, a direct consequence of exactly how the dependency array works.

**What you need to know first**
F3 (`useEffect`, basic use). Interlude F (the stale-closure bug this lesson directly explains the cause of).

---

## Concept Unit: What the Dependency Array Actually Compares

### The Problem

F3 only ever used `[]`. A component that needs to refetch when, say, a `memberId` prop changes needs the effect to re-run *specifically when that value changes* — neither "never again" (`[]`) nor "every single render" (no array at all) is correct for that case.

### Introduce the concept in isolation

Create `frontend/src/lab/DepsDemo.tsx`:

```tsx
import { useState, useEffect } from "react";

function DepsDemo() {
    const [count, setCount] = useState(0);
    const [other, setOther] = useState(0);

    useEffect(() => {
        console.log("Effect ran. count is:", count);
    }, [count]);

    return (
        <div>
            <button onClick={() => setCount(count + 1)}>Increment count ({count})</button>
            <button onClick={() => setOther(other + 1)}>Increment other ({other})</button>
        </div>
    );
}
```

Click "Increment count" a few times, then "Increment other" a few times.

Output:

```text
Effect ran. count is: 0    (initial render)
Effect ran. count is: 1
Effect ran. count is: 2
(clicking "Increment other" logs nothing further)
```

*What this proves:* the effect re-ran every time `count` changed, and *not at all* when `other` changed, despite `other`'s change also causing a re-render (the button's own label updates). React compares every value listed in the dependency array, render to render — only when at least one has actually changed does the effect run again.

### Explain the mechanism, and connect it directly to Interlude F

React compares each dependency using roughly `Object.is` (essentially `===` for primitives) between the previous render's value and the current one. If `[]` never changes (it's always an empty array, trivially "the same" in the sense that there's nothing to compare), the effect runs exactly once — precisely F3's claim, now with the actual mechanism behind it. Interlude F's bug is now fully explained: `[]` meant the effect (and the `setInterval` callback created inside it) was created *once*, during the first render, and — critically — never recreated, so it permanently closed over that first render's `count`. Adding `count` to the dependency array would have made the effect re-run on every change, recreating the interval (and its callback, freshly closing over the current `count`) each time — fixing the staleness, but at the cost Interlude F's own exercises flagged: a new interval created on every tick, never settling into a steady rhythm. This is exactly why Interlude F's actual fix used the functional update form instead — it sidesteps the tradeoff entirely, rather than choosing between "stale" and "constantly recreated."

### CS Lens

**The dependency array is a diffing mechanism, structurally similar to React's own reconciliation (comparing renders to decide what to update) — applied here to decide whether an effect needs to rerun, rather than what DOM needs to change.** Recognizing this as "compare old vs. new, act only on a difference" is the same underlying idea as Interlude F's closure comparison, and worth connecting rather than treating as an unrelated new rule.

---

## Concept Unit: Cleanup Functions, Precisely

### The Problem

Interlude F's `return () => clearInterval(interval)` was used without full explanation of exactly *when* it runs — and getting this wrong causes real bugs: intervals that never get cleared, event listeners that pile up, network requests that continue after a component no longer needs them.

### Introduce the concept in isolation

Create `frontend/src/lab/CleanupDemo.tsx`:

```tsx
import { useState, useEffect } from "react";

function Timer({ label }: { label: string }) {
    useEffect(() => {
        console.log(`${label}: effect started`);
        return () => console.log(`${label}: cleanup ran`);
    }, [label]);
    return <p>{label}</p>;
}

function App() {
    const [label, setLabel] = useState("first");
    return (
        <div>
            <Timer label={label} />
            <button onClick={() => setLabel("second")}>Change label</button>
        </div>
    );
}
```

Click "Change label" once.

Output:

```text
first: effect started
first: cleanup ran
second: effect started
```

*What this proves:* before the effect ran again with the new `label`, its *previous* cleanup function ran first — `"first: cleanup ran"` appears between the two `"effect started"` lines, not after both. Cleanup isn't only for unmounting; it runs before *every* re-run of the effect, precisely to undo whatever the previous run set up, before the new run sets up its own version.

### Explain the mechanism

A cleanup function, returned from an effect, runs in two situations: right before the effect runs again (due to a dependency changing), and when the component unmounts entirely. This is what made Interlude F's `clearInterval(interval)` correct: without it, changing `count` (had it been in the dependency array) would create a *new* interval on each change without ever clearing the *previous* one — accumulating multiple simultaneous, uncleared intervals, a real and easy-to-introduce resource leak, conceptually similar to backend Interlude D's memory-leak material, just for browser timers/subscriptions instead of heap memory.

### CS Lens

**Cleanup as symmetric setup/teardown — the same shape as backend Lesson 16's generator-based dependencies (`yield` ... `finally: conn.close()`).** Both guarantee that anything an effect (or a dependency) sets up gets torn down correctly, exactly once, regardless of how many times the surrounding code runs again — the same discipline, applied to a browser timer here instead of a database connection there.

### SE Lens

**Any effect that subscribes to something external — a timer, an event listener, a WebSocket — needs a cleanup function, as a rule, not a case-by-case judgment call.** Skipping cleanup "because it seemed to work" in initial testing is exactly the kind of gap that only becomes visible under real, repeated use (a component mounting and unmounting many times, accumulating uncleared subscriptions) — worth treating as a checklist item whenever an effect sets up something with an ongoing lifecycle beyond the current render.

### Commands needed

```bash
npm run dev
```

---

## Closing

**Connect the pieces**
The dependency array is compared value-by-value, render to render — a change in any listed value re-runs the effect, and F3's `[]` was always just the special case of "nothing to ever compare as different." Interlude F's bug is now fully explained by this mechanism: a closure created once, in an effect that correctly never re-ran per its `[]` array, permanently holding onto that first render's values. Cleanup functions run before every re-run and on unmount, guaranteeing symmetric setup/teardown the same way backend Lesson 16's generator dependencies guaranteed it for database connections.

**What breaks without this**
Omitting a value an effect actually uses from its dependency array reintroduces Interlude F's exact staleness bug, silently — no warning, no crash, just an effect quietly operating on outdated data forever. Omitting a needed cleanup function accumulates uncleared subscriptions or timers with every re-run, a resource leak that gets worse the longer a component stays mounted and re-renders.

**Exercises**
1. Modify `DepsDemo` to include `other` in the dependency array too (`[count, other]`), and confirm the effect now runs on *either* button's click.
2. Build a component using `addEventListener` (e.g., listening for window resize) inside `useEffect`, with a correct `removeEventListener` cleanup — direct practice with the pattern beyond timers specifically.

**Definition of Done**
* [x] Observed the dependency array's actual comparison behavior directly.
* [x] Observed cleanup running before a re-run, not just on unmount.
* [x] Can explain, without notes, exactly why Interlude F's bug happened, in terms of this lesson's mechanics.

---

## Context Snapshot (End of Lesson F12)

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Dependency array comparison | F12 | Each listed value compared render-to-render; effect reruns only if one changed |
| Cleanup function timing | F12 | Runs before every effect re-run, and on unmount — symmetric setup/teardown |

**Lesson Completion State:**
- Completed: F1-F12, Interludes E, F
- Next: Interlude G — Loading/Error State as a Design Problem
