# Lesson 31: Design by Contract

**What you will build.** A single, reusable mechanism — a real Python
decorator — that replaces three lessons' worth of hand-written `assert`
lines with one declarative, reusable statement of a function's contract:
its precondition and its postcondition, attached directly to its
definition instead of buried inside its body. You'll apply it to
`average`, watch it correctly reject an empty list the same way Lesson
28's manual check did, and then watch its postcondition half catch a
deliberately broken implementation that the precondition alone would
have let straight through.

**What you need to know first.** Lesson 28's precondition, Lesson 29's
postcondition, and Lesson 30's invariant — this lesson names the
discipline that unifies all three and builds real tooling for it.

**Terms introduced in this lesson**

- **Design by Contract** — Bertrand Meyer's term, introduced with the
  Eiffel programming language in 1986, for treating a function's
  precondition and postcondition as a real, explicit contract between
  caller and function: the caller is obligated to satisfy the
  precondition; the function, in return, is obligated to satisfy the
  postcondition. A violation is always attributable to whichever side
  broke its own half — exactly the distinction Lessons 28 and 29 already
  built, given here its real, recognized name.
- **decorator** — a function that takes another function as input and
  returns a new function wrapping it, adding behavior before, after, or
  around the original call without changing the original function's own
  code. Python's `@decorator_name` syntax, written directly above a
  function definition, applies a decorator to that function.

**Objects and methods used.** None beyond what this lesson's own Concept
Unit introduces and gives full treatment to below.

Pipeline: this lesson continues in the *Specification* stage, restated
per Lesson 28's convention:

```text
Problem → Requirements → Domain model → Specification → Architecture →
Design → Implementation → Verification → Integration → Release →
Deployment → Operations → Observation → Change → Migration → Evolution →
Retirement
```

---

## Concept Unit: Three Lessons, One Real Discipline

### The Problem

Lessons 28, 29, and 30 each added an `assert` to a function, for three
related but separately-taught reasons. Is there a name for what all
three were actually doing?

### The Concept

Yes: **Design by Contract**. A precondition (Lesson 28) is the caller's
obligation. A postcondition (Lesson 29) is the function's obligation in
return. An invariant (Lesson 30) is a standing obligation that has to
keep holding across every operation permitted to touch a piece of data.
Together, stated explicitly rather than left as inferred behavior, they
form a real contract — the same shape a legal contract or a service-level
agreement takes: each side has stated, checkable obligations, and knowing
which side broke its obligation tells you immediately whose fault a
failure actually is, rather than leaving it to be guessed at from a
downstream symptom the way Lesson 6's original `ZeroDivisionError` did.

### CS Lens

Design by Contract is a recognized, named methodology with real history
— Meyer built it directly into Eiffel's own language syntax, and it has
since influenced contract-checking tools across many other languages.
The same idea also recurs well outside programming: a shipping contract
stating what a sender must package correctly (precondition) and what a
carrier guarantees in return (postcondition); a service-level agreement
stating what a customer must provide (valid credentials, reasonable
usage) against what a provider promises (uptime, response time).

### SE Lens

Nothing about naming this discipline changes what Lessons 28 through 30
already built — the value is entirely in what a shared name enables:
"does this function have a contract" becomes a real, precise question a
team can ask about any piece of code, rather than an unasked one nobody
thought to raise. The next two units build the tooling that makes stating
a contract cheap enough to actually do routinely, instead of by hand,
once per function, the way this domain has done it so far.

---

## Concept Unit: A Throwaway Lab — What a Decorator Actually Is

### The Problem

Every precondition and postcondition built so far lives as a raw
`assert` line, hand-written inside each function's own body — real, but
not reusable: writing a new contract means writing new `assert`
statements from scratch every time. Before building something reusable,
understand the one new language construct that makes it possible:
Python's decorator.

### The Isolated Example

```python
def announce(func):
    def wrapper(*args, **kwargs):
        print("calling", func.__name__)
        result = func(*args, **kwargs)
        print(func.__name__, "returned", result)
        return result
    return wrapper

@announce
def double(n):
    return n * 2

print(double(5))
```

Running it:

```text
$ python decorator_lab.py
calling double
double returned 10
10
```

`double(5)` didn't just return `10` — it printed a line before running
and a line after, even though `double`'s own body,
`return n * 2`, never mentions printing anything at all. This is called a
**decorator**: `@announce`, written directly above `def double`, doesn't
just label the function — it replaces `double` itself with whatever
`announce(double)` returns, which is `wrapper`, a new function that calls
the original `double` in the middle of its own extra behavior.

### Discarding the Lab

