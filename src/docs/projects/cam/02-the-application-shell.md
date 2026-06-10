# CAD/CAM — Lesson 02 — The Application Shell

## What You Will Build

The Three.js viewport from lesson 01 is now surrounded by a complete application
shell: a toolbar across the top, a status bar across the bottom, a tool panel on
the left, and a properties panel on the right. All four frame the viewport without
overlapping it. The panels contain placeholder text. The viewport continues to orbit,
pan, and zoom exactly as before. React is introduced as the component model for all
UI outside the Three.js canvas.

## What You Need to Know First

Lesson 01 — The 3D Viewport. The `cam-project` directory with `package.json`,
`tsconfig.json`, `vite.config.ts`, `index.html`, and `src/main.ts` must already
exist and the viewport must be running.

---

## The Problem

The application shell — toolbar, status bar, and panels — involves rendering many
elements from data, responding to user interactions, and keeping the UI consistent
with application state. If we build all of this with vanilla DOM calls
(`document.createElement`, `element.appendChild`, `element.addEventListener`), we
face a structural problem that will grow with every lesson.

Consider: the toolbar will eventually have mode buttons (sketch mode, 3D mode, select
mode), which need to respond to clicks and show the active mode. The properties panel
will show the properties of whatever is selected. The status bar will show the cursor
position and current operation. Each of these elements needs to update when application
state changes.

With vanilla DOM, updating the UI when state changes means writing imperative code:
find the element, read its current content, compare it to the new content, update
it if different. For five elements this is manageable. For fifty — which is what
a real CAD application has — it becomes a maintenance problem. You can never be sure
you updated every element, and bugs from stale UI are hard to track down.

**React solves this problem.** In React, you describe *what the UI should look like
given the current state*. React figures out which parts of the DOM need updating and
does the minimal necessary changes. The shift is from "tell the DOM what to do" to
"describe what the result should be."

This is the right moment to introduce React. The shell has enough elements that the
component model provides immediate, visible benefit. Every lesson after this one builds
new UI into the component tree — the investment pays off starting now.

---

## Step 1 — What React Is and How It Works

### Declarative vs imperative rendering

**Imperative** rendering: you manipulate the DOM directly.

```javascript
// Imperative — you tell the browser what to do step by step
const button = document.createElement('button')
button.textContent = 'Sketch Mode'
button.className = 'toolbar-btn active'
button.addEventListener('click', () => activateSketchMode())
toolbar.appendChild(button)
```

**Declarative** rendering: you describe the desired result. React handles the DOM.

```tsx
// Declarative — you describe what the UI should look like
<button className="toolbar-btn active" onClick={activateSketchMode}>
  Sketch Mode
</button>
```

The declarative version reads like the intent. It does not describe the steps to
build a button — it describes a button. When the active mode changes, you change
`active` to `''` and React updates the DOM. You do not manage the transition.

**CS lens — declarative programming:**
Declarative programming describes *what* the result should be without specifying
*how* to produce it. SQL is declarative: `SELECT name FROM users WHERE age > 21`
describes the desired data, not the algorithm to find it. CSS is declarative: you
describe element appearance, not how the browser should paint pixels. React's JSX
is declarative UI: you describe the element tree, not the DOM operations to build it.

Imperative programming describes *how* to achieve the result step by step. DOM APIs
are imperative. Assembly language is imperative. Loop bodies are imperative.

Neither is universally superior — the correct choice depends on the problem.
React's declarative model is correct for managing complex UI state with many
interdependencies. Three.js's imperative model is correct for managing a GPU
draw call pipeline where you need precise control.

### Components

A React **component** is a function that returns a description of UI. That description
uses **JSX** — a syntax extension that lets you write HTML-like tags inside JavaScript.

```tsx
function Toolbar(): JSX.Element {
  return (
    <div className="toolbar">
      <span>CAM Project</span>
    </div>
  )
}
```

`Toolbar` is a function. `<div className="toolbar">` is JSX — it compiles to a
call to `React.createElement('div', { className: 'toolbar' }, ...)`. The compiled
output creates a description of the DOM element, not the element itself. React
uses this description to produce and update actual DOM nodes efficiently.

**SE lens — components as the unit of UI:**
A component is the UI equivalent of a function: it has one job, it is reusable, and
it can be composed with other components. Just as lesson 01 had separate modules for
orbit controls and the grid helper, lesson 02 has separate components for the toolbar,
panels, and viewport. Each can be changed independently. The shell layout does not
know what the toolbar contains; the toolbar does not know the layout exists.

---

## Step 2 — Install React

### Add the packages

Stop the dev server (Ctrl+C in the terminal). Run:

```
npm install react react-dom
npm install --save-dev @types/react @types/react-dom @vitejs/plugin-react
```

