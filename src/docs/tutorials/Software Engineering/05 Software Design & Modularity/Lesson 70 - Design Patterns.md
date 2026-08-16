# Lesson 70: Design Patterns

**What you will build.** Three ways to discount an order total —
percentage off, a fixed amount off, no discount at all — built as a full
`DiscountStrategy` class hierarchy: an abstract base class with
`@abstractmethod def apply(self, total)`, and three subclasses. It
works, and it comes with real ceremony: a fourth subclass that forgets
to implement `apply` can't even be constructed, `TypeError`, before it's
ever used. This lesson names what was just built — the **Strategy
pattern** — and then asks the harder question this domain's own BRD
insists on: was the pattern actually needed here, or would three plain
functions have solved the identical problem with none of the class
machinery's own failure modes? The transferable problem: a design
pattern is a name for a recurring shape, not a mandate to build that
shape every time something resembles the problem it solves — Lessons 61,
65, and 69 already built three real patterns by hand, correctly, without
ever needing a class hierarchy at all.

**What you need to know first.** Dependency Inversion (Lesson 61) —
`register_transition_listener`, this lesson's own retrospective example
of the **Observer pattern**, already built without the name. Extension
Points (Lesson 65) — the payment-method registry, an instance of a
**Registry** (or **Factory Registry**) pattern, also already built
without the name. Substitution (Lesson 63) — the exact test this
lesson's `DiscountStrategy` subclasses are held to, the same test
`RushOrder` failed.

**Pipeline diagram.** Lesson 12 established the full sequence every
system in this curriculum is placed against:

```text
Problem
  ↓
Requirements
  ↓
Domain model
  ↓
Specification
  ↓
Architecture
  ↓
Design
  ↓
Implementation
  ↓
Verification
  ↓
Integration
  ↓
Release
  ↓
Deployment
  ↓
Operations
  ↓
Observation
  ↓
Change
  ↓
Migration
  ↓
Evolution
  ↓
Retirement
```

Still the **Design** stage. Carried through: this lesson names three
patterns this domain has already built, by hand, across nine lessons —
proof, before the name is even introduced, that understanding *why* a
pattern solves its problem doesn't require memorizing its name first.

**Terms introduced in this lesson.** One line each.

- **design pattern** — a named, reusable solution to a problem that
  recurs across many different systems, valuable specifically because
  naming it lets engineers communicate an entire design decision in one
  word instead of re-explaining the mechanism every time. This domain
  has already built three of them by hand, without the name, since
  Lesson 61.
- **Observer pattern** — the retrospective name for Lesson 61's own
  listener-registry technique: one subject notifying a list of
  registered observers whenever its own state changes, without knowing
  anything about who's listening or how many there are.
- **Strategy pattern** — a family of interchangeable algorithms or
  behaviors, each satisfying the same interface, selected and swapped by
  whatever code is using them without that code needing to know which
  specific one it's holding — the exact shape this lesson's discount
  example builds, whether as class hierarchy or as plain functions.
- **abstract base class** — a class that declares one or more methods
  its own subclasses are required to implement, refusing to let any
  subclass be instantiated at all if it leaves a required method
  unimplemented. It's the specific Python mechanism this lesson's
  Strategy-pattern example uses, and the source of its own real cost.

**Objects and methods used.**

- **`ABC`** (from Python's standard-library `abc` module)
  - *What it is:* a base class that changes what "subclassing" means the
    same way `Enum` did in Lesson 45 — instead of an ordinary blueprint,
    subclassing `ABC` (combined with `@abstractmethod`) creates a class
    whose incomplete subclasses cannot be constructed at all.
  - *Implementation:* `class DiscountStrategy(ABC):` combined with
    `@abstractmethod` on one or more of its methods; any subclass that
    doesn't override every `@abstractmethod`-marked method raises
    `TypeError` the moment code tries to construct an instance of it —
    not when the missing method is finally called, but immediately, at
    construction.
  - *Its use:* this lesson uses it to build a real Strategy-pattern
    hierarchy, and specifically to demonstrate, for real, what happens
    when a new subclass forgets to satisfy the contract.
- **`@abstractmethod`** (from the same `abc` module)
  - *What it is:* a decorator marking a method as required — every
    concrete (non-abstract) subclass must override it.
  - *Implementation:* written directly above a method definition inside
    an `ABC` subclass, with a body that's never meant to run (often just
    `...` or `pass`); it's a marker for the class machinery, not real
    logic.
  - *Its use:* this lesson uses it on `DiscountStrategy.apply`, so any
    subclass forgetting to define its own `apply` fails loudly at
    construction instead of silently inheriting a method with no real
    body.

## Concept Unit: Naming a Pattern Doesn't Mean It Was the Right Choice

### The Problem

Three ways to discount an order total need a shared interface. The
textbook way to build that is the Strategy pattern, using an abstract
base class:

