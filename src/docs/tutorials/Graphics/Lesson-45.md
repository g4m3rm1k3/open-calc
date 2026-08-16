# Lesson 45: 2D Geometry Workshop

**What you will build:** `validate_part` and `check_setup`, combining
nearly every tool Section II built — polygon representation, orientation,
area, perimeter, triangulation, boundary intersection, and the
robust point-in-polygon test Lesson 44 just repaired — into one
CAD/CAM-flavored validation pipeline: confirming a single part's own
geometry is sound, then checking it against a keep-out zone and a probe
point the way a real machining setup would need to before a single cut
is made. The transferable problem: every lesson since 21 introduced or
sharpened one tool at a time, each verified in isolation. This lesson
asks whether they actually work *together*, on one real, connected
problem, the way Lesson 20 already closed out Section I.

**What you need to know first:** every lesson since 21 — this workshop
is built entirely from already-introduced material. Specifically:
Lesson 33's polygon representation and `get_edge`, Lesson 34's
`polygon_orientation` and `polygon_signed_area`, Lesson 33's
`polygon_perimeter`, Lesson 42's `triangulate`, Lesson 36's
`polygons_intersect`, and Lesson 44's `is_point_in_polygon_robust`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–44.

**Terms introduced in this lesson:**

None. This lesson is Section II's closing workshop, matching Lesson 20's
own precedent: pure synthesis, reusing already-introduced material
throughout, with no new concept, term, or Python construct anywhere in
it.

**Objects and methods used:**

None. Every function in this lesson is hand-authored project code,
reused unchanged from Lessons 2, 7, 8, 17, 21, 25, 33, 34, 35, 36, 37,
38, 42, and 44.

---

## Concept Unit: Validating One Part — Orientation, Area, and a Triangulation Cross-Check

### The Problem

Before a single boundary or containment check involving anything
*outside* a part even matters, the part's own geometry needs to be
internally sound: correctly wound, with a real, non-degenerate area, and
genuinely triangulatable — the same completeness check Lesson 42's own
closing already leaned on, now run as a matter of course rather than
only when something looks wrong.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–44.
- **Files affected:** `geometry_lesson_45.py` — created, as a new file
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


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


def get_vertex(polygon, i):
    return polygon[i % len(polygon)]


def get_edge(polygon, i):
    start = polygon[i]
    end = polygon[(i + 1) % len(polygon)]
    return (start, end)


def classify_turn(a, b, c):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))

    if turn_value > 0:
        return "left"
    elif turn_value < 0:
        return "right"
    else:
        return "straight"


def polygon_signed_area(polygon):
    total = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        v1 = edge[0]
        v2 = edge[1]
        total = total + cross_product(v1, v2)
    return total / 2


def polygon_orientation(polygon):
    signed_area = polygon_signed_area(polygon)

    if signed_area > 0:
        return "counterclockwise"
    elif signed_area < 0:
        return "clockwise"
    else:
        return "degenerate"


def polygon_perimeter(polygon):
    total = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        edge_start = edge[0]
        edge_end = edge[1]
        edge_length = norm(subtract_points(edge_end, edge_start))
        total = total + edge_length
    return total


def is_convex_vertex(polygon, i):
    prev_vertex = get_vertex(polygon, i - 1)
    current_vertex = get_vertex(polygon, i)
    next_vertex = get_vertex(polygon, i + 1)
    overall = polygon_orientation(polygon)
    local_turn = classify_turn(prev_vertex, current_vertex, next_vertex)

    if overall == "counterclockwise":
        return local_turn == "left"
    else:
        return local_turn == "right"


def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


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


def count_ray_crossings_robust(point, far_point, polygon):
    count = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        edge_start = edge[0]
        edge_end = edge[1]
        ray_dir = subtract_points(far_point, point)
        edge_dir = subtract_points(edge_end, edge_start)
        denominator = cross_product(ray_dir, edge_dir)

        if denominator != 0:
            diff = subtract_points(edge_start, point)
            t = cross_product(diff, edge_dir) / denominator
            s = cross_product(diff, ray_dir) / denominator

            if t >= 0:
                if s >= 0:
                    if s < 1:
                        count = count + 1

    return count


def is_point_in_polygon_robust(point, polygon):
    far_point = (point[0] + 1000, point[1])
    crossings = count_ray_crossings_robust(point, far_point, polygon)
    return crossings % 2 == 1


def is_vertex_of_triangle(v, triangle):
    if v == triangle[0]:
        return True
    if v == triangle[1]:
        return True
    if v == triangle[2]:
        return True
    return False


