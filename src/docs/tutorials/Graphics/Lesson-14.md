# Lesson 14: Homogeneous Coordinates

**What you will build:** A single 3×3 matrix that bundles Lesson 12's
origin point and two basis vectors — three separate values, previously
passed as three separate arguments to `transform_to_global` on every
call — into one structured value, plus a matching 3-component version of a
2D point that can be multiplied against it. Multiplying the two together
reproduces Lesson 12's own transformed result exactly. The transferable
problem: origin and basis have been two separate arguments walked around
by hand since Lesson 12; this lesson folds them into one mathematical
object and one operation — the same representation every real graphics
API (OpenGL, DirectX, Three.js) actually uses under the hood.

**What you need to know first:** Lesson 12's `transform_to_global` (the
operation this lesson repackages), Lesson 7's `dot_product` (extended here
to three components instead of two), Lesson 6's basis vectors and Lesson
4's origin (the two pieces this lesson bundles into one matrix), and
Lesson 2's point-vs-vector distinction (revisited in this lesson's
closing).

**Assumed background (outside this curriculum):** unchanged from Lessons
1–13.

**Terms introduced in this lesson:**

- **Matrix** — a grid of numbers, arranged in rows and columns, that
  bundles several related numbers into one structured value. Why: Lesson
  12's `transform_to_global` needs an origin point and two basis vectors —
  three separate values — passed as three separate arguments on every
  call; a matrix packs all three into one value that can be built once,
  stored, and reused without re-listing its parts each time.
- **Homogeneous coordinates** — representing a 2D point as three numbers
  instead of two, by appending a fixed extra component (`1` for a point).
  Why: an ordinary 2×2 matrix can represent rotation and scaling but
  cannot represent translation, because translation means "add a
  constant," and multiplying by a matrix alone can never produce a plain
  addition — padding the point, and the matrix, with one extra dimension
  turns that addition into an ordinary multiplication, which is the only
  operation a matrix knows how to do.
- **Matrix-vector multiplication** — combining a matrix and a (homogeneous)
  point by taking the dot product of each matrix row with the point,
  producing one output number per row. Why: this is the single operation
  that replaces Lesson 12's two-step `from_components` +
  `add_vector_to_point` chain — one multiplication instead of two separate
  function calls, for any origin/basis combination at all.

**Objects and methods used:**

None. This lesson's two new functions, `dot3` and `apply_matrix`, are
hand-authored project code, not external library calls — they receive
full treatment in each Concept Unit's Mechanical Walkthrough below rather
than here. This field is reserved for real external classes or methods
(as `math.sqrt` was in Lesson 9), and this lesson uses none.

---

## Concept Unit: The Matrix — Bundling Origin and Basis Into One Value

### The Problem

Since Lesson 12, calling `transform_to_global` has meant carrying four
separate values around by hand: the point, the origin, the x-axis, and the
y-axis. Three of those four — origin, x-axis, y-axis — never change
between calls that share the same fixture or coordinate frame, yet they
still get re-typed as three separate arguments every single time. Before
building anything new, package those three fixed values into one value
that can be built once and reused.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–13.
- **Files affected:** `geometry_lesson_14.py` — created, as a new file for
  this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
fixture_origin_in_table = (50, 20)
fixture_x_axis_in_table = (0, 1)
fixture_y_axis_in_table = (-1, 0)

transform_matrix = (
    (fixture_x_axis_in_table[0], fixture_y_axis_in_table[0], fixture_origin_in_table[0]),
    (fixture_x_axis_in_table[1], fixture_y_axis_in_table[1], fixture_origin_in_table[1]),
    (0, 0, 1),
)

print(transform_matrix)
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has been
in so far.

### Isolated Concept: Nested Tuples

This is exactly what `transform_matrix` above is doing, isolated: a tuple
whose own elements are themselves tuples, instead of numbers.

```python
tiny_matrix = ((1, 2), (3, 4))
print(tiny_matrix)
print(tiny_matrix[0])
print(tiny_matrix[0][1])
```

Run:

```
((1, 2), (3, 4))
(1, 2)
2
```

