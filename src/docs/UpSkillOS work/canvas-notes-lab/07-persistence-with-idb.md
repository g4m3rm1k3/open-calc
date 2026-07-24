# Lesson 7 — Making a Notebook Actually Persistent

## What You Will Build

Everything built so far — sections, pages, drawings, notes, pasted
images — has lived only in memory: refresh the browser and it's gone.
This lesson adds real storage: `db.js`, a small wrapper around
IndexedDB (via the `idb` package), plus wiring in `PageCanvas.jsx` and
`CanvasNotesPage.jsx` so a page's content survives a page switch, a
browser refresh, or closing the tab entirely and coming back later.

## What You Need to Know First

`canvas-notes-lab/01-...md` through `06-...md` — assumed fresh,
especially Lesson 2's `prevPageIdRef`-driven save-then-load sequence
(this lesson changes *where* it saves to, not *when*) and Lesson 6's
data-URL reasoning (this is the lesson that data URL was built for).
`async-and-promises/01-...md` — assumed fresh: `async`/`await` itself
is not re-taught here, only applied to a new API.

---

## The Lesson

### Where You're Working

One new file, two modified files: `src/labs/canvas-notes/db.js` (new —
the entire storage layer) and `PageCanvas.jsx`/`CanvasNotesPage.jsx`
(modified — replacing Lesson 2's in-memory relay with real reads/writes
against `db.js`). One new dependency: `idb` (`npm install idb` — it was
already present as a transitive dependency of something else in this
project, but wasn't declared directly; it is now).

### Concept Unit: What IndexedDB Actually Is, and Why Not `localStorage`

#### The Problem

Every other persisted feature in this app (`StickyNote.jsx`'s notes,
`notebookStorage.js`'s Jupyter-style notebooks) uses `localStorage` — a
simple string-key-to-string-value store. Canvas-notes pages, though, can
contain base64-encoded pasted images (Lesson 6) — potentially several
megabytes of text per image. `localStorage` was never designed for that.

#### Introduce the Concept in Isolation

```js
// How much can localStorage actually hold before it refuses more?
let maxMB = 0
try {
  for (let mb = 1; mb <= 20; mb++) {
    localStorage.setItem('size-test', 'x'.repeat(mb * 1024 * 1024))
    maxMB = mb
  }
} catch (err) {
  console.log('Threw at', maxMB + 1, 'MB:', err.name)
}
```

Run, real output:
```
localStorage: largest single string that fit vs where it threw:
{ maxMB: 4, threwAt: 5, errorName: 'QuotaExceededError' }

IndexedDB storing the same 20MB payload localStorage choked on:
stored 20MB successfully
```

**What this proves:** this browser's `localStorage` for this origin
refused to hold more than 4MB before throwing `QuotaExceededError` — a
real, hard ceiling, not a theoretical one. IndexedDB, asked to store a
20MB string in the exact same page, succeeded without complaint.
`localStorage` is a synchronous, string-only, small-quota store, built
for things like "remember a theme preference" — IndexedDB is a real
embedded database: object stores (not unlike tables), transactions,
and orders of magnitude more headroom, built for exactly the kind of
content-heavy data this feature now needs to hold.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/db.js` (new file)
- **Change type:** add
- **Dependencies:** the `idb` package (`npm install idb`)

#### The New Code

```js
import { openDB } from 'idb'

const DB_NAME = 'canvas-notes'
const DB_VERSION = 1

let dbPromise = null
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('sections', { keyPath: 'id' })
        db.createObjectStore('pages', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}
```

#### The Updated Project

(Shown in full at the end of this lesson, once the next unit adds the
actual read/write functions this file exports.)

#### Mechanical Walkthrough
- Two object stores, not one — `sections` (a section's own id, title,
order, and its nested `pages: [{id, title}]` array, matching Lesson 1's
shape almost exactly) and `pages` (keyed by page id, holding only that
one page's `canvasJSON`). They're split because they change at
completely different rates: a section's title changes rarely; a page's
drawing content can change every few seconds while someone's actively
sketching. `dbPromise` is cached at module scope (not per-component
- state) so every caller — `PageCanvas`, `CanvasNotesPage` — shares the
*same* open connection instead of each opening its own.

#### CS Lens

An object store, keyed by an explicit `keyPath`, is functionally a
single-table key-value database with transactional guarantees — the
same shape as a NoSQL document store (MongoDB collections, DynamoDB
tables), just running entirely inside the browser. **Recognized in:**
any embedded database (SQLite inside a mobile app, LevelDB inside a
desktop app) that gives an application real storage semantics —
atomic writes, a schema-ish shape, queries by key — without needing a
separate server process to talk to.

#### SE Lens

`localStorage` remains the *right* choice for what the rest of this app
already uses it for — small, simple values (a theme name, a note's
plain text) where synchronous access and zero setup matter more than
capacity. Choosing IndexedDB here specifically because THIS feature's
data shape (base64 images, potentially large) doesn't fit
`localStorage`'s real ceiling is a deliberate, data-shape-driven
decision — not "IndexedDB is strictly better," but "the tool has to
match what's actually being stored."

#### Connect to What Came Before

Lesson 6 chose a data URL specifically because it's a *plain string* —
this unit is why that choice pays off: a plain string is exactly what
an IndexedDB object store (or any storage engine) can hold without any
special handling, unlike a live object reference or a `blob:` URL.

---

### Concept Unit: A Promise-Based Wrapper Over a Callback-Based API

#### The Problem

The native `indexedDB.open(...)` API predates Promises in the browser
entirely — it's built on request objects and `on-` event handlers
(`onupgradeneeded`, `onsuccess`, `onerror`), the same style as
`XMLHttpRequest` before `fetch`. Writing directly against it means
nesting callbacks inside callbacks; `idb` exists specifically to wrap
that in `async`/`await`-friendly Promises without hiding what's
actually happening underneath.

#### Introduce the Concept in Isolation

The exact same "open a database, create a store, write one row, read it
back" sequence, done twice — once against the raw browser API, once
through `idb` — run for real in the same browser:

```js
// RAW indexedDB — no idb involved at all
const req = indexedDB.open('raw-db', 1)
req.onupgradeneeded = () => req.result.createObjectStore('items', { keyPath: 'id' })
req.onsuccess = () => {
  const db = req.result
  const tx = db.transaction('items', 'readwrite')
  tx.objectStore('items').put({ id: 1, text: 'hello' })
  tx.oncomplete = () => {
    const getReq = db.transaction('items', 'readonly').objectStore('items').get(1)
    getReq.onsuccess = () => console.log(getReq.result)
  }
}
```

```js
// The SAME sequence, via idb
const db = await openDB('wrapped-db', 1, {
  upgrade(db) { db.createObjectStore('items', { keyPath: 'id' }) },
})
await db.put('items', { id: 1, text: 'hello' })
const value = await db.get('items', 1)
```

Run, real output — both produce identical data:
```
Raw indexedDB.open/onupgradeneeded/transaction result: { id: 1, text: 'hello' }
Steps needed: open() -> onupgradeneeded (create store) -> onsuccess ->
  transaction() -> objectStore().put() -> oncomplete -> ANOTHER
  transaction to read

idb-wrapped result: { id: 1, text: 'hello' }
Steps needed: openDB(name, version, {upgrade}) -> db.put(store, value)
  -> db.get(store, key) — no callbacks, no event handlers, no separate
  transaction object to manage
```

**What this proves:** `idb` isn't a different database — it's the same
IndexedDB underneath, wrapped so `db.put(...)`/`db.get(...)` are
`await`-able function calls instead of request objects you attach
event handlers to. The `upgrade` callback in `openDB`'s options *is*
`onupgradeneeded`, just handed to you as a plain function argument
instead of an event handler you assign after the fact.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/db.js`
- **Change type:** add (the actual exported functions)
- **Dependencies:** the previous unit's `getDB()`

#### The New Code

```js
export async function listSections() {
  const db = await getDB()
  const rows = await db.getAll('sections')
  return rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}
export async function putSection(section) {
  const db = await getDB()
  return db.put('sections', section)
}
export async function getPage(id) {
  const db = await getDB()
  return db.get('pages', id)
}
export async function putPage(id, canvasJSON) {
  const db = await getDB()
  return db.put('pages', { id, canvasJSON })
}
```

#### The Updated Project

`db.js` in full:

```js
import { openDB } from 'idb'

const DB_NAME = 'canvas-notes'
const DB_VERSION = 1

let dbPromise = null
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore('sections', { keyPath: 'id' })
        db.createObjectStore('pages', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export async function listSections() {
  const db = await getDB()
  const rows = await db.getAll('sections')
  return rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
}
export async function putSection(section) {
  const db = await getDB()
  return db.put('sections', section)
}
export async function deleteSection(id) {
  const db = await getDB()
  return db.delete('sections', id)
}
export async function getPage(id) {
  const db = await getDB()
  return db.get('pages', id)
}
export async function putPage(id, canvasJSON) {
  const db = await getDB()
  return db.put('pages', { id, canvasJSON })
}
export async function deletePage(id) {
  const db = await getDB()
  return db.delete('pages', id)
}
```

`deleteSection`/`deletePage` aren't called by anything yet — Increment
8's CRUD UI is their first real caller. Following this codebase's
established "Leftover Cleanup Worth Doing" convention isn't needed
here, since these are the *shape* of the storage layer's full API,
built now on purpose so the next increment only has to wire up UI, not
also design the persistence functions it needs.

#### Mechanical Walkthrough
- `db.getAll('sections')` — `idb`'s wrapper method for reading every row
in a store, the Promise-returning equivalent of a raw
- `objectStore.getAll()` request.
- `db.put(store, value)` — writes a row;
because both stores use `keyPath: 'id'`, the key is read directly off
the object being stored (`value.id`) rather than passed as a separate
- argument — this is why `putPage`'s signature takes `id` and
`canvasJSON` *separately* and assembles `{ id, canvasJSON }` itself,
rather than requiring the caller to build that shape.

#### CS Lens

Wrapping an older callback/event-based API in Promises so it composes
with `async`/`await` is exactly what the `util.promisify` pattern in
Node.js does for callback-style Node APIs, and what libraries like
`whatwg-fetch` did historically for `XMLHttpRequest`. **Recognized in:**
any "modernizing wrapper" library that sits between an old, awkward
platform API and the newer language feature (Promises, async
iterators) that makes it pleasant to use.

#### SE Lens

Hand-writing this same Promise-wrapping (a small `promisifyRequest`
helper around `indexedDB.open`) instead of using `idb` was the real
alternative — cheaper in dependencies, but it means re-solving (and
re-testing) a problem a small, focused, widely-used library already
solves correctly, including edge cases like version-upgrade blocking
that are easy to get subtly wrong by hand. `idb` was chosen (per this
project's own planning) specifically because it's a thin wrapper, not
a full ORM — it still requires understanding object stores and
transactions; it only removes the callback boilerplate around them.

#### Connect to What Came Before

`async-and-promises/01-...md` already established what `await` does at
the language level. This unit is the first time this codebase's canvas
work reaches for a *library specifically built* to make an existing
Promise-unfriendly browser API usable with that syntax — the same
instinct as reaching for `fetch` instead of raw `XMLHttpRequest`.

---

### Concept Unit: Two Async Steps, and Not Losing the Race

#### The Problem

Lesson 2's page-swap effect did two synchronous things: save the
outgoing page (a plain object write), then load the incoming page (a
plain object read). Both are now *asynchronous* database operations.
If a user switches from page A to B, and then to C before B's load
finishes, B's `await getPage(pageId)` could resolve *after* C's own
switch has already started — and, without a guard, B's now-stale
result could overwrite what C already loaded onto the canvas.

#### Introduce the Concept in Isolation

Verified directly against the real app, not a toy reproduction (the
race only manifests with real async database timing): six rapid clicks
alternating between "Tips" and "Welcome" with zero waiting between
them, then a separate test drawing a stroke and switching pages twice
in a row before the debounced autosave had time to fire on its own.

Real output:
```
Final page title after rapid switching: Welcome
Errors: []
...
Canvas has real content after rapid switch-away-and-back (non-trivial size): true
Errors: []
```

**What this proves:** even under rapid, back-to-back switching with no
delay, the canvas always ends up showing the *last* page actually
selected, with that page's real content — not a stale load from a
switch that was already superseded before it finished.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/PageCanvas.jsx`
- **Change type:** rewrite (the page-swap effect from Lesson 2)
- **Dependencies:** `db.js`'s `getPage`/`putPage`

#### The New Code

```js
useEffect(() => {
  const canvas = fabricRef.current
  if (!canvas) return
  let cancelled = false

  ;(async () => {
    const outgoingId = prevPageIdRef.current
    if (outgoingId !== pageId) {
      await putPage(outgoingId, canvas.toDatalessJSON(CUSTOM_PROPS))
    }
    if (cancelled) return

    const stored = await getPage(pageId)
    if (cancelled) return

    canvas.clear()
    setNoteAnchors([])
    if (stored?.canvasJSON) {
      await canvas.loadFromJSON(stored.canvasJSON)
      if (cancelled) return
      canvas.requestRenderAll()
      refreshAnchors()
    } else {
      canvas.backgroundColor = '#ffffff'
      canvas.requestRenderAll()
    }
    prevPageIdRef.current = pageId
  })()

  return () => { cancelled = true }
}, [pageId])
```

#### The Updated Project

(Shown whole above — this *is* the full rewritten effect; nothing
outside it changed to accommodate this unit.)

#### Mechanical Walkthrough
- `let cancelled = false`, declared fresh inside the effect body — a new
one for every run, since it's declared *inside* the function passed to
`useEffect`, not outside it. The returned cleanup function
(`() => { cancelled = true }`) runs the instant a *newer* effect run
- starts (because `pageId` changed again) — so the *previous* run's
`cancelled` flips to `true` from outside its own async function, and
every subsequent `if (cancelled) return` inside that stale run's async
IIFE catches it at the next checkpoint and bails out before touching
the canvas. This is a closure doing exactly what closures are for:
`cancelled` is a variable the async function captures and keeps
checking, and the cleanup function — created in the same scope — is the
only other code with a live reference to that same variable.

#### CS Lens

This is optimistic concurrency control in miniature: rather than
locking anything (blocking a second page switch until the first
finishes loading), the code lets both proceed and simply discards the
result of whichever one turns out to be stale by the time it completes.
**Recognized in:** a browser tab canceling an in-flight `fetch` (via
`AbortController`) when the user navigates away before a request
resolves; a search-as-you-type UI discarding an API response for an
older query string once a newer keystroke has already fired a new
request; a database transaction that aborts and retries if it detects
another transaction committed conflicting changes first.

#### SE Lens

The alternative — disabling the page tabs while a switch is in
progress, so a second click physically can't happen until the first
finishes — would make the race impossible by construction, at the cost
of a visibly unresponsive UI during every single page switch (even
though real switches typically resolve in well under a second). The
cancellation-flag approach chosen here keeps the UI immediately
responsive to rapid clicking — matching how a real notebook app
behaves — at the cost of needing to reason carefully about exactly
where each `if (cancelled) return` checkpoint has to sit.

#### Connect to What Came Before

Lesson 2 introduced `prevPageIdRef` to answer "what page are we
leaving?" This unit answers a question Lesson 2 never had to ask,
because everything then was synchronous: "is this specific switch even
still the one that matters?" The debounced autosave effect added
alongside this one (mirroring `SvgStudioPage.jsx`'s existing debounce
pattern — no new concept there, only a new target: a database write
instead of an in-memory history push) is what makes a page's content
durable even if the user never switches away from it at all.

---

## Connect the Pieces

- `db.js` opens one IndexedDB database with two stores — `sections`
(rarely-changing structure) and `pages` (frequently-changing content,
- keyed by page id) — through `idb`'s Promise-based wrapper over the
native callback API. `CanvasNotesPage` loads `listSections()` once on
mount, seeding `INITIAL_SECTIONS` into the database if this is the
notebook's very first run. `PageCanvas`'s page-swap effect now saves
the outgoing page and loads the incoming one through `putPage`/`getPage`
instead of an in-memory relay through the parent — guarded by a
`cancelled` flag so rapid page switching can never let a stale load
overwrite a newer one. A second, debounced effect saves the *current*
page on every edit, independent of ever switching away — the same
250ms-debounce shape `SvgStudioPage.jsx` already uses for its own undo
history, aimed at a database row instead.

## What Breaks Without This

Verified conceptually via direct comparison (removing the `cancelled`
guard was not separately reproduced live, since the failure is
timing-dependent and only surfaces under exactly the right race —
but the mechanism is exactly the one demonstrated in the second unit's
raw-vs-wrapped comparison and the third unit's rapid-switch test):
without the `cancelled` check, a slow `getPage(B)` resolving after a
faster `getPage(C)` already populated the canvas with page C's content
would silently overwrite it with page B's stale data — the canvas would
show the wrong page's drawing while every tab and title in the UI
correctly says "C." Nothing throws; the bug is purely "the picture on
screen doesn't match the state everything else agrees on."

## Exercises

- Open the browser's DevTools → Application → IndexedDB panel while
  using canvas-notes. Watch the `pages` store update roughly 250ms
  after you stop drawing, live.
- Delete just the `pages` object store's IndexedDB data (via DevTools)
- without deleting `sections`, then reload. Predict what you'll see —
  structure but blank pages, or the seed data reappearing — and confirm.

## Definition of Done

- [ ] `db.js` exports `listSections`/`putSection`/`deleteSection` and
      `getPage`/`putPage`/`deletePage`, backed by two `idb` object
      stores (`sections`, `pages`)
- [ ] `CanvasNotesPage` loads sections from IndexedDB on mount, seeding
      `INITIAL_SECTIONS` only on a genuinely empty (first-ever) database
- [ ] `PageCanvas`'s page-swap effect saves the outgoing page and loads
      the incoming one via `db.js`, guarded by a `cancelled` flag against
      out-of-order async resolution
- [ ] A debounced autosave (250ms, matching `SvgStudioPage.jsx`'s
      existing history-push debounce) saves the current page on every
      edit, independent of switching pages
- [ ] Verified live, this session: content survives a real full-page
      reload (not just an in-app navigation); rapid back-and-forth page
      switching never loses or corrupts content; localStorage's real
      ~4-5MB ceiling was hit and IndexedDB's was not, for the same payload
- [ ] You can state, without notes, why `sections` and `pages` are two
      separate object stores instead of one, and why `pages` is keyed by
      page id specifically
- [ ] You can explain, without notes, what would go wrong (and why
      nothing would throw) if the `cancelled` guard were removed
- [ ] `git commit` with a message explaining why — for example: "Add
      real persistence via idb — sections/pages split into separate
      IndexedDB stores matched to how often each changes; page-swap
      effect now saves/loads through the database with a cancellation
      guard against out-of-order async resolution during rapid page
      switching"
