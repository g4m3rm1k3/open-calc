# Lesson 233: Vector Operations — Addition, Scalar Multiplication, Dot Products, and Projection

**What you will build**: The four operations that make vectors more
than just a way to record a displacement — addition, which chains two
displacements into one; scalar multiplication, which stretches or
shrinks a vector without changing what direction it points; the dot
product, a single number measuring how aligned two directions actually
are; and projection, extracting exactly the piece of one vector that
points along another. Each one is verified against a concrete,
geometrically meaningful check, not just run and trusted.

**What you need to know first**: Lesson 232's `make-vector`,
`vector-dx`/`vector-dy`, and `vector-magnitude` — every operation in
this lesson builds directly on that representation. Lesson 231's
`make-point` and the idea of applying a displacement to a point.

**Terms used in this lesson**:

- **vector addition** — combining two displacements into one, "follow
  this, then follow that," resulting in a single displacement
  equivalent to both performed in sequence.
- **scalar** — a plain single number, used specifically to scale a
  vector's own size without changing its direction (except for its
  sign); named "scalar" specifically to distinguish it from a vector,
  which carries both a size and a direction.
- **scalar multiplication** — multiplying every component of a vector by
  the same single number, stretching or shrinking the vector's magnitude
  while its direction stays the same (or, for a negative scalar,
  reverses exactly).
- **dot product** — a single number computed from two vectors, the sum
  of the products of their corresponding components, that measures how
  aligned two directions are: positive when pointing similarly, negative
  when pointing in roughly opposite directions, exactly zero when
  perpendicular.
- **perpendicular** (also **orthogonal**) — two vectors whose dot product
  is exactly zero, meaning neither has any component pointing in the
  other's direction at all.
- **projection** — the piece of one vector that points in the same
  direction as a second vector; the "shadow" one vector casts onto
  another's direction line.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`get`** / **`+`** / **`-`** / **`*`**
  - *What they are:* Clojure's positional lookup, addition, subtraction,
    and multiplication functions.
  - *Implementation:* `(get coll index)` reads; `(+ a b)`, `(- a b)`,
    `(* a b)` return the sum, difference, and product.
  - *Their use:* reused throughout, reading vector components and
    combining them.
- **`/`**
  - *What it is:* Clojure's division function.
  - *Implementation:* `(/ a b)` returns `a` divided by `b`; for two
    integers that don't divide evenly, this curriculum's own established
    behavior (since its earliest rational-number lessons) is an exact
    ratio, not a rounded approximation.
  - *Its use:* computing a projection's own scale factor, the ratio of
    one dot product to another.
- **`Math/sqrt`**
  - *What it is:* the static square-root method on Java's `Math` class,
    reused unchanged from Lesson 231.
  - *Implementation:* `(Math/sqrt x)` returns the non-negative real
    square root of `x`.
  - *Its use:* confirming a scaled vector's magnitude changed by exactly
    the expected factor.

---

## Concept Unit: Vector Addition — Chaining Displacements

### The Problem

If a displacement of `[3, 4]` is followed by a second displacement of
`[1, -2]`, where does that leave whoever followed both, relative to
where they started? Is there a single displacement that captures the
combined effect of following both, one after the other?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because vector arithmetic is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn apply-vector-to-point [point v]
  (make-point (+ (point-x point) (vector-dx v)) (+ (point-y point) (vector-dy v))))

