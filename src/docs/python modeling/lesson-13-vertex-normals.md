# Lesson 13: Vertex Normals — `VertexNormals`

**What you will build:** `Vector3.__hash__` (fixing a real, silent gap
Lesson 3 opened without either of us noticing at the time), and a new
class, `VertexNormals`, in a new file `src/vector3d/vertex_normals.py`
— Phase D's last lesson, averaging every triangle's face normal
(Lesson 5) into a single smoothed normal per shared vertex position,
replacing whatever `pyvista`'s `compute_normals(inplace=True,
auto_orient_normals=False)` computes internally in `diff3d.py`'s
`run_diff()`. Getting there exposes a real structural fact about this
project that's been true since Lesson 6 and never mattered until now:
`Mesh` has no concept of "shared" vertices at all — two triangles that
meet at a corner in the real geometry currently hold two entirely
separate `Vector3` objects, `__eq__`-equal but never `is`-identical,
for that same corner.

**What you need to know first:** Phase A in full (`Vector3`, `Triangle`
— especially `normal()`, Lesson 5 — and `Mesh`). Lesson 3's `__eq__`
and Lesson 11's `dict`-of-lists bucketing pattern both matter directly
here.

**Terms used in this lesson:**
- **hash** — a number Python computes from a value, used internally by
  `dict` and `set` to decide where to store and how to quickly find
  that value again. It exists so lookups (`some_dict[key]`) can be
  near-instant, checking one specific storage location determined by
  the hash, rather than comparing against every existing key one by
  one.
- **the hash/equality contract** — a rule Python requires, but doesn't
  enforce automatically once a class writes its own `__eq__`: two
  objects that compare equal (`==`) must also hash equal. Python's
  built-in default, before any custom `__eq__` exists, satisfies this
  automatically (identity-based equality and identity-based hashing
  agree by construction). The moment a class defines its own `__eq__`
  without also defining a matching `__hash__`, Python — unable to
  guarantee the contract still holds — silently sets that class's
  `__hash__` to `None`, making every instance of it **unhashable**
  (Lesson 11's own term) rather than risk a broken hash table.
- **`hash()`** — Python's built-in function computing the hash of any
  hashable value; applied to a tuple, it combines the hashes of every
  element inside it into one number — the direct tool this lesson uses
  to build `Vector3`'s own `__hash__` from its three components.
- **shared vertex** — a position in space where two or more triangles
  in a real mesh meet, geometrically one single point. This lesson's
  own header already states the real gap this project has been carrying
  since Lesson 6: nothing in `Triangle`/`Mesh` currently represents
  "this is the same corner as that other triangle's corner" — each
  `Triangle` simply stores its own three independent `Vector3`
  instances, and two triangles sharing a real-world corner just happen
  to hold two separately-constructed `Vector3`s with equal coordinates.

**Objects and methods used:**

- **`Vector3.__hash__`**
  - *What it is:* the dunder method Python calls to compute a
    `Vector3`'s hash — required for a `Vector3` to be usable as a
    `dict` key or `set` member.
  - *Implementation:* `def __hash__(self): return hash((self.x, self.y, self.z))`
    — takes only `self`, returns a plain integer.
  - *Its use:* `VertexNormals` (built later in this lesson) needs to
    group triangles by shared vertex *position* — the natural tool for
    that is a `dict` keyed by `Vector3`, which is impossible without
    this method, per the hash/equality contract this lesson's own Terms
    section names.
  - *Type:* an instance method, dunder, called implicitly whenever a
    `Vector3` is used as a `dict` key or put in a `set`.
  - *Responsibility:* to compute a hash consistent with `Vector3.__eq__`
    (Lesson 3) — two `Vector3`s that compare equal must produce the
    identical hash, or `dict`/`set` lookups by equal-but-not-identical
    `Vector3`s would silently fail to find each other.
  - *Depends on:* `self.x`/`self.y`/`self.z` and Python's own built-in
    `hash()` function.
  - *Connects to:* called implicitly by `dict`/`set` operations
    throughout `VertexNormals`, built later in this lesson.
  - *Shape:* `Vector3`'s own layer — completing the pairing Python
    itself requires: `__eq__` (Lesson 3) and `__hash__` (this lesson)
    now agree, restoring a capability that was silently lost the moment
    `__eq__` was added.

- **`VertexNormals`**
  - *What it is:* a class computing one smoothed normal per unique
    vertex position across an entire mesh, by averaging the face
    normals of every triangle touching that position.
  - *Implementation:* `class VertexNormals:` with `__init__(self, mesh)`
    calling a private `_compute` method, built across this lesson's
    final two Concept Units, plus a `normal_at(vertex)` accessor.
  - *Its use:* the from-scratch equivalent of what
    `compute_normals(inplace=True, auto_orient_normals=False)` computes
    internally, per-vertex, in `diff3d.py`'s `run_diff()`.
  - *Type:* a plain class, composed of a `Mesh` (Lesson 6), producing a
    `dict` keyed by `Vector3` (made possible only by this lesson's own
    `__hash__` addition).
  - *Responsibility:* to correctly identify every distinct vertex
    position across the whole mesh (not per-triangle — genuinely
    *shared* positions, this lesson's own term), collect every
    touching triangle's face normal for each one, and average them into
    a single unit-length result per position.
  - *Depends on:* `Mesh.triangles` (Lesson 6), `Triangle.normal`
    (Lesson 5), and `Vector3.__hash__`/`__eq__` (this lesson and Lesson
    3).
  - *Connects to:* nothing calls `VertexNormals` yet within this
    project beyond this lesson's own verification; Lesson 16 (signed
    distance) will use per-vertex normals directly, the same role
    `compute_normals`'s output plays in the original script's
    `compute_implicit_distance` step.
  - *Shape:* a new class sitting alongside `Mesh`, reading it but never
    modifying it — structurally similar to `NearestSurfaceFinder`
    (Lesson 9) in that sense, though answering a completely different
    kind of question.

---

## Concept Unit: Why Can't `Vector3` Be a Dict Key?

### The Problem

Grouping triangles by shared vertex position calls for exactly the
`dict`-of-lists pattern Lesson 11 already used for spatial bucketing —
except this time, the natural key is a `Vector3` itself (a vertex
position), not an integer tuple. Nothing has tried that yet in this
project.

> **Before reading on, try this yourself:** Lesson 3 gave `Vector3` its
> own `__eq__`, so two different `Vector3` instances with the same
> coordinates already compare equal with `==`. Given that a `dict`
> needs to find a key again later even if the exact same object isn't
> passed back in — only one that's `==` to it — what do you predict
> happens if you actually try `{some_vector3_instance: "value"}` right
> now, before this lesson changes anything?

### Introduce the Concept in Isolation

```python
# Throwaway lab: why does defining __eq__ break using an object as a dict key?
class Pair:
    def __init__(self, a, b):
        self.a = a
        self.b = b
    def __eq__(self, other):
        return self.a == other.a and self.b == other.b

