# Lesson 10: Dunder Methods and Operator Overloading — `__len__` and `__eq__`

**What you will build.** You'll call `len()` on a class that doesn't
support it and read the exact `TypeError` Python produces, then add one
method — `__len__` — and watch `len()`, and even plain `if some_object:`
truthiness checks, start working correctly with zero other changes.
You'll then compare two instances of an ordinary class with `==` and
confirm, directly, that it's really Lesson 1's `is` in disguise —
before adding `__eq__` to get genuine value-based comparison, and
running straight into a sharp, real consequence almost nobody expects
the first time: doing so silently makes your objects unhashable,
provably breaking `hash()`, sets, and dict keys, until you deal with it
explicitly. You'll then close a real, existing awkwardness in the
project: `main.py` has been writing `len(list(my_tasks))` since Lesson
8 because `TaskList` has no `__len__` of its own, and two `TaskList`s
holding identical tasks have compared unequal via `==` since Lesson 5,
because — as you'll now be able to state precisely — Python was
defaulting to identity comparison the entire time. The transferable
problem: `len()`, `==`, and truthiness checks are not language-level
special cases at all — they're each one specific dunder method away
from your own classes participating fully, and this exact mechanism is
what C#'s operator overloading (`==`, custom `Equals()`/`GetHashCode()`
pairs), Java's `equals()`/`hashCode()` contract, and JavaScript's
`Symbol.iterator`-style protocol methods are all doing under their own
syntax. The hashability trap this lesson proves directly — override
equality, silently lose hashability — is a real, well-known gotcha in
Java too (`equals()`/`hashCode()` have an identical must-go-together
contract), so this lesson isn't just Python trivia; it's a rule you'll
need again.

**What you need to know first.** Lesson 9's proof that `class`,
`__init__`, and method definitions work by the bound-method mechanism,
and its full treatment of dunder methods as a category (`__repr__`,
`__iter__`, `__enter__`/`__exit__` from earlier lessons) — this lesson
extends that exact category to two new members, `__len__` and `__eq__`,
and assumes you already accept "a built-in function or operator
secretly calls a specific dunder method" as an established pattern,
not something to re-argue from scratch. Lesson 1's `is`-versus-`==`
distinction is revisited directly and precisely: this lesson's second
unit proves, with real output, that an ordinary class's default `==`
behavior *is* Lesson 1's `is` check, under a different name, until you
override it.

**Terms used in this lesson**

- **`__len__`** — a dunder method a class can define to report how many
  elements an instance contains, called automatically by the built-in
  `len()` function. This term exists because it's the direct, provable
  fix for the exact `TypeError` this lesson's first unit triggers on
  purpose — a class with no `__len__` simply doesn't support `len()` at
  all, and this method is the entire, minimal fix.
- **Truthiness** — whether an object counts as `True` or `False` in a
  boolean context (an `if` condition, a `while` condition, `bool(x)`
  directly) when it isn't already a plain `bool`. This term exists
  because this lesson's first unit proves a specific, easy-to-miss
  fallback rule: an object with `__len__` but no separate `__bool__` is
  automatically falsy when empty (`len(x) == 0`) and truthy otherwise —
  a real, useful default this curriculum hasn't stated explicitly until
  now, though it's been silently true of every `list`, `dict`, and `str`
  this curriculum has ever written an `if` check against.
- **`__eq__`** — a dunder method a class can define to control what
  `==` (and, by a documented, automatic relationship, `!=`) actually
  compares, called automatically whenever `==` is evaluated with an
  instance of that class on the left side. This term exists because
  this lesson's second unit proves directly what `==` does by default,
  without it, and what changes the moment a class defines its own.
- **`NotImplemented`** — a special built-in singleton value (not the
  same as raising `NotImplementedError`, a genuinely different, easily
  confused thing) that a comparison method like `__eq__` can return to
  say "I don't know how to compare against this other type — let Python
  try the other object's own comparison method instead, or fall back to
  its own default if that fails too." This term exists because this
  lesson's second unit's own `__eq__` implementation returns it
  deliberately, and understanding why is part of writing a correct
  `__eq__`, not an optional refinement.
- **Hashable** — an object that supports `hash()`, meaning it can be
  used as a dict key or stored in a `set`. This term exists because
  this lesson's second unit proves, directly and by surprise, that
  defining `__eq__` on a class removes this property automatically,
  unless a matching `__hash__` is defined too — a real, sharp
  consequence this lesson treats as a first-class fact to know, not a
  footnote.
- **The `__eq__`/`__hash__` contract** — the documented rule that two
  objects considered equal by `__eq__` must also produce the identical
  `hash()` value, because a dict or set relies on this exact
  relationship to find a key correctly. This term exists to name the
  underlying reason Python disables the default `__hash__` the moment
  a class defines its own `__eq__`: an inherited, identity-based
  `__hash__` sitting next to a new, value-based `__eq__` would silently
  violate this contract, and Python's actual behavior — disabling
  `__hash__` automatically — is a deliberate refusal to let that happen
  quietly.

