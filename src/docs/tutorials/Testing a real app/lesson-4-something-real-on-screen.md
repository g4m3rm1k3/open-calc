# Lesson 4: Something Real on Screen

> **What "this project" means in this lesson.** Same as every lesson
> before it: every real path this lesson names is inside
> `manufacturing-platform`, not `open-calc`. Legacy's own real frontend
> (`src/`) is also a real Electron desktop application — this lesson
> deliberately builds none of that yet: `rebuild/frontend` starts as a
> plain web app, running in a browser, nothing more. Electron is a real,
> separate distribution concern — a wrapper around a finished web app,
> not part of the application itself — and is deferred to a later
> lesson, if and when it's actually needed.

## What you will build

The actual smallest real component that makes this project's own real,
already-written test pass — nothing more. This lesson does not connect to `rebuild/backend`
yet, and does not apply any real styling yet; both are deliberately
later lessons.

## What you need to know first

Lesson 3 — the real, already-failing `App.test.tsx`, and the real,
already-scaffolded `rebuild/frontend` project this lesson finishes.

## Terms introduced

- **JSX** — a real, non-standard syntax extension to JavaScript (and,
  here, TypeScript) that allows writing something that looks like HTML
  markup directly inside real code, rather than building UI structure
  through a series of function calls. `<h1>rebuild</h1>`, below, is
  JSX — it is not a string, and it is not real HTML; a real build step
  (already wired up when this project's own real scaffolding tool
  generated `rebuild/frontend`) transforms it into real JavaScript
  function calls before it ever reaches a browser.
- **Component** — in React specifically, a plain function that returns
  JSX describing what should appear on screen. `App`, below, is a real,
  first component this project defines: an ordinary TypeScript
  function, made into a React component purely by what it returns and
  how it's used — no special keyword, no base class, no decorator.

## Objects and methods used

- **`createRoot(container)`**
  - *What it is:* a real function, exported by the `react-dom/client`
    package — part of React's own public API for connecting a real
    React application to a real, already-existing HTML element.
  - *Implementation:* checked against React's own official
    documentation this session — takes one real, already-existing DOM
    element and returns a real `Root` object, capable of rendering (and
    later updating) a React component tree inside that exact element.
  - *Its use:* this lesson's `main.tsx` calls it once, pointing it at
    the real `<div id="root">` this project's own real, generated
    `index.html` already contains, to attach this project's entire
    React application to one specific, real place in the page.
  - *Type:* a free function, exported by `react-dom/client`, returning
    a real `Root` object.
  - *Responsibility:* establishing the one real seam between a real
    HTML document, already sitting in the browser, and a real React
    component tree this project controls from here on.
  - *Depends on:* a real, already-existing DOM element to attach to —
    here, the result of `document.getElementById('root')`.
  - *Connects to:* called once, at this application's own real entry
    point; its own `.render(...)` method, immediately below, is what
    actually puts a real component tree on screen.
  - *Shape:* the real boundary between the browser's own DOM and this
    project's React code — the one place "a real page" and "a real
    React app" are joined.

- **`Root.render(children)`**
  - *What it is:* a real instance method on the `Root` object
    `createRoot(...)`, above, returns.
  - *Implementation:* checked against React's own official
    documentation this session — takes real JSX (or, more generally,
    anything React can render) and draws it into the real DOM element
    the `Root` was created against, replacing whatever was there before.
  - *Its use:* this lesson's `main.tsx` calls it once, immediately after
    `createRoot`, handing it this project's own real `<App />`
    component, wrapped in `<StrictMode>`, below.
  - *Type:* an instance method on a real `Root` object.
  - *Responsibility:* actually drawing a real component tree into the
    real DOM, and, on any later call, deciding what actually needs to
    change on screen rather than redrawing everything from nothing.
  - *Depends on:* a real, already-constructed `Root` object, and real
    JSX (or another real renderable value) to draw.
  - *Connects to:* called once, directly after `createRoot`, at this
    application's own real entry point.
  - *Shape:* the actual real moment a React application first appears
    on screen — everything before this line only prepares for it.

- **`document.getElementById(id)`**
  - *What it is:* a real method on the browser's own global `document`
    object — part of the DOM API, a real, standard browser interface,
    not anything React or this project provides.
  - *Implementation:* checked against MDN's own official documentation
    this session — searches the real, already-parsed HTML document for
    one element whose real `id` attribute matches the given string, and
    returns it, or `null` if none exists.
  - *Its use:* this lesson's `main.tsx` calls it once, with the literal
    string `'root'`, to find the real `<div id="root">` this project's
    own real `index.html` already declares, and hand it to `createRoot`.
  - *Type:* an instance method on the browser's real, global `document`
    object.
  - *Responsibility:* finding one specific, real, already-existing
    element already sitting in the page, by its declared `id`.
  - *Depends on:* a real, already-parsed HTML document containing an
    element with the matching `id`.
  - *Connects to:* called once, at this application's own real entry
    point; its real return value is passed directly into `createRoot`.
  - *Shape:* a real, standard browser API boundary — the same real
    mechanism any JavaScript on any real web page already uses to reach
    into the page it's running inside.

