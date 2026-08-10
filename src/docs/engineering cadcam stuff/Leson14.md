# Lesson 14: Bigger, Smaller, or Squashed

**What you will build:** a scale matrix supporting both uniform scaling
(the whole shape grows or shrinks evenly) and non-uniform scaling
(stretched differently along each axis), plus a real, measured
demonstration of a genuine gotcha: scaling a shape that isn't centered on
the origin moves it, not just resizes it. The transferable problem: like
rotation, scaling is defined *relative to the origin* — a fact that's easy
to forget because "scale this shape" sounds like it should only affect
size.

**What you need to know first:** Lesson 13 (Arc 2) — `rotationMatrix` and
`applyMatrix`, whose shape this lesson's scale matrix matches exactly.

---

## Concept Unit: Uniform Scaling

### The Problem

Resizing a shape — making a toolpath boundary 150% larger, or a preview
thumbnail half-size — needs a transformation that grows or shrinks every
point's distance from the origin by the same factor, in every direction.

### By Hand

Scaling a point by a factor `s` multiplies both of its components by that
same number:

```
point = (100, 50), s = 2

scaled = (point.x × s, point.y × s)
       = (100 × 2, 50 × 2)
       = (200, 100)
```

A factor greater than `1` grows the shape; a factor between `0` and `1`
shrinks it:

```
point = (100, 50), s = 0.5

scaled = (100 × 0.5, 50 × 0.5) = (50, 25)
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none yet — the matrix form (matching Lesson 12/13's
  shape) is built in the next unit.
- **Change type:** n/a (concept-only unit)
- **Location:** n/a
- **Dependencies:** none new

### Isolating the Concept

```js
const point = { x: 100, y: 50 };
const s = 2;
console.log("point * " + s + " = (" + point.x + "*" + s + ", " + point.y + "*" + s + ") =", JSON.stringify({ x: point.x * s, y: point.y * s }));

const s2 = 0.5;
console.log("point * " + s2 + " =", JSON.stringify({ x: point.x * s2, y: point.y * s2 }));
```

Real output:

```
point * 2 = (100*2, 50*2) = {"x":200,"y":100}
point * 0.5 = {"x":50,"y":25}
```

Matches the by-hand results exactly.

### Discarding

Discarded — a matrix-based version, matching this project's existing
transformation shape, follows in the next unit.

### CS Lens

Not a new hard concept — this is direct component-wise multiplication;
its role as one axis of a general "linear transformation" family gets its
full treatment once the matrix form (next unit) connects it explicitly to
rotation.

### SE Lens

Not applicable — no implementation alternative to weigh; this is the
standard definition of scaling.

### Run It

Real output already shown above.

### Connecting

Plain multiplication works — the next unit puts it in the same matrix
shape as translation and rotation, and the unit after that generalizes it
to different factors per axis.

---

## Concept Unit: The Scale Matrix

### The Problem

Exactly like rotation in Lesson 13, scaling needs to speak the same
homogeneous-matrix language as translation, so all three can eventually
combine into one matrix (Lesson 15).

### By Hand

```
S = | s  0  0 |
    | 0  s  0 |
    | 0  0  1 |

S * (x, y, 1):
row 1: x·s + y·0 + 1·0 = x·s
row 2: x·0 + y·s + 1·0 = y·s
row 3: x·0 + y·0 + 1·1 = 1

result: (x·s, y·s, 1)
```

Same result as plain multiplication from the previous unit — just reached
through the matrix form this project's other transformations already use.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after `rotateShape`
- **Dependencies:** `applyMatrix`, from Lesson 12

### The New Code

```js
function scaleMatrix(sx, sy) {
  return [
    [sx, 0, 0],
    [0, sy, 0],
    [0, 0, 1],
  ];
}
```

### The Updated Project

```js
function rotateShape(points, phi) {
  const R = rotationMatrix(phi);
  return points.map((point) => applyMatrix(R, point));
}

