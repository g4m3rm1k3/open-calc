# Lesson 3 — Pen, Marker, and an Eraser With No Eraser Brush

## What You Will Build

A page is only useful once you can actually draw on it. This lesson adds
a small toolbar — `DrawToolbar.jsx` — with four tools (Select, Pen,
Marker, Eraser), a color swatch row, and a stroke-width slider, and wires
them into `PageCanvas.jsx` so each tool changes how the shared canvas
responds to the mouse. Pen and Marker both draw freehand strokes; Marker
is not a different brush, just the same one drawn translucent and
thicker. Eraser has no brush at all — fabric 7.4.0 ships no
`EraserBrush`, so "erasing" here means deleting whichever object a click
lands on.

## What You Need to Know First

`canvas-notes-lab/01-...md` and `02-...md` — assumed fresh: the
section/page data model, and `PageCanvas`'s two effects (mount-once,
swap-on-`pageId`). `useeffect-and-useref-fundamentals/01-...md` —
assumed fresh: effects re-running when their dependency array changes.
Both reappear below, extended rather than re-explained.

---

## The Lesson

### Where You're Working

One new file, two modified files: `src/labs/canvas-notes/DrawToolbar.jsx`
(new — the toolbar UI, no fabric code at all, just buttons and inputs
that report choices upward), `PageCanvas.jsx` (modified — a third effect
reacting to the active tool, plus the color/width props needed to
configure it), and `CanvasNotesPage.jsx` (modified — owns `tool`,
`strokeColor`, `strokeWidth` state and passes it to both children).
`svg-studio/SvgStudioPage.jsx` is read as reference again, not modified
— its `PencilBrush` setup and per-tool mouse handlers are the pattern
this lesson adapts, not something built from scratch.

### Concept Unit: A Highlighter Is a Pen With Different Paint, Not a Different Tool

#### The Problem

fabric's `PencilBrush` draws one continuous stroke of a single solid
color. A highlighter, though, needs to look like it's tinting whatever
is underneath rather than covering it — two highlighter strokes that
cross should visibly darken where they overlap, the way real ink does
on paper. fabric has exactly one freehand brush class in its core
exports; there's no separate "highlighter" brush to reach for.

#### Introduce the Concept in Isolation

```js
function hexToRgba(hex, alpha) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

console.log('Pen color (opaque, used as-is):', '#e24b4a')
console.log('Marker color (same hex, translucent):', hexToRgba('#e24b4a', 0.35))
```

Run, real output:
```
Pen color (opaque, used as-is): #e24b4a
Marker color (same hex, translucent): rgba(226, 75, 74, 0.35)
```

**What this proves:** the marker's color is derived from the exact same
hex value the user picked for the pen — nothing about the *tool* stores
a separate color. `hexToRgba` peels the hex string apart into red,
green, and blue channels with bit-shifting (`>> 16`, `>> 8`) and masking
(`& 255`), then hands fabric a CSS `rgba(...)` string instead of a hex
string. `PencilBrush.color` accepts either format — fabric passes it
straight through to the canvas 2D context's `strokeStyle`, which is
what actually understands alpha transparency.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/PageCanvas.jsx`
- **Change type:** add (new effect + helper function)
- **Dependencies:** the canvas instance from Lesson 2's mount effect

#### The New Code

```js
function hexToRgba(hex, alpha) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// inside the component, a new effect:
useEffect(() => {
  const canvas = fabricRef.current
  if (!canvas) return

  canvas.isDrawingMode = tool === 'pen' || tool === 'marker'
  if (tool === 'pen') {
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
    canvas.freeDrawingBrush.color = strokeColor
    canvas.freeDrawingBrush.width = strokeWidth
  } else if (tool === 'marker') {
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
    canvas.freeDrawingBrush.color = hexToRgba(strokeColor, 0.35)
    canvas.freeDrawingBrush.width = strokeWidth * 3
    canvas.freeDrawingBrush.strokeLineCap = 'butt'
  }
}, [tool, strokeColor, strokeWidth])
```

#### The Updated Project

```jsx
import { useEffect, useRef } from 'react'
import * as fabric from 'fabric'

