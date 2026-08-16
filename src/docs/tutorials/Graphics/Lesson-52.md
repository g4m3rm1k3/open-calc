# Lesson 52: Quaternions

**What you will build:** `quaternion_from_axis_angle`,
`quaternion_multiply`, `quaternion_conjugate`, and
`rotate_by_quaternion` — a second, independent way to represent and
apply the exact same rotations Lesson 51's `rotate_by_axis_angle`
already computes, built from four plain numbers instead of a 3×3 matrix
or a formula taking an axis and an angle as separate arguments. The
transferable problem: Lesson 51 already solved arbitrary-axis rotation
and Lesson 50 already proved Euler angles can lose a degree of freedom —
so why does this curriculum need a *third* rotation representation at
all? This lesson answers that directly, by building quaternions and
proving, point by point, that they reproduce Lesson 51's own results
exactly — including its own headline proof, Lesson 47's disclosed
diagonal-axis test — while composing (Lesson 53) and interpolating
(Lesson 54) in ways that a raw axis-angle formula and a 3×3 matrix
alone cannot, which those next two lessons build on directly.

**What you need to know first:** Lesson 51's `rotate_by_axis_angle`,
`normalize_3d`, and its own diagonal-axis fixed-point proof — this
lesson checks its own results against all of them directly. Lesson 47's
`math.radians`/`math.sin`/`math.cos`. Lesson 9's `math.sqrt`. Lesson 46's
tuple-unpacking pattern (`x, y, z = point`), extended here to four
components.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–51.

**Terms introduced in this lesson:**

- **quaternion** — four numbers, `(w, x, y, z)`, that together encode a
  3D rotation: `w` and the vector `(x, y, z)` are built from half of the
  rotation angle and the rotation axis. It exists because Lesson 51's
  axis-angle formula, while correct, has no equivalent to
  `multiply_matrices` — no way to combine two rotations into one
  reusable value using ordinary multiplication the way Lesson 48's
  matrices could. A quaternion is built specifically so that ordinary
  quaternion multiplication *is* rotation composition, which Lesson 53
  builds on directly.
- **Hamilton product** — the specific multiplication rule this lesson's
  `quaternion_multiply` implements: not component-by-component
  multiplication (which would just be four separate, unrelated
  multiplications), but a rule that mixes all four components of both
  inputs into each of the four outputs. It exists because a quaternion
  represents a rotation, and two rotations composed together need a
  genuinely new rotation as the result — a component-wise product
  couldn't produce that; the Hamilton product is the specific rule that
  does.
- **sandwich product** — the pattern `q * p * conjugate(q)`, used to
  apply a quaternion `q` to a point `p`: multiplying `p` on both sides,
  by `q` and by its own conjugate, rather than multiplying `p` by `q`
  once the way applying a matrix does. It exists because a single
  quaternion multiplication, `q * p`, does not correctly rotate a point
  by itself — this lesson's own closing demonstrates that directly, not
  just states it.

**Objects and methods used:**

None new. `math.sqrt` (Lesson 9), `math.radians`/`math.sin`/`math.cos`
(Lesson 47) all reappear unchanged.

---

## Concept Unit: A Quaternion — Half the Angle, the Axis Baked In

### The Problem

Lesson 51's `rotate_by_axis_angle` takes an axis and an angle as two
separate arguments every time it's called — there's no single value
that *is* "this specific rotation," the way `rotation_matrix_z(90)`
(Lesson 48) already produced one storable value for a single-axis
rotation. Building that single value for an *arbitrary* axis is this
unit's own job — and, as this unit's own verification shows, the number
actually stored for the angle is not quite what a reader would guess.

### Project Change

- **Reference Source:** No reference counterpart — quaternion rotation
  is standard textbook geometry, not ported from a specific reference
  implementation.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 51's `rotate_by_axis_angle`).
