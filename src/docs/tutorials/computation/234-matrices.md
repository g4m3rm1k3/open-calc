# Lesson 234: Matrices — Transformations and Structured Data

**What you will build**: A matrix, represented as structured data — a
grid of numbers, reusing this curriculum's established row-of-values
convention — that also does real work as a **transformation**: a rule
that turns any input vector into a corresponding output vector,
consistently. It verifies an identity matrix leaves a vector completely
unchanged, a scaling matrix reproduces Lesson 233's own
`vector-scale` exactly, and closes with a real 90-degree rotation
matrix, proven against actual geometric expectation — east turns to
north, and a vector's magnitude survives the rotation perfectly intact.

**What you need to know first**: Lesson 233's `dot-product` — this
lesson's entire matrix-vector multiplication is built from it directly.
Lesson 232's vector representation and `vector-magnitude`.

**Terms used in this lesson**:

- **matrix** — a rectangular grid of numbers, arranged in rows and
  columns; used here specifically to represent a **transformation** — a
  consistent rule for turning any input vector into a corresponding
  output vector.
- **row** (of a matrix) — one horizontal line of a matrix's own numbers;
  here, each row, treated as its own vector, determines exactly one
  component of a transformed output.
- **transformation** — a rule that takes a vector as input and produces
  a new vector as output, the same rule applied consistently to every
  possible input; a matrix is one concrete, computable way to specify
  such a rule.
- **identity matrix** — a specific matrix whose transformation leaves
  every vector completely unchanged; the matrix equivalent of
  multiplying an ordinary number by `1`.
- **rotation matrix** — a specific matrix whose transformation rotates
  every vector by a fixed angle around the origin, changing its
  direction while preserving its magnitude exactly.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`get`**
  - *What it is:* Clojure's positional lookup function for an indexed
    collection.
  - *Implementation:* `(get coll index)` returns the value at `index`.
  - *Its use:* reading a specific row out of a matrix.
- **`dot-product`**
  - *What it is:* Lesson 233's own function, reused unchanged: given two
    vectors, the sum of the products of their corresponding components.
  - *Implementation:* `(dot-product v1 v2)`, computing alignment between
    two directions.
  - *Its use:* the entire mechanism of matrix-vector multiplication —
    each row of a matrix, dotted against the input vector, produces one
    component of the output.

---

## Concept Unit: A Matrix as a Grid of Numbers

### The Problem

A single vector can describe one displacement. A rule that consistently
turns *any* vector into a *different* vector — stretching it, rotating
it, flipping it — needs more structure than one vector alone can hold.
What's the smallest, most direct way to represent such a rule as real
data?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because matrices are a mathematical concept this curriculum
  is deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn make-matrix [row0 row1]
  [row0 row1])

