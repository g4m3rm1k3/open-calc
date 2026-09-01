# Lesson 12: Grid Sampling a Surface — `SurfaceSampler`

**What you will build:** `Triangle.area()` and `Mesh.area()`, a small
`frange` helper added to `geometry.py`, and a new class,
`SurfaceSampler`, in a new file `src/vector3d/surface_sampler.py` —
Phase D's first lesson, rebuilding `diff3d.py`'s `sample_points()` from
scratch: laying a regular grid of candidate points across a mesh's
bounding box, then keeping only the ones close enough to the actual
surface. This is also this project's first use of **dependency
injection** (this lesson's own term) — `SurfaceSampler` doesn't hard-
code which search class it uses to find nearby surface points; it
accepts either `NearestSurfaceFinder` (Lesson 9) or `SpatialGrid`
(Lesson 11), interchangeably, as a constructor argument.

**What you need to know first:** Phase A (`Vector3`, `Triangle`,
`Mesh`) and Phase C in full (`NearestSurfaceFinder`, `Triangle.closest_point`,
`SpatialGrid` — both offering the identical `find_closest(point)`
interface).

**Terms used in this lesson:**
- **`while` loop** — a loop that repeats as long as a condition stays
  true, already familiar from ordinary Python. This lesson's own
  `frange` helper is the first place in this project's own code that
  needs one — every loop built so far (Lesson 6 onward) has been a
  `for` loop over an already-known collection; `frange` instead builds
  a *new* collection by repeating "add the current value, then step
  forward" until a stopping condition is reached, which is exactly what
  `while` is for.
- **dependency injection** — designing a class to *receive* an object it
  depends on (passed in from outside, at construction time) rather than
  creating that object itself internally. `SurfaceSampler` needs
  something that can answer "which triangle is closest to this point,"
  but doesn't need to know or care whether that's `NearestSurfaceFinder`
  or `SpatialGrid` — it just calls `.find_closest(point)` on whatever it
  was given. It exists so a class's behavior can be swapped or
  customized from outside, without editing that class's own code at
  all.
- **duck typing** — the informal rule dependency injection here relies
  on: `SurfaceSampler` doesn't check what *type* its `finder` argument
  is, only that it has a `.find_closest(point)` method that behaves the
  right way. Named for the saying "if it walks like a duck and quacks
  like a duck, it's a duck" — Python doesn't require `NearestSurfaceFinder`
  and `SpatialGrid` to share a common parent class or declared interface
  for this to work; they simply both happen to offer a method with the
  same name and behavior.

**Objects and methods used:**

- **`Triangle.area`**
  - *What it is:* an instance method computing a triangle's real surface
    area.
  - *Implementation:*
    `def area(self): edge1 = self.v1 - self.v0; edge2 = self.v2 - self.v0; return edge1.cross(edge2).length() / 2`
    — takes only `self`, returns a plain number.
  - *Its use:* `diff3d.py`'s `sample_points()` computes
    `cell_size = np.sqrt(total_area / n)` from `mesh.area` — the total
    surface area a sampling grid's spacing is derived from;
    `Mesh.area()` (built next in this lesson) needs each triangle's own
    area to sum them.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to compute the real area of the flat triangular
    surface `self` represents, from its own three vertices alone.
  - *Depends on:* `Vector3.__sub__` (Lesson 2), `Vector3.cross`, and
    `Vector3.length` (both Lesson 4) — deliberately *not*
    `Triangle.normal()` (Lesson 5), even though both start from the
    identical `edge1.cross(edge2)` computation: `normal()` immediately
    normalizes that result to length `1`, permanently discarding the
    very magnitude `area()` needs, so `area()` recomputes the raw cross
    product itself rather than trying to reuse `normal()`'s already-
    normalized result.
  - *Connects to:* called once per triangle by `Mesh.area()`, built next
    in this lesson.
  - *Shape:* `Triangle`'s own layer, alongside `centroid`/`normal`/
    `closest_point`.

- **`Mesh.area`**
  - *What it is:* an instance method computing a mesh's total surface
    area — the sum of every triangle's own area.
  - *Implementation:*
    `def area(self): total = 0; for triangle in self.triangles: total += triangle.area(); return total`
    — takes only `self`, returns a plain number.
  - *Its use:* the direct, from-scratch replacement for `mesh.area` in
    `diff3d.py`'s `sample_points()`.
  - *Type:* an ordinary instance method (not a `@property`, unlike
    `Mesh.center`, Lesson 6 — a deliberate consistency choice with the
    original script's own `mesh.area`, which the Reference Source for
    this Concept Unit notes is itself a `pyvista` property; this
    project's own `area()` is written as an ordinary method here to
    match `bounds()`'s own shape rather than `center`'s, since nothing
    in this project's later lessons calls it repeatedly enough for the
    property-style "looks like an attribute" convenience to matter the
    way it did for `center`).
  - *Responsibility:* to scan every triangle in the mesh exactly once
    and sum their individual areas.
  - *Depends on:* `self.triangles` (Lesson 6) and `Triangle.area` (this
    lesson).
  - *Connects to:* calls `Triangle.area()` once per triangle. Called by
    `SurfaceSampler.sample`, built later in this lesson.
  - *Shape:* `Mesh`'s own layer, alongside `bounds`/`center` — a third
    reduction-style scan over `self.triangles`, the same shape
    `bounds()` (Lesson 6) already established.

- **`frange`**
  - *What it is:* a module-level function producing a list of evenly-
    spaced float values from `start` up to `stop`, stepping by `step`.
  - *Implementation:*
    `def frange(start, stop, step): values = []; x = start; while x <= stop: values.append(x); x += step; return values`
    — takes three plain numbers, returns a list of floats.
  - *Its use:* `diff3d.py`'s `sample_points()` uses `np.arange` for
    exactly this purpose, building the `x`/`y`/`z` coordinate lists a
    sampling grid is built from; Python's own built-in `range()` only
    supports whole-number steps, so this project needs its own
    equivalent for float steps like `cell_size`.
  - *Type:* a module-level function — this project's third one, after
    `closest_point_on_segment` and `barycentric_coordinates` (Lesson
    10), living in the same `geometry.py` file.
  - *Responsibility:* to produce every value from `start` to `stop`
    (inclusive, stepping by `step`), stopping only once the next value
    would exceed `stop`.
  - *Depends on:* nothing beyond plain Python arithmetic and a `while`
    loop.
  - *Connects to:* called three times (once per axis) by
    `SurfaceSampler.sample`, built later in this lesson.
  - *Shape:* alongside `closest_point_on_segment`/`barycentric_coordinates`
    in `geometry.py` — general-purpose, not specific to triangles or
    meshes at all.

- **`SurfaceSampler`**
  - *What it is:* a class that places sample points across a mesh's
    actual surface, using a grid-and-filter strategy.
  - *Implementation:* `class SurfaceSampler:` with `__init__(self, mesh,
    finder)` storing both as attributes, plus `sample(self, n)` — built
    across this lesson's final two Concept Units.
  - *Its use:* the direct, from-scratch replacement for `diff3d.py`'s
    `sample_points(mesh, n)` function — used by `align3d()` to get a set
    of representative points on the moving mesh's surface before
    alignment.
  - *Type:* a plain class, composed of a `Mesh` (Lesson 6) and a
    **dependency-injected** (this lesson's own term) finder — either a
    `NearestSurfaceFinder` (Lesson 9) or a `SpatialGrid` (Lesson 11).
  - *Responsibility:* to lay a grid of candidate points across the
    mesh's bounding box, and keep only the ones genuinely close to the
    real surface, using whichever finder it was given to measure that
    closeness.
  - *Depends on:* an already-built `Mesh`, and any object providing a
    `find_closest(point)` method returning a `Triangle` (or `None`).
  - *Connects to:* calls `self.mesh.bounds()`, `self.mesh.area()`
    (this lesson), `frange` (this lesson) three times, and
    `self.finder.find_closest(...)` / `Triangle.closest_point(...)`
    (Lessons 9-10) once per candidate grid point.
  - *Shape:* a new architectural layer — the first class in this
    project that itself depends on *another* search class through
    dependency injection, rather than composing a fixed, specific class
    the way `Triangle` composes `Vector3` or `STLReader` composes
    `BinaryReader`.

---

## Concept Unit: A Triangle's Real Area

### The Problem

`diff3d.py`'s `sample_points()` starts with
`cell_size = np.sqrt(total_area / n)` — deriving a sampling grid's
spacing directly from the mesh's total surface area. Nothing built so
far in this project computes area at all; `Triangle.normal()` (Lesson 5)
computes a *direction* from the same cross product this needs, but
throws away the magnitude that direction was computed from.

> **Before reading on, try this yourself:** `Triangle.normal()`
> computes `edge1.cross(edge2).normalize()` — a raw cross product,
> immediately normalized to length `1`. The magnitude of a cross product
> between two edge vectors is a real, well-known geometric quantity: it
> equals the area of the *parallelogram* those two edges would form if
> swept into a full four-sided shape, not just a triangle. Given that a
> triangle is exactly half of that parallelogram, what would you expect
> `edge1.cross(edge2).length() / 2` to equal?

### Introduce the Concept in Isolation

```python
# Throwaway lab: a triangle's area from the raw (un-normalized) cross product
class Vec3:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z
    def __sub__(self, other):
        return Vec3(self.x - other.x, self.y - other.y, self.z - other.z)
    def cross(self, other):
        return Vec3(
            self.y * other.z - self.z * other.y,
            self.z * other.x - self.x * other.z,
            self.x * other.y - self.y * other.x,
        )
    def dot(self, other):
        return self.x * other.x + self.y * other.y + self.z * other.z

import math
def length(v):
    return math.sqrt(v.dot(v))

a = Vec3(0.0, 0.0, 0.0)
b = Vec3(2.0, 0.0, 0.0)
c = Vec3(0.0, 2.0, 0.0)

edge1 = b - a
edge2 = c - a
raw_normal = edge1.cross(edge2)
area = length(raw_normal) / 2
print(area)
```

Real output:

```
2.0
```

This triangle is a right triangle with two `2`-unit legs along the `x`
and `y` axes — its area, by the ordinary "half base times height"
formula, is `0.5 * 2 * 2 = 2.0`, exactly matching this Concept Unit's
own Socratic prompt.

### Discard the Throwaway Example

This `Vec3`/lab pair is discarded now. `Triangle` gets the real `area()`
next.

### Project Change

- **Reference Source:** `diff3d.py`'s `sample_points()`:
  `total_area = mesh.area`. `pyvista`'s `mesh.area` is itself a
  property, computed internally by summing each face's own area — this
  project's `Triangle.area()` is the from-scratch equivalent of what
  each individual face contributes to that sum.
- **Files affected:** modify `src/vector3d/triangle.py`.
- **Change type:** add.
- **Location:** inside `class Triangle:`, directly after `normal`
  (Lesson 5).
- **Dependencies:** `Vector3.__sub__` (Lesson 2), `Vector3.cross`,
  `Vector3.length` (Lesson 4).

### The New Code

```python
    def area(self):
        edge1 = self.v1 - self.v0
        edge2 = self.v2 - self.v0
        return edge1.cross(edge2).length() / 2
```

### The Updated Project

`src/vector3d/triangle.py` so far, new lines marked:

```
 1  from vector3d.vector import Vector3
 2  from vector3d.geometry import closest_point_on_segment, barycentric_coordinates
 3
 4
 5  class Triangle:
 6      def __init__(self, v0, v1, v2):
 7          self.v0 = v0
 8          self.v1 = v1
 9          self.v2 = v2
10
11      def centroid(self):
12          return (self.v0 + self.v1 + self.v2) / 3
13
14      def normal(self):
15          edge1 = self.v1 - self.v0
16          edge2 = self.v2 - self.v0
17          return edge1.cross(edge2).normalize()
18
19      def area(self):                                                  # ← new
20          edge1 = self.v1 - self.v0                                    # ← new
21          edge2 = self.v2 - self.v0                                    # ← new
22          return edge1.cross(edge2).length() / 2                       # ← new
23
24      def closest_point(self, p):
25          u, v, w = barycentric_coordinates(p, self.v0, self.v1, self.v2)
26          if u >= 0 and v >= 0 and w >= 0:
27              return self.v0 * u + self.v1 * v + self.v2 * w
28
29          candidates = [
30              closest_point_on_segment(p, self.v0, self.v1),
31              closest_point_on_segment(p, self.v1, self.v2),
32              closest_point_on_segment(p, self.v2, self.v0),
33          ]
34          best = None
35          best_distance = None
36          for candidate in candidates:
37              distance = (candidate - p).length()
38              if best_distance is None or distance < best_distance:
39                  best_distance = distance
40                  best = candidate
41          return best
```

`closest_point` (Lesson 10) is shown here unchanged, in full, only to
place `area` correctly relative to it — not elided from the real file.
As a whole, `Triangle` can now report both a direction (`normal`) and a
size (`area`) computed from the identical starting cross product,
diverging only in the last step each one takes with it.

### Mechanical Walkthrough

- **`def area(self):`** — `def`; `area`, an ordinary instance method
  name; `self` only.
- **`edge1 = self.v1 - self.v0`** and **`edge2 = self.v2 - self.v0`** —
  `Vector3.__sub__` (Lesson 2), computing the exact same two edge
  vectors `normal()` (Lesson 5) already computes — genuinely duplicated
  code, not a typo: `normal()`'s own `edge1`/`edge2` local variables go
  out of scope the moment that method returns, so `area()` has no way to
  reuse them without recomputing.
- **`return edge1.cross(edge2).length() / 2`** — `return`, handing back
  a plain number; `edge1.cross(edge2)` — `Vector3.cross` (Lesson 4),
  the identical call `normal()` makes, but here its *result* is used
  directly rather than immediately chained into `.normalize()`;
  `.length()` (Lesson 4) — taking the magnitude of that raw, un-
  normalized cross product, which this Concept Unit's own Socratic
  prompt and lab already established equals the area of the
  parallelogram those two edges span; `/ 2` — ordinary numeric division,
  halving the parallelogram's area to get the triangle's own area,
  since a triangle is exactly half of the parallelogram its two edges
  would otherwise complete.

### CS Lens

This is the **cross product magnitude as area** — a specific, well-known
geometric fact (distinct from the cross product's *direction*, which
`Triangle.normal()` already uses): the magnitude of `a × b` equals the
area of the parallelogram `a` and `b` span, for any two vectors in 3D.

Also recognized in: physics (torque's magnitude, computed via a cross
product, is proportional to this same "area swept" geometric idea);
computer graphics mesh processing (per-face area is a common weighting
factor — for instance, weighting a vertex normal's contribution from
each surrounding face by that face's own area, rather than treating
every face equally, is a real, common refinement this project's own
Phase D vertex-normal averaging could adopt, though it doesn't); surveying
and GIS (the "shoelace formula" for polygon area in 2D is a close
relative of this same cross-product-based area computation).

### SE Lens

The principle is **accepting small, deliberate duplication over a
worse alternative**, worth naming honestly since it looks, at a glance,
like it violates this project's own "compose from reused primitives"
principle from earlier lessons: `area()` recomputes `edge1`/`edge2`
rather than somehow sharing them with `normal()`.

The alternative not chosen: have `normal()` return *both* the unit
normal and the raw magnitude (say, as a tuple), so `area()` could call
`normal()` and extract what it needs instead of recomputing the edges.
That would eliminate the duplication, at a real cost: it would change
`normal()`'s own return type and meaning, breaking every earlier lesson
that already calls `triangle.normal()` expecting a single `Vector3`
back, purely to serve a caller (`area()`) that only sometimes needs the
extra information. Two small, independent methods, each recomputing a
cheap cross product from scratch, is the more honest design here than
distorting an already-established, already-used method's contract to
avoid a few lines of real but harmless duplication.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3
from vector3d.triangle import Triangle

t1 = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0), Vector3(0.0, 2.0, 0.0))
t2 = Triangle(Vector3(1.0, 1.0, 3.0), Vector3(3.0, 1.0, 3.0), Vector3(1.0, 3.0, 3.0))
print(t1.area())
print(t2.area())
"
```

Real output:

```
2.0
2.0
```

Both familiar triangles from every lesson since Lesson 6 are congruent
(`t2` is `t1` translated in space, not reshaped), so both report the
identical area, `2.0` — a useful, checkable consistency proof.

### Connect

`Triangle` can now report its own area. The next Concept Unit sums every
triangle's area to get a whole mesh's total.

---

## Concept Unit: Summing the Whole Mesh's Area

### The Problem

`sample_points()` needs `mesh.area` — the *entire* mesh's surface area,
not any one triangle's. Nothing built so far sums a value across every
triangle in a mesh; `Mesh.bounds()` (Lesson 6) reduces per-vertex
coordinates to a min/max, a genuinely different reduction shape than
"add up one number from each triangle."

> **Before reading on, try this yourself:** given `Triangle.area()`
> (built in this lesson's previous Concept Unit) and `self.triangles`
> (a plain list, Lesson 6), what's the simplest loop that could compute
> a running total, adding one triangle's area on each pass? (This is a
> more basic shape than Lesson 9's running-best pattern — there's no
> comparison here, only accumulation.)

### Introduce the Concept in Isolation

```python
# Throwaway lab: summing a value pulled from each item in a collection
class Box:
    def __init__(self, volume):
        self.volume = volume

boxes = [Box(2.0), Box(5.5), Box(1.0)]

total = 0
for box in boxes:
    total += box.volume

print(total)
```

Real output:

```
8.5
```

`2.0 + 5.5 + 1.0` is `8.5`, confirmed by real arithmetic — a running
total, starting at `0`, accumulated one `.volume` at a time via `+=`
(already familiar from Lesson 9's own `self.offset += n` and this
project's other running-total patterns).

### Discard the Throwaway Example

This `Box`/lab pair is discarded now. `Mesh` gets the real `area()`
next.

### Project Change

- **Reference Source:** `diff3d.py`'s `sample_points()`:
  `total_area = mesh.area`.
- **Files affected:** modify `src/vector3d/mesh.py`.
- **Change type:** add.
- **Location:** inside `class Mesh:`, directly after `center` (Lesson
  6).
- **Dependencies:** `self.triangles` (Lesson 6) and `Triangle.area`
  (earlier in this lesson).

### The New Code

```python
    def area(self):
        total = 0
        for triangle in self.triangles:
            total += triangle.area()
        return total
```

### The Updated Project

`src/vector3d/mesh.py` in full, new lines marked:

```
 1  from vector3d.vector import Vector3
 2
 3
 4  class Mesh:
 5      def __init__(self, triangles):
 6          self.triangles = triangles
 7
 8      def bounds(self):
 9          xs = []
10          ys = []
11          zs = []
12          for triangle in self.triangles:
13              for vertex in (triangle.v0, triangle.v1, triangle.v2):
14                  xs.append(vertex.x)
15                  ys.append(vertex.y)
16                  zs.append(vertex.z)
17          return (min(xs), max(xs), min(ys), max(ys), min(zs), max(zs))
18
19      @property
20      def center(self):
21          xmin, xmax, ymin, ymax, zmin, zmax = self.bounds()
22          return Vector3((xmin + xmax) / 2, (ymin + ymax) / 2, (zmin + zmax) / 2)
23
24      def area(self):                                                  # ← new
25          total = 0                                                    # ← new
26          for triangle in self.triangles:                              # ← new
27              total += triangle.area()                                 # ← new
28          return total                                                 # ← new
```

As a whole, `Mesh` now reports its total surface area — the last piece
`SurfaceSampler` (built later in this lesson) needs to derive a sensible
grid spacing.

### Mechanical Walkthrough

- **`def area(self):`** — `def`; `area`, an ordinary instance method
  name; `self` only.
- **`total = 0`** — a running-total variable, initialized to `0` (an
  ordinary starting value here, not a sentinel the way `None` was for
  Lesson 9's running-*best* pattern — there's no "nothing seen yet"
  special case for a sum, since adding `0` to anything never changes
  it).
- **`for triangle in self.triangles:`** — the same `for` loop shape used
  throughout this project since Lesson 6.
- **`total += triangle.area()`** — `triangle.area()` calls the method
  built earlier in this lesson; `+=` (already familiar) adds that
  triangle's area onto the running total.
- **`return total`** — `return`, handing back the final sum once every
  triangle has been visited.

### CS Lens

This is a **fold** (or **sum reduction**) — the simplest member of the
same reduction family Lesson 6's CS Lens already named for `min()`/
`max()`, here specialized to plain addition rather than comparison.

Also recognized in: every "total price," "total distance," or
"total score" computation in ordinary business or game logic; database
`SUM()` aggregate queries; `numpy`'s own `.sum()`, which is exactly what
`mesh.area` leans on internally in the original script.

### SE Lens

The principle is the same one already established for `Mesh.bounds()`
in Lesson 6: a straightforward single-pass scan, no attempt at anything
more sophisticated, because summing every triangle's area is
unavoidably an O(n) operation — there's no shortcut that avoids visiting
every triangle at least once, unlike Lesson 11's `SpatialGrid`, which
exists specifically because *nearest-neighbor* search, unlike a plain
sum, genuinely can be sped up by skipping most of the data.

The alternative not chosen: cache the computed total the first time
`area()` runs, returning the cached value on subsequent calls instead of
re-summing every time — the same caching idea `Mesh.center`'s own SE
Lens (Lesson 6) already flagged as unbuilt for a different method. The
same honest tradeoff applies here: this project's own usage never calls
`area()` repeatedly enough for the missing cache to matter yet.

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

t1 = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0), Vector3(0.0, 2.0, 0.0))
t2 = Triangle(Vector3(1.0, 1.0, 3.0), Vector3(3.0, 1.0, 3.0), Vector3(1.0, 3.0, 3.0))
mesh = Mesh([t1, t2])
print(mesh.area())
"
```

Real output:

```
4.0
```

Two triangles, each with area `2.0` (confirmed in the previous Concept
Unit), correctly summing to `4.0`.

### Connect

`Mesh` can now report its total surface area. The next Concept Unit
builds a small, independent helper this lesson's sampling grid needs:
stepping through float coordinates, which Python's own `range()` can't
do.

---

## Concept Unit: Stepping Through Floats — `frange`

### The Problem

`diff3d.py`'s `sample_points()` builds its sampling grid with
`np.arange(xmin, xmax + cell_size, cell_size)` — evenly-spaced float
values, stepped by a float `cell_size` that's almost never a whole
number. Python's own built-in `range()` only supports whole-number
start/stop/step values; calling it with a float raises an error. Nothing
built so far in this project can produce a float-stepped sequence.

> **Before reading on, try this yourself:** `range()` works by
> repeatedly adding its step to a running value until it reaches the
> stop value — you can't see that happening (it's built into Python),
> but the *behavior* is something you can reproduce yourself with an
> ordinary loop that keeps a running value, appends it to a list, and
> adds the step, stopping once the running value passes the stop value.
> Which kind of loop — one that repeats a known number of times, or one
> that repeats *until a condition is met* — fits that description
> better, given that the exact number of steps needed depends on
> `start`, `stop`, and `step`, all three of which could be any float?