def is_ear(polygon, i):
    if is_convex_vertex(polygon, i) == False:
        return False

    prev_vertex = get_vertex(polygon, i - 1)
    current_vertex = get_vertex(polygon, i)
    next_vertex = get_vertex(polygon, i + 1)
    triangle = [prev_vertex, current_vertex, next_vertex]

    for j in range(len(polygon)):
        test_vertex = polygon[j]
        if is_vertex_of_triangle(test_vertex, triangle) == False:
            if is_point_in_polygon_robust(test_vertex, triangle):
                return False

    return True


def find_ear_index(polygon):
    for i in range(len(polygon)):
        if is_ear(polygon, i):
            return i
    return 0


def remove_vertex(polygon, i):
    result = []
    for j in range(len(polygon)):
        if j != i:
            result.append(polygon[j])
    return result


def triangulate(polygon):
    remaining = polygon
    triangles = []

    while len(remaining) > 3:
        ear_index = find_ear_index(remaining)
        prev_vertex = get_vertex(remaining, ear_index - 1)
        current_vertex = get_vertex(remaining, ear_index)
        next_vertex = get_vertex(remaining, ear_index + 1)
        triangles.append((prev_vertex, current_vertex, next_vertex))
        remaining = remove_vertex(remaining, ear_index)

    triangles.append((remaining[0], remaining[1], remaining[2]))
    return triangles


def validate_part(part):
    orientation = polygon_orientation(part)
    area = polygon_signed_area(part)
    perimeter = polygon_perimeter(part)

    triangles = triangulate(part)
    triangulated_area = 0
    for triangle in triangles:
        triangulated_area = triangulated_area + polygon_signed_area(list(triangle))
    triangulation_valid = nearly_equal(area, triangulated_area, 0.0000001)

    return (orientation, area, perimeter, triangulation_valid)


part = [(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)]

print(validate_part(part))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* every single function above is retyped unchanged
from an earlier lesson — Lessons 2, 3, 7, 8, 9, 17, 19, 21, 25, 33, 34,
35, 37, 38, 42, and 44. No new Python construct, term, or object appears
anywhere in this lesson, matching Lesson 20's own established shape for
a closing workshop.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- Every function through `triangulate` — retyped unchanged from the
  lessons named above. No re-explanation owed for any of them, per the
  Repetition Rule — this workshop's entire value is in how they combine,
  not in anything new about any one of them.
- `def validate_part(part): ...` — first appearance: this lesson's own
  first synthesis, combining four independent checks into one report.
- `orientation = polygon_orientation(part)` — Lesson 34's own function,
  reused: confirms which way the part winds.
- `area = polygon_signed_area(part)` — Lesson 34's own function, reused.
- `perimeter = polygon_perimeter(part)` — Lesson 33's own function,
  reused.
- `triangles = triangulate(part)` — Lesson 42's own function, reused:
  breaking the part into triangles, the same operation that lesson's own
  closing already proved fails loudly (or silently corrupts) on a
  genuinely invalid polygon.
- `triangulated_area`, the `for` loop, `nearly_equal(area,
  triangulated_area, 0.0000001)` — Lesson 33's own accumulator pattern
  and Lesson 17's own tolerance check, reused together: exactly the
  cross-check Lesson 42's own Concept Unit 3 already performed, now used
  as a genuine validity signal rather than only a one-off proof.
- `return (orientation, area, perimeter, triangulation_valid)` —
  already-basic tuple construction, bundling every check into one
  report.
- `part = [(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)]` — the reflex
  "notch" polygon used throughout Lessons 35, 38, 42, and 44.
- `print(validate_part(part))` — prints `('counterclockwise', 12.0,
  17.65685424949238, True)`: correctly wound, a real `12.0` units of
  area, a real perimeter, and a triangulation whose own area matches —
  every independent check agreeing this part's own geometry is sound.

### CS Lens

Running several independent, already-trusted checks together and
reporting them as one bundle, rather than treating "is this part valid"
as a single monolithic question, is the same **composition over
monoliths** principle this curriculum has followed since Lesson 12's own
`transform_to_global`.

```
Also recognized in: CAD kernel validation passes (a real solid modeling
kernel runs exactly this kind of bundled sanity check — orientation,
non-degeneracy, self-consistency — on every feature before allowing it
into a model tree), CI/CD test suites (a build pipeline runs many
independent checks — unit tests, linting, type checking — and reports
them together, rather than folding them into one all-or-nothing pass/fail
signal with no detail), and pre-flight checklists in aviation and
manufacturing (a series of independent, already-individually-understood
checks, run together before committing to an action that's expensive or
dangerous to reverse)
```

### SE Lens

The design principle is **building a workshop-level function entirely
from already-verified pieces, adding no new logic of its own beyond
their combination**. The alternative not chosen: write `validate_part`
as its own, independent implementation — computing area, orientation,
and a validity signal from scratch, without calling
`polygon_orientation`, `polygon_signed_area`, or `triangulate` at all.

