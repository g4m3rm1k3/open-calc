# Lesson 3: A Readable Face and a Real Notion of Equality

**What you will build:** two more methods on `Vector3` — `__repr__`, so
`print(v)` shows real coordinates instead of a memory address, and
`__eq__`, so `a == b` compares the *values* two `Vector3` instances hold
rather than whether they're literally the same object in memory. Neither
of these has one specific line in the original `diff3d.py` to point at —
`numpy` arrays already print and compare this way, silently, and this
lesson is where that silent behavior becomes something you built and can
actually explain.

**What you need to know first:** Lesson 1 (`class`, `__init__`, `self`,
instance attributes) and Lesson 2 (dunder methods, operator overloading,
operator dispatch — `__add__`/`__sub__`), and the real
`Vector3(1,2,3) == Vector3(1,2,3)` → `False` its "Try It Yourself" ended
on.

**Terms used in this lesson:**
- **dunder method (magic method)** — a method whose name starts and ends
  with double underscores, called automatically by Python in response to
  a language-level action rather than by name. Reappearing from Lesson
  2, where `__add__`/`__sub__` were the language-level action of `+`/`-`
  — this lesson's dunder methods respond to a different pair of actions:
  printing and `==`.
- **`__repr__`** — the dunder method Python calls whenever it needs an
  official, unambiguous text representation of an object: at the
  interactive prompt, inside `print()` when no more specific method
  applies, and whenever the object is embedded inside another value
  being printed (a list, an f-string). It exists because the default
  representation — `<__main__.Vector3 object at 0x...>` — carries only
  the object's type and its memory address, which is useless for
  actually seeing what an object holds while developing or debugging.
- **f-string** — a string literal prefixed with `f`, containing `{}`
  placeholders that are evaluated and substituted at the moment the
  string is built (`f"Vector3({self.x})"` inserts the real value of
  `self.x`, not the literal text `self.x`). It exists as a shorter,
  more readable alternative to building strings with repeated `+`
  concatenation or `.format()` calls.
- **`__eq__`** — the dunder method Python calls when `==` is used
  between two instances. It exists for the same reason `__add__` exists
  for `+` (Lesson 2): `==` is just another operator, and Python needs a
  hook for a class to define what "equal" means for its own instances,
  rather than one fixed built-in meaning applying to every type.
- **identity** — whether two names refer to the *literal same object* in
  memory, checked with Python's `is` operator; `id(obj)` returns the
  actual number identifying that memory location. Two freshly built
  `Vector3(1,2,3)` calls never share identity, even with identical
  arguments — `Vector3.__init__` (Lesson 1) genuinely allocates a new
  object every time it runs.
- **equality** — whether two objects should be *treated* as the same,
  by whatever definition of "the same" the type chooses to give `==`;
  unlike identity, this is a design decision, not a physical fact about
  memory. Without a custom `__eq__`, Python's `==` falls back to
  identity — two objects only compare equal if they're literally the
  same object — which is exactly the behavior the end of Lesson 2 caught
  `Vector3` doing.

**Objects and methods used:**

- **`Vector3.__repr__`**
  - *What it is:* the dunder method Python calls to get a readable text
    representation of a `Vector3` instance.
  - *Implementation:* `def __repr__(self): return f"Vector3({self.x}, {self.y}, {self.z})"`
    — takes only `self`, returns a single f-string.
  - *Its use:* every later lesson's "Run It" section, and every real
    verification run in this curriculum's `verification/` folders, needs
    to actually *see* what a `Vector3` holds — `__repr__` is what makes
    `print(delta)` show `Vector3(-5.0, 1.0, -2.0)` instead of a memory
    address.
  - *Type:* an instance method, dunder, invoked implicitly by `print()`,
    the interactive prompt, and f-string embedding — never called by
    that literal name at a normal call site.
  - *Responsibility:* to produce one consistent, readable string for any
    `Vector3`, no matter where or how Python needs to display it.
  - *Depends on:* the instance's own `.x`/`.y`/`.z`, already guaranteed
    to exist by `Vector3.__init__` (Lesson 1).
  - *Connects to:* called automatically by `print()`, by an f-string
    that embeds a `Vector3`, and by the interactive interpreter's
    auto-display of a bare expression's result; calls nothing else
    itself.
  - *Shape:* still part of `Vector3`'s own lowest-layer definition —
    this method exists purely to support development and debugging, not
    the alignment math itself.

