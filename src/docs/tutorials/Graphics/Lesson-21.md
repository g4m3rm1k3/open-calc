# Lesson 21: Lines and Line Segments

**What you will build:** `point_on_line`, a function that generates any
point along an infinite line from a starting point, a direction, and a
single number `t` — reusing Lesson 2 and 3's own `add_vector_to_point`
and `scale_vector` with zero new arithmetic. Then the piece Lesson 18's
`is_point_on_line` never had: a genuine distinction between an infinite
line and a bounded segment, built by restricting `t` to the range `0` to
`1`, plus a way to recover `t` from an arbitrary point using Lesson 7's
`dot_product`. The transferable problem: every line this curriculum has
tested against so far (Lesson 18, Lesson 19) was secretly infinite —
`is_point_on_line` says `True` for a point miles past either endpoint, as
long as it's still on the line. Real fixture edges and cutting paths are
never infinite, and this lesson builds the tool that finally knows the
difference.

**What you need to know first:** Lesson 2's `add_vector_to_point` and
`subtract_points`, Lesson 3's `scale_vector`, Lesson 7's `dot_product`,
Lesson 18's `is_point_on_line`, and Lesson 19's `if`/`elif`/`else`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–20.

**Terms introduced in this lesson:**

- **Parametric line** — representing every point on an infinite line with
  one formula, `point + t * direction`, where `t` can be any real number.
  Why: Lesson 18's `is_point_on_line` could only check whether an
  already-known point sits on a line; it had no way to *generate* new
  points along it, which any real toolpath or edge-following operation
  needs.
- **Line segment** — the finite portion of a line lying between two
  specific endpoints, corresponding to a parametric line's `t` restricted
  to the range `0` to `1`. Why: every line Lesson 18 and 19 tested against
  was, without ever saying so, infinite in both directions — a real
  fixture edge or cutting path is not, and nothing before this lesson
  could tell the difference.
- **Projection parameter** — the specific `t` value that locates a given
  point along a parametric line, found by measuring how far the point's
  offset from the line's start extends along the line's own direction.
  Why: checking whether a point falls within a segment's bounds requires
  knowing its `t` value first, and a real point almost always arrives as
  plain coordinates, not as an already-known `t`.

**Objects and methods used:**

None. Every function in this lesson is hand-authored project code, built
from Lessons 2, 3, 7, and 18's own reused functions plus this lesson's
own new arrangements of them.

---

## Concept Unit: A Line as a Point and a Direction — the Parametric Form

### The Problem

