# Lesson 16: Inverse Transformations

**What you will build:** A `table_to_fixture_matrix` that exactly undoes
Lesson 14's `fixture_to_table_matrix` — built not by any general-purpose
inversion procedure, but by exploiting one specific property Lesson 6's
basis vectors have secretly had all along. Proof of correctness comes two
ways: multiplying the original matrix by this new one produces the
identity matrix, and running a point through both matrices in sequence
returns it to exactly where it started. The transferable problem: every
transform this curriculum has built so far has run one direction only —
local coordinates into global ones. Real CAD/CAM work needs the reverse
just as often: a point already given in machine coordinates, and the
question of what fixture-space position produced it.

**What you need to know first:** Lesson 7's `dot_product` and its
perpendicularity test, Lesson 9's `norm` and `import math`, Lesson 14's
matrix representation and `apply_matrix`, and Lesson 15's `get_column` and
`multiply_matrices`, all reused unchanged.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–15.

**Terms introduced in this lesson:**

- **Orthonormal basis** — a basis whose vectors are each unit length
  (`norm` equal to `1`) and mutually perpendicular (`dot_product` equal to
  `0`). Why: this specific combination of properties is exactly what
  makes this lesson's inverse-building trick work; a basis missing either
  property breaks it, as this lesson's own closing section proves.
- **Identity matrix** — a matrix that, multiplied with any other matrix,
  leaves that matrix completely unchanged, the matrix equivalent of
  multiplying a number by `1`. Why: this lesson uses it as proof — if two
  matrices multiply together to produce the identity matrix, each one is
  confirmed to be the other's exact inverse.
- **Inverse transformation** — a matrix that exactly undoes another
  matrix's effect, so that applying one after the other returns any point
  to precisely where it started. Why: this is this lesson's whole
  purpose — recovering an original fixture-space point from one already
  converted into table coordinates.

**Objects and methods used:**

None. This lesson's code reuses Lessons 7, 9, 14, and 15's own
hand-authored functions (`dot_product`, `norm`, `dot3`, `apply_matrix`,
`get_column`, `multiply_matrices`) exactly as written, plus `math.sqrt`
via `norm`, which received its own full treatment in Lesson 9.

---

## Concept Unit: Orthonormal Basis — Checking a Property Lesson 6's Vectors Have Always Had

### The Problem

Building an inverse for `fixture_to_table_matrix` sounds like it should
require a general procedure that works on any matrix at all. It doesn't
have to, for this specific matrix — but taking the shortcut requires
first confirming a property its basis vectors actually have, rather than
assuming it.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–15.
- **Files affected:** `geometry_lesson_16.py` — created, as a new file for
  this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
fixture_x_axis_in_table = (0, 1)
fixture_y_axis_in_table = (-1, 0)
fixture_origin_in_table = (50, 20)

fixture_to_table_matrix = (
    (fixture_x_axis_in_table[0], fixture_y_axis_in_table[0], fixture_origin_in_table[0]),
    (fixture_x_axis_in_table[1], fixture_y_axis_in_table[1], fixture_origin_in_table[1]),
    (0, 0, 1),
)

print(fixture_to_table_matrix)


import math


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


print(norm(fixture_x_axis_in_table))
print(norm(fixture_y_axis_in_table))
print(dot_product(fixture_x_axis_in_table, fixture_y_axis_in_table))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* every construct in this block already received full
treatment earlier in the curriculum — the matrix literal (Lesson 14),
`dot_product` (Lesson 7), and `import math`/`norm` (Lesson 9, given a
full isolated lab there) are all retyped unchanged. No new Python
construct appears here, so no isolated throwaway lab is needed; what's
new is the *question* being asked of these already-familiar tools, not
any new syntax.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `fixture_x_axis_in_table = (0, 1)`, `fixture_y_axis_in_table = (-1,
  0)`, `fixture_origin_in_table = (50, 20)` — Lesson 14's own fixture
  values, retyped.
- `fixture_to_table_matrix = (...)` — Lesson 14's own matrix, rebuilt the
  same way from the same three values. No re-explanation owed, per the
  Repetition Rule.
