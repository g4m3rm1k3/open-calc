# Lesson 7: Dot Products

**What you will build:** A `dot_product` function — the first operation
this curriculum has built that takes two vectors and returns a single
scalar, not another point or vector. You'll use it three ways: to measure
whether two directions are roughly aligned, opposed, or exactly
perpendicular, using nothing but the sign of one number; and to recover a
vector's own x- and y-components using nothing but Lesson 6's basis
vectors — closing a loop this curriculum opened last lesson. The
transferable problem: none of Lessons 1 through 6 could answer "how much do
these two directions actually agree with each other?" This lesson builds
the one operation that answers exactly that question, and it turns out to
already be hiding inside an idea from the previous lesson.

**What you need to know first:** Lesson 2's `add_vector_to_point`, Lesson
3's `scale_vector` and its scalar taxonomy, and Lesson 6's basis vectors
(`x_axis`, `y_axis`) and its `from_components` function. This lesson builds
the operation that, applied in reverse, is what `from_components` was
secretly doing all along.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–6.

**Terms introduced in this lesson:**

- **Dot product** — an operation that combines two vectors into a single
  scalar, computed by multiplying their matching components together and
  summing the results. Why: every operation this curriculum has built so
  far that takes two vectors — `add_vector_to_point`, and implicitly
  `subtract_points` — returns another point or vector; nothing so far
  could turn "how do these two directions relate" into one number the way
  Lesson 1's `distance` turned "how far apart are these two points" into
  one number.
- **Perpendicular** — two vectors that meet at an exact right angle. Why:
  the dot product gives an exact, no-eyeballing test for this — it equals
  precisely zero — which becomes important the moment two directions need
  to be checked for a right angle by a program instead of a human looking
  at a picture.
- **Projection** (onto a unit vector) — the amount of a vector that points
  along a specific direction, found by taking the dot product of the
  vector with a unit-length vector pointing that way. Why: "how much of
  this force is actually pushing the tool forward, versus sideways" is a
  constant question in CAD/CAM and physics alike, and projection is the
  operation that answers it.

**Objects and methods used:**

None. This lesson reuses Lesson 3's `scale_vector` for one supporting
example; everything else is built from plain arithmetic already covered.

---

## Concept Unit: Combining Two Vectors into One Number

### The Problem

Every operation on two vectors this curriculum has built so far —
`add_vector_to_point`, `subtract_points` — takes two compound values and
returns another compound value: a point, or a vector. None of them can
answer a question like "how much does this cutting force actually push in
the direction the tool is feeding?" — a question whose honest answer is a
single number, not another vector.

*A note on method:* the dot product is a genuinely new arithmetic
construct, not just a new use of an already-known one — but it's built
entirely from multiplication and addition, both already covered, so no
separate throwaway syntax lab is needed for the Python side of it. The
real content here is mathematical, taught directly in the real code below.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–6.
- **Files affected:** `geometry_lesson_07.py` — created, as a new file for
  this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


cutting_force = (2, 3)
feed_direction = (4, 1)

print(dot_product(cutting_force, feed_direction))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has been
in so far.

### Mechanical Walkthrough

Every syntactic element in the block above, in order:

- `def dot_product(a, b):` — a function definition, already-basic syntax.
- `return a[0] * b[0] + a[1] * b[1]` — this is the new idea. `a[0]`, `b[0]`,
  `a[1]`, `b[1]` are plain tuple indexing, already covered. The
  multiplications and the addition are ordinary arithmetic, also already
  covered. What's new is the specific *pattern*: multiply each vector's
  matching components together, then add those two products into a single
  number. This isn't component-by-component like `add_vector_to_point` or
  `scale_vector` — those returned a new tuple, one operation per component,
  kept separate. This returns one number, the *sum* of both components'
  products, deliberately collapsing the two dimensions into one
  measurement.
- `cutting_force = (2, 3)` and `feed_direction = (4, 1)` — two vectors,
  chosen to represent a genuinely CAD/CAM-flavored question: how much of a
  cutting force lines up with the direction a tool is actually feeding.
- `print(dot_product(cutting_force, feed_direction))` — a function call,
  already basic, producing `11` — a single scalar, the answer to "how
  aligned are these two vectors," even though what that number *means*
  isn't obvious yet from `11` alone. The next two units make it obvious.

### CS Lens

Multiplying corresponding entries of two same-shaped compound values and
summing the results is the **dot product**, one of the most-reused
operations in all of applied mathematics.

```
Also recognized in: machine learning (a neural network's weighted sum —
multiplying each input by its matching weight and adding the results is
exactly a dot product), search engines (measuring how similar two
documents are by taking the dot product of their word-frequency vectors),
and audio engineering (measuring how much a signal correlates with a
reference waveform, sample by matching sample)
```

