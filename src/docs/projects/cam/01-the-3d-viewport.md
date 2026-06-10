# CAD/CAM — Lesson 01 — The 3D Viewport

## What You Will Build

A dark-themed browser window with a 3D viewport filling the screen. The viewport
shows a grid on the XY plane — the floor of 3D space. You can orbit the camera by
dragging, zoom with the scroll wheel, and pan by right-dragging. The camera starts
at an angle above the grid looking at the origin. Nothing is clickable, nothing is
drawn, no data is modelled. This is the blank canvas that every subsequent lesson
paints on.

## What You Need to Know First

This is the first lesson. Everything is explained here. You need:
- A computer with Node.js installed. Open a terminal and run `node --version`.
  If it prints something like `v20.11.0`, Node.js is installed. If not, download
  it from [nodejs.org](https://nodejs.org) (choose the LTS version).
- A code editor. VS Code is recommended.
- A terminal (Command Prompt or PowerShell on Windows; Terminal on Mac/Linux).

---

## The Problem

A CAD/CAM application models geometry in 3D space and lets the user view that
geometry from any angle. Before any geometry exists, before any tools or operations
are built, there must be a 3D viewport — a window into 3D space where geometry
will eventually appear.

Building the viewport first is not just good teaching order. It is good engineering
order. A blank 3D canvas built on day one means every lesson that follows can
immediately show you what it builds. Nothing is invisible until the final step.

The viewport has three requirements:
1. A drawing surface provided by WebGL, accessed through the browser's canvas element
2. A scene graph that organises 3D objects
3. Camera orbit, pan, and zoom so the user can navigate

All three are provided by **Three.js** — a JavaScript library that wraps WebGL.

---

## Step 1 — What Three.js Is and Why It Exists

### The problem

To draw 3D graphics in a browser, JavaScript has access to **WebGL** — a low-level
graphics API that communicates directly with the GPU (Graphics Processing Unit, the
chip that handles rendering). WebGL is extremely powerful but requires you to write
**shader programs** (small programs that run directly on the GPU), manage GPU memory
buffers, and handle hundreds of low-level operations for every shape you draw.

Drawing a simple box in raw WebGL requires approximately 300 lines of code and a
working understanding of GPU programming. That is not where a CAD/CAM application
should focus its effort.

**Three.js** is a library that wraps WebGL. It provides objects like `Scene`,
`Camera`, `Mesh`, and `Light` that you assemble in TypeScript. Three.js converts
those objects to WebGL calls automatically. Drawing a box in Three.js takes three
lines. Three.js handles the GPU; you handle the geometry.

**CS lens — levels of abstraction:**
WebGL is a low-level API — it is close to the hardware and requires you to manage
every detail. Three.js is a high-level API — it hides the low-level details behind
a more useful set of concepts. This layering is universal in computing: every
high-level language sits on top of a lower one. C sits on top of machine code.
Python sits on top of C. Three.js sits on top of WebGL. You choose the level that
matches what you are trying to build.

For a learning CAD application, Three.js is the correct level. If you were building
a AAA game engine, you would need WebGL or even lower. If you were building a simple
chart, you might not need Three.js at all and use SVG instead. The level of
abstraction is a design decision, not a given.

**SE lens — dependency as a contract:**
Adding Three.js as a dependency is a contract: you trust the Three.js maintainers
to keep the API stable (they use semantic versioning, explained below), you accept
that bugs in Three.js may affect your application, and you accept that upgrading
Three.js may require changes in your code. For an established library like Three.js
(maintained since 2010, used by hundreds of thousands of projects), this contract
is a good trade. Building a WebGL abstraction layer from scratch would be months of
work and would produce something worse.

---

## Step 2 — Create the Project

### The problem

The CAM application is a TypeScript project built with Vite. We need a project
directory with the correct configuration files before writing a single line of
application code.

### Create the project directory

Open a terminal. Navigate to wherever you keep your projects (for example, your
Documents folder). Run:

```
mkdir cam-project
cd cam-project
```

**`mkdir` — first appearance:**
`mkdir directoryName` creates a new directory with that name. `cd directoryName`
(**c**hange **d**irectory) moves the terminal into that directory. All subsequent
commands run inside `cam-project`.

### Create `package.json`

`package.json` is a configuration file that Node.js and npm use to understand your
project. It records your project's name, version, the packages it depends on, and
the scripts you can run. Create this file at the root of the `cam-project` directory:

```json
{
  "name": "cam-project",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev":   "vite",
    "build": "vite build",
    "test":  "vitest run"
  },
  "dependencies": {
    "three": "^0.165.0"
  },
  "devDependencies": {
    "@types/node":   "^20.0.0",
    "typescript":    "^5.4.0",
    "vite":          "^5.3.0",
    "vitest":        "^1.6.0"
  }
}
```

**`package.json` — first appearance:**
This file is the project manifest. Every field:

`"name"` — the project's identifier. Used when publishing to npm (not relevant here,
but required). Lowercase, no spaces.

