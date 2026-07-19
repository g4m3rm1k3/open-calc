# Lesson 2 — One Canvas, Swapped Content, Many Pages

## What You Will Build

Every page in `canvas-notes` needs its own drawable surface, but a
notebook with dozens of pages can't afford to create and tear down a
full `fabric.Canvas` (a real `<canvas>` element plus its own render
loop and event listeners) every time the user clicks a different page
tab. This lesson builds `PageCanvas.jsx`: one `fabric.Canvas` instance,
created once, that swaps its *content* — not itself — whenever the
active page changes, saving the outgoing page's drawing before loading
the incoming one.

## What You Need to Know First

`lab-registry-autofind/01-...md` and `02-...md`, and
`canvas-notes-lab/01-...md` — assumed fresh, not re-explained.
`useeffect-and-useref-fundamentals/01-...md` — assumed fresh: `useRef`
as a box that persists across renders without causing one, and
`useEffect` running code because a render committed. Both reappear
below, extended to a new use.

---

## The Lesson

### Where You're Working

One new file, one modified file: `src/labs/canvas-notes/PageCanvas.jsx`
(new — the canvas itself) and `CanvasNotesPage.jsx` (modified — wires
`PageCanvas` in where the placeholder content area used to be, and adds
a `pageCanvasData` map to hold each page's saved drawing in memory).
`svg-studio/SvgStudioPage.jsx` is read as a reference, not modified —
it already runs a `fabric.Canvas` in this app; this lesson does not
re-teach fabric's basic setup, only what's genuinely new about reusing
one instance across many logical documents.

### Concept Unit: Remembering What Changed Since Last Render

#### The Problem

`PageCanvas` receives `pageId` as a prop. Every time it changes, the
component must do something *once*, at the exact moment of the switch:
save the outgoing page's canvas content before loading the incoming
page's. But React doesn't hand you an "old props" object — every
render only ever sees the *current* `pageId`. Something has to
remember what `pageId` was a moment ago, entirely outside of React's
own state (using `useState` for this would itself trigger another
render just to track a value nothing displays).

#### Introduce the Concept in Isolation

```js
// Concept lab: a plain object survives across calls, unlike a local
// variable that's reinitialized every time. This is what useRef gives
// a component across renders — a box, not a fresh variable.
function makeRef(initialValue) {
  return { current: initialValue }
}

const prevPageIdRef = makeRef('page-1') // created once, like useRef(pageId)

function renderCommit(pageId) {
  const changed = prevPageIdRef.current !== pageId
  console.log(`render(pageId=${pageId}) — prevPageIdRef.current=${prevPageIdRef.current}, changed=${changed}`)
  if (changed) {
    console.log(`  -> would save outgoing page "${prevPageIdRef.current}", then load "${pageId}"`)
  }
  prevPageIdRef.current = pageId // update AFTER comparing
}

renderCommit('page-1') // same id passed again — no real switch
renderCommit('page-2') // user clicked a different page tab
renderCommit('page-2') // re-render for an unrelated reason — must NOT refire
renderCommit('page-1') // switched back
```

Run, real output:
```
render(pageId=page-1) — prevPageIdRef.current=page-1, changed=false
render(pageId=page-2) — prevPageIdRef.current=page-1, changed=true
  -> would save outgoing page "page-1", then load "page-2"
render(pageId=page-2) — prevPageIdRef.current=page-2, changed=false
render(pageId=page-1) — prevPageIdRef.current=page-2, changed=true
  -> would save outgoing page "page-2", then load "page-1"
```

**What this proves:** comparing against a ref's `.current` correctly
tells the difference between "the page actually changed" (fires the
save/load logic) and "the component re-rendered for some unrelated
reason with the same `pageId`" (third call — `changed: false`, nothing
refires). A plain local variable couldn't do this: it would be
recreated fresh on every render, with no memory of what came before.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/PageCanvas.jsx` (new file)
- **Change type:** add
- **Dependencies:** none

#### The New Code

```js
const prevPageIdRef = useRef(pageId)

