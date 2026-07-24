# Lesson 5 — A Markdown Note That Lives Half On the Canvas, Half Off It

## What You Will Build

A second kind of note box — richer than Lesson 4's plain `Textbox`, since
it needs real Markdown and math rendering, not just bold/italic runs.
Fabric has no built-in way to render Markdown inside an object, so this
lesson takes a different approach entirely: a small, mostly-invisible
`fabric.Rect` lives on the canvas purely as a position/size anchor, and a
real React component — with a `<textarea>`, `MarkdownToolbar`, and the
app's existing Markdown+KaTeX pipeline — floats on top of it as an
absolutely-positioned HTML overlay, kept glued to the anchor's position
as it's dragged around.

## What You Need to Know First

`canvas-notes-lab/01-...md` through `04-...md` — assumed fresh,
especially `04-...md`'s fix (the canvas must sit in its own dedicated
wrapper div so React can safely mount/unmount siblings next to it — this
lesson adds a *variable number* of such siblings, one per note).
`svg-studio/SvgStudioPage.jsx`'s `overlayRef` — assumed fresh as a
mechanism reminder: it already positions an always-mounted `<div>` over
the canvas and writes directly into its DOM (not through React state) to
draw snap guides. `MarkdownProse.jsx`/`StickyNote.jsx`'s
ReactMarkdown+remark-gfm+remark-math+rehype-katex pipeline, and
`MarkdownToolbar.jsx`'s `onInsert({plain} | {snippet})` contract — both
assumed fresh; not re-taught here, only extended to a new caller.

---

## The Lesson

### Where You're Working

One new file, one modified file: `MarkdownNote.jsx` (new — the overlay
component itself) and `PageCanvas.jsx` (modified — a new tool branch
that places the anchor rect, an `noteAnchors` list kept in sync with
the canvas, and the custom fabric properties needed to persist a note's
text). `DrawToolbar.jsx` gets one new tool button ("Note").

### Concept Unit: A Placeholder Object, and a Div That Chases It

#### The Problem

`SvgStudioPage.jsx`'s snap guides are simple: one always-mounted overlay
`<div>`, whose *contents* get rewritten on every mouse move, but which is
never itself added or removed, and never needs to track any *particular*
object's position — just draw lines at absolute canvas coordinates. This
lesson's problem is different: a specific fabric object (the anchor) can
be dragged anywhere, resized, or simply not exist yet — and a specific
HTML element needs to sit exactly on top of *that one object*, tracking
wherever it goes, for as long as it exists.

#### Introduce the Concept in Isolation

```js
// Nothing from fabric or React here — just the arithmetic every position
// sync in this lesson boils down to.
const canvasRect = canvasEl.getBoundingClientRect() // canvas's own screen position
const fakeObject = { left: 40, top: 25, width: 120, height: 60 } // object's CANVAS-space position
const overlayScreenLeft = canvasRect.left + fakeObject.left
const overlayScreenTop = canvasRect.top + fakeObject.top
```

Run, real output:
```
Canvas element screen position: { left: 220, top: 150 }
Object canvas-space position: { left: 40, top: 25 }
Overlay screen position (canvasRect + object): { left: 260, top: 175 }
```

**What this proves:** a fabric object's `left`/`top` are in *canvas-space*
— relative to the canvas's own top-left corner, not the browser
viewport. An HTML element positioned `fixed` (viewport-relative)
therefore needs the canvas element's own `getBoundingClientRect()`
added back in to land in the right place on screen. This one addition
is the entire mechanism — everything else in this unit is *when* to
redo it.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/MarkdownNote.jsx` (new file)
- **Change type:** add
- **Dependencies:** an `anchor` fabric object and the canvas's own element ref, both passed in as props

#### The New Code

```js
useEffect(() => {
  const el = overlayRef.current
  const sync = () => {
    const canvasRect = canvasElRef.current.getBoundingClientRect()
    el.style.left = `${canvasRect.left + anchor.left}px`
    el.style.top = `${canvasRect.top + anchor.top}px`
    el.style.width = `${anchor.getScaledWidth()}px`
    el.style.height = `${anchor.getScaledHeight()}px`
  }
  sync()
  const onTransform = (opt) => { if (opt.target === anchor) sync() }
  canvas.on('object:moving', onTransform)
  canvas.on('object:scaling', onTransform)
  window.addEventListener('resize', sync)
  return () => {
    canvas.off('object:moving', onTransform)
    canvas.off('object:scaling', onTransform)
    window.removeEventListener('resize', sync)
  }
}, [canvas, anchor, canvasElRef])
```

#### The Updated Project

```jsx
import { useEffect, useRef, useState } from 'react'

