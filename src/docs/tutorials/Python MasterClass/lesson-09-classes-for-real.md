# Lesson 9: Classes, For Real — Bound Methods, `__repr__`, and Inheritance

**What you will build.** `class`, `__init__`, and `self` have already
appeared, correctly used and correctly explained, in three separate
lessons — `CountUpTo` in Lesson 5, `TaskList` itself, `save`/`load` in
Lesson 8 — but always in service of something else: the iterator
protocol, generators, context managers. This lesson finally makes
classes the actual subject. You'll prove, directly, that `instance.
method()` is not special syntax at all — it's `Class.method(instance)`,
with Python quietly constructing a real, distinct **bound method**
object to make that happen, and you'll inspect that object's own
attributes to see exactly how it remembers which instance it belongs
to. You'll then give a class control over how it prints, discovering
the real difference between `__repr__` and `__str__` — and why `print`
falls back to one when the other's missing. Finally, you'll build a
small inheritance hierarchy, override a method, and use `super()` to
extend a parent's behavior rather than fully replace it — then apply
all three of these mechanisms directly to the project: `TaskList`
finally gets a real `__repr__`, and a new `LoggingTaskList` subclass
proves inheritance works on your own code, not just on a toy example.
The transferable problem: `self`, method binding, `ToString()`-style
representation methods, and `base.Method()`-style superclass calls all
exist under different names in C#, Java, and virtually every
class-based language you'll touch next. Once you've watched Python
construct a bound method object by hand and inspected its own
`__self__` and `__func__`, a C# delegate bound to an instance — the
mechanism `this` relies on under the hood — won't need re-deriving.
You'll already know exactly what question it's answering.

**What you need to know first.** Every previous use of `class`,
`__init__`, and `self` in this curriculum — Lesson 5's `CountUpTo` and
`TaskList`, Lesson 8's `save`/`load` — because this lesson assumes you
can already write and read an ordinary method definition correctly;
what's new here is *what actually happens* when one is called, not how
to write one. Lesson 4's proof that a class is itself an object, an
instance of `type` — this lesson's first unit extends that proof
directly, to the methods *inside* a class, which turn out to be
ordinary function objects (per Lesson 4) until the exact moment they're
accessed through an instance.

**Terms used in this lesson**

- **Bound method** — a real, distinct object Python constructs the
  moment you access a method through an instance (`c.increment`, not
  `Counter.increment`), which remembers exactly which instance it
  belongs to and automatically supplies that instance as the method's
  `self` argument when called. This term exists because this lesson's
  first unit proves, directly, that this object is genuinely different
  from — not just a friendlier way of writing — the plain function
  object a class's own method definition actually is.
- **`__self__`** — an attribute every bound method object carries,
  holding the exact instance it was bound to. This term exists because
  it's the concrete, inspectable proof this lesson's first unit relies
  on: not an assertion that a bound method "remembers its instance,"
  but a real attribute you can read directly to confirm it.
- **`__func__`** — an attribute every bound method object carries,
  holding the original, plain function object — the same one you'd get
  from `Class.method`, with no instance attached — that the bound
  method wraps. This term exists to name the other half of a bound
  method's own structure: it's built from exactly two pieces, an
  instance (`__self__`) and a function (`__func__`), and calling the
  bound method is precisely calling `__func__` with `__self__` supplied
  as its first argument.
- **`__repr__`** — a dunder method (Lesson 5 introduced this term in
  full; restated per the Repetition Rule) a class can define to control
  what an unambiguous, developer-facing text representation of an
  instance looks like — used by the built-in `repr()` function, and by
  `print()`/`str()` as a fallback when `__str__` isn't defined. This
  term exists because it's the direct fix for the ugly default output
  this lesson's second unit demonstrates on a class with no
  representation method at all.
- **`__str__`** — a dunder method a class can define to control what a
  readable, user-facing text representation of an instance looks like
  — used by the built-in `str()` function, and by `print()`
  specifically, in preference to `__repr__` when both are defined. This
  term exists to be directly contrasted with `__repr__`: they serve
  genuinely different audiences (developer-facing versus user-facing),
  and this lesson's second unit proves directly that Python consults
  them in a specific, distinct order depending on which built-in
  function or statement is asking.
- **Inheritance** — a mechanism where a new class (a subclass) is
  defined in terms of an existing one (its superclass or parent class),
  automatically gaining every method and attribute the parent defines,
  unless the subclass explicitly overrides one. This term exists to
  name the entire mechanism this lesson's third unit is built around —
  the ability to reuse and specialize existing class behavior without
  copying its code.
- **Method overriding** — a subclass defining a method with the same
  name as one its parent already defines, replacing (or, via `super()`,
  extending) the parent's version for instances of the subclass
  specifically. This term exists because it's the precise mechanism
  this lesson's third unit's `Dog.speak` and the project's own
  `LoggingTaskList.add` both use.
- **`super()`** — a built-in function, called with no arguments inside
  a method, that returns a special proxy object letting you call the
  *parent* class's version of a method you're currently overriding —
  rather than the current class's own version, which would just call
  itself again. This term exists because it's the specific tool this
  lesson's third unit uses to *extend* a parent's behavior (run the
  parent's version, then do more) rather than fully replacing it, the
  distinction this lesson's own `Dog`/`Cat` contrast makes directly.
- **Method Resolution Order (MRO)** — the specific, fixed order Python
  searches through a class and its ancestors when looking up a method
  or attribute name, visible directly via a class's own `__mro__`
  attribute. This term exists because this lesson's third unit inspects
  it directly, as concrete proof that "which class's method actually
  runs" isn't guesswork or convention — it's a real, fixed, inspectable
  sequence.

**Objects and methods used**

- **`repr`**
  - *What it is:* A built-in function, available everywhere with no
    import.
  - *Implementation:* `repr(object) -> str`. Takes any object; returns
    its `__repr__` result.
  - *Its use:* This lesson's second unit needs a direct way to ask for
    an object's unambiguous, developer-facing representation, separate
    from whatever `print()` might show if `__str__` is also defined —
    `repr()` is exactly that direct request.
  - *Type:* A built-in free function.
  - *Responsibility:* Its full charter is calling the given object's own
    `__repr__` method and returning whatever it produces — every
    Python object has *some* `__repr__`, even if a class never defines
    one itself (a default, inherited one produces the `<ClassName
    object at 0x...>` form this lesson's second unit shows directly).
  - *Depends on:* A single argument — any object.
  - *Connects to:* Called directly in this lesson's second lab; calls
    the argument's own `__repr__` method (whichever one is actually in
    effect for that object's class, per this lesson's third unit's own
    MRO mechanism); returns that method's result unchanged.
  - *Shape:* Always a `str`.

- **`str`**
  - *What it is:* A built-in class, used here as a callable
    (`str(object)`) — the same "calling a class constructs something"
    mechanism Lesson 5 established for `Point()`, applied to a
    built-in type this curriculum hasn't formally called this way
    before.
  - *Implementation:* `str(object) -> str`. Takes any object; returns
    its `__str__` result if the object's class defines one, or falls
    back to its `__repr__` result otherwise.
  - *Its use:* This lesson's second unit needs a way to directly request
    an object's readable, user-facing text form — distinct from
    `repr()`'s always-developer-facing one — to prove the two can
    genuinely differ.
  - *Type:* A built-in class (per Lesson 4's own proof that `type(str)`
    would report `<class 'type'>`, exactly like any other class).
  - *Responsibility:* Its full charter is producing a readable string
    form of the given object — falling back to `__repr__` specifically
    when no `__str__` exists is the precise fallback rule this lesson's
    second unit proves directly.
  - *Depends on:* A single argument — any object.
  - *Connects to:* Called directly in this lesson's second lab; checks
    the object's class for a `__str__` method first, calling it if
    present; otherwise calls `__repr__` instead.
  - *Shape:* Always a `str`.

**Everything else in the file, not this lesson's subject but still explained.**

- **`print`, `type`, `isinstance`, `id`**
  - All fully covered in previous lessons and reappearing here
    unchanged; used throughout this lesson's labs exactly as already
    established.

---

## Concept Unit: `instance.method()` Is Really `Class.method(instance)`

### The Problem

Every method call this curriculum has written — `my_tasks.add(...)`,
`counter.increment()`, hundreds of others — has worked without ever
asking a specific mechanical question: `self`, the method's first
parameter, is never explicitly supplied at the call site
(`c.increment()` passes zero arguments, yet `increment`'s own
definition takes one, `self`) — so what is actually filling it in, and
when? Lesson 4 already proved a method, looked up on the *class*
directly, is an ordinary function object — so where does the missing
argument come from the moment you call it through an *instance*
instead?

> **Before reading on:** Lesson 4 proved `type(Counter.increment)`
> would report `<class 'function'>` — an ordinary function, taking
> `self` as an explicit first parameter, the same as any other
> parameter. If `c.increment()` genuinely calls that exact same
> function object, with no special call syntax involved, what would
> `Counter.increment(c)` — calling it directly off the class, supplying
> `c` explicitly as the first argument — need to produce, for the two
> to actually be doing the identical thing? And if accessing a method
> through an instance (`c.increment`, no parentheses — just the
> attribute access) does something to fill in that first argument
> automatically, what kind of object would that access need to return —
> the exact same function object `Counter.increment` is, or something
> different?

### Isolating the Concept

```python
class Counter:
    def __init__(self, start):
        self.value = start

    def increment(self):
        self.value += 1
        return self.value

