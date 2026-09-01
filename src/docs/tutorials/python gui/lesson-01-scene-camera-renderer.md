# Lesson 1: A Frame You Can Prove Is Real

**What you will build:** a browser page that shows a single rotating
cube, built from four separate pieces — a `Scene`, a `Camera`, a
`Renderer`, and a render loop — plus the geometry, material, and mesh
needed to have something in the scene worth rendering at all. The
transferable problem this lesson is actually about: every Three.js app,
no matter how complex, is these same six ideas composed together
nothing more is added later, only more of these same six things, wired
up differently. If you can explain why a `WebGLRenderer` is not a
`Scene`, and why nothing appears without all of them present *and*
being asked to run every frame, you can read any Three.js codebase,
including the tangle you already have.

**What you need to know first:** Nothing. This is Lesson 1.

**Terms used in this lesson**

- **ES module (`import`)** — a way of pulling code from another file or
  package into this one, using the `import` keyword, resolved by the
  browser or bundler at load time rather than copy-pasted by hand. It
  exists so a library like Three.js can ship as many separate files
  without every consumer needing to manually concatenate them.
- **Constructor / `new`** — `new SomeClass(...)` builds a fresh object
  from a class's blueprint, running that class's own setup code once
  per call. Without `new`, `SomeClass(...)` would just call it as a
  plain function, not build an instance — the class's internal setup
  logic (called a *constructor function*) wouldn't run correctly.
- **WebGL** — a browser API that talks almost directly to the
  computer's graphics card (GPU) to draw pixels fast, using triangles
  as its basic unit. It exists because drawing millions of shaded
  pixels per frame in plain JavaScript, on the CPU, is far too slow for
  real-time interaction; WebGL exists specifically to hand that work to
  hardware built for it.
- **Canvas (`<canvas>`)** — an HTML element that is a blank rectangle a
  script can draw into pixel by pixel, rather than by placing text or
  images the normal HTML way. It's the actual surface WebGL draws onto;
  without one, there's nowhere for the GPU's output to land on the
  page.
- **DOM (Document Object Model)** — the browser's live, in-memory tree
  representation of the HTML page, which JavaScript can read and
  modify. It matters here because getting a canvas actually visible on
  screen means attaching it into this tree, not just creating it in
  memory.
- **Field of view (FOV)** — how wide an angle, in degrees, the camera
  can "see" vertically, the same idea as a camera lens's field of view
  in photography. A small FOV sees a narrow, zoomed-in slice of the
  scene; a large FOV sees a wide, distorted-at-the-edges slice — it
  exists because a computer camera needs *some* way to define how much
  of 3D space maps onto the flat rectangle of the screen, and angle is
  the natural unit for that.
- **Aspect ratio** — the ratio of the rendering area's width to its
  height (`width / height`). It exists so the camera's projection
  matches the actual shape of the rectangle it's being drawn into;
  using the wrong aspect ratio is what makes a 3D scene look squashed
  or stretched sideways.
- **Near/far clipping plane** — the closest and farthest distance from
  the camera that will actually be drawn; anything closer than *near*
  or farther than *far* is discarded before rendering. This exists
  because a GPU needs finite, bounded numeric ranges to work with
  efficient math internally (depth precision is limited) — an
  infinitely-far scene isn't something the hardware can represent
  cleanly.
- **Vertex** — one point in 3D space, defined by an (x, y, z)
  coordinate, that's a corner of some larger shape. It's the atomic
  unit 3D geometry is built from — every mesh, no matter how complex,
  is ultimately just a list of vertices and how they connect into
  triangles.
- **Normal vector** — a direction (as an x, y, z vector) pointing
  straight out, perpendicular, from a surface at a given point. It
  exists because lighting and shading calculations need to know which
  way a surface is "facing" to know how bright it should look from a
  given light direction — position alone doesn't tell you that.
- **RGB** — a color expressed as three numbers (red, green, blue),
  each representing how much of that color channel is present. It's
  the standard way both screens and 3D graphics represent color,
  because screen pixels are physically built from red, green, and blue
  sub-pixels.

**Objects and methods used**

- **`THREE.Scene`**
  - *What it is:* a container that holds every object that exists in
    the 3D world you're building — meshes, lights, groups — nothing
    more.
  - *Implementation:* a class with no required constructor arguments
    (`new THREE.Scene()`); internally it extends `THREE.Object3D`,
    meaning it gets a `.children` array and an `.add()` method for
    free, the same as everything placed inside it.
  - *Its use:* every render call needs a scene to know what to draw;
    this lesson creates exactly one and adds the cube to it.
  - *Type:* a class, instantiated once per app (usually).
  - *Responsibility:* holds a reference to every object currently
    "in the world," in a flat parent/child tree via `.children`, so the
    renderer has one single thing to hand to `.render()` and knows it
    will reach everything.
  - *Depends on:* nothing to construct; depends on `.add()` being
    called with real `Object3D`-derived objects to be useful.
  - *Connects to:* every object added via `scene.add(...)` becomes a
    child, gaining a `.parent` reference back to the scene; the
    renderer reads the scene's children every frame to know what to
    draw.
  - *Shape:* essentially a tree — `scene.children` is a flat array at
    the top, but each child can itself have its own children, so it's
    a nested structure, not a flat list, even though this lesson only
    goes one level deep.

