# Lesson 6: Generators — Writing the Iterator Protocol Without Writing It

**What you will build.** You'll write a function containing the `yield`
keyword and prove, by interleaving `print()` calls with calls to
`next()`, that its body doesn't run top-to-bottom the way an ordinary
function's does — it runs *up to* each `yield`, pauses there, and
resumes exactly where it left off the next time something asks it for
a value. You'll confirm this object is, itself, a real iterator — the
identical protocol Lesson 5 built by hand — without a single
`__iter__` or `__next__` written anywhere in sight. Then you'll compare
a list comprehension against its lazy cousin, the generator
expression, and watch the exact moment computation actually happens
shift from "immediately" to "only when consumed." Finally, you'll add
a `pending()` method to the project's `TaskList`, using `yield` to
filter tasks on demand rather than building a whole new list up front.
The transferable problem: "lazy evaluation" and "generators" show up
under different names in nearly every language you'll touch next — C#'s
`yield return` and `IEnumerable<T>`, JavaScript's generator functions
and `function*`, Rust's iterator adaptors, LINQ's deferred execution.
Every one of them is solving the identical problem this lesson solves:
producing a sequence of values without building the whole sequence in
memory first. Once you've watched Python pause and resume a function
body by hand, mid-execution, those other languages' versions of the
same idea won't need re-deriving — you'll already know exactly what
question they're answering.

**What you need to know first.** Lesson 5's iterator protocol in full —
`__iter__`, `__next__`, and `StopIteration` — because this lesson's
central claim is that a generator *is* an object implementing that
exact protocol, just without you writing the two methods yourself; that
claim is meaningless to someone who hasn't already built `CountUpTo` by
hand and seen precisely what those two methods have to do. Lesson 5's
proof that an iterator can be exhausted, and that `TaskList` was
deliberately built to avoid that by delegating to a fresh `iter()` call
each time — this lesson's own generator-based `pending()` method
depends on understanding exactly why a *fresh* generator, produced by
calling the generator function again, is what avoids exhaustion here
too.

**Terms used in this lesson**

- **Generator function** — an ordinary-looking function definition
  that contains at least one `yield` statement anywhere in its body.
  This term exists because the mere presence of `yield` fundamentally
  changes what calling this function does — a fact this lesson's first
  unit proves directly — and "generator function" is the name for a
  function definition with that specific property, as distinct from an
  ordinary function.
- **`yield`** — a statement (used as `yield <expression>`), valid only
  inside a generator function, that produces a value to whatever is
  consuming the generator and *pauses* the function's execution at
  exactly that point, preserving every local variable's current value,
  until something asks for the next value. This term exists to name
  the single piece of syntax this entire lesson is built around — the
  one thing an ordinary function can't do and a generator function can.
- **Generator object** — the object a generator function returns the
  moment it's called, before any of its body has actually run. This
  term exists because this lesson's first unit proves directly that
  calling a generator function does not execute its body — it
  constructs and returns this object instead, and *that* object is what
  actually implements the iterator protocol.
- **Lazy evaluation** — computing a value only at the exact moment it's
  actually needed, rather than in advance. This term exists as the
  general name for the property this lesson's second unit demonstrates
  by direct contrast: a list comprehension computes every element
  immediately; a generator expression computes each element only when
  something asks for it.
- **Generator expression** — syntax resembling a list comprehension
  (`(expr for item in iterable)`, using parentheses instead of square
  brackets) that produces a generator object directly, with no `def` or
  `yield` written anywhere. This term exists because it's a second,
  syntactically distinct way to get a generator object — this lesson's
  second unit proves it behaves identically, in terms of laziness, to a
  generator function's `yield`, despite looking completely different on
  the page.
- **Suspended execution / resumption** — the specific runtime behavior
  a generator object exhibits: a function body genuinely paused
  mid-statement, with its entire local state intact, capable of
  continuing from that exact point later. This term exists because it's
  the mechanism, not just the observed effect, that this lesson's first
  unit's interleaved `print()` output is direct proof of — this isn't
  the function being called again from the top; it's the *same* call,
  picking back up where it left off.

**Objects and methods used**

- **`next`**
  - *What it is:* The same built-in from Lesson 5, reappearing here —
    full treatment restated per the Repetition Rule.
  - *Implementation:* `next(iterator) -> object`.
  - *Its use:* This lesson's first unit needs a way to manually drive a
    generator object one step at a time, the exact tool Lesson 5
    already established for driving any iterator, in order to observe
    the pause-and-resume behavior directly between calls.
  - *Type:* A built-in free function.
  - *Responsibility:* Call the given iterator's own `__next__` and
    return (or propagate the exhaustion signal from) whatever that
    produces.
  - *Depends on:* A single argument — any object implementing
    `__next__`; here, always a generator object.
  - *Connects to:* Called directly by this lesson's first lab; for a
    generator object specifically, this call is what actually resumes
    the paused function body up to its next `yield` (or to the body's
    natural end, which raises `StopIteration` exactly the way a
    hand-written `__next__` would); returns whatever the `yield`
    expression's value was, or lets `StopIteration` propagate.
  - *Shape:* Whatever the generator's own `yield` expressions produce —
    for this lesson's `count_up_to`, always a plain `int`.

