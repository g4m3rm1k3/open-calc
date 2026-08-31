# Lesson 10: Point-to-Triangle Distance — The Real Geometry

**What you will build:** a new file, `src/vector3d/geometry.py`, holding
two standalone geometric functions — `closest_point_on_segment` and
`barycentric_coordinates` — combined into a new `Triangle.closest_point()`
method that replaces Lesson 9's honest, named approximation (distance to
a triangle's *centroid*) with the real, exact closest point anywhere on
a triangle's actual surface. `NearestSurfaceFinder.find_closest`
(Lesson 9) gets one line changed to use it. Along the way, `Vector3`
finally gets `__mul__` (scaling a vector *up* by a number) — the
operator Lesson 5's own SE Lens named and deliberately left unbuilt,
because nothing needed it yet. This lesson is the one that needed it.

**What you need to know first:** Phase A in full (`Vector3` — Lesson
4's `dot`, Lesson 2's `__add__`/`__sub__`; `Triangle` — Lesson 5's
`v0`/`v1`/`v2`) and Lesson 9 (`NearestSurfaceFinder`, the running-best
scanning pattern, and the specific, named centroid-distance
approximation this lesson closes).

**Terms used in this lesson:**
- **`__mul__`** — the dunder method Python calls when `*` is used
  between an object and something else — here, a `Vector3` and a plain
  scalar, the same shape `__truediv__` (Lesson 5) already has, just the
  opposite direction: scaling a vector's length *up* (or down, for a
  fraction between `0` and `1`) rather than only dividing it down.
- **module-level function** — a function defined directly in a file, not
  inside any class — `closest_point_on_segment`/`barycentric_coordinates`,
  built in this lesson, are this project's first examples. Every
  function built so far has been a method, living on `self`. A
  module-level function exists for operations that don't naturally
  belong to any one object — "the closest point on a segment" isn't
  really a property of the segment, the point, or any single thing
  involved; it's a relationship between three independent inputs, none
  of which is more the "owner" than the others.
- **line segment** — a finite piece of a straight line, bounded by two
  endpoints, as opposed to an infinite line extending forever in both
  directions. A triangle's edge is a line segment, not a full line — a
  point can be "closest to the line an edge sits on" at a spot that
  falls *past* one of the edge's actual endpoints, which is exactly the
  case this lesson's segment-clamping logic exists to handle correctly.
- **parametric point on a segment** — expressing any point on a segment
  from `a` to `b` as `a + t * (b - a)`, where `t` is a single number: `t
  = 0` gives exactly `a`, `t = 1` gives exactly `b`, and any `t` between
  them gives a point proportionally between the two. It exists as a
  compact way to describe every point on a segment using one number
  instead of a full coordinate.
- **clamping** — restricting a number to a fixed range by replacing it
  with the nearest boundary value whenever it falls outside that range
  (`t` below `0` becomes exactly `0`; `t` above `1` becomes exactly
  `1`). It exists here specifically to keep the parametric point above
  from ever landing outside the segment's actual two endpoints, even
  though the underlying formula, on its own, would happily compute a
  point on the *infinite line* extending past either end.
- **barycentric coordinates** — a way of expressing any point in a
  triangle's plane as a weighted combination of the triangle's three
  vertices — three numbers `(u, v, w)` that always add up to `1`, where
  each one says how much that point is "pulled toward" the
  correspondingly-named vertex. A vertex itself has barycentric
  coordinates like `(1, 0, 0)` (entirely itself, none of the other two);
  the centroid (Lesson 5) has `(1/3, 1/3, 1/3)` (equal weight to all
  three). It exists because a point being genuinely *inside* a triangle
  is exactly the condition "all three barycentric coordinates are
  non-negative" — outside that condition, at least one coordinate goes
  negative, which is this lesson's own test for "the projected point
  isn't actually inside the triangle, so the real closest point must be
  on an edge instead."

**Objects and methods used:**

- **`Vector3.__mul__`**
  - *What it is:* the dunder method Python calls when `*` is used
    between a `Vector3` and a plain number.
  - *Implementation:* `def __mul__(self, n): return Vector3(self.x * n, self.y * n, self.z * n)`
    — takes `self` and a scalar `n`, returns a new `Vector3`.
  - *Its use:* both `closest_point_on_segment` and
    `Triangle.closest_point` (both built later in this lesson) need to
    scale a vector *up* by a fractional or whole number — `ab * t`,
    `self.v0 * u` — the exact operation Lesson 5's SE Lens predicted
    this project would eventually need.
  - *Type:* an instance method, dunder, invoked implicitly by `*`.
  - *Responsibility:* to multiply every component of `self` by a single
    scalar, returning a new `Vector3`, leaving `self` unmodified.
  - *Depends on:* `self`'s own `.x`/`.y`/`.z` and `Vector3.__init__`
    (Lesson 1).
  - *Connects to:* called automatically by `*`; used directly inside
    both new `geometry.py` functions and `Triangle.closest_point`, all
    built later in this lesson.
  - *Shape:* `Vector3`'s own layer — completing the pair `__truediv__`
    (Lesson 5) started: a `Vector3` can now be scaled in either
    direction by a plain number.

