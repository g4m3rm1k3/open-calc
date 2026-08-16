# Lesson 38: Convex Hulls

**What you will build:** `convex_hull`, finding the smallest convex
shape enclosing an arbitrary set of points — the **gift wrapping**
algorithm, walking from the leftmost point to the most extreme next
point, over and over, until the walk returns to where it started. Along
the way, this lesson introduces two genuinely new tools: `list.append`,
this curriculum's first way to grow a collection one item at a time, and
a real `while` loop, looping until a condition is met rather than a fixed
number of times. The transferable problem: every polygon this curriculum
has built since Lesson 33 was handed to these functions already formed,
with a vertex count known in advance. A convex hull's own vertex count
isn't known until the algorithm finishes finding it — the first time
this curriculum has needed to build a *result* whose size isn't fixed
ahead of time, not just process an input of unknown size.

**What you need to know first:** Lesson 26's `orientation`, Lesson 33's
`list` representation and `for` loop, and Lesson 37's `is_polygon_convex`,
used here to verify the finished hull.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–37, except that `list.append` and the `while` loop — both real Python
tools not yet used in this curriculum's project code — receive full
first-appearance treatment in this lesson's third Concept Unit.

**Terms introduced in this lesson:**

- **Convex hull** — the smallest convex polygon that encloses every point
  in a given set, using only some of those points as its own vertices.
  Why: this is the shape this lesson builds — the tightest convex
  "rubber band" that could be stretched around a scattered set of points.
- **Gift wrapping** — an algorithm for building a convex hull by starting
  at a known hull point and repeatedly finding the single most extreme
  next point, the way a piece of gift wrap stretched taut against a set
  of points would trace their outer boundary. Why: this is the specific
  method this lesson uses, chosen because every step reuses a predicate
  this curriculum already has (`orientation`), needing no new geometric
  idea, only a new way of looping.

**Objects and methods used:**

- **`list.append`**
  - *What it is:* a method on Python's `list` type that adds one new
    item to the end of an existing list, in place.
  - *Implementation:* called as `some_list.append(item)`; returns
    nothing — it modifies `some_list` itself rather than producing a new
    list.
  - *Its use:* this lesson needs to grow the hull one confirmed vertex at
    a time, without knowing in advance how many vertices the finished
    hull will have.

---

## Concept Unit: Finding the Leftmost Point — a Running-Best Accumulator

### The Problem

Gift wrapping needs one guaranteed hull point to start from — some point
that's undeniably on the outer boundary, not buried inside the point
set. The leftmost point (the smallest `x` coordinate) always qualifies:
nothing can be further left of it, so nothing can hide it from the
outside.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–37.
- **Files affected:** `geometry_lesson_38.py` — created, as a new file
  for this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def find_leftmost_point(points):
    leftmost = points[0]
    for p in points:
        if p[0] < leftmost[0]:
            leftmost = p
    return leftmost


points = [(0, 0), (4, 0), (4, 4), (0, 4), (2, 2)]

