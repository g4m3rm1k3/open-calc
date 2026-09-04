# Lesson 4: Perspective Projection

**What you will build:** a real, observed understanding of what the
four numbers in `new THREE.PerspectiveCamera(fov, aspect, near, far)`
actually control — by breaking each one on purpose and watching what
happens, then confirming, with real executed math, the actual
arithmetic reason distant objects look smaller on screen at all. This
is the last piece needed before Phase C's own subject: understanding
the orbit camera your existing tool already has.

**What you need to know first:** Lessons 1-3 in full — `Scene`/
`Camera`/`Renderer`, `BufferGeometry`, and lit materials with computed
normals.

**Terms used in this lesson:**
- **frustum** — the actual 3D shape a camera can see: a truncated
  pyramid (wide at the far end, narrow at the near end), not an
  infinite cone or an unbounded box. Everything inside this shape gets
  rendered; everything outside it — behind the camera, beyond `far`,
  closer than `near`, or simply outside the cone `fov` defines — does
  not.
- **field of view (`fov`)** — the angle, in degrees, of that frustum's
  own cone — how wide a slice of the world is visible at any given
  distance. A small `fov` sees a narrow sliver of the world (like a
  telephoto lens); a large `fov` sees a wide slice (like a wide-angle
  lens) — the same everyday intuition "zoom" already means.
- **aspect ratio (`aspect`)** — width ÷ height of the actual output
  image. It exists so a camera's own field of view can be stretched
  correctly to match a non-square viewport — without it, matching the
  canvas's real shape, a perfectly round object would render visibly
  stretched into an oval.
- **near / far (clipping planes)** — the closest and farthest distances
  from the camera that still get rendered at all. Anything closer than
  `near` or farther than `far` is clipped — simply not drawn, as if it
  doesn't exist, regardless of whether it would otherwise be visible.
- **perspective divide** — the actual arithmetic reason distant objects
  appear smaller: a 3D point's on-screen position is computed by
  dividing its `x` and `y` by its own depth (`z`, roughly — the real
  formula also folds in `fov`/`aspect`/`near`/`far`, but the
  divide-by-depth is the essential operation). The same real-world
  height, twice as far away, produces exactly half the on-screen size —
  this lesson's own throwaway lab proves it with real numbers.
- **projection matrix** — the actual 4×4 matrix a `PerspectiveCamera`
  builds internally from its four numbers (`fov`/`aspect`/`near`/`far`),
  packaging the frustum shape and the perspective divide into a single
  mathematical object the GPU can apply to every vertex efficiently.
  This lesson doesn't derive that matrix by hand — deliberately, given
  the scope you chose (going deep on Three.js's own model, not raw
  matrix/shader math) — but you now understand exactly *what* it's
  responsible for producing, even without deriving its sixteen numbers
  yourself.

**Objects and methods used:**

