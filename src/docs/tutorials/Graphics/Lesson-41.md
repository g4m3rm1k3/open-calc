# Lesson 41: Delaunay Triangulation

**What you will build:** `circumcenter`, finding the one point equidistant
from a triangle's three vertices by reusing Lesson 40's own `bisector`
and Lesson 24's `line_intersection` — the intersection of any two of the
triangle's three perpendicular bisectors. Then `is_delaunay_triangle`,
testing the **empty-circumcircle property** that connects triangulation
directly to Voronoi geometry: a triangle is Delaunay exactly when no
other point in the set lies inside the circle passing through its three
vertices. The transferable problem: Lesson 40 built Voronoi regions from
"which seed is closest," one query point at a time, and never connected
that back to the seeds' own relationships to each other. This lesson
proves the connection directly — a triangle's own circumcenter is a real
Voronoi vertex exactly when its circumcircle is empty, tying the two
constructions together with the same tools already built.

**What you need to know first:** Lesson 40's `bisector` and
`closest_seed`, Lesson 24's `line_intersection`, and Lesson 30's circle
representation and `classify_point_vs_circle`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–40.

**Terms introduced in this lesson:**

- **Circumcenter** — the single point equidistant from all three vertices
  of a triangle, found where any two of its three perpendicular
  bisectors meet. Why: this is the exact point a Delaunay triangle's own
  circle test is built around, and, when that circle is empty, the exact
  point where the triangle's three vertices' Voronoi cells meet.
- **Empty-circumcircle property** — the rule that a triangle qualifies as
  Delaunay exactly when the circle passing through its three vertices
  (its circumcircle) contains no other point from the set. Why: this is
  the single test, reusing nothing but a circle membership check, that
  connects triangulation directly to the Voronoi diagram Lesson 40 built.

**Objects and methods used:**

None. `circumcenter` and `is_delaunay_triangle` are hand-authored project
code, built from Lesson 2, 24, 30, 32, and 40's own reused functions.

---

## Concept Unit: The Circumcenter — Where Two Bisectors Meet

### The Problem

A triangle's circumcenter has to be equally distant from all three of
its own vertices — meaning it has to sit on *every* one of the
triangle's three perpendicular bisectors at once. Any two of those three
bisectors already pin it down exactly.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–40.
- **Files affected:** `geometry_lesson_41.py` — created, as a new file
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


def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def perpendicular(v):
    return (-v[1], v[0])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


def bisector(seed1, seed2):
    midpoint = point_on_line(seed1, subtract_points(seed2, seed1), 0.5)
    direction = perpendicular(subtract_points(seed2, seed1))
    return (midpoint, direction)


def line_intersection(point1, dir1, point2, dir2):
    diff = subtract_points(point2, point1)
    denominator = cross_product(dir1, dir2)
    t = cross_product(diff, dir2) / denominator
    return point_on_line(point1, dir1, t)


def circumcenter(a, b, c):
    bisector_ab = bisector(a, b)
    bisector_bc = bisector(b, c)
    return line_intersection(bisector_ab[0], bisector_ab[1], bisector_bc[0], bisector_bc[1])


seed_a = (0, 0)
seed_b = (6, 0)
seed_c = (3, 6)

center = circumcenter(seed_a, seed_b, seed_c)

distance_to_a = norm(subtract_points(center, seed_a))
distance_to_b = norm(subtract_points(center, seed_b))
distance_to_c = norm(subtract_points(center, seed_c))

print(center)
print(distance_to_a)
print(distance_to_b)
print(distance_to_c)
print(nearly_equal(distance_to_a, distance_to_b, 0.0000001))
print(nearly_equal(distance_to_b, distance_to_c, 0.0000001))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* every function through `line_intersection` is
retyped unchanged from Lessons 2, 3, 8, 17, 21, 24, 32, and 40. No new
Python construct appears here, so no isolated throwaway lab is needed.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `import math` through `def line_intersection(...)` — Lesson 9, 2, 3,
  21, 32, 8, 17, 40, and 24's own functions, retyped unchanged. No
  re-explanation owed, per the Repetition Rule.
- `def circumcenter(a, b, c): ...` — first appearance: this lesson's own
  subject.
- `bisector_ab = bisector(a, b)`, `bisector_bc = bisector(b, c)` —
  Lesson 40's own function, reused, building two of the triangle's three
  possible bisectors.
