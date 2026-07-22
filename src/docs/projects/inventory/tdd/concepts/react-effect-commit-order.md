# Concept: React Runs a Child's Effects Before Its Parent's

**What you'll understand by the end:** the real order React fires
`useEffect` callbacks across a parent and its child, in the same commit —
and why code that reads a value a sibling effect is supposed to have just
set can silently read the *previous* value instead.

**Prerequisites:** `react-useeffect-hook.md`, `react-component-props.md`.

## Setup

A React project (e.g. via `npm create vite@latest my-app -- --template react-ts`), with `react` and `react-dom` installed. Verified this session using `jsdom` for a headless DOM:
```
npm install jsdom react react-dom
```

## The Problem

Two components in the same render tree can each have their own
`useEffect`. If a parent's effect is meant to *set up* something (write a
value somewhere) that a child's effect then *reads*, the correctness of
that depends entirely on which effect actually runs first. Nothing about
reading the two components' code side by side — parent defined first,
child nested inside its JSX — tells you which one that is; it has to be
learned as a real fact about how React's commit phase works, not guessed
from reading order.

## The Isolated Example

```jsx
function Child() {
  useEffect(() => {
    console.log("Child effect ran");
  }, []);
  return <span>child</span>;
}

function Parent() {
  useEffect(() => {
    console.log("Parent effect ran");
  }, []);
  return <div><Child /></div>;
}

createRoot(document.getElementById("root")).render(<Parent />);
```

**Real output, run this session:**
```
Child effect ran
Parent effect ran
```

**What this proves:** even though `Parent` appears first in the source,
and `Parent`'s own function body runs before React ever gets to
rendering `Child`, the *effect* attached to `Child` fires before the
*effect* attached to `Parent` — the source-code nesting order and the
effect-firing order are not the same thing, and code cannot assume they
are.

## Mechanical Walkthrough

- `function Child()` / `function Parent()` — **(c) already basic** —
  ordinary component definitions (`react-component-props.md`).
- `useEffect(() => { ... }, [])` on both — **(b) reappearing** —
  `react-useeffect-hook.md`'s empty-dependency-array, run-once-at-mount
  shape, used identically in both components.
- `<div><Child /></div>` — **(c) already basic** — JSX composition,
  `Child` nested one level inside `Parent`'s own returned element.
- `createRoot(...).render(<Parent />)` — **(b) reappearing** —
  `react-dom-createroot-mounting.md`'s mount call, the trigger for the
  entire render-then-commit-then-run-effects sequence being observed.
- The real, first-appearing fact this whole example exists to
  demonstrate: React commits a subtree **children-first, then parents**.
  Rendering (calling each component function to produce JSX) happens
  top-down — `Parent`'s function body genuinely does run before
  `Child`'s. But *committing* that tree to the real DOM, and firing
  `useEffect` callbacks afterward, happens bottom-up: every descendant is
  fully mounted and has had its own effects run before an ancestor's
  effect runs. This mirrors real lifecycle ordering in class components
  (`componentDidMount` firing on a child before its parent) — React's
  hooks-based effects preserve the exact same ordering, not a new
  behavior specific to hooks.

## CS Lens

This is a **post-order tree traversal** — visit every child completely
before visiting the current node — the same traversal order used to
compute a directory's total size (every file inside a subfolder has to be
sized before the folder's own total is known), or to evaluate an
expression tree (every operand is evaluated before the operator combining
them).

Also recognized in: destructor/cleanup ordering in RAII-based languages
(C++, Rust — the innermost, most-recently-constructed object is destroyed
first), any dependency graph where a node can't be considered "ready"
until everything it contains is, garbage collection reference counting
tearing down inner objects before outer ones.

## SE Lens

The real alternative — designing components so no parent effect ever
needs to run before a specific child's effect — is the actual robust fix,
and it's the one worth reaching for on purpose: a parent should either
compute the shared value *during render* (not inside an effect at all,
so it's simply ready before any child even mounts) or perform the update
as a direct, synchronous function call at the moment it's actually
needed, rather than trusting effect-vs-effect race timing implicitly.
Relying on effect order between a parent and child that happens to work
today is fragile specifically because nothing in the component tree's own
declaration announces that ordering dependency — a future refactor (a
new wrapper component inserted between them, a memoized child that skips
re-rendering) can silently break it with no error, only a value that's
one step stale. This project paid that real cost once: a theme switch's
new colors were being read by a child component's effect before the
parent's own effect had written them, so the 3D scene visibly lagged one
theme behind the rest of the UI until the write was moved out of an
effect entirely.

## Connection

Builds on `react-useeffect-hook.md`. Connects directly to
`react-usestate-lazy-initializer.md` and this project's real fix: instead
of trusting effect order, the value is written synchronously — at the
point of selection, and via a lazy `useState` initializer at mount —
before any effect for that same commit has a chance to run at all.

## Try It Yourself

1. Add a *second* child, `<Child />` twice inside `Parent`, and log which
   order the two children's own effects fire in relative to each other —
   confirm it matches their left-to-right order in the JSX, and reason
   about whether that's guaranteed by anything you've learned so far or
   is simply what this one example happened to show.
2. Replace `Child`'s effect with a `useLayoutEffect` (same signature,
   different hook) and keep `Parent`'s as `useEffect` — look up when
   `useLayoutEffect` fires relative to `useEffect` for the *same*
   component, and predict what the combined console output order becomes
   before running it.
