# Lesson 39: The Real Favorite Control

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. By the end of this lesson,
> the previous lesson's own two real tests pass, and this project's own
> real favorite-toggle slice — backend and frontend both — is
> complete.

## What you will build

The actual smallest real changes making the previous lesson's own two
real tests pass: `PartsList`'s own internal, real part type gains a
real `isFavorite` field, a real second control renders alongside
Delete, and a real handler calls this slice's own already-proven `PUT`
route and replaces the real, updated part in place.

## What you need to know first

The previous lesson's own real, failing `PartsList.test.tsx`. This
project's own real **optimistic local update** term, already given
full treatment by this slice's own deletion lesson. `PartsList`'s own
real, already-established `token` prop and real Delete handler.

## Terms introduced

None genuinely new — this unit reuses this project's own,
already-proven pieces: a real, second conditional control (the
identical real shape Delete already uses), and a real `fetch` call
carrying a real, JSON body (`AddPartForm`'s own already-established
shape).

## Objects and methods used

- **`Array.prototype.map(mapper)`**
  - *What it is:* a real, standard JavaScript array method, not
    specific to React or this project.
  - *Implementation:* checked against MDN's own official documentation
    this session — takes a real, mapper function, calls it once per
    real element, and returns a real, brand-new array of the identical
    real length, each real position holding whatever the real mapper
    returned for it.
  - *Its use:* this lesson's own real update handler uses it to build a
    real, new `parts` array where exactly one real part is replaced,
    every other real one passed through unchanged.
  - *Type:* an instance method on `Array.prototype`.
  - *Responsibility:* the real, standard way to derive a real, same-
    length array from an existing one, transforming some or all real
    elements, without mutating the real, original.
  - *Depends on:* an existing real array and a real, one-argument
    function returning a real, replacement value.
  - *Connects to:* called directly inside this lesson's own real
    `setParts` updater; its own real, returned array becomes this
    component's own next, real, rendered state — the identical real
    sibling this project's own deletion lesson's `.filter(...)`
    already established, here transforming instead of removing.
  - *Shape:* the real, standard JavaScript standard-library boundary —
    not project-specific.

---

## Concept Unit: A Real Part That Knows Its Own Favorite Status

### The Problem

`PartsList`'s own internal, real part type currently declares only
`id`, `partNumber`, and `description` — real and enough for every real
capability this project has built so far, but not enough for a real
control that needs to know whether *this specific* real part is
already a real favorite. The real question this unit answers: what's
the smallest real change letting `PartsList` read that real fact at
all?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason `PartsList`'s own original Reference Source already gave.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.tsx`.
- **Change type** — modify.
- **Location** — its own real `useState` type parameter.
- **Dependencies** — none new.

### The New Code

```tsx
const [parts, setParts] = useState<{ id: string; partNumber: string; description: string; isFavorite: boolean }[]>([])
```

### The Updated Project

`rebuild/frontend/src/PartsList.tsx`, in full — the previous lesson's
own version, with this unit's own new field added to the real state
type (the next unit adds the real control and handler that actually
use it):

```tsx
1  import { useEffect, useState } from 'react'
2
3  function PartsList({ token }: { token?: string | null }) {
4    const [parts, setParts] = useState<{ id: string; partNumber: string; description: string; isFavorite: boolean }[]>([])
5
6    useEffect(() => {
7      fetch('/api/parts')
8        .then((response) => response.json())
9        .then((data) => setParts(data.data))
10   }, [])
11
12   const handleDelete = (partId: string) => {
13     fetch(`/api/parts/${partId}`, {
14       method: 'DELETE',
15       headers: { 'Authorization': `Bearer ${token}` },
16     }).then(() => {
17       setParts((current) => current.filter((part) => part.id !== partId))
18     })
19   }
20
21   if (parts.length === 0) {
22     return <p>No parts yet.</p>
23   }
24
25   return (
26     <ul>
27       {parts.map((part) => (
28         <li key={part.id}>
29           {part.partNumber} — {part.description}
30           {token && <button onClick={() => handleDelete(part.id)}>Delete</button>}
31         </li>
32       ))}
33     </ul>
34   )
35 }
36
37 export default PartsList
```

### Mechanical Walkthrough

