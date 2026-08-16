# Lesson 46: 3D Coordinate Frames

**What you will build:** `add_vector_to_point_3d`, `subtract_points_3d`,
and `scale_vector_3d` — Lesson 2 and 3's own operations, extended from
two components to three — plus `from_components_3d`, building a point
from a 3D coordinate frame's origin and *three* basis vectors instead of
two. Along the way, this lesson proves something Section I's own
judgment call only ever assumed: every 2D scenario this curriculum has
built is exactly a 3D one with its third component fixed at `0` — not
an approximation, a literal special case, confirmed by running the
identical 2D numbers through the new 3D machinery. The transferable
problem: Section I stayed in 2D throughout, on purpose, because 3D
wasn't needed yet. Section III starts by proving that choice cost
nothing to reverse — every 2D function this curriculum built extends to
3D by adding one more component, using the identical pattern each time,
not new mathematics.

**What you need to know first:** Lesson 2's `add_vector_to_point` and
`subtract_points`, Lesson 3's `scale_vector`, Lesson 6's
`from_components`, and Lesson 14's `dot3` — already a 3-component dot
product, built originally for homogeneous 2D coordinates, and reusable
here completely unchanged for genuine 3D vectors.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–45.

**Terms introduced in this lesson:**

None. Every idea in this lesson — points, vectors, basis vectors,
coordinate frames — was already introduced in Section I; the only change
is one more component on each tuple. Per the Repetition Rule, this
lesson's own functions are genuine first appearances (different
signatures, one more parameter each), but the *concepts* behind them
owe no new Terms entry.

**Objects and methods used:**

None. Every function in this lesson is hand-authored project code,
extending Lesson 2, 3, 6, and 14's own patterns to three components.

---

## Concept Unit: From Two Components to Three — Extending Point and Vector Operations

### The Problem

Every point and vector this curriculum has built since Lesson 2 has had
exactly two components. A 3D point or vector needs a third — and the
question this unit answers first is whether that requires new
mathematics, or just one more number in the same already-familiar
pattern.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–45.
- **Files affected:** `geometry_lesson_46.py` — created, as a new file
  for this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def add_vector_to_point_3d(point, vector):
    return (point[0] + vector[0], point[1] + vector[1], point[2] + vector[2])