c = Counter(10)
print(type(c.increment))
print(type(Counter.increment))
print(c.increment is Counter.increment)
```

Real output:

```
type(c.increment): <class 'method'>
type(Counter.increment): <class 'function'>
c.increment is Counter.increment: False
```

`Counter.increment` — accessed on the *class* — is exactly what Lesson
4 already proved: `<class 'function'>`, an ordinary function object,
taking `self` explicitly. `c.increment` — the same name, accessed
through an *instance* — is a genuinely different kind of object
entirely: `<class 'method'>`, not `<class 'function'>`. This is called
a **bound method** (defined in Terms, above), and `c.increment is
Counter.increment` being `False` proves it's not merely a
friendlier-looking reference to the same function object — it's a
distinct object Python constructs at the moment of attribute access.

```python
print(c.increment.__self__ is c)
print(c.increment.__func__ is Counter.increment)
```

Real output:

```
c.increment.__self__ is c: True
c.increment.__func__ is Counter.increment: True
```

A bound method object carries exactly two pieces: `__self__` (defined
in Terms, above), which is `c` itself, and `__func__` (defined in
Terms, above), which is `Counter.increment` — the same plain function
object. This is the actual mechanism behind `self` never being written
explicitly at a call site: `c.increment()` calls the bound method
object, which, per its own `__func__`/`__self__` structure, calls
`Counter.increment(c)` — passing `__self__` as the first argument,
`self` — automatically.

Proof this is exactly equivalent, not merely analogous:

```python
print(Counter.increment(c))
print(c.value)
print(c.increment())
print(c.value)
```

Real output:

```
Counter.increment(c): 11
c.value after that call: 11
c.increment(): 12
c.value after that call: 12
```

Calling `Counter.increment(c)` directly, with `c` supplied explicitly
as the first argument, produces the identical effect and return value
as `c.increment()` — both increment `c.value` from `10` to `11` (and
then `11` to `12`) in exactly the same way, because they are,
underneath, the exact same operation: `Counter.increment`, called with
`c` bound to `self`.

A final lab proves a bound method isn't reused, either — a fresh one is
constructed on every single access:

```python
print(c.increment is c.increment)
```

Real output:

```
c.increment is c.increment: False
```

Two separate accesses of `c.increment`, in the same expression,
produce two genuinely different bound method objects — each one freshly
constructed, wrapping the identical `__self__`/`__func__` pair, but not
the same object as any other access. This mirrors Lesson 6's own proof
that `iter()` on a `list` constructs a fresh iterator every time it's
called — attribute access producing a bound method is a comparably
lightweight, on-demand construction, not a cached, reused object.

### Discarding the Example

All throwaway code shown here — `Counter` and every script driving it
— is deleted now and won't appear in later lessons or project code. It
existed only to expose, in the smallest possible form, exactly what
object `instance.method` produces and exactly how it relates to calling
the method directly off the class.

### Project Change

No project change in this unit — this unit proves a mechanism every
method call in this project has already been correctly using since
Lesson 5, without needing to add anything new to the project itself.

### Mechanical Walkthrough

- `class Counter:` — a `class` statement (Lesson 4, restated per the
  Repetition Rule).
- `def __init__(self, start):` / `self.value = start` — a method
  definition and instance-attribute assignment (Lesson 5, restated per
  the Repetition Rule).
- `def increment(self):` — a method definition, taking only `self`.
- `self.value += 1` — an augmented assignment (Lesson 3, restated per
  the Repetition Rule), rebinding the instance attribute `value` to one
  more than its current value (a new int object, per Lesson 1's
  immutability finding).
- `return self.value` — a `return` statement (Lesson 2), handing back
  the (new) current value.
- `c = Counter(10)` — constructs a new `Counter` instance (Lesson 5,
  restated per the Repetition Rule), bound to `c`.
- `type(c.increment)` — `c.increment` is attribute access (Lesson 4,
  restated per the Repetition Rule) on the instance `c`, retrieving a
  bound method object (per this unit's own finding); `type()` (Lesson
  1, restated per the Repetition Rule), applied to it, reports
  `<class 'method'>`.
- `type(Counter.increment)` — the same attribute access, this time on
  the class `Counter` directly, retrieving the plain function object;
  `type()` reports `<class 'function'>`.
- `c.increment is Counter.increment` — the `is` operator (Lesson 1,
  restated per the Repetition Rule), confirming these are genuinely
  different objects.
- `c.increment.__self__` — attribute access on the bound method object
  itself, retrieving the instance it wraps.
- `c.increment.__func__` — attribute access on the bound method object,
  retrieving the plain function it wraps.
- `Counter.increment(c)` — a direct function call on the plain function
  object retrieved via `Counter.increment`, with `c` supplied
  explicitly as the first positional argument — filling the role `self`
  plays inside `increment`'s own body, manually, the same role a bound
  method fills automatically.
- `c.increment()` — the ordinary method-call syntax, calling the bound
  method object with no arguments; per this unit's own finding, this is
  equivalent to `Counter.increment(c)`, with `c` (the bound method's own
  `__self__`) supplied automatically rather than written explicitly.
- `c.increment is c.increment` — two separate attribute accesses,
  compared via `is`, each constructing its own fresh bound method
  object.

### CS Lens

This is a hard concept — that a method call is really a disguised
function call with an extra argument automatically supplied — so, per
the Repetition Rule, several unrelated recurrences:

```
Also recognized in: C#'s delegates bound to an instance (a
delegate created from `instance.Method` captures the instance the same
way a Python bound method's __self__ does — calling it later still
operates on that captured instance), JavaScript's `this` binding and
`Function.prototype.bind()` (JavaScript's own, notoriously trickier
version of the identical problem — deciding what `this` refers to
inside a function depends on *how* it's called, and `.bind()` exists
specifically to permanently attach an instance the way Python does
automatically), Go's method values (`instance.Method`, evaluated
without calling it, produces a genuine function value with the
receiver already bound in — nearly identical terminology and mechanism
to Python's own bound method), and the general concept of partial
application / currying in functional programming (a bound method is,
structurally, a function with its first argument already supplied,
waiting only for the rest — exactly what partial application means)
```

### SE Lens

The alternative — requiring every method call to explicitly pass the
instance as an argument, the way `Counter.increment(c)` does, with no
`c.increment()` shorthand at all — was rejected because it would make
every single method call in every Python program more verbose, with no
compensating benefit; the bound-method mechanism this unit just proved
exists specifically to make `self`'s automatic supply invisible at
ordinary call sites, while still being fully inspectable, and fully
equivalent to the explicit form, the moment you actually need to look
underneath it. The real cost, worth naming honestly: constructing a
fresh bound method object on every single attribute access, proven
directly by this unit's `c.increment is c.increment` check, is not
free — it's a small, real allocation every time, which is part of why
performance-sensitive code sometimes deliberately caches a bound method
in a local variable (`increment = c.increment`, calling `increment()`
repeatedly afterward) rather than re-accessing `c.increment` on every
call.

### Commands Needed

Run the same way as every previous lesson: `python3 lab1.py`. Nothing
new.

### Run It

Already shown and verified above, under "Isolating the Concept."

### Connection

This unit proved every method call in this project's own code has
always been this exact bound-method mechanism, working correctly and
invisibly. The next unit asks a different question about the same
class instances: what controls how one looks when you `print()` it —
and why does a class with no answer to that question produce the ugly,
memory-address-based output this curriculum has never had to look at
directly, because every class built so far happened to avoid ever being
printed on its own?

---

## Concept Unit: `__repr__` and `__str__` — Controlling How an Object Looks

### The Problem

`print(some_dict)` has always produced readable output throughout this
curriculum — `{'id': 1, 'title': 'Write lesson 3', ...}` — because
`dict` is a built-in type whose own class already defines how it should
be displayed. What happens when you `print()` an instance of a class
*this curriculum wrote*, with no special printing logic added at all?

> **Before reading on:** Lesson 4 proved every object has a real type,
> and Lesson 1 proved every object has a real, unique identity —
> exactly the two pieces of information `id()` and `type()` already
> expose directly. If a class defines nothing at all about how its
> instances should be displayed, what's the most honest, generic thing
> Python could show when you `print()` one — something built purely
> from those two already-available facts (the class name, and some
> stand-in for the object's unique identity), or would Python simply
> refuse, with an error, since no display logic was ever provided?

### Isolating the Concept

```python
class PlainPoint:
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = PlainPoint(3, 4)
print(p)
print(repr(p))
```

Real output:

```
<__main__.PlainPoint object at 0x7f791e0c3b90>
<__main__.PlainPoint object at 0x7f791e0c3b90>
```

Exactly the Socratic prompt's prediction: the class name
(`PlainPoint`), the module it's defined in (`__main__`, for a
top-level script), and a memory-address-based stand-in for identity —
genuinely correct, genuinely useless for actually understanding what
this particular `PlainPoint` instance holds. This is Python's default,
inherited `__repr__` (defined in Terms, above) — every class gets one
automatically, whether or not it defines its own, per Lesson 4's own
proof that every class ultimately descends from `type`'s own base
object type.

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Point(x={self.x}, y={self.y})"

q = Point(3, 4)
print(q)
print(repr(q))
print(str(q))
print([q, q])
```

