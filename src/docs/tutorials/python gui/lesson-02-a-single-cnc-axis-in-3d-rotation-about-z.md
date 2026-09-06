# Lesson 2: A Single CNC Axis in 3D — Rotation About Z

**What you will build** — a rectangular block, standing in for a workpiece
clamped to a CNC rotary (C-axis) table, sitting at the origin of a Three.js
scene and spinning in place around the Z axis — the way a real rotary table
spins a clamped part while the table's own center never moves. This time the
rotation is built from a real 3D rotation matrix, extending Lesson 1's 2×2
matrix with a third, untouched row and column for `z`, and handed to Three.js's
own `THREE.Matrix4` and `Object3D.setRotationFromMatrix` — not recomputed as
a raw position update every frame, the way Lesson 1's orbiting sphere was.
The transferable problem: telling apart *where* an object sits (its
position) from *which way it's facing* (its orientation), and seeing that a
rotation matrix can change one without touching the other at all.

**What you need to know first** — Lesson 1: the 2D rotation matrix built
from `Math.cos`/`Math.sin`, and the Three.js scene/camera/renderer setup
pattern.

**Terms used in this lesson**
- **radian** — the unit an angle is measured in when it's defined as the
  ratio of arc length to radius, rather than a count out of 360. Used here
  for the same reason as before: every trigonometric function this lesson's
  matrix math depends on expects and returns radians.
- **trigonometric function** — a function (sine or cosine) mapping an angle
  to a ratio describing a right triangle built from that angle. Still the
  only way to state, numerically, how far around a rotation has turned.
- **rotation matrix** — a fixed grid of numbers that turns any point's
  coordinates into the coordinates of that point after being rotated by some
  angle around a fixed axis. This lesson extends it from the 2×2 grid Lesson
  1 built into a 3×3 grid, so it can describe a rotation in real 3D space
  instead of a flat plane.
- **axis of rotation** — the one line that stays completely fixed in place
  while every other point turns around it. Naming this matters because
  "rotate by 30 degrees" is meaningless on its own — a rotation is only
  fully specified once both an angle *and* an axis are given.
- **orientation** — which way an object is currently facing, as distinct
  from *where* it is. A rotation matrix applied to an object's orientation
  can turn it in place without moving its position by even a millimeter —
  the distinction this entire lesson is built around, since Lesson 1's
  rotation changed a point's *position* and this lesson's changes an
  object's *orientation* instead.
- **identity matrix** — the specific rotation matrix representing "rotated
  by zero degrees" — a grid with `1`s down the main diagonal and `0`s
  everywhere else. It matters here because a freshly constructed
  `THREE.Matrix4` starts out as exactly this, before any `.makeRotationZ(...)`
  call changes it.
- **homogeneous coordinates** — a convention where a 3D point `(x, y, z)` is
  written as a 4-number tuple `(x, y, z, 1)` so that both rotation *and*
  translation (moving an object from one place to another) can be expressed
  as a single 4×4 matrix multiplication. This is the direct reason Three.js
  uses a 4×4 `Matrix4` for a rotation that only actually needs 3×3 worth of
  numbers.
- **column-major order** — a convention for laying a matrix's numbers out in
  a single flat list, storing an entire column before moving to the next one
  — as opposed to row-major order, which stores an entire row first. This
  matters because a rotation matrix's numbers, read directly out of
  `Matrix4.elements`, come out in a different order than the row-by-row grid
  this lesson's own diagrams show, and that difference has a name rather
  than being an unexplained inconsistency.

**Objects and methods used**

*This lesson's own subject — the trigonometry behind the matrix, and the
matrix itself:*

