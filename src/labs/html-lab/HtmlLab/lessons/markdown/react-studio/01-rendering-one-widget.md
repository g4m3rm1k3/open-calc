# React Studio — Lesson 01 — Rendering One Widget

## What You Will Build

A blank page becomes a page with one rectangle drawn on it — a grey box, positioned
with a specific size, sitting on a plain white canvas. Nothing moves, nothing is
clickable, nothing is stored anywhere yet. The entire point of this lesson is
understanding, precisely, what React does between you writing a description of a
rectangle and a rectangle actually appearing on screen.

---

## What You Need to Know First

Nothing about React. If you have done the [Frontend Client](../frontend-client/README.md)
project in this curriculum, you already know TypeScript, the DOM, and what a browser
does with an HTML file — this lesson builds on that, but does not require it; every
term is still defined at first use.

---

## Before You Begin: Version Control

Exactly as with every project in this curriculum, set up Git before writing a single
file — its value begins immediately, not after something breaks.

**Git** records every change to a project as a named snapshot with a message
explaining why it was taken. A file is always in one of three states: **modified**
(changed, but Git does not know yet), **staged** (marked for the next snapshot via
`git add`), or **committed** (permanently recorded via `git commit`). Run `git init`
once, in this project's own folder — separate from any other project in this
curriculum — to create the hidden `.git/` directory that stores its entire history.

```
git init
```

A commit message should explain *why* a state is worth keeping, not just which files
changed — Git already tracks that automatically. "Add rectangle" describes a file.
"Render the first widget on the canvas" explains what the project can now do.

---

## Concept: Why React Exists

Every DOM manipulation you would do by hand — `document.createElement`,
`.appendChild`, `.textContent = ...` — describes a *sequence of steps* to reach a
result: create this element, then set this property, then attach it here. This is
called **imperative** programming: you specify *how* to get to the result, one
instruction at a time.

React works differently. You describe *what* the UI should look like for a given
set of data, and React figures out which actual DOM operations are needed to make
that true — comparing what you just described against what is currently on screen,
and only touching the parts that actually changed. This is called **declarative**
programming: you specify *what*, not *how*. The mechanism that does this comparison
is explained in lesson 02, the first time something actually changes after the
initial render; for now, understand the difference in kind — you are about to write
a description of a rectangle, not a recipe for drawing one.

---

## Step 1 — Create the Project with Vite

**The problem:** Same as any TypeScript project: a browser cannot run `.tsx` files
directly, and something needs to serve them locally while you work.

```
npm create vite@latest react-studio -- --template react-ts
cd react-studio
npm install
```

**Reading this command:** `npm create vite@latest` fetches and runs Vite's
project-scaffolding tool without installing it permanently. `react-studio` names the
folder it creates. The bare `--` marks everything after it as an argument for Vite's
tool, not for `npm` itself. `--template react-ts` — different from a plain
`vanilla-ts` scaffold — sets up a project with **React** and TypeScript both
pre-configured together: the right compiler settings, the right dependencies
(`react` and `react-dom`), and a starter file structure built around components
instead of a single script.

`npm install` reads the generated `package.json` — the project's manifest, listing
its **dependencies** (packages whose code actually ships to the browser: `react`,
`react-dom`) and **devDependencies** (tools needed only to build and develop:
`typescript`, `vite`) — and downloads every one of them into `node_modules/`, a
folder Vite's generated `.gitignore` already excludes from version control, since it
is fully reproducible from `package.json` by running `npm install` again on any
machine.

### Clean the scaffold

Vite's `react-ts` template includes a demo counter button, a spinning logo, and
default styling — none of it relevant here. Delete `src/assets/react.svg` and
`public/vite.svg`. You will replace `src/App.tsx` and `src/index.css` entirely in
the next steps; leave `src/main.tsx` as Vite generated it for now.

### Run the dev server

```
npm run dev
```

Open the printed `http://localhost:5173/` URL — Vite's default scaffold page still
appears, referencing content you are about to replace. That is expected.

---

## Step 2 — Understand `main.tsx`

