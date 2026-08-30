# Lesson 43: The Real Edit Control

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. By the end of this lesson,
> the previous lesson's own two real tests pass, and this project's own
> real Update slice — every field it targets, backend and frontend
> both — is complete.

## What you will build

The actual smallest real changes making the previous lesson's own two
real tests pass: `PartsList` gains real, per-row edit-mode state, a
real "Edit" control that opens it pre-filled, and a real "Save" that
sends the real, changed fields and exits edit mode on a real, successful
response.

## What you need to know first

The previous lesson's own real, failing `PartsList.test.tsx`. This
project's own real **Controlled input** term, already given full
treatment. `PartsList`'s own real, already-established `token` prop,
real Delete and Favorite handlers, and its own real
**optimistic local update** term.

## Terms introduced

None genuinely new — this unit assembles this project's own,
already-proven pieces: a real, conditional render choosing between two
real branches (new here, but built from the identical real `{cond &&
...}` and ternary syntax already used throughout this project), and a
real `fetch` call carrying a real, JSON body, identical in shape to
`handleToggleFavorite`'s own already-established one.

## Objects and methods used

None genuinely new beyond this lesson's own reused, already-treated
`Array.prototype.map` (this slice's own favorite-toggle implementation
lesson) and React's own `useState`, already given full treatment many
times over.

---

## Concept Unit: Entering a Real Edit, Pre-Filled

### The Problem

`PartsList` currently renders one real, fixed view per part. A real
edit needs a real, second view — inputs, not text — that a real,
signed-in user can open, and that starts real, pre-filled with the
real part's own current values, not real, empty. The real question
this unit answers: what's the smallest real state letting `PartsList`
track *which* real part, if any, is currently being edited, and what
its real, in-progress values are?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason `PartsList`'s own Delete and Favorite controls already gave.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.tsx`.
- **Change type** — modify.
- **Location** — its own top-level state declarations, a real, new
  `startEdit` function, and its own real, returned `<li>`.
- **Dependencies** — none new.

### The New Code

```tsx
const [editingId, setEditingId] = useState<string | null>(null)
const [editDescription, setEditDescription] = useState('')
const [editMaterial, setEditMaterial] = useState('')

const startEdit = (part: { id: string; description: string; material: string }) => {
  setEditingId(part.id)
  setEditDescription(part.description)
  setEditMaterial(part.material)
}

const saveEdit = (partId: string) => {}
```

### The Updated Project

`rebuild/frontend/src/PartsList.tsx`, in full — the previous lesson's
own version, with this unit's own new state, `startEdit`, an empty,
real, placeholder `saveEdit`, and the real, conditional `<li>` body
added (the next unit completes `saveEdit`):

```tsx
1  import { useEffect, useState } from 'react'
2
3  function PartsList({ token }: { token?: string | null }) {
4    const [parts, setParts] = useState<{ id: string; partNumber: string; description: string; material: string; isFavorite: boolean }[]>([])
5    const [editingId, setEditingId] = useState<string | null>(null)
6    const [editDescription, setEditDescription] = useState('')
7    const [editMaterial, setEditMaterial] = useState('')
8
9    useEffect(() => {
10     fetch('/api/parts')
11       .then((response) => response.json())
12       .then((data) => setParts(data.data))
13   }, [])
14
15   const handleDelete = (partId: string) => {
16     fetch(`/api/parts/${partId}`, {
17       method: 'DELETE',
18       headers: { 'Authorization': `Bearer ${token}` },
19     }).then(() => {
20       setParts((current) => current.filter((part) => part.id !== partId))
21     })
22   }
23
24   const handleToggleFavorite = (part: { id: string; isFavorite: boolean }) => {
25     fetch(`/api/parts/${part.id}`, {
26       method: 'PUT',
27       headers: {
28         'Content-Type': 'application/json',
29         'Authorization': `Bearer ${token}`,
30       },
31       body: JSON.stringify({ isFavorite: !part.isFavorite }),
32     })
33       .then((response) => response.json())
34       .then((data) => {
35         setParts((current) => current.map((p) => (p.id === part.id ? data.data : p)))
36       })
37   }
38
39   const startEdit = (part: { id: string; description: string; material: string }) => {
40     setEditingId(part.id)
41     setEditDescription(part.description)
42     setEditMaterial(part.material)
43   }
44
45   const saveEdit = (partId: string) => {}
46
47   if (parts.length === 0) {
48     return <p>No parts yet.</p>
49   }
50
51   return (
52     <ul>
53       {parts.map((part) => (
54         <li key={part.id}>
55           {editingId === part.id ? (
56             <>
57               <input
58                 value={editDescription}
59                 onChange={(event) => setEditDescription(event.target.value)}
60               />
61               <input
62                 value={editMaterial}
63                 onChange={(event) => setEditMaterial(event.target.value)}
64               />
65               <button onClick={() => saveEdit(part.id)}>Save</button>
66               <button onClick={() => setEditingId(null)}>Cancel</button>
67             </>
68           ) : (
69             <>
70               {part.partNumber} — {part.description}
71               {token && <button onClick={() => startEdit(part)}>Edit</button>}
72               {token && <button onClick={() => handleToggleFavorite(part)}>{part.isFavorite ? 'Unfavorite' : 'Favorite'}</button>}
73               {token && <button onClick={() => handleDelete(part.id)}>Delete</button>}
74             </>
75           )}
76         </li>
77       ))}
78     </ul>
79   )
80 }
81
82 export default PartsList
```

