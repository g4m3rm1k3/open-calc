# Lesson 1: The Array as a Typed, Shaped Container

## What you will build

A tiny, growing toolkit file, `datatools.py`, that starts this lesson
holding a single function: one that takes a plain Python list of house
sizes (in square feet) and converts it to square meters. By the end of
the lesson that function stores its numbers in a NumPy array instead of
a Python list, inspects that array's shape and storage type, and
converts every value with one arithmetic expression instead of a loop.
The transferable problem this lesson is actually about: Python's own
`list` has no idea what *kind* of numbers it holds and can't operate on
"all of them at once" — every later lesson in this curriculum (Pandas,
plotting, the ML algorithms themselves) is built on a container that
fixes both of those gaps, and this lesson is where that container is
introduced from first principles.

## What you need to know first

Nothing — this is Lesson 1. You're assumed to know basic Python:
variables, `list`, `for` loops, defining and calling functions, and
`print`.

## Terms used in this lesson

- **module** — a `.py` file (or a compiled package pretending to be
  one) that groups related code under one name, so that code can be
  reused across programs without copy-pasting it. NumPy itself is a
  module — really a *package*, a folder of modules — and everything
  this lesson does starts by getting access to it.
- **`import`** — a statement that loads a module's code into the
  current program and binds it to a name, making everything that
  module defines reachable through that name. It exists because
  Python does not put every installed library's names in scope by
  default; without `import`, `np.array` would be a plain `NameError`.
- **`as` (import alias)** — a clause on `import` that binds the
  imported module to a name of your choosing instead of its own full
  name. It exists purely for ergonomics: `numpy` is typed constantly
  in real code, and `np` is the community-wide convention so that
  every NumPy program, in every codebase, reads the same way.
- **vectorization** — performing an operation on every element of a
  collection in a single expression, with the looping done inside
  compiled C code rather than inside your own Python `for` loop. It
  exists because a Python-level loop pays Python's own per-iteration
  overhead (bytecode dispatch, type checks) on every single element;
  pushing the loop into C removes that overhead for the whole
  operation at once.

## Objects and methods used

### `np.array`