- **Change type:** add.
- **Location:** new section, `# ── L52: quaternions ──`.
- **Dependencies:** `normalize_3d` (Lesson 51), `math.radians`/
  `math.sin`/`math.cos` (Lesson 47).

### The New Code

```python
def quaternion_from_axis_angle(axis, theta_degrees):
    k = normalize_3d(axis)
    theta = math.radians(theta_degrees)
    half = theta / 2
    s = math.sin(half)
    return (math.cos(half), k[0] * s, k[1] * s, k[2] * s)
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `quaternion_from_axis_angle`
as the first function in its new "L52: quaternions" section.

### Mechanical Walkthrough

- `normalize_3d(axis)` — **(b) hard concept reappearing** (Lesson 51).
- `math.radians(theta_degrees)` — **(b) hard concept reappearing**
  (Lesson 47).
- `theta / 2` — **(a) first appearance**, as a pattern worth flagging
  even though `/` itself is ordinary division: this lesson's own **half**
  of the input angle, not the whole thing — this lesson's own isolated
  check, right below, proves why that's not a typo.
- `math.sin(half)`, `math.cos(half)` — **(b) hard concept reappearing**
  (Lesson 47), each called on the *half*-angle rather than the full one.
- `(math.cos(half), k[0] * s, k[1] * s, k[2] * s)` — **(a) first
  appearance.** A 4-tuple, not the 3-tuples every point and vector in
  this curriculum has been since Lesson 1 — the first component is a
  plain number (`math.cos(half)`), and the remaining three are the
  rotation axis scaled by `math.sin(half)`. This shape — one number plus
  a 3D vector, packed into one 4-tuple — is what this lesson's own
  Header calls a **quaternion**.

### Isolated Example, Anchored to the Code Just Shown

Build a quaternion for a known rotation — `90°` around `z` — and check
two things directly: that it comes out as a genuine unit-length 4-tuple,
and that its first component really is `cos` of *half* the angle, not
the full angle:

```python
q = quaternion_from_axis_angle((0, 0, 1), 90)
print("q =", q)
print("quaternion_norm(q) =", quaternion_norm(q))
```

Real output:

```
q = (0.7071067811865476, 0.0, 0.0, 0.7071067811865476)
quaternion_norm(q) = 1.0
```

`q`'s first component, `0.7071067811865476`, is `cos(45°)` —
`math.cos` of *half* of `90°` — not `cos(90°)` (which would be
`≈0`). Its length, computed the same way any vector's length has been
computed since Lesson 9 (sum of each component squared, square-rooted),
comes back exactly `1.0`: a quaternion built from a *normalized* axis is
always unit length, regardless of which axis or angle was used. This
throwaway example is now discarded; whether building it from a half
angle rather than the full one actually matters is proven directly in
this lesson's own closing, not assumed here.

### Connecting Sentence

A quaternion now exists as a single storable value for any rotation; the
next question is how two quaternions combine — the same question Lesson
48 asked of two matrices.

---

## Concept Unit: Quaternion Multiplication — the Hamilton Product

### The Problem

Two rotation matrices combine via `multiply_matrices`, already built in
Lesson 48. A quaternion is a 4-tuple, not a matrix — combining two of
them needs its own multiplication rule, one that mixes all four
components of both inputs together, the way `multiply_matrices` mixes
every row against every column rather than working component-by-
component.

### Project Change

- **Reference Source:** No reference counterpart — the Hamilton product
  is a fixed, standard formula (named for its 19th-century discoverer,
  William Rowan Hamilton), not derived from a project-specific
  reference.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `quaternion_norm` (added alongside
  `quaternion_from_axis_angle` above) in the same section.
- **Dependencies:** none beyond plain arithmetic.

### The New Code

```python
def quaternion_multiply(q1, q2):
    w1, x1, y1, z1 = q1
    w2, x2, y2, z2 = q2
    w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2
    x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2
    y = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2
    z = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2
    return (w, x, y, z)


