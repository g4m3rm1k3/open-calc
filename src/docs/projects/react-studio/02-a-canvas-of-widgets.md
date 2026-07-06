# React Studio — Lesson 02 — A Canvas of Widgets

## What You Will Build

Three rectangles render from a list instead of being copy-pasted three times, and a
button adds a new one, in a random position and color, every time it is clicked.
This is the first time this project's UI changes *after* the initial render — the
first real exercise of the "virtual DOM" idea introduced, but not yet used, in
lesson 01.

---

## What You Need to Know First

Lesson 01 left `src/App.tsx` with a `Rectangle` component (props: `x`, `y`, `width`,
`height`, `color`) and an `App` component rendering exactly one of them, hardcoded.

---

## Step 1 — Give Every Widget an Identity

**The problem:** A list of widgets needs to be more than a list of shapes — each one
needs an identity that survives the list changing, so React (and later, this
project's own logic) can talk about "this specific widget," not just "whatever is
currently in position 2."

Update `src/App.tsx`:

```tsx
interface Widget {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

function createWidget(x: number, y: number): Widget {
  return {
    id: crypto.randomUUID(),
    x,
    y,
    width: 120,
    height: 80,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
  };
}
```

**Walkthrough:** `Widget` now includes `id: string`, alongside the same geometry and
color fields `RectangleProps` already had. `crypto.randomUUID()` is a browser API
that generates a **UUID** (Universally Unique Identifier) — a randomly generated
string so large (122 random bits) that two calls producing the same value is not a
practical concern. This is used instead of, say, the widget's position in an array,
because a position changes the moment anything is inserted, removed, or reordered —
an *identity* should not change just because something unrelated happened elsewhere
in the list.

`createWidget` is a **factory function** — a function whose entire job is
constructing a new value of a given shape, so that "what does a freshly created
widget look like" is answered in exactly one place. `` `hsl(${Math.floor(Math.random()
* 360)}, 70%, 60%)` `` builds a random but pleasant colour using the **HSL** colour
model (Hue, Saturation, Lightness) — a random hue (0–360 degrees around the colour
wheel) with fixed saturation and lightness keeps every generated colour vivid and
readable, rather than the muddy or unreadably dark/light results a fully random RGB
colour could produce.

---

## Step 2 — Store Widgets in State

**The problem:** `App` needs to remember a list of widgets across renders, and be
able to change that list over time — something a plain variable cannot do.

```tsx
import { useState } from 'react';

