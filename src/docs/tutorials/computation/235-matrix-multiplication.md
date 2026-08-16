# Lesson 235: Matrix Multiplication — Composing Transformations

**What you will build**: A single combined matrix that does the exact
work of two separate transformations applied one after another —
derived, not just defined, by working out precisely what numbers a
combined matrix would need to reproduce chained application exactly. It
verifies the combined matrix against real chained computation, then
proves something many people find genuinely surprising the first time
they see it demonstrated: unlike ordinary number multiplication, matrix
multiplication is **not commutative** — scaling then rotating a vector
is a real, different transformation from rotating then scaling it, and
the two combined matrices themselves are provably different, not just
their effect on one particular vector.

**What you need to know first**: Lesson 234's `matrix-vector-multiply`,
`make-matrix`, and `matrix-row` — this lesson's entire derivation is
built from applying that function twice in a row. Lesson 233's
`dot-product`, reused directly.

**Terms used in this lesson**:

- **composition** — applying one transformation, then a second
  transformation to the result; two rules combined into a single,
  equivalent overall effect.
- **matrix multiplication** — the operation that combines two matrices
  into a single matrix, defined specifically so that applying the
  combined matrix to any vector produces the exact same result as
  applying the two original matrices one after another, in a specific
  order.
- **column** (of a matrix) — one vertical line of a matrix's own
  numbers, cutting across every row at the same position; needed
  alongside a matrix's rows to compute matrix multiplication correctly.
- **non-commutative** — an operation where the order of its two inputs
  genuinely changes the result; matrix multiplication is non-
  commutative, in sharp contrast to ordinary number multiplication,
  where `a * b` always equals `b * a`.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`get`** / **`dot-product`** / **`matrix-vector-multiply`**
  - *What they are:* reused unchanged from Lessons 233 and 234 — `get`
    reads a positional value; `dot-product` measures alignment between
    two vectors; `matrix-vector-multiply` applies a matrix's
    transformation to a single vector.
  - *Their use:* `matrix-vector-multiply` is called twice, in sequence,
    to establish what "chained" transformation actually means; `get`
    and `dot-product`, indirectly through it, do the real arithmetic.

---

## Concept Unit: Composing Transformations by Chaining

### The Problem

Lesson 234 built one transformation applied to one vector. Real
transformations are frequently applied in sequence — scale something,
then rotate it. Before asking whether a single combined matrix could do
both at once, it's worth establishing precisely what "doing both, one
after another" actually computes, so there's something concrete to
check a combined matrix against later.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because matrix multiplication is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn apply-two-transformations [second-matrix first-matrix v]
  (matrix-vector-multiply second-matrix (matrix-vector-multiply first-matrix v)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def scale-x2 (make-matrix (make-vector 2 0) (make-vector 0 1)))
