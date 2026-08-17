# Lesson 241: Systems of Linear Equations — Solving by Row Reduction

**What you will build**: `solve-system`, a real function that solves two
simultaneous linear equations for their exact `x` and `y` — not by
computing a full matrix inverse (Lesson 239's own method), but by
**Gaussian elimination**: combining the two equations to cancel one
variable out of the second entirely, then reading the answer back out one
variable at a time. The technique is derived concretely for two
equations and verified against two genuinely different systems, including
one deliberately singular system where elimination itself exposes, in a
new and different way, the exact same "no unique solution" fact Lesson
239 already proved through its own inverse formula.

**What you need to know first**: Lesson 232's `make-vector`, `vector-dx`,
and `vector-dy`. Lesson 233's `vector-add` and `vector-scale`, reused
directly to combine one matrix row with a scaled copy of another. Lesson
234's `make-matrix`, `matrix-row`, and `matrix-vector-multiply` — a
linear system `m * [x, y] = b` is exactly this lesson's own starting
point. Lesson 238's `determinant`, reused to connect elimination's own
arithmetic back to a number already computed a different way. Lesson
239's own idea of a **singular** matrix (zero determinant, a
transformation that collapses distinct inputs onto the same output) —
this lesson's own Unit 4 meets that same fact again, from elimination's
own point of view.

**Terms used in this lesson**:

- **linear system** — two (or more) linear equations considered
  together, sharing the same unknowns, that must all be true
  simultaneously. `2x + y = 5` and `x + 3y = 10` together, needing one
  single `[x, y]` pair that satisfies both at once, is a linear system.
- **row operation** — a way of combining a linear system's own equations
  that doesn't change what values of `x` and `y` satisfy it: replacing
  one equation with itself minus some multiple of another equation still
  describes exactly the same solution, since both equations were already
  true for that solution to begin with. This is the real justification
  for why elimination is allowed to work at all, not just a computational
  trick.
- **elimination** (short for **Gaussian elimination**) — using a row
  operation specifically chosen to make one variable's own coefficient
  become exactly `0` in one equation, removing it from that equation
  entirely.
- **pivot** — the coefficient elimination divides by to compute how much
  of one row to subtract from another; here, the top-left entry of the
  matrix, `m`'s own coefficient on `x` in the first equation.
- **triangular system** — a linear system where, after elimination, one
  equation contains only one unknown — the direct payoff of elimination,
  since a single equation in a single unknown is immediately solvable.
- **back-substitution** — solving a triangular system's own single-
  unknown equation first, then substituting that known value into the
  remaining equation(s) to solve for what's left, working backward
  through the variables one at a time.

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
    two-element vector; `vector-dx`/`vector-dy` read its two components
    back out via `get`.
  - *Their use:* both a linear system's own right-hand side (`b`) and
    every matrix row this lesson touches are plain two-component
    vectors, built and read through these three.
- **`vector-add`** / **`vector-scale`**
  - *What they are:* reused unchanged from Lesson 233.
  - *Implementation:* `(defn vector-add [v1 v2] (make-vector (+
    (vector-dx v1) (vector-dx v2)) (+ (vector-dy v1) (vector-dy v2))))`
    adds two vectors component-wise; `(defn vector-scale [v k]
    (make-vector (* (vector-dx v) k) (* (vector-dy v) k)))` multiplies
    every component by `k`.
  - *Their use:* a row operation — "subtract some multiple of one row
    from another" — is exactly `vector-add` applied to one row and a
    negatively `vector-scale`d copy of another, with no new arithmetic
    needed at all.
- **`make-matrix`** / **`matrix-row`** / **`matrix-vector-multiply`**
  - *What they are:* reused unchanged from Lesson 234.
  - *Implementation:* `(defn make-matrix [row0 row1] [row0 row1])`;
    `(defn matrix-row [m index] (get m index))`; `matrix-vector-multiply`
    applies a matrix's transformation to a vector via two dot products.
  - *Their use:* the linear system itself is `m` and `b`, where `m *
    [x, y] = b`; `matrix-vector-multiply` is reused at the very end of
    this lesson to check a computed solution against the original
    system, by confirming it reproduces `b` exactly.
