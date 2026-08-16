# Lesson 32: Circle-Circle Intersection

**What you will build:** `circle_circle_intersection`, finding where two
circles meet — not by inventing new intersection math, but by deriving
the **radical line**, the one line any intersection points must lie on,
and then handing that line straight to Lesson 31's own
`circle_line_intersection`, completely unchanged. The transferable
problem: two circles' intersection looks like it should need entirely
new mathematics — two quadratic conditions at once, instead of Lesson
31's one quadratic against one line. It doesn't. Subtracting one circle's
condition from the other's cancels every squared term, leaving a plain
line — and once that's found, this lesson has nothing left to solve that
Lesson 31 didn't already build.

**What you need to know first:** Lesson 31's `circle_line_intersection`
and its own discriminant-based case split, Lesson 21's `point_on_line`,
Lesson 7's `dot_product` and perpendicularity test, Lesson 9's `norm`,
and Lesson 30's circle representation.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–31.

**Terms introduced in this lesson:**

- **Radical line** — the line containing every point that is
  simultaneously the correct distance from *both* circles' centers to
  satisfy each circle's own condition — in particular, containing any
  actual intersection points, when they exist. Why: finding this line
  turns "where do two circles meet" into "where does a line meet a
  circle," a question Lesson 31 already fully solved.

**Objects and methods used:**

None. `perpendicular` and `circle_circle_intersection` are hand-authored
project code, built from Lesson 2, 7, 9, 21, and 31's own reused
functions.

---

## Concept Unit: The Radical Line — Where Two Circle Equations Agree

### The Problem

A point `(x, y)` is on circle 1 exactly when `(x - c1x)² + (y - c1y)² =
r1²`, and on circle 2 exactly when `(x - c2x)² + (y - c2y)² = r2²` — two
quadratic conditions in `x` and `y` at once. Before reaching for anything
new, check what happens when one condition is subtracted from the other.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–31.
- **Files affected:** `geometry_lesson_32.py` — created, as a new file
  for this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
import math


def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def perpendicular(v):
    return (-v[1], v[0])


circle1 = ((0, 0), 5)
circle2 = ((6, 0), 5)

center1 = circle1[0]
radius1 = circle1[1]
center2 = circle2[0]
radius2 = circle2[1]

center_offset = subtract_points(center2, center1)
d = norm(center_offset)

a_dist = (radius1 * radius1 - radius2 * radius2 + d * d) / (2 * d)

radical_point = point_on_line(center1, center_offset, a_dist / d)
radical_direction = perpendicular(center_offset)

print(center_offset)
print(d)
print(a_dist)
print(radical_point)
print(radical_direction)
print(dot_product(center_offset, radical_direction))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* every function above through `norm` is retyped
unchanged from Lessons 2, 3, 7, 9, and 21. `perpendicular` is built from
already-covered indexing, negation, and tuple construction — no new
Python construct appears anywhere in this lesson, so no isolated
throwaway lab is needed.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `import math` through `def norm(v): ...` — Lesson 9, 2, 3, 7, and 21's
  own code, retyped unchanged. No re-explanation owed, per the Repetition
  Rule.
- `def perpendicular(v): return (-v[1], v[0])` — first appearance: swaps
  a vector's two components and negates the new first one. This is a
  90-degree counter-clockwise rotation — the same specific rotation
  Lessons 14 through 16's own `fixture_y_axis_in_table = (-1, 0)` already
  used, built from `fixture_x_axis_in_table = (0, 1)` by this exact
  operation, without ever naming it.

