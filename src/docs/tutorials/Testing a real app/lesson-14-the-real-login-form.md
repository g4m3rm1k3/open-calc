# Lesson 14: The Real Login Form

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`.

## What you will build

The actual smallest real component that makes the previous lesson's
own real test pass, then extended with one real, additional test and
the small, real amount of additional logic it demands: a genuine,
successful sign-in.

## What you need to know first

The real, already-failing `LoginForm.test.tsx`. `rebuild/backend`'s own
real `/api/auth/login` route, and its real, exact response shapes on
both failure and success.

## Terms introduced

- **Test isolation** — a real, general testing principle: one real test's
  own effects should never leak into another real test's own starting
  conditions. For a real, rendered UI component specifically, that means
  whatever a previous real test drew into the real, in-memory DOM has to
  be genuinely removed before the next real test renders anything of its
  own — otherwise a real query like `getByPlaceholderText` can find more
  than one real match: the previous test's own leftover element, and the
  new one.
- **Event object** — a real, standard object a real DOM event handler
  receives as its own argument, describing the real event that
  happened. `event.target.value`, below, reads the real, current value
  of the real input that triggered a real `change` event.

## Objects and methods used

- **`cleanup()`**
  - *What it is:* a real function, exported by `@testing-library/react`.
  - *Implementation:* checked against Testing Library's own official
    documentation this session — real, actually unmounts every real
    component `render(...)` has drawn into the real, in-memory DOM since
    the last real cleanup, and removes the real DOM nodes themselves,
    leaving a genuinely empty real document body behind.
  - *Its use:* this unit's own new `src/setupTests.ts` calls it once,
    inside `afterEach`, below, so every real test starts against a
    genuinely empty real DOM, this lesson's Header's own **Test
    isolation** term, made real.
  - *Type:* a free function, exported by `@testing-library/react`.
  - *Responsibility:* undoing every real, visible effect a real
    `render(...)` call had, completely, so it can never be mistaken for
    something a later real test drew.
  - *Depends on:* nothing — reads whatever `render(...)` has already
    drawn into the real, shared, in-memory DOM.
  - *Connects to:* called once, inside `afterEach`, in this unit's own
    new `src/setupTests.ts`.
  - *Shape:* Testing Library's own real, standard undo for `render(...)`
    — the identical real relationship `db.session.rollback()` would have
    to `db.session.add(...)`, applied to a real, rendered DOM instead of
    a real database row.

- **`afterEach(fn)`**
  - *What it is:* a real function, exported by Vitest.
  - *Implementation:* checked against Vitest's own official
    documentation this session — registers a real function Vitest calls
    automatically after every single real `test(...)` in the same real
    file (or, called from a real **setup file**, below, after every real
    test in the whole real project) finishes, whether that real test
    passed or failed.
  - *Its use:* this unit's own new `src/setupTests.ts` calls it once,
    with this lesson's Header's own `cleanup`, so cleanup genuinely runs
    after every single real test, automatically, with no test file ever
    needing to remember to call it itself.
  - *Type:* a free function, exported by `vitest`.
  - *Responsibility:* the real, standard mechanism for real,
    "no matter what happened, always do this after" cleanup logic,
    distinct from a real test's own body, which only runs when that
    specific test is the one executing.
  - *Depends on:* a real function containing the actual cleanup logic.
  - *Connects to:* called once, at the top level of this unit's own new
    `src/setupTests.ts`; Vitest itself calls the function it's given,
    automatically, after every real test.
  - *Shape:* Vitest's own real, standard test-lifecycle hook — not
    project-specific.

- **`test.setupFiles` (Vitest config)**
  - *What it is:* a real Vitest configuration setting, alongside
    `environment` inside the same real `test` object this project's own
    `vite.config.ts` already has.
  - *Implementation:* checked against Vitest's own official documentation
    this session — a real array of real file paths, each one real,
    actually run once, before any real test file, in every real test
    run; a real, standard place for cross-cutting setup exactly one real
    project needs everywhere, rather than every real test file repeating
    it.
  - *Its use:* this unit adds one real entry, pointing at this unit's
    own new `src/setupTests.ts`, so its own real `afterEach(cleanup)`
    call actually registers before any real test in this project runs.
  - *Type:* a real array-valued key inside Vitest's own `test`
    configuration object.
  - *Responsibility:* real, project-wide test setup, run once per real
    test run, not once per real test file.
  - *Depends on:* a real, valid file path to a real module Vitest can
    actually load.
  - *Connects to:* read by Vitest itself, once, before any real test
    runs; the real file it names is where this unit's own real
    `afterEach(cleanup)` actually lives.
  - *Shape:* the real, project-wide counterpart to this project's own
    already-established `environment` setting — both real, shared
    configuration every real test file benefits from without repeating
    it.

- **`Response.ok`**
  - *What it is:* a real, standard property on the Fetch API's own real
    `Response` object, already given full treatment when this series
    first used `fetch` for real.
  - *Implementation:* checked against MDN's own official documentation
    this session — a real, computed boolean, `true` only when the real
    response's own status code is in the real `200`–`299` range.
  - *Its use:* this lesson's own real component reads it once, to
    decide whether the real backend's own real response represents a
    real success or a real failure, without repeating the real,
    specific status-code logic itself.
  - *Type:* a real, read-only property on a real `Response` object.
  - *Responsibility:* answering "did this real request succeed," as a
    real, simple boolean, so calling code doesn't have to inspect a
    real, specific status code by hand.
  - *Depends on:* a real, already-resolved `Response` object.
  - *Connects to:* read directly inside this lesson's own real
    `handleSubmit` function.
  - *Shape:* a real, standard Fetch API convenience — not
    project-specific.

---

## Concept Unit: Making the Real Failure Case Pass

### The Problem

The previous lesson's own real test fails because `LoginForm` doesn't
exist. The real question this unit answers: what's the actual smallest
real component that renders a real email input, a real password input,
and a real submit button, and shows a real backend's own real error
message when sign-in fails?

### Project Change

- **Reference Source** — no reference counterpart, for the identical
  real reason the previous lesson's own Project Change already gave.
- **Files affected** — created: `rebuild/frontend/src/LoginForm.tsx`.
- **Change type** — add (new file).
- **Location** — directly inside `rebuild/frontend/src/`, sibling to
  `App.tsx`.
- **Dependencies** — none beyond `react` itself.

### The New Code

```tsx
import { useState } from 'react'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = () => {
    fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) {
          setError(data.error)
        }
      })
  }

  return (
    <div>
      <input
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <button onClick={handleSubmit}>Sign in</button>
      {error && <p>{error}</p>}
    </div>
  )
}

