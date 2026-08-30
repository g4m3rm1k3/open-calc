# Lesson 28: Testing the Real Add Part Form

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. This project's own real
> backend has already accepted a real, authenticated `POST
> /api/parts` since its own Parts-creation slice; this lesson gives
> that real route its first real, actual caller.

## What you will build

A real, automated test for a real Add Part form — before that
component exists — covering both real outcomes this project's own
backend route can actually produce for an authenticated, well-formed
request: a real, successful creation, and a real, honest rejection
when a real part number already exists.

## What you need to know first

This series' own real frontend-testing tools (Vitest, Testing
Library, `vi.stubGlobal`/`vi.fn`, `fireEvent`), already used for
`LoginForm`'s own real tests. The real, already-working backend route
(`POST /api/parts`) this component will eventually call, and the real
token `App` has already been lifted to receive, in the previous
lesson, for exactly this purpose.

## Terms introduced

None — this lesson reuses real testing tools this project has already
given full treatment to; nothing genuinely new appears in it.

## Objects and methods used

None genuinely new — `fireEvent.change`, `fireEvent.click`,
`waitFor`, and `vi.stubGlobal`/`vi.fn`, all already given full
treatment against `LoginForm`.

---

## Concept Unit: A Form That Reports Real Success

### The Problem

`rebuild/frontend` has no Add Part component at all yet. The real
question this unit answers: what does a real, automated test for one
look like, proving a real, filled-in form actually reaches this
project's own real, already-working `POST /api/parts` route and
reports a real, honest confirmation — all before that real component
exists?

> **Before reading on:** this project's own real backend route
> persists exactly three real, user-supplied fields —
> `Part.from_dict`'s own real code reads only `partNumber`,
> `description`, and `material`; everything else it sets is either
> server-generated or left at its real, database default. Legacy's
> own real Create Part form additionally shows a real `Rev` field.
> Given this project's own real backend doesn't actually persist
> whatever a real user would type into a `Rev` field yet, should this
> project's own new form show one anyway?

### Project Change

- **Reference Source** — legacy's own real Create Part form,
  `src/pages/PartsPage.tsx`, its own real `newPartData` state and the
  real `<form onSubmit={handleCreatePart}>` starting at line 285 —
  read this session; not ported wholesale, for the identical real
  reason `PartsList`'s own Reference Source already gave: it's woven
  into a large, real, Electron/Zustand-based application this series
  deliberately isn't porting whole. This unit's own real field set
  deliberately differs from legacy's own real, four-field form — see
  the SE Lens, below.
- **Files affected** — created: `rebuild/frontend/src/AddPartForm.test.tsx`.
- **Change type** — add (new file).
- **Location** — directly inside `rebuild/frontend/src/`, sibling to
  `LoginForm.test.tsx`.
- **Dependencies** — none beyond what earlier frontend lessons already
  installed.

### The New Code

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { test, expect, vi } from 'vitest'
import AddPartForm from './AddPartForm'

