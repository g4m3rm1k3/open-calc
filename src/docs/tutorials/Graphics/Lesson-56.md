# Lesson 56: SE(2) and SE(3)

**What you will build:** `invert_rigid_transform` — a real function
that undoes any rigid transform Lesson 55's `build_rigid_transform`
produces — plus real, run verification of the four properties that make
rigid transforms trustworthy to compose at all: that composing two of
them always gives back a third one (not something else), that a
"do-nothing" transform exists, that grouping composed transforms
doesn't matter, and that every transform can be undone. Together, these
four properties are what mathematicians call a **group**, and the
specific group Lesson 14–16's 2D matrices and Lesson 55's 3D matrices
both belong to has a real name — **SE(2)** and **SE(3)**, the Special
Euclidean groups. The transferable problem: this curriculum has been
building and composing rigid transforms since Lesson 14 without ever
naming what guarantees that composing them keeps working — this lesson
names it, and finds the one guarantee (invertibility) that Lesson 55
never actually built.

**What you need to know first:** Lesson 55's `build_rigid_transform`,
`apply_matrix4`, `multiply_matrices4`. Lesson 16's own matrix-inverse-
via-transpose trick — reused here directly on the rotation block of a
rigid transform. Lesson 48's own rigid-transformation/isometry
definition (distance- and angle-preserving) — this lesson's own closure
check reuses that property directly. Lesson 53's own confirmed
associativity of quaternion composition, cited here as the same
property already shown to hold for this curriculum's matrix
multiplication in general.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–55.

**Terms introduced in this lesson:**

- **group** — a set of things, together with a way to combine any two of
  them, that satisfies four specific properties: **closure** (combining
  two members always gives back another member of the same set, never
  something outside it), **associativity** (grouping three or more
  combined members never changes the result — Lesson 53's own already-
  confirmed property, for a different group), an **identity** element
  (something that combines with any member and leaves it unchanged), and
  every member having an **inverse** (something that combines with it to
  produce the identity). It exists as a term here because these four
  properties, together, are exactly what guarantees that composing
  transforms — the operation this curriculum has used freely since
  Lesson 14 — never produces a surprise: no composed result ever falls
  outside the well-understood set of rigid transforms, and every
  transform, however built, can always be undone.
- **SE(2)** and **SE(3)** — the **Special Euclidean group** of rigid
  transformations in 2D and 3D respectively: every possible combination
  of a rotation and a translation, together with matrix multiplication
  as the way to combine two of them. They exist as specific, named
  instances of the general "group" idea above — Lesson 14–16's own 3×3
  homogeneous matrices were always elements of SE(2), and Lesson 55's
  4×4 matrices were always elements of SE(3), even before this lesson
  gave either one its formal name.

**Objects and methods used:**

None new.

---

## Concept Unit: A Group — Four Properties That Make Composition Trustworthy

### The Problem

Lesson 55 built `multiply_matrices4` to compose two rigid transforms and
confirmed, on one specific example, that it matched applying them one
after another. That's evidence the function *works*, but it isn't proof
that composing rigid transforms is *always* well-behaved — that
composing two of them can never accidentally produce something that
isn't a rigid transform at all, or that every transform this curriculum
has ever built can genuinely be undone. This unit checks three of the
four properties a **group** requires directly, using tools this
curriculum already has; the fourth — inverses — turns out not to be
available yet at all.

### Project Change

- **Reference Source:** No reference counterpart — this unit verifies
  mathematical properties of already-existing code (Lesson 55's own
  functions) rather than adding new project code.
- **Files affected:** none — verification only.
- **Change type:** N/A.
- **Location:** N/A.
- **Dependencies:** `build_rigid_transform`, `apply_matrix4`,
  `multiply_matrices4` (Lesson 55).

### The New Code

```python
T1 = build_rigid_transform(rotation_matrix_z(30), (1, 2, 3))
T2 = build_rigid_transform(rotation_matrix_z(60), (4, 5, 6))
composed = multiply_matrices4(T1, T2)
print("composed bottom row =", composed[3])
```

