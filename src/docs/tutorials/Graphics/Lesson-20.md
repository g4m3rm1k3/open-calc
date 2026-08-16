# Lesson 20: Geometric Problem-Solving

**What you will build:** One worked CAD/CAM problem, combining every tool
Section I built rather than introducing anything new: a triangular pocket
defined in fixture-local coordinates, transformed into table coordinates
using Lesson 14's matrix machinery, checked for orientation with Lesson
19's `classify_turn`, and checked for genuine, non-degenerate area using
Lesson 8's `cross_product` and Lesson 17's `nearly_equal` — the same
sanity pass a real CAM system runs before ever cutting a pocket for real.
The transferable problem: every tool in Section I was built and verified
in isolation, one lesson at a time. This lesson proves they combine into
one coherent, trustworthy pipeline, not just twenty separate facts.

**What you need to know first:** Lesson 14's `apply_matrix` and
homogeneous points, Lesson 8's `cross_product`, Lesson 17's
`nearly_equal`, and Lesson 19's `classify_turn` — all reused unchanged,
with no new Python construct introduced anywhere in this lesson.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–19.

**Terms introduced in this lesson:**

None. This lesson is Section I's closing workshop — every term it uses
was already introduced somewhere in Lessons 1–19; see each Concept Unit's
own Repetition Rule citations below for exactly where.

**Objects and methods used:**

None. Every function this lesson calls is hand-authored project code,
retyped unchanged from earlier lessons.

---

## Concept Unit: Transforming a Whole Shape — Three Corners, One Matrix

### The Problem

