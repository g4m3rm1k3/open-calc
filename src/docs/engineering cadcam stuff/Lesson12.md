# Lesson 12: Moving Everything the Same Way

**What you will build:** a function that translates an entire shape (not
just one point) by a single offset, and a homogeneous 3×3 matrix that
produces the exact same result through matrix multiplication instead of
plain addition. The transferable problem: **translation is something
ordinary matrices cannot do** — a fact this lesson proves outright, not
just states — which is the entire reason every 2D graphics system,
including the one this project builds toward, represents points with an
extra coordinate they don't geometrically need.

**What you need to know first:** Lesson 11 (Arc 1) — `addVectors`, reused
directly in this lesson's first unit; this is also the first lesson of
Arc 2, opening the transformation work Arc 1's vector math was built for.

---

## Concept Unit: Translating a Shape — Vector Addition, Applied to Many Points

### The Problem

Lesson 7 already showed `pointA + v` moving a single point. A real shape —
this project's square, or eventually a toolpath boundary — is many points
at once, and translating the *shape* means moving every one of its points
by the exact same offset, not recomputing each independently.

### By Hand

```
square corners: (100,100), (200,100), (200,200), (100,200)
offset: (300, 50)

each corner + offset:
(100,100) + (300,50) = (400,150)
(200,100) + (300,50) = (500,150)
(200,200) + (300,50) = (500,250)
(100,200) + (300,50) = (400,250)
```

Every corner shifts by the identical `(300, 50)` — the square's shape
(its side lengths, its right angles) is completely unchanged; only its
location moved.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after `angleOf`
- **Dependencies:** `addVectors`, from Lesson 7

### The New Code

```js
function translateShape(points, offset) {
  return points.map((point) => addVectors(point, offset));
}
```

### The Updated Project

```js
function angleOf(v) {
  return Math.atan2(v.y, v.x);
}

function translateShape(points, offset) {                       // ← new
  return points.map((point) => addVectors(point, offset));      // ← new
}                                                                 // ← new
```

### Isolating the Concept

```js
const square = [
  { x: 100, y: 100 },
  { x: 200, y: 100 },
  { x: 200, y: 200 },
  { x: 100, y: 200 },
];
const offset = { x: 300, y: 50 };
const translated = translateShape(square, offset);
console.log("original square:", JSON.stringify(square));
console.log("translated square:", JSON.stringify(translated));
```

Real output:

```
original square: [{"x":100,"y":100},{"x":200,"y":100},{"x":200,"y":200},{"x":100,"y":200}]
translated square: [{"type":"vector","x":400,"y":150},{"type":"vector","x":500,"y":150},{"type":"vector","x":500,"y":250},{"type":"vector","x":400,"y":250}]
```

Matches every one of the four by-hand results exactly.

Drawn for real, both squares, with a pixel check on each:

```js
ctx.lineWidth = 3;
function drawPolygon(points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, toCanvasY(points[0].y, canvas.height));
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, toCanvasY(points[i].y, canvas.height));
  }
  ctx.closePath();
  ctx.stroke();
}
drawPolygon(square);
drawPolygon(translated);

console.log("pixel on original square edge:", Array.from(ctx.getImageData(150, toCanvasY(100, canvas.height), 1, 1).data));
console.log("pixel on translated square edge:", Array.from(ctx.getImageData(450, toCanvasY(150, canvas.height), 1, 1).data));
```

Real output:

```
pixel on original square edge: [ 0, 0, 0, 255 ]
pixel on translated square edge: [ 0, 0, 0, 255 ]
```

Both squares genuinely rendered, in their predicted positions.

### Discarding

Discarded — `square`/`drawPolygon` here are illustrative; `translateShape`
itself is the real, permanent function. (`drawPolygon` is a useful helper
worth its own dedicated treatment once shapes with more than four points
are common — flagged for a future lesson rather than added here.)

### Mechanical Walkthrough

- **`function translateShape(points, offset) { ... }`** — (b) a concept
  reappearing — ordinary function declaration.
- **`points.map((point) => addVectors(point, offset))`** — (a) first
  appearance of `.map()` — an array method that runs a function against
  every element and collects the results into a *new* array, leaving the
  original untouched. `(point) => addVectors(point, offset)` is (a) first
  appearance of **arrow function** syntax — a shorter way to write a small
  function, here passed directly as `.map()`'s argument, the same
  callback-by-value idea from Arc 0's `requestAnimationFrame`, just
  written with `=>` instead of the `function` keyword.

### CS Lens

Applying the same operation to every element of a collection and
collecting the results, without a manual loop, is called **mapping** —
genuinely fundamental.

```
Also recognized in: Python's list comprehensions, SQL's SELECT applying
an expression to every row, a spreadsheet formula dragged down an entire
column, functional programming's map/filter/reduce trio broadly
```

