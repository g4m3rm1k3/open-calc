# Lesson 12: Coordinate Transformations

**What you will build:** A `transform_to_global` function that finally
combines Lessons 4 and 5's origin shifts with Lesson 6's basis changes into
one general operation — converting a point between two coordinate systems
that differ in *both* position and orientation at once, the way a fixture
bolted to a rotary table really does. You'll then prove this one function
quietly explains everything Lessons 4 through 6 already built, by feeding
it inputs that collapse it back down to each earlier lesson's special
case. The transferable problem: Lesson 4/5 only ever handled an origin
shift, silently assuming both systems shared the same axis directions.
Lesson 6 only ever handled a basis change, silently assuming both systems
shared the same origin. Real coordinate systems — a robot's joints, a
CAD assembly, a rotary fixture — almost never offer that convenience.

**What you need to know first:** Lesson 4/5's `add_vector_to_point`-based
origin conversion and Lesson 6's `from_components`. This lesson combines
both into one function rather than building anything new from scratch.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–11.

**Terms introduced in this lesson:**

- **Coordinate transformation** — the combined operation of converting a
  point from one coordinate system to another, accounting for both a
  change of origin and a change of basis at once. Why: Lessons 4/5 and 6
  each solved exactly one half of this problem, in isolation; most real
  coordinate systems differ from each other in both ways simultaneously,
  and this lesson's operation is the one that actually handles that.

**Objects and methods used:**

None. This lesson combines Lesson 2's `add_vector_to_point`, Lesson 3's
`scale_vector`, and Lesson 6's `from_components`, all reused exactly as
written.

---

## Concept Unit: Combining Origin and Basis into One Conversion

### The Problem

A fixture bolted to a rotary table isn't just offset from the table's
center — Lesson 4/5's whole scenario — and it isn't just rotated relative
to the table's own axes — Lesson 6's whole scenario. A real fixture, turned
90 degrees on the table *and* mounted off-center, is both at once. Neither
`to_machine_coordinates` (Lesson 4) nor `from_components` (Lesson 6) alone
can convert a feature's fixture-local coordinates into table coordinates
under those conditions — one ignores rotation, the other ignores position.

*A note on method:* this unit's function is a direct combination of
already-covered pieces — no new Python construct, and no throwaway syntax
lab, is needed here.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–11.
- **Files affected:** `geometry_lesson_12.py` — created, as a new file for
  this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def from_components(x_amount, y_amount, x_axis, y_axis):
    along_x = scale_vector(x_axis, x_amount)
    along_y = scale_vector(y_axis, y_amount)
    return add_vector_to_point(along_x, along_y)


def transform_to_global(point_in_local, origin_in_global, x_axis_in_global, y_axis_in_global):
    offset = from_components(point_in_local[0], point_in_local[1], x_axis_in_global, y_axis_in_global)
    return add_vector_to_point(origin_in_global, offset)


fixture_origin_in_table = (50, 20)
fixture_x_axis_in_table = (0, 1)
fixture_y_axis_in_table = (-1, 0)

feature_in_fixture = (3, 4)

feature_in_table = transform_to_global(
    feature_in_fixture, fixture_origin_in_table, fixture_x_axis_in_table, fixture_y_axis_in_table
)
print(feature_in_table)
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has been
in so far.

### Mechanical Walkthrough

Every syntactic element in the block above, in order:

- `def add_vector_to_point(...)`, `def scale_vector(...)`, `def
  from_components(...)` — Lessons 2, 3, and 6's own functions, retyped
  unchanged. No re-explanation owed for their mechanics, per the
  Repetition Rule.
- `def transform_to_global(point_in_local, origin_in_global,
  x_axis_in_global, y_axis_in_global):` — a function definition, already-
  basic syntax, with four parameters: the point to convert, and the three
  pieces of data that fully describe the local system's placement inside
  the global one — its origin, and both of its basis vectors.
- `offset = from_components(point_in_local[0], point_in_local[1],
  x_axis_in_global, y_axis_in_global)` — the new idea's first half:
  treating the local point's own numbers as components against the
  *global-space* basis vectors, exactly the way Lesson 6 did — this alone
  handles the rotation, producing a vector from the local origin to the
  point, expressed in global directions.
- `return add_vector_to_point(origin_in_global, offset)` — the new idea's
  second half: adding that vector to where the local origin actually sits
  in global space, exactly the way Lesson 4/5 did — this handles the
  position.
