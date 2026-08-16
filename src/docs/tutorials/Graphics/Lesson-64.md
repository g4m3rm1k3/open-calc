# Lesson 64: Ray-Plane Intersection

**What you will build:** `ray_plane_intersection` — the general formula
this curriculum has been circling since Lesson 62: given a ray (a
point and a direction, per Lesson 22's own ray convention) and a plane
(Lesson 63's own `(point_on_plane, normal)` representation), find
exactly where they cross, or correctly report that they don't. Lesson
62's own `clip_segment_to_near` already solved one specific instance of
this problem by hand, restricted to a plane perpendicular to the
camera's own `z` axis. This lesson's own closing runs the general
formula on that exact same case and confirms it reproduces Lesson 62's
own result exactly — proof that the general formula subsumes the
special-cased one, not merely resembles it.

**What you need to know first:** Lesson 22's own ray representation and
`is_t_on_ray`. Lesson 63's own plane representation, `dot3`, and
`point_on_line_3d`. Lesson 62's own `clip_segment_to_near` — this
lesson's own closing re-derives its exact result through the general
formula built here.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–63.

**Terms introduced in this lesson:**

None. Every idea this lesson needs — rays, planes, the parametric line
formula, tolerant zero-comparison — already received full treatment in
Lessons 17, 22, and 63.

**Objects and methods used:**

None new.

---

## Concept Unit: Solving for the Crossing Point

### The Problem

A point on a ray is `ray_origin + t · ray_direction`, for `t ≥ 0`
(Lesson 22's own ray convention). That point lies on a plane exactly
when it satisfies Lesson 63's own plane test: the vector from the
plane's own known point to it is perpendicular to the plane's own
normal. Combining those two facts turns "where does the ray cross the
plane" into a single equation with one unknown, `t`.

### Project Change

- **Reference Source:** No reference counterpart — this is the standard
  ray-plane intersection formula, derived directly from Lesson 22's ray
  equation and Lesson 63's own plane test, not ported from an external
  source.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 63's `signed_distance_to_plane`).
- **Change type:** add.
- **Location:** new section, `# ── L64: ray-plane intersection ──`.
- **Dependencies:** `dot3`, `subtract_points_3d`, `point_on_line_3d`
  (Lesson 63), `is_t_on_ray` (Lesson 22), `nearly_equal` (Lesson 17).

### The New Code

```python
def ray_plane_intersection(ray_origin, ray_direction, plane):
    point_on_plane, normal = plane
    denominator = dot3(normal, ray_direction)
    if nearly_equal(denominator, 0, 0.0000001):
        return "no intersection"
    numerator = dot3(normal, subtract_points_3d(point_on_plane, ray_origin))
    t = numerator / denominator
    if is_t_on_ray(t) == False:
        return "no intersection"
    return point_on_line_3d(ray_origin, ray_direction, t)
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `ray_plane_intersection` as
the first function in its new "L64: ray-plane intersection" section.

### Mechanical Walkthrough

- `point_on_plane, normal = plane` — **(b) hard concept reappearing**
  (Lesson 63).
- `denominator = dot3(normal, ray_direction)` — **(a) first appearance**,
  as a pattern: this measures how much the ray's own direction points
  *toward or away from* the plane. If the ray runs exactly parallel to
  the plane — never approaching or receding from it at all — this dot
  product comes out to exactly zero, the same "perpendicular means zero
  dot product" fact Lesson 63's own `is_point_on_plane` already relied
  on, here applied to a direction instead of an offset.
- `if nearly_equal(denominator, 0, 0.0000001): return "no intersection"`
  — **(b) hard concept reappearing** (Lesson 17, and the same
  guard-clause shape Lesson 25's own `segment_intersection` already
  used for a parallel case). A ray running parallel to the plane either
  never meets it or lies entirely within it — neither case has one
  single well-defined crossing point, so this function correctly
  declines to answer rather than dividing by (nearly) zero.
- `numerator = dot3(normal, subtract_points_3d(point_on_plane, ray_origin))`
  — **(b) hard concept reappearing**, both pieces already established —
  this measures how far the ray's own starting point sits from the
  plane, along the normal's own direction.
- `t = numerator / denominator` — **(a) first appearance**, as the
  actual solved value: substituting the ray's own parametric formula
  into the plane's own perpendicularity condition and solving for `t`
  algebraically produces exactly this fraction — the same "solve one
  equation for one unknown" idea Lesson 24's own `line_intersection`
  already used, here in three dimensions instead of two.
- `if is_t_on_ray(t) == False: return "no intersection"` — **(b) hard
  concept reappearing** (Lesson 22). A negative `t` means the plane sits
  *behind* the ray's own origin — mathematically a valid crossing of the
  full, infinite line the ray sits on, but not a real crossing of the
  ray itself.
- `point_on_line_3d(ray_origin, ray_direction, t)` — **(b) hard concept
  reappearing** (Lesson 63).

### Real Verification

The simplest possible case: a ray pointing straight down, from ten units
above the table, hitting the table's own flat surface directly beneath
it:

```python
table_plane = ((0, 0, 0), (0, 0, 1))
result = ray_plane_intersection((3, 4, 10), (0, 0, -1), table_plane)
print("result =", result)
```

Real output:

```
result = (3.0, 4.0, 0.0)
```

Exactly `(3, 4, 0)` — directly beneath the ray's own starting point, on
the table's own surface, matching intuition precisely for a ray with no
sideways component at all.

### Connecting Sentence

The general formula gives the obviously-correct answer on the simplest
possible case — the closing below runs it against the one case this
curriculum already knows the answer to by a completely different route.

---

## Closing

### Connect the Pieces

Re-derive Lesson 62's own near-plane crossing — the exact segment from
that lesson's own real verification — using this lesson's general
formula instead of `clip_segment_to_near`'s own hand-written arithmetic,
on both the on-axis and the off-axis case Lesson 62 originally checked:

```python
near = 1
near_plane = ((0, 0, -near), (0, 0, 1))

p1 = (0, 0, -0.5)
p2 = (0, 0, -5)
via_general = ray_plane_intersection(p1, subtract_points_3d(p2, p1), near_plane)
via_clip = clip_segment_to_near(p1, p2, near)
print("on-axis, via general formula:", via_general)
print("on-axis, via Lesson 62's own clip:", via_clip[0])

p3 = (2, 1, -0.5)
p4 = (2, 1, -3)
via_general2 = ray_plane_intersection(p3, subtract_points_3d(p4, p3), near_plane)
via_clip2 = clip_segment_to_near(p3, p4, near)
print("off-axis, via general formula:", via_general2)
print("off-axis, via Lesson 62's own clip:", via_clip2[0])
```

Real output:

```
on-axis, via general formula: (0.0, 0.0, -1.0)
on-axis, via Lesson 62's own clip: (0.0, 0.0, -1.0)
off-axis, via general formula: (2.0, 1.0, -1.0)
off-axis, via Lesson 62's own clip: (2.0, 1.0, -1.0)
```

Identical, on both cases. `clip_segment_to_near`'s own hand-derived
arithmetic — `t = (near - depth1) / (depth2 - depth1)` — and this
lesson's general `ray_plane_intersection` were always computing the same
crossing point; Lesson 62 simply reached it through a shortcut valid
only for a plane perpendicular to the camera's own `z` axis, while this
lesson's own formula reaches the identical answer for a plane oriented
any way at all.

### What Breaks Without This

Confirm the two guard clauses this lesson's own walkthrough already
explained actually fire on real, deliberately chosen inputs, not just
that they exist in the code:

```python
parallel_result = ray_plane_intersection((3, 4, 10), (1, 0, 0), table_plane)
print("ray parallel to the plane:", parallel_result)

behind_result = ray_plane_intersection((0, 0, -10), (0, 0, -1), table_plane)
print("plane behind the ray's own origin:", behind_result)
```

Real output:

```
ray parallel to the plane: no intersection
plane behind the ray's own origin: no intersection
```

A ray running sideways at a fixed height never approaches or recedes
from the table's own flat surface — the `denominator` guard catches it
before any division happens at all. A ray starting *below* the table
and pointing further down never crosses back up through it — the
mathematically valid solution for `t` here is negative (the crossing
point lies behind where the ray actually starts), and the `is_t_on_ray`
guard correctly reports no real intersection rather than returning a
point the ray never actually reaches. Skipping either guard would
either crash with a real `ZeroDivisionError` (the parallel case) or
silently return a point that looks valid but that the ray, as an actual
ray rather than an infinite line, never reaches at all (the behind-
origin case) — both real, distinct failure modes this function's own
two checks exist specifically to prevent.

### Exercises

- Confirm `ray_plane_intersection` correctly finds the crossing point
  for a plane that isn't axis-aligned — build a plane with normal
  `(1, 1, 1)` and a ray of your own choosing that genuinely crosses it,
  and verify the result satisfies `is_point_on_plane` (Lesson 63).
- Using `signed_distance_to_plane` (Lesson 63), confirm the point
  `ray_plane_intersection` returns always has a signed distance of
  (nearly) exactly `0` from the plane it was tested against.
- Find a ray and plane where `t` comes out to exactly `0` — the ray's
  own starting point already sits on the plane — and confirm
  `ray_plane_intersection` correctly returns that starting point
  unchanged rather than treating `t = 0` as "no intersection."

### Definition of Done

- [ ] `ray_plane_intersection` exists in `geometry_verified_library.py`.
- [ ] The simplest straight-down case was verified against an obviously
      correct expected answer.
- [ ] Lesson 62's own near-plane crossing was re-derived through this
      lesson's general formula and confirmed to match exactly, on both
      an on-axis and an off-axis case.
- [ ] Both guard clauses (parallel ray, plane behind the ray's origin)
      were actually triggered with real inputs and their real
      `"no intersection"` output shown, not just described.
- [ ] Commit with a message stating *why*: this curriculum now has one
      general ray-plane intersection formula, confirmed to subsume
      Lesson 62's own special-cased near-plane arithmetic rather than
      merely resembling it.
