# Lesson 4: Composing Rotations — Matrix Multiplication and Order

**What you will build** — two workpiece blocks, side by side, both spinning
under the exact same two angles — one rotation about X, one about Y — but
combined in opposite orders: one block gets "rotate about X, then about Y,"
the other gets "rotate about Y, then about X." Both orders use the identical
two single-axis matrices from the previous lesson; the only difference is
the order they're multiplied in. The transferable problem: proving,
concretely, that this order is not a cosmetic detail — it changes where a
point ends up, every time the two axes aren't the same one.

**What you need to know first** — Lesson 3: the rotation-about-X and
rotation-about-Y matrices (`Rx`, `Ry`), `Matrix4.makeRotationX`/
`makeRotationY`, and `Object3D.setRotationFromMatrix`.

**Terms used in this lesson**
- **rotation matrix** — a fixed grid of numbers turning any point's
  coordinates into that point's coordinates after being rotated by some
  angle around a fixed axis. This lesson doesn't build a new one from
  scratch; it combines two already-built ones (`Rx` and `Ry`) into a third.
- **axis of rotation** — the one line that stays fixed while everything else
  turns around it. `Rx` and `Ry` each still have their own single axis; the
  *combined* matrix this lesson builds generally does not have a single
  clean axis of its own at all — a fact this lesson doesn't prove but flags,
  since a later lesson in this curriculum is dedicated entirely to a
  representation built around exactly that question.
- **matrix multiplication** — combining two matrices into a single new
  matrix that has the same overall effect as applying one transform and then
  the other. It exists so that "rotate about X, then about Y" can be
  represented and reused as *one* matrix, rather than requiring two separate
  matrix-vector multiplications every single time a transformed point is
  needed.
- **composition** — the general idea of applying one transform after
  another to produce a single net transform, independent of *how* that net
  transform gets computed. Matrix multiplication is the specific mechanism
  this lesson uses to compute a composition's matrix directly; the two words
  aren't interchangeable — "composition" names the concept, "matrix
  multiplication" names this lesson's tool for it.
- **commutative** — a property an operation has when swapping the order of
  its two inputs never changes the result; ordinary number addition is
  commutative, since `3 + 5` and `5 + 3` are the same. An operation that
  lacks this property is called **non-commutative** — order matters, and
  swapping the inputs can produce a genuinely different answer. This
  lesson's central, concrete discovery is that composing two rotations is
  non-commutative in general.

**Objects and methods used**

*This lesson's own subject — combining two matrices into one:*

- **`THREE.Matrix4`**
  - *What it is:* a class representing a 4×4 matrix, reused here as the
    type of all four matrices this lesson works with: two single-axis
    inputs and two differently-ordered combined results.
  - *Implementation:* `new THREE.Matrix4()` starts as the identity matrix;
    stores its numbers in `.elements`, column-major.
  - *Its use:* this lesson constructs four separate instances — one per
    single axis, one per combination order — rather than reusing a single
    instance the way Lesson 3 reused one matrix across two sequential
    `setRotationFromMatrix` calls, because both combined results are needed
    at once, in the same frame, to compare them.
  - *Type:* a constructible class.
  - *Responsibility:* hold sixteen numbers representing one transform.
  - *Depends on:* nothing at construction.
  - *Connects to:* two instances (`matrixX`, `matrixY`) are filled by
    `makeRotationX`/`makeRotationY`; two more (`combinedXY`, `combinedYX`)
    are filled by combining those first two, in opposite orders, via this
    lesson's own new method below.
  - *Shape:* a flat 16-number array under the hood.

- **`Matrix4.prototype.makeRotationX(theta)`** — documented in full in
  Lesson 3's Header; reused here unchanged, filling `matrixX` with the
  rotation-about-X pattern that lesson derived and verified.

- **`Matrix4.prototype.makeRotationY(theta)`** — documented in full in
  Lesson 3's Header; reused here unchanged, filling `matrixY` with the
  rotation-about-Y pattern that lesson derived and verified.

