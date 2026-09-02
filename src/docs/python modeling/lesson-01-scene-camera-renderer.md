# Lesson 1: Scene, Camera, Renderer — What They Actually Are

**What you will build:** the three objects every Three.js program needs
before anything can appear on screen — a `Scene`, a `Camera`, and a
`Renderer` — understood as what they actually are underneath the API
(a container, a set of numbers, a pixel-painter), not just as names you
call methods on. By the end, you'll have a real, working page rendering
actual pixels — no triangle yet, just proof the pipeline itself works.

**What you need to know first:** nothing — Lesson 1. You already know
JavaScript basics (this curriculum won't re-teach loops/conditionals/
functions); the new material here is entirely about what Three.js's own
objects represent.

**A note on how this lesson is verified, since it differs from the
Python curriculum:** this session has no browser, so anything that's
genuinely Three.js/WebGL can't be executed by me — only by you, in your
own browser. Every throwaway lab in this lesson that's pure logic is
still real, executed Node.js, exactly like before. The one piece that's
actually Three.js gets its own small HTML file, with exactly what you
should see described so you can confirm it yourself.

**Terms used in this lesson:**
- **scene graph** — a tree-shaped structure holding everything that
  exists in a 3D program — objects, lights, cameras — where each item
  can have children of its own. It exists because a 3D program usually
  needs to move, group, and organize many things together (a car object
  might have four wheel objects as children, so moving the car moves
  the wheels automatically) — a flat list of unrelated objects can't
  express that relationship, but a tree can.
- **`THREE.Scene`** — Three.js's own scene graph root: a container you
  add objects to, and the thing you hand to the renderer to say "draw
  everything in here."
- **`THREE.Object3D`** — the base class nearly everything in Three.js
  is built on (cameras, meshes, lights, groups) — anything with a
  position, a rotation, and the ability to have children of its own in
  the scene graph. Knowing this now matters later: a camera isn't a
  special case with its own unique positioning system — it's an
  `Object3D`, positioned exactly the same way anything else in the
  scene is.
- **`THREE.PerspectiveCamera`** — a specific kind of `Object3D`
  representing a viewpoint: where you're looking from (`.position`,
  inherited from `Object3D`) and how you're looking (field of view,
  aspect ratio, near/far clipping — Lesson 4 covers what these actually
  do). It exists to answer one question for the renderer: "from where,
  and through what lens, should this scene be drawn?"
- **`THREE.WebGLRenderer`** — the object that actually turns a `Scene`
  and a `Camera` into pixels, drawn into an HTML `<canvas>` element,
  using the browser's WebGL (GPU-accelerated graphics) API underneath.
  It exists as the one piece of this trio that does real work — `Scene`
  and `Camera` are just organized data; `Renderer` is what reads that
  data and produces an actual image.
- **render loop** — a function that calls itself repeatedly, once per
  displayed frame, re-drawing the scene every time — needed even for a
  perfectly still scene, because nothing appears on screen until
  `renderer.render(scene, camera)` is actually called at least once,
  and needed continuously the moment anything (camera movement, an
  animation) should ever change.
- **`requestAnimationFrame`** — the browser's own built-in function for
  scheduling "call this function again right before the next screen
  repaint" — the standard way to drive a render loop, because it
  automatically matches your monitor's refresh rate rather than running
  faster or slower than the screen can actually show.

**Objects and methods used:**

- **`THREE.Scene`**
  - *What it is:* the root container of the scene graph (this lesson's
    own term) — everything the renderer will draw has to be added to
    one of these, directly or as a descendant.
  - *Implementation:* a class with a `.children` array (inherited from
    `Object3D`) and an `.add(object)` method that appends to it.
  - *Its use:* every mesh your own OBJ parser eventually builds
    (Lesson 10) gets added to a `Scene` before it can be rendered at
    all.
  - *Type:* a class, instantiated with `new THREE.Scene()`.
  - *Responsibility:* to hold a reference to everything that should be
    drawn, with no opinion about *how* to draw any of it — that's the
    renderer's job.
  - *Depends on:* nothing — a `Scene` can be created with zero
    arguments.
  - *Connects to:* objects are added to it via `.add()`; it's handed to
    `renderer.render(scene, camera)` as the first argument.
  - *Shape:* the top of the scene graph — everything else in a Three.js
    program either is the scene, is added to it, or is added to
    something that's added to it.

