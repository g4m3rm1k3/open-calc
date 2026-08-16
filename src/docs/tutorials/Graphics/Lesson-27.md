# Lesson 27: Collinearity

**What you will build:** `are_points_collinear`, checking a whole batch
of points at once — using this curriculum's first real `for` loop in
project code — reusing Lesson 18's `is_point_on_line` unchanged inside
it. The transferable problem: Lesson 18's predicate handles exactly
three points — one candidate, two defining the line. Real verification
work rarely comes in threes: checking that an entire row of drilled
holes runs straight, or that every vertex of a supposedly flat edge
actually lies on it, means checking an arbitrary, unknown-in-advance
number of points against a shared line — and no amount of unrolled,
hand-written calls can do that, because the count isn't fixed ahead of
time.

**What you need to know first:** Lesson 18's `is_point_on_line` and
`is_point_on_line_tolerant`, and Python's `for` loop and `list` indexing
— both explicitly assumed background from the very start of this
curriculum, used for the first time in real project code in this lesson.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–26 — this lesson is the first to actually *use* the `for`-loop and
`list`-indexing portions of that assumed background in real project
code, rather than only relying on tuples and hand-unrolled function
calls.

**Terms introduced in this lesson:**

None. This lesson combines already-introduced material — Lesson 18's
predicate, and assumed-background `for` loops and list indexing — into a
new arrangement, without introducing a new named concept.

**Objects and methods used:**

None. `are_points_collinear` and `are_points_collinear_tolerant` are
hand-authored project code, reusing Lesson 18's own functions.

---

## Concept Unit: Checking Every Point Against the First Two

### The Problem

Lesson 21 through 26 have all unrolled small, fixed-size computations by
hand — three matrix rows, three triangle corners — deliberately avoiding
a `for` loop because every case so far had a small, known-in-advance
count. Checking whether an entire batch of points is collinear breaks
that pattern: the batch could hold three points or three hundred, and the
function has to work either way without being rewritten for each size.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–26.
- **Files affected:** `geometry_lesson_27.py` — created, as a new file
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


def is_point_on_line(p, a, b):
    return cross_product(subtract_points(b, a), subtract_points(p, a)) == 0


def are_points_collinear(points):
    first_point = points[0]
    second_point = points[1]
    for point in points:
        if is_point_on_line(point, first_point, second_point) == False:
            return False
    return True


collinear_points = [(0, 0), (3, 4), (6, 8), (9, 12)]
non_collinear_points = [(0, 0), (3, 4), (6, 8), (9, 13)]

