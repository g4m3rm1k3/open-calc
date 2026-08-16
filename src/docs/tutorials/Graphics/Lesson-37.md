# Lesson 37: Convexity

**What you will build:** `is_polygon_convex`, checking whether a polygon
ever turns both ways by comparing every vertex's own local turn (Lesson
19's `classify_turn`) against the polygon's overall winding direction
(Lesson 34's `polygon_orientation`) — reusing both completely unchanged.
Every real polygon this curriculum has used so far — Lesson 33's
rectangle, Lesson 9's right triangle — happens to be **convex**; Lesson
35's own `notch_polygon` is not, and this lesson finally gives that
difference a name and a real test. The transferable problem: a polygon
that only ever turns one direction — always left, or always right — has
a much simpler shape than one that turns both ways, and several future
algorithms (convex hulls, Lesson 38; certain triangulation strategies)
depend on knowing which kind of polygon they're actually working with.

**What you need to know first:** Lesson 19's `classify_turn`, Lesson
34's `polygon_orientation`, and Lesson 33's `get_edge` and wraparound
indexing.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–36.

**Terms introduced in this lesson:**

- **Convex** — a polygon whose boundary never turns both directions:
  walking its vertices in order, every turn goes the same way as every
  other turn. Why: this is a real, structural property that makes many
  polygon algorithms simpler or faster, and this curriculum has been
  quietly using only convex polygons in every worked example since Lesson
  33, without ever naming the property they all shared.

**Objects and methods used:**

None. `get_vertex` and `is_polygon_convex` are hand-authored project
code, built from Lesson 19 and 34's own reused functions.

---

## Concept Unit: Every Vertex's Local Turn

### The Problem

`classify_turn` needs three points — the vertex *before*, the vertex
*itself*, and the vertex *after* — to classify a turn. `get_edge`, from
Lesson 33, only ever hands over a vertex and its immediate successor;
nothing so far retrieves the vertex that comes *before* a given one,
including wrapping backward past the start of the list.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–36.
- **Files affected:** `geometry_lesson_37.py` — created, as a new file
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


def classify_turn(a, b, c):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))

    if turn_value > 0:
        return "left"
    elif turn_value < 0:
        return "right"
    else:
        return "straight"


def get_vertex(polygon, i):
    return polygon[i % len(polygon)]


square = [(0, 0), (4, 0), (4, 4), (0, 4)]
notch_polygon = [(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)]

print(get_vertex(square, -1))
print(get_vertex(square, 4))

for i in range(len(square)):
    prev_vertex = get_vertex(square, i - 1)
    current_vertex = get_vertex(square, i)
    next_vertex = get_vertex(square, i + 1)
    print(i, classify_turn(prev_vertex, current_vertex, next_vertex))

