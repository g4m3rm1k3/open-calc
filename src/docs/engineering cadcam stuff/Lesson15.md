# Lesson 15: One Matrix, Several Transformations

**What you will build:** a matrix-multiplication function that combines two
transformation matrices into one, and real, measured proof that the *order*
you combine them in changes the result. The transferable problem: this
project has three separate transformations now (translate, rotate, scale),
each correct on its own — but a real toolpath step is usually several of
these at once ("rotate this pocket 30°, then move it into position"), and
naively applying them one after another in the wrong order silently
produces a different shape than intended.

**What you need to know first:** Lessons 12–14 (Arc 2) — `translationMatrix`,
`rotationMatrix`, `scaleMatrix`, and `applyMatrix`, all reused directly.

> A note on sequencing: the curriculum map originally placed a dedicated
> "homogeneous coordinates" lesson here. That concept — why 2D affine
> transforms need a 3×3 matrix and the extra `1` — was already fully
> derived and proven in Lesson 12, when translation's matrix form was
> built. Repeating it here would be re-explaining an already-taught
> concept rather than teaching something new, so this lesson moves
> straight to composition, the next genuinely new idea.

---

## Concept Unit: Multiplying Two Matrices

### The Problem

`applyMatrix`, so far, always takes one matrix and one point. Combining
two *transformations* — not a transformation and a point, but two 3×3
matrices with each other — needs a genuinely different operation:
matrix-matrix multiplication, not matrix-vector multiplication.

### By Hand

Multiplying two 3×3 matrices produces a new 3×3 matrix. Each entry of the
result is found by taking a full row from the first matrix and a full
column from the second, multiplying matching positions, and summing —
exactly the same row-times-column pattern `applyMatrix` already used
against a single column (a point), just repeated for every column of the
second matrix instead of one.

```
A = | 1  0  5 |     (translate by (5,3))
    | 0  1  3 |
    | 0  0  1 |

B = | 2  0  0 |     (scale by 2)
    | 0  2  0 |
    | 0  0  1 |

(A×B), row 1, column 1:
  (1×2) + (0×0) + (5×0) = 2

(A×B), row 1, column 3:
  (1×0) + (0×0) + (5×1) = 5

... continuing this for every row/column pair:

A×B = | 2  0  5 |
      | 0  2  3 |
      | 0  0  1 |
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `script.js` (modified)
- **Change type:** add
- **Location:** after `scaleShape`
- **Dependencies:** none new

### The New Code

```js
function multiplyMatrices(a, b) {
  const result = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      let sum = 0;
      for (let k = 0; k < 3; k++) {
        sum += a[row][k] * b[k][col];
      }
      result[row][col] = sum;
    }
  }
  return result;
}
```

### The Updated Project

```js
function scaleShape(points, sx, sy) {
  const S = scaleMatrix(sx, sy);
  return points.map((point) => applyMatrix(S, point));
}