p = Pair(1, 2)
try:
    d = {p: "value"}
except TypeError as e:
    print("TypeError:", e)
print(Pair.__hash__)

class HashablePair:
    def __init__(self, a, b):
        self.a = a
        self.b = b
    def __eq__(self, other):
        return self.a == other.a and self.b == other.b
    def __hash__(self):
        return hash((self.a, self.b))

hp1 = HashablePair(1, 2)
hp2 = HashablePair(1, 2)
d2 = {hp1: "value"}
print(hp1 == hp2, hp1 is hp2)
print(d2[hp2])
```

Real output:

```
TypeError: unhashable type: 'Pair'
None
True False
value
```

`Pair` — with an `__eq__` but no `__hash__` — really does raise a real
`TypeError` the instant it's used as a dict key, confirming the
Socratic prompt's prediction. `Pair.__hash__` itself prints `None` —
proof this isn't a coincidental crash but Python's own deliberate
choice, stated in this lesson's own Terms section: defining `__eq__`
alone silently sets `__hash__` to `None`. `HashablePair` adds a real
`__hash__`, built from the same two fields `__eq__` already compares,
and the payoff is immediate: `hp1 == hp2` is `True` while `hp1 is hp2`
is `False` (Lesson 3's own identity-vs-equality distinction), yet
`d2[hp2]` — looking up a *different* object than the one actually
stored — still correctly finds `"value"`, because `hp1` and `hp2` hash
identically as well as compare equal.

### Discard the Throwaway Example

This `Pair`/`HashablePair` pair is discarded now. `Vector3` gets the
real `__hash__` next.

### Project Change

- **Reference Source:** no line in `diff3d.py` — `numpy` arrays are
  themselves unhashable in `numpy` too (for a related reason: they're
  mutable), so the original script never faces this problem in quite
  this form; `pyvista`'s own internal vertex-deduplication (needed for
  the same reason this lesson needs it) happens inside the library,
  never shown in the script. This is a from-scratch fix, surfaced by
  this project's own design (a real `__eq__` on `Vector3`, added back
  in Lesson 3) rather than ported from anything.
- **Files affected:** modify `src/vector3d/vector.py`.
- **Change type:** add.
- **Location:** inside `class Vector3:`, directly after `__eq__`
  (Lesson 3).
- **Dependencies:** none beyond `self.x`/`self.y`/`self.z` and Python's
  built-in `hash()`.

### The New Code

```python
    def __hash__(self):
        return hash((self.x, self.y, self.z))
