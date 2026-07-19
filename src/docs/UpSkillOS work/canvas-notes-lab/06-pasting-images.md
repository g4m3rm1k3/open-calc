# Lesson 6 — Pasting an Image Straight Onto the Canvas

## What You Will Build

`⌘V`/`Ctrl+V` over a canvas-notes page now checks the system clipboard
for an image and, if it finds one, drops it onto the canvas centered and
scaled to a sane size — no toolbar button, no file picker, just copy
something (a screenshot, an image from another app or a webpage) and
paste. This is the first feature in this app's canvas work to touch the
Clipboard API at all — nothing here is a rename of an existing pattern.

## What You Need to Know First

`canvas-notes-lab/01-...md` through `05-...md` — assumed fresh,
especially Lesson 2's page-swap effect (this lesson's image ends up
inside the same JSON that effect already saves and loads) and Lesson
5's "why a data URL, not a live object reference" reasoning around
`__markdown` (this lesson hits the same fork in the road, for images
instead of text).

---

## The Lesson

### Where You're Working

One modified file: `PageCanvas.jsx` gets one new effect — a
document-level `paste` listener — with no new component files needed.

### Concept Unit: Reading an Image Out of the System Clipboard

#### The Problem

A paste anywhere on the page fires a browser `ClipboardEvent`, but that
event doesn't hand you an image directly — clipboard contents can be
plain text, HTML, files, or images, and the event exposes all of them
uniformly through one API that has to be filtered and unwrapped before
there's an actual image to do anything with.

#### Introduce the Concept in Isolation

```js
// Build a real File the same way an actual clipboard image arrives as,
// then wrap it in a genuine ClipboardEvent — not a mock, the real
// browser API a paste produces.
const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFUlEQVR42mNk+M9QDwAExwHm8OK4pQAAAABJRU5ErkJggg=='
const blob = await (await fetch(dataUrl)).blob()
const file = new File([blob], 'test.png', { type: 'image/png' })

const dt = new DataTransfer()
dt.items.add(file)
document.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true }))
```

Run against the real app (this session), with a `paste` listener already
attached to `document`, and object count read straight from the live
fabric canvas before and after:

```
Objects before paste: 0
Dispatched synthetic paste event: true
Objects after paste: { count: 1, lastType: 'image', left: 399, top: 299 }
```