### Real Output

Running the print above:

```
composed bottom row = (0.0, 0.0, 0, 1)
```

`composed`'s own bottom row is still `(0, 0, 0, 1)` — the exact shape
Lesson 55's own `build_rigid_transform` always produces, and the
`0`s here are only `float` versions of the same integer `0`s that shape
requires (the tiny formatting difference is not a numeric discrepancy).
This is **closure**: combining two rigid transforms produced something
that still has the right shape to be a rigid transform, not some other
kind of matrix.

Closure needs one more check: does `composed` still behave like a rigid
transform, not merely look like one? Lesson 48's own definition of a
rigid transformation — distance-preserving — is the real test:

```python
p = (2, -1, 7)
p2 = (5, 5, 5)
q1 = apply_matrix4(T1, to_homogeneous_3d(p))
q1b = apply_matrix4(T1, to_homogeneous_3d(p2))
d_before = math.sqrt(sum((p[i] - p2[i]) ** 2 for i in range(3)))
d_after = math.sqrt(sum((q1[i] - q1b[i]) ** 2 for i in range(3)))
print("distance before:", d_before, " after applying T1 to both points:", d_after)
```

Real output:

```
distance before: 7.0  after applying T1 to both points: 7.0
```

Unchanged — `T1` genuinely preserved the distance between two points,
confirming it's a real rigid transform, not just shaped like one.

Now the **identity** property — a "do-nothing" transform, built from no
rotation at all and zero translation:

```python
identity_r = ((1, 0, 0), (0, 1, 0), (0, 0, 1))
T_identity = build_rigid_transform(identity_r, (0, 0, 0))
result = apply_matrix4(T_identity, to_homogeneous_3d(p))
print("T_identity applied to p =", result, " vs p =", p)
```

Real output:

```
T_identity applied to p = (2, -1, 7, 1)  vs p = (2, -1, 7)
```

Matching exactly (aside from the trailing homogeneous `1`, unstripped
per Lesson 14's own established convention) — `T_identity` genuinely
leaves any point unchanged.

**Associativity** — the third property — needs no new check here at
all: Lesson 53 already confirmed it directly for quaternion
composition, and the underlying reason is the same one that makes
ordinary matrix multiplication associative in general, a property this
curriculum's own `multiply_matrices`/`multiply_matrices4` inherit for
free from being built on plain row/column dot products. Citing it here,
by name, per the Repetition Rule, rather than re-deriving it — a hard
concept reappearing, not a new one.

### Connecting Sentence

Three of the four group properties are already true of this
curriculum's rigid transforms, confirmed with real numbers rather than
assumed. The fourth — every transform having an inverse — is not
automatic, and nothing built so far actually provides it.

---

## Concept Unit: The Inverse — `invert_rigid_transform`

### The Problem

`build_rigid_transform` can construct a rigid transform from any
rotation and any translation, but nothing so far can take an *existing*
transform and produce the one that undoes it. Without that, the fourth
group property — every element has an inverse — is only a claim, not a
demonstrated fact.

### Project Change

- **Reference Source:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`, the
  matrix-inverse-via-transpose trick from Lesson 16 — reused here
  directly, per the Repetition Rule, on the rotation block of a rigid
  transform specifically.
- **Files affected:**
  `src/docs/tutorials/Graphics/geometry_verified_library.py`.
- **Change type:** add.
- **Location:** new section, `# ── L56: SE(2)/SE(3) ──`, appended after
  Lesson 55's `multiply_matrices4`.
- **Dependencies:** `apply_matrix`, `scale_vector_3d` (Lesson 46),
  `build_rigid_transform` (Lesson 55).

### The New Code

```python
def transpose3(matrix):
    return (
        (matrix[0][0], matrix[1][0], matrix[2][0]),
        (matrix[0][1], matrix[1][1], matrix[2][1]),
        (matrix[0][2], matrix[1][2], matrix[2][2]),
    )


def invert_rigid_transform(transform):
    rotation = (
        (transform[0][0], transform[0][1], transform[0][2]),
        (transform[1][0], transform[1][1], transform[1][2]),
        (transform[2][0], transform[2][1], transform[2][2]),
    )
    translation = (transform[0][3], transform[1][3], transform[2][3])
    rotation_inverse = transpose3(rotation)
    negated_translation = scale_vector_3d(translation, -1)
    translation_inverse = apply_matrix(rotation_inverse, negated_translation)
    return build_rigid_transform(rotation_inverse, translation_inverse)
```

### The Updated Project

Both brand-new, freestanding functions — nothing surrounding them yet
to show placed inside, per the schema's own stated exception.
`geometry_verified_library.py` now carries `transpose3` and
`invert_rigid_transform` in its new "L56: SE(2)/SE(3)" section.

### Mechanical Walkthrough

- `(matrix[0][0], matrix[1][0], matrix[2][0])` (and the two rows beneath
  it) — **(b) hard concept reappearing.** This is Lesson 16's own
  transpose trick, restated in code for the first time in this
  curriculum's own persisted library — flip rows into columns. A real
  rotation matrix's inverse equals its own transpose (rotation matrices
  are **orthogonal** — each row and column is already a unit vector,
  and every row is perpendicular to every other row), which is why this
  trick works at all instead of needing a general, more expensive
  matrix-inversion procedure.