```

### The Updated Project

`src/vector3d/vector.py` so far (through this addition), new lines
marked:

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
22      def __hash__(self):                                              # ← new
23          return hash((self.x, self.y, self.z))                        # ← new
24
25      def dot(self, other):
26          return self.x * other.x + self.y * other.y + self.z * other.z
27
28      def length(self):
29          return math.sqrt(self.dot(self))
30
31      def normalize(self):
32          n = self.length()
33          return Vector3(self.x / n, self.y / n, self.z / n)
34
35      def cross(self, other):
36          return Vector3(
37              self.y * other.z - self.z * other.y,
38              self.z * other.x - self.x * other.z,
39              self.x * other.y - self.y * other.x,
40          )
41
42      def __truediv__(self, n):
43          return Vector3(self.x / n, self.y / n, self.z / n)
44
45      def __mul__(self, n):
46          return Vector3(self.x * n, self.y * n, self.z * n)
```

As a whole, `Vector3` is once again usable as a `dict` key or `set`
member — a capability it silently lost the moment Lesson 3 added
`__eq__`, and one nothing in this project happened to need until this
lesson.

### Mechanical Walkthrough

- **`def __hash__(self):`** — `def`; `__hash__`, the specific dunder
  name Python's `dict`/`set` machinery calls internally, whenever it
  needs to know where a value belongs or look it back up; `self` only.
- **`return hash((self.x, self.y, self.z))`** — `return`, handing back
  a plain integer; `(self.x, self.y, self.z)` — an ordinary tuple
  (already familiar) built from the exact same three fields
  `Vector3.__eq__` (Lesson 3) already compares — this is what satisfies
  the hash/equality contract: two `Vector3`s with equal `.x`/`.y`/`.z`
  build an identical tuple here, and tuples with identical contents
  always hash identically; `hash(...)` — Python's own built-in
  function, called here on that tuple rather than on `self` directly,
  delegating the actual hash computation to Python's already-correct,
  built-in tuple-hashing logic rather than inventing a new one.

### CS Lens

This is the **hash/equality contract** itself, named directly in this
lesson's own Terms — a foundational rule underlying every hash-based
data structure (`dict`, `set`, and their equivalents in essentially
every language with them).

Also recognized in: Java's own `hashCode()`/`equals()` pairing, which
enforces the identical rule explicitly in its documentation (overriding
one without the other is a well-known, common bug in Java code for
exactly the reason this lesson just demonstrated in Python); C#'s
`GetHashCode()`/`Equals()`; database primary-key indexing (two rows
considered "the same" by their key must hash to the same index bucket,
or lookups silently fail to find rows that logically exist); caching
systems broadly (a cache key that violates this contract causes silent,
hard-to-diagnose cache misses — logically identical requests that never
find their own cached result).

### SE Lens

The principle is **Python protecting you from a worse failure by
refusing outright**, rather than silently producing wrong answers.
Python *could* have left `Pair`'s (or `Vector3`'s) inherited default
`__hash__` in place after `__eq__` was overridden — identity-based
hashing, ignoring the new `__eq__` entirely — which would have let
`{p: "value"}` "work" without an error, but would have silently broken
the hash/equality contract: two equal `Pair`s could then hash
differently, and a `dict` lookup for a logically-equal-but-not-identical
key would silently, wrongly, fail to find it — exactly the wrong-answer
failure mode this lesson's own CS Lens named for other languages' bugs.
Setting `__hash__` to `None` instead trades a silent, hard-to-diagnose
future bug for a loud, immediate, easy-to-fix one.

The alternative not chosen: `Vector3` could remain unhashable
permanently, and `VertexNormals` (built next in this lesson) could use
a different grouping key instead — say, a plain tuple,
`(vertex.x, vertex.y, vertex.z)`, built explicitly at every call site
that needs one, rather than fixing `Vector3` itself. That would work,
technically, without touching `vector.py` at all — tuples are already
hashable. The real cost: every place in this project that ever needs to
group or deduplicate `Vector3`s (not just this lesson) would need to
remember to build that tuple by hand, rather than simply using the
`Vector3` itself as a key — a real, recurring inconvenience this
lesson's actual fix removes at the source, for every future lesson at
once.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3