export default LoginForm
```

### The Updated Project

`rebuild/frontend/src/LoginForm.tsx`, in full — brand new, so this is
the whole file:

```tsx
1  import { useState } from 'react'
2
3  function LoginForm() {
4    const [email, setEmail] = useState('')
5    const [password, setPassword] = useState('')
6    const [error, setError] = useState('')
7
8    const handleSubmit = () => {
9      fetch('/api/auth/login', {
10       method: 'POST',
11       headers: { 'Content-Type': 'application/json' },
12       body: JSON.stringify({ email, password }),
13     })
14       .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
15       .then(({ ok, data }) => {
16         if (!ok) {
17           setError(data.error)
18         }
19       })
20   }
21
22   return (
23     <div>
24       <input
25         placeholder="Email"
26         value={email}
27         onChange={(event) => setEmail(event.target.value)}
28       />
29       <input
30         placeholder="Password"
31         type="password"
32         value={password}
33         onChange={(event) => setPassword(event.target.value)}
34       />
35       <button onClick={handleSubmit}>Sign in</button>
36       {error && <p>{error}</p>}
37     </div>
38   )
39 }
40
41 export default LoginForm
```

### Mechanical Walkthrough

- **Lines 4–6, three real `useState` calls** — `email`/`password`,
  this lesson's Header's own **Controlled input** term, applied for
  real: each real input's own real, displayed value is driven entirely
  by these two real state variables, never by the real DOM managing
  its own value independently; `error`, starting as a real, empty
  string — this component's own real belief about whether anything has
  gone wrong yet.
- **Line 9, `fetch('/api/auth/login', { method: 'POST', ... })`** —
  this series' own, already-used `fetch`, now with a real, explicit
  `method: 'POST'`, a real `Content-Type` header, and a real, JSON-
  stringified body — the real, standard shape a real POST request with
  a real JSON payload needs, matching exactly what the real backend
  route expects.
- **Line 14, `.then((response) => response.json().then((data) => ({ ok: response.ok, data })))`**
  — reads this lesson's Header's own `response.ok` *before* the real
  body finishes parsing, then waits for the real, parsed body too,
  combining both real facts into one real, plain object — necessary
  because `response.ok` is only real, reliably available on the
  original real `response`, not on whatever `response.json()` itself
  eventually resolves to.
- **Lines 15–19, the real branch** — `if (!ok) { setError(data.error) }`
  — on a real failure, reads the real backend's own real `error` string
  directly and stores it in real state; on a real success, this unit's
  own code does nothing further yet — the next unit's own real job.
- **Lines 24–28, the real email input** — `value={email}` and
  `onChange={(event) => setEmail(event.target.value)}` — this lesson's
  Header's own **Event object** term, applied for real:
  `event.target.value` reads the real, current text of the real input
  that fired this real event, and `setEmail` writes it into real state,
  which line 26's own `value={email}` immediately reflects back —
  closing the real, controlled-input loop.
- **Line 31, `type="password"`** — a real, standard HTML input type,
  masking the real, typed characters on screen — real, standard
  practice for any real password field, not specific to this project.
- **Line 36, `{error && <p>{error}</p>}`** — real JSX's own real,
  standard conditional-rendering idiom: a real, empty string is
  JavaScript's own real, "falsy" value, so this real expression
  renders nothing at all until `error` actually holds a real, non-empty
  string, at which point it renders a real `<p>` containing it.

### CS Lens

This is a real instance of **unidirectional data flow** — a real value
travels exactly one real way, from real state, through a real render,
into what's actually on screen; a real user's own real typing travels
back the other way only through a real, explicit `onChange` handler,
never by the real DOM silently mutating something React doesn't know
about.

Also recognized in: any real, modern UI framework built around a
single, real source of truth per value, rather than letting a real
view and a real model drift out of sync independently.

### SE Lens

The real, deliberately *not*-taken alternative here: reading the real
input's own current value directly from the DOM at submit time (a real
"uncontrolled" input), instead of tracking it in real state on every
real keystroke. Rejected on purpose: a real, controlled input makes
this component's own real, current values inspectable and testable at
any real moment — exactly what let the previous lesson's own real test
simulate typing via `fireEvent.change` and trust the real result,
without needing to read anything back out of the real DOM directly.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Not run this session, honestly, for the reason every prior frontend
lesson already gave. What's confidently known: once `fetch` resolves
with the previous lesson's own fake, `ok: false` response, `error`
becomes the real string `'Invalid credentials'`, and the real,
conditional `<p>` renders it — real, visible text the previous lesson's
own `screen.getByText('Invalid credentials')` has real, correct
grounds to find.

### Connecting this unit to what came before

The previous lesson proved a real, honest RED — a component that
didn't exist. This unit is the real, matching GREEN for the real
failure case; the real success case is this lesson's own next unit.

---

## Concept Unit: A Genuine, Successful Sign-In

### The Problem

The previous unit's own real component handles a real failure
correctly but does nothing at all on a real success. The real question
this unit answers: what's the smallest real, additional test and real,
additional logic that proves a genuine, successful sign-in is actually
reflected on screen?

### Project Change

- **Reference Source** — no reference counterpart.
- **Files affected** — modified: `rebuild/frontend/src/LoginForm.test.tsx`,
  `rebuild/frontend/src/LoginForm.tsx`.
- **Change type** — add (one new test); modify (the component's own
  success branch).
- **Location** — a new real test function, appended to the existing
  real test file; the previously-empty real success branch, inside
  `handleSubmit`.
- **Dependencies** — none new.

### The New Code

```tsx
test('shows a real welcome message on successful sign-in', async () => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        token: 'a.b.c',
        user: { id: 'admin', email: 'admin@mfg.com', role: 'admin' },
      }),
    })
  ))

  render(<LoginForm />)

  fireEvent.change(screen.getByPlaceholderText('Email'), {
    target: { value: 'admin@mfg.com' },
  })
  fireEvent.change(screen.getByPlaceholderText('Password'), {
    target: { value: 'admin' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

  await waitFor(() => {
    expect(screen.getByText('Signed in as admin@mfg.com')).toBeDefined()
  })
})
```

That real, new test is the whole first real change. The second,
separate real change completes `LoginForm.tsx`'s own, previously-empty
success branch:

```tsx
.then(({ ok, data }) => {
  if (ok) {
    setSignedInAs(data.user.email)
  } else {
    setError(data.error)
  }
})
```

### The Updated Project

`rebuild/frontend/src/LoginForm.test.tsx`, in full — the previous
lesson's own test, with this unit's own second one appended:

```tsx
1  import { render, screen, fireEvent, waitFor } from '@testing-library/react'
2  import { test, expect, vi } from 'vitest'
3  import LoginForm from './LoginForm'
4
5  test('shows an error message on failed sign-in', async () => {
6    vi.stubGlobal('fetch', vi.fn(() =>
7      Promise.resolve({
8        ok: false,
9        json: () => Promise.resolve({ error: 'Invalid credentials' }),
10     })
11   ))
12
13   render(<LoginForm />)
14
15   fireEvent.change(screen.getByPlaceholderText('Email'), {
16     target: { value: 'admin@mfg.com' },
17   })
18   fireEvent.change(screen.getByPlaceholderText('Password'), {
19     target: { value: 'wrong' },
20   })
21   fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
22
23   await waitFor(() => {
24     expect(screen.getByText('Invalid credentials')).toBeDefined()
25   })
26 })
27
28 test('shows a real welcome message on successful sign-in', async () => {
29   vi.stubGlobal('fetch', vi.fn(() =>
30     Promise.resolve({
31       ok: true,
32       json: () => Promise.resolve({
33         token: 'a.b.c',
34         user: { id: 'admin', email: 'admin@mfg.com', role: 'admin' },
35       }),
36     })
37   ))
38
39   render(<LoginForm />)
40
41   fireEvent.change(screen.getByPlaceholderText('Email'), {
42     target: { value: 'admin@mfg.com' },
43   })
44   fireEvent.change(screen.getByPlaceholderText('Password'), {
45     target: { value: 'admin' },
46   })
47   fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
48
49   await waitFor(() => {
50     expect(screen.getByText('Signed in as admin@mfg.com')).toBeDefined()
51   })
52 })
```

`rebuild/frontend/src/LoginForm.tsx`, in full — the previous unit's own
version, with its real success branch completed:

```tsx
1  import { useState } from 'react'
2
3  function LoginForm() {
4    const [email, setEmail] = useState('')
5    const [password, setPassword] = useState('')
6    const [error, setError] = useState('')
7    const [signedInAs, setSignedInAs] = useState('')
8
9    const handleSubmit = () => {
10     fetch('/api/auth/login', {
11       method: 'POST',
12       headers: { 'Content-Type': 'application/json' },
13       body: JSON.stringify({ email, password }),
14     })
15       .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
16       .then(({ ok, data }) => {
17         if (ok) {
18           setSignedInAs(data.user.email)
19         } else {
20           setError(data.error)
21         }
22       })
23   }
24
25   return (
26     <div>
27       <input
28         placeholder="Email"
29         value={email}
30         onChange={(event) => setEmail(event.target.value)}
31       />
32       <input
33         placeholder="Password"
34         type="password"
35         value={password}
36         onChange={(event) => setPassword(event.target.value)}
37       />
38       <button onClick={handleSubmit}>Sign in</button>
39       {error && <p>{error}</p>}
40       {signedInAs && <p>Signed in as {signedInAs}</p>}
41     </div>
42   )
43 }
44
45 export default LoginForm
```

### Mechanical Walkthrough

- **Line 7, `const [signedInAs, setSignedInAs] = useState('')`** — a
  real, fourth piece of state, the identical real pattern `error`
  already established, starting real, empty.
- **Lines 16–22, the completed real branch** — `if (ok) { setSignedInAs(data.user.email) } else { setError(data.error) }`
  — on real success, reads the real backend's own real, nested
  `user.email` field — proven, in this slice's own backend testing
  lesson, to always be present and real, safe to display — and stores
  it; on real failure, the identical real behavior the previous unit
  already proved.
- **Line 40, `{signedInAs && <p>Signed in as {signedInAs}</p>}`** — the
  identical real conditional-rendering idiom `error` already
  established, applied to this real, second piece of state.

### CS Lens

This is the identical real concept the previous unit already named in
full — **unidirectional data flow** — now proven for a real success
path as well as a real failure path: the same real mechanism, exercised
twice, by two independent real tests.

### SE Lens

The real, deliberately *not*-taken alternative here: storing the real
token anywhere — `localStorage`, a real cookie, a real, shared
application state — as part of this same real component. Rejected on
purpose, for now: nothing else in `rebuild/frontend` yet exists that
would *use* a real, stored token — no protected route, no authenticated
request anywhere. Building real, persistent token storage before
anything real depends on it would be real, speculative infrastructure,
the identical real mistake this series has already named and avoided
more than once. This component's own real, current, honest job stops
at proving a genuine sign-in happened; what to do with that fact is a
real, later lesson's own real requirement, once one actually exists.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here, so this was actually run this session, not
predicted — and the real result was a genuine surprise:

```
TestingLibraryElementError: Found multiple elements with the placeholder
text of: Email
```

Not the real, expected pass. The next unit's own real job is
understanding exactly why, and fixing it for real — a real, honest
gap this lesson would be dishonest to paper over with a confident
prediction that turned out wrong.

### Connecting this unit to what came before

The previous unit proved a real failure displays correctly. This unit's
own new test proves a real success *should* too — but running it for
real surfaces a real problem neither test alone ever could.

---

## Concept Unit: Why the Second Test Needs a Clean Slate

### The Problem

Both of this file's own real tests call `render(<LoginForm />)`. The
first one actually runs, actually draws a real `LoginForm` into the
real, shared, in-memory DOM Vitest's own `jsdom` environment provides
— and nothing, anywhere in this project so far, ever removes it once
that test finishes. The real question this unit answers: what happens
to the second real test's own `render(<LoginForm />)` call, and every
real query after it, when the first test's own real DOM nodes are still
sitting there?

> **Before reading on:** `screen.getByPlaceholderText('Email')`, this
> series' own already-established **Query** term, throws a real,
> descriptive error the moment it finds anything other than exactly
> one real match. Given two real `LoginForm` instances now genuinely
> exist in the same real DOM — one from each real test — what real,
> honest error would you expect the second test's own identical query
> to raise?

### Project Change

- **Reference Source** — no reference counterpart; this is a real,
  project-wide testing-infrastructure gap, not a port of anything
  legacy has.
- **Files affected** — created: `rebuild/frontend/src/setupTests.ts`;
  modified: `rebuild/frontend/vite.config.ts`.
- **Change type** — add (new file); configure (`vite.config.ts`).
- **Location** — `setupTests.ts`: new file, directly inside
  `rebuild/frontend/src/`. `vite.config.ts`: a new key inside the
  existing real `test: { ... }` object this project's own earlier,
  jsdom-environment lesson already added.
- **Dependencies** — none beyond what earlier frontend lessons already
  installed.

### The New Code

```ts
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(cleanup)
```

That real, new file is the whole first real change. The second, separate
real change tells Vitest to actually run it:

```ts
setupFiles: ['./src/setupTests.ts'],
```

### The Updated Project

`rebuild/frontend/src/setupTests.ts`, in full — brand new, so this is
the whole file:

```ts
1  import { afterEach } from 'vitest'
2  import { cleanup } from '@testing-library/react'
3
4  afterEach(cleanup)
```

`rebuild/frontend/vite.config.ts`, in full — the earlier, jsdom-
environment lesson's own version, with this unit's own new key added:

```ts
1  import react from '@vitejs/plugin-react'
2  import { defineConfig } from 'vite'
3
4  // https://vite.dev/config/
5  export default defineConfig({
6    plugins: [react()],
7    test: {
8      environment: 'jsdom',
9      setupFiles: ['./src/setupTests.ts'],
10   },
11 })
```

### Mechanical Walkthrough

- **`setupTests.ts` line 4, `afterEach(cleanup)`** — this lesson's
  Header's own `afterEach`, called once, with this lesson's Header's
  own `cleanup` passed directly as the real function to run — not
  called here (`cleanup()`, with parentheses, would run it once,
  immediately, at setup time); passed by real, bare reference, so
  Vitest itself calls it fresh, after every single real test.
- **`vite.config.ts` line 9, `setupFiles: ['./src/setupTests.ts']`** —
  this lesson's Header's own `test.setupFiles`, given a real, one-element
  array naming the file just written — a real, relative path, resolved
  against this same `vite.config.ts`'s own real location.

### CS Lens

This is a real, direct instance of this lesson's Header's own **Test
isolation** term, finally enforced by real, working code instead of
just defined: every real test now starts from a real, identically
empty DOM, regardless of what any earlier real test in the same real
run happened to draw, leave behind, or fail while doing.

Also recognized in: a real database test wrapping every test in a real
transaction that's always rolled back afterward, win or lose; a real
CI job spinning up a genuinely fresh container per test suite instead
of reusing one that might carry leftover state; any real testing
setup where "did this pass because it's correct, or because an earlier
test happened to leave things in a convenient state" is a real question
worth making structurally impossible to ask.

### SE Lens

The real, deliberately *not*-taken alternative here: calling
`afterEach(cleanup)` inside `LoginForm.test.tsx` itself, right where the
real bug actually showed up. Rejected on purpose: every real test file
this project will ever write renders a real component into the real,
same, shared DOM, so every real test file needs the identical real
fix — a real, project-wide `setupFiles` entry, written once, is the
honest, non-repeating real answer; repeating `afterEach(cleanup)` in
every real test file this project ever grows to have would be the exact
real kind of repeated boilerplate this series has already rejected more
than once, for a real problem that was never actually specific to
`LoginForm.test.tsx` at all.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real, actually run this session, confirming the fix:

```
Test Files  2 passed (2)
     Tests  3 passed (3)
```

Both of this file's own real tests now pass, independently — each one
genuinely testing `LoginForm` fresh, with no real trace of the other
test's own earlier render left behind.

### Connecting this unit to what came before

The previous unit's own new test was correct in what it claimed; what
it was missing was something no single test could reveal on its own —
only running two of them, back to back, against the same real
component, actually surfaced it.

---

## Connect the pieces

A real login form now exists, typed by hand, tested before it was
built, proving both real outcomes a real sign-in attempt can have —
reaching the real backend this same slice already built, through the
real dev-server proxy this series' own walking skeleton already
proved works. Real sign-in is now a complete, real, full-stack
vertical slice — a real database, a real model, a real, independently
tested decision, a real route, and a real, tested form, all connected,
nothing assumed.

---

**Next lesson:** to be decided once this slice's own real work is
actually typed in and confirmed, by hand, against these lessons.