const CANVAS_W = 800
const CANVAS_H = 600

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.replace('#', ''), 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export default function PageCanvas({ pageId, initialJSON, onLeavePage, tool, strokeColor, strokeWidth }) {
  const canvasElRef = useRef(null)
  const fabricRef = useRef(null)
  const prevPageIdRef = useRef(pageId)

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: '#ffffff',
    })
    fabricRef.current = canvas
    return () => canvas.dispose()
  }, [])

  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return
    if (prevPageIdRef.current !== pageId) {
      onLeavePage(prevPageIdRef.current, canvas.toDatalessJSON())
    }
    canvas.clear()
    if (initialJSON) {
      canvas.loadFromJSON(initialJSON).then(() => canvas.requestRenderAll())
    } else {
      canvas.backgroundColor = '#ffffff'
      canvas.requestRenderAll()
    }
    prevPageIdRef.current = pageId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  // Apply the active tool. Pen and marker both draw via fabric's built-in
  // freehand brush — marker is a PencilBrush with a translucent color and a
  // flat cap, not a different brush class. Eraser has no brush at all: it
  // deletes whichever object the click landed on (next unit).
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    canvas.isDrawingMode = tool === 'pen' || tool === 'marker'
    if (tool === 'pen') {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.color = strokeColor
      canvas.freeDrawingBrush.width = strokeWidth
    } else if (tool === 'marker') {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.color = hexToRgba(strokeColor, 0.35)
      canvas.freeDrawingBrush.width = strokeWidth * 3
      canvas.freeDrawingBrush.strokeLineCap = 'butt'
    }

    canvas.selection = tool === 'select'
    canvas.getObjects().forEach((o) => {
      o.selectable = tool === 'select'
      o.evented = tool === 'select' || tool === 'eraser'
    })
    // eraser's mouse:down handler is added in the next unit
  }, [tool, strokeColor, strokeWidth])

  return (
    <canvas
      ref={canvasElRef}
      className="border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
    />
  )
}
```

#### Mechanical Walkthrough
`n >> 16` shifts the 24-bit RGB integer right by 16 bits, leaving only
the red byte in the low position; `& 255` masks off everything above
the lowest 8 bits, isolating exactly that byte — the same two-operator
pattern repeats at `>> 8` for green and with no shift at all for blue
(already in the lowest byte). `canvas.isDrawingMode = tool === 'pen' ||
- tool === 'marker'` — a boolean expression assigned directly, no `if`
needed, since both branches want the same fabric-level flag turned on.
`canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)` is
re-created on every effect run rather than reused and mutated — cheap
to construct, and guarantees no stale brush settings survive a tool or
color change. The effect depends on `[tool, strokeColor, strokeWidth]`
— any of the three changing re-runs it, exactly matching what each
branch actually reads.

#### CS Lens

Deriving the marker's appearance entirely from the pen's own
color/width state, rather than giving Marker its own independent
color/width fields, is choosing composition over duplication — one
source of truth transformed on the way out, instead of two copies of
the same data that could drift apart. **Recognized in:** a
"grayscale preview" image filter computed from the same RGB pixels as
the color original, not stored as a second separate image; a UI
dark-theme computed by transforming light-theme color tokens
(desaturate/invert) rather than hand-authoring a fully independent
palette that must be kept in sync by hand forever after.

#### SE Lens

The alternative — giving each tool (Pen, Marker) its own independent
- `toolColor`/`toolWidth` state — would let a user set the marker to a
totally different color than the pen without having to re-pick it
every time they switch tools, a real usability upside. It was rejected
here for a smaller feature surface: one color/width picker, shared by
every tool, is simpler to build and explain in this increment, at the
cost of the marker always tracking whatever color was last chosen for
anything. Revisiting this — per-tool color memory — is a reasonable
follow-up once real usage shows people want it, not a decision to
over-build now on a guess.

#### Connect to What Came Before

Lesson 2's mount effect created the one canvas instance this effect
- reaches into via `fabricRef.current` — this unit is the first code to
actually configure that canvas for something a user does with the
mouse, rather than just loading and saving its contents.

---

### Concept Unit: Erasing Without an Eraser Brush

#### The Problem

fabric 7.4.0's core package exports no `EraserBrush` — that used to
exist as a separate community plugin for older fabric versions, and
isn't part of what's installed here. "Erase" still has to mean
*something* concrete. The simplest honest option: clicking an object
with the Eraser tool active removes that whole object, using the exact
same `target` fabric already resolves for every mouse event — no new
hit-testing code required.

#### Introduce the Concept in Isolation

Run against the real running app (Playwright driving an actual browser,
not a mock), comparing canvas pixels before and after each action —
proof the click either did or didn't change anything, without needing
to reach into fabric's internal object list:

```js
// Pen stroke drawn, then a Marker stroke drawn elsewhere on the canvas.
// Switch to Eraser, click on the PEN stroke's bounding-box midpoint:
await page.mouse.click(box.x + 100, box.y + 85)
```

Real output (this session):
```
Pen stroke changed pixels: true
Marker stroke changed pixels further: true
Erase click changed pixels (something got removed): true
```

And, run separately, clicking Eraser somewhere with nothing under the
cursor:
```
Eraser click on EMPTY space changed nothing (expected true): true
```

**What this proves:** the eraser only acts when the click actually
lands on an object — fabric's own `mouse:down` event already carries a
`target` field naming whichever object (if any) is directly under the
pointer, the same mechanism the Select tool uses to decide what to
select. Reusing that field for Eraser means zero new geometry or
hit-testing code — only a different reaction to the same information
Select already had.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/PageCanvas.jsx`
- **Change type:** add (extends the effect from the previous unit)
- **Dependencies:** previous unit's effect

