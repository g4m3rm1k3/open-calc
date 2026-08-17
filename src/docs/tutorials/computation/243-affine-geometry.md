# Lesson 243: Affine Geometry — Making Translation a Real Matrix

**What you will build**: A real resolution to a gap this curriculum has
carried since Lesson 236: `translate-point` is a genuinely useful
transformation, but it is *not* a linear one — Lesson 236 proved it
fails both additivity and homogeneity, meaning no `2x2` matrix has ever
been able to represent it. This lesson builds **homogeneous
coordinates** — representing a 2D point or vector as a real
three-component vector instead of two — and a `3x3` **affine matrix**
that makes translation a genuine matrix multiplication for the first
time, while proving, concretely, that a true displacement vector still
comes through completely untouched by that same translation, exactly as
Lesson 236 already showed it must.

**What you need to know first**: Lesson 231's `point-x`, `point-y`, and
the point-versus-vector distinction it started. Lesson 232's
`make-vector`, `vector-dx`, `vector-dy`, and `vector-from-points`. Lesson
234's `make-matrix`, `matrix-row`, and `matrix-vector-multiply`. Lesson
236's own proof — this lesson's entire reason for existing — that
`translate-point` fails additivity and homogeneity, the two properties
any real linear transformation (any `2x2` matrix, applied through
`matrix-vector-multiply`) is guaranteed to have.

**Terms used in this lesson**:

- **homogeneous coordinates** — representing a 2D point or vector with
  *three* numbers instead of two, by adding one extra component (called
  `w`) that encodes *which kind of thing* the first two numbers
  represent — a point or a displacement — so a single matrix type can
  finally treat both correctly.
- **affine transformation** — a transformation built from a linear part
  (rotation, scaling — anything a `2x2` matrix could already do) plus a
  translation, combined into a single operation. Every transformation
  this lesson's own `3x3` matrices represent is affine, whether or not
  it happens to include any actual translation.
- **homogeneous point** — a point `[x, y]` written as `[x, y, 1]` — the
  trailing `1` is what lets a translation's own numbers actually reach
  and move it during matrix multiplication.
- **homogeneous vector** — a displacement `[dx, dy]` written as `[dx,
  dy, 0]` — the trailing `0` is what makes a translation's own numbers
  multiply against it and vanish, the exact mechanism behind this
  lesson's own central proof.
- **embedding** — placing an already-existing `2x2` linear
  transformation inside a `3x3` affine matrix, with a `0` translation, so
  it can be represented in the identical format as a real translation and
  combined with one later.

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
  - *Their use:* every homogeneous point, vector, and affine matrix in
    this lesson is a plain Clojure vector, read and combined through
    these three exactly as every earlier vector and matrix has been.
- **`matrix-row`** / **`matrix-vector-multiply`**
  - *What they are:* reused unchanged from Lesson 234.
  - *Their use:* `matrix-row`'s own `2x2`-matrix row-reading logic is
    reused, unmodified, by this lesson's own `embed-linear`; the real
    `2x2` results `matrix-vector-multiply` already produced for
    `rotate90` and `scale-x2` are this lesson's own ground truth to check
    the new `3x3` machinery against.

---

## Concept Unit: Points and Vectors, Written With a Third Number

### The Problem

Lesson 236 proved, by direct algebra, that `translate-point` fails both
additivity and homogeneity — the two properties Lesson 236 defined and
checked, and the two properties every real `2x2` matrix, applied through
`matrix-vector-multiply`, is guaranteed to have. That's not a bug in
`translate-point`; it's a real fact about what a `2x2` matrix can and
can't represent. But translation is a genuinely necessary transformation
— every earlier lesson that built points and vectors needs it. Is there
*any* matrix, of any size, that could represent it, or is matrix
multiplication simply the wrong tool for translation, permanently?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because homogeneous coordinates are a mathematical technique
  this curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn make-hpoint [x y] [x y 1])
(defn make-hvector [dx dy] [dx dy 0])

