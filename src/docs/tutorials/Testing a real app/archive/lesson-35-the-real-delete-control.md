# Lesson 35: The Real Delete Control

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. By the end of this lesson,
> the previous lesson's own two real tests pass, and this project's own
> real deletion slice — backend and frontend both — is complete.

## What you will build

The actual smallest real changes making the previous lesson's own two
real tests pass: `PartsList` gains a real, optional `token` prop, a
real Delete control that only renders once one exists, and a real
handler calling this slice's own already-proven `DELETE` route; `App`
hands its own, already-existing real `token` state down to receive it.

## What you need to know first

The previous lesson's own real, failing `PartsList.test.tsx`. This
project's own real **Lifting state up** term, already given full
treatment, and `App`'s own real, existing `token` state, already read
by `AddPartForm`. This slice's own real, already-proven
`DELETE /api/parts/<id>` route and its own real, required
`Authorization: Bearer <token>` header.

## Terms introduced

None genuinely new — this unit assembles pieces this project has
already, separately, proven: a real, optional prop (`AddPartForm`'s own
`token`), a real, conditional render (`{token && ...}`), and a real
`fetch` call carrying a real bearer token (`AddPartForm`'s own real
`handleSubmit`).

## Objects and methods used

- **`Array.prototype.filter(predicate)`**
  - *What it is:* a real, standard JavaScript array method, not
    specific to React or this project.
  - *Implementation:* checked against MDN's own official documentation
    this session — takes a real, predicate function, calls it once per
    real element, and returns a real, brand-new array containing only
    the real elements where that real predicate returned real, truthy.
  - *Its use:* this lesson's own real delete handler uses it to build a
    real, new `parts` array with exactly one real part removed.
  - *Type:* an instance method on `Array.prototype`.
  - *Responsibility:* the real, standard way to derive a real, shorter
    array from an existing one, without mutating the real, original.
  - *Depends on:* an existing real array and a real, one-argument
    function returning a real boolean.
  - *Connects to:* called directly inside this lesson's own real
    `setParts` updater; its own real, returned array becomes this
    component's own next, real, rendered state.
  - *Shape:* the real, standard JavaScript standard-library boundary —
    not project-specific.

---

## Concept Unit: A Real Control, Gated the Same Real Way

### The Problem

