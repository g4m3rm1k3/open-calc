# Lesson 9 — A Page Bigger Than the Screen, and Two Bugs That Came With It

## What You Will Build

Every page so far has been a canvas exactly the size of its visible
box — 800×600, all of it always on screen at once. A real notebook
page, the way OneNote treats one, is bigger than what fits on any one
screen: you scroll or drag around it. This lesson makes the canvas
2400×1600 — three times bigger in each dimension — puts it inside a
fixed-size scrollable viewport, and adds a Pan tool so dragging moves
you around the page instead of drawing on it. Getting there surfaced
two real bugs: fabric silently layers a second, invisible canvas on
top of the one you're holding a reference to, and a markdown note's
own HTML swallows drags meant for the page underneath it.

## What You Need to Know First

`canvas-notes-lab/01-...md` through `08-...md` — assumed fresh,
especially Lesson 3's tool-dependent `evented` toggling (this lesson
extends that same idea to something that isn't a fabric object at
all) and Lesson 5's overlay position-sync effect (this lesson adds one
more trigger to it). `StickyNote.jsx`'s scroll-tracking effect — cited
directly below, not re-derived.

---

## The Lesson

### Where you're working

Two modified files: `PageCanvas.jsx` (bigger canvas, a scrollable
viewport wrapper, the Pan tool) and `MarkdownNote.jsx` (one more sync
trigger, one pointer-events fix). `DrawToolbar.jsx` gains one button.

### Concept Unit: A Fixed Viewport Onto a Much Bigger Page

#### The Problem

`CANVAS_W`/`CANVAS_H` have meant "the size of the drawing surface" and
"the size of what's visible" as the same two numbers since Lesson 2.
Making a page feel like real paper means separating those: the
drawing surface should be big, the visible window should stay
whatever fits comfortably in the app, and native scrolling should
reveal the rest.

#### Introduce the Concept in Isolation

```html
<div style="width: 300px; height: 200px; overflow: auto;">
  <div style="width: 900px; height: 600px; background: linear-gradient(...);"></div>
</div>
```

A 300×200 window showing part of a 900×600 area, scrollable — this is
the entire mechanism, with nothing fabric-specific about it at all: a
smaller `overflow: auto` container with a bigger child inside it is
how every scrollable box on the web works, from a `<textarea>` to this
exact div-in-a-div.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/PageCanvas.jsx`
- **Change type:** modify (canvas dimensions) + add (viewport wrapper)

#### The New Code

```js
const CANVAS_W = 2400
const CANVAS_H = 1600
```

```jsx
<div ref={scrollRef} className="w-full overflow-auto rounded-lg border ..." style={{ height: '65vh' }}>
  <div>
    <canvas ref={canvasElRef} />
  </div>
