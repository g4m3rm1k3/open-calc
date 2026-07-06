# React Studio — Lesson 12 — Performance

## What You Will Build

Nothing new-looking. Add a few hundred widgets to the canvas and drag one: without
this lesson, the frame rate visibly drops — the drag feels sluggish, sometimes
stuttering. After this lesson, dragging stays smooth regardless of how many widgets
are on screen. This is the first lesson where "why did React re-render this"
becomes something you measure and watch happen, not just a mental model.

---

## What You Need to Know First

Lesson 11 left every widget mutation flowing through `dispatch`, with `App`
rendering every widget via `WidgetView` inside a `.map()`.

---

## Step 1 — See the Problem, Honestly

**The problem:** Before fixing anything, prove the problem actually exists.

Temporarily add a debug button that creates many widgets at once:

```tsx
function handleAddManyWidgets() {
  const newWidgets = Array.from({ length: 300 }, () =>
    createRectangleWidget(Math.random() * 800, Math.random() * 600),
  );
  newWidgets.forEach((widget) => dispatch({ type: 'ADD_WIDGET', widget }));
}
```

And temporarily add one line inside `WidgetView`, at the top of the function body:

```tsx
console.log('rendering', widget.id);
```

Click the debug button, open the console, and drag any one widget for about a
second. The console floods with hundreds of log lines *per mouse-move event* — every
widget on the canvas is re-rendering, every time, even though only the one widget
you are dragging actually changed.

**Walkthrough — why this happens.** React's default behaviour, with no
optimisation applied, is: whenever a component re-renders, **every child it
renders re-renders too** — the child component function runs again in full,
regardless of whether the specific props that child received actually changed since
last time. `App` re-renders on every `dispatch` call during a drag (since
`history.present` changes on every `UPDATE_WIDGET_LIVE`), and by default, that means
every single `<WidgetView>` `App` renders runs its function body again, computes its
JSX again, and hands React a new description to reconcile — even the 299 widgets
whose actual props (`x`, `y`, `width`, `height`, `isSelected`, and so on) are
identical to a moment ago.

**CS lens — this is not usually the DOM's fault.** Reconciliation (lesson 01, first
exercised in lesson 02) is genuinely good at comparing the *final* virtual DOM trees
and touching only the real DOM nodes that changed — the 299 unmoved rectangles were
never going to have their actual `<div>`s touched. The cost this lesson addresses is
earlier and different: re-running 300 component functions, computing 300 new JSX
descriptions, just to diff them against 300 identical ones and discover nothing
needs to change. That work — calling the function, building the description — is
real, measurable JavaScript execution time, and it happens whether or not
reconciliation ultimately finds any DOM changes to make.

---

## Step 2 — Apply `React.memo`, and Discover It Is Not Enough Yet

**The problem:** Stop a component from re-rendering at all when its own props have
not actually changed.

```tsx
import { memo } from 'react';

const WidgetView = memo(function WidgetView({ widget, isSelected, onSelect, onDragStart }: WidgetViewProps) {
  console.log('rendering', widget.id);
  // ...unchanged body...
});
```

Save, reload, add 300 widgets again, and drag one. **The console still floods with
every widget re-rendering.** `React.memo` alone has changed nothing yet — this is
worth pausing on, because it reveals something real about how `memo` actually
works.

**Walkthrough:** `memo(Component)` wraps a component so that React, before
re-rendering it, first performs a **shallow comparison** of its new props against
its previous ones: for each prop, is the new value `===` (reference-equal, for
objects and functions — exactly equal, for primitives like numbers and strings) to
the old one? If every prop passes, React skips re-rendering this component
entirely, reusing its previous output.

The reason this has not helped yet: `onSelect` and `onDragStart`, as passed into
every `WidgetView`, are **new function references on every single render of `App`**.
Even if neither function's actual *logic* ever changes, `handleSelectWidget` and
`handleMouseDownOnWidget` are declared as ordinary functions inside `App`'s
component body — and every time a component function runs, every function
declared inside it is created fresh, as a brand-new object in memory, indistinguishable
in behaviour from the last one but never `===` to it. `memo`'s shallow comparison
sees a "different" `onSelect` on every render — because, technically, by reference,
it is — and re-renders every single time, regardless of how many other props stayed
exactly the same.

---

## Step 3 — Stabilise the Callback Props with `useCallback`

**The problem:** `handleSelectWidget` and `handleMouseDownOnWidget` need to keep
the *same* function identity across renders, so `memo`'s comparison can actually
succeed.

```tsx
import { useCallback } from 'react';

const handleSelectWidget = useCallback((id: string, isShiftClick: boolean) => {
  if (!isShiftClick) {
    setSelectedIds([id]);
    return;
  }
  setSelectedIds((current) =>
    current.includes(id) ? current.filter((existingId) => existingId !== id) : [...current, id],
  );
}, []);

const handleMouseDownOnWidget = useCallback((widget: Widget, event: React.MouseEvent) => {
  event.stopPropagation();
  handleSelectWidget(widget.id, event.shiftKey);
  dispatch({ type: 'BEGIN_INTERACTION' });
  setDragState({
    widgetId: widget.id,
    offsetX: event.clientX - widget.x,
    offsetY: event.clientY - widget.y,
  });
}, [handleSelectWidget]);
```