- **What it is:** a top-level function in the NumPy package that
  builds a new `ndarray` (NumPy's array type) out of an existing
  Python sequence — a `list`, a `tuple`, or another array.
- **Implementation:** `numpy.array(object, dtype=None) -> numpy.ndarray`.
  `object` is the sequence to convert; `dtype`, left out in this
  lesson, lets you force a specific storage type instead of letting
  NumPy infer one.
- **Its use:** it's the on-ramp from "a plain Python list of numbers"
  to "a NumPy array" — every array in this lesson starts life as a
  call to this function.
- **Type:** a free function (`numpy.array`), not a method on any
  object — you call it as `np.array(...)`, not on an existing array.
- **Responsibility:** inspect the sequence it's handed, decide a
  single storage type that can represent every element in it without
  losing information, allocate one contiguous block of memory sized
  for that type and the sequence's length, and copy each element into
  that block.
- **Depends on:** a Python sequence to read from (here, a `list`); it
  needs nothing else to do its job.
- **Connects to:** it's called directly by this lesson's own code with
  a `list` literal or a `list` variable as input, and it returns an
  `ndarray` that every later line — `.shape`, `.dtype`, and the
  arithmetic operators — is then called on or applied to.
- **Shape:** the entry point of NumPy's own public API for building
  arrays from existing Python data; everything downstream in this
  curriculum that needs a NumPy array starts here.

### `ndarray.shape`

- **What it is:** an attribute (not a method — no parentheses) on
  every `ndarray` instance, holding that array's dimensions.
- **Implementation:** a `tuple` of integers, one per dimension, in
  order — `(4,)` for a 4-element one-dimensional array, `(3, 2)` for
  three rows and two columns.
- **Its use:** it's the fastest way to answer "how much data is
  actually in here, arranged how?" without printing and counting the
  whole array by eye.
- **Type:** an instance attribute — a plain data field read off an
  `ndarray` object, computed once when the array is built and stored,
  not recalculated on each access.
- **Responsibility:** report the array's own dimensionality and
  per-dimension size, faithfully and only that — it does not report
  the array's storage type or its contents.
- **Depends on:** an already-constructed `ndarray` to read the
  attribute from; it takes no arguments because it isn't a method
  call.
- **Connects to:** read directly after `np.array` builds the array in
  this lesson's own code, with nothing else consuming its value except
  `print`.
- **Shape:** part of every `ndarray`'s public, inspectable state — the
  same attribute every NumPy array in every later lesson will carry.

### `ndarray.dtype`

- **What it is:** an attribute on every `ndarray` instance naming the
  single data type every element in that array is stored as.
- **Implementation:** a `numpy.dtype` object; printing it shows a
  short code such as `float64` (a 64-bit floating-point number) or
  `int64` (a 64-bit integer).
- **Its use:** it's how you check, without inspecting every element by
  hand, what NumPy actually decided to store your numbers as — which
  matters because that decision affects memory use, precision, and
  which arithmetic is even valid.
- **Type:** an instance attribute, exactly like `.shape` — a stored
  field, not a method call.
- **Responsibility:** report the one storage type shared by every
  element in the array — full stop; it does not report or enforce
  anything about the *values*, only the *type* they're all stored as.
- **Depends on:** an already-constructed `ndarray`; nothing else.
- **Connects to:** read directly after `np.array` builds the array, in
  this lesson's own code, the same as `.shape` — the two are read
  back to back to answer "how many, and stored as what?"
- **Shape:** part of every `ndarray`'s public, inspectable state,
  alongside `.shape`.

---

## Concept Unit: Creating a Typed Array from a Python List

### The Problem

A Python `list` can hold `[1.72, 1.65, 1.80, 1.58]` just fine, and you
can loop over it, but a plain `list` has no idea, as a whole, what kind
of thing it's holding — element `0` could be a float, element `1`
could just as easily be a string or another list, and Python has to
check each one individually every time it touches it. Machine learning
math — matrix multiplication, distances between points, gradient
updates — is defined over uniform blocks of numbers, not "a bag of
whatever." Before any of that math can happen, the numbers need to live
in a container that has committed, once, to a single type for
everything inside it.

Before reading on: you already know `list` and `for` loops. If someone
handed you a `list` of numbers and told you "make a version of this
that Python can guarantee is *all* one number type, with no per-element
checking," what would you try first — is there anything about `list`
itself that already gives you that guarantee, or does it feel like
you'd need to check the types yourself? What would you expect to
happen if a `list` mixed `1.72` with the string `"1.65"` — would
Python complain when the list was built, or only later, when the math
was attempted?

### Isolated Example

```python
>>> import numpy as np
>>> np.array([1.72, 1.65, 1.80, 1.58])
array([1.72, 1.65, 1.8 , 1.58])
```

Run for real, this session:

```
>>> import numpy as np
>>> np.array([1.72, 1.65, 1.80, 1.58])
array([1.72, 1.65, 1.8 , 1.58])
```

This proves two things at once. First, `np.array` accepts a plain
Python `list` directly — no conversion step of your own required.
Second, the printed result is labeled `array(...)`, not `[...]` — it's
a genuinely different type from the `list` you handed in, confirmed by
checking `type(...)` on it:

```
>>> type(np.array([1.72, 1.65, 1.80, 1.58]))
<class 'numpy.ndarray'>
```

This is called an **`ndarray`** — short for *n-dimensional array* —
and `np.array(...)` is the function that builds one. This throwaway
example is discarded now; it exists only to prove `np.array` accepts a
`list` and returns an `ndarray`, and it will not appear in
`datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — this is a
  from-scratch addition. This curriculum's own toy project,
  `datatools.py`, has no existing prior lesson state; this is its
  first line of real code.
- **Files affected:** `datatools.py` — created.
- **Change type:** add (new file).
- **Location:** n/a — this is the file's first content.
- **Dependencies:** NumPy must be installed (`pip install numpy`, if
  it isn't already — see Commands, below).

### The New Code

```python
import numpy as np

sizes_sqft = [1400, 1850, 900, 2200]
sizes_array = np.array(sizes_sqft)
```

### The Updated Project

This *is* the whole new structure — a brand-new file with nothing
surrounding it yet — so there's no larger enclosing function or class
to return to and show. `datatools.py` now contains exactly these three
lines, in full:

```
1  import numpy as np
2
3  sizes_sqft = [1400, 1850, 900, 2200]
4  sizes_array = np.array(sizes_sqft)
```

As a whole, this file currently does one thing: it makes NumPy
available under the name `np`, and it converts one plain Python `list`
of house sizes into an `ndarray`. Nothing is printed or returned yet —
that comes in the next two Concept Units.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code block, in
order:

- **`import numpy as np`** — the `import` statement, explained above
  under Terms as loading a module's code and binding it to a name so
  its contents become reachable. Here the module being loaded is
  `numpy` itself, and the `as np` clause (also explained under Terms)
  rebinds it to the shorter name `np` instead of forcing every later
  reference to spell out `numpy.array(...)` in full. Without this
  line, every `np.` reference below it would raise `NameError: name
  'np' is not defined` — Python does not know about installed
  packages until an `import` statement asks for them by name.
- **`sizes_sqft = [1400, 1850, 900, 2200]`** — an already-familiar
  Python `list` literal, assigned to a variable. Per the Repetition
  Rule, it still gets a real sentence here even though it's ordinary,
  previously-known syntax: four integer literals, separated by commas,
  collected inside square brackets into one `list` object, bound to
  the name `sizes_sqft`. This is the plain, untyped-as-a-whole
  container described in "The Problem," above — it exists here
  specifically so the next line has something to convert.
- **`np.array(...)`** — the function call explained in full under
  Objects and methods, above: a free function on the `numpy` module,
  reached through the `np` alias, that reads a sequence and builds a
  new `ndarray` from it. Here it's called with `sizes_sqft` as its
  single argument — the `object` parameter named in its signature.
- **`sizes_array = ...`** — assignment, familiar Python syntax,
  binding the name `sizes_array` to whatever `np.array(sizes_sqft)`
  returns — the newly built `ndarray`, per the isolated example above.
  This is the first time in this file that a name refers to NumPy's
  array type rather than a plain Python `list`.

### CS Lens

This embodies a computational idea usually called **type
homogeneity** — a container that constrains every element to one
shared representation, in exchange for both faster processing (no
per-element type check needed) and stronger guarantees about what
operations are even valid on it. This isn't a hard, named
design-pattern-level concept the way something like the Observer
pattern is, so it doesn't need a long list of unrelated recurrences —
but it's worth noting it's the same underlying idea behind a
statically-typed array in C, a column in a SQL table, and a tensor in
any deep learning framework: pick one type, commit the whole
container to it, and every operation on that container gets simpler
and faster because of that commitment.

### SE Lens

The alternative NumPy did *not* choose is what Python's own `list`
already does: stay fully dynamic, letting each element be any type at
all, checked individually every time it's touched. That flexibility is
genuinely useful for general-purpose programming — a `list` can hold
mixed data, grow and shrink cheaply, and never rejects an element for
being the "wrong type." NumPy trades that flexibility away on purpose:
an `ndarray` decides its element type once, at construction, and every
element after that must fit it. The cost this project is now carrying,
starting from this very line, is real: if `sizes_sqft` later gained a
non-numeric entry, `np.array(...)` wouldn't fail loudly at that point
— it would silently pick a type that *can* represent everything
handed to it (as later lessons on mixed data will show), which can
hide a data-entry mistake instead of raising it immediately. That
trade — losing per-element flexibility in exchange for uniform, fast
processing — is exactly why this container exists as something
separate from `list` rather than as an improvement bolted onto it.

### Commands Needed

If `import numpy as np` raises `ModuleNotFoundError: No module named
'numpy'`, NumPy isn't installed yet. Install it with:

```
pip install numpy
```

`pip` is Python's own package installer; this command downloads the
NumPy package from the Python Package Index and makes it importable in
your environment. Success looks like a `Successfully installed numpy-<version>`
line with no red error text above it.

### Run It

Already run and shown above, under Isolated Example — `np.array([1.72,
1.65, 1.80, 1.58])` really does return `array([1.72, 1.65, 1.8 ,
1.58])`, and `type(...)` on that result really does report
`<class 'numpy.ndarray'>`. The New Code block itself (`sizes_sqft` and
`sizes_array` in `datatools.py`) produces no visible output yet — it
only builds the array and stores it in a variable — so there's nothing
further to run until the next Concept Unit reads that variable back.

### Connection

This unit converted one plain Python `list` into one NumPy `ndarray`
and stored it in `sizes_array` — the next unit opens that same array
back up to see exactly what committing to a single type actually
bought.

---

## Concept Unit: Inspecting an Array's Shape and Storage Type

### The Problem

`sizes_array`, from the previous unit, now exists — but nothing has
actually looked inside it yet. Before doing arithmetic on an array, two
questions matter: how much data is actually in it, arranged how, and
what type did NumPy decide to store it as? Getting either one wrong —
assuming four numbers when there are really eight, or assuming whole
numbers when NumPy silently chose floats — is exactly the kind of
mistake that produces confusing errors several steps later, far from
where the real problem was introduced.

Given what you already know about Python objects having attributes
(like a `list`'s own methods, or an object's fields) — if an `ndarray`
kept track of its own size and type as it was built, what would you
guess the *names* of those two pieces of information might be, without
being told? And if you only had `print(sizes_array)`'s own visual
output to look at, could you actually tell, just by eye, whether it
holds whole numbers or floats — or would you need something more
precise than "look at it"?

### Isolated Example

```python
>>> import numpy as np
>>> sample = np.array([10, 20, 30])
>>> sample.shape
(3,)
>>> sample.dtype
dtype('int64')
```

Run for real, this session:

```
>>> import numpy as np
>>> sample = np.array([10, 20, 30])
>>> sample.shape
(3,)
>>> sample.dtype
dtype('int64')
```

This proves `.shape` and `.dtype` are **attributes** — read with no
parentheses, unlike a method call — and that NumPy, given three plain
Python integers, chose to store them as `int64` (a 64-bit integer
type) entirely on its own, with no instruction from the caller. This
throwaway `sample` array is discarded now; it exists only to isolate
what `.shape` and `.dtype` report, and it will not appear in
`datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing the same file this lesson started.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended directly after the `sizes_array = np.array(sizes_sqft)`
  line added in the previous Concept Unit.
- **Dependencies:** the `sizes_array` variable from the previous unit;
  nothing new beyond that.

### The New Code

```python
print(sizes_array.shape)
print(sizes_array.dtype)
```

### The Updated Project

`datatools.py` now reads, in full:

```
1  import numpy as np
2
3  sizes_sqft = [1400, 1850, 900, 2200]
4  sizes_array = np.array(sizes_sqft)
5
6  print(sizes_array.shape)   # ← new
7  print(sizes_array.dtype)   # ← new
```

As a whole, the file now does one thing more than before: after
building `sizes_array`, it reports back exactly how many numbers it
holds and what type they're stored as, instead of leaving that
information invisible inside the variable.

### Mechanical Walkthrough

- **`sizes_array.shape`** — the attribute access explained in full
  under Objects and methods, above: a stored field on the `ndarray`
  instance `sizes_array`, holding a `tuple` of its dimensions. There
  are four elements in `sizes_sqft`, so this array is one-dimensional
  with four elements, and `.shape` reports that as the one-element
  tuple `(4,)` — the trailing comma is Python's own syntax for "a
  tuple with exactly one item," not a typo; `(4)` alone would just be
  the integer `4` in parentheses, not a tuple at all.
- **`sizes_array.dtype`** — the attribute access explained in full
  under Objects and methods, above: a stored field naming the single
  type every element in `sizes_array` is stored as. Every value in
  `sizes_sqft` — `1400`, `1850`, `900`, `2200` — is a plain Python
  `int` literal, so NumPy stores the whole array as `int64` (a 64-bit
  integer type), reported here as `dtype('int64')`.
- **`print(...)`** — an already-familiar Python built-in function,
  still given its own real sentence per the Repetition Rule: it
  converts its argument to text and writes that text to the terminal,
  which is the only reason either `.shape` or `.dtype` becomes
  visible at all — without it, both attributes would be computed and
  immediately discarded, exactly as `sizes_array` itself was in the
  previous unit before anything read it back.

### CS Lens

Reading a container's own size and element type back from itself,
rather than trusting whatever the caller assumed going in, is a form
of **runtime introspection** — a program examining its own data's
structure while it runs, instead of relying on a comment or a
programmer's memory to describe it. The same idea recurs in a
database's `DESCRIBE TABLE` command, a compiler's own type-checker
reading a variable's inferred type, and a debugger's "inspect
variable" panel — in every case, the point is the same: don't guess
what a piece of data looks like; ask it, and trust the answer over
your own assumption.

### SE Lens

The alternative here isn't really a competing design — it's *not
checking at all*, and trusting instead that `sizes_sqft` obviously
contained four whole numbers because you just wrote it two lines
above. That's fine for a four-element list you just typed by hand; it
stops being fine the moment `sizes_array` is built from a file with
thousands of rows, or from user input, where "obviously" stops being
true. The real cost of skipping this step isn't paid now — it's paid
later, as a confusing shape-mismatch error three functions away from
wherever the actual bad data came in, with no easy way to trace it
back. Printing `.shape` and `.dtype` immediately after building an
array costs two lines and pays for itself the first time a real
dataset doesn't look the way you assumed.

### Commands Needed

None new — this unit only extends the file from the previous unit; run
it the same way, described in the next section.

### Run It

Run for real, this session, as the full current `datatools.py`:

```
$ python3 datatools.py
(4,)
int64
```

This confirms `sizes_array` really is one-dimensional with four
elements, and NumPy really did choose `int64` for it — because every
value in the original `sizes_sqft` list was a whole number.

### Connection

This unit opened up the array the previous unit built and confirmed,
concretely, what committing to one type actually produced here: four
elements, stored as `int64`. The next unit uses that same committed
type to do something a plain Python `list` structurally can't: apply
one arithmetic expression to every element at once.

---

## Concept Unit: Vectorized Arithmetic

### The Problem

`sizes_array` currently holds house sizes in square feet, but the rest
of this curriculum — and the housing dataset the Hands-On Machine
Learning book itself eventually works with — will need square meters.
Converting a single number is one multiplication: `1400 * 0.092903`.
Converting *every* number in a `list` the way you already know how,
using only previously-taught tools, means writing a `for` loop that
visits each element, multiplies it, and collects the results into a
new list one at a time.

Before reading on: using only `for` loops and `list`, which you
already know, sketch — in your head or on paper — the loop you'd write
to convert `sizes_sqft` (the plain Python list, not the array) to
square meters. Now look at `sizes_array` — it's already storing four
uniformly-typed numbers, confirmed by the previous unit's `.shape` and
`.dtype`. Given that every element is guaranteed to be the same type,
is there any reason NumPy would need you to visit each one by hand the
way a `list` loop does — or does that guarantee suggest the whole
operation could be described in one shot instead?

### Isolated Example

```python
>>> import numpy as np
>>> np.array([10, 20, 30]) * 2
array([20, 40, 60])
```

Run for real, this session:

```
>>> import numpy as np
>>> np.array([10, 20, 30]) * 2
array([20, 40, 60])
```

Contrast this with what the same `*` operator does to a plain Python
`list`, run for real, this session:

```
>>> [10, 20, 30] * 2
[10, 20, 30, 10, 20, 30]
```

This proves the `*` operator does not mean the same thing for both
types: on a `list`, `*` means *repeat the whole sequence* that many
times; on an `ndarray`, `*` means *multiply every individual element*
by that number and return a new array of the same shape. This is
called **vectorized arithmetic** — an operator applied to an entire
array at once, element by element, with the looping done inside
NumPy's own compiled code rather than a Python `for` loop you write
yourself. The `sample` array from this isolated example is discarded
now; it exists only to contrast `*` on a `list` against `*` on an
`ndarray`, and it will not appear in `datatools.py`.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, continuing `datatools.py`.
- **Files affected:** `datatools.py` — modified.
- **Change type:** add.
- **Location:** appended directly after the two `print(...)` lines
  added in the previous Concept Unit.
- **Dependencies:** the `sizes_array` variable, built two units ago;
  nothing new beyond that.

### The New Code

```python
SQFT_TO_SQM = 0.092903
sizes_sqm = sizes_array * SQFT_TO_SQM
```

### The Updated Project

`datatools.py` now reads, in full:

```
1  import numpy as np
2
3  sizes_sqft = [1400, 1850, 900, 2200]
4  sizes_array = np.array(sizes_sqft)
5
6  print(sizes_array.shape)
7  print(sizes_array.dtype)
8
9  SQFT_TO_SQM = 0.092903        # ← new
10 sizes_sqm = sizes_array * SQFT_TO_SQM   # ← new
```

As a whole, the file now does one thing more than before: after
building and inspecting `sizes_array`, it converts every one of its
four values from square feet to square meters in a single expression,
with no explicit loop anywhere in this file.

### Mechanical Walkthrough

- **`SQFT_TO_SQM = 0.092903`** — already-familiar Python syntax: a
  float literal assigned to a variable, still given its own real
  sentence per the Repetition Rule. Writing the constant in
  `ALL_CAPS` is a Python-wide naming convention signaling "this value
  is not meant to change while the program runs" — Python itself does
  not enforce that; nothing prevents reassigning it, but the name
  alone communicates intent to any later reader.
- **`sizes_array * SQFT_TO_SQM`** — the `*` operator, explained above
  under vectorization, applied here between an `ndarray`
  (`sizes_array`, shape `(4,)`) and a single Python float. NumPy
  applies `SQFT_TO_SQM` to every one of the four elements
  independently — `1400 * 0.092903`, `1850 * 0.092903`, and so on —
  and collects the four results into a brand-new `ndarray` of the same
  shape, `(4,)`; the original `sizes_array` is left unchanged, since
  `*` here builds a new array rather than modifying the existing one
  in place.
- **`sizes_sqm = ...`** — assignment, already-familiar syntax, binding
  the name `sizes_sqm` to that newly built array of converted values.

### Execution Trace

There's no loop or recursion in this unit's own code — the whole point
of vectorization is that no Python-level loop is written at all — so
a step-by-step iteration trace doesn't apply here. What *is* worth
tracing explicitly is what the single expression `sizes_array *
SQFT_TO_SQM` actually computes, element by element, since NumPy
performs this internally rather than showing it:

1. `sizes_array[0] * SQFT_TO_SQM` — `1400 * 0.092903` — because
   `1400` is the first element of `sizes_array`, at position `0`.
2. `sizes_array[1] * SQFT_TO_SQM` — `1850 * 0.092903` — the second
   element, at position `1`.
3. `sizes_array[2] * SQFT_TO_SQM` — `900 * 0.092903` — the third
   element, at position `2`.
4. `sizes_array[3] * SQFT_TO_SQM` — `2200 * 0.092903` — the fourth
   element, at position `3`.

Each of these four multiplications happens independently — none of
them depends on any of the others' results — which is exactly what
makes it safe for NumPy to perform them in whatever order or grouping
its internal, compiled implementation finds fastest, rather than
strictly left-to-right the way a Python `for` loop would be forced to.

### CS Lens

This is the concrete payoff of the type-homogeneity idea from the
first Concept Unit: because every element of `sizes_array` is
guaranteed to be the same type, NumPy's own internal, compiled code can
apply one operation to all of them without checking each element's
type individually first — the check happened once, at construction,
instead of once per element per operation. This same idea —
**vectorization**, applying one operation across a whole collection at
once instead of visiting each element under interpreter control — is
also recognized in spreadsheet formulas applied down an entire column
at once, SIMD instructions in a CPU that perform one arithmetic
operation on several numbers in a single instruction cycle, and
database query engines that apply a `WHERE` filter to every row of a
table in one pass rather than a row-by-row scripted loop.

### SE Lens

The alternative not chosen here is the `for` loop you were asked to
sketch in "The Problem," above — visiting `sizes_sqft` one element at
a time, multiplying, and appending each result to a new list. That
loop is not wrong, and it would produce the same numbers. What it
costs, compared to `sizes_array * SQFT_TO_SQM`, is twofold: it's
slower at real scale, because each iteration pays Python's own
interpreter overhead that a single vectorized call pays only once for
the whole array; and it's more code to read, write, and get wrong — an
off-by-one in a hand-written loop's range, or a typo in the
accumulator variable, are both mistakes a one-line vectorized
expression has no room to make. The real tradeoff being accepted is
that vectorized code can only do what NumPy's own built-in operations
support — the moment a conversion needs genuinely per-element, branchy
logic that doesn't fit that mold, a real Python loop (or NumPy's own
more advanced tools, in a later lesson) becomes necessary again.

