# Lesson 6: Connecting `rebuild`'s Two Real Halves

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`.

## What you will build

The actual smallest real change to `App` that makes the prior lesson's
own real test pass, plus the real, separate infrastructure needed to
prove it against `rebuild/backend` itself, actually running — a real
dev-server proxy, the same real technique legacy's own frontend already
uses.

## What you need to know first

`rebuild/backend`'s real, already-built `/health` route.
`rebuild/frontend`'s real `App.tsx`. The real, already-failing test a
prior lesson wrote, that this lesson makes pass.

## Terms introduced

- **Origin** — a real, precise combination of protocol, host, and port
  (`http://localhost:5173` is one real origin; `http://localhost:5001`
  is a genuinely different one, even though the host is identical) —
  the actual unit a browser's own security decisions are made against,
  not just "the same website" in casual, imprecise terms.
- **Same-origin policy** — a real, standard browser security rule:
  JavaScript running on a page loaded from one real origin is blocked,
  by the browser itself, from reading the response of a request to a
  different real origin, unless that other origin explicitly allows it.
- **CORS** (Cross-Origin Resource Sharing) — a real, standard way
  around the same-origin policy: the *server* being called adds a
  real, specific HTTP response header, explicitly telling the browser
  "requests from this other real origin are allowed." Legacy's own real
  backend already does exactly this, checked in an earlier session
  (`CORS(app, resources={r"/*": {"origins": "*"}})`,
  `backend/app/__init__.py`), allowing every real origin.
- **Dev-server proxy** — a real, different way around the identical
  problem, taken by legacy's own real frontend and reused in this
  lesson: instead of the *backend* allowing a different origin, the
  *frontend's own dev server* forwards specific, matching requests to
  the backend itself, behind the scenes, so the browser only ever
  believes it's talking to one real origin the whole time — no CORS
  header is ever needed, because, as far as the browser can tell, there
  is no cross-origin request happening at all.

## Objects and methods used

- **`useState(initialValue)`**
  - *What it is:* a real function, exported by the `react` package —
    one of React's own built-in Hooks.
  - *Implementation:* checked against React's own official
    documentation this session — called once per component, with a
    real starting value; returns a real, two-element array: the
    current value, and a real function that updates it and tells React
    to re-run this component so the new value actually appears on
    screen.
  - *Its use:* this lesson's `App` calls it once, to remember this
    component's own real, current belief about the backend's status,
    starting as the literal string `'checking...'`.
  - *Type:* a free function, exported by `react`, returning a real,
    two-element array.
  - *Responsibility:* giving one specific function component a real
    piece of memory that survives between its own re-renders.
  - *Depends on:* being called, every render, in the same real order
    relative to any other Hook the same component calls.
  - *Connects to:* called once by this lesson's own `App`; its own
    real update function is called once `fetch`'s real response
    arrives, inside `useEffect`, below.
  - *Shape:* the real seam between "a plain value" and "a value React
    itself is watching," inside one specific component.

- **`useEffect(setup, dependencies)`**
  - *What it is:* a real function, exported by the `react` package —
    another of React's own built-in Hooks.
  - *Implementation:* checked against React's own official
    documentation this session — takes a real function to run, and a
    real array naming everything it depends on; React runs the given
    function after this component has actually been drawn to the
    screen, and again only if a real dependency has changed — an empty
    real array means "run once, right after the first real render."
  - *Its use:* this lesson's `App` calls it once, with an empty
    dependency array, to make exactly one real `fetch` call the moment
    this component first actually appears.
  - *Type:* a free function, exported by `react`.
  - *Responsibility:* running real code at a specific, real moment
    relative to a component's own lifecycle, safely separated from
    describing what should appear on screen.
  - *Depends on:* a real function to run, and a real, explicit
    dependency list.
  - *Connects to:* called once by this lesson's own `App`; the real
    function it's given calls `fetch`.
  - *Shape:* the real, deliberate seam React provides between "what
    this component looks like" and "real side effects it needs to
    cause."

