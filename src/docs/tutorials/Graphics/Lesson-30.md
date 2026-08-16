# Lesson 30: Circles

**What you will build:** This curriculum's first genuinely new shape
since Section I — a circle, represented as a `(center, radius)` pair —
plus `distance_from_center` and `classify_point_vs_circle`, a three-way
predicate answering whether a point sits inside, on, or outside a circle,
built entirely from Lesson 2's `subtract_points` and Lesson 9's `norm`.
The transferable problem: every shape Section II has built so far —
line, ray, segment — was defined by one or two *points*. A circle can't
be: its entire boundary is the set of points at one fixed *distance* from
a center, which needs a genuinely different representation, even though
every tool used to query it turns out to already exist.

**What you need to know first:** Lesson 2's `subtract_points`, Lesson 9's
`norm`, Lesson 17's `nearly_equal`, and Lesson 19's `if`/`elif`/`else`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–29.

**Terms introduced in this lesson:**

- **Circle** — the set of all points at a fixed distance, the **radius**,
  from a fixed **center** point. Why: unlike every shape built since
  Lesson 21, a circle isn't defined by naming specific points on its own
  boundary — it's defined by a *rule* (distance from center equals
  radius) that every boundary point must satisfy, a genuinely different
  kind of representation.

**Objects and methods used:**

None. `distance_from_center` and `classify_point_vs_circle` are
hand-authored project code, built from Lesson 2, 9, and 17's own reused
functions.

---

## Concept Unit: Representing a Circle — Center and Radius

### The Problem

A line needed two points, or a point and a direction. A circle can't be
pinned down by naming a handful of points on its boundary — infinitely
many points qualify, and none of them is more "defining" than any other.
What a circle actually needs is a center point and a fixed distance from
it — represent that, and build the one measurement every circle query
will need first: how far a given point actually is from the center.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–29.
- **Files affected:** `geometry_lesson_30.py` — created, as a new file
  for this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
import math


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def distance_from_center(p, circle):
    center = circle[0]
    return norm(subtract_points(p, center))


circle = ((0, 0), 5)

print(distance_from_center((3, 4), circle))
print(distance_from_center((0, 0), circle))
print(distance_from_center((10, 10), circle))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `subtract_points`, `dot_product`, and `norm` are
Lesson 2, 7, and 9's own functions, retyped unchanged. Representing a
circle as `(center, radius)` — a tuple whose first element is itself a
tuple — uses the same nested-tuple indexing Lesson 14's own isolated lab
already proved safe (`circle[0]` reaches the whole center point). No new
Python construct appears here, so no isolated throwaway lab is needed;
what's new is the representation choice, not any new syntax.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `import math`, `def subtract_points(...)`, `def dot_product(...)`, `def
  norm(...)` — Lesson 9, 2, and 7's own code, retyped unchanged. No
  re-explanation owed, per the Repetition Rule.
- `def distance_from_center(p, circle): ...` — first appearance: a
  function taking a point and a whole **circle** value together.
- `center = circle[0]` — first appearance of indexing into a circle:
  `circle[0]` reaches the center point, the same nested-tuple indexing
  rule Lesson 14 already established, applied to a new kind of pair
  instead of a matrix row.
- `return norm(subtract_points(p, center))` — already-basic reuse:
  exactly the same straight-line distance computation Lesson 9 built,
  applied between `p` and the circle's own center.
- `circle = ((0, 0), 5)` — first appearance of an actual **circle**
  value: a center at the origin, radius `5`.
- `print(distance_from_center((3, 4), circle))` — `(3, 4)` is exactly
  `5` units from `(0, 0)` (Lesson 9's own `norm((3, 4)) = 5.0` fact,
  reused). Prints `5.0`.
- `print(distance_from_center((0, 0), circle))` — the circle's own
  center, `0` units from itself. Prints `0.0`.
- `print(distance_from_center((10, 10), circle))` — well outside the
  circle. Prints `14.142135623730951`.

### CS Lens

Representing a shape by the *rule* its points satisfy, rather than by
naming specific points on it, is the general idea behind every
**implicit representation** — worth naming here since every shape before
this lesson was represented the opposite way.

```
Also recognized in: signed distance fields (a widely used technique in
modern rendering and CAD kernels that represents *any* shape — not just a
circle — as "the distance from this point to the nearest boundary,"
generalizing exactly this lesson's own `distance_from_center` idea far
beyond circles), implicit curves and surfaces in CAD (a fillet or blend
surface is frequently defined by an equation every point on it must
satisfy, rather than by an explicit list of points), and physics
collision shapes (a sphere collider in a game engine is stored as exactly
this lesson's own `(center, radius)` pair, for the identical reason — no
list of boundary points would ever be complete)
```

### SE Lens

The design principle is **choosing a representation shaped by what the
object actually is**, rather than forcing every shape through the same
representation for consistency's sake. The alternative not chosen:
represent a circle as a large, fixed collection of individual points
sampled around its boundary, the same general shape as a line's own two
endpoints, just with more of them.

That alternative would let a circle reuse `is_point_on_segment`-style
logic unchanged. The real cost it pays: any fixed number of sampled
points is only ever an approximation of the true, perfectly round
boundary — checking whether an arbitrary point is "on" the circle would
mean checking proximity to the nearest sample, not the mathematically
exact boundary this lesson's `(center, radius)` pair represents exactly,
with zero approximation, using a single fixed number.

### Commands Needed

`python geometry_lesson_30.py` — same interpreter and command as every
prior lesson.

### Run It

```
5.0
0.0
14.142135623730951
```

Verified by actually running the file above.

### Connection

`distance_from_center` measures how far any point is from a circle's own
center. The next unit turns that measurement into an actual three-way
predicate.

---

## Concept Unit: Point-in-Circle — A New Kind of Predicate

### The Problem

A distance alone isn't yet an answer to "is this point inside, on, or
outside the circle" — that requires comparing the distance to the
circle's own radius. And because that comparison inevitably involves the
same kind of floating-point division and multiplication Lesson 17 already
proved is real, the "on the boundary" case needs `nearly_equal` from the
start, not `==`.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_30.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(distance_from_center((10, 10),
  circle))` line added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `distance_from_center`, `circle`.