print(find_leftmost_point(points))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `for` loops, `list` indexing, and comparison were all
already given full treatment (Lessons 27, 2, and 5). No new Python
construct appears here, so no isolated throwaway lab is needed; what's
new is the *accumulation pattern*, not any new syntax.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def find_leftmost_point(points): ...` — first appearance: this
  lesson's own subject.
- `leftmost = points[0]` — first appearance of a **running-best
  accumulator**: unlike Lesson 33's own `total = 0`, which starts at a
  neutral value and grows, this starts already holding a real candidate
  answer — the first point — ready to be replaced the moment something
  better is found.
- `for p in points: ...` — already-basic reuse, Lesson 27's own loop
  shape (iterating over values directly, not by index).
- `if p[0] < leftmost[0]: leftmost = p` — already-basic comparison and
  reassignment: whenever a point's own `x` coordinate beats the current
  best, it *becomes* the new best. By the end of the loop, `leftmost`
  holds whichever point had the smallest `x` coordinate of all of them.
- `return leftmost` — already-basic.
- `points = [(0, 0), (4, 0), (4, 4), (0, 4), (2, 2)]` — a square with one
  extra point, `(2, 2)`, sitting in its exact center — genuinely part of
  the point set, but not part of its outer boundary.
- `print(find_leftmost_point(points))` — prints `(0, 0)`.

### CS Lens

Tracking the best value seen so far while scanning through a collection
once, rather than sorting the whole collection first, is a small but
genuinely efficient technique, distinct from Lesson 33's own running-sum
accumulator.

```
Also recognized in: finding a maximum or minimum in any unsorted dataset
(the standard way to find the largest or smallest value in a list of a
million numbers is exactly this one-pass running-best scan, not a full
sort), leaderboard and high-score tracking (a running "best score so
far" is updated the identical way, one new attempt at a time), and
gradient descent in machine learning (tracking the best model found
during training, updated each time a better one is discovered, is the
same running-best pattern applied to a much more complex "how good is
this" comparison)
```

### SE Lens

The design principle is **finding a guaranteed-correct starting point
cheaply, before attempting the harder problem**. The alternative not
chosen: start gift wrapping from an arbitrary point in the list — the
first one, say — without checking whether it's actually on the hull at
all.

That alternative could start from `(2, 2)`, the interior point in this
lesson's own example, and the gift-wrapping logic built in the next two
units has no way to recover from starting inside the shape instead of on
its boundary. Spending one small scan to guarantee a genuinely
boundary-safe starting point avoids that failure entirely, for the cost
of one pass through the points before the real algorithm even begins.

### Commands Needed

`python geometry_lesson_38.py` — same interpreter and command as every
prior lesson.

### Run It

```
(0, 0)
```

Verified by actually running the file above.

### Connection

One guaranteed hull point is found. The next unit builds the actual
gift-wrapping step: given one hull point, find the next one.

---

## Concept Unit: The Most Extreme Next Point — Gift Wrapping's Core Step

### The Problem

From a known hull point, the *next* hull point is the one specific point
such that every other point in the set lies to its left (or exactly on
the line) — if even one point were to its right, that point would be a
better, more extreme choice instead.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_38.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(find_leftmost_point(points))`
  line added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `find_leftmost_point`, `points`.

### The New Code

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def orientation(a, b, c):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))

    if turn_value > 0:
        return 1
    elif turn_value < 0:
        return -1
    else:
        return 0


def find_next_hull_point(points, current):
    candidate = points[0]
    if candidate == current:
        candidate = points[1]

    for p in points:
        turn = orientation(current, candidate, p)
        if turn == -1:
            candidate = p

    return candidate


leftmost = find_leftmost_point(points)
next_point = find_next_hull_point(points, leftmost)

print(next_point)
```

### The Updated Project

```python
def find_leftmost_point(points):
    leftmost = points[0]
    for p in points:
        if p[0] < leftmost[0]:
            leftmost = p
    return leftmost


points = [(0, 0), (4, 0), (4, 4), (0, 4), (2, 2)]

print(find_leftmost_point(points))


def subtract_points(a, b):                                               # ← new
    return (a[0] - b[0], a[1] - b[1])                                   # ← new


def cross_product(a, b):                                                 # ← new
    return a[0] * b[1] - a[1] * b[0]                                    # ← new


def orientation(a, b, c):                                                # ← new
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))  # ← new
                                                                           # ← new
    if turn_value > 0:                                                   # ← new
        return 1                                                         # ← new
    elif turn_value < 0:                                                 # ← new
        return -1                                                        # ← new
    else:                                                                # ← new
        return 0                                                         # ← new


def find_next_hull_point(points, current):                               # ← new
    candidate = points[0]                                                # ← new
    if candidate == current:                                             # ← new
        candidate = points[1]                                            # ← new
                                                                           # ← new
    for p in points:                                                     # ← new
        turn = orientation(current, candidate, p)                       # ← new
        if turn == -1:                                                   # ← new
            candidate = p                                                # ← new
                                                                           # ← new
    return candidate                                                     # ← new


leftmost = find_leftmost_point(points)                                   # ← new
next_point = find_next_hull_point(points, leftmost)                      # ← new

print(next_point)                                                        # ← new
```

The file now finds two real hull vertices in sequence: the starting
point, and the very next one around the boundary.

*A note on method:* `subtract_points`, `cross_product`, and `orientation`
are Lesson 2 and 26's own functions, retyped unchanged. No new Python
construct appears here, so no isolated throwaway lab is needed.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def subtract_points(...)`, `def cross_product(...)`, `def
  orientation(...)` — Lesson 2 and 26's own functions, retyped
  unchanged. No re-explanation owed, per the Repetition Rule.
- `def find_next_hull_point(points, current): ...` — first appearance:
  gift wrapping's own core step.
- `candidate = points[0]` — already-basic: an initial guess for the next
  hull point, which the rest of the function will refine.
