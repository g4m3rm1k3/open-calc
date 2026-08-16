# Lesson 236: Linear Transformations — Connecting Algebra and Geometry

**What you will build**: The actual formal definition underlying every
matrix this section has built since Lesson 234, made concrete and
checkable rather than assumed: a transformation is **linear** exactly
when it satisfies two specific algebraic properties, additivity and
homogeneity — and matrix-vector multiplication is proven, with real
numbers, to satisfy both. It closes with a genuinely surprising,
important result: Lesson 231's own `translate-point` — one of the most
natural operations this whole section has built — is proven, concretely,
to be **not** linear, explaining directly why this section treated
points and vectors as such different things from the very first lesson.

**What you need to know first**: Lesson 234's `matrix-vector-multiply`.
Lesson 233's `vector-add` and `vector-scale`, both reused as the two
operations additivity and homogeneity are actually stated in terms of.
Lesson 231's `translate-point`, whose own nature this lesson's final
unit reveals directly.

**Terms used in this lesson**:

- **linear transformation** — a transformation satisfying two specific
  algebraic properties, additivity and homogeneity, together; the formal
  definition underlying every matrix-vector-multiply this section has
  built so far, stated explicitly here for the first time rather than
  merely assumed.
- **additivity** — the property that transforming a sum of two vectors
  equals summing their two individual transformed results; one of the
  two conditions a transformation must satisfy to be called linear.
- **homogeneity** — the property that transforming a scaled vector
  equals scaling the transformed result by the identical factor; the
  second of the two conditions a transformation must satisfy to be
  called linear.
- **affine transformation** — a transformation built from a linear
  transformation plus a fixed shift; translation is the simplest
  possible example, and this lesson proves directly why it needs this
  separate category rather than fitting inside "linear" itself.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`matrix-vector-multiply`** / **`vector-add`** / **`vector-scale`**
  - *What they are:* reused unchanged from Lessons 233 and 234.
  - *Implementation:* `matrix-vector-multiply` applies a matrix's
    transformation to a vector; `vector-add` and `vector-scale` combine
    or resize vectors component-wise.
  - *Their use:* every check in this lesson is built entirely from
    calling these three functions in different combinations and
    comparing the results.

---

## Concept Unit: Additivity — Transforming a Sum

### The Problem

Lessons 234 and 235 built and trusted specific matrices — rotation,
scaling, their composition — by checking they behaved sensibly on
individual examples. Is there a deeper, general property that all of
them actually share, something that could be checked directly rather
than inferred from a handful of examples looking right?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because linear transformations are a mathematical concept
  this curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

