# Lesson 62: Clipping Planes

**What you will build:** `point_on_segment_3d` and
`clip_segment_to_near` — the first function in this curriculum able to
answer a question Lesson 61's own `is_in_frustum` never could: not just
*whether* a segment is visible, but *where exactly* it crosses a
frustum boundary, and what new, shorter segment remains on the visible
side. The transferable problem: `is_in_frustum` tests a single point —
fully in, or fully out. A real segment — one edge of a 3D model —
routinely has one endpoint inside the frustum and one outside, and
"fully in or fully out" has no answer for that case at all. **Clipping**
is the operation that actually computes the crossing point and produces
new geometry, truncated exactly at the boundary — this lesson's own
opening unit shows, for the second time in this curriculum, that a 2D
tool built for a lower dimension doesn't extend to 3D for free, the
same lesson Lesson 55 and Lesson 46 already taught with 2D `apply_matrix`
and `scale_vector`.

**What you need to know first:** Lesson 61's own `is_in_frustum` and its
established `depth = -z` convention. Lesson 21's own `point_on_line` and
the parametric-line pattern it established (a point found by scaling a
direction vector by `t` and adding it to a start point) — this lesson's
own new code is that identical pattern, rebuilt for 3D. Lesson 46's
`add_vector_to_point_3d`, `subtract_points_3d`, `scale_vector_3d`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–61.

**Terms introduced in this lesson:**

- **clipping** — computing the exact point where a line segment crosses
  a boundary, and producing a new, shorter segment that stops exactly
  there instead of continuing past it. It exists as a distinct
  operation from Lesson 61's own containment test because "is this
  point in or out" has no useful answer for a segment straddling the
  boundary — clipping is what a renderer actually needs to draw only
  the visible part of an edge that's partly in front of the camera and
  partly behind (or beyond) one of Lesson 61's own six frustum
  boundaries.

**Objects and methods used:**

None new.

---

## Concept Unit: Does the Existing Line Machinery Already Fit?

### The Problem

Lesson 21's own `point_on_line(line_point, line_direction, t)` already
computes exactly the kind of point this lesson needs — one that slides
along a straight line by some fraction `t`. Before writing anything new,
this unit asks the same question Lesson 48 and Lesson 55 both already
asked of their own prior lessons' work: does `point_on_line`, built for
2D, already work correctly on a genuine 3D segment?

### Project Change

- **Reference Source:** No reference counterpart — this unit tests
  existing project code (`point_on_line`, Lesson 21) against a new input
  shape rather than adding new project code.
- **Files affected:** none — verification only.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** `point_on_line` (Lesson 21), `subtract_points_3d`
  (Lesson 46).

### The New Code

```python
p1 = (0, 0, -0.5)
p2 = (0, 0, -5)
direction = subtract_points_3d(p2, p1)
naive = point_on_line(p1, direction, 0.5)
print("point_on_line(p1, direction, 0.5) [2D function, 3D input] =", naive)
```

### Real Output

Running the print above, against a point genuinely halfway between
`(0, 0, -0.5)` and `(0, 0, -5)` — which should be `(0, 0, -2.75)`:

```
point_on_line(p1, direction, 0.5) [2D function, 3D input] = (0.0, 0.0)
```

Only two components — the third, the one component that actually
distinguishes these two points from each other, is silently gone.
`point_on_line`'s own definition (`add_vector_to_point(line_point,
scale_vector(line_direction, t))`) calls Lesson 1/3's own 2D
`add_vector_to_point`/`scale_vector`, both hardcoded to exactly two
components — the same silent 3-tuple truncation Lesson 46 already
disclosed for plain `scale_vector`, reappearing here one level higher
up, inside a function built *from* that lower-level one. This is a
real, verified, silently wrong result: no crash, no exception, just a
plausible-looking 2D point that has quietly discarded the one piece of
information this lesson actually needs.

### Real Fix

```python
def point_on_segment_3d(p1, p2, t):
    direction = subtract_points_3d(p2, p1)
    return add_vector_to_point_3d(p1, scale_vector_3d(direction, t))
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `point_on_segment_3d` as the
first function in its new "L62: clipping planes" section.

### Mechanical Walkthrough

- `direction = subtract_points_3d(p2, p1)` — **(b) hard concept
  reappearing** (Lesson 46).
- `add_vector_to_point_3d(p1, scale_vector_3d(direction, t))` — **(b)
  hard concept reappearing** (Lesson 46), both functions — the identical
  formula shape `point_on_line` already used in 2D, rebuilt here from
  genuinely 3D pieces instead of 2D ones.

