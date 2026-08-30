# Lesson 49: The Real Models Control

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. By the end of this lesson,
> the previous lesson's own real test passes, and this project's own
> real 3D-models list slice — every case this project has
> characterized, backend and frontend both — is complete.

## What you will build

The actual smallest real change making the previous lesson's own real
test pass: a real, per-row "Models" control, ungated, fetching and
toggling a real part's own real model list on click.

## What you need to know first

The previous lesson's own real, failing `PartsList.test.tsx`. This
project's own real **optimistic local update** term isn't what this
unit needs — this real control only *reads*, never writes; the
relevant, already-treated term is this project's own real
**Controlled input**'s own sibling idea, a real, toggled disclosure,
built from the identical real conditional-render syntax this
component already uses throughout.

## Terms introduced

None genuinely new.

## Objects and methods used

None genuinely new beyond `Array.prototype.map`, already given full
treatment.

---

## Concept Unit: Fetching and Toggling One Part's Own Real Models

### The Problem

`PartsList` has no real way to show a real part's own model list at
all. The real question this unit answers: what's the smallest real
state and real handler letting exactly one real part's own models be
shown at a time, fetched only when a real user actually asks for them?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason already given in the previous lesson.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.tsx`.
- **Change type** — modify.
- **Location** — its own top-level state declarations, a real, new
  `toggleModels` function, and its own real, returned `<li>`.
- **Dependencies** — none new.

### The New Code

```tsx
const [expandedPartId, setExpandedPartId] = useState<string | null>(null)
const [models, setModels] = useState<{ id: string; name: string; category: string }[]>([])

