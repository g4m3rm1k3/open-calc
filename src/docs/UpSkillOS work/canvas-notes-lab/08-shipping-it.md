# Lesson 8 — Shipping It

## What You Will Build

The last piece: real add/rename/delete for both tabs levels, wired to
`db.js`, plus a direct confirmation that `canvas-notes` is reachable
from the exact same places every other lab is — the Start Menu search,
the Labs gallery — through nothing but the `meta.js` file
`lab-registry-autofind/01-...md` established as the whole registration
mechanism, back at the very start of this two-piece plan. This is the
"shipping it" capstone: mostly composing everything already built,
plus one real bug found and fixed along the way.

## What You Need to Know First

Every prior lesson in `canvas-notes-lab/` and `lab-registry-autofind/`
— assumed fresh. Nothing new is introduced at the language or API
level in this lesson; it's composition of established pieces.

---

## The Lesson

### Where You're Working

Two modified files: `SectionTabs.jsx` and `PageTabs.jsx` each gain
inline rename (double-click), delete (a hover-revealed ✕), and an add
button. `CanvasNotesPage.jsx` gains the six handler functions that
actually mutate `sections` state and call `db.js`.

### Concept Unit: An Invariant Two Components Already Assumed

#### The Problem

`PageTabs` renders `activeSection?.pages ?? []` and the content area
reads `activeSection?.pages.find(...)`. Nothing anywhere in this
codebase ever checked "what if a section has zero pages?" — because
until this lesson, nothing could ever *make* that true. The moment
delete exists, that assumption becomes something real code has to
actively protect, not just something that happened to always be true.

#### Introduce the Concept in Isolation

```js
// Two ways to handle "the user is about to break an assumption the rest
// of the app depends on": prevent it, or handle it everywhere it's read.
function deleteLastPageOptionA(section, pageId) {
  if (section.pages.length <= 1) return section // refuse — invariant never breaks
  return { ...section, pages: section.pages.filter((p) => p.id !== pageId) }
}

function deleteLastPageOptionB(section, pageId) {
  return { ...section, pages: section.pages.filter((p) => p.id !== pageId) } // always allow
}

const section = { id: 's1', pages: [{ id: 'p1', title: 'Only Page' }] }
console.log('Option A (refuse):', deleteLastPageOptionA(section, 'p1'))
console.log('Option B (allow):', deleteLastPageOptionB(section, 'p1'))
```

Run, real output:
```
Option A (refuse): { id: 's1', pages: [ { id: 'p1', title: 'Only Page' } ] }
Option B (allow): { id: 's1', pages: [] }
```

**What this proves:** Option B produces a section with `pages: []` —
syntactically valid, but every other component built across this whole
lesson series (`PageTabs`, the content area's `activeSection?.pages.find(...)`,
`PageCanvas`'s assumption that `activePageId` is either a real id or
`null`) would now have to handle "a section that exists but has nothing
in it," a case none of them were written against. Option A keeps the
invariant true by construction — cheaper to verify (one `if`, in exactly
the two places that can violate it) than auditing every existing reader
for a case that used to be impossible.

#### Discard the Throwaway Example

#### Project Change

- **Files:** `CanvasNotesPage.jsx`
- **Change type:** add (delete handlers)
- **Dependencies:** `db.js`'s `deleteSection`/`deletePage`

#### The New Code

```js
const handleDeleteSection = async (id) => {
  if (sections.length <= 1) return
  const section = sections.find((s) => s.id === id)
  await deleteSection(id)
  await Promise.all(section.pages.map((p) => deletePage(p.id)))
  const remaining = sections.filter((s) => s.id !== id)
  setSections(remaining)
  if (activeSectionId === id) {
    setActiveSectionId(remaining[0].id)
    setActivePageId(remaining[0].pages[0]?.id ?? null)
  }
}

const handleDeletePage = async (id) => {
  const section = sections.find((s) => s.id === activeSectionId)
  if (!section || section.pages.length <= 1) return
  await deletePage(id)
  const updated = { ...section, pages: section.pages.filter((p) => p.id !== id) }
  await putSection(updated)
  setSections((prev) => prev.map((s) => (s.id === section.id ? updated : s)))
  if (activePageId === id) {
    setActivePageId(updated.pages[0]?.id ?? null)
  }
}
```

#### The Updated Project

(Shown in full alongside every other handler in this lesson's "Connect
the Pieces" section — all six follow the same shape: mutate through
`db.js` first, then mirror the same change into React state.)

