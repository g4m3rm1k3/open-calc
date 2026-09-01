# Lesson 3: Light, and Why Some Materials Don't Need It

**What you will build:** a scene where the exact same geometry, paired
with `MeshStandardMaterial` instead of Lessons 1–2's `MeshBasicMaterial`
or `MeshNormalMaterial`, renders as solid black — and then two lights,
added one at a time, that bring it back to visible, correctly-shaded
green. The transferable problem this lesson is actually about: your
real machining models need their grey/green vertex colors (the exact
output of `save_vertex_colored_obj`) to read correctly under realistic
shading, not flat and unlit the way Lessons 1–2's materials rendered
everything — and getting there means understanding, concretely, which
materials need a light source to show anything at all, and which
never do.

**What you need to know first:** Lesson 1 — `Scene`, `Mesh`,
`MeshNormalMaterial`, `scene.add()`. Lesson 2 — `MeshBasicMaterial`,
and the proof that geometry and material are independent, shareable
objects.

**Terms used in this lesson**

- **Unlit material** — a material whose rendered color comes entirely
  from its own properties (a flat `color`, or — `MeshNormalMaterial`'s
  own case, Lesson 1 — the geometry's normal direction) and never
  consults any light in the scene. It exists as a category because it's
  cheap to compute (no lighting math per pixel) and predictable
  (always the same color regardless of scene setup) — useful for
  debugging geometry itself, which is exactly why Lessons 1–2 used
  `MeshNormalMaterial` and `MeshBasicMaterial` rather than a lit
  material from the start.
- **Lit material** — a material whose rendered color is computed from
  both its own properties *and* every light currently in the scene —
  with zero lights present, a lit material's own lighting equation has
  nothing to work with and produces black, confirmed below, not a
  bug but the direct, correct consequence of what the calculation
  actually is.
- **Light intensity** — a single number scaling how strong a light's
  contribution is — doubling it roughly doubles how bright a lit
  surface appears from that light, the same real-world idea as a lamp's
  wattage, though the two aren't numerically the same unit.
- **Ambient vs. directional light** — two different *models* of where
  light comes from: ambient light has no source or direction at all —
  every surface gets the same uniform contribution regardless of which
  way it faces — while directional light travels in one specific
  direction from effectively infinitely far away (the real-world
  approximation this models is sunlight — genuinely parallel rays by
  the time they reach any one object on Earth's surface, unlike a
  nearby lamp's rays which visibly spread out).

**Objects and methods used**

- **`THREE.MeshStandardMaterial`**
  - *What it is:* a lit material (defined in Terms) using a
    physically-inspired lighting model — the material this project's
    real machining models will actually use, so their vertex colors
    shade realistically under light rather than looking like a flat
    color swatch.
  - *Implementation:* a class; `new THREE.MeshStandardMaterial({ color:
    0x00ff00 })` — same options-object constructor style as Lesson 2's
    `MeshBasicMaterial`.
  - *Its use:* this lesson's entire point is contrasting this material's
    behavior (needs light) against Lessons 1–2's materials (don't).
  - *Type:* a class; extends `THREE.Material`, the same common base
    every material in this project shares, confirmed below via
    `instanceof`.
  - *Responsibility:* computes each visible pixel's final color from a
    real lighting equation that factors in the surface's own `color`,
    its `roughness` and `metalness` (two real, inspectable properties
    confirmed below — not present at all on `MeshBasicMaterial`), its
    normal direction, and every light contributing to that point —
    genuinely more to compute than either prior lesson's materials, and
    genuinely dependent on scene state (the lights present) in a way
    they weren't.
  - *Depends on:* the geometry it's paired with having real normal
    data (Lesson 2's own `computeVertexNormals()`); at least one light
    in the scene to produce anything but black, confirmed below.
  - *Connects to:* read by the renderer (Lesson 1) every frame, exactly
    like every other material so far — the difference this lesson
    teaches is entirely in *what* that reading computes, not *when* or
    *how often*.
  - *Shape:* confirmed below — carries real numeric properties
    (`roughness`, `metalness`) that simply don't exist on
    `MeshBasicMaterial` at all (read as `undefined`, not `0` or a
    default), proving these are two genuinely different shapes of
    object, not the same shape with different values.

- **`THREE.AmbientLight(color, intensity)`**
  - *What it is:* a light with no position, direction, or source at
    all — pure uniform brightness added equally to every surface in
    the scene, regardless of which way it faces.
  - *Implementation:* a class; `new THREE.AmbientLight(0xffffff, 1)` —
    a color and an intensity (defined in Terms), both optional with
    real defaults.
  - *Its use:* prevents the *unlit* side of every surface — the side
    facing away from a directional light — from going completely black,
    the way real-world indirect/bounced light does, without this
    project needing to actually simulate real light bouncing (a far
    more expensive calculation this lesson doesn't cover).
  - *Type:* a class; extends `THREE.Light`, itself an `Object3D`
    subclass — confirmed below, a light really is a real object living
    in the scene graph, the same category of thing a `Mesh` or a
    `Camera` turned out to be in Lessons 1–2.
  - *Responsibility:* contributes one flat, direction-independent
    amount of light to every lit-material surface in the scene, with no
    per-surface calculation beyond "add this amount."
  - *Depends on:* nothing beyond its own constructor arguments; it has
    no `.target` at all, confirmed below (`undefined`, not a default
    `Object3D` the way `DirectionalLight`'s is) — position on an
    `AmbientLight` genuinely has no effect on the light it produces,
    since there's no direction to compute in the first place.
  - *Connects to:* added to the scene via `scene.add()`, the identical
    method used for meshes and groups since Lesson 1; read by every lit
    material's own lighting calculation at render time.
  - *Shape:* confirmed below — real `.color` and `.intensity`
    properties, a real (but functionally inert) `.position`, and no
    `.target` property at all.

- **`THREE.DirectionalLight(color, intensity)`**
  - *What it is:* a light simulating a distant, effectively
    infinitely-far source — every ray it casts travels in exactly the
    same direction, the sunlight approximation defined in Terms, above.
  - *Implementation:* a class; `new THREE.DirectionalLight(0xffffff,
    1)` — color and intensity, same pattern as `AmbientLight`.
  - *Its use:* gives lit surfaces real shading variation — brighter
    where they face the light, darker where they face away — which
    `AmbientLight` alone, by design, never produces.
  - *Type:* a class; also a `THREE.Light` subclass.
  - *Responsibility:* defines a light direction — not by an explicit
    angle, but by the vector from its own `.position` toward a separate
    `.target` object's own position (confirmed below) — and contributes
    brightness to each surface proportional to how directly that
    surface faces back toward that direction.
  - *Depends on:* its own `.position`, and its `.target`'s `.position`
    — confirmed below, both real `Object3D`-backed positions, defaulting
    to `(0, 1, 0)` and `(0, 0, 0)` respectively, meaning a fresh
    `DirectionalLight` points straight down by default unless moved.
  - *Connects to:* added to the scene the same way as `AmbientLight`;
    its `.target`, less obviously, *also* needs to be added to the
    scene for the light to point anywhere other than straight down at
    the world origin — confirmed and used correctly in this lesson's
    own New Code, below.
  - *Shape:* confirmed below — unlike `AmbientLight`, a real `.target`
    property holding its own separate `Object3D` with its own
    `.position`; the light's actual direction is *derived* from two
    positions, not stored as a direction value directly.

---

## Concept Unit: `MeshStandardMaterial` Needs a Light

### The Problem

Lessons 1 and 2 built four materials total — `MeshNormalMaterial`
(twice) and `MeshBasicMaterial` — and every single one rendered
something, in an empty scene, with zero lights anywhere. That's about
to stop being true, and the reason why is worth understanding before
adding a single light to fix it.

> **Stop and think first:** `MeshBasicMaterial` (Lesson 2) reads only
> its own `color` property to decide each pixel's output — nothing
> about the scene around it. If a material's *entire* job were instead
> "simulate how a real physical surface reflects real light sources
> back toward the camera," what would that calculation need as input
> that a flat-color calculation never did? If there were genuinely zero
> lights anywhere in the scene, what would that calculation have to
> multiply or add together — and what would you expect the result to
> be if one of the real inputs to a lighting equation is simply
> missing?

### Isolating `MeshStandardMaterial`

```js
// throwaway-standard-material.mjs
import * as THREE from 'three';

const basic = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const standard = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

console.log('basic.type:', basic.type, '| standard.type:', standard.type);
console.log('basic instanceof THREE.Material:', basic instanceof THREE.Material);
console.log('standard instanceof THREE.Material:', standard instanceof THREE.Material);

console.log('standard.roughness (default):', standard.roughness);
console.log('standard.metalness (default):', standard.metalness);
console.log('basic.roughness (should be undefined - basic has no such param):', basic.roughness);
console.log('basic.metalness (should be undefined):', basic.metalness);
```

Actually run, this session, in plain Node:

```
basic.type: MeshBasicMaterial | standard.type: MeshStandardMaterial
basic instanceof THREE.Material: true
standard instanceof THREE.Material: true
standard.roughness (default): 1
standard.metalness (default): 0
basic.roughness (should be undefined - basic has no such param): undefined
basic.metalness (should be undefined): undefined
```

What this proves: both are real `Material` subclasses (Lesson 2's
Header already established `Material` as the common base), but
`MeshStandardMaterial` carries real `roughness`/`metalness` properties
`MeshBasicMaterial` genuinely doesn't have at all — not zero, not a
hidden default, `undefined`, meaning the property simply isn't part of
`MeshBasicMaterial`'s shape. This is real, structural evidence — not
just a name difference — that these two classes represent two
different *kinds* of material, one that models physical light
reflection (roughness: how scattered vs. mirror-like; metalness: how
much color comes from reflection versus the base color) and one that
doesn't model anything at all.

### Discarding the throwaway example

Deleted — never appears in the real project. What it proved (structural
property differences between lit and unlit materials, not just a name
or a default-value difference) is what motivates actually seeing the
"no light" consequence next, in the real project code itself rather
than a separate lab.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** created —
  `lessons/lesson-03-light/index.html`,
  `lessons/lesson-03-light/main.js`.
- **Change type:** add.
- **Location:** a new lesson project, reusing Lesson 1's own
  scene/camera/renderer/render-loop pattern rather than Lesson 2's
  bare-geometry-only file.
- **Dependencies:** the `three` package, same as every previous lesson.

### The New Code

```js
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
```

### The Updated Project

```
1  import * as THREE from 'three';
2
3  const scene = new THREE.Scene();
4  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
5  camera.position.z = 5;
6
7  const renderer = new THREE.WebGLRenderer();
8  renderer.setSize(window.innerWidth, window.innerHeight);
9  document.body.appendChild(renderer.domElement);
10
11 const geometry = new THREE.BoxGeometry(1, 1, 1);                    // ← new
12 const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // ← new
13 const cube = new THREE.Mesh(geometry, material);                     // ← new
14 scene.add(cube);                                                     // ← new
```

At this exact point — before the render loop is even added — running
this file would show: a black square where the cube should be. Not an
error, not a blank canvas (the scene, camera, and renderer are all
real and working, exactly as in Lesson 1) — a real cube, correctly
positioned, rendering as pure black, because `MeshStandardMaterial`'s
lighting calculation has a real green `color` to work with but zero
lights anywhere in `scene` to multiply that color against.

### Mechanical Walkthrough

- `new THREE.BoxGeometry(1, 1, 1)` — reappearing from Lesson 1, given
  full treatment there, unchanged here.
- `new THREE.MeshStandardMaterial({ color: 0x00ff00 })` — the
  constructor (this lesson's own Header), given a green color via the
  same hex-literal syntax Lesson 2's `MeshBasicMaterial` used —
  confirmed above to be a structurally distinct class from
  `MeshBasicMaterial`, not just a different name for the same shape of
  object.
- `new THREE.Mesh(geometry, material)` — reappearing from Lesson 1,
  given full treatment there and again in Lesson 2 — the exact same
  constructor, exact same two-argument shape, now joining a box to a
  lit material instead of an unlit one.
- `scene.add(cube)` — reappearing from Lesson 1's own Scene unit,
  given full treatment there — unchanged in meaning here; the cube
  really is in the scene, correctly positioned, and would render at
  the right location — its color is the only thing affected by the
  missing lights, not its presence or position.

### CS Lens

A calculation whose output depends on the current state of some larger
system — here, "every light in the scene" — rather than purely on its
own inputs, is a **stateful, context-dependent function**, as opposed
to a **pure function** whose output depends only on its own direct
arguments (`MeshBasicMaterial`'s color-only calculation is close to
pure in this sense — no scene-wide state involved at all). Also
recognized in: a spreadsheet cell referencing other cells rather than
only constants; a CSS style depending on inherited parent styles rather
than only its own declared rules; a database query depending on the
current transaction's isolation level; a compiler's type inference
depending on the surrounding scope, not just the expression itself.

### SE Lens

The alternative not chosen: making `MeshStandardMaterial` default to
*some* visible output even with no lights present — a small ambient
floor value baked in, say — so a reader's first attempt never renders
pure black. Three.js doesn't do this, and the real tradeoff is honest,
not accidental: baking in a hidden default light would make the
material's output not actually match real physical lighting math
(genuinely zero light in means genuinely zero light out), silently
lying about what the calculation represents in exchange for a friendlier
first impression. The real cost paid by the choice actually made: a
reader's very first `MeshStandardMaterial` scene, with no
lighting knowledge yet, renders nothing visible at all — exactly what
happened in this unit — with no error message pointing at the actual
cause, only the missing pixels themselves as the only clue something's
wrong.

### One sentence connecting this unit to what came before

The black cube on screen right now is not a bug to work around — it's
this lesson's own honest, correct proof that lit materials genuinely
need something the next two units haven't added yet.

---

## Concept Unit: `AmbientLight` — Uniform Fill

### The Problem

The previous unit's black cube has real color data (`0x00ff00`) and a
real, correctly-computed lighting equation ready to use it — the only
missing ingredient is any light at all for that equation to read.

> **Stop and think first:** the simplest possible light you could
> invent would need no position, no direction, nothing about *where*
> it comes from — just "how bright." What would such a light actually
> look like on a cube — would different faces of the cube look
> different from each other under it, the way `MeshNormalMaterial`
> (Lesson 1) made each face of a box a visibly different color? Or
> would a light with no direction at all have any way to make one face
> brighter than another?

### Isolating `THREE.AmbientLight`

```js
// throwaway-ambient.mjs
import * as THREE from 'three';

const ambient = new THREE.AmbientLight(0xffffff, 1);
console.log('ambient instanceof THREE.Light:', ambient instanceof THREE.Light);
console.log('ambient instanceof THREE.Object3D:', ambient instanceof THREE.Object3D);
console.log('ambient.color (hex):', ambient.color.getHexString());
console.log('ambient.intensity:', ambient.intensity);
console.log('ambient.position:', ambient.position.x, ambient.position.y, ambient.position.z);
console.log('ambient.target:', ambient.target);
```

Actually run, this session, in plain Node:

```
ambient instanceof THREE.Light: true
ambient instanceof THREE.Object3D: true
ambient.color (hex): ffffff
ambient.intensity: 1
ambient.position: 0 0 0
ambient.target: undefined
```

What this proves, answering the Socratic question directly: `AmbientLight`
really is an `Object3D` — it has a real `.position` — but it has no
`.target` property at all (`undefined`, the same "genuinely doesn't
exist on this shape" signal Unit 1's `basic.roughness` check used).
With no target and no meaningful use of its own position, there is
structurally no direction for this light to compute — it can only ever
contribute the same flat amount to every surface, confirming a cube lit
by `AmbientLight` alone would show all six faces at the identical
brightness, with none of `MeshNormalMaterial`'s per-face variation.

### Discarding the throwaway example

Deleted — never appears in the real project. What it proved
(`AmbientLight` is a real scene object with no direction-defining
`.target`) is what the real code below relies on to explain what you'll
actually see once it's added.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** modified — `main.js`.
- **Change type:** add.
- **Location:** directly below the `scene.add(cube)` line from the
  previous unit.
- **Dependencies:** the `scene` variable, already in scope.

### The New Code

```js
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
```

### The Updated Project

```
1  import * as THREE from 'three';
2
3  const scene = new THREE.Scene();
4  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
5  camera.position.z = 5;
6
7  const renderer = new THREE.WebGLRenderer();
8  renderer.setSize(window.innerWidth, window.innerHeight);
9  document.body.appendChild(renderer.domElement);
10
11 const geometry = new THREE.BoxGeometry(1, 1, 1);
12 const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
13 const cube = new THREE.Mesh(geometry, material);
14 scene.add(cube);
15
16 const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // ← new
17 scene.add(ambientLight);                                     // ← new
```

At this point, running the file shows: the cube is visible again — a
flat, dim green, every face reading identically, with no visible edges
between faces at all (no shading variation to reveal where one face
ends and the next begins, exactly the "all six faces the same
brightness" prediction the Socratic question above led to). This is
recognizably different from `MeshNormalMaterial`'s six visibly distinct
colors in Lesson 1, and from a real photograph of any lit object, which
always shows *some* shading variation — the next unit adds exactly the
directional variation this one structurally cannot.

### Mechanical Walkthrough

- `new THREE.AmbientLight(0xffffff, 0.5)` — the constructor (this
  lesson's own Header): white color (`0xffffff`, all three RGB channels
  at maximum), `0.5` intensity — deliberately less than the default
  `1` used in the isolated lab, so this light alone doesn't fully wash
  out the green cube's own color once combined with the directional
  light in the next unit.
- `scene.add(ambientLight)` — reappearing from Lesson 1's own Scene
  unit, given full treatment there and reused unchanged here — proving,
  concretely, that a light is added to a scene through the exact same
  method and mechanism as a mesh; `Light` and `Mesh` are siblings under
  the same `Object3D` base class, not two unrelated systems.

### CS Lens

A uniform contribution applied identically to every element in a
collection, regardless of that element's own individual state, is the
same shape as a **base case with no conditional logic** — the simplest
possible member of a family of related calculations (here, the family
of "how much light reaches this surface," of which directional light,
next unit, is a strictly more complex member). Also recognized in: a
flat sales tax applied identically regardless of item price; a CSS
`* { margin: 0; }` universal selector reset, applied before any more
specific rule; a base interest rate before any account-specific
adjustment; the identity element in group theory (the specific value
that changes nothing when combined with any other).

### SE Lens

The alternative not chosen: skip `AmbientLight` entirely and rely only
on directional light. The real cost of that choice: any surface facing
away from the one directional light would render pure black — a real,
common problem in Three.js scenes with a single light source, since a
box (or your own machining models, later) always has faces pointing
away from any single direction. `AmbientLight` is the cheap, imprecise
fix for that: it's not physically accurate (real indirect light varies
by surroundings, not a flat scene-wide constant), but it's one extra
object and one extra `scene.add()` call, in exchange for never having a
fully unreadable black face anywhere in the scene.

### One sentence connecting this unit to what came before

The cube is visible again, but flat — every face reading identically —
because `AmbientLight`, confirmed above, structurally has no direction
to vary by; the next unit adds exactly that.

---

## Concept Unit: `DirectionalLight` — Real Shading

### The Problem

The previous unit's cube is visible but flat — genuinely indistinguishable,
face to face, the way a `MeshNormalMaterial` cube never was. Real
shading — one face brighter because it faces the light, another dimmer
because it doesn't — needs a light with an actual direction, which
`AmbientLight` structurally cannot provide.

> **Stop and think first:** the Header above states that
> `DirectionalLight`'s actual direction is derived from two separate
> positions — its own `.position` and a separate `.target`'s
> `.position` — rather than stored as one direction value directly.
> Why might Three.js have designed it that way, instead of a simpler
> `light.direction.set(x, y, z)`? What becomes easy to do with two
> movable points that would be more awkward with one fixed direction
> vector — could you, for instance, make a light always point at a
> specific moving object in the scene, by moving only the target?

### Isolating `THREE.DirectionalLight`

```js
// throwaway-directional.mjs
import * as THREE from 'three';

const dir = new THREE.DirectionalLight(0xffffff, 1);
console.log('dir instanceof THREE.Light:', dir instanceof THREE.Light);
console.log('dir.color (hex):', dir.color.getHexString());
console.log('dir.intensity:', dir.intensity);
console.log('dir.position (default):', dir.position.x, dir.position.y, dir.position.z);
console.log('dir.target instanceof THREE.Object3D:', dir.target instanceof THREE.Object3D);
console.log('dir.target.position (default):', dir.target.position.x, dir.target.position.y, dir.target.position.z);

dir.position.set(5, 10, 7);
console.log('after position.set(5,10,7):', dir.position.x, dir.position.y, dir.position.z);

const dx = dir.target.position.x - dir.position.x;
const dy = dir.target.position.y - dir.position.y;
const dz = dir.target.position.z - dir.position.z;
console.log('implied direction (target - position):', dx, dy, dz);
```

Actually run, this session, in plain Node:

```
dir instanceof THREE.Light: true
dir.color (hex): ffffff
dir.intensity: 1
dir.position (default): 0 1 0
dir.target instanceof THREE.Object3D: true
dir.target.position (default): 0 0 0
after position.set(5,10,7): 5 10 7
implied direction (target - position): -5 -10 -7
```

What this proves, directly answering the Socratic question: `.target`
really is its own separate, real `Object3D` (confirmed by
`instanceof`), not a plain direction vector — meaning it's a real
scene-graph object that could, if added to the scene and given its own
changing `.position` over time (a technique this lesson doesn't build,
but the object shape genuinely supports it), let a light continuously
re-aim at something moving, by moving the target instead of computing
and re-setting a direction by hand every frame. The default position
`(0, 1, 0)` with a default target at the origin `(0, 0, 0)` confirms a
brand-new `DirectionalLight`, untouched, points straight down —
consistent with the implied-direction math shown, `(-5, -10, -7)` after
moving the light itself to `(5, 10, 7)`: light travels from the light's
position *toward* the target, the reverse sign of "target minus
position" pointing back at the light.

### Discarding the throwaway example

Deleted — never appears in the real project. What it proved (`.target`
is a real, independently-positioned `Object3D`, and direction is
derived from two positions rather than stored directly) is what the
real code below relies on.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** modified — `main.js`.
- **Change type:** add.
- **Location:** directly below the `scene.add(ambientLight)` line from
  the previous unit.
- **Dependencies:** the `scene` variable, already in scope.

### The New Code

```js
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7);
scene.add(directionalLight);
```

### The Updated Project

```
1  import * as THREE from 'three';
2
3  const scene = new THREE.Scene();
4  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
5  camera.position.z = 5;
6
7  const renderer = new THREE.WebGLRenderer();
8  renderer.setSize(window.innerWidth, window.innerHeight);
9  document.body.appendChild(renderer.domElement);
10
11 const geometry = new THREE.BoxGeometry(1, 1, 1);
12 const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
13 const cube = new THREE.Mesh(geometry, material);
14 scene.add(cube);
15
16 const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
17 scene.add(ambientLight);
18
19 const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // ← new
20 directionalLight.position.set(5, 10, 7);                          // ← new
21 scene.add(directionalLight);                                       // ← new
```

At this point, running the file shows: the cube's top and the face
oriented toward `(5, 10, 7)` reading noticeably brighter green, the
opposite faces reading dimmer (lit only by the ambient contribution
from the previous unit) — real, visible shading variation, the thing
missing since `AmbientLight` alone. Note that `directionalLight.target`
is never added to the scene in this code — it defaults to sitting at
the world origin `(0, 0, 0)`, confirmed above, which happens to be
exactly where the cube itself sits (Lesson 1's own default `Mesh`
position), so the default, un-added target already points the light
correctly at the cube without extra code — a real, working shortcut for
this specific scene, not a general rule.

### Mechanical Walkthrough

- `new THREE.DirectionalLight(0xffffff, 1)` — the constructor (this
  lesson's own Header), full intensity this time (unlike the ambient
  light's deliberately-reduced `0.5`), since this is the light meant to
  actually reveal shape through shading, not just prevent total
  blackness.
- `directionalLight.position.set(5, 10, 7)` — a method call on
  `.position`, a `Vector3` (reappearing from Lesson 1's own Camera
  unit, given full treatment there) — `.set(x, y, z)` assigns all three
  components in one call, confirmed above in the isolated lab to
  produce exactly the position given, rather than needing three
  separate `.x =`, `.y =`, `.z =` assignments the way Lesson 1's camera
  code used for a single-axis change.
- `scene.add(directionalLight)` — reappearing from Lesson 1's Scene
  unit and this lesson's own previous unit, given full treatment in
  both — adds the light itself to the scene graph; note, per the
  Mechanical Walkthrough of the New Code above, that this line does
  *not* also add `directionalLight.target` — only the light object
  itself.

### CS Lens

Deriving a direction from two independently-positioned points (light
position and target position), rather than storing a direction value
directly, is the same underlying idea as Module C's own upcoming
subject — representing a relationship as the *difference* between two
states, rather than as an absolute value stored once. Also recognized
in: version control computing a diff between two file states rather
than storing "the change" as its own primitive; velocity in physics,
derived from two positions over an interval rather than measured
directly; a CSS `transform: translate()` expressed relative to an
element's own untransformed position rather than as an absolute
page coordinate.

### SE Lens

The alternative not chosen: a `DirectionalLight` with a
`.direction.set(x, y, z)` API instead of a separate `.target` object.
Simpler for the single-scene, nothing-ever-moves case this lesson
actually shows. The real cost of the choice Three.js actually made
(two positions, not one direction): every `DirectionalLight` implicitly
creates a second `Object3D` (the target) that a reader has to know
about and remember to add to the scene if it needs to move — confirmed
above, this lesson's own code gets away without adding it only because
the default target position happens to already be where it's needed;
a scene where the light needs to track a moving object would need that
extra `scene.add(light.target)` call this lesson never had a reason to
show.

### One sentence connecting this unit to what came before

Every earlier lesson's own render loop machinery — `animate()`,
`requestAnimationFrame` — still applies completely unchanged here; the
only thing this lesson's three concept units actually changed is what
the renderer's own per-pixel color calculation has available to read.

---

## Closing

### Connect the pieces

Start from `material`, line 12: a `MeshStandardMaterial` holding the
color `0x00ff00`, confirmed (Unit 1) to carry real `roughness`/
`metalness` properties `MeshBasicMaterial` structurally lacks — proof
this material's rendering path is a genuinely different calculation,
not the same one with different inputs. With nothing else in the
scene, that calculation, run for real, reads zero contributing lights
and produces black — the state of the file after line 14, before
either light exists. Line 16 adds a light with no derivable direction
at all (confirmed, Unit 2 — no `.target` property exists on the
class), contributing one flat amount to every point on the cube
identically, regardless of which of the cube's six faces (confirmed,
Lesson 1's own Geometry unit — 24 position entries, three per corner,
one for each of three meeting faces) is being shaded. Line 19 adds a
second light whose real direction (confirmed, Unit 3) is computed from
two separate positions — its own, set explicitly to `(5, 10, 7)` on
line 20, and its target's, left at the untouched default `(0, 0, 0)`,
which happens to coincide with where `cube` itself sits, confirmed
back in Lesson 1's own Mesh unit as `THREE.Mesh`'s own default
`.position`. Every one of the cube's 24 stored vertex normals
(confirmed, Lesson 1) now genuinely matters for the first time in this
project — `MeshNormalMaterial`, in Lesson 1, used those same normals to
pick a flat display color per face with no light involved at all;
`MeshStandardMaterial`, here, uses those identical normals to compute
how directly each face's true 3D orientation lines up with light
arriving from `(5, 10, 7)` toward `(0, 0, 0)` — the same normal data,
read for a structurally different purpose, by a structurally different
material.

## Commands needed

Identical to Lesson 1's own Commands section — `npx serve .` from
inside `lessons/lesson-03-light/`, with `index.html` pinning
`three@0.185.1` via the same importmap pattern already established.

## Run it

The complete file — all three of this lesson's own units, plus a
render loop identical in structure to Lesson 1's own — is provided as a
real, runnable project at `lessons/lesson-03-light/`. As with every
`WebGLRenderer`-dependent output in this curriculum, actually seeing
the black-cube, then flat-green, then properly-shaded-green progression
requires a real browser this sandbox doesn't have. Run it and report
back what you actually see at each of the three stages described in
each unit's own "Updated Project" step, so real output can be saved
into `verify/lesson-03/` in place of this unit's documented-but-
unexecuted predictions.

## Next lesson

Lesson 4 covers `OrbitControls` — letting you actually move the camera
around this now-properly-lit cube with the mouse, instead of the fixed
`camera.position.z = 5` every lesson so far has used unchanged.