**`react`** — the React library itself. Contains the component model, hooks, and
the reconciler that computes the minimal DOM changes needed to match the latest
description.

**`react-dom`** — React's renderer for web browsers. React's core is
renderer-agnostic (the same React code can render to a DOM, to a native mobile app
via React Native, or to a static string for server-side rendering). `react-dom`
specifically produces browser DOM operations.

**`@types/react` and `@types/react-dom`** — TypeScript type definitions for both
packages. They are `devDependencies` because types are only needed at compile time,
not at runtime. Without them, TypeScript would not know the types of `useState`,
`useRef`, `useEffect`, or any JSX element.

**`@vitejs/plugin-react`** — a Vite plugin that transforms JSX syntax to JavaScript
calls at compile time. Vite does not understand JSX on its own — the plugin teaches
it to. This is a `devDependency` because it is only needed during development and
build, not at runtime.

**After running both commands, `package.json` should show:**
```json
{
  "dependencies": {
    "react":     "^18.3.0",
    "react-dom": "^18.3.0",
    "three":     "^0.165.0"
  },
  "devDependencies": {
    "@types/react":         "^18.3.0",
    "@types/react-dom":     "^18.3.0",
    "@types/node":          "^20.0.0",
    "@vitejs/plugin-react": "^4.3.0",
    "typescript":           "^5.4.0",
    "vite":                 "^5.3.0",
    "vitest":               "^1.6.0"
  }
}
```

The versions shown are approximate — `npm install` installs the latest compatible
versions. The `^` prefix ensures patch and minor updates are installed automatically
while preventing breaking major version changes.

---

## Step 3 — Configure Vite and TypeScript for React

### Update `vite.config.ts`