- `fixture_origin_in_table = (50, 20)`, `fixture_x_axis_in_table = (0,
  1)`, `fixture_y_axis_in_table = (-1, 0)` — a fixture rotated 90 degrees
  (the exact same tilted basis Lesson 6 built) and offset from the table's
  own origin, both at once.
- `feature_in_fixture = (3, 4)` and the `transform_to_global(...)` call —
  already basic. The result, `(46, 23)`, accounts for both the rotation
  and the offset in a single call.

### CS Lens

Composing "apply a basis change" and "apply an origin shift" into one
function that does both is building a **general operation out of its
special cases**, the reverse direction of what Lessons 4/5 and 6 each did
by isolating one piece of the full problem at a time.

```
Also recognized in: 3D engines (an object's full "world transform" is
exactly this combination — rotation and position together — computed
once per object, per frame), robotics (a robot arm's forward kinematics
chains exactly this kind of combined transform, once per joint, all the
way from the base to the gripper), and CAD assembly constraints (mating
two parts together specifies both their relative position and their
relative rotation, never just one alone)
```

### SE Lens

The design principle is **generalizing only after both special cases are
already trusted**, rather than attempting the fully general transform from
Lesson 4 onward. The alternative not chosen: build `transform_to_global`
first, back in Lesson 4, before either an origin-only or a basis-only
conversion had been proven correct on their own.

Building the general case first would have meant debugging origin
handling and basis handling simultaneously, with no way to isolate which
half of a wrong answer came from which piece. Building them separately
first — Lesson 4/5 for origin, Lesson 6 for basis — meant each piece could
be verified completely on its own, against numbers simple enough to check
by hand, before this lesson combined two already-trusted pieces into one.
The cost paid for that caution: three lessons before the fully general
operation existed at all, rather than one.

### Commands Needed

Same command as every prior lesson — `python geometry_lesson_12.py`.
Nothing new here.

### Run It

```
(46, 23)
```

Verified by actually running the file above.

### Connection

`transform_to_global` handles a fixture that's both rotated and offset.
The next unit checks something this lesson's design implicitly promised:
that this one general function, given the right inputs, can reproduce
exactly what Lessons 4/5 and 6 already computed on their own.

---

## Concept Unit: One Function, Three Lessons' Worth of Special Cases

### The Problem

`transform_to_global` was built by combining two already-trusted pieces.
If that combination is actually correct, it should be able to *become*
either piece alone, under the right conditions — Lesson 4/5's
origin-only conversion, when the basis is the standard one; Lesson 6's
basis-only conversion, when the origin is `(0, 0)`. If it can't reproduce
either, something about the combination is wrong, even though Concept Unit
1's own numbers looked reasonable.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_12.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(feature_in_table)` line added in
  Concept Unit 1.
- **Dependencies:** none beyond what Concept Unit 1 already established.

### The New Code

```python
standard_x = (1, 0)
standard_y = (0, 1)
work_origin_in_machine = (100, 50)
feature_a_work = (10, 5)

via_general = transform_to_global(feature_a_work, work_origin_in_machine, standard_x, standard_y)
via_lesson4 = add_vector_to_point(work_origin_in_machine, feature_a_work)
print(via_general)
print(via_lesson4)

zero_origin = (0, 0)
tilted_x_axis = (0, 1)
tilted_y_axis = (-1, 0)
feature_in_part = (3, 4)

via_general_2 = transform_to_global(feature_in_part, zero_origin, tilted_x_axis, tilted_y_axis)
via_lesson6 = from_components(feature_in_part[0], feature_in_part[1], tilted_x_axis, tilted_y_axis)
print(via_general_2)
print(via_lesson6)
```

### The Updated Project

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def from_components(x_amount, y_amount, x_axis, y_axis):
    along_x = scale_vector(x_axis, x_amount)
    along_y = scale_vector(y_axis, y_amount)
    return add_vector_to_point(along_x, along_y)


def transform_to_global(point_in_local, origin_in_global, x_axis_in_global, y_axis_in_global):
    offset = from_components(point_in_local[0], point_in_local[1], x_axis_in_global, y_axis_in_global)
    return add_vector_to_point(origin_in_global, offset)


fixture_origin_in_table = (50, 20)
fixture_x_axis_in_table = (0, 1)
fixture_y_axis_in_table = (-1, 0)

feature_in_fixture = (3, 4)

feature_in_table = transform_to_global(
    feature_in_fixture, fixture_origin_in_table, fixture_x_axis_in_table, fixture_y_axis_in_table
)
print(feature_in_table)

