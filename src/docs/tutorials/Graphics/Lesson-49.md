# Lesson 49: Euler Angles

**What you will build:** `euler_to_matrix(yaw_z, pitch_y, roll_x)` — a
single function that turns three ordinary numbers into one composed 3×3
rotation matrix, built entirely from Lesson 48's `multiply_matrices` and
`rotation_matrix_z`/`rotation_matrix_x`/`rotation_matrix_y`, with no new
Python construct anywhere in it. The transferable problem: a rotation
matrix has nine numbers, most of which can't be typed in freely — five
of the nine are fully determined by the other four (a rotation matrix's
rows and columns each have to stay length-1 and stay perpendicular to
each other), so no CAD/CAM operator or robot-arm controller hands a
machine nine raw numbers directly. Three angles — yaw, pitch, roll — are
what a human actually specifies; this lesson builds the function that
turns those three numbers into the real matrix Lesson 48 already knows
how to apply. Its closing puts a name on the exact danger Lesson 48's
own closing already proved was real: three angles alone don't specify a
rotation at all unless the *order* they're applied in is also fixed and
agreed upon — the same three numbers, composed in a different order,
land somewhere else entirely.

**What you need to know first:** Lesson 48's `rotation_matrix_z`,
`rotation_matrix_x`, `rotation_matrix_y`, and `multiply_matrices` — in
particular its own confirmed fact that `multiply_matrices(A, B)` applied
to a point matches nested call `A(B(point))`, `B` first. Lesson 48's own
closing proof that different-axis rotations don't commute — this
lesson's entire subject depends on taking that seriously rather than
treating axis order as incidental.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–48.

**Terms introduced in this lesson:**

- **Euler angles** — a rotation represented as three ordinary numbers
  (commonly called yaw, pitch, and roll) instead of nine matrix entries,
  each number naming a rotation around one principal axis, applied in
  some fixed, agreed-upon order. They exist because a human operator —
  dialing in a 5-axis mill's tool-head orientation, or a drone's target
  attitude — thinks and types in terms of "tilt it forward 20°, then
  swing it left 30°," not in terms of nine interdependent matrix
  entries; Euler angles are the translation layer between that natural
  human input and the matrix Lesson 48 already knows how to use.
- **rotation convention** — the specific, fixed choice of *which* axis
  each of the three Euler angles rotates around and in *what order*
  they're applied (this lesson uses yaw around `z`, then pitch around
  `y`, then roll around `x` — commonly written **ZYX**, naming the
  order the rotations are applied in, right to left, matching this
  lesson's own `multiply_matrices` nesting). It exists as a named,
  separate thing from the three numbers themselves because — as this
  lesson's own closing verifies directly — the identical three numbers
  produce a different final orientation under a different convention;
  the numbers alone are meaningless without stating which convention
  they're numbers *for*.

**Objects and methods used:**

None new. `rotation_matrix_z`, `rotation_matrix_x`, `rotation_matrix_y`,
and `multiply_matrices` are all real, external-to-this-lesson project
code, already given full first-appearance treatment in Lesson 48 —
reused here completely unchanged, per the Repetition Rule.

---

## Concept Unit: Composing Three Rotations Into One Matrix

### The Problem

Lesson 48 proved that two rotation matrices compose correctly via
`multiply_matrices`, in an order that matches nested function calls.
Representing a full 3D orientation — not just "spin around one axis,"
but any orientation a rigid object could end up in — needs *three*
rotations composed together, one around each principal axis, because a
single-axis rotation can only ever tilt an object within one plane.
Lesson 48 never composed three matrices at once; the open question is
whether chaining `multiply_matrices` a second time behaves the way a
reader would expect from the two-matrix case already proven.

### Project Change

- **Reference Source:** No reference counterpart — the ZYX convention
  chosen here is a standard, widely-used one (shared with aerospace
  yaw/pitch/roll and much of robotics), but this specific function is a
  from-scratch composition of already-built project code, not ported
  from any single reference implementation.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py` (new
  section appended after Lesson 48's rotation matrices).
- **Change type:** add.
- **Location:** new section, `# ── L49: Euler angles ──`.
- **Dependencies:** `rotation_matrix_z`, `rotation_matrix_y`,
  `rotation_matrix_x`, `multiply_matrices` (all Lesson 48).

### The New Code

```python
def euler_to_matrix(yaw_z, pitch_y, roll_x):
    rz = rotation_matrix_z(yaw_z)
    ry = rotation_matrix_y(pitch_y)
    rx = rotation_matrix_x(roll_x)
    return multiply_matrices(rz, multiply_matrices(ry, rx))
```

### The Updated Project

A brand-new, freestanding function — nothing surrounding it yet to show
it placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `euler_to_matrix` directly
after Lesson 48's `rotation_matrix_y`.

### Mechanical Walkthrough

- `rotation_matrix_z(yaw_z)`, `rotation_matrix_y(pitch_y)`,
  `rotation_matrix_x(roll_x)` — **(b) hard concept reappearing.** Full
  first-appearance treatment already given in Lesson 48; three separate
  calls, one per axis, each building its own already-verified matrix.
