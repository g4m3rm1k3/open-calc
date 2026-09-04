# Lesson 1: Turning an Angle Into a Rotation Matrix

**What you will build** — a Three.js scene containing a single sphere that
orbits the origin at a fixed radius, driven entirely by a rotation matrix you
derive and write yourself from trigonometry, not by Three.js's built-in
`.rotation` property. The transferable problem underneath the feature: how a
single number — an angle — becomes a rule for turning *any* point into a new
point. Every CNC rotary axis, every 3D engine's rotation system, and every
robot-arm joint this curriculum will touch all reduce to exactly this
mechanism.

**What you need to know first** — Nothing. This is Lesson 1.

**Pipeline diagram** — not applicable yet; this curriculum doesn't have a
named multi-stage pipeline until later lessons introduce one.

**Terms used in this lesson**
- **radian** — the unit an angle is measured in when it's defined as the
  ratio of arc length to radius, rather than a count out of 360. It exists
  because it's the unit every trigonometric function JavaScript's `Math`
  object provides expects and returns; working in degrees anywhere in this
  lesson would mean converting back and forth constantly instead of once.
- **trigonometric function** — a function (here, sine and cosine) that maps
  an angle to a ratio describing a right triangle built from that angle.
  They exist because a rotation, at its core, is defined in terms of these
  ratios — there is no way to write a rotation matrix without them.
- **rotation matrix** — a fixed 2×2 grid of numbers, built from the sine and
  cosine of one angle, that turns any point's `(x, y)` coordinates into the
  coordinates of that same point after being rotated by that angle around a
  fixed center. This is the concept this entire lesson exists to build, from
  first principles, so it stops being a black box.
- **origin** — the fixed point `(0, 0)` that a rotation is performed around,
  unless a different center is explicitly given. Every point in this lesson
  orbits it.
- **angular speed** — how fast an angle itself increases over time, measured
  in radians per second here. It exists so the sphere's orbit is driven by
  elapsed time rather than by a fixed step per frame, which would make the
  speed depend on how fast the machine happens to render.

**Objects and methods used**

*This lesson's own subject — the trigonometry the rotation matrix is built
from:*

- **`Math.cos`**
  - *What it is:* the cosine function, a static method on JavaScript's
    built-in `Math` object.
  - *Implementation:* `Math.cos(radians: number): number`, returning a value
    always between `-1` and `1`.
  - *Its use:* the rotation matrix's diagonal entries are built from this —
    it's the ratio that says how much of a point's original position survives
    unchanged along the axis being measured, after rotating by that angle.
  - *Type:* a `static` method — called on the `Math` object itself, never on
    an instance, because `Math` holds no state of its own to be an instance
    of anything.
  - *Responsibility:* given any real number of radians, produce the
    x-coordinate of the point that angle reaches on a unit circle — nothing
    more; it doesn't know what that number will be used for afterward.
  - *Depends on:* a single numeric argument, the angle in radians. No other
    state — this is a pure function with no side effects.
  - *Connects to:* called by this lesson's own `rotate2D` function (defined
    below, in The New Code); its return value flows directly into the
    matrix-multiplication arithmetic that produces a rotated coordinate.
  - *Shape:* a single floating-point number in, a single floating-point
    number out — never an array, never `NaN` for any finite real input.

- **`Math.sin`**
  - *What it is:* the sine function, `Math.cos`'s counterpart.
  - *Implementation:* `Math.sin(radians: number): number`, also bounded
    between `-1` and `1`.
  - *Its use:* the rotation matrix's off-diagonal entries come from this —
    the ratio describing how much of a point's original position "leaks"
    into the *other* axis as the angle rotates it.
  - *Type:* a `static` method, same reasoning as `Math.cos` above.
  - *Responsibility:* given radians, produce the y-coordinate of the same
    unit-circle point `Math.cos` describes the x-coordinate of.
  - *Depends on:* one numeric radians argument, nothing else.
  - *Connects to:* called alongside `Math.cos` inside `rotate2D`; its output
    is combined with `Math.cos`'s output using addition and subtraction to
    build both new coordinates.
  - *Shape:* one float in, one float out, same as `Math.cos`.

- **`Math.PI`**
  - *What it is:* a named constant on the `Math` object, not a function —
    the ratio of a circle's circumference to its diameter.
  - *Implementation:* a fixed `number`, approximately `3.141592653589793`,
    computed once by the JavaScript engine and never recomputed.
  - *Its use:* one full turn is `2 * Math.PI` radians; this lesson uses it to
    convert human-friendly degree values into the radians `Math.cos` and
    `Math.sin` actually require, when stating example angles in prose.
  - *Type:* a constant property — reading `Math.PI` never runs any code,
    unlike calling `Math.cos(...)`.
  - *Responsibility:* hold one fixed, correct value for π, available anywhere
    without redefining it.
  - *Depends on:* nothing — it needs no arguments because it isn't callable.
  - *Connects to:* used directly in this lesson's own prose and lab code
    wherever a degree-to-radian conversion is shown (`degrees * (Math.PI /
    180)`).
  - *Shape:* a single, fixed floating-point number — never anything else.