Lesson 18's `is_point_on_line` can answer "is this specific point on the
line" — but it can't produce a new point that's guaranteed to be on the
line in the first place. A real toolpath needs to *walk along* a line,
generating a whole sequence of points, not just check ones it already
has.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–20.
- **Files affected:** `geometry_lesson_21.py` — created, as a new file
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
print(point_on_line(line_point, line_direction, -1))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `add_vector_to_point` and `scale_vector` are Lesson 2
and 3's own functions, retyped unchanged; combining them is already-basic
function composition. No new Python construct appears here, so no
isolated throwaway lab is needed; what's new is the mathematical idea
these familiar pieces are arranged to express, not any new syntax.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def add_vector_to_point(point, vector): ...`, `def scale_vector(vector,
  factor): ...` — Lesson 2 and 3's own functions, retyped unchanged. No
  re-explanation owed, per the Repetition Rule.
- `def point_on_line(line_point, line_direction, t): ...` — first
  appearance: a function built entirely from two already-trusted pieces,
  combined into a new idea.
- `return add_vector_to_point(line_point, scale_vector(line_direction,
  t))` — `scale_vector(line_direction, t)` stretches the direction vector
  by `t`; `add_vector_to_point` then walks that stretched vector from
  `line_point`. This is the **parametric line**: hand it any real number
  `t` at all, and it returns a genuine point on the line — `t = 0` returns
  the starting point exactly, and every other value of `t` slides further
  along, or behind, that same direction.
- `line_point = (0, 0)`, `line_direction = (3, 4)` — this lesson's own
  running line, using the curriculum's own familiar `(3, 4)` direction.
- `print(point_on_line(line_point, line_direction, 0))` — `t = 0` returns
  `line_point` itself, unmoved: `(0, 0)`.
- `print(point_on_line(line_point, line_direction, 1))` — `t = 1` returns
  `line_point` plus the *entire* direction vector, unscaled: `(3, 4)`.
- `print(point_on_line(line_point, line_direction, 2))` — `t = 2` walks
  twice as far: `(6, 8)`.
- `print(point_on_line(line_point, line_direction, -1))` — a *negative*
  `t` walks backward, past `line_point`, in the opposite direction:
  `(-3, -4)` — proof this line genuinely extends both ways, not just
  forward from where it starts.

### CS Lens

Representing an entire infinite set of points — every point on a line —
with one formula and one free parameter, rather than storing points
individually, is the core idea behind **parametric representation**, a
concept this curriculum names properly in Lesson 23 but already put to
real use here.

```
Also recognized in: animation curves (a keyframed motion path is a
parametric curve, walked by advancing a single parameter — often called
`t` in real animation software too — from `0` to `1` over time), CNC
toolpath generation (a straight-line G-code move is executed by the
machine controller stepping a parameter along exactly this formula,
many times per second, to interpolate intermediate positions), and font
rendering (the straight segments of a vector font's glyph outlines are
stored and walked this same way before being rasterized to pixels)
```

### SE Lens

The design principle is **representing an infinite set of possibilities
with a formula, instead of trying to enumerate them**. The alternative
not chosen: represent "the line" as some large, fixed collection of
individually computed points, spaced closely enough together to look
continuous.

That alternative would only ever cover the specific range and spacing
chosen in advance — asking for a point between two of the stored ones, or
one far outside the stored range, would need new work every time. The
real cost `point_on_line`'s approach pays instead: nothing is
precomputed, so this line, unlike a stored list of points, does not yet
know its own bounds — Concept Unit 1's own `t = 2` and `t = -1` calls
prove it will happily hand back a point arbitrarily far from where a real
cutting path might actually need to stop. The next unit fixes exactly
that.

### Commands Needed

`python geometry_lesson_21.py` — same interpreter and command as every
prior lesson.

### Run It

```
(0, 0)
(3, 4)
(6, 8)
(-3, -4)
```

Verified by actually running the file above.

### Connection

`point_on_line` can generate any point on an infinite line. The next unit
gives it the one thing it's still missing: a way to know where the line
should actually stop.

---

## Concept Unit: Segments Are Lines With Bounds

### The Problem

Concept Unit 1's own `t = 2` and `t = -1` calls both returned real points
on the line — but a real cutting path that's supposed to run from `t = 0`
to `t = 1` has no business visiting either one. Build a way to check
whether a given `t` value falls within a segment's actual bounds.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_21.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(point_on_line(line_point,
  line_direction, -1))` line added in Concept Unit 1.
- **Dependencies:** none beyond what Concept Unit 1 already established.

### The New Code

```python
def is_t_on_segment(t):
    return 0 <= t <= 1


print(is_t_on_segment(0))
print(is_t_on_segment(1))
print(is_t_on_segment(0.5))
print(is_t_on_segment(-0.5))
print(is_t_on_segment(1.5))
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
print(point_on_line(line_point, line_direction, -1))


def is_t_on_segment(t):                                                  # ← new
    return 0 <= t <= 1                                                   # ← new


print(is_t_on_segment(0))                                                # ← new
print(is_t_on_segment(1))                                                # ← new
print(is_t_on_segment(0.5))                                              # ← new
print(is_t_on_segment(-0.5))                                             # ← new
print(is_t_on_segment(1.5))                                              # ← new
```

The file now has both halves of a **line segment**: a way to generate a
point at any `t` (Concept Unit 1), and a way to check whether that `t`
actually belongs to the bounded portion of the line (this unit).

