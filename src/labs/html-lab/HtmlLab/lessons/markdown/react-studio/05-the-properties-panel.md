# React Studio — Lesson 05 — The Properties Panel

## What You Will Build

A sidebar appears beside the canvas. Select a widget: its exact `x`, `y`, `width`,
and `height` appear in editable number fields. Type a new width: the rectangle on
the canvas resizes immediately, in the same frame. This is the lesson where
`selectedId` — already lifted to `App` back in lesson 03 — has to serve a second,
completely different component for the first time, which is exactly the moment
"lifting state up" stops being a nice idea and becomes the only way this feature
could possibly work.

---

## What You Need to Know First

Lesson 04 left `App` holding `widgets`, `selectedId`, and `dragState`, with dragging
updating a widget's `x`/`y` immutably via `.map()` inside a `mousemove` listener.

---

## Concept: Two Components, One Fact

The canvas (every `Rectangle`) and the new Properties Panel both need to display —
and, for the panel, edit — the exact same fact: the selected widget's current
geometry. If each held its own separate copy of that data, they would need to be
kept in sync by hand, forever, every time either one changed it — exactly the same
problem lesson 03 identified for selection itself, now applying to a widget's actual
properties.

The fix is the same one already in place: neither component owns this data. `App`
does — the nearest common ancestor of both — and both the canvas and the Properties
Panel simply *display* whatever `App` currently holds, and *ask* `App` to change it
when the user interacts with either one.

---

## Step 1 — Extract a Shared Update Function

**The problem:** Lesson 04's drag logic already knows how to update one widget's
fields immutably inside the array. The Properties Panel needs to do the exact same
kind of update — change specific fields on one widget, leave every other widget
untouched — and duplicating that logic would mean two places doing the same thing
slightly differently.

```tsx
function updateWidget(id: string, updates: Partial<Widget>): void {
  setWidgets((currentWidgets) =>
    currentWidgets.map((widget) => (widget.id === id ? { ...widget, ...updates } : widget)),
  );
}
```

Replace the body of `handleMouseMove` (from lesson 04) with a call to this new
function:

```tsx
function handleMouseMove(event: MouseEvent) {
  if (!dragState) return;
  updateWidget(dragState.widgetId, {
    x: event.clientX - dragState.offsetX,
    y: event.clientY - dragState.offsetY,
  });
}
```

**Walkthrough:** `Partial<Widget>` is a TypeScript **utility type** that takes an
existing type and makes every one of its fields optional — `Partial<Widget>` allows
`{ x: 150 }` alone, or `{ width: 80, height: 40 }` together, without requiring every
field `Widget` has. This is exactly the right shape for "here are the specific
fields that changed" — the caller only supplies what is actually different.

`{ ...widget, ...updates }` spreads `widget`'s existing fields first, then spreads
`updates` over them — any key present in both keeps `updates`' value, since a later
spread always overwrites an earlier one for the same key, and any field `updates`
does not mention is left exactly as `widget` already had it. This one line is the
entire mechanism behind "change only what changed, immutably."

**SE lens — this is the DRY principle, discovered from real duplication, exactly
the way [Frontend Client](../frontend-client/README.md) discovered its own
components.** `updateWidget` did not get built in advance, speculatively, "in case
it might be useful." It got built the moment a second, genuinely different feature
needed the exact same operation lesson 04 had already written once.

---

## Step 2 — Build the Panel

**The problem:** Something needs to render editable fields for the selected
widget's properties — or nothing at all, if no widget is selected.

```tsx
interface PropertiesPanelProps {
  widget: Widget | null;
  onChange: (id: string, updates: Partial<Widget>) => void;
}

function PropertiesPanel({ widget, onChange }: PropertiesPanelProps) {
  if (!widget) {
    return (
      <div style={{ width: 220, padding: 16, color: '#71717a' }}>
        Select a widget to edit its properties.
      </div>
    );
  }

  return (
    <div style={{ width: 220, padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label>
        X
        <input
          type="number"
          value={widget.x}
          onChange={(event) => onChange(widget.id, { x: Number(event.target.value) })}
        />
      </label>
      <label>
        Y
        <input
          type="number"
          value={widget.y}
          onChange={(event) => onChange(widget.id, { y: Number(event.target.value) })}
        />
      </label>
      <label>
        Width
        <input
          type="number"
          value={widget.width}
          onChange={(event) => onChange(widget.id, { width: Number(event.target.value) })}
        />
      </label>
      <label>
        Height
        <input
          type="number"
          value={widget.height}
          onChange={(event) => onChange(widget.id, { height: Number(event.target.value) })}
        />
      </label>
    </div>
  );
}
```