### The New Code

```python
def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


def classify_point_vs_circle(p, circle, tolerance):
    center = circle[0]
    radius = circle[1]
    distance = norm(subtract_points(p, center))

    if nearly_equal(distance, radius, tolerance):
        return "on"
    elif distance < radius:
        return "inside"
    else:
        return "outside"


print(classify_point_vs_circle((3, 4), circle, 0.0000001))
print(classify_point_vs_circle((0, 0), circle, 0.0000001))
print(classify_point_vs_circle((10, 10), circle, 0.0000001))
```

### The Updated Project

```python
import math


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def distance_from_center(p, circle):
    center = circle[0]
    return norm(subtract_points(p, center))


circle = ((0, 0), 5)

print(distance_from_center((3, 4), circle))
print(distance_from_center((0, 0), circle))
print(distance_from_center((10, 10), circle))


def nearly_equal(a, b, tolerance):                                       # ← new
    return abs(a - b) < tolerance                                       # ← new


def classify_point_vs_circle(p, circle, tolerance):                      # ← new
    center = circle[0]                                                   # ← new
    radius = circle[1]                                                   # ← new
    distance = norm(subtract_points(p, center))                          # ← new
                                                                           # ← new
    if nearly_equal(distance, radius, tolerance):                        # ← new
        return "on"                                                      # ← new
    elif distance < radius:                                              # ← new
        return "inside"                                                  # ← new
    else:                                                                # ← new
        return "outside"                                                 # ← new


print(classify_point_vs_circle((3, 4), circle, 0.0000001))               # ← new
print(classify_point_vs_circle((0, 0), circle, 0.0000001))               # ← new
print(classify_point_vs_circle((10, 10), circle, 0.0000001))             # ← new
```

The file now answers the actual question a circle raises: not just how
far a point is, but which of three regions it falls into.

