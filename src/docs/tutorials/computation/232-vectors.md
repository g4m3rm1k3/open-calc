# Lesson 232: Vectors — Mathematical and Computational Objects

**What you will build**: A vector — the mathematical, geometric kind: a
pure displacement, "how far and which way," with no location of its own
at all — computed as the difference between two of Lesson 231's own
points. It proves, directly, that a vector's own components stay
completely unchanged under exactly the same origin-shift that changes a
point's coordinates entirely, and closes by deriving vector magnitude as
the same computation Lesson 231's `point-distance` already performed,
now reframed as a property of one displacement rather than a
relationship between two locations.

**A genuine terminology collision, named up front**: this curriculum has
used the word "vector" constantly since Lesson 84 — Clojure's own
`[...]` ordered-collection type. That is a **data structure**. This
lesson's "vector" is a **mathematical object**: a displacement with a
direction and a magnitude. The two are related only in that this lesson
happens to *represent* the mathematical kind using the data-structure
kind — the exact same relationship Lesson 231's points already had to
Clojure vectors, and Lesson 214's `[value next]` pairs before that.
Every other lesson in this curriculum that used the word "vector" meant
the Clojure type; from here on, watch context carefully — this lesson
and the rest of this section mean the geometric kind unless said
otherwise.

**What you need to know first**: Lesson 231's `make-point`, `point-x`,
`point-y`, `translate-point`, and its own proof that a point's
coordinates are relative to a chosen origin and change under
translation. Lesson 231's `Math/sqrt`, reused directly for magnitude.

**Terms used in this lesson**:

- **vector** (the mathematical kind, not the Clojure `[...]` type) — a
  displacement: a specific direction and distance, with no location of
  its own; exists to answer "how far and which way," a genuinely
  different question than a point's "where."
- **component** — one of a vector's own numbers — its horizontal part,
  its vertical part — describing how much displacement happens along one
  specific axis; a vector's actual data, the same way a point's
  coordinates are its data.
- **magnitude** — the length of a vector: a single non-negative real
  number describing how large the displacement is, independent of which
  direction it points; the vector analogue of Lesson 231's point-to-
  point distance.

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
  - *Its use:* reading a vector's own components, and a point's own
    coordinates, back out of their `[...]` pairs.
- **`-`** / **`+`** / **`*`**
  - *What they are:* Clojure's subtraction, addition, and
    multiplication functions.
  - *Implementation:* `(- a b)`, `(+ a b)`, `(* a b)` return the
    difference, sum, and product.
  - *Their use:* `-` computes a vector's own components from two
    points; `*` squares a component; `+` sums the squared components.
- **`Math/sqrt`**
  - *What it is:* the static square-root method on Java's `Math` class,
    reused unchanged from Lesson 231.
  - *Implementation:* `(Math/sqrt x)` returns the non-negative real
    square root of `x` as a floating-point value.
  - *Its use:* converting a vector's exact squared magnitude into its
    real, possibly irrational, actual length.

---

## Concept Unit: A Vector Is a Displacement, Not a Location

### The Problem

Lesson 231's points are each tied to a specific location, relative to
whatever origin happens to be current. But often the actual question
being asked isn't "where is this" — it's "how far, and in which
direction, from one place to another." That question doesn't seem to
need a specific location at all — the answer to "3 blocks north, 2
blocks east" is the same instruction regardless of which corner someone
happens to be standing on when they hear it. How does a quantity like
that get represented, genuinely differently from a point?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because vectors are a mathematical concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn make-vector [dx dy]
  [dx dy])

(defn vector-dx [v] (get v 0))
(defn vector-dy [v] (get v 1))

(defn vector-from-points [p1 p2]
  (make-vector (- (point-x p2) (point-x p1)) (- (point-y p2) (point-y p1))))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Run It — Real Output

```
user=> (def p1 (make-point 0 0))
#'user/p1
user=> (def p2 (make-point 3 4))
#'user/p2
user=> (def v (vector-from-points p1 p2))
#'user/v
user=> v
[3 4]
```

### Mechanical Walkthrough

`(defn make-vector [dx dy] [dx dy])` — `defn`, reappearing. The body is
a plain two-element vector — the same Clojure-vector-as-pair
representation Lesson 231's `make-point` used, holding genuinely
different data: not a location, but a `dx`/`dy` pair of *changes* along
each axis.