- **`closest_point_on_segment`**
  - *What it is:* a module-level function computing the closest point,
    anywhere on a finite line segment from `a` to `b`, to a given point
    `p`.
  - *Implementation:*
    ```
    def closest_point_on_segment(p, a, b):
        ab = b - a
        t = (p - a).dot(ab) / ab.dot(ab)
        if t < 0.0:
            t = 0.0
        elif t > 1.0:
            t = 1.0
        return a + ab * t
    ```
    — takes three `Vector3`s, returns a new `Vector3` guaranteed to lie
    on the segment between `a` and `b`.
  - *Its use:* `Triangle.closest_point` (built later in this lesson)
    falls back to this function once per edge, whenever a query point's
    projection lands outside the triangle itself.
  - *Type:* a module-level function (this lesson's own term) — not a
    method on any class.
  - *Responsibility:* to find the single closest point on one specific
    finite segment, correctly handling the case where the mathematically
    "closest point on the infinite line" would fall past one of the
    segment's real endpoints.
  - *Depends on:* `Vector3.__sub__` (Lesson 2), `Vector3.dot` (Lesson
    4), and `Vector3.__mul__`/`Vector3.__add__` (this lesson and Lesson
    2) to build its result.
  - *Connects to:* called three times (once per edge) by
    `Triangle.closest_point`, built later in this lesson.
  - *Shape:* a new, independent piece of this project's geometry
    toolkit — not attached to `Vector3` or `Triangle` directly, callable
    on any three points regardless of which class (if any) they came
    from.

- **`barycentric_coordinates`**
  - *What it is:* a module-level function computing the barycentric
    coordinates (this lesson's own term) of a point's projection onto
    the plane defined by a triangle's three vertices.
  - *Implementation:*
    ```
    def barycentric_coordinates(p, a, b, c):
        v0 = b - a
        v1 = c - a
        v2 = p - a
        d00 = v0.dot(v0)
        d01 = v0.dot(v1)
        d11 = v1.dot(v1)
        d20 = v2.dot(v0)
        d21 = v2.dot(v1)
        denom = d00 * d11 - d01 * d01
        v = (d11 * d20 - d01 * d21) / denom
        w = (d00 * d21 - d01 * d20) / denom
        u = 1.0 - v - w
        return (u, v, w)
    ```
    — takes four `Vector3`s (a query point and a triangle's three
    vertices), returns a 3-element tuple of plain numbers.
  - *Its use:* `Triangle.closest_point` uses the sign of these three
    numbers to decide, immediately, whether a query point's projection
    lands inside the triangle at all — the deciding test this whole
    lesson's algorithm is built around.
  - *Type:* a module-level function.
  - *Responsibility:* to compute exactly three numbers, always summing
    to `1`, correctly describing where a point's planar projection sits
    relative to the triangle's three vertices — including correctly
    producing a negative value whenever the projection falls outside the
    triangle.
  - *Depends on:* `Vector3.__sub__` (Lesson 2) and `Vector3.dot` (Lesson
    4).
  - *Connects to:* called once by `Triangle.closest_point`, built next
    in this lesson.
  - *Shape:* alongside `closest_point_on_segment` — this project's
    second module-level geometry function, living in the same new file.

- **`Triangle.closest_point`**
  - *What it is:* an instance method returning the real, exact closest
    point anywhere on a triangle's surface to a given query point.
  - *Implementation:*
    ```
    def closest_point(self, p):
        u, v, w = barycentric_coordinates(p, self.v0, self.v1, self.v2)
        if u >= 0 and v >= 0 and w >= 0:
            return self.v0 * u + self.v1 * v + self.v2 * w

        candidates = [
            closest_point_on_segment(p, self.v0, self.v1),
            closest_point_on_segment(p, self.v1, self.v2),
            closest_point_on_segment(p, self.v2, self.v0),
        ]
        best = None
        best_distance = None
        for candidate in candidates:
            distance = (candidate - p).length()
            if best_distance is None or distance < best_distance:
                best_distance = distance
                best = candidate
        return best
    ```
    — takes `self` and a query `Vector3`, returns a new `Vector3`
    guaranteed to lie on the triangle's actual surface (a vertex, an
    edge, or the interior).
  - *Its use:* directly replaces the centroid-distance approximation
    inside `NearestSurfaceFinder.find_closest` (Lesson 9), and is the
    real, from-scratch equivalent of the "closest point" half of
    `diff3d.py`'s `mesh.find_closest_cell(points, return_closest_point=True)`.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to correctly determine whether a query point's
    projection lands inside the triangle (via `barycentric_coordinates`)
    and, if not, to correctly find the closest point among all three
    edges (via `closest_point_on_segment`, applying this lesson's own
    running-best pattern from Lesson 9 a second time).
  - *Depends on:* `barycentric_coordinates` and `closest_point_on_segment`
    (both this lesson), and `Vector3.__mul__`/`Vector3.__add__` to build
    the interior case's result.
  - *Connects to:* calls `barycentric_coordinates` once, and — only when
    the projection lands outside — `closest_point_on_segment` three
    times. Called by `NearestSurfaceFinder.find_closest`, updated at the
    end of this lesson.
  - *Shape:* `Triangle`'s own layer — the most geometrically involved
    method on `Triangle` so far, built entirely from this lesson's two
    new module-level functions plus `Vector3`'s existing toolkit.

---

## Concept Unit: Scaling a Vector Up — `Vector3.__mul__`

### The Problem

Lesson 5's SE Lens named a real, deliberate gap: `Vector3` can be
divided by a scalar (`__truediv__`) but never multiplied by one,
because nothing built up to that point needed to scale a vector *up*.
This lesson's own segment-clamping algorithm needs exactly that:
`a + t * (b - a)` — a fraction `t`, applied to a vector, to find a point
partway along it.

> **Before reading on, try this yourself:** Lesson 5 built
> `__truediv__(self, n)` to divide every component of a `Vector3` by a
> scalar. Multiplication is the mirror operation. Without looking ahead,
> write out what you'd expect `__mul__(self, n)`'s body to look like,
> given `__truediv__`'s own body as a template — same shape, opposite
> arithmetic operator.

### Introduce the Concept in Isolation

```python
# Throwaway lab: scaling a vector UP by a scalar (not down, like __truediv__ already does)
class Pair:
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def __repr__(self):
        return f"Pair({self.a}, {self.b})"

    def __mul__(self, n):
        return Pair(self.a * n, self.b * n)

p = Pair(2, 3)
print(p * 4)
```

Real output:

```
Pair(8, 12)
```

Exactly the mirror of Lesson 5's `__truediv__` lab: `p * 4` dispatches
to `__mul__` (Lesson 2's operator-dispatch mechanism, reapplied to a new
operator), scaling both components up by `4`.

### Discard the Throwaway Example

This `Pair` class is discarded now. `Vector3` gets the real `__mul__`
next.

### Project Change

- **Reference Source:** no single line in `diff3d.py` — `numpy` array
  scalar multiplication is built into `numpy` itself. This is a
  from-scratch addition, needed immediately by this lesson's own
  `closest_point_on_segment` and `Triangle.closest_point`, built next.
- **Files affected:** modify `src/vector3d/vector.py`.
- **Change type:** add.
- **Location:** inside `class Vector3:`, directly after `__truediv__`
  (Lesson 5).
- **Dependencies:** `Vector3.__init__` (Lesson 1).

### The New Code

```python
    def __mul__(self, n):
        return Vector3(self.x * n, self.y * n, self.z * n)
```

### The Updated Project

`src/vector3d/vector.py` in full, new lines marked:

```
 1  import math
 2
 3
 4  class Vector3:
 5      def __init__(self, x, y, z):
 6          self.x = x
 7          self.y = y
 8          self.z = z
 9
10      def __add__(self, other):
11          return Vector3(self.x + other.x, self.y + other.y, self.z + other.z)
12
13      def __sub__(self, other):
14          return Vector3(self.x - other.x, self.y - other.y, self.z - other.z)
15
16      def __repr__(self):
17          return f"Vector3({self.x}, {self.y}, {self.z})"
18
19      def __eq__(self, other):
20          return self.x == other.x and self.y == other.y and self.z == other.z
21
22      def dot(self, other):
23          return self.x * other.x + self.y * other.y + self.z * other.z
24
25      def length(self):
26          return math.sqrt(self.dot(self))
27
28      def normalize(self):
29          n = self.length()
30          return Vector3(self.x / n, self.y / n, self.z / n)
31
32      def cross(self, other):
33          return Vector3(
34              self.y * other.z - self.z * other.y,
35              self.z * other.x - self.x * other.z,
36              self.x * other.y - self.y * other.x,
37          )
38
39      def __truediv__(self, n):
40          return Vector3(self.x / n, self.y / n, self.z / n)
41
42      def __mul__(self, n):                                            # ← new
43          return Vector3(self.x * n, self.y * n, self.z * n)           # ← new
```

As a whole, `Vector3` can now be scaled by a plain number in either
direction — `/` to shrink, `*` to grow or shrink by a fraction — closing
the gap Lesson 5's SE Lens named directly.

### Mechanical Walkthrough

- **`def __mul__(self, n):`** — `def`; `__mul__`, the dunder name `*`
  dispatches to (a distinct hard-wired name from `__add__`/`__sub__`/
  `__truediv__`, following the same one-name-per-operator pattern
  Lessons 2 and 5 established); `self`, the `Vector3` being scaled;
  `n`, a plain scalar — the same non-`Vector3` right-hand-side shape
  `__truediv__`'s `n` already used.
- **`return Vector3(self.x * n, self.y * n, self.z * n)`** — `return`,
  building a new `Vector3` via `Vector3.__init__` (Lesson 1);
  `self.x * n` (and identically for `.y`, `.z`) — ordinary numeric `*`,
  applied independently to each component, the direct mirror of
  `__truediv__`'s `self.x / n`.

### CS Lens

This completes **scalar multiplication**, the operation Lesson 4's own
CS Lens already named as one of the two fundamentals defining a vector
space (alongside vector-with-vector addition) — Lesson 5 built the
division half; this lesson builds the multiplication half.

Also recognized in: every example Lesson 4's CS Lens already gave for
scalar division applies here too, mirrored — scaling a direction vector
up by a speed rather than down by a count; the exact "point partway
along a segment" use this lesson's own `closest_point_on_segment`
needs it for.

### SE Lens

The principle is the same one Lesson 5's SE Lens already stated when it
*deferred* this operator: build what's needed when it's needed, not
speculatively. This Concept Unit is that deferred need finally arriving
— proof the deferral was a real, working design decision, not an
oversight: `__mul__` gets built exactly once, exactly when a real
algorithm (this lesson's own segment-closest-point logic) genuinely
requires it, with a clear, traceable reason rather than "it seemed
symmetric to add both at once" back in Lesson 5.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3

ab = Vector3(2.0, 0.0, 0.0)
print(ab * 0.5)
print(Vector3(0.0, 0.0, 0.0) + ab * 0.5)
"
```

Real output:

```
Vector3(1.0, 0.0, 0.0)
Vector3(1.0, 0.0, 0.0)
```

Scaling `(2,0,0)` by `0.5` gives the halfway point, `(1,0,0)` — and
adding that scaled vector onto the origin gives the identical result,
confirming `__mul__` and `__add__` compose correctly together, exactly
the combination `closest_point_on_segment` needs next.

### Connect

`Vector3` can now do everything this lesson's real geometry algorithm
needs arithmetically. The next Concept Unit builds the first of two
functions that algorithm is made of: finding the closest point on a
single, finite line segment.

---

## Concept Unit: Closest Point on a Line Segment

### The Problem

A triangle's closest point, when it isn't in the interior, lies on one
of its three edges — and an edge is a **line segment** (this lesson's
own term), not an infinite line: the closest point *on the line an edge
sits on* can legitimately fall past one of the edge's own two endpoints,
which is not a valid answer for "closest point on the actual edge."
Nothing built so far in this project computes this correctly.

> **Before reading on, try this yourself:** the **parametric point on a
> segment** (this lesson's own term), `a + t * (b - a)`, gives every
> point on the segment as `t` ranges from `0` to `1` — and the value of
> `t` that lands exactly at the true closest point on the *infinite*
> line is computable directly (it's `(p - a).dot(ab) / ab.dot(ab)`,
> shown in the New Code below — a formula worth reading, not deriving
> from scratch here). Given that formula can produce *any* real number,
> including ones below `0` or above `1`, what single, simple rule —
> using this lesson's own term, **clamping** — would guarantee the
> final point never falls outside the actual segment?

### Introduce the Concept in Isolation

```python
# Throwaway lab: closest point on a finite line segment, not an infinite line
class Vec2:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __repr__(self):
        return f"Vec2({self.x}, {self.y})"
    def __sub__(self, other):
        return Vec2(self.x - other.x, self.y - other.y)
    def __add__(self, other):
        return Vec2(self.x + other.x, self.y + other.y)
    def __mul__(self, n):
        return Vec2(self.x * n, self.y * n)
    def dot(self, other):
        return self.x * other.x + self.y * other.y

def closest_point_on_segment(p, a, b):
    ab = b - a
    t = (p - a).dot(ab) / ab.dot(ab)
    if t < 0.0:
        t = 0.0
    elif t > 1.0:
        t = 1.0
    return a + ab * t

a = Vec2(0.0, 0.0)
b = Vec2(4.0, 0.0)

print(closest_point_on_segment(Vec2(2.0, 3.0), a, b))
print(closest_point_on_segment(Vec2(-3.0, 1.0), a, b))
print(closest_point_on_segment(Vec2(10.0, -2.0), a, b))
```

Real output:

```
Vec2(2.0, 0.0)
Vec2(0.0, 0.0)
Vec2(4.0, 0.0)
```

Three real, checkable cases: a point floating above the segment's
midpoint correctly projects straight down onto it, `(2, 0)`. A point
sitting off to the left, past `a` — where the *unclamped* formula would
compute a negative `t`, landing on the infinite line but off the actual
segment — correctly clamps to `a` itself, `(0, 0)`, exactly this
Concept Unit's own Socratic prompt's answer. A point off to the right,
past `b`, correctly clamps to `b`, `(4, 0)`.

### Discard the Throwaway Example

This `Vec2`/lab pair is discarded now. The real project version lives
in a new file, operating on `Vector3`.

### Project Change

- **Reference Source:** the closest-point-on-a-segment algorithm is a
  well-established, standard computational geometry technique — not
  specific to `diff3d.py` or to the STL format — and, like Lesson 8's
  STL layout and this lesson's own barycentric formula (next Concept
  Unit), is stated here from established knowledge rather than fetched
  live this session (no network access in this environment). Within
  `diff3d.py` itself, this whole lesson's algorithm stands in for
  whatever `pyvista`'s `find_closest_cell(..., return_closest_point=True)`
  computes internally — never shown in the script, since it happens
  entirely inside the library.
- **Files affected:** create `src/vector3d/geometry.py` (new file).
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** `Vector3.__sub__` (Lesson 2), `Vector3.dot` (Lesson
  4), `Vector3.__mul__` (earlier in this lesson), `Vector3.__add__`
  (Lesson 2).

### The New Code

Type this into `src/vector3d/geometry.py`:

```python
def closest_point_on_segment(p, a, b):
    ab = b - a
    t = (p - a).dot(ab) / ab.dot(ab)
    if t < 0.0:
        t = 0.0
    elif t > 1.0:
        t = 1.0
    return a + ab * t
```

### The Updated Project

This is the whole new file so far — nothing larger to return to yet
(the same brand-new-file exemption used throughout this curriculum):

```
1  def closest_point_on_segment(p, a, b):
2      ab = b - a
3      t = (p - a).dot(ab) / ab.dot(ab)
4      if t < 0.0:
5          t = 0.0
6      elif t > 1.0:
7          t = 1.0
8      return a + ab * t
```

As a whole, this file now defines a standalone, reusable function that,
given any point and any two segment endpoints, finds the real closest
point on that finite segment — correctly handling every case this
Concept Unit's own lab already proved: interior, past-`a`, and past-`b`.

### Mechanical Walkthrough

- **`def closest_point_on_segment(p, a, b):`** — `def`, defining a
  **module-level function** (this lesson's own term) — notice there is
  no `class` anywhere in this file, and no `self`: this function isn't
  a method on anything, it's called directly as
  `closest_point_on_segment(p, a, b)`, with all three points supplied
  as ordinary arguments.
- **`ab = b - a`** — `Vector3.__sub__` (Lesson 2), computing the
  direction (and full length) from `a` to `b`.
- **`t = (p - a).dot(ab) / ab.dot(ab)`** — `p - a` (Lesson 2's
  `__sub__` again), the direction from `a` to the query point;
  `.dot(ab)` (Lesson 4) — projecting that direction onto `ab`,
  producing a number proportional to how far along `ab`'s direction `p`
  sits; `ab.dot(ab)` — `ab` dotted with itself, which Lesson 4's own
  `length()` already showed equals the *squared* length of `ab`;
  dividing the first dot product by this one converts "how far along, in
  raw units" into "how far along, as a fraction of the segment's own
  length" — exactly the `t` this lesson's own **parametric point on a
  segment** term describes, still unclamped at this point.
- **`if t < 0.0: t = 0.0` / `elif t > 1.0: t = 1.0`** — an ordinary
  `if`/`elif` (already familiar), this lesson's own **clamping**: if `t`
  computed below `0`, force it to exactly `0`; if above `1`, force it to
  exactly `1`; any `t` already between `0` and `1` passes through
  unchanged — the direct implementation of this Concept Unit's own
  Socratic prompt.
- **`return a + ab * t`** — `return`, handing back a new `Vector3`;
  `ab * t` — `Vector3.__mul__` (earlier in this lesson), scaling the
  edge direction by the (now-clamped) fraction `t`; `a + ...` —
  `Vector3.__add__` (Lesson 2), landing at the actual point that
  fraction of the way from `a` toward `b` — this lesson's own
  **parametric point on a segment** formula, computed for real, with a
  guaranteed-valid `t`.

### CS Lens

This is **point-to-segment projection with clamping** — a specific,
common computational-geometry primitive: projecting a point onto a
line, then constraining the result to a finite portion of that line.

Also recognized in: collision detection (finding the closest point on a
wall segment to a moving object, exactly this same computation); path-
following AI (finding where on a road/path segment an agent should
steer toward); computer-aided design (snapping a cursor position to the
nearest point on a drawn line segment, not the infinite line it sits
on); GPS route-matching (finding the closest point on a mapped road
segment to a raw, noisy GPS reading).

### SE Lens

The principle is the same **module-level function over a method** this
lesson's own Terms section already named: `closest_point_on_segment`
takes three completely independent points as plain arguments, with no
natural "owner" among them, so it's written as a standalone function
rather than forced onto `Vector3` or any other class as a method.

The alternative not chosen: make this a method on `Vector3` itself —
`p.closest_point_on_segment(a, b)` — treating the query point as the
"owner." That would work, and Python doesn't forbid it, but it reads
oddly: the query point isn't more central to this computation than
either segment endpoint, and forcing an arbitrary "owner" onto an
inherently three-way relationship would be a worse fit than simply
writing it as the plain function it naturally is — the same reasoning
this project has followed since Lesson 5 chose composition over
flattening, applied here to choose *no* class ownership at all, when no
single class genuinely fits.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3
from vector3d.geometry import closest_point_on_segment

a = Vector3(0.0, 0.0, 0.0)
b = Vector3(4.0, 0.0, 0.0)

print(closest_point_on_segment(Vector3(2.0, 3.0, 0.0), a, b))
print(closest_point_on_segment(Vector3(-3.0, 1.0, 0.0), a, b))
print(closest_point_on_segment(Vector3(10.0, -2.0, 0.0), a, b))
"
```

Real output:

```
Vector3(2.0, 0.0, 0.0)
Vector3(0.0, 0.0, 0.0)
Vector3(4.0, 0.0, 0.0)
```

Identical results to this Concept Unit's own throwaway lab, now on real
`Vector3` objects in three dimensions instead of the lab's 2D `Vec2`.

### Connect

`closest_point_on_segment` can find the true closest point on any one
edge. The next Concept Unit builds the other half of this lesson's
algorithm: deciding, in the first place, whether a query point's closest
surface point is even on an edge at all, or somewhere in the triangle's
interior.

---

## Concept Unit: Barycentric Coordinates and the Interior Test

### The Problem

Most query points aren't closest to an edge at all — they're closest to
somewhere in the triangle's actual interior, directly "above" or
"below" it. Checking all three edges every single time, even when the
answer is obviously interior, would be wasteful and — worse — wrong:
the true closest point when a query point sits directly above a
triangle's center isn't on any edge at all; it's the straight-down
projection onto the triangle's own flat surface. Nothing built so far
can tell interior from exterior at all.

> **Before reading on, try this yourself:** this lesson's own Terms
> section already defines barycentric coordinates: three numbers
> `(u, v, w)`, always summing to `1`, where a vertex has coordinates
> like `(1, 0, 0)` and the centroid has `(1/3, 1/3, 1/3)`. Given that a
> point strictly inside the triangle is some blend of all three
> vertices with *positive* weight toward each, and a point outside must
> be "pulled" so far toward one vertex's side that it overshoots — what
> sign would you expect at least one of `u`, `v`, `w` to have whenever
> the point in question falls genuinely outside the triangle?

### Introduce the Concept in Isolation

```python
# Throwaway lab: expressing a point as a weighted mix of a triangle's three corners
class Vec2:
    def __init__(self, x, y):
        self.x = x
        self.y = y
    def __sub__(self, other):
        return Vec2(self.x - other.x, self.y - other.y)
    def dot(self, other):
        return self.x * other.x + self.y * other.y

def barycentric(p, a, b, c):
    v0 = b - a
    v1 = c - a
    v2 = p - a
    d00 = v0.dot(v0)
    d01 = v0.dot(v1)
    d11 = v1.dot(v1)
    d20 = v2.dot(v0)
    d21 = v2.dot(v1)
    denom = d00 * d11 - d01 * d01
    v = (d11 * d20 - d01 * d21) / denom
    w = (d00 * d21 - d01 * d20) / denom
    u = 1.0 - v - w
    return (u, v, w)

a = Vec2(0.0, 0.0)
b = Vec2(4.0, 0.0)
c = Vec2(0.0, 4.0)

print(barycentric(a, a, b, c))
print(barycentric(b, a, b, c))
print(barycentric(c, a, b, c))
print(barycentric(Vec2(4.0/3, 4.0/3), a, b, c))
print(barycentric(Vec2(-1.0, -1.0), a, b, c))
```

Real output:

```
(1.0, 0.0, 0.0)
(0.0, 1.0, 0.0)
(0.0, 0.0, 1.0)
(0.3333333333333334, 0.3333333333333333, 0.3333333333333333)
(1.5, -0.25, -0.25)
```

Each vertex, plugged in as the query point, comes back exactly `(1,0,0)`
/ `(0,1,0)` / `(0,0,1)` — entirely itself, none of the others, confirming
this lesson's own definition directly. The triangle's centroid comes
back essentially `(1/3, 1/3, 1/3)` (the tiny floating-point difference
between the two `0.333...` values printed is ordinary float rounding,
not a bug — the same category of imprecision Lesson 3's SE Lens already
flagged for `Vector3.__eq__`). The last point, `(-1, -1)`, sits well
outside the triangle entirely — and, exactly as the Socratic prompt
predicted, two of its three coordinates come back negative,
`(1.5, -0.25, -0.25)` — real, direct proof that a negative coordinate is
this lesson's own reliable signal for "outside."

### Discard the Throwaway Example

This `Vec2`/lab pair is discarded now. `geometry.py` gets the real
`barycentric_coordinates` function next.

### Project Change

- **Reference Source:** same honesty note as this lesson's previous
  Concept Unit — the "efficient barycentric coordinates" formula used
  here is a well-established, standard computational-geometry technique,
  stated from established knowledge, not fetched live this session.
- **Files affected:** modify `src/vector3d/geometry.py`.
- **Change type:** add.
- **Location:** directly after `closest_point_on_segment` (earlier in
  this lesson).
- **Dependencies:** `Vector3.__sub__` (Lesson 2) and `Vector3.dot`
  (Lesson 4).

### The New Code

```python
def barycentric_coordinates(p, a, b, c):
    v0 = b - a
    v1 = c - a
    v2 = p - a
    d00 = v0.dot(v0)
    d01 = v0.dot(v1)
    d11 = v1.dot(v1)
    d20 = v2.dot(v0)
    d21 = v2.dot(v1)
    denom = d00 * d11 - d01 * d01
    v = (d11 * d20 - d01 * d21) / denom
    w = (d00 * d21 - d01 * d20) / denom
    u = 1.0 - v - w
    return (u, v, w)
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
11  def barycentric_coordinates(p, a, b, c):                             # ← new
12      v0 = b - a                                                       # ← new
13      v1 = c - a                                                       # ← new
14      v2 = p - a                                                       # ← new
15      d00 = v0.dot(v0)                                                 # ← new
16      d01 = v0.dot(v1)                                                 # ← new
17      d11 = v1.dot(v1)                                                 # ← new
18      d20 = v2.dot(v0)                                                 # ← new
19      d21 = v2.dot(v1)                                                 # ← new
20      denom = d00 * d11 - d01 * d01                                    # ← new
21      v = (d11 * d20 - d01 * d21) / denom                              # ← new
22      w = (d00 * d21 - d01 * d20) / denom                              # ← new
23      u = 1.0 - v - w                                                  # ← new
24      return (u, v, w)                                                 # ← new
```

As a whole, `geometry.py` now holds both functions this lesson's final
Concept Unit will combine: one that finds the closest point on a single
edge, and one that decides whether a query point is even outside the
triangle in the first place.

### Mechanical Walkthrough

- **`def barycentric_coordinates(p, a, b, c):`** — `def`, a second
  module-level function in the same file, taking four points: the query
  point and the triangle's three vertices.
- **`v0 = b - a`, `v1 = c - a`, `v2 = p - a`** — three applications of
  `Vector3.__sub__` (Lesson 2), all measured from the same corner, `a`:
  `v0` and `v1` are two of the triangle's own edges (the identical
  pattern `Triangle.normal()`, Lesson 5, already used for its own two
  edges); `v2` is the direction from `a` toward the query point.
- **`d00 = v0.dot(v0)`, `d01 = v0.dot(v1)`, `d11 = v1.dot(v1)`,
  `d20 = v2.dot(v0)`, `d21 = v2.dot(v1)`** — five applications of
  `Vector3.dot` (Lesson 4), each one a specific pairing needed by the
  formula below; there's no shortcut explanation for *why* exactly these
  five pairings, beyond that they're what the underlying linear-algebra
  derivation of this formula requires — this is exactly the kind of
  established, standard formula this Concept Unit's own Reference Source
  field already named rather than re-derived from first principles.
- **`denom = d00 * d11 - d01 * d01`** — ordinary numeric arithmetic,
  combining three of the five dot products into a single denominator
  used by both `v` and `w` below.
- **`v = (d11 * d20 - d01 * d21) / denom`** and
  **`w = (d00 * d21 - d01 * d20) / denom`** — two more ordinary
  arithmetic expressions, each producing one of the three barycentric
  weights this lesson's own Terms section defines.
- **`u = 1.0 - v - w`** — the third weight, computed from the other two
  rather than independently — a direct consequence of this lesson's own
  definition that all three barycentric coordinates always sum to
  exactly `1`.
- **`return (u, v, w)`** — `return`, handing back a plain 3-element
  tuple (Python's own tuple syntax, already familiar) — not a `Vector3`;
  these three numbers are weights, not a position in 3D space.

### CS Lens

This is **barycentric coordinates**, a specific coordinate system
(distinct from the ordinary `x`/`y`/`z` Cartesian coordinates this
entire project otherwise uses) defined relative to a triangle's own
three vertices rather than a fixed external origin.

Also recognized in: computer graphics texture mapping (interpolating a
texture coordinate smoothly across a triangle's interior uses exactly
these same three weights); physically based rendering (interpolating
surface normals, colors, or material properties across a triangle's
face); finite element analysis (barycentric — also called "area" or
"simplex" — coordinates are a standard tool for interpolating values
across a triangular mesh element); GPS trilateration and general
point-in-polygon testing (the same "is this point a valid non-negative
weighted combination" logic recurs in several forms).

### SE Lens

The principle is **using a single sign-based test to gain simplicity**
— checking three numbers' signs is a much simpler interior/exterior test
than reasoning about angles, distances, or explicit line equations
directly, precisely because barycentric coordinates were designed to
make "inside" mean exactly "all non-negative."

The alternative not chosen: test each edge directly using a
sign-of-cross-product test ("is this point on the same side of edge AB
as vertex C?", repeated for all three edges) — a real, valid, and
common alternative interior test. The barycentric approach chosen here
has a real advantage the next Concept Unit relies on directly: the same
three numbers that answer "is this point inside?" also directly give the
interior point's own coordinates (`self.v0 * u + self.v1 * v + self.v2 * w`),
with no separate computation needed — the edge-sign-test alternative
would answer only the yes/no interior question, requiring a *second*,
separate computation (projecting onto the triangle's plane) to actually
locate the interior point once "yes" is established.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3
from vector3d.geometry import barycentric_coordinates

a = Vector3(0.0, 0.0, 0.0)
b = Vector3(4.0, 0.0, 0.0)
c = Vector3(0.0, 4.0, 0.0)

print(barycentric_coordinates(a, a, b, c))
print(barycentric_coordinates(Vector3(4.0/3, 4.0/3, 0.0), a, b, c))
print(barycentric_coordinates(Vector3(-1.0, -1.0, 0.0), a, b, c))
"
```

Real output:

```
(1.0, 0.0, 0.0)
(0.3333333333333334, 0.3333333333333333, 0.3333333333333333)
(1.5, -0.25, -0.25)
```

Identical results to this Concept Unit's own throwaway lab, now on real
`Vector3` objects in three dimensions.

### Connect

`geometry.py` now holds both pieces this lesson's algorithm needs: an
interior test that also locates the interior point directly, and an
edge-closest-point function for when the interior test fails. The final
Concept Unit combines them into `Triangle.closest_point`, and swaps it
into `NearestSurfaceFinder`, finally closing the gap Lesson 9 opened up
front.

---

## Concept Unit: Combining Them — `Triangle.closest_point()`

### The Problem

Lesson 9's `NearestSurfaceFinder.find_closest` still measures distance
to each triangle's *centroid* — a real, sometimes badly wrong
approximation, exactly as Lesson 9 itself warned. Both pieces needed to
fix it now exist (`barycentric_coordinates` and
`closest_point_on_segment`), but nothing yet combines them into one
method answering "what's the real closest point on this triangle's
actual surface?"

> **Before reading on, try this yourself:** given `barycentric_coordinates`
> returning `(u, v, w)` — non-negative for an interior point, with at
> least one negative value otherwise — and `closest_point_on_segment`
> correctly handling any one edge, what overall structure would
> `Triangle.closest_point(self, p)` need? Sketch the two branches in
> plain words: what should happen when all three coordinates are
> non-negative, and what should happen otherwise, given there are three
> edges to check, not just one, and Lesson 9's own running-best pattern
> is exactly the tool for picking the best of several candidates.

### Introduce the Concept in Isolation

No new throwaway lab for this Concept Unit: both `barycentric_coordinates`
and `closest_point_on_segment` were already fully isolated and proven in
this lesson's own previous two Concept Units, and the running-best
pattern for picking the closest of several candidates was already fully
isolated and proven in Lesson 9. What's new here is only the
combination of all three, directly in real project code.

### Discard the Throwaway Example

Not applicable to this Concept Unit, for the reason stated above.

### Project Change

- **Reference Source:** `diff3d.py`'s `find_closest` function —
  `_, closest = mesh.find_closest_cell(points, return_closest_point=True)`
  — this method is the real, exact replacement for the
  `return_closest_point=True` half of that call, closing the
  approximation gap Lesson 9 opened with full honesty.
- **Files affected:** modify `src/vector3d/triangle.py`.
- **Change type:** add (a new method, plus a new import).
- **Location:** the import goes at the top of the file; `closest_point`
  goes inside `class Triangle:`, directly after `normal` (Lesson 5).
- **Dependencies:** `barycentric_coordinates` and
  `closest_point_on_segment` (both earlier in this lesson),
  `Vector3.__mul__`/`Vector3.__add__` (this lesson and Lesson 2), and
  Lesson 9's own running-best/sentinel pattern.

### The New Code

Add this import at the top of `src/vector3d/triangle.py`:

```python
from vector3d.geometry import closest_point_on_segment, barycentric_coordinates
```

Then, inside `class Triangle:`, after `normal`:

```python
    def closest_point(self, p):
        u, v, w = barycentric_coordinates(p, self.v0, self.v1, self.v2)
        if u >= 0 and v >= 0 and w >= 0:
            return self.v0 * u + self.v1 * v + self.v2 * w

        candidates = [
            closest_point_on_segment(p, self.v0, self.v1),
            closest_point_on_segment(p, self.v1, self.v2),
            closest_point_on_segment(p, self.v2, self.v0),
        ]
        best = None
        best_distance = None
        for candidate in candidates:
            distance = (candidate - p).length()
            if best_distance is None or distance < best_distance:
                best_distance = distance
                best = candidate
        return best
```

### The Updated Project

`src/vector3d/triangle.py` in full, new lines marked:

```
 1  from vector3d.vector import Vector3
 2  from vector3d.geometry import closest_point_on_segment, barycentric_coordinates  # ← new
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
19      def closest_point(self, p):                                      # ← new
20          u, v, w = barycentric_coordinates(p, self.v0, self.v1, self.v2)  # ← new
21          if u >= 0 and v >= 0 and w >= 0:                             # ← new
22              return self.v0 * u + self.v1 * v + self.v2 * w           # ← new
23                                                                         # ← new
24          candidates = [                                               # ← new
25              closest_point_on_segment(p, self.v0, self.v1),           # ← new
26              closest_point_on_segment(p, self.v1, self.v2),           # ← new
27              closest_point_on_segment(p, self.v2, self.v0),           # ← new
28          ]                                                            # ← new
29          best = None                                                  # ← new
30          best_distance = None                                        # ← new
31          for candidate in candidates:                                 # ← new
32              distance = (candidate - p).length()                     # ← new
33              if best_distance is None or distance < best_distance:   # ← new
34                  best_distance = distance                            # ← new
35                  best = candidate                                    # ← new
36          return best                                                  # ← new
```

As a whole, `Triangle` can now report its own true closest point to any
query point — combining the interior test (lines 20-22) with a
three-way edge fallback (lines 24-36), each governed by the same
running-best pattern Lesson 9 first proved on plain numbers.

### Mechanical Walkthrough

- **`from vector3d.geometry import closest_point_on_segment, barycentric_coordinates`**
  — the same `from ... import ...` syntax Lesson 5 used for `Vector3`,
  here pulling in two functions (not a class) from the new file built
  earlier in this lesson.
- **`def closest_point(self, p):`** — `def`; `closest_point`, an
  ordinary instance method name; `self` and one parameter, `p`, the
  query point.
- **`u, v, w = barycentric_coordinates(p, self.v0, self.v1, self.v2)`**
  — calling the module-level function built earlier in this lesson,
  passing `self`'s own three vertices (Lesson 5) alongside the query
  point; tuple-unpacking (already familiar, and the same pattern
  `Mesh.center`, Lesson 6, used for `self.bounds()`'s six-value tuple)
  the returned 3-tuple into three separate local variables.
- **`if u >= 0 and v >= 0 and w >= 0:`** — this lesson's own interior
  test, directly implementing the definition given in the Terms
  section: `and` (Lesson 3's own short-circuit boolean operator, reused
  a third time) requiring all three barycentric coordinates to be
  non-negative simultaneously.
- **`return self.v0 * u + self.v1 * v + self.v2 * w`** — `return`,
  ending the method here when the interior test passes; three
  applications of `Vector3.__mul__` (earlier in this lesson), each
  scaling one vertex by its own barycentric weight, combined with two
  applications of `Vector3.__add__` (Lesson 2) — the direct algebraic
  definition of "the point these barycentric coordinates describe,"
  computed as a real `Vector3` for the first time in this lesson.
- **`candidates = [...]`** — an ordinary Python list literal (already
  familiar), holding the results of three separate
  `closest_point_on_segment` calls (earlier in this lesson) — one per
  edge of the triangle, each built from two of `self`'s own three
  vertices in turn.
- **`best = None`, `best_distance = None`, the `for` loop, and the `if`
  inside it** — Lesson 9's own running-best/sentinel pattern, applied
  here a second time in this project, now scanning three candidate
  `Vector3` points instead of a whole mesh's triangles — the identical
  structure, reused directly rather than reinvented.
- **`return best`** — `return`, handing back whichever of the three
  edge-closest-points survived the scan as the nearest to `p` — the
  final answer when the interior test failed.

### CS Lens

This is the overall **point-to-triangle distance algorithm** this whole
lesson has been building toward — combining a fast interior/exterior
classification (barycentric coordinates) with a fallback search among a
small, fixed number of candidates (the three edges) only when needed,
rather than always doing the more expensive edge-by-edge work.

Also recognized in: essentially every real 3D collision-detection and
physics engine's own closest-point-on-triangle routine, which follows
this same two-phase shape (classify, then only do extra work if
needed); ray-tracing renderers, which need this exact computation
(often in a related "ray-triangle intersection" form) for every
triangle a ray might hit; CAD/CAM software's own point-projection tools
(directly relevant to the machining-comparison purpose of the original
`diff3d.py` itself — this is a real building block of that domain, not
an abstract exercise).

### SE Lens

The principle is **reusing an already-proven pattern rather than
reinventing it** — this method's edge-fallback logic is *structurally*
identical to `NearestSurfaceFinder.find_closest` (Lesson 9): sentinel
initialization, a loop, a running comparison. Recognizing that the
"find the best of several candidates" shape recurs, and reaching for the
same proven pattern rather than writing new, subtly-different scanning
logic, is itself a real design skill distinct from any one specific
algorithm.

The alternative not chosen, worth naming honestly: a more sophisticated
version of this algorithm (the kind referenced only briefly, by name,
in this lesson's own Reference Source discussions of established
techniques) can determine analytically *which single edge* to check,
using the sign pattern of `u`, `v`, `w` together, avoiding the need to
check all three edges and take the minimum. This method's simpler
approach — always checking all three edges via the running-best pattern
whenever the interior test fails — does strictly more work than
necessary in the exterior case (three edge computations instead of one),
in exchange for being considerably easier to read, verify, and connect
directly back to Lesson 9's own already-taught pattern. For this
project's own scale, that tradeoff is deliberately accepted; a
performance-critical, large-scale version of this algorithm would
likely reach for the more targeted approach instead.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3
from vector3d.triangle import Triangle

t = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0), Vector3(0.0, 2.0, 0.0))

p1 = Vector3(0.5, 0.5, 5.0)
print(t.closest_point(p1))

p2 = Vector3(-5.0, -5.0, 0.0)
print(t.closest_point(p2))

p3 = Vector3(3.0, 0.0, 0.0)
print(t.closest_point(p3))

p4 = Vector3(1.9, 0.05, 0.0)
print('centroid dist:', (t.centroid() - p4).length())
print('real closest:', t.closest_point(p4), 'dist:', (t.closest_point(p4) - p4).length())
"
```

Real output:

```
Vector3(0.5, 0.5, 0.0)
Vector3(0.0, 0.0, 0.0)
Vector3(2.0, 0.0, 0.0)
centroid dist: 1.3789085861248704
real closest: Vector3(1.9, 0.05, 0.0) dist: 0.0
```

The first three cases confirm the method's overall structure: a point
directly above the interior lands exactly on its planar projection; a
point far past a vertex correctly clamps to that vertex; a point past an
edge's end correctly clamps to that edge's endpoint. The last case is
the sharpest, most concrete proof of why this whole lesson exists:
`p4 = (1.9, 0.05, 0.0)` sits essentially *on* this triangle's edge —
Lesson 9's centroid approximation reports a distance of roughly `1.38`
for a point that is, in reality, distance `0.0` from the triangle's own
surface. That is not a rounding error; it's exactly the honest gap
Lesson 9 named up front, now closed.

### Connect

`Triangle.closest_point` is complete and proven correct against real,
checkable cases — including one that dramatically exposes exactly how
wrong Lesson 9's centroid shortcut could be. The very last step in this
lesson swaps it into `NearestSurfaceFinder`.

---

## Closing: Swapping the Approximation for the Real Thing

`NearestSurfaceFinder.find_closest` (Lesson 9) needs exactly one line
changed — its distance calculation, not its overall scanning structure,
which stays exactly as Lesson 9 built it:

```python
    def find_closest(self, point):
        best_triangle = None
        best_distance = None
        for triangle in self.mesh.triangles:
            distance = (triangle.closest_point(point) - point).length()  # ← changed
            if best_distance is None or distance < best_distance:
                best_distance = distance
                best_triangle = triangle
        return best_triangle
```

Only `triangle.centroid()` became `triangle.closest_point(point)` — the
running-best scanning logic around it, proven correct in Lesson 9,
needed no changes at all, exactly as Lesson 9's own "Connect" section
predicted it wouldn't.

**Run it**, confirming the fix on the exact edge-case example from
Lesson 9's own closing exercise:

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3
from vector3d.triangle import Triangle
from vector3d.mesh import Mesh
from vector3d.nearest_surface_finder import NearestSurfaceFinder

t3 = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(4.0, 0.0, 0.0), Vector3(0.0, 0.1, 0.0))
t4 = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(0.0, 4.0, 0.0), Vector3(0.1, 0.0, 0.0))
mesh2 = Mesh([t3, t4])
finder2 = NearestSurfaceFinder(mesh2)

edge_point = Vector3(3.9, 0.0, 0.0)
result = finder2.find_closest(edge_point)
print(result is t3)
print(result is t4)
"
```

Real output:

```
True
False
```

Still correct — this particular case happened to already work under
Lesson 9's approximation too, but it's now correct *because* the
underlying geometry is exact, not because it happened to land on the
right side of a rough estimate.

---

## Connect the Pieces

One query point, `Vector3(1.9, 0.05, 0.0)`, traced through this entire
lesson: `Triangle.closest_point` (fourth Concept Unit) calls
`barycentric_coordinates` (third Concept Unit), which uses
`Vector3.__sub__` (Lesson 2) and `Vector3.dot` (Lesson 4) to compute
`(u, v, w)` — and at least one comes back negative, since this point
sits right at the triangle's edge, not its interior. Because the
interior test fails, the method builds three candidates via
`closest_point_on_segment` (second Concept Unit), each one using
`Vector3.__sub__`, `Vector3.dot`, and this lesson's own `Vector3.__mul__`
(first Concept Unit) to clamp a parametric point onto one edge. Lesson
9's running-best pattern, reused unchanged, picks the nearest of the
three — landing exactly on `(1.9, 0.05, 0.0)` itself, distance `0.0`.
Every method built across four Concept Units, and two entire earlier
lessons (Lesson 2's arithmetic, Lesson 4's `dot`, Lesson 9's scanning
pattern), converges on a single, verifiably correct answer — replacing
Lesson 9's centroid shortcut, which reported `1.38` for this exact same
point.

---

## Try It Yourself

Type `__mul__` into your own `vector.py`, `closest_point_on_segment` and
`barycentric_coordinates` into your own `geometry.py`, and
`closest_point` into your own `triangle.py` (not copy-pasted), then
update `find_closest` in your own `nearest_surface_finder.py`. Confirm
every `Run It` output above. Then, once that works, try a point sitting
exactly on one of the triangle's *vertices* — the boundary between "on
an edge" and "at a corner" — and see for yourself which of this lesson's
two code paths (interior, or edge fallback) actually handles it, and
whether the result is exact:

```python
t = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0), Vector3(0.0, 2.0, 0.0))
on_vertex = Vector3(2.0, 0.0, 0.0)
print(t.closest_point(on_vertex))
```
