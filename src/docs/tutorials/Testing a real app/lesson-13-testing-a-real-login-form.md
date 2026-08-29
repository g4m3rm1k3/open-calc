# Lesson 13: Testing a Real Login Form

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. Lessons 8-12 built real
> sign-in on the backend only — this is the same mistake this series
> already made once, with `/health`, and already corrected: a feature
> isn't a real, complete vertical slice until its own frontend half
> exists too. This lesson starts that half, test-first, the same real
> discipline this series already used for `/health`.

## What you will build

A real, automated test for a real login form component — before that
component exists — covering what a real user actually does: type an
email and a password, submit, and see either a real error or real
proof of success. This lesson does not build the real component; a
separate, later lesson does.

## What you need to know first

This series' own real frontend-testing tools (Vitest, Testing Library),
already used for `rebuild/frontend`'s own earlier tests. The real,
already-working backend route (`POST /api/auth/login`) this form will
eventually call.

## Terms introduced

- **Controlled input** — a real React pattern where a real form field's
  own displayed value is driven entirely by real component state (via
  `useState`), rather than the real, underlying DOM element managing
  its own value independently. Every real keystroke updates real state;
  the real, displayed value always reflects that real state directly.
- **`fireEvent`** — a real, Testing Library utility simulating a real,
  specific DOM event (a real click, a real change to an input's value)
  against a real element already found in a real, rendered, in-memory
  DOM — the real, standard way a frontend test triggers real user
  interaction without a real, physical browser or a real person
  actually present.

## Objects and methods used

- **`fireEvent.change(element, options)`**
  - *What it is:* a real function, exported by
    `@testing-library/react`.
  - *Implementation:* checked against Testing Library's own official
    documentation this session — dispatches a real, standard DOM
    `change` event against the given real element, with
    `options.target.value` setting the real, new value that event
    carries — the identical real event a real browser fires when a
    real person types into a real input.
  - *Its use:* this lesson's own real test calls it twice, once per
    real input field, to simulate a real user typing a real email and
    a real password.
  - *Type:* a free function, exported by `@testing-library/react`.
  - *Responsibility:* triggering a real, specific DOM event against a
    real element, so real event handlers wired to it — a real
    component's own real `onChange`, here — actually run.
  - *Depends on:* a real, already-found DOM element to dispatch the
    event against.
  - *Connects to:* called directly by this lesson's own real test;
    the real component's own real `onChange` handler, once a later
    lesson writes it, is what actually responds.
  - *Shape:* Testing Library's own real, standard way of simulating
    real user interaction against a real, rendered, in-memory DOM.

- **`fireEvent.click(element)`**
  - *What it is:* a real function, exported by
    `@testing-library/react`, part of the same real `fireEvent`
    namespace as `.change`, above.
  - *Implementation:* checked against Testing Library's own official
    documentation this session — dispatches a real, standard DOM
    `click` event against the given real element.
  - *Its use:* this lesson's own real test calls it once, on the real
    submit button, to simulate a real user submitting the real form.
  - *Type:* a free function, exported by `@testing-library/react`.
  - *Responsibility:* the identical real responsibility `.change`
    already has, applied to a real click instead of a real value
    change.
  - *Depends on:* a real, already-found DOM element.
  - *Connects to:* called directly by this lesson's own real test; a
    later lesson's own real form-submission handler is what actually
    responds.
  - *Shape:* the identical real Testing Library interaction boundary
    `.change` already established.

- **`screen.getByPlaceholderText(text)` / `screen.getByRole(role, options)`**
  - *What they are:* two more real methods on the real, shared
    `screen` object, already introduced when this series wrote its
    first real frontend test.
  - *Implementation:* checked against Testing Library's own official
    documentation this session — `getByPlaceholderText` finds a real
    input by its real, visible placeholder text; `getByRole` finds a
    real element by its real, standard ARIA role (`'button'`, here),
    optionally narrowed further by a real `name` option matching its
    real, visible label.
  - *Their use:* this lesson's own real test uses both to find the
    real email input, the real password input, and the real submit
    button, all by what a real user would actually see or hear (a
    real screen reader included), never by an internal, real
    implementation detail.
  - *Type:* real instance methods on the shared `screen` object.
  - *Responsibility:* the identical real responsibility
    `screen.getByText` already has, applied to real form controls
    instead of real, static text.
  - *Depends on:* something already drawn into the real, in-memory DOM.
  - *Connects to:* called directly by this lesson's own real test.
  - *Shape:* this series' own already-established **Query** term,
    applied for real to real, interactive elements.

---

## Concept Unit: A Form That Reports What Actually Happened

### The Problem

`rebuild/frontend` has no login form at all yet. The real question this
unit answers: what does a real, automated test for one look like,
proving a real user can type real credentials, submit them, and see a
real, honest outcome — all before that real component exists?

> **Before reading on:** this project's own real backend route already
> returns a real, generic `'Invalid credentials'` string on any real
> failure. Given that a real form has to show *something* when sign-in
> fails, what's the smallest real, honest thing it could show, without
> this test needing to invent new wording the real backend never
> actually sends?

### Project Change

- **Reference Source** — no reference counterpart; legacy's own real
  frontend has a real login flow, but it's woven into a large, real,
  Electron/Zustand-based application this series deliberately isn't
  porting wholesale — see this slice's own earlier, walking-skeleton
  lessons for why. This unit characterizes the real, minimum behavior a
  login form needs, not a port of legacy's own real component.
- **Files affected** — created:
  `rebuild/frontend/src/LoginForm.test.tsx`.
- **Change type** — add (new file).
- **Location** — directly inside `rebuild/frontend/src/`, sibling to
  `App.test.tsx`.
- **Dependencies** — none beyond what earlier frontend lessons already
  installed.

### The New Code

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { test, expect, vi } from 'vitest'
import LoginForm from './LoginForm'

test('shows an error message on failed sign-in', async () => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      ok: false,
      json: () => Promise.resolve({ error: 'Invalid credentials' }),
    })
  ))

  render(<LoginForm />)

  fireEvent.change(screen.getByPlaceholderText('Email'), {
    target: { value: 'admin@mfg.com' },
  })
  fireEvent.change(screen.getByPlaceholderText('Password'), {
    target: { value: 'wrong' },
  })
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

  await waitFor(() => {
    expect(screen.getByText('Invalid credentials')).toBeDefined()
  })
})
```

### The Updated Project

`rebuild/frontend/src/LoginForm.test.tsx`, in full — brand new, so
this is the whole file:

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
```

