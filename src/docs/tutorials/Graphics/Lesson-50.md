# Lesson 50: Gimbal Lock

**What you will build:** `is_near_gimbal_lock(pitch_degrees,
tolerance_degrees)` — a small guard function a real control system
could call before trusting yaw and roll as two independent inputs. The
real subject of this lesson isn't that function, though; it's proving,
with real numbers, something Lesson 49's own closing explicitly deferred
here by name: at one specific pitch angle, Lesson 49's `euler_to_matrix`
genuinely loses one of its three degrees of freedom — infinitely many
different `(yaw, roll)` pairs collapse onto the *identical* rotation
matrix, not an inconvenient numerical coincidence but a real structural
fact about this representation. The transferable problem: three numbers
that *look* like three independent controls can silently stop being
independent at a boundary of their own input range, and nothing about
calling `euler_to_matrix` with those three numbers signals that the
boundary has been crossed.

**What you need to know first:** Lesson 49's `euler_to_matrix` and its
ZYX convention (roll first, then pitch, then yaw). Lesson 48's own
proof that a matrix's columns are exactly where it sends the standard
basis vectors — this lesson's explanation of *why* the lock happens
reuses that proof directly, on `rotation_matrix_y(90)` specifically.
Lesson 17's `nearly_equal`. Lesson 19's `if`/`elif`/`else`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–49.

**Terms introduced in this lesson:**

- **degree of freedom** — one independent way a system can change,
  countable separately from the others: a point on a 2D plane has two
  (it can move along `x` and, separately, along `y`); a rigid 3D
  orientation has three. It exists as a term here because Lesson 49's
  own three Euler angles were built on the assumption that each of the
  three numbers is one such independent way to change the final
  orientation — and this lesson's whole subject is a real, verified
  case where that assumption fails, not everywhere, but at one specific
  input.
- **gimbal lock** — the situation where two of a system's inputs, which
  are independent everywhere else, stop being independent at one
  specific configuration, so that changing either one alone produces
  the same net effect. The name comes from a real physical mechanism: a
  gimbal is a ring that lets a mounted object rotate freely around one
  axis while sitting inside another ring doing the same around a
  different axis; if two of the (commonly three) nested rings' axes
  ever swing into alignment, rotating either ring produces the same
  physical motion, and one whole ring becomes redundant until the
  mechanism is moved back out of that configuration. Apollo-era
  spacecraft guidance computers tracked this condition directly and
  warned the crew when their vehicle's attitude approached it, because
  losing a degree of freedom in the actual navigation math was a real
  operational risk, not just a textbook curiosity.

**Objects and methods used:**

None new. `abs` reappears from Lesson 17's own `nearly_equal`, unchanged
— no new Objects/methods entry owed per the Repetition Rule.

---

## Concept Unit: Two Angles, One Effective Knob

### The Problem

Lesson 49's `euler_to_matrix(yaw_z, pitch_y, roll_x)` takes three
numbers and treats them as three separate inputs. If that's genuinely
true everywhere, then changing `yaw` alone, with `pitch` and `roll` held
fixed, should always produce a different result than leaving `yaw`
alone and changing `roll` instead — the two inputs shouldn't be able to
substitute for each other. Test that assumption directly at one
specific pitch value, `90°`, by picking several very different `(yaw,
roll)` pairs that all share one property — the same difference,
`yaw - roll` — and checking whether the resulting matrices actually
differ the way three independent inputs should guarantee.

### Project Change

- **Reference Source:** No reference counterpart — this unit verifies
  existing project code (`euler_to_matrix`, Lesson 49) against a new
  category of input, rather than adding new project code of its own.
- **Files affected:** none — this unit is a verification, not a new
  function.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** `euler_to_matrix` (Lesson 49), `apply_matrix`
  (Lesson 14), `nearly_equal` (Lesson 17).

### The New Code

```python
p = (2, -1, 7)
base_yaw, base_roll = 20, 35
shifts = [0, 10, -15, 40, -40]
for d in shifts:
    yaw = base_yaw + d
    roll = base_roll + d
    m = euler_to_matrix(yaw, 90, roll)
    print("d =", d, " yaw =", yaw, " roll =", roll,
          " (yaw - roll =", yaw - roll, ") -> apply to p:", apply_matrix(m, p))
```

### Real Output

Running the loop above, at a fixed pitch of `90°`, for five completely
different `(yaw, roll)` pairs that all share the same difference
(`yaw - roll = -15` in every row):