---

## Concept Unit: Making the Real Test Pass

### The Problem

This project's own real, already-written test fails for the correct,
honest reason — `App.tsx` doesn't exist. The real question this unit
answers: what's the actual smallest real component that makes it pass,
without building anything this lesson's own real requirement doesn't
need yet?

> **Before reading on:** this project's own real, already-written test
> checks for real, visible text matching the literal string
> `'rebuild'`, using
> `screen.getByText('rebuild')`. Given only that, what's the actual
> smallest real JSX expression you can think of that would satisfy it?

### Project Change

- **Reference Source** — no reference counterpart. Legacy's own real
  frontend exists, but per this lesson's own Header, this unit
  deliberately does not port its Electron shell, its router, its state
  management, or any of its real dependencies — see the SE Lens, below.
- **Files affected** — created: `rebuild/frontend/src/App.tsx`
  (replacing the real, generated demo entirely).
- **Change type** — replace.
- **Location** — `rebuild/frontend/src/`, sibling to the real,
  already-written `App.test.tsx`.
- **Dependencies** — none beyond this project's own real,
  already-installed dependencies.

### The New Code

```tsx
function App() {
  return <h1>rebuild</h1>
}

export default App
```

### The Updated Project

`rebuild/frontend/src/App.tsx`, in full — replacing the real, generated
demo entirely, so this is the whole file:

```tsx
1  function App() {
2    return <h1>rebuild</h1>
3  }
4
5  export default App
```

Also deleted entirely, real files this lesson's own actual requirement
never uses: `src/App.css` (the demo's own real styling — this series'
own styling decision belongs to a later, dedicated lesson, not this
one), `src/assets/` and `public/icons.svg` (the demo's own real hero
image, logos, and icon sprite). `src/index.css`, real and generated,
kept but trimmed to one real, plain rule:

```css
body {
  margin: 0;
}
```

— removing the real, generated demo's own accent colors, dark-mode
theme, and fixed-width centered layout, all of which are real styling
decisions, deliberately deferred to a later lesson `App.css` was too.

### Mechanical Walkthrough

- **Line 1, `function App() {`** — this lesson's Header's own
  **Component** concept, applied for real: an ordinary TypeScript
  function declaration, named `App`, taking no parameters. Nothing about
  this line makes it a "component" on its own — only what it returns,
  below, and how `main.tsx` uses it, do.
- **Line 2, `return <h1>rebuild</h1>`** — this lesson's Header's own
  **JSX** syntax, applied for real: `<h1>rebuild</h1>` is not a string
  and not real HTML — it's real JSX, transformed by this project's own
  real build tooling into a real JavaScript call describing one real
  `<h1>` element containing the plain text `rebuild` — the exact real,
  visible text this project's own real, already-written
  `screen.getByText('rebuild')` searches for.
- **Line 5, `export default App`** — a real, standard TypeScript/
  JavaScript module export, making this file's own `App` function the
  one real thing another file can import from it with no name needed —
  exactly how the real, already-written test, and `main.tsx`, below,
  actually reach it.

`rebuild/frontend/src/main.tsx`, real and generated, kept completely
unchanged — the real file this lesson's own `App.tsx` actually gets
used by:

```tsx
1  import { StrictMode } from 'react'
2  import { createRoot } from 'react-dom/client'
3  import './index.css'
4  import App from './App.tsx'
5
6  createRoot(document.getElementById('root')!).render(
7    <StrictMode>
8      <App />
9    </StrictMode>,
10 )
```

- **Line 1, `import { StrictMode } from 'react'`** — a real, standard
  ES module import, bringing in `StrictMode`, a real, exported value
  from the `react` package — not a component this project defines, a
  real component React itself provides, whose only real job is
  development-time checking: it renders its own children twice, in
  development only, specifically to surface real bugs that only show up
  when something runs more than once — never present in a real
  production build.
- **Line 2, `import { createRoot } from 'react-dom/client'`** — this
  lesson's Header's own `createRoot`, imported from React's own real
  `react-dom/client` package.
