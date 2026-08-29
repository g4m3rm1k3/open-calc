# Lesson 22: The Real Parts List Component

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. By the end of this lesson,
> real Parts listing is a complete, real, full-stack vertical slice —
> the same real shape real sign-in already reached, kept this time to a
> genuinely thin path through both halves before any deeper Parts work
> (create, update, delete, the richer sub-resources) begins.

## What you will build

The actual smallest real component that makes the previous lesson's own
two real tests pass — fetching real data on mount, and rendering
either a real, honest empty message or a real, minimal list, matching
this project's own real backend exactly.

## What you need to know first

The real, already-failing `PartsList.test.tsx`. `rebuild/backend`'s own
real `GET /api/parts` route, and its real, exact `{ data, total }`
response shape. `useState`/`useEffect`, already given full treatment
when this project's own walking skeleton first connected a real
frontend to a real backend.

## Terms introduced

- **Generic type parameter** — real TypeScript syntax: a real type,
  written inside real angle brackets (`<...>`) immediately after a
  real function's own name, telling that function's own real, generic
  implementation exactly what real, specific type to use this one time
  it's called. `useState<T>(initial)` is real, generic itself — without
  ever being told otherwise, TypeScript infers `T` from whatever real
  value `initial` actually is, which already worked correctly for every
  real `useState` call this project has written so far, each one
  started from a real, non-empty string. `useState([])` breaks that:
  a real, empty array literal gives TypeScript nothing to infer a real
  *element* type from, so it infers the narrowest real type that fits
  — `never[]`, a real array TypeScript will never again let anything be
  added to. Writing `useState<{ id: string; partNumber: string;
  description: string }[]>([])` supplies the real, missing information
  directly, so the real state this component tracks is genuinely typed
  as "an array of real objects shaped like this," from its very first
  real line, not silently inferred wrong.

## Objects and methods used

- **`Array.prototype.map`**
  - *What it is:* a real, standard JavaScript/TypeScript method on any
    real array.
  - *Implementation:* checked against MDN's own official documentation
    this session — calls a real, given function once per real element
    in the real array it's called on, and returns a real, new array
    holding each real, returned value, in the identical real order.
  - *Its use:* this lesson's own real component calls it once, turning
    a real array of real, plain part objects into a real array of real
    JSX elements, one per real part.
  - *Type:* an instance method on any real, standard JavaScript array.
  - *Responsibility:* the real, standard way to transform every real
    element of a real array into something else, without a real,
    hand-written loop.
  - *Depends on:* a real array, and a real function describing how to
    transform each real element.
  - *Connects to:* called directly inside this lesson's own real JSX;
    its own real, returned array of real elements is what React
    actually draws, one real row per real part.
  - *Shape:* a real, standard JavaScript boundary — not
    project-specific, not React-specific.

---

## Concept Unit: Fetching and Showing What's Actually There

### The Problem

The previous lesson's own real tests fail because `PartsList` doesn't
exist. The real question this unit answers: what's the actual smallest
real component that fetches real data on mount, and shows a real,
honest answer either way — empty, or genuinely populated?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason this project's own `LoginForm` component already gave.
- **Files affected** — created: `rebuild/frontend/src/PartsList.tsx`.
- **Change type** — add (new file).
- **Location** — directly inside `rebuild/frontend/src/`, sibling to
  `PartsList.test.tsx`.
- **Dependencies** — none beyond `react` itself.

### The New Code

```tsx
import { useEffect, useState } from 'react'

function PartsList() {
  const [parts, setParts] = useState<{ id: string; partNumber: string; description: string }[]>([])

  useEffect(() => {
    fetch('/api/parts')
      .then((response) => response.json())
      .then((data) => setParts(data.data))
  }, [])

  if (parts.length === 0) {
    return <p>No parts yet.</p>
  }

  return (
    <ul>
      {parts.map((part) => (
        <li key={part.id}>
          {part.partNumber} — {part.description}
        </li>
      ))}
    </ul>
  )
}

export default PartsList
```

### The Updated Project

`rebuild/frontend/src/PartsList.tsx`, in full — brand new, so this is
the whole file:

```tsx
1  import { useEffect, useState } from 'react'
2
3  function PartsList() {
4    const [parts, setParts] = useState<{ id: string; partNumber: string; description: string }[]>([])
5
6    useEffect(() => {
7      fetch('/api/parts')
8        .then((response) => response.json())
9        .then((data) => setParts(data.data))
10   }, [])
11
12   if (parts.length === 0) {
13     return <p>No parts yet.</p>
14   }
15
16   return (
17     <ul>
18       {parts.map((part) => (
19         <li key={part.id}>
20           {part.partNumber} — {part.description}
21         </li>
22       ))}
23     </ul>
24   )
25 }
26
27 export default PartsList
```

### The Isolated Example

This lesson's Header's own **Generic type parameter** term is genuinely
new to this project. Isolated, throwaway, and *not* part of this
project — this is exactly what line 4, above, is actually doing:

```ts
// throwaway.ts — not part of this project, deleted after this unit
import { useState } from 'react'

const [inferred, setInferred] = useState([])
// TypeScript infers `never[]` — no real element type to work from
// setInferred([{ id: '1' }]) would be a real, compile-time error here

const [typed, setTyped] = useState<{ id: string }[]>([])
// TypeScript is told the real element type directly
setTyped([{ id: '1' }]) // real, valid — matches the real, given type
```

Real doubt existed here — an empty array literal's own real inference
behavior is a genuinely easy thing to get subtly wrong — so this was
actually run this session, through a real `tsc --noEmit` type-check,
not predicted:

```
error TS2322: Type '{ id: string; }' is not assignable to type 'never'.
```

Exactly the real, predicted failure, on exactly the real, un-annotated
call — `setInferred([{ id: '1' }])` — real, confirmed proof TypeScript
infers `never[]` from a real, empty array literal with nothing else to
go on. The second, annotated call, `setTyped([{ id: '1' }])`, produced
no real error at all — real, confirmed proof the generic annotation
fixes exactly this.

This proves, in isolation, exactly what line 4's own real generic
annotation is for: `useState<{ id: string; partNumber: string;
description: string }[]>([])`, in the real component below, is the
identical real fix, just naming a real, three-field object shape
instead of this throwaway example's own single-field one.

### Discard the Throwaway Example

`inferred`, `typed`, and `throwaway.ts` itself never become part of
`rebuild/frontend` — they exist only to isolate real TypeScript
generic inference from this unit's own actual, real component.

### Mechanical Walkthrough

- **Line 4, `const [parts, setParts] = useState<{ id: string;
  partNumber: string; description: string }[]>([])`** — this project's
  own already-established `useState`, starting as a real, empty array;
  the real, angle-bracket type annotation immediately after `useState`
  is this lesson's Header's own **Generic type parameter**, applied for
  real — proven, in isolation, just above — here naming the real,
  minimum shape this component actually reads off each real part: a
  real `id`, `partNumber`, and `description`, not legacy's own real,
  full sixteen-field shape, since nothing else is read anywhere in
  this file.
- **Lines 6–10, `useEffect(() => { fetch('/api/parts')...}, [])`** —
  the identical real pattern this project's own `App` component
  already established: a real, empty dependency array, running this
  real effect exactly once, right after this component's first real
  render; `fetch('/api/parts')` — a real, relative path, the identical
  real convention `App`'s own real `fetch('/health')` already used,
  resolved by this project's own real dev-server proxy once one exists
  for this real path.
- **Line 8, `.then((response) => response.json())`** — the identical
  real `Response.json()` pattern already established, reading this
  project's own real backend's own real, parsed JSON body.
- **Line 9, `.then((data) => setParts(data.data))`** — reads this
  project's own real, already-proven **Collection envelope**'s own
  real `data` key specifically — the real array of real, plain part
  objects — and stores it in real state; the real, outer `total` key
  is deliberately never read here, since nothing in this real
  component needs a real count yet.
- **Lines 12–14, the real, empty-state check** — `if (parts.length ===
  0) { return <p>No parts yet.</p> }` — a real, standard JavaScript
  `.length` check on the real array; on a real, empty result, this real
  component returns early with the previous lesson's own real, exact,
  required string, before ever reaching the real list below.
- **Lines 16–24, the real, populated case** — a real `<ul>`, containing
  this lesson's Header's own `Array.prototype.map`, called on the real
  `parts` array; for each real part, a real `<li>`, given a real,
  standard React `key` prop (`part.id`, this real component's own real,
  unique identifier for each real row — required by React whenever a
  real list of real elements is rendered, so it can correctly track
  which real row is which across real re-renders), containing the
  real part's own real, visible `partNumber` and `description`,
  joined by a real, literal em dash.

### CS Lens

This is the identical real **unidirectional data flow** concept this
project's own `LoginForm` already proved — a real value travels exactly
one real way, from a real, fetched answer, through real state, into
what's actually on screen — now shown for a real *list* of values
instead of a real, single one: `Array.prototype.map` is the real,
standard mechanism that turns "one real value became visible" into
"every real value in a real collection becomes visible, the identical
real way, once each."

Also recognized in: any real, modern UI framework's own real list-
rendering primitive — the identical real idea, reached through a
genuinely different real framework's own real syntax.

### SE Lens

The real, deliberately *not*-taken alternative here: reading and
displaying every real field `Part.to_dict()` actually returns, since
they're all real and already available. Rejected on purpose, matching
this project's own real, repeated reasoning: this real component's own
current, real, tested requirement is proving a real part is genuinely
visible at all — real, additional fields (material, status, tags, real
3D model paths) have no real test proving they belong on screen yet,
and displaying them now would be real, speculative UI built ahead of
any real, stated requirement. The real, honest cost accepted here: this
component will need real, additional code the moment a real, later
lesson actually needs to show more — not a shortcut, the correct order
this project has already used more than once.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here — this project's own login-route lesson already
proved an identical, confident-sounding prediction wrong twice in that
same lesson, so this was actually run this session, not predicted:

```
Test Files  3 passed (3)
     Tests  5 passed (5)
```

Both of this unit's own real tests pass, alongside every real test this
project has built before them — real Parts listing is now a complete,
real, full-stack vertical slice: a real database table, a real,
independently-tested authorization check, a real route, and a real,
tested component, all connected, nothing assumed.

### Connecting this unit to what came before

The previous lesson proved a real, honest RED — a component that
didn't exist. This unit is the real, matching GREEN for both real
cases at once — this project's own real Parts feature now reaches all
the way from a real database row to real, visible text on screen.

---

## Connect the pieces

A real Parts list now exists, typed by hand, tested before it was
built, proving both real outcomes a real request for it can have —
reaching the real backend this same slice already built, through the
real dev-server proxy this project's own walking skeleton already
proved works. Real Parts listing is now a complete, real, full-stack
vertical slice. Full CRUD, the real tool-assembly joins, and real
3D-model uploads are each their own, separate, deeper slice, built only
now that this thin one actually connects front to back.

---

**Next lesson:** to be decided once this slice's own real work is
actually typed in and confirmed, by hand, against these lessons.