- **`camera.fov` / `camera.aspect` / `camera.near` / `camera.far`**
  - *What they are:* the four numbers a `PerspectiveCamera` (Lesson 1)
    stores, defining its own frustum (this lesson's own term).
  - *Implementation:* set at construction
    (`new THREE.PerspectiveCamera(fov, aspect, near, far)`) or changed
    afterward as plain properties (`camera.fov = 60`), though changing
    any of them after construction requires calling
    `camera.updateProjectionMatrix()` (this lesson's own term) before
    the change actually takes effect.
  - *Its use:* your own `mesh_viewer.html` sets
    `fov=45`, `aspect` computed live from the window size,
    `near=0.001`, `far=100000` — deliberately extreme near/far values,
    worth understanding now that you know what they actually control.
  - *Type:* plain numeric properties on a `PerspectiveCamera` instance.
  - *Responsibility:* together, to fully determine the shape of the
    visible frustum — nothing about *where* the camera is or which way
    it faces (that's `.position`/`.rotation`, inherited from `Object3D`,
    Lesson 1) — purely the shape of what's visible from wherever it is.
  - *Depends on:* nothing external — four independent numbers.
  - *Connects to:* combined internally into the camera's own
    `.projectionMatrix` (this lesson's own term), rebuilt by
    `updateProjectionMatrix()`.
  - *Shape:* `PerspectiveCamera`'s own data, alongside the `.position`/
    `.rotation` it inherits from `Object3D` (Lesson 1) — position
    answers "where/which way," these four numbers answer "how much do
    you see from there."

- **`camera.updateProjectionMatrix()`**
  - *What it is:* a method that rebuilds a camera's internal
    `.projectionMatrix` (this lesson's own term) from its current
    `fov`/`aspect`/`near`/`far` values.
  - *Implementation:* called with no arguments; reads the camera's own
    current property values and recomputes its projection matrix from
    them.
  - *Its use:* required any time `fov`/`aspect`/`near`/`far` change
    after construction — most commonly, `aspect`, whenever a browser
    window is resized, exactly the pattern this lesson's own working
    checkpoint uses.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to keep the camera's actual rendering behavior in
    sync with its own stated properties — changing `camera.aspect`
    alone, without this call, changes the *stored number* but not the
    actual matrix the GPU uses, leaving the camera still rendering with
    its old, stale shape.
  - *Depends on:* the camera's own current `fov`/`aspect`/`near`/`far`.
  - *Connects to:* called from a `window.resize` event handler in this
    lesson's own working checkpoint.
  - *Shape:* `PerspectiveCamera`'s own method — the explicit
    "recalculate now" step between changing a camera's raw numbers and
    those numbers actually taking effect.

---

## Concept Unit: The Frustum — Breaking `fov` and `aspect` on Purpose

### The Problem

Nothing built so far in this curriculum has ever changed `fov` or
`aspect` away from a value matching the real window shape, or
questioned what would happen if it didn't. This Concept Unit answers
that directly, by actually breaking it and watching what happens.

> **Before reading on, try this yourself:** if `aspect` is supposed to
> equal width ÷ height of the actual output image, and it's set to `1`
> (implying a perfectly square image) while the real canvas is, say,
> twice as wide as it is tall — what would you expect to happen to a
> perfectly square 3D object rendered through that mismatched camera?
> Would it still look square?

### Introduce the Concept in Isolation

```javascript
// Throwaway lab: field of view determines how much space is visible at a given distance
function visibleHalfHeight(fovDegrees, distance) {
    const fovRadians = fovDegrees * Math.PI / 180;
    return distance * Math.tan(fovRadians / 2);
}

console.log(visibleHalfHeight(45, 10));
console.log(visibleHalfHeight(90, 10));
console.log(visibleHalfHeight(45, 20));
```

Real output:

```
4.14213562373095
9.999999999999998
8.2842712474619
```

At the same distance (`10`), doubling the field of view from `45°` to
`90°` more than doubles how much vertical space is visible (`4.14` →
`10.0`) — a wider `fov` genuinely sees more, the everyday "zoom"
intuition, confirmed with real trigonometry (`tan`, applied to half the
field-of-view angle, scaled by distance). Doubling the *distance*
instead, at a fixed `45°` fov, exactly doubles the visible height
(`4.14` → `8.28`) — the frustum (this lesson's own term) really is a
pyramid shape, wider the farther out you measure.

### Discard the Throwaway Example

This `visibleHalfHeight` function is discarded now — the real project
checkpoints, next, break and then fix `aspect` directly, on a real
rendered shape.

### Project Change

- **Reference Source:** your own `mesh_viewer.html`, the line
  `new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.001, 100000)`
  — note it already computes `aspect` live from the real window
  dimensions, exactly the correct pattern this Concept Unit's "fixed"
  checkpoint reproduces.
- **Files affected:** create `src/step10_wrong_aspect.html` (broken on
  purpose) and `src/step11_correct_aspect.html` (fixed).
- **Change type:** add.
- **Location:** N/A — brand-new files.
- **Dependencies:** everything from Lessons 1-3.

### The New Code

Type this into `src/step10_wrong_aspect.html` — a perfectly square 3D
shape (`1×1`, in real coordinates), viewed through a camera with
`aspect` hard-coded to `1`, regardless of the real window's actual
shape:

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
  scene.background = new THREE.Color(0x16181c);

  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.set(0, 0, 3);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);
  const light = new THREE.DirectionalLight(0xffffff, 1.0);
  light.position.set(0, 0, 1);
  scene.add(light);

  const positions = [-1,-1,0,  1,-1,0,  1,1,0,  -1,1,0];
  const colors = [1,1,1, 1,1,1, 1,1,1, 1,1,1];
  const indices = [0, 1, 2, 0, 2, 3];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }
  animate();
</script>
</body>
</html>
```

Then type the fixed version into `src/step11_correct_aspect.html` —
identical, except `aspect` computed from the real window, and a resize
handler keeping it correct:

```html
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 3);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
```

(the rest of the file — lights, the same square geometry, the render
loop — identical to `step10_wrong_aspect.html`).

### The Updated Project

`src/step11_correct_aspect.html`'s changed lines relative to
`step10_wrong_aspect.html`, marked:

```
  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);  # ← changed (was: 1)
  camera.position.set(0, 0, 3);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  window.addEventListener('resize', () => {                                                          # ← new
    camera.aspect = window.innerWidth / window.innerHeight;                                          # ← new
    camera.updateProjectionMatrix();                                                                  # ← new
    renderer.setSize(window.innerWidth, window.innerHeight);                                          # ← new
  });                                                                                                  # ← new
```

### Mechanical Walkthrough

- **`new THREE.PerspectiveCamera(45, 1, 0.1, 1000)`** (broken version)
  — `aspect` hard-coded to `1`, meaning "assume the output is a perfect
  square," regardless of what the real browser window's actual shape
  is.
- **`new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)`**
  (fixed version) — `window.innerWidth`/`window.innerHeight` (ordinary
  browser globals, not Three.js-specific) — computing the *real* aspect
  ratio of the actual window at the moment the camera is constructed.
- **`window.addEventListener('resize', () => { ... })`** — ordinary
  DOM event handling (already familiar); inside it,
  `camera.aspect = window.innerWidth / window.innerHeight;` updates the
  stored number, and `camera.updateProjectionMatrix();` (this lesson's
  own term) is what actually makes that new number take effect — this
  is the concrete, real reason this method exists: without this call,
  `camera.aspect` would hold the *correct* new number after a resize,
  while the camera kept rendering with its old, stale projection matrix
  built from the previous aspect.

### CS Lens

This is **coordinate system mapping with a scale correction** — the
same underlying idea as ensuring a printed photograph isn't stretched
because the print size's own aspect ratio doesn't match the original
photo's aspect ratio; `aspect` is exactly the correction factor keeping
a 3D scene's own proportions intact once mapped onto a 2D output of a
specific shape.

Also recognized in: video playback (a 16:9 video played inside a 4:3
window either gets letterboxed or stretched — the same aspect-mismatch
problem, in a completely different medium); CSS `object-fit` (a direct,
everyday web-development tool for handling exactly this mismatch for
images); print design (matching a document's aspect ratio to the paper
size it'll actually be printed on, to avoid unwanted stretching or
cropping).

### SE Lens

The principle is **deriving configuration from live, authoritative
state, rather than a fixed assumption** — `aspect` computed fresh from
`window.innerWidth`/`.innerHeight`, and recomputed on every resize, will
always be correct; a hard-coded `1` is only ever correct by coincidence,
for exactly one specific window shape.

The alternative not chosen: never handle resizing at all — set
`aspect` once, correctly, at page load, and simply accept that
resizing the browser window afterward will introduce the same
stretching this Concept Unit's own broken checkpoint demonstrates,
until the page is reloaded. Some genuinely fixed-size embedded 3D
views (a small preview thumbnail that never changes size) can
reasonably skip resize handling — the real cost only appears the
moment the available space can actually change, which for a full-page
viewer like your own tool, it always can.

### Commands Needed

None new.

### Run It — Yourself, in Your Own Browser

Open `src/step10_wrong_aspect.html` first — a real `1×1` square in 3D
space, but the rendered result should look visibly stretched into a
rectangle (taller or wider than it should be, matching whatever your
actual browser window's own real proportions are, since `aspect` is
lying about them). Then open `src/step11_correct_aspect.html` — the
same square should now render as an actual, undistorted square,
regardless of your window's shape. Try resizing the browser window with
`step11` open — it should stay a correct square continuously, proving
the resize handler and `updateProjectionMatrix()` are both doing real
work.

### Connect

`fov` and `aspect` are no longer abstract constructor arguments — you've
watched, directly, what happens when `aspect` is wrong, and confirmed
what fixes it. The next Concept Unit turns to the actual arithmetic
making a 3D scene become a 2D image at all — the reason distant things
look smaller, which none of `fov`/`aspect`/`near`/`far` alone actually
explain.

---

## Concept Unit: Why Farther Things Look Smaller — the Perspective Divide

### The Problem

Every checkpoint so far has used flat, single-depth shapes — nothing
has actually shown *depth* doing anything. The real, concrete reason
distant objects shrink on screen has nothing to do with `fov` directly
— it's a separate, more fundamental piece of arithmetic this Concept
Unit isolates directly.

> **Before reading on, try this yourself:** imagine a real object of
> fixed height, viewed from directly in front, at some distance. If
> that same object were moved twice as far away (with nothing else
> changing), what fraction of its original on-screen height would you
> expect it to occupy — and what simple arithmetic operation, applied
> to the object's real height and its distance, would predict that
> exact fraction?

### Introduce the Concept in Isolation

```javascript
// Throwaway lab: why farther points end up smaller on screen -- dividing by depth
function project(x, y, z) {
    return { x: x / z, y: y / z };
}