*Scene setup — Three.js infrastructure, not this lesson's own subject.* This
lesson's code needs a place to put the orbiting sphere, a viewpoint to see it
from, and a way to turn that into pixels. That trio — `THREE.Scene`,
`THREE.PerspectiveCamera`, and `THREE.WebGLRenderer` together with
`renderer.render(scene, camera)` — is explained in full, with its own CRC-
style walkthrough, in
[`threejs-scene-camera-renderer.md`](../src/docs/concepts/threejs-scene-camera-renderer.md),
because this exact setup will recur, unchanged, in every remaining lesson of
this curriculum. The Mechanical Walkthrough below still enumerates each call
where it appears in this lesson's own code, since the concept file explains
the trio in isolation but doesn't replace seeing it wired into this lesson's
own file.

**Everything else in the file, not this lesson's subject but still
explained:**

- **`THREE.SphereGeometry`**
  - *What it is:* a class describing the raw vertex/triangle shape of a
    sphere, with no color, position, or material of its own.
  - *Implementation:* `new THREE.SphereGeometry(radius, widthSegments,
    heightSegments)` — this lesson calls it as `new THREE.SphereGeometry(0.2,
    16, 16)`, a small sphere built from 16 horizontal and 16 vertical
    segments.
  - *Its use:* the orbiting point in this lesson needs to be *visible* as
    more than a mathematical location — a small sphere gives it a real,
    renderable shape.
  - *Type:* a constructible class, instantiated with `new`.
  - *Responsibility:* compute and hold the list of vertices and triangles
    that approximate a sphere at the given resolution — nothing about how
    it's colored or where it sits in the scene.
  - *Depends on:* three numbers at construction time — a radius and two
    segment counts controlling how smooth the approximation is.
  - *Connects to:* passed directly into `THREE.Mesh`'s constructor, which
    pairs this geometry with a material to make something renderable.
  - *Shape:* an object holding internal vertex-buffer data — never inspected
    directly in this lesson; only ever handed straight to `THREE.Mesh`.

- **`THREE.MeshBasicMaterial`**
  - *What it is:* a class describing how a mesh's surface is colored, using
    the simplest available shading model — flat color, unaffected by any
    light in the scene.
  - *Implementation:* `new THREE.MeshBasicMaterial({ color })`, where `color`
    is a hexadecimal integer like `0xff7a1a`.
  - *Its use:* this lesson has no lights in the scene yet — a material that
    reacted to lighting would render as flat black, so `MeshBasicMaterial` is
    the one that actually shows a visible color with nothing else set up.
  - *Type:* a constructible class, instantiated with `new`.
  - *Responsibility:* hold the appearance settings — here, just a fixed
    color — that the renderer reads when drawing every triangle of whatever
    geometry it's paired with.
  - *Depends on:* an options object at construction time; this lesson
    supplies only `color`, leaving every other option (opacity, wireframe,
    and so on) at its default.
  - *Connects to:* passed into `THREE.Mesh`'s constructor alongside the
    geometry; the renderer reads it during `renderer.render(...)`.
  - *Shape:* an object holding shading settings — a flat color value in this
    lesson, never a texture or array here.

- **`THREE.Mesh`**
  - *What it is:* the class that combines one geometry and one material into
    a single object that can actually be placed in a scene.
  - *Implementation:* `new THREE.Mesh(geometry, material)`, a two-argument
    constructor.
  - *Its use:* neither a `SphereGeometry` nor a `MeshBasicMaterial` alone is
    addable to a scene or movable — `Mesh` is the object with a real
    `position` that this lesson's animation loop actually updates every
    frame.
  - *Type:* a constructible class, instantiated with `new`, and itself a
    subclass of `THREE.Object3D` (the base class giving it `position`,
    `rotation`, and `scale`).
  - *Responsibility:* own the pairing of "what shape" (geometry) and "what
    it looks like" (material), and carry a transform (position, rotation,
    scale) that says where in the scene that shape currently sits.
  - *Depends on:* one `THREE.SphereGeometry` and one `THREE.MeshBasicMaterial`
    instance, supplied at construction.
  - *Connects to:* added to the scene with `scene.add(sphere)`; its
    `.position` is overwritten every frame by this lesson's own `animate`
    function using values `rotate2D` computes.
  - *Shape:* an object whose `.position` field is itself a `THREE.Vector3` —
    three numbers (`x`, `y`, `z`), never a plain array.

