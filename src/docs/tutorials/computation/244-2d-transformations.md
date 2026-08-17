# Lesson 244: 2D Transformations — Composing Real Graphics Operations

**What you will build**: `affine-multiply`, combining two `3x3` affine
matrices into one, extended directly from Lesson 235's own `2x2`
`matrix-multiply`; `transform-triangle`, applying a single combined
matrix to every vertex of a real shape at once; and
`rotate-around-pivot`, the actual technique real graphics software uses
to spin an object around any point, not just the origin — built from
nothing but `translation-matrix` and `affine-multiply`, both already in
hand from Lesson 243. Every piece is verified against real, hand-checked
coordinates, including a genuine, concrete case where composing the same
two transformations in the opposite order sends an identical starting
point to two completely different places.

**What you need to know first**: Lesson 235's own `matrix-multiply` and
its already-proven non-commutativity for `2x2` matrices — this lesson
extends the identical idea to `3x3`. Lesson 243's `make-hpoint`,
`affine-row`, `dot-product3`, `affine-transform`, `translation-matrix`,
and `embed-linear` — every one reused directly. Lesson 234's own
`rotate90`, reused again as this lesson's own running example.

**Terms used in this lesson**:

- **composing transformations** — reused from Lesson 235: combining two
  transformations into a single one that produces the identical result
  as applying them one after another, now extended from `2x2` matrices
  to the `3x3` affine matrices Lesson 243 built.
- **pivot** — the fixed point a rotation (or scale) is meant to happen
  *around*; `rotate90`, on its own, always rotates around the origin —
  this lesson builds the real technique for rotating around any other
  point instead.
- **shape** (as used in this lesson) — several homogeneous points
  considered together as one composite object, so a single transformation
  can be applied to all of them at once and still describe one coherent
  object afterward, not just several independently-moved points.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`affine-row`** / **`dot-product3`** / **`affine-transform`** /
  **`translation-matrix`** / **`make-affine`**
  - *What they are:* reused unchanged from Lesson 243.
  - *Their use:* `affine-multiply` (this lesson's own Unit 1) is built
    directly from `affine-row`, `dot-product3`, and `make-affine`;
    `affine-transform` and `translation-matrix` are reused, unmodified,
    everywhere this lesson actually applies a transformation to a point.
- **`get`** / **`-`** / **`*`** / **`+`**
  - *What they are:* Clojure's positional lookup, subtraction,
    multiplication, and addition functions, reused throughout this
    curriculum since its earliest arithmetic.
  - *Their use:* reading rows and columns, and computing every dot
    product `affine-multiply` needs.

---

## Concept Unit: Composing Two Affine Matrices Into One

### The Problem

Lesson 235 derived exactly what a combined `2x2` matrix needs to contain
to reproduce two chained `matrix-vector-multiply` calls in a single
matrix, by working through what the chained computation actually
expands to. Lesson 243's own `3x3` affine matrices can each represent a
rotation, a scale, or a translation — but nothing yet combines two of
them into one, the same real capability `matrix-multiply` already gave
`2x2` matrices. Applying a rotation, then separately applying a
translation, works today by calling `affine-transform` twice — real, but
not yet a single reusable matrix.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition, extending Lesson 235's own derivation from `2x2` to `3x3`
  directly, not porting from any external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn affine-column [a index]
  [(get (affine-row a 0) index) (get (affine-row a 1) index) (get (affine-row a 2) index)])

(defn affine-multiply-row [a2-row a1]
  [(dot-product3 a2-row (affine-column a1 0)) (dot-product3 a2-row (affine-column a1 1)) (dot-product3 a2-row (affine-column a1 2))])

