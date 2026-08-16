# Lesson 33: Polygons

**What you will build:** A polygon, represented as a `list` of vertices,
plus `get_edge`, which returns any edge of the polygon by index —
including the one this lesson exists to get right: the edge connecting
the *last* vertex back to the *first*, closing the shape. That wraparound
needs two real built-in tools this curriculum hasn't used before, `len`
and `range`, combined with a new operator, modulo (`%`). Then
`polygon_perimeter`, summing every edge's length by looping and
accumulating a running total — a different loop shape than Lesson 27's
own early-exit search. The transferable problem: every shape since
Lesson 21 had a fixed, small, known-in-advance number of defining points.
A polygon's vertex count is never known in advance, and — unlike a line
or a triangle — its very last vertex has to connect back to its first to
close the shape at all, a genuinely new kind of "next" that ordinary
indexing doesn't provide.

**What you need to know first:** Lesson 27's own `for` loop and `list`
indexing, Lesson 2's `subtract_points`, and Lesson 9's `norm`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–32, except that `len`, `range`, and the modulo operator (`%`) —
real Python tools never yet used in this curriculum — receive full
first-appearance treatment in this lesson's second Concept Unit.

**Terms introduced in this lesson:**

- **Polygon** — a closed shape defined by a sequence of vertices
  connected in order, with the *last* vertex connecting back to the
  *first* to close the boundary. Why: a real CAD/CAM part profile or
  pocket outline is exactly this shape, and nothing built since Lesson 21
  could represent one with more than a small, fixed, hand-counted number
  of corners.
- **Modulo (`%`)** — an operator that returns the *remainder* after
  division, rather than the quotient. Why: this lesson uses it for one
  specific purpose — making an index wrap back around to `0` the moment
  it reaches the end of the vertex list, exactly the behavior closing a
  polygon's boundary requires.

**Objects and methods used:**

- **`len`**
  - *What it is:* a built-in function reporting how many elements a
    sequence (a `list`, `tuple`, or `str`) contains.
  - *Implementation:* called as `len(sequence)`, returning an `int`.
  - *Its use:* this lesson needs a polygon's own vertex count, to know
    exactly where the wraparound back to the first vertex should happen.
- **`range`**
  - *What it is:* a built-in function producing a sequence of consecutive
    integers for a `for` loop to step through.
  - *Implementation:* called as `range(n)`, producing the integers `0`
    up to, but not including, `n`.
  - *Its use:* this lesson needs to loop by *position*, not by vertex
    value — each step needs to know both the current index and the next
    one, which requires the index itself, not just the vertex sitting at
    it.

---

## Concept Unit: Representing a Polygon — a List of Vertices

### The Problem

Every shape since Lesson 21 has taken a small, fixed number of points as
separate named arguments — two for a line, three for a triangle. A
polygon's corner count varies by shape and is never known in advance;
representing one needs a single value that can hold any number of
vertices, in order.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–32.
- **Files affected:** `geometry_lesson_33.py` — created, as a new file
  for this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]

print(polygon)
print(polygon[0])
print(polygon[1])
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `list` literals and indexing were already used in
Lesson 27's own `are_points_collinear` — no new Python construct appears
here, so no isolated throwaway lab is needed; what's new is using a
`list` to represent an entire closed shape, not just a batch of points to
check.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]` — first appearance of this
  lesson's own **polygon**: a `list` of four points, forming a
  3-by-4-unit rectangle, listed counter-clockwise starting from the
  origin. Already-basic `list` construction, per the Repetition Rule.
- `print(polygon)`, `print(polygon[0])`, `print(polygon[1])` —
  already-basic `list` printing and indexing, identical to Lesson 27's
  own usage.

### CS Lens

Representing a variable-length sequence of related values as a single
ordered collection, rather than as separately named values, is the
foundation every polygon, path, and mesh representation in real graphics
and CAD software is built on.

```
Also recognized in: every vector graphics format (an SVG `<polygon>`
element's `points` attribute is exactly this — a variable-length ordered
list of coordinate pairs), CAD file formats (a DXF polyline entity stores
its vertices as a list for the identical reason), and mesh data
structures in 3D graphics (a mesh's vertex buffer is fundamentally a
`list` of points, the same representation this lesson uses, just usually
much longer and in three dimensions instead of two)
```

### SE Lens

The design principle is **choosing a representation whose size isn't
fixed in the code**, rather than one that has to be rewritten for every
different vertex count. The alternative not chosen: keep this
curriculum's established pattern of individually named points —
`vertex1`, `vertex2`, `vertex3`, `vertex4` — the way Lesson 20's own
three-corner pocket was written.

That alternative worked fine for a fixed, small, known shape. The real
cost it pays: a function built around four individually named vertices
can only ever work on four-vertex shapes — a pentagon, or a hundred-sided
part profile, would need an entirely different function, hand-written for
that exact count. A `list`-based polygon, and the functions this lesson
builds around it, work identically regardless of how many vertices it
actually holds.

### Commands Needed

`python geometry_lesson_33.py` — same interpreter and command as every
prior lesson.

### Run It

```
[(0, 0), (4, 0), (4, 3), (0, 3)]
(0, 0)
(4, 0)
```

Verified by actually running the file above.

### Connection

A polygon's vertices are stored, in order. The next unit builds the one
thing this representation doesn't hand over for free: a way to walk its
*edges*, including the one that closes the shape.

---

## Concept Unit: Connecting the Last Vertex Back to the First — Wraparound Indexing

### The Problem

An edge connects one vertex to the *next* one. For every vertex except
the last, "next" just means the following index — but the polygon's very
last vertex has to connect back to `polygon[0]` to actually close the
shape, and no plain indexing expression this curriculum has used so far
produces that wraparound on its own.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_33.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(polygon[1])` line added in
  Concept Unit 1.