```
d = 0  yaw = 20  roll = 35  (yaw - roll = -15) -> apply to p: (6.502661738920957, -2.7776591420067134, -1.9999999999999996)
d = 10  yaw = 30  roll = 45  (yaw - roll = -15) -> apply to p: (6.502661738920957, -2.7776591420067143, -1.9999999999999998)
d = -15  yaw = 5  roll = 20  (yaw - roll = -15) -> apply to p: (6.502661738920958, -2.777659142006714, -1.9999999999999996)
d = 40  yaw = 60  roll = 75  (yaw - roll = -15) -> apply to p: (6.502661738920957, -2.7776591420067143, -2.0)
d = -40  yaw = -20  roll = -5  (yaw - roll = -15) -> apply to p: (6.502661738920958, -2.777659142006714, -1.9999999999999996)
```

Five genuinely different `(yaw, roll)` pairs — `20`/`35`, `30`/`45`,
`5`/`20`, `60`/`75`, `-20`/`-5` — none of them close to each other as
numbers, and every single one produces the identical transformed point,
down to the last few bits of floating-point noise. Compare this against
Lesson 49's own closing, run the same way but at `pitch = 45°` instead
of `90°`: there, the identical five `(yaw, roll)` pairs (with the same
`yaw - roll = -15` relationship) produce five genuinely *different*
points, confirming this isn't some general property of shifting `yaw`
and `roll` together — it's specific to `pitch = 90°`. At that one input,
`yaw` and `roll` have stopped being two independent degrees of freedom
and collapsed into one: only their difference, `yaw - roll`, still
affects the result at all.

### Connecting Sentence

The numbers prove the lock is real; the next unit explains *why* it
happens specifically at `pitch = 90°`, using a proof this curriculum
already has in hand from Lesson 48.

---

## Concept Unit: Why — Roll's Axis and Yaw's Axis Coincide at This Pitch

### The Problem

Lesson 48 proved that a matrix's columns are exactly where it sends the
standard basis vectors. `euler_to_matrix`'s ZYX order applies roll
(around `x`) first, then pitch (around `y`), then yaw (around `z`).
Roll's own rotation axis is the *original* `x`-axis — but by the time
yaw runs, the `90°` pitch in between has already moved everything. If
that `90°` pitch happens to carry the original `x`-axis onto the same
line the fixed `z`-axis already sits on, roll and yaw would end up
turning the object around the *same physical line*, one right after the
other — which is exactly the condition under which two angles stop
being independent.

### Project Change

- **Reference Source:** No reference counterpart — this unit reuses
  Lesson 48's own columns-are-basis-images proof, applied to a new
  specific case (`rotation_matrix_y(90)`), rather than adding new
  project code.
- **Files affected:** none — verification only.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** `rotation_matrix_y`, `apply_matrix` (Lesson 48).

### The New Code

```python
print("rotation_matrix_y(90) =", rotation_matrix_y(90))
print("apply_matrix(rotation_matrix_y(90), (1, 0, 0)) =", apply_matrix(rotation_matrix_y(90), (1, 0, 0)))
print("apply_matrix(rotation_matrix_y(90), (0, 0, 1)) =", apply_matrix(rotation_matrix_y(90), (0, 0, 1)))
```

### Real Output

Running the three prints above gives:

```
rotation_matrix_y(90) = (6.123233995736766e-17, 0, 1.0), (0, 1, 0), (-1.0, 0, 6.123233995736766e-17)
apply_matrix(rotation_matrix_y(90), (1, 0, 0)) = (6.123233995736766e-17, 0, -1.0)
apply_matrix(rotation_matrix_y(90), (0, 0, 1)) = (1.0, 0, 6.123233995736766e-17)
```

Rounding away the trailing floating-point noise: a `90°` pitch sends the
original `x`-axis to `(0, 0, -1)` — the *negative* `z`-axis — and sends
the original `z`-axis to `(1, 0, 0)` — back onto the original `x`-axis.
This is the mechanism, made concrete: roll rotates around `x` *before*
the pitch runs, but by the time yaw runs *after* the pitch, that same
physical line the roll rotation used has been carried onto the `z`-axis
— the exact line yaw always rotates around, pitch or no pitch. Roll and
yaw, at this one pitch value, are turning the object around the same
physical axis from two different points in the sequence — which is
precisely why only their difference (as Concept Unit 1 just measured)
ends up mattering: two rotations around one shared axis just add their
angles together (the same same-axis commutativity Lesson 48 already
proved), collapsing what looked like two separate controls into one.

### CS Lens

This is the mechanical version of a **rank-deficient** transformation —
a system that, on paper, has three independent inputs but, at a specific
point, can only actually produce as much variety in its output as two
inputs would. Recognized well beyond rotation specifically:

```
Also recognized in: a robot arm losing a degree of freedom when two
joint axes align (a real, named problem in robotics kinematics), a
camera crane's pan/tilt/roll rig at full tilt, singular matrices in
linear algebra generally (a matrix that can't be inverted because its
rows or columns have become dependent on each other), the "hairy ball
theorem" in topology (no way to comb a sphere's tangent vectors flat
everywhere without at least one bald spot) — the same underlying fact
this lesson's own closing names directly: no 3-number scheme for 3D
rotation can avoid a singularity like this one entirely.
```