A pocket-milling operation is defined by its corner points in the
fixture's own local coordinates — easy for a machinist to specify, since
the fixture's own geometry is the natural reference. Before the machine
can cut it, every corner needs converting into table coordinates, the
frame the machine's own controller actually understands. Do this for a
real triangular pocket, reusing Lesson 14's matrix machinery exactly as
built.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–19.
- **Files affected:** `geometry_lesson_20.py` — created, as a new file
  for this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def dot3(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def apply_matrix(matrix, point_h):
    row0_result = dot3(matrix[0], point_h)
    row1_result = dot3(matrix[1], point_h)
    row2_result = dot3(matrix[2], point_h)
    return (row0_result, row1_result, row2_result)


fixture_to_table_matrix = (
    (0, -1, 50),
    (1, 0, 20),
    (0, 0, 1),
)

pocket_corner_0_in_fixture = (0, 0)
pocket_corner_1_in_fixture = (4, 0)
pocket_corner_2_in_fixture = (0, 3)

pocket_corner_0_in_fixture_h = (pocket_corner_0_in_fixture[0], pocket_corner_0_in_fixture[1], 1)
pocket_corner_1_in_fixture_h = (pocket_corner_1_in_fixture[0], pocket_corner_1_in_fixture[1], 1)
pocket_corner_2_in_fixture_h = (pocket_corner_2_in_fixture[0], pocket_corner_2_in_fixture[1], 1)

pocket_corner_0_in_table_h = apply_matrix(fixture_to_table_matrix, pocket_corner_0_in_fixture_h)
pocket_corner_1_in_table_h = apply_matrix(fixture_to_table_matrix, pocket_corner_1_in_fixture_h)
pocket_corner_2_in_table_h = apply_matrix(fixture_to_table_matrix, pocket_corner_2_in_fixture_h)

print(pocket_corner_0_in_table_h)
print(pocket_corner_1_in_table_h)
print(pocket_corner_2_in_table_h)
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `dot3`, `apply_matrix`, the matrix literal, and
homogeneous-point construction are all retyped unchanged from Lesson 14.
No new Python construct appears anywhere in this lesson, so no isolated
throwaway lab is needed in any of its Concept Units.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def dot3(a, b): ...`, `def apply_matrix(matrix, point_h): ...` —
  Lesson 14's own functions, retyped unchanged. No re-explanation owed,
  per the Repetition Rule.
- `fixture_to_table_matrix = (...)` — the same fixture-on-table matrix
  used continuously since Lesson 14.
- `pocket_corner_0_in_fixture = (0, 0)`, `pocket_corner_1_in_fixture =
  (4, 0)`, `pocket_corner_2_in_fixture = (0, 3)` — first appearance of
  this lesson's own worked problem: three corners of a right-triangle
  pocket, specified in the fixture's local frame, exactly the way a
  machinist would write them down from a drawing.
- The three `_h` variables — already-basic homogeneous-point construction,
  identical to Lesson 14's own pattern, applied three times instead of
  once.
- `pocket_corner_0_in_table_h = apply_matrix(fixture_to_table_matrix,
  pocket_corner_0_in_fixture_h)`, and the two lines below it — Lesson
  14's own function, called once per corner. Three explicit calls, not a
  loop, matching this curriculum's established pattern of unrolling a
  small, fixed-size operation rather than reaching for a `for` loop —
  the same choice Lesson 14 made for `dot3`'s three row computations.
- The three `print(...)` calls — already-basic.

### CS Lens

Applying the same transform to every point of a shape, one point at a
time, rather than deriving a separate calculation for the shape as a
whole, is the standard way geometry moves between coordinate frames in
real systems.

```
Also recognized in: every 3D rendering pipeline (a mesh's vertices are
each individually multiplied by the same model-view-projection matrix, one
vertex at a time, exactly this lesson's own per-corner pattern at a much
larger scale), CAM toolpath generation (every point along a milling path
gets the same fixture-to-machine conversion applied before the machine
ever sees it), and robotics (a gripper's planned grasp points, defined
relative to an object, get the same transform applied to place them in
the robot's own world frame)
```

### SE Lens

The design principle is **reusing one already-verified operation across
every element of a shape**, rather than writing a shape-specific
transformation function. The alternative not chosen: write a dedicated
`transform_triangle` function, specific to three-cornered shapes, instead
of calling the general-purpose `apply_matrix` three times.

That alternative might read slightly more compactly for this one
triangle. The real cost it pays: a `transform_triangle` function would be
useless the moment a pocket has four corners instead of three, and a
`transform_rectangle`, `transform_pentagon`, and so on would each need
their own near-identical implementation. Calling the same
already-general `apply_matrix` once per point, however many points there
are, means this lesson's approach already works for any polygon at all,
without writing a single new line of transformation logic.

### Commands Needed

`python geometry_lesson_20.py` — same interpreter and command as every
prior lesson.

### Run It

```
(50, 20, 1)
(50, 24, 1)
(47, 20, 1)
```

Verified by actually running the file above.

### Connection

The pocket now exists in table coordinates, ready for the machine — but
nothing has confirmed the transform didn't quietly break the shape's own
geometry along the way. The next unit checks.

---

## Concept Unit: Did the Shape Survive? — Checking Orientation

### The Problem

A transform that flips a shape's orientation — the reflection case
Lesson 11 first proved is real — would produce a pocket that's mirrored
from what was actually drawn, a real, costly CAM mistake. Check whether
`fixture_to_table_matrix`'s transform preserved the triangle's original
orientation, using Lesson 19's own three-way predicate.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_20.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(pocket_corner_2_in_table_h)`
  line added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's six corner variables.

### The New Code

```python
pocket_corner_0_in_table = (pocket_corner_0_in_table_h[0], pocket_corner_0_in_table_h[1])
pocket_corner_1_in_table = (pocket_corner_1_in_table_h[0], pocket_corner_1_in_table_h[1])
pocket_corner_2_in_table = (pocket_corner_2_in_table_h[0], pocket_corner_2_in_table_h[1])


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def classify_turn(a, b, c):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))

    if turn_value > 0:
        return "left"
    elif turn_value < 0:
        return "right"
    else:
        return "straight"


print(classify_turn(pocket_corner_0_in_fixture, pocket_corner_1_in_fixture, pocket_corner_2_in_fixture))
print(classify_turn(pocket_corner_0_in_table, pocket_corner_1_in_table, pocket_corner_2_in_table))
```

### The Updated Project

```python
def dot3(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def apply_matrix(matrix, point_h):
    row0_result = dot3(matrix[0], point_h)
    row1_result = dot3(matrix[1], point_h)
    row2_result = dot3(matrix[2], point_h)
    return (row0_result, row1_result, row2_result)


fixture_to_table_matrix = (
    (0, -1, 50),
    (1, 0, 20),
    (0, 0, 1),
)

pocket_corner_0_in_fixture = (0, 0)
pocket_corner_1_in_fixture = (4, 0)
pocket_corner_2_in_fixture = (0, 3)

pocket_corner_0_in_fixture_h = (pocket_corner_0_in_fixture[0], pocket_corner_0_in_fixture[1], 1)
pocket_corner_1_in_fixture_h = (pocket_corner_1_in_fixture[0], pocket_corner_1_in_fixture[1], 1)
pocket_corner_2_in_fixture_h = (pocket_corner_2_in_fixture[0], pocket_corner_2_in_fixture[1], 1)

pocket_corner_0_in_table_h = apply_matrix(fixture_to_table_matrix, pocket_corner_0_in_fixture_h)
pocket_corner_1_in_table_h = apply_matrix(fixture_to_table_matrix, pocket_corner_1_in_fixture_h)
pocket_corner_2_in_table_h = apply_matrix(fixture_to_table_matrix, pocket_corner_2_in_fixture_h)

print(pocket_corner_0_in_table_h)
print(pocket_corner_1_in_table_h)
print(pocket_corner_2_in_table_h)

pocket_corner_0_in_table = (pocket_corner_0_in_table_h[0], pocket_corner_0_in_table_h[1])  # ← new
pocket_corner_1_in_table = (pocket_corner_1_in_table_h[0], pocket_corner_1_in_table_h[1])  # ← new
pocket_corner_2_in_table = (pocket_corner_2_in_table_h[0], pocket_corner_2_in_table_h[1])  # ← new


def subtract_points(a, b):                                               # ← new
    return (a[0] - b[0], a[1] - b[1])                                   # ← new


def cross_product(a, b):                                                 # ← new
    return a[0] * b[1] - a[1] * b[0]                                    # ← new


def classify_turn(a, b, c):                                              # ← new
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))  # ← new
                                                                           # ← new
    if turn_value > 0:                                                   # ← new
        return "left"                                                    # ← new
    elif turn_value < 0:                                                 # ← new
        return "right"                                                   # ← new
    else:                                                                # ← new
        return "straight"                                                # ← new


print(classify_turn(pocket_corner_0_in_fixture, pocket_corner_1_in_fixture, pocket_corner_2_in_fixture))  # ← new
print(classify_turn(pocket_corner_0_in_table, pocket_corner_1_in_table, pocket_corner_2_in_table))  # ← new
```

The file now checks the pocket's orientation both before and after the
transform, side by side.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `pocket_corner_0_in_table = (pocket_corner_0_in_table_h[0],
  pocket_corner_0_in_table_h[1])`, and the two lines below it —
  already-basic indexing, dropping each point's homogeneous third
  component now that the transform is done and only the plain 2D point
  is needed for `classify_turn`, which was never built to accept a
  three-component homogeneous point.
- `def subtract_points(a, b): ...`, `def cross_product(a, b): ...`, `def
  classify_turn(a, b, c): ...` — Lesson 2, 8, and 19's own functions,
  retyped unchanged. No re-explanation owed, per the Repetition Rule.
- `print(classify_turn(pocket_corner_0_in_fixture,
  pocket_corner_1_in_fixture, pocket_corner_2_in_fixture))` —
  already-basic call, checking the pocket's orientation *before* any
  transform at all: `"left"`, a counter-clockwise triangle, the standard
  orientation CAM software expects for an outer pocket boundary.
- `print(classify_turn(pocket_corner_0_in_table,
  pocket_corner_1_in_table, pocket_corner_2_in_table))` — the same
  check, on the *transformed* corners. Also `"left"` — the transform
  preserved orientation.

**Why this specific transform was safe.** `fixture_to_table_matrix`'s
basis, `(0, 1)` and `(-1, 0)`, is the same orthonormal, non-reflected
basis Lesson 16 already confirmed — a pure rotation, not the mirrored
basis Lesson 11 proved flips orientation. `classify_turn` agreeing before
and after isn't a coincidence; it's a direct, provable consequence of
which specific matrix this pocket happened to go through. A fixture
defined with a reflected basis instead would make these two
`classify_turn` calls disagree — proof the check is doing real work, not
just confirming the obvious.

### CS Lens

Verifying a geometric invariant survived a transformation, rather than
assuming it did because the transform "looked reasonable," is the same
discipline Lesson 16 already applied to matrix inverses, now applied to
orientation instead.

```
Also recognized in: 3D asset pipelines (a mesh importer commonly checks
whether a model's face winding survived a coordinate-system conversion
between different 3D tools, which use different orientation conventions
and can silently flip normals otherwise), CNC post-processors (software
that converts a generic toolpath into machine-specific G-code often
double-checks that cutter-compensation direction — left or right of the
programmed path — still matches the intended climb or conventional
milling direction after every coordinate conversion), and geographic
information systems (a map projection can invert a region's winding
order, and GIS software commonly validates this explicitly rather than
trusting every projection to preserve it)
```

### SE Lens

The design principle is **checking an invariant explicitly after a
transformation, instead of trusting the transformation implicitly**. The
alternative not chosen: skip this unit's check entirely, and trust that
because `fixture_to_table_matrix` "looks like" a simple rotation, it must
preserve orientation.

That alternative would have been correct here — but only because this
particular matrix happens to be orientation-preserving, a fact this unit
actually confirmed rather than assumed. The real cost of skipping the
check: a fixture defined with a reflected basis (Lesson 11's own mirrored
case) would silently produce a mirrored pocket, and nothing would catch
it until a real physical part came out wrong — exactly the kind of
mistake Lesson 11 already showed is a genuine, real-world CAD error, not
a hypothetical one.

### Commands Needed

`python geometry_lesson_20.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
(50, 20, 1)
(50, 24, 1)
(47, 20, 1)
left
left
```

Verified by actually running the updated file above.

### Connection

Orientation survived the transform. The last unit checks the one thing
orientation alone can't confirm: whether the pocket has any real area to
cut at all.

---

## Concept Unit: Is There Anything to Cut? — Checking for a Degenerate Pocket

### The Problem

`classify_turn` confirms orientation, but its `"straight"` case — exactly
zero turn — would also fire for three corners that happen to be
collinear: a "triangle" with no actual area, a data-entry mistake that
would send a cutting tool along a zero-width sliver instead of a real
pocket. Check that this pocket has genuine area, not just a
non-degenerate-looking turn direction.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_20.py` — modified.
- **Change type:** add.
- **Location:** appended below the final `print(classify_turn(...))` line
  added in Concept Unit 2.
- **Dependencies:** Concept Unit 2's `subtract_points`, `cross_product`,
  and all six corner variables.

### The New Code

```python
def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


signed_area_in_fixture = cross_product(
    subtract_points(pocket_corner_1_in_fixture, pocket_corner_0_in_fixture),
    subtract_points(pocket_corner_2_in_fixture, pocket_corner_0_in_fixture),
) / 2

signed_area_in_table = cross_product(
    subtract_points(pocket_corner_1_in_table, pocket_corner_0_in_table),
    subtract_points(pocket_corner_2_in_table, pocket_corner_0_in_table),
) / 2

print(signed_area_in_fixture)
print(signed_area_in_table)
print(nearly_equal(signed_area_in_table, 0, 0.0000001))
```

### The Updated Project

```python
def dot3(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def apply_matrix(matrix, point_h):
    row0_result = dot3(matrix[0], point_h)
    row1_result = dot3(matrix[1], point_h)
    row2_result = dot3(matrix[2], point_h)
    return (row0_result, row1_result, row2_result)


fixture_to_table_matrix = (
    (0, -1, 50),
    (1, 0, 20),
    (0, 0, 1),
)

pocket_corner_0_in_fixture = (0, 0)
pocket_corner_1_in_fixture = (4, 0)
pocket_corner_2_in_fixture = (0, 3)

pocket_corner_0_in_fixture_h = (pocket_corner_0_in_fixture[0], pocket_corner_0_in_fixture[1], 1)
pocket_corner_1_in_fixture_h = (pocket_corner_1_in_fixture[0], pocket_corner_1_in_fixture[1], 1)
pocket_corner_2_in_fixture_h = (pocket_corner_2_in_fixture[0], pocket_corner_2_in_fixture[1], 1)

pocket_corner_0_in_table_h = apply_matrix(fixture_to_table_matrix, pocket_corner_0_in_fixture_h)
pocket_corner_1_in_table_h = apply_matrix(fixture_to_table_matrix, pocket_corner_1_in_fixture_h)
pocket_corner_2_in_table_h = apply_matrix(fixture_to_table_matrix, pocket_corner_2_in_fixture_h)

print(pocket_corner_0_in_table_h)
print(pocket_corner_1_in_table_h)
print(pocket_corner_2_in_table_h)

pocket_corner_0_in_table = (pocket_corner_0_in_table_h[0], pocket_corner_0_in_table_h[1])
pocket_corner_1_in_table = (pocket_corner_1_in_table_h[0], pocket_corner_1_in_table_h[1])
pocket_corner_2_in_table = (pocket_corner_2_in_table_h[0], pocket_corner_2_in_table_h[1])


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def classify_turn(a, b, c):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))

    if turn_value > 0:
        return "left"
    elif turn_value < 0:
        return "right"
    else:
        return "straight"


print(classify_turn(pocket_corner_0_in_fixture, pocket_corner_1_in_fixture, pocket_corner_2_in_fixture))
print(classify_turn(pocket_corner_0_in_table, pocket_corner_1_in_table, pocket_corner_2_in_table))


def nearly_equal(a, b, tolerance):                                       # ← new
    return abs(a - b) < tolerance                                       # ← new


signed_area_in_fixture = cross_product(                                  # ← new
    subtract_points(pocket_corner_1_in_fixture, pocket_corner_0_in_fixture),  # ← new
    subtract_points(pocket_corner_2_in_fixture, pocket_corner_0_in_fixture),  # ← new
) / 2                                                                     # ← new

signed_area_in_table = cross_product(                                    # ← new
    subtract_points(pocket_corner_1_in_table, pocket_corner_0_in_table),  # ← new
    subtract_points(pocket_corner_2_in_table, pocket_corner_0_in_table),  # ← new
) / 2                                                                     # ← new

print(signed_area_in_fixture)                                            # ← new
print(signed_area_in_table)                                              # ← new
print(nearly_equal(signed_area_in_table, 0, 0.0000001))                  # ← new
```

The file now runs a complete verification pass on the pocket: transform,
orientation check, and non-degeneracy check, all before any of it would
reach a real machine.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def nearly_equal(a, b, tolerance): ...` — Lesson 17's own function,
  retyped unchanged. No re-explanation owed, per the Repetition Rule.
- `signed_area_in_fixture = cross_product(subtract_points(...),
  subtract_points(...)) / 2` — a **hard concept reappearing**: this is
  Lesson 8's own `cross_product`, whose magnitude, halved, is the signed
  area of the triangle formed by the three points involved — the same
  quantity `classify_turn`'s sign already reads, now read as a magnitude
  instead of just a sign.
- `signed_area_in_table = cross_product(...) / 2` — the identical
  computation on the transformed corners.
- `print(signed_area_in_fixture)`, `print(signed_area_in_table)` —
  already-basic; both print `6.0` — the pocket's real area, in whatever
  units the fixture and table frames share, unchanged by the transform.
  This is itself worth noticing: `fixture_to_table_matrix`'s pure
  rotation preserved not just orientation (Concept Unit 2) but the actual
  area, the same way Lesson 13 already proved rotation preserves
  distance.
- `print(nearly_equal(signed_area_in_table, 0, 0.0000001))` — Lesson 17's
  own tolerance check, applied to an area instead of a plain number or a
  turn value. Prints `False`: the area is nowhere near zero, confirming
  this is a real, cuttable pocket, not a degenerate sliver.

### CS Lens

Reading the *magnitude* of the same quantity a predicate already reads
the *sign* of — one function serving two related but different purposes —
is a natural extension of the geometric-predicate idea Lesson 19 already
named.

```
Also recognized in: polygon validation in CAD kernels (checking a
sketched or imported polygon has nonzero area before allowing it to
define a solid feature is a standard guard against exactly this kind of
degenerate input), mesh generation (a triangulation algorithm rejects or
collapses triangles whose computed area falls below a tolerance, for the
same reason this lesson's check exists), and land surveying software
(a plotted property boundary that comes back with near-zero enclosed
area is flagged as a likely data-entry or GPS error, using this same
signed-area computation)
```

### SE Lens

The design principle is **checking a magnitude, not just a sign, when a
sign alone can't distinguish a real problem from a fine one**. The
alternative not chosen: rely on `classify_turn`'s `"straight"` result
alone as the only degeneracy check, since a truly zero-area triangle
would also report `"straight"`.

That alternative would work for one particular kind of mistake, but
`classify_turn`'s three-way answer was designed to classify a turn
*direction*, not to quantify *how close* to degenerate a shape actually
is — it would say `"left"` with equal confidence for this lesson's real
`6.0`-area pocket and for a nearly-flat sliver of area `0.0001`, neither
of which the direction check alone can tell apart. Computing the real
signed area and checking its magnitude against a tolerance catches both
the exactly-zero case `classify_turn` already handles and the
nearly-zero case it can't, at the cost of one more small computation.

### Commands Needed

`python geometry_lesson_20.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
(50, 20, 1)
(50, 24, 1)
(47, 20, 1)
left
left
6.0
6.0
False
```

Verified by actually running the updated file above.

### Connection

Every check this lesson built agrees: the pocket transformed correctly,
kept its orientation, and has real, cuttable area. Connect the Pieces,
below, traces the full pipeline start to finish.

---

## Connect the Pieces

One concrete shape, traced through every tool Section I built, start to
finish:

1. `pocket_corner_0_in_fixture = (0, 0)`, `pocket_corner_1_in_fixture =
   (4, 0)`, `pocket_corner_2_in_fixture = (0, 3)` — a triangular pocket,
   defined the way a machinist would specify it, in the fixture's own
   local frame.
2. Each corner, padded to a homogeneous point and run through
   `apply_matrix(fixture_to_table_matrix, ...)` (Lesson 14), becomes
   `(50, 20)`, `(50, 24)`, and `(47, 20)` in table coordinates — the
   frame the machine's own controller understands.
3. `classify_turn` (Lesson 19, built on Lesson 8's `cross_product`)
   reports `"left"` for the triangle both before and after the
   transform — orientation survived, ruling out the mirrored-shape
   mistake Lesson 11 proved is real.
4. `cross_product(...) / 2` (Lesson 8 again, this time read as a
   magnitude) computes `6.0` for the triangle both before and after —
   the pocket's real area, also unchanged by the transform.
5. `nearly_equal(signed_area_in_table, 0, 0.0000001)` (Lesson 17)
   reports `False` — the area is genuinely, provably nonzero: a real
   pocket, safe to hand off to a CAM system, verified by five different
   lessons' worth of tools working together on one shape.

## What Breaks Without This

Concept Unit 3's area check exists specifically to catch a pocket that
looks fine to `classify_turn` but isn't real geometry. Prove it, using
three corners that are genuinely collinear — a plausible data-entry
mistake, not a floating-point artifact:

```python
def dot3(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def apply_matrix(matrix, point_h):
    row0_result = dot3(matrix[0], point_h)
    row1_result = dot3(matrix[1], point_h)
    row2_result = dot3(matrix[2], point_h)
    return (row0_result, row1_result, row2_result)


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


fixture_to_table_matrix = (
    (0, -1, 50),
    (1, 0, 20),
    (0, 0, 1),
)

bad_corner_0_in_fixture = (0, 0)
bad_corner_1_in_fixture = (4, 0)
bad_corner_2_in_fixture = (8, 0)

bad_corner_0_h = (bad_corner_0_in_fixture[0], bad_corner_0_in_fixture[1], 1)
bad_corner_1_h = (bad_corner_1_in_fixture[0], bad_corner_1_in_fixture[1], 1)
bad_corner_2_h = (bad_corner_2_in_fixture[0], bad_corner_2_in_fixture[1], 1)

bad_corner_0_in_table_h = apply_matrix(fixture_to_table_matrix, bad_corner_0_h)
bad_corner_1_in_table_h = apply_matrix(fixture_to_table_matrix, bad_corner_1_h)
bad_corner_2_in_table_h = apply_matrix(fixture_to_table_matrix, bad_corner_2_h)

bad_corner_0_in_table = (bad_corner_0_in_table_h[0], bad_corner_0_in_table_h[1])
bad_corner_1_in_table = (bad_corner_1_in_table_h[0], bad_corner_1_in_table_h[1])
bad_corner_2_in_table = (bad_corner_2_in_table_h[0], bad_corner_2_in_table_h[1])

bad_signed_area = cross_product(
    subtract_points(bad_corner_1_in_table, bad_corner_0_in_table),
    subtract_points(bad_corner_2_in_table, bad_corner_0_in_table),
) / 2

print(bad_signed_area)
print(nearly_equal(bad_signed_area, 0, 0.0000001))
```

```
0.0
True
```

Verified by actually running this. `(0, 0)`, `(4, 0)`, and `(8, 0)` are
three genuinely collinear points — a plausible mistake if a machinist
meant to type a pocket's third corner but transposed a coordinate.
`classify_turn` on these three points would correctly report
`"straight"`, but so would it for *any* three collinear points, giving no
indication of how badly wrong the shape is. The area check reports the
real consequence directly: `bad_signed_area` comes out to exactly `0.0`,
and `nearly_equal(bad_signed_area, 0, 0.0000001)` correctly reports
`True` — this "pocket" has no area at all, and a CAM system that tried to
cut it would either fail outright or send a tool along a zero-width line
with no material actually being removed. Catching this before the
transform even matters is exactly why Concept Unit 3's check exists
independent of Concept Unit 2's.

## Exercises

1. Change `pocket_corner_2_in_fixture` to `(5, 0)` instead of `(0, 3)` —
   a genuine mistake that makes all three corners collinear along the
   x-axis. Run this lesson's full pipeline against it and confirm both
   `classify_turn` and the area check correctly flag the problem.
2. Build a *fourth* corner, `pocket_corner_3_in_fixture = (4, 3)`, turning
   the triangle into a quadrilateral. Transform it into table coordinates
   using the same `apply_matrix` pattern, and compute the quadrilateral's
   total signed area by summing the signed areas of the two triangles it
   splits into: corners `0`, `1`, `2` and corners `0`, `2`, `3`.
3. Using `classify_turn`, predict, then verify, what happens if
   `fixture_to_table_matrix`'s basis is replaced with a reflected one —
   `fixture_x_axis_in_table = (0, -1)` instead of `(0, 1)`, keeping
   everything else the same — for both the orientation check and the
   area check. Which one changes, and which one doesn't?

## Definition of Done

- [ ] `geometry_lesson_20.py` exists and runs with no errors via `python
      geometry_lesson_20.py`.
- [ ] Running it prints `(50, 20, 1)`, `(50, 24, 1)`, `(47, 20, 1)`,
      `left`, `left`, `6.0`, `6.0`, then `False` — matching this lesson's
      verified output exactly.
- [ ] You can explain, without looking at the file, why this lesson checks
      both orientation *and* area, rather than treating either check as
      sufficient on its own.
- [ ] You can name which lesson supplied each function this lesson reused
      (`apply_matrix`, `cross_product`, `classify_turn`, `nearly_equal`)
      and what each one contributed to this lesson's final answer.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Combine transformation, orientation, and area checks into one pocket-validation workflow"`,
      not `git commit -m "add lesson 20"`.

Section I, Geometric Thinking, is complete: twenty lessons building from a
single 1D `distance` function up to a full, verified CAD/CAM
transform-and-validate pipeline, using nothing but plain tuples,
hand-written functions, and — as of Lesson 19 — `if`/`elif`/`else`.
Section II, 2D Computational Geometry, begins at Lesson 21 with Lesson
34's already-forward-referenced Polygon Orientation, building directly on
this lesson's own orientation and area checks, now applied to shapes with
more than three sides.