**What this proves:** `event.clipboardData.items` is a list where each
entry carries a MIME `type` string (`"image/png"`, `"text/plain"`,
etc.) — filtering for `item.type.startsWith('image/')` finds the one
that's actually a picture, regardless of what else was also on the
clipboard. `item.getAsFile()` turns that clipboard entry into a real
`File` object — the same type produced by a `<input type="file">` or a
drag-and-drop drop event — meaning everything downstream (reading it,
turning it into an image) works identically no matter which of those
three ways the file arrived.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/PageCanvas.jsx`
- **Change type:** add (new effect)
- **Dependencies:** none — this listens on `document`, independent of `tool`/page state

#### The New Code

```js
useEffect(() => {
  const handlePaste = (e) => {
    const tag = document.activeElement?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return
    const canvas = fabricRef.current
    if (!canvas) return

    const items = e.clipboardData?.items
    if (!items) return
    const imageItem = [...items].find((item) => item.type.startsWith('image/'))
    if (!imageItem) return

    const file = imageItem.getAsFile()
    // ...FileReader + fabric.FabricImage.fromURL, next unit...
  }
  document.addEventListener('paste', handlePaste)
  return () => document.removeEventListener('paste', handlePaste)
}, [])
```

#### The Updated Project

(Shown in full at the end of this lesson, once the next unit fills in
what happens to `file` after this point.)

#### Mechanical Walkthrough

`document.activeElement?.tagName` — established
(`SvgStudioPage.jsx`'s keyboard-shortcut effect already guards the same
way before acting on Delete/⌘Z/etc.) — reused here for a new event type:
if focus is inside a real text input (a markdown note's `<textarea>`,
Lesson 5), the paste is left alone to do what a normal paste does —
insert text there — rather than being hijacked into adding an image to
the canvas underneath it. `[...items].find(...)` — spreading an
"array-like" (`DataTransferItemList` isn't a real `Array`, so it has no
`.find()` of its own) into a real array first, then using the
already-established `.find()` (`lab-registry-autofind/01-...md`) —
first time this codebase has needed to convert a browser API's
list-like object into a proper array before using array methods on it.

#### CS Lens

The clipboard exposing several *representations* of the same copied
content (plain text, HTML, an image, sometimes more at once) and
letting the receiving app pick whichever it can use is the same idea as
HTTP content negotiation (`Accept:` headers letting a client request
`application/json` or `text/html` from the same URL) or a file's
multiple possible encodings — **recognized in:** copying a cell from a
spreadsheet, which places both a plain-text number and a
rich-formatted-table representation on the clipboard simultaneously, so
pasting into a text editor and pasting into another spreadsheet each get
the representation that actually makes sense for them.

#### SE Lens

Reading directly from `document`'s `paste` event, rather than adding an
explicit "Upload Image" button with a hidden `<input type="file">`
(the pattern `SvgStudioPage.jsx` already uses for importing SVGs), is a
deliberate choice about the physical action a user has to take: a
button requires opening a file picker and navigating to a saved file; a
system clipboard paste supports a screenshot or an image copied from a
webpage with zero intermediate save-to-disk step. The two aren't
mutually exclusive — a future increment could add both — but paste was
built first here because it's the faster path for the single most
common case (screenshot → sticky note), while an upload button remains
a reasonable, low-cost addition later.

#### Connect to What Came Before

Lesson 3's eraser was the first tool to read something off a fabric
*event* (`opt.target`) rather than tracking state itself. This unit
reads something off a *browser* event instead — the same instinct
(don't track what the platform already hands you for free), applied to
a new event source.

---

### Concept Unit: A Data URL, Not a Live Object Reference

#### The Problem

A `File` object is a handle to binary data sitting in memory (or on
disk) — it isn't something fabric can draw directly, and more
importantly, it isn't something that survives being turned into a JSON
string. Lesson 2 already established that saving a page means calling
`canvas.toDatalessJSON(...)` and getting back something serializable.
Whatever format the pasted image ends up in has to survive that trip.

#### Introduce the Concept in Isolation

Two real, competing ways to turn a `File`/`Blob` into something an
`<img>` or `fabric.Image` can load from:

```js
const objectUrl = URL.createObjectURL(file)   // e.g. "blob:http://localhost:5173/3fa8..."
// vs.
const reader = new FileReader()
reader.onload = () => console.log(reader.result.slice(0, 40) + '...')
reader.readAsDataURL(file)                    // e.g. "data:image/png;base64,iVBORw0KGgo..."
```

**What this proves (reasoning from each format's actual shape, not a
guess):** `URL.createObjectURL` returns a short reference string
(`blob:...`) that only means something *inside this same browser tab,
this same page load* — it points at an in-memory blob registry that
doesn't exist anymore after a reload, and would be meaningless if
written into a JSON file and read back later. `FileReader.readAsDataURL`
instead returns the *entire image, re-encoded as base64 text*, embedded
directly in the string itself — longer, but completely self-contained:
it means exactly the same thing today, tomorrow, or inside a JSON blob
saved to a database (Increment 7's exact use case).

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/PageCanvas.jsx`
- **Change type:** add (completes the `handlePaste` function)
- **Dependencies:** previous unit's `file`

#### The New Code