`"version"` — follows **semantic versioning** (semver): `MAJOR.MINOR.PATCH`. `0.1.0`
means version zero (not stable yet), minor revision 1, no patches. When you see a
version like `^0.165.0` in a dependency, the `^` means "any compatible version" —
specifically, any version `≥ 0.165.0` and `< 0.166.0`. The caret allows automatic
updates that do not break the API.

`"private": true` — tells npm not to accidentally publish this project to the npm
registry. Always include this for applications (as opposed to libraries).

`"type": "module"` — tells Node.js that `.js` files in this project use ES module
syntax (`import`/`export`) rather than CommonJS syntax (`require`/`module.exports`).
TypeScript compiles to modern module syntax, so this must be set.

`"scripts"` — named commands you can run with `npm run scriptName`. `"dev": "vite"`
means `npm run dev` starts the Vite development server. `"build": "vite build"` runs
the production build. `"test": "vitest run"` runs the test suite once.

`"dependencies"` — packages required to run the application. `"three": "^0.165.0"`
is the Three.js library. This ships to users.

`"devDependencies"` — packages required to build and test, but not to run in production.
`"typescript"` is the TypeScript compiler. `"vite"` is the development server and
bundler. `"vitest"` is the test runner. `"@types/node"` provides TypeScript type
definitions for Node.js built-in modules — needed by Vite's configuration file.

**`dependencies` vs `devDependencies` — why the distinction matters:**
When deploying to a server (or when another developer installs your project), they
may run `npm install --production`, which installs only `dependencies`. Test runners
and compilers are not needed in production. Keeping them in `devDependencies` makes
this distinction explicit and keeps production installs lighter.

### Create `tsconfig.json`

TypeScript needs a configuration file to know how to compile your code. Create
`tsconfig.json` at the project root:

```json
{
  "compilerOptions": {
    "target":           "ES2022",
    "module":           "ESNext",
    "moduleResolution": "bundler",
    "strict":           true,
    "noUnusedLocals":   true,
    "noUnusedParameters": true,
    "lib":              ["ES2022", "DOM", "DOM.Iterable"]
  },
  "include": ["src"]
}
```

**`tsconfig.json` — first appearance:**
This file tells the TypeScript compiler (`tsc`) and editor tooling how to process
your TypeScript files. Every field here:

`"target": "ES2022"` — which version of JavaScript to compile to. `ES2022` is
supported by all modern browsers and enables modern features like top-level `await`.

`"module": "ESNext"` — how `import`/`export` statements are compiled. `ESNext`
keeps them as modern ES modules, which Vite understands natively.

`"moduleResolution": "bundler"` — how TypeScript resolves `import` paths. `"bundler"`
mode trusts the bundler (Vite) to handle path resolution, which allows importing
Three.js addons via `'three/addons/...'`.

`"strict": true` — enables a group of TypeScript safety checks together: every
variable must have a known type, `null` and `undefined` must be handled explicitly,
and function parameters are type-checked precisely. This catches the most common
category of TypeScript bugs at compile time. Always enable it.

`"noUnusedLocals": true` and `"noUnusedParameters": true` — TypeScript errors on
variables and function parameters that are declared but never used. Unused variables
are often signs of incomplete code or copy-paste errors.

`"lib": ["ES2022", "DOM", "DOM.Iterable"]` — which type definitions to include.
`"DOM"` provides types for browser APIs (`document`, `window`, `HTMLCanvasElement`,
etc.). `"DOM.Iterable"` provides iterator types for DOM collections.

`"include": ["src"]` — only compile files inside the `src` directory.

### Create `vite.config.ts`

Vite is the development server and build tool. Its configuration file is TypeScript:

```typescript
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5174,
  },
})
```

**Vite — first appearance:**
Vite does two things. In development, it starts a local web server and compiles
TypeScript files on demand as the browser requests them — so saving a file
immediately reflects in the browser without a separate compile step. For production
(running `npm run build`), it bundles all files into optimised static output.

`"port": 5174` — the local network port the dev server listens on. A **port** is a
number that routes a network connection to a specific program on a machine. Port 5174
is where Vite listens; your browser connects to `localhost:5174` to reach it.
**`localhost`** is the loopback address — a special name that routes back to the same
machine. When Vite runs on `localhost:5174`, your browser and the server are both on
the same computer. No traffic leaves your machine.

We use `5174` (not the default `5173`) in case you still have the calculator project
running on `5173`.

`defineConfig` is a helper from Vite that provides TypeScript autocompletion for
the configuration options. It does nothing at runtime — passing the object directly
would work — but the TypeScript type checking it enables makes configuration errors
visible before you run the server.

### Install dependencies

Run:

```
npm install
```

