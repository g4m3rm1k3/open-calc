# Lesson 4 — Text Boxes, and a Canvas That Doesn't Play by React's Rules

## What You Will Build

A "Text" tool that drops a `fabric.Textbox` — a note box with a fixed
width that wraps its own text, unlike the auto-widening `IText` this app
already uses elsewhere — plus a small formatting toolbar (Bold, Italic,
color, size) that appears whenever a text box is selected. Getting the
toolbar to render at all surfaces something that has nothing to do with
text formatting: fabric.js quietly reorganizes the DOM around the
`<canvas>` element the moment it initializes, and React's reconciler
doesn't know that happened.

## What You Need to Know First

`canvas-notes-lab/01-...md`, `02-...md`, `03-...md` — assumed fresh:
the data model, `PageCanvas`'s effects, and the tool-switching pattern
this lesson extends with a fifth tool. `svg-studio/SvgStudioPage.jsx`'s
use of `fabric.IText` — assumed fresh (already established there); this
lesson does not re-teach what `IText` is, only what's different about
`Textbox`.

---

## The Lesson

### Where You're Working

One new file, two modified files: `TextFormatToolbar.jsx` (new — pure
UI, reports formatting choices upward, touches no fabric object
directly), `PageCanvas.jsx` (modified — a new tool branch for `text`,
selection tracking, and the style-application logic), and
`DrawToolbar.jsx` (modified — one new tool button).

### Concept Unit: A Box That Wraps, Instead of Text That Grows Sideways

#### The Problem

`SvgStudioPage.jsx` places text with `fabric.IText` — type as much as
you want, and the object just gets wider, one line, forever. That's
fine for a label on a diagram. It's wrong for a note: a paragraph
dropped onto a notebook page needs to wrap at some width and grow
*downward*, the way a real sticky note or a word processor's text box
does, not stretch off the edge of the page.

#### Introduce the Concept in Isolation

fabric's own doc comment on the class states the difference directly
(read from the installed package, not assumed from memory):

```
Textbox class, based on IText, allows the user to resize the text rectangle
and wraps lines automatically. Textboxes have a single font style, and
handle the pointer events differently from a normal text object, because
clicking on a text character will not modify the current selection. Instead,
the user has to click and drag a corner of the textbox to resize it.
The user can only change width. Height is adjusted automatically based on
the wrapping of lines.
```

**What this proves:** the fixed dimension flips from "neither, text
just grows" (`IText`) to "width only, height follows the wrap"
(`Textbox`) — a deliberate, documented design difference between the
two classes, not a bug in one or an oversight in the other. Each is
correct for what it's for.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/PageCanvas.jsx`
- **Change type:** add (new branch inside the existing tool-mouse-down handler from Lesson 3)
- **Dependencies:** Lesson 3's tool effect and its `onMouseDown` handler

#### The New Code

```js
if (tool === 'text' && !opt.target) {
  const p = canvas.getScenePoint(opt.e)
  const box = new fabric.Textbox('Type here', {
    left: p.x,
    top: p.y,
    width: 220,
    fontSize: 18,
    fill: strokeColor,
  })
  canvas.add(box)
  canvas.setActiveObject(box)
  box.enterEditing()
  canvas.requestRenderAll()
  onTextPlaced()
}
```

#### The Updated Project

```jsx
const onMouseDown = (opt) => {
  if (tool === 'eraser' && opt.target) {
    canvas.remove(opt.target)
    canvas.requestRenderAll()
  }
  if (tool === 'text' && !opt.target) {
    const p = canvas.getScenePoint(opt.e)
    // Textbox, not IText: a note box wraps to a fixed width instead of
    // growing sideways forever as the user types.
    const box = new fabric.Textbox('Type here', {
      left: p.x,
      top: p.y,
      width: 220,
      fontSize: 18,
      fill: strokeColor,
    })
    canvas.add(box)
    canvas.setActiveObject(box)
    box.enterEditing()
    canvas.requestRenderAll()
    onTextPlaced()
  }
}
```

