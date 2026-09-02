# Lesson 2: Type Hints vs. Runtime Types — What `mypy` Checks That Python Never Will

**What you will build.** You'll write a small, real project file — the
first one this curriculum keeps, rather than discards — a `create_task`
function with type hints on its parameters and return value. You'll
prove, by actually calling it with the "wrong" types, that Python itself
never stops you. Then you'll bring in `mypy`, a separate static type
checker, and watch it catch the exact same mistake before the program
ever runs. Finally you'll add a manual `isinstance` guard directly
inside the function, and see why that's a genuinely different kind of
protection than either of the first two. The transferable problem: in
C#, Java, or Rust, "the compiler already checked the types" is a
guarantee baked into the language — you cannot even produce a running
program if a type mismatch exists. In Python, that guarantee doesn't
exist by default at all, and understanding exactly what does and
doesn't fill that gap is the difference between writing Python that
merely runs and writing Python that's actually trustworthy at the
boundaries where real bugs live.

**What you need to know first.** Lesson 1's object model: specifically,
that a name is bound to an object rather than holding a copied value,
that `type()` reports an object's real class, and that identity and
value are separate questions. This lesson depends on that model
directly — a type hint, as you'll see, is a claim about which objects a
name is *expected* to end up bound to, and nothing about hints makes
sense without already knowing that binding, not copying, is what
assignment and function calls actually do.

**Terms used in this lesson**

- **Type hint (annotation)** — optional syntax, written after a colon
  following a parameter name (`title: str`) or after `->` following a
  function's parameter list (`-> dict`), that states what type of object
  is expected there. This term exists because the entire lesson is a
  claim about what this syntax does and doesn't do, and "hint" is the
  deliberately accurate word for it — not "declaration," which would
  imply the language enforces it, and not "type," which would imply it's
  compulsory the way a C# parameter type is.
- **Static typing** — a language design where types are checked before
  the program ever runs, typically by a compiler, and a type mismatch
  prevents the program from running at all. This term exists to name the
  guarantee C#, Java, and Rust give you by default, which this lesson is
  built around contrasting with what Python actually gives you.
- **Dynamic typing** — a language design where a name's type isn't fixed
  at all — it's just whatever the object currently bound to that name
  happens to be — and nothing is checked until an operation is actually
  attempted at runtime. This term exists because it's the accurate
  description of what Python does by default, independent of whatever
  hints happen to be written in the source.
- **Static type checker** — a separate tool, run against your source
  code without executing it, that reads type hints and reports where the
  code violates them. This term exists to name the category `mypy`
  belongs to, distinguishing it clearly from "the Python interpreter,"
  which is a different program with a different job and, per this
  lesson's first unit, does not do this checking itself.
- **Duck typing** — a convention, common in Python, of caring only
  whether an object supports the operations you're about to perform on
  it (a `.append()` method, say), rather than checking what class it was
  built from. The name comes from "if it walks like a duck and quacks
  like a duct, treat it as a duck" — the object's *behavior* is what
  matters, not its declared identity. This term exists because it's the
  philosophy `isinstance`-based runtime checking (this lesson's third
  unit) sits in deliberate tension with, and understanding that tension
  is part of writing idiomatic Python rather than Python that reads like
  a C# program in different syntax.

**Objects and methods used**

- **`isinstance`**
  - *What it is:* A built-in function, available everywhere with no
    import, the same flat-namespace kind as `id`, `type`, and `print`
    from Lesson 1.
  - *Implementation:* `isinstance(object, classinfo) -> bool`. Takes the
    object to check and either a single type or a tuple of types;
    returns `True` if the object's type is that type (or a subclass of
    it), `False` otherwise.
  - *Its use:* This lesson's third unit needs a way to actually verify,
    while the program is running, that a value really is what a hint
    only *claimed* it would be — `isinstance` is the direct tool for
    that check.
  - *Type:* A built-in free function — not a method on any class.
  - *Responsibility:* Its full charter is answering exactly one
    question — "is this object an instance of this type (or one of its
    subclasses)?" — nothing about *why* it might not be, and nothing
    about what to do in response; that's left entirely to the calling
    code.
  - *Depends on:* Two arguments — the object being checked, and either a
    single type (like `int`) or a tuple of types (like `(int, float)`)
    to check against.
  - *Connects to:* Called directly by this lesson's guarded
    `create_task` function; internally walks the object's type and that
    type's inheritance chain, comparing against whatever was passed as
    `classinfo`; returns a plain boolean back to the caller, which
    `create_task` then uses to decide whether to `raise`.
  - *Shape:* Always a plain `bool` — never `None`, never the object
    itself, never a partial match; it's a yes/no answer and nothing
    else.

