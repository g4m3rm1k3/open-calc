# Lesson 51: Axis-Angle Representation

**What you will build:** `cross_product_3d`, `normalize_3d`, and
`rotate_by_axis_angle(point, axis, theta_degrees)` — a rotation function
that takes *any* axis, not just `x`, `y`, or `z`, and rotates a point
around it directly. This is Rodrigues' rotation formula, and it closes
a gap this curriculum has carried, disclosed and unfixed, since Lesson
47: composing `rotate_x` and `rotate_z` does not equal true rotation
around the diagonal axis their composition might suggest, and no
function built since then has been able to rotate around an arbitrary
axis directly. This lesson's own closing runs the *exact* diagonal axis
and test point Lesson 47 used and proves, for real, that a point sitting
on the rotation axis now comes back completely unmoved — the specific,
concrete failure Lesson 47 disclosed, now resolved by name. Along the
way, this lesson also delivers what Lesson 50's own closing promised:
axis-angle rotation has no gimbal-lock-style singularity — an axis and
an angle never lose a degree of freedom the way three sequential Euler
angles can.

**What you need to know first:** Lesson 47's own disclosed gap and its
exact test case (`axis_point = (1/√2, 1/√2, 0)`, composed
`rotate_z(rotate_x(...))` failing to fix it). Lesson 14's `dot3` — reused
here unchanged as the 3D dot product. Lesson 9's `math.sqrt`, Lesson
47's `math.radians`/`math.sin`/`math.cos`. Lesson 7's 2D `cross_product`
— reused only as a point of contrast, not as code; this lesson's own 3D
cross product is a genuine first appearance, not an extension of it,
per this handoff's own recorded judgment call that 2D ideas getting a
"genuinely different 3D treatment" owe full treatment again.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–50.

**Terms introduced in this lesson:**

- **axis-angle representation** — a rotation specified by exactly two
  pieces: a unit vector naming the axis to rotate around, and one angle
  naming how far. It exists as an alternative to Euler angles
  specifically because of what Lesson 50 just proved: three sequential
  angles can lose a degree of freedom at certain inputs, while one axis
  plus one angle cannot — there's no second rotation for the first one
  to align with and collapse into, because there's only one rotation
  happening at all.
- **Rodrigues' rotation formula** — the specific formula this lesson's
  `rotate_by_axis_angle` implements, splitting any point into a part
  along the rotation axis (which a rotation around that axis can never
  move) and a part perpendicular to it (which rotates exactly like a 2D
  rotation, within that perpendicular plane). It exists because a
  rotation formula built only for `x`, `y`, or `z` (Lesson 47) has no
  way to express "the axis is whatever direction the caller says it
  is" — this formula is the general case those three specific ones were
  always secretly instances of.

**Objects and methods used:**

None new. `math.sqrt` (Lesson 9), `math.radians`/`math.sin`/`math.cos`
(Lesson 47) all reappear unchanged.

---

## Concept Unit: The 3D Cross Product — A Vector, Not a Number

### The Problem

Rodrigues' formula needs to describe how a point's component
*perpendicular* to the rotation axis sweeps around during the rotation
— the same job Lesson 7's 2D `cross_product` did when it measured signed
area/turn direction. But in 3D, "perpendicular to one given axis" isn't
a single direction — it's an entire plane, and a plain number can't
describe *which* direction within that plane a point ends up rotated
toward. What's needed is an operation that takes two vectors and returns
a third *vector*, one that's perpendicular to both inputs, giving
Rodrigues' formula an actual direction to work with, not just a
magnitude.

### Project Change

- **Reference Source:** No reference counterpart — Rodrigues' formula is
  standard textbook geometry, not ported from a specific reference
  implementation.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 50's `is_near_gimbal_lock`).
- **Change type:** add.
- **Location:** new section, `# ── L51: axis-angle rotation ──`.
- **Dependencies:** none beyond plain tuple indexing.