(defn hx [h] (get h 0))
(defn hy [h] (get h 1))
(defn hw [h] (get h 2))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn make-hpoint [x y] [x y 1])` — the body is a plain three-element
Clojure vector: `x`, `y`, and a literal `1` appended as the third
position. This is called a **homogeneous point**: the same `[x, y]`
Lesson 231's own points already used, with one new number, `w`, fixed at
`1`.

`(defn make-hvector [dx dy] [dx dy 0])` — the identical shape, with the
third position fixed at `0` instead. This is a **homogeneous vector** —
`dx` and `dy` mean exactly what Lesson 232's own `vector-dx`/`vector-dy`
already established, a genuine displacement, not a location.

`(defn hx [h] (get h 0))` / `(defn hy [h] (get h 1))` / `(defn hw [h]
(get h 2))` — `get`, reappearing from every earlier lesson's own vector
accessors, reads each of the three positions back out. `hw` is the new
one: it reads back exactly which kind of thing `h` represents — `1` for
a point, `0` for a vector — a real, inspectable value, not a hidden tag.

### CS Lens

This is a **discriminated representation** — encoding *which case of a
choice a value represents* directly inside the value's own data, rather
than tracking it separately or trusting the caller to remember. Here the
choice is binary (point or vector) and the discriminant is a genuine
number (`1` or `0`) doing real arithmetic work later, not just a label —
which is exactly why this technique is worth its own unit rather than
folding into the next: the whole reason this representation was chosen
is that `w` being `0` or `1` is about to change what a matrix
multiplication actually *does* to the rest of the vector, not just what
it's labeled. Also recognized in: a tagged union or sum type in a typed
language, a database row's own discriminator column selecting which
other columns are meaningful, and network protocol headers whose first
field determines how to parse everything that follows.

### SE Lens

The alternative — keeping points and vectors as the plain two-component
`[x, y]` values Lessons 231 and 232 already built, and writing a
translation function by hand the way `translate-point` already does —
works, and costs nothing extra to represent. What it can't do is what
this lesson exists to build: express translation as a matrix, so it can
be combined and composed with rotation and scaling using the exact same
`matrix-vector-multiply`-shaped machinery Lessons 234 and 235 already
verified, instead of a separate, special-cased function living outside
that whole system. The real cost of the homogeneous representation: every
point and vector this lesson touches now carries one extra number that
means nothing geometrically on its own — a permanent, small overhead paid
specifically to buy that uniformity.

### Run It — Real Output

```
user=> (def p (make-hpoint 3 4))
#'user/p
user=> (def v (make-hvector 3 4))
#'user/v
user=> p
[3 4 1]
user=> v
[3 4 0]
user=> (hx p) (hy p) (hw p)
3
4
1
user=> (hx v) (hy v) (hw v)
3
4
0
```

`p` and `v` share the identical `x` and `y` — `3` and `4` — and differ
only in `hw`: `1` for the point, `0` for the vector. Nothing about that
difference has done anything yet; the next unit is where it starts to
matter.

### Connection

A homogeneous point and a homogeneous vector with identical `x` and `y`
components look almost the same — the real test is what happens when a
real translation is applied to each of them.

---

## Concept Unit: Translation as a Real Matrix

### The Problem

A `2x2` matrix can only ever produce output components that are linear
combinations of the input's own `x` and `y` — there's no way to add a
fixed constant, which is exactly what `translate-point` needs to do and
exactly why Lesson 236 proved it can't be linear. A `3x3` matrix, acting
on a three-component homogeneous point, has one more column and one more
row to work with — is that enough room to fit a genuine, constant shift
into the arithmetic?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because homogeneous coordinates are a mathematical technique
  this curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn make-affine [row0 row1 row2] [row0 row1 row2])
(defn affine-row [a index] (get a index))

(defn dot-product3 [v1 v2]
  (+ (* (get v1 0) (get v2 0)) (* (get v1 1) (get v2 1)) (* (get v1 2) (get v2 2))))

(defn affine-transform [a h]
  [(dot-product3 (affine-row a 0) h) (dot-product3 (affine-row a 1) h) (dot-product3 (affine-row a 2) h)])

(defn translation-matrix [tx ty]
  (make-affine [1 0 tx] [0 1 ty] [0 0 1]))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn make-affine [row0 row1 row2] [row0 row1 row2])` — the identical