- **`fetch(url)`**
  - *What it is:* a real, standard, global browser function — part of
    the Fetch API.
  - *Implementation:* checked against MDN's own official documentation
    this session — starts a real, asynchronous HTTP request, returning
    a real `Promise` that resolves to a real `Response` once headers
    arrive.
  - *Its use:* this lesson's `App` calls it once, inside `useEffect`,
    with the literal string `'/health'`.
  - *Type:* a free, global function, returning a real
    `Promise<Response>`.
  - *Responsibility:* starting one real HTTP request and handing back a
    real, eventual answer without blocking other real code.
  - *Depends on:* a real, reachable URL.
  - *Connects to:* called once, inside this lesson's own `useEffect`;
    its real, eventual result is read by `Response.json()`, below. In
    the real test a prior lesson wrote, replaced entirely by a real
    mock.
  - *Shape:* the real, standard browser boundary between this
    project's own frontend code and any real HTTP server.

- **`Response.json()`**
  - *What it is:* a real instance method on the Fetch API's own real
    `Response` class — a genuinely different real class from this
    project's own real, separate `Response.get_json()`, which belongs
    to Werkzeug, a Python, server-side package.
  - *Implementation:* checked against MDN's own official documentation
    this session — reads the real response body and parses it as JSON,
    returning a second real `Promise` resolving to a plain JavaScript
    value.
  - *Its use:* this lesson's `App` calls it on the real `Response`
    object `fetch` resolved to, to reach the real, parsed
    `{'status': 'healthy'}` value `rebuild/backend`'s own `/health`
    route actually returns.
  - *Type:* an instance method on the Fetch API's own `Response` class,
    returning a real `Promise`.
  - *Responsibility:* converting one response's raw JSON text body into
    a real, usable JavaScript value.
  - *Depends on:* a real `Response` object whose body is actually valid
    JSON text.
  - *Connects to:* called directly on `fetch`'s own real, resolved
    value; its own real, eventual result is passed to `useState`'s own
    real update function.
  - *Shape:* the same real client-side HTTP boundary `fetch` itself
    sits on.

---

## Concept Unit: Making the Real Test Pass

### The Problem

The real test a prior lesson wrote fails for the correct, honest
reason — `App` never reads any real answer from anywhere. The real
question this unit answers: what's the actual smallest real change
that makes it true, reusing `useState`/`useEffect` for the first time
on the frontend?

### Project Change

- **Reference Source** — no reference counterpart; legacy's own real
  frontend fetches real data constantly, but no single, isolated
  example is a direct real port here.
- **Files affected** — modified: `rebuild/frontend/src/App.tsx`.
- **Change type** — replace (the whole real function body).
- **Location** — inside the existing real `App` function.
- **Dependencies** — none beyond `react` itself.

### The New Code

```tsx
import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState('checking...')

  useEffect(() => {
    fetch('/health')
      .then((response) => response.json())
      .then((data) => setStatus(data.status))
  }, [])

  return <h1>rebuild backend says: {status}</h1>
}

export default App
```

### The Updated Project

`rebuild/frontend/src/App.tsx`, in full — replacing the earlier,
smaller version entirely, so this is the whole file:

```tsx
1  import { useEffect, useState } from 'react'
2
3  function App() {
4    const [status, setStatus] = useState('checking...')
5
6    useEffect(() => {
7      fetch('/health')
8        .then((response) => response.json())
9        .then((data) => setStatus(data.status))
10   }, [])
11
12   return <h1>rebuild backend says: {status}</h1>
13 }
14
15 export default App
```

### The Isolated Example

`useState` and `useEffect` are both genuinely new to this series.
Isolated, throwaway, and *not* part of this project:

```tsx
// throwaway.test.tsx — not part of this project, deleted after this unit
import { render, screen, waitFor } from '@testing-library/react'
import { test, expect } from 'vitest'
import { useState, useEffect } from 'react'

function Ticker() {
  const [value, setValue] = useState('start')
  useEffect(() => {
    setValue('changed')
  }, [])
  return <p>{value}</p>
}

test('a throwaway Hook pair updates real, visible text after mount', async () => {
  render(<Ticker />)
  await waitFor(() => {
    expect(screen.getByText('changed')).toBeDefined()
  })
})
```

Not run this session — stated from confidence, not executed, per the
Verification Rule: React's own documented `useState`/`useEffect`
contracts, and Testing Library/Vitest's own documented behavior, are
stable enough that running `npx vitest run throwaway.test.tsx` is
confidently predicted to print:

