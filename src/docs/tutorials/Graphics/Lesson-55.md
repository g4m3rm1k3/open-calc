# Lesson 55: Rigid Transformations

**What you will build:** `dot4`, `apply_matrix4`, `to_homogeneous_3d`,
`build_rigid_transform`, `get_column4`, and `multiply_matrices4` — a 3D
extension of Lesson 14–16's own 2D homogeneous-matrix machinery, this
time genuinely combining rotation (now available in four independent
representations, Lessons 47–54) with translation into one 4×4 matrix.
The transferable problem: Lesson 48 found, as a pleasant surprise, that
the existing 3-component `apply_matrix` already fit a 3×3 rotation
matrix with no changes needed at all. This lesson opens by testing the
same question for a 4×4 rigid-transform matrix — and finds the opposite
answer: the existing machinery does **not** fit for free this time, and
silently produces a plausible-looking, completely wrong result instead
of an error. Building genuinely new 4-component functions is what fixes
it, and this lesson's own closing reproduces Lesson 12 and Lesson 14's
own fixture-scenario numbers exactly, now with a real third dimension
added on top.

**What you need to know first:** Lesson 14's `dot3`/`apply_matrix` and
its own fixture scenario (`fixture_x_axis_in_table = (0, 1)`,
`fixture_y_axis_in_table = (-1, 0)`, `fixture_origin_in_table = (50,
20)`, `feature_in_fixture = (3, 4)`) — this lesson's own closing
extends that exact scenario into 3D. Lesson 48's `rotation_matrix_z` and
its own "columns are where basis vectors land" proof. Lesson 46's own
confirmed result that 2D is the `z = 0` special case of 3D.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–54.

**Terms introduced in this lesson:**

None. **Rigid transformation** was already given full, real treatment
in Lesson 48's own CS Lens ("a transformation that preserves distance
between every pair of points... and preserves angles"), even though it
wasn't listed in that lesson's own Terms Introduced glossary — per the
Repetition Rule's own condition, a concept that received genuine
explanation anywhere in an earlier lesson doesn't need a second entry
just because it wasn't in that lesson's formal list. Homogeneous
coordinates were already introduced in Section I (Lesson 14) for 2D;
their 4-component 3D shape is a dimensional extension of an
already-taught idea, not a new concept — the same judgment call already
applied to `add_vector_to_point_3d` and friends back in Lesson 46.

**Objects and methods used:**

None new.

---

## Concept Unit: Does the Existing Machinery Already Fit?

### The Problem

Lesson 48 opened by asking whether `apply_matrix` — built in Lesson 14
for 2D homogeneous coordinates — already worked correctly on a genuine
3×3 rotation matrix with no changes, and found that it did. A rigid
transformation in 3D needs a 4×4 matrix (a 3×3 rotation block plus a
3-component translation column, the exact shape Lesson 14–16 already
used in 2D at one dimension lower). Before writing any new code, this
unit asks the identical question Lesson 48 asked: does the existing
`apply_matrix`, built for exactly 3-component rows and points, already
work on this new, larger shape?

### Project Change

- **Reference Source:** No reference counterpart — this unit tests
  existing project code (`apply_matrix`, Lesson 14) against a new input
  shape rather than adding new project code.
- **Files affected:** none — verification only.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** `apply_matrix` (Lesson 14), `rotation_matrix_z`
  (Lesson 48).

### The New Code

```python
R = rotation_matrix_z(90)
t = (10, 20, 30)
M4 = (
    (R[0][0], R[0][1], R[0][2], t[0]),
    (R[1][0], R[1][1], R[1][2], t[1]),
    (R[2][0], R[2][1], R[2][2], t[2]),
    (0, 0, 0, 1),
)
point_h = (3, 4, 5, 1)
naive_result = apply_matrix(M4, point_h)
print("apply_matrix(M4, point_h) [existing 3-component function] =", naive_result)
```

### Real Output

Running the print above, against what a `90°` rotation about `z`
followed by a translation of `(10, 20, 30)` should actually produce for
the point `(3, 4, 5)`:

```
apply_matrix(M4, point_h) [existing 3-component function] = (-4.0, 3.0000000000000004, 5)
```

