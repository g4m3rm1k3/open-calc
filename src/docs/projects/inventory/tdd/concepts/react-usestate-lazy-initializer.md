# Concept: `useState`'s Lazy Initializer Function

**What you'll understand by the end:** how to give `useState` an initial
value that's computed only once, ever — not recomputed on every re-render
the way a plain expression argument is — and when that difference
actually matters.

**Prerequisites:** `react-usestate-hook.md`.

## Setup

A React project (e.g. via `npm create vite@latest my-app -- --template react-ts`), with `react` and `react-dom` installed.

## The Problem

`react-usestate-hook.md` already established that `useState(initialValue)`
only *uses* `initialValue` on a component's first render — later
re-renders keep whatever the state was last updated to. But that lesson's
own examples always passed a cheap literal (`0`, `""`). Whatever
expression is written as that argument is still evaluated on *every*
render, even the renders where its result is thrown away — if computing
that initial value is expensive, or has a real side effect (reading
`localStorage`, mutating something in the DOM), doing that on every
single render is real, avoidable waste, or a real, repeated side effect
that should only ever happen once.

## The Isolated Example

```jsx
let plainCallCount = 0;
function expensiveDefault() {
  plainCallCount += 1;
  return 0;
}

let lazyCallCount = 0;
function expensiveLazyDefault() {
  lazyCallCount += 1;
  return 0;
}

function Counter() {
  const [, setA] = useState(expensiveDefault());   // called every render
  const [, setB] = useState(expensiveLazyDefault);  // called once, ever
  const [n, setN] = useState(0);

  useEffect(() => {
    if (n < 3) setN(n + 1);
  }, [n]);

  return <span>{n}</span>;
}
```

**Real output, run this session** (mounted, then allowed to re-render
itself four times via the effect above):
```
plain-expression default called: 4 times
lazy-initializer default called: 1 times
```

**What this proves:** `expensiveDefault()` — called as a plain function
call, its *result* handed to `useState` — ran once per render, four
times total, even though only the very first call's result was ever
actually used as state. `expensiveLazyDefault` — the function itself
handed to `useState`, not its result — ran exactly once, on the render
that created this component's state, and was never called again on any
of the following three re-renders.

## Mechanical Walkthrough

- `useState(expensiveDefault())` — **(b) reappearing** the `useState`
  call itself (`react-usestate-hook.md`); the parentheses after
  `expensiveDefault` mean the function is invoked immediately, at the
  point this line is evaluated — which happens on *every* render, since
  every render re-runs the whole component function from the top.
- `useState(expensiveLazyDefault)` — **(a) first appearance** — passing
  the function itself, not a call to it. React's own `useState`
  implementation detects this case (a function was passed instead of a
  plain value) and calls it *internally*, but only during the render that
  actually initializes the state — every subsequent render, React already
  has the state value and skips calling the function again entirely.
- `useEffect(() => { if (n < 3) setN(n + 1); }, [n])` — **(b)
  reappearing** — `react-useeffect-hook.md`'s dependency-array mechanism,
  used here purely as a way to force several real re-renders for this lab
  to observe, not as part of the concept itself.

## CS Lens

This is **lazy evaluation** — deferring a computation until its result is
actually needed, and, here, memoizing that it never needs to run again
once it has. The same distinction (eager: compute now, unconditionally;
lazy: compute only when and if needed) shows up anywhere a "give me the
value, or a way to produce it" choice exists.

Also recognized in: Python generators and `functools.lru_cache`, C#'s
`Lazy<T>`, a database view versus a materialized view, short-circuit
evaluation in `&&`/`||` (an expression on the right is never evaluated at
all if the left side already decided the result).

## SE Lens

The real alternative — always passing a plain expression — is simpler to
read and is the *right* choice whenever that expression is cheap (a
literal, a trivial calculation): the lazy form has no benefit there, only
a small extra layer of indirection to read past. The lazy form earns its
place specifically when the initializer does real work or a real side
effect — this project's own real case reads `localStorage` and pushes
values into live CSS custom properties inside that initializer, which
would otherwise re-run, harmlessly but pointlessly, on every single
re-render of the component that owns it for the entire lifetime of the
app.

## Connection

Builds on `react-usestate-hook.md`. Used in this project's real code to
apply a persisted or default theme exactly once, synchronously, during a
component's first render — see `react-effect-commit-order.md` for the
specific timing bug this choice was made to avoid.

## Try It Yourself

1. Remove the `if (n < 3)` guard from the effect above (letting it call
   `setN` unconditionally on every render) and predict what happens to
   `lazyCallCount` — reason about why it stays exactly the same even as
   the component now re-renders indefinitely.
2. Change `expensiveLazyDefault` to itself return a different value each
   time it's called (e.g. `Math.random()`), mount the component, and log
   the state value across several forced re-renders — confirm it never
   changes after the first render, even though the function, if it were
   called again, would return something new.
