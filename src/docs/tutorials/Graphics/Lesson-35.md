# Lesson 35: Point-in-Polygon

**What you will build:** `is_point_in_polygon`, deciding whether a point
sits inside a polygon by casting a ray from it out past the shape's edge
and counting how many boundary edges that ray actually crosses — reusing
Lesson 25's own `segment_intersection`, completely unchanged, to do the
actual crossing checks. An odd number of crossings means inside; an even
number means outside. The transferable problem: every containment
question this curriculum has answered so far (Lesson 30's circle,
Lesson 18's line) had a simple algebraic test — a distance, a sign. A
polygon has no such single formula; whether a point is inside depends on
the *whole* boundary at once, and ray casting is the classic way to turn
that whole-boundary question into something this curriculum already
knows how to count.

**What you need to know first:** Lesson 25's `segment_intersection` and
its own guard-clause structure, Lesson 33's `get_edge` and accumulator
loop pattern, and Lesson 22's ray concept (reused here as a very long
segment, not the earlier `is_point_on_ray` machinery itself).

**Assumed background (outside this curriculum):** unchanged from Lessons
1–34.

**Terms introduced in this lesson:**

- **Ray casting** — determining whether a point is inside a shape by
  drawing an imaginary ray from that point out to infinity (approximated
  here by a very distant point) and counting how many times it crosses
  the shape's boundary. Why: this is the technique this lesson uses to
  turn "is this point inside" — a question about the whole polygon at
  once — into "how many edges does this one ray cross" — a question this
  curriculum can already answer, edge by edge.
- **Crossing number parity** — the rule that an *odd* number of boundary
  crossings means the ray started inside the shape, and an *even* number
  means it started outside. Why: this is the one fact that turns a plain
  crossing count into an actual inside/outside answer, and it holds for
  any simple polygon, no matter how many sides it has.

**Objects and methods used:**

None. `count_ray_crossings` and `is_point_in_polygon` are hand-authored
project code, built from Lesson 2, 8, 25, and 33's own reused functions.

---

## Concept Unit: Casting a Ray — Reusing segment_intersection

### The Problem

A ray, for this purpose, doesn't need Lesson 22's full `is_point_on_ray`
machinery — it just needs to be *long enough* to be certain it exits the
polygon on the far side. Represent it as an ordinary segment, running
from the test point out to some point far past the polygon, and count how
many of the polygon's own edges it actually crosses.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–34.
- **Files affected:** `geometry_lesson_35.py` — created, as a new file
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


polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]

inside_point = (2, 1.5)
inside_far_point = (inside_point[0] + 1000, inside_point[1])

outside_point = (10, 10)
outside_far_point = (outside_point[0] + 1000, outside_point[1])

