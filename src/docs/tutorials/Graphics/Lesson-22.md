# Lesson 22: Rays

**What you will build:** `is_t_on_ray`, a one-sided bounds check —
`t >= 0`, no upper limit — sitting right alongside Lesson 21's own
two-sided `is_t_on_segment`, on the exact same `point_on_line` formula.
Then `is_point_on_ray`, combining it with Lesson 18's `is_point_on_line`
the same way Lesson 21's `is_point_on_segment` did. The transferable
problem: Lesson 21 built exactly one kind of bounded line — bounded on
both ends. A **ray** is bounded on exactly one end and unbounded on the
other, the shape of a real sensor's line of sight, a probe's approach
direction, or a light ray — and everything needed to represent it was
already built in Lesson 21; only the bound itself changes.

**What you need to know first:** Lesson 21's `point_on_line`,
`find_t_for_point`, and `is_point_on_segment` (the shape this lesson's
own `is_point_on_ray` deliberately mirrors), and Lesson 18's
`is_point_on_line`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–21.

**Terms introduced in this lesson:**

- **Ray** — a straight geometric primitive with a definite starting point
  and direction, extending infinitely in that one direction only —
  bounded on exactly one end, unlike Lesson 21's line (bounded on
  neither) or segment (bounded on both). Why: a real sensor's line of
  sight, a laser, or a tool's straight-line approach path all have a
  known starting point but no meaningful "far endpoint" until something
  actually blocks them — a shape Lesson 21's own two primitives can't
  represent.

**Objects and methods used:**

None. `is_t_on_ray` and `is_point_on_ray` are hand-authored project code,
built from Lesson 18 and 21's own reused functions.

---

## Concept Unit: A Ray as a One-Sided Bound

### The Problem

Lesson 21's `is_t_on_segment` checks `0 <= t <= 1` — bounded on both
ends. A ray needs the opposite shape: bounded only at its starting point
(`t = 0`), with no upper limit at all, since a real line of sight extends
until something is actually there to stop it, not to some
predetermined distance decided in advance.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–21.
- **Files affected:** `geometry_lesson_22.py` — created, as a new file
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


def is_t_on_ray(t):
    return t >= 0