- **`mesh.position.set(x, y, z)`**
  - *What it is:* an instance method on `THREE.Vector3`, called through a
    mesh's `.position` field.
  - *Implementation:* `Vector3.prototype.set(x, y, z): Vector3` — overwrites
    all three fields at once and returns the same vector.
  - *Its use:* this is the one call in the whole file that actually moves the
    sphere — everything upstream of it (the rotation matrix, the elapsed
    time) exists only to produce the three numbers handed to this call.
  - *Type:* an instance method, called on the specific `Vector3` object that
    is this mesh's `position` — never a `static` call.
  - *Responsibility:* hold and update exactly one thing's location in 3D
    space; nothing about rendering, color, or shape.
  - *Depends on:* three numbers, `x`, `y`, `z`, supplied by the caller —
    here, the `x` and `y` this lesson's `rotate2D` returns, and a fixed `0`
    for `z` since this lesson stays in a flat plane.
  - *Connects to:* called once per animation frame from inside `animate`;
    read back by the renderer during `renderer.render(scene, camera)`, which
    is what actually turns the new position into a moved sphere on screen.
  - *Shape:* takes three plain numbers, returns the same `Vector3` instance
    (mutated in place) — never a new object.

- **`renderer.setAnimationLoop(callback)`**
  - *What it is:* an instance method on `THREE.WebGLRenderer` that registers
    a function to be called automatically, once per display refresh, for as
    long as the page is open.
  - *Implementation:* `setAnimationLoop(callback: (time: number) => void):
    void` — internally, Three.js uses this to manage the browser's own
    `requestAnimationFrame` loop so the calling code never has to schedule
    the next frame itself.
  - *Its use:* the sphere's orbit has to be redrawn continuously — calling
    `renderer.render(...)` exactly once would draw exactly one still frame;
    this is what turns that single frame into a smooth, ongoing animation.
  - *Type:* an instance method on the specific `renderer` object this lesson
    already constructed — not `static`.
  - *Responsibility:* own the repeating call schedule for one callback,
    keeping it synchronized to the browser's actual refresh rate rather than
    a fixed timer.
  - *Depends on:* one callback function, supplied once; Three.js re-invokes
    it forever after that, passing the current elapsed time in milliseconds
    as that callback's own single argument each time.
  - *Connects to:* calls this lesson's own `animate` function every frame;
    `animate` in turn calls `mesh.position.set(...)` and
    `renderer.render(...)` — this is the outermost loop everything else in
    the file's runtime behavior happens inside of.
  - *Shape:* takes one function value; returns nothing (`undefined`) itself
    — its effect is entirely the repeated future calls it schedules, not any
    return value.

---

## Concept Unit: A Scene You Can Prove Is Real

### The Problem

A `<canvas>` element in a browser only knows how to hold pixels. It has no
idea what "a small sphere near the middle of the screen" means. Before this
lesson can show *anything* moving according to a rotation matrix, it needs a
working pipeline that can show something completely *still* first — a single
sphere, sitting at a fixed point, with nothing yet computed or animated.

> **Try it yourself, before reading on:** you already know HTML puts elements
> on a page with tags, and CSS positions them with properties like `left` and
> `top`. Given only that, what do you think is *missing* if you tried to
> place a "3D sphere" on a page the same way — with a tag and a couple of
> position properties? What would `left: 50px` even mean for an object that
> also has a *depth*, and a camera that might be looking at it from an angle?
> Sketch, in words, what extra piece of information a truly 3D object needs
> that a 2D HTML element never does.

### The New Code

This is a brand-new file — nothing to isolate a throwaway example against
yet, since the whole file *is* the minimal isolated example. Type this into
a new file named `lesson-01.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Lesson 1 — Turning an Angle Into a Rotation Matrix</title>
<style>
  body { margin: 0; background: #12181f; overflow: hidden; }
</style>
</head>
<body>
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js"
  }
}
</script>
<script type="module">
import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 0, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(0.2, 16, 16);
const material = new THREE.MeshBasicMaterial({ color: 0xff7a1a });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

renderer.render(scene, camera);
</script>
</body>
</html>
```

### The Updated Project

There's no larger enclosing structure to return to yet — this file, in full,
is what was just typed. Opening it in a browser (any local web server, not a
double-clicked file, per the Verification Rule note below) should show one
small orange sphere, motionless, near the center of a near-black page.

### Mechanical Walkthrough

Working through every distinct element, in order:

- `<script type="importmap">` — a `<script>` tag whose `type` attribute is
  `importmap`, not JavaScript to execute directly; the browser reads its
  JSON body as a table telling it what real URL to fetch when later code
  writes `import ... from 'three'`. Without it, the bare specifier `'three'`
  means nothing to a browser — Node.js and bundlers resolve that name using
  `node_modules`, but a browser loading a script with no build step has no
  such folder to look in.