*A note on method:* `0 <= t <= 1` is a **chained comparison** — Python
evaluates it as "is `0` less than or equal to `t`, *and* is `t` less than
or equal to `1`," written as one continuous expression instead of two
separate ones joined by a keyword. This still produces a single `bool`,
the same as every other comparison this curriculum has used since Lesson
5; no new Python construct beyond ordinary comparison is introduced, so
no isolated throwaway lab is needed.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def is_t_on_segment(t): ...` — first appearance: a function whose
  entire job is checking a number against fixed bounds.
- `return 0 <= t <= 1` — a chained comparison, already-basic given
  Lesson 5's own established use of comparison operators, just written
  with two comparisons back to back instead of one. Returns `True` only
  when `t` falls between `0` and `1`, inclusive on both ends.
- `print(is_t_on_segment(0))`, `print(is_t_on_segment(1))` — the
  segment's own two endpoints, `t = 0` and `t = 1`, both correctly
  included: `True`, `True`.
- `print(is_t_on_segment(0.5))` — a point genuinely between the
  endpoints: `True`.
- `print(is_t_on_segment(-0.5))`, `print(is_t_on_segment(1.5))` — the
  same two values that made Concept Unit 1's line extend past where a
  real segment should stop, both correctly excluded: `False`, `False`.

### CS Lens

Restricting a general-purpose formula to a bounded range, rather than
building a whole separate representation for the bounded case, recurs
constantly once a parametric shape needs real-world edges.

```
Also recognized in: clamped animation (game engines and animation tools
clamp a normalized time parameter to `0`–`1` for exactly this reason — a
character's walk cycle shouldn't be evaluated at a time before it starts
or after it ends), audio and video playback (a scrub bar's position is a
parameter bounded to the clip's actual duration, the same `0`-to-`1`
range this lesson uses), and G-code motion blocks (a linear move command
has explicit start and end coordinates precisely because the machine must
never be allowed to keep moving along the underlying infinite line past
the programmed endpoint)
```

### SE Lens

The design principle is **separating the general formula from its
specific bounds**, rather than folding the bounds directly into
`point_on_line` itself. The alternative not chosen: make `point_on_line`
itself refuse to return a point when `t` falls outside `0` to `1`, so an
out-of-bounds call fails immediately instead of silently succeeding.

That alternative would prevent Concept Unit 1's own `t = 2` and `t = -1`
calls from ever returning a value at all. The real cost it pays: an
infinite line is a genuinely useful, valid thing on its own — Lesson 18's
whole `is_point_on_line` deliberately tested against one — and baking
segment bounds into `point_on_line` itself would make it unable to
represent that case anymore. Keeping the two functions separate means
either one can be used alone: the unbounded formula when a line really is
infinite, the bounds check layered on top only when a real segment is
what's actually needed.

### Commands Needed

`python geometry_lesson_21.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
(0, 0)
(3, 4)
(6, 8)
(-3, -4)
True
True
True
False
False
```

Verified by actually running the updated file above.

### Connection

`is_t_on_segment` can check a `t` value once it's already known. The next
unit shows exactly why that distinction — on the line, but not on the
segment — is something Lesson 18's own tool could never have caught.

---

## Concept Unit: On the Line but Not on the Segment

### The Problem

Lesson 18's `is_point_on_line` was never wrong — it always correctly
answered whether a point sits on an *infinite* line. But nothing before
this lesson could tell a real, physical cutting path's endpoint apart
from a point one mile further down the same line. Prove the gap directly,
using both this lesson's own segment and Lesson 18's own predicate,
side by side.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_21.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(is_t_on_segment(1.5))` line
  added in Concept Unit 2.
- **Dependencies:** Concept Unit 1's `point_on_line`, Concept Unit 2's
  `is_t_on_segment`.

### The New Code

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def is_point_on_line(p, a, b):
    return cross_product(subtract_points(b, a), subtract_points(p, a)) == 0


segment_start = (0, 0)
segment_end = (3, 4)
segment_direction = subtract_points(segment_end, segment_start)

beyond_segment_point = point_on_line(segment_start, segment_direction, 2)

print(segment_direction)
print(beyond_segment_point)
print(is_point_on_line(beyond_segment_point, segment_start, segment_end))
print(is_t_on_segment(2))
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
print(point_on_line(line_point, line_direction, -1))


def is_t_on_segment(t):
    return 0 <= t <= 1


print(is_t_on_segment(0))
print(is_t_on_segment(1))
print(is_t_on_segment(0.5))
print(is_t_on_segment(-0.5))
print(is_t_on_segment(1.5))


def subtract_points(a, b):                                               # ← new
    return (a[0] - b[0], a[1] - b[1])                                   # ← new


def cross_product(a, b):                                                 # ← new
    return a[0] * b[1] - a[1] * b[0]                                    # ← new


def is_point_on_line(p, a, b):                                           # ← new
    return cross_product(subtract_points(b, a), subtract_points(p, a)) == 0  # ← new