(defn matrix-row [m index] (get m index))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def identity-matrix (make-matrix (make-vector 1 0) (make-vector 0 1)))
#'user/identity-matrix
user=> identity-matrix
[[1 0] [0 1]]
user=> (matrix-row identity-matrix 0)
[1 0]
user=> (matrix-row identity-matrix 1)
[0 1]
```

### Mechanical Walkthrough

`(defn make-matrix [row0 row1] [row0 row1])` — `defn`, reappearing. A
`2x2` matrix here is a vector of two rows, each row itself a two-element
vector — the exact vector-of-vectors representation Lesson 123's own
weighted adjacency matrix used for a completely different domain (graph
edges, not geometric transformations), reused here fresh for a new
purpose.

`(defn matrix-row [m index] (get m index))` — `get`, reappearing, a
small named accessor pulling out one whole row.

Trace: `identity-matrix` is built from two rows, `(make-vector 1 0)`
and `(make-vector 0 1)` — reusing Lesson 232's own vector constructor,
since each row is itself structurally identical to a vector, a plain
`[a b]` pair. The result, `[[1 0] [0 1]]`, is a real, ordinary piece of
Clojure data — inspectable, printable, nothing hidden about it.

### CS Lens

Representing a matrix as "a vector of vectors" is the identical
technique already established for the adjacency matrix (Lesson 123)
and the disk-of-blocks (Lesson 220) — a grid, built from nothing more
exotic than nesting the vector-as-collection idea one level deeper. The
genuinely new idea here isn't the representation technique, it's what
this particular grid is *for*: not storing an edge weight or a byte of
content, but encoding an entire transformation rule as data, one row at
a time, ready to be applied uniformly to any vector at all.

Also recognized in: a spreadsheet's own grid of cells, each row and
column meaningful only in relation to the whole layout; a digital
image, literally a grid of pixel values, each one meaningless alone but
together encoding a picture; a seating chart, a grid whose structure
alone (which row, which column) carries real information beyond any
single cell's own value.

### SE Lens

The alternative — representing a transformation as a function directly
(a `defn` that hard-codes exactly what it does to `x` and `y`) — would
work for any *one* specific transformation, but would need an entirely
new function, written and understood separately, for every different
rotation angle, scale factor, or reflection a program might need. A
matrix's real advantage is that the *same* representation — a grid of
numbers — and the *same* operation on it (matrix-vector multiplication,
built next) work identically for every possible transformation; only
the numbers inside the grid change. The cost: a matrix's own numbers
carry no explanation of what they *do* just by looking at them — `[[0
-1] [1 0]]` doesn't visibly say "this rotates 90 degrees" the way a
function named `rotate-90-degrees` would, a real readability tradeoff
this lesson's own upcoming rotation-matrix unit has to accept.

---

## Concept Unit: Matrix-Vector Multiplication — A Matrix as a Transformation

### The Problem

A matrix, as data alone, is just a grid of numbers sitting still. What
makes it a *transformation* is an operation that actually applies it to
a vector, producing a new one — and that operation needs to genuinely
respect what each row of the matrix is meant to represent.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because matrices are a mathematical concept this curriculum
  is deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn matrix-vector-multiply [m v]
  (make-vector (dot-product (matrix-row m 0) v) (dot-product (matrix-row m 1) v)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def v (make-vector 3 4))
#'user/v
user=> (matrix-vector-multiply identity-matrix v)
[3 4]
```

Compare a scaling matrix against Lesson 233's own `vector-scale`:

```
user=> (def scale2-matrix (make-matrix (make-vector 2 0) (make-vector 0 2)))
#'user/scale2-matrix
user=> (matrix-vector-multiply scale2-matrix v)
[6 8]
user=> (vector-scale v 2)
[6 8]
```

### Mechanical Walkthrough

`(defn matrix-vector-multiply [m v] ...)` — `matrix-row`, reappearing,
pulls out the matrix's first row and dots it, via `dot-product`,
reappearing unchanged from Lesson 233, against `v` — producing the
output vector's own first component. The identical shape repeats for
the second row, producing the second component. Each row of the matrix
answers exactly one question: "how much does the output's own
component in this row's direction depend on the input vector."