`tiny_matrix[0]` proves that indexing a tuple-of-tuples returns a whole
inner tuple, `(1, 2)`, not a single number — the same indexing rule
Lessons 1–13 have always used, just landing on a tuple this time instead
of an `int`. `tiny_matrix[0][1]` proves that indexing can be chained: the
first `[0]` reaches the inner tuple `(1, 2)`, and the second `[1]` then
indexes into *that* tuple to reach `2`. Nothing new was required to make
this work — a tuple was always allowed to hold any value as an element,
including another tuple; this is called a **nested tuple**, and it's the
data shape a matrix uses in this curriculum: a tuple of rows, each row
itself a tuple of numbers.

### Discard

`tiny_matrix` above is now discarded — it exists only to prove nested
indexing works the way `transform_matrix` needs it to, and will not appear
in the project again.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `fixture_origin_in_table = (50, 20)`, `fixture_x_axis_in_table = (0,
  1)`, `fixture_y_axis_in_table = (-1, 0)` — three ordinary tuple
  assignments, already-basic syntax since Lesson 2. The values themselves
  match Lesson 12's own fixture-on-table example exactly, on purpose, so
  this lesson's result can be checked directly against that lesson's
  already-verified answer.
- `transform_matrix = ( (...), (...), (0, 0, 1) )` — first appearance of a
  nested tuple literal in this project's real code (proved safe to index,
  above). Its three rows are built directly from the values just defined:
  row 0 is `(x_axis[0], y_axis[0], origin[0])`, row 1 is `(x_axis[1],
  y_axis[1], origin[1])`, and row 2 is the fixed `(0, 0, 1)`. This
  arrangement — basis vectors and origin as columns, read down each row —
  is what this lesson names a **matrix**: one value that holds everything
  `transform_to_global` used to need as three separate arguments.
  `(fixture_x_axis_in_table[0], fixture_y_axis_in_table[0],
  fixture_origin_in_table[0])` — indexing three already-defined tuples
  with `[0]`, already-basic syntax since Lesson 2, just picking out each
  one's x-component to build row 0.
  `(fixture_x_axis_in_table[1], fixture_y_axis_in_table[1],
  fixture_origin_in_table[1])` — the same pattern with `[1]`, building row
  1 from each tuple's y-component.
  `(0, 0, 1)` — a fixed third row, not derived from anything; its purpose
  isn't explained yet — Concept Unit 3 below shows exactly what this row
  does when the matrix is actually multiplied against a point.
- `print(transform_matrix)` — already-basic, printing the whole nested
  tuple at once, which Python displays with its nested parentheses
  visible, matching the run output below.

### CS Lens

A matrix — numbers arranged in a fixed grid so a whole related group of
values can be built, stored, and passed around as one thing instead of
several — is one of the most reused data shapes in computing, not just
geometry.

```
Also recognized in: every modern GPU's rendering pipeline (OpenGL,
DirectX, Vulkan, and Metal all represent object transforms as 4×4
matrices in 3D — this lesson's 3×3 is the exact same idea one dimension
down), the CSS `matrix()` transform function (its six numbers are
literally this lesson's 3×3 matrix with the always-`(0, 0, 1)` bottom row
omitted, because a browser never needs to see it), and robot kinematics
(a robot arm computes its end effector's position by chaining one matrix
per joint — exactly the chaining Lesson 15 builds next)
```

### SE Lens

The design principle is **bundling related values into one structured
value instead of passing them around as separate parameters**. The
alternative not chosen: keep calling `transform_to_global` with its four
separate arguments forever, the way Lessons 12 and 13 did.

That alternative isn't unreasonable on its own — four named parameters
(`point_in_local`, `origin_in_global`, `x_axis_in_global`,
`y_axis_in_global`) are self-documenting in a way nine anonymous numbers
in a grid are not; nothing about `transform_matrix[1][2]` tells a reader
it's the origin's y-component without already knowing the convention.
The real cost the four-argument approach pays: every function that needs
to combine multiple transforms — chaining two coordinate frames together,
say — has to know how to combine origins and bases by hand, using
different math for each. A matrix pays for its own unlabeled-grid opacity
by making that combination a single, uniform operation, which Lesson 15
uses directly.

### Commands Needed

`python geometry_lesson_14.py` — same interpreter and same command as
every prior lesson. The isolated `tiny_matrix` example above was run the
same way, from its own separate, throwaway file, never added to
`geometry_lesson_14.py`.

### Run It

```
((0, -1, 50), (1, 0, 20), (0, 0, 1))
```

Verified by actually running the file above.

### Connection

`transform_matrix` now exists and holds everything Lesson 12 needed as
three separate arguments — but nothing has been done with it yet. The
next unit gives it something to multiply against.