- `print(fixture_to_table_matrix)` — already-basic.
- `import math`, `def dot_product(a, b): ...`, `def norm(v): ...` —
  Lesson 7 and Lesson 9's own code, retyped unchanged. No re-explanation
  owed for their mechanics, per the Repetition Rule.
- `print(norm(fixture_x_axis_in_table))`, `print(norm(fixture_y_axis_in_table))`
  — first appearance of actually *checking* whether this lesson's basis
  vectors are unit length, rather than assuming it. Both come out to
  exactly `1.0`.
- `print(dot_product(fixture_x_axis_in_table, fixture_y_axis_in_table))`
  — first appearance of checking perpendicularity for this specific
  basis, reusing Lesson 7's own sign-reading rule: a dot product of
  exactly `0` means perpendicular. It comes out to exactly `0`.
  Together, unit length on both vectors and a zero dot product between
  them is the property this lesson names an **orthonormal basis**.

### CS Lens

An orthonormal basis — one whose vectors are each unit length and
mutually perpendicular — is deliberately chosen, not a coincidence, in
systems well beyond this lesson's fixture example.

```
Also recognized in: computer graphics camera matrices (a camera's view
matrix is built from an orthonormal right/up/forward basis specifically
so its inverse is just its transpose, avoiding an expensive general
matrix inversion every single frame), rotation representations broadly
(quaternions and rotation matrices alike are constructed to stay
orthonormal, which is exactly what keeps a rotation reversible without
distorting anything it's applied to), and signal processing (the Fourier
basis used to decompose a signal into frequencies is chosen to be
orthonormal for the same reason — converting into it and back out of it
becomes a transpose instead of a costly general inverse)
```

### SE Lens

The design principle is **exploiting a known special-case property to
avoid a more expensive general computation**, rather than reaching for
the most general tool available by default. The alternative not chosen:
implement a fully general matrix-inversion procedure — Gaussian
elimination or cofactor expansion — that works correctly for any 3×3
matrix at all, orthonormal or not.

That alternative would handle every matrix this curriculum could ever
build, including Lesson 13's scaled and sheared ones. The real cost it
pays: a general inversion procedure is substantially more code, runs
slower, and can fail outright for some matrices (ones with no inverse at
all). The narrower approach this lesson takes — checking orthonormality
first, then using a much simpler trick — costs almost nothing to run and
is easy to verify correct, but only within the narrower case it actually
applies to, a real limitation this lesson's own closing section
demonstrates directly.

### Commands Needed

`python geometry_lesson_16.py` — same interpreter and command as every
prior lesson.

### Run It

```
((0, -1, 50), (1, 0, 20), (0, 0, 1))
1.0
1.0
0
```

Verified by actually running the file above. Both norms are exactly
`1.0`, and the dot product is exactly `0` — this basis is confirmed
orthonormal.

### Connection

`fixture_to_table_matrix`'s basis is now confirmed orthonormal. The next
unit uses that confirmed property to actually build the inverse.

---

## Concept Unit: The Transpose Trick — Building the Inverse Matrix

### The Problem

An orthonormal basis is now confirmed — but confirming a property isn't
the same as using it. Build `table_to_fixture_matrix`: a matrix that,
when it eventually gets applied to a table-space point, recovers the
fixture-space point that produced it.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_16.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(dot_product(...))` line added
  in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `fixture_x_axis_in_table`,
  `fixture_y_axis_in_table`, `fixture_origin_in_table`, and
  `dot_product`.

### The New Code

```python
table_to_fixture_matrix = (
    (fixture_x_axis_in_table[0], fixture_x_axis_in_table[1], -dot_product(fixture_x_axis_in_table, fixture_origin_in_table)),
    (fixture_y_axis_in_table[0], fixture_y_axis_in_table[1], -dot_product(fixture_y_axis_in_table, fixture_origin_in_table)),
    (0, 0, 1),
)

print(table_to_fixture_matrix)
```

### The Updated Project

```python
fixture_x_axis_in_table = (0, 1)
fixture_y_axis_in_table = (-1, 0)
fixture_origin_in_table = (50, 20)