- **`Vector3.__eq__`**
  - *What it is:* the dunder method Python calls when `==` is used
    between two `Vector3` instances.
  - *Implementation:*
    `def __eq__(self, other): return self.x == other.x and self.y == other.y and self.z == other.z`
    — takes `self` and `other`, returns a single boolean.
  - *Its use:* Lesson 15's optimizer will need to check whether an
    alignment delta has stopped changing between passes — comparing two
    `Vector3` deltas by value, not by whether they happen to be the same
    object, is what makes that check meaningful. Right now, without
    this method, no two independently-computed `Vector3`s could ever
    compare equal even if the math produced identical coordinates.
  - *Type:* an instance method, dunder, invoked implicitly by `==`.
  - *Responsibility:* to define "equal" for two `Vector3` instances as
    "holds the same three coordinates," overriding Python's default
    identity-based fallback.
  - *Depends on:* both instances' `.x`/`.y`/`.z`.
  - *Connects to:* called automatically by `==`; calls nothing else.
  - *Shape:* same layer as `__repr__` — part of `Vector3` itself,
    supporting correctness checks (testing, convergence detection) that
    later lessons depend on, rather than the geometry math directly.

---

## Concept Unit: Giving an Object a Readable Face

### The Problem

`print(delta)` right now — after Lessons 1 and 2 — still prints
something like `<vector3d.vector.Vector3 object at 0x7f82d698aff0>`.
That memory address tells you nothing about what `delta` actually holds,
and every verification run in this curriculum from here on needs to
*show* real coordinates as proof, the same way Lesson 1 and Lesson 2's
`Run It` sections already relied on `.x`/`.y`/`.z` access just to get
readable numbers onto the screen at all.

> **Before reading on, try this yourself:** Lesson 2's Socratic prompt
> established that Python rewrites `a + b` into `a.__add__(b)` — a
> specific dunder method backing a specific piece of syntax. `print(x)`
> is also syntax that needs to turn `x` into text somehow. Given that
> pattern, what would you guess the dunder method is called that
> `print()` (and the interactive prompt, and embedding a value in an
> f-string) all lean on to turn an arbitrary object into a string? If
> you had to write that method yourself for `Vector3`, what's the
> simplest string you could return that would actually tell you
> something useful — more useful than nothing, but not necessarily
> fancy?

### Introduce the Concept in Isolation

The smallest version of "teach an object how to print itself," run for
real:

```python
# Throwaway lab: can we teach an object how to print itself?
class Pair:
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def __repr__(self):
        return f"Pair({self.a}, {self.b})"

p = Pair(3, 4)
print(p)
print(f"embedded: {p}")
print([p, p])
```

Real output from running this:

```
Pair(3, 4)
embedded: Pair(3, 4)
[Pair(3, 4), Pair(3, 4)]
```

This proves `__repr__` isn't just wired to `print()` in isolation — it's
the one method three completely different situations all fall back to:
a direct `print(p)` call, an f-string that embeds `p` inside a larger
string (`f"embedded: {p}"`), and even a `list` containing `p` uses it to
render each element (`[Pair(3, 4), Pair(3, 4)]` — notice Python didn't
need `__repr__` called on the list itself, only on each `Pair` inside
it). One method, written once, and every place Python needs to show a
`Pair` as text uses it.

### Discard the Throwaway Example

This `Pair` class is discarded now. `Vector3` gets the real `__repr__`
next.

### Project Change

- **Reference Source:** no reference counterpart — `diff3d.py` never
  needs to teach `numpy` arrays how to print themselves; that behavior
  already exists inside `numpy` itself, invisibly, before the script
  ever touches it. This is a from-scratch addition because every
  `Run It` section and verification run in this curriculum, starting
  right now, needs a way to actually see what a `Vector3` holds.
- **Files affected:** modify `src/vector3d/vector.py`.
- **Change type:** add.
- **Location:** inside `class Vector3:`, directly after `__sub__`
  (Lesson 2).
