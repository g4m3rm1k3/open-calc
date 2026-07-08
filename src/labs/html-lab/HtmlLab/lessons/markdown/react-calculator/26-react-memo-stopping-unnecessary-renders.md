# React Calculator — Lesson 26 — React.memo: Stopping Unnecessary Button Re-renders

## What You Will Build

Proof, printed to the console, that every one of the keypad's fourteen
buttons currently re-renders on *every single keystroke* — including
keystrokes that have nothing to do with the keypad at all — and then a
real fix that brings that down to exactly the renders that actually matter.

---

## What You Need to Know First

Lesson 25 — `useMemo`, and the general idea of skipping unnecessary work
based on whether real inputs actually changed.

---

## Step 1 — See the Problem

Add a line to `Keypad.tsx`, at the top of the function body:

```tsx
function Keypad({ onDigit, onOperator, onParen, onEquals, onPercent, onSignChange, onClear }: KeypadProps) {
  console.log("Keypad rendered");
  // ...existing return unchanged...
```

Click **▶ Preview**, open DevTools (F12) → Console, and press a few digit
buttons. `"Keypad rendered"` prints once for **every single press** — not
just the button you clicked, the entire `Keypad` component, all fourteen
of its buttons, every time.

**CS lens — naming what's actually happening: reconciliation, revisited.**
Lesson 04 first named **reconciliation** — React's process of comparing a
new render's output to the previous one to decide what the real DOM
actually needs to change. What this step reveals is a detail reconciliation
doesn't fix on its own: reconciliation decides *what to change in the DOM*,
but by default, every child component still **re-renders** — its function
body runs again, computing a fresh description of its UI — regardless of
whether reconciliation will find any actual difference once that
description is compared. Re-rendering `Keypad` fourteen times over,
producing an identical result each time, is wasted *computation*, even
though reconciliation itself correctly ensures the real DOM buttons are
never actually touched. `React.memo` targets the wasted computation
specifically — skipping the re-render itself, not just the DOM update
reconciliation would have skipped anyway.

**Walkthrough — why this happens, mechanically.** React's default
behavior, with no optimization applied anywhere, is: when a component
re-renders, **every child it renders re-renders too**, regardless of
whether that specific child's own props actually changed. Pressing `7`
dispatches an action, `Calculator` re-renders to reflect the new
`expression`, and by default that re-render cascades downward through
every component `Calculator` renders — `Display`, `Keypad`, `MemoryPanel`,
all of it — whether or not any of them actually needed to change anything
about what they show.

---

## Step 2 — Wrap `Keypad` in `React.memo`

```tsx
const Keypad = React.memo(function Keypad({ onDigit, onOperator, onParen, onEquals, onPercent, onSignChange, onClear }: KeypadProps) {
  console.log("Keypad rendered");
  // ...existing return unchanged...
});
```

Click **▶ Preview** again. Press a digit. **`"Keypad rendered"` still
prints, every time** — `React.memo` alone did not fix anything yet.

**Walkthrough — `React.memo`, and exactly what it checks.**
`React.memo(Component)` returns a new version of `Component` that skips
re-rendering — reusing its previous output completely — when every one of
its props is **shallowly equal** to what it received last time. Shallow
equality means each individual prop is compared with `===`: primitives
(`"7"`, `42`, `true`) compare by value; objects and functions compare by
**reference** — are they the literal same object or function in memory,
not just "do they look the same." `Keypad`'s props are seven functions:
`onDigit`, `onOperator`, `onParen`, `onEquals`, `onPercent`,
`onSignChange`, `onClear`. If even one of them is a *new* function every
render, `React.memo`'s comparison fails, and it re-renders anyway — which
is exactly what's happening.

---

## Step 3 — Find and Fix the Real Cause: Unstable Function Props

Look at how `Calculator` currently passes these props to `Keypad`:

```tsx
<Keypad
  onDigit={(digit) => dispatch({ type: "digit", digit })}
  onOperator={(operator) => dispatch({ type: "operator", operator })}
  // ...
/>
```

Every one of these is an **arrow function written directly in JSX** —
which means a brand-new function is created, from scratch, on *every*
render of `Calculator`, even though what each one actually *does* never
changes. Fix this with `React.useCallback`:

```tsx
const handleDigit = React.useCallback((digit: string) => dispatch({ type: "digit", digit }), [dispatch]);
const handleOperator = React.useCallback((operator: string) => dispatch({ type: "operator", operator }), [dispatch]);
const handleParen = React.useCallback((paren: string) => dispatch({ type: "paren", paren }), [dispatch]);
const handleEquals = React.useCallback(() => dispatch({ type: "equals", historyId: Date.now().toString() }), [dispatch]);
const handlePercent = React.useCallback(() => dispatch({ type: "percent" }), [dispatch]);
const handleSignChange = React.useCallback(() => dispatch({ type: "signChange" }), [dispatch]);
const handleClear = React.useCallback(() => dispatch({ type: "clear" }), [dispatch]);
```

