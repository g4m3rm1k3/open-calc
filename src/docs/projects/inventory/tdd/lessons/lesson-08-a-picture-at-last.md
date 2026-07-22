# Lesson 8: A Picture, At Last

## What you will build

`cnc-web/src/viewport.ts`'s `createViewport()` — a real 3D scene, built
with Three.js, rendering the exact real path data Lesson 6/7 already
proved works end to end. `main.ts` now draws an actual line through
`{"x":0,"y":0,"z":0} → {"x":10,"y":20,"z":0} → {"x":30,"y":20,"z":0} →
{"x":30,"y":20,"z":-5}` — real, moving pixels, verified this session with
a real screenshot from a real headless browser. This closes the pipeline's
last empty box, named since Lesson 1: `Picture`. The transferable
problem: **a 3D scene is not one object, it's several independent, always-
present pieces (something to render into, something being looked at, a
point of view, light to see by) that all have to exist before anything
can be drawn at all** — the "hardcoded triangle on day one" this
curriculum's own contract names as the correct starting order.

## What you need to know first

Lesson 7: `cnc-web`'s TypeScript/Vite setup, interfaces, `async`/`await`,
generics. Lesson 6: `/api/path`'s real point data. This lesson adds a new
module (`viewport.ts`) and one new import in `main.ts` — nothing already
built changes behavior.

## Concepts cataloged from this lesson

Full standalone treatments live in `../concepts/`. Pointers to each are
also placed inline at their point of use below.

- `../concepts/typescript-types-only-package.md`
- `../concepts/threejs-renderer-scene-camera.md`
- `../concepts/javascript-hexadecimal-number-literal.md`
- `../concepts/javascript-logical-or-default-fallback.md`
- `../concepts/radians-rotation-unit.md`
- `../concepts/threejs-orbitcontrols.md`
- `../concepts/threejs-lighting-basics.md`
- `../concepts/threejs-gridhelper-spatial-reference.md`
- `../concepts/javascript-array-map.md`
- `../concepts/threejs-geometry-material-object.md`
- `../concepts/browser-request-animation-frame.md`
- `../concepts/javascript-drain-collection-while-loop.md`
- `../concepts/dependency-injection.md` — added retroactively, found
  missing while cross-referencing a professional-software-engineering-
  concepts checklist: `createViewport(container)` receiving its target
  element from outside, rather than looking it up internally, is a real,
  narrow instance of this pattern.

## Pipeline diagram

```
Text → Tokens → Commands → Machine State → Points → Picture
```
This lesson builds the **fifth and final named** stage, `Points →
Picture`, for the first time — every box in this pipeline, stated back
in this project's very first real lesson, now has real code behind it.
Concrete value: the same four points traced through every prior lesson
are, this lesson, real vertices of a real line rendered inside a real
`<canvas>` element, confirmed with a real screenshot, not just a JSON
dump.

---

## Concept Unit: Reading the Real Scene, Before Building Anything

### Reference Source, Read for Real This Session

`cnc-sim/cnc/CNCBackplot.tsx` lines 103–133, inside its scene-bootstrap
`useEffect` (quoted, the parts this lesson ports):
```tsx
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setSize(w, h);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(colors.bg, 1);
el.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(colors.bg, 0.0015);

const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 10000);
camera.up.set(0, 0, 1);
camera.position.set(300, -300, 400);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(100, 100, 300);
scene.add(dir);

const grid = new THREE.GridHelper(500, 50, colors.grid, colors.gridAlt);
grid.rotation.x = Math.PI / 2;
scene.add(grid);
```
And the real path-drawing logic, lines 949–956 (the single-color-per-
segment core, quoted; segment-*grouping* by motion mode is named,
deferred to the next lesson):
```tsx
const geo = new THREE.BufferGeometry().setFromPoints(seg.points);
const mat = new THREE.LineBasicMaterial({ color, linewidth: 2 });
const line = new THREE.Line(geo, mat);
group.add(line);
```
And the real color values, read from `cnc-sim/cnc/theme/useCncTheme.js`
lines 12, 22, 28, 46 (the dark-theme palette — this component's own
default, `isDark = true`): `bg: "#07111e"`, `feed: "#46d89f"`,
`rapid: "#ff8b8b"`, `grid: "#131c28"`.

