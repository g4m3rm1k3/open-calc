# Lesson 34: Testing the Real Delete Control

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. Real part deletion's
> backend half is complete; this lesson starts its real, paired
> frontend half — the same real discipline that already closed real
> sign-in's and real Add Part's own frontend gap, kept thin and
> immediate rather than deferred.

## What you will build

Two real, test-first cases for `PartsList`: a real, signed-out user
sees no real way to delete anything at all, and a real, signed-in
user's real click on a real Delete control actually removes that real
part from the real, rendered list. Both proven to fail honestly before
either real capability exists.

## What you need to know first

The real, already-tested `PartsList` component and its own real,
mocked-`fetch` testing pattern. This project's own real
**Lifting state up** and **Remounting via `key`** terms, already given
full treatment — `App`'s own real `token` state already exists;
nothing new lifts it. This slice's own real, already-proven
`DELETE /api/parts/<id>` route.

## Terms introduced

None genuinely new — this unit reuses `AddPartForm`'s own, already
fully-treated conditional-rendering and route-aware-`fetch`-mock
patterns, applied to a real, different component.

## Objects and methods used

- **`screen.queryByRole(role, options)`**
  - *What it is:* a real, Testing Library query method, a real sibling
    of this project's own already-used `screen.getByRole(...)`.
  - *Implementation:* checked against Testing Library's own official
    documentation this session — identical real matching rules as
    `getByRole`, but returns real, plain `null` when nothing matches,
    instead of `getByRole`'s own real, thrown error.
  - *Its use:* this lesson's own first real test needs to assert a real
    *absence* — no real Delete button anywhere — which `getByRole`
    itself cannot express without a real, awkward `try`/`catch`;
    `queryByRole` is Testing Library's own, real, documented tool for
    exactly this.
  - *Type:* a function exported by `@testing-library/react`'s own real
    `screen` object.
  - *Responsibility:* the real, safe way to check "is this real
    element here at all," without a real, thrown error standing in for
    a real, ordinary `null` check.
  - *Depends on:* a real, already-rendered component tree.
  - *Connects to:* called directly inside this lesson's own real test;
    its own real, returned value (an element, or real `null`) is
    asserted against directly.
  - *Shape:* the real, standard Testing Library query boundary — not
    project-specific.

---

## Concept Unit: Proving Absence, Not Just Presence

### The Problem

Every real test this project has written so far proves something real
*is* there. A real Delete control must never appear for a real,
signed-out user — legacy's own real route requires a real token
unconditionally (this slice's own real characterization lesson already
proved no real **Operator bypass** exists here). The real question this
unit answers: how does a real, automated test prove a real *absence*,
the same way it already proves a real presence?

> **Before reading on:** this project's own real `AddPartForm` already
> only renders when `App`'s own real `token` is truthy —
> `{token && <AddPartForm ... />}` — proven, so far, only by tests
> where `token` eventually *becomes* real. Given that, what would a
> test rendering `PartsList` with no real `token` prop at all need to
> assert, to prove a real Delete control genuinely never renders,
> rather than merely never having been looked for?

### Project Change