(defn vector-add [v1 v2]
  (make-vector (+ (vector-dx v1) (vector-dx v2)) (+ (vector-dy v1) (vector-dy v2))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def v1 (make-vector 3 4))
#'user/v1
user=> (def v2 (make-vector 1 -2))
#'user/v2
user=> (def vsum (vector-add v1 v2))
#'user/vsum
user=> vsum
[4 2]
```

Now confirm what that sum actually *means*, geometrically: following
`v1` then `v2` from a point should land in the exact same place as
following `vsum` directly.

```
user=> (def p0 (make-point 0 0))
#'user/p0
user=> (def p-after-v1 (apply-vector-to-point p0 v1))
#'user/p-after-v1
user=> (def p-after-both (apply-vector-to-point p-after-v1 v2))
#'user/p-after-both
user=> p-after-both
[4 2]
user=> (def p-direct (apply-vector-to-point p0 vsum))
#'user/p-direct
user=> p-direct
[4 2]
user=> (= p-after-both p-direct)
true
```

### Mechanical Walkthrough

`(defn apply-vector-to-point [point v] ...)` — `+`, reappearing, twice:
adds a vector's own `dx` to a point's `x`, and `dy` to `y`, producing a
new point — this is the actual, concrete meaning of "following a
displacement from a location."

`(defn vector-add [v1 v2] ...)` — `+`, reappearing, adds the two
vectors' corresponding components directly: `dx`s together, `dy`s
together.

Trace: `v1` is `[3 4]`, `v2` is `[1 -2]`. `vector-add` produces `vsum =
[4 2]` (`3+1=4`, `4-2=2`). Then the real check: starting from `p0 = [0
0]`, applying `v1` lands at `[3 4]`; applying `v2` from *there* lands at
`[3+1, 4-2] = [4, 2]`. Applying `vsum` directly from `p0` lands at
`[0+4, 0+2] = [4, 2]` — the exact same point. `vector-add` isn't just an
arithmetic convenience; it genuinely computes the single displacement
equivalent to two displacements performed one after another.

### CS Lens

Vector addition is what makes a vector a genuine **algebraic** object,
not just a labeled pair of numbers — two vectors combine into a third
vector by a rule (component-wise addition) that provably matches what
"doing both displacements in sequence" actually means, verified directly
above rather than assumed. This is the same idea Lesson 222's own
`transfer` demonstrated for a different kind of combination (two account
updates composing into one atomic operation) — a combining rule earns
trust by being checked against what it's supposed to represent, not by
looking plausible.

Also recognized in: adding two forces acting on the same object in
physics, where the combined force is genuinely equivalent to both acting
together; layering two successive currency exchange rates into one
combined rate; a git branch's own sequence of commits, where the net
effect of several changes in a row equals one single equivalent diff.

### SE Lens

The alternative to defining `vector-add` this way — say, adding
magnitudes directly instead of components — would produce a number with
no real geometric meaning at all; two displacements of magnitude `5`
each, at right angles to one another, do not combine into a
displacement of magnitude `10`, they combine into one of magnitude
`5√2` (roughly `7.07`), because direction genuinely matters to how
displacements combine. Component-wise addition is the one rule that
actually respects both magnitude and direction simultaneously, which is
exactly what `apply-vector-to-point`'s own verification above confirms —
the cost of getting this rule wrong wouldn't be a crash, it would be a
plausible-looking wrong number, the same silent-failure shape this
curriculum keeps returning to.

---

## Concept Unit: Scalar Multiplication — Stretching a Displacement

### The Problem

What does "go twice as far, in the same direction" mean, numerically,
given a vector already describing "how far and which way"? Is there an
operation that changes only a vector's *size*, leaving its direction
completely alone?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because vector arithmetic is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn vector-scale [v k]
  (make-vector (* (vector-dx v) k) (* (vector-dy v) k)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def v1-scaled (vector-scale v1 2))
#'user/v1-scaled
user=> v1-scaled
[6 8]
user=> (vector-magnitude v1)
5.0
user=> (vector-magnitude v1-scaled)
10.0
```

### Mechanical Walkthrough

`(defn vector-scale [v k] ...)` — `*`, reappearing, twice: multiplies
`v`'s own `dx` by `k`, and `dy` by `k`, the identical `k` both times —
this is what keeps the *direction* unchanged: both components grow (or
shrink) by exactly the same proportion.

Trace: `v1` is `[3 4]`. `(vector-scale v1 2)` produces `[6 8]`
(`3*2=6`, `4*2=8`). `(vector-magnitude v1)` is `5.0`, exactly as Lesson
232 established. `(vector-magnitude v1-scaled)` is `10.0` — precisely
double, confirming `k=2` doubled the magnitude and nothing else went
wrong: the ratio between `dx` and `dy` in `v1-scaled` (`6:8`, which
simplifies to `3:4`) is identical to `v1`'s own ratio (`3:4`) — the same
direction, scaled.

### CS Lens

**Scalar** is the actual name for `k` here, and the word matters: `k`
is a single, plain number with no direction of its own, used
specifically to change a vector's *magnitude* without introducing any
new direction into the result. This is the first real contrast between
two genuinely different kinds of numeric quantity this curriculum has
built: a **scalar** (one number, magnitude only — an ordinary integer or
rational, exactly as every number before this section has been) and a
**vector** (a magnitude *and* a direction, requiring two numbers to
specify in two dimensions). Multiplying a vector by a scalar is a
different *kind* of multiplication than multiplying two ordinary
numbers together — it takes two genuinely different kinds of thing as
input and produces the vector kind back out.

Also recognized in: a recipe scaled to serve twice as many people,
every ingredient quantity multiplied by the same factor while the
recipe's own proportions (its "direction," in a sense) stay identical;
a photograph resized larger or smaller, every dimension scaled by the
same percentage so the image's shape doesn't distort; a financial
position's leverage, multiplying potential gain and loss by the same
factor without changing which direction the bet was placed.

### SE Lens

The alternative — scaling `dx` and `dy` by *different* factors — is a
real, legitimate operation too (it stretches a shape unevenly, a genuine
geometric transformation), but it is deliberately *not* what scalar
multiplication means; conflating the two would make "scale this vector"
ambiguous between "make it bigger, same direction" and "distort its
direction on purpose." Keeping scalar multiplication to a single shared
factor, applied uniformly, is what preserves the guarantee this unit's
own verification just confirmed — magnitude changes by exactly `k`,
direction never changes at all — a guarantee a two-factor version could
never make.

---

## Concept Unit: Dot Product — Measuring Alignment

### The Problem

Given two vectors, is there a single number that says how *aligned*
they are — pointing in genuinely similar directions, roughly opposite
directions, or perpendicular, with no relationship between their
directions at all? Neither addition nor scalar multiplication answers
this; both of those combine or resize a vector, but neither compares two
vectors' *directions* against each other.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because vector arithmetic is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn dot-product [v1 v2]
  (+ (* (vector-dx v1) (vector-dx v2)) (* (vector-dy v1) (vector-dy v2))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def vx (make-vector 1 0))
#'user/vx
user=> (def vy (make-vector 0 1))
#'user/vy
user=> (dot-product vx vy)
0
user=> (dot-product v1 v1)
25
user=> (def v1-opposite (make-vector -3 -4))
#'user/v1-opposite
user=> (dot-product v1 v1-opposite)
-25
```

### Mechanical Walkthrough

`(defn dot-product [v1 v2] ...)` — `*`, reappearing, twice: multiplies
the two vectors' `dx` components together, and separately their `dy`
components together; `+`, reappearing, sums the two products into one
final number.

Trace three cases: `vx = [1 0]` and `vy = [0 1]` — straight along each
axis, genuinely perpendicular. `(dot-product vx vy)` is `(1*0) + (0*1)
= 0 + 0 = 0`, exactly zero. `(dot-product v1 v1)` — a vector against
*itself*, the most aligned two vectors can possibly be — is `(3*3) +
(4*4) = 9 + 16 = 25`, a large positive number (and, not coincidentally,
exactly `vector-magnitude-squared`'s own result — a vector dotted with
itself always equals its own squared magnitude). `v1-opposite = [-3
-4]`, pointing in exactly the reverse direction of `v1`: `(dot-product
v1 v1-opposite)` is `(3 * -3) + (4 * -4) = -9 + -16 = -25`, a large
negative number.

### CS Lens

The dot product's sign is the real content here: **zero** exactly when
two vectors are **perpendicular** (also called **orthogonal**) — no
part of either points in the other's direction at all; **positive**
when they point in broadly the same direction; **negative** when they
point in broadly opposite directions. This single number, computed from
nothing but ordinary multiplication and addition, captures a genuinely
geometric fact — alignment — that neither vector's own magnitude or
components alone could answer, and it does so without ever needing an
angle, a trig function, or anything beyond arithmetic already fully
established in this curriculum.

Also recognized in: two spreadsheet columns' correlation, positive when
they tend to rise and fall together, negative when one rises as the
other falls, near zero when they show no real relationship; a physics
formula for work, force dotted with displacement, zero when a force is
applied entirely sideways to the direction of motion (pushing straight
down on a horizontally sliding object does no work at all); a search
engine ranking two documents' relevance by the dot product of their own
word-frequency vectors, higher when the documents share emphasis on the
same terms.

### SE Lens

The alternative to a dot product — comparing two vectors' magnitudes
alone — throws away exactly the information that matters most here:
`v1 = [3, 4]` and `v1-opposite = [-3, -4]` have the *identical*
magnitude, `5.0` each, and comparing magnitudes alone would report them
as indistinguishable, when they actually point in exactly opposite
directions. The dot product's real value is that it's sensitive to
direction in a way magnitude comparison structurally cannot be — the
cost is that a dot product alone doesn't tell you *how much* alignment
there is in an easily-interpretable unit (it's affected by both
vectors' magnitudes, not just their directions) — a limitation the next
unit's projection partially resolves by dividing that sensitivity back
out.

---

## Concept Unit: Projection — Extracting the Aligned Part

### The Problem

Given two vectors, is there a way to extract *exactly the part* of one
that points in the other's direction — the "shadow" it would cast if a
light shone perpendicular to the second vector's own direction? The dot
product measures alignment as one abstract number; can that number be
turned into an actual vector, pointing exactly along the second vector,
with the correct length?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because vector arithmetic is a mathematical concept this
  curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn vector-projection [a b]
  (vector-scale b (/ (dot-product a b) (dot-product b b))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def a (make-vector 3 4))
#'user/a
user=> (def b1 (make-vector 1 0))
#'user/b1
user=> (vector-projection a b1)
[3 0]
user=> (def b2 (make-vector 1 1))
#'user/b2
user=> (vector-projection a b2)
[7/2 7/2]
```

### Mechanical Walkthrough

`(defn vector-projection [a b] ...)` — read from the inside out:
`(dot-product a b)` measures `a`'s alignment with `b`; `(dot-product b b)`
— `b` dotted with itself — is `b`'s own squared magnitude, established
already in Unit 3's own trace. `/`, reused from this curriculum's
earliest arithmetic, divides the first by the second, producing a plain
scalar — how many multiples of `b`'s own length the aligned part of `a`
actually is. `vector-scale`, reappearing from Unit 2, then stretches `b`
itself by exactly that scalar, producing a real vector, pointing exactly
along `b`'s own direction, of the correct length.

Trace the first call: `a = [3 4]`, `b1 = [1 0]` (a unit-length vector
straight along `x`). `(dot-product a b1) = 3*1 + 4*0 = 3`. `(dot-product
b1 b1) = 1*1 + 0*0 = 1`. The scale factor is `3/1 = 3`. `(vector-scale
b1 3)` is `[3 0]` — exactly `a`'s own `x`-component, with `y` dropped to
`0`, precisely the "shadow" `a` casts straight down onto the `x` axis.

Trace the second: `b2 = [1 1]`, pointing diagonally. `(dot-product a
b2) = 3*1 + 4*1 = 7`. `(dot-product b2 b2) = 1*1 + 1*1 = 2`. The scale
factor is `7/2` — Clojure's own exact-ratio division, not a rounded
`3.5` — and `(vector-scale b2 7/2)` is `[7/2 7/2]`, the exact point
along the diagonal line closest to `a`.

### CS Lens

Projection decomposes any vector `a` into two pieces relative to a
chosen direction `b`: the part that's aligned with `b` (this unit's own
`vector-projection`) and, implicitly, a leftover part perpendicular to
`b` (computable as `a` minus the projection, though not built here).
This decomposition — splitting a quantity into "the part that matters
for this specific direction" and "everything else" — is a genuinely
recurring idea, not unique to geometry: it's the same shape as isolating
one relevant signal from a mixture of several, keeping only the
component that's actually aligned with whatever's being measured.

