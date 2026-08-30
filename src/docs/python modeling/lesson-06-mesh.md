# Lesson 6: Composition With a List — `Mesh`

**What you will build:** a new class, `Mesh`, in a new file
`src/vector3d/mesh.py` — the third layer of this project's architecture,
sitting on top of `Triangle` (Lesson 5) the same way `Triangle` sits on
top of `Vector3` (Lessons 1-4). Where `Triangle` composes a *fixed*
number of named objects (always exactly `v0`, `v1`, `v2`), `Mesh`
composes a *variable-length list* of them — however many triangles a
real mesh happens to have. This is Phase A's last lesson: by the end of
it, every replacement for `mesh.bounds`, `mesh.center`, and the
structural role `mesh.points`/`mesh.faces` play in the original
`diff3d.py` will exist, built entirely from `Vector3` and `Triangle`.

**What you need to know first:** Lessons 1-4 (`Vector3` — a complete
geometry toolkit) and Lesson 5 (composition, `Triangle` — three named
`Vector3` vertices, `centroid()`, `normal()`).

**Terms used in this lesson:**
- **collection composition** — composition (Lesson 5's term: a class
  built from other objects) where the contained objects live in a
  *list*, not a fixed set of individually-named attributes. `Triangle`
  has exactly `.v0`, `.v1`, `.v2` — three names, always three. `Mesh`
  has `.triangles` — one name, holding however many `Triangle` objects
  the mesh actually contains, which is not known or fixed when the
  class is written.
- **`for` loop over a list of objects** — the same `for item in
  collection:` syntax you already know from ordinary Python. What's new
  here isn't the loop itself — it's that `item` on each pass is a full
  `Triangle`, with its own `.v0`/`.v1`/`.v2` and its own methods, rather
  than a plain number.
- **nested attribute access** — reading an attribute through another
  attribute, chained (`triangle.v0.x` — the `.x` of the `.v0` of a
  `triangle`). Nothing new mechanically beyond ordinary `.` attribute
  access (Lesson 1); what's new is that it's now two levels deep,
  because `Mesh` composes `Triangle`, which itself composes `Vector3`.
- **`min()` / `max()`** — Python's built-in functions for finding the
  smallest/largest value in a collection of numbers. Used here exactly
  as you already know them; the only new context is applying them to
  numbers pulled out of many nested objects, not a plain list of numbers
  handed to them directly.
- **`@property`** — a decorator that makes a method accessible using
  plain attribute syntax (`mesh.center`, no parentheses) instead of
  method-call syntax (`mesh.center()`). It exists so that a value which
  is *computed*, rather than stored directly, can still be read the same
  way a stored attribute would be — the caller doesn't need to know or
  care whether `.center` is a stored number or a calculation happening
  on the spot every time it's read.
- **decorator** — the `@name` syntax placed directly above a `def`,
  modifying how that function or method behaves or is accessed.
  `@property` is this lesson's only example; the general mechanism
  (a decorator wraps or alters the thing defined right below it) exists
  so Python code can add reusable behavior to a function or method
  without rewriting that function's own body to include it.

**Objects and methods used:**

- **`Mesh`**
  - *What it is:* a class representing an entire 3D surface — the
    top-level object this whole rebuild's `run_diff()` (Phase G) will
    load, align, and compare.
  - *Implementation:* `class Mesh:` with `__init__(self, triangles)`
    storing a list of `Triangle` instances as `self.triangles`, plus
    `bounds()` and the `center` property built later in this lesson.
  - *Its use:* stands in for `pyvista`'s `PolyData` mesh object — the
    thing `pyvista.read(path)` returns in the original script's
    `run_diff()`, and the thing every later phase of this rebuild
    (sampling, spatial search, distance, export) operates on as a whole.
  - *Type:* a plain class, no parent class, composed of a *list* of
    `Triangle` objects rather than a fixed few.
  - *Responsibility:* to hold every triangle making up one 3D surface as
    one named unit, and to answer whole-mesh geometric questions (its
    bounding box, its center) by scanning across all of them.
  - *Depends on:* a list of already-built `Triangle` instances, handed
    to it at construction time.
  - *Connects to:* nothing calls `Mesh` yet — Lesson 7-8 (binary STL
    parsing) will construct one directly from parsed file data, the same
    way Lesson 6 (this one) doesn't yet have anything calling `Triangle`
    either, until Lesson 7-8 exists. `Mesh` itself calls `Triangle.v0`/
    `.v1`/`.v2` (nested attribute access) and Python's built-in
    `min()`/`max()`.
  - *Shape:* the third and topmost layer of this project's architecture
    so far — `Vector3` → `Triangle` → `Mesh`, each layer composed of the
    one below it.

