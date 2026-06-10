# FlowBoard Masterclass — Concept Registry

**Purpose:** Every concept formally taught in this series is logged here the moment its lab is completed. "Formally taught" means it received a full Concept Block in a lab — not a passing mention in a comment or a name in a list.

**Before writing a lab:** Read this file. If a concept appears here, do NOT write a concept block for it. Write: *"First taught in LAB-[NN] — [name]. See registry."*

**After completing a lab:** Add every concept block from that lab to this file in the format below.

**If a concept name here differs from a name in a lab:** That is drift. Fix the lab name to match the registry, then update this file.

---

## Registry Format

```
### [Canonical Concept Name]
**First taught:** LAB-[NN] — [Lab Title]
**Category:** Language | CSS | Pattern | DB | React | SE | HTTP | Testing
**One-line definition:** [exact definition as written in the lab]
**Depends on:** [concepts from this registry that must be known first, or "none"]
```

---

## Concepts Taught

### Node.js
**First taught:** LAB-00 — Setup: From Zero to Running App  
**Category:** SE  
**One-line definition:** A program that runs JavaScript on your computer outside the browser, enabling build tools like Vite and package managers like npm to work.  
**Depends on:** none

---

### npm (Node Package Manager)
**First taught:** LAB-00 — Setup: From Zero to Running App  
**Category:** SE  
**One-line definition:** A tool that installs and manages the external libraries a project depends on, driven by `package.json`, and provides scripts like `npm run dev`.  
**Depends on:** Node.js

---

### Vite
**First taught:** LAB-00 — Setup: From Zero to Running App  
**Category:** SE  
**One-line definition:** A development server and build tool that converts TypeScript and JSX to browser-readable JavaScript and serves it at `http://localhost:5173` with Hot Module Replacement.  
**Depends on:** Node.js, npm

---

### localhost and ports
**First taught:** LAB-00 — Setup: From Zero to Running App  
**Category:** SE  
**One-line definition:** `localhost` is a hostname that always means "this machine"; a port is a numbered door on that machine that a server process listens on — `localhost:5173` means the server at door 5173 on this machine.  
**Depends on:** none

---

### Single Page Application (SPA)
**First taught:** LAB-00 — Setup: From Zero to Running App  
**Category:** SE  
**One-line definition:** A web app that loads one HTML page once and updates visible content via JavaScript without ever reloading the page.  
**Depends on:** none

---

### JSX (JavaScript XML)
**First taught:** LAB-00 — Setup: From Zero to Running App  
**Category:** React  
**One-line definition:** A syntax extension that lets you write HTML-like tags inside TypeScript functions; Vite compiles it to `React.createElement()` calls before the browser sees it.  
**Depends on:** Vite

---

### Project file structure and execution path
**First taught:** LAB-00 — Setup: From Zero to Running App  
**Category:** SE  
**One-line definition:** The rule that application code lives in `src/`, configuration at the root, and the path `index.html → main.tsx → App.tsx → DOM` describes how a URL becomes a running React app.  
**Depends on:** Node.js, npm, Vite, SPA


### React Component
**First taught:** LAB-01 — Project Setup  
**Category:** React  
**Canonical name used in series:** React Component (or just Component when context is clear)  
**One-line definition:** A function that accepts data as input and returns JSX describing what should appear on screen; the fundamental unit of a React UI.  
**Depends on:** JSX, TypeScript  
**Pattern category:** Non-GoF  
**Official name:** Component Pattern

---

### `export default`
**First taught:** LAB-01 — Project Setup  
**Category:** Language  
**Canonical name used in series:** `export default`  
**One-line definition:** A TypeScript/JavaScript keyword that makes a file's primary value available to other files that `import` it.  
**Depends on:** TypeScript

---

### `className` (JSX attribute)
**First taught:** LAB-01 — Project Setup  
**Category:** React  
**Canonical name used in series:** `className`  
**One-line definition:** The JSX equivalent of HTML's `class` attribute — used to apply CSS classes to elements; `class` is reserved in JavaScript so JSX uses `className` instead.  
**Depends on:** JSX

---

## Naming Decisions Log

When a term has multiple valid names and we chose one, record the decision here so it never drifts.

| Canonical name used | Rejected alternatives | Reason for choice |
|---|---|---|
| React Component | "function component", "functional component" | "React Component" is the generic term; qualifier added only when contrasting with class components |
| `className` | "class attribute", "CSS class" | `className` is the JSX attribute name — using the exact code term prevents confusion |

---

### Component Composition
**First taught:** LAB-02 — The Card Component  
**Category:** React  
**Canonical name used in series:** Component composition  
**One-line definition:** Placing one component inside another component's JSX — the same way you nest HTML elements — to build a UI out of smaller, focused pieces.  
**Depends on:** React Component, JSX  
**What it hides:** The internal structure of each component from the components that use it. The invariant: changing a component's internals never requires changes in the components that use it.

---

