# Lesson 240: Eigenvalues and Eigenvectors — Invariant Directions

**What you will build**: A real, checkable answer to a question left open
since Lesson 234 started applying matrices to vectors: does a
transformation ever leave some direction completely alone, only
stretching, shrinking, or flipping vectors along it, never rotating them
off their own line? This lesson builds `eigenvector-of?`, a genuine
predicate that tests any candidate vector against any matrix, and
`eigenvalue-for`, which computes the exact scalar a confirmed eigenvector
gets stretched by — then uses both to prove, algebraically and by direct
computation, that Lesson 235's own `scale-x2` has two such directions
(its own axes) while Lesson 234's own `rotate90` has none at all, for any
nonzero real vector.

**What you need to know first**: Lesson 232's `make-vector`, `vector-dx`,
and `vector-dy` — every function in this lesson reads and builds plain
two-component vectors through these three. Lesson 234's `make-matrix`,
`matrix-row`, `matrix-vector-multiply`, and its own `90°` rotation
matrix, `rotate90 = [[0, -1], [1, 0]]`. Lesson 235's own non-uniform
scaling matrix, `scale-x2 = [[2, 0], [0, 1]]`, reused directly as this
lesson's second running example. Lesson 238's `parallelogram-area`,
reused directly as the test for whether two vectors point along the same
line. Lesson 239's own idea of a matrix "collapsing" distinct inputs onto
the same output — this lesson's own proof that `rotate90` has no real
eigenvectors is a close relative of that same idea, approached from a
different angle.

**Terms used in this lesson**:

- **invariant direction** — a line through the origin that a given
  transformation leaves alone: every vector lying on that line is sent to
  some other vector still lying on the exact same line, only longer,
  shorter, or flipped to the opposite end — never rotated onto a
  different line. This is the plain-language idea this whole lesson makes
  computationally precise.
- **eigenvector** — one concrete, nonzero vector representing an
  invariant direction: a vector `v` where applying a matrix `m` to it
  produces a result that is a scalar multiple of `v` itself. The word
  comes from German *eigen*, "own" or "characteristic" — a direction that
  belongs to the matrix itself, not to any particular vector chosen to
  represent it.
- **eigenvalue** — the exact scalar `k` an eigenvector gets multiplied
  by: `matrix-vector-multiply(m, v) = k * v`. A positive `k` greater than
  `1` stretches the eigenvector; between `0` and `1` shrinks it; a
  negative `k` flips it to point the opposite way while staying on the
  same line.
- **collinear vectors** (also called **parallel vectors**, used
  interchangeably in this lesson) — two vectors that lie along the same
  line through the origin, one a scalar multiple of the other. Needed as
  the exact test for "did this matrix leave the direction alone," since
  "same direction, different length" is precisely what collinearity
  means for two vectors that both start at the origin.
- **scalar multiple** — reused from Lesson 233's `vector-scale`: a vector
  produced by multiplying every component of another vector by the same
  single number, keeping its direction (or exact opposite, for a negative
  number) and only changing its length.
- **conditional (`if`)** — reused control-flow construct: `(if test
  then-expr else-expr)` evaluates `test`; if it's not `false` and not
  `nil`, the whole expression evaluates to `then-expr`, otherwise to
  `else-expr` — only one of the two branches ever actually runs. Needed
  here to give the zero vector special treatment, and to pick which of a
  vector's two components is safe to divide by.
- **boolean** (`true` / `false`) — reused: Clojure's two literal values
  representing a yes/no answer to a question, returned directly by every
  predicate function (a function whose name ends `?`) this lesson builds.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`make-vector`** / **`vector-dx`** / **`vector-dy`**
  - *What they are:* reused unchanged from Lesson 232.
  - *Implementation:* `(defn make-vector [dx dy] [dx dy])` builds a plain
    two-element vector; `(defn vector-dx [v] (get v 0))` and `(defn
    vector-dy [v] (get v 1))` read its two components back out.
  - *Their use:* every vector this lesson builds or reads goes through
    these three — a candidate eigenvector, a matrix's output, the zero
    vector used as the trivial case to exclude.
- **`make-matrix`** / **`matrix-row`** / **`matrix-vector-multiply`**
  - *What they are:* reused unchanged from Lesson 234.
  - *Implementation:* `(defn make-matrix [row0 row1] [row0 row1])` builds
    a matrix from two row vectors; `(defn matrix-row [m index] (get m
    index))` reads one row back out; `(defn matrix-vector-multiply [m v]
    (make-vector (dot-product (matrix-row m 0) v) (dot-product
    (matrix-row m 1) v)))` applies the matrix's transformation to `v`,
    producing a new vector.
  - *Their use:* `matrix-vector-multiply` computes the exact vector this
    lesson tests every candidate eigenvector against; `make-matrix`
    builds the two example matrices (`scale-x2`, `rotate90`) this lesson
    reuses unchanged from Lessons 234 and 235.
