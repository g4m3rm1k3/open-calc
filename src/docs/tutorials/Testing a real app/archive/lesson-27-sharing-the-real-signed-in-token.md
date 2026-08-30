# Lesson 27: Sharing the Real, Signed-In Token

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`.

## What you will build

The real, minimal way for `App` to learn a real token once `LoginForm`
signs someone in — a real, optional callback prop, not a real, new
state-management library or a real Context provider, since nothing in
this project's own real, current, flat component tree needs either
yet.

## What you need to know first

`LoginForm` and `App`, both real and already built. `useState`,
already given full treatment.

## Terms introduced

- **Lifting state up** — a real, standard React pattern: when two real
  sibling components both need access to the same real, changing value,
  that real value moves out of either one and into their real, nearest
  common real parent, which then passes it back down as real props —
  here, `App`, the real, direct parent of both `LoginForm` and the real,
  future component that will need the real token `LoginForm` alone
  currently produces.

## Objects and methods used

None genuinely new — every real construct this lesson uses has already
been given full treatment.

---

## Concept Unit: A Callback, Not a Context

### The Problem

`LoginForm` already knows a real token the instant a real sign-in
succeeds — it reads it directly off the real response, right now, only
to let it fall out of scope, unused, the moment that real `.then(...)`
callback finishes. Nothing else in this project can reach it. The real
question this unit answers: what's the actual smallest real way to let
`App` — and, later, whatever real component actually needs it — find
out?

> **Before reading on:** legacy's own real `AuthContext` solves this
> with real React Context, explicitly built to avoid real prop drilling
> through a *deep* component tree. Given this project's own real tree
> is currently `App` directly parenting both `LoginForm` and whatever
> will need the real token, with no real components in between, what
> real, standard React pattern already solves this without Context at
> all?

### Project Change

- **Reference Source** — no reference counterpart; legacy's own real
  `AuthContext` solves a real, structurally different problem (a deep,
  real, multi-page component tree with real routing) this project does
  not have yet — see the SE Lens, below.
- **Files affected** — modified: `rebuild/frontend/src/LoginForm.tsx`,
  `rebuild/frontend/src/App.tsx`.
- **Change type** — modify.
- **Location** — `LoginForm.tsx`: its own real success branch.
  `App.tsx`: its own real, top-level function body.
- **Dependencies** — none beyond `react` itself.

### The New Code

```tsx
function LoginForm({ onSignedIn }: { onSignedIn?: (token: string) => void }) {
  // ...

  .then(({ ok, data }) => {
    if (ok) {
      setSignedInAs(data.user.email)
      onSignedIn?.(data.token)
    } else {
      setError(data.error)
    }
  })
```

That real change is `LoginForm`'s own half. The second, separate real
change is where `App` actually receives it:

```tsx
function App() {
  const [, setToken] = useState<string | null>(null)

  return (
    <div>
      <LoginForm onSignedIn={setToken} />
      <PartsList />
    </div>
  )
}
```

### The Updated Project

`rebuild/frontend/src/LoginForm.tsx`, in full — the previous lesson's
own version, with this unit's own new prop added:

```tsx
1  import { useState } from 'react'
2
3  function LoginForm({ onSignedIn }: { onSignedIn?: (token: string) => void }) {
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
19           onSignedIn?.(data.token)
20         } else {
21           setError(data.error)
22         }
23       })
24   }
25
26   return (
27     <div>
28       <input
29         placeholder="Email"
30         value={email}
31         onChange={(event) => setEmail(event.target.value)}
32       />
33       <input
34         placeholder="Password"
35         type="password"
36         value={password}
37         onChange={(event) => setPassword(event.target.value)}
38       />
39       <button onClick={handleSubmit}>Sign in</button>
40       {error && <p>{error}</p>}
41       {signedInAs && <p>Signed in as {signedInAs}</p>}
42     </div>
43   )
44 }
45
46 export default LoginForm
```

`rebuild/frontend/src/App.tsx`, in full — the previous lesson's own
version, with this unit's own new state added:

```tsx
1  import { useState } from 'react'
2  import LoginForm from './LoginForm'
3  import PartsList from './PartsList'
4
5  function App() {
6    const [, setToken] = useState<string | null>(null)
7
8    return (
9      <div>
10       <LoginForm onSignedIn={setToken} />
11       <PartsList />
12     </div>
13   )
14 }
15
16 export default App
```

### Mechanical Walkthrough

- **Line 3, `function LoginForm({ onSignedIn }: { onSignedIn?:
  (token: string) => void }) {`** — real, standard React destructured
  props, already given full treatment; `onSignedIn`, a real, optional
  prop (the real `?`), typed as a real function taking a real `string`
  and returning nothing — real and optional specifically so every real
  test this project has already written, none of which passes it,
  keeps working unchanged.
- **Line 19, `onSignedIn?.(data.token)`** — the real, standard
  TypeScript **optional chaining** operator, `?.`, applied to a real
  function call: calls `onSignedIn` with the real, just-received token
  only if a real, actual function was given at all; if `App` — or a
  real test — never passed one, this real line does nothing, rather
  than raising a real `TypeError` trying to call `undefined`.
- **Line 6, `const [, setToken] = useState<string | null>(null)`** —
  this project's own already-established `useState`, starting `null`
  — this lesson's Header's own **Lifting state up** term, applied for
  real: the real token now lives in `App`, the real, nearest common
  real parent of `LoginForm` and whatever real component needs it next.
  The real, leading comma inside the real array-destructuring brackets,
  with nothing named before it, is real, standard JavaScript/TypeScript
  syntax: a real way to skip a real array element entirely, binding no
  real name to it at all, rather than binding one and never reading it.
  `App` doesn't read the real token itself yet — only `setToken`,
  handed to `LoginForm`, is genuinely used here — and this project's
  own real, strict compiler setting (`noUnusedLocals`, already enabled)
  treats a real, bound-but-unread variable as a real, compile-time
  error, confirmed this session: `error TS6133: 'token' is declared but
  its value is never read.` Skipping the real name entirely is the
  honest fix, not a real, silencing comment papering over it.
- **Line 10, `<LoginForm onSignedIn={setToken} />`** — passing `App`'s
  own real, already-existing `setToken` function directly as the real
  `onSignedIn` prop — real, standard React: `setToken` already has the
  identical real shape `onSignedIn` expects, a real function taking one
  real string, so no real wrapper function is needed.

### CS Lens

This is a real instance of **inversion of control** — `LoginForm`
doesn't decide what happens with a real, successful token; it simply
reports it, real and upward, to whatever real parent cares, via a real
callback it was handed. The real, same component stays real, useful
and unchanged whether its real parent does nothing with the real token
at all, or, as here, actually needs it.

Also recognized in: any real UI event handler prop (`onClick`,
`onChange`, already used throughout this project) — the real, identical
idea, just applied to a real, application-specific event instead of a
real, standard DOM one.

### SE Lens

The real, deliberately *not*-taken alternative here: porting legacy's
own real `AuthContext` now. Rejected on purpose: Context exists to
solve real prop drilling through a real, *deep* component tree —
legacy's own real comments say so explicitly. This project's own real
tree is `App` directly parenting both real components that care about
the real token; a real callback prop reaches exactly as far as this
real problem currently requires, with real, less machinery than a real
Context provider, a real custom hook, and a real localStorage-sync
effect would add. The real, honest cost accepted here: if this
project's own real component tree ever genuinely grows deep enough that
passing the real token down through several real, uninterested,
intermediate components becomes a real, felt problem, *that* real
moment — not this one — is the honest place to introduce real Context,
with a real, concrete case proving it's actually needed.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Real doubt existed here — a real, unread piece of state is exactly the
kind of thing easy to miss until a real compiler actually checks it —
so this was actually run this session, through a real `tsc --noEmit`:

```
error TS6133: 'token' is declared but its value is never read.
```

That real error is what a real, naive `const [token, setToken] = ...`
actually produces, confirmed rather than assumed — the real reason
this unit's own final code skips naming the first real element at all.
With that real fix in place, the identical real check produces no real
output at all — a real, clean compile. Every real test this project
has already written for `LoginForm` and `App` passes no real
`onSignedIn` prop at all, and this unit's own real `?.` guard makes
calling it with none a real, documented no-op.

### Connecting this unit to what came before

The previous unit finally assembled `LoginForm` and `PartsList` into
one real application. This unit is the first real, deliberate wire
between them — not yet used by anything, on purpose, until a real,
later lesson gives it an actual, real job.

---

## Connect the pieces

`App` now genuinely knows the real, signed-in token the moment
`LoginForm` produces one — not stored anywhere real yet, not shown
anywhere real yet, real and ready for the next real component that
actually needs it.

---

**Next lesson:** the real Add Part form — the first real, actual use
for the token this unit just gave `App` a real way to receive.