fixture_to_table_matrix = (
    (fixture_x_axis_in_table[0], fixture_y_axis_in_table[0], fixture_origin_in_table[0]),
    (fixture_x_axis_in_table[1], fixture_y_axis_in_table[1], fixture_origin_in_table[1]),
    (0, 0, 1),
)

print(fixture_to_table_matrix)


import math


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


print(norm(fixture_x_axis_in_table))
print(norm(fixture_y_axis_in_table))
print(dot_product(fixture_x_axis_in_table, fixture_y_axis_in_table))


table_to_fixture_matrix = (                                              # ← new
    (fixture_x_axis_in_table[0], fixture_x_axis_in_table[1], -dot_product(fixture_x_axis_in_table, fixture_origin_in_table)),  # ← new
    (fixture_y_axis_in_table[0], fixture_y_axis_in_table[1], -dot_product(fixture_y_axis_in_table, fixture_origin_in_table)),  # ← new
    (0, 0, 1),                                                           # ← new
)                                                                         # ← new

print(table_to_fixture_matrix)                                           # ← new
```

The file now holds both directions of the same transform side by side:
`fixture_to_table_matrix` going one way, `table_to_fixture_matrix` going
the other.

*A note on method:* every expression in `table_to_fixture_matrix` uses
already-covered syntax — indexing, arithmetic negation, and
`dot_product`, itself reused unchanged from Lesson 7. No new Python
construct is introduced; what's new is the mathematical rule these
familiar pieces are arranged to compute, not any new syntax.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `table_to_fixture_matrix = (...)` — first appearance of this lesson's
  actual **inverse transformation**: a matrix built specifically to undo
  `fixture_to_table_matrix`.
- `(fixture_x_axis_in_table[0], fixture_x_axis_in_table[1], ...)` — this
  row's first two entries are `fixture_x_axis_in_table`'s own two
  components, `(0, 1)`, read straight across instead of down. Compare to
  `fixture_to_table_matrix`'s own construction: there,
  `fixture_x_axis_in_table` supplied one number to *each* of the first
  two rows (its `[0]` to row 0, its `[1]` to row 1) — a whole vector
  spread down a *column*. Here, the same vector's two numbers both land
  in the *same* row. This swap — what used to run down a column now
  runs across a row — is the **transpose** of the original basis, and
  it's specifically valid *because* Concept Unit 1 confirmed this basis
  is orthonormal: for an orthonormal basis, and only for one, the
  transpose of the basis is also its exact inverse.
- `-dot_product(fixture_x_axis_in_table, fixture_origin_in_table)` — the
  row's third entry. `dot_product` (Lesson 7's own function, reused
  unchanged) measures how much of the original origin, `(50, 20)`, lies
  along the x-axis direction — `20` — and the leading `-` negates it.
  This is the amount of "undo" needed along this axis to cancel the
  original translation back out, the same way any inverse operation has
  to reverse what the original one added.
- `(fixture_y_axis_in_table[0], fixture_y_axis_in_table[1],
  -dot_product(fixture_y_axis_in_table, fixture_origin_in_table))` — the
  identical pattern for the y-axis, already explained by the two bullets
  above.
- `(0, 0, 1)` — the same fixed third row every matrix in this curriculum
  has used since Lesson 14, unchanged.
- `print(table_to_fixture_matrix)` — already-basic.

### CS Lens

Building one operation specifically to reverse another — and proving the
reversal actually works rather than assuming it — is the general idea
behind every **inverse operation** worth trusting in software.

```
Also recognized in: cryptography (an encryption function and its
matching decryption function are built as an inverse pair — nothing
proves useful about encrypting data that can't later be decrypted back to
the original), undo/redo systems (a text editor's "undo" doesn't
reconstruct history from scratch; it applies the exact inverse of the
last recorded edit), and database migrations (a well-written migration
ships with a matching rollback — its own inverse — specifically so a bad
deployment can be reversed instead of only ever moved forward)
```

### SE Lens

The design principle is **deriving an inverse directly from a known
mathematical structure, rather than computing it by brute force**. The
alternative not chosen: solve for `table_to_fixture_matrix` numerically —
setting up and solving a system of equations for the nine unknown matrix
entries from scratch, without using the orthonormality shortcut at all.

That alternative would work for this matrix and also for matrices this
lesson's own shortcut can't handle. The real cost it pays: a numerical
solver is more code, harder to verify by hand, and slower to run than the
handful of transpose-and-negate expressions this unit actually used. The
tradeoff only holds up because Concept Unit 1 didn't skip confirming
orthonormality first — the entire savings this lesson banks depend on
that check actually having been true.

### Commands Needed

`python geometry_lesson_16.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
((0, -1, 50), (1, 0, 20), (0, 0, 1))
1.0
1.0
0
((0, 1, -20), (-1, 0, 50), (0, 0, 1))
```

Verified by actually running the updated file above.

### Connection

`table_to_fixture_matrix` now exists, built from a real, checked
property rather than guessed at — but nothing has confirmed it's
actually *correct* yet. The next unit proves it two different ways.

---

## Concept Unit: Proving the Inverse — Identity and Round-Trip

### The Problem

`table_to_fixture_matrix` was built by a rule, not verified against
anything yet. Prove it's genuinely the inverse of `fixture_to_table_matrix`
— not just plausible-looking — using two independent checks: multiplying
the two matrices together should produce the identity matrix, and running
a real point through both, forward then backward, should return it
exactly where it started.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_16.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(table_to_fixture_matrix)` line
  added in Concept Unit 2.
