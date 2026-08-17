# Lesson 242: Numerical Stability — Why Equivalent Math Isn't Equivalent Code

**What you will build**: Real, machine-measured proof that two
computations a mathematician would call identical — `(a + b) + c` versus
`a + (b + c)`, or Lesson 241's own elimination technique applied to a
mathematically unchanged linear system — can produce genuinely different
answers once they run on real floating-point hardware instead of on
paper. This lesson measures that gap directly (`0.1 + 0.2` really isn't
`0.3` on this machine, right now), then reuses Lesson 241's own
`solve-system` unchanged on a real near-singular system to show the gap
isn't just a toy example: solving it the naive way carries about `1267`
times more error than solving it after one small, real fix — **partial
pivoting** — this lesson derives and verifies concretely.

**What you need to know first**: Lesson 241's `eliminate`, `eliminate-b`,
`back-substitute-y`, `back-substitute-x`, and `solve-system` — every one
reused unchanged, run here on real floating-point numbers instead of the
exact integers and ratios every earlier Section XI lesson used. Lesson
234's `make-matrix`/`matrix-row` and Lesson 232's
`make-vector`/`vector-dx`/`vector-dy`. Lesson 231's own first use of Java
interop, `Math/sqrt` — the precedent that a "real" computation in this
curriculum can reach past Clojure's own functions into genuine JVM
machinery, which is exactly where a `double`'s own rounding behavior
actually comes from. Lesson 186's own IEEE-754 normalized floating-point
representation — this lesson doesn't re-derive the bit layout Lesson 186
already built, but reuses its core fact directly: a `double` stores a
sign, an exponent, and a fixed-width fraction in binary, and most decimal
fractions (`0.1`, `0.2`, `0.3` among them) have no exact finite binary
representation at all, only the closest one that fits.

**Terms used in this lesson**:

- **floating-point number** (Clojure's `double`) — reused from Lesson
  186's own IEEE-754 representation: a real, finite-precision number
  stored in binary as a sign, an exponent, and a fraction. Because most
  decimal fractions can't be written exactly in binary, a `double`
  literal like `0.1` is already, silently, the *closest representable*
  value to `0.1` — not `0.1` itself — before any arithmetic even
  happens.
- **rounding error** — the gap between a real computation's true
  mathematical answer and what a finite-precision floating-point value
  can actually store; every single floating-point operation can
  introduce a little more of it.
- **catastrophic cancellation** — a specific, especially damaging way
  rounding error shows up: subtracting two floating-point numbers that
  are nearly equal can wipe out most or all of the meaningful digits,
  leaving a result made almost entirely of accumulated rounding error
  rather than a real answer.
- **numerical stability** — whether an algorithm's own rounding error
  stays small as it runs, or grows large enough to swamp the true
  answer; two algorithms that are exactly equivalent on paper, computing
  the identical mathematical result, can have very different numerical
  stability once run on real floating-point hardware.
- **absolute error** / **relative error** — absolute error is the raw
  difference between an approximate value and the true one; relative
  error divides that difference by the true value's own magnitude,
  making it the more meaningful measure whenever the numbers being
  compared aren't already close to `1`.
- **partial pivoting** — reordering a linear system's own equations,
  before elimination runs, so the equation with the *largest-magnitude*
  leading coefficient becomes the pivot — a real, concrete fix this
  lesson derives and measures, not just names.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`make-vector`** / **`vector-dx`** / **`vector-dy`** / **`make-matrix`**
  / **`matrix-row`**
  - *What they are:* reused unchanged from Lessons 232 and 234.
  - *Their use:* every system this lesson builds — exact-ratio or
    floating-point alike — is a `2x2` matrix and a two-component vector,
    built and read through these five functions exactly as before.
- **`eliminate`** / **`eliminate-b`** / **`back-substitute-y`** /
  **`back-substitute-x`** / **`solve-system`**
  - *What they are:* reused completely unchanged from Lesson 241 — no
    new arithmetic, no new logic. `eliminate` and `eliminate-b` row-
    reduce a system's own matrix and right-hand side together;
    `back-substitute-y` and `back-substitute-x` solve the resulting
    triangular system one variable at a time; `solve-system` composes
    all four.
  - *Their use:* this lesson's entire point is that running these exact
    same five functions on floating-point inputs instead of exact
    integers or ratios can produce a measurably different, less accurate
    answer — proof that the *numbers*, not the *logic*, are where
    instability comes from.
- **`Math/sqrt`**
  - *What it is:* reused unchanged from Lesson 231 — a `static` method
    on Java's own `java.lang.Math` class, callable directly from Clojure
    without any special import.
  - *Implementation:* `Math/sqrt` takes one `double` and returns its
    real (possibly irrational) square root, also as a `double`.
  - *Its use:* named here only as this curriculum's own established
    precedent that a `double` is a genuine JVM machine type, not a
    Clojure-specific invention — everything this lesson demonstrates
    about rounding is a real, JVM-level fact, not something particular
    to Clojure.
- **`Math/abs`**
  - *What it is:* another `static` method on `java.lang.Math`, appearing
    in this curriculum for the first time.
  - *Implementation:* `Math/abs` takes one number and returns its
    absolute value — the same number if it's already `0` or positive,
    its negation if it's negative — as the same numeric type it was
    given.
  - *Its use:* both `relative-error` (this lesson's own Unit 1) and
    `needs-pivot?` (this lesson's own Unit 4) need a magnitude
    comparison that doesn't care about sign — how *large* an error or a
    coefficient is, regardless of which direction it points.
- **`get`** / **`-`** / **`*`** / **`+`** / **`/`** / **`=`** / **`>`**
  - *What they are:* Clojure's positional lookup, subtraction,
    multiplication, addition, division, equality, and greater-than
    functions, reused throughout this curriculum since its earliest
    arithmetic.
  - *Their use:* the same arithmetic every prior Section XI lesson used,
    now run on `double` values instead of exact integers and ratios;
    `>`, appearing for the first time this lesson, compares two
    magnitudes directly to decide whether pivoting is needed.

---

## Concept Unit: Floating-Point Addition Isn't Associative

### The Problem

Every number in this curriculum's own Section XI, up through Lesson 241,
has been an exact integer or an exact Clojure ratio — `1/10000` prints
as `1/10000`, not a rounded decimal, and every arithmetic result has been
mathematically exact, down to the last digit, every single time. Real
software doesn't always have that luxury: `Math/sqrt`, already used since
Lesson 231, returns a `double`, and most real numbers — including most
ordinary decimal fractions — have no exact finite binary representation
at all. Does that theoretical fact ever actually change a real, running
program's output? Or is it a concern that stays safely abstract?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because floating-point rounding behavior is a real, physical
  fact about IEEE-754 hardware this curriculum is demonstrating directly,
  not porting from any external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn relative-error [approx exact]
  (/ (Math/abs (- approx exact)) (Math/abs exact)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn relative-error [approx exact] ...)` — `-`, reappearing, computes
the raw difference between an approximate value and the true one;
`Math/abs`, a `static` method on Java's own `java.lang.Math` class
appearing for the first time this lesson, strips the sign so an
approximation that's too low counts the same as one too high; `/`,
reappearing, divides that magnitude by `(Math/abs exact)` — the true
value's own magnitude, also sign-stripped. This is called **relative
error**: it answers "how big is this error *compared to the size of the
number itself*," which matters because an absolute error of `0.001` is
enormous for a true value of `0.0001` and utterly negligible for a true
value of `1000000` — the raw difference alone can't distinguish those two
very different situations.

The real content of this unit isn't `relative-error` itself, though — it's
what real floating-point addition actually does, checked directly:
`(+ 0.1 0.2)`. Mathematically, `0.1 + 0.2` is exactly `0.3`. On real
IEEE-754 hardware, `0.1` and `0.2` were never exactly `0.1` and `0.2` to
begin with — each is already the closest `double` those two decimal
fractions have, per Lesson 186's own binary-fraction fact — so their sum
inherits both roundings, and comes out `0.30000000000000004`, not `0.3`.
`=`, reappearing, confirms `(= (+ 0.1 0.2) 0.3)` is `false` — not
approximately true, genuinely `false`, two different `double` values.

Trace **associativity** — the ordinary algebra rule that `(a + b) + c`
always equals `a + (b + c)`, true for exact real numbers no matter how
the additions are grouped: `(+ (+ 0.1 0.2) 0.3)` computes
`0.30000000000000004 + 0.3`, which comes out `0.6000000000000001`. `(+
0.1 (+ 0.2 0.3))` computes `0.2 + 0.3` first — which happens to round
cleanly to exactly `0.5` — then `0.1 + 0.5`, which comes out `0.6`
exactly. Two expressions that are mathematically, provably identical
produce two different `double` values, `0.6000000000000001` and `0.6`,
depending only on which addition happened first.

### CS Lens

This is the concrete, machine-real face of **floating-point arithmetic
not being associative** — a fact every numerical-computing system has to
account for, not a Clojure quirk: the exact same phenomenon is why
compilers are generally *forbidden* from silently reordering
floating-point additions for optimization (a legal reordering for exact
integers can produce a measurably different `double` result), why
parallel reduction algorithms (summing a huge array across many threads,
combining partial sums in whatever order threads happen to finish) can
give slightly different totals on different runs, and why financial and
scientific software so often needs a documented, fixed order of
operations rather than "any mathematically equivalent order will do."

### SE Lens

The alternative this whole curriculum has used through Lesson 241 —
exact integers and exact Clojure ratios — sidesteps this entire problem:
`1/10000` really is `1/10000`, forever, no matter how many operations
touch it, and associativity genuinely always holds. The real tradeoff
against that: exact ratios grow their own numerator and denominator
without bound as more operations pile on top of each other (a ratio
computed from a hundred chained divisions can have numerators and
denominators hundreds of digits long), and most real-world numeric input
— a sensor reading, a user-typed decimal, almost anything from outside a
program — arrives as a `double` in the first place, not a ratio. Floating
point trades away exactness for a fixed, small, constant-size
representation and hardware speed; this lesson exists specifically to
make sure that trade's real cost is measured, not assumed away.

### Run It — Real Output

```
user=> (+ 0.1 0.2)
0.30000000000000004
user=> (= (+ 0.1 0.2) 0.3)
false
user=> (+ (+ 0.1 0.2) 0.3)
0.6000000000000001
user=> (+ 0.1 (+ 0.2 0.3))
0.6
user=> (= (+ (+ 0.1 0.2) 0.3) (+ 0.1 (+ 0.2 0.3)))
false
```

Every line is a real, machine-measured fact about this specific `bb`
run on this specific hardware, not a hypothetical.

### Connection

Addition alone already breaks associativity — the next unit shows
*subtraction* can do something worse: not just a tiny discrepancy in the
last digit, but the complete, total loss of a real value.

---

## Concept Unit: Catastrophic Cancellation — When Subtraction Destroys Information

### The Problem

A `double` has a fixed, finite number of significant digits — roughly
`15` to `17` decimal digits' worth of precision, no matter how large or
small the number itself is. That's normally more than enough precision
to be invisible in ordinary use. But what happens when a number that
large meets a number that's comparatively tiny — does adding a small
number to a huge one always actually change it?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because floating-point rounding behavior is a real, physical
  fact about IEEE-754 hardware this curriculum is demonstrating directly,
  not porting from any external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

No new function this unit — the content is a direct, real demonstration,
the same shape Lesson 240's own Unit 4 used for a proof-style unit with
no brand-new named function. `(+ 1e16 1.0)` adds `1.0` to `10,000,000,000,000,000.0`
(`1e16`, scientific notation for `10^16`) — a number already at the edge
of a `double`'s own roughly-`15`-to-`17`-significant-digit budget.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(+ 1e16 1.0)` — `+`, reappearing, is asked to add `1.0` to `1e16`. The
real result: `1.0E16` — meaning the `1.0` contributed *nothing at all*
to the sum. `(= (+ 1e16 1.0) 1e16)` — `=`, reappearing, confirms it:
`true`. `1e16` needs `17` significant decimal digits to represent
exactly (`10000000000000000`), already past a `double`'s own precision
budget — so adding `1` to it asks for an `18`th significant digit that
simply isn't there to store; the value gets rounded right back down to
`1e16` itself, as if the addition never happened. `(- (+ 1e16 1.0)
1e16)` — the natural "did that `1.0` really get lost" check — computes
`0.0`, not `1.0`. Contrast: `(- (+ 1.0 1.0) 1.0)`, the identical shape at
ordinary magnitude, computes `1.0` correctly — `2.0` has plenty of
precision budget left over, so nothing gets lost.

This specific shape — computing `(A + small) - A` and getting `0`
instead of `small` — is called **catastrophic cancellation**: the
subtraction doesn't introduce new error on its own, but it ruthlessly
*exposes* error that addition already silently created, by canceling out
the large, precisely-known part (`A`) and leaving only whatever
imprecision was hiding underneath.

### CS Lens

Catastrophic cancellation is a **hard concept** worth naming precisely,
because it's easy to mistake for "the answer is just slightly off" when
it's actually "the answer has *no real information left in it at all*."
Also recognized in: the classic textbook quadratic-formula instability
(`-b + sqrt(b² - 4ac)` losing almost all its precision when `b² is much
larger than `4ac`, subtracting two nearly-equal large numbers), variance
computed as `E[X²] - (E[X])²` in statistics software (numerically
unstable for data with a large mean and small spread, for exactly this
reason), and physics simulations that track a system's total energy as a
difference of two much larger quantities, where rounding error can
eventually swamp the real physical signal being measured.

### SE Lens

The alternative — always using exact ratios, per this whole curriculum's
own Section XI convention through Lesson 241 — would make this entire
category of bug structurally impossible, at the real cost named in the
previous unit's own SE Lens (unbounded-size representations, and the
mismatch with how real-world numeric input actually arrives). Software
that has to use floating point avoids catastrophic cancellation not by
hoping it doesn't happen, but by restructuring the *algorithm* to avoid
ever subtracting two nearly-equal large quantities in the first place —
the exact engineering move the next two units make concrete for
`solve-system`.

### Run It — Real Output

```
user=> (+ 1e16 1.0)
1.0E16
user=> (= (+ 1e16 1.0) 1e16)
true
user=> (- (+ 1e16 1.0) 1e16)
0.0
user=> (- (+ 1.0 1.0) 1.0)
1.0
```

The last line is the real control case: identical shape, ordinary
magnitude, no precision loss — proof this is a genuine magnitude effect,
not a general flaw in `-` or `+`.

### Connection

Both units so far used arithmetic in isolation. The next unit puts real
floating-point numbers through Lesson 241's own `solve-system`, on a
system deliberately built to invite exactly this kind of trouble.

---

## Concept Unit: The Same Linear System, Two Representations

### The Problem

Lesson 241's `solve-system` was verified against exact integers and
ratios, where every intermediate value was mathematically exact and
`elimination-factor` was always some clean, well-behaved number. Real
systems aren't always so well-behaved: what happens when a system's own
**pivot** — the coefficient elimination divides by — is very small
compared to the numbers around it? Does `solve-system`, unchanged, still
produce a trustworthy answer once that system is expressed in real
`double`s instead of exact ratios?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because floating-point rounding behavior is a real, physical
  fact about IEEE-754 hardware this curriculum is demonstrating directly,
  not porting from any external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses `eliminate`,
  `eliminate-b`, `back-substitute-y`, `back-substitute-x`,
  `solve-system` (Lesson 241) and `relative-error` (this lesson's own
  Unit 1) — no new function this unit.

### The New Code

No new function this unit. The system `0.0001x + y = 1`, `x + y = 2` —
built twice, once as exact Clojure ratios (`m-exact = [[1/10000, 1], [1,
1]]`, `b-exact = [1, 2]`) and once as real `double`s (`m-float =
[[0.0001, 1.0], [1.0, 1.0]]`, `b-float = [1.0, 2.0]`) — is run through
`solve-system`, completely unchanged, both ways.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`solve-system m-exact b-exact` — every function inside it
(`elimination-factor`, `eliminate`, `eliminate-b`, `back-substitute-y`,
`back-substitute-x`, all reappearing unchanged from Lesson 241) runs on
exact ratios throughout, so the result, `[10000/9999, 9998/9999]`, is the
real, exact mathematical answer to this system — not an approximation of
one. `solve-system m-float b-float` runs the *identical logic*, the
identical five functions, on `double` inputs instead — and produces
`[1.0001000100012813, 0.9998999899989999]`. Converting the exact answer
to a `double` for comparison (`10000/9999` as a `double` is
`1.000100010001`) exposes a real gap: the float version's own `y`
component, `0.9998999899989999`, matches exactly, but its `x` component,
`1.0001000100012813`, differs starting several digits in — a real,
measured discrepancy, not a rounding artifact of how it's printed.
`relative-error`, from this lesson's own Unit 1, quantifies it exactly:
`(relative-error 1.0001000100012813 1.000100010001)` computes
`2.813023813885707E-13` — tiny in absolute terms, but real, and, per the
next unit, avoidable.

The reason traces directly back to `elimination-factor`: `c/a` here is
`1/0.0001 = 10000` — dividing by a pivot that's small compared to the
numbers around it *amplifies* whatever rounding error `0.0001`'s own
imprecise `double` representation already carries, the same
error-amplifying shape this lesson's own Unit 2 already demonstrated with
addition, now showing up inside elimination's own division.

### CS Lens

This is **numerical stability** made concrete, by direct
comparison rather than definition alone: `solve-system` is
*mathematically* the identical algorithm regardless of which numbers
it's fed, but it is not *numerically* identical in practice — the same
logic, run on inputs representing the identical real-world system, can
carry meaningfully different amounts of rounding error depending on how
those numbers happen to be represented and combined. Also recognized in:
numerical linear-algebra libraries (LAPACK, BLAS) choosing algorithms
specifically for their stability guarantees, not just their asymptotic
speed; machine-learning training code that adds a small constant before
dividing specifically to avoid amplifying rounding error near zero; and
physics engines that reformulate a stable-looking equation into an
equivalent but more stable one before running it at scale.

### SE Lens

The alternative — trusting that "the algorithm is correct" is the same
claim as "the algorithm is safe to run on real floating-point input" —
is exactly the assumption this unit's own real, measured gap disproves.
`solve-system`'s own correctness (Lesson 241's entire point) was never in
question here; what's in question is whether *correct on paper* survives
contact with finite-precision arithmetic, and the honest answer, shown
directly rather than asserted, is: not always, and not without a real
fix. The next unit builds that fix.

### Run It — Real Output

```
user=> (def m-exact (make-matrix (make-vector 1/10000 1) (make-vector 1 1)))
#'user/m-exact
user=> (def b-exact (make-vector 1 2))
#'user/b-exact
user=> (solve-system m-exact b-exact)
[10000/9999 9998/9999]
user=> (def m-float (make-matrix (make-vector 0.0001 1.0) (make-vector 1.0 1.0)))
#'user/m-float
user=> (def b-float (make-vector 1.0 2.0))
#'user/b-float
user=> (solve-system m-float b-float)
[1.0001000100012813 0.9998999899989999]
user=> (relative-error 1.0001000100012813 1.000100010001)
2.813023813885707E-13
```

### Connection

`solve-system` itself needs no fix — the problem is *which* row becomes
the pivot before elimination runs at all, and that's a real, checkable
decision this lesson can make automatically.

---

## Concept Unit: Partial Pivoting — Choosing the Larger Pivot First

### The Problem

`elimination-factor` divides by whichever row happens to be listed
*first* — an arbitrary choice this whole curriculum has made silently
since Lesson 241, never revisited. `m-float`'s own first row has the tiny
`0.0001` pivot; its *second* row has a `1.0` in the same position — a
far better pivot, a thousand times larger, sitting right there unused.
Does simply using the *larger* of the two, by swapping the rows first,
actually reduce the real, measured error from the previous unit?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because floating-point rounding behavior is a real, physical
  fact about IEEE-754 hardware this curriculum is demonstrating directly,
  not porting from any external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. `swap-b` must be called
  alongside `swap-rows` with the identical system, the same "both halves
  must move together" requirement Lesson 241's own `eliminate`/
  `eliminate-b` pairing already established.

### The New Code

```clojure
(defn swap-rows [m]
  (make-matrix (matrix-row m 1) (matrix-row m 0)))

(defn swap-b [b]
  (make-vector (vector-dy b) (vector-dx b)))

(defn needs-pivot? [m]
  (> (Math/abs (get (matrix-row m 1) 0)) (Math/abs (get (matrix-row m 0) 0))))

(defn solve-system-pivoted [m b]
  (if (needs-pivot? m)
    (solve-system (swap-rows m) (swap-b b))
    (solve-system m b)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn swap-rows [m] ...)` — `make-matrix` and `matrix-row`, both
reappearing from Lesson 234, build a new matrix with row `1` listed
first and row `0` listed second — the entire system's own two equations,
reordered, with neither equation itself changed at all.

`(defn swap-b [b] ...)` — `make-vector`, `vector-dx`, `vector-dy`, all
reappearing from Lesson 232, build the matching reordered right-hand
side — the exact same "both halves must move together" requirement
Lesson 241's own `eliminate`/`eliminate-b` pairing already established,
now applied to a row swap instead of a row-elimination.

`(defn needs-pivot? [m] ...)` — `Math/abs`, reappearing from this
lesson's own Unit 1, strips the sign from both candidate pivots: row
`1`'s own leading coefficient, and row `0`'s. `>`, appearing for the
first time this lesson, compares the two magnitudes directly. This is
the actual rule of **partial pivoting**: swap rows only when doing so
would put a genuinely *larger*-magnitude coefficient in the pivot
position — never swap needlessly, and never swap toward a *smaller*
pivot, which would make elimination's own amplification worse, not
better.

`(defn solve-system-pivoted [m b] ...)` — `if`, reused control flow:
when `needs-pivot?` is `true`, calls `solve-system` (reappearing from
Lesson 241, completely unchanged) on the swapped matrix and the swapped
right-hand side together; otherwise calls `solve-system` directly on the
original, untouched system — `solve-system` itself never needed to
change at all; only *which* system gets handed to it does.

### CS Lens

`solve-system-pivoted` is a **strategy selected by a runtime check**,
not a fixed, hardcoded procedure — the exact same shape as Lesson 197's
own branch-prediction strategy or Lesson 223's own choice between a
sorted array and a hash index: the *interface* (call `solve-system` on
some system) stays fixed, while the actual system handed to it is chosen
based on a real, measured property of the input, checked every time
rather than assumed. Also recognized in: query planners choosing a join
strategy based on real table sizes rather than a fixed default, adaptive
sorting algorithms that switch strategy based on how sorted the input
already looks, and load balancers routing a request based on a server's
real, current load rather than a static assignment.

### SE Lens

The alternative — *always* swapping the rows, unconditionally, before
every elimination — would work correctly here (row `1`'s pivot always
happens to be the larger one in this lesson's own example) but would be
a real regression the moment it meets a system where row `0`'s own pivot
is already the larger one: an unconditional swap would then pick the
*worse* pivot on purpose, actively making stability worse for no reason.
`needs-pivot?`'s real cost is one extra comparison per solve — cheap,
and the only way to guarantee the swap actually helps rather than
occasionally hurting.

### Run It — Real Output

```
user=> (needs-pivot? m-float)
true
user=> (swap-rows m-float)
[[1.0 1.0] [1.0E-4 1.0]]
user=> (swap-b b-float)
[2.0 1.0]
user=> (solve-system-pivoted m-float b-float)
[1.0001000100010002 0.9998999899989999]
user=> (relative-error 1.0001000100010002 1.000100010001)
2.2202240046453883E-16
user=> (/ 2.813023813885707E-13 2.2202240046453883E-16)
1267.0
```

Pivoting's own `x`, `1.0001000100010002`, is visibly closer to the exact
answer's own `1.000100010001` than the unpivoted `1.0001000100012813`
was — and `relative-error` makes the gap precise: `2.2202240046453883E-16`,
right at a `double`'s own fundamental precision limit (`2^-52`, the
smallest possible gap between two adjacent representable `double`
values, meaning this answer is now as accurate as floating point can
ever be), versus the unpivoted version's `2.813023813885707E-13` — about
`1267` times worse, for the identical mathematical system, solved by the
identical `solve-system`, differing only in which row got listed first
before elimination began.

```
user=> (needs-pivot? m1)
false
user=> (solve-system-pivoted m1 b1)
[1N 3N]
user=> (solve-system m1 b1)
[1N 3N]
```

Run against Lesson 241's own well-conditioned `m1`/`b1` (`[[2, 1], [1,
3]]`, `[5, 10]`), `needs-pivot?` correctly says `false` — row `0`'s pivot,
`2`, is already larger than row `1`'s, `1` — and `solve-system-pivoted`
falls through to calling `solve-system` directly, producing the exact
same `[1, 3]` (as `[1N, 3N]`) Lesson 241 already verified. Pivoting isn't
a different answer for every system; it's the *same* answer as before,
whenever the original ordering was already the better one.

### Connection

The closing section below traces the full `1267`-times improvement
through every function this lesson built, start to finish.

---

## Connect the Pieces

One concrete near-singular system, `m = [[0.0001, 1.0], [1.0, 1.0]]`,
`b = [1.0, 2.0]`, moving through every unit built in this lesson:

1. The exact answer, computed once and for all with ratios (Unit 3):
   `solve-system(m-exact, b-exact)` → `[10000/9999, 9998/9999]`, `x ≈
   1.000100010001` as a `double`.
2. The naive float attempt (Unit 3): `solve-system(m, b)` → `x =
   1.0001000100012813` — `elimination-factor` divided by the tiny pivot
   `0.0001`, amplifying its own rounding error.
3. `relative-error` (Unit 1) quantifies step 2's own gap:
   `2.813023813885707E-13`.
4. `needs-pivot?(m)` (Unit 4) → `true` — row `1`'s own leading
   coefficient, `1.0`, is larger in magnitude than row `0`'s, `0.0001`.
5. `swap-rows(m)` and `swap-b(b)` (Unit 4) → `[[1.0, 1.0], [0.0001,
   1.0]]` and `[2.0, 1.0]` — the identical system, reordered, describing
   the same two lines.
6. `solve-system-pivoted(m, b)` (Unit 4) → `x = 1.0001000100010002` —
   the *same* `solve-system` from step 2, called on the *reordered*
   system from step 5.
7. `relative-error` on step 6's own result: `2.2202240046453883E-16` —
   roughly `1267` times smaller than step 3's own error, for the
   identical real-world system.

Nothing about `solve-system`'s own logic changed between steps 2 and 6 —
only which row was listed first before it ran. That's this lesson's own
actual payoff: numerical stability often isn't a different algorithm at
all, just a different, deliberately-chosen order for the identical one.

## What Breaks Without This

Unit 4's own SE Lens named the risk directly: swap unconditionally,
without checking `needs-pivot?` first.

```clojure
(defn solve-system-always-swap [m b]
  (solve-system (swap-rows m) (swap-b b)))
```

```
user=> (solve-system-always-swap m1 b1)
[1N 3N]
user=> (solve-system m1 b1)
[1N 3N]
```

On Lesson 241's own `m1`/`b1`, the two answers happen to match — this
particular system solves correctly regardless of which row comes first,
since both pivots (`2` and `1`) are perfectly fine in exact arithmetic,
so an unconditional swap doesn't visibly break anything *here*. The real
damage is invisible at this scale and only shows up as a missed
opportunity on a genuinely ill-conditioned system where row `0`'s own
pivot was already the better choice: an unconditional swap would
actively pick the *worse* one on purpose, amplifying error exactly the
way Unit 3 measured, instead of avoiding it — the failure this bug
produces isn't a crash or an obviously wrong answer, it's a silent
regression in accuracy that only a real, measured comparison (the same
`relative-error` check this lesson has used throughout) would ever catch.
`needs-pivot?`'s own one-line check exists specifically to make sure the
swap only ever happens when it actually helps.

## Exercises

1. Build the system `0.00001x + y = 1`, `x + y = 2` — a pivot ten times
   smaller than this lesson's own example. Compute `solve-system` on it
   directly (no pivoting) and `solve-system-pivoted`, then use
   `relative-error` against the exact-ratio answer to check whether the
   improvement from pivoting grows, shrinks, or stays about the same as
   the pivot gets smaller.
2. `needs-pivot?` only ever considers swapping row `0` and row `1` — the
   only two rows a `2x2` system has. In your own words, explain what
   "the largest-magnitude coefficient in this column, among all the rows
   not yet used" would have to mean for a system with three or more
   equations, and why `needs-pivot?`'s own single `>` comparison isn't
   enough to generalize directly.
3. This lesson measured `relative-error` for `x` only. Compute it for
   `y` as well, for both the pivoted and unpivoted attempts against
   `m`/`b`. Explain, in one sentence, why `y`'s own relative error turned
   out so much smaller than `x`'s in both cases — connect it back to
   which row's own arithmetic `y` actually depends on.

## Definition of Done

- [ ] `(+ 0.1 0.2)` was run for real and confirmed not equal to `0.3`,
      and the associativity-breaking example was reproduced exactly.
- [ ] The catastrophic-cancellation example (`(+ 1e16 1.0)` equal to
      `1e16`, `(- (+ 1e16 1.0) 1e16)` equal to `0.0`) was run for real,
      alongside the ordinary-magnitude control case that doesn't lose
      precision.
- [ ] `solve-system` was run on the identical near-singular system as
      both exact ratios and real `double`s, and `relative-error` was
      used to measure the real, nonzero gap between them.
- [ ] `swap-rows`, `swap-b`, `needs-pivot?`, and `solve-system-pivoted`
      all run correctly, and `relative-error` confirms pivoting reduces
      the error by roughly `1267`×  on this lesson's own example.
- [ ] `needs-pivot?` was confirmed to correctly say `false` (and change
      nothing) on Lesson 241's own well-conditioned `m1`/`b1`.
- [ ] The always-swap bug was reproduced and its real, silent risk (no
      crash, no visible error on a well-conditioned system, only a
      missed or reversed accuracy improvement) explained in your own
      words.
- [ ] `git commit` with a message explaining *why* `solve-system` itself
      never had to change to fix this lesson's own accuracy problem —
      for example: `"Add partial pivoting as a pre-elimination row
      choice, not a change to solve-system itself — the instability was
      in which row became the pivot, never in the elimination logic."`