- **Dependencies:** Concept Unit 1's `polygon`.

### The New Code

```python
def get_edge(polygon, i):
    start = polygon[i]
    end = polygon[(i + 1) % len(polygon)]
    return (start, end)


print(get_edge(polygon, 0))
print(get_edge(polygon, 1))
print(get_edge(polygon, 2))
print(get_edge(polygon, 3))
```

### The Updated Project

```python
polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]

print(polygon)
print(polygon[0])
print(polygon[1])


def get_edge(polygon, i):                                                # ← new
    start = polygon[i]                                                  # ← new
    end = polygon[(i + 1) % len(polygon)]                               # ← new
    return (start, end)                                                 # ← new


print(get_edge(polygon, 0))                                              # ← new
print(get_edge(polygon, 1))                                              # ← new
print(get_edge(polygon, 2))                                              # ← new
print(get_edge(polygon, 3))                                              # ← new
```

The file now has a way to retrieve any of the polygon's four edges by
index, including the one connecting back to the start.

### Isolated Concept: `len`, `range`, and Wraparound With `%`

This is exactly what `get_edge`'s own `(i + 1) % len(polygon)` above is
doing, isolated down to a small four-item list instead of a real polygon:

```python
sample_list = ["a", "b", "c", "d"]

print(len(sample_list))

for i in range(len(sample_list)):
    next_i = (i + 1) % len(sample_list)
    print(i, sample_list[i], next_i, sample_list[next_i])
```

Run:

```
4
0 a 1 b
1 b 2 c
2 c 3 d
3 d 0 a
```

`len(sample_list)` proves `len` reports the item count, `4`, correctly.
`for i in range(len(sample_list))` proves `range(4)` steps `i` through
`0`, `1`, `2`, `3` — one value per position in the list, not per value in
it. The last line of output is the one that matters most: at `i = 3`,
`next_i` comes out to `0`, not `4` — `(3 + 1) % 4` is `4 % 4`, and `%`
(the **modulo operator**) returns the *remainder* after division, which
for `4 divided by 4` is exactly `0`. This is called **wraparound
indexing**, and it's exactly what lets `get_edge` connect the polygon's
last vertex back to its first without a special case.

### Discard

`sample_list` and its own loop above are now discarded — they exist only
to prove `len`, `range`, and `%` combine to produce wraparound, and will
not appear in the project again. `get_edge`'s own `(i + 1) %
len(polygon)`, shown in the real code above, works by the identical
rule.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def get_edge(polygon, i): ...` — first appearance: a function
  returning one specific edge, by its starting vertex's index.
- `start = polygon[i]` — already-basic indexing: the edge's own starting
  vertex.
- `end = polygon[(i + 1) % len(polygon)]` — `len(polygon)` (first
  appearance in real project code) reports the polygon's vertex count,
  `4`; `(i + 1) % len(polygon)` (first appearance of `%`) computes the
  *next* index, wrapping back to `0` once `i + 1` would otherwise run off
  the end of the list; `polygon[...]` then reaches the actual vertex at
  that wrapped index — the edge's own ending vertex.
