# Lesson 26: Assembling the Real App

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. By the end of this lesson,
> a real person opening `rebuild/frontend` for the first time actually
> sees this project's own real, working sign-in form and real parts
> list — not a placeholder.

## What you will build

The actual smallest real change to `App` that makes the previous
lesson's own real test pass — replacing the walking skeleton's own
real `<h1>` with the two real, already-built, already-tested components
this project has been working toward.

## What you need to know first

The real, already-failing `App.test.tsx`. `LoginForm` and `PartsList`,
both real and already proven correct on their own.

## Terms introduced

None — this lesson assembles real pieces this project has already
given full treatment to.

## Objects and methods used

None genuinely new.

---

## Concept Unit: Two Real Components, One Real App

### The Problem

The previous lesson's own real test fails because `App` still only
shows the walking skeleton's own real `<h1>`. The real question this
unit answers: what's the actual smallest real change that replaces it
with this project's own two, real, already-correct components?

### Project Change

- **Reference Source** — no reference counterpart, the identical real
  reason the previous lesson's own Project Change already gave.
- **Files affected** — modified: `rebuild/frontend/src/App.tsx`.
- **Change type** — replace (the whole real function body).
- **Location** — `rebuild/frontend/src/`.
- **Dependencies** — none beyond `react`, `LoginForm`, and `PartsList`,
  all already real and installed.

### The New Code

```tsx
import LoginForm from './LoginForm'
import PartsList from './PartsList'

function App() {
  return (
    <div>
      <LoginForm />
      <PartsList />
    </div>
  )
}

export default App
```

### The Updated Project

`rebuild/frontend/src/App.tsx`, in full — replacing the walking
skeleton's own version entirely, so this is the whole file:

```tsx
1  import LoginForm from './LoginForm'
2  import PartsList from './PartsList'
3
4  function App() {
5    return (
6      <div>
7        <LoginForm />
8        <PartsList />
9      </div>
10   )
11 }
12
13 export default App
```

### Mechanical Walkthrough

- **Lines 1–2, the real imports** — reaching this project's own two,
  real, already-built components directly.
- **Lines 6–8, the real, assembled markup** — a real, plain `<div>`
  wrapping both real components — `App` itself contains no real state,
  no real `useEffect`, no real logic of its own at all anymore; its
  entire real job is composition.

### CS Lens

This is the identical real **composition over inheritance** concept
the previous lesson's own test already proved for real: `App` is now a
real, minimal, real assembly point, not a real container for logic
that belongs to the real components it assembles.

### SE Lens

The real, deliberately *not*-taken alternative here: real, conditional
rendering — showing `LoginForm` only when signed out, `PartsList` only
once signed in, matching a more real, typical application's own real
UX. Rejected for now: this project's own real backend already allows
viewing parts without a real token at all (the real **Operator
bypass**, already proven), so there is no real, current requirement
forcing a real choice between the two — showing both, always, is the
honest reflection of what this application's own real, current backend
actually permits. A real, later lesson — once a real, stated reason
exists, such as a real Add Part form only making sense once signed in
— is the honest place to introduce real, conditional display, not a
default reached for out of habit.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Not run this session, honestly, for the reason every prior frontend
lesson already gave. What's confidently known: once `App` renders both
real components, `screen.getByPlaceholderText('Email')` has a real,
matching element immediately, and `PartsList`'s own real, empty-state
message appears once its own real, fake `fetch` resolves — real,
correct grounds for the previous lesson's own real test to pass.

### Connecting this unit to what came before

The previous lesson proved a real, honest RED — a placeholder where
two real features belonged. This unit is the real, matching GREEN: the
actual, assembled application this whole project has been building
toward since its very first lesson.

---

## Connect the pieces

A real person opening `rebuild/frontend` now sees this project's own
real sign-in form and real parts list, together, for the first time —
not a walking skeleton's own placeholder. Every real component this
project has built stands on its own, already-proven correctness; this
unit is only ever assembly, never a re-implementation of anything
already real and working.

---

**Next lesson:** the real Add Part form — the first real feature that
actually needs `App` to know who's signed in, and the honest, minimal
real reason to finally lift that real state somewhere it can be shared.
