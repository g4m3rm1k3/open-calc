# Lesson 43: Spatial Partitioning in 2D

**What you will build:** `cell_of`, bucketing any point into a grid cell
using this curriculum's first real floor division (`//`), and
`cells_adjacent`, checking whether two cells are close enough to matter.
Together, they let `find_close_pairs_gridded` skip most pairs of points
entirely — comparing distances only between points whose cells are the
same or touching — reusing the exact "prune first, test second" shape
Lesson 39's sweep line already established, built from a completely
different mechanism. The transferable problem: Lesson 39's sweep line
only ever ordered points along one axis. Real scattered 2D points don't
have a single natural sweep direction — a **uniform grid** partitions
the whole plane at once, so that two points can be ruled out as "too far
to matter" from their cell coordinates alone, without measuring a single
real distance.

**What you need to know first:** Lesson 39's own sweep-line strategy and
its "prune before testing" structure, Lesson 33's `for` loop and
accumulator pattern, and Lesson 9's `norm`.

**Assumed background (outside this curriculum):** unchanged from Lessons
1–42, except that floor division (`//`) — a real Python operator not yet
used in this curriculum's project code — receives full first-appearance
treatment in this lesson's first Concept Unit.

**Terms introduced in this lesson:**

- **Uniform grid** — a partition of space into equal-sized square cells,
  used to bucket points by position so that only points in the same or
  neighboring cells ever need to be compared directly. Why: this is a
  spatial analog of Lesson 39's own sweep line — instead of ordering
  points along one axis, it divides the whole plane at once, ruling out
  most pairs without ever computing a real distance between them.
- **Floor division (`//`)** — division that rounds its result down to the
  next whole number, discarding any fractional remainder. Why: this is
  exactly the operation that turns a plain coordinate into "which cell
  index does this fall into," the same way `%` already turned a count
  into "which position does this wrap to."

**Objects and methods used:**

None. `cell_of`, `cells_adjacent`, and `find_close_pairs_gridded` are
hand-authored project code, built from Lesson 2 and 9's own reused
functions.

---

## Concept Unit: Bucketing Points Into Grid Cells — First Use of Floor Division

### The Problem

Deciding whether two points are even worth comparing, without measuring
the real distance between them first, needs some cheap, approximate way
to describe "roughly where" each point sits — coarse enough to compute
instantly, but fine enough to actually rule most far-apart pairs out.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition,
  continuing the pattern of Lessons 1–42.
- **Files affected:** `geometry_lesson_43.py` — created, as a new file
  for this lesson.
- **Change type:** add (new file).
- **Location:** not applicable — a brand-new file has nothing to locate a
  position within.
- **Dependencies:** a Python 3 interpreter. Nothing else.

### The New Code

```python
def cell_of(point, cell_size):
    return (point[0] // cell_size, point[1] // cell_size)


points = [(1, 1), (2, 2), (12, 1), (13, 2), (1, 12), (25, 25)]
cell_size = 10

cells = []
for point in points:
    cells.append(cell_of(point, cell_size))

print(cells)
```

### The Updated Project

Skipped deliberately: the code above is the entire new file, with nothing
surrounding it yet — the same situation every lesson's first unit has
been in so far.

*A note on method:* `for` loops and `list.append` were both already
given full treatment (Lessons 27 and 38). Floor division itself is
covered in the Isolated Concept section below, since it's a genuinely
new operator.

### Isolated Concept: Floor Division (`//`)

This is exactly what `cell_of`'s own `point[0] // cell_size` above is
doing, isolated down to plain numbers:

```python
print(7 // 2)
print(-1 // 2)
```

Run:

```
3
-1
```

`7 // 2` proves the basic behavior: ordinary division, `7 / 2`, would be
`3.5`; floor division rounds that result *down* to `3`, discarding the
`0.5` entirely. `-1 // 2` proves it rounds down in the mathematical
sense, toward negative infinity, not merely toward zero: `-1 / 2` is
`-0.5`, and the next whole number *below* that is `-2`... but Python's
own floor division rounds to `-1` here specifically because `-1` is
already the input — dividing a smaller magnitude by a larger one lands
between `0` and `-1`, and floor rounds that down to `-1`. This is called
**floor division**, and it's the operation that turns a plain coordinate
into a whole-number cell index, with negative coordinates wrapping to
negative cell indices the same consistent way `%`'s own negative-index
behavior already did in Lesson 37.