- **`Mesh.bounds`**
  - *What it is:* an instance method computing the smallest
    axis-aligned box containing every vertex in the mesh.
  - *Implementation:*
    ```
    def bounds(self):
        xs = []
        ys = []
        zs = []
        for triangle in self.triangles:
            for vertex in (triangle.v0, triangle.v1, triangle.v2):
                xs.append(vertex.x)
                ys.append(vertex.y)
                zs.append(vertex.z)
        return (min(xs), max(xs), min(ys), max(ys), min(zs), max(zs))
    ```
    — takes only `self`, returns a 6-element tuple.
  - *Its use:* directly replaces `mesh.bounds` in `diff3d.py`'s
    `sample_points()` (`xmin, xmax, ymin, ymax, zmin, zmax = mesh.bounds`)
    and `align3d()` (computing `size` from those six values) — same
    six-number shape, same unpacking pattern, computed by hand instead
    of by `pyvista`.
  - *Type:* an ordinary instance method (not a dunder method, not a
    property — called explicitly as `mesh.bounds()`).
  - *Responsibility:* to scan every vertex of every triangle in the
    mesh exactly once, and report the overall minimum and maximum along
    each axis.
  - *Depends on:* `self.triangles` (a list of `Triangle` instances, set
    by `Mesh.__init__`), and each `Triangle`'s own `.v0`/`.v1`/`.v2`
    attributes (set by `Triangle.__init__`, Lesson 5).
  - *Connects to:* reads every `Triangle` in `self.triangles`, and
    through each one, every `Vector3` vertex it holds; calls Python's
    built-in `min()`/`max()`. `Mesh.center`, built next in this same
    lesson, calls `self.bounds()` directly.
  - *Shape:* `Mesh`'s own layer — the first method in this project that
    scans an entire *collection* of composed objects, rather than a
    fixed few.

- **`Mesh.center`**
  - *What it is:* a computed property returning the center point of the
    mesh's bounding box.
  - *Implementation:*
    ```
    @property
    def center(self):
        xmin, xmax, ymin, ymax, zmin, zmax = self.bounds()
        return Vector3((xmin + xmax) / 2, (ymin + ymax) / 2, (zmin + zmax) / 2)
    ```
    — decorated with `@property`, takes only `self`, returns a
    `Vector3`, accessed as `mesh.center` (no parentheses).
  - *Its use:* directly replaces `mesh.center` in `diff3d.py`'s
    `run_diff()` (`m1.translate(-np.array(m1.center), inplace=True)`)
    and `align3d()`'s alignment `delta` computation — same plain-attribute
    access syntax, `mesh.center`, computed by hand instead of by
    `pyvista`.
  - *Type:* a property (a method wrapped by the `@property` decorator,
    changing how it's accessed at the call site, not what kind of method
    it fundamentally is).
  - *Responsibility:* to compute and return the midpoint of the mesh's
    own bounding box, recalculating it fresh from `self.triangles` every
    time it's accessed.
  - *Depends on:* `self.bounds()` (this lesson, defined just above), and
    `Vector3.__init__` (Lesson 1) to build the return value.
  - *Connects to:* calls `self.bounds()` internally, then
    `Vector3(...)`. Nothing calls it yet within this project; Lesson 20
    (assembling `run_diff`) will, to replicate the original script's
    centering-at-origin step.
  - *Shape:* `Mesh`'s own layer — the first `@property` anywhere in this
    project, demonstrating that a value doesn't need to be stored
    directly on an instance to be read like a plain attribute.

---

## Concept Unit: Composition With a List, Not a Fixed Few

### The Problem

`Triangle` (Lesson 5) always has exactly three vertices — `v0`, `v1`,
`v2`, three separate named attributes, known in advance. A mesh doesn't
work that way: a real STL file might contain a dozen triangles or a
hundred thousand, and that number isn't known until the file is
actually read. `Triangle.__init__`'s pattern of one named parameter per
component (`v0`, `v1`, `v2`) can't scale to "however many triangles
happen to exist" — there's no way to write `t0, t1, t2, t3, ..., t847`
as parameters when the count varies mesh to mesh.

