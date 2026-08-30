# Lesson 1: The Blueprint Problem

**What you will build:** a `Vector3` class — three named numbers, `x`,
`y`, `z`, bundled under one name with one constructor. This is the single
piece everything else in this rebuild sits on top of: every mesh vertex,
every sampled point, every alignment offset in your uploaded `diff3d.py`
is, underneath the `numpy` array syntax, exactly this — three numbers
that belong together. The transferable problem this lesson is actually
about: how do you give a group of related values a name, a shape, and
eventually behavior, instead of tracking them as separate loose variables
or unlabeled tuples?

**What you need to know first:** Nothing — Lesson 1.

**Terms used in this lesson:**
- **class** — a blueprint for a kind of object: a description of what
  data it holds and what it can do, written once, used to stamp out as
  many actual objects as you need. It exists because "three floats that
  represent a point" is a *concept* your code needs to refer to by name,
  not just a shape that happens to recur.
- **object / instance** — one actual thing built from a class's
  blueprint. The class `Vector3` is the blueprint; a specific point like
  `(1.0, 2.0, 3.0)` built from it is an instance of that blueprint.
- **`self`** — inside a class's methods, the name (by convention, not by
  language rule) for "the specific instance this method call is
  currently operating on." It exists because a class is one blueprint
  shared by every instance made from it; when a method runs, Python has
  to tell it *which* instance's data to read and write, and `self` is
  how that instance arrives as the method's first argument.
- **`__init__`** — the method Python calls automatically, immediately
  after building a new instance, to set that instance up. It exists
  because "allocate the object" and "fill in its starting values" are
  two different jobs, and `__init__` is where the second one lives —
  without it, every new `Vector3` would start out with no `x`, `y`, or
  `z` at all.
- **instantiation** — the act of calling a class as if it were a
  function (`Vector3(1.0, 2.0, 3.0)`) to produce a new instance. This is
  the moment `__init__` actually runs.
- **instance attribute** — a named value stored *on one specific
  instance* (`self.x`), as opposed to a value that lives once on the
  class itself. It exists because two different `Vector3` instances need
  two different `x` values at the same time — the attribute has to be
  per-instance, not shared.

**Objects and methods used:**

- **`Vector3`**
  - *What it is:* a class representing one point or one direction in 3D
    space — the smallest reusable unit of data this whole rebuild is
    built from.
  - *Implementation:* `class Vector3:` with one method,
    `__init__(self, x, y, z)`, which stores its three arguments as
    `self.x`, `self.y`, `self.z`.
  - *Its use:* every mesh vertex, every sampled surface point, and every
    alignment `delta` in the original script is three coordinates moved
    around together — `Vector3` is the name we give that concept so the
    rest of the rebuild can pass "a point" around as one thing instead
    of three.
  - *Type:* a plain class with no parent class (an "ordinary" Python
    class), one instance method (`__init__`).
  - *Responsibility:* to hold exactly three numeric coordinates as one
    named unit, and to guarantee that any `Vector3` instance that exists
    at all has all three set — there is no such thing as a half-built
    `Vector3`.
  - *Depends on:* three numbers (`x`, `y`, `z`) handed to it at
    construction time; nothing else.
  - *Connects to:* nothing yet calls it and it calls nothing else — this
    is the very first class in the project. Starting in Lesson 2, other
    code (and other methods added to `Vector3` itself) will read
    `self.x` / `self.y` / `self.z` directly.
  - *Shape:* the lowest layer of the project — a plain data type with no
    dependencies on anything else this curriculum builds. Every later
    class (`Triangle`, `Mesh`, `SpatialGrid`, the optimizer) is built on
    top of `Vector3`, never the reverse.

---

## Concept Unit: The Blueprint Problem

### The Problem

Look at how your uploaded `diff3d.py` handles a single point in space.
`stationary.center` comes back from `pyvista` as a tuple-like object; the
alignment code does `np.array(stationary.center) - np.array(moving.center)`
— it has to convert to a `numpy` array first, because plain tuples in
Python don't support subtraction at all. Elsewhere, a point is three
separate values sitting in a `numpy` array row, addressed by position
(`points[i, 0]`, `points[i, 1]`, `points[i, 2]`) rather than by name.