Real output:

```
Point(x=3, y=4)
Point(x=3, y=4)
Point(x=3, y=4)
[Point(x=3, y=4), Point(x=3, y=4)]
```

Defining `__repr__` changes every one of these: `print(q)`, `repr(q)`,
and `str(q)` (full treatment in Objects and methods, above) all now
show the same, genuinely informative text — because `str()`, per its
own documented fallback rule, uses `__repr__` when a class defines no
separate `__str__` (defined in Terms, above) of its own. `[q, q]`
printing with real `Point(...)` text for each element, rather than
memory addresses, proves something further: a `list`'s own printing
logic calls `repr()` on each of its elements individually — this is why
defining `__repr__` alone, with no `__str__` at all, is often
sufficient for a class to display sensibly everywhere it's likely to
show up, including nested inside another container.

The sharper distinction:

```python
class PointWithStr:
    def __init__(self, x, y):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"PointWithStr(x={self.x}, y={self.y})"

    def __str__(self):
        return f"({self.x}, {self.y})"

r = PointWithStr(3, 4)
print(r)
print(str(r))
print(repr(r))
print([r])
```

Real output:

```
(3, 4)
(3, 4)
PointWithStr(x=3, y=4)
[PointWithStr(x=3, y=4)]
```

With both methods defined, `print(r)` and `str(r)` now show the shorter,
`__str__` version — `(3, 4)` — while `repr(r)` shows the longer,
`__repr__` version. And `[r]` — the object nested inside a list — still
shows the `__repr__` form, `PointWithStr(x=3, y=4)`, *not* the `__str__`
form, confirming directly that a container's own display always uses
`repr()` on its elements, regardless of whether `__str__` exists.

