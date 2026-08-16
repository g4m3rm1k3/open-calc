# Lesson 28: Distance to a Line

**What you will build:** `distance_to_line`, the shortest distance from
any point to a line — built entirely from Lesson 21's own
`find_t_for_point` and Lesson 9's `norm`, resolving the exact question
Lesson 21's own third exercise raised and left unanswered: the point on
the infinite line closest to an arbitrary point off it. Then a real proof
that this closest point is genuinely special — the line segment
connecting it to the original point is perpendicular to the line itself —
verified with a tolerance check, not `==`, because the floating-point
arithmetic behind it doesn't land on a perfectly clean zero. The
transferable problem: "distance to a line" sounds like it needs new
mathematics, but every piece already exists in this curriculum; the only
genuinely new idea is recognizing that Lesson 21's projection parameter
already locates the one point that makes the distance shortest.

**What you need to know first:** Lesson 21's `find_t_for_point` and
`point_on_line`, Lesson 9's `norm`, Lesson 7's `dot_product` and its
perpendicularity test, and Lesson 17's `nearly_equal`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–27.

**Terms introduced in this lesson:**

- **Closest point** (on a line) — the one point on a line that minimizes
  the distance to some external point, located by Lesson 21's own
  `find_t_for_point`. Why: this is the point `distance_to_line` actually
  measures to, and the fact that it's genuinely the *closest* one — not
  just *a* point on the line — is what this lesson's second unit proves,
  rather than assumes.

**Objects and methods used:**

None. `distance_to_line` is hand-authored project code, built entirely
from Lesson 7, 9, and 21's own reused functions.

---

## Concept Unit: Distance to the Closest Point — Reusing Projection

### The Problem

Lesson 21's `find_t_for_point` already locates the specific point on a
line closest to any given point — its own closing exercises pointed this
out without ever building the distance itself. Finish the job: turn that
closest point into an actual distance.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–27.
- **Files affected:** `geometry_lesson_28.py` — created, as a new file
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


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def find_t_for_point(p, line_point, line_direction):
    offset = subtract_points(p, line_point)
    return dot_product(offset, line_direction) / dot_product(line_direction, line_direction)


import math


def norm(v):
    return math.sqrt(dot_product(v, v))


def distance_to_line(p, line_point, line_direction):
    t = find_t_for_point(p, line_point, line_direction)
    closest_point = point_on_line(line_point, line_direction, t)
    return norm(subtract_points(p, closest_point))


line_point = (0, 0)
line_direction = (3, 4)
p = (0, 5)

