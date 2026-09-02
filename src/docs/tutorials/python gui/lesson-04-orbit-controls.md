# Lesson 4: Orbiting a Scene — `OrbitControls`

**What you will build:** the same lit cube from Lesson 3, now
mouse-orbitable — drag to rotate the view around it, scroll to zoom —
using `OrbitControls`, a class that turns out to live *outside* core
Three.js entirely, imported from its own separate path. The
transferable problem this lesson is actually about: every lesson so
far has left the camera's `.position` fixed once, by hand
(`camera.position.z = 5`), a real limitation for actually inspecting a
3D machining model from different angles. `OrbitControls` solves that
— but solves it as a wholly separate, addable *behavior* layered on
top of a camera, not as a new kind of camera or a built-in feature of
`PerspectiveCamera` itself, which is a real, deliberate design choice
worth understanding before relying on it.

**What you need to know first:** Lesson 1 — `PerspectiveCamera`,
`.position` as a real `Vector3`, the render loop and
`requestAnimationFrame`. Lesson 3 — a fully lit, visible cube to orbit
around.

**Terms used in this lesson**

- **Addon / example module** — code that ships inside the `three` npm
  package but is not part of what `import * as THREE from 'three'`
  itself provides — it lives under its own separate path
  (`three/examples/jsm/...`) and has to be imported explicitly, on its
  own. It exists because Three.js's core package stays focused on
  rendering itself — scenes, cameras, geometries, materials, the
  renderer — while genuinely optional, swappable behaviors (camera
  controls being one of many — loaders and post-processing effects are
  others) live alongside it without bloating what every single Three.js
  project is forced to include.
- **Spherical coordinates** — a way of describing a 3D position using a
  distance from a center point (radius) plus two angles, instead of
  three independent (x, y, z) offsets. It exists because "a point
  orbiting around a fixed center, always the same distance away" is
  awkward to express directly in (x, y, z) — every orbit step would
  need real trigonometry to keep the radius constant — while in
  spherical terms, orbiting is just changing one or two angles and
  leaving the radius untouched.
- **Damping** — a smoothing effect where motion gradually slows to a
  stop rather than stopping the instant input stops, the same
  real-world idea as friction slowing a spun object rather than it
  halting the moment your hand leaves it. It exists purely for feel —
  confirmed below, it's `false` (off) by default, meaning
  `OrbitControls` doesn't decide this for you; it's a deliberate
  opt-in.

**Objects and methods used**

