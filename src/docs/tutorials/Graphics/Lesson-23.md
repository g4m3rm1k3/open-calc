# Lesson 23: Parametric Geometry

**What you will build:** A formal name for the pattern Lesson 21 and 22
already used without naming it — representing a geometric object as a
function of one number, `t` — followed by proof that the pattern is
genuinely general, not just a property of straight lines: a parabola,
`(t, t * t)`, built the same way `point_on_line` was, and a real,
measured difference between how the two behave under equal steps of `t`.
The transferable problem: every function this curriculum has built to
generate a point from `t` so far has been a straight line. This lesson
checks whether "parametric" secretly *means* "straight line," or whether
it's a genuinely more general idea — and proves it's the latter.

**What you need to know first:** Lesson 21's `point_on_line`, Lesson 9's
`norm`, and Lesson 2's `subtract_points`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–22.

**Terms introduced in this lesson:**

- **Parameter** — a single input value, conventionally named `t`, that a
  parametric function is evaluated at to produce one specific geometric
  result. Why: Lesson 21's `point_on_line` and Lesson 22's `is_t_on_ray`
  both already used a variable called `t` this exact way, without this
  curriculum ever stating plainly what role it plays in general.
- **Parametric function (or parametric curve)** — a function that maps a
  parameter to a geometric object — here, a point — so that sweeping the
  parameter through its allowed values traces out the whole shape. Why:
  this is the general pattern `point_on_line` is one specific instance
  of, and naming it lets the same idea be recognized the moment it
  reappears in a genuinely different shape, which this lesson's own
  second unit builds.

**Objects and methods used:**

None. `parabola_point` is hand-authored project code, reusing only
already-covered arithmetic.

---

## Concept Unit: Naming the Pattern — Parametric Functions

### The Problem

Lesson 21's `point_on_line(line_point, line_direction, t)` and Lesson
22's `is_t_on_ray(t)` both center on a single number called `t`, without
this curriculum ever explaining, in general, what that number actually
represents or why the same letter kept reappearing. Name it.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–22.
- **Files affected:** `geometry_lesson_23.py` — created, as a new file
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


line_point = (0, 0)
line_direction = (3, 4)