**`npm install` — first appearance:**
`npm` stands for **Node Package Manager** — the command-line tool installed alongside
Node.js for managing JavaScript packages. `npm install` reads `package.json`, finds
every package listed under `dependencies` and `devDependencies`, downloads them from
the npm registry (a public database of packages at `registry.npmjs.org`), and places
them in a `node_modules` directory.

After running, two things appear:
- `node_modules/` — a directory containing all downloaded packages. This directory
  can be very large (hundreds of thousands of files). **Never commit it to git.** It
  can always be reproduced by running `npm install`.
- `package-lock.json` — records the exact version of every package installed.
  **Commit this file.** It ensures that anyone else who runs `npm install` on this
  project gets identical package versions. Without it, `npm install` might install
  slightly different patch versions on different machines, causing hard-to-reproduce bugs.

**What you expect to see:**
The terminal prints packages being added and ends with something like:
```
added 42 packages in 8s
```
The exact count depends on the Three.js version. No warnings or errors should appear.

**What failure looks like:**
If you see `npm error code ECONNREFUSED` or similar network errors, your internet
connection is unavailable. If you see `npm error code ENOENT` about `package.json`,
you are not in the `cam-project` directory — run `cd cam-project` first.

### Create `src/main.ts` (empty for now)

Create a `src` directory and an empty `src/main.ts` file:

```
mkdir src
```

On Windows PowerShell: create a new file `src/main.ts` and leave it empty. You can
do this in VS Code by right-clicking the `src` folder in the file explorer and
selecting "New File."

### Create `index.html`

Create `index.html` at the project root:

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
    <div id="viewport-container"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

**`index.html` — what each part does:**

`<!DOCTYPE html>` — tells the browser this is an HTML5 document. Without this,
browsers enter "quirks mode" — a compatibility mode that renders CSS differently
and exists only to support web pages written for browsers from the late 1990s.
Always include it.

`<meta charset="UTF-8">` — tells the browser the file's character encoding.
**UTF-8** encodes text as bytes. Without specifying it, the browser may guess the
encoding incorrectly and display garbled text for any non-ASCII characters (accented
letters, symbols, etc.).

`<meta name="viewport" content="width=device-width, initial-scale=1.0">` — instructs
mobile browsers not to scale the page. Without this, mobile browsers zoom out to
show a "desktop" view, which breaks full-screen viewports.

`<link rel="stylesheet" href="/src/style.css">` — loads the CSS file. The `/`
prefix means the path is relative to the site root — Vite will serve `/src/style.css`
correctly in development.

`<div id="viewport-container"></div>` — an empty `<div>` element that Three.js will
inject its canvas into. The `id="viewport-container"` attribute gives it a unique
identifier that `document.getElementById` can find.

`<script type="module" src="/src/main.ts"></script>` — loads the TypeScript entry
point. `type="module"` tells the browser this is an ES module — it supports
`import`/`export` syntax and is loaded asynchronously after HTML parsing. Vite
intercepts this request and compiles the TypeScript before sending it to the browser.

---

## Step 3 — CSS: The Shell

### The problem

The viewport must fill the entire browser window — no margins, no scrollbars, a
consistent dark background. CSS custom properties establish a theming system that
all subsequent lessons will extend.

### Create `src/style.css`

```css
:root {
  --colour-background:    #0f172a;
  --colour-grid-major:    #334155;
  --colour-grid-minor:    #1e293b;
  --colour-text:          #e2e8f0;
  --font-ui:              'Inter', system-ui, sans-serif;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  margin:     0;
  padding:    0;
}

html,
body {
  width:            100%;
  height:           100%;
  overflow:         hidden;
  background-color: var(--colour-background);
  font-family:      var(--font-ui);
  color:            var(--colour-text);
}

#viewport-container {
  width:    100%;
  height:   100%;
  display:  block;
}
```

**CSS custom properties (variables) — first appearance:**
`--colour-background: #0f172a` defines a **CSS custom property** — a reusable named
value. The `--` prefix marks it as a custom property. It is defined in `:root`,
which means it applies to the entire page.

`var(--colour-background)` reads the value wherever you use it. Changing one token
in `:root` updates every element that references it. This is the correct way to
maintain a colour scheme — changing `--colour-background` from dark to light
automatically updates every element using it.

**Why `:root` and not `body`:**
`:root` is the `<html>` element — the topmost element in the document. Variables
defined on `:root` are accessible everywhere. Variables defined on `body` are not
accessible in elements outside `body` (like `::before` pseudo-elements on `html`).
Use `:root` for global design tokens.

**`box-sizing: border-box`:**
By default, CSS calculates an element's dimensions as content only — border and
padding are added on top. `box-sizing: border-box` includes border and padding
in the element's declared size. This makes layout arithmetic predictable: a div
declared as `width: 100%` with `padding: 10px` fills exactly 100% of the parent,
with the padding subtracting from the interior rather than overflowing.

**`margin: 0; padding: 0`:**
Browsers apply default margins and padding to elements (the `<body>` has an 8px
margin by default in most browsers). Resetting them ensures the viewport fills the
full window with no gaps.

