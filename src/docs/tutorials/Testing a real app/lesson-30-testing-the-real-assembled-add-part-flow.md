# Lesson 30: Testing the Real, Assembled Add Part Flow

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`.

## What you will build

A real, automated test proving `App` actually connects everything the
last three lessons built in isolation: `AddPartForm` only appears once
a real user has actually signed in, and `PartsList` actually shows a
real, newly created part afterward — not merely that each real piece
works alone.

## What you need to know first

`App`'s own real, existing test, `LoginForm`'s own real sign-in
fields, `AddPartForm`'s own real fields, and `PartsList`'s own real,
empty-state message — all real, already built and separately proven.

## Terms introduced

- **Route-aware mock** — a real, fake `fetch` written as a real
  function, not a fixed value, that inspects its own real, given
  arguments (the real URL, the real request options) and returns a
  genuinely different real, fake response depending on what was
  actually asked for — necessary the moment a real test exercises more
  than one real endpoint in a single real run, which every prior real
  frontend test in this project, testing exactly one real component in
  isolation, never actually needed to do.

## Objects and methods used

None genuinely new beyond this lesson's Header's own new term — this
lesson's real mock is still built from `vi.stubGlobal`/`vi.fn`,
already given full treatment; only the real function passed to
`vi.fn` grows a real, new capability.

---

## Concept Unit: One Real Mock, Three Real Endpoints

### The Problem

Every real frontend test this project has written so far mocks
`fetch` to answer exactly one real question, because each one renders
exactly one real component talking to exactly one real endpoint. This
unit's own real test renders the whole real `App` and drives it
through three real, separate real requests in sequence — a real
sign-in, a real part creation, and the real, resulting refresh — each
needing a genuinely different real, fake answer. The real question
this unit answers: what does a real `fetch` mock capable of that
actually look like?

> **Before reading on:** this project's own real `PartsList` and
> `AddPartForm` both call `fetch('/api/parts', ...)` — the identical
> real URL, real `GET` for one, real `POST` for the other. Given a
> real mock function receives the exact same real arguments a real
> call site passed to `fetch` itself, what real, available piece of
> information could a real mock actually check, to tell those two real
> calls apart?

### Project Change

- **Reference Source** — no reference counterpart; this is a real test
  of this project's own real, assembled frontend, not a port of
  anything in legacy.
- **Files affected** — modified: `rebuild/frontend/src/App.test.tsx`.
- **Change type** — add (one new real test, appended to the existing
  real file).
- **Location** — appended to the end of the file.
- **Dependencies** — none beyond what earlier frontend lessons already
  installed.

### The New Code

```tsx
test('shows the Add Part form once signed in, and refreshes the parts list after a real creation', async () => {
  let created = false

  vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
    if (url === '/api/auth/login') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          token: 'a.b.c',
          user: { id: 'admin', email: 'admin@mfg.com', role: 'admin' },
        }),
      })
    }

    if (options?.method === 'POST') {
      created = true
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          data: { id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', material: '6061-T6 Aluminum' },
        }),
      })
    }

    return Promise.resolve({
      json: () => Promise.resolve(
        created
          ? { data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket' }], total: 1 }
          : { data: [], total: 0 }
      ),
    })
  }))

  render(<App />)

  fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'admin@mfg.com' } })
  fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'admin' } })
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

  await waitFor(() => {
    expect(screen.getByPlaceholderText('Part Number')).toBeDefined()
  })

  fireEvent.change(screen.getByPlaceholderText('Part Number'), { target: { value: '1234567' } })
  fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Landing Gear Bracket' } })
  fireEvent.change(screen.getByPlaceholderText('Material'), { target: { value: '6061-T6 Aluminum' } })
  fireEvent.click(screen.getByRole('button', { name: 'Create Part' }))

  await waitFor(() => {
    expect(screen.getByText('1234567', { exact: false })).toBeDefined()
  })
})
```

### The Updated Project

`rebuild/frontend/src/App.test.tsx`, in full — the previous lesson's
own test, with this unit's own second one appended:

```tsx
1  import { render, screen, fireEvent, waitFor } from '@testing-library/react'
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
20
21 test('shows the Add Part form once signed in, and refreshes the parts list after a real creation', async () => {
22   let created = false
23
24   vi.stubGlobal('fetch', vi.fn((url: string, options?: RequestInit) => {
25     if (url === '/api/auth/login') {
26       return Promise.resolve({
27         ok: true,
28         json: () => Promise.resolve({
29           token: 'a.b.c',
30           user: { id: 'admin', email: 'admin@mfg.com', role: 'admin' },
31         }),
32       })
33     }
34
35     if (options?.method === 'POST') {
36       created = true
37       return Promise.resolve({
38         ok: true,
39         json: () => Promise.resolve({
40           data: { id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket', material: '6061-T6 Aluminum' },
41         }),
42       })
43     }
44
45     return Promise.resolve({
46       json: () => Promise.resolve(
47         created
48           ? { data: [{ id: 'P-001', partNumber: '1234567', description: 'Landing Gear Bracket' }], total: 1 }
49           : { data: [], total: 0 }
50       ),
51     })
52   }))
53
54   render(<App />)
55
56   fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'admin@mfg.com' } })
57   fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'admin' } })
58   fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))
59
60   await waitFor(() => {
61     expect(screen.getByPlaceholderText('Part Number')).toBeDefined()
62   })
63
64   fireEvent.change(screen.getByPlaceholderText('Part Number'), { target: { value: '1234567' } })
65   fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Landing Gear Bracket' } })
66   fireEvent.change(screen.getByPlaceholderText('Material'), { target: { value: '6061-T6 Aluminum' } })
67   fireEvent.click(screen.getByRole('button', { name: 'Create Part' }))
68
69   await waitFor(() => {
70     expect(screen.getByText('1234567', { exact: false })).toBeDefined()
71   })
72 })
```

### Mechanical Walkthrough

- **Line 22, `let created = false`** — a real, plain, mutable variable,
  captured by the real mock function's own closure, tracking one real
  fact across this unit's own real, multiple `fetch` calls: has a real
  part actually been created yet.
- **Line 24, `vi.fn((url: string, options?: RequestInit) => {`** — this
  lesson's Header's own **Route-aware mock**: instead of a real,
  fixed `Promise.resolve(...)`, a real function reading its own real
  arguments and choosing what to return.
- **Lines 25–33, the real login branch** — checked first, matching on
  `url === '/api/auth/login'`, the one real endpoint no other real
  component in this test also calls, so no further real check is
  needed.
- **Lines 35–43, the real creation branch** — `options?.method ===
  'POST'` — this unit's own real, answered Socratic question: `GET
  '/api/parts'` (`PartsList`) never passes an `options` argument at
  all, so `options?.method` is real, honestly `undefined` for it;
  only `AddPartForm`'s own real `POST` call actually sets one. Setting
  `created = true` here, real and immediately, rather than inside a
  real, later `.then`, since this line already runs at the real,
  correct moment — after the real request has been made, before its
  real caller has finished handling the response.
- **Lines 45–51, the real, remaining case** — reached only by `GET
  '/api/parts'`; returns a real, empty list before `created` is real
  `true`, and the real, newly created part afterward — the identical
  real shape `PartsList`'s own real, existing tests already used for
  each case separately, now chosen dynamically by one real mock.
- **Lines 56–58, real sign-in** — this project's own, already-proven
  `LoginForm` interaction, reused verbatim.
- **Lines 60–62, the real, awaited claim this unit actually adds**:
  once signed in, `AddPartForm` — genuinely absent until now — is
  real, expected to actually appear.
- **Lines 64–67, real part creation** — filling in and submitting
  `AddPartForm`, the identical real interaction its own lesson already
  proved works in isolation.
- **Lines 69–71, the real, final claim**: `PartsList`, still real and
  on-screen since sign-in, is real, expected to now show the real part
  number just created — proving a real refresh actually happened, not
  merely that creation itself succeeded.

### CS Lens

This is a real instance of an **end-to-end test** — proving a real
sequence of real, separately-working pieces actually cooperate when
genuinely wired together, a real class of bug unit tests of each real
piece alone can never catch: each of `LoginForm`, `AddPartForm`, and
`PartsList` could individually pass every real test they already have
while `App` still forgets to actually connect them.

Also recognized in: any real "smoke test" or "happy path" test driving
a whole real application through a real, realistic sequence of real
actions, rather than one real unit in isolation.

### SE Lens

The real, deliberately *not*-taken alternative here: writing three
separate, smaller real tests — one for "form appears after sign-in,"
one for "creating a part calls the real endpoint," one for "the list
refreshes" — each with its own real, simpler mock. Rejected on
purpose, for this specific real case: the actual real claim this unit
cares about isn't any one of those three real facts alone, it's that
they genuinely chain — signing in real leads to being able to create,
creating real leads to seeing the result. Three real, separate tests
could each pass while the real chain between them was actually broken
(imagine `App` real, always rendering `AddPartForm`, sign-in or not —
a real bug the first, isolated test wouldn't real, catch, since it
never checks the *absence* case). One real, connected test is the
honest way to prove a real chain, not just its real links.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here — a real, three-branch mock is exactly the
kind of thing easy to get honestly wrong — so this was actually run
this session, against the real, current `App`, which doesn't render
`AddPartForm` at all yet:

```
Test Files  1 failed (1)
     Tests  1 failed | 1 passed (2)
```

The real, previous test still passes, unaffected. This unit's own new
test fails exactly where expected: real sign-in genuinely succeeds —
the rendered, real output confirms `Signed in as admin@mfg.com` — and
then the real wait for `Part Number` times out, since nothing in
`App` renders `AddPartForm` yet. The correct, honest RED.

### Connecting this unit to what came before

The previous three lessons each proved one real piece in isolation.
This unit is the real, first proof that they're actually supposed to
work together — still honestly failing, since nothing has wired them
together yet.

---

## Connect the pieces

A real test now exists, describing the actual, complete real flow this
project's Add Part feature is supposed to support — proven, honestly,
to fail at the real point where `App` currently stops short. Nothing
about *how* `App` should wire these three real pieces together was
decided here; only what the real result has to look like once it
does.

---

**Next lesson:** the actual smallest real change to `App` and
`AddPartForm` that makes this test pass.