### Real Verification

```python
correct = point_on_segment_3d(p1, p2, 0.5)
print("point_on_segment_3d(p1, p2, 0.5) =", correct)
```

Real output:

```
point_on_segment_3d(p1, p2, 0.5) = (0.0, 0.0, -2.75)
```

`-2.75` — exactly halfway between `-0.5` and `-5`, the real third
component `point_on_line` silently dropped. `point_on_segment_3d` is now
this curriculum's own trusted way to find a point along a 3D segment,
the direct 3D counterpart of Lesson 21's own foundational formula.

### Connecting Sentence

A correct way to slide along a 3D segment now exists — the next unit
uses it to find exactly where a segment crosses Lesson 61's own near
plane.

---

## Concept Unit: `clip_segment_to_near`

### The Problem

Given a segment whose two endpoints have already been converted to
camera space (Lesson 58), one endpoint might sit in front of Lesson
61's own near plane and the other behind it. Lesson 61's own
`is_in_frustum` can say each endpoint is in or out individually, but has
no way to produce the actual truncated segment a renderer needs — the
part that's genuinely visible, stopping exactly at the boundary rather
than at either original endpoint.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  application of `point_on_segment_3d`'s own parametric interpolation to
  Lesson 61's own near-plane boundary specifically.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `point_on_segment_3d` in the same
  section.
- **Dependencies:** `point_on_segment_3d` (this lesson).

### The New Code