Also recognized in: a shadow cast on the ground, literally the
projection of an object's own shape onto the direction perpendicular to
the sun's rays; a weighted grade calculation, extracting "how much did
this one assignment actually contribute to the final grade," the
aligned piece of a whole semester's worth of work; noise-cancelling
audio processing, which projects an incoming signal onto a known noise
pattern's own direction specifically so that aligned component can be
subtracted back out.

### SE Lens

The alternative — trying to answer "how aligned are these vectors"
using only the raw dot product, without ever converting it into a real
vector — leaves the answer as an abstract number whose scale depends on
both vectors' own magnitudes, hard to compare meaningfully across
different pairs of vectors. Projection's real cost is the division it
introduces: `dot-product b b` must never be zero, meaning `b` itself can
never be the zero vector — a real, meaningful edge case this lesson's
own `vector-projection` does not guard against, left as an honest gap
(this curriculum's own established pattern of scoping a lesson to its
representative, tractable core rather than every edge case, as Lessons
99, 100, and 134 already did explicitly) rather than a claim that this
function is bulletproof for every possible input.

---

## Connect the Pieces

Follow vector `v1 = [3, 4]` through every operation built in this
lesson. `vector-add` (Unit 1) combines it with `v2 = [1, -2]` into
`[4, 2]`, proven — not just computed — to be the true single
displacement equivalent to following both in sequence, by actually
applying both routes to the same starting point and getting the
identical result. `vector-scale` (Unit 2) doubles `v1` into `[6, 8]`,
and `vector-magnitude` confirms the length genuinely doubled too, `5.0`
to `10.0`, while the direction (the ratio `3:4`) stayed exactly the
same. `dot-product` (Unit 3), run against `v1` itself, `v1`'s exact
opposite, and two perpendicular unit vectors, demonstrates the full
range its sign can take — positive, negative, and exactly zero — turning
"how aligned are two directions" into a single checkable number.
`vector-projection` (Unit 4) then uses that same dot product, twice —
once for `v1`'s own alignment with a target direction, once for that
direction's own squared length — to extract the real, geometric
"shadow" `v1` casts along two genuinely different target vectors, one
producing a whole-number result, the other an exact fraction, both
computed by the identical formula. Four operations, each verified
against what it's actually supposed to mean geometrically, not merely
run and trusted to be correct.