console.log(project(0, 1, 2));
console.log(project(0, 1, 4));
console.log(project(0, 1, 8));
```

Real output:

```
{ x: 0, y: 0.5 }
{ x: 0, y: 0.25 }
{ x: 0, y: 0.125 }
```

The exact same real-world height (`y = 1`), at doubling distances
(`z = 2, 4, 8`), produces exactly halving projected heights
(`0.5, 0.25, 0.125`) — directly confirming this Concept Unit's own
Socratic prompt: dividing by distance is the actual operation, and
doubling the distance exactly halves the result, every time, because
division by a doubled number always halves the result. This is the
**perspective divide** (this lesson's own term) — a real `PerspectiveCamera`'s
own **projection matrix** (this lesson's own term) performs a more
complete version of this same divide-by-depth operation (also folding
in `fov`, `aspect`, and the `near`/`far` range) for every single vertex
of everything in the scene, every frame.

### Discard the Throwaway Example

This `project` function is discarded now — you won't call anything
like it directly; Three.js's own camera/renderer pipeline performs the
equivalent calculation internally, for every vertex, automatically.

### Project Change

- **Reference Source:** the perspective divide is a real, foundational
  piece of computer graphics — not something specific to Three.js or
  fetchable from your own `mesh_viewer.html` (which never performs this
  calculation directly; the camera and renderer do it internally).
  Stated here from established knowledge, the same honesty standard
  used throughout both of your curricula for well-established
  algorithms not specific to any one library.
- **Files affected:** create `src/step12_depth_scale.html`.
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** everything from Lessons 1-3 and this lesson's own
  first Concept Unit.

### The New Code

Type this into `src/step12_depth_scale.html` — three real,
identically-sized `1×1` squares, placed at three different depths, and
nothing else different between them:

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
  scene.background = new THREE.Color(0x16181c);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 0);

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  function makeSquare(z, color) {
    const positions = [-0.5,-0.5,z,  0.5,-0.5,z,  0.5,0.5,z,  -0.5,0.5,z];
    const colors = [];
    for (let i = 0; i < 4; i++) colors.push(...color);
    const indices = [0,1,2, 0,2,3];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 });
    return new THREE.Mesh(geometry, material);
  }

  scene.add(makeSquare(-4,  [1, 0.4, 0.4]));
  scene.add(makeSquare(-8,  [0.4, 1, 0.4]));
  scene.add(makeSquare(-16, [0.4, 0.4, 1]));

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
10    scene.background = new THREE.Color(0x16181c);
11
12    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
13    camera.position.set(0, 0, 0);
14
15    const renderer = new THREE.WebGLRenderer();
16    renderer.setSize(window.innerWidth, window.innerHeight);
17    document.body.appendChild(renderer.domElement);
18    window.addEventListener('resize', () => {
19      camera.aspect = window.innerWidth / window.innerHeight;
20      camera.updateProjectionMatrix();
21      renderer.setSize(window.innerWidth, window.innerHeight);
22    });
23
24    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
25    scene.add(ambient);
26
27    function makeSquare(z, color) {
28      const positions = [-0.5,-0.5,z,  0.5,-0.5,z,  0.5,0.5,z,  -0.5,0.5,z];
29      const colors = [];
30      for (let i = 0; i < 4; i++) colors.push(...color);
31      const indices = [0,1,2, 0,2,3];
32      const geometry = new THREE.BufferGeometry();
33      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
34      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
35      geometry.setIndex(indices);
36      geometry.computeVertexNormals();
37      const material = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 });
38      return new THREE.Mesh(geometry, material);
39    }
40
41    scene.add(makeSquare(-4,  [1, 0.4, 0.4]));
42    scene.add(makeSquare(-8,  [0.4, 1, 0.4]));
43    scene.add(makeSquare(-16, [0.4, 0.4, 1]));
44
45    function animate() {
46      requestAnimationFrame(animate);
47      renderer.render(scene, camera);
48    }
49    animate();
50 </script>
51 </body>
52 </html>
```