#'user/scale-x2
user=> (def rotate90 (make-matrix (make-vector 0 -1) (make-vector 1 0)))
#'user/rotate90
user=> (def v (make-vector 1 0))
#'user/v
user=> (def scale-then-rotate (apply-two-transformations rotate90 scale-x2 v))
#'user/scale-then-rotate
user=> scale-then-rotate
[0 2]
```

### Mechanical Walkthrough

`scale-x2` scales only the `x` component (`[2 0]`/`[0 1]` as rows —
double `x`, leave `y` alone), a deliberately *non-uniform* scale, unlike
Lesson 234's own scale-both-by-2 matrix — chosen specifically because a
uniform scale would hide something Unit 3 needs to show. `rotate90` is
Lesson 234's own `90°` rotation matrix, unchanged.

`(defn apply-two-transformations [second-matrix first-matrix v] ...)` —
`matrix-vector-multiply`, reappearing from Lesson 234, called *twice*,
nested: the inner call applies `first-matrix` to `v`, producing an
intermediate vector; the outer call applies `second-matrix` to *that*
result. The naming — `second-matrix` listed first as an argument,
applied last — mirrors ordinary function composition notation, where
`f(g(x))` means "apply `g` first, then `f`."

Trace: `v = [1, 0]`. `scale-x2` applied first: `x` doubles, `y` stays —
`[2, 0]`. `rotate90` applied to *that*: Lesson 234's own rotation logic,
`[0, 2]`. `scale-then-rotate` is `[0, 2]` — the real, concrete result of
genuinely doing both transformations, one after the other, using
nothing but two calls to an already-fully-verified function.

### CS Lens

This is **composition**, the exact operation Unit 1's naming already
anticipates: two transformations, applied in sequence, produce a third,
equivalent overall effect. Nothing about `apply-two-transformations`
is new machinery — it's `matrix-vector-multiply`, called twice, with
the second call's input being the first call's output. Establishing
this *before* attempting to build a single combined matrix is
deliberate: the combined matrix, built next, has one job and one job
only — reproduce exactly what this unit's own chained computation
already produces, for every possible vector, not just this one.

Also recognized in: a factory assembly line, where the output of one
station becomes the input to the next, and the line's overall effect is
the composition of every individual station's own transformation; a
photo-editing pipeline applying a crop, then a color adjustment, then a
sharpen filter, each stage's output feeding the next; a translation
pipeline converting a document from one language to an intermediate one
and then to a third, the overall translation being the composition of
both individual steps.

### SE Lens

The alternative — jumping straight to deriving a combined matrix without
first pinning down exactly what "chained" means concretely — risks
building something that merely *looks* plausible instead of something
provably correct. `apply-two-transformations`'s own real output,
`[0, 2]`, is the one fixed, verified fact the next unit's entire
derivation is checked against; without it, there would be nothing to
compare a "does this look right" combined matrix to, only a hope that
the algebra was done correctly.

---

## Concept Unit: Matrix Multiplication — Derived From What Chaining Requires

### The Problem

Is there a single matrix that, applied *directly* to any vector,
produces the exact same result `apply-two-transformations` computes by
calling `matrix-vector-multiply` twice? If so, what numbers does it
actually need to contain?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because matrix multiplication is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn matrix-column [m index]
  (make-vector (get (matrix-row m 0) index) (get (matrix-row m 1) index)))

(defn matrix-multiply-row [m2-row m1]
  (make-vector (dot-product m2-row (matrix-column m1 0)) (dot-product m2-row (matrix-column m1 1))))

(defn matrix-multiply [m2 m1]
  (make-matrix (matrix-multiply-row (matrix-row m2 0) m1) (matrix-multiply-row (matrix-row m2 1) m1)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def combined (matrix-multiply rotate90 scale-x2))
#'user/combined
user=> combined
[[0 -1] [2 0]]
user=> (def combined-applied (matrix-vector-multiply combined v))
#'user/combined-applied
user=> combined-applied
[0 2]
user=> (= scale-then-rotate combined-applied)
true
```

### Mechanical Walkthrough

`(defn matrix-column [m index] ...)` — `get`, reappearing, twice:
reads position `index` out of *both* of `m`'s rows, bundling them into
a **column** — a vertical slice cutting across every row at the same
position, genuinely different data from a row, even though both happen
to be two-element vectors.

`(defn matrix-multiply-row [m2-row m1] ...)` — `dot-product`,
reappearing, twice: dots one row of `m2` against `m1`'s first *column*,
then against `m1`'s second column — producing one full row of the
combined matrix.

`(defn matrix-multiply [m2 m1] ...)` — calls `matrix-multiply-row` once
per row of `m2`, assembling the two results into a new matrix via
`make-matrix`, reappearing from Lesson 234.

Why columns, not rows, of `m1`: tracing through what
`apply-two-transformations` actually computes (`matrix-vector-multiply
m2 (matrix-vector-multiply m1 v)`) and expanding the algebra shows the
combined matrix's entry at row `i`, column `j` has to equal row `i` of
`m2` dotted against column `j` of `m1` — not row `j`. This is the one
genuinely new piece of bookkeeping matrix multiplication requires beyond
ordinary dot products.

