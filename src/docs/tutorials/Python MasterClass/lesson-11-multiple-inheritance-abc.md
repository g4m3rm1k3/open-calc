# Lesson 11: Multiple Inheritance, Abstract Base Classes, and When Not to Inherit

**What you will build.** You'll build a genuine diamond inheritance
hierarchy — two classes both inheriting from one common base, and a
fourth class inheriting from both of them — and prove, with real,
executed output, that `super()` doesn't call "the literal parent
class." It follows a computed search order, and that order can route a
`super()` call to a class that isn't even your direct parent. You'll
inspect that order directly via `__mro__` and watch it explain output
that would otherwise look inexplicable. You'll then define a class that
*requires* certain methods to exist, using `abc.ABC` and
`@abstractmethod`, and prove directly that Python refuses to even
construct an instance that doesn't fully satisfy that requirement — a
real, enforced contract, not a comment or a convention. Finally, you'll
build the composition-based alternative to the project's own
`LoggingTaskList` side by side with the inheritance-based version
already in `tasks.py`, and watch one specific, concrete fact diverge
between them — before applying `abc.ABC` directly to the project
itself, turning `TaskList`'s already-existing `save`/`load` methods
into a formally declared, enforced interface. The transferable problem:
the diamond problem, interface contracts, and the inheritance-versus-
composition question are not Python-specific curiosities — C#'s and
Java's interfaces exist specifically because those languages forbid
multiple *class* inheritance outright, precisely to sidestep the
diamond problem you're about to build by hand; C#'s explicit interface
implementation and Java's `default` interface methods are both real,
direct responses to the exact ambiguity this lesson's first unit
proves Python resolves differently, through a computed order rather
than a ban.

**What you need to know first.** Lesson 9's proof of the Method
Resolution Order, `super()`, and `isinstance` across an inheritance
relationship — this lesson's first unit takes that exact mechanism and
applies it to a genuinely more complex hierarchy than Lesson 9's simple
`Animal`/`Dog`/`Cat` chain, where the MRO stops being a short, obvious
list and becomes something you have to actually compute, or inspect,
to know for certain. Lesson 9's own SE Lens, which named the
inheritance-versus-composition tradeoff for `LoggingTaskList` but
chose inheritance without building the alternative — this lesson's
third unit is the direct follow-through on that choice, building the
composition version for real rather than only describing it.

**Terms used in this lesson**

- **Diamond inheritance** — a hierarchy shape where two classes both
  inherit from one common base class, and a fourth class inherits from
  both of those two — drawn as a diamond, with the shared base at the
  bottom point and the fourth class at the top. This term exists to
  name the specific structural shape this lesson's first unit builds,
  because it's exactly the shape that makes "which parent does
  `super()` actually call" a genuinely non-obvious question, rather
  than the simple single-parent case Lesson 9 already covered.
- **C3 linearization** — the specific, well-defined algorithm Python
  uses to compute a class's MRO (Lesson 9 introduced this term in
  full; restated per the Repetition Rule) whenever a class has more
  than one parent, producing a single, consistent order that respects
  every parent's own internal ordering. This term exists because this
  lesson's first unit's own `__mro__` output isn't arbitrary or
  Python-specific folklore — it's the deterministic result of a real,
  named, documented algorithm, and knowing the algorithm has a name is
  part of knowing it's not guesswork.
- **Cooperative multiple inheritance** — the design pattern where every
  class in a hierarchy calls `super()` inside methods it overrides,
  rather than naming a specific parent class directly, so that a call
  chain correctly visits every class the MRO says it should — even
  ones that aren't its own direct parent. This term exists because
  it's the precise name for what this lesson's first unit's
  `Diamond`/`Left`/`Right`/`Base` example demonstrates directly: each
  class "cooperates" by trusting `super()` to route the call correctly,
  rather than hardcoding `Base.greet(self)` and breaking the chain.
- **Abstract base class** — a class, built using Python's `abc` module,
  that defines one or more methods as *required* without providing a
  real implementation for them, making it impossible to construct an
  instance of that class (or any subclass that hasn't implemented every
  required method) at all. This term exists to name the mechanism this
  lesson's second unit is entirely built around: a genuine, enforced
  interface contract, not a naming convention or a docstring.
- **`@abstractmethod`** — a decorator (a piece of syntax, `@name`,
  placed directly above a function or method definition, that wraps or
  marks the function it decorates — this curriculum's own dedicated
  lesson on decorators comes later, but this exact use is explained in
  full here, per the Repetition Rule's requirement that a construct
  used now gets real treatment now, not a forward citation) that marks
  a method as required, without providing its real implementation, on
  a class inheriting from `abc.ABC`. This term exists because it's the
  specific piece of syntax this lesson's second unit uses to declare
  which methods a subclass is obligated to provide.
- **Composition** — a design where one class holds an instance of
  another as an attribute, and forwards calls to it explicitly, rather
  than inheriting from it. This term exists to be directly contrasted
  with inheritance throughout this lesson's third unit — Lesson 5's own
  `TaskList.__iter__`, delegating to `iter(self._tasks)`, was already a
  small instance of this same idea, applied there to a built-in `list`
  rather than a custom class.