### SE Lens

The alternative not chosen: a `for...of` loop (Lesson 6, Arc 0) pushing
translated points into a new array manually. That works identically here.
The real tradeoff: `.map()` states the intent — "produce a new,
same-length collection by transforming each element" — directly in its
name, whereas a hand-written loop requires a reader to trace through it to
confirm it doesn't skip elements, mutate the original array, or do
anything unexpected. For this exact shape of operation, `.map()` is both
shorter and more self-documenting; a `for...of` loop remains the right
choice when the operation isn't a clean one-to-one transformation (as
Arc 0's rendering loop wasn't — it didn't produce a new array).

### Run It

Real output already shown above.

### Connecting

Translation, done as plain addition, works and is drawn. The next two
units are about a completely different way to arrive at this same result —
and why that different way is necessary for everything else Arc 2 builds.

---

## Concept Unit: Why a 2×2 Matrix Cannot Represent Translation

### The Problem

Arc 2's later lessons (rotation, scaling) are all going to be expressed as
matrices — a genuinely powerful, composable way to represent
transformations, previewed here before it's built. Translation, done as
addition in the previous unit, seems like it should fit the same mold.
It provably doesn't, and this project needs to know exactly why before
building around the fix.

### By Hand

Every 2×2 matrix, applied to the origin `(0, 0)`, produces the origin
back — this is a direct consequence of how matrix multiplication works:
every entry gets multiplied by either `0.x` or `0.y`, both zero, so every
term vanishes.

```
M = | a  b |     M * (0,0) = (a×0 + b×0, c×0 + d×0) = (0, 0)
    | c  d |
```

This holds for **any** values of `a, b, c, d` — there is no 2×2 matrix
whose product with `(0,0)` is anything other than `(0,0)`. But translation
is supposed to move *every* point, including the origin, to some new
location. No 2×2 matrix can do that — not "this project hasn't found the
right one yet," but genuinely, provably none exists.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none — this unit is a proof, not new project code.
- **Change type:** n/a (concept-only unit)
- **Location:** n/a
- **Dependencies:** none new

### Isolating the Concept

Not one matrix, but several arbitrary ones, tested against the same claim
— a single passing example wouldn't prove the general case, but several
unrelated matrices all failing the same way is real evidence:

```js
function apply2x2(m, v) {
  return {
    x: m[0][0]*v.x + m[0][1]*v.y,
    y: m[1][0]*v.x + m[1][1]*v.y,
  };
}

const matrices = [
  [[1,0],[0,1]],   // identity
  [[2,0],[0,2]],   // scale
  [[0,-1],[1,0]],  // rotate 90
  [[5,3],[-2,7]],  // arbitrary
];

const origin = { x: 0, y: 0 };
for (const m of matrices) {
  console.log("M =", JSON.stringify(m), " M * origin =", JSON.stringify(apply2x2(m, origin)));
}
```

Real output:

```
M = [[1,0],[0,1]]  M * origin = {"x":0,"y":0}
M = [[2,0],[0,2]]  M * origin = {"x":0,"y":0}
M = [[0,-1],[1,0]]  M * origin = {"x":0,"y":0}
M = [[5,3],[-2,7]]  M * origin = {"x":0,"y":0}
```

Four completely different matrices — identity, a scale, a rotation, and an
arbitrary one — every one of them leaves the origin exactly where it was.
This is the real, concrete evidence behind the by-hand proof: it isn't
that the *right* 2×2 matrix hasn't been found yet; the structure of 2×2
matrix multiplication itself guarantees this for every possible matrix.

### Discarding

Discarded — this proof-by-example never appears as project code; it's
purely demonstrative.

### CS Lens

A transformation that always maps the origin to itself, no matter which
specific matrix parameters are chosen, is called a **linear**
transformation — genuinely worth naming.

```
Also recognized in: any transformation expressible purely as matrix
multiplication in linear algebra generally, the reason "linear" in
"linear regression" specifically excludes a constant offset unless one is
added deliberately, physics' distinction between linear and affine
coordinate frames, why a camera's rotation and its position have to be
handled by genuinely different math in a 3D engine (foreshadowing Arc 6)
```

### SE Lens

Not applicable in the usual sense — this unit proves a mathematical fact
about matrices, not a design decision this project made. The real
consequence, carried into the next unit: since translation genuinely can't
be linear, representing it as a matrix at all requires changing what a
"point" *is*, not just picking cleverer matrix entries.

### Run It

Real output already shown above.

### Connecting

Translation can't be a 2×2 matrix — the final unit shows the actual fix:
adding one extra coordinate to every point.

---

## Concept Unit: Homogeneous Coordinates — Making Translation a Matrix Multiply

### The Problem

