# Lesson 237: Change of Basis — Coordinate Systems and Representations

**What you will build**: The other half of what makes a coordinate
system a genuine *choice*, not a fact: not just where the origin sits
(Lesson 231), but which two directions get to count as "one full step."
It makes the **standard basis** — silently assumed every time this
curriculum has written `[dx, dy]` — explicit for the first time, builds
a genuinely different basis, and proves the conversion between them is
exactly Lesson 234's own matrix-vector multiplication, its matrix's
columns being nothing more than the new basis vectors themselves. It
closes by combining a shifted origin with a changed basis on the same
point, producing a third, equally valid coordinate description of one
unchanged real location.

**What you need to know first**: Lesson 231's `translate-point` and the
proof that a point's coordinates depend on a chosen origin. Lesson
234's `matrix-vector-multiply` — this lesson's entire connection between
"a different basis" and "a matrix" is built on it directly. Lesson
236's proof that translation is not linear while matrix-vector
multiplication always is, reused directly as the reason these two kinds
of coordinate relativity behave so differently.

**Terms used in this lesson**:

- **basis** — a chosen pair of independent reference vectors that every
  other vector's own components are measured against; "how far in this
  direction, how far in that direction," where "this direction" and
  "that direction" are themselves a deliberate choice, not a given fact.
- **standard basis** — the specific, default choice of basis, `[1, 0]`
  and `[0, 1]`, silently assumed every time this curriculum has written
  a vector as `[dx, dy]`, until named explicitly here for the first
  time.
- **change of basis** — re-expressing the same vector's components
  relative to a different pair of reference directions; the vector
  itself doesn't change, only the numbers describing it — the same
  underlying idea as translation changing a point's numbers without
  moving the point, applied to directions instead of position.
- **basis matrix** — a matrix whose columns are exactly a chosen
  basis's own two vectors, expressed in standard coordinates; converts a
  vector's basis-relative coordinates back into standard coordinates via
  ordinary matrix-vector multiplication.

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`vector-add`** / **`vector-scale`** / **`matrix-vector-multiply`**
  - *What they are:* reused unchanged from Lessons 233 and 234.
  - *Implementation:* `vector-add` and `vector-scale` combine and
    resize vectors component-wise; `matrix-vector-multiply` applies a
    matrix's transformation to a vector.
  - *Their use:* `vector-add`/`vector-scale` directly express "this many
    units of this direction, that many units of that direction";
    `matrix-vector-multiply` is proven to compute the identical result
    through a basis matrix.

---

## Concept Unit: The Standard Basis, Made Explicit

### The Problem

Every vector this section has built has been written as `[dx, dy]` —
but that notation silently means something specific: `dx` units in
*one* particular direction, plus `dy` units in *another* particular
direction. Which two directions those actually are has never been
stated out loud. Is that choice arbitrary, and if so, can it be made
explicit and checked?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because coordinate representation is a mathematical concept
  this curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