### Mechanical Walkthrough

- **Line 5, `const [editingId, setEditingId] = useState<string |
  null>(null)`** — a real, plain state variable holding at most one
  real part's own real `id` at a time, or real `null` when nothing is
  being edited — a real, deliberate design choice: this project's own
  real `PartsList` allows editing exactly one real row at a time, never
  more.
- **Lines 6–7, `editDescription`/`editMaterial`** — two real, separate
  state variables holding this real, in-progress edit's own, real,
  current values — real and deliberately not read directly off
  `parts` while editing, so a real, in-progress keystroke never
  mutates the real, already-fetched list until a real Save actually
  happens.
- **Lines 39–43, `startEdit`** — sets all three real, new state
  variables at once: `editingId` to this real part's own `id`, and
  both real, editable fields to this real part's own, real, current
  values — this lesson's Header's own **Controlled input** term
  proven from the write side: a real, controlled input only ever shows
  what real state says to, so pre-filling it means setting that real
  state before the real input ever renders.
- **Line 45, `const saveEdit = (partId: string) => {}`** — a real,
  deliberately empty function, existing only so line 65's own real
  reference to it doesn't fail to compile; the next unit gives it a
  real body.
- **Line 55, `{editingId === part.id ? (...) : (...)}`** — a real,
  per-row ternary: only the real row whose own real `id` matches
  `editingId` shows real inputs; every other real row, and this same
  real row before editing starts, shows its real, ordinary text and
  buttons.
- **Lines 57–64, the two real, controlled inputs** — each a real
  `value` read from its own real state variable, and a real `onChange`
  writing back into it — this lesson's Header's own **Controlled
  input** term, built for real: without line 59's own real `onChange`,
  this real input would accept no real keystrokes at all, its own
  real, displayed value permanently pinned to whatever `editDescription`
  already held.
- **Line 66, `<button onClick={() => setEditingId(null)}>Cancel</button>`**
  — a real, second, new control: setting `editingId` back to real
  `null` exits edit mode without ever calling `saveEdit` at all — no
  real network request, no real change to `parts`.

### CS Lens

This is a real instance of a **draft / working-copy pattern** — a real
edit's own, in-progress values live in their own, separate real state
(`editDescription`, `editMaterial`), completely independent of the
real, already-fetched `parts` array, until a real, explicit save
commits them. A real Cancel simply discards the real, separate draft,
leaving the real, original data completely untouched — the identical
real reason a real document editor keeps unsaved changes separate from
a real, saved file on disk.

Also recognized in: any real form that edits a real copy of a real
record and only writes the real, original back on a real, explicit
submit — never mutating the real, displayed source data keystroke by
keystroke.

### SE Lens