```python
from abc import ABC, abstractmethod


class DiscountStrategy(ABC):
    @abstractmethod
    def apply(self, total):
        ...


class PercentageDiscount(DiscountStrategy):
    def __init__(self, percent):
        self.percent = percent

    def apply(self, total):
        return total * (1 - self.percent / 100)


class FixedDiscount(DiscountStrategy):
    def __init__(self, amount):
        self.amount = amount

    def apply(self, total):
        return max(0, total - self.amount)
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. It works correctly:

```python
strategy = PercentageDiscount(percent=10)
print("discounted total:", strategy.apply(100))
```

Running it produces:

```
discounted total: 90.0
```

A third case, "no discount," gets added later, by someone who forgets
the one required method:

```python
class NoDiscount(DiscountStrategy):
    pass  # forgot to implement apply()


try:
    none_strategy = NoDiscount()
except TypeError as e:
    print("TypeError:", e)
```

Running it produces:

```
TypeError: Can't instantiate abstract class NoDiscount without an implementation for abstract method 'apply'
```

The mistake is caught immediately, loudly — that's the `ABC` machinery
doing real work. But notice what was needed to represent "no discount"
at all: a whole new class, inheriting from an abstract base, satisfying
a formal contract — for a case whose entire correct behavior is `return
total` unchanged. The pattern is being applied correctly. Whether it was
the right amount of structure for three interchangeable one-line
computations is a completely separate question.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** the discount logic, rewritten from a class
  hierarchy to plain functions.
- **Change type:** refactor — replace `DiscountStrategy` and its three
  subclasses with three ordinary functions.
- **Location:** wherever discount logic is defined and called.
- **Dependencies:** none — the replacement removes a dependency on `abc`
  rather than adding one.

### The New Code

The smallest new piece is one discount as a plain function:

```python
def percentage_discount(total, percent):
    return total * (1 - percent / 100)
```

### The Updated Project

All three discount behaviors become ordinary functions, and "no
discount" becomes exactly as much code as its own logic actually needs
— one line, no class, no formal contract to satisfy:

```python
def percentage_discount(total, percent):                        # ← changed, replaces PercentageDiscount
    return total * (1 - percent / 100)


def fixed_discount(total, amount):                                # ← changed, replaces FixedDiscount
    return max(0, total - amount)


def no_discount(total):                                            # ← changed, replaces NoDiscount
    return total
```

Every one of these is callable directly — `percentage_discount(100,
percent=10)` — with no construction step, no abstract contract to
satisfy, and no way to "forget to implement" anything, because there's
no shared interface being promised in the first place, only three
independent functions that each do their own one job.

### Isolating the Concept: The Same Interface, Two Different Costs

The mechanism this lesson compares — an abstract base class's own
enforcement machinery versus plain functions with no shared contract at
all — is shown directly through the real discount code above and its
replacement, rather than a separate, unrelated example, since the
comparison itself, not a new construct, is this lesson's actual subject.
Running both versions against the identical three cases:

```python
print("percentage:", percentage_discount(100, percent=10))
print("fixed:", fixed_discount(100, amount=15))
print("none:", no_discount(100))
```

Running it produces:

```
percentage: 90.0
fixed: 85
none: 100
```

Identical results to the class-based version's own two working cases,
plus the third case that used to require a class most people would
forget to check the abstract contract of, now needing nothing more than
a one-line function whose correctness is obvious by reading it. This
throwaway comparison is now complete; the choice between the two
approaches is this lesson's own real subject, not a discarded example.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`def percentage_discount(total, percent):`** — an ordinary function
  definition, no decorator, no base class, no formal contract — just a
  name and two parameters.
- **`return total * (1 - percent / 100)`** — the identical computation
  `PercentageDiscount.apply` performed, unchanged; only the surrounding
  ceremony is gone. There is no `self` here at all, because there is no
  object holding state between calls — `percent` is supplied fresh, at
  the call site, every time.

### CS Lens

This is the **Strategy pattern**, whether implemented as a class
hierarchy or as plain functions passed around as values — the essential
idea is interchangeable behavior selected by the caller, not the
specific mechanism used to achieve it. Python, and any language with
first-class functions, can implement Strategy without a class hierarchy
at all, because a function itself already satisfies "one shared calling
shape, many interchangeable implementations" — the same underlying
pattern this domain already built, correctly, in Lesson 65's registry
(a `dict` mapping names to callables) and Lesson 61's listener list (a
`list` of callables), neither of which needed `ABC` or an abstract
method anywhere.

Also recognized in: sorting algorithms selected by a `key` function
parameter rather than by subclassing a `Sorter` base class, HTTP request
handlers registered as plain functions in most modern web frameworks
rather than as classes implementing a `Handler` interface, and
JavaScript's own callback-based APIs, which have never needed a formal
interface declaration to support interchangeable behavior.

### SE Lens

The principle is **match the structure to the actual problem, not to the
pattern's own name** — the BRD this curriculum is built from says this
directly: understand *why* a pattern works, don't reach for its
structure by reflex. `DiscountStrategy`'s abstract base class earns its
real cost — the formal contract, the construction-time check, the
inheritance hierarchy — when there are genuinely many interchangeable
implementations, potentially supplied by code that doesn't control all
of them (Lesson 65's own extension-point case), or when shared,
non-trivial setup logic across implementations makes a shared base class
worth factoring out. Three one-line computations, all defined in the
same codebase, changing on the same schedule, are the case where that
cost buys nothing a plain function didn't already have. The real,
honest cost of *not* using the class hierarchy: nothing enforces that a
new discount function has the right signature — `def bad_discount():
return total` (missing the parameter entirely) fails only when it's
called, not at definition time, the exact class of error `ABC` exists to
catch early. Choosing functions over classes here is a real tradeoff,
not a strictly better answer.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the isolated `Shape`/`Circle`/`Triangle` example, which
demonstrates the identical `ABC` mechanics in a completely different
domain, proving the pattern generalizes beyond discounts:

```python
from abc import ABC, abstractmethod


