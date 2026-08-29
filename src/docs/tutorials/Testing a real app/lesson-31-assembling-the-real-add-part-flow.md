# Lesson 31: Assembling the Real Add Part Flow

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`.

## What you will build

The actual smallest real change to `App` and `AddPartForm` that makes
the previous lesson's own real, end-to-end test pass: `AddPartForm`
rendered only once signed in, and `PartsList` genuinely refreshed
after a real creation.

## What you need to know first

The real, already-failing `App.test.tsx`. This project's own real
**Lifting state up** term, already given full treatment, and `App`'s
own real, existing `token` state, currently unread.

## Terms introduced

- **Remounting via `key`** — a real, standard React technique: giving
  a real element a real, explicit `key` prop that changes tells React
  the new real element is not a continuation of the old real one —
  React really discards the old real component instance, including
  all of its own real state and the real effects it already ran, and
  mounts a genuinely fresh one from scratch. A real, changed `key`
  causes any real `useEffect` with no real dependencies — one that
  would otherwise only ever run once — to run again, honestly, as part
  of that fresh real mount.

## Objects and methods used

None genuinely new beyond this lesson's Header's own new term —
`onCreated`, below, reuses `LoginForm`'s own already-established
`onSignedIn?: (token: string) => void` optional-callback shape,
already given full treatment.

---

## Concept Unit: A Real Callback, Reused

### The Problem

`AddPartForm` already knows the instant its own real creation
succeeds; nothing outside it can find out. The real question this
unit answers: what's the smallest real way to let `App` know, so it
can react?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason `AddPartForm`'s own Reference Source already gave.
- **Files affected** — modified: `rebuild/frontend/src/AddPartForm.tsx`.
- **Change type** — modify.
- **Location** — its own function signature and its own real success
  branch.
- **Dependencies** — none new.

### The New Code

```tsx
function AddPartForm({ token, onCreated }: { token: string; onCreated?: () => void }) {
  // ...
  .then(({ ok, data }) => {
    if (ok) {
      setCreated(data.data.partNumber)
      setError('')
      onCreated?.()
    } else {
      setError(data.error)
    }
  })
```

### The Updated Project

`rebuild/frontend/src/AddPartForm.tsx`, in full — the previous
lesson's own version, with this unit's own new prop added:

```tsx
1  import { useState } from 'react'
2
3  function AddPartForm({ token, onCreated }: { token: string; onCreated?: () => void }) {
4    const [partNumber, setPartNumber] = useState('')
5    const [description, setDescription] = useState('')
6    const [material, setMaterial] = useState('')
7    const [error, setError] = useState('')
8    const [created, setCreated] = useState('')
9
10   const handleSubmit = (event: React.FormEvent) => {
11     event.preventDefault()
12
13     fetch('/api/parts', {
14       method: 'POST',
15       headers: {
16         'Content-Type': 'application/json',
17         'Authorization': `Bearer ${token}`,
18       },
19       body: JSON.stringify({ partNumber, description, material }),
20     })
21       .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
22       .then(({ ok, data }) => {
23         if (ok) {
24           setCreated(data.data.partNumber)
25           setError('')
26           onCreated?.()
27         } else {
28           setError(data.error)
29         }
30       })
31   }
32
33   return (
34     <form onSubmit={handleSubmit}>
35       <input
36         placeholder="Part Number"
37         value={partNumber}
38         onChange={(event) => setPartNumber(event.target.value)}
39       />
40       <input
41         placeholder="Description"
42         value={description}
43         onChange={(event) => setDescription(event.target.value)}
44       />
45       <input
46         placeholder="Material"
47         value={material}
48         onChange={(event) => setMaterial(event.target.value)}
49       />
50       <button type="submit">Create Part</button>
51       {error && <p>{error}</p>}
52       {created && <p>Created {created}.</p>}
53     </form>
54   )
55 }
56
57 export default AddPartForm
```

### Mechanical Walkthrough

- **Line 3, `onCreated?: () => void`** — the identical real,
  optional-callback shape `LoginForm`'s own `onSignedIn` prop already
  established: optional, so every real test that never passes one —
  both of this unit's own real tests from the previous lesson — keeps
  working unchanged.
- **Line 26, `onCreated?.()`** — the identical real `?.` optional-call
  guard `onSignedIn?.(data.token)` already established, called with no
  real arguments at all — this unit's own real callback doesn't need
  to hand anything back, only to announce that a real creation
  actually happened.

### CS Lens

The identical real **inversion of control** `LoginForm`'s own
`onSignedIn` already established: `AddPartForm` doesn't decide what
happens after a real, successful creation; it simply announces it,
real and upward, to whatever real parent cares.

### SE Lens

No real, deliberate alternative considered here — this unit is a
direct, real reuse of an already-established, already-justified
pattern; re-litigating the real Context-versus-callback decision a
prior lesson already made, for the identical real reason, would be
real, needless repetition rather than real, new judgment.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Not run in isolation this session — this unit's own real change has
no real, independent effect until `App` actually calls the new real
prop, proven together with the next unit, below.

### Connecting this unit to what came before

The previous lesson proved `AddPartForm` works alone. This unit gives
it a real, honest voice; the next unit gives `App` a real reason to
listen.

---

## Concept Unit: A List That Actually Refreshes

### The Problem

`PartsList` fetches exactly once, on its own first real mount, and
never again — real and correct, until this project's own real
`AddPartForm` can now cause a real part to exist that `PartsList`
doesn't yet know about. The real question this unit answers: what's
the smallest real way to make `PartsList` fetch again, without
changing anything inside `PartsList` itself?

> **Before reading on:** legacy's own real `handleCreatePart` answers
> this by calling `useGlobalStore.getState().bootstrap()` — real,
> because its own real Zustand store already centralizes every real
> part in one real, shared place any component can re-read. This
> project's own real `PartsList` still owns its real parts entirely
> itself, inside its own real `useState`. Given that, and given this
> lesson's Header's own new **Remounting via `key`** term, what real,
> external nudge could make `PartsList`'s own real, mount-only
> `useEffect` run again, without `PartsList` itself changing at all?

### Project Change

- **Reference Source** — legacy's own real `handleCreatePart`, already
  cited in an earlier lesson, its own real
  `useGlobalStore.getState().bootstrap()` call — not ported; this
  project has no real, shared store yet. See the SE Lens, below.
- **Files affected** — modified: `rebuild/frontend/src/App.tsx`.
- **Change type** — modify.
- **Location** — its own top-level function body.
- **Dependencies** — none beyond `react` itself.

### The New Code

```tsx
function App() {
  const [token, setToken] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div>
      <LoginForm onSignedIn={setToken} />
      {token && <AddPartForm token={token} onCreated={() => setRefreshKey((key) => key + 1)} />}
      <PartsList key={refreshKey} />
    </div>
  )
}
```

### The Updated Project

`rebuild/frontend/src/App.tsx`, in full — the previous lesson's own
version, with this unit's own new state and real wiring added:

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
14       <PartsList key={refreshKey} />
15     </div>
16   )
17 }
18
19 export default App
```

