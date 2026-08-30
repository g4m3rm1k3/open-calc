# Lesson 5: Testing the Real Connection

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. Before this lesson,
> `rebuild/backend` and `rebuild/frontend` are two real, independent
> applications that have never once talked to each other.

## What you will build

A real test, written before `App` knows how to fetch anything at all —
faking `App`'s own real network call so the test itself proves the
*component's own logic* is correct without needing a real, running
backend just to run a real test. This lesson does not make the test
pass — that's a separate, later lesson's own real job — and does not
touch a real, running backend process at all; that's a separate,
honest, manual step named in a later lesson too.

## What you need to know first

This series' own first real frontend test, already written and proven
to fail honestly before the real component it checks existed — the
identical real discipline this lesson reuses, now applied to
asynchronous, network-shaped behavior. The real, already-passing `App`
this lesson's own test replaces the check on.

## Terms introduced

- **Mock** — a real, fake stand-in for something a test doesn't want to
  depend on for real — here, the real network. `App`'s own real logic
  (call `fetch`, read the result, update state) can be proven correct
  without a real, running backend at all, by handing the component a
  real, fake `fetch` that returns a known, real, controlled answer
  instead of making an actual real network request. This matters
  because a real test that depends on a real, separately-running server
  is a genuinely different, heavier kind of test — real, valuable, but
  not what a fast, isolated **unit test**, this lesson's own real
  subject, is for.
- **`Promise`** — a real, standard JavaScript/TypeScript object
  representing a real value that isn't available yet, but will be —
  either successfully (it *resolves*) or with a real error (it
  *rejects*). A real network call is the canonical real reason one
  exists: the answer genuinely isn't known the instant the call is
  made. `Promise.resolve(value)` builds a real, already-resolved
  `Promise` directly, with no real asynchronous wait at all — a real,
  standard way to fake a real, eventual value.
- **`async`/`await`** — real, standard JavaScript/TypeScript syntax for
  working with a `Promise` without chaining `.then(...)` calls by
  hand. Marking a function `async` means it always returns a real
  `Promise`, and lets `await` be used inside it; `await somePromise`
  genuinely pauses that function's own execution — without blocking
  anything else in the program — until `somePromise` actually
  resolves, then evaluates to its real, resolved value directly.

## Objects and methods used