**The derivation.** Circle 1's condition, `dot_product(offset1, offset1)
= radius1²` (where `offset1` is a point's distance vector from `center1`,
Lesson 30's own condition squared), and circle 2's identical condition
with `center2` and `radius2`, both expand into the same shape: an
`x² + y²` term, plus terms linear in `x` and `y`, plus a constant.
Subtracting circle 2's expanded condition from circle 1's cancels the
`x² + y²` terms *exactly* — they're identical on both sides — leaving only
linear terms: a plain line, not a curve. This lesson's own `a_dist`
formula gives the exact point where that line crosses the line
connecting the two centers, and `perpendicular` gives its direction,
since the radical line is always perpendicular to the line joining the
centers.

- `circle1 = ((0, 0), 5)`, `circle2 = ((6, 0), 5)` — two circles of equal
  radius, six units apart, chosen so the intersection lands on clean
  numbers.
- `center1`, `radius1`, `center2`, `radius2` — already-basic indexing,
  Lesson 30's own pattern.
- `center_offset = subtract_points(center2, center1)` — already-basic
  reuse: the vector from one center to the other.
- `d = norm(center_offset)` — already-basic reuse: the distance between
  the two centers.
- `a_dist = (radius1 * radius1 - radius2 * radius2 + d * d) / (2 * d)` —
  first appearance: the signed distance from `center1`, along
  `center_offset`, to where the radical line crosses it.
- `radical_point = point_on_line(center1, center_offset, a_dist / d)` —
  Lesson 21's own function, reused: `a_dist / d` converts the physical
  distance `a_dist` into the fraction of `center_offset`'s own length
  that `point_on_line`'s `t` expects.
- `radical_direction = perpendicular(center_offset)` — this unit's own
  new function, applied to the center-to-center direction.
- `print(dot_product(center_offset, radical_direction))` — Lesson 7's
  own perpendicularity test, confirming `0`: `radical_direction` is
  genuinely perpendicular to the line joining the centers, exactly as
  the radical line's own geometry requires.

### CS Lens

Subtracting two equations that share a structurally identical nonlinear
term, specifically to cancel that term and reduce the problem to
something linear and already solvable, is a real and recurring algebraic
technique.

```
Also recognized in: GPS and multilateration (a receiver's position is
found by intersecting several "sphere of possible distance" equations
from different satellites — subtracting pairs of them the same way this
lesson does turns a nonlinear system into a linear one), radical axes in
classical geometry (this lesson's own "radical line" is literally a 2D
instance of a much older, named idea from Euclidean geometry, used for
constructions well before computers existed), and computer vision
(triangulating a 3D point from two camera views often uses this same
subtract-to-cancel-the-quadratic-term trick to linearize an otherwise
nonlinear system)
```

### SE Lens

The design principle is **transforming a hard problem into an
already-solved one, rather than solving it directly from scratch**. The
alternative not chosen: derive circle-circle intersection as its own
independent quadratic system — solving two simultaneous quadratic
equations in `x` and `y` directly, without ever reducing to a line.

That alternative is mathematically valid and would eventually reach the
same answer. The real cost it pays: it would need its own from-scratch
derivation, its own correctness proof, and its own handling of every
case Lesson 31 already solved once — duplicating work instead of reusing
it. This unit's own approach reduces the entire problem to "find one
line," at which point Lesson 31's already-verified function finishes the
job with zero new solving logic.

### Commands Needed

`python geometry_lesson_32.py` — same interpreter and command as every
prior lesson.

### Run It

```
(6, 0)
6.0
3.0
(3.0, 0.0)
(0, 6)
0
```

Verified by actually running the file above.

### Connection

The radical line is found, and proven perpendicular to the line joining
the centers. The next unit hands it straight to Lesson 31's own function.

---

## Concept Unit: Reusing circle_line_intersection — Finding the Actual Points

### The Problem

The radical line contains any real intersection points — but it isn't
itself the answer. Lesson 31 already built a function that finds exactly
where a line meets a circle; there's nothing left to do but call it.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_32.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(dot_product(center_offset,
  radical_direction))` line added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `perpendicular`, `point_on_line`,
  `norm`, `subtract_points`, `dot_product`.

### The New Code

```python
def nearly_equal(x, y, tolerance):
    return abs(x - y) < tolerance


def circle_line_intersection(line_point, line_direction, circle):
    center = circle[0]
    radius = circle[1]
    d = subtract_points(line_point, center)

    a = dot_product(line_direction, line_direction)
    b = 2 * dot_product(d, line_direction)
    c = dot_product(d, d) - radius * radius
    discriminant = b * b - 4 * a * c

    if nearly_equal(discriminant, 0, 0.0000001):
        t = -b / (2 * a)
        return (point_on_line(line_point, line_direction, t),)
    elif discriminant < 0:
        return "no intersection"
    else:
        sqrt_discriminant = math.sqrt(discriminant)
        t1 = (-b - sqrt_discriminant) / (2 * a)
        t2 = (-b + sqrt_discriminant) / (2 * a)
        return (
            point_on_line(line_point, line_direction, t1),
            point_on_line(line_point, line_direction, t2),
        )


def circle_circle_intersection(circle1, circle2):
    center1 = circle1[0]
    radius1 = circle1[1]
    center2 = circle2[0]
    radius2 = circle2[1]

    center_offset = subtract_points(center2, center1)
    d = norm(center_offset)

    if nearly_equal(d, 0, 0.0000001):
        return "no intersection"

    a_dist = (radius1 * radius1 - radius2 * radius2 + d * d) / (2 * d)
    radical_point = point_on_line(center1, center_offset, a_dist / d)
    radical_direction = perpendicular(center_offset)

    return circle_line_intersection(radical_point, radical_direction, circle1)


print(circle_circle_intersection(circle1, circle2))

far_circle = ((20, 0), 5)
print(circle_circle_intersection(circle1, far_circle))

tangent_circle = ((10, 0), 5)
print(circle_circle_intersection(circle1, tangent_circle))

nested_circle = ((1, 0), 1)
print(circle_circle_intersection(circle1, nested_circle))

concentric_circle = ((0, 0), 3)
print(circle_circle_intersection(circle1, concentric_circle))
```

