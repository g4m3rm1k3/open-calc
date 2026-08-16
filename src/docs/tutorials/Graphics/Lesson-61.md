# Lesson 61: View Frustums

**What you will build:** `is_in_frustum` — a function that answers a
question nothing built through Lesson 60 has ever been able to answer:
is a given point actually somewhere the camera can see at all? Every
lesson since Lesson 58 has assumed a point is worth projecting; a real
camera only sees a bounded region of space — too close, too far, or too
far off to either side, and a point simply isn't visible, no matter how
correctly Lesson 59's own perspective math would project it if asked.
That bounded region has a real name and a real shape: the **view
frustum**, a truncated pyramid bounded by a near plane, a far plane, and
four side planes determined by how wide the camera's own field of view
is.

**What you need to know first:** Lesson 58's own camera-space points and
its established sign convention (a point in front of the camera has
negative camera-space `z`; `depth = -z` is how far in front it sits).
Lesson 59's own `x / depth`-style ratio, the same idea this lesson's own
field-of-view test reuses to check *how far* to the side a point sits,
not just how far it projects. Lesson 47's `math.radians`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–60.

**Terms introduced in this lesson:**

- **view frustum** — the bounded region of 3D space a camera can
  actually see: everything between a near plane and a far plane (too
  close or too far and nothing is visible, even directly ahead), and
  within a cone-like spread to each side determined by the camera's own
  field of view. It exists as its own named shape because a real camera
  never sees everything in front of it — this lesson's own function is
  the first thing in this curriculum able to say "no" to a point Lesson
  59's own `project_point` would otherwise happily project.

**Objects and methods used:**

- **`math.tan`**
  - *What it is:* the third of the standard trigonometric functions,
    alongside Lesson 47's `math.sin` and `math.cos`, part of the same
    `math` module.
  - *Implementation:* `math.tan(x) -> float`, `x` in radians. Same
    C-implemented, libm-wrapping nature as `math.sin`/`math.cos`/
    `math.radians` — no Python-level source body to fetch; contract
    cited from the official documentation.
  - *Its use:* this lesson's own field-of-view test needs to know, at a
    given depth, how far to the side the camera's own view cone has
    spread — exactly what `tan` of the field-of-view's own half-angle
    gives directly.

---

## Concept Unit: `math.tan` — the Third Trigonometric Function

### The Problem

A camera's own field of view is naturally described as an angle — "this
camera sees `90°` side to side." Turning that angle into an actual
boundary — how far a point can drift sideways, at a given depth, before
it leaves the camera's view — needs a function that relates an angle
directly to a ratio of sideways distance over depth, the same
relationship a right triangle's own opposite and adjacent sides have.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none yet — this unit's own code is throwaway.
- **Change type:** N/A (isolated lab only).
- **Location:** N/A.
- **Dependencies:** `math.radians` (Lesson 47).

### The New Code

```python
print(math.tan(math.radians(45)))
print(math.tan(math.radians(0)))
print(math.tan(math.radians(30)))
```

### Real Output

Running the three prints above:

```
0.9999999999999999
0.0
0.5773502691896257
```

`math.tan(math.radians(45))` comes back `≈1` — at a `45°` half-angle, a
point's own sideways drift can be as large as its own depth before it
leaves the boundary. `math.tan(math.radians(0))` is exactly `0` — a
field of view of zero width allows no sideways drift at all, matching
intuition directly. `math.tan(math.radians(30))` comes back
`≈0.577` — `1/√3`, a real, checkable value. This throwaway example is
now discarded; the next unit uses `math.tan` for real, on an actual
field-of-view angle.

### Connecting Sentence

`math.tan` converts an angle directly into a ratio — exactly the shape
needed to turn "this camera's field of view is `45°`" into a real,
checkable boundary on a point's own position.

---

## Concept Unit: Bounding a Point — Depth, Then Sides

### The Problem

A point belongs inside the view frustum only if it passes several
separate checks at once: not too close, not too far, and not drifted
too far to either side relative to how far away it already is. Nothing
built through Lesson 60 combines these checks into one answer.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  combination of already-established camera-space conventions (Lesson
  58) and this lesson's own `math.tan`-based field-of-view boundary.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 60's `project_point_orthographic`).
