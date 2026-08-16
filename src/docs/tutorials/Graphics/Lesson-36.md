# Lesson 36: Polygon-Polygon Intersection

**What you will build:** `count_boundary_intersections`, checking every
edge of one polygon against every edge of another using this
curriculum's first genuinely **nested loop**, reusing Lesson 25's
`segment_intersection` unchanged at the very center of it. Then
`polygons_intersect`, which discovers that a boundary-crossing count of
zero is genuinely ambiguous — it means either "these shapes never come
near each other" or "one shape sits entirely inside the other with room
to spare" — and resolves the difference using Lesson 35's
`is_point_in_polygon`. The transferable problem: every intersection this
curriculum has found so far — two lines, two circles, a line and a
polygon's own edges — involved exactly one shape crossing another's
*single* boundary. Two polygons have two boundaries, checked against
each other in full, and "zero crossings" turns out not to mean what it
would for any simpler pair of shapes.

**What you need to know first:** Lesson 25's `segment_intersection`,
Lesson 33's `get_edge` and accumulator loop, and Lesson 35's
`is_point_in_polygon`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–35.

**Terms introduced in this lesson:**

None. This lesson combines Lesson 25, 33, and 35's own already-introduced
material into a new arrangement — nesting an already-taught `for` loop
inside another — without introducing a new named concept.

**Objects and methods used:**

None. `count_boundary_intersections` and `polygons_intersect` are
hand-authored project code, built from Lesson 2, 8, 25, 33, and 35's own
reused functions.

---

## Concept Unit: Every Edge Against Every Edge — A Nested Loop

### The Problem

Two polygons' boundaries can cross anywhere along either shape — there's
no way to know in advance which edge of polygon A might meet which edge
of polygon B. The only reliable approach is to check every possible
pairing: every edge of A against every edge of B.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–35.
- **Files affected:** `geometry_lesson_36.py` — created, as a new file
  for this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def is_t_on_segment(t):
    return 0 <= t <= 1


def segment_intersection(segment1_start, segment1_end, segment2_start, segment2_end):
    dir1 = subtract_points(segment1_end, segment1_start)
    dir2 = subtract_points(segment2_end, segment2_start)
    denominator = cross_product(dir1, dir2)

    if denominator == 0:
        return "no intersection"

    diff = subtract_points(segment2_start, segment1_start)
    t = cross_product(diff, dir2) / denominator
    s = cross_product(diff, dir1) / denominator

    if is_t_on_segment(t) == False:
        return "no intersection"

    if is_t_on_segment(s) == False:
        return "no intersection"

    return point_on_line(segment1_start, dir1, t)


def get_edge(polygon, i):
    start = polygon[i]
    end = polygon[(i + 1) % len(polygon)]
    return (start, end)


def count_boundary_intersections(polygon_a, polygon_b):
    count = 0
    for i in range(len(polygon_a)):
        edge_a = get_edge(polygon_a, i)
        for j in range(len(polygon_b)):
            edge_b = get_edge(polygon_b, j)
            result = segment_intersection(edge_a[0], edge_a[1], edge_b[0], edge_b[1])
            if result != "no intersection":
                count = count + 1
    return count


square_a = [(0, 0), (4, 0), (4, 4), (0, 4)]
square_b = [(2, 2), (6, 2), (6, 6), (2, 6)]
separate_square = [(10, 10), (11, 10), (11, 11), (10, 11)]