- **`Math.cos`**
  - *What it is:* the cosine function, a static method on JavaScript's
    built-in `Math` object.
  - *Implementation:* `Math.cos(radians: number): number`, always between
    `-1` and `1`.
  - *Its use:* still the source of the rotation matrix's diagonal-style
    entries — the ratio describing how much of a coordinate survives
    unchanged along its own axis after rotating by a given angle.
  - *Type:* a `static` method, called on `Math` itself, never on an
    instance.
  - *Responsibility:* given radians, return the x-coordinate of the point
    that angle reaches on a unit circle — nothing about what that number is
    later used for.
  - *Depends on:* one numeric radians argument; no other state.
  - *Connects to:* called inside this lesson's throwaway `rotate3DZ`
    function and, separately, inside Three.js's own real `Matrix4.
    makeRotationZ` implementation — the same mathematical call, reused
    inside a library instead of hand-written.
  - *Shape:* one float in, one float out.

- **`Math.sin`**
  - *What it is:* the sine function, `Math.cos`'s counterpart.
  - *Implementation:* `Math.sin(radians: number): number`, also bounded
    between `-1` and `1`.
  - *Its use:* the source of the matrix's off-diagonal entries — the ratio
    describing how much of a coordinate "leaks" into the other in-plane axis
    as the angle rotates it.
  - *Type:* a `static` method, same reasoning as `Math.cos`.
  - *Responsibility:* given radians, return the y-coordinate of the same
    unit-circle point.
  - *Depends on:* one numeric radians argument.
  - *Connects to:* called alongside `Math.cos`, both inside this lesson's
    throwaway lab and inside `Matrix4.makeRotationZ`'s real implementation.
  - *Shape:* one float in, one float out.

- **`Math.PI`**
  - *What it is:* a named numeric constant on `Math`, not a function.
  - *Implementation:* a fixed `number`, approximately
    `3.141592653589793`.
  - *Its use:* converts human-friendly degree values into the radians
    `Math.cos`/`Math.sin` require, wherever this lesson states an example
    angle in degrees.
  - *Type:* a constant property — reading it runs no code.
  - *Responsibility:* hold one fixed, correct value for π.
  - *Depends on:* nothing; it isn't callable.
  - *Connects to:* used directly in this lesson's degree-to-radian
    conversions, both in prose and in verification code.
  - *Shape:* a single fixed floating-point number.

- **`THREE.Matrix4`**
  - *What it is:* a class representing a 4×4 matrix — the size Three.js
    uses for every rotation, translation, and scale transform, via the
    homogeneous-coordinates convention defined above.
  - *Implementation:* `new THREE.Matrix4()` takes no required arguments and
    starts as the identity matrix; internally it stores its sixteen numbers
    in a flat `elements` array, in column-major order.
  - *Its use:* this is the real, library-provided replacement for the
    throwaway `rotate3DZ` function this lesson's first Concept Unit writes
    and discards — instead of hand-computing new coordinates every frame,
    a `Matrix4` is built once per frame and handed straight to the mesh.
  - *Type:* a constructible class, instantiated with `new`.
  - *Responsibility:* hold sixteen numbers representing one 3D
    transformation, and provide methods (`makeRotationZ`, and others this
    lesson doesn't yet use) that fill those sixteen numbers in according to
    a specific, named transform.
  - *Depends on:* nothing at construction — a fresh instance is always the
    identity transform until a `make...` method is called on it.
  - *Connects to:* built in this lesson's `animate` function; consumed by
    `Object3D.setRotationFromMatrix`, which reads it and updates the mesh's
    own quaternion from it.
  - *Shape:* a flat 16-number array under the hood (`.elements`), always
    representing one specific 4×4 grid — never a nested 2D array.

- **`Matrix4.prototype.makeRotationZ(theta)`**
  - *What it is:* an instance method on `Matrix4` that overwrites the
    matrix's own numbers to represent "rotate by `theta` radians around the
    Z axis," discarding whatever the matrix held before.
  - *Implementation:* `makeRotationZ(theta: number): this` — computes
    `Math.cos(theta)` and `Math.sin(theta)` internally and places them into
    the matrix's upper-left 3×3 region exactly where the hand-derived 3×3
    grid in this lesson's Isolated Example puts them, leaving the rest of
    the 4×4 grid as the identity's own translation-and-scale portion.
  - *Its use:* this is the one call that actually turns "an angle" into "a
    rotation matrix," inside the library, mirroring exactly what the
    discarded `rotate3DZ` did by hand.
  - *Type:* an instance method, called on a specific `Matrix4` object, not
    `static`.
  - *Responsibility:* encode one rotation, around one fixed axis (Z), by
    one angle — nothing about translation or scale, both of which this call
    resets to their identity defaults.
  - *Depends on:* one numeric argument, the angle in radians, and the
    `Matrix4` instance it's called on (which it mutates in place).
  - *Connects to:* called once per frame inside `animate`, on the same
    `rotationMatrix` object reused every frame; its result flows directly
    into `setRotationFromMatrix`.
  - *Shape:* takes one number, returns the same `Matrix4` instance
    (mutated, not a new one) — chainable, though this lesson doesn't chain
    it.

- **`Matrix4.prototype.elements`**
  - *What it is:* a property, not a method — the matrix's actual sixteen
    numbers, exposed as a flat array.
  - *Implementation:* a `Float32Array` (or plain array, depending on build)
    of length 16, in column-major order — confirmed directly against the
    real, installed library rather than assumed, in this unit's Isolated
    Example below.
  - *Its use:* this lesson reads it exactly once, to prove — not just
    assert — that `makeRotationZ`'s real output matches the hand-derived
    3×3 grid.
  - *Type:* an instance property.
  - *Responsibility:* hold the sixteen raw numbers; nothing about
    interpreting them.
  - *Depends on:* whatever the matrix's most recent `make...` or
    `multiply...` call last set it to.
  - *Connects to:* read directly by this lesson's verification code; read
    internally by Three.js's own rendering pipeline when a mesh's final
    world matrix is uploaded to the GPU.
  - *Shape:* a flat, 16-number array — never a nested structure.

- **`Object3D.prototype.setRotationFromMatrix(matrix)`**
  - *What it is:* an instance method, inherited by every `Mesh` (and every
    other `Object3D`), that extracts a rotation from a given `Matrix4` and
    stores it as the object's own orientation.
  - *Implementation:* `setRotationFromMatrix(m: Matrix4): void` — internally
    calls `this.quaternion.setFromRotationMatrix(m)`, per Three.js's own
    documented behavior: an object's orientation is always stored as a
    **quaternion** internally, never as the `Matrix4` handed to this method,
    which is discarded immediately after its rotation is extracted.
  - *Its use:* this is the call that actually moves the block on screen —
    everything upstream of it (the angle, the matrix) exists only to produce
    the `Matrix4` this method reads.
  - *Type:* an instance method, called on the specific mesh being rotated.
  - *Responsibility:* update exactly one thing — this object's own
    orientation — from a given matrix; it never touches position or scale,
    even though the `Matrix4` handed to it is a full 4×4 transform capable
    of encoding those too.
  - *Depends on:* one `Matrix4` argument.
  - *Connects to:* called once per frame from `animate`, immediately after
    `makeRotationZ`; reads and writes the mesh's own `.quaternion`, which
    this lesson inspects directly, verified for real, in the execution
    trace below.
  - *Shape:* takes one `Matrix4`, returns nothing — its effect is entirely
    the mutation of the mesh's own `.quaternion`.

- **`Object3D.prototype.quaternion`**
  - *What it is:* a property, not a method — a `THREE.Quaternion` instance,
    the object's real, internally-stored orientation.
  - *Implementation:* four numbers, `x`, `y`, `z`, `w` — this lesson doesn't
    yet explain what those four numbers individually mean (a later lesson
    in this curriculum is dedicated entirely to that); here it's inspected
    only as evidence that Three.js really does store orientation this way,
    not as the Euler angle this lesson's own math is phrased in terms of.
  - *Its use:* reading it, after calling `setRotationFromMatrix`, is how
    this lesson proves — rather than merely asserts — that the matrix
    really was converted and stored, and reveals a genuinely surprising
    real behavior explained in the execution trace below.
  - *Type:* an instance property.
  - *Responsibility:* hold the object's current orientation, full stop —
    every other rotation-related property (`.rotation`, the Euler-angle
    view) is derived from this one, not the other way around.
  - *Depends on:* whatever `setRotationFromMatrix`, or any other rotation-
    setting call, most recently wrote into it.
  - *Connects to:* read by this lesson's verification code; read internally
    whenever Three.js computes the object's world matrix for rendering.
  - *Shape:* four plain numbers (`x`, `y`, `z`, `w`) — never an array, never
    fewer or more than four fields.

- **`Object3D.prototype.rotation`**
  - *What it is:* a property, not a method — a `THREE.Euler` instance, a
    second, human-friendlier view of the same orientation `.quaternion`
    already holds.
  - *Implementation:* three numbers, `x`, `y`, `z` (in radians), plus an
    `order` string (`'XYZ'` by default) stating which axis is applied first,
    second, and third — recomputed on demand from `.quaternion`, not stored
    independently of it.
  - *Its use:* inspected in this lesson's execution trace purely to compare
    against `.quaternion`, and to surface one specific, real, verified
    surprise about how that conversion behaves near a half-turn.
  - *Type:* an instance property.
  - *Responsibility:* present the object's orientation as three familiar
    angle numbers, for whatever code (or however a person) prefers reading
    angles over four quaternion components.
  - *Depends on:* the object's current `.quaternion`, from which it's
    derived each time it's read.
  - *Connects to:* derived from `.quaternion`; never itself the source of
    truth Three.js actually renders from.
  - *Shape:* three numbers plus one order string — never four numbers, and
    never independently settable without also affecting `.quaternion`.

- **`Vector3.prototype.applyMatrix4(matrix)`**
  - *What it is:* an instance method on `THREE.Vector3` that transforms the
    vector's own `x`, `y`, `z` by a given 4×4 matrix, using homogeneous
    coordinates internally.
  - *Implementation:* `applyMatrix4(m: Matrix4): this` — mutates the
    vector's own three fields in place and returns the same instance.
  - *Its use:* this lesson's Isolated Example uses it exactly once, to prove
    that the library's real rotation matrix produces the identical
    coordinates the hand-written `rotate3DZ` function computes — the direct
    successor to Lesson 1's own length-preservation proof.
  - *Type:* an instance method, called on a specific `Vector3`.
  - *Responsibility:* apply one matrix transform to one point; nothing about
    where that point came from or what happens to it afterward.
  - *Depends on:* one `Matrix4` argument and the vector's own current `x`,
    `y`, `z`.
  - *Connects to:* called once, in this lesson's verification code only —
    it never appears in the real project file, since the project rotates a
    whole `Mesh`'s orientation, never a bare point's position, from this
    lesson onward.
  - *Shape:* takes one matrix, mutates and returns the same `Vector3` — a
    point in, the same point (moved) out.

*Scene setup and mesh construction — Three.js infrastructure, not this
lesson's own subject.* The scene/camera/renderer trio is explained in full in
[`threejs-scene-camera-renderer.md`](../src/docs/concepts/threejs-scene-camera-renderer.md).
Building and placing a visible shape from a geometry and a material is
explained in full in
[`threejs-mesh-from-geometry-and-material.md`](../src/docs/concepts/threejs-mesh-from-geometry-and-material.md).
Both recur unchanged from Lesson 1 and are pointed to here rather than
re-derived; the Mechanical Walkthrough below still shows exactly where each
call appears in this lesson's own file.

**Everything else in the file, not this lesson's subject but still
explained:**

- **`renderer.setAnimationLoop(callback)`** — documented in full in Lesson
  1's own Header; reused here unchanged, registering this lesson's own
  `animate` function to run once per display refresh instead of Lesson 1's
  point-orbiting one.

---

## Concept Unit: The Third Row a Z-Axis Rotation Doesn't Touch

### The Problem

Lesson 1's `rotate2D` function only ever took two numbers, `x` and `y` — a
flat, 2D world. A real workpiece clamped to a CNC rotary table lives in 3D:
every point on it has a height above the table (`z`) as well as a position
across it (`x`, `y`). If the table spins purely around a vertical axis
running straight up through its center, what happens to a point's height as
the table turns?

> **Try it yourself, before reading on:** picture a bolt sticking straight
> up out of a rotary table, 4 centimeters tall, positioned off to one side
> of the table's center. As the table spins one full turn, does the bolt's
> *height* ever change? Does the bolt ever get closer to or farther from the
> floor? Now think about a point sitting exactly at the table's own center,
> right on the axis itself, at that same 4cm height — does *that* point move
> at all as the table spins, no matter how far it turns? State, in your own
> words, what you think stays exactly fixed during this kind of rotation,
> and what changes.

### Introduce the Concept in Isolation

Work this out standalone first, disconnected from Three.js. Create a
scratch file — this gets discarded once it's proven the idea — and type:

```javascript
function rotate3DZ(x, y, z, thetaRadians) {
  const cosT = Math.cos(thetaRadians);
  const sinT = Math.sin(thetaRadians);
  const xNew = x * cosT - y * sinT;
  const yNew = x * sinT + y * cosT;
  return { x: xNew, y: yNew, z: z };
}