print(are_points_collinear(collinear_points))
print(are_points_collinear(non_collinear_points))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `for` loops and `list` indexing are both explicitly
assumed background, stated in this curriculum's own ground rules since
Lesson 1 — the same category as `int`/`float` arithmetic or `print()`.
No first-appearance treatment or isolated lab is owed for either one,
the same way none was ever owed for a plain `+` or a tuple literal; this
unit simply uses them, for the first time, in real project code.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def subtract_points(a, b): ...`, `def cross_product(a, b): ...`, `def
  is_point_on_line(p, a, b): ...` — Lesson 2, 8, and 18's own functions,
  retyped unchanged. No re-explanation owed, per the Repetition Rule.
- `def are_points_collinear(points): ...` — first appearance: a function
  taking a whole `list` of points, rather than a fixed number of
  individually named ones.
- `first_point = points[0]`, `second_point = points[1]` — already-basic
  `list` indexing (assumed background), picking out the first two points
  in the batch to define the line every other point gets checked against.
- `for point in points:` — already-basic `for` loop (assumed
  background), visiting each point in the `list` in order, one at a time,
  binding it to the name `point` for the body beneath it.
- `if is_point_on_line(point, first_point, second_point) == False: return
  False` — already-basic `if`/`else`-shaped logic (Lesson 19's own
  construct, no re-explanation owed), a **guard clause** (Lesson 25's own
  term) run once per point in the loop: the moment any single point
  fails Lesson 18's own collinearity test, the whole function exits
  immediately with `False` — no need to check the rest of the batch once
  one failure is already found.
- `return True` — reached only if every single point in the loop passed
  its own check without ever triggering the guard clause above.
- `collinear_points = [...]`, `non_collinear_points = [...]` —
  already-basic `list` literals, four points each, the last one changed
  by a single unit in the second list to break collinearity.
- The two `print(are_points_collinear(...))` calls — already-basic;
  `True` for the genuinely collinear batch, `False` for the batch with
  one point nudged off the line.

**Execution trace, `are_points_collinear(non_collinear_points)`:**

1. `point = (0, 0)` — `is_point_on_line((0, 0), (0, 0), (3, 4))` is
   `True` (a point is always on any line through itself); no return yet.
2. `point = (3, 4)` — `is_point_on_line((3, 4), (0, 0), (3, 4))` is
   `True` (a point is always on any line through itself and another
   point); no return yet.
3. `point = (6, 8)` — genuinely on the line through `(0, 0)` and
   `(3, 4)`; `is_point_on_line` is `True`; no return yet.
4. `point = (9, 13)` — off the line by one unit; `is_point_on_line` is
   `False`, the guard clause's condition (`== False`) is `True`, and the
   function returns `False` immediately — the loop never gets a chance to
   finish, because there's nothing left to check once one failure is
   found.

### CS Lens

Iterating over a collection and returning immediately on the first
failure — rather than checking every element and combining the results
afterward — is a common, efficient pattern once a "does everything
satisfy this" question is being asked.

```
Also recognized in: input validation across virtually every real system
(checking a whole form's fields, or every row of an imported spreadsheet,
typically stops and reports the first invalid one rather than always
scanning the rest), test suites (many test runners stop a single test at
its first failing assertion, rather than continuing to evaluate
assertions that no longer matter), and database constraint checking (a
uniqueness or foreign-key constraint check across many rows can usually
stop the moment one violation is found, without needing to check every
remaining row)
```

### SE Lens

The design principle is **writing one function that scales to any input
size, instead of one function per fixed size**. The alternative not
chosen: keep this curriculum's established unrolled style, and provide
`are_three_points_collinear`, `are_four_points_collinear`, and so on, one
function per count actually needed.

That alternative would have avoided introducing a loop into real project
code at all, matching every lesson since 1. The real cost it pays: a real
CAD/CAM system doesn't know in advance how many holes a row will have, or
how many points a scanned edge will be sampled into — a fixed-count
function can only ever handle the counts someone thought to write ahead
of time. `are_points_collinear`'s `for` loop handles a batch of any size,
including one this curriculum's own author never anticipated, at the
cost of the one thing every prior lesson deliberately avoided until the
input size finally demanded it.

### Commands Needed

`python geometry_lesson_27.py` — same interpreter and command as every
prior lesson.

### Run It

```
True
False
```

Verified by actually running the file above.

### Connection

`are_points_collinear` correctly handles a whole batch of hand-typed
integer points. The next unit checks whether it holds up against a batch
containing a floating-point-computed point, the same way Lesson 18
already tested its own single-point version.

---

## Concept Unit: A Tolerant Version for Computed Batches

### The Problem

Lesson 18 already proved that a single point produced by `normalize` and
`scale_vector` can fail a strict collinearity check by a tiny
floating-point margin, even when it's genuinely on the line. Nothing
about looping over more points removes that risk — if anything, a larger
batch has more chances for it to appear. Build the tolerant version.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_27.py` — modified.
- **Change type:** add.
- **Location:** appended below the final `print(are_points_collinear(...))`
  line added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `subtract_points`, `cross_product`,
  `are_points_collinear`.

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


def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


