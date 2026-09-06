# Lesson 3: The Other Two Axes — Rotation About X and Y

**What you will build** — two workpiece blocks, side by side in the same
Three.js scene: one spinning continuously about the X axis, framed as a CNC
trunnion table's **A axis**, and the other spinning about the Y axis, its
**B axis** — both driven by brand-new rotation matrices, `Rx` and `Ry`,
derived the same way Lesson 2 derived `Rz`, and checked against Three.js's
own `Matrix4.makeRotationX`/`makeRotationY` for a real, easy-to-miss
sign-convention difference between the two.

**What you need to know first** — Lesson 2: the rotation-about-Z matrix,
`THREE.Matrix4`, `makeRotationZ`, `Object3D.setRotationFromMatrix`, and the
pattern of rebuilding one matrix per frame inside `animate`.

**Terms used in this lesson**
- **radian** — the unit an angle is measured in when defined as the ratio of
  arc length to radius. Still the only unit `Math.cos`/`Math.sin` accept.
- **trigonometric function** — sine or cosine, mapping an angle to a ratio
  describing a right triangle built from that angle — still the only source
  of the numbers a rotation matrix is built from.
- **rotation matrix** — a fixed grid of numbers turning any point's
  coordinates into that point's coordinates after being rotated by some
  angle around a fixed axis. This lesson builds two more of them — one per
  new axis — following the exact template the previous lesson used for `Rz`.
- **axis of rotation** — the one line that stays completely fixed while
  every other point turns around it. This lesson has two: the X axis for
  one workpiece, the Y axis for the other.
- **right-hand rule** — the convention that decides which of the two
  possible spin directions around a given axis counts as "positive." Point a
  right thumb along an axis's positive direction; the fingers curl in the
  direction a positive angle rotates. This exists because "rotate by +30°
  around X" is genuinely ambiguous without it — the same 30° could tip a
  point toward +Y or toward -Y depending which spin direction is called
  positive, and every point in this lesson's matrices, and every point
  Three.js itself computes, depends on one fixed, agreed answer to that
  question rather than a fresh guess per function.
- **cyclic permutation** — reordering a sequence by shifting every element
  one position over and wrapping the last back to the front — `(x, y, z)`
  becomes `(y, z, x)`, then `(z, x, y)`, then back to `(x, y, z)`. This
  matters here because the three rotation axes' own defining planes follow
  exactly this cycle, and that cycle — not a simple "copy the pattern and
  slide it over" — is what determines a real, verified sign difference this
  lesson's second Concept Unit uncovers between `Rx` and `Ry`.

**Objects and methods used**

*This lesson's own subject — the matrices themselves:*

- **`Math.cos`**
  - *What it is:* the cosine function, a static method on `Math`.
  - *Implementation:* `Math.cos(radians: number): number`, bounded between
    `-1` and `1`.
  - *Its use:* still the source of every rotation matrix entry describing
    how much of a coordinate survives unchanged along its own axis.
  - *Type:* a `static` method.
  - *Responsibility:* map radians to the x-coordinate of a unit-circle
    point; nothing about what that number is used for downstream.
  - *Depends on:* one numeric radians argument.
  - *Connects to:* called inside this lesson's throwaway `rotateX`/`rotateY`
    functions and inside Three.js's real `makeRotationX`/`makeRotationY`.
  - *Shape:* one float in, one float out.

- **`Math.sin`**
  - *What it is:* the sine function, `Math.cos`'s counterpart.
  - *Implementation:* `Math.sin(radians: number): number`, also bounded
    between `-1` and `1`.
  - *Its use:* the source of every off-diagonal-style entry, describing how
    much a coordinate leaks into the other axis sharing its rotation plane.
  - *Type:* a `static` method.
  - *Responsibility:* map radians to the y-coordinate of the same
    unit-circle point.
  - *Depends on:* one numeric radians argument.
  - *Connects to:* called alongside `Math.cos`, both in this lesson's
    throwaway labs and inside Three.js's real rotation-matrix methods.
  - *Shape:* one float in, one float out.

- **`Math.PI`**
  - *What it is:* a fixed numeric constant on `Math`, not a function.
  - *Implementation:* approximately `3.141592653589793`.
  - *Its use:* converts example angles stated in degrees into the radians
    `Math.cos`/`Math.sin` require.
  - *Type:* a constant property.
  - *Responsibility:* hold one fixed, correct value for π.
  - *Depends on:* nothing; not callable.
  - *Connects to:* used in this lesson's degree-to-radian conversions.
  - *Shape:* a single fixed floating-point number.

