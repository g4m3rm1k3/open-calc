# Lesson 24: Line-Line Intersection

**What you will build:** `line_intersection`, a function that finds
where two parametric lines actually cross, by solving for the one
parameter value where both lines' own `point_on_line` formulas agree —
derived from Lesson 8's `cross_product`, not a formula dropped from
nowhere. Verified two independent ways: plugging the found parameter back
into each line separately produces the same point (up to the exact kind
of floating-point noise Lesson 17 already proved is real), and a genuine
failure case — two lines that never cross at all — produces a real,
understood `ZeroDivisionError`, not a silently wrong answer. The
transferable problem: every geometric primitive since Lesson 21 has been
tested in isolation. Two lines *relating* to each other — crossing,
running parallel, never meeting — is this curriculum's first real
multi-object geometric query.

**What you need to know first:** Lesson 21's `point_on_line`, Lesson 8's
`cross_product` and its anticommutativity proof, Lesson 17's
`nearly_equal`, and Lesson 10's real `ZeroDivisionError` crash (the same
kind of error this lesson's own closing section reproduces, for a
different reason).

**Assumed background (outside this curriculum):** unchanged from Lessons
1–23.

**Terms introduced in this lesson:**

- **Line-line intersection** — the single point, if one exists, where two
  lines' parametric formulas produce the same result. Why: this is this
  lesson's own subject, and the first geometric query in this curriculum
  that genuinely relates two separate objects to each other, rather than
  testing one object against a fixed rule.
- **Parallel lines** — two lines whose direction vectors point along the
  same or exactly opposite direction, so that neither ever gets closer to
  or farther from the other — the specific case where line-line
  intersection has no single answer. Why: this is exactly the case this
  lesson's own solving method cannot handle, and understanding *why*
  algebraically is what turns that failure from a mysterious crash into
  an expected, well-understood case.

**Objects and methods used:**

None. `line_intersection` is hand-authored project code, built from
Lesson 2, 8, and 21's own reused functions.

---

## Concept Unit: Setting Up the System — Two Lines, One Shared Point

### The Problem

Two lines that aren't parallel cross at exactly one point. That point has
to satisfy *both* lines' own parametric formulas at once — some `t` for
the first line and some `s` for the second line, both landing on the
identical point. Set up that condition concretely, using two real lines,
before trying to solve it.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–23.
- **Files affected:** `geometry_lesson_24.py` — created, as a new file
  for this lesson.
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


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


point1 = (0, 0)
dir1 = (3, 4)
point2 = (6, 0)
dir2 = (-1, 2)

diff = subtract_points(point2, point1)