- `return (start, end)` — already-basic tuple construction, bundling the
  edge's two endpoints together, the same `(start, end)` shape every
  segment function since Lesson 21 has already used.
- `print(get_edge(polygon, 0))` through `print(get_edge(polygon, 3))` —
  already-basic reuse, one call per edge. The first three print
  `((0, 0), (4, 0))`, `((4, 0), (4, 3))`, and `((4, 3), (0, 3))` — each
  vertex connected to the next one in the list. The fourth,
  `get_edge(polygon, 3)`, prints `((0, 3), (0, 0))` — the wraparound edge,
  connecting the polygon's last vertex back to its very first.

### CS Lens

Using the remainder operator to make an index "wrap around" a fixed-size
sequence is a small technique with a large footprint, wherever data is
naturally circular rather than linear.

```
Also recognized in: circular buffers (a fixed-size queue used in audio
processing and networking wraps its write position back to the start
using this exact `%` trick, rather than shifting every element when it
reaches the end), clock and calendar arithmetic (computing "3 hours after
11 PM" wraps back to a new day using `%` against `24`, the identical
mechanism as wrapping back to vertex `0`), and hash tables (mapping a
key's hash value into a fixed-size bucket array uses `hash % table_size`
to keep every computed index within the array's real bounds)
```

### SE Lens

The design principle is **expressing "the next one, wrapping around" as
one small arithmetic expression**, rather than special-casing the last
vertex separately. The alternative not chosen: write `get_edge` with an
explicit `if`/`else` — a normal case for every vertex except the last,
and a separate branch that manually returns `polygon[0]` when `i` equals
the last valid index.

That alternative would work, and would even avoid introducing `%` at
all. The real cost it pays: it treats the wraparound as an exception to
handle, rather than as the polygon's own normal, defining structure — a
polygon's whole *point* is that it closes, so every edge, including the
last one, should be computed by one uniform rule. `%` expresses that
uniformity directly; a special-cased `if` would hide it behind an
extra branch that only exists because ordinary indexing doesn't already
wrap.

### Commands Needed

`python geometry_lesson_33.py` — same command as Concept Unit 1. Nothing
new here. The isolated `sample_list` lab above was run separately, never
added to `geometry_lesson_33.py`.

### Run It

```
[(0, 0), (4, 0), (4, 3), (0, 3)]
(0, 0)
(4, 0)
((0, 0), (4, 0))
((4, 0), (4, 3))
((4, 3), (0, 3))
((0, 3), (0, 0))
```

Verified by actually running the file above.

### Connection

Every edge of the polygon, including the one that closes it, can now be
retrieved by index. The next unit uses that to compute a real property of
the whole shape.

---

## Concept Unit: Perimeter — Summing Every Edge's Length

### The Problem

Lesson 27's own `for` loop searched for the first failure and stopped
immediately. Computing a polygon's total perimeter needs a different loop
shape entirely — one that visits *every* edge without stopping early, and
builds up a running total instead of returning as soon as something is
found.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_33.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(get_edge(polygon, 3))` line
  added in Concept Unit 2.
- **Dependencies:** Concept Unit 2's `get_edge`, `polygon`.

### The New Code

```python
import math


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def polygon_perimeter(polygon):
    total = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        edge_start = edge[0]
        edge_end = edge[1]
        edge_length = norm(subtract_points(edge_end, edge_start))
        total = total + edge_length
    return total


print(polygon_perimeter(polygon))
```

### The Updated Project

```python
polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]

print(polygon)
print(polygon[0])
print(polygon[1])


def get_edge(polygon, i):
    start = polygon[i]
    end = polygon[(i + 1) % len(polygon)]
    return (start, end)


print(get_edge(polygon, 0))
print(get_edge(polygon, 1))
print(get_edge(polygon, 2))
print(get_edge(polygon, 3))


import math                                                               # ← new


def subtract_points(a, b):                                               # ← new
    return (a[0] - b[0], a[1] - b[1])                                   # ← new


def dot_product(a, b):                                                   # ← new
    return a[0] * b[0] + a[1] * b[1]                                    # ← new


def norm(v):                                                             # ← new
    return math.sqrt(dot_product(v, v))                                 # ← new


