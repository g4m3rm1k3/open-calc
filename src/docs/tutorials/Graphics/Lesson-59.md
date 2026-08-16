# Lesson 59: Perspective Projection

**What you will build:** `build_perspective_matrix`, `perspective_divide`,
and `project_point` — the operation that converts a 3D camera-space
point (Lesson 58) into a 2D point on an image plane, making farther
things appear smaller than nearer things. The transferable problem:
every transform this curriculum has built since Lesson 14 — rotation,
translation, rigid transforms, cameras — has been **linear** (or affine:
linear plus a shift), always expressible as one matrix multiplication,
and every homogeneous point this curriculum has ever produced has kept
its own `w` component fixed at exactly `1`. Perspective projection
breaks both of those patterns on purpose: it needs an actual **division**
by depth, something no matrix multiplication alone can do — and this
lesson's own opening unit shows that the existing 4×4 machinery can
still get *most* of the way there, producing a `w` that is no longer
`1` for the first time in this curriculum, with one new, genuinely
non-linear step still needed to finish the job.

**What you need to know first:** Lesson 58's own camera-space points and
its established convention that a point in front of the camera has a
*negative* camera-space `z` (its own `part_origin_cam_tilt` result
landed at `z ≈ -17.32`, not positive). Lesson 55's `apply_matrix4` and
`to_homogeneous_3d`. Lesson 47's `math.sin`/`math.cos`, reused here only
to confirm a result, not as new code.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–58.

**Terms introduced in this lesson:**

- **perspective division** — dividing a point's own `x`, `y`, and `z`
  components by its own `w` component, after a matrix multiplication has
  already run. It exists as its own named step, separate from the
  matrix multiplication itself, because it's the one place in this
  entire curriculum's own transform pipeline where the operation is
  genuinely **non-linear** — every matrix this curriculum has built
  since Lesson 14 computes each output component as a fixed weighted
  sum of the input's components, and a weighted sum can never itself
  divide one input component by another. Perspective division is what
  actually produces the visual effect of distant things looking
  smaller: the same real-world offset, divided by a larger depth,
  produces a smaller on-screen result.

**Objects and methods used:**

None new.

---

## Concept Unit: A Matrix That Produces `w ≠ 1`

### The Problem

Every homogeneous point this curriculum has built since Lesson 14 has
kept its own fourth component fixed at `1` — `to_homogeneous_3d` sets it
directly, and every rigid transform's own bottom row, `(0, 0, 0, 1)`,
guarantees it stays that way through any composition. Projecting a 3D
point onto a 2D image plane needs the *opposite*: a point's own apparent
size on screen has to shrink as its depth grows, which means the matrix
doing the projecting has to produce something that depends on depth in
its own output — exactly what a fixed `w = 1` can never carry.

### Project Change

- **Reference Source:** No reference counterpart — a simple pinhole-
  camera projection matrix, standard graphics-programming construction,
  not ported from a specific external reference.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 58's `world_to_camera`).
- **Change type:** add.
- **Location:** new section, `# ── L59: perspective projection ──`.
- **Dependencies:** `apply_matrix4` (Lesson 55).

### The New Code