No new function — this unit reuses `vector-add` and `vector-scale`,
both completely unchanged. What's new is naming what they've been doing
implicitly this entire time.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def e1 (make-vector 1 0))
#'user/e1
user=> (def e2 (make-vector 0 1))
#'user/e2
user=> (def v (make-vector 3 4))
#'user/v
user=> (def v-decomposed (vector-add (vector-scale e1 3) (vector-scale e2 4)))
#'user/v-decomposed
user=> v-decomposed
[3 4]
user=> (= v v-decomposed)
true
```

### Mechanical Walkthrough

`e1 = [1, 0]` and `e2 = [0, 1]` — two specific vectors, each one unit
long, pointing along the two axes this curriculum has used since Lesson
231 without ever naming them as a deliberate pair.

`(vector-scale e1 3)` — `vector-scale`, reappearing from Lesson 233 —
stretches `e1` to `[3, 0]`: "three units in the `e1` direction."
`(vector-scale e2 4)` stretches `e2` to `[0, 4]`: "four units in the
`e2` direction." `vector-add`, reappearing, combines them into `[3, 4]`.

`(= v v-decomposed)` is `true` — writing `v` as `[3, 4]` and writing it
as "three units of `e1` plus four units of `e2`" are, provably, the
exact same thing. This is what `[3, 4]` has genuinely meant, in full,
every single time it's appeared in this curriculum since Lesson 232.

### CS Lens

`e1` and `e2` together are a **basis**: a pair of reference directions
every vector's own components are measured against. Calling this the
**standard basis** signals directly that it's a *choice*, one this
curriculum happened to make silently and consistently — not a fact
about vectors themselves, the same way Lesson 231's origin was a
genuine, arbitrary choice rather than a fact about points. `dx` and
`dy` have never been "the vector's own numbers" in any absolute
sense — they've always been "how many `e1`s and how many `e2`s,"
specifically.

Also recognized in: a recipe's "cups" and "teaspoons," an arbitrary but
consistent choice of measurement units that every quantity in the
recipe gets expressed against; a musical scale's chosen root note,
against which every other note's own name (a third, a fifth) is
defined relative to, not absolutely; a map's chosen "north," an
arbitrary convention every direction on that map is described relative
to.

### SE Lens

The alternative — never naming the standard basis explicitly, treating
`[dx, dy]` as simply "the vector's numbers" with no acknowledgment that
a choice was ever made — worked completely fine for every earlier
lesson in this section, because the choice never changed. The real
value of naming it now, before it's ever varied: once a *different*
basis is introduced in the next unit, a reader who never realized the
standard basis was a choice at all would have no framework for
understanding what's actually changing.

---

## Concept Unit: A Different Basis

### The Problem

If `e1` and `e2` were replaced by two *different* reference directions —
say, two diagonal ones instead of the horizontal and vertical — could a
vector still be described the same way, as "this many of the first
direction, that many of the second"? And would the resulting standard
`[dx, dy]` coordinates come out the same, or genuinely different?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because coordinate representation is a mathematical concept
  this curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn from-basis-coords [b1 b2 c1 c2]
  (vector-add (vector-scale b1 c1) (vector-scale b2 c2)))

(defn make-basis-matrix [b1 b2]
  (make-matrix (make-vector (vector-dx b1) (vector-dx b2)) (make-vector (vector-dy b1) (vector-dy b2))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def b1 (make-vector 1 1))
#'user/b1
user=> (def b2 (make-vector 1 -1))
#'user/b2
user=> (def result-direct (from-basis-coords b1 b2 2 1))
#'user/result-direct
user=> result-direct
[3 1]
```

Now build the basis matrix and confirm it computes the identical
result:

```
user=> (def basis-matrix (make-basis-matrix b1 b2))
#'user/basis-matrix
user=> basis-matrix
[[1 1] [1 -1]]
user=> (def result-via-matrix (matrix-vector-multiply basis-matrix (make-vector 2 1)))
#'user/result-via-matrix
user=> result-via-matrix
[3 1]
user=> (= result-direct result-via-matrix)
true
```

### Mechanical Walkthrough

`b1 = [1, 1]` and `b2 = [1, -1]` — two new reference directions, both
diagonal, genuinely different from `e1`/`e2`.