**Objects and methods used**

- **`ABC`**
  - *What it is:* A class, defined in Python's standard-library `abc`
    module (imported via `from abc import ABC, abstractmethod`, the
    same import mechanism Lesson 8 established for `json`, applied
    here to a different standard-library module).
  - *Implementation:* A base class with no methods of its own to
    inherit meaningfully — its entire purpose is changing the
    *metaclass* (Lesson 4 introduced this term in full; restated per
    the Repetition Rule) of any class that inherits from it, from
    Python's ordinary `type` to a special one, `ABCMeta`, that actively
    checks for unimplemented abstract methods before allowing
    instantiation.
  - *Its use:* This lesson's second unit needs a real, enforced way to
    declare "any class built from this one must implement these
    specific methods" — inheriting from `ABC` is what turns
    `@abstractmethod` from a mere marker into an actual, checked
    requirement.
  - *Type:* A class — but, per this lesson's second unit's own proof,
    an instance of a different metaclass (`ABCMeta`) than an ordinary
    class like `TaskList` is, which is itself an instance of `type`
    directly.
  - *Responsibility:* Its full charter is providing the `ABCMeta`
    metaclass to anything that inherits from it — nothing about
    defining any actual, callable behavior of its own.
  - *Depends on:* Nothing beyond being inherited from.
  - *Connects to:* Inherited by `Shape` (this lesson's throwaway
    example) and by the project's own `Persistable`; every class that
    inherits from `ABC`, directly or indirectly, gets `ABCMeta`'s
    enforcement applied to it at instantiation time.
  - *Shape:* Not applicable in the usual "what does it return" sense —
    `ABC` is inherited from, never called or invoked directly on its
    own.

- **`abstractmethod`**
  - *What it is:* A function, also from the `abc` module, used as a
    decorator (full treatment of decorator syntax in Terms, above).
  - *Implementation:* `abstractmethod(func) -> func`. Takes a function
    (the method it's decorating) and returns it, unmodified in terms of
    behavior, but with a special attribute (`__isabstractmethod__`,
    set to `True`) attached to it, which `ABCMeta` specifically checks
    for.
  - *Its use:* This lesson's second unit needs a way to mark a specific
    method, inside a class inheriting from `ABC`, as required rather
    than optional — `@abstractmethod`, placed directly above a method
    definition, is exactly that marker.
  - *Type:* A function, used via decorator syntax (`@abstractmethod`
    directly above a method definition, equivalent to writing
    `area = abstractmethod(area)` immediately after defining `area`
    the ordinary way).
  - *Responsibility:* Its full charter is attaching the
    `__isabstractmethod__` marker — it does not itself prevent
    anything; the actual enforcement (refusing to construct an
    instance) is `ABCMeta`'s own job, checking for this marker across
    every method a class defines.
  - *Depends on:* The function it's decorating.
  - *Connects to:* Applied directly above `Shape.area` and the
    project's own `Persistable.save`/`Persistable.load`; `ABCMeta`
    reads the resulting `__isabstractmethod__` markers at the moment a
    class is instantiated, to decide whether to allow it.
  - *Shape:* Returns the same function object it was given, with one
    additional attribute attached — not a new, wrapped object, unlike
    some decorators this curriculum will cover in a later, dedicated
    lesson.

**Everything else in the file, not this lesson's subject but still explained.**

- **`print`, `type`, `isinstance`, `super`**
  - All fully covered in previous lessons and reappearing here
    unchanged; `super()` specifically gets sharpened, not redefined, by
    this lesson's first unit — Lesson 9 already gave it full treatment
    for the single-parent case.

---

## Concept Unit: The Diamond Problem — What Does `super()` Actually Call?

### The Problem

Lesson 9's `Cat` had exactly one parent, `Animal`, so `super().speak()`
inside `Cat` had only one possible meaning: "call `Animal`'s version."
What happens when a class has *two* parents, both of which themselves
share a common ancestor — the shape called **diamond inheritance**
(defined in Terms, above)? If both `Left` and `Right` each override a
method and each call `super()` inside their own override, and `Diamond`
inherits from both, what does `super()`, called from inside `Diamond`'s
own override, actually reach — and after that, what does *it* reach?

> **Before reading on:** picture four classes: `Base`, with a method
> `greet`; `Left`, inheriting from `Base`, overriding `greet` to call
> `super().greet()` and prepend its own name to the result; `Right`,
> built identically, inheriting from `Base` the same way; and
> `Diamond`, inheriting from *both* `Left` and `Right`
> (`class Diamond(Left, Right):`), with its own `greet` override
> calling `super().greet()` too. If you called `Diamond().greet()`, and
> `Left`'s own `super().greet()` naively "meant" `Base` (since `Base`
> is `Left`'s own direct, literal parent), what result would you
> expect — something like `"Diamond->Left->Base"`, skipping `Right`
> entirely? Or does something about `Diamond` inheriting from *both*
> `Left` and `Right` suggest `Right` ought to be reachable somehow,
> even though nothing in `Left`'s own code mentions it?

### Isolating the Concept

```python
class Base:
    def greet(self):
        return "Base"

class Left(Base):
    def greet(self):
        return "Left->" + super().greet()

class Right(Base):
    def greet(self):
        return "Right->" + super().greet()

class Diamond(Left, Right):
    def greet(self):
        return "Diamond->" + super().greet()

print(Diamond.__mro__)
d = Diamond()
print(d.greet())
```

Real output:

```
(<class '__main__.Diamond'>, <class '__main__.Left'>, <class '__main__.Right'>, <class '__main__.Base'>, <class 'object'>)
Diamond->Left->Right->Base
```

The real result is `"Diamond->Left->Right->Base"` — `Right` genuinely
is reached, even though nothing in `Left`'s own source code mentions
`Right` at all. This is the direct, provable answer to this unit's own
Socratic prompt: `super()` does not call "the literal parent class" —
it calls *the next class in the MRO*, and the MRO here, shown directly
by `Diamond.__mro__`, is `Diamond`, `Left`, `Right`, `Base`, `object` —
computed by **C3 linearization** (defined in Terms, above), a real,
deterministic algorithm, not an arbitrary or hand-wavy ordering.
`Diamond.greet`'s own `super().greet()` call reaches `Left` (the next
class after `Diamond` in the MRO) — unsurprising. But `Left.greet`'s
own `super().greet()` call, per the *same* MRO search, reaches `Right`
next, not `Base` — because from `Diamond`'s own point of view, `Right`
sits between `Left` and `Base` in the computed order, and `super()`,
called from code that's currently executing as part of resolving a
`Diamond` instance's own method lookup, respects *that* order, not
`Left`'s own, narrower, single-parent-only relationship to `Base`. This
is called **cooperative multiple inheritance** (defined in Terms,
above): every class in this hierarchy calls `super()` rather than
naming `Base` directly, and that discipline is exactly what lets the
full chain — `Diamond`, then `Left`, then `Right`, then finally `Base` —
run to completion correctly, each class contributing its own piece
before passing control to the next one in line.

