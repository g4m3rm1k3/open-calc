# Concept: React's `useState` Hook

**What you'll understand by the end:** how a React component holds a piece of data that changes over time, and why changing it works completely differently from an ordinary variable assignment.

**Prerequisites:** `javascript-destructuring.md`.

## Setup

A React project (e.g. via `npm create vite@latest my-app -- --template react-ts`), with `react` and `react-dom` installed.

## The Problem

A component's displayed output often needs to change in response to user interaction (a click, typed input) — but an ordinary local variable, reassigned inside a function, doesn't cause a UI framework to know anything changed, or to redraw anything; the function that returns a description of the UI has to be told, explicitly, "something changed, run me again."

## The Isolated Example

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
```

**Real behavior, verified with a real headless browser clicking the button three times:**
```
initial: Clicked 0 times
after 3 clicks: Clicked 3 times
```

**Now, the broken, ordinary-variable version:**
```tsx
function BrokenCounter() {
  let count = 0;
  return (
    <button onClick={() => { count = count + 1; }}>
      Clicked {count} times
    </button>
  );
}
```
**Real behavior:** clicking the button any number of times — the displayed text never changes from "Clicked 0 times," even though `count` genuinely is being incremented internally on every click.

**What this proves:** an ordinary variable reassignment is invisible to React — nothing tells it to re-run `BrokenCounter` and produce updated output. `setCount(...)`, by contrast, is what actually causes React to re-render the component with the new value substituted in.

## Mechanical Walkthrough

- `useState(0)` creates one piece of **state**, initialized to `0`, and returns a two-element array: the current value, and a function to update it — unpacked here via array destructuring (see `javascript-destructuring.md`) into `count` and `setCount`.
- `count` is a plain, ordinary value for the duration of *this* render — it never changes on its own; calling `setCount(newValue)` schedules React to re-run the entire `Counter` function again, this time with `useState(0)` returning `newValue` (not `0`) as the current value.
- Because the component function itself re-runs, every local variable inside it (including `count`) is recomputed fresh each time — this is why the displayed `{count}` updates: it's not the *same* `count` variable being mutated, it's an entirely new function call with a new, current value substituted in.
- State set with `setCount` **persists** across these re-runs specifically because React, not the function itself, is what actually stores it — `useState`'s job is to hand the component access to state React is tracking on its behalf, tied to that specific component instance.

## CS Lens

This is **unidirectional data flow with immutable updates** — state is never mutated in place; instead, a request to change it (`setCount(count + 1)`) produces a fresh render with the new value already substituted in, conceptually replacing the old render entirely rather than patching it. This is a fundamentally different mental model from imperative in-place mutation (assigning directly to an object's field and expecting anything watching it to notice) — here, "noticing a change" is built into the framework's own re-render mechanism, not something the component has to arrange itself.

Also recognized in: every modern reactive UI framework's own state primitive (Vue's `ref`/`reactive`, Svelte's reactive `let` declarations, SwiftUI's `@State`) — "describe the UI as a function of current state; let the framework figure out how to reflect a state change" is the dominant UI architecture pattern across current frameworks, not unique to React.

## SE Lens

A common, real mistake for developers new to this model is treating `count` like an ordinary mutable variable — trying `count++` or `count = count + 1` directly, exactly as `BrokenCounter` does above — which silently does nothing observable, since React was never told a change happened. Recognizing that state updates must always go through the setter function returned by `useState`, never direct reassignment, is the single most important adjustment moving from imperative DOM manipulation (`element.textContent = ...`) to this declarative model.

## Connection

Builds on `javascript-destructuring.md`. Commonly used together with `react-useeffect-hook.md`, which reacts to a piece of state changing by running additional logic (like re-fetching data, or redrawing a canvas) alongside the automatic re-render.

## Try It Yourself

1. Add a second `useState` call for a different piece of data (e.g. `const [name, setName] = useState("");`) in the same component, and confirm both pieces of state update and persist completely independently of each other.
2. Change `setCount(count + 1)` to `setCount(count + 1); setCount(count + 1);` (calling it twice in the same click handler) and predict, before running it, whether the count increases by one or two per click — then verify, and look up React's **batching** behavior to understand why `count` inside a single click handler doesn't reflect the first call's update before the second one runs.
3. Replace `setCount(count + 1)` with the alternate **updater function** form, `setCount((prev) => prev + 1)`, and reason about why this form is considered safer specifically for cases where multiple updates might be queued before a re-render actually happens.