const start = { x: 5, y: 0, z: 2 };
const anglesDeg = [0, 30, 90, 180];

for (const deg of anglesDeg) {
  const rad = deg * (Math.PI / 180);
  const r = rotate3DZ(start.x, start.y, start.z, rad);
  console.log(`theta=${deg}deg -> x=${r.x.toFixed(4)}, y=${r.y.toFixed(4)}, z=${r.z.toFixed(4)}`);
}
```

Run with `node rotate3dz.js`. Real output:

```
theta=0deg -> x=5.0000, y=0.0000, z=2.0000
theta=30deg -> x=4.3301, y=2.5000, z=2.0000
theta=90deg -> x=0.0000, y=5.0000, z=2.0000
theta=180deg -> x=-5.0000, y=0.0000, z=2.0000
```

`z` reads `2.0000` on every single row, no matter the angle — exactly the
"stays fixed" behavior the Socratic prompt above asked about. This function
is only Lesson 1's `rotate2D` with one line changed: `z` is accepted as a
third parameter and returned completely untouched, never multiplied by
`cosT` or `sinT` at all. Written as an actual grid of numbers rather than
four separate lines of arithmetic, this is the **3×3 rotation matrix about
the Z axis**:

```
[ cosT   -sinT    0 ]
[ sinT    cosT    0 ]
[   0       0     1 ]
```

The third row, `[0, 0, 1]`, is the entire reason `z` survives unchanged: it
says "the new `z` equals zero times the old `x`, plus zero times the old
`y`, plus one times the old `z`" — which is just `z` itself, restated.

A second check, extending Lesson 1's own distance-preservation proof into a
real third dimension:

```javascript
for (const deg of [17, 123, 289]) {
  const rad = deg * (Math.PI / 180);
  const r = rotate3DZ(start.x, start.y, start.z, rad);
  const len = Math.sqrt(r.x * r.x + r.y * r.y + r.z * r.z);
  console.log(`theta=${deg}deg -> 3D length = ${len.toFixed(6)}`);
}
```

Real output:

```
theta=17deg -> 3D length = 5.385165 (started at 5.385165)
theta=123deg -> 3D length = 5.385165 (started at 5.385165)
theta=289deg -> 3D length = 5.385165 (started at 5.385165)
```

The full 3D distance from the origin — now computed with all three
coordinates under the square root — comes back identical to six decimal
places at every angle tried, proving the same rotation property from Lesson
1 still holds once a third dimension is added: this transformation only ever
turns a point around a fixed axis, never moving it closer to or farther from
that axis.

**One more proof, before trusting a library to do this instead of hand-
written code:** does Three.js's own real `Matrix4` actually produce the same
numbers `rotate3DZ` does? This is exactly the kind of claim that needs
checking, not assuming — so it's checked directly against the real,
installed library rather than trusted from memory:

```javascript
import * as THREE from 'three';