</div>
```

#### Mechanical Walkthrough
`fabric.Canvas`'s own `width`/`height` options (set at construction,
Lesson 2) control the drawing surface's real size — 2400×1600 now,
regardless of how much of that is visible at once. The wrapping
`<div>` with `overflow: auto` and a fixed `height: '65vh'` is what's
- actually visible — a viewport, not the page itself.
- `65vh` (65% of the
viewport's height) is a relative unit, so this viewport resizes
sensibly across differently-sized floating windows rather than being
one fixed pixel value that's too small on a big monitor or too large
on a small one.

#### CS Lens

Separating "how big the data actually is" from "how much of it is
currently rendered/visible" is the same idea behind virtual scrolling
in a long list (a spreadsheet with a million rows, a chat log with
years of messages) — the full dataset is much bigger than what's ever
on screen at once; only a window into it is materialized at any
moment. This lesson's version is simpler (fabric still renders the
*entire* 2400×1600 canvas, not just the visible slice — a real virtual
scroller would go further and only draw what's in view), but the
underlying separation of concerns is identical.

#### SE Lens

The alternative — keeping the canvas exactly viewport-sized and adding
a separate "zoom out" control instead (like `SvgStudioPage.jsx`'s
existing zoom feature) — would let a user see the *whole* page at
once, just smaller, rather than a full-size window onto part of it.
Panning a bigger page (chosen here) matches how a real notebook page
feels — you work at one natural size and move around, rather than
working zoomed-out and squinting. Both are legitimate; this one was
chosen because it's what the user asked for by name ("just like
OneNote"), and OneNote's own page behavior is exactly this — pan, not
zoom-to-fit, as the default way of moving around a page.

#### Connect to What Came Before

Nothing about the canvas's own mechanics changed here — Lesson 2's
`loadFromJSON`/`toDatalessJSON`, Lesson 3's tools, Lesson 4's dedicated
wrapper div all work exactly as before against the new, bigger
dimensions. This unit only changed two numbers and added a viewport
around them.

---

### Concept Unit: The Canvas That Isn't the Canvas You're Holding

#### The Problem

The most natural way to implement "drag to pan" looks like: attach a
plain `mousedown` listener directly to the `<canvas>` element the
`canvasElRef` points at, then track `mousemove` to scroll the
viewport. That doesn't work — the listener never fires.

#### Introduce the Concept in Isolation

```js
const canvases = document.querySelectorAll('canvas')
console.log({ count: canvases.length, classes: [...canvases].map(c => c.className) })
```

Run, real output, against a live `fabric.Canvas` already initialized
in the actual app:
```
Real DOM after fabric.Canvas() init: {
  canvasElementCount: 2,
  classNames: [ 'lower-canvas', 'upper-canvas' ]
}
```

**What this proves:** `new fabric.Canvas(el)` doesn't just draw onto
`el` — it creates a *second* `<canvas>` element (`upper-canvas`),
absolutely positioned directly on top of the original one
(`lower-canvas`, the element `canvasElRef` actually points at), and
that upper one is what fabric uses to capture mouse interaction and
render selection UI. A native `addEventListener('mousedown', ...)`
attached to `canvasElRef.current` is listening to the *bottom* layer —
every real click lands on the *top* layer instead, a sibling element,
and DOM events never travel sideways between siblings, only up through
ancestors.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/PageCanvas.jsx`
- **Change type:** add (the Pan tool's drag effect)
- **Dependencies:** the viewport wrapper from the previous unit

#### The New Code

```js
useEffect(() => {
  if (tool !== 'pan') return
  const canvas = fabricRef.current
  const scrollEl = scrollRef.current
  if (!canvas || !scrollEl) return

  const onMouseDown = (opt) => {
    const startX = opt.e.clientX
    const startY = opt.e.clientY
    const startScrollLeft = scrollEl.scrollLeft
    const startScrollTop = scrollEl.scrollTop
    canvas.defaultCursor = 'grabbing'

    const onMouseMove = (ev) => {
      scrollEl.scrollLeft = startScrollLeft - (ev.clientX - startX)
      scrollEl.scrollTop = startScrollTop - (ev.clientY - startY)
    }
    const onMouseUp = () => {
      canvas.defaultCursor = 'grab'
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }
  canvas.on('mouse:down', onMouseDown)
  return () => canvas.off('mouse:down', onMouseDown)
}, [tool])
```

Real output, verified this session:
```
Scroll position before drag: { left: 0, top: 0 }
Scroll position after drag: { left: 200, top: 150 }
Scroll actually changed (panned): true
```

#### Mechanical Walkthrough
- The fix routes through `canvas.on('mouse:down', ...)` — established
since Lesson 2 — instead of a native listener on the ref. Fabric's own
event system already listens on whichever element actually receives
clicks (the upper canvas) internally, and hands you a normalized event
object (`opt`) with `opt.e` as an escape hatch back to the real
- browser `MouseEvent` — `opt.e.clientX`/`clientY` are exactly what a
native listener would have given you, just reached through fabric's
wrapper instead of around it. Everything downstream — tracking a
- start position, listening for `window`-level `mousemove`/`mouseup` —
is the same drag shape `StickyNote.jsx` already uses to drag its own
card around, just driving `scrollLeft`/`scrollTop` instead of a CSS
position.

#### CS Lens

A library creating hidden internal structure beyond what you handed
it — here, a whole second DOM element you never asked for — is a
common shape: an ORM wrapping one table with additional shadow/audit
tables; a compiler inserting temporary variables into generated code
that never appear in the source you wrote. **Recognized in:** any time
"the thing I gave the library" and "the thing actually doing the work"
turn out not to be the same object, and the library's own API
(`canvas.on(...)`, not a raw DOM listener) is the only reliable way to
reach the real one.

#### SE Lens

Reaching into fabric's internals directly (finding `upper-canvas` by
class name and attaching a native listener to *that* instead) would
also work, but ties this code to an implementation detail — fabric's
choice to name that element `upper-canvas` isn't part of its public
API and could change across versions. Going through `canvas.on(...)`
instead depends only on fabric's documented event system, which is
exactly the kind of stable surface to build against instead of
whatever the DOM happens to look like today.