- **`THREE.PerspectiveCamera(fov, aspect, near, far)`**
  - *What it is:* a virtual camera whose projection mimics how a real
    lens sees the world — objects farther away look smaller, parallel
    lines converge toward a vanishing point.
  - *Implementation:* a class whose constructor takes exactly four
    numbers, in this order: `fov` (degrees), `aspect` (width/height),
    `near`, `far` (both in the same units as your scene's own
    geometry). `new THREE.PerspectiveCamera(75, 16/9, 0.1, 1000)` is a
    real, valid call.
  - *Its use:* defines what part of the 3D world actually shows up on
    screen, and with what distortion — needed before anything can be
    rendered at all.
  - *Type:* a class; also extends `THREE.Object3D`, so it has its own
    `.position`/`.rotation` just like a mesh does — a camera is a
    real object living in the scene, not a special outside observer.
  - *Responsibility:* converts 3D world coordinates into the 2D
    coordinates a screen actually needs, using FOV/aspect/near/far to
    build that math (internally, a 4×4 *projection matrix* — the
    mechanics of that matrix are Module C's subject, not this
    lesson's).
  - *Depends on:* the four constructor numbers above; needs
    `.updateProjectionMatrix()` called again any time `fov`, `aspect`,
    `near`, or `far` change after construction, or the change won't
    take visible effect.
  - *Connects to:* handed directly to `renderer.render(scene, camera)`
    every frame; the renderer reads the camera's projection and
    position to decide what the final pixels look like.
  - *Shape:* not a plain value — an object with real internal state (a
    `.projectionMatrix`, a `.position` `Vector3`, etc.), verified below
    to actually hold 16 numbers once built.

- **`THREE.WebGLRenderer`**
  - *What it is:* the thing that actually talks to the GPU via WebGL
    and produces real pixels from a scene and a camera.
  - *Implementation:* a class; `new THREE.WebGLRenderer()` (no
    arguments) creates its own internal `<canvas>` element for you;
    `new THREE.WebGLRenderer({ canvas: myCanvas })` uses one you
    already have.
  - *Its use:* without it, `Scene` and `Camera` are just numbers sitting
    in memory — nothing has actually drawn anything yet.
  - *Type:* a class, instantiated once per app (usually one canvas, one
    renderer).
  - *Responsibility:* owns the WebGL context, manages the canvas's
    pixel buffer, and turns a `(scene, camera)` pair into an actual
    rendered image on every call to `.render()`.
  - *Depends on:* a real `<canvas>` (created for you, or supplied);
    `.setSize(width, height)` called at least once, or the canvas
    defaults to a tiny size.
  - *Connects to:* `.domElement` (the canvas) gets attached into the
    page via `document.body.appendChild`; `.render(scene, camera)` is
    called from the render loop, reading both.
  - *Shape:* not a plain value — a stateful object holding an actual
    WebGL context and GPU-side buffers; `.domElement` is a real
    `HTMLCanvasElement`, not a string or a number.

- **`THREE.BoxGeometry(width, height, depth)`**
  - *What it is:* the raw shape data for a rectangular box — just the
    vertex positions and how they connect into triangles, no color or
    surface behavior at all.
  - *Implementation:* a class extending `THREE.BufferGeometry`;
    `new THREE.BoxGeometry(1, 1, 1)` builds a 1×1×1 cube centered on
    the origin.
  - *Its use:* the simplest possible non-trivial shape to prove the
    whole pipeline (scene → camera → renderer → loop) actually works,
    before anything about your real machining-model geometry is
    introduced.
  - *Type:* a class; a subclass of `BufferGeometry`, meaning its actual
    vertex data lives in typed arrays under `.attributes`, not as a
    list of plain JS objects.
  - *Responsibility:* stores exactly the numeric data a GPU needs to
    draw the shape — vertex positions, vertex normals, and (for a box)
    UV texture coordinates — and nothing about how it should look.
  - *Depends on:* nothing external; `width`/`height`/`depth` arguments
    are optional and default to `1`.
  - *Connects to:* handed to `THREE.Mesh` alongside a material; the
    renderer reads its `.attributes.position` and `.index` (verified
    below) when drawing.
  - *Shape:* verified below to be 24 vertices (not 8 — see the
    Mechanical Walkthrough) and 12 triangles, stored as flat typed
    arrays, not an array of `{x, y, z}` objects.

- **`THREE.MeshNormalMaterial`**
  - *What it is:* a material that colors each visible pixel using that
    point's normal vector, mapped directly to RGB — no lights needed,
    which is exactly why it's useful before Lesson 3 introduces
    lighting at all.
  - *Implementation:* a class; `new THREE.MeshNormalMaterial()` takes
    no required arguments.
  - *Its use:* proves the cube is a real, faceted 3D object (each face
    a visibly different color, because each face's normal points a
    different direction) without needing a light source this lesson
    hasn't introduced yet.
  - *Type:* a class; extends `THREE.Material`, the common base every
    Three.js material shares.
  - *Responsibility:* tells the renderer's shader program how to turn
    per-vertex/per-face data into a final pixel color — for this
    specific material, "use the normal direction as the color,"
    nothing else.
  - *Depends on:* the geometry it's paired with actually having normal
    data (`BoxGeometry` provides this automatically, confirmed below).
  - *Connects to:* passed into `THREE.Mesh`'s constructor alongside the
    geometry; the renderer reads it during `.render()` to know which
    GPU shader program to run.
  - *Shape:* a stateful object with real boolean/string properties
    (`.wireframe`, `.transparent`, `.type`), confirmed by inspection
    below — not just a color value.

- **`THREE.Mesh(geometry, material)`**
  - *What it is:* the actual visible object — the thing that joins one
    geometry (shape) and one material (surface appearance) into
    something that can be placed in a scene and drawn.
  - *Implementation:* a class; `new THREE.Mesh(boxGeometry,
    normalMaterial)` takes exactly the geometry and material as its two
    constructor arguments.
  - *Its use:* neither `BoxGeometry` nor `MeshNormalMaterial` alone is
    drawable — `Mesh` is the object that actually gets added to the
    scene.
  - *Type:* a class; extends `THREE.Object3D`, so — like `Scene` and
    `PerspectiveCamera` — it has its own `.position`/`.rotation`/
    `.scale`, confirmed below.
  - *Responsibility:* holds exactly one geometry reference and one
    material reference together, plus its own position/rotation/scale
    in the world, and exposes itself as something `scene.add()` and
    `renderer.render()` both know how to handle.
  - *Depends on:* a real geometry and a real material, handed in at
    construction; without both, there's nothing to draw and nothing to
    draw it with.
  - *Connects to:* added to the scene via `scene.add(mesh)`; read by
    the renderer during `.render()`; its `.rotation` is what the render
    loop changes every frame to animate it.
  - *Shape:* an object holding two references (`.geometry`,
    `.material` — confirmed equal to what was passed in, below) plus
    its own transform state; not a copy of the geometry/material data,
    a live reference to the same objects.

- **`window.requestAnimationFrame(callback)`**
  - *What it is:* a browser API that schedules a function to run once,
    right before the browser's next screen repaint — not on a fixed
    timer, but synced to the display's actual refresh rate.
  - *Implementation:* a free function on the global `window` object,
    taking one argument — a callback function — and returning a
    request ID (a number) that could be passed to
    `cancelAnimationFrame()` to cancel it. <cite index="5-1,9-1">The callback receives a single timestamp argument that's shared across callbacks fired in the same frame, synced across same-origin windows, useful for keeping multiple animations in step.</cite>
  - *Its use:* this is *how* a render loop actually keeps running —
    each call only schedules one future call, so the callback has to
    ask for the next one itself, every time.
  - *Type:* a browser-provided free function, not a class or a method
    on any Three.js object — it exists independently of Three.js
    entirely.
  - *Responsibility:* runs its callback once, at the right moment
    relative to the browser's repaint, and only once per call — it
    is not a repeating timer on its own.
  - *Depends on:* a callback function to run; nothing else.
  - *Connects to:* this lesson's own `animate()` function calls
    `requestAnimationFrame(animate)` as its own last line — the
    callback re-schedules itself, which is the entire mechanism that
    turns "runs once" into "keeps running forever."
  - *Shape:* the return value is a plain number (a request ID); the
    callback's own argument is a plain number (a millisecond
    timestamp) — neither is an object, and this lesson doesn't use
    either value yet.

---

## Concept Unit: The Scene

### The Problem

Before anything can be drawn, something has to hold the answer to "what
exists in this 3D world right now?" A list of meshes floating in plain
JavaScript variables doesn't give the renderer one single thing to ask
"what should I draw this frame?" — there needs to be one real container.