React's JSX syntax requires the `@vitejs/plugin-react` plugin to be registered with
Vite. Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react           from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server:  { port: 5174 },
})
```

**`import react from '@vitejs/plugin-react'`:**
`@vitejs/plugin-react` exports a default function that creates the plugin instance.
The function is called with no arguments here (`react()`) because default options
are correct. The plugin does two things: it transforms `.tsx` and `.jsx` files by
compiling JSX to `React.createElement` calls, and it enables React Fast Refresh —
a feature where editing a React component live-reloads only that component without
losing other state.

**`plugins: [react()]`:**
`defineConfig`'s `plugins` array accepts an array of Vite plugins. Vite runs plugins
in order — here there is only one. Plugins can transform files, inject code, add
virtual modules, or modify the bundle. `react()` specifically adds the JSX
transformation step to the build pipeline.

### Update `tsconfig.json`

Add the JSX compiler option:

```json
{
  "compilerOptions": {
    "target":           "ES2022",
    "module":           "ESNext",
    "moduleResolution": "bundler",
    "strict":           true,
    "noUnusedLocals":   true,
    "noUnusedParameters": true,
    "lib":              ["ES2022", "DOM", "DOM.Iterable"],
    "jsx":              "react-jsx"
  },
  "include": ["src"]
}
```

**`"jsx": "react-jsx"` — first appearance:**
This tells the TypeScript compiler how to handle JSX syntax in `.tsx` files.
`"react-jsx"` uses the modern JSX transform introduced in React 17 — it automatically
imports the JSX runtime, so you do not need to write `import React from 'react'` at
the top of every component file. The older value `"react"` required that explicit
import; `"react-jsx"` eliminates it.

Without this setting, TypeScript would report a parse error on every `<` character
in JSX — it would not understand that `<div>` is JSX syntax.

---

## Step 4 — Extract Three.js into Its Own Module

### The problem

`src/main.ts` currently contains both the Three.js initialisation code and the
entry point of the application. When React takes over as the entry point (in step 5),
Three.js initialisation must be called from a React component. This requires
separating Three.js code into its own module so it can be imported and called
from anywhere.

### Create `src/viewport/viewport.ts`

Create a new directory `src/viewport/` and a file `src/viewport/viewport.ts`:

```typescript
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
```

**Why `src/viewport/`:**
The viewport is a sub-system with multiple responsibilities that will grow. In future
lessons it will contain the raycaster (lesson 05), the grid renderer (lesson 11),
and the sketch plane overlay (lesson 06). Grouping them in a directory keeps the
root `src/` readable. A directory named `viewport/` communicates that everything
inside is concerned with the 3D rendering layer.

```typescript
export interface ViewportInstance {
  renderer:      THREE.WebGLRenderer
  scene:         THREE.Scene
  camera:        THREE.PerspectiveCamera
  orbitControls: OrbitControls
  animate:       () => void
  dispose:       () => void
}
```

**`interface ViewportInstance` — what it is and why:**
`ViewportInstance` is a TypeScript interface describing the object returned by
`initViewport`. It is an **output contract** — callers who create a viewport
receive this exact shape and can use any of these properties.

Exporting these properties individually (instead of keeping them inside a closure)
means future code can add objects to the scene, change the camera, or pause animation
without knowing how the viewport was initialised. The viewport components in React
will need `scene` to add meshes; the sketch mode (lesson 06) will need `camera`
and `orbitControls` to lock the view.

```typescript
export function initViewport(container: HTMLElement): ViewportInstance {
  const scene    = new THREE.Scene()
  const camera   = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000,
  )
  camera.position.set(10, 8, 10)
  camera.lookAt(0, 0, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setClearColor(0x0f172a)
  container.appendChild(renderer.domElement)

  const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b)
  scene.add(gridHelper)

  const orbitControls = new OrbitControls(camera, renderer.domElement)
  orbitControls.enableDamping = true
  orbitControls.dampingFactor = 0.05
  orbitControls.minDistance   = 1
  orbitControls.maxDistance   = 200
  orbitControls.maxPolarAngle = Math.PI / 2

  let animationFrameId = 0

  function animate(): void {
    animationFrameId = requestAnimationFrame(animate)
    orbitControls.update()
    renderer.render(scene, camera)
  }

  function handleResize(): void {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }

  window.addEventListener('resize', handleResize)

  function dispose(): void {
    cancelAnimationFrame(animationFrameId)
    window.removeEventListener('resize', handleResize)
    renderer.dispose()
  }

  return { renderer, scene, camera, orbitControls, animate, dispose }
}
```

**Changes from lesson 01's `main.ts`:**

`container.clientWidth / container.clientHeight` — instead of `window.innerWidth /
window.innerHeight`, the camera and renderer use the container element's dimensions.
`container.clientWidth` is the width of the container in CSS pixels. Using the
container's size (not the window size) means the renderer fills exactly the space
React allocates for it, regardless of panel widths.

**`let animationFrameId = 0`:**
`requestAnimationFrame` returns a numeric ID. `cancelAnimationFrame(id)` uses this
ID to cancel the scheduled callback — stopping the animation loop. In lesson 01 we
never needed to stop the loop. In lesson 02 and beyond, React components unmount
(are removed from the DOM). When the viewport component unmounts, the animation
loop must stop. If it does not stop, it keeps running in the background, keeps
holding references to the renderer and scene, and prevents garbage collection —
a **memory leak**.

**`dispose(): void`:**
The `dispose` function cancels the animation loop, removes the resize event listener,
and calls `renderer.dispose()`. `renderer.dispose()` releases all GPU memory allocated
by Three.js — textures, geometry buffers, shaders. In lesson 01 this did not matter
because the page was never reloaded. In a component-based application where viewports
can be created and destroyed, proper cleanup is essential.

**SE lens — resource lifecycle:**
`initViewport` allocates resources (GPU memory, event listeners, an animation loop).
`dispose` releases them in the reverse order of allocation. This is the
**RAII (Resource Acquisition Is Initialisation)** pattern common in C++ and adapted
here: the object that creates a resource is responsible for releasing it. The caller
(the React component) must call `dispose` when it is done with the viewport.

**Walkthrough — calling `initViewport(container)`:**

```
1. container = <div> (the DOM element React rendered for the viewport)
2. scene = new THREE.Scene() — empty root node
3. camera = PerspectiveCamera with container's aspect ratio
4. renderer created, canvas appended to container
5. GridHelper added to scene
6. OrbitControls attached to camera and canvas
7. animationFrameId = 0 initially
8. animate() function closes over scene, camera, renderer, orbitControls
9. handleResize() function closes over camera, renderer, container
10. Returns { renderer, scene, camera, orbitControls, animate, dispose }
```

After this call, `animate()` must be called once to start the loop. This is
deliberate — the caller decides when animation starts, not `initViewport`.

---

## Step 5 — The React Entry Point

### Update `index.html`

Replace the contents of `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CAM Project</title>
    <link rel="stylesheet" href="/src/style.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**What changed:**
`<div id="viewport-container">` is replaced by `<div id="root">`. `"root"` is
the conventional name for the single HTML element that React takes over and fills
with its component tree. React will render the entire application — toolbar, panels,
and the viewport container — inside this one `<div>`. The file is renamed from
`main.ts` to `main.tsx` because it will contain JSX syntax.

### Create `src/main.tsx`

Rename or replace `src/main.ts` with `src/main.tsx`:

```tsx
import { StrictMode }   from 'react'
import { createRoot }   from 'react-dom/client'
import { App }          from './App.js'
```

**Import explanation:**
`import { StrictMode } from 'react'` — `react` is the React core library (installed
in step 2). `StrictMode` is a React component that enables additional safety checks
during development. It renders each component twice (only in development) to detect
side effects that should not exist. This catches common React bugs before they reach
production.