- `multiply_matrices(ry, rx)` — **(b) hard concept reappearing**, same
  function Lesson 48 verified, applied here to the innermost pair first:
  per Lesson 48's own confirmed rule (`multiply_matrices(A, B)` applies
  `B` first), this composed matrix represents "roll around `x`, then
  pitch around `y`."
- `multiply_matrices(rz, multiply_matrices(ry, rx))` — **(a) first
  appearance**, not as new syntax (it's the same function called twice)
  but as a new *pattern*: chaining three matrices through two nested
  `multiply_matrices` calls. Reading outward from the innermost call per
  Lesson 48's own rule: `rx` applies first (roll), then `ry` (pitch),
  then — because the whole `multiply_matrices(ry, rx)` result is itself
  the *second* argument to the outer call — `rz` applies last (yaw).
  This fixes the order this lesson's own Terms Introduced named as the
  **ZYX convention**: roll, then pitch, then yaw, read right to left in
  the code exactly as written.

### Real Verification

Confirm `euler_to_matrix` matches the equivalent nested single-axis
calls — not for one convenient angle triple, but across several,
including three cases that isolate a single axis at a time (only yaw,
only pitch, only roll) and two that combine all three at once:

```python
p = (2, -1, 7)
test_triples = [(0, 0, 0), (90, 0, 0), (0, 90, 0), (0, 0, 90), (30, 20, 10), (-45, 60, 15)]
for (yaw, pitch, roll) in test_triples:
    via_matrix = apply_matrix(euler_to_matrix(yaw, pitch, roll), p)
    via_nested = rotate_z(rotate_y(rotate_x(p, roll), pitch), yaw)
    print((yaw, pitch, roll), "->", via_matrix, "vs", via_nested)
```

Real output:

```
(0, 0, 0) -> (2.0, -1.0, 7.0) vs (2.0, -1.0, 7.0)
(90, 0, 0) -> (1.0000000000000002, 2.0, 7.0) vs (1.0000000000000002, 2.0, 7.0)
(0, 90, 0) -> (7.0, -1.0, -1.9999999999999996) vs (7.0, -1.0, -1.9999999999999996)
(0, 0, 90) -> (2.0, -7.0, -0.9999999999999996) vs (2.0, -7.0, -0.9999999999999996)
(30, 20, 10) -> (4.718221117817177, 0.18332668018060347, 5.630699850970391) vs (4.718221117817177, 0.18332668018060327, 5.630699850970391)
(-45, 60, 15) -> (2.7250559736176707, -6.65325920389318, 1.5192800618916023) vs (2.7250559736176703, -6.653259203893179, 1.5192800618916023)
```

All six cases match `rotate_z(rotate_y(rotate_x(p, roll), pitch), yaw)`
down to floating-point noise in the last couple of digits
(`nearly_equal`-scale, consistent with every prior lesson's own
floating-point results, not a real discrepancy). The `(90, 0, 0)` row —
only yaw, pitch and roll both zero — reproduces exactly what plain
`rotate_z(p, 90)` alone would give, since `rotation_matrix_y(0)` and
`rotation_matrix_x(0)` are both the identity matrix and contribute
nothing; the same holds for the `(0, 90, 0)` and `(0, 0, 90)` rows,
isolating pitch and roll the same way. This confirms `euler_to_matrix`
doesn't just *look* like it composes three rotations — it collapses
correctly to a single-axis case whenever the other two angles are zero,
the same "extension is free" pattern this curriculum has now confirmed
repeatedly since Lesson 46.

### CS Lens

Composing several simple, already-proven transformations into one
combined transformation — rather than writing a brand-new function that
directly computes "rotate by yaw, pitch, and roll all at once" from
scratch — is the same **pipeline composition** idea this curriculum
first named all the way back in Lesson 12's `transform_to_global`
(itself built from smaller pieces, not written as one monolithic
formula):

```
Also recognized in: Unix pipe chains (cmd1 | cmd2 | cmd3), a
compiler's Lexer → Parser → AST stages, function composition in any
language, a CNC post-processor's own successive coordinate transforms
from part space to machine space
```

### SE Lens

The alternative not chosen: write one large closed-form function that
computes a ZYX Euler rotation matrix directly from three sine/cosine
products, the way many textbooks and libraries actually implement it,
instead of composing three already-built matrices via two
`multiply_matrices` calls. The closed form is marginally faster (no
intermediate matrix ever gets built), but it means re-deriving,
re-verifying, and re-trusting a nine-entry formula from scratch, with no
connection to Lesson 48's already-proven `rotation_matrix_z`/`_x`/`_y`.
Composing the three already-verified pieces costs a small amount of
avoidable arithmetic (building and discarding one intermediate matrix)
in exchange for every line of `euler_to_matrix` being something this
curriculum already trusts completely — the real tradeoff is reuse and
traceability against a constant-factor performance cost that doesn't
matter at the scale this curriculum's own examples ever run at.

### Connecting Sentence

Three angles now produce one working rotation matrix, in one specific,
fixed order — the next question, foreshadowed since Lesson 48's own
closing, is what happens to that matrix if the very same three numbers
are composed in a *different* order instead.

---

## Closing

### Connect the Pieces

Trace the full chain this lesson built, end to end, on one concrete
input: `(2, -1, 7)`, rotated by a yaw of `40°` with pitch and roll left
at `0`, should reduce to nothing more than Lesson 47's own plain
`rotate_z`, since a zero pitch and roll contribute the identity in both
of `euler_to_matrix`'s other two factors:

```python
only_yaw = apply_matrix(euler_to_matrix(40, 0, 0), p)
just_rotate_z = rotate_z(p, 40)
print(only_yaw, "vs", just_rotate_z)
```

Real output:

```
(2.1748764959244955, 0.5195307762541005, 7.0) vs (2.1748764959244955, 0.5195307762541005, 7)
```

Matching, down to the trailing `.0` on the `z` component (a `float`
where the plain formula kept an untouched `int` — the value is
identical). Every function this lesson built — `euler_to_matrix`
composing three Lesson 48 matrices — collapses back to a single Lesson
47 formula call the moment the other two angles are zero, closing the
loop from this curriculum's very first rotation formula through to a
full three-angle orientation.

### What Breaks Without This

Lesson 48's own closing proved that composing `rotate_z` then
`rotate_x` is not the same as composing `rotate_x` then `rotate_z`.
`euler_to_matrix`'s own **Terms Introduced** entry above names why that
matters here specifically: "Euler angles," as three bare numbers with no
stated convention, are ambiguous. Prove it directly — take the identical
three numbers, `(30, 20, 10)`, and compose them two different ways: this
lesson's own fixed ZYX order (`rz` outermost, applied last), against an
XYZ order built the same way but with the roles reversed (`rx`
outermost, applied last):

```python
def euler_to_matrix_xyz_order(x_angle, y_angle, z_angle):
    rx = rotation_matrix_x(x_angle)
    ry = rotation_matrix_y(y_angle)
    rz = rotation_matrix_z(z_angle)
    return multiply_matrices(rx, multiply_matrices(ry, rz))

zyx_result = apply_matrix(euler_to_matrix(30, 20, 10), p)
xyz_result = apply_matrix(euler_to_matrix_xyz_order(30, 20, 10), p)
print("ZYX order, angles (30,20,10):", zyx_result)
print("XYZ order, angles (30,20,10):", xyz_result)
```

Real output:

```
ZYX order, angles (30,20,10): (4.718221117817177, 0.18332668018060347, 5.630699850970391)
XYZ order, angles (30,20,10): (4.408150071242862, -3.474505562201845, 4.742997369557568)
```

Two genuinely different points — not floating-point noise, a real
difference in every component — from the identical three input numbers.
A CAD/CAM program that receives "yaw 30, pitch 20, roll 10" from one
source and applies it under a different assumed convention than the
source intended will run without error and produce a plausible-looking,
confidently wrong orientation, exactly the same silent-failure shape as
Lesson 48's own closing. This is why this lesson's Terms Introduced
section treats "Euler angles" and "rotation convention" as two separate
things: the three numbers alone are not a complete specification of a
rotation; the convention is a required fourth piece of information, not
an implementation detail. A related, sharper problem lives inside this
same ZYX scheme even once the convention is fixed and agreed upon — a
specific pitch angle where two of the three angles stop being
independently meaningful at all — and that failure is Lesson 50's own
subject (Gimbal Lock), not covered here.

### Exercises

- Confirm `euler_to_matrix(0, 40, 0)` (pitch only) reduces to plain
  `rotate_y(p, 40)`, the same way this lesson's own "Connect the Pieces"
  section confirmed the yaw-only case.
- Pick your own three nonzero angles and confirm
  `apply_matrix(euler_to_matrix(yaw, pitch, roll), p)` matches
  `rotate_z(rotate_y(rotate_x(p, roll), pitch), yaw)` for a point of
  your own choosing — the same check this lesson's own Real Verification
  ran, on inputs you pick yourself.
- Using `euler_to_matrix_xyz_order` from this lesson's own closing, find
  a nonzero angle triple (other than all-zero, which trivially agrees
  under any convention) where ZYX and XYZ happen to produce the *same*
  result despite the differing order — and explain, from what each
  matrix's columns represent, why that specific triple is special.

### Definition of Done

- [ ] `euler_to_matrix` exists in `geometry_verified_library.py`,
      verified against nested single-axis calls across at least one
      case isolating each of the three axes individually, plus at least
      two combined-angle cases.
- [ ] The zero-pitch-and-roll collapse to plain `rotate_z` was run and
      confirmed for real, not assumed from the identity-matrix argument
      alone.
- [ ] The ZYX-vs-XYZ ambiguity was run on the identical `(30, 20, 10)`
      input and confirmed to produce two genuinely different results.
- [ ] Commit with a message stating *why*: three human-friendly angles
      can now produce a full rotation matrix, but only once a specific
      order is fixed and stated — and the commit message should flag
      that a sharper, order-independent failure mode (gimbal lock)
      still hasn't been covered, so Lesson 50's starting point is
      honest about what's still open.