Trace the identity case: `identity-matrix`'s rows are `[1 0]` and `[0
1]`. `(dot-product [1 0] v)` — `v = [3 4]` — is `1*3 + 0*4 = 3`.
`(dot-product [0 1] v)` is `0*3 + 1*4 = 4`. The result, `[3 4]`, is `v`
itself, completely unchanged — exactly what an **identity matrix** is
defined to do, the matrix equivalent of multiplying by `1`.

Trace the scaling case: `scale2-matrix`'s rows are `[2 0]` and `[0 2]`.
`(dot-product [2 0] v) = 2*3 + 0*4 = 6`. `(dot-product [0 2] v) = 0*3 +
2*4 = 8`. The result, `[6 8]`, is *exactly* `(vector-scale v 2)`'s own
result from Lesson 233 — a matrix built the right way genuinely
reproduces an operation this curriculum already trusted, not just a
coincidentally similar-looking number.

### CS Lens

Matrix-vector multiplication is nothing more than `dot-product`, called
once per row — the "new" operation this unit introduces is entirely
composed from an operation already fully built and verified in Lesson
233. This is the same compositional habit this curriculum has followed
throughout Section X (Lesson 217's `test-and-set` built from a single
function call; Lesson 219's stack built entirely from
`compare-and-swap`): a genuinely new capability, built from a small
number of already-trusted pieces, rather than a fresh, independently
unverified computation.

Also recognized in: a weighted voting system, where each "row"
(committee) computes its own combined score by weighting the same
inputs differently, exactly the way each matrix row weights the same
input vector differently; a recipe converter, transforming one set of
ingredient quantities into another via a fixed set of ratios, one ratio
per resulting ingredient; an equalizer's frequency bands, each band
computing its own output level as a weighted combination of the same
incoming audio signal.

### SE Lens

The alternative — writing `matrix-vector-multiply` as its own from-
scratch loop over rows and columns, recomputing the multiply-and-sum
logic by hand instead of calling `dot-product` — would work identically,
but would duplicate logic this curriculum already built, tested, and
trusted one lesson ago. Reusing `dot-product` directly means any future
bug fix or refinement to how alignment is computed would automatically
apply here too; a hand-duplicated version would need the identical fix
made twice, in two different places, with no guarantee both actually
stay in sync.

---

## Concept Unit: A Real Rotation

### The Problem

Scaling (Unit 2) changes a vector's size without changing its
direction. Is there a matrix whose transformation does the *opposite* —
changes a vector's direction, by some specific, predictable angle,
while leaving its size completely unchanged?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because matrices are a mathematical concept this curriculum
  is deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

No new function — this unit reuses `make-matrix`, `matrix-vector-
multiply`, and Lesson 232's `vector-magnitude`, all completely
unchanged. What's new is the specific matrix: `[[0 -1] [1 0]]`, and a
real geometric claim being tested against it.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def rotate90-matrix (make-matrix (make-vector 0 -1) (make-vector 1 0)))
#'user/rotate90-matrix
user=> (def east (make-vector 1 0))
#'user/east
user=> (matrix-vector-multiply rotate90-matrix east)
[0 1]
```

```
user=> (def rotated-v (matrix-vector-multiply rotate90-matrix v))
#'user/rotated-v
user=> rotated-v
[-4 3]
user=> (vector-magnitude v)
5.0
user=> (vector-magnitude rotated-v)
5.0
```

### Mechanical Walkthrough

`rotate90-matrix` has rows `[0 -1]` and `[1 0]`. `east = [1 0]` — a
unit vector pointing directly along positive `x`, the geometric
convention for "east." `(matrix-vector-multiply rotate90-matrix east)`
— row `0`: `(dot-product [0 -1] [1 0]) = 0*1 + (-1)*0 = 0`; row `1`:
`(dot-product [1 0] [1 0]) = 1*1 + 0*0 = 1`. Result: `[0 1]` — a unit
vector pointing directly along positive `y`, "north." East rotated
`90°` counterclockwise genuinely is north — this isn't a coincidence of
the specific matrix chosen; `[[0 -1] [1 0]]` is *the* real, standard
`90°`-counterclockwise rotation matrix.

Trace `v = [3 4]` through the same matrix: row `0`:
`(dot-product [0 -1] [3 4]) = 0*3 + (-1)*4 = -4`; row `1`:
`(dot-product [1 0] [3 4]) = 1*3 + 0*4 = 3`. Result: `[-4 3]`. Compare
magnitudes: `(vector-magnitude v)` is `5.0`; `(vector-magnitude
rotated-v)` is *also* `5.0` — not approximately equal, exactly equal.
Rotation changed `v`'s direction completely (`[3 4]` and `[-4 3]` point
in genuinely different directions) while leaving its size perfectly
intact.

### CS Lens

This is a real, standard **rotation matrix**, and the magnitude-
preservation just proven is not a coincidence of this particular
vector — it's a defining property of every genuine rotation: length is
always preserved, because rotating something never stretches or
shrinks it, only turns it. Contrast this directly with Unit 2's
scaling matrix, which preserved *direction* while changing
*magnitude* — the two matrices demonstrated in this lesson sit at
opposite ends of exactly the same tradeoff space Lesson 233's own
scalar multiplication and dot product occupied: one preserves size and
changes direction, the other preserves direction and changes size, and
a matrix can encode either kind of change (or, as later lessons in this
section will show, a combination of both) using the identical
representation and the identical multiplication rule.

Also recognized in: a clock's hour hand, rotating around a fixed
center, its distance from that center never changing no matter how far
it turns; a wrench turning a bolt, applying a rotational force that
changes the bolt's own orientation without stretching or compressing
it; a video game character's own facing direction changing when the
player turns, while the character's own height and size stay exactly
the same.