```python
def build_perspective_matrix(focal_length):
    f = focal_length
    return (
        (f, 0, 0, 0),
        (0, f, 0, 0),
        (0, 0, 1, 0),
        (0, 0, -1, 0),
    )
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `build_perspective_matrix` as
the first function in its new "L59: perspective projection" section.

### Mechanical Walkthrough

- `f = focal_length` — **(c) already basic.**
- `(f, 0, 0, 0)` and `(0, f, 0, 0)` — **(a) first appearance.** These
  two rows scale a camera-space point's own `x` and `y` by the
  **focal length** — a single number standing in for how "zoomed in"
  the projection is, the same role a real camera lens's own focal
  length plays.
- `(0, 0, 1, 0)` — **(a) first appearance.** This row copies a point's
  own camera-space `z` straight through into the output's third
  component, unchanged — kept here for the next unit's own use, not
  discarded.
- `(0, 0, -1, 0)` — **(a) first appearance**, the row this whole unit
  exists to explain: applied to a point `(x, y, z, 1)`, `dot4((0, 0,
  -1, 0), (x, y, z, 1))` equals `-z` — a genuinely new idea for this
  curriculum's own output `w`: not the fixed `1` every prior lesson's
  matrix guaranteed, but a value that depends on the input point's own
  depth. Because Lesson 58 already established that "in front of the
  camera" means a *negative* camera-space `z`, `-z` is a *positive*
  number for anything actually visible — this row is what turns raw
  depth into something usable as a scaling factor.

### Real Verification

Apply the matrix to two points that share the same `x`/`y` offset but
sit at different depths — one twice as far from the camera as the
other:

```python
P = build_perspective_matrix(10)
p_near = (1, 0, -10, 1)
p_far = (1, 0, -20, 1)
raw_near = apply_matrix4(P, p_near)
raw_far = apply_matrix4(P, p_far)
print("raw_near (x,y,z,w) =", raw_near)
print("raw_far  (x,y,z,w) =", raw_far)
```

Real output:

```
raw_near (x,y,z,w) = (10, 0, -10, 10)
raw_far  (x,y,z,w) = (10, 0, -20, 20)
```

Both points still share the same raw `x`, `10` — the matrix alone
hasn't actually separated them by depth yet. What has changed is `w`:
`10` for the near point, `20` for the far one, exactly matching each
point's own distance in front of the camera. This is the one new piece
of information this matrix adds that every prior lesson's matrix never
needed to carry.

### Connecting Sentence

The matrix alone produces a `w` that correctly tracks depth, but the two
points' own `x` values are still identical — the actual size-shrinking
effect has to come from somewhere else.

---

## Concept Unit: Perspective Divide — the Genuinely Non-Linear Step

### The Problem

`raw_near` and `raw_far` both carry `x = 10`, even though the far point
is twice as distant and should appear half as large on screen. The
information needed to fix that — each point's own depth — is sitting
right there in `w`, but nothing so far actually *uses* it.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `build_perspective_matrix` in the same
  section.
- **Dependencies:** none beyond plain division.

### The New Code

```python
def perspective_divide(point_h):
    w = point_h[3]
    return (point_h[0] / w, point_h[1] / w, point_h[2] / w)


def project_point(point_camera, focal_length):
    matrix = build_perspective_matrix(focal_length)
    raw = apply_matrix4(matrix, point_camera)
    return perspective_divide(raw)
```

### The Updated Project

Both brand-new, freestanding functions, same exception as
`build_perspective_matrix` above. `geometry_verified_library.py`'s
"L59: perspective projection" section now carries all three of this
lesson's own functions in sequence, `project_point` combining the other
two into one convenient call.

### Mechanical Walkthrough

- `w = point_h[3]` — **(c) already basic.**
- `point_h[0] / w`, `point_h[1] / w`, `point_h[2] / w` — **(a) first
  appearance**, as the **perspective division** this lesson's own
  Header term names directly. This is the step that actually makes a
  farther point's `x` and `y` shrink: two points sharing the same raw
  `x` but different `w` values come out of this division with different
  final `x` values, in inverse proportion to their own depth. No matrix
  multiplication in this curriculum has ever divided one output by
  another — `apply_matrix4` and everything built on it only ever
  compute weighted sums, which is exactly why this step has to happen
  separately, after the matrix, rather than being folded into it.
- `project_point`'s own body — **(b) hard concept reappearing** twice
  over (`build_perspective_matrix`, `apply_matrix4`), combined with
  **(a)** `perspective_divide`, called in sequence — a convenience
  wrapper, not a new idea of its own.

### Real Verification

Finish the same near/far comparison this lesson's own opening unit
started:

```python
proj_near = perspective_divide(raw_near)
proj_far = perspective_divide(raw_far)
print("proj_near =", proj_near)
print("proj_far  =", proj_far)
print("ratio near_x / far_x =", proj_near[0] / proj_far[0])
```

Real output:

```
proj_near = (1.0, 0.0, -1.0)
proj_far  = (0.5, 0.0, -1.0)
ratio near_x / far_x = 2.0
```

The far point's own projected `x`, `0.5`, is exactly half the near
point's `1.0` — the far point really is twice as distant, and its own
projected size shrank by exactly that same factor. `ratio near_x /
far_x` comes back exactly `2.0`, matching the depth ratio between the
two points precisely, not approximately.

### CS Lens

Perspective division is a genuine departure from every transform this
curriculum has built since Lesson 14 — a **non-linear** operation,
meaning it cannot be expressed as any fixed matrix multiplication no
matter how the matrix's own entries are chosen (a linear map can only
ever compute weighted sums of its inputs; it can never divide one
output by a value that itself depends on the input). Recognized well
beyond this one operation:

```
Also recognized in: every real-time 3D game engine and CAD viewport's
own render pipeline, photographic lenses (the actual optical reason
distant objects appear smaller), architectural perspective drawing —
centuries older than any of this curriculum's own math, worked out by
Renaissance artists well before it had a name like "perspective
division"
```

### Connecting Sentence

`project_point` now correctly shrinks distant points on screen — the
closing below traces one full point through the entire pipeline this
curriculum has built since Lesson 58, and shows exactly what's lost if
the division step gets skipped.

---

## Closing

### Connect the Pieces

Confirm a point sitting exactly on the camera's own view axis (`x = 0`,
`y = 0`) always projects to the exact center of the image, `(0, 0)`,
regardless of how far away it is — the one case where perspective
division has nothing to redistribute, since there was no `x`/`y` offset
to shrink in the first place:

```python
p_center = (0, 0, -15, 1)
raw_center = apply_matrix4(P, p_center)
proj_center = perspective_divide(raw_center)
print("proj_center =", proj_center)
```

Real output:

```
proj_center = (0.0, 0.0, -1.0)
```

Exactly `(0, 0)` — a point directly ahead of the camera stays directly
ahead on screen no matter its distance, exactly matching real-world
intuition and confirming this lesson's own pipeline doesn't introduce
any spurious drift for the one case with nothing to project inward.

### What Breaks Without This

Skip `perspective_divide` entirely and use the raw matrix output's own
`x`/`y` directly — exactly the state this lesson's own opening unit
left `raw_near` and `raw_far` in, before the second unit's own fix:

```python
print("raw_near[:2] (no divide) =", raw_near[:2])
print("raw_far[:2]  (no divide) =", raw_far[:2])
```

Real output:

```
raw_near[:2] (no divide) = (10, 0)
raw_far[:2]  (no divide) = (10, 0)
```

Identical — a point twice as far away projects to the *exact same*
screen position as the near one, with no size difference at all. This
is a real, verified, silently wrong result with a specific, well-known
name: it's not that the output looks like garbage, it's that it looks
exactly like an **orthographic** projection instead (parallel, depth-
blind projection, used deliberately in real CAD/engineering drawings
specifically *because* it preserves true measurements regardless of
distance) — a real, legitimate technique, just not the one this lesson
was building, and not something this pipeline warns about if the
missing step is simply forgotten. One more real, sharper failure worth
checking directly — what happens at the one depth `perspective_divide`
can never handle:

```python
p_at_camera = (1, 1, 0, 1)
raw_at_camera = apply_matrix4(P, p_at_camera)
print("raw_at_camera =", raw_at_camera)
try:
    bad = perspective_divide(raw_at_camera)
    print("no crash:", bad)