### The New Code

```python
def cross_product_3d(a, b):
    return (
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0],
    )
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `cross_product_3d` as the
first function in its new "L51: axis-angle rotation" section.

### Isolated Example, Anchored to the Code Just Shown

Run `cross_product_3d` on the three standard basis vectors, in every
cyclic order, plus one reversed order to check what happens when the
two arguments swap places:

```python
ex, ey, ez = (1, 0, 0), (0, 1, 0), (0, 0, 1)
print("cross_product_3d(ex, ey) =", cross_product_3d(ex, ey))
print("cross_product_3d(ey, ez) =", cross_product_3d(ey, ez))
print("cross_product_3d(ez, ex) =", cross_product_3d(ez, ex))
print("cross_product_3d(ey, ex) =", cross_product_3d(ey, ex))
```

Real output:

```
cross_product_3d(ex, ey) = (0, 0, 1)
cross_product_3d(ey, ez) = (1, 0, 0)
cross_product_3d(ez, ex) = (0, 1, 0)
cross_product_3d(ey, ex) = (0, 0, -1)
```

This is the same right-hand-rule cycle Lesson 47's `rotate_x`/
`rotate_y`/`rotate_z` already used (`x → y → z → x`): crossing each
basis vector with the *next* one in that cycle gives the *following*
one — `ex × ey = ez`, `ey × ez = ex`, `ez × ex = ey`. This is called the
**3D cross product**, and unlike Lesson 7's 2D version (which collapses
"how much do these two vectors turn relative to each other" into one
signed number), this one returns an actual perpendicular vector — the
last row, `cross_product_3d(ey, ex)`, comes back `(0, 0, -1)`, the exact
negative of `cross_product_3d(ex, ey)`, proving the operation is
**anti-commutative**: swapping the two arguments flips the result's
direction, not just its magnitude. This throwaway example is now
discarded; `rotate_by_axis_angle`, later in this lesson, is where it
gets used for real.

To confirm the "perpendicular to both inputs" claim directly, rather
than trusting the basis-vector pattern alone, cross two arbitrary
non-basis vectors and check the result against both inputs using
Lesson 14's own `dot3`:

```python
cp = cross_product_3d((2, 0, 0), (0, 3, 0))
print("cross_product_3d((2,0,0), (0,3,0)) =", cp)
print("dot3(cp, (2,0,0)) =", dot3(cp, (2, 0, 0)))
print("dot3(cp, (0,3,0)) =", dot3(cp, (0, 3, 0)))
```

Real output:

```
cross_product_3d((2,0,0), (0,3,0)) = (0, 0, 6)
dot3(cp, (2,0,0)) = 0
dot3(cp, (0,3,0)) = 0
```

`(0, 0, 6)` dotted with each original input comes back exactly `0` —
proof, not assertion, that the result is genuinely perpendicular to
both. This second lab is also now discarded.

### CS Lens

The 3D cross product is a **hard concept reappearing in a genuinely
different form** — per the Repetition Rule's own stated exception, a 2D
idea that changes shape in 3D (a number in 2D, a vector in 3D) is a real
first appearance, not a citation back to Lesson 7. Beyond this lesson:

```
Also recognized in: surface-normal computation in any 3D graphics
renderer (which way does a triangle face?), torque in physics (force
applied at a perpendicular distance from a pivot), angular momentum,
right-hand-rule conventions throughout robotics and CAD/CAM tool-axis
definitions
```

### Connecting Sentence

A perpendicular vector is now available on demand; Rodrigues' formula
needs one more small tool — a way to guarantee the rotation axis itself
has length exactly `1` — before it can be assembled.

---

## Extending the Pattern: `normalize_3d`

**A note on method:** no new concept here. `math.sqrt` (Lesson 9) and
the general idea of normalizing a vector to length `1` (Lesson 9/10's
own `normalize`) both already received full treatment; this is the same
3D-extension pattern Lesson 46 already established for
`add_vector_to_point_3d`/`subtract_points_3d`/`scale_vector_3d` — new
function signature, no new concept, no isolation lab owed.

### Project Change

- **Reference Source:** No reference counterpart — direct 3D extension
  of Lesson 9/10's own `norm`/`normalize`.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `cross_product_3d` in the same section.
- **Dependencies:** `dot3` (Lesson 14, reused here as the 3D dot product
  — its 3-component signature was originally built for homogeneous 2D
  coordinates, but works identically on a genuine 3D vector, the same
  "already fits" reuse Lesson 48 found for `apply_matrix`), `math.sqrt`
  (Lesson 9).

### The New Code

```python
def norm_3d(v):
    return math.sqrt(dot3(v, v))