- **`type`**
  - *What it is:* The same built-in function from Lesson 1 — a function
    that reports what class an object was constructed from. Restated in
    full here per the Repetition Rule, since it reappears.
  - *Implementation:* `type(object) -> type`. Takes one argument and
    returns a `type` object representing that object's class.
  - *Its use:* This lesson's third unit uses `type(...).​__name__` inside
    the guard's error messages, to report the actual type that showed up
    where a different one was expected — turning a bare "wrong type"
    failure into a message that names exactly what arrived.
  - *Type:* A built-in free function.
  - *Responsibility:* Report the exact class an object was constructed
    from — nothing about whether that class matches any expectation;
    that comparison is `isinstance`'s job, above, not `type`'s.
  - *Depends on:* A single argument — any object.
  - *Connects to:* Called inside `create_task`'s guard clauses on the
    value that failed the `isinstance` check; its result has `.__name__`
    accessed on it immediately (a plain attribute read on the returned
    `type` object, giving the class's short name as a string, e.g.
    `"int"` rather than `<class 'int'>`) before being interpolated into
    the raised `TypeError`'s message.
  - *Shape:* A single `type` object — the same as in Lesson 1; its
    `.__name__` attribute, separately, is a plain string.

- **`raise`**
  - *What it is:* Not a function — a language keyword and statement,
    listed here explicitly to flag that it is *not* being mistaken for
    a callable despite `raise TypeError(...)` looking similar to a
    function call. `raise` itself is the statement; `TypeError(...)`,
    immediately following it, is a real constructor call, covered next.
- **`TypeError`**
  - *What it is:* A built-in exception class — part of Python's core
    language, representing "an operation or function received an
    argument of the wrong type."
  - *Implementation:* `TypeError(message)` — constructing it (calling it
    like a function, the way any class is instantiated in Python) builds
    an exception object carrying that message string.
  - *Its use:* This lesson's third unit needs a way to stop
    `create_task` from proceeding when a value fails its `isinstance`
    check, and to communicate specifically *why* — `TypeError` is
    Python's own built-in category for exactly this situation, rather
    than a generic, uninformative failure.
  - *Type:* A built-in class — constructing it with `TypeError(...)`
    produces an instance of it, the same way constructing any class
    does.
  - *Responsibility:* Carry a human-readable description of a
    type-related failure, and, once raised, unwind the current call
    stack — stopping normal execution of `create_task` and every
    function that called it, up until something catches it or the
    program ends and prints it.
  - *Depends on:* A message string, passed to its constructor, describing
    what went wrong.
  - *Connects to:* Constructed inside `create_task`'s guard clauses;
    handed immediately to `raise`, which is what actually triggers the
    stack unwind — constructing a `TypeError` object on its own, without
    `raise`, does nothing at all, it just builds an inert object like any
    other.
  - *Shape:* A single exception object carrying one string message;
    nothing about it is a list or container — `str(the_exception)`
    reproduces the exact text it was built with.

**Everything else in the file, not this lesson's subject but still explained.**

- **`print`**
  - *What it is:* The same built-in function from Lesson 1, reappearing
    here — full treatment restated per the Repetition Rule.
  - *Implementation:* `print(*objects, sep=' ', end='\n') -> None`.
  - *Its use:* Surfacing this lesson's lab results to the terminal, the
    same role it played in Lesson 1.
  - *Type:* A built-in free function.
  - *Responsibility:* Convert its arguments to text and write them to
    standard output — nothing more.
  - *Depends on:* Zero or more positional arguments of any type.
  - *Connects to:* Called throughout this lesson's throwaway labs;
    writes directly to the terminal; returns `None` to the caller.
  - *Shape:* Always `None`.

---

## Concept Unit: Type Hints Are Metadata, Not Enforcement

### The Problem

In C#, `int Add(int a, int b)` is a promise the compiler itself
enforces: there is no way to compile a call site passing a `string`
where that `int` is expected — the program simply won't build. Python
lets you write what looks like the identical promise:
`def add(a: int, b: int) -> int:`. The question this unit exists to
answer, directly: does writing that syntax actually stop you from
calling `add("x", "y")`, the way C#'s compiler would?

> **Before reading on:** think back to Lesson 1 — a name is bound to an
> object, and that binding can be repointed to any object at any time,
> with nothing in the language tracking "what type this name is allowed
> to hold." Given that, what would have to exist, specifically, for a
> type hint to actually block a mismatched call — something checking
> the hint against the real argument, at the exact moment the function
> is called? Does anything in what you've learned so far suggest Python
> does that automatically? Try to predict, concretely: if you call a
> hinted function with the wrong type, does the program refuse to run
> at all, raise an error partway through, or do something else
> entirely?

### Isolating the Concept

```python
def create_task(title: str, priority: int) -> dict:
    return {"title": title, "priority": priority, "done": False}

result = create_task(42, priority="urgent")
print(result)
print(type(result["priority"]))

print(create_task.__annotations__)
```