`announce` and `double` exist only to demonstrate this one mechanism —
neither reappears in this curriculum. What's kept is the idea: a
decorator can run code before and after a function, and can inspect or
react to what that function returns, all without the original function
needing to know any of this is happening.

### Mechanical Walkthrough

- `def announce(func):` — a function taking another function, `func`, as
  its one argument. First appearance in this curriculum of a function
  accepted as a plain value passed into another function — already
  technically possible per Lesson 15's `sorted(..., key=...)`, but never
  before as the *entire subject* of what a function does.
- `def wrapper(*args, **kwargs):` — a nested function defined inside
  `announce`. First appearance of `*args` and `**kwargs`: `*args`
  collects any number of positional arguments into a tuple; `**kwargs`
  collects any number of keyword arguments into a dict. Together, they
  let `wrapper` accept whatever arguments `func` itself accepts, without
  `announce` needing to know in advance what those are.
- `func(*args, **kwargs)` inside `wrapper` — calling the original
  function, passing `*args` and `**kwargs` back out the same way they
  came in, which is what actually runs `double`'s real logic in the
  middle of `wrapper`'s extra printing.
- `return wrapper` — `announce` doesn't call `func` itself; it returns a
  *new* function that will call `func` later, whenever the decorated name
  is actually invoked. This is the part that makes `@announce` work: `def
  double(n): return n * 2` still gets defined normally first, and then
  immediately replaced by `announce(double)`'s return value.
- `@announce` above `def double(n):` — Python syntax equivalent to
  writing `double = announce(double)` immediately after `double`'s
  original definition; first appearance of this decorator syntax, though
  the mechanism it triggers was already fully explained in the four
  points above.

### CS Lens

A decorator is a direct, real instance of a **higher-order function** —
a function that takes a function as input, returns a function as output,
or both. This same idea, functions treated as ordinary values that other
functions can accept, return, and combine, recurs constantly: Lesson
15's `sorted(..., key=...)` already did the "accepts a function" half;
`announce` completes the pattern by also returning one.

### SE Lens

Nothing about `announce` was necessary to write by hand for `double`
specifically — the entire value of a decorator is that the exact same
`announce` could wrap any function at all, unchanged, which is precisely
the reusability this lesson's next unit needs to turn three lessons'
worth of one-off `assert` lines into a single, shared mechanism.

---

## Concept Unit: A Real, Reusable Contract Decorator

### The Problem

Build a decorator that attaches a precondition and a postcondition to any
function, replacing the hand-written `assert` lines Lessons 28 and 29
put directly inside `average`'s own body.

### The New Code

```python
def contract(precondition=None, postcondition=None):
    def decorator(func):
        def wrapper(*args, **kwargs):
            if precondition:
                assert precondition(*args, **kwargs), f"precondition violated in {func.__name__}"
            result = func(*args, **kwargs)
            if postcondition:
                assert postcondition(result, *args, **kwargs), f"postcondition violated in {func.__name__}"
            return result
        return wrapper
    return decorator
```

Apply it to `average`, stating both its precondition (Lesson 28) and a
real postcondition — a computed mean must fall between the smallest and
largest reading it was computed from:

```python
@contract(
    precondition=lambda readings: len(readings) > 0,
    postcondition=lambda result, readings: min(readings) <= result <= max(readings),
)
def average(readings):
    return sum(readings) / len(readings)
```

Run it against a valid case and Lesson 28's original violation:

```python
print(average([68.0, 70.5, 71.0]))
print(average([]))
```

Running it:

```text
$ python average.py
69.83333333333333
Traceback (most recent call last):
  File "average.py", line 18, in <module>
    print(average([]))
  File "average.py", line 5, in wrapper
    assert precondition(*args, **kwargs), f"precondition violated in {func.__name__}"
AssertionError: precondition violated in average
```

The valid case still returns exactly `69.83333333333333`. The empty case
still fails, reported this time from inside `wrapper`, naming `average`
by its real name via `func.__name__` — the precondition check now lives
in one shared, reusable place instead of a hand-typed line inside every
function that needs one.

### Prove the Postcondition Half Actually Works

```python
@contract(
    precondition=lambda readings: len(readings) > 0,
    postcondition=lambda result, readings: min(readings) <= result <= max(readings),
)
def average_buggy(readings):
    return sum(readings) / len(readings) + 100

print(average_buggy([68.0, 70.5, 71.0]))
```

Here's what actually happens:

```text
$ python average.py
Traceback (most recent call last):
  File "average.py", line 25, in <module>
    print(average_buggy([68.0, 70.5, 71.0]))
  File "average.py", line 8, in wrapper
    assert postcondition(result, *args, **kwargs), f"postcondition violated in {func.__name__}"
AssertionError: postcondition violated in average_buggy
```

