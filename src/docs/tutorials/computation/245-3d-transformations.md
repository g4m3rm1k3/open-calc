# Lesson 245: 3D Transformations — One More Dimension, the Same Machinery

**What you will build**: Homogeneous points and vectors, an affine
matrix, translation, a real rotation, and matrix composition — every
piece Lessons 243 and 244 already built for 2D, extended by exactly one
dimension. A `2D` homogeneous point was `[x, y, 1]`, transformed by a
`3x3` matrix; a `3D` homogeneous point is `[x, y, z, 1]`, transformed by
a `4x4` matrix, with the identical `w = 1` for points, `w = 0` for
vectors distinction doing the identical job. This is the real
representation graphics engines, robotics, and CAD software actually use
for every object they render or move.

**What you need to know first**: Lesson 243's own homogeneous-coordinate
idea in full — `w` marking a point versus a vector, and a translation's
own numbers reaching a point but multiplying out to nothing against a
vector's `w = 0`. Lesson 244's `affine-multiply`, the pattern this
lesson's own `affine3-multiply` extends directly. Lesson 234's own
`rotate90`, reused one more time as the two-dimensional rotation this
lesson embeds into three dimensions.

**Terms used in this lesson**:

- **homogeneous coordinates in 3D** — reused from Lesson 243, extended by
  one dimension: a `3D` point or vector written with a fourth component,
  `w`, again `1` for a point and `0` for a vector, for the identical
  reason as before.
- **affine matrix (3D)** — a `4x4` matrix representing a `3D` affine
  transformation — the direct extension of Lesson 243's own `3x3`
  representation to one more spatial dimension.
- **rotation about an axis** — a `3D` rotation has to specify *which
  line* it spins around, not just an angle — a genuinely new idea `2D`
  rotation never needed, since every `2D` rotation implicitly spins
  around a single point (or, with Lesson 244's own `rotate-around-pivot`,
  a chosen point) rather than a whole line running through space.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`get`** / **`+`** / **`*`**
  - *What they are:* Clojure's positional lookup, addition, and
    multiplication functions, reused throughout this curriculum since
    its earliest arithmetic.
  - *Their use:* every `4`-component point, vector, and matrix row in
    this lesson is read and combined through these three, the identical
    pattern as every earlier lesson's `2`- and `3`-component data.

---

## Concept Unit: Homogeneous Points and Vectors in 3D

### The Problem

Lesson 231 built `2D` points as `[x, y]`; Lesson 243 added a third
number, `w`, to make translation a real matrix operation. A `3D` point
needs a `z` coordinate that `2D` never had — does adding `z` change
anything about how `w` itself works, or does the identical trick from
Lesson 243 carry over unchanged, just with one more ordinary coordinate
riding alongside it?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition, extending Lesson 243's own `2D` homogeneous representation to
  three dimensions directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn make-hpoint3 [x y z] [x y z 1])
(defn make-hvector3 [dx dy dz] [dx dy dz 0])