- **`THREE.Matrix4`**
  - *What it is:* a class representing a 4×4 matrix, the size Three.js uses
    for every rotation via homogeneous coordinates.
  - *Implementation:* `new THREE.Matrix4()` starts as the identity matrix;
    stores its sixteen numbers in `.elements`, column-major.
  - *Its use:* the same reusable container from the previous lesson —
    reused twice in this lesson's project file, once per axis, rather than
    two separate classes for "an X-rotation matrix" and "a Y-rotation
    matrix."
  - *Type:* a constructible class.
  - *Responsibility:* hold sixteen numbers representing one transform, and
    provide `make...` methods that fill them in for a specific named
    transform.
  - *Depends on:* nothing at construction.
  - *Connects to:* built once per mesh in this lesson's `animate` function;
    consumed by `setRotationFromMatrix` for each mesh in turn.
  - *Shape:* a flat 16-number array under the hood.

- **`Matrix4.prototype.makeRotationX(theta)`**
  - *What it is:* an instance method on `Matrix4` that overwrites its own
    numbers to represent "rotate by `theta` radians around the X axis."
  - *Implementation:* `makeRotationX(theta: number): this` — places
    `Math.cos(theta)`/`Math.sin(theta)` into the matrix's y-z block, leaving
    the x-row and x-column at the identity's own `1, 0, 0`.
  - *Its use:* the real, library-provided version of the hand-derived `Rx`
    this lesson's first Concept Unit builds and discards.
  - *Type:* an instance method.
  - *Responsibility:* encode a rotation around exactly one fixed axis (X),
    by exactly one angle — nothing about translation or scale.
  - *Depends on:* one numeric angle and the `Matrix4` instance it mutates.
  - *Connects to:* called once per frame for the A-axis mesh; its result
    flows directly into that mesh's own `setRotationFromMatrix` call.
  - *Shape:* takes one number, returns the same mutated `Matrix4`.

- **`Matrix4.prototype.makeRotationY(theta)`**
  - *What it is:* `makeRotationX`'s counterpart for the Y axis.
  - *Implementation:* `makeRotationY(theta: number): this` — places
    `Math.cos(theta)`/`Math.sin(theta)` into the matrix's x-z block, leaving
    the y-row and y-column at `0, 1, 0`. Critically, per this lesson's own
    second Concept Unit, the *sign* pattern of those placements is not a
    simple copy of `makeRotationX`'s — verified directly against the real
    library below, not assumed from the shape of the other two.
  - *Its use:* the real, library-provided version of the hand-derived `Ry`.
  - *Type:* an instance method.
  - *Responsibility:* encode a rotation around exactly the Y axis, by
    exactly one angle.
  - *Depends on:* one numeric angle and the `Matrix4` instance it mutates.
  - *Connects to:* called once per frame for the B-axis mesh; feeds that
    mesh's own `setRotationFromMatrix` call.
  - *Shape:* takes one number, returns the same mutated `Matrix4`.

- **`Object3D.prototype.setRotationFromMatrix(matrix)`**
  - *What it is:* an instance method, inherited by every mesh, that extracts
    a rotation from a `Matrix4` and stores it as the object's own quaternion.
  - *Implementation:* internally calls `this.quaternion.
    setFromRotationMatrix(m)` — the object's true stored orientation is
    always the resulting quaternion, never the `Matrix4` itself.
  - *Its use:* the one call, per mesh, that actually moves it on screen —
    called twice per frame in this lesson, once for each workpiece.
  - *Type:* an instance method.
  - *Responsibility:* update exactly one object's orientation from a given
    matrix; nothing about position or scale.
  - *Depends on:* one `Matrix4` argument.
  - *Connects to:* called from `animate`, once per mesh, immediately after
    that mesh's own `makeRotationX`/`makeRotationY` call.
  - *Shape:* takes one matrix, returns nothing; its effect is entirely the
    mutation of that mesh's `.quaternion`.

- **`Vector3.prototype.applyMatrix4(matrix)`**
  - *What it is:* an instance method on `THREE.Vector3` that transforms the
    vector's own coordinates by a given 4×4 matrix.
  - *Implementation:* `applyMatrix4(m: Matrix4): this` — mutates and returns
    the same instance.
  - *Its use:* used only in this lesson's isolated labs, to prove the
    hand-written `rotateX`/`rotateY` functions match Three.js's real
    `makeRotationX`/`makeRotationY` exactly.
  - *Type:* an instance method.
  - *Responsibility:* apply one matrix transform to one point.
  - *Depends on:* one `Matrix4` argument and the vector's current
    coordinates.
  - *Connects to:* called only in verification code — never in the real
    project file.
  - *Shape:* takes one matrix, mutates and returns the same `Vector3`.