Without `numpy`, and without a class of our own, we're left tracking
`x`, `y`, `z` as three completely separate variables everywhere a point
shows up — `x1, y1, z1 = 0.0, 0.0, 0.0` — with nothing in the language
tying them together, and no way to pass "one point" into a function as a
single argument.

> **Before reading on, try this yourself:** if you had to write a
> function `distance(x1, y1, z1, x2, y2, z2)` — six separate arguments
> for two points — what's the first thing that would go wrong as this
> project grows to have dozens of points in play at once? If Python let
> you group `x1, y1, z1` under one name, what would you want to be able
> to *do* with that name once you had it (print it? pass it to a
> function as one thing? compare two of them?) — even before knowing
> the syntax for how?

### Introduce the Concept in Isolation

Before touching the real project, here's the smallest possible version
of "group values under one name with a constructor," run for real, with
nothing else mixed in:

```python
# Throwaway lab: does a class actually let us group x, y, z with a name?
class Point:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

p = Point(1.0, 2.0, 3.0)
print(p)
print(p.x, p.y, p.z)
print(type(p))
```

Real output from running this:

```
<__main__.Point object at 0x7f82d698aff0>
1.0 2.0 3.0
<class '__main__.Point'>
```

This proves three things. First, `print(p)` on its own is nearly
useless right now — Python has no idea how you'd want a `Point` printed,
so it falls back to a memory address (`0x7f82d698aff0` — that will be a
different number every single run; it's just where the object happens
to live in memory this time). Second, `p.x`, `p.y`, `p.z` *do* work —
the three values really did get attached to `p` by name, individually
addressable, exactly the thing plain tuples in the original script
couldn't give us without `numpy`'s help. Third, `type(p)` confirms `p`
really is a `Point` — a new, real Python type, not just a dictionary or
a list dressed up. This is called a **class constructor pattern**: a
class whose only job, for now, is to validate-and-store its inputs as
named attributes.

### Discard the Throwaway Example

This `Point` class is discarded now — it never appears in the project
again. The real project version, built next, is named `Vector3` (matching
what it actually represents — a point *or* a displacement, both of which
the original script uses these three numbers for) and lives in its own
file rather than a scratch script.

### Project Change

- **Reference Source:** `diff3d.py`, the `align3d` function — specifically
  the line `delta = np.array(stationary.center) - np.array(moving.center)`
  and the repeated pattern of `mesh.center`, `mesh.bounds`, and
  `points[i, 0:3]` throughout `sample_points` and `run_diff`. There is no
  single-class counterpart in the original — `numpy` arrays play this
  role implicitly, spread across the whole file. This lesson factors that
  implicit role out into an explicit class for the first time.
- **Files affected:** create `src/vector3d/vector.py` (new file).
- **Change type:** add.
- **Location:** N/A — brand-new file, nothing to locate a position within
  yet.
- **Dependencies:** none. This is the first file in the project.

### The New Code

Type this into `src/vector3d/vector.py`:

```python
class Vector3:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z
```

### The Updated Project

This *is* the whole new file — there's no larger enclosing structure to
return to yet (Project Change already covered this: a brand-new file has
nothing to locate a position within). Here it is in full, numbered,
exactly as it sits on disk right now:

```
1  class Vector3:
2      def __init__(self, x, y, z):
3          self.x = x
4          self.y = y
5          self.z = z
```

Four lines total, and as a whole this file now defines one thing: a
buildable `Vector3(x, y, z)` that, the instant it's constructed,
guarantees `.x`, `.y`, and `.z` all exist and hold exactly what was
passed in.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code block, in order:

- **`class Vector3:`** — the `class` keyword. This is what actually
  creates a new blueprint; without it, `Vector3` would just be an
  ordinary name pointing at nothing. `Vector3` is the name being bound
  to that new blueprint — capitalized by convention (not by rule) to
  visually mark it as a class rather than a variable or function.
