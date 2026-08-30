# Lesson 5: Composition — A Class Built From Other Objects

**What you will build:** a new class, `Triangle`, in a new file
`src/vector3d/triangle.py` — the first class in this project whose
attributes are other objects (`Vector3` instances) rather than plain
numbers. Along the way, `Vector3` gets one more method,
`__truediv__` (division by a plain number), needed to average three
vertices into one. In the original `diff3d.py`, a triangle has no
explicit representation at all — it's implicitly three rows of
`mesh.points`, referenced by index through `mesh.faces`. This lesson
gives that implicit structure a real, explicit class.

**What you need to know first:** Lessons 1-4 in full — `Vector3` is a
complete small geometry toolkit (`__init__`, `__add__`, `__sub__`,
`__repr__`, `__eq__`, `dot`, `length`, `normalize`, `cross`). Nothing in
this lesson changes any of that; `Triangle` is built *on top of* it.

**Terms used in this lesson:**
- **composition** — building a class whose instance attributes are
  themselves instances of other classes, rather than plain values like
  numbers or strings. It exists because real-world structures are
  usually made of smaller structures — a triangle genuinely *is* three
  points, not three independent numbers each — and composition is how a
  class expresses "is built from" directly in code, the same way
  `Vector3` expresses "is built from three numbers" via its own
  `__init__`.
- **has-a relationship** — the specific relationship composition
  creates: a `Triangle` *has a* `v0`, *has a* `v1`, *has a* `v2`, each
  one a full `Vector3`. This is named and contrasted here because
  Lesson 5 is the first time this project's classes relate to each
  other this way at all — every attribute on `Vector3` itself
  (`.x`, `.y`, `.z`) has been a plain number, not another object.