- **`iter`**
  - *What it is:* The same built-in from Lesson 5, reappearing here —
    full treatment restated per the Repetition Rule.
  - *Implementation:* `iter(iterable) -> iterator`.
  - *Its use:* This lesson's first unit calls `iter()` on a generator
    object specifically, to directly confirm it satisfies the iterable
    half of the protocol too — not just the iterator half — the same
    `is`-based check Lesson 5 used for `CountUpTo`.
  - *Type:* A built-in free function.
  - *Responsibility:* Call the given object's own `__iter__` and return
    whatever that produces.
  - *Depends on:* A single argument — any object implementing
    `__iter__`; here, a generator object.
  - *Connects to:* Called directly in this lesson's first lab; for a
    generator object, its own `__iter__` — provided automatically by
    Python, with no code of yours defining it — simply returns the
    generator itself, exactly like `CountUpTo.__iter__`'s hand-written
    `return self` in Lesson 5.
  - *Shape:* For a generator object specifically, the exact same object
    `iter()` was called on.

- **`StopIteration`**
  - *What it is:* The same built-in exception class from Lesson 5,
    reappearing here — full treatment restated per the Repetition Rule.
  - *Implementation:* `StopIteration()`.
  - *Its use:* This lesson's first unit proves this exact exception is
    what a generator object raises once its body runs to completion
    with no more `yield` statements left to reach — the identical
    signal Lesson 5's hand-written `CountUpTo.__next__` raised
    explicitly, now raised automatically by Python on your behalf.
  - *Type:* A built-in class.
  - *Responsibility:* Carry the "no more values" signal.
  - *Depends on:* Nothing required.
  - *Connects to:* Raised automatically by Python's own generator
    machinery when a generator function's body finishes running (falls
    off the end, or hits a `return` statement) without reaching another
    `yield`; caught by this lesson's manual `try`/`except`, exactly as
    it was in Lesson 5.
  - *Shape:* A single exception object, as in Lesson 5.

**Everything else in the file, not this lesson's subject but still explained.**

- **`type`, `is`**
  - Both fully covered in Lesson 1 (and reappearing since); used in
    this lesson's first unit exactly as already established:
    `type(gen)` reports the generator object's real class, and
    `gen is iter(gen)` checks identity the same way Lesson 5's
    `CountUpTo` check did.
- **`print`**
  - The same built-in from every previous lesson — restated per the
    Repetition Rule. Full treatment: `print(*objects, sep=' ',
    end='\n') -> None`, converting its arguments to text and writing
    them, always returning `None`. Used throughout this lesson's labs
    to make the exact ordering of execution visible.
- **`list`**
  - A built-in class, used in this lesson's second unit as
    `list(gen_exp)` — constructing a new `list` object by fully
    consuming whatever iterable it's given (calling `next()` on it
    repeatedly until `StopIteration`, exactly the mechanism Lesson 5
    established) and collecting every produced value into the new
    list. This is genuinely narrow to this lesson's own use of it —
    proving a generator expression really does hold real, deferred
    values that can still be retrieved in full — rather than a subject
    of its own.

---

## Concept Unit: A Generator Function Pauses and Resumes — It Doesn't Just Run

### The Problem

Lesson 5's `CountUpTo` needed a whole class — `__init__` to set up
`current` and `limit` as instance attributes, `__iter__` to return
`self`, and `__next__` to check the limit, increment, and either return
a value or raise `StopIteration`. That's a lot of ceremony for
something conceptually simple: "count from 1 to some limit, one value
per request." Is there a way to write that same behavior as an
ordinary-looking function, without a class at all?

> **Before reading on:** an ordinary function runs from its first line
> to its last (or to a `return`) every time it's called, with no way to
> "pause" partway through and pick back up later — every previous
> function in this curriculum has worked this way, with no exception.
> If Python offered a single new keyword that could be placed inside a
> function body to say "hand this value out right now, but don't treat
> this as the function actually finishing" — what would have to be true
> about the function's local variables at that pausing point, for a
> second call to correctly continue rather than start over? Would
> `current`, if this hypothetical function used a variable like that,
> need to reset back to its starting value on a second call, or would
> it need to remember exactly where it left off?

### Isolating the Concept

```python
def count_up_to(limit):
    print("generator function body starts running")
    current = 0
    while current < limit:
        current += 1
        print("about to yield", current)
        yield current
        print("resumed after yield", current)
    print("generator body finished")

gen = count_up_to(3)
print("gen created — nothing above this line should say 'body starts running'")
print(type(gen))
print(gen is iter(gen))
```

Real output:

```
gen created — nothing above this line should say 'body starts running'
type(gen): <class 'generator'>
gen is iter(gen): True
```