Compare this against the real answer, computed the honest way — rotate
first, using Lesson 48's own already-verified `rotation_matrix_z`, then
translate, using Lesson 46's own `add_vector_to_point_3d`:

```python
rotated = apply_matrix(R, (3, 4, 5))
expected = add_vector_to_point_3d(rotated, t)
print("rotated =", rotated)
print("expected final =", expected)
```

Real output:

```
rotated = (-4.0, 3.0000000000000004, 5)
expected final = (6.0, 23.0, 35)
```

The existing `apply_matrix`'s own result, `(-4.0, 3.0, 5)`, is exactly
the *rotated-only* answer — the translation never happened at all.
Unlike Lesson 48's own pleasant surprise, reuse does **not** work for
free here: `dot3`, underneath `apply_matrix`, is written as
`a[0]*b[0] + a[1]*b[1] + a[2]*b[2]` — three explicit indices, nothing
more. Handed a 4-component row and a 4-component point, it silently
reads only the first three components of each and never touches the
fourth at all — not the translation column of the matrix, and not the
homogeneous `1` on the point. This is a real, verified, silently wrong
result: `apply_matrix(M4, point_h)` raises no error and returns a
plausible-looking 3D point, and nothing about the output alone reveals
that an entire operation — the translation — was quietly skipped.

### Real Fix

```python
def dot4(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]


def apply_matrix4(matrix, point_h):
    return (
        dot4(matrix[0], point_h),
        dot4(matrix[1], point_h),
        dot4(matrix[2], point_h),
        dot4(matrix[3], point_h),
    )


def to_homogeneous_3d(point):
    return (point[0], point[1], point[2], 1)
```

### The Updated Project

All three brand-new, freestanding functions — nothing surrounding them
yet to show placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `dot4`, `apply_matrix4`, and
`to_homogeneous_3d` as the first three functions in its new
"L55: rigid transformations" section.

### Mechanical Walkthrough

- `a[0]*b[0] + a[1]*b[1] + a[2]*b[2] + a[3]*b[3]` — **(a) first
  appearance**, as a pattern: the same accumulator-of-products shape
  `dot3` already used, extended by one more term — a genuine Repetition-
  Rule dimensional extension, the same relationship `add_vector_to_point_3d`
  already had to its 2D counterpart back in Lesson 46, not a new idea.
- `dot4(matrix[0], point_h)` (and the three lines beneath it) — **(b)
  hard concept reappearing** — the same row-times-point pattern
  `apply_matrix` already used, run four times instead of three because
  the matrix now has four rows.
- `to_homogeneous_3d`'s own `(point[0], point[1], point[2], 1)` — **(b)
  hard concept reappearing** — the identical homogeneous-point
  convention Lesson 14 already established in 2D (`(x, y, 1)`), extended
  by the same one-more-component pattern (`(x, y, z, 1)`).

### Real Verification

```python
M4_real = (
    (R[0][0], R[0][1], R[0][2], t[0]),
    (R[1][0], R[1][1], R[1][2], t[1]),
    (R[2][0], R[2][1], R[2][2], t[2]),
    (0, 0, 0, 1),
)
result4 = apply_matrix4(M4_real, to_homogeneous_3d((3, 4, 5)))
print("apply_matrix4(M4_real, to_homogeneous_3d((3,4,5))) =", result4)
```

Real output:

```
apply_matrix4(M4_real, to_homogeneous_3d((3,4,5))) = (6.0, 23.0, 35, 1)
```