- **`Matrix4.prototype.multiplyMatrices(a, b)`**
  - *What it is:* an instance method on `Matrix4` that overwrites the
    matrix it's called on with the product of two *other* matrices, leaving
    both of those inputs unchanged.
  - *Implementation:* `multiplyMatrices(a: Matrix4, b: Matrix4): this` —
    computes the standard row-by-column matrix product of `a` and `b` and
    stores the result in `this`, distinct from either argument.
  - *Its use:* this is the one call that actually combines two single-axis
    rotations into a single matrix representing "do `b`'s rotation, then
    `a`'s" — the mechanism this entire lesson exists to demonstrate.
  - *Type:* an instance method.
  - *Responsibility:* compute one matrix product and store it in a specific
    target, without mutating either input — a deliberate design choice
    checked directly against the real library rather than assumed: Three.js
    also provides an in-place `multiply` method (`a.multiply(b)` meaning
    `a = a * b`), and that in-place version is even safe to call as
    `m.multiply(m)`, combining a matrix with itself, verified directly
    against the real library rather than trusted from a guess about how it
    might be implemented. This lesson still prefers writing the result into
    a separate matrix regardless, because keeping "the two ingredients" and
    "the combined result" as visually distinct variables matters when two
    different combination orders are being compared side by side in the
    same file.
  - *Depends on:* two `Matrix4` arguments, read but not modified.
  - *Connects to:* called twice per frame in this lesson's `animate`
    function — once as `combinedXY.multiplyMatrices(matrixX, matrixY)`,
    once as `combinedYX.multiplyMatrices(matrixY, matrixX)` — with the same
    two source matrices, in reversed argument order, each result flowing
    into its own mesh's `setRotationFromMatrix` call.
  - *Shape:* takes two matrices, returns the same (mutated) instance it was
    called on — never a new object, and never touching its two arguments.

- **`Object3D.prototype.setRotationFromMatrix(matrix)`** — documented in
  full in Lesson 2's Header; reused here unchanged, called once per mesh,
  each reading one of this lesson's two differently-ordered combined
  matrices.

- **`Vector3.prototype.applyMatrix4(matrix)`** — documented in full in
  Lesson 2's Header; used only in this lesson's isolated lab, applying both
  combined matrices to the same starting point to show their differing
  results as concrete numbers, not just differing matrices.

*Scene setup and mesh construction — Three.js infrastructure, not this
lesson's own subject.* Explained in full in
[`threejs-scene-camera-renderer.md`](../src/docs/concepts/threejs-scene-camera-renderer.md)
and
[`threejs-mesh-from-geometry-and-material.md`](../src/docs/concepts/threejs-mesh-from-geometry-and-material.md).

**Everything else in the file, not this lesson's subject but still
explained:**

- **`renderer.setAnimationLoop(callback)`** — documented in full in Lesson
  1's Header; reused unchanged.

---

## Concept Unit: Combining Two Rotations Into One Matrix

### The Problem

The previous lesson ended with two separate meshes, each spinning under its
own single matrix. A real CNC 5-axis tool orientation is rarely that simple
— a tool is often tilted about *two* rotary axes at once, and the final
orientation depends on both. Given two already-built rotation matrices,
`Rx` and `Ry`, how do you compute the *one* matrix representing "do both, in
some specific order" — without recomputing every point's position twice,
once per matrix, every single time?

> **Try it yourself, before reading on:** if a workpiece is first tilted 30°
> about X, and *then* the whole tilted workpiece is rotated 45° about Y,
> does that end up looking the same as tilting it 45° about Y first and
> *then* 30° about X? Picture a book lying flat on a table: tip it forward
> (rotate about a horizontal axis running left-right), then spin it
> clockwise as seen from above (rotate about the vertical axis). Now instead
> spin it clockwise first, then tip it forward. Does the book end up facing
> the same way both times? Try to answer from physical intuition, using
> nothing but the book (or your two hands, held flat), before reading the
> next section.

### Introduce the Concept in Isolation

Two rotation matrices, at fixed angles, restated as plain number grids using
the already-derived `Rx`/`Ry` patterns from the previous lesson (`cos 30° ≈
0.8660`, `sin 30° = 0.5000`, `cos 45° ≈ 0.7071`, `sin 45° ≈ 0.7071`):