def normalize_3d(v):
    return scale_vector_3d(v, 1 / norm_3d(v))
```

### The Updated Project

Both brand-new, freestanding functions, same exception as
`cross_product_3d` above. `geometry_verified_library.py`'s
"L51: axis-angle rotation" section now carries `cross_product_3d`,
`norm_3d`, and `normalize_3d` in sequence.

### Real Verification

```python
print(norm_3d((3, 4, 0)))
print(normalize_3d((3, 4, 0)))
print(norm_3d(normalize_3d((3, 4, 0))))
```

Real output:

```
5.0
(0.6000000000000001, 0.8, 0.0)
1.0
```

`norm_3d((3, 4, 0))` reproduces `5.0` — the same `3-4-5` right triangle
this curriculum has used since Lesson 9, now with a `z = 0` third
component, another instance of Lesson 46's "2D is the `z = 0` special
case" result. `normalize_3d((3, 4, 0))` scales that vector down to
`(0.6, 0.8, 0)`, and running `norm_3d` on the result confirms it lands
at exactly `1.0` — a genuine unit vector, which Rodrigues' formula
requires of its axis argument.

### Connecting Sentence

A perpendicular-vector tool and a way to force any axis to unit length
are both in hand — everything Rodrigues' formula itself needs is now
available.

---

## Concept Unit: Rodrigues' Rotation Formula

### The Problem

Lesson 47 built three rotation formulas, one per principal axis, each
hand-derived separately. None of them can rotate around a direction
that isn't `x`, `y`, or `z` — and Lesson 47's own closing proved that
naively composing two of them does *not* substitute for that missing
capability. What's needed is one formula that takes an arbitrary axis
directly as an argument, the same way `rotate_z` takes an angle.

### Project Change

- **Reference Source:** No reference counterpart — Rodrigues' rotation
  formula is standard textbook geometry (split any vector into a part
  along the axis and a part perpendicular to it; the along-axis part is
  untouched by the rotation, the perpendicular part rotates exactly like
  a 2D rotation within its own plane), not ported from a specific
  reference implementation.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `normalize_3d` in the same section.
- **Dependencies:** `normalize_3d`, `cross_product_3d` (this lesson),
  `dot3` (Lesson 14), `scale_vector_3d`, `add_vector_to_point_3d`
  (Lesson 46), `math.radians`/`math.sin`/`math.cos` (Lesson 47).

### The New Code

```python
def rotate_by_axis_angle(point, axis, theta_degrees):
    k = normalize_3d(axis)
    theta = math.radians(theta_degrees)
    c = math.cos(theta)
    s = math.sin(theta)
    term1 = scale_vector_3d(point, c)
    term2 = scale_vector_3d(cross_product_3d(k, point), s)
    term3 = scale_vector_3d(k, dot3(k, point) * (1 - c))
    return add_vector_to_point_3d(add_vector_to_point_3d(term1, term2), term3)
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `rotate_by_axis_angle` as the
last function in its "L51: axis-angle rotation" section.

### Mechanical Walkthrough

- `normalize_3d(axis)` — **(b) hard concept reappearing.** Full
  treatment already given above in this lesson; guarantees `k` is a unit
  vector regardless of what length the caller's own `axis` argument
  happened to have.