print(is_t_on_ray(0))
print(is_t_on_ray(2))
print(is_t_on_ray(-1))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `add_vector_to_point`, `scale_vector`, and
`point_on_line` are Lesson 2, 3, and 21's own functions, retyped
unchanged; `t >= 0` is already-basic comparison, the same category as
Lesson 21's own `0 <= t <= 1`. No new Python construct appears here, so
no isolated throwaway lab is needed.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def add_vector_to_point(...)`, `def scale_vector(...)`, `def
  point_on_line(...)` — Lesson 2, 3, and 21's own functions, retyped
  unchanged. No re-explanation owed, per the Repetition Rule.
- `def is_t_on_ray(t): ...` — first appearance: a bounds check shaped
  differently from Lesson 21's own.
- `return t >= 0` — already-basic comparison, checking only a lower
  bound. Unlike `0 <= t <= 1`, there is no upper limit chained onto this
  expression at all — the deliberate, entire difference between a ray and
  a segment.
- `print(is_t_on_ray(0))` — the ray's own starting point, `t = 0`,
  correctly included: `True`.
- `print(is_t_on_ray(2))` — a `t` value Lesson 21's own
  `is_t_on_segment(2)` already proved comes back `False`. Here, it's
  `True` — exactly the shape difference this lesson exists to build.
- `print(is_t_on_ray(-1))` — behind the ray's own starting point:
  `False`.

### CS Lens

A shape bounded on exactly one side, unbounded on the other, is common
enough on its own to be worth naming — not just a variant of a segment.

```
Also recognized in: ray tracing and ray casting (the single most literal
use of the term — a rendering ray starts at a camera or light source and
extends until it hits geometry, with no predetermined stopping distance),
robotics and sensor simulation (a lidar or ultrasonic sensor's detection
line is modeled exactly this way — a known origin, a known direction, and
a return distance that isn't known until something is actually detected),
and numeric ranges in programming generally (a half-open range like
Python's own `range(5)`, which starts at a known `0` but is bounded only
on one side by the count given, is the same one-sided-bound shape in a
completely different domain)
```

### SE Lens

The design principle is **changing only the bound, not the underlying
representation**, to model a genuinely different real-world shape. The
alternative not chosen: build a ray as its own, separate representation —
an origin and a direction stored differently from how a line or segment
stores them — rather than reusing `point_on_line` and swapping only the
bounds check.

That alternative might feel more "correct" for a shape with a
conceptually different identity. The real cost it pays: a genuinely
separate ray representation would need its own `point_on_ray`-equivalent
formula, re-derived and re-verified from scratch, duplicating exactly the
logic Lesson 21 already built and proved correct. Reusing the identical
parametric formula and only changing the bound means a ray's correctness
rides on `point_on_line`'s own already-established correctness for free.

### Commands Needed

`python geometry_lesson_22.py` — same interpreter and command as every
prior lesson.

### Run It

```
True
True
False
```

Verified by actually running the file above.

### Connection

`is_t_on_ray` correctly bounds a `t` value on one side only. The next
unit combines it with Lesson 18's collinearity check the same way Lesson
21 already combined `is_t_on_segment`.

---

## Concept Unit: Combining Both Checks — `is_point_on_ray`

### The Problem

A real point, the same as in Lesson 21, arrives as plain coordinates, not
an already-known `t`. Build the ray equivalent of Lesson 21's
`is_point_on_segment`: confirm a point is on the ray's underlying line,
then check whether its recovered `t` value actually falls within the
ray's own one-sided bound.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_22.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(is_t_on_ray(-1))` line added in
  Concept Unit 1.
- **Dependencies:** Concept Unit 1's `point_on_line`, `is_t_on_ray`.

### The New Code

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def is_point_on_line(p, a, b):
    return cross_product(subtract_points(b, a), subtract_points(p, a)) == 0


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def find_t_for_point(p, line_point, line_direction):
    offset = subtract_points(p, line_point)
    return dot_product(offset, line_direction) / dot_product(line_direction, line_direction)


def is_point_on_ray(p, ray_origin, ray_direction):
    second_point = point_on_line(ray_origin, ray_direction, 1)
    if is_point_on_line(p, ray_origin, second_point):
        t = find_t_for_point(p, ray_origin, ray_direction)
        return is_t_on_ray(t)
    else:
        return False


ray_origin = (0, 0)
ray_direction = (3, 4)

on_ray_point = point_on_line(ray_origin, ray_direction, 2)
behind_origin_point = point_on_line(ray_origin, ray_direction, -1)
off_line_point = (5, 5)

print(on_ray_point)
print(behind_origin_point)

print(is_point_on_ray(on_ray_point, ray_origin, ray_direction))
print(is_point_on_ray(behind_origin_point, ray_origin, ray_direction))
print(is_point_on_ray(off_line_point, ray_origin, ray_direction))
print(is_point_on_ray(ray_origin, ray_origin, ray_direction))
```

### The Updated Project

```python
def add_vector_to_point(point, vector):
    return (point[0] + vector[0], point[1] + vector[1])


def scale_vector(vector, factor):
    return (vector[0] * factor, vector[1] * factor)


def point_on_line(line_point, line_direction, t):
    return add_vector_to_point(line_point, scale_vector(line_direction, t))


def is_t_on_ray(t):
    return t >= 0


print(is_t_on_ray(0))
print(is_t_on_ray(2))
print(is_t_on_ray(-1))


def subtract_points(a, b):                                               # ← new
    return (a[0] - b[0], a[1] - b[1])                                   # ← new


def cross_product(a, b):                                                 # ← new
    return a[0] * b[1] - a[1] * b[0]                                    # ← new


def is_point_on_line(p, a, b):                                           # ← new
    return cross_product(subtract_points(b, a), subtract_points(p, a)) == 0  # ← new


def dot_product(a, b):                                                   # ← new
    return a[0] * b[0] + a[1] * b[1]                                    # ← new


def find_t_for_point(p, line_point, line_direction):                     # ← new
    offset = subtract_points(p, line_point)                              # ← new
    return dot_product(offset, line_direction) / dot_product(line_direction, line_direction)  # ← new


def is_point_on_ray(p, ray_origin, ray_direction):                       # ← new
    second_point = point_on_line(ray_origin, ray_direction, 1)           # ← new
    if is_point_on_line(p, ray_origin, second_point):                    # ← new
        t = find_t_for_point(p, ray_origin, ray_direction)               # ← new
        return is_t_on_ray(t)                                            # ← new
    else:                                                                # ← new
        return False                                                     # ← new


ray_origin = (0, 0)                                                      # ← new
ray_direction = (3, 4)                                                   # ← new

on_ray_point = point_on_line(ray_origin, ray_direction, 2)                # ← new
behind_origin_point = point_on_line(ray_origin, ray_direction, -1)        # ← new
off_line_point = (5, 5)                                                  # ← new

print(on_ray_point)                                                      # ← new
print(behind_origin_point)                                               # ← new

print(is_point_on_ray(on_ray_point, ray_origin, ray_direction))          # ← new
print(is_point_on_ray(behind_origin_point, ray_origin, ray_direction))   # ← new
print(is_point_on_ray(off_line_point, ray_origin, ray_direction))        # ← new
print(is_point_on_ray(ray_origin, ray_origin, ray_direction))            # ← new
```

The file now holds a complete ray primitive — bounds check and combined
point test — built entirely by reusing Lesson 18 and 21's own already-
verified functions.

*A note on method:* every function here is either retyped unchanged from
an earlier lesson, or, for `is_point_on_ray` itself, built from
already-covered function calls and `if`/`else`. No new Python construct
is introduced.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def subtract_points(...)`, `def cross_product(...)`, `def
  is_point_on_line(...)`, `def dot_product(...)`, `def
  find_t_for_point(...)` — Lesson 2, 8, 18, 7, and 21's own functions,
  retyped unchanged. No re-explanation owed, per the Repetition Rule.
- `def is_point_on_ray(p, ray_origin, ray_direction): ...` — first
  appearance: this lesson's own combined test, the same overall shape as
  Lesson 21's `is_point_on_segment`.
- `second_point = point_on_line(ray_origin, ray_direction, 1)` — first
  appearance of a genuinely new small idea: `is_point_on_line` needs
  *two* points to define a line, but a ray is normally described by an
  origin and a *direction*, not a second point. `point_on_line` itself
  (Lesson 21's own function) supplies that missing second point for
  free — any `t` value it hasn't already been asked to bound produces a
  perfectly good second point to define the same underlying line, and
  `t = 1` is simply the most convenient choice.
- `if is_point_on_line(p, ray_origin, second_point):` — Lesson 18's own
  predicate, reused unchanged, checked first — the identical "cheap
  check before expensive check" ordering Lesson 21's `is_point_on_segment`
  already established.
- `t = find_t_for_point(p, ray_origin, ray_direction)` — Lesson 21's own
  function, reused unchanged.
- `return is_t_on_ray(t)` — Concept Unit 1's own bounds check, used in
  place of Lesson 21's `is_t_on_segment` — the *only* line in this whole
  function that's actually different from `is_point_on_segment`.
- `else: return False` — already-basic reuse, identical to Lesson 21's
  own structure.
- `ray_origin = (0, 0)`, `ray_direction = (3, 4)` — the curriculum's own
  familiar direction, reused as this lesson's ray.
- `on_ray_point = point_on_line(ray_origin, ray_direction, 2)` — a point
  Lesson 21's own segment would have rejected (`t = 2` is outside
  `0`–`1`), deliberately chosen to prove this lesson's ray accepts it.
- `behind_origin_point = point_on_line(ray_origin, ray_direction, -1)` —
  a point behind the ray's own starting point.
- The remaining `print(...)` calls — already-basic, checking
  `is_point_on_ray` against four cases: a point past where a segment
  would have stopped (`True` — a ray has no far bound), a point behind the
  origin (`False`), a point off the line entirely (`False`), and the
  ray's own origin (`True` — `t = 0` is included, the one point every
  ray, segment, and line in this curriculum's whole toolkit all agree on).

### CS Lens

Building three related primitives — line, segment, ray — from one shared
formula, differing only in how each one bounds `t`, is a small but real
instance of a much larger idea: recognizing several concrete types as
special cases of one general parameterized family.

```
Also recognized in: interval arithmetic broadly (an unbounded interval,
a half-bounded interval, and a fully bounded interval are the same
underlying idea with different limits, in exactly the pattern this
lesson's line/ray/segment family follows), physics engines (a raycast
query, a segment-sweep query, and an infinite-line query in a physics
API are frequently implemented as the same underlying intersection
routine with the allowed `t` range simply passed in differently), and
signal processing (a causal filter, restricted to using only past and
present values, is a "ray-shaped" restriction on time, compared to a
non-causal filter that's allowed to look in both directions — a segment-
or line-shaped restriction, by the same analogy)
```

### SE Lens

The design principle is **parameterizing the bound itself**, rather than
writing three separate near-duplicate combined-check functions. The
alternative not chosen, made concrete: `is_point_on_ray` could have been
written completely independently of `is_point_on_segment`, with its own
copy of the collinearity-then-bounds-check structure, instead of the two
functions differing only in which bounds-check function they call.

That alternative would make each primitive's own code fully
self-contained, at the cost of two nearly identical function bodies that
would each need updating if the shared "check collinearity first" logic
ever needed to change. This lesson's actual structure — `is_t_on_segment`
and `is_t_on_ray` as small, swappable bounds checks, with the rest of the
logic identical — means that shared structure only exists, and only needs
maintaining, once.

### Commands Needed

`python geometry_lesson_22.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
True
True
False
(6, 8)
(-3, -4)
True
False
False
True
```

Verified by actually running the updated file above.

### Connection

`is_point_on_ray` correctly distinguishes a point ahead of the ray's
origin from one behind it, and correctly accepts points a segment would
have rejected. Connect the Pieces, below, traces the full comparison
across all three of Lesson 21 and 22's primitives.

---

## Connect the Pieces

One concrete point, traced through every primitive Lesson 21 and 22 both
built, to show exactly how the three differ:

1. `origin = (0, 0)`, `direction = (3, 4)` — the same origin and direction
   used as a line (Lesson 21), a segment (Lesson 21), and now a ray (this
   lesson).
2. `point_on_line(origin, direction, 2)` gives `(6, 8)` — a single point,
   generated by the one formula all three primitives share.
3. Tested against a **line** (Lesson 18's `is_point_on_line`): `True` — a
   line has no bound at all, so any `t` is accepted.
4. Tested against a **segment** (Lesson 21's `is_point_on_segment`):
   `False` — `t = 2` falls outside the segment's `0`-to-`1` bound.
5. Tested against a **ray** (this lesson's `is_point_on_ray`): `True` —
   `t = 2` falls within the ray's `t >= 0` bound, even though it falls
   outside the segment's tighter one.

## What Breaks Without This

`is_point_on_ray` and `is_point_on_segment` are identical except for one
line — which bounds-check function they call. Check what happens when
that one line is wrong: calling `is_point_on_ray` with Lesson 21's own
`is_t_on_segment` swapped in by mistake, instead of this lesson's
`is_t_on_ray`:

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


def is_point_on_line(p, a, b):
    return cross_product(subtract_points(b, a), subtract_points(p, a)) == 0


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def find_t_for_point(p, line_point, line_direction):
    offset = subtract_points(p, line_point)
    return dot_product(offset, line_direction) / dot_product(line_direction, line_direction)


def is_t_on_segment(t):
    return 0 <= t <= 1


def is_point_on_ray_using_segment_bounds(p, ray_origin, ray_direction):
    second_point = point_on_line(ray_origin, ray_direction, 1)
    if is_point_on_line(p, ray_origin, second_point):
        t = find_t_for_point(p, ray_origin, ray_direction)
        return is_t_on_segment(t)
    else:
        return False


ray_origin = (0, 0)
ray_direction = (3, 4)

on_ray_point = point_on_line(ray_origin, ray_direction, 2)

print(is_point_on_ray_using_segment_bounds(on_ray_point, ray_origin, ray_direction))
```

```
False
```

Verified by actually running this. `on_ray_point`, at `t = 2`, is
genuinely, correctly on the ray — Concept Unit 2 already proved
`is_point_on_ray` reports `True` for it. But with `is_t_on_segment`
swapped in for `is_t_on_ray`, this otherwise-identical function silently
reports `False` instead — no crash, no error, just a wrong answer,
because `is_t_on_segment`'s upper bound of `1` rejects a `t` value a ray
was never supposed to reject in the first place. This is exactly the
cost of this lesson's own SE Lens made concrete: the entire correctness
of `is_point_on_ray` depends on exactly one small, swappable piece —
which bounds-check function gets called — and mixing up which primitive
a bounds check belongs to is a real, silent failure mode, not a
hypothetical one.

## Exercises

1. Using `is_point_on_ray`, verify that a ray's own origin, tested with
   `t` recovered by `find_t_for_point`, always comes back exactly `0`,
   for any direction at all — not just this lesson's `(3, 4)`.
2. Build a second ray, `ray_origin = (0, 0)`, `ray_direction = (-3, -4)`
   — pointing the opposite way. Verify that `on_ray_point = (6, 8)` from
   this lesson (on the *first* ray) is correctly rejected by the second,
   opposite-pointing ray.
3. Predict, then verify: does `is_point_on_ray` report `True` or `False`
   for a point exactly at `ray_origin` itself, when `ray_direction` is
   `(0, 0)` — a zero vector? Explain what `find_t_for_point` actually
   computes in this case, and why this is a genuinely different failure
   from anything Lesson 21 had to consider.

## Definition of Done

- [ ] `geometry_lesson_22.py` exists and runs with no errors via `python
      geometry_lesson_22.py`.
- [ ] Running it prints `True`, `True`, `False`, `(6, 8)`, `(-3, -4)`,
      `True`, `False`, `False`, then `True` — matching this lesson's
      verified output exactly.
- [ ] You can explain, without looking at the file, the difference
      between how a line, a segment, and a ray each bound `t`, using this
      lesson's own Connect the Pieces trace.
- [ ] You can explain why `is_point_on_ray` and `is_point_on_segment`
      differ by exactly one line, using this lesson's own verified `What
      Breaks Without This` counter-example.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Add a one-sided ray primitive by swapping Lesson 21's segment bounds check"`,
      not `git commit -m "add ray functions"`.

Next: Lesson 23 — Parametric Geometry, which names the general pattern
this lesson and Lesson 21 have both been using without naming it — a
shape represented as a formula over a single parameter `t` — and extends
it beyond straight lines for the first time.