### Discarding the Example

`Base`, `Left`, `Right`, and `Diamond`, in this exact throwaway form,
are deleted now and won't appear in later lessons or project code. They
existed only to isolate, in the smallest possible hierarchy, exactly
what `super()` calls when more than one inheritance path exists.

### Project Change

No project change in this unit — the project's own inheritance
(`TaskList` → `LoggingTaskList`) is a simple, single-parent chain, with
no diamond shape to demonstrate this exact mechanism against; this
unit's finding is foundational for the next two units rather than
something the project itself currently needs.

### Mechanical Walkthrough

- `class Base:` / `def greet(self):` / `return "Base"` — a `class`
  statement and method definition (Lesson 5, restated per the
  Repetition Rule), returning a plain string literal.
- `class Left(Base):` — a `class` statement with inheritance syntax
  (Lesson 9, restated per the Repetition Rule), `Left` defined in terms
  of `Base`.
- `def greet(self):` / `return "Left->" + super().greet()` — a method
  override (Lesson 9, restated per the Repetition Rule); `super()`
  (Lesson 9, restated per the Repetition Rule) returns a proxy for
  whatever class the MRO says comes next after `Left`, relative to
  whatever instance this method is actually running on; `.greet()`
  called on that proxy runs *that* class's own `greet`; `+` (Lesson 3's
  walkthrough covered arithmetic operators, restated per the Repetition
  Rule, here applied to string concatenation rather than numbers) joins
  the literal `"Left->"` with whatever that call returns.
- `class Right(Base):` / its `greet` — the identical pattern as
  `Left`'s, independently defined.
- `class Diamond(Left, Right):` — a `class` statement listing *two*
  parent classes, separated by a comma — this is what actually creates
  the diamond shape: `Diamond` inherits from both `Left` and `Right`,
  each of which independently inherits from `Base`.
- `def greet(self):` / `return "Diamond->" + super().greet()` — the
  same override pattern, one level higher in the hierarchy.