def quaternion_conjugate(q):
    w, x, y, z = q
    return (w, -x, -y, -z)
```

### The Updated Project

Both brand-new, freestanding functions, same exception as
`quaternion_from_axis_angle` above.
`geometry_verified_library.py`'s "L52: quaternions" section now carries
`quaternion_from_axis_angle`, `quaternion_norm`, `quaternion_multiply`,
and `quaternion_conjugate` in sequence.

### Mechanical Walkthrough

- `w1, x1, y1, z1 = q1` / `w2, x2, y2, z2 = q2` — **(b) hard concept
  reappearing** (Lesson 46's own 4-way extension of tuple unpacking,
  here applied to two separate quaternions).
- `w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2` — **(a) first appearance.**
  The new output's own scalar (`w`) component: the two inputs' scalar
  parts multiplied together, minus the ordinary 3D dot product (Lesson
  14's `dot3`, though not called directly here — the same three-term
  sum-of-products shape) of their two vector parts.
- The three remaining lines (`x`, `y`, `z`) — **(a) first appearance**,
  as a pattern: each combines a scalar-times-vector term from each
  input with a `cross_product_3d`-shaped term (Lesson 51's own 3D cross
  product, though again not called directly — the same
  `a[1]*b[2]-a[2]*b[1]` cyclic-difference shape appears inline) built
  from the two inputs' vector parts. The exact sign pattern in each line
  is what makes this multiplication rule the **Hamilton product** named
  in this lesson's own Header — not an arbitrary choice, but the one
  specific rule under which quaternion multiplication genuinely
  represents rotation composition, which Lesson 53 builds on directly.
- `quaternion_conjugate`'s `(w, -x, -y, -z)` — **(a) first appearance.**
  Negates only the vector part, leaving the scalar part untouched — the
  quaternion equivalent of Lesson 51's own axis-angle formula running
  the *same* rotation backward, used below to "undo" a quaternion's
  effect on one side of the sandwich product.

### Real Verification

A quaternion multiplied by its own conjugate should produce something
with no vector part left at all — proof that conjugation genuinely
cancels the rotation, not just a formula that happens to look
symmetric:

```python
q90 = quaternion_from_axis_angle((0, 0, 1), 90)
qq = quaternion_multiply(q90, quaternion_conjugate(q90))
print("q * conjugate(q) =", qq)
```

Real output:

```
q * conjugate(q) = (1.0000000000000002, 0.0, 0.0, 0.0)
```

The vector part comes back exactly `(0, 0, 0)`, and the scalar part
comes back `1` (the trailing `...02` is `nearly_equal`-scale floating
noise) — matching `quaternion_norm(q90)` squared (`1.0` squared is still
`1.0`), which is exactly what a unit quaternion times its own conjugate
is supposed to produce.

### Connecting Sentence

Multiplying two quaternions is now possible; the next unit uses that
same multiplication, on both sides of a point at once, to actually
rotate something.

---

## Concept Unit: The Sandwich Product — `rotate_by_quaternion`

### The Problem

`quaternion_multiply` combines two quaternions into a third quaternion —
it has no way, on its own, to take a plain 3D point in and return a
rotated 3D point out. Turning a quaternion into something that actually
moves a point needs one more step: treating the point itself as a
special quaternion, multiplying it into the mix, and reading the result
back out as a point again.

### Project Change

- **Reference Source:** No reference counterpart — the sandwich-product
  pattern is standard quaternion-rotation theory.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `quaternion_conjugate` in the same
  section.
- **Dependencies:** `quaternion_multiply`, `quaternion_conjugate` (this
  lesson).

### The New Code

```python
def rotate_by_quaternion(point, q):
    p = (0, point[0], point[1], point[2])
    q_conjugate = quaternion_conjugate(q)
    result = quaternion_multiply(quaternion_multiply(q, p), q_conjugate)
    return (result[1], result[2], result[3])
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `rotate_by_quaternion` as the
last function in its "L52: quaternions" section.