- **Dependencies:** Concept Unit 1's `fixture_to_table_matrix`, Concept
  Unit 2's `table_to_fixture_matrix`.

### The New Code

```python
def dot3(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def apply_matrix(matrix, point_h):
    row0_result = dot3(matrix[0], point_h)
    row1_result = dot3(matrix[1], point_h)
    row2_result = dot3(matrix[2], point_h)
    return (row0_result, row1_result, row2_result)


def get_column(matrix, col_index):
    return (matrix[0][col_index], matrix[1][col_index], matrix[2][col_index])


def multiply_matrices(a, b):
    b_col0 = get_column(b, 0)
    b_col1 = get_column(b, 1)
    b_col2 = get_column(b, 2)
    row0 = (dot3(a[0], b_col0), dot3(a[0], b_col1), dot3(a[0], b_col2))
    row1 = (dot3(a[1], b_col0), dot3(a[1], b_col1), dot3(a[1], b_col2))
    row2 = (dot3(a[2], b_col0), dot3(a[2], b_col1), dot3(a[2], b_col2))
    return (row0, row1, row2)


identity_matrix = multiply_matrices(fixture_to_table_matrix, table_to_fixture_matrix)
print(identity_matrix)

feature_in_fixture_h = (3, 4, 1)
feature_in_table_h = apply_matrix(fixture_to_table_matrix, feature_in_fixture_h)
recovered_feature_in_fixture_h = apply_matrix(table_to_fixture_matrix, feature_in_table_h)

print(feature_in_table_h)
print(recovered_feature_in_fixture_h)
```

### The Updated Project