shape as Lesson 234's own `make-matrix`, extended to three rows instead
of two, one for each of the three homogeneous components a `3x3` matrix
needs to produce.

`(defn affine-row [a index] (get a index))` — `get`, reappearing, reads
one row back out, the identical shape as Lesson 234's own `matrix-row`.

`(defn dot-product3 [v1 v2] ...)` — `+`, reappearing, sums three
products instead of Lesson 233's own two; `*`, reappearing, computes
each one: `v1`'s and `v2`'s matching components, multiplied pairwise
across all three positions, not just the first two. This is the
identical **dot product** idea Lesson 233 already gave full treatment —
a measure of how much two vectors align, generalized here from two
dimensions to three because a homogeneous vector has a third component
now.

`(defn affine-transform [a h] ...)` — builds a fresh three-element
vector directly (Clojure's own literal `[...]` syntax, reappearing since
this curriculum's earliest data), one entry per row of `a`, each entry
computed by `dot-product3` against `h`. This is the exact same shape as
Lesson 234's own `matrix-vector-multiply` — one dot product per row —
extended from two rows to three.

`(defn translation-matrix [tx ty] ...)` — `make-affine`, just built,
assembles three rows: `[1, 0, tx]`, `[0, 1, ty]`, `[0, 0, 1]`. This is
the actual payoff: `tx` and `ty`, the amount to shift by, sit directly in
the matrix's own third column — a real, honest constant, sitting inside
matrix data for the first time in this whole curriculum.

Trace `affine-transform` applied to `(translation-matrix 5 2)` and
`p = [3, 4, 1]`: row `0` is `[1, 0, 5]`; `dot-product3([1, 0, 5], [3, 4,
1]) = 1*3 + 0*4 + 5*1 = 3 + 5 = 8`. Row `1` is `[0, 1, 2]`;
`dot-product3([0, 1, 2], [3, 4, 1]) = 0*3 + 1*4 + 2*1 = 4 + 2 = 6`. Row
`2` is `[0, 0, 1]`; `dot-product3([0, 0, 1], [3, 4, 1]) = 0 + 0 + 1 = 1`.
The result is `[8, 6, 1]` — a real homogeneous point, `w` still `1`, `x`
and `y` shifted by exactly `5` and `2`. The `5*1` and `2*1` terms — the
translation numbers, multiplied by `h`'s own trailing `1` — are the
entire mechanism: `w` being `1` is precisely what let the translation
actually reach the point.

### CS Lens

This is **encoding a constant offset as a linear operation by adding a
dimension** — the exact general technique behind homogeneous
coordinates in every field that uses them, not a trick specific to this
one `2D` case: computer graphics pipelines use `4x4` homogeneous
matrices for the identical reason in `3D`; robotics uses homogeneous
transforms to combine a robot arm's own rotation and position into one
matrix per joint; and, more abstractly, any time a "constant plus linear
part" operation (an *affine* function, in the general mathematical
sense — `f(x) = Ax + b`) needs to be composed and chained the way pure
linear functions already can be, embedding it into one extra dimension
is the standard move.

### SE Lens

The alternative rejected in Unit 1's own SE Lens — a hand-written
`translate-point` function, exactly like Lesson 231 already has — is
still simpler for the single case of "translate one point, right now."
What this new machinery buys, not yet shown but set up for it: a
translation and a rotation, both now `3x3` matrices in the identical
format, could be multiplied together into a *single* combined matrix
(the same technique Lesson 235 already proved for two `2x2` matrices),
applying both in one pass — something a hand-written `translate-point`
function, living outside the matrix system entirely, could never be
combined with directly. The cost paid for that: every point now carries
a third component that has to stay disciplined at exactly `1`, by
convention, with nothing in the type system enforcing it.

### Run It — Real Output