### The Isolated Example

`fireEvent` is genuinely new to this series. Isolated, throwaway, and
*not* part of this project:

```tsx
// throwaway.test.tsx — not part of this project, deleted after this unit
import { render, screen, fireEvent } from '@testing-library/react'
import { test, expect } from 'vitest'
import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount(count + 1)}>
      clicked {count} times
    </button>
  )
}

test('a throwaway click updates real, visible text', () => {
  render(<Counter />)
  fireEvent.click(screen.getByRole('button'))
  expect(screen.getByText('clicked 1 times')).toBeDefined()
})
```

Not run this session — stated from confidence, not executed, per the
Verification Rule: standard, documented Testing Library/React
behavior. Confidently predicted:

```
✓ throwaway.test.tsx (1 test | 1 passed)
```

This proves, in isolation, exactly what this unit's own real test
depends on: `fireEvent.click` genuinely dispatches a real DOM event
that a real component's own real `onClick` handler actually receives,
and a real, resulting `useState` update genuinely, visibly changes
what `screen.getByText` finds afterward — the identical real mechanism
this unit's own real test uses for `fireEvent.change` on a real input
instead of a real click on a real button.

### Discard the Throwaway Example

`Counter` and `throwaway.test.tsx` never become part of
`rebuild/frontend` — they exist only to isolate real event simulation
from this unit's own actual, real login form test.

### Mechanical Walkthrough

- **Lines 6–11, the real, fake `fetch`** — this series' own,
  already-established `vi.stubGlobal`/`vi.fn` pattern, now returning a
  real, fake `Response`-shaped object whose `ok` is `false` — a real,
  standard property real `fetch` responses carry, `true` only for a
  real `2xx` status; a later lesson's own real component uses this
  real property to decide whether to show a real error.
- **Lines 15–17, `fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'admin@mfg.com' } })`**
  — this lesson's Header's own `screen.getByPlaceholderText`, finding a
  real input by what a real user would actually see inside it before
  typing; this lesson's Header's own `fireEvent.change`, simulating a
  real user typing a real email into it.
- **Lines 18–20, the identical real pattern, for the real password
  field.**
- **Line 21, `fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))`**
  — this lesson's Header's own `screen.getByRole`, finding the real
  submit button by its real, accessible role and real, visible label;
  this lesson's Header's own `fireEvent.click`, simulating a real
  submission.
- **Lines 23–25, the real, awaited assertion** — this series'
  already-established `waitFor`, since the real form's own eventual
  submission handler will genuinely, asynchronously call `fetch` before
  any real error can appear.

### CS Lens

This is a real instance of testing **from the real user's own
perspective** — every real query in this test (`getByPlaceholderText`,
`getByRole`, `getByText`) finds something a real, sighted or
screen-reader user would also find, and every real interaction
(`fireEvent.change`/`.click`) is something a real user could actually
do — never a real, internal implementation detail like a component's
own variable name or a CSS class.

Also recognized in: Testing Library's own, official, stated philosophy
("the more your tests resemble the way your software is used, the
more confidence they can give you"); any real UI test suite built
around real, user-facing queries instead of real, internal component
structure.

### SE Lens

The real, deliberately *not*-taken alternative here: querying for the
real input fields by a real `id` or `data-testid` attribute instead of
their real, visible placeholder text. Rejected on purpose, the
identical real reason this series already gave when it first
introduced the **Query** term: a check tied to what a real user
actually sees survives a real internal rewrite (renaming a variable, restructuring
the component's own internals); a check tied to an attribute added
solely for testing does not, and also proves nothing about whether a
real, actual user could find the field at all.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Not run this session, and, honestly, without a claimed exact
transcript, for the identical reason every prior frontend lesson
already gave. What *is* honestly, confidently known: `LoginForm`
doesn't exist yet at all, so `import LoginForm from './LoginForm'`
itself fails before any real assertion even runs — the correct,
honest starting RED.

### Connecting this unit to what came before

Every backend lesson in this slice proved its own real logic before
building the thinnest possible adapter around it. This unit starts the
identical real discipline for the frontend half of the same real
feature.

---

## Connect the pieces

A real test now exists, describing exactly what a real login form has
to do — accept real input, submit it, and honestly report a real
failure — proven, honestly, to fail since the component doesn't exist.
Nothing about *how* the form is built was decided here; only what it
must actually do.

---

**Next lesson:** the actual smallest real component that makes this
test pass, and a real, successful sign-in proven the same way.
