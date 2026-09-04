# Lesson 4: Everything Is an Object — Functions, Classes, and Modules

**What you will build.** You'll prove, directly, that a function
definition doesn't create special syntax-level "callable code" — it
creates an ordinary object, exactly the kind Lesson 1 already taught
you to reason about, that a name happens to get bound to. You'll store
functions in a list, pass one into another function as an ordinary
argument, and then build a real **dispatch table** — a dict mapping
values to functions — and use it to replace a rigid `if`/`elif` chain
in the project's own code. Finally you'll prove the same is true one
level up: a class you define is itself an object, an instance of a
built-in type called `type`; and a module you `import` is a real
object too, with a real, inspectable `__dict__` that turns out to be
the exact same dict Lesson 3's `globals()` already showed you from the
inside. The transferable problem: "first-class functions" and
"everything is an object" are phrases thrown around casually, in
Python and elsewhere, without most people ever actually confirming what
they mean operationally. Once you've proven it here — with `id()`,
`type()`, and `is`, the same tools Lesson 1 gave you — a C# delegate, a
Java functional interface, or JavaScript's function-as-value model
won't feel like a special case bolted onto an otherwise class-based
language. It'll feel like the same idea you already fully understand,
implemented with different syntax.

**What you need to know first.** Lesson 1's object model in full —
identity via `id()`, binding versus copying, and `is` versus `==` —
because this lesson's entire argument is "a function/class/module is
just another object," which only means something to someone who
already has a precise, tool-backed sense of what "an object" is.
Lesson 3's finding that a module's global namespace is a real,
inspectable `dict` (via `globals()`) — this lesson's third unit proves
that exact dict is the same thing as a module object's `__dict__`
attribute, so Lesson 3's result is the direct setup for this lesson's
payoff, not just background.

**Terms used in this lesson**

- **First-class object** — anything that can be assigned to a name,
  stored in a data structure, passed as an argument, and returned from
  a function — with no restriction that sets it apart from any other
  kind of value. This term exists because it's the precise technical
  claim behind "everything is an object" as applied to functions: not
  a vague slogan, but a checklist this lesson's first unit runs a
  function through, item by item.
- **Higher-order function** — a function that takes another function as
  an argument, returns a function, or both. This term exists to name
  the specific *shape* of code this lesson's `apply_greeting` and
  `describe_task` are both examples of — a function treating another
  function as ordinary data, the same way it might treat an `int` or a
  `str`.
- **Dispatch table** — a dict whose values are functions (or other
  callables), used to select and invoke the right one based on a key,
  in place of a chain of `if`/`elif` comparisons. This term exists
  because this lesson's second unit builds one, by name, as the direct
  practical payoff of functions being first-class objects — without
  that property, a dispatch table couldn't exist at all, since a dict
  can only hold objects, and a function has to *be* one for this to
  work.
- **`type`, as a built-in class (not just a function)** — introduced in
  Lesson 1 as "a built-in function that reports what class an object
  was constructed from," `type` is more precisely a class itself:
  calling `type(x)` doesn't just report `x`'s class, it returns the
  actual class object `x` was constructed from — and every ordinary
  class you define is, in turn, constructed *from* `type`. This term
  exists because this lesson's third unit is built entirely around that
  second half of the fact, which Lesson 1 didn't need and deliberately
  left out.
- **Metaclass** — a class whose instances are themselves classes; `type`
  is Python's default metaclass, meaning every ordinary class you write
  is, itself, an instance of `type`. This term exists to name what
  this lesson's third unit actually demonstrates about class objects —
  full customization of this mechanism (writing your own metaclass) is
  out of scope for this lesson and belongs to a much later one; this
  lesson only needs the term to correctly describe what's being proven,
  not to build one.
- **Module** — a single `.py` file, once imported, represented inside
  the running program as a real object holding every name that file
  defines at its top level. This term exists because this lesson's
  third unit treats "a module" as a specific, inspectable kind of
  object, in exactly the same spirit as "a function" and "a class" —
  not as an abstract unit of code organization.

**Objects and methods used**