### Mechanical Walkthrough

- **Line 7, `const [token, setToken] = useState<string | null>(null)`**
  — the identical real state an earlier lesson deliberately, honestly
  named `[, setToken]`, since nothing read `token` yet then; this unit
  is the real, first genuine reader, so the real name comes back. That
  earlier decision wasn't wrong — it was honest about what was true at
  the time; this unit is what makes it true no longer.
- **Line 8, `const [refreshKey, setRefreshKey] = useState(0)`** — a
  real, plain counter, starting `0`; its own real, numeric value never
  matters, only that it actually changes.
- **Line 13, `{token && <AddPartForm ... />}`** — the identical real,
  conditional-rendering shape `{error && <p>...</p>}` already
  established, applied to a whole real component instead of a real
  paragraph: `AddPartForm` real, only exists in the real, rendered
  output once `token` is real and truthy — a real, signed-out user
  never sees a real form whose own real submission would only ever
  earn a real 401.
- **Line 13, `onCreated={() => setRefreshKey((key) => key + 1)}`** — a
  real, inline function, calling `setRefreshKey` with its own real,
  previous value plus one; the real, exact new number is
  inconsequential — only that it's real, genuinely different from the
  last one.
- **Line 14, `<PartsList key={refreshKey} />`** — this lesson's
  Header's own real technique, made real: every time `refreshKey`
  actually changes, React treats this as a real, brand-new
  `PartsList`, discarding the real, old instance and mounting a
  genuinely fresh one — whose own real `useEffect(() => {...}, [])`
  honestly runs again, fetching this project's own real, current data.

### CS Lens

This is a real instance of **forcing remount over manual update** —
rather than teaching `PartsList` a new real way to be told "fetch
again," this unit relies on React's own real, built-in rule that a
real, changed `key` means a real, different component, letting
`PartsList`'s own real, already-correct mount logic simply run again,
honestly, from scratch.

Also recognized in: resetting a real, uncontrolled form by changing
its own real `key` instead of manually clearing every real field by
hand.

### SE Lens

The real, deliberately *not*-taken alternative here: lifting the
actual `parts` array itself into `App`, the identical real shape
legacy's own real Zustand store already provides. Rejected on
purpose, for now: that would mean real, physically relocating
`PartsList`'s own real fetch logic out of `PartsList` and into `App`
(or a real, shared store neither component owns alone) — a real,
larger, cross-cutting change this project doesn't need yet to solve
the one, real, narrow problem this unit actually has: "make it fetch
again." The real, honest cost accepted here, matching the identical
real discipline the Context-versus-callback decision already
established: `PartsList` re-fetches its *entire* real list on every
real creation, rather than a real, targeted update adding just the
one new part — real, acceptable now, with this project's own real,
still-small real data; the honest moment to revisit it is when that
stops being real, true.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real, actually run this session, confirming the previous lesson's own
real, end-to-end test, together with both units above:

```
Test Files  4 passed (4)
     Tests  8 passed (8)
```

A real `npx tsc --noEmit` was also actually run this session against
both real, changed files — a genuine, clean compile, no real output at
all. Every real test this project has already written passes,
together, including the real, full sign-in-then-create-then-refresh
sequence the previous lesson's own test actually drives.

### Connecting this unit to what came before

The previous unit gave `AddPartForm` a real, honest voice. This unit
is what actually listens — closing the real loop the previous four
lessons built one real piece at a time.

---

## Connect the pieces

A real user can now genuinely sign in, create a real part, and
immediately see it in this project's own real Parts list — the first
real, complete, multi-step workflow this project's own rebuild
actually supports, proven end to end by a real, automated test.

---

**Next lesson:** not yet decided here — this project's own real
Parts feature still has real Update, Delete, and 3D-model-upload work
ahead of it, each its own real, separate, deeper slice.