```python
fixture_x_axis_in_table = (0, 1)
fixture_y_axis_in_table = (-1, 0)
fixture_origin_in_table = (50, 20)

fixture_to_table_matrix = (
    (fixture_x_axis_in_table[0], fixture_y_axis_in_table[0], fixture_origin_in_table[0]),
    (fixture_x_axis_in_table[1], fixture_y_axis_in_table[1], fixture_origin_in_table[1]),
    (0, 0, 1),
)

print(fixture_to_table_matrix)


import math


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


print(norm(fixture_x_axis_in_table))
print(norm(fixture_y_axis_in_table))
print(dot_product(fixture_x_axis_in_table, fixture_y_axis_in_table))


table_to_fixture_matrix = (
    (fixture_x_axis_in_table[0], fixture_x_axis_in_table[1], -dot_product(fixture_x_axis_in_table, fixture_origin_in_table)),
    (fixture_y_axis_in_table[0], fixture_y_axis_in_table[1], -dot_product(fixture_y_axis_in_table, fixture_origin_in_table)),
    (0, 0, 1),
)

print(table_to_fixture_matrix)


def dot3(a, b):                                                          # ← new
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]                       # ← new


def apply_matrix(matrix, point_h):                                       # ← new
    row0_result = dot3(matrix[0], point_h)                               # ← new
    row1_result = dot3(matrix[1], point_h)                               # ← new
    row2_result = dot3(matrix[2], point_h)                               # ← new
    return (row0_result, row1_result, row2_result)                       # ← new


def get_column(matrix, col_index):                                       # ← new
    return (matrix[0][col_index], matrix[1][col_index], matrix[2][col_index])  # ← new


def multiply_matrices(a, b):                                             # ← new
    b_col0 = get_column(b, 0)                                            # ← new
    b_col1 = get_column(b, 1)                                            # ← new
    b_col2 = get_column(b, 2)                                            # ← new
    row0 = (dot3(a[0], b_col0), dot3(a[0], b_col1), dot3(a[0], b_col2))  # ← new
    row1 = (dot3(a[1], b_col0), dot3(a[1], b_col1), dot3(a[1], b_col2))  # ← new
    row2 = (dot3(a[2], b_col0), dot3(a[2], b_col1), dot3(a[2], b_col2))  # ← new
    return (row0, row1, row2)                                            # ← new


identity_matrix = multiply_matrices(fixture_to_table_matrix, table_to_fixture_matrix)  # ← new
print(identity_matrix)                                                   # ← new

feature_in_fixture_h = (3, 4, 1)                                         # ← new
feature_in_table_h = apply_matrix(fixture_to_table_matrix, feature_in_fixture_h)  # ← new
recovered_feature_in_fixture_h = apply_matrix(table_to_fixture_matrix, feature_in_table_h)  # ← new

print(feature_in_table_h)                                                # ← new
print(recovered_feature_in_fixture_h)                                    # ← new
```

The file now builds both matrices, checks their product against the
identity matrix, and round-trips a real point through both directions —
every piece this lesson set out to prove.

