# Lesson 5: The Iterator Protocol — What `for` Actually Does

**What you will build.** You'll take a `for` loop apart by hand — using
`iter()`, `next()`, and a `while` loop to reproduce, statement by
statement, exactly what `for x in numbers:` does automatically — and
prove, with real output, that they're not just similar, they're the
identical sequence of operations. You'll then build a small custom
class implementing this same mechanism from scratch, discover directly
that a used-up iterator stays used up, and finally give the project's
own task collection this exact capability: a real `TaskList` class you
can write `for task in my_tasks:` over, built on the same protocol a
plain `list` uses internally. The transferable problem: almost every
language with a `for-each`-style loop — C#'s `foreach` and
`IEnumerable`, Java's enhanced `for` and `Iterable`, JavaScript's
`for...of` and the iterable protocol — has a real mechanism underneath
that "just works" syntax, and that mechanism is almost always shaped
exactly like the one this lesson builds by hand: something that can
produce a next value on demand, and a well-defined signal for "there
isn't one." Once you've built Python's version yourself, from raw
parts, a C# `IEnumerator<T>` interface won't read as a new thing to
learn — it'll read as a name for something you've already built.

**What you need to know first.** Lesson 4's proof that a class is
itself an object, an instance of `type`, and that calling a class
(`Point()`) constructs an instance of it — this lesson builds two real
classes and needs that foundation to make sense of what `class`,
`__init__`, and `self` are actually doing, rather than treating them as
unexplained ceremony. Lesson 1's object model — specifically identity
via `is` — because this lesson's central, most counter-intuitive fact
(an iterator, once exhausted, stays exhausted, even reused in a second
loop) is proven by checking whether two things are the *same object*,
exactly the tool Lesson 1 built.

**Terms used in this lesson**

- **Iterable** — an object that knows how to produce an iterator (below)
  when asked — specifically, any object with an `__iter__` method
  (defined below) that returns one. This term exists because it names
  the *broader* of this lesson's two central categories: a `list`, a
  `dict`, a `str`, and this lesson's own `TaskList` are all iterables,
  but, as this lesson's second unit proves directly, being iterable
  does not automatically mean being an iterator too.
- **Iterator** — an object that produces values one at a time, on
  demand, via a `__next__` method (defined below), and signals when
  it's exhausted by raising `StopIteration` (defined below) rather than
  returning a value. This term exists to name the *narrower*, stateful
  category this lesson's central mechanism actually operates on — an
  iterator, unlike an iterable in general, has to remember where it
  currently is, which is exactly why (as this lesson's second unit
  proves) an iterator can be used up.
- **The iterator protocol** — the two-method contract (`__iter__` and
  `__next__`) that makes an object work correctly with `for`, `next()`,
  and anything else in Python that consumes values one at a time. This
  term exists because it's the actual name for the mechanism this whole
  lesson reverse-engineers — not a Python-specific curiosity, but a
  formal, documented contract any object can choose to implement.
- **`__iter__`** — a method every iterable must define, taking no
  arguments beyond `self` (defined below) and returning an iterator.
  This term exists as the first half of the iterator protocol: it's the
  method Python calls, automatically, the moment a `for` loop (or the
  built-in `iter()` function) needs to start consuming an object.
- **`__next__`** — a method every iterator must define, taking no
  arguments beyond `self`, that returns the next value each time it's
  called, and raises `StopIteration` once there are no more values
  left. This term exists as the second half of the iterator protocol:
  it's the method Python calls, automatically and repeatedly, every
  time a `for` loop needs its next value.
- **`self`** — the conventional name (not a keyword — a strong
  convention every Python programmer follows) for a method's first
  parameter, automatically bound, on every call, to the specific
  instance the method was called on. This term exists because this
  lesson's classes define multiple methods that need to read and write
  that instance's own data (`self.current`, `self._tasks`), and `self`
  is the name through which every one of those methods reaches it.
- **Instance attribute** — a name bound on a specific object instance
  (via `self.name = value`, inside a method), rather than shared by
  every instance of the class. This term exists because
  `CountUpTo(3)` and a second, separate `CountUpTo(5)` each need their
  own independent `current` value — exactly the same independence
  Lesson 3's closures demonstrated for `current_id`, achieved here
  through a different mechanism (an attribute on an object, rather than
  a cell in a closure).
- **Dunder method (magic method)** — a method whose name begins and
  ends with double underscores (`__iter__`, `__next__`, and, from
  Lesson 4, `__dict__` as an attribute rather than a method), which
  Python's own built-in machinery calls automatically in specific
  situations, rather than a name you're expected to call directly
  yourself in ordinary code. This term exists because both methods this
  lesson's classes define are dunder methods, and understanding that
  `for` itself is what calls them — not this lesson's own code, mostly
  — is the actual point of the lesson's first unit.
- **`StopIteration`** — a built-in exception class, defined fully under
  Objects and methods, below, whose entire purpose is signaling
  "there are no more values" — covered here in Terms only to flag that
  its *name* is deliberately unlike other exceptions this curriculum
  has used: it's not reporting an error in the usual sense (Lesson 2's
  `TypeError` reports a real mistake); it's a normal, expected control
  signal every correctly-written iterator is expected to raise exactly
  once, at exactly the right moment.

**Objects and methods used**