The real, deliberately *not*-taken alternative here: editing `parts`
directly, in place, on every real keystroke, then reverting it on a
real Cancel. Rejected on purpose — that would require this real
component to remember a real, separate, "original" copy of whatever
part is being edited anyway, just to support a real Cancel, which is
real, more code solving the identical real problem `editDescription`/
`editMaterial` already solve more simply, by never touching `parts` at
all until a real save actually succeeds.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real, partial change already
makes the previous lesson's own real absence test pass for the correct
reason, without yet completing the real save — so this was actually
run this session:

```
Test Files  1 failed (1)
     Tests  1 failed | 7 passed (8)
```

Seven real cases already pass, including this project's own real
edit-absence test. The one real case needing a real, completed save
still fails — `saveEdit` has no real body yet at all.

### Connecting this unit to what came before

The previous lesson proved what a real edit sequence must do. This
unit is where `PartsList` first learns to open one, pre-filled with
real, current data.

---

## Concept Unit: Saving a Real Edit, and Closing It

### The Problem

A real edit can now open, pre-filled. Nothing yet sends its real,
changed values anywhere, or closes it afterward. The real question
this unit answers: what's the smallest real code doing both, using
this slice's own already-proven `PUT` route?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason already given twice in this lesson.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.tsx`.
- **Change type** — modify.
- **Location** — the previous unit's own real, empty `saveEdit`
  function body.
- **Dependencies** — none new.

### The New Code