Trace: `combined = (matrix-multiply rotate90 scale-x2)`. `scale-x2`'s
columns: column `0` is `[2, 0]` (both rows' entry at position `0`);
column `1` is `[0, 1]`. `rotate90`'s row `0` is `[0, -1]`:
`(dot-product [0 -1] [2 0]) = 0`, `(dot-product [0 -1] [0 1]) = -1` —
combined row `0` is `[0, -1]`. `rotate90`'s row `1` is `[1, 0]`:
`(dot-product [1 0] [2 0]) = 2`, `(dot-product [1 0] [0 1]) = 0` —
combined row `1` is `[2, 0]`. `combined` is `[[0, -1], [2, 0]]`.
`(matrix-vector-multiply combined v)` — applying this single matrix
directly to `v = [1, 0]` — produces `[0, 2]`, matching Unit 1's own
chained result *exactly*. The derivation wasn't a guess checked
afterward; it was worked out specifically to produce this result.

### CS Lens

Matrix multiplication is defined the way it is *because of* this exact
requirement — a matrix product's whole reason for being built this way,
rows-dotted-against-columns, is so that `matrix-multiply` and
`apply-two-transformations` always agree, for *any* two matrices and
*any* vector, not merely the specific example checked here. This is the
same relationship Lesson 233's `vector-add` had to
`apply-vector-to-point`: an algebraic operation earns trust by being
shown to compute exactly what a real, concrete, independently-checkable
process already computes, not by looking like a plausible generalization
of ordinary multiplication.

Also recognized in: a currency conversion chain (dollars to euros, then
euros to yen) collapsing into one single combined exchange rate that
produces the identical final amount directly; a series of unit
conversions (miles to kilometers, then kilometers to meters) combining
into one single multiplier; a compiler's own optimization pass that
replaces two sequential operations with one equivalent, faster one,
verified to produce identical output on every input, not just the ones
tested.

### SE Lens

The alternative to deriving `matrix-multiply` this carefully — defining
it by some other plausible-looking rule (row times row, for instance,
instead of row times column) — would produce a real, computable
function that simply wouldn't match `apply-two-transformations` at all;
nothing about Clojure itself would flag such a mismatch, since both
versions would run without error and simply return different, equally
plausible-looking matrices. This is exactly the kind of silent,
undetectable-by-inspection bug this curriculum keeps meeting under
different names — the value of deriving the rule from a known-correct
target, and then actually checking the two against each other (as this
unit's own `Run It` section did), rather than trusting the formula on
faith.

---

## Concept Unit: Order Matters — Matrix Multiplication Is Not Commutative

### The Problem

Ordinary numbers satisfy `a * b = b * a`, always, without exception.
Does matrix multiplication share that property? Scaling then rotating
and rotating then scaling both apply the identical two transformations,
just in a different order — do they actually produce the same overall
effect?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because matrix multiplication is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

No new function — this unit reuses `apply-two-transformations` and
`matrix-multiply`, both completely unchanged. What's new is the
comparison: computing both possible orders and checking whether they
agree.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def rotate-then-scale (apply-two-transformations scale-x2 rotate90 v))
#'user/rotate-then-scale
user=> rotate-then-scale
[0 1]
user=> scale-then-rotate
[0 2]
user=> (= scale-then-rotate rotate-then-scale)
false
```

The difference isn't specific to this one vector — the two *matrices*
themselves are different:

```
user=> (def combined-other-order (matrix-multiply scale-x2 rotate90))
#'user/combined-other-order
user=> combined-other-order
[[0 -2] [1 0]]
user=> combined
[[0 -1] [2 0]]
user=> (= combined combined-other-order)
false
```

### Mechanical Walkthrough

`(apply-two-transformations scale-x2 rotate90 v)` — `rotate90` applied
*first* this time, `scale-x2` applied second, the reverse order from
Unit 1. `v = [1, 0]` rotated `90°` is `[0, 1]` ("north," from Lesson
234's own trace); scaling *that* by `scale-x2` (double `x`, leave `y`)
leaves it `[0, 1]` unchanged, since its `x` component is already `0`.
`rotate-then-scale` is `[0, 1]` — genuinely different from
`scale-then-rotate`'s own `[0, 2]`.

`(matrix-multiply scale-x2 rotate90)` — the combined matrix for *this*
order — comes out `[[0, -2], [1, 0]]`, verifiably different from
`combined`'s own `[[0, -1], [2, 0]]` from Unit 2. This isn't a fact
about one unlucky choice of `v` — the two matrices are provably
different objects, meaning *every* vector, not just this one, would see
a different result depending on which order the two transformations
were combined in.

### CS Lens

Matrix multiplication is **non-commutative** — `matrix-multiply(A, B)`
does not, in general, equal `matrix-multiply(B, A)` — and this isn't an
arbitrary quirk of the notation, it reflects something genuinely true
about the transformations themselves: scaling `x` by `2` and then
rotating `90°` really is a different overall motion from rotating `90°`
and then scaling `x` by `2`, because rotation changes *which* direction
is currently "`x`" before the second transformation's scaling ever gets
applied to it. Order is a real, physical fact about composing motions,
and matrix multiplication's own non-commutativity is what correctly
preserves that fact instead of quietly discarding it.

Also recognized in: putting on socks then shoes versus putting on shoes
then socks — the same two actions, genuinely different (and one much
less practical) outcome depending on order; a recipe's own step order,
where "add flour, then mix" and "mix, then add flour" produce
meaningfully different results even though the same two actions
happened; a series of legal contract amendments, where amending clause
A and then clause B can produce a genuinely different final contract
than amending them in the reverse order, if one amendment's own wording
depends on the state the other left behind.

### SE Lens

The alternative — assuming, by analogy with ordinary number
multiplication, that matrix order doesn't matter — is exactly the trap
this unit's own two side-by-side traces exist to close off, concretely
rather than abstractly. The real cost of that assumption, in genuine
code: a graphics or physics system that composes transformations in the
wrong order produces an object that's scaled, rotated, or positioned
subtly (or not so subtly) incorrectly — not a crash, a plausible-looking
wrong picture, exactly the failure shape this whole curriculum keeps
returning to. `matrix-multiply(A, B)`'s own naming convention — read
right to left, `B` applied first — has to be tracked deliberately and
consistently through any real system built on it, precisely because
getting it backward produces something that runs without error and
looks like it might even be correct.

---

## Connect the Pieces

Follow vector `v = [1, 0]` through every operation built in this
lesson, in both possible orders. `apply-two-transformations` (Unit 1)
establishes, by real chained computation, that scaling `x` by `2` and
then rotating `90°` sends `v` to `[0, 2]`. `matrix-multiply` (Unit 2),
derived specifically to match that chained result — row of the second
matrix dotted against column of the first — produces a single combined
matrix, `[[0, -1], [2, 0]]`, that reproduces `[0, 2]` exactly when
applied directly, proving the derivation genuinely captures what
chaining means, not merely resembling it. Reversing the order — rotate
first, then scale (Unit 3) — produces a completely different result,
`[0, 1]`, from the identical starting vector and the identical two
transformations, and the two *combined matrices themselves*,
`[[0, -1], [2, 0]]` and `[[0, -2], [1, 0]]`, are provably unequal —
order isn't a cosmetic detail of how the composition happens to be
written, it changes the actual transformation that results.

## What Breaks Without This

Compute a matrix product using rows dotted against rows — the
plausible-looking wrong rule this lesson's own Unit 2 explicitly warned
against — instead of rows against columns:

```clojure
(defn matrix-multiply-broken-row [m2-row m1]
  (make-vector (dot-product m2-row (matrix-row m1 0)) (dot-product m2-row (matrix-row m1 1))))

(defn matrix-multiply-broken [m2 m1]
  (make-matrix (matrix-multiply-broken-row (matrix-row m2 0) m1) (matrix-multiply-broken-row (matrix-row m2 1) m1)))
```

```
user=> (matrix-multiply-broken rotate90 scale-x2)
[[0 -1] [2 0]]
```

For this specific pair of matrices, the broken version happens to
produce the identical result to the correct one — `scale-x2`'s own rows
and columns happen to coincide, since it has zeros in its off-diagonal
positions. Try it against a matrix where rows and columns genuinely
differ, like `rotate90` itself used as the *first* transformation
(`matrix-multiply-broken rotate90 rotate90`, rows-against-rows) against
the real `(matrix-multiply rotate90 rotate90)` — the two will disagree,
because `rotate90`'s own row `0` (`[0, -1]`) and column `0` (`[0, 1]`)
are genuinely different vectors, and only one of them is the correct
thing to dot against. This is the exact reason Unit 2's own derivation
insisted on tracing through what chaining actually requires, rather
than guessing at a plausible-sounding rule and trusting it without
checking.

## Exercises

1. Compute `(matrix-multiply rotate90 rotate90)` — `90°` rotation
   composed with itself — and confirm it matches the `180°` rotation
   matrix from Lesson 234's own first exercise.
2. Confirm the identity matrix is a genuine identity for matrix
   multiplication too: `(matrix-multiply identity-matrix m)` and
   `(matrix-multiply m identity-matrix)` should both equal `m` exactly,
   for any matrix `m` — test it against both `scale-x2` and `rotate90`.
3. Find (or construct) a *different* pair of matrices that *do*
   commute — where `matrix-multiply(A, B)` equals `matrix-multiply(B,
   A)` — and explain in one sentence what's special about that specific
   pair that made order stop mattering.

## Definition of Done

- [ ] `apply-two-transformations`, `matrix-column`,
      `matrix-multiply-row`, and `matrix-multiply` all defined and run
      in a live `bb` REPL, matching every transcript shown above
      exactly.
- [ ] Unit 1's chained computation reproduced.
- [ ] Unit 2's combined matrix reproduced, with `=` confirming it
      matches the chained result exactly.
- [ ] Unit 3's non-commutativity reproduced at both the applied-vector
      level and the raw-matrix level.
- [ ] Exercise 2 completed, confirming the identity matrix behaves
      correctly on both sides of a matrix product.
- [ ] `git commit -m "Add Lesson 235: matrix multiplication derived to
      match chained transformation, proven non-commutative both by
      result and by the combined matrices themselves"`