---

## Concept Unit: Homogeneous Coordinates — Padding the Point to Match the Matrix

### The Problem

`transform_matrix` is three rows of three numbers each. Lesson 12's
points, like `feature = (3, 4)`, are only two numbers. Before the matrix
and a point can be combined row-by-row, the point needs a third number to
match — and, as the next unit will show concretely, that third number
can't be just any placeholder: it has to specifically be `1` for this to
work at all.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_14.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(transform_matrix)` line added in
  Concept Unit 1.
- **Dependencies:** none beyond what Concept Unit 1 already established.

### The New Code

```python
feature_in_fixture = (3, 4)
feature_in_fixture_h = (feature_in_fixture[0], feature_in_fixture[1], 1)

print(feature_in_fixture_h)
```

### The Updated Project

```python
fixture_origin_in_table = (50, 20)
fixture_x_axis_in_table = (0, 1)
fixture_y_axis_in_table = (-1, 0)

transform_matrix = (
    (fixture_x_axis_in_table[0], fixture_y_axis_in_table[0], fixture_origin_in_table[0]),
    (fixture_x_axis_in_table[1], fixture_y_axis_in_table[1], fixture_origin_in_table[1]),
    (0, 0, 1),
)

print(transform_matrix)

feature_in_fixture = (3, 4)                                              # ← new
feature_in_fixture_h = (feature_in_fixture[0], feature_in_fixture[1], 1)  # ← new

print(feature_in_fixture_h)                                              # ← new
```

The file now builds both halves of the multiplication Concept Unit 3
needs: a 3×3 matrix, and a 3-component point built to match it.

*A note on method:* `feature_in_fixture_h` is built with an ordinary tuple
literal, `(a, b, 1)`, from already-covered syntax — indexing an existing
tuple and combining the results with a literal. No new Python construct
is involved (unlike Concept Unit 1's nested tuple), so no isolated
throwaway lab is needed here; the new material in this unit is the
*meaning* of the padding, not new syntax to demonstrate.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `feature_in_fixture = (3, 4)` — already-basic tuple assignment, the same
  point used throughout Lesson 12 and 13's own examples.
- `feature_in_fixture_h = (feature_in_fixture[0], feature_in_fixture[1],
  1)` — first appearance of a **homogeneous point**: the same x and y
  components as `feature_in_fixture`, plus a third component fixed at
  `1`. This fixed third slot is exactly what lets a 3-row matrix be
  multiplied against a 2D point at all — and, specifically, what lets
  translation ride along inside an ordinary multiplication instead of
  needing a separate addition step. Concept Unit 3's walkthrough shows
  precisely how the `1` does that, once the multiplication that uses it
  actually exists to point at.
- `print(feature_in_fixture_h)` — already-basic, printing the padded
  point.

### CS Lens

Padding a point with an extra fixed coordinate so it can be manipulated by
the same matrix machinery as everything else is called **homogeneous
coordinates** — a substantial enough idea, on its own, to be worth
tracing beyond this lesson's fixture example.

```
Also recognized in: every 3D graphics pipeline (a vertex gets a 4th
coordinate, conventionally called w, for exactly this reason — 3D points
are (x, y, z, 1) under the hood in OpenGL, DirectX, and Three.js alike),
projective geometry (the branch of mathematics this trick originates
from, where it also elegantly represents points "at infinity" that
ordinary coordinates can't express), and computer vision (a camera's
projection matrix operates on homogeneous image coordinates to turn a 3D
scene point into a 2D pixel position)
```

### SE Lens

The design principle is **choosing a single uniform data shape over a
type flag or a branch in code**. The alternative not chosen: keep points
as plain 2-tuples, and write a separate check — some `is_vector` flag, or
entirely separate `transform_point` and `transform_direction` functions —
to decide whether translation should apply.

That alternative would make the point/vector distinction visible and
explicit in the code. The real cost homogeneous coordinates pay for
folding that distinction into one quiet extra number: nothing about
`(3, 4, 0)` visually announces "this is a direction, not a point" the way
a named flag would — a reader unfamiliar with the convention has to
already know that the third slot carries meaning. This lesson's own
closing section below runs directly into that cost.

### Commands Needed

`python geometry_lesson_14.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
((0, -1, 50), (1, 0, 20), (0, 0, 1))
(3, 4, 1)
```

Verified by actually running the updated file above.

### Connection

Both pieces the next unit needs now exist side by side: a 3×3 matrix, and
a matching 3-component point. Nothing has combined them yet.

---

## Concept Unit: Matrix-Vector Multiplication — Applying the Matrix

### The Problem

`transform_matrix` and `feature_in_fixture_h` both exist, both have three
components lined up to match, and neither has touched the other yet. The
whole point of building a matrix was to produce a transformed point from
it — this unit builds the operation that actually does that, and checks
its answer against Lesson 12's own already-verified result for the exact
same fixture scenario, `transform_to_global((3, 4), (50, 20), (0, 1),
(-1, 0))`, which comes out to `(46, 23)`.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_14.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(feature_in_fixture_h)` line
  added in Concept Unit 2.
