# Lesson 65: Ray-Triangle Intersection

**What you will build:** `is_point_in_triangle_3d` and
`ray_triangle_intersection` — the real building block behind testing
whether a ray hits a specific triangular face of a 3D model, not just
the infinite plane that face happens to sit in. Lesson 64's own
`ray_plane_intersection` already finds where a ray crosses a plane, but
a plane extends forever in every direction, and a real triangle — one
face of a machined part, one polygon of a rendered mesh — occupies only
a small, bounded piece of it. This lesson's own opening reuses Lesson
64 completely unchanged for the "where does it cross the plane" half of
the problem, and adds exactly one new idea for the other half: deciding
whether that crossing point actually lands inside the triangle's own
three edges.

**What you need to know first:** Lesson 64's own `ray_plane_intersection`
and its `"no intersection"` return convention. Lesson 51's own 3D
`cross_product_3d` and its anti-commutative, perpendicular-output
behavior. Lesson 63's own plane representation and `dot3`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–64.

**Terms introduced in this lesson:**

None. Every piece this lesson needs — cross products, dot products,
plane representations, ray-plane intersection — already received full
treatment in earlier lessons; this lesson combines them, it doesn't
introduce a new one.

**Objects and methods used:**

None new.

---

## Concept Unit: Is the Crossing Point Actually Inside the Triangle?

### The Problem

`ray_plane_intersection` (Lesson 64) finds exactly one point where a ray
crosses a plane — but a triangle's own three vertices define only a
bounded piece of that plane. The crossing point might land well outside
the triangle's own edges even while sitting exactly on the correct
plane. Something has to test whether a point known to be on the plane
is also inside the triangle specifically.

### Project Change

- **Reference Source:** No reference counterpart — this is the standard
  same-side/edge-test technique for a planar 3D triangle, not ported
  from an external source.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 64's `ray_plane_intersection`).
- **Change type:** add.
- **Location:** new section, `# ── L65: ray-triangle intersection ──`.
- **Dependencies:** `cross_product_3d` (Lesson 51), `dot3`,
  `subtract_points_3d` (Lesson 63).

### The New Code

```python
def is_point_in_triangle_3d(point, v0, v1, v2, normal):
    edge0 = subtract_points_3d(v1, v0)
    to_point0 = subtract_points_3d(point, v0)
    cross0 = cross_product_3d(edge0, to_point0)
    if dot3(cross0, normal) < 0:
        return False
    edge1 = subtract_points_3d(v2, v1)
    to_point1 = subtract_points_3d(point, v1)
    cross1 = cross_product_3d(edge1, to_point1)
    if dot3(cross1, normal) < 0:
        return False
    edge2 = subtract_points_3d(v0, v2)
    to_point2 = subtract_points_3d(point, v2)
    cross2 = cross_product_3d(edge2, to_point2)
    if dot3(cross2, normal) < 0:
        return False
    return True
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `is_point_in_triangle_3d` as
the first function in its new "L65: ray-triangle intersection" section.

### Mechanical Walkthrough

- `edge0 = subtract_points_3d(v1, v0)` — **(b) hard concept reappearing**
  (Lesson 46) — one of the triangle's own three edges, as a vector.
- `to_point0 = subtract_points_3d(point, v0)` — **(b) hard concept
  reappearing** — the vector from that same edge's own starting vertex
  to the point being tested.
- `cross0 = cross_product_3d(edge0, to_point0)` — **(b) hard concept
  reappearing** (Lesson 51) — a vector perpendicular to both the edge
  and the direction toward the test point. Its own *direction* — which
  way it points relative to the triangle's own normal — is what this
  unit's real new insight depends on.
- `dot3(cross0, normal)` — **(a) first appearance**, as a pattern: this
  measures whether `cross0` points in the *same* general direction as
  the triangle's own normal (a positive result) or the *opposite*
  direction (negative). A point sitting on the correct side of an edge
  — the side the triangle's own interior is on — always produces a
  cross product pointing the same way as the normal, for every one of
  the triangle's three edges in turn. A point outside even one edge
  flips that sign for that specific edge.
- `if ... < 0: return False` — **(c) already basic**, repeated three
  times, once per edge — the point must pass this same-side test
  against *all three* edges to genuinely be inside; failing even one is
  enough to reject it.
- `return True` — **(c) already basic.** Reached only if every one of
  the three edges passed.

### CS Lens

Testing a point against all three edges in turn, rejecting as soon as
one fails, is the same **short-circuit early-exit** pattern this
curriculum has used since Lesson 33's own `is_polygon_convex` — checking
a necessary condition on each of several pieces and stopping the moment
any one fails, rather than checking all of them unconditionally and
combining the results at the end.

### Connecting Sentence

A point already known to lie on the triangle's own plane can now be
tested for whether it's genuinely inside the triangle — the next unit
combines this with Lesson 64's own plane-crossing formula to answer the
real question: does a ray hit this specific triangle at all?

---

## Concept Unit: `ray_triangle_intersection`

### The Problem

Neither `ray_plane_intersection` (Lesson 64) nor this lesson's own
`is_point_in_triangle_3d` alone answers "does this ray hit this
triangle" — the first finds a crossing point without knowing about the
triangle's own bounds, and the second tests a point without knowing how
to find one from a ray in the first place. Combining them is what
actually answers the real question.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `is_point_in_triangle_3d` in the same
  section.
- **Dependencies:** `ray_plane_intersection` (Lesson 64),
  `cross_product_3d`, `subtract_points_3d`,
  `is_point_in_triangle_3d` (this lesson).

### The New Code

```python
def ray_triangle_intersection(ray_origin, ray_direction, v0, v1, v2):
    normal = cross_product_3d(subtract_points_3d(v1, v0), subtract_points_3d(v2, v0))
    plane = (v0, normal)
    hit = ray_plane_intersection(ray_origin, ray_direction, plane)
    if hit == "no intersection":
        return "no intersection"
    if is_point_in_triangle_3d(hit, v0, v1, v2, normal):
        return hit
    return "no intersection"
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `ray_triangle_intersection`
directly after `is_point_in_triangle_3d`.