(defn affine-multiply [a2 a1]
  (make-affine
    (affine-multiply-row (affine-row a2 0) a1)
    (affine-multiply-row (affine-row a2 1) a1)
    (affine-multiply-row (affine-row a2 2) a1)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn affine-column [a index] ...)` — `get` and `affine-row`, both
reappearing from Lesson 243, read position `index` out of all three of
`a`'s own rows, bundling them into a vertical **column** — the identical
idea Lesson 235's own `matrix-column` already established for `2x2`
matrices, extended here to three positions instead of two.

`(defn affine-multiply-row [a2-row a1] ...)` — `dot-product3`,
reappearing from Lesson 243, dots `a2-row` against each of `a1`'s own
three columns in turn, producing one full row of the combined matrix —
the identical shape as Lesson 235's own `matrix-multiply-row`, extended
from two dot products to three.

`(defn affine-multiply [a2 a1] ...)` — `affine-row`, reappearing, reads
each of `a2`'s own three rows; `affine-multiply-row`, just built, turns
each one into a full row of the result; `make-affine`, reappearing from
Lesson 243, assembles the three results into the combined matrix. The
argument order matches Lesson 235's own established convention exactly:
`a1` is applied *first*, `a2` *second* — `affine-multiply(a2, a1)` means
"do `a1`, then `a2`," matching ordinary function-composition notation,
`f(g(x))`.

### CS Lens

This is the identical **composition-by-construction** idea Lesson 235
already proved for `2x2` matrices, now shown to extend cleanly to `3x3`
— real evidence the underlying technique wasn't specific to two
dimensions, only to "however many dimensions the matrix actually has."
Also recognized in: `4x4` homogeneous matrix composition in real `3D`
graphics pipelines (the direct generalization of what this lesson just
built), robotics kinematic chains where each joint's own transform
composes onto the next, and any compiler pass that fuses two separate
transformations of a program into one combined pass specifically to
avoid running the intermediate representation twice.

### SE Lens

The alternative — calling `affine-transform` twice, once per
transformation, every time a point needs both a rotation and a
translation applied — works, and this lesson's own Unit 2 still uses
that approach directly wherever composing isn't the point. What
`affine-multiply` buys instead: computing the combined matrix *once* and
reusing it against many points costs one matrix multiplication up front,
then only a single `affine-transform` call per point afterward, instead
of two — a real, meaningful saving the moment a shape has more than a
couple of vertices, which Unit 2's own triangle already does.

### Run It — Real Output

```
user=> (def rotate90 (make-matrix (make-vector 0 -1) (make-vector 1 0)))
#'user/rotate90
user=> (def rotate90-affine (embed-linear rotate90))
#'user/rotate90-affine
user=> (def t (translation-matrix 5 2))
#'user/t
user=> (def rotate-then-translate (affine-multiply t rotate90-affine))
#'user/rotate-then-translate
user=> rotate-then-translate
[[0 -1 5] [1 0 2] [0 0 1]]
user=> (affine-transform rotate-then-translate (make-hpoint 1 0))
[5 3 1]
user=> (def translate-then-rotate (affine-multiply rotate90-affine t))
#'user/translate-then-rotate
user=> translate-then-rotate
[[0 -1 -2] [1 0 5] [0 0 1]]
user=> (affine-transform translate-then-rotate (make-hpoint 1 0))
[-2 6 1]
user=> (= rotate-then-translate translate-then-rotate)
false
```

`(1, 0)`, rotated `90°` and then translated by `(5, 2)`, lands at `(5,
3)`. The *identical starting point*, translated by `(5, 2)` first and
then rotated `90°`, lands at `(-2, 6)` — a genuinely different result,
and the two combined matrices themselves are provably different objects,
not just different for this one point — the exact same non-commutativity
Lesson 235 already proved for pure `2x2` rotation-and-scale, now shown
to hold once real translation enters the picture too.

### Connection

A single combined matrix can now represent "rotate, then translate" (or
the reverse) as one real object. The next unit applies a transformation
like that to more than one point at once — an actual shape, not a single
floating coordinate.

---

## Concept Unit: Transforming a Real Shape

### The Problem

Every transformation so far has moved exactly one homogeneous point.
Real graphics work moves *shapes* — several points that together
describe one coherent object, like a triangle's own three corners — and
transforming the shape has to mean transforming every one of its points
by the *identical* matrix, so the shape keeps its own size and form and
simply moves or rotates or scales as a whole.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition, applying Lesson 243's own `affine-transform` to a small,
  fixed structure rather than porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn make-triangle [p1 p2 p3] [p1 p2 p3])
(defn triangle-p1 [tri] (get tri 0))
(defn triangle-p2 [tri] (get tri 1))
(defn triangle-p3 [tri] (get tri 2))

(defn transform-triangle [a tri]
  (make-triangle
    (affine-transform a (triangle-p1 tri))
    (affine-transform a (triangle-p2 tri))
    (affine-transform a (triangle-p3 tri))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn make-triangle [p1 p2 p3] [p1 p2 p3])` — the identical
vector-as-fixed-structure shape this curriculum has used since Lesson
92's own tree nodes: three homogeneous points, bundled into one plain
three-element Clojure vector, representing one triangle's own three
corners.

`(defn triangle-p1 [tri] (get tri 0))` / `triangle-p2` / `triangle-p3` —
`get`, reappearing, three small accessors reading each corner back out
by position, the identical pattern as every earlier structured-data
accessor this curriculum has built.

`(defn transform-triangle [a tri] ...)` — `triangle-p1`/`p2`/`p3`, just
built, read out each of the triangle's three corners; `affine-transform`,
reappearing from Lesson 243, applies the *identical* matrix `a` to each
one individually; `make-triangle`, just built, reassembles the three
transformed points into a new triangle. Nothing here is a general
"transform any shape of any size" — this is a fixed, honest three-point
structure, matching this curriculum's own established pattern of
building concrete, specific-arity structures rather than reaching for
general collection processing.

### CS Lens

This is applying **the same operation uniformly across a composite
structure's own parts**, while preserving the structure itself — the
triangle that comes out is still recognizably a triangle, with the same
three-corner shape, just moved. Also recognized in: applying a single
CSS transform to every element inside a container in web graphics,
transforming every vertex of a `3D` mesh by the identical model matrix
in a real game engine, and a database migration applying the identical
schema change to every row in a table without changing which rows relate
to which.

### SE Lens

The alternative — calling `affine-transform` on each of the triangle's
three points separately, by hand, at every call site that needs to move
a triangle — would work, but would spread the "a triangle has exactly
three corners" fact across every caller instead of keeping it in one
place. `transform-triangle` keeps that fact local to itself: a caller
just says "transform this triangle by this matrix," the same shape as
every other one-operation-one-job function this curriculum has built
since Lesson 56's own "compute once, pass to a helper" pattern.

### Run It — Real Output

```
user=> (def triangle (make-triangle (make-hpoint 0 0) (make-hpoint 2 0) (make-hpoint 0 2)))
#'user/triangle
user=> triangle
[[0 0 1] [2 0 1] [0 2 1]]
user=> (transform-triangle rotate90-affine triangle)
[[0 0 1] [0 2 1] [-2 0 1]]
user=> (transform-triangle t triangle)
[[5 2 1] [7 2 1] [5 4 1]]
```

Rotated `90°`, the triangle's own corner at the origin, `(0, 0)`, stays
exactly at the origin (rotating a point that's already at the center of
rotation never moves it); `(2, 0)` and `(0, 2)` swap roles, matching
`rotate90`'s own already-established "east becomes north" behavior.
Translated by `(5, 2)` instead, every one of the three corners shifts by
the exact identical amount — the triangle's own shape (the distances and
angles between its corners) is completely unchanged, only its position.