```javascript
const Rx30 = [
  [1, 0, 0],
  [0, 0.8660, -0.5000],
  [0, 0.5000, 0.8660],
];

const Ry45 = [
  [0.7071, 0, 0.7071],
  [0, 1, 0],
  [-0.7071, 0, 0.7071],
];

function multiply3(A, B) {
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) {
        sum += A[row][k] * B[k][col];
      }
      C[row][col] = sum;
    }
  }
  return C;
}

function applyMatrix3(M, x, y, z) {
  return {
    x: M[0][0] * x + M[0][1] * y + M[0][2] * z,
    y: M[1][0] * x + M[1][1] * y + M[1][2] * z,
    z: M[2][0] * x + M[2][1] * y + M[2][2] * z,
  };
}

const RxRy = multiply3(Rx30, Ry45); // Rx * Ry
const RyRx = multiply3(Ry45, Rx30); // Ry * Rx

console.log('Rx*Ry =', RxRy.map(row => row.map(v => v.toFixed(4))));
console.log('Ry*Rx =', RyRx.map(row => row.map(v => v.toFixed(4))));
```

Real output:

```
Rx*Ry = [ [ '0.7071', '0.0000', '0.7071' ], [ '0.3536', '0.8660', '-0.3536' ], [ '-0.6124', '0.5000', '0.6124' ] ]
Ry*Rx = [ [ '0.7071', '0.3536', '0.6124' ], [ '0.0000', '0.8660', '-0.5000' ], [ '-0.7071', '0.3536', '0.6124' ] ]
```

These two grids are not the same matrix — not even close, in most of their
nine entries. This combining operation is called **matrix multiplication**,
and `multiply3` above is exactly what it means, mechanically: each entry of
the result is a sum of products, one row of `A` matched against one column
of `B`.

The next question is what this combined matrix actually *does* to a real
point — and specifically, whether `Rx*Ry` applied once really does match
applying `Ry` first and then `Rx` on the already-rotated result:

```javascript
const point = { x: 3, y: 1, z: 0 };

const combined = applyMatrix3(RxRy, point.x, point.y, point.z);

const afterRyOnly = applyMatrix3(Ry45, point.x, point.y, point.z);
const sequential = applyMatrix3(Rx30, afterRyOnly.x, afterRyOnly.y, afterRyOnly.z);

console.log('(Rx*Ry) applied directly:', { x: combined.x.toFixed(4), y: combined.y.toFixed(4), z: combined.z.toFixed(4) });
console.log('Rx applied to (Ry applied to point):', { x: sequential.x.toFixed(4), y: sequential.y.toFixed(4), z: sequential.z.toFixed(4) });
```

Real output:

```
(Rx*Ry) applied directly: { x: '2.1213', y: '1.9267', z: '-1.3371' }
Rx applied to (Ry applied to point): { x: '2.1213', y: '1.9267', z: '-1.3371' }
```

Identical, to four decimal places. This proves — not just states — the rule
this lesson relies on for everything after it: multiplying `Rx * Ry` and
applying the result once gives the exact same point as applying `Ry` *first*
and then applying `Rx` to that result. Reading a matrix product `A * B`
right to left — `B` happens first, `A` second — is not an arbitrary
convention to memorize; it falls directly out of how the multiplication
itself is defined, as just verified above.

One more check, against the real, installed library, before trusting it for
the real project:

```javascript
import * as THREE from 'three';

const rx = new THREE.Matrix4().makeRotationX(30 * Math.PI / 180);
const ry = new THREE.Matrix4().makeRotationY(45 * Math.PI / 180);
const combinedReal = new THREE.Matrix4().multiplyMatrices(rx, ry);

const p = new THREE.Vector3(3, 1, 0);
p.applyMatrix4(combinedReal);
console.log('Real Matrix4: Rx*Ry applied to (3,1,0):', p.x.toFixed(4), p.y.toFixed(4), p.z.toFixed(4));
```

Real output:

```
Real Matrix4: Rx*Ry applied to (3,1,0): 2.1213 1.9267 -1.3371
```

Matching the hand-computed result exactly.

### Discard the Throwaway Example

`multiply3`, `applyMatrix3`, and the literal `Rx30`/`Ry45` grids are
discarded. The real project builds its matrices from live angles via
`makeRotationX`/`makeRotationY`, and combines them with the real library's
own `multiplyMatrices`, now proven to agree with hand computation.

### CS Lens

Matrix multiplication representing "do this transform, then that one" is
the concrete mechanism behind **function composition** — building one new
function out of two existing ones by feeding one's output into the other's
input. Just as `f(g(x))` composes two ordinary functions into a new one,
`A * B` composes two matrix transforms into a new one, and the proof above
— that `(A*B)` applied once matches `A` applied to `B`'s own result — is
exactly the matrix version of what function composition already means.