**Objects and methods used**

- **`len`**
  - *What it is:* The same built-in function first named, though not
    fully treated, back in Lesson 8's "Everything else" section — given
    its own complete treatment here, restated per the Repetition Rule.
  - *Implementation:* `len(object) -> int`. Takes one argument; calls
    its `__len__` method and returns whatever integer it produces.
  - *Its use:* This lesson's first unit needs the exact built-in whose
    entire mechanism this unit is reverse-engineering — calling it on a
    class with no `__len__` is what produces this unit's own opening
    `TypeError`.
  - *Type:* A built-in free function.
  - *Responsibility:* Its full charter is calling the given object's own
    `__len__` and returning its result — nothing about counting
    anything itself; the counting logic belongs entirely to whatever
    `__len__` the object's class actually defines.
  - *Depends on:* A single argument — any object; specifically, one
    whose class defines `__len__`, or `len()` raises `TypeError`.
  - *Connects to:* Called directly throughout this lesson's first lab
    and in the project's own updated `main.py`; calls the argument's
    `__len__` method (found via the MRO, per Lesson 9's own mechanism);
    returns its result unchanged.
  - *Shape:* Always a plain, non-negative `int`.

- **`hash`**
  - *What it is:* A built-in function, available everywhere with no
    import.
  - *Implementation:* `hash(object) -> int`. Takes one argument; calls
    its `__hash__` method and returns whatever integer it produces, or
    raises `TypeError` if the object has no usable `__hash__` at all.
  - *Its use:* This lesson's second unit needs a direct, checkable way
    to prove the sharp consequence of defining `__eq__`: calling
    `hash()` before and after adding `__eq__` to an otherwise-identical
    class is the exact experiment that exposes it.
  - *Type:* A built-in free function.
  - *Responsibility:* Call the given object's `__hash__` and return its
    result, or propagate a `TypeError` if `__hash__` is `None` — which,
    per this lesson's second unit's own proof, is exactly the state
    Python sets it to automatically the moment a class defines
    `__eq__` without also defining `__hash__`.
  - *Depends on:* A single argument — any object.
  - *Connects to:* Called directly in this lesson's second lab; every
    ordinary object (including instances of a class with no `__eq__` of
    its own) has a working, inherited, identity-based `__hash__` by
    default — this lesson's second unit proves exactly when and why
    that default stops being available.
  - *Shape:* An `int` on success; a raised `TypeError` when the object
    isn't hashable at all.

**Everything else in the file, not this lesson's subject but still explained.**

- **`print`, `type`, `isinstance`, `is`**
  - All fully covered in previous lessons and reappearing here
    unchanged; used throughout this lesson's labs exactly as already
    established.

---

## Concept Unit: `__len__` — What `len()` Actually Calls

### The Problem

`len()` has worked, without comment, on every `list`, `dict`, `str`,
and `TaskList` (via the workaround `len(list(my_tasks))`) this
curriculum has used. `TaskList` itself, though, has never defined
`__len__` — Lesson 8's own `main.py` had to convert it to a real `list`
first, via `list(reloaded_tasks)`, before `len()` would even accept it.
Why does `len()` refuse a `TaskList` directly, when it happily works on
the plain list `TaskList.__iter__` delegates to internally?

> **Before reading on:** Lesson 9 already established the pattern this
> curriculum has repeated for every built-in mechanism so far —
> `for` calls `__iter__`; `with` calls `__enter__`/`__exit__`;
> `print()`/`str()` call `__repr__`/`__str__`. If `len()` follows the
> identical shape, what single dunder method would you guess it's
> looking for on whatever object it's given — and what do you predict
> happens, specifically, if that method simply doesn't exist on the
> object's class at all? An error immediately, or some kind of silent,
> incorrect fallback?

### Isolating the Concept

```python
class Bag:
    def __init__(self, items):
        self.items = items

b = Bag([1, 2, 3])
len(b)
```

Real output:

```
TypeError: object of type 'Bag' has no len()
```

An immediate, honest `TypeError` — no silent fallback, no guessing.
The message itself is direct proof of the mechanism: `"object of type
'Bag' has no len()"` — Python isn't complaining that `Bag` holds the
wrong kind of data; it's stating outright that `Bag`'s class defines no
`len()`-supporting method at all.

```python
class BagWithLen:
    def __init__(self, items):
        self.items = items

    def __len__(self):
        return len(self.items)

b2 = BagWithLen([1, 2, 3])
print(len(b2))
```

Real output:

```
len(b2): 3
```

Adding **`__len__`** (defined in Terms, above) — a method taking only
`self`, returning an `int` — is the entire fix. `len(b2)` now works,
calling `b2.__len__()` automatically and returning whatever it
produces, exactly the "built-in calls a specific dunder method" pattern
Lesson 9 already established for `repr()`/`str()`.

A second lab exposes a genuinely useful side effect most people never
deliberately test:

```python
empty = BagWithLen([])
print(bool(empty))
print(bool(b2))
if empty:
    print("truthy")
else:
    print("falsy")
```

Real output:

```
bool(empty): False
bool(b2): True
empty is falsy
```

Neither `BagWithLen` class defines `__bool__` (a separate dunder method
this lesson doesn't otherwise cover, controlling truthiness directly).
And yet `bool(empty)` is correctly `False`, and `bool(b2)` is correctly
`True` — this is called **truthiness**'s fallback rule (defined in
Terms, above): when a class has no `__bool__` of its own, Python falls
back to `__len__`, treating an object with `len() == 0` as falsy and
anything else as truthy. This is exactly why `if some_list:` has always
correctly detected an empty list throughout this curriculum, without
this curriculum ever having named the mechanism behind it until now.

### Discarding the Example

Both throwaway classes shown here — `Bag` and `BagWithLen` — are
deleted now and won't appear in later lessons or project code. They
existed only to isolate exactly what `len()` calls, and the truthiness
fallback that comes along with defining it.

### Project Change

No project change in this unit — the actual project application,
adding `__len__` (and `__eq__`, from the next unit) directly to
`TaskList`, arrives in this lesson's third unit.

### Mechanical Walkthrough

- `class Bag:` / `def __init__(self, items):` / `self.items = items` —
  a `class` statement, method definition, and instance-attribute
  assignment (Lesson 5, restated per the Repetition Rule).
- `b = Bag([1, 2, 3])` — constructs a new `Bag` instance (Lesson 5,
  restated per the Repetition Rule), given a list literal (Lesson 1,
  restated per the Repetition Rule).
- `len(b)` — a call to the `len` built-in (full treatment in Objects
  and methods, above); internally attempts to call `b.__len__()`, finds
  no such method defined anywhere in `Bag`'s own MRO (Lesson 9's own
  mechanism, restated per the Repetition Rule), and raises `TypeError`
  directly, with a message naming the exact type that lacks it.