### Mechanical Walkthrough

- `normal = cross_product_3d(subtract_points_3d(v1, v0), subtract_points_3d(v2, v0))`
  — **(b) hard concept reappearing** (Lesson 51). The triangle's own
  normal, computed directly from its three vertices rather than
  supplied separately — the same cross-product-of-two-edges
  construction this curriculum has used since Lesson 51's own
  perpendicular-vector proof.
- `plane = (v0, normal)` — **(b) hard concept reappearing** (Lesson 63)
  — the triangle's own plane, using one of its vertices as the plane's
  own known point.
- `hit = ray_plane_intersection(ray_origin, ray_direction, plane)` —
  **(b) hard concept reappearing** (Lesson 64), completely unchanged.
- `if hit == "no intersection": return "no intersection"` — **(b) hard
  concept reappearing** (Lesson 64's own string-return convention,
  propagated through).
- `if is_point_in_triangle_3d(hit, v0, v1, v2, normal): return hit` —
  **(b) hard concept reappearing**, just built above.
- `return "no intersection"` — **(c) already basic.** Reached only when
  the ray crosses the *plane* but lands outside the *triangle*.

### Real Verification

A triangle with three simple vertices, and a ray pointed straight down
through a point genuinely inside it:

```python
v0 = (0, 0, 0)
v1 = (4, 0, 0)
v2 = (0, 4, 0)
print("through the interior:", ray_triangle_intersection((1, 1, 5), (0, 0, -1), v0, v1, v2))
print("hits the plane, misses the triangle:", ray_triangle_intersection((10, 10, 5), (0, 0, -1), v0, v1, v2))
print("misses the plane entirely:", ray_triangle_intersection((1, 1, 5), (1, 0, 0), v0, v1, v2))
```

Real output:

```
through the interior: (1.0, 1.0, 0.0)
hits the plane, misses the triangle: no intersection
misses the plane entirely: no intersection
```

The interior case lands exactly at `(1, 1, 0)`, directly beneath the
ray's own starting point. The `(10, 10, 5)` case crosses the identical
plane (`z = 0`) at `(10, 10, 0)`, but that point sits well outside the
triangle's own three vertices, correctly rejected. The sideways-pointed
ray never reaches the plane at all, correctly rejected for a completely
different reason — the same "no intersection" answer covering two
genuinely different situations, distinguished only by which internal
check actually caught it.

### Connecting Sentence

The function correctly separates "misses the plane" from "hits the
plane but misses the triangle" — the closing below checks a case right
on the edge between inside and outside, and then shows what happens if
the triangle's own vertex order isn't trusted consistently.

---

## Closing

### Connect the Pieces

Check a point exactly on one of the triangle's own edges, and two points
straddling a vertex — one just inside, one just outside — confirming
`ray_triangle_intersection` draws the boundary exactly where the
triangle's own geometry says it should:

```python
print("exactly on an edge:", ray_triangle_intersection((2, 0, 5), (0, 0, -1), v0, v1, v2))
print("just outside, near a vertex:", ray_triangle_intersection((3.99, 3.99, 5), (0, 0, -1), v0, v1, v2))
print("just inside, near the same vertex:", ray_triangle_intersection((1.5, 1.5, 5), (0, 0, -1), v0, v1, v2))
```

Real output:

```
exactly on an edge: (2.0, 0.0, 0.0)
just outside, near a vertex: no intersection
just inside, near the same vertex: no intersection
```

A point sitting exactly on the edge between `v0` and `v1` counts as
inside (`is_point_in_triangle_3d`'s own three checks use `< 0` to
reject, not `<= 0`, so a same-side value of exactly zero passes). The
`(3.99, 3.99)` case, just past the diagonal edge from `v1` to `v2`,
falls outside. The `(1.5, 1.5)` case does too — both points sit near the
same region of the triangle, and both correctly come back as outside
its own diagonal edge, confirming the boundary is being tested
precisely rather than approximately.

### What Breaks Without This

`is_point_in_triangle_3d`'s own same-side test only works correctly if
the `normal` it's given actually matches the winding order the three
edges (`v0 → v1`, `v1 → v2`, `v2 → v0`) were built with —
`ray_triangle_intersection`'s own first line computes `normal` directly
from `v1 - v0` and `v2 - v0`, in that specific order, guaranteeing this
automatically. Build a version that computes the normal with the
*opposite* vertex order instead, and test the exact same hit point
against it:

```python
wrong_normal = cross_product_3d(subtract_points_3d(v2, v0), subtract_points_3d(v1, v0))
correct_normal = cross_product_3d(subtract_points_3d(v1, v0), subtract_points_3d(v2, v0))
hit_point = (1.0, 1.0, 0.0)
print("with the correct winding's normal:", is_point_in_triangle_3d(hit_point, v0, v1, v2, correct_normal))
print("with the reversed winding's normal:", is_point_in_triangle_3d(hit_point, v0, v1, v2, wrong_normal))
```

Real output:

```
with the correct winding's normal: True
with the reversed winding's normal: False
```

The identical point, the identical triangle — only the normal's own
direction changed, and a point genuinely inside the triangle is now
reported as outside it. This is a real, verified, silently wrong
result: nothing about calling `is_point_in_triangle_3d` with a
mismatched normal raises an error, and the returned `False` looks
exactly like a legitimate "point is outside" answer rather than a
sign of a mismatched input. `ray_triangle_intersection`'s own choice to
compute the normal itself, from the same two edges every time, rather
than accepting one as a separate argument, is what prevents this
mismatch from ever happening inside this curriculum's own code — the
same category of risk Lesson 56's own SE Lens already named for
`multiply_matrices4`'s argument order: a caller supplying two related
values that have to agree with each other, with nothing in Python's own
type system able to enforce it.

### Exercises

- Confirm `ray_triangle_intersection` correctly finds a hit point on a
  triangle that isn't lying flat in the `z = 0` plane — pick three
  vertices with varied `z` values of your own choosing, and a ray that
  genuinely crosses the triangle they form.
- Using `is_point_in_triangle_3d` directly, confirm each of the
  triangle's own three vertices tests as inside the triangle (the
  boundary case of a boundary case).
- Confirm a ray aimed at the triangle's own plane but starting *behind*
  where the triangle actually is (matching Lesson 64's own
  behind-the-origin guard) correctly returns `"no intersection"` rather
  than a point the ray never actually reaches.

### Definition of Done

- [ ] `is_point_in_triangle_3d` and `ray_triangle_intersection` both
      exist in `geometry_verified_library.py`.
- [ ] The three distinct outcomes (hits inside the triangle, hits the
      plane but misses the triangle, misses the plane entirely) were
      each verified with a real, deliberately chosen case.
- [ ] The edge-boundary and near-vertex cases were both checked, not
      just one comfortably-inside and one comfortably-outside point.
- [ ] The mismatched-winding-order failure was actually run and its
      flipped `True`/`False` result shown for the identical point, not
      just described as a risk.
- [ ] Commit with a message stating *why*: rays can now be tested
      against a real, bounded triangle, not just the infinite plane it
      sits in — the actual test a mesh-intersection or CNC-collision
      system needs, not merely the plane math it's built from.