```js
const reader = new FileReader()
reader.onload = () => {
  fabric.FabricImage.fromURL(reader.result).then((img) => {
    if (img.width > 400) img.scaleToWidth(400)
    img.set({
      left: CANVAS_W / 2 - img.getScaledWidth() / 2,
      top: CANVAS_H / 2 - img.getScaledHeight() / 2,
    })
    canvas.add(img)
    canvas.requestRenderAll()
  })
}
reader.readAsDataURL(file)
```

#### The Updated Project

```js
// Paste an image straight from the system clipboard onto the canvas.
// Skipped entirely while focus is inside a real text input (typing into a
// markdown note, or a section/page title) — a paste there should paste
// text into that field, not add an image to the canvas underneath it.
useEffect(() => {
  const handlePaste = (e) => {
    const tag = document.activeElement?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return
    const canvas = fabricRef.current
    if (!canvas) return

    const items = e.clipboardData?.items
    if (!items) return
    const imageItem = [...items].find((item) => item.type.startsWith('image/'))
    if (!imageItem) return

    const file = imageItem.getAsFile()
    const reader = new FileReader()
    reader.onload = () => {
      // A data URL, not URL.createObjectURL — it has to survive
      // toDatalessJSON/loadFromJSON as a plain string (Increment 7 needs
      // this same data URL to still be valid after a full page reload).
      fabric.FabricImage.fromURL(reader.result).then((img) => {
        if (img.width > 400) img.scaleToWidth(400)
        img.set({
          left: CANVAS_W / 2 - img.getScaledWidth() / 2,
          top: CANVAS_H / 2 - img.getScaledHeight() / 2,
        })
        canvas.add(img)
        canvas.requestRenderAll()
      })
    }
    reader.readAsDataURL(file)
  }
  document.addEventListener('paste', handlePaste)
  return () => document.removeEventListener('paste', handlePaste)
}, [])
```

Real output, verified this session, pasting a generated 800×600 image:
```
Large (800px) image after paste — should be scaled down to 400:
{ scaledWidth: 400, naturalWidth: 800, scaleX: 0.5 }
```

And separately, confirming the focus guard from the previous unit:
```
Objects before: 1 | after pasting into the textarea: 1 | unchanged (expected true): true
```

#### Mechanical Walkthrough

`fabric.FabricImage.fromURL(...)` — first appearance; loads an image
asynchronously from any URL a browser `<img>` tag could load from
(including, as used here, a `data:` URL) and returns a `Promise`
resolving to a real fabric object once decoded — the same
Promise-returning shape Lesson 2 already learned to respect for
`loadFromJSON`, now seen on a second fabric method. `img.width > 400` —
`width` here is the image's *natural* pixel dimensions before any
scaling, established as the same distinction Lesson 4's mechanical
walkthrough drew between an object's raw dimensions and its *scaled*
ones. `scaleToWidth(400)` sets `scaleX`/`scaleY` together so the image
shrinks proportionally — never stretches out of its original aspect
ratio. `CANVAS_W / 2 - img.getScaledWidth() / 2` — centers the image by
subtracting half its (post-scale) width from half the canvas's width,
the standard "center a box of known size inside a box of known size"
formula, applied here for the first time in this codebase's canvas
work.

#### CS Lens

Choosing a self-contained, portable encoding (base64 text embedded
directly in the data) over a cheap-but-context-dependent reference
(`blob:` URL, valid only within this exact process) is the same
tradeoff behind email attachments (base64-encoded directly into the
message, so the message means the same thing on any mail server) versus
a link to a file on a specific computer's disk; or an HTML page
embedding a small image as a base64 `data:` URI specifically so the
page has no external dependency at all, versus a normal `<img src="...">`
pointing at a URL that has to still be reachable later.

#### SE Lens