**The problem:** Before writing anything new, understand the one file Vite already
gave you that makes React run at all.

Open `src/main.tsx`:

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**Walkthrough:** `import { createRoot } from 'react-dom/client'` — `react-dom` is
the package responsible for connecting React to an actual browser DOM (React itself,
the `react` package, knows nothing about browsers at all — it is also used, unchanged,
to render to mobile apps via React Native and other targets). `createRoot` is the
function that creates a **root**: a connection point between one real DOM element
and a tree of React components React will manage from now on.

`document.getElementById('root')` finds the one DOM element — an empty `<div
id="root"></div>` living in `index.html` — that React will take over completely.
Everything inside it, from this point forward, is React's responsibility; nothing
else should ever modify that element's contents directly. The `!` after it is
TypeScript's **non-null assertion operator** — it tells the compiler "trust me, this
will not be `null`," overriding the type checker's own uncertainty (`getElementById`
can technically return `null`, exactly as explained the first time this project's
sibling, [Frontend Client](../frontend-client/README.md), used it) — acceptable
here specifically because this exact element is hardcoded in this exact project's
own `index.html` and cannot be missing by accident.

`.render(<StrictMode><App /></StrictMode>)` tells the root what to actually display.
`<App />` is **JSX** — explained fully in Step 3 — referring to the `App` component
imported above. `<StrictMode>` is a special component that renders nothing itself;
it exists purely to make React run certain checks twice during development, to help
catch a category of bug (components that behave differently depending on how many
times they run) before it reaches production — it has zero effect on the built,
deployed version of this project.

---

## Step 3 — Write Your First Component

**The problem:** `App.tsx` needs to describe a rectangle — the first real piece of
UI this project renders.

Replace `src/App.tsx` entirely:

```tsx
interface RectangleProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

function Rectangle({ x, y, width, height, color }: RectangleProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        height,
        backgroundColor: color,
      }}
    />
  );
}

function App() {
  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', backgroundColor: '#f4f4f5' }}>
      <Rectangle x={100} y={80} width={200} height={120} color="#60a5fa" />
    </div>
  );
}

export default App;
```

Save. A blue rectangle appears on a light grey background.

**Walkthrough — JSX:** `<div style={{ ... }} />` inside a TypeScript file, written
directly among ordinary code, is **JSX** — a syntax extension that looks like HTML
but is not HTML: it is compiled, before your code ever runs, into plain JavaScript
function calls. `<div style={...} />` compiles, roughly, to `jsx('div', { style:
{...} })` — a call to a React-provided function that produces a plain JavaScript
object *describing* a div, not an actual DOM element. This compiled object is what
people mean by the **virtual DOM**: a lightweight, in-memory description of what the
UI should look like, cheap to create and compare, that React uses to decide what
real DOM operations are actually necessary — the mechanism named in the concept
section above, now named concretely as the thing JSX compiles into.

`double curly braces` in `style={{ ... }}` are two different things stacked: the
outer `{}` is JSX's escape hatch — "the following is a real JavaScript expression,
not literal text" — used here because a component's `style` prop expects a real
JavaScript object, not a string; the inner `{}` is that object itself. `left: x`
uses **property shorthand** — `x` alone, when a variable's name already matches the
property name you want, is shorthand for `x: x`. React's `style` prop, when given a
plain number for a property like `width` or `left`, automatically appends `px` —
`width: 200` becomes `width: 200px` in the actual rendered CSS; a string like `"50%"`
is used as-is.

**Walkthrough — components and props:** `function Rectangle({ x, y, width, height,
color }: RectangleProps)` is a **function component** — an ordinary TypeScript
function, with one rule React relies on: its name starts with a capital letter
(`Rectangle`, not `rectangle`) — this is not just a style convention, it is how JSX
itself tells a built-in HTML tag (`<div>`, lowercase, rendered literally) apart from
a component you wrote (`<Rectangle>`, capitalized, meaning "call this function").

