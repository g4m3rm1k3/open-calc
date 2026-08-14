# Concept: `React.StrictMode`

**What you'll understand by the end:** what wrapping a tree in
`StrictMode` actually does at runtime, and why it deliberately runs some
of your own code twice.

**Prerequisites:** `jsx-syntax.md`, `react-dom-createroot-mounting.md`.

## Setup

A React project (`npm create vite@latest my-app -- --template react-ts`).

## The Problem

Some real bugs — a component whose render function mutates something
outside itself, an effect that isn't properly cleaned up — only become
visible if the exact same code runs more than once and the second run
disagrees with the first. Running everything exactly once, the normal
case, lets a real class of impure, order-dependent bugs hide successfully
until a much later, unrelated change finally exposes them.

## The Isolated Example

```tsx
import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";

let renderCount = 0;

function Counter() {
  renderCount++;
  console.log("render #" + renderCount);
  const [n, setN] = useState(0);
  return <button onClick={() => setN(n + 1)}>{n}</button>;
}

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <Counter />
  </StrictMode>,
);
```

**Real console output, development mode, on first mount:**
```
render #1
render #2
```

**Real console output, the identical component, `StrictMode` removed:**
```
render #1
```

**What this proves:** the exact same `Counter` function, mounted the
exact same way, ran twice under `StrictMode` and once without it —
`StrictMode` itself is what caused the second call, not a bug in
`Counter`. Removing the `<button>` from the page and clicking it before
removal shows only one real click still only adds `1` once — the double
render never doubles real, user-visible behavior, only how many times the
function body itself executed.

## Mechanical Walkthrough

- `<StrictMode>...</StrictMode>` — a real component with no visual output
  of its own (renders nothing extra to the DOM); wrapping a subtree in it
  opts that subtree into a set of extra, development-only checks.
- In development, React deliberately calls certain functions — a
  component's own render/body, some Hooks' setup functions — **twice in a
  row**, throwing away the first call's result and keeping only the
  second's, specifically to surface functions that aren't safe to call
  more than once (functions with a hidden side effect baked into the call
  itself, not just their declared return value).
- This double-invocation is real, but only in development — a real
  production build (`vite build`) does not do this at all; `StrictMode`
  compiles down to effectively nothing outside of development mode, per
  React's own documentation.
- `renderCount++` inside `Counter` is deliberately impure (mutating a
  variable outside the function, from inside a render) purely to make the
  double-call visible — this is also exactly the kind of real mistake
  `StrictMode` exists to help catch, since a genuinely pure render
  function would produce identical output whether called once or twice.

## Execution Trace

Not a loop or recursion — a single, real, one-time doubling: React calls
`Counter()` once, discards that call's output, calls `Counter()` again,
and keeps the second call's returned JSX. `renderCount` — real, mutable,
outside `Counter` — is incremented on both real calls, which is exactly
how "ran twice" becomes independently, externally observable.

## CS Lens

This is a real, deliberate **fuzzing-adjacent technique**: rather than
proving purity through static analysis (which the language/tool can't do
here — JavaScript has no built-in notion of a "pure function"), React
*exercises* the code an extra time under conditions designed to surface
impurity as an observable symptom (a doubled side effect, a state
mismatch) instead of catching it structurally. Also recognized in:
property-based testing calling the same function repeatedly with
different inputs looking for a case that breaks an invariant, and any
"canary" run of the same operation twice specifically to catch
non-determinism a single run would never reveal.

## SE Lens

**`StrictMode` trades a real, if usually small, development-only
performance cost (some real functions genuinely run twice) for catching a
real class of bug — the moment your code depends on running exactly
once, an assumption React's own architecture (concurrent rendering,
Suspense, a future re-render being interrupted and retried) does not
actually guarantee — long before it becomes a real, hard-to-reproduce
production bug.** The real alternative — never opting in, discovering the
same class of bug only when a specific, rare timing condition in
production actually triggers it — is strictly worse: the same underlying
assumption was always false, `StrictMode` just chose to make that failure
happen loudly, immediately, and every single time, instead of rarely and
unpredictably.

## Connection

Builds on `jsx-syntax.md` and `react-dom-createroot-mounting.md`. This
project's own real `main.tsx` wraps its real `<App />` in `StrictMode` —
applied here, not re-taught, the moment `main.tsx` is built for real.

## Try It Yourself

1. Run the isolated example with `StrictMode` present, and add a real
   `console.log` inside a `useState` lazy initializer function
   (`useState(() => { console.log("init"); return 0; })`) — confirm this
   also logs twice on first mount, the identical double-invocation
   behavior applied to a different real Hook, not just to the component
   body itself.
2. Build the identical project for production (`npm run build`, then
   serve the `dist/` output) and confirm the double-render disappears
   entirely — real, direct proof `StrictMode`'s extra calls are a
   development-only tool, never real production behavior.
3. Make `Counter` genuinely pure (move `renderCount++` into the `onClick`
   handler instead of the render body) and confirm the visible symptom
   (the doubled log) disappears — reasoning about why a genuinely pure
   render function has nothing for `StrictMode`'s double-call to expose.