- `Diamond.__mro__` — attribute access (Lesson 4, restated per the
  Repetition Rule) on the class `Diamond` itself, retrieving the real,
  computed MRO tuple (Lesson 9, restated per the Repetition Rule) — per
  C3 linearization, this specific order (`Diamond`, `Left`, `Right`,
  `Base`, `object`) is the *only* order consistent with every class's
  own declared inheritance (respecting that `Left` comes before `Base`,
  that `Right` comes before `Base`, and that `Left` was listed before
  `Right` in `Diamond`'s own definition).
- `d = Diamond()` — constructs a new `Diamond` instance (Lesson 5,
  restated per the Repetition Rule).
- `d.greet()` — a method call (Lesson 9's own bound-method mechanism,
  restated per the Repetition Rule); resolves, via the MRO, to
  `Diamond.greet` (found first, since it's `Diamond`'s own class), which
  runs, calling `super().greet()` inside it, which resolves to the next
  class in the MRO — `Left` — and so on down the chain this unit's own
  real output already traced.

### CS Lens

This is a hard concept — a well-defined, deterministic resolution
strategy for a genuinely ambiguous-looking inheritance shape — so, per
the Repetition Rule, several unrelated recurrences:

```
Also recognized in: C++'s own diamond inheritance problem and virtual
inheritance (C++ allows the identical diamond shape directly, and
requires an explicit `virtual` keyword on the shared base to avoid two
separate copies of it being constructed — a different, more manual
solution to a closely related problem), C#'s and Java's decision to
forbid multiple class inheritance outright, permitting only multiple
*interface* implementation instead (a deliberate design choice made
specifically to avoid ever having to answer this lesson's own
Socratic-prompt question at the language level at all), Git's own
merge-commit history graphs (a commit with two parents, each
descending from a shared ancestor, is structurally the identical
diamond shape — and Git's own history traversal has to make comparably
principled decisions about ordering), and topological sorting in
graph theory generally (C3 linearization is, formally, a specific,
constrained topological sort over a class's ancestors — the same
general algorithmic idea used anywhere a consistent order has to be
derived from a set of partial ordering constraints)
```

### SE Lens

The alternative — Python simply refusing to allow multiple inheritance
at all, the way C# and Java do — was rejected in Python's own design,
in favor of allowing it and providing a well-defined, deterministic
resolution (C3 linearization) rather than leaving the ambiguity
unresolved or resolving it arbitrarily. The real, honest cost this
unit's own example makes concrete: a diamond hierarchy is genuinely
harder to reason about than a single-parent chain — predicting
`d.greet()`'s exact output correctly, without actually inspecting
`__mro__` or running the code, requires understanding C3 linearization
well enough to compute it by hand, which most working Python
programmers, even experienced ones, don't do reliably; `__mro__` itself
existing as a directly inspectable attribute (rather than something you
have to infer or guess) is Python's own acknowledgment that this
complexity is real and worth making checkable rather than hidden.

### Commands Needed

Run the same way as every previous lesson: `python3 lab1.py`. Nothing
new.

### Run It

Already shown and verified above, under "Isolating the Concept."

### Connection

This unit proved `super()` follows a computed, inspectable order rather
than literal parentage. The next unit builds a different kind of class
relationship entirely — not "reuse and extend," but "require and
enforce" — using Python's own mechanism for declaring that a class
*must* implement certain methods before it can even be constructed.

---

## Concept Unit: Abstract Base Classes — Enforcing an Interface, Not Just Documenting One

### The Problem

Nothing in this curriculum's own `TaskList`, `LoggingTaskList`, or any
other class has ever *required* a subclass to implement anything in
particular — Lesson 9's `Dog` and `Cat` each happened to define
`speak`, but nothing would have stopped a third subclass of `Animal`
from simply not defining it at all (it would have silently inherited
`Animal.speak` instead, which might not be what was intended, but would
raise no error). Is there a way to make a specific method genuinely
*required* — not just conventionally expected, but enforced, by Python
itself, refusing to construct an instance that doesn't provide it?

> **Before reading on:** if Python offered a way to mark a method as
> "any real subclass must provide its own version of this, or
> instantiation itself should fail" — what would need to happen,
> mechanically, at the exact moment someone writes `SomeClass()`? Would
> checking this need to happen inside `__init__` itself (meaning a
> subclass could still get partway through constructing an instance
> before the problem is caught), or would it need to happen *before*
> `__init__` even runs at all — and if the latter, what mechanism,
> beyond ordinary class definition, would need to be involved to make
> that possible?

### Isolating the Concept

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        ...

s = Shape()
```

Real output:

```
TypeError: Can't instantiate abstract class Shape without an implementation for abstract method 'area'
```

`Shape()` fails immediately, before any of `Shape`'s own code (there
isn't any beyond the abstract declaration) ever runs — a real,
enforced refusal, not a runtime error triggered by something inside
`__init__` going wrong. This is called an **abstract base class**
(defined in Terms, above): inheriting from `ABC` (full treatment in
Objects and methods, above) and marking `area` with `@abstractmethod`
(full treatment in Objects and methods, above) makes `Shape` itself
uninstantiable — it exists purely to declare a requirement, not to be
used directly.

```python
class Circle(Shape):
    def __init__(self, r):
        self.r = r

    def area(self):
        return 3.14159 * self.r ** 2

c = Circle(2)
print(c.area())
print(isinstance(c, Shape))
```

Real output:

```
c.area(): 12.56636
isinstance(c, Shape): True
```

`Circle`, providing a real `area` method, constructs and works
correctly — and `isinstance(c, Shape)` confirms `c` genuinely is a
`Shape`, per Lesson 9's own inheritance-and-`isinstance` proof. The
enforcement is specific to *unimplemented* requirements, not to
subclassing itself:

```python
class Broken(Shape):
    pass

b = Broken()
```

Real output:

```
TypeError: Can't instantiate abstract class Broken without an implementation for abstract method 'area'
```

`Broken`, a real subclass of `Shape` that simply never got around to
defining `area`, fails to construct for the identical reason `Shape()`
itself did — the requirement `Shape` declared genuinely propagates to
every subclass, checked fresh at the moment each one is actually
instantiated, not just at `Shape`'s own definition.

A final check exposes the actual mechanism behind the enforcement:

```python
print(type(Shape))
```

Real output:

```
<class 'abc.ABCMeta'>
```

`type(Shape)` is not `<class 'type'>` — the ordinary metaclass every
plain class this curriculum has written (including `TaskList` itself)
belongs to, per Lesson 4's own proof. It's `ABCMeta` (defined
implicitly through `ABC`'s own role, in Objects and methods, above) —
a genuinely different **metaclass** (Lesson 4's own term, restated per
the Repetition Rule), specifically responsible for running the check
this unit's own labs just demonstrated, at the exact moment any class
descending from it is instantiated.

### Discarding the Example

`Shape`, `Circle`, and `Broken`, in this exact throwaway form, are
deleted now and won't appear in later lessons or project code. They
existed only to isolate exactly what `ABC` and `@abstractmethod`
enforce, and exactly when.

### Project Change

No project change in this unit — the project's own application of
`ABC`, formalizing `TaskList`'s existing `save`/`load` contract,
arrives in the next unit, once this lesson's third unit's own
composition-versus-inheritance comparison has also been made directly.

### Mechanical Walkthrough

- `from abc import ABC, abstractmethod` — an import statement (Lesson
  2, restated per the Repetition Rule), naming two specific things from
  the standard-library `abc` module.
- `class Shape(ABC):` — a `class` statement with inheritance syntax
  (Lesson 9, restated per the Repetition Rule); `Shape` inherits from
  `ABC` (full treatment above), which is what makes `ABCMeta`'s
  enforcement apply to it.
- `@abstractmethod`, directly above `def area(self):` — decorator
  syntax (full treatment in Terms, above): equivalent to defining
  `area` the ordinary way and then immediately rebinding the name
  `area`, inside the class body, to `abstractmethod(area)` — the
  original function, marked with `__isabstractmethod__ = True`.
- `def area(self):` / `...` — a method definition whose body is the
  literal `...` (the `Ellipsis` object, a real, if unusual, built-in
  singleton commonly used as a placeholder body for a method with no
  real implementation — genuinely narrow to this specific idiom, not a
  subject of its own beyond noting it's valid, real syntax here,
  functioning identically to `pass` would in this exact position).
- `s = Shape()` — attempts to construct a `Shape` instance; `ABCMeta`
  (the metaclass responsible for this, per this unit's own final lab),
  before allowing construction to proceed, checks whether every
  abstract method declared anywhere in `Shape`'s own MRO has a real
  (non-abstract) implementation somewhere in that same MRO; finding
  `area` still marked abstract, it raises `TypeError` directly, citing
  the specific unimplemented method by name.
- `class Circle(Shape):` — a `class` statement, `Circle` inheriting
  from `Shape`.
- `def __init__(self, r):` / `self.r = r` — a method definition and
  instance-attribute assignment (Lesson 5, restated per the Repetition
  Rule).
- `def area(self):` / `return 3.14159 * self.r ** 2` — a method
  definition providing a real implementation; `**` (new to this
  curriculum's explicit walkthroughs, though arithmetic itself is not
  — the exponentiation operator, computing `self.r` raised to the power
  `2`); because `Circle`'s own `area` has no `@abstractmethod` marker,
  `ABCMeta`'s check, at `Circle(2)`'s own instantiation, finds every
  abstract requirement satisfied and allows construction to proceed
  normally.
- `c = Circle(2)` — constructs successfully.
- `c.area()`, `isinstance(c, Shape)` — a method call and an
  `isinstance` check (both fully covered previously, restated per the
  Repetition Rule).
- `class Broken(Shape):` / `pass` — a `class` statement defining a
  subclass with no method definitions of its own at all (`pass`,
  Lesson 4, restated per the Repetition Rule, as the entire class
  body).
- `b = Broken()` — attempts construction; `ABCMeta`'s check, walking
  `Broken`'s own MRO (`Broken`, `Shape`, `ABC`, `object`), finds `area`
  still marked abstract nowhere overridden, and refuses construction
  identically to `Shape()` itself.
- `type(Shape)` — the `type` built-in (Lesson 1, restated per the
  Repetition Rule), applied to the class `Shape` itself, reporting its
  real metaclass.

### CS Lens

This is a hard concept — a genuinely enforced, checked interface
contract, rather than a documented convention — so, per the Repetition
Rule, several unrelated recurrences:

```
Also recognized in: C#'s and Java's `interface` keyword (the direct,
purpose-built counterpart — a C# or Java interface declares required
methods with no implementation, and the compiler itself refuses to
compile a concrete class that doesn't implement every one, an even
earlier-caught version of the identical enforcement this lesson's
runtime-checked Python version performs at instantiation time instead
of compile time), Rust's trait system (traits declare required methods,
and a type must implement a trait fully before it can be used where
that trait is required — checked at compile time, like C#/Java's
interfaces), TypeScript's `interface` declarations (structural, rather
than nominal, but serving the identical "this shape is required"
role), and formal contract-based design in software engineering
generally (Design by Contract, as a named methodology, treats a
class's public interface as a genuine, checkable promise rather than
documentation alone — abstract base classes are one concrete mechanism
implementing exactly this philosophy)
```

### SE Lens

The alternative — simply documenting, in a docstring or comment, that
any "shape-like" class should provide an `area` method, with no actual
enforcement — was rejected here because a documented-only convention
can silently be violated: nothing stops a subclass from forgetting
`area` entirely, and the resulting failure would only surface later,
far from the actual mistake, the first time something tries to call
`.area()` on an instance that doesn't have a real one (an
`AttributeError`, at that point, rather than this lesson's own,
immediate, precisely-worded `TypeError` at construction time). The real
cost: `ABC`'s enforcement only checks that a method with the right
*name* exists and isn't itself still marked abstract — it says
nothing about that method's actual *behavior* being correct (a
`Circle.area` that returned the wrong value entirely, or even `0`
unconditionally, would satisfy `ABCMeta`'s check just as completely as
a genuinely correct implementation would); an abstract base class
enforces *presence*, not *correctness* — a real, meaningful guarantee,
but a narrower one than it might first appear to be.

### Commands Needed

Run the same way as every previous lesson: `python3 lab2.py`. Nothing
new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
every part of this unit's lab.

### Connection

This unit proved `ABC`/`@abstractmethod` enforces a real interface
contract, distinct from — and complementary to — the reuse-and-extend
relationship this lesson's first unit and Lesson 9 both already
covered for ordinary inheritance. The next unit brings both mechanisms
together, directly on the project: building the composition-based
alternative to `LoggingTaskList` this lesson's own introduction
promised, and then formalizing `TaskList`'s own `save`/`load` methods
as a real, `ABC`-enforced contract.

---

## Concept Unit: Composition vs. Inheritance, and `Persistable` Applied to the Project

### The Problem

Lesson 9's SE Lens named a real tradeoff — inheritance couples
`LoggingTaskList` tightly to `TaskList`'s exact internal implementation,
while composition would keep the two more independent, at the cost of
writing forwarding code by hand — but never actually built the
composition-based version to compare against. Given everything this
lesson has now proven about both mechanisms, what does that comparison
actually look like side by side, and what specific, checkable fact
genuinely differs between the two approaches — not just "more code" or
"less code," but something a real piece of code could observe and
behave differently based on?

> **Before reading on:** picture a composition-based version of
> `LoggingTaskList` — call it `LoggingByComposition` — that *holds* a
> `TaskList` instance as an attribute (`self._wrapped = TaskList()`)
> rather than inheriting from `TaskList` at all, and forwards `add`,
> `__iter__`, and `__len__` to it explicitly, one line of forwarding
> code per method. Given Lesson 9's own proof that `isinstance` checks
> against every ancestor in a class's MRO, and given that
> `LoggingByComposition`, in this composition-based version, has *no*
> inheritance relationship to `TaskList` at all — what would you
> predict `isinstance(some_logging_by_composition_instance, TaskList)`
> reports, compared to the identical check against the real, inheritance-
> based `LoggingTaskList` already in this project?

### Isolating the Concept

```python
class TinyTaskList:
    def __init__(self):
        self._tasks = []

    def add(self, task):
        self._tasks.append(task)

    def __iter__(self):
        return iter(self._tasks)

    def __len__(self):
        return len(self._tasks)

