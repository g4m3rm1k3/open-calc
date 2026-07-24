# Lesson 11: The React Transition

## What you will build

`cnc-web` becomes a real React application — the same visible result as
Lesson 9 (a status-free page titled "Toolpath," a colored 3D viewport, a
raw JSON dump), now built from two real components (`App`, `Viewport`)
instead of one imperative script. This is the named, planned transition
`CURRICULUM.md`'s target architecture always intended: the reference app
(`cnc-sim/cnc/CNCBackplot.tsx`) is React, and every future port becomes a
direct translation from here on, not an invented equivalent. The
transferable problem: **a UI framework's job is deciding when to
re-render in response to changing data** — this project has had changing
data (a fetched path) since Lesson 7, but until now, *this project's own
code* decided when to redraw it; from this lesson on, React does.

## What you need to know first

Lesson 7: `interface`, `async`/`await`, generics, `cnc-web`'s Vite
tooling. Lesson 8: `createViewport`'s scene bootstrap and `drawPath`.
Lesson 9: `groupSegments`/`PathPoint`. This lesson doesn't change any of
those three files' *internals* — `viewport.ts` and `segments.ts` are
reused completely unchanged; only how they're *called* changes.

## Concepts cataloged from this lesson

Full standalone treatments live in `../concepts/`. Pointers to each are
also placed inline at their point of use below.

- `../concepts/vite-plugin-system.md`
- `../concepts/react-usestate-hook.md`
- `../concepts/javascript-destructuring.md`
- `../concepts/jsx-syntax.md`
- `../concepts/jsx-fragments.md`
- `../concepts/react-component-props.md`
- `../concepts/react-useref-hook.md`
- `../concepts/typescript-typeof-returntype-utility.md`
- `../concepts/react-useeffect-hook.md`
- `../concepts/javascript-optional-chaining.md`
- `../concepts/react-dom-createroot-mounting.md`
- `../concepts/react-lifting-state-up.md`

## No pipeline diagram change

Same pipeline, same five stages, same real data. This lesson only
changes *how* `cnc-web` is built, not what it computes or displays.

---

## Concept Unit: A Component That Remembers a Number

### The Problem

Before touching this project's real UI, the actual mechanism React adds
— components that hold their own state and re-render when it changes —
needs to be seen working, in isolation, on the smallest possible example.

### Commands, Run for Real

```
npm install react react-dom
npm install --save-dev @types/react @types/react-dom @vitejs/plugin-react
```
`react` — the actual library: components, and the rules for how they
re-render. `react-dom` — a separate package specifically for running
React *in a browser* (React itself is platform-agnostic; other packages
target mobile, terminals, etc. — not used by this project, named only so
`react-dom`'s existence as a *separate* package makes sense). `@types/
react`/`@types/react-dom` — **(b) reappearing** the separate-types-
package pattern (Lesson 8's `@types/three`). `@vitejs/plugin-react` —
**(a) first appearance** — a real Vite plugin.
*(Full standalone treatment: ../concepts/vite-plugin-system.md.)*
Teaching Vite's own dev
server and build process how to compile JSX (the `<Counter />`-style
syntax below) into plain JavaScript function calls a browser can run —
without it, Vite has no idea what to do with a `.tsx` file's angle-bracket
syntax at all.

### The Concept, Isolated

```tsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button id="lab-button" onClick={() => setCount(count + 1)}>
      Clicked {count} times
    </button>
  );
}
```
Mounted temporarily and clicked three times by a real headless browser,
this session:
```
initial: Clicked 0 times
after 3 clicks: Clicked 3 times
```
**What this proves:** `useState(0)` — **(a) first appearance** — creates
one piece of state, starting at `0`, and returns a pair: the *current*
value (`count`) and a function to change it (`setCount`).
*(Full standalone treatment: ../concepts/react-usestate-hook.md.)*
— **(a)** this
is **array destructuring** applied to a function's return value
(already-familiar shape if covered elsewhere in this curriculum;
named here since it's this project's own first real use of it).
*(Full standalone treatment: ../concepts/javascript-destructuring.md.)*
Calling `setCount(...)` doesn't just change a variable — it tells React
"re-run this component function, with the new value," which is why the
displayed text (`Clicked {count} times`) updates after every real click,
without this project writing a single line of DOM-manipulation code to
make that happen — a real, fundamental difference from every previous
lesson's `document.getElementById(...).textContent = ...` pattern.
`<button onClick={() => setCount(count + 1)}>` — **(a) first appearance**
of **JSX**.
*(Full standalone treatment: ../concepts/jsx-syntax.md.)*
HTML-like syntax written directly inside TypeScript/
JavaScript, compiled (by `@vitejs/plugin-react`, just installed) into
plain function calls that build a description of what the DOM should
look like — never actual DOM elements directly; React itself decides how
to turn that description into real DOM changes.

### Discard

This `Counter` component is deleted now. It will not appear in the
project again — it existed only to prove `useState` and JSX render real,
clickable, stateful UI before trusting either in this project's actual
code.

### Project Change

- **Reference Source** — none; this is the React library itself, not
  ported logic. The *decision* to adopt it now, rather than later, is
  real: `CNCBackplot.tsx` (the very file this project has been porting
  since Lesson 8) is itself a React component, and every future unit
  ported from it will read far more directly once this project is also
  React.
- **Files affected** — `cnc-web/tsconfig.json` (added `"jsx": "react-
  jsx"`), `cnc-web/vite.config.ts` (added the React plugin).
