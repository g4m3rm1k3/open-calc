# Lesson 4: Vector Methods

**What you will build:** four instance methods on `Vector3` —
`dot()`, `length()`, `normalize()`, and `cross()` — the actual vector
*math* the original `diff3d.py` gets from `numpy`'s `np.dot`,
`np.linalg.norm`, and `np.cross`. Lessons 1–3 gave `Vector3` a shape and
an identity (build it, combine it, print it, compare it); this lesson
gives it the geometry every later phase of this rebuild — sampling,
normals, alignment, distance — actually depends on.

**What you need to know first:** Lesson 1 (`class`, `__init__`, `self`,
instance attributes), Lesson 2 (dunder methods, operator overloading —
`__add__`/`__sub__`), and Lesson 3 (`__repr__`, `__eq__`, identity vs.
equality). `Vector3` is currently a complete small value type with no
math beyond addition and subtraction.

**Terms used in this lesson:**
- **ordinary instance method** — a method defined the same way
  `__init__`, `__add__`, `__sub__`, `__repr__`, and `__eq__` all were
  (`def`, `self` as the first parameter), but *not* a dunder method —
  it has a plain name (`dot`, not `__dot__`) and is called explicitly
  at the call site (`a.dot(b)`), never triggered implicitly by an
  operator or a language action. It exists because not every method a
  class needs corresponds to existing Python syntax — there's no `@`
  symbol or keyword `dot` already dispatches to, so `dot()` has to be
  called by name like any function you'd write outside a class.
- **dot product** — a single number produced by multiplying two
  vectors' matching components together and adding the results
  (`x1*x2 + y1*y2 + z1*z2`). It exists as the algebraic foundation two
  other things this lesson builds directly on top of: a vector dotted
  with *itself* gives the square of its own length, and the *sign* of a
  dot product tells you whether two vectors point in a broadly similar
  direction (positive), an opposite one (negative), or are exactly
  perpendicular (zero).
- **magnitude / length** — how long a vector is, as a single
  non-negative number, independent of direction — computed as the
  square root of the vector dotted with itself. It exists because "how
  far apart are these two points" and "how big is this offset" are
  questions the alignment and distance math in `diff3d.py` asks
  constantly, and a raw `Vector3` on its own only tells you components,
  not size.
- **`math.sqrt`** — a function from Python's standard library `math`
  module, taking one non-negative number and returning its square root.
  It exists as the standard, correct way to compute a square root in
  Python — not something worth reimplementing by hand, unlike the
  geometry methods this lesson is building, which have no standard-library
  equivalent for a hand-rolled `Vector3`.
- **normalization / unit vector** — rescaling a vector so its length
  becomes exactly `1`, while keeping its direction unchanged — done by
  dividing every component by the vector's own length. It exists because
  many later calculations (Phase D's vertex normals, Phase F's signed
  distance) only care about *direction*, and a unit vector is direction
  with the "how far" information stripped out, so it can be reused
  consistently regardless of how long the original vector happened to be.
- **cross product** — an operation on two vectors that produces a third
  vector, perpendicular to both of the originals, computed by a specific
  fixed formula on their components (shown in this lesson's own New
  Code). It exists because "find a direction perpendicular to two given
  directions" is exactly what computing a surface normal from two edges
  of a triangle requires — the core operation Phase D's `Triangle.normal()`
  will be built on.

**Objects and methods used:**

- **`Vector3.dot`**
  - *What it is:* an instance method computing the dot product of `self`
    and another `Vector3`.
  - *Implementation:*
    `def dot(self, other): return self.x * other.x + self.y * other.y + self.z * other.z`
    — takes `self` and `other`, returns a plain number (not a `Vector3`).
  - *Its use:* `align3d()`'s inner `sqdists` function computes
    `np.sum(deltas**2, axis=1)` — for a single `deltas` vector, summing
    each component squared is exactly `deltas.dot(deltas)`; this method
    is what makes that computable on a `Vector3` directly.
  - *Type:* an ordinary instance method (not a dunder method — no
    operator triggers it; it's always called explicitly, `a.dot(b)`).
  - *Responsibility:* to reduce two `Vector3` instances down to the one
    number their dot product produces, with no side effects on either
    operand.
  - *Depends on:* both instances' `.x`/`.y`/`.z` (from `Vector3.__init__`,
    Lesson 1).
  - *Connects to:* called explicitly by whatever code needs it; internally
    calls nothing else. `Vector3.length`, added next in this same lesson,
    calls `self.dot(self)` directly — the first method in this project
    that one `Vector3` method calls on another.
  - *Shape:* still part of `Vector3`'s own lowest layer — this is the
    algebraic foundation the next two methods in this lesson are built on
    top of.