print(count_boundary_intersections(square_a, square_b))
print(count_boundary_intersections(square_a, separate_square))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* every function through `get_edge` is retyped
unchanged from Lessons 2, 8, 21, 25, and 33. A `for` loop nested inside
another `for` loop uses the identical loop construct twice, already
given full treatment in Lesson 27 — no new Python construct appears
here, so no isolated throwaway lab is needed; what's new is the
*combination*, not the syntax.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def add_vector_to_point(...)` through `def get_edge(polygon, i):
  ...` — Lesson 2, 3, 8, 21, 25, and 33's own functions, retyped
  unchanged. No re-explanation owed, per the Repetition Rule.
- `def count_boundary_intersections(polygon_a, polygon_b): ...` — first
  appearance: this lesson's own subject.
- `count = 0` — Lesson 33's own accumulator pattern, restated.
- `for i in range(len(polygon_a)): edge_a = get_edge(polygon_a, i)` —
  already-basic reuse: the outer loop, visiting each edge of `polygon_a`
  in turn.
- `for j in range(len(polygon_b)): edge_b = get_edge(polygon_b, j)` —
  first appearance of a **nested loop**: for every single edge the outer
  loop selects, this inner loop runs *all the way through* every edge of
  `polygon_b` before the outer loop advances to its own next edge — the
  same `for`/`range`/`get_edge` pattern as the outer loop, just placed
  inside it.
- `result = segment_intersection(edge_a[0], edge_a[1], edge_b[0],
  edge_b[1])` — Lesson 25's own function, reused unchanged, checking
  this one specific pairing of edges.
- `if result != "no intersection": count = count + 1` — already-basic
  reuse, identical to Lesson 35's own crossing-counting pattern.
- `return count` — the total number of edge pairs that actually cross.

**Execution trace, for `square_a` (4 edges) against `separate_square` (4
edges) — 16 total pairings, all resulting in `"no intersection"` since
the two squares are nowhere near each other:**

1. `i = 0` (outer loop, `edge_a = get_edge(square_a, 0)`) — the inner
   loop runs completely: `j = 0, 1, 2, 3`, checking `edge_a` against all
   four of `separate_square`'s edges. All four return `"no
   intersection"` — the squares are `10` units apart, far too distant for
   any pair to cross.
2. `i = 1` — the inner loop runs again, `j = 0, 1, 2, 3`, against the
   *same* four edges of `separate_square`, this time paired with
   `square_a`'s second edge. Still no crossings.
3. `i = 2`, then `i = 3` — the identical pattern repeats twice more.
   Every one of the `4 × 4 = 16` possible edge pairings has now been
   checked exactly once, and `count` remains `0` throughout.

### CS Lens

Checking every pairing between two collections by nesting one loop
inside another is one of the most common structural patterns in all of
programming, worth recognizing on its own, separate from the loops
themselves.

```
Also recognized in: collision detection between two groups of objects
(a naive broad-phase collision check compares every object in group A
against every object in group B, exactly this nested structure, before
faster spatial data structures — Lesson 43 — replace it), database join
operations (a nested-loop join, one of the classic ways a database
engine combines two tables, compares every row of one against every row
of the other, the same shape as this lesson's own edge-pair check), and
matrix multiplication (Lesson 15's own `multiply_matrices`, built from
`dot3` calls against every row-column pairing, is this same nested
structure, just written out by hand instead of as an explicit nested
loop)
```

### SE Lens

The design principle is **checking every possible pairing exhaustively,
when there's no cheaper way to know in advance which pairs might
matter**. The alternative not chosen: only check edges that "look close"
to each other somehow, skipping pairs that seem unlikely to cross.

That alternative would be faster for polygons with many edges, but
requires deciding, correctly, which pairs are safe to skip — a real,
nontrivial problem on its own (and exactly what spatial partitioning,
Lesson 43, eventually solves properly). This lesson's own exhaustive
check is slower — `4 × 4 = 16` checks for two four-sided squares, growing
to the full product of both edge counts for larger shapes — but it's
guaranteed correct: no genuine crossing can ever be skipped, because
every possible pairing is actually checked.

### Commands Needed

`python geometry_lesson_36.py` — same interpreter and command as every
prior lesson.

### Run It

```
2
0
```

Verified by actually running the file above.

### Connection

Two genuinely overlapping squares show `2` boundary crossings; two
distant squares show `0`. The next unit discovers that `0` doesn't always
mean what it seems to.

---

## Concept Unit: When Boundaries Never Cross — the Nested Case

### The Problem