The most immediately surprising fact: calling `count_up_to(3)` printed
nothing at all — not even `"generator function body starts running"`,
the very first line of the function's own body. This is called a
**generator function** (defined in Terms, above): the presence of
`yield` (defined in Terms, above) anywhere in this function's body
means calling it does not run any of that body — it constructs and
returns a **generator object** (defined in Terms, above) instead,
bound here to `gen`. `type(gen)` confirms this object has its own real
class, `<class 'generator'>` — not `<class 'function'>`, the class
Lesson 4 already showed ordinary functions belong to; `count_up_to`
itself is still a `<class 'function'>` object, exactly as Lesson 4
proved for any `def`, but *calling* it, when it contains `yield`,
produces this different kind of object instead of running its body.
`gen is iter(gen)` confirms — using Lesson 5's exact identity check for
`CountUpTo` — that this generator object satisfies the iterable half of
the protocol automatically: `iter()` on it returns the object itself,
with no `__iter__` method written anywhere in `count_up_to`'s own code.

The second half of the lab proves the pausing behavior directly:

```python
print(next(gen))
print(next(gen))
print(next(gen))
try:
    next(gen)
except StopIteration:
    print("StopIteration raised")
```

Real output:

```
--- first next() ---
generator function body starts running
about to yield 1
got: 1
--- second next() ---
resumed after yield 1
about to yield 2
got: 2
--- third next() ---
resumed after yield 2
about to yield 3
got: 3
--- fourth next() (should exhaust it) ---
resumed after yield 3
generator body finished
StopIteration raised
```

The first `next(gen)` call is what actually starts running the
function body — `"generator function body starts running"` prints only
now, not when `count_up_to(3)` was originally called. Execution runs
the `while` loop's first pass, reaches `yield current`, and stops right
there, handing `1` back to `next()` as its return value — this is
called **suspended execution** (defined in Terms, above). Crucially,
the *second* `next(gen)` call doesn't start the function over: it
resumes execution from the exact statement immediately after `yield
current` — proven directly by `"resumed after yield 1"` printing first,
before the loop even re-checks its condition — with `current` still
correctly holding `1`, exactly where it was left. This repeats through
the third `yield`, and the fourth `next()` call resumes one final time,
finds the `while` loop's condition now false (`current`, at `3`, is no
longer less than `limit`, `3`), falls through to `print("generator
body finished")`, and the function reaches its natural end — which
raises `StopIteration` automatically, with no `raise` statement written
anywhere in this function's own code, unlike Lesson 5's hand-written
`CountUpTo.__next__`.

### Discarding the Example

This throwaway `count_up_to` generator function and its driving script
are deleted now and won't appear in later lessons or project code. It
existed only to isolate, in the smallest possible form, exactly what
`yield` does to a function's execution and what kind of object calling
such a function actually produces.

### Project Change

No project change in this unit — this unit establishes what a
generator function *is*, in isolation; the project application, using
this exact mechanism, arrives in this lesson's third unit.

### Mechanical Walkthrough

- `def count_up_to(limit):` — a function definition statement (Lesson
  2, restated per the Repetition Rule); the presence of `yield`
  anywhere in this body, per this unit's own finding, is what makes
  this specific `def` a **generator function** rather than an ordinary
  one — nothing about the `def` line itself looks any different.
- `print("generator function body starts running")` — the `print`
  built-in (full treatment above), the first statement of the
  function's body; per this unit's own proof, this line does not
  execute when `count_up_to(3)` is called — only once the first
  `next()` call is made against the resulting generator object.
- `current = 0` — an assignment statement (Lesson 1), initializing a
  local variable — one that, per this unit's own finding, does *not*
  get reset between `next()` calls the way an ordinary function's local
  variables would be reset between separate calls, because this is all
  one paused-and-resumed call, not several separate ones.
- `while current < limit:` — a `while` statement (Lesson 5's
  walkthrough covered this in full, restated per the Repetition Rule),
  repeatedly executing its indented block for as long as `current` is
  less than `limit`.
- `current += 1` — an augmented assignment (Lesson 3, restated per the
  Repetition Rule), rebinding `current` to one more than its current
  value.
- `print("about to yield", current)` — `print`, given two arguments,
  writing a label and `current`'s value before the pause point below.
- `yield current` — the crux of this entire lesson: the `yield`
  statement (defined in Terms, above), producing whatever object
  `current` is currently bound to as the value this call to `next()`
  returns, and pausing execution at exactly this line — the next
  statement below does not run until a subsequent `next()` call
  explicitly resumes it.
- `print("resumed after yield", current)` — runs only once execution
  resumes past the `yield` above, on a *later* `next()` call, not the
  one that produced the value just before it; `current` is still bound
  to the same object it was at the moment of the pause, proving no
  local state was lost or reset.
- `print("generator body finished")` — runs once the `while` loop's
  condition finally evaluates to `False`, after the function's last
  resumption; this is the last line of the function's body, and
  reaching it (with no further `yield` and no explicit `return`) is
  what triggers `StopIteration` automatically.
- `gen = count_up_to(3)` — a function call, but, per this unit's own
  finding, one that constructs and returns a generator object rather
  than running any of `count_up_to`'s body; `gen` is bound to that
  object.