Save, reload, add 300 widgets, drag one. The console now logs `rendering` for
exactly one widget id, repeatedly, for the duration of the drag — every other
widget is correctly, measurably, left alone. Remove the debug `console.log` and the
"Add 300 Widgets" button once you have confirmed this (or keep the button as a
permanent, useful stress-test tool — your choice).

**Walkthrough:** `useCallback(fn, dependencyArray)` returns the *same* function
reference across renders, as long as every value in `dependencyArray` is still
`===` to what it was last time — conceptually, "memoise this function itself," the
direct counterpart to `React.memo`, which memoises a *component's rendered output*.
`handleSelectWidget`'s dependency array is empty (`[]`) because it never reads
anything from the surrounding scope directly — it only ever calls `setSelectedIds`
with a function, which (exactly as explained in lesson 04's stale-closure section)
always receives the true current state regardless of when the function was created.
`handleMouseDownOnWidget` depends on `[handleSelectWidget]` because it calls it
directly — since `handleSelectWidget` is itself now stable via its own
`useCallback`, this dependency is satisfied once and never causes
`handleMouseDownOnWidget` to be recreated afterward either.

**SE lens — `React.memo` and `useCallback` are a pair, not independent tools.**
Neither one alone would have fixed this. `React.memo` without stable callbacks
compares props that are never actually equal, so it never skips anything.
`useCallback` without `React.memo` produces stable function references that
`WidgetView` would have no reason to compare against anything, since a
non-memoised component re-renders unconditionally whenever its parent does,
regardless of whether any individual prop changed. The fix required recognising
that the *cause* of the wasted work (functions recreated every render) and the
*mechanism* that could prevent it (a shallow prop comparison) needed to be
addressed together.

**CS lens — this is a real, general performance principle, not a React
peculiarity.** "Don't redo expensive work when the inputs have not changed" is
**memoization** — the same word, and the same idea, whether applied to a pure
mathematical function's results, a compiler's repeated compilations, or, here, a
component's rendered output. `React.memo`'s name is not a coincidence.

---

## Connect the Pieces

```
src/App.tsx      handleSelectWidget and handleMouseDownOnWidget wrapped in
                 useCallback, giving them stable identity across renders
WidgetView        Wrapped in React.memo, now able to actually skip re-rendering
                  when its props are genuinely unchanged
```

Every other component in this project — `PropertiesPanel`, `LayersPanel`,
`CounterDisplay` — was left unmemoised on purpose: none of them are rendered
hundreds of times per drag the way `WidgetView` is, so the cost `memo` and
`useCallback` exist to prevent was never present for them in the first place.

---

## What Breaks Without This

**Applying `React.memo` and `useCallback` everywhere, indiscriminately, "to be
safe":** `PropertiesPanel` renders once per selection change or field edit — dozens
of times per session at most, never hundreds of times per second. Wrapping it in
`memo` adds a real (if small) comparison cost on every render, to prevent a
re-render cost that was never actually a measurable problem. Optimising a component
that renders rarely trades a real, if tiny, ongoing cost for a savings that will
essentially never matter — this is why Step 1 measured the actual problem, on the
actual component, before reaching for either tool.

**Forgetting the dependency array on `useCallback` (or missing a real dependency
inside it):** `handleMouseDownOnWidget` depending on `handleSelectWidget` is not
optional — if `handleSelectWidget`'s own logic ever changed to read some other
piece of state directly (breaking its `[]` dependency array), and
`handleMouseDownOnWidget`'s array were not updated to match, it would keep calling
an outdated version of `handleSelectWidget`, forever, silently — the exact stale
closure danger from lesson 04, now specifically dangerous because `useCallback`'s
entire purpose is deliberately holding onto one specific function across renders.

---

## Definition of Done

- [ ] With 300+ widgets on the canvas, dragging one stays visibly smooth
- [ ] A temporary `console.log` inside `WidgetView`, during a drag, shows only the dragged widget re-rendering, not all of them
- [ ] `WidgetView` is wrapped in `React.memo`; `handleSelectWidget` and `handleMouseDownOnWidget` are wrapped in `useCallback`
- [ ] You can explain, precisely, why applying only `React.memo` (without stabilising callback props) changed nothing
- [ ] You can explain what a shallow comparison is and why it fails for a prop that is a new function or object every render
- [ ] You can explain why `PropertiesPanel` and `LayersPanel` were deliberately left unmemoised
- [ ] Run:
      ```
      git add src/App.tsx
      git commit -m "Fix drag performance with hundreds of widgets: React.memo paired with stable useCallback handlers"
      ```

---

*Next: Lesson 13 — Preview Mode. A full-screen preview shows the app exactly as an
end user would see it — no selection outlines, no Properties Panel, and, for the
first time, a button widget's action actually fires from a real click. This
requires rendering somewhere the normal component tree cannot reach on its own:
a Portal.*
