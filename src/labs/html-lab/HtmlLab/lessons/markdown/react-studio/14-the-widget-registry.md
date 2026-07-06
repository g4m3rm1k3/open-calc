# React Studio — Lesson 14 — The Widget Registry

## What You Will Build

A new "Star" widget type, added to this project in exactly one new file — no
existing file touched at all — appears automatically in the toolbar, renders
correctly in the editor and in Preview, and shows up correctly in the Layers Panel.
This lesson does not add a feature a user directly sees; it removes a structural
problem that has been quietly getting worse since lesson 06: every widget type has
required editing the same handful of shared files, every single time.

---

## What You Need to Know First

By lesson 13, adding a widget type meant touching: the `Widget` union, a factory
function, `renderWidgetContent`'s switch, `PreviewWidget`'s switch, `widgetLabel`'s
switch in `LayersPanel`, `PropertiesPanel`'s field logic, and a toolbar button. Five
widget types exist; each one was added in at least five separate places.

---

## Concept: The Open/Closed Principle

A well-known software engineering principle states that code should be **open for
extension, but closed for modification**: adding new behaviour should be possible
without editing code that already works and is already tested. Every widget type
added so far has violated this directly — adding "Star" would mean opening and
editing `renderWidgetContent`, `PreviewWidget`, `widgetLabel`, and more, each of
which already correctly handles five other cases, purely to teach it a sixth. Each
edit is a fresh chance to introduce a typo or forget a spot — the `never`-based
exhaustiveness check from lesson 06 catches *some* of these (a forgotten case in a
`switch`), but not all of them (nothing forces you to remember `widgetLabel`'s
switch exists at all).

A **registry** collects everything a system needs to know about one "kind of thing"
into a single object, keyed by that thing's type, and lets every place that needs
to act on it look the answer up generically — instead of asking "which of these
five hardcoded cases applies," it asks the registry, which needs no editing at all
when a sixth case is added elsewhere.

---

## Step 1 — Define the Shape of a Widget Definition

**The problem:** Every widget type currently has its behaviour scattered across
several unrelated switch statements. Collect it into one place per type.

```tsx
interface WidgetDefinition {
  type: Widget['type'];
  label: string;
  createDefault: (x: number, y: number) => Widget;
  renderEditorContent: (widget: Widget) => ReactNode;
  renderPreviewContent: (widget: Widget) => ReactNode;
  getLayerLabel: (widget: Widget) => string;
}
```

**Walkthrough:** `Widget['type']` reads the `type` field's own type directly out of
the `Widget` union — the same **indexed access type** from lesson 10 — meaning if a
new widget type is ever added to `Widget`, this field's allowed values update
automatically, with no separate edit required here. `WidgetDefinition` groups
exactly the five things this project has needed to know about a widget type, in one
interface: what it is called, how to create a default instance, how to draw it in
the editor, how to draw it in preview, and how to label it in the Layers Panel.

**SE lens — a pragmatic type-safety trade.** Every function here accepts a plain
`Widget`, not the specific member type (`RectangleWidget`, say) it will actually
always be called with. TypeScript cannot verify, from this interface alone, that
`rectangleDefinition.renderEditorContent` is only ever called with an actual
`RectangleWidget` — that guarantee comes from how the registry itself is used
(Step 3), not from the type system directly. A more advanced version of this
interface could close that gap using generics; this project accepts the small,
explained trade-off in exchange for a shape any beginner can read in full at a
glance.

---

## Step 2 — Write One Definition Per Widget Type

**The problem:** Each existing widget type's scattered logic needs to move into one
`WidgetDefinition` object.

```tsx
function PreviewButtonContent({ widget }: { widget: ButtonWidget }) {
  const { increment } = useAppRuntime();
  return (
    <button
      style={{ width: '100%', height: '100%' }}
      onClick={widget.action === 'increment' ? increment : undefined}
    >
      {widget.label}
    </button>
  );
}

const rectangleDefinition: WidgetDefinition = {
  type: 'rectangle',
  label: 'Rectangle',
  createDefault: createRectangleWidget,
  renderEditorContent: (widget) => {
    const rectangle = widget as RectangleWidget;
    return <div style={{ width: '100%', height: '100%', backgroundColor: rectangle.color }} />;
  },
  renderPreviewContent: (widget) => rectangleDefinition.renderEditorContent(widget),
  getLayerLabel: () => 'Rectangle',
};

const buttonDefinition: WidgetDefinition = {
  type: 'button',
  label: 'Button',
  createDefault: createButtonWidget,
  renderEditorContent: (widget) => {
    const button = widget as ButtonWidget;
    return <button style={{ width: '100%', height: '100%' }}>{button.label}</button>;
  },
  renderPreviewContent: (widget) => <PreviewButtonContent widget={widget as ButtonWidget} />,
  getLayerLabel: (widget) => `Button: "${(widget as ButtonWidget).label}"`,
};

// circleDefinition and textDefinition follow the same shape as rectangleDefinition
```