- **Dependencies:** `Vector3.__init__` from Lesson 1 (the attributes
  this method reads must already exist).

### The New Code

```python
    def __repr__(self):
        return f"Vector3({self.x}, {self.y}, {self.z})"
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
13      def __repr__(self):                                             # ← new
14          return f"Vector3({self.x}, {self.y}, {self.z})"              # ← new
```

As a whole, `Vector3` can now be added, subtracted, and — as of these
two new lines — printed in a form that actually shows its coordinates,
anywhere Python would otherwise fall back to a bare memory address.

### Mechanical Walkthrough

- **`def __repr__(self):`** — `def` (Lesson 1's function-definition
  keyword, defining a method again); `__repr__`, the specific dunder
  name Python's printing and display machinery is hard-wired to call —
  a different hard-wired name from `__add__`/`__sub__` (Lesson 2), the
  same way `__sub__` was itself a different hard-wired name from
  `__add__`; `self`, the specific instance being converted to text
  (Lesson 1's role for `self`, reused here for a new purpose).
- **`return f"Vector3({self.x}, {self.y}, {self.z})"`** — `return`
  (Lesson 1/2's keyword, here handing back a string instead of a new
  `Vector3`); the `f` prefix marking this as an f-string, telling Python
  to scan the string for `{}` placeholders rather than treating them as
  literal characters; `{self.x}`, `{self.y}`, `{self.z}` — each one a
  placeholder evaluated at the moment the string is built, substituting
  in the real current value of that attribute (`self.x` access is
  Lesson 1's instance-attribute read, reused here); the surrounding
  literal text `"Vector3(", ", ", ")"` — plain characters copied through
  unchanged, giving the output the same call-like shape as the class
  name itself, so `Vector3(-5.0, 1.0, -2.0)` visually echoes how you'd
  construct that same object.

### CS Lens

This is the **string representation protocol** — a defined, uniform hook
a type provides so generic code (printing, logging, debugging tools)
can turn *any* object into text without needing to know that object's
specific type in advance.

Also recognized in: Java's `toString()` (overridden the same way, called
implicitly by `System.out.println`); JavaScript's
`Object.prototype.toString`/`Symbol.toStringTag`; C#'s `ToString()`;
Rust's `Debug`/`Display` traits (Rust actually splits this into two
separate protocols — one for developer-facing debug output, one for
end-user-facing display — a distinction Python's `__repr__` vs. `__str__`
also makes, though this lesson only needed the one).

### SE Lens

The principle here is **debuggability by design** — building
observability into a type from the moment it's created, rather than
treating "can I actually see what this holds" as an afterthought bolted
on only once something goes wrong.

The alternative not chosen: leave `__repr__` undefined and rely on
manual attribute access (`print(v.x, v.y, v.z)`) every time a `Vector3`
needs inspecting, the way Lesson 1 and Lesson 2's own `Run It` sections
were forced to do. That alternative costs nothing up front and is
genuinely fine for a single quick check — the real cost shows up at
scale: every future lesson's verification run, every debugging session
once `Mesh` (Phase A) holds thousands of `Vector3` points, would need
that same three-attribute unpacking repeated everywhere a value needs
to be seen, instead of `print(v)` just working.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3

delta = Vector3(-5.0, 1.0, -2.0)
print(delta)
print(f'Alignment offset: {delta}')
"
```

Real output:

```
Vector3(-5.0, 1.0, -2.0)
Alignment offset: Vector3(-5.0, 1.0, -2.0)
```

### Connect

`Vector3` can now be printed meaningfully — every `Run It` section from
here forward can show `print(v)` directly instead of unpacking
attributes by hand. What it still can't do correctly: be compared with
`==` for value equality, which the next Concept Unit fixes.

---

## Concept Unit: Value Equality, Not Just Identity

### The Problem

Lesson 2 ended by running `Vector3(1,2,3) == Vector3(1,2,3)` and getting
back `False` — two `Vector3` instances holding the exact same
coordinates, counted as unequal. That's not a bug in `Vector3` as
written so far; it's Python's honest default behavior for any class
that hasn't said otherwise: `==` falls back to asking whether both sides
are *literally the same object in memory* — the same fallback `is`
checks directly.

> **Before reading on, try this yourself:** Lesson 2 established that
> `+` dispatches to `__add__` and `-` dispatches to `__sub__` — each
> operator, its own specifically-named method. Applying that same
> pattern to `==`: what name would you guess Python looks for? And
> separately — even before knowing that name — what should "equal" mean
> for a `Vector3`, given what it represents? Is it "the same object,"
> or is it "holds the same three numbers," and are those ever different
> answers for the exact same pair of variables?

### Introduce the Concept in Isolation

```python
# Throwaway lab: identity vs value equality
class Pair:
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def __eq__(self, other):
        return self.a == other.a and self.b == other.b