### The Updated Project

```python
import math


def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def perpendicular(v):
    return (-v[1], v[0])


circle1 = ((0, 0), 5)
circle2 = ((6, 0), 5)

center1 = circle1[0]
radius1 = circle1[1]
center2 = circle2[0]
radius2 = circle2[1]

center_offset = subtract_points(center2, center1)
d = norm(center_offset)

a_dist = (radius1 * radius1 - radius2 * radius2 + d * d) / (2 * d)

radical_point = point_on_line(center1, center_offset, a_dist / d)
radical_direction = perpendicular(center_offset)

print(center_offset)
print(d)
print(a_dist)
print(radical_point)
print(radical_direction)
print(dot_product(center_offset, radical_direction))


def nearly_equal(x, y, tolerance):                                       # ← new
    return abs(x - y) < tolerance                                       # ← new


def circle_line_intersection(line_point, line_direction, circle):        # ← new
    center = circle[0]                                                   # ← new
    radius = circle[1]                                                   # ← new
    d = subtract_points(line_point, center)                              # ← new
                                                                           # ← new
    a = dot_product(line_direction, line_direction)                      # ← new
    b = 2 * dot_product(d, line_direction)                                # ← new
    c = dot_product(d, d) - radius * radius                              # ← new
    discriminant = b * b - 4 * a * c                                     # ← new
                                                                           # ← new
    if nearly_equal(discriminant, 0, 0.0000001):                        # ← new
        t = -b / (2 * a)                                                 # ← new
        return (point_on_line(line_point, line_direction, t),)          # ← new
    elif discriminant < 0:                                               # ← new
        return "no intersection"                                        # ← new
    else:                                                                # ← new
        sqrt_discriminant = math.sqrt(discriminant)                     # ← new
        t1 = (-b - sqrt_discriminant) / (2 * a)                         # ← new
        t2 = (-b + sqrt_discriminant) / (2 * a)                         # ← new
        return (                                                         # ← new
            point_on_line(line_point, line_direction, t1),               # ← new
            point_on_line(line_point, line_direction, t2),               # ← new
        )                                                                 # ← new


def circle_circle_intersection(circle1, circle2):                        # ← new
    center1 = circle1[0]                                                 # ← new
    radius1 = circle1[1]                                                 # ← new
    center2 = circle2[0]                                                 # ← new
    radius2 = circle2[1]                                                 # ← new
                                                                           # ← new
    center_offset = subtract_points(center2, center1)                    # ← new
    d = norm(center_offset)                                              # ← new
                                                                           # ← new
    if nearly_equal(d, 0, 0.0000001):                                    # ← new
        return "no intersection"                                        # ← new
                                                                           # ← new
    a_dist = (radius1 * radius1 - radius2 * radius2 + d * d) / (2 * d)  # ← new
    radical_point = point_on_line(center1, center_offset, a_dist / d)   # ← new
    radical_direction = perpendicular(center_offset)                    # ← new
                                                                           # ← new
    return circle_line_intersection(radical_point, radical_direction, circle1)  # ← new


print(circle_circle_intersection(circle1, circle2))                      # ← new

far_circle = ((20, 0), 5)                                                # ← new
print(circle_circle_intersection(circle1, far_circle))                   # ← new

tangent_circle = ((10, 0), 5)                                            # ← new
print(circle_circle_intersection(circle1, tangent_circle))               # ← new

nested_circle = ((1, 0), 1)                                              # ← new
print(circle_circle_intersection(circle1, nested_circle))                # ← new

concentric_circle = ((0, 0), 3)                                          # ← new
print(circle_circle_intersection(circle1, concentric_circle))            # ← new
```

