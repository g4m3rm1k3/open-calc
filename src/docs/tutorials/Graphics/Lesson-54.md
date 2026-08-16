# Lesson 54: Quaternion Interpolation

**What you will build:** `slerp(q1, q2, t)` — spherical linear
interpolation, which smoothly blends *between* two orientations by a
fraction `t` from `0` to `1`, rather than composing two full rotations
the way Lesson 53's `quaternion_multiply` did. The transferable problem:
composition answers "rotation `q1`, then rotation `q2`" — it has no
concept of a partial rotation partway between two orientations, which
is exactly what smooth animation or motion planning needs (a tool head
easing from one orientation to another, not snapping between them).
This lesson's own closing repeats a pattern this curriculum has now
shown five times since Lesson 46: the obvious-looking shortcut (blend
the four raw numbers directly) produces a plausible-looking but
completely wrong result — this time not just a wrong angle, but a
rotation that travels in the *opposite* direction from the one
requested, a real, dramatic, verified bug with a specific, well-known
cause.

**What you need to know first:** Lesson 52's `quaternion_from_axis_angle`
and `rotate_by_quaternion`. Lesson 53's own finding that `quaternion_add`
-style component-wise combination is not a valid way to work with
rotation quaternions — this lesson's own closing extends that same
warning to interpolation specifically. Lesson 47's `math.sin`. Lesson
17's `nearly_equal`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–53.

**Terms introduced in this lesson:**

- **spherical linear interpolation (slerp)** — a way to compute the
  orientation partway between two given orientations, moving at a
  constant rate of rotation for every equal step of `t`. It exists
  because unit quaternions live on the surface of a 4D sphere (every
  one has length exactly `1`), and the shortest, smoothest path between
  two points *on* a sphere's surface is a curve along that surface, not
  a straight line cutting through its interior — which is exactly the
  distinction this lesson's own closing proves matters, with real
  numbers.
- **double cover** — the fact that a quaternion `q` and its negation
  `-q` represent the *exact same* rotation (this lesson's own opening
  proves this directly: `rotate_by_quaternion` gives identical output
  for both). It exists as a term here because it's the specific,
  named cause of this lesson's own closing bug: naively interpolating
  toward `-q` instead of recognizing it as "the same target, reached the
  other way around" sends the interpolation the long way around the
  4D sphere instead of the short way.

**Objects and methods used:**

- **`math.acos`**
  - *What it is:* the inverse of `math.cos` (Lesson 47) — given a
    cosine value, returns the angle that produced it.
  - *Implementation:* `math.acos(x) -> float`, `x` restricted to the
    closed interval `[-1, 1]` (the only range a real cosine value can
    ever fall in), returning an angle in radians between `0` and `π`.
    Same C-implemented, libm-wrapping nature as Lesson 47's `math.sin`/
    `math.cos`/`math.radians` — no Python-level source body to fetch,
    contract cited from the official Python documentation.
  - *Its use:* `slerp`'s own formula needs the actual angle between two
    quaternions, not just its cosine (which `quaternion_dot` already
    gives directly, the same way an ordinary dot product relates to the
    angle between two vectors) — `math.acos` is what recovers the angle
    itself from that cosine value.
- **`max`**
  - *What it is:* a built-in function, not tied to any particular type,
    that returns the largest of the values passed to it.
  - *Implementation:* `max(a, b) -> the larger of a and b` (also accepts
    more than two arguments, or a single iterable — not used that way
    here).
  - *Its use:* half of this lesson's own fix for `math.acos`'s narrow
    input range — see `min`'s own entry below for the other half.
- **`min`**
  - *What it is:* `max`'s counterpart, returning the smallest of the
    values passed to it.
  - *Implementation:* `min(a, b) -> the smaller of a and b`.
  - *Its use:* `min(d, 1)` caps a value at `1` from above; wrapped in
    `max(-1, ...)`, the pair together forces any number into the exact
    `[-1, 1]` range `math.acos` requires — this lesson's own isolated
    lab demonstrates exactly why that's needed, with a real crash.

---

## Extending the Pattern: Quaternion Arithmetic as Plain 4-Tuples