- `return line_intersection(bisector_ab[0], bisector_ab[1],
  bisector_bc[0], bisector_bc[1])` — Lesson 24's own function, reused:
  each bisector is already stored as a `(point, direction)` pair, the
  exact shape `line_intersection` expects, so finding where they cross
  needs no new derivation at all.
- `seed_a`, `seed_b`, `seed_c` — the same three seeds Lesson 40 used.
- `center = circumcenter(seed_a, seed_b, seed_c)` — already-basic reuse.
- `distance_to_a`, `distance_to_b`, `distance_to_c` — already-basic
  reuse.
- `print(center)` — prints `(3.0, 2.25)`.
- `print(distance_to_a)`, `print(distance_to_b)`, `print(distance_to_c)`
  — all three print `3.75`.
- `print(nearly_equal(distance_to_a, distance_to_b, 0.0000001))`,
  `print(nearly_equal(distance_to_b, distance_to_c, 0.0000001))` — both
  `True`: `center` is genuinely, provably equidistant from all three
  seeds, not merely close by eye.

### CS Lens

Finding a point that must satisfy several constraints at once by
intersecting just two of them — since satisfying any two guarantees the
third, for a triangle's circumcenter — is a real efficiency insight
worth naming.

```
Also recognized in: GPS trilateration (a receiver's position is
technically overdetermined by more than two satellite distance
measurements, but any two circles' intersection already pins down the
position, with a third measurement used only to resolve which of two
intersection points is correct), structural engineering (a
three-point-constrained joint is fully determined by any two of its
three constraints, with the third serving as a consistency check), and
surveying (a point's position, triangulated from three or more known
landmarks, is technically overdetermined the same way, with extra
landmarks used to detect and correct for measurement error)
```

### SE Lens

The design principle is **solving a three-way constraint using the
smallest sufficient subset of it**, rather than deriving a dedicated
three-bisector intersection formula from scratch. The alternative not
chosen: write a new `circumcenter` formula directly from the triangle's
three raw vertex coordinates, without routing through `bisector` or
`line_intersection` at all.

That alternative exists as a standard closed-form formula in most
geometry references. The real value of this lesson's own approach:
`circumcenter`'s correctness rests entirely on two already-independently-
verified functions, `bisector` (Lesson 40) and `line_intersection`
(Lesson 24) — nothing new has to be trusted here except the small
insight that two bisectors are enough.

### Commands Needed

`python geometry_lesson_41.py` — same interpreter and command as every
prior lesson.

### Run It

```
(3.0, 2.25)
3.75
3.75
3.75
True
True
```

Verified by actually running the file above.

### Connection

`circumcenter` is confirmed equidistant from all three seeds. The next
unit checks the one additional fact that decides whether this point is a
genuine Voronoi vertex, or just an equidistant point that happens not to
matter.

---

## Concept Unit: The Empty-Circumcircle Test — Is This Triangle Delaunay?

### The Problem

Being equidistant from `seed_a`, `seed_b`, and `seed_c` doesn't yet prove
`center` is closer to all three of them than to *every other* seed in
the full set — Lesson 40's own closing already proved a point can be
perfectly equidistant between two seeds and still lose to a third one
entirely. The real test needs to check every other point too.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_41.py` — modified.
- **Change type:** add.
- **Location:** appended below the final `print(nearly_equal(...))` line
  added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `circumcenter`, `norm`,
  `subtract_points`, `nearly_equal`.

### The New Code

```python
def classify_point_vs_circle(p, circle, tolerance):
    circle_center = circle[0]
    circle_radius = circle[1]
    distance = norm(subtract_points(p, circle_center))

    if nearly_equal(distance, circle_radius, tolerance):
        return "on"
    elif distance < circle_radius:
        return "inside"
    else:
        return "outside"


def is_delaunay_triangle(a, b, c, other_points):
    triangle_center = circumcenter(a, b, c)
    triangle_radius = norm(subtract_points(triangle_center, a))
    circumcircle = (triangle_center, triangle_radius)

    for p in other_points:
        if classify_point_vs_circle(p, circumcircle, 0.0000001) == "inside":
            return False

    return True


seed_d_far = (10, 10)
seed_d_near = (3, 2)

print(is_delaunay_triangle(seed_a, seed_b, seed_c, [seed_d_far]))
print(is_delaunay_triangle(seed_a, seed_b, seed_c, [seed_d_near]))