segment_start = (0, 0)                                                   # ← new
segment_end = (3, 4)                                                     # ← new
segment_direction = subtract_points(segment_end, segment_start)          # ← new

beyond_segment_point = point_on_line(segment_start, segment_direction, 2)  # ← new

print(segment_direction)                                                 # ← new
print(beyond_segment_point)                                              # ← new
print(is_point_on_line(beyond_segment_point, segment_start, segment_end))  # ← new
print(is_t_on_segment(2))                                                # ← new
```

The file now runs the exact same point through both Lesson 18's predicate
and this lesson's own bounds check, and gets two different, both-correct
answers.

*A note on method:* `subtract_points`, `cross_product`, and
`is_point_on_line` are Lesson 2, 8, and 18's own functions, retyped
unchanged. No new Python construct is introduced anywhere in this unit.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def subtract_points(a, b): ...`, `def cross_product(a, b): ...`, `def
  is_point_on_line(p, a, b): ...` — Lesson 2, 8, and 18's own functions,
  retyped unchanged. No re-explanation owed, per the Repetition Rule.
- `segment_start = (0, 0)`, `segment_end = (3, 4)` — this lesson's real
  segment, using the same two points Concept Unit 1's `line_point` and
  `t = 1` result already established.
- `segment_direction = subtract_points(segment_end, segment_start)` —
  first appearance of building a parametric line's direction *from* two
  endpoints, rather than being handed one directly the way Concept Unit
  1 was — `(3, 4)`, matching `line_direction` exactly, since these are
  the same two points.
- `beyond_segment_point = point_on_line(segment_start, segment_direction,
  2)` — Concept Unit 1's own function, reused, deliberately called with
  `t = 2` — a point genuinely past `segment_end`.
- `print(segment_direction)`, `print(beyond_segment_point)` —
  already-basic; `beyond_segment_point` prints `(6, 8)`.
- `print(is_point_on_line(beyond_segment_point, segment_start,
  segment_end))` — Lesson 18's own predicate, tested against a point
  that is genuinely, mathematically on the infinite line through
  `segment_start` and `segment_end`. Prints `True` — correctly, by
  Lesson 18's own definition, which never claimed to know about
  endpoints at all.
- `print(is_t_on_segment(2))` — this lesson's own bounds check, on the
  `t` value that produced the exact same point. Prints `False` —
  correctly excluding it from the *segment*, a question Lesson 18's tool
  was never built to answer.

**The gap, made concrete.** `is_point_on_line` and `is_t_on_segment`
disagree on `beyond_segment_point` — and both are right, because they're
answering two genuinely different questions. Lesson 18 never claimed
`is_point_on_line` respected endpoints; this unit is the first place that
distinction actually mattered enough to build code around.

### CS Lens

Two functions disagreeing on the same input, because they're answering
two related but distinct questions, is worth recognizing on its own — a
reminder that a correct answer is only correct *relative to the specific
question actually asked*.

```
Also recognized in: geographic systems (a point can be "on" a road's
infinite bearing line while being nowhere near the actual paved road
segment — routing software has to check both), collision detection (a
ray can intersect the infinite plane a wall lies in while missing the
wall's actual finite boundary entirely — physics engines run exactly this
two-part check), and database range queries ("is this value on the
sorted axis" and "is this value within the requested page's bounds" are
different, both legitimate questions over the same ordering)
```

### SE Lens

The design principle is **composing two narrow, independently correct
functions instead of writing one function that tries to answer the
combined question directly**. The alternative not chosen: write a single
`is_point_on_segment`-shaped function from scratch, without reusing
Lesson 18's `is_point_on_line` at all.

That alternative is explored directly in the next unit — but the
groundwork this unit lays first, keeping the infinite-line check and the
bounds check as two separate, already-verified pieces, is what makes that
combination trustworthy rather than a fresh source of bugs. Each piece
was already proven correct on its own terms before being asked to work
together.

### Commands Needed

`python geometry_lesson_21.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
(0, 0)
(3, 4)
(6, 8)
(-3, -4)
True
True
True
False
False
(3, 4)
(6, 8)
True
False
```

Verified by actually running the updated file above.

### Connection