- **`parallelogram-area`**
  - *What it is:* reused unchanged from Lesson 238 — a signed-area
    formula, structurally identical to `determinant`'s own formula,
    applied to two arbitrary vectors instead of a matrix's two rows.
  - *Implementation:* `(defn parallelogram-area [v1 v2] (- (*
    (vector-dx v1) (vector-dy v2)) (* (vector-dx v2) (vector-dy v1))))`.
  - *Its use:* Lesson 238 used this to measure a real area; this lesson
    reuses the identical formula for a different purpose entirely — a
    zero result means the two vectors are collinear, regardless of what
    area either one happens to bound.
- **`get`** / **`-`** / **`*`** / **`/`** / **`=`**
  - *What they are:* Clojure's positional lookup, subtraction,
    multiplication, division, and equality functions, reused throughout
    this curriculum since its earliest arithmetic.
  - *Implementation:* `(get coll index)` reads a value at a position;
    `(- a b)`, `(* a b)`, `(/ a b)` return the difference, product, and
    quotient; `(= a b)` returns `true` when `a` and `b` are equal,
    `false` otherwise — for two vectors (themselves plain Clojure
    vectors), `=` compares every component.
  - *Their use:* `-` and `*` build `parallelogram-area`'s own formula;
    `/` divides one matching component by another to recover an
    eigenvalue; `=` checks a parallelogram-area result against `0`, and
    separately checks a candidate vector against the zero vector itself.

---

## Concept Unit: Collinear Vectors — Reusing Signed Area to Detect a Shared Line

### The Problem

Every transformation this curriculum has built since Lesson 234 takes a
vector in and produces a vector out, and in general the output points in
a completely different direction from the input — `rotate90` turns
"east" into "north," `scale-x2` and `rotate90` composed together turn
`[1, 0]` into `[0, 2]`, an even bigger change of direction. But is that
always true? Before asking whether some transformation ever leaves a
direction alone, there has to be a real, computable way to check whether
two vectors point along the same line through the origin in the first
place — "the output is a scalar multiple of the input" needs to become
something Clojure can actually test, not just a sentence.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because eigenvalues and eigenvectors are a mathematical
  concept this curriculum is deriving directly, not porting from any
  external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn parallelogram-area [v1 v2]
  (- (* (vector-dx v1) (vector-dy v2)) (* (vector-dx v2) (vector-dy v1))))