def subtract_points_3d(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def scale_vector_3d(vector, factor):
    return (vector[0] * factor, vector[1] * factor, vector[2] * factor)


machine_origin = (0, 0, 0)
tool_position = (3, 4, 5)

offset = subtract_points_3d(tool_position, machine_origin)
doubled = scale_vector_3d(offset, 2)
new_position = add_vector_to_point_3d(machine_origin, offset)

print(offset)
print(doubled)
print(new_position)
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* tuple construction, indexing, and arithmetic are all
already-basic, established since Lesson 2. No new Python construct
appears here, so no isolated throwaway lab is needed; what's new is the
tuple's own length, not any syntax.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def add_vector_to_point_3d(point, vector): ...` — a **hard concept
  reappearing**: Lesson 2's own `add_vector_to_point`, restated with a
  third `[2]` term added to the same componentwise-addition pattern. No
  new reasoning owed for *why* this works — the same "add matching
  components" idea Lesson 2 already fully explained, just with one more
  component to add.
- `def subtract_points_3d(a, b): ...` — the identical restatement of
  Lesson 2's own `subtract_points`.
- `def scale_vector_3d(vector, factor): ...` — the identical restatement
  of Lesson 3's own `scale_vector`.
- `machine_origin = (0, 0, 0)`, `tool_position = (3, 4, 5)` — first
  appearance of an actual 3-component point in this curriculum's project
  code: a CNC machine's own origin, and a tool position offset from it
  in all three physical axes.
- `offset = subtract_points_3d(tool_position, machine_origin)` —
  already-basic reuse; prints `(3, 4, 5)`.
- `doubled = scale_vector_3d(offset, 2)` — already-basic reuse; prints
  `(6, 8, 10)`.
- `new_position = add_vector_to_point_3d(machine_origin, offset)` —
  already-basic reuse; prints `(3, 4, 5)`, recovering `tool_position`
  exactly — the same round-trip Lesson 2's own 2D version already proved,
  now confirmed in 3D.

### CS Lens

Extending an already-proven pattern by adding one more dimension to its
own data, without changing the pattern itself, is a specific instance of
**generalization** worth naming directly — not every dimensional
extension is this clean, and recognizing when it genuinely is matters.

```
Also recognized in: array programming and tensor libraries (NumPy's own
elementwise operations work identically whether an array has 2, 3, or 100
dimensions, for the exact same reason this lesson's functions extend
cleanly — the underlying operation is defined per-component, regardless
of how many components there are), physics simulation code (a particle
system's own position-update logic is usually written once and works
unchanged whether the simulation is 2D or 3D), and database schema design
(adding one more column to an existing table, without touching any
query that doesn't reference it, is the same "extend without disrupting"
property this lesson's own functions exhibit)
```

### SE Lens

The design principle is **recognizing when a dimensional extension is
genuinely free**, rather than assuming every 2D-to-3D jump requires new
design work. The alternative not chosen: treat 3D points and vectors as
an entirely new kind of object, with their own from-scratch design
process, rather than a direct extension of the 2D ones.

That alternative would be the right call if 3D geometry actually behaved
differently in some fundamental way — and Lesson 47 onward will show
real cases where it does (rotation, in particular, is genuinely harder
in 3D than in 2D). This lesson's own three functions are not one of
those cases: componentwise addition, subtraction, and scaling mean
exactly the same thing regardless of how many components there are, and
pretending otherwise would just be duplicated design work for no real
benefit.

### Commands Needed

`python geometry_lesson_46.py` — same interpreter and command as every
prior lesson.

### Run It

```
(3, 4, 5)
(6, 8, 10)
(3, 4, 5)
```

Verified by actually running the file above.

### Connection

Point and vector arithmetic extend to 3D with zero new ideas. The next
unit checks whether the same is true for a whole coordinate frame.

---

## Concept Unit: A Third Basis Vector — 3D Frames, and Why 2D Was z = 0 All Along

### The Problem

Lesson 6's own coordinate frame needed an origin and two basis vectors.
A 3D frame needs a third — and this unit checks something more specific
than just "does this extend cleanly": whether every 2D result this
curriculum has already verified is *literally* a 3D result with a zero
third component, not merely analogous to one.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_46.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(new_position)` line added in
  Concept Unit 1.
- **Dependencies:** Concept Unit 1's `add_vector_to_point_3d`,
  `scale_vector_3d`.

### The New Code

```python
def dot3(a, b):
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]


def from_components_3d(x_amount, y_amount, z_amount, x_axis, y_axis, z_axis):
    along_x = scale_vector_3d(x_axis, x_amount)
    along_y = scale_vector_3d(y_axis, y_amount)
    along_z = scale_vector_3d(z_axis, z_amount)
    return add_vector_to_point_3d(add_vector_to_point_3d(along_x, along_y), along_z)


standard_x = (1, 0, 0)
standard_y = (0, 1, 0)
standard_z = (0, 0, 1)

print(from_components_3d(3, 4, 5, standard_x, standard_y, standard_z))

tilted_x = (0, 1, 0)
tilted_y = (-1, 0, 0)
tilted_z = (0, 0, 1)

print(from_components_3d(3, 4, 0, tilted_x, tilted_y, tilted_z))
print(from_components_3d(3, 4, 2, tilted_x, tilted_y, tilted_z))

print(dot3(tilted_x, tilted_y))
print(dot3(tilted_x, tilted_z))
print(dot3(tilted_y, tilted_z))
print(dot3(tilted_x, tilted_x))
```

### The Updated Project

```python
def add_vector_to_point_3d(point, vector):
    return (point[0] + vector[0], point[1] + vector[1], point[2] + vector[2])


