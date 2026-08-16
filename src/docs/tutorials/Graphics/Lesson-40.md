# Lesson 40: Voronoi Diagrams

**What you will build:** `closest_seed`, extending Lesson 38's own
running-best search from "smallest `x` coordinate" to "smallest distance
to a query point" — the defining question a Voronoi diagram answers for
every point in the plane. Then `bisector`, building the exact boundary
between two neighboring regions using Lesson 32's `perpendicular`,
verified to be genuinely equidistant with Lesson 17's `nearly_equal`.
The transferable problem: every region this curriculum has built so far
— a circle, a polygon — was defined by its own explicit boundary. A
Voronoi diagram's regions are defined the opposite way: not by a
boundary drawn in advance, but by *which seed point is closest*, with the
boundaries emerging afterward as wherever that answer changes.

**What you need to know first:** Lesson 38's running-best accumulator
pattern, Lesson 2's `subtract_points`, Lesson 9's `norm`, Lesson 32's
`perpendicular`, and Lesson 17's `nearly_equal`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–39.

**Terms introduced in this lesson:**

- **Voronoi diagram** — a partition of the plane into regions, one per
  **seed point**, where each region contains exactly the points closer
  to that seed than to any other. Why: this is a genuinely different way
  to define a region than every shape this curriculum has built since
  Lesson 21 — not by its own boundary, but by a comparison against every
  other seed.
- **Bisector** (perpendicular bisector) — the line running exactly midway
  between two points, perpendicular to the line connecting them, made up
  entirely of points equally distant from both. Why: this is the exact
  boundary between two neighboring seeds' own regions — the place where
  "closest to seed 1" and "closest to seed 2" trade off.

**Objects and methods used:**

None. `closest_seed` and `bisector` are hand-authored project code,
built from Lesson 2, 9, 17, 21, and 32's own reused functions.

---

## Concept Unit: Which Seed Is Closest? — A Running-Best Distance Search

### The Problem

A Voronoi diagram's whole definition rests on one question, asked at
every possible point: which seed is nearest? Answering it for one
specific point is exactly Lesson 38's own running-best pattern, with
distance in place of `x` coordinate.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–39.
- **Files affected:** `geometry_lesson_40.py` — created, as a new file
  for this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
import math


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def closest_seed(query_point, seeds):
    closest = seeds[0]
    closest_distance = norm(subtract_points(query_point, seeds[0]))
    for seed in seeds:
        distance = norm(subtract_points(query_point, seed))
        if distance < closest_distance:
            closest = seed
            closest_distance = distance
    return closest


seed_a = (0, 0)
seed_b = (6, 0)
seed_c = (3, 6)
seeds = [seed_a, seed_b, seed_c]

print(closest_seed((1, 1), seeds))
print(closest_seed((5, 1), seeds))
print(closest_seed((3, 5), seeds))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `subtract_points`, `dot_product`, and `norm` are
Lesson 2, 7, and 9's own functions, retyped unchanged; the running-best
loop shape is Lesson 38's own pattern, reused. No new Python construct
appears here, so no isolated throwaway lab is needed.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `import math`, `def subtract_points(...)`, `def dot_product(...)`, `def
  norm(...)` — Lesson 9, 2, and 7's own code, retyped unchanged. No
  re-explanation owed, per the Repetition Rule.
- `def closest_seed(query_point, seeds): ...` — first appearance: this
  lesson's own subject.
- `closest = seeds[0]`, `closest_distance = norm(subtract_points(query_point,
  seeds[0]))` — a **hard concept reappearing**: Lesson 38's own
  running-best initialization, restated with distance instead of `x`
  coordinate as the value being tracked.
- `for seed in seeds: distance = norm(subtract_points(query_point,
  seed))` — already-basic reuse, computing each candidate seed's own
  distance from the query point.
- `if distance < closest_distance: closest = seed; closest_distance =
  distance` — already-basic reuse of Lesson 38's own replacement logic,
  swapping in a new best the moment a closer seed is found.
- `return closest` — the seed genuinely nearest to `query_point`, out of
  every seed checked.
- `seed_a`, `seed_b`, `seed_c`, `seeds` — three seed points, spread out
  to form a real triangle rather than sitting in a line.
- The three `print(closest_seed(...))` calls — each test point sits
  clearly nearer one specific seed: `(1, 1)` is closest to `seed_a`,
  `(5, 1)` to `seed_b`, `(3, 5)` to `seed_c`. All three print the
  expected seed exactly.

### CS Lens