`(defn from-basis-coords [b1 b2 c1 c2] ...)` — the exact same shape as
Unit 1's own decomposition, generalized: `c1` units of `b1`, `c2` units
of `b2`, combined via `vector-scale` and `vector-add`, both reappearing.
`(from-basis-coords b1 b2 2 1)` — "two units of `b1`, one unit of
`b2`" — computes `vector-scale(b1, 2) = [2, 2]`, `vector-scale(b2, 1) =
[1, -1]`, and their sum: `[3, 1]`. A vector described entirely in terms
of `b1` and `b2` has real, standard `[dx, dy]` coordinates, `[3, 1]`,
same as any other vector — it's still a genuine vector, just described
using different reference directions.

`(defn make-basis-matrix [b1 b2] ...)` — builds a matrix whose *rows*
are `[b1's x, b2's x]` and `[b1's y, b2's y]` — which means its
*columns*, read the other way, are `b1` itself and `b2` itself. `(make-
basis-matrix b1 b2)` produces `[[1, 1], [1, -1]]`.

`(matrix-vector-multiply basis-matrix (make-vector 2 1))` — applying
this matrix directly to the coordinate pair `[2, 1]` (not to `b1` or
`b2` themselves, but to the *coordinates* `2` and `1`) — produces `[3,
1]`, exactly matching `from-basis-coords`'s own direct computation.

### CS Lens

Converting basis-relative coordinates into standard coordinates *is*
matrix-vector multiplication, with the matrix's own columns being
nothing more than the chosen basis vectors themselves — this isn't an
analogy, it's the same computation, proven identical here the same way
Lesson 235's `matrix-multiply` was proven identical to chained
transformation. This is also, quietly, a second proof of Lesson 236's
own point: because `from-basis-coords` is exactly a matrix-vector
multiplication, it is automatically a **linear transformation** in its
own coordinates `c1` and `c2` — doubling `c1` doubles that component's
own contribution, adding two coordinate pairs adds their resulting
vectors — the identical additivity and homogeneity Lesson 236 proved
for `rotate90`, now shown to hold for basis conversion too, for the
same underlying reason: it's built from the same operation.

Also recognized in: converting a recipe measured in "parts" (two parts
flour, one part sugar) into actual grams, once the real weight of "one
part" is fixed; translating a color specified as "this much red
component, that much blue component" into a different, non-standard
color model with its own two reference colors; converting a position
described in a video game's own local coordinate system (relative to a
moving platform) into the game world's fixed global coordinates.

### SE Lens

The alternative — treating "a different basis" and "a matrix
transformation" as two unrelated ideas, taught separately with separate
machinery — would miss the actual point this unit exists to make: they
are the same idea, and recognizing that means every tool already built
for matrices (composition via `matrix-multiply`, the linearity proof
from Lesson 236) applies to basis conversion automatically, with
nothing new to build or separately verify. The cost of *not* making
this connection explicit: a reader might learn "change of basis" as an
entirely separate topic from "matrices," duplicating effort that a
single, correctly-drawn connection eliminates entirely.

---

## Concept Unit: Combining a Shifted Origin With a Changed Basis

### The Problem

Lesson 231 showed a point's coordinates change under a shifted origin.
This lesson has shown a vector's coordinates change under a changed
basis. Are these the same kind of change wearing different names, or
can both be applied to the same point at once, producing a third,
independently different coordinate description?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because coordinate representation is a mathematical concept
  this curriculum is deriving directly, not porting from any external
  reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

No new function — this unit reuses `translate-point` (Lesson 231) and
`from-basis-coords`, completely unchanged. What's new is applying both,
in sequence, to the same starting point.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def p (make-point 5 3))
#'user/p
user=> (def p-shifted (translate-point p 2 2))
#'user/p-shifted
user=> p-shifted
[3 1]
user=> (def p-in-new-basis (from-basis-coords b1 b2 2 1))
#'user/p-in-new-basis
user=> p-in-new-basis
[3 1]
user=> (= p-shifted p-in-new-basis)
true
```

### Mechanical Walkthrough

`p = [5, 3]` — an ordinary point, relative to the original origin and
the standard basis. `(translate-point p 2 2)` — Lesson 231's own
function, reappearing unchanged — shifts the origin, producing `p-
shifted = [3, 1]`: `p`'s coordinates relative to a new origin at `(2,
2)`, still expressed against the standard basis.

`(from-basis-coords b1 b2 2 1)` — this unit's own function, called
completely independently — happens to produce the *identical* `[3,
1]`. This is not a coincidence built into the numbers by accident: it
demonstrates that `[3, 1]` itself, as a bare pair of numbers, is
genuinely ambiguous without stating *which* coordinate system produced
it — the same `[3, 1]` correctly describes "point `p`, relative to a
shifted origin, still in the standard basis" *and* "the vector reached
by `2` units of `b1` plus `1` unit of `b2`, relative to the original
origin" — two completely different real geometric facts, expressed by
identical numbers, distinguishable only by knowing which coordinate
system is actually in use.

### CS Lens

Origin and basis are **independent choices** — changing one says
nothing about the other, and either can be fixed while the other
varies. This is the real, complete content of a **coordinate system**:
an origin (Lesson 231, an additive choice, tied to points, not
vectors) and a basis (this lesson, a linear choice, tied to how vectors
themselves are decomposed) — two genuinely separate decisions, and this
unit's own coincidental numeric match is exactly the danger of treating
raw coordinates as meaningful without also stating, explicitly, which
of these two choices — or both — produced them.

Also recognized in: a shipping address requiring *both* a specific
building (the "origin," fixed once) *and* a specific floor-and-room
numbering convention (the "basis," which could differ building to
building) before a room number alone means anything; a scientific
measurement requiring both a reference zero-point *and* a choice of
units, two genuinely separate calibration decisions; a video's
timestamp requiring both a start time (an origin) and a choice of
units (seconds versus frames, a "basis" for measuring duration).

### SE Lens

The alternative — never distinguishing which coordinate change is in
play, treating any observed difference in a point's or vector's numbers
as "the coordinate system changed" without specifying how — is exactly
what this unit's own coincidental match makes concretely dangerous: two
completely different real transformations produced numerically
identical output here, and only tracking origin and basis as separate,
named, independently-changeable choices (as this whole lesson has
insisted on) keeps that ambiguity from becoming a genuine, undetectable
source of error in any system built on top of this material.

---

## Connect the Pieces

Follow the number pair `[3, 1]` through every unit built in this
lesson, watching it mean two genuinely different things. Unit 1
establishes, explicitly, that every vector's `[dx, dy]` has always
meant "this many `e1`s, that many `e2`s" — the standard basis, named
for the first time rather than silently assumed. Unit 2 replaces that
basis with `b1`/`b2` and proves, via `make-basis-matrix`, that
converting basis-relative coordinates into standard ones is exactly
Lesson 234's own matrix-vector multiplication — `from-basis-coords(b1,
b2, 2, 1)` and `matrix-vector-multiply(basis-matrix, [2, 1])` both
producing the identical `[3, 1]`. Unit 3 then shows that same `[3, 1]`
arising from a *completely unrelated* computation — `translate-point`
shifting an entirely different point's origin — proving that origin and
basis are independent axes of coordinate relativity, and that a bare
number pair, without knowing which (or both) produced it, doesn't
actually specify a location or a displacement at all on its own.

## What Breaks Without This

Assume a vector's `[dx, dy]` coordinates are always relative to the
standard basis, without ever checking, and use that unchecked
assumption to combine a `b1`/`b2`-basis result directly with an
ordinary standard-basis vector:

```clojure
(defn combine-assuming-standard-basis [basis-coords standard-vector]
  (vector-add basis-coords standard-vector))