> **Before reading on, try this yourself:** Python's `list` type can
> hold any number of items, known only at runtime, not fixed when the
> code is written — you already know this from ordinary Python, no OOP
> involved. If `Triangle.__init__` can accept a single already-built
> `Vector3` and store it as `self.v0` (Lesson 5), is there any reason
> `Mesh.__init__` couldn't accept a single already-built *list* of
> `Triangle` objects and store the whole list as one attribute? What
> would change about how code *outside* the class accesses individual
> triangles, compared to how it accesses `triangle.v0` directly by
> name?

### Introduce the Concept in Isolation

```python
# Throwaway lab: can a class be built out of a *list* of other objects?
class Item:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def __repr__(self):
        return f"Item({self.name!r}, {self.price})"

class Cart:
    def __init__(self, items):
        self.items = items

c = Cart([Item("pencil", 0.5), Item("notebook", 2.0), Item("eraser", 0.25)])
print(c.items)
print(len(c.items))
print(c.items[1].name)
```

Real output from running this:

```
[Item('pencil', 0.5), Item('notebook', 2.0), Item('eraser', 0.25)]
3
notebook
```

`Cart.__init__` stores the whole list as `self.items` — one attribute,
however many `Item`s were passed in, exactly the shape the Socratic
prompt above predicted. `len(c.items)` (Python's built-in `len()`,
already familiar) confirms the count is `3`, whatever it happens to be
— nothing in `Cart` had to name three separate parameters the way
`Triangle.__init__` named `v0`/`v1`/`v2`. `c.items[1].name` shows the
access pattern that replaces named attributes: ordinary list indexing
(`[1]`) to reach a specific `Item`, then `.name` (nested attribute
access, this lesson's term) to reach inside it — where `Triangle`'s
fixed vertices are reached by name (`triangle.v0`), a `Mesh`'s
triangles are reached by position.

### Discard the Throwaway Example

This `Item`/`Cart` pair is discarded now. The real project version,
`Mesh`, holds a list of `Triangle` objects instead of `Item`s, and lives
in its own new file.

### Project Change

- **Reference Source:** `diff3d.py`'s `run_diff()`:
  `m1 = pyvista.read(path1)` — the object `pyvista.read` returns is
  `pyvista`'s own mesh type, internally holding an arbitrary number of
  faces/triangles read from the file. There is no line that builds this
  object from a Python list the way this lesson's `Mesh` does — `pyvista`
  constructs it from the file format directly. This lesson factors out
  the general shape ("a mesh is a collection of triangles") before
  Lessons 7-8 add the actual file-reading.
- **Files affected:** create `src/vector3d/mesh.py` (new file).
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** `Triangle` (Lesson 5), though `mesh.py` doesn't need
  to `import` it directly for `__init__` alone — it only stores whatever
  list it's handed, the same way `Triangle.__init__` didn't need to
  `import` anything to store `v0`/`v1`/`v2`. (`Mesh` will need to
  `import Vector3` directly once `center`, later in this lesson, needs
  to construct one.)

### The New Code

Type this into `src/vector3d/mesh.py`:

```python
class Mesh:
    def __init__(self, triangles):
        self.triangles = triangles
```

### The Updated Project

This is the whole new file so far — nothing larger to return to yet
(the same brand-new-file exemption Lessons 1 and 5 used):

```
1  class Mesh:
2      def __init__(self, triangles):
3          self.triangles = triangles
```

Three lines, and as a whole this file now defines a buildable
`Mesh(triangles)` that stores whatever list was passed in under the
name `.triangles` — in the intended usage, a list of `Triangle`
instances, though (like every constructor built so far) nothing in
this code enforces that yet.

### Mechanical Walkthrough

- **`class Mesh:`** — the same `class` keyword from Lesson 1, defining
  a new blueprint named `Mesh`.
- **`def __init__(self, triangles):`** — `def`, `__init__` (Lesson 1's
  reserved constructor name), `self`, and one parameter, `triangles` —
  a single name intended to hold a whole list, not one item, which is
  the entire structural difference from `Triangle.__init__`'s three
  separately-named parameters (Lesson 5).
- **`self.triangles = triangles`** — the same attribute-assignment
  syntax from Lesson 1 (`self.x = x`) and Lesson 5 (`self.v0 = v0`),
  storing the whole list object as one instance attribute; `self.triangles`
  and the caller's original list both refer to the exact same list in
  memory, not a copy — the same "same object, not a duplicate"
  relationship Lesson 5 noted for `self.v0`.

### CS Lens

This is still **composition** (Lesson 5), specialized to the common
case of a class holding a *collection* of a component type rather than
a fixed few — sometimes called a "one-to-many" or "aggregate"
relationship, distinct from `Triangle`'s "one-to-exactly-three."

Also recognized in: a `Playlist` class holding a list of `Song` objects;
a `Classroom` holding a list of `Student` objects; a database ORM's
`Order` holding a list of `LineItem` objects (mentioned already in
Lesson 5's CS Lens as the next link in a composition chain — this is
that exact pattern, now built for real); a game engine's `Scene` holding
a list of `GameObject`s.

### SE Lens

The principle is the same **modeling real structure directly** named in
Lesson 5's SE Lens, extended to the case where "how many" isn't fixed in
advance. A mesh genuinely is "some number of triangles" — not three, not
any other fixed count — and a list is the direct, honest representation
of that, the same way three separate named attributes were the direct,
honest representation of a triangle's exactly-three vertices.

The alternative not chosen: give `Mesh` a fixed maximum number of named
triangle slots (`self.t0`, `self.t1`, ..., up to some cap), leaving
unused slots empty. This would be a real, if unusual, design — and it
would immediately fail the moment a mesh needed more triangles than the
cap allowed, or waste memory and require constant "is this slot empty"
checks for meshes with fewer. A list has neither problem: it grows to
exactly the size it needs, known only at runtime, with no upper bound
baked into the class itself.

### Commands Needed

None yet.

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
m = Mesh([t1, t2])
print(len(m.triangles))
print(m.triangles[0].v0)
print(m.triangles[1].v2)
"
```

Real output:

```
2
Vector3(0.0, 0.0, 0.0)
Vector3(1.0, 3.0, 3.0)
```

`len(m.triangles)` confirms the mesh really holds however many
triangles were passed in — here, `2`. `m.triangles[0].v0` and
`m.triangles[1].v2` are this lesson's nested attribute access in
action: indexing into the list to reach a specific `Triangle`, then
reaching through it to one of *its own* stored `Vector3` vertices.

### Connect

`Mesh` can now hold any number of triangles, but can't yet answer any
whole-mesh geometric question about them. The next Concept Unit scans
every triangle to compute the mesh's overall bounding box.

---

## Concept Unit: Scanning the Whole Mesh — `Mesh.bounds()`

### The Problem

`diff3d.py`'s `sample_points()` starts with
`xmin, xmax, ymin, ymax, zmin, zmax = mesh.bounds` — the smallest box
containing the entire mesh, used to decide where to place sample points.
`align3d()` uses those same six numbers to compute `size`, the mesh's
overall scale. `Mesh.bounds` doesn't exist yet: nothing built so far
looks at more than one `Triangle` at a time, let alone finds the overall
minimum and maximum across every vertex of every triangle in a whole
mesh.

> **Before reading on, try this yourself:** you already know how to
> find the smallest and largest number in a plain list — Python's
> built-in `min()`/`max()`. The harder part here isn't finding a min or
> max; it's *collecting* the right numbers to hand to `min()`/`max()`
> in the first place, given that the actual numbers (each vertex's `.x`,
> `.y`, `.z`) are buried two levels deep — inside `Vector3` objects,
> which are inside `Triangle` objects, which are inside a list on
> `Mesh`. Sketch out, in plain words before any code, what you'd need to
> loop over, and what you'd need to loop over *inside* that, to visit
> every single vertex in the whole mesh exactly once.

### Introduce the Concept in Isolation

```python
# Throwaway lab: scanning a list of composed objects to find running min/max
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

class Shape:
    def __init__(self, points):
        self.points = points

    def bounds(self):
        xs = []
        ys = []
        for point in self.points:
            xs.append(point.x)
            ys.append(point.y)
        return (min(xs), max(xs), min(ys), max(ys))

s = Shape([Point(1, 5), Point(-3, 2), Point(4, -1)])
print(s.bounds())
```

Real output from running this:

```
(-3, 4, -1, 5)
```

`bounds()` here loops over `self.points` once, pulling every `.x` into
one list and every `.y` into another, then hands each list to `min()`
and `max()` (both already-familiar built-ins). The result is correct
and checkable by eye: the three points' `x` values are `1, -3, 4` —
minimum `-3`, maximum `4`, matching the first two numbers returned;
their `y` values are `5, 2, -1` — minimum `-1`, maximum `5`, matching
the last two. This two-list-then-min/max approach is one valid way to
solve the problem the Socratic prompt posed; the real `Mesh.bounds()`
built next uses the identical structure, just with one more axis (`z`)
and one more level of nesting (triangles, each with three vertices,
instead of points directly).

### Discard the Throwaway Example

This `Point`/`Shape` pair is discarded now. `Mesh` gets the real
`bounds()` next.

### Project Change

- **Reference Source:** `diff3d.py`, `sample_points()`:
  `xmin, xmax, ymin, ymax, zmin, zmax = mesh.bounds`, and `align3d()`'s
  own `xmin, xmax, ymin, ymax, zmin, zmax = stationary.bounds` line, used
  to compute `size`.
- **Files affected:** modify `src/vector3d/mesh.py`.
- **Change type:** add.
- **Location:** inside `class Mesh:`, directly after `__init__`.
- **Dependencies:** `self.triangles` (set by `Mesh.__init__`, earlier in
  this lesson), and each `Triangle`'s `.v0`/`.v1`/`.v2` (Lesson 5).

### The New Code

```python
    def bounds(self):
        xs = []
        ys = []
        zs = []
        for triangle in self.triangles:
            for vertex in (triangle.v0, triangle.v1, triangle.v2):
                xs.append(vertex.x)
                ys.append(vertex.y)
                zs.append(vertex.z)
        return (min(xs), max(xs), min(ys), max(ys), min(zs), max(zs))
```

### The Updated Project

`src/vector3d/mesh.py` so far, new lines marked:

```
 1  class Mesh:
 2      def __init__(self, triangles):
 3          self.triangles = triangles
 4
 5      def bounds(self):                                                # ← new
 6          xs = []                                                      # ← new
 7          ys = []                                                      # ← new
 8          zs = []                                                      # ← new
 9          for triangle in self.triangles:                              # ← new
10              for vertex in (triangle.v0, triangle.v1, triangle.v2):   # ← new
11                  xs.append(vertex.x)                                  # ← new
12                  ys.append(vertex.y)                                  # ← new
13                  zs.append(vertex.z)                                  # ← new
14          return (min(xs), max(xs), min(ys), max(ys), min(zs), max(zs))  # ← new
```

As a whole, `Mesh` can now answer its first whole-mesh question: the
smallest box containing every vertex of every triangle it holds — the
same six-number shape (`xmin, xmax, ymin, ymax, zmin, zmax`) the
original script unpacks directly from `mesh.bounds`.

### Mechanical Walkthrough

- **`def bounds(self):`** — `def`; `bounds`, an ordinary instance
  method name (like `centroid`/`normal` in Lesson 5 — not a dunder
  method); `self` only.
- **`xs = []`, `ys = []`, `zs = []`** — three empty lists, one per axis,
  created fresh each time `bounds()` runs, to be filled by the loop
  below.
- **`for triangle in self.triangles:`** — an ordinary `for` loop over
  `self.triangles` (set by `Mesh.__init__`, earlier in this lesson); on
  each pass, `triangle` is bound to one full `Triangle` object from the
  list, with all of Lesson 5's own attributes and methods available on
  it.
- **`for vertex in (triangle.v0, triangle.v1, triangle.v2):`** — a
  second, nested `for` loop, running fully for every single pass of the
  outer loop; `(triangle.v0, triangle.v1, triangle.v2)` builds a
  three-item tuple from the current triangle's three named vertices
  (Lesson 5), and the loop visits each one in turn, binding `vertex` to
  a full `Vector3` object each time.
- **`xs.append(vertex.x)`** (and identically for `ys`/`.y`, `zs`/`.z`) —
  `vertex.x` is nested attribute access (this lesson's term): reading
  the `.x` attribute off the current `Vector3`, itself reached by
  looping into the current `Triangle`, itself reached by looping into
  `self.triangles`; `.append(...)` adds that single number onto the end
  of the running list — by the time both loops finish, `xs` holds every
  `x` coordinate from every vertex of every triangle in the whole mesh,
  exactly once each.
- **`return (min(xs), max(xs), min(ys), max(ys), min(zs), max(zs))`** —
  `return`, handing back a 6-element tuple; `min(xs)`/`max(xs)` (and
  identically for `ys`, `zs`) — Python's built-in functions, each
  scanning one of the three fully-populated lists to find its smallest
  and largest value; the six results are assembled, in this specific
  order, into one tuple — the same `xmin, xmax, ymin, ymax, zmin, zmax`
  ordering `mesh.bounds` uses in the original script, chosen
  deliberately to match it.

### CS Lens

This is a **reduction** (or "fold") — visiting every element of a
collection and combining them down to a smaller summary — here, six
summaries (`min`/`max` per axis) instead of one, but the same underlying
pattern as any sum, count, or average computed by scanning a collection
once. Nested inside it is a **nested traversal**: visiting every element
of a collection-of-collections (triangles, each containing vertices)
by looping inside a loop, needed specifically because the data this
project models is two levels deep (`Mesh` contains `Triangle`s, each
containing `Vector3`s), not flat.

Also recognized in: database query engines (a `GROUP BY` with `MIN`/`MAX`
aggregates performs exactly this reduction, just expressed
declaratively rather than as an explicit loop); computer graphics
(computing a scene's overall bounding volume for camera framing or
collision broad-phase, by scanning every object's own bounds); data
analysis libraries (`numpy`'s own `.min()`/`.max()`, which is precisely
what this method exists to replace, since `mesh.bounds` in the original
script leans on `numpy` internals doing this same reduction).

### SE Lens

The principle here is **correctness through complete traversal** — this
method's whole job depends on visiting every single vertex exactly
once; visiting too few would silently produce a bounding box smaller
than the real mesh, and there's no way to know that happened just by
looking at the returned numbers.

The alternative not chosen, worth naming honestly: this implementation
allocates three full lists (`xs`, `ys`, `zs`) sized to every vertex in
the mesh, only to immediately reduce each one down to two numbers
(`min`, `max`) and then discard the lists entirely. A version that
tracked running min/max values directly inside the loop — comparing
each new coordinate against the current best-so-far, updating in place,
with no lists built at all — would use much less memory for a large
mesh, at the cost of slightly more code (explicit `if x < current_min:`
comparisons instead of a single `min()` call at the end). This
project's own `stock*.stl` files (referenced in the original script's
`__main__` block) are modest enough that this cost is fine to accept
for now — a real debt worth flagging honestly rather than one that's
actually been a problem yet: a mesh with millions of vertices would
make this version's memory use meaningfully worse than the
running-comparison alternative.

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
m = Mesh([t1, t2])
print(m.bounds())
"
```

Real output:

```
(0.0, 3.0, 0.0, 3.0, 0.0, 3.0)
```

Two triangles together span `x` from `0.0` to `3.0`, `y` from `0.0` to
`3.0`, and `z` from `0.0` to `3.0` — checkable directly against the six
vertex coordinates used to build `t1` and `t2` above.

### Connect

`Mesh` can now compute its own bounding box on demand, by calling
`mesh.bounds()`. The next Concept Unit builds something related but
accessed differently: a value that *looks* like a plain stored
attribute, `mesh.center`, but is actually computed fresh from
`bounds()` every time it's read.

---

## Concept Unit: A Value That Looks Stored But Isn't — `Mesh.center`

### The Problem

`diff3d.py`'s `run_diff()` does `m1.translate(-np.array(m1.center), ...)`
— reading `m1.center` with plain attribute syntax, no parentheses, the
same way you'd read `m1.n_points` or any other stored value. But a
mesh's center isn't something that needs to be *stored* — it's
something that can always be *derived* from the mesh's own triangles,
the same way `bounds()` (just built) already derives the bounding box.
If `Mesh.center` were an ordinary method, code using it would have to
write `mesh.center()`, with parentheses — a small but real mismatch
with how the original script (and `pyvista`'s own mesh objects) actually
use it.

> **Before reading on, try this yourself:** you already have everything
> needed to compute a mesh's center: `bounds()` returns
> `(xmin, xmax, ymin, ymax, zmin, zmax)`, and the center of a box along
> any one axis is the midpoint between its min and max on that axis —
> ordinary averaging, the same shape as Lesson 5's `Triangle.centroid()`,
> just using two numbers instead of three. Write out, in plain words,
> the midpoint formula for one axis given `xmin` and `xmax`, before
> reading the New Code below. Separately: what would you guess Python
> needs, syntactically, to let a method be accessed as `mesh.center`
> instead of `mesh.center()`?

### Introduce the Concept in Isolation

```python
# Throwaway lab: a method that can be accessed like a plain attribute
import math

class Circle:
    def __init__(self, radius):
        self.radius = radius

    @property
    def area(self):
        return math.pi * self.radius ** 2

c = Circle(2.0)
print(c.area)
print(c.area)
```

Real output from running this:

```
12.566370614359172
12.566370614359172
```

`c.area` — no parentheses anywhere at the call site — still runs
`area`'s real method body and returns a real, freshly-computed number
each time (`math.pi * self.radius ** 2` for a radius of `2.0`, matching
what you'd expect for a circle's area). The `@property` line directly
above `def area(self):` is what makes this possible: it's a
**decorator** (this lesson's term), and it tells Python "let this method
be read using attribute syntax, not call syntax." Printing `c.area`
twice, getting the identical number both times, confirms it's not a
fluke of one particular call — every read of `c.area` re-runs the
method body fresh; nothing about `c.radius` changed between the two
prints, so nothing about the computed area changed either, but if
`c.radius` *had* changed between them, `c.area` would have reflected
that automatically on the very next read, with no method call needed to
refresh it.

### Discard the Throwaway Example

This `Circle` class is discarded now. `Mesh` gets the real `center`
property next.

### Project Change

- **Reference Source:** `diff3d.py`'s `run_diff()`:
  `m1.translate(-np.array(m1.center), inplace=True)` and
  `m2.translate(-np.array(m1.center), inplace=True)` — both read
  `m1.center` with plain attribute syntax, no parentheses, matching
  exactly what `@property` is needed to replicate here.
- **Files affected:** modify `src/vector3d/mesh.py`.
- **Change type:** add.
- **Location:** inside `class Mesh:`, directly after `bounds` (earlier
  in this same lesson). Also requires adding
  `from vector3d.vector import Vector3` at the top of the file — this
  is the first method in `mesh.py` that needs to *construct* a
  `Vector3`, rather than only read attributes off ones already handed
  to it through `Triangle`.
- **Dependencies:** `Mesh.bounds` (earlier in this lesson) and
  `Vector3.__init__` (Lesson 1).

### The New Code

At the top of `src/vector3d/mesh.py`, before `class Mesh:`:

```python
from vector3d.vector import Vector3
```

Then, inside `class Mesh:`, after `bounds`:

```python
    @property
    def center(self):
        xmin, xmax, ymin, ymax, zmin, zmax = self.bounds()
        return Vector3((xmin + xmax) / 2, (ymin + ymax) / 2, (zmin + zmax) / 2)
```

### The Updated Project

`src/vector3d/mesh.py` in full, new lines marked:

```
 1  from vector3d.vector import Vector3                                  # ← new
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
19      @property                                                        # ← new
20      def center(self):                                                # ← new
21          xmin, xmax, ymin, ymax, zmin, zmax = self.bounds()           # ← new
22          return Vector3((xmin + xmax) / 2, (ymin + ymax) / 2, (zmin + zmax) / 2)  # ← new
```

As a whole, `Mesh` is now a complete, self-contained top-level object:
it holds any number of triangles, can compute its own bounding box on
demand, and can be asked for its own center with plain attribute
syntax, `mesh.center` — no parentheses, matching exactly how the
original script's `m1.center` reads.

### Mechanical Walkthrough

- **`from vector3d.vector import Vector3`** — the same import-a-class-
  from-another-file-in-this-project syntax Lesson 5 used to pull
  `Vector3` into `triangle.py`; here it's `mesh.py`'s turn to need it,
  for the same reason — this method needs to *build* a `Vector3`, not
  just read one already handed to it.
- **`@property`** — the decorator syntax itself: an `@` followed by a
  name, placed on its own line directly above the `def` it modifies.
  This is the first decorator anywhere in this project. Mechanically,
  it tells Python: when code reads `some_mesh.center`, don't just look
  up a stored attribute — call this method (with no arguments beyond
  `self`) right now, and use whatever it returns as the value.
- **`def center(self):`** — `def`, `center` (an ordinary method name —
  the `@property` decorator changes *how* it's accessed, not its status
  as a name Python recognizes specially the way `__init__`/`__add__`
  are), `self` only.
- **`xmin, xmax, ymin, ymax, zmin, zmax = self.bounds()`** — calling
  `self.bounds()` (this lesson, defined just above — an ordinary method,
  called with its parentheses, unlike `center` itself) and unpacking its
  6-element tuple return value into six separate local variables in one
  line — the same unpacking pattern `diff3d.py`'s own
  `xmin, xmax, ymin, ymax, zmin, zmax = mesh.bounds` line uses, just
  now unpacking a tuple our own `bounds()` method returned instead of
  one `pyvista` provided.
- **`return Vector3((xmin + xmax) / 2, (ymin + ymax) / 2, (zmin + zmax) / 2)`**
  — `return`, handing back a new `Vector3`, built via `Vector3.__init__`
  (Lesson 1); `(xmin + xmax) / 2` (and identically for the other two
  axes) — ordinary numeric `+` and `/` (not `Vector3`'s own operators —
  `xmin`/`xmax` here are plain numbers pulled out of the tuple, not
  `Vector3` objects), computing the midpoint between the minimum and
  maximum along one axis, the same averaging idea as Lesson 5's
  `Triangle.centroid()`, just applied to two numbers instead of summing
  three `Vector3`s.

### CS Lens

This is a **computed property** — a value exposed through plain
attribute syntax but derived on demand rather than stored — an instance
of the more general idea of encapsulating *how* a value is obtained
behind a stable, simple interface, so callers never need to know or care
whether reading `mesh.center` triggers real computation or just returns
something already sitting in memory.

Also recognized in: C#'s `get` accessors on properties (a very direct
parallel — a block of code that runs every time the property is read);
Java's convention of `getX()` methods, which accomplish a similar goal
without language-level property syntax, requiring the parentheses
`@property` here specifically avoids; spreadsheet formulas (a cell
showing `=A1+B1` looks like a stored value but recalculates live
whenever `A1` or `B1` changes — the exact same "looks stored, isn't"
relationship `center` has to `self.triangles`); reactive UI frameworks
(a computed/derived value that automatically reflects changes to
whatever it depends on, without the framework needing to be told to
recalculate it manually).

### SE Lens

The principle here is **interface stability independent of
implementation** — code calling `mesh.center` doesn't need to know, or
ever be told, whether that value is stored directly or computed fresh
each time; the syntax at the call site is identical either way, and
could be changed later (say, to cache the result) without any caller
needing to change a single line.

The alternative not chosen: make `center` an ordinary method,
`center()`, requiring parentheses everywhere it's used — a real,
common, and perfectly valid choice; many languages don't offer a
property mechanism at all and use this exactly. The cost, specific to
this project: the original script's own `m1.center` (no parentheses)
would no longer be a faithful line-for-line match — anywhere this
rebuild's later lessons port that exact line, `center()` would silently
introduce a syntax mismatch against the reference source `diff3d.py`
itself uses.

A real cost worth naming honestly on the choice actually made: every
single read of `mesh.center` re-scans the *entire* mesh via
`self.bounds()` — for a mesh with many thousands of triangles, reading
`.center` several times in a row (something later lessons might do
without realizing it recomputes from scratch each time) repeats that
full scan every time, with no caching at all. This is the same category
of debt Lesson 4 flagged for `normalize()`'s missing zero-length guard:
not a problem for anything built so far, but worth remembering rather
than assuming `.center` is free to read repeatedly.

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
m = Mesh([t1, t2])
print(m.center)
"
```

Real output:

```
Vector3(1.5, 1.5, 1.5)
```

The same two triangles from every `Run It` in this lesson span `0.0` to
`3.0` on every axis (confirmed by `bounds()` above); the midpoint of
`0.0` and `3.0` is `1.5`, matching all three components here — and
notice the call itself, `m.center`, carries no parentheses at all.

### Connect

Phase A is complete. `Vector3` is a full geometry toolkit; `Triangle`
composes three of them with its own center and facing direction; `Mesh`
composes any number of `Triangle`s with its own bounding box and center.
Every structural piece Phase B (reading real STL files) needs to exist
already does — the next lesson starts building *from* real files instead
of hand-typed `Vector3`/`Triangle`/`Mesh` calls.

---

## Connect the Pieces

One mesh, traced through everything this lesson added: build
`m = Mesh([t1, t2])` — two already-built `Triangle` instances (Lesson
5), stored as a list under `self.triangles` by `Mesh.__init__` (this
lesson's first Concept Unit) — this lesson's collection-composition, in
contrast to `Triangle`'s fixed three names. `m.bounds()` (second Concept
Unit) loops over that list, and for each `Triangle`, loops again over
its three named `Vector3` vertices (Lesson 5) — nested attribute access
reaching two full layers deep, from `Mesh` through `Triangle` down to
`Vector3` — collecting every coordinate into three lists and reducing
each with `min()`/`max()`, producing
`(0.0, 3.0, 0.0, 3.0, 0.0, 3.0)`. Finally, `m.center` (third Concept
Unit) — read with no parentheses, thanks to `@property` — calls that
same `bounds()` method internally, unpacks its six numbers, and
averages them pairwise into a brand-new `Vector3(1.5, 1.5, 1.5)` via
`Vector3.__init__` (Lesson 1) — one value, computed fresh, that took a
list of composed objects, two levels of nested attribute access, and
three lessons' worth of `Vector3`/`Triangle` machinery to produce.

---

## Try It Yourself

Type `Mesh` into `src/vector3d/mesh.py` yourself (not copy-pasted), and
confirm all three `Run It` outputs above with your own triangles. Then,
once that works, try calling `center` with parentheses instead of
reading it as a plain attribute, and look closely at the real error —
it's the concrete proof that `@property` really did change how `center`
has to be accessed:

```python
print(m.center())
```