`onTextPlaced` is a new prop (`CanvasNotesPage` passes
`() => setTool('select')`), mirroring `SvgStudioPage.jsx`'s own
`setTool("select")` right after placing an `IText` — established
behavior, applied to a new tool.

#### Mechanical Walkthrough
`!opt.target` guards against placing a new text box on top of an
existing object — a text-tool click only creates something on genuinely
empty canvas, the same guarding style Lesson 3's eraser branch uses in
reverse (`&& opt.target`, requiring a hit; this requires a miss).
`width: 220` is the one dimension `Textbox` actually honors at creation
— fontSize and everything about how many lines the string becomes is
- computed *from* that width, not set directly.
- `box.enterEditing()` —
established (`IText`'s own method, inherited by `Textbox` since it
- extends `IText`) — immediately opens the text cursor so a user can
start typing without a second click.

#### CS Lens

Fixed-width-reflow-to-height versus grow-in-one-direction is the same
tradeoff as CSS's `width: auto` inline content versus a `width`-
constrained block element that wraps: one dimension is authoritative,
the other is derived from laying out content against it. **Recognized
in:** a terminal window (fixed columns, wrapping or scrolling text
vertically); a text input `<textarea>` versus a single-line `<input>`;
a printed page's column width, with line count following from it.

#### SE Lens

`IText` remains the right choice anywhere text is a short label glued
to a shape (already how `SvgStudioPage.jsx` uses it). `Textbox` costs
one more property to think about at creation time (`width`) and is
wrong for the same short-label case — a one-word label in a 220px-wide
box wastes most of the box. Picking per-feature rather than
standardizing on one for the whole app is deliberate: a notebook's text
boxes and a diagram's shape labels are genuinely different use cases,
and forcing one class to serve both would mean fighting its layout
behavior in one of the two.

#### Connect to What Came Before

Lesson 3 gave the tool effect's `onMouseDown` its first per-tool
branch (Eraser). This unit adds a second branch to that same handler —
the pattern (check `tool`, check `opt.target`, act on the canvas) is
now established as how every new tool gets added here going forward.

---

### Concept Unit: The Canvas That Moves Itself Behind React's Back

#### The Problem

The format toolbar needs to appear only when a text box is selected —
a plain conditional render, `{selectedText && <TextFormatToolbar />}`,
sitting right next to the `<canvas>` in the same returned JSX. The
first version of this code did exactly that and crashed the moment a
text box was placed.

#### Introduce the Concept in Isolation

Run against the real app (not a simulation): place a `Textbox`, which
immediately auto-selects itself and triggers the toolbar to mount as a
new sibling of `<canvas>` inside the same wrapping `<div>`:

```jsx
// ORIGINAL (buggy) structure:
return (
  <div>
    {selectedText && <TextFormatToolbar ... />}
    <canvas ref={canvasElRef} />
  </div>
)
```

Real browser console output (this session):
```
Failed to execute 'insertBefore' on 'Node': The node before which the
new node is to be inserted is not a child of this node.

The above error occurred in the <TextFormatToolbar> component:
    at TextFormatToolbar (.../TextFormatToolbar.jsx:18:45)
    at div
    at PageCanvas (.../PageCanvas.jsx:30:38)
    ...
[Canvas Notes] render error: NotFoundError: Failed to execute
'insertBefore' on 'Node' ...
```

The entire lab crashed to its error boundary. The cause: the instant
`new fabric.Canvas(canvasElRef.current, ...)` runs (Lesson 2's mount
effect), fabric **moves** that exact `<canvas>` DOM node into a new
wrapper `<div>` it creates and controls itself, replacing the canvas
in-place in the DOM tree fabric was handed. React's virtual DOM has no
idea this happened — it still believes `<canvas>` is a direct child of
`PageCanvas`'s outer `<div>`, sitting right where React itself put it.
The first time React needs to insert or remove *another* child of that
same outer `<div>` (the conditionally-rendered toolbar), it tries to
position the new node relative to the `<canvas>` reference it
remembers — a reference that is no longer where React thinks it is,
because fabric already relocated it one level deeper.