## What Breaks Without This

Compute a projection using the dot product's raw *sign* instead of its
actual scaled magnitude — a plausible-looking but wrong shortcut:

```clojure
(defn vector-projection-broken [a b]
  (if (> (dot-product a b) 0)
    b
    (vector-scale b -1)))
```

Run it against Unit 4's own second case:

```
user=> (vector-projection-broken a b2)
[1 1]
```

The correct projection, `[7/2, 7/2]`, captures *exactly how far* along
`b2`'s own direction `a`'s aligned component reaches. The broken
version collapses that entirely, returning either `b2` itself or its
exact reverse, depending only on the dot product's *sign* — a real
information loss no amount of "the direction is at least right" excuses,
since the whole reason a projection is useful is knowing precisely how
much of `a` lies along `b2`, not merely which of two directions it
leans toward. Restoring the true scale-factor computation brings the
correct `[7/2, 7/2]` back.

## Exercises

1. Confirm `vector-add` is commutative — `(vector-add v1 v2)` equals
   `(vector-add v2 v1)` — for at least two different vector pairs, and
   explain in one sentence why this must always be true given
   `vector-add`'s own component-wise definition.
2. Compute `(vector-projection a a)` — a vector projected onto itself —
   and confirm it equals `a` exactly, then explain in one sentence why
   that has to be true regardless of what `a` actually is.
3. Build a `perpendicular?` predicate using `dot-product`, and confirm
   it correctly identifies `[3, 4]` and `[4, -3]` as perpendicular (a
   90-degree rotation of the original vector) without ever computing an
   angle.

## Definition of Done

- [ ] `apply-vector-to-point`, `vector-add`, `vector-scale`,
      `dot-product`, and `vector-projection` all defined and run in a
      live `bb` REPL, matching every transcript shown above exactly.
- [ ] Unit 1's chained-vs-direct displacement check reproduced, with `=`
      confirming both routes land on the same point.
- [ ] Unit 2's magnitude-doubling check reproduced.
- [ ] Unit 3's three dot-product cases reproduced — zero, positive, and
      negative.
- [ ] Unit 4's two projections reproduced, including the exact `7/2`
      rational result.
- [ ] Exercise 2 completed and explained in your own words.
- [ ] `git commit -m "Add Lesson 233: vector addition, scalar
      multiplication, dot product, and projection, each verified
      against its actual geometric meaning"`