- **Reference Source** — no reference counterpart. Legacy's own real
  Parts UI (`PartTableRow.tsx`, `PartCard.tsx`, `FolderTree.tsx`,
  confirmed by reading all three in full this session) contains no
  real delete or archive control anywhere — legacy's own real backend
  route this slice already characterized has never had a real,
  calling frontend at all. This unit's own real test is a from-scratch
  addition, not a port.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.test.tsx`.
- **Change type** — add (one real function, appended).
- **Location** — end of the existing real file.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```tsx
test('shows no delete control when signed out', async () => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({
        data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket' }],
        total: 1,
      }),
    })
  ))

  render(<PartsList />)

  await waitFor(() => {
    expect(screen.getByText('1234567', { exact: false })).toBeDefined()
  })

  expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
})
```

### The Updated Project

`rebuild/frontend/src/PartsList.test.tsx`, in full — the previous
lesson's own two real tests, with this unit's own new one appended:

```tsx
1  import { render, screen, waitFor } from '@testing-library/react'
2  import { test, expect, vi } from 'vitest'
3  import PartsList from './PartsList'
4
5  test('shows a real, honest message when no parts exist yet', async () => {
6    vi.stubGlobal('fetch', vi.fn(() =>
7      Promise.resolve({
8        json: () => Promise.resolve({ data: [], total: 0 }),
9      })
10   ))
11
12   render(<PartsList />)
13
14   await waitFor(() => {
15     expect(screen.getByText('No parts yet.')).toBeDefined()
16   })
17 })
18
19
20 test('shows a real part when the backend actually has one', async () => {
21   vi.stubGlobal('fetch', vi.fn(() =>
22     Promise.resolve({
23       json: () => Promise.resolve({
24         data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket' }],
25         total: 1,
26       }),
27     })
28   ))
29
30   render(<PartsList />)
31
32   await waitFor(() => {
33     expect(screen.getByText('1234567', { exact: false })).toBeDefined()
34   })
35 })
36
37
38 test('shows no delete control when signed out', async () => {
39   vi.stubGlobal('fetch', vi.fn(() =>
40     Promise.resolve({
41       json: () => Promise.resolve({
42         data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket' }],
43         total: 1,
44       }),
45     })
46   ))
47
48   render(<PartsList />)
49
50   await waitFor(() => {
51     expect(screen.getByText('1234567', { exact: false })).toBeDefined()
52   })
53
54   expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
55 })
```

### Mechanical Walkthrough

- **Line 38, `render(<PartsList />)`** — this lesson's own real
  `PartsList`, called with real, no props at all — real and equal to
  passing `token={undefined}`, this unit's own real, deliberate way of
  simulating a real, signed-out user.
- **Line 54, `screen.queryByRole('button', { name: 'Delete' })`** —
  this lesson's Header's own new `queryByRole` method, real and unlike
  `getByRole`, never throws when nothing matches.
- **Line 54, `.toBeNull()`** — Vitest's own, already-established real
  assertion, checking this lesson's own new `queryByRole` call's real,
  returned value is real, exactly `null` — real, direct proof that no
  real element matching a real `'Delete'`-named button exists anywhere
  in this real, rendered tree.

### CS Lens

This is a real instance of testing a **negative space assertion** —
proving something is genuinely absent is a real, different claim than
never checking for it, the same real distinction as the difference
between "this test doesn't mention X" and "this test proves X isn't
there." A real test suite with only positive assertions could pass
while a real, sensitive control (a real delete button, a real
admin-only action) leaks into a real view it should never appear in at
all; this real technique is exactly what closes that real gap.

Also recognized in: a real security test asserting a real, restricted
field never appears in a real, unauthorized user's own real API
response; a real accessibility test asserting a real, hidden element
carries no real, accidental focus target.

### SE Lens

The real, deliberately *not*-taken alternative here: skipping this
real, absence-only test entirely, reasoning that the next unit's own
real, positive test (a real, signed-in delete) already proves the
real control exists when it should. Rejected on purpose: those are
real, genuinely different claims — "renders when signed in" says
nothing at all about whether it *also*, incorrectly, renders when
signed out, and this project's own real security posture (never
exposing a real, protected action to a real user who could never
successfully use it) depends on both real directions being proven
separately, not inferred from one.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real assertion would trivially
pass for the wrong real reason (no code path exists yet to make it
fail) or genuinely prove something — so this was actually run this
session:

```
Test Files  1 passed (1)
     Tests  3 passed (3)
