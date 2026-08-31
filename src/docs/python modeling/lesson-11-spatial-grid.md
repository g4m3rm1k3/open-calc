# Lesson 11: Spatial Partitioning — `SpatialGrid`

**What you will build:** a new class, `SpatialGrid`, in a new file
`src/vector3d/spatial_grid.py` — Phase C's last lesson, and the payoff
Lesson 9's own SE Lens promised: a way to find the closest triangle to a
point *without* scanning every single triangle in the mesh.
`NearestSurfaceFinder` (Lessons 9-10) is correct but slow — its runtime
grows directly with triangle count, with no shortcut. `SpatialGrid`
divides space into a grid of fixed-size cells, sorts every triangle into
the cell its centroid falls in, and — for any query point — only checks
the triangles in that point's own cell and its immediate neighbors,
instead of the whole mesh.

**What you need to know first:** Phase A (`Vector3`, `Triangle`, `Mesh`)
and Lessons 9-10 in full — `NearestSurfaceFinder`, the running-best
scanning pattern (used twice already: once over a whole mesh, once over
a triangle's three edges), and `Triangle.closest_point()`, the exact
distance calculation this lesson reuses without changes.

**Terms used in this lesson:**
- **spatial partitioning** — dividing continuous space into discrete
  regions so that "what's near this point" can be answered by looking
  only at the region(s) containing it, rather than checking everything
  that exists anywhere. It exists because linear search's cost (Lesson
  9's own CS Lens) grows with *total* object count, while a well-
  partitioned search's cost grows with roughly how many objects are
  *actually nearby* — a very different, usually far smaller, number.
- **uniform grid** — the specific spatial partitioning scheme this
  lesson builds: space divided into equal-sized cubic cells, indexed by
  three integers (which cell along `x`, which along `y`, which along
  `z`). It exists as the simplest spatial partitioning scheme to build
  and reason about — every cell the same size, with no adaptive
  subdivision — at the cost of not adapting well to unevenly-distributed
  data (a concern this lesson's own SE Lens returns to directly).
- **floor division (`//`)** — division that rounds *down* to the
  nearest whole number, always toward negative infinity rather than
  toward zero (`-0.3 // 1.0` gives `-1.0`, not `0.0`). It exists here
  specifically to convert a continuous coordinate into a whole-number
  cell index, correctly and consistently, on both sides of zero.
- **`dict`** — Python's built-in mapping type, storing key-value pairs
  and allowing near-instant lookup by key, already familiar from
  ordinary Python. This lesson's own use is the first in this project:
  a `dict` whose keys are 3-integer tuples (this lesson's own **cell
  coordinate**) and whose values are lists of `Triangle` objects — the
  actual bucketing structure a uniform grid needs.
- **hashable** — a property a value needs to be usable as a `dict` key
  (or, equivalently, stored in a `set`): Python must be able to compute
  a consistent number (a *hash*) from it, which requires the value to
  never change after creation. Python's own tuples are hashable
  (exactly what makes a 3-integer cell coordinate usable as a `dict`
  key here); Python's own lists are not — a fact worth naming because
  it's the reason each cell's *contents* have to be a list (which can
  grow) while each cell's *key* has to be a tuple (which can't change).
- **`in` (dict membership test)** — checking whether a specific key
  already exists in a `dict`, without needing to actually retrieve its
  value — already familiar as the general `in` operator (already used
  for list/string membership in ordinary Python), applied here to `dict`
  keys specifically.
- **neighborhood search** — checking not just the cell a query point
  falls into, but every cell immediately touching it as well (in three
  dimensions, up to 26 neighbors plus the cell itself — 27 total). It
  exists because a query point sitting near a cell's own boundary could
  have its true closest triangle bucketed in the *next* cell over, even
  though the query point itself falls just barely on this side of the
  boundary.

**Objects and methods used:**

- **`SpatialGrid`**
  - *What it is:* a class that partitions a mesh's triangles into a
    uniform grid of cells, and answers nearest-triangle queries by
    checking only a small neighborhood of cells rather than the whole
    mesh.
  - *Implementation:* `class SpatialGrid:` with `__init__(self, mesh,
    cell_size)` bucketing every triangle by its centroid's cell
    coordinate, plus `_cell_for_point` and `find_closest`, built across
    this lesson's three Concept Units.
  - *Its use:* stands in for whatever internal spatial data structure
    `pyvista`'s `find_closest_cell` uses to answer nearest-cell queries
    quickly — never shown in `diff3d.py` itself, since it happens
    entirely inside the library; this lesson's own uniform grid is a
    deliberate, simpler design choice for this project, not a port of
    `pyvista`'s actual internals (likely a more sophisticated structure
    such as a BSP tree or octree — this lesson's Reference Source notes
    say so explicitly, rather than implying this is what `pyvista`
    itself does).
  - *Type:* a plain class, composed of a `dict` (mapping cell
    coordinates to lists of `Triangle` objects) rather than a single
    list the way `Mesh` (Lesson 6) is.
  - *Responsibility:* to answer the same "which triangle is closest?"
    question `NearestSurfaceFinder` (Lesson 9) already answers, faster,
    by narrowing the search to a small neighborhood before scanning at
    all.
  - *Depends on:* an already-built `Mesh` (Lesson 6) and a chosen
    `cell_size`, handed to it at construction time; `Triangle.centroid`
    (Lesson 5) and `Triangle.closest_point` (Lesson 10) for the actual
    geometry.
  - *Connects to:* nothing calls `SpatialGrid` yet within this project
    beyond this lesson's own verification; Lesson 15 (multi-pass
    alignment) will use it in place of `NearestSurfaceFinder` directly,
    for the same reason this lesson exists — speed, at scale.
  - *Shape:* sits alongside `NearestSurfaceFinder` (Lesson 9) — both are
    search/query classes reading an already-built `Mesh` — offering the
    identical `find_closest(point)` interface, differing only in how
    fast it runs, not in what question it answers.