```
Also recognized in: chaining array methods like map then filter in
JavaScript (order changes the result there too), function composition
in category theory and functional programming, layered image filters in
photo-editing software (blur-then-sharpen looks different from
sharpen-then-blur), and multi-step chemical reactions where reagent
order determines the final product.
```

### SE Lens

This unit computes `Rx*Ry` two different ways — once as a single matrix
product, once as two sequential point transformations — specifically to
*prove* they agree, rather than asserting the right-to-left reading
convention and moving on. The alternative, cheaper approach — stating "matrix
multiplication represents composition, trust me" — would have been faster
to write, but would leave no way to notice if this lesson had the reading
direction backwards. The real payoff of catching a convention error here,
before it's used: the next unit builds two *differently ordered* products,
`Rx*Ry` and `Ry*Rx`, specifically to show they differ — if the reading
convention itself were wrong, that comparison would still "work" in the
sense of running without errors, while silently testing the wrong claim.

### Connect the Pieces

The proof that `(Rx*Ry)` applied once matches `Rx` applied to `Ry`'s own
result is what makes the next unit's central comparison meaningful: if
`Rx*Ry` and `Ry*Rx` turn out to be different matrices, that difference isn't
an artifact of how they're computed — it's a real, physical difference in
the rotation each one performs.

---

## Concept Unit: Order Changes the Answer — Non-Commutativity

### The Problem

The previous unit proved matrix multiplication faithfully represents "do
one rotation, then the other." It did not yet check whether doing them in
the *opposite* order gives the same final result. For ordinary number
multiplication, `3 * 5` and `5 * 3` are identical — does the same hold for
rotation matrices?

> **Try it yourself, before reading on:** recall the book from the previous
> unit's Socratic prompt. If your own hands-on test there already suggested
> the two orders end up facing differently, try to say *why*, using only
> what's already been established: after the *first* rotation in either
> order, is the book still sitting in the exact same orientation it was
> before that first rotation? If not, what does that imply about which axis
> the *second* rotation actually turns it around — the same fixed axis it
> would have used originally, or a version of that axis that's now
> pointing somewhere new, because the book underneath it already moved?

### Introduce the Concept in Isolation

Continuing directly from the previous unit's already-computed `RxRy` and
`RyRx` grids:

```javascript
const point = { x: 3, y: 1, z: 0 };
const resultXY = applyMatrix3(RxRy, point.x, point.y, point.z);
const resultYX = applyMatrix3(RyRx, point.x, point.y, point.z);

console.log('Rx*Ry applied to (3,1,0):', { x: resultXY.x.toFixed(4), y: resultXY.y.toFixed(4), z: resultXY.z.toFixed(4) });
console.log('Ry*Rx applied to (3,1,0):', { x: resultYX.x.toFixed(4), y: resultYX.y.toFixed(4), z: resultYX.z.toFixed(4) });
```

Real output:

```
Rx*Ry applied to (3,1,0): { x: '2.1213', y: '1.9267', z: '-1.3371' }
Ry*Rx applied to (3,1,0): { x: '2.4749', y: '0.8660', z: '-1.7678' }
```

Two genuinely different points — not close, not a rounding difference. The
exact same two rotations, the exact same starting point, produce two
different answers depending on which order they're combined in. This
property — where swapping the order of an operation's two inputs changes
the result — is called **non-commutative**; rotation composition, this
lesson's central discovery, is non-commutative in general. (It is *not*
non-commutative in every case — two rotations sharing the exact same axis
always commute, since they're really just adding two angles together on a
single 2D circle, the same way the previous three lessons' single-axis
rotations never needed to worry about order at all.)

Verified once more against the real, installed library, applying both
combined matrices to a point standing in for a tool tip 2 units out along
local +Z:

```javascript
const testPointXY = new THREE.Vector3(0, 0, 2);
const testPointYX = new THREE.Vector3(0, 0, 2);
testPointXY.applyMatrix4(combinedXY);
testPointYX.applyMatrix4(combinedYX);
console.log('tool tip under Rx*Ry:', testPointXY.x.toFixed(4), testPointXY.y.toFixed(4), testPointXY.z.toFixed(4));
console.log('tool tip under Ry*Rx:', testPointYX.x.toFixed(4), testPointYX.y.toFixed(4), testPointYX.z.toFixed(4));
```

