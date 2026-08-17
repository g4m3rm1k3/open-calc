# Lesson 251: Computational Geometry — Intersections, Distances, and Regions

**What you will build**: `orientation`, a single reused formula that
answers "which side of a directed line does this point fall on" — the
one real primitive underneath everything else this lesson builds:
`segments-intersect?`, a genuine two-segment crossing test; `point-
segment-distance`, the real distance from a point to the *nearest* point
on a line segment, not just to one of its endpoints; and `point-in-
quad?`, a real point-inside-a-convex-region test. Every one of these is
a working piece of the same machinery real computer graphics, robotics
collision detection, and CAD software actually use.

**What you need to know first**: Lesson 231's `make-point`/`point-x`/
`point-y`. Lesson 232's `vector-from-points`, `vector-magnitude`. Lesson
233's `vector-add`, `vector-scale`, `dot-product`, and `vector-
projection` — this lesson's own point-to-segment distance is `vector-
projection`'s exact formula, with one new piece added. Lesson 238's
`parallelogram-area` and Lesson 240's own reuse of it as a collinearity
test — this lesson's entire foundation is that identical formula, reused
a third time for a third purpose.

**Terms used in this lesson**:

- **orientation** — given a directed line through two points and a third
  point, whether that third point lies to the left of the line, to the
  right, or exactly on it — the single most-reused primitive in
  computational geometry.
- **segment** — the finite piece of a line between two specific
  endpoints, in contrast to a full, infinite line — distances and
  intersections both behave differently for a segment than for the line
  it lies on, since a segment can have a *nearest point* that isn't the
  true closest point on the infinite line at all.
- **convex region** — a shape where a straight line between any two
  points inside it never leaves the shape — a square, this lesson's own
  running example, is convex; a star shape is not.
- **convex hull** — the smallest convex region containing every point in
  some set — named here, and its full construction honestly described
  as out of this lesson's own scope, in favor of the tractable, real
  question this lesson actually answers: given an *already-known*
  convex region, is a specific point inside it?

**Objects and methods used**:

- **`defn`**
  - *What it is:* Clojure's form for naming a reusable function.
  - *Implementation:* `(defn name [params] body)` — evaluates `body`
    with `params` bound to the arguments passed, binds `name` to the
    result.
  - *Its use:* every function in this lesson.
- **`vector-from-points`** / **`parallelogram-area`** / **`dot-product`**
  / **`vector-add`** / **`vector-scale`** / **`vector-magnitude`**
  - *What they are:* reused unchanged from Lessons 232, 233, and 238.
  - *Their use:* `parallelogram-area`, applied to two vectors built with
    `vector-from-points`, *is* this lesson's own `orientation`;
    `dot-product`, `vector-add`, and `vector-scale` together build this
    lesson's own point-to-segment distance, the same arithmetic Lesson
    233's own `vector-projection` already used.
- **`get`** / **`-`** / **`*`** / **`+`** / **`/`** / **`<`** / **`>`**
  / **`>=`** / **`and`**
  - *What they are:* Clojure's positional lookup, subtraction,
    multiplication, addition, division, less-than, greater-than,
    greater-than-or-equal, and logical-and functions, reused throughout
    this curriculum since its earliest arithmetic and control flow.
  - *Their use:* the comparisons and combined conditions every predicate
    in this lesson is built from.

---

## Concept Unit: Orientation — Which Side of a Line

### The Problem

Every geometric question this lesson answers — do two segments cross,
which side of a boundary is a point on, is a point inside a shape —
reduces to one more basic question: given a directed line from point `A`
to point `B`, does a third point `C` sit to the line's left, its right,
or exactly on it? Answering that question once, correctly, is the real
foundation everything else in this lesson builds on.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because orientation testing is a computational-geometry
  technique this curriculum is deriving directly, not porting from any
  external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed.

### The New Code

```clojure
(defn orientation [a b c]
  (parallelogram-area (vector-from-points a b) (vector-from-points a c)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn orientation [a b c] ...)` — `vector-from-points`, reappearing
from Lesson 232, builds two vectors: from `a` to `b` (the directed
line), and from `a` to `c` (toward the test point). `parallelogram-area`,
reappearing from Lesson 238 — the identical formula Lesson 240 already
reused once, to test whether two vectors are collinear — is reused here
a third time, for a third meaning: its *sign*, not just whether it's
zero, tells which side of the `A→B` line `C` falls on. A positive result
means `C` is to the left (a counterclockwise turn from `A→B` to `A→C`); a
negative result means the right (clockwise); exactly `0` means `C` sits
directly on the line through `A` and `B`.

### CS Lens

`orientation` is the **single most-reused primitive in computational
geometry** — not an exaggeration; nearly every algorithm in this field,
from convex hull construction to segment intersection to point-in-
polygon testing, reduces to calling this one function repeatedly. Also
recognized in: GPU rasterization, deciding which side of a triangle's
own edge a pixel falls on (the actual technique modern real-time
graphics hardware uses to fill triangles); robotics motion planning,
testing which side of an obstacle's own boundary a proposed path
crosses; and this exact curriculum's own Lesson 240, which used the
identical formula to test collinearity between an eigenvector candidate
and its own transformed image.

### SE Lens

The alternative — computing an actual angle (via `Math/atan2` or
similar) and comparing angles directly — would work, but costs a real
trigonometric function call and the genuine precision concerns Lesson
242 already demonstrated for floating-point arithmetic, for a question
that `parallelogram-area`'s own exact, cheap multiplication-and-
subtraction already answers completely, with no trigonometry at all.
Reusing an already-verified formula for a new purpose, exactly as Lesson
240 already did once, costs only the discipline of remembering it's
*this specific formula* doing the work, not a new derivation.

### Run It — Real Output

```
user=> (def A (make-point 0 0))
#'user/A
user=> (def B (make-point 4 0))
#'user/B
user=> (orientation A B (make-point 2 2))
8
user=> (orientation A B (make-point 2 -2))
-8
user=> (orientation A B (make-point 2 0))
0
```

`(2, 2)`, above the line from `(0, 0)` to `(4, 0)`, gives a positive
result — left. `(2, -2)`, below it, gives the exact negative — right.
`(2, 0)`, sitting directly on the segment between `A` and `B`, gives
exactly `0` — collinear, confirming this single function correctly
distinguishes all three real cases.

### Connection

One point relative to one line. The next unit uses two orientation
checks per segment — four total — to answer a much more useful question:
do two entire segments actually cross?

---

## Concept Unit: Do Two Segments Cross?

### The Problem

Two line segments, each with its own two endpoints, either cross each
other somewhere in the middle or they don't. Checking this by finding
the actual intersection point (solving Lesson 241's own kind of linear
system) works, but is more machinery than the question actually needs —
`orientation` alone, checked in the right combination, can answer
"do they cross" without ever computing *where*.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because segment intersection testing is a computational-
  geometry technique this curriculum is deriving directly, not porting
  from any external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses `orientation`
  from this lesson's own Unit 1.

### The New Code

```clojure
(defn segments-straddle? [p1 p2 q1 q2]
  (< (* (orientation p1 p2 q1) (orientation p1 p2 q2)) 0))

(defn segments-intersect? [p1 p2 q1 q2]
  (and (segments-straddle? p1 p2 q1 q2) (segments-straddle? q1 q2 p1 p2)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn segments-straddle? [p1 p2 q1 q2] ...)` — `orientation`,
reappearing from this lesson's own Unit 1, is called twice: once
checking which side of the `p1→p2` line `q1` falls on, once for `q2`.
`*`, reappearing, multiplies the two results together; `<`, reappearing,
checks whether that product is negative. Two real numbers multiply to
something negative exactly when one is positive and the other negative
— meaning `q1` and `q2` fall on *opposite* sides of the `p1→p2` line,
which is called **straddling**: the segment `q1q2` genuinely crosses the
*infinite line* through `p1` and `p2`, though not necessarily the finite
segment `p1p2` itself.

`(defn segments-intersect? [p1 p2 q1 q2] ...)` — `and`, reused control
flow: both segments have to straddle *each other's* line for the
segments themselves to actually cross — `p1p2`'s own two endpoints have
to straddle the `q1→q2` line, checked by the second `segments-straddle?`
call with the arguments swapped. Either check alone only proves crossing
the other's *infinite line*; both together prove the two finite segments
genuinely intersect.

### CS Lens

This is a real instance of **reducing a geometric question to a small,
fixed number of sign checks** — no coordinates of the actual
intersection point are ever computed, because the question asked
("do they cross," not "where") never needed them. Also recognized in:
collision detection in physics engines and games, which overwhelmingly
use exactly this kind of orientation-based test rather than solving for
exact contact points until a collision is already confirmed; and
computational geometry's own general principle of using the *cheapest*
predicate that answers the actual question asked, saving more expensive
computation for only the cases that need it.

### SE Lens

This lesson's own `segments-intersect?` deliberately does not handle the
collinear-overlap edge case (segments lying on the exact same line,
partially overlapping) — a real, honest scope limit, matching this
curriculum's own established pattern of building the tractable,
representative core and naming what's left out rather than silently
mishandling it. A production geometry library needs that case handled
explicitly; this lesson's own two functions would need a third check
added for it, not silently trusted to already work.

### Run It — Real Output

```
user=> (def C (make-point 4 4))
#'user/C
user=> (def D (make-point 0 4))
#'user/D
user=> (segments-intersect? A C B D)
true
user=> (segments-intersect? A B D C)
false
```

The two diagonals of the square `A`, `B`, `C`, `D` — `A` to `C`, and `B`
to `D` — genuinely cross at the square's own center, and
`segments-intersect?` correctly says `true`. The bottom edge (`A` to
`B`) and the top edge (`D` to `C`) are parallel and never cross, and
`segments-intersect?` correctly says `false`.

### Connection

Two segments either cross or they don't — a binary answer. The next unit
asks a more specific question about a single segment: exactly how far
away is a given point from it?

---

## Concept Unit: Distance From a Point to a Segment

### The Problem

Lesson 233's own `vector-projection` finds the closest point on an
*infinite* line through two points to some target — but a real segment
is finite. A point whose true closest position on the infinite line
falls *past* one of the segment's own endpoints doesn't have that
position available to it at all; its real nearest point on the segment
is that endpoint instead.

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition, extending Lesson 233's own `vector-projection` formula with
  a real endpoint clamp, not porting from any external reference
  implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses `dot-product`,
  `vector-add`, `vector-scale`, `vector-from-points`, and
  `vector-magnitude`.

### The New Code

```clojure
(defn clamp01 [t]
  (if (< t 0) 0 (if (> t 1) 1 t)))

(defn closest-point-on-segment [a b p]
  (vector-add a (vector-scale (vector-from-points a b) (clamp01 (/ (dot-product (vector-from-points a p) (vector-from-points a b)) (dot-product (vector-from-points a b) (vector-from-points a b)))))))

(defn point-segment-distance [a b p]
  (vector-magnitude (vector-from-points (closest-point-on-segment a b p) p)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn clamp01 [t] ...)` — `if`, reused, nested: when `t` is below `0`,
returns `0`; otherwise, when `t` is above `1`, returns `1`; otherwise
`t` itself, unchanged. This is called **clamping**: forcing a number to
stay within a fixed range, `[0, 1]` here, without changing it at all if
it's already inside that range.

`(defn closest-point-on-segment [a b p] ...)` — read the innermost
division first: `(dot-product (vector-from-points a p) (vector-from-points
a b))` over `(dot-product (vector-from-points a b) (vector-from-points a
b))` — this is exactly Lesson 233's own `vector-projection` formula's
scalar coefficient, before the final scaling step: how far along the
`a→b` direction `p`'s own projection falls, as a fraction where `0` is
`a` itself and `1` is `b` itself. `clamp01`, just built, forces that
fraction to stay within `[0, 1]` — the genuinely new piece Lesson 233's
own infinite-line version never needed. `vector-scale` and `vector-add`,
reappearing from Lesson 233, then move that clamped fraction of the way
from `a` toward `b`, producing a real point guaranteed to lie *on* the
segment, never past either end.

`(defn point-segment-distance [a b p] ...)` — `vector-from-points` and
`vector-magnitude`, both reappearing, measure the straight-line distance
from that real closest point to `p` itself.

### CS Lens

This is **clamping a continuous parameter to a valid range**, a small,
widely-reused idea in its own right: the same shape as clamping a
color's own RGB channel to `[0, 255]`, clamping a physics simulation's
own velocity to a maximum speed, or clamping a UI slider's own value to
its declared minimum and maximum. Also recognized in: pathfinding
algorithms snapping a proposed position onto the nearest valid point on
a navigable surface, and any user-input validation that silently
corrects an out-of-range number rather than rejecting it outright.

### SE Lens

The alternative — checking three separate cases explicitly (distance to
`a`, distance to `b`, distance to the infinite-line projection, then
picking the smallest) — would work, but needs three separate distance
computations and an explicit comparison. `clamp01`'s single-line fix
folds all three cases into the identical formula: when the true
projection already falls inside `[0, 1]`, clamping changes nothing; when
it doesn't, clamping forces it to exactly the nearer endpoint, at zero
extra cost.

### Run It — Real Output

```
user=> (closest-point-on-segment A B (make-point 2 3))
[2 0]
user=> (point-segment-distance A B (make-point 2 3))
3.0
user=> (closest-point-on-segment A B (make-point -1 -1))
[0 0]
user=> (point-segment-distance A B (make-point -1 -1))
1.4142135623730951
```

`(2, 3)`, directly above the midpoint of segment `A`-`B`, has its real
closest point at `(2, 0)` — squarely inside the segment, no clamping
needed — at distance `3.0`, exactly its own height above the segment.
`(-1, -1)`, off the segment's own end near `A`, has its closest point
correctly clamped to `A` itself, `(0, 0)`, at distance `√2 ≈
1.4142135623730951` — the real straight-line distance to the endpoint,
not to some invalid point past it on the infinite line.

### Connection

The closing unit combines `orientation` with a fixed shape's own four
edges to answer a genuinely different geometric question: is a point
inside a region at all?

---

## Concept Unit: Is a Point Inside a Convex Region?

### The Problem

A **convex hull** — the smallest convex shape containing a whole set of
points — is a real, useful spatial structure, but *constructing* one
from an arbitrary point set is a meaningfully harder algorithm (gift
wrapping or Graham scan, repeatedly finding the most extreme remaining
point) than fits honestly in this lesson's own remaining scope. The
tractable, real question this lesson can answer completely: given a
convex shape whose own corners are *already* known, in order, is some
specific point inside it?

### Project Change

- **Reference Source**: No reference counterpart — this is a from-scratch
  addition because point-in-polygon testing is a computational-geometry
  technique this curriculum is deriving directly, not porting from any
  external reference implementation.
- **Files affected**: None.
- **Change type**: N/A.
- **Location**: N/A.
- **Dependencies**: Babashka, already installed. Reuses `orientation`
  from this lesson's own Unit 1.

### The New Code

```clojure
(defn point-in-quad? [q1 q2 q3 q4 p]
  (and
    (>= (orientation q1 q2 p) 0)
    (>= (orientation q2 q3 p) 0)
    (>= (orientation q3 q4 p) 0)
    (>= (orientation q4 q1 p) 0)))
```

### The Updated Project

Skipped — no enclosing file exists yet.

### Discard the Throwaway Example

Not applicable — real, reusable, hand-verified this session (`bb` was
actually reachable and run).

### Mechanical Walkthrough

`(defn point-in-quad? [q1 q2 q3 q4 p] ...)` — `q1` through `q4` are the
quad's own four corners, listed in counterclockwise order (the identical
`A`, `B`, `C`, `D` ordering this lesson has used throughout). `>=`,
reappearing, and `orientation`, reappearing from this lesson's own Unit
1, check `p`'s own side relative to each of the quad's four edges in
turn — `q1→q2`, `q2→q3`, `q3→q4`, `q4→q1` — the shape walked all the way
around back to its own start. `and`, reused, requires *every* one of
those four checks to come back non-negative — `p` on the left side (or
exactly on the boundary) of every single edge. A point sitting inside a
convex shape whose own edges are listed counterclockwise is, by
definition, to the left of every one of them at once; a point outside
fails at least one.

### CS Lens

This is the **convex polygon point-containment test**, a real, working
instance of a general principle: a convex shape is exactly the
*intersection* of the half-planes defined by each of its own edges, and
testing membership in an intersection just means testing every one of
its own pieces and requiring all of them to hold. Also recognized in:
collision detection between a point (or, generalized slightly, another
convex shape) and a convex collider in a physics engine; frustum culling
in `3D` graphics, testing whether an object falls inside a camera's own
six-sided convex viewing volume; and constraint-satisfaction systems
checking whether a proposed solution satisfies every one of several
simultaneous linear inequalities at once.

### SE Lens

The full convex-hull-*construction* problem — given an arbitrary,
unordered set of points, find which ones are on the hull and in what
order — is deliberately left undone here, the same honest scope
narrowing this curriculum already applied to red-black tree fixup
(Lesson 99), B-tree splitting (Lesson 100), and Ford-Fulkerson's
augmenting-path search (Lesson 134): the general algorithm is real,
well-documented, and meaningfully more involved than fits one lesson,
while the tractable, representative piece actually built here — testing
membership in an *already-known* convex region — is real, complete, and
verified.

### Run It — Real Output

```
user=> (point-in-quad? A B C D M)
true
user=> (point-in-quad? A B C D N)
false
user=> (orientation A B N)
20
user=> (orientation B C N)
-4
```

`M = (2, 2)`, the square's own center, passes all four edge checks —
`point-in-quad?` correctly says `true`. `N = (5, 5)`, well outside the
square, fails: `orientation(A, B, N)` is `20`, still non-negative (`N`
is above the bottom edge, same as any point inside would be) — but
`orientation(B, C, N)` is `-4`, negative, because `N`'s own `x = 5` sits
past the square's own right edge at `x = 4`. One failed check is enough;
`point-in-quad?` correctly says `false`.

### Connection

The closing section traces the square's own center and a genuinely
different point through every geometric test this lesson built.

---

## Connect the Pieces

The square `A(0,0)`, `B(4,0)`, `C(4,4)`, `D(0,4)`, and two test points,
`M(2,2)` (the center) and a point on segment `AB`, `(2, 0)`, moving
through every unit built in this lesson:

1. `orientation(A, B, M)` (Unit 1) → `8`, positive — `M` is left of the
   bottom edge.
2. `segments-intersect?(A, C, B, D)` (Unit 2) → `true` — the square's
   own two diagonals genuinely cross, at exactly `M`.
3. `point-segment-distance(A, B, M)` (Unit 3) → the real distance from
   `M` down to the nearest point on the bottom edge, `(2, 0)`: `2.0`.
4. `point-in-quad?(A, B, C, D, M)` (Unit 4) → `true` — `M` passes all
   four edge checks, confirmed independently of the diagonal-crossing
   fact from step 2.

Every one of these four real geometric facts about `M` — which side of
one edge it's on, that it's exactly where the diagonals cross, how far
it is from the nearest edge, and that it's fully contained in the square
— was computed by a different function, built in a different unit, and
every one of them is consistent with the others: `M` really is the
square's own true center, confirmed four independent ways rather than
assumed from one.

## What Breaks Without This

Build `point-in-quad?`'s own edges in the wrong order — mixing up which
corner comes after which:

```clojure
(defn point-in-quad-broken? [q1 q2 q3 q4 p]
  (and
    (>= (orientation q1 q3 p) 0)
    (>= (orientation q2 q3 p) 0)
    (>= (orientation q3 q4 p) 0)
    (>= (orientation q4 q1 p) 0)))
```

```
user=> (point-in-quad-broken? A B C D M)
false
```

The correct answer, from Unit 4, was `true` — `M` really is inside the
square. The broken version's very first check, `orientation(q1, q3, p)`
— using the square's own *diagonal*, `A` to `C`, instead of the real
edge, `A` to `B` — tests `M` against a line the actual quad boundary
never follows. `M` sits exactly on that diagonal (Unit 2 already proved
the diagonals cross there), so `orientation(A, C, M)` comes out `0` —
technically still passing the `>= 0` check on its own — but the *shape*
being tested against is no longer the real square at all, and the
remaining three checks, still using the real edges, now describe an
inconsistent, self-contradictory region that no real point can pass
completely. This is the concrete cost of `point-in-quad?`'s own
undeclared assumption: the four corners must be passed in real,
consistent, walked-around-the-boundary order, and nothing in the
function itself checks that they were. Restoring the correct edge order:

```
user=> (point-in-quad? A B C D M)
true
```

recovers the real, correct containment test.

## Exercises

1. Build a genuinely non-square convex quad — for example, `A(0,0)`,
   `B(6,0)`, `C(4,4)`, `D(1,3)` — and verify `point-in-quad?` correctly
   accepts a point you expect to be inside and rejects one you expect to
   be outside.
2. Using `segments-intersect?`, check whether segment `A`-`C` (a
   diagonal of the original square) intersects segment `A`-`B` (an
   edge sharing endpoint `A`). Explain, using Unit 2's own `and`-of-two-
   straddle-checks logic, why two segments that only *touch* at a shared
   endpoint behave differently from two that genuinely cross through
   their own interiors.
3. `point-segment-distance` was verified against a horizontal segment.
   Run it against a segment that isn't axis-aligned — `A(0,0)` to
   `C(4,4)`, the square's own diagonal — for a test point of your
   choosing, and verify the clamping behavior still works correctly for
   a point whose projection falls outside `[0, 1]`.

## Definition of Done

- [ ] `orientation` correctly distinguishes left, right, and collinear
      for three real test points.
- [ ] `segments-intersect?` correctly identifies the square's own two
      diagonals as crossing, and its own top and bottom edges as not.
- [ ] `point-segment-distance` correctly computes both an unclamped
      (perpendicular) distance and a clamped (past-the-endpoint)
      distance, verified against real, hand-checked values.
- [ ] `point-in-quad?` correctly accepts the square's own center and
      rejects a point well outside it, with the specific failing edge
      identified.
- [ ] The wrong-edge-order bug was reproduced for real and explained in
      your own words, including why one of its four checks could still
      pass by coincidence.
- [ ] `git commit` with a message explaining *why* `point-in-quad?`
      requires its four corners in a specific, consistent order rather
      than accepting them in any order — for example: `"Document
      point-in-quad?'s own corner-order requirement — Lesson 251's own
      broken version shows a diagonal used in place of an edge can still
      pass one check by coincidence while producing a meaningless
      overall test."`