*Scene setup and mesh construction — Three.js infrastructure, not this
lesson's own subject.* Explained in full in
[`threejs-scene-camera-renderer.md`](../src/docs/concepts/threejs-scene-camera-renderer.md)
and
[`threejs-mesh-from-geometry-and-material.md`](../src/docs/concepts/threejs-mesh-from-geometry-and-material.md),
both reused unchanged from the previous lesson.

**Everything else in the file, not this lesson's subject but still
explained:**

- **`renderer.setAnimationLoop(callback)`** — documented in full in Lesson
  1's Header; reused unchanged, now driving an `animate` function that
  updates two meshes instead of one.

---

## Concept Unit: Rotation About X — the Right-Hand Rule and the A Axis

### The Problem

The previous lesson's matrix, `Rz`, always left `z` untouched and turned `x`
and `y` into each other. A real CNC trunnion table often tilts a workpiece
about a *horizontal* axis instead — the machine's own A axis, aligned with
X — leaving `x` untouched this time and turning `y` and `z` into each other.
But a rotation needs more than "which axis stays fixed" — it needs a
direction. Tilting a workpiece by 30° about its A axis could mean tipping
its far edge up, or tipping it down; both are "30° about X."

> **Try it yourself, before reading on:** the previous lesson's `Rz` had a
> `1` sitting in the bottom-right corner of its 3×3 grid, in the row and
> column belonging to the one coordinate (`z`) that never changed. Given
> that this new matrix is supposed to leave `x` untouched instead, where do
> you predict the `1` goes this time — top-left, middle, or somewhere else?
> Which two of the three coordinates do you expect `cosT` and `sinT` to
> apply to, given the axis being rotated *around* is the one left alone? Now
> try the right-hand rule for real: point your right thumb to the right,
> along positive X, the way this curriculum's camera already treats it.
> Curl your fingers — do they sweep from +Y toward +Z, or from +Z toward
> +Y? Write down your prediction before checking it below.

### Introduce the Concept in Isolation

```javascript
function rotateX(x, y, z, theta) {
  const cosT = Math.cos(theta), sinT = Math.sin(theta);
  return { x, y: y * cosT - z * sinT, z: y * sinT + z * cosT };
}

const start = { x: 5, y: 2, z: 0 };
for (const deg of [0, 30, 90, 180]) {
  const r = rotateX(start.x, start.y, start.z, deg * Math.PI / 180);
  console.log(`theta=${deg}deg -> x=${r.x.toFixed(4)}, y=${r.y.toFixed(4)}, z=${r.z.toFixed(4)}`);
}
```

Real output:

```
theta=0deg -> x=5.0000, y=2.0000, z=0.0000
theta=30deg -> x=5.0000, y=1.7321, z=1.0000
theta=90deg -> x=5.0000, y=0.0000, z=2.0000
theta=180deg -> x=5.0000, y=-2.0000, z=0.0000
```

`x` reads `5.0000` on every row — exactly the "left untouched" behavior
predicted. At 90°, the point that started at `y=2, z=0` moves to `y=0,
z=2`: a positive rotation about X sweeps `+Y` toward `+Z`, confirming
one specific answer to the right-hand-rule question above. Written as a
grid, this is called the **rotation matrix about the X axis**:

```
[ 1     0       0    ]
[ 0    cosT   -sinT  ]
[ 0    sinT    cosT  ]
```

Compare this directly against the previous lesson's `Rz`:

```
[ cosT   -sinT    0 ]
[ sinT    cosT    0 ]
[   0       0     1 ]
```

The `1` has moved from the bottom-right corner to the top-left, and
`cosT`/`sinT` now occupy the *y-z* block instead of the *x-y* block — the
same template, slid over to leave a different coordinate alone.

One more check, against the real, installed library, before trusting it:

```javascript
import * as THREE from 'three';

const m = new THREE.Matrix4();
m.makeRotationX(30 * Math.PI / 180);
const p = new THREE.Vector3(5, 2, 0);
p.applyMatrix4(m);
console.log(`(5,2,0) rotated 30deg about X -> (${p.x.toFixed(4)}, ${p.y.toFixed(4)}, ${p.z.toFixed(4)})`);
```

Real output, against the actual pinned `three@0.185.1`:

```
(5,2,0) rotated 30deg about X -> (5.0000, 1.7321, 1.0000)
```

Matching `rotateX(5, 2, 0, 30°)`'s own result exactly.