print(count_ray_crossings(inside_point, inside_far_point, polygon))
print(count_ray_crossings(outside_point, outside_far_point, polygon))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* every function through `get_edge` is retyped
unchanged from Lessons 2, 8, 21, 25, and 33. `!=`, used below, is the
same category of already-basic comparison operator as `==`, established
since Lesson 5. No new Python construct appears here, so no isolated
throwaway lab is needed.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def add_vector_to_point(...)` through `def get_edge(polygon, i):
  ...` — Lesson 2, 3, 8, 21, 25, and 33's own functions, retyped
  unchanged. No re-explanation owed, per the Repetition Rule.
- `def count_ray_crossings(point, far_point, polygon): ...` — first
  appearance: this lesson's own subject.
- `count = 0` — Lesson 33's own accumulator pattern, restated: a running
  total, this time counting crossings instead of summing lengths.
- `for i in range(len(polygon)): ...` — already-basic reuse, Lesson 33's
  own indexed loop.
- `edge = get_edge(polygon, i)`, `edge_start = edge[0]`, `edge_end =
  edge[1]` — already-basic reuse, identical to Lesson 33 and 34's own
  unpacking.
- `result = segment_intersection(point, far_point, edge_start,
  edge_end)` — Lesson 25's own function, reused *completely unchanged* —
  treating the ray, from `point` to `far_point`, as an ordinary segment,
  and each polygon edge as another ordinary segment, exactly the shape
  `segment_intersection` was already built to handle.
- `if result != "no intersection": count = count + 1` — first
  appearance: whenever the ray genuinely crosses this edge, the
  accumulator increases by one.
- `return count` — the total number of edges the ray actually crossed.
- `polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]` — Lesson 33's own
  rectangle, reused.
- `inside_point = (2, 1.5)`, `inside_far_point = (inside_point[0] +
  1000, inside_point[1])` — a point comfortably inside the rectangle,
  and a ray extending `1000` units to the right of it — far enough past
  the rectangle's own `x = 4` edge to guarantee it exits cleanly.
- `outside_point = (10, 10)`, `outside_far_point` — a point well outside
  the rectangle entirely, with its own equally long ray.
- `print(count_ray_crossings(inside_point, inside_far_point, polygon))`
  — prints `1`: the ray from inside the rectangle crosses exactly one
  edge (the right side, `x = 4`) on its way out.
- `print(count_ray_crossings(outside_point, outside_far_point,
  polygon))` — prints `0`: a ray already outside the rectangle, heading
  further away, never crosses any edge at all.

### CS Lens

Counting how many times a cast ray crosses a shape's boundary, to
determine what's inside it, is one of the most widely implemented
algorithms in computational geometry, under exactly this name.

```
Also recognized in: SVG and PDF fill rules (the "nonzero" and "even-odd"
fill rules that decide which parts of an overlapping vector path get
filled with color are directly built on this exact ray-crossing idea),
GIS point-in-region queries (determining whether a GPS coordinate falls
within a mapped country, county, or property boundary uses this same
algorithm, just at the scale of real-world coordinate data), and video
game hit-testing (deciding whether a mouse click or a game object's
position falls inside an irregularly shaped UI region or collision
boundary is frequently implemented with this exact ray-casting approach)
```

### SE Lens

The design principle is **reducing a whole-shape question to a sequence
of already-solved pairwise questions**, rather than deriving a new
formula for "is this point inside an N-sided shape" directly. The
alternative not chosen: derive a closed-form point-in-polygon formula
mathematically, the way Lesson 31 derived a closed-form formula for
circle-line intersection.

That alternative doesn't actually exist in a simple form for an arbitrary
polygon — unlike a circle, a polygon has no single equation describing
its interior. Ray casting sidesteps that entirely: it never needs to know
the polygon's shape as a formula, only its edges, one at a time, which
`segment_intersection` was already fully capable of testing.

### Commands Needed

`python geometry_lesson_35.py` — same interpreter and command as every
prior lesson.

### Run It

```
1
0
```

Verified by actually running the file above.

### Connection

A ray from inside the rectangle crosses exactly one edge; a ray from
outside crosses none. The next unit turns that crossing count into an
actual inside/outside answer.

---

## Concept Unit: Odd In, Even Out — the Point-in-Polygon Rule

### The Problem

A crossing count alone isn't yet an inside/outside answer — one crossing
and three crossings should both mean "inside," while zero and two should
both mean "outside." Turn the count into a real yes/no result.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_35.py` — modified.
- **Change type:** add.
- **Location:** appended below the final `print(count_ray_crossings(...))`
  line added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `count_ray_crossings`,
  `inside_point`, `outside_point`, `polygon`.

### The New Code

```python
def is_point_in_polygon(point, polygon):
    far_point = (point[0] + 1000, point[1])
    crossings = count_ray_crossings(point, far_point, polygon)
    return crossings % 2 == 1


print(is_point_in_polygon(inside_point, polygon))
print(is_point_in_polygon(outside_point, polygon))
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


polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]

inside_point = (2, 1.5)
inside_far_point = (inside_point[0] + 1000, inside_point[1])

outside_point = (10, 10)
outside_far_point = (outside_point[0] + 1000, outside_point[1])

print(count_ray_crossings(inside_point, inside_far_point, polygon))
print(count_ray_crossings(outside_point, outside_far_point, polygon))


def is_point_in_polygon(point, polygon):                                 # ← new
    far_point = (point[0] + 1000, point[1])                              # ← new
    crossings = count_ray_crossings(point, far_point, polygon)          # ← new
    return crossings % 2 == 1                                           # ← new


print(is_point_in_polygon(inside_point, polygon))                        # ← new
print(is_point_in_polygon(outside_point, polygon))                       # ← new
```