The function's single parameter, destructured directly in the parameter list
(`{ x, y, width, height, color }`), is the component's **props** — short for
"properties": the data a component receives from whatever renders it, exactly the
same way a plain TypeScript function receives arguments, packaged into one object
instead of several positional parameters. `RectangleProps` is a TypeScript
`interface` describing exactly what that object must contain — the same reasoning
[Frontend Client](../frontend-client/README.md) used for typing an API response:
without it, a typo like `witdh` would silently produce `undefined`, caught only by
looking at a broken rectangle on screen instead of a compile error the moment it was
typed.

`<Rectangle x={100} y={80} width={200} height={120} color="#60a5fa" />` is how `App`
uses the component: each attribute becomes one property of the props object passed
into `Rectangle`. Curly braces (`x={100}`) mean "this value is a real number, not a
string"; a plain string like `color="#60a5fa"` needs no braces, exactly like a
regular HTML attribute.

**CS lens — a component is a pure function of its props (for now).** Given the same
`RectangleProps`, `Rectangle` always describes the exact same rectangle — nothing
inside it depends on anything other than the arguments it was handed. This property
— the same input always producing the same output, with no hidden dependency on
anything else — is called **purity**, the same concept named in
[Frontend Client](../frontend-client/README.md) for its own components (there,
"data in, element out"; here, "props in, JSX out"). This stops being strictly true
the moment a component gains its own memory across renders — lesson 02's subject,
`useState` — but understanding the pure, simple case first is what makes the
stateful case make sense as an addition to this, rather than a wholly different
model.

---

## Concept: What `tsconfig.json` Changed for JSX

Vite's `react-ts` template's `tsconfig.app.json` includes a compiler option not
present in a plain TypeScript project:

```json
"jsx": "react-jsx"
```

This tells the TypeScript compiler how to translate JSX syntax into real JavaScript
function calls — `"react-jsx"` specifically means "use React's modern, automatic JSX
transform," which is why `App.tsx` never had to write `import React from 'react'` at
the top, even though JSX compiles into calls to functions React provides: the build
tool inserts that import automatically, behind the scenes, only where JSX is
actually used.

---

## Connect the Pieces

```
src/main.tsx     Creates the one root; mounts <App /> into index.html's #root div
src/App.tsx      Defines Rectangle (a component) and App (the component that uses it)
```

`RectangleProps` and the `Rectangle` component itself are what lesson 02 immediately
builds on: instead of one hardcoded `<Rectangle ... />`, an array of these same
props, rendered many times.

---

## What Breaks Without This

**Without capitalizing `Rectangle`:** Rename the function and its usage to
`rectangle` (lowercase). JSX now treats `<rectangle ... />` as a literal, unknown
HTML tag — React renders it as-is, and the browser silently ignores an element type
it does not recognise, along with every prop you passed it. No rectangle appears,
and no error explains why, because as far as JSX is concerned, nothing was wrong —
you asked for an HTML tag called `rectangle`, and technically got exactly that.

**Without the `RectangleProps` interface (letting props be inferred as `any`):**
Typo `height` as `hieght` in the JSX call. Nothing catches it — `Rectangle` receives
`height: undefined`, and React silently renders `height: undefinedpx`, which is
invalid CSS the browser simply ignores, producing a rectangle with no visible
height at all, with no error at any point in the process.

---

## Definition of Done

- [ ] `npm run dev` runs with no errors and shows a blue rectangle on a grey background
- [ ] `Rectangle` is defined with a typed `RectangleProps` interface
- [ ] You can explain the difference between imperative and declarative UI code
- [ ] You can explain what JSX compiles into, and why the virtual DOM is "lightweight" compared to the real DOM
- [ ] You can explain what props are and why they are passed as one object instead of several arguments
- [ ] You can explain why a component's name must start with a capital letter
- [ ] Run:
      ```
      git add src/App.tsx src/main.tsx
      git commit -m "Render the first widget: a single rectangle described with JSX and typed props"
      ```

---

*Next: Lesson 02 — A Canvas of Widgets. One hardcoded rectangle becomes ten,
generated from an array — the first time this project actually needs `useState`,
and the first time React's rendering model has to do real comparison work instead
of rendering once and stopping.*