`import { createRoot } from 'react-dom/client'` — `react-dom/client` is the browser
renderer subpath of the `react-dom` package (installed in step 2). `createRoot` is
the React 18+ API for initialising a React application in a DOM element. It replaces
the older `ReactDOM.render` from React 17.

`import { App } from './App.js'` — `App.tsx` is the file created in step 6 below.
It exports the `App` component — the root of the application's component tree. The
`.js` extension in the import path is required even though the file is `.tsx`. This
is a quirk of TypeScript's module resolution: TypeScript compiles `.tsx` to `.js`,
so the import path must reference the compiled output name. Vite's `"moduleResolution": "bundler"` handles the actual file resolution correctly.

```tsx
const rootElement = document.getElementById('root')
if (rootElement === null) {
  throw new Error('Root element not found — check that index.html has <div id="root">')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

**`createRoot(element)`:**
`createRoot` takes a DOM element and returns a React root — the object that controls
React's rendering into that element. Calling `.render(<App />)` tells React to
render the `App` component tree inside `rootElement`. React takes ownership of the
element's contents from this point: anything inside `#root` is managed by React.

**`<StrictMode>`:**
Wrapping the application in `StrictMode` enables React's development safety checks.
In production builds, `StrictMode` is removed — it adds zero overhead in production.
Always wrap the root with `StrictMode` during development.

---

## Step 6 — CSS: The Shell Layout

### The problem

The shell has five regions: toolbar (top), tool panel (left), viewport (centre),
properties panel (right), and status bar (bottom). These regions must be fixed in
position and size — the viewport fills whatever space the panels do not occupy.

CSS Grid is the correct tool for a fixed multi-region layout.

### Update `src/style.css`

```css
:root {
  --colour-background:    #0f172a;
  --colour-surface:       #1e293b;
  --colour-surface-raised:#334155;
  --colour-border:        #475569;
  --colour-grid-major:    #334155;
  --colour-grid-minor:    #1e293b;
  --colour-text:          #e2e8f0;
  --colour-text-muted:    #94a3b8;
  --colour-accent:        #38bdf8;

  --height-toolbar:       48px;
  --height-status-bar:    28px;
  --width-tool-panel:     200px;
  --width-properties-panel: 240px;

  --font-ui:              'Inter', system-ui, sans-serif;
  --font-mono:            'JetBrains Mono', 'Cascadia Code', monospace;
  --font-size-ui:         13px;
  --font-size-label:      11px;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin:     0;
  padding:    0;
}

html,
body,
#root {
  width:      100%;
  height:     100%;
  overflow:   hidden;
}

body {
  background-color: var(--colour-background);
  font-family:      var(--font-ui);
  font-size:        var(--font-size-ui);
  color:            var(--colour-text);
}

/* ── Application shell ──────────────────────────────────────────────────────── */

.app-shell {
  display:               grid;
  grid-template-columns: var(--width-tool-panel) 1fr var(--width-properties-panel);
  grid-template-rows:    var(--height-toolbar) 1fr var(--height-status-bar);
  grid-template-areas:
    "toolbar    toolbar     toolbar"
    "tool-panel viewport    props-panel"
    "status-bar status-bar  status-bar";
  width:  100%;
  height: 100%;
}

/* ── Toolbar ────────────────────────────────────────────────────────────────── */

.toolbar {
  grid-area:        toolbar;
  background-color: var(--colour-surface);
  border-bottom:    1px solid var(--colour-border);
  display:          flex;
  align-items:      center;
  padding:          0 var(--space-md, 12px);
  gap:              var(--space-sm, 8px);
}

.toolbar-title {
  font-size:   var(--font-size-ui);
  font-weight: 600;
  color:       var(--colour-text);
  margin-right: auto;
}

/* ── Side panels ────────────────────────────────────────────────────────────── */

.tool-panel,
.properties-panel {
  background-color: var(--colour-surface);
  border-right:     1px solid var(--colour-border);
  overflow-y:       auto;
  padding:          12px;
}

.tool-panel {
  grid-area: tool-panel;
}

.properties-panel {
  grid-area:    props-panel;
  border-right: none;
  border-left:  1px solid var(--colour-border);
}

.panel-section-title {
  font-size:     var(--font-size-label);
  font-weight:   600;
  color:         var(--colour-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

/* ── Viewport ───────────────────────────────────────────────────────────────── */

.viewport-wrapper {
  grid-area: viewport;
  position:  relative;
  overflow:  hidden;
  background-color: var(--colour-background);
}

/* ── Status bar ─────────────────────────────────────────────────────────────── */

.status-bar {
  grid-area:        status-bar;
  background-color: var(--colour-surface);
  border-top:       1px solid var(--colour-border);
  display:          flex;
  align-items:      center;
  padding:          0 12px;
  gap:              16px;
  font-size:        var(--font-size-label);
  color:            var(--colour-text-muted);
  font-family:      var(--font-mono);
}
```

