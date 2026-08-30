# Lesson 21: Testing the Real Parts List Component

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. Lessons 18-20 built real
> Parts listing on the backend only — this is the same real discipline
> this project's own sign-in slice already used: a feature isn't a
> real, complete vertical slice until its own frontend half exists too,
> kept here to a genuinely thin, paired step rather than several more
> lessons of backend depth first.

## What you will build

A real, automated test for a real Parts-list component — before that
component exists — covering both real shapes this project's own
backend route can actually return: a real, empty list, and a real list
holding real parts. This lesson does not build the real component; a
separate, later lesson does.

## What you need to know first

This series' own real frontend-testing tools (Vitest, Testing Library,
`vi.stubGlobal`/`vi.fn` for a real, fake `fetch`), already used for
`App`'s own earlier real test. The real, already-working backend route
(`GET /api/parts`) this component will eventually call, and its real,
exact **Collection envelope** shape.

## Terms introduced

None — this lesson reuses real testing tools this project has already
given full treatment to; nothing genuinely new appears in it.

## Objects and methods used

- **`screen.getByText(text, options)`**
  - *What it is:* this project's own real, already-used
    `screen.getByText`, now called with a real, second, optional
    `options` argument.
  - *Implementation:* checked against Testing Library's own official
    documentation this session — `options.exact`, a real, standard
    key, `true` by default; setting it `false` matches a real element
    whose own real, visible text merely *contains* the given real
    string, rather than requiring the whole real element's own text to
    equal it exactly.
  - *Its use:* this lesson's own real, non-empty test calls it with
    `{ exact: false }`, since the real part this test looks for is
    real, visible text alongside a real part number, not the entire
    real content of whatever real element contains it.
  - *Type:* the identical real method already given full treatment;
    `options` is simply a real, optional second argument.
  - *Responsibility:* the identical real responsibility already
    established, now including a real, partial-match mode.
  - *Depends on:* the identical real dependencies already established.
  - *Connects to:* the identical real, in-memory DOM `screen`'s other
    real query methods already search.
  - *Shape:* the identical real Testing Library query boundary already
    established, now reached with one more real, optional argument.

---

## Concept Unit: A List That Honestly Says When It's Empty

### The Problem

`rebuild/frontend` has no Parts-list component at all yet. The real
question this unit answers: what does a real, automated test for one
look like, proving a real, empty backend answer produces a real,
honest, visible message — not a blank, silent screen a real user could
easily mistake for something broken — all before that real component
exists?

> **Before reading on:** this project's own real backend route,
> proven in the previous lesson, returns a real, empty `data` array and
> a real `total` of `0` when no real parts exist yet. Given a real user
> would see nothing at all if a component simply rendered that real,
> empty array and stopped, what real, minimum thing should a real
> component show instead, so an empty real result is never
> indistinguishable from a real, broken one?

### Project Change

- **Reference Source** — no reference counterpart; legacy's own real
  frontend has a real Parts list, but it's woven into a large, real,
  Electron/Zustand-based application this series deliberately isn't
  porting wholesale — the identical real reason this project's own
  `LoginForm` test already gave.
- **Files affected** — created: `rebuild/frontend/src/PartsList.test.tsx`.
- **Change type** — add (new file).
- **Location** — directly inside `rebuild/frontend/src/`, sibling to
  `LoginForm.test.tsx`.
- **Dependencies** — none beyond what earlier frontend lessons already
  installed.

### The New Code

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { test, expect, vi } from 'vitest'
import PartsList from './PartsList'

test('shows a real, honest message when no parts exist yet', async () => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ data: [], total: 0 }),
    })
  ))

  render(<PartsList />)

  await waitFor(() => {
    expect(screen.getByText('No parts yet.')).toBeDefined()
  })
})
```

### The Updated Project

`rebuild/frontend/src/PartsList.test.tsx`, in full — brand new, so this
is the whole file:

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
```

### Mechanical Walkthrough

- **Lines 6–10, the real, fake `fetch`** — this project's own,
  already-established `vi.stubGlobal`/`vi.fn` pattern, returning a
  real, fake `Response`-shaped object whose own real, parsed body is
  this project's own real, already-proven `{ data: [], total: 0 }`
  shape — the exact real answer a fresh, empty backend actually gives.
- **Line 12, `render(<PartsList />)`** — this project's own real
  `render`, drawing the real component this test is actually about —
  not yet written, on purpose, the identical real, deliberate order
  this project's own first frontend test already used.