`average_buggy` passes its precondition — the input list is non-empty —
and only then reveals its real defect: an accidental `+ 100` pushing the
result far outside the range any real average of these three readings
could ever fall in. The identical `contract` decorator, with the
identical postcondition, catches it, with no special-casing for this
specific bug written anywhere.

### Mechanical Walkthrough

- `contract(precondition=..., postcondition=...)` — a function that
  itself returns `decorator`, which is what actually gets applied to
  `average`. This nesting — `contract` takes the check functions,
  `decorator` takes the real function, `wrapper` takes the real call — is
  what lets `@contract(...)` accept its own arguments, unlike
  `@announce`, which took none.
- `precondition(*args, **kwargs)` — calls whatever function was passed as
  `precondition` with `average`'s real arguments; for `average`, that's
  the lambda `lambda readings: len(readings) > 0`, receiving the actual
  `readings` list.
- `postcondition(result, *args, **kwargs)` — calls the postcondition
  function with the real return value prepended to the original
  arguments, so a postcondition can inspect both what came in and what
  went out — exactly what `min(readings) <= result <= max(readings)`
  needs.
- `lambda readings: len(readings) > 0` and
  `lambda result, readings: min(readings) <= result <= max(readings)` —
  already-assumed lambda syntax; the engineering idea worth naming isn't
  the syntax, it's that these two lines now state `average`'s entire
  contract, readably, in one place, right where the function is defined.

### CS Lens

This is the same underlying mechanism many languages provide as built-in
support for Design by Contract — Eiffel's own `require`/`ensure` clauses,
or contract libraries in other languages — expressed here using nothing
but the decorator mechanism this lesson's throwaway lab just taught,
rather than special language syntax this curriculum would need to
introduce separately.

### SE Lens

The real tradeoff, honestly: `contract` adds real overhead to every
decorated call — two function calls and two comparisons, on top of the
real work. For a hot path, Lesson 17's non-functional requirements would
be the right lens to decide whether that cost is acceptable, exactly the
same judgment call this curriculum has already asked for repeatedly. What
`contract` buys in exchange is significant: `average`'s entire behavioral
promise is now readable in four lines sitting directly above its
definition, rather than scattered as bare `assert` statements a reader
has to find and mentally separate from the function's real logic.

---

## Connect the Pieces

Three lessons' worth of hand-written contracts, replaced by one reusable
mechanism:

1. **The discipline, named** — Design by Contract: precondition and
   postcondition as two sides of a real, explicit obligation.
2. **The mechanism, learned in isolation** — a decorator, `announce`,
   proven to run real code before and after a call without changing the
   wrapped function's own body.
3. **The mechanism, applied for real** — `contract`, attached to
   `average` via `@contract(precondition=..., postcondition=...)`,
   correctly rejecting an empty list and correctly catching a broken
   implementation's out-of-range result, using the identical decorator
   both times.

## What Breaks Without This

Keep writing every precondition and postcondition as a separate,
hand-typed `assert` line inside each function's own body, the way
Lessons 28 and 29 did. Nothing about this is wrong — both lessons' checks
worked exactly as intended. What doesn't scale is doing it for dozens of
functions across a real system: every contract statement is now
indistinguishable from the function's ordinary logic, easy to miss on a
read, and impossible to inspect, list, or reuse as a pattern the way
`@contract(...)`, sitting visibly above a function's own definition,
already is.

## Exercises

1. Apply `@contract(...)` to Lesson 4's `business_days_between`, stating
   its precondition (`start` must not be after `end`) and the
   postcondition you wrote in Lesson 29's exercises. Run it against a
   valid case and a precondition violation.
2. Extend `contract` to accept an `invariant` check as well, run once
   before and once after the wrapped call, using Lesson 30's
   `check_normalized_invariant` as a real test case wrapped around a
   function that modifies `existing_usernames`.
3. Explain, in a sentence or two, what `func.__name__` actually is, and
   why the error messages in this lesson's real output correctly say
   `"average"` or `"average_buggy"` even though the assertion itself
   lives inside `wrapper`, a completely different function.

## Definition of Done

- [ ] You can define Design by Contract in your own words, connecting it
      to Lessons 28 through 30.
- [ ] You can explain, without notes, what a decorator does mechanically
      — what `@name` above a function definition actually causes to
      happen.
- [ ] You've run the `contract`-decorated `average` and `average_buggy`
      yourself and reproduced both real failures.
- [ ] You've completed all three exercises.
- [ ] Commit `contract` and the decorated `average`. Commit message
      should explain *why*: for example, `Lesson 31 — replaced average's
      hand-written precondition assert with a reusable @contract
      decorator, adding a real postcondition in the same declaration.`