(defn vectors-parallel? [v1 v2]
  (= (parallelogram-area v1 v2) 0))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn parallelogram-area [v1 v2] ...)` — `defn`, reappearing, names a
two-argument function. This is Lesson 238's own function, reappearing
here completely unchanged, not a new derivation — per the Repetition
Rule, its full explanation gets written out again rather than cited:
`vector-dx` and `vector-dy`, reappearing from Lesson 232, read each
vector's own two components; `*`, reappearing, multiplies `v1`'s `dx` by
`v2`'s `dy`, and separately `v2`'s `dx` by `v1`'s `dy`; `-`, reappearing,
subtracts the second product from the first. For two vectors `[a, b]`
and `[c, d]`, this computes `a*d - b*c` — the signed area of the
parallelogram the two vectors span, treating them both as arrows
starting at the origin.

`(defn vectors-parallel? [v1 v2] ...)` — `=`, reappearing from this
curriculum's earliest comparisons, checks whether `parallelogram-area`'s
result is exactly `0`. A parallelogram has zero area exactly when it has
been squashed flat — when its two sides no longer point in genuinely
different directions, because one is some scalar multiple of the other,
putting both vectors on the identical line through the origin. This is
called being **collinear** or **parallel** — two vectors that could both
be drawn as arrows lying on one single straight line.

Trace two concrete cases: `v1 = [2, 3]`, `v2 = [4, 6]` — `v2` is exactly
`v1` scaled by `2`. `parallelogram-area` computes `2*6 - 3*4 = 12 - 12 =
0`; `vectors-parallel?` returns `true`. Against that, `v1 = [2, 3]`, `v2
= [1, 5]` — no scalar multiple relationship at all. `parallelogram-area`
computes `2*5 - 3*1 = 10 - 3 = 7`, a genuinely nonzero number;
`vectors-parallel?` returns `false`.

### CS Lens

This is **overloading a single formula with a second interpretation** —
the exact same four-operation computation (`a*d - b*c`) means two
entirely different things depending on what's asked of it: as
`determinant`, it answers "how much does this matrix scale area"; as
this unit's own collinearity test, it answers "do these two vectors
point along the same line." The formula doesn't know or care which
question it's being used to answer — the *meaning* lives entirely in how
the caller interprets a zero-versus-nonzero result, not in the
arithmetic itself. Also recognized in: the same cross-product-style
formula testing three points for being on one line in 2D geometry,
ray-segment intersection tests in computer graphics, and
collision-detection code that needs to know whether two edges are
parallel before checking whether they cross.

### SE Lens

The alternative here would be writing a brand-new formula from scratch
for "are these collinear" — normalizing both vectors and comparing
directions, or comparing `dx/dy` ratios directly (which breaks the
moment either vector has a zero `dy`). Reusing `parallelogram-area`
instead means one already-verified, already-understood function now
serves two purposes, at the cost of a reader needing to recognize that a
function named for "area" is doing something that has nothing to do with
area in this new context — the name `parallelogram-area` stops being
fully accurate the moment it's reused this way, which is exactly why
this lesson gives the reused formula a second, purpose-specific name
(`vectors-parallel?`) rather than calling `parallelogram-area` directly
at every future call site. The tradeoff is honest: less code to verify,
at the cost of one more layer of naming a reader has to keep straight.

### Run It — Real Output

```
user=> (vectors-parallel? (make-vector 2 3) (make-vector 4 6))
true
user=> (vectors-parallel? (make-vector 2 3) (make-vector 1 5))
false
user=> (parallelogram-area (make-vector 2 3) (make-vector 4 6))
0
user=> (parallelogram-area (make-vector 2 3) (make-vector 1 5))
7
```

This matches the trace above exactly — `0` for the genuinely collinear
pair, `7` for the pair that isn't.

### Connection

With a real, verified way to test "do these two vectors point along the
same line," the next question is the one this whole lesson exists to
answer: does applying a matrix to a vector ever produce an output
collinear with the input itself?

---

## Concept Unit: Eigenvectors — Directions a Matrix Leaves Unchanged

### The Problem

`vectors-parallel?` can test any two vectors — but the actual question is
narrower and more specific: given one matrix `m` and one candidate vector
`v`, is `v` itself collinear with `matrix-vector-multiply(m, v)`, the
vector `m` actually transforms it into? And there's one case that needs
to be ruled out first: the zero vector, `[0, 0]`. Applying any matrix to
the zero vector always produces the zero vector back —
`matrix-vector-multiply(m, [0, 0])` is `[0, 0]` for every matrix `m`,
with no real transformation happening at all — so the zero vector would
trivially pass any "is the output collinear with the input" test, for
every matrix, without saying anything real about that matrix's own
behavior. An eigenvector has to be a genuine, nonzero direction, or the
whole concept becomes meaningless.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because eigenvalues and eigenvectors are a mathematical
  concept this curriculum is deriving directly, not porting from any
  external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. This unit's own code
  calls `vectors-parallel?` and `parallelogram-area`, both just built in
  this same lesson's previous unit.

### The New Code

```clojure
(defn zero-vector? [v]
  (= v (make-vector 0 0)))