- **`determinant`**
  - *What it is:* reused unchanged from Lesson 238.
  - *Implementation:* `(defn determinant [m] (- (* (get (matrix-row m 0)
    0) (get (matrix-row m 1) 1)) (* (get (matrix-row m 0) 1) (get
    (matrix-row m 1) 0))))`.
  - *Its use:* this lesson's own Unit 1 shows elimination's new
    bottom-right entry is always exactly `determinant(m)` divided by the
    pivot — a real, checkable connection between two lessons' worth of
    independently-derived arithmetic.
- **`get`** / **`-`** / **`*`** / **`+`** / **`/`**
  - *What they are:* Clojure's positional lookup, subtraction,
    multiplication, addition, and division functions, reused throughout
    this curriculum since its earliest arithmetic.
  - *Their use:* `/` computes the pivot's own ratio and, later, both
    unknowns directly; `-`, `*`, and `+` do the rest of elimination and
    back-substitution's own arithmetic.

---

## Concept Unit: Eliminating a Variable From the Second Equation

### The Problem

A linear system `m * [x, y] = b` — two equations, two unknowns — already
has one solution method available: Lesson 239's `matrix-inverse`, applied
via `matrix-vector-multiply(matrix-inverse(m), b)`. That method works,
but it hides exactly *how* the two equations get combined to isolate `x`
and `y` behind a single closed-form formula for a `2x2` inverse — a
formula that only exists in that simple closed form because the matrix
is exactly `2x2`; it does not describe what to actually *do*, step by
step, for a larger system. Gaussian elimination is the general technique
real solvers use instead: combine the two equations so that one of them
loses a variable entirely, then solve what's left. This lesson derives
and verifies that technique concretely for two equations — the
representative core, not a claim about arbitrarily many equations, the
same honest scope Lessons 99, 100, and 134 already used for algorithms
whose fully general case goes well beyond what one lesson can derive and
verify by hand.

One design choice, made explicit before any code: rather than inventing
a new three-component "row" type to hold one equation's two coefficients
and its own right-hand-side number together (a real option, sometimes
called an *augmented matrix*), this lesson keeps `m` (the coefficients)
and `b` (the right-hand sides) as two separate values — a `2x2` matrix
and a plain two-component vector, exactly the representations Lessons
232 through 234 already built and this whole curriculum already knows how
to read. The row operations below apply to both `m` and `b` together,
using the identical factor for each, which is what actually keeps the
system's own meaning intact.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because Gaussian elimination is a mathematical technique this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn elimination-factor [m]
  (/ (get (matrix-row m 1) 0) (get (matrix-row m 0) 0)))

