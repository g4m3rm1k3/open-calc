# Lesson 1 — Modeling a Two-Level Tab Hierarchy

## What You Will Build

A new lab, `canvas-notes`, registers itself the way Lesson 1 and 2 of
`lab-registry-autofind/` made every lab register — one `meta.js` file,
zero edits to `App.jsx` or anywhere else. This lesson builds its actual
first slice of UI: a top row of section tabs (OneNote calls this level
"Sections") and, for whichever section is active, its own independent
side column of page tabs (OneNote's "Pages") — the two-level navigation
shape this whole feature is built around. No canvas, no drawing, no
persistence yet — this lesson is purely the data model and the two
components that browse it, in memory, so the harder pieces later have a
solid shape to attach to.

## What You Need to Know First

`lab-registry-autofind/01-...md` and `02-...md` — assumed fresh: how a
lab self-registers via `meta.js`, `Array.prototype.find()`, and nullish
coalescing (`??`). Not re-explained here; both reappear below.

---

## The Lesson

### Where You're Working

Three new files, one new lab folder:
`src/labs/canvas-notes/meta.js` (registers the lab, same shape as every
other lab since `lab-registry-autofind/01-...md`), `index.jsx` (exports
the page component — `labLoader.js` needs this, unchanged pattern),
and `CanvasNotesPage.jsx` plus its two children, `SectionTabs.jsx` and
`PageTabs.jsx` — all brand new.

### Concept Unit: Nesting One Collection Inside Another

#### The Problem

A notebook page belongs to exactly one section, and a section can hold
any number of pages. There are two honest ways to represent that in
data, and picking between them up front matters for everything this
feature builds next.

#### Introduce the Concept in Isolation

```js
// Shape A — nested: each section directly owns its own pages array.
const nested = [
  { id: 's1', pages: [{ id: 'p1' }, { id: 'p2' }] },
  { id: 's2', pages: [{ id: 'p3' }] },
]
console.log('Nested — pages for s1:', nested.find((s) => s.id === 's1').pages)

// Shape B — flat: one array of pages, each tagged with its parent's id.
const flatPages = [
  { id: 'p1', sectionId: 's1' },
  { id: 'p2', sectionId: 's1' },
  { id: 'p3', sectionId: 's2' },
]
console.log('Flat — pages for s1:', flatPages.filter((p) => p.sectionId === 's1'))
```

Run, real output:
```
Nested — pages for s1: [ { id: 'p1' }, { id: 'p2' } ]
Flat — pages for s1: [ { id: 'p1', sectionId: 's1' }, { id: 'p2', sectionId: 's1' } ]
```

**What this proves:** both shapes can answer the same question — "what
pages belong to section 1?" — but they get there differently. Shape A
just reads a property (`.pages`) that's already sitting on the exact
section object you already have. Shape B has to scan the *entire* flat
list and filter it down every single time you want one section's pages,
even though most of that list is irrelevant to the question.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/CanvasNotesPage.jsx` (new file)
- **Change type:** add
- **Dependencies:** none

#### The New Code

```js
const INITIAL_SECTIONS = [
  {
    id: 'section-1',
    title: 'Getting Started',
    pages: [
      { id: 'page-1', title: 'Welcome' },
      { id: 'page-2', title: 'Tips' },
    ],
  },
  {
    id: 'section-2',
    title: 'Project Ideas',
    pages: [{ id: 'page-3', title: 'Brainstorm' }],
  },
]
```

#### The Updated Project

```js
import { useState } from 'react'
import SectionTabs from './SectionTabs.jsx'
import PageTabs from './PageTabs.jsx'

const INITIAL_SECTIONS = [ /* shown whole above */ ]

export default function CanvasNotesPage() {
  const [sections, setSections] = useState(INITIAL_SECTIONS)
  // ...rest of the component, next unit...
}
```

`sections` is now real React state, seeded with the shape from this unit
— an array where each entry directly owns its own `pages` array.

#### Mechanical Walkthrough

`INITIAL_SECTIONS` is a plain array literal, two objects, each with `id`,
`title`, and a `pages` array of its own — no new syntax here at all, just
this unit's new *shape* applied for real. `useState(INITIAL_SECTIONS)` —
already-established React (assumed known coming into this lesson set, per
this curriculum's existing `useeffect-and-useref-fundamentals` lesson
implying `useState` itself predates it).

#### CS Lens

This is a depth-2 tree: sections are the first level, pages the second,
and nothing nests any deeper than that. **Recognized in:** a filesystem
(folders containing files, no shared "files" table anywhere else); the
DOM (an element's `.children`); a JSON API response for
"categories, each with their own subcategories."

#### SE Lens

Shape A (nested) is simple to reason about and cheap to read from — the
data you want is already sitting where you're standing. Its real cost
shows up the moment you need to update *one* page from *outside* the
context of its section (like a global "rename any page by id" feature) —
you'd have to search every section's `pages` array to find it, since
there's no direct id-to-page lookup. Shape B (flat, foreign-keyed) is the
opposite trade: cheap global lookups by id, more work every time you want
"just this section's pages." For an in-memory notebook UI, where nearly
every real operation is scoped to "the currently active section," Shape
A's cost profile matches the actual usage pattern — this is revisited
for real once Increment 7 designs the persisted database schema, where
the tradeoff may point the other way.

#### Connect to What Came Before

Nothing in this codebase yet modeled a genuine two-level UI hierarchy.
This unit is the data shape everything else in this lesson (and every
increment after it) reads from.

---

### Concept Unit: Keeping Two Related State Variables Honest

#### The Problem

`activeSectionId` and `activePageId` are two separate pieces of state —
neither is strictly computed from the other, since a user can click any
page within the current section independently. But the moment the user
switches *sections*, whatever `activePageId` was pointing at almost
certainly doesn't exist in the *new* section's `pages` array anymore.
Forgetting to handle that produces a page tab that's selected but shows
nothing, silently.

#### Introduce the Concept in Isolation

```js
const sections = [
  { id: 's1', pages: [{ id: 'p1' }, { id: 'p2' }] },
  { id: 's2', pages: [{ id: 'p3' }] },
]

let activeSectionId = 's1'
let activePageId = 'p2'  // user had picked the second page of s1

activeSectionId = 's2'  // user clicks section 2's tab
// activePageId is NOT updated here — the bug
const activeSection = sections.find((s) => s.id === activeSectionId)
const stalePage = activeSection.pages.find((p) => p.id === activePageId)
console.log('Without resetting activePageId:', stalePage)

activePageId = activeSection.pages[0]?.id ?? null
const fixedPage = activeSection.pages.find((p) => p.id === activePageId)
console.log("After resetting activePageId to the new section's first page:", fixedPage)
```

Run, real output:
```
Without resetting activePageId: undefined
After resetting activePageId to the new section's first page: { id: 'p3' }
```

**What this proves:** `activePageId` still holds `'p2'` after switching
to `s2`, and `s2` has no page with that id — `.find()` (already
established, `lab-registry-autofind/01-...md`) correctly returns
`undefined`, silently. Nothing throws; a real UI would just render a
blank page with no visible error. The fix isn't a new language feature —
it's a discipline: any handler that changes `activeSectionId` must also
decide, in the same breath, what `activePageId` becomes.

#### Discard the Throwaway Example

#### Project Change

- **File:** `src/labs/canvas-notes/CanvasNotesPage.jsx`
- **Change type:** add (completes the component this lesson builds)
- **Dependencies:** the previous unit's `INITIAL_SECTIONS`

#### The New Code

```js
const handleSelectSection = (sectionId) => {
  setActiveSectionId(sectionId)
  const newSection = sections.find((s) => s.id === sectionId)
  setActivePageId(newSection?.pages[0]?.id ?? null)
}
```

#### The Updated Project

```jsx
export default function CanvasNotesPage() {
  const [sections, setSections] = useState(INITIAL_SECTIONS)
  const [activeSectionId, setActiveSectionId] = useState(INITIAL_SECTIONS[0].id)
  const [activePageId, setActivePageId] = useState(INITIAL_SECTIONS[0].pages[0].id)

  const activeSection = sections.find((s) => s.id === activeSectionId)
  const activePage = activeSection?.pages.find((p) => p.id === activePageId)

  const handleSelectSection = (sectionId) => {          // ← new
    setActiveSectionId(sectionId)                        // ← new
    const newSection = sections.find((s) => s.id === sectionId)  // ← new
    setActivePageId(newSection?.pages[0]?.id ?? null)    // ← new
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <SectionTabs sections={sections} activeSectionId={activeSectionId} onSelect={handleSelectSection} />
      <div className="flex flex-1 min-h-0">
        <PageTabs pages={activeSection?.pages ?? []} activePageId={activePageId} onSelect={setActivePageId} />
        <div className="flex-1 p-8 overflow-auto">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
            {activePage?.title ?? 'No page selected'}
          </h2>
        </div>
      </div>
    </div>
  )
}
```

Selecting a *page* directly (`onSelect={setActivePageId}` in `PageTabs`)
never needs this reconciliation — picking a different page within the
*same* section never invalidates `activeSectionId`. Only switching
*sections* can strand `activePageId`, which is exactly why only
`handleSelectSection` — not the plain `setActivePageId` passed to
`PageTabs` — needs the extra line.

#### Mechanical Walkthrough

`sections.find((s) => s.id === sectionId)` — `.find()`, established.
`newSection?.pages[0]?.id ?? null` — two established concepts chained:
optional chaining (already present in this codebase before either lesson
in this set touched it) guards against a section with zero pages, and `??`
(established, `lab-registry-autofind/01-...md`) supplies `null` if there's
truly no first page to fall back to, rather than leaving `activePageId`
as `undefined`.

#### CS Lens

This is a small instance of a broader idea: state that *depends on* other
state but isn't *derived* from it on every render (if it were, you'd
compute it directly during render instead of storing it separately) has
to be kept consistent by hand, at the exact moment the state it depends on
changes. **Recognized in:** a shopping cart's selected shipping method
becoming invalid when the destination country changes; a spreadsheet's
active cell reference breaking when a referenced row is deleted; a video
player's selected subtitle track resetting when you switch to a video
that doesn't have that language.

#### SE Lens

The alternative to fixing this by hand in the event handler is computing
`activePageId` *implicitly* every render (e.g., "always show the first
page of whatever section is active," with no independent page selection
at all) — simpler, but it would mean a user could never stay on, say,
the second page of a section while browsing. Keeping `activePageId`
as its own real state, and explicitly reconciling it only at the one
moment it can go stale, is the more capable design at the cost of exactly
one extra line, placed exactly where the inconsistency can occur — not
sprinkled defensively everywhere `activePageId` is read.

#### Connect to What Came Before

The previous unit built the *shape* two levels of tabs read from. This
unit is the one real behavioral rule that shape demands: switching the
outer level must never leave the inner level pointing at something that
no longer exists.

---

## Connect the Pieces

A user opens `canvas-notes`: `CanvasNotesPage` seeds `sections` with two
entries (previous unit), and picks the first section's first page as
default active state. `SectionTabs` renders one button per top-level
entry; clicking one calls `handleSelectSection` (this unit), which
updates *both* `activeSectionId` and `activePageId` together, reading the
new section's first page id directly off the same `sections` array the
whole component already has in memory. `PageTabs` then re-renders showing
only the newly-active section's own pages — a completely different list
than a moment ago, because each section's pages never lived anywhere but
inside that section's own object in the first place.

## What Breaks Without This

Removing the last line of `handleSelectSection` (`setActivePageId(...)`)
reproduces a real, silent bug — verified this session: switch from
"Getting Started" (with `activePageId` pointing at its "Tips" page) to
"Project Ideas." Without the reset, `activePageId` stays `'page-2'` —
a page that only exists in the *previous* section. `PageTabs` renders
"Project Ideas"'s one real page ("Brainstorm") correctly, since
`PageTabs` only ever renders what's actually in its `pages` prop — but
the content area's `activePage?.title ?? 'No page selected'` falls
through to `'No page selected'`, because `activeSection.pages.find((p) => p.id === 'page-2')`
finds nothing in the new section. Nothing throws or logs — the page
simply shows no title, and a user has no way to tell why from the UI
alone.

## Definition of Done

- [ ] `src/labs/canvas-notes/meta.js` registers the lab (Lesson 1/2 of
      `lab-registry-autofind/` convention — no `App.jsx` edits)
- [ ] `CanvasNotesPage.jsx`, `SectionTabs.jsx`, `PageTabs.jsx` exist;
      `sections` state uses the nested shape (each section owns its own
      `pages` array)
- [ ] Switching sections always lands on a valid page (or `null` if the
      new section is genuinely empty) — never a stale id from the
      previous section
- [ ] Verified live, this session: two sections, each with an
      independent page list; switching sections shows only that
      section's own pages; selecting a specific page updates the visible
      content
- [ ] You reproduced the stale-`activePageId` bug on purpose and can
      explain why it fails silently instead of throwing
- [ ] You can state, without notes, one real cost of the nested shape
      chosen here (global lookup-by-id requires searching every
      section) and why it's an acceptable trade at this feature's
      current scale
- [ ] `git commit` with a message explaining why — for example: "Add
      canvas-notes lab with a two-level section/page tab hierarchy —
      nested data shape matches the feature's actual access pattern
      (always scoped to the active section), with explicit reconciliation
      to prevent stale page selection after switching sections"
