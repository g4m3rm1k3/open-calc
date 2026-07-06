# React Studio — Lesson 03 — Selection

## What You Will Build

Clicking a rectangle highlights it with a blue outline. Clicking empty canvas space
clears the highlight. Only one widget is ever highlighted at a time. This sounds
small; it is the first lesson where a piece of state describes a relationship
*between* things — a widget and the fact of being "the selected one" — rather than
describing one thing in isolation.

---

## What You Need to Know First

Lesson 02 left `App` holding `widgets: Widget[]` in `useState`, rendered via
`.map()` into `<Rectangle key={widget.id} {...widget} />`.

---

## Concept: Where Should "Which One Is Selected" Live?

A `Widget` object describes one shape: its position, size, and colour. "Is this
widget currently selected" is tempting to add as a field directly on `Widget` itself
— `{ id, x, y, width, height, color, isSelected: boolean }` — but this is the wrong
place for it, for a concrete reason: only *one* widget can be selected at a time,
across the *entire* list. If selection lived on each widget individually, selecting
one would require finding and updating every *other* widget's `isSelected` back to
`false` at the same time, just to keep the invariant "at most one is true" from
silently breaking.

The actual fact being represented is not "a property of one widget" — it is "a
single piece of information about the whole canvas: which id, if any, is currently
selected." That belongs in exactly one place, at the level that can see the whole
list: `App`.

---

## Step 1 — Add Selection State

**The problem:** `App` needs to remember, across renders, which widget (if any) is
currently selected.

```tsx
function App() {
  const [widgets, setWidgets] = useState<Widget[]>([
    createWidget(60, 60),
    createWidget(220, 140),
    createWidget(380, 60),
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  function handleAddWidget() {
    setWidgets([...widgets, createWidget(Math.random() * 500, Math.random() * 400)]);
  }

  // ... rendered in Step 2
}
```

**Walkthrough:** `useState<string | null>(null)` starts with nothing selected —
`null` is a real, deliberate value here, not an oversight: "no widget is selected"
is a distinct, valid state of the application, not the absence of one. The type
`string | null` says exactly that: either a real widget's `id`, or `null`, and
nothing else — TypeScript will not allow this variable to silently hold, say, an
empty string used to mean the same thing by accident.

---

## Step 2 — Let Widgets Be Selected

**The problem:** `Rectangle` needs to know whether *it specifically* is the selected
one, and needs a way to tell `App` "the user just clicked me."

Update `Rectangle`:

```tsx
interface RectangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  isSelected: boolean;
  onSelect: () => void;
}

function Rectangle({ x, y, width, height, color, isSelected, onSelect }: RectangleProps) {
  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        backgroundColor: color,
        outline: isSelected ? '2px solid #2563eb' : 'none',
        outlineOffset: 2,
      }}
    />
  );
}
```

Update `App`'s render:

```tsx
return (
  <div
    onClick={() => setSelectedId(null)}
    style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#f4f4f5' }}
  >
    <button onClick={handleAddWidget} style={{ position: 'absolute', top: 12, left: 12, zIndex: 1 }}>
      Add Rectangle
    </button>
    {widgets.map((widget) => (
      <Rectangle
        key={widget.id}
        {...widget}
        isSelected={widget.id === selectedId}
        onSelect={() => setSelectedId(widget.id)}
      />
    ))}
  </div>
);
```

Save and reload. Click a rectangle: a blue outline appears around it, and any
previously selected one loses its outline. Click empty canvas space: the outline
disappears entirely.

**Walkthrough:** `isSelected: boolean` and `onSelect: () => void` are two *new*
kinds of prop `Rectangle` has never received before. `isSelected` is ordinary data,
computed fresh on every render by `App` as `widget.id === selectedId` — `Rectangle`
itself does not know what "selected" means globally; it only knows the one boolean
fact it was handed. `onSelect: () => void` is a **callback prop** — a function,
passed down as data, that `Rectangle` calls when something happens, without
`Rectangle` needing to know *what* that function actually does. This is the same
"data in, let the caller decide what happens next" discipline
[Frontend Client](../frontend-client/README.md) used for every form component it
built — the identical idea, appearing here for the first time in this project.

`onClick={(event) => { event.stopPropagation(); onSelect(); }}` handles the click
*and* stops it from doing something unwanted. `event.stopPropagation()` prevents
this click from continuing to **bubble** — the browser's default behaviour of
running a clicked element's own handler, then its parent's, then its parent's
parent, and so on up the tree. Without this call, clicking a rectangle would run
`Rectangle`'s own `onClick` (selecting it) *and then* `App`'s own `onClick` on the
outer `<div>` (deselecting everything, since that handler always calls
`setSelectedId(null)`) — the net result would be that nothing ever stayed selected,
because every click on a widget would also count as a click on the background behind
it.

`widget.id === selectedId` is recalculated for *every* widget, on *every* render —
this is intentional and cheap: comparing two strings costs nothing measurable, and
it means there is only one source of truth (`selectedId`) that could ever be wrong,
rather than needing to keep some separate `isSelected` flag correctly in sync with
it by hand.

**SE lens — this is "lifting state up," in its simplest possible form.**
`selectedId` lives in `App` — the nearest common ancestor of every `Rectangle` that
needs to read or affect it — rather than inside any one `Rectangle`. Right now, only
one *kind* of component (`Rectangle`, several times over) reads this state; lesson
05 raises the stakes on this exact pattern by introducing a second, entirely
different component (a Properties Panel) that needs to read and write the very same
`selectedId`, at which point keeping it in `App` stops being a preference and
becomes the only way the feature can work at all.

---

## Connect the Pieces

```
src/App.tsx     selectedId: string | null — a new piece of state describing a
                relationship across the whole widget list, not a property of any one widget
Rectangle       Gains isSelected and onSelect — still knows nothing about selection
                itself, only the one boolean and one callback it was handed
```

---

## What Breaks Without This

**Without `event.stopPropagation()`:** Click any rectangle. It briefly appears
selected and then immediately deselects, because the click event continues bubbling
up to the canvas background's own `onClick`, which unconditionally clears
`selectedId` right after `Rectangle`'s handler just set it.

**With `isSelected` stored on each `Widget` instead of derived from `selectedId`:**
Selecting a second widget requires manually finding the previously selected widget
in the array and flipping its `isSelected` back to `false`, in the same update that
sets the new one to `true` — two things that must always change together, tracked in
two different places, is exactly the kind of state that eventually falls out of
sync: one missed update anywhere in the codebase and two widgets appear selected
simultaneously, a state the UI was never designed to represent correctly.

---

## Definition of Done

- [ ] Clicking a rectangle highlights it with a visible outline
- [ ] Clicking a different rectangle moves the highlight; only one is ever highlighted
- [ ] Clicking empty canvas space clears the highlight entirely
- [ ] `selectedId` lives in `App`, typed as `string | null`
- [ ] You can explain why "which widget is selected" belongs in `App` rather than as a field on each `Widget`
- [ ] You can explain what event bubbling is and what `stopPropagation()` prevents here, specifically
- [ ] You can explain what a callback prop is, using `onSelect` as the example
- [ ] Run:
      ```
      git add src/App.tsx
      git commit -m "Add single-widget selection, lifted to the nearest common ancestor"
      ```

---

*Next: Lesson 04 — Dragging. The selected widget follows the mouse. This is the
first feature that updates state dozens of times per second, and the first time
this project has to think carefully about updating one specific object inside an
array without touching any of the others.*