- `def __len__(self):` — a method definition (Lesson 5, restated per
  the Repetition Rule); `__len__` (defined in Terms, above), taking
  only `self`.
- `return len(self.items)` — a `return` statement (Lesson 2) whose
  value is a call to the *built-in* `len`, this time applied to
  `self.items` — an ordinary `list`, which already has a working
  `__len__` of its own (part of Python's own built-in `list` type, not
  written by this curriculum), so this call succeeds and returns the
  list's real element count.
- `b2 = BagWithLen([1, 2, 3])` — constructs an instance whose class does
  define `__len__`.
- `print(len(b2))` — `print` (Lesson 1, restated per the Repetition
  Rule), given the result of `len(b2)` — this time, `len()` finds
  `BagWithLen.__len__`, calls it, and returns `3`.
- `empty = BagWithLen([])` — constructs a `BagWithLen` instance wrapping
  an empty list.
- `bool(empty)` — a call to the `bool` built-in class (used as a
  callable, the same "calling a class constructs/converts" mechanism
  Lesson 5 established, applied here to Python's own built-in boolean
  type); finds no `__bool__` on `BagWithLen`, falls back to calling
  `__len__` per this unit's own finding, and treats a `0` result as
  `False`.
- `if empty:` — an `if` statement (Lesson 2, restated per the Repetition
  Rule) whose condition is `empty` itself, not an explicit comparison;
  Python evaluates any object's truthiness the identical way `bool()`
  does, via the same `__bool__`-then-`__len__` fallback.

### CS Lens

This is a hard concept — operator and built-in behavior fully governed
by an overridable, documented protocol, extended here to a specific new
pair (`len()`/truthiness) — so, per the Repetition Rule, several
unrelated recurrences:

```
Also recognized in: C#'s ICollection.Count property (the direct
counterpart to __len__ — a class opts into supporting a "how many
elements" query by implementing this specific, documented member),
Java's Collection.size() (the identical role under a different name),
JavaScript's `.length` property (though notably a plain property
rather than a called method in JavaScript's case — still the same
underlying idea of a class deciding how many elements it reports), and
truthiness/falsiness conventions across scripting languages generally
(Perl and Ruby, among others, have their own rules for what counts as
"false" for a non-boolean value — Python's specific "empty is falsy"
rule for anything with __len__ is one instance of this broader, common
language-design decision)
```

### SE Lens