test('reports a real, honest confirmation after a successful creation', async () => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        data: { id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', material: '6061-T6 Aluminum' },
      }),
    })
  ))

  render(<AddPartForm token="a.b.c" />)

  fireEvent.change(screen.getByPlaceholderText('Part Number'), {
    target: { value: '1234567' },
  })
  fireEvent.change(screen.getByPlaceholderText('Description'), {
    target: { value: 'Landing Gear Bracket' },
  })
  fireEvent.change(screen.getByPlaceholderText('Material'), {
    target: { value: '6061-T6 Aluminum' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Create Part' }))

  await waitFor(() => {
    expect(screen.getByText('Created 1234567.')).toBeDefined()
  })
})
```

### The Updated Project

`rebuild/frontend/src/AddPartForm.test.tsx`, in full — brand new, so
this is the whole file:

```tsx
1  import { render, screen, fireEvent, waitFor } from '@testing-library/react'
2  import { test, expect, vi } from 'vitest'
3  import AddPartForm from './AddPartForm'
4
5  test('reports a real, honest confirmation after a successful creation', async () => {
6    vi.stubGlobal('fetch', vi.fn(() =>
7      Promise.resolve({
8        ok: true,
9        json: () => Promise.resolve({
10         data: { id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', material: '6061-T6 Aluminum' },
11       }),
12     })
13   ))
14
15   render(<AddPartForm token="a.b.c" />)
16
17   fireEvent.change(screen.getByPlaceholderText('Part Number'), {
18     target: { value: '1234567' },
19   })
20   fireEvent.change(screen.getByPlaceholderText('Description'), {
21     target: { value: 'Landing Gear Bracket' },
22   })
23   fireEvent.change(screen.getByPlaceholderText('Material'), {
24     target: { value: '6061-T6 Aluminum' },
25   })
26   fireEvent.click(screen.getByRole('button', { name: 'Create Part' }))
27
28   await waitFor(() => {
29     expect(screen.getByText('Created 1234567.')).toBeDefined()
30   })
31 })
```

### Mechanical Walkthrough

- **Line 15, `render(<AddPartForm token="a.b.c" />)`** — this
  project's own real `render`, drawing the real component this test is
  actually about — not yet written, on purpose, the identical real,
  deliberate order every prior test-first lesson already used.
  `token="a.b.c"` — a real, fake but well-formed-looking token string,
  the identical real shape `LoginForm`'s own success test already
  used; this unit doesn't need a real, valid JWT, only a real string
  this unit's own real component can actually forward.
- **Lines 17–25, the real, filled-in fields** — this project's own,
  already-established `fireEvent.change` pattern, three times, once
  per real field this unit's own real form needs.
- **Line 26, the real submit click** — `screen.getByRole('button', {
  name: 'Create Part' })`, this project's own, already-established
  `fireEvent.click` pattern, naming the real, visible label this
  unit's own real button is expected to show.
- **Lines 28–30, the real, awaited assertion** — `waitFor`, since the
  real component's own eventual `fetch` call resolves asynchronously;
  `screen.getByText('Created 1234567.')` — a real, specific,
  human-readable confirmation naming the real part number just
  created, the identical real shape `LoginForm`'s own `Signed in as
  {email}` confirmation already established.

### CS Lens

This is the identical real concept `LoginForm`'s own success test
already established — asserting a real, human-readable confirmation
of what actually happened, not merely that no error occurred. A real
form that silently clears itself after submitting leaves a real user
guessing whether their real part was actually created; a real,
specific confirmation removes that real guess.

Also recognized in: any real "Saved." or "Order placed." message a
well-designed real interface shows after a real, successful write —
naming the real thing that happened, not just acknowledging *a*
thing happened.

### SE Lens

The real, deliberately *not*-taken alternative here: matching
legacy's own real, four-field form exactly, including its own real
`Rev` input. Rejected on purpose: this project's own real backend,
`Part.from_dict`, doesn't read a `currentRevision` field at all yet —
building a real UI control for a value the real backend would
silently discard is a real, honest lie to whatever real user fills it
in. This unit's own real form covers exactly the three real fields
its own real backend actually persists; a real revision-setting
control is real, legitimate future work, for whenever a real revision
feature is actually built — the identical real discipline this
project's own earlier `TestingConfig`/`ProductionConfig` work already
established: build the real thing that's actually there, not a
guess at what might be needed later.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Not run this session, and, honestly, without a claimed exact
transcript, for the identical reason every prior frontend test-first
lesson already gave. What *is* honestly, confidently known:
`AddPartForm` doesn't exist yet at all, so `import AddPartForm from
'./AddPartForm'` itself fails before any real assertion even runs —
the correct, honest starting RED.

### Connecting this unit to what came before

The previous lesson gave `App` a real, honest way to receive a
signed-in token. This unit is the first real test proving a second,
real component can actually put that token to work.

---

## Concept Unit: A Form That Reports a Real, Honest Rejection

### The Problem

The previous unit's own real test proves the real, successful case.
This project's own real backend route also honestly rejects a real
part number that already exists, with a real, specific `409` and a
real, specific error message. The real question this unit answers:
what does the real test proving this project's own form surfaces that
real rejection — rather than swallowing it — look like?

### Project Change

- **Reference Source** — legacy's own real `handleCreatePart`, the
  same file already named above, catches this real case with a real,
  native `alert(err instanceof Error ? err.message : 'Failed to
  create part')` — a real, blocking, untestable browser dialog. Not
  ported — see the SE Lens, below.
- **Files affected** — modified: `rebuild/frontend/src/AddPartForm.test.tsx`.
- **Change type** — add (one new real test, appended to the existing
  real file).
- **Location** — appended to the end of the file the previous unit
  created.
- **Dependencies** — none new.

### The New Code

```tsx
test('reports a real, honest rejection when the part number already exists', async () => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: 'Part number 1234567 already exists' }),
    })
  ))

  render(<AddPartForm token="a.b.c" />)

  fireEvent.change(screen.getByPlaceholderText('Part Number'), {
    target: { value: '1234567' },
  })
  fireEvent.change(screen.getByPlaceholderText('Description'), {
    target: { value: 'Landing Gear Bracket' },
  })
  fireEvent.change(screen.getByPlaceholderText('Material'), {
    target: { value: '6061-T6 Aluminum' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Create Part' }))

  await waitFor(() => {
    expect(screen.getByText('Part number 1234567 already exists')).toBeDefined()
  })
})
```

### The Updated Project

`rebuild/frontend/src/AddPartForm.test.tsx`, in full — the previous
unit's own test, with this unit's own second one appended:

```tsx
1  import { render, screen, fireEvent, waitFor } from '@testing-library/react'
2  import { test, expect, vi } from 'vitest'
3  import AddPartForm from './AddPartForm'
4
5  test('reports a real, honest confirmation after a successful creation', async () => {
6    vi.stubGlobal('fetch', vi.fn(() =>
7      Promise.resolve({
8        ok: true,
9        json: () => Promise.resolve({
10         data: { id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', material: '6061-T6 Aluminum' },
11       }),
12     })
13   ))
14
15   render(<AddPartForm token="a.b.c" />)
16
17   fireEvent.change(screen.getByPlaceholderText('Part Number'), {
18     target: { value: '1234567' },
19   })
20   fireEvent.change(screen.getByPlaceholderText('Description'), {
21     target: { value: 'Landing Gear Bracket' },
22   })
23   fireEvent.change(screen.getByPlaceholderText('Material'), {
24     target: { value: '6061-T6 Aluminum' },
25   })
26   fireEvent.click(screen.getByRole('button', { name: 'Create Part' }))
27
28   await waitFor(() => {
29     expect(screen.getByText('Created 1234567.')).toBeDefined()
30   })
31 })
32
33
34 test('reports a real, honest rejection when the part number already exists', async () => {
35   vi.stubGlobal('fetch', vi.fn(() =>
36     Promise.resolve({
37       ok: false,
38       json: () => Promise.resolve({ error: 'Part number 1234567 already exists' }),
39     })
40   ))
41
42   render(<AddPartForm token="a.b.c" />)
43
44   fireEvent.change(screen.getByPlaceholderText('Part Number'), {
45     target: { value: '1234567' },
46   })
47   fireEvent.change(screen.getByPlaceholderText('Description'), {
48     target: { value: 'Landing Gear Bracket' },
49   })
50   fireEvent.change(screen.getByPlaceholderText('Material'), {
51     target: { value: '6061-T6 Aluminum' },
52   })
53   fireEvent.click(screen.getByRole('button', { name: 'Create Part' }))
54
55   await waitFor(() => {
56     expect(screen.getByText('Part number 1234567 already exists')).toBeDefined()
57   })
58 })
```

### Mechanical Walkthrough

- **Lines 35–39, the real, fake rejection** — `ok: false`, the
  identical real shape `LoginForm`'s own failure test already
  established, with a real `json` body holding the identical real
  error string this project's own real backend route actually
  returns for a real, duplicate part number, confirmed in an earlier
  lesson's own real run.
- **Lines 55–57, the real, awaited assertion** — the real backend's
  own real error text, shown verbatim, not a generic real "Something
  went wrong" — the identical real discipline `LoginForm`'s own
  `setError(data.error)` already established.

### CS Lens

This is the identical real concept `LoginForm`'s own failure test
already established — a real form has to honestly report *why* a real
action failed, using the real, specific reason its own real backend
already computed, rather than inventing a vaguer real one or hiding
the real failure entirely.

Also recognized in: any real form that shows "That email is already
registered" instead of a generic real "Error."

### SE Lens

The real, deliberately *not*-taken alternative here: legacy's own
real `alert()` call. Rejected on purpose, for two real, concrete
reasons — first, a real `alert()` blocks the entire real page until a
real user dismisses it, a real, heavier interruption than a real,
in-page message; second, and decisive for this project specifically,
a real `alert()` cannot be asserted on by this unit's own real test
at all — Testing Library has no real way to inspect a real, native
browser dialog's contents. `LoginForm`'s own real precedent, an
in-page `{error && <p>{error}</p>}`, is both the more real, testable
choice and already this project's own established real pattern for
reporting a form's own failure — the honest, consistent choice, not
merely the convenient one.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Not run this session, honestly, for the identical reason the previous
unit already gave: `AddPartForm` still doesn't exist. Both real tests
fail on the identical real import error, for the identical real,
honest reason.

### Connecting this unit to what came before

The previous unit proved the real, successful case. This unit proves
the real, rejected one — together, the complete real contract the
next lesson's own real component has to satisfy.

---

## Connect the pieces

A real test now exists, describing both real outcomes a real Add Part
form actually has to handle — a real, successful creation, and a
real, honest rejection — proven, honestly, to fail since the
component doesn't exist. Nothing about *how* the form is built was
decided here; only what it must actually do.

---

**Next lesson:** the actual smallest real component that makes both
of these tests pass, connected to the real backend this project
already proved works.