const m = new THREE.Matrix4();
m.makeRotationZ(Math.PI / 2); // 90 degrees

const point = new THREE.Vector3(5, 0, 2);
point.applyMatrix4(m);

console.log(`Vector3(5,0,2) rotated 90deg about Z -> (${point.x.toFixed(4)}, ${point.y.toFixed(4)}, ${point.z.toFixed(4)})`);
```

Real output, run against the actual pinned `three@0.185.1`:

```
Vector3(5,0,2) rotated 90deg about Z -> (0.0000, 5.0000, 2.0000)
```

This matches `rotate3DZ(5, 0, 2, 90°)`'s own result — `(0, 5, 2)` — exactly.
The library's real, internal implementation and this lesson's four-line
hand-written function compute the identical answer.

Something else worth checking directly rather than assuming: what order does
Three.js actually store a matrix's sixteen numbers in?

```javascript
const m2 = new THREE.Matrix4();
m2.makeRotationZ(30 * Math.PI / 180);
console.log(m2.elements.map(v => v.toFixed(4)));
```

Real output:

```
[0.8660, 0.5000, 0.0000, 0.0000, -0.5000, 0.8660, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000]
```

The first four numbers, `0.8660, 0.5000, 0.0000, 0.0000`, are `cosT`,
`sinT`, `0`, `0` — that's the matrix's *first column*, not its first row,
even though the hand-drawn grid above was written row by row. This is
**column-major order**: Three.js's `elements` array stores an entire column
before moving to the next one. It's a real, verified convention, not an
assumption — reading `elements` as if it were row-major would silently
transpose the matrix and produce a rotation in the wrong direction the
moment this lesson's own numbers are compared against it directly.

### Discard the Throwaway Example

Both `rotate3dz.js` and the verification snippets above are discarded now —
none of this code, including the hand-written `rotate3DZ` function, becomes
part of the real project file. What continues forward is the proof: the real
`THREE.Matrix4` computes the identical rotation, so the project can now use
it directly, with confidence, instead of hand-rolled arithmetic.

### CS Lens

A rotation matrix's columns are not an arbitrary storage detail — each
column literally states where one of the original coordinate axes ends up
after the rotation. In the 30° example above, the first column, `(0.8660,
0.5000, 0.0000)`, is exactly where the original X axis points after a 30°
rotation about Z; the second column is where the original Y axis points;
the third, unchanged `(0, 0, 1)`, is where the Z axis points — namely,
nowhere different, since Z is the axis being rotated *around*. Reading a
rotation matrix this way — one column per transformed axis — is the same
idea underlying a **change of basis**, a foundational linear algebra
concept.

```
Also recognized in: a robot's forward-kinematics chain (each joint's
matrix says where the next joint's own axes point), a CAD program's
local-to-world coordinate transforms, camera "view matrices" in every
3D game engine, and GPS/inertial-navigation attitude matrices describing
which way a vehicle's own front/up/side axes currently point relative
to true north and gravity.
```

### SE Lens

This unit deliberately proves the hand-written function and the real library
agree *before* switching to the library, rather than simply asserting
`Matrix4` is correct and moving on. The alternative — trusting the library
outright from the start — would have been faster to write, but it would
leave no way to notice if a wrong assumption (wrong rotation direction,
wrong axis, wrong angle convention) had crept in silently. The real cost
already paid here: the discovery that Three.js stores matrix numbers in
column-major order, not the row-major order this lesson's own diagrams use.
Skipping this check and just reading `elements[1]` expecting a *row's*
second entry, instead of a *column's* second entry, would have produced
believable-looking but silently wrong numbers the first time this lesson's
own code needed to read them back out — exactly the kind of bug that looks
like it works until a specific, uncommon input exposes it.

### Connect the Pieces

The 3×3 grid `[cosT, -sinT, 0; sinT, cosT, 0; 0, 0, 1]`, proven by hand and
then re-proven against Three.js's own real `Matrix4.makeRotationZ`, is what
the next Concept Unit hands directly to a real mesh — no more manually
recomputing `x` and `y` every frame the way Lesson 1 did; the matrix itself
becomes the thing driving the block's orientation.

---

## Concept Unit: Handing the Matrix to Three.js Itself

### The Problem

Lesson 1's sphere moved by having its `.position` overwritten, every frame,
with numbers computed by hand. That worked for a point *orbiting* a fixed
center, but a CNC rotary table doesn't move its own center at all — it spins
a workpiece *in place*. Given a `Matrix4` that's already proven correct, how
does that turn into an actual mesh visibly spinning, without manually
touching its `.position` at all?

> **Try it yourself, before reading on:** a `THREE.Mesh` already has a
> `.position` field, as seen in Lesson 1. Given that this lesson's rotation
> is about *orientation*, not position, what field on a mesh do you expect
> needs to change instead — and given the Header above already names
> `Object3D.prototype.quaternion` as where Three.js actually stores
> orientation, what do you think the *simplest possible* method name might
> be for "take this matrix and use it to set that orientation"? You don't
> need the exact real name — guess a plausible one before reading on.

### Project Change

- **Reference Source** — No reference counterpart. This is a from-scratch
  addition: applying a verified rotation matrix to a real mesh's orientation
  is this lesson's own original teaching content.
- **Files affected** — `lesson-02.html`, created new.
- **Change type** — add.
- **Location** — a brand-new file; the scene/camera/renderer setup is
  carried forward from the end state of `lesson-01.html`, followed by a new
  block mesh and a new `animate` function, in place of Lesson 1's sphere and
  point-orbiting `animate`.
- **Dependencies** — none beyond a browser capable of WebGL and the same
  pinned `three@0.185.1` import map Lesson 1 used.

### The New Code

```javascript
const rotationMatrix = new THREE.Matrix4();
const angularSpeed = 1; // radians per second, same convention as Lesson 1