```
user=> (def t (translation-matrix 5 2))
#'user/t
user=> t
[[1 0 5] [0 1 2] [0 0 1]]
user=> (affine-transform t p)
[8 6 1]
```

`p = [3, 4, 1]` becomes `[8, 6, 1]` — `x` and `y` shifted by exactly `5`
and `2`, `w` still `1`, exactly matching the trace above.

### Connection

Translation moved a point. The real test of whether this representation
actually *fixes* Lesson 236's own problem is whether the identical
matrix, applied to a genuine displacement instead of a point, leaves it
alone.

---

## Concept Unit: Vectors Survive Translation Untouched

### The Problem

Lesson 236's own proof was specific: `translate-point`, applied to two
different points, changes the *displacement vector between them* — a
real failure, because a displacement is supposed to describe a
relationship, not a location, and Lesson 232 already established that a
vector's own components stay fixed no matter where its two endpoints
are. If homogeneous coordinates and `translation-matrix` genuinely solve
the problem, applying the identical matrix to a homogeneous *vector*
(`hw = 0`, not `1`) should produce that exact same vector back, completely
unchanged — not a proof by construction yet, a real claim to check.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because homogeneous coordinates are a mathematical technique
  this curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses `affine-transform`
  and `translation-matrix` unchanged — this unit introduces no new
  function, only a new claim, checked against a new kind of input.

### The New Code