- `rotation = (...)`, `translation = (...)` — **(b) hard concept
  reappearing** (Lesson 55's own `build_rigid_transform`, read in
  reverse — pulling the rotation block and translation column back out
  of an already-assembled 4×4 matrix).
- `rotation_inverse = transpose3(rotation)` — **(c) already basic** once
  `transpose3` itself has been explained above.
- `negated_translation = scale_vector_3d(translation, -1)` — **(b) hard
  concept reappearing** (Lesson 46).
- `translation_inverse = apply_matrix(rotation_inverse, negated_translation)`
  — **(a) first appearance**, as a pattern worth real explanation, not
  just a description: the inverse translation is **not** simply
  `-translation`. It's the *negated* translation, rotated by the
  inverse rotation. This matters because undoing `T = [R | t]`, applied
  as `R·p + t`, means solving `p = R⁻¹·(q − t)` for a point `q` that
  came out of the forward transform — expanding that gives
  `p = R⁻¹·q + (−R⁻¹·t)`, so the inverse transform's own translation
  column has to be `−R⁻¹·t`, not `−t` alone. This lesson's own closing
  demonstrates directly what goes wrong when that distinction is
  skipped.
- `build_rigid_transform(rotation_inverse, translation_inverse)` —
  **(b) hard concept reappearing** (Lesson 55).

### Connecting Sentence

`invert_rigid_transform` now exists — the closing below confirms it
actually undoes a real transform, completing all four group properties
with real numbers, and then shows exactly what goes wrong with the
simpler-looking but incorrect shortcut this unit's own walkthrough
already named.

---

## Closing

### Connect the Pieces

Build a real rigid transform, apply it to a point, then apply its
inverse to the result — a full round trip should return the exact
original point, and composing the transform with its own inverse via
`multiply_matrices4` should produce the identity matrix directly, no
point required at all:

```python
T = build_rigid_transform(rotation_matrix_z(40), (10, -5, 8))
T_inv = invert_rigid_transform(T)
p3 = (3, 4, 5)
forward = apply_matrix4(T, to_homogeneous_3d(p3))
back = apply_matrix4(T_inv, forward)
print("forward =", forward)
print("back    =", back, " vs original p3 =", p3)

roundtrip = multiply_matrices4(T_inv, T)
for row in roundtrip:
    print("  ", row)
```

Real output:

```
forward = (9.726982890610778, -0.0074593984644701905, 13, 1)
back    = (3.0, 3.9999999999999982, 5.0, 1.0)  vs original p3 = (3, 4, 5)
   (0.9999999999999999, 0.0, 0.0, 0.0)
   (0.0, 0.9999999999999999, 0.0, 0.0)
   (0.0, 0.0, 1, 0)
   (0.0, 0.0, 0, 1)
```