export default function MarkdownNote({ canvas, canvasElRef, anchor, initialText, onDelete }) {
  const overlayRef = useRef(null)
  const [text, setText] = useState(initialText ?? '')
  // ...editing state, textarea ref, etc. — later units in this lesson...

  useEffect(() => {
    const el = overlayRef.current
    if (!el) return
    const sync = () => {
      const canvasEl = canvasElRef.current
      if (!canvasEl) return
      const canvasRect = canvasEl.getBoundingClientRect()
      el.style.left = `${canvasRect.left + anchor.left}px`
      el.style.top = `${canvasRect.top + anchor.top}px`
      el.style.width = `${anchor.getScaledWidth()}px`
      el.style.height = `${anchor.getScaledHeight()}px`
    }
    sync()
    const onTransform = (opt) => {
      if (opt.target === anchor) sync()
    }
    canvas.on('object:moving', onTransform)
    canvas.on('object:scaling', onTransform)
    window.addEventListener('resize', sync)
    return () => {
      canvas.off('object:moving', onTransform)
      canvas.off('object:scaling', onTransform)
      window.removeEventListener('resize', sync)
    }
  }, [canvas, anchor, canvasElRef])

  return <div ref={overlayRef} style={{ position: 'fixed', zIndex: 20 }}>{/* content, later units */}</div>
}
```

#### Mechanical Walkthrough
- `getScaledWidth()`/`getScaledHeight()` — fabric methods that account for
any scaling applied by a resize, unlike the object's raw `width`/`height`
properties (which stay at their original values; scaling is stored
separately as `scaleX`/`scaleY` and multiplied in). `opt.target === anchor`
- — established (Lesson 3's eraser used `opt.target` the same way) — this
effect only reacts to *this specific* object moving, ignoring every other
`object:moving` event the canvas fires for anything else the user drags.
Writing `el.style.left = ...` directly, rather than calling a `setState`,
means dragging the anchor across the canvas updates the overlay's
position on every intermediate frame *without* asking React to re-render
this component (or its parent) on each one — the same reasoning
`SvgStudioPage.jsx`'s `overlayRef` already relies on for its snap guides.

#### CS Lens

Reacting to *events* on one long-lived object, rather than polling its
position on a timer or recomputing it every render regardless of whether
it moved, is the same idea behind an operating system's file-change
watcher (`inotify`/`FSEvents`) versus a script that re-reads a file every
second "just in case." **Recognized in:** a UI library's `ResizeObserver`
(already used elsewhere in this app, in `StickyNote.jsx`, to detect a
card being resized) instead of polling `offsetWidth` on an interval; a
reactive spreadsheet cell recalculating only when a cell it actually
references changes, not on every keystroke anywhere in the sheet.

#### SE Lens

The alternative — recomputing every note's position on every React
render of `PageCanvas`, regardless of whether that specific anchor moved
— would be simpler to write (no event listeners to attach/detach) but
wasteful: with several notes on a page, every mouse-move dragging *one*
shape would force recalculating and re-styling *all* of them. Scoping
the listener to `object:moving`/`object:scaling` and filtering by
`opt.target === anchor` means each note's overlay reacts only to its own
anchor's transform — a direct trade of a small amount of setup
complexity (attach/detach listeners, compare `opt.target`) for avoiding
work that scales with the number of notes on a page.

#### Connect to What Came Before

Lesson 4 fixed *where* the canvas could safely coexist with React
siblings. This unit is the first thing this lesson set actually attaches
to that isolated canvas subtree from the outside — using fabric's own
event system (already familiar from Lessons 2 and 3) to drive plain DOM
writes (already familiar from `SvgStudioPage.jsx`'s overlay), combined
for a new purpose.

---

### Concept Unit: Letting Clicks Fall Through to What's Underneath

#### The Problem

The overlay needs to be interactive — a user must be able to click
inside it to type, hit Preview, or delete the note. But the *anchor*
underneath it also needs to stay draggable and resizable via fabric's
own native handles (Lesson 2 established that reusing fabric's existing
mechanisms beats inventing parallel ones). If the overlay is a normal,
fully-interactive `<div>` sitting exactly on top of the anchor, every
click — including ones meant to grab a resize handle — hits the HTML
overlay first and never reaches the canvas underneath at all.

#### Introduce the Concept in Isolation

```html
<button id="below" style="position:absolute; width:200px; height:200px;">Below</button>
<div id="frame" style="position:absolute; width:200px; height:200px; pointer-events:none;">
  <div id="inner" style="position:absolute; inset:20px; pointer-events:auto;"></div>