print(distance_to_line(p, line_point, line_direction))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* every function above is retyped unchanged from
Lessons 2, 3, 7, 9, and 21. No new Python construct appears anywhere in
this lesson; the new material is recognizing how these already-trusted
pieces combine, not any new syntax.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def add_vector_to_point(...)`, `def scale_vector(...)`, `def
  point_on_line(...)`, `def subtract_points(...)`, `def dot_product(...)`,
  `def find_t_for_point(...)`, `import math`, `def norm(...)` — Lesson 2,
  3, 7, 9, and 21's own code, retyped unchanged. No re-explanation owed,
  per the Repetition Rule.
- `def distance_to_line(p, line_point, line_direction): ...` — first
  appearance: this lesson's actual subject.
- `t = find_t_for_point(p, line_point, line_direction)` — Lesson 21's
  own function, reused, locating exactly where along the line `p`
  projects to.
- `closest_point = point_on_line(line_point, line_direction, t)` —
  Lesson 21's own function again, turning that `t` value into an actual
  point: the **closest point** on the line to `p`.
- `return norm(subtract_points(p, closest_point))` — Lesson 2 and 9's own
  functions, combined: the straight-line distance between `p` and its
  own closest point on the line.
- `line_point = (0, 0)`, `line_direction = (3, 4)` — the curriculum's own
  familiar direction.
- `p = (0, 5)` — a point off the line, chosen so the resulting distance
  comes out clean and easy to check by hand.
- `print(distance_to_line(p, line_point, line_direction))` — prints
  `3.0`.

### CS Lens

Reducing "distance to a line" to "distance to one specific point on that
line" — rather than deriving a separate distance formula from scratch —
is an instance of a much more general problem-solving move: recognizing
that a hard question is actually an easy question in disguise, once the
right intermediate value is identified.

```
Also recognized in: nearest-neighbor search (finding the closest point in
a large dataset to a query point reduces to computing distance-to-a-
candidate for each one and keeping the smallest — the "hard" problem is
just repeated application of an "easy" one), robotics path planning (a
robot's distance to an obstacle's boundary is frequently computed by
first finding the closest point on that boundary, exactly this lesson's
own two-step structure), and CNC clearance checking (verifying a tool
stays a safe distance from a fixture wall reuses the identical
closest-point-then-measure approach, just applied to more complex
boundary shapes than a straight line)
```

### SE Lens

The design principle is **building a new capability entirely from
already-verified pieces**, rather than deriving a fresh distance formula
independently. The alternative not chosen: derive `distance_to_line`
using the classic textbook point-to-line-distance formula directly (a
ready-made expression involving the line's coefficients), without
routing through `find_t_for_point` or `point_on_line` at all.

That alternative would arrive at the identical number, likely in fewer
lines. The real cost it pays: a formula copied from a reference, however
correct, doesn't inherit this curriculum's own accumulated trust the way
`distance_to_line` does — every piece it's built from (`find_t_for_point`,
`point_on_line`, `norm`) was already independently designed, verified,
and reused across several earlier lessons. A bug anywhere in this
lesson's own two-line body would be immediately suspicious, since the
functions it calls are already known-good; a fresh formula would carry no
such guarantee.

### Commands Needed

`python geometry_lesson_28.py` — same interpreter and command as every
prior lesson.

### Run It

```
3.0
```

Verified by actually running the file above.

### Connection

`distance_to_line` returns a clean `3.0` — but nothing yet has actually
proven that `closest_point` deserves the name "closest." The next unit
proves it.

---

## Concept Unit: Proving the Closest Point Really Is Perpendicular

### The Problem

Calling `closest_point` the *closest* point on the line is an assertion,
not yet a proof. The actual geometric fact that guarantees it — the
segment from `p` to `closest_point` meets the line at a perfect right
angle — has a real, checkable signature: Lesson 7's own perpendicularity
test, `dot_product` equal to zero.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_28.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(distance_to_line(p, line_point,
  line_direction))` line added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `find_t_for_point`, `point_on_line`,
  `subtract_points`, `dot_product`, `p`, `line_point`, `line_direction`.

### The New Code

```python
def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


t = find_t_for_point(p, line_point, line_direction)
closest_point = point_on_line(line_point, line_direction, t)
connecting_vector = subtract_points(p, closest_point)
perpendicularity_check = dot_product(connecting_vector, line_direction)

print(closest_point)
print(connecting_vector)
print(perpendicularity_check)
print(nearly_equal(perpendicularity_check, 0, 0.0000001))
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


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def find_t_for_point(p, line_point, line_direction):
    offset = subtract_points(p, line_point)
    return dot_product(offset, line_direction) / dot_product(line_direction, line_direction)


import math


def norm(v):
    return math.sqrt(dot_product(v, v))


def distance_to_line(p, line_point, line_direction):
    t = find_t_for_point(p, line_point, line_direction)
    closest_point = point_on_line(line_point, line_direction, t)
    return norm(subtract_points(p, closest_point))


line_point = (0, 0)
line_direction = (3, 4)
p = (0, 5)

print(distance_to_line(p, line_point, line_direction))


def nearly_equal(a, b, tolerance):                                       # ← new
    return abs(a - b) < tolerance                                       # ← new


t = find_t_for_point(p, line_point, line_direction)                      # ← new
closest_point = point_on_line(line_point, line_direction, t)             # ← new
connecting_vector = subtract_points(p, closest_point)                    # ← new
perpendicularity_check = dot_product(connecting_vector, line_direction)  # ← new

print(closest_point)                                                     # ← new
print(connecting_vector)                                                 # ← new
print(perpendicularity_check)                                            # ← new
print(nearly_equal(perpendicularity_check, 0, 0.0000001))                # ← new
```

The file now computes `distance_to_line`'s own answer, and separately
proves the geometric property that makes it correct.