- `type(gen)`, `print(type(gen))` — the `type` built-in (Lesson 1,
  restated per the Repetition Rule), reporting `gen`'s real class.
- `iter(gen)` — the `iter` built-in (full treatment above), calling
  `gen`'s automatically-provided `__iter__`, which returns `gen` itself.
- `gen is iter(gen)`, `print(...)` — the `is` operator (Lesson 1,
  restated per the Repetition Rule), confirming that identity directly.
- `next(gen)`, four separate calls — the `next` built-in (full
  treatment above), each call resuming `gen`'s paused body up to its
  next `yield`, or, on the fourth call, running to the body's natural
  end and raising `StopIteration`.
- `try:` / `except StopIteration:` — the same exception-handling
  pattern from Lesson 5 (restated per the Repetition Rule), catching
  the automatically-raised `StopIteration` on the fourth call.

### Execution Trace

A timing/control-flow trace, since the entire point of this unit is
*when* each line runs relative to the four separate `next()` calls:

1. `gen = count_up_to(3)` — no body code runs at all; a generator
   object is constructed and bound to `gen`.
2. First `next(gen)` — resumes execution from the very top of the
   body: prints `"generator function body starts running"`; `current =
   0`; enters the `while` loop (`0 < 3` is true); `current += 1` makes
   `current` `1`; prints `"about to yield 1"`; reaches `yield current`
   — pauses here, returning `1` to this `next()` call.
3. Second `next(gen)` — resumes immediately after the `yield` from step
   2: prints `"resumed after yield 1"`; loop re-checks its condition
   (`1 < 3` is true); `current += 1` makes `current` `2`; prints
   `"about to yield 2"`; reaches `yield current` again — pauses,
   returning `2`.
4. Third `next(gen)` — resumes after that `yield`: prints `"resumed
   after yield 2"`; condition (`2 < 3`) is true; `current` becomes `3`;
   prints `"about to yield 3"`; pauses at `yield current`, returning
   `3`.
5. Fourth `next(gen)` — resumes after that `yield`: prints `"resumed
   after yield 3"`; the loop's condition (`3 < 3`) is now `False`, so
   the loop ends; prints `"generator body finished"`; the function body
   has no more code to run, which automatically raises `StopIteration`
   — caught by the `except` clause, which prints `"StopIteration
   raised"`.

### CS Lens

This is a hard concept — a function whose execution can genuinely pause
mid-body and resume later with full local state intact — so, per the
Repetition Rule, several unrelated recurrences:

```
Also recognized in: coroutines generally, across many languages (a
broader category generators are a specific, restricted case of —
Python's own async/await, covered in a much later lesson in this
curriculum, is built on the identical pause-and-resume mechanism this
unit just demonstrated by hand), C#'s `yield return` (producing the
identical suspend-and-resume behavior inside an `IEnumerable<T>`-
returning method, with near-identical syntax), JavaScript generator
functions (`function*`/`yield`, the same mechanism under nearly
identical naming), and operating-system process/thread context
switching (an OS genuinely suspends a running process's execution
state — registers, stack, program counter — and resumes it later
exactly where it left off, the same fundamental "pause with full state
preserved" idea, at a much lower level of the system)
```

### SE Lens

The alternative — writing `count_up_to`'s behavior the way Lesson 5's
`CountUpTo` was written, as an explicit class with `__init__`,
`__iter__`, and a hand-written `__next__` tracking its own position in
instance attributes — was rejected here in favor of `yield`
specifically because the generator version needs no instance attributes
at all: `current` is an ordinary local variable, and the pause/resume
mechanism itself is what preserves it across calls, rather than you
having to manually store and re-read it as `self.current` on every
single call. The real cost: a generator function's pause point is
invisible from outside it — nothing about calling `next(gen)` shows you,
without reading `count_up_to`'s own source, whether it's about to run a
huge amount of work before its next `yield`, or run for so long it
appears to hang; a generator, unlike an ordinary function returning all
at once, can have meaningfully different performance characteristics
call to call, entirely hidden behind a uniform `next()` interface.

### Commands Needed

Run the same way as every previous lesson: `python3 lab1.py`. Nothing
new.

### Run It

Already shown and verified above, under "Isolating the Concept" and
"Execution Trace."

### Connection

This unit proved a generator function is real, lazy, pausable code —
but its values, in `count_up_to`, still came from an explicit `def`
with a `while` loop inside it. The next unit asks whether this same
laziness can be expressed even more compactly, using syntax that looks
like something this curriculum has already used casually — a
comprehension.

---

## Concept Unit: Generator Expressions — The Same Laziness, Comprehension Syntax

### The Problem

A list comprehension — `[expr for item in iterable]` — builds a
complete list immediately, computing every element up front, whether or
not anything ever actually needs all of them. The previous unit proved
a generator function can defer computation until it's actually asked
for, one value at a time. Is there a way to get that same deferred
behavior using comprehension-style syntax, without writing a full `def`
and `yield`?