</div>
```

```js
await page.mouse.click(5, 5)     // inside frame's 20px border, outside "inner"
await page.mouse.click(100, 100) // inside "inner"
```

Run, real output:
```
Click at the 20px border (frame has pointer-events:none): { belowClicked: 1, innerClicked: 1 }
```

**What this proves:** the click at `(5, 5)` — inside `frame`'s area but
outside `inner` — passed straight through `frame` (which has
`pointer-events: none`) and landed on `below`. The click at `(100, 100)`
— inside `inner`, which explicitly re-enables `pointer-events: auto` —
was captured by `inner` and did *not* reach `below` underneath it.
`pointer-events: none` doesn't just disable clicks on an element; it
makes the browser skip that element entirely during hit-testing, as if
it weren't there, while its children can still opt back in individually.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/MarkdownNote.jsx`
- **Change type:** add (wraps the content built in later units)
- **Dependencies:** the overlay `<div>` from the previous unit

#### The New Code

```jsx
<div ref={overlayRef} style={{ position: 'fixed', zIndex: 20, pointerEvents: 'none' }}>
  <div style={{ position: 'absolute', inset: 8, pointerEvents: 'auto' /* ...content... */ }}>
    {/* header, textarea/preview */}
  </div>
</div>
```

#### The Updated Project

(Shown in full in the next unit's "Updated Project," which fills in the
header/textarea/preview content this structure wraps.)