**Named, deliberate deviations from this real source:**
1. The reference wraps all of this in a React `useEffect` — this
   project's frontend is still in its plain-TypeScript stage
   (`CURRICULUM.md`'s own named Stage 1, before the later, planned React
   transition). This lesson ports the real Three.js calls themselves,
   verbatim in spirit, inside a plain function instead of a `useEffect`
   callback — the React wrapping is real, later work, not skipped
   silently.
2. `TransformControls`, the click-to-select-a-fixture raycaster logic,
   and every STL/OBJ/FBX/GLTF/Collada/PLY loader import (reference lines
   4–11) are **not ported** — none of them exist as concepts in this
   project yet (fixtures, model import — both real, much later build-
   order items). Only the base scene (renderer, camera, controls, lights,
   grid) and path rendering are ported this lesson.
3. Per-segment coloring by motion mode (`seg.mode === "G00" ? colors.rapid
   : channelColor`, reference lines 913–953) is **named, deferred to the
   next lesson** — this project's current `/api/path` (Lesson 6) doesn't
   yet return which motion mode produced each point, only the point
   itself; this lesson draws the whole path as one single-color line, the
   smallest real vertical slice, matching this curriculum's own "the
   visualiser comes first, even a hardcoded triangle" principle before
   adding a second real feature (segment coloring) on top of it.
4. `scene.fog` (`FogExp2`) and `renderer.setPixelRatio` are real, present
   in the reference, and skipped here as genuinely cosmetic — named
   explicitly rather than silently, since nothing about them is
   incompatible with this project, they simply don't change whether
   anything is visible yet.

### Commands, Run for Real