```

```
user=> (combine-assuming-standard-basis (make-vector 2 1) v)
[5 5]
```

`(make-vector 2 1)` here actually meant "`2` units of `b1`, `1` unit of
`b2`" — real standard coordinates `[3, 1]`, not `[2, 1]` at all. Adding
it directly to `v = [3, 4]` as though `[2, 1]` were already standard
coordinates produces `[5, 5]` — a plausible-looking vector that
corresponds to no real, correctly-computed geometric fact. The correct
combination would first convert `[2, 1]` through `from-basis-coords`
into its real standard value, `[3, 1]`, *then* add — `[3, 1] + [3, 4] =
[6, 5]`, a genuinely different, correct answer. Nothing about Clojure
itself, or either function's own code, signals that a basis mismatch
occurred; only knowing, explicitly, which coordinate system a given
number pair actually belongs to prevents this.

## Exercises

1. Build a third basis, `b3 = [2, 0]` and `b4 = [0, 3]` (a non-uniform
   rescaling of the standard axes, not diagonal), and confirm `(from-
   basis-coords b3 b4 1 1)` produces `[2, 3]` — one unit of each new
   basis vector, correctly stretched.
2. Confirm `make-basis-matrix` applied to the *standard* basis itself
   (`e1`, `e2`) produces the identity matrix from Lesson 234, and
   explain in one sentence why that has to be true given what an
   identity matrix's own transformation does.
3. Using `p-shifted` and `p-in-new-basis`'s own coincidental match from
   Unit 3, construct a *second* pair of inputs (a different point and
   offset, a different basis and coordinate pair) that also happen to
   produce matching numbers, and state which two real, different
   geometric facts they each actually represent.

## Definition of Done

- [ ] `from-basis-coords` and `make-basis-matrix` both defined and run
      in a live `bb` REPL, alongside `vector-add`, `vector-scale`, and
      `matrix-vector-multiply` reused from earlier lessons, matching
      every transcript shown above exactly.
- [ ] Unit 1's standard-basis decomposition reproduced.
- [ ] Unit 2's basis-matrix equivalence reproduced, with `=` confirming
      `from-basis-coords` and `matrix-vector-multiply` agree exactly.
- [ ] Unit 3's coincidental-match demonstration reproduced, with a
      one-sentence explanation of the two different real facts `[3, 1]`
      represents in each case.
- [ ] Exercise 2 completed, confirming the standard basis's own matrix
      is the identity.
- [ ] `git commit -m "Add Lesson 237: change of basis as the second,
      independent axis of coordinate relativity, proven identical to
      matrix-vector multiplication"`