useEffect(() => {
  const canvas = fabricRef.current
  if (!canvas) return

  if (prevPageIdRef.current !== pageId) {
    onLeavePage(prevPageIdRef.current, canvas.toDatalessJSON())
  }

  // ...clear and load the new page's content, below...

  prevPageIdRef.current = pageId
}, [pageId])
```

#### The Updated Project

```jsx
import { useEffect, useRef } from 'react'
import * as fabric from 'fabric'

const CANVAS_W = 800
const CANVAS_H = 600

// One fabric.Canvas instance, reused across every page — never recreated
// when the active page changes. Switching pages swaps the canvas's
// CONTENT (via loadFromJSON), not the canvas itself.
export default function PageCanvas({ pageId, initialJSON, onLeavePage }) {
  const canvasElRef = useRef(null)
  const fabricRef = useRef(null)
  const prevPageIdRef = useRef(pageId)

  // Mount the canvas exactly once.
  useEffect(() => {
    const canvas = new fabric.Canvas(canvasElRef.current, {
      width: CANVAS_W,
      height: CANVAS_H,
      backgroundColor: '#ffffff',
    })
    fabricRef.current = canvas
    return () => canvas.dispose()
  }, [])

  // Swap content whenever the active page changes.
  useEffect(() => {
    const canvas = fabricRef.current
    if (!canvas) return

    // Save whatever page we're leaving — read from the canvas BEFORE it's
    // cleared/reloaded below, using the last known pageId, not the new one.
    if (prevPageIdRef.current !== pageId) {
      onLeavePage(prevPageIdRef.current, canvas.toDatalessJSON())
    }

    canvas.clear()
    if (initialJSON) {
      // loadFromJSON's 2nd argument is a per-object reviver, not a
      // "finished loading" callback — it returns a Promise for that.
      canvas.loadFromJSON(initialJSON).then(() => canvas.requestRenderAll())
    } else {
      canvas.backgroundColor = '#ffffff'
      canvas.requestRenderAll()
    }

    prevPageIdRef.current = pageId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  return (
    <canvas
      ref={canvasElRef}
      className="border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm"
    />
  )
}
```

#### Mechanical Walkthrough

`useRef(pageId)` — established (`useeffect-and-useref-fundamentals/01-...md`),
seeded with whatever `pageId` this component first mounted with.
`prevPageIdRef.current !== pageId` reads the box's stashed value and
compares it against this render's fresh prop — the two can only differ
if a parent passed a genuinely new `pageId` since the last time this
effect ran. `onLeavePage(prevPageIdRef.current, ...)` — note it passes
the *old* id, not the new one; this is what makes the save target the
page actually being left, not the page being entered. The assignment
`prevPageIdRef.current = pageId`, at the very end, updates the box for
next time — done last, after every read of the old value, so nothing
above it accidentally reads the already-updated value.

#### CS Lens

This is a diffing problem: detecting *what changed* between two
moments in time by keeping a copy of the previous state around and
comparing. **Recognized in:** React's own reconciler (comparing the
previous virtual DOM tree against the new one to compute a minimal
patch); a version-control diff (comparing the previous commit's file
contents against the working tree); a network protocol's delta sync
(sending only what changed since the client's last known state,
instead of the whole payload every time).

#### SE Lens

The alternative — running this logic inside the event handler that
*causes* the page switch (e.g., inside `PageTabs`'s `onSelect`) instead
of inside an effect watching `pageId` — was rejected here: it would
require `PageCanvas` to expose its save/load logic to its parent (via
`forwardRef`/`useImperativeHandle`, a materially more advanced React
API), just so the parent's click handler could call it before changing
state. Watching `pageId` itself and reacting to the *effect* of the
click, rather than the click, keeps every bit of canvas lifecycle logic
inside `PageCanvas` — the component that owns the canvas is the only
one that needs to know how to save and load it.

#### Connect to What Came Before

`lab-registry-autofind/01-...md` used `??` to avoid acting on a
value that hadn't arrived yet; this unit uses a ref to avoid acting on
a change that hasn't actually happened yet — both are forms of the same
habit: check before you act, rather than assuming.

---

### Concept Unit: One Instance, Swapped Content, Instead of Dispose-and-Recreate

#### The Problem

`SvgStudioPage.jsx` already proves the basic mechanics of a
`fabric.Canvas` — `toDatalessJSON()` to serialize, `loadFromJSON()` to
restore, `dispose()` to tear down (established; not re-taught here).
What it doesn't need to solve, because it only ever has one document,
is this feature's actual question: with potentially dozens of pages,
is it cheaper to create a *fresh* canvas per page, or *reuse one*
canvas and swap its contents? And once "reuse one" is chosen: is
`loadFromJSON`'s second argument actually a "done loading" callback,
or something else? Getting this wrong doesn't crash — it silently
drops content, which is exactly what happened while building this.

#### Introduce the Concept in Isolation

Run directly against the app's real fabric.js instance (Playwright
driving the actual browser, not a mock) — first, the version that was
originally written:

```js
// Inside the browser, against a real fabric.Canvas:
const rect = new fabricNS.Rect({ left: 200, top: 20, width: 40, height: 40, fill: 'blue' })
canvas.add(rect)
const savedJSON = canvas.toDatalessJSON()
canvas.clear()
canvas.loadFromJSON(savedJSON, () => canvas.requestRenderAll()) // ORIGINAL (buggy) usage
```

Real output:
```
Full round-trip (add -> save -> clear -> loadFromJSON): {
  countAfterAdd: 1,
  countAfterClear: 0,
  countAfterReload: 0,
  restoredType: undefined,
  restoredFill: undefined
}
```

The rectangle never came back. Fabric 7.4.0's `loadFromJSON` signature
is `loadFromJSON(json, reviver?, options?): Promise<this>` — the second
argument is a **reviver**, invoked *per object* during deserialization
as `(o, object, error)`, not a single "finished" callback. Passing
`() => canvas.requestRenderAll()` as the reviver means fabric calls it
once per object being revived, with its return value apparently
overriding what gets enlivened — `requestRenderAll()`'s return value
is not a fabric object, so the real object was dropped. The fix is to
use the Promise `loadFromJSON` actually returns:

```js
canvas.add(rect)
const savedJSON = canvas.toDatalessJSON()
canvas.clear()
await canvas.loadFromJSON(savedJSON)   // FIXED: await the Promise directly
canvas.requestRenderAll()
```

Real output:
```
After fix — await canvas.loadFromJSON(json) then render: {
  countAfterClear: 0,
  countAfterReload: 1,
  restoredType: 'rect',
  restoredFill: 'blue'
}
```

**What this proves:** the object survives the full round trip only
once `loadFromJSON`'s return value is treated as a Promise to wait on,
not a callback slot to stuff a render call into. This is exactly the
bug this lesson's real code had, caught by actually running the
concept lab instead of assuming the API from memory of an older fabric
version.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/PageCanvas.jsx`
- **Change type:** fix (corrects the `loadFromJSON` call inside the
  effect built in the previous unit)
- **Dependencies:** previous unit's effect

#### The New Code

```js
canvas.clear()
if (initialJSON) {
  canvas.loadFromJSON(initialJSON).then(() => canvas.requestRenderAll())
} else {
  canvas.backgroundColor = '#ffffff'
  canvas.requestRenderAll()
}
```

#### The Updated Project

(Shown whole in the previous unit's "Updated Project" — this unit
corrects the `loadFromJSON` line inside that same file; no other lines
change.)

#### Mechanical Walkthrough

`canvas.loadFromJSON(initialJSON)` returns a `Promise<Canvas>` — new
here, first appearance of a fabric method whose completion must be
awaited rather than assumed synchronous. `.then(() => canvas.requestRenderAll())`
schedules the render for after deserialization genuinely finishes,
whether that takes one tick or several (fabric enlivens each object,
including any that need to fetch external resources like images —
relevant again once Increment 6 adds pasted images). `canvas.clear()`
— established (`SvgStudioPage.jsx` already relies on it) — empties the
canvas synchronously before either branch runs, so the *previous*
page's shapes are never briefly visible under the new page's content.

#### CS Lens

Choosing to mutate and reuse one long-lived object (the canvas)
instead of allocating a fresh one per logical unit of work (each page)
is object pooling — trading the cost of repeated
construction/destruction for the discipline of resetting shared state
correctly every time it's reused. **Recognized in:** database
connection pools (reusing live connections instead of opening a fresh
TCP handshake per query); thread pools (reusing worker threads instead
of spawning one per task); game engines reusing particle or bullet
objects instead of allocating and garbage-collecting thousands per
second.

#### SE Lens

Dispose-and-recreate (a fresh `fabric.Canvas` — and a fresh `<canvas>`
DOM element — per page) is the safer default: zero risk of any
listener, cached dimension, or internal fabric state leaking from one
page into the next, at the cost of real DOM/WebGL-context churn every
single tab click, and losing whatever transient view state (zoom,
pan, active selection highlighting) a user had. Reuse-and-swap (chosen
here) is cheaper per switch and preserves that view state naturally,
but pushes the responsibility onto this code to reset *everything*
that matters on every swap — this lesson's bug is exactly what happens
when that reset is incomplete (a broken reload isn't a crash, it's
silently wrong content, which is worse to notice). For a notebook where
users may click between pages dozens of times per session, reuse wins
on cost — but the correctness burden it creates is real, not free.

#### Connect to What Came Before

The previous unit's `prevPageIdRef` decides *when* to save and load.
This unit is what actually executes correctly once that moment
arrives — and without it, the "when" would have been right while the
"what happens" silently failed.

---

## Connect the Pieces

A user clicks a different page tab: `activePageId` changes in
`CanvasNotesPage` (Lesson 1), which flows down as `PageCanvas`'s
`pageId` prop. The effect built in this lesson's first unit notices
`pageId` no longer matches `prevPageIdRef.current`, so it calls
`onLeavePage` with the *outgoing* page's id and its live
`canvas.toDatalessJSON()` — `CanvasNotesPage` stores that under the
outgoing page's id in `pageCanvasData`. The effect then clears the one
shared canvas and, per this lesson's second unit, correctly awaits
`loadFromJSON` before rendering the incoming page's saved content (or a
blank page, if none exists yet). Nothing about the `<canvas>` DOM
element or the `fabric.Canvas` instance is ever destroyed or recreated
— only its content changes, once per genuine page switch.

## What Breaks Without This

Verified live, this session, against the real running app: reverting
the second unit's fix back to `canvas.loadFromJSON(initialJSON, () => canvas.requestRenderAll())`
and repeating the exact same steps — draw a shape on "Welcome," switch
to "Tips," switch back to "Welcome" — the shape does not come back.
`canvas.getObjects().length` reads `0` instead of `1`. Nothing throws,
no console error appears, and `PageTabs`/`SectionTabs` keep working
perfectly — a user would simply believe their drawing was never saved,
with no error message telling them why.

## Exercises

- Add a `console.count('canvas-swap')` inside the effect, right after
  the `prevPageIdRef.current !== pageId` check, but only in the
  `true` branch. Click between three pages repeatedly and confirm the
  count only increments on genuine switches, never on an unrelated
  parent re-render.
- Temporarily change `canvas.clear()` to run *after* the
  `loadFromJSON` call instead of before it. Predict what you'll see on
  screen during a page switch before running it, then confirm.

## Definition of Done

- [ ] `PageCanvas.jsx` creates exactly one `fabric.Canvas`, in an
      empty-dependency-array effect, and disposes it on unmount
- [ ] A second effect, watching `pageId`, saves the outgoing page via
      `onLeavePage` (using `prevPageIdRef`, not the new `pageId`) before
      clearing and loading the incoming page's content
- [ ] `loadFromJSON` is awaited (via `.then()` or `await`) before
      calling `requestRenderAll` — never passed a callback in its
      reviver argument position
- [ ] Verified live, this session: drawing on one page, switching away,
      and switching back restores the drawing exactly; a page with no
      saved content yet loads blank, not the previous page's leftovers
- [ ] You reproduced the `loadFromJSON`-as-callback bug on purpose,
      saw the object silently fail to restore, and can explain why
      (reviver argument, not completion callback)
- [ ] You can state, without notes, the real cost `PageCanvas` accepts
      by reusing one canvas instead of dispose-and-recreate (every
      future feature touching canvas state must reset it fully on
      swap, or state will leak silently between pages)
- [ ] `git commit` with a message explaining why — for example: "Add
      PageCanvas with one reused fabric.Canvas swapped per page instead
      of dispose/recreate — fixes loadFromJSON misuse (reviver arg
      mistaken for a completion callback) that silently dropped
      restored content"