**A note on method:** no new concept here. `quaternion_dot`,
`quaternion_scale`, and `quaternion_add` are direct 4-component
extensions of already-taught ideas — Lesson 14's `dot_product`/`dot3`,
Lesson 3's `scale_vector`, Lesson 1's `add_vector_to_point` — the same
Repetition-Rule extension pattern Lesson 46 already established for 3D.
No isolation lab is owed.

### Project Change

- **Reference Source:** No reference counterpart — plain 4-component
  extensions of already-taught vector arithmetic.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 52's `rotate_by_quaternion`).
- **Change type:** add.
- **Location:** new section, `# ── L54: quaternion interpolation (slerp) ──`.
- **Dependencies:** none beyond plain tuple indexing.

### The New Code

```python
def quaternion_dot(q1, q2):
    return q1[0] * q2[0] + q1[1] * q2[1] + q1[2] * q2[2] + q1[3] * q2[3]


def quaternion_scale(q, factor):
    return (q[0] * factor, q[1] * factor, q[2] * factor, q[3] * factor)


def quaternion_add(q1, q2):
    return (q1[0] + q2[0], q1[1] + q2[1], q1[2] + q2[2], q1[3] + q2[3])
```

### The Updated Project

All three brand-new, freestanding functions — nothing surrounding them
yet to show placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `quaternion_dot`,
`quaternion_scale`, and `quaternion_add` as the first three functions in
its new "L54: quaternion interpolation" section.

### Real Verification

Confirm `quaternion_dot` gives the same style of result Lesson 53 found
useful for checking a quaternion's own norm — a quaternion dotted with
itself should equal its norm squared:

```python
q = quaternion_from_axis_angle((0, 0, 1), 40)
print("quaternion_dot(q, q) =", quaternion_dot(q, q))
print("quaternion_norm(q) squared =", quaternion_norm(q) * quaternion_norm(q))
```

Real output:

```
quaternion_dot(q, q) = 1.0
quaternion_norm(q) squared = 1.0
```

Matching exactly — `quaternion_dot(q, q)` is `quaternion_norm`'s own
formula with the final `math.sqrt` skipped, the same relationship
Lesson 9's `norm`/`dot_product` already had in 2D.

### Connecting Sentence

Plain 4-tuple arithmetic is now available — the next step is the one
piece of that arithmetic slerp actually needs but doesn't have yet:
recovering a real angle from a cosine value.

---

## Concept Unit: Recovering an Angle — `math.acos`

### The Problem