The alternative — building `len()` support only into Python's own
built-in container types, with no way for a custom class to opt in at
all — was rejected for the identical reason Lesson 5 already
established for `for`/`__iter__`: an open, documented protocol lets any
class participate correctly in `len()`, truthiness checks, and anything
else that relies on either, with zero special-casing anywhere in
Python's own built-in machinery. The real, honest cost: `__len__` is
*expected*, by convention, to be a cheap, fast operation — Python's own
`bool()` fallback calls it eagerly, on every single truthiness check, so
a `__len__` implementation that's slow (recomputing something expensive
every single call, rather than returning an already-tracked count)
would silently make ordinary `if some_object:` checks slow too, in a
way that's easy to overlook because nothing about the syntax hints at
the cost.

### Commands Needed

Run the same way as every previous lesson: `python3 lab1.py`. Nothing
new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
both labs.

### Connection

This unit proved `len()` and truthiness both reduce to a single dunder
method, `__len__`. The next unit asks the identical question about
`==` — what does it actually call, and what happens when a class
defines nothing to answer it?

---

## Concept Unit: `__eq__` — What `==` Actually Compares, and the Hashability Trap

### The Problem

Lesson 1 proved `is` checks identity and `==` checks value — but for a
custom class this curriculum has never defined `__eq__` on, what does
`==` actually compare? Is it already doing some kind of sensible,
attribute-by-attribute comparison automatically, the way it does for a
`list` or a `dict`, or is something else going on?

> **Before reading on:** think back to Lesson 1's own list example —
> `a = [1, 2, 3]`, `b = [1, 2, 3]` — where `a == b` was `True` even
> though `a is b` was `False`, because `list.__eq__` compares contents.
> If a plain, custom class defines no `__eq__` of its own at all, would
> you expect `==` between two of its instances to behave the identical
> way — comparing whatever attributes the instances happen to hold — or
> would you expect it to fall back to something else entirely, given
> that nothing in a bare `class Point:` definition tells Python what
> "equal" should even mean for a `Point`?

### Isolating the Concept

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p1 = Point(1, 2)
p2 = Point(1, 2)
print(p1 == p2)
print(p1 == p1)
print(p1 is p2)
```

Real output:

```
p1 == p2: False
p1 == p1: True
p1 is p2: False
```

`p1 == p2` is `False`, even though both hold identical `x` and `y`
values — and `p1 == p1` is `True`. This is exactly Lesson 1's `is`
check, in disguise: with no `__eq__` defined, `Point` inherits a
default `__eq__` from `object` (per Lesson 9's own MRO mechanism) that
simply checks identity — `p1 == p2` behaves identically to `p1 is p2`,
and the real output above confirms it directly. A class with no
`__eq__` is also, by default, genuinely hashable:

```python
print(hash(p1))
```

Real output (a real, environment-dependent integer, confirming this
succeeds at all rather than raising):

```
hash(p1): 8785206181880
```

Adding **`__eq__`** (defined in Terms, above) changes the comparison
behavior directly:

```python
class EqPoint:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __eq__(self, other):
        if not isinstance(other, EqPoint):
            return NotImplemented
        return self.x == other.x and self.y == other.y

e1 = EqPoint(1, 2)
e2 = EqPoint(1, 2)
print(e1 == e2)
print(e1 == 5)
```

Real output:

```
e1 == e2: True
e1 == 5: False
```

`e1 == e2` is now `True` — real, value-based equality, comparing `x`
and `y` directly rather than identity. The `isinstance` check at the
top of `__eq__` is what makes `e1 == 5` correctly return `False` rather
than crashing: when `other` isn't even an `EqPoint`, `__eq__` returns
**`NotImplemented`** (defined in Terms, above) — not the same as
returning `False` directly — telling Python "I don't know how to
compare against this," which lets Python try `5`'s own `__eq__` next
(an int comparing itself to an `EqPoint` correctly says "no" too), and
only if *both* sides give up does `==` finally settle on `False` as an
honest last resort.

The sharp, easy-to-miss consequence:

```python
try:
    hash(e1)
except TypeError as e:
    print(e)
```

Real output:

```
TypeError: unhashable type: 'EqPoint'
```

Simply defining `__eq__`, with no mention of `__hash__` anywhere in
`EqPoint`'s own code, made `EqPoint` instances **unhashable** (defined
in Terms, above) — `hash(e1)` now fails outright, where `hash(p1)`,
on the plain `Point` class with no `__eq__` at all, worked fine. This
is called **the `__eq__`/`__hash__` contract** (defined in Terms,
above): a dict or set relies on the guarantee that two objects
considered equal produce the identical hash — `Point`'s inherited,
identity-based `__hash__` would directly violate that guarantee if left
paired with `EqPoint`'s new, value-based `__eq__` (two genuinely
different objects, `e1` and `e2`, are now `==`, but would still hash
differently under an identity-based `__hash__`, exactly the
inconsistency the contract forbids) — so Python disables `__hash__`
automatically, the instant a class defines `__eq__` without also
explicitly defining a matching `__hash__`, rather than silently letting
that broken combination exist.

A final lab proves this isn't a narrow, abstract restriction:

```python
try:
    {e1, e2}
