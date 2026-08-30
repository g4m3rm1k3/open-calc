# Lesson 2: Teaching Arithmetic to an Object

**What you will build:** two more methods on `Vector3` — `__add__` and
`__sub__` — so that `a + b` and `a - b` work directly on your own
objects, the way `np.array(stationary.center) - np.array(moving.center)`
works in the original `diff3d.py` only because `numpy` arrays already
have this behavior built in. The transferable problem: Python doesn't
know what `+` or `-` should mean for a class you invented — you have to
teach it, explicitly, and doing so is what lets your own objects behave
like the built-in numeric types you're already used to.

**What you need to know first:** Lesson 1 — the `Vector3` class itself
(`class`, `__init__`, `self`, instance attributes) and the real
`TypeError: unsupported operand type(s) for +: 'Vector3' and 'Vector3'`
its "Try It Yourself" ended on.

**Terms used in this lesson:**
- **dunder method (magic method)** — a method whose name starts and ends
  with double underscores (`__add__`, `__init__` from Lesson 1, and
  others you'll meet later like `__repr__`), which Python calls
  automatically in response to a language-level action, rather than
  something you call directly by name. It exists so that ordinary
  syntax (`+`, `-`, `print(...)`, `len(...)`) can work uniformly on both
  Python's built-in types and on classes you write yourself, instead of
  built-ins getting special syntax and everything else needing its own
  differently-named methods.
- **operator overloading** — giving an existing operator (`+`, `-`, and
  others) a new meaning for a type you define, by implementing the
  dunder method that operator dispatches to. It exists because a single
  symbol like `+` genuinely means something different depending on what
  it's applied to (integer addition, string concatenation, and — as of
  this lesson — vector addition), and the language needs one consistent
  mechanism for a type to say what `+` means *for it*.
- **operator dispatch** — the process Python actually runs when it sees
  `a + b`: it does not know what `+` means on its own; it looks at the
  type of `a`, finds that type's `__add__` method, and calls
  `a.__add__(b)` — the plain-looking `+` symbol is sugar over exactly
  that method call. It exists as the mechanism that makes operator
  overloading possible in the first place — without dispatch, defining
  `__add__` on a class would have no way to actually get invoked by `+`.
- **return statement** — the same `return` keyword you already use in
  ordinary functions; the only thing new about it here is that `__add__`
  returns a *new* `Vector3`, rather than modifying `self` in place — the
  originals stay untouched.

**Objects and methods used:**

- **`Vector3.__add__`**
  - *What it is:* the dunder method Python calls when `+` is used
    between two `Vector3` instances.
  - *Implementation:*
    `def __add__(self, other): return Vector3(self.x + other.x, self.y + other.y, self.z + other.z)`
    — takes `self` (the left-hand operand) and `other` (the right-hand
    operand), returns a brand-new `Vector3` built from `Vector3.__init__`
    (Lesson 1).
  - *Its use:* `sample_points()` in the original script does
    `points = moving_points + delta` — shifting every sampled point by
    an alignment offset. `__add__` is what makes the equivalent
    `moving_point + delta` valid on our own `Vector3` objects.
  - *Type:* an instance method — a dunder method specifically, which
    means it's never called by that literal name at a normal call site;
    it's invoked implicitly through the `+` operator instead.
  - *Responsibility:* to define, once, what `+` means for any two
    `Vector3` instances — component-wise addition — and to hand back a
    new instance rather than mutating either operand.
  - *Depends on:* two existing `Vector3` instances (`self` and `other`),
    each already holding valid `.x`/`.y`/`.z`; it also depends on
    `Vector3.__init__` from Lesson 1 to build its return value.
  - *Connects to:* called by Python itself, automatically, whenever `+`
    appears between two `Vector3`s in later code — starting with the
    alignment math this class exists to support. It calls
    `Vector3.__init__` internally, once, to construct its result.
  - *Shape:* still part of the lowest layer of the project (`Vector3`
    itself); this is the first method that connects `Vector3` to actual
    ordinary-looking arithmetic syntax rather than just data storage.