- `"three": "https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.js"`
  — the one mapping entry this lesson needs: whenever module code asks for
  `'three'`, fetch this exact pinned version's real ES module build from
  jsDelivr's CDN instead. Pinning the exact version (`@0.185.1`) matters:
  without it, "latest" could silently change mid-curriculum and break code
  that worked yesterday.
- `<script type="module">` — a second `<script>` tag, this one holding real
  JavaScript, but marked `type="module"` rather than left as a classic
  script. This matters because only module scripts are allowed to use the
  `import` keyword at all, and only module scripts respect the import map
  above — a classic script tag with the same `import` line would fail.
- `import * as THREE from 'three';` — an ES module import statement. `* as
  THREE` means: take every named export the `three` module provides and
  collect them under one local object called `THREE`, so the rest of the
  file can write `THREE.Scene`, `THREE.Mesh`, and so on, exactly the way
  older, non-module Three.js tutorials use a global `THREE` — except here
  `THREE` is a genuine local variable, not a global the CDN script silently
  created.
- `new THREE.Scene()` — see
  [`threejs-scene-camera-renderer.md`](../src/docs/concepts/threejs-scene-camera-renderer.md)
  for the full breakdown of what a scene is and why it's needed; here it's
  constructed with zero arguments and assigned to `scene`, empty until the
  sphere is added to it further down.
- `new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight,
  0.1, 1000)` — same concept file for the class itself; concretely, this
  call chooses a 45-degree vertical field of view, an aspect ratio computed
  live from the actual browser window's current pixel dimensions (so the
  scene doesn't look stretched on a non-square window), and a visible range
  from `0.1` to `1000` units from the camera.
- `camera.position.set(0, 0, 10)` — the same `Vector3.prototype.set` method
  documented above for `mesh.position.set`, called here on the *camera's*
  position instead of the sphere's. Without this line the camera would sit
  at the default `(0, 0, 0)` — exactly where the sphere is about to be
  placed too — which would put the camera's own viewpoint *inside* the
  sphere, rendering nothing visible at all.
- `new THREE.WebGLRenderer({ antialias: true })` — again, full breakdown in
  the concept file; concretely constructed here with antialiasing turned on,
  smoothing the jagged edges the sphere's triangle approximation would
  otherwise show.
- `renderer.setSize(window.innerWidth, window.innerHeight)` — sizes the
  renderer's output to fill the actual current browser window, read live
  from `window.innerWidth`/`window.innerHeight` rather than a fixed guess.
- `document.body.appendChild(renderer.domElement)` — a standard DOM method,
  not part of Three.js at all: `document.body` is the page's existing
  `<body>` element, `appendChild` adds a new child node to it, and
  `renderer.domElement` (documented above) is the real `<canvas>` the
  renderer created internally. This is the exact moment the renderer's
  output becomes part of the visible page rather than an object sitting only
  in JavaScript memory.
- `new THREE.SphereGeometry(0.2, 16, 16)` — documented above; produces a
  small sphere shape with a radius of `0.2` scene units.
- `new THREE.MeshBasicMaterial({ color: 0xff7a1a })` — documented above;
  `0xff7a1a` is a hexadecimal integer literal — JavaScript's `0x` prefix
  marks a base-16 number — matching this curriculum's safety-orange accent
  color established for every lesson.
- `new THREE.Mesh(geometry, material)` — documented above; combines the two
  just-built objects into `sphere`, the one thing that actually has a
  position.
- `scene.add(sphere)` — an instance method on `THREE.Scene`, taking any
  `Object3D` (which `Mesh` is, by inheritance) and adding it to the scene's
  internal `children` list; without this call the sphere exists in memory
  but the renderer would never find it when walking the scene.
- `renderer.render(scene, camera)` — documented in the concept file;
  concretely, the single call that actually produces this file's one static
  frame.

### CS Lens

The `THREE.WebGLRenderer` object is an example of the **Facade pattern**: it
exposes one simple method call, `render(scene, camera)`, that hides an
enormous amount of real complexity underneath — compiling GPU shader
programs, uploading vertex data into GPU memory, managing WebGL's own
low-level state machine. None of that complexity disappears; it's just no
longer something this lesson's own code has to touch directly.

```
Also recognized in: a car's accelerator pedal hiding fuel injection
timing, an OS file-write call hiding disk block allocation, a database
driver's query() call hiding TCP framing and wire protocol, a CNC
controller's single "run program" button hiding axis interpolation,
acceleration ramping, and spindle control underneath.
```

### SE Lens