function App() {
  const [widgets, setWidgets] = useState<Widget[]>([
    createWidget(60, 60),
    createWidget(220, 140),
    createWidget(380, 60),
  ]);

  function handleAddWidget() {
    const newWidget = createWidget(
      Math.random() * 500,
      Math.random() * 400,
    );
    setWidgets([...widgets, newWidget]);
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#f4f4f5' }}>
      <button onClick={handleAddWidget} style={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}>
        Add Rectangle
      </button>
      {widgets.map((widget) => (
        <Rectangle key={widget.id} {...widget} />
      ))}
    </div>
  );
}
```

Save and reload. Three rectangles appear at fixed positions. Click "Add Rectangle"
repeatedly: a new one appears, in a random spot and colour, every time.

**Walkthrough:** `useState<Widget[]>([...])` is React's most fundamental **hook** —
a special function (always starting with `use`, always called directly inside a
component, never inside a loop or condition) that lets a function component have
memory across renders, something an ordinary function cannot do — a plain
function's local variables are recreated from scratch every time it runs. Calling
`useState(initialValue)` returns exactly two things, which is why it is written as
an **array destructuring**, `const [widgets, setWidgets] = ...`: the *current*
value (`widgets`) and a *setter function* (`setWidgets`) that, when called, updates
the value and tells React this component (and anything relying on this value) needs
to be rendered again.

**CS lens — this is the moment reconciliation actually runs.** Calling
`setWidgets([...widgets, newWidget])` does not directly touch the DOM. It schedules
React to run the `App` function again, producing a brand-new virtual DOM tree — the
lightweight, in-memory description from lesson 01 — now containing one more
`<Rectangle>` than before. React then compares this new tree against the previous
one, element by element, in a process called **reconciliation**, and computes the
smallest possible set of real DOM operations that would turn the old, real page into
the new, described one. In this case: leave the first three rectangles' actual DOM
nodes completely alone, and insert exactly one new `<div>` for the new widget. This
is the entire value proposition of the virtual DOM: you wrote code that describes
the *whole* UI from scratch on every change, and React is responsible for making
that efficient, not you.

`[...widgets, newWidget]` uses the **spread operator** to build a *new* array
containing every element of `widgets` plus `newWidget` at the end, rather than
calling `widgets.push(newWidget)`. This matters for a reason specific to React:
`useState`'s setter compares the *old* value to the *new* one to help decide what
work is necessary, and mutating the existing array in place (`.push`) would leave
`widgets` pointing at the exact same array object as before — from React's
perspective, nothing observably changed, even though its contents did. Always
produce a new array (or object) when updating state; never mutate the old one
directly.

`{...widget}` inside `<Rectangle key={widget.id} {...widget} />` is the same spread
operator, used here to expand every property of the `widget` object
(`x`, `y`, `width`, `height`, `color`) into individual props on `Rectangle`, in one
line, instead of writing `x={widget.x} y={widget.y} ...` by hand. Notice `widget.id`
is not spread this way — `Rectangle`'s `RectangleProps` interface has no `id` field,
because `Rectangle` itself has no need to know its own identity; only the list
rendering it does.

---

## Concept: The `key` Prop

`key={widget.id}` is not a prop `Rectangle` receives — React intercepts it before
`Rectangle` ever sees it. A `key` is how React's reconciliation matches an element
in the *new* virtual DOM tree to the corresponding element in the *old* one, across
a list: "this described rectangle and that previous rectangle are the same logical
widget, just possibly with different props now," versus "this is a brand-new
rectangle that did not exist before."

**Why not use the array index as the key (`widgets.map((widget, index) =>
<Rectangle key={index} ... />)`), since it is right there and always unique within
one render?** An index describes *position*, not *identity* — position 0 today might
be a completely different widget than position 0 was a moment ago, the instant
anything is inserted before it, removed, or reordered. Appending to the end, which
is the only operation this lesson's button performs, happens to never expose the
difference — every existing widget keeps its same index every time. The very first
time this project deletes a widget (lesson 15) or reorders one (never built here,
but a natural feature of any real design tool), index-based keys would cause React
to match the wrong DOM node to the wrong widget, silently misattributing anything
tied to that specific DOM node — component-local state, focus, an in-progress CSS
transition — to whichever widget now happens to occupy that position. Using a
stable, real identity (`widget.id`) from the very first list this project ever
renders means that bug can never occur later, in a part of the app that has long
since stopped being "the list-rendering lesson."

---

## Connect the Pieces

```
src/App.tsx      Widget (a data shape with a real identity), createWidget() (a factory),
                 useState<Widget[]> (memory across renders), .map() + key (list rendering)
```

`Rectangle`, from lesson 01, needed zero changes — it still only knows how to draw
one rectangle from one set of props, exactly as it always has. Everything new in
this lesson lives in how `App` manages *many* of them.

---

## What Breaks Without This

**Without `useState` (using a plain `let widgets = [...]` instead):** Reassigning
`widgets` inside `handleAddWidget` changes the variable, but nothing tells React a
render is needed — the function component never re-runs, and the new rectangle
never appears on screen, even though the underlying array, if you logged it, would
show the new widget was really added. State that should cause a re-render must go
through `useState` (or a hook built on top of it); a plain variable is invisible to
React entirely.

**Without a stable `id`-based key (using the array index instead):** Nothing visibly
wrong happens with only an "Add" button — every new widget appends after the
existing ones, so every existing widget's index never actually changes. The bug is
latent, not absent: the moment lesson 15 adds a delete button, removing the first
widget out of five means every remaining widget shifts down by one index — position
0 is now the *second* widget, but React, matching purely by key, believes position 0
is still the *first* widget with new props, and updates the existing DOM node in
place accordingly rather than removing and creating the right nodes. With this
project's plain, stateless rectangles, that mismatch stays invisible; the identical
mistake in a widget with its own internal state (a text field mid-edit, for example)
would show that state attached to the wrong shape.

---

## Definition of Done

- [ ] Three rectangles render from an array, not three copy-pasted JSX elements
- [ ] Clicking "Add Rectangle" adds a new, randomly placed and coloured rectangle every time
- [ ] Every widget has a real `id`, generated once, at creation
- [ ] `key={widget.id}` is used, not the array index
- [ ] You can explain what `useState` returns and why it is destructured as an array
- [ ] You can explain, mechanically, what happens between calling `setWidgets(...)` and a new rectangle appearing on screen
- [ ] You can explain why mutating and reusing the same array (`.push`) does not reliably trigger a re-render
- [ ] You can explain what a `key` is for, and describe a concrete scenario (not necessarily buildable yet) where an index-based key produces a visible bug
- [ ] Run:
      ```
      git add src/App.tsx
      git commit -m "Render widgets from state; add new ones with a button, each with a stable identity"
      ```

---

*Next: Lesson 03 — Selection. Clicking a widget highlights it — the first time two
different pieces of this project (a widget, and "which widget is selected") need to
agree on a single, shared truth.*