### Connecting Sentence

Knowing exactly which pitch causes the lock, and why, makes it possible
to build something practical: a function that checks whether a given
pitch is dangerously close to that value before a caller trusts yaw and
roll as independent.

---

## Concept Unit: A Practical Guard — `is_near_gimbal_lock`

### The Problem

`euler_to_matrix` itself has no way to warn a caller that the `pitch`
value they're about to pass in sits at, or dangerously near, the one
configuration where `yaw` and `roll` stop behaving independently. A
real control system — a 5-axis mill's tool-head controller, a drone's
flight computer — needs to be able to ask, in advance, "is this pitch
value safe to treat `yaw` and `roll` as independent?"

### Project Change

- **Reference Source:** No reference counterpart — a small, from-scratch
  guard function; the threshold check it performs is this lesson's own
  finding, not ported from any external source.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 49's `euler_to_matrix`).
- **Change type:** add.
- **Location:** new section, `# ── L50: gimbal lock detection ──`.
- **Dependencies:** none beyond plain Python — `abs` (Lesson 17),
  `if`/`elif`/`else` (Lesson 19).

### The New Code

```python
def is_near_gimbal_lock(pitch_degrees, tolerance_degrees):
    distance_from_positive_90 = abs(pitch_degrees - 90)
    distance_from_negative_90 = abs(pitch_degrees - (-90))
    if distance_from_positive_90 < tolerance_degrees:
        return True
    if distance_from_negative_90 < tolerance_degrees:
        return True
    return False
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `is_near_gimbal_lock`
directly after Lesson 49's `euler_to_matrix`.

### Mechanical Walkthrough

- `abs(pitch_degrees - 90)` — **(b) hard concept reappearing.**
  `abs`'s own full first-appearance treatment is Lesson 17's
  `nearly_equal` (`abs(a - b) < tolerance`); this is the identical
  "distance between two numbers, direction-independent" idea, applied
  here to distance from a specific angle instead of distance between two
  computed values.
- `distance_from_positive_90`, `distance_from_negative_90` — **(c)
  already basic.** Plain variable assignment.
- `if distance_from_positive_90 < tolerance_degrees:` /
  `if distance_from_negative_90 < tolerance_degrees:` — **(b) hard
  concept reappearing.** The two-guard-clause shape Lesson 19 already
  established (this curriculum has never used `and`/`or`, per the
  judgment call recorded in this handoff — two separate `if`s here,
  rather than one combined condition, continues that pattern rather than
  introducing a boolean operator casually).
- `return True` / `return False` — **(c) already basic.**

Note this function only checks proximity to `+90°` and `-90°`
specifically — Lesson 49's ZYX convention locks at those two pitch
values, not at any pitch in general; a different convention (Lesson
49's own closing mentioned XYZ as one alternative) locks at a different
angle entirely, and this function would need different thresholds to
guard it. This is an honestly disclosed scope boundary, not a bug: this
function guards the one convention this curriculum actually built.

### Real Verification

```python
print(is_near_gimbal_lock(89.999, 0.01))
print(is_near_gimbal_lock(45, 0.01))
print(is_near_gimbal_lock(-89.5, 1))
print(is_near_gimbal_lock(0, 5))
```

Real output:

```
True
False
True
False
```

`89.999°`, within `0.01°` of the lock at `90°`, correctly flags as near.
`45°` — nowhere near either `±90°` — correctly does not. `-89.5°`,
within `1°` of `-90°`, correctly flags. `0°`, safely in the middle of
the input range, correctly does not — confirming the function checks
*both* lock points independently rather than only the positive one.

### Connecting Sentence

A guard now exists that can warn before the lock is reached; the
closing below shows the concrete, practical cost of not checking it —
not at the exact locked angle, but in the danger zone approaching it.

---

## Closing

### Connect the Pieces

Trace one concrete change through the whole chain this lesson built.
At the exact locked pitch, adding `12°` to `yaw` alone, with `roll`
fixed, should produce the *same* final point as leaving `yaw` fixed and
subtracting `12°` from `roll` alone — the practical, control-level
statement of Concept Unit 1's own `yaw - roll` finding:

```python
d = 12
m_yaw_bump = euler_to_matrix(base_yaw + d, 90, base_roll)
m_roll_bump = euler_to_matrix(base_yaw, 90, base_roll - d)
print("yaw += 12, roll unchanged:", apply_matrix(m_yaw_bump, p))
print("yaw unchanged, roll -= 12:", apply_matrix(m_roll_bump, p))
```

Real output:

```
yaw += 12, roll unchanged: (6.938070787039072, -1.3649812284551806, -1.9999999999999996)
yaw unchanged, roll -= 12: (6.938070787039074, -1.3649812284551812, -1.9999999999999996)
```

Identical. Two operators, each turning a different physical knob by a
different amount in a different direction, produce the exact same
resulting orientation — this is Concept Unit 1's own numeric finding,
Concept Unit 2's own mechanical explanation, and `is_near_gimbal_lock`'s
own reason to exist, all confirmed on the same concrete input.

### What Breaks Without This

The lock isn't only a knife-edge problem at exactly `90.000...°` —
approaching it is already dangerous, and `is_near_gimbal_lock` exists
specifically to catch the approach, not just the exact point. Confirm
the two controls are already becoming hard to tell apart *near* the
lock, not just at it — bump `yaw` alone at `pitch = 89.999°`, a value a
real control loop could easily pass through without ever hitting `90°`
exactly:

```python
near_yaw_bump = apply_matrix(euler_to_matrix(base_yaw + 10, 89.999, base_roll), p)
near_base = apply_matrix(euler_to_matrix(base_yaw, 89.999, base_roll), p)
print("pitch=89.999, yaw+10:", near_yaw_bump)
print("pitch=89.999, base:  ", near_base)
```

Real output:

```
pitch=89.999, yaw+10: (6.886237373203278, -1.6062674444258271, -1.9999099321909821)
pitch=89.999, base:   (6.502694539642748, -2.777647203520319, -1.9999099321909821)
```

At `89.999°` the two rows are no longer identical the way they were at
exactly `90°` — the lock's own exact collapse only happens at the exact
angle — but a control system relying on `yaw` and `roll` as two cleanly
separate, equally-responsive inputs is already in trouble well before
reaching `90°` exactly: as pitch approaches the lock, a fixed-size
change in `yaw` and an equal-and-opposite fixed-size change in `roll`
produce results that converge toward each other, meaning a caller
trying to use one control to correct for an unwanted change in the
other finds it working less and less effectively the closer it gets —
without any error, exception, or warning from `euler_to_matrix` itself.
This is exactly why `is_near_gimbal_lock` checks a *tolerance band*
around `±90°`, not just equality with `90°` — a real system needs
advance warning before the exact singular point, not a check that only
fires once it's too late to matter. This isn't a bug specific to this
lesson's `euler_to_matrix` — no fix is proposed here, and none is
possible while staying inside a plain 3-angle representation: this is
an honestly disclosed structural limit of Euler angles themselves,
recorded here as the CS Lens above already named it. Lesson 51
(Axis-Angle Representation) and Lessons 52–54 (Quaternions) are where
this curriculum builds a rotation representation that doesn't have this
particular singularity at all — that citation is a promise this handoff
now carries forward for those lessons to keep.

### Exercises

- Confirm the same lock exists at `pitch = -90°`, not just `+90°`: pick
  your own `(yaw, roll)` pair, shift both by the same amount `d`, and
  confirm the resulting matrix stays fixed the same way Concept Unit 1
  demonstrated at `+90°`.
- Using `is_near_gimbal_lock`, find the largest `tolerance_degrees`
  value (to the nearest whole degree) where `is_near_gimbal_lock(80,
  tolerance_degrees)` is still `False` — confirming exactly where your
  chosen tolerance band begins.
- Confirm `is_near_gimbal_lock` correctly reports `False` at `pitch =
  180°` — a pitch value that isn't near `±90°` at all, even though it's
  far outside the ordinary `[-90, 90]` range a real system would
  typically expect pitch to stay within.

### Definition of Done

- [ ] `is_near_gimbal_lock` exists in `geometry_verified_library.py`,
      verified against at least four real cases: near `+90°`, near
      `-90°`, and two safely-away cases.
- [ ] The exact-lock invariant (`yaw - roll` constant at `pitch = 90°`
      produces identical matrices) was run across at least five distinct
      `(yaw, roll)` pairs, and the same shifts at `pitch = 45°` were run
      to confirm the lock is specific to `90°`, not a general property.
- [ ] The mechanical explanation (`rotation_matrix_y(90)` sending the
      original `x`-axis onto the `z`-axis) was run and confirmed, not
      just asserted from the algebra alone.
- [ ] The near-lock (not exact) degradation at `pitch = 89.999°` was run
      and its numbers actually compared, not just described.
- [ ] Commit with a message stating *why*: this lesson found and
      diagnosed a real structural limit of the ZYX Euler representation
      built in Lesson 49, added a practical guard against it, and
      explicitly did not fix the underlying limit — the commit message
      should say so honestly, and should name Lesson 51/52–54 as where
      this curriculum's own real fix lives.