**`overflow: hidden` on `html, body`:**
Prevents scrollbars from appearing when Three.js resizes the canvas to exactly
match the window dimensions. Without it, a 1px rounding difference can trigger
a scrollbar, which reduces the window size slightly, which triggers Three.js to
resize the canvas, which creates a feedback loop.

---

## Step 4 — The Three.js Scene

### The problem

Three.js requires three objects to render anything: a **scene** (the container for
all 3D objects), a **camera** (the viewpoint), and a **renderer** (the engine that
draws the scene to the canvas). These three always exist together.

### CS lens — the scene graph

Three.js organises 3D objects in a **scene graph** — a tree data structure where
every node is a 3D object. The scene is the root. Each object can have children,
which inherit their parent's transformation. Moving a parent moves all its children.

```
Scene (root)
├── Grid
├── Box
│   ├── Edge highlight mesh (child of Box)
└── Directional light
```

**Tree data structures** are the dominant structure in hierarchical systems. The
file system is a tree (directories contain files and other directories). The DOM is
a tree (elements contain child elements). A parse tree represents the nested
structure of a program. In all cases, the tree allows hierarchical operations:
"move this group" moves everything in the subtree without touching anything outside.

The scene graph is not a concept invented for 3D graphics — it is a specialisation
of trees to 3D transformations. Every major 3D engine (Unity, Unreal Engine, Blender,
OpenCASCADE) uses a scene graph.

### The code

Write `src/main.ts`:

```typescript
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
```

**Import explanation:**
`import * as THREE from 'three'` — `'three'` is the Three.js package installed in
`node_modules`. The `* as THREE` syntax imports every exported value from the package
and places them under the `THREE` namespace. After this import, `THREE.Scene`,
`THREE.Camera`, `THREE.Mesh`, and every other Three.js class are available as
`THREE.ClassName`. This is the standard way to import Three.js — all Three.js code
uses the `THREE.` prefix as a signal that this object is part of the Three.js API.

`import { OrbitControls } from 'three/addons/controls/OrbitControls.js'` —
`three/addons` is a sub-path of the Three.js package that contains optional extras
not included in the core. `OrbitControls` is an add-on that adds orbit, pan, and
zoom behaviour to the camera. We import only `OrbitControls` (not `* as addon`)
because we need only one thing from this module.

**Why are add-ons separate?**
Three.js's core is already large. Add-ons like `OrbitControls`, `DragControls`,
`TransformControls`, and dozens of file importers are useful in some projects but
not all. Keeping them in `addons` means the core bundle stays smaller — you only
pay for what you import.

```typescript
// ─── Scene setup ─────────────────────────────────────────────────────────────

const scene = new THREE.Scene()
```

**`THREE.Scene` — first appearance:**
`new THREE.Scene()` creates the root node of the scene graph. All 3D objects are
added to the scene with `scene.add(object)`. The scene itself has no visual
representation — it is purely an organisational container.

`const` declares a constant binding — the variable `scene` always refers to this
same `THREE.Scene` object. We use `const` everywhere in this codebase. If you find
yourself wanting `let`, the question to ask first is: should this be a new object,
or a mutation of an existing one? In a Three.js application, most things are created
once and mutated in place (`.position.set(...)`, `.rotation.x = ...`), not replaced.

```typescript
// ─── Camera ──────────────────────────────────────────────────────────────────

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
)
camera.position.set(10, 8, 10)
camera.lookAt(0, 0, 0)
```

**`THREE.PerspectiveCamera` — first appearance:**
A camera defines the viewpoint: where you are in the scene and what you can see.
`PerspectiveCamera` models how human eyes and real camera lenses work —
objects closer to the camera appear larger than objects further away (perspective
projection). The alternative, `OrthographicCamera`, removes perspective distortion
(useful for technical drawings, also used in CAD orthographic views — lesson 06).

The four constructor arguments:

- `45` — **field of view** in degrees. The vertical angle that the camera can see.
  45° is a natural, non-distorted view. Wide-angle lenses (90°+) create dramatic
  distortion; telephoto lenses (10°) flatten depth. For a CAD viewport, 45° is standard.

- `window.innerWidth / window.innerHeight` — **aspect ratio**: width divided by height.
  `window.innerWidth` and `window.innerHeight` are browser properties giving the
  viewport dimensions in CSS pixels. Dividing width by height gives a number like
  1.78 for a widescreen monitor (16/9). If the aspect ratio is wrong, circles appear
  as ellipses and right angles appear skewed.

- `0.1` — **near clipping plane**: how close an object can be before it disappears.
  Objects closer than 0.1 units to the camera are not rendered. This prevents
  depth precision issues from objects directly at the camera position. In a CAD
  application, nothing should ever be closer than 0.1mm to the camera.