`(defn vector-dx [v] (get v 0))` / `(defn vector-dy [v] (get v 1))` —
`get`, reappearing, two small accessors, deliberately named differently
from Lesson 231's `point-x`/`point-y` even though the underlying access
pattern is identical — the names exist specifically to keep "a
component of a displacement" and "a coordinate of a location" from
being silently confused for each other in later code.

`(defn vector-from-points [p1 p2] ...)` — `-`, reappearing, twice:
`(- (point-x p2) (point-x p1))` computes how much `x` changes going
*from* `p1` *to* `p2`; the identical shape for `y`. `point-x` and
`point-y`, reappearing unchanged from Lesson 231, read each point's own
coordinates first.

Trace: `p1` is `[0 0]`, `p2` is `[3 4]`. `(vector-from-points p1 p2)`
computes `dx = 3 - 0 = 3` and `dy = 4 - 0 = 4`, producing `v = [3 4]`.
Notice this vector holds exactly the two intermediate numbers Lesson
231's own `point-distance-squared` already computed internally, as
`(- (point-x p2) (point-x p1))` and `(- (point-y p2) (point-y p1))` —
that lesson computed a vector's own components the entire time, without
ever naming what it was building.

### CS Lens

A vector, mathematically, is defined by exactly two properties — a
magnitude and a direction — and *nothing else*; critically, it has no
position. `v = [3 4]` describes "3 right, 4 up" as a pure instruction,
equally applicable starting from `(0, 0)`, from `(100, 100)`, or from
anywhere at all. This is the real, substantive difference from a point,
which is defined by *where* it is and nothing else. The two are related
by exactly the operation `vector-from-points` performs: subtracting one
point from another produces the displacement between them — a point
minus a point is a vector, never another point.