def polygon_perimeter(polygon):                                          # ← new
    total = 0                                                            # ← new
    for i in range(len(polygon)):                                       # ← new
        edge = get_edge(polygon, i)                                     # ← new
        edge_start = edge[0]                                            # ← new
        edge_end = edge[1]                                              # ← new
        edge_length = norm(subtract_points(edge_end, edge_start))       # ← new
        total = total + edge_length                                     # ← new
    return total                                                         # ← new


print(polygon_perimeter(polygon))                                        # ← new
```

The file now computes a real property of the whole polygon, not just of
one edge at a time.

*A note on method:* `import math`, `subtract_points`, `dot_product`, and
`norm` are Lesson 9, 2, and 7's own code, retyped unchanged; `for` loops,
`len`, and `range` were already given full treatment in Concept Unit 2.
No new Python construct appears in this unit; what's new is the
*accumulation* pattern the loop uses, not any new syntax.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `import math`, `def subtract_points(...)`, `def dot_product(...)`, `def
  norm(...)` — Lesson 9, 2, and 7's own code, retyped unchanged. No
  re-explanation owed, per the Repetition Rule.
- `def polygon_perimeter(polygon): ...` — first appearance: this
  lesson's own subject.
- `total = 0` — first appearance of an **accumulator**: a variable
  started at zero, meant to be added to repeatedly rather than checked
  and returned from immediately, the way every earlier lesson's loop
  variable was used.
- `for i in range(len(polygon)):` — Concept Unit 2's own wraparound
  setup, reused unchanged.
- `edge = get_edge(polygon, i)`, `edge_start = edge[0]`, `edge_end =
  edge[1]` — Concept Unit 2's own function, reused, with its result
  unpacked by indexing into two named variables for clarity.
- `edge_length = norm(subtract_points(edge_end, edge_start))` — Lesson 2
  and 9's own functions, combined exactly as `distance_to_segment` and
  every earlier distance calculation already has.
- `total = total + edge_length` — first appearance of updating the
  accumulator: each pass through the loop adds one more edge's length
  onto the running total, rather than replacing it.
- `return total` — reached only after the loop has visited every single
  edge, unlike Lesson 27's own early-exit `return False`.
- `print(polygon_perimeter(polygon))` — prints `14.0`: the rectangle's
  two `4`-unit sides plus two `3`-unit sides.

**Execution trace:**

1. `i = 0` — `edge = ((0, 0), (4, 0))`, `edge_length = 4.0`,
   `total` becomes `0 + 4.0 = 4.0`.
2. `i = 1` — `edge = ((4, 0), (4, 3))`, `edge_length = 3.0`,
   `total` becomes `4.0 + 3.0 = 7.0`.
3. `i = 2` — `edge = ((4, 3), (0, 3))`, `edge_length = 4.0`,
   `total` becomes `7.0 + 4.0 = 11.0`.
4. `i = 3` — `edge = ((0, 3), (0, 0))`, the wraparound edge,
   `edge_length = 3.0`, `total` becomes `11.0 + 3.0 = 14.0` — the loop
   ends (`range(4)` is exhausted), and `14.0` is returned.

### CS Lens

Looping to build up a single accumulated result — a sum, in this case —
rather than searching for one specific value and stopping, is one of the
two or three most common loop shapes in all of programming, distinct
from the early-exit search Lesson 27 already used.

```
Also recognized in: every statistics library's `sum`/`mean`/`total`
function (all built on this identical loop-and-accumulate pattern under
the hood), financial software (running account balances, invoice totals,
and tax calculations all accumulate across many line items the same
way), and CAM toolpath length estimation (a machine controller or CAM
package estimating total cut time sums the length of every programmed
move, exactly this lesson's own `polygon_perimeter`, applied to a tool
path instead of a polygon boundary)
```

### SE Lens

The design principle is **using the loop shape that matches the actual
question being asked**, rather than reusing Lesson 27's own early-exit
pattern out of habit. The alternative not chosen: write
`polygon_perimeter` as a search-shaped loop, checking some condition on
each edge and returning early, the way `are_points_collinear` does.

That alternative doesn't fit this question at all — "what is the total
length" has no early-exit condition to check; every single edge's length
genuinely has to be visited and added before the answer means anything.
Recognizing that the *question* determines the loop's *shape* — early
exit for "does everything satisfy this," accumulation for "what's the
combined total" — is what keeps a loop's structure matching its actual
purpose, rather than forcing every loop into whichever shape was used
most recently.

### Commands Needed

`python geometry_lesson_33.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
[(0, 0), (4, 0), (4, 3), (0, 3)]
(0, 0)
(4, 0)
((0, 0), (4, 0))
((4, 0), (4, 3))
((4, 3), (0, 3))
((0, 3), (0, 0))
14.0
```

Verified by actually running the updated file above.

### Connection

`polygon_perimeter` correctly sums all four edges of a real polygon,
including the wraparound one. Connect the Pieces, below, traces the full
computation start to finish.

---

## Connect the Pieces

One polygon, traced through everything this lesson built, start to
finish:

1. `polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]` — a rectangle, stored as
   a `list` of four vertices.
2. `get_edge(polygon, i)`, for `i = 0, 1, 2, 3`, retrieves all four
   edges, including `get_edge(polygon, 3) = ((0, 3), (0, 0))` — the
   wraparound edge, made possible by `(i + 1) % len(polygon)` wrapping
   index `4` back to `0`.
3. `polygon_perimeter` loops over all four edges with `for i in
   range(len(polygon))`, accumulating each edge's own `norm`-based
   length into a running `total`.
4. The four edge lengths, `4.0`, `3.0`, `4.0`, `3.0`, sum to `14.0` — the
   rectangle's true perimeter, requiring every edge, including the one
   that closes the shape, to be counted.

## What Breaks Without This

`get_edge`'s own `% len(polygon)` exists specifically to make the last
edge close the shape instead of running off the end of the list. Prove
it, using a version that forgets the wraparound:

```python
def get_edge_no_wraparound(polygon, i):
    start = polygon[i]
    end = polygon[i + 1]
    return (start, end)