`is_point_on_line` and `is_t_on_segment` each answer their own question
correctly. The final unit combines them into one function that answers
the question a real CAD/CAM system actually needs: is this point on the
segment.

---

## Concept Unit: Combining Both Checks — `is_point_on_segment`

### The Problem

A real point almost never arrives with its `t` value already known —
it arrives as plain coordinates. Before `is_t_on_segment` can be useful
on a real point, `t` has to be recovered from that point first.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_21.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(is_t_on_segment(2))` line added
  in Concept Unit 3.
- **Dependencies:** Concept Unit 1's `point_on_line`, Concept Unit 2's
  `is_t_on_segment`, Concept Unit 3's `is_point_on_line`,
  `segment_start`, `segment_end`, `segment_direction`,
  `beyond_segment_point`.

### The New Code

```python
def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def find_t_for_point(p, line_point, line_direction):
    offset = subtract_points(p, line_point)
    return dot_product(offset, line_direction) / dot_product(line_direction, line_direction)


def is_point_on_segment(p, segment_start, segment_end, segment_direction):
    if is_point_on_line(p, segment_start, segment_end):
        t = find_t_for_point(p, segment_start, segment_direction)
        return is_t_on_segment(t)
    else:
        return False


on_segment_point = point_on_line(segment_start, segment_direction, 0.5)
off_line_point = (5, 5)

print(on_segment_point)
print(find_t_for_point(on_segment_point, segment_start, segment_direction))
print(is_point_on_segment(on_segment_point, segment_start, segment_end, segment_direction))

print(find_t_for_point(beyond_segment_point, segment_start, segment_direction))
print(is_point_on_segment(beyond_segment_point, segment_start, segment_end, segment_direction))

print(is_point_on_segment(off_line_point, segment_start, segment_end, segment_direction))
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
print(point_on_line(line_point, line_direction, -1))


def is_t_on_segment(t):
    return 0 <= t <= 1


print(is_t_on_segment(0))
print(is_t_on_segment(1))
print(is_t_on_segment(0.5))
print(is_t_on_segment(-0.5))
print(is_t_on_segment(1.5))


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def is_point_on_line(p, a, b):
    return cross_product(subtract_points(b, a), subtract_points(p, a)) == 0


segment_start = (0, 0)
segment_end = (3, 4)
segment_direction = subtract_points(segment_end, segment_start)

beyond_segment_point = point_on_line(segment_start, segment_direction, 2)

print(segment_direction)
print(beyond_segment_point)
print(is_point_on_line(beyond_segment_point, segment_start, segment_end))
print(is_t_on_segment(2))


def dot_product(a, b):                                                   # ← new
    return a[0] * b[0] + a[1] * b[1]                                    # ← new


def find_t_for_point(p, line_point, line_direction):                     # ← new
    offset = subtract_points(p, line_point)                              # ← new
    return dot_product(offset, line_direction) / dot_product(line_direction, line_direction)  # ← new


def is_point_on_segment(p, segment_start, segment_end, segment_direction):  # ← new
    if is_point_on_line(p, segment_start, segment_end):                  # ← new
        t = find_t_for_point(p, segment_start, segment_direction)        # ← new
        return is_t_on_segment(t)                                        # ← new
    else:                                                                # ← new
        return False                                                     # ← new


on_segment_point = point_on_line(segment_start, segment_direction, 0.5)  # ← new
off_line_point = (5, 5)                                                  # ← new

print(on_segment_point)                                                  # ← new
print(find_t_for_point(on_segment_point, segment_start, segment_direction))  # ← new
print(is_point_on_segment(on_segment_point, segment_start, segment_end, segment_direction))  # ← new

print(find_t_for_point(beyond_segment_point, segment_start, segment_direction))  # ← new
print(is_point_on_segment(beyond_segment_point, segment_start, segment_end, segment_direction))  # ← new

print(is_point_on_segment(off_line_point, segment_start, segment_end, segment_direction))  # ← new
```

The file now has the complete tool this lesson set out to build: a
single function that correctly answers "is this point on this segment"
for any point at all.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def dot_product(a, b): ...` — Lesson 7's own function, retyped
  unchanged. No re-explanation owed, per the Repetition Rule.
- `def find_t_for_point(p, line_point, line_direction): ...` — first
  appearance: recovering `t` from a plain point.