#### Mechanical Walkthrough
The outer `<div>` is sized and positioned exactly over the anchor (via
- the previous unit's `sync()`) but has `pointerEvents: 'none'` — it exists
purely as a positioning frame. The inner `<div>` is inset by `8px` on
every side (`inset: 8`, a CSS shorthand for `top/right/bottom/left: 8px`)
- and re-enables `pointerEvents: 'auto'` — an 8-pixel strip around the
note's edge is left genuinely click-through, exactly where fabric draws
its own resize handles (small squares straddling an object's border),
while everything inside that strip behaves like a normal, fully
interactive HTML element.

#### CS Lens

This is the same idea as event bubbling's `stopPropagation`, applied in
reverse: instead of stopping an event from continuing past a specific
element, `pointer-events: none` removes an element from hit-testing
*before* any event is dispatched to it at all, letting whatever is
beneath receive it as if the element on top were transparent to input
(even though it's still visually rendered). **Recognized in:** a tooltip
or loading spinner overlay that shouldn't block clicks on the content
behind it; a custom cursor or drag-ghost `<div>` that follows the mouse
purely for visual feedback, deliberately excluded from hit-testing so it
never intercepts the click it's visually sitting on top of.

#### SE Lens

The alternative — making the whole overlay interactive and building a
custom drag/resize interaction *inside* React (mirroring
`StickyNote.jsx`'s own hand-rolled `onDragStart`, which tracks
- `mousemove`/`mouseup` itself rather than relying on fabric at all) —
would avoid the click-through problem entirely, at the cost of
duplicating logic fabric already provides for free (bounded resizing,
rotation, snapping to other objects if Lesson 3's snap-style features
ever extend here). Reusing fabric's own handles via a deliberately
click-through frame costs one CSS property and a fixed inset margin;
it was chosen because this whole feature already depends on fabric
being the source of truth for the anchor's position — building a
second, parallel drag system would mean two different codepaths could
disagree about where an object actually is.

#### Connect to What Came Before

The previous unit made the overlay track the anchor's position. This
unit makes sure the overlay doesn't accidentally *prevent* the anchor
from being moved or resized in the first place, by staying out of the
way of the exact fabric mechanism (native drag/resize handles) the rest
of this lesson set already depends on.

---

### Concept Unit: Wiring Markdown In, and Making It Survive a Save

#### The Problem

The overlay itself is just a positioned, click-through-framed `<div>` so
far — it renders nothing useful. It needs the app's existing
Markdown+math pipeline for a preview mode, a plain `<textarea>` (not
Monaco — cheaper to mount many of, since a page can hold several notes)
for editing, and `MarkdownToolbar` for inserting symbols into that
textarea. And whatever the user types has to survive a page switch —
which means it has to travel through `toDatalessJSON`/`loadFromJSON`
(Lesson 2) the same way strokes and shapes already do, even though
"markdown text" isn't a property fabric's `Rect` class knows anything
about.

#### Introduce the Concept in Isolation

```js
const rect = new fabricNS.Rect({ left: 0, top: 0, width: 10, height: 10 })
rect.__markdown = 'secret note text'
canvas.add(rect)

const withoutPropList = canvas.toDatalessJSON()
const withPropList = canvas.toDatalessJSON(['__markdown'])
```

Run, real output:
```
Custom property WITHOUT passing its name to toDatalessJSON: undefined
Custom property WITH its name passed to toDatalessJSON: secret note text
```

**What this proves:** fabric's serializer only writes out the
properties it knows about by default (`left`, `top`, `fill`, and so on)
— any custom property stashed directly on an object (`rect.__markdown =
...`, the same technique `SvgStudioPage.jsx` already uses for `__id`
and `__name`) is silently dropped unless its name is explicitly listed
in the array `toDatalessJSON` accepts. Miss this, and a note's text
would vanish the instant the page's canvas JSON gets saved and reloaded
— not a crash, just quietly gone.

#### Discard the Throwaway Example

#### Project Change

- **Files:** `src/labs/canvas-notes/MarkdownNote.jsx` (fill in the
  textarea/toolbar/preview content), `PageCanvas.jsx` (the `note` tool
  branch, `CUSTOM_PROPS`, `noteAnchors` state)
- **Change type:** add
- **Dependencies:** the overlay structure from the previous two units

#### The New Code

```js
// PageCanvas.jsx
const CUSTOM_PROPS = ['__id', '__isMarkdownAnchor', '__markdown']

// inside onLeavePage's call site:
onLeavePage(prevPageIdRef.current, canvas.toDatalessJSON(CUSTOM_PROPS))

// the note tool's mouse:down branch:
if (tool === 'note' && !opt.target) {
  const p = canvas.getScenePoint(opt.e)
  const anchor = new fabric.Rect({
    left: p.x, top: p.y, width: 260, height: 180,
    fill: 'rgba(0,0,0,0.02)', stroke: '#94a3b8', strokeDashArray: [4, 4],
  })
  anchor.__id = uid()
  anchor.__isMarkdownAnchor = true
  anchor.__markdown = ''
  canvas.add(anchor)
  refreshAnchors()
  onPlacementDone()
}
```

```jsx
// MarkdownNote.jsx — the content the previous unit's frame wraps
import MarkdownToolbar, { stripSnippetSyntax } from '../../components/markdown-toolbar/MarkdownToolbar.jsx'
import { preprocess } from '../../components/math/latexPreprocess.js'

const insertAtCursor = (btn) => {
  const raw = btn.plain ?? stripSnippetSyntax(btn.snippet) // no Monaco here — strip tabstop syntax it can't use
  const ta = textareaRef.current
  const start = ta.selectionStart, end = ta.selectionEnd
  commit(text.slice(0, start) + raw + text.slice(end))
}

const commit = (next) => {
  setText(next)
  anchor.__markdown = next // written straight onto the live fabric object
}
```

#### The Updated Project

`MarkdownNote.jsx` in full (as built this lesson):

```jsx
import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import 'katex/dist/katex.min.css'
import MarkdownToolbar, { stripSnippetSyntax } from '../../components/markdown-toolbar/MarkdownToolbar.jsx'
import { preprocess } from '../../components/math/latexPreprocess.js'

const NOTE_COMPONENTS = {
  h1: ({ children }) => <h1 style={{ fontSize: '1.3em', fontWeight: 700, margin: '0.4em 0' }}>{children}</h1>,
  p: ({ children }) => <p style={{ margin: '0.3em 0' }}>{children}</p>,
  strong: ({ children }) => <strong style={{ fontWeight: 700 }}>{children}</strong>,
  em: ({ children }) => <em>{children}</em>,
  // ...ul/ol/li/code, same compact-inline-style approach as StickyNote's preview mode
}

export default function MarkdownNote({ canvas, canvasElRef, anchor, initialText, onDelete }) {
  const overlayRef = useRef(null)
  const textareaRef = useRef(null)
  const [editing, setEditing] = useState(!initialText) // existing text opens in Preview, not Edit
  const [text, setText] = useState(initialText ?? '')

  useEffect(() => {
    // ...position-sync effect, first unit...
  }, [canvas, anchor, canvasElRef])

  const commit = (next) => {
    setText(next)
    anchor.__markdown = next
  }

  const insertAtCursor = (btn) => {
    const raw = btn.plain ?? stripSnippetSyntax(btn.snippet)
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    commit(text.slice(0, start) + raw + text.slice(end))
    requestAnimationFrame(() => {
      ta.focus()
      ta.selectionStart = ta.selectionEnd = start + raw.length
    })
  }

  return (
    <div ref={overlayRef} style={{ position: 'fixed', zIndex: 20, pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', inset: 8, pointerEvents: 'auto', display: 'flex', flexDirection: 'column' /* ... */ }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
          <button onClick={() => setEditing((e) => !e)}>{editing ? 'Preview' : 'Edit'}</button>
          <button onClick={onDelete}>✕</button>
        </div>
        {editing ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <MarkdownToolbar onInsert={insertAtCursor} />
            <textarea ref={textareaRef} value={text} onChange={(e) => commit(e.target.value)} style={{ flex: 1 }} />
          </div>
        ) : (
          <div style={{ flex: 1, overflow: 'auto', padding: 8 }}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]} components={NOTE_COMPONENTS}>
              {preprocess(text) || '*Empty note*'}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
```

#### Mechanical Walkthrough
- `stripSnippetSyntax` — a function this codebase already shipped
(`MarkdownToolbar.jsx`) specifically for callers with "no real snippet
support," documented in that file's own header comment as intended for a
- plain-`<textarea>` caller — this lesson is that caller's first real appearance.
- `btn.plain ?? stripSnippetSyntax(btn.snippet)` — established `??` (Lesson 1) — most toolbar buttons carry a Monaco tabstop snippet

like `**${1:text}**$0`; a plain textarea has no concept of tabstops, so
`stripSnippetSyntax` strips that syntax down to just `**text**` before
- insertion.
- `ta.selectionStart`/`selectionEnd` — a `<textarea>`'s own
native cursor-position properties, read to know where to splice the
inserted text into the existing string — first appearance in this
codebase's canvas-notes work, though it's the same idea Lesson 4 already
used on a *fabric* text object (`selectionStart`/`selectionEnd` there
too) — the same concept, on a native DOM element instead of a fabric
- one.
- `useState(!initialText)` for `editing` — computed once, at mount:
a brand-new note (no saved text yet) opens ready to type in; a note
being *reopened* with existing text opens showing the rendered preview,
since presumably the point of reopening it is to read it, not
immediately re-edit it.

#### CS Lens

Storing `__markdown` directly on the same fabric object that already
carries the note's position/size — rather than a separate lookup table
keyed by the anchor's id — keeps one object as the single source of
truth for everything about that note. **Recognized in:** a database row
that stores both a record's data and its own metadata (created-at,
owner) in the same row rather than a second joined table, when the two
are never meaningfully used apart; a file's inode storing both its
permissions and its data block pointers together, not in two separately
managed structures.

#### SE Lens

A separate `Map` (anchor id → markdown text) kept in `CanvasNotesPage`'s
- own state — mirroring how `pageCanvasData` already maps page id → canvas
JSON — was the alternative. It was rejected here because it would
duplicate state that already needs to travel with the fabric object
during serialization anyway (Lesson 2 already round-trips the *whole*
page as one JSON document); keeping `__markdown` on the object itself
means there's exactly one thing to save, not two things that have to
stay in sync with each other.

#### Connect to What Came Before

The first two units in this lesson made an HTML overlay track and stay
clickable over a fabric object. This unit is why any of that mattered:
without real content inside it, a perfectly-synced, perfectly
click-through-framed empty box teaches nothing. The markdown pipeline
itself needed zero new code to reuse — only a smaller, note-sized set of
rendering components than the lesson-page-styled ones `MarkdownProse.jsx`
already ships.

---

## Connect the Pieces

Clicking "Note" and then empty canvas (`DrawToolbar` + `PageCanvas`'s
tool effect) creates a `fabric.Rect` anchor, tagged `__isMarkdownAnchor`
and given an empty `__markdown` string, then calls `refreshAnchors()` so
`PageCanvas` renders a new `<MarkdownNote>` for it. That component's
first-unit effect keeps its overlay glued to the anchor's live position
by listening for `object:moving`/`object:scaling` and writing directly
into the DOM. Its second-unit structure (`pointer-events: none` frame,
inset interactive content) means a user can still grab fabric's native
resize handles at the object's exposed edge, exactly as freely as any
other object on the canvas. Typing into the `<textarea>`, using
`MarkdownToolbar` to insert symbols, and toggling Preview all write into
- `anchor.__markdown` directly (third unit) — so when the page-swap effect
(Lesson 2) calls `canvas.toDatalessJSON(CUSTOM_PROPS)` before leaving a
page, every note's text rides along automatically, needing no separate
tracking of its own.

## What Breaks Without This

Verified live, this session: temporarily calling `canvas.toDatalessJSON()`
with no argument (dropping `CUSTOM_PROPS`) and repeating the same
sequence — place a note, type text, switch pages, switch back — the note
anchor reappears in the right position (its built-in `left`/`top`/
`width`/`height` are always serialized) but reopens completely blank.
Nothing throws, nothing logs; the box is simply empty, and there is no
way to tell from the UI that anything was ever typed into it.

## Exercises

- Open two notes on the same page and drag one so it fully overlaps the
  other. Predict, then confirm, which one's resize handles you can
  actually reach with the mouse — and why.
- Delete a note (the ✕ button) and confirm `refreshAnchors()` actually
  removes its `<MarkdownNote>` from the page, not just the underlying
- fabric object — add a temporary `console.log(noteAnchors.length)`
  right before the `return` in `PageCanvas` to watch the array shrink.

## Definition of Done

- [ ] A "Note" tool places a `fabric.Rect` anchor with `__id`,
      `__isMarkdownAnchor`, and `__markdown` set
- [ ] `MarkdownNote`'s overlay stays positioned over its anchor through
      drags and resizes, without forcing a React re-render on every
      intermediate frame
- [ ] The overlay's outer frame is click-through (`pointer-events: none`)
      with only an inset content box interactive, so fabric's native
      resize handles remain reachable at the object's edge
- [ ] Typing markdown, toggling Preview, and inserting a toolbar symbol
      (via `stripSnippetSyntax`) all work against a plain `<textarea>`,
      with math/GFM rendering identical to `MarkdownProse`/`StickyNote`
- [ ] `toDatalessJSON` is always called with `CUSTOM_PROPS` wherever a
      page's canvas content is saved, so `__markdown` survives a page
      switch
- [ ] Verified live, this session: placing a note, typing rich markdown,
      previewing it, dragging it via its exposed border, switching pages
      away and back, and confirming the text and position both survive
- [ ] You reproduced the "note reopens blank" failure on purpose (by
      dropping `CUSTOM_PROPS`) and can explain why nothing errors
- [ ] You can state, without notes, why the overlay needs a click-through
      frame instead of just being a normal interactive `<div>`
- [ ] `git commit` with a message explaining why — for example: "Add
      Markdown-capable notes as an HTML overlay synced to a fabric.Rect
      anchor — pointer-events:none frame with an inset interactive
      content box keeps fabric's own resize handles reachable; note text
      lives on the anchor object itself (__markdown) so it round-trips
      through toDatalessJSON automatically"