- `1000` — **far clipping plane**: how far an object can be before it disappears.
  Objects beyond 1000 units are not rendered. The ratio of far/near (1000/0.1 = 10,000)
  determines depth buffer precision — keeping this ratio reasonable prevents objects
  from z-fighting (flickering where two surfaces occupy the same depth).

**`camera.position.set(10, 8, 10)` — first appearance:**
`position` is a `THREE.Vector3` object with `x`, `y`, and `z` properties.
`.set(x, y, z)` assigns all three at once. In Three.js, the coordinate system is:
- X points right
- Y points up
- Z points toward the viewer (out of the screen)

The camera at position `(10, 8, 10)` is 10 units right, 8 units up, and 10 units
toward us from the origin — above and to the right, looking down at the scene.
We chose this angle because it shows the XY plane as a floor that extends away
from the viewer, which matches the common CNC orientation: X right, Y away, Z up.

**`camera.lookAt(0, 0, 0)`:**
Points the camera at the origin — the centre of the grid. Without this, the camera
points in its default direction (along the negative Z axis) regardless of its position.

```typescript
// ─── Renderer ────────────────────────────────────────────────────────────────

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x0f172a)

const viewportContainer = document.getElementById('viewport-container')
if (viewportContainer === null) {
  throw new Error('Viewport container element not found in the DOM')
}
viewportContainer.appendChild(renderer.domElement)
```

**`THREE.WebGLRenderer` — first appearance:**
The renderer is the engine that draws the scene to a canvas. It communicates with
the GPU via WebGL. `{ antialias: true }` enables antialiasing — the GPU uses
multiple samples per pixel to smooth diagonal edges from the jagged "staircase"
effect caused by rendering to a discrete pixel grid. Antialiasing costs GPU time
but is always worth it for a CAD application where straight edges on geometry must
look clean.

**`renderer.setSize(width, height)`:**
Sets the resolution of the renderer's canvas in pixels. `window.innerWidth` and
`window.innerHeight` give the browser viewport dimensions. The canvas is set to
match them exactly — this makes it fill the container element.

**`renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))`:**
High-DPI screens (Apple Retina, most modern phones) have a `devicePixelRatio` greater
than 1 — a 2x screen renders 4 physical pixels per CSS pixel. Setting the pixel ratio
to match means the canvas renders at the screen's native resolution and text/edges
are sharp. `Math.min(..., 2)` caps at 2 — a 3x or 4x ratio would render 9–16 times
as many pixels as necessary, burning GPU time with no visible improvement on screens
viewed from normal distance.

**`renderer.setClearColor(0x0f172a)`:**
Sets the background colour. `0x0f172a` is hexadecimal for the same dark blue-grey
used in `--colour-background` in the CSS. Hex colour literals in JavaScript use the
prefix `0x` followed by the six hex digits `RRGGBB`. We keep this value consistent
with the CSS variable so there is no visible seam between the HTML background and
the canvas background.

**`document.getElementById('viewport-container')` — first appearance:**
`document.getElementById(id)` searches the DOM tree for an element with a matching
`id` attribute. The **DOM** (Document Object Model) is the browser's in-memory tree
representation of the HTML document. Every element in the HTML becomes a node in
this tree. The method returns the element if found, or `null` if no element has
that id.

**The null check:**
```typescript
if (viewportContainer === null) {
  throw new Error('Viewport container element not found in the DOM')
}
```
TypeScript requires this check because `getElementById` can return `null`. Without
the check, TypeScript would not allow calling `viewportContainer.appendChild(...)`.
The `throw` terminates the application with a clear error message if the HTML and
the TypeScript code are out of sync (for example, if someone renames the `div`'s
`id` in `index.html` but forgets to update `main.ts`).

**`renderer.domElement`:**
Three.js creates a `<canvas>` element internally. `renderer.domElement` is a
reference to that canvas. `viewportContainer.appendChild(...)` inserts the canvas
as a child of the container div. The canvas now appears on the page and will receive
drawn frames.

---

## Step 5 — The Grid

### The problem

A blank black canvas gives no visual reference for 3D space — there is no way to
tell up from down or to estimate scale. A grid on the XY plane provides both: it
gives the viewer a visual floor and divides space into measurable units.

### The code

```typescript
// ─── Grid ────────────────────────────────────────────────────────────────────

const gridHelper = new THREE.GridHelper(
  20,
  20,
  0x334155,
  0x1e293b,
)
scene.add(gridHelper)
```