- **Change type** — configure.
- **Location** — `tsconfig.json`'s `compilerOptions`; `vite.config.ts`'s
  `plugins` array.
- **Dependencies** — `react`, `react-dom`, `@vitejs/plugin-react`.

### The New Code

```json
{
  "compilerOptions": {
    "jsx": "react-jsx"
  }
}
```
```typescript
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
});
```

### Mechanical Walkthrough

- `"jsx": "react-jsx"` — **(a) first appearance** — tells `tsc` how to
  type-check JSX syntax and which runtime helpers to assume exist for
  it; `"react-jsx"` specifically is the *modern* transform, which doesn't
  require writing `import React from "react"` at the top of every file
  using JSX (an older convention this project never needs to follow).
- `plugins: [react()]` — **(a) first appearance** of a Vite **plugin** —
  Vite's own core only handles plain JS/TS/CSS/assets; JSX compilation is
  deliberately not built in, added instead as an explicit, visible
  dependency — the same "only pay for what you use" philosophy already
  named for Three.js's separate `@types/three` package.

### CS Lens

`useState` returning a getter-value-plus-setter-function pair, where
calling the setter triggers a fresh render rather than mutating anything
in place, is **unidirectional data flow with immutable updates** — state
never changes "underneath" a running function; instead, the function
*reruns* with the new value already substituted in. This is a
fundamentally different model from every mutation this project's own
`MachineState` (Lesson 5) or `Parser` (Lesson 4) performs on `self`
directly — both are real, valid models, used deliberately in different
layers of this same project (backend: mutate an object in place;
frontend: re-render from fresh values).

Also recognized in: every modern reactive UI framework (Vue, Svelte,
SwiftUI, Jetpack Compose) — "describe what the UI should look like given
the current state, let the framework figure out how to get there" is the
dominant real-world UI architecture pattern this decade, not unique to
React.

### SE Lens

The real, honest cost of adopting React now, mid-project: every file
`cnc-web` has built since Lesson 7 (`main.ts`, the DOM-manipulation
pattern) needs rewriting, not just extending — a genuine, one-time
migration cost, not free. It's accepted here, now, rather than later,
specifically because `cnc-web` is still small (four real source files
before this lesson) — the exact same "the frontend is still small, switch
now while it's cheap" reasoning a real team would apply, and the reason
this lesson exists at this specific point in the project rather than
being deferred indefinitely.

---

## Concept Unit: Wrapping an Imperative Scene in a Declarative Component

### The Problem