**CSS Grid — first appearance:**
`display: grid` turns an element into a **CSS Grid container**. Its children become
**grid items** placed according to rows and columns you define.

`grid-template-columns: var(--width-tool-panel) 1fr var(--width-properties-panel)` —
defines three columns: the left tool panel (fixed 200px), the centre viewport
(`1fr` — one fractional unit, meaning "take all remaining space"), and the right
properties panel (fixed 240px). The `fr` unit distributes available space after
fixed-size columns are allocated. `1fr` in the centre means the viewport expands to
fill all space not consumed by the panels.

`grid-template-rows: var(--height-toolbar) 1fr var(--height-status-bar)` — three
rows: fixed toolbar (48px), flexible viewport row (`1fr`), fixed status bar (28px).

`grid-template-areas` — names each cell of the grid. `"toolbar toolbar toolbar"` means
the first row spans all three columns and is named `"toolbar"`. `grid-area: toolbar`
on a child element places it in this named region. Named areas make the layout intent
readable — the grid definition reads like a diagram of the screen.

**`1fr` explained geometrically:**
With the layout `200px 1fr 240px`, the browser computes:
1. Total available width (e.g., 1200px)
2. Subtract fixed columns: `1200 - 200 - 240 = 760px`
3. Distribute remaining space proportionally: `1fr` = 760px

If there were two `1fr` columns, each would get 380px. `2fr` and `1fr` would split
760px as 507px and 253px.

**`position: relative` on `.viewport-wrapper`:**
The viewport wrapper needs `position: relative` so that absolutely-positioned overlays
(sketch mode controls in lesson 06, crosshair cursor in lesson 09) can position
themselves relative to the viewport boundaries. Without `position: relative`, absolute
children position relative to the nearest positioned ancestor — which might be the
`<body>` — and appear in the wrong place.

---

## Step 7 — The App Component

### Create `src/App.tsx`

```tsx
import { Toolbar }           from './components/Toolbar.js'
import { ToolPanel }         from './components/ToolPanel.js'
import { PropertiesPanel }   from './components/PropertiesPanel.js'
import { StatusBar }         from './components/StatusBar.js'
import { ViewportComponent } from './components/ViewportComponent.js'
```

**Import explanation:**
Each import is from a component file (created in step 8 and 9). `App.tsx` knows
about all the components it assembles but knows nothing about how each component
works internally. This is the **composition pattern**: `App` composes smaller
components. Changing what the toolbar contains does not require changing `App.tsx`.

```tsx
export function App(): JSX.Element {
  return (
    <div className="app-shell">
      <Toolbar />
      <ToolPanel />
      <ViewportComponent />
      <PropertiesPanel />
      <StatusBar />
    </div>
  )
}
```

**JSX — first appearance:**
JSX is a syntax extension for JavaScript/TypeScript that allows writing HTML-like
markup inside code. `<div className="app-shell">` is JSX. It is NOT HTML — it
compiles to:
```javascript
React.createElement('div', { className: 'app-shell' }, ...)
```

JSX uses `className` (not `class`) because `class` is a reserved keyword in
JavaScript. Every HTML attribute used in JSX follows the same rule — use the
JavaScript/TypeScript equivalent name.

JSX elements must be closed: `<Component />` for self-closing or `<Component>...</Component>`
for elements with children. Unlike HTML where some elements like `<br>` can be
unclosed, JSX requires every element to be explicitly closed.

**`JSX.Element` as a return type:**
`(): JSX.Element` declares that `App` returns a JSX element. `JSX.Element` is the
TypeScript type for any React element (a div, a custom component, a fragment).
TypeScript requires return type annotations here for clarity.

**Walkthrough — what `App` returns:**
`App()` returns a description of a `<div class="app-shell">` containing five
children: `Toolbar`, `ToolPanel`, `ViewportComponent`, `PropertiesPanel`, and
`StatusBar`. React renders these five components inside the `#root` div. The CSS
Grid on `.app-shell` places each component in its named grid area based on the
`grid-area` CSS property on each component's outer element.

**SE lens — the component tree:**
The component tree for this shell is:

```
App
├── Toolbar
├── ToolPanel
├── ViewportComponent (wraps Three.js)
├── PropertiesPanel
└── StatusBar
```

Each component corresponds to one visible region of the screen. When lesson 06 adds
sketch tools to the `ToolPanel`, only `ToolPanel` changes. When lesson 13 adds
selected-face properties to `PropertiesPanel`, only `PropertiesPanel` changes.
The tree makes the scope of every change obvious.