- **`Vector3.__sub__`**
  - *What it is:* the dunder method Python calls when `-` is used
    between two `Vector3` instances.
  - *Implementation:*
    `def __sub__(self, other): return Vector3(self.x - other.x, self.y - other.y, self.z - other.z)`
    — same shape as `__add__`, with subtraction in place of addition.
  - *Its use:* `align3d()` in the original script computes
    `delta = np.array(stationary.center) - np.array(moving.center)` and
    `deltas = closest - points` — both are point-to-point differences.
    `__sub__` makes `stationary_center - moving_center` valid directly on
    our own `Vector3` objects, with no array conversion needed.
  - *Type:* an instance method, dunder, invoked implicitly through `-`.
  - *Responsibility:* to define what `-` means for two `Vector3`
    instances — component-wise subtraction, order-sensitive
    (`a - b` is not `b - a`) — and to return a new instance.
  - *Depends on:* the same as `__add__` — two existing `Vector3`
    instances and `Vector3.__init__` to build the result.
  - *Connects to:* called automatically by `-`; internally calls
    `Vector3.__init__` once. Alongside `__add__`, this is what Lesson 15
    (multi-pass alignment) will build its optimizer on top of.
  - *Shape:* same layer as `__add__` — part of `Vector3` itself.

---

## Concept Unit: Teaching Arithmetic to an Object

### The Problem

Lesson 1 ended with real proof that `Vector3` doesn't understand `+`
yet: `a + b` on two `Vector3` instances raises
`TypeError: unsupported operand type(s) for +: 'Vector3' and 'Vector3'`.
Meanwhile, `align3d()` in the original script leans on exactly this kind
of arithmetic constantly — `stationary.center - moving.center`,
`moving_points + delta`, `closest - points` — and it only works there
because `numpy` arrays happen to already have addition and subtraction
built in. We didn't get that for free; we built `Vector3` ourselves, so
we have to teach it ourselves too.

> **Before reading on, try this yourself:** in Python, `3 + 4` works,
> and so does `"a" + "b"` (string concatenation) — two completely
> different behaviors from the exact same `+` symbol, depending on the
> type on the left. What does that tell you about whether `+` has one
> fixed meaning built into the language, or whether each type gets to
> decide what `+` does *to it*? Given that `__init__` (Lesson 1) is a
> method Python calls automatically rather than one you call by name —
> what would you guess the name of the method is that Python calls
> automatically for `+`, if that naming pattern held?

### Introduce the Concept in Isolation

The smallest version of "teach a plain object what `+` and `-` mean,"
run for real, nothing else mixed in:

```python
# Throwaway lab: can we teach a plain object what "+" and "-" mean?
class Pair:
    def __init__(self, a, b):
        self.a = a
        self.b = b

    def __add__(self, other):
        return Pair(self.a + other.a, self.b + other.b)

    def __sub__(self, other):
        return Pair(self.a - other.a, self.b - other.b)

p1 = Pair(1, 2)
p2 = Pair(10, 20)

added = p1 + p2
print(added.a, added.b)

subtracted = p2 - p1
print(subtracted.a, subtracted.b)
```

Real output from running this:

```
11 22
9 18
```

This proves the guess from the Socratic prompt above was right:
`__add__` really is the method `+` dispatches to, and it dispatches
*only* because we wrote it — a `Pair` with no `__add__` would still
raise the exact same `TypeError` `Vector3` did at the end of Lesson 1.
`p1 + p2` never once appears inside `__add__`'s own body, and yet
writing `p1 + p2` at the call site is what caused `__add__` to run at
all — that's **operator dispatch**: Python silently rewrote
`p1 + p2` into `p1.__add__(p2)` before it ever got to your code. The
second line proves order matters for subtraction the way it should:
`p2 - p1` correctly gives `(9, 18)`, not `(-9, -18)` — `self` is the
left operand, `other` is the right one, and the method body respects
that ordering.