*A note on method:* `dot3`, `apply_matrix`, `get_column`, and
`multiply_matrices` are Lesson 14 and 15's own functions, retyped
unchanged. No new Python construct appears in this unit at all.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def dot3(a, b): ...`, `def apply_matrix(matrix, point_h): ...`, `def
  get_column(matrix, col_index): ...`, `def multiply_matrices(a, b):
  ...` — Lesson 14 and 15's own functions, retyped unchanged. No
  re-explanation owed for their mechanics, per the Repetition Rule.
- `identity_matrix = multiply_matrices(fixture_to_table_matrix,
  table_to_fixture_matrix)` — first appearance of this lesson's actual
  proof: multiplying a matrix by its claimed inverse. If
  `table_to_fixture_matrix` really is the inverse, this must produce the
  **identity matrix** — a matrix that changes nothing it's multiplied
  against, the matrix equivalent of the number `1`.
- `print(identity_matrix)` — already-basic; the result, checked below in
  Run It, comes out to exactly `((1, 0, 0), (0, 1, 0), (0, 0, 1))` — the
  identity matrix, confirmed.
- `feature_in_fixture_h = (3, 4, 1)` — Lesson 14's own homogeneous point,
  retyped, reused as the concrete value this lesson's second proof
  travels through.
- `feature_in_table_h = apply_matrix(fixture_to_table_matrix,
  feature_in_fixture_h)` — the forward direction, already established
  since Lesson 14.
- `recovered_feature_in_fixture_h = apply_matrix(table_to_fixture_matrix,
  feature_in_table_h)` — first appearance of the **round-trip check**:
  running the forward result back through the newly built inverse. If
  `table_to_fixture_matrix` is correct, this must land exactly back on
  `feature_in_fixture_h`'s own original values.
- The two `print(...)` calls — already-basic.

### CS Lens

Checking a computed inverse two independent ways — an algebraic identity
check, and a concrete round-trip on real data — rather than trusting the
derivation alone, is the same discipline behind proving any computed
result trustworthy.

```
Also recognized in: automated test suites (a round-trip test —
serialize an object, then deserialize it, and check the result equals
the original — is exactly this lesson's round-trip check, applied to
data formats instead of coordinate frames), compiler correctness testing
(compiling and then decompiling, or optimizing and then checking
semantic equivalence, is the same round-trip idea applied to code), and
numerical linear algebra libraries (production code computing a matrix
inverse routinely checks `A @ A_inverse` against the identity matrix
before trusting the result, for exactly the reason this lesson just did)
```

### SE Lens

The design principle is **verifying a derived result independently of
the derivation that produced it**, rather than trusting a formula because
the algebra looks right. The alternative not chosen: build
`table_to_fixture_matrix` using the transpose trick and move on without
running either check in this unit.

That alternative would have saved these few lines of code. The real cost
it risks: Concept Unit 2's transpose trick depends entirely on
orthonormality actually holding — a fact Concept Unit 1 checked, but a
future lesson's basis, built differently, might not share. Without an
independent check, a mistaken assumption anywhere upstream — a basis
that's perpendicular but not unit length, say — would silently produce a
wrong `table_to_fixture_matrix` with nothing to catch it. This lesson's
own closing section shows exactly what that failure looks like.

### Commands Needed

`python geometry_lesson_16.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
((0, -1, 50), (1, 0, 20), (0, 0, 1))
1.0
1.0
0
((0, 1, -20), (-1, 0, 50), (0, 0, 1))
((1, 0, 0), (0, 1, 0), (0, 0, 1))
(46, 23, 1)
(3, 4, 1)
```

Verified by actually running the updated file above. `identity_matrix`
came out to exactly `((1, 0, 0), (0, 1, 0), (0, 0, 1))`, and
`recovered_feature_in_fixture_h` came out to exactly `(3, 4, 1)` —
matching `feature_in_fixture_h` from the very top of this unit, component
for component.

### Connection

Both proofs agree: `table_to_fixture_matrix` really is the exact inverse
of `fixture_to_table_matrix`. Connect the Pieces, below, traces the full
round trip start to finish.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `fixture_x_axis_in_table = (0, 1)`, `fixture_y_axis_in_table = (-1,
   0)` — confirmed, via `norm` and `dot_product`, to be orthonormal:
   both unit length, both perpendicular to each other.
2. That confirmed property justifies building `table_to_fixture_matrix =
   ((0, 1, -20), (-1, 0, 50), (0, 0, 1))` from
   `fixture_to_table_matrix`'s own basis and origin, using the transpose
   trick.
3. `multiply_matrices(fixture_to_table_matrix, table_to_fixture_matrix)`
   produces `((1, 0, 0), (0, 1, 0), (0, 0, 1))` — the identity matrix,
   the first proof that the trick worked.
4. `feature_in_fixture_h = (3, 4, 1)`, sent through
   `fixture_to_table_matrix`, becomes `feature_in_table_h = (46, 23, 1)`
   — Lesson 14's own already-verified forward result.
5. Sent back through `table_to_fixture_matrix`,
   `recovered_feature_in_fixture_h` comes out to `(3, 4, 1)` — identical
   to the value the whole trace started from, the second, independent
   proof that the inverse is correct.

## What Breaks Without This

Concept Unit 1 spent real effort confirming `fixture_to_table_matrix`'s
basis is orthonormal before trusting the transpose trick. Check what
happens when that check is skipped, and the same trick is applied anyway
to a basis that *isn't* orthonormal — Lesson 13's own `scaled` example,
whose axes are perpendicular but not unit length:

```python
def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def dot3(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def apply_matrix(matrix, point_h):
    row0_result = dot3(matrix[0], point_h)
    row1_result = dot3(matrix[1], point_h)
    row2_result = dot3(matrix[2], point_h)
    return (row0_result, row1_result, row2_result)


def get_column(matrix, col_index):
    return (matrix[0][col_index], matrix[1][col_index], matrix[2][col_index])


def multiply_matrices(a, b):
    b_col0 = get_column(b, 0)
    b_col1 = get_column(b, 1)
    b_col2 = get_column(b, 2)
    row0 = (dot3(a[0], b_col0), dot3(a[0], b_col1), dot3(a[0], b_col2))
    row1 = (dot3(a[1], b_col0), dot3(a[1], b_col1), dot3(a[1], b_col2))
    row2 = (dot3(a[2], b_col0), dot3(a[2], b_col1), dot3(a[2], b_col2))
    return (row0, row1, row2)


scale_x_axis = (2, 0)
scale_y_axis = (0, 2)
scale_origin = (0, 0)

scale_matrix = (
    (scale_x_axis[0], scale_y_axis[0], scale_origin[0]),
    (scale_x_axis[1], scale_y_axis[1], scale_origin[1]),
    (0, 0, 1),
)

naive_inverse = (
    (scale_x_axis[0], scale_x_axis[1], -dot_product(scale_x_axis, scale_origin)),
    (scale_y_axis[0], scale_y_axis[1], -dot_product(scale_y_axis, scale_origin)),
    (0, 0, 1),
)

should_be_identity = multiply_matrices(scale_matrix, naive_inverse)
print(should_be_identity)
```

```
((4, 0, 0), (0, 4, 0), (0, 0, 1))
```

Verified by actually running this. This doesn't crash, and it doesn't
raise any error — it silently produces `((4, 0, 0), (0, 4, 0), (0, 0,
1))`, a matrix that only *looks* like it might be the identity (zeros in
the right places) but plainly isn't (the diagonal reads `4`, not `1`).
Lesson 13's `scale_x_axis = (2, 0)` and `scale_y_axis = (0, 2)` are
perpendicular — `dot_product` on them comes out to `0` — but neither is
unit length (`norm` on either comes out to `2.0`, not `1.0`), so this
basis is only half of orthonormal. The transpose trick silently produces
a matrix that undoes the *rotation* part of a transform correctly but
leaves the scaling doubled instead of removed — applying `naive_inverse`
to a real scaled point would return a point twice as far from the origin
as the true original, with nothing to signal the mistake, exactly the
kind of error Concept Unit 3's round-trip check exists to catch before it
reaches real machine coordinates.

## Exercises

1. Fix the failure above: build a correct inverse for `scale_matrix` by
   first normalizing `scale_x_axis` and `scale_y_axis` to unit length
   (Lesson 10's `normalize`), then applying the same transpose trick.
   Verify it with both of this lesson's own proofs — the identity check
   and a round-trip on a real point.
2. Using `dot3` and `apply_matrix`, apply `table_to_fixture_matrix` to
   `fixture_to_table_matrix`'s own origin column, homogenized as `(50,
   20, 1)`. Predict, then verify, what point comes out, and explain in
   your own words why that specific answer makes sense for an origin
   being converted back to its own frame.
3. Using `multiply_matrices`, compute
   `multiply_matrices(table_to_fixture_matrix, fixture_to_table_matrix)`
   — the same two matrices as Concept Unit 3, in the opposite order.
   Predict, then verify, whether the result is still the identity matrix,
   and explain why or why not using what Lesson 15 already proved about
   matrix multiplication order.

## Definition of Done

- [ ] `geometry_lesson_16.py` exists and runs with no errors via `python
      geometry_lesson_16.py`.
- [ ] Running it prints `((0, -1, 50), (1, 0, 20), (0, 0, 1))`, `1.0`,
      `1.0`, `0`, `((0, 1, -20), (-1, 0, 50), (0, 0, 1))`, `((1, 0, 0),
      (0, 1, 0), (0, 0, 1))`, `(46, 23, 1)`, then `(3, 4, 1)` — matching
      this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, why the transpose of
      an orthonormal basis is also its inverse, using this lesson's own
      identity-matrix proof.
- [ ] You can explain why the same trick silently fails on a
      non-orthonormal basis, using this lesson's own verified `((4, 0,
      0), (0, 4, 0), (0, 0, 1))` result.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Build and verify an inverse transform using the orthonormal-basis transpose trick"`,
      not `git commit -m "add inverse matrix"`.

Next: Lesson 17 — Numerical Error in Geometry, which finally delivers on
the floating-point rounding behavior Lesson 10 first flagged
(`0.6000000000000001`, not a clean `0.6`) and this lesson's own `norm`
checks quietly depended on coming out clean.