class LoggingByInheritance(TinyTaskList):
    def add(self, task):
        print(f"[log] adding {task}")
        super().add(task)

inh = LoggingByInheritance()
inh.add("wash the car")
print(len(inh))
print(isinstance(inh, TinyTaskList))
```

Real output:

```
[log] adding wash the car
len(inh): 1
isinstance(inh, TinyTaskList): True
```

Exactly the pattern this project's own `LoggingTaskList` already uses.
Now the composition-based version:

```python
class LoggingByComposition:
    def __init__(self):
        self._wrapped = TinyTaskList()

    def add(self, task):
        print(f"[log] adding {task}")
        self._wrapped.add(task)

    def __iter__(self):
        return iter(self._wrapped)

    def __len__(self):
        return len(self._wrapped)

comp = LoggingByComposition()
comp.add("wash the car")
print(len(comp))
print(isinstance(comp, TinyTaskList))
```

Real output:

```
[log] adding wash the car
len(comp): 1
isinstance(comp, TinyTaskList): False
```

Both versions behave identically from the outside — `len()` reports
`1` either way, and the log line prints either way. But
`isinstance(comp, TinyTaskList)` is `False`, where
`isinstance(inh, TinyTaskList)` was `True`. This is the one, sharp,
concrete difference this unit's own Socratic prompt asked about:
**composition** (defined in Terms, above) genuinely does not create an
`isinstance` relationship — `LoggingByComposition` merely *uses* a
`TinyTaskList` internally; it never claims to *be* one. Any code
elsewhere that checks `isinstance(x, TinyTaskList)` before deciding how
to treat `x` — a real, common pattern — would correctly accept `inh`
and incorrectly reject `comp`, even though `comp` behaves identically
in every way that code might actually care about. This is precisely
the tradeoff Lesson 9's SE Lens named in the abstract; here it's a real,
executed, checkable fact.

### Discarding the Example

`TinyTaskList`, `LoggingByInheritance`, and `LoggingByComposition` are
deleted now and won't appear in later lessons or project code. They
existed only to isolate, directly and concretely, the one sharp
difference between the two approaches — the project's own
`LoggingTaskList` remains built on inheritance, unchanged, per Lesson
9's own deliberate choice, now with the actual cost of that choice
made explicit rather than merely described.

### Project Change

- **Reference Source:** No reference counterpart — original to this
  project, same as every previous unit in this curriculum.
- **Files affected:** `project/tasks.py` (modified), `project/main.py`
  (modified).
- **Change type:** Add — an `abc` import and a new `Persistable`
  abstract base class in `tasks.py`; `TaskList`'s own class statement
  modified to inherit from it; `main.py` updated to demonstrate the
  resulting `isinstance` relationship.
- **Location:** The `abc` import and `Persistable`'s own definition are
  added at the very top of `tasks.py`, before `create_id_generator`;
  `TaskList`'s existing `save`/`load` methods (Lesson 8) are left
  completely unchanged — they already satisfy `Persistable`'s
  requirement, since both are real, non-abstract implementations;
  `main.py`'s existing code is left unchanged, with new lines added at
  the end.
- **Dependencies:** The `abc` module, part of Python's own standard
  library — no separate installation required.

### The New Code

```python
from abc import ABC, abstractmethod