---

## Step 8 — The Viewport Component

### The problem

The Three.js viewport must be initialised inside a DOM element that React controls.
The challenge: React renders JSX to the DOM asynchronously — the DOM element does
not exist when the component function first runs. Three.js must wait until React has
rendered the container div to the DOM before it can call `container.appendChild(...)`.

React solves this with two hooks: `useRef` to hold a reference to the DOM element,
and `useEffect` to run code after React has rendered.

### Create `src/components/ViewportComponent.tsx`

First, create the directory: `mkdir src/components`

```tsx
import { useRef, useEffect }   from 'react'
import { initViewport }        from '../viewport/viewport.js'
import type { ViewportInstance } from '../viewport/viewport.js'
```

**Import explanation:**
`import { useRef, useEffect } from 'react'` — `react` is the React core library.
`useRef` and `useEffect` are **hooks** — functions provided by React that give
function components access to React features (state, side effects, DOM references).
Both are explained fully below at their first use.

`import { initViewport } from '../viewport/viewport.js'` — `viewport.ts` is the
module responsible for Three.js initialisation (created in step 4). We import
`initViewport` — the function that creates the Three.js scene in a DOM element —
because `ViewportComponent` calls it when it mounts.

`import type { ViewportInstance } from '../viewport/viewport.js'` — `import type`
imports only the TypeScript type definition, not any runtime value. `ViewportInstance`
is only needed for the `useRef`'s type parameter — it is erased at compile time.
Using `import type` for type-only imports makes dependencies explicit: readers know
this import adds no runtime behaviour.

```tsx
export function ViewportComponent(): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewportRef  = useRef<ViewportInstance | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (container === null) return

    const viewport = initViewport(container)
    viewportRef.current = viewport
    viewport.animate()

    return () => {
      viewport.dispose()
    }
  }, [])

  return <div className="viewport-wrapper" ref={containerRef} />
}
```

**`useRef<T>(initialValue)` — first appearance:**
`useRef` creates a **mutable reference** — a container that holds a value that
persists between renders and does NOT cause a re-render when changed.

`useRef<HTMLDivElement>(null)` creates a ref whose value starts as `null` and will
hold an `HTMLDivElement` after React renders. When you pass `ref={containerRef}` to
a JSX element (`<div ref={containerRef} />`), React sets `containerRef.current` to
the actual DOM element after rendering.

The `current` property is the stored value. `containerRef.current` is initially
`null`; after React mounts the `<div>`, it is the `<div>` element.

`useRef<ViewportInstance | null>(null)` stores the `ViewportInstance` returned by
`initViewport`. This ref is not attached to a DOM element — it stores a JavaScript
object. Refs are the React way to hold values that should persist between renders
but should not trigger re-renders. An alternative would be `useState`, but changing
state causes a re-render, which is unnecessary here — the viewport instance never
needs to cause the component to re-render.

**`useEffect(setup, dependencies)` — first appearance:**
`useEffect` schedules a function to run **after** React has rendered the component
to the DOM. This solves the timing problem: when `ViewportComponent` renders, the
`<div>` does not yet exist in the DOM. `useEffect` runs after the DOM is updated.

The setup function runs after every render where the dependencies array changed.
An empty dependencies array `[]` means "run only once, after the first render."
This is the correct behaviour for Three.js initialisation — initialise once, never
again.

**The cleanup function:**
`return () => { viewport.dispose() }` — the function returned from `useEffect`'s
setup is the **cleanup function**. React calls it when the component unmounts (is
removed from the DOM). For the viewport, this stops the animation loop and releases
GPU memory.

If a component mounts and unmounts repeatedly (which React's StrictMode simulates
in development), without cleanup the Three.js renderer is created multiple times,
each leaking a canvas element and GPU memory. The cleanup function makes mounting
idempotent.

**Walkthrough — `ViewportComponent` mounting:**

```
1. React calls ViewportComponent()
2. containerRef = { current: null }
3. viewportRef  = { current: null }
4. React renders <div className="viewport-wrapper" ref={containerRef} />
5. React commits the <div> to the DOM
6. React sets containerRef.current = the rendered <div>
7. React runs useEffect callback:
   a. container = containerRef.current  (the <div>, not null)
   b. viewport = initViewport(container)  (Three.js setup)
   c. viewportRef.current = viewport
   d. viewport.animate()  (render loop starts)
   e. Returns cleanup function
8. Scene is rendering at 60fps
```

When the component unmounts:
```
9. React calls the cleanup function
10. viewport.dispose()  (loop stops, GPU memory released)
```

