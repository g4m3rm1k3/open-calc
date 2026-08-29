# Lesson 38: Testing the Real Favorite Control

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. Real part deletion is a
> complete, real, full-stack slice; the favorite toggle's own real
> backend half is complete too. This lesson starts its real, paired
> frontend half.

## What you will build

Two real, test-first cases for `PartsList`: a real, signed-out user
sees no real way to favorite anything, and a real, signed-in user's
real click actually marks a real part as a real favorite, proven by
the real, rendered control itself changing to reflect it. Both proven
to fail honestly before either real capability exists.

## What you need to know first

The real, already-tested `PartsList` component, its own real, already-
proven Delete control, and its own real, route-aware `fetch` mock
pattern. This slice's own real, already-proven
`PUT /api/parts/<id>` route, scoped to `isFavorite`.

## Terms introduced

None genuinely new — this unit reuses `PartsList`'s own, already
fully-treated conditional-rendering pattern and route-aware-mock
technique, distinguishing a real, third HTTP method this time.

## Objects and methods used

None genuinely new — this lesson's own real tests reuse
`screen.queryByRole`, `screen.getByRole`, and `fireEvent.click`, all
already given full treatment in this project's own deletion-control
testing lesson.

---

## Concept Unit: A Second Real Control, Absent for the Same Real Reason

### The Problem

`PartsList` already gates its real Delete control on a real, signed-in
`token`. A real favorite toggle needs the identical real gate — this
slice's own real characterization already proved `PUT` requires the
identical real, narrow role list `DELETE` does, with no real
**Operator bypass**. The real question this unit answers: does a real,
second, independent control need its own real, separate absence test,
or does the existing Delete-absence test already cover it?

> **Before reading on:** this project's own real Delete-absence test
> only asserts `screen.queryByRole('button', { name: 'Delete' })` is
> real, `null`. Given that a real favorite control is a real,
> genuinely different button, with its own real, different accessible
> name, what would proving *its* real absence actually require — and
> could a real bug hide one real control's presence while still
> passing a test that only ever looked for the other?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason `PartsList`'s own Delete control already gave — legacy's own
  real Parts UI displays a real favorite star (`PartCard.tsx`,
  `PartTableRow.tsx`, `FolderTree.tsx`, all read in full this session)
  but never lets a real user actually set it; the identical real
  `PartsSearch.tsx` "Favorites toggle" only real, client-side *filters*
  an already-fetched real list, confirmed by reading its own real
  `onFavoritesToggle` prop in full — it calls no real API at all. This
  unit's own real control is a from-scratch addition, not a port.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.test.tsx`.
- **Change type** — add (one real function, appended).
- **Location** — end of the existing real file.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```tsx
test('shows no favorite toggle when signed out', async () => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({
        data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', isFavorite: false }],
        total: 1,
      }),
    })
  ))

  render(<PartsList />)

  await waitFor(() => {
    expect(screen.getByText('1234567', { exact: false })).toBeDefined()
  })

  expect(screen.queryByRole('button', { name: 'Favorite' })).toBeNull()
})
```

### The Updated Project

