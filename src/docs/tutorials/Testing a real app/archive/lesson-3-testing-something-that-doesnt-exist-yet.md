# Lesson 3: Testing Something That Doesn't Exist Yet

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. Before this lesson,
> `rebuild/frontend` does not exist at all — not the directory, not a
> package, nothing.

## What you will build

This series' own first real frontend test — written before the real
component it checks even exists, the identical real discipline every
backend lesson in this series has already used, reached here for the
first time through a genuinely different real language and tool. This
lesson does not make the test pass — that's a separate, later lesson's
own real job — and does not connect to a real backend or apply any real
styling; both are separate, later lessons too.

## What you need to know first

The real **Assertion** and **Automated test** concepts, already given
full treatment against this project's own real Python backend code:
one real, machine-checked claim, saved as a real, independently
runnable function. Reused unchanged here — only the real language and
the real tool checking it are different. A real test, this project's
own already-established habit, proven honest before anything exists to
make it pass, at least once already, against a real, empty backend.

## Terms introduced

- **Scaffolding** — generating a new project's starting files and
  folder structure from a real, existing tool, rather than typing every
  file by hand from nothing. `npm create vite@latest`, below, is a real
  scaffolding tool; it exists because the *structural* wiring a modern
  frontend project needs — build configuration, TypeScript project
  settings, an HTML entry point — is almost entirely the same across
  any project using the same tools, so a tool generates it once instead
  of every project reinventing it by hand.
- **JSX** — a real, non-standard syntax extension to JavaScript (and,
  here, TypeScript) that allows writing something that looks like HTML
  markup directly inside real code, rather than building UI structure
  through a series of function calls. It is not a string, and it is
  not real HTML; a real build step transforms it into real JavaScript
  function calls before it ever reaches a browser.
- **Arrow function** — a real, compact JavaScript/TypeScript function
  syntax: `() => { ... }` defines a real, anonymous function, taking no
  real parameters in that example, functionally similar to
  `function() { ... }` but written more compactly, and, unlike a real,
  named `function` declaration, it does not create its own real `this`
  binding — not relevant to this lesson's own real use of it, but the
  real, defining property of the syntax, worth knowing since it recurs
  constantly in real JavaScript/TypeScript code.
- **Test renderer** — a real tool that draws a real React component
  into an in-memory, real (but headless — no actual browser window)
  DOM, specifically so a real test can make real assertions about what
  actually appeared, the same real role this project's own real
  `Flask.test_client()` already plays for its backend tests: real
  behavior, checked without a real, visible window or a real running
  dev server.
- **Query (in a frontend test)** — a real method, provided by a test
  renderer, that searches the real, in-memory DOM a component actually
  produced for something matching a real description (here, real
  visible text) — deliberately not the same as querying by an
  internal implementation detail (a CSS class, a component's own
  variable name), for the identical real reason this project's own
  real **Acceptance test** already established: a check tied to a real
  external, user-visible fact survives a real internal rewrite; a
  check tied to internal structure does not.
- **Test environment (Vitest config)** — a real Vitest configuration
  setting, `environment`, controlling which real global objects
  (`document`, `window`, and the rest of a real, in-memory DOM) exist
  while a test file runs. Vitest's own real, documented default is
  `'node'` — a real, plain Node.js runtime with no DOM-shaped globals
  at all, deliberately lightweight for tests that never touch a DOM.
  Any real test that calls something needing a real `document` — this
  lesson's own `render(...)`, among others — has to set this to
  `'jsdom'` explicitly first, or every such call fails immediately with
  a real `ReferenceError`, before the test's own actual claim is ever
  checked.

## Objects and methods used

- **`render(component)`**
  - *What it is:* a real function, exported by
    `@testing-library/react` — this lesson's own **test renderer**,
    per the Header's own Terms.
  - *Implementation:* checked against Testing Library's own official
    documentation this session — takes real JSX, draws it into a real,
    headless, in-memory DOM (never a real, visible browser window), and
    returns a real object exposing real query methods, `screen`, below,
    among them.
  - *Its use:* this lesson's own real test calls it once, with the real
    component under test, to actually produce something real to make
    assertions about.
  - *Type:* a free function, exported by `@testing-library/react`.
  - *Responsibility:* actually running a real component's own real
    render logic, the identical real code path a real browser would
    run, without needing a real browser to do it.
  - *Depends on:* real JSX describing what to render.
  - *Connects to:* called directly by this lesson's own test; its own
    real, headless DOM is what `screen`'s own real queries, below,
    search.
  - *Shape:* this series' own real frontend equivalent of
    `Flask.test_client()` — a real way to exercise real, user-facing
    behavior with no real, separately-running process involved.