- **Dependencies:** Concept Unit 1's `transform_matrix` and Concept Unit
  2's `feature_in_fixture_h`.

### The New Code

```python
def dot3(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def apply_matrix(matrix, point_h):
    row0_result = dot3(matrix[0], point_h)
    row1_result = dot3(matrix[1], point_h)
    row2_result = dot3(matrix[2], point_h)
    return (row0_result, row1_result, row2_result)


feature_in_table_h = apply_matrix(transform_matrix, feature_in_fixture_h)
print(feature_in_table_h)
```

### The Updated Project

```python
fixture_origin_in_table = (50, 20)
fixture_x_axis_in_table = (0, 1)
fixture_y_axis_in_table = (-1, 0)

transform_matrix = (
    (fixture_x_axis_in_table[0], fixture_y_axis_in_table[0], fixture_origin_in_table[0]),
    (fixture_x_axis_in_table[1], fixture_y_axis_in_table[1], fixture_origin_in_table[1]),
    (0, 0, 1),
)

print(transform_matrix)

feature_in_fixture = (3, 4)
feature_in_fixture_h = (feature_in_fixture[0], feature_in_fixture[1], 1)

print(feature_in_fixture_h)


def dot3(a, b):                                                          # ← new
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]                       # ← new


def apply_matrix(matrix, point_h):                                       # ← new
    row0_result = dot3(matrix[0], point_h)                               # ← new
    row1_result = dot3(matrix[1], point_h)                               # ← new
    row2_result = dot3(matrix[2], point_h)                               # ← new
    return (row0_result, row1_result, row2_result)                       # ← new


feature_in_table_h = apply_matrix(transform_matrix, feature_in_fixture_h)  # ← new
print(feature_in_table_h)                                                # ← new
```

The file as a whole now builds a matrix, pads a point to match it, and
multiplies the two together — the complete homogeneous-coordinates
pipeline this lesson set out to build.

