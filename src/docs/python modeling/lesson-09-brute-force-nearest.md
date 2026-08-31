# Lesson 9: Brute-Force Nearest Neighbor — `NearestSurfaceFinder`

**What you will build:** a new class, `NearestSurfaceFinder`, in a new
file `src/vector3d/nearest_surface_finder.py` — Phase C's first lesson,
and this project's first *search* algorithm, as opposed to every class
built so far (Phases A and B), which either represented geometry
directly or read it from a file. Given a `Mesh` and a query point,
`NearestSurfaceFinder` answers "which triangle is closest to this
point?" by checking every single triangle — deliberately the slowest,
simplest possible way to answer that question, and deliberately built
first, before Lesson 11's faster version, so the *correctness* of
"closest" is settled before this project ever tries to make finding it
fast.

**What you need to know first:** Phase A in full (`Vector3`, `Triangle`
— specifically `Triangle.centroid()`, Lesson 5 — and `Mesh`, Lesson 6).
Nothing from Phase B (`BinaryReader`/`STLReader`) is needed directly by
this lesson, though the `Mesh` objects this class searches over could
just as easily come from Lesson 8's `STLReader` as from hand-typed
`Triangle`s.

**Terms used in this lesson:**
- **linear search / brute-force search** — checking every single item in
  a collection, one at a time, to find the one that best matches some
  condition — here, "closest to a query point." It exists as the most
  direct, most obviously-correct way to answer a search question, at the
  cost of taking longer the more items there are to check — checking
  twice as many triangles takes roughly twice as long, with no shortcut.
- **running best (sentinel-tracked)** — a pattern for finding the best
  item in a collection by keeping track of "the best one seen so far"
  in a variable, updating it only when something better turns up, rather
  than first collecting every candidate into a list and reducing it
  afterward (the approach `Mesh.bounds()`, Lesson 6, took with `min()`/
  `max()`). It exists as the direct, memory-efficient alternative Lesson
  6's own SE Lens named but didn't build — one item examined and
  discarded at a time, never a full list held in memory at once.
- **`None`** — Python's built-in value representing "nothing here yet" /
  "no value." Used here as a **sentinel** — a special starting value a
  running-best variable is initialized to, specifically so the very
  first real candidate examined always counts as an improvement (since
  nothing can be compared against "nothing" except by explicitly
  checking for it first).
- **`is` vs. `==`** — Lesson 3 already introduced `is` as an identity
  check ("the same object in memory") separate from `==` (Lesson 3's
  `__eq__`, "counts as equal by value"). This lesson is the first time
  `is` actually matters practically in this project: confirming that
  the *exact* `Triangle` object found by a search is the one expected,
  not merely one that happens to hold equal coordinates.
- **approximation (deliberate, temporary)** — an intentionally
  simplified version of a computation, accurate enough to build and test
  the surrounding structure, with a known, named gap to be closed later.
  This lesson's own `find_closest` measures distance to each triangle's
  *centroid* (Lesson 5) rather than the true closest point anywhere on
  the triangle's surface — a real difference, not a rounding error —
  deliberately deferred to Lesson 10 rather than solved here, so this
  lesson can focus entirely on the search *structure* (how to scan
  every triangle and keep the best one) without also solving the
  separate geometry problem of exact point-to-triangle distance at the
  same time.

**Objects and methods used:**

- **`NearestSurfaceFinder`**
  - *What it is:* a class that finds, for any query point, which
    triangle in a given mesh is closest to it.
  - *Implementation:* `class NearestSurfaceFinder:` with
    `__init__(self, mesh)` storing a `Mesh` as `self.mesh`, plus a
    `find_closest` method built in this lesson's second Concept Unit.
  - *Its use:* the direct, from-scratch equivalent of `diff3d.py`'s
    `find_closest` function —
    `_, closest = mesh.find_closest_cell(points, return_closest_point=True)`
    — though this lesson's version is deliberately approximate (this
    lesson's own term), using triangle centroids rather than true
    closest-surface-points; Lesson 10 closes that gap.
  - *Type:* a plain class, no parent class, composed of a `Mesh` (Phase
    A) — the first class in this project whose whole purpose is
    answering a query about an already-built mesh, rather than
    representing geometry or building a mesh from a file.
  - *Responsibility:* to search every triangle in `self.mesh` for the
    one closest to a given query point, and report which one it is.
  - *Depends on:* an already-built `Mesh` (Lesson 6), handed to it at
    construction time.
  - *Connects to:* nothing calls `NearestSurfaceFinder` yet within this
    project beyond this lesson's own verification; Lesson 15
    (multi-pass alignment) will use it (or its Lesson 11 replacement)
    directly, the same role `find_closest` plays in the original
    script's `sqdists`.
  - *Shape:* the first class in a new architectural role — search/query
    — sitting alongside `Mesh` (which it reads but never modifies)
    rather than on top of it the way `Triangle` sits on top of
    `Vector3`.