### Discard the Throwaway Example

`rotateX` and its verification snippet are discarded. The real project uses
`THREE.Matrix4.makeRotationX` directly, now proven to agree with the
hand-derived version.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch teaching
  content.
- **Files affected** — `lesson-03.html`, created new.
- **Change type** — add.
- **Location** — a brand-new file; scene/camera/renderer setup carried
  forward from the previous lesson's end state, followed by one new mesh
  (the A-axis workpiece) and a new `animate` function.
- **Dependencies** — none beyond the same pinned `three@0.185.1` import map.

### The New Code

```javascript
const aAxisGeometry = new THREE.BoxGeometry(1.5, 0.6, 1);
const aAxisMaterial = new THREE.MeshBasicMaterial({ color: 0xc9a15a });
const aAxisWorkpiece = new THREE.Mesh(aAxisGeometry, aAxisMaterial);
aAxisWorkpiece.position.set(-2, 0, 0);
scene.add(aAxisWorkpiece);

const rotationMatrix = new THREE.Matrix4();
const angularSpeed = 1;

function animate(time) {
  const t = time / 1000;
  const angle = t * angularSpeed;

  rotationMatrix.makeRotationX(angle);
  aAxisWorkpiece.setRotationFromMatrix(rotationMatrix);

  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
```

### The Updated Project

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
 17  const aAxisGeometry = new THREE.BoxGeometry(1.5, 0.6, 1);      // ← new
 18  const aAxisMaterial = new THREE.MeshBasicMaterial({ color: 0xc9a15a }); // ← new
 19  const aAxisWorkpiece = new THREE.Mesh(aAxisGeometry, aAxisMaterial);    // ← new
 20  aAxisWorkpiece.position.set(-2, 0, 0);                                   // ← new
 21  scene.add(aAxisWorkpiece);                                               // ← new
 22
 23  const rotationMatrix = new THREE.Matrix4();                             // ← new
 24  const angularSpeed = 1;                                                  // ← new
 25
 26  function animate(time) {                                                // ← new
 27    const t = time / 1000;                                                 // ← new
 28    const angle = t * angularSpeed;                                        // ← new
 29
 30    rotationMatrix.makeRotationX(angle);                                   // ← new
 31    aAxisWorkpiece.setRotationFromMatrix(rotationMatrix);                   // ← new
 32
 33    renderer.render(scene, camera);                                        // ← new
 34  }                                                                         // ← new
 35
 36  renderer.setAnimationLoop(animate);                                      // ← new