`createViewport` (Lesson 8) is fundamentally **imperative** — call a
function, it mutates the DOM directly, done. React wants to own *when*
things render. Something has to bridge the two without rewriting
`viewport.ts`'s real, tested Three.js logic at all.

### Reference Source, Read for Real This Session

`cnc-sim/cnc/CNCBackplot.tsx` line 93 (already read in full for Lesson
8's own research, re-confirmed here in its real React context):
```tsx
useEffect(() => {
  const el = mountRef.current;
  if (!el) return;
  // ... real scene bootstrap (Lesson 8 already ported this part)
}, []);
```
The reference wraps its entire scene bootstrap in a `useEffect` with an
**empty dependency array**, and reads its mount point from a `useRef`
(`mountRef.current`) — exactly the pattern this unit ports, closing
Lesson 8's own named deviation ("plain-function bootstrap instead of the
reference's `useEffect`").

### The New Code

```tsx
import { useEffect, useRef } from "react";
import { createViewport } from "./viewport.ts";
import type { PathPoint } from "./segments.ts";

interface ViewportProps {
  points: PathPoint[];
}

function Viewport({ points }: ViewportProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<ReturnType<typeof createViewport> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    viewportRef.current = createViewport(containerRef.current);
  }, []);

  useEffect(() => {
    viewportRef.current?.drawPath(points);
  }, [points]);

  return <div ref={containerRef} style={{ width: 700, height: 400 }} />;
}

export default Viewport;
```

### Mechanical Walkthrough
- `interface ViewportProps { points: PathPoint[]; }` — **(b) reappearing**
  interface syntax (Lesson 7); **(a) first appearance of the concept of
  props**: the object a component receives as its single argument,
  describing everything the caller controls about it — this project's
  first real component *input*, as opposed to a component with no
  external configuration at all (`Counter`, above).
  *(Full standalone treatment: ../concepts/react-component-props.md.)*
- `function Viewport({ points }: ViewportProps)` — **(a) first
  appearance** of **destructuring directly in a parameter list**.
  *(Full standalone treatment: ../concepts/javascript-destructuring.md.)*
  Pulls
  `points` straight out of the incoming props object, rather than writing
- `props.points` throughout the function body — already-familiar
  destructuring syntax (Lesson 6's tuple unpacking, in Python; this is
  its TypeScript/object equivalent), applied to a function parameter for
  the first time in this project.
- `const containerRef = useRef<HTMLDivElement>(null);` — **(a) first
  appearance** of `useRef`.
  *(Full standalone treatment: ../concepts/react-useref-hook.md.)*
  Creates an object with one mutable property,
  `.current`, that **persists across re-renders without itself causing
- one when changed** — a real, deliberate contrast with `useState`
  (changing a ref never triggers a re-render, which is exactly why it's
  the right tool here: the actual Three.js renderer object has nothing to
  do with what React should display, only with what already exists on
  screen).
- `const viewportRef = useRef<ReturnType<typeof createViewport> | null>(null);`
- — **(a) first appearance** of `ReturnType<typeof fn>` — a real
  TypeScript **utility type**.
  *(Full standalone treatment: ../concepts/typescript-typeof-returntype-utility.md.)*
  `typeof createViewport` refers to the
  function's own type (not its return value); `ReturnType<...>` extracts
  *what that function returns* as a type, without writing out `{ drawPath:
- (points: PathPoint[]) => void }` by hand — used here specifically so
  this file never has to duplicate `viewport.ts`'s own return shape.
- `useEffect(() => { if (!containerRef.current) return;
- viewportRef.current = createViewport(containerRef.current); }, []);` —
  **(a) first appearance** of `useEffect`.
  *(Full standalone treatment: ../concepts/react-useeffect-hook.md.)*
  Runs its callback *after*
  React has updated the real DOM to match this render — exactly the
  right moment to create the real `<canvas>`, since `containerRef.
  current` is only guaranteed to point at a real, attached DOM element
  once that's happened. The **empty dependency array**, `[]`, tells React
  "run this exactly once, right after the first render, never again" —
  ported directly from the reference's own identical `[]`.
- `useEffect(() => { viewportRef.current?.drawPath(points); }, [points]);`
  — **(a) a second, separate effect**, with a **real, non-empty
  dependency array**: `[points]` tells React "run this again whenever
- `points` is a genuinely new value" — the mechanism that replaces this
  project's old `.then((points) => { ... viewport.drawPath(points); })`
  callback (Lesson 8) with something that reacts to *state changing*
  instead of a *fetch completing directly*. `viewportRef.current?.
- drawPath(...)` — **(a) first appearance** of the **optional chaining
  operator**, `?.`.
  *(Full standalone treatment: ../concepts/javascript-optional-chaining.md.)*
  Only calls `.drawPath` if `viewportRef.current` isn't
- `null` — genuinely possible here on a component's very first render,
  before the first effect has run at all.
- `return <div ref={containerRef} style={{ width: 700, height: 400 }} />;`
- — **(a) first appearance** of the `ref` **JSX attribute**
  (part of `../concepts/react-useref-hook.md`'s own treatment). Connects this
- specific rendered `<div>` to `containerRef` — after this line runs,
  `containerRef.current` *is* this real DOM element, which is exactly
  what the first `useEffect` above depends on existing.

### CS Lens

Two effects with two different dependency arrays — one that runs once,
one that reruns on a specific change — is **effect scoping**: explicitly
declaring what a side effect actually depends on, so React can decide
precisely when re-running it is necessary, rather than either always
rerunning everything (wasteful, and here, actively broken — see below) or
manually tracking "did this actually change" by hand, the way Lesson 8's
own `drawPath` had no choice but to be called explicitly, every time,
by whoever held a reference to it.

### SE Lens

Keeping `viewport.ts` and `segments.ts` **completely unchanged** through
this entire migration is the real, concrete payoff of Lesson 8's own
original design choice — a plain function returning a small object
(`{ drawPath }`) with zero framework awareness. Wrapping *that* in a
component costs one small new file (`Viewport.tsx`); the alternative —
if Three.js calls had been scattered directly through the old `main.ts`
with no clean boundary — would have made this exact migration touch far
more code, for no additional benefit.

---

## Concept Unit: A Real, Caused Bug — the Wrong Dependency Array

### Caused for Real, This Session

The first `useEffect`'s dependency array changed from `[]` to `[points]`
on purpose:
```tsx
useEffect(() => {
  if (!containerRef.current) return;
  viewportRef.current = createViewport(containerRef.current);
}, [points]);   // wrong, on purpose
```
**Real output, a headless browser loading the actual page:**
```
canvas count (should be 1, watch it not be): 2
```
**What this proves:** `points` starts as `[]` (its initial `useState`
value in `App`, next unit) and changes exactly once, when the real fetch
resolves — and because the bootstrap effect's dependency array now
includes `points`, React ran it **again** on that change, calling
`createViewport` a **second time**. `createViewport` (Lesson 8) always
`container.appendChild(renderer.domElement)`s a brand-new `<canvas>` —
it was never written to check whether one already existed, because
nothing before this lesson ever called it more than once. The result: two
real, independent Three.js scenes, two real WebGL contexts, two real,
endless `requestAnimationFrame` loops, both genuinely running — a real,
silent resource leak, not a crash, not a console error, the same
category of "wrong, but nothing complains" bug this project has now
demonstrated at every layer (Lesson 8's `camera.up`, Lesson 4's
validation-ordering bug, and now this one).

### Discard

Reverted immediately after confirming this — the dependency array is
`[]` again, verified back to a real, single canvas.

---

## Concept Unit: The Component That Fetches

### The New Code

```tsx
import { useEffect, useState } from "react";
import Viewport from "./Viewport.tsx";
import type { PathPoint } from "./segments.ts";

interface PathResponse {
  points: PathPoint[];
}

async function fetchPath(program: string): Promise<PathPoint[]> {
  const response = await fetch("http://127.0.0.1:5000/api/path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program }),
  });
  const data: PathResponse = await response.json();
  return data.points;
}

const PROGRAM = "G0 X10 Y20\nX30\nG1 Z-5 F100";

function App() {
  const [points, setPoints] = useState<PathPoint[]>([]);

  useEffect(() => {
    fetchPath(PROGRAM).then(setPoints);
  }, []);

  return (
    <>
      <h1>Toolpath</h1>
      <Viewport points={points} />
      <pre>{JSON.stringify(points, null, 2)}</pre>
    </>
  );
}

export default App;
```

### The Updated Project

`cnc-web/src/main.tsx`, the new real entry point, in full:
```tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

const container = document.querySelector<HTMLDivElement>("#root")!;
createRoot(container).render(<App />);
```
And `cnc-web/index.html`, reduced to a single real mount point:
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>cnc-web</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```
As a whole: one `<div id="root">` is now the *only* real element in the
whole page's HTML; every visible thing — the heading, the viewport, the
JSON dump — is rendered by React from here, replacing Lesson 7–9's
directly-authored `<h1>`/`<input>`/`<pre>` markup entirely.

### Mechanical Walkthrough
- `useState<PathPoint[]>([])` — **(b) reappearing** `useState`, now with
- an explicit type argument (`PathPoint[]`) — necessary here since `[]`
  alone gives TypeScript nothing to infer an element type from.
- `useEffect(() => { fetchPath(PROGRAM).then(setPoints); }, []);` — **(b)
  reappearing** `useEffect` with an empty array (runs once, on mount);
- **(c) already established** `.then()` (Lesson 1); `setPoints` — passed
  directly as the `.then` callback, rather than a wrapping arrow function
- — valid because `setPoints`'s own real signature already accepts
  exactly what `.then` will hand it (the resolved `PathPoint[]`),
  needing no extra wrapping.
- `<> ... </>` — **(a) first appearance** of a **JSX Fragment**.
  *(Full standalone treatment: ../concepts/jsx-fragments.md.)*
  Groups
  multiple elements (`<h1>`, `<Viewport>`, `<pre>`) without wrapping them
  in an extra, real `<div>` that would otherwise be needed purely because
  a component can only return *one* root element — the fragment satisfies
  that rule while adding nothing to the actual rendered DOM.
- `<Viewport points={points} />` — **(a) first appearance** of passing a
  **prop** to a custom component: `points={points}` (JSX attribute syntax,
  now passing a real array instead of a string) hands this render's
  current `points` value down to `Viewport`, which is exactly the value
  its own second `useEffect` (previous unit) watches for changes on.
- `<pre>{JSON.stringify(points, null, 2)}</pre>` — **(a) first appearance**
  of a **JSX expression**: `{...}` inside JSX embeds a real JavaScript
- expression's *value* into the rendered output — `(c) already
  established` `JSON.stringify` (Lesson 1), now called inline rather than
- assigned to `.textContent` — this is the direct replacement for every
  previous lesson's manual `document.getElementById(...).textContent =
  ...` pattern.
- `createRoot(container).render(<App />)` — **(a) first appearance**.
  *(Full standalone treatment: ../concepts/react-dom-createroot-mounting.md.)*
  `createRoot` creates React's real connection to a DOM node;
  `.render(<App />)` tells it to render the `App` component (and
  everything it returns) into that node — the one place, in this entire
  project, where React is handed control of a real part of the page.

### CS Lens

*(Full standalone treatment: ../concepts/react-lifting-state-up.md.)*

State living in `App` (`points`) and being passed *down* to `Viewport` as
a prop, rather than `Viewport` fetching its own data, is **"lifting state
up"** — a real, named React pattern: state lives in the nearest component
that needs to share it, and children receive it as input, the same
general shape as this project's own backend keeping `MachineState` (a
single source of truth) separate from `Parser` (which only produces the
inputs `MachineState` consumes) — a different mechanism, the identical
underlying instinct: one clear owner for a piece of data, everything else
receives it, nothing duplicates it.

### SE Lens

`Viewport` has no idea *how* `points` was obtained — it could come from
a fetch (today), a file upload, or a hardcoded test value, and `Viewport`
itself would need zero changes. This is the same real payoff already
named for `MachineState`'s dict-shaped input (Lesson 5's SE lens) —
applied here to a React component instead of a Python class.

### Commands and Real Output

```
npx tsc --noEmit
```
**Real output:** none — clean pass.
```
npx vitest run
```
**Real output:** `Tests  4 passed (4)` — `segments.test.ts`, completely
untouched by this entire lesson, still green.

A real headless browser (Playwright, this session) loading the actual,
final page:
```
h1: Toolpath
canvas count: 1
pre text (first 80 chars): [
  {
    "motion": "G0",
    "x": 0,
    "y": 0,
    "z": 0
  },
  {
    "motio
errors: []
```
Pixel-identical result to Lesson 9's own screenshot — the same dark
scene, the same real red/green toolpath — now produced entirely by React
components instead of directly-authored DOM code.

---

## Connect the Pieces

1. `createRoot(container).render(<App />)` mounts `App` into `#root`.
2. `App` renders immediately with `points = []` (its initial state);
   `Viewport` receives `points={[]}`, renders an empty `<div ref=
   {containerRef}>`.
3. React commits this first render to the real DOM, then runs effects:
   `App`'s effect starts `fetchPath(PROGRAM)`; `Viewport`'s *first*
   effect (`[]`) creates the real Three.js scene, since `containerRef.
   current` now points at a real, attached `<div>`.
4. When the fetch resolves, `App`'s `setPoints(realPoints)` runs — React
   re-renders `App` with the new `points`, passes the new array down to
   `Viewport` as new props.
5. `Viewport`'s *second* effect (`[points]`) sees `points` really changed
   and calls `viewportRef.current.drawPath(points)` — the exact same
   `drawPath` from Lesson 8/9, completely unaware it's being called from
   inside a React effect instead of a `.then` callback.
6. The scene updates with the real, colored toolpath — verified, this
   session, pixel-identical to before this lesson.

## What Breaks Without This

Already demonstrated in full, live, this lesson: giving the scene-
bootstrap effect the wrong dependency array (`[points]` instead of `[]`)
doesn't crash or error — it silently creates a second, real, resource-
consuming Three.js scene every time the watched value changes, real
output showing 2 real canvases where exactly 1 should exist.

## Exercises

1. Change `App`'s `PROGRAM` constant to a different real G-code string
   and confirm, via a real reload, that both the JSON dump and the 3D
   viewport update to match — proof the whole chain (state → props →
   effect → `drawPath`) still works for a value this lesson didn't
   specifically test.
2. Temporarily remove the `key={containerRef}`... (there is no `key`
   here — instead) remove the `?.` from `viewportRef.current?.
   drawPath(points)`, run `npx tsc --noEmit`, and read the real type
   error explaining why TypeScript requires acknowledging `viewportRef.
   current` could be `null`.
3. Add a `console.log("bootstrap effect ran")` inside `Viewport`'s first
   `useEffect` and reload the page. Confirm, from the browser's own
   console, it logs exactly once per real page load — not once per
   render.

## Definition of Done

- [ ] `cnc-web` has `App.tsx`, `Viewport.tsx`, `main.tsx`; the old
      `main.ts` is deleted.
- [ ] `npx tsc --noEmit` passes with no errors.
- [ ] `npx vitest run` still passes all four `segments.test.ts` tests,
      completely unmodified by this lesson.
- [ ] Opening `http://localhost:5180/` shows the identical visible result
      as Lesson 9 — heading, colored 3D path, raw JSON — now rendered by
      React.
- [ ] You reproduced the wrong-dependency-array bug yourself and saw a
      real second canvas appear, then confirmed the fix restores exactly
      one.
- [ ] You completed Exercises 1–3.
- [ ] A git commit exists explaining *why* (this project is now
      genuinely React, matching the reference app's own real framework,
      with zero changes needed to `viewport.ts`/`segments.ts` — the
      direct payoff of keeping them framework-agnostic since Lesson 8/9).
