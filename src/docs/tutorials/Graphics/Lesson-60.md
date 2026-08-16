# Lesson 60: Orthographic Projection

**What you will build:** `build_orthographic_matrix` and
`project_point_orthographic` — a second way to flatten a 3D camera-space
point onto a 2D image, this one deliberately **not** shrinking distant
things. Lesson 59's own closing already produced exactly this behavior
once, by accident, when it skipped perspective division — this lesson
builds the same result on purpose, and shows why a real CAD/CAM drawing
often wants it that way deliberately: an orthographic projection
preserves true measurements regardless of how far away something is,
which is exactly why real engineering drawings use it instead of a
perspective view.

**What you need to know first:** Lesson 59's `build_perspective_matrix`,
`perspective_divide`, and its own closing — the accidental no-divide
result this lesson's own opening unit names directly and reproduces on
purpose.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–59.

**Terms introduced in this lesson:**

None. Orthographic projection was already named and explained, honestly,
in Lesson 59's own closing ("a real, legitimate technique... used
deliberately in real CAD/engineering drawings specifically because it
preserves true measurements regardless of distance") — this lesson
builds it as real project code rather than re-introducing the concept.

**Objects and methods used:**

None new.

---

## Concept Unit: Building the Projection Lesson 59 Produced by Accident

### The Problem

Lesson 59's own closing already showed what happens when a projection
matrix's own `w` stays fixed at `1` instead of tracking depth: two
points at different distances project to the identical screen `x`. That
was framed as a mistake at the time — a missing perspective-divide step.
The same matrix shape, with the same fixed `w = 1`, is exactly the
correct orthographic projection matrix when built on purpose.

### Project Change

- **Reference Source:** No reference counterpart — a direct, deliberate
  construction of the same shape Lesson 59's own closing already
  produced by omission.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 59's `project_point`).
- **Change type:** add.
- **Location:** new section, `# ── L60: orthographic projection ──`.
- **Dependencies:** `apply_matrix4`, `perspective_divide` (Lesson 55/59
  — `perspective_divide` reused unchanged, not rebuilt).

### The New Code

```python
def build_orthographic_matrix(scale):
    s = scale
    return (
        (s, 0, 0, 0),
        (0, s, 0, 0),
        (0, 0, 1, 0),
        (0, 0, 0, 1),
    )


def project_point_orthographic(point_camera, scale):
    matrix = build_orthographic_matrix(scale)
    raw = apply_matrix4(matrix, point_camera)
    return perspective_divide(raw)
```

### The Updated Project

Both brand-new, freestanding functions — nothing surrounding them yet
to show placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `build_orthographic_matrix`
and `project_point_orthographic` in its new "L60: orthographic
projection" section.

### Mechanical Walkthrough

- `(s, 0, 0, 0)`, `(0, s, 0, 0)` — **(b) hard concept reappearing**
  (Lesson 59) — the same scale-`x`-and-`y` rows `build_perspective_matrix`
  already used, renamed `scale` rather than `focal_length` since nothing
  here depends on depth the way a lens's focal length implies.
- `(0, 0, 1, 0)` — **(b) hard concept reappearing** (Lesson 59) — `z`
  still passed through unchanged.
- `(0, 0, 0, 1)` — **(a) first appearance**, as the one row that
  actually distinguishes this matrix from Lesson 59's own: a plain `1`
  in the bottom-right, the exact shape every rigid transform since
  Lesson 55 has always used, instead of Lesson 59's own depth-tracking
  `(0, 0, -1, 0)`. `w` stays `1` no matter what depth a point has.
- `project_point_orthographic`'s own call to `perspective_divide` —
  **(b) hard concept reappearing** (Lesson 59), reused completely
  unchanged. Dividing by a `w` that's always `1` changes nothing at
  all — `perspective_divide` isn't wrong to call here; it's simply
  inert on this specific input, the same function correctly handling
  two different situations without needing its own separate variant.

### Real Verification

Run the identical near/far comparison Lesson 59's own opening unit used,
through this lesson's own orthographic matrix instead:

```python
proj_near = project_point_orthographic((1, 0, -10, 1), 10)
proj_far = project_point_orthographic((1, 0, -20, 1), 10)
print("proj_near =", proj_near)
print("proj_far  =", proj_far)
print("ratio near_x / far_x =", proj_near[0] / proj_far[0])
```

Real output:

```
proj_near = (10.0, 0.0, -10.0)
proj_far  = (10.0, 0.0, -20.0)
ratio near_x / far_x = 1.0
```