```

Lines 1–15 are the unchanged scene/camera/renderer setup from every previous
lesson. What's new: a single workpiece, colored brass (`0xc9a15a`) to mark
it as an X-axis rotation for the rest of this curriculum, positioned two
units to the left of center, spinning about its own X axis every frame. The
next Concept Unit adds a second workpiece and a second matrix to this same
file, without touching what's already here.

### Mechanical Walkthrough

- `const aAxisGeometry = ...` / `aAxisMaterial` / `aAxisWorkpiece` — the same
  `BoxGeometry` → `MeshBasicMaterial` → `Mesh` pattern documented in full in
  the mesh concept file; the only lesson-specific choice is the color,
  `0xc9a15a`, this curriculum's new convention for an X-axis rotation.
- `aAxisWorkpiece.position.set(-2, 0, 0);` — documented in the mesh concept
  file; moves this mesh two units along -X from the default origin, purely
  so a second mesh, added in the next unit, has visible room beside it —
  this has no effect on the rotation itself, since `.position` and
  `.rotation`/`.quaternion` are independent fields on an `Object3D`.
- `scene.add(aAxisWorkpiece);` — documented in the mesh concept file.
- `const rotationMatrix = new THREE.Matrix4();` — documented in this
  lesson's Header; one reusable matrix, built once outside `animate`.
- `const angularSpeed = 1;` — same convention as every previous lesson.
- `function animate(time) { ... }` — a function declaration, handed to
  `renderer.setAnimationLoop` below.
- `const t = time / 1000;` / `const angle = t * angularSpeed;` — unchanged
  reasoning from the previous two lessons: convert milliseconds to seconds,
  then multiply by angular speed to get total angle from total elapsed
  time.
- `rotationMatrix.makeRotationX(angle);` — documented in the Header;
  concretely, overwrites `rotationMatrix`'s y-z block with the `cosT`/`sinT`
  pattern this unit just derived and verified by hand.
- `aAxisWorkpiece.setRotationFromMatrix(rotationMatrix);` — documented in
  the Header; the line that actually updates this mesh's own quaternion,
  and therefore what's visibly drawn.
- `renderer.render(scene, camera);` / `renderer.setAnimationLoop(animate);`
  — unchanged from every previous lesson.

**Execution trace**, at the same five sample timestamps used since Lesson
1, run against the real, installed library:

```
time=   0ms angle=0.0000rad -> A(X) quaternion = (0.0000, 0.0000, 0.0000, 1.0000)
time= 500ms angle=0.5000rad -> A(X) quaternion = (0.2474, 0.0000, 0.0000, 0.9689)
time=1000ms angle=1.0000rad -> A(X) quaternion = (0.4794, 0.0000, 0.0000, 0.8776)
time=1571ms angle=1.5710rad -> A(X) quaternion = (0.7072, 0.0000, 0.0000, 0.7070)
time=3142ms angle=3.1420rad -> A(X) quaternion = (1.0000, 0.0000, 0.0000, -0.0002)
```

Every non-zero value lands in the quaternion's own `x` field — never `y` or
`z` — at every single sample. That's not incidental: a rotation about the X
axis is, structurally, exactly the kind of rotation a quaternion's own `x`
component is built to represent, the same way Lesson 2's Z-axis rotation
put every non-zero value in the quaternion's `z` field. This lesson doesn't
yet explain *why* a quaternion's components line up with axes this cleanly
— a later lesson in this curriculum builds a quaternion from first
principles and answers that directly.

### CS Lens

`Rx` leaves exactly one coordinate — the one matching its own axis —
completely unchanged, encoding a rotation as "everything happens in the
plane perpendicular to this one fixed line." This structural idea, one
fixed axis with everything else rotating around it, is the same one behind
a mechanical gyroscope's inner gimbal ring, which stays fixed relative to
its own spin axis no matter how the outer rings are turned.

```
Also recognized in: a CNC trunnion table's own A axis (the direct
real-world source of this unit's framing), a robotic wrist's roll
joint, a doorknob's fixed hinge line, a wheel's axle, and Earth's own
axial tilt, around which every point on the planet's surface traces a
circle once per day.
```

### SE Lens

`Rx` was built here by taking `Rz`'s exact template — one axis's row and
column set to `1, 0, 0`, the other two filled with `cosT`/`sinT` — and
sliding it to a different axis, rather than writing one general-purpose
"rotate by this angle around any axis" function from scratch. The
alternative — a single generalized function taking an arbitrary axis as an
argument — would remove the need for three near-identical, axis-specific
matrix builders. It was not chosen here because that generalized version
(known as Rodrigues' rotation formula) is genuinely harder to derive and
reason about correctly on a first pass; building the three simplest cases by
hand first is what makes the general version's structure recognizable later,
rather than opaque. The debt being carried forward openly: this file will
soon contain three separate, hard-coded, axis-specific matrix calls
(`makeRotationX`, `makeRotationY`, and the previous lesson's
`makeRotationZ`) with no way yet to rotate about an axis that isn't exactly
X, Y, or Z.

### Connect the Pieces

The X-left-alone pattern this unit derives and verifies is what the next
unit immediately contrasts against a Y-left-alone version — the same
template, once more, but this time with a real, verified surprise in
exactly which entry gets the minus sign.

---

## Concept Unit: Rotation About Y — the Twist in the Pattern

### The Problem

`Rz` leaves the x-y block with `-sinT` above the diagonal and `+sinT` below.
`Rx` leaves the y-z block with the identical sign arrangement — `-sinT`
above, `+sinT` below. If a rotation about Y just slides the same template
into the x-z block, does it keep that same sign arrangement too?

> **Try it yourself, before reading on:** write out the three coordinate
> letters in order — `x, y, z` — then cross out `y`, since that's the axis
> Y-rotation leaves fixed. What's left is `x` and `z`, in that order. Now
> recall the **cyclic permutation** this lesson's Terms glossary just
> defined: `x → y → z → x`, wrapping around. In that cycle, does `z` come
> right before `x`, or right after it? Given `Rz`'s own fixed-alone axis
> (`z`) is preceded by `y` and followed by `x` in that same cycle, and
> `Rx`'s fixed-alone axis (`x`) is preceded by `z` and followed by `y` — do
> you expect Y's own case to preserve that same "preceded-by, followed-by"
> pattern, or to break it? Predict, in words, whether `Ry`'s sign
> arrangement will match `Rx`/`Rz`'s, or flip — before checking below.

### Introduce the Concept in Isolation

```javascript
function rotateY(x, y, z, theta) {
  const cosT = Math.cos(theta), sinT = Math.sin(theta);
  return { x: x * cosT + z * sinT, y, z: -x * sinT + z * cosT };
}