def is_point_on_line_tolerant(p, a, b, tolerance):
    return nearly_equal(cross_product(subtract_points(b, a), subtract_points(p, a)), 0, tolerance)


def are_points_collinear_tolerant(points, tolerance):
    first_point = points[0]
    second_point = points[1]
    for point in points:
        if is_point_on_line_tolerant(point, first_point, second_point, tolerance) == False:
            return False
    return True


computed_point = scale_vector(normalize((3, 4)), 5 * norm((3, 4)))
computed_batch = [(0, 0), (3, 4), computed_point]

print(computed_point)
print(are_points_collinear(computed_batch))
print(are_points_collinear_tolerant(computed_batch, 0.0000001))
```

### The Updated Project

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def is_point_on_line(p, a, b):
    return cross_product(subtract_points(b, a), subtract_points(p, a)) == 0


def are_points_collinear(points):
    first_point = points[0]
    second_point = points[1]
    for point in points:
        if is_point_on_line(point, first_point, second_point) == False:
            return False
    return True


collinear_points = [(0, 0), (3, 4), (6, 8), (9, 12)]
non_collinear_points = [(0, 0), (3, 4), (6, 8), (9, 13)]

print(are_points_collinear(collinear_points))
print(are_points_collinear(non_collinear_points))


import math                                                               # ← new


def dot_product(a, b):                                                   # ← new
    return a[0] * b[0] + a[1] * b[1]                                    # ← new


def norm(v):                                                             # ← new
    return math.sqrt(dot_product(v, v))                                 # ← new


def scale_vector(v, factor):                                             # ← new
    return (v[0] * factor, v[1] * factor)                               # ← new


def normalize(v):                                                        # ← new
    return scale_vector(v, 1 / norm(v))                                 # ← new


def nearly_equal(a, b, tolerance):                                       # ← new
    return abs(a - b) < tolerance                                       # ← new


def is_point_on_line_tolerant(p, a, b, tolerance):                       # ← new
    return nearly_equal(cross_product(subtract_points(b, a), subtract_points(p, a)), 0, tolerance)  # ← new


def are_points_collinear_tolerant(points, tolerance):                    # ← new
    first_point = points[0]                                              # ← new
    second_point = points[1]                                             # ← new
    for point in points:                                                 # ← new
        if is_point_on_line_tolerant(point, first_point, second_point, tolerance) == False:  # ← new
            return False                                                 # ← new
    return True                                                          # ← new


computed_point = scale_vector(normalize((3, 4)), 5 * norm((3, 4)))       # ← new
computed_batch = [(0, 0), (3, 4), computed_point]                        # ← new

print(computed_point)                                                    # ← new
print(are_points_collinear(computed_batch))                              # ← new
print(are_points_collinear_tolerant(computed_batch, 0.0000001))          # ← new
```

The file now has both a strict and a tolerant version of batch
collinearity checking, tested against the same floating-point-computed
point Lesson 18 already used to prove the strict version's own weakness.

*A note on method:* every function here is retyped unchanged from
Lessons 3, 7, 9, 10, and 17, or built by directly mirroring Concept Unit
1's own `are_points_collinear` with `is_point_on_line_tolerant` swapped
in for `is_point_on_line`. No new Python construct is introduced.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `import math`, `def dot_product(...)`, `def norm(...)`, `def
  scale_vector(...)`, `def normalize(...)`, `def nearly_equal(...)`, `def
  is_point_on_line_tolerant(...)` — Lesson 3, 7, 9, 10, and 17's own
  code, retyped unchanged. No re-explanation owed, per the Repetition
  Rule.
- `def are_points_collinear_tolerant(points, tolerance): ...` — first
  appearance, but its body is a direct mirror of Concept Unit 1's own
  `are_points_collinear` — same parameter shape, same loop, same guard
  clause — with `is_point_on_line_tolerant` swapped in for
  `is_point_on_line`, and an extra `tolerance` argument threaded through.