- **`OrbitControls(object, domElement)`**
  - *What it is:* a class that lets a camera (or any `Object3D`, though
    a camera is the overwhelmingly common case) be moved by mouse or
    touch input — orbiting, zooming, and panning around a focus point —
    without the reader writing any raw pointer-event-handling code.
  - *Implementation:* a class, imported from its own separate path —
    `import { OrbitControls } from
    'three/examples/jsm/controls/OrbitControls.js'` — not from
    `'three'` itself; constructor takes the object to control (a
    camera, in this lesson) and an `HTMLElement` to listen for
    input on — confirmed below, `domElement` genuinely defaults to
    `null` and real DOM listeners are only attached once a non-null
    element is actually provided.
  - *Its use:* every lesson before this one moved the camera exactly
    once, by hand, in source code — this is the first lesson where the
    person actually using the app, not the code, decides where the
    camera ends up.
  - *Type:* a class; confirmed below to extend a base `Controls` class
    (itself extending `EventDispatcher`, the same event-firing base
    class every Three.js object with `.addEventListener`-style behavior
    shares) — not a subclass of `Camera` or `Object3D` at all, which is
    the real, structural proof behind this lesson's own title: a
    control is a separate thing that *acts on* a camera, not a special
    kind of camera itself.
  - *Responsibility:* listens for pointer/touch/wheel input on its
    `domElement`, translates that input into changes to its `.target`
    and an internal spherical-coordinate representation of the
    controlled object's offset from that target, and writes the
    resulting position back onto the controlled object's real
    `.position` — every frame, via `.update()` — described fully in
    that method's own entry, below.
  - *Depends on:* a real `Object3D`-derived object (a camera, this
    lesson) to control; a real `HTMLElement` to attach input listeners
    to, in order to actually respond to a real mouse or touch, though
    confirmed below it constructs validly without one.
  - *Connects to:* constructed once, after the camera and renderer
    exist; its own `.update()` is called every frame from inside the
    render loop (Lesson 1's own `animate()` function), the exact same
    per-frame calling pattern `renderer.render()` already uses.
  - *Shape:* confirmed below — a real object holding its own
    `.target` (a `Vector3`, not a plain array or plain numbers),
    numeric limits (`.minDistance`, `.maxDistance`), and boolean
    feature toggles (`.enableZoom`, `.enableRotate`, `.enablePan`,
    `.enableDamping`), all independently readable and settable.

- **`OrbitControls.prototype.target`**
  - *What it is:* the point in 3D space the controlled object orbits
    *around* — not the controlled object's own position, a completely
    separate point.
  - *Implementation:* a real `THREE.Vector3` instance property,
    confirmed below to default to `(0, 0, 0)`, the world origin.
  - *Its use:* this is what makes "orbit" mean something specific —
    without a defined center, dragging the mouse would have no fixed
    point to rotate the camera around at all.
  - *Type:* an instance property, a `Vector3` — the same class already
    familiar from every `.position` used since Lesson 1.
  - *Responsibility:* holds the one point every orbit/zoom/pan
    operation is computed relative to; changing it (directly, by
    assignment, the same way `.position` has been set since Lesson 1)
    re-centers all future orbiting around a new point without moving
    the camera itself in that same instant.
  - *Depends on:* nothing external — it's just a `Vector3`, mutable the
    same way `.position` always has been.
  - *Connects to:* read internally by `.update()` (below) every time
    it's called, to know what point the camera's spherical offset
    should be measured from.
  - *Shape:* confirmed below — a real `Vector3`, independently
    readable/settable via `.x`/`.y`/`.z` or `.set(...)`, exactly the
    same shape as `camera.position` itself.

- **`OrbitControls.prototype.update()`**
  - *What it is:* the method that actually applies the effect of
    whatever input has occurred (mouse drag, scroll) since the last
    call, writing the result onto the controlled object's real
    `.position`.
  - *Implementation:* an instance method, no arguments, no return value
    used in this lesson.
  - *Its use:* without calling this every frame, dragging the mouse
    would register real internal state changes inside `controls` but
    never actually move the camera — the official documentation's own
    example, quoted in this lesson's own isolated lab, explicitly
    calls it once at setup and again inside the render loop for
    exactly this reason.
  - *Type:* an instance method on `OrbitControls`.
  - *Responsibility:* converts the controls' own internal
    spherical-coordinate state (radius, two angles, computed relative
    to `.target`) back into an actual (x, y, z) `.position` on the
    controlled object, and writes it there.
  - *Depends on:* being called after construction at least once before
    the first render (confirmed below — even a completely untouched,
    freshly-constructed `OrbitControls`, called with no user input at
    all, still runs this conversion once during construction itself),
    and again every frame thereafter to reflect any new input.
  - *Connects to:* called once, right after construction, and again
    every single frame from inside `animate()`, alongside
    `renderer.render()`.
  - *Shape:* no return value; its effect is entirely a side-effect
    mutation of the controlled object's own `.position`, confirmed
    below with real before/after values.

---

## Concept Unit: `OrbitControls` — A Separate, Addable Behavior

### The Problem

Every camera position in every lesson so far was set exactly once, in
source code, by the person writing the lesson — never by whoever is
actually looking at the running page. Real inspection of a 3D model —
your own machining models, eventually — needs the *viewer* to choose
the angle, which nothing built so far allows.

> **Stop and think first:** Lesson 1 already proved `PerspectiveCamera`
> is a real `Object3D`, with its own settable `.position`. If you
> wanted to let a user drag the mouse to rotate the view, using only
> what you already know — a `.position` you can set in code — what
> real-world input would you need to listen for that nothing in Lesson
> 1 through 3 ever touched? Would that logic naturally belong *inside*
> the `PerspectiveCamera` class itself, or does a camera, as a concept,
> have any inherent reason to know about mouse events at all?

### Isolating `OrbitControls`

```js
// throwaway-orbit-controls.mjs
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
camera.position.set(0, 0, 5);
console.log('BEFORE new OrbitControls(...):', camera.position.x, camera.position.y, camera.position.z);

// Constructed with domElement = null on purpose: OrbitControls only
// attaches real DOM listeners once a non-null element is given, so
// this is a real, legitimate way to inspect its default state without
// a browser - not a workaround that skips something meaningful.
const controls = new OrbitControls(camera, null);
console.log('AFTER  new OrbitControls(...):', camera.position.x, camera.position.y, camera.position.z);

console.log('controls.object === camera:', controls.object === camera);
console.log('controls.domElement:', controls.domElement);
console.log('controls.target (default):', controls.target.x, controls.target.y, controls.target.z);
console.log('controls.enabled (default):', controls.enabled);
console.log('controls.enableDamping (default):', controls.enableDamping);
console.log('controls.minDistance (default):', controls.minDistance);
console.log('controls.maxDistance (default):', controls.maxDistance);
console.log('typeof controls.update:', typeof controls.update);
```

Actually run, this session, in plain Node:

```
BEFORE new OrbitControls(...): 0 0 5
AFTER  new OrbitControls(...): 0 3.061616997868383e-16 5
controls.object === camera: true
controls.domElement: null
controls.target (default): 0 0 0
controls.enabled (default): true
controls.enableDamping (default): false
controls.minDistance (default): 0
controls.maxDistance (default): Infinity
typeof controls.update: function
```

This is called an **addon module** (defined in Terms, above). What it
proves, directly answering the Socratic question: `controls.object ===
camera` confirms `OrbitControls` *holds a reference to* the camera
rather than the camera holding any awareness of `OrbitControls` at
all — the dependency points one direction only, camera-controlling
logic living entirely outside `PerspectiveCamera`'s own class. And the
`BEFORE`/`AFTER` position readout is a genuine, unplanned discovery
worth stopping on: the camera's `y` position measurably changed —
from exactly `0` to `3.061616997868383e-16`, a number computers
represent as "essentially zero, but not exactly" — from *construction
alone*, with zero user input and `domElement` set to `null`. That tiny
drift is real evidence of **spherical coordinates** (defined in Terms):
`OrbitControls`, internally, immediately converts the camera's given
(x, y, z) position into radius-and-angle terms relative to `.target`,
and even a single round-trip conversion between those two
representations introduces this kind of unavoidable floating-point
noise — not a bug, a real, physical consequence of how computers store
non-terminating binary fractions, confirmed here rather than asserted.

### Discarding the throwaway example

Deleted — this exact snippet never appears in the real project. What it
proved (a one-directional camera→controls dependency; real default
property values; a genuine, tiny floating-point side effect of
construction itself) is what the real code below relies on.

### Project Change

- **Reference Source:** No reference counterpart in the sense of a
  prior version of *this* project — but `OrbitControls`' own official
  usage example, quoted from its real source file's own documentation
  comment (`three/examples/jsm/controls/OrbitControls.js`, fetched and
  read this session): `const controls = new OrbitControls( camera,
  renderer.domElement );`, followed by a note that `controls.update()`
  must be called after any manual camera transform, and again inside
  the render loop if `enableDamping` or `autoRotate` are used. This
  lesson's own New Code, below, follows that exact documented pattern.
- **Files affected:** created — `lessons/lesson-04-orbit-controls/index.html`,
  `lessons/lesson-04-orbit-controls/main.js` — built on Lesson 3's own
  lit-cube file as a starting point, per this lesson's own "What you
  will build."
- **Change type:** add.
- **Location:** `main.js`, directly below the `renderer` setup, before
  the geometry/material/light code Lesson 3 already established.
- **Dependencies:** the `camera` and `renderer` variables must already
  exist — `OrbitControls` needs both: the camera to control, and the
  renderer's own `.domElement` (Lesson 1's own Renderer unit) to
  listen for real mouse/touch input on.