- **`screen.getByText(text)`**
  - *What it is:* a real method on `screen`, a real, importable object
    from `@testing-library/react`.
  - *Implementation:* checked against Testing Library's own official
    documentation this session — searches the real, current, in-memory
    DOM for one real element whose real, visible text content matches
    the given value; throws a real, descriptive error immediately if
    none is found, or if more than one is.
  - *Its use:* this lesson's own real test calls it with the literal
    string `'rebuild'`, to find the real element a later, real lesson
    is expected to actually produce.
  - *Type:* an instance method on the real, shared `screen` object.
  - *Responsibility:* finding one real, specific, currently-rendered
    element by what a real user would actually see, not by any real,
    internal implementation detail.
  - *Depends on:* something having already been drawn into the real,
    in-memory DOM via a real, prior `render(...)` call.
  - *Connects to:* called directly by this lesson's own test,
    immediately after `render(...)`.
  - *Shape:* this lesson's own **Query** term, above, applied for
    real — the actual real mechanism behind it.

- **`test(name, fn)`**
  - *What it is:* a real function, exported by Vitest, the real test
    runner this lesson installs.
  - *Implementation:* checked against Vitest's own official
    documentation this session — registers a real, independently
    runnable test, named by the given real string, running the given
    real function when Vitest actually executes it.
  - *Its use:* this lesson's own real test file calls it once, wrapping
    this lesson's actual real claim.
  - *Type:* a free function, exported by `vitest`.
  - *Responsibility:* the real, explicit registration mechanism Vitest
    uses to know a given real function is a test — this project's own
    real Python tests use a naming convention instead (`test_`-prefixed
    functions, discovered by `pytest`); Vitest's own real, different
    convention is an explicit function call.
  - *Depends on:* a real, descriptive name and a real function
    containing the actual check.
  - *Connects to:* called once per test, at a real file's own top
    level; Vitest itself finds and runs every real `test(...)` call in
    a file matching its own real, default naming pattern
    (`*.test.tsx`).
  - *Shape:* Vitest's own real test-registration boundary — the same
    real role a `test_`-prefixed function name plays in this project's
    own real Python tests, reached through a genuinely different real
    mechanism.

- **`expect(value)`**
  - *What it is:* a real function, exported by Vitest.
  - *Implementation:* checked against Vitest's own official
    documentation this session — takes a real value and returns a real
    object with real, chainable assertion methods (`.toBeDefined()`,
    below, among many others), each one making a real, specific claim
    about the given value and raising a real, descriptive error if it's
    false.
  - *Its use:* this lesson's own real test calls it once, wrapping the
    real, found result of `screen.getByText(...)`.
  - *Type:* a free function, exported by `vitest`, returning a real,
    chainable assertion object.
  - *Responsibility:* the real, explicit mechanism Vitest uses to make
    and check one real claim — this project's own real Python tests use
    a bare `assert` keyword instead; Vitest's own real, different
    mechanism is a real function call and a real chained method.
  - *Depends on:* a real value to make a claim about.
  - *Connects to:* called directly inside this lesson's own real
    `test(...)` callback; its own real, returned object's
    `.toBeDefined()` method, below, is what actually makes the claim.
  - *Shape:* Vitest's own real assertion boundary — the same real role
    this project's own real, bare Python `assert` plays, reached
    through a genuinely different real language's own real mechanism.

