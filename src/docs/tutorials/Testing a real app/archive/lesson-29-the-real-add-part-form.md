# Lesson 29: The Real Add Part Form

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`.

## What you will build

The actual smallest real component that makes the previous lesson's
own two real tests pass: a real form, submitting a real, authenticated
request to this project's own real `POST /api/parts` route, reporting
whichever real outcome that route actually gives back.

## What you need to know first

The real, already-failing `AddPartForm.test.tsx`. `LoginForm`'s own
real `useState`-per-field pattern and its own real
`.then((response) => response.json().then((data) => ({ ok:
response.ok, data })))` shape, already given full treatment.

## Terms introduced

- **Form submit event** — a real, standard DOM event, fired when a
  real `<form>` is submitted — by a real click on a real `type="submit"`
  button inside it, or by a real Enter key press inside one of its real
  fields — genuinely different from the real `click` event this
  project's own `LoginForm` button already handles directly; a real
  `<form>`'s own real submit event fires once, however the real
  submission was actually triggered, which is exactly why this unit
  uses one instead.

## Objects and methods used

- **`<form onSubmit={handler}>`**
  - *What it is:* a real, standard HTML element, `<form>`, given a real
    React `onSubmit` prop.
  - *Implementation:* checked against React's own official
    documentation this session — React attaches the real handler to
    this lesson's Header's own **Form submit event**; the real handler
    receives a real `FormEvent`, one real object shape for however the
    real submission actually happened.
  - *Its use:* this unit's own real form wraps all three real fields
    and the real submit button in one real `<form>`, so filling in a
    field and pressing Enter works identically to clicking the real
    button — a real behavior this project's own `LoginForm`, which
    has no real `<form>` at all, doesn't actually have.
  - *Type:* a real, standard JSX element with a real, standard React
    event prop.
  - *Responsibility:* grouping a real set of real inputs and firing one
    real event when any of them requests submission.
  - *Depends on:* nothing beyond React's own real, standard event
    system, already relied on for every real `onClick`/`onChange` this
    project has used.
  - *Connects to:* this unit's own real `handleSubmit`, below.
  - *Shape:* a real, standard HTML relationship — `<form>` to its own
    real, contained controls — genuinely new to this project, though
    not to HTML itself.

- **`event.preventDefault()`**
  - *What it is:* a real, standard method on this lesson's Header's own
    **Form submit event** object.
  - *Implementation:* checked against MDN's own documentation this
    session — a real `<form>`'s own, default, real browser behavior on
    submit is a real, full-page navigation/reload, posting its real
    fields as a real URL query or request body to whatever real `action`
    URL it has (none, here); calling this real method stops that real,
    default behavior from happening at all.
  - *Its use:* the real, first line of this unit's own real
    `handleSubmit`, so this unit's own real `fetch` call runs instead
    of a real, unwanted page reload discarding it.
  - *Type:* a real, standard method, present on every real DOM event
    object.
  - *Responsibility:* stopping one specific real, default browser
    action; nothing else about the real event.
  - *Depends on:* being called against a real event that actually has
    one; this lesson's Header's own submit event does.
  - *Connects to:* called first, inside `handleSubmit`, before this
    unit's own real `fetch` call runs.
  - *Shape:* a real, narrow escape hatch, opting out of one specific
    real, default behavior without disabling anything else about the
    real event.

- **Template literal (`` `Bearer ${token}` ``)**
  - *What it is:* real, standard JavaScript/TypeScript string syntax,
    backtick-delimited, allowing a real `${...}` expression embedded
    directly inside the real string.
  - *Implementation:* checked against MDN's own documentation this
    session — evaluates the real, embedded expression and converts its
    real result to a real string, splicing it into the surrounding real
    text at exactly that point.
  - *Its use:* this unit's own real `Authorization` header value,
    `` `Bearer ${token}` `` — this project's own real backend,
    `token_required`, already expects exactly this real, space-separated
    `Bearer <token>` shape, confirmed against its own real source in an
    earlier lesson.
  - *Type:* real, standard JavaScript/TypeScript syntax, not a function
    or object.
  - *Responsibility:* building one real string out of real, fixed text
    and a real, variable piece, without real, manual string
    concatenation (`'Bearer ' + token`).
  - *Depends on:* nothing beyond the real value being embedded already
    existing — here, this unit's own real `token` prop.
  - *Connects to:* the real `headers` object inside this unit's own
    real `fetch` call.
  - *Shape:* a real, direct replacement for real `+`-based string
    concatenation, wherever a real value needs to sit inside a larger
    real string.

---

## Concept Unit: A Form That Actually Submits

### The Problem

The previous lesson's own real test renders `<AddPartForm token="a.b.c"
/>` and expects a real, working form; nothing by that name exists yet.
The real question this unit answers: what's the actual smallest real
component making both of the previous lesson's own real tests pass?

### Project Change

- **Reference Source** — legacy's own real `handleCreatePart`, already
  named in the previous lesson, real and read again here for its own
  real request shape: a real `POST` to `ENDPOINTS.PARTS`, a real JSON
  body built from its own real `newPartData` state.
- **Files affected** — created: `rebuild/frontend/src/AddPartForm.tsx`.
- **Change type** — add (new file).
- **Location** — directly inside `rebuild/frontend/src/`, sibling to
  `LoginForm.tsx`.
- **Dependencies** — none beyond `react` itself.

### The New Code

```tsx
function AddPartForm({ token }: { token: string }) {
  const [partNumber, setPartNumber] = useState('')
  const [description, setDescription] = useState('')
  const [material, setMaterial] = useState('')
  const [error, setError] = useState('')
  const [created, setCreated] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()

    fetch('/api/parts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ partNumber, description, material }),
    })
      .then((response) => response.json().then((data) => ({ ok: response.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setCreated(data.data.partNumber)
          setError('')
        } else {
          setError(data.error)
        }
      })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Part Number"
        value={partNumber}
        onChange={(event) => setPartNumber(event.target.value)}
      />
      <input
        placeholder="Description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
      />
      <input
        placeholder="Material"
        value={material}
        onChange={(event) => setMaterial(event.target.value)}
      />
      <button type="submit">Create Part</button>
      {error && <p>{error}</p>}
      {created && <p>Created {created}.</p>}
    </form>
  )
}
```

### The Updated Project

`rebuild/frontend/src/AddPartForm.tsx`, in full — brand new, so this is
the whole file:

```tsx
1  import { useState } from 'react'
2
3  function AddPartForm({ token }: { token: string }) {
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
26         } else {
27           setError(data.error)
28         }
29       })
30   }
31
32   return (
33     <form onSubmit={handleSubmit}>
34       <input
35         placeholder="Part Number"
36         value={partNumber}
37         onChange={(event) => setPartNumber(event.target.value)}
38       />
39       <input
40         placeholder="Description"
41         value={description}
42         onChange={(event) => setDescription(event.target.value)}
43       />
44       <input
45         placeholder="Material"
46         value={material}
47         onChange={(event) => setMaterial(event.target.value)}
48       />
49       <button type="submit">Create Part</button>
50       {error && <p>{error}</p>}
51       {created && <p>Created {created}.</p>}
52     </form>
53   )
54 }
55
56 export default AddPartForm
```

### Mechanical Walkthrough

- **Lines 4–8, five real, separate `useState` calls** — this project's
  own already-established, one-`useState`-per-field pattern, the
  identical real shape `LoginForm` already used for its own four real
  fields; `error` and `created` hold this unit's own two real, mutually
  exclusive outcomes.
- **Line 10, `(event: React.FormEvent) => {`** — this lesson's Header's
  own **Form submit event**, typed with React's own real, built-in
  `FormEvent` type.
- **Line 11, `event.preventDefault()`** — this lesson's Header's own
  real method, stopping the real, default full-page reload a real
  `<form>` submission would otherwise cause.
- **Lines 13–19, the real `fetch` call** — `'/api/parts'`, this
  project's own real, already-proven route; `'Authorization': \`Bearer
  ${token}\`` — this lesson's Header's own real template literal,
  building the real header value this project's own real
  `token_required` decorator already expects; `body`, this unit's own
  real three fields, matching exactly what this project's own real
  `Part.from_dict` actually reads.
- **Lines 21–29, the real, combined `.then`** — this project's own,
  already-established `LoginForm` pattern, reused verbatim in shape:
  parse the real body regardless of real status, then branch on
  `response.ok`. `data.data.partNumber`, line 24 — the real, created
  part's own real part number, read back from this project's own real
  backend's own real response, the identical real discipline
  `LoginForm`'s own `data.user.email` already established: trusting
  what the real server actually confirms, not merely echoing back
  whatever the real client already had.
- **Line 33, `<form onSubmit={handleSubmit}>`** — this lesson's
  Header's own real element, wrapping every real field and the real
  submit button.
- **Line 49, `<button type="submit">`** — a real, explicit
  `type="submit"`, rather than relying on a real `<button>`'s own
  default type inside a real `<form>` — real and explicit, so a future
  real reader never has to recall an implicit real HTML default to
  understand what this real button does.

### CS Lens

This is a real instance of using the platform's own real, built-in
mechanism instead of reinventing it: a real `<form>`'s own real submit
event already unifies "clicked the button" and "pressed Enter in a
field" into one real, single real code path, at no real, additional
cost. `LoginForm`'s own real `onClick`-only approach only ever handles
the first of those two real, genuine user behaviors.

Also recognized in: any real web form using a real `<form>` and
`onSubmit` rather than a real, bare button with a real click handler —
the standard, expected real behavior for anything a real user might
reasonably press Enter to submit.

### SE Lens

The real, deliberately *not*-taken alternative here: matching
`LoginForm`'s own real, existing `onClick`-only shape exactly, for
real consistency with this project's own established pattern. Rejected
on purpose: real consistency is a real, genuine value, but it isn't
this project's *only* real value — a real form specifically benefits
from real `<form>` semantics in a way a real, one-button sign-in
control does not lose much by lacking. The honest, stated real
inconsistency this creates: this project now has one real component
using `onClick` and one using `onSubmit`, for a real, stated, examined
reason — not an accidental, unexamined drift.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real, actually run this session, confirming both of the previous
lesson's own real tests:

```
Test Files  1 passed (1)
     Tests  2 passed (2)
```

A real `npx tsc --noEmit` was also actually run this session against
this unit's own new, real `React.FormEvent` typing — a genuine, clean
compile, no real output at all. The full, real, accumulated frontend
suite was run as well:

```
Test Files  4 passed (4)
     Tests  7 passed (7)
```

Every real test this project has already written — `App`, `LoginForm`,
`PartsList`, and this unit's own new `AddPartForm` — still passes,
together.

### Connecting this unit to what came before

The previous lesson proved a real, honest RED — a component that
didn't exist. This unit is the real, matching GREEN for both of its
real cases at once: nothing about this unit's own real logic branches
between them beyond the real `ok` check every prior form component
already used.

---

## Connect the pieces

A real, working Add Part form now exists, proven against both real
outcomes this project's own backend can actually produce — not yet
reachable by a real user, since nothing renders it inside `App` yet,
and not yet connected to `PartsList`'s own real, eventual need to show
whatever it just created.

---

**Next lesson:** wiring this unit's own real form into `App`, using the
real, signed-in token an earlier lesson already lifted there, and
giving `PartsList` a real, honest way to show what was just created.