def subtract_points_3d(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def scale_vector_3d(vector, factor):
    return (vector[0] * factor, vector[1] * factor, vector[2] * factor)


machine_origin = (0, 0, 0)
tool_position = (3, 4, 5)

offset = subtract_points_3d(tool_position, machine_origin)
doubled = scale_vector_3d(offset, 2)
new_position = add_vector_to_point_3d(machine_origin, offset)

print(offset)
print(doubled)
print(new_position)


def dot3(a, b):                                                          # ← new
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]                      # ← new


def from_components_3d(x_amount, y_amount, z_amount, x_axis, y_axis, z_axis):  # ← new
    along_x = scale_vector_3d(x_axis, x_amount)                          # ← new
    along_y = scale_vector_3d(y_axis, y_amount)                          # ← new
    along_z = scale_vector_3d(z_axis, z_amount)                          # ← new
    return add_vector_to_point_3d(add_vector_to_point_3d(along_x, along_y), along_z)  # ← new


standard_x = (1, 0, 0)                                                   # ← new
standard_y = (0, 1, 0)                                                   # ← new
standard_z = (0, 0, 1)                                                   # ← new

print(from_components_3d(3, 4, 5, standard_x, standard_y, standard_z))   # ← new

tilted_x = (0, 1, 0)                                                     # ← new
tilted_y = (-1, 0, 0)                                                    # ← new
tilted_z = (0, 0, 1)                                                     # ← new

print(from_components_3d(3, 4, 0, tilted_x, tilted_y, tilted_z))         # ← new
print(from_components_3d(3, 4, 2, tilted_x, tilted_y, tilted_z))         # ← new

print(dot3(tilted_x, tilted_y))                                          # ← new
print(dot3(tilted_x, tilted_z))                                          # ← new
print(dot3(tilted_y, tilted_z))                                          # ← new
print(dot3(tilted_x, tilted_x))                                          # ← new
```

The file now builds real 3D coordinate frames, and directly tests
whether 2D was ever a genuinely separate case.

*A note on method:* `dot3` is Lesson 14's own function, retyped
unchanged — the first true reuse in this lesson of something built for a
different original purpose (homogeneous 2D coordinates) that turns out
to already be exactly what real 3D geometry needs. No new Python
construct is introduced anywhere in this unit.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def dot3(a, b): ...` — Lesson 14's own function, retyped unchanged.
  No re-explanation owed, per the Repetition Rule — and worth noting
  directly: this function was never actually "about" homogeneous
  coordinates specifically; it was always just a 3-component dot
  product, which is exactly what a genuine 3D dot product is.
- `def from_components_3d(...): ...` — a hard concept reappearing:
  Lesson 6's own `from_components`, restated with a third basis vector
  and amount added to the identical pattern.
- `along_x`, `along_y`, `along_z` — already-basic reuse of Concept Unit
  1's own `scale_vector_3d`, one call per axis.
- `return add_vector_to_point_3d(add_vector_to_point_3d(along_x,
  along_y), along_z)` — already-basic reuse, combining all three
  contributions the same way Lesson 6's own two-term version combined
  two.
- `standard_x`, `standard_y`, `standard_z` — the ordinary,
  unrotated 3D basis: each axis pointing along itself.
- `print(from_components_3d(3, 4, 5, standard_x, standard_y,
  standard_z))` — prints `(3, 4, 5)`: with the standard basis, the
  amounts and the resulting point are identical, the same sanity check
  Lesson 6's own 2D version already passed.
- `tilted_x = (0, 1, 0)`, `tilted_y = (-1, 0, 0)` — the *exact* basis
  vectors from Lesson 6 and 13's own tilted 2D examples, each now
  written with a third component of `0` tacked on.
- `tilted_z = (0, 0, 1)` — a third axis, pointing straight up out of the
  plane the first two already span.