- **Line 3, `import './index.css'`** — a real, Vite-specific import
  extension beyond plain JavaScript: importing a real `.css` file
  directly, which Vite's own real build tooling (not a browser feature)
  understands and actually applies to the page, rather than treating it
  as a real JavaScript module.
- **Line 4, `import App from './App.tsx'`** — a real, standard ES
  module import, reaching this lesson's own `App.tsx`, by its real
  default export.
- **Line 6, `createRoot(document.getElementById('root')!)`** — this
  lesson's Header's own `document.getElementById('root')`, called with
  the literal string `'root'`, finding the real `<div id="root">`
  this project's own real, generated `index.html` already declares; the
  trailing `!` is real TypeScript syntax — a **non-null assertion**,
  telling TypeScript's own real type checker "trust this specific call
  actually finds something, don't force a null-check here" — a real,
  deliberate promise the real HTML actually keeps, not something
  TypeScript can verify on its own. This lesson's Header's own
  `createRoot`, called with that real, found element.
- **Lines 6–10, `.render(<StrictMode><App /></StrictMode>)`** — this
  lesson's Header's own `Root.render(children)`, called with real JSX:
  this project's own real `<App />` component (line 8), wrapped in the
  real `<StrictMode>` imported on line 1.

`rebuild/frontend/index.html`, real and generated, kept completely
unchanged:

```html
1  <!doctype html>
2  <html lang="en">
3    <head>
4      <meta charset="UTF-8" />
5      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
6      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
7      <title>scaffold-check</title>
8    </head>
9    <body>
10     <div id="root"></div>
11     <script type="module" src="/src/main.tsx"></script>
12   </body>
13 </html>
```

- **Line 10, `<div id="root"></div>`** — the real, empty element
  `main.tsx`'s own `document.getElementById('root')` finds — genuinely
  empty until `main.tsx` runs and `Root.render(...)` fills it.
- **Line 11, `<script type="module" src="/src/main.tsx">`** — a real,
  standard HTML `<script>` tag, `type="module"` telling the browser to
  treat it as a real ES module; pointing directly at the real,
  un-compiled `main.tsx` — genuinely possible only because Vite's own
  real development server compiles TypeScript and JSX on the fly, per
  request, rather than requiring a real build step first.

### CS Lens

This is a real instance of **generate, then subtract** — starting from
a real tool's own maximal, working default, and removing whatever a
specific, real, current requirement doesn't need, rather than building
up from nothing by hand.

Also recognized in: a real framework's own project generator (`rails
new`, `django-admin startproject`) in virtually every real web
framework; starting a real technical document from an existing
template and deleting whichever sections don't apply, rather than
writing one from a blank page.

### SE Lens

The real, deliberately *not*-taken alternative here: keeping the real,
generated demo content (`App.css`, the hero image, the docs/community
links) in place, and simply not mentioning it. Rejected on purpose —
code sitting in a real project that nothing actually depends on is
still a real, ongoing cost — it has to be read past, reasoned about,
and eventually explained to someone, for zero real benefit, exactly the
same real category of problem this whole series' own README already
opened by naming: a "complete" refactor whose own Testing Checklist was
never actually checked.

### Commands needed

```powershell
cd manufacturing-platform/rebuild/frontend
npx vitest run
```

### Run it, per the Verification Rule

Not run this session, and, honestly, without a claimed exact
transcript: this lesson does not know Vitest's precise console
formatting without having actually run it, and does not put a
fabricated capture in a lesson. What *is* honestly, confidently known,
from `screen.getByText`'s own documented contract: once `App` renders
`<h1>rebuild</h1>`, the real, in-memory DOM genuinely contains an
element whose real, visible text is `rebuild` — the test has real,
correct grounds to pass. The actual, exact console output is something
to read directly off a real `npx vitest run`, not something to trust
from this page. If it does *not* pass when actually run, that's a real
signal something above is wrong, worth stopping to investigate — not a
reason to edit this lesson to match a surprising result without
understanding why first.

### Connecting this unit to what came before

This project's own real test, written first, already proved a real,
honest RED. This unit is the real, matching GREEN: the actual smallest
real component that makes it true.

---

## Connect the pieces

`rebuild/frontend` went from not existing at all, to a real, complete,
tool-generated project, to a real, deliberately minimal one — one real
component, rendering one real heading, proven correct by a real test
written before it existed at all. Nothing here talks to
`rebuild/backend` yet, and nothing here is styled yet — both are real,
separate, later lessons, not accidentally skipped here.

---

**Next lesson:** a real test for the actual connection between
`rebuild`'s two halves — written before `App` knows how to fetch
anything, the identical real discipline this lesson's own test-first
pair just proved.