**`<div className="viewport-wrapper" ref={containerRef} />`:**
The self-closing `<div />` syntax is valid JSX for an element with no children.
`ref={containerRef}` is a special React attribute — it is NOT a prop that the
component receives. React uses it to populate `containerRef.current` after rendering.
The `viewport-wrapper` CSS class is defined in `style.css` and places this div in
the grid's viewport area.

---

## Step 9 — Shell Components

### Create `src/components/Toolbar.tsx`

```tsx
export function Toolbar(): JSX.Element {
  return (
    <header className="toolbar">
      <span className="toolbar-title">CAM Project</span>
    </header>
  )
}
```

**`<header>` element:**
`<header>` is a semantic HTML element representing introductory content for its
nearest sectioning content. Using `<header>` (instead of `<div>`) communicates to
screen readers and search engines that this region is the page header. Semantic HTML
is not required for visual appearance but is required for accessibility. In this
application, accessibility matters — a machinist using the software may rely on
a keyboard or assistive technology.

### Create `src/components/ToolPanel.tsx`

```tsx
export function ToolPanel(): JSX.Element {
  return (
    <aside className="tool-panel">
      <p className="panel-section-title">Tools</p>
      <p style={{ color: 'var(--colour-text-muted)', fontSize: '11px' }}>
        Tools appear here in later lessons.
      </p>
    </aside>
  )
}
```

**`<aside>` element:**
`<aside>` is a semantic HTML element for content tangentially related to the main
content. A tool panel is an aside — it provides access to operations but is not the
primary content area. The primary content is the viewport.

**Inline `style` in JSX:**
`style={{ color: 'var(--colour-text-muted)', ... }}` passes inline styles as a
JavaScript object. Note the double braces: the outer `{}` is JSX expression syntax
(embedding JavaScript inside JSX), and the inner `{}` is the JavaScript object
literal for the style. In JSX, inline styles use camelCase property names
(`fontSize` not `font-size`) and values as strings.

Inline styles are appropriate for truly dynamic values that cannot be expressed as
CSS classes (for example, a draggable panel width that changes with cursor position).
For static styling, CSS classes (like `panel-section-title`) are preferred — they
are easier to maintain and override.

### Create `src/components/PropertiesPanel.tsx`

```tsx
export function PropertiesPanel(): JSX.Element {
  return (
    <aside className="properties-panel">
      <p className="panel-section-title">Properties</p>
      <p style={{ color: 'var(--colour-text-muted)', fontSize: '11px' }}>
        Select geometry to see its properties.
      </p>
    </aside>
  )
}
```

### Create `src/components/StatusBar.tsx`

```tsx
export function StatusBar(): JSX.Element {
  return (
    <footer className="status-bar">
      <span>Ready</span>
      <span>X: —</span>
      <span>Y: —</span>
      <span>Z: —</span>
    </footer>
  )
}
```

**`<footer>` element:**
`<footer>` is a semantic HTML element representing concluding content for its
nearest sectioning element. The status bar summarises the current application state —
it is the footer of the application frame.

The coordinate displays (`X: —`, `Y: —`, `Z: —`) will update in lesson 05 when
raycasting detects the cursor's 3D position above the grid. For now they show `—`
(the em dash character) to indicate "no value yet."

---

## Step 10 — Run It

Start the dev server:

```
npm run dev
```

Open `http://localhost:5174`. You should see:
- A dark toolbar across the top with "CAM Project"
- A tool panel on the left with "TOOLS" heading
- The Three.js grid viewport filling the centre
- A properties panel on the right with "PROPERTIES" heading
- A status bar at the bottom with "Ready" and coordinate placeholders

The viewport should orbit, pan, and zoom exactly as in lesson 01.

**If the layout appears as a single column (no panels):**
Open the browser console (F12 → Console). Look for React errors. If you see
`Warning: Each child in a list should have a unique "key" prop`, that is a different
issue — it should not prevent rendering. If the grid is not applying, open the
Elements tab (F12 → Elements), find `.app-shell`, and check its computed CSS styles.
Verify `display: grid` is applied. If not, check that `body` has the correct
`height: 100%` and the `#root` div has `height: 100%`.

---

## Debugging: When React and Three.js Conflict

**Symptom: Three.js canvas is created twice (two canvases in `viewport-wrapper`)**

React's `StrictMode` mounts components twice in development. The `useEffect`
cleanup function is called between the two mounts. If `viewport.dispose()` does not
properly stop the animation loop and clean up, the second mount finds the canvas
container in a corrupt state. Verify `dispose()` calls `cancelAnimationFrame` and
`renderer.dispose()`.