- `computed_point = scale_vector(normalize((3, 4)), 5 * norm((3, 4)))` —
  Lesson 18's own construction, retyped, reproducing that lesson's exact
  floating-point-noisy point.
- `computed_batch = [(0, 0), (3, 4), computed_point]` — already-basic
  `list` literal, this time mixing two clean, hand-typed points with one
  computed one.
- `print(computed_point)` — already-basic; prints
  `(15.000000000000002, 20.0)`.
- `print(are_points_collinear(computed_batch))` — Concept Unit 1's own
  strict function, reused unchanged, run on the mixed batch. Prints
  `False` — the exact same false negative Lesson 18 already proved for a
  single point, now inherited by the whole-batch version for free,
  simply because it's built on the same underlying strict check.
- `print(are_points_collinear_tolerant(computed_batch, 0.0000001))` — the
  tolerant version, on the identical batch. Prints `True` — correctly
  recognizing all three points as collinear.

### CS Lens

A weakness in one small, already-understood function propagating
automatically into every larger function built on top of it — here, a
single point's floating-point false negative becoming an entire batch's
false negative — is worth recognizing as a general property of
composition, not just a coincidence of this lesson's own code.

```
Also recognized in: dependency chains in software builds (a subtly broken
library function corrupts every function built on top of it, without any
of the higher-level code itself being wrong), statistical estimation
(bias in a single measurement instrument propagates into every
calculation that uses its readings, no matter how correct the downstream
math is), and API design generally (a poorly-behaved low-level function
in a widely used library affects every caller built on it, which is
exactly why fixing `is_point_on_line`'s own tolerance handling once in
Lesson 18 paid off again here, for free, in this lesson's own tolerant
version)
```

### SE Lens

The design principle is **inheriting a fix by building on top of an
already-corrected function**, rather than re-solving the same problem
independently at every new layer. The alternative not chosen: write
`are_points_collinear_tolerant` from scratch, re-deriving its own
tolerance-handling logic without reusing Lesson 18's own
`is_point_on_line_tolerant`.

That alternative would have worked, if written carefully. The real cost
it pays: any future improvement to how tolerance is checked — a smarter,
scale-aware tolerance instead of a fixed one, say — would need to be
found and fixed in two separate places instead of one. Because this
lesson's tolerant batch-checker calls Lesson 18's own tolerant
single-point checker instead of reimplementing it, any future fix to
`is_point_on_line_tolerant` automatically improves
`are_points_collinear_tolerant` too, without this lesson's own code ever
needing to change.

### Commands Needed

`python geometry_lesson_27.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
True
False
(15.000000000000002, 20.0)
False
True
```

Verified by actually running the updated file above.

### Connection

Both the strict and tolerant batch checkers now exist, and behave exactly
as Lesson 18's own single-point predicates predicted they would. Connect
the Pieces, below, traces both batches from start to finish.

---

## Connect the Pieces

Two batches of points, traced through everything this lesson built,
start to finish:

1. `collinear_points = [(0, 0), (3, 4), (6, 8), (9, 12)]` — four
   hand-typed points, all exact multiples of `(3, 4)`.
   `are_points_collinear` loops through all four, finds every one passes
   `is_point_on_line`, and returns `True`.
2. `non_collinear_points`, identical except its last point is `(9, 13)`
   instead of `(9, 12)` — `are_points_collinear`'s loop reaches that
   point, `is_point_on_line` reports `False`, and the guard clause
   returns `False` immediately.
3. `computed_batch = [(0, 0), (3, 4), computed_point]`, where
   `computed_point` comes from `normalize`/`scale_vector` rather than
   being typed by hand — mathematically collinear with the other two, but
   carrying the same rounding error Lesson 18 already proved is real.
4. `are_points_collinear` (strict) returns `False` on this batch — a
   false negative, inherited directly from `is_point_on_line`'s own known
   weakness. `are_points_collinear_tolerant` returns `True` — the correct
   answer, using the identical fix Lesson 18 already built.