The file now finds real circle-circle intersections, using nothing but a
new line-finding step glued onto Lesson 31's own already-complete
function.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def nearly_equal(...)`, `def circle_line_intersection(...)` — Lesson
  17 and 31's own functions, retyped unchanged. No re-explanation owed,
  per the Repetition Rule.
- `def circle_circle_intersection(circle1, circle2): ...` — first
  appearance: this lesson's actual subject.
- `center_offset = subtract_points(center2, center1)`, `d =
  norm(center_offset)` — already-basic reuse, identical to Concept Unit
  1's own setup.
- `if nearly_equal(d, 0, 0.0000001): return "no intersection"` — first
  appearance of this lesson's own guard clause: **concentric circles**
  (the same center) make `a_dist / d` a division by zero — a real,
  necessary check before that division ever runs. Two truly concentric
  circles either never touch (different radii) or overlap completely
  (equal radii) — neither case is a finite set of intersection points,
  so `"no intersection"` is used here as an honest simplification, not a
  fully correct answer for the equal-radii case, which this lesson
  doesn't attempt to represent.
- `a_dist`, `radical_point`, `radical_direction` — already-basic reuse,
  identical to Concept Unit 1.
- `return circle_line_intersection(radical_point, radical_direction,
  circle1)` — Lesson 31's own function, called with the radical line and
  *either* circle (this lesson always uses `circle1`) — since the
  radical line's whole construction guarantees any point satisfying
  circle 1's condition on that line also satisfies circle 2's, checking
  against just one circle is enough.
- `print(circle_circle_intersection(circle1, circle2))` — the original
  two circles. Prints `((3.0, -4.0), (3.0, 4.0))` — two genuine
  intersection points.
- `far_circle = ((20, 0), 5)`, its own print — two circles `20` units
  apart, radii summing to only `10`: far too distant to touch. Prints
  `no intersection` — `circle_line_intersection`'s own discriminant check
  catches this automatically, with no extra logic needed in
  `circle_circle_intersection` itself.
- `tangent_circle = ((10, 0), 5)`, its own print — centers exactly `10`
  units apart, radii summing to exactly `10`: externally tangent. Prints
  `((5.0, 0.0),)` — a single touching point, again handled automatically
  by the same discriminant logic, unchanged.
- `nested_circle = ((1, 0), 1)`, its own print — a small circle entirely
  inside `circle1`, nowhere near its boundary. Prints `no intersection`
  — also handled automatically.
- `concentric_circle = ((0, 0), 3)`, its own print — same center as
  `circle1`, different radius. Prints `no intersection` — this time
  caught by this unit's own new guard clause, not by
  `circle_line_intersection`'s discriminant.

### CS Lens

Every one of the classic circle-circle cases — two crossings, one
tangent point, too far apart, one fully inside the other — falls out of
a *single* already-existing discriminant check, with no additional
case-by-case logic added in this lesson at all, beyond the one genuinely
new degenerate case (concentric centers). That's a strong sign the
reduction to a line-circle problem was the right one.

```
Also recognized in: reduction proofs in computer science theory (showing
a new problem is "no harder than" an already-solved one by transforming
it into that problem's exact input shape, the same move this lesson made
by turning "two circles" into "one line, one circle"), CAD constraint
solvers (a "these two circles must be tangent" constraint is frequently
implemented by reusing a general circle-circle intersection routine and
checking for exactly one result, rather than writing separate tangency-
specific code), and compiler design (many optimization passes are
implemented as a translation into a simpler intermediate form that an
existing, already-correct pass can then handle, instead of writing new
optimization logic from scratch)
```

### SE Lens

The design principle is **inheriting correctness from an already-tested
function, across every case it already handles, without re-testing each
one by hand**. The alternative not chosen: give
`circle_circle_intersection` its own explicit `if`/`elif`/`else` chain
for "too far," "tangent," "two intersections," and "nested," each
computed and checked independently.

That alternative would work, but would duplicate — and require
re-verifying — logic Lesson 31 already built and proved correct across
exactly those same cases. This lesson's own approach needed exactly one
new guard clause (concentric centers); every other case Concept Unit 2
demonstrated was handled correctly the first time it was tried, purely
as a consequence of `circle_line_intersection`'s own already-established
correctness.

### Commands Needed

`python geometry_lesson_32.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
(6, 0)
6.0
3.0
(3.0, 0.0)
(0, 6)
0
((3.0, -4.0), (3.0, 4.0))
no intersection
((5.0, 0.0),)
no intersection
no intersection
```

Verified by actually running the updated file above.

### Connection

Every real circle-circle case this lesson tried came back correct,
mostly for free. Connect the Pieces, below, traces the main
two-intersection case start to finish.

---

## Connect the Pieces

One pair of circles, traced through everything this lesson built, start
to finish:

1. `circle1 = ((0, 0), 5)`, `circle2 = ((6, 0), 5)`.
2. `center_offset = (6, 0)`, `d = 6.0` — the distance between centers.
3. `a_dist = (25 - 25 + 36) / 12 = 3.0` — the radical line crosses the
   center-to-center line `3.0` units from `center1`.
4. `radical_point = point_on_line((0, 0), (6, 0), 3.0 / 6.0) = (3.0,
   0.0)`; `radical_direction = perpendicular((6, 0)) = (0, 6)` — proven
   perpendicular to `center_offset` via `dot_product`.
5. `circle_line_intersection((3.0, 0.0), (0, 6), circle1)` — Lesson 31's
   own function, unchanged — finds `((3.0, -4.0), (3.0, 4.0))`: the same
   two points a direct geometric check confirms are exactly `5` units
   from `(0, 0)` *and* exactly `5` units from `(6, 0)`.

## What Breaks Without This

`circle_circle_intersection`'s guard clause exists specifically to catch
concentric centers before `a_dist / d` divides by zero. Prove it, calling
the radical-line derivation directly without the guard:

```python
import math


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def circle_circle_intersection_unguarded(circle1, circle2):
    center1 = circle1[0]
    radius1 = circle1[1]
    center2 = circle2[0]
    radius2 = circle2[1]

    center_offset = subtract_points(center2, center1)
    d = norm(center_offset)

    a_dist = (radius1 * radius1 - radius2 * radius2 + d * d) / (2 * d)
    return a_dist