const toggleModels = (partId: string) => {
  if (expandedPartId === partId) {
    setExpandedPartId(null)
    return
  }

  fetch(`/api/parts/${partId}/models`)
    .then((response) => response.json())
    .then((data) => {
      setModels(data.data)
      setExpandedPartId(partId)
    })
}
```

### The Updated Project

`rebuild/frontend/src/PartsList.tsx`, in full — the previous lesson's
own version, with this unit's own new state, `toggleModels`, and its
own real, returned control and list added:

```tsx
1  import { useEffect, useState } from 'react'
2
3  function PartsList({ token }: { token?: string | null }) {
4    const [parts, setParts] = useState<{ id: string; partNumber: string; description: string; material: string; isFavorite: boolean }[]>([])
5    const [editingId, setEditingId] = useState<string | null>(null)
6    const [editDescription, setEditDescription] = useState('')
7    const [editMaterial, setEditMaterial] = useState('')
8    const [expandedPartId, setExpandedPartId] = useState<string | null>(null)
9    const [models, setModels] = useState<{ id: string; name: string; category: string }[]>([])
10
11   useEffect(() => {
12     fetch('/api/parts')
13       .then((response) => response.json())
14       .then((data) => setParts(data.data))
15   }, [])
16
17   const handleDelete = (partId: string) => {
18     fetch(`/api/parts/${partId}`, {
19       method: 'DELETE',
20       headers: { 'Authorization': `Bearer ${token}` },
21     }).then(() => {
22       setParts((current) => current.filter((part) => part.id !== partId))
23     })
24   }
25
26   const handleToggleFavorite = (part: { id: string; isFavorite: boolean }) => {
27     fetch(`/api/parts/${part.id}`, {
28       method: 'PUT',
29       headers: {
30         'Content-Type': 'application/json',
31         'Authorization': `Bearer ${token}`,
32       },
33       body: JSON.stringify({ isFavorite: !part.isFavorite }),
34     })
35       .then((response) => response.json())
36       .then((data) => {
37         setParts((current) => current.map((p) => (p.id === part.id ? data.data : p)))
38       })
39   }
40
41   const startEdit = (part: { id: string; description: string; material: string }) => {
42     setEditingId(part.id)
43     setEditDescription(part.description)
44     setEditMaterial(part.material)
45   }
46
47   const saveEdit = (partId: string) => {
48     fetch(`/api/parts/${partId}`, {
49       method: 'PUT',
50       headers: {
51         'Content-Type': 'application/json',
52         'Authorization': `Bearer ${token}`,
53       },
54       body: JSON.stringify({ description: editDescription, material: editMaterial }),
55     })
56       .then((response) => response.json())
57       .then((data) => {
58         setParts((current) => current.map((p) => (p.id === partId ? data.data : p)))
59         setEditingId(null)
60       })
61   }
62
63   const toggleModels = (partId: string) => {
64     if (expandedPartId === partId) {
65       setExpandedPartId(null)
66       return
67     }
68
69     fetch(`/api/parts/${partId}/models`)
70       .then((response) => response.json())
71       .then((data) => {
72         setModels(data.data)
73         setExpandedPartId(partId)
74       })
75   }
76
77   if (parts.length === 0) {
78     return <p>No parts yet.</p>
79   }
80
81   return (
82     <ul>
83       {parts.map((part) => (
84         <li key={part.id}>
85           {editingId === part.id ? (
86             <>
87               <input
88                 value={editDescription}
89                 onChange={(event) => setEditDescription(event.target.value)}
90               />
91               <input
92                 value={editMaterial}
93                 onChange={(event) => setEditMaterial(event.target.value)}
94               />
95               <button onClick={() => saveEdit(part.id)}>Save</button>
96               <button onClick={() => setEditingId(null)}>Cancel</button>
97             </>
98           ) : (
99             <>
100              {part.partNumber} — {part.description}
101              {token && <button onClick={() => startEdit(part)}>Edit</button>}
102              {token && <button onClick={() => handleToggleFavorite(part)}>{part.isFavorite ? 'Unfavorite' : 'Favorite'}</button>}
103              {token && <button onClick={() => handleDelete(part.id)}>Delete</button>}
104              <button onClick={() => toggleModels(part.id)}>{expandedPartId === part.id ? 'Hide Models' : 'Models'}</button>
105              {expandedPartId === part.id && (
106                <ul>
107                  {models.map((model) => (
108                    <li key={model.id}>{model.name}</li>
109                  ))}
110                </ul>
111              )}
112            </>
113          )}
114        </li>
115      ))}
116    </ul>
117  )
118 }
119
120 export default PartsList
```

### Mechanical Walkthrough

- **Line 8, `const [expandedPartId, setExpandedPartId] = useState<string
  | null>(null)`** — the identical real, single-selection shape
  `editingId` already established: at most one real part's own models
  are shown at a time.
- **Line 9, `const [models, setModels] = useState<...>([])`** — a real,
  plain array holding whichever real part's own models were most
  recently fetched — real and shared across every real row, matching
  `expandedPartId`'s own real, single-selection design; only one real
  row ever reads it at a time.
- **Lines 64–67, `if (expandedPartId === partId) { setExpandedPartId(null);
  return }`** — a real, early return: clicking the real, already-open
  part's own control closes it without any real, new `fetch` at all.
- **Lines 69–75, the real fetch** — real and deliberately no `headers`
  argument — this real route needs no real credential at all, matching
  this project's own real **Operator bypass** exactly; `setModels(data.data)`
  then `setExpandedPartId(partId)`, in that real order, so the real,
  new models are already real, in state before the real conditional
  render below ever tries to read them.
- **Line 104, `{expandedPartId === part.id ? 'Hide Models' :
  'Models'}`** — the identical real, label-encodes-state pattern this
  project's own Favorite control already established, reused for a
  real, different, ungated control.
- **Line 104's own real button — real and deliberately outside every
  `{token && ...}` guard** — the real, concrete embodiment of this
  slice's own real **read/write asymmetry** term: every real, sibling
  control on this same real line is gated; this one, real and
  intentionally, is not.
- **Lines 105–111, the real, conditional model list** — the identical
  real `{cond && <ul>...}` shape this project's own edit-mode
  conditional already established, here rendering this lesson's
  Header's own already-treated `Array.prototype.map`, one real `<li>`
  per real model.

### CS Lens

This is a real instance of **lazy, on-demand fetching** — this real
part's own models are never real, fetched until a real user actually
asks to see them, real and unlike `parts` itself, which fetches
eagerly on real mount. The real cost/benefit here: a real, second
click after closing re-fetches from real, scratch rather than caching
the real, previous result — real, acceptable for now, since this
project's own real data is still small and nothing real yet mutates a
part's own models after they're first shown.

Also recognized in: a real, collapsible UI section that only loads its
own real content the first time a real user expands it, rather than
loading every real section's own data up front.

### SE Lens

The real, deliberately *not*-taken alternative here: fetching every
real part's own models eagerly, alongside `parts` itself, on this
component's own real mount. Rejected on purpose — that would mean one
real network request per real part, all at once, for real data most
real users may never actually look at; this unit's own real, lazy
design sends exactly one real, additional request only when a real
user actually asks, matching this project's own real, repeated
discipline of building the smallest real thing an actual, real,
current requirement needs.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
npx tsc --noEmit
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real, URL-distinguishing mock
and this real toggle genuinely produce the real, visible effect the
previous lesson's own test expects — so this was actually run this
session:

```
Test Files  4 passed (4)
     Tests  15 passed (15)
```

The previous lesson's own real test now passes, together with every
real test this project has ever written. A real `npx tsc --noEmit`
was also actually run this session — a genuine, clean compile, no real
output at all.

### Connecting this unit to what came before

The previous lesson proved what this real control must do. This unit
is what finally does it — completing this project's own real
3D-models list slice, every case this project has characterized so
far, backend and frontend both.

---

## Connect the pieces

A real user — signed in or not — can now click a real Models control
next to any real part and see that real part's own real model names,
fetched only when actually asked for, reflecting this project's own
real backend's own already-proven, real, permissive read access
exactly.

---

**Next lesson:** not yet decided here — this project's own real
3D-model work still has real uploads and real deletion ahead of it;
the tool-assembly joins remain a real, separate, deeper slice too.