#### The New Code

```js
const onMouseDown = (opt) => {
  if (tool === 'eraser' && opt.target) {
    canvas.remove(opt.target)
    canvas.requestRenderAll()
  }
}
canvas.on('mouse:down', onMouseDown)
return () => canvas.off('mouse:down', onMouseDown)
```

#### The Updated Project

```jsx
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    canvas.isDrawingMode = tool === 'pen' || tool === 'marker'
    if (tool === 'pen') {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.color = strokeColor
      canvas.freeDrawingBrush.width = strokeWidth
    } else if (tool === 'marker') {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas)
      canvas.freeDrawingBrush.color = hexToRgba(strokeColor, 0.35)
      canvas.freeDrawingBrush.width = strokeWidth * 3
      canvas.freeDrawingBrush.strokeLineCap = 'butt'
    }

    canvas.selection = tool === 'select'
    canvas.getObjects().forEach((o) => {
      o.selectable = tool === 'select'
      o.evented = tool === 'select' || tool === 'eraser'   // ← new: eraser needs targets too
    })

    const onMouseDown = (opt) => {                          // ← new
      if (tool === 'eraser' && opt.target) {                // ← new
        canvas.remove(opt.target)                           // ← new
        canvas.requestRenderAll()                            // ← new
      }                                                      // ← new
    }                                                        // ← new
    canvas.on('mouse:down', onMouseDown)                     // ← new
    return () => canvas.off('mouse:down', onMouseDown)       // ← new
  }, [tool, strokeColor, strokeWidth])
```

#### Mechanical Walkthrough
- `o.evented = tool === 'select' || tool === 'eraser'` — established
boolean-expression style (previous unit), extended: an object must stay
`evented` (able to receive mouse events at all) under Eraser too, or
fabric would never populate `opt.target` for it during hit-testing,
- even though it isn't `selectable`.
- `opt.target` — a property fabric
attaches to every mouse event it fires, naming the topmost object
under the pointer, or `undefined` if the click hit empty canvas.
- `canvas.remove(opt.target)` — removes that one object from the
canvas's object list; nothing else on the canvas is touched.
- `canvas.on(...)`/`canvas.off(...)` — established (`SvgStudioPage.jsx`
already registers and cleans up canvas event listeners this same way)
— the cleanup function returned from the effect ensures the *previous*
tool's listener is removed before a new one is attached on the next
run, so switching tools never stacks up duplicate handlers.

#### CS Lens

Reusing the hit-test fabric already performs for selection, rather
than writing separate geometry code to figure out "what's under this
point," is recognizing that "what object is at this pixel" is one
question, asked by multiple features. **Recognized in:** an operating
system's window manager resolving one click to whichever window is on
top at that screen position, then routing that same resolved target to
whichever app-level handler cares (focus, drag, or context menu); a
game engine's single raycast-from-cursor used to answer both "what
should I highlight" and "what should I shoot" depending on which
action the player took.

#### SE Lens