v1 = Vector3(1.0, 2.0, 3.0)
v2 = Vector3(1.0, 2.0, 3.0)
d = {v1: 'first'}
print(v1 == v2, v1 is v2)
print(d[v2])
"
```

Real output:

```
True False
first
```

The exact scenario this whole Concept Unit exists for: a `Vector3` built
independently, `v2`, with different identity from `v1` but equal
coordinates, correctly finds `v1`'s dict entry.

### Connect

`Vector3` can now be used as a dict key. The next Concept Unit puts that
directly to use, grouping every triangle in a mesh by which of its three
vertex positions it touches.

---

## Concept Unit: Grouping Triangles by Shared Vertex

### The Problem

Computing a smoothed vertex normal means, for every distinct vertex
position in the mesh, collecting the face normal of *every* triangle
that has a vertex there — not just one triangle's own three vertices in
isolation. `Mesh.triangles` (Lesson 6) is a flat list with no such
grouping at all; two triangles sharing a real-world corner currently
have no structural link to each other whatsoever, only two separately-
built `Vector3`s that happen to be `__eq__`-equal.

> **Before reading on, try this yourself:** this is structurally the
> same problem Lesson 11's `SpatialGrid.__init__` already solved —
> scanning every triangle once, computing a key from it, and filing it
> into a growing `dict`-of-lists under that key. There, the key was a
> computed cell coordinate; here, the key is a vertex position itself
> (now hashable, thanks to the previous Concept Unit). Given a
> `triangle` with three vertices, `v0`/`v1`/`v2`, and its own
> `triangle.normal()` (Lesson 5), what would the loop body need to do,
> for *each* of those three vertices, to file that one face normal under
> all three of its corners at once?

### Introduce the Concept in Isolation

```python
# Throwaway lab: grouping items by a key computed from each one, dict-of-lists again
class Item:
    def __init__(self, category, name):
        self.category = category
        self.name = name

items = [Item("fruit", "apple"), Item("veg", "carrot"), Item("fruit", "banana")]

groups = {}
for item in items:
    key = item.category
    if key not in groups:
        groups[key] = []
    groups[key].append(item.name)

print(groups)
```

Real output:

```
{'fruit': ['apple', 'banana'], 'veg': ['carrot']}
```

The identical dict-of-lists shape from Lesson 11, confirmed working
again here: every item's `category` becomes a key, and every item
sharing that category lands in the same growing list — `"apple"` and
`"banana"` both end up under `"fruit"`. The real project version
(built next) does the same thing once *per vertex per triangle* — three
insertions per triangle, one for each corner, all pointing at that same
triangle's one face normal.

### Discard the Throwaway Example

This `Item`/lab pair is discarded now. `VertexNormals` gets the real
grouping logic next.

### Project Change

- **Reference Source:** no single line in `diff3d.py` — `pyvista`'s
  `compute_normals` performs this same shared-vertex grouping
  internally, using its own mesh's already-deduplicated vertex/face
  index structure (`mesh.points`/`mesh.faces`), which this project's own
  `Mesh` (Lesson 6) deliberately doesn't have — each `Triangle` owns its
  three vertices independently, per Lesson 5's own composition design.
  This Concept Unit's grouping step exists specifically to work around
  that structural difference.
- **Files affected:** create `src/vector3d/vertex_normals.py` (new
  file).
- **Change type:** add.
- **Location:** N/A — brand-new file.
- **Dependencies:** `Mesh.triangles` (Lesson 6), `Triangle.normal`
  (Lesson 5), and `Vector3.__hash__`/`__eq__` (earlier in this lesson
  and Lesson 3).

### The New Code

Type this into `src/vector3d/vertex_normals.py`:

```python
from vector3d.vector import Vector3


class VertexNormals:
    def __init__(self, mesh):
        self.mesh = mesh
        self.normals = self._compute()

    def _compute(self):
        groups = {}
        for triangle in self.mesh.triangles:
            face_normal = triangle.normal()
            for vertex in (triangle.v0, triangle.v1, triangle.v2):
                if vertex not in groups:
                    groups[vertex] = []
                groups[vertex].append(face_normal)
        return groups
```

(This Concept Unit's version of `_compute` returns the raw groups
directly, only to make what's actually been built so far checkable in
isolation — the next Concept Unit changes this final `return` line to
average each group instead of returning it raw.)

### The Updated Project

This is the whole new file so far — nothing larger to return to yet
(the same brand-new-file exemption used throughout this curriculum):

```
 1  from vector3d.vector import Vector3
 2
 3
 4  class VertexNormals:
 5      def __init__(self, mesh):
 6          self.mesh = mesh
 7          self.normals = self._compute()
 8
 9      def _compute(self):