*A note on method:* `dot3` and `apply_matrix` are written using only
already-covered syntax — function definitions, indexing, arithmetic,
tuple construction — so no isolated throwaway lab is needed for either;
the new material here is the mathematical operation they perform, not any
new Python construct.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def dot3(a, b): return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]` — a
  **hard concept reappearing**: this is Lesson 7's `dot_product` — multiply
  matching components, add the results — restated for three components
  instead of two, because matrix rows and homogeneous points both now
  have three slots each instead of two.
- `def apply_matrix(matrix, point_h):` — first appearance: a function that
  takes a whole matrix and a whole homogeneous point together, rather than
  loose numbers.
- `row0_result = dot3(matrix[0], point_h)` — `matrix[0]` indexes the
  nested tuple (proved safe by Concept Unit 1's isolated lab) to pull out
  row 0, a 3-tuple; `dot3` then measures how much of `point_h` lines up
  with that row, the same alignment-measuring idea Lesson 7 established
  for dot products generally, just now producing one coordinate of the
  answer instead of a single comparison value.
- `row1_result = dot3(matrix[1], point_h)`, `row2_result =
  dot3(matrix[2], point_h)` — the identical pattern against rows 1 and 2,
  already explained by the line above.
- `return (row0_result, row1_result, row2_result)` — already-basic tuple
  construction, bundling the three row results back into one homogeneous
  point — the transformed one.
- `feature_in_table_h = apply_matrix(transform_matrix, feature_in_fixture_h)`
  — already-basic function call, combining both of this lesson's earlier
  results.
- `print(feature_in_table_h)` — already-basic.

**Why the padded `1` actually produces translation** (the promise Concept
Unit 2 deferred to here): look at row 0's arithmetic,
`matrix[0][0]*point_h[0] + matrix[0][1]*point_h[1] + matrix[0][2]*point_h[2]`.
The third term is `matrix[0][2] * point_h[2]`, which is `origin_x * 1` —
because `point_h[2]` is always `1` for a point, that term collapses to
plain `origin_x`, added once, unmodified. That's the translation add from
Lessons 4 and 12, hiding inside what looks like an ordinary
multiplication. Row 2, `(0, 0, 1)` dotted with `(x, y, 1)`, always comes
out to exactly `1` — which is why the result below still ends in `1`: the
homogeneous marker survives the multiplication, so the output is a valid
homogeneous point too, ready to feed into another matrix multiply.

### CS Lens

Matrix-vector multiplication — computing each output value as the dot
product of one matrix row against the input — is the single most-executed
operation in computer graphics, and far beyond it.

```
Also recognized in: every GPU vertex shader (transforming a 3D model's
vertices from model space to screen space is, at its core, one
matrix-vector multiply per vertex, run millions of times per frame),
machine learning (a neural network layer's forward pass is fundamentally
repeated matrix-vector, and matrix-matrix, multiplication), and robot
kinematics and camera projection (a robot's end-effector position, or a
3D scene point's position on a camera's image sensor, is computed by this
exact operation — Lesson 15 chains several of these together)
```

### SE Lens

The design principle is **replacing several operations with one uniform
operation**, applied consistently regardless of which specific transform
is being performed. Lesson 13 proved that `transform_to_global` already
handled translation, rotation, scaling, and shear as different inputs to
the same *function*; this unit proves the same thing one level deeper —
`apply_matrix` handles all four as different inputs to the same
*multiplication*, replacing `transform_to_global`'s own internal two-step
chain (`from_components` then `add_vector_to_point`) with a single
operation.

The alternative not chosen: keep `transform_to_global`'s two-step,
four-argument shape as the permanent representation. The real cost that
alternative pays, which this lesson's own result exposes directly:
composing two transforms — first apply one coordinate-frame conversion,
then another — would require hand-deriving a new combined origin and a
new combined basis using two different formulas (Lesson 5's own "walk the
chain link-by-link vs. combine offsets first" problem, solved by hand
each time). A single matrix composes with another single matrix through
one uniform operation, matrix-vector multiplication's close relative,
which Lesson 15 builds next.

### Commands Needed

`python geometry_lesson_14.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
((0, -1, 50), (1, 0, 20), (0, 0, 1))
(3, 4, 1)
(46, 23, 1)
```

Verified by actually running the updated file above. `(46, 23, 1)`
matches Lesson 12's `transform_to_global((3, 4), (50, 20), (0, 1), (-1,
0))` result of `(46, 23)` exactly, component for component — re-verified
this session by actually running Lesson 12's own function against these
same numbers.

### Connection

All three pieces this lesson set out to build — a matrix, a padded point,
and the multiplication that combines them — now exist together, and
produce Lesson 12's own answer exactly. The matrix form isn't a new
result; it's a repackaging of an old one.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `fixture_origin_in_table = (50, 20)`, `fixture_x_axis_in_table = (0,
   1)`, `fixture_y_axis_in_table = (-1, 0)` — the same fixture-on-table
   setup Lesson 12 used for its own worked example.
2. Those three values become `transform_matrix = ((0, -1, 50), (1, 0,
   20), (0, 0, 1))` — one structured value standing in for what used to
   be three separate arguments.
3. `feature_in_fixture = (3, 4)` becomes `feature_in_fixture_h = (3, 4,
   1)` — the same point, padded with a fixed `1` so it has three
   components to match the matrix's three rows.
4. `apply_matrix(transform_matrix, feature_in_fixture_h)` computes three
   dot products, one per row: row 0 gives `0*3 + (-1)*4 + 50*1 = 46`, row
   1 gives `1*3 + 0*4 + 20*1 = 23`, row 2 gives `0*3 + 0*4 + 1*1 = 1`.
5. The result, `(46, 23, 1)`, matches `transform_to_global((3, 4), (50,
   20), (0, 1), (-1, 0))`'s own answer of `(46, 23)` exactly — the same
   transformation, computed a completely different way.

## What Breaks Without This

Concept Unit 2 padded `feature_in_fixture` with `1` and moved on without
fully explaining why it had to be exactly `1`. Lesson 2 drew a hard line
between **points** (a location) and **vectors** (a direction, with no
location of its own) — and that distinction is exactly what the
homogeneous coordinate controls. Check it directly: apply the same matrix
to the same `(3, 4)`, once padded with `1` and once padded with `0`.

```python
fixture_origin_in_table = (50, 20)
fixture_x_axis_in_table = (0, 1)
fixture_y_axis_in_table = (-1, 0)