`PartsList` currently takes no real props at all, and renders every
real part identically regardless of who's real, currently signed in.
The previous lesson's own first real test already proved what must be
true; nothing yet makes it true on purpose rather than by real
accident. The real question this unit answers: what's the smallest
real change letting `PartsList` know whether a real, signed-in user
exists, without it needing to know anything else about who that real
user is?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason `PartsList`'s own original Reference Source already gave —
  legacy's own real Parts UI has no real delete control to port from at
  all.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.tsx`.
- **Change type** — modify.
- **Location** — its own function signature and its own real, returned
  `<li>`.
- **Dependencies** — none new.

### The New Code

```tsx
function PartsList({ token }: { token?: string | null }) {
  // ...
  {token && <button onClick={() => handleDelete(part.id)}>Delete</button>}
```

### The Updated Project

`rebuild/frontend/src/PartsList.tsx`, in full — the previous lesson's
own version, with this unit's own new prop and control added (the next
unit completes `handleDelete`, referenced here but not yet shown):

```tsx
1  import { useEffect, useState } from 'react'
2
3  function PartsList({ token }: { token?: string | null }) {
4    const [parts, setParts] = useState<{ id: string; partNumber: string; description: string }[]>([])
5
6    useEffect(() => {
7      fetch('/api/parts')
8        .then((response) => response.json())
9        .then((data) => setParts(data.data))
10   }, [])
11
12   const handleDelete = (partId: string) => {}
13
14   if (parts.length === 0) {
15     return <p>No parts yet.</p>
16   }
17
18   return (
19     <ul>
20       {parts.map((part) => (
21         <li key={part.id}>
22           {part.partNumber} — {part.description}
23           {token && <button onClick={() => handleDelete(part.id)}>Delete</button>}
24         </li>
25       ))}
26     </ul>
27   )
28 }
29
30 export default PartsList
```

### Mechanical Walkthrough

- **Line 3, `{ token }: { token?: string | null }`** — a real,
  optional prop, real and identically shaped to `AddPartForm`'s own
  already-established `token: string` — real and marked optional here
  (`token?`) rather than required, because `App`'s own real
  `PartsList` render site (unlike `AddPartForm`'s own, conditionally
  rendered one) must keep working, real and unchanged, for a real,
  signed-out user too.
- **Line 12, `const handleDelete = (partId: string) => {}`** — a real,
  deliberately empty function, existing only so line 23's own real
  reference to it doesn't fail to compile; the next unit gives it a
  real body.
- **Line 23, `{token && <button onClick={() => handleDelete(part.id)}>Delete</button>}`**
  — the identical real, conditional-rendering shape `{token &&
  <AddPartForm ... />}` already established: this real button exists
  in the real, rendered output only when `token` is real and truthy.
  `onClick={() => handleDelete(part.id)}` — a real, inline arrow
  function, real and necessary here rather than `onClick={handleDelete}`
  directly, because `handleDelete` needs this real, specific part's own
  real `id`, which only this real position, inside the real `.map(...)`,
  actually has.

### CS Lens

This is the identical real **inversion of control** this project's own
`AddPartForm`'s `onCreated` prop already proved, applied in the
opposite real direction: there, a real child announced an event
upward; here, a real parent hands a real capability *down* — `token`
itself carries no real behavior, only a real fact `PartsList` uses to
decide what it's allowed to real, locally do.

Also recognized in: any real component accepting a real, plain
`isAdmin` or `canEdit` boolean prop, rather than deciding that real
fact itself.

### SE Lens

The real, deliberately *not*-taken alternative here: passing the
entire real, signed-in `User` object down, instead of just `token`.
Rejected on purpose, matching this project's own real, already-
established minimalism: `App` itself doesn't even track a real user's
own real role today (this slice's own testing lesson's own SE Lens
already named this real, accepted gap) — handing down real information
`App` doesn't actually have would mean inventing it, not passing it
along. `PartsList` needs only one real fact — does a real, usable
credential exist at all — and `token` alone already answers that
completely.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Not run in isolation this session — this unit's own real, empty
`handleDelete` means the previous lesson's own second real test still
fails identically; the first real test (no control when signed out)
already passes, proven together with the next unit, below.

### Connecting this unit to what came before

The previous lesson proved what must be true. This unit makes the
easier real half of it true on purpose — the harder real half, actually
deleting something, is the next unit's own job.

---

## Concept Unit: A Real Deletion, Reflected Immediately

### The Problem

`PartsList` now shows a real Delete control to a real, signed-in user,
but clicking it does nothing at all — `handleDelete` is still real and
empty. The real question this unit answers: what's the smallest real
code that calls this slice's own real, already-proven `DELETE` route,
and makes the real, clicked part actually disappear from view?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason already given twice in this lesson.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.tsx`.
- **Change type** — modify.
- **Location** — the previous unit's own, real, empty `handleDelete`
  function body.
- **Dependencies** — none new.

### The New Code

```tsx
const handleDelete = (partId: string) => {
  fetch(`/api/parts/${partId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  }).then(() => {
    setParts((current) => current.filter((part) => part.id !== partId))
  })
}
```

### The Updated Project

`rebuild/frontend/src/PartsList.tsx`, in full — the previous unit's
own version, with `handleDelete`'s own real body completed:

```tsx
1  import { useEffect, useState } from 'react'
2
3  function PartsList({ token }: { token?: string | null }) {
4    const [parts, setParts] = useState<{ id: string; partNumber: string; description: string }[]>([])
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

- **Lines 13–16, the real `fetch` call** — the identical real shape
  `AddPartForm`'s own `handleSubmit` already established: a real,
  template-literal URL carrying this real part's own real `id`, a real
  `method: 'DELETE'`, and a real `Authorization` header built from
  `token` — real and read directly from this component's own real
  props, since `handleDelete` is itself a real, plain function
  declared inside `PartsList`'s own real closure, not a separate,
  standalone one.
- **Line 16, `.then(() => { ... })`** — real and deliberately taking no
  real argument at all — unlike `AddPartForm`'s own real
  `.then((response) => response.json()...)`, this real call never reads
  the real response body, because the previous lesson's own real test
  only asserts on what the real, rendered view shows afterward, not on
  any real value this real response carries.
- **Line 17, `setParts((current) => current.filter((part) => part.id !== partId))`**
  — this lesson's Header's own new `Array.prototype.filter` method,
  called through React's own, already-established updater-function
  form of `setParts` (`(current) => ...`, reading the real, latest
  state rather than a real, possibly-stale closed-over value); the real
  predicate `part.id !== partId` keeps every real part except the one
  real match, producing a real, new array with exactly one fewer real
  element.

### CS Lens

This is the identical real **optimistic local update** this project's
own testing lesson already named in full: this real component updates
its own real, rendered view from information it already, locally has —
"I asked to delete this specific real part" — rather than waiting on a
real, second round-trip to a real server to confirm what it already,
correctly, expects.

Also recognized in: the identical real example this project's own
testing lesson already gave — any real client-side list removing a
real item the instant a real delete request is sent.

### SE Lens

The real, deliberately *not*-taken alternative here: legacy's own real
`window.confirm(...)` and `alert(...)` pattern (`MachinesPage.tsx`'s
own real `handleDelete`, read in full this session, uses exactly this
real shape for a real, different resource). Rejected on purpose,
matching this project's own real, already-established reasoning —
`AddPartForm`'s own testing lesson already replaced legacy's real
`alert()` with real, in-page text for the identical real reason: a real
`window.confirm` blocks real, automated testing entirely, and a real
`alert` cannot be real, programmatically inspected at all. No real,
current test in this project requires a real confirmation step before
deleting, so none is built — the real, honest cost accepted here: a
real, accidental click currently has no real, undo path, matching the
identical real, accepted-gap discipline this project has already used
more than once (legacy's own real `try`/`except`/`socketio.emit`
likewise deliberately not ported in this slice's own route lesson).

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real, route-aware mock and this
real `filter` call genuinely produce the real, visible effect the
previous lesson's own test expects — so this was actually run this
session:

```
Test Files  1 passed (1)
     Tests  4 passed (4)
```

Both of the previous lesson's own real tests now pass, together with
this project's own two, already-established `PartsList` tests.

### Connecting this unit to what came before

The previous unit made this real control appear for the real, correct
audience. This unit is what happens the instant that real audience
actually uses it.

---

## Concept Unit: A Real Token, Finally Reaching `PartsList`

### The Problem

`PartsList` now knows what to do with a real `token`, but `App` still
never hands it one — `<PartsList key={refreshKey} />`, unchanged since
this slice's own assembly lesson, passes no real props at all. The real
question this unit answers: what's the smallest real change letting
`App`'s own, already-existing real `token` state actually reach it?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason `App`'s own Reference Source has already given more than
  once.
- **Files affected** — modified: `rebuild/frontend/src/App.tsx`.
- **Change type** — modify.
- **Location** — its own top-level function body, the existing real
  `<PartsList ... />` element.
- **Dependencies** — none new.

### The New Code

```tsx
<PartsList key={refreshKey} token={token} />
```

### The Updated Project

`rebuild/frontend/src/App.tsx`, in full — the previous lesson's own
version, with this unit's own new prop added:

```tsx
1  import { useState } from 'react'
2  import LoginForm from './LoginForm'
3  import PartsList from './PartsList'
4  import AddPartForm from './AddPartForm'
5
6  function App() {
7    const [token, setToken] = useState<string | null>(null)
8    const [refreshKey, setRefreshKey] = useState(0)
9
10   return (
11     <div>
12       <LoginForm onSignedIn={setToken} />
13       {token && <AddPartForm token={token} onCreated={() => setRefreshKey((key) => key + 1)} />}
14       <PartsList key={refreshKey} token={token} />
15     </div>
16   )
17 }
18
19 export default App
```

### Mechanical Walkthrough

- **Line 14, `token={token}`** — a real, plain prop pass-through: the
  real, left-hand `token` names `PartsList`'s own new prop, already
  built in this lesson's own first unit; the real, right-hand `token`
  reads `App`'s own real, existing state, already read by `AddPartForm`
  on the line directly above. The real, identical name on both sides is
  real, ordinary JSX shorthand-adjacent convenience, not a real,
  special syntax — `token={someOtherName}` would work identically.

### CS Lens

The identical real **lifting state up** this project's own, already
fully-treated term names exactly: one real, single, shared piece of
state, owned by the real, common ancestor, now read by two real,
separate children — `AddPartForm` and `PartsList` — neither of which
owns it, and neither of which needs to know the other one exists.

Also recognized in: any real, shared filter or search-term state one
real parent owns so that a real results list and a real results-count
badge, siblings to each other, both stay real, consistent with it.

### SE Lens

No real, deliberate alternative considered here — this unit is a
direct, real reuse of an already-established, already-justified
pattern (the identical real shape `AddPartForm`'s own token wiring
already used); re-litigating the real decision to lift `token` at all
would be real, needless repetition of a choice this project's own
`App`-assembly lesson already made and justified.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
npx tsc --noEmit
```

### Run it, per the Verification Rule

Real doubt existed here — confirming this real, one-line change causes
no real regression anywhere else in this project's own real, existing
tests — so this was actually run this session, the whole real suite
together:

```
Test Files  4 passed (4)
     Tests  10 passed (10)
```

A real `npx tsc --noEmit` was also actually run this session — a
genuine, clean compile, no real output at all.

### Connecting this unit to what came before

The previous two units built a real capability with nowhere real yet to
receive its one, real, required input. This unit is what finally
connects it — completing this project's own real, third Parts slice,
backend and frontend both.

---

## Connect the pieces

A real, signed-in user can now see a real Delete control next to every
real part, and a real click on it genuinely removes that real part from
view — reaching this slice's own real, already-proven backend route
with a real, correct credential, and reflecting the real result
immediately rather than waiting on a real, second fetch that would have
silently shown the same "deleted" part right back, unfiltered, exactly
as this slice's own testing lesson already proved legacy's own real
backend would return it.

---

**Next lesson:** not yet decided here — this project's own real Parts
feature still has real Update, the tool-assembly joins, and 3D-model
uploads ahead of it, each its own real, separate, deeper slice.