p1 = Pair(1, 2)
p2 = Pair(1, 2)

print(p1 == p2)
print(p1 is p2)
print(id(p1), id(p2))
```

Real output from running this:

```
True
False
139984043389920 139984043389872
```

This is the exact split the Socratic prompt above was pointing at, made
concrete with real numbers: `p1 == p2` is `True` — the `__eq__` we wrote
says "equal" means "same `.a` and same `.b`," and both are true here.
`p1 is p2` is `False` — they are, provably, two separate objects: their
`id()` values (the actual memory addresses Python is tracking them at)
are two different numbers, `139984043389920` and `139984043389872` —
different every time this runs, but always different from each other,
because `Pair.__init__` really did allocate two separate objects.
`__eq__` let us redefine what `==` means; nothing can redefine what `is`
means — it's always, unconditionally, "the same object," and that's
exactly why it's the right tool for checking whether `__eq__` even ran
(if `p1 is p2` had been `True`, that would mean there was only ever one
object, not two equal ones).

### Discard the Throwaway Example

This `Pair` class is discarded now. `Vector3` gets the real `__eq__`
next.

### Project Change

- **Reference Source:** no reference counterpart — `numpy` arrays
  already support element-wise `==` and `np.array_equal`, invisibly,
  before `diff3d.py` ever touches them. This is a from-scratch addition
  because Lesson 15's optimizer will need to check whether a computed
  alignment delta matches an expected value — a value comparison, not an
  identity comparison — and nothing built so far makes that meaningful.
- **Files affected:** modify `src/vector3d/vector.py`.
- **Change type:** add.
- **Location:** inside `class Vector3:`, directly after `__repr__`
  (added earlier in this same lesson).
- **Dependencies:** `Vector3.__init__` from Lesson 1.

### The New Code

```python
    def __eq__(self, other):
        return self.x == other.x and self.y == other.y and self.z == other.z
```

### The Updated Project

`src/vector3d/vector.py` in full, new lines marked:

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
16      def __eq__(self, other):                                        # ← new
17          return self.x == other.x and self.y == other.y and self.z == other.z  # ← new
```

As a whole, `Vector3` is now a complete small value type: it can be
built (`__init__`), combined with `+`/`-` (`__add__`/`__sub__`),
printed meaningfully (`__repr__`), and compared by value (`__eq__`) —
everything the alignment math and this curriculum's own verification
runs need from a single 3D point or displacement.

### Mechanical Walkthrough