- **`SpatialGrid._cell_for_point`**
  - *What it is:* an instance method converting a `Vector3` position
    into the integer cell coordinate (this lesson's own term) it falls
    within.
  - *Implementation:*
    ```
    def _cell_for_point(self, point):
        return (
            int(point.x // self.cell_size),
            int(point.y // self.cell_size),
            int(point.z // self.cell_size),
        )
    ```
    — takes `self` and a `Vector3`, returns a 3-integer tuple.
  - *Its use:* used both when bucketing every triangle during
    construction, and when locating a query point's own cell during a
    search — the single shared piece of logic both operations depend on
    agreeing on.
  - *Type:* an ordinary instance method, named with a leading underscore
    — a widely recognized Python convention (not a language rule)
    signaling "this is an internal helper, not part of this class's
    intended public interface," the same role a private helper method
    plays in many other languages.
  - *Responsibility:* to compute the exact same cell coordinate for the
    exact same position, every time, so that a triangle bucketed by its
    centroid and a query point checked against that bucket are always
    using a consistent notion of "which cell."
  - *Depends on:* `self.cell_size` (set by `__init__`) and Python's
    floor division operator.
  - *Connects to:* called once per triangle by `__init__`, and once per
    query by `find_closest` (both this lesson).
  - *Shape:* `SpatialGrid`'s own internal layer — a shared building
    block for the two methods around it.

- **`SpatialGrid.find_closest`**
  - *What it is:* an instance method returning the closest triangle
    (using `Triangle.closest_point`'s exact distance, Lesson 10) to a
    query point, checking only a small neighborhood of cells.
  - *Implementation:*
    ```
    def find_closest(self, point):
        cx, cy, cz = self._cell_for_point(point)
        candidates = []
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for dz in (-1, 0, 1):
                    neighbor = (cx + dx, cy + dy, cz + dz)
                    if neighbor in self.buckets:
                        candidates.extend(self.buckets[neighbor])

        best_triangle = None
        best_distance = None
        for triangle in candidates:
            distance = (triangle.closest_point(point) - point).length()
            if best_distance is None or distance < best_distance:
                best_distance = distance
                best_triangle = triangle
        return best_triangle
    ```
    — takes `self` and a query `Vector3`, returns a `Triangle` (or
    `None`, a real, honestly-discussed limitation this lesson's SE Lens
    returns to directly).
  - *Its use:* the same interface `NearestSurfaceFinder.find_closest`
    (Lesson 9) already provides, offered here as a faster alternative
    for later lessons (starting with Lesson 15's alignment) to use once
    speed genuinely matters.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to gather every triangle from the query point's
    own cell and its 26 immediate neighbors, then run the exact same
    running-best scan (Lesson 9's pattern, reused a third time in this
    project) over just those candidates.
  - *Depends on:* `self._cell_for_point` and `self.buckets` (both this
    lesson), and `Triangle.closest_point` (Lesson 10).
  - *Connects to:* calls `self._cell_for_point` once, then
    `Triangle.closest_point` once per candidate triangle (far fewer,
    for a well-distributed mesh, than `NearestSurfaceFinder` would call
    it).
  - *Shape:* `SpatialGrid`'s own top-level method — the one later
    lessons will actually call.

---

## Concept Unit: Dividing Space Into Buckets — Cell Coordinates

### The Problem

`NearestSurfaceFinder` (Lesson 9) checks every triangle for every query,
because it has no way to know, in advance, which triangles could
possibly be nearby without checking all of them first. A **uniform
grid** (this lesson's own term) fixes that by giving every position in
space a well-defined "address" — which cell it falls in — so triangles
and query points can be grouped by address, and only matching (or
adjacent) addresses ever need to be compared.

> **Before reading on, try this yourself:** if space is divided into
> cubes of a fixed size, say `1.0` units per side, what arithmetic
> operation would turn a continuous coordinate like `x = 2.7` into
> "which cube along the x-axis does this fall in" — a whole number, not
> a fraction? (Ordinary division gives `2.7`, still a fraction — what
> operation rounds it down to a whole number, and would you expect that
> same operation to behave sensibly for a *negative* coordinate too,
> like `x = -0.3`?)

### Introduce the Concept in Isolation

```python
# Throwaway lab: mapping a continuous position to a discrete grid-cell coordinate
def cell_for(x, y, cell_size):
    return (int(x // cell_size), int(y // cell_size))

print(cell_for(0.5, 0.5, 1.0))
print(cell_for(1.2, 0.9, 1.0))
print(cell_for(-0.3, 2.5, 1.0))
```

Real output:

```
(0, 0)
(1, 0)
(-1, 2)
```

`(0.5, 0.5)` with `cell_size=1.0` falls in cell `(0, 0)` — the first
unit cube, correctly. `(1.2, 0.9)` falls in `(1, 0)` — past `x=1.0`, so
one cell over on that axis, while `y=0.9` is still within the first
cell. The last case is the one worth checking carefully: `x = -0.3`
gives cell `-1`, not `0` — **floor division** (this lesson's own term)
rounds *down*, toward negative infinity, so a small negative number
still correctly lands in the cell immediately to the left of zero,
rather than being (incorrectly) grouped with positive values near zero.
`int(...)` around the whole expression converts the result (floor
division on floats returns a float, like `-1.0`) into a genuine Python
integer, `-1`.

### Discard the Throwaway Example

This scratch `cell_for` function is discarded now. `SpatialGrid` gets
the real, 3D version next.

### Project Change

- **Reference Source:** no line in `diff3d.py` — `pyvista`'s
  `find_closest_cell` almost certainly uses a more sophisticated spatial
  structure internally (this lesson's own Header already names this
  honestly), never exposed in the script. This lesson's uniform grid is
  a deliberate, from-scratch design choice for this project specifically
  — not a port of any specific reference.
- **Files affected:** create `src/vector3d/spatial_grid.py` (new file).
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** none yet — this Concept Unit only builds the cell-
  coordinate helper; full construction happens in the next Concept
  Unit.

### The New Code

Type this into `src/vector3d/spatial_grid.py`:

```python
class SpatialGrid:
    def __init__(self, mesh, cell_size):
        self.cell_size = cell_size

    def _cell_for_point(self, point):
        return (
            int(point.x // self.cell_size),
            int(point.y // self.cell_size),
            int(point.z // self.cell_size),
        )
```

### The Updated Project

This is the whole new file so far — nothing larger to return to yet
(the same brand-new-file exemption used throughout this curriculum):

```
1  class SpatialGrid:
2      def __init__(self, mesh, cell_size):
3          self.cell_size = cell_size
4
5      def _cell_for_point(self, point):
6          return (
7              int(point.x // self.cell_size),
8              int(point.y // self.cell_size),
9              int(point.z // self.cell_size),
10         )
```

As a whole, this file now defines a buildable `SpatialGrid(mesh,
cell_size)` that can convert any `Vector3` into its 3D cell coordinate
— the shared building block both bucketing (next Concept Unit) and
searching (the Concept Unit after that) will use.

### Mechanical Walkthrough

- **`class SpatialGrid:`** and **`def __init__(self, mesh, cell_size):`**
  / **`self.cell_size = cell_size`** — the same `class`/`__init__`/
  attribute-assignment pattern used throughout this project; `mesh` is
  accepted but not yet used (this Concept Unit's `__init__` is
  intentionally incomplete — the next Concept Unit fills it in).
- **`def _cell_for_point(self, point):`** — `def`; `_cell_for_point` — a
  leading underscore, this lesson's own naming convention marking it as
  an internal helper; `self` and one parameter, `point`.
- **`int(point.x // self.cell_size)`** (and identically for `.y`, `.z`)
  — `point.x` (ordinary attribute access, Lesson 1); `//`, **floor
  division** (this lesson's own term), dividing the coordinate by the
  cell size and rounding down; `int(...)`, converting the resulting
  float into a genuine Python integer.
- **`return (...)`** — `return`, handing back an ordinary 3-element
  tuple (already familiar syntax, used before for `Mesh.bounds()`'s
  six-value return in Lesson 6 and `barycentric_coordinates`'s
  three-value return in Lesson 10) — three integers, one per axis.

### CS Lens

This is **spatial hashing** (this lesson's own broader term,
**spatial partitioning**, made concrete) — converting a continuous
coordinate into a discrete "bucket" identifier, the same underlying idea
as an ordinary hash table, applied to geometric position instead of an
arbitrary key.

Also recognized in: collision detection in physics engines and game
engines (this exact technique — often called a "uniform grid" or
"spatial hash," this lesson's own term — is one of the most common ways
to avoid checking every object against every other object); GIS
(geographic information systems) tiling schemes, which divide the
Earth's surface into fixed-size tiles addressed the same way; database
spatial indexing (a geohash, widely used for location-based queries, is
a close relative of this exact idea).

### SE Lens

The principle here is **choosing resolution deliberately** —
`cell_size` is a parameter, not a hard-coded constant, because the right
cell size genuinely depends on the data: cells too large put too many
triangles in each bucket (not much better than no partitioning at all);
cells too small spread triangles thin but multiply the number of cells a
neighborhood search has to check.

The alternative not chosen: an *adaptive* spatial structure (an octree,
which subdivides more finely only where data is denser, or a k-d tree)
rather than this lesson's fixed-size uniform grid. Adaptive structures
handle unevenly-distributed data far better — a uniform grid wastes
cells over empty regions and can still overload cells in dense regions,
if a single `cell_size` doesn't fit the whole mesh well. The uniform
grid built in this lesson is deliberately the simpler structure,
appropriate for this project's own scope; a large-scale, general-purpose
3D engine would very likely need the adaptive alternative instead.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3
from vector3d.spatial_grid import SpatialGrid

g = SpatialGrid(mesh=None, cell_size=1.0)
print(g._cell_for_point(Vector3(0.5, 0.5, 0.5)))
print(g._cell_for_point(Vector3(1.9, 0.2, 3.1)))
"
```

Real output:

```
(0, 0, 0)
(1, 0, 3)
```

(`mesh=None` is valid here specifically because this Concept Unit's
`__init__` doesn't touch `mesh` at all yet — the next Concept Unit
changes that.) Both results match the throwaway lab's own logic,
extended to three axes.

### Connect

`SpatialGrid` can now compute cell coordinates, but doesn't yet sort any
triangles into them. The next Concept Unit builds the actual bucketing —
scanning every triangle in the mesh once, at construction time, and
filing each one under its centroid's cell.

---

## Concept Unit: Building the Grid — Bucketing Every Triangle

### The Problem

Knowing how to compute a cell coordinate isn't enough — `SpatialGrid`
needs somewhere to actually *store* which triangles fall in which cell,
built once when the grid is constructed, so later searches never have
to redo that sorting work. Nothing built so far in this project has
needed a structure quite like this: a mapping from a computed key (a
cell coordinate) to a *growing list* of items that share that key.

> **Before reading on, try this yourself:** Python's `dict` (this
> lesson's own term) maps keys to values, and a 3-integer tuple (like
> this lesson's own cell coordinate) is **hashable** (this lesson's own
> term) — usable as a dict key. If you wanted to build a dict where each
> key (a cell coordinate) maps to a *list* of triangles whose centroids
> fall there, what would the very first triangle assigned to a brand-new
> cell need, that the second and third triangles assigned to that same
> cell wouldn't? (Think about what `some_dict[key]` would do if `key`
> had never been seen before, versus if it already existed.)

### Introduce the Concept in Isolation

```python
# Throwaway lab: a dictionary of lists, growing one bucket at a time
items = ["apple", "banana", "avocado", "blueberry", "cherry"]

buckets = {}
for item in items:
    key = item[0]
    if key not in buckets:
        buckets[key] = []
    buckets[key].append(item)

print(buckets)
print(buckets["b"])
print("z" in buckets)
```

Real output:

```
{'a': ['apple', 'avocado'], 'b': ['banana', 'blueberry'], 'c': ['cherry']}
['banana', 'blueberry']
False
```

Every word gets bucketed by its first letter; `"apple"` (the first
word starting with `"a"`) needs `if key not in buckets:` to create a
brand-new empty list before it can be appended — directly answering
this Concept Unit's own Socratic prompt. `"avocado"`, arriving later,
finds `"a"` already present, skips the list-creation step entirely (the
`if` is `False`), and appends straight onto the existing list. The final
check, `"z" in buckets`, correctly reports `False` — no word started
with `"z"`, so that key was never created at all; a `dict` only ever
holds the keys it was actually given, nothing more.

### Discard the Throwaway Example

This scratch word-bucketing code is discarded now. `SpatialGrid` gets
the real triangle-bucketing logic next.

### Project Change

- **Reference Source:** same note as this lesson's previous Concept
  Unit — no specific line in `diff3d.py` to port; this is a from-scratch
  structure this project's own design calls for.
- **Files affected:** modify `src/vector3d/spatial_grid.py`.
- **Change type:** add (extending `__init__`).
- **Location:** inside `__init__`, directly after
  `self.cell_size = cell_size`.
- **Dependencies:** `self._cell_for_point` (earlier in this lesson) and
  `Triangle.centroid` (Lesson 5).

### The New Code

Add these lines inside `__init__`, after `self.cell_size = cell_size`:

```python
        self.buckets = {}
        for triangle in mesh.triangles:
            cell = self._cell_for_point(triangle.centroid())
            if cell not in self.buckets:
                self.buckets[cell] = []
            self.buckets[cell].append(triangle)
```

### The Updated Project

`src/vector3d/spatial_grid.py` so far, new lines marked:

```
 1  class SpatialGrid:
 2      def __init__(self, mesh, cell_size):
 3          self.cell_size = cell_size
 4          self.buckets = {}                                            # ← new
 5          for triangle in mesh.triangles:                              # ← new
 6              cell = self._cell_for_point(triangle.centroid())         # ← new
 7              if cell not in self.buckets:                             # ← new
 8                  self.buckets[cell] = []                              # ← new
 9              self.buckets[cell].append(triangle)                      # ← new
10
11      def _cell_for_point(self, point):
12          return (
13              int(point.x // self.cell_size),
14              int(point.y // self.cell_size),
15              int(point.z // self.cell_size),
16          )
```

As a whole, constructing a `SpatialGrid` now does real, useful work: it
scans every triangle in the mesh exactly once, computes each one's
centroid cell, and files it into a growing `dict` of lists — the
complete bucketing structure `find_closest` (built next) will search.

### Mechanical Walkthrough

- **`self.buckets = {}`** — an empty **`dict`** literal (this lesson's
  own term — already familiar syntax from ordinary Python), stored as a
  new instance attribute, ready to be filled.
- **`for triangle in mesh.triangles:`** — an ordinary `for` loop
  (already familiar, and the same shape `Mesh.bounds()` itself used in
  Lesson 6), binding `triangle` to one `Triangle` object per pass.
- **`cell = self._cell_for_point(triangle.centroid())`** —
  `triangle.centroid()` (Lesson 5) computes that triangle's center as a
  `Vector3`; `self._cell_for_point(...)` (earlier in this lesson)
  converts it into a 3-integer tuple cell coordinate; the result is
  stored in the local variable `cell`.
- **`if cell not in self.buckets:`** — the **`in`** membership test
  (this lesson's own term, applied to `dict` keys), negated with `not`
  (already familiar); `True` only the very first time a given `cell`
  value is encountered.
- **`self.buckets[cell] = []`** — ordinary `dict` key assignment
  (already familiar syntax), creating a brand-new empty list under this
  cell's key — executed only when the `if` above was `True`.
- **`self.buckets[cell].append(triangle)`** — `self.buckets[cell]`
  retrieves the list at this cell's key (guaranteed to exist by this
  point, whether it was just created above or already existed from an
  earlier triangle); `.append(triangle)` (already-familiar list method)
  adds the current triangle onto the end of it — this line runs for
  *every* triangle, unconditionally, unlike the two lines above it.

### CS Lens

This is **bucketing** (or **binning**) — grouping items by a computed
key so that later operations only need to consider items sharing (or
near) a particular key, rather than the whole collection. Combined with
the previous Concept Unit's spatial hashing, this specific pattern —
hash a position to a bucket key, store a growing list per bucket — is
often called a **spatial hash table**, called out here by its full name
since it's the actual data structure this entire lesson builds.

Also recognized in: histogram construction (bucketing numeric values
into ranges, the exact same "compute a key, append to that key's growing
list/count" pattern); database indexing (a hash index groups rows by a
computed hash of an indexed column, for exactly the same fast-lookup
reason); word-frequency counting (`buckets[word] = buckets.get(word, 0)
+ 1` is the identical build-up-a-dict-during-a-scan shape, just counting
instead of collecting).

### SE Lens

The principle is **doing the expensive work once, upfront, to make every
later query cheap** — bucketing every triangle costs time proportional
to the *whole mesh*, exactly once, at construction time; every
individual `find_closest` call afterward (built next) only pays for
checking a small neighborhood, not the whole mesh again.

The alternative not chosen: skip pre-building `self.buckets` entirely,
and instead scan the whole `mesh.triangles` list fresh inside
`find_closest` itself, filtering to just the matching cell each time.
That would avoid the upfront construction cost, but every single query
would then cost as much as `NearestSurfaceFinder`'s own brute-force scan
(Lesson 9) — defeating this entire lesson's purpose. Pre-building the
buckets trades one upfront cost (proportional to the whole mesh, paid
once) for many cheap repeated queries afterward — the right tradeoff
whenever a grid is built once and searched many times, which is exactly
how later lessons (starting with Lesson 15) will use it.

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
from vector3d.spatial_grid import SpatialGrid

t1 = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0), Vector3(0.0, 2.0, 0.0))
t2 = Triangle(Vector3(1.0, 1.0, 3.0), Vector3(3.0, 1.0, 3.0), Vector3(1.0, 3.0, 3.0))
mesh = Mesh([t1, t2])

grid = SpatialGrid(mesh, cell_size=1.0)
print(t1.centroid())
print(t2.centroid())
print(grid.buckets.keys())
for cell, triangles in grid.buckets.items():
    print(cell, len(triangles))
"
```

Real output:

```
Vector3(0.6666666666666666, 0.6666666666666666, 0.0)
Vector3(1.6666666666666667, 1.6666666666666667, 3.0)
dict_keys([(0, 0, 0), (1, 1, 3)])
(0, 0, 0) 1
(1, 1, 3) 1
```

The two familiar triangles from every lesson since Lesson 6, this time
sorted into two separate cells — `t1`'s centroid, `(0.67, 0.67, 0.0)`,
correctly floors to cell `(0, 0, 0)`; `t2`'s centroid, `(1.67, 1.67,
3.0)`, correctly floors to cell `(1, 1, 3)` — each cell holding exactly
one triangle, since these two are far enough apart, relative to
`cell_size=1.0`, to land in different buckets.

### Connect

`SpatialGrid` can now organize a whole mesh into cells. The final
Concept Unit uses that structure to answer real nearest-triangle
queries, checking only a small neighborhood instead of every bucket.

---

## Concept Unit: Searching Only Nearby Cells

### The Problem

Bucketed triangles are only useful if a query can actually find the
*right* bucket — and, critically, not just the query point's own exact
cell: a point sitting near a cell's edge could have its true closest
triangle bucketed in the very next cell over. Checking only the query's
own single cell would be fast but wrong; checking every cell would be
correct but defeats the entire purpose of bucketing in the first place.

> **Before reading on, try this yourself:** if a query point's own cell
> coordinate is `(cx, cy, cz)`, and its true closest triangle might be
> bucketed in any cell touching that one — one step away on any axis, in
> any combination — how many total cells (including the query's own)
> would need checking to cover every immediate neighbor in three
> dimensions? (Think about each axis independently: how many choices —
> one step back, no step, one step forward — for each of `x`, `y`, and
> `z`, and what those three independent choices multiply out to when
> combined.)

### Introduce the Concept in Isolation

No new throwaway lab for this Concept Unit: `dict` membership testing
and the running-best scanning pattern were both already fully isolated
and proven — the first earlier in this lesson, the second in Lesson 9
and reused again in Lesson 10's edge fallback. What's new here is only
the combination: using nested loops to enumerate a fixed neighborhood of
cell coordinates, gathering their contents, and running the
already-proven scan over the result.

### Discard the Throwaway Example

Not applicable to this Concept Unit, for the reason stated above.

### Project Change

- **Reference Source:** `diff3d.py`'s `find_closest` function —
  `_, closest = mesh.find_closest_cell(points, return_closest_point=True)`
  — this method offers the same interface `NearestSurfaceFinder`
  (Lesson 9) already does, as a faster alternative.
- **Files affected:** modify `src/vector3d/spatial_grid.py`.
- **Change type:** add.
- **Location:** inside `class SpatialGrid:`, directly after
  `_cell_for_point`.
- **Dependencies:** `self._cell_for_point` and `self.buckets` (both
  earlier in this lesson), and `Triangle.closest_point` (Lesson 10).

### The New Code

```python
    def find_closest(self, point):
        cx, cy, cz = self._cell_for_point(point)
        candidates = []
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                for dz in (-1, 0, 1):
                    neighbor = (cx + dx, cy + dy, cz + dz)
                    if neighbor in self.buckets:
                        candidates.extend(self.buckets[neighbor])

        best_triangle = None
        best_distance = None
        for triangle in candidates:
            distance = (triangle.closest_point(point) - point).length()
            if best_distance is None or distance < best_distance:
                best_distance = distance
                best_triangle = triangle
        return best_triangle
```

### The Updated Project

`src/vector3d/spatial_grid.py` in full, new lines marked:

```
 1  class SpatialGrid:
 2      def __init__(self, mesh, cell_size):
 3          self.cell_size = cell_size
 4          self.buckets = {}
 5          for triangle in mesh.triangles:
 6              cell = self._cell_for_point(triangle.centroid())
 7              if cell not in self.buckets:
 8                  self.buckets[cell] = []
 9              self.buckets[cell].append(triangle)
10
11      def _cell_for_point(self, point):
12          return (
13              int(point.x // self.cell_size),
14              int(point.y // self.cell_size),
15              int(point.z // self.cell_size),
16          )
17
18      def find_closest(self, point):                                   # ← new
19          cx, cy, cz = self._cell_for_point(point)                    # ← new
20          candidates = []                                             # ← new
21          for dx in (-1, 0, 1):                                       # ← new
22              for dy in (-1, 0, 1):                                   # ← new
23                  for dz in (-1, 0, 1):                               # ← new
24                      neighbor = (cx + dx, cy + dy, cz + dz)          # ← new
25                      if neighbor in self.buckets:                    # ← new
26                          candidates.extend(self.buckets[neighbor])   # ← new
27                                                                        # ← new
28          best_triangle = None                                        # ← new
29          best_distance = None                                        # ← new
30          for triangle in candidates:                                 # ← new
31              distance = (triangle.closest_point(point) - point).length()  # ← new
32              if best_distance is None or distance < best_distance:   # ← new
33                  best_distance = distance                            # ← new
34                  best_triangle = triangle                            # ← new
35          return best_triangle                                        # ← new
```

As a whole, `SpatialGrid` is now complete: `find_closest(point)` gathers
candidates from a 27-cell neighborhood, then runs the exact same
running-best pattern this project has now used three times (Lesson 9's
whole-mesh scan, Lesson 10's three-edge fallback, and this lesson's
neighborhood scan) to pick the true closest among them.

### Mechanical Walkthrough

- **`def find_closest(self, point):`** — `def`; `find_closest`, deliberately
  the same method name `NearestSurfaceFinder` (Lesson 9) uses, so later
  code can swap one for the other without changing how it's called;
  `self` and one parameter, `point`.
- **`cx, cy, cz = self._cell_for_point(point)`** — calling
  `_cell_for_point` (earlier in this lesson) and unpacking its
  3-element tuple into three separate local variables — the same
  tuple-unpacking pattern used throughout this project since Lesson 6.
- **`candidates = []`** — an empty list (already familiar), to be
  filled with every triangle found in the neighborhood below.
- **`for dx in (-1, 0, 1): for dy in (-1, 0, 1): for dz in (-1, 0, 1):`**
  — three nested `for` loops (structurally the same nesting shape as
  `Mesh.bounds()`'s two-level loop in Lesson 6, one level deeper here),
  each ranging over exactly three values — one step back, no step, one
  step forward — directly answering this Concept Unit's own Socratic
  prompt: three independent choices per axis, `3 × 3 × 3 = 27` total
  combinations across all three loops together.
- **`neighbor = (cx + dx, cy + dy, cz + dz)`** — ordinary tuple
  construction (already familiar), building one specific neighboring
  cell coordinate by offsetting the query's own cell by the current
  `(dx, dy, dz)` combination; when `dx = dy = dz = 0`, this is exactly
  the query's own cell.
- **`if neighbor in self.buckets:`** — the same `in` dict-membership
  test from earlier in this lesson, checking whether this particular
  neighboring cell actually has any triangles bucketed in it at all —
  most neighboring cells, for a typical mesh, will have none.
- **`candidates.extend(self.buckets[neighbor])`** — `self.buckets[neighbor]`
  retrieves that cell's list of triangles; `.extend(...)` (a list
  method, distinct from `.append()` used earlier in this lesson —
  `.extend` adds every item from another list individually, rather than
  adding the whole list as one single nested item the way `.append`
  would) — merging that cell's triangles into the growing `candidates`
  list.
- **`best_triangle = None`** through **`return best_triangle`** — the
  identical running-best/sentinel pattern from Lesson 9, reused a third
  time in this project without modification, now scanning `candidates`
  (a small neighborhood's worth of triangles) instead of Lesson 9's
  entire `mesh.triangles`, and using `Triangle.closest_point` (Lesson
  10) for the exact distance, exactly as `NearestSurfaceFinder` itself
  was updated to do at the end of Lesson 10.

### CS Lens

This is a **neighborhood search** (this lesson's own term) over a
spatial hash table — narrowing a search to a small, fixed region around
a query before ever comparing distances, which is the entire performance
idea behind every spatial-partitioning technique named in this lesson's
CS Lenses so far.

Also recognized in: cellular automata (a cell's next state in Conway's
Game of Life, for instance, depends only on its own 8 immediate 2D
neighbors — the exact same fixed-neighborhood idea, one dimension
lower); image processing (a blur or edge-detection filter examines a
small neighborhood of pixels around each one, never the whole image at
once, for the same locality reason); N-body physics simulations (particles
only need to check gravitational or collision interactions with nearby
particles, bucketed the same way, rather than every other particle in
the simulation).

### SE Lens

The principle is **trading a small amount of missed correctness for a
large amount of speed** — and this lesson's own algorithm has a real,
honest limitation worth demonstrating concretely rather than only
described: because triangles are bucketed by their *centroid* alone, a
long or thin triangle spanning several cells can have its centroid land
far from where its actual surface comes closest to a query point. A
27-cell neighborhood search, built to catch triangles whose *centroid*
is nearby, can completely miss such a triangle.

This is not a hypothetical: a long, thin triangle spanning `y = 0` to
`y = 20` (vertices at `(0, 0, 0)`, `(0, 20, 0)`, `(0.05, 10, 0)`) has its
centroid at roughly `(0.02, 10, 0)` — cell `(0, 10, 0)` with
`cell_size=1.0`. A query point at `(0, 19, 0)` sits almost exactly on
that triangle's own second vertex — true distance essentially `0` — but
falls in cell `(0, 19, 0)`, nine cells away from the triangle's bucket,
far outside any 27-cell neighborhood. Checked for real: `SpatialGrid`
returns `None` for this query (no candidates found at all, if no other
triangle happens to be nearby either), while `NearestSurfaceFinder`
(Lessons 9-10) correctly finds the sliver triangle at distance `0.0`.

The alternative not chosen, worth naming honestly given the real failure
above: bucket each triangle into *every* cell its bounding box actually
overlaps, not just the single cell its centroid falls in. That would
close this gap correctly, at the cost of real added complexity (a long
triangle might need to be added to dozens of cells instead of one) and
more memory (the same triangle object referenced from multiple buckets).
This lesson's simpler, centroid-only bucketing is a deliberate,
named tradeoff — appropriate for a mesh of triangles that are all
roughly similar in size relative to `cell_size` (a reasonable assumption
for the `stock*.stl` files this rebuild targets), and a real, false-
negative risk for a mesh containing unusually long or thin triangles,
which this lesson's own worked example proves concretely rather than
merely asserting.

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
from vector3d.spatial_grid import SpatialGrid
from vector3d.nearest_surface_finder import NearestSurfaceFinder

t1 = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0), Vector3(0.0, 2.0, 0.0))
t2 = Triangle(Vector3(1.0, 1.0, 3.0), Vector3(3.0, 1.0, 3.0), Vector3(1.0, 3.0, 3.0))
mesh = Mesh([t1, t2])

grid = SpatialGrid(mesh, cell_size=1.0)
brute = NearestSurfaceFinder(mesh)

for q in [Vector3(0.0,0.0,0.0), Vector3(2.0,2.0,3.0), Vector3(1.9,0.05,0.0), Vector3(0.5,0.5,1.5)]:
    a = grid.find_closest(q)
    b = brute.find_closest(q)
    print(q, 'grid:', a is t1, a is t2, '| brute:', b is t1, b is t2, '| match:', a is b)
"
```

Real output:

```
Vector3(0.0, 0.0, 0.0) grid: True False | brute: True False | match: True
Vector3(2.0, 2.0, 3.0) grid: False True | brute: False True | match: True
Vector3(1.9, 0.05, 0.0) grid: True False | brute: True False | match: True
Vector3(0.5, 0.5, 1.5) grid: True False | brute: True False | match: True
```

Four different query points, every one agreeing exactly between
`SpatialGrid` and the already-proven-correct `NearestSurfaceFinder` —
this lesson's own correctness-checking practice, done for real, on a
well-distributed mesh where the previous Concept Unit's failure mode
doesn't arise.

### Connect

Phase C is complete. `SpatialGrid` offers the same `find_closest`
interface `NearestSurfaceFinder` does, matches its answers on ordinary,
well-distributed meshes, and does so while checking a small
neighborhood instead of an entire mesh — with one real, demonstrated,
honestly-documented limitation for unusually long or thin triangles.
Later lessons can choose either class depending on whether speed or
guaranteed-exhaustive correctness matters more for a given use.

---

## Connect the Pieces

One query point, `Vector3(0.5, 0.5, 1.5)`, traced through every method
this lesson built: `SpatialGrid(mesh, cell_size=1.0)` (second Concept
Unit) scans both triangles at construction time, calling
`_cell_for_point` (first Concept Unit) on each one's `Triangle.centroid()`
(Lesson 5) and filing them into `self.buckets` — `t1` under `(0,0,0)`,
`t2` under `(1,1,3)`. Calling `find_closest(Vector3(0.5,0.5,1.5))` (third
Concept Unit) computes the query's own cell, `(0,0,1)`, then loops over
all 27 neighbor offsets — finding `(0,0,0)` (containing `t1`) among
them, since it's exactly one step away on the z-axis, but never finding
`(1,1,3)` (containing `t2`), since that cell is far outside this
neighborhood. `candidates` ends up holding only `t1`. Lesson 9's
running-best pattern, reused a third time in this project, then has only
one triangle to consider — `t1` wins by default, and
`Triangle.closest_point` (Lesson 10) confirms the real geometric
distance. The entire mesh had two triangles; this query's actual search
only ever touched one — the concrete performance win this whole lesson
exists to deliver, though, as this lesson's own SE Lens proved with a
different example, not one guaranteed to be correct for every possible
mesh shape.

---

## Try It Yourself

Type `SpatialGrid` into `src/vector3d/spatial_grid.py` yourself (not
copy-pasted), and confirm the `Run It` output above with your own
triangles. Then, once that works, reproduce this lesson's own SE-Lens
failure case yourself, and confirm for real that `SpatialGrid` and
`NearestSurfaceFinder` genuinely disagree here — a rare, deliberate
moment in this curriculum where the "faster" class is demonstrably
*wrong* and the "slower" one is right:

```python
sliver = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(0.0, 20.0, 0.0), Vector3(0.05, 10.0, 0.0))
far_away = Triangle(Vector3(50.0, 50.0, 50.0), Vector3(51.0, 50.0, 50.0), Vector3(50.0, 51.0, 50.0))
mesh2 = Mesh([sliver, far_away])

grid2 = SpatialGrid(mesh2, cell_size=1.0)
brute2 = NearestSurfaceFinder(mesh2)

query = Vector3(0.0, 19.0, 0.0)
print(grid2.find_closest(query))
print(brute2.find_closest(query) is sliver)
```
