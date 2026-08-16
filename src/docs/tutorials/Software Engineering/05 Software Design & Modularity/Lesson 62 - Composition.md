# Lesson 62: Composition

**What you will build.** `Order` needs to format a receipt header, and
the fastest way to reuse existing formatting code is to make `Order`
inherit from `InvoiceFormatter`. It works, right up until
`InvoiceFormatter`'s own `__init__` — which `Order.__init__` never calls
— leaves `format_header` reaching for a `self.currency_symbol` that was
never set, breaking with `AttributeError` on a method `Order` never
wrote a line of. This lesson replaces the inheritance with composition:
`Order` holds its own `InvoiceFormatter` instance as a private
attribute, and delegates to it explicitly through its own method. The
transferable problem: inheritance doesn't just reuse behavior, it makes
a semantic claim — "an `Order` *is a* kind of `InvoiceFormatter`" — that
was never true, and that false claim is exactly what let a formatter's
own initialization contract silently become `Order`'s problem too.

**What you need to know first.** Encapsulation (Lesson 54) — bundling
data with the behavior allowed to touch it; this lesson asks whether
*inheriting* another class's behavior is the same kind of bundling, or a
different, riskier one. Interface Design (Lesson 55) — a class's public
interface as a real promise; inheritance, this lesson shows, hands a
subclass the *entire* parent interface, wanted or not.

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

Still the **Design** stage. Carried through: the last several lessons
governed relationships *between* modules; this lesson and the next few
turn to relationships between *objects* within one module — the same
questions (how much does one thing need to know about another, what
does a relationship actually claim) asked one level down.

**Terms introduced in this lesson.** One line each.

- **composition** — building an object by holding a reference to another
  object and delegating specific work to it, rather than inheriting that
  object's entire interface and behavior. It's named as the alternative
  to inheritance for the common case of "I want to reuse this other
  thing's behavior" without also claiming the "is-a" relationship
  inheritance implies.
- **is-a versus has-a** — the semantic claim a relationship between two
  types actually makes. Inheritance says the subclass *is a* kind of the
  parent — every place the parent type is expected, the subclass should
  work correctly too. Composition says the containing object *has a*
  reference to the other, uses some of its behavior, without claiming to
  be interchangeable with it anywhere the parent type is expected.

**Objects and methods used.** None new — this lesson's fix uses ordinary
attribute assignment and method calls, both already established; what's
new is the relationship they form, covered in this lesson's own Concept
Unit.

## Concept Unit: Reusing Behavior Is Not the Same as Being a Kind Of

### The Problem

`Order` needs to reuse `InvoiceFormatter`'s header-formatting logic. The
fastest path is inheritance:

```python
class InvoiceFormatter:
    def __init__(self, currency_symbol="$"):
        self.currency_symbol = currency_symbol

    def format_header(self, title):
        return f"{self.currency_symbol} === {title} ==="


class Order(InvoiceFormatter):
    def __init__(self, order_id, customer_id):
        self.order_id = order_id
        self.customer_id = customer_id
        self.status = "pending"


order = Order(order_id=501, customer_id=17)
print(order.format_header("RECEIPT"))
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
AttributeError: 'Order' object has no attribute 'currency_symbol'
```

`Order.__init__` never calls `InvoiceFormatter.__init__` — nothing
required it to, and nothing about writing `class Order(InvoiceFormatter):`
signals that it should have. `format_header`, inherited "for free," is
only correct if `InvoiceFormatter`'s own setup already ran, and `Order`
never ran it. Worse, this relationship makes a claim that was never
true:

```python
print("order is-a InvoiceFormatter:", isinstance(order, InvoiceFormatter))
```

Run for real, this is what comes back:

```
order is-a InvoiceFormatter: True
```

Any code elsewhere in a real system that checks `isinstance(x,
InvoiceFormatter)` to decide "is this a real invoice-formatting object"
would now accept an `Order` too — not because an order genuinely is one,
but because inheritance was reached for as a shortcut to reuse one
method.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `Order` example, not a port of an external
  reference codebase.
- **Files affected:** `orders.py`, modified.
- **Change type:** refactor — `Order` stops inheriting from
  `InvoiceFormatter` and holds an instance of it instead.
- **Location:** `Order`'s class declaration and `__init__`; a new
  `receipt_header` method replacing the inherited `format_header`.
- **Dependencies:** none.

### The New Code

The smallest new piece is the composed instance itself:

```python
self._formatter = InvoiceFormatter()
```

### The Updated Project