Real output, at `t = 1.0` (matching this lesson's own project's `angle =
1.0000` at that timestamp):

```
tool tip under Rx*Ry: 1.6829 -0.9093 0.5839
tool tip under Ry*Rx: 0.9093 -1.6829 0.5839
```

If this were a real 5-axis CNC program describing where a 2-unit-long tool
points relative to the spindle, these two orders would aim the tool at two
genuinely different points in space — the exact reason real CNC
post-processors have to commit to one fixed rotary-axis order and apply it
consistently, rather than treating axis order as a detail that can vary
program to program.

### Discard the Throwaway Example

This unit's lab code is discarded; the real project builds and compares
both orders using live, time-varying angles instead of the fixed 30°/45°
example.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch teaching
  content.
- **Files affected** — `lesson-04.html`, created new.
- **Change type** — add.
- **Location** — a brand-new file; scene/camera/renderer setup carried
  forward from the previous lesson's end state, followed by two new meshes
  and a new `animate` function building both composition orders each frame.
- **Dependencies** — none beyond the same pinned `three@0.185.1` import map.

### The New Code

```javascript
const xyGeometry = new THREE.BoxGeometry(1.5, 0.6, 1);
const xyMaterial = new THREE.MeshBasicMaterial({ color: 0xff7a1a });
const xyWorkpiece = new THREE.Mesh(xyGeometry, xyMaterial);
xyWorkpiece.position.set(-2, 0, 0);
scene.add(xyWorkpiece);

const yxGeometry = new THREE.BoxGeometry(1.5, 0.6, 1);
const yxMaterial = new THREE.MeshBasicMaterial({ color: 0xb2571a });
const yxWorkpiece = new THREE.Mesh(yxGeometry, yxMaterial);
yxWorkpiece.position.set(2, 0, 0);
scene.add(yxWorkpiece);

const matrixX = new THREE.Matrix4();
const matrixY = new THREE.Matrix4();
const combinedXY = new THREE.Matrix4();
const combinedYX = new THREE.Matrix4();
const angularSpeed = 1;

function animate(time) {
  const t = time / 1000;
  const angle = t * angularSpeed;

  matrixX.makeRotationX(angle);
  matrixY.makeRotationY(angle);

  combinedXY.multiplyMatrices(matrixX, matrixY);
  xyWorkpiece.setRotationFromMatrix(combinedXY);

  combinedYX.multiplyMatrices(matrixY, matrixX);
  yxWorkpiece.setRotationFromMatrix(combinedYX);

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
 17  const xyGeometry = new THREE.BoxGeometry(1.5, 0.6, 1);
 18  const xyMaterial = new THREE.MeshBasicMaterial({ color: 0xff7a1a });
 19  const xyWorkpiece = new THREE.Mesh(xyGeometry, xyMaterial);
 20  xyWorkpiece.position.set(-2, 0, 0);
 21  scene.add(xyWorkpiece);
 22
 23  const yxGeometry = new THREE.BoxGeometry(1.5, 0.6, 1);
 24  const yxMaterial = new THREE.MeshBasicMaterial({ color: 0xb2571a });
 25  const yxWorkpiece = new THREE.Mesh(yxGeometry, yxMaterial);
 26  yxWorkpiece.position.set(2, 0, 0);
 27  scene.add(yxWorkpiece);
 28
 29  const matrixX = new THREE.Matrix4();
 30  const matrixY = new THREE.Matrix4();
 31  const combinedXY = new THREE.Matrix4();
 32  const combinedYX = new THREE.Matrix4();
 33  const angularSpeed = 1;
 34
 35  function animate(time) {
 36    const t = time / 1000;
 37    const angle = t * angularSpeed;
 38
 39    matrixX.makeRotationX(angle);
 40    matrixY.makeRotationY(angle);
 41
 42    combinedXY.multiplyMatrices(matrixX, matrixY);
 43    xyWorkpiece.setRotationFromMatrix(combinedXY);
 44
 45    combinedYX.multiplyMatrices(matrixY, matrixX);
 46    yxWorkpiece.setRotationFromMatrix(combinedYX);
 47
 48    renderer.render(scene, camera);
 49  }
 50
 51  renderer.setAnimationLoop(animate);
```