def closest_seed(query_point, seeds):
    closest = seeds[0]
    closest_distance = norm(subtract_points(query_point, seeds[0]))
    for seed in seeds:
        distance = norm(subtract_points(query_point, seed))
        if distance < closest_distance:
            closest = seed
            closest_distance = distance
    return closest


print(closest_seed(center, [seed_a, seed_b, seed_c]))
print(closest_seed(center, [seed_a, seed_b, seed_c, seed_d_near]))
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


def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def perpendicular(v):
    return (-v[1], v[0])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


def bisector(seed1, seed2):
    midpoint = point_on_line(seed1, subtract_points(seed2, seed1), 0.5)
    direction = perpendicular(subtract_points(seed2, seed1))
    return (midpoint, direction)


def line_intersection(point1, dir1, point2, dir2):
    diff = subtract_points(point2, point1)
    denominator = cross_product(dir1, dir2)
    t = cross_product(diff, dir2) / denominator
    return point_on_line(point1, dir1, t)


def circumcenter(a, b, c):
    bisector_ab = bisector(a, b)
    bisector_bc = bisector(b, c)
    return line_intersection(bisector_ab[0], bisector_ab[1], bisector_bc[0], bisector_bc[1])


seed_a = (0, 0)
seed_b = (6, 0)
seed_c = (3, 6)

center = circumcenter(seed_a, seed_b, seed_c)

distance_to_a = norm(subtract_points(center, seed_a))
distance_to_b = norm(subtract_points(center, seed_b))
distance_to_c = norm(subtract_points(center, seed_c))

print(center)
print(distance_to_a)
print(distance_to_b)
print(distance_to_c)
print(nearly_equal(distance_to_a, distance_to_b, 0.0000001))
print(nearly_equal(distance_to_b, distance_to_c, 0.0000001))


def classify_point_vs_circle(p, circle, tolerance):                      # ← new
    circle_center = circle[0]                                           # ← new
    circle_radius = circle[1]                                           # ← new
    distance = norm(subtract_points(p, circle_center))                  # ← new
                                                                           # ← new
    if nearly_equal(distance, circle_radius, tolerance):                # ← new
        return "on"                                                      # ← new
    elif distance < circle_radius:                                      # ← new
        return "inside"                                                  # ← new
    else:                                                                # ← new
        return "outside"                                                 # ← new


def is_delaunay_triangle(a, b, c, other_points):                         # ← new
    triangle_center = circumcenter(a, b, c)                              # ← new
    triangle_radius = norm(subtract_points(triangle_center, a))          # ← new
    circumcircle = (triangle_center, triangle_radius)                    # ← new
                                                                           # ← new
    for p in other_points:                                               # ← new
        if classify_point_vs_circle(p, circumcircle, 0.0000001) == "inside":  # ← new
            return False                                                 # ← new
                                                                           # ← new
    return True                                                          # ← new


seed_d_far = (10, 10)                                                    # ← new
seed_d_near = (3, 2)                                                     # ← new

print(is_delaunay_triangle(seed_a, seed_b, seed_c, [seed_d_far]))        # ← new
print(is_delaunay_triangle(seed_a, seed_b, seed_c, [seed_d_near]))       # ← new


def closest_seed(query_point, seeds):                                    # ← new
    closest = seeds[0]                                                   # ← new
    closest_distance = norm(subtract_points(query_point, seeds[0]))     # ← new
    for seed in seeds:                                                  # ← new
        distance = norm(subtract_points(query_point, seed))             # ← new
        if distance < closest_distance:                                # ← new
            closest = seed                                              # ← new
            closest_distance = distance                                 # ← new
    return closest                                                       # ← new


print(closest_seed(center, [seed_a, seed_b, seed_c]))                    # ← new
print(closest_seed(center, [seed_a, seed_b, seed_c, seed_d_near]))       # ← new
```

The file now tests whether triangle `seed_a`-`seed_b`-`seed_c` is
Delaunay against two different candidate fourth points, and directly
confirms what an empty or non-empty circumcircle actually means for the
Voronoi diagram underneath it.

*A note on method:* `classify_point_vs_circle` is Lesson 30's own
function, retyped unchanged; `closest_seed` is Lesson 40's own function,
retyped unchanged. No new Python construct is introduced.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def classify_point_vs_circle(...)` — Lesson 30's own function,
  retyped unchanged. No re-explanation owed, per the Repetition Rule.