**`THREE.GridHelper` — first appearance:**
`GridHelper` creates a flat grid of lines on the XZ plane (the horizontal plane in
Three.js's default orientation). Four arguments:

- `20` — total size of the grid in world units. The grid extends from -10 to +10
  in both X and Z directions.
- `20` — number of divisions. 20 divisions on a grid of size 20 means each cell is
  1 unit × 1 unit. For a CNC machine, 1 unit = 1 millimetre by convention.
- `0x334155` — colour of the centre lines (X and Z axes within the grid). Slightly
  brighter than the grid to make the axes visible.
- `0x1e293b` — colour of all other grid lines. Darker to recede into the background.

**`scene.add(gridHelper)`:**
Adds the grid to the scene graph. After this call, the grid is a child of the scene.
Every object must be added to the scene (or to another object that is in the scene)
before it is rendered. An object created but not added to the scene does not appear.

**Why GridHelper is on the XZ plane:**
By default, `GridHelper` lies flat on the XZ plane (y=0). In Three.js, Y is up.
This places the grid on the floor — which is correct for visualising CNC machining,
where the machine table is a horizontal surface and the tool moves vertically (Z axis).

**SE lens — the XY vs XZ question:**
The README says "a grid on the XY plane." Three.js's GridHelper places the grid on
XZ by default. CNC machines typically use XY for the table plane with Z as height.
We will address this in lesson 06 (sketch mode), where we create proper sketch planes.
For this lesson, the visual floor is what matters, and GridHelper's XZ placement
is correct for a 3D viewport with Y-up orientation.

---

## Step 6 — Orbit Controls and the Render Loop

### The problem

The camera is stationary. Orbit controls let the user rotate, pan, and zoom by
interacting with the canvas with the mouse. The render loop continuously redraws
the scene so that orbit control changes are visible.

### The code

```typescript
// ─── Orbit controls ──────────────────────────────────────────────────────────

const orbitControls = new OrbitControls(camera, renderer.domElement)
orbitControls.enableDamping  = true
orbitControls.dampingFactor  = 0.05
orbitControls.minDistance    = 1
orbitControls.maxDistance    = 200
orbitControls.maxPolarAngle  = Math.PI / 2
```

**`OrbitControls` — first appearance:**
`OrbitControls` attaches mouse and touch event listeners to `renderer.domElement`
(the canvas) and moves the camera in response. The two constructor arguments are
the camera to control and the element to listen on. The class manages the
complex relationship between mouse position delta, camera orbit angle, and scene
rotation so you do not have to.

`enableDamping = true` with `dampingFactor = 0.05` — **damping** is deceleration:
when you release the mouse, the camera does not stop immediately but coasts to a halt.
This "inertia" makes the viewport feel more physical and natural. Without damping,
the camera freezes the instant the mouse button is released, which feels abrupt.

`minDistance = 1, maxDistance = 200` — prevents the camera from moving so close it
clips through geometry, or so far the scene becomes a dot.

`maxPolarAngle = Math.PI / 2` — the **polar angle** is the camera's elevation above
the XZ plane, measured in radians. `Math.PI / 2` is 90° — the horizon. This
prevents the camera from rotating below the grid, which would show the underside and
confuse the user's spatial orientation. In CNC, you never look at the machine from
below.

```typescript
// ─── Render loop ─────────────────────────────────────────────────────────────

function animate(): void {
  requestAnimationFrame(animate)
  orbitControls.update()
  renderer.render(scene, camera)
}

animate()
```

**`requestAnimationFrame` — first appearance:**
`requestAnimationFrame(callback)` is a browser API that schedules `callback` to run
before the next frame is painted to the screen. The browser targets 60 frames per
second — one frame every ~16.6 milliseconds. At 60fps, `requestAnimationFrame` calls
your function approximately 60 times per second.

The pattern `requestAnimationFrame(animate)` inside `animate` creates a **recursive
animation loop**: each call to `animate` schedules the next call. This continues
indefinitely until the page is unloaded.

**Why `requestAnimationFrame` instead of `setInterval`:**
`setInterval(fn, 16)` would call `fn` every 16ms regardless of frame timing. This
causes problems: if the tab is hidden, `setInterval` still fires and wastes CPU.
If rendering takes longer than 16ms, `setInterval` queues multiple calls and causes
visual stuttering. `requestAnimationFrame` is browser-coordinated — it only fires
when the tab is visible and synchronises exactly with the display's refresh rate.
Always use `requestAnimationFrame` for animation.

**`orbitControls.update()`:**
When `enableDamping` is true, `OrbitControls` needs to be updated every frame to
apply the deceleration calculation. Without calling `update()` in the loop, the
camera would stop instantly instead of damping. This call is always required when
damping is enabled.

**`renderer.render(scene, camera)`:**
Draws the scene as seen from the camera onto the canvas. This is the call that
actually produces pixels. It reads the scene graph, computes the position and
appearance of every object, and submits draw calls to the GPU via WebGL. On a modern
computer, this completes in well under 1ms for a simple scene with a grid — far
within the 16.6ms budget.

**Performance lens — the hot path:**
`animate` runs 60 times per second. Every function call inside it is part of the
**hot path** — code that runs continuously. `orbitControls.update()` and
`renderer.render()` are designed to be fast. But any code you add inside `animate`
in future lessons must be evaluated for cost. A single slow calculation (for example,
recalculating a toolpath every frame instead of caching it) can drop the frame rate
from 60fps to something visibly choppy.

```typescript
// ─── Resize handler ──────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
```

**`window.addEventListener('resize', handler)` — first appearance:**
`addEventListener` registers a function to run when a named event occurs on the
target. `'resize'` fires when the browser window changes size (the user resizes the
window, or switches to a different monitor). Without this handler, the canvas stays
at its original size after a resize, and the renderer's pixel output no longer fills
the window.

**`camera.updateProjectionMatrix()`:**
The projection matrix is a 4×4 matrix (introduced in lesson 04) that encodes the
camera's field of view, aspect ratio, and clipping planes. When `camera.aspect`
changes, the projection matrix is outdated. `updateProjectionMatrix()` recomputes
it from the current properties. Forgetting this call means the aspect ratio change
is not applied and rendered output is distorted.

---

## The Complete `src/main.ts`

The full file, assembled:

```typescript
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// ─── Scene setup ─────────────────────────────────────────────────────────────

const scene = new THREE.Scene()

// ─── Camera ──────────────────────────────────────────────────────────────────

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000,
)
camera.position.set(10, 8, 10)
camera.lookAt(0, 0, 0)

// ─── Renderer ────────────────────────────────────────────────────────────────

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor(0x0f172a)

const viewportContainer = document.getElementById('viewport-container')
if (viewportContainer === null) {
  throw new Error('Viewport container element not found in the DOM')
}
viewportContainer.appendChild(renderer.domElement)

// ─── Grid ────────────────────────────────────────────────────────────────────

const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b)
scene.add(gridHelper)

// ─── Orbit controls ──────────────────────────────────────────────────────────

const orbitControls = new OrbitControls(camera, renderer.domElement)
orbitControls.enableDamping = true
orbitControls.dampingFactor = 0.05
orbitControls.minDistance   = 1
orbitControls.maxDistance   = 200
orbitControls.maxPolarAngle = Math.PI / 2

// ─── Render loop ─────────────────────────────────────────────────────────────

function animate(): void {
  requestAnimationFrame(animate)
  orbitControls.update()
  renderer.render(scene, camera)
}

animate()

// ─── Resize handler ──────────────────────────────────────────────────────────

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
```

---

## Step 7 — Run It

```
npm run dev
```

**What this command does:**
`npm run dev` executes the `"dev"` script from `package.json`, which runs `vite`.
Vite starts its development server and prints:

```
  VITE v5.3.x  ready in 312 ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
```

Open `http://localhost:5174` in your browser.

**What you should see:**
A dark viewport filling the browser window. A grid of fine lines lies flat on the
XZ plane. Dragging with the left mouse button orbits the camera. Scrolling zooms.
Right-dragging pans.

**What you cannot see yet:**
The grid does not have XYZ axis lines (added in lesson 03). There are no objects.
The camera cannot go below the grid. Nothing is selectable. All of that is correct —
this lesson establishes the viewport only.

---

## Debugging: When the Viewport Does Not Appear

**Symptom: blank page with no canvas**

Open the browser console (F12 → Console tab). If you see:

```
Error: Viewport container element not found in the DOM
```

The `<div id="viewport-container">` in `index.html` does not match the id in
`document.getElementById('viewport-container')`. Check both for typos.

If you see:

```
SyntaxError: Cannot use import statement in a module
```

The `"type": "module"` field is missing from `package.json`, or Vite is not running.
Verify `npm run dev` is active in the terminal.

**Symptom: canvas appears but is black with no grid**

`GridHelper` was not added to the scene. Verify `scene.add(gridHelper)` is present.
Also check: if `renderer.setClearColor` uses a colour close to the grid colours,
the grid might be invisible. Try temporarily changing the grid colour to white
(`0xffffff`) to confirm the grid is rendering.

**Symptom: `npm install` printed warnings about peer dependencies**

Peer dependency warnings (`npm warn peer`) are informational — they say that some
package expects another package to be installed alongside it. These do not prevent
the application from running. Errors (starting with `npm error`) do prevent it.

**Symptom: TypeScript error `Cannot find module 'three/addons/...'`**

`"moduleResolution": "bundler"` is missing from `tsconfig.json`. This setting is
required for the `three/addons` import path to resolve correctly. Add it and restart
the dev server.

**How to read a browser console error:**
The console shows: `Error: Viewport container element not found` followed by a stack
trace like:
```
at main.ts:18:9
```
Line 18, column 9 of `main.ts` is where the `throw` statement is. Click the
filename in the console to jump directly to that line in the browser's built-in
source viewer.

---

## Version Control: First Commit

**Version control — first appearance:**
**Version control** is a system that records a history of every change made to a
project. You can return to any previous state, see who changed what and when, and
understand why a change was made. For a self-taught developer working alone, version
control is not optional — it is how you recover from mistakes and how you understand
your own history.

**Git** is the most widely used version control system. Every project in this
curriculum uses git.

Initialise a git repository in the `cam-project` directory:

```
git init
git branch -M main
```

**`git init`:** Creates a hidden `.git` directory that tracks all changes from now on.

**`git branch -M main`:** Renames the default branch to `main`. (Older git defaults
to `master`; `main` is the current convention.)

Create a `.gitignore` file at the project root:

```
node_modules/
dist/
.DS_Store
```

**`.gitignore` — first appearance:**
`.gitignore` lists files and directories that git should never track. `node_modules/`
is excluded because it contains hundreds of thousands of downloaded package files —
these can always be reproduced by running `npm install`. Committing `node_modules`
would make the repository enormous and slow. `dist/` is the production build output,
also reproducible. `.DS_Store` is a macOS metadata file with no project relevance.

**The three states of a file in git:**
1. **Modified** — you changed it, but git does not know yet
2. **Staged** — you told git to include this change in the next commit (`git add`)
3. **Committed** — the change is permanently recorded in the history

**What a commit message communicates:**
Not what files changed (git records that automatically). The commit message explains
*why* this snapshot exists. "Add Three.js viewport" is a file summary. "Establish
the 3D viewport with orbit controls — every subsequent lesson adds to this visible
foundation" is a reason.

Stage all new files and create the first commit:

```
git add .
git commit -m "Establish the 3D viewport with orbit controls and grid — the visual foundation all subsequent lessons build on"
```

**`git add .`:** Stages all files in the current directory (and subdirectories)
that are not in `.gitignore`. The `.` means "everything here."

**`git commit -m "message"`:** Creates a permanent snapshot of all staged files with
the provided message. The `-m` flag passes the message directly on the command line.

---

## Connect the Pieces

The scene, camera, and renderer created here persist for the entire project. Every
subsequent lesson adds to the scene (`scene.add(...)`) or removes from it
(`scene.remove(...)`). The render loop started here runs continuously, drawing whatever
is currently in the scene 60 times per second.

`OrbitControls` will be disabled in lesson 06 (sketch mode) when the camera locks
to a 2D view. It will be re-enabled when returning to 3D view. The same `orbitControls`
object — created here — is the thing that gets enabled and disabled.

The `renderer.domElement` canvas that Three.js draws on becomes the event target for
raycasting (lesson 05), the source for screenshot exports (future), and the surface
that all subsequent CSS overlays position themselves relative to.

---

## What Breaks Without This

**Without the resize handler:**
Resize the browser window. The canvas stays at its original pixel size, either
showing black bars around the edges (if the window grew) or clipping the grid (if
it shrank). The rendered output is the wrong aspect ratio. Circle geometries appear
as ellipses. This is fixable by refreshing the page, but that loses any work in the
scene. The resize handler makes the viewport responsive.

**Without `orbitControls.update()` in the render loop:**
Orbit controls with damping enabled appear to ignore mouse input — the camera never
moves. The update call applies the damping calculation each frame. Without it, the
stored velocity from mouse movement is never applied to the camera position. The fix
is a single line, but the symptom (unresponsive viewport) can be alarming without
knowing the cause.

**Without the null check on `viewportContainer`:**
If `viewportContainer` is `null` (wrong id, HTML not loaded yet), `null.appendChild`
throws `TypeError: Cannot read properties of null`. This is an opaque JavaScript
error with no helpful message. The explicit null check throws a clear error:
`Viewport container element not found in the DOM`. The message tells you exactly what
to look for and where.

---

## Definition of Done

- [ ] `npm install` completes without errors
- [ ] `npm run dev` starts the server and `http://localhost:5174` shows a dark viewport
- [ ] A grid is visible on the XZ plane
- [ ] Left-drag orbits the camera
- [ ] Scroll wheel zooms in and out
- [ ] Right-drag pans the camera
- [ ] Camera cannot orbit below the grid
- [ ] Resizing the browser window resizes the canvas correctly
- [ ] You can explain what Three.js is and why it exists (the level of abstraction argument)
- [ ] You can explain the three required objects: Scene, Camera, Renderer
- [ ] You can explain what a scene graph is and name one other system that uses a tree structure
- [ ] You can explain the four arguments to `PerspectiveCamera`
- [ ] You can explain what `requestAnimationFrame` does and why it is used instead of `setInterval`
- [ ] You can explain `enableDamping` and `orbitControls.update()` — why both are required
- [ ] You can explain `package.json`: `dependencies` vs `devDependencies`, semantic versioning
- [ ] You can explain `tsconfig.json`: what `strict: true` enables, what `lib: ["DOM"]` provides
- [ ] You can explain the three states of a file in git and what a commit message communicates
- [ ] Run:
      ```
      git add .
      git commit -m "Establish the 3D viewport with orbit controls and grid — the visual foundation all subsequent lessons build on"
      ```

---

*Next: Lesson 02 — The Application Shell. React is introduced as a component model.
A toolbar appears at the top, a properties panel on the right, a status bar at the
bottom — a frame around the Three.js viewport. The viewport remains Three.js;
everything surrounding it is React. The two coexist on the same page.*