- **`type`**
  - *What it is:* The same built-in from Lessons 1 and 2 — reappearing
    here with a genuinely new fact about it (per the Terms entry
    above), so restated in full per the Repetition Rule.
  - *Implementation:* `type(object) -> type`, when called with one
    argument (the form used in every previous lesson); `type` is itself
    a class, and this one-argument call form is really invoking that
    class to look up and return the caller's actual class object.
  - *Its use:* This lesson's third unit calls `type()` on a class
    itself, not just on ordinary values — `type(Point)`, not
    `type(some_point_instance)` — to show that a class is exactly as
    much "an object with a type" as anything else in this curriculum
    has been.
  - *Type:* A built-in class (not a free function, despite being
    callable the same way one is — this distinction is exactly what
    this lesson's third unit is built to make concrete).
  - *Responsibility:* Report the exact class an object was constructed
    from; when the object in question is itself a class, report *its*
    class — which, for an ordinary class with no special customization,
    is `type` itself.
  - *Depends on:* A single argument, any object (including a class
    object).
  - *Connects to:* Called directly in this lesson's third lab on both
    an ordinary instance and the class it was built from; reads the
    type pointer every Python object (classes included) carries
    internally; returns that type object to the caller.
  - *Shape:* A single `type` object — identical shape to Lesson 1's
    description; the new fact this lesson adds is about *what kind of
    thing* can be passed in, not about what comes back.

- **`isinstance`**
  - *What it is:* The same built-in from Lesson 2, reappearing here —
    full treatment restated per the Repetition Rule.
  - *Implementation:* `isinstance(object, classinfo) -> bool`.
  - *Its use:* This lesson's third unit uses `isinstance(Point, type)`
    to check a class against `type` directly, the identical operation
    Lesson 2 used to check ordinary values against ordinary classes —
    proving nothing special is required syntactically to ask this
    question about a class.
  - *Type:* A built-in free function.
  - *Responsibility:* Answer whether an object is an instance of a
    given type (or a subclass of it).
  - *Depends on:* The object being checked, and a type (or tuple of
    types) to check against.
  - *Connects to:* Called directly in this lesson's third lab; returns a
    plain boolean.
  - *Shape:* A plain `bool`.

- **`dict.get`**
  - *What it is:* An instance method defined on Python's built-in
    `dict` type.
  - *Implementation:* `dict.get(self, key, default=None)`. Called on a
    specific dict; looks up `key`; returns the associated value if
    present, or `default` (which you can supply explicitly, as this
    lesson does) if the key is absent.
  - *Its use:* This lesson's dispatch table needs a way to look up a
    formatter function by priority *without* raising an error for a
    priority value that has no specific formatter — `.get()` with an
    explicit fallback is exactly that: subscript access (`d[key]`)
    would raise `KeyError` instead, which is the wrong behavior here.
  - *Type:* An instance method — requires an actual `dict` object to be
    called on (`_PRIORITY_FORMATTERS.get(...)`, not `dict.get(...)`
    alone).
  - *Responsibility:* Its full charter is a single safe lookup: return
    the value for `key` if it exists in this exact dict, or the given
    `default` if it doesn't — never raising, unlike plain subscript
    access.
  - *Depends on:* The dict it's called on, the key being looked up, and
    an optional default value (which itself defaults to `None` if you
    don't supply one).
  - *Connects to:* Called inside this lesson's `describe_task`; reads
    directly from the dict's own internal key/value storage; returns
    either a stored value (here, a function object) or the supplied
    default straight back to the caller — nothing in between transforms
    it.
  - *Shape:* Whatever was stored as the value for that key (here,
    always a function object, since every value in this lesson's
    dispatch dict is one) — or the exact default object passed in, with
    no wrapping, if the key is missing.

**Everything else in the file, not this lesson's subject but still explained.**

- **`print`**
  - *What it is:* The same built-in from every previous lesson —
    restated per the Repetition Rule.
  - *Implementation:* `print(*objects, sep=' ', end='\n') -> None`.
  - *Its use:* Surfacing this lesson's lab results.
  - *Type:* A built-in free function.
  - *Responsibility:* Convert its arguments to text and write them to
    standard output.
  - *Depends on:* Zero or more positional arguments.
  - *Connects to:* Called throughout this lesson's labs; writes to the
    terminal; returns `None`.
  - *Shape:* Always `None`.
- **`class` (statement, not object/method — flagged here to avoid
  confusion with the `type` entry above)** — `class Point: pass`, used
  in this lesson's third lab, is a statement, defined properly under
  Terms as part of this lesson's own new material rather than listed
  here as a reappearing item; flagged in this trailing section only so
  a reader scanning for "where's `class` explained" finds a pointer
  rather than a gap — its real explanation is in this unit's own
  Mechanical Walkthrough, below, the first time it's actually used.

---

## Concept Unit: Functions Are Objects, Not Special Syntax

### The Problem

Every previous lesson in this curriculum has defined functions with
`def` and immediately called them — `create_task(...)`, `next_id()`,
and so on — which is exactly how functions look and behave in almost
every language, Python included, and gives no particular reason to
suspect anything unusual is going on. But Lesson 1 already established
that *every* name in Python is a binding to some object, with no
special exception carved out anywhere. Does that claim actually include
a function's own name — is `create_task` a name bound to an object the
same way `x` was in Lesson 1, or is a function definition doing
something categorically different from an assignment statement?

> **Before reading on:** if `def greet(name): ...` really does just bind
> the name `greet` to some object, the same way `x = 42` bound `x` to
> an object — what would you expect `type(greet)` to report? Would you
> expect it to be something Python-specific and opaque, or an ordinary
> class name the same shape as `<class 'int'>` or `<class 'list'>`? And
> if `greet` really is just a name bound to an object, what do you
> predict would happen if you wrote `say_hello = greet` — based purely
> on Lesson 1's rules about what `y = x` does to two names sharing one
> object, with nothing function-specific added?

### Isolating the Concept

```python
def greet(name):
    return f"Hello, {name}!"

print(type(greet))
print(id(greet))

say_hello = greet
print(id(say_hello))
print(greet is say_hello)
print(say_hello("Ava"))
```

Real output:

```
type(greet): <class 'function'>
id(greet): 140207973196448

id(say_hello): 140207973196448
greet is say_hello: True
say_hello('Ava'): Hello, Ava!
```

`type(greet)` reports `<class 'function'>` — the exact same shape of
answer as `<class 'int'>` or `<class 'list'>`, nothing special-cased
about it. `greet` is an ordinary object of an ordinary (if
rarely-discussed) built-in class, and `def` is nothing more than the
syntax that constructs one and binds a name to it — the same two-step
"construct, then bind" pattern every assignment statement in this
curriculum has already followed. `say_hello = greet` proves the second
half directly: `id(say_hello)` matches `id(greet)` exactly, and
`greet is say_hello` confirms it — this is Lesson 1's binding rule,
unmodified, applied to a function. There was never a second function
created; `say_hello` is a second name for the *one* function object
`def greet(...)` built, and calling it via either name calls the same
underlying object.

A second lab proves the two remaining, more consequential parts of
being a **first-class object** (defined in Terms, above) — storage in
a data structure, and being passed as an ordinary argument:

```python
def shout(name):
    return f"HELLO, {name.upper()}!"

greetings = [greet, shout]
print(type(greetings))
for fn in greetings:
    print(fn("Sam"))

def apply_greeting(fn, name):
    return fn(name)

print(apply_greeting(greet, "Priya"))
print(apply_greeting(shout, "Priya"))
```

Real output:

```
type(greetings): <class 'list'>
Hello, Sam!
HELLO, SAM!
Hello, Priya!
HELLO, PRIYA!
```

`greetings` is an ordinary `list` — `type(greetings)` confirms it —
holding two function objects the exact same way a list of ints holds
ints; nothing about the list itself needed to change to accommodate
storing functions. The `for fn in greetings:` loop binds `fn` to each
function object in turn (an ordinary iteration, per Lesson 1's binding
rules — no copying, `fn` is bound to whichever function object is
currently being visited) and calls it. `apply_greeting`, a
**higher-order function** (defined in Terms, above), receives a
function as its `fn` parameter exactly the way `create_task` has always
received a `str` or an `int` — parameter passing doesn't distinguish
between kinds of objects at all.

### Discarding the Example

Both throwaway scripts shown here — the `greet`/`say_hello` identity
proof and the `greetings` list/`apply_greeting` demonstration — are
deleted now and won't appear in later lessons or project code. They
existed only to isolate "a function is an ordinary object" from every
angle Lesson 1's own object-identity toolkit can check.

### Project Change

No project change in this unit — this unit establishes that functions
are storable, passable objects in the abstract; the next unit is where
that fact becomes a real feature in the project's own code.

### Mechanical Walkthrough

- `def greet(name):` — a function definition statement (Lesson 2's
  walkthrough already covered `def` and parameter syntax in full,
  restated per the Repetition Rule: `def` begins the statement,
  `greet` is the name bound to the resulting function object, `name`
  is an ordinary parameter with no type hint here).
- `return f"Hello, {name}!"` — a `return` statement (Lesson 2), whose
  value is an f-string (Lesson 2's walkthrough already covered
  f-strings, restated per the Repetition Rule: a string literal
  prefixed with `f` that evaluates any `{...}` expressions inside it
  and splices their string form in) interpolating the parameter `name`.
- `type(greet)` — a call to the `type` built-in (full treatment above),
  passed the function object `greet` is bound to.
- `print(type(greet))` — `print` (full treatment above), writing the
  result.
- `id(greet)`, `print(id(greet))` — the `id` built-in (full treatment
  in Lesson 1, restated per the Repetition Rule: reports an object's
  unique identity), applied to the function object.
- `say_hello = greet` — an assignment statement (Lesson 1) whose
  right-hand side is a name, not a literal; per Lesson 1's finding,
  evaluating the name `greet` yields the object it's bound to, and
  `say_hello` is bound to that same object — no new function is
  constructed by this line.
- `id(say_hello)`, `print(id(say_hello))` — the same `id` call, applied
  to the object `say_hello` is now bound to.
- `greet is say_hello` — the `is` operator (full treatment in Lesson 1,
  restated per the Repetition Rule: checks identity, not value),
  comparing the two names' objects directly.
- `print(greet is say_hello)` — `print`, writing that boolean.
- `say_hello("Ava")` — a function call: `say_hello` is looked up
  (bound to the same object `greet` is), and that object is invoked
  with the argument `"Ava"`, exactly as if `greet("Ava")` had been
  written instead — there is no difference in behavior between calling
  a function through its original name or through an alias, because
  both names are bound to the identical object.
- `print(say_hello("Ava"))` — `print`, writing the returned string.
- `def shout(name):` — a second function definition, same mechanism as
  `greet`'s.
- `return f"HELLO, {name.upper()}!"` — a `return` statement, whose
  f-string calls `.upper()` (a real instance method on `str`, not
  covered further here since it's genuinely narrow, one-off material —
  converting a string to its uppercase form — and doesn't recur or
  generalize the way this lesson's actual subjects do) on `name` before
  interpolating it.
- `greetings = [greet, shout]` — an assignment statement whose
  right-hand side is a list literal (Lesson 1's walkthrough covered
  list literals in full, restated per the Repetition Rule: constructs a
  new `list` object containing whatever objects the literal names) —
  here, containing the two function objects `greet` and `shout` are
  bound to, not copies of them.
- `type(greetings)`, `print(type(greetings))` — `type` and `print`,
  confirming `greetings` is an ordinary `list`.
- `for fn in greetings:` — a `for` loop (new syntax, genuinely narrow to
  this lesson's own use of it and not this lesson's actual subject, so
  given a brief real explanation rather than a full Concept Unit of its
  own: it binds `fn`, in turn, to each object the iterable `greetings`
  produces, running the indented block once per binding) binding `fn`
  to `greet`'s object first, then `shout`'s object.
- `print(fn("Sam"))` — inside the loop, calls whichever function object
  `fn` is currently bound to, with the argument `"Sam"`, and prints the
  result — first `greet("Sam")`'s result, then `shout("Sam")`'s.
- `def apply_greeting(fn, name):` — a function definition with two
  ordinary parameters, `fn` and `name`, neither hinted.
- `return fn(name)` — a `return` statement whose value is a call: `fn`,
  whatever function object was passed in as this parameter, is invoked
  with `name`. This is the crux of the higher-order-function proof:
  `apply_greeting`'s own body has no idea, and doesn't need to know,
  whether `fn` will be `greet`, `shout`, or any other function with a
  matching call signature — `fn` is just a name bound to whatever
  object was passed in, called the same way any function call works.
- `apply_greeting(greet, "Priya")` — a function call, passing the
  function object `greet` as the first argument and the string
  `"Priya"` as the second.
- `print(apply_greeting(greet, "Priya"))` — `print`, writing the result.
- `apply_greeting(shout, "Priya")` — the same call, with `shout`'s
  object passed instead.
- `print(apply_greeting(shout, "Priya"))` — `print`, writing that
  result.

### CS Lens

This is a hard concept — first-class functions as a language design
property — so, per the Repetition Rule, several unrelated recurrences:

```
Also recognized in: JavaScript functions (assignable, storable, and
passable in the identical way, which is the entire foundation
`Array.prototype.map`/`filter`/`forEach` are built on), C# delegates
and `Func<T>`/`Action<T>` (a more explicitly-typed mechanism achieving
the same first-class-function property, requiring a declared delegate
type where Python requires nothing extra at all), Unix shell pipelines
(each command in a pipeline is itself passed around and composed the
way a function is, data flowing through a chain of them), and the
mathematical concept of higher-order functions in the lambda calculus,
which is the formal origin of this exact idea, predating any of these
languages
```

### SE Lens

The alternative — treating functions as fundamentally different from
"real" values, requiring special syntax to reference one without
calling it (some older or more restrictive languages require exactly
this, via explicit function pointers with distinct, separate syntax
from ordinary variables) — was rejected in Python's design in favor of
treating a function exactly like any other object, with zero special
cases: no special "function reference" syntax exists because none is
needed — `greet`, unparenthesized, already *is* a reference to the
function object; `greet()`, with parentheses, is what actually calls
it. The real cost this uniformity carries: because there's no syntactic
distinction between "the function object" and "the result of calling
the function," a genuinely common bug is forgetting the parentheses —
writing `apply_greeting(greet, "Priya")` correctly passes the function
itself, but code that meant to compute a value *first* and pass the
*result* instead (`apply_greeting(greet("Priya"), "Priya")`, a
different and unlikely-but-illustrative call) looks almost identical on
the page while doing something entirely different — the language gives
you no warning either way, because both are completely valid,
unrelated operations that merely happen to look similar.

### Commands Needed

Both labs run the same way as every previous lesson: `python3 lab1.py`.
Nothing new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
both labs.

### Connection

This unit proved functions are ordinary, storable, passable objects in
isolated, throwaway code. The next unit puts that fact to work for
real: a dict whose values are functions, used to replace a chain of
`if`/`elif` comparisons in the project's own code.

---

## Concept Unit: Dispatch Tables — Functions as Data, Applied to the Project

### The Problem

The project's tasks each carry a `priority` — a plain `int`, currently
unused for anything beyond being stored. Suppose the project needs a
human-readable description of a task, formatted differently depending
on how urgent it is: a critical task might get an attention-grabbing
prefix; a low-priority one might get none at all. The obvious first
approach is a chain of `if`/`elif` comparisons on `priority`, directly
inside whatever function builds the description. What's actually wrong
with that approach — is it wrong at all, or just unfamiliar compared to
what this lesson's first unit already proved is possible?

> **Before reading on:** picture writing an `if`/`elif` chain that
> checks `priority == 1`, then `priority == 2`, then `priority == 3`,
> each branch returning a differently-formatted string. Now imagine a
> sixth priority level needs to be added, each with its own distinct
> formatting rule. What has to change, and where, in the `if`/`elif`
> version, versus what this lesson's first unit already proved is true
> about functions — could a dict, with priority values as keys and
> *functions* as values, replace that chain entirely? What would have
> to be true about functions, specifically, for that to even be
> possible — and does this lesson's first unit already prove it's true?

### Isolating the Concept

```python
def if_elif_label(priority):
    if priority == 1:
        return "critical"
    elif priority == 2:
        return "high"
    elif priority == 3:
        return "normal"
    else:
        return "low"

print(if_elif_label(1), if_elif_label(2), if_elif_label(5))

_LABELS = {1: "critical", 2: "high", 3: "normal"}

def dispatch_label(priority):
    return _LABELS.get(priority, "low")

print(dispatch_label(1), dispatch_label(2), dispatch_label(5))
```

Real output:

```
critical high low
critical high low
```

Identical results from two genuinely different mechanisms. The dict
version replaces the entire `if`/`elif` chain with one lookup: adding a
new priority level (say, `4: "medium"`) is a one-line addition to
`_LABELS`, with no existing code touched at all, versus inserting a new
`elif` branch into a growing chain in the first version. But this first
lab only dispatches to *strings* — the real payoff, proven directly by
the previous unit, is dispatching to *functions*:

```python
def format_critical(title):
    return f"[!!!] {title} — CRITICAL"

def format_high(title):
    return f"[!] {title} — high priority"

def format_normal(title):
    return title

_FORMATTERS = {1: format_critical, 2: format_high, 3: format_normal}

def describe(priority, title):
    formatter = _FORMATTERS.get(priority, format_normal)
    print(formatter, " is format_critical:", formatter is format_critical)
    return formatter(title)

print(describe(1, "Ship the release"))
print(describe(3, "Water the plants"))
print(describe(9, "Someday maybe"))
```

Real output:

```
formatter picked: <function format_critical at 0x7fd8f0e1de40>  is format_critical: True
[!!!] Ship the release — CRITICAL
formatter picked: <function format_normal at 0x7fd8f0e1df80>  is format_critical: False
Water the plants
formatter picked: <function format_normal at 0x7fd8f0e1df80>  is format_critical: False
Someday maybe
```

`_FORMATTERS` is called a **dispatch table** (defined in Terms, above):
a dict whose values are functions, used to pick the right behavior for
a given key with one lookup instead of a chain of comparisons. The
printed `formatter` values confirm this is a real, live function
object being retrieved from the dict on every call — not a string
naming a function that then has to be separately resolved — and
`formatter is format_critical` proves, using this lesson's first unit's
exact identity-checking approach, that `_FORMATTERS.get(1, ...)` really
does hand back the identical function object `format_critical` was
bound to when it was defined. `formatter(title)` then calls whichever
function was retrieved, exactly the way `apply_greeting`'s `fn(name)`
did in the previous unit — a dispatch table is a higher-order function
pattern (defined in Terms, above) with the function selection expressed
as a dict lookup instead of a parameter.

### Discarding the Example

All three throwaway scripts shown here — `if_elif_label`,
`dispatch_label`, and the string-keyed `_LABELS` dict; and the
throwaway `_FORMATTERS`/`describe` pair — are deleted now. The real
version this curriculum keeps, built fresh in Project Change below,
applies this identical pattern directly to the project's own
`create_task`-produced task dicts.

### Project Change

- **Reference Source:** No reference counterpart — original to this
  project, same as every previous unit in this curriculum.
- **Files affected:** `project/tasks.py` (modified), `project/main.py`
  (modified).
- **Change type:** Add — three new formatter functions, a new
  module-level dispatch dict, and a new `describe_task` function, all
  appended to `tasks.py`; `main.py` updated to import and call
  `describe_task`.
- **Location:** The new code is added at the end of `tasks.py`, after
  the existing `create_id_generator` and `create_task` functions
  established in Lessons 2 and 3; `main.py`'s existing calls to
  `create_task` are left unchanged, with two new lines added after
  them.
- **Dependencies:** None new — everything used here (dict literals,
  `dict.get`, function definitions) is already part of core Python or
  already covered in this curriculum.

### The New Code

```python
def _format_critical(task: dict) -> str:
    return f"[!!!] {task['title']} (id={task['id']}) — CRITICAL"


def _format_high(task: dict) -> str:
    return f"[!] {task['title']} (id={task['id']}) — high priority"


def _format_normal(task: dict) -> str:
    return f"{task['title']} (id={task['id']})"


_PRIORITY_FORMATTERS = {
    1: _format_critical,
    2: _format_high,
    3: _format_normal,
}


def describe_task(task: dict) -> str:
    formatter = _PRIORITY_FORMATTERS.get(task["priority"], _format_normal)
    return formatter(task)
```

### The Updated Project

```
tasks.py:
 1  def create_id_generator():
 2      current_id = 0
 3
 4      def generate() -> int:
 5          nonlocal current_id
 6          current_id += 1
 7          return current_id
 8
 9      return generate
10
11
12  def create_task(task_id: int, title: str, priority: int) -> dict:
13      if not isinstance(task_id, int):
14          raise TypeError(f"task_id must be an int, got {type(task_id).__name__}")
15      if not isinstance(title, str):
16          raise TypeError(f"title must be a str, got {type(title).__name__}")
17      if not isinstance(priority, int):
18          raise TypeError(f"priority must be an int, got {type(priority).__name__}")
19      return {"id": task_id, "title": title, "priority": priority, "done": False}
20
21
22  def _format_critical(task: dict) -> str:                                        # ← new
23      return f"[!!!] {task['title']} (id={task['id']}) — CRITICAL"                 # ← new
24                                                                                    # ← new
25                                                                                    # ← new
26  def _format_high(task: dict) -> str:                                            # ← new
27      return f"[!] {task['title']} (id={task['id']}) — high priority"              # ← new
28                                                                                    # ← new
29                                                                                    # ← new
30  def _format_normal(task: dict) -> str:                                          # ← new
31      return f"{task['title']} (id={task['id']})"                                 # ← new
32                                                                                    # ← new
33                                                                                    # ← new
34  _PRIORITY_FORMATTERS = {                                                        # ← new
35      1: _format_critical,                                                        # ← new
36      2: _format_high,                                                            # ← new
37      3: _format_normal,                                                          # ← new
38  }                                                                                # ← new
39                                                                                    # ← new
40                                                                                    # ← new
41  def describe_task(task: dict) -> str:                                           # ← new
42      formatter = _PRIORITY_FORMATTERS.get(task["priority"], _format_normal)       # ← new
43      return formatter(task)                                                      # ← new
```

```
main.py:
1  from tasks import create_task, create_id_generator, describe_task    # ← changed
2
3  next_id = create_id_generator()
4
5  task_a = create_task(next_id(), "Write lesson 3", 1)
6  task_b = create_task(next_id(), "Review lesson 3", 2)
7  print(task_a)
8  print(task_b)
9  print(describe_task(task_a))                                        # ← new
10 print(describe_task(task_b))                                        # ← new
```

As a whole, `tasks.py` now provides a complete, extensible formatting
system: three small formatter functions, each responsible for exactly
one priority level's presentation, and a dispatch dict tying priority
values to the right one — extending it to a new priority level (a
`4: _format_low`, say) requires writing one new function and adding one
new dict entry, touching nothing else in the file. `main.py`, as a
whole, now demonstrates the full pipeline this curriculum has built
across four lessons: a closure-generated ID (Lesson 3), fed into a
type-and-value-guarded constructor (Lesson 2), producing a task dict
whose eventual presentation is chosen by a dispatch table built on
functions being ordinary, storable objects (this lesson).

### Mechanical Walkthrough

- `def _format_critical(task: dict) -> str:` — a function definition
  with a hinted parameter and hinted return type (Lesson 2's pattern,
  restated per the Repetition Rule); the leading underscore in the name
  is a Python naming convention — not enforced by the language at all,
  purely a signal to a reader that this function is an internal
  implementation detail of this module, not meant to be imported and
  used directly elsewhere, unlike `create_task` or `describe_task`.
- `return f"[!!!] {task['title']} (id={task['id']}) — CRITICAL"` — a
  `return` statement whose value is an f-string (Lesson 2, restated per
  the Repetition Rule) interpolating two subscript accesses:
  `task['title']` and `task['id']`, each looking up a key in the dict
  `task` and yielding whatever object is bound to it.
- `def _format_high(...)`, `def _format_normal(...)` — the same
  function-definition pattern, each producing a differently-worded
  f-string; `_format_normal` uses no bracketed prefix at all, since it
  represents the ordinary, non-urgent case.
- `_PRIORITY_FORMATTERS = {...}` — an assignment statement (Lesson 1)
  whose right-hand side is a dict literal (new syntax to this
  curriculum, though `dict` itself is not — Lesson 2's `__annotations__`
  and this lesson's own `task` parameter have both already been plain
  dicts; the literal `{key: value, ...}` syntax constructs a new dict
  object, mapping each key to whichever object the corresponding value
  expression evaluates to — here, three int keys mapped to three
  function objects, per this lesson's first unit's proof that a
  function name, evaluated, yields the function object it's bound to,
  not a call to it).
- `def describe_task(task: dict) -> str:` — a function definition, the
  project's own real entry point for this lesson's dispatch pattern.
- `formatter = _PRIORITY_FORMATTERS.get(task["priority"], _format_normal)`
  — an assignment statement whose right-hand side is a call to
  `dict.get` (full treatment in Objects and methods, above), called on
  the module-level `_PRIORITY_FORMATTERS` dict, looking up the key
  `task["priority"]` (itself a subscript access on the `task`
  parameter), with `_format_normal` supplied as the explicit fallback
  if that priority has no specific formatter registered.
- `return formatter(task)` — a `return` statement whose value is a
  function call: `formatter`, whichever function object `.get()` just
  returned, is invoked with `task` as its argument — the identical
  "call whatever function object this name is currently bound to"
  pattern this lesson's first unit already proved works uniformly,
  regardless of which specific function ends up bound to `formatter` on
  any given call.
- `from tasks import create_task, create_id_generator, describe_task`,
  in `main.py` — the same import-statement mechanism from Lesson 2
  (restated per the Repetition Rule), now naming three functions
  instead of two.
- `print(describe_task(task_a))` — `describe_task` is called with the
  dict `task_a` (built by `create_task` earlier in the file, per
  Lesson 2 and 3's already-established code); its result — a formatted
  string — is passed to `print` (full treatment above).
- `print(describe_task(task_b))` — the identical pattern, applied to
  `task_b`.

### CS Lens

This reappears the dispatch-table idea from earlier in this unit,
restated in full per the Repetition Rule, now specifically as it
applies to a real, extensible codebase rather than an isolated lab:

```
Also recognized in: the Strategy design pattern from object-oriented
software engineering (encapsulating an interchangeable behavior behind
a common interface, selected at runtime — a dispatch table is this
same idea with functions as the interchangeable strategies instead of
objects implementing a shared interface), HTTP routing frameworks
(mapping a URL path to the specific function that should handle it —
literally a dispatch table, often built on exactly this dict-of-
functions mechanism under the hood), CPU instruction dispatch in a
simulated processor or interpreter (mapping an opcode to the function
that executes it), and jump tables generated by compilers for `switch`
statements in C-family languages (a compiled, lower-level analog of
the identical lookup-instead-of-branch-chain idea)
```

### SE Lens

The alternative — sticking with an `if`/`elif` chain no matter how
large it grows — was rejected here for a concrete, measurable reason,
not just taste: every new priority level added to the `if`/`elif`
version requires editing the *body* of the function containing the
chain, growing a single function indefinitely and risking an
accidentally-misordered comparison (an earlier, too-broad `elif`
silently shadowing a later, more specific one — a real bug class chains
like this are prone to as they grow); the dispatch-table version
confines each new case to one new, independently-testable function
plus one new dict entry, with the dispatch logic itself
(`describe_task`'s own three lines) never growing at all, no matter how
many priority levels exist. The real cost this project now carries:
`_PRIORITY_FORMATTERS` is checked by nothing that would catch a
mismatched key type or a formatter with the wrong signature — Lesson
2's `mypy` would not, on its own, flag a `_FORMATTERS` entry mapping a
`str` key where every other key is an `int`, or a formatter function
accepting the wrong argument type, without a much more precise type
hint on the dict itself than this project currently has (a later
lesson in this curriculum, once generics and `Callable` hints are
introduced, closes this exact gap) — the dispatch table's flexibility
and its current lack of that stronger type safety are the same design
decision, not two separate ones.

### Commands Needed

Both labs run the same way as every previous lesson: `python3
lab2.py`. The updated real project runs and checks the same way
Lesson 2 and 3's Commands Needed steps already covered in full:
`python3 main.py`, `mypy main.py`.

### Run It

Already shown and verified above, under "Isolating the Concept," for
both labs. The real, updated project's full output:

```
{'id': 1, 'title': 'Write lesson 3', 'priority': 1, 'done': False}
{'id': 2, 'title': 'Review lesson 3', 'priority': 2, 'done': False}
[!!!] Write lesson 3 (id=1) — CRITICAL
[!] Review lesson 3 (id=2) — high priority
```

`mypy main.py` against the fully updated project reports:

```
Success: no issues found in 1 source file
```

### Connection

This unit turned the previous unit's proof — functions are ordinary,
storable objects — into a real, working feature of the project: task
descriptions that vary by priority, chosen by a dict lookup rather than
a growing conditional chain. The next unit asks whether this same
"it's just an object" property extends past functions — specifically,
to the classes and modules this entire curriculum has been quietly
built out of, `tasks.py` included, from the very first lesson.

---

## Concept Unit: Classes and Modules Are Objects Too

### The Problem

This lesson has proven functions are objects with a type, an identity,
and full first-class storability. `create_task`, `describe_task`, and
every other function this curriculum has written are functions, not
classes — but Python has classes too, and this curriculum will build
real ones starting later, in Phase 3. Before that happens, one question
is worth settling now, directly: is a class itself just another kind of
object, the same way a function is — with its own `type()`, checkable
with `isinstance()`, storable the same way — or is a class something
categorically different, existing at a level above ordinary objects
that this lesson's tools don't reach?

> **Before reading on:** `type(greet)`, earlier in this lesson, reported
> `<class 'function'>` — itself something with the word "class" right
> in its own printed form. If you defined an actual class with the
> `class` keyword — something like `class Point: pass` — what would you
> predict `type(Point)` reports? Would it be some entirely new,
> class-specific category invisible to `type()`, or could `type()` — a
> function this lesson has already used on functions, on ints, on lists
> — work on a class exactly the same uniform way?

### Isolating the Concept

```python
class Point:
    pass

print(type(Point))
print(isinstance(Point, type))

p = Point()
print(type(p))
print(isinstance(p, Point))
print(isinstance(p, type))
```

Real output:

```
type(Point): <class 'type'>
isinstance(Point, type): True
type(p): <class '__main__.Point'>
isinstance(p, Point): True
isinstance(p, type): False
```

`type(Point)` reports `<class 'type'>` — `Point`, the class itself, is
an object, and its own type is `type`. This is called a **metaclass**
(defined in Terms, above): `type` is the class whose instances are
themselves classes, and every ordinary class definition in Python —
`create_task`'s eventual class-based successors included, later in this
curriculum — constructs a new instance of `type` unless you go out of
your way to change that, which is genuinely advanced territory well
outside this lesson's scope. `isinstance(Point, type)` confirms this
directly, using the exact same `isinstance` call this curriculum has
used on ordinary values since Lesson 2 — nothing special-cased for
checking a class against `type`. `p = Point()` then constructs an
*instance* of `Point` — a genuinely different object from `Point`
itself — and `type(p)` correctly reports `<class '__main__.Point'>`:
`p`'s type is `Point`, not `type`; `isinstance(p, Point)` confirms `p`
is an instance of `Point`; and `isinstance(p, type)` is `False`,
because `p` itself is not a class — only `Point`, the class `p` was
built from, is.

A second lab proves the same is true of modules — including, directly,
`tasks.py`, the real project file this lesson has been extending all
along:

```python
import sample_module

print(type(sample_module))
print("X" in sample_module.__dict__)
print(sample_module.__dict__["X"])
print(sample_module.X)
print(sample_module.X is sample_module.__dict__["X"])
```

Real output:

```
type(sample_module): <class 'module'>
'X' in sample_module.__dict__: True
sample_module.__dict__['X']: 99
sample_module.X: 99
sample_module.X is sample_module.__dict__['X']: True
```

`sample_module` — a small, throwaway module defining `X = 99` and a
`report()` function — is, once imported, an object of type
`<class 'module'>`. It has a real `__dict__` attribute, a plain dict
(the same shape Lesson 3's `globals()` returned), mapping every name
that module's top-level code defines to the object bound to it. Reading
`sample_module.X` and reading `sample_module.__dict__["X"]` return the
identical object — `sample_module.X` is not some special module-access
syntax with its own separate lookup mechanism; it's dict-key access
under a friendlier-looking dot syntax.

A third check confirms the connection to Lesson 3 directly:

```python
id(sample_module.__dict__) == sample_module.report()
```

where `sample_module.report()` returns `id(globals())`, called from
*inside* `sample_module`'s own code. Real output:

```
id(sample_module.__dict__) == sample_module.report(): True
```

This is the exact same equality Lesson 3's `globals()` lab pointed
toward without fully closing the loop: `globals()`, called from inside
a module, and that same module's `__dict__`, read from outside it
after importing it, are the identical object — not two separate dicts
that happen to agree, but one single dict, viewed from two different
places. `tasks.py`, the real project file this lesson has been
building, is exactly this kind of object too: `import tasks`
anywhere in this curriculum's code produces a real `<class 'module'>`
object, and `tasks.create_task` is dict-style attribute access into
that module's own `__dict__` — the identical mechanism `sample_module.X`
just demonstrated, applied to every function this curriculum has
written into that file across four lessons.

### Discarding the Example

The throwaway `Point` class and `sample_module` (including its `X` and
`report()`) are deleted now — `sample_module` itself is a file created
purely for this lab and won't be reused; it is not part of the real
project. Nothing about this unit modifies `tasks.py` or `main.py`
directly — the point of this unit was confirming what `tasks.py`
already *is*, not adding a new feature to it.

### Project Change

No project change in this unit. This unit's entire content is proof
about the existing project's own nature (`tasks.py` as a module object)
rather than a new addition to it — the schema's own allowance for a
unit whose subject has no real counterpart to add code around applies
here in its purest form: there is nothing to add, because the thing
being taught was already true of the project from Lesson 2 onward,
merely unproven until now.

### Mechanical Walkthrough

- `class Point:` — a `class` statement: begins a class definition;
  `Point` is the name that will be bound to the resulting class object
  once the statement finishes executing.
- `pass` — a statement that does nothing at all; used here purely
  because Python's syntax requires at least one statement inside an
  indented block, and this class needs no actual attributes or methods
  to make this unit's point.
- `type(Point)` — a call to the `type` built-in (full treatment in
  Objects and methods, above — the entry specifically restated to
  cover this exact call form, `type` applied to a class object rather
  than an ordinary value), returning `Point`'s own type.
- `print(type(Point))` — `print` (full treatment above), writing the
  result.
- `isinstance(Point, type)` — a call to `isinstance` (full treatment
  above), checking whether the class object `Point` is an instance of
  `type`.
- `print(isinstance(Point, type))` — `print`, writing that boolean.
- `p = Point()` — an assignment statement whose right-hand side is a
  call: `Point()` constructs a new instance of the `Point` class (an
  ordinary class instantiation — the mechanics of `__init__` and
  instance construction in full are this curriculum's own Phase 3
  material, out of scope for this lesson, which only needs the fact
  that calling a class produces an instance of it); `p` is bound to
  that new instance.
- `type(p)`, `print(type(p))` — `type`, applied this time to the
  instance `p`, not the class `Point` itself.
- `isinstance(p, Point)`, `print(isinstance(p, Point))` — `isinstance`,
  confirming `p` really is an instance of `Point`.
- `isinstance(p, type)`, `print(isinstance(p, type))` — `isinstance`,
  confirming `p` itself is *not* a class — only `Point` is.
- `import sample_module` — an import statement (Lesson 2's walkthrough
  covered `from ... import ...`; this is the plain `import <module>`
  form, which locates and executes `sample_module.py` once, and binds
  the name `sample_module`, in this script's namespace, to the
  resulting module object itself, rather than binding individual names
  out of it the way `from tasks import create_task` does).
- `type(sample_module)`, `print(type(sample_module))` — `type`, applied
  to the module object, reporting `<class 'module'>`.
- `"X" in sample_module.__dict__` — the `in` operator (Lesson 3,
  restated per the Repetition Rule: checks whether a key exists in a
  dict), applied to `sample_module.__dict__` — a real attribute every
  module object carries, holding that module's own namespace as a
  plain dict.
- `sample_module.__dict__["X"]` — subscript access (Lesson 3, restated
  per the Repetition Rule) on that dict, looking up the key `"X"`.
- `sample_module.X` — attribute access via dot syntax on the module
  object itself, retrieving the same value a different, dict-shaped way.
- `sample_module.X is sample_module.__dict__["X"]` — the `is` operator
  (Lesson 1, restated per the Repetition Rule), confirming both access
  paths yield the identical object, not two separately-produced copies.
- `sample_module.report()` — a function call: `report`, looked up via
  attribute access on the module object (the identical mechanism as
  `sample_module.X`, just retrieving a function object instead of an
  int this time), invoked with no arguments; inside `sample_module`'s
  own code, this calls `globals()` (full treatment in Objects and
  methods, Lesson 3, restated per the Repetition Rule: returns the real
  dict backing the current module's own global namespace) and returns
  its `id()`.
- `id(sample_module.__dict__) == sample_module.report()` — the `==`
  operator (Lesson 1, restated per the Repetition Rule: checks value
  equality, which for two plain ints is the same as checking they're
  the same number), comparing the identity-as-an-integer of
  `sample_module.__dict__`, read from outside the module, against the
  identity-as-an-integer `globals()` reported from *inside* the module
  — proving they're not just equal-looking dicts, but the literal same
  object.

### CS Lens

This is a hard concept — that a language's own structural building
blocks (classes, modules) are themselves ordinary runtime values rather
than something the language treats specially — so, per the Repetition
Rule, several unrelated recurrences:

```
Also recognized in: JavaScript (a class, under the hood, is genuinely
just a function with a `.prototype` object attached — "class" syntax
is largely a readability layer over a mechanism the language already
had), Smalltalk (the language this idea is most directly inherited
from — in Smalltalk, "everything is an object" is close to a literal,
foundational design axiom, including classes themselves, each of which
is an instance of a class called `Metaclass`), Ruby (classes are
first-class objects you can reopen, inspect, and modify at runtime, in
the identical spirit this unit just demonstrated for Python), and
reflection APIs in Java and C# (`Class<T>`/`Type`, respectively — both
languages expose a real, inspectable object representing a class,
despite being far more statically-typed overall than Python; the
existence of these APIs is itself an acknowledgment that "a class needs
to be inspectable as an object" is a genuinely useful property, even in
languages that don't make it the default, casual experience the way
Python does)
```

### SE Lens

The alternative — treating classes and modules as purely
compile-time or load-time constructs, with no runtime representation a
program can inspect, query, or pass around — was rejected in Python's
design in favor of the uniform "everything is an object" model this
entire lesson has been proving piece by piece; the tradeoff is the same
one this lesson's earlier units already surfaced for functions,
applied one level up: full runtime introspection (checking a class's
type, walking a module's namespace, all with the same tools used on
ordinary values) costs something in performance and in the ability for
a tool like a compiler to fully "lock down" what a class or module can
become before the program runs — a genuinely different class object
could, in principle, be constructed and substituted at runtime in a way
a strictly compile-time class definition never could be. The honest
cost, specific to this project: nothing in this uniform model *stops*
`tasks.py`'s own `__dict__` from being modified at runtime from outside
it — `tasks.__dict__["create_task"] = something_else` is not prevented
by anything, if some other part of a larger program ever did it, and
every caller relying on the real `create_task` would silently start
calling whatever `something_else` is instead. Python's uniformity buys
real flexibility and real introspective power, demonstrated directly by
this unit's own labs, at the cost of removing any structural guarantee
that a class or module's contents can't be altered out from under code
that assumes otherwise.

### Commands Needed

Both labs run the same way as every previous lesson: `python3
lab3.py`, run from the same directory as `sample_module.py` so the
plain `import sample_module` statement can locate it. Nothing new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
all three parts of this unit's lab.

### Connection

This unit closed the loop this entire lesson opened: a function, a
class, and a module are all, without exception, ordinary Python objects
— each with a real type, a real identity, and, for classes and
modules specifically, a real inspectable namespace — and Lesson 3's
`globals()` result, from two lessons ago, turns out to have already
been proof of exactly this, waiting for this lesson to make the
connection explicit.

---

## Connect the Pieces

Trace one real call through everything this lesson built:
`describe_task(task_a)`, from the project's own `main.py`. Per this
lesson's first unit, `describe_task` — like `create_task`,
`create_id_generator`, and every other function `tasks.py` defines — is
itself an ordinary object, of type `<class 'function'>`; `main.py`
importing it via `from tasks import ..., describe_task` binds a name in
`main.py`'s own namespace to that exact object, per this lesson's third
unit's own proof that `from X import Y` is really retrieving `Y` out of
module `X`'s `__dict__` — the same real dict `X`'s own top-level code
would see if it called `globals()` on itself. Inside `describe_task`,
per this lesson's second unit, `_PRIORITY_FORMATTERS.get(task["priority"],
_format_normal)` retrieves a function object from a dispatch table —
possible at all only because a function, per this lesson's first unit,
can be stored as an ordinary dict value the same way any other object
can. That retrieved function — `_format_critical`, for `task_a`'s
priority of `1` — is then called directly, `formatter(task)`, the
identical "call whatever object this name is currently bound to"
mechanism this lesson's very first lab proved with `say_hello("Ava")`.
Four lessons in, "everything is an object" has stopped being a slogan
and become something you've now personally confirmed, piece by piece,
with the same small set of tools — `id()`, `type()`, `is` — Lesson 1
first put in your hands.
