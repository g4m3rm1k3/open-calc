# Lesson 13: Descriptors — What `property` Actually Is Underneath

**What you will build.** You'll build a validated attribute using
`@property`, watch it correctly reject an invalid assignment, and then
hit the real limitation this approach carries the moment you need the
*identical* validation on a second attribute: a full copy-paste of the
whole getter/setter block. You'll then build the actual mechanism
`property` itself is implemented with — a class defining `__get__` and
`__set__` — and prove, directly, that a single instance of *that*
class can be attached to as many attributes as you want, with zero
duplication, something `@property` alone can't offer. You'll prove
`property` itself is a real, ordinary descriptor — not special
compiler magic — by checking `hasattr(property, '__get__')` directly.
Finally, you'll give the project's own `TaskList` a real, reusable,
validated `max_tasks` capacity attribute, built on your own descriptor
class, and watch it correctly reject a bad assignment and correctly
enforce a real capacity limit. The transferable problem: this exact
mechanism — intercepting attribute access to run custom logic instead
of a plain read/write — exists under different names everywhere:
C#'s properties (`get`/`set` accessors) are the language-level version
of precisely this; Java's convention of private fields plus explicit
getter/setter methods is the same idea without dedicated syntax for it
at all. Once you've built the actual interception mechanism by hand in
Python, you'll recognize instantly that C#'s `{ get; set; }` syntax is
solving the identical problem, just with the interception built into
the language grammar instead of a documented protocol you can
implement yourself.

**What you need to know first.** Lesson 9's full treatment of `self`,
bound methods, and dunder methods as a documented category Python's
own machinery calls automatically — this lesson's entire mechanism is
one more instance of that exact pattern, now triggered by ordinary
attribute access (`obj.attr` and `obj.attr = value`) rather than a
built-in function or operator. Lesson 12's proof that `@` syntax is
ordinary reassignment — `@property`, used in this lesson's first unit,
is decorator syntax Lesson 12 already fully explained the mechanics
of; this lesson doesn't re-derive decorators, it uses them on a
specific built-in class this curriculum hasn't yet named.

**Terms used in this lesson**

- **Descriptor** — any object whose class defines `__get__`, `__set__`,
  or both, and which is assigned as a *class* attribute (not an
  instance attribute) on some other class. This term exists to name
  the general mechanism this entire lesson reverse-engineers:
  `property` is one specific, built-in example of it, and this lesson's
  second unit builds a completely custom one from scratch to prove the
  mechanism is general, not special-cased to `property` alone.
- **`__get__`** — a dunder method (Lesson 5 introduced this term in
  full; restated per the Repetition Rule) a descriptor's class defines,
  called automatically whenever the attribute it's assigned to is
  *read* (`instance.attr`) rather than assigned. This term exists as
  half of the descriptor protocol: it's the specific method that runs
  in place of Python's ordinary attribute lookup, the moment a
  descriptor is involved at all.
- **`__set__`** — a dunder method a descriptor's class defines, called
  automatically whenever the attribute it's assigned to is *written*
  (`instance.attr = value`). This term exists as the other half of the
  descriptor protocol — together, `__get__` and `__set__` are what let
  a descriptor intercept both directions of attribute access, not just
  reading.
- **`__set_name__`** — a dunder method a descriptor's class can
  optionally define, called automatically, once, at the moment the
  class it's attached to is itself being defined — receiving the owning
  class and the specific attribute name it was assigned to. This term
  exists because a single descriptor instance, reused across multiple
  attributes (per this lesson's second unit's own proof), needs some
  way to know *which* attribute name it's actually responsible for, so
  it can store each instance's value under a distinct, private name —
  `__set_name__` is what supplies that information automatically,
  without you having to pass the name in by hand.
- **Data descriptor** — a descriptor that defines both `__get__` and
  `__set__` (as opposed to a *non-data* descriptor, defining only
  `__get__`, which this lesson doesn't build but is worth knowing
  exists — a plain method, per Lesson 9's own bound-method mechanism,
  is technically a non-data descriptor itself). This term exists
  because both this lesson's `PositiveInt` and Python's own `property`
  are specifically data descriptors — controlling both directions of
  access is the entire point of this lesson's own validation use case.

**Objects and methods used**