Both workpieces are driven by the exact same `matrixX` and `matrixY`,
rebuilt fresh every frame from the exact same `angle` — the file
deliberately gives both meshes identical raw ingredients, so that any
difference visible on screen between the bright-orange block and the
burnt-orange block can only be coming from lines 42 and 45: the order the
two ingredient matrices are handed to `multiplyMatrices`.

### Mechanical Walkthrough

- `const xyGeometry` / `xyMaterial` / `xyWorkpiece` — the same
  geometry-material-mesh pattern from the mesh concept file; color
  `0xff7a1a`, this curriculum's safety-orange accent, used here (rather than
  a single-axis color) to mark this mesh as the "X then Y" composed
  rotation.
- `xyWorkpiece.position.set(-2, 0, 0);` / `scene.add(xyWorkpiece);` —
  documented in the mesh concept file; placed to the left, mirroring the
  previous lesson's layout.
- `const yxGeometry` / `yxMaterial` / `yxWorkpiece` — identical pattern;
  color `0xb2571a`, a deliberately related but visibly darker sibling tone
  to `0xff7a1a` — same rotations, same ingredients, different order, echoed
  in two related-but-distinct shades of the same color family rather than
  two unrelated colors.
- `yxWorkpiece.position.set(2, 0, 0);` / `scene.add(yxWorkpiece);` — placed
  to the right.
- `const matrixX = new THREE.Matrix4();` / `const matrixY = ...` —
  documented in this lesson's Header; two fresh matrices, one per axis,
  built once outside `animate` and refilled every frame.
- `const combinedXY = new THREE.Matrix4();` / `const combinedYX = ...` — two
  more fresh matrices, one per *combination order*, kept separate from
  `matrixX`/`matrixY` so the two ingredient matrices are never overwritten
  by a combination step, and can safely be reused for both orders in the
  same frame.
- `function animate(time) { ... }` / `const t = ...` / `const angle = ...`
  — unchanged reasoning from every previous lesson.
- `matrixX.makeRotationX(angle);` / `matrixY.makeRotationY(angle);` —
  documented in Lesson 3's Header; both built from the exact same `angle`
  value this frame, deliberately, so any difference between the two meshes
  traces to order alone.