(defn eigenvector-of? [m v]
  (if (zero-vector? v)
    false
    (vectors-parallel? v (matrix-vector-multiply m v))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn zero-vector? [v] ...)` — `=`, reappearing, compares `v` against
`(make-vector 0 0)`, a freshly built `[0, 0]`. Clojure's `=` on two
vectors — reappearing from this same lesson's own Unit 1 — compares
every position: this returns `true` only when `v`'s own `dx` is exactly
`0` *and* its own `dy` is exactly `0`, not when either one alone happens
to be `0`.

`(defn eigenvector-of? [m v] ...)` — `if`, a **conditional**: evaluates
`(zero-vector? v)` first; when that's `true`, the whole expression
becomes `false` immediately, without ever touching `matrix-vector-multiply`
or `vectors-parallel?` at all. `false`, a **boolean** literal, is
Clojure's own built-in value representing "no" — returned directly here
as this function's own answer for the one case being deliberately
excluded. When `(zero-vector? v)` is `false` instead, the `if` evaluates
its second branch: `matrix-vector-multiply`, reappearing unchanged from
Lesson 234, applies `m` to `v`, producing the real output vector;
`vectors-parallel?`, reappearing from this lesson's own Unit 1, then
tests whether that output is collinear with `v` itself.

This is called an **eigenvector**: a nonzero vector `v` where `m`'s own
transformation, applied to `v`, produces something lying on `v`'s own
line — stretched, shrunk, or flipped, but never rotated off it.

Trace against `scale-x2 = [[2, 0], [0, 1]]` (Lesson 235's own
non-uniform scaling matrix, doubling `x` and leaving `y` alone) and
three candidate vectors: `v = [1, 0]` — not the zero vector, so the real
check runs. `matrix-vector-multiply(scale-x2, [1, 0])` computes `[2, 0]`
(Lesson 234's own dot-product-per-row logic: row `[2, 0]` dotted with
`[1, 0]` is `2`; row `[0, 1]` dotted with `[1, 0]` is `0`).
`vectors-parallel?([1, 0], [2, 0])` computes `parallelogram-area = 1*0 -
0*2 = 0` — collinear. `eigenvector-of?` returns `true`. `v = [0, 1]` — by
the identical shape, `matrix-vector-multiply(scale-x2, [0, 1])` is `[0,
1]` itself; trivially collinear with itself; `eigenvector-of?` returns
`true` again. `v = [1, 1]`, a vector pointing along neither axis —
`matrix-vector-multiply(scale-x2, [1, 1])` computes `[2, 1]`.
`parallelogram-area([1, 1], [2, 1]) = 1*1 - 1*2 = 1 - 2 = -1`, genuinely
nonzero — not collinear. `eigenvector-of?` returns `false`: `scale-x2`
does rotate `[1, 1]` off its own original line, even though it doesn't
rotate `[1, 0]` or `[0, 1]`.

### CS Lens

`eigenvector-of?` is a **predicate function** — a function whose entire
job is answering one yes-or-no question, signaled by its own trailing
`?`, a naming convention this curriculum has used since its very first
predicates. What makes this one worth naming specifically is that it
composes two smaller predicates and one transformation into a single
real check, rather than reimplementing collinearity-testing from
scratch — the exact same "build the specific question from smaller,
already-verified pieces" idea this curriculum's union-find,
cycle-detection, and lock-acquire code all leaned on, applied here to a
completely different domain (linear algebra instead of graphs or
concurrency). Also recognized in: any "is this input valid" gate built
from several smaller checks combined with `and`/`or`, spam filters
combining several independent signals into one verdict, and compilers
testing whether a type satisfies several trait bounds at once before
accepting it.

### SE Lens

The alternative would be inlining the zero-vector check and the parallel
check directly at every call site that needs to know "is this an
eigenvector" — which this lesson is about to need at least four separate
times in the very next unit. Naming the composed check once, as
`eigenvector-of?`, means a caller states *what* it wants to know without
re-deriving *how* to know it, and a future bug fix (say, a stricter
definition of "zero vector" under floating-point vectors, which this
lesson's exact-integer examples don't need to worry about) only has to
change in one place. The real cost: `eigenvector-of?` answers *whether*
`v` is an eigenvector, but throws away the actual output vector
`matrix-vector-multiply` computed along the way — the next unit has to
recompute it, a small, deliberate duplication of work in exchange for
keeping this function's own job to exactly one question.

### Run It — Real Output

```
user=> (def scale-x2 (make-matrix (make-vector 2 0) (make-vector 0 1)))
#'user/scale-x2
user=> (def rotate90 (make-matrix (make-vector 0 -1) (make-vector 1 0)))
#'user/rotate90
user=> (eigenvector-of? scale-x2 (make-vector 1 0))
true
user=> (eigenvector-of? scale-x2 (make-vector 0 1))
true
user=> (eigenvector-of? scale-x2 (make-vector 1 1))
false
user=> (matrix-vector-multiply scale-x2 (make-vector 1 1))
[2 1]
user=> (eigenvector-of? rotate90 (make-vector 1 0))
false
```

Every value matches the trace above — including the last line, a first
hint that `rotate90` behaves completely differently from `scale-x2`
here, which Unit 4 makes precise.

### Connection

`eigenvector-of?` answers *whether* a direction is invariant, but says
nothing about *how much* a confirmed eigenvector actually stretches or
shrinks — that number is the eigenvector's own eigenvalue, and computing
it for real is next.

---

## Concept Unit: Eigenvalues — How Much an Eigenvector Actually Stretches

### The Problem

Knowing `[1, 0]` is an eigenvector of `scale-x2` confirms a direction,
but not a magnitude — `matrix-vector-multiply(scale-x2, [1, 0])` came out
`[2, 0]`, clearly some stretch of `[1, 0]` itself, but "some stretch"
isn't a number yet. The actual scalar `k` such that
`matrix-vector-multiply(m, v) = k * v` — the eigenvector's own
**eigenvalue** — is the real computational payoff: it's a single number
summarizing exactly what a matrix does along one of its own invariant
directions, without needing to re-run the full matrix multiplication to
find out.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because eigenvalues and eigenvectors are a mathematical
  concept this curriculum is deriving directly, not porting from any
  external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Only meaningful to call
  on a `v` already confirmed by `eigenvector-of?` — calling it on a
  non-eigenvector produces a number, but not one that means anything,
  since no single `k` actually satisfies `matrix-vector-multiply(m, v) =
  k * v` for such a `v`.

### The New Code

```clojure
(defn eigenvalue-from-x [v w]
  (/ (vector-dx w) (vector-dx v)))

(defn eigenvalue-from-y [v w]
  (/ (vector-dy w) (vector-dy v)))

(defn eigenvalue-for [m v]
  (if (= (vector-dx v) 0)
    (eigenvalue-from-y v (matrix-vector-multiply m v))
    (eigenvalue-from-x v (matrix-vector-multiply m v))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn eigenvalue-from-x [v w] ...)` — `/`, reappearing from this
curriculum's earliest arithmetic, divides `w`'s own `dx` (reappearing
accessor from Lesson 232) by `v`'s own `dx`. If `w = k * v`, then `w`'s
`dx` is exactly `k` times `v`'s `dx`, so this division recovers `k`
directly — but only when `v`'s own `dx` isn't `0`, since dividing by `0`
is undefined.

`(defn eigenvalue-from-y [v w] ...)` — the identical shape, using
`vector-dy` instead: divides `w`'s `dy` by `v`'s `dy`, safe exactly when
`v`'s `dy` isn't `0`.

`(defn eigenvalue-for [m v] ...)` — `if`, reappearing, tests `(=
(vector-dx v) 0)`: `=`, reappearing, compares `v`'s own `dx` against the
literal number `0`. When `v`'s `dx` is `0` (a vector pointing straight
along the `y`-axis, where dividing by `dx` would fail), the `if` picks
`eigenvalue-from-y`; otherwise it picks `eigenvalue-from-x`. Either
branch first calls `matrix-vector-multiply`, reappearing from Lesson
234, computing `w = m` applied to `v`, then hands both `v` and `w` to
whichever helper is safe to use. A vector can have `dx = 0` or `dy = 0`,
but never both at once and still count as a real eigenvector —
`zero-vector?`, from this lesson's own Unit 2, has already ruled that
case out inside `eigenvector-of?` before this function would ever
legitimately be called on it.

### CS Lens

This is the exact same **"compute once, pass to a helper"** shape this
curriculum has reused since Lesson 56 — `matrix-vector-multiply m v` is
computed a single time inside each branch, then handed to a small
function that only has to worry about doing one division correctly, not
about recomputing `w` itself. It's also a small, concrete instance of
**case analysis avoiding an undefined operation**: rather than one
formula that might divide by `0`, the code branches to guarantee the
divisor is always safe first. Also recognized in: guarding against a
`null` pointer before dereferencing it, checking a denominator before
any division in financial or physics code, and a compiler picking
between two code paths specifically to dodge a known-undefined edge case
(integer division by a value proven nonzero only on one branch).

### SE Lens

A single unguarded `(/ (vector-dx w) (vector-dx v))` would be shorter,
but would throw a real, uncaught `ArithmeticException` on any vector
pointing straight up the `y`-axis — exactly the axis case Unit 2's own
trace showed *is* a genuine eigenvector of `scale-x2`. The two-helper-
plus-dispatcher shape costs one extra function and one extra `if`, in
exchange for actually handling the input this function is guaranteed to
receive, rather than silently assuming away the case that happens to be
one of this very lesson's two worked examples. The remaining honest gap:
if a vector somehow had `dx = 0` *and* `dy = 0` and slipped past
`eigenvector-of?`'s own guard some other way, `eigenvalue-from-y` would
itself divide by `0` — this function trusts its caller to have already
excluded that case, rather than re-checking it here.

### Run It — Real Output

```
user=> (eigenvalue-for scale-x2 (make-vector 1 0))
2
user=> (eigenvalue-for scale-x2 (make-vector 0 1))
1
user=> (matrix-vector-multiply scale-x2 (make-vector 3 0))
[6 0]
user=> (eigenvalue-for scale-x2 (make-vector 3 0))
2
```

`[1, 0]`'s own eigenvalue comes out `2`, `[0, 1]`'s comes out `1` —
exactly `scale-x2`'s own two diagonal entries, `2` and `1`. That's not a
coincidence for a diagonal matrix like this one (each diagonal entry
only ever multiplies its own axis, leaving the other axis's component
completely untouched) — though this lesson only checks it for this one
matrix, not as a general proof for every diagonal matrix. The last two
lines confirm something else: `[3, 0]` is a *different* vector than `[1,
0]`, still along the same axis, and it produces the identical
eigenvalue, `2` — the eigenvalue belongs to the *direction*, not to
which particular vector along that direction happened to get tested.

### Connection

Every example so far has been `scale-x2`, which turned out to have two
clean eigenvectors, its own two axes. The next question is whether every
matrix has to have some — and `rotate90`, already showing one hint of
different behavior at the end of Unit 2, is the real test.

---

## Concept Unit: A Transformation With No Real Eigenvectors

### The Problem

`scale-x2` has two eigenvectors, sitting right on its own axes. Does
every matrix? `rotate90` already failed one candidate, `[1, 0]`, at the
end of Unit 2 — but one failed candidate only proves that *particular*
vector isn't an eigenvector, not that *no* vector is. Answering that
stronger claim for real means either testing every possible direction
(impossible — there are infinitely many) or finding a genuine algebraic
reason no candidate could ever work.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because eigenvalues and eigenvectors are a mathematical
  concept this curriculum is deriving directly, not porting from any
  external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses `eigenvector-of?`
  and `parallelogram-area` unchanged — this unit introduces no new
  function, only a new claim about existing code, checked against a new
  matrix.

### The New Code

No new function this unit — the new content is a general algebraic
derivation, checked against `eigenvector-of?` and `parallelogram-area`
exactly as already built. `rotate90 = [[0, -1], [1, 0]]` (Lesson 234's
own `90°` rotation matrix). For any vector `v = [x, y]`,
`matrix-vector-multiply(rotate90, v)` computes row `[0, -1]` dotted with
`[x, y]`, which is `0*x + (-1)*y = -y`, and row `[1, 0]` dotted with
`[x, y]`, which is `1*x + 0*y = x` — so `rotate90` always sends `[x, y]`
to `[-y, x]`, for *any* real `x` and `y`, not just the specific numbers
tried so far. Feeding that general result into `parallelogram-area([x,
y], [-y, x])` gives `x*x - y*(-y) = x*x + y*y` — the sum of two squares.
A square is never negative, and the sum of two squares is `0` only when
both squares are individually `0`, which only happens when `x = 0` and
`y = 0` at once — exactly the zero vector, already excluded by
`zero-vector?` inside `eigenvector-of?`. For every other vector, `x*x +
y*y` is strictly positive, never `0`, so `vectors-parallel?` — and
therefore `eigenvector-of?` — can never return `true` for `rotate90`,
for any nonzero real vector at all.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — this unit's own verification is the real check itself,
run against several genuinely different vectors, not a throwaway later
discarded.

### Mechanical Walkthrough

The algebra above is the actual content of this unit, so the walkthrough
is the derivation itself, checked against real numbers rather than
trusted on faith: `matrix-vector-multiply`, reappearing, computes `[-y,
x]` from `[x, y]` — proven above from `rotate90`'s own two fixed rows,
not assumed. `parallelogram-area`, reappearing from this lesson's own
Unit 1, applied to `[x, y]` and `[-y, x]`, expands (by the same `-`/`*`
shape from Unit 1) to `x*x - y*(-y)`; `-` applied to `(-1)*y`, which is
`-y`, negates it again, leaving `x*x + y*y` — two squares, added. This is
called the matrix having **no real eigenvectors**: a genuine, provable
fact about `rotate90` itself, not a gap in how thoroughly it happened to
get tested.

Trace four separate candidate vectors against `rotate90`, none related
to each other by any scalar: `[1, 0]` → `matrix-vector-multiply` gives
`[0, 1]` ("east" becomes "north," Lesson 234's own established fact);
`parallelogram-area([1, 0], [0, 1]) = 1*1 - 0*0 = 1`. `[0, 1]` → gives
`[-1, 0]`; `parallelogram-area([0, 1], [-1, 0]) = 0*0 - 1*(-1) = 1`. `[1,
1]` → gives `[-1, 1]`; `parallelogram-area([1, 1], [-1, 1]) = 1*1 -
1*(-1) = 1 + 1 = 2`. `[3, -2]` → gives `[2, 3]`; `parallelogram-area([3,
-2], [2, 3]) = 3*3 - (-2)*2 = 9 + 4 = 13` — exactly `x*x + y*y` for `x=3,
y=-2`: `9 + 4 = 13`, matching the general formula derived above
precisely, not approximately.

### CS Lens

This is a **nonexistence proof carried out by direct algebraic
substitution** — showing a property fails for *every* possible input by
reducing the question to one general symbolic case (`v = [x, y]`) rather
than exhausting cases one at a time, the same proof technique behind
showing a hash function has no collisions in some restricted domain, or
that a particular recursive function always terminates because its
argument strictly shrinks every single call. Also recognized in: a
compiler proving a branch is unreachable for *any* possible input rather
than testing sample inputs, a cryptographic proof that no key produces a
certain weakness, and the general algebraic proofs this exact curriculum
already leaned on in Lesson 236 (`translate-point` failing additivity,
for any point and vector at all) and Lesson 239 (a singular matrix's
transformation collapsing distinct inputs, for a whole family of inputs,
not one lucky pair).

### SE Lens

The alternative — testing more and more candidate vectors and never
finding one that works — can never actually *prove* the negative claim,
no matter how many are tried; it can only fail to find a counterexample.
This lesson's own general derivation is the only honest way to state
"rotate90 has no real eigenvectors" rather than the weaker, quietly
different claim "rotate90 has no real eigenvectors among the ones I
happened to try." The real engineering cost of skipping the derivation:
shipping `eigenvector-of?` as a general-purpose tool without
understanding it can validly return `false` for *every* input on some
matrices isn't a bug to hunt for — it's the mathematically correct
answer, and code calling `eigenvector-of?` in a loop hoping to find at
least one eigenvector needs to know, honestly, that the loop can validly
run forever finding nothing, rather than assume a bug exists in the
search itself.

### Run It — Real Output

```
user=> (matrix-vector-multiply rotate90 (make-vector 1 0))
[0 1]
user=> (matrix-vector-multiply rotate90 (make-vector 0 1))
[-1 0]
user=> (matrix-vector-multiply rotate90 (make-vector 1 1))
[-1 1]
user=> (matrix-vector-multiply rotate90 (make-vector 3 -2))
[2 3]
user=> (parallelogram-area (make-vector 3 -2) (matrix-vector-multiply rotate90 (make-vector 3 -2)))
13
user=> (eigenvector-of? rotate90 (make-vector 1 0))
false
user=> (eigenvector-of? rotate90 (make-vector 0 1))
false
user=> (eigenvector-of? rotate90 (make-vector 1 1))
false
user=> (eigenvector-of? rotate90 (make-vector 3 -2))
false
```

Four genuinely different vectors, all `false` — matching the general
proof above exactly, not just consistent with it.

### Connection

`scale-x2` and `rotate90`, the same two matrices Lesson 235 used to
prove matrix multiplication non-commutative, turn out to differ just as
sharply here: one has real invariant directions, the other provably has
none. The closing section below traces one single vector through every
function this lesson built, start to finish.

---

## Connect the Pieces

One concrete vector, `v = [3, 0]`, moving through every unit built in
this lesson:

1. `matrix-vector-multiply(scale-x2, [3, 0])` → `[6, 0]` — real, verified
   output from Unit 3's own trace.
2. `vectors-parallel?([3, 0], [6, 0])` — `parallelogram-area` computes
   `3*0 - 0*6 = 0`, the identical formula Unit 1 verified; a zero result
   means collinear.
3. `eigenvector-of?(scale-x2, [3, 0])` — `[3, 0]` isn't the zero vector,
   and step 2 already showed the two vectors are collinear, so this
   returns `true`, matching the pattern Unit 2 verified on `[1, 0]` and
   `[0, 1]`.
4. `eigenvalue-for(scale-x2, [3, 0])` → `2` — real, verified output from
   Unit 3's own trace; the same eigenvalue as `[1, 0]`'s own, confirming
   again that the eigenvalue belongs to the axis, not to which specific
   vector along it got tested.

Contrast against `rotate90`, using `[1, 0]` — the vector Unit 2 already
tested against both matrices:

5. `matrix-vector-multiply(rotate90, [1, 0])` → `[0, 1]` — real, verified
   output from Unit 4's own trace.
6. `vectors-parallel?([1, 0], [0, 1])` — `parallelogram-area` computes
   `1*1 - 0*0 = 1`, not `0` — not collinear.
7. `eigenvector-of?(rotate90, [1, 0])` → `false` — real, verified output
   from Unit 2's own trace, matching step 6's own reasoning exactly.
8. `eigenvalue-for(rotate90, [1, 0])` is never called — there's no
   honest eigenvalue for a vector that isn't a real eigenvector of this
   matrix, exactly the restriction Unit 3's own `Dependencies` field
   named directly.

Same five functions, two different matrices, one clean eigenvalue found
and one correctly refused — the actual payoff of everything built in
this lesson.

## What Breaks Without This

Delete `eigenvector-of?`'s own zero-vector guard — the exact bug Unit
2's own Problem section warned about in prose, reproduced for real:

```clojure
(defn eigenvector-of-broken? [m v]
  (vectors-parallel? v (matrix-vector-multiply m v)))
```

```
user=> (eigenvector-of-broken? rotate90 (make-vector 0 0))
true
```

`rotate90` — the exact matrix Unit 4 just spent an entire derivation
proving has *no* real eigenvectors — now claims to have one: the zero
vector, reported as a genuine eigenvector, of a matrix that provably has
none. The broken function isn't lying about the arithmetic —
`matrix-vector-multiply(rotate90, [0, 0])` really is `[0, 0]`, and `[0,
0]` really is collinear with itself, since `parallelogram-area([0, 0],
[0, 0])` really is `0`. The bug is definitional: the zero vector
satisfies `matrix-vector-multiply(m, v) = k * v` for *every* possible
`k` simultaneously (since both sides are always `[0, 0]`, no matter what
`k` is), which makes it useless as a witness for "this matrix has an
invariant direction" — a fact true of every matrix, telling nothing about
which one is actually being tested. Restoring the guard:

```
user=> (eigenvector-of? rotate90 (make-vector 0 0))
false
```

matches this lesson's own established definition again: an eigenvector
has to be a real, nonzero direction, not the one vector every matrix
trivially agrees on.

## Exercises

1. Build `[[3, 0], [0, 3]]`, a *uniform* scaling matrix (unlike
   `scale-x2`, both diagonal entries equal). Test `eigenvector-of?`
   against `[1, 0]`, `[0, 1]`, and `[1, 1]` — a vector pointing along
   neither axis. Explain, in one sentence, what's different about a
   uniform scale that makes even an off-axis vector like `[1, 1]` an
   eigenvector, when `scale-x2` itself already proved `[1, 1]` is *not*
   one of its own eigenvectors.
2. Build the `180°` rotation matrix, `[[-1, 0], [0, -1]]` (Lesson 234's
   own exercise 1). Test whether `[1, 0]` and `[0, 1]` are eigenvectors,
   and if so, compute their eigenvalues with `eigenvalue-for`. Explain
   why a `180°` rotation behaves completely differently here from
   `rotate90`'s own `90°` rotation, even though both are, in the
   everyday sense, "just rotations."
3. `matrix-inverse`, from Lesson 239, is only defined when a matrix's
   `determinant` isn't `0`. Using `eigenvalue-for`, compute `scale-x2`'s
   own two eigenvalues, multiply them together, and compare the result
   to `(determinant scale-x2)` from Lesson 238. Try the same comparison
   for the uniform scaling matrix from Exercise 1. State, from these two
   results alone (not a general proof), what relationship this suggests
   between a matrix's eigenvalues and its determinant.

## Definition of Done

- [ ] `parallelogram-area` and `vectors-parallel?` both run against a
      genuinely collinear pair and a genuinely non-collinear pair,
      matching this lesson's own traced values exactly.
- [ ] `eigenvector-of?` correctly returns `true` for `scale-x2` against
      both of its own axis vectors, and `false` against `[1, 1]`.
- [ ] `eigenvalue-for` returns `2` and `1` for `scale-x2`'s two
      eigenvectors, and returns `2` again for a *different* vector along
      the same axis as the first, confirming the eigenvalue belongs to
      the direction, not the specific vector.
- [ ] `eigenvector-of?` returns `false` for `rotate90` against at least
      four genuinely different candidate vectors, matching the general
      `x*x + y*y` proof.
- [ ] The zero-vector guard bug was reproduced for real
      (`eigenvector-of-broken?` claiming `rotate90` has an eigenvector it
      provably doesn't), then fixed back to the guarded version.
- [ ] `git commit` with a message explaining *why* eigenvectors need a
      nonzero-vector guard baked into their own definition, not just
      what the guard checks — for example: `"Exclude the zero vector
      from eigenvector-of? — it trivially satisfies every possible
      eigenvalue at once, making it meaningless as a witness for any
      specific matrix's own invariant directions."`