`back` matches `p3` down to floating-point noise, and `T_inv * T` is —
within that same noise — exactly the identity matrix built earlier in
this lesson. All four group properties are now confirmed with real
numbers on real transforms: closure, identity, associativity (cited
from Lesson 53), and now inverse — SE(3) genuinely is a group, not just
a name attached to a pile of useful matrices.

### What Breaks Without This

This lesson's own Mechanical Walkthrough already named the risk: using
`−translation` directly, instead of the *rotated* negated translation
`−R⁻¹·translation`, looks like a reasonable shortcut — it's shorter code
and doesn't require calling `apply_matrix` at all. Build it and test it
against the same round trip that just worked correctly:

```python
def invert_rigid_transform_WRONG(transform):
    rotation = (
        (transform[0][0], transform[0][1], transform[0][2]),
        (transform[1][0], transform[1][1], transform[1][2]),
        (transform[2][0], transform[2][1], transform[2][2]),
    )
    translation = (transform[0][3], transform[1][3], transform[2][3])
    rotation_inverse = transpose3(rotation)
    translation_wrong = scale_vector_3d(translation, -1)
    return build_rigid_transform(rotation_inverse, translation_wrong)

T_inv_wrong = invert_rigid_transform_WRONG(T)
back_wrong = apply_matrix4(T_inv_wrong, forward)
print("back (wrong inverse) =", back_wrong, " vs original p3 =", p3)
```

Real output:

```
back (wrong inverse) = (-2.553493617242916, -1.2580983124602838, 5.0, 1.0)  vs original p3 = (3, 4, 5)
```

Nowhere close to `(3, 4, 5)` — not floating-point noise, a genuinely
different point. `invert_rigid_transform_WRONG` runs without error and
returns a plausible-looking rigid transform (its own bottom row is
still `(0, 0, 0, 1)`, and its rotation block is still a valid inverse
rotation) — it's only the *composition* of that rotation with the
wrong translation that fails, and nothing about the function's own
output signals the mistake. This is a real, verified instance of a
group axiom actually mattering in practice, not just as abstract
vocabulary: `invert_rigid_transform_WRONG` produces *some* rigid
transform, satisfying closure, but not the specific one that undoes
`T` — the group's own inverse axiom demands the *correct* inverse, and
"some transform that looks like an inverse" isn't good enough.

### Exercises

- Confirm `invert_rigid_transform` also correctly undoes a transform
  built from `rotation_matrix_x` or `rotation_matrix_y` (Lesson 48),
  not just `rotation_matrix_z` — pick your own rotation, translation,
  and point.
- Confirm `multiply_matrices4(T, T_inv)` (the reverse order from this
  lesson's own `T_inv * T`) is *also* the identity matrix — a rigid
  transform and its own inverse should undo each other regardless of
  which one is composed first, unlike the general order-sensitivity
  Lesson 48 and Lesson 53 both already established for two *different*
  rotations.
- Using `invert_rigid_transform_WRONG` from this lesson's own closing,
  find a specific transform (if one exists) where the wrong and correct
  inverses happen to agree — and explain, from the formula's own shape,
  why that case is special.

### Definition of Done

- [ ] `transpose3` and `invert_rigid_transform` both exist in
      `geometry_verified_library.py`.
- [ ] Closure was verified two ways: the composed matrix's own shape
      (bottom row) and the distance-preservation property from Lesson
      48, not just one or the other.
- [ ] The identity and inverse properties were both verified with a real
      point round-tripping back to itself, and the inverse was also
      confirmed by composing `T_inv * T` directly into the identity
      matrix.
- [ ] The wrong-inverse failure (using `−translation` instead of
      `−R⁻¹·translation`) was actually run and its distorted result
      compared against the correct round trip, not just described.
- [ ] Commit with a message stating *why*: this curriculum's own rigid
      transforms, used freely since Lesson 14, are now confirmed to form
      a genuine group (SE(2) in 2D, SE(3) in 3D) — and the commit
      message should name Lesson 57 (Transformation Hierarchies) as
      where chains of these transforms get organized and reasoned about
      systematically.