No new function this unit. `v = make-hvector(3, 4) = [3, 4, 0]` — the
identical `x` and `y` as `p` from Unit 1, but `hw = 0` instead of `1`.
`(affine-transform t v)`, where `t` is Unit 2's own `translation-matrix
5 2`: row `0` is `[1, 0, 5]`; `dot-product3([1, 0, 5], [3, 4, 0]) = 1*3 +
0*4 + 5*0 = 3 + 0 = 3` — the `5*0` term, the translation itself,
multiplies against `v`'s own trailing `0` and vanishes completely. The
identical shape holds row `1`: `dot-product3([0, 1, 2], [3, 4, 0]) = 4 +
2*0 = 4`. Row `2`: `dot-product3([0, 0, 1], [3, 4, 0]) = 0 + 0 + 0 = 0`.
The result is `[3, 4, 0]` — `v`, completely unchanged, `hw` still `0`.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — this unit's own verification is the real check itself,
run against two genuinely different vectors, not a throwaway later
discarded.

### Mechanical Walkthrough

The arithmetic above is this unit's real content: every place a genuine
translation number (`tx` or `ty`) appears in `t`'s own third column, it
gets multiplied by `h`'s own third component, `hw` — for a point, `hw =
1`, so the full translation amount comes through; for a vector, `hw = 0`,
so that exact same number is multiplied by `0` and contributes nothing
at all, no matter how large `tx` or `ty` actually is. This is the entire
mechanism behind Lesson 236's own gap finally closing: `w` being `0`
isn't a special case handled by an `if` anywhere in `affine-transform` —
it's ordinary multiplication, `anything * 0 = 0`, doing the discriminating
work automatically.

Confirm this isn't a fluke of this one vector: `v2 = make-hvector(-1, 7)
= [-1, 7, 0]`. `(affine-transform t v2)` — the identical reasoning, row
by row: `1*(-1) + 0*7 + 5*0 = -1`; `0*(-1) + 1*7 + 2*0 = 7`; `0 + 0 + 1*0
= 0`. Result: `[-1, 7, 0]` — again, completely unchanged, for a
genuinely different pair of components.

One honest limit worth naming precisely: this proves vectors are
unaffected by *translation specifically*, not by every possible affine
transformation. A rotation or a scale — Unit 4, next — genuinely should
change a vector's own direction or length; only the translation part is
supposed to leave it alone, since a displacement has no location for a
shift to act on in the first place.

### CS Lens

This is a **structural invariant enforced by the representation itself,
not by a runtime check** — the same category of guarantee this
curriculum has already valued in very different settings: a kernel
boundary whose safety came from which functions could touch
`kernel-state` (Lesson 203), not a permission check; a lock-free stack
whose correctness came from `compare-and-swap`'s own atomicity (Lesson
219), not a guard clause. Here, "vectors are immune to translation" isn't
a fact `affine-transform` checks for and special-cases — it's a
consequence that falls straight out of ordinary multiplication, once
`hw` is chosen correctly. Also recognized in: a physical unit system
where dimensional analysis makes an invalid operation (adding a length
to a velocity) structurally impossible to even write, not just
disallowed by convention.

### SE Lens

The alternative — an `if` inside a translation function checking "is
this argument a point or a vector" and branching accordingly — is
exactly the kind of runtime check this representation makes unnecessary,
at the cost named in Unit 2's own SE Lens: every value now silently
depends on its caller getting `hw` right when building it in the first
place, with nothing enforcing that beyond `make-hpoint` and
`make-hvector`'s own naming discipline. Get `hw` wrong by hand-
constructing a raw `[x, y, w]` vector with the wrong third value, and
`affine-transform` will silently do the wrong thing with no error at
all — the real, honest debt this representation carries in exchange for
needing no runtime branch.

### Run It — Real Output

```
user=> (affine-transform t v)
[3 4 0]
user=> (def v2 (make-hvector -1 7))
#'user/v2
user=> (affine-transform t v2)
[-1 7 0]
```

Both vectors come back completely unchanged — `x`, `y`, and `hw` all
identical to what went in — matching the trace above exactly, for two
genuinely different displacements.

### Connection

Translation is now a real matrix, and vectors are provably immune to it.
The last piece is showing this new `3x3` representation can also hold
the rotations and scalings Lessons 234 and 235 already built — not a
separate system, one unified one.

---

## Concept Unit: Rotation and Scaling Embed Into the Same Representation

### The Problem

`translation-matrix` builds a `3x3` matrix from scratch. Lesson 234's own
`rotate90` and `scale-x2` are `2x2` matrices, already fully verified,
with no translation in them at all. For homogeneous coordinates to be a
genuine *unification* — not just a separate new system that happens to
also handle translation — an already-existing `2x2` linear
transformation needs a real way to become a `3x3` affine matrix that
does exactly what it always did, with zero translation added.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because homogeneous coordinates are a mathematical technique
  this curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses `matrix-row`
  (Lesson 234) to read the original `2x2` matrix's own entries.

### The New Code

```clojure
(defn embed-linear [m]
  (make-affine
    [(get (matrix-row m 0) 0) (get (matrix-row m 0) 1) 0]
    [(get (matrix-row m 1) 0) (get (matrix-row m 1) 1) 0]
    [0 0 1]))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn embed-linear [m] ...)` — `matrix-row` and `get`, both reappearing
from Lesson 234, read `m`'s own four entries — `a`, `b`, `c`, `d` in
`[[a, b], [c, d]]`. `make-affine`, from this lesson's own Unit 2,
assembles three new rows: the first two copy `m`'s own two rows exactly,
each with a literal `0` appended as a third entry — no translation in
either direction; the third row, `[0, 0, 1]`, is `translation-matrix`'s
own bottom row, unchanged, the part of an affine matrix that keeps `w`
itself equal to `1` for a point and `0` for a vector, untouched by
anything above it. This is called **embedding**: placing an existing,
already-verified `2x2` transformation into the `3x3` format, with the
translation column forced to `0`.

### CS Lens

`embed-linear` is a **format adapter preserving existing behavior
exactly** — a real, verifiable claim, not just a naming choice: the
embedded matrix has to be checked against the original `2x2` result,
component by component, not merely assumed correct because the
construction "looks right." Also recognized in: wrapping a legacy
function behind a new interface without changing its behavior,
serializing a value into a richer format (a `2D` point becoming a `3D`
point with `z = 0`) specifically so it can be combined with genuinely
`3D` data, and a database schema migration that adds a new column with a
default value chosen so every existing row's own meaning doesn't change.

### SE Lens

The alternative — writing separate, parallel `3x3` "rotation matrix" and
"scaling matrix" constructors from scratch, duplicating `rotate90` and
`scale-x2`'s own already-verified numbers — would work, but would mean
two independently-maintained sources of truth for the same
transformation: Lesson 234's own `2x2` version, and a hand-copied `3x3`
version, which could silently drift apart under a future edit to either
one. `embed-linear` instead derives the `3x3` version *from* the already-
verified `2x2` one, every time, so there is exactly one place `rotate90`
or `scale-x2`'s own real numbers are ever written down.

### Run It — Real Output

```
user=> (def rotate90 (make-matrix (make-vector 0 -1) (make-vector 1 0)))
#'user/rotate90
user=> (def scale-x2 (make-matrix (make-vector 2 0) (make-vector 0 1)))
#'user/scale-x2
user=> (def rotate90-affine (embed-linear rotate90))
#'user/rotate90-affine
user=> rotate90-affine
[[0 -1 0] [1 0 0] [0 0 1]]
user=> (affine-transform rotate90-affine (make-hpoint 1 0))
[0 1 1]
user=> (matrix-vector-multiply rotate90 (make-vector 1 0))
[0 1]
user=> (def scale-x2-affine (embed-linear scale-x2))
#'user/scale-x2-affine
user=> (affine-transform scale-x2-affine (make-hpoint 1 1))
[2 1 1]
user=> (matrix-vector-multiply scale-x2 (make-vector 1 1))
[2 1]
```

`rotate90-affine` applied to the homogeneous point `[1, 0, 1]` gives `[0,
1, 1]` — strip the trailing `1`, and it's `[0, 1]`, exactly what
`matrix-vector-multiply` already gave for the original `2x2` `rotate90`,
Lesson 234's own established "east becomes north" fact. `scale-x2-affine`
applied to `[1, 1, 1]` gives `[2, 1, 1]` — again, `[2, 1]` once the
trailing `1` is dropped, exactly matching `scale-x2`'s own original
result. One more honest check, using a vector instead of a point:

```
user=> (affine-transform rotate90-affine (make-hvector 1 0))
[0 1 0]
```

`hw` stays `0`, as Unit 3 already proved it must — but `x` and `y` still
rotate, from `[1, 0]` to `[0, 1]`, exactly as they should: rotation is a
genuine linear transformation, and a real displacement's direction *is*
supposed to change under rotation, in sharp contrast to Unit 3's own
translation case, where a displacement stayed fixed because a
displacement has no location for a shift to act on. `embed-linear`
doesn't make vectors immune to everything — only to the translation part,
exactly as intended.

### Connection

`rotate90` and `scale-x2`'s own real numbers, plus a genuine translation,
now all live in the identical `3x3` format — the closing section traces
one point and one vector through every piece built in this lesson.

---

## Connect the Pieces

One homogeneous point and one homogeneous vector, both built from the
same numbers, `[3, 4]`, moving through every unit built in this lesson:

1. `make-hpoint(3, 4)` → `[3, 4, 1]` (Unit 1) — a location.
2. `make-hvector(3, 4)` → `[3, 4, 0]` (Unit 1) — a displacement, same
   numbers, `hw` marking the difference.
3. `affine-transform(translation-matrix(5, 2), [3, 4, 1])` → `[8, 6, 1]`
   (Unit 2) — the point, genuinely moved.
4. `affine-transform(translation-matrix(5, 2), [3, 4, 0])` → `[3, 4, 0]`
   (Unit 3) — the vector, completely unmoved, the identical translation
   matrix from step 3.
5. `affine-transform(embed-linear(rotate90), [3, 4, 1])` — row `0`:
   `0*3 + -1*4 + 0*1 = -4`; row `1`: `1*3 + 0*4 + 0*1 = 3`; row `2`: `1`
   → `[-4, 3, 1]` (Unit 4) — the point, genuinely rotated `90°`.
6. `affine-transform(embed-linear(rotate90), [3, 4, 0])` — the identical
   arithmetic, `hw = 0` throughout → `[-4, 3, 0]` (Unit 4) — the vector,
   *also* rotated, in sharp contrast to step 4.

Steps 3 and 5 both changed the point. Steps 4 and 6 tell the real story:
step 4's vector was untouched by translation, step 6's identical vector
was genuinely rotated by rotation — the exact, precise distinction this
whole lesson exists to make computable: a vector is immune to the
translation *part* of an affine transformation, never to the linear
part.

## What Breaks Without This

Build a point with `hw` set wrong by hand, bypassing `make-hpoint`
entirely:

```clojure
(def mislabeled-point [3 4 0])
```

```
user=> (affine-transform t mislabeled-point)
[3 4 0]
```

`mislabeled-point` holds the exact same `x` and `y` as `p` from Unit 1 —
but with `hw = 0`, exactly like a vector, even though it was meant to be
a point. `affine-transform` has no way to know the difference: it simply
multiplies, and the translation vanishes against the `0`, exactly the
way Unit 3 already proved it should for a genuine vector — except here,
a *point* silently failed to move at all, with no error, no exception,
and no visible sign anything went wrong except a translated point that
looks suspiciously identical to the one that went in. This is Unit 3's
own SE Lens made concrete: nothing enforces `hw` being correct beyond
`make-hpoint` and `make-hvector`'s own naming discipline — reaching past
them to build a raw `[x, y, w]` vector by hand is exactly how this bug
happens. Rebuilding it correctly:

```
user=> (affine-transform t (make-hpoint 3 4))
[8 6 1]
```

restores the real, expected translation.

## Exercises

1. Build a `3x3` scaling matrix directly with `make-affine` (not
   `embed-linear`) that scales `x` by `3` and `y` by `2`, with zero
   translation. Apply it to `(make-hpoint 4 5)` and to `(make-hvector 4
   5)`, and confirm both scale correctly — unlike translation, scaling
   should change a vector's own length exactly as much as it changes a
   point's own coordinates.
2. `embed-linear` was verified against `rotate90` and `scale-x2`. Verify
   it against `identity-matrix` (Lesson 234's own `[[1, 0], [0, 1]]`) —
   confirm `affine-transform` on the embedded identity leaves both a
   point and a vector completely unchanged, and explain in one sentence
   why that has to be true given `identity-matrix`'s own established
   meaning.
3. `translation-matrix` and `embed-linear` both build `3x3` matrices with
   `[0, 0, 1]` as their own bottom row. Using `dot-product3`, explain
   precisely why that bottom row has to stay exactly `[0, 0, 1]` for
   *any* affine matrix — what would go wrong with a homogeneous point's
   own `hw` if it didn't?

## Definition of Done

- [ ] `make-hpoint`, `make-hvector`, and their three accessors (`hx`,
      `hy`, `hw`) all run correctly, and a point and a vector built from
      identical `x`/`y` differ only in `hw`.
- [ ] `translation-matrix` and `affine-transform` correctly move a real
      homogeneous point by the exact translation amount.
- [ ] The identical translation matrix, applied to a homogeneous vector
      (checked against at least two genuinely different vectors), leaves
      it completely unchanged — matching Lesson 236's own prediction that
      a real displacement must be translation-invariant.
- [ ] `embed-linear` was verified against both `rotate90` and `scale-x2`,
      matching `matrix-vector-multiply`'s own original `2x2` results
      exactly once the trailing `1` is dropped.
- [ ] An embedded rotation was confirmed to genuinely change a vector's
      own direction (unlike translation), proving vector immunity is
      specific to the translation part of an affine transformation, not
      universal.
- [ ] The `hw`-set-wrong bug was reproduced for real (a mislabeled point
      silently failing to translate), then explained and fixed.
- [ ] `git commit` with a message explaining *why* `hw` is `1` for a
      point and `0` for a vector rather than the reverse — for example:
      `"Fix hw convention: 1 for points so translation's own numbers
      reach them, 0 for vectors so the same numbers multiply out to
      nothing — closing Lesson 236's own additivity/homogeneity gap for
      real."`