*A note on method:* `nearly_equal` is Lesson 17's own function, retyped
unchanged; `if`/`elif`/`else` is Lesson 19's own already-taught
construct. No new Python construct is introduced.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def nearly_equal(a, b, tolerance): ...` — Lesson 17's own function,
  retyped unchanged. No re-explanation owed, per the Repetition Rule.
- `def classify_point_vs_circle(p, circle, tolerance): ...` — first
  appearance: this lesson's actual predicate.
- `center = circle[0]`, `radius = circle[1]` — already-basic indexing,
  identical in kind to Concept Unit 1's own `circle[0]`.
- `distance = norm(subtract_points(p, center))` — already-basic reuse,
  identical to `distance_from_center`'s own body.
- `if nearly_equal(distance, radius, tolerance): return "on"` — a **hard
  concept reappearing**: `nearly_equal`, already given full treatment in
  Lesson 17, checked *first*, the same "check the boundary case before
  the sign-based cases" ordering Lesson 19's `classify_turn_tolerant`
  already established.
- `elif distance < radius: return "inside"` — already-basic comparison,
  the point sits closer to the center than the radius allows.
- `else: return "outside"` — the remaining case, farther than the
  radius.
- The three `print(classify_point_vs_circle(...))` calls — already-basic;
  `(3, 4)` prints `"on"` (exactly `5.0` from the center, matching the
  radius), `(0, 0)` prints `"inside"`, `(10, 10)` prints `"outside"`.

### CS Lens

Checking a tolerance-based boundary condition before either of the two
strict comparisons on either side of it, rather than after, is the exact
same discipline Lesson 19's `classify_turn_tolerant` already established
for turns — now confirmed to generalize to a completely different kind of
boundary.

```
Also recognized in: collision detection (deciding whether two circular
objects are touching, overlapping, or separate uses this identical
three-way structure — boundary case checked with a tolerance first, then
the two strict cases), audio signal gating (a noise gate checks whether a
signal's level is within a small tolerance of a threshold before
deciding "open" or "closed," rather than using a single exact cutoff),
and manufacturing inspection (checking whether a machined hole's diameter
falls within, exactly at, or outside a tolerance band around a nominal
value is this exact three-way pattern, applied to a real physical
measurement)
```

### SE Lens

The design principle is **building the tolerant version directly,
without a separate "strict version first" lesson**, now that this
curriculum has already taught why strict equality fails on computed
floats three separate times (Lessons 17, 18, 19). The alternative not
chosen: build `classify_point_vs_circle` with `distance == radius`
first, the way Lesson 18 originally built `is_point_on_line`, and only
add tolerance in a following unit.

That alternative was the right pacing the first time this curriculum
ever encountered the problem, when the lesson *was* proving tolerance is
necessary. Repeating that same two-step structure for every new
predicate from here forward would re-teach an already-learned lesson
instead of applying it — this lesson goes straight to the tolerant
version, and Concept Unit 3 still proves, with a real number, that the
tolerance is doing genuine work, rather than skipping the proof
entirely.

### Commands Needed

`python geometry_lesson_30.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
5.0
0.0
14.142135623730951
on
inside
outside
```

Verified by actually running the updated file above.

### Connection

`classify_point_vs_circle` correctly sorts three hand-typed points into
all three categories. The next unit proves the tolerance it was built
with from the start is actually load-bearing, not decorative.

---

## Concept Unit: Proving the Tolerance Is Load-Bearing

### The Problem

`classify_point_vs_circle` was built tolerant from the beginning, on the
strength of lessons already taught — but that's a claim, not yet a
demonstration. Build a real point on a real circle's boundary, produced
by computation rather than typed by hand, and confirm it would actually
fail a strict `==` check.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_30.py` — modified.
- **Change type:** add.
- **Location:** appended below the final `print(classify_point_vs_circle(...))`
  line added in Concept Unit 2.
- **Dependencies:** Concept Unit 1's `distance_from_center`, Concept Unit
  2's `classify_point_vs_circle`.

### The New Code

```python
def scale_vector(v, factor):
    return (v[0] * factor, v[1] * factor)


def normalize(v):
    return scale_vector(v, 1 / norm(v))


small_circle = ((0, 0), 4)
computed_edge_point = scale_vector(normalize((1, 1)), 4)
computed_distance = distance_from_center(computed_edge_point, small_circle)

print(computed_edge_point)
print(computed_distance)
print(computed_distance == 4)
print(classify_point_vs_circle(computed_edge_point, small_circle, 0.0000001))
```

### The Updated Project