Also recognized in: a recipe instruction like "add two more cups of
flour," meaningful the same way regardless of how much flour is already
in the bowl; a compass bearing and distance ("go northeast for `2`
miles"), giving an instruction independent of the traveler's current
location; a musical interval (a major third, a perfect fifth),
describing a relationship between two notes that sounds identical no
matter which specific note it starts from.

### SE Lens

The alternative — never distinguishing a displacement from a location,
representing both as a bare `[a b]` pair with no further context — is
exactly what this lesson deliberately avoids by giving vectors their own
named accessors, `vector-dx`/`vector-dy`, distinct from Lesson 231's
`point-x`/`point-y`. Nothing about Clojure itself would ever catch
passing a point where a vector was expected, or the reverse — both are
identically-shaped two-element vectors underneath. The real cost of
*not* naming this distinction explicitly: a later function that
silently treats a location as though it were a direction (or the
reverse) would produce a plausible-looking wrong number with no error
anywhere, the same class of silent bug this curriculum has now met
several times under different names (Lesson 227's ambiguous `-1`,
Lesson 231's own translation-confusion risk).

---

## Concept Unit: Vectors Are Translation-Invariant — Unlike Points

### The Problem

Lesson 231 proved, directly, that a point's own coordinates genuinely
change under a shifted origin. `v`, built from two points' coordinates,
was computed relative to *some* origin — does `v` itself change if that
origin shifts, the same way each individual point's coordinates did?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because vectors are a mathematical concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

No new function — this unit reuses Lesson 231's `translate-point` and
this lesson's own `vector-from-points`, both completely unchanged. What's
new is the comparison: computing the same vector from the original
points, and again from the translated points.

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (def p1t (translate-point p1 10 -7))
#'user/p1t
user=> (def p2t (translate-point p2 10 -7))
#'user/p2t
user=> p1t
[-10 7]
user=> p2t
[-7 11]
user=> (def vt (vector-from-points p1t p2t))
#'user/vt
user=> vt
[3 4]
user=> (= v vt)
true
```

### Mechanical Walkthrough

`(translate-point p1 10 -7)` and `(translate-point p2 10 -7)` —
`translate-point`, reappearing from Lesson 231 unchanged, shift both
points' coordinates by the identical offset: `p1t` becomes `[-10 7]`,
`p2t` becomes `[-7 11]` — both genuinely different numbers from `p1`
and `p2`.

`(vector-from-points p1t p2t)` — the identical function from Unit 1,
called on the *translated* points: `dx = -7 - (-10) = 3`, `dy = 11 - 7
= 4`. `vt` is `[3 4]` — `(= v vt)` is `true`. The vector's own
components are *exactly* unchanged, digit for digit, even though
neither underlying point's coordinates are.

### CS Lens

A vector is **translation-invariant** by construction — restated here
as a real property, exactly as Lesson 231's Unit 2 first proved
distance-squared to be, and for the identical algebraic reason: a
vector's components are always a *difference* between two coordinates,
and both of those coordinates receive the same additive shift under a
translation, which subtraction always cancels out perfectly, `(a + k) -
(b + k) = a - b`, regardless of what `k` is. This is the deepest,
cleanest statement of the point-versus-vector distinction this whole
section is built on: a point answers a question ("where") whose answer
depends on the coordinate system; a vector answers a question ("how far
and which way between these two things") whose answer does not, and
never will, no matter how the coordinate system is chosen.

Also recognized in: the *change* in temperature over a day being
identical whether measured in Celsius or Fahrenheit, even though the
starting and ending temperatures themselves look completely different
in each; a race's finish time, unaffected by which time zone the
stopwatch happens to be set to, even though the clock-on-the-wall start
and end times would read completely differently in each zone; the
slope of a hill, the same physical steepness regardless of which point
along it someone chooses to call "the bottom."

### SE Lens

The alternative — never actually proving translation-invariance,
trusting it by intuition alone — risks exactly the kind of silent
error this curriculum keeps returning to: a system that quietly assumes
a vector-like quantity is safe to reuse across two different coordinate
systems without checking whether it's actually a vector (translation-
invariant) or actually a point (translation-dependent) in the first
place. The real payoff of building `vector-from-points` and proving this
concretely, rather than only asserting it: any later lesson that needs
"a displacement that behaves correctly no matter which origin is
current" now has a real, verified building block, not a hopeful
assumption.

---

## Concept Unit: Vector Magnitude

### The Problem

`v = [3 4]` describes a direction and a size, but neither number alone
says "how big" the whole displacement actually is — `3` and `4` are
only its two separate parts along each axis. Given only a vector's
components, with no two points to fall back on, how is its actual
overall length computed?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because vectors are a mathematical concept this curriculum is
  deriving directly, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn vector-magnitude-squared [v]
  (+ (* (vector-dx v) (vector-dx v)) (* (vector-dy v) (vector-dy v))))

(defn vector-magnitude [v]
  (Math/sqrt (vector-magnitude-squared v)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session.

### Run It — Real Output

```
user=> (vector-magnitude-squared v)
25
user=> (vector-magnitude v)
5.0
```

### Mechanical Walkthrough

`(defn vector-magnitude-squared [v] ...)` — `vector-dx` and
`vector-dy`, both reappearing, read the vector's own two components;
`*`, reappearing, squares each one; `+`, reappearing, sums them. This
is *exactly* Lesson 231's `point-distance-squared`, with every
`point-x`/`point-y` call and coordinate subtraction already folded into
`v`'s own components ahead of time, rather than recomputed here.

`(defn vector-magnitude [v] (Math/sqrt (vector-magnitude-squared v)))`
— `Math/sqrt`, reappearing unchanged from Lesson 231, converts the exact
squared magnitude into the real, floating-point length.

Trace: `v` is `[3 4]`. `vector-magnitude-squared` computes `3² + 4² =
9 + 16 = 25`. `vector-magnitude` computes `(Math/sqrt 25) = 5.0` —
exactly the value `(point-distance p1 p2)` already produced back in
Lesson 231, because `v` *is* the displacement from `p1` to `p2`, and a
vector's magnitude *is* the distance between the two points it was
built from — the same real number, reached two different ways.

### CS Lens

This is the same underlying computation as Lesson 231's `point-distance`
— literally the identical formula — reframed from "the distance between
two points" to "the length of one displacement." The equality is exact,
not approximate: `(point-distance p1 p2)` equals `(vector-magnitude
(vector-from-points p1 p2))`, always, for any two points, because both
expressions reduce to the same sum-of-squared-differences under
`Math/sqrt`. Recognizing that two seemingly different questions ("how
far apart are these points" and "how long is this displacement")
collapse to one underlying computation is a real, recurring skill this
curriculum has built before — Lesson 217's `test-and-set` and `compare-
and-swap` were shown to share a structural kinship the same way.

Also recognized in: "how much did the price change" and "what's the
size of this price gap" being the same computation asked two different
ways; a car's odometer reading a trip's distance the same way whether
described as "how far did I travel" or "what's the length of the path I
drove"; a physicist computing kinetic energy from a velocity vector's
own magnitude, the identical square-root-of-sum-of-squares shape,
regardless of which two positions and times the velocity was originally
derived from.

### SE Lens

The alternative — always computing distance directly from two points,
the way Lesson 231 did, and never building a standalone vector
abstraction at all — works, but forces every later computation that
only cares about a direction-and-size (not the two specific points it
came from) to keep carrying both points around unnecessarily. Building
`vector-magnitude` to operate on `v` alone, with no reference to `p1` or
`p2` at all, is what makes a vector genuinely reusable as its own
independent object — the same shift from "compute this from scratch
every time" to "build the value once, reuse it everywhere" this
curriculum has made deliberately before (Lesson 219's `nodes` and `head`
outliving the specific push or pop call that touched them).

---

## Connect the Pieces

Follow the pair of points `p1 = [0 0]` and `p2 = [3 4]` through every
unit built in this lesson. `vector-from-points` (Unit 1) subtracts
their coordinates, producing `v = [3 4]` — a pure displacement, "3
right, 4 up," with no location of its own, genuinely different in kind
from either point it came from. Translating both points by the same
offset (Unit 2, reusing Lesson 231's `translate-point`) produces two
completely different points, `p1t` and `p2t` — yet `vector-from-points`,
called again on the translated pair, returns the *exact same* `[3 4]`,
proving the vector itself never depended on which origin was chosen in
the first place. `vector-magnitude` (Unit 3), computed from `v` alone,
with neither original point referenced at all, returns `5.0` — the
identical number Lesson 231's `point-distance` already computed
directly from `p1` and `p2`, now understood as a property of the
displacement itself rather than a relationship requiring two specific
locations to state.

## What Breaks Without This

Compute a vector's magnitude using its two *component* squares added
directly to *each other*, but skip re-deriving the vector from
translated points — instead, mistakenly reuse a point's own raw
coordinate as though it already were a vector component:

```clojure
(defn vector-magnitude-from-point-broken [point]
  (vector-magnitude-squared point))
```

```
user=> (vector-magnitude-from-point-broken p2)
25
user=> (vector-magnitude-from-point-broken p2t)
170
```

Called on `p2` directly (not `v`), this happens to produce the correct
`25`, purely because `p1` was `[0 0]`, making `p2`'s own raw coordinates
numerically identical to the true displacement in this one case. Called
on `p2t` — `p2`'s translated counterpart — it produces `170`, because
`p2t`'s raw coordinates, `[-7 11]`, are *not* the displacement from
anything; they're a location, translation-dependent, silently fed into a
function that expected a translation-*invariant* vector. This is Unit
1's own warning made concrete: a point and a vector are both plain
two-element Clojure vectors underneath, and nothing stops one from being
passed where the other belongs — only the discipline of actually
building a vector via `vector-from-points`, rather than reaching for a
point's raw coordinates directly, keeps this distinction real.

## Exercises

1. Extend `make-vector`, `vector-dx`/`vector-dy`, and
   `vector-magnitude-squared` to three dimensions, and confirm
   `vector-from-points` between `(0,0,0)` and `(2,3,6)` produces a
   vector with magnitude `7`.
2. Build a `same-direction?` predicate that compares two vectors'
   `dx`/`dy` *ratios* rather than their magnitudes, and test it against
   `[3 4]` and `[6 8]` — the same direction, scaled — confirming it
   correctly reports `true` even though their magnitudes (`5.0` and
   `10.0`) are different.
3. Translate three different points by three genuinely *different*
   offsets each (not one shared offset), recompute the vector between
   each translated pair, and confirm the vectors are *no longer*
   identical to the originals — then explain in one sentence exactly
   which part of Unit 2's own proof this violates.

## Definition of Done

- [ ] `make-vector`, `vector-dx`, `vector-dy`, `vector-from-points`,
      `vector-magnitude-squared`, and `vector-magnitude` all defined and
      run in a live `bb` REPL, matching every transcript shown above
      exactly.
- [ ] Unit 1's vector-from-two-points reproduced.
- [ ] Unit 2's translation-invariance proof reproduced, with `=`
      confirming the vector is identical before and after translation.
- [ ] Unit 3's magnitude computation reproduced, matching Lesson 231's
      own `point-distance` result exactly.
- [ ] Exercise 3 completed, confirming *unequal* offsets genuinely do
      break vector invariance, in contrast to Unit 2's equal-offset
      case.
- [ ] `git commit -m "Add Lesson 232: vectors as translation-invariant
      displacements, distinct from points, with magnitude as the same
      computation as Lesson 231's point-distance"`