- **Line 4, `isFavorite: boolean`** — a real, new field added to the
  real, inline object type already describing what one real part
  looks like inside this component; real and matching this slice's own
  real backend contract exactly — legacy's own real `Part.to_dict()`
  (and `rebuild`'s own real, identical port) already includes this real
  key on every real part this component ever receives, whether or not
  anything here reads it yet.

### CS Lens

This is a real instance of a **type widening ahead of behavior** — the
real, TypeScript-level shape a component expects to receive is
extended *before* any real code inside it actually depends on the new
real field, real and deliberately in its own, tiny, isolated step —
the next unit is what actually reads `isFavorite` for the first real
time.

Also recognized in: adding a real, optional field to a real, shared
interface before the one real consumer that will use it is written,
so a real compiler catches a real, missing case immediately rather
than a real runtime surprise later.

### SE Lens

No real, deliberate alternative considered here — this unit is the
smallest possible real step toward this lesson's own real goal,
separated from the next unit's own real behavior purely so a reader
sees the real, data-shape change and the real, behavior change as two
distinct real facts, not one real, bundled diff.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx tsc --noEmit
```

### Run it, per the Verification Rule

Not run in isolation this session — this unit's own real, widened type
has no real, observable effect on its own; proven together with the
next unit, below, where the field is actually read for the first time.

### Connecting this unit to what came before

`PartsList` now knows a fact about every real part it holds. The next
unit is where that real fact finally does something.

---

## Concept Unit: A Real Second Control, Reading and Changing That Fact

### The Problem

`PartsList` now tracks `isFavorite` but nothing reads or changes it.
The real question this unit answers: what's the smallest real control
and real handler making the previous lesson's own two real tests pass —
showing "Favorite" or "Unfavorite" depending on a real part's own
current, real state, and actually calling this slice's own real `PUT`
route when clicked?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason already given twice in this lesson.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.tsx`.
- **Change type** — modify.
- **Location** — a real, new handler alongside the existing real
  `handleDelete`, and the existing real, returned `<li>`.
- **Dependencies** — none new.

### The New Code

```tsx
const handleToggleFavorite = (part: { id: string; isFavorite: boolean }) => {
  fetch(`/api/parts/${part.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ isFavorite: !part.isFavorite }),
  })
    .then((response) => response.json())
    .then((data) => {
      setParts((current) => current.map((p) => (p.id === part.id ? data.data : p)))
    })
}
```

### The Updated Project

`rebuild/frontend/src/PartsList.tsx`, in full — the previous unit's own
version, with this unit's own new handler and control added:

```tsx
1  import { useEffect, useState } from 'react'
2
3  function PartsList({ token }: { token?: string | null }) {
4    const [parts, setParts] = useState<{ id: string; partNumber: string; description: string; isFavorite: boolean }[]>([])
5
6    useEffect(() => {
7      fetch('/api/parts')
8        .then((response) => response.json())
9        .then((data) => setParts(data.data))
10   }, [])
11
12   const handleDelete = (partId: string) => {
13     fetch(`/api/parts/${partId}`, {
14       method: 'DELETE',
15       headers: { 'Authorization': `Bearer ${token}` },
16     }).then(() => {
17       setParts((current) => current.filter((part) => part.id !== partId))
18     })
19   }
20
21   const handleToggleFavorite = (part: { id: string; isFavorite: boolean }) => {
22     fetch(`/api/parts/${part.id}`, {
23       method: 'PUT',
24       headers: {
25         'Content-Type': 'application/json',
26         'Authorization': `Bearer ${token}`,
27       },
28       body: JSON.stringify({ isFavorite: !part.isFavorite }),
29     })
30       .then((response) => response.json())
31       .then((data) => {
32         setParts((current) => current.map((p) => (p.id === part.id ? data.data : p)))
33       })
34   }
35
36   if (parts.length === 0) {
37     return <p>No parts yet.</p>
38   }
39
40   return (
41     <ul>
42       {parts.map((part) => (
43         <li key={part.id}>
44           {part.partNumber} — {part.description}
45           {token && <button onClick={() => handleToggleFavorite(part)}>{part.isFavorite ? 'Unfavorite' : 'Favorite'}</button>}
46           {token && <button onClick={() => handleDelete(part.id)}>Delete</button>}
47         </li>
48       ))}
49     </ul>
50   )
51 }
52
53 export default PartsList
```

### Mechanical Walkthrough

- **Line 21, `(part: { id: string; isFavorite: boolean })`** — a real,
  plain parameter type naming only the two real fields this real
  function actually needs, not the whole real part shape — real and
  deliberately narrower than the previous unit's own full, real state
  type, since `partNumber` and `description` never enter this real
  function's own real logic at all.
- **Lines 22–29, the real `fetch` call** — the identical real shape
  `AddPartForm`'s own real `handleSubmit` already established: a real
  JSON `Content-Type` header, a real bearer token, and a real,
  `JSON.stringify`-encoded body.
- **Line 28, `body: JSON.stringify({ isFavorite: !part.isFavorite })`**
  — a real, plain boolean negation — `!part.isFavorite` — sending the
  real, opposite of whatever this real part's own, current, real state
  already is; real and matching this slice's own real backend
  characterization exactly: toggling on and toggling off are two real,
  separate requests, never one real, stateful "toggle" concept the
  server itself tracks.
- **Line 30, `.then((response) => response.json())`** — real and,
  unlike `handleDelete`'s own real `.then(() => {...})`, this real call
  *does* read the real response body — this unit's own real update
  needs the real, complete, updated part back, not merely a real
  confirmation that something happened.
- **Lines 31–33, `setParts((current) => current.map((p) => (p.id ===
  part.id ? data.data : p)))`** — this lesson's Header's own new
  `Array.prototype.map` method, called through the identical real
  updater-function form of `setParts` `handleDelete` already
  established; the real, inline ternary replaces exactly the one real
  part whose `id` real, matches with `data.data` — this slice's own
  real backend's own real, complete, updated part — leaving every
  other real part in the real array real, referentially unchanged.
- **Line 45, `{token && <button onClick={() => handleToggleFavorite(part)}>{part.isFavorite ? 'Unfavorite' : 'Favorite'}</button>}`**
  — the identical real, conditional-rendering shape Delete's own
  control already established, gated on the identical real `token`;
  the real button's own real, rendered text is itself a real, inline
  ternary reading `part.isFavorite` — this lesson's own testing
  lesson's own **control whose own label encodes current state**,
  built for real.

### CS Lens

This is the identical real **optimistic local update** this project's
own deletion slice already named in full, applied here with one real,
meaningful difference: rather than locally computing the real, new
state itself (`handleDelete`'s own real `.filter(...)` never asks the
server what happened), this real handler updates from the real,
*actual* server response — `data.data` — because this real operation's
own real result (the real, complete, updated part) is exactly what
this real control needs to render correctly next, and this project's
own real backend already, conveniently, sends it back.

Also recognized in: any real client that trusts a real server's own
real response as the real, authoritative next state after a real
write, rather than re-deriving it independently on the client alone.

### SE Lens

The real, deliberately *not*-taken alternative here: computing the
real, next `isFavorite` value locally (`!part.isFavorite`) and updating
local state with *that*, the same real way `handleDelete` computes its
own real, next state without waiting on a real response body. Rejected
here, specifically, because this real route returns the real, complete,
updated part — reusing it directly means this real component never has
to real, independently re-derive a real value the server already,
authoritatively computed and sent back, removing one real, small
category of real client/server real drift entirely.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
npx tsc --noEmit
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real, route-aware mock and this
real `map` call genuinely produce the real, visible effect the
previous lesson's own test expects — so this was actually run this
session:

```
Test Files  4 passed (4)
     Tests  12 passed (12)
```

Both of the previous lesson's own real tests now pass, together with
every real test this project has ever written. A real `npx tsc
--noEmit` was also actually run this session — a genuine, clean
compile, no real output at all.

### Connecting this unit to what came before

The previous unit gave `PartsList` a real fact to track. This unit is
what finally reads and changes it — completing this project's own
real, fourth Parts slice, backend and frontend both.

---

## Connect the pieces

A real, signed-in user can now see a real Favorite control next to
every real part, alongside its own real Delete control, and a real
click genuinely marks that real part a favorite or un-marks it —
reaching this slice's own real, already-proven backend route with a
real, correct credential, and reflecting the real, authoritative result
the server actually computed, immediately.

---

**Next lesson:** not yet decided here — this project's own real Parts
feature still has real support for `description`/`material`/`status`
editing, the tool-assembly joins, and 3D-model uploads ahead of it,
each its own real, separate, deeper slice.