`quaternion_dot(q1, q2)` gives the cosine of the angle between two
quaternions, the same way an ordinary dot product relates to the cosine
of the angle between two vectors. `slerp`'s own formula needs the actual
angle, in radians, not its cosine — the reverse direction of what Lesson
47's `math.cos` computes.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none yet — this unit's own code is throwaway.
- **Change type:** N/A (isolated lab only).
- **Location:** N/A.
- **Dependencies:** `math.cos`, `math.degrees` (Lesson 47's own module).

### The New Code

```python
print(math.acos(1))
print(math.degrees(math.acos(0)))
print(math.degrees(math.acos(-1)))
```

### Real Output

Running the three prints above:

```
0.0
90.0
180.0
```

`math.acos(1)` returns `0.0` radians — no angle at all, matching
`math.cos(0) = 1` from Lesson 47. `math.acos(0)`, converted to degrees,
gives exactly `90` — a right angle, matching `math.cos(90°) ≈ 0`.
`math.acos(-1)` gives `180°` — the two vectors pointing in completely
opposite directions. This confirms `math.acos` genuinely inverts
`math.cos`'s own already-verified behavior from Lesson 47.

Now check what happens at the *edge* of `math.acos`'s valid input range,
using a value a real dot-product computation could actually produce —
not a value chosen to look suspicious, but the ordinary kind of
floating-point overshoot Lesson 47 and every lesson since has already
produced repeatedly (the recurring `6.123233995736766e-17` noise term):

```python
try:
    print(math.acos(1.0000000000000002))
except ValueError as e:
    print("ValueError:", e)
```

Real output:

```
ValueError: expected a number in range from -1 up to 1, got 1.0000000000000002
```

A real crash, with a real traceback message — not a guessed one. Two
unit quaternions that are genuinely identical (or extremely close)
should have a dot product of exactly `1`, but floating-point arithmetic
can push the actual computed value a tiny fraction past `1` — exactly
the kind of noise this curriculum has seen in nearly every lesson since
Lesson 17's own `nearly_equal`. `math.acos` has no tolerance for that
noise at all; a value even `2 × 10⁻¹⁶` outside its valid range raises
immediately. This throwaway example is now discarded; the next unit
builds the fix.

### Connecting Sentence

`math.acos` correctly recovers an angle from a cosine — but only from a
cosine that's genuinely, exactly within `[-1, 1]`, which real
floating-point arithmetic cannot always guarantee.

---

## Concept Unit: Clamping With `max` and `min`

### The Problem

The previous unit's own crash needs a fix that doesn't change the
*meaning* of a value already inside `[-1, 1]`, but forces any value
that has drifted slightly outside that range back onto the nearest
valid boundary before it ever reaches `math.acos`.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** none yet — this unit's own code is throwaway.
- **Change type:** N/A (isolated lab only).
- **Location:** N/A.
- **Dependencies:** none.

### The New Code

```python
print(max(-1, min(1.0000000000000002, 1)))
print(max(-1, min(-1.5, 1)))
print(max(-1, min(0.3, 1)))
```

### Real Output

Running the three prints above:

```
1
-1
0.3
```

`min(1.0000000000000002, 1)` returns plain `1` — the smaller of the two
— pulling the drifted value back down to the valid boundary.
`max(-1, min(-1.5, 1))` works the same way from the other direction:
`min(-1.5, 1)` returns `-1.5` unchanged (it's already the smaller
value), then `max(-1, -1.5)` pulls it back up to `-1`. A value already
safely inside the range, `0.3`, passes through both calls completely
unchanged — proof this combination only *clamps* values that are
already out of range, rather than distorting values that were never a
problem. This throwaway example is now discarded; `slerp`, next, uses
this exact `max(-1, min(d, 1))` pattern before ever calling
`math.acos`.

### Connecting Sentence

Every piece `slerp`'s own formula needs — the angle between two
quaternions, safely recovered — is now available; the formula itself
can finally be assembled.

---

## Concept Unit: `slerp` — Blending Two Orientations

### The Problem

Given two quaternions and a fraction `t` between `0` and `1`, produce
the quaternion that represents the orientation genuinely partway
between them — not composed, not averaged component-by-component (which
Lesson 53's own closing already ruled out for a *different* quaternion
operation, composition), but blended along the actual curved path
connecting them on the unit-quaternion sphere.

### Project Change

- **Reference Source:** No reference counterpart — spherical linear
  interpolation is standard quaternion theory.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** directly after `quaternion_add` in the same section.
- **Dependencies:** `quaternion_dot`, `quaternion_scale`,
  `quaternion_add` (this lesson), `math.acos` (this lesson),
  `math.sin` (Lesson 47).

### The New Code

```python
def slerp(q1, q2, t):
    d = quaternion_dot(q1, q2)
    if d < 0:
        q2 = quaternion_scale(q2, -1)
        d = -d
    d = max(-1, min(d, 1))
    omega = math.acos(d)
    if omega < 0.0000001:
        return q1
    s1 = math.sin((1 - t) * omega) / math.sin(omega)
    s2 = math.sin(t * omega) / math.sin(omega)
    return quaternion_add(quaternion_scale(q1, s1), quaternion_scale(q2, s2))
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `slerp` as the last function
in its "L54: quaternion interpolation" section.

### Mechanical Walkthrough

- `quaternion_dot(q1, q2)` — **(b) hard concept reappearing**, full
  treatment earlier in this lesson.
- `if d < 0: q2 = quaternion_scale(q2, -1); d = -d` — **(a) first
  appearance**, as a pattern: this is the fix for this lesson's own
  **double cover** problem, named in the Header above. A negative dot
  product means the angle between `q1` and `q2`, measured the ordinary
  way, is *more* than `90°` apart — but per the double-cover fact,
  `-q2` represents the exact same rotation as `q2` and might be much
  closer to `q1`. Negating `q2` here (and flipping the sign of `d` to
  match) chooses whichever of `q2`/`-q2` is actually nearer, so the rest
  of the formula always interpolates along the *shorter* path. This
  lesson's own closing demonstrates directly what happens when this
  check is skipped.
- `max(-1, min(d, 1))` — **(b) hard concept reappearing**, full
  treatment earlier in this lesson.
- `math.acos(d)` — **(b) hard concept reappearing**, full treatment
  earlier in this lesson. This is `omega` (Greek "ω," a conventional
  name for an angle) — the real angle between `q1` and (possibly
  negated) `q2`.
- `if omega < 0.0000001: return q1` — **(b) hard concept reappearing.**
  The same `nearly_equal`-style tolerance check Lesson 17 established,
  applied here as a guard: if `q1` and `q2` are (nearly) the same
  quaternion, `omega` is (nearly) zero, and the formula's own next two
  lines would divide by `math.sin(omega)` — itself (nearly) zero. This
  guard avoids that division entirely by returning `q1` directly, since
  there's effectively nothing to interpolate between.
- `math.sin((1 - t) * omega) / math.sin(omega)` — **(a) first
  appearance**, as a pattern: this is `slerp`'s own blend weight for
  `q1` — at `t = 0`, `(1 - t) = 1`, so this fraction becomes
  `sin(omega) / sin(omega) = 1`, weighting `q1` fully; as `t` grows
  toward `1`, `(1 - t) * omega` shrinks toward `0`, and this weight
  shrinks toward `0` too.
- `math.sin(t * omega) / math.sin(omega)` — **(a) first appearance**,
  the mirror-image weight for `q2`: `0` at `t = 0`, growing to `1` at
  `t = 1`. Together, these two weights are what makes `slerp` trace a
  constant-rate curve rather than a straight line — this lesson's own
  Real Verification proves that difference with real numbers, not just
  the formula's shape.
- `quaternion_add(quaternion_scale(q1, s1), quaternion_scale(q2, s2))`
  — **(b) hard concept reappearing**, both functions given full
  treatment earlier in this lesson.

### Real Verification

Confirm the two easiest, most checkable facts about `slerp` first: at
`t = 0` it should return exactly `q1`, and at `t = 1` it should return
exactly `q2`:

```python
q_identity = quaternion_from_axis_angle((0, 0, 1), 0)
q_90 = quaternion_from_axis_angle((0, 0, 1), 90)
print("slerp(t=0) =", slerp(q_identity, q_90, 0), " vs q_identity =", q_identity)
print("slerp(t=1) =", slerp(q_identity, q_90, 1), " vs q_90 =", q_90)
```

Real output:

```
slerp(t=0) = (1.0, 0.0, 0.0, 0.0)  vs q_identity = (1.0, 0.0, 0.0, 0.0)
slerp(t=1) = (0.7071067811865476, 0.0, 0.0, 0.7071067811865476)  vs q_90 = (0.7071067811865476, 0.0, 0.0, 0.7071067811865476)
```

Both endpoints match exactly. Now the sharper claim: `slerp` at
`t = 0.5`, halfway between a `0°` and a `90°` rotation about the same
axis, should give the exact same quaternion a direct `45°` rotation
would:

```python
mid = slerp(q_identity, q_90, 0.5)
q_45 = quaternion_from_axis_angle((0, 0, 1), 45)
print("slerp(t=0.5) =", mid)
print("q_45 direct  =", q_45)
```

Real output:

```
slerp(t=0.5) = (0.9238795325112868, 0.0, 0.0, 0.38268343236508984)
q_45 direct  = (0.9238795325112867, 0.0, 0.0, 0.3826834323650898)
```

Matching down to floating-point noise. `slerp` doesn't just produce
*some* plausible quaternion at the midpoint — it produces exactly the
quaternion a direct-angle construction would.

### SE Lens

The alternative not chosen here: **nlerp** (normalized linear
interpolation) — blend the four raw components directly with ordinary
weighted averaging, `(1 - t) * q1 + t * q2`, then renormalize the result
back to unit length. This is a real technique real systems use, not a
strawman — it's cheaper to compute than `slerp` (no `math.acos`,
`math.sin` calls needed) and, for two quaternions that are already close
together, the visible difference is small. The real tradeoff shows up
on a *wide* separation between the two orientations — compare both
methods interpolating from identity to a `150°` rotation, checking the
actual angle traveled at each even step of `t`:

```
slerp t= 0     angle from start = 0.0
slerp t= 0.25  angle from start = 37.5
slerp t= 0.5   angle from start = 75.0
slerp t= 0.75  angle from start = 112.5
slerp t= 1.0   angle from start = 150.0

nlerp t= 0     angle from start = 0.0
nlerp t= 0.25  angle from start = 33.02003034890686
nlerp t= 0.5   angle from start = 75.0
nlerp t= 0.75  angle from start = 116.97996965109316
nlerp t= 1.0   angle from start = 150.0
```

`slerp`'s own angle steps are perfectly even — exactly `37.5°` per
quarter-step, the **constant angular velocity** this lesson's own Terms
Introduced entry named directly. `nlerp` agrees at the endpoints and
exactly at the midpoint (by symmetry), but visibly speeds up in the
middle and slows near the ends — `33.02°` then `41.98°` then `41.98°`
then `33.02°` per quarter-step, not four equal `37.5°` steps. For a
game engine blending a camera's orientation every frame by a small `t`
step, that unevenness is often too small to notice and the speed
savings are worth it; for a single large interpolation — this exact
`150°` case — the uneven pacing becomes visible as a real animation
stutter. This curriculum builds `slerp`, not `nlerp`, because
correctness at any separation is the point being taught here; a real
production system might legitimately choose `nlerp` for its own
performance reasons, an honest tradeoff, not an error.

### Connecting Sentence

`slerp` is now verified correct on a same-axis case where the shorter
path was never in question — the closing below is where the
double-cover fix built into this unit's own first line actually gets
tested against a case where it matters.

---

## Closing

### Connect the Pieces

Trace the full constant-angular-velocity claim from this lesson's own
SE Lens end to end, on a wider, off-axis rotation — from identity to a
`150°` rotation around the diagonal axis `(1, 1, 0)` — confirming the
even spacing holds beyond the single-axis case already shown:

```python
q_big = quaternion_from_axis_angle((1, 1, 0), 150)
for t in [0, 0.25, 0.5, 0.75, 1.0]:
    s = slerp(q_identity, q_big, t)
    d = abs(quaternion_dot(q_identity, s))
    d = max(-1, min(d, 1))
    angle = math.degrees(2 * math.acos(d))
    print("slerp t=", t, " angle from start =", angle)
```

Real output:

```
slerp t= 0  angle from start = 0.0
slerp t= 0.25  angle from start = 37.500000000000036
slerp t= 0.5  angle from start = 75.0
slerp t= 0.75  angle from start = 112.50000000000001
slerp t= 1.0  angle from start = 150.0
```

Every step still exactly `37.5°`, on a genuinely non-principal axis this
time, not just the `z`-axis case shown earlier. Every piece this lesson
built — `quaternion_dot` measuring the angle, `math.acos` recovering it
safely, `slerp`'s own two `sin`-based weights — combines into a
provably even blend regardless of which axis is involved.

### What Breaks Without This

`slerp`'s own first real line — `if d < 0: q2 = quaternion_scale(q2,
-1); d = -d` — exists specifically to handle this lesson's own Header
term, **double cover**. Prove it's load-bearing by constructing a case
where it actually fires: a small, ordinary `20°` rotation around `x`,
and that *exact same rotation* expressed as its own negation (per the
double-cover fact, `q` and `-q` are the same rotation):

```python
q_small = quaternion_from_axis_angle((1, 0, 0), 20)
q_small_negated = quaternion_scale(q_small, -1)
p = (0, 1, 0)
print("rotate_by_quaternion(p, q_small) =", rotate_by_quaternion(p, q_small))
print("rotate_by_quaternion(p, q_small_negated) =", rotate_by_quaternion(p, q_small_negated))
```

Real output:

```
rotate_by_quaternion(p, q_small) = (0.0, 0.9396926207859083, 0.34202014332566866)
rotate_by_quaternion(p, q_small_negated) = (0.0, 0.9396926207859083, 0.34202014332566866)
```

Identical — confirming `q_small` and `q_small_negated` really are the
same rotation, exactly as the double-cover fact claims. Now build a
version of `slerp` with the double-cover fix removed, and interpolate
from identity to `q_small_negated` — the exact same target rotation as
`q_small`, just expressed the "wrong-signed" way:

```python
def slerp_no_fix(q1, q2, t):
    d = quaternion_dot(q1, q2)
    d = max(-1, min(d, 1))
    omega = math.acos(d)
    if omega < 0.0000001:
        return q1
    s1 = math.sin((1 - t) * omega) / math.sin(omega)
    s2 = math.sin(t * omega) / math.sin(omega)
    return quaternion_add(quaternion_scale(q1, s1), quaternion_scale(q2, s2))

mid_bad = slerp_no_fix(q_identity, q_small_negated, 0.5)
mid_good = slerp(q_identity, q_small_negated, 0.5)
expected = quaternion_from_axis_angle((1, 0, 0), 10)
print("no-fix slerp midpoint =", mid_bad)
print("real slerp midpoint   =", mid_good)
print("expected (10 deg about x) =", expected)
```

Real output:

```
no-fix slerp midpoint = (0.08715574274765814, -0.9961946980917435, 0.0, 0.0)
real slerp midpoint   = (0.9961946980917455, 0.08715574274765817, 0.0, 0.0)
expected (10 deg about x) = (0.9961946980917455, 0.08715574274765817, 0.0, 0.0)
```

`slerp_no_fix`'s own midpoint is nowhere close to the expected `10°`
result — converting its scalar part back to an angle
(`2 * math.acos(0.0871...)`) gives `170°`, not `10°`. The target
rotation was only `20°` away from identity, but the unfixed
interpolation traveled the *long way around* the 4D quaternion sphere
to get there — `170°` out of the `180°` maximum possible, almost the
worst case available. This is a real, verified, silently wrong result:
`slerp_no_fix` raises no error and returns a plausible-looking unit
quaternion, and nothing about calling it signals that the caller's own
`q2` happened to be double-cover-negated relative to `q1`. In a real
animation or motion-planning system, a rotation that should ease
smoothly through a small `20°` turn would instead be seen spinning
almost all the way around in the opposite direction first — the same
category of risk this curriculum has now shown repeatedly since Lesson
46 (a technically valid input producing a technically valid-looking,
substantively wrong output), here with the most visually dramatic
consequence of any instance so far.

### Exercises

- Confirm `slerp` still gives exactly even angular steps for a case
  where `q1` isn't the identity — pick two non-identity quaternions of
  your own choosing, on any axis, and check the angle between them at
  `t = 0.25`, `0.5`, and `0.75`.
- Using `quaternion_dot`, confirm directly that `q_small` and
  `q_small_negated` from this lesson's own closing have a dot product of
  `-1` with each other (not `+1`) despite representing the identical
  rotation — connecting the double-cover fact to the specific numeric
  signal `slerp`'s own `if d < 0` check watches for.
- Find a `(q1, q2)` pair where `nlerp` (this lesson's own SE Lens
  version) and `slerp` happen to agree exactly at `t = 0.25`, not just
  at the midpoint and endpoints — and explain, from the two methods'
  own formulas, why that particular pair is special.

### Definition of Done

- [ ] `quaternion_dot`, `quaternion_scale`, `quaternion_add`, and
      `slerp` all exist in `geometry_verified_library.py`.
- [ ] `slerp`'s endpoints (`t=0`, `t=1`) and its exact same-axis midpoint
      were all verified against direct quaternion construction, not
      just plausibility-checked.
- [ ] Constant angular velocity was verified with real angle
      measurements across five evenly spaced `t` values, on both a
      principal axis and a non-principal one.
- [ ] `math.acos`'s own domain crash was actually triggered and its real
      `ValueError` message shown, not just described as a risk.
- [ ] The double-cover failure was actually run with `slerp`'s own fix
      removed, and its wildly wrong angle (`170°` instead of `10°`)
      compared directly against the correct, fixed result.
- [ ] Commit with a message stating *why*: quaternions can now be
      smoothly blended, not just composed, closing out this
      curriculum's own back-to-back rotation-representation block
      (Lessons 47–54) — the commit message should note that Lesson 55
      moves on to rigid transformations (rotation combined with
      translation), the next real capability this block was building
      toward.