Three.js splits "what to draw" (`Scene`), "from where" (`Camera`), and "how
to actually draw it" (`WebGLRenderer`) into three separate objects instead of
one combined `Renderer3D` class that took a list of shapes and a viewpoint as
plain arguments. The alternative — one big class — would be less code to
write for a single fixed scene like this lesson's. The tradeoff shows up the
moment an app needs more than one camera (a picture-in-picture minimap, for
instance) or more than one renderer targeting different canvases: with
separate objects, that's just constructing another `Camera` or another
`WebGLRenderer` and reusing the same `Scene`; with one fused class, it would
mean duplicating the entire scene description alongside it. This lesson pays
the small cost of three separate constructor calls now so that later lessons
in this curriculum — several of which will want more than one camera angle
on screen at once — don't have to restructure anything to get it.

### Connect the Pieces

A `Scene` holds the sphere, a `Camera` defines the fixed viewpoint that will
see it, and a single `renderer.render(scene, camera)` call turns that pairing
into the still frame on screen — the minimum working pipeline the rest of
this lesson's actual subject, the rotation matrix, now has something real to
animate inside of.

---

## Concept Unit: Turning an Angle Into a Point

### The Problem

The sphere from the previous unit sits still, at whatever position it was
last given. The goal now is to make it *orbit* the origin — trace a circle,
at a fixed distance, as time passes. Given only a starting point and an angle
that grows over time, how do you compute where that point should be *right
now*?

> **Try it yourself, before reading on:** picture a point sitting 3 units to
> the right of the center of a clock face, at the 3 o'clock position. If you
> nudge it forward by a small angle, toward 4 o'clock, does its distance from
> the center change, or stay exactly the same? Now think about *both* of its
> coordinates at once — as it moves from 3 o'clock toward 12 o'clock, does
> its horizontal position increase or decrease? Does its vertical position
> increase or decrease? Try to state, in your own words and without any
> formula yet, a rule connecting "how far around it's turned" to "where it
> ends up" — even a rough, qualitative one.

### Introduce the Concept in Isolation

Before touching the project file, work this out as a standalone script,
disconnected from Three.js entirely — this is pure math, and it's worth
seeing it produce real numbers with nothing else in the way.

Create a scratch file (not part of the project — this gets discarded at the
end of this step) and type:

```javascript
function rotate2D(x, y, thetaRadians) {
  const cosT = Math.cos(thetaRadians);
  const sinT = Math.sin(thetaRadians);
  const xNew = x * cosT - y * sinT;
  const yNew = x * sinT + y * cosT;
  return { x: xNew, y: yNew };
}

const start = { x: 5, y: 0 };
const anglesDeg = [0, 30, 45, 90, 180, 270, 360];

for (const deg of anglesDeg) {
  const rad = deg * (Math.PI / 180);
  const r = rotate2D(start.x, start.y, rad);
  console.log(`theta = ${deg}deg -> x=${r.x.toFixed(4)}, y=${r.y.toFixed(4)}`);
}
```

Run it with `node rotate2d.js`. The real output:

```
theta = 0deg -> x=5.0000, y=0.0000
theta = 30deg -> x=4.3301, y=2.5000
theta = 45deg -> x=3.5355, y=3.5355
theta = 90deg -> x=0.0000, y=5.0000
theta = 180deg -> x=-5.0000, y=0.0000
theta = 270deg -> x=-0.0000, y=-5.0000
theta = 360deg -> x=5.0000, y=-0.0000
```

This is called a **rotation matrix**, even though the code above never
writes the word "matrix" or builds a grid data structure — `xNew = x*cosT -
y*sinT` and `yNew = x*sinT + y*cosT` are exactly what multiplying the
2-element vector `(x, y)` by the 2×2 grid of numbers

```
[ cosT   -sinT ]
[ sinT    cosT ]
```

means, entry by entry: each new coordinate is a weighted sum of the *old*
`x` and `y`, where the weights are the matrix's own row of numbers. Writing
it as four separate `cosT`/`sinT` multiplications, the way `rotate2D` does,
and writing it as an actual matrix multiplied against a column vector are
the same computation — the matrix notation is just a compact, standard way
to write down "multiply-and-add coordinates by these four specific numbers"
that generalizes cleanly once a third coordinate (`z`) gets added in the next
lesson.

The 90° and 270° rows prove something worth checking explicitly: at 90°, the
point that started at `(5, 0)` — 5 units out along the positive x-axis — ends
up at `(0, 5)`, 5 units out along the positive *y*-axis, with its distance
from the origin unchanged. A second run, checking that distance directly for
angles that don't land on a clean multiple of 90°:

```javascript
for (const deg of [17, 123, 289]) {
  const rad = deg * (Math.PI / 180);
  const r = rotate2D(start.x, start.y, rad);
  const len = Math.sqrt(r.x * r.x + r.y * r.y);
  console.log(`theta = ${deg}deg -> length = ${len.toFixed(6)} (started at 5)`);
}
```

Real output:

```
theta = 17deg -> length = 5.000000 (started at 5)
theta = 123deg -> length = 5.000000 (started at 5)
theta = 289deg -> length = 5.000000 (started at 5)
```

This proves the defining property of a rotation, not just an incidental
detail of this one example: for every angle tried, the distance from the
origin comes back as exactly `5.000000`, unchanged from the starting length.
A rotation matrix only ever turns a point around a fixed center — it never
stretches, shrinks, or otherwise moves it closer to or farther from that
center.

### Discard the Throwaway Example

This scratch file — `rotate2d.js`, run standalone with plain `node` — is
now discarded. It never becomes part of `lesson-01.html`. What continues into
the real project is the *idea* it just proved, re-typed directly inside the
HTML file's own `<script type="module">` block next.

### Project Change

- **Reference Source** — No reference counterpart. This is a from-scratch
  addition: the rotation matrix and the orbiting-sphere animation are this
  lesson's own original teaching content, not a port of any existing
  reference implementation.
- **Files affected** — `lesson-01.html`, modified.
- **Change type** — add.
- **Location** — inside the existing `<script type="module">` block, after
  the `scene.add(sphere);` line and before the previous unit's final
  `renderer.render(scene, camera);` call, which gets replaced by the new
  animation loop below.
- **Dependencies** — the scene, camera, renderer, and sphere from the
  previous Concept Unit must already exist in the file.

### The New Code

```javascript
function rotate2D(x, y, thetaRadians) {
  const cosT = Math.cos(thetaRadians);
  const sinT = Math.sin(thetaRadians);
  const xNew = x * cosT - y * sinT;
  const yNew = x * sinT + y * cosT;
  return { x: xNew, y: yNew };
}

const radius = 3;
const angularSpeed = 1; // radians per second

function animate(time) {
  const t = time / 1000;
  const angle = t * angularSpeed;
  const { x, y } = rotate2D(radius, 0, angle);
  sphere.position.set(x, y, 0);
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
```

### The Updated Project

The full `<script type="module">` block now reads:

```javascript
  1  import * as THREE from 'three';
  2
  3  const scene = new THREE.Scene();
  4
  5  const camera = new THREE.PerspectiveCamera(
  6    45,
  7    window.innerWidth / window.innerHeight,
  8    0.1,
  9    1000
 10  );
 11  camera.position.set(0, 0, 10);
 12
 13  const renderer = new THREE.WebGLRenderer({ antialias: true });
 14  renderer.setSize(window.innerWidth, window.innerHeight);
 15  document.body.appendChild(renderer.domElement);
 16
 17  const geometry = new THREE.SphereGeometry(0.2, 16, 16);
 18  const material = new THREE.MeshBasicMaterial({ color: 0xff7a1a });
 19  const sphere = new THREE.Mesh(geometry, material);
 20  scene.add(sphere);
 21
 22  function rotate2D(x, y, thetaRadians) {          // ← new
 23    const cosT = Math.cos(thetaRadians);            // ← new
 24    const sinT = Math.sin(thetaRadians);             // ← new
 25    const xNew = x * cosT - y * sinT;                // ← new
 26    const yNew = x * sinT + y * cosT;                // ← new
 27    return { x: xNew, y: yNew };                     // ← new
 28  }                                                   // ← new
 29                                                       // ← new
 30  const radius = 3;                                   // ← new
 31  const angularSpeed = 1; // radians per second        // ← new
 32                                                        // ← new
 33  function animate(time) {                             // ← new
 34    const t = time / 1000;                              // ← new
 35    const angle = t * angularSpeed;                     // ← new
 36    const { x, y } = rotate2D(radius, 0, angle);         // ← new
 37    sphere.position.set(x, y, 0);                        // ← new
 38    renderer.render(scene, camera);                      // ← new
 39  }                                                       // ← new
 40                                                          // ← new
 41  renderer.setAnimationLoop(animate);                     // ← new
```

Line 39's `renderer.render(scene, camera)` replaces the previous unit's
standalone `renderer.render(scene, camera);` call, which is why that earlier
line no longer appears on its own — it now runs every frame, from inside
`animate`, instead of running exactly once at the bottom of the file. As a
whole, this file now does something categorically different from the
previous unit's end state: instead of drawing one motionless frame, it
continuously recomputes the sphere's position from elapsed time and redraws,
forever, for as long as the page stays open — the still picture from the
previous unit has become a real animation.

### Mechanical Walkthrough

