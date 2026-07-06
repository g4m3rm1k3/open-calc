# React Studio — Lesson 04 — Dragging

## What You Will Build

Pressing the mouse down on a rectangle and moving it drags that rectangle around the
canvas, following the cursor exactly, until the mouse button is released — even if
the cursor moves outside the rectangle's own boundaries mid-drag, which it will, the
instant you drag quickly. This is the first feature in this project that updates
state dozens of times per second, and the first time this project has to reach
outside React's own rendering model to listen to something.

---

## What You Need to Know First

Lesson 03 left `selectedId: string | null` in `App`, and `Rectangle` calling
`onSelect()` (a callback prop) from its own `onClick` handler.

---

## Concept: Why a Drag Cannot Be Handled by `Rectangle`'s Own `onClick`

A click is one event: press and release, in roughly the same place. A drag is a
*sequence*: press, then an arbitrary number of mouse-move events, potentially far
outside the rectangle's own boundaries, then release — possibly also outside the
rectangle entirely, if the drag was fast. An event handler attached to the rectangle
itself only ever fires while the cursor is *over* the rectangle; the moment a fast
drag moves the cursor past its edge, that element stops receiving mouse-move events
altogether. Handling a drag correctly requires listening at a level that keeps
receiving events no matter where the cursor goes: the entire browser window.

---

## Step 1 — Track What Is Being Dragged

**The problem:** While a drag is in progress, this project needs to remember *which*
widget is being dragged, and exactly where inside it the cursor first grabbed it —
without that offset, the rectangle would snap so its top-left corner sits under the
cursor the instant you start dragging, rather than staying wherever you actually
clicked.

```tsx
interface DragState {
  widgetId: string;
  offsetX: number;
  offsetY: number;
}

function App() {
  // ...existing widgets and selectedId state...
  const [dragState, setDragState] = useState<DragState | null>(null);

  function handleMouseDownOnWidget(widget: Widget, event: React.MouseEvent) {
    event.stopPropagation();
    setSelectedId(widget.id);
    setDragState({
      widgetId: widget.id,
      offsetX: event.clientX - widget.x,
      offsetY: event.clientY - widget.y,
    });
  }

  // ...
}
```

**Walkthrough:** `event: React.MouseEvent` types the event this handler receives —
`React.MouseEvent` (not the browser's own global `MouseEvent`, an important
distinction explained fully in Step 2) is React's own wrapper type for a mouse
event that occurred on a JSX element with an `onMouseDown`, `onClick`, or similar
prop. `event.clientX` and `event.clientY` are the cursor's coordinates relative to
the browser's viewport — the same coordinate space `widget.x` and `widget.y` are
already defined in, since `Rectangle` is positioned with `position: absolute` inside
a full-viewport container.

`offsetX: event.clientX - widget.x` computes *where inside the rectangle* the click
landed — if the rectangle's left edge is at `x = 100` and the click happened at
`clientX = 130`, the click landed 30 pixels in from the left edge. Remembering this
offset is what lets Step 2 keep that same relative grab point under the cursor for
the entire drag, instead of the rectangle jumping to align its corner with the
cursor.

---

## Step 2 — Listen for Movement, Wherever It Happens

**The problem:** Once a drag has started, the rectangle's position must update on
every mouse movement anywhere in the window, and stop the moment the mouse button is
released anywhere in the window — neither of which `Rectangle`'s own event handlers
can observe once the cursor leaves it.

```tsx
import { useEffect, useState } from 'react';

// ...inside App...

useEffect(() => {
  if (!dragState) {
    return;
  }

  function handleMouseMove(event: MouseEvent) {
    setWidgets((currentWidgets) =>
      currentWidgets.map((widget) =>
        widget.id === dragState.widgetId
          ? { ...widget, x: event.clientX - dragState.offsetX, y: event.clientY - dragState.offsetY }
          : widget,
      ),
    );
  }

  function handleMouseUp() {
    setDragState(null);
  }

  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseup', handleMouseUp);

  return () => {
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };
}, [dragState]);
```

Wire up the JSX: add `onMouseDown={(event) => handleMouseDownOnWidget(widget, event)}`
to each `<Rectangle>` in `App`'s render — this can live on `App`'s side rather than
inside `Rectangle` itself, or be passed down as another callback prop, matching the
`onSelect` pattern from lesson 03; either is reasonable, and this project passes it
down as `onDragStart` to keep `Rectangle` consistent with how it already receives
`onSelect`.

Save and reload. Click and hold a rectangle, move the mouse anywhere on the page,
even past where the rectangle used to be — it follows exactly, grabbed at the exact
point you first clicked. Release: it stays put.

**Walkthrough — `useEffect`:** `useEffect(setupFunction, dependencyArray)` is
React's hook for **effects** — code that reaches outside React's own rendering
model to interact with something in the outside world: the browser's global event
system, a timer, a manual subscription, anything React itself does not manage.
Rendering (what every previous lesson has done) is supposed to be a pure
description of "what should the UI look like right now" — attaching a global event
listener is not describing UI at all, so it does not belong directly in a
component's rendering logic; it belongs in an effect.