- **object-valued attribute** — an instance attribute (Lesson 1's term)
  whose stored value is itself an object with its own methods, rather
  than a plain number. `Triangle.v0` is an object-valued attribute; every
  attribute Lessons 1-4 built on `Vector3` (`.x`, `.y`, `.z`) was not.
- **`__truediv__`** — the dunder method Python calls when `/` is used on
  an object, the same mechanism `__add__`/`__sub__` (Lesson 2) provide
  for `+`/`-`. What's new here isn't the mechanism — it's that the
  *right-hand side* is a plain number (a **scalar**), not another
  `Vector3` — `total / 3` divides a vector by a number, not by another
  vector, which is a different shape of operation from anything
  `__add__`/`__sub__` handle.
- **scalar** — a plain single number (an `int` or a `float`), used here
  specifically to distinguish "an ordinary number" from "a `Vector3`"
  when both might appear on either side of an operator. `3` in
  `total / 3` is a scalar; `total` itself is not.
- **centroid** — the geometric center of a shape, computed for a
  triangle as the average of its three vertices — add them together,
  divide by how many there are. It exists as the standard way to find
  "the middle" of a triangle, needed later for tasks like placing a
  single representative sample point per triangle.
- **face normal** — a direction pointing straight out of a flat
  triangular surface, perpendicular to the triangle itself. It exists
  because knowing which way a surface faces is what lighting,
  backface-culling, and — for this project specifically — Phase D and
  Phase F's distance/coloring math all depend on.

**Objects and methods used:**

- **`Vector3.__truediv__`**
  - *What it is:* the dunder method Python calls when `/` is used
    between a `Vector3` and a plain number.
  - *Implementation:* `def __truediv__(self, n): return Vector3(self.x / n, self.y / n, self.z / n)`
    — takes `self` and a scalar `n`, returns a new `Vector3`.
  - *Its use:* `Triangle.centroid()`, built later in this lesson, needs
    to divide a summed `Vector3` by `3` to average three vertices —
    `__truediv__` is what makes `total / 3` valid on our own `Vector3`.
  - *Type:* an instance method, dunder, invoked implicitly by `/`.
  - *Responsibility:* to divide every component of `self` by a single
    scalar, returning a new `Vector3`, leaving `self` unmodified.
  - *Depends on:* `self`'s own `.x`/`.y`/`.z` and `Vector3.__init__`
    (Lesson 1) to build its result; depends on `n` actually being a
    plain number, not a `Vector3` — dividing a `Vector3` by another
    `Vector3` component-wise is a different (and not yet built)
    operation.
  - *Connects to:* called automatically by `/`; `Triangle.centroid`
    calls it directly, once, on a summed `Vector3`.
  - *Shape:* still `Vector3`'s own layer — the last of this project's
    core arithmetic operators, alongside `__add__`/`__sub__` (Lesson 2).

- **`Triangle`**
  - *What it is:* a class representing one flat, three-cornered surface
    — the fundamental building block every mesh in this project is made
    of.
  - *Implementation:* `class Triangle:` with `__init__(self, v0, v1, v2)`
    storing three `Vector3` instances as `self.v0`, `self.v1`,
    `self.v2`, plus the `centroid()` and `normal()` methods built later
    in this lesson.
  - *Its use:* every mesh vertex triple in the original script's
    `mesh.faces`/`mesh.points` is, structurally, a `Triangle` — this
    class gives that implicit structure a name, and a place to attach
    `centroid()`/`normal()` rather than computing them as free-floating
    functions elsewhere.
  - *Type:* a plain class, no parent class, composed *of* `Vector3`
    rather than built from raw numbers directly.
  - *Responsibility:* to hold exactly three vertices as one named unit,
    and to answer geometric questions about the flat surface they
    define (its center, its facing direction).
  - *Depends on:* three `Vector3` instances, handed to it at
    construction time.
  - *Connects to:* nothing calls `Triangle` yet — it's the newest class
    in the project. Starting in Lesson 6 (binary STL parsing), the
    `STLReader` will construct `Triangle` instances directly from parsed
    file data. `Triangle` itself calls `Vector3.__add__`,
    `Vector3.__truediv__`, `Vector3.__sub__`, `Vector3.cross`, and
    `Vector3.normalize` — every arithmetic method Lesson 4 built,
    reused here for the first time by code outside `Vector3` itself.
  - *Shape:* the second layer of this project's architecture — sitting
    directly on top of `Vector3` (the first layer), and itself the
    foundation `Mesh` (Lesson 6) will be built on next.

- **`Triangle.centroid`**
  - *What it is:* an instance method computing the average of a
    triangle's three vertices.
  - *Implementation:* `def centroid(self): return (self.v0 + self.v1 + self.v2) / 3`
    — takes only `self`, returns a new `Vector3`.
  - *Its use:* later lessons (sampling, statistics) need one
    representative point per triangle; the centroid is the standard
    choice.
  - *Type:* an ordinary instance method (not a dunder method).
  - *Responsibility:* to compute and return the geometric center of
    `self`'s three stored vertices, with no side effects.
  - *Depends on:* `self.v0`, `self.v1`, `self.v2` (set by `__init__`),
    and `Vector3.__add__`/`Vector3.__truediv__` to do the actual math.
  - *Connects to:* calls `Vector3.__add__` twice and
    `Vector3.__truediv__` once; called by nothing yet within this
    project, but will be by later sampling/statistics lessons.
  - *Shape:* `Triangle`'s own layer — a method that orchestrates calls
    to its *component objects'* methods, rather than doing arithmetic
    directly on raw numbers the way every `Vector3` method does.

- **`Triangle.normal`**
  - *What it is:* an instance method computing the unit-length direction
    a triangle's flat surface faces.
  - *Implementation:*
    ```
    def normal(self):
        edge1 = self.v1 - self.v0
        edge2 = self.v2 - self.v0
        return edge1.cross(edge2).normalize()
    ```
    — takes only `self`, returns a new `Vector3`.
  - *Its use:* replaces the per-triangle geometry `pyvista`'s
    `compute_normals()` performs invisibly in the original script;
    Phase D's vertex-normal averaging will call this on every triangle
    touching a given vertex.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to compute a single, unit-length direction
    perpendicular to `self`'s flat surface, using two of its own edges.
  - *Depends on:* `self.v0`, `self.v1`, `self.v2`, and
    `Vector3.__sub__`, `Vector3.cross`, `Vector3.normalize` — every one
    of Lesson 4's core methods, now all used together for the first
    time.
  - *Connects to:* calls `Vector3.__sub__` twice, then chains
    `Vector3.cross` and `Vector3.normalize` on the result. Called by
    nothing yet within this project; Phase D will call it directly.
  - *Shape:* `Triangle`'s own layer, alongside `centroid` — the second
    method that orchestrates `Vector3`'s own methods rather than
    touching raw numbers directly.

---

## Concept Unit: A Class Built From Other Objects

### The Problem

The original `diff3d.py` never has an object you could point to and
call "a triangle." `mesh.points` is a flat array of vertex positions;
`mesh.faces` is a separate array of index triples saying which three
rows of `mesh.points` form each triangular face. The structure is real
— every mesh genuinely is made of triangles — but it exists only
implicitly, spread across two arrays connected by numeric indices, never
as one thing you could call `.centroid()` or `.normal()` on directly.

> **Before reading on, try this yourself:** `Vector3` (Lessons 1-4) is
> built entirely from three plain numbers — `self.x = x`, and so on. A
> triangle is built from three *points*, and each point is already a
> `Vector3` you know how to build. If `__init__` can accept a plain
> number and store it as `self.x`, is there any reason it couldn't
> accept an *already-built `Vector3`* and store that instead? What
> would `self.v0 = v0` even mean, concretely, if `v0` itself is a whole
> object with its own `.x`/`.y`/`.z`, rather than a bare number?

### Introduce the Concept in Isolation

The smallest version of "build a class out of other objects, not just
numbers," run for real:

```python
# Throwaway lab: can a class be built out of *other objects*, not just numbers?
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Point({self.x}, {self.y})"

class Segment:
    def __init__(self, start, end):
        self.start = start
        self.end = end

s = Segment(Point(0, 0), Point(3, 4))
print(s.start)
print(s.end)
print(s.start.x, s.end.y)
```

Real output from running this:

```
Point(0, 0)
Point(3, 4)
0 4
```

This confirms the Socratic prompt's guess: `Segment.__init__` stores
`start` and `end` exactly the way `Vector3.__init__` stores `x`, `y`,
`z` — `self.start = start` works identically whether `start` is a
plain number or a whole `Point` object; Python's attribute assignment
doesn't care which. The proof it really is a full object, not a copy or
a flattened value: `s.start.x` — reaching *through* the `Segment` to
read an attribute on the `Point` it contains — works, and prints `0`,
the real `x` from the real `Point` that was passed in. This is called
**composition**: `Segment` doesn't duplicate `Point`'s data or
functionality; it *has* two `Point`s, and can always reach into them
for whatever they already know how to do.

### Discard the Throwaway Example

This `Segment`/`Point` pair is discarded now. The real project version,
`Triangle`, holds three `Vector3` vertices instead of two `Point`s, and
lives in its own new file.

### Project Change

- **Reference Source:** `diff3d.py`'s `save_vertex_colored_obj`:
  `faces = mesh.faces.reshape(-1, 4)[:, 1:] + 1` — each row of `faces`
  is three integer indices into `mesh.points`, which is exactly "a
  triangle," expressed implicitly through indexing rather than as its
  own object. There is no single line that *builds* a triangle object in
  the original script — this lesson factors that implicit structure out
  for the first time.
- **Files affected:** create `src/vector3d/triangle.py` (new file).
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** `Vector3` (Lessons 1-4), imported from
  `vector3d.vector`.

### The New Code

Type this into `src/vector3d/triangle.py`:

```python
from vector3d.vector import Vector3


class Triangle:
    def __init__(self, v0, v1, v2):
        self.v0 = v0
        self.v1 = v1
        self.v2 = v2
```

### The Updated Project

This is the whole new file so far — nothing larger to return to yet
(the same brand-new-file exemption Lesson 1 used). Numbered, exactly as
it sits on disk:

```
1  from vector3d.vector import Vector3
2
3
4  class Triangle:
5      def __init__(self, v0, v1, v2):
6          self.v0 = v0
7          self.v1 = v1
8          self.v2 = v2
```

Eight lines, and as a whole this file now defines a buildable
`Triangle(v0, v1, v2)` that stores three whatever-was-passed-in values
under the names `.v0`, `.v1`, `.v2` — in the intended usage, three
`Vector3` instances, though (exactly like `Vector3.__add__` back in
Lesson 2) nothing in this code enforces that yet.

### Mechanical Walkthrough

- **`from vector3d.vector import Vector3`** — Python's `from ... import
  ...` form of the `import` statement (Lesson 4 used the plain
  `import math` form; this is the first time this project imports one of
  its *own* files rather than a standard-library module). `vector3d.vector`
  names the module — the file `src/vector3d/vector.py` — and `Vector3`
  names the specific class being pulled out of it and bound to the name
  `Vector3` in this file, exactly as if it had been defined here
  directly.
- **`class Triangle:`** — the same `class` keyword from Lesson 1,
  defining a new blueprint, this time named `Triangle`.
- **`def __init__(self, v0, v1, v2):`** — `def`, `__init__` (the same
  Python-reserved constructor name from Lesson 1, called automatically
  on instantiation), `self` (this new class's own instance, same role
  as always), and three ordinary parameters `v0`, `v1`, `v2` — nothing
  in this line's syntax distinguishes "a parameter that will hold a
  plain number" (Lesson 1's `x`, `y`, `z`) from "a parameter that will
  hold a whole other object" (these three) — parameters are just names
  Python binds to whatever was passed at the call site, regardless of
  that value's own type.
- **`self.v0 = v0`** (and identically for `.v1`, `.v2`) — the same
  attribute-assignment syntax from Lesson 1 (`self.x = x`), storing each
  parameter as a persistent instance attribute. The only thing new here
  is what gets stored: not a bare number, but a reference to whatever
  `Vector3` object was passed in — `self.v0` and the caller's original
  variable both point at the exact same `Vector3` instance in memory,
  the same object, not a copy of it.

### CS Lens

This is **composition** (sometimes called "has-a," contrasted later in
this curriculum with **inheritance**, or "is-a," which this project
hasn't used yet) — building complex structures by containing simpler
ones, rather than by copying their behavior or flattening their data
into new fields.

Also recognized in: a `Car` class holding an `Engine` object rather than
duplicating the engine's own fields directly onto `Car`; a `House`
holding a list of `Room` objects; a UI framework's `Window` holding
`Button` and `TextField` objects as children; a database ORM's `Order`
object holding a list of `LineItem` objects, each of which holds its own
`Product` reference — composition chains, in practice, are rarely just
one level deep, the same way `Mesh` (Lesson 6) will hold a list of
`Triangle`s, each of which already holds three `Vector3`s.

### SE Lens

The principle here is **modeling real structure directly**, rather than
flattening it. A triangle genuinely *is* three points — not nine loose
numbers (`x0,y0,z0,x1,y1,z1,x2,y2,z2`) that happen to travel together.

The alternative not chosen: give `Triangle.__init__` nine separate
numeric parameters instead of three `Vector3` objects — flattening the
composition away entirely. That alternative avoids nothing real; it
just moves the problem: code building a `Triangle` this way would need
to unpack three `Vector3`s into nine numbers first (`t = Triangle(v0.x,
v0.y, v0.z, v1.x, ...)`), and any method on `Triangle` needing "the
first vertex as a `Vector3`" (which `normal()`, built later in this
lesson, absolutely does — it needs to call `Vector3.__sub__` on its
vertices) would have to re-wrap those nine numbers back into a
`Vector3` before it could use any of Lesson 4's methods at all. Storing
real `Vector3` objects directly means every method Lesson 4 built —
`__sub__`, `cross`, `normalize`, all of it — is immediately usable on
`self.v0`, `self.v1`, `self.v2` with zero unwrapping.

### Commands Needed

None yet.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3
from vector3d.triangle import Triangle

t = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0), Vector3(0.0, 2.0, 0.0))
print(t.v0)
print(t.v1)
print(t.v2)
"
```

Real output:

```
Vector3(0.0, 0.0, 0.0)
Vector3(2.0, 0.0, 0.0)
Vector3(0.0, 2.0, 0.0)
```

Each line prints through `Vector3.__repr__` (Lesson 3) — proof that
`t.v0`, `t.v1`, `t.v2` really are full `Vector3` objects, with all of
Lesson 4's methods available on them, not flattened numbers.

### Connect

`Triangle` can now hold three vertices, but can't yet answer any
geometric question about them — no center, no facing direction. The
next Concept Unit builds the one supporting operator `Vector3` is still
missing before `Triangle.centroid()` can be written at all: division by
a plain number.

---

## Concept Unit: Scaling a Vector by a Number

### The Problem

`Triangle`'s centroid is the average of its three vertices: add them
together, divide by `3`. `Vector3.__add__` (Lesson 2) already handles
the adding. Dividing the sum by `3` needs `/` to work between a
`Vector3` and a plain number — and `Vector3` has no `__truediv__` yet.
Trying `total / 3` right now would raise the same shape of `TypeError`
Lesson 1 hit with `+` before `__add__` existed.

> **Before reading on, try this yourself:** Lesson 2 taught `__add__`
> and `__sub__` as operations between two `Vector3` instances — `other`
> was always another `Vector3`, with its own `.x`/`.y`/`.z`. If `other`
> in a new method were a plain number instead — say, `3` — what would
> `other.x` even mean? (It wouldn't work — a plain `int` has no `.x`.)
> Given that, how would the body of a `__truediv__` method have to be
> written differently from `__add__`'s body, given that the right-hand
> side is a bare number this time, not another `Vector3`?

### Introduce the Concept in Isolation

```python
# Throwaway lab: teaching an object what "/" by a plain number means
class Pair:
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def __repr__(self):
        return f"Pair({self.a}, {self.b})"

    def __truediv__(self, n):
        return Pair(self.a / n, self.b / n)

p = Pair(9, 12)
print(p / 3)
```

Real output from running this:

```
Pair(3.0, 4.0)
```

This confirms the Socratic prompt's reasoning: `__truediv__`'s second
parameter, `n`, is used directly as a number (`self.a / n`), never as
`n.a` or `n.something` — because the right-hand side of `/` here really
is a bare `3`, not another `Pair`. `9 / 3` and `12 / 3` — ordinary
scalar division applied to each component independently — give
`3.0` and `4.0`.

### Discard the Throwaway Example

This `Pair` class is discarded now. `Vector3` gets the real
`__truediv__` next.

### Project Change

- **Reference Source:** no single line in `diff3d.py` — `numpy` array
  division by a scalar (`some_array / 3`) is built into `numpy` itself,
  invisibly. This is a from-scratch addition, needed immediately by
  `Triangle.centroid()`, built next in this same lesson.
- **Files affected:** modify `src/vector3d/vector.py`.
- **Change type:** add.
- **Location:** inside `class Vector3:`, directly after `cross`
  (Lesson 4).
- **Dependencies:** `Vector3.__init__` (Lesson 1).

### The New Code

```python
    def __truediv__(self, n):
        return Vector3(self.x / n, self.y / n, self.z / n)
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
39      def __truediv__(self, n):                                        # ← new
40          return Vector3(self.x / n, self.y / n, self.z / n)           # ← new
```

As a whole, `Vector3` now supports every arithmetic operator this
project needs: vector-with-vector (`+`, `-`) and vector-with-scalar
(`/`).

### Mechanical Walkthrough

- **`def __truediv__(self, n):`** — `def`; `__truediv__`, the specific
  dunder name Python's `/` operator dispatches to (a name distinct from
  `__add__`/`__sub__`/`__eq__`, following the same one-name-per-operator
  pattern Lesson 2 and Lesson 3 already established); `self`, the
  left-hand `Vector3`; `n`, an ordinary parameter — named `n` rather
  than `other` deliberately, since (unlike every previous binary
  operator this project has built) the right-hand side here is a plain
  scalar, not another `Vector3`.
- **`return Vector3(self.x / n, self.y / n, self.z / n)`** — `return`,
  handing back a new `Vector3`, built via `Vector3.__init__` (Lesson 1),
  the same construction pattern `__add__`/`__sub__`/`normalize` all
  used; `self.x / n` (and identically for `.y`, `.z`) — ordinary `/`
  between a plain number (`self.x`) and another plain number (`n`),
  applying the same scalar division independently to each of the three
  components — there's no cross-component interaction here, unlike
  `cross()`'s formula in Lesson 4.

### CS Lens

This is **scalar multiplication/division** — one of the two fundamental
operations, alongside vector-with-vector addition, that define what a
*vector space* actually is in linear algebra: vectors can be added to
each other, and scaled by plain numbers, and every other vector
operation is built from those two.

Also recognized in: physics (scaling a velocity vector by a time
duration to get a displacement); computer graphics (scaling a
direction vector by a speed to get a per-frame movement step);
statistics (dividing a summed vector by a count to compute a mean — the
exact operation `Triangle.centroid`, built next, performs); financial
modeling (scaling a vector of weighted portfolio positions by a single
allocation percentage).

### SE Lens

The principle is the same **consistency of interface** Lesson 2's SE
Lens named for `__add__`/`__sub__`, extended to a new operator: `/`
reads naturally as division here, the same way it does for plain
numbers, rather than needing a differently-named method like
`scale_down(3)`.

The alternative not chosen, worth naming since it's a real and common
choice: some vector libraries implement scalar *multiplication*
(`__mul__`, for `vector * 2.0`) as the primary operation and treat
division as multiplying by the reciprocal, rather than implementing
`__truediv__` directly. This project builds `__truediv__` directly
instead, without ever adding a `__mul__` — an honest, deliberate scope
limit: nothing built so far in this curriculum's roadmap needs to scale
a `Vector3` *up* by a scalar, only divide it down (this lesson's
centroid, and `normalize`'s division by length back in Lesson 4), so
`__mul__` stays unbuilt until something actually needs it, rather than
added speculatively now.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3

total = Vector3(0.0, 0.0, 0.0) + Vector3(2.0, 0.0, 0.0) + Vector3(0.0, 2.0, 0.0)
print(total)
avg = total / 3
print(avg)
"
```

Real output:

```
Vector3(2.0, 2.0, 0.0)
Vector3(0.6666666666666666, 0.6666666666666666, 0.0)
```

Three `Vector3`s added together (`__add__`, Lesson 2, called twice via
chained `+`), then the sum divided by `3` (`__truediv__`, this Concept
Unit) — exactly the arithmetic `Triangle.centroid()` needs, proven here
directly on bare `Vector3`s before it's wrapped inside a `Triangle`
method.

### Connect

`Vector3` now supports every operator `Triangle`'s own methods need.
The next Concept Unit puts `__add__` and `__truediv__` to work inside
`Triangle` itself, as its first real geometric method.

---

## Concept Unit: Averaging Vertices — `Triangle.centroid()`

### The Problem

`Triangle` can hold three vertices but can't yet say anything about
them as a whole. The most basic question — "where is the middle of this
triangle" — needs averaging: sum the three vertices, divide by three.
Both operations now exist on `Vector3` (`__add__` since Lesson 2,
`__truediv__` from earlier in this lesson); nothing has combined them
inside a `Triangle` method yet.

> **Before reading on, try this yourself:** `self.v0`, `self.v1`, and
> `self.v2` inside a `Triangle` method are each full `Vector3` objects.
> Given that `Vector3` already supports `+` between two `Vector3`s, and
> `/` between a `Vector3` and a plain number — what single expression,
> combining `self.v0`, `self.v1`, `self.v2`, and the number `3`, would
> compute their average? Try writing it out before reading the New Code
> below.

### Introduce the Concept in Isolation

```python
# Throwaway lab: averaging three composed objects using their own arithmetic
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __add__(self, other):
        return Point(self.x + other.x, self.y + other.y)

    def __truediv__(self, n):
        return Point(self.x / n, self.y / n)

    def __repr__(self):
        return f"Point({self.x}, {self.y})"

class Triangle2D:
    def __init__(self, p0, p1, p2):
        self.p0 = p0
        self.p1 = p1
        self.p2 = p2

    def centroid(self):
        return (self.p0 + self.p1 + self.p2) / 3

t = Triangle2D(Point(0, 0), Point(6, 0), Point(0, 6))
print(t.centroid())
```

Real output from running this:

```
Point(2.0, 2.0)
```

The three corners of this triangle sit at `(0,0)`, `(6,0)`, `(0,6)`; the
real, correct centroid of any triangle is one-third of the way from
each side — `2.0, 2.0` here, confirmed by real arithmetic, not a
guess. Notice `centroid()`'s own body never touches `.x` or `.y`
directly at all — it calls `self.p0 + self.p1`, `+ self.p2`, then `/
3`, entirely through the operators `Point` itself already defines. This
is the payoff of composition (the previous Concept Unit): `Triangle2D`
doesn't need to know *how* addition or division work internally: it
just asks `Point` to do it.

### Discard the Throwaway Example

This `Point`/`Triangle2D` pair is discarded now. `Triangle` gets the
real `centroid()` next.

### Project Change

- **Reference Source:** no reference counterpart — `diff3d.py` never
  computes a per-triangle centroid; `pyvista`'s `mesh.center` computes a
  centroid for an entire mesh, not per-triangle. This is a from-scratch
  addition, anticipating later lessons (surface sampling) that need one
  representative point per triangle.
- **Files affected:** modify `src/vector3d/triangle.py`.
- **Change type:** add.
- **Location:** inside `class Triangle:`, directly after `__init__`.
- **Dependencies:** `Vector3.__add__` (Lesson 2) and `Vector3.__truediv__`
  (earlier in this lesson).

### The New Code

```python
    def centroid(self):
        return (self.v0 + self.v1 + self.v2) / 3
```

### The Updated Project

`src/vector3d/triangle.py` so far, new lines marked:

```
 1  from vector3d.vector import Vector3
 2
 3
 4  class Triangle:
 5      def __init__(self, v0, v1, v2):
 6          self.v0 = v0
 7          self.v1 = v1
 8          self.v2 = v2
 9
10      def centroid(self):                                              # ← new
11          return (self.v0 + self.v1 + self.v2) / 3                     # ← new
```

As a whole, `Triangle` can now answer its first real geometric
question — where its own center is — entirely by delegating to
`Vector3`'s already-built operators (line 11 calls `__add__` twice and
`__truediv__` once), without any raw-number arithmetic inside
`Triangle` itself.

### Mechanical Walkthrough

- **`def centroid(self):`** — `def`; `centroid`, an ordinary instance
  method name (like `dot`/`length`/`normalize`/`cross` in Lesson 4 —
  not a dunder method, always called explicitly as `t.centroid()`);
  `self` only.
- **`return (self.v0 + self.v1 + self.v2) / 3`** — `return`, handing
  back a new `Vector3` (the type `Vector3.__truediv__`, called last,
  produces); `self.v0` / `self.v1` / `self.v2` — reading three
  object-valued instance attributes (this lesson's own term, set by
  `Triangle.__init__`), each a full `Vector3`; `self.v0 + self.v1` —
  Python's operator dispatch (Lesson 2) rewriting this to
  `self.v0.__add__(self.v1)`, producing a new intermediate `Vector3`;
  `+ self.v2` — a second `__add__` call, this time between that
  intermediate result and `self.v2`; the parentheses around all three —
  ordinary grouping syntax, ensuring the two additions happen before the
  division; `/ 3` — Python's operator dispatch again, this time
  rewriting to `.__truediv__(3)` (this lesson's earlier Concept Unit),
  called on the fully-summed `Vector3`.

### CS Lens

This is the **arithmetic mean**, applied here to vector-valued data
rather than plain numbers — the identical concept of "sum divided by
count," just with `Vector3.__add__` and `Vector3.__truediv__` standing
in for ordinary numeric `+` and `/`.

Also recognized in: computer graphics (a mesh's smoothed vertex
position in subdivision-surface algorithms is often the average of its
neighboring vertices); statistics and machine learning (the centroid of
a cluster in k-means clustering is computed by this exact
sum-then-divide pattern, just usually in higher dimensions than 3);
signal processing (a moving average filter); everyday GPS/mapping
(finding the "center point" of several tracked locations).

### SE Lens

The principle here is the same **composing from reused primitives**
named in Lesson 4's SE Lens, now demonstrated across class boundaries
rather than within one class: `Triangle.centroid()` doesn't reimplement
addition or division on `.x`/`.y`/`.z` triples — it reuses `Vector3`'s
own `__add__` and `__truediv__` unchanged. This is the direct payoff of
this lesson's own composition Concept Unit: because `Triangle` *has*
real `Vector3` objects (not flattened numbers), every operator built on
`Vector3` in Lessons 2-5 is already available inside `Triangle`'s
methods for free.

The alternative not chosen: write `centroid()` by reaching directly
into each vertex's raw components —
`Vector3((self.v0.x + self.v1.x + self.v2.x) / 3, ...)`, bypassing
`Vector3.__add__`/`__truediv__` entirely. That would produce an
identical numeric result today. The cost: it duplicates arithmetic
`Vector3` already owns, and — the sharper problem — it breaks the
moment `Vector3`'s own internal representation ever changed (say, if a
future revision stored coordinates differently); code reaching around
`Vector3`'s own operators to touch `.x`/`.y`/`.z` directly would need
updating in lockstep with any such change, while `self.v0 + self.v1 +
self.v2` would keep working unmodified as long as `Vector3.__add__`
still means "component-wise addition," whatever `Vector3`'s internals
end up looking like.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3
from vector3d.triangle import Triangle

t = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(6.0, 0.0, 0.0), Vector3(0.0, 6.0, 0.0))
print(t.centroid())
"
```

Real output:

```
Vector3(2.0, 2.0, 0.0)
```

Same triangle, same correct centroid as the throwaway `Point` lab, now
computed on the real `Triangle`/`Vector3` classes.

### Connect

`Triangle` can now find its own center. It still can't answer the other
basic geometric question this project needs: which way its flat surface
actually faces. That's the last Concept Unit in this lesson.

---

## Concept Unit: Which Way Does It Face — `Triangle.normal()`

### The Problem

Phase D and Phase F of this rebuild both need to know, for any given
triangle, which direction its surface points — the **face normal**.
`pyvista`'s `compute_normals()` computes this for every triangle in the
original script, invisibly. Nothing built so far combines `Triangle`'s
stored vertices with `Vector3`'s edge-and-cross-product math to produce
one.

> **Before reading on, try this yourself:** Lesson 4's last Concept Unit
> built `cross()`, and proved that crossing two perpendicular edge
> directions gives a third direction perpendicular to both. A triangle's
> three vertices, `v0`, `v1`, `v2`, aren't edge *directions* yet — they're
> *positions*. Given that `Vector3.__sub__` (Lesson 2) turns two
> positions into a direction (the vector pointing from one to the
> other), what two subtractions would give you two edge directions
> starting from the same corner, `v0`, ready to hand to `cross()`?

### Introduce the Concept in Isolation

```python
# Throwaway lab: a class method that orchestrates its own component objects' methods
class Vec2:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __sub__(self, other):
        return Vec2(self.x - other.x, self.y - other.y)

    def __repr__(self):
        return f"Vec2({self.x}, {self.y})"

class Corner:
    def __init__(self, a, b, c):
        self.a = a
        self.b = b
        self.c = c

    def spread(self):
        # not real geometry, just proving edges can be built from stored corners
        return (self.b - self.a, self.c - self.a)

t = Corner(Vec2(0, 0), Vec2(4, 0), Vec2(0, 4))
e1, e2 = t.spread()
print(e1, e2)
```

Real output from running this:

```
Vec2(4, 0) Vec2(0, 4)
```

`self.b - self.a` and `self.c - self.a` — both ordinary `Vector3`-style
subtractions (Lesson 2's `__sub__`, here on a throwaway `Vec2`) — turn
two of the three stored *positions* into two *edge directions*, both
starting from the same corner `a`. This confirms the Socratic prompt's
answer: the two subtractions this lab's `spread()` performs are exactly
the shape `Triangle.normal()` needs before it can call `cross()` at
all.

### Discard the Throwaway Example

This `Vec2`/`Corner` pair is discarded now. `Triangle` gets the real
`normal()` next.

### Project Change

- **Reference Source:** no single line — `pyvista`'s `compute_normals()`
  performs this exact edge-and-cross-product computation internally,
  for every triangle, without exposing the individual steps. This
  Concept Unit is where that invisible computation becomes explicit,
  real code.
- **Files affected:** modify `src/vector3d/triangle.py`.
- **Change type:** add.
- **Location:** inside `class Triangle:`, directly after `centroid`
  (earlier in this same lesson).
- **Dependencies:** `Vector3.__sub__` (Lesson 2), `Vector3.cross`, and
  `Vector3.normalize` (both Lesson 4).

### The New Code

```python
    def normal(self):
        edge1 = self.v1 - self.v0
        edge2 = self.v2 - self.v0
        return edge1.cross(edge2).normalize()
```

### The Updated Project

`src/vector3d/triangle.py` in full, new lines marked:

```
 1  from vector3d.vector import Vector3
 2
 3
 4  class Triangle:
 5      def __init__(self, v0, v1, v2):
 6          self.v0 = v0
 7          self.v1 = v1
 8          self.v2 = v2
 9
10      def centroid(self):
11          return (self.v0 + self.v1 + self.v2) / 3
12
13      def normal(self):                                                # ← new
14          edge1 = self.v1 - self.v0                                    # ← new
15          edge2 = self.v2 - self.v0                                    # ← new
16          return edge1.cross(edge2).normalize()                        # ← new
```

As a whole, `Triangle` is now a complete, self-contained geometric
object: it holds three vertices, can find its own center (`centroid`),
and can report which way it faces (`normal`) — everything Lesson 6's
`Mesh` class and Phase D's normal-averaging will need from an
individual triangle.

### Mechanical Walkthrough

- **`def normal(self):`** — `def`; `normal`, an ordinary instance
  method name; `self` only.
- **`edge1 = self.v1 - self.v0`** — a local variable assignment
  (`edge1` exists only for this method call, the same role `n` played
  inside `normalize()` in Lesson 4); `self.v1 - self.v0` — Python's
  operator dispatch rewriting this to `self.v1.__sub__(self.v0)`
  (Lesson 2), producing a new `Vector3` pointing from vertex `v0` toward
  vertex `v1` — a direction, not a position.
- **`edge2 = self.v2 - self.v0`** — identical shape to the line above,
  a second edge direction, from `v0` toward `v2` this time.
- **`return edge1.cross(edge2).normalize()`** — `return`, handing back
  a new `Vector3`; `edge1.cross(edge2)` — calling `Vector3.cross`
  (Lesson 4) explicitly (not through operator dispatch — `cross` is an
  ordinary method, not a dunder method, so it's called by name, not
  triggered by a symbol), producing a raw perpendicular vector of
  whatever length the cross-product formula happens to produce;
  `.normalize()` — chained directly onto that result, calling
  `Vector3.normalize` (Lesson 4) on the freshly-returned `Vector3`
  without storing it in an intermediate variable first, rescaling it to
  exactly length `1` before this method hands it back.

### CS Lens

This is **method chaining** on the result of a computation
(`edge1.cross(edge2).normalize()`) combined with the same **face-normal**
computation named in Lesson 4's cross-product CS Lens — the difference
here is that it's now assembled end-to-end, inside a method that
belongs to the exact geometric object (`Triangle`) the normal describes,
rather than demonstrated on bare `Vector3` edges in isolation.

Also recognized in: every 3D graphics engine's mesh-loading pipeline
(computing per-face normals is one of the first steps after loading raw
vertex/index data, exactly the position this method occupies in this
project's own pipeline); CAD and CNC software (a machined surface's
normal direction determines tool approach angles — directly relevant to
the machining-comparison purpose of the original `diff3d.py` itself);
physics engines (collision response uses surface normals to determine
which direction to push colliding objects apart).

### SE Lens

The principle is, once more, **composing from reused primitives** — now
demonstrated as a three-step chain (`__sub__`, then `cross`, then
`normalize`) all defined elsewhere (Lessons 2 and 4), with `normal()`
itself contributing no new arithmetic of its own, only the specific
sequence and choice of which two edges to use.

The alternative not chosen: compute the normal from `v1 - v2` and
`v2 - v0`, or any other pair of the triangle's three possible edges,
instead of consistently anchoring both edges at `v0`. Mathematically,
several edge-pair choices produce a normal pointing the same general
direction (up to which way "front" and "back" are defined) — this isn't
a correctness issue so much as a consistency one. The real cost worth
naming honestly: this method's output direction (front-facing versus
back-facing) depends on the *order* `v0`, `v1`, `v2` were stored in when
the `Triangle` was constructed, because `cross()` (Lesson 4) is
order-sensitive. Lesson 6's STL parser will need to preserve whatever
vertex winding order the source file itself uses, or every normal this
method computes could end up pointing the wrong way — a real dependency
between two lessons that aren't adjacent in this curriculum's own
numbering, worth remembering when Lesson 6 is written.

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
print(t.normal())
print(t.normal().length())
"
```

Real output:

```
Vector3(0.0, 0.0, 1.0)
1.0
```

The same flat, xy-plane triangle from earlier in this lesson faces
straight along the z-axis, confirmed via `.length()` (Lesson 4) to be
exactly unit length — proof `normalize()` did its job at the end of the
chain.

### Connect

`Triangle` is now complete: three stored vertices, a center, and a
facing direction — every method Lesson 6's `Mesh` class needs from an
individual triangle already exists.

---

## Connect the Pieces

One triangle, traced through every method this lesson added: build
`t = Triangle(Vector3(0,0,0), Vector3(2,0,0), Vector3(0,2,0))` — three
already-built `Vector3` instances (Lessons 1-4), stored as
object-valued attributes by `Triangle.__init__` (this lesson's first
Concept Unit). `t.centroid()` (third Concept Unit) reaches into those
three stored `Vector3`s and calls `Vector3.__add__` (Lesson 2) twice,
then `Vector3.__truediv__` (this lesson's second Concept Unit) once,
producing `Vector3(0.666..., 0.666..., 0.0)` — the triangle's own
center, computed without a single raw-number operation inside `Triangle`
itself. Separately, `t.normal()` (fourth Concept Unit) reaches into the
same three stored vertices, calls `Vector3.__sub__` (Lesson 2) twice to
get two edges, `Vector3.cross` (Lesson 4) once to get a raw perpendicular
direction, and `Vector3.normalize` (Lesson 4) once more to make it unit
length, producing `Vector3(0.0, 0.0, 1.0)`. Two completely different
geometric answers — where the triangle's center is, and which way it
faces — both computed the same way: `Triangle`'s own methods contain no
arithmetic of their own at all, only calls into the object-valued
attributes composition (this lesson's first Concept Unit) gave it access
to.

---

## Try It Yourself

Type `Triangle` into `src/vector3d/triangle.py` yourself (not
copy-pasted), add `__truediv__` to your own `vector.py`, and confirm
all three `Run It` outputs above with your own numbers. Then, once
that works, try this — a triangle built with its vertices in the
*opposite* order from every example in this lesson — and see for
yourself the real consequence this lesson's SE Lens flagged about
vertex order and `normal()`:

```python
t_forward = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(2.0, 0.0, 0.0), Vector3(0.0, 2.0, 0.0))
t_reversed = Triangle(Vector3(0.0, 0.0, 0.0), Vector3(0.0, 2.0, 0.0), Vector3(2.0, 0.0, 0.0))
print(t_forward.normal())
print(t_reversed.normal())
```