- **`iter`**
  - *What it is:* A built-in function, available everywhere with no
    import.
  - *Implementation:* `iter(iterable) -> iterator`. Takes one argument
    — any iterable — and returns an iterator for it. (A second,
    two-argument form exists, using a sentinel value instead of an
    iterable, but this lesson only uses the one-argument form.)
  - *Its use:* This lesson's first unit needs a way to manually obtain
    the same iterator a `for` loop would obtain automatically, in order
    to drive it by hand — `iter()` is exactly that entry point.
  - *Type:* A built-in free function.
  - *Responsibility:* Its full charter is calling the given object's own
    `__iter__` method and returning whatever that method returns —
    nothing about actually producing values itself; that's entirely
    `__next__`'s job, on whatever object `iter()` hands back.
  - *Depends on:* A single argument — any object implementing
    `__iter__`.
  - *Connects to:* Called directly by this lesson's first two labs;
    internally calls the argument's own `__iter__` method (proven
    directly in this lesson's second unit, where a custom class's
    `__iter__` is written out by hand); returns that method's result
    straight back to the caller.
  - *Shape:* Whatever the argument's own `__iter__` returns — for a
    `list`, a `list_iterator` object; for this lesson's `CountUpTo`
    class, the exact same object `iter()` was called on, per that
    unit's own proof.

- **`next`**
  - *What it is:* A built-in function, available everywhere with no
    import.
  - *Implementation:* `next(iterator) -> object` (a second form accepts
    a default value to return instead of raising when exhausted; this
    lesson only uses the one-argument form).
  - *Its use:* This lesson's first unit needs a way to manually pull one
    value at a time out of an iterator, the exact operation a `for`
    loop performs automatically on every pass through its body.
  - *Type:* A built-in free function.
  - *Responsibility:* Its full charter is calling the given iterator's
    own `__next__` method once and returning (or, on exhaustion,
    propagating) whatever that method produces — nothing about
    catching or handling `StopIteration` itself; that's left entirely
    to the calling code, as this lesson's first unit's manual `while`
    loop demonstrates directly.
  - *Depends on:* A single argument — any object implementing
    `__next__`.
  - *Connects to:* Called directly by this lesson's manual loop and by
    the real `for` statement, automatically, on every iteration
    (Python's own `for` implementation calls this exact function
    internally — a fact this lesson's first unit exists specifically to
    make concrete); internally calls the argument's `__next__` method;
    either returns that method's result or lets a raised
    `StopIteration` propagate straight out to the caller, unmodified.
  - *Shape:* Whatever the underlying `__next__` returns — for
    `CountUpTo`, this lesson's own class, always a plain `int`.