- **`Vector3.length`**
  - *What it is:* an instance method computing how long `self` is, as a
    single number.
  - *Implementation:* `def length(self): return math.sqrt(self.dot(self))`
    — takes only `self`, returns a plain number.
  - *Its use:* `align3d()` computes
    `size = np.sqrt((xmax-xmin)**2 + (ymax-ymin)**2 + (zmax-zmin)**2)` —
    the length of the bounding box's diagonal vector — and the
    commented-out diagnostic line
    `print(f"Alignment magnitude: {np.linalg.norm(delta):.6f}")` needs
    exactly this operation on the alignment `delta` itself.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to answer "how big is this vector," independent
    of direction, by delegating the actual squared-sum work to `dot()`.
  - *Depends on:* `Vector3.dot` (this lesson, defined just above) and
    Python's standard-library `math.sqrt`.
  - *Connects to:* calls `self.dot(self)` and `math.sqrt(...)`;
    `Vector3.normalize`, added next, calls `self.length()` in turn.
  - *Shape:* still `Vector3`'s own layer — the first method in this
    project built by composing an *earlier method from this same
    lesson* (`dot`) rather than raw attributes directly.

- **`Vector3.normalize`**
  - *What it is:* an instance method returning a new `Vector3` pointing
    the same direction as `self`, with length exactly `1`.
  - *Implementation:*
    `def normalize(self): n = self.length(); return Vector3(self.x / n, self.y / n, self.z / n)`
    — takes only `self`, returns a new `Vector3`.
  - *Its use:* Phase D's vertex-normal averaging and Phase F's signed
    distance both need pure directions, not directions-with-magnitude —
    `normalize()` is what strips the magnitude out while keeping the
    direction, on our own `Vector3` objects, the same role `pyvista`'s
    internal normal computation plays invisibly in the original script.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to produce a same-direction, length-`1` version of
    `self`, leaving `self` itself unmodified.
  - *Depends on:* `Vector3.length` (this lesson, defined just above) and
    `Vector3.__init__` (Lesson 1) to build its return value.
  - *Connects to:* calls `self.length()` internally, then
    `Vector3(...)` to construct its result. Nothing later in this
    lesson calls it, but Phase D will.
  - *Shape:* `Vector3`'s own layer — the second method in this lesson
    built on top of an earlier method from the *same* lesson (`length`,
    which itself was built on `dot`), rather than raw attributes.

- **`Vector3.cross`**
  - *What it is:* an instance method computing the cross product of
    `self` and another `Vector3`, returning a new `Vector3` perpendicular
    to both.
  - *Implementation:*
    ```
    def cross(self, other):
        return Vector3(
            self.y * other.z - self.z * other.y,
            self.z * other.x - self.x * other.z,
            self.x * other.y - self.y * other.x,
        )
    ```
    — takes `self` and `other`, returns a new `Vector3`.
  - *Its use:* Lesson 5's `Triangle` class needs a face normal — a
    direction perpendicular to the triangle's own surface — computed as
    the cross product of two of its edges. This method is what makes
    that computable directly on `Vector3` edge vectors, the same role
    `pyvista`'s `compute_normals()` plays invisibly in the original
    script.
  - *Type:* an ordinary instance method.
  - *Responsibility:* to produce a vector perpendicular to both `self`
    and `other`, via the fixed cross-product formula, with no side
    effects on either operand.
  - *Depends on:* both instances' `.x`/`.y`/`.z`, and `Vector3.__init__`
    to build its return value. Unlike `length`/`normalize`, this method
    does not build on `dot` — it's an independent operation defined
    directly from raw components.
  - *Connects to:* called explicitly wherever a perpendicular direction
    is needed; internally calls only `Vector3(...)` once, to build its
    result. Lesson 5's `Triangle.normal()` will call it directly.
  - *Shape:* `Vector3`'s own layer — the last of the four core vector
    operations Phase A's later classes (`Triangle`, `Mesh`) are built on
    top of.

---

## Concept Unit: Combining Two Vectors Into One Number

### The Problem

`align3d()`'s inner `sqdists` function computes
`deltas = closest - points` (a `Vector3` subtraction Lesson 2 already
gives us) and then `np.sum(deltas**2, axis=1)` — squaring every
component of every row and summing them, per point, to get a single
number per point: how far off that point is, squared. `Vector3` right
now has no way to turn itself into a single number at all — every method
built in Lessons 1–3 either returns a new `Vector3`, a string, or a
boolean.

> **Before reading on, try this yourself:** given two vectors' matching
> components — `x1, y1, z1` and `x2, y2, z2` — what's the simplest
> arithmetic combination of all six numbers that reduces them to just
> *one* number? (There's more than one mathematically valid answer;
> the one this lesson builds multiplies matching components together
> and adds the three products — try writing that formula out yourself
> before reading it below.) Separately: if you dot a vector with
> *itself* — every `x2` is just `x1` again, and so on — what do you
> think that produces, in terms of the vector's own components squared?

### Introduce the Concept in Isolation

```python
# Throwaway lab: combining two vectors into a single number
class Pair:
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def dot(self, other):
        return self.a * other.a + self.b * other.b

p1 = Pair(2, 3)
p2 = Pair(4, 5)
print(p1.dot(p2))

same_dir = Pair(1, 0)
perp = Pair(0, 1)
print(same_dir.dot(perp))
print(same_dir.dot(same_dir))
```