Both points project to the identical `x`, `10.0` — a ratio of exactly
`1.0`, not Lesson 59's own `2.0`. This is the same numeric shape as
Lesson 59's own accidental no-divide result, reached this time through
a matrix built deliberately for it, with a real, named purpose rather
than a missing step.

### Connecting Sentence

Depth genuinely has no effect on where a point lands — the closing below
confirms this is exactly the property real technical drawings depend on,
not merely a side effect of skipping perspective division.

---

## Closing

### Connect the Pieces

Confirm the property that actually makes orthographic projection useful
for CAD/CAM drawings: two points the same true size, at *different*
distances from the camera, should project to the exact same on-screen
size — not merely the same position, but the same measured *span*.
Project both ends of two equal-length, one-unit-wide spans, one near and
one far:

```python
span_near_a = project_point_orthographic((0.5, 0, -10, 1), 10)
span_near_b = project_point_orthographic((-0.5, 0, -10, 1), 10)
span_far_a = project_point_orthographic((0.5, 0, -20, 1), 10)
span_far_b = project_point_orthographic((-0.5, 0, -20, 1), 10)
near_width = span_near_a[0] - span_near_b[0]
far_width = span_far_a[0] - span_far_b[0]
print("near_width =", near_width, " far_width =", far_width)
```

Real output:

```
near_width = 10.0  far_width = 10.0
```

Identical — a `1`-unit-wide object measures exactly `10.0` screen units
wide whether it sits `10` units or `20` units from the camera. This is
the real, concrete reason a machinist reading an orthographic CAD
drawing can measure a feature directly off the page with a ruler and
trust the result: the drawing's own projection guarantees size doesn't
lie about distance, unlike Lesson 59's own perspective view, where the
identical measurement would depend on exactly how far each point sat
from the camera.

### What Breaks Without This

The same property that makes orthographic projection trustworthy for
measurement is also a real, honest limitation, not a bug to fix: nothing
about a projected point's own size or position reveals how far away it
actually is. Lesson 59's own `ratio near_x / far_x = 2.0` was a real,
usable depth cue — a viewer (or a piece of code) could recover relative
distance from apparent size alone. Confirm that same trick genuinely
cannot work here:

```python
print("orthographic ratio near_x / far_x =", proj_near[0] / proj_far[0])
```

Real output:

```
orthographic ratio near_x / far_x = 1.0
```

Always `1.0`, regardless of how different the two real depths actually
are — there is no depth information left to recover from this ratio at
all. A real system that needs both trustworthy measurement *and* a
sense of depth (a CAD viewport with a depth-shaded render, for example)
has to keep a point's own `z` around separately rather than trying to
infer it from the projected `x`/`y` the way Lesson 59's own perspective
view allowed. This isn't a failure of `project_point_orthographic`
itself — the function does exactly what an orthographic projection is
supposed to do — but a caller that expects *both* properties
(measurement-preserving *and* depth-revealing) from a single projection
choice is asking for something no single projection, orthographic or
perspective, can honestly provide at once.

### Exercises

- Confirm doubling the `scale` argument to `build_orthographic_matrix`
  doubles a projected point's own `x` and `y`, the same check Lesson
  59's own exercises ran for `focal_length`.
- Pick two points with different `x` values but the *same* depth, and
  confirm their orthographic projection preserves the same real-world
  distance between them that Lesson 59's own perspective projection
  would only preserve at that one specific depth.
- Using both `project_point` (Lesson 59) and `project_point_orthographic`
  on the same set of points, describe — from the real numbers each one
  produces — which one a machinist reading a printed part drawing would
  actually want, and why.

### Definition of Done

- [ ] `build_orthographic_matrix` and `project_point_orthographic` both
      exist in `geometry_verified_library.py`.
- [ ] The near/far equal-projection claim was verified with a real ratio
      (`1.0`), directly contrasted against Lesson 59's own `2.0`, not
      just asserted as "depth is ignored."
- [ ] The equal-real-size-equal-projected-size property was verified
      with real measured spans at two different depths, not just
      inferred from the projection matrix's own shape.
- [ ] The depth-information-loss limitation was stated as an honest
      tradeoff, with the specific real numbers proving it, not
      presented as a bug needing a fix.
- [ ] Commit with a message stating *why*: orthographic projection now
      exists as a deliberate, named choice — the same shape Lesson 59's
      own closing produced by omission, built here for its own real,
      legitimate CAD/CAM purpose.