- `offset = subtract_points(p, line_point)` — already-basic reuse: the
  vector from the line's start out to `p`.
- `return dot_product(offset, line_direction) / dot_product(line_direction,
  line_direction)` — the **projection parameter**: `dot_product(offset,
  line_direction)` measures how much of `offset` points along the line's
  own direction (Lesson 7's own alignment-measuring idea); dividing by
  `dot_product(line_direction, line_direction)` — the direction's own
  squared length — rescales that measurement into exactly the same units
  `t` already uses, so that `t = 0` still means `line_point` and `t = 1`
  still means one full `line_direction` away, matching Concept Unit 1's
  own formula exactly, just run in reverse.
- `def is_point_on_segment(p, segment_start, segment_end,
  segment_direction): ...` — first appearance: the function this whole
  lesson has been building toward.
- `if is_point_on_line(p, segment_start, segment_end):` — Lesson 18's own
  predicate, reused unchanged, checked *first*: there's no reason to
  compute a `t` value at all for a point that isn't even on the line.
- `t = find_t_for_point(p, segment_start, segment_direction)` — only
  reached once collinearity is already confirmed.
- `return is_t_on_segment(t)` — Concept Unit 2's own bounds check,
  applied to the freshly recovered `t`.
- `else: return False` — a point that fails the collinearity check can
  never be on the segment either, regardless of any `t` value; no reason
  to compute one.
- `on_segment_point = point_on_line(segment_start, segment_direction,
  0.5)` — a point genuinely inside the segment's bounds, built the same
  way Concept Unit 3 built `beyond_segment_point`.
- The remaining `print(...)` calls — already-basic, checking
  `is_point_on_segment` against three different cases: a point genuinely
  on the segment (`True`), the same `beyond_segment_point` from Concept
  Unit 3 (`False` — on the line, but outside the bounds), and a point
  that isn't even on the line at all (`False`, caught by the very first
  `if` before `find_t_for_point` ever runs).

### CS Lens

Checking a cheap, narrow condition first, and only doing more expensive
work once it passes, is a form of **short-circuiting** worth recognizing
beyond this one function.

```
Also recognized in: database query planners (a query with multiple
`WHERE` conditions typically evaluates the cheapest or most selective
condition first, to avoid doing expensive work — like a table scan — on
rows that would be rejected anyway), collision detection (broad-phase
checks, like a cheap bounding-box test, run before expensive narrow-phase
geometry tests, for exactly the same reason `is_point_on_line` runs
before the costlier `find_t_for_point`), and boolean logic in every
mainstream language (Python's own `and`/`or` operators stop evaluating
as soon as the overall result is already determined, the same principle
this function's `if`/`else` structure applies by hand)
```

### SE Lens

The design principle is **composing two already-independently-correct
functions into a third, more capable one**, rather than deriving a new
combined formula from scratch. The alternative not chosen: write
`is_point_on_segment` as one self-contained calculation — solving
directly for whether a point lies within a bounded strip — without
calling `is_point_on_line` or `is_t_on_segment` at all.

That alternative might avoid one redundant `subtract_points` call
buried inside both `is_point_on_line` and `find_t_for_point`. The real
cost it pays: a fresh, self-contained formula would need its own
correctness proof from scratch, duplicating logic this lesson already
built and verified independently, twice. Composing the two existing,
already-trusted functions means `is_point_on_segment`'s correctness
follows directly from theirs — exactly the same reuse argument Lesson 13
first made about `transform_to_global`.

### Commands Needed

`python geometry_lesson_21.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
(0, 0)
(3, 4)
(6, 8)
(-3, -4)
True
True
True
False
False
(3, 4)
(6, 8)
True
False
(1.5, 2.0)
0.5
True
2.0
False
False
```

Verified by actually running the updated file above.

### Connection

`is_point_on_segment` correctly distinguishes a point on the segment, a
point on the line but past its endpoint, and a point off the line
entirely. Connect the Pieces, below, traces all three cases start to
finish.

---

## Connect the Pieces

One concrete segment, traced through everything this lesson built, start
to finish:

1. `segment_start = (0, 0)`, `segment_end = (3, 4)`, and
   `segment_direction = subtract_points(segment_end, segment_start) =
   (3, 4)` define this lesson's running segment.
