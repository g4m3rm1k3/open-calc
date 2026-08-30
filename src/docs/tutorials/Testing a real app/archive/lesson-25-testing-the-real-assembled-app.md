# Lesson 25: Testing the Real, Assembled App

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. `App` has shown nothing
> but the walking skeleton's own real `/health` status since real
> styling was the last thing to touch it — real sign-in and real Parts
> listing exist, real and independently tested, but neither has ever
> actually been *used* by the real application a person would open.

## What you will build

A real, updated test for `App` itself — retiring the walking
skeleton's own two real tests, which check for real text no longer
part of this application's own real, intended UI, and replacing them
with one real test proving the real, assembled application actually
shows both real, already-built capabilities: signing in, and viewing
real parts.

## What you need to know first

`LoginForm` and `PartsList`, both real, already built and tested. The
real, already-established `vi.stubGlobal('fetch', ...)` pattern.

## Terms introduced

None — this lesson reuses real testing tools this project has already
given full treatment to.

## Objects and methods used

None genuinely new — every real method this lesson's own test calls
has already been given full treatment.

---

## Concept Unit: Retiring a Placeholder, On Purpose

### The Problem

`App.test.tsx` still contains the walking skeleton's own two real
tests — one checking for the literal word `'rebuild'`, one for real,
visible backend-status text — proving a real `<h1>` this project's own
real UI no longer needs to show at all, now that real, actual features
exist. The real question this unit answers: what does `App` actually
need to prove now, and is quietly leaving the old, real tests in place,
still passing against code nobody looks at anymore, actually honest?

> **Before reading on:** this project's own real walking-skeleton
> lessons were explicit, from the start, that `/health`'s own real,
> visible status text was a deliberate placeholder — proof a real
> frontend could reach a real backend, nothing more. Now that a real
> sign-in form and a real parts list both exist, what real, honest
> reason is there to keep testing for text a real user was never
> actually meant to see past this project's own earliest lessons?

### Project Change

- **Reference Source** — no reference counterpart; this unit is about
  this project's own internal composition, not a port of any one real
  legacy behavior.
- **Files affected** — modified: `rebuild/frontend/src/App.test.tsx`.
- **Change type** — replace (the whole real file).
- **Location** — `rebuild/frontend/src/`.
- **Dependencies** — none beyond what earlier frontend lessons already
  installed.

### The New Code

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { test, expect, vi } from 'vitest'
import App from './App'

test('shows both the real sign-in form and the real parts list', async () => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ data: [], total: 0 }),
    })
  ))

  render(<App />)

  expect(screen.getByPlaceholderText('Email')).toBeDefined()

  await waitFor(() => {
    expect(screen.getByText('No parts yet.')).toBeDefined()
  })
})
```

### The Updated Project

`rebuild/frontend/src/App.test.tsx`, in full — replacing the walking
skeleton's own version entirely, so this is the whole file:

```tsx
1  import { render, screen, waitFor } from '@testing-library/react'
2  import { test, expect, vi } from 'vitest'
3  import App from './App'
4
5  test('shows both the real sign-in form and the real parts list', async () => {
6    vi.stubGlobal('fetch', vi.fn(() =>
7      Promise.resolve({
8        json: () => Promise.resolve({ data: [], total: 0 }),
9      })
10   ))
11
12   render(<App />)
13
14   expect(screen.getByPlaceholderText('Email')).toBeDefined()
15
16   await waitFor(() => {
17     expect(screen.getByText('No parts yet.')).toBeDefined()
18   })
19 })
```

### Mechanical Walkthrough

- **Lines 6–10, one real, fake `fetch`** — this project's own,
  already-established mock pattern, returning this slice's own real,
  already-proven empty **Collection envelope**; real and sufficient,
  since `PartsList` is this real render's only component whose own real
  `useEffect` actually calls `fetch` on mount — `LoginForm`'s own real
  `fetch` call only happens on a real, submitted click, which this real
  test never performs.
- **Line 12, `render(<App />)`** — this project's own real `render`,
  drawing the real, assembled application — not yet rebuilt, on
  purpose, the identical real, deliberate order this project has used
  since its very first frontend test.
- **Line 14, `expect(screen.getByPlaceholderText('Email')).toBeDefined()`**
  — checked real, immediately, with no real `waitFor` needed: a real
  sign-in form's own real, visible input doesn't depend on any real,
  asynchronous answer to exist.
- **Lines 16–18, the real, awaited assertion** — `PartsList`'s own
  real, empty-state message, genuinely asynchronous, since it depends
  on this real test's own fake `fetch` actually resolving first.

### CS Lens

This is a real instance of **composition over inheritance** — `App`'s
own real job, once this unit's real implementation exists, will be
assembling two already-complete, already-correct real components,
rather than containing any real logic of its own; this real test
proves the *assembly* is correct, deliberately not re-proving either
real component's own already-tested internal behavior a second time.

Also recognized in: any real, well-tested UI built from small, real,
independently-verified pieces, where a real, higher-level test only
needs to confirm the pieces are actually present, not re-derive their
own real, already-proven correctness.

### SE Lens

The real, deliberately *not*-taken alternative here: leaving the
walking skeleton's own two real tests in place, alongside this real,
new one, so nothing real ever looks "deleted." Rejected on purpose: a
real test that keeps passing against code a real user will never
actually see again is not a real safety net, it's real, misleading
weight — anyone reading this project's own real test suite later would
reasonably assume real, visible `/health` status text still matters to
a real user, when it genuinely doesn't. Retiring it honestly, with a
real, stated reason, is more honest than a real test suite that quietly
grows real, dead assertions no one will ever notice failing to matter.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Not run this session, and, honestly, without a claimed exact
transcript, for the identical reason every prior frontend lesson
already gave. What *is* honestly, confidently known: `App` still only
renders the walking skeleton's own real `<h1>`, so neither
`screen.getByPlaceholderText('Email')` nor `screen.getByText('No parts
yet.')` has any real, matching element to find — the correct, honest
starting RED.

### Connecting this unit to what came before

Every real component this project has built since the walking skeleton
finished has been tested alone. This unit is the first real proof that
they're actually meant to exist together.

---

## Connect the pieces

A real test now exists, describing what the actual, assembled
application has to show — not a placeholder, two real, already-proven
capabilities, together — proven, honestly, to fail since `App` was
never rebuilt to show them.

---

**Next lesson:** the actual smallest real change to `App` that makes
this test pass.