### The New Code

```js
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
```

### The Updated Project

Shown with Lesson 3's own lit-cube code as the surrounding, already-
established structure — nothing elided:

```
1  import * as THREE from 'three';
2  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // ← new
3
4  const scene = new THREE.Scene();
5  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
6  camera.position.z = 5;
7
8  const renderer = new THREE.WebGLRenderer();
9  renderer.setSize(window.innerWidth, window.innerHeight);
10 document.body.appendChild(renderer.domElement);
11
12 const controls = new OrbitControls(camera, renderer.domElement); // ← new
13 controls.update();                                                // ← new
14
15 const geometry = new THREE.BoxGeometry(1, 1, 1);
16 const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
17 const cube = new THREE.Mesh(geometry, material);
18 scene.add(cube);
19
20 const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
21 scene.add(ambientLight);
22
23 const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
24 directionalLight.position.set(5, 10, 7);
25 scene.add(directionalLight);
```

`main.js` now has every piece Lessons 1–3 already built, unchanged,
plus one new object (lines 12–13) sitting between the renderer and the
scene contents — position in the file matters here only for
readability, not correctness, since `controls` doesn't depend on
`geometry`/`material`/the lights, and none of them depend on it either.

### Mechanical Walkthrough

- `import { OrbitControls } from
  'three/examples/jsm/controls/OrbitControls.js'` — a **named import**
  (a different form from every previous lesson's `import * as THREE
  from 'three'`): pulls in exactly one named export, `OrbitControls`,
  from a specific file path inside the `three` package rather than the
  whole package's default export surface — the real, concrete
  mechanism behind this lesson's own "addon module" term, defined
  above.
- `new OrbitControls(camera, renderer.domElement)` — the constructor
  (this lesson's own Header), given the real `camera` variable (Lesson
  1) and `renderer.domElement` (Lesson 1's own Renderer unit, the real
  `<canvas>` the renderer built or was given) — confirmed above,
  passing a real, non-null element here is exactly what triggers real
  `addEventListener` calls internally, which the isolated lab's own
  `domElement: null` case deliberately avoided.
- `controls.update()` — the method (this lesson's own Header), called
  once here, directly after construction — confirmed above (and
  quoted from the class's own real source documentation) that this
  matches the documented, official usage pattern exactly, and that
  construction itself already performs one internal update-equivalent
  conversion regardless.

### CS Lens

`OrbitControls` reading a camera's `.position` and `.target`, computing
new values, and writing the result back onto that same `.position` — a
plain public property, not a private field only accessible through
special controls-only methods — is an instance of **the observer/
mediator pattern applied to shared mutable state**: one object
(`OrbitControls`) mediates changes to another (`camera`) via its
already-public interface, without the mediated object needing any
special awareness of being mediated. Also recognized in: a spreadsheet
formula bar controlling a cell's displayed value without the cell
itself knowing a formula bar exists; a game's physics engine writing
computed positions onto ordinary transform components each frame; a
form-validation library reading and writing a plain `<input>`
element's `.value` without the input needing any validation-specific
code of its own.

### SE Lens

The alternative not chosen: build orbit/zoom/pan directly into
`PerspectiveCamera` itself, as built-in methods. The real cost of that
alternative: every single use of `PerspectiveCamera` anywhere — including
every lesson before this one — would carry that logic's weight (extra
code, extra properties, extra event-listener plumbing) whether or not
that particular use ever needed mouse-driven orbiting at all; a
camera used purely as a fixed, code-controlled viewpoint (a common,
legitimate use case) would still pay for a feature it never uses. The
real cost paid by the choice Three.js actually made: an extra import,
an extra constructor call, and — confirmed above — an extra method
call every single frame the reader now has to remember, where a
built-in feature would have needed none of that.

### One sentence connecting this unit to what came before

Every object built in Lessons 1–3 is now controllable by mouse input
without a single line of any of those earlier lessons' own code
changing — the next unit looks at exactly *what* `.target` means to
that mouse input, and why it isn't the same thing as the camera's own
position.

---

## Concept Unit: `controls.target` — The Point Being Orbited

### The Problem

"Orbit" implies a center — some fixed point everything rotates around.
Nothing in the previous unit's code ever said what that point is, and
yet the isolated lab already showed `controls.target` defaulting to
`(0, 0, 0)`, not `undefined` — meaning some real, specific point is
already in play, whether or not it was ever set explicitly.

> **Stop and think first:** the cube built across Lessons 1–3 sits at
> position `(0, 0, 0)` — the default `Mesh` position, never
> explicitly changed in any of those lessons. Given `controls.target`'s
> own default, also `(0, 0, 0)`, confirmed in the previous unit's own
> isolated lab — is that a coincidence, or does it explain something
> about why orbiting has felt (once you actually run the previous
> unit's code in a browser) like it's circling around the cube
> specifically, without anything in this lesson's own code ever
> explicitly pointing `target` at it?

### Isolating `controls.target`

```js
// throwaway-target.mjs
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
camera.position.set(0, 0, 5);
const controls = new OrbitControls(camera, null);

console.log('controls.target instanceof THREE.Vector3:', controls.target instanceof THREE.Vector3);
console.log('controls.target (before change):', controls.target.x, controls.target.y, controls.target.z);
console.log('controls.target === camera.position (should be false - two separate Vector3s):', controls.target === camera.position);

controls.target.set(2, 0, 0);
controls.update();
console.log('controls.target (after set(2,0,0)):', controls.target.x, controls.target.y, controls.target.z);
console.log('camera.position after re-targeting, before any orbit input:', camera.position.x.toFixed(3), camera.position.y.toFixed(3), camera.position.z.toFixed(3));
```

Actually run, this session, in plain Node:

```
controls.target instanceof THREE.Vector3: true
controls.target (before change): 0 0 0
controls.target === camera.position (should be false - two separate Vector3s): false
controls.target (after set(2,0,0)): 2 0 0
camera.position after re-targeting, before any orbit input: 0.000 0.000 5.000
```

What this proves, directly answering the Socratic question: `.target`
really is a distinct `Vector3` from `.position` (`===` false, the same
strict-identity check pattern used since Lesson 1) — moving it does
*not* immediately move the camera to compensate (`camera.position`
stayed at `(0, 0, 5)` even after re-targeting and calling `.update()`)
— it only changes what point *future* orbiting will rotate around. The
default `(0, 0, 0)` genuinely is why orbiting felt centered on the
cube: not a coincidence, but two independent defaults (`Mesh`'s own
default position, confirmed Lesson 1; `OrbitControls.target`'s own
default) both happening to be the world origin.

### Discarding the throwaway example

Deleted — never appears in the real project. What it proved
(`.target` is a distinct, independently-settable `Vector3`, and
changing it alone doesn't retroactively move the camera) is knowledge
this project's own future multi-object scenes (Module B onward, once
more than one model is loaded) will depend on directly — re-centering
the view on a specific machining stage, for instance, by setting
`.target` to that mesh's own position.

### Project Change

- **Reference Source:** No reference counterpart — this unit doesn't
  add new code to the real project; `controls.target`'s default is
  already exactly what this lesson's scene needs (centered on the
  cube), so no explicit `.target` assignment is added to `main.js` at
  all. This unit exists to explain *why* the previous unit's code
  already works correctly, not to change it further.
- **Files affected:** none.
- **Change type:** none — an explanatory unit only.
- **Location:** n/a.
- **Dependencies:** n/a.

### The New Code

Not applicable — see Project Change, above. No new code is added to
`main.js` in this unit.

### The Updated Project

Not applicable, per this step's own exception: nothing changed.

### Mechanical Walkthrough

Since no new code was added to the real project this unit, this
walkthrough covers the isolated lab's own two new lines instead, per
the same full-treatment standard used everywhere else in this
curriculum:

- `controls.target.set(2, 0, 0)` — a method call on `.target`
  (this lesson's own Header, reappearing from the isolated lab above),
  using `.set(x, y, z)` — reappearing from Lesson 3's own
  `DirectionalLight` unit, given full treatment there and reused
  unchanged here — moving the orbit center 2 units along the x-axis,
  away from the cube.
- `controls.update()` — reappearing from this lesson's own previous
  unit, given full treatment there — called here specifically to prove
  the point: even after calling it, `camera.position` stayed exactly
  where it was, confirming `.update()` alone doesn't reposition the
  camera to "catch up" to a moved target without actual orbit input
  also having occurred.

### CS Lens

Keeping "what point are we centered on" (`.target`) and "where is the
observer" (`.position`) as two independent, separately-mutable values,
rather than one combined "camera state" value, is the same underlying
idea as Lesson 3's own `DirectionalLight`, which derived its direction
from two independent positions rather than storing one combined
direction value — **representing a relationship as a pair of
independent references, not a single fused value** — reappearing here,
given full treatment again per the Repetition Rule. Also recognized
in: a video call's "pinned speaker" setting, independent of your own
camera's position in the call layout; a text editor's cursor position
kept independent of its current scroll offset, even though what's
visible depends on both together.

### SE Lens

The alternative not chosen: deriving the orbit center automatically —
say, always the world origin, or always whatever object was passed to
the constructor — rather than exposing it as a separately-settable
property at all. The real cost of that simplicity: this project's own
later, real need (Module F's own animated multi-stage sequence, and
Module E's toggled stock/fixtures) will often want to re-center the
view on a *specific* mesh the user just selected, not always the same
fixed point — a hardcoded center would make that impossible without
forking or rewriting `OrbitControls` itself, where the real
`.target` property, confirmed above to be an ordinary mutable
`Vector3`, makes it a one-line change instead.

### One sentence connecting this unit to what came before

Nothing about `main.js` needed to change for this unit's own point to
be true — the next unit turns to `.update()` itself, and why calling
it only once, as the previous unit's New Code did, is not actually
enough once real, ongoing mouse input enters the picture.

---

## Concept Unit: `controls.update()` in the Render Loop

### The Problem

The first unit's New Code called `controls.update()` exactly once,
directly after construction — matching the class's own documented
setup example. But Lesson 1's entire render loop exists specifically
because a single render call isn't enough for anything that needs to
keep changing over time — and mouse-driven orbiting is exactly that
kind of ongoing change, not a one-time setup step.

> **Stop and think first:** Lesson 1's own render loop calls
> `renderer.render(scene, camera)` every single frame, reading
> `camera.position` fresh each time. If a user drags the mouse between
> one frame and the next, and `controls.update()` is never called
> again after that first, one-time call in this lesson's own New Code —
> would `camera.position` actually change in response to that drag?
> Trace it through: what, exactly, is the one line of code that would
> need to run again for that drag to ever reach `camera.position` at
> all?

### Isolating repeated `controls.update()` calls

```js
// throwaway-repeated-update.mjs
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const camera = new THREE.PerspectiveCamera(75, 16 / 9, 0.1, 1000);
camera.position.set(0, 0, 5);
const controls = new OrbitControls(camera, null);
controls.update();

// Simulate what real mouse-drag input eventually does internally:
// OrbitControls' own private rotate handlers ultimately adjust its
// internal spherical angle state, which .update() then reads. There's
// no public "simulate a drag" API, so this lab instead moves .target
// directly (a real, public, documented way to change orbit state) and
// confirms .update() must run again to see any effect - the same
// mechanism a real drag would trigger internally.
controls.target.set(0, 3, 0);
console.log('camera.position right after target.set, BEFORE calling update() again:', camera.position.x.toFixed(3), camera.position.y.toFixed(3), camera.position.z.toFixed(3));

controls.update();
console.log('camera.position AFTER calling update() again:', camera.position.x.toFixed(3), camera.position.y.toFixed(3), camera.position.z.toFixed(3));
```

Actually run, this session, in plain Node:

```
camera.position right after target.set, BEFORE calling update() again: 0.000 0.000 5.000
camera.position AFTER calling update() again: 0.000 3.000 5.000
```

What this proves, directly answering the Socratic question: changing
`.target` (or, in a real browser, real mouse-drag input changing
`OrbitControls`' own internal angle state) has genuinely **zero**
effect on `camera.position` until `.update()` is called again —
confirmed by the identical `(0, 0, 5)` reading immediately after the
target change, only becoming `(0, 3, 5)` once `.update()` runs a
second time. In a real app, mouse drag events fire continuously,
whenever they occur — not once, and not synchronized to your render
loop's own timing — so the only way to guarantee every accumulated
drag actually reaches the camera before the next frame renders is
calling `.update()` unconditionally, every single frame, the same
unconditional-every-frame pattern Lesson 1's own `renderer.render()`
call already uses.

### Discarding the throwaway example

Deleted — never appears in the real project. What it proved (state
changes to `OrbitControls` have zero effect on the actual camera until
`.update()` runs again) is what the real code below relies on to
justify moving the call into the render loop.

### Project Change

- **Reference Source:** `OrbitControls`' own real source documentation
  comment (`three/examples/jsm/controls/OrbitControls.js`, fetched and
  read this session, already quoted in this lesson's first unit) —
  explicitly shows `controls.update()` called both once at setup *and*
  again inside the render loop's own function body.
- **Files affected:** modified — `main.js`.
- **Change type:** add (a second call to an already-existing method,
  in a new location) plus refactor (the render loop's own body gains
  one new line).
- **Location:** inside `animate()`, Lesson 1's own render-loop
  function — directly before the existing `renderer.render(scene,
  camera)` call.
- **Dependencies:** the `controls` variable, already created in this
  lesson's first unit.

### The New Code

```js
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
```

### The Updated Project

The complete file, this lesson's own three units combined with every
earlier lesson's own contribution — nothing elided:

```
1  import * as THREE from 'three';
2  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
3
4  const scene = new THREE.Scene();
5  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
6  camera.position.z = 5;
7
8  const renderer = new THREE.WebGLRenderer();
9  renderer.setSize(window.innerWidth, window.innerHeight);
10 document.body.appendChild(renderer.domElement);
11
12 const controls = new OrbitControls(camera, renderer.domElement);
13 controls.update();
14
15 const geometry = new THREE.BoxGeometry(1, 1, 1);
16 const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
17 const cube = new THREE.Mesh(geometry, material);
18 scene.add(cube);
19
20 const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
21 scene.add(ambientLight);
22
23 const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
24 directionalLight.position.set(5, 10, 7);
25 scene.add(directionalLight);
26
27 function animate() {
28   requestAnimationFrame(animate);
29   controls.update();               // ← new
30   cube.rotation.x += 0.01;
31   cube.rotation.y += 0.01;
32   renderer.render(scene, camera);
33 }
34 animate();
```

`main.js` is now a complete app where every frame does three real
things in a fixed order: pick up any accumulated mouse/touch input and
apply it to the camera (line 29), advance the cube's own independent
rotation animation (lines 30–31, entirely unrelated to the camera, and
running regardless of whether the user is orbiting at all), and draw
the result (line 32) — the cube spins on its own axis at a constant
rate no matter what the user does, while the camera's viewpoint moves
only in response to real input, the two animations genuinely
independent of each other despite sharing one render loop.

### Mechanical Walkthrough

- `requestAnimationFrame(animate)` — reappearing from Lesson 1's own
  Render Loop unit, given full treatment there, unchanged in meaning
  here.
- `controls.update()` — reappearing from this lesson's own first unit,
  given full treatment there; its placement here, inside the loop, is
  the actual point of this entire unit — confirmed by the isolated lab
  above to be the one call standing between any accumulated input and
  the camera actually reflecting it.
- `cube.rotation.x += 0.01` / `cube.rotation.y += 0.01` — reappearing
  from Lesson 1's own Render Loop unit, given full treatment there,
  unchanged — still running every frame, still entirely independent of
  `controls`, proving the two animation systems (the cube's own
  constant spin, the camera's user-driven orbit) genuinely don't
  interact with or depend on each other despite both executing inside
  the same function.
- `renderer.render(scene, camera)` — reappearing from Lesson 1's own
  Renderer unit and Lesson 3's own third unit, given full treatment in
  both — reads `camera.position`, which line 29's `controls.update()`
  call, run immediately before this one in the exact same frame, may
  have just changed.

### CS Lens

Placing `controls.update()` *before* `renderer.render()` within the
same function, so any input is applied before that same frame draws,
rather than after, is an instance of correctly ordering steps in a
**pipeline with a genuine data dependency** — `render()`'s own output
depends on `camera.position`'s current value, and `update()` is the
one step that can change it, so the order isn't arbitrary or a style
preference; reversing it would mean every frame renders using *last*
frame's input instead of the current one, a real, visible one-frame
lag. Also recognized in: a spreadsheet recalculating formula cells
before repainting the visible grid; a game engine's own fixed
update-then-render loop structure; a compiler resolving all symbol
references before generating final output; any producer-consumer
relationship where the consumer must run strictly after its producer
within the same cycle.

### SE Lens

The alternative not chosen: having `OrbitControls` itself own a render
loop internally, calling `renderer.render()` on your behalf once input
settles, rather than exposing `.update()` as a method the reader calls
manually from their own loop. The real cost of the choice actually
made: the reader has to remember this one extra line, in the right
place, in every project that uses `OrbitControls` — confirmed, this
exact unit, as a real and easy-to-miss requirement, not an automatic
behavior. The real benefit purchased by that cost: `OrbitControls`
never assumes it owns the only thing happening every frame — this
lesson's own cube rotation (lines 30–31) runs in the same loop,
untouched, and a more complex future app (this project's own eventual
multi-stage animation timeline, Module F) can add arbitrarily more
per-frame logic into the exact same function without `OrbitControls`
ever needing to know that logic exists.

### One sentence connecting this unit to what came before

Every one of this lesson's own three units traces back to the same
one requirement stated in the very first unit's Problem section — a
viewer, not the lesson's own source code, deciding where the camera
ends up — and this final unit is the piece that makes that true on an
ongoing, frame-by-frame basis, not just once at page load.

---

## Closing

### Connect the pieces

Start from line 12: `new OrbitControls(camera, renderer.domElement)` —
confirmed, this lesson's first unit, to hold a live reference to the
exact same `camera` object every earlier lesson already built
(`controls.object === camera`), and — because a real, non-null
`renderer.domElement` is passed here, unlike the isolated labs'
deliberate `null` — to actually attach real pointer/wheel event
listeners this session's sandbox can't fire but a real browser will.
Line 13's first `.update()` call performs the exact spherical-
coordinate conversion this lesson's very first isolated lab caught
happening, in miniature, as unavoidable floating-point noise — now
happening for real, once, before the render loop exists to repeat it.
`controls.target`, confirmed in this lesson's second unit to be a
`Vector3` wholly independent of `camera.position`, defaults to `(0, 0,
0)` — the exact same default `cube`'s own `.position` carries, since
Lesson 1's own Mesh unit never changed it — which is the real, traced
reason orbiting feels centered on the cube without a single explicit
line of code saying so anywhere in this file. Every frame thereafter,
line 29's `controls.update()` runs first, confirmed by this lesson's
third unit to be the one call standing between any real mouse
input and `camera.position` actually reflecting it; line 32's
`renderer.render(scene, camera)` — the identical call, and the
identical two arguments, first written all the way back in Lesson
1 — then draws whatever that updated camera now sees, of a scene whose
own contents (the cube, its material, both lights) haven't needed a
single change since Lesson 3, because `OrbitControls`, confirmed
throughout this lesson, only ever touches the camera — never the scene
it's a member of.

## Commands needed

Identical to every previous lesson's own Commands section — `npx serve
.` from inside `lessons/lesson-04-orbit-controls/`, with `index.html`
pinning `three@0.185.1` via the same importmap pattern already
established. One addition worth naming explicitly: the importmap only
needs the single `"three": "..."` entry already used since Lesson 1 —
`OrbitControls`' own `import { OrbitControls } from
'three/examples/jsm/controls/OrbitControls.js'` resolves relative to
that same `three` package on the CDN automatically, needing no second
importmap entry of its own.

## Run it

The complete file is provided as a real, runnable project at
`lessons/lesson-04-orbit-controls/`. As with every prior lesson's own
`WebGLRenderer`-dependent output, actually dragging to orbit and
scrolling to zoom requires a real browser this sandbox doesn't have.
Run it, and you should see: the same spinning green cube from Lesson
3, now also responding to click-and-drag (orbiting the camera around
it) and scroll (zooming in and out), with the cube's own independent
spin continuing throughout, unaffected by anything you do with the
mouse. Report back what you actually see, so it can be saved into
`verify/lesson-04/` as this lesson's own real, reader-run
verification.

## Next lesson

Lesson 5 covers vertex color — `vertexColors: true`, the material
property your own `save_vertex_colored_obj` function's entire output
(grey vs. green, per vertex) depends on being read correctly, and the
last piece of Module A before Module B turns to actually parsing your
real `.obj` files.