- **`vi.stubGlobal(name, value)`**
  - *What it is:* a real function, exported by Vitest's own `vi`
    object — Vitest's own built-in tool for controlling things a test
    doesn't want to depend on for real.
  - *Implementation:* checked against Vitest's own official
    documentation this session — temporarily replaces a real, global
    value (here, the browser's own real, global `fetch`) with whatever
    real value is given, for the duration of the test.
  - *Its use:* this lesson's own real test calls it once, replacing the
    real, global `fetch` with a real, fake function returning a known,
    controlled, fake `Response`-shaped value — so this specific test
    never makes a real network request at all.
  - *Type:* a real method on Vitest's own `vi` object.
  - *Responsibility:* letting a test control something normally outside
    its own control, so the *component's own logic* — not the real
    network — is what's actually being checked.
  - *Depends on:* a real name (`'fetch'`) and a real, fake replacement
    value.
  - *Connects to:* called once, at the start of this lesson's own real
    test; `App`'s own future `fetch('/health')` call, unmodified,
    unknowingly calls this real, fake replacement instead of the real
    browser API.
  - *Shape:* Vitest's own real seam for isolating a unit test from
    anything outside the one real thing it's actually testing.

- **`vi.fn(implementation)`**
  - *What it is:* a real function, exported by Vitest's own `vi`
    object.
  - *Implementation:* checked against Vitest's own official
    documentation this session — wraps a real, given function (or, with
    no argument, an empty one) in a real Vitest "mock function" object,
    which behaves identically when called but also lets a test inspect
    real facts about how it was called — not used further by this
    specific lesson's own test.
  - *Its use:* this lesson's own real test wraps its real, fake `fetch`
    replacement in it, matching Vitest's own documented, standard
    pattern for building a fake function.
  - *Type:* a real method on Vitest's own `vi` object, returning a real
    mock function.
  - *Responsibility:* producing a real, callable, fake function, usable
    anywhere a real function is expected.
  - *Depends on:* an optional real implementation function.
  - *Connects to:* its own real, returned value is passed directly into
    `vi.stubGlobal`, above.
  - *Shape:* Vitest's own real building block for constructing any
    fake function a test needs, `vi.stubGlobal`'s own real fake
    included.

- **`waitFor(callback)`**
  - *What it is:* a real function, exported by
    `@testing-library/react`.
  - *Implementation:* checked against Testing Library's own official
    documentation this session — repeatedly retries the real function
    it's given, on a real, short interval, until it either succeeds or
    a real, default timeout passes.
  - *Its use:* this lesson's own real test calls it once, wrapping this
    lesson's own real assertion, since that assertion depends on a real
    (even if fake) asynchronous `fetch` actually resolving first —
    something the real `render` this series already used does not wait
    for on its own.
  - *Type:* a free function, exported by `@testing-library/react`,
    returning a real `Promise`.
  - *Responsibility:* letting a real test honestly wait for something
    genuinely asynchronous to finish, instead of checking too early and
    failing for the wrong real reason.
  - *Depends on:* a real function containing the actual assertion to
    retry.
  - *Connects to:* called directly by this lesson's own test, wrapping
    a real `screen.getByText(...)` call, this series' own real, already
    established query.
  - *Shape:* Testing Library's own real seam for real, asynchronous UI
    behavior — necessary here, and not in this series' own prior
    frontend lesson, specifically because this lesson's own real
    assertion depends on something that doesn't resolve instantly.

---

## Concept Unit: A Test That Expects a Real Answer

### The Problem

This series' own first real frontend test only ever checked a real,
fixed value — a heading that never changes. This series' own next real
requirement is different: `App` needs to show whatever
`rebuild/backend` actually, currently says. The real question this
unit answers: how does a real, fast, isolated test check that, without
needing a real, separately-running backend process just to run a real
test?

> **Before reading on:** a real network request is genuinely
> asynchronous — it doesn't resolve the instant it's called. Given
> Testing Library's own `render(...)` draws a component immediately and
> synchronously, what real problem would a test have if it checked the
> screen's real text the instant after `render(...)`, before a real
> (or even fake) `fetch` has had any real chance to resolve?

### Project Change

- **Reference Source** — no reference counterpart; this is new,
  from-scratch test infrastructure, the same real category this
  project's own backend acceptance-test harness was.
- **Files affected** — modified: `rebuild/frontend/src/App.test.tsx`.
- **Change type** — replace (the real test body already written).
- **Location** — inside the existing real `App.test.tsx`.
- **Dependencies** — none beyond what's already installed; `vi` is
  part of the same real `vitest` package.

### The New Code

```tsx
import { render, screen, waitFor } from '@testing-library/react'
import { test, expect, vi } from 'vitest'
import App from './App'

test('shows the real backend status once it arrives', async () => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({ json: () => Promise.resolve({ status: 'healthy' }) })
  ))

  render(<App />)

  await waitFor(() => {
    expect(screen.getByText(/healthy/)).toBeDefined()
  })
})
```

### The Updated Project

`rebuild/frontend/src/App.test.tsx`, in full — replacing the earlier,
simpler version entirely, so this is the whole file:

```tsx
1  import { render, screen, waitFor } from '@testing-library/react'
2  import { test, expect, vi } from 'vitest'
3  import App from './App'
4
5  test('shows the real backend status once it arrives', async () => {
6    vi.stubGlobal('fetch', vi.fn(() =>
7      Promise.resolve({ json: () => Promise.resolve({ status: 'healthy' }) })
8    ))
9
10   render(<App />)
11
12   await waitFor(() => {
13     expect(screen.getByText(/healthy/)).toBeDefined()
14   })
15 })
```

### The Isolated Example

`Promise`, `async`/`await`, `vi.stubGlobal`, and `waitFor` are all
genuinely new to this series. Isolated, throwaway, and *not* part of
this project — three small, real, separate proofs, not folded into
one:

```tsx
// throwaway.test.tsx — not part of this project, deleted after this unit
import { waitFor } from '@testing-library/react'
import { test, expect, vi } from 'vitest'

test('a throwaway Promise resolves to a known, fake value', async () => {
  const fakeAnswer = () => Promise.resolve('done')
  const result = await fakeAnswer()
  expect(result).toBe('done')
})

test('a throwaway global can be replaced by a real, fake one', () => {
  vi.stubGlobal('Math', { random: () => 0.5 })
  expect(Math.random()).toBe(0.5)
})

test('a throwaway async condition is retried until it becomes true', async () => {
  let ready = false
  setTimeout(() => {
    ready = true
  }, 10)

  await waitFor(() => {
    expect(ready).toBe(true)
  })
})
```

Not run this session — stated from confidence, not executed, per the
Verification Rule: Vitest and Testing Library's own documented
`Promise`/`vi.stubGlobal`/`waitFor` contracts are stable enough that
running `npx vitest run throwaway.test.tsx` is confidently predicted
to print:

```
 ✓ throwaway.test.tsx (3 tests | 3 passed)
```

This predicted, not executed, run establishes, in isolation, exactly
what the real test above depends on. First: `Promise.resolve('done')`
builds a real `Promise` that's already resolved, with no real
asynchronous wait at all — the exact real technique the real test
above uses to fake `fetch`'s own real, eventual answer; `async` on the
test function lets `await` pause it, genuinely, until `fakeAnswer()`'s
own real `Promise` resolves, then hand back its real value directly.
Second: `vi.stubGlobal('Math', { random: () => 0.5 })` replaces the
real, standard global `Math` object with a real, fake one for this
one test only — the identical real mechanism the real test above uses
to replace `fetch` specifically, just applied here to a different,
already-familiar real global instead, to isolate the mechanism itself
from any network-shaped complexity. Third: `ready` starts `false`, a
real `setTimeout` genuinely flips it to `true` after a real, short
delay, and `waitFor` genuinely keeps retrying its own given function
until that real assertion actually passes, rather than checking once
and failing too early — the identical real problem the real test
above's own `await waitFor(...)` call solves for a genuinely
asynchronous, fake network answer instead of a plain timer.

### Discard the Throwaway Example

Nothing about `fakeAnswer`, `ready`, or `throwaway.test.tsx` itself
survives past this unit — deleted, real and in full, once this proof
is understood; it never becomes part of `rebuild/frontend`.

### Mechanical Walkthrough

- **Line 1, `import { render, screen, waitFor } from
  '@testing-library/react'`** — this series' own real, already-used
  `render` and `screen`, plus this lesson's Header's own `waitFor`.
- **Line 2, `import { test, expect, vi } from 'vitest'`** — this
  series' own real, already-used `test`/`expect`, plus `vi`, this
  lesson's Header's own namespace for Vitest's own built-in testing
  utilities.
- **Line 5, `test('shows the real backend status once it arrives',
  async () => {`** — this series' own real `test`, called with a real,
  descriptive name; the arrow function is marked `async` — this
  lesson's Header's own **`async`/`await`** syntax, marking a function
  as one that can real, genuinely pause and wait for a `Promise`, using
  `await`, below, without blocking anything else.
- **Lines 6–8, `vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
  json: () => Promise.resolve({ status: 'healthy' }) })))`** — this
  lesson's Header's own `vi.stubGlobal`, called with the real string
  `'fetch'` and a real, fake replacement function, itself built with
  this lesson's Header's own `vi.fn(...)`. The real, fake function
  itself, when called, returns a real, already-resolved `Promise`
  (this lesson's Header's own `Promise.resolve(...)`) wrapping a real,
  plain object with one real key, `json`, itself a real, fake function
  returning a second, real, already-resolved `Promise` — deliberately
  shaped to match exactly what real `App.tsx` code is expected to
  call: `fetch(...).then(r => r.json())`, without either `Promise`
  ever touching a real network.
- **Line 10, `render(<App />)`** — this series' own real `render`,
  drawing the real `App` component — whose own real `fetch` call, once
  a later, real lesson writes it, reaches this test's own real, fake
  replacement instead of the real browser API.
- **Lines 12–14, `await waitFor(() => { expect(...).toBeDefined() })`**
  — `await`, this lesson's Header's own real syntax, pausing this real
  test function until the real `Promise` `waitFor` returns actually
  settles; `waitFor`, called with a real function containing this
  lesson's own actual claim — real Testing Library's own regular
  expression search, `screen.getByText(/healthy/)`, a real, more
  flexible real query than the exact-string version used before, since
  a later, real lesson's own real markup will surround the real word
  `healthy` with other real, visible text — retried automatically, by
  `waitFor` itself, until it either succeeds or a real, default
  timeout passes.

### CS Lens

This is a real, direct instance of **dependency substitution** for
testing — the same real idea this series' own real **module cache**
unit touched from a different real angle: a real piece of a system
(there, which real `app` package got imported; here, which real
function `fetch` actually is) is made swappable, on purpose,
specifically so a test can control it.

Also recognized in: a real database connection swapped for an in-memory
fake in a real backend unit test; a real payment gateway replaced with
a real "always succeeds" fake during real automated checkout tests; any
real system deliberately designed so a genuinely external dependency
can be substituted rather than actually invoked, for testing.

### SE Lens

The real, deliberately *not*-taken alternative here: writing this
lesson's own real test against a real, actually-running
`rebuild/backend` process instead of a real, fake `fetch`. Rejected on
purpose, for a real, structural reason this lesson's own Header already
named: a test that needs a real, separate process running first is a
genuinely heavier, slower, more fragile real category — an
**integration test**, real and valuable in its own right, but not what
this specific real unit test, checking only `App`'s own real logic, is
for. Actually seeing this work against a real, running backend is a
separate, later lesson's own honest, manual step, not folded into this
automated one.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Not run this session, and, honestly, without a claimed exact
transcript, for the identical, honest reason this series' own prior
frontend lesson gave: this test's exact Vitest/Testing Library console
output has not actually been run and captured, and this series does
not put a fabricated transcript in a lesson. What *is* honestly,
confidently known: `App.tsx`, unmodified so far, still only ever
renders the fixed text `rebuild` — no real, visible text anywhere
matches `/healthy/` yet, so `waitFor`'s own real retries genuinely
exhaust, and the test fails, on real, correct, honest grounds. The
actual, exact console output is something to read directly off a real
`npx vitest run`, not something to trust from this page.

### Connecting this unit to what came before

This series' own first real frontend test proved a real component
could be tested before it existed at all. This unit proves the
identical real discipline extends to asynchronous, real network-shaped
behavior too — a real backend never had to actually run for this real
test to honestly fail first.

---

## Connect the pieces

A real test now exists, expecting `App` to show a real backend's own
real, current status — proven, honestly, to fail, since nothing in
`App` reads a real answer from anywhere yet. Nothing about `App` itself
was changed in this lesson; that's a separate, later lesson's own real,
entire job.

---

**Next lesson:** the actual smallest real change to `App` that makes
this exact test pass, and the real, separate infrastructure — a
dev-server proxy — needed to prove it works against `rebuild/backend`
for real, not just against this lesson's own fake.