**Walkthrough:** `widget as RectangleWidget` is a **type assertion** — the same
construct lesson 10 used for a `<select>`'s value, here asserting that, at this
exact point in the code, `widget` really is a `RectangleWidget`, even though this
function's own signature only promises a plain `Widget`. This is safe specifically
because of how Step 3 calls these functions — never directly, only ever through the
registry, keyed by the widget's own `type` — but it is worth being honest that
TypeScript is trusting the programmer here, not proving it independently.

`rectangleDefinition.renderEditorContent(widget)` reused directly as
`renderPreviewContent`'s implementation reflects a real fact: a rectangle looks
identical in the editor and in preview — only interactive widgets like `button`
need genuinely different behaviour between the two modes, which is exactly why
`buttonDefinition` is the one definition with two different, real implementations
for those two functions, each doing something meaningfully different (an inert
`<button>` versus one wired to `useAppRuntime()`'s `increment` through a real
nested component, `PreviewButtonContent`, following React's rule that hooks may
only be called inside actual component functions, never inside a plain helper that
merely returns JSX).

---

## Step 3 — Build and Use the Registry

**The problem:** Every place that previously switched on `widget.type` needs to ask
the registry instead.

```tsx
const widgetRegistry: Record<Widget['type'], WidgetDefinition> = {
  rectangle: rectangleDefinition,
  circle: circleDefinition,
  text: textDefinition,
  button: buttonDefinition,
  group: groupDefinition,
};

function getWidgetDefinition(type: Widget['type']): WidgetDefinition {
  return widgetRegistry[type];
}

function renderWidgetContent(widget: Widget): ReactNode {
  return getWidgetDefinition(widget.type).renderEditorContent(widget);
}
```

Update `PreviewWidget` and `widgetLabel` in `LayersPanel` to call
`getWidgetDefinition(widget.type).renderPreviewContent(widget)` and
`getWidgetDefinition(widget.type).getLayerLabel(widget)` respectively, instead of
their own separate switches. Update the toolbar to generate its "Add" buttons
directly from the registry:

```tsx
{Object.values(widgetRegistry)
  .filter((definition) => definition.type !== 'group')
  .map((definition) => (
    <button
      key={definition.type}
      onClick={() => dispatch({ type: 'ADD_WIDGET', widget: definition.createDefault(Math.random() * 500, Math.random() * 400) })}
    >
      Add {definition.label}
    </button>
  ))}
```

**Walkthrough:** `Record<Widget['type'], WidgetDefinition>` is more than
documentation — it is an **enforced exhaustiveness guarantee**, provided by
TypeScript itself, with no manual trick required: a `Record` typed over a union
requires a key for *every* member of that union; omitting `group` from
`widgetRegistry`'s object literal would fail to compile, immediately, at the
declaration itself, before this project ever runs. This achieves the same
guarantee lesson 06's `never`-based exhaustiveness check did for a single `switch`,
now covering every place that reads the registry, automatically, all at once.

The toolbar's `Object.values(widgetRegistry).filter(...).map(...)` means adding a
widget type to `widgetRegistry` automatically gives it a toolbar button — this file
never needs to change again when a new widget type is added, which is Step 4's
actual proof.

---

## Step 4 — Prove It: Add a Star in One New File

**The problem:** Confirm the whole point of this lesson by actually adding a widget
type without editing anything built before this lesson.

Create `src/widgets/star.tsx`:

