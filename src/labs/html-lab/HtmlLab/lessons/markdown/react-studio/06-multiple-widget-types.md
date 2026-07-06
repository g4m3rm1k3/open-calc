# React Studio — Lesson 06 — Multiple Widget Types

## What You Will Build

"Add Text" and "Add Circle" buttons join "Add Rectangle." Each produces a genuinely
different kind of widget — one shows arbitrary text, one is round — all selectable,
draggable, and editable in the Properties Panel exactly like a rectangle already is.
A builder with exactly one widget type is not a builder; this lesson is what turns
it into one.

---

## What You Need to Know First

Lesson 05 left `Widget` as a single flat interface (`id`, `x`, `y`, `width`,
`height`, `color`), rendered by one `Rectangle` component, updated through the
shared `updateWidget(id, updates)` function.

---

## Concept: Widgets Are Not All the Same Shape of Data

A rectangle's defining visual property is a fill colour. A text widget's is its
actual text and font size. A circle happens to reuse "colour," but is visually
distinct from a rectangle in a way that cannot be expressed by any combination of
the fields `Widget` currently has. Continuing to force every widget into one flat
interface would mean either giving every widget every field any widget type might
ever need (`text?: string`, `fontSize?: number`, all optional, most of them
meaningless for a rectangle) or accepting that some fields silently do not apply
depending on other fields — both are ways of hiding a real distinction the type
system should be expressing directly instead.

---

## Step 1 — Model Widgets as a Discriminated Union

**The problem:** `Widget` needs to describe several genuinely different shapes of
data, while still letting code that only cares about shared fields (`id`, `x`, `y`,
dragging, selection) work uniformly across all of them.

```tsx
interface BaseWidget {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface RectangleWidget extends BaseWidget {
  type: 'rectangle';
  color: string;
}

interface CircleWidget extends BaseWidget {
  type: 'circle';
  color: string;
}

interface TextWidget extends BaseWidget {
  type: 'text';
  text: string;
  fontSize: number;
}

type Widget = RectangleWidget | CircleWidget | TextWidget;
```

**Walkthrough:** `BaseWidget` factors out the five fields every widget genuinely
shares — position, size, and identity — using `extends` the same way
[Frontend Client](../frontend-client/README.md)'s `ArticleDetail` reused `Article`:
"has everything the base has, plus more." `type: 'rectangle'` is a **string literal
type** — not just any `string`, but specifically and only the exact text
`'rectangle'` — nothing else is assignable to it. `Widget = RectangleWidget |
CircleWidget | TextWidget` is a **discriminated union**, the same construct
[Frontend Client](../frontend-client/README.md) used for its `Route` type: a value
that is always exactly one of several distinct shapes, distinguishable at runtime by
checking one shared field — here, `type` — which is why it is called the
**discriminant**.

---

## Step 2 — Render Based on Type

**The problem:** One component needs to draw a rectangle, a circle, or a block of
text, correctly, based entirely on which member of the union it was actually given.

Replace `Rectangle` with a component that handles shared behaviour (position,
selection, dragging) uniformly, and delegates only the *visual content* to a
type-specific switch:

```tsx
interface WidgetViewProps {
  widget: Widget;
  isSelected: boolean;
  onSelect: () => void;
  onDragStart: (widget: Widget, event: React.MouseEvent) => void;
}

function WidgetView({ widget, isSelected, onSelect, onDragStart }: WidgetViewProps) {
  return (
    <div
      onMouseDown={(event) => onDragStart(widget, event)}
      onClick={(event) => {
        event.stopPropagation();
        onSelect();
      }}
      style={{
        position: 'absolute',
        left: widget.x,
        top: widget.y,
        width: widget.width,
        height: widget.height,
        outline: isSelected ? '2px solid #2563eb' : 'none',
        outlineOffset: 2,
      }}
    >
      {renderWidgetContent(widget)}
    </div>
  );
}

function renderWidgetContent(widget: Widget) {
  switch (widget.type) {
    case 'rectangle':
      return <div style={{ width: '100%', height: '100%', backgroundColor: widget.color }} />;
    case 'circle':
      return <div style={{ width: '100%', height: '100%', backgroundColor: widget.color, borderRadius: '50%' }} />;
    case 'text':
      return (
        <div style={{ width: '100%', height: '100%', fontSize: widget.fontSize, overflow: 'hidden' }}>
          {widget.text}
        </div>
      );
    default: {
      const exhaustiveCheck: never = widget;
      return exhaustiveCheck;
    }
  }
}
```

Update every place that referenced `<Rectangle ... />` to use `<WidgetView widget={widget} ... />`
instead.

**Walkthrough:** `WidgetView` owns exactly the things every widget type needs
identically — position, the selection outline, responding to a mouse-down to start
a drag — and calls `renderWidgetContent(widget)` for the one thing that genuinely
differs. This is **composition**, the same idea
[Frontend Client](../frontend-client/README.md) used when `ArticleCard` composed
`AuthorByline` and `TagList`: a larger piece of UI built from a fixed, shared shell
plus a smaller, varying part, rather than three entirely separate, duplicated
components each re-implementing selection and dragging from scratch.