- `function rotate2D(x, y, thetaRadians) { ... }` — a function declaration,
  the same JavaScript syntax any function definition uses; it takes three
  parameters and, because there's no `return` on every path *except* the
  final one, always returns exactly the object built on its last line.
- `const cosT = Math.cos(thetaRadians);` — a call to `Math.cos`, documented
  in full in this lesson's Header, storing its result in a `const` — a
  variable binding that cannot be reassigned after this line, appropriate
  here because `cosT` is never meant to change once computed for a given
  call.
- `const sinT = Math.sin(thetaRadians);` — the matching call to `Math.sin`,
  also documented in the Header, computed once per call and reused in both
  of the next two lines rather than being called twice.
- `const xNew = x * cosT - y * sinT;` — the arithmetic that *is* the
  rotation matrix's first row: `x` and `y` are the original coordinates,
  `*` is ordinary multiplication, and `-` combines the two products by
  subtraction. This single line is the entire reason `cosT` and `sinT` were
  computed above it — it's the first of the two weighted sums the Isolated
  Example step already showed corresponds to `[cosT, -sinT]` as a matrix
  row.
- `const yNew = x * sinT + y * cosT;` — the matrix's second row, the same
  kind of weighted sum as the line above it, but combined with `+` instead
  of `-`, and with the two coefficients swapped — `[sinT, cosT]` instead of
  `[cosT, -sinT]`. The sign difference between this line and the previous
  one is not arbitrary: it's what makes the transformation an actual
  rotation rather than some other kind of linear stretch, per the CS Lens
  below.
- `return { x: xNew, y: yNew };` — an object literal, returned directly.
  Bundling both coordinates into one object (rather than, say, returning an
  array `[xNew, yNew]`) lets the caller destructure it by name, `x` and `y`,
  instead of remembering an index order.
- `const radius = 3;` — a plain numeric constant, the fixed distance from
  the origin the sphere will orbit at, chosen arbitrarily to be visibly
  inside the camera's view given this lesson's camera position of `(0, 0,
  10)`.
- `const angularSpeed = 1;` — another numeric constant, in radians per
  second; a value of `1` means the sphere completes a full `2π`-radian orbit
  roughly every 6.28 seconds.
- `function animate(time) { ... }` — a second function declaration; unlike
  `rotate2D`, this one is never called directly by this lesson's own code —
  it's handed to `renderer.setAnimationLoop` (documented in the Header) as a
  callback, which is what actually invokes it, repeatedly, supplying `time`
  itself each call.
- `const t = time / 1000;` — `time` arrives from `renderer.setAnimationLoop`
  as a timestamp in milliseconds (the same convention the browser's native
  `requestAnimationFrame` uses); dividing by `1000` converts it to seconds,
  matching the unit `angularSpeed` is defined in.
- `const angle = t * angularSpeed;` — multiplying elapsed seconds by radians-
  per-second gives the total angle, in radians, the sphere should have
  rotated through by this exact moment — not a fixed increment added each
  frame, but a value recomputed fresh from total elapsed time every call.
- `const { x, y } = rotate2D(radius, 0, angle);` — a call to the `rotate2D`
  function defined above, immediately destructured: JavaScript's object
  destructuring syntax pulls the `x` and `y` fields off the returned object
  straight into two local variables of the same names, rather than requiring
  a separate `const result = rotate2D(...)` line followed by
  `result.x`/`result.y` everywhere after.
- `sphere.position.set(x, y, 0);` — documented in the Header as
  `mesh.position.set`; called here with the two just-computed coordinates
  and a fixed `0` for the z-coordinate, since this lesson's rotation stays
  entirely in the flat x-y plane.
- `renderer.render(scene, camera);` — the same call documented in the
  concept file, now executed once per animation frame instead of once at
  the end of the file.
- `renderer.setAnimationLoop(animate);` — documented in the Header; the one
  line that actually starts the ongoing loop, handing `animate` to Three.js
  to be called forever, once per display refresh.

**Execution trace.** `animate` is called repeatedly with different `time`
values as the page keeps running; here's what it actually computes at five
real sample timestamps, run through the identical `rotate2D` logic shown
above (`radius = 3`, `angularSpeed = 1`):

```
time=   0ms -> t=0.000s, angle=0.0000rad, x=3.0000, y=0.0000
time= 500ms -> t=0.500s, angle=0.5000rad, x=2.6327, y=1.4383
time=1000ms -> t=1.000s, angle=1.0000rad, x=1.6209, y=2.5244
time=1571ms -> t=1.571s, angle=1.5710rad, x=-0.0006, y=3.0000
time=3142ms -> t=3.142s, angle=3.1420rad, x=-3.0000, y=-0.0012
```

