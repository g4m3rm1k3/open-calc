# React Studio — Lesson 08 — Grouping

## What You Will Build

Shift-click two or more widgets to select all of them at once, then click "Group":
they combine into a single widget that moves, exactly as one unit, when dragged.
This is the first lesson where this project's data stops being a flat list and
becomes a genuine tree — a group is a widget that contains widgets, which might
themselves be groups — and the first time a component has to call itself to draw
its own contents.

---

## What You Need to Know First

Lesson 07 left `selectedId: string | null` in `App`, and `Widget` as a
discriminated union of `RectangleWidget | CircleWidget | TextWidget`, rendered by
`WidgetView` + `renderWidgetContent`.

---

## Step 1 — Select More Than One Widget

**The problem:** Grouping requires selecting several widgets first. `selectedId`
can only ever hold one.

Replace `selectedId: string | null` with `selectedIds: string[]` throughout `App`:

```tsx
const [selectedIds, setSelectedIds] = useState<string[]>([]);

function handleSelectWidget(id: string, isShiftClick: boolean) {
  if (!isShiftClick) {
    setSelectedIds([id]);
    return;
  }

  setSelectedIds((current) =>
    current.includes(id) ? current.filter((existingId) => existingId !== id) : [...current, id],
  );
}
```

Update `WidgetView`'s click handler to detect Shift:

```tsx
onClick={(event) => {
  event.stopPropagation();
  onSelect(widget.id, event.shiftKey);
}}
```

Every place that previously checked `widget.id === selectedId` now checks
`selectedIds.includes(widget.id)`; every place that called `setSelectedId(null)`
(deselecting via the background) now calls `setSelectedIds([])`.

**Walkthrough:** `event.shiftKey` is a boolean property on every mouse event,
`true` while the Shift key is held during the click. A plain click now always
replaces the entire selection with just this one widget (`setSelectedIds([id])`);
a Shift-click instead toggles this one widget's membership in the *existing*
selection, using the same `.includes` / `.filter` / spread pattern this project has
used since lesson 02 for adding and removing items from an array immutably.

`PropertiesPanel` and `LayersPanel` both need one small adjustment: `PropertiesPanel`
now receives `selectedIds.length === 1 ? widgets.find((widget) => widget.id ===
selectedIds[0]) ?? null : null` — showing real fields only when exactly one widget
is selected, and a distinct message ("Select a single widget to edit its
properties") when several are, since editing several different widgets' properties
as one merged form is a real feature a production tool would eventually need, and a
deliberate scope boundary this lesson does not cross.

---

## Step 2 — Model a Group

**The problem:** A group needs its own position and size (so it can be selected,
dragged, and resized exactly like any other widget) *and* needs to contain other
widgets.

```tsx
interface GroupWidget extends BaseWidget {
  type: 'group';
  children: Widget[];
}

type Widget = RectangleWidget | CircleWidget | TextWidget | GroupWidget;
```

**Walkthrough:** `GroupWidget` extends `BaseWidget` exactly like every other widget
type — it has `id`, `x`, `y`, `width`, and `height`, which is precisely what lets
dragging, selection, and the Layers Panel keep working on a group with zero changes
to any of them: none of that code has ever cared about anything beyond
`BaseWidget`'s shared fields. `children: Widget[]` is what makes `Widget` a real
**tree** — a `Widget` can now contain other `Widget`s, which, since a child could
itself be a `GroupWidget`, means groups can nest inside groups to any depth, without
this type needing to say anything special about depth at all.

**Crucial design decision — child coordinates are relative to their group, not the
canvas.** A child widget's `x` and `y` are stored as an *offset from the group's own
top-left corner*, not as absolute canvas coordinates. This one decision is what
makes moving a group trivial: updating only the group's own `x`/`y` (through the
exact same `updateWidget` dragging already uses) automatically repositions every
child visually, with no need to walk the tree and update each child's coordinates
individually, for a reason explained precisely in Step 3.

---

## Step 3 — Render a Group Recursively

**The problem:** A group's visual content is not a shape — it is however many
child widgets it contains, each drawn in its correct position.

Add a case to `renderWidgetContent`:

```tsx
function renderWidgetContent(widget: Widget) {
  switch (widget.type) {
    case 'rectangle':
      return <div style={{ width: '100%', height: '100%', backgroundColor: widget.color }} />;
    case 'circle':
      return <div style={{ width: '100%', height: '100%', backgroundColor: widget.color, borderRadius: '50%' }} />;
    case 'text':
      return <div style={{ width: '100%', height: '100%', fontSize: widget.fontSize }}>{widget.text}</div>;
    case 'group':
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {widget.children.map((child) => (
            <div
              key={child.id}
              style={{ position: 'absolute', left: child.x, top: child.y, width: child.width, height: child.height }}
            >
              {renderWidgetContent(child)}
            </div>
          ))}
        </div>
      );
    default: {
      const exhaustiveCheck: never = widget;
      return exhaustiveCheck;
    }
  }
}
```

**Walkthrough — recursion.** `case 'group'` calls `renderWidgetContent` again,
once per child, from inside `renderWidgetContent` itself. This is **recursion**: a
function solving a problem by calling itself on a smaller piece of the same
problem. There is no special-casing for "a group containing a group" anywhere in
this code — if a child happens to be a `GroupWidget`, the recursive call reaches
`case 'group'` again, naturally, and renders *its* children the same way, to
whatever depth the actual data goes. The function does not need to know, or care,
how deep the tree is; it only needs to correctly handle one level and trust itself
to handle the rest.