polygon = [(0, 0), (4, 0), (4, 3), (0, 3)]

print(get_edge_no_wraparound(polygon, 3))
```

```
Traceback (most recent call last):
  File "geometry_lesson_33_break.py", line 8, in <module>
    print(get_edge_no_wraparound(polygon, 3))
          ~~~~~~~~~~~~~~~~~~~~~~^^^^^^^^^^^^
  File "geometry_lesson_33_break.py", line 4, in get_edge_no_wraparound
    end = polygon[i + 1]
          ~~~~~~~^^^^^^^
IndexError: list index out of range
```

Verified by actually running this. `polygon[i + 1]`, without the modulo,
tries to reach `polygon[4]` — a fifth vertex this four-vertex list simply
doesn't have — and crashes with a real `IndexError`, the same exception
type Lesson 27's own missing-second-vertex crash produced, here for a
genuinely different reason. This isn't a rare edge case that happens to
occur at the boundary; it happens on *every* polygon's *last* edge,
every single time, because a polygon's last vertex connecting back to
its first isn't an exception to ordinary indexing — it's the entire
defining property of what makes a list of points a closed *polygon*
rather than an open, unclosed path.

## Exercises

1. Build a five-vertex polygon (a pentagon) of your own choosing, and
   verify `get_edge` correctly returns all five edges, including the
   wraparound one connecting vertex `4` back to vertex `0`.
2. Using `polygon_perimeter`, compute the perimeter of a triangle,
   `[(0, 0), (4, 0), (0, 3)]`, and confirm it matches `3 + 4 + 5 = 12` —
   the familiar 3-4-5 right triangle this curriculum has used since
   Lesson 9.
3. Write `polygon_vertex_count(polygon)`, a one-line function that
   returns `len(polygon)` directly. Then use it, instead of calling
   `len(polygon)` inline, to rewrite `polygon_perimeter`'s own `for`
   loop. Explain whether this change makes the code more or less clear,
   and why a real project might prefer one version over the other.

## Definition of Done

- [ ] `geometry_lesson_33.py` exists and runs with no errors via `python
      geometry_lesson_33.py`.
- [ ] Running it prints the full 8-line sequence shown in Concept Unit
      3's Run It, ending in `((0, 3), (0, 0))` then `14.0` — matching
      this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, what `%` computes and
      why `(i + 1) % len(polygon)` wraps back to `0` at the last vertex.
- [ ] You can explain the difference between an early-exit loop (Lesson
      27's `are_points_collinear`) and an accumulating loop (this
      lesson's `polygon_perimeter`), and why the question each one
      answers determines its shape.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Represent polygons as vertex lists with wraparound edges and a perimeter accumulator"`,
      not `git commit -m "add polygon functions"`.

Next: Lesson 34 — Polygon Orientation, which reuses this lesson's own
`get_edge` and Lesson 26's `signed_area` to determine a whole polygon's
winding direction — generalizing a single triangle's orientation to a
shape with any number of sides.