Executed for real:

```
Returned without error: {'title': 42, 'priority': 'urgent', 'done': False}
type(result['priority']): <class 'str'>

create_task.__annotations__: {'title': <class 'str'>, 'priority': <class 'int'>, 'return': <class 'dict'>}
type(create_task.__annotations__): <class 'dict'>
```

Nothing stopped the call. `title` received `42` (an `int`, not the
hinted `str`); `priority` received `"urgent"` (a `str`, not the hinted
`int`) — and the function ran to completion, returned normally, and
`print(result)` shows the mismatched values sitting right there in the
returned dict with no complaint from Python anywhere. This is called a
**type hint**, and the second half of this lab shows exactly why
nothing enforced it: `create_task.__annotations__` — a plain
attribute Python stores on every function object — is just a regular
`dict`, mapping each hinted name to the type object it was written
with. A type hint isn't a rule the interpreter consults before running
your code; it's inert metadata, sitting on the function object the same
way any other attribute would, that nothing in the language reads back
out and acts on unless some separate piece of code goes looking for it.
Writing `title: str` after a parameter name is syntax the interpreter
parses and *records*, not syntax it *enforces* — a direct consequence
of Lesson 1's model: a function's parameters are just names, and names
in Python can always be rebound to any object, hint or no hint.

### Discarding the Example

This exact throwaway version of `create_task` — with no guard clauses,
called directly in a standalone script — is deleted now. The real,
persistent version this curriculum keeps is built next, in Project
Change, below, and it starts from this same signature.

### Project Change

- **Reference Source:** No reference counterpart — this curriculum has
  no external reference implementation being ported; `create_task` is
  original to this project.
- **Files affected:** `project/tasks.py` — created new.
- **Change type:** Add (new file).
- **Location:** Not applicable — this is the first file in the project.
- **Dependencies:** The same Python 3 interpreter used in Lesson 1;
  nothing else yet.

### The New Code

```python
def create_task(title: str, priority: int) -> dict:
    return {"title": title, "priority": priority, "done": False}
```

### The Updated Project

This *is* the whole new file — nothing surrounds it yet, so there's
nothing further to show in context (per the schema: a brand-new file
with nothing established around it has no enclosing structure to
return to).

```
1  def create_task(title: str, priority: int) -> dict:
2      return {"title": title, "priority": priority, "done": False}
```

As a whole, this file currently does one thing: build a dictionary
representing a task, from a title and a priority — with type hints
present on every parameter and the return value, none of which, per
this unit's own lab, actually constrain anything yet.

### Mechanical Walkthrough