**CS lens — why relative child coordinates make this correct almost for free.**
`position: absolute` in CSS positions an element relative to its *nearest
positioned ancestor* — any ancestor with `position: relative`, `absolute`, or
`fixed` — not necessarily the whole page. The group's content wrapper here is
`position: relative`, which means every child's `left: child.x; top: child.y` is
measured from *that wrapper's* top-left corner, not the canvas's. This is precisely
why Step 2's decision to store child coordinates relative to their parent group
works correctly with no coordinate math anywhere in the rendering code — the
browser's own containing-block rules do the translation, because the data was
deliberately shaped to match how CSS already works.

---

## Step 4 — Build the Group Themselves

**The problem:** Nothing yet turns several selected widgets into one `GroupWidget`.

```tsx
function handleGroupSelected() {
  const selectedWidgets = widgets.filter((widget) => selectedIds.includes(widget.id));
  if (selectedWidgets.length < 2) return;

  const minX = Math.min(...selectedWidgets.map((widget) => widget.x));
  const minY = Math.min(...selectedWidgets.map((widget) => widget.y));
  const maxX = Math.max(...selectedWidgets.map((widget) => widget.x + widget.width));
  const maxY = Math.max(...selectedWidgets.map((widget) => widget.y + widget.height));

  const group: GroupWidget = {
    id: crypto.randomUUID(),
    type: 'group',
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    children: selectedWidgets.map((widget) => ({ ...widget, x: widget.x - minX, y: widget.y - minY })),
  };

  setWidgets([...widgets.filter((widget) => !selectedIds.includes(widget.id)), group]);
  setSelectedIds([group.id]);
}
```

Add a "Group" button, calling `handleGroupSelected`, enabled only when
`selectedIds.length > 1`.

Save and reload. Add a few widgets, shift-click to select at least two, click
"Group": they visually combine into one selectable, draggable unit. Drag it: every
widget inside moves together, with no special handling written for that at all.

**Walkthrough:** `Math.min(...selectedWidgets.map((widget) => widget.x))` computes
the smallest `x` among every selected widget's left edge; the equivalent `maxX`
computes the largest *right* edge (`widget.x + widget.width`, not just `widget.x`)
— together, `minX`/`minY`/`maxX`/`maxY` describe the smallest rectangle that fully
contains every selected widget: their **bounding box**. `Math.min(...array)` uses
the spread operator for a third distinct purpose in this project (after copying
arrays and copying objects): `Math.min` and `Math.max` accept any number of
individual number arguments, not an array — spreading `selectedWidgets.map(...)`
unpacks that array into separate arguments, exactly as if each one had been typed
out by hand.

`children: selectedWidgets.map((widget) => ({ ...widget, x: widget.x - minX, y:
widget.y - minY }))` rebases each selected widget's coordinates: a widget whose
absolute canvas position was `x: 150` becomes `x: 150 - minX` — its position
*relative to the new group's own top-left corner*, exactly the representation Step
2 decided on.

The final `setWidgets` call does two things in one immutable update: removes every
now-grouped widget from the top-level list (`widgets.filter((widget) =>
!selectedIds.includes(widget.id))`) and appends the one new `group` in their place
— the children have not disappeared; they have moved from being top-level widgets
to being this one group's `children`.

**SE lens — why dragging needed zero changes.** `updateWidget` operates on whatever
top-level widget matches an `id`, changing whichever fields it is given — it has
never known or cared whether that widget is a rectangle or a group, because
`GroupWidget extends BaseWidget` exactly like everything else. This is the direct
payoff of designing `Widget` as a proper union with a genuinely shared base from
lesson 06, rather than letting each widget type drift into being an unrelated,
incompatible shape.

---

## Connect the Pieces

```
src/App.tsx           selectedIds: string[] (replacing selectedId), handleGroupSelected()
GroupWidget            A new member of the Widget union, containing other Widgets —
                       the project's first real tree
renderWidgetContent    Gains a recursive case: rendering a group means rendering its children
```

---

## What Breaks Without This

**Without relative child coordinates (storing each child's original absolute
canvas position instead):** Dragging a group would need to walk every child and
update its coordinates by the same delta the group itself moved — logic that does
not exist anywhere in `updateWidget`, and would have to be added specifically for
groups, breaking the "every widget type is handled uniformly" property every prior
lesson has maintained.

**Without the recursive call in `case 'group'` (rendering only one level of
children, calling some non-recursive shape-drawing function on each instead):** A
group containing a rectangle and a circle renders correctly. A group containing
another group renders an empty box where the nested group should be — the exact
kind of bug that only appears the first time someone tries the one operation
(grouping an already-grouped selection) recursion was supposed to handle for free.

---

## Definition of Done

- [ ] Shift-clicking multiple widgets selects all of them, visibly
- [ ] "Group" combines the current selection into one widget that moves and drags as a unit
- [ ] A group can itself be added to a new selection and grouped again, nesting correctly
- [ ] The Properties Panel shows a "select a single widget" message when more than one widget is selected
- [ ] You can explain why child coordinates are stored relative to their parent group instead of absolute canvas coordinates
- [ ] You can explain what makes `renderWidgetContent`'s `'group'` case recursive, and why no special handling is needed for nested groups
- [ ] You can explain why dragging a group required no new code
- [ ] Run:
      ```
      git add src/App.tsx
      git commit -m "Add multi-select and grouping; widgets form a real tree, rendered recursively"
      ```

---

*Next: Lesson 09 — Undo and Redo. Every edit so far has been a dead end — there is
no way back. This lesson replaces scattered `setWidgets` calls with a single
reducer managing the entire widget tree and its history, the natural structure for
"what just changed, and can it be reversed."*