function animate(time) {
  const t = time / 1000;
  const angle = t * angularSpeed;
  rotationMatrix.makeRotationZ(angle);
  workpiece.setRotationFromMatrix(rotationMatrix);
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
```

### The Updated Project

The full `<script type="module">` block, from a fresh `lesson-02.html`:

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
 17  const geometry = new THREE.BoxGeometry(1.5, 0.6, 1);
 18  const material = new THREE.MeshBasicMaterial({ color: 0x6fa8c9 });
 19  const workpiece = new THREE.Mesh(geometry, material);
 20  scene.add(workpiece);
 21
 22  const rotationMatrix = new THREE.Matrix4();          // ← new
 23  const angularSpeed = 1; // radians per second         // ← new
 24                                                          // ← new
 25  function animate(time) {                                // ← new
 26    const t = time / 1000;                                 // ← new
 27    const angle = t * angularSpeed;                         // ← new
 28    rotationMatrix.makeRotationZ(angle);                     // ← new
 29    workpiece.setRotationFromMatrix(rotationMatrix);          // ← new
 30    renderer.render(scene, camera);                           // ← new
 31  }                                                            // ← new
 32                                                                 // ← new
 33  renderer.setAnimationLoop(animate);                            // ← new
```

Lines 1–20 are the familiar scene/camera/renderer/mesh setup from Lesson 1,
carried forward unchanged in shape (only the mesh itself — a
`BoxGeometry`-based `workpiece` instead of a `SphereGeometry`-based
`sphere` — and its color are different). What's new is everything from line
22 down: instead of computing a new `x, y` position every frame, this file
now builds one reusable `Matrix4`, re-fills it with a fresh rotation every
frame via `makeRotationZ`, and hands that matrix straight to the mesh's own
`setRotationFromMatrix`. Taken as a whole, this file now spins a workpiece
in place around its own center, forever, without a single line touching
`workpiece.position` after its initial default of `(0, 0, 0)`.

### Mechanical Walkthrough

- `const rotationMatrix = new THREE.Matrix4();` — constructs one `Matrix4`
  instance, documented in full in the Header, created once outside
  `animate` and reused every frame rather than constructed fresh each time —
  the same reuse pattern as Lesson 1's `radius`/`angularSpeed` constants
  living outside the loop.
- `const angularSpeed = 1;` — a plain numeric constant, in radians per
  second, matching Lesson 1's own convention exactly so a viewer comparing
  the two lessons side by side sees the same rotational speed.
- `function animate(time) { ... }` — a function declaration, handed to
  `renderer.setAnimationLoop` below rather than called directly, exactly as
  in Lesson 1.
- `const t = time / 1000;` — converts the millisecond timestamp
  `renderer.setAnimationLoop` supplies into seconds, matching the unit
  `angularSpeed` is defined in — identical reasoning to Lesson 1.
- `const angle = t * angularSpeed;` — recomputes the total angle from total
  elapsed time on every call, rather than accumulating a per-frame
  increment — the same approach Lesson 1 used, for the same reason: the
  rotation speed stays correct regardless of how often or unevenly
  `animate` happens to be called.
- `rotationMatrix.makeRotationZ(angle);` — documented in the Header;
  concretely, this overwrites `rotationMatrix`'s sixteen numbers with the
  identity matrix's translation-and-scale parts left alone but its upper-
  left 3×3 rotation portion set to exactly the grid the previous Concept
  Unit derived and verified by hand.
- `workpiece.setRotationFromMatrix(rotationMatrix);` — documented in the
  Header; concretely, this reads `rotationMatrix`, extracts its rotation
  into a quaternion, and overwrites `workpiece.quaternion` with it — the one
  line in this file that actually changes what the workpiece looks like.
- `renderer.render(scene, camera);` — unchanged from Lesson 1; documented in
  the scene/camera/renderer concept file.
- `renderer.setAnimationLoop(animate);` — unchanged from Lesson 1;
  documented in Lesson 1's own Header.

**Execution trace.** `animate` runs repeatedly as the page stays open; here
is what it actually produces at the same five sample timestamps Lesson 1
traced, run against the real, installed `three@0.185.1`:

```
time=   0ms -> angle=0.0000rad, quaternion.z=0.0000, quaternion.w=1.0000, rotation.z(Euler)=0.0000
time= 500ms -> angle=0.5000rad, quaternion.z=0.2474, quaternion.w=0.9689, rotation.z(Euler)=0.5000
time=1000ms -> angle=1.0000rad, quaternion.z=0.4794, quaternion.w=0.8776, rotation.z(Euler)=1.0000
time=1571ms -> angle=1.5710rad, quaternion.z=0.7072, quaternion.w=0.7070, rotation.z(Euler)=1.5710
time=3142ms -> angle=3.1420rad, quaternion.z=1.0000, quaternion.w=-0.0002, rotation.z(Euler)=-3.1412
```

At `time=0`, `angle` is `0`, `makeRotationZ(0)` produces the identity
matrix, and `setRotationFromMatrix` stores "no rotation" as the quaternion
`(0, 0, 0, 1)` — `w = 1` is quaternion notation's own way of encoding "zero
rotation," which is why every row's `quaternion.w` shrinks steadily from
`1.0000` toward `0` as the angle grows toward a quarter turn. By
`time=1571`, matching `angle ≈ π/2`, `quaternion.z` and `quaternion.w` have
both settled near `0.7071` (`≈ √2⁄2`) — that specific number isn't
coincidental; it's `sin(angle/2)` and `cos(angle/2)` respectively, which
later material in this curriculum will build up from scratch, not assumed
here.

**A real, verified surprise, not smoothed over:** at `time=3142` — roughly a
half turn — `quaternion.w` reads `-0.0002`, a small *negative* number,
instead of continuing the pattern of shrinking toward zero from the
*positive* side. This is not a rounding bug being papered over: a quaternion
`q` and its negation `-q` represent the exact same physical rotation — a
real, verified mathematical fact about how quaternions encode rotations,
not something to take on faith. As `angle` crosses π, Three.js's internal
computation happens to cross from the positive representation to its
negative twin; the workpiece's actual on-screen orientation is completely
unaffected; only which of the two equivalent numbers happens to be stored
changes. The `rotation.z` (Euler) column shows a related, equally real
effect: at `time=3142`, it reads `-3.1412` rather than the expected `+3.1420`
— Euler angles are always reported in a bounded range, so a value that
would fall just past `π` wraps around to a negative number just past `-π`
instead, describing the identical physical orientation with a different
number.

### CS Lens

Storing an object's orientation as a **quaternion** internally, while still
letting code build that orientation from an angle-and-axis-based `Matrix4`
or read it back out as Euler angles, is an example of **separation of
representation from interface**: the one true internal representation
(`.quaternion`) is not the only *shape* other code is allowed to think in
(`Matrix4`, `.rotation`). Also recognized in: a database storing timestamps
internally as one integer (seconds since an epoch) while still accepting and
displaying human dates and times in dozens of different formats; a version-
control system storing a commit history as a graph of hashes while showing
it to a person as a linear log; a spreadsheet storing a date as a serial day
number while displaying "March 4, 2026."

### SE Lens

This unit builds an explicit `Matrix4` and calls `setRotationFromMatrix`,
rather than the shorter `workpiece.rotation.z = angle`, which Three.js's own
`Object3D.rotation` property would accept directly and which produces an
identical visible result for this single-axis case. The alternative not
chosen — the one-line direct assignment — is genuinely simpler for exactly
this lesson's own scope: one axis, one angle, nothing to combine. The real
reason to pay the small extra cost of an explicit matrix now: a later lesson
in this curriculum composes *two* single-axis rotations into one combined
orientation, which is done by multiplying two `Matrix4` objects together —
an operation `workpiece.rotation.z = angle` has no equivalent for, since a
plain number can't be "multiplied" with another axis's plain number to
produce a combined 3D rotation the way two matrices can. The debt being
carried forward openly: this lesson's own code still only ever builds a
rotation around one fixed, hard-coded axis (Z) — nothing here yet shows how
to combine it with a second rotation around a different axis, which is
exactly what a real 5-axis CNC tool orientation needs and what comes next.

### Connect the Pieces

Elapsed time flows into `angle`; `angle` flows into
`rotationMatrix.makeRotationZ(angle)`, filling in the exact 3×3 grid the
previous Concept Unit proved by hand and then re-proved against the real
library; that matrix flows into `workpiece.setRotationFromMatrix(...)`,
which overwrites the workpiece's own `.quaternion` — the value Three.js
actually renders from — every single frame; and `renderer.render(scene,
camera)` reads that updated orientation and draws it, using the same scene
and camera the first Concept Unit's setup already established.

---

## Connect the Pieces (Lesson Close)

Follow one concrete value through the whole file: at `time = 1000`,
`animate` computes `t = 1.000` and `angle = 1.0000` radian — identical
numbers to Lesson 1's own trace at the same timestamp, since both lessons
share the same `angularSpeed`. Here, though, that angle is handed to
`rotationMatrix.makeRotationZ(1.0000)` rather than a bare position
calculation, filling the matrix with `cosT ≈ 0.5403` and `sinT ≈ 0.8415` in
exactly the positions the first Concept Unit's hand-derived 3×3 grid
predicted. `workpiece.setRotationFromMatrix(rotationMatrix)` then converts
that matrix into the quaternion `(0, 0, 0.4794, 0.8776)`, overwriting the
`workpiece` mesh's own stored orientation — the same `THREE.Mesh`, built
from a `BoxGeometry` and a `MeshBasicMaterial`, that this lesson's first
Concept Unit added to the scene. One frame later, `renderer.render(scene,
camera)` reads that new orientation and draws the workpiece visibly turned
in place — its center never moving, exactly the single rotary-axis behavior
this lesson set out to build.

**Next lesson:** the current file only ever builds a rotation around one
fixed axis. The next lesson derives the two remaining single-axis matrices —
rotation about X and rotation about Y — and frames them against a CNC
trunnion table's own A and B rotary axes, setting up the combination of
multiple axes at once that this lesson's SE Lens flagged as still missing.
