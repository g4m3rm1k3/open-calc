# Concept: A Ref Mirroring State Doesn't Update Itself

**What you'll understand by the end:** why holding a "live copy" of a
state value in a `useRef` — specifically so a long-lived callback can
read it without a stale closure — only actually works if something
explicitly re-assigns that ref every time the state changes; a ref
never updates on its own just because its state twin did.

**Prerequisites:** `react-useref-hook.md`, `react-useeffect-hook.md`.

## Setup

A React project (`npm create vite@latest my-app -- --template react-ts`).

## The Problem

`react-useeffect-hook.md` already names the "stale closure" failure: an
effect that omits a dependency it actually reads keeps using the value
from whenever it last ran. The usual fix is adding the missing
dependency. But a `useCallback` with an empty (or otherwise fixed)
dependency array — the shape a self-rescheduling loop needs, so the
*function itself* stays the same identity across renders — can't be
fixed that way: its closure is frozen at creation, permanently, by
design. The real workaround is reading a `useRef` instead of the state
value directly, since a ref's `.current` can be reassigned at any time
without needing a new closure. But that only solves the problem if
*something* actually reassigns it — a ref does not magically track its
state twin; declaring `useRef(value)` copies `value` once, at that
exact moment, and never again.

## The Isolated Example

```tsx
import { useCallback, useEffect, useRef, useState } from "react";

function Ticker() {
  const [multiplier, setMultiplier] = useState(1);
  const multiplierRef = useRef(multiplier); // copied once, at mount
  const [log, setLog] = useState<number[]>([]);

  const tick = useCallback(() => {
    setLog((prev) => [...prev, 10 * multiplierRef.current]);
  }, []); // frozen closure, by design -- this identity must stay stable

  useEffect(() => {
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <div>
      <button onClick={() => setMultiplier((m) => m + 1)}>
        multiplier: {multiplier}
      </button>
      <p>log: {log.join(", ")}</p>
    </div>
  );
}
```

**Real output (clicking the button to `multiplier: 3` partway through):**
```
log: 10, 10, 10, 10, 10, 10, ...
```

**What this proves:** `multiplierRef.current` was set to `1` once, at
mount, and `tick`'s own closure over `multiplierRef` never changes (it
doesn't need to — reading `.current` should reflect whatever's current)
— but nothing ever *writes* a new value into `multiplierRef.current`,
so it stays `1` forever regardless of what `multiplier` state becomes.

**The fix — one small, dedicated effect whose only job is the sync:**

```tsx
useEffect(() => {
  multiplierRef.current = multiplier;
}, [multiplier]);
```

**Real output, the identical sequence of clicks:**
```
log: 10, 10, 20, 20, 30, 30, ...
```

## Mechanical Walkthrough

- `const multiplierRef = useRef(multiplier)` — this argument is only
  ever read at the ref's *creation*, the first time this component
  mounts; every later render's `useRef(multiplier)` call is ignored by
  React (a ref's initial value is fixed the moment it's created), so
  this line alone can never keep the ref current.
- `tick`'s own `useCallback(() => {...}, [])` — an empty dependency
  array means React reuses the exact same function identity across
  every render, forever; the closure it captured at creation over
  `multiplierRef` (the ref object itself, not its `.current` value) is
  what stays valid — reading `.current` inside always sees whatever the
  ref currently holds, live, at call time.
- `useEffect(() => { multiplierRef.current = multiplier }, [multiplier])`
  — a second, tiny effect, with the *opposite* shape from `tick`'s own:
  its only job is running exactly when `multiplier` changes, to push
  the new value into the ref. This is what actually keeps the ref
  "live" — without it, the ref is just a one-time snapshot with a
  misleading name.

## CS Lens

This is a small, manual **observer**/synchronization pattern: two
representations of the same logical value (React state, for rendering;
a ref, for a frozen closure to read) that must be kept consistent by an
explicit act, because nothing in the language or framework does it for
you automatically. It's the same underlying idea as a cache that must
be explicitly invalidated/refreshed when its source of truth changes —
the cache doesn't know the source changed unless something tells it.

Also recognized in: a UI element manually kept in sync with a model
object in imperative UI toolkits (no framework re-render to rely on); a
denormalized database column that duplicates a value from another table
for read speed, requiring an explicit update whenever the source row
changes; any "shadow copy" of state kept for a context (a worker
thread, a native module callback) that can't directly access React's
own state.

## SE Lens

The real failure mode is silent and easy to mistake for something else
entirely: nothing throws, nothing logs an error — a control that reads
a ref just keeps behaving as if its very first value were still true,
while everything else in the UI correctly shows the new one. This
project hit that exactly: a speed-mode selector visibly changed (React
state, re-rendering correctly), while the actual running loop kept
behaving as though the original mode were still selected (the ref it
read was never told to update) — diagnosed only by carefully re-reading
every place a ref is declared and asking, for each one, "what, if
anything, keeps this synced after its first render?"

## Connection

Builds on `react-useref-hook.md` (what a ref is) and
`react-useeffect-hook.md` (the stale-closure failure this pattern
exists to route around, and the dependency-array mechanism the sync
effect itself relies on). Directly relevant to any self-rescheduling
loop (`browser-request-animation-frame.md`'s own shape) that needs to
read a value which can change *while the loop is already running*.

## Try It Yourself

1. Remove the sync effect and confirm the bug returns — the log stays
   at `10` forever regardless of how many times the button is clicked.
2. Add a second, independent piece of state (e.g. a boolean `paused`)
   mirrored the same way, and use it inside `tick` to skip logging —
   confirm it, too, requires its own dedicated sync effect; there is no
   way to mirror multiple values with a single shared effect unless
   they're intentionally meant to change together.
3. Replace `multiplierRef.current = multiplier` with a version that
   only updates the ref conditionally (e.g. `if (multiplier > 1)`) and
   observe the resulting bug — a partial sync is its own, different,
   real failure mode, not a safe simplification.
