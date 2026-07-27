# Concept: React Effects Compare Dependencies by Reference

**What you'll understand by the end:** why a `useEffect`/`useMemo` can
re-run every single render even though the value it depends on "hasn't
really changed" — and why memoizing the *upstream* value, not the
effect itself, is the actual fix.

**Prerequisites:** `deep-equality-vs-reference-equality.md`,
`caching-and-memoization.md`.

## Setup

A React project (`npm create vite@latest my-app -- --template react-ts`).

## The Problem

`deep-equality-vs-reference-equality.md` already covers the general
distinction: two independently-built objects with identical contents
are still two different objects in memory. React's own dependency
arrays (`useEffect(fn, [value])`, `useMemo(fn, [value])`) use exactly
this same reference check to decide "did this actually change since
last render?" — so a plain `const` that rebuilds a new array or object
*every render*, even from unchanged inputs, will look "changed" to
React on every single render, and any effect depending on it will keep
re-running, forever, whether the real underlying data changed or not.

## The Isolated Example

```tsx
import { useEffect, useState } from "react";

function Demo({ items }: { items: string[] }) {
  const [unrelated, setUnrelated] = useState(0);
  // Rebuilt fresh every render, even when `items` itself hasn't changed.
  const upper = items.map((s) => s.toUpperCase());

  useEffect(() => {
    console.log("effect ran, upper =", upper);
  }, [upper]);

  return (
    <button onClick={() => setUnrelated((n) => n + 1)}>
      unrelated state: {unrelated}
    </button>
  );
}
```

**Real output (clicking the button, which only changes `unrelated`,
five times):**
```
effect ran, upper = [A, B]
effect ran, upper = [A, B]
effect ran, upper = [A, B]
effect ran, upper = [A, B]
effect ran, upper = [A, B]
effect ran, upper = [A, B]
```

**What this proves:** `items` never changed, and `upper`'s own real
*contents* never changed either — but the effect ran on every single
click, because `.map()` builds a brand-new array reference every
render, and React's dependency check (`Object.is`, a reference check)
sees a "new" value each time regardless of content.

**The fix:**

```tsx
import { useEffect, useMemo, useState } from "react";

function Demo({ items }: { items: string[] }) {
  const [unrelated, setUnrelated] = useState(0);
  const upper = useMemo(() => items.map((s) => s.toUpperCase()), [items]);

  useEffect(() => {
    console.log("effect ran, upper =", upper);
  }, [upper]);

  return (
    <button onClick={() => setUnrelated((n) => n + 1)}>
      unrelated state: {unrelated}
    </button>
  );
}
```

**Real output, same five clicks:**
```
effect ran, upper = [A, B]
```

## Mechanical Walkthrough

- `items.map(...)` with no `useMemo` — a plain expression, re-evaluated
  in full on every render of `Demo`, for any reason at all (including a
  completely unrelated state update like `unrelated`) — producing a new
  array object each time.
- `useEffect(fn, [upper])` — compares `upper` to *last render's* `upper`
  using reference equality; two different array objects are never
  `===` to each other even with identical elements, so this always
  looks like a real change.
- `useMemo(() => items.map(...), [items])` — only recomputes (and
  therefore only returns a *new* reference) when `items` itself changes
  reference — as long as the parent isn't also rebuilding `items` fresh
  every render, `upper` now stays the same object across renders where
  nothing relevant changed, and the effect correctly stops re-firing.

## Execution Trace

5 clicks on the button, which only ever changes `unrelated` — traced
against the real output above (6 "effect ran" lines: 1 initial mount +
5 re-renders):