At `time=0`, `angle` is `0`, and `rotate2D(3, 0, 0)` returns the starting
point unchanged — `cos(0)` is `1` and `sin(0)` is `0`, so `xNew = 3*1 - 0*0 =
3` and `yNew = 3*0 + 0*1 = 0`. By `time=1571` — 1.571 seconds in, matching
`angle ≈ π/2` — `x` has fallen to essentially `0` and `y` has risen to `3`:
`cos(π/2)` is `0` and `sin(π/2)` is `1`, so the sphere has swept a quarter
turn from the 3-o'clock position to the 12-o'clock position, exactly the
qualitative direction this unit's opening Socratic prompt asked about. By
`time=3142` — roughly `π` seconds, a half turn — `x` has swung all the way to
`-3` and `y` is back near `0`: `cos(π)` is `-1`, so `xNew = 3*(-1) = -3`.
Each row's `x` and `y` are not independent guesses; they fall directly out of
`cosT` and `sinT` at that specific `angle`, which is itself computed fresh
from `time` on every single call.

### CS Lens

The 2×2 grid of numbers `rotate2D` computes and applies by hand is a
**rotation matrix**, and applying it the way this unit does — multiplying it
against a coordinate pair to produce a new coordinate pair — is a **linear
transformation**: a function on points that preserves straight lines and a
fixed origin, never bending space or moving the origin itself. The specific
property proved above (distance from the origin never changes) is what marks
this particular linear transformation as a *rotation*, rather than some
other kind, like a stretch or a shear.

```
Also recognized in: an analog clock's hour and minute hands, converting
between polar and Cartesian coordinates, every robotic-arm joint's
forward kinematics, gear trains in mechanical clocks, epicycles in
Fourier series, and — the reason this curriculum exists — every CNC
rotary axis (A, B, or C) turning a workpiece or tool around a fixed
center.
```

### SE Lens

This unit writes the rotation by hand, using raw `Math.cos`/`Math.sin`
arithmetic, instead of simply setting `sphere.rotation.z = angle` — a single
line Three.js's own `Object3D` class would happily accept, since every mesh
already carries a built-in `rotation` property. The alternative not chosen
here — `sphere.rotation.z = angle` — is genuinely simpler and is exactly
what production code reaching for a working rotation would use. It was
deliberately skipped in this unit because it hides the mechanism this entire
curriculum exists to teach: `sphere.rotation.z = angle` gives no visibility
into *why* a rotation preserves distance from the origin, or what `cosT` and
`sinT` are actually doing to the coordinates underneath. The real cost being
paid here is technical debt, openly: `rotate2D` only works in a flat 2D
plane, hard-codes rotation around the origin, and has no way to combine with
a *second* rotation about a different axis — all limitations the next lesson
removes by generalizing this exact idea into `THREE.Matrix4` and rotation
about a real third dimension.

### Connect the Pieces

Elapsed time flows into `angle`; `angle` flows into `rotate2D`'s `cosT` and
`sinT`; those flow into the two weighted-sum lines that are the rotation
matrix itself; the resulting `{ x, y }` flows into `sphere.position.set(x, y,
0)`; and that new position is what `renderer.render(scene, camera)` — set up
in the previous Concept Unit — actually draws, every single frame, for as
long as the page runs: one continuous chain from a single number, time, all
the way to a visibly orbiting sphere.

---

## Connect the Pieces (Lesson Close)

Follow one concrete value all the way through: at `time = 1000` (one second
into the page loading), `animate` computes `t = 1.000`, then `angle =
1.0000` radian. That angle is handed to `rotate2D(3, 0, 1.0000)`, which
computes `cosT = Math.cos(1.0000) ≈ 0.5403` and `sinT = Math.sin(1.0000) ≈
0.8415`, then `xNew = 3 * 0.5403 - 0 * 0.8415 = 1.6209` and `yNew = 3 *
0.8415 + 0 * 0.5403 = 2.5244` — matching the verified trace above exactly.
Those two numbers are handed straight to `sphere.position.set(1.6209,
2.5244, 0)`, moving the actual `THREE.Mesh` object that the first Concept
Unit built out of a `SphereGeometry` and a `MeshBasicMaterial`. One frame
later, `renderer.render(scene, camera)` — using the `Scene` and
`PerspectiveCamera` that same first unit constructed — reads that new
position and produces the next visible frame. A single angle, computed from
nothing more than elapsed time, is now a sphere visibly moving in a circle:
the entire mechanism this lesson set out to de-mystify.

**Next lesson:** Lesson 2 takes this same 2×2 idea and extends it into 3D —
rotation about the Z axis specifically — using Three.js's own `THREE.Matrix4`
class instead of hand-written arithmetic, and applies it to a real mesh's
full orientation instead of a bare point's position.