### Discarding the Example

All throwaway code shown here — `PlainPoint`, `Point`, `PointWithStr`,
and every script driving them — is deleted now and won't appear in
later lessons or project code. It existed only to isolate exactly which
built-in function or statement consults `__repr__` versus `__str__`,
and in what order.

### Project Change

- **Reference Source:** No reference counterpart — original to this
  project, same as every previous unit in this curriculum.
- **Files affected:** `project/tasks.py` (modified), `project/main.py`
  (modified).
- **Change type:** Add — a `__repr__` method on the existing `TaskList`
  class; `main.py` updated to print a `TaskList` directly.
- **Location:** `__repr__` is added directly after `load`, established
  in Lesson 8; `main.py`'s existing code is left unchanged, with a new
  line added near the end.
- **Dependencies:** None new.

### The New Code

```python
    def __repr__(self) -> str:
        return f"TaskList({self._tasks!r})"
```

### The Updated Project

```
tasks.py:
70  def load(self, path: str) -> None:
71      with open(path, "r") as f:
72          self._tasks = json.load(f)
73
74      def __repr__(self) -> str:                       # ← new
75          return f"TaskList({self._tasks!r})"          # ← new
```

```
main.py:
45  print("Same number of tasks:", len(list(reloaded_tasks)) == len(list(my_tasks)))
46
47  print("=== Printing a TaskList directly, now that it has __repr__ ===")  # ← new
48  print(my_tasks)                                                          # ← new
```

