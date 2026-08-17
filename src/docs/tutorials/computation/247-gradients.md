# Lesson 247: Gradients — Derivatives in More Than One Direction

**What you will build**: `gradient`, a real function that takes a
two-variable function and a point, and returns an actual Lesson-232-style
vector — not a metaphor, a genuine `[dx, dy]` — pointing in the exact
direction that function increases fastest at that point. Built from
nothing but Lesson 246's own difference-quotient idea, applied once per
input variable, then bundled together with `make-vector`. The lesson
closes by proving, numerically rather than just asserting it, that
stepping in the gradient's own direction genuinely increases a function
more than stepping in any other direction tried against it.

**What you need to know first**: Lesson 246's own difference quotient
and `numerical-derivative` — this lesson's own `partial-derivative-x`/
`partial-derivative-y` are the identical idea, applied to a two-argument
function with one argument held fixed. Lesson 232's `make-vector`,
`vector-dx`, `vector-dy`, and `vector-magnitude` — the gradient this
lesson builds *is* one of these vectors, not a new kind of value.

**Terms used in this lesson**:

- **partial derivative** — the rate of change of a multi-variable
  function with respect to *one* of its inputs, holding every other
  input completely fixed — the direct extension of Lesson 246's own
  derivative to a function that takes more than one number.
- **gradient** — a real vector, one component per input variable, where
  each component is that variable's own partial derivative — pointing,
  as a genuine direction in space, toward the way the function increases
  fastest from the point it was computed at.
- **directional derivative** — reused implicitly, made concrete rather
  than named in Unit 1: the rate of change of a function in some
  *specific* direction, not necessarily along a single axis — what
  Unit 3's own real experiment measures for three different directions.
- **steepest ascent** — the single direction, among every possible
  direction from a point, along which a function increases fastest — the
  real, checkable claim this lesson's own closing unit verifies rather
  than assumes.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`make-vector`** / **`vector-dx`** / **`vector-dy`** /
  **`vector-magnitude`**
  - *What they are:* reused unchanged from Lesson 232.
  - *Their use:* a gradient's own two partial derivatives are bundled
    into a real vector with `make-vector`; `vector-magnitude` measures
    exactly how steep the function is at a point, not just which way is
    steepest.
- **`get`** / **`-`** / **`*`** / **`+`** / **`/`**
  - *What they are:* Clojure's positional lookup, subtraction,
    multiplication, addition, and division functions, reused throughout
    this curriculum since its earliest arithmetic.
  - *Their use:* the same difference-quotient arithmetic Lesson 246
    already built, applied once per input variable.

---

## Concept Unit: Partial Derivatives — Holding One Variable Fixed

### The Problem

Lesson 246's own `numerical-derivative` works for a function of exactly
one number. A function like `bowl(x, y) = x² + y²` takes two — asking
"how fast does `bowl` change" is no longer a single question, since the
answer depends on *which* direction is being asked about. The first,
simplest version of that question: how fast does `bowl` change if only
`x` moves, with `y` held completely still — and, separately, how fast if
only `y` moves instead?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because the gradient is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn bowl [x y] (+ (* x x) (* y y)))

(defn partial-derivative-x [f x y h]
  (/ (- (f (+ x h) y) (f x y)) h))