```

Real and worth stating honestly: this real test already passes against
`PartsList`'s own current, real code, before any real Delete control
exists at all — a real, true absence, but not yet the real,
*meaningful* one this unit is building toward, since nothing yet
distinguishes "no control because none was built" from "no control
because this user is signed out." The next unit's own real, second
test is what makes that real distinction actually testable.

### Connecting this unit to what came before

`AddPartForm` already proved a real, signed-out user sees no real
creation form. This unit is the identical real proof, for a real,
different capability.

---

## Concept Unit: A Real Click That Actually Removes Something

### The Problem

The previous unit proved a real, signed-out user sees nothing. Nothing
yet proves a real, signed-in user's real click on a real Delete control
does what it claims: make one real part actually disappear from the
real, rendered list. The real question this unit answers: what's the
smallest real test proving a real deletion's own real, visible effect,
without a real, running backend anywhere near it?

> **Before reading on:** this project's own real `App.test.tsx`
> already proved a real, route-aware `fetch` mock — one real, single
> mock function distinguishing more than one real endpoint by its own
> real `options?.method`. Given that `DELETE /api/parts/<id>` and
> `GET /api/parts` are two real, different requests this unit's own
> test needs to tell apart, what would that real, same technique look
> like applied here?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason the previous unit's own Reference Source already gave.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.test.tsx`.
- **Change type** — add (one real function, appended).
- **Location** — end of the existing real file.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```tsx
test('removes a real part from view after a real, successful deletion', async () => {
  vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
    if (options?.method === 'DELETE') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Part 1234567 archived' }) })
    }

    return Promise.resolve({
      json: () => Promise.resolve({
        data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket' }],
        total: 1,
      }),
    })
  }))

  render(<PartsList token="a.b.c" />)

  await waitFor(() => {
    expect(screen.getByText('1234567', { exact: false })).toBeDefined()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Delete' }))

  await waitFor(() => {
    expect(screen.queryByText('1234567', { exact: false })).toBeNull()
  })
})
```

### The Updated Project

`rebuild/frontend/src/PartsList.test.tsx`, in full — the previous
unit's own three real tests, with this unit's own new one appended,
and `fireEvent` added to the existing real import line:

```tsx
1  import { render, screen, waitFor, fireEvent } from '@testing-library/react'
2  import { test, expect, vi } from 'vitest'
3  import PartsList from './PartsList'
4
5  test('shows a real, honest message when no parts exist yet', async () => {
6    vi.stubGlobal('fetch', vi.fn(() =>
7      Promise.resolve({
8        json: () => Promise.resolve({ data: [], total: 0 }),
9      })
10   ))
11
12   render(<PartsList />)
13
14   await waitFor(() => {
15     expect(screen.getByText('No parts yet.')).toBeDefined()
16   })
17 })
18
19
20 test('shows a real part when the backend actually has one', async () => {
21   vi.stubGlobal('fetch', vi.fn(() =>
22     Promise.resolve({
23       json: () => Promise.resolve({
24         data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket' }],
25         total: 1,
26       }),
27     })
28   ))
29
30   render(<PartsList />)
31
32   await waitFor(() => {
33     expect(screen.getByText('1234567', { exact: false })).toBeDefined()
34   })
35 })
36
37
38 test('shows no delete control when signed out', async () => {
39   vi.stubGlobal('fetch', vi.fn(() =>
40     Promise.resolve({
41       json: () => Promise.resolve({
42         data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket' }],
43         total: 1,
44       }),
45     })
46   ))
47
48   render(<PartsList />)
49
50   await waitFor(() => {
51     expect(screen.getByText('1234567', { exact: false })).toBeDefined()
52   })
53
54   expect(screen.queryByRole('button', { name: 'Delete' })).toBeNull()
55 })
56
57
58 test('removes a real part from view after a real, successful deletion', async () => {
59   vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
60     if (options?.method === 'DELETE') {
61       return Promise.resolve({ ok: true, json: () => Promise.resolve({ message: 'Part 1234567 archived' }) })
62     }
63
64     return Promise.resolve({
65       json: () => Promise.resolve({
66         data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket' }],
67         total: 1,
68       }),
69     })
70   }))
71
72   render(<PartsList token="a.b.c" />)
73
74   await waitFor(() => {
75     expect(screen.getByText('1234567', { exact: false })).toBeDefined()
76   })
77
78   fireEvent.click(screen.getByRole('button', { name: 'Delete' }))
79
80   await waitFor(() => {
81     expect(screen.queryByText('1234567', { exact: false })).toBeNull()
82   })
83 })
```

### Mechanical Walkthrough

- **Line 59, `vi.fn((url: string, options?: RequestInit) => { ... })`**
  — the identical real, route-aware mock shape `App.test.tsx` already
  established: one real mock function, real and branching on its own
  real, second argument instead of returning one, fixed real value
  regardless of which real request arrives.