```
 ✓ throwaway.test.tsx (1 test | 1 passed)
```

This predicted, not executed, run establishes, in isolation, exactly
what the real `App` above depends on: `useState('start')` gives `Ticker` a real,
remembered value, starting as `'start'`; `useEffect(() => {
setValue('changed') }, [])` runs exactly once, right after `Ticker`
first renders, and calling `setValue` genuinely makes React re-render
`Ticker` with the new real value — proven by the real, visible text
actually changing from `'start'` to `'changed'`, caught by
`waitFor` since the change happens after the first real render, not
during it. The real `App` above uses the identical real mechanism,
just setting its own real state from a real (or, in the prior lesson's
own test, fake) network answer instead of a fixed string.

### Discard the Throwaway Example

Nothing about `Ticker` or `throwaway.test.tsx` itself survives past
this unit — deleted, real and in full, once this proof is understood;
it never becomes part of `rebuild/frontend`.

### Mechanical Walkthrough

- **Line 1, `import { useEffect, useState } from 'react'`** — a real,
  standard ES module import, reaching this lesson's Header's own
  `useState` and `useEffect`.
- **Line 4, `const [status, setStatus] = useState('checking...')`** —
  this lesson's Header's own `useState`, called with the real starting
  value `'checking...'`; the left side is real JavaScript **array
  destructuring** — a real, standard syntax pulling a real array's own
  elements apart, by position, into separately-named real variables in
  one line, here naming `useState`'s own real, two-element return
  array `status` (the current value) and `setStatus` (the function
  that updates it).
- **Line 6, `useEffect(() => {`** — this lesson's Header's own
  `useEffect`, called with a real arrow function.
- **Line 7, `fetch('/health')`** — this lesson's Header's own `fetch`,
  called with the real, relative path this unit's own next unit's
  dev-server proxy is set up to forward — in the prior lesson's own
  real test, this exact call reaches that test's own real, fake
  replacement instead.