*A note on method:* `nearly_equal` is Lesson 17's own function, retyped
unchanged; every other line reuses Concept Unit 1's own functions and
values directly. No new Python construct is introduced.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def nearly_equal(a, b, tolerance): ...` — Lesson 17's own function,
  retyped unchanged. No re-explanation owed, per the Repetition Rule.
- `t = find_t_for_point(p, line_point, line_direction)`, `closest_point =
  point_on_line(line_point, line_direction, t)` — already-basic reuse,
  recomputing the identical values `distance_to_line` computed
  internally, this time kept as named variables so they can be inspected
  directly.
- `connecting_vector = subtract_points(p, closest_point)` — already-basic
  reuse, the vector from the closest point back to the original point —
  the segment whose angle to the line is actually being tested.
- `perpendicularity_check = dot_product(connecting_vector,
  line_direction)` — Lesson 7's own perpendicularity test: `dot_product`
  equal to zero means two vectors meet at a right angle.
- `print(closest_point)` — prints `(2.4000000000000004, 3.2)` — the `x`
  coordinate carries the same kind of floating-point rounding Lesson 17
  already proved is real, inherited from `find_t_for_point`'s own
  division.
- `print(connecting_vector)` — prints `(-2.4000000000000004,
  1.7999999999999998)`.
- `print(perpendicularity_check)` — prints
  `-1.7763568394002505e-15` — a real number, not exactly `0`, even though
  the true mathematical dot product of a perpendicular pair is exactly
  zero. This is Concept Unit 1's own inherited floating-point noise
  showing up again, exactly the way Lesson 17 predicted it would anywhere
  division and multiplication combine.
- `print(nearly_equal(perpendicularity_check, 0, 0.0000001))` — Lesson
  17's own tolerance check, correctly recognizing
  `-1.7763568394002505e-15` as close enough to `0` to count as
  perpendicular. Prints `True`.

**Why this proves `closest_point` deserves its name.** A line and any
point not on it form a right triangle: the line itself, the perpendicular
segment to the closest point, and the segment to any *other* point on the
line. Because a right angle is involved, the segment straight to any
other point on the line is always the hypotenuse of that triangle — and a
right triangle's hypotenuse is always longer than either other side. The
perpendicularity confirmed here isn't a side detail; it's the exact
geometric fact that guarantees no other point on the line could ever be
closer.

### CS Lens

Verifying a claimed optimum (the *closest* point) by checking the
mathematical condition that actually characterizes it — perpendicularity,
here — rather than trusting the formula that produced it, is the same
discipline this curriculum has already applied to inverses (Lesson 16)
and intersections (Lesson 24).

```
Also recognized in: optimization algorithms broadly (gradient-based
methods stop when a computed gradient is close enough to zero, the
multi-dimensional generalization of this lesson's own perpendicularity-
as-zero-dot-product check), computer-aided manufacturing (verifying a
tool's retract path leaves a surface at the correct angle uses this exact
dot-product test), and physics engines (a contact resolution step often
checks that a computed contact normal is genuinely perpendicular to the
touching surface, using the identical near-zero dot-product tolerance
check this lesson just performed)
```

### SE Lens

The design principle is **verifying a result against the mathematical
property that defines correctness, not just trusting the formula that
produced it**. The alternative not chosen: return `distance_to_line`'s
result without ever checking `dot_product(connecting_vector,
line_direction)` at all, trusting that `find_t_for_point`'s own already-
verified correctness (from Lesson 21) is enough.

That alternative is not unreasonable — `find_t_for_point` genuinely was
already proven correct. The real value this unit adds anyway: proving the
perpendicularity condition *directly*, on real numbers, ties
`distance_to_line`'s correctness to an independently checkable geometric
fact, rather than a chain of trust running back through several earlier
lessons. When something goes wrong three lessons from now, a direct check
like this one is a faster way to confirm this specific piece isn't the
cause.

### Commands Needed

`python geometry_lesson_28.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
3.0
(2.4000000000000004, 3.2)
(-2.4000000000000004, 1.7999999999999998)
-1.7763568394002505e-15
True
```

Verified by actually running the updated file above.

### Connection

`closest_point` is now proven, not just asserted, to be the true closest
point on the line — the perpendicularity that guarantees it checked
directly and confirmed within tolerance. Connect the Pieces, below,
traces the full computation start to finish.

---

## Connect the Pieces

One concrete point and line, traced through everything this lesson built,
start to finish:

1. `p = (0, 5)`, `line_point = (0, 0)`, `line_direction = (3, 4)`.
2. `find_t_for_point(p, line_point, line_direction)` gives `t = 0.8`,
   locating exactly where `p` projects onto the line.
3. `point_on_line(line_point, line_direction, 0.8)` gives `closest_point
   = (2.4000000000000004, 3.2)`.
4. `distance_to_line` measures the straight-line gap between `p` and
   `closest_point`: a clean `3.0`.
5. `dot_product(subtract_points(p, closest_point), line_direction)`
   comes out to `-1.7763568394002505e-15` — not exactly `0`, but
   `nearly_equal` to it — proving `closest_point` genuinely meets the
   line at a right angle, which is the actual mathematical guarantee that
   no other point on the line could be closer than `3.0`.

## What Breaks Without This

Concept Unit 2 deliberately checked perpendicularity with `nearly_equal`,
not `==`. Check what a strict version would have concluded, using the
exact number this lesson already computed:

```python
perpendicularity_check = -1.7763568394002505e-15

