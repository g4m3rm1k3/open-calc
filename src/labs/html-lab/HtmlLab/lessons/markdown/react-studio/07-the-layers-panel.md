# React Studio — Lesson 07 — The Layers Panel

## What You Will Build

A second sidebar lists every widget on the canvas by type and position in the
stack — "Rectangle," "Circle," "Text" — with the topmost widget listed first.
Clicking a layer selects the matching widget on the canvas, highlighting it exactly
as a direct click would. Clicking a widget on the canvas highlights the matching
layer. Neither panel knows the other exists.

---

## What You Need to Know First

Lesson 06 left `Widget` as a discriminated union rendered by `WidgetView`, with
`selectedId` in `App` already shared between the canvas and the Properties Panel.

---

## Concept: Proving the Pattern Scales

Lessons 03 and 05 established that `selectedId` belongs in `App`, and that any
component needing it should simply receive it (or a derived value) as a prop,
without owning any private copy of its own. That claim has only been tested with
two consumers so far. This lesson adds a third, unrelated one — a list, not a
canvas or a form — specifically to confirm the claim generalises: **any number** of
components can share one piece of lifted state, because the mechanism was never
"two components agree to stay in sync" — it was always "one component owns the
truth, and everyone else just reads or requests changes to it."

---

## Step 1 — Build the Layers Panel

**The problem:** Something needs to list every widget by a human-readable label,
show which one is selected, and let clicking a row select the corresponding widget.

```tsx
interface LayersPanelProps {
  widgets: Widget[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

function widgetLabel(widget: Widget): string {
  switch (widget.type) {
    case 'rectangle':
      return 'Rectangle';
    case 'circle':
      return 'Circle';
    case 'text':
      return `Text: "${widget.text}"`;
  }
}

function LayersPanel({ widgets, selectedId, onSelect }: LayersPanelProps) {
  const topmostFirst = [...widgets].reverse();

  return (
    <div style={{ width: 180, padding: 16 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 14 }}>Layers</h3>
      {topmostFirst.map((widget) => (
        <div
          key={widget.id}
          onClick={() => onSelect(widget.id)}
          style={{
            padding: '4px 8px',
            borderRadius: 4,
            cursor: 'pointer',
            backgroundColor: widget.id === selectedId ? '#dbeafe' : 'transparent',
          }}
        >
          {widgetLabel(widget)}
        </div>
      ))}
    </div>
  );
}
```

Add it to `App`'s render, receiving `widgets`, `selectedId`, and `setSelectedId`
directly — no new state anywhere:

```tsx
<LayersPanel widgets={widgets} selectedId={selectedId} onSelect={setSelectedId} />
```

Save and reload. Click a layer: the matching widget highlights on the canvas. Click
a widget on the canvas: the matching layer highlights in this new panel.

**Walkthrough:** `onSelect={setSelectedId}` passes `App`'s own state setter directly
as a prop, with no wrapper function around it — `LayersPanel` calling `onSelect(id)`
is, in every meaningful sense, calling `setSelectedId(id)` itself, just without
needing to know that name or that it is a state setter at all. This is the same
"data in, let the caller decide" shape every callback prop in this project has used
since lesson 03's `onSelect`.

`widgetLabel(widget)` is its own small `switch` on `widget.type`, separate from
`renderWidgetContent`'s — a second, independent example of narrowing a
discriminated union, done here purely to produce a text label rather than JSX. This
project now has two functions that switch on the same union for two different
purposes, which is a real, minor duplication worth naming honestly: both would need
a new `case` the moment lesson 14 adds a widget type. This is acceptable for now —
the two switches produce genuinely different things (a label vs. a rendered
shape) — and is exactly the kind of duplication lesson 14's plugin registry
resolves properly, once there is a real, felt reason to.

**Concept — `[...widgets].reverse()`, and why the copy is not optional.** Widgets
later in the `widgets` array render *later* in the DOM, which means they visually
sit *on top of* earlier ones — the normal behaviour of overlapping
`position: absolute` elements, later siblings painting over earlier ones. A layers
panel, by convention (matching every real design tool), lists the topmost item
first. `.reverse()` is a **mutating array method**: called directly on an array, it
reverses that array's contents *in place* and returns the same array reference,
rather than producing a new one. Calling `widgets.reverse()` directly, without
copying first, would reverse `App`'s actual state array in place — the very same
array `WidgetView`'s rendering and every other reader depend on — silently flipping
the real stacking order of every widget on the canvas as a side effect of a display
label list that was only ever supposed to affect this one panel. `[...widgets]`
creates a shallow copy first — a new array containing the same widget references,
in the same order — so `.reverse()` has an array of its own to mutate, leaving
`App`'s real `widgets` state completely untouched.

**SE lens — this is the same "never mutate, always copy" rule from every lesson
since lesson 02, applied to a new method.** `.push`, `.reverse`, `.sort`, and
`.splice` all mutate the array they are called on; `.map`, `.filter`, and the spread
operator all produce new ones. Knowing which category a given array method falls
into, and defaulting to the non-mutating one (or copying first, as here, when the
mutating one is genuinely the simplest tool for the job) is not a style preference
in a React project — it is the difference between a change React notices and one it
silently does not.

---

## Connect the Pieces

```
src/App.tsx        No new state — LayersPanel reads the exact same widgets and
                    selectedId every other component already reads
LayersPanel         Third independent consumer of selectedId, proving the pattern
                    from lesson 03 scales to any number of components
```

---

## What Breaks Without This

**Without copying before `.reverse()`:** Load the page with three widgets, added in
order: rectangle, circle, text. Open the Layers Panel — it works correctly at
first render. Now add a fourth widget. Because `widgets.reverse()` (without a copy)
already flipped the *actual* `widgets` array the very first time the panel rendered,
every subsequent operation that assumed array order matched creation order — which
`WidgetView`'s stacking order implicitly does — is now silently working with a
permanently reversed list, visible as newly added widgets appearing to stack in the
wrong order beneath older ones instead of above them.

**Without `LayersPanel` receiving `setSelectedId` directly, and instead maintaining
its own separate "which layer looks highlighted" state:** Clicking a widget directly
on the canvas would correctly select it (updating `App`'s real `selectedId`) but the
Layers Panel's own separate, disconnected highlight state would never know that
happened — the two panels would visibly disagree about what is selected, exactly the
sync bug lifting state up exists to prevent.

---

## Definition of Done

- [ ] Every widget appears in the Layers Panel with a readable label
- [ ] The topmost widget (last added, or last moved to front) appears first in the list
- [ ] Clicking a layer selects the matching widget on the canvas
- [ ] Clicking a widget on the canvas highlights the matching layer
- [ ] `LayersPanel` holds no state of its own related to selection
- [ ] You can explain why `[...widgets].reverse()` is necessary instead of `widgets.reverse()`
- [ ] You can name which array methods mutate in place and which produce a new array
- [ ] You can explain why this lesson required zero new state in `App`, only a new component reading what already existed
- [ ] Run:
      ```
      git add src/App.tsx
      git commit -m "Add a Layers Panel as a third independent consumer of the shared selection state"
      ```

---

*Next: Lesson 08 — Grouping. Selecting several widgets and grouping them combines
them into a single widget that contains widgets — the first time this project's
data is a genuine tree, and the first time a component has to render itself, recursively,
to draw its own children.*