Three real ways to implement "erase" were on the table.
**Object-delete-on-click** (chosen): zero new dependencies, correct at
whole-shape granularity, but can't erase *part* of a stroke — clicking
anywhere on a long pen line deletes the entire line, not just the part
near the cursor. **A destination-out compositing brush** (draws using
canvas's `globalCompositeOperation = 'destination-out'`, punching real
transparent holes at pixel granularity): finer control, matches what
"eraser" means intuitively, but means erased pixels are gone from
whatever object they came from, complicating undo and any future
per-object editing. **A third-party `EraserBrush` plugin**: would
restore pixel-level erasing without hand-rolling the compositing logic,
at the cost of a new dependency this feature doesn't otherwise need.
Object-delete ships because it needs nothing new and is trivially
correct to reason about; pixel-level erasing is a real, named
follow-up if whole-object deletion turns out to feel wrong once more
people actually use the notebook.

#### Connect to What Came Before

The previous unit configured *drawing* — putting new strokes on the
canvas. This unit configures the opposite action, *removing* what's
already there, by leaning on the same per-object `evented` flag and
event-listener pattern (`canvas.on`/`canvas.off`) this file already
established, rather than inventing a new mechanism for it.

---

## Connect the Pieces

`DrawToolbar` renders four buttons plus color swatches and a width
slider; clicking any of them updates `tool`, `strokeColor`, or
`strokeWidth` in `CanvasNotesPage`'s state, which flows down as props
to `PageCanvas`. `PageCanvas`'s third effect (this lesson) watches all
three and reconfigures the one shared `fabric.Canvas` accordingly: Pen
- and Marker set `isDrawingMode` and install a `PencilBrush` — the same
brush class, differing only in color alpha and width, per this
lesson's first unit; Eraser instead attaches a `mouse:down` listener
that deletes whatever `target` fabric resolves for the click, per the
second unit. Because this all lives in the *tool* effect (dependent on
`[tool, strokeColor, strokeWidth]`), none of it interferes with Lesson
- 2's separate *page-swap* effect (dependent on `[pageId]`) — switching
pages mid-draw and switching tools mid-page are handled by two
independent effects, each reacting only to the state that's actually
its concern.

## What Breaks Without This

Verified live, this session: with the `o.evented = tool === 'select' ||
tool === 'eraser'` line reverted to the Lesson-2-era
`o.evented = tool === 'select'` (Eraser no longer keeps objects
evented), clicking directly on a drawn stroke while Eraser is active
- produces `opt.target === undefined` — fabric can't hit-test an object
that isn't listening for events at all. The click silently does
nothing: no error, no console warning, and a user has no way to tell
whether they missed the stroke or whether Eraser is simply broken.

## Exercises

- Add a fifth tool, "Rectangle Eraser" — instead of deleting on click,
  delete every object whose bounding box intersects a dragged
  rectangle (`canvas.getObjects().filter(o => o.intersectsWithRect(...))`).
  Predict what additional state this needs (a drag-start point, at
  minimum) before writing it.
- Temporarily set the marker's `strokeLineCap` to `'round'` instead of
- `'butt'` and compare the visual difference at a stroke's start/end —
  confirm you can explain why a highlighter typically wants a flatter
  cap than a pen.

## Definition of Done

- [ ] `DrawToolbar.jsx` renders Select/Pen/Marker/Eraser buttons, color
      swatches, and a stroke-width slider, reporting every change
      upward via props (no fabric code inside the toolbar itself)
- [ ] `PageCanvas`'s tool effect sets `isDrawingMode` and installs a
      `PencilBrush` for Pen and Marker, with Marker using
      `hexToRgba(strokeColor, 0.35)` and a wider, flat-capped stroke
- [ ] Eraser deletes exactly the object under the click (verified: a
      click on empty canvas changes nothing; a click on a stroke
      removes only that stroke)
- [ ] Verified live, this session: drawing with Pen, drawing with
      Marker (visibly translucent), and erasing a specific stroke
      without affecting others, all through the real toolbar buttons
      and real mouse events — not simulated state changes
- [ ] You can state, without notes, why Marker doesn't need its own
      brush class, and why Eraser doesn't need any hit-testing code of
      its own
- [ ] You can name the real cost of object-delete-on-click as this
      feature's eraser design (no partial/pixel-level erasing) and one
      alternative that would fix it, with its own cost
- [ ] `git commit` with a message explaining why — for example: "Add
      Pen/Marker/Eraser tools to canvas-notes — marker reuses
      PencilBrush with a translucent color instead of a new brush
      class; eraser deletes on fabric's own hit-tested click target
      since fabric 7.4.0 ships no EraserBrush"