### Mechanical Walkthrough

- **`camera.position.set(0, 0, 0)`** — the camera sits exactly at the
  origin this time, looking down the negative-z axis (Three.js's own
  default camera facing direction, when no rotation has been applied) —
  chosen so each square's own `z` value directly *is* its distance from
  the camera, with no extra arithmetic needed to reason about it.
- **`function makeSquare(z, color) { ... }`** — an ordinary JavaScript
  function (not a Three.js concept itself) that builds one real,
  independent `Mesh` — the exact `BufferGeometry`/index-buffer/material
  pattern from Lessons 2-3, wrapped in a reusable function purely to
  avoid retyping it three times.
- **`colors.push(...color)`** — the spread operator (already-familiar
  JavaScript), expanding a 3-element `[r,g,b]` array into three
  separate arguments to `.push()` — building the parallel `colors`
  attribute array (Lesson 3) one vertex at a time.
- **`scene.add(makeSquare(-4, [1, 0.4, 0.4])); scene.add(makeSquare(-8, ...)); scene.add(makeSquare(-16, ...));`**
  — three real, independent meshes, identical in real size (`1×1`) and
  shape, differing *only* in their `z` position and color — the
  deliberately controlled experiment this Concept Unit's own Socratic
  prompt described in words, now actually built and renderable.