> **Before reading on:** if Python offered a syntax that looked almost
> exactly like a list comprehension, but used parentheses instead of
> square brackets, what would you guess that syntax produces — a
> `tuple`, built eagerly the same way a list comprehension builds a
> list, or something else entirely, given everything the previous unit
> just proved about `yield`-based laziness? And if a function's body
> containing an expensive computation, called once per element inside
> such a comprehension, would you expect that computation to run
> immediately when the comprehension-like expression is written, or
> only later — and if "only later," what event would actually trigger
> it?

### Isolating the Concept

```python
def loud(n):
    print("computing", n)
    return n * n

list_comp = [loud(n) for n in range(3)]
print("list comprehension built:", list_comp)
```

Real output:

```
computing 0
computing 1
computing 2
list comprehension built: [0, 1, 4]
```

Exactly as expected: every `loud(n)` call runs immediately, as the list
comprehension is built, before the resulting list is even bound to
`list_comp`. Now the parenthesized version:

```python
gen_exp = (loud(n) for n in range(3))
print("gen_exp created — no 'computing' lines should appear above this")
print(type(gen_exp))

print(list(gen_exp))
```

Real output:

```
gen_exp created — no 'computing' lines should appear above this
type(gen_exp): <class 'generator'>

computing 0
computing 1
computing 2
list(gen_exp): [0, 1, 4]
```