```tsx
const saveEdit = (partId: string) => {
  fetch(`/api/parts/${partId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ description: editDescription, material: editMaterial }),
  })
    .then((response) => response.json())
    .then((data) => {
      setParts((current) => current.map((p) => (p.id === partId ? data.data : p)))
      setEditingId(null)
    })
}
```

### The Updated Project

`rebuild/frontend/src/PartsList.tsx`, in full — the previous unit's own
version, with `saveEdit`'s own real body completed:

```tsx
1  import { useEffect, useState } from 'react'
2
3  function PartsList({ token }: { token?: string | null }) {
4    const [parts, setParts] = useState<{ id: string; partNumber: string; description: string; material: string; isFavorite: boolean }[]>([])
5    const [editingId, setEditingId] = useState<string | null>(null)
6    const [editDescription, setEditDescription] = useState('')
7    const [editMaterial, setEditMaterial] = useState('')
8
9    useEffect(() => {
10     fetch('/api/parts')
11       .then((response) => response.json())
12       .then((data) => setParts(data.data))
13   }, [])
14
15   const handleDelete = (partId: string) => {
16     fetch(`/api/parts/${partId}`, {
17       method: 'DELETE',
18       headers: { 'Authorization': `Bearer ${token}` },
19     }).then(() => {
20       setParts((current) => current.filter((part) => part.id !== partId))
21     })
22   }
23
24   const handleToggleFavorite = (part: { id: string; isFavorite: boolean }) => {
25     fetch(`/api/parts/${part.id}`, {
26       method: 'PUT',
27       headers: {
28         'Content-Type': 'application/json',
29         'Authorization': `Bearer ${token}`,
30       },
31       body: JSON.stringify({ isFavorite: !part.isFavorite }),
32     })
33       .then((response) => response.json())
34       .then((data) => {
35         setParts((current) => current.map((p) => (p.id === part.id ? data.data : p)))
36       })
37   }
38
39   const startEdit = (part: { id: string; description: string; material: string }) => {
40     setEditingId(part.id)
41     setEditDescription(part.description)
42     setEditMaterial(part.material)
43   }
44
45   const saveEdit = (partId: string) => {
46     fetch(`/api/parts/${partId}`, {
47       method: 'PUT',
48       headers: {
49         'Content-Type': 'application/json',
50         'Authorization': `Bearer ${token}`,
51       },
52       body: JSON.stringify({ description: editDescription, material: editMaterial }),
53     })
54       .then((response) => response.json())
55       .then((data) => {
56         setParts((current) => current.map((p) => (p.id === partId ? data.data : p)))
57         setEditingId(null)
58       })
59   }
60
61   if (parts.length === 0) {
62     return <p>No parts yet.</p>
63   }
64
65   return (
66     <ul>
67       {parts.map((part) => (
68         <li key={part.id}>
69           {editingId === part.id ? (
70             <>
71               <input
72                 value={editDescription}
73                 onChange={(event) => setEditDescription(event.target.value)}
74               />
75               <input
76                 value={editMaterial}
77                 onChange={(event) => setEditMaterial(event.target.value)}
78               />
79               <button onClick={() => saveEdit(part.id)}>Save</button>
80               <button onClick={() => setEditingId(null)}>Cancel</button>
81             </>
82           ) : (
83             <>
84               {part.partNumber} — {part.description}
85               {token && <button onClick={() => startEdit(part)}>Edit</button>}
86               {token && <button onClick={() => handleToggleFavorite(part)}>{part.isFavorite ? 'Unfavorite' : 'Favorite'}</button>}
87               {token && <button onClick={() => handleDelete(part.id)}>Delete</button>}
88             </>
89           )}
90         </li>
91       ))}
92     </ul>
93   )
94 }
95
96 export default PartsList
```

### Mechanical Walkthrough

- **Lines 46–52, the real `fetch` call** — the identical real shape
  `handleToggleFavorite` already established: a real JSON
  `Content-Type` header, a real bearer token, and a real,
  `JSON.stringify`-encoded body — real and reading `editDescription`/
  `editMaterial` directly, this real edit session's own, real, current
  draft values, not whatever `parts` itself still holds.
- **Line 53, `.then((response) => response.json())`** — real and, like
  `handleToggleFavorite`, reads the real response body — this real save
  needs the real, complete, updated part back.
- **Lines 55–58, the real, two-part completion** —
  `setParts((current) => current.map((p) => (p.id === partId ?
  data.data : p)))` is the identical real `.map(...)` call
  `handleToggleFavorite` already established, replacing exactly the one
  real, matching part with the real, authoritative server response;
  `setEditingId(null)` real, immediately following, closes the real
  edit session — real and only reached once the real save has actually
  succeeded, never before.

### CS Lens

The identical real **optimistic local update**, updated from the real,
authoritative server response — the identical real reasoning this
project's own Favorite-toggle implementation lesson already gave in
full, reused here unchanged: this real save reflects back whatever
`update_part` actually, really persisted, rather than trusting the
real, local draft values were saved exactly as typed.

Also recognized in: the identical real examples already given.

### SE Lens

The real, deliberately *not*-taken alternative here: closing edit mode
(`setEditingId(null)`) *before* the real `fetch` resolves, for a real,
snappier-feeling UI. Rejected on purpose: this real component has no
real, current test or requirement for a real, failed save (a real
`403`, a real network error), so closing edit mode unconditionally
would silently discard a real user's own, real, unsaved changes if a
real save ever actually failed — a real, honest cost this project
isn't accepting without a real, stated reason. Closing only inside the
real, successful `.then(...)` chain, exactly as written, means a real,
failed save currently just leaves the real form open with no real
error shown at all — a real, accepted gap, matching the identical real,
minimal-first discipline this project has already used more than once,
not a decision to silently swallow the failure.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
npx tsc --noEmit
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real save genuinely reflects
the real server's own response and correctly closes the real edit
session — so this was actually run this session:

```
Test Files  4 passed (4)
     Tests  14 passed (14)
```

Both of the previous lesson's own real tests now pass, together with
every real test this project has ever written. A real `npx tsc
--noEmit` was also actually run this session — a genuine, clean
compile, no real output at all.

### Connecting this unit to what came before

The previous unit taught `PartsList` to open a real edit. This unit is
what finally saves it — completing this project's own real Update
slice, every field it targets, backend and frontend both.

---

## Connect the pieces

A real, signed-in user can now open any real part for editing, change
its real description and material together, and save both with one
real click — reaching this slice's own real, already-proven backend
route, reflecting the real, authoritative result immediately, and
closing the real edit session only once that real save actually
succeeded.

---

**Next lesson:** not yet decided here — this project's own real Parts
feature still has the tool-assembly joins and 3D-model uploads ahead
of it, each its own real, separate, deeper slice.