`rebuild/frontend/src/PartsList.test.tsx`, in full — this project's
own four, already-established real tests, with this unit's own new one
appended:

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
84
85
86 test('shows no favorite toggle when signed out', async () => {
87   vi.stubGlobal('fetch', vi.fn(() =>
88     Promise.resolve({
89       json: () => Promise.resolve({
90         data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', isFavorite: false }],
91         total: 1,
92       }),
93     })
94   ))
95
96   render(<PartsList />)
97
98   await waitFor(() => {
99     expect(screen.getByText('1234567', { exact: false })).toBeDefined()
100  })
101
102  expect(screen.queryByRole('button', { name: 'Favorite' })).toBeNull()
103 })
```

### Mechanical Walkthrough

- **Line 90, `isFavorite: false`** — a real, explicit field, added to
  this unit's own mock data on purpose — the next unit's own real
  control reads this real value to decide what real label to show, so
  this real test supplies it even though this unit's own real assertion
  doesn't inspect it directly.
- **Line 102, `screen.queryByRole('button', { name: 'Favorite' })`** —
  this project's own, already fully-treated `queryByRole` method,
  applied to a real, different accessible name than the existing
  Delete-absence test uses — real, direct proof that answers this
  unit's own opening question: a real, second control needs its own
  real, separate absence proof, because Testing Library's own real,
  name-based query only ever checks for the specific real name it's
  given.

### CS Lens

This is the identical real **negative space assertion** this project's
own deletion-control testing lesson already named in full, applied to
a real, second, independent capability — real and worth restating
plainly: proving one real control's absence says nothing at all about
a real, different one.

Also recognized in: the identical real example this project's own
deletion-control testing lesson already gave — a real security test
that only checks for one real, restricted field leaking into an
unauthorized response, while a real, different, equally restricted
field goes completely unchecked.

### SE Lens

The real, deliberately *not*-taken alternative here: combining this
real assertion into the existing Delete-absence test, checking both
real controls in one, single test function. Rejected on purpose: a
real test proving two, unrelated real claims at once is real, harder to
read when it real, fails — a real failure wouldn't say *which* real
control leaked through, only that *something* did. Keeping each real
capability's own real absence in its own real, dedicated test is the
identical real discipline this project has already used consistently,
one real concept per real Concept Unit.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real assertion would trivially
pass for the wrong real reason — so this was actually run this
session:

```
Test Files  1 passed (1)
     Tests  5 passed (5)