class Persistable(ABC):
    @abstractmethod
    def save(self, path: str) -> None:
        ...

    @abstractmethod
    def load(self, path: str) -> None:
        ...
```

### The Updated Project

```
tasks.py:
 1  import json                                              # ← unchanged
 2  from abc import ABC, abstractmethod                       # ← new
 3
 4
 5  class Persistable(ABC):                                   # ← new
 6      @abstractmethod                                       # ← new
 7      def save(self, path: str) -> None:                    # ← new
 8          ...                                                # ← new
 9                                                              # ← new
10      @abstractmethod                                       # ← new
11      def load(self, path: str) -> None:                    # ← new
12          ...                                                # ← new
13
14
15  def create_id_generator():
...
55  class TaskList(Persistable):                              # ← changed
56      def __init__(self):
...
76      def save(self, path: str) -> None:
77          with open(path, "w") as f:
78              json.dump(self._tasks, f)
79
80      def load(self, path: str) -> None:
81          with open(path, "r") as f:
82              self._tasks = json.load(f)
```

```
main.py:
57  print("isinstance(audited_tasks, TaskList):", isinstance(audited_tasks, TaskList))
58  for task in audited_tasks:
59      print(describe_task(task))
60
61  print("=== TaskList and LoggingTaskList both satisfy the Persistable contract ===")  # ← new
62  print("isinstance(my_tasks, Persistable):", isinstance(my_tasks, Persistable))        # ← new
63  print("isinstance(audited_tasks, Persistable):", isinstance(audited_tasks, Persistable))  # ← new
```

As a whole, `Persistable` now formally declares — and, per this
lesson's second unit's own proof, genuinely enforces — that anything
inheriting from it must provide real `save` and `load` methods.
`TaskList` already did, from Lesson 8 onward, so this change requires
editing nothing about `TaskList`'s own body at all — only its class
statement changes, from `class TaskList:` to
`class TaskList(Persistable):`. `LoggingTaskList`, inheriting from
`TaskList`, transitively inherits from `Persistable` too, per this
lesson's first unit's own MRO mechanism, with zero changes needed to
`LoggingTaskList`'s own definition at all.

### Mechanical Walkthrough

- `from abc import ABC, abstractmethod` — the same import statement as
  this lesson's second unit's own lab.
- `class Persistable(ABC):` — a `class` statement with inheritance
  syntax; `Persistable` inherits from `ABC` (full treatment above),
  making `ABCMeta`'s enforcement apply to it and to anything that, in
  turn, inherits from `Persistable` itself.
- `@abstractmethod` / `def save(self, path: str) -> None:` / `...` —
  the identical pattern as this lesson's second unit's own `Shape.area`
  — a required method with no real implementation, hinted (Lesson 2,
  restated per the Repetition Rule) with the exact same signature
  `TaskList.save` already uses.
- `@abstractmethod` / `def load(self, path: str) -> None:` / `...` —
  the same pattern, for `load`.
- `class TaskList(Persistable):` — `TaskList`'s own class statement,
  now naming `Persistable` as its parent instead of no parent at all
  (an implicit, ordinary inheritance from `object`, per Lesson 4's own
  finding, in every previous version of this line).
- `def save(self, path: str) -> None:` / its real body — unchanged from
  Lesson 8; because this method's signature and name match
  `Persistable.save` exactly, and because it's a real implementation
  (no `@abstractmethod` marker anywhere on it), `ABCMeta`'s
  requirement is satisfied the moment `TaskList` itself is defined —
  nothing about this method's own body needed to change at all.
- `def load(self, path: str) -> None:` / its real body — the identical
  situation, satisfying `Persistable.load`'s requirement.
- `isinstance(my_tasks, Persistable)`, in `main.py` — `isinstance`
  (Lesson 2, restated per the Repetition Rule); per Lesson 9's own
  proof that `isinstance` checks against every ancestor in a class's
  MRO, and this lesson's first unit's own MRO mechanism, `my_tasks`'s
  real MRO now includes `Persistable` (`TaskList`, `Persistable`,
  `ABC`, `object`), so this check correctly reports `True`.
- `isinstance(audited_tasks, Persistable)` — the identical check,
  applied to a `LoggingTaskList` instance; its MRO
  (`LoggingTaskList`, `TaskList`, `Persistable`, `ABC`, `object`) also
  includes `Persistable`, so this reports `True` too, with zero code
  in `LoggingTaskList` itself needing to change.

### CS Lens

This reappears both mechanisms from earlier in this lesson, restated in
full per the Repetition Rule, now specifically as real, applied
project features:

```
Also recognized in: Python's own standard-library collections.abc
module (defines real abstract base classes like Iterable and
Container, formalizing exactly the informal protocols Lessons 5 and 10
already covered — TaskList could, in principle, also be declared to
implement collections.abc.Iterable and collections.abc.Sized directly,
a natural extension this project doesn't pursue here but easily
could), the Repository pattern in software architecture generally
(defining an abstract interface for "how data gets persisted," with
concrete implementations — file-based, database-based, in-memory —
swappable behind it, which is precisely the role Persistable is
positioned to play for this project even though it currently has only
one concrete implementation), Java's Serializable interface (a
directly analogous "this type supports being persisted" marker
interface, though Java's version carries no required methods at all —
worth noting as a real point of difference from Persistable's stronger,
method-requiring contract), and plugin architectures generally, across
many languages (a plugin system very often defines an abstract
interface new plugins must implement, checked the identical way
ABCMeta checks TaskList here, before a plugin is even allowed to load)
```

### SE Lens

The alternative — leaving `TaskList` without `Persistable` at all,
relying purely on the fact that it happens to already have `save` and
`load` methods, with no formal declaration of that fact — was rejected
here specifically because it leaves the requirement implicit and
unenforced for any *future* class that might want to participate in
whatever "persistable" means for this project: without `Persistable`,
nothing would stop a new class from claiming to be persistable (in a
docstring, say) while genuinely forgetting one of the two required
methods, the exact silent-failure risk this lesson's second unit's own
SE Lens already named. The real, honest cost, worth stating directly:
`Persistable`, exactly like `ABC`'s own general limitation from this
lesson's second unit, enforces only that `save` and `load` exist and
aren't still abstract — it says nothing about whether `TaskList.save`
and `TaskList.load` actually round-trip correctly, a property this
project has only ever verified through Lesson 8's own real, executed
save/load test, not through anything `Persistable` itself checks or
guarantees.

### Commands Needed

The updated project runs and checks the same way every previous
lesson's project code has: `python3 main.py`, `mypy main.py`.

### Run It

The real, updated project's relevant new output:

```
=== TaskList and LoggingTaskList both satisfy the Persistable contract ===
isinstance(my_tasks, Persistable): True
isinstance(audited_tasks, Persistable): True
```

Both instances correctly satisfy the `Persistable` contract — proof
that `TaskList`'s existing `save`/`load` methods, written back in
Lesson 8 with no knowledge that this lesson would eventually formalize
them, already met the exact shape this lesson's `Persistable` requires,
needing zero changes to either method's own body. `mypy main.py`
reports:

```
Success: no issues found in 1 source file
```

### Connection

This unit is where every mechanism this lesson built came together on
real project code: the first unit's proof that `isinstance` and the
MRO work correctly across a multi-level chain is exactly why
`LoggingTaskList`, two levels removed from `Persistable`, still
correctly satisfies it; the second unit's proof that `ABC` genuinely
enforces required methods, rather than merely documenting them, is
exactly what `Persistable` now guarantees for `TaskList` and any future
class built the same way; and the composition-based comparison earlier
in this unit is the concrete, executed version of the exact tradeoff
`LoggingTaskList`'s own continued use of inheritance, unchanged since
Lesson 9, has been quietly carrying the entire time.

---

## Connect the Pieces

Trace `isinstance(audited_tasks, Persistable)`, from the project's own
`main.py`, through everything this lesson built. `audited_tasks` is a
`LoggingTaskList` instance; per this lesson's first unit's own C3
linearization proof, its real MRO is `LoggingTaskList`, `TaskList`,
`Persistable`, `ABC`, `object` — a chain, not a diamond, but computed by
the identical algorithm, and directly inspectable the identical way
`Diamond.__mro__` was. `isinstance` walks that exact chain (Lesson 9's
own mechanism) and finds `Persistable` present in it, reporting `True`
— correctly, because `TaskList`, `LoggingTaskList`'s own direct parent,
genuinely does inherit from `Persistable`, and per this lesson's second
unit's own `ABCMeta` proof, that inheritance was only even permitted in
the first place because `TaskList` provides real, non-abstract `save`
and `load` methods — had it not, `TaskList()` itself would have failed
to construct with the identical `TypeError` this lesson's own
`Broken()` produced, and this entire project would never have run past
its very first `TaskList()` call, all the way back in Lesson 5. And had
`LoggingTaskList` been built this lesson's own composition-based way
instead — the real, executed alternative this unit built and compared
directly — this exact `isinstance` check would have reported `False`,
the identical, concrete divergence `LoggingByComposition` demonstrated,
proving Lesson 9's inheritance choice for `LoggingTaskList` was not
merely stylistic: it's the specific, load-bearing reason this final
check succeeds at all.