That alternative would duplicate logic this curriculum already built,
verified, and trusted across four separate lessons. `validate_part`'s
own correctness instead rests entirely on the correctness of the
functions it calls — nothing new has to be proven here except that
combining four already-correct answers into one report was done
faithfully, which this unit's own real output already confirms.

### Commands Needed

`python geometry_lesson_45.py` — same interpreter and command as every
prior lesson.

### Run It

```
('counterclockwise', 12.0, 17.65685424949238, True)
```

Verified by actually running the file above.

### Connection

One part's own geometry is confirmed sound. The next unit checks it
against the outside world — the questions a real machining setup can't
skip.

---

## Concept Unit: Checking Against the Outside World — Keep-Out Zones and Probe Points

### The Problem

A geometrically sound part still isn't safe to cut until it's checked
against everything *around* it: a clamp or fixture boundary it must
avoid, and a specific point — a drilling location, say — that must
actually land inside the part's own real material.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_45.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(validate_part(part))` line
  added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `part`, `get_edge`, `segment_intersection`,
  `is_point_in_polygon_robust`.

### The New Code

```python
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


def polygons_intersect(polygon_a, polygon_b):
    if count_boundary_intersections(polygon_a, polygon_b) > 0:
        return True

    if is_point_in_polygon_robust(polygon_b[0], polygon_a):
        return True

    if is_point_in_polygon_robust(polygon_a[0], polygon_b):
        return True

    return False


def check_setup(part, keep_out, probe_point):
    clear_of_keep_out = polygons_intersect(part, keep_out) == False
    probe_inside_part = is_point_in_polygon_robust(probe_point, part)
    return (clear_of_keep_out, probe_inside_part)


keep_out_zone = [(10, 10), (11, 10), (11, 11), (10, 11)]
good_probe_point = (1, 2)

print(check_setup(part, keep_out_zone, good_probe_point))

clamp_zone = [(1, 1), (2, 1), (2, 3), (1, 3)]
bad_probe_point = (10, 2)

print(check_setup(part, clamp_zone, bad_probe_point))
```

### The Updated Project