As a whole, `TaskList` now shows something genuinely useful when
printed or inspected — its full internal task list, rather than the
default `<tasks.TaskList object at 0x...>` this unit's own first lab
demonstrated for a class with no `__repr__` of its own. `main.py`, as a
whole, now includes one direct demonstration of this: printing
`my_tasks` itself, rather than only ever printing individual tasks via
`describe_task`.

### Mechanical Walkthrough

- `def __repr__(self) -> str:` — a method definition (Lesson 5,
  restated per the Repetition Rule) with a hinted return type (Lesson
  2, restated per the Repetition Rule); `__repr__` (full treatment in
  Terms, above), taking only `self`.
- `return f"TaskList({self._tasks!r})"` — a `return` statement whose
  value is an f-string (Lesson 2, restated per the Repetition Rule)
  interpolating `self._tasks` — the instance's own internal list — with
  a `!r` conversion flag: new syntax to this curriculum, though
  directly explainable now that `repr()` has full treatment above —
  `{self._tasks!r}` inside an f-string is equivalent to writing
  `{repr(self._tasks)}`, explicitly requesting the `repr()` form of
  `self._tasks` (a `list` of `dict`s, whose own default string
  conversion already happens to look like valid Python syntax) rather
  than its `str()` form, which, for a `list`, are identical anyway, but
  using `!r` here is a deliberate, correct habit for writing a class's
  own `__repr__`: its contents should be shown in as unambiguous a form
  as possible, which is precisely what `repr()`, not `str()`, is
  documented to guarantee.
- `print(my_tasks)`, in `main.py` — `print` (Lesson 1, restated per the
  Repetition Rule), given the `TaskList` instance `my_tasks` directly;
  per this unit's own finding, since `TaskList` defines no separate
  `__str__`, this call falls back to using `TaskList.__repr__`, showing
  the full internal task list.

### CS Lens

This reappears the object-representation idea from earlier in this
lesson, restated in full per the Repetition Rule, now specifically as a
real, applied improvement to the project's own debuggability:

```
Also recognized in: C#'s ToString() (overridden on a class exactly the
way __str__ is here, controlling what appears when an object is
concatenated into a string or passed to Console.WriteLine — C# has no
direct equivalent split between an unambiguous developer-facing form
and a readable user-facing one the way Python's __repr__/__str__ pair
does), Java's toString() (the same single-method mechanism as C#'s),
JavaScript's toString()/Symbol.toStringTag, and, more broadly, the
general software engineering principle that a well-designed object
should be able to describe itself — a real aid during debugging, since
a REPL, a debugger, or a log statement printing an object with a good
__repr__ tells you immediately what's actually inside it, rather than
an opaque memory address
```

### SE Lens

