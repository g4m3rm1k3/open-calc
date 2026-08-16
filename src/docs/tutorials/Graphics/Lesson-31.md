# Lesson 31: Circle-Line Intersection

**What you will build:** `circle_line_intersection`, finding where a line
crosses a circle by substituting Lesson 21's `point_on_line` directly
into Lesson 30's own distance-from-center relationship, producing a
quadratic equation in `t` — the first quadratic this curriculum has ever
solved. Its discriminant decides everything: two intersections, exactly
one (a tangent line, touching at a single point), or none at all. The
transferable problem: every intersection this curriculum has found so
far (Lesson 24's `line_intersection`, Lesson 25's segment version) came
from a *linear* system — one equation, one unknown, solved by a single
division. A circle is not linear — it's built from squared distances —
and substituting a line into it produces a *quadratic*, which can have
zero, one, or two real solutions instead of line-line intersection's
always-exactly-one-or-none.

**What you need to know first:** Lesson 21's `point_on_line`, Lesson 7's
`dot_product` and its algebraic distributive property, Lesson 9's
`math.sqrt`, Lesson 17's `nearly_equal`, Lesson 19's `if`/`elif`/`else`,
and Lesson 30's circle representation, `(center, radius)`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–30.

**Terms introduced in this lesson:**

- **Discriminant** — the quantity `b*b - 4*a*c` inside a quadratic
  equation's own solving formula, whose sign alone determines how many
  real solutions exist, before the formula is even finished. Why: this
  is the single number `circle_line_intersection` reads to decide whether
  a line hits a circle twice, touches it once, or misses it entirely —
  the exact geometric question this lesson exists to answer.
- **Tangent line** — a line that touches a circle at exactly one point,
  without crossing into its interior at all — the case where the
  discriminant comes out to (nearly) zero. Why: this is the boundary
  between "two intersections" and "no intersection," and, like every
  boundary case this curriculum has built since Lesson 18, it needs
  tolerance-based detection, not exact equality.

**Objects and methods used:**

None. `circle_line_intersection` is hand-authored project code, built
from Lesson 2, 7, 9, 17, and 21's own reused functions.

---

## Concept Unit: Substituting the Line Into the Circle — a Quadratic in t

### The Problem

A point is on a circle exactly when its distance from the center equals
the radius. A point is on a line exactly when it's `point_on_line(...)`
for some `t`. Combine both conditions — substitute the line's own formula
into the circle's own condition — and see what kind of equation falls
out.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–30.
- **Files affected:** `geometry_lesson_31.py` — created, as a new file
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


circle = ((0, 0), 5)
line_point = (-10, 3)
line_direction = (1, 0)

center = circle[0]
radius = circle[1]

d = subtract_points(line_point, center)

a = dot_product(line_direction, line_direction)
b = 2 * dot_product(d, line_direction)
c = dot_product(d, d) - radius * radius

discriminant = b * b - 4 * a * c

print(d)
print(a)
print(b)
print(c)
print(discriminant)
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* every function above is retyped unchanged from
Lessons 2, 3, 7, and 21. No new Python construct appears here; the new
material is the algebra these already-trusted functions are arranged to
set up, not any new syntax.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def add_vector_to_point(...)` through `def dot_product(...)` — Lesson
  2, 3, 7, and 21's own functions, retyped unchanged. No re-explanation
  owed, per the Repetition Rule.
- `circle = ((0, 0), 5)`, `line_point = (-10, 3)`, `line_direction =
  (1, 0)` — a circle centered at the origin, and a horizontal line
  crossing it, chosen so the resulting numbers come out clean and easy
  to check by hand.
- `center = circle[0]`, `radius = circle[1]` — Lesson 30's own indexing
  pattern, reused.
- `d = subtract_points(line_point, center)` — the offset from the
  circle's center to the line's own starting point.

**The derivation.** A point is on the circle exactly when
`dot_product(offset, offset) == radius * radius`, where `offset` is that
point's own distance vector from the center (Lesson 30's own condition,
squared to avoid a square root during the algebra). Substituting
`point_on_line(line_point, line_direction, t)` for that point, its offset
from the center becomes `d + t * line_direction` — `d` plus `t` copies
of the line's own direction. Squaring that sum using `dot_product`'s own
distributive property (verified directly:
`dot_product(u + v, u + v) == dot_product(u, u) + 2 * dot_product(u, v)
+ dot_product(v, v)`, confirmed numerically this session) expands into:

```
dot_product(d, d) + 2 * t * dot_product(d, line_direction)
  + t * t * dot_product(line_direction, line_direction) = radius * radius