`(loud(n) for n in range(3))` — a **generator expression** (defined in
Terms, above) — produces no `"computing"` output at all when it's
constructed. `type(gen_exp)` confirms it's the identical class the
previous unit's `yield`-based `count_up_to` produced: `<class
'generator'>` — not a new, comprehension-specific type. The three
`"computing"` lines appear only once `list(gen_exp)` actually consumes
it — `list()`, per Lesson 5's own mechanism, calls `next()` on
`gen_exp` repeatedly until `StopIteration`, and it's each of those
`next()` calls that actually causes one `loud(n)` call to run. This is
called **lazy evaluation** (defined in Terms, above): the *computation*
described by a generator expression — here, calling `loud` for each
value `range(3)` produces — doesn't happen at the moment the expression
is written; it happens exactly once per value, exactly when something
asks for the next one.

### Discarding the Example

Both throwaway scripts shown here — the list-comprehension comparison
and the `gen_exp`/`list(gen_exp)` pair — are deleted now and won't
appear in later lessons or project code. They existed only to isolate
the laziness difference between the two comprehension-style syntaxes in
the smallest possible form.

### Project Change

No project change in this unit — the project's own generator
application, in the next unit, uses a `yield`-based generator function
rather than a generator expression, since it needs a real conditional
(filtering on `task["done"]`) that a single comprehension expression
can express but that this lesson chooses to build as an explicit
function for clarity, matching `TaskList`'s existing method style.

### Mechanical Walkthrough

- `def loud(n):` — an ordinary function definition (Lesson 2), with no
  `yield` anywhere in it — a genuinely ordinary function, deliberately,
  so its `print` call makes exactly when it runs directly observable.
- `return n * n` — a `return` statement (Lesson 2) whose value is `n`
  multiplied by itself.
- `[loud(n) for n in range(3)]` — a list comprehension (new syntax to
  this curriculum, though its component parts — `for`, function calls —
  are already established; genuinely narrow to this unit's own
  contrast, not this lesson's actual subject, so given a real but brief
  explanation: for each value `range(3)` produces, in order, `n` is
  bound to it, `loud(n)` is called immediately, and its result becomes
  one element of a new list — the entire list is fully built, with
  every `loud(n)` call already having run, before the expression
  finishes evaluating).
- `range(3)` — a built-in class constructing a range object that
  produces the integers `0`, `1`, `2` in order when iterated — genuinely
  narrow to this unit's own use of it as a simple source of values, not
  a subject of its own.
- `list_comp = [...]` — an assignment statement (Lesson 1), binding
  `list_comp` to the newly-built list.
- `print("list comprehension built:", list_comp)` — `print` (full
  treatment above), given two arguments.
- `gen_exp = (loud(n) for n in range(3))` — an assignment statement
  whose right-hand side is a **generator expression** (defined in
  Terms, above): syntactically almost identical to the list
  comprehension above, but constructing a generator object instead of a
  list, and, per this unit's own finding, not running `loud(n)` for any
  value yet.
- `type(gen_exp)`, `print(type(gen_exp))` — `type` (Lesson 1, restated
  per the Repetition Rule), confirming `gen_exp`'s real class.
- `list(gen_exp)` — a call to the `list` built-in (full treatment
  above), which fully consumes `gen_exp` via repeated `next()` calls
  (Lesson 5's mechanism, restated per the Repetition Rule), collecting
  every produced value; this is the exact moment each `loud(n)` call
  actually runs.
- `print("list(gen_exp):", list(gen_exp))` — `print`, given two
  arguments, writing the label and the resulting list.

### CS Lens

This reappears the lazy-evaluation idea from this lesson's first unit,
restated in full per the Repetition Rule, now specifically contrasted
against its eager counterpart:

```
Also recognized in: LINQ's deferred execution in C# (a LINQ query built
with .Where()/.Select() computes nothing until it's actually enumerated
— the identical eager-vs-lazy distinction this unit's list-comprehension
vs. generator-expression comparison just demonstrated), Haskell's
default lazy evaluation for essentially all expressions (an entire
language built around never computing a value until it's actually
demanded), spreadsheet formula recalculation (a cell's formula is
typically evaluated only when its value is actually needed for display
or by another formula, not continuously regardless of whether anyone's
looking at it), and video streaming versus downloading a full file
(processing and displaying data as it arrives, rather than requiring
the entire dataset to be available up front — the same "produce and
consume incrementally" shape as a generator)
```

### SE Lens

The alternative — always using eager list comprehensions, even when a
result will only ever be consumed one value at a time, or when the
full set of values might never all be needed — was rejected as a
universal default because it wastes both time and memory: building a
list comprehension over a genuinely large range computes and stores
every single element before anything can use even the first one, while
the equivalent generator expression computes exactly as many elements
as actually get consumed, and never holds more than the current one in
memory at a time. The honest cost, demonstrated by this unit's own
labs: a generator expression can only be consumed once — `list(gen_exp)`,
run a second time against the same, already-exhausted `gen_exp`, would
return an empty list, the identical single-use limitation Lesson 5's
`CountUpTo` already demonstrated directly; a list comprehension's
result, by contrast, is an ordinary `list`, reusable indefinitely, per
Lesson 5's own finding about `list.__iter__` always constructing a
fresh iterator. Choosing between them is a genuine, situational
tradeoff — laziness and memory efficiency on one side, unlimited
reusability on the other — not a strictly-better-or-worse choice either
way.

### Commands Needed

Run the same way as every previous lesson: `python3 lab2.py`. Nothing
new.

### Run It

Already shown and verified above, under "Isolating the Concept."

### Connection

This unit proved generator expressions share the exact laziness
property this lesson's first unit demonstrated with `yield`, just
expressed as comprehension syntax rather than an explicit function. The
next unit applies a `yield`-based generator function directly to the
project — filtering the project's own tasks on demand, rather than
building a whole filtered list up front every time.

---

## Concept Unit: `pending()` — A Real Generator Method on `TaskList`

### The Problem

`TaskList`, as Lesson 5 left it, supports looping over every task it
holds, but has no way to loop over just the ones that still need doing
— every task dict, per Lesson 2's `create_task`, carries a `"done"`
key, currently unused for anything beyond being stored. A caller
wanting only pending tasks would currently have to write their own
filtering `if not task["done"]:` check inline, every single time, or
`TaskList` could provide a method that does this filtering itself. If
that method built and returned a whole new `list` of just the pending
tasks, it would work — but given everything this lesson has just
proven about `yield`, is there a version that doesn't require building
that intermediate list at all?

> **Before reading on:** picture writing a method on `TaskList`,
> `pending(self)`, meant to produce just the tasks where `task["done"]`
> is `False`. One version could build a new list with a list
> comprehension and `return` it. Another could use `yield` instead of
> `return`, inside an ordinary `for` loop over `self._tasks`. Given
> this lesson's first unit's own proof about what calling a generator
> function actually does — construct and return a generator object,
> running none of the body yet — what's the practical difference a
> caller of `my_tasks.pending()` would actually notice between these
> two versions, especially for a `TaskList` holding a very large number
> of tasks?

### Isolating the Concept

The mechanism this unit needs was already fully isolated in this
lesson's first unit — `yield`, inside an ordinary `for` loop, producing
one value per matching item rather than accumulating them into a
returned list. No further throwaway lab is needed before applying it
directly, the same way this lesson's second unit's own realization
required no separate isolation step, either.

### Discarding the Example

Not applicable — see above: this unit builds directly on the previous
units' already-isolated mechanism, with no new throwaway script of its
own to discard.

### Project Change

- **Reference Source:** No reference counterpart — original to this
  project, same as every previous unit in this curriculum.
- **Files affected:** `project/tasks.py` (modified), `project/main.py`
  (modified).
- **Change type:** Add — a new `pending` method on the existing
  `TaskList` class in `tasks.py`; `main.py` updated to mark one task
  done and demonstrate the new method, called twice.
- **Location:** `pending` is added directly after `TaskList.__iter__`,
  established in Lesson 5; `main.py`'s existing task-creation and
  `TaskList` setup are left unchanged, with new lines added after the
  existing two `for task in my_tasks:` loops.
- **Dependencies:** None new — `yield`, `for`, and dict subscript access
  are all already covered in this lesson and previous ones.

### The New Code

```python
    def pending(self):
        for task in self._tasks:
            if not task["done"]:
                yield task
```

### The Updated Project

```
tasks.py:
46  class TaskList:
47      def __init__(self):
48          self._tasks = []
49
50      def add(self, task: dict) -> None:
51          self._tasks.append(task)
52
53      def __iter__(self):
54          return iter(self._tasks)
55
56      def pending(self):                     # ← new
57          for task in self._tasks:           # ← new
58              if not task["done"]:           # ← new
59                  yield task                 # ← new
```

```
main.py:
 1  from tasks import create_task, create_id_generator, describe_task, TaskList
 2
 3  next_id = create_id_generator()
 4
 5  task_a = create_task(next_id(), "Write lesson 3", 1)
 6  task_b = create_task(next_id(), "Review lesson 3", 2)
 7
 8  my_tasks = TaskList()
 9  my_tasks.add(task_a)
10  my_tasks.add(task_b)
11
12  print("=== First pass ===")
13  for task in my_tasks:
14      print(describe_task(task))
15
16  print("=== Second pass (proving TaskList is reusable) ===")
17  for task in my_tasks:
18      print(describe_task(task))
19
20  task_a["done"] = True                                             # ← new
21
22  print("=== Pending tasks only, via the pending() generator ===")   # ← new
23  for task in my_tasks.pending():                                   # ← new
24      print(describe_task(task))                                    # ← new
25
26  print("=== Calling pending() a second time — a fresh generator ===")  # ← new
27  for task in my_tasks.pending():                                   # ← new
28      print(describe_task(task))                                    # ← new
```

As a whole, `TaskList` now provides two distinct ways to look at its
contents: `__iter__` (Lesson 5) for every task, unfiltered; `pending()`
(this unit) for only the ones not yet done — computed one at a time, on
demand, rather than pre-built into a separate list. `main.py`, as a
whole, now demonstrates a realistic use: marking one task done (a plain
dict-item assignment, the same mutation mechanism Lesson 1's
`list2.append(4)` relied on, applied here to a dict instead of a list),
then filtering to just the remaining pending task, twice, to prove
`pending()` doesn't carry the single-use exhaustion problem this
lesson's second unit already flagged as a real, honest cost of
generators in general.

### Mechanical Walkthrough

- `def pending(self):` — a method definition (Lesson 5's walkthrough
  covered method definitions in full, restated per the Repetition
  Rule), taking only `self`; the presence of `yield` inside this
  method's body, per this lesson's first unit, makes this a generator
  function — meaning `my_tasks.pending()`, when called, will construct
  and return a generator object rather than running this body
  immediately, exactly as `count_up_to(3)` did.
- `for task in self._tasks:` — a `for` statement (Lesson 5, restated
  per the Repetition Rule), iterating over the instance's own internal
  list of tasks — this is an ordinary, ungenerator-ed `for` loop
  *inside* a generator function's body; nothing about the loop itself
  is special, only the `yield` inside it, below.
- `if not task["done"]:` — an `if` statement (Lesson 2, restated per
  the Repetition Rule), whose condition is the `not` operator (Lesson
  2, restated per the Repetition Rule) applied to a subscript access,
  `task["done"]` (Lesson 3, restated per the Repetition Rule),
  checking whether this particular task's `"done"` key is currently
  bound to `False`.
- `yield task` — the `yield` statement (full treatment in this lesson's
  first unit, restated per the Repetition Rule), producing the current
  `task` dict as this generator's next value and pausing execution
  right here — the surrounding `for` loop, per this lesson's first
  unit's own execution-trace pattern, resumes on the next `for` loop
  over `self._tasks` when the *next* `next()` call is made against the
  generator, continuing to check subsequent tasks rather than starting
  the `for task in self._tasks:` loop over from its beginning.
- `task_a["done"] = True`, in `main.py` — an assignment statement whose
  left-hand side is a subscript access (Lesson 1's own mutability
  finding, restated per the Repetition Rule: this mutates the dict
  `task_a` is bound to, in place, exactly as `list2.append(4)` mutated
  a list in place — `task_a` is not rebound to a new dict here, its
  existing dict's `"done"` key is changed).
- `my_tasks.pending()`, first occurrence — a method call, constructing
  a fresh generator object (per this lesson's first unit's finding),
  bound to nothing explicitly here, but consumed directly by the
  surrounding `for` statement.
- `for task in my_tasks.pending():`, first occurrence — the full
  iterator-protocol mechanism from Lesson 5, driving the generator
  object `my_tasks.pending()` just constructed: `iter()` on it returns
  itself (per this lesson's first unit), and repeated `next()` calls
  resume its paused body, each pause point being the `yield task` line
  above, skipping over `task_a` (now `done`) and yielding only
  `task_b`.
- `print(describe_task(task))` — `describe_task` (Lesson 4, restated
  per the Repetition Rule), applied to whichever pending task the
  generator just yielded.
- `my_tasks.pending()`, second occurrence — a *second*, entirely
  separate call to the `pending` method, constructing a brand-new
  generator object, with no relationship to the first one, which was
  already fully exhausted (its `for task in self._tasks:` loop already
  ran to completion, per the first loop's own consumption) and simply
  discarded once the first `for task in my_tasks.pending():` loop
  ended.

### CS Lens

This reappears the generator-method idea directly, now specifically as
a real, extensible filtering mechanism rather than an isolated example:

```
Also recognized in: LINQ's Where() in C# (returning a lazily-evaluated
filtered sequence, computed element by element as it's enumerated,
exactly matching this unit's pending() in both mechanism and intent),
Python's own itertools.filterfalse and filter() built-in (the identical
"produce only matching elements, lazily" idea as a reusable, general
tool rather than a purpose-built method), database query WHERE clauses
combined with cursor-based row fetching (rows matching a filter are
produced one at a time as the cursor is read, rather than the entire
matching set being materialized before any row is available), and
reactive/stream-processing systems generally (a stream of events
filtered by a predicate, processed one event at a time as they arrive,
rather than the whole stream being collected first)
```

### SE Lens

The alternative — writing `pending` as an ordinary method returning a
fully-built list, `return [task for task in self._tasks if not
task["done"]]` — would behave identically for a small `TaskList` like
this project's own two-task example, and was rejected here specifically
because it doesn't scale the same way: for a `TaskList` holding a very
large number of tasks, the list-returning version builds and holds the
*entire* filtered result in memory before a caller can even look at the
first one, while `pending()`'s generator version produces exactly one
task at a time, using only as much memory as a single task dict, no
matter how many tasks `TaskList` ultimately holds or how many of them
are actually pending. The honest, situational cost — already fully
established by this lesson's second unit and worth restating here per
the Repetition Rule, now applied to real project code rather than an
isolated lab: `my_tasks.pending()`'s result cannot be indexed
(`my_tasks.pending()[0]` would raise an error — a generator supports
no subscript access at all), cannot report its own length without
fully consuming it, and, like every generator this lesson has built, is
single-use per call — which is exactly why `main.py`'s second
demonstration calls `pending()` again, a fresh call producing a fresh
generator, rather than attempting to loop over the same one twice.

### Commands Needed

The updated project runs and checks the same way every previous
lesson's project code has: `python3 main.py`, `mypy main.py`.

### Run It

The real, updated project's full output:

```
=== First pass ===
[!!!] Write lesson 3 (id=1) — CRITICAL
[!] Review lesson 3 (id=2) — high priority
=== Second pass (proving TaskList is reusable) ===
[!!!] Write lesson 3 (id=1) — CRITICAL
[!] Review lesson 3 (id=2) — high priority
=== Pending tasks only, via the pending() generator ===
[!] Review lesson 3 (id=2) — high priority
=== Calling pending() a second time — a fresh generator ===
[!] Review lesson 3 (id=2) — high priority
```

Both `pending()` passes correctly show only `task_b` — `task_a`, marked
done just before, is correctly excluded from both. `mypy main.py`
reports:

```
Success: no issues found in 1 source file
```

(`pending` currently carries no explicit return-type hint — Lesson 2's
own finding that hints are optional metadata applies here directly:
`mypy` type-checks this method correctly anyway, by inferring its
return type from the `yield` statement inside it; a precise hint for a
generator's return type does exist — `Iterator[dict]`, from the
`typing` module — but is left out here deliberately, as unnecessary
complexity this project doesn't yet need.)

### Connection

This unit is where every rule this lesson established became a real,
working feature: the first unit's proof that a generator function
constructs a paused, resumable object rather than running immediately
is exactly why `my_tasks.pending()` can be called and looped over
without ever building an intermediate filtered list; the second unit's
proof that this same laziness applies whether the syntax is `yield` or
a generator expression is why `pending`'s explicit `yield`-in-a-`for`-
loop style was a deliberate, readable choice here rather than the only
option; and the honest single-use cost both earlier units already
demonstrated directly is exactly why `main.py` calls `pending()` twice,
fresh each time, rather than trying to reuse one generator object
across two separate loops.

---

## Connect the Pieces

Trace one task through everything this lesson built: `task_a`, marked
`done` in `main.py`, then `my_tasks.pending()` called. Per this
lesson's first unit, that call constructs a generator object
immediately — running none of `pending`'s body yet, exactly as
`count_up_to(3)` produced no output before its first `next()`. The
surrounding `for task in my_tasks.pending():` then drives it, per
Lesson 5's iterator protocol: `iter()` on the generator returns itself
(this lesson's first unit's own proof, automatic, with no `__iter__`
written in `pending` at all), and each `next()` call resumes
`pending`'s paused `for task in self._tasks:` loop from exactly where
it left off. The very first task checked is `task_a` — `not
task["done"]` is `False`, since it was just marked done, so `yield
task` is never reached for it, and the loop's next pass begins,
resuming the *outer* `for` loop over `self._tasks`, not `pending`
itself starting over. `task_b`, checked next, passes the `if not
task["done"]:` check, and `yield task` finally pauses execution,
handing `task_b` back to the consuming loop in `main.py`, which prints
its description. A second, completely independent call to
`my_tasks.pending()`, later in `main.py`, repeats this entire sequence
from a fresh generator object — proving, in the real project rather
than an isolated lab, exactly what this lesson's second unit's SE Lens
already named as the honest tradeoff every generator in this lesson
has carried: real laziness, real memory efficiency, and real,
by-design single-use behavior, worked around here not by fighting it
but by simply calling the generator function again.