except ZeroDivisionError as e:
    print("ZeroDivisionError:", e)
```

Real output:

```
raw_at_camera = (10, 10, 0, 0)
ZeroDivisionError: division by zero
```

A point sitting exactly at the camera's own position (`z = 0` in camera
space) produces `w = 0`, and dividing by it crashes immediately with a
real, verified `ZeroDivisionError` — a genuinely different *kind* of
failure from the silent orthographic-collapse case just above, the same
"varied kinds of real failure" pattern this curriculum has followed
since its own earliest lessons. Neither failure is fixed here; both are
honestly disclosed, real scope boundaries of this lesson's own simple
pinhole model.

### Exercises

- Pick a point with a nonzero `y` (not just `x`) and confirm perspective
  division shrinks it the same proportional way this lesson's own `x`
  example demonstrated.
- Using `project_point`, confirm that doubling the `focal_length`
  argument doubles a projected point's own `x` and `y` — connecting
  this lesson's own "zoomed in" description of focal length to a real,
  checkable number.
- Find the smallest positive camera-space `z` (a point *just* in front
  of the camera, not exactly at it) where `project_point`'s own output
  still looks like a reasonable, finite number — and describe what
  happens to the projected coordinates as that depth keeps shrinking
  toward (but never reaching) zero.

### Definition of Done

- [ ] `build_perspective_matrix`, `perspective_divide`, and
      `project_point` all exist in `geometry_verified_library.py`.
- [ ] The near/far size-ratio claim was verified with a real, exact
      number (`2.0`), not just "the far point looked smaller."
- [ ] The on-axis center-point case was verified to project to exactly
      `(0, 0)` regardless of depth.
- [ ] The no-divide failure was actually run and shown to produce
      identical output for two points at different depths, named
      explicitly as an accidental orthographic projection, not just "the
      wrong numbers."
- [ ] The `z = 0` crash was actually triggered and its real
      `ZeroDivisionError` shown, not just described as a risk.
- [ ] Commit with a message stating *why*: 3D camera-space points can
      now be projected onto a 2D image plane with correct depth-based
      scaling, the first genuinely non-linear step in this curriculum's
      own transform pipeline since Lesson 14.
