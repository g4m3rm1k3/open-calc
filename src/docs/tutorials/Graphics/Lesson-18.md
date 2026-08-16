# Lesson 18: Exact vs. Approximate Geometry

**What you will build:** `is_point_on_line`, a yes/no geometric test built
from Lesson 2's `subtract_points` and Lesson 8's `cross_product`, first
proven correct on clean integer points — then handed a point that is
*mathematically* on that same line but was *produced* by Lesson 10's
`normalize`, and shown to silently answer wrong. Fixed by rebuilding the
same test on Lesson 17's `nearly_equal` instead of `==`. The transferable
problem: Lesson 17 asked whether two plain *numbers* are close enough to
count as equal. This lesson asks the same question one level up — can an
entire yes/no geometric *decision* be trusted once the numbers behind it
carry rounding error, and what does getting that decision wrong actually
cost.

**What you need to know first:** Lesson 2's `subtract_points`, Lesson 8's
`cross_product` (its zero-value case specifically), Lesson 10's
`normalize`, and Lesson 17's `nearly_equal` and its own already-proven
`0.6000000000000001`-shaped rounding error.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–17.

**Terms introduced in this lesson:**

- **Collinear** — three or more points that all lie on a single straight
  line. Why: this lesson's whole test exists to answer exactly one
  question — is a given point collinear with two others — and Lesson 8's
  `cross_product` already computes the one number (zero, when true) that
  answers it.
- **False negative** — a test that answers "no" for a case that is
  actually "yes," here specifically because of floating-point rounding
  rather than any real geometric difference. Why: this is exactly what
  this lesson's own `is_point_on_line` does to a point that is genuinely,
  mathematically on the line it's tested against.

**Objects and methods used:**

None. This lesson's new function, `is_point_on_line`, and its later
tolerant version, are hand-authored project code, built entirely from
Lessons 2, 8, 10, and 17's own reused functions.

---

## Concept Unit: A Collinearity Test — Reusing the Cross Product

### The Problem

Lesson 8 established that `cross_product`'s *sign* tells which way a turn
goes — left, right, or (when it comes out to exactly zero) no turn at
all. A turn of exactly zero between two vectors sharing a starting point
means all three points involved fall on one straight line. Build a real
yes/no test out of that fact: given a point and a line defined by two
other points, is the point on that line?

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–17.
- **Files affected:** `geometry_lesson_18.py` — created, as a new file
  for this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def is_point_on_line(p, line_start, line_end):
    return cross_product(subtract_points(line_end, line_start), subtract_points(p, line_start)) == 0


line_start = (0, 0)
line_end = (3, 4)