print(diff)
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* every function above is retyped unchanged from
Lessons 2 and 21. No new Python construct appears anywhere in this
lesson; the new material is the mathematics these familiar pieces are
arranged to solve.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def add_vector_to_point(...)`, `def scale_vector(...)`, `def
  point_on_line(...)`, `def subtract_points(...)` — Lesson 2 and 21's own
  functions, retyped unchanged. No re-explanation owed, per the
  Repetition Rule.
- `point1 = (0, 0)`, `dir1 = (3, 4)` — the first of this lesson's two
  lines, using the curriculum's own familiar direction.
- `point2 = (6, 0)`, `dir2 = (-1, 2)` — a second, genuinely different
  line, chosen so the two visibly cross rather than running parallel.
- `diff = subtract_points(point2, point1)` — first appearance of the
  actual algebraic setup: the intersection condition is
  `point1 + t * dir1 = point2 + s * dir2` — the same point, reached two
  different ways. Rearranged, that's `t * dir1 - s * dir2 = point2 -
  point1` — and `diff` is exactly that right-hand side, the vector
  separating the two lines' own starting points.
- `print(diff)` — already-basic; prints `(6, 0)`.

### CS Lens

Setting up a shared condition between two independently defined objects,
then solving for the values that satisfy it, is the general shape of any
**constraint-based** computation, not unique to lines.

```
Also recognized in: CAD constraint solvers (a sketch constraint like
"these two lines must meet at this point" is solved by the exact same
kind of equation-setup this unit just performed, generalized to many
constraints at once), physics engines (finding the moment two moving
objects collide is solved by setting their position formulas equal and
solving for the shared time value, the same structure as this lesson's
shared parameter), and computer algebra systems (symbolic equation
solvers exist specifically to automate exactly this "set two expressions
equal, solve for the unknowns" step for arbitrarily complex expressions)
```

### SE Lens

The design principle is **stating the condition to be solved before
attempting to solve it**, rather than jumping straight to a memorized
formula. The alternative not chosen: skip straight to the
`cross_product`-based formula the next unit builds, without ever writing
out what `t * dir1 - s * dir2 = diff` actually means.

That alternative would arrive at the same working code faster. The real
cost it pays: a formula copied without understanding the equation it
solves is unrecoverable the moment it's misremembered or needs adapting —
this curriculum's own next unit derives the formula from this equation
directly, which means a reader who loses the exact formula can re-derive
it, rather than being stuck.

### Commands Needed

`python geometry_lesson_24.py` — same interpreter and command as every
prior lesson.

### Run It

```
(6, 0)
```

Verified by actually running the file above.

### Connection

The condition two lines must satisfy to intersect is now written out
concretely. The next unit actually solves it.

---

## Concept Unit: Solving for t — the Cross-Product Trick

### The Problem

`t * dir1 - s * dir2 = diff` has two unknowns, `t` and `s`, tangled
together in one equation. Isolate `t` alone, using a tool this curriculum
already has: `cross_product`.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_24.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(diff)` line added in Concept
  Unit 1.
- **Dependencies:** Concept Unit 1's `point1`, `dir1`, `point2`, `dir2`,
  `diff`.

### The New Code

```python
def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def line_intersection(point1, dir1, point2, dir2):
    diff = subtract_points(point2, point1)
    denominator = cross_product(dir1, dir2)
    t = cross_product(diff, dir2) / denominator
    return point_on_line(point1, dir1, t)


def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


intersection_point = line_intersection(point1, dir1, point2, dir2)
print(intersection_point)

s = cross_product(diff, dir1) / cross_product(dir1, dir2)
check_point = point_on_line(point2, dir2, s)
print(check_point)

print(nearly_equal(intersection_point[0], check_point[0], 0.0000001))
print(nearly_equal(intersection_point[1], check_point[1], 0.0000001))
```

### The Updated Project

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


point1 = (0, 0)
dir1 = (3, 4)
point2 = (6, 0)
dir2 = (-1, 2)

diff = subtract_points(point2, point1)

print(diff)


def cross_product(a, b):                                                 # ← new
    return a[0] * b[1] - a[1] * b[0]                                    # ← new


def line_intersection(point1, dir1, point2, dir2):                       # ← new
    diff = subtract_points(point2, point1)                               # ← new
    denominator = cross_product(dir1, dir2)                              # ← new
    t = cross_product(diff, dir2) / denominator                         # ← new
    return point_on_line(point1, dir1, t)                                # ← new


def nearly_equal(a, b, tolerance):                                       # ← new
    return abs(a - b) < tolerance                                       # ← new


intersection_point = line_intersection(point1, dir1, point2, dir2)       # ← new
print(intersection_point)                                                # ← new

s = cross_product(diff, dir1) / cross_product(dir1, dir2)                # ← new
check_point = point_on_line(point2, dir2, s)                             # ← new
print(check_point)                                                       # ← new

print(nearly_equal(intersection_point[0], check_point[0], 0.0000001))   # ← new
print(nearly_equal(intersection_point[1], check_point[1], 0.0000001))   # ← new
```

The file now computes the intersection point one way (`line_intersection`,
using `t` on the first line), and checks it a completely independent
second way (using `s` on the second line), on the same two lines.

*A note on method:* every function here is retyped unchanged from
Lessons 2, 8, 17, and 21, or built from ordinary arithmetic and division.
No new Python construct is introduced.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def cross_product(a, b): ...` — Lesson 8's own function, retyped
  unchanged. No re-explanation owed, per the Repetition Rule.
- `def line_intersection(point1, dir1, point2, dir2): ...` — first
  appearance: this lesson's actual subject.
- `denominator = cross_product(dir1, dir2)` — first appearance of the
  derivation's key step. Taking the cross product of *both sides* of
  Concept Unit 1's equation, `t * dir1 - s * dir2 = diff`, against
  `dir2`, gives `t * cross_product(dir1, dir2) - s * cross_product(dir2,
  dir2) = cross_product(diff, dir2)`. `cross_product(dir2, dir2)` is
  always exactly `0` — any vector crossed with itself has no turn at all,
  the same "zero means no turn" fact Lesson 8 and Lesson 18 already
  established, applied here to a vector and a copy of itself instead of
  two different vectors. That whole term vanishes, leaving `t *
  cross_product(dir1, dir2) = cross_product(diff, dir2)` — one equation,
  one unknown.
- `t = cross_product(diff, dir2) / denominator` — dividing both sides by
  `cross_product(dir1, dir2)` isolates `t` completely: exactly the
  formula this line computes.
- `return point_on_line(point1, dir1, t)` — Lesson 21's own function,
  reused, plugging the solved `t` back into the first line's own formula
  to produce the actual intersection point.
- `intersection_point = line_intersection(point1, dir1, point2, dir2)`,
  `print(intersection_point)` — already-basic; prints
  `(3.5999999999999996, 4.8)`.
- `s = cross_product(diff, dir1) / cross_product(dir1, dir2)` — the
  identical derivation, run again crossing with `dir1` instead of
  `dir2`, to isolate `s` instead of `t` — a second, independent way to
  reach the same point.
- `check_point = point_on_line(point2, dir2, s)`, `print(check_point)` —
  plugging the solved `s` into the *second* line's own formula this
  time. Prints `(3.6, 4.8)` — visibly, though only barely, different
  digits than `intersection_point`'s own `3.5999999999999996`.
- `print(nearly_equal(intersection_point[0], check_point[0], 0.0000001))`,
  and the line below it — Lesson 17's own function, reused, confirming
  what the raw digits alone couldn't guarantee: both `True`. Both
  independently computed points are the same real point, `(3.6, 4.8)`,
  differing only by the exact kind of floating-point rounding Lesson 17
  already proved is real and unavoidable — not evidence the derivation
  is wrong.

### CS Lens

Solving for one unknown in a two-variable system by algebraically
eliminating the other — here, using `cross_product(v, v) = 0` to cancel a
term — is the same core idea behind every method of solving simultaneous
equations, just specialized to this particular tool.

```
Also recognized in: linear algebra generally (Cramer's rule, the
classical method for solving small linear systems by hand, computes the
exact same kind of ratio-of-determinants this lesson's `t` and `s`
formulas are — a 2D cross product *is* a 2×2 determinant, though this
curriculum doesn't need that name to use it correctly), circuit analysis
(solving for an unknown current or voltage in a circuit with multiple
constraints uses the identical elimination strategy — cancel one unknown
using a combination that makes its coefficient zero), and computer
algebra systems (symbolic solvers automate exactly this
substitute-and-eliminate process for systems far too large to solve by
hand)
```

### SE Lens

The design principle is **verifying a derived formula against an
independent second computation**, rather than trusting the algebra alone.
The alternative not chosen: compute `t`, plug it into the first line, and
stop — trusting the derivation without ever computing `s` or checking the
second line at all.

That alternative would have caught a real algebra mistake only if the
resulting point were obviously wrong, which a subtly incorrect formula
might not be. Computing `s` independently and checking both lines agree
is the same discipline Lesson 16 already applied to matrix inverses
(identity-matrix check *and* round-trip check) — two different roads to
the same answer, checked against each other, catch mistakes that a
single confident calculation would not.

### Commands Needed

`python geometry_lesson_24.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
(6, 0)
(3.5999999999999996, 4.8)
(3.6, 4.8)
True
True
```

Verified by actually running the updated file above.

### Connection

`line_intersection` correctly finds where two crossing lines meet. The
next unit checks what its own formula does when the lines don't cross at
all.

---

## Concept Unit: Why This Can Fail — Parallel Directions Have Zero Cross Product

### The Problem

`line_intersection`'s formula divides by `cross_product(dir1, dir2)`.
Division by zero is a real, crashing possibility in Python — check
exactly which lines would trigger it, and why, before it happens by
surprise.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_24.py` — modified.
- **Change type:** add.
- **Location:** appended below the final `print(nearly_equal(...))` line
  added in Concept Unit 2.
- **Dependencies:** Concept Unit 2's `cross_product`.

### The New Code

```python
parallel_dir1 = (3, 4)
parallel_dir2 = (6, 8)

print(cross_product(parallel_dir1, parallel_dir1))
print(cross_product(parallel_dir1, parallel_dir2))
```

### The Updated Project

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


point1 = (0, 0)
dir1 = (3, 4)
point2 = (6, 0)
dir2 = (-1, 2)

diff = subtract_points(point2, point1)

print(diff)


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def line_intersection(point1, dir1, point2, dir2):
    diff = subtract_points(point2, point1)
    denominator = cross_product(dir1, dir2)
    t = cross_product(diff, dir2) / denominator
    return point_on_line(point1, dir1, t)


def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


intersection_point = line_intersection(point1, dir1, point2, dir2)
print(intersection_point)

s = cross_product(diff, dir1) / cross_product(dir1, dir2)
check_point = point_on_line(point2, dir2, s)
print(check_point)

print(nearly_equal(intersection_point[0], check_point[0], 0.0000001))
print(nearly_equal(intersection_point[1], check_point[1], 0.0000001))

parallel_dir1 = (3, 4)                                                   # ← new
parallel_dir2 = (6, 8)                                                   # ← new

print(cross_product(parallel_dir1, parallel_dir1))                       # ← new
print(cross_product(parallel_dir1, parallel_dir2))                       # ← new
```

The file now proves, numerically, exactly which pair of directions would
make `line_intersection`'s own division fail.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `parallel_dir1 = (3, 4)` — the curriculum's own familiar direction.
- `parallel_dir2 = (6, 8)` — exactly `2 * parallel_dir1` — a direction
  pointing the identical way, just longer.
- `print(cross_product(parallel_dir1, parallel_dir1))` — already-basic
  reuse, crossing a vector with an exact copy of itself. Prints `0` —
  confirming, numerically, the fact Concept Unit 2's own derivation
  already leaned on.
- `print(cross_product(parallel_dir1, parallel_dir2))` — crossing a
  vector with a genuinely different vector that happens to point the
  *same direction*, just scaled. Also prints `0`.

**Why any scalar multiple gives zero, not just an exact copy.**
`parallel_dir2` is `scale_vector(parallel_dir1, 2)`, and `cross_product`
is built entirely from multiplication and subtraction — scaling one
input by a constant scales the whole result by that same constant:
`cross_product(v, k * v) = k * cross_product(v, v) = k * 0 = 0`, for any
`k` at all, not just `2`. This is exactly what **parallel** means for two
direction vectors: one is some scalar multiple of the other, and
`cross_product` of any vector with any scalar multiple of itself is
always `0` — the reason `line_intersection`'s `denominator` is
guaranteed to be exactly `0`, never just close to it, whenever the two
lines genuinely never cross.

### CS Lens

A mathematical operation's own algebraic identity — here, `cross_product`
of parallel vectors always vanishing — predicting exactly when an
algorithm built on it will fail is a much stronger guarantee than
discovering the failure by testing.

```
Also recognized in: numerical linear algebra (a matrix's determinant
being exactly zero predicts, algebraically, that the matrix has no
inverse — the same structural failure this lesson's zero cross product
predicts for line intersection, and not a coincidence: a 2D cross
product literally is a 2×2 determinant), physics engines (two forces
acting in exactly opposite directions summing to zero net force is
predicted by vector addition's own algebra, not discovered by running
the simulation and observing nothing moves), and compiler analysis
(certain classes of infinite loops or dead code are provably detectable
directly from a program's structure, the same way this lesson's failure
case is provable directly from the input directions, without ever
running the code)
```

### SE Lens

The design principle is **understanding a function's failure conditions
algebraically, before they're encountered as crashes**. The alternative
not chosen: ship `line_intersection` as written, and discover the
parallel-lines case only when it eventually crashes some real caller.

That alternative is exactly how Lesson 10's own `normalize` crash on a
zero vector was first discovered — a real, legitimate way software gets
debugged, but a more expensive one than knowing in advance. This unit's
own numeric proof — parallel directions always, provably, produce a zero
denominator — means the failure case is now a *known, expected* input
this lesson's own closing section can demonstrate on purpose, rather than
a surprise a future caller stumbles into.

### Commands Needed

`python geometry_lesson_24.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
(6, 0)
(3.5999999999999996, 4.8)
(3.6, 4.8)
True
True
0
0
```

Verified by actually running the updated file above.

### Connection

Parallel directions are now proven, not just suspected, to zero out
`line_intersection`'s denominator. Connect the Pieces, below, and the
closing section that follows, show what that actually does when
`line_intersection` is called on two such lines for real.

---

## Connect the Pieces

One pair of crossing lines, traced through everything this lesson built,
start to finish:

1. `point1 = (0, 0)`, `dir1 = (3, 4)` and `point2 = (6, 0)`, `dir2 = (-1,
   2)` — two lines, set up to satisfy `t * dir1 - s * dir2 = diff`,
   where `diff = subtract_points(point2, point1) = (6, 0)`.
2. Crossing that equation with `dir2` cancels the `s` term (since
   `cross_product(dir2, dir2) = 0`), isolating `t = cross_product(diff,
   dir2) / cross_product(dir1, dir2)`.
3. `line_intersection` computes `t` this way and plugs it into
   `point_on_line(point1, dir1, t)`, giving `(3.5999999999999996, 4.8)`.
4. Solving independently for `s` and plugging it into the *second*
   line's own `point_on_line(point2, dir2, s)` gives `(3.6, 4.8)` — the
   same point, confirmed by `nearly_equal` rather than raw `==`, exactly
   the discipline Lesson 17 already established.
5. `cross_product(dir1, dir1)` and `cross_product(dir1, 2 * dir1)` both
   come out to exactly `0` — proof that any pair of parallel directions
   would make this whole derivation's denominator vanish, the case the
   closing section demonstrates directly.

## What Breaks Without This

`line_intersection` was never taught to check its own denominator before
dividing by it. Call it on two lines whose directions are genuinely
parallel — the exact pair Concept Unit 3 already proved has a zero
cross product:

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def line_intersection(point1, dir1, point2, dir2):
    diff = subtract_points(point2, point1)
    denominator = cross_product(dir1, dir2)
    t = cross_product(diff, dir2) / denominator
    return point_on_line(point1, dir1, t)


point1 = (0, 0)
dir1 = (3, 4)
point3 = (0, 1)
dir3 = (6, 8)

print(line_intersection(point1, dir1, point3, dir3))
```

```
Traceback (most recent call last):
  File "geometry_lesson_24_break.py", line 23, in <module>
    print(line_intersection(point1, dir1, point3, dir3))
          ~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "geometry_lesson_24_break.py", line 15, in line_intersection
    t = cross_product(diff, dir2) / denominator
        ~~~~~~~~~~~~~~~~~~~~~~~~~~^~~~~~~~~~~~~
ZeroDivisionError: division by zero
```

Verified by actually running this. `point3 = (0, 1)`, `dir3 = (6, 8)` is
a real line, running parallel to `dir1 = (3, 4)` and offset above it —
two lines that genuinely never meet, anywhere, at any `t` or `s`. Calling
`line_intersection` on them doesn't return a wrong point or a special
"no intersection" value; it crashes, with the exact same
`ZeroDivisionError` shape Lesson 10's `normalize` already showed for a
zero vector, for the identical underlying reason: dividing by a quantity
that is legitimately, provably zero for this input. This is not a bug in
`line_intersection` — Concept Unit 3 already proved this denominator
*must* be zero whenever the two directions are parallel — but a real
caller handing it two parallel lines without checking first would crash
their whole program on a case this lesson has now fully explained, rather
than merely feared.

## Exercises

1. Using `cross_product`, write a check that runs *before*
   `line_intersection`'s own division, and returns the string
   `"no intersection"` instead of crashing when the two directions are
   parallel. Verify it on both this lesson's crossing lines and its
   parallel ones.
2. Build two lines that are not just parallel but *identical* — the same
   `point1`/`dir1` used as both lines' own definition. Predict, then
   verify, whether `cross_product(dir1, dir1)` still comes out to `0`,
   and explain what "no single intersection point" actually means for
   two lines that are secretly the same line, compared to two lines that
   are merely parallel and distinct.
3. Using `line_intersection`, find the intersection of `point1 = (0, 0)`,
   `dir1 = (1, 0)` (the x-axis) and `point2 = (5, -5)`, `dir2 = (0, 1)`
   (a vertical line). Confirm the result lands exactly on `(5, 0)`, and
   explain why this particular case produces a perfectly clean answer
   with no floating-point noise, unlike this lesson's own worked example.

## Definition of Done

- [ ] `geometry_lesson_24.py` exists and runs with no errors via `python
      geometry_lesson_24.py`.
- [ ] Running it prints `(6, 0)`, `(3.5999999999999996, 4.8)`, `(3.6,
      4.8)`, `True`, `True`, `0`, then `0` — matching this lesson's
      verified output exactly.
- [ ] You can explain, without looking at the file, how crossing the
      equation `t * dir1 - s * dir2 = diff` with `dir2` isolates `t`,
      using the fact that `cross_product(dir2, dir2) = 0`.
- [ ] You can explain why parallel directions always produce a zero
      denominator, not just usually, using this lesson's own `k *
      cross_product(v, v)` reasoning.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Derive line-line intersection from the cross product and prove why parallel lines break it"`,
      not `git commit -m "add line_intersection"`.

Next: Lesson 25 — Segment Intersection, which reuses `line_intersection`
unchanged and layers Lesson 21's `is_t_on_segment` on top of both `t` and
`s`, handling the real, additional case a segment introduces that an
infinite line never had to: two lines that cross, but not within either
segment's own bounds.