#### Connect to What Came Before

Every other tool in this lesson series (Lessons 3, 4) already used
`canvas.on('mouse:down', ...)` for exactly this reason, without this
lesson ever having to explain *why* a native listener wouldn't have
worked instead. This is that reason, made explicit for the first time.

---

### Concept Unit: A Note That Swallows the Drag Meant for the Page

#### The Problem

The Pan tool worked in isolation — but the moment a page had a
markdown note on it (Lesson 5) and the drag started anywhere near
that note, nothing happened. No error, no console warning: the
viewport just didn't scroll.

#### Introduce the Concept in Isolation

Verified directly, this session — the same pan-drag sequence, once
with no note on the page, once with one placed first:

```
(no note on the page)
Scroll before: { left: 0, top: 0 }
Scroll after:  { left: 200, top: 150 }   ← panned correctly

(a note placed on the page first)
Scroll before: { left: 0, top: 0 }
Scroll after:  { left: 0, top: 0 }        ← did not move at all
```

**What this proves:** the drag's starting click landed on the
`MarkdownNote` overlay's own interactive content box, not on the
canvas underneath it. Lesson 5 gave that content box
`pointerEvents: 'auto'` unconditionally, so a user could always type
into or click the note — but "always" included while the Pan tool
was active, where a click anywhere over the note's area gets
intercepted by the note's own `<div>` before it ever reaches fabric's
canvas at all, exactly the way Lesson 5's *outer* frame was
deliberately made click-through so fabric's resize handles stayed
reachable — the *inner* content box never got the same treatment,
because Lesson 5 had no other tool yet that needed to reach through it.

#### Discard the Throwaway Example

#### Project Change

- **Files:** `MarkdownNote.jsx` (accepts `tool`), `PageCanvas.jsx` (passes it)
- **Change type:** fix
- **Dependencies:** Lesson 5's overlay structure

#### The New Code

```jsx
<div
  style={{
    position: 'absolute',
    inset: 8,
    pointerEvents: tool === 'select' ? 'auto' : 'none',
    /* ... */
  }}
>
```

```jsx
<MarkdownNote
  key={anchor.__id}
  canvas={fabricRef.current}
  canvasElRef={canvasElRef}
  anchor={anchor}
  initialText={anchor.__markdown}
  onDelete={() => deleteAnchor(anchor)}
  tool={tool}
/>
```

Real output after the fix, same sequence repeated:
```
Scroll before: { left: 0, top: 0 }
Scroll after:  { left: 150, top: 150 }
```

#### Mechanical Walkthrough
- `tool === 'select' ? 'auto' : 'none'` — the note's content box is only
genuinely clickable while the Select tool is active; every other tool
(Pan, Pen, Marker, Eraser, Text, Note) now passes clicks straight
through it to the canvas beneath, the same as Lesson 3's
`o.evented = tool === 'select' || tool === 'eraser'` line does for
real fabric objects — a markdown note's HTML overlay isn't a fabric
object at all, but it sits in the same visual layer and needed the
identical rule applied by hand, since fabric's own `evented` property
has no effect on a plain `<div>` that isn't part of its canvas.

#### CS Lens

This is the same "who currently owns input" question every layered UI
has to answer, whether the layers are all native platform widgets or,
like here, a mix of a `<canvas>` and plain HTML stacked on top of it:
exactly one layer should be receiving a given interaction at a time,
and that answer can change based on mode (a tool, in this case) even
though the visual stacking never changes. **Recognized in:** a map
application's UI overlay panels (search results, a sidebar) needing
`pointer-events` rules so dragging the *map* underneath still works
when the cursor happens to be over a transparent gap in a panel; a
game UI's HUD elements needing the same treatment so clicks intended
for the 3D world don't get eaten by an invisible full-screen overlay
div.

#### SE Lens

The alternative — leaving the note's content always interactive and
instead making the *Pan tool's* drag detection smarter (e.g., starting
a pan even if the initial `mousedown` target was a note, by listening
one level higher in the DOM) — was rejected because it would mean
every future overlay-based feature added on top of the canvas
(anything like `MarkdownNote`) would need its *own* special-cased
escape hatch for panning to work near it. Gating the note's own
interactivity by `tool`, the same switch every fabric object already
obeys, means any future non-Select tool automatically gets a
correctly click-through note for free — the rule lives in one place
(the note), not scattered across every tool that might need to reach
through it.