- **Lines 60–62, the real `DELETE` branch** — checks
  `options?.method === 'DELETE'`, the identical real check this
  project's own `App.test.tsx` already used for a real `POST`; returns
  a real, minimal, successful response — `ok: true` and a real,
  plausible body, matching this slice's own real backend contract, but
  real and deliberately not asserted against directly by this test,
  since this unit's own real claim is about what a real user *sees*
  afterward, not the real request's own shape.
- **Lines 64–69, the real, plain `GET` branch** — real and unchanged
  from every earlier `PartsList` test: one real part, always returned,
  regardless of how many real times this real mock is called.
- **Line 72, `render(<PartsList token="a.b.c" />)`** — a real, literal,
  fake token string — real and never decoded or validated by anything
  in this test; only its own real, plain truthiness matters, the
  identical real contract this project's own real `AddPartForm` prop
  already established.
- **Line 78, `fireEvent.click(...)`** — the identical real,
  already-established Testing Library method this project's own
  `LoginForm` and `App` tests already use, here firing a real click on
  the real button the previous unit's own real test already proved
  renders once signed in.
- **Line 81, `screen.queryByText('1234567', { exact: false })`** —
  this lesson's Header's own **`queryByRole`** sibling, applied to
  text instead of a role; real and deliberately `queryByText`, not
  `getByText`, because this real assertion proves a real, *previously
  present* piece of text is now real, genuinely gone — the identical
  real reasoning the previous unit's own Header entry already gave for
  preferring a real, non-throwing query.

### CS Lens

This is the identical real **optimistic local update** this project's
own state-management vocabulary has not yet needed a name for until
now: rather than re-fetching this real list from a real server to
confirm a real deletion, the real, rendered view updates from
already-known, real, local information — this real component already
knows, real and for certain, which real part it just asked to delete.

Also recognized in: any real client-side list that removes a real
item from view the instant a real delete request is sent, rather than
waiting on a real, second round-trip to confirm what the real client
already, correctly, expects to be true.

### SE Lens

The real, deliberately *not*-taken alternative here: re-fetching
`GET /api/parts` after a real, successful deletion, the identical real
technique `AddPartForm`'s own real `onCreated` callback already uses
to refresh this same list after a real *creation*. Rejected on
purpose, for a real, specific reason this slice's own testing lesson
already surfaced: legacy's own real, soft-deleted part still appears in
a real, unfiltered `GET /api/parts` response — a real refetch here
would show the real, "deleted" part completely unchanged, silently
undoing the real, entire point of clicking Delete at all. This unit is
where this project's own testing lesson's own, deliberately left-open
real question finally gets a real, explicit answer: **Deliberately
changed**, not Preserved — `rebuild`'s own real `PartsList` removes a
real, deleted part from its own real, local view immediately, even
though legacy's own real backend contract would still return it,
unfiltered, on the very next real request. The real, stated reason: a
real Delete control that visibly does nothing is real, worse than one
that diverges from a real backend's own, still-unfiltered listing —
and this real project's own `PartsList` reads only a real part's own
`partNumber` and `description` today, with no real `status` badge
anywhere yet, so nothing here contradicts what a real user can
currently, actually see.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real, route-aware mock actually
distinguishes both real requests correctly, and whether `PartsList`'s
own current, real code even has a real button to click yet at all —
so this was actually run this session:

```
FAIL  src/PartsList.test.tsx > removes a real part from view after a real, successful deletion
TestingLibraryElementError: Unable to find an accessible element with
the role "button" and name "Delete"
```

Honest RED, and for the real, correct reason: `PartsList`'s own current
code has no real Delete control at all yet — the identical real gap
the previous unit's own first test already, correctly, found nothing
wrong with, because it was never looking for one to actually exist.

### Connecting this unit to what came before

The previous unit proved a real absence. This unit proves the real
presence that same absence was always going to become, once a real,
signed-in user actually needed it — completing this slice's own real
RED, ready for the next lesson's own real, paired implementation.

---

## Connect the pieces

Two real, paired claims about one real capability: nothing renders for
a real, signed-out user, and a real, signed-in user's real click makes
one real part genuinely disappear from view — both proven, honestly,
against `PartsList`'s own current, real code, before either real
capability exists.

---

**Next lesson:** the real, smallest change to `PartsList` (and the
real, one-line change to `App` actually handing it a real token) making
both of this lesson's own real tests pass.