standard_x = (1, 0)                                                          # ← new
standard_y = (0, 1)                                                          # ← new
work_origin_in_machine = (100, 50)                                           # ← new
feature_a_work = (10, 5)                                                     # ← new

via_general = transform_to_global(feature_a_work, work_origin_in_machine, standard_x, standard_y)  # ← new
via_lesson4 = add_vector_to_point(work_origin_in_machine, feature_a_work)    # ← new
print(via_general)                                                           # ← new
print(via_lesson4)                                                           # ← new

zero_origin = (0, 0)                                                         # ← new
tilted_x_axis = (0, 1)                                                       # ← new
tilted_y_axis = (-1, 0)                                                      # ← new
feature_in_part = (3, 4)                                                     # ← new

via_general_2 = transform_to_global(feature_in_part, zero_origin, tilted_x_axis, tilted_y_axis)  # ← new
via_lesson6 = from_components(feature_in_part[0], feature_in_part[1], tilted_x_axis, tilted_y_axis)  # ← new
print(via_general_2)                                                         # ← new
print(via_lesson6)                                                           # ← new
```

The file as a whole now proves `transform_to_global` three separate ways:
once handling both rotation and position together (Concept Unit 1), once
collapsing to Lesson 4/5's origin-only conversion, and once collapsing to
Lesson 6's basis-only conversion.

### Mechanical Walkthrough

Every syntactic element in this unit's new code, in order:

- `standard_x = (1, 0)`, `standard_y = (0, 1)` — the standard basis,
  retyped, chosen so that `transform_to_global`'s basis-handling half
  should do nothing but reproduce the local point unchanged.
- `work_origin_in_machine = (100, 50)`, `feature_a_work = (10, 5)` —
  Lesson 4's own numbers, retyped, chosen specifically because Lesson 4
  already computed and verified the correct answer for them.
- `via_general = transform_to_global(feature_a_work,
  work_origin_in_machine, standard_x, standard_y)` — the new function,
  called with the standard basis.
- `via_lesson4 = add_vector_to_point(work_origin_in_machine,
  feature_a_work)` — Lesson 4's own original, simpler conversion, called
  directly for comparison.
- The two `print(...)` calls — already basic, producing `(110, 55)` twice:
  `transform_to_global`, given the standard basis, computes exactly what
  Lesson 4's dedicated function always did.
- `zero_origin = (0, 0)`, `tilted_x_axis = (0, 1)`, `tilted_y_axis = (-1,
  0)`, `feature_in_part = (3, 4)` — Lesson 6's own numbers, retyped, for
  the second comparison.
- `via_general_2 = transform_to_global(feature_in_part, zero_origin,
  tilted_x_axis, tilted_y_axis)` and `via_lesson6 = from_components(...)`
  — the same pattern, this time confirming `transform_to_global` collapses
  to Lesson 6's `from_components` exactly when the origin is `(0, 0)`.

### CS Lens

Proving a new, general function reproduces two independently-verified
older functions under specific conditions is a **regression check** —
using already-trusted results as a correctness test for new code, rather
than trusting the new code on faith.

```
Also recognized in: software versioning (a new release expected to
reproduce an old release's known-correct outputs exactly, for inputs
where nothing was supposed to change), physics (a new, more general
theory expected to reduce to an older, simpler one under the older
theory's original assumptions — relativity reducing to Newtonian
mechanics at low speeds is the textbook example), and unit testing
generally (testing new code against known-correct answers computed by
older, simpler, already-trusted code)
```

### SE Lens

The design principle is **using old, trusted code as a correctness oracle
for new code**, rather than trusting a new implementation just because its
logic looks reasonable. The alternative not chosen: write
`transform_to_global`, run it once on the fixture scenario, see a
plausible-looking `(46, 23)`, and move on without checking it against
anything already known to be correct.

That alternative would have been faster to write, and `(46, 23)` genuinely
does look like a reasonable point. The real risk it accepts: a subtle bug
— adding the origin before applying the basis instead of after, say, or
swapping which axis multiplies which component — could easily produce a
different, equally plausible-looking wrong number, with nothing in a
single untested example to catch it. Checking the new function against two
already-verified older ones, under conditions where they're mathematically
required to agree, catches exactly that kind of bug before it has a chance
to hide inside a single unverified example.

### Commands Needed

Same command as Concept Unit 1 — `python geometry_lesson_12.py`. Nothing
new here.

### Run It

```
(46, 23)
(110, 55)
(110, 55)
(-4, 3)
(-4, 3)
```

Verified by actually running the updated file above.

### Connection

`transform_to_global` now has three independent proofs behind it: a
genuinely combined case, and two special cases that match Lessons 4/5 and
6 exactly. Lesson 13, Affine Transformations, gives this combined
operation — origin shift plus basis change together — its formal
mathematical name.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `feature_in_fixture = (3, 4)` — a feature's position, in the fixture's
   own local coordinates.
2. `from_components(3, 4, fixture_x_axis_in_table, fixture_y_axis_in_table)`
   computes `3 * (0, 1) + 4 * (-1, 0)`, which is `(0, 3) + (-4, 0)`, which
   is `(-4, 3)` — the vector from the fixture's origin to the feature,
   expressed in table-space directions.
3. `add_vector_to_point(fixture_origin_in_table, (-4, 3))` computes `(50 +
   (-4), 20 + 3)`, which is `(46, 23)` — the feature's true position on the
   table, accounting for both the fixture's rotation and its offset.
4. Separately, feeding the same `transform_to_global` function
   `work_origin_in_machine` and the standard basis reproduces Lesson 4's
   `(110, 55)` exactly, and feeding it `zero_origin` and the tilted basis
   reproduces Lesson 6's `(-4, 3)` exactly — proof that this lesson's one
   general operation is not a new idea, but the combination of two ideas
   this curriculum had already separately proven correct.

## What Breaks Without This

`transform_to_global` needs the fixture's *real* basis vectors to account
for its rotation correctly. Supply the standard basis instead — a
realistic mistake if a fixture's rotation gets set up in code but its
actual physical rotation on the table is forgotten or never updated:

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def from_components(x_amount, y_amount, x_axis, y_axis):
    along_x = scale_vector(x_axis, x_amount)
    along_y = scale_vector(y_axis, y_amount)
    return add_vector_to_point(along_x, along_y)


def transform_to_global(point_in_local, origin_in_global, x_axis_in_global, y_axis_in_global):
    offset = from_components(point_in_local[0], point_in_local[1], x_axis_in_global, y_axis_in_global)
    return add_vector_to_point(origin_in_global, offset)


feature_in_fixture = (3, 4)
fixture_origin_in_table = (50, 20)

forgot_rotation = transform_to_global(feature_in_fixture, fixture_origin_in_table, (1, 0), (0, 1))
print(forgot_rotation)
```