function scaleMatrix(sx, sy) {          // ← new
  return [                               // ← new
    [sx, 0, 0],                          // ← new
    [0, sy, 0],                          // ← new
    [0, 0, 1],                           // ← new
  ];                                     // ← new
}                                         // ← new
```

Note `scaleMatrix` already takes two separate factors, `sx` and `sy` —
uniform scaling (this unit's examples) is just the special case where
they happen to be equal; the next unit is what makes that distinction
matter.

### Isolating the Concept

```js
const point = { x: 100, y: 50 };
const S = scaleMatrix(2, 2);
console.log("S =", JSON.stringify(S));
console.log("S * point =", JSON.stringify(applyMatrix(S, point)));

console.log("S * origin =", JSON.stringify(applyMatrix(S, { x: 0, y: 0 })));
```

Real output:

```
S = [[2,0,0],[0,2,0],[0,0,1]]
S * point = {"x":200,"y":100}
S * origin = {"x":0,"y":0}
```

Matches the previous unit's plain-multiplication result exactly. Unlike
translation (Lesson 12), scaling — like rotation — genuinely does leave
the origin fixed; scaling `(0, 0)` by anything still gives `(0, 0)`, which
is the mathematically correct, structurally-guaranteed behavior of any
linear (non-translation) matrix, exactly as Lesson 12's 2×2 proof
established.

### Discarding

Discarded — the real, permanent function is `scaleMatrix`.

### Mechanical Walkthrough

- **`function scaleMatrix(sx, sy) { ... }`** — (b) a concept reappearing —
  ordinary function declaration, same shape as `translationMatrix` and
  `rotationMatrix`.
- **The returned 3×3 array** — (b) a concept reappearing — same
  array-of-arrays shape used by both prior transformation matrices.

### CS Lens

Scaling, rotation, and translation all sharing one matrix "interface" —
build a 3×3 matrix, hand it to the same `applyMatrix` — is the concrete
payoff of committing to homogeneous coordinates back in Lesson 12.

```
Also recognized in: any plugin/driver architecture where different
implementations share one common interface (a shape's "transform" here is
analogous to a shape's "render" method in Arc 0's tagged-object pattern),
polymorphism generally — different underlying behavior, identical calling
convention
```

### SE Lens

The alternative not chosen: give `scaleMatrix` a single parameter
(`scaleMatrix(s)`) for uniform-only scaling, and add a separate function
later if non-uniform scaling ever turns out to be needed. The real reason
to take two parameters from the start: it costs nothing now (uniform
scaling is just `scaleMatrix(s, s)`), and it means this project never has
two competing scale-matrix functions to keep in sync — a much worse
version of the exact problem the SE Lens flagged when `addVectors` was
first used to (imperfectly) handle both point-translation and
vector-addition back in Lesson 7.

### Run It

Real output already shown above.

### Connecting

The matrix form works identically to plain multiplication — the final
unit is where taking two separate factors actually pays off.

---

## Concept Unit: Non-Uniform Scaling — and a Real Gotcha

### The Problem

Sometimes a shape genuinely needs to stretch differently along each axis —
squashing a circle into an ellipse, adjusting aspect ratio, or (in a CAD/
CAM context specifically) compensating for a material that shrinks
differently along its grain direction than across it. `scaleMatrix`
already supports this; this unit proves it, and also surfaces something
easy to miss: scaling isn't purely about size.

### By Hand

```
point = (100, 50), sx = 2, sy = 0.5

scaled = (point.x × sx, point.y × sy)
       = (100 × 2, 50 × 0.5)
       = (200, 25)