### Introduce the Concept in Isolation

```python
# Throwaway lab: stepping through fractional values, which range() can't do
def frange(start, stop, step):
    values = []
    x = start
    while x <= stop:
        values.append(x)
        x += step
    return values

print(frange(0.0, 2.0, 0.5))
print(frange(-1.0, 1.0, 0.5))
```

Real output:

```
[0.0, 0.5, 1.0, 1.5, 2.0]
[-1.0, -0.5, 0.0, 0.5, 1.0]
```

Both calls produce exactly the expected evenly-spaced sequences,
correctly including both endpoints (`2.0` in the first call, `1.0` in
the second) since `x <= stop` — this lesson's own **`while` loop**,
answering the Socratic prompt above — keeps running as long as the
current value hasn't yet exceeded `stop`, appending it first each time.

### Discard the Throwaway Example

This scratch `frange` is discarded now — but only from the label of
"throwaway": the real project version, built next, is essentially
identical code, moved into the project's own `geometry.py`.

### Project Change

- **Reference Source:** `diff3d.py`'s `sample_points()`:
  `xs = np.arange(xmin, xmax+cell_size, cell_size)` (and identically for
  `ys`, `zs`). `np.arange` is `numpy`'s own float-capable equivalent of
  Python's built-in `range()`; `frange` is this project's from-scratch
  equivalent.