(defn hx3 [h] (get h 0))
(defn hy3 [h] (get h 1))
(defn hz3 [h] (get h 2))
(defn hw3 [h] (get h 3))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn make-hpoint3 [x y z] [x y z 1])` — the body is a plain
four-element Clojure vector: `x`, `y`, `z`, and a literal `1`. The
identical shape as Lesson 243's own `make-hpoint`, with one genuinely new
coordinate, `z`, inserted before the `w` slot.

`(defn make-hvector3 [dx dy dz] [dx dy dz 0])` — the identical shape,
`w` fixed at `0` instead — a real `3D` displacement, not a location, the
same distinction Lesson 232 first drew between a point and a vector, now
carried into three dimensions.

`(defn hx3 [h] (get h 0))` / `hy3` / `hz3` / `hw3` — `get`, reappearing
from every earlier lesson's own accessors, reads each of the four
positions back out. `hw3` reads back exactly which kind of thing `h`
represents, the identical discriminated-representation idea Lesson 243's
own `hw` already established in full.

### CS Lens

This is the same **discriminated representation** Lesson 243 already
gave full treatment — one extra number in a value's own data
determining how later operations treat it, rather than tracked
separately. What's worth noticing here specifically is that the
technique needed *zero* new ideas to extend from two spatial dimensions
to three — only one more ordinary coordinate riding alongside the
identical `w`. Also recognized in: real `3D` graphics APIs (OpenGL,
Direct3D) using exactly this `[x, y, z, w]` layout for every vertex a
GPU ever processes, and CAD software representing every point in a
`3D` model the identical way.

### SE Lens

The alternative — inventing a genuinely different representation for
`3D` rather than extending the `2D` one — was never seriously in play
here: Lesson 243's own design (a discriminant riding alongside ordinary
coordinates) generalizes to any number of spatial dimensions without
changing its own core idea, which is exactly why real `3D` graphics
software uses this identical technique rather than something built from
scratch for three dimensions specifically. The cost is the same one
Lesson 243 already named: nothing enforces `hw3` being correct beyond
`make-hpoint3` and `make-hvector3`'s own naming discipline.

### Run It — Real Output

```
user=> (def p (make-hpoint3 3 4 5))
#'user/p
user=> (def v (make-hvector3 3 4 5))
#'user/v
user=> p
[3 4 5 1]
user=> v
[3 4 5 0]
```

### Connection

The representation is in place. The next unit checks whether translation
still behaves exactly the way Lesson 243 proved it must — moving the
point, leaving the vector alone.

---

## Concept Unit: Translation as a Real 4x4 Matrix

### The Problem

Lesson 243's `translation-matrix` was a `3x3` matrix built specifically
for `2D`'s three-component homogeneous points. A `3D` point has four
components now — does the identical construction (an identity matrix
with the translation amounts written into its own last column) still do
the identical job, one dimension larger?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition, extending Lesson 243's own `translation-matrix` to `4x4`
  directly, not porting from any external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn make-affine3 [row0 row1 row2 row3] [row0 row1 row2 row3])
(defn affine3-row [a index] (get a index))

(defn dot-product4 [v1 v2]
  (+ (* (get v1 0) (get v2 0)) (* (get v1 1) (get v2 1)) (* (get v1 2) (get v2 2)) (* (get v1 3) (get v2 3))))

(defn affine3-transform [a h]
  [(dot-product4 (affine3-row a 0) h) (dot-product4 (affine3-row a 1) h) (dot-product4 (affine3-row a 2) h) (dot-product4 (affine3-row a 3) h)])

(defn translation-matrix3 [tx ty tz]
  (make-affine3 [1 0 0 tx] [0 1 0 ty] [0 0 1 tz] [0 0 0 1]))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`make-affine3` and `affine3-row` — the identical shape as Lesson 243's
own `make-affine`/`affine-row`, holding four rows instead of three.
`dot-product4` — `+`, reappearing, sums four products instead of Lesson
243's own three; `*`, reappearing, multiplies each pair of matching
components across all four positions — the identical **dot product**
idea, generalized one more time. `affine3-transform` — the identical
shape as Lesson 243's own `affine-transform`, one `dot-product4` per row,
four rows instead of three. `translation-matrix3` — an identity-shaped
`4x4` matrix with `tx`, `ty`, `tz` written into the last column, the
identical construction as Lesson 243's own `translation-matrix`, now
with a third translation amount for `z`.

Trace `affine3-transform` against `(translation-matrix3 1 2 3)` and
`p = [3, 4, 5, 1]`: row `0` is `[1, 0, 0, 1]`; `dot-product4([1, 0, 0,
1], [3, 4, 5, 1]) = 3 + 1 = 4`. Row `1`: `4 + 2 = 6`. Row `2`: `5 + 3 =
8`. Row `3`: `1`. Result: `[4, 6, 8, 1]` — `x`, `y`, `z` each shifted by
their own translation amount, `w` still `1`. Against `v = [3, 4, 5, 0]`:
row `0`: `3 + 1*0 = 3` — the translation term multiplies against `v`'s
own trailing `0` and vanishes, exactly as Lesson 243 already proved for
`2D`. The full result: `[3, 4, 5, 0]` — completely unchanged.

### CS Lens

This is the identical mechanism Lesson 243's own Unit 3 already gave
full treatment: a real translation amount, sitting in a matrix's own
column, multiplied by `h`'s own `w` — `1` lets it through, `0` cancels
it, ordinary multiplication doing the discriminating work with no
conditional anywhere. What's genuinely new is confirming that mechanism
doesn't need to change at all when a third spatial dimension is added —
real evidence the underlying idea generalizes cleanly, not something
specific to two dimensions.

### SE Lens

The real engineering payoff here isn't a new idea — it's that *nothing*
about Lesson 243's own reasoning had to be re-derived, only extended by
one row, one column, and one dot product term. That's the actual argument
for building `2D` affine transformations first, the way Lessons 243 and
244 did: verifying the idea where it's easiest to check by hand, then
trusting the same construction one dimension further, checking it again
rather than assuming it.

### Run It — Real Output

```
user=> (def t3 (translation-matrix3 1 2 3))
#'user/t3
user=> t3
[[1 0 0 1] [0 1 0 2] [0 0 1 3] [0 0 0 1]]
user=> (affine3-transform t3 p)
[4 6 8 1]
user=> (affine3-transform t3 v)
[3 4 5 0]
```

### Connection

Translation works identically in `3D`. The next unit builds a real `3D`
rotation — genuinely new, since a rotation now needs to say *which axis*
it spins around.

---

## Concept Unit: Rotation Around the Z Axis

### The Problem

`2D` rotation never needed to specify an axis — there was only one plane
to rotate within. `3D` rotation is genuinely different: spinning around
the `z` axis, the `x` axis, and the `y` axis are three different
transformations, and a rotation around some arbitrary line through space
is harder still. A full derivation of rotation about an arbitrary `3D`
axis needs real trigonometry and vector-algebra machinery beyond this
lesson's own scope — the honest, representative core this lesson builds
instead is the *simplest* real `3D` rotation: spinning around the `z`
axis specifically, which turns out to need nothing genuinely new at all.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition, embedding Lesson 234's own `rotate90` into three dimensions,
  not porting from any external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses `rotate90`'s own
  real numbers from Lesson 234, embedded via `make-affine3` (this
  lesson's own Unit 2).

### The New Code

```clojure
(def rotate-z-90 (make-affine3 [0 -1 0 0] [1 0 0 0] [0 0 1 0] [0 0 0 1]))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(def rotate-z-90 ...)` — `def`, reappearing since this curriculum's
earliest lessons, binds a real, fixed matrix value. `make-affine3`,
reappearing from this lesson's own Unit 2, assembles four rows: the
first two, `[0, -1, 0, 0]` and `[1, 0, 0, 0]`, are exactly Lesson 234's
own `rotate90` (`[[0, -1], [1, 0]]`), each with two extra zeros appended
— no effect on `z`, no translation. The third row, `[0, 0, 1, 0]`, leaves
`z` completely untouched: whatever `z` a point or vector had going in,
it has coming out, unrotated. The fourth row, `[0, 0, 0, 1]`, is
`translation-matrix3`'s own bottom row, keeping `w` itself correct. This
is called **rotation about the z axis**: every point's `x` and `y`
rotate exactly the way `rotate90` already rotates a `2D` point, while
`z` — the axis itself — never moves, the same way a real spinning wheel's
own axle doesn't move while everything around it does.

Trace `affine3-transform(rotate-z-90, [1, 0, 5, 1])`: `x` and `y`
rotate via the embedded `rotate90` rows exactly as Lesson 234 already
established — `(1, 0)` becomes `(0, 1)`; `z`'s own row, `[0, 0, 1, 0]`,
dotted with `[1, 0, 5, 1]`, gives `0 + 0 + 5 + 0 = 5` — completely
unchanged; `w` stays `1`. Result: `[0, 1, 5, 1]`.

### CS Lens

This is **embedding**, Lesson 243's own term for placing an
already-verified lower-dimensional transformation inside a
higher-dimensional one, now applied a second time — first `2x2` into
`3x3` (Lesson 243's own `embed-linear`), now `2x2` directly into `4x4`
by hand, with the specific choice of *which* two rows and columns stay
untouched (`z` and `w`) determining *which axis* the rotation happens
around. Also recognized in: `3D` graphics libraries offering
`rotate-x`/`rotate-y`/`rotate-z` as the three simplest, most common
rotation matrices, each one embedding an ordinary `2D` rotation into the
plane perpendicular to its own named axis; and robotics representing a
robot joint that only swivels around one fixed axis with the identical
kind of matrix.

### SE Lens

Deriving a real rotation about an *arbitrary* axis — the general case a
production graphics or robotics library actually needs — requires
projecting onto and rotating within a plane defined by that axis, real
trigonometry this curriculum hasn't built, and meaningfully more
derivation than fits honestly in one lesson, the same scope-narrowing
judgment Lessons 99, 100, and 134 already made for their own
notoriously-fiddly full cases. `rotate-z-90` is the tractable,
representative core: real, correct, and fully verified, while the fully
general axis-angle rotation is described here only in prose, not
implemented.

### Run It — Real Output

```
user=> (affine3-transform rotate-z-90 (make-hpoint3 1 0 5))
[0 1 5 1]
user=> (affine3-transform rotate-z-90 (make-hvector3 1 0 5))
[0 1 5 0]
```

Both the point and the vector rotate identically in `x` and `y` — unlike
translation, a genuine rotation is *supposed* to affect a vector's own
direction, exactly the same point Lesson 243's own closing unit already
made once for `2D`. `z` stays `5` in both cases; `w` stays whatever it
started as, `1` for the point and `0` for the vector.

### Connection

Translation and rotation are both real `4x4` matrices now. The closing
unit composes them into one, and checks whether order still matters the
way it already did in `2D`.

---

## Concept Unit: Composing 3D Transformations

### The Problem

Lesson 244's `affine-multiply` combined two `3x3` matrices into one.
Does the identical construction, extended to four rows and four columns,
correctly combine `translation-matrix3` and `rotate-z-90` — and does
order still matter the way Lesson 244 already proved it does in `2D`?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition, extending Lesson 244's own `affine-multiply` to `4x4`
  directly, not porting from any external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn affine3-column [a index]
  [(get (affine3-row a 0) index) (get (affine3-row a 1) index) (get (affine3-row a 2) index) (get (affine3-row a 3) index)])

(defn affine3-multiply-row [a2-row a1]
  [(dot-product4 a2-row (affine3-column a1 0)) (dot-product4 a2-row (affine3-column a1 1)) (dot-product4 a2-row (affine3-column a1 2)) (dot-product4 a2-row (affine3-column a1 3))])

(defn affine3-multiply [a2 a1]
  (make-affine3
    (affine3-multiply-row (affine3-row a2 0) a1)
    (affine3-multiply-row (affine3-row a2 1) a1)
    (affine3-multiply-row (affine3-row a2 2) a1)
    (affine3-multiply-row (affine3-row a2 3) a1)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`affine3-column` — the identical shape as Lesson 244's own
`affine-column`, reading one position out of all four rows instead of
three. `affine3-multiply-row` — `dot-product4`, reappearing from this
lesson's own Unit 2, dots one row against all four of the other matrix's
own columns. `affine3-multiply` — assembles four such rows into the
combined matrix, the identical composition-by-construction idea Lesson
244 already proved for `3x3`, extended by one row and one column.

### CS Lens

The same **composition-by-construction** idea Lesson 244 already gave
full treatment, shown once more to generalize cleanly to one more
dimension with no new reasoning required — real confirmation the
technique was never specific to `2D` geometry, only to "however many
rows and columns the matrix actually has."

### SE Lens

The identical tradeoff as Lesson 244's own Unit 1: composing once and
reusing the combined matrix against many points costs one real `4x4`
matrix multiplication up front, in exchange for a single
`affine3-transform` per point afterward instead of two — more valuable
here than in `2D`, since a real `3D` model can easily have thousands of
vertices needing the identical combined transformation applied.

### Run It — Real Output

```
user=> (def combined (affine3-multiply t3 rotate-z-90))
#'user/combined
user=> combined
[[0 -1 0 1] [1 0 0 2] [0 0 1 3] [0 0 0 1]]
user=> (affine3-transform combined (make-hpoint3 1 0 5))
[1 3 8 1]
user=> (def combined-reverse (affine3-multiply rotate-z-90 t3))
#'user/combined-reverse
user=> combined-reverse
[[0 -1 0 -2] [1 0 0 1] [0 0 1 3] [0 0 0 1]]
user=> (affine3-transform combined-reverse (make-hpoint3 1 0 5))
[-2 2 8 1]
user=> (= combined combined-reverse)
false
```

`(1, 0, 5)`, rotated around `z` then translated, lands at `(1, 3, 8)`.
The identical starting point, translated first and then rotated, lands
at `(-2, 2, 8)` — genuinely different, the exact same non-commutativity
Lesson 244 already proved for `2D`, holding again in `3D` with a real
`z` coordinate riding along unaffected by which order the `x`/`y`
operations happened in.

### Connection

The closing section traces one real `3D` point through every piece this
lesson built.

---

## Connect the Pieces

One point, `(1, 0, 5)`, moving through every unit built in this lesson:

1. `make-hpoint3(1, 0, 5)` → `[1, 0, 5, 1]` (Unit 1).
2. `affine3-transform(translation-matrix3(1, 2, 3), [1, 0, 5, 1])` →
   `[2, 2, 8, 1]` (Unit 2) — `x`, `y`, `z` each shifted by their own
   amount.
3. `affine3-transform(rotate-z-90, [1, 0, 5, 1])` → `[0, 1, 5, 1]`
   (Unit 3) — `x`/`y` rotate, `z` stays fixed.
4. `affine3-transform(affine3-multiply(translation-matrix3(1,2,3),
   rotate-z-90), [1, 0, 5, 1])` → `[1, 3, 8, 1]` (Unit 4) — rotate first,
   then translate, composed into one matrix and confirmed against
   applying both separately.

Every real number in step 4 traces directly back to Lesson 234's own
`rotate90` and this lesson's own `translation-matrix3` — nothing in this
lesson invented new arithmetic, only extended already-verified `2D`
machinery by one dimension, checked freshly at every step rather than
assumed to still work.

## What Breaks Without This

Build `rotate-z-90` with the `z`-preserving row wrong — swap it for
another copy of the rotation instead of leaving `z` alone:

```clojure
(def rotate-z-90-broken (make-affine3 [0 -1 0 0] [1 0 0 0] [1 0 0 0] [0 0 0 1]))
```

```
user=> (affine3-transform rotate-z-90-broken (make-hpoint3 1 0 5))
[0 1 1 1]
```

The correct answer, from Unit 3, was `[0, 1, 5, 1]` — `z` should stay
`5`. The broken version gives `z = 1` instead, silently discarding the
real `z = 5` and substituting a copy of `x`'s own rotated value. This is
the concrete cost of building a `3D` rotation by hand, row by row: get
even one row wrong, and the matrix no longer represents a rotation
around any real, coherent axis at all — it produces *a* number, with no
error or crash, but not one describing the transformation it claims to.
Restoring the correct third row:

```
user=> (affine3-transform rotate-z-90 (make-hpoint3 1 0 5))
[0 1 5 1]
```

matches the real rotation-around-`z` answer again.

## Exercises

1. Build `rotate-x-90` and `rotate-y-90` — rotation about the `x` and
   `y` axes instead of `z` — by embedding `rotate90` into the *other* two
   coordinate pairs, leaving the appropriate axis's own coordinate
   untouched each time. Verify each one leaves its own named axis's
   coordinate fixed on a real test point.
2. Compose `rotate-z-90` with itself twice, using `affine3-multiply`,
   and confirm the result matches a direct `180°` rotation around `z`
   (Lesson 234's own `180°` matrix, embedded the same way `rotate-z-90`
   was).
3. `translation-matrix3` and `rotate-z-90` were composed in Unit 4. Using
   the identical technique Lesson 244's own `rotate-around-pivot` used,
   build `rotate-around-z-axis-through-point`, rotating around a vertical
   line through some `(px, py)` rather than through the origin, leaving
   `z` free. Verify it against a real point that isn't already on that
   line.

## Definition of Done

- [ ] `make-hpoint3`/`make-hvector3` and their four accessors all run
      correctly, differing only in `hw3`.
- [ ] `translation-matrix3` correctly moves a real `3D` point and leaves
      a real `3D` vector completely unchanged.
- [ ] `rotate-z-90` correctly rotates `x`/`y` while leaving `z` fixed, for
      both a point and a vector.
- [ ] `affine3-multiply` correctly composes translation and rotation in
      both orders, and the two results are confirmed different with `=`.
- [ ] The wrong-row rotation bug was reproduced for real (a rotated point
      silently losing its real `z` value), then fixed.
- [ ] `git commit` with a message explaining *why* `rotate-z-90` leaves
      `z` untouched rather than mixing it into the rotation — for
      example: `"Add rotate-z-90 as a 2D rotation embedded into 4x4,
      with z and w carried through unchanged — rotation about an axis
      means everything ON that axis doesn't move."`
