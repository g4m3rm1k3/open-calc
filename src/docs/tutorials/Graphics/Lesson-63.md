# Lesson 63: 3D Lines and Planes

**What you will build:** `point_on_line_3d` (the direct 3D counterpart
of Lesson 21's own point/direction line formula) and `is_point_on_plane`/
`signed_distance_to_plane` — this curriculum's first genuine
representation of a **plane**, a point together with a **normal
vector**. The transferable problem: Lesson 62's own `clip_segment_to_near`
worked entirely from a plain depth comparison, with no real notion of
"a plane" behind it at all — a deliberate scope limit, flagged
explicitly at the time so this lesson could build the real thing
without duplicating work. This lesson's own closing proves those two
things were secretly the same all along: Lesson 61 and Lesson 62's own
ad-hoc near-plane boundary is exactly reproducible as one instance of
this lesson's own general plane representation, with the boundary
landing at precisely zero.

**What you need to know first:** Lesson 21's own `point_on_line` and its
parametric formula. Lesson 46's `add_vector_to_point_3d`,
`scale_vector_3d`, `subtract_points_3d`. Lesson 51's `dot3`/`norm_3d`
(reused here as the 3D dot product and vector length). Lesson 62's own
`clip_segment_to_near` and its explicitly disclosed scope limit — this
lesson's own closing resolves exactly the connection that lesson left
open.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–62.

**Terms introduced in this lesson:**

- **plane** — a flat, infinite 2D surface embedded in 3D space,
  represented here as `(point_on_plane, normal)`: one point known to
  lie on the surface, and one vector perpendicular to every direction
  that lies within it. It exists as its own representation, distinct
  from a line, because a line needs only one direction to describe (any
  point on it is `line_point + t · direction`), while a plane is
  two-dimensional — describing it by two spanning directions instead of
  one perpendicular normal would work too, but the single perpendicular
  vector is both simpler to store and, as this lesson's own next term
  shows, directly usable in a dot product.
- **normal vector** — a vector perpendicular to a surface at a given
  point. For a plane specifically, a single normal is perpendicular to
  the *entire* surface, not just one point on it, because a plane is
  flat — every direction lying within it makes a right angle with that
  one vector. It exists as a term here because it's the one piece of
  information a plane's own point alone can't supply: infinitely many
  different planes pass through any single point, and the normal is
  what picks out exactly one of them.

**Objects and methods used:**

None new.

---

## Concept Unit: Formalizing the 3D Line — `point_on_line_3d`

### The Problem

Lesson 62's own `point_on_segment_3d` already computes a point along a
3D line, but it takes two *points* as arguments (`p1`, `p2`), the same
shape a bounded segment needs. Lesson 21's own original 2D formula took
a *point and a direction* instead — the natural shape for an infinite
line, where `t` isn't restricted to `[0, 1]` the way a segment's own
parameter is. This lesson's own title promises "3D lines" formally, not
just 3D segments — the direct, point-and-direction counterpart of
Lesson 21's own formula is still missing.

### Project Change

- **Reference Source:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`, Lesson
  21's own `point_on_line` — this is that exact formula, rebuilt from
  Lesson 46's 3D pieces the same way Lesson 62's own
  `point_on_segment_3d` already was, per the Repetition Rule.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 62's `clip_segment_to_near`).
- **Change type:** add.
- **Location:** new section, `# ── L63: 3D lines and planes ──`.
- **Dependencies:** `add_vector_to_point_3d`, `scale_vector_3d` (Lesson
  46).

### The New Code

```python
def point_on_line_3d(line_point, line_direction, t):
    return add_vector_to_point_3d(line_point, scale_vector_3d(line_direction, t))
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `point_on_line_3d` as the
first function in its new "L63: 3D lines and planes" section.

### Mechanical Walkthrough

- `add_vector_to_point_3d(line_point, scale_vector_3d(line_direction, t))`
  — **(b) hard concept reappearing**, both functions given full
  treatment in Lesson 46 — the identical formula Lesson 21's own
  `point_on_line` already used, unchanged in shape.

### Real Verification

Confirm `point_on_line_3d` agrees with Lesson 62's own already-verified
`point_on_segment_3d` on the same line, expressed the other way — a
point and a direction instead of two endpoints:

```python
lp = (1, 1, 1)
ld = (2, 0, 0)
print(point_on_line_3d(lp, ld, 0.5))
print(point_on_segment_3d(lp, (3, 1, 1), 0.5))
```

Real output:

```
(2.0, 1.0, 1.0)
(2.0, 1.0, 1.0)
```

Identical — `lp` plus half of direction `(2, 0, 0)` lands at exactly the
same point as halfway between `(1, 1, 1)` and `(3, 1, 1)`, confirming
the point-and-direction form and the two-point form describe the same
line, just parametrized differently.

### Connecting Sentence

An infinite 3D line now has its own proper, point-and-direction form —
the next unit builds this lesson's own real subject, a plane.

---

## Concept Unit: A Plane — a Point and a Normal Vector

### The Problem

Nothing in this curriculum so far has a real representation of a plane.
Lesson 62's own near-plane boundary check worked entirely from a bare
depth comparison, with no actual plane object behind it — good enough
for that one specific, axis-aligned case, but not a general way to
describe an arbitrarily oriented flat surface (a machined part's own
angled face; a fixture's own mounting surface).

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  representation, following this curriculum's own established "plain
  tuples, no dedicated type" house style.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `point_on_line_3d` in the same section.
- **Dependencies:** `dot3` (Lesson 14/51), `subtract_points_3d` (Lesson
  46), `nearly_equal` (Lesson 17).

### The New Code

```python
def is_point_on_plane(point, plane, tolerance):
    point_on_plane, normal = plane
    offset = subtract_points_3d(point, point_on_plane)
    return nearly_equal(dot3(normal, offset), 0, tolerance)
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `is_point_on_plane` directly
after `point_on_line_3d`.

### Mechanical Walkthrough

- `point_on_plane, normal = plane` — **(b) hard concept reappearing**
  (Lesson 46's own tuple-unpacking pattern) — a **plane**, this lesson's
  own Header term, is a plain 2-tuple.
- `offset = subtract_points_3d(point, point_on_plane)` — **(b) hard
  concept reappearing** (Lesson 46) — the vector from the plane's own
  known point to the point being tested.
- `dot3(normal, offset)` — **(a) first appearance**, as a pattern: this
  is the actual mathematical test for "is `offset` perpendicular to
  `normal`" — Lesson 7's own dot product, already established as
  exactly zero when two vectors are perpendicular. If `point` genuinely
  lies on the plane, `offset` lies entirely *within* the plane, and
  every direction within the plane is perpendicular to its own
  **normal vector** by definition — the dot product of the two must be
  zero.
- `nearly_equal(..., 0, tolerance)` — **(b) hard concept reappearing**
  (Lesson 17) — the same tolerant-comparison pattern every floating-
  point test in this curriculum has used since Lesson 17.

### Real Verification

Test a real, concrete plane — the table's own flat surface, sitting at
`z = 0`, with its normal pointing straight up:

```python
table_plane = ((0, 0, 0), (0, 0, 1))
print(is_point_on_plane((3, 4, 0), table_plane, 1e-9))
print(is_point_on_plane((3, 4, 5), table_plane, 1e-9))
```

Real output:

```
True
False
```

`(3, 4, 0)` — sitting exactly on the table's own surface — correctly
tests as on the plane. `(3, 4, 5)` — five units above it — correctly
does not.

### CS Lens

Representing a plane as a point plus a single perpendicular vector,
rather than by two directions that span it, is the same **minimal
sufficient representation** idea this curriculum has favored since
Lesson 6's own basis vectors:

```
Also recognized in: a circle stored as center-plus-radius rather than
three points on its own circumference (Lesson 30), a rotation stored
as one axis and one angle rather than a full 3x3 matrix (Lesson 51),
any data structure that stores the minimum information needed to
answer its own real questions rather than a more redundant, easier-
to-misuse shape
```

### Connecting Sentence

Testing whether a point sits exactly *on* a plane is useful, but most
real questions need more — *how far* off the plane a point sits, and on
*which* side.

---

## Concept Unit: How Far, and Which Side — `signed_distance_to_plane`

### The Problem

`is_point_on_plane` only ever answers yes or no. A real system needs
more: how far above or below the table's own surface does a point sit,
and is that "above" or "below" — exactly the kind of signed answer
Lesson 18–19's own `classify_turn` already gave for a 2D line, now
needed for a 3D plane instead.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `is_point_on_plane` in the same section.
- **Dependencies:** `norm_3d` (Lesson 51).

### The New Code

```python
def signed_distance_to_plane(point, plane):
    point_on_plane, normal = plane
    offset = subtract_points_3d(point, point_on_plane)
    return dot3(normal, offset) / norm_3d(normal)
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `signed_distance_to_plane`
directly after `is_point_on_plane`.

### Mechanical Walkthrough

- `dot3(normal, offset)` — **(b) hard concept reappearing**, just built
  above.
- `/ norm_3d(normal)` — **(a) first appearance**, as a pattern: dividing
  by the normal's own length converts a raw dot product (which scales
  with however long `normal` happens to be) into an actual distance,
  independent of that length — the same normalizing role a division by
  length already played in Lesson 28's own `distance_to_line`.

### Real Verification

```python
print(signed_distance_to_plane((3, 4, 5), table_plane))
print(signed_distance_to_plane((3, 4, -2), table_plane))
```

Real output:

```
5.0
-2.0
```

A point `5` units above the table returns exactly `5.0`; a point `2`
units below returns `-2.0` — the sign directly encoding which side of
the plane the point sits on, with the normal's own direction (straight
up) defining which side counts as positive.

### Connecting Sentence

A real plane representation, with both a membership test and a signed
distance, now exists — the closing below proves it wasn't needed from
scratch at all: Lesson 61 and 62's own near-plane boundary was already
one specific instance of exactly this idea.

---

## Closing

### Connect the Pieces

Express Lesson 61 and Lesson 62's own near-plane boundary — depth
exactly equal to `near`, in camera space — as a real plane, using this
lesson's own representation, and confirm `signed_distance_to_plane`
lands at exactly zero for a point sitting precisely on that boundary,
the identical boundary Lesson 62's own `clip_segment_to_near` already
computed a different way:

```python
near = 1
near_plane = ((0, 0, -near), (0, 0, 1))
p_at_near = (5, 5, -near)
p_closer = (5, 5, -0.5)
p_farther = (5, 5, -5)
print("at exactly near:", signed_distance_to_plane(p_at_near, near_plane))
print("closer than near (depth 0.5):", signed_distance_to_plane(p_closer, near_plane))
print("farther than near (depth 5):", signed_distance_to_plane(p_farther, near_plane))
```

Real output:

```
at exactly near: 0.0
closer than near (depth 0.5): 0.5
farther than near (depth 5): -4.0
```

Exactly `0.0` at the boundary — not approximately, precisely. A point
closer than `near` (too close, the same case Lesson 61's own
`is_in_frustum` rejects) gives a *positive* signed distance; a point
farther than `near` (correctly inside) gives *negative*. This is a real,
verified connection, not a coincidence of these particular numbers:
`signed_distance_to_plane((x, y, z), near_plane)` always equals
`z - (-near)`, which is exactly `near - depth` — the identical
quantity Lesson 62's own `clip_segment_to_near` computed by hand
(`near - depth1`) as the numerator of its own interpolation fraction
`t`. Lesson 61 and 62's own ad-hoc depth check was never a separate
idea from this lesson's own general plane test; it was always this one,
specialized to a plane that happens to be perpendicular to the camera's
own `z` axis.

### What Breaks Without This

Both of this lesson's own functions trust that `point_on_plane`,
supplied as part of the plane, genuinely lies on the intended surface.
Nothing checks it. Build a plane that claims to be the table's own
surface but supplies the wrong anchor point — `(0, 0, 5)` instead of
`(0, 0, 0)` — keeping the same, correct normal:

```python
wrong_plane = ((0, 0, 5), (0, 0, 1))
print(is_point_on_plane((3, 4, 0), wrong_plane, 1e-9))
print(signed_distance_to_plane((3, 4, 0), wrong_plane))
print(signed_distance_to_plane((3, 4, 0), table_plane))
```

Real output:

```
False
-5.0
0.0
```

`(3, 4, 0)` genuinely sits on the real table surface — `table_plane`
correctly reports a signed distance of exactly `0.0` for it. Against
`wrong_plane`, the identical point is reported as *not* on the plane at
all, off by exactly `-5.0` — precisely the gap between the wrong anchor
point (`z = 5`) and the true surface (`z = 0`). This is a real, verified,
silently wrong result: neither function raises an error when handed an
anchor point that doesn't actually sit on the intended surface, and
every distance computed against that plane afterward is shifted by the
identical, consistent, wrong amount. A caller who picks a convenient
nearby point instead of verifying it's genuinely on the plane gets
answers that look completely plausible — real numbers, sensible signs —
and are systematically wrong by exactly the anchor point's own error.

### Exercises

- Confirm `point_on_line_3d` and Lesson 62's `point_on_segment_3d` agree
  at `t = 0` and `t = 1`, not just `t = 0.5` as this lesson's own
  opening unit checked.
- Build a plane that isn't axis-aligned (a normal like `(1, 1, 1)`
  instead of `(0, 0, 1)`) and confirm `is_point_on_plane` correctly
  identifies at least one point that genuinely lies on it — find that
  point using the plane's own normal-perpendicularity requirement,
  not by guessing.
- Confirm `signed_distance_to_plane` gives the *same* answer regardless
  of whether `normal` is a unit vector or scaled to some other length —
  pick a plane, compute a distance, then recompute it with the normal
  doubled, and confirm the result is unchanged.

### Definition of Done

- [ ] `point_on_line_3d`, `is_point_on_plane`, and
      `signed_distance_to_plane` all exist in
      `geometry_verified_library.py`.
- [ ] `point_on_line_3d` was verified to agree with Lesson 62's own
      `point_on_segment_3d` on the same line.
- [ ] `is_point_on_plane` and `signed_distance_to_plane` were both
      verified on a real, concrete plane with points on both sides and
      exactly on it.
- [ ] Lesson 61/62's own near-plane boundary was re-expressed as a real
      plane using this lesson's own representation and confirmed to
      land at exactly zero at the boundary, not merely a plausible-
      looking small number.
- [ ] The wrong-anchor-point failure was actually run and its
      consistent, exact offset (`-5.0`, matching the anchor error
      precisely) shown, not just described as a risk.
- [ ] Commit with a message stating *why*: this curriculum now has a
      real, general 3D plane representation, and Lesson 61/62's own
      earlier, ad-hoc frustum-boundary math is confirmed to be one
      specific case of it, not a separate idea that happened to work.