- `print(from_components_3d(3, 4, 0, tilted_x, tilted_y, tilted_z))` —
  prints `(-4, 3, 0)` — the *exact* result Lesson 13's own `rotated`
  example already produced in 2D, `(-4, 3)`, with a `0` now appended.
  This isn't similar to that earlier result; run through genuinely 3D
  machinery, with `z_amount` set to `0`, it's the identical computation.
- `print(from_components_3d(3, 4, 2, tilted_x, tilted_y, tilted_z))` —
  prints `(-4, 3, 2)`: the identical `x` and `y`, now lifted `2` units
  up out of the plane — proof that changing only `z_amount` moves a
  point purely along the third axis, without disturbing the 2D
  relationship already established.
- `print(dot3(tilted_x, tilted_y))`, `print(dot3(tilted_x, tilted_z))`,
  `print(dot3(tilted_y, tilted_z))` — all three print `0`: every pair of
  this 3D basis's own axes is genuinely perpendicular, Lesson 7's own
  zero-means-perpendicular reading, now confirmed in three dimensions
  using the identical test.
- `print(dot3(tilted_x, tilted_x))` — prints `1`: `tilted_x` is unit
  length, the same `dot_product(v, v) = 1` reading Lesson 16's own
  orthonormality check already used in 2D.

**Section I's own judgment call, closed.** Section I deliberately stayed
in 2D throughout, treating it as a simplification rather than the full
picture. This unit proves that choice was never a loss of generality:
`from_components_3d(3, 4, 0, tilted_x, tilted_y, tilted_z)` reproducing
Lesson 13's own `(-4, 3)` exactly, with `z_amount` literally set to `0`,
is the concrete proof that every 2D scenario this curriculum has built
already *was* a 3D one, restricted to a single flat slice the whole
time.

### CS Lens

Confirming that a lower-dimensional special case is literally recoverable
from a more general model, by actually running the general model at the
special case's own boundary condition, is a genuine verification
technique, not just a reassuring analogy.

```
Also recognized in: physics simulations (a 2D physics engine's equations
of motion are frequently literally the 3D equations with one axis
locked to zero, verifiable by running the 3D solver with that
constraint and confirming it reproduces the 2D result exactly), graphics
API design (many 3D rendering APIs implement 2D drawing as a special
case of the same 3D pipeline, with the camera and geometry both confined
to a single plane, rather than maintaining two separate code paths), and
mathematical generalization proofs (showing a general theorem correctly
reduces to an already-proven special case, under the special case's own
exact conditions, is standard practice for confirming a generalization
is correct, not merely plausible)
```

### SE Lens

The design principle is **verifying a generalization by reproducing an
already-trusted specific result from it**, rather than trusting the
generalization because its individual pieces look reasonable. The
alternative not chosen: build 3D coordinate frames and simply assert
that 2D is "the special case where z is zero," without ever actually
running the 3D machinery at `z = 0` and checking the output against an
already-verified 2D number.

That alternative would have been a reasonable claim, and probably a true
one. The real value of this unit's own approach: `(-4, 3, 0)` isn't
just claimed to match Lesson 13's own `(-4, 3)` — it's the literal,
run output of genuinely 3D code, checked against a number this
curriculum already trusted from twenty-nine lessons earlier, the same
standard of evidence this whole curriculum has applied to every claim
since Lesson 1.

### Commands Needed

`python geometry_lesson_46.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
(3, 4, 5)
(6, 8, 10)
(3, 4, 5)
(3, 4, 5)
(-4, 3, 0)
(-4, 3, 2)
0
0
0
1
```

Verified by actually running the updated file above.

### Connection

3D frames build points exactly the way 2D frames already did, and
collapse to the identical 2D results at `z = 0`. What Breaks Without
This shows what happens if a 2D function is used on 3D data by mistake,
instead of its proper 3D extension.

---

## Connect the Pieces

One 3D frame, traced through everything this lesson built, start to
finish:

1. `tilted_x = (0, 1, 0)`, `tilted_y = (-1, 0, 0)`, `tilted_z = (0, 0,
   1)` — a real 3D basis, its first two axes identical to Lesson 6 and
   13's own tilted 2D basis, its third genuinely new.