- `def is_delaunay_triangle(a, b, c, other_points): ...` — first
  appearance: this lesson's own actual test.
- `triangle_center = circumcenter(a, b, c)`, `triangle_radius =
  norm(subtract_points(triangle_center, a))` — Concept Unit 1's own
  function, reused, plus the triangle's own circumradius: the distance
  from the circumcenter to any one of its three equidistant vertices.
- `circumcircle = (triangle_center, triangle_radius)` — already-basic
  tuple construction, Lesson 30's own `(center, radius)` shape.
- `for p in other_points: if classify_point_vs_circle(p, circumcircle,
  0.0000001) == "inside": return False` — first appearance of the
  **empty-circumcircle property** itself: the moment even one other
  point is found strictly inside the circumcircle, the triangle fails —
  a guard clause (Lesson 25's own term), exiting immediately.
- `return True` — reached only once every other point has been checked
  and none were found inside.
- `print(is_delaunay_triangle(seed_a, seed_b, seed_c, [seed_d_far]))` —
  `seed_d_far = (10, 10)` sits well outside the circumcircle. Prints
  `True`.
- `print(is_delaunay_triangle(seed_a, seed_b, seed_c, [seed_d_near]))` —
  `seed_d_near = (3, 2)` sits well inside it. Prints `False`.
- `def closest_seed(...)` — Lesson 40's own function, retyped unchanged.
- `print(closest_seed(center, [seed_a, seed_b, seed_c]))` — prints
  `(0, 0)`: among only the three original seeds, `center` is tied
  between all three (Concept Unit 1 already proved this), and
  `closest_seed`'s own tie-breaking picks the first.
- `print(closest_seed(center, [seed_a, seed_b, seed_c, seed_d_near]))` —
  prints `(3, 2)`: the instant `seed_d_near` is added to the list,
  `center` is no longer tied at all — it's genuinely, strictly closer to
  `seed_d_near` than to any of the original three.

**The duality, proven directly.** `seed_d_near` sitting inside the
circumcircle and `seed_d_near` being the true closest seed to `center`
are not two separate facts — they're the same fact, read two different
ways. Being inside the circumcircle means being closer to its own
center than the circumcircle's radius; the circumradius is exactly
`center`'s distance to `seed_a`, `seed_b`, and `seed_c` alike. A point
closer to `center` than that distance is, by definition, closer to
`center` than the original three seeds are — which is exactly what
`closest_seed` just confirmed directly. This is the real connection
Lesson 40's own diagram and this lesson's own triangulation share: a
triangle is Delaunay exactly when its circumcenter is a genuine Voronoi
vertex of the full point set.

### CS Lens

Proving that two constructions — a triangulation and a spatial
partition — describe the exact same underlying structure, from two
different starting points, is what makes them a genuine **mathematical
dual**, not just two unrelated algorithms that happen to use similar
tools.

```
Also recognized in: computer graphics mesh generation (Delaunay
triangulation is the standard way to turn a scattered point cloud into a
usable triangle mesh, specifically because its empty-circumcircle
property avoids long, thin, badly-shaped triangles), geographic
information systems (terrain models built from elevation survey points
use Delaunay triangulation for the identical reason — well-shaped
triangles interpolate elevation between points more reliably), and
finite element analysis in engineering simulation (structural and fluid
simulations mesh a physical part using Delaunay-quality triangles,
because badly shaped elements produce numerically unstable simulation
results)
```

### SE Lens

The design principle is **verifying a claimed duality with a direct,
concrete test, rather than trusting the theory alone**. The alternative
not chosen: state that Delaunay triangulation and Voronoi diagrams are
mathematical duals, cite the empty-circumcircle property as the reason,
and move on without ever checking a real example against both
constructions.

That alternative is mathematically true, and this curriculum could have
simply asserted it. The real value of this unit's own approach: running
`closest_seed` against the *same* `center` value, before and after
adding `seed_d_near`, turns an abstract claim about duality into a
directly observed fact — the exact moment a triangle stops being
Delaunay is the exact moment its own circumcenter stops being a real
Voronoi vertex, confirmed with the same tools, not just asserted from
theory.

### Commands Needed

`python geometry_lesson_41.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
(3.0, 2.25)
3.75
3.75
3.75
True
True
True
False
(0, 0)
(3, 2)
```

Verified by actually running the updated file above.

### Connection

The empty-circumcircle test and the direct `closest_seed` check agree
completely: `seed_d_far` leaves the triangle Delaunay and `center` a
genuine Voronoi vertex; `seed_d_near` breaks both at once. Connect the
Pieces, below, traces the full duality one more time, start to finish.

---

## Connect the Pieces

One triangle and one extra point, traced through everything this lesson
built, start to finish:

1. `seed_a = (0, 0)`, `seed_b = (6, 0)`, `seed_c = (3, 6)` —
   `circumcenter` finds `(3.0, 2.25)`, proven equidistant (`3.75`) from
   all three by `nearly_equal`.
2. `is_delaunay_triangle(seed_a, seed_b, seed_c, [seed_d_far])` returns
   `True` — `seed_d_far = (10, 10)` sits outside the circumcircle.
3. `is_delaunay_triangle(seed_a, seed_b, seed_c, [seed_d_near])` returns
   `False` — `seed_d_near = (3, 2)` sits inside it.
4. `closest_seed(center, [seed_a, seed_b, seed_c])` ties among the
   original three; adding `seed_d_near` to that same list changes the
   answer entirely, to `seed_d_near` itself — the empty-circumcircle
   test and the direct nearest-seed check agree exactly, because they're
   testing the identical underlying fact.

## What Breaks Without This

`is_delaunay_triangle`'s own `other_points` argument only checks the
points it's actually given. Prove what happens when a real nearby point
is left out of that list by mistake:

```python
print(is_delaunay_triangle(seed_a, seed_b, seed_c, [seed_d_far]))
```

```
True
```

Verified by actually running this — reusing this lesson's own
`is_delaunay_triangle`, called with only `seed_d_far` in its
`other_points` list, exactly as Concept Unit 2 already did. Left
unchanged, this reports the triangle as Delaunay — correctly, *for this
specific list of other points*. But `seed_d_near` genuinely exists in
this lesson's own point set and genuinely sits inside the circumcircle;
if a real triangulation algorithm building up a full mesh forgot to pass
it into the check — perhaps because of a bug elsewhere that dropped one
point from the candidate list — `is_delaunay_triangle` would have no way
to know, and would confidently approve a triangle that is not actually
Delaunay at all. This function's own correctness depends entirely on
being handed *every* other point that could matter, the same
completeness requirement Lesson 27's `are_points_collinear` already
depended on for its own input batch.

## Exercises

1. Using `circumcenter`, verify that computing it from `bisector(a, c)`
   and `bisector(b, c)` instead of `bisector(a, b)` and `bisector(b,
   c)` gives the identical point. Explain why the specific pair of
   bisectors chosen shouldn't matter.
2. Build a fourth point that sits exactly `on` the circumcircle (use
   `classify_point_vs_circle` to confirm), rather than inside or outside
   it. Predict, then verify, what `is_delaunay_triangle` reports for
   this borderline case, and explain what a point exactly on the
   circumcircle means geometrically (a real, named case in Delaunay
   triangulation, not just an edge case in this lesson's own code).
3. Using `is_delaunay_triangle`, test the triangle formed by `seed_a`,
   `seed_b`, and `seed_d_near` (a different three-point combination from
   this lesson's own main triangle) against `seed_c` as the sole
   candidate other point. Determine whether this alternative triangle is
   Delaunay, and compare your answer to this lesson's own original
   triangle's result.

## Definition of Done

- [ ] `geometry_lesson_41.py` exists and runs with no errors via `python
      geometry_lesson_41.py`.
- [ ] Running it prints the full 10-line sequence shown in Concept Unit
      2's Run It, ending in `True`, `False`, `(0, 0)`, then `(3, 2)` —
      matching this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, what the
      empty-circumcircle property is and why it defines a Delaunay
      triangle.
- [ ] You can explain, in your own words, why a point inside a triangle's
      circumcircle being closer to `center` than the triangle's own
      vertices are is the *same fact* as that triangle failing the
      Delaunay test, not just a related one.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Connect Delaunay triangulation to Voronoi diagrams via the empty-circumcircle property"`,
      not `git commit -m "add is_delaunay_triangle"`.

Next: Lesson 42 — Polygon Triangulation, which returns to a single
polygon's own interior, breaking it into triangles directly rather than
building outward from scattered seed points the way this lesson and
Lesson 40 both did.