- **`NearestSurfaceFinder.find_closest`**
  - *What it is:* an instance method returning whichever triangle in
    `self.mesh` is closest (by this lesson's centroid approximation) to
    a given query point.
  - *Implementation:*
    ```
    def find_closest(self, point):
        best_triangle = None
        best_distance = None
        for triangle in self.mesh.triangles:
            distance = (triangle.centroid() - point).length()
            if best_distance is None or distance < best_distance:
                best_distance = distance
                best_triangle = triangle
        return best_triangle
    ```
    — takes `self` and a `Vector3` query point, returns a `Triangle`.
  - *Its use:* the actual search performed for every query point
    `align3d()`'s `sqdists` function evaluates in the original script —
    this lesson's version checked one point at a time; later lessons
    (Lesson 12 onward) will call it repeatedly, once per sampled point.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to examine every triangle in the mesh exactly
    once, and correctly report whichever one minimizes distance
    (measured, in this lesson, to that triangle's centroid) to the given
    point.
  - *Depends on:* `self.mesh.triangles` (Lesson 6), each `Triangle`'s
    `centroid()` (Lesson 5), and `Vector3.__sub__`/`Vector3.length`
    (Lessons 2 and 4) to compute each distance.
  - *Connects to:* calls `Triangle.centroid()` once per triangle, and
    `Vector3.__sub__`/`Vector3.length` once per triangle as well. Lesson
    10 will modify this method's *distance calculation* specifically,
    without changing its overall scanning structure at all.
  - *Shape:* `NearestSurfaceFinder`'s own layer — this project's first
    linear-search algorithm, built directly on top of Phase A's
    geometry methods.

---

## Concept Unit: Tracking the Best Result While Scanning

### The Problem

`Mesh.bounds()` (Lesson 6) found a mesh's overall minimum and maximum by
building three full lists (`xs`, `ys`, `zs`) and handing them to Python's
built-in `min()`/`max()` — and Lesson 6's own SE Lens named the
alternative it didn't build: tracking a running best value directly
inside the loop, comparing each new candidate against the best seen so
far, with no list ever built at all. This lesson needs exactly that
running-best approach — not because a list-then-`min()` approach
couldn't work for finding the closest triangle too, but because this
lesson needs to remember *which triangle* produced the best distance,
not just the distance number itself, and `min()` alone doesn't hand back
"which item in the original collection produced this."

> **Before reading on, try this yourself:** imagine scanning a list of
> numbers to find the one closest to some target value, keeping a
> running "best so far" as you go — the same running-best idea Lesson
> 6's SE Lens named but didn't build. What should the running-best
> variable be set to *before* the loop even starts, given that nothing
> has been examined yet, and the very first number should always count
> as the best "so far" purely because it's the only one examined at that
> point? Python's `None` (this lesson's own term) is one real answer —
> what check would the loop body need to make, on every single pass,
> to correctly handle "nothing examined yet" differently from every
> pass after the first?

### Introduce the Concept in Isolation

```python
# Throwaway lab: finding the closest number to a target by scanning, tracking the best as we go
numbers = [17, 42, 8, 55, 23]
target = 25

best_number = None
best_diff = None
for n in numbers:
    diff = abs(n - target)
    if best_diff is None or diff < best_diff:
        best_diff = diff
        best_number = n

print(best_number, best_diff)
```

Real output from running this:

```
23 2
```

`23` really is the closest number to `25` in this list (`|23-25|=2`,
smaller than every other number's distance: `17` is `8` away, `42` is
`17` away, `8` is `17` away, `55` is `30` away) — confirmed by real
arithmetic, not assumed. The `best_diff is None or diff < best_diff`
check answers this Concept Unit's own Socratic prompt directly: on the
very first pass (`n = 17`), `best_diff` is still `None` (this lesson's
own **sentinel**), so the check's left side, `best_diff is None`, is
`True` — Python's `or` short-circuits there, `diff < best_diff` never
even runs (it couldn't — comparing a real number against `None` with
`<` would raise an error), and `17` unconditionally becomes the first
"best so far." Every pass after that has a real number in `best_diff`,
so the comparison genuinely evaluates `diff < best_diff` each time,
updating only when something strictly closer turns up.

### Discard the Throwaway Example

This scratch number-scanning code is discarded now. The real project
version scans `Triangle` objects instead of plain numbers, and lives in
a new file.

### Project Change

- **Reference Source:** `diff3d.py`'s `find_closest` function:
  `_, closest = mesh.find_closest_cell(points, return_closest_point=True)`.
  There is no lower-level running-best loop to quote — `pyvista`'s
  `find_closest_cell` performs its own search entirely internally,
  using a spatial data structure this project doesn't build until
  Lesson 11. This Concept Unit factors out the general running-best
  *pattern* the real search (built in this lesson's second Concept
  Unit) will use.
- **Files affected:** none yet — this Concept Unit's own pattern is
  proven only in the throwaway lab above; the real project file is
  created in the next Concept Unit, where the pattern is applied to
  actual `Triangle` objects.
- **Change type:** N/A for this Concept Unit specifically.
- **Location:** N/A.
- **Dependencies:** N/A.

### The New Code

N/A for this Concept Unit — the running-best pattern itself is proven
in the throwaway lab above; the next Concept Unit is where it becomes
real, committed project code, applied to `Triangle` objects instead of
plain numbers.

### The Updated Project

N/A for this Concept Unit, for the same reason.

### Mechanical Walkthrough

- **`best_number = None`, `best_diff = None`** — two ordinary variable
  assignments, both to Python's built-in `None` — the sentinel value
  (this lesson's own term) marking "nothing examined yet," chosen
  specifically because `None` can never legitimately equal or be less
  than a real number, making an explicit `is None` check the safe way
  to detect "this is the first pass."
- **`for n in numbers:`** — an ordinary `for` loop (already familiar),
  binding `n` to each number in `numbers` in turn.
- **`diff = abs(n - target)`** — `abs(...)`, Python's built-in absolute
  value function (already familiar), applied to `n - target` — ordinary
  numeric subtraction — producing how far `n` is from `target`,
  regardless of which one is larger.
- **`if best_diff is None or diff < best_diff:`** — `is None`, Python's
  identity check (Lesson 3's own term) against the sentinel — the
  correct way to test for `None` specifically (rather than `== None`,
  which works but is not the conventional or recommended form); `or`,
  Python's short-circuit boolean operator (Lesson 3 already used `and`
  this same way for `Vector3.__eq__`) — if the left side is `True`, the
  right side (`diff < best_diff`) is never evaluated at all, which is
  exactly what avoids comparing a real number against `None` on the
  first pass; `diff < best_diff` — ordinary numeric comparison, `True`
  only when the current candidate is strictly closer than the best
  found so far.
- **`best_diff = diff`, `best_number = n`** — two ordinary variable
  reassignments, replacing the running best with the current candidate,
  executed only when the `if` condition above was `True`.

### CS Lens

This is the **running extremum / online algorithm** pattern — computing
a minimum (or maximum) by processing one item at a time, in a single
pass, without ever needing to hold every item in memory simultaneously —
distinct from, though related to, the **reduction** pattern Lesson 6's
CS Lens named for `min()`/`max()`, which requires the full collection to
already exist as a sequence before it can be reduced.

Also recognized in: streaming data processing (computing a running
minimum/maximum temperature from a live sensor feed, one reading at a
time, with no way to ever "go back" and hold every past reading at
once); leaderboard/high-score tracking (comparing each new score against
the current best on submission, never re-scanning every past score);
online algorithms broadly, a real subfield of computer science studying
exactly this constraint — making correct decisions from data seen one
piece at a time, without the ability to look ahead or hold everything
seen so far.

### SE Lens

The principle is **choosing the data-holding strategy that matches what
you actually need to remember**. `Mesh.bounds()` (Lesson 6) needed six
final numbers and nothing else, so building lists and reducing them with
`min()`/`max()` was reasonable. This lesson's search needs to remember
*which item* produced the best result, not just the number itself — a
`min()` call alone can't answer "which one," so a running-best variable
that tracks both the number *and* the associated item together is the
right tool here, not a stylistic preference.

The alternative not chosen: collect every `(diff, n)` pair into a list,
then find the minimum afterward using Python's `min()` with a `key=`
argument (a real, valid, more advanced technique not used in this
curriculum) or by sorting the whole list and taking the first result.
Both would work, and both cost more memory than necessary for what this
lesson actually needs: one running-best value replaces the entire
collection the moment a full pass finishes, while a full list of pairs
stays around, unused, after the answer is already found.

### Commands Needed

None — this Concept Unit's code is throwaway-lab-only.

### Run It

Already shown above — the throwaway lab itself is this Concept Unit's
only real execution, since no project file exists yet for this specific
pattern in isolation.

### Connect

This running-best pattern, proven here on plain numbers, is exactly
what the next Concept Unit applies to real `Triangle` objects — scanning
every triangle in a mesh, tracking whichever one is closest to a query
point so far.

---

## Concept Unit: Scanning Every Triangle — `NearestSurfaceFinder`

### The Problem

`diff3d.py`'s `find_closest`/`mesh.find_closest_cell` answers, for any
point, "which part of this mesh is closest?" — used constantly by
`align3d()`'s `sqdists` and by `sample_points()`. Nothing built so far
in this project can answer that question at all; `Mesh` (Lesson 6) can
report its own bounds and center, but has no way to compare its
individual triangles against an arbitrary query point.

> **Before reading on, try this yourself:** the previous Concept Unit's
> running-best pattern scanned plain numbers, comparing each one's
> distance from a target. `Mesh.triangles` (Lesson 6) is a list of
> `Triangle` objects, not numbers — but `Triangle.centroid()` (Lesson 5)
> already turns any triangle into a single `Vector3` point, and
> `Vector3.__sub__`/`Vector3.length` (Lessons 2 and 4) already compute
> the distance between two points. Given all three of those already
> exist, what would the loop body need to compute, for each `triangle`
> in `self.mesh.triangles`, to measure "how far is this triangle
> (approximately) from the query point"? (This lesson's own Terms
> section already named the specific approximation being made here —
> centroid distance, not true closest-surface-point — so the answer
> doesn't need to solve exact point-to-triangle geometry, only reuse
> what Lesson 5 and Lesson 4 already built.)

### Introduce the Concept in Isolation

No new throwaway lab for this Concept Unit: the running-best pattern was
already fully isolated and proven in the previous Concept Unit's lab,
and `Triangle.centroid()`/`Vector3.__sub__`/`Vector3.length` were each
already isolated and proven in Lessons 5, 2, and 4 respectively. What's
new here is only the *combination* — applying the already-proven
running-best pattern to already-proven distance-computation methods,
directly in real project code.

### Discard the Throwaway Example

Not applicable to this Concept Unit, for the reason stated above.

### Project Change

- **Reference Source:** `diff3d.py`'s `find_closest` function, in full:
  `_, closest = mesh.find_closest_cell(points, return_closest_point=True)`.
  This method is the direct (though deliberately approximate — this
  lesson's own term) replacement for it, differing in one honest,
  named way: it measures distance to each triangle's centroid, not the
  true closest point anywhere on the triangle's surface (Lesson 10
  closes that gap); it also operates on one query point at a time,
  where the original function accepts a whole batch of points at once
  (a difference this rebuild's later lessons will handle by calling
  this method once per point, rather than building batch support here).
- **Files affected:** create `src/vector3d/nearest_surface_finder.py`
  (new file).
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** `Mesh` (Lesson 6), `Triangle.centroid` (Lesson 5),
  `Vector3.__sub__` (Lesson 2), `Vector3.length` (Lesson 4).

### The New Code

Type this into `src/vector3d/nearest_surface_finder.py`:

```python
class NearestSurfaceFinder:
    def __init__(self, mesh):
        self.mesh = mesh

    def find_closest(self, point):
        best_triangle = None
        best_distance = None
        for triangle in self.mesh.triangles:
            distance = (triangle.centroid() - point).length()
            if best_distance is None or distance < best_distance:
                best_distance = distance
                best_triangle = triangle
        return best_triangle
```

### The Updated Project

This is the whole new file — nothing larger to return to yet (the same
brand-new-file exemption used throughout this curriculum):

```
 1  class NearestSurfaceFinder:
 2      def __init__(self, mesh):
 3          self.mesh = mesh
 4
 5      def find_closest(self, point):
 6          best_triangle = None
 7          best_distance = None
 8          for triangle in self.mesh.triangles:
 9              distance = (triangle.centroid() - point).length()
10              if best_distance is None or distance < best_distance:
11                  best_distance = distance
12                  best_triangle = triangle
13          return best_triangle
```

As a whole, this file now defines a buildable
`NearestSurfaceFinder(mesh)` that, for any query point, scans every
triangle in the mesh exactly once and correctly reports whichever one's
centroid is closest — this project's first real answer, even if
deliberately approximate, to "which part of this mesh is closest to
this point?"

### Mechanical Walkthrough

- **`class NearestSurfaceFinder:`** and **`def __init__(self, mesh):`**
  / **`self.mesh = mesh`** — the same `class`/`__init__`/attribute-
  assignment pattern from every class built so far, storing the
  `Mesh` this instance will search over.
- **`def find_closest(self, point):`** — `def`; `find_closest`, an
  ordinary instance method name (matching the original script's own
  `find_closest` function name, deliberately — a real, if approximate,
  port); `self` and one parameter, `point` — the query `Vector3`.
- **`best_triangle = None`, `best_distance = None`** — the identical
  sentinel-initialization pattern from the previous Concept Unit's lab,
  applied here to a `Triangle` (rather than a number) and its associated
  distance.
- **`for triangle in self.mesh.triangles:`** — an ordinary `for` loop
  over `self.mesh.triangles` (Lesson 6), the same loop shape
  `Mesh.bounds()` itself used, binding `triangle` to one full `Triangle`
  object per pass.
- **`distance = (triangle.centroid() - point).length()`** —
  `triangle.centroid()` (Lesson 5) computes that triangle's center as a
  `Vector3`; `- point` — `Vector3.__sub__` (Lesson 2), computing the
  vector from the query point to that centroid; `.length()`
  (Lesson 4) — reducing that vector to a single distance number, the
  same three-method chain (`centroid`, `__sub__`, `length`) this
  Concept Unit's own Socratic prompt asked you to assemble from
  already-built pieces.
- **`if best_distance is None or distance < best_distance:`** — the
  identical sentinel-check pattern from the previous Concept Unit,
  applied here to real computed distances instead of plain-number
  differences.
- **`best_distance = distance`, `best_triangle = triangle`** — the same
  running-best update pattern, now updating both the best distance
  *and* the specific `Triangle` object that produced it — the exact
  capability plain `min()` alone (Lesson 6's own tool) couldn't have
  provided, since `min()` reports only a value, never "which original
  item produced it," unless given more machinery than this project has
  built.
- **`return best_triangle`** — `return`, handing back whichever
  `Triangle` survived the entire scan as the closest (by centroid
  distance) to the query point — notably, the distance itself is
  computed and compared throughout the method but never returned; only
  the winning triangle is.

### CS Lens

This is **linear search** (this lesson's own term) — checking every
element of a collection once, taking time proportional to the
collection's size (twice as many triangles takes roughly twice as
long) — combined with the previous Concept Unit's **running extremum**
pattern to additionally track *which* element won, not just the winning
value itself.

Also recognized in: any "find the nearest X" problem before a smarter
data structure is introduced (exactly the arc this project's own
roadmap follows: this lesson's linear search, replaced by Lesson 11's
`SpatialGrid`); recommendation systems' naive nearest-neighbor baseline
(comparing a user's profile against every other user before any
indexing or clustering is applied); collision detection in simple game
engines (checking every other object in the scene against the player,
before any spatial partitioning is added — the exact same performance
problem this project's own Lesson 11 exists to solve, in a completely
different domain).

### SE Lens

The principle here is **correctness before performance** — this lesson
deliberately builds the slow, obviously-correct version of nearest-
triangle search first, with no spatial indexing, no early-exit
optimizations, nothing beyond "check everything, remember the best."

The alternative not chosen, worth naming plainly since it's the entire
point of Phase C's own progression: skip straight to Lesson 11's
`SpatialGrid`-based approach, never building this lesson's brute-force
version at all. That would eventually be faster to *read* end-to-end
(one lesson instead of three), but it would remove the ability to
verify Lesson 11's faster version against a known-correct, easy-to-
reason-about baseline — a real engineering practice, not just a
pedagogical convenience: a fast algorithm that's subtly wrong is far
harder to debug without a slow-but-obviously-correct version to compare
its answers against. The literal cost being accepted here, stated
honestly: this method's runtime grows directly with the number of
triangles in the mesh, with no shortcut — for `stock*.stl` files
(referenced in the original script) with many thousands of triangles,
called repeatedly (once per sampled point, in later lessons), this
becomes genuinely, not just theoretically, slow. That cost is
deliberately accepted for now and named directly as the reason Lesson
11 exists.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3
from vector3d.triangle import Triangle
from vector3d.mesh import Mesh
from vector3d.nearest_surface_finder import NearestSurfaceFinder

t1 = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0), Vector3(0.0, 2.0, 0.0))
t2 = Triangle(Vector3(1.0, 1.0, 3.0), Vector3(3.0, 1.0, 3.0), Vector3(1.0, 3.0, 3.0))
mesh = Mesh([t1, t2])