### Discard the Throwaway Example

This `Pair` class is discarded now. `Vector3` gets the real versions of
`__add__` and `__sub__` next.

### Project Change

- **Reference Source:** `diff3d.py`, `align3d()` — three specific lines:
  `delta = np.array(stationary.center) - np.array(moving.center)`,
  `points = moving_points + delta` (inside `sqdists`), and
  `deltas = closest - points` (also inside `sqdists`). All three are
  point-to-point or point-to-vector arithmetic, currently only possible
  because both sides have already been converted to `numpy` arrays.
- **Files affected:** modify `src/vector3d/vector.py` (created in
  Lesson 1).
- **Change type:** add (two new methods; `__init__` from Lesson 1 is
  untouched).
- **Location:** inside `class Vector3:`, directly after `__init__`.
- **Dependencies:** the `Vector3` class and its `__init__` from Lesson 1
  must already exist — these methods construct their return values by
  calling it.

### The New Code

Add these two methods, indented inside `class Vector3:`, right after
`__init__`:

```python
    def __add__(self, other):
        return Vector3(self.x + other.x, self.y + other.y, self.z + other.z)

    def __sub__(self, other):
        return Vector3(self.x - other.x, self.y - other.y, self.z - other.z)
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
 7      def __add__(self, other):                                       # ← new
 8          return Vector3(self.x + other.x, self.y + other.y, self.z + other.z)  # ← new
 9
10      def __sub__(self, other):                                       # ← new
11          return Vector3(self.x - other.x, self.y - other.y, self.z - other.z)  # ← new
```

As a whole, `Vector3` now supports the two operators the alignment math
needs: any two instances can be added or subtracted with plain `+` and
`-`, each producing a brand-new `Vector3` rather than changing either
operand — `Vector3.__init__` (line 2) is what both new methods build
their result through.

### Mechanical Walkthrough

Every distinct syntactic element in the New Code block, in order:

- **`def __add__(self, other):`**
  - `def` — the same function-definition keyword from Lesson 1, once
    again defining a method rather than a free function.
  - `__add__` — the specific dunder name Python's operator dispatch
    looks for when it evaluates `a + b` and `a` is a `Vector3`. The name
    is not arbitrary or a convention you chose — it's the exact name
    Python's `+` operator is hard-wired to look for.
  - `self` — same role as in `__init__` (Lesson 1): the specific
    instance the method is running against — here, specifically the
    *left-hand* operand of `+`.
  - `other` — an ordinary parameter name (no special meaning to Python,
    unlike `self` and `__add__`) holding whatever was on the *right-hand*
    side of `+` — in the intended usage, another `Vector3`, though
    nothing in this line enforces that yet.
- **`return Vector3(self.x + other.x, self.y + other.y, self.z + other.z)`**
  - `return` — the same keyword from ordinary functions; here it hands
    back the freshly built `Vector3`, ending the method call.
  - `Vector3(...)` — a call to `Vector3.__init__` (Lesson 1) again,
    exactly like `Vector3(1.0, 2.0, 3.0)` in Lesson 1's Run It — this is
    the instantiation from Lesson 1 happening a second time, now from
    inside another method instead of top-level code.
  - `self.x + other.x` (and identically for `.y`, `.z`) — ordinary `+`
    between two plain numbers (whatever was stored on each `Vector3` by
    `__init__`), the same numeric addition Python has always supported;
    nothing about *this* `+` is new — it's the *outer* `+` (the one
    between two `Vector3`s, at the call site) that required `__add__` to
    exist at all.
- **`def __sub__(self, other):`** and the line below it — identical
  treatment to `__add__` above, with two differences worth naming
  explicitly rather than waving through as "the same thing": the dunder
  name is `__sub__`, which is the name `-` dispatches to (a different,
  separately hard-wired name from `__add__` — Python does not infer
  `__sub__` from the existence of `__add__`), and the arithmetic inside
  is `self.x - other.x` rather than `+`, which is what makes the
  resulting operator subtract instead of add. `self` still means "the
  left-hand operand," so `a - b` correctly computes `a`'s coordinates
  minus `b`'s, never the reverse.