### Importing CSS into a React Component
**First taught:** LAB-02 — The Card Component  
**Category:** React  
**Canonical name used in series:** Importing CSS (plain import)  
**One-line definition:** Adding `import './Component.css'` at the top of a `.tsx` file tells Vite to load those CSS rules into the page when the component is used.  
**Depends on:** Vite, React Component

---

### The CSS Box Model
**First taught:** LAB-02 — The Card Component  
**Category:** CSS  
**Canonical name used in series:** CSS Box Model  
**One-line definition:** The system describing the four layers of space around every HTML element: content, padding, border, and margin — from innermost to outermost.  
**Depends on:** *(none)*

---

### `padding`
**First taught:** LAB-02 — The Card Component  
**Category:** CSS  
**Canonical name used in series:** `padding`  
**One-line definition:** Space between an element's content and its border (or edge); it is inside the box and increases the element's visual size.  
**Depends on:** CSS Box Model

---

### `border-radius`
**First taught:** LAB-02 — The Card Component  
**Category:** CSS  
**Canonical name used in series:** `border-radius`  
**One-line definition:** Curves the corners of an element's box; applies to the background-color region even when no visible border exists.  
**Depends on:** CSS Box Model

---

### `box-shadow`
**First taught:** LAB-02 — The Card Component  
**Category:** CSS  
**Canonical name used in series:** `box-shadow`  
**One-line definition:** Draws one or more shadows behind an element using offset-x, offset-y, blur-radius, spread-radius, and color values; creates the illusion of elevation.  
**Depends on:** CSS Box Model, `rgba()`

---

### `rgba()`
**First taught:** LAB-02 — The Card Component  
**Category:** CSS  
**Canonical name used in series:** `rgba()`  
**One-line definition:** A CSS color function with four values — red, green, blue (0–255), and alpha (0–1 opacity) — used when a color needs to be partially transparent.  
**Depends on:** *(none)*

---

### `border` (shorthand)
**First taught:** LAB-02 — The Card Component  
**Category:** CSS  
**Canonical name used in series:** `border`  
**One-line definition:** A shorthand property that sets an element's border thickness, style, and color in one declaration: `border: 1px solid #e0e0e0`.  
**Depends on:** CSS Box Model

---

### `width`
**First taught:** LAB-02 — The Card Component  
**Category:** CSS  
**Canonical name used in series:** `width`  
**One-line definition:** Sets the horizontal size of an element's content box; overrides the default block-level behavior of expanding to fill the parent.  
**Depends on:** CSS Box Model

---

### TypeScript `interface`
**First taught:** LAB-03 — Card Props  
**Category:** Language  
**Canonical name used in series:** `interface`  
**One-line definition:** A TypeScript declaration that names the shape of an object — its property names and the type of each value; erased completely before the browser runs the code.  
**Depends on:** TypeScript  
**What it hides:** The need to re-check what fields an object has at every use site. The invariant: anywhere a typed value is expected, TypeScript guarantees it has exactly the declared fields at the declared types.

---

### Props
**First taught:** LAB-03 — Card Props  
**Category:** React  
**Canonical name used in series:** props  
**One-line definition:** Values passed from a parent component into a child component via JSX attributes — the same way arguments are passed into a function.  
**Depends on:** React Component, JSX, `interface`  
**What it hides:** The internal structure of a component from the components that use it. The invariant: data flows one direction only — parent to child — making data movement predictable.

---

### JSX Expression Syntax `{}`
**First taught:** LAB-03 — Card Props  
**Category:** React  
**Canonical name used in series:** JSX expression (`{}`)  
**One-line definition:** Curly braces inside JSX switch from text mode to JavaScript expression mode — `{props.title}` evaluates `props.title` and inserts the result; without braces, JSX renders the literal text "props.title".  
**Depends on:** JSX

---

### Array `.map()` for Rendering Lists
**First taught:** LAB-03 — Card Props  
**Category:** Language  
**Canonical name used in series:** `.map()`  
**One-line definition:** A JavaScript array method that calls a function once per item and returns a new array of the results; in React used to transform an array of data objects into an array of JSX elements.  
**Depends on:** JSX Expression (`{}`), props

---

### The `key` Prop
**First taught:** LAB-03 — Card Props  
**Category:** React  
**Canonical name used in series:** `key` prop  
**One-line definition:** A special React prop — a unique string or number — that must be added to every element produced inside a `.map()` so React can track elements across re-renders without destroying and recreating them.  
**Depends on:** `.map()`, props

---

### Conditional Rendering with `&&`
**First taught:** LAB-03 — Card Props  
**Category:** React  
**Canonical name used in series:** conditional rendering (`&&`)  
**One-line definition:** `{condition && <Element />}` inside JSX renders the element only when the condition is truthy; when falsy (undefined, null, false), nothing renders.  
**Depends on:** JSX Expression (`{}`), props

---

## Concept Count by Lab

| Lab | Concepts introduced | Registry updated |
|---|---|---|
| LAB-01 | 9 | ✅ May 9, 2026 |
| LAB-02 | 9 | ✅ May 11, 2026 |
| LAB-03 | 6 | ✅ May 11, 2026 |