The alternative — never defining `__repr__` on a project's own
classes, relying entirely on the default, inherited version — was
rejected here specifically because of what this unit's own first lab
demonstrated directly: the default is genuinely useless for
understanding an object's actual contents, which matters most exactly
when you need it most — while debugging, when something has already
gone wrong and you're trying to understand what a specific object
actually holds. The real cost of `TaskList.__repr__`'s own specific
implementation, worth naming honestly: it shows the *entire* internal
task list, unabridged — for a `TaskList` holding a very large number of
tasks, `print(my_tasks)` would produce an enormous, likely unreadable
wall of text, a real tradeoff between "always show everything" (this
project's current, simple choice) and a more sophisticated
`__repr__` that might summarize instead (e.g., `TaskList(3 tasks)`) at
the cost of hiding detail that's sometimes exactly what you need.

### Commands Needed

The updated project runs and checks the same way every previous
lesson's project code has: `python3 main.py`, `mypy main.py`.

### Run It

The real, updated project's relevant new output:

```
=== Printing a TaskList directly, now that it has __repr__ ===
TaskList([{'id': 1, 'title': 'Write lesson 3', 'priority': 1, 'done': True}, {'id': 2, 'title': 'Review lesson 3', 'priority': 2, 'done': False}])
```

`mypy main.py` reports:

```
Success: no issues found in 1 source file
```

### Connection

This unit gave `TaskList` a genuinely useful printed form, closing a
gap that's existed silently since Lesson 5 — every previous lesson
printed *individual tasks* via `describe_task`, never the `TaskList`
itself, which would have shown the ugly default this unit's first lab
demonstrated directly. The next unit asks whether `TaskList`'s own
behavior can be specialized — extended, not fully replaced — without
duplicating any of its existing code.

---

## Concept Unit: Inheritance, `super()`, and `LoggingTaskList`

### The Problem

Suppose some part of a larger program built on this project needs every
task addition to be logged — printed, or written somewhere, the moment
it happens — but *only* in that specific part of the program, not
everywhere `TaskList` is used. Copying `TaskList`'s entire class
definition, just to add one line inside `add`, would duplicate every
other method — `__iter__`, `pending`, `by_id`, `save`, `load`,
`__repr__` — for no reason at all. Is there a way to build a new class
that automatically gets every one of `TaskList`'s existing methods, and
only needs to define the *one* method it actually wants to change?

> **Before reading on:** if a new class could somehow declare "I am
> everything `TaskList` already is, plus this one extra thing," what
> would the new class's own definition need to contain — a full copy of
> every method, or just the one new (or changed) piece, with some way
> of pointing back at `TaskList` for everything else? And for the one
> method you *do* want to change — `add`, say — would you want to fully
> replace `TaskList`'s own version, or is there a version of "change
> it" that still runs the original logic (actually appending the task)
> in addition to whatever new behavior you're adding?

### Isolating the Concept

```python
class Animal:
    def __init__(self, name):
        self.name = name

    def speak(self):
        return f"{self.name} makes a sound"

    def __repr__(self):
        return f"Animal({self.name!r})"


class Dog(Animal):
    def speak(self):
        return f"{self.name} barks"

a = Animal("Generic")
d = Dog("Rex")
print(a.speak())
print(d.speak())
```

Real output:

```
Generic makes a sound
Rex barks
```

`class Dog(Animal):` — **inheritance** (defined in Terms, above):
`Dog` is defined *in terms of* `Animal`, written in parentheses after
the class name. `Dog` defines nothing beyond `speak` — no `__init__`,
no `__repr__` — and yet `d.name` works correctly (proven by `d.speak()`
successfully interpolating it), because `Dog`, having no `__init__` of
its own, automatically uses `Animal.__init__` instead. `speak` itself is
a genuine **method override** (defined in Terms, above): `Dog`'s own
version completely replaces `Animal`'s for any `Dog` instance —
`d.speak()` never runs `Animal.speak` at all.

```python
print(isinstance(d, Dog))
print(isinstance(d, Animal))
print(isinstance(a, Dog))
print(type(d) is Dog)
print(type(d) is Animal)
```

Real output:

```
isinstance(d, Dog): True
isinstance(d, Animal): True
isinstance(a, Dog): False
type(d) is Dog: True
type(d) is Animal: False
```

`isinstance(d, Animal)` is `True` — a `Dog` instance genuinely *is* an
`Animal` instance too, per this exact inheritance relationship,
confirming Lesson 4's own `isinstance` distinction (checking against a
type *or any of its subclasses*) applies here directly. `type(d) is
Animal`, by contrast, is `False` — `d`'s exact, specific type is still
`Dog`, never `Animal`, even though `Dog` extends it; `isinstance(a,
Dog)` being `False` confirms this relationship only goes one direction
— an `Animal` is not automatically a `Dog`.

```python
class Cat(Animal):
    def __init__(self, name, indoor):
        super().__init__(name)
        self.indoor = indoor

    def speak(self):
        base = super().speak()
        return f"{base}, specifically: meow"

c = Cat("Whiskers", indoor=True)
print(c.name, c.indoor)
print(c.speak())
```

Real output:

```
Whiskers True
Whiskers makes a sound, specifically: meow
```

`Cat` proves the alternative to full replacement: `super()` (defined in
Terms, above), called inside `Cat.__init__`, returns a proxy letting
`Cat` call `Animal.__init__` directly — `super().__init__(name)` — which
sets `self.name`, exactly as `Animal`'s own constructor already knows
how to do, without `Cat` duplicating that logic itself. `Cat.speak`
does the identical thing for `speak`: `super().speak()` runs `Animal`'s
own version first (producing `"Whiskers makes a sound"`), and `Cat`'s
own version *extends* that result rather than replacing it outright —
exactly the distinction this unit's own Socratic prompt asked about.

```python
print(Dog.__mro__)
print(Cat.__mro__)
```

Real output:

```
(<class '__main__.Dog'>, <class '__main__.Animal'>, <class 'object'>)
(<class '__main__.Cat'>, <class '__main__.Animal'>, <class 'object'>)
```