- **Change type:** add.
- **Location:** new section, `# ── L61: view frustums ──`.
- **Dependencies:** `math.tan`, `math.radians` (Lesson 47 and this
  lesson).

### The New Code

```python
def is_in_frustum(point_camera, near, far, vertical_half_fov_degrees, aspect_ratio):
    x, y, z = point_camera
    depth = -z
    if depth < near:
        return False
    if depth > far:
        return False
    vertical_limit = math.tan(math.radians(vertical_half_fov_degrees))
    horizontal_limit = vertical_limit * aspect_ratio
    if abs(y / depth) > vertical_limit:
        return False
    if abs(x / depth) > horizontal_limit:
        return False
    return True
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `is_in_frustum` as the first
function in its new "L61: view frustums" section.

### Mechanical Walkthrough

- `x, y, z = point_camera` — **(c) already basic.**
- `depth = -z` — **(b) hard concept reappearing** (Lesson 58's own
  established sign convention — a point in front of the camera has
  negative camera-space `z`).
- `if depth < near: return False` — **(a) first appearance.** This is
  the **near plane**, this lesson's own Header term made concrete: too
  close, and nothing is visible, the same real limitation an actual
  camera lens has.
- `if depth > far: return False` — **(a) first appearance**, the
  mirror-image **far plane** — too distant, and a point is also
  invisible.
- `vertical_limit = math.tan(math.radians(vertical_half_fov_degrees))`
  — **(b) hard concept reappearing**, full treatment earlier in this
  lesson. This is the maximum allowed ratio of sideways drift to depth,
  vertically.
- `horizontal_limit = vertical_limit * aspect_ratio` — **(a) first
  appearance.** A camera's own horizontal field of view is normally
  wider than its vertical one exactly in proportion to its own image's
  own width-to-height ratio — multiplying the vertical limit by that
  same **aspect ratio** gives the matching horizontal boundary, without
  needing a second, separately-specified angle.
- `if abs(y / depth) > vertical_limit: return False` — **(a) first
  appearance**, as a pattern: `y / depth` is the same *kind* of ratio
  Lesson 59's own perspective projection already computed (`x` divided
  by depth-derived `w`) — here compared directly against a fixed
  boundary rather than used to scale an on-screen position.
- `if abs(x / depth) > horizontal_limit: return False` — **(b) hard
  concept reappearing**, the same ratio-and-compare pattern just
  established, applied to the other axis.
- `return True` — **(c) already basic.** Reached only if every
  preceding check passed.

### Real Verification

Confirm each boundary independently — a point comfortably inside every
limit, then one that fails each check in turn:

```python
print("well within range:", is_in_frustum((0, 0, -10), 1, 100, 45, 16 / 9))
print("too close (inside near plane):", is_in_frustum((0, 0, -0.5), 1, 100, 45, 16 / 9))
print("too far:", is_in_frustum((0, 0, -200), 1, 100, 45, 16 / 9))
print("far off to the side:", is_in_frustum((50, 0, -10), 1, 100, 45, 16 / 9))
```

Real output:

```
well within range: True
too close (inside near plane): False
too far: False
far off to the side: False
```

Every boundary this lesson's own function checks actually fires on a
real, deliberately chosen violation, not just on the one comfortable
case. Confirm the vertical boundary is exact, not approximate, by
computing the precise cutoff at a fixed depth and testing a point just
inside and just outside it:

```python
vlimit = math.tan(math.radians(45))
max_y_at_depth_10 = vlimit * 10
print("max_y_at_depth_10 =", max_y_at_depth_10)
print("just inside:", is_in_frustum((0, max_y_at_depth_10 - 0.01, -10), 1, 100, 45, 16 / 9))
print("just outside:", is_in_frustum((0, max_y_at_depth_10 + 0.01, -10), 1, 100, 45, 16 / 9))
```

Real output:

```
max_y_at_depth_10 = 9.999999999999998
just inside: True
just outside: False
```

A `0.02`-unit shift — `0.01` on either side of the exact computed
boundary — flips the result, confirming the vertical limit is a real,
precise cutoff rather than a rough approximation.

### Connecting Sentence

Every individual boundary works correctly — the closing below shows
what happens if one of them, the near plane specifically, is left out.

---

## Closing

### Connect the Pieces

Trace a single point through every check `is_in_frustum` performs, in
the order they run: a point sitting directly on the camera's own `z`
axis (no sideways drift to worry about at all) at exactly the boundary
between "too close" and "in range":

```python
print(is_in_frustum((0, 0, -1.0), 1, 100, 45, 16 / 9))
print(is_in_frustum((0, 0, -0.999), 1, 100, 45, 16 / 9))
```

Real output:

```
True
False
```

A depth of exactly `1.0` — matching `near` exactly — passes (the check
is `depth < near`, not `depth <= near`, so equality counts as inside);
`0.999`, a hair closer, fails. The near plane is a real, precise
boundary, tested at the exact edge, not just somewhere comfortably
inside or outside it.

### What Breaks Without This

The near-plane check might look like it only matters for points that
are merely *too close* — a minor inconvenience compared to the far
plane or the side limits. Build a version that skips it and test it
against something more serious than "too close": a point that sits
*behind* the camera entirely.

```python
def is_in_frustum_no_near_check(point_camera, near, far, vertical_half_fov_degrees, aspect_ratio):
    x, y, z = point_camera
    depth = -z
    if depth > far:
        return False
    vertical_limit = math.tan(math.radians(vertical_half_fov_degrees))
    horizontal_limit = vertical_limit * aspect_ratio
    if abs(y / depth) > vertical_limit:
        return False
    if abs(x / depth) > horizontal_limit:
        return False
    return True