- `if candidate == current: candidate = points[1]` — first appearance of
  a small but necessary safeguard: `orientation(current, candidate, p)`
  is meaningless if `candidate` and `current` are the same point (there's
  no direction between a point and itself), so this line makes sure the
  initial guess is genuinely a *different* point before the real
  comparison loop begins.
- `for p in points: turn = orientation(current, candidate, p)` —
  already-basic reuse, checking every point in the set, one at a time,
  against the current best guess.
- `if turn == -1: candidate = p` — first appearance of the actual
  refinement: `orientation` returning `-1` means `p` sits to the
  *right* of the line from `current` through `candidate` — meaning
  `candidate` wasn't extreme enough after all, and `p` is a better
  choice. By the time the loop finishes, `candidate` is the one point
  that no other point in the set is ever found to the right of.
- `return candidate` — the confirmed next hull point.
- `leftmost = find_leftmost_point(points)`, `next_point =
  find_next_hull_point(points, leftmost)` — already-basic reuse, running
  the whole chain: find a guaranteed starting point, then find its own
  next hull point.
- `print(next_point)` — prints `(4, 0)`: starting from `(0, 0)`, the next
  point around the boundary, walking counter-clockwise, is the square's
  own bottom-right corner — `(2, 2)`, the interior point, never wins,
  because it always sits to the *left* of the line toward any of the
  square's own real corners, never to the right.

### CS Lens

Finding "the one candidate no other option beats," by comparing every
candidate against the current best and swapping whenever a better one
appears, is the identical running-best structure Concept Unit 1 already
used for the leftmost point — here applied to a geometric comparison
instead of a plain numeric one.

```
Also recognized in: tournament bracket algorithms (finding an overall
winner by comparing a running "best so far" against each new challenger
is structurally the same pattern, whether the comparison is a numeric
score or, as here, a geometric orientation test), computer graphics
silhouette detection (finding the outermost visible points of a 3D
object from a given viewpoint uses this identical "no other point beats
this one" comparison), and robotics path planning (choosing the next
waypoint that most directly progresses toward a goal, out of several
candidates, is often implemented with this same repeated-replacement
comparison)
```

### SE Lens

The design principle is **reusing an existing predicate as the entire
comparison rule**, rather than deriving a new geometric test specifically
for hull-building. The alternative not chosen: write a dedicated
"is this point more extreme" function from scratch, instead of reusing
Lesson 26's `orientation` unchanged.

That alternative might read slightly more specifically to this one use
case. The real value of reusing `orientation` directly:
`find_next_hull_point`'s entire correctness rests on `orientation`'s own
already-established correctness, proven independently back in Lesson 26
— nothing new has to be trusted here except the small loop structure
wrapped around it.

### Commands Needed

`python geometry_lesson_38.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
(0, 0)
(4, 0)
```

Verified by actually running the updated file above.

### Connection

Two real hull vertices are found, one after another. The next unit
repeats this step automatically, collecting every hull vertex until the
walk returns to where it started.

---

## Concept Unit: Collecting the Hull — list.append and a while Loop

### The Problem

`find_next_hull_point` finds one vertex at a time — building the whole
hull means calling it repeatedly, each time starting from the vertex
just found, collecting every result, and stopping only once the walk
returns to the original starting point. The hull's own final size isn't
known until that happens.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_38.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(next_point)` line added in
  Concept Unit 2.
- **Dependencies:** Concept Unit 1's `find_leftmost_point`, Concept Unit
  2's `find_next_hull_point`, Lesson 33's `get_edge`, Lesson 34's
  `polygon_signed_area`/`polygon_orientation`, Lesson 37's
  `get_vertex`/`is_polygon_convex` — reused here to verify the finished
  hull.

### The New Code

```python
def convex_hull(points):
    start = find_leftmost_point(points)
    hull = [start]
    current = start
    next_point = find_next_hull_point(points, current)

    while next_point != start:
        hull.append(next_point)
        current = next_point
        next_point = find_next_hull_point(points, current)

    return hull


hull = convex_hull(points)
print(hull)
print(is_polygon_convex(hull))

scattered_points = [(1, 1), (3, 0), (5, 2), (4, 5), (1, 4), (3, 3), (0, 2)]
scattered_hull = convex_hull(scattered_points)
print(scattered_hull)
print(is_polygon_convex(scattered_hull))
```

### The Updated Project

```python
def find_leftmost_point(points):
    leftmost = points[0]
    for p in points:
        if p[0] < leftmost[0]:
            leftmost = p
    return leftmost