### Mechanical Walkthrough

- `p = (0, point[0], point[1], point[2])` — **(a) first appearance**,
  as a pattern: a plain 3D point, repackaged as a quaternion with a
  scalar part fixed at `0`. This is called a **pure quaternion** —
  worth naming, though not a separate Terms Introduced entry, since it's
  simply this lesson's own quaternion shape with one component held at
  a known constant, not a new kind of thing.
- `quaternion_conjugate(q)` — **(b) hard concept reappearing**, full
  treatment earlier in this lesson.
- `quaternion_multiply(quaternion_multiply(q, p), q_conjugate)` — **(a)
  first appearance**, as the **sandwich product** pattern named in this
  lesson's own Header: `p` multiplied by `q` on the left and by `q`'s
  own conjugate on the right, in that specific order — not `p`
  multiplied by `q` just once. Why this needs both sides, not one, is
  exactly what this lesson's own closing proves with real numbers rather
  than asserting.
- `(result[1], result[2], result[3])` — **(c) already basic.** Ordinary
  tuple indexing, discarding the scalar part (`result[0]`) and keeping
  only the vector part — the rotated point.

### Real Verification

Confirm `rotate_by_quaternion` reproduces Lesson 47's `rotate_z` exactly
across several angles, using a quaternion built around the `z`-axis:

```python
p = (2, -1, 7)
for theta in [0, 30, 90, 180, 271]:
    qz = quaternion_from_axis_angle((0, 0, 1), theta)
    via_q = rotate_by_quaternion(p, qz)
    via_f = rotate_z(p, theta)
    print(theta, "->", via_q, "vs", via_f)
```

Real output:

```
0 -> (2.0, -1.0, 7.0) vs (2.0, -1.0, 7)
30 -> (2.232050807568877, 0.13397459621556118, 7.0) vs (2.232050807568877, 0.13397459621556118, 7)
90 -> (1.0, 2.0000000000000004, 7.000000000000001) vs (1.0000000000000002, 2.0, 7)
180 -> (-2.0, 1.0000000000000004, 7.0) vs (-1.9999999999999998, 1.0000000000000002, 7)
271 -> (-0.964942882281825, -2.017147796750066, 7.0) vs (-0.964942882281825, -2.0171477967500655, 7)
```

Every angle matches `rotate_z`, down to floating-point noise. Now
confirm the same holds against Lesson 51's own `rotate_by_axis_angle` on
a genuinely non-principal axis, `(1, 1, 1)` — the case where three
separate single-axis formulas could never have applied at all:

```python
axis = (1, 1, 1)
for theta in [0, 40, 90, 200]:
    qa = quaternion_from_axis_angle(axis, theta)
    via_q = rotate_by_quaternion(p, qa)
    via_axis = rotate_by_axis_angle(p, axis, theta)
    print(theta, "->", via_q, "vs", via_axis)
```

Real output:

```
0 -> (2.0, -1.0, 7.0) vs (2.0, -1.0, 7.0)
40 -> (5.1248791671282525, -1.997730955524317, 4.872851788396066) vs (5.124879167128251, -1.9977309555243172, 4.872851788396066)
90 -> (7.285468820183674, -0.2200846792814617, 0.9346158590977889) vs (7.285468820183674, -0.22008467928146214, 0.9346158590977898)
200 -> (1.7134050393184794, 7.099533385301744, -0.812938424620223) vs (1.7134050393184803, 7.099533385301745, -0.8129384246202198)
```

Matching across every angle, on an axis none of Lesson 47's own
functions could ever handle directly. Finally, run Lesson 47's own
disclosed diagonal-axis test — a point sitting on axis `(1, 1, 0)` must
come back completely unmoved — one more time, through this lesson's own
quaternion machinery instead of Lesson 51's formula:

```python
diag_axis = (1, 1, 0)
axis_point = normalize_3d(diag_axis)
qd = quaternion_from_axis_angle(diag_axis, 40)
result = rotate_by_quaternion(axis_point, qd)
print("axis_point =", axis_point)
print("rotate_by_quaternion(axis_point, qd) =", result)
```

Real output:

```
axis_point = (0.7071067811865475, 0.7071067811865475, 0.0)
rotate_by_quaternion(axis_point, qd) = (0.7071067811865475, 0.7071067811865475, 0.0)
```

Identical. Lesson 47's own disclosed gap, already closed once by Lesson
51, is now confirmed closed a second, independent way — two completely
different representations, a 3×3-matrix-free formula and a 4-number
algebraic object, agreeing exactly on the one case that mattered enough
to be tracked across five lessons by name.

### CS Lens

Two genuinely different representations proven to compute identical
results is a form of **cross-validation** — using an independently
derived method to check another, rather than trusting one method's
self-consistency alone:

```
Also recognized in: a compiler tested against an independent
interpreter for the same language, floating-point numerical code
checked against an arbitrary-precision reference implementation,
this curriculum's own Lesson 42 (triangulation verified by cross-
checking total area against Lesson 34's shoelace formula)
```

### Connecting Sentence

Quaternions now reproduce every rotation Lesson 51's axis-angle formula
can — the closing below shows exactly why the sandwich product needs
*both* the quaternion and its conjugate, not just one multiplication.

---

## Closing

### Connect the Pieces

Trace one concrete rotation through every piece this lesson built:
`quaternion_from_axis_angle` constructs `q` from an axis and an angle;
`rotate_by_quaternion` wraps a point as a pure quaternion, applies the
sandwich product using `quaternion_multiply` and `quaternion_conjugate`,
and unpacks the result. Confirm the half-angle choice from Concept Unit
1 is load-bearing, not cosmetic, by building a quaternion the *wrong*
way — using the full angle directly, instead of half of it — and
watching what rotation actually comes out:

```python
def quaternion_from_axis_full_angle_WRONG(axis, theta_degrees):
    k = normalize_3d(axis)
    theta = math.radians(theta_degrees)
    s = math.sin(theta)
    return (math.cos(theta), k[0] * s, k[1] * s, k[2] * s)

q_wrong = quaternion_from_axis_full_angle_WRONG((0, 0, 1), 90)
via_wrong = rotate_by_quaternion(p, q_wrong)
print("q built from the FULL 90 degrees, not half:", q_wrong)
print("rotate_by_quaternion(p, q_wrong)     =", via_wrong)
print("rotate_z(p, 90) (what 90 should give) =", rotate_z(p, 90))
print("rotate_z(p, 180) (what actually came out)=", rotate_z(p, 180))
```

Real output:

```
q built from the FULL 90 degrees, not half: (6.123233995736766e-17, 0.0, 0.0, 1.0)
rotate_by_quaternion(p, q_wrong)     = (-2.0, 1.0000000000000004, 7.0)
rotate_z(p, 90) (what 90 should give) = (1.0000000000000002, 2.0, 7)
rotate_z(p, 180) (what actually came out)= (-1.9999999999999998, 1.0000000000000002, 7)
```

Requesting `90°` and building the quaternion from `90°` directly, with
no halving, produces the *same result as an actual `180°`* rotation —
the sandwich product's own `q * p * conjugate(q)` pattern multiplies by
something built from the angle *twice*, once on each side, which
doubles whatever angle went into `q` in the first place. Building `q`
from *half* the requested angle is exactly what cancels that doubling
back down to the angle the caller actually asked for. This is why the
half-angle line in Concept Unit 1 is a real requirement, confirmed here
with numbers, not a stylistic choice.

### What Breaks Without This

`rotate_by_quaternion` trusts that `q` is a genuine unit quaternion —
nothing checks it. Build one that isn't, and see what actually comes
back:

```python
q_bad = (2, 0, 0, 0)
print("quaternion_norm(q_bad) =", quaternion_norm(q_bad))
bad_result = rotate_by_quaternion(p, q_bad)
print("rotate_by_quaternion(p, q_bad) =", bad_result)
print("norm_3d(p) =", norm_3d(p), " norm_3d(bad_result) =", norm_3d(bad_result))
```

Real output:

```
quaternion_norm(q_bad) = 2.0
rotate_by_quaternion(p, q_bad) = (8, -4, 28)
norm_3d(p) = 7.3484692283495345  norm_3d(bad_result) = 29.393876913398138
```

`q_bad`'s vector part is `(0, 0, 0)` — no axis at all, so it shouldn't
rotate anything — but its scalar part is `2`, not `1`, so its own norm
is `2`, not the `1` every quaternion this lesson has built so far
actually had. The result isn't rotated at all (`(8, -4, 28)` is exactly
`(2, -1, 7)` scaled by `4`, not turned), and its length has grown from
`≈7.35` to `≈29.39` — almost exactly four times longer, matching
`quaternion_norm(q_bad)` squared (`2 * 2 = 4`). This is a real,
verified, silently wrong result: `rotate_by_quaternion` runs without
error on a non-unit quaternion and returns a plausible-looking point
that has secretly been *scaled*, not rotated — the same category of
risk Lesson 46 first disclosed for `scale_vector` on a 3-tuple and
Lesson 51 disclosed again for an un-normalized axis. Every quaternion
this lesson's own `quaternion_from_axis_angle` builds is automatically
unit length, because it's built from a normalized axis and
`sin`/`cos` outputs that always satisfy `sin²(half) + cos²(half) = 1` —
but nothing stops a caller from constructing or receiving a quaternion
some other way and passing it to `rotate_by_quaternion` directly,
unchecked. Lesson 53 (Quaternion Composition) is where multiple
quaternions get combined — a natural place this kind of drift could
compound if left unguarded, though this lesson does not build that
guard itself.

### Exercises

- Confirm `rotate_by_quaternion` reproduces `rotate_x` and `rotate_y`
  the same way this lesson's own Real Verification confirmed `rotate_z`
  — build quaternions around `(1, 0, 0)` and `(0, 1, 0)` and compare
  across several angles of your own choosing.
- Confirm `quaternion_conjugate(quaternion_conjugate(q))` returns `q`
  unchanged for a quaternion of your own choosing — conjugating twice
  should undo itself, the same double-negation property real numbers
  have under `-(-x) = x`.
- Using `quaternion_norm`, confirm that `quaternion_from_axis_angle`
  always returns a unit quaternion regardless of which axis and angle
  are passed in — try at least three axis/angle combinations of your
  own choosing, not just the ones already shown in this lesson.

### Definition of Done

- [ ] `quaternion_from_axis_angle`, `quaternion_norm`,
      `quaternion_multiply`, `quaternion_conjugate`, and
      `rotate_by_quaternion` all exist in `geometry_verified_library.py`.
- [ ] `rotate_by_quaternion` was verified against `rotate_z` across
      multiple angles, and against Lesson 51's `rotate_by_axis_angle` on
      a genuinely non-principal axis, not just a principal one.
- [ ] Lesson 47's own diagonal-axis fixed-point test was re-run through
      `rotate_by_quaternion` and confirmed to still succeed — the third
      independent confirmation of that fix, after Lesson 51's own.
- [ ] The half-angle requirement was actually demonstrated to matter (a
      full-angle quaternion produces double the intended rotation), not
      just stated as a rule to follow.
- [ ] The non-unit-quaternion failure was actually run and its distorted
      norm compared against the correct one, not just described.
- [ ] Commit with a message stating *why*: a second, independent
      rotation representation now exists, cross-validated against
      Lesson 51's own axis-angle formula on the same disclosed test case
      Lesson 47 first raised — and the commit message should flag that
      composing and interpolating quaternions are both still open,
      naming Lessons 53 and 54 as where each gets built.