No new function — this unit reuses `matrix-vector-multiply` and
`vector-add`, both completely unchanged. What's new is the comparison:
transforming a sum, against summing two transforms.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def v1 (make-vector 1 0))
#'user/v1
user=> (def v2 (make-vector 0 1))
#'user/v2
user=> (def sum-then-transform (matrix-vector-multiply rotate90 (vector-add v1 v2)))
#'user/sum-then-transform
user=> sum-then-transform
[-1 1]
user=> (def transform-then-sum (vector-add (matrix-vector-multiply rotate90 v1) (matrix-vector-multiply rotate90 v2)))
#'user/transform-then-sum
user=> transform-then-sum
[-1 1]
user=> (= sum-then-transform transform-then-sum)
true
```

### Mechanical Walkthrough

`sum-then-transform` — `vector-add`, reappearing from Lesson 233,
combines `v1 = [1, 0]` and `v2 = [0, 1]` into `[1, 1]` first; then
`matrix-vector-multiply`, reappearing from Lesson 234, applies
`rotate90` to that combined vector, producing `[-1, 1]`.

`transform-then-sum` — the opposite order: `rotate90` applied to `v1`
alone first (`[0, 1]`, "north," from Lesson 234's own trace), and
separately to `v2` alone (`[-1, 0]`, "west"); *then* `vector-add`
combines those two already-transformed results, producing `[-1, 1]`.

`(= sum-then-transform transform-then-sum)` is `true` — genuinely
identical, not approximately close. It made no difference whether the
two vectors were added together *before* rotating, or rotated
*separately* and added together *afterward* — both routes land at the
exact same place.

### CS Lens

This is **additivity**, the first of the two properties that define a
**linear transformation**: `T(v1 + v2) = T(v1) + T(v2)`, for every pair
of vectors, not just this one. It's a genuinely strong claim — it says a
transformation can be "pulled apart," applied to pieces separately, and
reassembled afterward, with no loss of correctness. Every matrix-vector
multiplication this curriculum has built has this property by
construction, because `dot-product`'s own definition (a sum of
component-wise products) already distributes over addition the same
way ordinary multiplication distributes over addition in arithmetic —
`a*(b+c) = a*b + a*c`, restated one dimension higher.

Also recognized in: a tax calculation that can be computed on two
separate income sources independently and then summed, producing the
same total as combining the incomes first and taxing the sum (true only
for a genuinely proportional, "linear" tax rate — a progressive one with
brackets famously does *not* have this property, which is exactly why
combining incomes before or after applying brackets can produce
different results); a shipping cost calculator where the cost of two
separate packages, computed individually and added, matches the cost of
shipping their combined weight as one package; light intensities adding
linearly when two separate light sources illuminate the same point.

### SE Lens

The alternative to checking additivity directly — trusting a
transformation is "well-behaved" because a few individual examples
looked reasonable — is exactly the kind of unverified assumption this
curriculum has warned against throughout. Additivity is a real,
checkable property, not a vague impression, and this unit's own
comparison — computing both routes independently and comparing with `=`
— is the concrete, repeatable way to confirm it, rather than trusting it
by analogy with how ordinary numbers behave.

---

## Concept Unit: Homogeneity — Transforming a Scaled Vector

### The Problem

Additivity alone doesn't fully capture what "linear" means — a
transformation could, in principle, respect sums while still behaving
strangely under scaling. Does `rotate90` also respect Lesson 233's own
scalar multiplication the same clean way?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because linear transformations are a mathematical concept
  this curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

No new function — this unit reuses `matrix-vector-multiply` and
`vector-scale`, both completely unchanged. What's new is the
comparison: transforming a scaled vector, against scaling a transform.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def scale-then-transform (matrix-vector-multiply rotate90 (vector-scale v1 3)))
#'user/scale-then-transform
user=> scale-then-transform
[0 3]
user=> (def transform-then-scale (vector-scale (matrix-vector-multiply rotate90 v1) 3))
#'user/transform-then-scale
user=> transform-then-scale
[0 3]
user=> (= scale-then-transform transform-then-scale)
true
```

### Mechanical Walkthrough

`scale-then-transform` — `vector-scale`, reappearing from Lesson 233,
triples `v1` into `[3, 0]` first; then `matrix-vector-multiply` rotates
that scaled vector, producing `[0, 3]`.

`transform-then-scale` — the opposite order: `rotate90` applied to `v1`
alone first (`[0, 1]`); *then* `vector-scale` triples the already-
rotated result, producing `[0, 3]`.

`(= scale-then-transform transform-then-scale)` is `true` — again
exactly identical, not approximate. Scaling first and then rotating
produced the same result as rotating first and then scaling by the
same factor.

### CS Lens

This is **homogeneity**, the second defining property: `T(k * v) = k *
T(v)`, for every vector `v` and every scalar `k`. Together, additivity
and homogeneity are exactly what "linear" means, formally — a
transformation with *both* properties is called a **linear
transformation**, and the two properties together turn out to have a
remarkable consequence, worth stating plainly: any transformation
satisfying both can *always* be represented as a matrix, and every
matrix-vector multiplication *always* satisfies both — the entire
algebraic content of "this is a matrix" and the entire geometric content
of "this transformation behaves consistently under combination and
scaling" are, provably, the same fact, looked at from two different
directions. This is the actual bridge this lesson's own title promises:
algebra (the two properties) and geometry (what a matrix visibly does to
shapes) are not two separate things that happen to agree — they are one
thing, described twice.

Also recognized in: doubling a recipe's every ingredient producing
exactly double the final dish's own quantity, never a disproportionate
change; a currency exchange applying the identical rate regardless of
how large the amount being converted is; a physical spring's force
(within its elastic range) scaling directly with how far it's
stretched, the defining linear relationship Hooke's law describes.

### SE Lens

The alternative — a transformation that satisfies additivity but not
homogeneity, or the reverse — is a real, meaningful category, distinct
from linear, and genuinely does occur in practice (many real-world
relationships are additive over small ranges but saturate or distort at
large scale, failing homogeneity specifically). Checking both
properties independently, as this lesson's first two units did
separately rather than assuming one implies the other, is what actually
earns the word "linear" — a transformation is not linear because it
"seems well-behaved," it is linear because it provably satisfies two
specific, checkable algebraic conditions, together, without exception.