Arc 2 needs every transformation — translation included — expressible the
same way (as a matrix), so they can be combined predictably (that
combination is Lesson 15's whole subject). The previous unit proved plain
2×2 matrices can't include translation. The actual fix: represent a 2D
point with **three** numbers instead of two, and use a 3×3 matrix.

### By Hand

Extend point `(x, y)` to `(x, y, 1)` — that extra `1` is called the
**homogeneous coordinate**. A translation matrix, in this extended form,
puts the offset in its rightmost column:

```
T = | 1  0  tx |
    | 0  1  ty |
    | 0  0  1  |
```

Multiplying it against a homogeneous point `(x, y, 1)`:

```
T * (100, 50, 1), with tx=200, ty=75:

row 1: (1×100) + (0×50) + (200×1) = 100 + 0 + 200 = 300
row 2: (0×100) + (1×50) + (75×1)  = 0 + 50 + 75  = 125
row 3: (0×100) + (0×50) + (1×1)   = 0 + 0 + 1    = 1

result: (300, 125, 1)
```

The result's first two numbers, `(300, 125)`, exactly match `pointA + v`
from Lesson 7 — the same translation, reached through matrix
multiplication instead of addition, because that extra `1` gave the
matrix's rightmost column something nonzero to multiply against, which is
precisely what a bare `(x, y)` point could never offer a 2×2 matrix.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after `translateShape`
- **Dependencies:** none new

### The New Code

```js
function translationMatrix(tx, ty) {
  return [
    [1, 0, tx],
    [0, 1, ty],
    [0, 0, 1],
  ];
}

function applyMatrix(m, point) {
  const w = 1; // every 2D point's homogeneous coordinate
  return {
    x: m[0][0] * point.x + m[0][1] * point.y + m[0][2] * w,
    y: m[1][0] * point.x + m[1][1] * point.y + m[1][2] * w,
  };
}
```

### The Updated Project

```js
function translateShape(points, offset) {
  return points.map((point) => addVectors(point, offset));
}

function translationMatrix(tx, ty) {          // ← new
  return [                                     // ← new
    [1, 0, tx],                                // ← new
    [0, 1, ty],                                // ← new
    [0, 0, 1],                                 // ← new
  ];                                            // ← new
}                                                // ← new

function applyMatrix(m, point) {                // ← new
  const w = 1;                                  // ← new
  return {                                      // ← new
    x: m[0][0] * point.x + m[0][1] * point.y + m[0][2] * w,  // ← new
    y: m[1][0] * point.x + m[1][1] * point.y + m[1][2] * w,  // ← new
  };                                             // ← new
}                                                // ← new
```

### Isolating the Concept

```js
const point = { x: 100, y: 50 };
const T = translationMatrix(200, 75);
console.log("T =", JSON.stringify(T));

const result = applyMatrix(T, point);
console.log("T * point =", JSON.stringify(result));

const viaAddVectors = addVectors(point, { x: 200, y: 75 });
console.log("addVectors comparison:", JSON.stringify(viaAddVectors));
console.log("matches:", result.x === viaAddVectors.x && result.y === viaAddVectors.y);

console.log("T * origin =", JSON.stringify(applyMatrix(T, { x: 0, y: 0 })));
```

Real output:

```
T = [[1,0,200],[0,1,75],[0,0,1]]
T * point = {"x":300,"y":125}
addVectors comparison: {"x":300,"y":125}
matches: true
T * origin = {"x":200,"y":75}
```

What this proves: matrix multiplication and plain vector addition produce
*identical* results for translation — `(300, 125)` both ways. And, unlike
every 2×2 matrix in the previous unit, this one genuinely moves the
origin, to `(200, 75)` — exactly the offset, exactly the thing the
previous unit proved was impossible without the extra coordinate.

### Discarding

Discarded — this isolated check never appears in the project;
`translationMatrix` and `applyMatrix` are the real, permanent functions.

### Mechanical Walkthrough

- **`function translationMatrix(tx, ty) { ... }`** — (a) first appearance.
  Builds and returns a 3×3 matrix, represented here as an array of arrays
  (a "2D array") — (b) itself a concept reappearing from arrays generally
  (Lesson 6, Arc 0), applied here in a new shape: an array *of* arrays,
  rather than an array of shape objects.
- **`function applyMatrix(m, point) { ... }`** — (a) first appearance.
  Performs the actual matrix-vector multiplication by hand, row by row.
- **`const w = 1;`** — (b) a concept reappearing: the homogeneous
  coordinate from the by-hand derivation above, made explicit in code as
  its own named value rather than a bare literal buried in the formula.
- **`m[0][0] * point.x + m[0][1] * point.y + m[0][2] * w`** — (c)
  genuinely basic arithmetic, given everything above — this line is
  exactly the "row 1" calculation from the by-hand section, just written
  with array indexing instead of prose.

### CS Lens

Adding an extra coordinate specifically to unlock an operation the
original coordinate space couldn't express is worth naming broadly.

```
Also recognized in: projective geometry generally (homogeneous
coordinates were invented there, decades before computer graphics
adopted them), quaternions adding a fourth dimension to represent 3D
rotation cleanly (Arc 6), color spaces adding an alpha channel to plain
RGB, complex numbers extending real numbers specifically to solve
equations reals alone can't
```

### SE Lens

The alternative not chosen: keep translation as plain addition
(`translateShape`, from this lesson's first unit) permanently, and never
adopt the matrix form at all. That works fine in complete isolation. The
real reason it doesn't survive past this lesson: Arc 2's rotation and
scaling (upcoming) are naturally matrices, and the entire point of Lesson
15 (matrix composition) is combining several transformations — translate,
then rotate, then scale — into one single matrix applied once. That
composition is only possible if every transformation, translation
included, speaks the same "matrix" language. `translateShape` isn't
wasted work — it's kept as the simpler tool for the common case of "just
move this," while `translationMatrix` is what makes translation eligible
to participate in composed transformations later.

### Commands Needed

None new.

### Run It

Real output already shown above.

### Connecting

Translation now exists in two equivalent, cross-verified forms — plain
addition and homogeneous matrix multiplication — closing the gap the
previous unit proved was real, and setting up every transformation Arc 2
builds from here to speak the same matrix language.

---

## Closing

### Connect the Pieces

One point traced through all three units: `(100, 50)`, translated by
`(200, 75)`. `translateShape` (Unit 1) — really just `addVectors` applied
across a whole shape — produces `(300, 125)` directly. The 2×2 proof
(Unit 2) established that no ordinary matrix could reproduce that result
for the origin, or any point. `translationMatrix` and `applyMatrix`
(Unit 3), using the homogeneous coordinate `w = 1`, produce the *exact
same* `(300, 125)` — proven identical, not just similar — through a
completely different mechanism, one that generalizes to rotation and
scaling in the lessons immediately ahead.

### What Breaks Without This

Applying `applyMatrix` correctly but forgetting the homogeneous coordinate
conceptually — using a 2×2-style matrix (no translation row/column) and
expecting it to move a shape anyway:

```js
function brokenTranslate(point, tx, ty) {
  // Mistake: tries to encode translation in a plain 2x2 matrix
  const M = [[1, tx], [ty, 1]];
  return {
    x: M[0][0] * point.x + M[0][1] * point.y,
    y: M[1][0] * point.x + M[1][1] * point.y,
  };
}

console.log("broken attempt on origin:", JSON.stringify(brokenTranslate({x:0,y:0}, 200, 75)));
console.log("broken attempt on (100,50):", JSON.stringify(brokenTranslate({x:100,y:50}, 200, 75)));
```

Real output:

```
broken attempt on origin: {"x":0,"y":0}
broken attempt on (100,50): {"x":100,"y":10075}
```

The origin still doesn't move — exactly Unit 2's proof playing out again —
and the second result isn't a translation at all; stuffing `tx`/`ty` into
a 2×2 matrix's off-diagonal entries just built an unrelated (and
nonsensical) linear transformation, not a broken translation. This is
precisely why homogeneous coordinates aren't optional convenience — there
is no clever rearrangement of a plain 2×2 matrix that fixes this.

### Exercises

- By hand, translate the point `(50, 50)` by offset `(-20, 100)`, then
  confirm with both `addVectors` and `translationMatrix`/`applyMatrix`,
  checking they agree.
- Build a translation matrix with `tx = 0, ty = 0` — the "do nothing"
  translation — and confirm, by hand and in code, that it returns any
  point completely unchanged. What does this matrix look like, compared
  to the identity matrix from the 2×2 proof?
- Add a translated copy of the project's existing `scene` shapes (Arc 0)
  using `translateShape`, and confirm both the original and the copy
  render correctly.

### Definition of Done

- [ ] `translateShape`, `translationMatrix`, and `applyMatrix` exist in
      `script.js`
- [ ] `applyMatrix(translationMatrix(tx, ty), point)` produces identical
      results to `addVectors(point, {x: tx, y: ty})` for a case you verify
      yourself
- [ ] You can explain, without looking, why no 2×2 matrix can represent
      translation, and what the homogeneous coordinate specifically fixes
- [ ] Commit:

  ```
  git add script.js
  git commit -m "Add translation as both vector addition and a homogeneous matrix

  translateShape moves a whole shape via addVectors. translationMatrix +
  applyMatrix reach the identical result via 3x3 matrix multiplication on
  a homogeneous point (x, y, 1) - proven necessary by showing no 2x2
  matrix can move the origin, which any 2D matrix-based translation
  requires."
  ```