(defn partial-derivative-y [f x y h]
  (/ (- (f x (+ y h)) (f x y)) h))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn bowl [x y] (+ (* x x) (* y y)))` — `+`, `*`, both reappearing,
compute `x² + y²` — a real, named two-variable function, this lesson's
own running example, shaped like a bowl: `0` at the origin, growing in
every direction away from it.

`(defn partial-derivative-x [f x y h] ...)` — `+`, reappearing, computes
`x + h`, moving *only* the `x` input by a small step; `y` is passed
through completely unchanged to both calls. `-` and `/`, reappearing,
form the identical difference quotient Lesson 246 already built:
`(f(x+h, y) - f(x, y)) / h` — the exact same shape as
`numerical-derivative`, with `y` simply along for the ride, untouched.

`(defn partial-derivative-y [f x y h] ...)` — the mirror image: `y +
h` moves, `x` stays fixed.

This is called a **partial derivative**: "partial" specifically because
only one of the function's own inputs is allowed to move at a time — the
rate of change *in that one direction alone*, holding everything else
still.

### CS Lens

This is the identical **difference quotient** Lesson 246 already gave
full treatment, reused with no new arithmetic — what's new is *which*
input the step is applied to, not the technique itself. Recognizing that
"holding a variable fixed" is exactly "not applying the step to it" —
rather than a genuinely new mathematical operation — is the actual point
of this unit. Also recognized in: sensitivity analysis in engineering
and finance, asking "how much does the outcome change if only this one
input moves," and machine learning's own backpropagation, which computes
exactly this kind of partial derivative, one per model parameter, at
every training step.

### SE Lens

The alternative — one general function taking an arbitrary list of
variables and an index saying which one to perturb — would generalize
beyond two dimensions, at the cost of real complexity this lesson's own
two-variable scope doesn't need: indexed access into a variable-length
argument list, and a way to call `f` with one argument replaced while
the rest stay identical. `partial-derivative-x` and `partial-derivative-y`
as two separate, concrete functions cost a little duplication in
exchange for staying exactly as simple as Lesson 246's own single-
variable version, matching this curriculum's own established preference
for concrete, specific-arity functions over premature generalization.

### Run It — Real Output

```
user=> (partial-derivative-x bowl 3 4 1e-8)
5.99999978589949
user=> (partial-derivative-y bowl 3 4 1e-8)
7.999999951380232
```

`bowl`'s own true partial derivatives are `2x` and `2y` (the identical
`d/dx[x²] = 2x` rule Lesson 246 already confirmed, applied once per
variable) — at `(3, 4)`, that's `6` and `8` exactly. Both numerical
results land within Lesson 246's own already-established `h`-related
floating-point tolerance of those true values.

### Connection

Two separate numbers, one rate of change per axis. The next unit bundles
them into the single object they were always describing together: a real
direction in space.

---

## Concept Unit: The Gradient Vector

### The Problem

`partial-derivative-x` and `partial-derivative-y`, called separately,
answer two related but disconnected questions. Together, though, they
describe something more specific: not just "how fast in `x`" and "how
fast in `y`" independently, but a single combined direction — exactly
the kind of two-number, directional quantity Lesson 232 already built a
real representation for.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because the gradient is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses
  `partial-derivative-x`/`partial-derivative-y` from this lesson's own
  Unit 1 and `make-vector` from Lesson 232.

### The New Code

```clojure
(defn gradient [f x y h]
  (make-vector (partial-derivative-x f x y h) (partial-derivative-y f x y h)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn gradient [f x y h] ...)` — `partial-derivative-x` and
`partial-derivative-y`, both reappearing from this lesson's own Unit 1,
compute the two rates of change; `make-vector`, reappearing from Lesson
232, bundles them into a real two-component vector — the identical
`[dx, dy]` representation every earlier vector in this curriculum has
used, here holding two rates of change instead of two spatial
displacements. This is called the **gradient**: a real vector, not a
metaphor for one, pointing in the direction `f` increases fastest from
`(x, y)`.

### CS Lens

This is **combining independently-computed parts into one structured
value that means more than its parts alone** — the identical idea Lesson
243's own homogeneous point bundled `x`, `y`, and `w` together, or
Lesson 234's own matrix bundled two rows together, applied here to two
partial derivatives. A gradient computed as two separate numbers,
never combined, could still answer "how fast in `x`" and "how fast in
`y`" — but only the bundled vector can answer "which single direction,"
the question this lesson's own closing unit actually needs answered.

### SE Lens

The alternative — keeping the two partial derivatives as separate
return values, or a raw two-element list with no named structure — would
lose the ability to reuse Lesson 232's own already-verified vector
machinery (`vector-magnitude`, `vector-scale`, everything Lessons 232
and 233 already built) directly on the result. Returning a real
`make-vector` instead means `gradient`'s own output is immediately
interoperable with every vector function this curriculum has already
built and verified, at zero extra cost.

### Run It — Real Output

```
user=> (gradient bowl 3 4 1e-8)
[5.99999978589949 7.999999951380232]
user=> (vector-magnitude (gradient bowl 3 4 1e-8))
9.99999983264388
```

`gradient`'s own magnitude comes out almost exactly `10` — the true
gradient at `(3, 4)` is `(6, 8)`, and `vector-magnitude([6, 8])` is
`10` by the identical Pythagorean arithmetic Lesson 232 already used for
the `3`-`4`-`5` triangle, here doubled to `6`-`8`-`10`. One honest,
worth-noticing detail:

```
user=> (gradient bowl 0 0 1e-8)
[1.0E-8 1.0E-8]
```

`bowl`'s own true gradient at the origin — its lowest point — is exactly
`(0, 0)`: no direction increases a function fastest at its own minimum,
because every direction increases it equally slowly right at the bottom.
The numerical result isn't quite `(0, 0)` — it's `(h, h)` exactly,
because `bowl(0+h, 0) - bowl(0, 0) = h² - 0 = h²`, and `h² / h = h`
precisely. This isn't an error to be alarmed by; it's `h`'s own leftover
footprint on a genuinely flat point, exactly the same kind of honest,
explainable floating-point residue Lesson 246's own catastrophic-
cancellation unit already trained this curriculum to expect and check
for, rather than assume away.

### Connection

The gradient is a real vector now. The closing unit checks the actual
claim this whole lesson exists to prove: does it really point toward the
fastest increase, or does it just look plausible?

---

## Concept Unit: The Gradient Points Toward Steepest Ascent

### The Problem

`gradient` returns *some* vector — the real test is whether that vector
genuinely describes "the direction that increases `f` fastest," not just
"a direction that happens to be computed from partial derivatives." A
direct, real check: from a fixed starting point, take an identically-
sized small step in three different directions — along the gradient
itself, exactly perpendicular to it, and directly opposite it — and
compare how much `bowl` actually changed in each case.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because the gradient is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses `gradient` and
  `vector-magnitude` unchanged — this unit introduces no new function,
  only a new experiment run against them.

### The New Code

No new function this unit — the real content is three real, comparable
measurements against `bowl` at `(3, 4)`, using `gradient`'s own already-
computed direction, its exact perpendicular (built by swapping and
negating one component — the same `90°`-rotation shape Lesson 234's own
`rotate90` already established: `(dx, dy)` becomes `(-dy, dx)`), and its
exact opposite.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — this unit's own verification is the real check itself,
run against three genuinely different directions, not a throwaway later
discarded.

### Mechanical Walkthrough

Starting value: `(bowl 3 4) = 25`. The gradient at `(3, 4)`, from Unit
2, is `≈ (6, 8)`, magnitude `≈ 10`; dividing each component by that
magnitude gives a **unit vector** (length exactly `1`) pointing the
identical direction, `≈ (0.6, 0.8)`. Taking one small step, `ε = 0.001`,
along that unit direction moves the point to `≈ (3.0006, 4.0008)`;
`bowl` there is `25.010001`, a real increase of `≈ 0.01`. The
*perpendicular* unit direction — `rotate90`'s own `(-dy, dx)` shape
applied to the gradient's unit vector, `≈ (-0.8, 0.6)` — moves the point
to `≈ (2.9992, 4.0006)`; `bowl` there is `25.000000999857896`, an
increase of only `≈ 0.000001` — a thousand times smaller. The *opposite*
direction, `-1` times the gradient's own unit vector, moves to `≈
(2.9994, 3.9992)`; `bowl` there is `24.990001`, a real *decrease* of `≈
0.01`.

### CS Lens

This is a **numerical proof by direct comparison** — the same
"substitution beats trusting a formula" discipline this curriculum
already leaned on in Lesson 240's own algebraic proof and Lesson 244's
own real non-commutativity demonstration, applied here to a genuinely
different kind of claim: not "these two things are equal" but "this one
direction beats every other direction tried against it." The
calculus-level explanation matches exactly: moving `ε` along the
gradient's own unit direction changes `f` by approximately `|gradient| ×
ε` (`10 × 0.001 = 0.01`, matching the real measured `0.010001` closely);
moving perpendicular to it changes `f` by approximately nothing, to
first order (the real measured `≈ 0.000001` is a genuine *second-order*
effect, not the gradient's own doing). Also recognized in: gradient
descent (Lesson 249's own direct subject) stepping *against* the
gradient to decrease a cost function as fast as possible; ridge-walking
algorithms in terrain navigation choosing the steepest available
direction; and image-processing edge detection, which is, quite
literally, finding points where a brightness function's own gradient
magnitude is large.

### SE Lens

The alternative — simply asserting "the gradient points toward steepest
ascent" as a memorized calculus fact, the way many treatments of this
topic do — is exactly the kind of unverified claim this whole
curriculum's own schema exists to refuse. Running the real comparison
costs three extra function calls and one rotation, in exchange for a
claim that's now backed by this session's own real numbers rather than
borrowed authority — the same standard Lesson 240 already held itself to
for eigenvectors, and Lesson 244 for matrix composition order.

### Run It — Real Output

```
user=> (bowl 3 4)
25
user=> (def g (gradient bowl 3 4 1e-8))
#'user/g
user=> g
[5.99999978589949 7.999999951380232]
user=> (vector-magnitude g)
9.99999983264388
```

Building the gradient's own unit vector for real, from `g` directly:

```
user=> (def gmag (vector-magnitude g))
#'user/gmag
user=> (def gx-unit (/ (vector-dx g) gmag))
#'user/gx-unit
user=> (def gy-unit (/ (vector-dy g) gmag))
#'user/gy-unit
user=> gx-unit
0.599999988631316
user=> gy-unit
0.800000008526513
```

Stepping `ε = 0.001` along that exact direction:

```
user=> (def eps 0.001)
#'user/eps
user=> (bowl (+ 3 (* eps gx-unit)) (+ 4 (* eps gy-unit)))
25.010001
```

Perpendicular to the gradient (`rotate90`'s own `(-dy, dx)` shape applied
to the unit vector, `(-0.800000008526513, 0.599999988631316)`):

```
25.000000999857896
```

Directly opposite the gradient (`-1` times the same unit vector,
`(-0.599999988631316, -0.800000008526513)`):

```
24.990001
```

`25.010001 > 25.000000999857896 > 25 > 24.990001` — a real, measured
ordering: the gradient direction increased `bowl` the most, the
perpendicular direction barely changed it at all, and the opposite
direction decreased it by almost exactly the same amount the gradient
direction increased it — exactly what "steepest ascent, steepest
descent in the opposite direction, no change perpendicular to it" would
predict.

### Connection

The closing section traces `bowl` and its own gradient at `(3, 4)`
through every unit built in this lesson.

---

## Connect the Pieces

One function, `bowl(x, y) = x² + y²`, and one point, `(3, 4)`, moving
through every unit built in this lesson:

1. `partial-derivative-x(bowl, 3, 4, 1e-8)` → `≈ 6` (Unit 1) — how fast
   `bowl` grows moving only in `x`.
2. `partial-derivative-y(bowl, 3, 4, 1e-8)` → `≈ 8` (Unit 1) — how fast
   moving only in `y`.
3. `gradient(bowl, 3, 4, 1e-8)` → `≈ [6, 8]` (Unit 2) — the two rates,
   bundled into one real direction.
4. `vector-magnitude` of that gradient → `≈ 10` (Unit 2) — exactly how
   steep `bowl` is at `(3, 4)`, not just which way is steepest.
5. A small step along that direction increases `bowl` by `≈ 0.01`; a
   step perpendicular to it changes `bowl` by only `≈ 0.000001`; a step
   opposite it decreases `bowl` by `≈ 0.01` (Unit 3) — the real,
   measured proof the gradient's own direction was never arbitrary.

Every number in step 5 traces directly back to step 3's own vector —
nothing about "steepest ascent" was assumed; it was measured, using
nothing but Lesson 246's own difference quotient and Lesson 232's own
vector machinery.

## What Breaks Without This

Build the gradient with its two components accidentally swapped:

```clojure
(defn gradient-swapped [f x y h]
  (make-vector (partial-derivative-y f x y h) (partial-derivative-x f x y h)))
```

```
user=> (gradient-swapped bowl 3 4 1e-8)
[7.999999951380232 5.99999978589949]
```

At `(3, 4)`, `bowl`'s own true partial derivatives, `≈ 6` and `≈ 8`,
happen to be different enough from each other that the swapped vector
points in a genuinely different direction than the real gradient — not
toward steepest ascent, but toward whatever `bowl`'s own shape happens to
do in *that* direction instead, which for this asymmetric bowl-shaped
example wastes real ascent, because a `dx`-vs-`dy` swap changes which
axis the vector leans toward. The real risk is scale, not just
direction: at a point where `x` and `y`'s own partial derivatives are
close in size, the bug could be nearly invisible, exactly the kind of
"looks plausible, quietly wrong" failure Unit 3's own real experiment,
run against the *correct* gradient, exists to catch — running the
identical steepest-ascent check against `gradient-swapped` here would
show a measurably smaller increase than the real gradient's own `0.01`,
catching the swap without ever reading the code that caused it.
Restoring the correct order:

```
user=> (gradient bowl 3 4 1e-8)
[5.99999978589949 7.999999951380232]
```

matches the real, verified partial-derivative order again.

## Exercises

1. Compute `gradient(bowl, x, y, 1e-8)` at three more points — `(1, 0)`,
   `(0, 1)`, and `(5, 5)` — and confirm, using `vector-magnitude`, that
   the gradient grows larger the farther the point is from the origin,
   matching `bowl`'s own shape genuinely getting steeper farther from its
   minimum.
2. Run Unit 3's own steepest-ascent experiment again, but at `(1, 1)`
   instead of `(3, 4)`. Confirm the same three-way ordering
   (gradient-direction increase greatest, perpendicular smallest,
   opposite-direction decrease) holds at a genuinely different point.
3. Build a genuinely different two-variable function — not a bowl —
   where the gradient's own direction changes meaningfully depending on
   the point, and verify `gradient` still correctly identifies the
   steepest-ascent direction there too, using Unit 3's own three-step
   comparison technique.

## Definition of Done

- [ ] `partial-derivative-x` and `partial-derivative-y` both converge to
      `bowl`'s own true partial derivatives (`2x` and `2y`) at a real
      point.
- [ ] `gradient` correctly bundles both partials into a real
      `make-vector`, and `vector-magnitude` on the result matches the
      known Pythagorean value at `(3, 4)`.
- [ ] The near-zero-but-not-quite gradient at `bowl`'s own minimum,
      `(0, 0)`, was run for real and explained as `h`'s own leftover
      footprint, not an error.
- [ ] The steepest-ascent experiment was run for real: gradient-direction
      step increases `bowl` the most, perpendicular step barely changes
      it, opposite-direction step decreases it by nearly the same amount.
- [ ] The swapped-components bug was reproduced for real and explained
      in your own words, including why it could be hard to notice at
      some points and not others.
- [ ] `git commit` with a message explaining *why* `gradient` returns a
      real `make-vector` rather than two separate numbers — for example:
      `"Return gradient as a real vector so vector-magnitude and future
      vector-scale calls work on it directly — Lesson 249's own gradient
      descent will need to scale and subtract this exact vector."`
