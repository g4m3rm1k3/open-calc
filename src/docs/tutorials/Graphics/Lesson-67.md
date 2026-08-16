# Lesson 67: Box Geometry

**What you will build:** `is_point_in_box`, `slab_narrow`, and
`ray_box_intersection` — the last of this section's basic 3D primitive
shapes, an axis-aligned box, tested against a point and against a ray
using the **slab method**, a real, named technique distinct from every
intersection formula this curriculum has built so far. The transferable
problem: Lesson 64 and 66's own ray-plane and ray-sphere formulas each
solve one clean algebraic equation for a single `t`. A box has six
flat faces, not one smooth surface — there's no single equation to
solve. The slab method sidesteps that by treating each axis
independently, narrowing a valid *range* of `t` three separate times,
and checking whether anything is left in that range at the end.

**What you need to know first:** Lesson 63's `point_on_line_3d`. Lesson
54's `max`/`min`. Lesson 22's own ray convention (`t ≥ 0` counts as on
the ray).

**Assumed background (outside this curriculum):** unchanged from Lessons
1–66.

**Terms introduced in this lesson:**

- **slab method** — testing whether a ray crosses an axis-aligned box by
  checking each of the three axes separately: on a given axis, the ray
  is only inside the box's own bounds for some range of `t` (a
  **slab**), and the ray only actually crosses the *box* during
  whichever range of `t` is inside *all three* slabs at once. It exists
  because a box, unlike a plane or a sphere, has no single equation
  describing its whole boundary — narrowing three independent ranges
  down to their shared overlap is what stands in for solving one
  equation directly.

**Objects and methods used:**

None new.

---

## Concept Unit: `is_point_in_box`

### The Problem

The simplest possible question about a box — is a given point inside
it — needs nothing more than checking each of the point's own three
coordinates against the box's own bounds on that same axis.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 66's `sphere_line_intersection`).
- **Change type:** add.
- **Location:** new section, `# ── L67: box geometry (slab method) ──`.
- **Dependencies:** none beyond plain comparisons.

### The New Code

```python
def is_point_in_box(point, box):
    min_c, max_c = box
    if point[0] < min_c[0] or point[0] > max_c[0]:
        return False
    if point[1] < min_c[1] or point[1] > max_c[1]:
        return False
    if point[2] < min_c[2] or point[2] > max_c[2]:
        return False
    return True
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `is_point_in_box` as the
first function in its new "L67: box geometry" section. A **box** is
represented here as `(min_corner, max_corner)`, two plain 3-tuples — the
smallest and largest coordinate on each axis a point inside the box can
have.

### Mechanical Walkthrough

- `min_c, max_c = box` — **(b) hard concept reappearing** (Lesson 46's
  own tuple-unpacking pattern).
- `if point[0] < min_c[0] or point[0] > max_c[0]: return False` (and the
  two lines beneath it) — **(a) first appearance**, as a pattern: one
  independent range check per axis, unrolled by hand rather than looped
  — the same small-fixed-count style choice this curriculum has used
  since Lesson 14 for genuinely fixed counts like three coordinates.
  Failing even one axis's own range is enough to place the point
  outside the box entirely.

### Real Verification

```python
box = ((0, 0, 0), (10, 10, 10))
print(is_point_in_box((5, 5, 5), box))
print(is_point_in_box((15, 5, 5), box))
print(is_point_in_box((0, 0, 0), box))
```

Real output:

```
True
False
True
```

A point comfortably inside all three axes' own ranges passes; a point
past the box's own `x = 10` boundary fails; a point sitting exactly on
the box's own minimum corner passes — the boundary itself counts as
inside, matching this function's own `<`/`>` (not `<=`/`>=`) rejection
logic.

### Connecting Sentence

Testing a single point is straightforward — testing whether a moving
ray ever enters the box at all needs the slab method this lesson's own
Header already named.

---

## Concept Unit: The Slab Method — `ray_box_intersection`

### The Problem

A ray crosses a box's own bounds on one axis during some range of `t` —
before that range, the ray hasn't reached the box's own near face on
that axis yet; after it, the ray has passed the box's own far face on
that axis. The ray only genuinely intersects the *box* during whichever
`t` values fall inside all three axes' own ranges simultaneously — the
overlap of three independent slabs.

### Project Change

- **Reference Source:** No reference counterpart — the slab method is a
  standard, named computer-graphics technique, not ported from a
  specific external source.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `is_point_in_box` in the same section.
- **Dependencies:** `max`, `min` (Lesson 54), `point_on_line_3d`
  (Lesson 63).

### The New Code

```python
def slab_narrow(origin_c, direction_c, min_c, max_c, t_near, t_far):
    if direction_c == 0:
        if origin_c < min_c or origin_c > max_c:
            return None
        return (t_near, t_far)
    t1 = (min_c - origin_c) / direction_c
    t2 = (max_c - origin_c) / direction_c
    if t1 > t2:
        t1, t2 = t2, t1
    new_near = max(t_near, t1)
    new_far = min(t_far, t2)
    if new_near > new_far:
        return None
    return (new_near, new_far)