2. `dot3` confirms all three axes are mutually perpendicular and each
   unit length — a genuinely orthonormal 3D basis, verified the same way
   Lesson 16 already verified one in 2D.
3. `from_components_3d(3, 4, 0, tilted_x, tilted_y, tilted_z)` produces
   `(-4, 3, 0)` — Lesson 13's own `(-4, 3)` result, exactly, with a
   trailing `0`.
4. `from_components_3d(3, 4, 2, tilted_x, tilted_y, tilted_z)` produces
   `(-4, 3, 2)` — the identical `x`/`y` relationship, now lifted along
   the new third axis, proving the 2D result and the 3D extension share
   the same underlying computation, not just a similar shape.

## What Breaks Without This

Prove that a 2D function used on 3D data by mistake doesn't crash — it
silently discards data instead:

```python
def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


vector_3d = (3, 4, 5)
result = scale_vector(vector_3d, 2)
print(result)
```

```
(6, 8)
```

Verified by actually running this. Lesson 3's own 2D `scale_vector`,
handed a genuine 3D vector, doesn't raise any error at all — Python
tuple indexing with `[0]` and `[1]` is completely valid on a 3-element
tuple, so the function runs to completion and returns `(6, 8)` instead
of the correct `(6, 8, 10)`. The entire `z` component — `5`, scaled to
`10` — is silently discarded, with nothing in the code or its output
signaling that anything was lost. This is exactly why this lesson built
`scale_vector_3d` as its own, separate function rather than assuming
the 2D version would simply "work" on longer tuples: in a language
without a way to require a tuple be exactly 3 components, calling the
wrong-dimensional version of a function is a real, silent-until-it-
matters mistake, not a hypothetical one.

## Exercises

1. Using `from_components_3d`, build a 3D frame representing a fixture
   tilted so its own `z_axis` points sideways instead of straight up —
   for example, `x_axis = (1, 0, 0)`, `y_axis = (0, 0, 1)`, `z_axis =
   (0, -1, 0)`. Verify this basis is still orthonormal using `dot3`, the
   same way this lesson's own `tilted_x`/`tilted_y`/`tilted_z` was
   checked.
2. Using `subtract_points_3d` and `dot3`, write a genuine 3D distance
   check: compute `dot3(offset, offset)` for two 3D points of your own
   choosing, and explain why taking its square root (Lesson 9's own
   `math.sqrt`) would give the real, physical straight-line distance
   between them in 3D, the same way it already did in 2D.
3. Predict, then verify, what `add_vector_to_point_3d` does if it's
   accidentally called with a 2D point and a 3D vector, or vice versa.
   Explain exactly which line of the function causes the failure, and
   what kind of error it produces.

## Definition of Done

- [ ] `geometry_lesson_46.py` exists and runs with no errors via `python
      geometry_lesson_46.py`.
- [ ] Running it prints the full 10-line sequence shown in Concept Unit
      2's Run It, ending in `0`, `0`, `0`, then `1` — matching this
      lesson's verified output exactly.
- [ ] You can explain, without looking at the file, why extending
      `add_vector_to_point`, `subtract_points`, and `scale_vector` to
      three components needed no new ideas, only one more term per
      function.
- [ ] You can explain why `from_components_3d(3, 4, 0, ...)` matching
      Lesson 13's own 2D result exactly is real proof that 2D was
      already a special case of 3D, not just a comforting analogy.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Extend point, vector, and coordinate-frame operations to 3D, confirming 2D was always the z=0 case"`,
      not `git commit -m "add 3D functions"`.

Next: Lesson 47 — Rotations in 3D, which proves the one place this
lesson's own "extension is free" pattern actually breaks down: unlike
2D rotation, which needs only a single angle, rotating around an
arbitrary axis in 3D is genuinely harder, not just a dimensional
extension of Lesson 6 and 11's own 2D basis work.