### Commands Needed

None new — run the file the same way as the previous unit.

### Run It

Run for real, this session, as the full current `datatools.py`, with a
`print(sizes_sqm)` line added temporarily to confirm the result (not
kept in the file, since nothing in this unit's own New Code prints
it):

```
$ python3 -c "
import numpy as np
sizes_sqft = [1400, 1850, 900, 2200]
sizes_array = np.array(sizes_sqft)
SQFT_TO_SQM = 0.092903
sizes_sqm = sizes_array * SQFT_TO_SQM
print(sizes_sqm)
"
```

confirms the shape of the output is four floats, one per original
element, each equal to the corresponding square-foot value times
`0.092903` — exactly the four products traced above, collected into a
new `ndarray`.

### Connection

This unit converted all four of `sizes_array`'s values from square
feet to square meters in one expression — no loop, no per-element code
of your own — which is possible only because the first unit committed
the whole array to a single, uniform type, and the second unit
confirmed that commitment before trusting it.

---

## Connect the Pieces

Follow one concrete value, `1400`, through everything this lesson
built, start to finish:

1. It starts as the first entry in the plain Python `list`
   `sizes_sqft = [1400, 1850, 900, 2200]` — at this point, Python has
   made no commitment about what type the *other* three entries are;
   `1400` is just one `int` sitting in a general-purpose sequence.
2. `np.array(sizes_sqft)` reads the whole list, decides every element
   fits as `int64`, and copies `1400` into a new, contiguous,
   single-type block of memory — the `ndarray` bound to `sizes_array`.
   `1400` is now element `0` of an array with `.shape` equal to `(4,)`
   and `.dtype` equal to `int64`, both confirmed for real by printing
   them.
3. `sizes_array * SQFT_TO_SQM` reaches `1400` as `sizes_array[0]`,
   multiplies it by `0.092903`, and places the result — roughly
   `130.06` — into position `0` of the brand-new array `sizes_sqm`,
   alongside the same operation independently applied to the other
   three original values.

`1400` never passed through a single line of Python `for`-loop code
you wrote yourself, anywhere in this lesson — every step that touched
it was either a one-time construction (`np.array`) or a single
vectorized expression (`*`) covering all four values, including it, at
once.
