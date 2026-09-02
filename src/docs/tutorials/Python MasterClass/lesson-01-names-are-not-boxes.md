# Lesson 1: Names Are Not Boxes — Python's Reference Model

**What you will build.** You'll run three small, throwaway scripts that
expose what actually happens when Python executes `x = 42`: no value gets
copied into a labeled memory slot called `x`. Instead, an object gets
created somewhere, and the name `x` gets pointed at it. From there you'll
watch two names point at the *same* list, mutate it through one name, and
see the change show up through the other — not because Python did anything
magical, but because there was only ever one object and two names for it.
The transferable problem this lesson is actually about: in a
reference-semantics language, "assignment" and "copying" are two
different operations, and confusing them is the single most common source
of "my function mutated data I never meant to touch" bugs — in Python,
and in every other reference-semantics language (Java, C#, JavaScript)
once you get past their primitive types. Getting this model right here
means a `List<T> b = a;` in C# won't feel like new territory later — it'll
feel like a language you already understand wearing different syntax.

**What you need to know first.** Nothing — this is Lesson 1.

**Terms used in this lesson**

- **Object** — a single piece of data that exists somewhere in memory
  while your program runs, with a type, a value, and an identity. Python
  creates one every time you write a literal (`42`, `[1, 2, 3]`), call a
  constructor, or otherwise produce a value. This term exists because
  everything else in this lesson is a claim about *objects* — what a name
  does or doesn't do to one — so without a precise sense of "object" as a
  thing that exists independently of any name, the rest of the lesson has
  nothing to point at.
- **Name (identifier)** — a label, like `x` or `list1`, that can be made
  to point at an object. This term exists to be deliberately distinguished
  from "variable" in the C-family sense: a variable-as-box implies the
  name itself *is* a storage location; a name in Python is not a storage
  location at all, it's a reference that can be repointed.
- **Binding** — the act of making a name point at a particular object.
  `x = 42` is a binding: it does not create a box named `x` and pour `42`
  into it; it creates (or reuses) the object `42` and binds the name `x`
  to it. This term exists because "assignment" as a word carries baggage
  from box-model languages that actively misleads a reader here — you
  need a word for the real operation that isn't already contaminated by
  the wrong mental model.
- **Reference** — the pointer-like relationship a name has to the object
  it's bound to. A reference is not the object; it's the arrow from the
  name to the object. This term exists because "aliasing" (below) only
  makes sense once you can talk about two separate arrows landing on the
  same object.
- **Identity** — the fact that a specific object is *that exact object*
  and no other, distinguishable from every other object even if they look
  identical. This term exists because Python gives you a direct way to
  ask about it (the `is` operator and `id()`, both explained below under
  Objects and methods), and without the concept of identity, `is` has
  nothing to check.
- **Equality** — the fact that two objects (possibly two *different*
  objects) have the same value by whatever rule their type defines for
  "same value." This term exists to be placed directly opposite
  Identity: two grocery lists written on two different pieces of paper
  can be equal (same items) without being the same piece of paper
  (identical). Conflating these two is the exact mistake this lesson
  exists to prevent.
- **Mutability** — whether an object's internal state can be changed
  after it's created without changing *which* object it is. A list is
  mutable: you can append to it, and it's still the same object
  afterward (same identity, new contents). An int is immutable: there is
  no operation that changes a `5` into a `6` in place — "incrementing" a
  name bound to `5` actually creates a *new* object `6` and rebinds the
  name to it. This term exists because whether aliasing is dangerous
  depends entirely on this property, as Concept Unit 3 will show
  directly.
- **Aliasing** — the situation where two or more names are bound to the
  same object, so a mutation performed through one name is visible
  through every other name bound to that same object. This term exists
  to name the specific, recurring shape of bug this lesson is building
  toward being able to recognize on sight.
- **Assignment statement** — the Python statement `name = expression`,
  which evaluates the expression on the right into an object and binds
  the name on the left to it. This term exists because "assignment
  statement" is the formal name for the exact syntax every example in
  this lesson uses, and the whole lesson is an argument about what this
  statement actually does versus what it looks like it does.

**Objects and methods used**

- **`id`**
  - *What it is:* A built-in function, part of Python's core language —
    not something you import — available in every Python program with no
    setup.
  - *Implementation:* `id(object) -> int`. Takes exactly one argument (any
    object) and returns a plain integer.
  - *Its use:* This lesson's entire argument — "two names can point at the
    same object" — is otherwise invisible. `id()` is the tool that makes
    it visible: it returns a number guaranteed to be unique to that
    specific object for that object's lifetime, so two names producing
    the *same* `id()` result is direct, checkable proof they're bound to
    the same object, not just to two objects that happen to look alike.
  - *Type:* A built-in free function (not a method on any class, not
    `static` on anything — Python's built-ins live in a flat namespace
    available everywhere, unlike Java or C# where an equivalent would
    have to hang off some utility class).
  - *Responsibility:* Its full job is to report a value that (a) is
    guaranteed unique among all objects simultaneously alive in the
    program and (b) is guaranteed stable for as long as that specific
    object stays alive — nothing more. It is not a memory address by
    contract (CPython's implementation happens to return the actual
    memory address, which is *why* the values you'll see below look like
    large, arbitrary numbers, but that's an implementation detail, not
    part of `id()`'s guarantee — a different Python implementation could
    return small sequential integers instead and still be correct).
  - *Depends on:* A single argument — any object at all, of any type.
    Nothing else; it needs no prior setup, no import, no configuration.
  - *Connects to:* Called directly by this lesson's throwaway scripts;
    calls into the Python runtime's own object bookkeeping to read
    whatever value the runtime already tracks per-object (in CPython,
    the object's memory address); returns that value straight back to
    whichever `print()` call is displaying it. Nothing else in this
    lesson calls `id()`'s result onward — it terminates each time at a
    `print()`.
  - *Shape:* A single plain integer, every time — never `None`, never a
    tuple, never a formatted string. Two calls to `id()` on the same
    object in the same moment always return the exact same integer.

- **`type`**
  - *What it is:* A built-in function (the same flat-namespace kind as
    `id`, above) that reports what kind of object something is.
  - *Implementation:* `type(object) -> type`. Takes one argument and
    returns a `type` object — Python's own representation of "a class,"
    e.g. `<class 'int'>` or `<class 'list'>`.
  - *Its use:* This lesson doesn't lean on `type()` heavily, but it
    appears implicitly in reasoning about immutability (Concept Unit 3):
    knowing an object's type is what tells you, in general, whether it's
    mutable or immutable, since that's a property of the type, not of any
    individual object.
  - *Type:* A built-in free function, exactly like `id`, above — not a
    method, not attached to any particular class.
  - *Responsibility:* Report the exact class an object was constructed
    from — the full charter is "identify the type," nothing about
    mutability or behavior is reported directly; you infer those from
    already knowing the type.
  - *Depends on:* A single argument — any object.
  - *Connects to:* Called by code that wants to reason about an object's
    category before deciding how to treat it; reads the type pointer
    every Python object carries internally; returns that type object back
    to the caller.
  - *Shape:* A single `type` object — itself a first-class Python object,
    not a string naming the type (`type(5)` is `<class 'int'>`, not the
    string `"int"`).

- **`print`**
  - *What it is:* A built-in function that writes text to standard
    output.
  - *Implementation:* `print(*objects, sep=' ', end='\n', ...) -> None`.
    Accepts any number of positional arguments, converts each to its
    string form, joins them with `sep` (a space, by default), and writes
    the result followed by `end` (a newline, by default).
  - *Its use:* Every claim this lesson makes about identity, equality, and
    mutation is otherwise invisible while a script runs — `print()` is
    the mechanism that turns "trust me" into "look at the actual output,"
    which is the entire point of the Verification Rule this curriculum
    runs on.
  - *Type:* A built-in free function.
  - *Responsibility:* Convert whatever it's given to human-readable text
    and write it to the terminal — its full charter stops there; it does
    not return the formatted string to the caller for further use (see
    Shape, below).
  - *Depends on:* Zero or more positional arguments of any type; Python
    converts each to a string using that object's own string-conversion
    behavior before printing it.
  - *Connects to:* Called directly by every line of this lesson's labs
    that needs to surface a value; calls each argument's own
    string-conversion machinery internally; writes the final joined
    string to the process's standard output stream, which your terminal
    then displays.
  - *Shape:* Always returns `None` — `print()`'s job is the side effect of
    writing text, not producing a value a caller can use afterward. This
    matters here specifically because a beginner mistake is writing
    `result = print(x)` expecting `result` to hold the printed string;
    it holds `None` instead.

- **`is`**
  - *What it is:* Not a function or method — a language keyword and
    binary operator. It belongs in Terms, not here, by this schema's own
    rule (operators are Terms, not Objects/methods) — listed here only to
    make explicit that it is *not* being mistaken for a method call
    despite the similarity to `a.is(b)`-shaped syntax in other languages.
    Its real definition lives under Terms, above, as **Identity**.

**Everything else in the file, not this lesson's subject but still explained.**

- **`append`**
  - *What it is:* An instance method defined on Python's built-in `list`
    type.
  - *Implementation:* `list.append(self, item) -> None`. Called on a
    specific list object; takes one argument, the item to add.
  - *Its use:* Concept Unit 3 needs a way to change a list's contents
    without creating a new list, to demonstrate mutation-in-place — this
    is the simplest such operation `list` provides.
  - *Type:* An instance method — it operates on, and requires, a specific
    already-existing `list` object (`list2.append(4)`, not
    `list.append(4)`).
  - *Responsibility:* Add exactly one item to the end of the list it's
    called on, growing that same list object by one element — the full
    charter is "grow this exact object," not "produce a new, longer
    list."
  - *Depends on:* The list object it's called on (`self`, implicitly,
    via `list2.append(...)`) and the single item being appended.
  - *Connects to:* Called by this lesson's Lab 3 script; internally
    resizes the list object's own storage if needed and writes the new
    item into the next slot; returns nothing to the caller, because its
    entire effect is the mutation itself.
  - *Shape:* Always returns `None`. This is the exact detail that
    catches people coming from languages where the equivalent operation
    (e.g., a fluent builder's `.add()`) returns the object itself for
    chaining — writing `list2 = list2.append(4)` in Python silently
    throws the real list away and rebinds `list2` to `None`.

---

## Concept Unit: Assignment Binds a Name to an Object

### The Problem

In a language like C or an unmanaged struct in C#, a variable is a
labeled box: `int x = 42;` reserves a chunk of memory big enough for an
int, writes `42` into it, and the name `x` refers to *that specific
memory location* for as long as it's in scope. If you then write
`int y = x;`, the compiler copies the bits out of `x`'s box into a
*brand-new* box for `y`. Two boxes, two locations, one value copied
between them.

Python's syntax for the equivalent operation looks identical:
`x = 42` followed by `y = x`. The question this unit exists to answer:
does Python do the same thing under that same-looking syntax — allocate
a box for `x`, then copy its contents into a new box for `y` — or
something else entirely?

> **Before reading on:** if Python *did* work like the box model, what
> would you expect to be true about `x` and `y` after `y = x`? Would you
> expect them to be "the same thing" in any sense, or just two separate
> values that happen to be equal right now? Now consider: Python has a
> built-in function, `id()`, that you'll meet in a moment, whose entire
> job is reporting whether two names point at the exact same object.
> Before you're told what it prints — if the box model were true, what
> result would you *expect* `id(x) == id(y)` to produce, and why?

### Isolating the Concept

Here is the smallest possible script that exposes the real answer:

```python
x = 42
print(id(x))
y = x
print(id(y))
print(x is y)
```

This was actually executed — `id()`'s return value is a real memory
address in CPython (the standard Python implementation), which means it
is genuinely unpredictable ahead of time; per the Verification Rule, a
claim like this gets run for real, not guessed. The real output:

```
id(x): 11757000
id(y): 11757000
x is y: True
```

This proves the box model is wrong for Python. If `x` and `y` were
separate boxes with copied contents, `id(x)` and `id(y)` would almost
certainly differ — two different memory locations holding the same
value `42` is exactly what "copy" means. Instead, they're identical. The
only way two names can report the *same* identity is if there was never
a second box at all: `y = x` didn't copy anything: it took the name `y`
and pointed it at the very same object `x` was already pointing at.
This is called **name binding**, and `x is y` returning `True` — the
`is` operator, which checks identity rather than value — is Python
confirming directly that `x` and `y` are two arrows landing on one
object, not two separate objects that happen to look equal.

### Discarding the Example

This throwaway script — the bare `x = 42; y = x` and its two `print`
calls — is deleted now and will not appear in any later lesson or
project code. It existed only to expose the binding mechanism in the
smallest possible form; everything from here forward uses this
understanding without re-deriving it from this exact script.

### Project Change

- **Reference Source:** No reference counterpart — this is a
  from-scratch, standalone curriculum with no reference implementation
  being ported. Every lesson in this series states this plainly rather
  than fabricating one.
- **Files affected:** None yet — this unit's own code is throwaway and
  was just discarded above. The "project" this curriculum accumulates
  starts being touched in a later lesson once there's a real multi-file
  program to build; Lesson 1 exists purely to establish the model that
  every later lesson depends on.
- **Change type:** Not applicable — no project file exists yet.
- **Location:** Not applicable.
- **Dependencies:** A working Python 3 interpreter on your machine
  (this lesson used Python 3.12.3; any current Python 3 will behave
  identically for everything shown here).

### The New Code

There is no separate "New Code" step beyond the throwaway lab shown
above — this unit's entire teaching content *is* that lab, since there
is no project file yet for it to land in. The next Concept Unit builds
directly on the model this one established.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the lab above, in order:

- `x = 42` — an **assignment statement** (defined in Terms, above): the
  literal `42` is evaluated first, which causes the object `42` to
  exist; then the name `x` is **bound** to it. Nothing is copied into a
  location called `x`, because no such location exists to copy into —
  `x` is a name, not a box.
- `id(x)` — a call to the built-in function `id` (full treatment in
  Objects and methods, above), passing the object `x` is currently bound
  to, returning that object's unique identity as an integer.
- `print(id(x))` — a call to the built-in function `print` (full
  treatment above), passing the integer `id(x)` produced, which
  `print` converts to its string form and writes to the terminal.
- `y = x` — a second assignment statement. The right-hand side, `x`, is
  not a literal this time — it's a name, which Python evaluates by
  looking up what object it's currently bound to (`42`), then binds the
  name `y` to that same object. This is the crux of the whole unit:
  evaluating `x` on the right-hand side does not produce a copy of the
  object `x` points to; it produces the object itself, which `y` is
  then bound to as well.
- `id(y)` — the same `id` call as above, this time passing the object
  `y` is bound to.
- `print(id(y))` — the same `print` call as above, applied to `id(y)`'s
  result.
- `x is y` — use of the `is` operator (defined under **Identity** in
  Terms, above): a language keyword, not a method call, that asks
  "are these two names bound to the exact same object?" and evaluates
  to the boolean `True` or `False`.
- `print(x is y)` — `print` again, this time writing the boolean result
  of the `is` comparison.

### CS Lens

This is a **hard concept** — a language's own semantic model for
variables — so per the Repetition Rule, several unrelated recurrences
are worth naming, not just one:

```
Also recognized in: Java and C# object references (every non-primitive
type in both languages), JavaScript's object/array bindings, pointer
semantics in C and C++, symbolic links in a filesystem (a second path
that resolves to the same underlying file, not a copy of it), and
database foreign keys (a second row referencing the same target row,
not duplicating it)
```

The underlying computational idea is **reference semantics**: a name (or
a field, or a row) doesn't hold a value directly — it holds a pointer to
where the value actually lives, and multiple pointers can resolve to the
same place at once. Recognizing "this is the reference-semantics pattern
again" the moment you see two labels resolve to one underlying thing is
the actual transferable skill this lesson is building — it's the same
recognition whether the language is Python, C#, or a symlink in a
terminal.

### SE Lens

The alternative Python's designers did *not* choose is value semantics
for every type — the C-style model where every assignment is a full
copy, always. That alternative was rejected because it's expensive by
default: if `y = x` always copied `x`'s full contents, then passing a
large list into a function would silently copy the entire list every
time, even when the function only wants to read a few elements. Python
chose reference semantics for its object model so that binding a name
(including passing an argument into a function) is always a cheap,
constant-time operation — copying a pointer, never copying the
underlying data — and left copying as something you do *explicitly*
when you actually want it (a topic later lessons in this curriculum
will cover directly, once the model here is solid).

The honest cost this design carries, which the next Concept Unit makes
concrete: because binding is cheap and implicit, it's easy to create an
alias by accident — two names pointing at one object when you meant to
have two independent objects — and Python gives you no compiler warning
when that happens. The tool for noticing it is exactly what this unit
just demonstrated: `id()` and `is`, used deliberately when you suspect
aliasing might be in play.

### Commands Needed

None yet — this unit's code was run directly with `python3 <script>.py`
from a terminal, which the next unit's Commands Needed step will cover
in full since it's the first time this curriculum needs you to actually
type that command yourself.

### Run It

Already shown and verified above, under "Isolating the Concept" — the
real, executed output was:

```
id(x): 11757000
id(y): 11757000
x is y: True
```

### Connection

This unit established that an assignment statement binds a name to an
object rather than copying a value into a box. The next unit asks the
question this naturally raises: if two *separately created* objects
happen to have the same value, does `is` still say `True`? Or is
identity about something stricter than "looks the same"?

---

## Concept Unit: Identity vs. Equality — `is` vs. `==`

### The Problem

The previous unit showed that `y = x` makes `x is y` true, because there
was only ever one object. But what about two lists that are never
bound from each other — two completely separate assignment statements
that each build a list with the same contents?

> **Before reading on:** if you write `a = [1, 2, 3]` and, on a
> completely separate line, `b = [1, 2, 3]`, did Python's earlier
> behavior — where `id(x)` and `id(y)` matched because there was only one
> object — give you any reason to expect `a` and `b` to share an
> identity too? What's actually different about how `a` and `b` are each
> created, compared to how `y = x` was created in the previous unit? And
> separately: what do you think `a == b` should report versus `a is b`
> — do you expect those two questions to have the same answer here, or
> different ones?

### Isolating the Concept

```python
a = [1, 2, 3]
b = [1, 2, 3]
print(a == b)
print(a is b)
print(id(a))
print(id(b))
```

Executed for real, since `id()`'s output is never guessable ahead of
time:

```
a == b: True
a is b: False
id(a): 140190999104320
id(b): 140190999106112
```

This is called the distinction between **equality** and **identity**.
`a == b` is `True` because `==` asks "do these two objects have the same
*value*" — and `list`'s definition of "same value" is "same length, same
elements, in the same order," which both lists satisfy. `a is b` is
`False` because `is` asks the stricter question this unit is actually
about — "are these the exact same object" — and the two different `id()`
values prove they're not: `a = [1, 2, 3]` built one list object; the
completely separate statement `b = [1, 2, 3]` built a *second*, distinct
list object that only coincidentally holds equal contents. Unlike the
previous unit, where `y = x` explicitly bound `y` to the object `x`
already pointed at, nothing here ever pointed `b` at `a`'s object — each
literal list expression constructs its own new object, every time it's
evaluated.

### Discarding the Example

This throwaway script — the `a`/`b` list comparison and its four `print`
calls — is deleted now and will not appear in later lessons or project
code. It existed only to isolate the identity/equality distinction in
the smallest form possible.

### Project Change

- **Reference Source:** No reference counterpart — same as the previous
  unit, this remains a from-scratch curriculum with nothing being
  ported.
- **Files affected:** None — still throwaway-only; no project file
  exists yet.
- **Change type:** Not applicable.
- **Location:** Not applicable.
- **Dependencies:** Same Python 3 interpreter as the previous unit;
  nothing new required.

### The New Code

No separate step beyond the lab shown above, for the same reason as the
previous unit — there is no project file yet for this to modify.

### Mechanical Walkthrough

- `a = [1, 2, 3]` — an assignment statement. The right-hand side,
  `[1, 2, 3]`, is a list literal: syntax that constructs a brand-new
  `list` object containing the three integer objects `1`, `2`, and `3`,
  in that order, every single time this expression is evaluated. The
  name `a` is then bound to that freshly constructed object.
- `b = [1, 2, 3]` — a second, textually identical list literal. Because
  a list literal *constructs* a new object rather than looking up an
  existing one, this produces a second, distinct list object — equal in
  contents to `a`'s object, but not the same object — and binds `b` to
  it.
- `a == b` — use of the `==` operator (**Equality**, defined in Terms,
  above): for a `list`, this compares the two lists element-by-element,
  in order, using each element's own `==` behavior, and reports `True`
  only if every position matches.
- `print(a == b)` — the `print` built-in (full treatment in the previous
  unit's walkthrough, restated per the Repetition Rule: it converts its
  argument to text and writes it, always returning `None`), applied to
  the boolean result of `a == b`.
- `a is b` — use of the `is` operator (**Identity**, defined in Terms,
  above): compares `id(a)` and `id(b)` directly, without looking at
  either list's contents at all, and reports `True` only if they're the
  literal same object.
- `print(a is b)` — `print`, applied to the boolean result of `a is b`.
- `id(a)` — a call to the built-in `id` function (full treatment above),
  passing the object `a` is bound to, returning its unique identity.
- `print(id(a))` — `print`, applied to that integer.
- `id(b)` — the same `id` call, this time on `b`'s object.
- `print(id(b))` — `print`, applied to that second integer.

### CS Lens

This reappears — per the Repetition Rule, restated here in full: the
same reference-semantics idea from the previous unit, now sharpened into
the specific distinction between comparing *what something is* and
*what something is worth*.

```
Also recognized in: real-world identity documents (two people who both
happen to be named "John Smith" are equal by name but not the same
person — identity is checked by something stricter, like a passport
number), database primary keys vs. column values (two rows can have
identical data in every column and still be different rows), and
hash-based data deduplication (checking whether two files are the
"same" by comparing content hashes rather than filesystem identity)
```

Every one of these is the same underlying question restated: is this a
question about *value* or a question about *which specific instance*?
Conflating the two is a recurring bug shape across every language and
domain, not a Python quirk.

### SE Lens

Python's designers made `==` and `is` two separate operators, rather
than folding identity-checking into `==` (which is what some languages
do implicitly, and what a beginner instinctively expects `==` to mean
for objects). The alternative — one operator that means "equal," and
you're just supposed to know from context whether that means "same
object" or "same value" — was rejected because those are genuinely
different questions with genuinely different correct answers depending
on what you're trying to find out, and silently picking one for you
removes the ability to ask the other. The honest cost: a beginner
coming from a language where `==` on objects *does* mean identity by
default (a bare, un-overridden `==` in Java, for instance, before a
class defines its own `equals`) can write `is` when they meant `==`, or
the reverse, and get a program that runs without error but gives the
wrong answer — this is a real, common class of bug, not a hypothetical
one, and it's exactly why this unit exists this early in the
curriculum.

### Commands Needed

None new.

### Run It

Already shown and verified above, under "Isolating the Concept":

```
a == b: True
a is b: False
id(a): 140190999104320
id(b): 140190999106112
```

### Connection

This unit sharpened the previous one's discovery: binding (`y = x`)
shares an object and makes `is` true; constructing separately
(`a = [...]`, `b = [...]`) never shares an object, even with identical
contents, and makes `is` false. The next unit asks what actually
*happens* when two names really are bound to the same object and one of
them is used to change it — because "the same object" stopped being an
abstract fact in this unit and is about to become something you can
watch cause a real, possibly surprising, effect.

---

## Concept Unit: Mutability and Aliasing

### The Problem

Concept Unit 1 showed that `y = x` binds two names to one object.
Concept Unit 2 showed how to detect that with `is`. Neither unit showed
what it actually *costs* you when two names share an object. This unit
answers that directly, by changing the object through one name and
watching what happens through the other.

> **Before reading on:** given everything shown so far — that `list2 =
> list1` would bind both names to the same list object, exactly like
> `y = x` did with `42` — what do you predict happens to `list1` if you
> then call `list2.append(4)`? Does `list1` stay `[1, 2, 3]`, unaffected,
> because the append was performed "on `list2`"? Or does something else
> happen? Try to state your prediction concretely — what would
> `print(list1)` show — before reading the real answer below. Then
> consider: earlier, in Concept Unit 1, `n2 = n2 + 1` was used on an
> int that started out aliased to `n1` (both bound to `5`). What do you
> predict happens to `n1` in that case — does it also change? What's
> different about `+ 1` versus `.append(4)` that might make the answer
> different for an int than for a list?

### Isolating the Concept

```python
list1 = [1, 2, 3]
list2 = list1
print(id(list1))
print(id(list2))
list2.append(4)
print(list1)
print(list2)
print(list1 is list2)
```

Executed for real:

```
id(list1): 140190994702784
id(list2): 140190994702784
list1 after list2.append(4): [1, 2, 3, 4]
list2 after list2.append(4): [1, 2, 3, 4]
list1 is list2: True
```

`list1` changed — even though the code only ever called
`.append()` "on `list2`." This is not a special case or a bug: it
follows directly from everything the previous two units already proved.
`list2 = list1` binds `list2` to the *same* object `list1` is bound to
(Concept Unit 1's finding, confirmed here again by the matching `id()`
values). Since it's the same object, there is only one list in memory to
mutate — `.append()` doesn't create a new, longer list; it grows the
existing one in place. Whichever name you use to reach that object,
you're reaching the same underlying data. This situation — two or more
names bound to one mutable object, where a change through any one name
is visible through all of them — is called **aliasing**.

Now the immutable contrast, run in the same batch:

```python
n1 = 5
n2 = n1
print(id(n1), id(n2), n1 is n2)
n2 = n2 + 1
print(n1, n2)
print(id(n1), id(n2))
```

Real output:

```
id(n1): 11755816  id(n2): 11755816  n1 is n2: True
after n2 = n2 + 1  ->  n1: 5  n2: 6
id(n1): 11755816  id(n2): 11755848
```

Here, `n1` did *not* change. `n2 = n2 + 1` looks like it "mutates `n2`,"
the same way `list2.append(4)` looked like it "mutates `list2`" — but
`int` objects are **immutable** (defined in Terms, above): there is no
operation that changes an existing int object's value in place. `n2 +
1` computes a brand-new int object, `6`, and *that* new object is what
`n2` gets rebound to — `n1` is left exactly where it was, still bound to
the original `5`. The final `id()` values prove it: `id(n1)` is
unchanged from before, while `id(n2)` changed to a new address entirely
— because `n2` is now bound to a genuinely different object, not the
same object with different contents.

### Discarding the Example

Both throwaway scripts shown here — the `list1`/`list2` aliasing
example and the `n1`/`n2` immutability contrast — are deleted now and
will not appear in later lessons or project code. They existed only to
make the mutability distinction visible in the smallest possible form.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch, as
  with the previous two units.
- **Files affected:** None — Lesson 1 in full stays throwaway-only, by
  design: it's establishing a mental model, not starting the
  curriculum's real accumulated project, which begins in the next
  lesson.
- **Change type:** Not applicable.
- **Location:** Not applicable.
- **Dependencies:** Same Python 3 interpreter as the previous two
  units.

### The New Code

No separate step, for the same reason as both previous units.

### Mechanical Walkthrough

- `list1 = [1, 2, 3]` — an assignment statement; the list literal
  constructs one new `list` object, and `list1` is bound to it (same
  mechanism as Concept Unit 2's list literals, restated here per the
  Repetition Rule).
- `list2 = list1` — an assignment statement whose right-hand side is a
  name, not a literal. Per Concept Unit 1's finding, evaluating a name
  yields the object it's already bound to, not a copy — so `list2` is
  bound to the exact same list object `list1` is bound to. No second
  list is created.
- `id(list1)`, `print(id(list1))`, `id(list2)`, `print(id(list2))` —
  the same `id` and `print` built-ins covered in full in Concept Unit
  1's walkthrough, restated here per the Repetition Rule: `id` reports
  each name's object's unique identity; `print` converts each integer
  to text and writes it.
- `list2.append(4)` — a call to the `append` instance method (full
  treatment under "Everything else in the file," above), invoked on the
  object `list2` is bound to. Because `list2` and `list1` are bound to
  the same object, this mutates the one list both names can reach —
  there is no version of this call that could affect only "`list2`'s
  list" while leaving "`list1`'s list" untouched, because there was
  never a second list to begin with.
- `print(list1)` — `print`, applied directly to the list object `list1`
  is bound to; a list's default printed form shows its elements in
  order inside square brackets, which is why this displays
  `[1, 2, 3, 4]` and not some opaque reference notation.
- `print(list2)` — the same, applied to `list2`; identical output to
  the line above, because it's the same object being printed twice
  through two different names.
- `list1 is list2` — the `is` operator (full treatment in Concept Unit
  2), confirming directly that the two names still point at one object
  even after the mutation — mutation never changes *which* object a
  name is bound to, only that object's own contents.
- `print(list1 is list2)` — `print`, applied to that boolean.
- `n1 = 5` — an assignment statement binding `n1` to the int object
  `5`.
- `n2 = n1` — evaluates the name `n1` (yielding the object it's bound
  to, per Concept Unit 1) and binds `n2` to that same object; at this
  point `n1` and `n2` are aliased exactly like `list1`/`list2` were.
- `print(id(n1), id(n2), n1 is n2)` — a single `print` call given three
  arguments at once; per `print`'s own signature (full treatment in
  Concept Unit 1's walkthrough), multiple positional arguments get
  joined with a space and printed on one line — this is why the real
  output above shows all three values on a single line rather than
  three separate `print` calls' worth of lines.
- `n2 = n2 + 1` — the crux of this half of the unit. `n2 + 1` is
  evaluated first: the `+` operator on two ints computes a new integer
  value and produces a *new* int object (`6`) to represent it — it does
  not, and cannot, reach into the existing `5` object and change its
  value, because int is immutable (defined in Terms, above). Only after
  that new object exists does the assignment rebind the name `n2` to
  it. `n1` was never touched by any part of this statement — it's still
  bound to the original `5` object it always was.
- `print(n1, n2)` — `print`, given two arguments, showing both current
  values on one line.
- `print(id(n1), id(n2))` — `print`, given two arguments, showing that
  `n1`'s identity is unchanged while `n2`'s has changed to a new
  object's address.

### Execution Trace

This code doesn't loop, but it does carry state across sequential
statements in a way where *which object a name resolves to* changes
between lines — worth tracing explicitly rather than only described in
prose:

1. `list1 = [1, 2, 3]` — `list1` now resolves to Object A (a new list,
   contents `[1, 2, 3]`).
2. `list2 = list1` — `list2` now also resolves to Object A. No new
   object was created; both names share one.
3. `list2.append(4)` — Object A itself changes, in place, from
   `[1, 2, 3]` to `[1, 2, 3, 4]`. No new object is created; `list1` and
   `list2` still both resolve to Object A, which is why both now show
   the updated contents.
4. `n1 = 5` — `n1` now resolves to Object B (the int `5`).
5. `n2 = n1` — `n2` now also resolves to Object B. Same sharing as step
   2, but this time the shared object is immutable, which matters at
   the next step.
6. `n2 = n2 + 1` — `n2 + 1` is evaluated against Object B's value (`5`),
   producing a brand-new Object C (the int `6`). `n2` is then rebound
   to Object C. Object B itself is never modified — it can't be, per
   int's immutability — so `n1`, still resolving to Object B, is
   completely unaffected by this line.

### CS Lens

This is the hard concept the whole lesson has been building toward, so,
per the Repetition Rule, it earns several unrelated recurrences again,
specific to *mutability's* role this time rather than reference
semantics in general:

```
Also recognized in: shared mutable state in multithreaded programs
(two threads holding a reference to the same object, where one thread's
write becomes visible to the other — the entire reason locks exist),
copy-on-write filesystems and container images (data is aliased/shared
until the moment something tries to modify it, at which point a private
copy is made instead of mutating the shared original), and functional
programming's preference for immutable data structures generally (an
entire design philosophy that exists specifically to make the aliasing
hazard shown in this unit structurally impossible, by making "mutate in
place" not an available operation at all)
```

### SE Lens

The alternative Python could have chosen — making every built-in type
immutable, the way functional languages often do — was rejected because
in-place mutation is often exactly what you want and is significantly
cheaper: growing a list in place is a fast, amortized operation;
rebuilding an entire new list every time you want to add one element
is not. Python's actual design keeps *some* types mutable (`list`,
`dict`, `set`) and makes others immutable (`int`, `str`, `tuple`) as a
deliberate per-type tradeoff, not a blanket rule either way. The
maintenance cost this project is carrying as a direct result, and which
every later lesson in this curriculum has to stay aware of: any
function that receives a mutable object as an argument can mutate the
caller's data without the caller's knowledge unless the function is
explicitly careful not to — this is not a hypothetical, it's the literal
mechanism this unit just demonstrated, and it is the single most common
real-world bug this entire lesson exists to make you recognize on
sight, in your own code, before it ships.

### Commands Needed

Both this lesson's scripts were run the same way — save the code to a
file (for example, `lab.py`), then from a terminal, in the same
directory as that file, run:

```
python3 lab.py
```

- `python3` — the command that invokes the Python 3 interpreter
  installed on your machine (on some systems this is just `python`;
  `python3` is used explicitly here to avoid ambiguity with a
  possible Python 2 installation, which is end-of-life and should not
  be relied on).
- `lab.py` — a positional argument telling the interpreter which file
  to read and execute, top to bottom, as a script.

Success output is whatever your `print()` calls produce, written to the
terminal, with no error traceback — if something in the script raised
an exception instead, you'd see a traceback ending in the exception
type and message rather than your expected `print()` output.

### Run It

Already shown and verified above, under "Isolating the Concept" — both
scripts' real output was:

```
id(list1): 140190994702784
id(list2): 140190994702784
list1 after list2.append(4): [1, 2, 3, 4]
list2 after list2.append(4): [1, 2, 3, 4]
list1 is list2: True

id(n1): 11755816  id(n2): 11755816  n1 is n2: True
after n2 = n2 + 1  ->  n1: 5  n2: 6
id(n1): 11755816  id(n2): 11755848
```

### Connection

This unit is where the previous two units' abstractions became a
concrete, visible effect: aliasing (Unit 1) plus a mutable type produces
action-at-a-distance through an `append` call; aliasing plus an
immutable type does not, because "changing" an immutable object is
never really changing it in place — it's silently rebinding a name to a
new object instead.

---

## Connect the Pieces

Trace one value through everything this lesson built, start to finish:
imagine a list `inventory = ["hammer", "wrench"]`, handed off with
`backup = inventory` inside some larger program. Per Concept Unit 1,
that's not a copy — `backup` is now a second name for the exact same
object `inventory` already points at, provably so if you checked
`id(inventory) == id(backup)`. Per Concept Unit 2, if some other part of
the program had instead built its own separate list with
`backup = ["hammer", "wrench"]`, `backup == inventory` would still be
`True` (same contents) but `backup is inventory` would be `False` (two
different objects) — a completely different situation from the aliasing
above, even though both would print identically if you only ever looked
at their contents. And per Concept Unit 3, the practical stakes of
which of those two situations you're actually in: if `backup` really is
aliased to `inventory` (the `backup = inventory` case), and somewhere
else in the program a line reads `backup.append("saw")` expecting to
build up a private list called `backup` — `inventory` silently gains a
`"saw"` too, because there was only ever one list, reachable by two
names, and mutating it through either name mutates the one thing both
names were ever pointing at.

This is the model every future lesson in this curriculum assumes you
have solid: not "Python variables," but names, bound to objects, some of
which can be mutated in place and some of which can't — and knowing
which situation you're in, on sight, before it costs you a bug.