- **`def __init__(self, x, y, z):`**
  - `def` — the same function-definition keyword you already use
    outside of classes; a method is a function, just one written inside
    a class body.
  - `__init__` — the specific, Python-reserved method name that gets
    called automatically the moment a new instance is built. The double
    underscores on both sides ("dunder") mark it as one of Python's
    special hook methods, not an ordinary method you'd call yourself —
    you never write `v.__init__(...)` directly; calling `Vector3(...)`
    triggers it for you.
  - `self` — the first parameter of every instance method, by
    convention named `self`. When `Vector3(1.0, 2.0, 3.0)` runs, Python
    builds a new, empty instance first, then calls `__init__` on it,
    automatically passing that new instance in as `self` — you never
    supply this argument yourself at the call site.
  - `x, y, z` — three ordinary parameters, no different in kind from
    parameters on any function you've already written; the only thing
    new here is that they're arriving into a *method*, alongside `self`.
- **`self.x = x`** (and identically for `.y` and `.z`) — the `.`
  attribute-assignment syntax. The right-hand `x` is the local parameter
  variable that only exists for the duration of this `__init__` call;
  the left-hand `self.x` creates a new attribute that lives on the
  instance itself, for as long as that instance exists — after
  `__init__` returns, `x` (the parameter) is gone, but `self.x` (the
  attribute) persists as `p.x` from outside.

### CS Lens

This is an **abstract data type**: a way of bundling related raw data
under one name and one type, independent of how that data is physically
laid out or what CPU-level representation it uses.

Also recognized in: a `struct` in C, a row in a relational database
table, a `record` in a `.proto` file, a DTO (data transfer object) in
Java web services, a position/rotation `Transform` in every game engine
(Unity's `Vector3` is, mechanically, exactly this class).

### SE Lens

The principle here is **encapsulation of related data** — even at this
minimal stage, before any behavior has been added, giving `x`, `y`, `z`
one shared name and one shared constructor is a design decision, not
just convenience.

The alternative not chosen: keep using plain tuples, `(x, y, z)`, the
way `numpy` and `pyvista` effectively do under the hood in the original
script. Tuples are genuinely lighter-weight — no class to define, no
`self.` to type — and for truly throwaway, one-off groupings they're
often the right call. The real cost of the tuple approach shows up as
this project grows: a tuple has no name attached to its meaning (is
`(x, y, z)` a point, or a direction, or an RGB color? nothing in the
type says so), it's addressed by position (`t[0]` reads worse than `.x`
and is easy to get wrong once more fields are involved), and — the
concrete debt this project would otherwise be carrying — there is
nowhere to attach behavior like "add two of these together" or
"compute the distance between two of these" without writing free-floating
functions that take the tuples as arguments, scattered across the file,
disconnected from the data they operate on. `Vector3` costs four lines
of boilerplate today specifically so Lesson 2 onward has somewhere to
put that behavior.

### Commands Needed

None yet — this lesson only defines the class. Running it happens next.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3

v = Vector3(1.0, 2.0, 3.0)
print(v.x, v.y, v.z)

center1 = Vector3(0.0, 0.0, 0.0)
center2 = Vector3(5.0, -1.0, 2.0)
print(center1.x, center1.y, center1.z)
print(center2.x, center2.y, center2.z)
"
```

Real output:

```
1.0 2.0 3.0
0.0 0.0 0.0
5.0 -1.0 2.0
```

Three separate `Vector3` instances, each holding its own independent
`x`/`y`/`z` — exactly the "named group of three numbers, addressable
individually, distinguishable from every other instance" that plain
loose variables couldn't give us.

### Connect

This single class replaces every bare `x, y, z` triple you'll meet for
the rest of this rebuild — the next lesson gives it the one thing it's
still missing to be useful for alignment math: the ability to be added
to and subtracted from another `Vector3` with a plain `+` and `-`,
exactly like `np.array(stationary.center) - np.array(moving.center)`
does in the original script, but on data we built ourselves.

---

## Try It Yourself

Before Lesson 2, type `Vector3` into `src/vector3d/vector.py` yourself
(don't copy-paste) and confirm it runs with the `Run It` command above,
using your own numbers instead of `(1.0, 2.0, 3.0)`. Then try this,
without changing the class yet, and actually look at the real error
Python gives you — it's the exact problem Lesson 2 exists to fix:

```python
a = Vector3(1, 2, 3)
b = Vector3(4, 5, 6)
c = a + b
```