#### Connect to What Came Before

Lesson 3 established `evented` toggling as "how this app decides what's
interactive right now" for fabric objects. This unit is that same
policy, extended past fabric's own object model to the one thing in
this feature that lives outside it — proof that the *rule* (interactive
only during Select) matters more than the *mechanism* (`evented` vs
`pointerEvents`) used to enforce it in a particular layer.

---

## Connect the Pieces

The canvas is now 2400×1600 — three times its original size — sitting
inside a fixed, `65vh`-tall scrollable viewport (first unit), so
native scrollbars alone already let a user navigate a page bigger than
their screen. The Pan tool (second unit) adds drag-anywhere panning on
top of that, discovered along the way that fabric's own interactive
surface is a *second*, invisible canvas layered on top of the one held
- in `canvasElRef` — meaning the drag has to be wired through fabric's
own event system, not a native listener on the wrong element. Placing
a markdown note (Lesson 5) on a page and then trying to pan near it
surfaced a second, unrelated bug (third unit): the note's own
always-interactive content box silently intercepted the drag before it
ever reached the canvas — fixed by extending Lesson 3's tool-gated
`evented` idea to the note's plain HTML, so it's only genuinely
clickable while the Select tool is active, same as everything else on
the page.

## What Breaks Without This

Verified live, this session, both ways: without routing the pan drag
through `canvas.on('mouse:down', ...)` (attaching a native listener to
`canvasElRef.current` instead), clicking and dragging anywhere on the
canvas produces zero scroll movement — no error, the listener is
simply never called, because real clicks land on fabric's separate
upper canvas. Without gating `MarkdownNote`'s `pointerEvents` by
`tool`, panning works everywhere on an empty page but silently stops
working the instant a note exists anywhere the drag starts near it —
also with no error, since the click was still handled, just by the
wrong element.

## Exercises

- Zoom (a feature `SvgStudioPage.jsx` already has) was deliberately not
  added here — panning at a fixed 1:1 scale was judged closer to
  "OneNote" than zoom-to-fit. Sketch what would need to change in the
  Pan effect above if zoom were added later (hint: `scrollLeft`/`Top`
  alone stop being the right coordinates once the canvas can also be
  scaled).
- Add keyboard-driven panning (arrow keys scroll the viewport by a
  fixed increment) as a second way to reach the same
  `scrollRef.current.scrollLeft`/`scrollTop` this lesson's mouse-drag
  version already writes to.

## Definition of Done

- [ ] `CANVAS_W`/`CANVAS_H` are 2400×1600; the canvas sits inside a
      fixed-height (`65vh`), `overflow-auto` viewport
- [ ] A Pan tool drags the viewport via `scrollLeft`/`scrollTop`,
      wired through `canvas.on('mouse:down', ...)`, not a native
      listener on `canvasElRef.current`
- [ ] `MarkdownNote`'s interactive content box is only `pointerEvents: 'auto'`
- while `tool === 'select'` — every other tool passes clicks
      through it to the canvas
- [ ] The overlay position-sync effect also re-runs on `scroll`
      (capture phase), so notes stay glued to their anchor while
      panning, not just while dragging/resizing the anchor directly
- [ ] Verified live, this session: the canvas is measurably bigger
      than its viewport; the Pan tool scrolls it; a note's overlay
      follows correctly during a pan; panning still works when a note
      exists on the page; other tools (pen, note editing) still work
      normally near a note
- [ ] You can explain, without notes, why a native `mousedown` listener
      on `canvasElRef.current` never fires, and what `lower-canvas`/
      `upper-canvas` are
- [ ] You can explain, without notes, why `MarkdownNote` needed its own
      `pointerEvents` rule instead of relying on fabric's `evented`
      property
- [ ] `git commit` with a message explaining why — for example: "Make
      the canvas-notes page 3x bigger than its viewport with a Pan
      tool, matching OneNote's drag-a-big-page behavior — fixed two
      real bugs along the way: native listeners can't reach fabric's
      separate upper-canvas interaction layer, and MarkdownNote's
      content box needed the same tool-gated interactivity fabric
      objects already have, or it silently swallows drags meant for
      the canvas"
