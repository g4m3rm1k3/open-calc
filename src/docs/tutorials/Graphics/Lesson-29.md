# Lesson 29: Distance to a Segment

**What you will build:** `distance_to_segment`, reusing Lesson 28's own
projection-based distance when the closest point on the underlying line
actually falls within the segment's bounds — and, for the first time,
real logic for when it doesn't: comparing the distance to each endpoint
and picking whichever is actually closer. The transferable problem:
Lesson 28's `closest_point` is only ever the true closest point on the
*infinite* line. Lesson 21 already proved a segment's bounds can exclude
a point the underlying line would otherwise accept — this lesson is where
that same gap finally matters for distance, not just for a yes/no test.

**What you need to know first:** Lesson 28's `distance_to_line` and its
own perpendicular-projection reasoning, Lesson 21's `is_t_on_segment`,
and Lesson 19's `if`/`elif`/`else`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–28.

**Terms introduced in this lesson:**

None. This lesson combines Lesson 21 and 28's own already-introduced
material into a new function, without introducing a new named concept.

**Objects and methods used:**

None. `distance_to_segment` is hand-authored project code, built from
Lesson 2, 7, 9, 19, and 21's own reused functions.

---

## Concept Unit: When the Projection Lands Inside the Segment

### The Problem

Lesson 28's `distance_to_line` always measures to the *perpendicular*
closest point — correct for an infinite line, but not necessarily a
point that exists on a bounded segment at all. Start with the case where
it does land inside the bounds, and confirm the segment version agrees
with Lesson 28's own answer exactly.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–28.
- **Files affected:** `geometry_lesson_29.py` — created, as a new file
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


def is_t_on_segment(t):
    return 0 <= t <= 1


def distance_to_segment(p, segment_start, segment_end):
    direction = subtract_points(segment_end, segment_start)
    t = find_t_for_point(p, segment_start, direction)

    if is_t_on_segment(t):
        closest_point = point_on_line(segment_start, direction, t)
        return norm(subtract_points(p, closest_point))


segment_start = (0, 0)
segment_end = (3, 4)

p1 = (0, 5)