p_behind = (0, 0, 5)
print("point behind the camera, no-near-check result:", is_in_frustum_no_near_check(p_behind, 1, 100, 45, 16 / 9))
print("point behind the camera, correct result:", is_in_frustum(p_behind, 1, 100, 45, 16 / 9))
```

Real output:

```
point behind the camera, no-near-check result: True
point behind the camera, correct result: False
```

A point with camera-space `z = 5` — behind the camera, per Lesson 58's
own sign convention — has `depth = -5`, a *negative* number. The
far-plane check (`depth > far`) never catches it, since `-5` is not
greater than `100`. The side checks don't catch it either, since `x`
and `y` are both `0` here regardless of what `depth`'s own sign is. Only
the near-plane check (`depth < near`) correctly identifies `-5` as
outside the valid range at all. This is a real, verified, and
genuinely serious failure — not merely "a point too close was let
through," but a point *behind the camera entirely* was accepted as
visible, which in a real rendering pipeline shows up as objects
appearing to render when the camera is facing away from them
completely, a well-known real class of bug in graphics programming
this specific check exists to prevent.

### Exercises

- Confirm a point exactly on the far-plane boundary (`depth` equal to
  `far`) is accepted, the same way this lesson's own closing confirmed
  the near-plane boundary — and confirm one unit beyond it is rejected.
- Using a narrower field of view (`10°` instead of `45°`) and the same
  test point that passed at `45°`, confirm it now fails — connecting a
  camera's own "zoom" setting directly to a real, checkable change in
  which points are visible.
- Pick your own `aspect_ratio` (wider or narrower than `16/9`) and
  confirm the horizontal limit changes proportionally, while the
  vertical limit stays exactly the same.

### Definition of Done

- [ ] `is_in_frustum` exists in `geometry_verified_library.py`.
- [ ] Each of the four boundaries (near, far, horizontal, vertical) was
      independently triggered with a real, deliberately out-of-range
      point, not just tested in aggregate with one comfortable case.
- [ ] The vertical field-of-view boundary was tested at a precise
      computed cutoff, with a point on each side of it, not just
      "clearly inside" or "clearly outside."
- [ ] The missing-near-check failure was actually run against a point
      genuinely behind the camera, and the real consequence (accepted
      as visible when it should not be) stated explicitly, not just "a
      wrong boolean."
- [ ] Commit with a message stating *why*: a camera's own view now has
      real, checkable bounds — not every point Lesson 59's own
      projection math could technically process is actually something
      the camera can see.