The real cost of `readAsDataURL` is size: base64 encoding inflates
binary data by roughly a third, and the resulting string lives directly
inside whatever JSON blob this page's canvas content gets serialized
into (Lesson 2's `toDatalessJSON`) — a page with several pasted
screenshots produces a noticeably larger saved document than one with
none. `URL.createObjectURL` has no such inflation and is nearly free,
but only within the lifetime of the current page load. Given this
feature's entire point is that a pasted image *persists* across a page
switch and, starting next lesson, a full page reload, the data URL's
size cost is accepted deliberately — the alternative isn't cheaper, it's
simply broken for this use case.

#### Connect to What Came Before

Lesson 5 made the exact same choice for a different reason: storing
`__markdown` as a plain string directly on the fabric object, rather
than a reference to something that only exists in memory, is what let
it survive `toDatalessJSON` untouched. This lesson's data URL is the
same principle again — if something has to survive being written down
and read back later, it has to be *representable as data*, not a
pointer to something that only means something right now.

---

## Connect the Pieces

Copying an image (a screenshot, or an image from another app or
webpage) and pressing paste over a canvas-notes page fires a
document-level `paste` event. The listener built in this lesson first
checks whether focus is inside a real text field (skipping entirely if
so, so typing into a Lesson 5 note is never interrupted), then digs the
actual image `File` out of `event.clipboardData.items` (first unit).
`FileReader.readAsDataURL` turns that file into a self-contained base64
string (second unit) — deliberately, not the cheaper
`URL.createObjectURL`, because this string needs to still mean the same
thing after `toDatalessJSON` writes it into this page's saved JSON and
`loadFromJSON` reads it back later (Lesson 2). `fabric.FabricImage.fromURL`
loads that string into a real fabric object, which gets scaled down if
oversized and centered on the canvas — landing exactly where any other
tool-placed object would, ready to be dragged, resized, or erased like
anything else on the page.

## What Breaks Without This

Verified conceptually and by direct comparison this session (not by
reverting and re-running, since the failure here is about a format
choice, not a crash): swapping `readAsDataURL` for
`URL.createObjectURL(file)` produces a URL that *works immediately* —
the image appears on the canvas exactly the same as before, since the
current page load's blob registry is still alive. The failure would
only surface at the exact moment Lesson 2's `toDatalessJSON` serializes
the page and, later, something reloads that JSON in a *new* page load
(a browser refresh, or Increment 7's persistence layer restoring a
saved notebook) — the `blob:` URL would no longer point at anything,
and the image would fail to load silently, the same "quietly missing,
not crashed" failure shape Lesson 5's dropped `__markdown` produced.

## Exercises

- Paste the same image twice in a row. Predict where the second copy
  lands relative to the first (hint: re-read the centering formula) and
  confirm.
- Change the size threshold from `400` to `150` and paste a small
  (under 150px) image. Confirm it does *not* get scaled — `scaleToWidth`
  is only called conditionally, never unconditionally.

## Definition of Done

- [ ] A `paste` listener on `document` checks
      `event.clipboardData.items` for an image, skipping entirely when
      focus is inside an `INPUT`/`TEXTAREA`
- [ ] The image is read via `FileReader.readAsDataURL`, not
      `URL.createObjectURL` — verified by inspecting the string fabric
      actually receives
- [ ] Oversized images are scaled down (`scaleToWidth`) preserving
      aspect ratio; images already under the threshold are left alone
- [ ] The pasted image is centered on the canvas using its *scaled*
      dimensions, not its natural ones
- [ ] Verified live, this session: a synthetic but real `ClipboardEvent`
      with a real `File` correctly adds a `fabric.Image` at the expected
      centered position; pasting while a note's textarea is focused adds
      nothing; an oversized image is measurably scaled down
- [ ] You can state, without notes, why `URL.createObjectURL` would
      silently break this specific feature and exactly when that
      breakage would surface (not immediately — only after a reload)
- [ ] `git commit` with a message explaining why — for example: "Add
      clipboard image paste to canvas-notes — images are read via
      FileReader.readAsDataURL rather than URL.createObjectURL so the
      resulting string survives toDatalessJSON and a later reload,
      matching the same self-contained-data reasoning Lesson 5 used for
      note text"