The **dependency array**, `[dragState]`, tells React exactly when to re-run this
effect: only when `dragState` itself changes to a new value between renders. When a
drag starts (`dragState` goes from `null` to a real object), the effect runs and
attaches the listeners. While dragging continues and only `widgets` changes (not
`dragState`), the effect does *not* re-run — the same two listeners stay attached
throughout the whole drag, which is exactly what should happen.

The function `useEffect`'s setup function *returns* — `return () => { ...
removeEventListener calls... }` — is the **cleanup function**. React calls it
immediately before running the effect again (here: the moment `dragState` changes,
which happens on mouse-up, setting it back to `null`) and also when the component
unmounts entirely. Without it, starting a second drag later would add a *second*
pair of `mousemove`/`mouseup` listeners on top of the first pair, which was never
removed — Step 3 demonstrates exactly what that looks like.

`if (!dragState) { return; }`, placed before anything else in the effect, means the
listeners are only ever attached while an actual drag is in progress — a `null`
`dragState` (no drag happening) results in an effect that does nothing at all,
attaching nothing.

**Why `event: MouseEvent`, not `React.MouseEvent`, inside `handleMouseMove`:** These
two listeners are registered with `window.addEventListener` directly — a browser
API, entirely outside React — not through a JSX `onMouseMove` prop. Events received
this way are the browser's own native `MouseEvent` objects, never wrapped by React
at all. `React.MouseEvent` (used in Step 1) only exists for events attached through
JSX props; the moment you call `addEventListener` yourself, you are back to plain
browser APIs and their native types, and TypeScript correctly requires both, as two
different types, in two different places within this same lesson.

**CS lens — the stale closure problem, and why the setter uses a callback here.**
`setWidgets((currentWidgets) => currentWidgets.map(...))` passes a *function* to
`setWidgets`, rather than computing the new array directly from the `widgets`
variable in scope. This matters specifically because `handleMouseMove` is defined
inside an effect that only re-runs when `dragState` changes — for the entire
duration of one drag, `handleMouseMove` is the *same* function, created once,
holding onto (or **closing over**) whatever `widgets` looked like at that one moment
the effect last ran. If it read `widgets` directly and computed `widgets.map(...)`,
every single mouse-move during that drag would compute the new list starting from
that same stale snapshot, discarding every position update from every earlier
mouse-move in the same drag — the rectangle would visually jump back and forth
instead of moving smoothly. Passing a function to `setWidgets` sidesteps the
problem entirely: React always calls it with the *actual current* state at the
moment the update is applied, never a value captured in an old closure.

---

## Connect the Pieces

```
src/App.tsx     dragState: DragState | null — new state describing an in-progress
                drag; a useEffect keyed on it attaches and cleans up window-level
                listeners
Rectangle       Gains onDragStart, called from onMouseDown — still does not know
                what dragging even means, only that something wants to be told
                when a mouse-down happens on it
```

---

## What Breaks Without This

**Without the cleanup function:** Drag a widget, release, and drag a different one.
The first drag's `mousemove` listener was never removed — now two listeners run on
every mouse movement, both calling `setWidgets`, one of them still trying to move
the *first* widget (whose `dragState.widgetId` it captured when it was created) even
though that drag ended. With a third drag, three listeners run. The bug is
invisible with one drag, and only shows up, worse each time, exactly in proportion
to how many drags have happened — a classic symptom of a missing cleanup function.

**Without listening on `window` (attaching `mousemove` to the rectangle itself
instead):** Drag quickly. The moment the cursor outpaces the rectangle and exits its
boundaries — which happens constantly during a normal fast drag — the rectangle
stops receiving any further mouse-move events at all, and the drag appears to
"lose" the shape, leaving it stuck wherever the cursor last happened to still be
over it.

---

## Definition of Done

- [ ] Clicking and holding a rectangle, then moving the mouse, drags it smoothly, even past its own original boundaries
- [ ] The rectangle stays grabbed at the exact point it was clicked, not snapped to its corner
- [ ] Releasing the mouse anywhere stops the drag
- [ ] Starting and ending multiple drags in a row never causes movement to become erratic or duplicated
- [ ] You can explain why a drag cannot be implemented using only the rectangle's own event handlers
- [ ] You can explain what a `useEffect` cleanup function is for, using the duplicate-listener bug as the concrete example
- [ ] You can explain the difference between `React.MouseEvent` and the native `MouseEvent`, and why this lesson uses both
- [ ] You can explain what a stale closure is and why `setWidgets` is called with a function here instead of a computed array
- [ ] Run:
      ```
      git add src/App.tsx
      git commit -m "Add dragging via a window-level mousemove listener, cleaned up on drag end"
      ```

---

*Next: Lesson 05 — The Properties Panel. A sidebar shows the selected widget's exact
x, y, width, and height in editable number fields. This is the lesson where
`selectedId`, already lifted to `App`, has to serve a second, completely different
component for the first time — the moment "lifting state up" stops being a
convenience and becomes the only way the feature works.*