10          groups = {}
11          for triangle in self.mesh.triangles:
12              face_normal = triangle.normal()
13              for vertex in (triangle.v0, triangle.v1, triangle.v2):
14                  if vertex not in groups:
15                      groups[vertex] = []
16                  groups[vertex].append(face_normal)
17          return groups
```

As a whole, this file now defines a buildable `VertexNormals(mesh)`
that, for every triangle, files its one face normal under all three of
its vertex positions — so any vertex touched by multiple triangles ends
up with multiple face normals collected under its own position, ready
to be averaged.

### Mechanical Walkthrough

- **`from vector3d.vector import Vector3`** — the same import form used
  since Lesson 5, here needed for the next Concept Unit's averaging step
  even though this particular version of `_compute` doesn't build a new
  `Vector3` yet.
- **`class VertexNormals:`**, **`def __init__(self, mesh):`**,
  **`self.mesh = mesh`** — the same `class`/`__init__`/attribute-
  assignment pattern used throughout this project.
- **`self.normals = self._compute()`** — calling this class's own
  `_compute` method (a leading-underscore name, Lesson 11's own
  convention for an internal helper) immediately at construction time,
  and storing its result — the grouping (this Concept Unit) or,
  starting next Concept Unit, the final averaged normals.
- **`def _compute(self):`** — `def`; `_compute`, an internal helper
  method; `self` only.
- **`groups = {}`** — an empty `dict` (Lesson 11's own term), to be
  filled below.
- **`for triangle in self.mesh.triangles:`** — the same `for` loop shape
  used since Lesson 6.
- **`face_normal = triangle.normal()`** — calling `Triangle.normal()`
  (Lesson 5) once per triangle, stored so it doesn't need recomputing
  three separate times below.
- **`for vertex in (triangle.v0, triangle.v1, triangle.v2):`** — the
  identical three-vertex tuple iteration `Mesh.bounds()` (Lesson 6)
  already used, here binding `vertex` to each of the triangle's own
  three `Vector3` corners in turn.
- **`if vertex not in groups: groups[vertex] = []`** — the identical
  dict-of-lists pattern from Lesson 11, now keyed by `vertex` itself —
  only possible because of this lesson's own `__hash__` addition.
- **`groups[vertex].append(face_normal)`** — filing this triangle's one
  `face_normal` under the current vertex's key; run once per vertex per
  triangle, so a triangle contributes its single face normal to *three*
  different groups (its three corners) in total.
- **`return groups`** — `return`, handing back the raw grouping — a
  placeholder final step this Concept Unit deliberately leaves
  unfinished, corrected next.

### CS Lens

This is **adjacency construction from an unindexed structure** — turning
`Mesh`'s own flat, ungrouped list of independent triangles into an
explicit map of "which face normals touch this position," the same
underlying need any mesh-processing algorithm requiring per-vertex
(rather than per-face) information has to solve first.

Also recognized in: converting a flat list of graph edges into an
adjacency list (grouping edges by their starting node — structurally
identical to this lesson's own grouping, one dict-of-lists insertion per
edge endpoint instead of per triangle vertex); building a
word-to-documents index for search (grouping documents by which words
they contain); social network "who follows whom" structures, built from
a flat list of follow relationships the same way.

### SE Lens

The principle here is **recovering structure the data model doesn't
provide directly**, at query time, rather than changing `Triangle`/
`Mesh`'s own design to store it up front. This lesson's own header
already names the real, honest reason: `Mesh` was built (Lesson 6) as a
flat list of independently-composed `Triangle`s, each fully self-
contained with its own three `Vector3`s — a design that made every
lesson through Phase C simpler, at the cost of this lesson now needing
to reconstruct shared-vertex information after the fact, from
coordinates alone, rather than having it already available.

The alternative not chosen, worth naming honestly since it's a real
architectural fork this project could have taken much earlier: `Mesh`
could instead store a deduplicated list of vertices plus a list of
index triples into it (exactly `pyvista`'s own `mesh.points`/
`mesh.faces` design, referenced throughout this project's own Reference
Source fields since Lesson 6) — shared vertices would then be
*structurally* shared, single objects referenced by multiple triangles,
with no need for this lesson's coordinate-based regrouping at all. That
design would make this lesson trivial and *other* things (like Lesson
5's own simple `triangle.v0`/`.v1`/`.v2` direct access) more awkward.
This project chose the simpler-triangle, harder-vertex-sharing tradeoff
back in Lesson 6, and this lesson is where that choice's cost is
actually paid.

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
from vector3d.vertex_normals import VertexNormals

shared = Vector3(0.0, 0.0, 0.0)
a = Triangle(shared, Vector3(1.0, 0.0, 0.0), Vector3(0.0, 1.0, 0.0))
b = Triangle(shared, Vector3(0.0, 1.0, 0.0), Vector3(0.0, 0.0, 1.0))
mesh = Mesh([a, b])

vn = VertexNormals(mesh)
print(len(vn.normals))
print(vn.normals[shared])
"
```