### CS Lens

This is the **perspective divide** (this lesson's own term, in full) —
one of the single most consequential pieces of arithmetic in all of
real-time 3D graphics: without it, a renderer would produce
**orthographic** projection instead (parallel projection, where size
doesn't change with distance at all — genuinely useful for CAD/technical
drawings, and something Three.js also supports via a completely
different camera class, `OrthographicCamera`, not covered in this
curriculum) rather than the depth-cue-rich images human vision and
photography are both built around.

Also recognized in: photography and cinematography (an object's size in
a photo is directly governed by this same divide-by-distance
relationship — it's *why* a "wide" lens close to a subject and a
"long" lens far from the same subject can frame an identical-looking
shot, a real technique called a dolly zoom when the two are combined
while filming); human binocular vision itself (part of how your own
visual system estimates distance relies on cues this same mathematical
relationship produces); architectural and technical drawing's own
explicit distinction between perspective drawings (this divide, used
deliberately) and orthographic/isometric drawings (no divide at all,
by design, specifically so measurements stay accurate regardless of
depth).

### SE Lens

The principle is **isolating the one operation that actually causes an
effect**, rather than treating "3D looks realistic" as one
undifferentiated black box. `fov` and `aspect` (this lesson's first
Concept Unit) shape *how much* is visible; the perspective divide is
what actually makes *size* depend on *distance* at all — two genuinely
separate concerns, easy to blur together if never actually pulled
apart and tested independently, the way this Concept Unit's own
`step12_depth_scale.html` deliberately isolates depth as the *only*
variable across three otherwise-identical squares.

The alternative not chosen: accept "things get smaller far away" as an
unexamined, assumed fact about 3D rendering, the same way you might
have used `PerspectiveCamera` correctly for months without ever
isolating *why* it behaves that way. That's a perfectly workable way to
use Three.js day to day — plenty of real projects never need this
explanation. The cost, specific to this curriculum's own stated goal:
understanding orbit-camera math (Lesson 5) and building free rotation
(Phase C) both require comfort with vectors, angles, and coordinate
transforms in a similarly hands-on way — this Concept Unit is practice
for exactly that kind of reasoning, on the simplest possible case, before
it gets applied to something you'll actually need to modify yourself.

### Commands Needed

None new.

### Run It — Yourself, in Your Own Browser

Open `src/step12_depth_scale.html`. You should see three squares —
red, green, blue — all genuinely `1×1` in real 3D space, rendered at
noticeably different on-screen sizes: the red one (closest, `z = -4`)
largest, green (`z = -8`) about half that, and blue (farthest,
`z = -16`) smallest of all — roughly matching this Concept Unit's own
throwaway lab's real halving pattern, though not exactly (the real
formula also folds in `fov` and the near/far range, not just a plain
`1/z` divide) — real, direct, visual confirmation that identical real
size does not mean identical apparent size, and that the difference is
driven by depth alone, with nothing else about these three shapes
different at all.