2. `point_on_line(segment_start, segment_direction, t)` generates any
   point on the *infinite* line through this segment, for any `t` —
   `t = 0.5` gives `(1.5, 2.0)`, genuinely between the endpoints; `t = 2`
   gives `(6, 8)`, genuinely past `segment_end`.
3. `find_t_for_point` runs that formula in reverse: handed `(1.5, 2.0)`
   back, it recovers `t = 0.5` exactly; handed `(6, 8)`, it recovers
   `t = 2.0` exactly.
4. `is_point_on_segment` combines Lesson 18's `is_point_on_line` with
   this lesson's own `is_t_on_segment`: `(1.5, 2.0)` is `True` (on the
   line, and `t` within bounds); `(6, 8)` is `False` (on the line, but
   `t` outside bounds); `(5, 5)` is `False` (not on the line at all,
   `t` never even computed).

## What Breaks Without This

`is_point_on_segment` checks `is_point_on_line` *before* computing `t`,
on purpose — the same "check the cheap condition first" principle this
lesson's own CS Lens already named. Check what happens if
`find_t_for_point` is called on a point that isn't on the line at all,
skipping that check:

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def find_t_for_point(p, line_point, line_direction):
    offset = subtract_points(p, line_point)
    return dot_product(offset, line_direction) / dot_product(line_direction, line_direction)


def is_t_on_segment(t):
    return 0 <= t <= 1


segment_start = (0, 0)
segment_direction = (3, 4)

off_line_point = (5, 5)

t = find_t_for_point(off_line_point, segment_start, segment_direction)
print(t)
print(is_t_on_segment(t))
```

```
0.92
False
```

Verified by actually running this. `find_t_for_point`, given a point
that isn't on the line at all, doesn't crash and doesn't raise any
error — it silently returns `0.92`, a real-looking number, and
`is_t_on_segment(0.92)` reports `True`-shaped bounds-checking logic that
would have said `True` if this snippet had gone one line further. The
`0.92` is not meaningless — it's the `t` value of `off_line_point`'s
*projection* onto the line, the closest point on the infinite line to
`(5, 5)`, not `(5, 5)` itself. Nothing about `find_t_for_point`'s own
math can tell the difference between "this point is on the line" and
"this point is *near* the line" — that distinction is entirely
`is_point_on_line`'s job, which is exactly why
`is_point_on_segment` checks it first, and exactly why skipping that
check would silently accept points that were never on the segment, or
even the line, at all.

## Exercises

1. Using `find_t_for_point`, compute the `t` value for
   `segment_start` and `segment_end` themselves. Confirm they come out to
   exactly `0` and `1`, and explain why that has to be true given
   `point_on_line`'s own formula.
2. Build a second segment using `segment_start = (0, 0)` and
   `segment_end = (0, 5)` — a vertical segment. Verify `is_point_on_segment`
   correctly handles a point exactly on this segment, a point beyond
   `segment_end`, and a point off the line, the same way this lesson did
   for the `(3, 4)`-direction segment.
3. Using this lesson's own `off_line_point = (5, 5)` and
   `segment_direction = (3, 4)`, compute the actual closest point on the
   infinite line to `(5, 5)` using `point_on_line(segment_start,
   segment_direction, 0.92)`, and compare it visually (by eye, using the
   coordinates) to `(5, 5)` itself. Lesson 28, Distance to a Line, returns
   to this exact idea.

## Definition of Done

- [ ] `geometry_lesson_21.py` exists and runs with no errors via `python
      geometry_lesson_21.py`.
- [ ] Running it prints the full 20-line sequence shown in Concept Unit
      4's Run It, ending in `(1.5, 2.0)`, `0.5`, `True`, `2.0`, `False`,
      `False` — matching this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, the difference
      between what `is_point_on_line` and `is_point_on_segment` each
      answer, using this lesson's own `beyond_segment_point` example.
- [ ] You can explain what `find_t_for_point` actually computes for a
      point that isn't on the line, using this lesson's own verified
      `0.92` result.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Add parametric lines and a real segment-bounds check on top of Lesson 18's infinite-line test"`,
      not `git commit -m "add line segment functions"`.

Next: Lesson 22 — Rays, which builds a third linear primitive alongside
this lesson's line and segment — bounded on exactly one end instead of
zero or two — reusing `point_on_line` again with a one-sided version of
this lesson's own `is_t_on_segment`.