(defn eliminate [m]
  (make-matrix
    (matrix-row m 0)
    (vector-add (matrix-row m 1) (vector-scale (matrix-row m 0) (- (elimination-factor m))))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn elimination-factor [m] ...)` — `/`, reappearing from this
curriculum's earliest arithmetic, divides row `1`'s own first entry (`c`,
in a matrix `[[a, b], [c, d]]`) by row `0`'s own first entry (`a`, the
**pivot**). `get` and `matrix-row`, both reappearing from Lesson 234,
read those two specific entries out. If row `1` were subtracted from
`elimination-factor` copies of row `0`, row `1`'s own first entry would
become exactly `c - (c/a)*a = 0` — this single division is precisely the
number that makes that cancellation exact, not an approximation.

`(defn eliminate [m] ...)` — `make-matrix`, reappearing, builds a new
matrix from two rows: the first is `(matrix-row m 0)`, row `0` completely
unchanged — elimination only ever touches the *second* row of a two-row
system. The second is `(vector-add (matrix-row m 1) (vector-scale
(matrix-row m 0) (- (elimination-factor m))))` — read from the inside
out: `-`, called with a single argument (Lesson 239's own established
use, reappearing here), negates `elimination-factor`'s own result;
`vector-scale`, reappearing from Lesson 233, multiplies row `0` by that
negative factor; `vector-add`, reappearing from Lesson 233, adds the
result to row `1` — component-wise addition of a row and a negatively
scaled copy of another row is exactly "subtract a multiple of one row
from another," the **row operation** this lesson's own Terms section
named. This is called **eliminating** the first variable from the second
equation: row `1`'s own first component becomes exactly `0`, by
construction, not by luck.

### CS Lens

This is the identical **"compute once, pass to a helper"** shape this
curriculum has reused since Lesson 56: `elimination-factor` is computed
a single time and handed into the row operation that needs it, rather
than recomputing `c/a` inline. More specifically, `eliminate` is a real
instance of a **row operation preserving a system's own solution set** —
the mathematical guarantee that makes elimination legitimate rather than
just numerically convenient: because row `1`'s new version is built
entirely from row `1` and row `0` — both already true statements about
the same unknown `[x, y]` — any `[x, y]` satisfying the original system
still satisfies the new one, and vice versa. Also recognized in: pivoting
in the simplex method for linear programming, reducing a matrix to
row-echelon form to compute rank, and Gauss-Jordan elimination (a direct
extension of this exact same operation, continued until the matrix
becomes the identity).

### SE Lens

The alternative considered and rejected above — a three-component
"augmented row" type bundling coefficients and right-hand-side together —
would let one function eliminate the whole system in a single pass,
instead of this lesson's own two separate functions (`eliminate` for
`m`, and the next unit's `eliminate-b` for `b`). The real cost of the
choice actually made: a caller has to remember to apply the *same*
`elimination-factor` to both `m` and `b`, correctly, calling two
functions instead of one — a real, genuine way to get this wrong, which
the very next unit's own Problem section names directly and this
lesson's closing "What Breaks" section reproduces as a real bug. The
benefit: zero new data representation, reusing exactly the vector and
matrix machinery Lessons 232 through 234 already built and verified,
rather than inventing and separately verifying a new three-wide row type
for this one lesson alone.

### Run It — Real Output

```
user=> (def m1 (make-matrix (make-vector 2 1) (make-vector 1 3)))
#'user/m1
user=> (def b1 (make-vector 5 10))
#'user/b1
user=> (elimination-factor m1)
1/2
user=> (eliminate m1)
[[2 1] [0N 5/2]]
user=> (determinant m1)
5
user=> (/ (determinant m1) (get (matrix-row m1 0) 0))
5/2
```

`m1` represents the system `2x + y = 5` and `x + 3y = 10`. The pivot is
`2` (row `0`'s own first entry); `elimination-factor` comes out `1/2`,
an exact ratio, not a rounded decimal. `eliminate` produces `[[2 1] [0N
5/2]]` — row `1`'s own first entry really is `0`, exactly as derived
above, though it prints as `0N` rather than a plain `0`: dividing two
ratios that happen to reduce to a whole number produces Clojure's own
arbitrary-precision `BigInt` type rather than an ordinary integer, the
same exact-arithmetic quirk Lesson 239's own basis-coordinate recovery
already showed honestly (`2N`/`1N` there, `0N` here) — numerically
identical to `0`, just represented by a different concrete type, and
worth noticing rather than smoothing over. The last two lines confirm a
real, general fact, not a coincidence of this one example: elimination's
new bottom-right entry, `5/2`, is exactly `determinant(m1)` (`5`) divided
by the pivot (`2`) — because algebraically, `d - (c/a)*b = (ad - cb)/a =
determinant(m)/a`, always, whenever the pivot `a` isn't `0`.

### Connection

Row `0` of `m` is untouched and row `1` now has a `0` where `x`'s own
coefficient used to be — but `b`, the system's own right-hand side, has
not been touched at all yet, and the next unit exists specifically
because that omission would break everything.

---

## Concept Unit: Keeping the Equation Balanced — Reducing the Right-Hand Side Too

### The Problem

`eliminate` changed row `1` of `m` — but row `1` together with `b`'s own
second component *is* the second equation: `c*x + d*y = f` became, after
subtracting `elimination-factor` copies of row `0` from the *left* side
only, an inequality with itself unless the exact same subtraction happens
to `f`, `b`'s own second component, too. Skipping this step doesn't
produce an error — it produces a `2x + y = 5`, `0*x + (5/2)*y = 10`-style
system that looks triangular and solvable, but no longer describes the
same two lines the original system did, so whatever `[x, y]` comes out
the other end will not actually be the answer.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because Gaussian elimination is a mathematical technique this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Calls `elimination-factor`
  from this same lesson's previous unit — the row operation applied to
  `b` has to use the *identical* factor already used on `m`, or the
  system stops describing the same two lines.

### The New Code

```clojure
(defn eliminate-b [m b]
  (make-vector
    (vector-dx b)
    (- (vector-dy b) (* (elimination-factor m) (vector-dx b)))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn eliminate-b [m b] ...)` — `make-vector`, reappearing from Lesson
232, builds the new right-hand side from two components. `(vector-dx
b)`, reappearing, keeps `b`'s own first component — `e` in `[e, f]` —
completely unchanged, matching row `0` of `m` staying unchanged in the
previous unit; the *first* equation is never touched by elimination, only
the second. The second component: `-`, reappearing, subtracts from
`(vector-dy b)` (`f`) the product of `elimination-factor` and `(vector-dx
b)` (`e`) — `*`, reappearing, computes that product. This is the exact
same subtraction `eliminate` already performed on row `1` of `m`,
performed here on `b` instead, using the identical `elimination-factor`
computed from `m` — not a new, separately-derived number.

### CS Lens

This is the row operation's own **invariant preservation**, made
concrete: for `eliminate` and `eliminate-b` together to actually keep
describing the same linear system, both have to apply the *same*
transformation to both "halves" of an equation at once — a general
principle any equation-preserving manipulation depends on, whether it's
row-reducing a linear system, balancing a chemical equation, or
rearranging an algebraic expression by applying an operation to both
sides. Also recognized in: database migrations that must update a value
and every foreign key referencing it together or corrupt the data,
distributed systems keeping a value and its replica in sync under the
identical operation, and version-control merges that must apply the same
patch to every affected file, not just one.

### SE Lens

The alternative — computing `elimination-factor` freshly inside
`eliminate-b` instead of trusting it matches `eliminate`'s own — was
rejected: recomputing it from `m` a second time would, for this exact
function, produce the identical number either way, since `m` hasn't
changed between the two calls. But this lesson's own closing "What
Breaks" section shows the *real* failure mode isn't a wrong factor at
all — it's forgetting to call `eliminate-b` on `b` in the first place,
reusing the *original*, unreduced `b` alongside the *already-eliminated*
`m`. Two functions that must always be called together, with matching
inputs, and nothing in Clojure's own type system stops a caller from
calling one without the other — the actual engineering cost of the
two-separate-values design chosen in Unit 1, paid for concretely.

### Run It — Real Output

```
user=> (eliminate-b m1 b1)
[5 15/2]
```

`b1`'s own first component, `5`, is untouched, matching row `0` of `m1`
staying untouched. The second component comes out `15/2` — `10 -
(1/2)*5 = 10 - 5/2 = 15/2` — the exact same kind of division-produced
ratio `eliminate` itself already produced on the matrix side, kept
consistent across both halves of the system.

### Connection

The system is now genuinely triangular on both sides: `m`'s own second
row has a `0` where `x`'s coefficient was, and `b`'s own second
component has been adjusted to match — meaning the second equation now
involves only `y`, solvable directly, which is exactly what
back-substitution does next.

---

## Concept Unit: Back-Substitution — Solving the Triangular System

### The Problem

After elimination, the system reads `2x + y = 5` and `0*x + (5/2)*y =
15/2` — the second equation has only one real unknown left, `y`, so it's
already solvable on its own. Once `y` is known, it can be substituted
directly into the *first*, still-two-variable equation to solve for `x`
— working backward through the variables, from the last one eliminated
to the first.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because Gaussian elimination is a mathematical technique this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. `back-substitute-x`
  needs the *original* `m` and `b` (row `0` was never touched by
  elimination, so the original first equation is still the correct one
  to substitute `y` into), not the eliminated versions.

### The New Code

```clojure
(defn back-substitute-y [triangular-m eliminated-b]
  (/ (vector-dy eliminated-b) (get (matrix-row triangular-m 1) 1)))

(defn back-substitute-x [m b y]
  (/ (- (vector-dx b) (* (get (matrix-row m 0) 1) y)) (get (matrix-row m 0) 0)))

(defn solve-with-y [m b y]
  (make-vector (back-substitute-x m b y) y))

(defn solve-system [m b]
  (solve-with-y m b (back-substitute-y (eliminate m) (eliminate-b m b))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn back-substitute-y [triangular-m eliminated-b] ...)` — `/`,
reappearing, divides `eliminated-b`'s own second component (`vector-dy`,
reappearing) by the triangular matrix's own bottom-right entry (`get`
and `matrix-row`, reappearing). The triangular second equation reads
`0*x + d'*y = f'`, which simplifies to `d'*y = f'` since the `0*x` term
contributes nothing — so `y = f'/d'`, exactly what this division
computes.

`(defn back-substitute-x [m b y] ...)` — takes the *original*, un-
eliminated `m` and `b`, plus the just-solved `y`. `*`, reappearing,
multiplies row `0`'s own second entry (`b`, the coefficient on `y` in the
first equation) by `y`; `-`, reappearing, subtracts that product from
`b`'s own first component (`vector-dx`, reappearing) — the original
first equation, `a*x + b*y = e`, rearranged to `a*x = e - b*y`; `/`,
reappearing, divides by row `0`'s own first entry (`a`, the pivot again)
to isolate `x`.

`(defn solve-with-y [m b y] ...)` — `make-vector`, reappearing, bundles
`back-substitute-x`'s own result together with `y` itself into one
`[x, y]` answer vector.

`(defn solve-system [m b] ...)` — calls `eliminate` and `eliminate-b`,
both reappearing from this lesson's own earlier units, to build the
triangular system; `back-substitute-y`, called on that triangular
system, produces `y`; `solve-with-y`, called with the *original* `m` and
`b` plus that `y`, produces the final answer — the entire technique, four
already-verified functions composed into one call.

Trace `m1`/`b1`: `eliminate m1` is `[[2 1] [0N 5/2]]`; `eliminate-b m1
b1` is `[5 15/2]`. `back-substitute-y` computes `(15/2) / (5/2) = 3` —
printed as `3N`, the identical ratio-division `BigInt` quirk from Unit
1, still numerically exact. `back-substitute-x m1 b1 3` (`y = 3`,
whichever concrete number type it arrives as — plain `3` or the `3N`
`back-substitute-y` actually hands it inside `solve-system`, `=` in
Clojure treats them identically) computes `(5 - 1*3) / 2 = (5 - 3) / 2 =
2 / 2 = 1`. `solve-with-y` bundles these into `[1N, 3N]` when called the
way `solve-system` actually calls it, chaining `back-substitute-y`'s own
real `3N` straight through.

### CS Lens

Back-substitution is a real instance of **exploiting a problem's own
structure to avoid redundant work**: once elimination has guaranteed the
second equation has exactly one unknown, solving it is a single
division, not a search; and once `y` is known, the first equation is no
longer "two unknowns" at all — it's one unknown with a known constant
subtracted out first. Neither step re-solves anything the previous step
already established. Also recognized in: topological-sort-ordered
dependency resolution (each step only needs results already computed),
dynamic programming's own bottom-up table-filling, and any recursive
descent parser that consumes tokens left-to-right, never re-parsing what
a prior call already consumed.

### SE Lens

`back-substitute-x` deliberately takes the *original* `m` and `b`, not
the eliminated versions — a choice worth naming, since it would be easy
to assume "the triangular system" means every later step should use the
triangular values throughout. The alternative (rearranging the
*eliminated* first row rather than the original) would work identically
here only because row `0` was never touched by `eliminate` in the first
place — an accident of this lesson only eliminating one variable from
one row, not a general guarantee. A larger system extending this
technique to a genuine third or fourth equation would need to track,
explicitly, which row's own original values are still safe to
substitute into at each backward step — the honest edge this lesson's own
two-equation scope doesn't have to confront.

### Run It — Real Output

```
user=> (def triangular (eliminate m1))
#'user/triangular
user=> (def reduced-b (eliminate-b m1 b1))
#'user/reduced-b
user=> (back-substitute-y triangular reduced-b)
3N
user=> (back-substitute-x m1 b1 3)
1
user=> (solve-system m1 b1)
[1N 3N]
user=> (matrix-vector-multiply m1 (solve-system m1 b1))
[5N 10N]
```

The last line is the real proof: feeding `solve-system`'s own answer
back into `matrix-vector-multiply` reproduces `b1`, `[5, 10]` (as `[5N
10N]`, the same exact-value-different-type quirk as everywhere else in
this trace), exactly. A second, independent system confirms this wasn't
a one-example fluke:

```
user=> (def m2 (make-matrix (make-vector 1 2) (make-vector 3 -1)))
#'user/m2
user=> (def b2 (make-vector 8 3))
#'user/b2
user=> (elimination-factor m2)
3
user=> (eliminate m2)
[[1 2] [0 -7]]
user=> (eliminate-b m2 b2)
[8 -21]
user=> (solve-system m2 b2)
[2 3]
user=> (matrix-vector-multiply m2 (solve-system m2 b2))
[8 3]
```

`m2`'s own pivot (`1`) divides evenly into `c` (`3`), so
`elimination-factor` comes out a plain `3`, not a ratio — and every
number downstream of a plain integer division stays a plain integer too,
with no `N` suffix anywhere in this second trace. The `BigInt` quirk from
`m1`'s own trace was never about correctness; it only ever depended on
whether the pivot happened to divide evenly, a detail of which concrete
Clojure number type represents an answer, not of whether the answer is
right. `solve-system m2 b2` gives `[2, 3]`, and `matrix-vector-multiply
m2 [2, 3]` reproduces `b2`, `[8, 3]`, exactly — the second, independent
confirmation.

### Connection

Two genuinely different systems, both solved correctly and both
verified by feeding the answer back through `matrix-vector-multiply` —
but every worked example so far had a nonzero pivot and a nonzero
bottom-right entry after elimination. The next unit asks what happens
when that stops being true.

---

## Concept Unit: When Elimination Reveals No Unique Solution

### The Problem

`back-substitute-y` divides by `triangular-m`'s own bottom-right entry —
which has been exactly `determinant(m)/pivot` in every example so far,
per Unit 1's own derivation. `determinant`, from Lesson 238, is exactly
`0` for a **singular** matrix — Lesson 239's own term for a matrix whose
transformation collapses distinct inputs onto the same output, and whose
`matrix-inverse` is undefined for exactly that reason. If elimination's
own bottom-right entry is `determinant(m)/pivot`, a singular `m` should
make that entry `0` too — and dividing by `0` in `back-substitute-y`
would be a real, uncaught crash, not silently wrong output.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because Gaussian elimination is a mathematical technique this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses `determinant`,
  `eliminate`, and `back-substitute-y` unchanged — this unit introduces
  no new function, only a new claim, checked against a genuinely singular
  matrix.

### The New Code

No new function this unit. `m3 = [[1, 2], [2, 4]]` — row `1` is exactly
row `0` scaled by `2`, the same "one row is a scalar multiple of the
other" shape Lesson 238's own reflection example and Lesson 239's own
collapsing-matrix example both used to produce a genuinely singular
matrix. `(determinant m3)` computes `1*4 - 2*2 = 4 - 4 = 0`. Feeding `m3`
into `eliminate`: `elimination-factor` is `2/1 = 2`; row `1`'s new value
is `(vector-add [2, 4] (vector-scale [1, 2] -2))`, which is `[2, 4] + [-2,
-4] = [0, 0]` — not just the *first* entry reaching `0`, the way every
prior example only zeroed one position, but the *entire* second row
collapsing to `[0, 0]` at once, because the second equation was never
independent information to begin with — it was the first equation in
disguise, scaled by `2`.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — this unit's own verification is the real check itself,
not a throwaway later discarded.

### Mechanical Walkthrough

`(determinant m3)` — `determinant`, reappearing unchanged from Lesson
238, computes `0` from `m3`'s own four entries, exactly as derived above.
`(eliminate m3)` — every function inside it (`elimination-factor`,
`vector-add`, `vector-scale`, reappearing from earlier this lesson)
behaves exactly as already explained; what's new here is the *result*:
`[[1, 2], [0, 0]]`, where `back-substitute-y` would need to compute `(/
(vector-dy eliminated-b) 0)` — division by `0`, which Clojure raises as a
real `ArithmeticException`, not a silently wrong number. This is the
concrete, computational meaning of "no unique solution": a genuinely
singular system either has *no* solution at all (if the eliminated `b`'s
own second component also isn't `0`, meaning the two original equations
contradict each other) or *infinitely many* (if it is `0` too, meaning
the second equation added no real information) — and elimination itself,
through an honest crash rather than a wrong answer, is what surfaces that
fact.

### CS Lens

This is the identical **degenerate-input honesty** Lesson 239's own
closing unit already established for `matrix-inverse` — a genuinely
undefined case failing loudly (a crash on division by `0`) rather than
returning a plausible-looking but meaningless number — reached here by a
completely different computational path: not a formula's own denominator
going to `0`, but an entire row of the matrix collapsing to zero during
elimination. Two independently-derived pieces of machinery, `matrix-
inverse`'s closed-form denominator and `eliminate`'s row-by-row
reduction, agreeing exactly on which matrices are singular is real
evidence neither one is a coincidence. Also recognized in: a compiler
detecting an unsatisfiable type constraint rather than silently picking
an arbitrary type, a solver reporting "infeasible" for a linear program
with no valid region rather than returning a bogus optimum, and database
constraint violations failing the whole transaction rather than writing
inconsistent data.

### SE Lens

The alternative — checking `(= (determinant m) 0)` before ever calling
`eliminate`, and returning some explicit "no unique solution" value
instead of letting the division crash — is a real, legitimate design this
lesson deliberately did not build, the same honest-scope choice Lesson
239 already made for `matrix-inverse` itself: a defined failure mode (an
explicit check and a clear return value) is real, additional code that
has to be written and verified, and this lesson's own closing exercises
leave it as exactly that — real, unbuilt work, not a hidden gap being
passed off as finished.

### Run It — Real Output

```
user=> (def m3 (make-matrix (make-vector 1 2) (make-vector 2 4)))
#'user/m3
user=> (determinant m3)
0
user=> (eliminate m3)
[[1 2] [0 0]]
```

Row `1` really did collapse entirely to `[0, 0]`, not just its first
entry — confirming, for a real singular matrix and not just the abstract
formula from Unit 1, that elimination and `determinant` agree on exactly
which matrices have no unique solution.

### Connection

Every function this lesson built — `eliminate`, `eliminate-b`,
`back-substitute-y`, `back-substitute-x`, `solve-system` — has now been
verified on a system with a clean answer, a second independent system,
and a genuinely singular system where the whole technique honestly
refuses to produce one. The closing section traces one full system
through every step, start to finish.

---

## Connect the Pieces

One concrete system, `m1 = [[2, 1], [1, 3]]`, `b1 = [5, 10]` (the
equations `2x + y = 5` and `x + 3y = 10`), moving through every unit
built in this lesson:

1. `elimination-factor(m1)` → `1/2` (Unit 1) — how much of row `0` to
   subtract from row `1` to zero out `x`'s own coefficient there.
2. `eliminate(m1)` → `[[2, 1], [0, 5/2]]` (Unit 1) — row `1` now reads
   `0*x + (5/2)*y`, and `5/2` is exactly `determinant(m1)` (`5`) divided
   by the pivot (`2`), a real cross-check between two independently
   built pieces of machinery.
3. `eliminate-b(m1, b1)` → `[5, 15/2]` (Unit 2) — the same `1/2` factor
   from step 1, applied to `b1` instead of `m1`, keeping the equation
   genuinely balanced.
4. `back-substitute-y` on the results of steps 2 and 3 → `3` (Unit 3) —
   `(5/2)*y = 15/2` solved directly, the entire payoff of reaching a
   triangular system.
5. `back-substitute-x(m1, b1, 3)` → `1` (Unit 3) — the *original* first
   equation, `2x + y = 5`, with `y = 3` substituted in: `2x = 5 - 3 = 2`,
   `x = 1`.
6. `solve-system(m1, b1)` → `[1, 3]` (Unit 3) — steps 1 through 5,
   composed into one call.
7. `matrix-vector-multiply(m1, [1, 3])` → `[5, 10]` — feeding the answer
   back into the *original* system reproduces `b1` exactly, the real
   proof the whole technique actually solved the system it started with,
   not just produced some triangular-system's own different answer.

Seven real, verified steps, each one built directly on the step before
it, ending exactly where step 7 needed to: back at the original system's
own right-hand side.

## What Breaks Without This

Unit 2's own Problem section named the exact risk directly: reduce `m`
but forget to reduce `b` the same way.

```clojure
(defn solve-system-broken [m b]
  (solve-with-y m b (back-substitute-y (eliminate m) b)))
```

```
user=> (solve-system-broken m1 b1)
[1/2 4N]
user=> (matrix-vector-multiply m1 (solve-system-broken m1 b1))
[5N 25/2]
```

`solve-system-broken` calls `eliminate` on `m`, correctly — but passes
`back-substitute-y` the *original*, un-eliminated `b1` instead of
`eliminate-b`'s own result, exactly the bug Unit 2's SE Lens predicted.
The output isn't an error — it's a confident, wrong answer: `[1/2, 4]`
instead of the real solution, `[1, 3]`. Feeding it back into
`matrix-vector-multiply` exposes the damage directly: `[5N, 25/2]`
instead of `b1`'s own `[5, 10]` — the first component happens to land on
`5` by coincidence (the first equation was never touched by elimination
at all), but the second, `25/2` (`12.5`), is nowhere near `10`. This is
the concrete cost of Unit 1's own design choice, keeping `m` and `b` as
two separate values rather than one bundled row: nothing in Clojure stops
a caller from reducing one and forgetting the other, and the failure
this produces is silent — a real number comes back, not a crash —
exactly the kind of bug that survives unless it's checked against the
original system the way step 7 above does, every time. Restoring the
correct call:

```
user=> (solve-system m1 b1)
[1N 3N]
```

matches the real solution again.

## Exercises

1. Solve `m = [[3, 2], [1, -1]]`, `b = [7, 1]` by hand using
   `elimination-factor`, `eliminate`, `eliminate-b`, `back-substitute-y`,
   and `back-substitute-x`, one function call at a time — then check the
   final answer with `solve-system` directly, and confirm it with
   `matrix-vector-multiply`.
2. `eliminate` and `eliminate-b` both assume row `0`'s own first entry
   (the pivot) isn't `0`, or `elimination-factor` itself divides by `0`
   before elimination even gets to run. Find a real `2x2` matrix with a
   nonzero determinant but a `0` in the top-left position, and explain,
   using this lesson's own algebra, why swapping the matrix's two rows
   first (a row operation this lesson never needed, since every example
   happened to have a nonzero pivot already) would fix it without
   changing the system's own solution.
3. This lesson deliberately left `back-substitute-y`'s division-by-`0`
   crash unguarded, for a genuinely singular matrix, as a real,
   documented scope choice — the same one Lesson 239 made for
   `matrix-inverse`. Write a real `solve-system-checked` that calls
   `determinant` first and returns some explicit signal (not a crash)
   when the system is singular, and verify it against both `m1`
   (a real answer) and `m3` (the singular case).

## Definition of Done

- [ ] `elimination-factor` and `eliminate` run against `m1`, and
      `eliminate`'s own bottom-right entry matches `(/ (determinant m1)
      (get (matrix-row m1 0) 0))` exactly.
- [ ] `eliminate-b` runs against `m1` and `b1`, producing `[5, 15/2]`.
- [ ] `solve-system` returns `[1, 3]` (as `[1N, 3N]`) for `m1`/`b1`, and
      `matrix-vector-multiply` on that answer reproduces `b1` exactly.
- [ ] `solve-system` was also run against a second, independent system
      (`m2`/`b2`) and verified the same way.
- [ ] `eliminate` run against a genuinely singular matrix (`m3`) produces
      a fully zeroed second row, matching `(determinant m3)` being `0`.
- [ ] The "forgot to eliminate `b`" bug was reproduced for real
      (`solve-system-broken` returning a wrong answer that fails the
      `matrix-vector-multiply` round-trip check), then fixed back to
      `solve-system`.
- [ ] `git commit` with a message explaining *why* `eliminate` and
      `eliminate-b` both exist as separate calls rather than one combined
      function — for example: `"Keep eliminate and eliminate-b separate,
      reusing Lesson 232-234's own vector/matrix types instead of a new
      augmented-row type — document that both must be called together,
      since forgetting one silently breaks the system without crashing."`