const start = { x: 5, y: 0, z: 2 };
for (const deg of [0, 30, 90, 180]) {
  const r = rotateY(start.x, start.y, start.z, deg * Math.PI / 180);
  console.log(`theta=${deg}deg -> x=${r.x.toFixed(4)}, y=${r.y.toFixed(4)}, z=${r.z.toFixed(4)}`);
}
```

Real output:

```
theta=0deg -> x=5.0000, y=0.0000, z=2.0000
theta=30deg -> x=5.3301, y=0.0000, z=-0.7679
theta=90deg -> x=2.0000, y=0.0000, z=-5.0000
theta=180deg -> x=-5.0000, y=0.0000, z=-2.0000
```

`y` reads `0.0000` throughout, confirming it's left alone as expected. But
look at the *sign* placement needed to make this come out right:
`xNew = x*cosT + z*sinT` uses a **plus** where `Rx`'s analogous line used a
**minus**, and `zNew = -x*sinT + z*cosT` carries the minus sign on the
*other* term instead. Written as a grid, this is the **rotation matrix
about the Y axis**:

```
[ cosT    0    sinT ]
[  0      1     0   ]
[-sinT    0    cosT ]
```

Set directly beside `Rx` and `Rz`:

```
Rx = [ 1     0       0    ]      Ry = [ cosT    0    sinT ]      Rz = [ cosT   -sinT    0 ]
     [ 0    cosT   -sinT  ]           [  0      1     0   ]           [ sinT    cosT    0 ]
     [ 0    sinT    cosT  ]           [-sinT    0    cosT ]           [   0       0     1 ]
```

`Rx` and `Rz` both put `-sinT` in the upper-right of their active 2×2 block
and `+sinT` in the lower-left. `Ry` has it backwards: `+sinT` upper-right,
`-sinT` lower-left. This is exactly the answer the cyclic-permutation
question above was pointing toward: in the cycle `x → y → z → x`, `x`'s
"next" axis is `y` and its "previous" is `z`; `z`'s "next" is `x` and its
"previous" is `y` — both follow the cycle's own forward direction when read
as (previous, current, next). `y`'s case breaks that surface symmetry only
because of the order `x` and `z` happen to be written in conventional
`(x, y, z)` notation — `z` comes *before* `x` in the cycle, but appears
*after* it alphabetically — and building the matrix in that standard axis
order is what flips the sign relative to the other two, even though the
underlying rotation direction, defined consistently by the right-hand rule
for every axis, never actually changes.

Checked against the real, installed library:

```javascript
const mX = new THREE.Matrix4(); mX.makeRotationX(30 * Math.PI / 180);
const mY = new THREE.Matrix4(); mY.makeRotationY(30 * Math.PI / 180);
console.log('Rx.elements:', mX.elements.map(v => v.toFixed(4)));
console.log('Ry.elements:', mY.elements.map(v => v.toFixed(4)));
```

Real output (column-major, per Lesson 2's own verified convention):

```
Rx.elements: [1.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.8660, 0.5000, 0.0000, 0.0000, -0.5000, 0.8660, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000]
Ry.elements: [0.8660, 0.0000, -0.5000, 0.0000, 0.0000, 1.0000, 0.0000, 0.0000, 0.5000, 0.0000, 0.8660, 0.0000, 0.0000, 0.0000, 0.0000, 1.0000]
```

Reading `Rx`'s elements column by column confirms `-0.5000` (that's `-sinT`
at 30°) sits in its second column, third row — the lower-left of its active
block. `Ry`'s `-0.5000` sits in its first column, third row instead — the
same lower-left position relative to *its own* block, but the overall
pattern, read left-to-right in conventional `x, y, z` order, really is
flipped from `Rx`'s, exactly as the hand-derived grids above predicted. This
was checked, not assumed: a library this curriculum depends on for the rest
of its lessons really does implement this real, easy-to-get-wrong
convention correctly.

### Discard the Throwaway Example

`rotateY` and its verification snippets are discarded. The real project
uses `THREE.Matrix4.makeRotationY` directly.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch teaching
  content.
- **Files affected** — `lesson-03.html`, modified.
- **Change type** — add.
- **Location** — inside the existing `<script type="module">` block: a new
  mesh added after `aAxisWorkpiece`'s setup, and `animate` extended with a
  second matrix build and a second `setRotationFromMatrix` call.
- **Dependencies** — the previous Concept Unit's `aAxisWorkpiece`,
  `rotationMatrix`, and `animate` must already exist in the file.

### The New Code

```javascript
const bAxisGeometry = new THREE.BoxGeometry(1.5, 0.6, 1);
const bAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x6fae7c });
const bAxisWorkpiece = new THREE.Mesh(bAxisGeometry, bAxisMaterial);
bAxisWorkpiece.position.set(2, 0, 0);
scene.add(bAxisWorkpiece);
```

```javascript
  rotationMatrix.makeRotationY(angle);
  bAxisWorkpiece.setRotationFromMatrix(rotationMatrix);