### SE Lens

The design principle is **collapsing two related numbers into one
meaningful number on purpose**, rather than always keeping component-wise
results separate the way `add_vector_to_point` and `scale_vector` do. The
alternative not chosen: never combine components at all, and instead
compare `cutting_force` and `feed_direction` component-by-component —
"is `2` close to `4`? is `3` close to `1`?" — leaving a program with two
separate, hard-to-interpret partial answers instead of one.

The dot product's single number is more useful specifically because it's
lossy on purpose: `dot_product(cutting_force, feed_direction)` throws away
the individual `2`, `3`, `4`, `1` and keeps only the one fact this
curriculum actually needs answered over and over — how aligned are these
two directions. The cost of that compression: a bare `11` on its own
doesn't say *how* aligned, only that the number is positive — which is
exactly what the next unit is for.

### Commands Needed

Same command as every prior lesson — `python geometry_lesson_07.py`.
Nothing new here.

### Run It

```
11
```

Verified by actually running the file above.

### Connection

A dot product now exists, and it produces a number. What that number's
sign — positive, negative, or exactly zero — actually tells you about the
two vectors that produced it is the next unit's whole job.

---

## Concept Unit: What the Sign Tells You

### The Problem

`dot_product(cutting_force, feed_direction)` returned `11` — some positive
number — but nothing about that specific value says whether `11` counts as
"very aligned" or "barely aligned." Before chasing an exact angle (which
needs vector length, still two lessons away), check the one thing the dot
product's *sign alone* already reveals, using vectors whose relationship is
already known for certain: Lesson 6's own basis vectors, which were built
to point in genuinely perpendicular directions, and Lesson 3's own
`movement` vector alongside its own exact reverse.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_07.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(dot_product(cutting_force,
  feed_direction))` line added in Concept Unit 1.
- **Dependencies:** none beyond what Concept Unit 1 already established.

### The New Code

```python
def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


x_axis = (1, 0)
y_axis = (0, 1)
print(dot_product(x_axis, y_axis))

movement = (2, -1)
reversed_movement = scale_vector(movement, -1)

print(dot_product(movement, movement))
print(dot_product(movement, reversed_movement))
```

### The Updated Project

```python
def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


cutting_force = (2, 3)
feed_direction = (4, 1)

print(dot_product(cutting_force, feed_direction))


def scale_vector(vector, factor):                    # ← new
    return (vector[0] * factor, vector[1] * factor)  # ← new


x_axis = (1, 0)                                        # ← new
y_axis = (0, 1)                                        # ← new
print(dot_product(x_axis, y_axis))                     # ← new

movement = (2, -1)                                     # ← new
reversed_movement = scale_vector(movement, -1)         # ← new