This is the **Method Resolution Order** (defined in Terms, above): the
real, fixed, inspectable sequence Python searches when looking up any
name on a `Dog` or `Cat` instance — `Dog` itself first, then `Animal`,
then `object` (the ultimate base every class in Python descends from,
per Lesson 4's own proof about `type`). This is precisely why
`d.speak()` finds `Dog`'s own override before ever considering
`Animal`'s version, and why `Dog`, having no `__repr__` of its own,
still finds `Animal.__repr__` at the next step in this exact sequence:

```python
print(repr(d))
```

Real output:

```
Animal('Rex')
```

`Dog` never defined `__repr__` at all — this output is `Animal`'s own
`__repr__`, found and used automatically via the same MRO search,
proving **inheritance** grants every unoverridden method, not just the
ones a subclass happens to call directly.

### Discarding the Example

All throwaway code shown here — `Animal`, `Dog`, `Cat`, and every
script driving them — is deleted now and won't appear in later lessons
or project code. It existed only to isolate inheritance, overriding,
`super()`, and the MRO in the smallest possible hierarchy.

### Project Change

- **Reference Source:** No reference counterpart — original to this
  project, same as every previous unit in this curriculum.
- **Files affected:** `project/tasks.py` (modified), `project/main.py`
  (modified).
- **Change type:** Add — a new `LoggingTaskList` class, subclassing the
  existing `TaskList`.
- **Location:** `LoggingTaskList` is added directly after `TaskList`'s
  own definition, at the end of `tasks.py`; `main.py`'s existing code
  is left unchanged, with new lines added at the end.
- **Dependencies:** None new — `class`, inheritance syntax, and
  `super()` are all covered earlier in this lesson.

### The New Code

```python
class LoggingTaskList(TaskList):
    def add(self, task: dict) -> None:
        print(f"[log] adding task id={task['id']}: {task['title']!r}")
        super().add(task)
```

### The Updated Project

```
tasks.py:
49  class TaskList:
50      def __init__(self):
...
74      def __repr__(self) -> str:
75          return f"TaskList({self._tasks!r})"
76
77
78  class LoggingTaskList(TaskList):                                          # ← new
79      def add(self, task: dict) -> None:                                    # ← new
80          print(f"[log] adding task id={task['id']}: {task['title']!r}")    # ← new
81          super().add(task)                                                 # ← new
```

```
main.py:
 1  from tasks import create_task, create_id_generator, describe_task, TaskList, LoggingTaskList  # ← changed
...
48  print(my_tasks)
49
50  print("=== A LoggingTaskList — a real subclass of TaskList ===")          # ← new
51  audited_tasks = LoggingTaskList()                                          # ← new
52  audited_tasks.add(task_a)                                                  # ← new
53  audited_tasks.add(task_b)                                                  # ← new
54  print("isinstance(audited_tasks, TaskList):", isinstance(audited_tasks, TaskList))  # ← new
55  for task in audited_tasks:                                                 # ← new
56      print(describe_task(task))                                            # ← new
```

As a whole, `LoggingTaskList` is a complete, working `TaskList` — it
inherits `__iter__`, `pending`, `by_id`, `priorities_used`, `save`,
`load`, and `__repr__` entirely unchanged, exactly the way `Dog`
inherited `Animal.__repr__` — and overrides only `add`, extending its
behavior (log, then genuinely add) rather than replacing it. `main.py`,
as a whole, now demonstrates it directly: adding both existing tasks to
a `LoggingTaskList` instead of an ordinary `TaskList`, printing a log
line for each, then iterating over it exactly like any other
`TaskList` — because, per `isinstance(audited_tasks, TaskList)`, it
genuinely is one.

### Mechanical Walkthrough

- `class LoggingTaskList(TaskList):` — a `class` statement with
  inheritance syntax (full treatment in this lesson's third unit,
  restated per the Repetition Rule): `LoggingTaskList` is defined in
  terms of the already-established `TaskList`, automatically gaining
  every method `TaskList` defines.
- `def add(self, task: dict) -> None:` — a method definition (Lesson
  5, restated per the Repetition Rule) with the identical signature as
  `TaskList.add`, which is what makes this a genuine **method
  override** (defined in Terms, above): any code calling `.add(...)`
  on a `LoggingTaskList` instance finds this version first, per the
  MRO this lesson's third unit already proved governs the search.
- `print(f"[log] adding task id={task['id']}: {task['title']!r}")` —
  `print` (Lesson 1, restated per the Repetition Rule), given an
  f-string (Lesson 2, restated per the Repetition Rule) interpolating a
  subscript access (Lesson 3, restated per the Repetition Rule),
  `task['id']`, and a second one, `task['title']`, this time with the
  `!r` conversion flag (full treatment in this lesson's second unit,
  restated per the Repetition Rule) — requesting the `repr()` form of
  the title string specifically, so it displays with its own quote
  marks, making clear in the log output exactly where the title's text
  begins and ends.
- `super().add(task)` — `super()` (full treatment in this lesson's
  third unit, restated per the Repetition Rule), called with no
  arguments, returns a proxy for `LoggingTaskList`'s own parent,
  `TaskList`; `.add(task)` on that proxy calls `TaskList`'s own,
  original `add` method — the one that actually appends to
  `self._tasks` — with `self` (the current `LoggingTaskList` instance)
  automatically supplied, per this lesson's first unit's own
  bound-method mechanism.
- `audited_tasks = LoggingTaskList()` — constructs a new
  `LoggingTaskList` instance (Lesson 5, restated per the Repetition
  Rule); because `LoggingTaskList` defines no `__init__` of its own, it
  uses `TaskList.__init__` automatically, per this lesson's third
  unit's own MRO-based lookup — setting `self._tasks` to a new, empty
  list exactly as an ordinary `TaskList()` would.
- `audited_tasks.add(task_a)` — a method call; per this unit's own
  override, this runs `LoggingTaskList.add`, not `TaskList.add`
  directly — printing the log line, then calling `super().add(task_a)`,
  which does append it.
- `isinstance(audited_tasks, TaskList)` — `isinstance` (Lesson 2,
  restated per the Repetition Rule), confirming, per this lesson's
  third unit's own proof about inheritance and `isinstance`, that
  `audited_tasks` genuinely is a `TaskList` — not merely
  "similar to" one.
- `for task in audited_tasks:` — the iterator protocol (Lesson 5,
  restated per the Repetition Rule); `audited_tasks.__iter__` is found
  via the MRO, resolving to `TaskList.__iter__` — `LoggingTaskList`
  never defined its own, so it's inherited unchanged, exactly the way
  `Dog` inherited `Animal.__repr__`.

### CS Lens

This is a hard concept — reusing and specializing existing behavior
through a formal class relationship, rather than copying code — so, per
the Repetition Rule, several unrelated recurrences:

```
Also recognized in: C#'s class inheritance and `base.Method()` (the
direct, near-identical counterpart to Python's `super()` — calling the
parent class's version of an overridden method from inside the
override), Java's `extends` keyword and `super.method()` (the same
mechanism, near-identical syntax), the Decorator design pattern from
object-oriented software engineering (LoggingTaskList "wraps" TaskList
conceptually, adding behavior around an existing operation — though
built here through inheritance rather than composition, worth noting
as a real, deliberate design choice this unit's own SE Lens returns
to), and biological taxonomy itself, the domain the word "inheritance"
is borrowed from (a species inherits traits from its genus, which
inherits from its family, and so on — the same "more general category
first, more specific category overriding or adding detail" shape this
unit's own MRO makes literal and inspectable)
```

### SE Lens

The alternative — building `LoggingTaskList`'s logging behavior through
composition instead of inheritance (a class that *holds* a `TaskList`
instance as an attribute, and forwards calls to it manually, the same
delegation pattern Lesson 5's own `TaskList.__iter__` already used for
`self._tasks`) — was not chosen here, and the tradeoff is worth naming
honestly rather than treating inheritance as simply "the" answer: with
inheritance, `LoggingTaskList` gets every one of `TaskList`'s existing
and *future* methods automatically, for free, with zero forwarding code
— but it's also tightly, structurally coupled to `TaskList`'s exact
implementation; if `TaskList`'s own internal `self._tasks` attribute
were ever renamed or restructured, `LoggingTaskList`'s inherited
methods would be affected by that change too, since it's genuinely
built *from* `TaskList`, not merely *using* one. A composition-based
version would need one line of forwarding code per method it wants to
expose — more code, but a more contained, independently-changeable
relationship between the two classes. Both are legitimate, real design
choices; inheritance was chosen here specifically because
`LoggingTaskList` genuinely *is* a `TaskList` in every sense — every
existing method makes just as much sense on it as on the original — the
exact condition under which inheritance, rather than composition, is
usually the better fit.

### Commands Needed

The updated project runs and checks the same way every previous
lesson's project code has: `python3 main.py`, `mypy main.py`.

### Run It

The real, updated project's relevant new output:

```
=== A LoggingTaskList — a real subclass of TaskList ===
[log] adding task id=1: 'Write lesson 3'
[log] adding task id=2: 'Review lesson 3'
isinstance(audited_tasks, TaskList): True
[!!!] Write lesson 3 (id=1) — CRITICAL
[!] Review lesson 3 (id=2) — high priority
```

Both log lines appear before either task's description — proving
`LoggingTaskList.add`'s own `print` runs, correctly, before
`super().add(task)` actually appends anything, exactly matching this
unit's own code order. `mypy main.py` reports:

```
Success: no issues found in 1 source file
```

### Connection

This unit is where every rule this lesson established became a real,
working project feature: the first unit's proof that a method call is
`Class.method(instance)`, with `self` automatically supplied, is
exactly the mechanism `super().add(task)` relies on — `super()`
supplies the *current* `self` to `TaskList`'s own `add`, the identical
automatic-binding behavior, just directed at a specific ancestor rather
than the instance's own most-derived class; the second unit's `__repr__`
work is exactly what `LoggingTaskList` inherits unchanged, per this
unit's own MRO proof, with zero code of its own needed to get it.

---

## Connect the Pieces

Trace `audited_tasks.add(task_a)`, from the project's own `main.py`,
through everything this lesson built. Per this lesson's first unit,
`audited_tasks.add` is attribute access producing a fresh bound method
object — `__self__` bound to `audited_tasks`, `__func__` bound to
whichever `add` the MRO search (this lesson's third unit) actually
finds first: `LoggingTaskList.add`, since it's defined directly on
`audited_tasks`'s own class, before the search would ever reach
`TaskList`. Calling that bound method runs `LoggingTaskList.add`'s own
body: the `print(f"[log] ...")` line executes first, exactly as
written; then `super().add(task)` — per this lesson's third unit's own
mechanism — reaches past `LoggingTaskList` in the MRO to find
`TaskList`'s own `add`, and calls *that* function, with `self` (still
`audited_tasks`, the exact same instance the whole call started with)
supplied automatically, the identical bound-method mechanism this
lesson's first unit proved governs every method call in this
curriculum, applied here one level further through the inheritance
chain rather than at the most-derived class directly. `TaskList.add`'s
own body then runs its one real line — `self._tasks.append(task)` — and
`task_a` is genuinely appended to `audited_tasks`'s own `_tasks` list.
Later, `print(my_tasks)` — a completely separate, ordinary `TaskList`
instance — uses this lesson's second unit's own `__repr__`, and if it
had instead been `print(audited_tasks)`, the identical `__repr__` would
run, found via the exact same MRO search, since `LoggingTaskList` never
overrode it — inherited, per this lesson's third unit, exactly the way
`Dog` inherited `Animal.__repr__`, with zero code of `LoggingTaskList`'s
own needed to make it work correctly.