- **`def __eq__(self, other):`** — `def` again defining a method;
  `__eq__`, the dunder name `==` is hard-wired to (confirming the
  Socratic prompt's guess), a third distinct hard-wired name alongside
  `__add__` and `__sub__` from Lesson 2, and `__repr__` from earlier in
  this lesson; `self` and `other`, the same left-operand/right-operand
  roles `__add__`/`__sub__` used, reused here for a comparison instead
  of an arithmetic result.
- **`return self.x == other.x and self.y == other.y and self.z == other.z`**
  — `return`, handing back a boolean this time rather than a new
  `Vector3` or a string; `self.x == other.x` — ordinary `==` between two
  plain numbers, the same built-in numeric equality Python has always
  had (this inner `==` needed no dunder method of ours to work — it's
  the *outer* `==`, between two whole `Vector3`s at the call site, that
  needed `__eq__` to exist at all — exactly the same distinction
  `__add__`'s inner `+` had in Lesson 2); `and`, Python's boolean
  short-circuit operator — evaluates left to right and stops at the
  first `False` it finds, which here means all three coordinate checks
  have to pass for the whole expression to be `True`; if `self.x` and
  `other.x` already differ, `self.y == other.y` and
  `self.z == other.z` never even get evaluated.

### CS Lens

This is **equality by value semantics**, as opposed to the default
**reference (identity) semantics** every custom class starts with in
Python — a general split in how equality can be defined for any
composite data type: "the same underlying storage" versus "the same
observable content."

Also recognized in: Java's `.equals()` override, deliberately separate
from `==` (Java's `==` is *always* identity, unlike Python's, which
falls back to identity only until overridden); Haskell's `deriving Eq`,
which auto-generates structural equality from a type's field list;
C# 9's `record` types, which get value equality automatically, the same
way this lesson's manual `__eq__` gives `Vector3` value equality by
hand; Python's own `dataclasses` module, which — worth naming directly,
since it's the realistic alternative to what this lesson just did by
hand — can generate both `__repr__` and `__eq__` automatically from a
field list with `@dataclass` and zero method bodies written yourself.

### SE Lens

The principle is the same value semantics named above, applied as a
design decision: deciding, explicitly, that two `Vector3`s should count
as interchangeable whenever their coordinates match, regardless of
which specific object either variable happens to point at.

The alternative not chosen, worth naming honestly since the CS Lens
already raised it: Python's `@dataclass` decorator could generate
`__init__`, `__repr__`, and `__eq__` for `Vector3` automatically from a
one-line field declaration, with none of the method bodies in Lessons 1
through 3 written by hand at all. That would be the realistic choice in
production code reaching for this exact behavior. It's deliberately not
used here: this curriculum's whole purpose is understanding what these
methods actually do and why, and `@dataclass` would generate all of
it invisibly, the same way `numpy` already does — trading the entire
point of Lessons 1–3 for four lines saved.

The honest debt this project is currently carrying: `__eq__` compares
`float` values with plain `==`, which means two coordinates that differ
by the tiniest rounding error — `0.30000000000000004` versus `0.3`, the
classic floating-point trap — would compare unequal even though they're
"the same point" for any real purpose. Nothing in this curriculum has
hit that yet, but Lesson 15's optimizer will produce exactly that kind
of near-but-not-exact result, and this `__eq__` as written will need
revisiting then rather than trusted blindly.

### Commands Needed

None new.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3

a = Vector3(1, 2, 3)
b = Vector3(1, 2, 3)
print(a == b)
print(a is b)
"
```

Real output:

```
True
False
```

### Connect

`Vector3` is now a complete small value type — buildable, addable,
subtractable, printable, and comparable by value. Nothing built so far
gives it any actual vector *math* beyond `+`/`-`, though: no length, no
direction, no dot or cross product. Lesson 4 adds those as instance
methods, which is also where the honest debt from this lesson's SE Lens
(exact float equality) will first start to matter for real.

---

## Connect the Pieces

One value, traced through everything this lesson added: start with
`delta = Vector3(-5.0, 1.0, -2.0)`, built by `Vector3.__init__` (Lesson
1). `print(delta)` calls `__repr__` (this lesson), which reads
`self.x`, `self.y`, `self.z` and returns the f-string
`"Vector3(-5.0, 1.0, -2.0)"`, so what actually reaches the screen is
real coordinates, not a memory address. Separately, build a second,
independent `Vector3(-5.0, 1.0, -2.0)` — call it `delta2` — with the
identical numbers. `delta is delta2` is `False` (two real, separate
allocations from `__init__`, exactly like `Pair`'s `p1`/`p2` in this
lesson's second lab), but `delta == delta2` is `True`, because `__eq__`
(this lesson) checks `.x`/`.y`/`.z` component-by-component rather than
asking whether they're the same object — the same three attributes
`__repr__` just printed, now driving a completely different kind of
check.

---

## Try It Yourself

Type `__repr__` and `__eq__` into your own `vector.py` (not
copy-pasted), and confirm both `Run It` outputs above with your own
numbers. Then, once that works, try this and think about which of this
lesson's two new methods actually gets used to make it print the way it
does:

```python
points = [Vector3(0, 0, 0), Vector3(1, 1, 1)]
print(points)
```