for i in range(len(notch_polygon)):
    prev_vertex = get_vertex(notch_polygon, i - 1)
    current_vertex = get_vertex(notch_polygon, i)
    next_vertex = get_vertex(notch_polygon, i + 1)
    print(i, classify_turn(prev_vertex, current_vertex, next_vertex))
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `subtract_points`, `cross_product`, and
`classify_turn` are Lesson 2, 8, and 19's own functions, retyped
unchanged; `%` was already given full treatment in Lesson 33. No new
Python construct appears here, so no isolated throwaway lab is needed.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def subtract_points(...)`, `def cross_product(...)`, `def
  classify_turn(...)` — Lesson 2, 8, and 19's own functions, retyped
  unchanged. No re-explanation owed, per the Repetition Rule.
- `def get_vertex(polygon, i): return polygon[i % len(polygon)]` — first
  appearance: unlike `get_edge`, which only ever moves forward,
  `get_vertex` accepts *any* integer, including negative ones, and lets
  `%` handle the wraparound in either direction.
- `print(get_vertex(square, -1))` — `-1 % 4` evaluates to `3` in Python
  (a negative index wraps to count backward from the end, the same
  behavior Python's own built-in list indexing already uses), so this
  reaches `square[3]`, the polygon's *last* vertex. Prints `(0, 4)`.
- `print(get_vertex(square, 4))` — `4 % 4` evaluates to `0`, wrapping
  forward past the end back to the first vertex. Prints `(0, 0)`.
- `for i in range(len(square)): ...` — already-basic reuse, Lesson 33's
  own indexed loop.
- `prev_vertex = get_vertex(square, i - 1)`, `current_vertex =
  get_vertex(square, i)`, `next_vertex = get_vertex(square, i + 1)` —
  first appearance of retrieving all three points `classify_turn` needs,
  for a given vertex, using `get_vertex`'s own wraparound in both
  directions at once.
- `print(i, classify_turn(prev_vertex, current_vertex, next_vertex))` —
  already-basic reuse, printing each vertex's own local turn. Every one
  of `square`'s four vertices prints `"left"` — the square turns the
  same direction at every single corner.
- The second `for` loop, over `notch_polygon` — identical structure,
  printing `"left"`, `"left"`, `"right"`, `"left"`, `"left"` — vertex `2`,
  the notch's own inward point, turns the *opposite* direction from
  every other vertex.

### CS Lens

Retrieving a value's neighbor in *either* direction from a fixed-size,
wraparound sequence, using the same modulo trick regardless of which
direction is needed, is a small but genuinely reusable technique.

```
Also recognized in: doubly linked circular lists (a data structure
supporting "next" and "previous" traversal that wraps around at both
ends, the same shape `get_vertex` provides for a plain list), clock and
compass arithmetic (finding "3 hours before midnight" or "45 degrees
counter-clockwise from due north" both wrap backward using the identical
negative-modulo behavior this unit's own `get_vertex(square, -1)`
demonstrated), and animation loop scrubbing (stepping a looping
animation's timeline backward past frame `0` wraps to its last frame the
same way, using this same modulo arithmetic)
```

### SE Lens

The design principle is **building one small, general-purpose accessor
instead of writing forward and backward lookup as two separate
functions**. The alternative not chosen: write `get_next_vertex` and
`get_previous_vertex` as two distinct functions, each with its own
wraparound logic tailored to one direction.

That alternative would read slightly more descriptively at each call
site. The real cost it pays: two separate implementations of essentially
the same wraparound idea, each needing its own correctness check. This
unit's own `get_vertex`, taking any integer offset at all, handles both
directions — and, for that matter, any larger jump too — through the
identical `%` expression, trusted once.

### Commands Needed

`python geometry_lesson_37.py` — same interpreter and command as every
prior lesson.

### Run It

```
(0, 4)
(0, 0)
0 left
1 left
2 left
3 left
0 left
1 left
2 right
3 left
4 left
```

Verified by actually running the file above.

### Connection

Every vertex's own local turn is now printable, by hand, one at a time.
The next unit turns that into a single, real yes/no answer.

---

## Concept Unit: Comparing Local Turns to the Overall Winding

### The Problem

`square`'s turns were all `"left"`; `notch_polygon`'s were mostly
`"left"` with one `"right"`. But a polygon wound *clockwise* would show
all `"right"` turns instead, for a shape that's still perfectly convex —
checking for "any right turn at all" would wrongly flag it as broken.
The real test has to compare each local turn against the polygon's own
overall winding direction, not against a fixed assumption of which way
is "normal."

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_37.py` — modified.
- **Change type:** add.
- **Location:** appended below the final `print(i, classify_turn(...))`
  line added in Concept Unit 1.
- **Dependencies:** Concept Unit 1's `get_vertex`, `classify_turn`,
  `square`, `notch_polygon`.

### The New Code

```python
def get_edge(polygon, i):
    start = polygon[i]
    end = polygon[(i + 1) % len(polygon)]
    return (start, end)


def polygon_signed_area(polygon):
    total = 0
    for i in range(len(polygon)):
        edge = get_edge(polygon, i)
        v1 = edge[0]
        v2 = edge[1]
        total = total + cross_product(v1, v2)
    return total / 2


def polygon_orientation(polygon):
    signed_area = polygon_signed_area(polygon)

    if signed_area > 0:
        return "counterclockwise"
    elif signed_area < 0:
        return "clockwise"
    else:
        return "degenerate"


def is_polygon_convex(polygon):
    overall_orientation = polygon_orientation(polygon)

    for i in range(len(polygon)):
        prev_vertex = get_vertex(polygon, i - 1)
        current_vertex = get_vertex(polygon, i)
        next_vertex = get_vertex(polygon, i + 1)
        local_turn = classify_turn(prev_vertex, current_vertex, next_vertex)

        if overall_orientation == "counterclockwise":
            if local_turn == "right":
                return False
        else:
            if local_turn == "left":
                return False

    return True


print(is_polygon_convex(square))
print(is_polygon_convex(notch_polygon))
```

### The Updated Project

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def classify_turn(a, b, c):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))

    if turn_value > 0:
        return "left"
    elif turn_value < 0:
        return "right"
    else:
        return "straight"


def get_vertex(polygon, i):
    return polygon[i % len(polygon)]