except TypeError as e:
    print(e)
```

Real output:

```
TypeError: unhashable type: 'EqPoint'
```

A `set` literal containing `EqPoint` instances fails immediately, for
the identical reason — a `set`, and a `dict`'s keys, both require every
element to be hashable, and `EqPoint`, as currently written, no longer
is.

### Discarding the Example

Both throwaway classes shown here — `Point` and `EqPoint` — are
deleted now and won't appear in later lessons or project code. They
existed only to isolate exactly what `==` compares by default, and the
real, checkable consequence of overriding it without also addressing
hashability.

### Project Change

No project change in this unit — the actual project application,
adding both `__len__` (from the previous unit) and `__eq__` directly to
`TaskList`, arrives in the next unit.

### Mechanical Walkthrough

- `class Point:` / `__init__` — the same pattern as this lesson's first
  unit's classes.
- `p1 == p2` — the `==` operator (Lesson 1, restated per the Repetition
  Rule), which, per this unit's own finding, resolves to `Point`'s
  inherited, default `__eq__` (found via the MRO, per Lesson 9's own
  mechanism), which itself performs an identity check.
- `hash(p1)` — a call to the `hash` built-in (full treatment in Objects
  and methods, above); `Point`'s inherited, default `__hash__` succeeds,
  since nothing about `Point`'s own class definition has disabled it.
- `def __eq__(self, other):` — a method definition; `__eq__` (defined
  in Terms, above), taking `self` and one additional parameter, `other`
  — the object on the right-hand side of `==`.
- `if not isinstance(other, EqPoint):` — an `if` statement (Lesson 2,
  restated per the Repetition Rule) whose condition uses `isinstance`
  (Lesson 2, restated per the Repetition Rule), checking whether
  `other` is even the right kind of object to compare against at all.
- `return NotImplemented` — a `return` statement (Lesson 2) whose value
  is the built-in singleton `NotImplemented` (defined in Terms, above)
  — a real, specific value Python's own `==` machinery checks for and
  reacts to specially, distinct from an ordinary `return False`.
- `return self.x == other.x and self.y == other.y` — a `return`
  statement whose value combines two `==` comparisons (each an ordinary
  int comparison, per Lesson 1) with the `and` operator (new to this
  curriculum's explicit walkthroughs, though self-explanatory: evaluates
  to `True` only if both sides are `True`).
- `e1 == e2` — the `==` operator, this time resolving to `EqPoint`'s own
  `__eq__`, which runs the `isinstance` check (passes, since `e2` is an
  `EqPoint`) and then the attribute comparison, returning `True`.
- `e1 == 5` — the `==` operator; `EqPoint.__eq__(e1, 5)` runs first,
  its `isinstance(5, EqPoint)` check fails, and it returns
  `NotImplemented`; Python then tries `(5).__eq__(e1)` (an int
  comparing itself to an `EqPoint`), which also can't make sense of the
  comparison and returns `NotImplemented` too; with both sides
  exhausted, Python's own `==` machinery falls back to `False` as the
  final answer — genuinely narrow machinery this lesson doesn't cover
  further, beyond confirming the observed, real result.
- `hash(e1)` — a call to `hash`; `EqPoint`'s `__hash__`, per this unit's
  own finding, has been automatically set to `None` the moment
  `__eq__` was defined without an accompanying `__hash__`; calling
  `hash()` on an object whose `__hash__` is `None` raises `TypeError`
  directly.
- `{e1, e2}` — a set literal (Lesson 7, restated per the Repetition
  Rule), attempting to construct a new `set` containing both objects;
  building a set requires hashing each element as it's added, so this
  fails for the identical reason `hash(e1)` alone already did.

### CS Lens

This is a hard concept — the formal relationship between equality and
hashing, and the real consequence of breaking it — so, per the
Repetition Rule, several unrelated recurrences:

```
Also recognized in: Java's equals()/hashCode() contract (documented
explicitly, by name, in Java's own standard library — overriding
equals() without also overriding hashCode() is a well-known, common
real-world bug, producing broken HashMap/HashSet behavior, the
identical failure shape this unit's own {e1, e2} lab demonstrates), C#'s
Equals()/GetHashCode() pair (the same contract, same name pattern,
same consequence of violating it), database indexing (a table index
built on a column implicitly assumes that "equal" values genuinely
belong together in the index's own internal structure — a broken
equality definition would corrupt lookups the same way a broken
hash/equality pair corrupts a Python set), and mathematical equivalence
relations generally (a well-formed notion of "equal" is expected to be
reflexive, symmetric, and transitive — properties this lesson's own
EqPoint.__eq__ happens to satisfy, and properties a hash function
consistent with it is required to respect)
```

### SE Lens

The alternative — letting a class define `__eq__` and simply leaving
its old, inherited, identity-based `__hash__` in place, unchanged and
unwarned — was rejected specifically because it would silently violate
the equality/hash contract this unit's own labs demonstrate the real
cost of: two objects that are genuinely `==` would still hash
differently, which corrupts a `dict` or `set`'s ability to find a key
correctly (a lookup for `e1` might miss an entry actually stored under
the equal-but-differently-hashed `e2`). Python's actual choice —
disabling `__hash__` automatically, forcing a loud `TypeError` the
moment it's actually used, rather than a silent, subtle data-structure
corruption — is a deliberate "fail loud, immediately" design, the same
philosophy Lesson 2's own `isinstance` guard clauses embodied at a
trust boundary. The real cost this leaves for anyone actually wanting
both value-based equality *and* hashability on the same class: they
have to write `__hash__` themselves, explicitly, built consistently
with `__eq__` (typically hashing the exact same fields `__eq__`
compares) — a real, additional piece of work this lesson's own
`EqPoint` deliberately leaves undone, to make the consequence of
skipping it directly visible.

### Commands Needed

Run the same way as every previous lesson: `python3 lab2.py`. Nothing
new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
every part of this unit's lab.

### Connection

This unit proved `==`'s default behavior for a custom class is really
Lesson 1's `is`, and proved the real, sharp cost of overriding it
without care. The next unit applies both this unit's `__eq__` and the
previous unit's `__len__` directly to `TaskList`, closing two real,
existing gaps this project has quietly carried since Lessons 5 and 8.

---

## Concept Unit: `__len__` and `__eq__`, Applied to `TaskList`

### The Problem

`main.py` has written `len(list(my_tasks))` since Lesson 8 — a real
workaround, forced by `TaskList` having no `__len__` of its own, that
this lesson's first unit already proved is entirely unnecessary once
the right one-method fix is added. And every `TaskList` comparison this
project could have made, since Lesson 5, would have used the exact
identity-based default this lesson's second unit just proved `==`
falls back to without an explicit `__eq__` — meaning `my_tasks ==
reloaded_tasks`, two separate `TaskList` instances holding identical
task data (proven identical by Lesson 8's own round-trip test), would
currently report `False`, purely because they're different objects, not
because their actual contents differ. Given everything the previous two
units just proved, what do both fixes actually look like, applied
directly to `TaskList`'s own existing `self._tasks` list?

> **Before reading on:** `self._tasks` is a plain `list` of `dict`s.
> Given this lesson's first unit's own `BagWithLen.__len__` — a single
> line delegating to the built-in `len()` on an internal list — what
> would the equivalent one-line `TaskList.__len__` look like? And given
> this lesson's second unit's own `EqPoint.__eq__` — comparing two
> instances' relevant attributes directly — what single comparison
> would correctly capture "these two `TaskList`s hold the same tasks,"
> given that `list == list` already does genuine, correct
> element-by-element comparison, per Lesson 1's own very first
> `a == b` example?

### Isolating the Concept

The mechanism this unit needs was already fully isolated in this
lesson's first two units — `__len__` delegating to an internal list's
own `len()`, and `__eq__` comparing two instances' relevant data
directly, guarded by an `isinstance` check exactly like `EqPoint`'s.
No further throwaway lab is needed before applying both directly, the
same "already-isolated, apply directly" pattern this curriculum has
used in every lesson's own third unit since Lesson 6.

### Discarding the Example

Not applicable — see above: this unit builds directly on the previous
units' already-isolated mechanisms, with no new throwaway script of its
own to discard.

### Project Change

- **Reference Source:** No reference counterpart — original to this
  project, same as every previous unit in this curriculum.
- **Files affected:** `project/tasks.py` (modified), `project/main.py`
  (modified).
- **Change type:** Add — `__len__` and `__eq__` methods on the existing
  `TaskList` class; `main.py` updated to use `len(my_tasks)` directly
  and to demonstrate real `TaskList` equality.
- **Location:** Both new methods are added directly after `__repr__`,
  established in Lesson 9; `main.py`'s existing `len(list(...))`
  workaround, from Lesson 8, is replaced with the direct form, and new
  equality-demonstration lines are added near the end.
- **Dependencies:** None new — `isinstance` and `==` are already
  covered in this lesson and previous ones.

### The New Code

```python
    def __len__(self) -> int:
        return len(self._tasks)

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, TaskList):
            return NotImplemented
        return self._tasks == other._tasks