### CS Lens

This is **operator overloading**, sitting on top of the more general
mechanism of **dynamic method dispatch based on type** — the same
underlying idea from a computer-science standpoint as method resolution
in general: an operation's actual behavior is decided by the type it's
invoked on, resolved at the moment the operation runs, not fixed once
for all types everywhere.

Also recognized in: C++'s `operator+` overloading (explicit, similar
syntax to this); Python's own built-in types reusing `+` for both
integer addition and string concatenation (the exact asymmetry the
Socratic prompt above pointed at); `numpy` itself defining `__add__` on
its array type, which is the entire reason
`np.array(a) - np.array(b)` works in the original script; date-and-time
libraries overloading `+`/`-` so `datetime + timedelta` gives back
another `datetime`; Haskell's `Num` type class, which formalizes "what
does `+` mean for this type" as an explicit, checked contract rather
than an implicit convention.

### SE Lens

The principle here is **consistency of interface** — making a
user-defined type behave, syntactically, like the built-in numeric types
Python already provides, so code that uses `Vector3` reads the same way
code using plain numbers does.

The alternative not chosen: free-standing functions,
`add_vectors(a, b)` and `subtract_vectors(a, b)`, called explicitly
instead of relying on `+`/`-`. That alternative is not unreasonable —
it's arguably more explicit about what's happening, and it avoids one
real risk operator overloading introduces: `+` now *looks* like plain
arithmetic at every call site, but a reader has to already know
`Vector3` defines `__add__` to know that `a + b` doesn't, say, raise an
error or silently do something unexpected. The tradeoff made here is
readability-at-the-call-site (`moving_point + delta` reads exactly like
the original script's `points + delta`) against needing the reader to
know, once, that `Vector3` supports this.

The honest debt this project is currently carrying: neither `__add__`
nor `__sub__` checks that `other` is actually a `Vector3`. Calling
`Vector3(1,2,3) + 5` right now fails with an `AttributeError` (`'int'
object has no attribute 'x'`) rather than a clear, intentional error
message — a real bug for a later user of this class to hit, deferred
for now because nothing in this curriculum's own code calls `Vector3`
with mismatched types, but worth remembering if `Vector3` is ever reused
outside this project.

### Commands Needed

None new — this lesson only edits the existing `vector.py`.

### Run It

```bash
python3 -c "
import sys
sys.path.insert(0, 'src')
from vector3d.vector import Vector3

stationary_center = Vector3(0.0, 0.0, 0.0)
moving_center = Vector3(5.0, -1.0, 2.0)

delta = stationary_center - moving_center
print(delta.x, delta.y, delta.z)

moving_point = Vector3(1.0, 1.0, 1.0)
shifted = moving_point + delta
print(shifted.x, shifted.y, shifted.z)
"
```

Real output:

```
-5.0 1.0 -2.0
-4.0 2.0 -1.0
```

This is `align3d()`'s own logic, on our own objects: a `delta` computed
by subtracting one center from another, then used to shift a point by
addition — exactly `stationary.center - moving.center` followed by
`moving_points + delta` in the original script, with no `numpy`
anywhere.

### Connect

`Vector3` can now do the two operations `align3d()` actually needs
point arithmetic for. What it still can't do: print anything useful
(`print(delta)` still falls back to a bare memory address, exactly as
`print(p)` did in Lesson 1), or be meaningfully compared with `==` — two
`Vector3`s holding identical coordinates right now count as *different*
objects as far as Python's default equality is concerned. Lesson 3
fixes both.

---

## Try It Yourself

Type `__add__` and `__sub__` into your own `vector.py` (not copy-pasted)
and confirm the `Run It` output above with your own numbers. Then, once
that works, try this and look closely at what actually prints:

```python
a = Vector3(1, 2, 3)
b = Vector3(1, 2, 3)
print(a == b)
```