print(perpendicularity_check == 0)
```

```
False
```

Verified by actually running this. A strict `== 0` check on this
lesson's own real, computed `perpendicularity_check` reports `False` —
flatly denying that `closest_point` is perpendicular to the line, even
though it demonstrably is, geometrically, and even though
`distance_to_line` itself already returned the correct, clean answer of
`3.0`. This is the identical failure shape Lesson 17 first proved with
`norm(normalize((1, 2)))`, and Lesson 18 proved again for collinearity —
now showing up a third time, in a proof about perpendicularity instead of
either of those. A verification step meant to build *confidence* in
`distance_to_line`'s correctness would, if written with `==` instead of
`nearly_equal`, instead report the function as broken when it isn't —
proof that Lesson 17's tolerance discipline isn't optional bookkeeping;
it's required anywhere a `find_t_for_point`-style division sits upstream
of a check that expects a clean mathematical zero.

## Exercises

1. Using `distance_to_line`, compute the distance from `p = (3, 4)` —
   sitting exactly *on* the line — to the same `line_point`/`line_direction`.
   Predict, then verify, that the result comes out to (nearly) `0`, and
   explain what that means about `closest_point` in this specific case.
2. Build a second point, `p = (6, 1)`, and compute both
   `distance_to_line(p, line_point, line_direction)` and the
   perpendicularity check from Concept Unit 2, using this new point.
   Confirm the connecting vector is still perpendicular within tolerance,
   even though the numbers involved are completely different from this
   lesson's own worked example.
3. Using `norm` alone (without `distance_to_line`), compute the distance
   from `p = (0, 5)` to `line_point = (0, 0)` directly — the distance to
   the line's own starting point, not its closest point. Confirm this
   number is *larger* than `distance_to_line`'s own `3.0`, and explain
   why it must be, using this lesson's own right-triangle reasoning.

## Definition of Done

- [ ] `geometry_lesson_28.py` exists and runs with no errors via `python
      geometry_lesson_28.py`.
- [ ] Running it prints `3.0`, `(2.4000000000000004, 3.2)`,
      `(-2.4000000000000004, 1.7999999999999998)`,
      `-1.7763568394002505e-15`, then `True` — matching this lesson's
      verified output exactly.
- [ ] You can explain, without looking at the file, why `distance_to_line`
      needed no new mathematics beyond `find_t_for_point`, `point_on_line`,
      and `norm`.
- [ ] You can explain why perpendicularity had to be checked with
      `nearly_equal` instead of `==`, using this lesson's own verified
      `-1.7763568394002505e-15` result.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Derive distance to a line from projection and prove the closest point is perpendicular"`,
      not `git commit -m "add distance_to_line"`.

Next: Lesson 29 — Distance to a Segment, which reuses `distance_to_line`
and layers Lesson 21's own `is_t_on_segment` on top, handling the case
this lesson's own perpendicular closest point can fall outside a
segment's actual bounds — the same infinite-line-versus-segment gap
Lesson 21 first proved matters.