- **`THREE.PerspectiveCamera`**
  - *What it is:* a viewpoint object — where you're looking from, and
    the lens parameters describing how much of the scene is visible.
  - *Implementation:* `new THREE.PerspectiveCamera(fov, aspect, near,
    far)` — four numbers at construction time, plus an inherited
    `.position` (from `Object3D`) you set afterward.
  - *Its use:* handed to `renderer.render(scene, camera)` as the second
    argument — the renderer needs both *what* to draw (the scene) and
    *from where* (the camera) to produce an image at all.
  - *Type:* a class, an `Object3D` subclass.
  - *Responsibility:* to hold the numbers describing a specific
    viewpoint and lens — nothing about *drawing* happens here either;
    a camera with no renderer attached to it does nothing visible on
    its own.
  - *Depends on:* four numbers at construction (`fov`, `aspect`,
    `near`, `far` — Lesson 4's own subject).
  - *Connects to:* handed to `renderer.render()`; its own `.position`
    (inherited from `Object3D`) is set the same way any other object's
    position would be.
  - *Shape:* one specific kind of `Object3D`, alongside meshes, lights,
    and groups — not a fundamentally different kind of thing from
    everything else in the scene graph, just one with camera-specific
    extra data (fov/aspect/near/far) attached.

- **`THREE.WebGLRenderer`**
  - *What it is:* the object that actually produces pixels from a
    scene and a camera.
  - *Implementation:* `new THREE.WebGLRenderer()` creates it; it owns a
    real `<canvas>` element (`renderer.domElement`), which has to be
    added to the actual HTML page for anything to be visible; `renderer.render(scene, camera)`
    performs one actual draw.
  - *Its use:* called once per frame, inside this lesson's own render
    loop.
  - *Type:* a class.
  - *Responsibility:* to read every object in the given scene, figure
    out where it appears from the given camera's viewpoint, and draw
    the result into its own canvas — the one piece of this trio that
    does real computational work, using the GPU via WebGL underneath.
  - *Depends on:* a `Scene` and a `Camera`, supplied fresh on every
    `.render()` call — it doesn't store them permanently itself.
  - *Connects to:* its `.domElement` (a real `<canvas>`) gets attached
    to the page; `.render(scene, camera)` is called from this lesson's
    own render loop.
  - *Shape:* sits outside the scene graph entirely — it's not a
    container and not an `Object3D`; it's the one-way pipeline that
    reads the scene graph and camera and produces an image.

---

## Concept Unit: The Scene — A Container, Not a Picture

### The Problem

A `THREE.Scene` sounds like it might already be "the picture" — the
thing you actually see. It isn't. It's much more boring than that: a
`Scene` is just a structure you add things to, with zero opinion about
pixels, colors, or what anything looks like. That distinction matters
because it's easy to expect a `Scene` to "do" something on its own,
when its entire job is closer to a plain list.

> **Before reading on, try this yourself:** if a `Scene` is "a
> container you add objects to, that later gets handed to something
> else to actually draw," what's the smallest possible version of that
> idea you could write yourself, with no Three.js involved at all —
> just a class with one array and one method to add to it?

### Introduce the Concept in Isolation

```javascript
// Throwaway lab: a "scene" is just a container you add things to
class Container {
    constructor() {
        this.children = [];
    }
    add(obj) {
        this.children.push(obj);
    }
}

const scene = new Container();
console.log(scene.children.length);
scene.add({ name: "triangle" });
scene.add({ name: "light" });
console.log(scene.children.length);
console.log(scene.children.map(c => c.name));
```

Real output (run with `node lab_container.js`):

```
0
2
[ 'triangle', 'light' ]
```

A brand-new `Container` starts empty (`0`); two calls to `.add()`
push two plain objects onto its own `.children` array, and the count
and contents both confirm exactly what was added, in the order it was
added. This *is* the essential shape of `THREE.Scene` — the real class
has more machinery around it (scene graph traversal, matrix updates,
and so on), but the core idea — a `.children` array and an `.add()`
method appending to it — is exactly this.

### Discard the Throwaway Example

This `Container` class is discarded now — the real `THREE.Scene`,
confirmed next, does the same conceptual job with the real library.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`, the line
  `const scene = new THREE.Scene();` — this lesson is where that one
  line stops being something you copy-pasted and starts being something
  you actually understand.
- **Files affected:** create `src/step1_scene.html` (new file) — the
  first of this lesson's browser-run checkpoints.
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** none beyond loading the Three.js library itself
  from a CDN, the same way your existing viewer does.

### The New Code

Type this into a new file, `src/step1_scene.html`:

```html
<!DOCTYPE html>
<html>
<head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
<script>
  const scene = new THREE.Scene();
  console.log(scene.children.length);
  scene.add(new THREE.Object3D());
  console.log(scene.children.length);
</script>
</body>
</html>
```

### The Updated Project

This is the whole new file — nothing larger to return to yet:

```
1  <!DOCTYPE html>
2  <html>
3  <head>
4  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
5  </head>
6  <body>
7  <script>
8    const scene = new THREE.Scene();
9    console.log(scene.children.length);
10   scene.add(new THREE.Object3D());
11   console.log(scene.children.length);
12 </script>
13 </body>
14 </html>
```

### Mechanical Walkthrough

- **line 4** — an ordinary HTML `<script src="...">` tag, loading the
  real Three.js library from a CDN before your own code runs — the same
  library, same CDN, your existing `mesh_viewer.html` already uses.
- **`const scene = new THREE.Scene();`** — `new THREE.Scene()`
  constructs a real scene graph root; `const scene = ...` stores it,
  ordinary JavaScript.
- **`scene.children.length`** — reading the real `.children` array's
  length, the exact property this lesson's own throwaway lab already
  proved the concept of.
- **`scene.add(new THREE.Object3D());`** — `new THREE.Object3D()`
  constructs the plainest possible scene-graph object (this lesson's
  own term) — no geometry, no visible appearance, just a position and
  the ability to have children — and `.add(...)` appends it, the real
  library's own version of the throwaway lab's `Container.add`.

### CS Lens

This is the **composite pattern** — a structural design pattern where
individual objects and groups of objects are treated through the same
interface, so code working with "one thing" and code working with "a
tree of things" can often be the same code. A `Scene` is the root of
exactly this kind of structure.

Also recognized in: the DOM itself (an HTML document is a tree of
nodes, each of which can have children — `document.body.appendChild(...)`
is the identical shape as `scene.add(...)`); file systems (a folder
contains files and other folders, recursively); any GUI framework's own
widget tree (a window containing panels containing buttons).

### SE Lens

The principle is **separating "what exists" from "how it's drawn."** A
`Scene` never asks *how* to render anything — that's the renderer's
job entirely, checked directly in this lesson's next Concept Unit. This
separation is what lets the exact same scene be rendered by different
cameras, or (in principle) different renderers, without the scene
itself needing to know or care.

The alternative not chosen: a single object that's both "the data" and
"the drawing logic" combined — no separate `Scene` and `Renderer` at
all. Some simpler graphics APIs really do work this way (immediate-mode
rendering, where you issue draw calls directly with no persistent scene
structure in between). The cost of that approach: nothing persists
between frames on its own — you'd have to re-describe the entire scene,
every single frame, rather than building it once and letting the
renderer redraw it repeatedly, which is exactly the render loop this
lesson's next Concept Unit needs.

### Commands Needed

None new — just opening `src/step1_scene.html` directly in a browser
(double-click the file, or drag it into a browser window).

### Run It — Yourself, in Your Own Browser

Open `src/step1_scene.html` in a browser and open its developer console
(F12, or right-click → Inspect → Console). You should see:

```
0
1
```

I can't run this myself and confirm it — but here's exactly why those
two numbers are correct if you see them: `scene.children.length` starts
at `0` (a brand-new `Scene`, nothing added yet, matching this Concept
Unit's own throwaway lab's first line), and becomes `1` after the
single `.add()` call. If you see anything else, the most likely cause
is the CDN script failing to load (check the console for a red network
error above these two lines).

### Connect

`Scene` is a container, confirmed both in isolation (the throwaway lab)
and for real (your own browser). Nothing about it draws anything yet.
The next Concept Unit looks at the second of this lesson's three
objects: the camera — itself just data, not magic.

---

## Concept Unit: The Camera — A Viewpoint, Not a Photograph

### The Problem

"Camera" is a loaded word — it's easy to picture something complicated,
maybe even something that itself "sees" the scene. A `THREE.PerspectiveCamera`
is much plainer than that: it's an `Object3D` (this lesson's own term)
with a position, like anything else in the scene graph, plus four extra
numbers describing a lens. It does no seeing, no computing, no drawing,
on its own at all.

> **Before reading on, try this yourself:** if a camera is "just a
> position plus a few extra numbers," what's the simplest object you
> could write, with no Three.js at all, holding exactly that — a
> position and four lens-related numbers — with nothing else attached?

### Introduce the Concept in Isolation

```javascript
// Throwaway lab: a "camera" is just numbers describing a viewpoint, nothing more
class SimpleCamera {
    constructor(fov, aspect, near, far) {
        this.position = { x: 0, y: 0, z: 0 };
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }
}

const camera = new SimpleCamera(45, 16 / 9, 0.1, 1000);
console.log(camera.position);
camera.position.z = 5;
console.log(camera.position);
console.log(camera.fov, camera.aspect, camera.near, camera.far);
```

Real output:

```
{ x: 0, y: 0, z: 0 }
{ x: 0, y: 0, z: 5 }
45 1.7777777777777777 0.1 1000
```

`SimpleCamera` starts at the origin; changing `camera.position.z`
directly — ordinary property assignment, nothing camera-specific about
it at all — moves it. The four lens numbers passed at construction are
just stored, unchanged, read back exactly as given. Nothing here
"looks" at anything or computes an image — it's plain data, confirming
this Concept Unit's own framing.

### Discard the Throwaway Example

This `SimpleCamera` class is discarded now — the real
`THREE.PerspectiveCamera`, confirmed next, is genuinely this simple at
its core, with real rendering machinery elsewhere (inside the renderer,
not the camera) using its numbers.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`, the line
  `const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 100000);`.
- **Files affected:** create `src/step2_camera.html` (new file).
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** the Three.js library, loaded via CDN.

### The New Code

Type this into a new file, `src/step2_camera.html`:

```html
<!DOCTYPE html>
<html>
<head>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
<script>
  const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 1000);
  console.log(camera.position);
  camera.position.set(0, 0, 5);
  console.log(camera.position);
  console.log(camera.fov, camera.aspect, camera.near, camera.far);
</script>
</body>
</html>
```

### The Updated Project

This is the whole new file — nothing larger to return to yet:

```
 1  <!DOCTYPE html>
 2  <html>
 3  <head>
 4  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
 5  </head>
 6  <body>
 7  <script>
 8    const camera = new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 1000);
 9    console.log(camera.position);
10    camera.position.set(0, 0, 5);
11    console.log(camera.position);
12    console.log(camera.fov, camera.aspect, camera.near, camera.far);
13 </script>
14 </body>
15 </html>
```

### Mechanical Walkthrough

- **`new THREE.PerspectiveCamera(45, 16 / 9, 0.1, 1000)`** — four
  arguments, in order: `fov` (field of view, in degrees — Lesson 4's
  own subject), `aspect` (width ÷ height of the view — `16/9` here as
  a fixed stand-in; your real viewer computes it from the actual window
  size), `near` and `far` (the clipping range — also Lesson 4).
- **`camera.position`** — inherited from `Object3D` (this lesson's own
  term); a real `THREE.Vector3` object (not a plain `{x,y,z}` object
  like the throwaway lab's stand-in, but conceptually identical —
  three numbers with a name each).
- **`camera.position.set(0, 0, 5)`** — `Vector3`'s own `.set(x, y, z)`
  method, an ordinary way to update all three components in one call —
  equivalent to setting `.x`, `.y`, `.z` individually, just more
  concise.
- **`camera.fov, camera.aspect, camera.near, camera.far`** — reading
  back the four numbers passed at construction, stored as plain
  properties, exactly like the throwaway lab's own `SimpleCamera`.

### CS Lens

This is **inheritance** (a real OOP concept, distinct from composition
— which your Python curriculum has used constantly; this is the first
time this lesson's own material has needed inheritance specifically):
`PerspectiveCamera` *is an* `Object3D` — it has everything an `Object3D`
has (`.position`, the ability to be added to a scene, to have
children of its own) *plus* its own extra camera-specific data. This is
"is-a," in contrast to Python curriculum's own repeated "has-a"
(composition) — `Triangle` *has a* `Vector3`, but `PerspectiveCamera`
*is an* `Object3D`.

Also recognized in: nearly every GUI framework's own widget hierarchy
(a `Button` *is a* `Widget`, inheriting position/visibility/event
handling, adding its own click behavior); biological taxonomy (a
"camera" analogy aside — the general is-a relationship: a car *is a*
vehicle); every `Mesh`, `Light`, and `Group` in Three.js is *also* an
`Object3D`, the same way `PerspectiveCamera` is — this is the actual
reason every one of them can be positioned and added to a scene the
same way.

### SE Lens

The principle is **sharing common behavior through a base class**,
rather than every scene-graph object (`Mesh`, `Camera`, `Light`, `Group`)
separately reimplementing "have a position," "be addable to a scene,"
"be able to have children." `Object3D` implements that once; every
subclass gets it for free.

The alternative not chosen: give `PerspectiveCamera` its own
independent positioning system, unrelated to how meshes or lights are
positioned. That would work in isolation, but would mean learning a
*second* way to move things around, and — more concretely, foreshadowing
Phase C of this curriculum — a camera-specific rotation system, separate
from every other object's, would make it harder to reuse the exact same
rotation math (quaternions, Lesson 8) for both the camera and any other
object that might need free rotation later.

### Commands Needed

None new.

### Run It — Yourself, in Your Own Browser

Open `src/step2_camera.html` and check its console. You should see:

```
Vector3 {x: 0, y: 0, z: 0}
Vector3 {x: 0, y: 0, z: 5}
45 1.7777777777777777 0.1 1000
```

(The exact console formatting of a `Vector3` may differ slightly
between browsers — Chrome, Firefox, and Safari each print objects a bit
differently — but the `x`/`y`/`z` values themselves should match
exactly.) The first `Vector3` confirms a fresh camera starts at the
origin, same as the throwaway lab's `SimpleCamera`; the second confirms
`.set(0, 0, 5)` moved it; the four numbers on the last line confirm the
constructor arguments were stored, unchanged, exactly as given.

### Connect

Both `Scene` and `Camera` are now understood as what they actually are
— a container, and a positioned bundle of numbers. Neither one, alone
or together, has produced a single visible pixel yet. The final Concept
Unit introduces the one object that actually does: the renderer,
plus the loop that keeps calling it.

---

## Concept Unit: The Renderer and the Render Loop

### The Problem

A `Scene` full of objects and a `Camera` with a position still produce
nothing visible — something has to actually take that data and paint
real pixels into a real `<canvas>`. And painting once isn't enough for
anything that will ever move or be interacted with (this whole
curriculum's actual goal) — a fresh frame has to be painted repeatedly,
which needs the render loop this lesson's own Terms section already
named.

> **Before reading on, try this yourself:** if a render loop is "a
> function that calls itself again, repeatedly," what's the simplest
> way you already know, in plain JavaScript with no Three.js involved,
> to make a function call itself again after a short delay — and keep
> doing that some number of times before stopping?

### Introduce the Concept in Isolation

```javascript
// Throwaway lab: a function that keeps calling itself, over and over
let frameCount = 0;

function renderFrame() {
    frameCount++;
    console.log("frame", frameCount);
    if (frameCount < 5) {
        setTimeout(renderFrame, 0);
    }
}

renderFrame();
```

Real output:

```
frame 1
frame 2
frame 3
frame 4
frame 5
```

`renderFrame` calls `setTimeout(renderFrame, 0)` — scheduling *itself*
to run again — inside its own body, and stops only once `frameCount`
reaches `5`. Five real, sequential calls, confirmed by the printed
count on each one. `setTimeout(fn, 0)` is a genuine, if slightly crude,
way to achieve "call this again soon" in plain JavaScript, available in
Node as well as browsers — `requestAnimationFrame` (this lesson's own
term), used in the real project next, does the identical *shape* of
thing, but ties the timing to the browser's own screen refresh instead
of an arbitrary delay, and only exists in a browser, not in Node — this
lesson's throwaway lab is the closest Node-runnable equivalent.

### Discard the Throwaway Example

This `renderFrame`/`setTimeout` lab is discarded now — the real
project version, confirmed next, uses `requestAnimationFrame` and
actually draws something.

### Project Change

- **Reference Source:** your own `mesh_viewer.html` — the
  `renderer = new THREE.WebGLRenderer(...)`, `document.getElementById('viewport').appendChild(renderer.domElement)`,
  and `function animate() { requestAnimationFrame(animate); renderer.render(scene, camera); } animate();`
  lines.
- **Files affected:** create `src/step3_render_loop.html` (new file) —
  this lesson's first checkpoint that produces actual visible pixels.
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** `THREE.Scene` and `THREE.PerspectiveCamera` (both
  earlier in this lesson).

### The New Code

Type this into a new file, `src/step3_render_loop.html`:

```html
<!DOCTYPE html>
<html>
<head>
<style>body { margin: 0; }</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
</head>
<body>
<script>
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2244aa);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 5);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
</script>
</body>
</html>
```

### The Updated Project

This is the whole new file — nothing larger to return to yet:

```
 1  <!DOCTYPE html>
 2  <html>
 3  <head>
 4  <style>body { margin: 0; }</style>
 5  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
 6  </head>
 7  <body>
 8  <script>
 9    const scene = new THREE.Scene();
10    scene.background = new THREE.Color(0x2244aa);
11
12    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
13    camera.position.set(0, 0, 5);
14
15    const renderer = new THREE.WebGLRenderer();
16    renderer.setSize(window.innerWidth, window.innerHeight);
17    document.body.appendChild(renderer.domElement);
18
19    function animate() {
20      requestAnimationFrame(animate);
21      renderer.render(scene, camera);
22    }
23    animate();
24 </script>
25 </body>
26 </html>
```

### Mechanical Walkthrough

- **`scene.background = new THREE.Color(0x2244aa);`** — setting the
  scene's background to a specific color (a hex value, the same format
  CSS uses) — purely so this checkpoint produces a *visible*, checkable
  result even with nothing else in the scene yet.
- **`camera.position.set(0, 0, 5);`** — positioning the camera 5 units
  back along the z-axis — this specific number doesn't matter yet
  (there's no geometry to look at), but a camera sitting exactly at the
  origin with nothing positioned relative to it is a reasonable default
  to move away from on principle.
- **`const renderer = new THREE.WebGLRenderer();`** — constructing the
  real renderer (this lesson's own term).
- **`renderer.setSize(window.innerWidth, window.innerHeight);`** —
  sizing the renderer's own canvas to fill the browser window — `window.innerWidth`/`.innerHeight`
  are ordinary browser globals, not Three.js-specific.
- **`document.body.appendChild(renderer.domElement);`** — `renderer.domElement`
  (this lesson's own term) is a real `<canvas>` element the renderer
  created internally; `document.body.appendChild(...)` is ordinary DOM
  manipulation (already familiar), inserting that canvas into the
  actual visible page — without this line, the renderer would still
  *work*, but its output canvas would never actually appear anywhere.
- **`function animate() { requestAnimationFrame(animate); renderer.render(scene, camera); }`**
  — the real render loop (this lesson's own term): `requestAnimationFrame(animate)`
  schedules `animate` to run again before the next screen repaint —
  called *first*, inside `animate`'s own body, the identical
  self-scheduling shape as the throwaway lab's `setTimeout(renderFrame, 0)`;
  `renderer.render(scene, camera)` performs one actual draw, using the
  scene and camera built above.
- **`animate();`** — the one call that starts the whole loop — without
  this, `animate` would exist as a function but never actually run.

### CS Lens

This is the **game loop** (or **render loop**, this lesson's own
term) — one of the most fundamental patterns in real-time graphics and
game programming: a function that runs once per frame, for the entire
lifetime of the program, continuously redrawing (and, in a full game
loop, also updating game state, checking input, and so on) rather than
running once and stopping.

Also recognized in: every video game engine ever built; any live data
dashboard that continuously redraws as new data arrives; a
`requestAnimationFrame`-driven CSS/canvas animation on an ordinary
webpage; even a text-based terminal UI that redraws its screen in a
loop reacting to keypresses follows the same fundamental shape.

### SE Lens

The principle is **matching your redraw rate to the display's own
rate**, which is specifically why `requestAnimationFrame` exists instead
of just using `setTimeout` (this lesson's own throwaway lab) with some
guessed delay. `setTimeout(fn, 16)` (roughly 60 times a second) might
seem equivalent, but it doesn't actually know when the browser is about
to repaint the screen — it can run frames the browser then has to
discard (wasted work) or fall out of sync with the display entirely.
`requestAnimationFrame` is told directly by the browser when the next
repaint is about to happen.

The alternative not chosen: render only once, on demand, whenever
something actually changes (a "dirty flag" approach — track whether
anything moved, and only call `renderer.render()` when it did), rather
than an unconditional loop that redraws every single frame regardless.
That's a real, valid optimization many production applications use,
especially for mostly-static scenes, to avoid wasting GPU work on
identical frames. This curriculum's own upcoming lessons (free
rotation, driven continuously by mouse movement) will always have
*something* potentially changing every frame, so the simpler
always-redraw loop built here is the right starting choice — worth
naming honestly as a choice, not the only correct way to do this.

### Commands Needed

None new.

### Run It — Yourself, in Your Own Browser

Open `src/step3_render_loop.html`. You should see a solid blue-ish
rectangle (`0x2244aa`) filling the entire browser window — no shapes,
no triangle, nothing else yet, just proof that `Scene` → `Camera` →
`Renderer` → render loop is a real, working pipeline, end to end,
producing actual pixels. If you see a blank white page instead, check
the console for an error — the most common cause at this stage is the
CDN script failing to load.

### Connect

`Scene`, `Camera`, and `Renderer` are no longer three unfamiliar names —
they're a container, a bundle of positioning/lens numbers, and the one
object that actually turns those into pixels, wired together by a
render loop that keeps calling `renderer.render()` every frame. Nothing
inside the blue rectangle has any actual 3D content yet. Lesson 2 adds
the first one: a single real triangle, built the same way your own OBJ
parser already builds its own data — raw position numbers, no
Three.js helper shapes involved.

---

## Connect the Pieces

One pipeline, traced through every piece this lesson built: `scene`
(first Concept Unit) starts as an empty container, the same shape this
lesson's own `Container` throwaway lab proved with a plain `.children`
array and `.add()`. `camera` (second Concept Unit) is positioned via
`.position.set(0, 0, 5)` — ordinary property-setting on an inherited
`Vector3`, no different in kind from the throwaway `SimpleCamera`'s own
plain `{x,y,z}` object. Neither one does anything visible until
`renderer` (third Concept Unit) is constructed, its canvas attached to
the real page, and `animate()` — a self-scheduling loop, the identical
shape as the throwaway `renderFrame`/`setTimeout` lab — starts calling
`renderer.render(scene, camera)` every frame, at which point a real,
visible blue rectangle finally appears — the entire pipeline confirmed
working, before a single piece of actual 3D geometry exists anywhere in
it.

---

## Try It Yourself

Type all three HTML files into `src/` yourself (not copy-pasted), and
confirm all three `Run It` checkpoints in your own browser. Then, once
`step3_render_loop.html` shows its blue rectangle, try changing the
background color to something else (any valid hex color) and reloading
— confirm for yourself that the render loop really is redrawing
continuously, by opening the console and adding a
`console.log("frame drawn")` line inside `animate()`, right after
`renderer.render(scene, camera)` — watch how fast those lines
accumulate, and think about what that tells you about how many times
per second `requestAnimationFrame` is actually calling your function.