def ray_box_intersection(ray_origin, ray_direction, box):
    min_c, max_c = box
    t_near = -1000000.0
    t_far = 1000000.0

    result_x = slab_narrow(ray_origin[0], ray_direction[0], min_c[0], max_c[0], t_near, t_far)
    if result_x is None:
        return "no intersection"
    t_near, t_far = result_x

    result_y = slab_narrow(ray_origin[1], ray_direction[1], min_c[1], max_c[1], t_near, t_far)
    if result_y is None:
        return "no intersection"
    t_near, t_far = result_y

    result_z = slab_narrow(ray_origin[2], ray_direction[2], min_c[2], max_c[2], t_near, t_far)
    if result_z is None:
        return "no intersection"
    t_near, t_far = result_z

    if t_far < 0:
        return "no intersection"
    t = t_near if t_near >= 0 else t_far
    return point_on_line_3d(ray_origin, ray_direction, t)
```

### The Updated Project

Both brand-new, freestanding functions, per the schema's own stated
exception. `geometry_verified_library.py`'s "L67: box geometry" section
now carries `is_point_in_box`, `slab_narrow`, and `ray_box_intersection`
in sequence.

### Mechanical Walkthrough

- `if direction_c == 0:` — **(a) first appearance.** A ray with no
  movement at all along one axis never enters or leaves that axis's own
  slab — it's either already inside it for every `t`, or outside it for
  every `t`, with no crossing to solve for.
- `if origin_c < min_c or origin_c > max_c: return None` — **(b) hard
  concept reappearing** (this lesson's own `is_point_in_box` range
  check, applied to one axis) — if the ray's own fixed position on this
  axis is already outside the slab, no `t` will ever bring it back in;
  `None` signals "the whole box is unreachable," the same deliberate
  "nothing here" value Lesson 57 and 62 have both already used.
- `return (t_near, t_far)` (the zero-direction case) — **(c) already
  basic.** The incoming range passes through completely unnarrowed —
  this axis imposed no real constraint.
- `t1 = (min_c - origin_c) / direction_c`, `t2 = (max_c - origin_c) / direction_c`
  — **(a) first appearance**, as a pattern: solving Lesson 63's own
  parametric line formula for exactly the two `t` values where this one
  axis crosses the box's own near and far bound.
- `if t1 > t2: t1, t2 = t2, t1` — **(a) first appearance.** A ray
  pointing in the *negative* direction along this axis reaches the
  box's own far bound before its near bound — swapping keeps `t1` as
  the smaller, entering value and `t2` as the larger, exiting one,
  regardless of which way the ray points.
- `new_near = max(t_near, t1)` — **(b) hard concept reappearing** (Lesson
  54). The running "entering" bound only ever gets *later* as more axes
  narrow it — the ray isn't truly inside the box until it has entered
  every one of the three slabs.
- `new_far = min(t_far, t2)` — **(b) hard concept reappearing**, the
  mirror case: the running "exiting" bound only ever gets *earlier*.
- `if new_near > new_far: return None` — **(a) first appearance.** Once
  the "must have entered by" bound passes the "must exit by" bound,
  there's no `t` left where the ray is inside all the slabs checked so
  far — no possible intersection remains, regardless of what the
  as-yet-unchecked axes would say.
- `ray_box_intersection`'s own repeated `if result_? is None: return "no
  intersection"` / unpack pattern, once per axis — **(b) hard concept
  reappearing**, `slab_narrow` itself just explained, called three
  times per Lesson 14's own small-fixed-count unrolling style.
- `if t_far < 0: return "no intersection"` — **(a) first appearance.**
  If even the *latest* possible exit point is still behind the ray's
  own origin, the box lies entirely behind the ray — Lesson 22's own
  ray convention (`t ≥ 0`) rules it out.
- `t = t_near if t_near >= 0 else t_far` — **(a) first appearance.** If
  `t_near` is negative, the ray's own origin already sits *inside* the
  box (there was no real "entering" moment ahead of it) — in that case,
  `t_far`, the exit point, is the first genuinely meaningful crossing
  the ray actually reaches.

### Real Verification

```python
box = ((0, 0, 0), (10, 10, 10))
print("straight hit:", ray_box_intersection((5, 5, -10), (0, 0, 1), box))
print("misses entirely:", ray_box_intersection((50, 50, -10), (0, 0, 1), box))
print("box behind the ray:", ray_box_intersection((5, 5, 20), (0, 0, 1), box))
print("diagonal ray:", ray_box_intersection((-5, -5, -5), (1, 1, 1), box))
```