```

Rearranged into the standard `a * t*t + b * t + c = 0` shape:

- `a = dot_product(line_direction, line_direction)` — line 31 of the
  code, first appearance: the quadratic's own leading coefficient.
- `b = 2 * dot_product(d, line_direction)` — first appearance.
- `c = dot_product(d, d) - radius * radius` — first appearance: everything
  left over once `radius * radius` is moved to the same side as
  everything else.
- `discriminant = b * b - 4 * a * c` — first appearance of the
  **discriminant**: the one number, computed from `a`, `b`, and `c`
  alone, that determines how many real solutions this quadratic has,
  before ever attempting to find them.
- The five `print(...)` calls — already-basic; `discriminant` comes out
  to `64`, a positive number.

### CS Lens

Substituting one shape's parametric formula directly into another
shape's defining condition, to reduce a two-object geometric question
into a single-variable algebraic one, is the general technique behind
nearly every analytic intersection test.

```
Also recognized in: ray-sphere intersection in ray tracing (the exact 3D
generalization of this lesson's own 2D derivation — a ray's parametric
formula substituted into a sphere's squared-distance condition produces
the identical quadratic shape, `a`, `b`, `c`, and all), physics
simulations (predicting when a moving point will cross a circular
boundary, for collision prediction, substitutes the point's own motion
formula into the boundary's condition the same way), and computer-aided
manufacturing (calculating where a straight tool retract path clears a
circular fixture boundary uses this exact substitution)
```

### SE Lens

The design principle is **reducing a new problem to an already-solved
form**, rather than inventing new machinery for a new shape. The
alternative not chosen: search for circle-line intersections numerically
— stepping `t` in small increments and checking `distance_from_center`
after each step, looking for where it crosses the radius.

That alternative would work, approximately, for any shape at all, not
just a circle. The real cost it pays: it never finds an *exact* answer,
only an approximation limited by the step size, and it wastes work
checking points nowhere near an actual intersection. This lesson's
algebraic substitution finds the exact answer directly, in a fixed,
small number of arithmetic operations, because it's built on the same
solved mathematics — the quadratic formula — used since long before
computers existed.

### Commands Needed

`python geometry_lesson_31.py` — same interpreter and command as every
prior lesson.

### Run It

```
(-10, 3)
1
-20
84
64
```

Verified by actually running the file above.

### Connection

The quadratic's own coefficients are set up, and its discriminant is
positive. The next unit actually solves it.

---

## Concept Unit: Solving the Quadratic — Two Intersections, or One

### The Problem

A positive discriminant promises two real solutions; a discriminant of
exactly (or nearly) zero promises exactly one — the tangent case. Solve
both, using the same formula, and confirm the results genuinely land on
the circle.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_31.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(discriminant)` line added in
  Concept Unit 1.
- **Dependencies:** Concept Unit 1's `a`, `b`, `c`, `discriminant`,
  `line_point`, `line_direction`, `center`, `radius`.

### The New Code

```python
import math


def nearly_equal(x, y, tolerance):
    return abs(x - y) < tolerance


sqrt_discriminant = math.sqrt(discriminant)
t1 = (-b - sqrt_discriminant) / (2 * a)
t2 = (-b + sqrt_discriminant) / (2 * a)

point1 = point_on_line(line_point, line_direction, t1)
point2 = point_on_line(line_point, line_direction, t2)

print(t1)
print(t2)
print(point1)
print(point2)

tangent_line_point = (-10, 5)
tangent_d = subtract_points(tangent_line_point, center)
tangent_a = dot_product(line_direction, line_direction)
tangent_b = 2 * dot_product(tangent_d, line_direction)
tangent_c = dot_product(tangent_d, tangent_d) - radius * radius
tangent_discriminant = tangent_b * tangent_b - 4 * tangent_a * tangent_c

print(tangent_discriminant)
print(nearly_equal(tangent_discriminant, 0, 0.0000001))

tangent_t = -tangent_b / (2 * tangent_a)
tangent_point = point_on_line(tangent_line_point, line_direction, tangent_t)
print(tangent_point)
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


circle = ((0, 0), 5)
line_point = (-10, 3)
line_direction = (1, 0)

center = circle[0]
radius = circle[1]

d = subtract_points(line_point, center)

a = dot_product(line_direction, line_direction)
b = 2 * dot_product(d, line_direction)
c = dot_product(d, d) - radius * radius

discriminant = b * b - 4 * a * c

print(d)
print(a)
print(b)
print(c)
print(discriminant)


import math                                                               # ← new


def nearly_equal(x, y, tolerance):                                       # ← new
    return abs(x - y) < tolerance                                       # ← new


sqrt_discriminant = math.sqrt(discriminant)                              # ← new
t1 = (-b - sqrt_discriminant) / (2 * a)                                  # ← new
t2 = (-b + sqrt_discriminant) / (2 * a)                                  # ← new

point1 = point_on_line(line_point, line_direction, t1)                   # ← new
point2 = point_on_line(line_point, line_direction, t2)                   # ← new

print(t1)                                                                 # ← new
print(t2)                                                                 # ← new
print(point1)                                                             # ← new
print(point2)                                                             # ← new

tangent_line_point = (-10, 5)                                            # ← new
tangent_d = subtract_points(tangent_line_point, center)                  # ← new
tangent_a = dot_product(line_direction, line_direction)                  # ← new
tangent_b = 2 * dot_product(tangent_d, line_direction)                   # ← new
tangent_c = dot_product(tangent_d, tangent_d) - radius * radius          # ← new
tangent_discriminant = tangent_b * tangent_b - 4 * tangent_a * tangent_c  # ← new

print(tangent_discriminant)                                              # ← new
print(nearly_equal(tangent_discriminant, 0, 0.0000001))                  # ← new

tangent_t = -tangent_b / (2 * tangent_a)                                 # ← new
tangent_point = point_on_line(tangent_line_point, line_direction, tangent_t)  # ← new
print(tangent_point)                                                     # ← new
```

The file now solves the general two-intersection case, and confirms the
tangent case is detected correctly by the discriminant alone.

*A note on method:* `import math` and `nearly_equal` are Lesson 9 and
17's own code, retyped unchanged. No new Python construct is introduced
— `math.sqrt` is reused exactly as it was in Lesson 9's own isolated
lab.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `import math`, `def nearly_equal(x, y, tolerance): ...` — Lesson 9 and
  17's own code, retyped unchanged. No re-explanation owed, per the
  Repetition Rule.
- `sqrt_discriminant = math.sqrt(discriminant)` — Lesson 9's own function,
  reused, taking the square root of the positive discriminant computed
  in Concept Unit 1.
- `t1 = (-b - sqrt_discriminant) / (2 * a)`, `t2 = (-b +
  sqrt_discriminant) / (2 * a)` — first appearance: the **quadratic
  formula** itself, applied with a subtraction for one solution and an
  addition for the other — the standard `(-b ± √discriminant) / (2a)`
  shape, written as two separate lines since this curriculum has no
  single symbol for "plus or minus."
- `point1 = point_on_line(line_point, line_direction, t1)`, `point2 =
  point_on_line(line_point, line_direction, t2)` — Lesson 21's own
  function, reused, turning each solved `t` into an actual point.
- The four `print(...)` calls — `t1` and `t2` print `6.0` and `14.0`;
  `point1` and `point2` print `(-4.0, 3.0)` and `(4.0, 3.0)` — both
  genuinely `5` units from the origin, confirmed by the same
  3-4-5-triangle relationship Lesson 9's own `norm((3, 4)) = 5.0` result
  already established.
- `tangent_line_point = (-10, 5)` — a second line, `y = 5`, chosen because
  it just grazes the top of a radius-`5` circle centered at the origin.
- `tangent_d`, `tangent_a`, `tangent_b`, `tangent_c`,
  `tangent_discriminant` — already-basic reuse, the identical derivation
  from Concept Unit 1, run again for this new line.
- `print(tangent_discriminant)` — prints `0`: this particular example
  happens to land on a perfectly clean zero, since every number involved
  is a clean integer.
- `print(nearly_equal(tangent_discriminant, 0, 0.0000001))` — confirms
  `True` regardless — the check that will keep working even when a less
  clean example leaves a tiny nonzero residual instead of an exact `0`,
  the same floating-point risk Lesson 17 already proved is real anywhere
  division or multiplication chains appear.
- `tangent_t = -tangent_b / (2 * tangent_a)` — first appearance of the
  tangent case's own formula: with `sqrt_discriminant` equal to `0`, the
  quadratic formula's `±` term vanishes entirely, leaving exactly one
  value — the same value `t1` and `t2` would both collapse to if the
  general formula were used here instead.
- `tangent_point = point_on_line(tangent_line_point, line_direction,
  tangent_t)`, `print(tangent_point)` — prints `(0.0, 5.0)` — the single
  point where this line just touches the circle, without crossing into
  its interior anywhere.

### CS Lens

A single algebraic formula naturally collapsing from two answers to one,
exactly at the boundary between two qualitatively different cases, is a
recurring and elegant property of solutions built from a discriminant.

```
Also recognized in: root-finding algorithms generally (Newton's method
and its relatives can converge to a single repeated root exactly where a
function's own graph is tangent to the x-axis, the same collapsing
behavior this lesson's quadratic shows geometrically), optics and lens
design (a ray just grazing the edge of a lens, rather than passing
cleanly through or missing it entirely, is the tangent case of an
analogous ray-surface intersection), and control theory (a system's
characteristic equation having a repeated root, rather than two distinct
ones, marks the exact boundary between two different kinds of dynamic
behavior — the same "borderline" quality a tangent line has here)
```

### SE Lens

The design principle is **letting one formula naturally handle a
boundary case, rather than writing separate logic for it**. The
alternative not chosen: write an entirely separate `tangent_point`
formula, distinct from the general two-solution quadratic formula, since
the tangent case only ever needs one point.

That alternative would need its own derivation and its own correctness
proof. The real value of this unit's own approach: `tangent_t`'s formula,
`-b / (2a)`, isn't a special case invented separately — it's exactly what
`t1` and `t2`'s shared formula becomes when `sqrt_discriminant` is `0`,
which means trusting the general formula's own algebra is enough; no
second, independently-verified formula is needed for the boundary case
at all.

### Commands Needed

`python geometry_lesson_31.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
(-10, 3)
1
-20
84
64
6.0
14.0
(-4.0, 3.0)
(4.0, 3.0)
0
True
(0.0, 5.0)
```

Verified by actually running the updated file above.

### Connection

Both the two-intersection and tangent cases are solved. The final unit
handles the one remaining case the discriminant can reveal: a line that
misses the circle entirely.

---

## Concept Unit: When the Line Misses Entirely — Guarding a Negative Discriminant

### The Problem

A negative discriminant means the quadratic formula would need the
square root of a negative number — mathematically, no real solution
exists at all, meaning the line simply never reaches the circle. Combine
all three cases into one real function, checked in the correct order.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_31.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(tangent_point)` line added in
  Concept Unit 2.
- **Dependencies:** Concept Unit 1 and 2's own derivation, reused inside
  a new combined function.

### The New Code

```python
def circle_line_intersection(line_point, line_direction, circle):
    center = circle[0]
    radius = circle[1]
    d = subtract_points(line_point, center)

    a = dot_product(line_direction, line_direction)
    b = 2 * dot_product(d, line_direction)
    c = dot_product(d, d) - radius * radius
    discriminant = b * b - 4 * a * c

    if nearly_equal(discriminant, 0, 0.0000001):
        t = -b / (2 * a)
        return (point_on_line(line_point, line_direction, t),)
    elif discriminant < 0:
        return "no intersection"
    else:
        sqrt_discriminant = math.sqrt(discriminant)
        t1 = (-b - sqrt_discriminant) / (2 * a)
        t2 = (-b + sqrt_discriminant) / (2 * a)
        return (
            point_on_line(line_point, line_direction, t1),
            point_on_line(line_point, line_direction, t2),
        )


miss_line_point = (-10, 10)

print(circle_line_intersection(line_point, line_direction, circle))
print(circle_line_intersection(tangent_line_point, line_direction, circle))
print(circle_line_intersection(miss_line_point, line_direction, circle))
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


circle = ((0, 0), 5)
line_point = (-10, 3)
line_direction = (1, 0)

center = circle[0]
radius = circle[1]

d = subtract_points(line_point, center)

a = dot_product(line_direction, line_direction)
b = 2 * dot_product(d, line_direction)
c = dot_product(d, d) - radius * radius

discriminant = b * b - 4 * a * c

print(d)
print(a)
print(b)
print(c)
print(discriminant)


import math


def nearly_equal(x, y, tolerance):
    return abs(x - y) < tolerance


sqrt_discriminant = math.sqrt(discriminant)
t1 = (-b - sqrt_discriminant) / (2 * a)
t2 = (-b + sqrt_discriminant) / (2 * a)

point1 = point_on_line(line_point, line_direction, t1)
point2 = point_on_line(line_point, line_direction, t2)

print(t1)
print(t2)
print(point1)
print(point2)

tangent_line_point = (-10, 5)
tangent_d = subtract_points(tangent_line_point, center)
tangent_a = dot_product(line_direction, line_direction)
tangent_b = 2 * dot_product(tangent_d, line_direction)
tangent_c = dot_product(tangent_d, tangent_d) - radius * radius
tangent_discriminant = tangent_b * tangent_b - 4 * tangent_a * tangent_c

print(tangent_discriminant)
print(nearly_equal(tangent_discriminant, 0, 0.0000001))

tangent_t = -tangent_b / (2 * tangent_a)
tangent_point = point_on_line(tangent_line_point, line_direction, tangent_t)
print(tangent_point)


def circle_line_intersection(line_point, line_direction, circle):        # ← new
    center = circle[0]                                                   # ← new
    radius = circle[1]                                                   # ← new
    d = subtract_points(line_point, center)                              # ← new
                                                                           # ← new
    a = dot_product(line_direction, line_direction)                      # ← new
    b = 2 * dot_product(d, line_direction)                                # ← new
    c = dot_product(d, d) - radius * radius                              # ← new
    discriminant = b * b - 4 * a * c                                     # ← new
                                                                           # ← new
    if nearly_equal(discriminant, 0, 0.0000001):                        # ← new
        t = -b / (2 * a)                                                 # ← new
        return (point_on_line(line_point, line_direction, t),)          # ← new
    elif discriminant < 0:                                               # ← new
        return "no intersection"                                        # ← new
    else:                                                                # ← new
        sqrt_discriminant = math.sqrt(discriminant)                     # ← new
        t1 = (-b - sqrt_discriminant) / (2 * a)                         # ← new
        t2 = (-b + sqrt_discriminant) / (2 * a)                         # ← new
        return (                                                         # ← new
            point_on_line(line_point, line_direction, t1),               # ← new
            point_on_line(line_point, line_direction, t2),               # ← new
        )                                                                 # ← new


miss_line_point = (-10, 10)                                              # ← new

print(circle_line_intersection(line_point, line_direction, circle))      # ← new
print(circle_line_intersection(tangent_line_point, line_direction, circle))  # ← new
print(circle_line_intersection(miss_line_point, line_direction, circle))  # ← new
```

`circle_line_intersection` now handles all three cases in one function,
matching everything Concept Unit 1 and 2 already verified by hand.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def circle_line_intersection(line_point, line_direction, circle):
  ...` — first appearance: this lesson's actual subject, combining
  Concept Unit 1 and 2's own derivation into one reusable function.
- The body through `discriminant = b * b - 4 * a * c` — already-basic
  reuse, identical to Concept Unit 1's own setup.
- `if nearly_equal(discriminant, 0, 0.0000001): ... return
  (point_on_line(...),)` — the tangent case, checked *first*. This
  ordering matters: a genuinely tangent line's discriminant could round
  to a tiny *negative* number instead of a clean `0`, the same kind of
  floating-point residue Lesson 17 already proved is real — checking the
  tolerant case first catches that possibility before the strict
  `discriminant < 0` check below ever gets a chance to misclassify it as
  "no intersection," the identical ordering discipline Lesson 19's
  `classify_turn_tolerant` and Lesson 30's own `classify_point_vs_circle`
  already established.
- `elif discriminant < 0: return "no intersection"` — first appearance
  of this lesson's own guard against a genuinely negative discriminant:
  a real, valid answer, not a crash — reached only once the tangent case
  above has already been ruled out.
- `else: ...` — already-basic reuse, Concept Unit 2's own two-solution
  formula, reached only when the discriminant is confirmed positive.
- `print(circle_line_intersection(line_point, line_direction, circle))`
  — the original two-intersection line. Prints `((-4.0, 3.0), (4.0,
  3.0))`.
- `print(circle_line_intersection(tangent_line_point, line_direction,
  circle))` — the tangent line. Prints `((0.0, 5.0),)`.
- `print(circle_line_intersection(miss_line_point, line_direction,
  circle))` — `(-10, 10)`, a line running well above the circle. Prints
  `no intersection`.

### CS Lens

Ordering guard clauses so the *tolerant* check runs before the *strict*
one, specifically because a floating-point boundary case can round to
either side unpredictably, is a real and recurring discipline —
reconfirmed here for a third distinct kind of boundary (turn direction in
Lesson 19, circle membership in Lesson 30, and now a quadratic's own
discriminant).

```
Also recognized in: numerical root-finders (production implementations of
the quadratic formula in scientific computing libraries check for a
near-zero discriminant before the sign check, for exactly this reason —
NumPy's and MATLAB's own polynomial solvers handle this case explicitly),
computational geometry libraries generally (CGAL and similar libraries
document this exact ordering principle — check near-degenerate cases
before exact sign comparisons — as a standard defensive pattern), and
game engine collision systems (a ray just grazing a sphere's edge is a
notorious source of this exact bug when implemented naively, and
production engines special-case it the same way this lesson does)
```

### SE Lens

The design principle is **ordering multiple guard clauses by which
misclassification is worse, not just by which is simplest to write
first**. The alternative not chosen: check `discriminant < 0` first,
then the tolerant tangent case second — the more "obvious" reading order,
strict cases before tolerant ones.

That alternative would have a real, concrete failure mode: a genuinely
tangent line whose discriminant happens to round to a small negative
number would be wrongly classified as "no intersection" instead of
correctly recognized as tangent, because the strict `< 0` check would
claim it first. This lesson's own ordering — tolerant check first —
costs nothing when the discriminant is comfortably positive or negative,
and specifically protects the one case where getting the order wrong
would silently produce the wrong geometric answer.

### Commands Needed

`python geometry_lesson_31.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
(-10, 3)
1
-20
84
64
6.0
14.0
(-4.0, 3.0)
(4.0, 3.0)
0
True
(0.0, 5.0)
((-4.0, 3.0), (4.0, 3.0))
((0.0, 5.0),)
no intersection
```

Verified by actually running the updated file above.

### Connection

All three cases — two intersections, one tangent point, and none at all
— are now handled correctly by a single function, in the correct guard
order. Connect the Pieces, below, traces all three side by side.

---

## Connect the Pieces

Three lines against the same circle, traced through everything this
lesson built, start to finish:

1. `circle = ((0, 0), 5)` — a circle of radius `5` at the origin.
2. `line_point = (-10, 3)`, `line_direction = (1, 0)` — the line `y = 3`.
   Substituting into the circle's condition gives `a = 1`, `b = -20`,
   `c = 84`, `discriminant = 64` — positive. Solving gives `t = 6` and
   `t = 14`, landing on `(-4.0, 3.0)` and `(4.0, 3.0)` — two genuine
   intersections.
3. `tangent_line_point = (-10, 5)` — the line `y = 5`, just grazing the
   circle's top. Discriminant comes out to `0`. Solving gives a single
   `t = 10`, landing on `(0.0, 5.0)` — the tangent point.
4. `miss_line_point = (-10, 10)` — the line `y = 10`, well above the
   circle. Discriminant comes out negative — no real solution, and
   `circle_line_intersection` correctly returns `"no intersection"`
   instead of attempting `math.sqrt` on it.

## What Breaks Without This

`circle_line_intersection`'s guard clause exists specifically to keep
`math.sqrt` away from a negative discriminant. Prove what happens without
it, using the exact line already proven to miss the circle:

```python
import math


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def circle_line_intersection_unguarded(line_point, line_direction, circle):
    center = circle[0]
    radius = circle[1]
    d = subtract_points(line_point, center)
    a = dot_product(line_direction, line_direction)
    b = 2 * dot_product(d, line_direction)
    c = dot_product(d, d) - radius * radius
    discriminant = b * b - 4 * a * c
    sqrt_discriminant = math.sqrt(discriminant)
    return sqrt_discriminant


circle = ((0, 0), 5)
miss_line_point = (-10, 10)
line_direction = (1, 0)

print(circle_line_intersection_unguarded(miss_line_point, line_direction, circle))
```

```
Traceback (most recent call last):
  File "geometry_lesson_31_break.py", line 23, in <module>
    print(circle_line_intersection_unguarded(miss_line_point, line_direction, circle))
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "geometry_lesson_31_break.py", line 16, in circle_line_intersection_unguarded
    sqrt_discriminant = math.sqrt(discriminant)
ValueError: expected a nonnegative input, got -300.0
```

Verified by actually running this — a `ValueError`, a genuinely new kind
of crash this curriculum hasn't produced before (Lesson 10 and 24's own
crashes were `ZeroDivisionError`; Lesson 27's was `IndexError`).
`math.sqrt`, unlike ordinary arithmetic, refuses to guess what a negative
input's square root should mean, because no real number squares to a
negative value — this isn't a bug in `math.sqrt`, it's the function
correctly refusing to answer a question that has no real-numbered
answer. `circle_line_intersection`'s own `elif discriminant < 0: return
"no intersection"` exists precisely to recognize this exact geometric
situation — a line that truly never reaches the circle — before
`math.sqrt` is ever asked to do something mathematically impossible.

## Exercises

1. Using `circle_line_intersection`, find where the line through
   `(0, -10)` with direction `(0, 1)` — a vertical line through the
   circle's own center — crosses `circle`. Confirm both intersection
   points are exactly `5` units from the origin.
2. Build a circle with a non-origin center, `circle = ((10, 0), 3)`, and
   a line that should be tangent to it — reason out a line whose `y`
   value keeps it exactly `3` units from `(10, 0)` — then verify your
   prediction with `circle_line_intersection`.
3. Using `circle_line_intersection`, confirm that swapping which line
   point is used to start the search — for example, using
   `(20, 3)` instead of `(-10, 3)` for this lesson's own first
   example — still finds the identical two intersection points, even
   though `t1` and `t2` themselves come out completely different.
   Explain why the *points* stay the same while the *parameter values*
   change.

## Definition of Done

- [ ] `geometry_lesson_31.py` exists and runs with no errors via `python
      geometry_lesson_31.py`.
- [ ] Running it prints the full 15-line sequence shown in Concept Unit
      3's Run It, ending in `((-4.0, 3.0), (4.0, 3.0))`, `((0.0, 5.0),)`,
      then `no intersection` — matching this lesson's verified output
      exactly.
- [ ] You can explain, without looking at the file, how substituting
      `point_on_line` into a circle's condition produces a quadratic,
      naming what `a`, `b`, and `c` each represent.
- [ ] You can explain why the tangent (`nearly_equal`) check runs before
      the negative-discriminant check, using this lesson's own reasoning
      about floating-point rounding at the boundary.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Derive circle-line intersection from a quadratic in t, ordering guard clauses to survive rounding at the tangent boundary"`,
      not `git commit -m "add circle_line_intersection"`.

Next: Lesson 32 — Circle-Circle Intersection, which reuses this lesson's
own discriminant-based case split, applied to two circles' centers and
radii instead of a line and a circle.