`separate_square` — far from `square_a` — correctly showed `0` boundary
crossings. Check what a small square placed *entirely inside*
`square_a`, with room on every side, shows — and whether `0` crossings
still means "these shapes don't overlap."

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_36.py` — modified.
- **Change type:** add.
- **Location:** appended below the final
  `print(count_boundary_intersections(...))` line added in Concept Unit
  1.
- **Dependencies:** Concept Unit 1's `count_boundary_intersections`,
  `get_edge`, `segment_intersection`, `square_a`.

### The New Code

```python
def count_ray_crossings(point, far_point, polygon):
    count = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        edge_start = edge[0]
        edge_end = edge[1]
        result = segment_intersection(point, far_point, edge_start, edge_end)
        if result != "no intersection":
            count = count + 1
    return count


def is_point_in_polygon(point, polygon):
    far_point = (point[0] + 1000, point[1])
    crossings = count_ray_crossings(point, far_point, polygon)
    return crossings % 2 == 1


def polygons_intersect(polygon_a, polygon_b):
    if count_boundary_intersections(polygon_a, polygon_b) > 0:
        return True

    if is_point_in_polygon(polygon_b[0], polygon_a):
        return True

    if is_point_in_polygon(polygon_a[0], polygon_b):
        return True

    return False


nested_square = [(1, 1), (2, 1), (2, 2), (1, 2)]

print(count_boundary_intersections(square_a, nested_square))
print(polygons_intersect(square_a, square_b))
print(polygons_intersect(square_a, nested_square))
print(polygons_intersect(square_a, separate_square))
```

### The Updated Project

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def is_t_on_segment(t):
    return 0 <= t <= 1


def segment_intersection(segment1_start, segment1_end, segment2_start, segment2_end):
    dir1 = subtract_points(segment1_end, segment1_start)
    dir2 = subtract_points(segment2_end, segment2_start)
    denominator = cross_product(dir1, dir2)

    if denominator == 0:
        return "no intersection"

    diff = subtract_points(segment2_start, segment1_start)
    t = cross_product(diff, dir2) / denominator
    s = cross_product(diff, dir1) / denominator

    if is_t_on_segment(t) == False:
        return "no intersection"

    if is_t_on_segment(s) == False:
        return "no intersection"

    return point_on_line(segment1_start, dir1, t)


def get_edge(polygon, i):
    start = polygon[i]
    end = polygon[(i + 1) % len(polygon)]
    return (start, end)


def count_boundary_intersections(polygon_a, polygon_b):
    count = 0
    for i in range(len(polygon_a)):
        edge_a = get_edge(polygon_a, i)
        for j in range(len(polygon_b)):
            edge_b = get_edge(polygon_b, j)
            result = segment_intersection(edge_a[0], edge_a[1], edge_b[0], edge_b[1])
            if result != "no intersection":
                count = count + 1
    return count


square_a = [(0, 0), (4, 0), (4, 4), (0, 4)]
square_b = [(2, 2), (6, 2), (6, 6), (2, 6)]
separate_square = [(10, 10), (11, 10), (11, 11), (10, 11)]

print(count_boundary_intersections(square_a, square_b))
print(count_boundary_intersections(square_a, separate_square))


def count_ray_crossings(point, far_point, polygon):                      # ← new
    count = 0                                                            # ← new
    for i in range(len(polygon)):                                       # ← new
        edge = get_edge(polygon, i)                                     # ← new
        edge_start = edge[0]                                            # ← new
        edge_end = edge[1]                                              # ← new
        result = segment_intersection(point, far_point, edge_start, edge_end)  # ← new
        if result != "no intersection":                                # ← new
            count = count + 1                                           # ← new
    return count                                                         # ← new


def is_point_in_polygon(point, polygon):                                 # ← new
    far_point = (point[0] + 1000, point[1])                              # ← new
    crossings = count_ray_crossings(point, far_point, polygon)          # ← new
    return crossings % 2 == 1                                           # ← new


def polygons_intersect(polygon_a, polygon_b):                            # ← new
    if count_boundary_intersections(polygon_a, polygon_b) > 0:          # ← new
        return True                                                      # ← new
                                                                           # ← new
    if is_point_in_polygon(polygon_b[0], polygon_a):                    # ← new
        return True                                                      # ← new
                                                                           # ← new
    if is_point_in_polygon(polygon_a[0], polygon_b):                    # ← new
        return True                                                      # ← new
                                                                           # ← new
    return False                                                         # ← new


nested_square = [(1, 1), (2, 1), (2, 2), (1, 2)]                        # ← new

print(count_boundary_intersections(square_a, nested_square))             # ← new
print(polygons_intersect(square_a, square_b))                            # ← new
print(polygons_intersect(square_a, nested_square))                       # ← new
print(polygons_intersect(square_a, separate_square))                     # ← new
```