The fix: never let React conditionally mount or unmount anything
*inside the same parent* that directly contains the raw `<canvas>`
element. Give the canvas its own dedicated wrapper, and put every
other sibling (including anything conditionally rendered) one level up,
outside that wrapper:

```jsx
// FIXED structure:
return (
  <div>
    {selectedText && <TextFormatToolbar ... />}
    <div>
      <canvas ref={canvasElRef} />
    </div>
  </div>
)
```

Real output after the fix: placing a text box, typing into it,
deselecting, and reselecting produced zero crashes, with the toolbar
correctly appearing and disappearing (verified directly against
`canvas.getActiveObject()` — `'textbox'` while selected, `null` after
deselecting — not just DOM inspection, since an unrelated CSS class
collision elsewhere in the app briefly gave a false read during this
same verification pass).

**What this proves:** a library that takes ownership of a DOM node
handed to it by React (fabric, but the same is true of many
canvas/map/editor libraries) can silently violate React's assumption
that it alone controls a parent's children. Isolating that node inside
a wrapper React never adds other managed siblings to contains the
damage to a subtree neither side needs to agree about.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/PageCanvas.jsx`
- **Change type:** fix (wraps the existing `<canvas>` element)
- **Dependencies:** none — structural only

#### The New Code

```jsx
<div>
  <canvas
    ref={canvasElRef}
    className="border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
  />