---

## Concept Unit: Translation Is Not Linear

### The Problem

Lesson 231's `translate-point` is one of the most natural, useful
operations this whole section has built — shifting every point by a
fixed offset. Given how central it's been, does it satisfy the same two
properties `rotate90` just proved it has?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because linear transformations are a mathematical concept
  this curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn translate-vector [v]
  (vector-add v offset))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def offset (make-vector 5 5))
#'user/offset
user=> (def t-sum (translate-vector (vector-add v1 v2)))
#'user/t-sum
user=> t-sum
[6 6]
user=> (def sum-t (vector-add (translate-vector v1) (translate-vector v2)))
#'user/sum-t
user=> sum-t
[11 11]
user=> (= t-sum sum-t)
false
```

```
user=> (def t-scale (translate-vector (vector-scale v1 2)))
#'user/t-scale
user=> t-scale
[7 5]
user=> (def scale-t (vector-scale (translate-vector v1) 2))
#'user/scale-t
user=> scale-t
[12 10]
user=> (= t-scale scale-t)
false
```

### Mechanical Walkthrough

`(defn translate-vector [v] (vector-add v offset))` — `vector-add`,
reappearing, adds a *fixed* offset, `[5, 5]`, to whatever vector it's
given — the same operation Lesson 231's `translate-point` performed on
a point, now applied to a plain vector for a clean, apples-to-apples
comparison against Units 1 and 2's own transformations.

Trace additivity: `t-sum` — `translate-vector` applied to `(vector-add
v1 v2) = [1, 1]` — is `[1+5, 1+5] = [6, 6]`. `sum-t` — `translate-
vector` applied to `v1` and `v2` *separately* (`[6, 5]` and `[5, 6]`),
then added together — is `[11, 11]`. `(= t-sum sum-t)` is `false` —
genuinely, provably unequal. The offset got added *twice* in `sum-t`
(once per separate translation) but only *once* in `t-sum` — additivity
fails specifically because translation adds a constant, and adding a
constant to two things separately double-counts it compared to adding
it once to their sum.

Trace homogeneity: `t-scale` — `translate-vector` applied to `(vector-
scale v1 2) = [2, 0]` — is `[7, 5]`. `scale-t` — `translate-vector`
applied to `v1` first (`[6, 5]`), then scaled by `2` — is `[12, 10]`.
`(= t-scale scale-t)` is `false` — the offset gets scaled along with
the vector in `scale-t` (since it's added *before* scaling), but stays
fixed, unscaled, in `t-scale` — two genuinely different results.

### CS Lens

Translation is a real, standard example of an **affine transformation**:
a linear transformation (here, the identity — do nothing) *plus* a
fixed shift. It fails to be linear for exactly the reason Unit 1 and
Unit 2's own checks now make concrete: a linear transformation, by both
its defining properties, must send the zero vector to itself (`T(0) =
T(0 * v) = 0 * T(v) = 0`, directly from homogeneity) — but
`translate-vector` sends `[0, 0]` to `[5, 5]`, not to `[0, 0]` at all,
disqualifying it immediately. **This is the deep, real reason Lesson
231 insisted on treating points and vectors as genuinely different
kinds of thing from its very first unit**: `translate-point` moves a
*location*, and locations are allowed to be affected by a fixed shift —
but a *vector*, a pure displacement, is specifically defined by
`vector-from-points`' own translation-invariance (Lesson 232's own
central proof) — and a transformation that isn't itself translation-
invariant in this algebraic sense cannot be represented as a matrix at
all, only as a matrix *plus* a separate additive shift.

Also recognized in: converting Celsius to Fahrenheit, `F = 1.8*C + 32`,
which is affine, not linear — doubling a Celsius temperature does not
double the Fahrenheit reading, precisely because of the added `32`; a
taxi fare with a fixed base charge plus a per-mile rate, where doubling
the distance does not double the total fare because the fixed charge
doesn't scale; a thermostat's setpoint offset, added once regardless of
how large or small the measured temperature swing actually is.

### SE Lens

The alternative — treating "linear" loosely, as a vague synonym for
"simple" or "well-behaved," and lumping translation in with rotation
and scaling as though they were all the same kind of thing — is exactly
the imprecision this unit's own concrete counterexample closes off.
Real graphics and physics systems handle this distinction explicitly:
representing a translation *and* a linear transformation together
requires an extra trick (an added dimension, letting an affine shift be
folded into a slightly larger matrix — a real technique, out of this
lesson's own scope, the same kind of honest boundary Lesson 219 drew
around wait-free structures) specifically *because* translation alone
can never be captured by an ordinary matrix, no matter how the matrix's
own numbers are chosen — proven here, concretely, rather than left as
an unexplained rule to memorize.

---

## Connect the Pieces

Follow vectors `v1 = [1, 0]` and `v2 = [0, 1]` through every check built
in this lesson, under two genuinely different transformations. Under
`rotate90` — a real matrix, built in Lesson 234 — both additivity (Unit
1: `[-1, 1]` computed two different ways, exactly matching) and
homogeneity (Unit 2: `[0, 3]` computed two different ways, exactly
matching) hold perfectly, confirming what every earlier lesson in this
section implicitly relied on but never stated as a formal, checkable
definition. Under `translate-vector` — the exact same operation Lesson
231's own `translate-point` performs, just applied to a vector instead
of a point — both properties fail, concretely and provably: summing
first gives `[6, 6]`, translating separately and summing gives `[11,
11]`; scaling first gives `[7, 5]`, translating first and scaling gives
`[12, 10]`. The single algebraic fact underlying every one of these
results is where a transformation sends the zero vector — `rotate90`
sends it to itself, satisfying homogeneity's own strongest implication
directly; `translate-vector` sends it to `[5, 5]`, disqualifying it
immediately. Two functions, structurally almost identical (both just
call `vector-add` or `matrix-vector-multiply` once), and one genuinely
deep algebraic distinction — linear versus merely affine — separating
them completely.

## What Breaks Without This

Assume, without checking, that any transformation built from this
section's own `vector-add` and `vector-scale` must automatically be
linear, and use that unchecked assumption to justify decomposing a
translated shape's motion the way Unit 1 decomposed a rotation:

```clojure
(defn decompose-and-recombine [v1 v2]
  (vector-add (translate-vector v1) (translate-vector v2)))