square = [(0, 0), (4, 0), (4, 4), (0, 4)]
notch_polygon = [(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)]

print(get_vertex(square, -1))
print(get_vertex(square, 4))

for i in range(len(square)):
    prev_vertex = get_vertex(square, i - 1)
    current_vertex = get_vertex(square, i)
    next_vertex = get_vertex(square, i + 1)
    print(i, classify_turn(prev_vertex, current_vertex, next_vertex))

for i in range(len(notch_polygon)):
    prev_vertex = get_vertex(notch_polygon, i - 1)
    current_vertex = get_vertex(notch_polygon, i)
    next_vertex = get_vertex(notch_polygon, i + 1)
    print(i, classify_turn(prev_vertex, current_vertex, next_vertex))


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


print(is_polygon_convex(square))                                         # ← new
print(is_polygon_convex(notch_polygon))                                  # ← new
```

The file now answers this lesson's actual question directly, correctly,
for polygons wound in either direction.

*A note on method:* `get_edge`, `polygon_signed_area`, and
`polygon_orientation` are Lesson 33 and 34's own functions, retyped
unchanged. No new Python construct is introduced.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def get_edge(...)`, `def polygon_signed_area(...)`, `def
  polygon_orientation(...)` — Lesson 33 and 34's own functions, retyped
  unchanged. No re-explanation owed, per the Repetition Rule.
- `def is_polygon_convex(polygon): ...` — first appearance: this
  lesson's own subject.
- `overall_orientation = polygon_orientation(polygon)` — Lesson 34's own
  function, reused, computed once, before the loop, since it describes
  the whole polygon rather than any one vertex.
- `for i in range(len(polygon)): ...` — already-basic reuse.
- `prev_vertex`, `current_vertex`, `next_vertex`, `local_turn` —
  already-basic reuse, identical to Concept Unit 1's own pattern.