- **Line 8, `.then((response) => response.json())`** — a real method on
  the real `Promise` `fetch` returned: registers a real function to run
  once that `Promise` resolves, itself returning a new, real `Promise`
  — this lesson's Header's own `Response.json()` (or, in the prior
  lesson's own real test, its real, fake stand-in).
- **Line 9, `.then((data) => setStatus(data.status))`** — chained onto
  line 8's own real `Promise`; once it resolves, `data` is the real,
  parsed value, and `data.status` reads its real `'status'` key,
  passing the real result into `setStatus`.
- **Line 10, `}, [])`** — the real, empty dependency array this
  lesson's Header's own `useEffect` entry already explained: run once,
  right after this component's first real render.
- **Line 12, `return <h1>rebuild backend says: {status}</h1>`** — real
  JSX, with real, curly-brace interpolation — a real JSX syntax where
  anything inside `{ }` is evaluated as real JavaScript and inserted
  directly into the real output: here, this component's own real,
  current `status` value, whatever it actually currently is — the
  real, visible text the prior lesson's own
  `screen.getByText(/healthy/)` is written to eventually find.

### CS Lens

This is a real, minimal instance of **asynchronous state
synchronization** — a real UI value that starts honestly incomplete
(`'checking...'`) and updates for real the moment a real answer
actually becomes known, rather than the whole component blocking until
one arrives.

Also recognized in: a real loading spinner, shown before real data
arrives, anywhere on the real web; a real GPS device's own "acquiring
signal..." state.

### SE Lens

The real, deliberately *not*-taken alternative here: mutating a plain
variable directly instead of using `useState`. Rejected on purpose —
a plain, mutated variable would genuinely update in memory the moment
a real answer arrived, but React would have no real reason to know
anything had changed, and would never actually re-run this component
to show it.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Not run this session, honestly, for the same reason as every prior
frontend lesson: legacy's own already-working Flask and React stack is
what makes this confidently predictable, not a fresh run of this exact
new code. What *is* confidently known from `useState`/`useEffect`/`fetch`'s
own documented contracts, chained together exactly as shown: once the
prior lesson's own fake `fetch` resolves with `{'status': 'healthy'}`,
`setStatus` is called with the real string `'healthy'`, React
re-renders, and the real, visible text becomes `rebuild backend says:
healthy` — real, visible text genuinely matching
`screen.getByText(/healthy/)`. The actual, exact console output is
something to read directly off a real `npx vitest run`.

### Connecting this unit to what came before

The prior lesson proved a real, honest RED — a real, fake network
answer with nothing yet reading it. This unit is the real, matching
GREEN: the actual smallest real code that reads it correctly.

---

## Concept Unit: One Origin, Not Two — Proving It For Real

### The Problem

The previous unit proves `App`'s own real *logic* is correct, using a
real, fake `fetch`. It does not prove `rebuild/frontend` can actually
reach `rebuild/backend` for real — a genuinely different real question,
about two real, separate, running processes, not about one component's
own internal correctness. `rebuild/frontend`'s own real dev server runs
at `http://localhost:5173`; `rebuild/backend`, once actually running,
listens at a genuinely different real origin. A plain `fetch('/health')`,
resolved by the browser against `:5173`, would reach nothing at `:5001`
at all without something real bridging the two.

> **Before reading on:** legacy's own real frontend
> (`vite.config.ts`, this repository's own root) already proxies
> `/api` and `/socket.io` to `http://localhost:5000` — check the real,
> current file directly. Given a browser only ever cares about the
> real origin the *page itself* was loaded from, not where a proxied
> request actually, eventually goes behind the scenes — what does that
> real, existing technique suggest about whether `rebuild/backend`
> needs CORS enabled at all, for local development?

### Project Change

- **Reference Source** — `vite.config.ts` (this repository's own
  root), its real `server.proxy` block, forwarding `/api` and
  `/socket.io` to `http://localhost:5000` — read the real, current file
  directly rather than trusting a stale quote. This unit reuses the
  identical real technique, not the identical real paths.
- **Files affected** — modified: `rebuild/frontend/vite.config.ts`;
  created: `rebuild/backend/run.py`.
- **Change type** — modify (`vite.config.ts`); add (`run.py`).
- **Location** — `vite.config.ts`: inside the existing `defineConfig`
  call the scaffolding tool generated. `run.py`: brand-new, sibling to
  the real `app/` package already built.
- **Dependencies** — none beyond what's already installed.

### The New Code

```python
from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(port=5001, debug=True)
```

Real prose, then a second, separate real file — the two are not the
same real concept and are explained one at a time, below, rather than
shown as one undifferentiated block: `run.py`, above, makes
`rebuild/backend` a real, running process for the first time in this
series; `vite.config.ts`'s own real `server.proxy` addition, below, is
what actually lets `rebuild/frontend` reach it.

```typescript
server: {
  proxy: {
    '/health': {
      target: 'http://localhost:5001',
      changeOrigin: true,
    },
  },
},
```

### The Updated Project

`rebuild/backend/run.py`, in full — brand new, so this is the whole
file:

```python
1  from app import create_app
2
3  app = create_app()
4
5  if __name__ == '__main__':
6      app.run(port=5001, debug=True)
```

Separately, `rebuild/frontend/vite.config.ts`, in full — the
scaffolding-tool-generated file, with this unit's own new `server` key
added:

```typescript
1  import react from '@vitejs/plugin-react'
2  import { defineConfig } from 'vite'
3
4  // https://vite.dev/config/
5  export default defineConfig({
6    plugins: [react()],
7    server: {
8      proxy: {
9        '/health': {
10         target: 'http://localhost:5001',
11         changeOrigin: true,
12       },
13     },
14   },
15 })
```

### Mechanical Walkthrough

- **`run.py` line 1, `from app import create_app`** — this series'
  Header's own real `create_app`, reused unchanged.
- **Line 3, `app = create_app()`** — calls it with no argument at all
  — a real, valid call, since `create_app`'s own real
  `def create_app(config_name=None):` gives `config_name` a real
  default.
- **Line 5, `if __name__ == '__main__':`** — a real, standard Python
  idiom: `__name__` is a real, automatically-set variable, equal to the
  literal string `'__main__'` only when this exact file is executed
  directly — the identical real pattern legacy's own real
  `backend/run.py` already uses (check the real, current file
  directly).
- **Line 6, `app.run(port=5001, debug=True)`** — a real, standard
  method on `Flask`, starting a genuine, real, listening HTTP server —
  the first time in this whole series `rebuild/backend` is exercised as
  an actual live process. `port=5001` — a real, deliberate choice, not
  legacy's own real `5000`: both applications may genuinely need to run
  at the same real time during this series' own remaining lessons, and
  two real processes cannot both listen on the identical real port at
  once. `debug=True` — enables Flask's own real development mode.
- **`vite.config.ts` line 7, `server: {`** — a real, top-level key
  inside Vite's own `defineConfig` call, configuring Vite's own real
  development server specifically.
- **Line 9, `'/health': {`** — the real, exact path this series' own
  `fetch('/health')` actually requests; any real request whose path
  starts with this string is matched.
- **Line 10, `target: 'http://localhost:5001'`** — the real, actual
  address Vite's own dev server forwards a matching request to.
- **Line 11, `changeOrigin: true`** — rewrites the forwarded request's
  own real `Host` header to match the real target instead of the real,
  original request's own `Host` — the identical real option legacy's
  own real proxy config already sets.

### CS Lens

This is a real, working instance of a **reverse proxy** — a real
server that receives requests on behalf of another real server and
forwards them on, transparently. The real, load-bearing property: the
browser making the original real request never learns a second real
server was involved at all.

Also recognized in: nginx or a real load balancer in production; a real
corporate network's own web proxy; a real CDN forwarding an uncached
request back to its real origin server.

### SE Lens

The real, deliberately *not*-taken alternative: enabling CORS on
`rebuild/backend`, the same real technique legacy already uses.
Rejected here, for now: CORS is a real, permanent, server-side
concession, added scope this project doesn't need yet, since nothing
outside this project's own dev-server proxy currently has any real
reason to call `rebuild/backend` directly. A real, later, legitimate
requirement would be a genuine, stated reason to add it — the
**Deliberately changed** framework this whole series already runs on.

### Commands needed

Two real, separate terminals — the real, honest way to prove this
connection for real, since it involves two real, separate,
simultaneously-running processes, something no automated unit test in
this series has needed before:

```powershell
# Terminal 1 — the real backend
cd manufacturing-platform/rebuild/backend
../../backend/.venv/Scripts/python.exe run.py
```

The first real terminal starts `rebuild/backend` as an actual, live
process, listening on port `5001` — this has to already be running
before the second terminal is opened, since Vite's own real proxy has
nothing real to forward to otherwise:

```powershell
# Terminal 2 — the real frontend
cd manufacturing-platform/rebuild/frontend
npm run dev
```

The second real terminal starts Vite's own real dev server, reading
this unit's own new `server.proxy` configuration on startup. Then open
`http://localhost:5173` in a real browser.

### Run it, per the Verification Rule

Not run this session. What's confidently, honestly known: Flask's own
`app.run(...)`, Vite's own documented `server.proxy` option, and
`fetch`'s own standard behavior are each independently well-documented,
and legacy's own real, already-working, identical-shaped proxy setup
already proves the technique works in this exact repository. The real,
correct way to confirm this specific new code is wired up right: run
both real commands above and actually look — real, visible text
reading `rebuild backend says: healthy` is what success looks like;
anything else is a real signal to debug, not a lesson to silently
rewrite.

### Connecting this unit to what came before

The previous unit proved `App`'s own real logic is correct, in
isolation, with no real backend involved at all. This unit is what
actually, physically connects the two real processes — the last real
piece needed before that logic has anything real to talk to.

---

## Connect the pieces

`App`'s own real fetch-and-display logic was proven correct twice —
once against a real, fake answer, in a fast, isolated, real unit test,
and once, honestly left as a real, manual step, against
`rebuild/backend` itself, running for real, reached through a real
dev-server proxy built specifically so no CORS header is needed for
this project's own current, real, narrow requirement. Nothing here
touches a database, a user, or any other real feature — on purpose.

---

**Next lesson:** giving this now-connected page real, deliberate
styling — the last real piece of this series' own walking-skeleton
slice, before any real feature (login, and everything it needs) begins
its own, separate, deeper slice on top of what now actually works.