Real output:

```
4
[Vector3(0.0, 0.0, 1.0), Vector3(1.0, 0.0, 0.0)]
```

Two triangles sharing two of their three corners (`shared` and
`(0,1,0)`) produce exactly `4` distinct grouped positions (`shared`,
`(1,0,0)`, `(0,1,0)`, `(0,0,1)`) — not `6`, which a naive count of
"3 vertices × 2 triangles" might suggest, since two of those six
vertex-mentions land on the same two already-grouped positions. The
`shared` position's own group correctly holds both triangles' face
normals — `(0,0,1)` and `(1,0,0)` — exactly the two directions Lesson
5's `normal()` computes for each, ready to be averaged.

### Connect

`VertexNormals` can now correctly identify every distinct vertex
position and collect every touching triangle's face normal there. The
final Concept Unit turns those collected lists into one smoothed normal
per position.

---

## Concept Unit: Averaging the Normals

### The Problem

`groups[shared]` — from the previous Concept Unit's own `Run It` —
holds a real list of two different face normals, `(0,0,1)` and
`(1,0,0)`, but a *list* of directions isn't what Lesson 16 (signed
distance) will eventually need: a single, smoothed direction per
vertex, representing how that corner's surface faces overall, blending
every adjacent triangle's own facing direction.

> **Before reading on, try this yourself:** Lesson 12's own Mesh.area()
> already built a running-sum pattern (`total = 0`, then `total +=
> ...` inside a loop). Given a list of `Vector3` face normals instead
> of plain numbers, and `Vector3.__add__` (Lesson 2) already defined,
> what would the equivalent running-sum look like for vectors instead
> of numbers — and what single additional method call, already built on
> `Vector3` since Lesson 4, would turn that raw sum into a proper unit-
> length averaged direction?

### Introduce the Concept in Isolation

```python
# Throwaway lab: averaging a list of directions into one smoothed direction
import math

class V:
    def __init__(self, x, y, z):
        self.x, self.y, self.z = x, y, z
    def __add__(self, other):
        return V(self.x + other.x, self.y + other.y, self.z + other.z)
    def dot(self, other):
        return self.x*other.x + self.y*other.y + self.z*other.z
    def length(self):
        return math.sqrt(self.dot(self))
    def normalize(self):
        n = self.length()
        return V(self.x/n, self.y/n, self.z/n)
    def __repr__(self):
        return f"V({self.x}, {self.y}, {self.z})"

normals = [V(0.0, 0.0, 1.0), V(1.0, 0.0, 0.0)]

total = V(0.0, 0.0, 0.0)
for n in normals:
    total = total + n
averaged = total.normalize()
print(averaged)
```

Real output:

```
V(0.7071067811865475, 0.0, 0.7071067811865475)
```