print(t1.centroid())
print(t2.centroid())

finder = NearestSurfaceFinder(mesh)
query = Vector3(0.0, 0.0, 0.0)
closest = finder.find_closest(query)
print(closest is t1)
print(closest is t2)
print(closest.centroid())

query2 = Vector3(2.0, 2.0, 3.0)
closest2 = finder.find_closest(query2)
print(closest2 is t2)
"
```

Real output:

```
Vector3(0.6666666666666666, 0.6666666666666666, 0.0)
Vector3(1.6666666666666667, 1.6666666666666667, 3.0)
True
False
Vector3(0.6666666666666666, 0.6666666666666666, 0.0)
True
```

The same two-triangle mesh used throughout Lessons 6 and 8: `t1`'s
centroid sits much closer to the origin (`query`) than `t2`'s does, and
`finder.find_closest(query) is t1` — checked with `is` (this lesson's
own term), not `==` — confirms the search returned the *exact* `t1`
object, not merely an equal-looking one. A second query point, `(2, 2,
3)`, sitting much closer to `t2`'s own centroid, correctly flips the
result: `closest2 is t2` comes back `True`.

### Connect

`NearestSurfaceFinder` can now answer "which triangle is closest?" for
any point, but the honest gap this lesson named up front — measuring
distance to a centroid rather than the true closest point on a
triangle's actual surface — is still open. Two query points close to a
triangle's edge, rather than near its center, could genuinely be
misclassified by this lesson's approximation. Lesson 10 replaces the
centroid-distance calculation with the real geometry: the actual
closest point anywhere on a triangle's surface, without changing this
method's overall scanning structure at all.

---

## Connect the Pieces

One query point, traced through this lesson's two Concept Units:
`NearestSurfaceFinder(mesh)` (second Concept Unit) stores `self.mesh`, a
real two-triangle `Mesh` (Lesson 6). Calling `find_closest(Vector3(0,0,0))`
initializes `best_triangle`/`best_distance` to `None` — the sentinel
pattern proven in this lesson's first Concept Unit's throwaway
number-scanning lab, now guarding real `Triangle` objects instead of
plain numbers. The loop's first pass computes `t1.centroid()` (Lesson
5), subtracts the query point (`Vector3.__sub__`, Lesson 2), and takes
`.length()` (Lesson 4) — a distance of roughly `0.94` — and because
`best_distance is None`, that first triangle unconditionally becomes the
running best, exactly as `17` did on the first pass of this lesson's
own number lab. The second pass computes `t2`'s much larger centroid
distance, `best_distance is None` is now `False`, so the real comparison
`distance < best_distance` runs for real — and evaluates `False`,
leaving `t1` as the final answer the method returns.

---

## Try It Yourself

Type `NearestSurfaceFinder` into `src/vector3d/nearest_surface_finder.py`
yourself (not copy-pasted), and confirm the `Run It` output above with
your own two triangles and query points. Then, once that works, try a
query point sitting exactly on the shared edge between two triangles
that meet — closer to one triangle's actual surface than the other, but
possibly closer to the *other* triangle's centroid — and see for
yourself whether this lesson's honestly-named approximation gets it
right or wrong in this specific case:

```python
t3 = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(4.0, 0.0, 0.0), Vector3(0.0, 0.1, 0.0))
t4 = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(0.0, 4.0, 0.0), Vector3(0.1, 0.0, 0.0))
mesh2 = Mesh([t3, t4])
finder2 = NearestSurfaceFinder(mesh2)

edge_point = Vector3(3.9, 0.0, 0.0)
result = finder2.find_closest(edge_point)
print(result is t3)
print(result is t4)
```
