# Concept: React's `useRef` Hook

**What you'll understand by the end:** how to hold a mutable value across a component's re-renders without that change itself triggering a re-render, and how to get a direct handle on a real DOM element.

**Prerequisites:** `react-usestate-hook.md`.

## Setup

A React project with JSX configured (see `vite-plugin-system.md`).

## The Problem

Not every piece of data a component needs to remember should cause a re-render when it changes — a reference to an external object (a non-React library instance, a timer ID, a real DOM node) is often something a component needs to hold onto *across* renders, purely to use later, with no reason for React to re-run the component's rendering logic just because that reference was assigned.

## The Isolated Example

```tsx
import { useRef, useState } from "react";

function RenderCounter() {
  const [count, setCount] = useState(0);
  const renderCount = useRef(0);
  renderCount.current += 1;

  return (
    <div>
      <p>State count: {count}</p>
      <p>Actual renders so far: {renderCount.current}</p>
      <button onClick={() => setCount(count + 1)}>Increment state</button>
    </div>
  );
}
```

**Real behavior, clicking the button twice:**
```
State count: 0, Actual renders so far: 1   (initial)
State count: 1, Actual renders so far: 2   (after 1st click)
State count: 2, Actual renders so far: 3   (after 2nd click)
```

**Now, directly comparing against attempting the same tracking with `useState` instead:**
```tsx
const [renderCount, setRenderCount] = useState(0);
setRenderCount(renderCount + 1); // called directly in the render body
```
**Real behavior:** this causes an infinite re-render loop — each call to `setRenderCount` schedules a new render, which calls `setRenderCount` again, forever, because changing state (unlike a ref) always triggers React to re-render.

**What this proves:** `renderCount.current += 1` updated a real, persistent value across renders without causing any additional render — the count is visibly tracked and correct across each click — while attempting the identical tracking with `useState` instead breaks the component entirely, because a `useState` update is precisely what causes a render, creating a loop the ref version never risks.

## Mechanical Walkthrough

- `useRef(initialValue)` returns a single, stable object with exactly one property, `.current`, initialized to `initialValue` — that same object (not a new one) is returned on every re-render of the component, meaning whatever was last assigned to `.current` is still there next time.
- Reading or writing `.current` never causes React to schedule a re-render — this is the fundamental, deliberate difference from `useState` (see `react-usestate-hook.md`), where calling the setter is precisely what schedules one.
- A very common, specific use: `useRef<HTMLDivElement>(null)`, passed to a JSX element's `ref` attribute (`<div ref={containerRef} />`) — React automatically sets `containerRef.current` to the real, actual DOM node once it's been created and attached to the page, giving component code direct access to that real element for anything React's own declarative model doesn't cover (measuring its size, handing it to a non-React library like a charting or 3D-rendering tool).
- `useRef(null)` (with no type argument, in plain JavaScript) or `useRef<T>(null)` (in TypeScript, naming the expected element/value type) both start `.current` as `null` until something — either the `ref` attribute mechanism, or explicit code — assigns a real value to it.

## CS Lens

A ref is **mutable state outside the render cycle** — a deliberate escape hatch from React's otherwise render-triggering state model, for exactly the cases where a value genuinely needs to persist and be mutated without that mutation being a meaningful "the UI should now look different" event. This is a real, necessary counterpart to `useState`'s render-triggering model: not every piece of data a component holds is meant to drive what's displayed.

Also recognized in: instance variables in a class-based UI component model (a value stored directly on `this`, persisting across method calls, with no automatic re-render tied to changing it), and, more generally, any framework's own "escape hatch" for holding a reference to something outside its own declarative model (a DOM node, a timer handle, a library instance) that the framework itself doesn't manage.

## SE Lens

Using `useRef` instead of `useState` for a value that shouldn't trigger re-renders is a real, meaningful performance and correctness choice, not a stylistic preference — the broken infinite-loop example above is the direct, concrete consequence of choosing wrong in one specific direction (state where a ref belonged); choosing wrong in the *other* direction (a ref where state belonged) produces a subtler bug: the value changes correctly, but the UI never visually updates to reflect it, since nothing ever told React to re-render.

## Connection

Builds on `react-usestate-hook.md`. Directly enables bridging an imperative, non-React piece of code (an existing library instance, a raw DOM measurement) into a React component — see `react-useeffect-hook.md` for the common pairing of a ref (holding a persistent instance) with an effect (creating that instance once, at the right moment in the component's lifecycle).

## Try It Yourself

1. Add a `console.log(renderCount.current)` directly inside the render body (not inside an effect) and confirm it logs a new, incremented value on every re-render, proving the ref's mutation genuinely does persist across renders despite triggering none of them.
2. Try displaying a `ref`'s `.current` value directly in JSX (`{someRef.current}`) after changing it from inside a click handler (not during render) — confirm the displayed value does *not* update after the click, even though the ref's actual value did change — direct proof that changing a ref alone never causes a re-render, so nothing re-evaluates the JSX that reads it, unless something else (like a state update) happens to trigger one anyway.
3. Use `useRef` to store a `setInterval` timer ID across renders, and clear it correctly in a cleanup function (see `react-useeffect-hook.md`) — a real, common, legitimate use of a ref for something that is emphatically not meant to trigger any re-render when assigned.