Update `App`'s render to compute the selected widget and lay out the panel beside
the canvas:

```tsx
const selectedWidget = widgets.find((widget) => widget.id === selectedId) ?? null;

return (
  <div style={{ display: 'flex', height: '100vh' }}>
    <div onClick={() => setSelectedId(null)} style={{ position: 'relative', flex: 1, backgroundColor: '#f4f4f5' }}>
      {/* canvas contents unchanged */}
    </div>
    <PropertiesPanel widget={selectedWidget} onChange={updateWidget} />
  </div>
);
```

Save and reload. Select a widget: its real numbers appear in the panel. Change the
width field: the rectangle resizes on the canvas immediately.

**Walkthrough:** `widgets.find((widget) => widget.id === selectedId) ?? null`
searches the array for the widget whose `id` matches `selectedId`, returning
`undefined` if none matches (which happens whenever `selectedId` is `null`, or in
principle if a selected widget were ever deleted while still selected). `?? null` is
the **nullish coalescing operator** — it returns its left side unless that side is
specifically `null` or `undefined`, in which case it returns the right side; here,
normalising `undefined` specifically into `null`, so `PropertiesPanelProps` only
ever needs to describe one "nothing selected" value instead of two.

**Concept — controlled inputs.** `<input value={widget.x} onChange={...} />` is a
**controlled input**: its displayed value is set directly from React state
(`widget.x`), not managed internally by the DOM the way a plain HTML `<input>`
normally would be. Every keystroke fires `onChange`, which calls `onChange(widget.id,
{ x: Number(event.target.value) })` — updating `App`'s state — which causes a
re-render — which passes the *new* `widget.x` back into the input's `value` prop,
displaying exactly what was just typed. This round trip, on every keystroke, is
what makes React — not the browser — the single source of truth for what this field
currently contains; if `App`'s state were ever updated by something else (an
external change, a reset button, a future "align to grid" feature), this input
would reflect it immediately, with no special code required, because it never had
its own independent memory to begin with.

`event.target.value` is always a `string` — every HTML input reports its value as
text, regardless of `type="number"` — which is why `Number(event.target.value)`
explicitly converts it before it reaches `updateWidget`, which expects an actual
`number` per the `Widget` interface.

**SE lens — the payoff of lifting state up, now visible.** `PropertiesPanel` and
`Rectangle` share not one, but every property they both care about — position and
size — with zero coordination code between them, no "sync" step, no event
dedicated to "tell the other component something changed." Both simply render
whatever `App` currently holds. This is the entire reason the pattern from lesson 03
existed before there was a second consumer to justify it: by the time a second
component genuinely needed the same data, the correct place for it to live had
already been chosen correctly, and adding the new component required no changes at
all to where the state lived — only to what read it.

---

## Connect the Pieces

```
src/App.tsx              updateWidget() — one shared, immutable update function,
                          now used by both dragging and the Properties Panel
PropertiesPanel           New component: controlled inputs, driven entirely by
                          the selected widget and a callback, exactly like every
                          component before it
```

---

## What Breaks Without This

**Without `updateWidget` as a single shared function (writing the update logic
separately inside the panel's `onChange` handlers):** A future change to how widgets
are updated — validating that width can never go negative, say — would need to be
applied in two separate places: the drag handler and the panel's handlers. Miss one,
and dragging could still produce a negative width the panel's own validation would
have prevented.

**Without controlled inputs (letting the `<input>` manage its own value
internally):** Typing a new width would update the input's own displayed text, but
nothing would tell `App` a change happened — the rectangle on the canvas would never
resize, because `App`'s state, the only thing the canvas actually reads, was never
touched.

---

## Definition of Done

- [ ] Selecting a widget shows its real, current x, y, width, and height in the panel
- [ ] Editing any field updates the widget on the canvas immediately
- [ ] Deselecting shows the "Select a widget…" placeholder instead of stale or empty fields
- [ ] `updateWidget` is used by both the drag logic and the Properties Panel
- [ ] You can explain why both the canvas and the panel needed to read the exact same state, rather than each keeping their own copy
- [ ] You can explain what a controlled input is and what would happen to this feature without one
- [ ] You can explain why `event.target.value` always needs converting with `Number(...)` here
- [ ] Run:
      ```
      git add src/App.tsx
      git commit -m "Add a Properties Panel; extract a shared updateWidget used by both it and dragging"
      ```

---

*Next: Lesson 06 — Multiple Widget Types. Text and circles join rectangles — the
first time this project has to render genuinely different UI depending on what kind
of data it was given, not just different values of the same shape.*
