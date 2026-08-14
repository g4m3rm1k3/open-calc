# Concept: Mounting a React App (`createRoot`)

**What you'll understand by the end:** the one real connection point where a React application takes over a real part of a web page, and what happens on either side of that boundary.

**Prerequisites:** `jsx-syntax.md`, `dom-query-selector.md`.

## Setup

A React project, with `react` and `react-dom` installed (e.g. via `npm create vite@latest my-app -- --template react-ts`).

## The Problem

Everything a React component describes (via JSX — see `jsx-syntax.md`) is, at its core, just data: a description of desired UI, not an actual change to the page. Something has to take that description and a real, existing DOM node, and be the one place responsible for making React's description actually show up as real, live HTML.

## The Isolated Example

`index.html`:
```html
<!doctype html>
<html>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`main.tsx`:
```tsx
import { createRoot } from "react-dom/client";

function App() {
  return <h1>Hello from React</h1>;
}

const container = document.querySelector<HTMLDivElement>("#root")!;
createRoot(container).render(<App />);
```

**Real, inspected DOM before this script runs:**
```html
<div id="root"></div>
```

**Real, inspected DOM after it runs:**
```html
<div id="root"><h1>Hello from React</h1></div>
```

**What this proves:** the `<div id="root">` genuinely existed, empty, in the raw HTML file — React did not write any of the visible UI into the HTML file itself; it found that one real, existing element at runtime and inserted its rendered output *inside* it, entirely from JavaScript.

## Mechanical Walkthrough

- `document.querySelector<HTMLDivElement>("#root")!` — an ordinary DOM lookup (see `dom-query-selector.md`), finding the one real element React will take control of; the non-null assertion (`!`) asserts this element genuinely exists in the real HTML file, which it does, by construction, since this project's own `index.html` defines it.
- `createRoot(container)` creates React's internal connection to that specific DOM node — this is the one place, in an entire React application, where React is explicitly told "this real part of the page is yours to manage."
- `.render(<App />)` hands React a JSX description (see `jsx-syntax.md`) of what should appear inside that root, and React takes over from there — converting the description into real DOM elements, and, on any future re-render (triggered by `react-usestate-hook.md`'s state changes anywhere in the tree), efficiently updating only what actually changed rather than rebuilding everything from scratch.
- Everything *outside* `<div id="root">` — the rest of `index.html`'s structure, the `<head>`, any other real HTML — is completely untouched by React; React's control is strictly scoped to the one node it was given.

## CS Lens

This is a **mount point** — the explicit boundary between a framework's internally-managed world and the surrounding environment it was handed control of a piece of. Every UI framework with this general shape (managing a subtree of the DOM, rather than the whole page) has some equivalent concept: one real, explicit call that says "start managing from here."

Also recognized in: Vue's own `createApp(App).mount("#app")` (a near-identical shape, different framework), Angular's bootstrap process, and, more generally, any embedded interpreter or engine that's handed control of one specific region of a larger host environment (an embedded scripting engine given control of one game object, for instance) rather than the entire host.

## SE Lens

Keeping this mount call as the *one* place a project bridges from "plain HTML" to "React-managed" makes the boundary explicit and easy to find — everything below that one call is React's responsibility, managed declaratively; everything outside it is ordinary, unmanaged HTML. A project with React `render` calls scattered across many different files/points, mounting into many different elements, makes this boundary far harder to reason about — the deliberate, singular nature of the mount point in a typical single-page app is itself a real design choice, not an accident.

## Connection

Builds on `jsx-syntax.md` and `dom-query-selector.md`. This is the concrete, real replacement for every prior lesson's individual `document.getElementById(...).textContent = ...` calls — from this point forward, all of a page's dynamic content flows through this one render call and React's own re-rendering, rather than many separate, manual DOM-mutation call sites.

## Try It Yourself

1. Add a second, sibling `<div id="root2">` in `index.html` and a second `createRoot(...).render(...)` call targeting it with a different component — confirming a page genuinely can have more than one independently-managed React root, even though most single-page apps use exactly one.
2. Remove the `<div id="root">` from `index.html` entirely and observe the real error `document.querySelector` (or the `!` assertion) produces — confirming the mount point is a real, required element that must exist in the raw HTML before this script can succeed.
3. Add an element *outside* `<div id="root">` in the raw HTML (a `<footer>`, for instance) and confirm React's rendering has no effect on it whatsoever, no matter what state changes inside the React-managed tree — direct proof that React's control is strictly scoped to what it was explicitly mounted into.