- **Files affected:** modify `src/vector3d/geometry.py`.
- **Change type:** add.
- **Location:** directly after `barycentric_coordinates` (Lesson 10).
- **Dependencies:** none beyond plain Python arithmetic.

### The New Code

```python
def frange(start, stop, step):
    values = []
    x = start
    while x <= stop:
        values.append(x)
        x += step
    return values
```

### The Updated Project

`src/vector3d/geometry.py` in full, new lines marked:

```
 1  def closest_point_on_segment(p, a, b):
 2      ab = b - a
 3      t = (p - a).dot(ab) / ab.dot(ab)
 4      if t < 0.0:
 5          t = 0.0
 6      elif t > 1.0:
 7          t = 1.0
 8      return a + ab * t
 9
10
11  def barycentric_coordinates(p, a, b, c):
12      v0 = b - a
13      v1 = c - a
14      v2 = p - a
15      d00 = v0.dot(v0)
16      d01 = v0.dot(v1)
17      d11 = v1.dot(v1)
18      d20 = v2.dot(v0)
19      d21 = v2.dot(v1)
20      denom = d00 * d11 - d01 * d01
21      v = (d11 * d20 - d01 * d21) / denom
22      w = (d00 * d21 - d01 * d20) / denom
23      u = 1.0 - v - w
24      return (u, v, w)
25
26
27  def frange(start, stop, step):                                       # ← new
28      values = []                                                      # ← new
29      x = start                                                        # ← new
30      while x <= stop:                                                 # ← new
31          values.append(x)                                             # ← new
32          x += step                                                    # ← new
33      return values                                                    # ← new
```