```python
import math


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def distance_from_center(p, circle):
    center = circle[0]
    return norm(subtract_points(p, center))


circle = ((0, 0), 5)

print(distance_from_center((3, 4), circle))
print(distance_from_center((0, 0), circle))
print(distance_from_center((10, 10), circle))


def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


def classify_point_vs_circle(p, circle, tolerance):
    center = circle[0]
    radius = circle[1]
    distance = norm(subtract_points(p, center))

    if nearly_equal(distance, radius, tolerance):
        return "on"
    elif distance < radius:
        return "inside"
    else:
        return "outside"


print(classify_point_vs_circle((3, 4), circle, 0.0000001))
print(classify_point_vs_circle((0, 0), circle, 0.0000001))
print(classify_point_vs_circle((10, 10), circle, 0.0000001))


def scale_vector(v, factor):                                             # ← new
    return (v[0] * factor, v[1] * factor)                               # ← new


def normalize(v):                                                        # ← new
    return scale_vector(v, 1 / norm(v))                                 # ← new


small_circle = ((0, 0), 4)                                               # ← new
computed_edge_point = scale_vector(normalize((1, 1)), 4)                 # ← new
computed_distance = distance_from_center(computed_edge_point, small_circle)  # ← new

print(computed_edge_point)                                               # ← new
print(computed_distance)                                                 # ← new
print(computed_distance == 4)                                            # ← new
print(classify_point_vs_circle(computed_edge_point, small_circle, 0.0000001))  # ← new
```

The file now includes a real, computed boundary point, alongside the
proof that a strict comparison would have misjudged it.