circle1 = ((0, 0), 5)
concentric_circle = ((0, 0), 3)

print(circle_circle_intersection_unguarded(circle1, concentric_circle))
```

```
Traceback (most recent call last):
  File "geometry_lesson_32_break.py", line 22, in <module>
    print(circle_circle_intersection_unguarded(circle1, concentric_circle))
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "geometry_lesson_32_break.py", line 17, in circle_circle_intersection_unguarded
    a_dist = (radius1 * radius1 - radius2 * radius2 + d * d) / (2 * d)
    radius2 * radius2 + d * d) / (2 * d)
ZeroDivisionError: division by zero
```

Verified by actually running this. Two circles sharing the exact same
center make `d`, the distance between centers, exactly `0` — and `2 * d`
in the denominator crashes immediately, the same familiar
`ZeroDivisionError` shape this curriculum has seen since Lesson 10,
here caused by a geometric degeneracy (no well-defined direction between
two coincident points) rather than a parallel-lines or zero-vector case.
This is exactly why `circle_circle_intersection`'s own guard clause
checks `nearly_equal(d, 0, ...)` — using tolerance rather than `== 0`,
since two circles could easily have centers separated by some tiny,
computed floating-point distance instead of a perfectly clean zero —
before this division is ever attempted.

## Exercises

1. Using `circle_circle_intersection`, find the intersection of
   `circle1 = ((0, 0), 5)` and a circle centered at `(0, 8)` with radius
   `5`. Predict, using the same 3-4-5-triangle reasoning as this
   lesson's own worked example, roughly where the two intersection
   points should land, then verify.
2. Build two circles of *different* radii that still intersect at two
   points — for example, `circle1 = ((0, 0), 5)` and `circle2 = ((6, 0),
   3)`. Verify `a_dist` no longer falls exactly halfway between the two
   centers the way it did for this lesson's own equal-radius example,
   and explain why unequal radii should be expected to break that
   symmetry.
3. Using `circle_circle_intersection`, confirm that calling
   `circle_line_intersection` against `circle2` instead of `circle1` in
   the final line of `circle_circle_intersection` produces the identical
   result for this lesson's own two-intersection example. Explain, using
   the radical line's own definition, why the choice between the two
   circles should never matter.

## Definition of Done

- [ ] `geometry_lesson_32.py` exists and runs with no errors via `python
      geometry_lesson_32.py`.
- [ ] Running it prints the full 11-line sequence shown in Concept Unit
      2's Run It, ending in `((3.0, -4.0), (3.0, 4.0))`, `no
      intersection`, `((5.0, 0.0),)`, `no intersection`, then `no
      intersection` — matching this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, why subtracting one
      circle's condition from another's produces a line instead of
      another curve.
- [ ] You can explain why `circle_circle_intersection` needed only one
      new guard clause (concentric centers) while every other case —
      too far, tangent, nested — was already handled by Lesson 31's own
      function, unchanged.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Derive circle-circle intersection via the radical line, reusing circle-line intersection unchanged"`,
      not `git commit -m "add circle_circle_intersection"`.

Next: Lesson 33 — Polygons, Section II's next major shape family, moving
beyond individual lines and circles to a boundary built from many
connected segments — the first lesson where a genuinely variable-length
input makes this curriculum's own `for` loop, first used in Lesson 27,
a natural, load-bearing tool rather than an optional convenience.