The file now correctly distinguishes every real case: genuine boundary
crossings, one shape nested inside the other, and two shapes nowhere
near each other.

*A note on method:* `count_ray_crossings` and `is_point_in_polygon` are
Lesson 35's own functions, retyped unchanged; `polygons_intersect` uses
only already-covered function calls and `if`/`else`. No new Python
construct is introduced.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def count_ray_crossings(...)`, `def is_point_in_polygon(...)` —
  Lesson 35's own functions, retyped unchanged. No re-explanation owed,
  per the Repetition Rule.
- `def polygons_intersect(polygon_a, polygon_b): ...` — first
  appearance: this lesson's own final predicate.
- `if count_boundary_intersections(polygon_a, polygon_b) > 0: return
  True` — a **guard clause** (Lesson 25's own term), checked first: any
  real boundary crossing at all is already enough to confirm the shapes
  overlap.
- `if is_point_in_polygon(polygon_b[0], polygon_a): return True` — first
  appearance of this lesson's own resolving step: reached only when the
  boundaries never cross at all. If even one vertex of `polygon_b` is
  found inside `polygon_a` (Lesson 35's own predicate, reused unchanged),
  `polygon_b` must be sitting entirely inside `polygon_a` — a real
  overlap, with no boundary crossing anywhere.
- `if is_point_in_polygon(polygon_a[0], polygon_b): return True` — the
  identical check in the other direction, for the case where `polygon_a`
  is the one nested inside `polygon_b` instead.
- `return False` — reached only when there are no boundary crossings and
  neither polygon's own first vertex sits inside the other: genuinely
  separate shapes.
- `nested_square = [(1, 1), (2, 1), (2, 2), (1, 2)]` — a small square,
  entirely inside `square_a`'s own `4`-by-`4` bounds, with room to spare
  on every side.
- `print(count_boundary_intersections(square_a, nested_square))` —
  prints `0`: not one of the `16` possible edge pairings crosses,
  because `nested_square` never touches `square_a`'s own boundary
  anywhere.
- `print(polygons_intersect(square_a, square_b))` — prints `True` — the
  genuinely overlapping case, caught by the first guard clause.
- `print(polygons_intersect(square_a, nested_square))` — prints `True`
  — the nested case, caught by the second check:
  `is_point_in_polygon(nested_square[0], square_a)` finds `(1, 1)`
  genuinely inside `square_a`.
- `print(polygons_intersect(square_a, separate_square))` — prints
  `False` — every check fails: no boundary crossings, and neither
  polygon's first vertex sits inside the other.

### CS Lens

Recognizing that a single test (boundary crossings) is genuinely
ambiguous — it can't distinguish two structurally different real
situations — and adding a second, independent test to resolve the
ambiguity is a discipline this curriculum has already applied more than
once.

```
Also recognized in: containment hierarchies in CAD (a solid model's
"contains" relationship between features can't always be determined by
boundary intersection alone — a fully enclosed void needs a containment
test, not just a surface-crossing test), geofencing software (checking
whether a moving vehicle's GPS track has entered a defined region needs
both a boundary-crossing check and, for the vehicle's very first
position, a containment check — exactly this lesson's own two-part
structure), and set theory itself (two sets can be disjoint, overlapping,
or one fully contained in the other — three genuinely different
relationships that "do their boundaries intersect" alone cannot
distinguish, the same three cases this lesson's own closing traces)
```

### SE Lens

The design principle is **recognizing when a cheap check is
insufficient, rather than trusting it because it's usually right**. The
alternative not chosen: use `count_boundary_intersections(polygon_a,
polygon_b) > 0` as the entire definition of "intersects," the way it
might look sufficient after only testing `square_b` and
`separate_square`.

That alternative would have passed every test this lesson ran *except*
one — `nested_square` — and might easily have shipped undetected, since
two of this lesson's own three test cases happen to agree with it. The
real cost of trusting a check that's right most of the time: the one
case it gets wrong doesn't announce itself as wrong; it just silently
returns a plausible-looking `False` for shapes that are unmistakably
overlapping, exactly this lesson's own closing section proves.

### Commands Needed

`python geometry_lesson_36.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
2
0
0
True
True
False
```

Verified by actually running the updated file above.

### Connection

`polygons_intersect` correctly handles all three real cases. Connect the
Pieces, below, traces the nested-square case, and What Breaks Without
This proves the boundary-only check really would have missed it.

---

## Connect the Pieces

Three polygon pairs, traced through everything this lesson built, start
to finish:

1. `square_a` and `square_b` genuinely overlap, corner-to-corner —
   `count_boundary_intersections` finds `2` real crossings, and
   `polygons_intersect` returns `True` from its very first check.
2. `square_a` and `nested_square` — `nested_square` sits entirely inside
   `square_a`, touching nothing — `count_boundary_intersections` finds
   `0`. `polygons_intersect`'s first guard clause fails, but
   `is_point_in_polygon(nested_square[0], square_a)` finds `(1, 1)`
   genuinely inside, and the function still correctly returns `True`.
3. `square_a` and `separate_square` — genuinely apart —
   `count_boundary_intersections` also finds `0`, but neither vertex
   check finds anything inside the other, and `polygons_intersect`
   correctly returns `False`.

## What Breaks Without This

Prove directly that boundary crossings alone can't distinguish Concept
Unit 2's two zero-crossing cases, using only
`count_boundary_intersections` and nothing else:

```python
square_a = [(0, 0), (4, 0), (4, 4), (0, 4)]
nested_square = [(1, 1), (2, 1), (2, 2), (1, 2)]
separate_square = [(10, 10), (11, 10), (11, 11), (10, 11)]

print(count_boundary_intersections(square_a, nested_square) > 0)
print(count_boundary_intersections(square_a, separate_square) > 0)
```

```
False
False
```

Verified by actually running this (reusing this lesson's own already-
defined `count_boundary_intersections`). A version of `polygons_intersect`
built on nothing but `count_boundary_intersections(...) > 0` would
report `False` for *both* of these — correctly for `separate_square`,
but silently, wrongly, for `nested_square`, which is unmistakably,
visibly overlapping `square_a` entirely. No crash, no error — just a
confidently wrong answer for any shape fully enclosed by another, exactly
the gap Concept Unit 2's own `is_point_in_polygon` fallback exists to
close.

## Exercises

1. Using `polygons_intersect`, build a case where `square_a` is the one
   nested *inside* a larger polygon instead of the other way around, and
   confirm the function's third check (`is_point_in_polygon(polygon_a[0],
   polygon_b)`) is the one that catches it.
2. Build two polygons that share exactly one boundary point — for
   example, two squares that touch only at a single shared corner.
   Predict, then verify, what `count_boundary_intersections` reports for
   this case, keeping Lesson 35's own vertex-straddling limitation in
   mind.
3. Using `count_boundary_intersections`, count how many total edge-pair
   checks a `4`-edge square against a `6`-edge hexagon would require, and
   confirm your prediction by building a real hexagon and counting the
   actual number of `segment_intersection` calls the nested loop makes.

## Definition of Done

- [ ] `geometry_lesson_36.py` exists and runs with no errors via `python
      geometry_lesson_36.py`.
- [ ] Running it prints `2`, `0`, `0`, `True`, `True`, then `False` —
      matching this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, why a boundary
      crossing count of `0` is genuinely ambiguous between two different
      real situations.
- [ ] You can explain how `polygons_intersect` resolves that ambiguity,
      naming which Lesson 35 function it reuses and why checking just one
      vertex from each polygon is enough.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Detect polygon overlap via nested edge checks, resolving the nested-shape ambiguity with point-in-polygon"`,
      not `git commit -m "add polygons_intersect"`.

Next: Lesson 37 — Convexity, which names and tests a property every
polygon this curriculum has used so far happens to have — reusing Lesson
19's `classify_turn` at every vertex to check whether a polygon ever
turns both ways.