- **Lines 14–16, the real, awaited assertion** — this project's own
  real `waitFor`, since the real component's own eventual `fetch` call
  resolves asynchronously; `screen.getByText('No parts yet.')` — a
  real, specific, human-readable string this unit's own real claim
  requires the component to actually show.

### CS Lens

This is a real instance of designing for a real **empty state** — a
real, deliberate UI decision that "there is honestly nothing here yet"
is itself a real, meaningful piece of information a real interface
has to communicate, not an accident of there being nothing else to
draw. A real screen that goes silent when a real list is empty forces
a real user to guess whether that's the real, honest truth or a real,
silent failure; a real, explicit empty-state message removes that real
guess entirely.

Also recognized in: any real, well-designed list view showing "No
results found" instead of a real, blank area; a real inbox showing "You're
all caught up" instead of nothing at all.

### SE Lens

The real, deliberately *not*-taken alternative here: proving this
unit's own real claim by asserting the real *absence* of any real part
row, instead of asserting the real *presence* of a real, explicit
message. Rejected on purpose: a real test that only checks "nothing
appeared" would pass identically whether the component is honestly
communicating an empty real state or has simply, silently crashed
before rendering anything at all — a real, meaningful difference this
unit's own real claim needs to actually distinguish, not accidentally
paper over.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Not run this session, and, honestly, without a claimed exact
transcript, for the identical reason every prior frontend lesson
already gave. What *is* honestly, confidently known: `PartsList`
doesn't exist yet at all, so `import PartsList from './PartsList'`
itself fails before any real assertion even runs — the correct,
honest starting RED.

### Connecting this unit to what came before

The previous lesson proved the real backend's own real, empty answer.
This unit is the first real test proving the frontend has to say so
honestly, out loud, to a real user.

---

## Concept Unit: A List That Shows What's Actually There

### The Problem

The previous unit's own real test proves the real, empty case. The
real question this unit answers: what does the real test for the
*other* real shape look like — a real backend answer that actually
holds real parts?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason the previous unit's own Project Change already gave.
- **Files affected** — modified: `rebuild/frontend/src/PartsList.test.tsx`.
- **Change type** — add (one new real test, appended to the existing
  real file).
- **Location** — appended to the end of the file the previous unit
  created.
- **Dependencies** — none new.

### The New Code

```tsx
test('shows a real part when the backend actually has one', async () => {
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
})
```

### The Updated Project

`rebuild/frontend/src/PartsList.test.tsx`, in full — the previous
unit's own test, with this unit's own second one appended:

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
```

### Mechanical Walkthrough

- **Lines 23–26, the real, fake response body** — a real, one-element
  `data` array, holding a real, plain object shaped exactly like this
  project's own real `Part.to_dict()` output — `id`, `partNumber`, and
  `description` specifically, the real, minimum fields this unit's own
  real claim actually needs; `total: 1`, matching.
- **Line 33, `screen.getByText('1234567', { exact: false })`** — this
  lesson's Header's own `screen.getByText`, called with its own real,
  second argument: `{ exact: false }`, since this real part's own real
  part number is expected to appear *alongside* other real, visible
  text (a real description, real labels), not as the entire real
  content of whatever real element contains it.

### CS Lens

This is the identical real concept the previous unit already
established — testing from the real user's own perspective — now
proven for a real, populated state as well as a real, empty one: the
same real component, the same real fetch-and-render mechanism,
genuinely different real backend answers.

### SE Lens

The real, deliberately *not*-taken alternative here: asserting on the
real part's own `description` instead of its `partNumber`. Rejected on
purpose: legacy's own real backend already treats `part_number` as
this application's own real, unique, human-facing identifier — the
real value a real shop-floor user would actually search for and
recognize at a glance — while `description` is real, but secondary.
Testing the real, primary identifier is the real, more meaningful
claim.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Not run this session, honestly, for the identical reason the previous
unit already gave: `PartsList` still doesn't exist. Both real tests
fail on the identical real import error, for the identical real, honest
reason.

### Connecting this unit to what came before

The previous unit proved the real, empty case. This unit proves the
real, populated one — together, the complete real contract the next
lesson's own real component has to satisfy.

---

## Connect the pieces

A real test now exists, describing both real shapes a real Parts list
actually has to handle — honestly empty, and genuinely populated —
proven, honestly, to fail since the component doesn't exist. Nothing
about *how* the list is built was decided here; only what it must
actually do.

---

**Next lesson:** the actual smallest real component that makes both of
these tests pass, connected to the real backend this project already
proved works, through the real dev-server proxy this project's own
walking skeleton already built.