- **`defineConfig(config)`**
  - *What it is:* a real function, exported by `vite`, wrapping a real
    configuration object so Vite's own tooling can type-check and
    autocomplete it — already present in `rebuild/frontend/vite.config.ts`
    the moment this lesson's own scaffolding command generates it, not
    written by this lesson.
  - *Implementation:* checked against Vite's own official documentation
    this session — takes one real object literal (real keys like
    `plugins`, and, after this lesson's own first unit, `test`) and
    returns that same real object, unchanged at runtime; its only real
    job is compile-time type information for whoever edits the file.
  - *Its use:* this lesson's own first unit adds a new real key,
    `test`, to the real object already passed into this call, rather
    than calling it again or replacing it.
  - *Type:* a free function, exported by `vite`, returning the same
    real object type it was given.
  - *Responsibility:* giving one real configuration object real,
    checked shape — both Vite's own real build settings and, once
    added, Vitest's own real test settings — in one real, shared file.
  - *Depends on:* a real object literal, passed as its one real
    argument.
  - *Connects to:* called once, at real module load time, by
    `rebuild/frontend/vite.config.ts` itself; its real, returned object
    is what both Vite's own dev server and Vitest itself read their
    real settings from.
  - *Shape:* the real root of this project's own frontend build-and-test
    configuration — every real setting either tool needs lives inside
    the one real object this call wraps.

- **`.toBeDefined()`**
  - *What it is:* a real, chainable method on the object `expect(...)`
    returns.
  - *Implementation:* checked against Vitest's own official
    documentation this session — passes if the real value `expect(...)`
    was called with is anything other than `undefined`; raises a real,
    descriptive error otherwise.
  - *Its use:* this lesson's own real test calls it once, checking that
    `screen.getByText('rebuild')` actually found something, rather than
    raising its own real error first.
  - *Type:* an instance method on the real object `expect(...)`
    returns.
  - *Responsibility:* stating one specific, real claim — "this value
    exists" — as plainly as Vitest's own real API allows.
  - *Depends on:* a real, prior call to `expect(...)`.
  - *Connects to:* the last real call in this lesson's own real test;
    nothing chains after it.
  - *Shape:* one real, concrete instance of Vitest's own broader
    real assertion-method vocabulary — not the only one, the smallest
    one this lesson's own real claim actually needs.

---

## Concept Unit: Telling Vitest There's a Real DOM to Render Into

### The Problem

This lesson's next unit is about to write a real test that calls
`render(<App />)` — a real function that draws a real component into a
real, in-memory DOM. But nothing yet has told Vitest that a real DOM
should exist while a test runs. Vitest was written to run any real
JavaScript/TypeScript test, not only ones that render UI — plenty of
real tests check plain functions, plain data, or plain logic with no
DOM involved at all, so Vitest doesn't assume one exists unless told
to. The real question this unit answers: how does a real Vitest test
get a real, in-memory DOM to render into at all, before any test that
needs one can even attempt its real claim?

> **Before reading on:** if Vitest's own real, default environment is a
> plain Node.js runtime with no DOM, what real, honest error would you
> expect a function that needs `document` to raise, if nothing was ever
> told to provide one?

### Project Change

- **Reference Source** — no reference counterpart. `rebuild/frontend`
  and its `vite.config.ts` don't exist until this unit's own scaffolding
  command creates them; this is this project's first real test-tooling
  configuration, not a port of anything legacy has (legacy's own
  frontend has no real, isolated tests of this kind to configure at
  all).
- **Files affected** — created: `rebuild/frontend/` (the entire real,
  scaffolded project, via the scaffolding command below); modified:
  `rebuild/frontend/vite.config.ts` (the scaffold creates it with only a
  `plugins: [react()]` entry; this unit adds to it, not replaces it).
- **Change type** — add (the scaffolded project), configure
  (`vite.config.ts`).
- **Location** — inside the object passed to `defineConfig({...})`,
  alongside the existing `plugins` entry.
- **Dependencies** — Node.js and `npm` (checked in an earlier session:
  Node `v24.12.0`, npm `11.6.2`); `vitest`, `@testing-library/react`,
  `@testing-library/jest-dom`, and `jsdom`, four real, new npm packages
  this unit installs — `jsdom` specifically is what the `'jsdom'` value
  below actually resolves to.

### The New Code

```ts
test: {
  environment: 'jsdom',
},
```

### The Updated Project

`rebuild/frontend/vite.config.ts`, in full:

```ts
1  import react from '@vitejs/plugin-react'
2  import { defineConfig } from 'vite'
3
4  // https://vite.dev/config/
5  export default defineConfig({
6    plugins: [react()],
7    test: {
8      environment: 'jsdom',
9    },
10 })
```

### Mechanical Walkthrough

- **Lines 7–9, `test: { environment: 'jsdom' }`** — this lesson's
  Header's own **Test environment** term, given a real value here for
  the first time: a real, nested object literal, `{ environment:
  'jsdom' }`, assigned to a real key, `test`, on the same real
  configuration object `defineConfig(...)` already builds for Vite
  itself — Vite and Vitest share this one real config file on purpose,
  since Vitest is built by Vite's own team specifically to reuse Vite's
  own configuration instead of needing a second, separate one.
  `'jsdom'` — a real, plain string, naming the real, published `jsdom`
  package this unit's own command installs — tells Vitest, explicitly,
  to build a real, in-memory DOM from that package before running any
  test in this project, rather than its own real, default, DOM-less
  Node.js environment.

### CS Lens

A real instance of explicit configuration over implicit assumption:
Vitest could have guessed, from a test file importing
`@testing-library/react`, that a DOM is probably wanted — real tools
that guess like this exist — but Vitest's own real, documented design
instead asks for this to be stated, once, plainly, rather than
inferred.

Also recognized in: any real tool exposing a `strict` mode instead of
guessing intent; a compiler's real, explicit target flag instead of
inferring a runtime; a database driver's explicit connection-pool size
instead of an implicit, guessed default.

### SE Lens

The real, deliberately *not*-taken alternative: a per-file
`// @vitest-environment jsdom` comment directly above a test file, which
Vitest's own real docs also support. Rejected here because this
project's very next lessons already plan a real component, then a real,
connected frontend — every future test file this project will ever have
is going to need the identical real DOM, so setting it once, project-
wide, in `vite.config.ts`, is the real, correct choice over repeating a
per-file comment in every one of them. The real, honest cost: a test
that genuinely never needs a DOM still pays Vitest's own real overhead
of building one, project-wide — a real, accepted tradeoff, not a free
choice.

### Commands needed

```powershell
cd manufacturing-platform
npm create vite@latest rebuild/frontend -- --template react-ts
cd rebuild/frontend
npm install
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

`npm create vite@latest rebuild/frontend -- --template react-ts` — this
lesson's Header's own **Scaffolding**: `npm create` runs a real,
published scaffolding package (`create-vite`) without permanently
installing it first; `--` — a real, standard command-line convention:
everything after it passes through to the underlying `create-vite`
tool itself; `--template react-ts` selects React with TypeScript,
matching legacy's own real frontend, checked in an earlier session
(this repository's own root `package.json`). `npm install` — installs
every real dependency the scaffolded `package.json` already lists.
`npm install -D vitest @testing-library/react @testing-library/jest-dom
jsdom` — `-D`, a real, standard `npm` flag, installing these as
*development* dependencies, real tools this project's own build
process needs but never ships to a real browser; `vitest` — a real,
published test runner, built and maintained by Vite's own team
specifically to reuse Vite's own real configuration and transform
pipeline, rather than needing a second, separate one; `@testing-library/react`
— this lesson's Header's own `render` and `screen`;
`@testing-library/jest-dom` — real, additional test assertions,
installed alongside Testing Library per its own official setup
instructions; `jsdom` — a real, published, pure-JavaScript
implementation of the browser's own DOM API, the exact real package
this unit's own `environment: 'jsdom'` names.

### Run it, per the Verification Rule

This unit's own change has no observable effect by itself — real,
actually run, this session: with `environment: 'jsdom'` absent, calling
`render(...)` at all (the next unit's own test) raises this real,
actual error, immediately, before any real assertion is even reached:

```
ReferenceError: document is not defined
 ❯ render node_modules/@testing-library/react/dist/pure.js:265:5
```

That is the real, honest proof this configuration is load-bearing, not
optional — without it, no test that renders anything can run at all,
regardless of what it claims. The next unit's own test is what actually
exercises the fixed, working configuration.

### Connecting this unit to what came before

This lesson opened by scaffolding a real, empty test-tooling setup; this
unit is the one real piece that setup was still missing before any test
touching a real DOM could run at all.

---

## Concept Unit: A Real Test, Before a Real Component

### The Problem

Every prior lesson in this series wrote a real test against real code
that already existed — legacy's own already-existing model methods,
legacy's own already-existing HTTP routes. `rebuild/frontend` now
exists, real and scaffolded, with a real, working test tool configured
by the previous unit — but there is still no real component of this
project's own, on purpose: only Vite's own generic starter content. The
real question this unit answers: what does "test first" actually mean
when the real thing being tested has no legacy counterpart to
characterize, and doesn't exist yet at all — not even a stub?

> **Before reading on:** the previous unit's own real error,
> `ReferenceError: document is not defined`, is now fixed — a real,
> working `render(...)` is available. Given this project's real claim is
> that `App` should eventually show the word `rebuild` somewhere real
> and visible, and `screen.getByText`, this lesson's Header's own real
> **Query** method, searches by real, visible text — what real value
> would you guess belongs inside `screen.getByText(...)` to check for
> that, before reading the actual test below?

### Project Change

- **Reference Source** — no reference counterpart. `rebuild/frontend`
  had nothing real in it before the previous unit's own scaffolding
  command; there is nothing to port or characterize from legacy — see
  this unit's own SE Lens for why this makes this lesson genuinely
  different from the backend's own test-first shape.
- **Files affected** — created: `rebuild/frontend/src/App.test.tsx`.
- **Change type** — add.
- **Location** — new test file, directly inside `rebuild/frontend/src/`,
  sibling to the real `App.tsx` the previous unit's own scaffolding
  command already generated (with real, default Vite starter content —
  not `rebuild`'s own, not yet) and to where this project's real,
  intentional version of it will eventually live — the real, standard
  convention this lesson's own test tooling expects.
- **Dependencies** — `vitest`, `@testing-library/react`, and the real,
  `'jsdom'` test environment, all already installed and configured by
  the previous unit; nothing new to install here.

### The New Code

```tsx
import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'
import App from './App'

test('renders the word rebuild', () => {
  render(<App />)
  expect(screen.getByText('rebuild')).toBeDefined()
})
```

### The Updated Project

`rebuild/frontend/src/App.test.tsx`, in full — brand new, so this is
the whole file:

```tsx
1  import { render, screen } from '@testing-library/react'
2  import { test, expect } from 'vitest'
3  import App from './App'
4
5  test('renders the word rebuild', () => {
6    render(<App />)
7    expect(screen.getByText('rebuild')).toBeDefined()
8  })
```

### The Isolated Example

Every real construct the test above depends on — JSX, an arrow
function, `test`/`expect`, `render`/`screen.getByText` — is genuinely
new to this series. Isolated, throwaway, and *not* part of this
project, here's the smallest real version of each:

```tsx
// throwaway.test.tsx — not part of this project, deleted after this unit
import { render, screen } from '@testing-library/react'
import { test, expect } from 'vitest'

function Greeting() {
  return <p>hi</p>
}

test('a throwaway JSX element is findable by its real text', () => {
  render(<Greeting />)
  expect(screen.getByText('hi')).toBeDefined()
})
```

Not run this session — stated from confidence, not executed, per the
Verification Rule: React's own documented JSX behavior, and Testing
Library/Vitest's own documented `render`/`screen`/`test`/`expect`
contracts, are stable enough that running `npx vitest run
throwaway.test.tsx` is confidently predicted to print:

```
 ✓ throwaway.test.tsx (1 test | 1 passed)
```

This predicted, not executed, run establishes, in isolation, exactly
what the real
test above depends on: `<p>hi</p>` is real JSX — the exact same syntax
as `<App />` and `<h1>rebuild</h1>` in the real project, just applied
to a throwaway tag and a throwaway word; `Greeting`, called via JSX, is
a real function React actually invokes; `render` genuinely draws it
into a real, in-memory DOM; `screen.getByText` genuinely finds real
text there by what it says, not by any internal detail; and
`test('...', () => { ... })` — an **arrow function**, passed as this
real test's own body — genuinely runs when Vitest executes this file.

### Discard the Throwaway Example

Nothing about `Greeting`, `'hi'`, or `throwaway.test.tsx` itself
survives past this unit — it is deleted, real and in full, the moment
this proof is understood; it never becomes part of `rebuild/frontend`.

### Mechanical Walkthrough

- **Line 1, `import { render, screen } from '@testing-library/react'`**
  — this lesson's Header's own `render` and `screen`, both real, named
  exports.
- **Line 2, `import { test, expect } from 'vitest'`** — this lesson's
  Header's own `test` and `expect`, both real, named exports from
  Vitest itself.
- **Line 3, `import App from './App'`** — a real, standard import,
  reaching the real component this test is actually about. `App.tsx`
  itself already exists at this point — the previous unit's own
  scaffolding command already generated it, with real, default Vite
  starter content (a counter button, links to Vite's and React's own
  documentation) — but nothing in that real, default content is this
  project's own intentional design; per this unit's own real,
  deliberate order, this line reaches a real file whose real content
  doesn't yet do what this test expects, on purpose.
- **Line 5, `test('renders the word rebuild', () => {`** — this
  lesson's Header's own `test`, called with a real, descriptive string
  (this series' own already-established habit: a good test name states,
  in plain English, exactly what would have to be true for it to pass,
  so a failure report is legible without opening the test's own body
  first) and a real, this lesson's Header's own **arrow function**,
  containing the actual real check.
- **Line 6, `render(<App />)`** — this lesson's Header's own `render`,
  called with real JSX (this lesson's Header's own **JSX** term)
  instantiating the real `App` component this test imports.
- **Line 7, `expect(screen.getByText('rebuild')).toBeDefined()`** —
  this lesson's Header's own `screen.getByText('rebuild')`, called
  first, searching the real, just-rendered DOM for real, visible text
  matching `'rebuild'`; its real, found result is passed into this
  lesson's Header's own `expect(...)`, and `.toBeDefined()` — this
  lesson's Header's own chainable assertion method — checks the real
  value isn't `undefined`. This lesson's own actual real claim:
  something real, visibly containing the text `rebuild`, actually
  exists once `App` renders.

### CS Lens

This is a real instance of the identical concept this series already
named in full, back in its very first lesson: the **Assertion** — one
real, machine-checked claim, now reached through a genuinely different
real language's own real mechanism (a function call and a chained
method, rather than a bare keyword), proving the *idea* — a claim,
checked by a machine instead of trusted by eye — was never actually
specific to Python or its own test runner in the first place; it's the
one real thing every test framework this series has now touched is
built on top of.

Also recognized in: JUnit's own real `assertEquals`; Jest's own,
separate, real `expect`, which Vitest's own real API is deliberately
compatible with; any real test framework, in any real language, that
distinguishes "the machine checked this" from "a person read the code
and it looked right."

### SE Lens

The real, deliberately *not*-taken alternative here — the one this
unit's own Problem section already raised: treating this lesson's
frontend work like the backend's own test-first lessons, characterizing
some real, existing legacy frontend behavior first, proving it RED
against an empty `rebuild/frontend`, the identical real shape those
lessons already used. Rejected here for a real, honest, structural
reason, not a shortcut: legacy's own real frontend is a large, real,
already-existing Electron application with no single, small, isolated
real behavior that corresponds to "does anything render at all" —
unlike a plain HTTP health check, there's no one, real, narrow legacy
contract this specific test could characterize first. What this unit
does instead is real, and still test-first: the real test is written
before the real component it checks, proven to actually fail for the
actual right reason before any real implementation exists — the same
real discipline, applied to a genuinely new capability instead of a
ported one.

### Commands needed

```powershell
npx vitest run
```

`npx` runs a real, locally-installed package's own binary without a
global install; `vitest run` — a real, one-shot run of every real test
file Vitest finds (by its own real, default naming convention: any file
ending `.test.tsx`), rather than Vitest's own real default *watch*
mode, which would keep running indefinitely, re-running on every real
file change — appropriate for interactive development, not for this
lesson's own real, one-time proof.

### Run it, per the Verification Rule

Real doubt existed here, so this was actually run this session, not
predicted — Testing Library's own precise error wording is a real,
specific detail this lesson has no business guessing at:

```
FAIL  src/App.test.tsx > renders the word rebuild
TestingLibraryElementError: Unable to find an element with the text: rebuild.
This could be because the text is broken up by multiple elements. In this
case, you can provide a function for your text matcher to make your
matcher more flexible.
```

followed by a real, full printout of the current, actual DOM
`render(<App />)` produced — the previous unit's own scaffolded,
default Vite starter markup (a `Get started` heading, a `Count is 0`
button, links to Vite's and React's own documentation), so a reader can
see for themselves that `screen.getByText('rebuild')` genuinely
searched real, rendered content and genuinely found nothing matching,
rather than crashing or being skipped. This is the correct, honest RED:
not because `App.tsx` doesn't exist — it does, real and scaffolded —
but because nothing in what it *actually renders yet* is this project's
own real `rebuild` content.

### Connecting this unit to what came before

This series opened with the **Assertion** — one real claim, checked by
a machine. This unit is the first time that identical real idea is
reached through a genuinely different real language and tool, proving,
for real, that it was never actually about Python specifically.

---

## Connect the pieces

A real test now exists, checking a real claim about a real component
that doesn't exist yet — proven, honestly, to fail for exactly that
reason. Nothing about `App` itself was written in this lesson; that's
a separate, later lesson's own real, entire job.

---

**Next lesson:** the actual smallest real component that makes this
exact test pass — nothing more.