- `def create_task(...)` — a function definition statement; `def` is
  the keyword that begins it, `create_task` is the name being bound to
  the resulting function object (per Lesson 1's binding model: a
  function is an object too, and `create_task` is a name pointing at
  it — Lesson 4 covers this directly, but it's worth flagging here that
  nothing about function definitions is exempt from Lesson 1's model).
- `title: str` — a parameter with a **type hint** attached: `title` is
  the parameter name; `: str` is the annotation, stating the *expected*
  type without enforcing it, per this unit's own finding above.
- `priority: int` — the same annotation syntax, on the second
  parameter, hinting `int`.
- `-> dict` — a **return type annotation**: appears after the closing
  parenthesis of the parameter list, hinting what type the function is
  expected to return. Exactly as unenforced as the parameter hints —
  nothing checks, at the `return` statement below, that the returned
  value is actually a `dict`.
- `return {...}` — a `return` statement (Python's mechanism for handing
  a value back to whatever called the function and immediately ending
  that function's execution), whose value is a dict literal.
- `{"title": title, "priority": priority, "done": False}` — a dict
  literal: curly-brace syntax that constructs a new `dict` object with
  three key-value pairs. `"title": title` maps the string key `"title"`
  to whatever object the parameter name `title` is currently bound to
  (per Lesson 1: this looks up the object, it doesn't copy or transform
  it); `"priority": priority` does the same for the second parameter;
  `"done": False` maps the string key `"done"` to the boolean literal
  `False`, a fixed starting value with no hint or parameter behind it
  at all.

### CS Lens

This is a hard concept — the distinction between a language's
*declared* type system and what it actually *enforces* — so, per the
Repetition Rule, several unrelated recurrences:

```
Also recognized in: TypeScript (every type annotation is checked by the
TypeScript compiler, then completely erased from the JavaScript that
actually runs — the runtime has no idea types were ever there), database
schema "soft" constraints that exist only in documentation rather than
as enforced column types, HTML's optional `type="email"` input attribute
(a browser may hint at validation, but nothing stops a raw HTTP request
from submitting whatever text it wants), and C's function prototypes
before the era of strict compiler flags (a mismatched prototype could
compile with only a warning, not a hard error)
```

The underlying idea is **gradual typing**: a spectrum between "types
are pure documentation, checked by nothing" and "types are enforced by
the compiler with no exceptions," where a language or tool can sit
anywhere along it — and, crucially, where a *hint* being present tells
you nothing on its own about where the actual enforcement, if any,
lives.

### SE Lens

The alternative Python could have chosen — making a type hint mismatch
a hard runtime error automatically, every time, everywhere a hinted
function is called — was rejected because it would make Python's
existing dynamic-typing flexibility effectively mandatory-static
instead, at real performance cost (checking every argument against
every hint, on every call, throughout a program's entire execution) and
at the cost of patterns that intentionally rely on flexible typing (a
function that genuinely accepts "anything with a `.read()` method,"
say, which this lesson's third unit will show directly). Python's
actual design keeps type hints purely optional and non-enforcing at the
language level, and lets you opt into enforcement exactly where you
want it, at whatever cost you're willing to pay for it — a static
checker before the program runs (next unit) or a manual runtime check
inside the function itself (the unit after that). The honest cost this
project is now carrying, demonstrated directly by this unit's own lab:
`create_task`'s hints, as currently written, are trusted by nothing —
they read as a guarantee to anyone skimming the function's signature,
and that reading is currently false.

### Commands Needed

Both scripts in this unit's lab were run the ordinary way, exactly as
in Lesson 1:

```
python3 lab1.py
```

Nothing new here — same `python3` interpreter invocation, same meaning
for the filename argument, as Lesson 1's Commands Needed step already
covered in full.

### Run It

Already shown and verified above, under "Isolating the Concept":

```
Returned without error: {'title': 42, 'priority': 'urgent', 'done': False}
type(result['priority']): <class 'str'>

create_task.__annotations__: {'title': <class 'str'>, 'priority': <class 'int'>, 'return': <class 'dict'>}
type(create_task.__annotations__): <class 'dict'>
```

### Connection

This unit established that `create_task`'s hints, as written, are
purely descriptive — trusted by nothing at runtime. The next unit asks
the obvious follow-up: if Python itself won't check them, is there
anything that will, *before* a program with this exact mistake ever
gets run at all?

---

## Concept Unit: Static Checking with `mypy` — Catching It Before It Runs

### The Problem

The previous unit's mismatched call — `create_task(42, priority="urgent")`
— ran without error and produced quietly wrong data. In a real program,
that wrong data might not cause a visible failure until much later, far
from this call site, making the actual bug hard to trace back to its
source. C#'s compiler would have caught this the moment you tried to
build the program, with the error pointing at the exact line. Is there
any way to get that same "catch it before it runs, at the exact call
site" experience in Python, given that the previous unit just proved
the interpreter itself won't do it?

> **Before reading on:** the interpreter reads and executes your code
> top to bottom, one statement at a time — that's what "running a
> program" means. What would a *separate* tool need to do differently
> from that, to catch a type mismatch without ever actually running
> your code? Would it need to execute `create_task(42, priority="urgent")`
> to notice something's wrong, or could it, in principle, look at the
> call site and the function's own hinted signature side by side and
> reason about the mismatch without running anything at all?

### Isolating the Concept

A second project file, calling the function from the previous unit
with the exact same mismatched arguments:

```python
from tasks import create_task

new_task = create_task(42, priority="urgent")
print(new_task)
```

Run with `mypy` instead of `python3` — real, executed output:

```
main.py:3: error: Argument 1 to "create_task" has incompatible type "int"; expected "str"  [arg-type]
main.py:3: error: Argument "priority" to "create_task" has incompatible type "str"; expected "int"  [arg-type]
Found 2 errors in 1 file (checked 1 source file)
```

This is called a **static type checker**. `mypy` never executed
`create_task` — nothing was called, no `print` ran, no dict was ever
built. Instead, `mypy` read `main.py`'s source text, read `tasks.py`'s
source text (following the `import`), matched `create_task`'s hinted
signature (`title: str, priority: int`) against the literal argument
types written at the call site (`42` is an `int` literal; `priority=
"urgent"` is a `str` literal), and reported the exact mismatch — by
line number, by argument, by expected-versus-actual type — all before
a single line of the program ran. This is exactly the guarantee C#'s
compiler gives you, recovered in Python by choosing to run a separate
tool against your source, rather than something the `python3` command
itself was ever going to do.

### Discarding the Example

The throwaway framing of this call ("a second file, just to isolate
the check") is set aside — but note this is a deliberate exception to
the usual discard step: `main.py` is *not* deleted, because it's about
to become part of the real, persistent project (see Project Change,
below) rather than throwaway code. What's discarded is only the idea
that this file exists purely to demonstrate `mypy` — from here forward
it's a real entry point this curriculum keeps.

### Project Change

- **Reference Source:** No reference counterpart — original to this
  project, same as the previous unit.
- **Files affected:** `project/main.py` — created new.
- **Change type:** Add (new file).
- **Location:** Not applicable — new file, and it only depends on the
  already-existing `project/tasks.py` via `import`, shown alongside it
  below since this unit's own code doesn't modify `tasks.py` at all.
- **Dependencies:** `mypy`, installed via `pip install mypy` (or, on a
  system where plain `pip install` is blocked in favor of a
  system-managed Python, `pip install mypy --break-system-packages`) —
  covered in full in Commands Needed, below.

### The New Code

```python
from tasks import create_task

new_task = create_task(42, priority="urgent")
print(new_task)
```

### The Updated Project

Per the schema's own exception: this is a brand-new file, so there's no
larger enclosing structure to return to — but because this file's only
content is a *call* into the already-established `tasks.py`, that
dependency is shown alongside it here, rather than left floating with
nothing anchoring where `create_task` actually comes from:

```
tasks.py (already established, previous unit):
1  def create_task(title: str, priority: int) -> dict:
2      if not isinstance(title, str):
3          raise TypeError(f"title must be a str, got {type(title).__name__}")
4      if not isinstance(priority, int):
5          raise TypeError(f"priority must be an int, got {type(priority).__name__}")
6      return {"title": title, "priority": priority, "done": False}

main.py (new, this unit):
1  from tasks import create_task
2
3  new_task = create_task(42, priority="urgent")
4  print(new_task)
```

(`tasks.py` is shown here in the state it will reach by the *end* of
this lesson, including the guard clauses the next unit adds, because
that's the file's real current shape by the time this lesson is
finished — the version `mypy` was actually run against in this unit
had only the bare `return` line shown in the previous unit, and its
static-checking output is identical either way, since `isinstance`
checks are runtime code that a static checker doesn't execute or
reason about — it only ever reads the hinted signature on line 1
regardless of what the function body does.)

As a whole, `main.py` now does one thing: import the real
`create_task` function from the project's own `tasks.py`, call it with
a specific pair of intentionally mismatched arguments, and print
whatever comes back — a genuine entry point into the small project this
curriculum is building, not a throwaway lab script.

### Mechanical Walkthrough

- `from tasks import create_task` — an import statement: a keyword-pair,
  `from ... import ...`, that locates the module named `tasks` (Python
  resolves this to `tasks.py` sitting in the same directory), executes
  that file's top-level code once, and binds the name `create_task` in
  *this* file to the function object `tasks.py` itself bound that same
  name to.
- `new_task = create_task(42, priority="urgent")` — an assignment
  statement (Lesson 1) whose right-hand side is a function call:
  `create_task` is looked up (per the import above) and invoked with
  two arguments — `42`, passed positionally into the `title` parameter,
  and `"urgent"`, passed by keyword into the `priority` parameter. Per
  the previous unit, this call itself does not fail at the interpreter
  level; whatever `create_task` returns gets bound to `new_task`.
- `print(new_task)` — the `print` built-in (full treatment in Lesson 1,
  restated per the Repetition Rule: converts its argument to text and
  writes it, always returning `None`), applied to the returned dict.

### CS Lens

This reappears from the previous unit's gradual-typing idea, sharpened
into the specific mechanism that makes static checking possible without
execution:

```
Also recognized in: linters generally (tools like ESLint or Pylint that
analyze source text for problems without running it), the concept of
"shift-left" testing in software engineering (catching a class of bug
as early as possible in the development process, ideally before the
code is even run once), and formal program analysis techniques used in
compilers (type inference and type checking as a pass over source code,
entirely separate from the pass that generates or executes runnable
instructions)
```

### SE Lens

The alternative — building this exact checking directly into the
`python3` interpreter itself, so it refuses to start any program with a
hint mismatch anywhere in it — was rejected for Python as a language,
for the same flexibility-and-performance reasons the previous unit's SE
Lens already covered in full. Making it a *separate*, optional tool
instead means you pay `mypy`'s checking cost only when you choose to run
it (commonly: in a CI pipeline before merging code, or in an editor as
you type), and a program with hint mismatches can still run — which is
sometimes exactly what you want during early prototyping, and exactly
what you don't want once code reaches production. The real cost this
project is now carrying: `mypy` only catches what it can *see* in
source text. It never ran `create_task`, so it has no idea whether the
function's own internal logic is correct — only whether the call site's
argument types match the hinted signature. A bug living entirely inside
a function's own body, with no hint mismatch anywhere, is invisible to
this tool completely; static type checking and testing are different
safety nets, not substitutes for one another.

### Commands Needed

```
pip install mypy --break-system-packages
```

- `pip` — Python's standard package installer, which downloads and
  installs published Python packages (mypy included) from the Python
  Package Index.
- `install mypy` — tells `pip` which package to fetch and install.
- `--break-system-packages` — a flag required on systems where the
  Python installation is managed by the operating system's own package
  manager and `pip` would otherwise refuse to install anything directly
  into it, to avoid conflicting with OS-managed packages; it's an
  explicit acknowledgment that you understand the risk and want to
  proceed anyway. On a system using a virtual environment instead (a
  later lesson in this curriculum covers these directly), this flag
  isn't needed at all.

```
mypy main.py
```

- `mypy` — invokes the type checker itself, now that it's installed.
- `main.py` — tells it which file to analyze as the entry point; `mypy`
  follows that file's own `import` statements to also analyze `tasks.py`
  automatically, without being told to separately.

Success output, when no mismatches exist, is the single line
`Success: no issues found in 1 source file`. When mismatches exist, as
in this unit, `mypy` prints one line per problem and exits with a
non-zero process exit code (confirmed by running it directly and
checking: exit code `1` when errors are found, versus `0` on success)
— the same exit-code convention a CI pipeline checks to decide whether
to block a merge.

### Run It

Already shown and verified above, under "Isolating the Concept":

```
main.py:3: error: Argument 1 to "create_task" has incompatible type "int"; expected "str"  [arg-type]
main.py:3: error: Argument "priority" to "create_task" has incompatible type "str"; expected "int"  [arg-type]
Found 2 errors in 1 file (checked 1 source file)
```

### Connection

This unit recovered a compiler-like guarantee — but only for problems
visible in source code, before anything runs. The next unit asks what
happens to data that doesn't exist yet when `mypy` runs at all: values
typed by a user, read from a file, or received over a network — where
there's no call site in your source for a static checker to inspect,
because the actual value only exists once the program is already
running.

---

## Concept Unit: `isinstance` and Duck Typing — Enforcing at Runtime, Deliberately

### The Problem

`mypy` catches a mismatch like `create_task(42, priority="urgent")`
because that mismatch is visible directly in the source text it reads.
But consider a value that arrives while the program is already
running — typed into a terminal prompt, parsed out of a JSON request
body, read from a row in a CSV file. None of those values exist in your
source code for `mypy` to inspect; they only exist once the program is
executing, which is exactly the moment a static checker has already
finished its job and stepped aside. Does anything still protect
`create_task` from being called with the wrong type in that situation?

> **Before reading on:** think back to this lesson's first unit — the
> unguarded `create_task` accepted `42` for `title` without complaint.
> If a value is arriving from outside the program (user input, a
> network request) rather than being typed directly into a call site in
> your source, is there any way `mypy` could ever see it coming, no
> matter how carefully you ran it? If not, what would have to check it
> instead — and when would that check have to happen, relative to when
> the program is actually running?

### Isolating the Concept

First, the tool this unit is built around:

```python
print(isinstance(42, int))
print(isinstance("hi", int))
print(isinstance(True, int))
print(type(True))
```

Real, executed output:

```
isinstance(42, int): True
isinstance('hi', int): False
isinstance(True, int): True
type(True): <class 'bool'>
```

`isinstance` is a live, runtime check — unlike a hint, it's a real
function call that executes while the program is running and returns
an actual `True` or `False` you can act on immediately. The third line
is worth pausing on deliberately, because it's the kind of detail most
people using Python for years never notice: `isinstance(True, int)` is
`True`, even though `type(True)` clearly reports `<class 'bool'>`, not
`<class 'int'>`. This isn't a bug in `isinstance` — `bool` is, as a
real fact about Python's built-in type hierarchy, a subclass of `int`
(booleans have been implemented this way since early Python, largely
for historical and arithmetic-convenience reasons: `True + True`
genuinely evaluates to `2`). `isinstance` checks "is this an instance of
this type, or of a subclass of it" — not "is this type identical to
that type" — which is a real, sharp difference from `type(x) is int`,
a check some code mistakenly uses instead and which would report
`False` for a `bool`, silently rejecting a value `isinstance` would have
correctly accepted.

Second, the philosophy `isinstance`-based checking sits in tension
with:

```python
def add_all(container, items):
    for item in items:
        container.append(item)
    return container

print(add_all([], [1, 2, 3]))
print(add_all(set(), [1, 2, 3]))
```

Real, executed output:

```
[1, 2, 3]

Traceback (most recent call last):
  File "lab3.py", line 11, in <module>
    print(add_all(set(), [1, 2, 3]))
  File "lab3.py", line 3, in add_all
    container.append(item)
AttributeError: 'set' object has no attribute 'append'
```

`add_all` has no `isinstance` check anywhere in it — it simply assumes
whatever `container` is has an `.append()` method, and works correctly
for anything that does (a `list`, here) without caring what specific
type it is. When handed a `set`, which has no `.append()` (sets use
`.add()` instead), it fails — but honestly and immediately, with a
real, specific `AttributeError` pointing at exactly what went wrong,
rather than silently producing nonsense. This is called **duck
typing**: `add_all` never asked "is this a list?" — it only ever cared
"does this support `.append()`?", and Python was perfectly willing to
find out the answer by simply trying, rather than requiring an upfront
type check to permit the attempt at all.

### Discarding the Example

Both throwaway labs shown here — the bare `isinstance`/`bool` script and
the standalone `add_all` script — are deleted now. Neither becomes part
of the real project; they existed only to isolate `isinstance`'s actual
behavior and the duck-typing alternative it stands in contrast with.

### Project Change

- **Reference Source:** No reference counterpart — original to this
  project, same as both previous units in this lesson.
- **Files affected:** `project/tasks.py` — modified.
- **Change type:** Refactor (add guard clauses to the existing
  `create_task` function body; its signature and hints are unchanged).
- **Location:** Inside `create_task`, between the `def` line and the
  existing `return` statement added in this lesson's first unit.
- **Dependencies:** None new — `isinstance`, `type`, `TypeError`, and
  `raise` are all part of core Python, already available with no
  import.

### The New Code

```python
    if not isinstance(title, str):
        raise TypeError(f"title must be a str, got {type(title).__name__}")
    if not isinstance(priority, int):
        raise TypeError(f"priority must be an int, got {type(priority).__name__}")
```

### The Updated Project

```
1  def create_task(title: str, priority: int) -> dict:
2      if not isinstance(title, str):                                            # ← new
3          raise TypeError(f"title must be a str, got {type(title).__name__}")   # ← new
4      if not isinstance(priority, int):                                         # ← new
5          raise TypeError(f"priority must be an int, got {type(priority).__name__}")  # ← new
6      return {"title": title, "priority": priority, "done": False}
```

As a whole, `create_task` now does something meaningfully different
from where this lesson started: it no longer merely *hopes* its
arguments match the hints written on line 1 — it actively verifies
`title` and `priority` before ever reaching the `return` on line 6, and
refuses to build a task at all if either check fails, raising a
specific, informative error instead of quietly returning bad data the
way the very first version of this function did.

### Mechanical Walkthrough

- `if not isinstance(title, str):` — an `if` statement (a conditional:
  Python evaluates the expression after `if` and executes the indented
  block beneath it only when that expression is `True`) guarding a call
  to the `isinstance` built-in (full treatment in Objects and methods,
  above), checking whether the object `title` is bound to is a `str` or
  a subclass of it; `not` is a boolean operator that inverts the
  result, so the block beneath this line runs specifically when `title`
  is *not* a `str`.
- `raise TypeError(f"title must be a str, got {type(title).__name__}")`
  — `TypeError(...)` (full treatment above) constructs a new exception
  object, given an f-string (a string literal prefixed with `f`, which
  evaluates any `{...}` expressions inside it and splices their string
  form directly into the text) that calls `type(title)` (full treatment
  above, restated per the Repetition Rule since it reappears from
  Lesson 1) to get `title`'s real class, then reads `.__name__` off
  that class object — a plain attribute every `type` object carries,
  holding its short display name as a string (`"int"`, not
  `<class 'int'>`) — before `raise` (a keyword, not a call, flagged
  explicitly in Objects and methods above) triggers the actual
  exception, immediately halting `create_task`'s execution at this
  point rather than continuing to line 4.
- `if not isinstance(priority, int):` — the identical pattern as the
  first guard clause, checking `priority` against `int` instead of
  `title` against `str`.
- `raise TypeError(f"priority must be an int, got {type(priority).__name__}")`
  — the identical pattern as the first guard's `raise` line, reporting
  `priority`'s real type instead of `title`'s.

### Execution Trace

This is a timing/control-flow trace, not a changing-values one — the
crux is *when*, and *whether*, execution reaches line 6 at all, given
the exact mismatched call this lesson has used throughout
(`create_task(42, priority="urgent")`):

1. `isinstance(title, str)` is evaluated with `title` bound to `42` — an
   `int`, not a `str` or any subclass of it — so this returns `False`.
2. `not False` evaluates to `True`, so the `if` on line 2's condition is
   satisfied and the indented block on line 3 executes.
3. `type(title).__name__` evaluates to `"int"`, because `type(42)` is
   `<class 'int'>` and `.__name__` reads its display name off that
   class object.
4. The f-string on line 3 assembles into the string
   `"title must be a str, got int"`, and `TypeError` is constructed
   with that message.
5. `raise` triggers immediately — execution of `create_task` stops at
   this exact point. Lines 4, 5, and 6 never run at all for this call;
   `priority`'s own mismatch (`"urgent"` where `int` was hinted) is
   never even reached, because the function already halted on `title`'s
   failure first.

### CS Lens

This is a hard concept — the tension between explicit type-checking and
duck typing as two different philosophies for the same underlying
problem — so, per the Repetition Rule, several unrelated recurrences:

```
Also recognized in: Go's interface satisfaction (a type automatically
satisfies an interface just by having the right methods, with no
explicit "implements" declaration required — structural, not
nominal, exactly like duck typing), C++ templates before "concepts"
were added (a template function works on anything supporting the
operations it uses, and fails, sometimes cryptically, only when
compiled against something that doesn't), electrical connectors and
adapters (a device works with any power source presenting the correct
plug shape and voltage, regardless of brand or internal design), and
API contract testing generally (verifying a service behaves correctly
by checking what it does, not by checking its internal implementation
or declared type)
```

### SE Lens

The alternative this unit's own second lab demonstrates directly —
requiring every function to declare, upfront, the exact type of every
value it will accept, and rejecting anything else on sight, before even
attempting the operation — is the design philosophy strict, nominally-typed
languages default to. Python's standard library and ecosystem lean the
other way by convention: prefer trying the operation and letting a
natural failure (an `AttributeError`, here) tell you something's wrong,
over an upfront `isinstance` check that might reject a perfectly
workable object just because it wasn't built from the exact expected
class. The real tradeoff, made concrete by this exact lesson:
`create_task`'s new guard clauses are the *less* idiomatic-Python choice
in general — duck typing would suggest just trying to build the dict and
letting a natural failure occur if something's wrong — but this
function sits at a genuine trust boundary (creating a task from data
that may ultimately come from a user or an external request), and at a
boundary like that, an explicit, immediate, clearly-worded failure
(`"title must be a str, got int"`) is worth deliberately trading away
duck typing's flexibility for. The cost this project now openly carries:
these guard clauses make `create_task` slightly less flexible than it
was in this lesson's first unit — an object that behaves like a string
in every way that matters but isn't literally a `str` (or a subclass of
it) will now be rejected outright, something the very first,
unguarded version of this function would have happily accepted.

### Commands Needed

Both labs in this unit were run the ordinary way covered in Lesson 1
and this lesson's first unit — `python3 lab2.py` and `python3 lab3.py`
— nothing new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
both labs. And, separately, running the *real, updated* project's
`main.py` against the guarded `create_task` — the exact same mismatched
call this lesson has used throughout — produces this real, executed
output:

```
Traceback (most recent call last):
  File "main.py", line 3, in <module>
    new_task = create_task(42, priority="urgent")
  File "tasks.py", line 3, in create_task
    raise TypeError(f"title must be a str, got {type(title).__name__}")
TypeError: title must be a str, got int
```

Compare this directly against this lesson's very first unit, where the
identical call silently returned `{'title': 42, 'priority': 'urgent',
'done': False}` with no error at all. Same call, same arguments — the
only thing that changed between those two runs is the guard clauses
this unit just added.

### Connection

This unit closes the loop this whole lesson opened: hints (Unit 1)
describe intent but enforce nothing; `mypy` (Unit 2) enforces that
intent against your own source code, before anything runs, but is
blind to any value it can't see written directly in that source; a
manual `isinstance` guard (this unit) enforces it against real values,
while the program is actually running, at the exact boundary where
outside data enters — and, per this unit's SE Lens, is a deliberate,
situational choice, not a default you should reach for on every
function in idiomatic Python.

---

## Connect the Pieces

Trace one call through everything this lesson built: `create_task(42,
priority="urgent")`. In this lesson's first unit, before any guard
clauses existed, this call ran to completion and quietly returned
`{'title': 42, 'priority': 'urgent', 'done': False}` — wrong data, no
error, because `title: str` and `priority: int` were never anything
more than a `dict` Python stores on the function object and never reads
back. In the second unit, that same call — never executed this time,
only read as source text by `mypy` — was caught immediately: two
precise errors, by line number and by argument, before the program ever
ran, because `mypy` compares hinted signatures against call sites
directly in your code. In the third unit, with `isinstance` guard
clauses now added to `create_task` itself, that same call, *actually
executed* again, no longer returns anything at all — it raises a real
`TypeError`, immediately, naming exactly which argument was wrong and
what type showed up instead, because this specific function sits at a
trust boundary worth protecting even though Python's own duck-typing
convention, demonstrated separately in this same unit, would ordinarily
lean the other way. Three completely different mechanisms, three
different moments in a program's life — none of them redundant with
either of the others, and knowing which one is actually protecting you
at any given moment (or which one isn't) is the real skill this lesson
was built to teach.