## What Breaks Without This

`are_points_collinear` assumes its input `list` has at least two points,
without ever checking. Prove what happens when that assumption fails —
a batch with only one point, a real possibility if an upstream sensor or
data-entry step ever produces an incomplete reading:

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def is_point_on_line(p, a, b):
    return cross_product(subtract_points(b, a), subtract_points(p, a)) == 0


def are_points_collinear(points):
    first_point = points[0]
    second_point = points[1]
    for point in points:
        if is_point_on_line(point, first_point, second_point) == False:
            return False
    return True


single_point_batch = [(3, 4)]

print(are_points_collinear(single_point_batch))
```

```
Traceback (most recent call last):
  File "geometry_lesson_27_break.py", line 20, in <module>
    print(are_points_collinear(single_point_batch))
          ~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^
  File "geometry_lesson_27_break.py", line 10, in are_points_collinear
    second_point = points[1]
                   ~~~~~~^^^
IndexError: list index out of range
```

Verified by actually running this. `single_point_batch` has exactly one
point — not an unreasonable input for a function whose whole point is
handling batches of *any* size, and this one crashes with a real
`IndexError` before the loop even begins, on the very first line trying
to read `points[1]`. This isn't a bug in the loop or in
`is_point_on_line` — it's a genuine gap in `are_points_collinear`'s own
guarantee: "any size" quietly meant "any size two or larger," a
requirement the function never actually stated or checked. A single
point, or an empty batch, has no meaningful "is this collinear" question
to ask at all — there's no second point to define a line against — and a
real caller passing one either needs its own check beforehand, or this
function needs its own guard clause added to handle it explicitly,
rather than crashing with an error that doesn't explain what actually
went wrong.

## Exercises

1. Add a guard clause to `are_points_collinear` that checks
   `len(points) >= 2` at the very start (this uses `len()`, a real
   built-in function this curriculum hasn't formally introduced yet —
   look up what it returns for a `list` before using it), returning
   `True` for a batch of zero or one points instead of crashing. Justify,
   in a comment or your own notes, why `True` is a defensible answer for
   "is this trivially small batch collinear," rather than `False` or a
   crash.
2. Build a batch of five points where the first two happen to be
   identical — for example, `[(3, 4), (3, 4), (6, 8), (9, 12), (0, 0)]`.
   Predict, then verify, what `are_points_collinear` does with this
   batch, and explain what `is_point_on_line`'s own direction vector
   becomes when `first_point` and `second_point` are the same point.
3. Using `are_points_collinear_tolerant`, find a tolerance small enough
   that `computed_batch` from this lesson is correctly rejected as *not*
   collinear, the same way Lesson 18's own exercises explored for a
   single point. Explain what real, physical measurement precision that
   tolerance would correspond to for an actual machined part.

## Definition of Done

- [ ] `geometry_lesson_27.py` exists and runs with no errors via `python
      geometry_lesson_27.py`.
- [ ] Running it prints `True`, `False`, `(15.000000000000002, 20.0)`,
      `False`, then `True` — matching this lesson's verified output
      exactly.
- [ ] You can explain, without looking at the file, why
      `are_points_collinear` needed a `for` loop when no lesson before it
      did, using this lesson's own "unknown batch size" reasoning.
- [ ] You can explain why `are_points_collinear`'s false negative on
      `computed_batch` was inherited automatically, rather than being a
      new bug this lesson introduced, using this lesson's own CS Lens.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Check collinearity across an arbitrary batch of points using a real for loop"`,
      not `git commit -m "add are_points_collinear"`.

Next: Lesson 28 — Distance to a Line, which reuses Lesson 21's own
`find_t_for_point` projection to derive the shortest distance from any
point to a line, resolving the closest-point question Lesson 21's own
exercises already raised but left unanswered.