print(point_on_line(line_point, line_direction, 0))
print(point_on_line(line_point, line_direction, 1))
print(point_on_line(line_point, line_direction, 2))
print(point_on_line(line_point, line_direction, 3))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* every function above is retyped unchanged from
Lessons 2, 3, and 21. No new Python construct appears anywhere in this
lesson; the new material throughout is the *name* for a pattern already
in use, and the proof that it generalizes.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def add_vector_to_point(...)`, `def scale_vector(...)`, `def
  point_on_line(...)` — Lesson 2, 3, and 21's own functions, retyped
  unchanged. No re-explanation owed, per the Repetition Rule.
- `line_point = (0, 0)`, `line_direction = (3, 4)` — the curriculum's own
  familiar direction, reused.
- The four `print(point_on_line(line_point, line_direction, t))` calls,
  for `t = 0, 1, 2, 3` — already-basic reuse. `point_on_line` here is
  this lesson's own first example of a **parametric function**: `t` is
  the **parameter**, and each call sweeps it to a new value, tracing out
  a different point on the same underlying line — `(0, 0)`, `(3, 4)`,
  `(6, 8)`, `(9, 12)`.

### CS Lens

Naming "a function of one swept parameter, tracing a shape" as its own
concept, separate from any one specific shape it's used to build, is what
makes the same technique recognizable the moment it reappears somewhere
completely different.

```
Also recognized in: animation and motion graphics (a keyframed property —
position, opacity, rotation — is, at its core, a parametric function of
time, evaluated once per frame), robotics motion planning (a robot arm's
planned trajectory is stored as a parametric function of time or of a
normalized path-progress variable, exactly this curriculum's own `t`),
and procedural content generation (a road, a river, or a fence line in a
generated game world is frequently built by evaluating a parametric
curve at evenly spaced parameter values, then connecting the results)
```

### SE Lens

The design principle is **recognizing and naming a pattern already in
use**, rather than treating every new parametric shape as an unrelated,
one-off idea. The alternative not chosen: keep building
`point_on_line`-shaped functions forever, one per shape, without ever
stating what they all have in common.

That alternative would have worked fine functionally — Lesson 21 and 22
never needed the word "parametric" to build correct code. The real cost
of never naming it: a future lesson building a genuinely new parametric
shape (a curve, a surface, an animation path) would have no shared
vocabulary to reach for, and a reader encountering "parametric" in any
outside reference — a graphics API's documentation, a CAD file format's
spec — would have no bridge back to code this curriculum already built
and trusts.

### Commands Needed

`python geometry_lesson_23.py` — same interpreter and command as every
prior lesson.

### Run It

```
(0, 0)
(3, 4)
(6, 8)
(9, 12)
```

Verified by actually running the file above.

### Connection

`point_on_line` is now confirmed to be one instance of a general pattern.
The next unit checks whether that pattern is secretly limited to straight
lines, or genuinely more general.

---

## Concept Unit: Beyond Straight Lines — A Parametric Curve

### The Problem

Every parametric function this curriculum has built so far has traced a
straight line. Before trusting "parametric function" as a genuinely
general idea, build one that doesn't — and check whether it behaves the
same way a line does under equally spaced parameter values, or something
different.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_23.py` — modified.
- **Change type:** add.
- **Location:** appended below the last `print(point_on_line(...))` line
  added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `point_on_line`, `line_point`,
  `line_direction`.

### The New Code

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


import math


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


line_p0 = point_on_line(line_point, line_direction, 0)
line_p1 = point_on_line(line_point, line_direction, 1)
line_p2 = point_on_line(line_point, line_direction, 2)
line_p3 = point_on_line(line_point, line_direction, 3)

print(norm(subtract_points(line_p1, line_p0)))
print(norm(subtract_points(line_p2, line_p1)))
print(norm(subtract_points(line_p3, line_p2)))


def parabola_point(t):
    return (t, t * t)


parabola_p0 = parabola_point(0)
parabola_p1 = parabola_point(1)
parabola_p2 = parabola_point(2)
parabola_p3 = parabola_point(3)

print(parabola_p0)
print(parabola_p1)
print(parabola_p2)
print(parabola_p3)

print(norm(subtract_points(parabola_p1, parabola_p0)))
print(norm(subtract_points(parabola_p2, parabola_p1)))
print(norm(subtract_points(parabola_p3, parabola_p2)))
```

### The Updated Project

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


line_point = (0, 0)
line_direction = (3, 4)

print(point_on_line(line_point, line_direction, 0))
print(point_on_line(line_point, line_direction, 1))
print(point_on_line(line_point, line_direction, 2))
print(point_on_line(line_point, line_direction, 3))


def subtract_points(a, b):                                               # ← new
    return (a[0] - b[0], a[1] - b[1])                                   # ← new


import math                                                               # ← new


def dot_product(a, b):                                                   # ← new
    return a[0] * b[0] + a[1] * b[1]                                    # ← new


def norm(v):                                                             # ← new
    return math.sqrt(dot_product(v, v))                                 # ← new


line_p0 = point_on_line(line_point, line_direction, 0)                   # ← new
line_p1 = point_on_line(line_point, line_direction, 1)                   # ← new
line_p2 = point_on_line(line_point, line_direction, 2)                   # ← new
line_p3 = point_on_line(line_point, line_direction, 3)                   # ← new

print(norm(subtract_points(line_p1, line_p0)))                           # ← new
print(norm(subtract_points(line_p2, line_p1)))                           # ← new
print(norm(subtract_points(line_p3, line_p2)))                           # ← new


def parabola_point(t):                                                   # ← new
    return (t, t * t)                                                   # ← new


parabola_p0 = parabola_point(0)                                          # ← new
parabola_p1 = parabola_point(1)                                          # ← new
parabola_p2 = parabola_point(2)                                          # ← new
parabola_p3 = parabola_point(3)                                          # ← new

print(parabola_p0)                                                       # ← new
print(parabola_p1)                                                       # ← new
print(parabola_p2)                                                       # ← new
print(parabola_p3)                                                       # ← new

print(norm(subtract_points(parabola_p1, parabola_p0)))                   # ← new
print(norm(subtract_points(parabola_p2, parabola_p1)))                   # ← new
print(norm(subtract_points(parabola_p3, parabola_p2)))                   # ← new
```

The file now compares two parametric functions side by side: Lesson 21's
straight line, and a genuinely curved second example, both evaluated at
the identical parameter values `0`, `1`, `2`, `3`.

*A note on method:* `subtract_points`, `import math`, `dot_product`, and
`norm` are Lesson 2, 9, and 7's own code, retyped unchanged.
`parabola_point` is built entirely from already-covered arithmetic
(multiplication, tuple construction). No new Python construct appears
anywhere in this unit.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def subtract_points(...)`, `import math`, `def dot_product(...)`,
  `def norm(...)` — Lesson 2, 9, and 7's own code, retyped unchanged. No
  re-explanation owed, per the Repetition Rule.
- `line_p0` through `line_p3` — already-basic reuse of Concept Unit 1's
  own calls, stored in named variables this time so consecutive points
  can be compared.
- `print(norm(subtract_points(line_p1, line_p0)))`, and the two lines
  below it — already-basic reuse of `norm` and `subtract_points`,
  measuring the straight-line distance between each consecutive pair of
  points. All three come out to exactly `5.0` — **equal steps in `t`
  produce equally spaced points**, for a straight line.
- `def parabola_point(t): return (t, t * t)` — first appearance of a
  parametric function that is *not* a straight line: the point's `y`
  coordinate is the parameter *squared*, while its `x` coordinate is the
  parameter unchanged. This is still a parametric function by Concept
  Unit 1's own definition — one parameter, `t`, mapped to one point — but
  the shape it traces curves, since `y` grows faster than `x` as `t`
  increases.
- `parabola_p0` through `parabola_p3` — already-basic reuse, calling the
  new function at the identical parameter values used for the line
  above: `(0, 0)`, `(1, 1)`, `(2, 4)`, `(3, 9)`.
- `print(norm(subtract_points(parabola_p1, parabola_p0)))`, and the two
  lines below it — the identical spacing measurement, applied to the
  parabola's own points. These come out to `1.4142135623730951`,
  `3.1622776601683795`, and `5.0990195135927845` — visibly, increasingly
  different from each other, not the flat `5.0`, `5.0`, `5.0` the line
  produced.

**What the difference proves.** A parametric function's parameter is
just a label for "where along the shape" — it makes no promise that equal
steps in the parameter produce equal steps in actual distance. A line
happens to have that property (this curriculum's own `point_on_line`
scales the same fixed direction vector by `t` every time, so each unit of
`t` always adds the same length). A curve generally doesn't: the parabola
covers more and more ground per unit of `t` as `t` grows, because its `y`
component accelerates while `x` grows at a constant rate. Both are
legitimate parametric functions; only one of them moves at a constant
rate.

### CS Lens

The gap between "equal steps in the parameter" and "equal steps along the
actual shape" — sometimes called **parametric speed** — is a real,
practical concern anywhere a parametric curve gets sampled or walked.

```
Also recognized in: animation easing curves (a naively linear parameter
sweep applied to a non-linear motion curve produces visibly uneven
motion — objects that appear to speed up or slow down unintentionally,
exactly this lesson's own unequal spacing, which is why animation tools
offer "ease in/out" curves to compensate), font and vector-graphics
rendering (a Bézier curve, used throughout font outlines and vector
graphics, is walked with extra care for this exact reason — naive equal-
`t` sampling produces visibly uneven dot spacing along curved sections),
and CNC feed-rate control (a machine following a curved toolpath at
constant *parameter* speed, rather than constant *physical* speed, would
cut faster through tightly curved sections and slower through gentle
ones — real CAM software explicitly compensates for exactly this
difference)
```

### SE Lens

The design principle this unit's own finding raises is **not assuming a
property proven for one instance of a pattern holds for every instance of
it**. The alternative not chosen: assume, because `point_on_line`'s equal
`t` steps happened to produce equal spacing, that this is simply how
parametric functions behave in general, and build later code — sampling,
animation timing, feed-rate control — on that unverified assumption.

That alternative would work perfectly for every straight line this
curriculum has built, right up until a curved parametric shape finally
appeared, and would then fail in exactly the "objects visibly speed up or
slow down" way this unit's own CS Lens already named — a bug that's easy
to introduce and easy to miss, because it never crashes, it just looks
subtly wrong. Verifying the property directly, on both a line and a
curve, the way this unit just did, is a small amount of extra work that
catches the assumption before it has a chance to become an invisible bug
later in the curriculum.

### Commands Needed

`python geometry_lesson_23.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
(0, 0)
(3, 4)
(6, 8)
(9, 12)
5.0
5.0
5.0
(0, 0)
(1, 1)
(2, 4)
(3, 9)
1.4142135623730951
3.1622776601683795
5.0990195135927845
```

Verified by actually running the updated file above.

### Connection

Two parametric functions, evaluated at the identical parameter values,
produced measurably different spacing behavior — direct proof that
"parametric" is a genuinely general pattern, not a hidden synonym for
"straight line." Connect the Pieces, below, traces both side by side.

---

## Connect the Pieces

Two parametric functions, the same four parameter values, traced side by
side:

1. `point_on_line(line_point, line_direction, t)` and `parabola_point(t)`
   are both **parametric functions** by the same definition: one number,
   `t`, mapped to one point.
2. At `t = 0, 1, 2, 3`, the line produces `(0, 0)`, `(3, 4)`, `(6, 8)`,
   `(9, 12)` — consecutive points exactly `5.0` apart, every time.
3. At the identical `t = 0, 1, 2, 3`, the parabola produces `(0, 0)`,
   `(1, 1)`, `(2, 4)`, `(3, 9)` — consecutive points `1.41`, `3.16`, and
   `5.10` apart: increasing, not constant.
4. Both are correct, real parametric functions. Only the line's
   parameter happens to move at a constant physical speed; the
   parabola's does not — a real, measured difference, not a matter of
   opinion about which one "counts" as parametric.

## What Breaks Without This

A naive animation or toolpath system might assume equal steps in `t`
always mean equal steps in distance, and space its sample points purely
by `t` as a result. Check what that assumption actually produces on the
parabola, compared to spacing the same number of samples out by actual
distance instead:

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


import math


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def parabola_point(t):
    return (t, t * t)


sample_0 = parabola_point(0)
sample_1 = parabola_point(1)
sample_2 = parabola_point(2)
sample_3 = parabola_point(3)

gap_0_to_1 = norm(subtract_points(sample_1, sample_0))
gap_1_to_2 = norm(subtract_points(sample_2, sample_1))
gap_2_to_3 = norm(subtract_points(sample_3, sample_2))

print(gap_0_to_1)
print(gap_1_to_2)
print(gap_2_to_3)
print(gap_2_to_3 / gap_0_to_1)
```

```
1.4142135623730951
3.1622776601683795
5.0990195135927845
3.605551275463989
```

Verified by actually running this. Four sample points, spaced by equal
steps of `t`, are supposed to represent an evenly-sampled curve — but the
gap between the last two samples is `3.605551275463989` times *larger*
than the gap between the first two, from the exact same parametric
function and the exact same step size in `t`. A CNC controller or
animation system that trusted equal-`t` spacing to mean equal-distance
spacing would move over three and a half times faster through the later
part of this curve than the earlier part, with no error, warning, or
crash — nothing about the code looks wrong, and the mistake only shows up
as the object visibly, physically speeding up. This is not a hypothetical
edge case; it's the direct, verified consequence of Concept Unit 2's own
finding, applied to a real downstream use.

## Exercises

1. Using `norm` and `subtract_points`, measure the spacing between
   `parabola_point(3)` and `parabola_point(4)`. Confirm it's larger still
   than the `5.0990195135927845` gap between `t = 2` and `t = 3`, and
   explain why the gaps keep growing rather than eventually leveling off.
2. Build a third parametric function, `cubic_point(t) = (t, t * t * t)`.
   Measure its own spacing at `t = 0, 1, 2, 3`, and compare how much
   faster its spacing grows compared to the parabola's.
3. Using `point_on_line`, confirm that a *negative* direction — reusing
   this lesson's own `line_direction` scaled by `-1` via `scale_vector` —
   still produces perfectly equal spacing under equal `t` steps, the same
   way the original line did. Explain why negating the direction doesn't
   change the constant-spacing property this lesson found special to
   lines.

## Definition of Done

- [ ] `geometry_lesson_23.py` exists and runs with no errors via `python
      geometry_lesson_23.py`.
- [ ] Running it prints the full 14-line sequence shown in Concept Unit
      2's Run It, ending in `1.4142135623730951`, `3.1622776601683795`,
      then `5.0990195135927845` — matching this lesson's verified output
      exactly.
- [ ] You can explain, without looking at the file, what a parameter and
      a parametric function are, using `point_on_line` as the example.
- [ ] You can explain why equal steps in `t` produced equal spacing for
      the line but not for the parabola, using this lesson's own verified
      numbers.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Name the parametric-function pattern and prove it generalizes beyond straight lines"`,
      not `git commit -m "add parabola example"`.

Next: Lesson 24 — Line-Line Intersection, which returns to straight lines
specifically, deriving where two of Lesson 21's own lines cross by
solving for the parameter values where both parametric formulas agree on
the same point.