> **Stop and think first:** if you needed to keep track of "everything
> currently in this 3D world," using only plain JavaScript you already
> know — no Three.js yet — what data structure would you reach for? An
> array? An object? What would you need to be able to do with it: add
> things, remove things, ask "is this thing in the world or not"? Does
> a plain array give you anything more than storage — could two
> different objects both hold a reference to the same array and think
> they each "own" the world?

### Isolating `THREE.Scene`

```js
// throwaway-scene.mjs — run with plain Node, no browser needed
import * as THREE from 'three';

const scene = new THREE.Scene();
console.log('scene instanceof THREE.Object3D:', scene instanceof THREE.Object3D);
console.log('scene.type:', scene.type);
console.log('scene.children.length (empty on creation):', scene.children.length);
console.log('scene.background (default):', scene.background);

const cube = new THREE.Object3D();
scene.add(cube);
console.log('after scene.add(cube), scene.children.length:', scene.children.length);
console.log('cube.parent === scene:', cube.parent === scene);
```

Actually run, this session, in plain Node (Three.js version 0.185.1,
installed locally — `Scene` needs no browser or WebGL context to build
or inspect, only rendering does):

```
scene instanceof THREE.Object3D: true
scene.type: Scene
scene.children.length (empty on creation): 0
scene.background (default): null
after scene.add(cube), scene.children.length: 1
cube.parent === scene: true
```

This is called a **scene graph** — a tree of parent/child objects, with
the `Scene` as its root. What this proves: a brand-new `Scene` really
does start with zero children (not `undefined`, an empty array — you
can call `.length` on it immediately); adding an object doesn't copy
it, it links it — the object added gains a real `.parent` pointing
straight back at the scene, proven by the strict `===` check above, not
just a similar-looking copy.

### Discarding the throwaway example

This exact snippet is deleted now — it never appears in the real
project. What it proved (a `Scene` starts empty, `.add()` creates a
real two-way link) is what the real code below relies on.

### Project Change

- **Reference Source:** No reference counterpart — this is a
  from-scratch addition; there is no prior version of this app to port
  from.
- **Files affected:** created — `lessons/lesson-01-scene-camera-renderer/index.html`,
  `lessons/lesson-01-scene-camera-renderer/main.js` (both created once,
  across this lesson's several units — noted here at first use, not
  recreated per unit).
- **Change type:** add.
- **Location:** `main.js`, top of file — the very first real line of
  app code.
- **Dependencies:** the `three` package, imported as an ES module (see
  Commands, below, for how it's loaded in a plain HTML page without a
  bundler).

### The New Code

```js
import * as THREE from 'three';

const scene = new THREE.Scene();
```

### The Updated Project

This is the first code in `main.js` — nothing exists yet for it to sit
inside, so there's no larger enclosing structure to show (Project
Change already covers this: a brand-new file has nothing to locate a
position within).

```
1  import * as THREE from 'three';
2
3  const scene = new THREE.Scene();   // ← new
```

`main.js` now does exactly one thing: pull in the Three.js library, and
create one empty world. Nothing is visible yet — there's no camera to
look through and no renderer to draw with, both coming in the next two
units.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the two lines above, in
order:

- `import * as THREE from 'three';` — an **ES module import**
  (defined in Terms, above): pulls in everything the `three` package
  exports, binding it all to the local name `THREE`. The `* as THREE`
  form specifically means "give me the whole module's exports as one
  object named `THREE`," rather than picking individual named exports
  — the reason nearly every Three.js example writes `THREE.Scene`,
  `THREE.Mesh`, and so on, with that `THREE.` prefix: it's this import
  syntax's own naming, not a Three.js convention baked into the
  library itself.
- `'three'` — a **module specifier**: the string naming which package
  to pull from. Resolved by the browser (for a CDN URL) or a bundler
  (for a bare package name like this) at load time — not something
  this lesson's code controls, just names.
- `const` — declares `scene` as a variable whose *binding* cannot be
  reassigned to point at a different object later (though the object
  it points to can still be mutated — `scene.add(...)` below does
  exactly that, which is allowed; `scene = somethingElse` would not
  be).
- `new THREE.Scene()` — the **constructor** call (defined in Terms,
  above) that actually builds a `Scene` instance, verified above to
  start with `.children.length === 0` and `.type === 'Scene'`.
- `scene` — the variable now holding a live reference to that one
  `Scene` instance; every later unit in this lesson reaches back into
  this same variable rather than creating a second scene.

### CS Lens

A scene graph is a specific case of a **tree** data structure — nodes
with parent/child links, no cycles, one designated root. Also
recognized in: a filesystem's folders and files, an HTML page's DOM
(the same "DOM" defined in Terms, above — literally the same kind of
tree, just for markup instead of 3D objects), an org chart, a compiler's
abstract syntax tree, a game engine's entity hierarchy.

### SE Lens