Real output from running this:

```
23
0
1
```

`p1.dot(p2)` gives `23` — `2*4 + 3*5`, exactly the multiply-then-add
formula from the Socratic prompt, run for real. `same_dir.dot(perp)`
gives `0` — two vectors pointing in genuinely perpendicular directions
(one purely along the first axis, one purely along the second) dot to
exactly zero; this is called a **dot product**, and zero is its
signature for "perpendicular." `same_dir.dot(same_dir)` gives `1` —
dotting `(1, 0)` with itself is `1*1 + 0*0 = 1`, which is that vector's
own squared length (it's already length `1`, so the squared length is
also `1`) — the exact relationship the next Concept Unit builds
`length()` on top of.

### Discard the Throwaway Example

This `Pair` class is discarded now. `Vector3` gets the real `dot()`
next.

### Project Change

- **Reference Source:** `diff3d.py`, `align3d()`'s inner `sqdists`
  function: `deltas = closest - points; return np.sum(deltas**2, axis=1)`.
  For a single `deltas` vector, `np.sum(deltas**2)` is exactly
  `deltas.dot(deltas)` — summing each component squared is what a dot
  product with itself already computes.
- **Files affected:** modify `src/vector3d/vector.py`.
- **Change type:** add.
- **Location:** inside `class Vector3:`, directly after `__eq__`
  (Lesson 3).
- **Dependencies:** `Vector3.__init__` from Lesson 1.

### The New Code

```python
    def dot(self, other):
        return self.x * other.x + self.y * other.y + self.z * other.z
```

### The Updated Project

`src/vector3d/vector.py` so far, new lines marked:

```
 1  class Vector3:
 2      def __init__(self, x, y, z):
 3          self.x = x
 4          self.y = y
 5          self.z = z
 6
 7      def __add__(self, other):
 8          return Vector3(self.x + other.x, self.y + other.y, self.z + other.z)
 9
10      def __sub__(self, other):
11          return Vector3(self.x - other.x, self.y - other.y, self.z - other.z)
12
13      def __repr__(self):
14          return f"Vector3({self.x}, {self.y}, {self.z})"
15
16      def __eq__(self, other):
17          return self.x == other.x and self.y == other.y and self.z == other.z
18
19      def dot(self, other):                                           # ← new
20          return self.x * other.x + self.y * other.y + self.z * other.z  # ← new
```

As a whole, `Vector3` now has its first real math method — one that
takes two `Vector3`s and reduces them to a single number, rather than
producing another `Vector3` the way `__add__`/`__sub__` do.

### Mechanical Walkthrough

- **`def dot(self, other):`** — `def` (Lesson 1's keyword, defining a
  method again); `dot`, an ordinary name with no special meaning to
  Python — unlike every method built in Lessons 1–3 so far, this is the
  first **ordinary instance method** in this project: nothing about the
  name `dot` triggers it automatically the way `+` triggers `__add__`
  (Lesson 2) or `print()` triggers `__repr__` (Lesson 3); it only runs
  when explicitly called as `a.dot(b)`; `self` and `other`, the same
  two-operand roles from `__add__`/`__sub__` (Lesson 2), reused here for
  a method that isn't a dunder method at all.
- **`return self.x * other.x + self.y * other.y + self.z * other.z`** —
  `return`, handing back a plain number this time, not a new `Vector3`;
  `self.x * other.x` (and identically for `.y`, `.z`) — ordinary `*`
  between two plain numbers, the built-in numeric multiplication Python
  has always had; `+` chaining the three products together — also
  ordinary numeric addition, not `Vector3.__add__` (Lesson 2), because
  each side of every `+` here is a plain number, not a `Vector3` — the
  outer object this whole expression lives inside is a `Vector3` method,
  but every individual operation inside it is plain arithmetic on plain
  numbers.

### CS Lens

This is the **dot product** (also called the **scalar product** or
**inner product**), a specific instance of the more general idea of
*reducing a pair of structured values down to one summary number* —
here, by weighting matching components against each other and summing.