### Discard

The two bare divisions above are now discarded — they exist only to
prove `//` rounds down, including for negative numbers, and will not
appear in the project again. `cell_of`'s own `point[0] // cell_size`,
shown in the real code above, works by the identical rule.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def cell_of(point, cell_size): ...` — first appearance: this lesson's
  own subject.
- `return (point[0] // cell_size, point[1] // cell_size)` — first
  appearance of `//` in real project code: dividing each coordinate by
  the cell size and rounding down turns a precise, continuous position
  into a whole-number `(column, row)` pair — the **uniform grid**'s own
  cell index.
- `points = [...]` — six scattered points, several of them close together
  in pairs, one far off on its own.
- `cell_size = 10` — each grid cell covers a `10`-by-`10` region.
- `cells = []`, the `for` loop, `.append(...)` — Lesson 38's own
  list-building pattern, reused: computing every point's own cell, in
  order.
- `print(cells)` — prints `[(0, 0), (0, 0), (1, 0), (1, 0), (0, 1), (2,
  2)]`: the first two points share a cell, the next two share a
  different cell, and the last point sits alone in its own, distant
  cell.

### CS Lens

Dividing continuous space into a fixed grid of cells, so that "roughly
where" something is becomes a cheap, whole-number lookup, is one of the
oldest and most widely used spatial indexing techniques in computing.

```
Also recognized in: video game collision systems (a uniform grid is
often the very first spatial structure a game engine uses to avoid
checking every object against every other object, exactly this lesson's
own motivation), geographic hashing (systems like Geohash and Uber's H3
divide the entire globe into a grid of cells for exactly this reason —
turning "is this location near that one" into a cheap comparison of
cell codes), and image processing (dividing an image into fixed blocks
for compression or parallel processing is the identical uniform-grid
idea, applied to pixels instead of points)
```

### SE Lens

The design principle is **trading a small amount of accuracy for a large
amount of speed**, by describing a point's position coarsely instead of
exactly. The alternative not chosen: keep every point's own exact
coordinates as the only way to compare positions, the way every lesson
before this one has.

That alternative never loses any precision. The real cost it pays: with
only exact coordinates to work from, there's no cheap way to ask "is
this point anywhere near that one" without directly measuring — exactly
Lesson 36's own exhaustive pairwise check. A grid cell is a deliberately
coarser description, precise enough to rule out most distant pairs
instantly, while pushing the genuinely precise question — the real
distance — to only the pairs that survive the coarse check first.

### Commands Needed

`python geometry_lesson_43.py` — same interpreter and command as every
prior lesson.

### Run It

```
[(0, 0), (0, 0), (1, 0), (1, 0), (0, 1), (2, 2)]
```

Verified by actually running the file above.

### Connection

Every point now has a cell. The next unit uses those cells to decide
which pairs of points are even worth comparing directly.

---

## Concept Unit: Only Comparing Points in Nearby Cells

### The Problem

Two points in the same cell might be close; two points in neighboring
cells might be close too, if they sit near a shared edge. Two points in
cells two or more steps apart never can be, given how a uniform grid's
own cells are laid out — deciding which case applies needs nothing more
than comparing cell coordinates.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch addition.
- **Files affected:** `geometry_lesson_43.py` — modified.
- **Change type:** add.
- **Location:** appended below the `print(cells)` line added in Concept
  Unit 1.
- **Dependencies:** Concept Unit 1's `cell_of`, `points`, `cell_size`,
  `cells`.

### The New Code

```python
def cells_adjacent(cell1, cell2):
    dx = cell1[0] - cell2[0]
    dy = cell1[1] - cell2[1]

    if dx < -1:
        return False
    if dx > 1:
        return False
    if dy < -1:
        return False
    if dy > 1:
        return False
    return True


print(cells_adjacent((0, 0), (1, 0)))
print(cells_adjacent((0, 0), (0, 1)))
print(cells_adjacent((0, 0), (2, 2)))
print(cells_adjacent((1, 0), (0, 1)))


import math


def subtract_points(a, b):
    return (a[0] - b[0], a[1] - b[1])


def dot_product(a, b):
    return a[0] * b[0] + a[1] * b[1]


def norm(v):
    return math.sqrt(dot_product(v, v))


def find_close_pairs_gridded(points, cell_size, threshold):
    cells = []
    for point in points:
        cells.append(cell_of(point, cell_size))

    checked_count = 0
    close_count = 0
    for i in range(len(points)):
        for j in range(i + 1, len(points)):
            if cells_adjacent(cells[i], cells[j]):
                checked_count = checked_count + 1
                distance = norm(subtract_points(points[i], points[j]))
                if distance < threshold:
                    close_count = close_count + 1

    return (close_count, checked_count)


def find_close_pairs_brute_force(points, threshold):
    checked_count = 0
    close_count = 0
    for i in range(len(points)):
        for j in range(i + 1, len(points)):
            checked_count = checked_count + 1
            distance = norm(subtract_points(points[i], points[j]))
            if distance < threshold:
                close_count = close_count + 1
    return (close_count, checked_count)


print(find_close_pairs_gridded(points, cell_size, 5))
print(find_close_pairs_brute_force(points, 5))
```

### The Updated Project

```python
def cell_of(point, cell_size):
    return (point[0] // cell_size, point[1] // cell_size)


points = [(1, 1), (2, 2), (12, 1), (13, 2), (1, 12), (25, 25)]
cell_size = 10

cells = []
for point in points:
    cells.append(cell_of(point, cell_size))

print(cells)


def cells_adjacent(cell1, cell2):                                        # ← new
    dx = cell1[0] - cell2[0]                                            # ← new
    dy = cell1[1] - cell2[1]                                            # ← new
                                                                           # ← new
    if dx < -1:                                                         # ← new
        return False                                                    # ← new
    if dx > 1:                                                          # ← new
        return False                                                    # ← new
    if dy < -1:                                                         # ← new
        return False                                                    # ← new
    if dy > 1:                                                          # ← new
        return False                                                    # ← new
    return True                                                          # ← new


print(cells_adjacent((0, 0), (1, 0)))                                    # ← new
print(cells_adjacent((0, 0), (0, 1)))                                    # ← new
print(cells_adjacent((0, 0), (2, 2)))                                    # ← new
print(cells_adjacent((1, 0), (0, 1)))                                    # ← new


import math                                                               # ← new


def subtract_points(a, b):                                               # ← new
    return (a[0] - b[0], a[1] - b[1])                                   # ← new


def dot_product(a, b):                                                   # ← new
    return a[0] * b[0] + a[1] * b[1]                                    # ← new


def norm(v):                                                             # ← new
    return math.sqrt(dot_product(v, v))                                 # ← new


def find_close_pairs_gridded(points, cell_size, threshold):              # ← new
    cells = []                                                          # ← new
    for point in points:                                                # ← new
        cells.append(cell_of(point, cell_size))                        # ← new
                                                                           # ← new
    checked_count = 0                                                   # ← new
    close_count = 0                                                     # ← new
    for i in range(len(points)):                                       # ← new
        for j in range(i + 1, len(points)):                            # ← new
            if cells_adjacent(cells[i], cells[j]):                     # ← new
                checked_count = checked_count + 1                      # ← new
                distance = norm(subtract_points(points[i], points[j]))  # ← new
                if distance < threshold:                                # ← new
                    close_count = close_count + 1                      # ← new
                                                                           # ← new
    return (close_count, checked_count)                                 # ← new


def find_close_pairs_brute_force(points, threshold):                     # ← new
    checked_count = 0                                                   # ← new
    close_count = 0                                                     # ← new
    for i in range(len(points)):                                       # ← new
        for j in range(i + 1, len(points)):                            # ← new
            checked_count = checked_count + 1                          # ← new
            distance = norm(subtract_points(points[i], points[j]))     # ← new
            if distance < threshold:                                   # ← new
                close_count = close_count + 1                          # ← new
    return (close_count, checked_count)                                 # ← new


print(find_close_pairs_gridded(points, cell_size, 5))                    # ← new
print(find_close_pairs_brute_force(points, 5))                           # ← new
```

The file now finds every genuinely close pair among six scattered
points, comparing far fewer pairs than an exhaustive check would need.

### Mechanical Walkthrough

Every syntactic element in the New Code block above, in order:

- `def cells_adjacent(cell1, cell2): ...` — first appearance: this
  lesson's own cheap proximity test.
- `dx = cell1[0] - cell2[0]`, `dy = cell1[1] - cell2[1]` — already-basic
  reuse, the difference between the two cells' own column and row.
- `if dx < -1: return False` through `if dy > 1: return False` — first
  appearance of the actual rule: two cells count as adjacent only if
  they differ by at most `1` step in either direction — covering the
  same cell, the four cells sharing an edge, and the four sharing only a
  corner.
- `return True` — reached only when every one of those four guard
  clauses passes.
- The four `print(cells_adjacent(...))` calls — `True`, `True`, `False`,
  `True`: cells one step apart, horizontally, vertically, or diagonally,
  all count as adjacent; cells two steps apart in both directions do
  not.
- `import math` through `def norm(v): ...` — Lesson 9, 2, and 7's own
  code, retyped unchanged. No re-explanation owed, per the Repetition
  Rule.
- `def find_close_pairs_gridded(points, cell_size, threshold): ...` —
  first appearance: combining this lesson's own grid with a real
  distance check.
- `cells = []`, the `for` loop, `.append(...)` — already-basic reuse,
  identical to Concept Unit 1's own setup, computed fresh inside this
  function.
- The nested loop through `if cells_adjacent(cells[i], cells[j]):` —
  first appearance of using the grid as an actual filter: only pairs
  whose cells are the same or adjacent ever reach the expensive distance
  calculation below.
- `distance = norm(subtract_points(points[i], points[j]))`, `if distance
  < threshold: close_count = close_count + 1` — already-basic reuse,
  Lesson 33's own accumulator pattern.
- `return (close_count, checked_count)` — already-basic tuple
  construction, mirroring Lesson 39's own two-number report.
- `def find_close_pairs_brute_force(...): ...` — Lesson 36's own
  exhaustive shape, checking every pair with no grid filtering at all.
- `print(find_close_pairs_gridded(points, cell_size, 5))` — prints
  `(2, 10)`: `2` genuinely close pairs found, using only `10` real
  distance checks.
- `print(find_close_pairs_brute_force(points, 5))` — prints `(2, 15)`:
  the identical `2` close pairs, found by checking all `15` possible
  pairings among six points.

### CS Lens

Using a coarse spatial description to prune most candidate pairs before
ever running an expensive exact test is the same broad-phase-then-
narrow-phase structure Lesson 42's own `is_ear` already used for
convexity versus containment — here applied at the scale of an entire
point set instead of one candidate triangle.

```
Also recognized in: physics engine broad-phase collision detection
(nearly every real-time physics engine partitions its world into a grid
or similar structure specifically to avoid Lesson 36's own exhaustive
pairwise check, at a scale where checking every object against every
other object would be far too slow), particle simulation (finding which
particles are close enough to interact — for gravity, fluid dynamics, or
collision — uses this identical grid-bucketing technique, often called
"spatial hashing"), and database spatial indexes (a geographic database
querying "what's near this location" uses a grid-like index for the
identical reason, rather than scanning every stored record)
```

### SE Lens

The design principle is **choosing the pruning structure that matches
the shape of the data**, rather than defaulting to the same strategy
every time. The alternative not chosen: apply Lesson 39's own sweep-line
strategy here instead of building a grid — sorting all six points by `x`
and using a `break`-based scan the same way that lesson did for
segments.

That alternative would work for these six points, and a sweep line
generalizes to more dimensions less naturally than a grid does. The real
tradeoff: a sweep line's own efficiency comes from a single sorted
order, which works well when objects are reasonably spread along one
axis; a uniform grid's efficiency comes from partitioning *both*
dimensions at once, which handles points scattered broadly across a
2D area — like this lesson's own — more evenly. Neither strategy is
universally better; which one fits depends on how the actual data is
distributed.

### Commands Needed

`python geometry_lesson_43.py` — same command as Concept Unit 1. Nothing
new here.

### Run It

```
[(0, 0), (0, 0), (1, 0), (1, 0), (0, 1), (2, 2)]
True
True
False
True
(2, 10)
(2, 15)
```

Verified by actually running the updated file above.

### Connection

The grid-based version and the brute-force version agree on every
genuinely close pair, while checking fewer of them. What Breaks Without
This proves that agreement depends entirely on choosing a cell size that
actually fits the distance being searched for.

---

## Connect the Pieces

Six points, traced through everything this lesson built, start to
finish:

1. `points` are bucketed into cells with `cell_size = 10`: two pairs
   share cells, one point sits alone.
2. `cells_adjacent` correctly recognizes same, edge-sharing, and
   corner-sharing cells as close enough to check, and cells two or more
   steps apart as too far.
3. `find_close_pairs_gridded` checks only the `10` pairs whose cells
   pass that test, finding `2` genuinely close pairs.
4. `find_close_pairs_brute_force` checks all `15` possible pairs and
   finds the identical `2` — proof the grid-based pruning lost nothing,
   while doing less work to get there.

## What Breaks Without This

`find_close_pairs_gridded`'s own correctness depends on `cell_size`
being chosen sensibly relative to `threshold` — nothing in the function
itself checks that relationship. Prove what happens when the cell size
is far smaller than the distance being searched for:

```python
p1 = (0.5, 0)
p2 = (4.5, 0)

too_small_cell_size = 1

cell1 = cell_of(p1, too_small_cell_size)
cell2 = cell_of(p2, too_small_cell_size)

print(cell1, cell2)
print(cells_adjacent(cell1, cell2))
print(norm(subtract_points(p1, p2)))
```

```
(0.0, 0) (4.0, 0)
False
4.0
```

Verified by actually running this. `p1` and `p2` are genuinely `4.0`
units apart — well within a threshold of `5`, the same threshold this
lesson's own main example used. But with `cell_size = 1` instead of
`10`, the two points land in cells `4` steps apart, and
`cells_adjacent` correctly reports `False` for cells that far apart —
correctly, *by its own rule*, but wrongly for the actual question being
asked. `find_close_pairs_gridded`, built on top of this, would never
even compute the real distance between `p1` and `p2` at all — it would
silently skip a pair that's genuinely closer than the threshold, with no
error or warning. This is the real cost of pruning before testing: a
grid's own cell size has to be chosen at least as large as the distance
being searched for, or points that should be compared can end up too
many cells apart to ever be checked — the exact same class of mistake as
choosing too tight a tolerance in Lesson 18, expressed through a
completely different mechanism.

## Exercises

1. Using `find_close_pairs_gridded`, find the largest `cell_size` that
   still correctly finds both close pairs in this lesson's own `points`
   list at `threshold = 5`, and explain why a cell size that's too large
   (covering the whole point set in one cell) stops providing any real
   pruning benefit at all, even though it stays correct.
2. Build a scattered set of `12` points across a wide area, with only two
   of them genuinely close together. Compare `checked_count` between
   `find_close_pairs_gridded` and `find_close_pairs_brute_force`, and
   confirm the grid version's advantage grows as the point set spreads
   out further.
3. Using `cell_of` and `cells_adjacent`, explain in your own words why a
   uniform grid's own adjacency check (`dx`/`dy` within `1`) would need
   to become a *larger* range — checking cells `2` or more steps away —
   if `threshold` were made larger than `cell_size` itself, rather than
   smaller. Verify your reasoning with a concrete example.

## Definition of Done

- [ ] `geometry_lesson_43.py` exists and runs with no errors via `python
      geometry_lesson_43.py`.
- [ ] Running it prints the full 6-line sequence shown in Concept Unit
      2's Run It, ending in `(2, 10)`, then `(2, 15)` — matching this
      lesson's verified output exactly.
- [ ] You can explain, without looking at the file, what `//` computes
      differently from `/`, using this lesson's own verified `7 // 2`
      and `-1 // 2` results.
- [ ] You can explain why `cell_size` has to be chosen relative to the
      distance being searched for, using this lesson's own verified
      `p1`/`p2` counter-example.
- [ ] Commit your work with a message explaining *why* it exists, not just
      what changed — for example:
      `git commit -m "Partition points into a uniform grid to prune distance checks, and prove cell size must match the search threshold"`,
      not `git commit -m "add spatial grid"`.

Next: Lesson 44 — Robust 2D Geometry, which returns to every honestly
disclosed limitation this section has left open — Lesson 35's vertex-
straddling ray cast, Lesson 34's self-intersecting bowtie — and addresses
them directly, rather than deferring them again.