print(dot_product(movement, movement))                 # ← new
print(dot_product(movement, reversed_movement))        # ← new
```

The file as a whole now demonstrates all three sign cases in one place:
zero, for two vectors already known to be perpendicular; positive, for a
vector compared with itself; and negative, for a vector compared with its
own exact reverse.

### Mechanical Walkthrough

Every syntactic element in this unit's new code, in order:

- `def scale_vector(vector, factor): ...` — Lesson 3's own function,
  retyped unchanged. No re-explanation owed for its mechanics, per the
  Repetition Rule.
- `x_axis = (1, 0)` and `y_axis = (0, 1)` — Lesson 6's own basis vectors,
  retyped unchanged. They were built specifically to be perpendicular,
  even though Lesson 6 never had a way to prove it.
- `print(dot_product(x_axis, y_axis))` — the first proof: `1*0 + 0*1`
  evaluates to `0`. **A dot product of exactly zero means the two vectors
  are perpendicular** — this is the formal, exact version of what Lesson 6
  only asserted informally.
- `movement = (2, -1)` — Lesson 2's own vector, retyped.
- `reversed_movement = scale_vector(movement, -1)` — Lesson 3's own
  reversal pattern, retyped.
- `print(dot_product(movement, movement))` — a vector dotted with itself.
  `2*2 + (-1)*(-1)` evaluates to `5` — positive. **A positive dot product
  means the two vectors point in a broadly similar direction** — and a
  vector obviously points in exactly its own direction, which is the most
  extreme case of "similar" there is.
- `print(dot_product(movement, reversed_movement))` — `2*(-2) + (-1)*1`
  evaluates to `-5` — negative. **A negative dot product means the two
  vectors point in broadly opposite directions** — and a vector's own exact
  reverse is the most extreme case of "opposite" there is.

### CS Lens

Reading a dot product's sign alone, without needing its exact value, is a
first taste of **similarity measurement** without a full distance metric.

```
Also recognized in: recommendation systems (a positive dot product
between two users' preference vectors suggests similar taste, without
needing to compute an exact similarity score), physics (the sign of the
dot product between force and displacement determines whether work is
being done on or against an object), and version control (the sign of a
correlation between two contributors' change patterns hints at whether
they're working on related or unrelated parts of a codebase)
```

### SE Lens

The design principle is **reading a cheap, exact signal (a sign) before
reaching for a more expensive, precise one (an actual angle)**. The
alternative not chosen: always compute the full angle between two vectors,
in degrees, even for a question as simple as "are these two things
generally facing the same way or not."

The full angle computation needs vector length — two more square roots,
one per vector — which Lesson 9 hasn't supplied yet, and which costs real
computation the moment it's needed for thousands of vectors at once (a
mesh with a million normals, say, all being checked against a light
direction). The sign of a plain dot product answers "same side, opposite
side, or exactly perpendicular" with none of that cost — genuinely useful
on its own, in situations that only need a broad answer, not a precise
one.

### Commands Needed

Same command as Concept Unit 1 — `python geometry_lesson_07.py`. Nothing
new here.

### Run It

```
11
0
5
-5
```

Verified by actually running the updated file above.

### Connection

The dot product's sign now has a real meaning: zero for perpendicular,
positive for roughly-aligned, negative for roughly-opposed. The last unit
uses the same operation for something else entirely — pulling a vector's
own components back out of it.

---

## Concept Unit: Projection — Recovering a Component

### The Problem

Lesson 6 built `from_components`, which takes numbers and basis vectors and
produces a point. This unit asks the reverse question: given a point (or a
vector) and a basis vector, can you recover the *number* that went into
building it in the first place — without already knowing it?

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_07.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(dot_product(movement,
  reversed_movement))` line added in Concept Unit 2.
- **Dependencies:** none beyond what Concept Units 1 and 2 already
  established.

### The New Code

```python
feature_in_part = (3, 4)

x_component = dot_product(feature_in_part, x_axis)
y_component = dot_product(feature_in_part, y_axis)

print(x_component)
print(y_component)
```

### The Updated Project

```python
def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


cutting_force = (2, 3)
feed_direction = (4, 1)

print(dot_product(cutting_force, feed_direction))


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


x_axis = (1, 0)
y_axis = (0, 1)
print(dot_product(x_axis, y_axis))

movement = (2, -1)
reversed_movement = scale_vector(movement, -1)

print(dot_product(movement, movement))
print(dot_product(movement, reversed_movement))


feature_in_part = (3, 4)                                # ← new

x_component = dot_product(feature_in_part, x_axis)      # ← new
y_component = dot_product(feature_in_part, y_axis)      # ← new

print(x_component)                                       # ← new
print(y_component)                                       # ← new
```

The file as a whole now covers the dot product's three most important
uses in one place: raw scalar measurement, sign-based direction reading,
and pulling a vector's own components back out using basis vectors.

### Mechanical Walkthrough

Every syntactic element in this unit's new code, in order:

- `feature_in_part = (3, 4)` — Lesson 5's own point, retyped, chosen
  specifically because its components are already known — the perfect
  value to test a "recover the components" operation against.
- `x_component = dot_product(feature_in_part, x_axis)` — `3*1 + 4*0`
  evaluates to `3`, exactly `feature_in_part`'s own first component. This
  is **projection**: dotting a vector against a *unit-length* direction
  (Lesson 6's `x_axis` has length exactly `1`) measures exactly how far the
  vector extends along that direction — which, for the standard basis,
  means "the x-component," recovered without ever indexing
  `feature_in_part[0]` directly.
- `y_component = dot_product(feature_in_part, y_axis)` — the same
  operation against `y_axis`, recovering `4`, the second component. Between
  Lesson 6's `from_components` (numbers plus basis vectors → a point) and
  this unit's projection (a point plus basis vectors → numbers), this
  curriculum now has both directions of the same relationship.

### CS Lens

Extracting a compound value's individual pieces using the same operation
that combines pieces into a whole is a small instance of a much larger CS
idea: **an inverse operation**, recovering exactly what a forward operation
consumed.

```
Also recognized in: encoding and decoding (compressing data with one
operation, recovering the original with its mathematical inverse),
cryptography (encryption and decryption as inverse operations built from
the same underlying mathematics), and physics (integrating a velocity to
get position, then differentiating position to recover velocity — the
same relationship, in reverse, that this unit's projection has with
Lesson 6's `from_components`)
```

### SE Lens

The design principle is **building forward and reverse operations from the
same underlying idea, instead of two unrelated ones**. The alternative not
chosen: `dot_product` doing nothing but raw multiply-and-sum, with a
completely separate `extract_component(point, axis_index)` function
written by hand — using indexing directly, the way earlier lessons always
did — to pull out a coordinate.

Writing a dedicated indexing-based extractor would work, and would honestly
be simpler for the standard basis specifically — `feature_in_part[0]`
already *is* the x-component, no dot product required. The real advantage
of projection over plain indexing shows up the moment the basis stops
being the standard one: Lesson 6's tilted basis, or any future rotated
coordinate frame, has no "index 0 is the x-component" shortcut at all — the
dot product is the only one of the two approaches that still gives the
right answer once the basis vectors point somewhere other than straight
along the array's own indices.

### Commands Needed

Same command as Concept Unit 1 — `python geometry_lesson_07.py`. Nothing
new here.

### Run It

```
11
0
5
-5
3
4
```

Verified by actually running the updated file above.

### Connection

This lesson's dot product now answers three real questions with one
operation: a raw alignment score, a same/opposite/perpendicular reading
from its sign alone, and — against a unit vector specifically — a
component recovered by projection. Lesson 9, Norms and Distance, uses this
exact same operation, a vector dotted with itself, to finally define what a
vector's own length actually is.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `feature_in_part = (3, 4)` — a point whose components are already
   known, chosen to make the final proof checkable by eye.
2. `dot_product(feature_in_part, x_axis)` computes `feature_in_part[0] *
   x_axis[0] + feature_in_part[1] * x_axis[1]`, which is `3 * 1 + 4 * 0`.
3. `3 * 1` is `3`. `4 * 0` is `0`. Their sum is `3` — exactly
   `feature_in_part`'s own first component.
4. `dot_product(feature_in_part, y_axis)` computes `3 * 0 + 4 * 1`.
5. `3 * 0` is `0`. `4 * 1` is `4`. Their sum is `4` — exactly
   `feature_in_part`'s own second component.
6. Both projections, taken together, reconstruct `feature_in_part` in full
   — proving that dotting a vector against each of the standard basis
   vectors is a working (if roundabout) way to read out its own components,
   the mirror image of Lesson 6's `from_components` building a point back
   up from those same components.

## What Breaks Without This

Projection onto `x_axis` recovered `feature_in_part`'s real x-component
because `x_axis` has length exactly `1`. Try the same trick against a
basis vector that's been stretched, the way Lesson 6's exercises briefly
suggested trying:

```python
def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


feature_in_part = (3, 4)
stretched_x_axis = (2, 0)

wrong_component = dot_product(feature_in_part, stretched_x_axis)
print(wrong_component)
```

```
6
```

Verified by actually running this. `stretched_x_axis` still points in
exactly the same direction as the real `x_axis` — but it's twice as long.
The projection comes out as `6`, not the real x-component, `3` — off by
exactly the factor the axis vector was stretched by. This isn't a crash,
and `6` looks like a perfectly reasonable number — it's simply not the
answer to "how much of `feature_in_part` points in the x-direction"
anymore. Projection-as-component-recovery only works, silently and
exactly, against a *unit* vector — a fact this lesson relied on without
yet being able to prove it, since proving a vector's length is exactly `1`
needs the very tool Lesson 9 hasn't built yet.

## Exercises

1. Predict, then verify: what does `dot_product((0, 0), anything)` return,
   for any vector `anything`? Explain why that answer makes sense given
   what the dot product measures.
2. Using only `dot_product`, write an expression that tests whether two
   vectors `a` and `b` are perpendicular, without printing the raw dot
   product value — it should read naturally as a yes/no check. (You may
   use `==`, which behaves the way you'd expect from ordinary arithmetic
   comparisons, even though this curriculum hasn't formally covered it
   yet.)
3. Compute `dot_product(cutting_force, feed_direction)` and
   `dot_product(feed_direction, cutting_force)` — the same two vectors,
   arguments swapped. Confirm they're equal, and explain in one sentence,
   from the formula itself (`a[0]*b[0] + a[1]*b[1]`), why swapping the
   arguments could never change the result.

## Definition of Done

- [ ] `geometry_lesson_07.py` exists and runs with no errors via
      `python geometry_lesson_07.py`.
- [ ] Running it prints `11`, `0`, `5`, `-5`, `3`, then `4` — matching this
      lesson's verified output exactly.
- [ ] You can explain, without looking at the file, what a dot product's
      sign tells you about the two vectors that produced it, in all three
      cases: positive, negative, and exactly zero.
- [ ] You can explain why projecting onto a stretched (non-unit) basis
      vector no longer recovers the true component, using the actual
      numbers from the Closing section's example.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Add dot products: one operation for alignment, perpendicularity, and recovering a vector's own components"`,
      not `git commit -m "add dot_product function"`.

Next: Lesson 8 — Cross Products, where this lesson's dot product gets a
sibling operation: one that measures not how aligned two vectors are, but
how much oriented area they sweep out together.