print(distance_to_segment(p1, segment_start, segment_end))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* every function above is retyped unchanged from
Lessons 2, 3, 7, 9, and 21; `if`/`else` is Lesson 19's own already-taught
construct. No new Python construct appears here, so no isolated
throwaway lab is needed.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def add_vector_to_point(...)` through `def is_t_on_segment(t): ...` —
  Lesson 2, 3, 7, 9, and 21's own functions, retyped unchanged. No
  re-explanation owed, per the Repetition Rule.
- `def distance_to_segment(p, segment_start, segment_end): ...` — first
  appearance: this lesson's own subject, taking two endpoints the same
  way Lesson 25's `segment_intersection` did, rather than a
  point-and-direction pair.
- `direction = subtract_points(segment_end, segment_start)` —
  already-basic reuse, recovering the segment's own direction from its
  endpoints.
- `t = find_t_for_point(p, segment_start, direction)` — Lesson 21's own
  function, reused unchanged.
- `if is_t_on_segment(t):` — Lesson 21's own bounds check, reused, this
  time deciding which of two different strategies to use, rather than
  producing a plain yes/no answer on its own.
- `closest_point = point_on_line(segment_start, direction, t)` — Lesson
  21's own function, reused, identical to Lesson 28's own approach: the
  perpendicular closest point, valid here because it's already confirmed
  to fall within the segment's own bounds.
- `return norm(subtract_points(p, closest_point))` — Lesson 2 and 9's own
  functions, combined exactly as Lesson 28's `distance_to_line` did.
- `p1 = (0, 5)` — Lesson 28's own example point, reused, whose projection
  onto this segment's underlying line already lands at `t = 0.8` —
  comfortably within `0`-to-`1`.
- `print(distance_to_segment(p1, segment_start, segment_end))` — prints
  `3.0`, matching Lesson 28's own `distance_to_line` result on the
  identical point and line exactly.

### CS Lens

Choosing between two different strategies based on a cheap upfront check
— here, whether the projection falls in bounds — rather than always
running the more general one, is worth recognizing as a pattern distinct
from the guard clauses Lesson 25 already named.

```
Also recognized in: nearest-point-on-shape algorithms broadly (finding
the closest point on a rectangle, a polygon edge, or a curved boundary
almost always branches between "the perpendicular projection is valid" and
"clamp to the nearest boundary feature instead," this lesson's own exact
structure), physics engines (collision response against a capsule or
box shape branches the same way between a face-projection case and a
corner-or-edge-clamping case), and pathfinding (a steering algorithm
computing how far an agent is from its planned path uses this identical
in-bounds-vs-clamped logic to avoid impossible "shortcuts" through the
path's own extension)
```

### SE Lens

The design principle is **reusing an existing, more general solution
exactly when it applies, and only building new logic for the case it
doesn't cover**. The alternative not chosen: write `distance_to_segment`
as an entirely fresh function, without calling `find_t_for_point`,
`point_on_line`, or reusing `is_t_on_segment` at all.

That alternative would work, if written correctly, but would duplicate
logic Lesson 28 and 21 already built, tested, and trusted. This unit's
own approach costs nothing extra when the projection lands inside the
bounds — `distance_to_segment` and `distance_to_line` agree exactly, as
just verified — and only the next unit's genuinely new logic gets added
for the case that actually differs.

### Commands Needed

`python geometry_lesson_29.py` — same interpreter and command as every
prior lesson.

### Run It

```
3.0
```

Verified by actually running the file above.

### Connection

`distance_to_segment` correctly matches `distance_to_line` when the
projection lands inside the bounds. The next unit builds what happens
when it doesn't.

---

## Concept Unit: When the Projection Falls Outside — the Closest Endpoint

### The Problem

When `t` falls outside `0`-to-`1`, the perpendicular closest point on the
underlying line doesn't actually exist anywhere on the real segment. The
true closest point on the segment, in that case, is always one of its two
endpoints — but which one depends on the specific point being measured
from, and has to be determined, not guessed.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_29.py` — modified.
- **Change type:** replace (the incomplete `distance_to_segment` from
  Concept Unit 1 gains a real `else` branch).
- **Location:** inside `distance_to_segment`, replacing the single `if`
  added in Concept Unit 1 with a full `if`/`else`.
- **Dependencies:** Concept Unit 1's `distance_to_segment`,
  `find_t_for_point`, `norm`, `subtract_points`.

### The New Code

```python
def distance_to_segment(p, segment_start, segment_end):
    direction = subtract_points(segment_end, segment_start)
    t = find_t_for_point(p, segment_start, direction)

    if is_t_on_segment(t):
        closest_point = point_on_line(segment_start, direction, t)
    else:
        distance_to_start = norm(subtract_points(p, segment_start))
        distance_to_end = norm(subtract_points(p, segment_end))
        if distance_to_start < distance_to_end:
            closest_point = segment_start
        else:
            closest_point = segment_end

    return norm(subtract_points(p, closest_point))


p2 = (10, 10)

t1 = find_t_for_point(p1, segment_start, subtract_points(segment_end, segment_start))
t2 = find_t_for_point(p2, segment_start, subtract_points(segment_end, segment_start))

print(t1)
print(t2)
print(distance_to_segment(p1, segment_start, segment_end))
print(distance_to_segment(p2, segment_start, segment_end))
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


def is_t_on_segment(t):
    return 0 <= t <= 1


def distance_to_segment(p, segment_start, segment_end):
    direction = subtract_points(segment_end, segment_start)
    t = find_t_for_point(p, segment_start, direction)

    if is_t_on_segment(t):
        closest_point = point_on_line(segment_start, direction, t)
    else:                                                                # ← new
        distance_to_start = norm(subtract_points(p, segment_start))      # ← new
        distance_to_end = norm(subtract_points(p, segment_end))          # ← new
        if distance_to_start < distance_to_end:                         # ← new
            closest_point = segment_start                                # ← new
        else:                                                            # ← new
            closest_point = segment_end                                 # ← new

    return norm(subtract_points(p, closest_point))


segment_start = (0, 0)
segment_end = (3, 4)

p1 = (0, 5)
p2 = (10, 10)                                                             # ← new

t1 = find_t_for_point(p1, segment_start, subtract_points(segment_end, segment_start))  # ← new
t2 = find_t_for_point(p2, segment_start, subtract_points(segment_end, segment_start))  # ← new

print(t1)                                                                 # ← new
print(t2)                                                                 # ← new
print(distance_to_segment(p1, segment_start, segment_end))
print(distance_to_segment(p2, segment_start, segment_end))               # ← new
```

`distance_to_segment` is now complete: every input, whether its
projection lands inside or outside the segment's bounds, produces a real
answer.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `else:` — first appearance of the branch that runs when `t` falls
  outside `0`-to-`1`.
- `distance_to_start = norm(subtract_points(p, segment_start))`,
  `distance_to_end = norm(subtract_points(p, segment_end))` — first
  appearance: measuring the plain, direct distance from `p` to each of
  the segment's two endpoints, using Lesson 2 and 9's own functions,
  reused.
- `if distance_to_start < distance_to_end: closest_point = segment_start`
  — a nested `if`, already-basic given `if`/`else`'s own full treatment
  in Lesson 19: whichever endpoint is genuinely nearer becomes the
  segment's own closest point.
- `else: closest_point = segment_end` — the remaining case, including a
  tie, where the endpoint is at least as close as the other.
- `return norm(subtract_points(p, closest_point))` — already-basic reuse,
  identical regardless of which branch set `closest_point`.
- `p2 = (10, 10)` — a point far past `segment_end`, deliberately chosen
  so its projection falls well outside the segment's bounds.
- `t1`, `t2`, computed and printed directly — `t1` prints `0.8` (inside
  bounds, matching Concept Unit 1), `t2` prints `2.8` (outside bounds,
  more than twice past `segment_end`).
- `print(distance_to_segment(p1, segment_start, segment_end))` — prints
  `3.0`, unchanged from Concept Unit 1 — this call still takes the `if`
  branch.
- `print(distance_to_segment(p2, segment_start, segment_end))` — this
  call takes the new `else` branch. `distance_to_start` and
  `distance_to_end` are compared, `segment_end` turns out closer, and the
  function prints `9.219544457292887` — the plain straight-line distance
  from `(10, 10)` to `(3, 4)`, not to any point on the underlying
  infinite line.

### CS Lens

Clamping to the nearest boundary feature once a computed value falls
outside a valid range — rather than using an out-of-range value directly
— is a specific, common instance of a much more general **clamping**
technique.

```
Also recognized in: audio processing (a signal that would exceed the
maximum volume is clamped to the loudest representable value instead of
wrapping around or distorting unpredictably), UI layout systems (a
scrollable panel clamps its scroll position to its actual content
bounds, refusing to scroll past the beginning or end), and numerical
optimization (a constrained optimizer clamps a candidate solution back
onto the boundary of its allowed region whenever an unconstrained step
would carry it outside)
```

### SE Lens

The design principle is **handling the boundary case as its own real
branch, rather than extrapolating the general formula past where it's
valid**. The alternative not chosen: skip the endpoint-distance
comparison entirely, and just clamp `t` itself to the nearest bound
(`0` or `1`) before calling `point_on_line`.

That alternative would actually produce the identical final answer here,
since clamping `t` to `0` or `1` and calling `point_on_line` computes
exactly `segment_start` or `segment_end` anyway. The real reason this
unit computed both endpoint distances directly instead: it makes the
*decision* — which endpoint is actually closer — explicit and inspectable
as a real comparison of real distances, rather than folding it into a
`t`-clamping step whose connection to "which endpoint" isn't visible
without already knowing `point_on_line`'s own behavior at `t = 0` and
`t = 1` by heart.

### Commands Needed

`python geometry_lesson_29.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
0.8
2.8
3.0
9.219544457292887
```

Verified by actually running the updated file above.

### Connection

`distance_to_segment` now handles both cases correctly: projection inside
the bounds, and projection outside, clamped to the nearer endpoint.
Connect the Pieces, below, traces both `p1` and `p2` start to finish.

---

## Connect the Pieces

Two points, traced through everything this lesson built, start to
finish:

1. `segment_start = (0, 0)`, `segment_end = (3, 4)` — this lesson's fixed
   segment.
2. `p1 = (0, 5)`: `t = 0.8`, inside `0`-to-`1`. `distance_to_segment`
   takes the `if` branch, reusing Lesson 28's own perpendicular
   projection, and returns `3.0` — identical to `distance_to_line`'s own
   answer.
3. `p2 = (10, 10)`: `t = 2.8`, outside `0`-to-`1`. `distance_to_segment`
   takes the `else` branch, compares `distance_to_start` against
   `distance_to_end`, finds `segment_end` closer, and returns
   `9.219544457292887` — the plain distance to `(3, 4)`, not to any point
   on the underlying line's own extension past it.

## What Breaks Without This

Concept Unit 2's `else` branch compares *both* endpoint distances,
deliberately — it never assumes which one will turn out closer. Prove
why, using a point on the *other* side of the segment, where
`segment_start` is actually the correct answer:

```python
import math


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def find_t_for_point(p, line_point, line_direction):
    offset = subtract_points(p, line_point)
    return dot_product(offset, line_direction) / dot_product(line_direction, line_direction)


segment_start = (0, 0)
segment_end = (3, 4)

p3 = (-5, -5)

direction = subtract_points(segment_end, segment_start)
t3 = find_t_for_point(p3, segment_start, direction)

correct_distance = norm(subtract_points(p3, segment_start))
distance_if_always_using_end = norm(subtract_points(p3, segment_end))

print(t3)
print(correct_distance)
print(distance_if_always_using_end)
```

```
-1.4
7.0710678118654755
12.041594578792296
```

Verified by actually running this. `p3 = (-5, -5)` projects to `t =
-1.4` — outside the segment's bounds, on the *opposite* side from
`p2`'s own `t = 2.8`. The genuinely closer endpoint here is
`segment_start`, at a real distance of `7.0710678118654755`. A version
of `distance_to_segment` that skipped the comparison and simply always
returned the distance to `segment_end` — a plausible mistake, since
Concept Unit 2's own worked example happened to have `segment_end` as
the right answer — would silently report `12.041594578792296` instead:
a real number, not a crash, just wrong by nearly `5` full units. This is
exactly why the `else` branch compares both distances explicitly every
time, rather than assuming the pattern from one worked example
generalizes to every case.

## Exercises

1. Using `distance_to_segment`, compute the distance from
   `p = (1.5, 2)` — the segment's own exact midpoint — to itself.
   Predict, then verify, that the result comes out to (nearly) `0`.
2. Build a horizontal segment, `segment_start = (0, 0)`,
   `segment_end = (10, 0)`, and compute `distance_to_segment` for three
   points: one whose projection falls inside the bounds, one past
   `segment_end`, and one before `segment_start`. Confirm all three match
   what you'd expect by reasoning about the segment visually.
3. Using this lesson's own `p2 = (10, 10)` and `segment_end = (3, 4)`,
   confirm that `distance_to_segment(p2, segment_start, segment_end)`
   exactly equals `norm(subtract_points(p2, segment_end))`, computed
   directly with no reference to `t` at all. Explain why these two
   different-looking computations are guaranteed to agree whenever `t`
   falls outside the segment's bounds on the `segment_end` side.

## Definition of Done

- [ ] `geometry_lesson_29.py` exists and runs with no errors via `python
      geometry_lesson_29.py`.
- [ ] Running it prints `3.0`, `0.8`, `2.8`, `3.0`, then
      `9.219544457292887` — matching this lesson's verified output
      exactly (Concept Unit 1's own single-line run, followed by Concept
      Unit 2's four).
- [ ] You can explain, without looking at the file, when
      `distance_to_segment` reuses Lesson 28's perpendicular projection
      and when it falls back to an endpoint distance instead.
- [ ] You can explain why both endpoint distances must be compared,
      rather than assuming which one is closer, using this lesson's own
      verified `p3` counter-example.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Extend distance-to-line with endpoint clamping for out-of-bounds projections"`,
      not `git commit -m "add distance_to_segment"`.

Next: Lesson 30 — Circles, the first genuinely new geometric shape
Section II builds beyond lines, segments, and rays — represented, like
every shape so far, as plain data this curriculum already knows how to
build from tuples and already-covered arithmetic.