</div>
```

#### The Updated Project

```jsx
return (
  <div>
    {selectedText && (
      <TextFormatToolbar
        onToggleBold={toggleBold}
        onToggleItalic={toggleItalic}
        onChangeColor={(color) => applyTextStyle({ fill: color })}
        onChangeSize={(size) => applyTextStyle({ fontSize: size })}
      />
    )}
    <div>
      <canvas
        ref={canvasElRef}
        className="border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
      />
    </div>
  </div>
)
```

#### Mechanical Walkthrough
The outer `<div>` is where React's reconciler adds and removes
- `TextFormatToolbar` — its sibling, the inner `<div>`, is a stable node
that never gets added or removed itself, only its *contents* get
silently rearranged by fabric. The inner `<div>` exists for exactly one
reason: to be the thing fabric is allowed to make a mess inside of,
without that mess ever being adjacent to something React also needs to
reconcile.

#### CS Lens

This is a boundary problem: two systems (React's virtual DOM, fabric's
direct DOM manipulation) both believe they own the same region of the
real DOM tree, and neither is wrong exactly — they just weren't
designed to share. **Recognized in:** any "escape hatch" integration
between a declarative framework and an imperative library operating on
the same underlying resource — a mapping library (Leaflet, Mapbox)
handed a React-rendered `<div>` and then populating it with its own
markers and layers; a rich-text editor library (as later needed for
markdown text boxes in the next lesson) that manages its own
`contenteditable` subtree; even two threads writing to the same shared
memory region without a lock, in miniature — the fix in all these
cases is the same shape: give the foreign system an isolated region it
fully owns, and never let your own system's bookkeeping reach inside it.

#### SE Lens

The alternative to isolating fabric's node in a dedicated wrapper would
be moving the format toolbar somewhere else in the tree entirely (for
example, up in `CanvasNotesPage`, as a sibling of `PageCanvas` rather
than inside it) — this also avoids the crash, since it's no longer a
child of the same div. It was rejected here because it would require
lifting `selectedText` and the style-application logic out of
`PageCanvas` and into the parent, breaking the encapsulation
established back in Lesson 2 ("the component that owns the canvas is
the only one that needs to know how to save and load it," now extended
to "...and the only one that needs to know how to format it"). Wrapping
the canvas in its own dedicated div is a smaller, purely structural
fix that keeps all fabric-touching logic inside the one component that
already owns the fabric instance.

#### Connect to What Came Before

Every earlier lesson in this series treated `fabricRef.current` as a
black box you call methods on (`toDatalessJSON`, `loadFromJSON`,
`add`, `remove`). This unit is the first time this series has had to
reason about *how* fabric actually attaches itself to the page, because
it's the first time something else — a conditionally-rendered React
sibling — needed to coexist with it in the same part of the DOM tree.

---

## Connect the Pieces

Clicking the Text tool button (`DrawToolbar`, this lesson) sets `tool`
to `'text'`; the next click on empty canvas runs the new branch inside
`PageCanvas`'s existing tool-mouse-down handler (first unit), placing a
`fabric.Textbox` and immediately entering edit mode. Selecting that
box — automatic on creation, or later by clicking it with the Select
- tool — fires fabric's `selection:created`/`updated` events, which
`PageCanvas` was already listening for (added this lesson) to decide
whether to show `TextFormatToolbar`. That toolbar, and the canvas
itself, now live in a DOM structure (second unit) where React can
freely mount and unmount the toolbar without ever touching the subtree
fabric has already claimed for itself. Clicking Bold, Italic, a color
swatch, or a size option calls `applyTextStyle`, which reads the text
box's current selection range (or the whole string, if nothing is
- highlighted) and calls fabric's `setSelectionStyles` — the same
per-character styling mechanism a real word processor uses, applied
here for the first time in this codebase.

## What Breaks Without This

Verified live, this session, twice over: reverting the DOM structure
fix reproduces the exact `insertBefore` crash from the second unit the
instant a text box is placed — the entire lab falls back to its error
boundary, and every other tool (pen, marker, eraser) becomes
unreachable until the page is reloaded. Separately, reverting
`o.evented = tool === 'select' || tool === 'eraser'` back to Lesson
- 2's version (dropping the `|| tool === 'eraser'`) — unrelated to this
lesson, but re-checked here since this lesson also touches that same
line's neighborhood — was re-confirmed still necessary; Eraser's click
detection depends on it exactly as Lesson 3 established.

## Exercises

- Click the Text tool, place a box, but click on top of the pen stroke
  from Lesson 3 instead of empty canvas. Confirm no text box is
  created (the `!opt.target` guard), and explain what the user would
  need to do instead to add a note near existing ink.
- Deliberately remove the inner wrapper `<div>` around `<canvas>` again
  and reproduce the crash on purpose, reading the full stack trace
  this time — identify the exact React internal function
  (`insertOrAppendPlacementNode`) that fails, and explain in your own
  words what it was trying to do.

## Definition of Done

- [ ] A "Text" tool creates a `fabric.Textbox` (not `IText`) with a
      fixed width, entering edit mode immediately, then resets the
      active tool to Select
- [ ] `TextFormatToolbar` appears only while a `Textbox` is the active
      object, and applies Bold/Italic/color/size via
      `setSelectionStyles` to the highlighted range (or the whole text,
      if nothing is highlighted)
- [ ] `<canvas>` is wrapped in its own dedicated `<div>` with no other
      conditionally-rendered React siblings inside that same div
- [ ] Verified live, this session: placing text, typing, deselecting,
      and reselecting produces zero crashes and correctly shows/hides
      the format toolbar; toggling Bold actually changes the fabric
      object's `fontWeight` (confirmed via direct inspection, not just
      visual appearance)
- [ ] You reproduced the `insertBefore` crash on purpose and can
      explain why it happens in terms of fabric relocating the canvas
      node behind React's back
- [ ] You can state, without notes, the one structural rule this bug
      teaches: never let React conditionally mount/unmount something
      inside the same parent that directly wraps a node an imperative
      library has taken ownership of
- [ ] `git commit` with a message explaining why — for example: "Add
      Textbox-based text boxes with a Bold/Italic/color/size toolbar —
      wraps <canvas> in its own dedicated div after discovering fabric
      relocates that node on init, which crashed React's reconciler
      the moment a conditional sibling (the format toolbar) needed to
      mount next to it"