class Shape(ABC):
    @abstractmethod
    def area(self):
        ...


class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return 3.14159 * self.radius ** 2


circle = Circle(radius=2)
print("circle area:", circle.area())


class Triangle(Shape):
    def __init__(self, base, height):
        self.base = base
        self.height = height


try:
    t = Triangle(base=4, height=3)
except TypeError as e:
    print("TypeError:", e)
```

The real output:

```
circle area: 12.56636
TypeError: Can't instantiate abstract class Triangle without an implementation for abstract method 'area'
```

`Circle`, satisfying the contract, constructs and computes correctly.
`Triangle`, forgetting `area`, never even gets constructed —
`ABC`'s real value made concrete, independent of whether it was the
right choice for `DiscountStrategy` specifically.

### Connecting Back

Where Lessons 61, 65, and 69 each built a real pattern by hand, solving
a real problem without ever naming it, this lesson names three patterns
retroactively and asks the question those earlier lessons never had to:
given a name and a textbook shape, does the actual problem in front of
you need that much structure, or does it need exactly what those earlier
lessons built — the smallest thing that solves it?

## Connect the Pieces

A 10%-off discount and a "no discount" case were both computed twice in
this lesson. First, through `DiscountStrategy` subclasses: correct
results, plus a real, caught mistake — `NoDiscount` forgetting `apply`,
refused at construction. Second, through plain functions: the identical
correct results, with "no discount" needing exactly one line, and no
class, no base, no contract to satisfy or forget.

## What Breaks Without This

Removing the class hierarchy removes its own real protection along with
its ceremony. A discount function with the wrong shape now fails only
when called, not when defined:

```python
def broken_discount(total):
    return total * (1 - 0.1)  # forgot the percent parameter entirely


def apply_discount(discount_fn, total, **kwargs):
    return discount_fn(total, **kwargs)


try:
    apply_discount(broken_discount, 100, percent=10)
except TypeError as e:
    print("TypeError:", e)
```

Run for real, this is what comes back:

```
TypeError: broken_discount() got an unexpected keyword argument 'percent'
```

The mistake is still caught — but only the moment `apply_discount`
actually tries to call it, at runtime, in whatever code path happens to
exercise this specific discount, rather than the instant the class was
defined the way `ABC` would have caught it. For three functions defined
and tested together in one file, that gap rarely matters in practice;
for a genuinely pluggable system where third-party code supplies new
strategies — Lesson 65's own registry, at real scale — that gap is
exactly the case where `ABC`'s upfront contract starts earning its
keep again.

## Exercises

1. Add a fourth discount, `tiered_discount(total, tiers)`, and call it
   through `apply_discount` with a deliberately wrong argument name.
   Confirm, with real output, exactly when the mistake is caught —
   immediately, or only when this specific function runs.
2. Rebuild `DiscountStrategy` as an `ABC` one more time, but give
   `apply` a *default* implementation (no `@abstractmethod`) instead of
   an abstract one. Does `NoDiscount()`, with no `apply` override, still
   fail? What does that prove about what `@abstractmethod` specifically
   was contributing versus the base class alone?
3. Lesson 65's payment-method registry and this lesson's discount
   functions are both instances of the Strategy pattern, built two
   different ways in two different lessons. Write two or three sentences
   comparing them: which one actually needed `ABC`-style enforcement,
   and why did the other one not need it even though it's solving the
   same shape of problem?

## Definition of Done

- [ ] `PercentageDiscount`/`FixedDiscount`/`NoDiscount` and
      `DiscountStrategy` have been built and run for real, including the
      `NoDiscount` construction failure, before deciding whether to keep
      them.
- [ ] The function-based replacement has been run against the identical
      three cases and produces output matching what's pasted here.
- [ ] The "What Breaks Without This" `broken_discount` scenario has been
      run against your own file, not just read.
- [ ] You can name, in one sentence each, which real problem each of
      Lesson 61's Observer pattern, Lesson 65's Registry pattern, and
      this lesson's Strategy pattern actually solves.
- [ ] Commit, with a message stating *why*: something like `patterns:
      replace DiscountStrategy's ABC hierarchy with plain functions,
      since three one-line discounts never needed formal enforcement`,
      not `simplify discount code`.

Up next: Lesson 71, Pattern Selection — closing this domain by turning
this lesson's one comparison into a real, repeatable judgment for
choosing between structure and simplicity, before this domain hands off
to Architecture.