print(is_point_on_line((15, 20), line_start, line_end))
print(is_point_on_line((15, 21), line_start, line_end))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `subtract_points` and `cross_product` are Lesson 2
and Lesson 8's own functions, retyped unchanged; comparing a result with
`==` has been used since Lesson 5. No new Python construct appears here,
so no isolated throwaway lab is needed; what's new is the specific
*question* this arrangement of already-familiar pieces answers.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def subtract_points(a, b): ...`, `def cross_product(a, b): ...` —
  Lesson 2 and Lesson 8's own functions, retyped unchanged. No
  re-explanation owed for their mechanics, per the Repetition Rule.
- `def is_point_on_line(p, line_start, line_end): ...` — first
  appearance: a new function combining both reused ones.
- `return cross_product(subtract_points(line_end, line_start),
  subtract_points(p, line_start)) == 0` — `subtract_points(line_end,
  line_start)` builds the direction vector running along the line;
  `subtract_points(p, line_start)` builds a second vector from the same
  starting point out to `p`. `cross_product` of those two vectors, per
  Lesson 8, comes out to exactly `0` precisely when there's no turn
  between them — when `p` sits somewhere on the infinite line the first
  vector defines. The trailing `== 0` turns that number into this
  lesson's actual yes/no answer: **collinear**, by name, is what "no turn
  at all" means for three points.
- `line_start = (0, 0)`, `line_end = (3, 4)` — the line this lesson tests
  against throughout: the same `(3, 4)` direction used since Lesson 9's
  own `norm` example.
- `print(is_point_on_line((15, 20), line_start, line_end))` —
  `(15, 20)` is exactly `5 * (3, 4)`, sitting cleanly on the line.
- `print(is_point_on_line((15, 21), line_start, line_end))` — `(15, 21)`
  is one unit off that line — a genuine, non-floating-point difference.

### CS Lens

Reducing a geometric yes/no question to checking whether one already-computed
number equals zero is the core idea behind every **geometric predicate** —
a term this curriculum names properly in the very next lesson — but the
technique itself, building a decision on top of an algebraic sign or zero
check, recurs well beyond this one test.

```
Also recognized in: computational geometry libraries broadly (point-in-
polygon, line-segment-intersection, and convex-hull algorithms are all
built from a small set of sign-and-zero tests like this lesson's own),
physics engines (deciding whether two objects are touching, overlapping,
or separate usually comes down to checking the sign of a computed
distance or a cross-product-like quantity), and CAD constraint solvers
(a "these two lines must be parallel" or "this point must lie on this
curve" constraint is enforced by driving exactly this kind of test result
toward zero)
```

### SE Lens

The design principle is **building a new, specific test entirely out of
already-trusted pieces**, rather than inventing new logic from scratch.
The alternative not chosen: derive a fresh formula for collinearity
directly — solving the line's slope-intercept equation and checking
whether `p` satisfies it, say — instead of reusing `cross_product`.

That alternative would work too, but re-derives math this curriculum
already built, tested, and trusted back in Lesson 8, including its
correct handling of vertical lines (where a slope-based formula divides
by zero and `cross_product` simply doesn't). The real cost of reuse
instead: `is_point_on_line`'s correctness now depends entirely on
`cross_product`'s own correctness and, less obviously, on every float
that ever reaches it — a dependency this lesson's very next unit exposes
directly.

### Commands Needed

`python geometry_lesson_18.py` — same interpreter and command as every
prior lesson.

### Run It

```
True
False
```

Verified by actually running the file above. `(15, 20)`, genuinely on the
line, correctly reports `True`; `(15, 21)`, genuinely off it, correctly
reports `False`.

### Connection

`is_point_on_line` works correctly on points typed directly as clean
integers. The next unit hands it a point that came from a real
computation instead.

---

## Concept Unit: When a Correct Point Fails the Test

### The Problem

Every point handed to `is_point_on_line` so far was typed by hand as a
clean integer tuple. A real CAD/CAM system's points usually come from
somewhere else — a `normalize`, a `transform_to_global`, a chain of
matrix multiplications — any of which, Lesson 17 already proved, can
introduce a tiny floating-point error nowhere near what a human would
type by hand. Check whether `is_point_on_line` survives that.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_18.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(is_point_on_line((15, 21), ...))`
  line added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `is_point_on_line`, `line_start`,
  `line_end`.

### The New Code

```python
import math


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def scale_vector(v, factor):
    return (v[0] * factor, v[1] * factor)


def normalize(v):
    return scale_vector(v, 1 / norm(v))


direction = (3, 4)
unit_direction = normalize(direction)
computed_point = scale_vector(unit_direction, 5 * norm(direction))

print(unit_direction)
print(computed_point)
print(is_point_on_line(computed_point, line_start, line_end))
```

### The Updated Project

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def is_point_on_line(p, line_start, line_end):
    return cross_product(subtract_points(line_end, line_start), subtract_points(p, line_start)) == 0


line_start = (0, 0)
line_end = (3, 4)

print(is_point_on_line((15, 20), line_start, line_end))
print(is_point_on_line((15, 21), line_start, line_end))


import math                                                              # ← new


def dot_product(a, b):                                                  # ← new
    return a[0] * b[0] + a[1] * b[1]                                    # ← new


def norm(v):                                                             # ← new
    return math.sqrt(dot_product(v, v))                                 # ← new


def scale_vector(v, factor):                                             # ← new
    return (v[0] * factor, v[1] * factor)                               # ← new


def normalize(v):                                                        # ← new
    return scale_vector(v, 1 / norm(v))                                 # ← new


direction = (3, 4)                                                       # ← new
unit_direction = normalize(direction)                                    # ← new
computed_point = scale_vector(unit_direction, 5 * norm(direction))       # ← new

print(unit_direction)                                                    # ← new
print(computed_point)                                                    # ← new
print(is_point_on_line(computed_point, line_start, line_end))            # ← new
```

The file now runs its own collinearity test against a point built the
way a real pipeline would build one — through `normalize` and
`scale_vector` — instead of a point typed by hand.

*A note on method:* `import math`, `dot_product`, `norm`, `scale_vector`,
and `normalize` are Lessons 7, 9, 3, and 10's own code, retyped
unchanged. No new Python construct appears in this unit; what's new is
what happens when Concept Unit 1's already-correct test meets
already-familiar floating-point behavior.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `import math`, `def dot_product(a, b): ...`, `def norm(v): ...`, `def
  scale_vector(v, factor): ...`, `def normalize(v): ...` — Lessons 7, 9,
  3, and 10's own code, retyped unchanged. No re-explanation owed, per
  the Repetition Rule.
- `direction = (3, 4)` — the same direction `line_end` already uses.
- `unit_direction = normalize(direction)` — Lesson 10 and Lesson 17's own
  computation, reused. Printed below as `(0.6000000000000001, 0.8)` —
  the exact same rounding pattern Lesson 17 already proved is real, not a
  new surprise.
- `computed_point = scale_vector(unit_direction, 5 * norm(direction))` —
  first appearance of building a point *the way a real system would*:
  take the unit direction, scale it back out to `5` times its original
  length. Mathematically, this must land exactly on `5 * (3, 4) = (15,
  20)` — the same point Concept Unit 1 already confirmed is on the line.
- `print(unit_direction)`, `print(computed_point)` — already-basic;
  `computed_point` prints as `(15.000000000000002, 20.0)` — visibly,
  though barely, different from the clean `(15, 20)` it should
  mathematically equal.
- `print(is_point_on_line(computed_point, line_start, line_end))` —
  reusing Concept Unit 1's own function, unchanged, on this new point.
  It prints `False`.

**This is a false negative, not a bug in `is_point_on_line`.**
`computed_point` is genuinely, mathematically on the line through `(3,
4)` — it was built by scaling that exact direction. The `False` comes
entirely from `cross_product`'s own arithmetic landing on a number
extremely close to, but not exactly, `0` — the same two-roundings
pattern Lesson 17's `3 * (1 / 5.0)` already demonstrated, now feeding
into a yes/no decision instead of a plain printed number. Nothing about
`is_point_on_line`'s logic is wrong; the float it was handed simply
wasn't exactly what the math says it should be.

### CS Lens

A correct algorithm producing a wrong-looking answer because of the
floating-point values it was handed — not because of any flaw in the
algorithm itself — is exactly the problem the field calls **numerical
robustness**, and it recurs anywhere geometry meets floating point.

```
Also recognized in: 3D modeling software (a CAD kernel's boolean
operations — union, subtraction — are notorious for failing on inputs
that are "almost" coincident, for exactly this reason, and production
kernels invest heavily in tolerance handling to compensate), computer
vision (matching two point clouds, or checking whether a detected edge
is "the same" edge seen from two camera angles, runs into this exact
false-negative risk constantly), and video game physics (a falling object
resting "on" a floor is essentially never at a mathematically exact
zero-distance from it, so every physics engine's contact detection
already assumes tolerance rather than exactness)
```

### SE Lens

The design principle this unit exposes, without yet fixing, is that
**a test's correctness on hand-typed inputs doesn't guarantee its
correctness on computed inputs**. The alternative not chosen (so far):
assume Concept Unit 1's clean `True`/`False` results on integer points
mean the function is simply done and correct.

That assumption would have been reasonable-looking and wrong — every
integer test passed, and the function's own logic never changed between
Concept Unit 1 and this one. The real cost of trusting it anyway: any
future lesson, or any real CAD/CAM pipeline, that feeds
`is_point_on_line` a point produced by `normalize`, `apply_matrix`, or
any other floating-point computation would silently get incorrect
answers on genuinely correct geometry, with no error and no warning —
exactly the kind of failure that's expensive precisely because nothing
about it looks broken.

### Commands Needed

`python geometry_lesson_18.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
True
False
(0.6000000000000001, 0.8)
(15.000000000000002, 20.0)
False
```

Verified by actually running the updated file above.

### Connection

`is_point_on_line` gave a false negative on a genuinely correct point.
Lesson 17 already built the fix for exactly this shape of problem — the
next unit applies it.

---

## Concept Unit: Tolerant Predicates — Applying Lesson 17's Fix to a Yes/No Question

### The Problem

Concept Unit 2's failure has the identical shape as Lesson 17's own
`0.1 + 0.2 == 0.3` problem: a plain `==` check failing on a value that's
correct except for an unavoidable, tiny rounding difference. Lesson 17
already built `nearly_equal` for exactly this. Apply it here.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_18.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(is_point_on_line(computed_point, ...))`
  line added in Concept Unit 2.
- **Dependencies:** Concept Unit 1's `subtract_points`, `cross_product`,
  `line_start`, `line_end`, Concept Unit 2's `computed_point`.

### The New Code

```python
def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


def is_point_on_line_tolerant(p, line_start, line_end, tolerance):
    cross_value = cross_product(subtract_points(line_end, line_start), subtract_points(p, line_start))
    return nearly_equal(cross_value, 0, tolerance)


print(is_point_on_line_tolerant(computed_point, line_start, line_end, 0.0000001))
```

### The Updated Project

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def is_point_on_line(p, line_start, line_end):
    return cross_product(subtract_points(line_end, line_start), subtract_points(p, line_start)) == 0


line_start = (0, 0)
line_end = (3, 4)

print(is_point_on_line((15, 20), line_start, line_end))
print(is_point_on_line((15, 21), line_start, line_end))


import math


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def scale_vector(v, factor):
    return (v[0] * factor, v[1] * factor)


def normalize(v):
    return scale_vector(v, 1 / norm(v))


direction = (3, 4)
unit_direction = normalize(direction)
computed_point = scale_vector(unit_direction, 5 * norm(direction))

print(unit_direction)
print(computed_point)
print(is_point_on_line(computed_point, line_start, line_end))


def nearly_equal(a, b, tolerance):                                       # ← new
    return abs(a - b) < tolerance                                        # ← new


def is_point_on_line_tolerant(p, line_start, line_end, tolerance):       # ← new
    cross_value = cross_product(subtract_points(line_end, line_start), subtract_points(p, line_start))  # ← new
    return nearly_equal(cross_value, 0, tolerance)                       # ← new


print(is_point_on_line_tolerant(computed_point, line_start, line_end, 0.0000001))  # ← new
```

The file now has two versions of the same test side by side: the strict
one that failed on `computed_point`, and a tolerant one built on top of
Lesson 17's own fix.

*A note on method:* `nearly_equal` is Lesson 17's own function, retyped
unchanged; everything else in this unit is already-basic syntax. No new
Python construct is introduced.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def nearly_equal(a, b, tolerance): ...` — Lesson 17's own function,
  retyped unchanged. No re-explanation owed, per the Repetition Rule.
- `def is_point_on_line_tolerant(p, line_start, line_end, tolerance):
  ...` — first appearance: the same shape as Concept Unit 1's
  `is_point_on_line`, but taking one extra argument.
- `cross_value = cross_product(subtract_points(line_end, line_start),
  subtract_points(p, line_start))` — the identical computation Concept
  Unit 1's function performs, just stored in a named variable instead of
  returned immediately, so it can be checked against `nearly_equal`
  instead of `==` on the next line.
- `return nearly_equal(cross_value, 0, tolerance)` — Lesson 17's own
  tolerance check, applied to a cross product instead of a bare
  arithmetic result. This is the same technique, not a new one: "is this
  computed value close enough to zero" is exactly what "is this computed
  value close enough to `0.3`" already was in Lesson 17.
- `print(is_point_on_line_tolerant(computed_point, line_start, line_end,
  0.0000001))` — already-basic call, this time on the exact point that
  produced Concept Unit 2's false negative.

### CS Lens

Rebuilding an existing test on top of a tolerance instead of exact
equality — without changing what question it's actually answering — is
the same idea Lesson 17 already named, applied one level up: from
comparing raw numbers to comparing the *outcome of a geometric
computation*.

```
Also recognized in: production computational geometry libraries (CGAL
and similar libraries build entire families of "robust predicates" that
wrap exact-looking tests like this one in carefully chosen tolerances, or
in exact arithmetic, specifically because naive floating-point versions
fail exactly this way), mesh-processing software (deciding whether two
mesh vertices are "the same" point, so they can be merged, is this exact
tolerant-equality test applied to 3D coordinates), and manufacturing
tolerancing itself (a machined part's dimensions are specified with an
explicit `±` tolerance for the same underlying reason: no real
measurement, physical or computed, is ever perfectly exact)
```

### SE Lens

The design principle is **keeping the strict version instead of replacing
it**, rather than deleting `is_point_on_line` once its tolerant
replacement exists. The alternative not chosen: overwrite
`is_point_on_line` itself to always use a tolerance, so there's only ever
one version of the test.

That alternative would remove the earlier false negative for good. The
real cost it pays: a fixed built-in tolerance can't be right for every
caller — a CAD system checking millimeter-scale machine positions and one
checking sub-micron optical alignments need very different tolerances,
and baking one choice into `is_point_on_line` itself would silently wrong
one of them. Keeping both versions, with the tolerant one taking an
explicit `tolerance` argument, puts that choice in the hands of whoever
calls it, at the cost of one more parameter to think about on every call.

### Commands Needed

`python geometry_lesson_18.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
True
False
(0.6000000000000001, 0.8)
(15.000000000000002, 20.0)
False
True
```

Verified by actually running the updated file above. The tolerant version
correctly recovers `True` for the exact point the strict version wrongly
rejected.

### Connection

Both versions of the test now exist, on the exact same point, with
opposite answers — the strict one wrong, the tolerant one right. Connect
the Pieces, below, traces why, and What Breaks Without This shows the
tolerant version has its own real limit.

---

## Connect the Pieces

One concrete value, traced through everything this lesson built, start to
finish:

1. `line_start = (0, 0)`, `line_end = (3, 4)` — this lesson's fixed line.
2. `is_point_on_line((15, 20), ...)` returns `True` — a hand-typed,
   exactly collinear point, correctly recognized.
3. `computed_point = scale_vector(normalize((3, 4)), 5 * norm((3, 4)))`
   comes out to `(15.000000000000002, 20.0)` — mathematically identical
   to `(15, 20)`, but carrying the same rounding error Lesson 17 already
   proved is real.
4. `is_point_on_line(computed_point, ...)` returns `False` — a false
   negative, caused entirely by that rounding error, not by any actual
   geometric difference.
5. `is_point_on_line_tolerant(computed_point, ..., 0.0000001)` returns
   `True` — the same underlying `cross_product` computation, now checked
   with `nearly_equal` instead of `==`, correctly recognizing the point
   as collinear.

## What Breaks Without This

Concept Unit 3's tolerant test fixed a false negative — but a tolerance
is a real number someone has to choose, and Lesson 17's own SE Lens
already flagged the risk of choosing one too large. Check it directly,
using a point that is genuinely, visibly off the line, not just a
floating-point-noise case:

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


def is_point_on_line_tolerant(p, line_start, line_end, tolerance):
    cross_value = cross_product(subtract_points(line_end, line_start), subtract_points(p, line_start))
    return nearly_equal(cross_value, 0, tolerance)


line_start = (0, 0)
line_end = (3, 4)

off_line_point = (15.01, 20)

print(is_point_on_line_tolerant(off_line_point, line_start, line_end, 0.0000001))
print(is_point_on_line_tolerant(off_line_point, line_start, line_end, 1.0))
```

```
False
True
```

Verified by actually running this. `(15.01, 20)` sits a real, visible
`0.01` units off the line through `(3, 4)` — nothing to do with floating-
point rounding; a person measuring it would call it genuinely off. A
tight, sensible tolerance (`0.0000001`, the same value used throughout
this lesson) correctly reports `False`. A tolerance chosen too generously
(`1.0`) reports `True` — a **false positive**, wrongly calling a
genuinely off-line point collinear. Lesson 17 already named this
tradeoff in the abstract; this lesson's own `is_point_on_line_tolerant`
makes it concrete: too tight a tolerance brings back Concept Unit 2's
false negatives, and too loose a tolerance manufactures false positives
out of real geometric errors — the choice of tolerance is not a detail to
pick arbitrarily, it's a real engineering decision with a genuine failure
mode on both sides.

## Exercises

1. Using `is_point_on_line_tolerant`, find the largest tolerance (to one
   significant digit, e.g. `0.001`, `0.0001`, ...) that still correctly
   rejects `off_line_point = (15.01, 20)`, and the smallest tolerance that
   still correctly accepts `computed_point` from Concept Unit 2. Report
   both.
2. Build a second `computed_point`, this time using `direction = (1, 1)`
   instead of `(3, 4)`, scaled out to some multiple of its own length.
   Verify whether `is_point_on_line` still gives a false negative for
   this direction, and if so, confirm `is_point_on_line_tolerant` still
   recovers the correct answer.
3. Predict, then verify, what `is_point_on_line_tolerant` returns for the
   line's own two defining points, `line_start` and `line_end` themselves,
   passed in as the point being tested. Explain why that specific case
   works even without needing floating-point tolerance at all.

## Definition of Done

- [ ] `geometry_lesson_18.py` exists and runs with no errors via `python
      geometry_lesson_18.py`.
- [ ] Running it prints `True`, `False`, `(0.6000000000000001, 0.8)`,
      `(15.000000000000002, 20.0)`, `False`, then `True` — matching this
      lesson's verified output exactly.
- [ ] You can explain, without looking at the file, why `computed_point`
      fails `is_point_on_line` despite being genuinely on the line, using
      the term "false negative."
- [ ] You can explain why a tolerance that's too large is just as real a
      bug as one that's too small, using this lesson's own verified
      `off_line_point` result.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Build a collinearity test and prove it needs tolerance, not exact equality, on computed points"`,
      not `git commit -m "add is_point_on_line"`.

Next: Lesson 19 — Geometric Predicates, which names and generalizes the
technique this lesson only applied once — turning a geometric yes/no
question into a single numeric sign-or-zero test — building directly on
Lesson 8's `cross_product`, Lesson 11's orientation test, and this
lesson's own tolerant-comparison pattern.