Real output:

```
straight hit: (5.0, 5.0, 0.0)
misses entirely: no intersection
box behind the ray: no intersection
diagonal ray: (0.0, 0.0, 0.0)
```

A ray pointed straight up from below the box correctly hits its own
bottom face at `(5, 5, 0)`. A ray well outside the box's own `x`/`y`
footprint correctly misses. A ray pointing away from a box positioned
behind it correctly reports no intersection, per Lesson 22's own ray
convention. A diagonal ray approaching from `(-5, -5, -5)` toward the
origin correctly lands exactly on the box's own corner, `(0, 0, 0)` —
the one point where all three slabs' own entering bounds coincide
exactly.

### Connecting Sentence

Every case so far has the ray starting outside the box — the closing
below checks the one remaining case, a ray that starts already inside
it.

---

## Closing

### Connect the Pieces

A ray starting from a point already inside the box has no real
"entering" moment ahead of it — trace what `ray_box_intersection`'s own
final `t_near if t_near >= 0 else t_far` line does in that exact case:

```python
print("ray starting inside the box:", ray_box_intersection((5, 5, 5), (0, 0, 1), box))
```

Real output:

```
ray starting inside the box: (5.0, 5.0, 10.0)
```

`(5, 5, 10)` — not the ray's own starting point, and not the box's own
near face either, but its **exit** point on the far side. This is
exactly what the walkthrough's own last line predicted: `t_near` for
this ray comes out negative (the box's own "entering" boundary is
technically behind where the ray already starts), so the function
correctly falls back to `t_far`, the point where the ray actually
leaves the box — the first real crossing this ray has ahead of it at
all.

### What Breaks Without This

`slab_narrow`'s own very first check — `if direction_c == 0` — exists
specifically to protect the division two lines later. Build a version
that skips it, and run it on the most ordinary possible case: a ray
pointing straight up, the exact same case this lesson's own Real
Verification already confirmed works correctly with the guard in place.

```python
def slab_narrow_no_guard(origin_c, direction_c, min_c, max_c, t_near, t_far):
    t1 = (min_c - origin_c) / direction_c
    t2 = (max_c - origin_c) / direction_c
    if t1 > t2:
        t1, t2 = t2, t1
    new_near = max(t_near, t1)
    new_far = min(t_far, t2)
    if new_near > new_far:
        return None
    return (new_near, new_far)

try:
    bad = slab_narrow_no_guard(5, 0, 0, 10, -1000000.0, 1000000.0)
    print("no crash:", bad)
except ZeroDivisionError as e:
    print("ZeroDivisionError:", e)
```

Real output:

```
ZeroDivisionError: division by zero
```

An axis-aligned ray — the single most common, ordinary case a real
system would actually test, not an unusual edge case — has a direction
component of exactly `0` on at least one of its three axes by
definition. Without the zero-direction guard, `ray_box_intersection`
would crash immediately on almost every straight-up, straight-across,
or straight-along ray a caller might reasonably send it — this isn't a
rare corner case worth a passing disclaimer; it's the ordinary case the
guard exists to make ordinary.

### Exercises

- Confirm `ray_box_intersection` correctly reports no intersection for
  an axis-aligned ray that runs parallel to one of the box's own faces
  but sits outside that axis's own slab — pick your own ray and box.
- Confirm the diagonal-ray corner case from this lesson's own Real
  Verification still lands exactly on `(0, 0, 0)` if the ray's own
  starting point is moved further away along the same `(1, 1, 1)`
  direction — the crossing point shouldn't change, only how long it
  takes to reach it.
- Using `is_point_in_box`, confirm the exit point this lesson's own
  closing found (`(5, 5, 10)`) sits exactly on the box's own boundary —
  true, but only because `is_point_in_box`'s own `<`/`>` comparisons
  treat the boundary as inside; explain why a stricter `<=`/`>=`-based
  version would disagree.

### Definition of Done

- [ ] `is_point_in_box`, `slab_narrow`, and `ray_box_intersection` all
      exist in `geometry_verified_library.py`.
- [ ] A straight (axis-aligned), a diagonal, a missing, and a
      behind-the-ray case were all verified with real, distinct
      results.
- [ ] The ray-starts-inside case was verified to return the exit point,
      not the entry point or the origin itself, with the reasoning
      traced back to the function's own final line.
- [ ] The zero-direction-guard failure was actually triggered on the
      single most ordinary case (a straight ray), not a contrived
      one, and its real `ZeroDivisionError` shown.
- [ ] Commit with a message stating *why*: boxes now have both a
      point-containment test and a real ray intersection, using the
      slab method — a genuinely different technique from the single-
      equation formulas Lessons 64 and 66 each used, because a box has
      no single equation describing its own boundary.