The file now answers the actual question this lesson set out to
answer: a plain `True` or `False`, not just a crossing count.

*A note on method:* `%` was already given full treatment in Lesson 33.
No new Python construct is introduced.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def is_point_in_polygon(point, polygon): ...` — first appearance:
  this lesson's own final predicate.
- `far_point = (point[0] + 1000, point[1])` — first appearance of
  building the ray's own far endpoint automatically, from the test point
  itself, rather than requiring the caller to supply one by hand the way
  Concept Unit 1 did.
- `crossings = count_ray_crossings(point, far_point, polygon)` — Concept
  Unit 1's own function, reused.
- `return crossings % 2 == 1` — a **hard concept reappearing**: `%`,
  already given full treatment in Lesson 33, applied here to test
  **crossing number parity**: `crossings % 2` is `1` for any odd count,
  `0` for any even one, and comparing that to `1` turns "how many
  crossings" into "was it odd" — this lesson's actual inside/outside
  answer.
- `print(is_point_in_polygon(inside_point, polygon))` — `1 % 2 == 1` is
  `True`. Prints `True`.
- `print(is_point_in_polygon(outside_point, polygon))` — `0 % 2 == 1` is
  `False`. Prints `False`.

**Why odd means inside.** Starting at the test point and following the
ray outward, each edge crossing switches which side of the boundary the
ray currently sits on — inside becomes outside, or outside becomes
inside, every single time. Starting inside and ending far outside
(`far_point` is always chosen well past the shape) means that switch has
to happen an *odd* number of times, no matter how many sides the polygon
has or how it's shaped; starting outside and ending outside means it has
to happen an *even* number of times, including zero.

### CS Lens

Using the parity — odd versus even — of a count, rather than its exact
value, to decide a binary outcome is a small but genuinely recurring
technique.

```
Also recognized in: error-detection codes (a parity bit in early
computer memory and communication protocols flags a transmission error
by checking whether the number of `1` bits received is odd or even,
exactly the same "count, then check parity" structure), graph theory
(whether an Eulerian path exists in a graph depends on the parity of how
many vertices have an odd number of connections), and the even-odd fill
rule named in this lesson's own CS Lens above — the exact same parity
test, used by name in vector graphics software)
```

### SE Lens

The design principle is **deriving the final yes/no answer from a
single, cheap arithmetic check on an already-computed count**, rather
than tracking "inside" or "outside" as a running state updated during
the loop itself. The alternative not chosen: maintain a boolean flag
inside `count_ray_crossings`'s own loop, flipping it every time a
crossing is found, and returning that flag directly instead of a count.

That alternative would work, and would avoid the final `% 2 == 1` step
entirely. The real value of keeping the plain count separate: `count_ray_crossings`
stays useful on its own, for anything that might want the actual number
of crossings — not just whether it was odd — while `is_point_in_polygon`
adds only the one small interpretation step needed to turn that general
count into this lesson's specific yes/no answer.

### Commands Needed

`python geometry_lesson_35.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
1
0
True
False
```

Verified by actually running the updated file above.

### Connection

`is_point_in_polygon` correctly reports `True` for a point inside the
rectangle and `False` for one outside it. What Breaks Without This, below,
shows the one case this straightforward version doesn't yet handle
correctly.

---

## Connect the Pieces

Two points, traced through everything this lesson built, start to
finish:

1. `polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]`.
2. `inside_point = (2, 1.5)`: a ray to `(1002, 1.5)` crosses exactly one
   edge — the right side. `1 % 2 == 1` is `True`: reported inside.
3. `outside_point = (10, 10)`: a ray to `(1010, 10)` crosses zero edges.
   `0 % 2 == 1` is `False`: reported outside.
4. Both answers agree with what's visually obvious for this simple
   rectangle — the real test of the algorithm's honesty comes from a
   shape where the answer isn't obvious by inspection alone.

## What Breaks Without This

`segment_intersection`'s own bounds check, `0 <= t <= 1`, includes both
endpoints. That's normally exactly right — but it means a ray passing
directly through a polygon *vertex* can register as touching *both*
edges that share it, double-counting a single genuine crossing. Prove
it, using a pentagon with a vertex placed deliberately at the test ray's
own height:

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


notch_polygon = [(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)]
genuinely_inside_point = (1, 2)

print(count_ray_crossings(genuinely_inside_point, (genuinely_inside_point[0] + 1000, genuinely_inside_point[1]), notch_polygon))
print(is_point_in_polygon(genuinely_inside_point, notch_polygon))
```

