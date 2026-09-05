# Lesson 12: Decorators — Functions Wrapping Functions, For Real

**What you will build.** You'll write a decorator from scratch, as a
completely ordinary function, with no `@` syntax anywhere — proving
directly that `@logged` above a function definition is nothing more
than `func = logged(func)`, immediately after `def func(...):`, per
Lesson 4's own proof that functions are ordinary objects a name can be
rebound to. You'll then trigger a real, easy-to-miss bug this exact
pattern causes on its own: a decorated function's `__name__` and
`__doc__` silently become the *wrapper's*, not the original function's
— and fix it with `functools.wraps`. You'll build a decorator that
itself takes an argument — a decorator *factory* — and finally apply
one directly to the project: a `@logged` decorator wrapping a plain
function, giving you a genuine *third* way to add logging behavior to
task creation, standing directly next to Lesson 11's inheritance-based
`LoggingTaskList` and its composition-based alternative, with one sharp
fact — `isinstance` — dividing all three the same way it divided the
first two. The transferable problem: decorators are Python's own name
for a pattern that shows up constantly elsewhere — C#'s attributes
combined with aspect-oriented frameworks, Java's annotations paired
with frameworks like Spring that act on them, and, more directly,
higher-order functions wrapping other functions in any language with
first-class functions at all (JavaScript middleware in Express is
structurally identical). Once you've built one by hand and hit its real
gotcha yourself, `[Obsolete]` in C# or `@Override` in Java won't read as
unrelated syntax — you'll recognize the underlying shape immediately.

**What you need to know first.** Lesson 4's proof that functions are
ordinary, storable, passable objects — this lesson's entire first unit
is a direct application of that fact: a decorator is only possible
because a function can be passed into another function and a new
function can be returned in its place, exactly the higher-order-function
mechanism Lesson 4's `apply_greeting` already demonstrated. Lesson 3's
closures — the inner `wrapper` function this lesson builds closes over
`func`, the exact same enclosing-scope mechanism Lesson 3's
`create_id_generator` used for `current_id`, applied here to a
function object instead of an int.

**Terms used in this lesson**

- **Decorator** — a function that takes another function (or, per this
  lesson's third unit, is itself produced by a function that takes
  something else first) and returns a new function meant to replace it,
  usually one that runs some extra behavior around a call to the
  original. This term exists to name the general pattern this entire
  lesson builds, layer by layer — first by hand, with no special
  syntax, before the `@` syntax is shown to be nothing more than a
  shorthand for it.
- **`@` syntax** — the notation `@decorator_name`, placed directly
  above a function or method definition, that applies a decorator to
  the function defined immediately below it. This term exists to be
  directly, precisely equated with an ordinary reassignment statement —
  this lesson's first unit proves `@logged` above `def multiply(...):`
  is exactly equivalent to writing `def multiply(...): ...` followed by
  `multiply = logged(multiply)`, nothing more and nothing hidden.
- **`*args`** — a parameter, prefixed with a single `*`, that collects
  any number of extra positional arguments into a `tuple`. This term
  exists because a decorator's own inner wrapper function almost always
  needs to accept whatever arguments the *original* function accepts,
  without knowing in advance what those are — `*args` is the specific
  syntax that makes a function's parameter list genuinely open-ended.
- **`**kwargs`** — a parameter, prefixed with two asterisks, that
  collects any number of extra keyword arguments into a `dict`. This
  term exists for the identical reason as `*args`, covering the keyword
  side of a call rather than the positional side — together, `*args`
  and `**kwargs` are what let a wrapper function forward an arbitrary,
  unknown call signature through to the function it wraps.
- **`functools.wraps`** — a decorator, itself part of Python's
  standard-library `functools` module, applied to a wrapper function
  *inside* a decorator's own definition, that copies the original
  function's `__name__`, `__doc__`, and other identifying metadata onto
  the wrapper. This term exists because this lesson's second unit
  proves directly what breaks without it, and `functools.wraps` is the
  specific, standard fix — not a general technique you'd have to
  reinvent yourself each time.
- **Decorator factory** — a function that takes ordinary arguments
  (like a label or a configuration value) and *returns* a real
  decorator, rather than being a decorator itself. This term exists to
  name the extra layer of indirection this lesson's third unit builds:
  `@logged("task-list")` isn't `logged` itself decorating a function —
  it's `logged("task-list")` being *called first*, and *that* call's
  return value is the actual decorator applied to whatever function
  follows.

**Objects and methods used**