`switch (widget.type) { case 'rectangle': ... }` is a **type guard** at scale: inside
each `case`, TypeScript narrows `widget`'s type to exactly that one member of the
union — inside `case 'rectangle':`, `widget.color` compiles because TypeScript knows,
from the `case` alone, that `widget` must be a `RectangleWidget` at that point;
inside `case 'text':`, `widget.color` would *not* compile, because a `TextWidget`
has no such field, and TypeScript is tracking that precisely, one `case` at a time.

**CS lens — the exhaustiveness check.** `const exhaustiveCheck: never = widget;`
inside `default` is a deliberate trick: `never` is a TypeScript type meaning "a value
that can never actually occur." If every `case` above has correctly handled every
member of the `Widget` union, TypeScript proves that by the time execution reaches
`default`, `widget`'s type has been narrowed down to nothing at all — which is
exactly what `never` means, and exactly what makes assigning it to a `never`-typed
variable compile. The payoff arrives the *next* time a widget type is added (lesson
14 adds several): forgetting to add a matching `case` here means `widget`'s
remaining, unhandled type inside `default` is no longer `never` — it is whatever new
type was left out — and TypeScript refuses to compile the assignment, pointing
directly at this exact function. This turns "I forgot to handle a case" from a
silent, only-discoverable-by-testing runtime gap into a compiler error, the moment
it happens, at the exact place that needs fixing.

---

## Step 3 — Add Factories and Buttons for Each Type

**The problem:** Only rectangles can currently be created.

```tsx
function createRectangleWidget(x: number, y: number): RectangleWidget {
  return {
    id: crypto.randomUUID(),
    type: 'rectangle',
    x,
    y,
    width: 120,
    height: 80,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
  };
}

function createCircleWidget(x: number, y: number): CircleWidget {
  return {
    id: crypto.randomUUID(),
    type: 'circle',
    x,
    y,
    width: 100,
    height: 100,
    color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
  };
}

function createTextWidget(x: number, y: number): TextWidget {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    x,
    y,
    width: 160,
    height: 40,
    text: 'Text',
    fontSize: 16,
  };
}
```

Add two more buttons beside "Add Rectangle," each calling `setWidgets([...widgets,
createCircleWidget(...)])` or the text equivalent, following the exact pattern
`handleAddWidget` already established in lesson 02.

Update `PropertiesPanel` to only show the `color` field when `widget.type !==
'text'`, and show a `text` field only when `widget.type === 'text'` — the panel now
needs the same `switch`-based (or `if`-based) type narrowing `renderWidgetContent`
already uses, for the same reason: not every field exists on every widget.

Save and reload. All three buttons work; every widget type can be selected, dragged,
and resized identically, and the panel shows only the fields that are actually real
for whichever type is currently selected.

---

## Connect the Pieces

```
src/App.tsx          Widget is now a discriminated union of three shapes
WidgetView            Shared shell (position, selection, drag) for every widget type
renderWidgetContent   The one place that switches on type — with a compiler-enforced
                       guarantee that every member of the union is handled
PropertiesPanel        Now narrows on widget.type before rendering type-specific fields
```

Dragging and `updateWidget`, both from lessons 04–05, needed no changes at all —
they only ever touched `x`, `y`, `width`, and `height`, which every widget type has,
by construction, via `BaseWidget`.

---

## What Breaks Without This

**Without the exhaustiveness check (a plain `default: return null;` instead):**
Lesson 14 adds a new widget type and forgets to add a matching `case` here. Nothing
fails to compile. The new widget type renders as nothing at all — an invisible,
correctly-positioned, selectable, draggable empty box — and the only way to notice
is to actually create one and see nothing appear, rather than being told, in the
editor, at the exact line responsible, the moment the new type was added.

**Without narrowing in `renderWidgetContent` (accessing `widget.color` unconditionally,
outside any `case`):** This does not compile at all — TypeScript correctly refuses
to let you read `.color` on a value that might, per its own declared type, be a
`TextWidget` with no such field. This is the type system doing exactly its job:
turning "this will crash for text widgets, sometimes, at runtime" into "this cannot
be built until you handle every case."

---

## Definition of Done

- [ ] "Add Rectangle," "Add Circle," and "Add Text" all work and produce visibly distinct widgets
- [ ] Every widget type can be selected, dragged, and resized identically
- [ ] The Properties Panel shows only fields that are real for the selected widget's type
- [ ] `renderWidgetContent` includes the `never`-based exhaustiveness check in its `default` case
- [ ] You can explain what a discriminated union is and what `type` acts as in this one
- [ ] You can explain how a `switch` on `widget.type` narrows `widget`'s type inside each `case`
- [ ] You can explain what the `never` exhaustiveness check catches, and when it would actually fire
- [ ] Run:
      ```
      git add src/App.tsx
      git commit -m "Model widgets as a discriminated union; add circle and text types"
      ```

---

*Next: Lesson 07 — The Layers Panel. A list of every widget, by name, appears beside
the canvas. Clicking a layer selects the matching widget on the canvas — and
clicking a widget on the canvas highlights the matching layer. The same
`selectedId`, now serving three components instead of two.*