The alternative not chosen here: a flat array of every mesh in the app,
with no parent/child relationships at all. That's simpler to reason
about for a handful of objects, but it breaks down the moment one
object's position needs to depend on another's — a machining fixture
that should move together with the stock it's holding, for instance
(a real need in this project's own Module E). A scene graph pays for
that flexibility with a real cost: transforms compose through the whole
chain of parents (Module C's own subject), which is strictly more to
reason about than "everything's position is just its own number." This
project accepts that cost starting now, in Lesson 1, rather than
starting flat and refactoring into a graph later once fixtures actually
need it.

### One sentence connecting this unit to what came before

There's nothing before this — this is the lesson's first unit — but
everything after it depends on this one `scene` variable existing
first: the camera looks *at* it, the renderer draws *it*, and the cube
gets added *to* it.

---

## Concept Unit: The Camera

### The Problem

A `Scene` full of objects doesn't define what fraction of that world
should end up on screen, from what position, or with what distortion.
Two people looking at the same physical room from different spots, or
with a zoom lens versus a wide-angle lens, see genuinely different
images of the identical room — something has to encode that choice.

> **Stop and think first:** if you were designing this from scratch,
> what's the *minimum* information you'd need to know to answer "what
> does this 3D world look like from here"? Would just an (x, y, z)
> position be enough — what's missing if two cameras sit at the exact
> same spot but one uses a "zoom lens" and one uses a "wide-angle
> lens"? What real-world camera setting does that difference correspond
> to?

### Isolating `THREE.PerspectiveCamera`

```js
// throwaway-camera.mjs
import * as THREE from 'three';

const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
console.log('camera.fov:', camera.fov);
console.log('camera.aspect:', camera.aspect);
console.log('camera.near:', camera.near);
console.log('camera.far:', camera.far);
console.log('camera.position (default):', camera.position.x, camera.position.y, camera.position.z);
console.log('camera instanceof THREE.Object3D:', camera instanceof THREE.Object3D);

camera.position.set(0, 0, 5);
camera.updateProjectionMatrix();
console.log('after position.set(0,0,5):', camera.position.x, camera.position.y, camera.position.z);
console.log('camera.projectionMatrix.elements.length:', camera.projectionMatrix.elements.length);
```

Actually run, this session, in plain Node:

```
camera.fov: 75
camera.aspect: 1.7777777777777777
camera.near: 0.1
camera.far: 1000
camera.position (default): 0 0 0
camera instanceof THREE.Object3D: true
after position.set(0,0,5): 0 0 5
camera.projectionMatrix.elements.length: 16
```

This is called a **perspective projection**. What it proves: the four
constructor numbers land exactly where the names suggest (`fov`,
`aspect`, `near`, `far` — no reordering, no silent defaulting); a
camera really is an `Object3D` — it has its own real, movable
`.position`, starting at the world origin `(0,0,0)` by default, the
exact same kind of object a mesh will turn out to be; and its
`projectionMatrix` really is a 16-number 4×4 matrix (Module C's own
subject — not decoded here, just confirmed to exist and be the right
size).

### Discarding the throwaway example

Deleted — this snippet never appears in the real project. What it
proved (constructor argument order, `Object3D` inheritance, a real
16-number projection matrix) is what the real code below relies on.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** modified — `main.js`.
- **Change type:** add.
- **Location:** directly below the `scene` line from the previous unit.
- **Dependencies:** the `scene` variable already existing (not required
  by the camera itself, but needed two units from now when both get
  handed to the renderer together).

### The New Code

```js
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;
```

### The Updated Project

```
1  import * as THREE from 'three';
2
3  const scene = new THREE.Scene();
4
5  const camera = new THREE.PerspectiveCamera(     // ← new
6    75,                                            // ← new
7    window.innerWidth / window.innerHeight,        // ← new
8    0.1,                                           // ← new
9    1000                                           // ← new
10 );                                                // ← new
11 camera.position.z = 5;                            // ← new
```

`main.js` now creates an empty world (line 3) and a virtual eye looking
into it (lines 5–11), pulled back 5 units along the z-axis so it isn't
sitting exactly at the world origin where the cube will be placed —
still nothing visible on screen, because nothing has drawn anything
yet.

### Mechanical Walkthrough

- `new THREE.PerspectiveCamera(...)` — the constructor call (defined
  in Terms), building a real camera object, confirmed above to be an
  `Object3D` with its own position.
- `75` — the **FOV** argument (defined in Terms) in degrees; a common
  default that shows a natural-looking amount of the scene without
  strong wide-angle distortion.
- `window.innerWidth / window.innerHeight` — the **aspect ratio**
  (defined in Terms), computed live from the actual browser window's
  current pixel dimensions via two real DOM/`window` properties, rather
  than a hardcoded guess — so the camera's projection actually matches
  whatever size the page happens to be open at.
- `/` — ordinary division; produces a plain floating-point number
  (confirmed above: `1.7777777777777777` for a 16:9-shaped window),
  not an integer or a string.
- `0.1` — the **near clipping plane** (defined in Terms): anything
  closer than 0.1 world units to the camera won't be drawn.
- `1000` — the **far clipping plane** (defined in Terms): anything
  farther than 1000 world units won't be drawn.
- `camera.position.z = 5` — a **property assignment** on
  `camera.position`, which is itself a `THREE.Vector3` object (an
  (x, y, z) triple with its own methods) — not a raw number stored
  directly on `camera`. Setting `.z` alone leaves `.x` and `.y` at
  their default `0`, moving the camera 5 units back along the z-axis
  only, confirmed above to actually change `.position.z` and nothing
  else when done this way.

### CS Lens

Choosing what to include based on a bounded numeric range (here, the
near/far clipping planes) is an instance of the general idea of
**windowing** — restricting an unbounded space down to a finite,
tractable subset before processing it. Also recognized in: database
pagination (`LIMIT`/`OFFSET`), a network protocol's sliding window for
flow control, a signal processor's windowed Fourier transform, a game's
level-of-detail culling by distance.

### SE Lens

The alternative not chosen: an *orthographic* camera (`THREE.
OrthographicCamera`), where parallel lines stay parallel and objects
don't shrink with distance — the projection CAD/CNC tooling often
defaults to for precise measurement, because perspective distortion
makes eyeballing exact distances unreliable. `PerspectiveCamera` is
chosen here because this lesson is teaching general-purpose Three.js
first; this project's own later machining-inspection views (Module C
onward, reading real operation matrices) are exactly the kind of
work where an orthographic camera may become the better real choice —
that tradeoff is deferred, not forgotten, and revisited once precise
measurement is actually the task.

### One sentence connecting this unit to what came before

The `scene` from the previous unit is still just data sitting in
memory; this camera defines *how* that data would be seen, but nothing
can turn either into pixels without the renderer, next.

---

## Concept Unit: The Renderer

### The Problem

Even with a `Scene` full of objects and a `Camera` defining a viewpoint,
nothing has touched a pixel yet — both are pure JavaScript objects
holding numbers. Something has to actually talk to the GPU, own a real
canvas on the page, and turn "here's a scene, here's a camera" into an
actual image.

> **Stop and think first:** `Scene` and `Camera` are both just
> JavaScript objects holding numbers — nothing about either one, by
> itself, touches the screen. What's the actual gap between "I have
> data describing a 3D world and a viewpoint" and "there are colored
> pixels on the page"? Is that a gap Three.js can close in plain
> JavaScript alone, or does it need something lower-level?

### Isolating `THREE.WebGLRenderer` — with an honest limit

Unlike `Scene`, `Camera`, and every other class in this lesson,
`WebGLRenderer` genuinely cannot be constructed or inspected in this
authoring sandbox: it requires a real `<canvas>` and a real WebGL
context, both of which only exist inside an actual browser (see
`HANDOFF.md`'s "Verification in this environment" for why — no
`headless-gl`/browser is available in this sandbox). This is stated
plainly rather than faked with an invented console log.

What follows instead is the documented, spec-level contract, not
executed here: <cite index="13-1">a `WebGLRenderer` accepts an optional parameters object — including a `canvas` to draw into, defaulting to creating a new one if none is passed — and its `.render()` method draws a given scene and camera to that canvas, clearing the previous frame first unless told not to.</cite> <cite index="18-1">If no canvas is supplied, the renderer builds its own, which then has to be attached to the page manually via `document.body.appendChild(renderer.domElement)`.</cite>

**When you run this yourself** (Commands, below, show exactly how),
you should see: a black rectangle appear on the page at the size you
call `.setSize()` with, and no console errors. That real, reader-run
output is what should be pasted back and saved into
`verify/lesson-01/` as this unit's actual verification, per this
project's own environment-adapted Verification Rule.

### Discarding the throwaway example

There is no throwaway example to discard for this specific unit — the
"isolating" step above is the documented contract itself, not runnable
code, for the honest sandbox-limitation reason just stated. The New
Code below is the first time `WebGLRenderer` is actually constructed
in this lesson, in the real project file directly.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** modified — `main.js`; created —
  `lessons/lesson-01-scene-camera-renderer/index.html` (the renderer
  needs an actual HTML page to attach its canvas into — this is the
  point that file becomes necessary).
- **Change type:** add.
- **Location:** `main.js`, directly below the camera code from the
  previous unit; `index.html` is a new, minimal page that loads
  `main.js` as a module.
- **Dependencies:** a real browser to actually see output in (this
  lesson's code cannot be verified rendering anything inside this
  authoring sandbox — see above).

### The New Code

```js
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
```

### The Updated Project

```
1  import * as THREE from 'three';
2
3  const scene = new THREE.Scene();
4
5  const camera = new THREE.PerspectiveCamera(
6    75,
7    window.innerWidth / window.innerHeight,
8    0.1,
9    1000
10 );
11 camera.position.z = 5;
12
13 const renderer = new THREE.WebGLRenderer();          // ← new
14 renderer.setSize(window.innerWidth, window.innerHeight); // ← new
15 document.body.appendChild(renderer.domElement);      // ← new
```

`main.js` now has all three of the pieces this lesson's title promises
— a world (line 3), a viewpoint into it (lines 5–11), and something
that can actually turn the two into pixels and put those pixels on the
page (lines 13–15). Nothing is drawn *yet* — `.render()` itself hasn't
been called anywhere — but everything needed to call it now exists.

### Mechanical Walkthrough

- `new THREE.WebGLRenderer()` — the constructor (defined in Terms),
  called with no arguments, meaning — per the documented contract cited
  above — it builds its own internal `<canvas>` rather than using one
  already on the page.
- `renderer.setSize(window.innerWidth, window.innerHeight)` — an
  **instance method call** on the renderer; per the cited documentation,
  resizes the renderer's output to match the given width and height in
  pixels — here, the browser window's own current size, read live the
  same way the camera's aspect ratio was in the previous unit.
- `window.innerWidth`, `window.innerHeight` — **DOM/`window`
  properties** (reappearing from the previous unit's aspect-ratio line;
  per the Repetition Rule, restated in full here too): the browser
  window's current content-area width and height in CSS pixels.
- `document.body.appendChild(renderer.domElement)` — a **DOM method
  call**: `document.body` is the live `<body>` element of the current
  page (part of the DOM, defined in Terms); `.appendChild(...)` inserts
  a given element as its last child. `renderer.domElement` is the real
  `<canvas>` (defined in Terms) the renderer built for itself in the
  constructor call above — this line is the one and only thing that
  makes that canvas actually visible on the page; before it, the
  canvas exists in memory but is attached to nothing a browser would
  ever paint.

### CS Lens

Separating *what* to draw (`Scene`+`Camera`) from *how* it actually gets
drawn (`WebGLRenderer`) is an instance of **separation of concerns** —
splitting a system along the lines of distinct responsibilities so each
part can change independently. Also recognized in: a database query
(the *what*) versus its execution engine (the *how*); an HTML document
(content) versus a CSS stylesheet (presentation); a compiler's abstract
syntax tree (what the program means) versus its code generator (how
that meaning becomes real machine instructions).

### SE Lens

The alternative not chosen: letting `Scene` or `Camera` know how to draw
themselves directly, folding rendering logic into the data objects. That
would mean any future renderer Three.js adds (it genuinely has several
— `SVGRenderer`, `CSS3DRenderer`, and now `WebGPURenderer`) would
require rewriting `Scene` and `Camera` themselves, rather than writing
one new renderer class that accepts the exact same scene/camera pair
unchanged. The real cost paid for that flexibility: an extra object to
create and keep alive, and an extra explicit step (`.render()`, next
unit) that has to actually be called — nothing draws itself
automatically just because it exists in the scene.

### One sentence connecting this unit to what came before

The scene and camera from the previous two units are exactly what this
renderer's `.render()` call will need, next — everything is now present
except the one thing that actually invokes it, repeatedly, which the
render loop provides.

---

## Concept Unit: The Geometry — `THREE.BoxGeometry`

### The Problem

The scene from Unit 1 is real, but genuinely empty — `.children.length`
was `0` and nothing has been added to it since. There's still nothing
in this 3D world for the camera to look at or the renderer to draw.
Before reaching for the real machining models this project is ultimately
about, the simplest possible shape is needed, to prove the whole
scene→camera→renderer chain actually works.

> **Stop and think first:** what is the actual minimum information
> needed to describe a 3D box's shape, if you were inventing this from
> scratch — just corner points? Do corner points alone tell you which
> corners connect to form a solid surface, or is something more needed?
> A cube has 8 corners — do you expect a box's actual vertex count, once
> you inspect it for real below, to be exactly 8?

### Isolating `THREE.BoxGeometry`

```js
// throwaway-geometry.mjs
import * as THREE from 'three';

const box = new THREE.BoxGeometry(1, 1, 1);
console.log('box instanceof THREE.BufferGeometry:', box instanceof THREE.BufferGeometry);
console.log('box.attributes keys:', Object.keys(box.attributes));
console.log('position count (vertices):', box.attributes.position.count);
console.log('position itemSize (x,y,z per vertex):', box.attributes.position.itemSize);
console.log('first vertex xyz:', box.attributes.position.array[0], box.attributes.position.array[1], box.attributes.position.array[2]);
console.log('index count (triangle corners):', box.index.count);
console.log('triangle count:', box.index.count / 3);
```

Actually run, this session, in plain Node:

```
box instanceof THREE.BufferGeometry: true
box.attributes keys: [ 'position', 'normal', 'uv' ]
position count (vertices): 24
position itemSize (x,y,z per vertex): 3
first vertex xyz: 0.5 0.5 0.5
index count (triangle corners): 36
triangle count: 12
```

This is called **indexed geometry** with **duplicated vertices per
face**. What it proves, and why the vertex count is a genuine surprise
worth stopping on: a cube has 8 geometric corners, but `position.count`
is **24**, not 8 — three vertices per corner, one for each of the three
faces meeting there. This happens because each copy needs its own
**normal vector** (defined in Terms) — a shared corner-vertex would
have to average three different faces' normals into one, which would
make the box shade like a smoothed sphere instead of a sharp-edged
cube. The `index` array (36 entries — 12 triangles × 3 corners each,
confirmed above) is what tells the GPU which three of those 24 vertices
form each triangle; `12` triangles is exactly `2` per face × `6` faces,
which is the actual minimum to cover a flat rectangular face with
triangles (a GPU draws triangles, never plain rectangles).

### Discarding the throwaway example

Deleted — never appears in the real project as its own file. What it
proved (24 vertices, not 8; 12 triangles; real `attributes.position`
and `.index` typed data) is what the real code below relies on.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition; your own machining models (Module B) will replace this box
  entirely once loading real files is taught.
- **Files affected:** modified — `main.js`.
- **Change type:** add.
- **Location:** directly below the renderer code from the previous
  unit.
- **Dependencies:** none beyond `THREE` itself, already imported.

### The New Code

```js
const geometry = new THREE.BoxGeometry(1, 1, 1);
```

### The Updated Project

Skipped per this step's own exception: this one line is the entire new
structure so far, with nothing surrounding it yet to show in context —
it doesn't yet modify or sit inside any larger existing block. It will
be shown assembled together with the next two units' code, once a
`Mesh` actually joins geometry and material into something with real
surrounding context worth showing.

### Mechanical Walkthrough

- `new THREE.BoxGeometry(1, 1, 1)` — the constructor (defined in
  Terms): three arguments, `width`, `height`, `depth`, each `1` world
  unit — confirmed above to actually produce 24 position entries and a
  36-entry index, not just "a box" as an opaque black box.
- `geometry` — the variable now holding a live reference to that
  `BufferGeometry` instance, ready to be handed to a `Mesh` in the next
  unit.

### CS Lens

Storing three separate copies of a shared corner, each tagged with its
own per-face data, is an instance of the general tradeoff of **trading
memory for correctness/simplicity of downstream computation** — using
more storage than the strict minimum (8 unique points) so a later step
(per-face flat shading) doesn't need extra logic to handle the shared
case. Also recognized in: database denormalization (duplicating data
to avoid expensive joins), memoization/caching (storing a computed
result instead of recomputing it), CDN edge caching (storing copies of
the same file in many places instead of fetching once from a single
origin).

### SE Lens

The alternative not chosen: sharing all 8 corner vertices and computing
smoothly-averaged ("smooth-shaded") normals, the way `THREE.SphereGeometry`
does for a round shape where sharp edges would look wrong. `BoxGeometry`
deliberately does not do this — a cube is *supposed* to look faceted,
with a visible hard edge at every corner — so the real cost (3× the
vertex data a naive "just the 8 corners" version would use) is accepted
on purpose, in exchange for correct-looking flat faces without any
extra shading logic at render time.

### One sentence connecting this unit to what came before

This geometry is shape data only — no color, no surface behavior — the
next unit's material is what actually decides how each of these 24
vertices' worth of triangles gets colored.

---

## Concept Unit: The Material and the Mesh

### The Problem

`BoxGeometry` alone has no color and no rule for how light or viewing
angle should affect its appearance — confirmed in the previous unit,
its `.attributes` held only `position`, `normal`, and `uv`, nothing
resembling a color. And even paired with something that *does* define
appearance, geometry and appearance are still two separate objects
sitting in two separate variables — neither one, alone, is a thing that
can be added to a scene and drawn.

> **Stop and think first:** if `geometry` only knows *shape* and
> nothing about color yet, what's the smallest new piece of information
> needed to answer "what color should this triangle be"? And once both
> a shape and a "how to color it" rule exist as two separate pieces of
> data, what's actually missing before either one can be handed to
> `scene.add()` — recall from Unit 1 that `scene.add()` expects a real
> `Object3D`-derived object, not a bare geometry or a bare material.

### Isolating `THREE.MeshNormalMaterial`

```js
// throwaway-material.mjs
import * as THREE from 'three';

const mat = new THREE.MeshNormalMaterial();
console.log('mat instanceof THREE.Material:', mat instanceof THREE.Material);
console.log('mat.type:', mat.type);
console.log('mat.transparent (default):', mat.transparent);
console.log('mat.wireframe (default):', mat.wireframe);
console.log('mat.flatShading (default):', mat.flatShading);
```

Actually run, this session, in plain Node:

```
mat instanceof THREE.Material: true
mat.type: MeshNormalMaterial
mat.transparent (default): false
mat.wireframe (default): false
mat.flatShading (default): false
```

What this proves: `MeshNormalMaterial` is a real stateful object with
real boolean properties you can flip later (`.wireframe = true`, for
instance, would render only the triangle edges) — not a bare color
value or a string naming a preset.

### Isolating `THREE.Mesh`

```js
// throwaway-mesh.mjs
import * as THREE from 'three';

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);

console.log('cube instanceof THREE.Object3D:', cube instanceof THREE.Object3D);
console.log('cube.geometry === geometry:', cube.geometry === geometry);
console.log('cube.material === material:', cube.material === material);
console.log('cube.position (default):', cube.position.x, cube.position.y, cube.position.z);

const scene = new THREE.Scene();
scene.add(cube);
console.log('scene.children[0] === cube:', scene.children[0] === cube);
```

Actually run, this session, in plain Node:

```
cube instanceof THREE.Object3D: true
cube.geometry === geometry: true
cube.material === material: true
cube.position (default): 0 0 0
scene.children[0] === cube: true
```

What this proves: `Mesh` holds *live references* to the exact geometry
and material objects passed in (`===`, strict identity, not just
similar-looking copies — the same distinction Unit 1's `cube.parent ===
scene` check proved for the scene graph); a `Mesh` really is an
`Object3D`, meaning `scene.add(cube)` from Unit 1's own `.add()` method
works on it exactly the same way it worked on the plain placeholder
object in that unit's own throwaway lab.

### Discarding the throwaway examples

Both snippets above are deleted — neither appears in the real project.
What they proved (a real, stateful material; a mesh holding live
geometry/material references and behaving as a real scene-addable
`Object3D`) is what the real code below relies on.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** modified — `main.js`.
- **Change type:** add.
- **Location:** directly below the geometry line from the previous
  unit.
- **Dependencies:** the `geometry` variable from the previous unit; the
  `scene` variable from Unit 1.

### The New Code

```js
const material = new THREE.MeshNormalMaterial();
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

### The Updated Project

Now shown assembled with the geometry line from the previous unit, and
in context with everything built so far — the first point in this
lesson where the full chain is complete enough to actually try
rendering one frame:

```
1  import * as THREE from 'three';
2
3  const scene = new THREE.Scene();
4
5  const camera = new THREE.PerspectiveCamera(
6    75,
7    window.innerWidth / window.innerHeight,
8    0.1,
9    1000
10 );
11 camera.position.z = 5;
12
13 const renderer = new THREE.WebGLRenderer();
14 renderer.setSize(window.innerWidth, window.innerHeight);
15 document.body.appendChild(renderer.domElement);
16
17 const geometry = new THREE.BoxGeometry(1, 1, 1);      // ← new
18 const material = new THREE.MeshNormalMaterial();       // ← new
19 const cube = new THREE.Mesh(geometry, material);       // ← new
20 scene.add(cube);                                       // ← new
```

`main.js` now has a genuinely complete, if static, scene: one cube
(lines 17–19), actually placed in the world (line 20), a camera looking
at it from 5 units back, and a renderer capable of drawing that exact
pair. The only thing still missing is a call to `renderer.render(scene,
camera)` anywhere at all — nothing has actually been drawn yet, even
now.

### Mechanical Walkthrough

- `new THREE.MeshNormalMaterial()` — the constructor (defined in
  Terms), no arguments, confirmed above to build a real `Material`
  instance with inspectable boolean state.
- `new THREE.Mesh(geometry, material)` — the constructor (defined in
  Terms), given the `geometry` variable from the previous unit and the
  `material` variable from the line just above — confirmed above to
  store live `===`-equal references to both, not copies.
- `cube` — the variable now holding this lesson's one and only visible
  object.
- `scene.add(cube)` — reappearing from Unit 1's own throwaway lab,
  given full treatment again here per the Repetition Rule: `.add()` is
  an instance method inherited from `Object3D` (confirmed, Unit 1) that
  appends its argument to `.children` and sets that argument's
  `.parent` back to the object `.add()` was called on — here, that
  means `cube.parent` now points to `scene`, and `scene.children[0]`
  now points to `cube` (confirmed above with the strict `===` check),
  exactly mirroring Unit 1's placeholder-object proof, now with the
  real cube.

### CS Lens

`Mesh` joining a `Geometry` and a `Material` by holding references to
both, rather than copying their data into itself, is the **composition
over inheritance** principle in miniature — building a new capability
(a drawable object) by *combining* two independent, reusable pieces,
rather than by writing one monolithic class that hardcodes one specific
shape with one specific appearance baked in together. Also recognized
in: a car built from an engine and a chassis that could each pair with
different chassis/engines respectively, a UI component library where a
`Button` composes an `Icon` and a `Label` rather than one class per
icon+label combination, a game engine's entity-component systems.

### SE Lens

The alternative not chosen: a single `Cube` class with color and shape
both hardcoded inside it — simpler to write once, for exactly one
combination. The real cost of that shortcut shows up the moment two
different shapes need the *same* material (this project's own stock
and fixture meshes, later, sharing a grey "unmachined" material — Unit
5 of Module A onward) — a hardcoded `Cube` class would need its color
logic duplicated into a hardcoded `Sphere` class too, instead of one
`MeshNormalMaterial` instance being handed to as many different `Mesh`
objects as needed.

### One sentence connecting this unit to what came before

Every earlier unit's pieces — the scene, the camera, the renderer — are
now all pointed at the same real cube; the final unit, next, is what
actually calls `renderer.render()` and keeps calling it, frame after
frame.

---

## Concept Unit: The Render Loop

### The Problem

Nothing in `main.js` so far has actually called `renderer.render(...)`
even once — every earlier unit built a piece, but nothing has asked the
renderer to actually draw yet. And a single one-time render call
wouldn't be enough anyway: this lesson's own goal is a *rotating* cube,
which means the picture has to be redrawn, slightly different, many
times per second — not once.

> **Stop and think first:** if you called `renderer.render(scene,
> camera)` exactly once, right after Unit 5's last line, what would you
> expect to see — and would the cube ever move after that single call?
> What would you need to do, using only what you already know about
> functions and loops from plain JavaScript, to make something happen
> repeatedly, forever, in a browser page? Would an ordinary `while
> (true) { ... }` loop actually work here, or does a browser tab need to
> do other things (handle clicks, repaint) between frames that a loop
> that never returns would block?

### Isolating `requestAnimationFrame` — with an honest limit

Like `WebGLRenderer`, `requestAnimationFrame` is a real browser API
(reappearing from the Header's Objects and methods, given full
treatment there and not repeated verbatim here) that does not exist in
plain Node — there is no `window` in this sandbox to call it on, so it
cannot be executed here either. <cite index="9-1">Its own documented contract: the callback runs once, passed a single millisecond timestamp, synced to the browser's own repaint — not a repeating timer by itself.</cite>

**When you run this yourself**, you should see: the cube rotating
smoothly on screen, its faces' colors sliding as `MeshNormalMaterial`
recomputes each face's color from its new orientation, at roughly your
monitor's refresh rate. That real output, reported back, becomes this
unit's saved verification.

### Discarding the throwaway example

No throwaway example for the same honest sandbox-limitation reason
given in the Renderer unit — this unit's real code below is the only
place `requestAnimationFrame` appears in this lesson.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** modified — `main.js`.
- **Change type:** add.
- **Location:** end of file, after every previous unit's code.
- **Dependencies:** every variable built in every earlier unit —
  `scene`, `camera`, `renderer`, `cube` — this is the one place in the
  lesson that touches all four at once.

### The New Code

```js
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
```

### The Updated Project

The complete file, all six units assembled — nothing elided:

```
1  import * as THREE from 'three';
2
3  const scene = new THREE.Scene();
4
5  const camera = new THREE.PerspectiveCamera(
6    75,
7    window.innerWidth / window.innerHeight,
8    0.1,
9    1000
10 );
11 camera.position.z = 5;
12
13 const renderer = new THREE.WebGLRenderer();
14 renderer.setSize(window.innerWidth, window.innerHeight);
15 document.body.appendChild(renderer.domElement);
16
17 const geometry = new THREE.BoxGeometry(1, 1, 1);
18 const material = new THREE.MeshNormalMaterial();
19 const cube = new THREE.Mesh(geometry, material);
20 scene.add(cube);
21
22 function animate() {              // ← new
23   requestAnimationFrame(animate); // ← new
24   cube.rotation.x += 0.01;        // ← new
25   cube.rotation.y += 0.01;        // ← new
26   renderer.render(scene, camera); // ← new
27 }                                  // ← new
28 animate();                        // ← new
```

`main.js` is now a complete, running app: it builds the world, the
viewpoint, and the drawing surface once (lines 1–20), then repeatedly —
forever, at the browser's own pace — nudges the cube's rotation and
redraws it (lines 22–28). Every earlier unit's variable is read inside
this one function; nothing built earlier in the lesson goes unused.

### Mechanical Walkthrough

- `function animate() { ... }` — an ordinary **function declaration** —
  not itself a new Three.js concept, but its role here is: this is the
  callback that will be handed to `requestAnimationFrame`, and it has
  to be a named, reusable function (not thrown away after one call)
  because it's about to call for its own next invocation, from inside
  itself.
- `requestAnimationFrame(animate)` — the browser API (defined in full
  in the Header, reappearing here per the Repetition Rule): schedules
  `animate` itself to run again, once, before the next repaint. This is
  the actual mechanism that turns a single function call into an
  ongoing loop — it appears *inside* `animate`, meaning every time
  `animate` runs, its very first act is to schedule its own next run,
  before doing anything else in that frame.
- `cube.rotation.x += 0.01` — a **compound assignment** on
  `cube.rotation.x`; `cube.rotation` is a `THREE.Euler` object (an
  (x, y, z) triple of angles in radians — a different type from
  `.position`'s `Vector3`, but the same shape of idea: three numbers
  with named axes). `+=` reads the current value, adds `0.01`, and
  writes it back — meaning this line's real effect only shows up
  *across* many calls, each one nudging the angle a little further than
  the last; a single call alone would rotate the cube by an amount too
  small to see.
- `cube.rotation.y += 0.01` — the identical construct as the line
  above, on the y-axis instead of x — rotating on two axes at once is
  why the cube's motion reads as tumbling rather than spinning flatly
  around one axis.
- `renderer.render(scene, camera)` — reappearing from the Renderer
  unit's own documented contract, given full treatment again here per
  the Repetition Rule: draws the current state of `scene` — now
  including `cube`, at whatever rotation the two lines just above left
  it at — as seen through `camera`, onto `renderer.domElement`, the
  canvas already attached to the page back in that unit. Called fresh,
  every single frame — nothing about a previous frame's rendered image
  persists into the next call on its own; each call is a full, complete
  redraw of a scene that happens to look almost identical to the
  previous frame's image because only a tiny rotation changed between
  them.
- `animate()` — the one call, outside the function itself, that starts
  the entire loop for the very first time; without this line, `animate`
  is a fully valid function that would simply never run.

**Execution trace** — this is a real timing/control-flow trace (the
second shape defined by this project's own schema: no changing data
values worth tabulating, just the order calls actually happen in,
which is the entire point):

1. `animate();` (line 28) — the script's own top-level code calls
   `animate` directly, for the first and only time from outside the
   function itself.
2. `requestAnimationFrame(animate);` (line 23, now running as the first
   line *inside* that first call) — schedules a *second* call to
   `animate`, to happen before the browser's next repaint; does not run
   it yet — only registers it.
3. `cube.rotation.x += 0.01; cube.rotation.y += 0.01;` (lines 24–25,
   still inside this same first call) — mutates the cube's rotation
   by one small step, synchronously, before this frame's render.
4. `renderer.render(scene, camera);` (line 26) — draws this frame,
   with the rotation exactly as it stood after step 3 — the very first
   frame the reader will actually see, cube barely rotated from its
   starting orientation.
5. Sometime before the browser's next repaint — not synchronously, not
   immediately after step 4 — the browser itself calls `animate` again,
   because of the scheduling step 2 registered. This second call
   repeats steps 2–4 with the same code, producing a cube rotated one
   more `0.01` step further — and, inside *that* call, step 2 schedules
   a third call, and so on, indefinitely, only stopping if something
   calls `cancelAnimationFrame` with the ID `requestAnimationFrame`
   returned (never done in this lesson's own code) or the page is
   closed.

### CS Lens

A function that reschedules its own next invocation from inside itself,
rather than being called in an explicit loop by something else, is a
form of **event-driven / callback-driven control flow** — control
returns to the browser's own event loop between each call, rather than
one function holding control the entire time the way a plain `while`
loop would. Also recognized in: `setTimeout` recursively calling itself
instead of `setInterval`; a Node.js server's request handlers, each one
called by the runtime rather than the server code polling in a loop;
a UI framework's re-render scheduling; a state machine whose own
transition function decides what state (and therefore what handler)
runs next.

### SE Lens

The alternative not chosen: a plain `while (true) { renderer.render(...)
}` loop. This would actually run the render call more times than the
screen can show, wasting CPU/GPU work with zero visible benefit, and —
more seriously — a synchronous loop that never returns blocks the
browser's own main thread entirely, meaning the tab would freeze:
no clicks, no scrolling, no repaints of anything, not even this app's
own canvas, because `requestAnimationFrame`'s entire reason to exist
(cited above) is deferring work to align with the browser's actual
repaint cycle instead of fighting it. The real cost `requestAnimationFrame`
pays for that correctness: the loop is no longer a single, linear,
easy-to-step-through block of code — it's spread across many separate
invocations, connected only by each one scheduling the next, which is
exactly what the execution trace above had to make explicit rather than
leaving implicit.

### One sentence connecting this unit to what came before

Every object built in every earlier unit of this lesson — the scene,
the camera, the renderer, the cube — is read inside this one function,
which is the actual, final piece that turns five separate static
objects into the one moving picture this lesson set out to build.

---

## Closing

### Connect the pieces

Follow one concrete value through the whole file, start to finish: at
the moment `animate()` first runs (line 28), `cube.rotation.x` is
exactly `0` (its default, confirmed back in the Mesh unit's own
throwaway lab for `cube.position` — rotation defaults the same way).
Line 23 schedules this same function's next call before anything else
happens. Lines 24–25 change that one number to `0.01`, and its `y`
sibling to `0.01` as well. Line 26 hands `scene` — which, per Unit 1's
own proof, has exactly one child, this `cube`, connected by a real
`===`-verified parent/child link — to `renderer.render`, alongside
`camera`, whose own `position.z` (set once, in the Camera unit, to `5`,
and never touched again anywhere in this file) determines how far back
the viewpoint sits. `MeshNormalMaterial` (confirmed, its own unit, to
hold real per-face-color logic keyed on each triangle's normal
direction) turns that specific rotation value into a specific set of
face colors for this one frame. Sometime before the next repaint, the
browser calls `animate` again — the loop this project's own README will
keep coming back to as literally every future lesson's outermost
structure — and `cube.rotation.x` is now `0.02`, not because anything
re-read it from disk or asked the GPU what it currently was, but
because JavaScript's own `cube.rotation` object kept holding that exact
number in memory the entire time, the same live object `===`-confirmed
in the Mesh unit's own lab, now several frames further along than it
started.

## Commands needed

- **Serving the page locally.** Browsers block ES module imports
  (`import * as THREE from 'three'`) from `file://` URLs for security
  reasons — the page needs to be loaded over `http://`, even locally.
  From inside `lessons/lesson-01-scene-camera-renderer/`, run:

  ```
  npx serve .
  ```

  `npx` runs a package without installing it globally first; `serve` is
  a small static file server. Success output looks like:

  ```
  ┌───────────────────────────────────────┐
  │   Serving!                             │
  │   Local: http://localhost:3000         │
  └───────────────────────────────────────┘
  ```

  Open that `http://localhost:3000` URL in a browser — not the bare
  file path — to actually see the rotating cube.

- **Loading Three.js itself, without a bundler.** `index.html` (not
  shown as its own Concept Unit above, since it introduces no new
  Three.js concept — only an **import map**, a browser feature that
  tells the browser what a bare module specifier like `'three'`
  actually resolves to) needs:

  ```html
  <script type="importmap">
    {
      "imports": {
        "three": "https://unpkg.com/three@0.185.1/build/three.module.js"
      }
    }
  </script>
  <script type="module" src="main.js"></script>
  ```

  The version `0.185.1` is pinned to the exact version verified in this
  session's own Node labs above (see `HANDOFF.md`'s conventions) — not
  `@latest`, so this lesson's code doesn't silently start behaving
  differently in the future.

## Next lesson

Lesson 2 covers geometry and material in real depth — `BufferGeometry`'s
own attribute system beyond just `position`/`normal`/`uv`, and why
`MeshStandardMaterial` (which *does* need real lights) will replace
`MeshNormalMaterial` once your machining models' actual vertex colors —
the entire reason your `save_vertex_colored_obj` function writes six
numbers per vertex line instead of three — need to be read and rendered
correctly.