```

### The Updated Project

```
tasks.py:
78  def __repr__(self) -> str:
79      return f"TaskList({self._tasks!r})"
80
81      def __len__(self) -> int:                                   # ← new
82          return len(self._tasks)                                 # ← new
83                                                                    # ← new
84      def __eq__(self, other: object) -> bool:                    # ← new
85          if not isinstance(other, TaskList):                     # ← new
86              return NotImplemented                                # ← new
87          return self._tasks == other._tasks                      # ← new
```

```
main.py:
45  print("Same number of tasks:", len(reloaded_tasks) == len(my_tasks))  # ← changed
46  print("my_tasks == reloaded_tasks:", my_tasks == reloaded_tasks)      # ← new
47  print("my_tasks == TaskList():", my_tasks == TaskList())              # ← new
48  print("len(my_tasks):", len(my_tasks))                               # ← new
```

As a whole, `TaskList` now participates correctly and directly in both
`len()` and `==`, exactly the way `list`, `dict`, and every other
built-in type this curriculum has used already do — no more converting
to a plain `list` first just to count elements, and a genuine,
content-based answer to "are these two `TaskList`s the same," rather
than the previous, silent identity-only default. `main.py`, as a whole,
now demonstrates both directly: `len(my_tasks)` instead of Lesson 8's
`len(list(my_tasks))` workaround, and a real comparison between
`my_tasks` and `reloaded_tasks` — two genuinely separate objects,
loaded independently from disk, now correctly reported as equal because
their actual task data matches.

### Mechanical Walkthrough

- `def __len__(self) -> int:` — a method definition (Lesson 5, restated
  per the Repetition Rule) with a hinted return type (Lesson 2,
  restated per the Repetition Rule); `__len__` (full treatment in this
  lesson's first unit, restated per the Repetition Rule), taking only
  `self`.
- `return len(self._tasks)` — a `return` statement whose value is a
  call to the built-in `len` (full treatment in Objects and methods,
  above), applied to the instance's own `self._tasks` — an ordinary
  `list`, whose own built-in `__len__` handles the actual counting.
- `def __eq__(self, other: object) -> bool:` — a method definition;
  `__eq__` (full treatment in this lesson's second unit, restated per
  the Repetition Rule), taking `self` and `other`, hinted as `object` —
  the most general possible type hint (per Lesson 4's own proof that
  every class ultimately descends from `object`), reflecting that
  `__eq__` genuinely might be called with *anything* on the right side
  of `==`, not only another `TaskList`.
- `if not isinstance(other, TaskList):` — an `if` statement whose
  condition uses `isinstance` (Lesson 2, restated per the Repetition
  Rule), checking whether `other` is even a `TaskList` (or a subclass
  of it, per Lesson 9's own `isinstance`/inheritance proof — meaning a
  `LoggingTaskList`, from Lesson 9, would also pass this check
  correctly).
- `return NotImplemented` — the same pattern as this lesson's second
  unit's `EqPoint.__eq__`, telling Python to try the other side's own
  comparison, or fall back to `False`, when `other` isn't a `TaskList`
  at all.
- `return self._tasks == other._tasks` — a `return` statement whose
  value is `==` (Lesson 1, restated per the Repetition Rule) applied to
  two plain lists — `self._tasks` and `other._tasks` — which, per
  Lesson 1's own very first list-equality example, already performs
  genuine, correct element-by-element comparison; because each element
  is itself a `dict`, and `dict == dict` also compares by value (key by
  key), this one line correctly captures "every task, in order, with
  identical fields" without this lesson needing to write any deeper,
  manual comparison logic at all.
- `len(reloaded_tasks) == len(my_tasks)`, in `main.py` — two calls to
  the built-in `len`, now resolving directly to `TaskList.__len__`,
  compared with `==`.
- `my_tasks == reloaded_tasks` — the `==` operator, resolving to
  `TaskList.__eq__`, comparing `my_tasks._tasks` against
  `reloaded_tasks._tasks` directly.
- `my_tasks == TaskList()` — the same `__eq__`, this time comparing
  against a genuinely empty `TaskList`; `self._tasks == other._tasks`
  compares a two-element list against an empty one, correctly returning
  `False`.

### CS Lens

This reappears both dunder mechanisms from earlier in this lesson,
restated in full per the Repetition Rule, now specifically as real,
applied fixes to two genuine gaps this project has carried since
Lessons 5 and 8:

```
Also recognized in: value objects in domain-driven design (a design
pattern explicitly built around exactly this expectation — a type
representing a value, like a Point or a Money amount, is expected to
implement equality based on its actual data, precisely the fix this
unit applies to TaskList), Python's own dataclasses module (a later
lesson in this curriculum's own roadmap; dataclasses can generate a
correct __eq__ automatically from a class's declared fields, doing
exactly what this unit wrote by hand, worth recognizing here as the
same underlying need this unit is solving manually), and test
assertion libraries generally (an assertEqual or similar test helper,
across nearly any language, relies on the object under test having a
correct, meaningful __eq__/equals() — without one, a test comparing two
"logically identical" objects would incorrectly fail, the exact
TaskList-versus-TaskList gap this unit just closed)
```

### SE Lens

The alternative — leaving `TaskList` without `__eq__`, and requiring
any code that wants to compare two `TaskList`s by content to write
`list(a) == list(b)` or similar by hand, every time — was rejected
because it's exactly the kind of repeated, easy-to-forget workaround
this lesson's own opening problem statement already named for `len()`;
centralizing the correct comparison logic once, inside `__eq__` itself,
means every future piece of code comparing two `TaskList`s gets it
right automatically, the same argument Lesson 7's `by_id()` already made
for centralizing lookup logic. The real, honest cost, worth stating
directly rather than leaving implicit: `TaskList.__eq__`, as written,
defines `__eq__` but not a matching `__hash__` — meaning, per this
lesson's second unit's own proof, `TaskList` instances are now
unhashable, exactly like `EqPoint`. This is a real, deliberate
trade-off, not an oversight: `TaskList` is a mutable container (`add`
can change its contents at any time, per Lesson 5), and a genuinely
correct `__hash__` would need to stay consistent with `__eq__` even as
`_tasks` changes — a mutable object with a stable hash is a well-known
, separate hazard (its hash could go stale the moment its contents
change, breaking a dict or set it's already stored in), which is
exactly why Python's own built-in `list` and `dict` types are
themselves unhashable too — `TaskList` inheriting that same
unhashability, as an automatic consequence of gaining `__eq__`, is
consistent with, not a deviation from, how Python's own built-in
mutable containers already behave.

### Commands Needed

The updated project runs and checks the same way every previous
lesson's project code has: `python3 main.py`, `mypy main.py`.

### Run It

The real, updated project's relevant output:

```
Same number of tasks: True
my_tasks == reloaded_tasks: True
my_tasks == TaskList(): False
len(my_tasks): 2
```

`my_tasks == reloaded_tasks` correctly reports `True` — two genuinely
separate `TaskList` objects, one loaded fresh from `tasks.json`, now
correctly recognized as holding identical task data, exactly the fix
this unit set out to make; `my_tasks == TaskList()` correctly reports
`False` against a genuinely empty list, proving the comparison is real
and content-sensitive, not simply always `True` for any two
`TaskList`s. `mypy main.py` reports:

```
Success: no issues found in 1 source file
```

### Connection

This unit is where both of this lesson's dunder methods became real,
applied fixes: `__len__` closes the workaround `main.py` has carried
since Lesson 8, and `__eq__` closes a gap that's existed, silently,
since `TaskList` was first written in Lesson 5 — every comparison
between two `TaskList`s, until this exact unit, would have used the
identity-only default this lesson's second unit proved `==` falls back
to, with no way to tell, just by looking at a passing or failing
`my_tasks == reloaded_tasks` check, whether it was really comparing
content or merely asking "are these the same object."

---

## Connect the Pieces

Trace `my_tasks == reloaded_tasks`, from the project's own `main.py`,
through everything this lesson built. Per this lesson's second unit's
own proof, `==` resolves to `TaskList.__eq__`, called with `self` bound
to `my_tasks` and `other` bound to `reloaded_tasks` — the exact
bound-method mechanism Lesson 9 established, applied here to a
comparison operator rather than an ordinary method call.
`isinstance(other, TaskList)` passes immediately, since `reloaded_tasks`
genuinely is one; `self._tasks == other._tasks` then runs — two plain
lists of dicts, compared with the ordinary `==` Lesson 1 first
introduced all the way back in this curriculum's very first lesson,
now doing real, meaningful work at the end of a chain that started with
`my_tasks.save("tasks.json")` (Lesson 8's own `with`-guaranteed file
write) and `reloaded_tasks.load("tasks.json")` (Lesson 8's matching
read) producing two structurally identical, but genuinely
separately-constructed, lists of task dicts. Without this lesson's own
`__eq__`, this exact comparison would have silently fallen back to
identity — this lesson's second unit's own `Point`/`p1 == p2` proof,
applied here — reporting `False` regardless of how faithfully Lesson
8's save/load round trip actually preserved the data, for no reason
more meaningful than `my_tasks` and `reloaded_tasks` being, correctly
and expectedly, two different Python objects. `len(my_tasks)`, printed
immediately after, resolves identically: `TaskList.__len__`, delegating
to the built-in `len()` on `self._tasks`, closing the exact workaround
this lesson opened by naming directly.