### Connection

`rotate90-affine`, applied directly, always rotates around the origin —
the triangle's own corner sitting at `(0, 0)` is the only reason that
looked natural here. The next unit builds the real technique for
rotating around any other point.

---

## Concept Unit: Rotating Around an Arbitrary Pivot

### The Problem

`rotate90-affine`, applied on its own, always rotates around the origin
— genuinely useful when a shape is already centered there, as this
lesson's own triangle happened to be, but real graphics work constantly
needs to rotate an object around its own center, or around some other
chosen point, not the coordinate origin. Is there a real way to build
"rotate around point `P`" from the pieces already in hand, without
writing a brand-new kind of matrix from scratch?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition, composing Lesson 243's own `translation-matrix` with this
  lesson's own `affine-multiply`, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Built entirely from
  `translation-matrix` (Lesson 243) and `affine-multiply` (this lesson's
  own Unit 1) — no new arithmetic of its own.

### The New Code

```clojure
(defn rotate-around-pivot [rotation px py]
  (affine-multiply (translation-matrix px py) (affine-multiply rotation (translation-matrix (- px) (- py)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn rotate-around-pivot [rotation px py] ...)` — read from the inside
out, matching the actual order of operations this composed matrix
performs: `(translation-matrix (- px) (- py))` — `-`, reappearing,
negates both pivot coordinates, building a matrix that shifts the pivot
point *to* the origin. `(affine-multiply rotation ...)` — `rotation`
(any already-embedded `3x3` linear transformation, `rotate90-affine` in
this lesson's own examples) is composed *after* that shift, so the whole
object rotates while its own pivot sits at the origin, exactly where
`rotation` already knows how to rotate around. The outer
`(affine-multiply (translation-matrix px py) ...)` shifts everything back
by the *original*, un-negated `px`/`py`, restoring the pivot to its real
location. Three transformations, composed into one matrix: shift pivot to
origin, rotate, shift back — the standard real technique, built from
nothing but two functions already fully verified in earlier units.

### CS Lens

This is a **change of reference frame**, temporary and local to one
computation: rather than building special "rotate around an arbitrary
point" machinery from scratch, the problem is reduced to one already
solved (rotating around the origin) by shifting into a frame where that
solved version applies, then shifting back. Also recognized in: Lesson
237's own change of basis, converting coordinates into a frame where a
computation is easier before converting back; graphics engines
temporarily working in an object's own "local space" before transforming
back into "world space"; and physics simulations that move into a
moving object's own reference frame to simplify its equations of motion,
then transform the result back into the stationary observer's frame.

### SE Lens

The alternative — deriving a single new matrix formula for "rotate by
angle `θ` around point `(px, py)`" directly, without composing three
separate matrices — exists, and real graphics libraries sometimes
precompute exactly that closed form for speed. This lesson's own
composed version costs two real matrix multiplications instead of one
direct formula, in exchange for needing zero new derivation: it reuses
`translation-matrix` and `affine-multiply`, both already fully verified,
rather than deriving and separately verifying new arithmetic — the exact
same "compose from already-verified pieces" tradeoff Lesson 240's own
`eigenvector-of?` already made, applied here to composing matrices
instead of composing predicates.

### Run It — Real Output

```
user=> (def pivot-rotation (rotate-around-pivot rotate90-affine 2 2))
#'user/pivot-rotation
user=> pivot-rotation
[[0 -1 4] [1 0 0] [0 0 1]]
user=> (affine-transform pivot-rotation (make-hpoint 4 2))
[2 4 1]
user=> (affine-transform pivot-rotation (make-hpoint 2 2))
[2 2 1]
user=> (affine-transform rotate90-affine (make-hpoint 4 2))
[-2 4 1]
```

`(4, 2)` — two units to the right of the pivot `(2, 2)` — rotates `90°`
around that pivot to `(2, 4)`, directly "above" the pivot by the
identical distance: a real, correct rotation around a real, non-origin
point. The pivot itself, `(2, 2)`, transforms to `(2, 2)` — completely
unmoved, exactly as a real pivot has to be: a point can't rotate around
itself and end up anywhere else. The last line is the real contrast: the
*identical* starting point, `(4, 2)`, rotated around the *origin*
instead (`rotate90-affine` applied directly, no pivot shift at all)
lands at `(-2, 4)` — a completely different result, proof the pivot
genuinely changes what "rotate `90°`" means, not just where the answer
happens to land.

### Connection

The closing section traces one point, the triangle's own corner
farthest from the origin, through composition, shape-transformation, and
pivot-rotation together.

---

## Connect the Pieces

One triangle, `[(0, 0), (2, 0), (0, 2)]`, and one of its own corners,
`(2, 0)`, moving through every unit built in this lesson:

1. `affine-multiply(translation-matrix(5, 2), rotate90-affine)` (Unit 1)
   → `[[0, -1, 5], [1, 0, 2], [0, 0, 1]]` — rotate first, then translate,
   composed into one matrix.
2. `affine-transform` of that combined matrix on `(2, 0)`: row `0`:
   `0*2 + -1*0 + 5*1 = 5`; row `1`: `1*2 + 0*0 + 2*1 = 4`; row `2`: `1` →
   `(5, 4)` — rotating `(2, 0)` gives `(0, 2)` (Lesson 234's own
   established rotation fact), then translating by `(5, 2)` gives `(5,
   4)`, matching this single-matrix computation exactly.
3. `transform-triangle(rotate90-affine, triangle)` (Unit 2) → `[(0, 0),
   (0, 2), (-2, 0)]` — the whole triangle, rotated as one object; `(2,
   0)`'s own new position, `(0, 2)`, matches step 2's own intermediate
   value exactly.
4. `rotate-around-pivot(rotate90-affine, 2, 2)` (Unit 3), applied to `(2,
   0)` — this corner is exactly `2` units *below* the pivot `(2, 2)`, so
   rotating it `90°` around that pivot should land it `2` units to the
   pivot's own *left*: `(0, 2)`. Real check: row `0` of the pivot matrix,
   `[0, -1, 4]`, dotted with `[2, 0, 1]`: `0*2 + -1*0 + 4*1 = 4`; row `1`,
   `[1, 0, 0]`, dotted with the same: `1*2 + 0*0 + 0*1 = 2` → `(4, 2)`.

Step 4's own result, `(4, 2)`, is genuinely different from step 3's
`(0, 2)` — the identical starting corner, the identical `90°` rotation,
producing two different real answers depending entirely on which point
the rotation happened around: the origin in step 3, `(2, 2)` in step 4.
That contrast is this whole lesson's actual payoff: a rotation was never
a complete instruction on its own — it always needed a pivot, and every
transformation this curriculum built before Lesson 243 was silently
assuming that pivot was the origin.

## What Breaks Without This

Forget to shift back after rotating — build the pivot rotation with only
two of its own three composed pieces:

```clojure
(defn rotate-around-pivot-broken [rotation px py]
  (affine-multiply rotation (translation-matrix (- px) (- py))))
```

```
user=> (affine-transform (rotate-around-pivot-broken rotate90-affine 2 2) (make-hpoint 4 2))
[0 2 1]
```

The correct answer, from Unit 3, was `(2, 4)`. The broken version gives
`(0, 2)` — it correctly shifts the pivot to the origin and rotates, but
then never shifts the result back to where the real pivot actually was,
leaving every point stranded in the temporary, shifted frame the
computation only ever meant to pass through. This is Unit 3's own CS
Lens made concrete: a change of reference frame that forgets its own
"shift back" step doesn't just give a slightly wrong answer — it reports
a result that's still correct *relative to the wrong origin*, exactly
the kind of bug that can look plausible (a real point, a real
`90°`-rotated-looking position) while being completely wrong for the
actual pivot asked for. Restoring the missing composition:

```
user=> (affine-transform (rotate-around-pivot rotate90-affine 2 2) (make-hpoint 4 2))
[2 4 1]
```

matches the real, pivot-correct answer again.

## Exercises

1. Build `rotate-around-pivot` for a `180°` rotation (Lesson 234's own
   exercise 1 matrix, embedded with `embed-linear`) around the pivot
   `(1, 1)`. Apply it to `(1, 1)` itself and to `(3, 1)`, and confirm the
   pivot stays fixed while the other point lands exactly opposite its own
   starting position relative to the pivot.
2. `transform-triangle` is fixed at exactly three points. Using
   `make-triangle` and `transform-triangle` as a model, build
   `make-quad`/`quad-p1`through `quad-p4`/`transform-quad` for a
   four-cornered shape, and transform a real square by a
   `rotate-around-pivot` of your own choosing.
3. Compose three transformations instead of two: scale a triangle by
   `2` (Lesson 234's own `scale2-matrix`, embedded), then rotate it `90°`
   around its own centroid (the average of its three corners, computed
   by hand), then translate the whole result by `(10, 0)`. Verify by
   applying the three matrices one at a time to a single corner, and
   confirming it matches applying the fully-composed single matrix.

## Definition of Done

- [ ] `affine-multiply` combines `rotate90-affine` and a real translation
      correctly, verified against direct application of both matrices in
      sequence.
- [ ] `affine-multiply` in the reverse order produces a genuinely
      different matrix and a genuinely different result on the same
      point, confirmed with `=`.
- [ ] `transform-triangle` correctly rotates and separately translates a
      real triangle, preserving its own shape in both cases.
- [ ] `rotate-around-pivot` correctly rotates a point around a
      non-origin pivot, the pivot itself stays fixed under its own
      rotation, and the result is confirmed to differ from rotating the
      identical point around the origin instead.
- [ ] The missing-shift-back bug was reproduced for real
      (`rotate-around-pivot-broken` landing at the wrong, origin-relative
      position), then fixed back to the correct three-part composition.
- [ ] `git commit` with a message explaining *why* `rotate-around-pivot`
      is built from three composed matrices rather than one direct
      formula — for example: `"Build rotate-around-pivot by composing
      translation-matrix and affine-multiply — reuses already-verified
      pieces instead of deriving new pivot-rotation arithmetic from
      scratch."`