points = [(0, 0), (4, 0), (4, 4), (0, 4), (2, 2)]

print(find_leftmost_point(points))


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def orientation(a, b, c):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))

    if turn_value > 0:
        return 1
    elif turn_value < 0:
        return -1
    else:
        return 0


def find_next_hull_point(points, current):
    candidate = points[0]
    if candidate == current:
        candidate = points[1]

    for p in points:
        turn = orientation(current, candidate, p)
        if turn == -1:
            candidate = p

    return candidate


leftmost = find_leftmost_point(points)
next_point = find_next_hull_point(points, leftmost)

print(next_point)


def convex_hull(points):                                                 # ← new
    start = find_leftmost_point(points)                                # ← new
    hull = [start]                                                      # ← new
    current = start                                                     # ← new
    next_point = find_next_hull_point(points, current)                 # ← new
                                                                          # ← new
    while next_point != start:                                          # ← new
        hull.append(next_point)                                         # ← new
        current = next_point                                            # ← new
        next_point = find_next_hull_point(points, current)              # ← new
                                                                          # ← new
    return hull                                                         # ← new


def get_vertex(polygon, i):                                              # ← new
    return polygon[i % len(polygon)]                                    # ← new


def classify_turn(a, b, c):                                              # ← new
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))  # ← new
                                                                           # ← new
    if turn_value > 0:                                                   # ← new
        return "left"                                                    # ← new
    elif turn_value < 0:                                                 # ← new
        return "right"                                                   # ← new
    else:                                                                # ← new
        return "straight"                                                # ← new


def get_edge(polygon, i):                                                # ← new
    start = polygon[i]                                                  # ← new
    end = polygon[(i + 1) % len(polygon)]                               # ← new
    return (start, end)                                                 # ← new


def polygon_signed_area(polygon):                                        # ← new
    total = 0                                                            # ← new
    for i in range(len(polygon)):                                       # ← new
        edge = get_edge(polygon, i)                                     # ← new
        v1 = edge[0]                                                    # ← new
        v2 = edge[1]                                                    # ← new
        total = total + cross_product(v1, v2)                          # ← new
    return total / 2                                                     # ← new


def polygon_orientation(polygon):                                        # ← new
    signed_area = polygon_signed_area(polygon)                           # ← new
                                                                           # ← new
    if signed_area > 0:                                                 # ← new
        return "counterclockwise"                                       # ← new
    elif signed_area < 0:                                                # ← new
        return "clockwise"                                               # ← new
    else:                                                                # ← new
        return "degenerate"                                              # ← new


def is_polygon_convex(polygon):                                          # ← new
    overall_orientation = polygon_orientation(polygon)                   # ← new
                                                                           # ← new
    for i in range(len(polygon)):                                       # ← new
        prev_vertex = get_vertex(polygon, i - 1)                        # ← new
        current_vertex = get_vertex(polygon, i)                         # ← new
        next_vertex = get_vertex(polygon, i + 1)                        # ← new
        local_turn = classify_turn(prev_vertex, current_vertex, next_vertex)  # ← new
                                                                           # ← new
        if overall_orientation == "counterclockwise":                   # ← new
            if local_turn == "right":                                   # ← new
                return False                                            # ← new
        else:                                                            # ← new
            if local_turn == "left":                                    # ← new
                return False                                            # ← new
                                                                           # ← new
    return True                                                          # ← new


hull = convex_hull(points)                                               # ← new
print(hull)                                                              # ← new
print(is_polygon_convex(hull))                                           # ← new

scattered_points = [(1, 1), (3, 0), (5, 2), (4, 5), (1, 4), (3, 3), (0, 2)]  # ← new
scattered_hull = convex_hull(scattered_points)                           # ← new
print(scattered_hull)                                                    # ← new
print(is_polygon_convex(scattered_hull))                                 # ← new
```

The file now builds a complete convex hull for two different point sets,
and verifies each one really is convex using Lesson 37's own predicate.

### Isolated Concept: `list.append`

This is exactly what `hull.append(next_point)` above is doing, isolated
down to a small list of plain numbers instead of hull points:

```python
sample_list = [1, 2]
print(sample_list)

sample_list.append(3)
print(sample_list)