```tsx
interface StarWidget extends BaseWidget {
  type: 'star';
  color: string;
}

function createStarWidget(x: number, y: number): StarWidget {
  return { id: crypto.randomUUID(), type: 'star', x, y, width: 80, height: 80, color: '#facc15' };
}

const starPoints = '50,3 61,38 98,38 68,59 79,94 50,73 21,94 32,59 2,38 39,38';

export const starDefinition: WidgetDefinition = {
  type: 'star',
  label: 'Star',
  createDefault: createStarWidget,
  renderEditorContent: (widget) => {
    const star = widget as StarWidget;
    return (
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <polygon points={starPoints} fill={star.color} />
      </svg>
    );
  },
  renderPreviewContent: (widget) => starDefinition.renderEditorContent(widget),
  getLayerLabel: () => 'Star',
};
```

Add `StarWidget` to the `Widget` union in `App.tsx`, and add one line to
`widgetRegistry`: `star: starDefinition`. That is the entire change to any existing
file — everything else (the toolbar button, editor rendering, preview rendering,
the layers panel label, the exhaustiveness guarantee) follows automatically from
those two small additions.

**Walkthrough:** `<svg>`, `viewBox`, and `<polygon points="...">` are the browser's
built-in vector graphics primitives — `viewBox="0 0 100 100"` defines an internal
100×100 coordinate space the `<svg>` scales to fit its actual rendered size (`width:
100%; height: 100%` here, matching the widget's own box); `<polygon points="...">`
draws a closed shape by connecting a flat list of `x,y` coordinate pairs in order.
None of this is React-specific — JSX can describe any valid HTML or SVG element,
lowercase exactly as lesson 01 first explained, and the browser renders it exactly
as it would if you had written it as plain markup.

---

## Concept: Where `React.lazy` Would Go From Here

Every widget definition in this project is small — a plugin architecture at a
larger scale would want to avoid downloading *every* widget type's code up front,
the same reasoning [Frontend Client](../frontend-client/README.md)'s final lesson
used to split rarely-visited routes out of its main bundle. `React.lazy(() =>
import('./widgets/star.tsx'))`, combined with `<Suspense>` to show a fallback while
that specific widget's code downloads, would let a widget type's definition load
only the first time it is actually used — a real, direct extension of this exact
registry, not a different architecture. It is not built here because every widget
type in this project is small enough that the cost of including all of them upfront
is not yet a real, measurable problem — the same "measure before optimising"
discipline lesson 12 already established.

---

## Connect the Pieces

```
src/App.tsx              WidgetDefinition, widgetRegistry, getWidgetDefinition() —
                          one lookup replacing five separate switch statements
src/widgets/star.tsx      A complete new widget type, in one new file, touching
                          nothing that existed before this lesson
```

---

## What Breaks Without This

**Forgetting to add a new type to `widgetRegistry` (only adding it to the `Widget`
union):** This does not compile — `Record<Widget['type'], WidgetDefinition>`
requires every key, and TypeScript reports exactly which one is missing, at the
exact declaration, before the project can even build.

**Without the registry (continuing to add each new type across five separate
switches, as before):** Nothing is technically broken by staying with switches —
this project would still work. What degrades is the actual cost of lesson 15's
kind of change: a sixth widget type touching five files instead of one is not a
correctness bug, but it is exactly the kind of accumulating friction the open/closed
principle exists to prevent, made concrete rather than abstract by having now felt
both versions directly.

---

## Definition of Done

- [ ] Every existing widget type's behaviour lives in one `WidgetDefinition` object
- [ ] `renderWidgetContent`, `PreviewWidget`, `widgetLabel`, and the toolbar all read from `widgetRegistry` instead of their own switches
- [ ] A new "Star" widget type was added in one new file, with only two small additions to `App.tsx` (the union member and one registry entry)
- [ ] `widgetRegistry`'s type (`Record<Widget['type'], WidgetDefinition>`) fails to compile if any widget type is missing
- [ ] You can explain the open/closed principle, using this lesson's before-and-after as the example
- [ ] You can explain why `Record<Widget['type'], WidgetDefinition>` provides an exhaustiveness guarantee without a `never` check
- [ ] You can explain why `PreviewButtonContent` had to be a real component rather than a plain function returning JSX
- [ ] Run:
      ```
      git add src/App.tsx src/widgets/star.tsx
      git commit -m "Replace scattered per-type switches with a widget registry; add Star as proof"
      ```

---

*Next: Lesson 15 — Shortcuts and Shipping. Delete, copy, and paste work from the
keyboard, wired through the same global-listener pattern dragging already
established — and the project goes live at a real, public URL.*