`Order` drops the inheritance entirely, holds its own formatter, and
exposes a method of its own that delegates to it:

```python
class Order:                                                   # ← changed, no longer (InvoiceFormatter)
    def __init__(self, order_id, customer_id):
        self.order_id = order_id
        self.customer_id = customer_id
        self.status = "pending"
        self._formatter = InvoiceFormatter()                     # ← new

    def receipt_header(self):                                    # ← new
        return self._formatter.format_header(f"ORDER {self.order_id}")  # ← new
```

`Order` constructs its own `InvoiceFormatter`, correctly, with whatever
arguments it needs — no fragile assumption about whether some ancestor
class's `__init__` happened to run. `receipt_header` is a real method on
`Order`, with a name specific to what `Order` actually needs, rather than
inheriting `format_header`'s exact name and signature unchanged.

### Isolating the Concept: Holding a Reference Instead of Extending a Class

The mechanism doing the real work above — an object holding another
object as an attribute and calling its methods explicitly, instead of
inheriting from it — deserves to be seen on its own. Here it is giving a
`Car` an `Engine` instead of making `Car` a kind of `Engine`:

```python
class Engine:
    def __init__(self, horsepower):
        self.horsepower = horsepower

    def start(self):
        return f"engine started, {self.horsepower}hp"


class Car:
    def __init__(self, model, horsepower):
        self.model = model
        self.engine = Engine(horsepower)

    def start(self):
        return f"{self.model}: {self.engine.start()}"


car = Car(model="Model X", horsepower=300)
print(car.start())
print("car is-a Engine:", isinstance(car, Engine))
```

Running it produces:

```
Model X: engine started, 300hp
car is-a Engine: False
```

This is exactly what `Order` and `InvoiceFormatter` are doing above,
isolated: a `Car` genuinely *has an* `Engine` — that's a true fact about
a car — but a car is not *a kind of* engine, and `isinstance` correctly
says so. `Car.start` delegates to `self.engine.start()` explicitly,
naming exactly which behavior it's reusing, rather than inheriting every
method `Engine` happens to have. This throwaway example is now
discarded; `Car` and `Engine` do not appear anywhere else in this lesson
or this project again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`class Order:`** — no longer `class Order(InvoiceFormatter):`; the
  parenthesized parent is simply gone, meaning `Order` is once again an
  ordinary class with no inheritance relationship to anything.
- **`self._formatter = InvoiceFormatter()`** — an ordinary instance
  attribute assignment, storing a freshly constructed `InvoiceFormatter`
  object, built correctly with its own `__init__` running as intended,
  because `Order` is the one calling it directly, on purpose, rather than
  relying on it running implicitly as part of some inherited setup.
- **`def receipt_header(self): return self._formatter.format_header(...)`**
  — a new method on `Order`, with its own name, whose entire body is one
  delegated call to the composed formatter. `Order`'s own public
  interface now contains exactly `receipt_header`, not `format_header`
  and whatever else `InvoiceFormatter` might expose — only what `Order`
  deliberately chose to expose.

### CS Lens

This is the classic distinction between **is-a** and **has-a**
relationships in object-oriented design: inheritance models "is a kind
of," and is only correct when every operation valid on the parent is
genuinely valid on the child too — the Liskov Substitution guarantee a
later lesson in this curriculum names formally. Composition models "has
a," and makes no such promise — it only says one object uses another's
behavior, through a reference, without claiming to be substitutable for
it anywhere the other type is expected. The often-repeated design
guidance "favor composition over inheritance" exists specifically
because inheritance is reached for as a code-reuse shortcut far more
often than an "is-a" relationship is actually, honestly true — this
lesson's own `Order`/`InvoiceFormatter` example is exactly that
shortcut, caught.

Also recognized in: a `Stack` implemented by holding a `list`
internally rather than inheriting from `list` (inheriting would expose
every list method, including ones that violate a stack's own
last-in-first-out contract), a UI `Button` widget that holds a
`ClickHandler` rather than being one, and dependency-injection
containers, which are built entirely around passing collaborators in as
held references instead of inheriting their behavior.

### SE Lens

The principle is **reuse behavior without inheriting a false identity**
— the alternative that was rejected, inheriting from `InvoiceFormatter`
purely to reuse `format_header`, isn't wrong because inheritance itself
is bad; it's wrong because `Order` never satisfied the actual promise
inheritance makes, and nothing in Python's own syntax forces a
programmer to check that promise before writing `class Order
(InvoiceFormatter):`. The real cost of the fix: `Order.receipt_header`
has to be written and maintained as its own method, rather than
inherited automatically — a small, real amount of extra code, in
exchange for `Order`'s public interface only ever containing what
`Order` actually means to expose, and never silently including
`InvoiceFormatter`'s entire interface, initialization requirements, and
identity along with it.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the fixed `Order`, exercising the exact call that crashed
before:

```python
order = Order(order_id=501, customer_id=17)
print(order.receipt_header())
print("order is-a InvoiceFormatter:", isinstance(order, InvoiceFormatter))
```

The real output:

```
$ === ORDER 501 ===
order is-a InvoiceFormatter: False
```

The header formats correctly, using an `InvoiceFormatter` that was
constructed properly, on purpose, by `Order` itself — no reliance on an
inherited `__init__` running implicitly. `isinstance` now correctly
reports `False`: an `Order` was never really a kind of
`InvoiceFormatter`, and this version of the code no longer claims
otherwise.

### Connecting Back

Where Lesson 61 let one module react to another without depending on it
directly, this lesson lets one object reuse another's behavior without
claiming to *be* it — both are the same underlying discipline, making a
relationship's real shape match what's actually claimed about it in
code.

## Connect the Pieces

`Order.__init__` ran twice in this lesson, building the identical order
`501` both times. First, with `Order` inheriting from
`InvoiceFormatter`: construction succeeded, but calling the inherited
`format_header` crashed, because `InvoiceFormatter.__init__` never ran,
and `isinstance` falsely reported the order as a kind of formatter.
Second, with `Order` composing an `InvoiceFormatter` as its own
attribute: `receipt_header` succeeded cleanly, because `Order` built its
formatter correctly itself, and `isinstance` correctly reported `False`
— the relationship composition actually claims.

## What Breaks Without This

Composition fixes the specific relationship between `Order` and
`InvoiceFormatter`. It says nothing about what happens if
`InvoiceFormatter` itself changes in a way `Order` doesn't expect:

```python
class InvoiceFormatter:
    def __init__(self, currency_symbol="$", locale="en-US"):
        self.currency_symbol = currency_symbol
        self.locale = locale

    def format_header(self, title):
        if self.locale != "en-US":
            raise NotImplementedError("only en-US formatting is supported so far")
        return f"{self.currency_symbol} === {title} ==="


order = Order(order_id=501, customer_id=17)
print(order.receipt_header())
```

Run for real, this is what comes back:

```
$ === ORDER 501 ===
```

This still works — `Order` never asked for a specific `locale`, and
`InvoiceFormatter`'s new default, `"en-US"`, happens to be safe. But
`Order`'s own `receipt_header` has no idea `InvoiceFormatter` gained a
new parameter at all, and would break the moment anyone constructs an
`Order` needing a different one — composition removed the false is-a
claim, and the fragile-`__init__`-ordering bug that came with it; it
never removed `Order`'s real, ordinary dependency on
`InvoiceFormatter`'s own interface staying compatible, the same
dependency-surface question Lesson 56 already named.

## Exercises

1. Add a `locale` parameter to `Order.__init__`, passed through to the
   `InvoiceFormatter` it constructs, so a caller can actually request a
   non-default locale instead of always getting `InvoiceFormatter`'s own
   default.
2. Write a `ReceiptPrinter` class that composes an `Order` (not the
   other way around) to produce a full, multi-line receipt string using
   `order.receipt_header()` plus a line per item in `order.lines`.
   Confirm `isinstance(printer, Order)` is `False`.
3. Name one relationship elsewhere in this domain's own running example
   — `Order`/`OrderLine`, `Customer`/`Order` — and decide, using this
   lesson's is-a/has-a test, whether it's correctly modeled as
   composition already, or whether it was ever at risk of being modeled
   as inheritance instead.

## Definition of Done

- [ ] `Order` no longer inherits from `InvoiceFormatter`; it holds one as
      `self._formatter`.
- [ ] `receipt_header` exists as `Order`'s own method, delegating to the
      composed formatter.
- [ ] The Problem section's `AttributeError` and incorrect `isinstance`
      result have both been reproduced for real, against the
      *original*, inheriting version, before you apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here.
- [ ] Commit, with a message stating *why*: something like `composition:
      give Order its own InvoiceFormatter instead of inheriting from it,
      so isinstance and initialization both reflect the real
      relationship`, not `fix isinstance check`.

Up next: Lesson 63, Substitution — the formal rule for exactly when
inheritance's is-a claim is actually safe to make, for the cases this
lesson's own composition fix was deliberately avoiding rather than
solving.