### Connect

You now understand every piece of `new THREE.PerspectiveCamera(fov,
aspect, near, far)` — not as four opaque constructor arguments, but as
a frustum shape (`fov`/`aspect`) and the actual reason depth changes
apparent size (the perspective divide, packaged into the camera's own
projection matrix). Phase C's own subject — how your existing tool's
orbit camera actually works, and where its real limitations come from —
builds directly on being comfortable with a camera as *both* a position
in space *and* a set of viewing parameters, exactly the two-part
understanding this lesson and Lesson 1 together have now established.

---

## Connect the Pieces

One camera, traced through both of this lesson's Concept Units: an
`aspect` value, deliberately set wrong in `step10_wrong_aspect.html`
(first Concept Unit), visibly stretches a real `1×1` square — fixed in
`step11_correct_aspect.html` by computing `aspect` from the real window
shape and calling `updateProjectionMatrix()` (this lesson's own term)
whenever it changes. Separately, `step12_depth_scale.html` (second
Concept Unit) holds `aspect` correct throughout, and instead varies only
`z` across three otherwise-identical squares — isolating the
**perspective divide** (this lesson's own term) as a completely
separate effect from `aspect`/`fov`, proven first with real executed
math (doubling distance exactly halves projected size) and then
observed directly, for real, in your own browser, on three real,
independently-built meshes.

---

## Try It Yourself

Type all three new HTML files into `src/` yourself (not copy-pasted),
and confirm every `Run It` checkpoint above. Then, once
`step12_depth_scale.html` is working, try adding a fourth square even
farther away (`z = -32`) and predict, using this lesson's own
perspective-divide lab's real halving pattern, roughly how much smaller
than the blue square it should appear — then check whether what you
actually see roughly matches your own prediction.