- **`StopIteration`**
  - *What it is:* A built-in exception class.
  - *Implementation:* `StopIteration()` — constructing it (with no
    required arguments) builds an exception object signaling that an
    iterator has no more values.
  - *Its use:* This lesson's custom `CountUpTo.__next__` needs a way to
    signal "no more values" using the exact mechanism Python's own
    built-in iterators (like a list's) already use — `StopIteration` is
    that mechanism, and using anything else (returning `None`, say)
    would silently break every piece of code, `for` loops included,
    that expects this specific signal.
  - *Type:* A built-in class.
  - *Responsibility:* Carry the "no more values" signal and, once
    raised, unwind the current call — but, uniquely among the
    exceptions this curriculum has used so far, one specifically
    designed to be *caught and silently handled* as part of normal,
    correct control flow (by a `for` loop, or by this lesson's own
    manual `while`/`try`/`except`), rather than indicating something
    went wrong.
  - *Depends on:* Nothing required — this lesson constructs it with no
    arguments, `raise StopIteration`.
  - *Connects to:* Raised inside `CountUpTo.__next__` once `self.current`
    reaches `self.limit`; caught, in this lesson's manual lab, by an
    explicit `try`/`except StopIteration:`; caught, in every ordinary
    `for` loop, by machinery inside the `for` statement itself that
    this lesson's first unit's manual version makes visible.
  - *Shape:* A single exception object; this lesson never attaches a
    message to it, so `str(the_exception)` would be an empty string —
    unlike `TypeError` in Lesson 2, `StopIteration`'s job is entirely
    about *that it was raised*, not about carrying explanatory text.

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
- **`type`, `is`**
  - Both fully covered in Lesson 1 (and reappearing since); used in this
    lesson's second unit's `iter(counter) is counter` check exactly as
    already established: `is` checks identity, and this lesson's own
    finding depends on it directly.
- **`list.append`**
  - Fully covered under this name in Lesson 1's "Everything else" list;
    reused here, unchanged, inside `TaskList.add`, to grow the
    project's own internal task list the identical way Lesson 1's
    `list2.append(4)` grew a list.

---

## Concept Unit: Desugaring `for` — What It Actually Calls

### The Problem

Every previous lesson in this curriculum has used `for x in some_list:`
without ever asking what that statement actually does underneath —
Lesson 4's `for fn in greetings:` treated it as a given. But `for` works
identically well on a `list`, a `dict`, a `str`, and, as this lesson
will build directly, on a completely custom object with no relationship
to any of those built-in types. What single mechanism could possibly
make `for` work uniformly across types that share no other structure in
common at all?

> **Before reading on:** think about what a `for` loop actually needs to
> do, mechanically, regardless of what it's looping over: get some kind
> of "current position" tracker, ask it for a value, run the loop body
> with that value, ask again, and stop once there's nothing left to ask
> for. If Python's `for` statement is built around exactly that shape —
> get something, then repeatedly ask it for the next value — what two
> operations would have to exist for *any* type to support being looped
> over this way? And separately: how would the loop know when to stop —
> a special "empty" value it checks for, or something else entirely?

### Isolating the Concept

```python
numbers = [10, 20, 30]

for n in numbers:
    print(n)
```

Real output:

```
10
20
30
```

Nothing surprising yet — but here is the exact same behavior, written
out by hand, using no `for` statement at all:

```python
it = iter(numbers)
print(type(it))
while True:
    try:
        n = next(it)
    except StopIteration:
        print("StopIteration raised — loop ends")
        break
    print(n)
```

Real output:

```
type(it): <class 'list_iterator'>
10
20
30
StopIteration raised — loop ends
```

Identical values, in identical order. This is not a coincidence or an
independently-equivalent alternative — it is, precisely, what `for x in
numbers:` does, every single time it runs, for any iterable at all:
call `iter()` on the thing being looped over exactly once, at the very
start, to get an **iterator** (defined in Terms, above); then call
`next()` on that iterator repeatedly, once per pass through the loop
body, binding the loop variable to whatever it returns; and stop the
moment `next()` raises `StopIteration` (defined in Terms, above and in
Objects and methods, above) — a `for` statement catches that specific
exception internally and treats it as the ordinary, expected signal to
end the loop, not as an error. `type(it)` reporting `<class
'list_iterator'>` proves this iterator is a real, distinct object — not
the list `numbers` itself, but a separate object `iter(numbers)`
constructs specifically to track where the loop currently is.

A third lab proves that separateness matters directly:

```python
it_a = iter(numbers)
it_b = iter(numbers)
print(it_a is it_b)
print(next(it_a))
print(next(it_b))
print(next(it_a))
```

Real output:

```
it_a is it_b: False
next(it_a): 10
next(it_b): 10
next(it_a) again: 20
```

`iter()`, called twice on the exact same list, produces two genuinely
different iterator objects (`it_a is it_b` is `False`, using the exact
identity check Lesson 1 built) — each tracking its own independent
position. Advancing `it_a` to `20` has no effect on `it_b`, which is
still sitting at the very start, about to yield `10`. This is called
being an **iterable** (defined in Terms, above), as distinct from being
an iterator: `numbers` itself never runs out or gets "used up" by being
looped over — every fresh `for` loop, or every fresh call to `iter()`,
gets its own brand-new iterator to track that specific pass, leaving
the underlying list itself completely unaffected.

### Discarding the Example

Both throwaway scripts shown here — the manual `while`/`try`/`except`
rewrite of the `for` loop, and the `it_a`/`it_b` independence proof —
are deleted now and won't appear in later lessons or project code. They
existed only to expose, mechanically, what a `for` statement already
does invisibly on every single use throughout this curriculum so far.

### Project Change

No project change in this unit — this unit is reverse-engineering
existing, built-in behavior; the project change for this lesson lands
once the next two units establish what's needed to build a *custom*
iterable of the project's own.

### Mechanical Walkthrough

- `numbers = [10, 20, 30]` — an assignment statement (Lesson 1) whose
  right-hand side is a list literal (Lesson 1, restated per the
  Repetition Rule), constructing a new `list` object with three int
  elements.
- `for n in numbers:` — a `for` statement (briefly flagged, not fully
  explained, in Lesson 4's walkthrough, as genuinely narrow syntax at
  that point; this entire unit is its full, real explanation, per the
  Repetition Rule's requirement that a reappearing construct still get
  real treatment): internally calls `iter(numbers)` exactly once, then
  repeatedly calls `next()` on the resulting iterator, binding `n` to
  each returned value in turn, until `StopIteration` is raised, at
  which point the loop ends — this unit's own "Isolating the Concept"
  step is the literal, full mechanical description of what this single
  line does.
- `print(n)`, inside the loop — the `print` built-in (full treatment
  above), writing whatever value `n` is currently bound to.
- `it = iter(numbers)` — a call to the `iter` built-in (full treatment
  in Objects and methods, above), passed the list `numbers`, returning
  a new iterator object; bound to the name `it`.
- `type(it)`, `print(type(it))` — the `type` built-in (full treatment
  in Lesson 1, restated per the Repetition Rule), reporting `it`'s real
  class.
- `while True:` — a `while` statement (new syntax to this curriculum,
  genuinely narrow to this lesson's own manual-rewrite purpose rather
  than a subject in its own right — it repeatedly executes its
  indented block for as long as its condition, here the literal
  `True`, keeps evaluating truthy, which is always, making this an
  intentionally infinite loop whose only way out is the `break`
  statement below).
- `try:` — begins a `try` statement (new syntax; genuinely narrow to
  this unit's manual rewrite, not a subject of its own — it runs the
  indented block, and if an exception matching one of its `except`
  clauses is raised anywhere inside that block, control jumps to the
  matching clause instead of propagating the exception further).
- `n = next(it)` — a call to the `next` built-in (full treatment in
  Objects and methods, above), passed the iterator `it`, returning its
  next value (or raising `StopIteration`, caught by the surrounding
  `try`); the returned value is bound to `n`.
- `except StopIteration:` — a clause matching specifically the
  `StopIteration` exception (full treatment in Objects and methods,
  above); if `next(it)` above raised it, control jumps here instead of
  crashing the program.
- `print("StopIteration raised — loop ends")` — `print`, run only when
  the `except` clause above is actually reached.
- `break` — a statement (new syntax; genuinely narrow to this loop's
  own control flow, not a subject in its own right — it immediately
  exits the nearest enclosing `while` or `for` loop, skipping any
  remaining code in the loop body and any further iterations).
- `print(n)`, inside the `while` loop, after the `try`/`except` — runs
  only when `next(it)` succeeded (no exception was raised), printing
  the value just obtained.
- `it_a = iter(numbers)`, `it_b = iter(numbers)` — two separate calls to
  `iter`, each constructing its own independent iterator object over
  the same underlying list.
- `it_a is it_b` — the `is` operator (Lesson 1, restated per the
  Repetition Rule), comparing the two iterator objects' identities
  directly.
- `next(it_a)`, `next(it_b)`, `next(it_a)` again — three separate calls
  to `next`, each advancing only the specific iterator object it's
  called on, proving each iterator tracks its own position
  independently of the other.

### CS Lens

This is a hard concept — a uniform protocol underlying an entire
category of syntax across the language — so, per the Repetition Rule,
several unrelated recurrences:

```
Also recognized in: C#'s IEnumerable<T>/IEnumerator<T> interfaces
(MoveNext() and Current playing the identical role next() and its
return value play here, with a boolean return instead of an exception
signaling exhaustion), Java's Iterable<T>/Iterator<T> (hasNext()/next()
— note Java splits what Python's single next()/StopIteration pair does
into two separate method calls), database cursors (fetching one row at
a time from a query result rather than loading the entire result set
into memory up front — the same "produce values on demand, signal
exhaustion explicitly" shape), and Unix pipe reading (a process reading
from a pipe one chunk at a time, blocking until data is available or
the pipe is closed — closure of the pipe playing the role
StopIteration plays here)
```

### SE Lens

The alternative — requiring `for` to work only on a small, fixed set of
built-in container types, with no way for a custom type to opt in — was
rejected in favor of a documented, open protocol any object can
implement, which is exactly why this lesson's next unit can build a
completely custom class and have `for` work on it with zero special
casing anywhere in Python's own `for` implementation. The real cost:
because the protocol is just two ordinary methods with no compiler
enforcement, nothing stops a broken implementation — a `__next__` that
never raises `StopIteration` produces a real infinite loop the moment
anything tries to `for`-loop over it, and Python gives no warning at
definition time, only an actual hang at runtime; this lesson's third
unit's own `CountUpTo` class has to get this exactly right (`if
self.current >= self.limit: raise StopIteration`) or the entire
mechanism silently breaks.

### Commands Needed

Both labs run the same way as every previous lesson: `python3
lab1.py`. Nothing new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
all three parts of this unit's lab.

### Connection

This unit reverse-engineered what `for` already does on a built-in
`list`. The next unit asks whether that exact mechanism — `__iter__`
and `__next__` — can be written by hand, from scratch, on a completely
custom class with no relationship to `list` at all.

---

## Concept Unit: Building a Custom Iterator from Scratch

### The Problem

The previous unit proved `for` works by calling `iter()`, then `next()`
repeatedly, on whatever object it's given. `iter(numbers)` worked
because `list` already implements whatever `iter()` actually needs
internally — but what, precisely, does a type have to *provide* for
`iter()` and `next()` to work on it at all? Could you write a brand-new
class, sharing no code with `list` whatsoever, and have `for` work on
it correctly, just by giving it the right two methods?

> **Before reading on:** the previous unit showed `iter(numbers)`
> returns a *different* object from `numbers` itself — a
> `list_iterator`, not the list. If you were designing a custom class
> meant to represent something that counts upward from `1` to some
> limit, and you wanted `for n in your_object:` to work on it, would you
> need to write a *second* class (the way `list` apparently has its own
> separate `list_iterator` class working alongside it), or could a
> single class serve as its own iterator, if `__iter__` simply returned
> the object itself instead of building something separate?

### Isolating the Concept

```python
class CountUpTo:
    def __init__(self, limit):
        self.limit = limit
        self.current = 0

    def __iter__(self):
        return self

    def __next__(self):
        if self.current >= self.limit:
            raise StopIteration
        self.current += 1
        return self.current

counter = CountUpTo(3)
print(iter(counter) is counter)

for n in counter:
    print(n)
```

Real output:

```
iter(counter) is counter: True
1
2
3
```

`CountUpTo` serves as its own iterator: `__iter__` (defined in Terms,
above) simply `return self`, and `iter(counter) is counter` confirms
directly, using Lesson 1's identity check, that `iter()` really did
hand back the exact same object rather than constructing a separate
one, the way `list`'s own `iter()` did in the previous unit. `for n in
counter:` then works with zero special casing anywhere in Python's own
implementation — it calls `iter(counter)` once (getting `counter`
itself back), then calls `next()` on that same object repeatedly, each
call running `__next__` (defined in Terms, above): checking `self.current
>= self.limit`, and either raising `StopIteration` (ending the loop,
exactly as the previous unit's manual rewrite demonstrated) or
incrementing `self.current` and returning it.

The next lab exposes the sharpest, most easily-missed consequence of
this design — one most people using Python for years never
deliberately test:

```python
for n in counter:
    print("second pass:", n)
print("(nothing printed above means the second loop body never ran)")

fresh_counter = CountUpTo(2)
for n in fresh_counter:
    print("fresh:", n)
```

Real output:

```
(nothing printed above means the second loop body never ran)

fresh: 1
fresh: 2
```

The second `for n in counter:` — the exact same `counter` object,
already looped over once — produces *nothing at all*. This is not a
bug; it follows directly from `CountUpTo`'s own design: because
`__iter__` returns `self` rather than a fresh object, `counter`'s
`current` attribute — an **instance attribute** (defined in Terms,
above), belonging to this one specific object — is already sitting at
`3`, exactly equal to `self.limit`, left over from the first loop.
`for` calls `iter(counter)`, correctly getting `counter` back per its
own design, then calls `next()` on it, and `__next__`'s very first
check (`self.current >= self.limit`) is immediately true — the second
loop raises `StopIteration` on its very first call, before ever
yielding a single value. This is called an **iterator being exhausted**:
unlike `list`, which is an iterable but never an iterator itself (per
the previous unit, `iter(numbers)` always builds a fresh
`list_iterator`, leaving `numbers` reusable indefinitely), a type like
`CountUpTo`, which is *both* an iterable and its own iterator, only
supports being looped over exactly once per instance. `fresh_counter`,
a brand-new `CountUpTo(2)` instance with its own separate `current`
attribute starting fresh at `0`, works correctly — proving the
exhaustion is a property of the specific *instance*, not of the class
itself.

### Discarding the Example

`CountUpTo`, in this exact throwaway form, is deleted now and won't
appear in later lessons or project code. It existed only to isolate the
iterator protocol's two methods in the smallest possible custom class,
and to expose the exhaustion behavior directly. The real class this
curriculum keeps, built in the next unit, deliberately avoids this
exact single-use limitation.

### Project Change

No project change in this unit — the actual project application, built
in the next unit, deliberately uses a different, non-exhausting design
than `CountUpTo`'s, which this unit's own findings are what make that
design choice meaningful rather than arbitrary.

### Mechanical Walkthrough

- `class CountUpTo:` — a `class` statement (Lesson 4's walkthrough
  covered this in full for `class Point: pass`, restated per the
  Repetition Rule): begins a class definition; `CountUpTo` is the name
  bound to the resulting class object once the statement finishes.
- `def __init__(self, limit):` — a method definition (ordinary `def`
  syntax, per Lesson 2's walkthrough, restated per the Repetition
  Rule, now written inside a class body rather than at module level,
  which is what makes it a method rather than a plain function);
  `__init__` (defined in Terms, above, as part of `self`'s own entry:
  the specific dunder method Python calls automatically, immediately
  after constructing a new instance, to let that instance set up its
  own starting attributes) is itself a dunder method (defined in
  Terms, above); `self` (defined in Terms, above) is its first
  parameter, automatically bound to the specific new instance being
  initialized; `limit` is an ordinary second parameter, supplied by
  whatever value is passed when the class is called (`CountUpTo(3)`
  passes `3` as `limit`).
- `self.limit = limit`, inside `__init__` — an assignment statement
  whose left-hand side is attribute access (`self.limit`, not a plain
  name) — this creates a new **instance attribute** (defined in Terms,
  above) named `limit` directly on the specific instance `self` refers
  to, bound to whatever object the parameter `limit` is currently bound
  to.
- `self.current = 0`, inside `__init__` — the same pattern, creating a
  second instance attribute, `current`, initialized to the int `0` —
  this is the "position tracker" this unit's own Socratic prompt asked
  about, made concrete.
- `def __iter__(self):` — a method definition; `__iter__` is the dunder
  method the iterator protocol requires every iterable to define,
  taking only `self`.
- `return self` — a `return` statement (Lesson 2) whose value is
  `self` itself — the specific instance this method was called on —
  rather than constructing any separate object, which is the exact
  design choice this unit's own labs directly examine the consequences
  of.
- `def __next__(self):` — a method definition; `__next__` is the second
  dunder method the iterator protocol requires, also taking only
  `self`.
- `if self.current >= self.limit:` — an `if` statement (Lesson 2's
  walkthrough covered this in full, restated per the Repetition Rule),
  comparing the instance's own `current` attribute against its own
  `limit` attribute using `>=`, a comparison operator new to this
  curriculum but self-explanatory: "greater than or equal to."
- `raise StopIteration` — the `raise` keyword (Lesson 2, restated per
  the Repetition Rule), triggering the `StopIteration` exception (full
  treatment in Objects and methods, above) with no explicit
  construction call and no message — `raise ExceptionClassName`, with
  no parentheses, is valid shorthand for constructing the exception
  with no arguments and immediately raising it in one step.
- `self.current += 1` — an augmented assignment (Lesson 3's
  walkthrough covered this in full for `current_id += 1`, restated per
  the Repetition Rule), reading `self.current`'s current value,
  computing one more than it (a new int object, per Lesson 1's
  immutability finding), and rebinding the instance attribute
  `self.current` to that new object.
- `return self.current` — a `return` statement whose value is whatever
  object `self.current` is now bound to, handing that value back to
  whatever called `next()`.
- `counter = CountUpTo(3)` — an assignment statement whose right-hand
  side is a call: `CountUpTo(3)` constructs a new instance of the class
  (Lesson 4's walkthrough covered class instantiation in outline;
  this unit's own `__init__` walkthrough, above, is the full mechanism
  behind it: Python constructs a new, empty instance, then
  automatically calls `__init__` on it with `self` bound to that new
  instance and `3` bound to `limit`); `counter` is bound to the
  resulting instance.
- `iter(counter) is counter` — a call to `iter` (full treatment in
  Objects and methods, above), which internally calls `counter`'s own
  `__iter__` method — returning `self`, per this class's own
  definition — compared via `is` (Lesson 1) against `counter` itself.
- `for n in counter:` — the exact mechanism this lesson's first unit
  fully explained, now operating on a custom object rather than a
  `list`: calls `iter(counter)` once (getting `counter` back, per its
  `__iter__`), then calls `next()` on it repeatedly (each call running
  `counter`'s own `__next__` method), binding `n` to each returned
  value until `StopIteration` is raised.

### Execution Trace

A timing/control-flow trace for the two `for` loops over the same
`counter` object, tracking `self.current`'s real value at each step:

1. `counter = CountUpTo(3)` — `__init__` runs; `counter.limit` is bound
   to `3`; `counter.current` is bound to `0`.
2. First `for n in counter:` begins — `iter(counter)` is called, which
   calls `counter.__iter__()`, returning `counter` itself.
3. First `next()` call (on `counter`) — `counter.__next__()` runs:
   `self.current >= self.limit` checks `0 >= 3`, which is `False`, so
   the `raise` is skipped; `self.current += 1` changes `counter.current`
   from `0` to `1`; `1` is returned and bound to `n`; the loop body
   prints `1`.
4. Second `next()` call — `1 >= 3` is `False`; `counter.current`
   changes from `1` to `2`; `2` is returned; the loop body prints `2`.
5. Third `next()` call — `2 >= 3` is `False`; `counter.current` changes
   from `2` to `3`; `3` is returned; the loop body prints `3`.
6. Fourth `next()` call — `3 >= 3` is `True`; `StopIteration` is
   raised; the first `for` loop ends, having printed `1`, `2`, `3`.
   `counter.current` is left at `3`.
7. Second `for n in counter:` begins — `iter(counter)` is called again,
   returning `counter` again (the same object, still holding
   `current = 3` from step 6).
8. First `next()` call of this second loop — `self.current >=
   self.limit` checks `3 >= 3`, which is `True` — `StopIteration` is
   raised immediately, before the loop body ever runs even once. This
   is exactly why the real output shows nothing printed for the second
   loop.

### CS Lens

This reappears the iterator-protocol idea from the previous unit,
sharpened by the specific, sharp-edged consequence this unit's own
labs proved directly:

```
Also recognized in: file objects in Python itself (a real file, opened
for reading, is exactly this shape — its own class serves as both
iterable and iterator, and reading through a file once genuinely
exhausts it, the identical behavior CountUpTo just demonstrated, for
the identical underlying reason: state lives on the object itself, not
recreated fresh each time), database result cursors again (a cursor,
once fully read, is exhausted the same way — re-reading requires a
fresh query, not a fresh loop over the same cursor object), and
generator objects specifically (a topic this curriculum's next lesson
covers directly — a generator is, structurally, precisely this same
"class serves as its own iterator, and gets exhausted after one full
pass" shape, just built with different syntax)
```

### SE Lens

The alternative — designing every custom iterable so that `__iter__`
always constructs and returns a fresh, separate object, the way
`list`'s own `iter()` does, rather than ever returning `self` — was not
chosen for `CountUpTo`, deliberately, so this unit could expose the
real tradeoff directly rather than only describing it abstractly:
returning `self` from `__iter__` is simpler to write (no second class
needed) and cheaper (no new object constructed on every `iter()` call),
at the direct cost this unit's own lab demonstrated — the object
becomes single-use, and nothing in Python's syntax warns you when
you've accidentally reused an already-exhausted one; the second loop
over `counter` produced no error at all, just silent, empty output,
which is a substantially worse failure mode than a loud one. The real
cost this specific unit's own throwaway code carries, left unresolved
on purpose: a caller of `CountUpTo` has no way to tell, just by looking
at an instance, whether it's already been exhausted — `counter.current
== counter.limit` would have to be checked manually, and nothing about
the class's public interface hints that this check is ever necessary.

### Commands Needed

Both labs run the same way as every previous lesson: `python3
lab2.py`. Nothing new.

### Run It

Already shown and verified above, under "Isolating the Concept," for
all three parts of this unit's lab; and under "Execution Trace" for the
full step-by-step reasoning behind the exhaustion behavior.

### Connection

This unit proved a custom class can implement the full iterator
protocol, and exposed a real, sharp-edged cost of the simplest possible
way to do it: single-use exhaustion, with no warning. The next unit
applies this protocol to the project itself — deliberately choosing the
*other* design this unit's CS Lens already named (delegating to an
already-reusable underlying iterable, the way `list` itself works),
rather than repeating `CountUpTo`'s exhaustion problem.

---

## Concept Unit: A Real Iterable — `TaskList`, Applied to the Project

### The Problem

The project currently has no way to hold more than one task at once —
`task_a` and `task_b`, from Lessons 2 and 3, are two entirely separate
names, and any code wanting to process "all the tasks" would have to
know, by name, exactly how many there are and what each one is called.
A real task-tracking program needs a genuine collection — something you
can add tasks to, and loop over with `for task in ...:`, without caring
in advance how many tasks it holds. Given everything the previous two
units just proved — including the sharp cost of `CountUpTo`'s
single-use design — how should this collection actually be built, so
that looping over it doesn't carry that same exhaustion problem?

> **Before reading on:** `CountUpTo` served as its own iterator by
> returning `self` from `__iter__`, and paid for that simplicity with
> single-use exhaustion. The previous unit's CS Lens named the
> alternative directly: a `list`'s own `__iter__` doesn't return the
> list itself — it constructs and returns a brand-new `list_iterator`
> object every time. If a new `TaskList` class internally stores its
> tasks in an ordinary Python `list` (say, in an attribute called
> `self._tasks`), what's the simplest possible `__iter__` you could
> write that gets the *list's* reusability for free, without writing a
> second, custom iterator class of `TaskList`'s own at all? (Hint: this
> lesson's very first unit already used the one built-in function that
> makes this almost trivially short.)

### Isolating the Concept

The realization this unit is built around doesn't need a separate
throwaway lab — it's a direct, one-line consequence of this lesson's
first unit's own finding, applied deliberately: `iter()`, called on an
ordinary `list`, always returns a fresh iterator. So a class that wants
`for` to work on it, *without* inheriting `CountUpTo`'s exhaustion
problem, can simply delegate: store the real data in an ordinary
`list`, and have `__iter__` return `iter()` of that internal list,
rather than returning `self`. Every time `__iter__` is called — which
is to say, every time a fresh `for` loop begins — it hands back a
brand-new iterator over the current contents, exactly as reusable as
the underlying `list` itself already is. This is built directly as the
real project code below, rather than as a discarded lab first, because
the concept itself is this lesson's second unit's own finding, applied
— there's no new mechanism left to isolate.

### Discarding the Example

Not applicable in the usual sense — see above: this unit has no
separate throwaway script to discard, because its content is a direct,
deliberate application of the previous unit's own already-isolated
finding, not a new mechanism requiring its own isolated lab first.

### Project Change

- **Reference Source:** No reference counterpart — original to this
  project, same as every previous unit in this curriculum.
- **Files affected:** `project/tasks.py` (modified), `project/main.py`
  (modified).
- **Change type:** Add — a new `TaskList` class, appended to
  `tasks.py`; `main.py` updated to build one, add both existing tasks
  to it, and loop over it twice to prove reusability.
- **Location:** `TaskList` is added at the end of `tasks.py`, after the
  existing `describe_task` function established in Lesson 4; `main.py`
  keeps its existing task-creation lines unchanged, with new lines
  added after them.
- **Dependencies:** None new — everything used here (`class`,
  `__init__`, `self`, `__iter__`, `list.append`) is already part of
  core Python or already covered in this lesson and previous ones.

### The New Code

```python
class TaskList:
    def __init__(self):
        self._tasks = []

    def add(self, task: dict) -> None:
        self._tasks.append(task)

    def __iter__(self):
        return iter(self._tasks)
```

### The Updated Project

```
tasks.py:
41  def describe_task(task: dict) -> str:
42      formatter = _PRIORITY_FORMATTERS.get(task["priority"], _format_normal)
43      return formatter(task)
44
45
46  class TaskList:                                          # ← new
47      def __init__(self):                                  # ← new
48          self._tasks = []                                 # ← new
49                                                             # ← new
50      def add(self, task: dict) -> None:                   # ← new
51          self._tasks.append(task)                         # ← new
52                                                             # ← new
53      def __iter__(self):                                  # ← new
54          return iter(self._tasks)                         # ← new
```

```
main.py:
 1  from tasks import create_task, create_id_generator, describe_task, TaskList  # ← changed
 2
 3  next_id = create_id_generator()
 4
 5  task_a = create_task(next_id(), "Write lesson 3", 1)
 6  task_b = create_task(next_id(), "Review lesson 3", 2)
 7
 8  my_tasks = TaskList()                                    # ← new
 9  my_tasks.add(task_a)                                     # ← new
10  my_tasks.add(task_b)                                     # ← new
11
12  print("=== First pass ===")                              # ← new
13  for task in my_tasks:                                    # ← new
14      print(describe_task(task))                           # ← new
15
16  print("=== Second pass (proving TaskList is reusable) ===")  # ← new
17  for task in my_tasks:                                    # ← new
18      print(describe_task(task))                           # ← new
```

As a whole, `tasks.py` now provides a genuine collection type: `add()`
grows the list of tasks it's tracking, and `__iter__` makes it work
correctly with `for`, delegating entirely to the internal list's own
already-reusable iterator rather than tracking any position itself.
`main.py`, as a whole, now builds a real `TaskList`, adds both existing
tasks to it, and demonstrates — with a second, separate loop over the
exact same object — that it doesn't carry `CountUpTo`'s exhaustion
problem: both passes produce identical output.

### Mechanical Walkthrough

- `class TaskList:` — a `class` statement (Lesson 4, restated per the
  Repetition Rule), beginning the definition of the project's own
  collection type.
- `def __init__(self):` — a method definition; `__init__` (full
  treatment in this lesson's second unit, restated per the Repetition
  Rule), taking only `self` — unlike `CountUpTo.__init__`, this one
  takes no additional parameters, since a `TaskList` starts out empty
  rather than needing any initial configuration.
- `self._tasks = []` — an assignment statement creating an instance
  attribute (full treatment in this lesson's second unit, restated per
  the Repetition Rule) named `_tasks` (the leading underscore following
  the same internal-detail naming convention Lesson 4's
  `_format_critical` already established, restated per the Repetition
  Rule: a signal this attribute isn't meant to be accessed directly
  from outside the class), bound to a new, empty list literal.
- `def add(self, task: dict) -> None:` — a method definition with a
  hinted parameter and hinted return type (Lesson 2's pattern, restated
  per the Repetition Rule); `-> None` states this method isn't expected
  to return a meaningful value at all — its entire purpose is the
  mutation performed inside it.
- `self._tasks.append(task)` — a call to `append` (full treatment under
  "Everything else" in Lesson 1, restated per the Repetition Rule),
  called on the instance's own `_tasks` list, growing it by one element
  — the dict `task` was bound to when `add` was called.
- `def __iter__(self):` — a method definition; `__iter__` (full
  treatment in this lesson's second unit, restated per the Repetition
  Rule), taking only `self`.
- `return iter(self._tasks)` — a `return` statement whose value is a
  call to the `iter` built-in (full treatment in Objects and methods,
  above), passed the instance's own `_tasks` list. This is the
  deliberate design choice this unit's own problem statement led to:
  because `self._tasks` is an ordinary `list`, and this lesson's first
  unit already proved `iter()` on a list always constructs a fresh
  iterator, every single call to `TaskList.__iter__` — meaning, every
  fresh `for` loop over a `TaskList` — gets its own brand-new,
  independent iterator, with `TaskList` itself never accumulating any
  "current position" state the way `CountUpTo` did.
- `my_tasks = TaskList()` — an assignment statement whose right-hand
  side is a call: `TaskList()` constructs a new instance (Python
  constructs a new, empty instance, then calls `__init__` on it with
  `self` bound to that instance — the identical mechanism this lesson's
  second unit already established for `CountUpTo(3)`); `my_tasks` is
  bound to the resulting instance.
- `my_tasks.add(task_a)` — a method call: `add`, looked up on the
  instance `my_tasks`, is invoked with `self` automatically bound to
  `my_tasks` and `task` bound to `task_a` — the dict already built by
  `create_task` earlier in the file.
- `my_tasks.add(task_b)` — the identical pattern, adding the second
  task.
- `for task in my_tasks:`, first occurrence — the full iterator
  protocol mechanism this lesson's first unit explained: calls
  `iter(my_tasks)`, which calls `my_tasks.__iter__()`, which returns a
  fresh iterator over `my_tasks._tasks`; then calls `next()` on that
  iterator repeatedly, binding `task` to each dict in turn, until
  `StopIteration`.
- `print(describe_task(task))`, inside the loop — `describe_task` (full
  treatment in Lesson 4, restated per the Repetition Rule), called on
  whichever task dict `task` is currently bound to; its result passed
  to `print`.
- `for task in my_tasks:`, second occurrence — the identical mechanism
  as the first, but critically: `iter(my_tasks)` is called *again*
  here, independently of the first loop's call, per `__iter__`'s own
  design — it returns a fresh `iter(self._tasks)` every single time
  it's called, so this second loop's iterator has no relationship at
  all to whatever state the first loop's iterator was left in (which,
  per this lesson's first unit, was already fully exhausted and simply
  discarded once that first loop ended).

### CS Lens

This reappears the delegation idea named in the previous unit's SE
Lens, now fully demonstrated as real, working project code:

```
Also recognized in: nearly every standard-library collection type in
any language that supports custom iteration (C#'s List<T> delegates
its own IEnumerator to an internal array's iteration logic in exactly
this spirit), the Decorator and Adapter design patterns from
object-oriented software engineering generally (wrapping an existing,
already-correct object and forwarding calls to it, rather than
reimplementing its behavior from scratch — TaskList.__iter__ forwarding
to self._tasks's own __iter__ is a minimal, one-line instance of
exactly this idea), and composition over inheritance as a design
principle (TaskList doesn't extend list or inherit its behavior — it
holds a list as an attribute and forwards to it deliberately and
explicitly, a design choice this curriculum's later Phase 3 lessons on
inheritance will return to directly)
```

### SE Lens

The alternative — giving `TaskList` its own `CountUpTo`-style
`__next__` method, tracking an index into `self._tasks` manually
(`self._position = 0`, incremented on each call) — was rejected here
specifically because this lesson's second unit already proved, in
concrete, executed output, exactly what that choice costs: single-use
exhaustion, with the exact same silent-empty-second-loop failure mode.
Delegating to `iter(self._tasks)` instead gets `list`'s own,
already-correct, already-tested reusability for free, at the cost of
one real constraint worth naming honestly: `TaskList`'s own iteration
behavior is now entirely dependent on `list`'s — if `self._tasks` were
ever swapped for some other internal storage that doesn't behave the
same way `list` does (a topic outside this lesson's scope), `__iter__`
would need to change to match it, since `TaskList` currently has no
iteration logic of its own at all, only this one line forwarding
everything to whatever `self._tasks` already knows how to do.

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
```

Both passes produce identical output — direct, concrete proof, in the
real project rather than an isolated lab, that `TaskList` doesn't
inherit `CountUpTo`'s exhaustion problem. `mypy main.py` reports:

```
Success: no issues found in 1 source file
```

### Connection

This unit is where every rule this lesson established became a real,
deliberate design decision rather than an abstract fact: the first
unit's proof that `list`'s own `iter()` is always fresh is exactly what
`TaskList.__iter__` leans on; the second unit's `CountUpTo` exhaustion
problem is exactly what `TaskList`'s design was built to avoid, on
purpose, not by accident.

---

## Connect the Pieces

Trace one full pass through everything this lesson built: `for task in
my_tasks:`, the second occurrence, in the real project. Per this
lesson's first unit, this statement begins by calling
`iter(my_tasks)` — which, per this unit's own Mechanical Walkthrough,
calls `my_tasks.__iter__()`, which returns `iter(self._tasks)`: a
brand-new `list_iterator`, constructed fresh at this exact moment, with
no relationship whatsoever to the iterator the *first* `for` loop, a
few lines earlier, already exhausted and discarded — the same
independence this lesson's first unit proved directly with `it_a` and
`it_b` over the plain list `numbers`. The loop then calls `next()` on
that fresh iterator, repeatedly, exactly as this lesson's first unit's
manual `while`/`try`/`except` rewrite demonstrated by hand, binding
`task` to `task_a`'s dict, then `task_b`'s, until `StopIteration` ends
the loop. And running the identical loop a third time, hypothetically,
would work exactly as well as this second pass did — because
`TaskList`, unlike this lesson's own `CountUpTo`, was built
specifically, and by name in its own SE Lens, to never carry the
exhaustion problem this lesson's second unit spent an entire execution
trace proving in detail.