```
2
False
```

Verified by actually running this. `notch_polygon` traces a shape with a
V-shaped notch cut into its right side, with the notch's own inner point
sitting at `(2, 2)` — exactly the height of the test point,
`genuinely_inside_point = (1, 2)`, which sits well within the shape's
solid left portion and is genuinely, visibly inside it. The ray at
`y = 2` passes directly through the notch vertex `(2, 2)` — and *both*
edges that share that vertex, `(4, 0)–(2, 2)` and `(2, 2)–(4, 4)`, report
the identical intersection point, `(2.0, 2.0)`. That's `2` crossings
instead of the single genuine crossing this ray actually makes, and `2 %
2 == 1` is `False` — `is_point_in_polygon` wrongly reports a point that
is unambiguously inside the shape as outside it, with no error or
warning of any kind. This is a well-known, real limitation of ray
casting implemented this plainly, not a mistake specific to this
lesson's own code — production implementations resolve it with a small
tie-breaking rule (treating one endpoint of each edge as included and
the other as excluded, so a shared vertex is only ever counted once).
Lesson 44, Robust 2D Geometry, is where this curriculum returns to fix
degeneracies like this one properly, rather than papering over it here.

## Exercises

1. Using `count_ray_crossings`, verify that a *vertical* ray (straight up
   instead of to the right) gives the same inside/outside answer for
   `inside_point` and `outside_point` against the original rectangle.
   Explain why the ray's own direction shouldn't matter for a correctly
   working implementation.
2. Build a polygon with a genuine hole-like concave notch that does
   *not* place any vertex at the same height as your test ray — confirm
   `is_point_in_polygon` gives correct answers for several points inside
   and outside it, now that the vertex-straddling case from this
   lesson's own closing doesn't apply.
3. Predict, then verify, what `is_point_in_polygon` reports for a point
   exactly on one of the rectangle's own edges — for example, `(0,
   1.5)`, sitting exactly on the left boundary. Explain, using
   `segment_intersection`'s own inclusive `0 <= t <= 1` bounds, why a
   boundary point's answer isn't as clean-cut as a clearly interior or
   clearly exterior one.

## Definition of Done

- [ ] `geometry_lesson_35.py` exists and runs with no errors via `python
      geometry_lesson_35.py`.
- [ ] Running it prints `1`, `0`, `True`, then `False` — matching this
      lesson's verified output exactly.
- [ ] You can explain, without looking at the file, why an odd number of
      ray crossings means a point is inside a polygon, using this
      lesson's own "each crossing switches sides" reasoning.
- [ ] You can explain the vertex-straddling double-count bug this
      lesson's own closing demonstrated, and why it's a known, real
      limitation rather than a mistake unique to this code.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Determine point-in-polygon via ray casting and crossing-number parity, reusing segment intersection"`,
      not `git commit -m "add is_point_in_polygon"`.

Next: Lesson 36 — Polygon-Polygon Intersection, which reuses this
lesson's own `segment_intersection`-per-edge approach, applied to every
edge pair between two polygons instead of one polygon and a single ray.