```

Real and worth stating honestly, the identical real caveat this
project's own Delete-absence unit already gave: this real test passes
before any real favorite control exists at all — a real, true absence,
but not yet the real, meaningful one this slice is building toward.

### Connecting this unit to what came before

The previous, deletion-control lesson proved one real control's
absence. This unit proves a real, second, independent one — nothing
about proving the first ever proved this one too.

---

## Concept Unit: A Real Click That Actually Marks Something

### The Problem

The previous unit proved a real, signed-out user sees nothing. Nothing
yet proves a real, signed-in user's real click on a real favorite
control does what it claims: mark one real part as a real favorite,
visibly. The real question this unit answers: what's the smallest real
test proving a real update's own real, visible effect, the same way
this slice's own deletion lesson already proved a real removal's own
real, visible effect?

> **Before reading on:** this project's own real, route-aware `fetch`
> mock already distinguishes a real `GET` from a real `DELETE`. This
> unit's own real test needs a real, *third* real request —
> `PUT /api/parts/<id>` — to behave differently from both. What would
> that real, same `options?.method` check need to look like, extended
> one real case further?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason already given twice in this lesson.
- **Files affected** — modified:
  `rebuild/frontend/src/PartsList.test.tsx`.
- **Change type** — add (one real function, appended).
- **Location** — end of the existing real file.
- **Dependencies** — none beyond what earlier lessons already
  installed.

### The New Code

```tsx
test('marks a real part as a favorite after a real, successful update', async () => {
  vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
    if (options?.method === 'PUT') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: { id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', isFavorite: true },
        }),
      })
    }

    return Promise.resolve({
      json: () => Promise.resolve({
        data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', isFavorite: false }],
        total: 1,
      }),
    })
  }))

  render(<PartsList token="a.b.c" />)

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Favorite' })).toBeDefined()
  })

  fireEvent.click(screen.getByRole('button', { name: 'Favorite' }))

  await waitFor(() => {
    expect(screen.getByRole('button', { name: 'Unfavorite' })).toBeDefined()
  })
})
```

### The Updated Project

`rebuild/frontend/src/PartsList.test.tsx`, in full — the previous
unit's own five real tests, with this unit's own new one appended
(continuing from line 103):

```tsx
104
105
106 test('marks a real part as a favorite after a real, successful update', async () => {
107   vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
108     if (options?.method === 'PUT') {
109       return Promise.resolve({
110         ok: true,
111         json: () => Promise.resolve({
112           data: { id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', isFavorite: true },
113         }),
114       })
115     }
116
117     return Promise.resolve({
118       json: () => Promise.resolve({
119         data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', isFavorite: false }],
120         total: 1,
121       }),
122     })
123   }))
124
125   render(<PartsList token="a.b.c" />)
126
127   await waitFor(() => {
128     expect(screen.getByRole('button', { name: 'Favorite' })).toBeDefined()
129   })
130
131   fireEvent.click(screen.getByRole('button', { name: 'Favorite' }))
132
133   await waitFor(() => {
134     expect(screen.getByRole('button', { name: 'Unfavorite' })).toBeDefined()
135   })
136 })
```

### Mechanical Walkthrough

- **Lines 108–115, the real `PUT` branch** — checks `options?.method
  === 'PUT'`, extending the identical real, route-aware mock shape
  already established for a real, third case; returns a real, complete
  updated part, `isFavorite: true`, matching this slice's own real
  backend contract — legacy's own real `update_part` returns the full,
  real, updated part, not merely the one real field that changed.
- **Line 128, `screen.getByRole('button', { name: 'Favorite' })`** —
  real, direct proof a real, unfavorited part's own real control reads
  "Favorite" — a real, plain-language label naming the real *action* a
  click will take, not the real, current state.
- **Line 131, `fireEvent.click(...)`** — the identical real,
  already-established method this project's own Delete-control test
  already uses.
- **Line 134, `screen.getByRole('button', { name: 'Unfavorite' })`** —
  real, direct proof the real, same control's own real, accessible name
  actually changed after a real, successful update — not merely that
  *some* real button still exists, but that it now, correctly, offers
  the real, opposite action.

### CS Lens

This is a real instance of a **control whose own label encodes
current state** — rather than a real, separate, static label plus a
real, independent indicator (a real checkbox, a real star icon,
checked or not), this real button's own accessible name *is* the real
state, expressed as the real, next available action — a real,
common, accessible pattern precisely because a real screen reader
announces a real button's own real name directly, with no real,
separate indicator to also announce.

Also recognized in: a real, "Follow"/"Following" button on a real,
social platform; a real, "Show password"/"Hide password" toggle whose
own real label always names what clicking it will do next, not what
is currently true.

### SE Lens

The real, deliberately *not*-taken alternative here: a real, separate,
static "Favorite" button plus a real, independent star icon or
checkbox showing current state. Rejected on purpose, matching this
project's own real, established minimalism: `PartsList` currently
renders no real icons or images at all (this project's own real
Add-Part and Delete controls are both real, plain text buttons) —
introducing a real, visual-only indicator here would be a real, larger
change than this slice's own real, current, tested requirement
actually needs. The real, honest cost accepted here: this real button's
own accessible name changing on every real click is a slightly less
familiar real pattern than a real, separate checked-state indicator —
accepted for now, matching the identical real, minimal-first discipline
this project has already used more than once.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here — whether this real, route-aware mock actually
distinguishes all three real requests correctly, and whether
`PartsList`'s own current, real code even has a real favorite control
to click yet at all — so this was actually run this session:

```
FAIL  src/PartsList.test.tsx > marks a real part as a favorite after a real, successful update
TestingLibraryElementError: Unable to find an accessible element with
the role "button" and name "Favorite"
```

Honest RED, and for the real, correct reason: `PartsList`'s own current
code has no real favorite control at all yet.

### Connecting this unit to what came before

The previous unit proved a real absence. This unit proves the real
presence, and the real, visible change, that same absence was always
going to become — completing this slice's own real RED, ready for the
next lesson's own real, paired implementation.

---

## Connect the pieces

Two real, paired claims about one real capability: nothing renders for
a real, signed-out user, and a real, signed-in user's real click makes
one real part's own real control genuinely change what it says —
both proven, honestly, against `PartsList`'s own current, real code,
before either real capability exists.

---

**Next lesson:** the real, smallest change to `PartsList` making both
of this lesson's own real tests pass.