*A note on method:* `scale_vector` and `normalize` are Lesson 3 and 10's
own functions, retyped unchanged. No new Python construct is introduced.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def scale_vector(v, factor): ...`, `def normalize(v): ...` — Lesson 3
  and 10's own functions, retyped unchanged. No re-explanation owed, per
  the Repetition Rule.
- `small_circle = ((0, 0), 4)` — a second circle, radius `4`, chosen
  specifically because `(1, 1)` scaled to length `4` is already known to
  produce visible floating-point noise (the same kind of search Lesson
  17 and 18 already performed to find their own noisy examples).
- `computed_edge_point = scale_vector(normalize((1, 1)), 4)` —
  already-basic reuse: a point built to sit exactly on `small_circle`'s
  boundary, mathematically, the same way Lesson 18's own
  `computed_point` was built to sit exactly on a line.
- `computed_distance = distance_from_center(computed_edge_point,
  small_circle)` — Concept Unit 1's own function, reused.
- `print(computed_edge_point)` — prints `(2.82842712474619,
  2.82842712474619)`.
- `print(computed_distance)` — prints `3.9999999999999996` — not the
  clean `4.0` the math promises.
- `print(computed_distance == 4)` — prints `False`: a strict equality
  check would wrongly conclude this point is *not* on the circle.
- `print(classify_point_vs_circle(computed_edge_point, small_circle,
  0.0000001))` — the actual, already-tolerant predicate, on the same
  point. Prints `"on"` — correct.

### CS Lens

Confirming that a defensive design choice (building tolerant from the
start) actually prevents a real, reproducible failure — rather than
trusting that it must, because the reasoning sounded right — is the same
discipline Lesson 16 already applied to matrix inverses.

```
Also recognized in: regression testing (a test suite that exercises the
exact edge case a bug fix was meant to prevent, rather than only checking
that the code "looks right," is the software-engineering version of this
lesson's own `computed_distance == 4` check), safety-critical systems
verification (formal verification of tolerance-based logic in
aerospace or medical device software specifically constructs known
boundary-case inputs to confirm a tolerance actually catches them,
not just that the logic compiles or reads correctly), and numerical
library testing (floating-point math libraries are tested against
specifically chosen inputs known to expose rounding behavior, the same
targeted search this lesson's own `(1, 1)`-direction example came from)
```

### SE Lens

The design principle is **testing the specific failure a defensive
choice was meant to prevent**, rather than assuming the defense works
because it was reasoned through carefully. The alternative not chosen:
trust Concept Unit 2's own reasoning — "tolerance is needed because
Lessons 17–19 already proved it" — without ever constructing a concrete
case that would have failed without it.

That alternative would have been correct reasoning, applied without
proof. The real value of this unit's own concrete `computed_edge_point`:
it turns "tolerance is needed here, by analogy to earlier lessons" into
"tolerance is needed here, and here is the exact number that would have
been wrongly classified without it" — the same standard of evidence this
whole curriculum has applied to every other claim since Lesson 1.

### Commands Needed

`python geometry_lesson_30.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
5.0
0.0
14.142135623730951
on
inside
outside
(2.82842712474619, 2.82842712474619)
3.9999999999999996
False
on
```

Verified by actually running the updated file above.

### Connection

The tolerance built into `classify_point_vs_circle` from its first
version is now proven necessary, not merely plausible. Connect the
Pieces, below, traces both circles this lesson built, start to finish.

---

## Connect the Pieces

Two circles, traced through everything this lesson built, start to
finish:

1. `circle = ((0, 0), 5)` — hand-typed points `(3, 4)`, `(0, 0)`, and
   `(10, 10)` correctly classify as `"on"`, `"inside"`, and `"outside"`.
2. `small_circle = ((0, 0), 4)` — `computed_edge_point =
   scale_vector(normalize((1, 1)), 4)` is built to sit exactly on this
   circle's own boundary, mathematically.
3. `distance_from_center(computed_edge_point, small_circle)` comes out
   to `3.9999999999999996`, not a clean `4.0` — the same floating-point
   rounding Lesson 17 first proved is unavoidable.
4. `computed_distance == 4` is `False` — a strict check would wrongly
   reject a genuinely correct boundary point.
5. `classify_point_vs_circle(computed_edge_point, small_circle,
   0.0000001)` correctly returns `"on"` — the tolerance built into this
   lesson's very first version of the predicate does real, necessary
   work, not decorative work.

## What Breaks Without This

Prove the flip side, the way Lesson 18's own closing did: what happens if
`classify_point_vs_circle`'s tolerance is set far too loosely, using a
point that is genuinely, visibly outside the circle rather than merely
carrying floating-point noise:

```python
import math


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def nearly_equal(a, b, tolerance):
    return abs(a - b) < tolerance


def classify_point_vs_circle(p, circle, tolerance):
    center = circle[0]
    radius = circle[1]
    distance = norm(subtract_points(p, center))

    if nearly_equal(distance, radius, tolerance):
        return "on"
    elif distance < radius:
        return "inside"
    else:
        return "outside"


circle = ((0, 0), 5)
clearly_outside_point = (5.5, 0)

print(classify_point_vs_circle(clearly_outside_point, circle, 0.0000001))
print(classify_point_vs_circle(clearly_outside_point, circle, 1.0))
```

```
outside
on
```

Verified by actually running this. `(5.5, 0)` sits a real, visible `0.5`
units outside `circle`'s own radius of `5` — nothing to do with
floating-point rounding. A sensible, tight tolerance (`0.0000001`, the
same value used throughout this lesson) correctly reports `"outside"`.
A tolerance chosen far too generously (`1.0`) reports `"on"` instead — a
false claim that this point sits exactly on the boundary, when it's
genuinely half a unit away. This is the same tolerance tradeoff Lesson
18's own closing section first proved for collinearity, confirmed again
here for an entirely different kind of boundary: the right tolerance
value is a real engineering decision, not a value that can be picked
carelessly just because tolerance in general is the correct approach.

## Exercises

1. Using `classify_point_vs_circle`, test a point exactly at the circle's
   own center plus its radius along the x-axis only — `(5, 0)` for
   `circle = ((0, 0), 5)`. Confirm it classifies as `"on"`, and explain
   why this particular point needs no floating-point tolerance at all to
   get right.
2. Build a circle with a non-origin center, `circle = ((10, 10), 3)`, and
   verify `classify_point_vs_circle` correctly classifies three points of
   your own choosing — one inside, one on, one outside — relative to this
   shifted center.
3. Using `distance_from_center`, write a function
   `circles_concentric(circle1, circle2)` that returns `True` only when
   two circles share the exact same center, using `nearly_equal` on both
   coordinates. Test it on two circles with the same center but different
   radii, and two circles with different centers entirely.

## Definition of Done

- [ ] `geometry_lesson_30.py` exists and runs with no errors via `python
      geometry_lesson_30.py`.
- [ ] Running it prints the full 10-line sequence shown in Concept Unit
      3's Run It, ending in `(2.82842712474619, 2.82842712474619)`,
      `3.9999999999999996`, `False`, then `on` — matching this lesson's
      verified output exactly.
- [ ] You can explain, without looking at the file, why a circle needs a
      different representation than every shape built since Lesson 21.
- [ ] You can explain why `classify_point_vs_circle` was built tolerant
      from its first version, rather than strict-then-fixed like earlier
      predicates, using this lesson's own verified
      `computed_edge_point` proof.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Represent circles and build a tolerant point-vs-circle predicate"`,
      not `git commit -m "add circle functions"`.

Next: Lesson 31 — Circle-Line Intersection, which finds where a line
meets a circle by substituting Lesson 21's parametric line formula into
this lesson's own distance-from-center relationship, introducing the
quadratic formula's zero/one/two-solution case split for the first time
in this curriculum.