- `combinedXY.multiplyMatrices(matrixX, matrixY);` — documented in this
  lesson's Header; overwrites `combinedXY` with the product `matrixX *
  matrixY`, representing "do `matrixY`'s rotation, then `matrixX`'s," per
  this lesson's first Concept Unit's own proof of that reading direction.
- `xyWorkpiece.setRotationFromMatrix(combinedXY);` — documented in Lesson
  2's Header; updates this mesh's own quaternion from the just-computed
  combined matrix.
- `combinedYX.multiplyMatrices(matrixY, matrixX);` — the same method,
  called with `matrixY` and `matrixX` in the opposite argument order,
  overwriting the separate `combinedYX` matrix with `matrixY * matrixX`
  instead.
- `yxWorkpiece.setRotationFromMatrix(combinedYX);` — updates the second
  mesh's quaternion from the oppositely-ordered combined matrix.
- `renderer.render(scene, camera);` / `renderer.setAnimationLoop(animate);`
  — unchanged from every previous lesson.

**Execution trace**, both meshes, same five sample timestamps used since
Lesson 1, run against the real, installed library:

```
time=   0ms angle=0.0000 | XY quat=(0.0000,0.0000,0.0000,1.0000) | YX quat=(0.0000,0.0000,0.0000,1.0000)
time= 500ms angle=0.5000 | XY quat=(0.2397,0.2397,0.0612,0.9388) | YX quat=(0.2397,0.2397,-0.0612,0.9388)
time=1000ms angle=1.0000 | XY quat=(0.4207,0.4207,0.2298,0.7702) | YX quat=(0.4207,0.4207,-0.2298,0.7702)
time=1571ms angle=1.5710 | XY quat=(0.5000,0.5000,0.5001,0.4999) | YX quat=(-0.5000,-0.5000,0.5001,-0.4999)
time=3142ms angle=3.1420 | XY quat=(-0.0002,-0.0002,1.0000,0.0000) | YX quat=(0.0002,0.0002,1.0000,-0.0000)
```

At `time=0`, `angle` is `0`, both `matrixX` and `matrixY` are identity
matrices, and multiplying two identity matrices in either order still gives
the identity — no rotation has happened yet in either order, so both
quaternions match exactly, as expected. By `time=500`, with a real non-zero
angle now feeding both matrices, the `XY` and `YX` quaternions already
differ — specifically, only in the sign of their `z` component (`0.0612`
versus `-0.0612`), while `x` and `y` still agree. This lesson doesn't derive
*why* only that one component flips sign — a later lesson dedicated to
building quaternions from first principles is the right place to answer
that precisely — but the pattern itself is real and verified, not a
rounding artifact: it holds at every single non-zero sample time in this
trace, growing in magnitude right alongside the angle itself.

### CS Lens

Non-commutativity is not a defect or a strange edge case — it's the normal
condition for combining two *general* transforms, and commutativity (like
Lesson 3's within-a-single-axis case) is the special exception, not the
rule. This is the same relationship as **matrix multiplication in general**,
of which rotation composition is one specific case: matrix multiplication
is non-commutative for the same underlying reason ordinary numbers stay
commutative — numbers only ever scale a single one-dimensional line, with
nothing to reorder, while matrices can each rotate, stretch, or otherwise
rearrange multiple dimensions relative to each other, so which one acts
first genuinely changes what the second one has left to act on.

```
Also recognized in: putting on socks then shoes versus shoes then socks,
function composition in programming (parsing then validating input
behaves differently from validating then parsing), the order of
applying filters in image-editing software, and everyday chemistry —
adding acid to water is safe, adding water to acid can cause violent
spattering, the same two ingredients, reversed order, different result.
```

### SE Lens

This lesson deliberately builds *both* combination orders from the *same*
two source matrices in the same frame, rather than building one order,
observing it, then separately building the other order to compare against
a memory of the first. The alternative — testing one order, then changing
the code and testing the other — is more common in ad hoc experimentation,
but it invites a real bug: subtly different angles, timing, or camera state
between the two separate runs, making any apparent difference impossible to
fully trust. Building both at once, from guaranteed-identical inputs, is
what makes this lesson's central claim — that the *only* variable is
order — actually defensible rather than merely plausible. The debt still
being carried forward: this lesson's own composed matrices, `Rx*Ry` and
`Ry*Rx`, don't yet have any user-facing angle representation of their own —
there's no way yet to look at either mesh and read off "which angles
produced this" the way a single `Rx` or `Ry` lets a viewer read off one
clear angle. That gap is exactly what Euler angles, covered next, are built
to fill.

### Connect the Pieces

The same `angle` value, fed into the same `matrixX` and `matrixY` every
frame, produces two different `combinedXY`/`combinedYX` matrices purely
because `multiplyMatrices` is called with its two arguments swapped — and
those two different matrices, verified against real point and quaternion
values throughout this unit, drive two visibly different final orientations
on two otherwise-identical meshes.

---

## Connect the Pieces (Lesson Close)

Follow one concrete value through the whole file: at `time = 1000`,
`animate` computes `angle = 1.0000` radian, exactly as in every previous
lesson at this timestamp. `matrixX.makeRotationX(1.0000)` and
`matrixY.makeRotationY(1.0000)` each fill in the exact patterns Lesson 3
derived and verified — the same two matrices, unchanged, feeding both halves
of this lesson. `combinedXY.multiplyMatrices(matrixX, matrixY)` computes
`matrixX * matrixY`, which `xyWorkpiece.setRotationFromMatrix(...)` turns
into the quaternion `(0.4207, 0.4207, 0.2298, 0.7702)`. `combinedYX.
multiplyMatrices(matrixY, matrixX)` computes the reversed product `matrixY *
matrixX` from the exact same two ingredient matrices, which `yxWorkpiece.
setRotationFromMatrix(...)` turns into `(0.4207, 0.4207, -0.2298, 0.7702)`
instead — identical in two of four components, different in the third.
`renderer.render(scene, camera)` then draws both, side by side, from the
same scene and camera every previous lesson has built on.

**Next lesson:** this lesson combined two axes but gave the reader no way to
describe the *result* in terms of angles a person could read off directly.
The next lesson introduces Euler angles — a named, standard way of writing a
3D orientation as three linked angle values — and builds a live app with
three angle sliders driving a single combined rotation, using exactly the
multiplication order this lesson just proved matters.