function multiplyMatrices(a, b) {                          // ← new
  const result = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];         // ← new
  for (let row = 0; row < 3; row++) {                        // ← new
    for (let col = 0; col < 3; col++) {                      // ← new
      let sum = 0;                                            // ← new
      for (let k = 0; k < 3; k++) {                           // ← new
        sum += a[row][k] * b[k][col];                         // ← new
      }                                                        // ← new
      result[row][col] = sum;                                 // ← new
    }                                                          // ← new
  }                                                            // ← new
  return result;                                              // ← new
}                                                              // ← new
```

### Isolating the Concept

```js
const A = [[1,0,5],[0,1,3],[0,0,1]];
const B = [[2,0,0],[0,2,0],[0,0,1]];
console.log("A =", JSON.stringify(A));
console.log("B =", JSON.stringify(B));
console.log("A*B =", JSON.stringify(multiplyMatrices(A, B)));
```

Real output:

```
A = [[1,0,5],[0,1,3],[0,0,1]]
B = [[2,0,0],[0,2,0],[0,0,1]]
A*B = [[2,0,5],[0,2,3],[0,0,1]]
```

Matches the by-hand result exactly.

### Discarding

Discarded — the real, permanent function is `multiplyMatrices`.

### Mechanical Walkthrough

- **`function multiplyMatrices(a, b) { ... }`** — (b) a concept
  reappearing — ordinary function declaration.
- **The nested `for` loops (`row`, `col`, `k`)** — (a) first appearance of
  a **nested loop** in this project — a loop running inside another loop,
  here three deep, needed because filling a 2D grid of results requires
  iterating over two dimensions (`row`, `col`), and computing *each* of
  those results requires a third pass (`k`) summing products along a row
  and column.
- **`let sum = 0;`** — (a) first appearance of `let` in this project (as
  opposed to `const`) — needed here specifically because `sum` genuinely
  changes value across the `k` loop's iterations, unlike every `const` used
  so far, which were each assigned exactly once.
- **`a[row][k] * b[k][col]`** — (c) genuinely basic — array indexing and
  multiplication, both already established; the specific index pattern
  (`row`/`k` on one matrix, `k`/`col` on the other) is what encodes "row
  times column," directly from the by-hand definition above.

### CS Lens

Matrix multiplication via triple-nested loops is the textbook algorithm —
worth naming for what it is, since faster approaches exist for large
matrices.

```
Also recognized in: this exact triple-loop shape appears in nearly every
introductory algorithms course as the "naive" matrix multiply, contrasted
against faster algorithms (Strassen's algorithm, and others) that matter
at large scale; database join algorithms have an analogous naive
nested-loop join; image convolution (used in Arc 6/7's graphics and any
future ML-adjacent work) uses the identical nested-loop-over-a-grid shape
```

### SE Lens

The alternative not chosen: only ever apply transformations to points one
at a time, in sequence, and never build a `multiplyMatrices` function at
all. That works — the next unit proves sequential application gives
identical results to composition. The real cost of skipping composition
entirely: a toolpath with many points, transformed through several steps
(rotate, then scale, then translate), would re-run all three
transformations against *every single point*, every time. Composing the
three matrices once, then applying the single result to every point, does
the expensive multi-step math exactly once — a genuine performance
difference once shapes have hundreds of points, which toolpaths in Arc 4
will.

### Run It

Real output already shown above.

### Connecting

Two matrices can now combine into one — the next unit proves that combined
matrix genuinely behaves the same as applying each transformation in
sequence.

---

## Concept Unit: Composing Transformations

### The Problem

`multiplyMatrices` produces *some* matrix — nothing yet proves that matrix
actually represents "do transformation A, then transformation B," rather
than something unrelated. This needs to be checked against the thing it's
supposed to replace: applying the two transformations one at a time.

### By Hand

Translate `(0,0)` by `(100, 0)`, then rotate the result by `90°`:

```
step 1 (translate): (0,0) + (100,0) = (100, 0)
step 2 (rotate 90°): (100 cos90° − 0 sin90°, 100 sin90° + 0 cos90°)
                    = (100×0 − 0×1, 100×1 + 0×0)
                    = (0, 100)
```

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none new — this unit verifies `multiplyMatrices`
  against `applyMatrix` used sequentially; no new function is needed.
- **Change type:** n/a (concept-only unit)
- **Location:** n/a
- **Dependencies:** `multiplyMatrices`, `translationMatrix`,
  `rotationMatrix`, `applyMatrix`

### Isolating the Concept

```js
const T = translationMatrix(100, 0);
const R = rotationMatrix(Math.PI / 2);
const point = { x: 0, y: 0 };

// Sequential: translate, then rotate
const afterT = applyMatrix(T, point);
const sequential = applyMatrix(R, afterT);
console.log("sequential (translate then rotate): " + JSON.stringify(afterT) + " -> " + JSON.stringify(sequential));

// Composed: multiply the matrices first, apply once
const RT = multiplyMatrices(R, T);
const composed = applyMatrix(RT, point);
console.log("composed (R * T, applied once):", JSON.stringify(composed));
```

Real output:

```
sequential (translate then rotate): {"x":100,"y":0} -> {"x":6.123233995736766e-15,"y":100}
composed (R * T, applied once): {"x":6.123233995736766e-15,"y":100}
```

What this proves: applying `T` then `R` one at a time, and applying the
single matrix `R * T` (built via `multiplyMatrices`) once, produce
*identical* results — down to the same floating-point residue from
Lesson 13's `sin`/`cos` imprecision. This confirms `R * T`, as a single
matrix, genuinely represents "do `T`, then do `R`" — reading the
multiplication `R * T` right-to-left, matching how it's applied:
`applyMatrix(R, applyMatrix(T, point))` corresponds to `R * T`, not
`T * R` (proven to actually differ, in the next unit).

### Discarding

Discarded — the standalone check is illustrative; real project usage of
composed matrices begins in the next unit and continues into Lesson 16.

### CS Lens

Not a new hard concept here — this unit is verification of the previous
unit's function; the broader significance of composability is exactly
what the next unit's order-dependence makes concrete.

### SE Lens

The alternative not chosen: trust `multiplyMatrices` without this
cross-check, on the assumption that the by-hand row/column formula from
the previous unit is self-evidently correct. The real value of this
verification: it's cheap (one extra comparison) and catches a whole class
of mistake — an index swapped in `multiplyMatrices`'s triple loop, for
instance, could easily produce a matrix that looks plausible but doesn't
actually correspond to "apply these two transformations in sequence,"
exactly the kind of subtle, silent bug this curriculum has repeatedly
demonstrated is easy to introduce and hard to notice without a real,
independent check.

### Run It

Real output already shown above.

### Connecting

Composition is proven correct — the final unit is why getting the *order*
of that composition right actually matters.

---

## Concept Unit: Why Order Matters

### The Problem

Matrix multiplication, unlike ordinary number multiplication, is not
commutative — `A × B` and `B × A` are generally different matrices. For
transformations specifically, this has a very concrete meaning: "rotate,
then move" and "move, then rotate" are genuinely different operations,
not two ways of describing the same thing.

### By Hand

The same translation and rotation as the previous unit, but reversed —
rotate first, then translate:

```
step 1 (rotate 90°): (0,0) rotated is still (0,0) — rotation never
                       moves the origin (Lesson 13)
step 2 (translate):  (0,0) + (100, 0) = (100, 0)
```

Compare directly to the previous unit's result for the *other* order:

```
translate-then-rotate: (0,0) -> (100,0) -> (0,100)
rotate-then-translate: (0,0) -> (0,0)   -> (100,0)
```

Same two transformations, same starting point, same two operations —
genuinely different final positions: `(0, 100)` versus `(100, 0)`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none new — this unit is verification and a real
  worked comparison; no new function is needed beyond what already exists.
- **Change type:** n/a (concept-only unit)
- **Location:** n/a
- **Dependencies:** everything from this lesson's previous two units

### Isolating the Concept

```js
const T = translationMatrix(100, 0);
const R = rotationMatrix(Math.PI / 2);
const point = { x: 0, y: 0 };

const afterR = applyMatrix(R, point);
const rotateThenTranslate = applyMatrix(T, afterR);
console.log("rotate then translate: " + JSON.stringify(afterR) + " -> " + JSON.stringify(rotateThenTranslate));

const TR = multiplyMatrices(T, R);
console.log("composed (T * R, applied once):", JSON.stringify(applyMatrix(TR, point)));

console.log("--- comparing both orders directly ---");
console.log("R * T (translate then rotate):", JSON.stringify(applyMatrix(multiplyMatrices(R, T), point)));
console.log("T * R (rotate then translate):", JSON.stringify(applyMatrix(TR, point)));
```

Real output:

```
rotate then translate: {"x":0,"y":0} -> {"x":100,"y":0}
composed (T * R, applied once): {"x":100,"y":0}
--- comparing both orders directly ---
R * T (translate then rotate): {"x":6.123233995736766e-15,"y":100}
T * R (rotate then translate): {"x":100,"y":0}
```

What this proves, concretely: `T * R`, applied once, matches the
"rotate-then-translate" sequential result exactly, the same
cross-verification pattern the previous unit established — and the two
composed results, `R * T` and `T * R`, are genuinely, measurably
different: `(≈0, 100)` versus `(100, 0)`. Same two matrices, same starting
point, different order, different answer.

### Discarding

Discarded — this comparison is the lesson's core proof, not permanent
project code; both `translationMatrix(100, 0)` and `rotationMatrix(Math.PI
/ 2)` are illustrative example transforms, not fixtures this project keeps.

### Mechanical Walkthrough

Nothing new mechanically — this unit reuses every function already
explained in this lesson and Lessons 12–14, applied in a different order.

### CS Lens

Matrix multiplication being non-commutative — genuinely one of the more
counterintuitive facts for anyone coming from ordinary arithmetic, where
multiplication order never matters — is worth naming clearly.

```
Also recognized in: function composition generally (put your socks on,
then shoes, versus shoes then socks — order matters even though both are
"the same two actions"), 3D graphics transform pipelines (a notorious
source of real bugs when model/view/projection matrices are multiplied in
the wrong order), robotic arm joint transformations (rotating a joint
before or after translating along it produces physically different arm
positions), quantum mechanics operators (a foundational example of
non-commuting operations)
```

### SE Lens

The alternative not chosen: pick one fixed order (say, always
translate-then-rotate) and never expose the choice, hoping it happens to
match every future use case. The real cost: this project's later
lessons — particularly Lesson 16's "rotate about an arbitrary point,"
immediately next — genuinely need *both* orders for different purposes
within the very same operation. Hiding the order-dependence, rather than
naming it explicitly here with real proof, would leave a future version
of this project's code choosing an order by accident rather than by
understanding, exactly the failure mode this lesson exists to prevent.

### Commands Needed

None new.

### Run It

Real output already shown above.

### Connecting

Order-dependence is now proven, not just warned about — this is precisely
the mechanism Lesson 16 relies on to rotate a shape around a point other
than the origin, by deliberately composing translate → rotate → translate-
back in a specific, necessary order.

---

## Closing

### Connect the Pieces

One point, `(0, 0)`, and two transformations — `translationMatrix(100,
0)` and `rotationMatrix(90°)` — traced through the entire lesson.
`multiplyMatrices` (Unit 1) combines them into a single matrix, either
`R * T` or `T * R`. Unit 2 proves `R * T`, applied once, exactly matches
translating then rotating. Unit 3 proves `T * R`, applied once, exactly
matches rotating then translating — and that these two, genuinely valid,
correctly-composed results are different final points: `(≈0, 100)` and
`(100, 0)`. Neither is "wrong" — they're answers to two different
questions, and knowing which question is actually being asked is the
entire point of this lesson.

### What Breaks Without This

Picking the wrong order by accident — wanting "rotate this shape, then
move it into position" (rotate-then-translate) but composing the matrices
as `R * T` instead of `T * R`:

```js
const T = translationMatrix(100, 0);
const R = rotationMatrix(Math.PI / 2);
const point = { x: 0, y: 0 };

const intended = applyMatrix(multiplyMatrices(T, R), point);   // correct: rotate, then translate
const wrongOrder = applyMatrix(multiplyMatrices(R, T), point); // accidentally swapped

console.log("intended (rotate then translate):", JSON.stringify(intended));
console.log("wrong order (accidentally translate then rotate):", JSON.stringify(wrongOrder));
```

Real output:

```
intended (rotate then translate): {"x":100,"y":0}
wrong order (accidentally translate then rotate): {"x":6.123233995736766e-15,"y":100}
```

Both calls run without error, and both produce a perfectly plausible-
looking point — nothing about `wrongOrder`'s output looks obviously
broken on its own. For a real toolpath, this is the difference between a
cut landing exactly where intended and landing somewhere else entirely,
with no error message pointing at the cause — precisely why this lesson
proved the distinction with real numbers rather than leaving it as a rule
to memorize.

### Exercises

- By hand, predict `rotationMatrix(90°) * scaleMatrix(2,2)` applied to
  `(1, 0)`, versus `scaleMatrix(2,2) * rotationMatrix(90°)` applied to the
  same point. (Hint: for this particular pair, do the two orders actually
  disagree? Compute both and explain why, geometrically, scaling and
  rotation might commute even though translation and rotation don't.)
- Using `multiplyMatrices`, compose all three transformations — translate,
  rotate, scale — into one matrix, in some order of your choosing, and
  apply it to a shape from an earlier lesson's exercises.
- Write a short comment (in your own project, not required in this
  lesson's file) explaining, in your own words, why `R * T` corresponds to
  "T first, then R" rather than "R first, then T" — this is a genuinely
  easy detail to misremember.

### Definition of Done

- [ ] `multiplyMatrices` exists in `script.js` and matches its by-hand
      derivation exactly
- [ ] You've reproduced, with real numbers, that `R * T` and `T * R` give
      different results for at least one translate/rotate pair
- [ ] You can explain, without looking, which sequential order a
      composed matrix `A * B` corresponds to
- [ ] Commit:

  ```
  git add script.js
  git commit -m "Add matrix composition (multiplyMatrices) and prove order matters

  multiplyMatrices combines two 3x3 transforms into one, verified against
  sequential application for both R*T and T*R. Proved with real numbers
  that the two orders produce genuinely different results for the same
  translate/rotate pair - not a hypothetical warning but a measured
  (0,100) vs (100,0) discrepancy from the same starting point."
  ```