transform_matrix = (
    (fixture_x_axis_in_table[0], fixture_y_axis_in_table[0], fixture_origin_in_table[0]),
    (fixture_x_axis_in_table[1], fixture_y_axis_in_table[1], fixture_origin_in_table[1]),
    (0, 0, 1),
)


def dot3(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def apply_matrix(matrix, point_h):
    row0_result = dot3(matrix[0], point_h)
    row1_result = dot3(matrix[1], point_h)
    row2_result = dot3(matrix[2], point_h)
    return (row0_result, row1_result, row2_result)


feature_in_fixture = (3, 4)

feature_as_point = (feature_in_fixture[0], feature_in_fixture[1], 1)
feature_as_direction = (feature_in_fixture[0], feature_in_fixture[1], 0)

print(apply_matrix(transform_matrix, feature_as_point))
print(apply_matrix(transform_matrix, feature_as_direction))
```

```
(46, 23, 1)
(-4, 3, 0)
```

Verified by actually running this. Padded with `1`, `(3, 4)` becomes `(46,
23, 1)` — the origin's `(50, 20)` got folded in, same as Concept Unit 3.
Padded with `0` instead, the exact same matrix produces `(-4, 3, 0)` — the
origin never gets added at all, because every `origin * 0` term in each
row's dot product collapses to `0` instead of `origin`. What survives is
only the basis-vector part of the transform, matching Lesson 13's own
`rotated` result of `(-4, 3)` from that lesson's identical basis vectors,
exactly. This is not a bug or an edge case — it's homogeneous
coordinates' actual point: a `0` in the last slot means "this is a
**direction**, not a **point**," and a direction has no location for an
origin shift to move, which is precisely Lesson 2's original claim about
vectors, now expressed as a single number instead of a separate rule.
Code that forgets this — padding a direction with `1` by habit, or a
point with `0` — would silently either mistranslate a direction that
should have ignored the origin, or leave a point's translation out
entirely, with no error or crash to reveal the mistake.

## Exercises

1. Predict, then verify with `dot3`/`apply_matrix`, what happens if
   `feature_in_fixture` is passed to `apply_matrix` without padding it at
   all — as the plain 2-tuple `(3, 4)` instead of a 3-component
   homogeneous point. Explain, in your own words, exactly which line of
   `dot3` causes the failure.
2. Build the homogeneous point for a different feature, `(-2, 5)`, and run
   it through `apply_matrix` with this lesson's own `transform_matrix`.
   Then check your answer by calling Lesson 12's `transform_to_global((-2,
   5), (50, 20), (0, 1), (-1, 0))` and confirming the first two components
   match exactly.
3. Using this lesson's own `transform_matrix`, predict whether a direction
   padded with `0` and then transformed again by a *second* application of
   `apply_matrix` still has `0` as its third component, then verify it.
   (Hint: look at what row 2 of the matrix always does to a `0` in the
   last slot.)

## Definition of Done

- [ ] `geometry_lesson_14.py` exists and runs with no errors via `python
      geometry_lesson_14.py`.
- [ ] Running it prints `((0, -1, 50), (1, 0, 20), (0, 0, 1))`, then `(3,
      4, 1)`, then `(46, 23, 1)` — matching this lesson's verified output
      exactly.
- [ ] You can explain, without looking at the file, why the third matrix
      row is fixed at `(0, 0, 1)` and what would change about the result
      if it weren't.
- [ ] You can explain why padding a point with `1` versus `0` changes
      whether an origin shift affects it, using this lesson's own verified
      `(46, 23, 1)` vs. `(-4, 3, 0)` numbers.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Repackage origin and basis as one matrix, reproducing Lesson 12's result via matrix-vector multiplication"`,
      not `git commit -m "add matrix code"`.

Next: Lesson 15 — Transformation Composition, where two matrices combine
into one through matrix-matrix multiplication, replacing the hand-derived
"combine offsets first" arithmetic Lesson 5 had to work out manually for
chained coordinate frames.