- **`functools.wraps`**
  - *What it is:* A function from Python's standard-library `functools`
    module (imported via `import functools`, the same mechanism Lesson
    8 established for `json`), used as a decorator itself.
  - *Implementation:* `functools.wraps(original_func)` returns a real
    decorator; applying *that* decorator to a wrapper function copies
    `original_func`'s `__name__`, `__doc__`, and a handful of other
    attributes onto the wrapper, then returns the wrapper (now
    carrying that copied metadata) unchanged in every other respect.
  - *Its use:* This lesson's second unit needs a way to fix the exact
    metadata loss its own first lab demonstrates directly —
    `functools.wraps` is the standard, correct tool, rather than
    something this lesson has you reinvent by hand.
  - *Type:* A function, used via decorator syntax — itself an example
    of this lesson's own subject, applied one level up: `functools.
    wraps` is a decorator *factory* (per this lesson's third unit's own
    term), since `functools.wraps(func)` is called first, with `func`
    as its argument, and the result of *that* call is the real
    decorator applied to `wrapper`.
  - *Responsibility:* Its full charter is copying a fixed, specific set
    of identifying attributes from one function onto another — it does
    not change either function's actual runtime behavior at all, only
    what introspection (`__name__`, `__doc__`, and similar) reports
    about the wrapper afterward.
  - *Depends on:* The original function whose metadata should be
    copied, supplied as its own argument; the wrapper function it's
    then applied to, in the ordinary decorator position.
  - *Connects to:* Applied directly above every `wrapper` function this
    lesson's second and third labs define; reads `func`'s own
    `__name__`/`__doc__` (the same `func` the enclosing decorator
    closes over, per Lesson 3's own closure mechanism); writes those
    same values onto `wrapper` before `wrapper` is returned.
  - *Shape:* Returns a decorator — a function that, given `wrapper`,
    returns that same `wrapper` object, now carrying copied metadata
    attributes.

**Everything else in the file, not this lesson's subject but still explained.**

- **`print`, `type`, `isinstance`**
  - All fully covered in previous lessons and reappearing here
    unchanged; used throughout this lesson's labs exactly as already
    established.

---

## Concept Unit: A Decorator Is Just a Function Taking a Function

### The Problem

`@abstractmethod`, in Lesson 11, was used correctly and explained
enough to understand that specific case — but only that specific case.
What does the `@` symbol actually *do*, mechanically, in general — and
is it special syntax with its own separate rules, or something this
curriculum has already fully explained the pieces of, without ever
assembling them into this exact shape?

> **Before reading on:** Lesson 4 already proved a function is an
> ordinary object — storable in a list, passable as an argument,
> returnable from another function, no different from an int or a
> string in any of those respects. If a decorator is "just" a function
> that takes a function and returns a function, using nothing beyond
> what Lesson 4 already proved is possible, what would the *simplest
> possible* decorator look like — one that does nothing at all beyond
> proving the mechanism works? And separately: if `@some_name` above a
> function definition really does reduce to an ordinary reassignment,
> what exactly would that reassignment need to say, in plain code, with
> no `@` involved at all?

### Isolating the Concept

```python
def logged(func):
    def wrapper(*args, **kwargs):
        print(f"calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"{func.__name__} returned {result!r}")
        return result
    return wrapper

def add(a, b):
    return a + b

logged_add = logged(add)
print(type(logged_add))
print(logged_add(2, 3))
print(add(2, 3))
```

Real output:

```
type(logged_add): <class 'function'>
calling add
add returned 5
logged_add(2, 3): 5
add(2, 3) directly, still unlogged: 5
```

`logged` is nothing exotic — an ordinary function (per Lesson 4's own
proof, `type(logged_add)` confirming it's a plain `<class 'function'>`,
not some special decorator-only type) that takes another function,
`add`, and returns a *third* function, `wrapper`, defined and returned
from inside `logged`'s own body — this is called a **decorator**
(defined in Terms, above). `logged_add`, the returned `wrapper`, closes
over `func` (bound to `add`) the exact way Lesson 3's
`create_id_generator` closed over `current_id` — a real closure, not a
copy, which is how `wrapper`'s own body can still refer to `func` long
after `logged`'s own call has already returned. `add(2, 3)` directly,
completely unaffected by any of this, proves `logged` never modified
`add` itself — it built a *new* function, `wrapper`, that happens to
call `add` internally.

```python
@logged
def multiply(a, b):
    return a * b

print(multiply(4, 5))
```

Real output:

```
calling multiply
multiply returned 20
multiply(4, 5): 20
```

This is called **`@` syntax** (defined in Terms, above), and this
unit's own opening finding proves exactly what it does: `@logged`
directly above `def multiply(a, b):` is equivalent, with zero hidden
behavior, to writing the function definition first and then
`multiply = logged(multiply)` immediately after — `logged` is called
with the just-defined `multiply` as its argument, and the name
`multiply` is rebound to whatever `logged` returns, the identical
rebinding mechanism Lesson 1 established for every assignment
statement in this curriculum.

A third lab confirms this equivalence directly, side by side:

```python
def square(a):
    return a * a

square_v1 = logged(square)

@logged
def square_v2(a):
    return a * a

print(square_v1(5))
print(square_v2(5))
print(type(square_v1) is type(square_v2))
```

Real output:

```
calling square
square returned 25
square_v1(5): 25
calling square_v2
square_v2 returned 25
square_v2(5): 25
both produce identical wrapper behavior: True
```

`square_v1`, built with the manual `logged(square)` call, and
`square_v2`, built with `@logged` syntax, behave identically — the
exact same printed logging, the exact same return value, the exact
same resulting type. `@` syntax is convenience, not a separate
mechanism.

### Discarding the Example

`logged`, `add`, `multiply`, `square`, `square_v1`, and `square_v2`, in
this exact throwaway form, are deleted now and won't appear in later
lessons or project code. They existed only to isolate exactly what a
decorator is, and to prove `@` syntax is nothing more than the
reassignment it visually replaces.

### Project Change

No project change in this unit — this unit establishes the core
mechanism; the real, fixed version of `logged` — accounting for the
next unit's own finding — is what the project actually applies.

### Mechanical Walkthrough

- `def logged(func):` — a function definition (Lesson 2, restated per
  the Repetition Rule), taking one parameter, `func` — the function
  this decorator will wrap.
- `def wrapper(*args, **kwargs):` — a nested function definition
  (Lesson 3, restated per the Repetition Rule, for the mechanism of a
  function defined inside another), with two genuinely new parameters:
  `*args` (defined in Terms, above), collecting any number of
  positional arguments into a `tuple`, and `**kwargs` (defined in
  Terms, above), collecting any number of keyword arguments into a
  `dict` — together letting `wrapper` accept a call with *any* argument
  shape at all, without `logged` needing to know in advance what
  `func` itself expects.
- `print(f"calling {func.__name__}")` — `print` (Lesson 1, restated per
  the Repetition Rule), given an f-string (Lesson 2, restated per the
  Repetition Rule) interpolating `func.__name__` — a real attribute
  every function object carries, per Lesson 4's own proof that a
  function is an ordinary object with real, inspectable attributes;
  `func` itself is resolved here via Lesson 3's own enclosing-scope
  mechanism — `wrapper` doesn't own `func`, it reads it from `logged`'s
  own local namespace, exactly the way Lesson 3's `increment` read
  `current_id`.
- `result = func(*args, **kwargs)` — an assignment statement (Lesson 1)
  whose right-hand side calls `func` — the wrapped function — passing
  `*args` and `**kwargs` (the identical asterisk syntax, used here on
  the *calling* side rather than the parameter-definition side, to
  unpack the collected tuple and dict back out into individual
  positional and keyword arguments, exactly reversing what collecting
  them in `wrapper`'s own parameter list did).
- `print(f"{func.__name__} returned {result!r}")` — `print`, given an
  f-string using the `!r` conversion flag (Lesson 9, restated per the
  Repetition Rule) to show `result`'s `repr()` form.
- `return result` — a `return` statement (Lesson 2), handing back
  whatever `func` itself returned — this is what makes `wrapper` a
  genuine, transparent substitute for `func`, not merely a function
  that logs and discards the real return value.
- `return wrapper`, at the end of `logged`'s own body — a `return`
  statement whose value is the function object `wrapper` itself (per
  Lesson 4's own proof that a function name, evaluated, yields the
  function object it's bound to, not a call to it).
- `logged_add = logged(add)` — an assignment statement whose
  right-hand side is a direct call to `logged`, passing `add`; the
  returned `wrapper` object (with `func` permanently bound to `add` via
  its own closure) is bound to `logged_add`.
- `@logged` / `def multiply(a, b): return a * b` — `@` syntax (defined
  in Terms, above): `multiply` is defined normally first, then
  immediately passed to `logged`, whose return value is rebound to the
  name `multiply` — exactly the reassignment this unit's own second lab
  proves it to be.

### CS Lens

This is a hard concept — a general mechanism for wrapping behavior
around an existing function, expressed as ordinary function composition
— so, per the Repetition Rule, several unrelated recurrences:

```
Also recognized in: middleware in web frameworks generally (Express.js
middleware, Django/Flask request handlers wrapped in decorators — the
identical "wrap a handler function with extra behavior that runs before
and/or after it" shape, often literally implemented using Python
decorators in Flask's own case), aspect-oriented programming as a
formal paradigm (a programming style built specifically around
attaching cross-cutting behavior — logging, timing, access control — to
existing functions or methods without modifying their own source,
exactly this lesson's own logged example), C#'s attributes combined
with a reflection-based framework acting on them (structurally
different mechanically, but solving the identical "attach extra
behavior to a method declaratively" problem), and the mathematical
concept of function composition itself (f(g(x)) — a decorator is,
formally, exactly this: logged(multiply) produces a new function that
is the composition of logged's own wrapping behavior around multiply)
```

### SE Lens

The alternative — writing the logging (or timing, or any other
cross-cutting behavior) directly inside every function that needs it,
by hand, every time — was rejected because it duplicates identical
boilerplate across every function that needs the same behavior, and
couples that behavior permanently to each function's own body, making
it impossible to add or remove without editing every single function
individually. A decorator centralizes that behavior once, applying it
declaratively via `@logged` wherever it's needed. The real, honest
cost, which this lesson's own next unit demonstrates directly rather
than merely asserting: writing a decorator correctly is genuinely
easy to get subtly wrong — this exact `logged`, as written in this
unit, has a real bug, invisible until you specifically check for it.

### Commands Needed

Run the same way as every previous lesson: `python3 lab1.py`. Nothing
new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
all three parts of this unit's lab.

### Connection

This unit proved a decorator is an ordinary function, and `@` syntax
is ordinary reassignment. The next unit exposes the real bug this
unit's own `logged` was carrying the whole time — one that has nothing
to do with `logged`'s own logging behavior, and everything to do with
what wrapping silently costs a function's own identity.

---

## Concept Unit: The Metadata Trap — `functools.wraps`

### The Problem

This lesson's first unit's own `multiply`, decorated with `@logged`,
worked correctly — calling it, logging around it, returning the right
value. But "worked correctly" only covered *calling* it. What happens
if some other piece of code, elsewhere, tries to inspect `multiply`
itself — asking, say, `multiply.__name__`, expecting the string
`"multiply"` back, the way it always has for every undecorated function
this curriculum has written?

> **Before reading on:** this lesson's first unit's `logged` returns
> `wrapper` — a genuinely different function object from the one it
> wraps, with its own separate name inside `logged`'s own source
> (`def wrapper(*args, **kwargs):`). If `multiply = logged(multiply)`
> really does rebind the name `multiply` to that returned `wrapper`
> object, what would you predict `multiply.__name__` reports —
> `"multiply"`, because that's the name you, the reader, think of it
> by, or something else, given that `__name__`, per Lesson 4, is a real
> attribute belonging to the actual function *object*, not to whatever
> name happens to currently point at it?

### Isolating the Concept

```python
def logged(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@logged
def multiply(a, b):
    """Multiply two numbers together."""
    return a * b

print(multiply.__name__)
print(multiply.__doc__)
```

Real output:

```
multiply.__name__: wrapper
multiply.__doc__: None
```

Exactly the sharper of the two Socratic predictions: `multiply.
__name__` reports `"wrapper"`, not `"multiply"` — because, per this
unit's own Socratic prompt, `__name__` belongs to the actual object,
and the actual object bound to `multiply`, after decoration, genuinely
is the `wrapper` function `logged` defined and returned — its own
`__name__`, set the moment *it* was defined, was always `"wrapper"`,
regardless of what outer name it later got bound to. `multiply.__doc__`
being `None` is the identical problem: `multiply`'s original docstring,
`"Multiply two numbers together."`, belonged to the *original*
function object — the one now sitting only inside `logged`'s own
closure, reachable as `func`, but no longer reachable as `multiply`
itself at all.

The fix:

```python
import functools

def logged_fixed(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper

@logged_fixed
def subtract(a, b):
    """Subtract b from a."""
    return a - b

print(subtract.__name__)
print(subtract.__doc__)
print(subtract(10, 3))
```

Real output:

```
subtract.__name__: subtract
subtract.__doc__: Subtract b from a.
subtract(10, 3): 7
```

Adding `@functools.wraps(func)` (full treatment in Objects and methods,
above) directly above `wrapper`'s own definition fixes both: `subtract.
__name__` and `subtract.__doc__` now correctly report the *original*
function's identity, even though `subtract`, per this unit's own
finding, is still genuinely the `wrapper` object underneath — `wraps`
doesn't change *which* object gets returned; it copies the original's
identifying metadata onto that returned wrapper before handing it back.

### Discarding the Example

Both versions of the decorator shown here — the broken `logged` and the
fixed `logged_fixed` — are deleted now in this exact throwaway form.
The real version this curriculum keeps, built in the next unit,
includes `functools.wraps` from the start, as a matter of course, not
an afterthought.

### Project Change

No project change in this unit — the real, project-facing decorator,
including both this unit's `functools.wraps` fix and the next unit's
own decorator-factory extension, is built directly in the next unit.

### Mechanical Walkthrough

- `def logged(func):` / `def wrapper(*args, **kwargs):` / `return
  func(*args, **kwargs)` / `return wrapper` — the same pattern as this
  lesson's first unit, with the logging `print` calls removed here to
  isolate the metadata issue specifically, uncluttered by
  logging-related output.
- `@logged` / `def multiply(a, b):` / `"""Multiply two numbers
  together."""` / `return a * b` — the identical decoration pattern as
  before, this time with a real docstring (a string literal placed as
  the very first statement inside a function's body — genuinely narrow
  syntax to this exact lab, not this lesson's own subject, beyond
  noting that Python automatically makes it available as the
  function's `__doc__` attribute).
- `multiply.__name__` — attribute access (Lesson 4, restated per the
  Repetition Rule) on whatever object the name `multiply` is currently
  bound to — per this unit's own finding, `wrapper`, not the original
  function.
- `multiply.__doc__` — the same attribute access, retrieving `wrapper`'s
  own docstring — `None`, since `wrapper`'s own definition, inside
  `logged`, never included one.
- `import functools` — an import statement (Lesson 2, restated per the
  Repetition Rule).
- `@functools.wraps(func)`, directly above `def wrapper(...):` — a
  call to `functools.wraps` (full treatment in Objects and methods,
  above), given `func` — the original function this decorator is
  wrapping — as its argument; the *result* of that call is the actual
  decorator applied to `wrapper`, immediately below it — this is
  itself an instance of this lesson's own third unit's upcoming
  concept, a decorator produced by calling a function first, though
  fully usable and correctly explained here already, since
  `functools.wraps` ships already built this way in Python's own
  standard library.
- `subtract.__name__`, `subtract.__doc__` — the same attribute
  accesses as before, now correctly retrieving `"subtract"` and the
  real docstring, because `functools.wraps` copied both onto `wrapper`
  before `logged_fixed` returned it.
- `subtract(10, 3)` — calling `subtract` still works exactly as before
  — `functools.wraps` only ever touches metadata attributes, never the
  function's actual calling behavior.

### CS Lens

This is a hard concept — the distinction between an object's runtime
*behavior* and its *introspectable identity*, and a real, common way
wrapping code silently damages the latter without touching the former —
so, per the Repetition Rule, several unrelated recurrences:

```
Also recognized in: JavaScript's Function.prototype.bind() and its own
effect on a function's .name property (a bound function's own .name
becomes "bound originalName" — a comparably surprising, real metadata
side effect of a comparable wrapping operation), reflection-based
debugging tools generally, across many languages (a stack trace or
debugger relying on a function's reported name to show where an error
actually occurred becomes actively misleading if that name has been
silently replaced by wrapping — this is not a hypothetical concern;
Python's own tracebacks would show "wrapper" instead of "multiply"
for every single decorated call, without functools.wraps), API
documentation generators that read docstrings automatically (a
documentation tool scanning multiply.__doc__ to build reference docs
would silently produce nothing, or the wrong thing, for any decorated
function missing this fix), and general software engineering
principles around transparent wrapping / the "principle of least
astonishment" (a wrapped object should, as much as possible, behave and
report itself identically to the thing it wraps, precisely so that code
depending on it doesn't have to know or care that wrapping happened at
all)
```

### SE Lens

The alternative — simply accepting that decorated functions report the
wrong `__name__`/`__doc__`, treating it as a minor, ignorable cosmetic
issue — was rejected by Python's own standard library specifically
because it isn't merely cosmetic: debugging tools, tracebacks, help()
output, and any documentation-generation tooling all rely on accurate
function metadata, and a codebase using decorators heavily, with none
of them using `functools.wraps`, accumulates a real, compounding
debugging cost — every traceback through decorated code reports
`wrapper` instead of the actual function that failed, actively
obscuring exactly the information you'd need most while tracking down a
real bug. The real, honest cost of the fix itself: `functools.wraps`
has to be remembered and applied, by hand, inside *every* decorator you
write — Python does not do this automatically for you, and forgetting
it (exactly as this unit's own first lab demonstrated) produces no
error, no warning, nothing — only silently wrong metadata that surfaces
later, in exactly the debugging scenario where it's least convenient
to discover.

### Commands Needed

Run the same way as every previous lesson: `python3 lab2.py`. Nothing
new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
both parts of this unit's lab.

### Connection

This unit proved a real, silent bug ordinary decoration causes, and the
standard fix for it. The next unit adds one more layer — a decorator
that itself needs to be *configured*, via an argument — and applies the
complete, corrected pattern directly to the project, as a genuine third
alternative to Lesson 11's inheritance- and composition-based logging
approaches.

---

## Concept Unit: Decorator Factories, and `@logged` Applied to the Project

### The Problem

This lesson's own `logged` decorator, so far, has no way to customize
its behavior — every function it wraps gets the identical log message
format, with nothing distinguishing, say, task-related logging from
some other, unrelated part of a larger program that might also want
logging, but with its own distinct label. `@logged("task-list")` —
syntax with something *inside* the parentheses, right where `@logged`
alone had nothing — looks like it should let you pass configuration
in. Does it actually work that way, and if so, what does `logged`
itself need to look like to support it?

> **Before reading on:** this lesson's second unit already used exactly
> this shape once, without pausing to name it:
> `@functools.wraps(func)` — `functools.wraps` was *called*, with
> `func` as an argument, and *that call's return value* was the real
> decorator applied to `wrapper`. If `@logged("task-list")` works the
> identical way, what would `logged` itself need to return — not a
> wrapped function directly, but something else first? And what would
> that "something else" need to do with the function it's eventually
> given, once `@` syntax actually applies it?

### Isolating the Concept

The mechanism this unit needs was already demonstrated, without being
named, inside this lesson's own second unit's `@functools.wraps(func)`
line. Naming it directly and building one from scratch:

```python
import functools

def logged_with_label(label):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            print(f"[{label}] calling {func.__name__}")
            return func(*args, **kwargs)
        return wrapper
    return decorator

print(type(logged_with_label))
print(type(logged_with_label("math")))

@logged_with_label("math")
def divide(a, b):
    return a / b

print(divide(10, 2))
print(divide.__name__)
```

Real output:

```
type(logged_with_label): <class 'function'>
type(logged_with_label('math')): <class 'function'>
[math] calling divide
divide(10, 2): 5.0
divide.__name__: divide
```

`logged_with_label` is called a **decorator factory** (defined in
Terms, above): it's not itself a decorator — it takes `label`, an
ordinary string, and returns `decorator`, a genuine decorator (a
function taking `func` and returning `wrapper`, the identical shape
this lesson's first unit already established), which is *itself* then
applied to whatever function follows `@logged_with_label("math")` in
the source. `divide.__name__` correctly reporting `"divide"` confirms
`functools.wraps`, nested one level deeper here, still does its job
correctly regardless of how many layers of function-returning-function
sit above it.

A second lab proves the label genuinely varies per use, not fixed once
globally:

```python
@logged_with_label("inventory")
def restock(item):
    return f"restocked {item}"

print(restock("bolts"))
print(divide(20, 4))
```

Real output:

```
[inventory] calling restock
restocked bolts
[math] calling divide
5.0
```

Two entirely separate calls to `logged_with_label`, each with its own
`label`, produce two entirely separate `decorator`/`wrapper` closures —
`restock`'s wrapper closes over `label = "inventory"`; `divide`'s
closes over `label = "math"` — the identical independent-closure
mechanism Lesson 3's own `counter1`/`counter2` proved directly, applied
here to a string configuration value instead of an int counter.

### Discarding the Example

`logged_with_label`, `divide`, and `restock`, in this exact throwaway
form, are deleted now. The real version this curriculum keeps, applied
directly to the project below, uses the identical pattern.

### Project Change

- **Reference Source:** No reference counterpart — original to this
  project, same as every previous unit in this curriculum.
- **Files affected:** `project/tasks.py` (modified), `project/main.py`
  (modified).
- **Change type:** Add — a `functools` import, a `logged` decorator
  factory, and a decorated standalone function, `add_task`, all
  appended to `tasks.py`; `main.py` updated to demonstrate it as a
  third, genuinely different alternative to Lesson 11's two approaches.
- **Location:** The `functools` import is added at the top of
  `tasks.py`, alongside the existing `json` and `abc` imports; `logged`
  and `add_task` are added at the end of the file, after
  `LoggingTaskList`, established in Lesson 9; `main.py`'s existing code
  is left unchanged, with new lines added at the end.
- **Dependencies:** The `functools` module, part of Python's own
  standard library.

### The New Code

```python
def logged(label: str):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            print(f"[{label}] calling {func.__name__}")
            return func(*args, **kwargs)
        return wrapper
    return decorator


@logged("task-list")
def add_task(task_list: TaskList, task: dict) -> None:
    task_list.add(task)
```

### The Updated Project

```
tasks.py:
101 class LoggingTaskList(TaskList):
102     def add(self, task: dict) -> None:
103         print(f"[log] adding task id={task['id']}: {task['title']!r}")
104         super().add(task)
105
106
107 def logged(label: str):                                          # ← new
108     def decorator(func):                                          # ← new
109         @functools.wraps(func)                                    # ← new
110         def wrapper(*args, **kwargs):                              # ← new
111             print(f"[{label}] calling {func.__name__}")           # ← new
112             return func(*args, **kwargs)                          # ← new
113         return wrapper                                             # ← new
114     return decorator                                               # ← new
115
116
117 @logged("task-list")                                              # ← new
118 def add_task(task_list: TaskList, task: dict) -> None:            # ← new
119     task_list.add(task)                                           # ← new
```

```
main.py:
63  print("isinstance(audited_tasks, Persistable):", isinstance(audited_tasks, Persistable))
64
65  print("=== A third alternative: logging via a decorator, no subclass at all ===")  # ← new
66  plain_tasks = TaskList()                                          # ← new
67  task_c = create_task(next_id(), "File expense report", 3)         # ← new
68  add_task(plain_tasks, task_c)                                     # ← new
69  print("isinstance(plain_tasks, LoggingTaskList):", isinstance(plain_tasks, LoggingTaskList))  # ← new
70  print("add_task.__name__:", add_task.__name__)                    # ← new
71  for task in plain_tasks:                                          # ← new
72      print(describe_task(task))                                    # ← new
```

As a whole, `tasks.py` now offers three genuinely distinct ways to add
logging around task creation: `LoggingTaskList` (Lesson 9, inheritance
— a whole new class, an `isinstance` relationship to `TaskList`
included), the throwaway `LoggingByComposition` pattern (Lesson 11,
composition — a wrapping object, no `isinstance` relationship), and now
`add_task` (this unit, decoration — an ordinary function wrapping
another ordinary function, operating on a completely plain `TaskList`
that never even knows logging is happening around it). `main.py`, as a
whole, now demonstrates the third option directly: `plain_tasks`, a
genuinely ordinary `TaskList`, gets a task added through the decorated
`add_task` function rather than through any special subclass or
wrapper object at all.

### Mechanical Walkthrough

- `def logged(label: str):` — a function definition (Lesson 2,
  restated per the Repetition Rule) with a hinted parameter; this is
  the decorator factory (full treatment in this lesson's third unit's
  own lab, restated per the Repetition Rule) — it takes `label`, an
  ordinary string, not a function.
- `def decorator(func):` — a nested function definition (Lesson 3,
  restated per the Repetition Rule), the real decorator `logged`
  returns; it closes over `label` (Lesson 3's own enclosing-scope
  mechanism, restated per the Repetition Rule).
- `@functools.wraps(func)` — the identical pattern from this lesson's
  second unit, restated per the Repetition Rule.
- `def wrapper(*args, **kwargs):` — the identical `*args`/`**kwargs`
  pattern from this lesson's first unit, restated per the Repetition
  Rule.
- `print(f"[{label}] calling {func.__name__}")` — `print`, given an
  f-string interpolating both `label` (from `decorator`'s own enclosing
  scope, one level further out than `func` itself) and
  `func.__name__`.
- `return func(*args, **kwargs)` — calls the original, wrapped function,
  forwarding whatever arguments `wrapper` itself received.
- `return wrapper`, then `return decorator` — the two return statements
  that make the whole three-layer structure work: `decorator` returns
  `wrapper`; `logged` returns `decorator`.
- `@logged("task-list")` — calls `logged` with `"task-list"`, getting
  back a real `decorator` (with `label` permanently bound to
  `"task-list"` via its own closure); *that* `decorator` is then
  applied to whatever function follows, per ordinary `@` syntax (this
  lesson's first unit, restated per the Repetition Rule).
- `def add_task(task_list: TaskList, task: dict) -> None:` — a function
  definition with two hinted parameters (Lesson 2, restated per the
  Repetition Rule) and a hinted return type; `task_list.add(task)` — a
  method call (Lesson 9's own bound-method mechanism, restated per the
  Repetition Rule) — is its entire body, forwarding directly to
  `TaskList`'s own, completely ordinary `add`.
- `add_task(plain_tasks, task_c)`, in `main.py` — calls the *decorated*
  `add_task` — per this unit's own mechanism, really calling `wrapper`,
  which logs, then calls the original `add_task` function (still
  reachable via `wrapper`'s own closure over `func`), which itself
  calls `plain_tasks.add(task_c)`.
- `isinstance(plain_tasks, LoggingTaskList)` — `isinstance` (Lesson 2,
  restated per the Repetition Rule); `plain_tasks` is an ordinary
  `TaskList`, constructed with no relationship to `LoggingTaskList`
  whatsoever, so this correctly reports `False`.
- `add_task.__name__` — attribute access, correctly reporting
  `"add_task"` rather than `"wrapper"`, per this lesson's second unit's
  own `functools.wraps` fix, applied here through two layers of
  function-returning-function rather than one.

### CS Lens

This reappears the decorator-factory idea from earlier in this lesson,
restated in full per the Repetition Rule, now specifically as a real,
applied third alternative to Lesson 11's own comparison:

```
Also recognized in: parameterized decorators across nearly every
language with decorator or annotation support (C#'s attributes commonly
accept constructor arguments — [Route("/api/tasks")], for instance,
configuring behavior the same way "task-list" configures this lesson's
own logged), Python's own standard-library functools.lru_cache(maxsize=128)
(a real, widely-used decorator factory — maxsize is a configuration
argument, structurally identical to this lesson's own label), pytest's
own @pytest.mark.parametrize(...) (a decorator factory taking real
configuration data — a list of test cases — determining how the
decorated test function actually runs), and the Strategy pattern
again, first named in Lesson 4's own CS Lens for dispatch tables — a
decorator factory is, in effect, selecting which specific "strategy"
of wrapping behavior to apply, chosen at decoration time via the
factory's own arguments
```

### SE Lens

The alternative — writing three separate, hardcoded decorators
(`logged_for_task_list`, `logged_for_inventory`, and so on, one per
desired label, with no shared parameterization at all) — was rejected
in favor of one decorator factory, `logged(label)`, precisely because
this unit's own second lab already proved the labeled versions are
otherwise identical in every other respect; a factory captures that
shared structure once, with the *only* thing that varies expressed as
an explicit, visible argument at each call site. The real, honest
tradeoff this unit's own project application makes concrete, closing
Lesson 11's own three-way comparison: `add_task`, this lesson's
decorator-based approach, requires callers to remember to use
`add_task(plain_tasks, task)` specifically, rather than
`plain_tasks.add(task)` directly — nothing about `plain_tasks` itself
changed at all, meaning the logging behavior is opt-in *per call site*,
not attached to the object the way `LoggingTaskList` (opt-in per
*instance*, via which class you construct) or `LoggingByComposition`
(opt-in per *instance*, via which wrapper you construct) both are. This
is neither strictly better nor worse than either of Lesson 11's own two
approaches — it's a genuinely different point on the same tradeoff
space, and now, with all three actually built and run, a real,
concrete one to choose from deliberately rather than by default.

### Commands Needed

The updated project runs and checks the same way every previous
lesson's project code has: `python3 main.py`, `mypy main.py`.

### Run It

The real, updated project's relevant new output:

```
=== A third alternative: logging via a decorator, no subclass at all ===
[task-list] calling add_task
isinstance(plain_tasks, LoggingTaskList): False
add_task.__name__: add_task
File expense report (id=3)
```

`isinstance(plain_tasks, LoggingTaskList)` correctly reports `False` —
`plain_tasks` never inherited from, or was wrapped by, anything
resembling `LoggingTaskList` at all; the logging happened entirely
through the decorated `add_task` function, external to `plain_tasks`
itself. `add_task.__name__` correctly reports `"add_task"`, not
`"wrapper"`, confirming `functools.wraps` did its job correctly even
through this project's own two-layer decorator-factory structure.
`mypy main.py` reports:

```
Success: no issues found in 1 source file
```

### Connection

This unit is where every mechanism this lesson built came together on
real project code, and completed Lesson 11's own three-way comparison:
the first unit's proof that a decorator is ordinary function
composition is exactly what makes `add_task` possible at all; the
second unit's `functools.wraps` fix is exactly why `add_task.__name__`
reports correctly rather than the misleading `"wrapper"` this lesson's
own second unit demonstrated directly; and this unit's own decorator
factory is exactly what lets `"task-list"` be an explicit, visible
choice at the decoration site, rather than a hardcoded, unconfigurable
detail buried inside `logged` itself.

---

## Connect the Pieces

Trace `add_task(plain_tasks, task_c)`, from the project's own
`main.py`, through everything this lesson built. Per this lesson's
third unit's own mechanism, `@logged("task-list")` first calls `logged`
with `"task-list"`, getting back `decorator` — a real function, closing
over `label = "task-list"`, per Lesson 3's own closure mechanism,
restated across every unit of this lesson. `decorator`, applied to the
just-defined `add_task` function (per this lesson's first unit's own
proof that `@` syntax is ordinary reassignment), returns `wrapper` —
and, per this lesson's second unit's own fix, `functools.wraps(func)`
has already copied the *original* `add_task`'s `__name__` onto this
`wrapper` before it's returned — which is why the name `add_task`, in
`tasks.py`'s own module namespace, ends up bound to `wrapper`, but a
`wrapper` that correctly *reports itself* as `add_task` to anything
that asks. Calling `add_task(plain_tasks, task_c)`, in `main.py`,
therefore really calls this `wrapper`: it prints
`"[task-list] calling add_task"` (reading `label` from its own
enclosing scope, and `func.__name__` — itself unaffected by the outer
metadata copy, since `func` still refers to the *original*, undecorated
function object, reachable only through this exact closure), then calls
`func(*args, **kwargs)` — the original `add_task`'s own single line,
`task_list.add(task)` — which finally reaches `TaskList.add`, the
identical, completely ordinary method Lesson 5 first wrote, entirely
unaware that anything about how it was invoked involved a decorator,
a closure, or three lessons' worth of accumulated mechanism at all.