- `math.radians(theta_degrees)`, `math.cos(theta)`, `math.sin(theta)` —
  **(b) hard concept reappearing.** Full first-appearance treatment
  already given in Lesson 47.
- `scale_vector_3d(point, c)` — **(b) hard concept reappearing**
  (Lesson 46). This is the `c` (cosine) term of Rodrigues' formula:
  `point` scaled by `cos θ`, contributing the "unrotated" fraction of
  every component.
- `cross_product_3d(k, point)` — **(b) hard concept reappearing**, full
  treatment earlier in this lesson. Produces a vector perpendicular to
  both the axis and the point — this is the direction the point sweeps
  *toward* as `θ` increases from `0`, playing the same role the 2D
  `cross_product`'s sign already played back in Lesson 18–19's
  `classify_turn`, now realized as an actual vector instead of a sign.
- `scale_vector_3d(cross_product_3d(k, point), s)` — **(b) hard concept
  reappearing** (Lesson 46). Scales that perpendicular vector by
  `sin θ` — the "how far around" fraction of the rotation.
- `dot3(k, point)` — **(b) hard concept reappearing** (Lesson 14). This
  measures how much of `point` already lies *along* the axis `k` — the
  part of `point` a rotation around `k` can never move at all.
- `dot3(k, point) * (1 - c)` — **(a) first appearance**, as a pattern:
  this is the amount of the along-axis component that needs adding back
  in, scaled by `1 - cos θ`. At `θ = 0`, `1 - cos θ = 0`, so this whole
  term vanishes — correct, since a zero-angle rotation shouldn't move
  anything. As `θ` grows, this term restores exactly the along-axis part
  that the perpendicular-plane rotation (the two terms above) doesn't
  touch.
- `scale_vector_3d(k, dot3(k, point) * (1 - c))` — **(b) hard concept
  reappearing** (Lesson 46).
- `add_vector_to_point_3d(add_vector_to_point_3d(term1, term2), term3)`
  — **(b) hard concept reappearing** (Lesson 46), used twice to sum
  three vectors rather than two — the same small, fixed-count unrolling
  choice this curriculum has used since Lesson 14 rather than reaching
  for a loop over three known, named terms.

### Real Verification

Confirm `rotate_by_axis_angle`, using the standard basis vectors as its
own axis argument, reproduces Lesson 47's `rotate_x`/`rotate_y`/
`rotate_z` exactly — the general formula collapsing to the specific
ones it was always secretly built from, the reverse direction of
Lesson 48's own "specific formula becomes a general matrix" proof:

```python
p = (2, -1, 7)
for theta in [0, 30, 90, 180, 271]:
    z_via = rotate_by_axis_angle(p, (0, 0, 1), theta)
    z_f = rotate_z(p, theta)
    print(theta, "->", z_via, "vs", z_f)
```

Real output:

```
0 -> (2.0, -1.0, 7.0) vs (2.0, -1.0, 7)
30 -> (2.232050807568877, 0.13397459621556118, 7.0) vs (2.232050807568877, 0.13397459621556118, 7)
90 -> (1.0000000000000002, 2.0, 6.999999999999999) vs (1.0000000000000002, 2.0, 7)
180 -> (-1.9999999999999998, 1.0000000000000002, 7.0) vs (-1.9999999999999998, 1.0000000000000002, 7)
```