As a whole, `geometry.py` now holds three standalone functions —
closest-point, barycentric coordinates, and float-stepping — none of
them specific to `Triangle` or `Mesh`, all reusable wherever this
project (or a future one) needs them.

### Mechanical Walkthrough

- **`def frange(start, stop, step):`** — `def`, a module-level function
  (Lesson 10's own term), taking three plain numbers.
- **`values = []`** — an empty list, to be filled by the loop below.
- **`x = start`** — a running value, initialized to exactly `start`.
- **`while x <= stop:`** — Python's `while` loop (this lesson's own
  term): unlike every `for` loop used throughout this project, which
  iterates a fixed, already-known number of times over an existing
  collection, a `while` loop re-checks its condition before every single
  pass and keeps going as long as it holds — here, "as long as the
  running value hasn't exceeded `stop`."
- **`values.append(x)`** — adding the current running value onto the
  list (already-familiar `.append()`, used the same way since Lesson
  6).
- **`x += step`** — the same augmented-assignment operator from Lesson
  7's `self.offset += n`, advancing the running value by `step` before
  the loop's condition is checked again.
- **`return values`** — `return`, handing back the complete list once
  the `while` condition finally fails.

### CS Lens

This is a **generator loop** (built here as an eagerly-built list,
rather than Python's own lazy `yield`-based generators, which this
project doesn't use) — producing a sequence by repeated stepping, the
general technique underlying `range()` itself, `numpy.arange`, and any
other evenly-spaced-sequence utility.

Also recognized in: audio sample-rate generation (producing evenly-
spaced time values at a fixed interval); animation frame timing
(stepping through timestamps at a fixed frame duration); numerical
integration (many basic numerical methods, like a simple Riemann-sum
area approximation, step through an interval at a fixed width — the
exact "step across a range, do something at each stop" shape this
lesson's own `SurfaceSampler`, built next, uses for genuinely spatial
purposes instead of time or numeric integration).

### SE Lens

The principle is **matching the tool to what's actually needed** —
`frange` is a deliberately minimal, single-purpose helper (no negative-
step support, no fancy edge-case handling), built because this project
needs exactly one thing (float-steppable ranges for a 3D sampling grid)
that Python's own `range()` doesn't provide.

The alternative not chosen: use Python's real `yield`-based generator
syntax (`def frange(start, stop, step): x = start; while x <= stop: yield x; x += step`)
instead of building and returning a full list. A generator would use
less memory for a very large range (it produces values one at a time,
on demand, rather than holding every value in memory at once) — a real
advantage this project doesn't currently need, since its own sampling
grids are modest in size; the list-returning version used here is
simpler to reason about and to print/inspect directly (as this Concept
Unit's own `Run It` does), at the cost of that memory efficiency.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.geometry import frange

print(frange(0.0, 2.0, 0.5))
print(frange(-1.0, 1.0, 0.5))
"
```

Real output:

```
[0.0, 0.5, 1.0, 1.5, 2.0]
[-1.0, -0.5, 0.0, 0.5, 1.0]
```

Identical to this Concept Unit's own throwaway lab — the "real" version
is, deliberately, the same code, now living in the project.

### Connect

Every supporting piece this lesson needs now exists: `Triangle.area`,
`Mesh.area`, and `frange`. The final Concept Unit combines all three,
plus a dependency-injected finder, into the actual sampling algorithm.

---

## Concept Unit: Building the Sampler — Dependency Injection and the Grid

### The Problem

`diff3d.py`'s `sample_points(mesh, n)` builds a grid of candidate points
across the mesh's bounding box, finds each one's closest point on the
mesh surface, and keeps only the ones close enough to that surface to
count as genuinely "on" it. This project has two different, fully
interchangeable ways to find a closest point —
`NearestSurfaceFinder` (Lesson 9, always correct) and `SpatialGrid`
(Lesson 11, faster, with a documented edge case) — and nothing yet ties
the sampling algorithm to either one, or, ideally, commits to neither in
particular.

> **Before reading on, try this yourself:** both `NearestSurfaceFinder`
> and `SpatialGrid` offer an identical method, `find_closest(point)`,
> returning a `Triangle`. If a new class's `__init__` accepted *either
> one* as a plain constructor argument — call it `finder` — and every
> place that class needed to find a closest point just called
> `self.finder.find_closest(point)`, would that class's own code need to
> know or check which of the two it actually received? (This lesson's
> own Terms section already names the two ideas at play here —
> **dependency injection** and **duck typing** — worth connecting to
> your own answer before reading on.)

### Introduce the Concept in Isolation

```python
# Throwaway lab: a class that receives a strategy object instead of hard-coding one
class LoudGreeter:
    def greet(self, name):
        return f"HELLO, {name.upper()}!"

class QuietGreeter:
    def greet(self, name):
        return f"hi, {name}."

class Receptionist:
    def __init__(self, greeter):
        self.greeter = greeter

    def welcome(self, name):
        return self.greeter.greet(name)

r1 = Receptionist(LoudGreeter())
r2 = Receptionist(QuietGreeter())
print(r1.welcome("Sam"))
print(r2.welcome("Sam"))
```

Real output:

```
HELLO, SAM!
hi, Sam.
```

`Receptionist.welcome` never checks what type `self.greeter` actually
is — it just calls `.greet(name)` and trusts the result, exactly the
**duck typing** this lesson's own Terms section names. Swapping
`LoudGreeter()` for `QuietGreeter()` at construction time, with zero
changes to `Receptionist`'s own code, is **dependency injection** in
its simplest, most concrete form — the identical shape
`SurfaceSampler`, built next, will use with `NearestSurfaceFinder`/
`SpatialGrid` in place of `LoudGreeter`/`QuietGreeter`.

### Discard the Throwaway Example

This `Greeter`/`Receptionist` pair is discarded now. `SurfaceSampler`
gets the real dependency-injected `finder` next.

### Project Change

- **Reference Source:** `diff3d.py`'s `sample_points()`, in full — this
  method is its direct, from-scratch replacement, with one deliberate,
  named simplification: the original filter,
  `if np.max(np.abs(p-g)) <= cell_size/2`, measures "closeness" using
  the largest single-axis difference (a Chebyshev/max-norm distance);
  this project's own version measures ordinary straight-line distance
  via `Vector3.length()` (Lesson 4) instead — a real, different metric
  (a square filter region versus a spherical one), chosen because this
  project already has a working, well-tested `.length()` and building a
  second, max-axis distance function purely to match `numpy`'s specific
  choice here wasn't judged worth the added surface area for this
  curriculum's own purposes.
- **Files affected:** create `src/vector3d/surface_sampler.py` (new
  file).
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** `Mesh.bounds`/`Mesh.area` (Lesson 6 and earlier in
  this lesson), `frange` (earlier in this lesson), `Vector3.__init__`
  (Lesson 1), `Vector3.__sub__`/`Vector3.length` (Lessons 2 and 4), and
  any object offering `find_closest(point)` — `NearestSurfaceFinder`
  (Lesson 9) or `SpatialGrid` (Lesson 11).

### The New Code

Type this into `src/vector3d/surface_sampler.py`:

```python
import math

from vector3d.vector import Vector3
from vector3d.geometry import frange


class SurfaceSampler:
    def __init__(self, mesh, finder):
        self.mesh = mesh
        self.finder = finder

    def sample(self, n):
        xmin, xmax, ymin, ymax, zmin, zmax = self.mesh.bounds()
        total_area = self.mesh.area()
        cell_size = math.sqrt(total_area / n)

        points = []
        for x in frange(xmin, xmax + cell_size, cell_size):
            for y in frange(ymin, ymax + cell_size, cell_size):
                for z in frange(zmin, zmax + cell_size, cell_size):
                    grid_point = Vector3(x, y, z)
                    triangle = self.finder.find_closest(grid_point)
                    if triangle is None:
                        continue
                    surface_point = triangle.closest_point(grid_point)
                    if (surface_point - grid_point).length() <= cell_size / 2:
                        points.append(surface_point)
        return points
```

### The Updated Project

This is the whole new file — nothing larger to return to yet (the same
brand-new-file exemption used throughout this curriculum):

```
 1  import math
 2
 3  from vector3d.vector import Vector3
 4  from vector3d.geometry import frange
 5
 6
 7  class SurfaceSampler:
 8      def __init__(self, mesh, finder):
 9          self.mesh = mesh
10          self.finder = finder
11
12      def sample(self, n):
13          xmin, xmax, ymin, ymax, zmin, zmax = self.mesh.bounds()
14          total_area = self.mesh.area()
15          cell_size = math.sqrt(total_area / n)
16
17          points = []
18          for x in frange(xmin, xmax + cell_size, cell_size):
19              for y in frange(ymin, ymax + cell_size, cell_size):
20                  for z in frange(zmin, zmax + cell_size, cell_size):
21                      grid_point = Vector3(x, y, z)
22                      triangle = self.finder.find_closest(grid_point)
23                      if triangle is None:
24                          continue
25                      surface_point = triangle.closest_point(grid_point)
26                      if (surface_point - grid_point).length() <= cell_size / 2:
27                          points.append(surface_point)
28          return points
```

As a whole, this file defines a complete, working replacement for
`sample_points()` — accepting any `Mesh` and any `find_closest`-capable
finder, and returning a real list of `Vector3` points genuinely on (or
extremely near) the mesh's actual surface.

### Mechanical Walkthrough

- **`import math`**, **`from vector3d.vector import Vector3`**, **`from
  vector3d.geometry import frange`** — already-familiar import forms
  from earlier lessons, pulling in exactly what this file needs.
- **`def __init__(self, mesh, finder):`** / **`self.mesh = mesh`** /
  **`self.finder = finder`** — the same `class`/`__init__`/attribute-
  assignment pattern used throughout this project; `finder` is stored
  exactly as handed in, with no type-checking at all — the direct
  implementation of this lesson's own **dependency injection** and
  **duck typing** terms.
- **`def sample(self, n):`** — `def`; `sample`, an ordinary instance
  method name; `self` and `n` — the target sample count, the same `n`
  `sample_points(mesh, n)` itself takes.
- **`xmin, xmax, ymin, ymax, zmin, zmax = self.mesh.bounds()`** — the
  same tuple-unpacking pattern used since `Mesh.center` (Lesson 6),
  applied to `self.mesh`'s own `bounds()` (Lesson 6).
- **`total_area = self.mesh.area()`** — calling `Mesh.area` (earlier in
  this lesson).
- **`cell_size = math.sqrt(total_area / n)`** — `math.sqrt` (Lesson 4),
  applied to the total area divided by the target point count — the
  identical formula `diff3d.py`'s own `sample_points()` uses, producing
  a grid spacing coarser for a small `n` and finer for a large one.
- **`points = []`** — an empty list, to be filled by the triple-nested
  loop below.
- **`for x in frange(xmin, xmax + cell_size, cell_size):`** (and
  identically nested for `y`, `z`) — three nested `for` loops (the same
  nesting depth `SpatialGrid.find_closest`'s neighbor search used in
  Lesson 11, here iterating over `frange`'s own float sequences, this
  lesson's own function, rather than a fixed `(-1, 0, 1)`); the extra
  `+ cell_size` on each axis's stop value ensures the grid actually
  reaches past the mesh's own maximum bound, rather than stopping one
  step short of it.
- **`grid_point = Vector3(x, y, z)`** — `Vector3.__init__` (Lesson 1),
  building one candidate point from the current `x`/`y`/`z` combination.
- **`triangle = self.finder.find_closest(grid_point)`** — calling
  `find_closest` on whichever object `self.finder` actually holds
  (Lesson 9's `NearestSurfaceFinder` or Lesson 11's `SpatialGrid`), with
  no branching or type-checking at the call site at all.
- **`if triangle is None: continue`** — `is None` (Lesson 3's identity
  check, reused since Lesson 9), guarding against exactly the real,
  documented case Lesson 11's own SE Lens demonstrated: `SpatialGrid`
  can return `None` when a query point's neighborhood contains no
  triangles at all; `continue` (already-familiar Python — skips the rest
  of this loop pass, moving straight to the next candidate `z`) is what
  keeps that documented limitation from crashing this method outright.
- **`surface_point = triangle.closest_point(grid_point)`** —
  `Triangle.closest_point` (Lesson 10), finding the real closest point
  on the found triangle's surface to this specific grid point.
- **`if (surface_point - grid_point).length() <= cell_size / 2:`** —
  `Vector3.__sub__` (Lesson 2) and `Vector3.length` (Lesson 4),
  measuring the real straight-line distance between the candidate grid
  point and its nearest surface point; keeping it only if that distance
  is small enough, relative to the grid's own spacing, to count as
  genuinely "on" the surface rather than floating somewhere in empty
  space nearby.
- **`points.append(surface_point)`** — note carefully: the point kept is
  `surface_point` (the real point *on* the mesh), not `grid_point` (the
  candidate position that happened to be nearby) — the sample points
  this method returns always lie exactly on the mesh's actual surface,
  never floating just off it.
- **`return points`** — `return`, handing back every point that survived
  the filter.

### CS Lens

This is **grid-based surface sampling** (also called "point cloud
generation" in some contexts) — approximating a continuous surface with
a finite, evenly-distributed set of discrete points, by testing
candidates from a regular grid rather than trying to analytically
parameterize the surface directly.

Also recognized in: 3D scanning and photogrammetry pipelines (raw scan
data often starts as exactly this kind of point cloud, later processed
into a mesh — this project runs that relationship in reverse, generating
a point cloud *from* an already-existing mesh); terrain/heightmap
generation in games (sampling a continuous noise function on a regular
grid to produce discrete terrain points); Monte Carlo and quasi-Monte
Carlo integration methods (approximating a continuous quantity — here, a
surface — using a finite set of sample points, though those methods more
often use random or low-discrepancy sampling rather than this lesson's
regular grid).

### SE Lens

The principle here is the same **dependency injection** this lesson's
own Concept Unit is named for: `SurfaceSampler` depends on the
*capability* of finding a closest point, not on any one specific
implementation of that capability — a real design choice with a real,
checkable consequence.

Checked directly: running this method with `NearestSurfaceFinder`
against the two familiar triangles from every lesson since Lesson 6
(`n=20`) produces `40` sample points; running the identical `sample(20)`
call with `SpatialGrid` (`cell_size=1.0`) instead produces `38` — two
fewer. This is not a bug in `SurfaceSampler`; it's `SpatialGrid`'s own
already-documented limitation (Lesson 11's SE Lens) propagating forward:
a handful of grid points near this small mesh's cell boundaries land in
neighborhoods `SpatialGrid` doesn't fully cover, returning `None` where
`NearestSurfaceFinder` would have found a real answer. Dependency
injection doesn't eliminate a finder's own limitations — it just means
`SurfaceSampler` never has to know about them, and a caller who does
care can choose `NearestSurfaceFinder` specifically when exhaustive
correctness matters more than speed.

The alternative not chosen: hard-code `SurfaceSampler` to build and use
its own internal `NearestSurfaceFinder`, with no `finder` parameter at
all. That would be simpler to construct (`SurfaceSampler(mesh)`, one
argument instead of two) and would avoid ever seeing the small
discrepancy just described — at the real cost of losing the ability to
opt into `SpatialGrid`'s speed for a large mesh, where Lesson 9's own
brute-force scan, repeated once per grid point across potentially
thousands of candidates, would become genuinely, not just
theoretically, slow.

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
from vector3d.spatial_grid import SpatialGrid
from vector3d.surface_sampler import SurfaceSampler

t1 = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0), Vector3(0.0, 2.0, 0.0))
t2 = Triangle(Vector3(1.0, 1.0, 3.0), Vector3(3.0, 1.0, 3.0), Vector3(1.0, 3.0, 3.0))
mesh = Mesh([t1, t2])

finder = NearestSurfaceFinder(mesh)
sampler = SurfaceSampler(mesh, finder)
points = sampler.sample(20)
print(len(points))
for p in points[:5]:
    print(p)

grid = SpatialGrid(mesh, cell_size=1.0)
sampler2 = SurfaceSampler(mesh, grid)
points2 = sampler2.sample(20)
print(len(points2))
"
```

Real output:

```
40
Vector3(0.0, 0.0, 0.0)
Vector3(0.0, 0.4472135954999579, 0.0)
Vector3(0.0, 0.8944271909999159, 0.0)
Vector3(0.0, 1.3416407864998738, 0.0)
Vector3(0.0, 1.7888543819998317, 0.0)
38
```

`SurfaceSampler(mesh, finder)` and `SurfaceSampler(mesh, grid)` — the
identical class, constructed with two different finders, with zero
changes to `SurfaceSampler`'s own code between the two calls — produce
`40` and `38` points respectively, exactly the real, checkable
discrepancy this Concept Unit's own SE Lens discussed rather than
glossed over.

### Connect

Phase D's first lesson is complete: `SurfaceSampler` can generate a
realistic point cloud from any mesh, using either of Phase C's two
interchangeable search strategies. The points it returns are exactly
what the next lesson needs raw material for: averaging nearby face
normals into smooth per-vertex normals.

---

## Connect the Pieces

One value, traced through this entire lesson: `mesh.area()` (second
Concept Unit) sums `t1.area()` and `t2.area()` (first Concept Unit,
each computed from a raw, un-normalized `edge1.cross(edge2)` — the exact
same starting computation `normal()` uses, diverging only in whether the
result gets normalized away or kept as a magnitude) to get `4.0`.
`SurfaceSampler.sample(20)` (fourth Concept Unit) divides that by `20`
and takes a square root to get `cell_size`, then calls `frange` (third
Concept Unit) three times to build the `x`/`y`/`z` coordinate lists a
triple-nested loop walks through. For each resulting `grid_point`, the
dependency-injected `self.finder` — `NearestSurfaceFinder` or
`SpatialGrid`, `SurfaceSampler`'s own code never knowing which —
finds a candidate triangle, `Triangle.closest_point` (Lesson 10) finds
the real surface point, and a distance check (Lesson 2's `__sub__`,
Lesson 4's `length`) decides whether to keep it. Two completely
different finder objects, injected into the identical class, produce
two close-but-not-identical point clouds — `40` points versus `38` —
not because `SurfaceSampler` behaves differently, but because the two
finders it was handed genuinely differ, exactly as Lesson 11's own
documented limitation predicted they could.

---

## Try It Yourself

Type `area()` into your own `triangle.py` and `mesh.py`, `frange` into
your own `geometry.py`, and `SurfaceSampler` into a new
`surface_sampler.py` (not copy-pasted). Confirm both `Run It` outputs
above. Then, once that works, try sampling with a much larger `n` (say,
`200` instead of `20`) using `NearestSurfaceFinder`, and look at how the
returned point count and `cell_size` actually change — think about why
a *finer* grid (smaller `cell_size`) is what a *larger* target `n`
produces, given the formula this lesson's own Mechanical Walkthrough
already named:

```python
sampler3 = SurfaceSampler(mesh, NearestSurfaceFinder(mesh))
points3 = sampler3.sample(200)
print(len(points3))
```