```
(53, 24)
```

Verified by actually running this. `(53, 24)` is not a crash and not an
obviously unreasonable point — it's simply the wrong one. The correct
answer, `(46, 23)`, differs from it because the real fixture is rotated 90
degrees and this call quietly assumed it wasn't. In a real machining
operation, this exact mistake — position handled correctly, rotation
silently forgotten — would send the tool to a plausible-looking location
that has nothing to do with where the actual feature sits on the rotated
fixture.

## Exercises

1. Build a second fixture, rotated 180 degrees instead of 90 — figure out
   what `x_axis_in_global` and `y_axis_in_global` should be for a 180
   degree rotation of the standard basis, and verify your choice is a
   valid basis using Lesson 11's orientation test before using it in
   `transform_to_global`.
2. Chain two transformations: convert `feature_in_fixture` to table
   coordinates (already done in this lesson), then convert that result to
   world coordinates using a second `transform_to_global` call with the
   table's own origin and basis in the world. Confirm the result is a
   single point, regardless of how many coordinate systems it passed
   through.
3. `transform_to_global`'s parameter order is point, origin, x-axis,
   y-axis. Predict, then verify, what happens if you accidentally call it
   with the origin and the point swapped, using this lesson's own fixture
   numbers. Explain why the result is wrong without being an error.

## Definition of Done

- [ ] `geometry_lesson_12.py` exists and runs with no errors via
      `python geometry_lesson_12.py`.
- [ ] Running it prints `(46, 23)`, `(110, 55)`, `(110, 55)`, `(-4, 3)`,
      then `(-4, 3)` again — matching this lesson's verified output
      exactly.
- [ ] You can explain, without looking at the file, why
      `transform_to_global` reproduces Lesson 4's answer when given the
      standard basis, and Lesson 6's answer when given a zero origin.
- [ ] You can explain what goes silently wrong when a fixture's real
      rotation is forgotten and the standard basis is used in its place.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Add transform_to_global: combine origin and basis into one conversion, verified against both special cases"`,
      not `git commit -m "add transform_to_global function"`.

Next: Lesson 13 — Affine Transformations, where this lesson's combined
origin-plus-basis operation gets its formal mathematical name, unifying
translation, rotation, scaling, and shear into a single named idea.