Assigning every point in space to whichever of several reference points
it's nearest to, using nothing but a distance comparison, is the exact
definition behind one of the most widely used spatial data structures in
computing.

```
Also recognized in: cellular network coverage maps (which cell tower a
phone connects to is, in the simplest model, exactly which tower is
closest — the real-world Voronoi cell a phone happens to be standing
in), k-means clustering in machine learning (assigning each data point
to its nearest cluster center, every single iteration, is this identical
`closest_seed` computation, just called "centroid" instead of "seed"),
and retail location planning (a "nearest store" analysis, deciding which
of several store locations serves a given neighborhood, is a real-world
Voronoi diagram computed over an entire city)
```

### SE Lens

The design principle is **defining a region by a comparison rule rather
than an explicit boundary**, and recognizing that the comparison rule
alone is often enough to answer real queries, without ever constructing
the boundary at all. The alternative not chosen: build every Voronoi
cell as an explicit polygon first — computing each one's boundary — and
only then check which polygon a point falls inside, reusing Lesson 35's
`is_point_in_polygon`.

That alternative would work, and would answer more questions (like "what
is this region's own area"). The real cost it pays: for a single "which
seed is closest" query, `closest_seed` never needs to construct any
boundary at all — comparing a query point against every seed directly
answers the question in one pass, with none of the extra work building
explicit polygon boundaries would require.

### Commands Needed

`python geometry_lesson_40.py` — same interpreter and command as every
prior lesson.

### Run It

```
(0, 0)
(6, 0)
(3, 6)
```

Verified by actually running the file above.

### Connection

`closest_seed` correctly identifies which region any given point belongs
to. The next unit builds the actual line separating two neighboring
regions.

---

## Concept Unit: The Boundary Between Two Cells — the Perpendicular Bisector

### The Problem

`closest_seed` can report which seed wins for any point, one at a time,
but doesn't yet describe *where* the answer changes from one seed to
another. That boundary — the perpendicular bisector — is built from
tools this curriculum already has.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_40.py` — modified.
- **Change type:** add.
- **Location:** appended below the final `print(closest_seed(...))` line
  added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `subtract_points`, `norm`,
  `closest_seed`, `seed_a`, `seed_b`.

### The New Code

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def perpendicular(v):
    return (-v[1], v[0])


def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


def bisector(seed1, seed2):
    midpoint = point_on_line(seed1, subtract_points(seed2, seed1), 0.5)
    direction = perpendicular(subtract_points(seed2, seed1))
    return (midpoint, direction)


ab_bisector = bisector(seed_a, seed_b)
bisector_point = point_on_line(ab_bisector[0], ab_bisector[1], 0.5)

distance_to_a = norm(subtract_points(bisector_point, seed_a))
distance_to_b = norm(subtract_points(bisector_point, seed_b))

print(bisector_point)
print(distance_to_a)
print(distance_to_b)
print(nearly_equal(distance_to_a, distance_to_b, 0.0000001))
print(closest_seed(bisector_point, [seed_a, seed_b]))
```

### The Updated Project

```python
import math


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def closest_seed(query_point, seeds):
    closest = seeds[0]
    closest_distance = norm(subtract_points(query_point, seeds[0]))
    for seed in seeds:
        distance = norm(subtract_points(query_point, seed))
        if distance < closest_distance:
            closest = seed
            closest_distance = distance
    return closest


seed_a = (0, 0)
seed_b = (6, 0)
seed_c = (3, 6)
seeds = [seed_a, seed_b, seed_c]

print(closest_seed((1, 1), seeds))
print(closest_seed((5, 1), seeds))
print(closest_seed((3, 5), seeds))


def add_vector_to_point(point, vector):                                  # ← new
    return (point[0] + vector[0], point[1] + vector[1])                # ← new


def scale_vector(vector, factor):                                        # ← new
    return (vector[0] * factor, vector[1] * factor)                     # ← new


def point_on_line(line_point, line_direction, t):                        # ← new
    return add_vector_to_point(line_point, scale_vector(line_direction, t))  # ← new


def perpendicular(v):                                                    # ← new
    return (-v[1], v[0])                                                # ← new


def nearly_equal(a, b, tolerance):                                       # ← new
    return abs(a - b) < tolerance                                       # ← new


def bisector(seed1, seed2):                                              # ← new
    midpoint = point_on_line(seed1, subtract_points(seed2, seed1), 0.5)  # ← new
    direction = perpendicular(subtract_points(seed2, seed1))            # ← new
    return (midpoint, direction)                                        # ← new


ab_bisector = bisector(seed_a, seed_b)                                   # ← new
bisector_point = point_on_line(ab_bisector[0], ab_bisector[1], 0.5)      # ← new

distance_to_a = norm(subtract_points(bisector_point, seed_a))            # ← new
distance_to_b = norm(subtract_points(bisector_point, seed_b))            # ← new

print(bisector_point)                                                    # ← new
print(distance_to_a)                                                     # ← new
print(distance_to_b)                                                     # ← new
print(nearly_equal(distance_to_a, distance_to_b, 0.0000001))            # ← new
print(closest_seed(bisector_point, [seed_a, seed_b]))                   # ← new
```

The file now builds a real boundary line, and directly verifies the one
property that defines it: every point on it is equally distant from both
seeds it separates.

*A note on method:* every function here is retyped unchanged from
Lessons 2, 3, 17, 21, and 32. No new Python construct is introduced.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def add_vector_to_point(...)` through `def nearly_equal(...)` —
  Lesson 2, 3, 17, 21, and 32's own functions, retyped unchanged. No
  re-explanation owed, per the Repetition Rule.
- `def bisector(seed1, seed2): ...` — first appearance: this lesson's
  own boundary-building function.
- `midpoint = point_on_line(seed1, subtract_points(seed2, seed1), 0.5)`
  — Lesson 21's own function, reused: `t = 0.5` lands exactly halfway
  between the two seeds.
- `direction = perpendicular(subtract_points(seed2, seed1))` — Lesson
  32's own function, reused: the direction connecting the two seeds,
  rotated 90 degrees — the **bisector**'s own direction, since the line
  separating two regions of equal claim must run perpendicular to the
  line joining their own centers.
- `return (midpoint, direction)` — already-basic tuple construction, the
  bisector represented the same `(point, direction)` shape every
  parametric line since Lesson 21 has used.
- `ab_bisector = bisector(seed_a, seed_b)` — already-basic reuse.
- `bisector_point = point_on_line(ab_bisector[0], ab_bisector[1], 0.5)`
  — Lesson 21's own function again, this time walking partway along the
  bisector *itself*, to get one concrete, testable point on it.
- `distance_to_a`, `distance_to_b` — already-basic reuse.
- `print(bisector_point)` — prints `(3.0, 3.0)`.
- `print(distance_to_a)`, `print(distance_to_b)` — both print
  `4.242640687119285` — the identical distance.
- `print(nearly_equal(distance_to_a, distance_to_b, 0.0000001))` —
  Lesson 17's own function, confirming `True`: this point genuinely,
  provably sits equally distant from both seeds.
- `print(closest_seed(bisector_point, [seed_a, seed_b]))` — asking
  `closest_seed` to choose between only `seed_a` and `seed_b` for this
  exact tied point. Prints `(0, 0)` — `seed_a` wins the tie only because
  `closest_seed`'s own `<` comparison never replaces a tied value, not
  because it's genuinely closer.

### CS Lens

Building a boundary directly from the geometric condition that defines
it — equal distance to two references — rather than searching for it
numerically, is the same closed-form-over-search preference this
curriculum already showed with circle-line intersection back in Lesson
31.

```
Also recognized in: crystallography and materials science (the boundary
between two crystal grains growing from separate nucleation points is a
real, physical Voronoi bisector, formed by the same equal-distance
principle), wireless signal handoff (the point where a moving phone
switches from one cell tower to another is engineered around exactly
this bisector, so the handoff happens at the fairest possible point), and
computational biology (Voronoi bisectors between cell nuclei are used to
approximate real biological cell boundaries in microscopy image
analysis)
```

### SE Lens

The design principle is **deriving a boundary directly from its own
defining property**, rather than approximating it by sampling many
points and checking which side they fall on. The alternative not chosen:
find the A-B boundary by testing a fine grid of points across the plane
with `closest_seed`, and treating the line between "closest to A" points
and "closest to B" points as the boundary.

That alternative would work, approximately, and generalizes easily to
messy definitions of "region" that don't have a closed-form boundary at
all. The real cost it pays: it only ever finds the boundary as precisely
as the grid is fine, and never reaches it exactly. `bisector`'s own
formula reaches the exact boundary directly, the same way Lesson 31's
algebraic derivation reached an exact circle-line intersection instead
of searching for one.

### Commands Needed

`python geometry_lesson_40.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
(0, 0)
(6, 0)
(3, 6)
(3.0, 3.0)
4.242640687119285
4.242640687119285
True
(0, 0)
```

Verified by actually running the updated file above.

### Connection

The A-B bisector is verified: every point on it sits equally distant
from `seed_a` and `seed_b`. What Breaks Without This shows why that fact
alone doesn't yet describe the *real* three-seed Voronoi diagram this
lesson's own point set actually has.

---

## Connect the Pieces

Two seeds and their shared boundary, traced through everything this
lesson built, start to finish:

1. `seed_a = (0, 0)`, `seed_b = (6, 0)` — two of this lesson's three
   seeds.
2. `bisector(seed_a, seed_b)` returns `((3.0, 0.0), (0, 6))` — a point
   exactly midway between them, and a direction perpendicular to the
   line joining them.
3. `bisector_point = (3.0, 3.0)`, walked halfway along that bisector
   line, sits at distance `4.242640687119285` from *both* `seed_a` and
   `seed_b` — confirmed equal by `nearly_equal`, not just by eye.
4. `closest_seed(bisector_point, [seed_a, seed_b])` reports `seed_a`
   only because of tie-breaking — the point is genuinely, provably
   equidistant between the two.

## What Breaks Without This

`bisector(seed_a, seed_b)` is the true boundary only in a world where
`seed_a` and `seed_b` are the *only* two seeds. Check what
`closest_seed` actually reports for `bisector_point` once `seed_c` is
back in the picture:

```python
print(closest_seed(bisector_point, seeds))
```

```
(3, 6)
```

Verified by actually running this. `bisector_point`, exactly equidistant
between `seed_a` and `seed_b`, turns out to be closer to `seed_c`
entirely — its distance to `seed_c` is only `3.0`, well under the
`4.242640687119285` it's equally far from `seed_a` and `seed_b` by. This
isn't a bug in `bisector` — the A-B bisector really is the correct
boundary between those two seeds' regions, in isolation — but it proves
that "on the A-B bisector" and "on the real Voronoi diagram's boundary"
are not the same claim the moment a third seed exists. The genuine
boundary of `seed_a`'s real Voronoi cell is only the *portion* of its
bisector with each neighboring seed that survives being at least as
close to `seed_a` as to every other seed too — exactly what
`closest_seed`, checked against the *full* seed list, actually decides.
Building the complete, trimmed boundary for every cell in a real Voronoi
diagram is a substantially harder problem than this lesson's own
two-seed bisector, and is exactly the kind of construction Lesson 41,
Delaunay Triangulation, approaches from the opposite direction.

## Exercises

1. Using `closest_seed`, sample several points along the full length of
   the `seed_a`-`seed_b` bisector (varying `t` in `point_on_line`), and
   find, by testing, roughly where along that line the true boundary
   between `seed_a`'s and `seed_c`'s regions actually begins — the point
   where `closest_seed` (checked against all three seeds) stops
   returning `seed_a` or `seed_b` and starts returning `seed_c`.
2. Build the bisector between `seed_a` and `seed_c` instead, and verify
   its own midpoint is equidistant between those two seeds using the
   same `nearly_equal` check this lesson's own Concept Unit 2 used.
3. Add a fourth seed, `seed_d = (3, 2)`, positioned inside the triangle
   formed by `seed_a`, `seed_b`, and `seed_c`. Using `closest_seed`,
   check whether any of this lesson's own three test points from Concept
   Unit 1 (`(1, 1)`, `(5, 1)`, `(3, 5)`) change which seed they're
   reported closest to, now that a fourth seed exists.

## Definition of Done

- [ ] `geometry_lesson_40.py` exists and runs with no errors via `python
      geometry_lesson_40.py`.
- [ ] Running it prints the full 8-line sequence shown in Concept Unit
      2's Run It, ending in `4.242640687119285`, `True`, then `(0, 0)`
      — matching this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, what a Voronoi
      diagram is and why `closest_seed` answers its defining question
      directly.
- [ ] You can explain why the `seed_a`-`seed_b` bisector is not, by
      itself, the true Voronoi boundary once a third seed exists, using
      this lesson's own verified `(3, 6)` counter-example.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Build Voronoi nearest-seed queries and perpendicular bisectors, and show why a two-seed bisector isn't the whole diagram"`,
      not `git commit -m "add closest_seed and bisector"`.

Next: Lesson 41 — Delaunay Triangulation, which connects each seed to
its true Voronoi neighbors directly, building the mathematical dual of
this lesson's own diagram from the opposite direction — triangles
instead of regions.