```

Stretched twice as wide, squashed to half height — a visibly different
shape, not just a bigger or smaller version of the same one.

**The gotcha, by hand:** consider a square whose corners are `(300,300)`,
`(400,300)`, `(400,400)`, `(300,400)` — note this square is nowhere near
the origin. Scale every corner by `2`:

```
(300,300) × 2 = (600,600)
(400,300) × 2 = (800,600)
(400,400) × 2 = (800,800)
(300,400) × 2 = (600,800)
```

The square's side length doubles, as expected — but its *center* moves
from `(350, 350)` to `(700, 700)`. Scaling didn't just resize the square;
it also moved it, because every point (including the corners) scaled
relative to the *origin*, not relative to the square's own center.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after `scaleMatrix`
- **Dependencies:** `scaleMatrix`, `applyMatrix`

### The New Code

```js
function scaleShape(points, sx, sy) {
  const S = scaleMatrix(sx, sy);
  return points.map((point) => applyMatrix(S, point));
}
```

### The Updated Project

```js
function scaleMatrix(sx, sy) {
  return [
    [sx, 0, 0],
    [0, sy, 0],
    [0, 0, 1],
  ];
}

function scaleShape(points, sx, sy) {                    // ← new
  const S = scaleMatrix(sx, sy);                          // ← new
  return points.map((point) => applyMatrix(S, point));    // ← new
}                                                          // ← new
```

### Isolating the Concept

The non-uniform case, run for real:

```js
const point = { x: 100, y: 50 };
const sx = 2, sy = 0.5;
console.log("non-uniform scale sx=" + sx + ", sy=" + sy + ":", JSON.stringify(applyMatrix(scaleMatrix(sx, sy), point)));
```

Real output:

```
non-uniform scale sx=2, sy=0.5: {"x":200,"y":25}
```

Matches the by-hand result exactly.

The gotcha, proven with real numbers and a real distance measurement, not
just asserted:

```js
function distance(a, b) { return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2); }
function center(points) {
  const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

const square = [
  { x: 300, y: 300 },
  { x: 400, y: 300 },
  { x: 400, y: 400 },
  { x: 300, y: 400 },
];
console.log("original side length:", distance(square[0], square[1]));
console.log("original center:", JSON.stringify(center(square)));

const scaled = scaleShape(square, 2, 2);
console.log("scaled square:", JSON.stringify(scaled));
console.log("scaled side length:", distance(scaled[0], scaled[1]));
console.log("scaled center:", JSON.stringify(center(scaled)));
```

Real output:

```
original side length: 100
original center: {"x":350,"y":350}
scaled square: [{"x":600,"y":600},{"x":800,"y":600},{"x":800,"y":800},{"x":600,"y":800}]
scaled side length: 200
scaled center: {"x":700,"y":700}
```

What this proves: the side length genuinely doubled (`100` → `200`, as
intended), but the square's center moved from `(350,350)` all the way to
`(700,700)` — a real, measured displacement, not a rounding artifact. A
shape not centered at the origin doesn't just resize under scaling; it
also translates, purely as a side effect of every point being pulled
toward or pushed away from `(0,0)`.

### Discarding

Discarded — `square`, `distance`, and `center` above are illustrative for
this proof; `scaleShape` itself is the real, permanent function
(`distance` is Lesson 11's own function, reused here rather than
redefined).

### Mechanical Walkthrough

- **`function scaleShape(points, sx, sy) { ... }`** — (b) a concept
  reappearing — identical structural shape to `translateShape` and
  `rotateShape`: build the matrix once, `.map()` it across every point.

### CS Lens

A transformation that behaves differently depending on a shape's position
relative to a fixed reference point (here, the origin) is a hard concept
worth naming directly: scaling and rotation are **not translation-
invariant** — moving a shape first changes the result of scaling or
rotating it, which is not true of most operations one might naively expect
to be "local" to a shape.

```
Also recognized in: camera zoom in a game engine zooming toward the
world origin unless explicitly centered on the camera's own focus point,
CSS transform-origin existing specifically because scale/rotate in CSS
default to the element's own corner, not its center, image editing
software's "resize" tool needing an explicit anchor point, robotic arm
joint rotations that swing an entire limb through space if not
anchored at the correct joint
```

### SE Lens

The alternative not chosen: silently assume shapes are always meant to be
scaled from their own center, and build that assumption into
`scaleShape` itself. The real cost of doing that invisibly: sometimes
scaling *from the origin* (or from some other specific anchor — a
toolpath's fixed reference point, for instance) is exactly the intended
behavior, and hiding the actual mechanism behind a "helpful" default would
make that case impossible without a separate, differently-named function.
`scaleShape`, as built here, keeps the real, honest mechanism — scale
about the origin — and leaves "scale about a shape's own center" as a
composed operation for later: translate the shape so its center sits at
the origin, scale, then translate back. That's precisely the same
translate-transform-translate-back pattern Arc 2's own map calls for
rotation about an arbitrary point, and it's a natural exercise below
rather than new lesson content here.

### Commands Needed

None new.

### Run It

Real output already shown above.

### Connecting

Scaling — uniform and non-uniform — is now derived, matrix-encoded, and
proven correct, including a real gotcha most tutorials skip past. Every
individual 2D transformation Arc 2 set out to cover (translate, rotate,
scale) now exists in the identical matrix shape, ready for Lesson 15 to
combine them into one.

---

## Closing

### Connect the Pieces

One shape traced through the whole lesson: the square at `(300,300)`
through `(400,400)`. `scaleMatrix(2, 2)` (Unit 2) and `scaleShape` (Unit
3) double every corner's distance from the origin. The side length
genuinely doubles — the "resize" everyone expects — but the center moves
from `(350,350)` to `(700,700)`, a real, measured `(350,350)` displacement
that has nothing to do with the shape's size changing at all. This is the
same "everything is relative to the origin" theme Lesson 13's rotation
carried, now shown to apply to scaling too.

### What Breaks Without This

Assuming scaling only changes size, and using it to "grow a shape in
place" without accounting for the origin-relative shift just proven:

```js
const originalArea = 100 * 100; // the square's original 100x100 area
const scaled2x = scaleShape(square, 2, 2);
const scaledSideLength = distance(scaled2x[0], scaled2x[1]);
console.log("expected: still roughly centered around (350,350), just bigger");
console.log("actual scaled center:", JSON.stringify(center(scaled2x)));
console.log("actual displacement from original center:", distance(center(square), center(scaled2x)));
```

Real output:

```
expected: still roughly centered around (350,350), just bigger
actual scaled center: {"x":700,"y":700}
actual displacement from original center: 494.9747468305833
```

A shape "scaled up" this way visibly jumps to a completely different part
of the canvas — a real, easy-to-hit bug the first time this project scales
anything that isn't already sitting at the origin, which describes nearly
every real shape.

### Exercises

- By hand, predict where the square's four corners land if scaled by `0.5`
  instead of `2`, then confirm with `scaleShape`.
- Using the translate-scale-translate-back idea named in this lesson's SE
  Lens, write a function `scaleAboutCenter(points, sx, sy)` that scales a
  shape while keeping its center fixed — using `translateShape` (Lesson
  12), `scaleShape`, and the shape's own center (computed the same way
  `center()` did in this lesson's isolation step).
- Non-uniformly scale the project's existing rotated line segment (from
  Lesson 13's exercises) with `sx = 3, sy = 1`, and describe in one
  sentence what visually happens to a line that isn't perfectly horizontal
  or vertical when scaled this way.

### Definition of Done

- [ ] `scaleMatrix` and `scaleShape` exist in `script.js` and match their
      by-hand derivations exactly, for both uniform and non-uniform cases
- [ ] You've reproduced, with real numbers, a shape's center moving under
      scaling even though only its size was intended to change
- [ ] You can explain, without looking, why scaling (like rotation) always
      leaves the origin fixed, and why that matters for any shape not
      centered there
- [ ] Commit:

  ```
  git add script.js
  git commit -m "Add scale matrix (uniform and non-uniform), derived by hand first

  scaleMatrix and scaleShape match translationMatrix/rotationMatrix's
  homogeneous 3x3 shape. Verified against hand calculations for both
  uniform and non-uniform factors, and demonstrated with real measurements
  that scaling a shape not centered at the origin moves it, not just
  resizes it - the same origin-relative behavior rotation has."
  ```