- **`property`**
  - *What it is:* A built-in class, available everywhere with no
    import, most commonly used as a decorator (Lesson 12, restated per
    the Repetition Rule).
  - *Implementation:* `property(fget=None, fset=None, ...)` constructs
    a real object whose class defines `__get__` and `__set__` —
    `__get__` calls whatever function was supplied as `fget`; `__set__`
    calls whatever function was supplied as `fset`. Used as
    `@property` above a method, that method becomes `fget`; a
    subsequent `@name.setter`-decorated method becomes `fset`.
  - *Its use:* This lesson's first unit needs the ordinary, everyday
    tool for attribute validation — `property` — before its second unit
    reveals that this everyday tool is itself built entirely from the
    same mechanism this lesson goes on to teach directly.
  - *Type:* A built-in class — and, per this lesson's second unit's own
    proof, a genuine data descriptor itself: `hasattr(property,
    '__get__')` and `hasattr(property, '__set__')` are both `True`.
  - *Responsibility:* Its full charter is intercepting attribute
    access on whatever class it's assigned to, routing reads through
    `fget` and writes through `fset` — nothing about storage itself;
    Lesson 13's own `Temperature` example stores its real value in a
    separately-named instance attribute (`_celsius`), which `fget`/
    `fset` read and write directly.
  - *Depends on:* The getter function (and, optionally, a setter
    function, attached afterward via the `.setter` decorator this
    lesson's first unit uses).
  - *Connects to:* Assigned as a class attribute (`celsius = property(...)`,
    or, via `@property` syntax, equivalently); Python's own attribute
    lookup machinery calls its `__get__`/`__set__` automatically,
    exactly the way this lesson's second unit proves a hand-built
    descriptor's own methods get called.
  - *Shape:* A single `property` object per decorated attribute — not
    reusable across multiple attribute names the way this lesson's
    own `PositiveInt` instance is, a real, concrete limitation this
    lesson's second unit demonstrates directly.

- **`getattr`, `setattr`**
  - *What they are:* Built-in functions, available everywhere with no
    import.
  - *Implementation:* `getattr(object, name) -> value` retrieves the
    attribute named by the string `name` off `object`, exactly as
    `object.name` would if `name` were known in advance as literal
    syntax; `setattr(object, name, value)` does the equivalent for
    assignment.
  - *Its use:* This lesson's second unit's own `PositiveInt` descriptor
    needs to store and retrieve each instance's real value under a
    name computed at runtime (built from whatever attribute name
    `__set_name__` was told about) — `getattr`/`setattr` are the tools
    that let attribute access happen with a *string* name rather than
    literal, hardcoded dot syntax.
  - *Type:* Built-in free functions.
  - *Responsibility:* Perform an ordinary attribute read or write,
    identical in effect to `object.name` or `object.name = value`, but
    parameterized by a string computed at runtime rather than fixed at
    the time the code is written.
  - *Depends on:* `getattr` needs the object and the attribute name
    (as a string); `setattr` needs those two plus the value to assign.
  - *Connects to:* Called inside `PositiveInt.__get__`/`__set__`,
    using the private name `__set_name__` computed and stored earlier;
    read and write directly into the specific instance's own
    `__dict__` — the identical real, per-instance storage Lesson 9's
    own `self.value = ...` assignments have always used, accessed here
    through a computed name instead of literal syntax.
  - *Shape:* `getattr` returns whatever the named attribute is bound to
    (or raises `AttributeError` if it doesn't exist yet); `setattr`
    returns `None`, like any assignment.

**Everything else in the file, not this lesson's subject but still explained.**

- **`print`, `type`, `isinstance`, `hasattr`**
  - `print`, `type`, and `isinstance` are all fully covered in previous
    lessons and reappear here unchanged. `hasattr(object, name) -> bool`
    is a built-in function this curriculum hasn't formally named until
    now: it reports whether accessing `name` on `object` would succeed,
    without raising if it wouldn't — used in this lesson's second unit
    specifically to check whether `property` itself defines `__get__`/
    `__set__`, without needing to actually trigger either.

---

## Concept Unit: `@property` — Intercepting Attribute Access

### The Problem

Every instance attribute this curriculum has written — `self.value`,
`self._tasks`, `self.name` — has behaved identically: assign to it, and
whatever object you assigned is simply stored, with no validation, no
matter what it is. Lesson 2's `isinstance` guards validated *function
arguments*, at the moment `create_task` was called — but nothing has
ever validated an *attribute assignment*, after an object already
exists. Can a class intercept `instance.attr = value` itself, and
reject a bad value the same way `create_task` rejects a bad argument?

> **Before reading on:** Lesson 9 already proved a method call —
> `instance.method()` — secretly runs `Class.method(instance)`,
> automatically. If Python offered a *comparable* mechanism for plain
> attribute access — `instance.attr` and `instance.attr = value` each
> secretly calling some method on the class, the way a method call
> does — what would that method need to receive, at minimum, to do
> anything useful with an assignment specifically? And what would have
> to happen inside it for an assignment like `t.celsius = -300` to
> genuinely fail, rather than silently being stored?

### Isolating the Concept

```python
class Plain:
    def __init__(self, celsius):
        self.celsius = celsius

p = Plain(25)
p.celsius = -300
print(p.celsius)
```

Real output:

```
p.celsius after an impossible assignment: -300
```

Exactly as every previous lesson's plain attributes have behaved:
nothing stops an impossible value. The fix:

```python
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def celsius(self):
        return self._celsius

    @celsius.setter
    def celsius(self, value):
        if value < -273.15:
            raise ValueError(f"temperature below absolute zero: {value}")
        self._celsius = value

t = Temperature(25)
print(t.celsius)
t.celsius = 30
print(t.celsius)
try:
    t.celsius = -300
except ValueError as e:
    print(e)
print(t.celsius)
```

Real output:

```
t.celsius: 25
t.celsius after valid assignment: 30
ValueError: temperature below absolute zero: -300
t.celsius after the rejected assignment: 30
```

`@property` (full treatment in Objects and methods, above), applied to
a method named `celsius`, turns *reading* `t.celsius` into a call to
that method — this is why `t.celsius`, with no parentheses anywhere at
the call site, still runs real code. `@celsius.setter`, applied to a
*second* method, also named `celsius`, is what makes *assignment* —
`t.celsius = 30` — call that second method instead of silently storing
the value: the assigned value, `30`, becomes that method's `value`
parameter, and the method's own body decides what to do with it —
here, validating it before actually storing it, in a differently-named
attribute, `_celsius`.

```python
print(t.__dict__)
```

Real output:

```
t.__dict__: {'_celsius': 30}
```

`t.__dict__` — the instance's own real attribute storage, per Lesson
4's own `__dict__` proof, restated here for an instance rather than a
module — contains `_celsius`, not `celsius` at all. `celsius` itself
is never stored on the instance; every access to it runs through the
`property` object's own logic instead, which happens to read and write
`_celsius` as its actual storage.

### Discarding the Example

`Plain` and `Temperature`, in this exact throwaway form, are deleted
now and won't appear in later lessons or project code. They existed
only to isolate exactly what `@property` intercepts, and to prove a
plain attribute intercepts nothing at all.

### Project Change

No project change in this unit — the real, project-facing validated
attribute, built on this lesson's own custom descriptor rather than
`@property` directly, arrives in this lesson's third unit, once the
next unit's own reusability problem is fully understood.

### Mechanical Walkthrough

- `class Plain:` / `__init__` / `self.celsius = celsius` — an ordinary
  class, method definition, and instance-attribute assignment (Lesson
  5, restated per the Repetition Rule).
- `p.celsius = -300` — an ordinary attribute assignment; with no
  `property` involved at all, this simply stores `-300` directly in
  `p`'s own `__dict__` under the key `"celsius"`.
- `class Temperature:` / `__init__` / `self._celsius = celsius` — the
  same pattern, storing into a differently-named attribute,
  `_celsius`, deliberately, so `celsius` itself is free to be
  intercepted.
- `@property` / `def celsius(self):` / `return self._celsius` — `@property`
  (full treatment above) applied as a decorator (Lesson 12, restated
  per the Repetition Rule) to this method; the method itself becomes
  the property's getter, run automatically whenever `t.celsius` is
  read.
- `@celsius.setter` / `def celsius(self, value):` — `celsius`, at this
  point, is already bound to the `property` object the previous
  `@property` line created; `.setter` is a real method on that
  `property` object, returning a *new* `property` object combining the
  original getter with this newly-decorated method as its setter; the
  name `celsius` is rebound to that new, combined `property` object.
- `if value < -273.15:` / `raise ValueError(...)` — an `if` statement
  (Lesson 2, restated per the Repetition Rule) and a `raise` (Lesson 2,
  restated per the Repetition Rule), the actual validation logic.
- `self._celsius = value` — the real storage step, run only if
  validation passes.
- `t.celsius` — attribute access; per this unit's own finding, this
  doesn't look up a plain attribute at all — it calls the `property`
  object's own getter method, which returns `self._celsius`.
- `t.celsius = 30` — attribute assignment; calls the `property`
  object's own setter method, with `30` bound to `value`.
- `t.__dict__` — attribute access (Lesson 4, restated per the
  Repetition Rule) retrieving the instance's real, underlying storage
  dict — confirming `celsius` itself was never actually stored there.

### CS Lens

This is a hard concept — attribute access itself being interceptable,
rather than always a direct, unconditional read or write — so, per the
Repetition Rule, several unrelated recurrences:

```
Also recognized in: C#'s properties (`public int Celsius { get; set;
}`, with custom logic inside either accessor — the direct, dedicated-
syntax counterpart to Python's @property, built into the language
grammar rather than a library feature), Java's getter/setter convention
(`getCelsius()`/`setCelsius(value)` — the identical underlying need,
solved with plain methods and no special interception syntax at all,
which is precisely why Java code calls `obj.getX()` explicitly rather
than `obj.x`), JavaScript's `get`/`set` object literal syntax and
`Object.defineProperty` (a near-identical mechanism to Python's own),
and spreadsheet cell formulas generally (a cell "reads" as a computed
value, not a stored one, every time it's viewed — the same "access
triggers computation, not raw storage" idea, familiar even outside
programming)
```

### SE Lens

The alternative — never intercepting attribute access at all, and
relying entirely on separate, explicitly-called methods (`get_celsius()`/
`set_celsius(value)`, the Java convention this unit's own CS Lens just
named) — was rejected by Python's own design in favor of `@property`,
specifically so that adding validation *later*, to an attribute that
started out as a plain one, doesn't require changing every single call
site that reads or writes it: `t.celsius` and `t.celsius = 30` look
identical whether `celsius` is a plain attribute or a `property` —
only `Temperature`'s own internal definition needs to change. The real
cost, which this unit's own Socratic setup for the next unit already
hints at: `@property`, as written here, is entirely specific to
`Temperature`'s own `celsius` attribute — every line of this getter/
setter pair belongs to `celsius` alone, with no way to reuse the
*pattern itself* on a different attribute without writing the whole
thing again from scratch.

### Commands Needed

Run the same way as every previous lesson: `python3 lab1.py`. Nothing
new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
every part of this unit's lab.

### Connection

This unit proved `@property` intercepts attribute access, but is tied
to one specific attribute's own getter/setter pair. The next unit asks
whether the underlying mechanism can be extracted into something
reusable — attached to as many different attributes as needed, with the
validation logic written exactly once.

---

## Concept Unit: The Descriptor Protocol — Building `property`'s Own Mechanism

### The Problem

`Temperature.celsius`'s validation logic — "reject a bad value, store
a good one" — is genuinely generic: nothing about it is specific to
temperatures at all. If a second class needed an attribute validated
the identical way (say, "must be a positive int," an entirely
different rule, but the same *shape* of problem), `@property` would
require writing an entirely new getter/setter pair, even though the
actual validation logic might be shared. What would it take to write
the validation logic exactly once, as a reusable class, and attach a
single instance of it to as many different attributes, on as many
different classes, as needed?

> **Before reading on:** `@property`, per the previous unit's own
> proof, works by creating a real object (a `property` instance) whose
> own methods get called automatically on attribute access. If that
> mechanism is genuinely available to any class, not just `property`
> itself — meaning you could write your *own* class implementing the
> identical `__get__`/`__set__` pair — what would the constructor
> arguments and stored state of such a class need to look like, for a
> *single instance* of it to be usable, correctly, on more than one
> differently-named attribute at once? What information would it need
> that `@property`'s own getter/setter methods, tied to one specific
> attribute by their very definition, never had to worry about?

### Isolating the Concept

```python
class PositiveInt:
    def __set_name__(self, owner, name):
        self._name = "_" + name

    def __get__(self, instance, owner):
        if instance is None:
            return self
        return getattr(instance, self._name)

    def __set__(self, instance, value):
        if not isinstance(value, int) or value <= 0:
            raise ValueError(f"must be a positive int, got {value!r}")
        setattr(instance, self._name, value)

class Order:
    quantity = PositiveInt()
    max_items = PositiveInt()

    def __init__(self, quantity, max_items):
        self.quantity = quantity
        self.max_items = max_items

o = Order(3, 10)
print(o.quantity)
print(o.max_items)
try:
    o.quantity = -5
except ValueError as e:
    print(e)
```

Real output:

```
o.quantity: 3
o.max_items: 10
ValueError: must be a positive int, got -5
```

This is called the **descriptor** (defined in Terms, above) protocol:
`PositiveInt` defines `__get__` (defined in Terms, above), `__set__`
(defined in Terms, above), and `__set_name__` (defined in Terms,
above) — the exact three-method contract `property` itself is built
from. `Order` uses *two separate instances* of `PositiveInt` — one for
`quantity`, one for `max_items` — with zero duplicated validation
logic; `PositiveInt`'s own body was written exactly once.

```python
print(Order.__dict__["quantity"] is Order.__dict__["max_items"])
print(o.__dict__)
```

Real output:

```
Order.__dict__['quantity'] is Order.__dict__['max_items']: False
but they store independently: {'_quantity': 3, '_max_items': 10}
```

Two genuinely separate `PositiveInt` instances (confirmed via `is`,
Lesson 1's own identity check) — each one's own `__set_name__` ran
once, at class-definition time, recording its own private storage name
(`_quantity` for one, `_max_items` for the other), which is exactly how
a single reusable descriptor *class* can back two independent
attributes without them colliding: each instance of `PositiveInt`
tracks its own `_name`, and `getattr`/`setattr` (full treatment in
Objects and methods, above) read and write under that specific,
computed name.

```python
print(Order.quantity)
print(type(Order.quantity))
```

Real output:

```
Order.quantity: <__main__.PositiveInt object at 0x7fde56cd8710>
type(Order.quantity): <class 'PositiveInt'>
```

Accessing `Order.quantity` — through the *class*, not an instance — is
exactly why `__get__` takes an `instance` parameter at all: when
`instance` is `None` (per `__get__`'s own `if instance is None: return
self` check), the descriptor itself is returned, rather than trying to
look up a value that wouldn't make sense outside any particular
`Order` instance's own data.

The final proof, closing the loop this entire lesson opened:

```python
class Temperature:
    def __init__(self, celsius):
        self._celsius = celsius

    @property
    def celsius(self):
        return self._celsius

print(type(Temperature.celsius))
print(hasattr(property, "__get__"))
print(hasattr(property, "__set__"))
```

Real output:

```
type(Temperature.celsius): <class 'property'>
hasattr(property, '__get__'): True
hasattr(property, '__set__'): True
```

`property` genuinely has `__get__` and `__set__` — it is not special,
compiler-level magic; it is an ordinary **data descriptor** (defined in
Terms, above), built from precisely the same protocol `PositiveInt`
just implemented by hand. `@property`, from this lesson's first unit,
was never a separate mechanism from this unit's own `PositiveInt` — it
was this exact mechanism, pre-written and shipped in Python's own
standard library, applied to one attribute at a time.

### Discarding the Example

`PositiveInt`, in this exact throwaway form, and `Order`, are deleted
now. The real version this curriculum keeps, applied directly to the
project, is built in the next unit using this identical pattern.

### Project Change

No project change in this unit — the real, applied version of
`PositiveInt`, attached to the project's own `TaskList`, arrives in
this lesson's third unit.

### Mechanical Walkthrough

- `class PositiveInt:` — a `class` statement (Lesson 4, restated per
  the Repetition Rule), with no inheritance from anything special — a
  descriptor is simply an ordinary class that happens to define the
  right dunder methods.
- `def __set_name__(self, owner, name):` — a method definition; `owner`
  is the class the descriptor is being attached to (`Order`, in this
  unit's example); `name` is the specific attribute name it was
  assigned to (`"quantity"` or `"max_items"`) — both supplied
  automatically by Python at class-definition time, with no code of
  `Order`'s own needing to pass them explicitly.
- `self._name = "_" + name` — an assignment statement (Lesson 1)
  computing a private storage name (`"_quantity"`, for instance) and
  storing it as an attribute *on the descriptor instance itself* — not
  on any `Order` instance yet.
- `def __get__(self, instance, owner):` — a method definition; `self`
  is the descriptor instance; `instance` is whichever `Order` object
  the attribute is being read from (or `None`, if accessed through the
  class directly); `owner` is the class itself, supplied identically to
  `__set_name__`'s own `owner` parameter.
- `if instance is None:` / `return self` — an `if` statement (Lesson 2,
  restated per the Repetition Rule) and `is` check (Lesson 1, restated
  per the Repetition Rule); when accessed via the class rather than an
  instance, the descriptor returns itself, per this unit's own
  `Order.quantity` proof.
- `return getattr(instance, self._name)` — a call to `getattr` (full
  treatment in Objects and methods, above), retrieving whatever value
  is stored on `instance` under the private name this descriptor
  computed in `__set_name__`.
- `def __set__(self, instance, value):` — a method definition; `value`
  is whatever's being assigned (`o.quantity = -5` supplies `-5` here).
- `if not isinstance(value, int) or value <= 0:` — an `if` statement
  whose condition combines `isinstance` (Lesson 2, restated per the
  Repetition Rule) with `or` (new to this curriculum's explicit
  walkthroughs, self-explanatory: `True` if either side is `True`).
- `raise ValueError(...)` — `raise` (Lesson 2, restated per the
  Repetition Rule), constructing and raising the exception.
- `setattr(instance, self._name, value)` — a call to `setattr` (full
  treatment above), storing `value` on `instance` under the computed
  private name.
- `class Order:` / `quantity = PositiveInt()` / `max_items =
  PositiveInt()` — two class-level assignments (Lesson 1, restated per
  the Repetition Rule), each constructing a genuinely separate
  `PositiveInt` instance (Lesson 5, restated per the Repetition Rule)
  and binding it as a class attribute.
- `self.quantity = quantity`, inside `__init__` — an ordinary-looking
  attribute assignment that, per this unit's own descriptor protocol,
  actually calls `PositiveInt.__set__` on the `quantity` descriptor
  instance, with `instance` bound to the `Order` object being
  constructed and `value` bound to the argument.
- `o.quantity` — attribute access that, per the same protocol, calls
  `PositiveInt.__get__`.
- `Order.__dict__["quantity"]`, `Order.__dict__["max_items"]` —
  subscript access (Lesson 3, restated per the Repetition Rule) into
  the *class's* own `__dict__` (Lesson 4, restated per the Repetition
  Rule), retrieving each descriptor instance directly, bypassing the
  descriptor protocol entirely (this is looking *at* the descriptors
  themselves, not going through them).
- `Order.quantity` — attribute access through the class, not an
  instance; per `__get__`'s own `instance is None` branch, this returns
  the descriptor object itself.
- `hasattr(property, "__get__")` — a call to `hasattr` (full treatment
  in "Everything else," above), checking whether the built-in
  `property` class itself defines `__get__` — confirming it's a real
  descriptor, not special-cased machinery outside this protocol.

### CS Lens

This is a hard concept — a general, reusable protocol for intercepting
attribute access, of which `property` is merely one built-in instance
— so, per the Repetition Rule, several unrelated recurrences:

```
Also recognized in: Python's own functools.cached_property (a real,
standard-library descriptor that computes a value once and caches it,
built on the identical __get__ mechanism this lesson just demonstrated
by hand), Django's ORM field classes (a Django model's IntegerField,
CharField, and similar are all real descriptors — assigning to
model.some_field triggers validation and type coercion the identical
way PositiveInt does here, at a much larger, production scale), C#'s
INotifyPropertyChanged pattern (a property setter that, beyond storing
a value, also fires an event notifying other code the value changed —
the identical "intercept the write, do more than plain storage"
principle), and validation libraries in many languages generally
(Java's Bean Validation / Jakarta Validation annotations like
@Min(1) on a field are a declarative, annotation-based version of the
identical validate-on-assignment idea, checked at a different point in
the object's lifecycle rather than on every single assignment)
```

### SE Lens

The alternative — writing a full, separate `@property` getter/setter
pair every time the identical validation rule is needed on a new
attribute, accepting the duplication as a fixed cost — was rejected
here in favor of extracting the shared logic into a genuinely
reusable descriptor class, precisely because `Order`'s own two
attributes, `quantity` and `max_items`, needed the *exact* same rule,
and a real codebase with many such attributes, across many classes,
would otherwise accumulate that identical getter/setter boilerplate
over and over. The real, honest cost: a custom descriptor is
genuinely more mechanism to understand correctly than `@property` — the
three-method protocol, `__set_name__`'s own timing, and the
class-versus-instance distinction `__get__`'s `instance is None` check
exists to handle are all real, additional complexity that a simple,
one-off `@property` getter/setter pair doesn't require a reader to
understand at all; reaching for a custom descriptor is worth it
specifically when the *same* validation logic is genuinely needed more
than once, not as a default replacement for `@property` in every case.

### Commands Needed

Run the same way as every previous lesson: `python3 lab2.py`. Nothing
new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
every part of this unit's lab.

### Connection

This unit proved `property` is an ordinary descriptor, and built a
reusable one from scratch. The next unit applies that exact
`PositiveInt` descriptor directly to the project — giving `TaskList` a
real, validated, enforced capacity limit.

---

## Concept Unit: `max_tasks` — A Real, Reusable Descriptor on `TaskList`

### The Problem

`TaskList`, as this curriculum has built it, has no limit on how many
tasks it can hold — `add()` simply appends, unconditionally, forever.
A real task-tracking system might reasonably want a configurable
capacity limit, and, per this lesson's own `PositiveInt`, that limit
itself should be validated — a negative or zero capacity makes no
sense and should be rejected the moment someone tries to set it, not
discovered later as some confusing downstream failure.

> **Before reading on:** `PositiveInt`, from this lesson's second unit,
> is already fully general — it knows nothing about `Order`,
> `quantity`, or `max_items` specifically; it only knows "validate a
> positive int, store it under a computed private name." Given that,
> what would need to change about `TaskList`'s own `__init__` and `add`
> methods to support a real, enforced `max_tasks` limit, reusing
> `PositiveInt` exactly as written, with zero modification to
> `PositiveInt` itself?

### Isolating the Concept

The mechanism this unit needs was already fully built in this lesson's
second unit — `PositiveInt`, a genuinely reusable descriptor requiring
no changes at all to be attached to a new class. No further throwaway
lab is needed before applying it directly to `TaskList`, the same
"already-isolated, apply directly" pattern this curriculum has used in
every lesson's own third unit since Lesson 6.

### Discarding the Example

Not applicable — see above: this unit builds directly on the previous
units' already-isolated `PositiveInt`, with no new throwaway script of
its own to discard.

### Project Change

- **Reference Source:** No reference counterpart — original to this
  project, same as every previous unit in this curriculum.
- **Files affected:** `project/tasks.py` (modified), `project/main.py`
  (modified).
- **Change type:** Add — the `PositiveInt` descriptor class; a
  `max_tasks` class attribute and an updated `__init__`/`add` on
  `TaskList`; `main.py` updated to demonstrate both the validation and
  the real capacity enforcement.
- **Location:** `PositiveInt` is added directly after `Persistable`,
  established in Lesson 11; `TaskList`'s own `__init__` (unchanged
  since Lesson 5) and `add` (unchanged since Lesson 5) are both
  modified; `main.py`'s existing code is left unchanged, with new
  lines added at the end.
- **Dependencies:** None new — everything used here is covered earlier
  in this lesson.

### The New Code

```python
class PositiveInt:
    def __set_name__(self, owner, name):
        self._name = "_" + name

    def __get__(self, instance, owner):
        if instance is None:
            return self
        return getattr(instance, self._name)

    def __set__(self, instance, value):
        if not isinstance(value, int) or value <= 0:
            raise ValueError(f"must be a positive int, got {value!r}")
        setattr(instance, self._name, value)
```

```python
    max_tasks = PositiveInt()

    def __init__(self, max_tasks: int = 1000):
        self._tasks: list = []
        self.max_tasks = max_tasks

    def add(self, task: dict) -> None:
        if len(self._tasks) >= self.max_tasks:
            raise ValueError(f"TaskList is full (max_tasks={self.max_tasks})")
        self._tasks.append(task)
```

### The Updated Project

```
tasks.py:
 6  class Persistable(ABC):
 7      @abstractmethod
 8      def save(self, path: str) -> None:
 9          ...
10
11      @abstractmethod
12      def load(self, path: str) -> None:
13          ...
14
15  class PositiveInt:                                                    # ← new
16      def __set_name__(self, owner, name):                              # ← new
17          self._name = "_" + name                                       # ← new
18                                                                          # ← new
19      def __get__(self, instance, owner):                               # ← new
20          if instance is None:                                          # ← new
21              return self                                                # ← new
22          return getattr(instance, self._name)                          # ← new
23                                                                          # ← new
24      def __set__(self, instance, value):                               # ← new
25          if not isinstance(value, int) or value <= 0:                  # ← new
26              raise ValueError(f"must be a positive int, got {value!r}")  # ← new
27          setattr(instance, self._name, value)                          # ← new
...
76  class TaskList(Persistable):
77      max_tasks = PositiveInt()                                         # ← new
78
79      def __init__(self, max_tasks: int = 1000):                        # ← changed
80          self._tasks: list = []                                        # ← changed
81          self.max_tasks = max_tasks                                    # ← new
82
83      def add(self, task: dict) -> None:                                # ← unchanged signature
84          if len(self._tasks) >= self.max_tasks:                        # ← new
85              raise ValueError(f"TaskList is full (max_tasks={self.max_tasks})")  # ← new
86          self._tasks.append(task)
```

```
main.py:
71  for task in plain_tasks:
72      print(describe_task(task))
73
74  print("=== max_tasks — a real, reusable descriptor at work ===")   # ← new
75  print("my_tasks.max_tasks (default):", my_tasks.max_tasks)         # ← new
76  try:                                                                 # ← new
77      my_tasks.max_tasks = -5                                         # ← new
78  except ValueError as e:                                             # ← new
79      print("ValueError:", e)                                        # ← new
80
81  print("=== Enforcing capacity for real ===")                       # ← new
82  tiny_tasks = TaskList(max_tasks=1)                                  # ← new
83  tiny_tasks.add(task_a)                                              # ← new
84  try:                                                                 # ← new
85      tiny_tasks.add(task_b)                                          # ← new
86  except ValueError as e:                                             # ← new
87      print("ValueError:", e)                                        # ← new
```

As a whole, `TaskList` now has a real, validated capacity limit,
defaulting to `1000` (large enough not to disrupt any existing lesson's
demonstrations, which never add more than a handful of tasks), backed
by the exact same reusable `PositiveInt` descriptor this lesson's
second unit built and proved works correctly across multiple attributes
— here used on just one, `max_tasks`, but genuinely ready to validate a
second numeric attribute on any future class in this project with zero
additional code. `main.py`, as a whole, now demonstrates both halves of
the guarantee: assigning an invalid `max_tasks` is rejected immediately
by the descriptor itself, and a genuinely full `TaskList` correctly
refuses a further `add()` call.

### Mechanical Walkthrough

- `class PositiveInt:` and its three methods — the identical class from
  this lesson's second unit, restated in full per the Repetition Rule,
  moved unchanged into the real project.
- `max_tasks = PositiveInt()`, inside `TaskList` — a class-level
  assignment (Lesson 1, restated per the Repetition Rule), constructing
  one `PositiveInt` instance and binding it as a class attribute of
  `TaskList` — the identical pattern this lesson's second unit's own
  `Order.quantity`/`Order.max_items` already established.
- `def __init__(self, max_tasks: int = 1000):` — `TaskList`'s own
  `__init__`, now accepting an optional, hinted (Lesson 2, restated per
  the Repetition Rule) parameter with a default value (Lesson 2's own
  `create_id_generator` didn't need one, but default parameter values
  are ordinary Python syntax this curriculum has used implicitly in
  library calls like `dict.get`'s own default argument, Lesson 4,
  restated per the Repetition Rule, applied here directly to a
  user-defined function's own parameter).
- `self._tasks: list = []` — an assignment statement with an explicit
  type annotation (Lesson 2's own hint syntax, restated per the
  Repetition Rule, here applied to a variable rather than a function
  parameter) — added specifically because `mypy`, once `max_tasks`
  became a `PositiveInt`-backed descriptor sitting in the same class
  body, could no longer confidently infer `_tasks`'s element type on
  its own; this is a real, honest example of Lesson 2's own finding
  that hints are sometimes necessary specifically to help a static
  checker, not the runtime, reason about code correctly.
- `self.max_tasks = max_tasks` — an ordinary-looking attribute
  assignment that, per this lesson's second unit's own descriptor
  protocol, actually calls `PositiveInt.__set__` on the `max_tasks`
  descriptor, validating the supplied value before storing it under a
  computed private name (`_max_tasks`, per `__set_name__`'s own logic).
- `if len(self._tasks) >= self.max_tasks:` — an `if` statement whose
  condition calls `len` (Lesson 10, restated per the Repetition Rule)
  on the internal list, and reads `self.max_tasks` — which, per the
  same descriptor protocol, calls `PositiveInt.__get__`, retrieving the
  validated value.
- `raise ValueError(f"TaskList is full (max_tasks={self.max_tasks})")`
  — `raise` (Lesson 2, restated per the Repetition Rule), with an
  f-string (Lesson 2, restated per the Repetition Rule) reporting the
  actual limit.
- `self._tasks.append(task)` — unchanged from every previous lesson —
  `append` (Lesson 1, restated per the Repetition Rule), run only if
  the capacity check above passes.
- `my_tasks.max_tasks = -5`, in `main.py` — an attribute assignment
  that, per the descriptor protocol, calls `PositiveInt.__set__` with
  `value` bound to `-5`; the `isinstance`/`<= 0` check fails, and
  `ValueError` is raised directly from inside the descriptor's own
  code, before `my_tasks`'s real stored value is ever touched.
- `TaskList(max_tasks=1)`, in `main.py` — constructs a new `TaskList`
  with an explicit, small capacity; `tiny_tasks.add(task_a)` succeeds
  (`len(self._tasks)` is `0`, less than `1`); `tiny_tasks.add(task_b)`
  fails, since `len(self._tasks)` is now `1`, no longer less than
  `self.max_tasks`.

### CS Lens

This reappears the descriptor idea from earlier in this lesson,
restated in full per the Repetition Rule, now specifically as a real,
applied capacity-limiting feature:

```
Also recognized in: bounded queue implementations across nearly every
language (a fixed-capacity buffer that rejects or blocks further
insertion once full — the identical enforcement TaskList.add now
performs, at a much smaller scale than a production message queue but
structurally the same idea), database column constraints (a NOT NULL
or CHECK constraint enforces a rule at the exact moment a value is
written, the identical timing PositiveInt.__set__ enforces its own
rule), resource pool limits in connection-pooling libraries (a
database connection pool very often has a configurable, validated
maximum size, rejecting further checkouts once reached — the identical
shape as max_tasks, applied to database connections instead of tasks),
and rate limiters generally (enforcing a maximum count within some
scope before refusing further requests — the same "count, compare
against a validated limit, reject past it" logic TaskList.add now
performs)
```

### SE Lens

The alternative — checking `max_tasks`'s validity only once, inside
`__init__`, and leaving it as a plain attribute afterward, assignable
to anything at all after construction — was rejected here specifically
because `PositiveInt`, once attached as a real descriptor, protects
*every* assignment to `max_tasks`, not just the very first one at
construction time; `my_tasks.max_tasks = -5`, attempted at any point
after `my_tasks` already exists, is caught identically to a bad value
supplied at construction. The real, honest cost, worth stating
directly: this project's own `max_tasks` default, `1000`, was chosen
specifically to avoid disrupting any of this curriculum's own existing
demonstrations, none of which ever approach that many tasks — a real
production system would need to choose this default deliberately,
based on its own actual expected scale, rather than a value picked
purely to keep a teaching project's own history intact.

### Commands Needed

The updated project runs and checks the same way every previous
lesson's project code has: `python3 main.py`, `mypy main.py`.

### Run It

The real, updated project's relevant new output:

```
=== max_tasks — a real, reusable descriptor at work ===
my_tasks.max_tasks (default): 1000
ValueError: must be a positive int, got -5
=== Enforcing capacity for real ===
ValueError: TaskList is full (max_tasks=1)
```

`my_tasks.max_tasks = -5` is correctly rejected, by the descriptor
itself, before it ever reaches `my_tasks`'s real stored value —
`my_tasks.max_tasks`, read again afterward, would still correctly
report `1000`, unchanged, exactly the way `Temperature`'s own rejected
`-300` assignment, in this lesson's first unit, left `t.celsius`
unchanged at `30`. `tiny_tasks`, constructed with `max_tasks=1`,
correctly accepts its first task and correctly refuses its second.
Getting the project's own mypy check to pass required one honest,
real fix along the way — an explicit `list` annotation on `self.
_tasks`, needed once `max_tasks` became a descriptor-backed attribute
sharing the same class body — reported by `mypy` as:

```
Success: no issues found in 1 source file
```

### Connection

This unit is where every mechanism this lesson built landed on real
project code: the first unit's `@property` motivated the whole
question of intercepting attribute access at all; the second unit's
hand-built `PositiveInt` proved that interception is a general,
reusable protocol, not something tied to one specific attribute; and
this unit's own `max_tasks` is that exact protocol, unmodified, doing
real, useful validation work on the project's own `TaskList` — closing
the loop from `@property`'s very first, narrow motivating example all
the way to a genuinely reusable piece of project infrastructure.

---

## Connect the Pieces

Trace `my_tasks.max_tasks = -5`, from the project's own `main.py`,
through everything this lesson built. Per this lesson's second unit's
own protocol, this assignment doesn't store `-5` anywhere directly — it
calls `PositiveInt.__set__`, with `self` bound to the `max_tasks`
descriptor instance living on `TaskList`'s own class body, `instance`
bound to `my_tasks`, and `value` bound to `-5`. Inside `__set__`, the
exact validation this lesson's first unit's own `Temperature.celsius`
setter demonstrated in miniature — `if ... raise ValueError(...)` — runs
identically, this time checking `isinstance(value, int) and value > 0`
rather than a temperature floor, and `my_tasks`'s real, stored
`_max_tasks` attribute (the private name `__set_name__` computed once,
automatically, back when `TaskList` itself was first defined) is never
touched at all, because the `raise` happens before `setattr` is ever
reached. `my_tasks.max_tasks`, read immediately afterward, would call
`PositiveInt.__get__` instead, retrieving `_max_tasks`'s real,
unchanged value of `1000` — proving, on the project's own real code,
exactly what this lesson's first unit's own `Temperature` already
proved on a throwaway example: a data descriptor, whether it's
`property` itself or a hand-built one like `PositiveInt`, genuinely
intercepts both directions of attribute access, and does so uniformly,
whether the descriptor instance is used once, like `Temperature.
celsius`, or reused, unmodified, across an entire project's own classes,
like `PositiveInt` now is.