```

```
user=> (decompose-and-recombine v1 v2)
[11 11]
user=> (translate-vector (vector-add v1 v2))
[6 6]
```

A system that translated two objects "separately" and then combined
the results — a plausible-looking shortcut, exactly the kind of
decomposition that's completely safe for a genuinely linear
transformation like `rotate90` — produces `[11, 11]` here, while the
*actually correct* combined translation is `[6, 6]`. Nothing about
either function call raises an error; both run and return a real,
usable-looking vector. Only checking additivity directly, as Unit 3
did, reveals that this specific shortcut is safe for rotation and
genuinely unsafe for translation — the same operation is not
interchangeably safe across every transformation, and assuming
otherwise produces silently wrong geometry.

## Exercises

1. Confirm `scale2-matrix` from Lesson 234 (uniform scaling by `2`)
   satisfies both additivity and homogeneity, using the same
   side-by-side comparison technique this lesson built.
2. Build a transformation that squares a vector's own `x` component
   (`dx' = dx * dx`, `dy' = dy`) and confirm it fails homogeneity —
   compute `T(2*v)` and `2*T(v)` for some real `v` and show they
   differ, then explain in one sentence why squaring, specifically,
   can never satisfy homogeneity for any nonzero scalar other than `1`.
3. Confirm directly that `translate-vector` sends the zero vector,
   `[0, 0]`, to `[5, 5]`, and use that single fact alone (without
   redoing the full additivity or homogeneity checks) to explain why it
   was already guaranteed to fail at least one of the two properties.

## Definition of Done

- [ ] `translate-vector` defined and run in a live `bb` REPL, alongside
      `matrix-vector-multiply`, `vector-add`, and `vector-scale` reused
      from earlier lessons, matching every transcript shown above
      exactly.
- [ ] Unit 1's additivity check reproduced for `rotate90`, confirmed
      `true`.
- [ ] Unit 2's homogeneity check reproduced for `rotate90`, confirmed
      `true`.
- [ ] Unit 3's two checks reproduced for `translate-vector`, both
      confirmed `false`.
- [ ] Exercise 3 completed, connecting the zero-vector test directly to
      why translation must fail linearity.
- [ ] `git commit -m "Add Lesson 236: additivity and homogeneity define
      linear transformation, verified for rotation and proven to fail
      for translation"`