- `if overall_orientation == "counterclockwise": if local_turn ==
  "right": return False` — first appearance of the actual comparison:
  for a counter-clockwise polygon, *any* single `"right"` turn among its
  vertices means the boundary turned the wrong way somewhere — a guard
  clause (Lesson 25's own term), exiting immediately with `False`.
- `else: if local_turn == "left": return False` — the mirror check for a
  clockwise polygon: here, a `"left"` turn is the one that doesn't
  belong.
- `return True` — reached only once every single vertex's local turn has
  agreed with the polygon's own overall winding direction.
- `print(is_polygon_convex(square))` — prints `True`: all four turns
  were `"left"`, matching `square`'s own counter-clockwise orientation.
- `print(is_polygon_convex(notch_polygon))` — prints `False`: vertex `2`'s`
  `"right"` turn disagrees with the polygon's own counter-clockwise
  winding.

### CS Lens

Testing a global structural property (convexity) by checking that every
local measurement (each vertex's own turn) agrees with a single reference
value (the polygon's overall winding) is a pattern that recurs anywhere
local consistency has to add up to a global guarantee.

```
Also recognized in: curvature analysis in CAD surface modeling (checking
whether a modeled surface is convex everywhere, a real requirement for
some manufacturing and physical-simulation purposes, works the same
way — checking local curvature sign against a consistent reference),
distributed systems consistency checks (verifying every node in a
cluster agrees with a single reference value, rather than checking each
node against some fixed absolute assumption, mirrors this exact
local-versus-reference structure), and image processing edge detection
(convex versus concave corner detection in a traced contour uses this
identical local-turn-against-overall-winding test)
```

### SE Lens

The design principle is **deriving the reference to compare against,
rather than assuming a fixed one**. The alternative not chosen: assume
every polygon this curriculum ever builds is wound counter-clockwise,
and simply check for any `"right"` turn at all, the way Lesson 37's own
Concept Unit 1 data might tempt a reader to assume from `square`'s own
all-`"left"` result.

That alternative would work for every example this lesson has shown so
far — every polygon since Lesson 33 happens to be wound
counter-clockwise. The real cost it pays: it would silently misjudge any
genuinely convex, clockwise-wound polygon as non-convex, a real,
reproducible mistake this lesson's own closing section proves directly.
Deriving `overall_orientation` from the polygon itself, rather than
assuming it, means `is_polygon_convex` works correctly regardless of
which direction a given polygon happens to be wound.

### Commands Needed

`python geometry_lesson_37.py` — same command as every unit in this
lesson. Nothing new here.

### Run It

```
(0, 4)
(0, 0)
0 left
1 left
2 left
3 left
0 left
1 left
2 right
3 left
4 left
True
False
```

Verified by actually running the updated file above.

### Connection

`is_polygon_convex` correctly identifies `square` as convex and
`notch_polygon` as not. What Breaks Without This proves the fixed-
assumption alternative really would fail on a clockwise-wound example.

---

## Connect the Pieces

Two polygons, traced through everything this lesson built, start to
finish:

1. `square = [(0, 0), (4, 0), (4, 4), (0, 4)]` — `polygon_orientation`
   reports `"counterclockwise"`. Every one of its four local turns,
   computed via `get_vertex`'s wraparound in both directions, comes out
   `"left"` — matching the overall winding at every vertex.
   `is_polygon_convex` returns `True`.
2. `notch_polygon = [(0, 0), (4, 0), (2, 2), (4, 4), (0, 4)]` — also
   wound `"counterclockwise"`. Four of its five local turns are `"left"`,
   but vertex `2`, the notch's own inward point, turns `"right"` —
   disagreeing with the overall winding. `is_polygon_convex` returns
   `False` the moment that vertex is reached.

## What Breaks Without This

Prove that a version of this check comparing against a *fixed*
assumption — "any right turn means non-convex" — rather than the
polygon's own actual winding, misjudges a genuinely convex,
clockwise-wound square:

```python
def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def cross_product(a, b):
    return a[0] * b[1] - a[1] * b[0]


def classify_turn(a, b, c):
    turn_value = cross_product(subtract_points(b, a), subtract_points(c, a))

    if turn_value > 0:
        return "left"
    elif turn_value < 0:
        return "right"
    else:
        return "straight"


def get_vertex(polygon, i):
    return polygon[i % len(polygon)]


def is_polygon_convex_fixed_assumption(polygon):
    for i in range(len(polygon)):
        prev_vertex = get_vertex(polygon, i - 1)
        current_vertex = get_vertex(polygon, i)
        next_vertex = get_vertex(polygon, i + 1)
        local_turn = classify_turn(prev_vertex, current_vertex, next_vertex)

        if local_turn == "right":
            return False

    return True


cw_square = [(0, 0), (0, 4), (4, 4), (4, 0)]

print(is_polygon_convex_fixed_assumption(cw_square))
```

```
False
```

Verified by actually running this. `cw_square` is the exact same
`4`-by-`4` square as this lesson's own `square`, listed clockwise instead
of counter-clockwise — genuinely, visibly convex, with every one of its
four corners turning the identical direction. The fixed-assumption
version reports `False`, wrongly, because every single one of its turns
is `"right"` — the correct, consistent direction for *this* polygon's own
winding, but not the direction the fixed check happened to assume. This
is exactly why Concept Unit 2's `is_polygon_convex` computes
`overall_orientation` from the polygon itself first, rather than
hard-coding an assumption about which way "normal" polygons are supposed
to wind.

## Exercises

1. Using `is_polygon_convex`, build a regular pentagon (five vertices,
   roughly evenly spaced around a circle — exact coordinates aren't
   critical, just genuinely convex-looking) and confirm it reports
   `True`.
2. Using `is_polygon_convex`, test `notch_polygon` again, but with its
   vertex list reversed (clockwise instead of counter-clockwise).
   Confirm it still correctly reports `False`, and explain, using this
   lesson's own reasoning, why reversing a non-convex polygon's winding
   doesn't change whether it's convex.
3. Using `classify_turn`, predict what happens to `is_polygon_convex`
   when three consecutive vertices are exactly collinear (a `"straight"`
   local turn, neither matching nor disagreeing with the overall
   winding). Build a test case and verify whether `is_polygon_convex`
   correctly treats a collinear vertex as compatible with convexity.

## Definition of Done

- [ ] `geometry_lesson_37.py` exists and runs with no errors via `python
      geometry_lesson_37.py`.
- [ ] Running it prints the full 12-line sequence shown in Concept Unit
      2's Run It, ending in `True`, then `False` — matching this
      lesson's verified output exactly.
- [ ] You can explain, without looking at the file, what makes a polygon
      convex, using the "never turns both ways" definition.
- [ ] You can explain why `is_polygon_convex` computes the polygon's own
      overall orientation first, rather than assuming every polygon is
      wound the same way, using this lesson's own verified `cw_square`
      counter-example.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Test polygon convexity by comparing every local turn to the polygon's own overall winding"`,
      not `git commit -m "add is_polygon_convex"`.

Next: Lesson 38 — Convex Hulls, which reuses this lesson's own convexity
test as its stopping condition while building the smallest convex shape
enclosing an arbitrary set of points.