sample_list.append(4)
print(sample_list)
```

Run:

```
[1, 2]
[1, 2, 3]
[1, 2, 3, 4]
```

The first `print` shows `sample_list` with its original two items.
`sample_list.append(3)` doesn't return a new list — it changes
`sample_list` itself, growing it in place, which the second `print`
confirms: `[1, 2, 3]`. Calling `.append` again grows it further, to
`[1, 2, 3, 4]`. This is called a **method call**: `append` is a piece of
behavior that belongs to the `list` itself, invoked with a dot,
`sample_list.append(...)`, rather than a standalone function called with
the list passed in as an argument the way every function in this
curriculum has worked so far.

### Discard

`sample_list` above is now discarded — it exists only to prove `.append`
grows a list in place, one item at a time, and will not appear in the
project again. `hull.append(next_point)`, shown in the real code above,
works by the identical rule.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def convex_hull(points): ...` — first appearance: this lesson's own
  final subject.
- `start = find_leftmost_point(points)` — Concept Unit 1's own function,
  reused.
- `hull = [start]` — already-basic `list` construction (a one-item
  list), starting the hull with its own known-good first vertex.
- `current = start`, `next_point = find_next_hull_point(points,
  current)` — already-basic reuse, finding the second hull vertex before
  the loop even begins.
- `while next_point != start: ...` — first appearance of a real `while`
  loop in this curriculum's project code. Unlike every `for` loop used
  since Lesson 27, which runs a number of times known in advance, this
  loop's own length depends entirely on how many vertices the finished
  hull actually turns out to have — it keeps running for as long as its
  condition, `next_point != start`, stays `True`, and stops the instant
  it becomes `False`.
- `hull.append(next_point)` — this unit's own new method call, growing
  `hull` by one confirmed vertex.
- `current = next_point`, `next_point = find_next_hull_point(points,
  current)` — already-basic reuse, advancing to find the *next* hull
  vertex after this one, setting up the next pass through the loop.
- `return hull` — reached only once `next_point` finally comes back
  around to `start` again, meaning every real hull vertex has already
  been appended.
- `def get_vertex(...)` through `def is_polygon_convex(...)` — Lesson 33,
  19, 34, and 37's own functions, retyped unchanged. No re-explanation
  owed, per the Repetition Rule.
- `hull = convex_hull(points)`, `print(hull)` — prints `[(0, 0), (4, 0),
  (4, 4), (0, 4)]` — the square's own four real corners, with the
  interior point `(2, 2)` correctly excluded.
- `print(is_polygon_convex(hull))` — prints `True`: the hull this
  algorithm built passes Lesson 37's own independent convexity check,
  confirming the result isn't just plausible-looking but genuinely
  correct by that lesson's own standard.
- `scattered_points`, `scattered_hull`, and their own two `print(...)`
  calls — the identical process on a second, less regular point set.
  Prints `[(0, 2), (1, 1), (3, 0), (5, 2), (4, 5), (1, 4)]`, correctly
  excluding the one interior point, `(3, 3)`, then `True`.

### CS Lens

Growing a collection one confirmed item at a time, stopping only when a
real condition is met rather than after a fixed number of steps, is the
standard shape for any algorithm whose output size genuinely can't be
known in advance.

```
Also recognized in: parsing (a parser building an abstract syntax tree
appends nodes as it discovers them, stopping when the input is fully
consumed, not after a fixed number of tokens), breadth-first and
depth-first search (both build up a list of visited nodes one at a time,
stopping when a goal is found or no nodes remain, exactly this lesson's
own `while`-loop shape), and real-time data collection (a sensor logging
system appends each new reading as it arrives, with no way to know in
advance how many readings a given session will produce)
```

### SE Lens

The design principle is **letting the algorithm's own natural stopping
condition control the loop**, rather than forcing it into a fixed number
of iterations. The alternative not chosen: loop a fixed number of times —
once per input point, say, since the hull can never have more vertices
than the original point set — appending a result each time regardless.

That alternative's own failure is demonstrated directly in this lesson's
closing section: the hull's real vertex count has no fixed relationship
to the input's size that a `for` loop could safely assume in advance. A
`while` loop driven by the actual stopping condition — has the walk
returned to its starting point — is the only version that's correct for
every input, not just the one convenient to write.

### Commands Needed

`python geometry_lesson_38.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
(0, 0)
(4, 0)
[(0, 0), (4, 0), (4, 4), (0, 4)]
True
[(0, 2), (1, 1), (3, 0), (5, 2), (4, 5), (1, 4)]
True
```

Verified by actually running the updated file above.