```

### The Updated Project

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
 17  const aAxisGeometry = new THREE.BoxGeometry(1.5, 0.6, 1);
 18  const aAxisMaterial = new THREE.MeshBasicMaterial({ color: 0xc9a15a });
 19  const aAxisWorkpiece = new THREE.Mesh(aAxisGeometry, aAxisMaterial);
 20  aAxisWorkpiece.position.set(-2, 0, 0);
 21  scene.add(aAxisWorkpiece);
 22
 23  const bAxisGeometry = new THREE.BoxGeometry(1.5, 0.6, 1);           // ← new
 24  const bAxisMaterial = new THREE.MeshBasicMaterial({ color: 0x6fae7c }); // ← new
 25  const bAxisWorkpiece = new THREE.Mesh(bAxisGeometry, bAxisMaterial);    // ← new
 26  bAxisWorkpiece.position.set(2, 0, 0);                                   // ← new
 27  scene.add(bAxisWorkpiece);                                              // ← new
 28
 29  const rotationMatrix = new THREE.Matrix4();
 30  const angularSpeed = 1;
 31
 32  function animate(time) {
 33    const t = time / 1000;
 34    const angle = t * angularSpeed;
 35
 36    rotationMatrix.makeRotationX(angle);
 37    aAxisWorkpiece.setRotationFromMatrix(rotationMatrix);
 38
 39    rotationMatrix.makeRotationY(angle);                                  // ← new
 40    bAxisWorkpiece.setRotationFromMatrix(rotationMatrix);                  // ← new
 41
 42    renderer.render(scene, camera);
 43  }
 44
 45  renderer.setAnimationLoop(animate);
```

The single `rotationMatrix` object from the previous unit is reused here,
not replaced with a second `Matrix4` — line 36 fills it with the X rotation
and immediately hands it to `aAxisWorkpiece` before line 39 overwrites those
same sixteen numbers with the Y rotation for `bAxisWorkpiece`. As a whole,
`animate` now updates two independent meshes every frame, each reading the
same one matrix object at a different moment in its lifetime, before it's
render time — line 42 draws both new orientations in the same frame.

### Mechanical Walkthrough

- `const bAxisGeometry` / `bAxisMaterial` / `bAxisWorkpiece` — identical
  pattern to `aAxisWorkpiece`, documented in the mesh concept file; color
  `0x6fae7c`, this curriculum's new convention for a Y-axis rotation.
- `bAxisWorkpiece.position.set(2, 0, 0);` — places this mesh two units along
  +X, mirroring `aAxisWorkpiece`'s placement along -X, so the two sit
  visibly side by side.
- `scene.add(bAxisWorkpiece);` — documented in the mesh concept file.
- `rotationMatrix.makeRotationY(angle);` — documented in this lesson's
  Header; overwrites the *same* `rotationMatrix` object `aAxisWorkpiece`'s
  line just finished reading, with the y-axis pattern this unit derived.
- `bAxisWorkpiece.setRotationFromMatrix(rotationMatrix);` — documented in
  the Header; reads `rotationMatrix` at this exact moment — after it's been
  overwritten with the Y rotation, not the earlier X one — and stores the
  result on `bAxisWorkpiece`'s own quaternion. This ordering is not
  incidental: because `aAxisWorkpiece`'s `setRotationFromMatrix` call
  already ran and finished on line 37, reusing the same matrix object here
  is safe — each mesh reads the matrix's contents at its own turn, before
  the next overwrite happens.

**Execution trace**, both meshes, same five sample timestamps:

```
time=   0ms angle=0.0000rad | A(X) quat=(0.0000,0.0000,0.0000,1.0000) | B(Y) quat=(0.0000,0.0000,0.0000,1.0000)
time= 500ms angle=0.5000rad | A(X) quat=(0.2474,0.0000,0.0000,0.9689) | B(Y) quat=(0.0000,0.2474,0.0000,0.9689)
time=1000ms angle=1.0000rad | A(X) quat=(0.4794,0.0000,0.0000,0.8776) | B(Y) quat=(0.0000,0.4794,0.0000,0.8776)
time=1571ms angle=1.5710rad | A(X) quat=(0.7072,0.0000,0.0000,0.7070) | B(Y) quat=(0.0000,0.7072,0.0000,0.7070)
time=3142ms angle=3.1420rad | A(X) quat=(1.0000,0.0000,0.0000,-0.0002) | B(Y) quat=(0.0000,1.0000,0.0000,-0.0002)
```

Both meshes receive the identical `angle` every frame, computed once and
reused for both `makeRotationX` and `makeRotationY` calls — the trace's `A`
and `B` columns differ only in *which* quaternion component (`x` for A,
`y` for B) carries the non-zero value, never in the underlying angle or
timing. This confirms the two meshes spin at the exact same rate, around
their own distinct axes, in lock-step — a deliberate choice for this lesson,
making it easy to see that any visible difference between them comes purely
from *which axis*, not from any difference in speed or timing.

### CS Lens

The flipped sign this unit found is a direct, concrete instance of a
**cyclic permutation**'s effect on a fixed, non-cyclic notation. `x, y, z`
is written in a straight line, but the rotation axes' own relationship to
each other is a *cycle*, with no fixed "first" or "last" — `x`'s neighbor on
one side is `y`, but its neighbor on the other side is `z`, wrapping past
the end of the alphabetical list back to the start. Whenever a cyclic
structure gets written down using a linear, alphabetic, or numeric ordering
that doesn't itself wrap around, exactly one of the three pairwise
relationships ends up looking "backwards" relative to the other two — not
because anything is actually wrong, but because the notation's own straight
line has to break the cycle somewhere.

```
Also recognized in: RGB color-channel cycling in image-processing code
(red → green → blue → red), modular clock arithmetic (11 → 12 → 1,
not 11 → 12 → 13), cyclic permutation groups in abstract algebra, and
crystallographic three-fold symmetry axes in materials science.
```

### SE Lens

This unit chose to derive `Ry` independently and then *compare* it against
`Rx`/`Rz` side by side, rather than writing `Ry` by mechanically copying
`Rx`'s code and search-and-replacing `y` for `x`, `z` for `y`. A pure
find-and-replace approach would have silently produced the *wrong* sign
pattern — a real, easy-to-make mistake that would still compile, still run,
and still rotate something on screen, just around the wrong effective
direction for one axis relative to the other two. The cost of catching this
now, by deriving from real geometric first principles and checking against
the actual library, is small: a few extra lines of comparison in this one
lesson. The cost of *not* catching it would compound directly into the next
lesson, which multiplies rotation matrices together to combine axes — a
single flipped sign in one matrix would make composed rotations come out
subtly, confusingly wrong in a way that's much harder to trace back to its
source once two matrices are already multiplied together.

### Connect the Pieces

Two independent single-axis rotations, `Rx` and `Ry`, now spin two separate
meshes side by side, each built and verified the same careful way as the
previous lesson's `Rz` — but so far, nothing in this file combines two axes
on the *same* object. The next lesson does exactly that: multiplying two of
these matrices together, and discovering that the order they're multiplied
in changes the answer.

---

## Connect the Pieces (Lesson Close)

Follow one concrete value through both halves of the file: at
`time = 1000`, `animate` computes `angle = 1.0000` radian, exactly as in
every previous lesson at this timestamp. That single angle is handed first
to `rotationMatrix.makeRotationX(1.0000)`, producing the matrix this
lesson's first Concept Unit derived and verified, which
`aAxisWorkpiece.setRotationFromMatrix(...)` converts into the quaternion
`(0.4794, 0, 0, 0.8776)` — updating the brass-colored mesh built in that
same unit. The identical angle is then handed to
`rotationMatrix.makeRotationY(1.0000)`, overwriting the same matrix object
with the second unit's own derived-and-verified pattern, which
`bAxisWorkpiece.setRotationFromMatrix(...)` converts into `(0, 0.4794, 0,
0.8776)` for the green-colored mesh. One frame later,
`renderer.render(scene, camera)` — using the same scene and camera Lesson 1
first built — draws both updated orientations at once: two workpieces,
spinning at identical speed around two genuinely different, independently
verified axes.

**Next lesson:** the current file only ever applies one matrix to one mesh
at a time. The next lesson multiplies two of these matrices together to
apply *both* rotations to a *single* object, and shows directly — not just
states — that `Rx · Ry` and `Ry · Rx` produce two different final
orientations from the exact same two angles.