```
npm install three
npm install --save-dev @types/three
```
`three` — the actual Three.js library, the same one the reference app
uses; `@types/three` — **(a) first appearance** of a **separate types
package**.
*(Full standalone treatment: ../concepts/typescript-types-only-package.md.)*
Some JavaScript libraries (including `three`) ship their
actual code without built-in TypeScript type information, so the types
are published separately, under the `@types/` scope, purely so `tsc` can
check code that uses them — this package contributes zero runtime
behavior, only compile-time information, which is exactly why it's a
`devDependency` (Lesson 7's own distinction) and not a regular one.

### Project Change

- **Reference Source** — `cnc-sim/cnc/CNCBackplot.tsx` lines 103–133 and
  949–956; `cnc-sim/cnc/theme/useCncTheme.js` lines 12/22/28/46; all
  quoted and reconciled above.
- **Files affected** — new `cnc-web/src/viewport.ts`; modified
  `cnc-web/index.html` and `cnc-web/src/main.ts`.
- **Change type** — add.
- **Location** — `src/`, alongside `main.ts`.
- **Dependencies** — `three`, `@types/three`.

---

## Concept Unit: A Renderer, a Scene, and a Camera — the Three Things Nothing Else Can Exist Without

*(Full standalone treatment: ../concepts/threejs-renderer-scene-camera.md.)*

### The Problem

Three.js has no single "3D view" object — a picture requires **three**
separate, always-present things working together: something that
actually draws pixels (a **renderer**), a container holding every object
that exists (a **scene**), and a point of view to draw the scene *from*
(a **camera**). None of the three is optional; a renderer with no scene
draws nothing, a scene with no camera has no defined view of it, and a
camera pointed at nothing still needs a renderer to turn it into pixels.

### The New Code

```typescript
import * as THREE from "three";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.setClearColor(BACKGROUND_COLOR, 1);
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
camera.up.set(0, 0, 1);
camera.position.set(300, -300, 400);
```

### The Updated Project

The start of the new `cnc-web/src/viewport.ts`:
```typescript
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const BACKGROUND_COLOR = 0x07111e;
const GRID_COLOR = 0x131c28;
const PATH_COLOR = 0x46d89f;

interface Point {
  x: number;
  y: number;
  z: number;
}

export function createViewport(container: HTMLElement) {
  const width = container.clientWidth || 700;
  const height = container.clientHeight || 400;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setClearColor(BACKGROUND_COLOR, 1);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
  camera.up.set(0, 0, 1);
  camera.position.set(300, -300, 400);
```
As a whole so far: `createViewport`, given any real HTML element,
creates and inserts a real `<canvas>` (`renderer.domElement`) sized to
fit it, an empty scene, and a camera positioned to look at the scene from
a specific, real, ported angle.

### Mechanical Walkthrough

- `0x07111e` / `0x131c28` / `0x46d89f` — **(a) first appearance** of
  JavaScript's **hexadecimal number literal** syntax.
  *(Full standalone treatment: ../concepts/javascript-hexadecimal-number-literal.md.)*
  `0x` prefixes a
  base-16 number; Three.js accepts colors as plain numbers in this exact
  form, matching the reference's own hex color strings
  (`"#07111e"` → `0x07111e`) one-to-one.
- `interface Point { x: number; y: number; z: number; }` — **(b)
  reappearing** (Lesson 7), a second, independent declaration of the same
  shape `main.ts` already declares — **(a) worth naming**: TypeScript has
  no built-in way to *share* one interface across files without an
  explicit `import`/`export`; this project accepts one small duplication
  now rather than adding a shared-types file for a single, simple shape —
  a real, named, minor debt, not an oversight.
- `export function createViewport(container: HTMLElement) { ... }` —
  **(b) reappearing** function/type-annotation syntax (Lesson 7) and ES
  module `export` (Lesson 7's `vite.config.ts`;
  *full standalone treatment: ../concepts/javascript-es-modules-import-export.md*);
  `HTMLElement` — **(a) first appearance** of a real, specific DOM type —
  the general type for *any* HTML element, used here (rather than a more
  specific one) because this function should accept whatever container
  its caller chooses. *(Added retroactively, found missing while
  cross-referencing a real "what every professional developer should
  know" checklist: `createViewport` receiving its own target element as
  a parameter, rather than reaching for `document.querySelector`
  internally, is a real, if narrow, instance of **dependency injection**
  — the dependency (which real DOM element) is supplied from outside,
  not decided internally. Full standalone treatment:
  ../concepts/dependency-injection.md.)*
- `container.clientWidth || 700` — **(a) first appearance** of `||` used
  for a **fallback default**.
  *(Full standalone treatment: ../concepts/javascript-logical-or-default-fallback.md.)*
  `clientWidth` (a real, already-known-shape
  browser property returning an element's rendered width in pixels) could
  be `0` if the element isn't attached to the visible page yet; `0` is
  falsy in JavaScript, so `|| 700` supplies a sane default exactly when
  that happens, the same real technique the reference itself uses
  (`el.clientWidth || 700`, line 98) verbatim.
- `new THREE.WebGLRenderer({ antialias: true })` — **(a) first
  appearance** of the actual rendering object: it owns a real `<canvas>`
  element (`.domElement`) and knows how to draw a `Scene` as seen by a
  `Camera` onto it, using the browser's WebGL API underneath (a lower-
  level browser graphics API this project never touches directly — Three.
  js exists specifically to avoid needing to). `antialias: true` smooths
  jagged line/edge pixels, a real, visible quality tradeoff (slightly
  more GPU work) accepted here because it's the reference's own real
  setting.
- `renderer.setSize(width, height)` / `.setClearColor(BACKGROUND_COLOR,
  1)` — sets the canvas's real pixel dimensions and its background color
  (the `1` is opacity — fully opaque).
- `container.appendChild(renderer.domElement)` — **(b) reappearing**
  general DOM insertion (the general mechanism, if not this exact call,
  already implied by Lesson 1's DOM work) — this is the one line that
  actually puts a real, visible `<canvas>` onto the page at all.
- `new THREE.Scene()` — **(a) first appearance** — an empty container;
  everything meant to be visible (lights, the grid, the path — all
  following units) must be explicitly `.add()`ed to it, or the renderer
  has nothing to draw.
- `new THREE.PerspectiveCamera(45, width / height, 0.1, 10000)` — **(a)
  first appearance**, four real, specific arguments, each ported
  verbatim: `45` — field of view, in degrees (how wide an angle the
  camera sees, like a real camera lens); `width / height` — **aspect
  ratio**, so the image isn't stretched; `0.1` — the near clipping plane
  (nothing closer than this renders); `10000` — the far clipping plane
  (nothing farther renders) — `0.1`–`10000` gives a huge real range,
  appropriate for a workspace that could be measured in millimeters or
  meters.
- `camera.up.set(0, 0, 1)` — **(a) first appearance, and a real,
  deliberate, load-bearing detail**: Three.js's own default "up"
  direction is the Y axis; this line overrides it to Z — matching real
  CNC/CAD convention (Z is "up," the spindle's own axis), the exact same
  convention `MachineState` (Lesson 5) already uses for its `z` field.
  Skipping this line wouldn't crash anything — it would just orient the
  whole scene sideways relative to every other part of this project.
- `camera.position.set(300, -300, 400)` — a specific, real starting
  viewpoint (up and to one side, looking down at the origin), ported
  exactly rather than picked freely.

### CS Lens

Three separate, cooperating objects — one that draws, one that holds what
can be drawn, one that defines the viewpoint — none of which does the
others' job, is the same **separation of concerns** already named
repeatedly in this project's backend (Lesson 2's `core`/`app` boundary,
Lesson 5's `Parser`/`MachineState` split): each piece can be reasoned
about, and even swapped, independently — a second camera looking at the
same scene from a different angle, for instance, needs no changes to the
renderer or the scene at all.

Also recognized in: any real camera/rendering pipeline in game engines
(Unity, Unreal — scene graph, camera, renderer as genuinely distinct
concepts), the MVC pattern's own separation of "what exists" (model) from
"how it's shown" (view), and photography itself — a scene, a lens
(field of view), and a light-sensitive surface (the renderer/film) are
three different physical things even in a real camera.

### SE Lens

Building this scene as a single plain function (`createViewport`)
returning a small, focused object (`{ drawPath }`) — rather than, say, a
large class with many public methods, or scattering renderer/scene/
camera as loose top-level variables in `main.ts` — keeps this module's
entire public surface to exactly what a caller needs (draw a path) while
every Three.js-specific detail (which color, which camera angle) stays
private inside the function's closure. This mirrors Lesson 2's `core`
boundary at a smaller scale: `main.ts` doesn't need to know a `THREE.
Scene` exists at all to use this module correctly.

---

## Concept Unit: A Camera the User Can Actually Move

*(Full standalone treatment: ../concepts/threejs-orbitcontrols.md.)*

### The Problem

A fixed camera position is real, but static — a real backplotting tool
(this project's whole named goal) needs to be rotated, panned, zoomed by
a real person looking at a real toolpath from different angles.

### The New Code

```typescript
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.target.set(0, 0, 0);
```

### Mechanical Walkthrough

- `import { OrbitControls } from "three/examples/jsm/controls/
  OrbitControls.js"` — **(a) first appearance** of importing from a
  *specific subpath* of a package rather than its top level (`three`
  itself, imported above) — `OrbitControls` isn't part of Three.js's
  core library; it's one of many optional "examples" modules shipped
  alongside it, imported explicitly only when used, exactly matching the
  reference's own identical import path.
- `new OrbitControls(camera, renderer.domElement)` — **(a) first
  appearance** — a real, ready-made object that listens for mouse/touch
  events on the given DOM element (the canvas) and moves the given camera
  in response — drag to orbit, scroll to zoom, right-drag to pan, all
  real behavior this project never had to write by hand.
- `controls.enableDamping` / `.dampingFactor = 0.08` — **(a) first
  appearance** — damping makes the camera continue moving briefly after
  the mouse stops, decelerating smoothly rather than snapping to an
  instant stop; `0.08` (a real, ported value, not a default) controls how
  quickly that deceleration happens.
- `controls.target.set(0, 0, 0)` — the point the camera orbits *around* —
  the workspace origin, the same origin `MachineState` (Lesson 5) starts
  every simulation from.

### CS Lens / SE Lens

`OrbitControls` is a real, working example of **not reinventing a solved
problem** — camera-orbit math (converting a mouse drag into a rotation
around a target point, correctly, across every possible camera
orientation) is genuinely fiddly to get right; using Three.js's own
maintained implementation, exactly as the reference does, is the correct
engineering choice here, the same instinct already named for `re`
(Lesson 2) over hand-written character scanning: a library exists because
the problem is real and already solved well.

---

## Concept Unit: Nothing Is Visible Without Light

*(Full standalone treatment: ../concepts/threejs-lighting-basics.md.)*

### The New Code

```typescript
scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(100, 100, 300);
scene.add(directionalLight);
```

### Mechanical Walkthrough

- `new THREE.AmbientLight(0xffffff, 0.7)` — **(a) first appearance** —
  light with no source or direction, applied *equally* to every surface
  in the scene regardless of its orientation; `0xffffff` (white),
  `0.7` intensity. On its own, ambient light alone makes a scene visible
  but completely flat — no shading, since nothing is darker on one side.
- `new THREE.DirectionalLight(0xffffff, 0.8)` /
  `.position.set(100, 100, 300)` — **(a) first appearance** — light
  travelling in one consistent direction (like real sunlight, effectively
  from infinitely far away), which *does* shade surfaces differently
  depending on their angle to it — its `.position` here sets the
  direction it shines *from*, toward the origin.
- `scene.add(...)` (twice) — **(c) already established** `scene.add`,
  applied to lights instead of the camera/controls above (which aren't
  scene members — cameras and controls are separate from what a scene
  contains).

### CS Lens

Two different light *models* — one uniform, one directional — combined,
is the standard, minimal real-time lighting setup used across nearly
every real-time 3D application, because a scene lit only by direction
has harsh, fully-black shadows, and a scene lit only ambiently has no
depth cues at all; combining both is a real, deliberate tradeoff between
visual realism and rendering cost (this project's own line-based toolpath
doesn't even need shading yet — named honestly, since a `LineBasicMaterial`
line, added next unit, ignores scene lighting entirely; these lights
exist now because the *next* real features — solid stock, Lesson 42-
equivalent in this rebuild's own future — will need them, and adding them
alongside the rest of the reference's real scene bootstrap now avoids
revisiting this exact function later).

---

## Concept Unit: A Grid to Judge Scale and Orientation By

*(Full standalone treatment: ../concepts/threejs-gridhelper-spatial-reference.md.)*

### The New Code

```typescript
const grid = new THREE.GridHelper(500, 50, GRID_COLOR, GRID_COLOR);
grid.rotation.x = Math.PI / 2;
scene.add(grid);
```

### Mechanical Walkthrough

- `new THREE.GridHelper(500, 50, GRID_COLOR, GRID_COLOR)` — **(a) first
  appearance** — a real, built-in Three.js utility object: a flat grid,
  `500` units wide, divided into `50` divisions, colored (this project's
  own simplification: both color arguments are the same value, since this
  project's real theme file doesn't define a distinct second grid color
  — named honestly rather than guessed).
- `grid.rotation.x = Math.PI / 2` — **(a) first appearance** — real use of
  **radians** as a rotation unit.
  *(Full standalone treatment: ../concepts/radians-rotation-unit.md.)*
  Three.js's
  `GridHelper` is built flat on the X/Z plane by default (matching
  Three.js's own default "Y is up" convention); rotating it a quarter-turn
  (`Math.PI / 2` radians = 90°) around the X axis lays it flat on the
  X/Y plane instead, matching this project's own Z-up convention
  (`camera.up.set(0, 0, 1)`, above) — the same real trigonometric unit
  (`Math.PI`, radians) `LessonContract` itself requires deriving, not
  assuming, whenever it appears; here, one quarter of a full turn
  (`2 * Math.PI`) reorients one plane onto another.

### CS Lens

A grid is a **spatial reference frame** — without one, a camera move or a
path segment has no way to be judged against a known scale; this is the
exact same role a ruler or graph paper plays for a 2D drawing, translated
into 3D.

---

## Concept Unit: Turning Real Points Into a Real, Visible Line

*(Full standalone treatments: ../concepts/javascript-array-map.md,
../concepts/threejs-geometry-material-object.md.)*

### The Problem

Everything above exists purely to make the *next* part possible: taking
the real `{x, y, z}` points Lesson 6 already produces and turning them
into something the renderer can actually draw.

### The New Code

```typescript
const pathGroup = new THREE.Group();
scene.add(pathGroup);

function drawPath(points: Point[]) {
  while (pathGroup.children.length) {
    pathGroup.remove(pathGroup.children[0]);
  }
  if (points.length < 2) return;
  const vectors = points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
  const geometry = new THREE.BufferGeometry().setFromPoints(vectors);
  const material = new THREE.LineBasicMaterial({ color: PATH_COLOR });
  const line = new THREE.Line(geometry, material);
  pathGroup.add(line);
}
```

### The Updated Project

The complete, new `cnc-web/src/viewport.ts`, nothing elided:
```typescript
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const BACKGROUND_COLOR = 0x07111e;
const GRID_COLOR = 0x131c28;
const PATH_COLOR = 0x46d89f;

interface Point {
  x: number;
  y: number;
  z: number;
}

export function createViewport(container: HTMLElement) {
  const width = container.clientWidth || 700;
  const height = container.clientHeight || 400;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setClearColor(BACKGROUND_COLOR, 1);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
  camera.up.set(0, 0, 1);
  camera.position.set(300, -300, 400);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.target.set(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(100, 100, 300);
  scene.add(directionalLight);

  const grid = new THREE.GridHelper(500, 50, GRID_COLOR, GRID_COLOR);
  grid.rotation.x = Math.PI / 2;
  scene.add(grid);

  const pathGroup = new THREE.Group();
  scene.add(pathGroup);

  function drawPath(points: Point[]) {
    while (pathGroup.children.length) {
      pathGroup.remove(pathGroup.children[0]);
    }
    if (points.length < 2) return;
    const vectors = points.map((p) => new THREE.Vector3(p.x, p.y, p.z));
    const geometry = new THREE.BufferGeometry().setFromPoints(vectors);
    const material = new THREE.LineBasicMaterial({ color: PATH_COLOR });
    const line = new THREE.Line(geometry, material);
    pathGroup.add(line);
  }

  function render() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  return { drawPath };
}
```
As a whole: `createViewport` builds the entire real scene once, starts a
continuous render loop, and hands back exactly one function
(`drawPath`) — the only thing any caller actually needs to do anything
useful with this module.

### Mechanical Walkthrough (new lines only)

- `new THREE.Group()` — **(b) reappearing** grouping concept (this
  project's own `MachineState`/`Parser` don't use it, but the reference's
  own `pathLayer`, ported here directly, is exactly this) — a container
  that can hold multiple objects and be cleared/manipulated as one unit,
  used here so a *new* path can cleanly replace an *old* one.
- `while (pathGroup.children.length) { pathGroup.remove(pathGroup.
  children[0]); }` — **(a) first appearance** of clearing every child
  from a group by draining it.
  *(Full standalone treatment: ../concepts/javascript-drain-collection-while-loop.md.)*
  Removing index `0` repeatedly until none remain (`.
  remove` shifts remaining children down, so always removing index `0`
  eventually empties the whole list) — necessary so calling `drawPath`
  a second time doesn't leave the *previous* path's line still in the
  scene alongside the new one.
- `points.map((p) => new THREE.Vector3(p.x, p.y, p.z))` — **(a) first
  appearance** of `.map()`.
  *(Full standalone treatment: ../concepts/javascript-array-map.md.)*
  Transforms every element of an array into a
  new array of *different* values, one-to-one, here converting this
  project's own plain `{x, y, z}` objects (Lesson 6's real shape) into
  Three.js's own `Vector3` type, which is what its geometry APIs actually
  require.
- `new THREE.BufferGeometry().setFromPoints(vectors)` — **(a) first
  appearance** — `BufferGeometry` is Three.js's real, GPU-friendly
  representation of a shape's raw vertex data; `.setFromPoints(...)`
  builds one directly from an ordered list of points — exactly the
  reference's own identical call (line 950), applied to this project's
  own real path instead of the reference's `pathPoints`.
- `new THREE.LineBasicMaterial({ color: PATH_COLOR })` — **(a) first
  appearance** — a **material** describes *how* a geometry's surface (or,
  here, line) should look when rendered; `LineBasicMaterial` is
  specifically for lines, ignoring scene lighting entirely (named in the
  previous unit) — a flat, single, solid color.
- `new THREE.Line(geometry, material)` — **(a) first appearance** —
  combines a geometry (the *shape*) and a material (the *appearance*)
  into one real, addable scene object — the same geometry/material
  pairing pattern every drawable Three.js object uses (a `Mesh`, for
  solid shapes, pairs the same way — a real, later lesson's concern).
- `function render() { controls.update(); renderer.render(scene,
  camera); requestAnimationFrame(render); }` — **(a) first appearance**
  of a real **render loop**.
  *(Full standalone treatment: ../concepts/browser-request-animation-frame.md.)*
  `controls.update()` applies any pending
  damped camera movement since the last frame; `renderer.render(scene,
  camera)` draws the current state of the scene, from the camera's
  viewpoint, onto the canvas; `requestAnimationFrame(render)` — **(b)
  reappearing** browser API, already named (not yet used in code) in this
  project's own `LessonContract` performance section — schedules
  `render` to run again just before the browser's *next* repaint, the
  standard way to animate anything smoothly instead of using a fixed
  timer. This function calling itself this way, forever, is why the
  camera keeps responding to `OrbitControls`' damping even with no new
  path data — the scene is genuinely being redrawn continuously, not just
  once.

### CS Lens

A function that schedules itself to run again every frame, forever, is a
**continuous render loop** — the graphics-programming cousin of this
project's own backend `Execution` concept (a planned, not-yet-built
piece, per `CURRICULUM.md`'s deferred-item list) and, more immediately, of
Lesson 1's own definition of a server: *"a program that starts, then
waits — forever, in a loop."* A render loop is that same shape, applied
to drawing instead of network requests: start, then repeat forever,
reacting to whatever state currently exists.

Also recognized in: literally every real-time game or simulation
(60-frames-per-second loops, the same `16.6ms` budget this curriculum's
own `LessonContract` names for animation work), video playback, and any
live dashboard that redraws itself continuously rather than once.

### SE Lens

Clearing and rebuilding the entire path `Line` on every `drawPath` call,
rather than mutating an existing geometry's vertex data in place, is the
simpler, real choice made here — genuinely wasteful at large scale (a
real, later optimization this project's own reference already solved once
for its heightmap carving, an unrelated feature) but correct and easy to
reason about for a toolpath this size, and consistent with this
project's own repeated "verified simplicity now, named optimization
later" pattern (Lesson 5's recompute-over-reuse choice for
`/api/simulate` is the identical tradeoff, made for the identical
reason).

---

## Concept Unit: Wiring the Real Data In

### The New Code

```typescript
import { createViewport } from "./viewport.ts";

const viewportElement = document.querySelector<HTMLDivElement>("#viewport")!;
const viewport = createViewport(viewportElement);

fetchPath(program).then((points) => {
  pointsElement.textContent = JSON.stringify(points, null, 2);
  viewport.drawPath(points);
});
```

### The Updated Project

The complete, current `cnc-web/src/main.ts`, nothing elided:
```typescript
import { createViewport } from "./viewport.ts";

interface Point {
  x: number;
  y: number;
  z: number;
}

interface PathResponse {
  points: Point[];
}

async function fetchPath(program: string): Promise<Point[]> {
  const response = await fetch("http://127.0.0.1:5000/api/path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program }),
  });
  const data: PathResponse = await response.json();
  return data.points;
}

const program = "G0 X10 Y20\nX30\nG1 Z-5 F100";
const pointsElement = document.querySelector<HTMLPreElement>("#points")!;
const viewportElement = document.querySelector<HTMLDivElement>("#viewport")!;
const viewport = createViewport(viewportElement);

fetchPath(program).then((points) => {
  pointsElement.textContent = JSON.stringify(points, null, 2);
  viewport.drawPath(points);
});
```
As a whole: the same real fetch this project has run since Lesson 7 now
feeds *two* consumers — the raw JSON display (unchanged) and the new 3D
viewport — from one single real network response.

### Mechanical Walkthrough

- `import { createViewport } from "./viewport.ts"` — **(b) reappearing**
  import syntax, a relative path (`./`) to a sibling file in the same
  project for the first time in `cnc-web` (Lesson 7's only import was
  from the `three`/browser-global level).
- `document.querySelector<HTMLDivElement>("#viewport")!` — **(c)
  already established** (Lesson 7's identical pattern, a different
  element type and id).
- `viewport.drawPath(points)` — **(c) already established** function
  call syntax, added as a second statement inside the existing `.then`
  callback — the only change to already-working code this lesson makes.

### Commands and Real Output

```
npx tsc --noEmit
```
**Real output:** none — a clean pass, no type errors, confirmed this
session before running anything.

Both servers running (`cnc-service` on `5000`, `cnc-web` on `5180`), a
real headless browser (Playwright, this session) loaded the actual page:
```
canvas elements inside #viewport: 1
console/page errors: []
```
A real screenshot was captured and inspected this session: a dark
scene, a real perspective grid receding into the distance, and a small,
real, green line segment near the grid's center — the exact real path
this project's own `/api/path` returns for
`"G0 X10 Y20\nX30\nG1 Z-5 F100"`, small relative to the 500-unit grid
because the program itself only moves 30mm in X and 20mm in Y — a real,
correctly-scaled result, not a placeholder.

---

## Connect the Pieces

The complete pipeline, end to end, for the first time:

1. `"G0 X10 Y20\nX30\nG1 Z-5 F100"` — real text.
2. Tokenized (Lesson 2/3), parsed into modal commands (Lesson 4).
3. Folded into a final position (Lesson 5) and scanned into four real
   points (Lesson 6).
4. Fetched by `cnc-web`, across a real, CORS-permitted cross-origin
   request (Lesson 7), typed as `Point[]`.
5. Converted into `THREE.Vector3`s, built into a `BufferGeometry`, drawn
   as a real `THREE.Line`, inside a real scene, viewed through a real,
   user-orbitable camera, lit, gridded, and rendered continuously to an
   actual `<canvas>` element on the page — this lesson.

Every box named in this project's very first real lesson's pipeline
diagram now has real, verified code behind it.

## What Breaks Without This

Caused for real, this session — commenting out `camera.up.set(0, 0, 1)`
and reloading:
the grid and path still render, but rotated 90° from every other part of
this project's own Z-up convention — nothing crashes, nothing errors,
the scene is simply, silently, wrong relative to `MachineState`'s own
axes. Restored immediately after confirming this — a real, live
demonstration of why a single, easy-to-miss line matters: no exception,
no console error, just a visually incorrect scene that only looks wrong
if you already know what "right" looks like.

## Exercises

1. Change `PATH_COLOR` to `0xff0000` (red) and confirm the line's real
   color changes on reload.
2. Call `viewport.drawPath([])` (an empty array) from the browser's own
   dev console after the page loads. Confirm nothing crashes and no line
   remains, and explain why from `drawPath`'s own `if (points.length < 2)
   return;` guard.
3. Change `program` in `main.ts` to a longer one (e.g., add a few more
   `X`/`Y` moves) and confirm the rendered line visibly changes shape to
   match.

## Definition of Done

- [ ] `cnc-web/src/viewport.ts` exists; `npx tsc --noEmit` passes with no
      errors.
- [ ] Opening `http://localhost:5180/` in your own browser (with
      `cnc-service` running) shows a real, dark 3D scene with a visible
      grid and a real, small green line matching the sample program.
- [ ] Dragging inside the viewport with your mouse orbits the camera in
      real time.
- [ ] You reproduced the `camera.up` removal yourself and observed the
      scene silently rotate relative to the rest of the project's axes.
- [ ] You completed Exercises 1–3 and observed the described real
      behavior.
- [ ] A git commit exists explaining *why* (the pipeline's final named
      stage, `Points → Picture`, now has real code — every stage in this
      project's own first-lesson diagram is real, not a claim).