### Connection

Two complete convex hulls, from two different point sets, both correctly
built and both independently confirmed convex. Connect the Pieces, below,
traces the square's own hull start to finish.

---

## Connect the Pieces

One point set, traced through everything this lesson built, start to
finish:

1. `points = [(0, 0), (4, 0), (4, 4), (0, 4), (2, 2)]` — a square plus
   one interior point.
2. `find_leftmost_point(points)` finds `(0, 0)` — a guaranteed hull
   vertex.
3. `find_next_hull_point` is called repeatedly, each time from the
   vertex just found: `(0, 0) → (4, 0) → (4, 4) → (0, 4)`, with `(2, 2)`
   never winning at any step, because it's never the most extreme point
   relative to any edge.
4. Once `find_next_hull_point` returns `(0, 0)` again — the original
   `start` — the `while` loop's own condition becomes `False`, and
   `convex_hull` returns `[(0, 0), (4, 0), (4, 4), (0, 4)]`.
5. `is_polygon_convex` (Lesson 37) confirms `True` — an independent check,
   built for a completely different purpose, agrees the result is
   genuinely convex.

## What Breaks Without This

`convex_hull`'s `while next_point != start` condition exists because the
hull's real size can't be known in advance. Prove it, by replacing the
`while` loop with a plausible-looking `for` loop that assumes the hull
has as many vertices as the *original* point set:

```python
def convex_hull_fixed_count(points):
    start = find_leftmost_point(points)
    hull = [start]
    current = start

    for i in range(len(points)):
        next_point = find_next_hull_point(points, current)
        hull.append(next_point)
        current = next_point

    return hull


print(convex_hull_fixed_count(points))
```

```
[(0, 0), (4, 0), (4, 4), (0, 4), (0, 0), (4, 0)]
```

Verified by actually running this. `points` has `5` entries, so the `for`
loop runs `5` times, regardless of how many real hull vertices actually
exist. The first four iterations correctly find `(4, 0)`, `(4, 4)`, `(0,
4)`, and — critically — the walk has already returned to `(0, 0)` by
the fourth append, meaning the hull is already complete. But the loop
doesn't know that, and keeps going: it calls `find_next_hull_point`
*again*, starting from `(0, 4)` (the last point set by the previous
iteration, not recognizing the walk had already closed), and the
algorithm starts retracing its own steps — appending `(0, 0)` and `(4,
0)` a second time. This isn't a crash; it's a silently corrupted hull,
with real vertices duplicated, exactly the failure mode this curriculum
has seen before (Lesson 20's degenerate pocket, Lesson 34's bowtie
polygon) where the code runs to completion and produces a plausible-
looking, wrong answer instead of an obvious error.

## Exercises

1. Using `convex_hull`, build a point set where every single point is
   already a hull vertex (for example, a regular pentagon with no
   interior points at all). Confirm the hull returned includes every
   original point.
2. Using `convex_hull`, build a point set with *two* interior points
   instead of one, and confirm both are correctly excluded from the
   resulting hull.
3. Predict, then verify, what `convex_hull` returns for a point set
   where all the points are exactly collinear — for example, `[(0, 0),
   (1, 0), (2, 0), (3, 0)]`. Explain what "the smallest convex shape
   enclosing these points" actually means when no real 2D shape, only a
   line segment, would enclose them.

## Definition of Done

- [ ] `geometry_lesson_38.py` exists and runs with no errors via `python
      geometry_lesson_38.py`.
- [ ] Running it prints `(0, 0)`, `(4, 0)`, `[(0, 0), (4, 0), (4, 4), (0,
      4)]`, `True`, `[(0, 2), (1, 1), (3, 0), (5, 2), (4, 5), (1, 4)]`,
      then `True` — matching this lesson's verified output exactly.
- [ ] You can explain, without looking at the file, what `list.append`
      does differently from every function this curriculum has used
      before it.
- [ ] You can explain why `convex_hull` uses a `while` loop instead of a
      `for` loop, using this lesson's own verified
      `convex_hull_fixed_count` counter-example.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Build convex hulls via gift wrapping, growing the result with list.append and a while loop"`,
      not `git commit -m "add convex_hull"`.

Next: Lesson 39 — Sweep-Line Algorithms, which introduces a genuinely
different algorithmic strategy — processing geometric events in sorted
order across a shape — for problems where checking every pairing, the
way Lesson 36's polygon intersection did, becomes too slow to be
practical.