### SE Lens

The alternative to a rotation matrix would be a hand-written function
computing `sin` and `cos` of a specific angle directly and applying
them by hand to `x` and `y` — mathematically equivalent (this exact
matrix's own entries, `0`, `-1`, `1`, `0`, are `cos(90°)`, `-sin(90°)`,
`sin(90°)`, `cos(90°)`, evaluated for this one specific angle) but
committed to that one fixed angle, needing an entirely new function for
any other rotation. Representing rotation as a matrix means the exact
same `matrix-vector-multiply` this lesson already built handles *every*
rotation angle, every scale, every reflection, and — as Lesson 236 will
make explicit — every combination of them, without ever needing its own
code to change.

---

## Connect the Pieces

Follow vector `v = [3, 4]` through every transformation built in this
lesson. `matrix-vector-multiply` with `identity-matrix` (Unit 2) leaves
it completely unchanged, `[3, 4]` — the matrix equivalent of doing
nothing at all. The same operation with `scale2-matrix` produces `[6,
8]`, exactly matching Lesson 233's own `vector-scale`, proving a matrix
built with the right numbers genuinely reproduces an operation this
curriculum had already independently verified. `rotate90-matrix`, the
same operation once more, produces `[-4, 3]` — a real geometric
rotation, proven concretely by two separate checks: `east` genuinely
turns into "north," and `v`'s own magnitude survives the transformation
exactly, `5.0` both before and after. One single function,
`matrix-vector-multiply`, built from nothing more than `dot-product`
called twice, produced three completely different real transformations —
identity, scaling, rotation — with the entire difference between them
living purely in which nine, four, or however many numbers happened to
sit inside the matrix passed in.

## What Breaks Without This

Build a matrix meant to represent a `90°` rotation, but with a single
sign error — a plausible typo, not an obviously broken value:

```clojure
(def rotate90-broken (make-matrix (make-vector 0 1) (make-vector 1 0)))
```

```
user=> (matrix-vector-multiply rotate90-broken east)
[0 1]
user=> (matrix-vector-multiply rotate90-broken (make-vector 0 1))
[1 0]
```

`east` still happens to map to `[0 1]`, looking correct at a glance —
but check a second vector: rotating `[0, 1]` ("north") by a genuine
`90°` counterclockwise turn should produce `[-1, 0]` ("west"), not `[1,
0]` ("east," where the rotation started). This broken matrix is
actually a **reflection** across the diagonal line `y = x`, not a
rotation at all — it happens to agree with the real rotation matrix for
exactly one input (`east`) and disagrees for essentially everything
else, which is exactly why testing a transformation against only one
convenient input (as the "What Breaks" section itself nearly did, by
checking `east` alone) is not enough to trust it — Unit 3's own second
check, against `v = [3, 4]`, is what a single-input test would have
missed entirely.

## Exercises

1. Build the matrix for a `180°` rotation (rotating twice by `90°`) by
   hand, and confirm applying it to `east` produces `[-1, 0]` — directly
   "west," the exact opposite of where it started.
2. Build a reflection matrix across the `x`-axis (flipping `y` to `-y`,
   leaving `x` unchanged), apply it to `v = [3, 4]`, and confirm the
   magnitude is preserved exactly, the same way rotation preserved it.
3. Apply `rotate90-matrix` to a vector *four* times in a row (feeding
   each result back in as the next input) and confirm the vector
   returns to its exact original value — explain in one sentence why
   four `90°` rotations must always return to the start.

## Definition of Done

- [ ] `make-matrix`, `matrix-row`, and `matrix-vector-multiply` all
      defined and run in a live `bb` REPL, matching every transcript
      shown above exactly.
- [ ] Unit 1's grid representation reproduced.
- [ ] Unit 2's identity and scaling cases reproduced, with the scaling
      case matching Lesson 233's `vector-scale` exactly.
- [ ] Unit 3's rotation reproduced, with both the `east`-to-`north`
      check and the magnitude-preservation check confirmed.
- [ ] Exercise 3 completed, confirming four `90°` rotations return to
      the original vector exactly.
- [ ] `git commit -m "Add Lesson 234: matrices as structured data and
      as transformations, verified against identity, scaling, and a
      real geometric rotation"`