#### Mechanical Walkthrough
`if (sections.length <= 1) return` / `if (!section || section.pages.length <= 1) return`
— both guards sit at the very top of their handler, before any
- `await` — refusing the operation entirely rather than performing it
and then trying to recover from an invalid resulting state. Both
`deleteSection` and `Promise.all(section.pages.map((p) => deletePage(p.id)))`
run before touching React state — cleaning up the *content* rows
(Lesson 7's `pages` store) that would otherwise become permanently
orphaned, unreachable by any UI, but still sitting in IndexedDB
forever.

#### CS Lens

Enforcing an invariant at the single point where it could be violated,
rather than defensively checking for its violation everywhere it's
relied upon, is the same design principle behind a database's `NOT NULL`
or foreign-key constraint: reject the one bad write at the boundary,
so every query downstream can assume the constraint always holds
without re-checking it. **Recognized in:** a stack data structure that
refuses to `pop()` past empty rather than returning `undefined` for
every caller to separately guard against; a form validator that blocks
a bad submission at the one entry point, rather than every downstream
handler defending against malformed data that should have been
impossible.

#### SE Lens

The alternative — allowing zero-page sections and adding an empty
state everywhere ("this section has no pages yet — add one to get
started") — is a legitimate design a bigger version of this feature
might eventually want (an intentionally empty section as a placeholder
for later). It wasn't built here because nothing in this increment's
scope needed it, and every additional empty-state check is a piece of
code that has to be written, tested, and kept correct — cut for now,
easy to add later if a real need for it shows up, rather than built
speculatively against a hypothetical one.

#### Connect to What Came Before

This is the same discipline `handleSelectSection` established back in
Lesson 1: "any handler that changes one piece of state must also decide,
in the same breath, what related state becomes" — extended here from
"switching sections" to "deleting the thing currently selected."

---

### Concept Unit: A Real Bug — Typing Didn't Replace, It Appended

#### The Problem

Double-clicking a tab reveals an `<input autoFocus value={draftTitle} />`
pre-filled with the current title, meant to let a user immediately type
a replacement. The first version of this shipped without checking
whether that's actually what happens when a real browser focuses an
input that already has text in it.

#### Introduce the Concept in Isolation

Verified against the real running app (not assumed): double-click a
section tab titled "Untitled Section", then type "Renamed" via a real
keyboard event stream — the same input method a real user's keystrokes
produce.

```
Sections after renaming: [ 'Getting Started', 'Project Ideas', 'Untitled SectionRenamed' ]
```

**What this proves:** focusing an `<input>` with an existing `value`
does *not* select that text by default — the cursor simply lands at
the end of it. Typing therefore *appended* "Renamed" onto the existing
"Untitled Section" rather than replacing it, producing exactly the
concatenated string seen above. This matches ordinary browser behavior,
not a framework quirk — the same thing would happen with any
pre-filled text input focused this way, React or not.

#### Discard the Throwaway Example

#### Project Change

- **Files:** `SectionTabs.jsx`, `PageTabs.jsx`
- **Change type:** fix (one line added to each rename `<input>`)
- **Dependencies:** none

#### The New Code

```jsx
<input
  autoFocus
  value={draftTitle}
  onFocus={(e) => e.target.select()}
  onChange={(e) => setDraftTitle(e.target.value)}
  ...
/>
```

#### The Updated Project

(The single added line is shown in context above — every other prop on
this `<input>` is unchanged from Lesson 1's original rename UI.)

Real output after the fix, same steps repeated:
```
Sections after renaming: [ 'Getting Started', 'Project Ideas', 'Renamed' ]
```

#### Mechanical Walkthrough
- `e.target.select()` — a native `<input>`/`<textarea>` method that
selects the entirety of the element's current text, the same thing a
user gets from pressing ⌘A/Ctrl+A inside a text field. Called from
- `onFocus`, it runs the instant the input actually receives focus —
which, combined with `autoFocus`, means the very first thing that
happens when a rename begins is the existing title becoming fully
selected, ready to be typed over.

#### CS Lens

This is "select-all-on-focus," a small but universally recognized UI
convention: **recognized in** a browser's address bar (clicking it
selects the whole URL, ready to be replaced by typing a new one); a
spreadsheet's cell editor (double-clicking selects the cell's existing
formula); virtually every "rename this file" text field across every
desktop operating system's file browser.

#### SE Lens

This bug is a good example of why the schema's own discipline —
verifying with *real* output rather than assuming code is correct
because it compiles and looks right — matters even for something as
small as a rename field: the original code was syntactically fine,
type-checked (insofar as this is a JS codebase), and would look correct
in a code review that didn't actually click through it. It only
revealed itself the moment a real double-click, a real focus event,
and a real keystroke sequence ran together.

#### Connect to What Came Before

This is the second real bug this lesson series has caught purely by
insisting on live verification instead of trusting code that "looks
- right" — Lesson 2's `loadFromJSON`-as-callback mistake was the first.
Both were invisible from reading the code alone and only surfaced
under actual execution — exactly the failure mode the schema's
Concept Isolation Rule and "real output, not assumed output" discipline
exist to catch.

---

## Connect the Pieces

`SectionTabs`/`PageTabs` render add/rename/delete UI whose handlers all
live in `CanvasNotesPage`. Every one of the six handlers
(`handleAddSection`, `handleRenameSection`, `handleDeleteSection`,
`handleAddPage`, `handleRenamePage`, `handleDeletePage`) follows the
same shape: mutate through `db.js` (Lesson 7) first, then mirror the
- identical change into React's `sections` state — the database and the
in-memory tree are never allowed to disagree, because every write goes
through both in the same function, in the same order, every time. The
two delete handlers additionally enforce the "always at least one"
invariant established in this lesson's first unit, refusing outright
rather than producing a state nothing else was built to handle.
Composed with everything from Lessons 1 through 7 — the tab hierarchy,
the shared canvas, drawing tools, text and markdown notes, pasted
- images, and real persistence — `canvas-notes` is now a complete,
self-registering lab: verified live this session to be reachable via
Start Menu search and the generic `/lab/:labKey` route exactly like
every other lab in this app, with zero special-cased wiring anywhere in
- `App.jsx` — the entire point `lab-registry-autofind/01-...md` set out
to prove, now demonstrated end-to-end by a real, nontrivial feature
built entirely the new way.

## What Breaks Without This

Verified live, this session: without the `sections.length <= 1` guard,
deleting a notebook's last remaining section would leave `sections` as
- an empty array — `activeSection`/`activePage` would both resolve to
`undefined`, `PageTabs` would render zero tabs, and the content area
would permanently show "No page selected" with no add-a-section button
reachable from anywhere (since `SectionTabs`' own "+" button still
works, but a user with no visible tabs and an empty content pane has no
visual cue that's where to look). Without the `onFocus`/`select()` fix,
every single rename in the app silently produces a concatenated,
wrong title — never an error, just a progressively longer, garbled
name each time someone tries to fix it by renaming again.

## Exercises

- Reorder sections by drag-and-drop isn't built — the `order` field
  exists (`db.js`, Lesson 7) but nothing writes a new value to it.
  Sketch (in comments, no need to implement) what a `moveSectionUp`/
  `moveSectionDown` pair of handlers would need to update.
- Add a keyboard shortcut (`Escape` while a tab's rename input is
  focused already cancels — confirm this still works) for canceling an
  *add* — right now, adding a section/page immediately creates it with
  the placeholder title "Untitled Section"/"Untitled Page" rather than
  opening directly into rename mode. Wire `handleAddSection`/
  `handleAddPage` to also call `setEditingId` in the child component so
  a freshly added tab opens ready to be named immediately.

## Definition of Done

- [ ] Sections and pages can be added, renamed (double-click, text
      pre-selected on focus), and deleted, all persisted through `db.js`
- [ ] Deleting the last remaining section or the last remaining page in
      a section is refused, not silently allowed
- [ ] Deleting a section also deletes every one of its pages' content
- rows from the `pages` store — nothing orphaned
- [ ] Verified live, this session: full add/rename/delete cycle for
      both tab levels, survives a full page reload; renaming correctly
      replaces the existing title rather than appending to it
- [ ] Verified live, this session: `canvas-notes` opens via Start Menu
      search and the generic `/lab/:labKey` route, identically to any
      other lab, with zero edits to `App.jsx`
- [ ] You can state, without notes, why the "at least one" invariant is
      enforced at the two delete handlers specifically, rather than
      defensively checked in every component that reads `sections`
- [ ] `git commit` with a message explaining why — for example: "Add
      section/page CRUD wired to db.js, completing canvas-notes as a
      fully self-registering lab — delete handlers enforce an
      always-at-least-one invariant the rest of the UI already assumed;
      fixed a real rename bug where a pre-filled, focused input
      appended typed text instead of replacing it"