Add a temporary log to confirm the lifecycle:
```tsx
useEffect(() => {
  console.log('mounting viewport')
  const container = containerRef.current!
  const viewport = initViewport(container)
  viewport.animate()
  return () => {
    console.log('unmounting viewport')
    viewport.dispose()
  }
}, [])
```
You should see: `mounting viewport`, then `unmounting viewport`, then
`mounting viewport` again (StrictMode's double-mount). If you see `mounting viewport`
twice without `unmounting viewport` in between, the cleanup is not running — check
the return statement inside `useEffect`.

**Symptom: `container.clientWidth` returns 0 in `initViewport`**

The container div has no dimensions because its parent (`.viewport-wrapper`) has not
been given size by CSS Grid. Verify `.app-shell` has `display: grid` and
`grid-template-rows` with `1fr` for the middle row. Also verify `html`, `body`, and
`#root` all have `height: 100%`.

**Symptom: TypeScript error `Module '"./App.js"' has no exported member 'App'`**

The `App` function is not exported. Check that `App.tsx` exports it:
`export function App(): JSX.Element { ... }` — the `export` keyword before
`function` makes it importable.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

The component tree established here is the permanent structure of the application:

```
App
├── Toolbar       — lesson 06 adds mode buttons here
├── ToolPanel     — lesson 06 adds sketch tools here
├── ViewportComponent — Three.js; every lesson adds objects to its scene
├── PropertiesPanel  — lesson 05 adds selected object data here
└── StatusBar      — lesson 05 adds cursor coordinates here
```

`ViewportComponent` exports nothing — it encapsulates Three.js completely. Future
code that needs to add objects to the scene will use a shared state or context
mechanism (introduced when first needed) rather than reaching into the viewport
directly. This encapsulation is the correct boundary: React manages the UI,
Three.js manages the 3D scene, and neither reaches into the other.

The `useRef + useEffect` pattern for integrating imperative APIs (Three.js, WebGL,
Canvas 2D) into React is universal. The same pattern is used to integrate maps
(Leaflet, MapboxGL), charts (Chart.js), and editors (CodeMirror, Monaco) into
React applications. Learning it here means recognising it everywhere.

---

## What Breaks Without This

**Without the cleanup function in `useEffect`:**
In development (StrictMode), React mounts components twice. Without cleanup,
`initViewport` runs twice, appending two canvas elements to `viewport-wrapper`. The
second canvas overlaps the first. Both animation loops run simultaneously, doubling
GPU load. In production, StrictMode's double-mount does not happen — but if the
component ever unmounts (navigating away from the page in a single-page app), the
animation loop keeps running in memory forever. GPU memory is never freed.

**Without `container.clientWidth / container.clientHeight` (using `window.inner*` instead):**
The viewport renders at the full window width — including the panel widths. The camera
aspect ratio is computed from the full window, but the canvas only occupies the centre
column. The result: the camera sees a 1200px-wide view but the canvas is only 760px
wide. The rendered image is stretched horizontally and cropped on the right. Objects
that should be circular appear oval.

**Without `grid-area` assignments:**
CSS Grid places items in sequential order when `grid-area` is not set — each child
fills the next available cell. Without the named area assignments, the toolbar might
appear in the second cell of the first row (beside the left panel), not spanning the
full width. The layout would break unpredictably depending on the number of children
and the grid configuration.

---

## Definition of Done

- [ ] `npm run dev` shows the full shell: toolbar, two panels, viewport, status bar
- [ ] The Three.js viewport orbits, pans, and zooms as in lesson 01
- [ ] The viewport fills exactly the space between the panels
- [ ] Resizing the browser window resizes the viewport correctly
- [ ] No duplicate canvas elements in the browser developer tools (Elements tab)
- [ ] You can explain what React is and name the problem it solves over vanilla DOM
- [ ] You can explain declarative vs imperative rendering with a concrete example
- [ ] You can explain `useRef` — what it holds, what `.current` is, when it is `null`
- [ ] You can explain `useEffect` — when its callback runs, what the empty `[]` means,
      what the cleanup function does and when it runs
- [ ] You can explain why the cleanup function is critical for Three.js in React
- [ ] You can explain CSS Grid: `fr` units, `grid-template-areas`, `grid-area`
- [ ] You can explain the difference between `dependencies` and `devDependencies` for
      the React packages installed here
- [ ] You can explain `"jsx": "react-jsx"` in `tsconfig.json` — what it enables
- [ ] You can explain why `.js` extension is used in TypeScript import paths
- [ ] Run:
      ```
      git add .
      git commit -m "Add React application shell: toolbar, panels, status bar frame the Three.js viewport using CSS Grid; useRef+useEffect bridge React and Three.js"
      ```

---

*Next: Lesson 03 — Objects in 3D Space. A coloured box is added to the scene. Its
position is controlled by typing coordinates into the properties panel. Three.js
scene graph manipulation is made explicit. World space vs local space, 3D vectors,
and point translation are introduced.*