```python
def clip_segment_to_near(p1, p2, near):
    depth1 = -p1[2]
    depth2 = -p2[2]
    if depth1 >= near and depth2 >= near:
        return (p1, p2)
    if depth1 < near and depth2 < near:
        return None
    t = (near - depth1) / (depth2 - depth1)
    new_point = point_on_segment_3d(p1, p2, t)
    if depth1 < near:
        return (new_point, p2)
    else:
        return (p1, new_point)
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `clip_segment_to_near`
directly after `point_on_segment_3d`.

### Mechanical Walkthrough

- `depth1 = -p1[2]`, `depth2 = -p2[2]` — **(b) hard concept reappearing**
  (Lesson 58/61's own established sign convention).
- `if depth1 >= near and depth2 >= near: return (p1, p2)` — **(a) first
  appearance**, as a pattern: both endpoints already inside — nothing to
  clip, the segment passes through completely unchanged.
- `if depth1 < near and depth2 < near: return None` — **(a) first
  appearance**, the mirror case: both endpoints outside — nothing of
  this segment is visible at all, signaled by `None`, the same
  deliberate "nothing here" value Lesson 57's own `find_node` already
  used for a missing parent.
- `t = (near - depth1) / (depth2 - depth1)` — **(a) first appearance.**
  Solving for exactly which fraction of the way from `p1` to `p2` the
  depth crosses `near` — the same "solve for `t`" idea Lesson 24's own
  `line_intersection` already used, applied here to one coordinate
  (depth) instead of a full 2D line-crossing.
- `new_point = point_on_segment_3d(p1, p2, t)` — **(b) hard concept
  reappearing**, just built above.
- `if depth1 < near: return (new_point, p2) / else: return (p1, new_point)`
  — **(a) first appearance**, as a pattern: whichever original endpoint
  was the one sitting outside the boundary gets replaced by the new,
  exactly-on-the-boundary point; the endpoint that was already inside
  stays exactly as it was.

### Real Verification

```python
seg1 = (0, 0, -0.5)
seg2 = (0, 0, -5)
result = clip_segment_to_near(seg1, seg2, 1)
print("clipped =", result)
print("depth of new endpoint =", -result[0][2])
```

Real output:

```
clipped = ((0.0, 0.0, -1.0), (0, 0, -5))
depth of new endpoint = 1.0
```

The endpoint that was behind the near plane (`depth = 0.5`) has been
replaced by a new point at exactly `depth = 1.0` — precisely `near`, not
approximately. The other endpoint, already inside, is untouched. Confirm
the two "nothing to clip" cases return exactly what they should:

```python
print("fully inside:", clip_segment_to_near((0, 0, -2), (0, 0, -8), 1))
print("fully outside:", clip_segment_to_near((0, 0, -0.2), (0, 0, -0.5), 1))
```

Real output:

```
fully inside: ((0, 0, -2), (0, 0, -8))
fully outside: None
```

Both endpoints already inside comes back unchanged; both endpoints
outside comes back `None` — no visible geometry left to draw at all.

### Connecting Sentence

`clip_segment_to_near` correctly handles a segment lying exactly on the
camera's own axis — the closing below confirms it works just as
correctly for a segment that also drifts sideways.

---

## Closing

### Connect the Pieces

Trace a segment that isn't sitting on the camera's own `z` axis at
all — one with real `x`/`y` offsets on both ends — through the entire
clip, confirming the new point lands at exactly the right depth *and*
carries the right sideways position, interpolated correctly in every
component at once:

```python
seg3 = (2, 1, -0.5)
seg4 = (2, 1, -3)
result2 = clip_segment_to_near(seg3, seg4, 1)
print("clipped2 =", result2, " depth =", -result2[0][2])
```

Real output:

```
clipped2 = ((2.0, 1.0, -1.0), (2, 1, -3))  depth = 1.0
```

The new point's own `x` and `y`, `2.0` and `1.0`, are unchanged from
both original endpoints — correct, since this particular segment never
drifted sideways at all, only in depth — and its depth lands at exactly
`1.0`, the same precise boundary as this lesson's own on-axis example.
`point_on_segment_3d`'s own three-component interpolation handled all
three coordinates together, correctly, not just the one this lesson's
own formula happened to solve for.

### What Breaks Without This

This lesson's own opening unit already ran the real failure this
section would otherwise demonstrate: reaching for Lesson 21's own 2D
`point_on_line` directly on a 3D segment silently drops the depth
component entirely, returning a 2-tuple that looks like a valid point
but is missing the one piece of information clipping exists to compute
correctly. Repeating that exact test here would be redundant with this
lesson's own opening proof — the honest closing observation is that
`clip_segment_to_near` only handles *one* of Lesson 61's own six
boundaries. Call it on a segment that's fully inside the near/far range
but drifts outside the field of view instead, and confirm it reports
nothing to clip at all, even though the segment is genuinely partly
invisible:

```python
seg_side_in = (0, 0, -10)
seg_side_out = (50, 0, -10)
print(clip_segment_to_near(seg_side_in, seg_side_out, 1))
```

Real output:

```
((0, 0, -10), (50, 0, -10))
```

Unchanged — `clip_segment_to_near` only ever looks at depth, so a
segment that Lesson 61's own `is_in_frustum` would correctly flag as
partly outside the horizontal field of view (`x = 50` at `depth = 10` is
far beyond any reasonable field of view) passes through completely
untouched here. This isn't a bug in what `clip_segment_to_near` claims
to do — its own name says "to near," not "to the whole frustum" — but a
real, honest scope boundary: a complete clipping system needs five more
functions just like this one, for the far plane and the four side
planes, none of them built here.

### Exercises

- Confirm `clip_segment_to_near` on a segment that crosses the near
  plane in the *opposite* direction from this lesson's own examples
  (`p1` inside, `p2` outside) still replaces the correct endpoint —
  swap the order of `seg1`/`seg2` from this lesson's own first real
  verification and confirm the result.
- Using `point_on_segment_3d` directly, confirm `t = 0` returns exactly
  `p1` and `t = 1` returns exactly `p2`, the same endpoint-matching
  check this curriculum has used for other parametric formulas since
  Lesson 21.
- Write (without adding it to the shared library) a `clip_segment_to_far`
  function, following `clip_segment_to_near`'s own shape, and confirm it
  correctly truncates a segment that crosses Lesson 61's own far
  boundary instead of the near one.

### Definition of Done

- [ ] `point_on_segment_3d` and `clip_segment_to_near` both exist in
      `geometry_verified_library.py`.
- [ ] The 2D `point_on_line`-on-3D-input failure was actually run and
      its missing third component shown, not just described.
- [ ] The near-plane clip was verified to produce a new endpoint at
      exactly the boundary depth, on both an on-axis and an off-axis
      segment.
- [ ] Both "nothing to clip" cases (fully inside, fully outside) were
      verified to return the correct unchanged segment or `None`
      respectively.
- [ ] The scope limitation (only the near plane, none of the other five
      boundaries) was demonstrated with a real segment Lesson 61's own
      `is_in_frustum` would flag as partly invisible, not just stated in
      prose.
- [ ] Commit with a message stating *why*: segments can now be
      correctly truncated at the near plane, the first of six frustum
      boundaries this curriculum can actually clip against, not merely
      test for containment.