```
Broken version (upper = items.map(...), no useMemo):

Initial render: unrelated=0. upper = items.map(...) → new array ref #1
  → useEffect's dependency [upper] has no "previous" yet → effect runs
  → logs "effect ran, upper = [A, B]"

Click 1: setUnrelated(0→1) → re-render.
  upper = items.map(...) → NEW array ref #2 (items unchanged, but .map()
  always builds fresh) → ref #2 !== ref #1 (Object.is, reference check)
  → dependency "changed" → effect re-runs → logs "effect ran, upper = [A, B]"

Click 2: setUnrelated(1→2) → re-render.
  upper = items.map(...) → NEW array ref #3 → ref #3 !== ref #2 → effect
  re-runs → logs "effect ran, upper = [A, B]"

... identical for clicks 3, 4, 5 — refs #4, #5, #6, each different from
the last, each triggering another real effect run.

Total: 6 real effect runs, even though upper's own CONTENTS ([A, B])
never once actually changed.
```

```
Fixed version (upper = useMemo(() => items.map(...), [items])):

Initial render: upper = useMemo computes → array ref #1 (items dep: ref I1)
  → effect runs (no previous) → logs "effect ran, upper = [A, B]"

Click 1: setUnrelated(0→1) → re-render.
  useMemo checks its OWN dependency: [items] → items is still ref I1
  (the parent never rebuilt it) → useMemo does NOT recompute → returns
  the SAME array ref #1 as before
  → useEffect's [upper] dependency: ref #1 === ref #1 → unchanged →
    effect does NOT re-run

Click 2-5: identical — items stays ref I1, useMemo keeps returning ref
#1, useEffect never sees a change → effect never re-runs again.

Total: 1 real effect run — the initial mount only.
```

`.map()` itself runs identically in both versions on every render — the
only difference is whether its *result* gets a fresh reference wrapped
around identical content every time, or a stable one.

## CS Lens

This is `deep-equality-vs-reference-equality.md`'s own distinction,
applied inside a specific, real framework's change-detection mechanism
— React doesn't (and, for performance reasons, generally can't
afford to) deep-compare dependency arrays on every render; it uses the
cheap, O(1) reference check instead, which means *producing* a stable
reference (via memoization) becomes the programmer's own
responsibility whenever it matters.

Also recognized in: Redux/Zustand-style state selectors (a selector
returning a new object every call causes the exact same unnecessary
re-render cascade); any framework's virtual-DOM diffing that shortcuts
to reference equality before falling back to deeper comparison.

## SE Lens

The real, costly failure mode this causes isn't just "one wasted
re-run" — it can cascade: an effect that reports a derived value
*upward* to a parent (calling a callback prop with the freshly rebuilt
value) causes the *parent* to re-render, which can cause the child to
re-render again, rebuilding the same unmemoized value again, re-firing
the same effect again — a real, self-sustaining loop that never
technically becomes infinite (it settles once nothing upstream is
actually changing) but fires far more than intended, and can visibly
reset any state that effect happens to also touch on every firing.
Diagnosing it requires recognizing the *symptom* (something resets or
re-runs far more often than the actual data changes) and tracing
backward to find the unmemoized value feeding an effect's own
dependency array.

## Connection

Builds on `deep-equality-vs-reference-equality.md` and
`caching-and-memoization.md` (`useMemo` is React's own specific
memoization API, keyed by a dependency array instead of function
arguments). Directly relevant any time a `useEffect`/`useMemo`/
`useCallback`'s dependency array includes a computed array, object, or
function that isn't itself wrapped in `useMemo`/`useCallback`.

## Try It Yourself

1. Remove `useMemo` from the fixed version and confirm the bug returns
   — the effect fires on every unrelated click again.
2. Change `[items]` to `[]` in the `useMemo` call (a wrong, empty
   dependency array) and confirm `upper` now never updates even when a
   genuinely new `items` array is passed in from the parent — proof
   that memoizing with the *wrong* dependency array trades one bug
   (over-firing) for the opposite one (stale data).
3. Add a `console.log("Demo rendered")` directly in the component body
   (not inside any hook) and compare how often *it* logs versus how
   often the effect logs, once memoized — confirming the component
   itself still re-renders on every click (expected, cheap), while the
   effect (the actually expensive/stateful part) no longer does.