```tsx
<Keypad
  onDigit={handleDigit}
  onOperator={handleOperator}
  onParen={handleParen}
  onEquals={handleEquals}
  onPercent={handlePercent}
  onSignChange={handleSignChange}
  onClear={handleClear}
/>
```

Click **▶ Preview**. Press several digits. `"Keypad rendered"` prints
**once** — on the initial mount — and never again for a digit press.
Compute a calculation, save a formula, toggle Scientific mode — none of
it triggers another `Keypad` render, because none of it changes anything
`Keypad` actually receives.

**Walkthrough — `useCallback(fn, deps)`.** Exactly like `useMemo`, but
instead of memoizing a *computed value*, it memoizes the **function
itself** — returning the exact same function reference across renders for
as long as its dependencies haven't changed. `React.useCallback((digit) =>
dispatch({ type: "digit", digit }), [dispatch])` is really `useMemo(() =>
((digit) => dispatch({ type: "digit", digit })), [dispatch])` underneath —
`useCallback` exists as its own hook purely because "memoize a function"
is common enough to deserve its own, slightly less noisy name.

**Walkthrough — `[dispatch]`, a dependency array with a guaranteed-stable
value in it.** `dispatch`, returned by `useReducer`, is guaranteed by
React itself to be the same function reference for the entire lifetime of
the component — the same guarantee `useState`'s setter function has always
had, stated explicitly for the first time here because it's the reason
`[dispatch]` as a dependency effectively means "never recreate this."
Since `dispatch` never changes, `handleDigit` and the rest are computed
once, ever, and reused for every subsequent render — which is exactly the
stable reference `React.memo(Keypad)` needed to finally do its job.

**SE lens — `React.memo` is the same trade-off `useMemo` named in lesson
25, applied to components instead of values.** `React.memo` doesn't make
`Keypad` free — it replaces "re-render and produce output" with "compare
every prop for shallow equality," a real cost of its own, just usually
much smaller. Wrapping every component in the entire project in
`React.memo` by default, the way wrapping every value in `useMemo` would
be premature optimization, carries the identical risk: components that
re-render cheaply and rarely (`Display`, showing one string) pay a real
comparison cost on every render for a savings that was never actually
needed. `Keypad` earned the wrap here because Step 1 *measured* a real,
repeated, wasted cost across fourteen buttons — the same measure-first
discipline, not a rule to apply reflexively everywhere.

**CS lens — memoizing the boundary, not every leaf.** It would be
possible to wrap every individual `Button` in `React.memo` instead of
`Keypad`. It wouldn't work as cleanly: each `Button` would still receive a
freshly-created `onClick` closure from whatever built it (exactly
`Keypad`'s original problem, just moved one level deeper), unless *that*
closure were also stabilized. Memoizing `Keypad` — the single component
that owns the decision "should any of my fourteen children even be asked
to reconsider what they render" — solves the problem for the entire
subtree underneath it in one place, rather than needing the same fix
repeated fourteen times.

**Connect to the real world — this is what "profiling" means, and why
it's a real professional practice, not guesswork.** This entire lesson
followed a real, disciplined process: *observe* a problem (the
`console.log` count), *form a hypothesis* about the cause (unstable
function props defeating `React.memo`), *test the fix*, and *confirm* with
the same measurement used to find the problem in the first place. This
process — measuring actual behavior before and after a change, rather than
guessing at what "feels" faster — is called **profiling**, and React
DevTools (a real browser extension, separate from the ordinary DevTools
this project has used since lesson 01) provides a dedicated Profiler tab
that visualizes exactly this: which components rendered, how often, and
why, for a real running React application. The `console.log` technique
this lesson used is a legitimate, real, low-tech version of the identical
practice — useful specifically because it requires no additional tooling
to try immediately, on any component, right now.

---

## Connect the Pieces

```
Calculator.tsx   seven handler functions moved from inline JSX arrow
                 functions into useCallback, each depending only on the
                 guaranteed-stable dispatch
Keypad.tsx       wrapped in React.memo — now genuinely skips re-rendering
                 when Calculator re-renders for unrelated reasons
```

---

## What Breaks Without This

Already demonstrated, live, in Step 2: `React.memo` alone, applied to a
component that keeps receiving brand-new function props every render, does
nothing at all — a real, common mistake that looks like it should work
and silently doesn't, with no warning or error anywhere pointing at the
actual cause.

---

## Definition of Done

- [ ] `console.log("Keypad rendered")` prints only once, on mount — not on every digit press
- [ ] Every handler passed to `Keypad` is wrapped in `useCallback`
- [ ] You can explain why `React.memo` alone didn't fix the re-render problem
- [ ] You can explain why `[dispatch]` as a `useCallback` dependency means "never recreate this function"
- [ ] You can explain why memoizing `Keypad` fixes all fourteen buttons at once, rather than needing to memoize each individually
- [ ] You can explain the difference between reconciliation (skipping DOM changes) and `React.memo` (skipping the re-render itself)
- [ ] You can explain why `React.memo` isn't applied to every component in this project by default

---

*Next: Lesson 27 — Error Boundaries. A broken formula should never produce
a blank white screen — the one place in modern React that still needs a
class.*