Matching `expected = (6.0, 23.0, 35)` from earlier, plus the unchanged
homogeneous `1` in the fourth slot — the same behavior Lesson 14's own
`apply_matrix` already had (it returns the full `(x, y, 1)` triple
unstripped, per that lesson's own self-check), continued here without
change.

### Connecting Sentence

`apply_matrix4` correctly rotates and translates a point in one step —
the next unit builds a real function for constructing the 4×4 matrix
itself, rather than assembling it by hand from a rotation matrix's own
individual rows every time.

---

## Concept Unit: Assembling Rotation and Translation — `build_rigid_transform`

### The Problem

The previous unit's own `M4`/`M4_real` matrices were built by hand,
copying each row of a rotation matrix and appending one translation
component per row — exactly the kind of repetitive, error-prone
assembly a real function should do once, correctly, rather than leaving
every caller to reconstruct by hand.

### Project Change

- **Reference Source:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`, the
  `apply_matrix`/`multiply_matrices` section (Lesson 14–15) — this
  function generalizes that same 2D homogeneous-matrix-assembly pattern
  to 3D; no separate external reference exists for this project-specific
  helper.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `to_homogeneous_3d` in the same section.
- **Dependencies:** a 3×3 rotation matrix (any of Lesson 48's
  `rotation_matrix_x`/`_y`/`_z`), a 3-component translation vector
  (Lesson 46's own representation).

### The New Code

```python
def build_rigid_transform(rotation_matrix, translation):
    r = rotation_matrix
    t = translation
    return (
        (r[0][0], r[0][1], r[0][2], t[0]),
        (r[1][0], r[1][1], r[1][2], t[1]),
        (r[2][0], r[2][1], r[2][2], t[2]),
        (0, 0, 0, 1),
    )
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `build_rigid_transform`
directly after `to_homogeneous_3d`.

### Mechanical Walkthrough

- `r = rotation_matrix`, `t = translation` — **(c) already basic.**
  Plain variable assignment, used only for shorter names in the return
  expression below.
- `(r[0][0], r[0][1], r[0][2], t[0])` (and the two rows beneath it) —
  **(a) first appearance**, as a pattern: each output row is the
  rotation matrix's own row, with exactly one translation component
  appended — the literal, mechanical version of what this lesson's own
  opening unit did by hand.
- `(0, 0, 0, 1)` — **(a) first appearance.** The fixed bottom row every
  rigid-transform matrix needs — three zeros (this row contributes
  nothing to the output's `x`, `y`, or `z`) and a trailing `1` (this row
  produces the output's own homogeneous coordinate, always exactly `1`
  for a point, never scaled or shifted by this kind of transform).

### Real Verification

Confirm two special cases collapse correctly — a rotation with **no**
translation should reduce to plain rotation, and **no** rotation
(the identity matrix) with a real translation should reduce to plain
translation:

```python
identity_r = ((1, 0, 0), (0, 1, 0), (0, 0, 1))
pure_translate = build_rigid_transform(identity_r, (7, 8, 9))
r1 = apply_matrix4(pure_translate, to_homogeneous_3d((1, 2, 3)))
print("pure translate (1,2,3)+(7,8,9) =", r1)

pure_rotate = build_rigid_transform(rotation_matrix_z(90), (0, 0, 0))
r2 = apply_matrix4(pure_rotate, to_homogeneous_3d((3, 4, 5)))
r2_direct = apply_matrix(rotation_matrix_z(90), (3, 4, 5))
print("pure rotate via 4x4 =", r2, " vs direct 3x3 rotation_matrix_z =", r2_direct)
```

Real output:

```
pure translate (1,2,3)+(7,8,9) = (8, 10, 12, 1)
pure rotate via 4x4 = (-4.0, 3.0000000000000004, 5, 1) vs direct 3x3 rotation_matrix_z = (-4.0, 3.0000000000000004, 5)
```

`(1, 2, 3)` plus `(7, 8, 9)`, with no rotation at all, correctly comes
back `(8, 10, 12)` — ordinary vector addition, matching Lesson 1's own
`add_vector_to_point`. Zero translation with a real `90°` rotation
matches Lesson 48's own direct `rotation_matrix_z` result exactly, down
to the same floating-point digits. `build_rigid_transform` genuinely
generalizes both special cases rather than approximating them.

### Connecting Sentence

A single rigid transform now assembles correctly from any rotation and
any translation — the closing below applies one to this curriculum's
own recurring fixture scenario, now with a real third dimension.

---

## Extending the Pattern: Composing Two Rigid Transforms

**A note on method:** no new concept here — Lesson 15's own
`get_column`/`multiply_matrices` already received full treatment; this
is the identical Repetition-Rule dimensional extension `dot4` already
received above, applied to the matrix-composition machinery this time.
No isolation lab is owed.

### Project Change

- **Reference Source:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`, Lesson
  15's `get_column`/`multiply_matrices` — direct 4×4 extension of that
  same 3×3 pattern.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `build_rigid_transform` in the same
  section.
- **Dependencies:** `dot4` (this lesson).

### The New Code

```python
def get_column4(matrix, col_index):
    return (matrix[0][col_index], matrix[1][col_index], matrix[2][col_index], matrix[3][col_index])


def multiply_matrices4(a, b):
    b_col0 = get_column4(b, 0)
    b_col1 = get_column4(b, 1)
    b_col2 = get_column4(b, 2)
    b_col3 = get_column4(b, 3)
    row0 = (dot4(a[0], b_col0), dot4(a[0], b_col1), dot4(a[0], b_col2), dot4(a[0], b_col3))
    row1 = (dot4(a[1], b_col0), dot4(a[1], b_col1), dot4(a[1], b_col2), dot4(a[1], b_col3))
    row2 = (dot4(a[2], b_col0), dot4(a[2], b_col1), dot4(a[2], b_col2), dot4(a[2], b_col3))
    row3 = (dot4(a[3], b_col0), dot4(a[3], b_col1), dot4(a[3], b_col2), dot4(a[3], b_col3))
    return (row0, row1, row2, row3)
```

### The Updated Project

Both brand-new, freestanding functions, same exception as
`build_rigid_transform` above. `geometry_verified_library.py`'s
"L55: rigid transformations" section now carries all six of this
lesson's own functions in sequence.

### Real Verification

CAD/CAM chains of exactly this shape — a tool positioned relative to a
fixture, the fixture positioned relative to a table — are why this
section exists at all. Build two such transforms and confirm composing
them via `multiply_matrices4` matches applying them one after another:

```python
tool_to_fixture = build_rigid_transform(rotation_matrix_z(0), (1, 1, 1))
fixture_to_table = build_rigid_transform(rotation_matrix_z(90), (50, 20, 15))
composed = multiply_matrices4(fixture_to_table, tool_to_fixture)
p_tool = (2, 0, 0)
step1 = apply_matrix4(tool_to_fixture, to_homogeneous_3d(p_tool))
step2 = apply_matrix4(fixture_to_table, step1)
via_composed = apply_matrix4(composed, to_homogeneous_3d(p_tool))
print("nested (tool -> fixture -> table) =", step2)
print("composed matrix applied once      =", via_composed)
```

Real output:

```
nested (tool -> fixture -> table) = (49.0, 23.0, 16.0, 1.0)
composed matrix applied once      = (49.0, 23.0, 16.0, 1.0)
```

Matching exactly. Note `apply_matrix4`'s own output is already a
homogeneous 4-tuple (with a trailing `1`), so it can be fed straight
back into another `apply_matrix4` call with no repackaging — the same
convenience Lesson 14's own `apply_matrix` already had in 2D. The
composition order matches every earlier lesson's own convention
(`multiply_matrices4(A, B)` applies `B` first, `A` second): here,
`tool_to_fixture` is the rightmost argument and the first transform
applied, exactly matching the physical order — a point starts in the
tool's own local frame, first becomes a fixture-relative point, then
becomes a table-relative point.

### Connecting Sentence

Two rigid transforms now compose into one reusable matrix, the same
capability Lesson 48 built for pure rotation — the closing below applies
everything this lesson built to the exact scenario this curriculum has
returned to since Lesson 14.

---

## Closing

### Connect the Pieces

Extend Lesson 14's own fixture scenario into 3D, reusing its exact
numbers per this curriculum's own established convention: the fixture
is still turned `90°` relative to the table (`rotation_matrix_z(90)`,
matching `fixture_x_axis_in_table = (0, 1)` and
`fixture_y_axis_in_table = (-1, 0)` exactly), still sits at
`fixture_origin_in_table = (50, 20)` in the table's own `x`/`y` plane —
now genuinely raised `15` units above the table along `z`, a dimension
Lesson 14 never had. `feature_in_fixture = (3, 4)` becomes `(3, 4, 0)`,
sitting exactly in the fixture's own base plane:

```python
fixture_transform = build_rigid_transform(rotation_matrix_z(90), (50, 20, 15))
feature_in_fixture_3d = (3, 4, 0)
result_fixture = apply_matrix4(fixture_transform, to_homogeneous_3d(feature_in_fixture_3d))
print("result_fixture =", result_fixture)
```

Real output:

```
result_fixture = (46.0, 23.0, 15, 1)
```

The `x` and `y` components, `46.0` and `23.0`, are exactly Lesson 12 and
Lesson 14's own already-verified `(46, 23)` result — the fixture's own
2D placement scenario really was the `z = 0` special case of this
lesson's own genuinely 3D one, confirmed with the identical numbers
carried forward five sections later, and the new `z = 15` is the one
genuinely new piece of information this lesson's own third dimension
adds.

### What Breaks Without This

`apply_matrix4` and `dot4` both assume every point handed to them is
already homogeneous — a 4-tuple, not a plain 3-tuple. Nothing checks
this. Pass a plain, un-homogenized point directly:

```python
try:
    bad = apply_matrix4(M4_real, (3, 4, 5))
    print("no crash:", bad)
except Exception as e:
    print("raised:", type(e).__name__, e)
```

Real output:

```
raised: IndexError tuple index out of range
```

A real crash, with a real traceback type and message — `dot4` tries to
read `a[3]`/`b[3]` on a 4-tuple matrix row against a 3-tuple point, and
Python raises `IndexError` the moment it reaches the missing fourth
slot. This is a genuinely different *kind* of failure from this
lesson's own opening unit — that one ran to completion and returned a
plausible-looking wrong answer with no error at all; this one stops
immediately with a real exception. Both are real risks this lesson's own
functions carry: forgetting to convert a point with `to_homogeneous_3d`
first crashes loudly; reaching for the wrong function entirely (plain
`apply_matrix` instead of `apply_matrix4`) fails silently instead. A
caller has to get the *right* function and the *right* input shape
together — neither one alone is enough.

### Exercises

- Confirm `build_rigid_transform` with `rotation_matrix_x` or
  `rotation_matrix_y` (Lesson 48) instead of `rotation_matrix_z`
  produces a correct combined transform — pick your own translation and
  point, and verify the result against separate rotate-then-translate
  steps the way this lesson's own opening unit did.
- Using `multiply_matrices4`, compose three rigid transforms instead of
  two (extend this lesson's own `tool_to_fixture`/`fixture_to_table`
  chain with one more stage of your own choosing), and confirm the
  triple-composed matrix, applied once, matches three separate nested
  `apply_matrix4` calls.
- Confirm that composing a rigid transform with its own "undo" — a
  transform built from the same rotation's own inverse (Lesson 16's
  transpose trick, applied to the 3×3 block) and the negated translation
  — returns any point to exactly where it started.

### Definition of Done

- [ ] `dot4`, `apply_matrix4`, `to_homogeneous_3d`,
      `build_rigid_transform`, `get_column4`, and `multiply_matrices4`
      all exist in `geometry_verified_library.py`.
- [ ] The naive-reuse failure (plain `apply_matrix` silently dropping
      translation on a 4×4 input) was actually run and its wrong output
      compared against the correct answer, not just described.
- [ ] `build_rigid_transform`'s two special cases (zero rotation, zero
      translation) were both verified against already-known results from
      earlier lessons, not assumed from the formula's shape alone.
- [ ] The fixture scenario was extended into 3D using Lesson 14's own
      exact numbers, and its `x`/`y` result was confirmed to still match
      that lesson's own `(46, 23)`.
- [ ] The homogeneous-point crash was actually triggered and its real
      `IndexError` shown, not just described as a risk.
- [ ] Commit with a message stating *why*: rotation and translation now
      combine into one reusable 4×4 matrix, extending Lesson 14's own 2D
      pattern rather than replacing it — and the commit message should
      name Lesson 56 (SE(2) and SE(3)) as where this lesson's own
      concrete construction gets its formal mathematical name.