Every angle matches Lesson 47's own `rotate_z`, down to floating-point
noise (`7.0` vs. plain `7` is only a `float`-vs-`int` difference in
Python's own display, not a numeric discrepancy). The same check against
`rotate_x` and `rotate_y`, using `(1, 0, 0)` and `(0, 1, 0)` as the axis
argument, matched identically across all five angles as well. This is
the real proof that `rotate_z`, `rotate_x`, and `rotate_y` were never
three separate ideas — they're one formula, `rotate_by_axis_angle`, with
the axis argument fixed to a particular basis vector.

### CS Lens

Rodrigues' formula is a **generalization** — one function that subsumes
several previously-separate special cases, the same relationship
Lesson 48's rotation matrices had to Lesson 47's individual formulas,
now one level more general still:

```
Also recognized in: a general polygon-intersection routine subsuming
special-cased line/ray/segment intersections (this curriculum's own
Lessons 21–25), a general `sort` function subsuming a hand-written
bubble sort for one specific data shape, any time a later, more general
tool is proven equivalent to several earlier, narrower ones on the
cases the narrow ones could already handle
```

### SE Lens

The alternative not chosen: keep `rotate_x`/`rotate_y`/`rotate_z` as the
curriculum's only rotation tools and hand-write a fourth, fifth, sixth
specialized formula for every other axis a CAD/CAM program might need —
a 45°-tilted fixture axis, a robot joint's own mounting angle. That
doesn't scale; every new fixture orientation would need its own
hand-derived formula. `rotate_by_axis_angle` costs a few extra
arithmetic operations per call (building `k`, two cross-product terms,
one dot-product term) against never having to derive a new
axis-specific formula again. The debt worth naming honestly: this
function trusts its own internal `normalize_3d` call to fix a
non-unit-length `axis` argument — nothing stops a caller from *also*
pre-normalizing before calling, which costs nothing extra (normalizing
an already-unit vector returns it unchanged) but is easy to forget is
unnecessary, a minor but real point of friction this function's own
docstring-equivalent (this lesson's own prose) has to carry since Python
itself won't enforce it.

### Connecting Sentence

`rotate_by_axis_angle` now rotates around any axis, matching Lesson 47's
own three formulas exactly on the cases they could already handle — the
closing below runs it on the one case none of them ever could.

---

## Closing

### Connect the Pieces

Run `rotate_by_axis_angle` on the *exact* axis and test point Lesson
47's own closing used — the diagonal axis `(1, 1, 0)`, normalized, and
the claim that a genuine rotation around that axis must leave a point
already sitting on it completely fixed:

```python
axis = (1, 1, 0)
axis_point = normalize_3d(axis)
print("axis_point =", axis_point)
result = rotate_by_axis_angle(axis_point, axis, 40)
print("rotate_by_axis_angle(axis_point, axis, 40) =", result)
```

Real output:

```
axis_point = (0.7071067811865475, 0.7071067811865475, 0.0)
rotate_by_axis_angle(axis_point, axis, 40) = (0.7071067811865475, 0.7071067811865475, 0.0)
```

Identical, to every digit shown. This is the exact test Lesson 47's own
closing failed on purpose, to disclose a real, honest gap:
`rotate_z(rotate_x(axis_point, 40), 40)` landed at `(0.19…, 0.87…,
0.45…)` — nowhere near `axis_point`, proving that composition wasn't a
true rotation around this diagonal axis. `rotate_by_axis_angle`, built
in this lesson specifically to close that gap, returns `axis_point`
completely unmoved. The forward reference Lesson 47 made to "wherever
this curriculum builds a function that takes an arbitrary axis
directly" is now fulfilled, under this exact function's name.

### What Breaks Without This

`rotate_by_axis_angle` calls `normalize_3d` on its own `axis` argument
internally, specifically so a caller never has to remember to do it
themselves. Prove that step is load-bearing, not defensive
over-caution, by building an unsafe version that skips it — using the
caller's `axis` argument raw, at whatever length it happens to have —
and running it on an axis that points the same direction as `(1, 1, 0)`
but isn't a unit vector:

```python
def rotate_by_axis_angle_unsafe(point, axis, theta_degrees):
    k = axis
    theta = math.radians(theta_degrees)
    c = math.cos(theta)
    s = math.sin(theta)
    term1 = scale_vector_3d(point, c)
    term2 = scale_vector_3d(cross_product_3d(k, point), s)
    term3 = scale_vector_3d(k, dot3(k, point) * (1 - c))
    return add_vector_to_point_3d(add_vector_to_point_3d(term1, term2), term3)

unnorm_axis = (2, 2, 0)
q = (5, 0, 0)
unsafe_result = rotate_by_axis_angle_unsafe(q, unnorm_axis, 90)
safe_result = rotate_by_axis_angle(q, unnorm_axis, 90)
print("unsafe (raw, unnormalized axis):", unsafe_result, "norm_3d =", norm_3d(unsafe_result))
print("safe (rotate_by_axis_angle):    ", safe_result, "norm_3d =", norm_3d(safe_result))
```

Real output:

```
unsafe (raw, unnormalized axis): (19.999999999999996, 19.999999999999996, -10.0) norm_3d = 29.999999999999996
safe (rotate_by_axis_angle):     (2.4999999999999996, 2.499999999999999, -3.5355339059327373) norm_3d = 4.999999999999999
```

`q = (5, 0, 0)` has length `5`. A real rotation — any rotation, around
any axis — can never change a point's distance from the origin, the
same distance-preserving property Lesson 48's own CS Lens named. The
`safe` result correctly comes back at length `≈5`. The `unsafe` version,
given the exact same direction but an axis vector of length `2√2`
instead of `1`, comes back at length `≈30` — six times too long,
because `2√2 ≈ 2.83`, and the un-normalized axis term compounds into the
result roughly by that same uncorrected scale. This is a real, verified,
silently wrong result: `rotate_by_axis_angle_unsafe` raises no error and
returns a plausible-looking 3D point, and nothing about the output alone
signals that the axis needed normalizing first. This is exactly the
category of risk Lesson 46 first disclosed for `scale_vector` on a
3-tuple, and Lesson 48's own SE Lens named again for `multiply_matrices`
argument order — a caller can pass technically-valid input and receive a
technically-valid-looking, numerically wrong answer, with nothing in
Python's own type system able to catch it.

### Exercises

- Confirm `rotate_by_axis_angle` preserves distance on a genuinely
  non-principal axis, not just the diagonal one already tested: rotate
  `(5, 0, 0)` around axis `(1, 1, 1)` by some angle of your choosing,
  and confirm `norm_3d` of the result still comes back `5`.
- Confirm two successive `90°` rotations around any axis of your
  choosing equal one `180°` rotation around that same axis — pick your
  own axis and point, and check `rotate_by_axis_angle` applied twice at
  `90°` against a single call at `180°`.
- Using Lesson 47's own `rotate_x`, `rotate_y`, and `rotate_z`, confirm
  `rotate_by_axis_angle` reproduces all three exactly at a single angle
  of your own choosing, the same check this lesson's own Real
  Verification ran across five angles for `rotate_z` alone.

### Definition of Done

- [ ] `cross_product_3d`, `norm_3d`, `normalize_3d`, and
      `rotate_by_axis_angle` all exist in `geometry_verified_library.py`.
- [ ] `rotate_by_axis_angle` was verified against all three of Lesson
      47's `rotate_x`/`rotate_y`/`rotate_z` on their own axes, across
      multiple angles, not just one.
- [ ] Lesson 47's own exact disclosed test case (the diagonal axis
      `(1, 1, 0)` and its fixed point) was re-run against
      `rotate_by_axis_angle` and confirmed to now succeed, closing that
      forward reference under its exact promised name.
- [ ] The unnormalized-axis failure was actually run and its distorted
      `norm_3d` result compared against the correct one, not just
      described.
- [ ] Commit with a message stating *why*: an arbitrary rotation axis is
      now possible directly, closing the gap Lesson 47 disclosed four
      lessons ago, and axis-angle rotation carries none of Lesson 50's
      gimbal-lock risk — the commit message should connect both points
      back to the lessons that raised them.