Also recognized in: physics (work done by a force equals the dot
product of force and displacement vectors); machine learning (a neural
network's weighted sum, `w1*x1 + w2*x2 + ... `, is literally a dot
product between a weight vector and an input vector); computer graphics
lighting (the classic diffuse-lighting calculation is the dot product of
a surface normal and a light direction, which is exactly why a
perpendicular-to-light surface gets zero brightness — the same
zero-means-perpendicular fact this lesson's lab just demonstrated);
search and recommendation systems (cosine similarity between two
documents' or users' feature vectors is a dot product, scaled).

### SE Lens

The principle here is **building complex operations from small, reused
primitives** rather than re-deriving the same arithmetic pattern
separately wherever it's needed. `dot()` looks almost too simple to be
worth its own method — three multiplications and two additions — but
the next Concept Unit's `length()` is going to call `self.dot(self)`
rather than re-writing `self.x*self.x + self.y*self.y + self.z*self.z`
from scratch, which is the actual payoff: one correct implementation of
the multiply-and-sum pattern, reused everywhere it recurs, instead of
copies that could individually drift or contain typos.

The alternative not chosen: inline the multiply-and-sum arithmetic
directly wherever a squared length or a dot product is needed, the way
a first draft of `length()` might look tempting to write
(`math.sqrt(self.x**2 + self.y**2 + self.z**2)`, skipping `dot()`
entirely). That would work today, at the cost of two separate places
computing "sum of squared components" that have to be kept in sync by
hand if the formula ever needed to change — a small cost here, at only
two call sites, but the same shortcut compounds badly once Phase C's
distance calculations and Phase E's optimizer both need the same
squared-distance logic repeatedly.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3

deltas = Vector3(-5.0, 1.0, -2.0)
sq_dist = deltas.dot(deltas)
print(sq_dist)
"
```

Real output:

```
30.0
```

That's `(-5.0)**2 + (1.0)**2 + (-2.0)**2` — `25 + 1 + 4` — computed via
`dot()` on our own `Vector3`, the exact per-point value `sqdists()`
computes for every row in the original script's `np.sum(deltas**2, axis=1)`.

### Connect

`dot()` gives `Vector3` its first way to reduce itself (or a pair of
`Vector3`s) to a single number. The next Concept Unit uses exactly that
number — specifically, a vector dotted with itself — to answer a
question `dot()` alone can't: not "what's the squared distance," but
"how long is this vector, really."

---

## Concept Unit: How Long Is This Vector

### The Problem

`align3d()` computes
`size = np.sqrt((xmax-xmin)**2 + (ymax-ymin)**2 + (zmax-zmin)**2)` — the
literal length of the bounding box's diagonal, used to scale the
alignment tolerance. The commented-out diagnostic line
`print(f"Alignment magnitude: {np.linalg.norm(delta):.6f}")` needs the
exact same operation on the alignment offset itself. `dot()`, just
built, gets us the *squared* length of a vector dotted with itself — but
a squared length isn't the same number as the length itself, and nothing
built so far takes a square root.

> **Before reading on, try this yourself:** the previous Concept Unit's
> lab already proved `same_dir.dot(same_dir)` gives `1`, which happens
> to equal that vector's actual length (also `1`) purely by coincidence
> of using a length-`1` example. For a vector that *isn't* already
> length `1` — say, `(3, 4)` — what operation would you need to apply to
> `dot(self, self)` to turn a squared length back into an ordinary
> length? (Hint: it's the inverse of squaring.)

### Introduce the Concept in Isolation

```python
# Throwaway lab: turning a vector into a single magnitude
import math

class Pair:
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def dot(self, other):
        return self.a * other.a + self.b * other.b

    def length(self):
        return math.sqrt(self.dot(self))

p = Pair(3, 4)
print(p.length())
```

Real output from running this:

```
5.0
```

This is the classic 3-4-5 right triangle, confirmed for real:
`self.dot(self)` gives `3*3 + 4*4 = 25`, and `math.sqrt(25)` gives
`5.0` — the actual straight-line length of a vector reaching `3` units
one way and `4` units another. This is called **magnitude** (or
**length**), and it's the same square-root-of-sum-of-squares formula
you may already know as the Pythagorean theorem, applied here through
`dot()` rather than written out as a fresh sum of squares.

### Discard the Throwaway Example

This `Pair` class is discarded now. `Vector3` gets the real `length()`
next.

### Project Change

- **Reference Source:** `diff3d.py`, `align3d()`:
  `size = np.sqrt((xmax-xmin)**2 + (ymax-ymin)**2 + (zmax-zmin)**2)`, and
  the commented-out `np.linalg.norm(delta)` diagnostic line.
- **Files affected:** modify `src/vector3d/vector.py`. This is also the
  first lesson that needs an import at the top of the file — `math` —
  since Python's `math.sqrt` isn't available without it.
- **Change type:** add.
- **Location:** `import math` goes at the very top of the file, before
  `class Vector3:`; the `length` method goes inside the class, directly
  after `dot` (added earlier in this same lesson).
- **Dependencies:** `Vector3.dot`, added earlier in this lesson, and
  Python's standard-library `math` module.

### The New Code

At the very top of the file, before `class Vector3:`:

```python
import math
```

Then, inside `class Vector3:`, after `dot`:

```python
    def length(self):
        return math.sqrt(self.dot(self))
```

### The Updated Project

`src/vector3d/vector.py` so far, new lines marked:

```
 1  import math                                                          # ← new
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
25      def length(self):                                                # ← new
26          return math.sqrt(self.dot(self))                             # ← new
```

As a whole, `Vector3` can now answer "how big is this vector" as a
single, ordinary number — `length()` doesn't repeat `dot()`'s
multiply-and-sum arithmetic; it reuses `dot()` outright (line 23) and
only adds the square root on top (line 26).

### Mechanical Walkthrough

- **`import math`** — Python's `import` statement, loading the
  standard-library `math` module so its contents (here, specifically
  `math.sqrt`) become usable in this file. This is the first `import`
  anywhere in this project's own code — everything through Lesson 3 and
  the first half of this lesson needed nothing beyond what's already
  available without importing anything.
- **`def length(self):`** — `def` again; `length`, another ordinary
  instance method name (like `dot`, not a dunder method — no operator
  triggers it, it's always called explicitly as `v.length()`); `self`
  only — unlike `dot`, `__add__`, `__sub__`, and `__eq__`, this method
  takes no `other`, because a length is a property of one vector alone,
  not a relationship between two.
- **`return math.sqrt(self.dot(self))`** — `return`, handing back a
  plain number; `self.dot(self)` — calling the `dot` method (defined
  earlier in this same lesson) with `self` passed as *both* the implicit
  receiver and the explicit `other` argument, which is exactly what
  "dot a vector with itself" means in code — this is the first method in
  this project that calls *another method defined on the same class*,
  rather than only touching raw attributes; `math.sqrt(...)` — the
  standard-library function imported above, called on the result of
  `self.dot(self)`, turning the squared length `dot()` produces back
  into an ordinary length.

### CS Lens

This is **Euclidean norm** (the everyday notion of "straight-line
distance/size" in geometry), and the broader pattern of *composing a
new operation from an already-defined one* — `length()` doesn't
recompute the sum-of-squares itself; it calls `dot()`, which already
knows how, and only adds what `dot()` doesn't already provide.

Also recognized in: physics (speed is the magnitude/length of a velocity
vector); machine learning (L2 regularization directly penalizes a
weight vector's length, computed exactly this way); computer graphics
(collision detection constantly checks "is the distance between these
two points less than some radius," which is a length computed from a
subtraction, exactly the `(closest - points)` pattern from this
project's own `sqdists`); everyday GPS/mapping software (straight-line
"as the crow flies" distance between two coordinates is this same
formula, just usually in 2D rather than 3D).

### SE Lens

The principle is the same **composing from reused primitives** the
previous Concept Unit's SE Lens named, now shown paying off concretely:
`length()` is two lines because `dot()` already existed to build on top
of, rather than three lines of freshly re-derived `self.x**2 + self.y**2
+ self.z**2` arithmetic.

The alternative not chosen: write `length()` independently, with its
own inline sum-of-squares, never calling `dot()` at all. That would work
identically today — the numeric result is the same either way — and
costs nothing in correctness right now. The real cost would show up
later: if this project ever needed a different distance metric (say,
weighting the z-axis differently for some manufacturing-specific reason)
requiring a change to how "dot" is computed, an independently-written
`length()` would need updating separately and could silently drift out
of sync with `dot()` — a maintenance cost this project isn't paying
because `length()` calls `dot()` instead of duplicating it.

### Commands Needed

None new — `import math` is part of this unit's own New Code, not a
separate terminal command; nothing needs installing since `math` ships
with every Python installation.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3

delta = Vector3(-5.0, 1.0, -2.0)
print(delta.length())

size_vec = Vector3(1.0, 2.0, 2.0)
print(size_vec.length())
"
```

Real output:

```
5.477225575051661
3.0
```

The second line is a clean check: `1**2 + 2**2 + 2**2 = 9`, and
`math.sqrt(9)` is exactly `3.0` — no floating-point rounding noise,
confirming the formula end-to-end.

### Connect

`Vector3` can now measure itself. The next Concept Unit uses that
measurement for something new: not to report a size, but to strip the
size *away* — producing a same-direction vector whose length is always
exactly `1`.

---

## Concept Unit: Direction Without Size

### The Problem

Phase D's vertex-normal averaging and Phase F's signed-distance
calculation both need pure *directions* — which way is this surface
facing — not directions mixed with an arbitrary magnitude. Right now,
every `Vector3` this project can produce carries whatever length its
math happened to leave it with; there's no way to say "same direction,
but exactly length `1`."

> **Before reading on, try this yourself:** if `length()` tells you how
> long a vector currently is, and you want to make it exactly `1` units
> long *without changing which way it points*, what would you do to
> each of its three components? (Think about what happens to a fraction
> like `3/5` versus `4/5` — think about the 3-4-5 vector from the
> previous Concept Unit's lab, and what dividing each component by its
> own length, `5`, would leave you with.)

### Introduce the Concept in Isolation

```python
# Throwaway lab: shrinking/stretching a vector to length 1, keeping direction
import math

class Pair:
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def dot(self, other):
        return self.a * other.a + self.b * other.b

    def length(self):
        return math.sqrt(self.dot(self))

    def normalize(self):
        n = self.length()
        return Pair(self.a / n, self.b / n)

p = Pair(3, 4)
u = p.normalize()
print(u.a, u.b)
print(u.length())
```

Real output from running this:

```
0.6 0.8
1.0
```

This is exactly the 3-4-5 vector from the previous Concept Unit,
divided through by its own length (`5`): `3/5` is `0.6`, `4/5` is
`0.8`, and the Socratic prompt's guess was right — dividing every
component by the vector's own length is **normalization**, and the
proof it worked is the second line: `u.length()` comes back as exactly
`1.0`. The direction is unchanged (`0.6` and `0.8` are still in the same
`3`-to-`4` ratio as the original `3` and `4`); only the size changed.

### Discard the Throwaway Example

This `Pair` class is discarded now. `Vector3` gets the real
`normalize()` next.

### Project Change

- **Reference Source:** no direct line in `diff3d.py` — `pyvista`'s
  `compute_normals()` produces already-normalized vectors internally,
  invisibly. This is a from-scratch addition because Phase D's
  `Triangle.normal()` (built from `cross()`, this lesson's next Concept
  Unit) will produce a perpendicular vector of *some* length, and
  Phase D's vertex-normal averaging needs each contributing normal
  rescaled to length `1` before averaging, or triangles of different
  sizes would unfairly dominate the average.
- **Files affected:** modify `src/vector3d/vector.py`.
- **Change type:** add.
- **Location:** inside `class Vector3:`, directly after `length`
  (added earlier in this same lesson).
- **Dependencies:** `Vector3.length`, added earlier in this lesson, and
  `Vector3.__init__` (Lesson 1) to build the return value.

### The New Code

```python
    def normalize(self):
        n = self.length()
        return Vector3(self.x / n, self.y / n, self.z / n)
```

### The Updated Project

`src/vector3d/vector.py` so far, new lines marked:

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
28      def normalize(self):                                             # ← new
29          n = self.length()                                            # ← new
30          return Vector3(self.x / n, self.y / n, self.z / n)           # ← new
```

As a whole, `Vector3` can now produce a pure-direction version of
itself — `normalize()` (line 28) calls `length()` (line 25), which
calls `dot()` (line 22) — three methods from this same lesson chained
together, each reusing the one before it.

### Mechanical Walkthrough

- **`def normalize(self):`** — `def` again; `normalize`, another
  ordinary instance method name, called explicitly (`v.normalize()`);
  `self` only, same as `length` — normalizing one vector needs no second
  vector as input.
- **`n = self.length()`** — a local variable assignment; `n` exists only
  for the duration of this method call (like the parameter `x` inside
  `__init__` in Lesson 1) and holds whatever number `self.length()`
  (defined earlier in this lesson) returns; storing it in `n` avoids
  calling `self.length()` three separate times below.
- **`return Vector3(self.x / n, self.y / n, self.z / n)`** — `return`,
  handing back a new `Vector3`; `Vector3(...)`, calling
  `Vector3.__init__` (Lesson 1) again to build the result, the same
  pattern `__add__`/`__sub__` (Lesson 2) already used; `self.x / n` (and
  identically for `.y`, `.z`) — ordinary `/` division between two plain
  numbers, dividing each original component by the stored length `n`.

### CS Lens

This is **normalization** (specifically, normalizing to unit length) —
the general pattern of rescaling a value into a fixed, standard range or
magnitude so it can be compared or combined consistently regardless of
its original scale.

Also recognized in: statistics (normalizing a dataset to have length/norm
`1`, distinct from but related to normalizing to mean `0`/standard
deviation `1`); computer graphics universally (every lighting
calculation, every camera-direction calculation assumes unit vectors —
skipping normalization is one of the most common real bugs in hand-written
3D code, producing lighting that's too bright or too dim depending on an
un-normalized vector's accidental length); audio processing (normalizing
a waveform's peak amplitude); machine learning (normalizing feature
vectors before computing cosine similarity, which requires unit-length
inputs to be meaningful).

### SE Lens

The principle is again **composition over duplication**, now three
layers deep: `normalize()` calls `length()`, which calls `dot()` — none
of the three re-derive arithmetic the others already provide.

The alternative not chosen: inline `math.sqrt(self.x**2 + self.y**2 +
self.z**2)` directly inside `normalize()`, skipping both `length()` and
`dot()`. The real cost, stated honestly: this project now has a single
point of truth for "how is a vector's length computed" — if that formula
were ever wrong or needed to change, fixing `dot()` alone would
correctly fix `length()` and `normalize()` both, whereas three
independent inline implementations would need three independent, easy
to individually forget fixes.

One genuine cost this method *does* carry, worth naming honestly rather
than glossing over: `normalize()` divides by `n`, and nothing here
checks whether `n` is zero. Normalizing a zero-length `Vector3` (all
three components `0`) will raise `ZeroDivisionError` rather than fail
gracefully — not a problem for any input this curriculum has produced
so far, but a real edge case a production version of this class would
need to guard against explicitly.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3

v = Vector3(3.0, 4.0, 0.0)
u = v.normalize()
print(u)
print(u.length())
"
```

Real output:

```
Vector3(0.6, 0.8, 0.0)
1.0
```

Same 3-4-5 numbers as the throwaway lab, now on the real `Vector3`,
confirmed via `__repr__` (Lesson 3) for readable output and `length()`
(this lesson) to prove the result really is unit length.

### Connect

`Vector3` can now report its own size (`length()`) and strip that size
away while keeping direction (`normalize()`). Neither of those, nor
`dot()`, can answer a different question this project needs for Lesson
5's `Triangle` class: given two directions (two triangle edges), what's
a *third* direction, perpendicular to both — a surface normal. That's
what the last Concept Unit in this lesson builds.

---

## Concept Unit: A New Direction, Perpendicular to Two Others

### The Problem

Lesson 5's `Triangle` class needs a **face normal** — a direction
pointing straight out of the flat surface a triangle defines, computed
from two of the triangle's own edges. `dot()` reduces two vectors to a
single number; it can't produce a *new direction*. Nothing built so far
in `Vector3` can take two vectors and hand back a third one that's
perpendicular to both.

> **Before reading on, try this yourself:** picture the x-axis, pointing
> right, and the y-axis, pointing up — two perpendicular directions in a
> flat plane. In 3D, there's exactly one more direction perpendicular to
> *both* of them at once (well, one plus its exact opposite): straight
> out of the plane, toward or away from you. If you already know the
> right-hand rule from physics or don't, don't worry about deriving the
> formula yourself — just predict: should the result of combining the
> x-axis and the y-axis this way depend on the *order* you combine them
> in, the way subtraction does (`a - b` isn't `b - a`), or should it be
> order-independent, the way addition and the dot product are?

### Introduce the Concept in Isolation

```python
# Throwaway lab: a new vector perpendicular to two others
class Triple:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

    def dot(self, other):
        return self.x * other.x + self.y * other.y + self.z * other.z

    def cross(self, other):
        return Triple(
            self.y * other.z - self.z * other.y,
            self.z * other.x - self.x * other.z,
            self.x * other.y - self.y * other.x,
        )

x_axis = Triple(1, 0, 0)
y_axis = Triple(0, 1, 0)
z_axis = x_axis.cross(y_axis)
print(z_axis.x, z_axis.y, z_axis.z)

print(x_axis.dot(z_axis))
print(y_axis.dot(z_axis))
```

Real output from running this:

```
0 0 1
0
0
```

Crossing the x-axis `(1,0,0)` with the y-axis `(0,1,0)` produces exactly
`(0,0,1)` — the z-axis, perpendicular to both, confirming the geometric
picture from the Socratic prompt. The last two lines are the actual
*proof* it's perpendicular, not just a plausible-looking result:
`x_axis.dot(z_axis)` and `y_axis.dot(z_axis)` both come back `0` — and
the previous Concept Unit's lab already established that a dot product
of exactly `0` means perpendicular. This is called the **cross
product**, and — unlike the dot product — it is order-sensitive:
`y_axis.cross(x_axis)` would produce `(0,0,-1)`, the exact opposite
direction, which is why the formula in the code above isn't symmetric in
`self` and `other` the way `dot()`'s formula is.

### Discard the Throwaway Example

This `Triple` class is discarded now. `Vector3` gets the real `cross()`
next.

### Project Change

- **Reference Source:** no direct line in `diff3d.py` — `pyvista`'s
  `compute_normals()` computes exactly this, internally, for every
  triangle in a mesh, without exposing the cross-product step itself.
  This is a from-scratch addition because Lesson 5's `Triangle.normal()`
  needs to compute a face normal from two edges by hand, the same
  underlying operation `pyvista` performs invisibly.
- **Files affected:** modify `src/vector3d/vector.py`.
- **Change type:** add.
- **Location:** inside `class Vector3:`, directly after `normalize`
  (added earlier in this same lesson).
- **Dependencies:** `Vector3.__init__` (Lesson 1) to build the return
  value. Unlike `length`/`normalize`, this method does not depend on
  `dot`.

### The New Code

```python
    def cross(self, other):
        return Vector3(
            self.y * other.z - self.z * other.y,
            self.z * other.x - self.x * other.z,
            self.x * other.y - self.y * other.x,
        )
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
32      def cross(self, other):                                          # ← new
33          return Vector3(                                              # ← new
34              self.y * other.z - self.z * other.y,                     # ← new
35              self.z * other.x - self.x * other.z,                     # ← new
36              self.x * other.y - self.y * other.x,                     # ← new
37          )                                                             # ← new
```

As a whole, `Vector3` is now a complete small geometry toolkit: build
it, combine it with `+`/`-`, print it, compare it, reduce two of them to
a number (`dot`), measure one (`length`), strip its size away
(`normalize`), and — as of these six new lines — find a new direction
perpendicular to two others (`cross`). Every method Phase A's `Triangle`
and `Mesh` classes need from `Vector3` now exists.

### Mechanical Walkthrough

- **`def cross(self, other):`** — `def` again; `cross`, another
  ordinary instance method name; `self` and `other`, the same two-vector
  shape as `dot`, but this time the return type differs — `dot` returns
  a plain number, `cross` returns a whole new `Vector3`.
- **`return Vector3(` / the three component lines / `)`** — `return`,
  handing back a new `Vector3`; `Vector3(...)` spanning multiple lines —
  the same constructor call from Lesson 1, just formatted across several
  lines because it now takes three multi-term expressions instead of
  three bare parameters; the trailing comma after the third expression
  (`self.x * other.y - self.y * other.x,`) is optional Python syntax,
  present here purely for formatting consistency, not required for the
  call to work.
- **`self.y * other.z - self.z * other.y`** (first component), **`self.z
  * other.x - self.x * other.z`** (second), **`self.x * other.y - self.y
  * other.x`** (third) — three separate arithmetic expressions, each
  built from ordinary `*` and `-` on plain numbers (the same built-in
  operators already explained in earlier Concept Units), but the
  *pattern* connecting all three is the actual cross-product formula
  itself: notice each component swaps a different pair of axes
  (`y`/`z`, then `z`/`x`, then `x`/`y`) and subtracts the two ways of
  multiplying across them — this fixed, specific formula (not derivable
  from `dot` or any other method already built) is what makes the result
  perpendicular to both inputs, which is exactly what the lab's `dot()`
  checks proved.

### CS Lens

This is the **cross product**, a specific operation from linear algebra
producing a vector (not a scalar, unlike the dot product) that's
perpendicular to both inputs, with a magnitude related to how far apart
the two input directions are and a sign that depends on their order.

Also recognized in: computer graphics universally (every triangle mesh's
surface normal — used for lighting, backface culling, collision
response — starts as a cross product of two edges, exactly the
computation Lesson 5's `Triangle.normal()` will build); physics (torque
is the cross product of a position vector and a force vector; angular
momentum likewise); robotics (computing the axis a robot arm's joint
needs to rotate around, given two reference directions); flight
simulation and aerospace (computing an aircraft's "up" direction from
its forward and right vectors).

### SE Lens

The principle here is **defining an operation once, directly from its
mathematical specification**, rather than trying to derive it from
already-built primitives the way `length()` and `normalize()` reused
`dot()`. Not every operation *can* be composed from what already exists
— the cross-product formula is its own independent piece of math, and
forcing it to somehow reuse `dot()` would only obscure what's actually
happening.

The alternative not chosen: skip building `cross()` as a method on
`Vector3` at all, and instead write a free-standing function,
`cross_product(a, b)`, taking two `Vector3`s as plain arguments. That
would work identically — Python doesn't require geometry operations to
be methods — and some real codebases do organize vector math this way,
especially when a language or library draws a firmer line between "data
types" and "operations on data types." The tradeoff made here favors
consistency with every other method already on `Vector3`
(`dot`, `length`, `normalize`) reading as `a.cross(b)`, matching
`a.dot(b)`, rather than mixing method-call syntax for some operations
and function-call syntax for others.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3

edge1 = Vector3(1.0, 0.0, 0.0)
edge2 = Vector3(0.0, 1.0, 0.0)
face_normal = edge1.cross(edge2)
print(face_normal)
print(edge1.dot(face_normal))
print(edge2.dot(face_normal))
"
```

Real output:

```
Vector3(0.0, 0.0, 1.0)
0.0
0.0
```

Same result as the throwaway lab, now on the real `Vector3`: two edges
along the x- and y-axes produce a face normal straight along the
z-axis, and both dot-product checks confirm perpendicularity at `0.0`.

### Connect

`Vector3` is now a complete geometry toolkit — every operation Lesson
5's `Triangle` class needs (`__sub__` to compute edges from vertices,
`cross` to compute a raw face normal, `normalize` to make it unit
length) already exists.

---

## Connect the Pieces

One value, traced through all four methods this lesson added: start with
two triangle-edge vectors, `edge1 = Vector3(1.0, 0.0, 0.0)` and
`edge2 = Vector3(0.0, 1.0, 0.0)` — themselves the kind of vector
Lesson 5's `Triangle` will compute via `__sub__` (Lesson 2) from two
vertex positions. `edge1.cross(edge2)` (this lesson's last Concept Unit)
produces `Vector3(0.0, 0.0, 1.0)` — a raw face normal, perpendicular to
both edges. Calling `.length()` (this lesson's second Concept Unit) on
that raw normal gives `1.0` in this particular example (not guaranteed
for every real triangle — a larger or more sheared triangle would
produce a longer raw cross product), so calling `.normalize()` (this
lesson's third Concept Unit) on it — which itself calls `.length()`,
which itself calls `.dot(self)` (this lesson's first Concept Unit) — is
what a real `Triangle.normal()` will always do, regardless of the raw
cross product's size, to guarantee a true unit-length face normal every
time.

---

## Try It Yourself

Type `dot`, `length`, `normalize`, and `cross` into your own
`vector.py` yourself (not copy-pasted, and remember `import math` at
the top of the file), and confirm all three `Run It` outputs above with
your own numbers. Then, once that works, try this and think about which
earlier lesson's method is what makes `a - b` valid here in the first
place, before this lesson's own `cross()` ever runs:

```python
p1 = Vector3(0.0, 0.0, 0.0)
p2 = Vector3(2.0, 0.0, 0.0)
p3 = Vector3(0.0, 2.0, 0.0)

edge_a = p2 - p1
edge_b = p3 - p1
normal = edge_a.cross(edge_b).normalize()
print(normal)
```