Summing `(0,0,1)` and `(1,0,0)` gives `(1,0,1)` — a real direction, but
not unit length (its own length is `√2`, not `1`); `.normalize()`
(Lesson 4's own method, reused here on a throwaway `V`) rescales it to
exactly length `1` while preserving its direction, giving
`(0.707, 0, 0.707)` — pointing exactly halfway between straight-`z` and
straight-`x`, precisely what "averaging two perpendicular directions"
should intuitively produce, confirmed here by real arithmetic rather
than only asserted.

### Discard the Throwaway Example

This `V`/lab pair is discarded now. `VertexNormals` gets the real
averaging step next, replacing the raw `return groups` from the
previous Concept Unit.

### Project Change

- **Reference Source:** `diff3d.py`'s `run_diff()`:
  `m1.compute_normals(inplace=True, auto_orient_normals=False)` (and
  identically for `m2`) — `pyvista`'s own per-vertex normal averaging,
  never exposed in the script itself; this method is its from-scratch,
  visible equivalent.
- **Files affected:** modify `src/vector3d/vertex_normals.py`.
- **Change type:** replace (the previous Concept Unit's placeholder
  `return groups` becomes real averaging logic) plus add (a new
  `normal_at` method).
- **Location:** inside `_compute`, replacing its final `return groups`
  line; `normal_at` goes directly after `_compute`.
- **Dependencies:** `Vector3.__add__` (Lesson 2), `Vector3.normalize`
  (Lesson 4), and `Vector3.__init__` (Lesson 1) to build the zero-vector
  starting point.

### The New Code

Replace `_compute`'s final line, `return groups`, with:

```python
        averaged = {}
        for vertex, face_normals in groups.items():
            total = Vector3(0.0, 0.0, 0.0)
            for face_normal in face_normals:
                total = total + face_normal
            averaged[vertex] = total.normalize()
        return averaged
```

Then add this method directly after `_compute`:

```python
    def normal_at(self, vertex):
        return self.normals[vertex]
```

### The Updated Project

`src/vector3d/vertex_normals.py` in full, new lines marked:

```
 1  from vector3d.vector import Vector3
 2
 3
 4  class VertexNormals:
 5      def __init__(self, mesh):
 6          self.mesh = mesh
 7          self.normals = self._compute()
 8
 9      def _compute(self):
10          groups = {}
11          for triangle in self.mesh.triangles:
12              face_normal = triangle.normal()
13              for vertex in (triangle.v0, triangle.v1, triangle.v2):
14                  if vertex not in groups:
15                      groups[vertex] = []
16                  groups[vertex].append(face_normal)
17
18          averaged = {}                                                # ← new
19          for vertex, face_normals in groups.items():                 # ← new
20              total = Vector3(0.0, 0.0, 0.0)                          # ← new
21              for face_normal in face_normals:                        # ← new
22                  total = total + face_normal                         # ← new
23              averaged[vertex] = total.normalize()                    # ← new
24          return averaged                                             # ← new
25
26      def normal_at(self, vertex):                                    # ← new
27          return self.normals[vertex]                                 # ← new
```

As a whole, `VertexNormals` is now complete: constructing one scans the
whole mesh once, groups every triangle's face normal by shared vertex
position, and averages each group into a single smoothed, unit-length
normal — queryable by position through `normal_at`.

### Mechanical Walkthrough

- **`averaged = {}`** — a second, separate empty `dict` (distinct from
  `groups`, built in the previous Concept Unit), to hold the final,
  averaged result.
- **`for vertex, face_normals in groups.items():`** — `.items()`
  (already-familiar `dict` method), giving both the key (`vertex`) and
  value (`face_normals`, a list) on each pass — a slightly different
  shape from `SpatialGrid.find_closest`'s own `self.buckets[neighbor]`
  single-key lookups in Lesson 11, since this loop needs to visit
  *every* group, not just a few specific ones.
- **`total = Vector3(0.0, 0.0, 0.0)`** — `Vector3.__init__` (Lesson 1),
  building a fresh zero vector as the running sum's starting point —
  the vector equivalent of `Mesh.area()`'s own `total = 0` (Lesson 12),
  chosen as `(0,0,0)` specifically because adding it to anything leaves
  that thing unchanged, the same role plain `0` plays for numeric
  summation.
- **`for face_normal in face_normals:`** — an ordinary `for` loop over
  the current vertex's own list of face normals (Lesson 6's own loop
  shape).
- **`total = total + face_normal`** — `Vector3.__add__` (Lesson 2),
  accumulating a running sum of every face normal touching this vertex
  — directly answering this Concept Unit's own Socratic prompt.
- **`averaged[vertex] = total.normalize()`** — `Vector3.normalize`
  (Lesson 4), rescaling the accumulated sum to exactly unit length; the
  result is stored under the same `vertex` key in the new `averaged`
  dict.
- **`return averaged`** — `return`, handing back the completed
  vertex-to-averaged-normal mapping — the real final result, replacing
  the previous Concept Unit's raw `return groups`.
- **`def normal_at(self, vertex):`** / **`return self.normals[vertex]`**
  — `def`; `normal_at`, an ordinary instance method name; ordinary
  `dict` indexing (already familiar) on `self.normals` (set once, at
  construction, by `__init__`) — a small, named accessor, so later
  lessons never need to reach into `self.normals` directly by its
  internal name.

### CS Lens

This is **normal averaging** (sometimes called **normal smoothing**), a
specific application of the same **arithmetic mean** idea Lesson 5's own
`Triangle.centroid()` CS Lens already named, here applied to directions
rather than positions, and requiring a final `normalize()` step numeric
averaging never needed, since a mean of several unit vectors is not
itself unit length in general.