The full, accumulated file now contains every function from Concept Unit
1, plus this unit's own five additions, appended directly below
`print(validate_part(part))`; nothing from Concept Unit 1 is altered.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def count_boundary_intersections(...)`, `def polygons_intersect(...)`
  — Lesson 36's own functions, retyped unchanged. No re-explanation
  owed, per the Repetition Rule.
- `def check_setup(part, keep_out, probe_point): ...` — first
  appearance: this lesson's own second and final synthesis.
- `clear_of_keep_out = polygons_intersect(part, keep_out) == False` —
  already-basic reuse: the part passes this check only when it does
  *not* overlap the keep-out zone at all.
- `probe_inside_part = is_point_in_polygon_robust(probe_point, part)` —
  Lesson 44's own repaired predicate, reused: exactly the version that
  correctly handles a probe point whose test ray happens to graze a
  shared vertex, not Lesson 35's own original, still-broken one.
- `return (clear_of_keep_out, probe_inside_part)` — already-basic tuple
  construction.
- `keep_out_zone = [(10, 10), (11, 10), (11, 11), (10, 11)]` — a small
  zone far from `part` entirely.
- `good_probe_point = (1, 2)` — a point well inside `part`'s own solid
  material.
- `print(check_setup(part, keep_out_zone, good_probe_point))` — prints
  `(True, True)`: clear of the keep-out zone, and the probe point
  genuinely lands inside the part — a setup safe to proceed with.
- `clamp_zone = [(1, 1), (2, 1), (2, 3), (1, 3)]` — a zone deliberately
  placed to overlap `part`'s own left side.
- `bad_probe_point = (10, 2)` — a point nowhere near `part` at all.
- `print(check_setup(part, clamp_zone, bad_probe_point))` — prints
  `(False, False)`: the clamp genuinely intrudes on the part, *and* the
  probe point genuinely misses it — two real, independent problems,
  caught by two independent, already-trusted checks, both correctly
  reporting failure rather than either silently passing.

### CS Lens

Running a real-world safety check as a composition of independent
geometric predicates, each already proven correct in isolation, is the
practical payoff every lesson in Section II has been building toward
since Lesson 21's own first line segment.

```
Also recognized in: robotic motion planning (a planned tool path is
validated against both a workspace boundary and a set of obstacle
zones, using exactly this two-part "clear of obstacles, reaches the
target" structure), electronic design automation (a circuit board
layout tool checks component placement against keep-out zones around
mounting holes and connectors, the same overlap check applied to a
different domain), and surgical and medical device planning (a planned
incision or implant path is checked against both a target location and
a set of zones to avoid, structurally identical to this lesson's own
`check_setup`)
```

### SE Lens

The design principle is **keeping two independent failure signals
separate, rather than collapsing them into one combined pass/fail
result**. The alternative not chosen: return a single `True`/`False`
from `check_setup`, combining both checks into one answer.

That alternative would be simpler to read at a glance. The real cost it
pays: a single combined `False` doesn't say *which* problem occurred —
an overlapping clamp and a missed probe point are two different
failures needing two different fixes, and a caller told only "something
is wrong" would have to re-run both checks separately anyway to find out
which one. Returning both results together means every caller gets the
full picture in one call, with nothing lost.

### Commands Needed

`python geometry_lesson_45.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
('counterclockwise', 12.0, 17.65685424949238, True)
(True, True)
(False, False)
```

Verified by actually running the updated file above.

### Connection

One valid part, checked against a real machining setup two different
ways, both catching exactly what they were built to catch. Connect the
Pieces, below, traces the whole pipeline, start to finish, for both the
clean and the flawed setup.

---

## Connect the Pieces

One part, two setups, traced through every tool this workshop combined:

1. `part` — the familiar reflex "notch" polygon — passes
   `validate_part` cleanly: correctly wound, real area `12.0`, a real
   perimeter, and a triangulation whose own summed area matches exactly.
2. Against `keep_out_zone` (far away) and `good_probe_point` (genuinely
   inside `part`), `check_setup` reports `(True, True)` — safe to
   proceed.
3. Against `clamp_zone` (genuinely overlapping `part`'s own boundary)
   and `bad_probe_point` (genuinely outside `part` entirely),
   `check_setup` reports `(False, False)` — two real problems, caught
   independently, by two functions that have never needed to know
   anything about each other.
4. Every single function involved — `polygon_orientation`,
   `polygon_signed_area`, `polygon_perimeter`, `triangulate`,
   `polygons_intersect`, `is_point_in_polygon_robust` — was already
   fully built, verified, and trusted before this lesson ever began.

## What Breaks Without This

Prove that `check_setup`'s own two-check structure catches something a
part-only validation, run alone, cannot. Run `validate_part` on `part`
against the flawed setup's own geometry — it never even looks at
`clamp_zone` or `bad_probe_point` at all:

```python
print(validate_part(part))
```

```
('counterclockwise', 12.0, 17.65685424949238, True)
```

Verified by actually running this — reusing this lesson's own
`validate_part`, unchanged. Every single field reports success: correct
winding, real area, a passing triangulation. `validate_part` has no way
to know anything about `clamp_zone` or `bad_probe_point` at all — it was
never given them, and nothing about a part's own internal geometry can
reveal whether some *other* zone happens to overlap it, or whether some
specific external point happens to miss it. A real machining workflow
that only ran `validate_part` and skipped `check_setup` entirely would
approve this exact setup as sound, right up until a real clamp collision
or a drill firing into empty air revealed the problem physically — this
is precisely why Section II's own final lesson keeps both checks
separate and both mandatory, rather than assuming a part's own internal
soundness says anything at all about its surroundings.

## Exercises

1. Build a second part — any simple, convex polygon of your own choosing
   — and confirm `validate_part` reports `True` for its own triangulation
   check, using Lesson 42's own machinery on a genuinely different shape
   than this lesson's notch polygon.
2. Using `check_setup`, build a keep-out zone that overlaps `part` only
   slightly — sharing just one small corner — and confirm
   `polygons_intersect` still correctly reports the overlap, tying back
   to Lesson 36's own boundary-crossing logic.
3. Using `is_point_in_polygon_robust` directly, test a probe point placed
   exactly on `part`'s own boundary (not clearly inside or outside), and
   explain, using Lesson 44's own half-open-interval reasoning, why a
   boundary point's answer is not as clean-cut as a clearly interior or
   exterior one.

## Definition of Done

- [ ] `geometry_lesson_45.py` exists and runs with no errors via `python
      geometry_lesson_45.py`.
- [ ] Running it prints `('counterclockwise', 12.0, 17.65685424949238,
      True)`, `(True, True)`, then `(False, False)` — matching this
      lesson's verified output exactly.
- [ ] You can name every lesson `validate_part` and `check_setup` each
      draw from, without looking at the file.
- [ ] You can explain why `validate_part` alone cannot catch the problem
      this lesson's own closing section demonstrated, and why
      `check_setup` needs to be run separately, every time.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Combine Section II's full toolkit into a part-validation and setup-checking workshop"`,
      not `git commit -m "add validate_part and check_setup"`.

Section II, 2D Computational Geometry, is complete: twenty-five lessons
building from a single parametric line up through polygons, circles,
triangulation, spatial partitioning, and a repaired, genuinely robust
point-in-polygon test — closing, like Section I before it, with a pure
synthesis workshop introducing nothing new. Section III, 3D Geometry and
Transformations, begins at Lesson 46.