Also recognized in: every real-time 3D renderer's own "smooth shading"
(as opposed to "flat shading," which just uses each triangle's own face
normal directly, with no averaging at all — the two rendering styles
correspond exactly to the two computations this project now has,
`Triangle.normal()` versus this lesson's `VertexNormals`); subdivision
surface algorithms, which repeatedly average neighboring geometry to
produce smoother shapes; photogrammetry and 3D scanning pipelines, where
per-vertex normal estimation from noisy scanned point data is a
foundational, and often much harder, version of this exact averaging
idea.

### SE Lens

The principle is the same **arithmetic mean composed from already-built
primitives** (`__add__`, `normalize`) this project has used repeatedly
since Lesson 5 — the only genuinely new piece this Concept Unit adds is
recognizing that averaging *directions* needs one more step (the final
`normalize()`) that averaging plain numbers or positions never required.

The alternative not chosen, worth naming honestly: this method weights
every touching triangle's face normal equally, regardless of that
triangle's own size or the angle it meets its neighbors at. A larger
triangle arguably ought to "pull" a shared vertex's smoothed normal
more than a tiny sliver triangle meeting at the same corner — an
**area-weighted** average, using `Triangle.area()` (Lesson 12) as a
weight, is a well-known refinement real 3D software commonly applies,
and was mentioned directly as a real possibility back in Lesson 12's
own CS Lens. This lesson's simpler, unweighted average is a deliberate,
named scope limit — correct and reasonable for a mesh of roughly
similarly-sized triangles (again, a fair assumption for this project's
own `stock*.stl` targets), and a real, honest simplification for one
containing very differently-sized adjacent triangles.

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
from vector3d.vertex_normals import VertexNormals

shared = Vector3(0.0, 0.0, 0.0)
a = Triangle(shared, Vector3(1.0, 0.0, 0.0), Vector3(0.0, 1.0, 0.0))
b = Triangle(shared, Vector3(0.0, 1.0, 0.0), Vector3(0.0, 0.0, 1.0))
mesh = Mesh([a, b])

print(a.normal())
print(b.normal())

vn = VertexNormals(mesh)
print(vn.normal_at(shared))
print(vn.normal_at(Vector3(0.0, 0.0, 0.0)))
print(len(vn.normals))
"
```

Real output:

```
Vector3(0.0, 0.0, 1.0)
Vector3(1.0, 0.0, 0.0)
Vector3(0.7071067811865475, 0.0, 0.7071067811865475)
Vector3(0.7071067811865475, 0.0, 0.7071067811865475)
4
```

`a.normal()` and `b.normal()` — two perpendicular face normals, exactly
as constructed. `vn.normal_at(shared)` correctly averages them into
`(0.707, 0, 0.707)` — the identical result this Concept Unit's own
throwaway lab already computed. Calling `normal_at` a *second* time with
a freshly-built `Vector3(0.0, 0.0, 0.0)` — not the same `shared` object
at all — still finds the identical answer: real, end-to-end proof that
this lesson's `__hash__` fix is what makes vertex-position-based lookup
actually work.

### Connect

Phase D is complete. `SurfaceSampler` (Lesson 12) can generate realistic
sample points across any mesh; `VertexNormals` (this lesson) can
compute a smoothed facing direction for every distinct vertex position.
Both replace pieces of `pyvista`'s own internal machinery that
`diff3d.py` never has to think about directly — this rebuild now makes
both of them real, inspectable code.

---

## Connect the Pieces

One shared vertex, traced through every method this lesson built:
`Vector3(0.0, 0.0, 0.0)`, stored as `shared` and passed into two
different `Triangle`s, `a` and `b`. `VertexNormals(mesh)` (second and
third Concept Units) loops over both triangles, calling
`Triangle.normal()` (Lesson 5) once each — `(0,0,1)` for `a`, `(1,0,0)`
for `b` — and files both under the key `shared` in a `dict` (only
possible because of this lesson's own first Concept Unit,
`Vector3.__hash__`, without which `shared not in groups` would raise
the identical `TypeError` this lesson opened with). The averaging step
sums both face normals via `Vector3.__add__` (Lesson 2) into `(1,0,1)`,
then calls `.normalize()` (Lesson 4) to produce the final
`(0.707, 0, 0.707)`. Calling `vn.normal_at(...)` with a brand-new
`Vector3(0.0, 0.0, 0.0)` — a different object, `__eq__`-equal to
`shared` but never `is shared` — still finds that exact same averaged
result, because `__hash__` (this lesson) and `__eq__` (Lesson 3) now
agree, exactly as the hash/equality contract this lesson opened with
requires.

---

## Try It Yourself

Type `__hash__` into your own `vector.py`, and `VertexNormals` into a
new `vertex_normals.py` (not copy-pasted). Confirm both `Run It` outputs
above. Then, once that works, add a *third* triangle sharing the same
`shared` vertex, and see for yourself how much it shifts the averaged
normal there — and notice, from the real printed `c.normal()`, that its
direction isn't necessarily the one you'd guess just from how its
vertices are written out, which is exactly Lesson 5's own winding-order
dependency showing up again here:

```python
c = Triangle(shared, Vector3(0.0, 0.0, 1.0), Vector3(0.0, -1.0, 0.0))
mesh2 = Mesh([a, b, c])
vn2 = VertexNormals(mesh2)
print(c.normal())
print(vn2.normal_at(shared))
```
