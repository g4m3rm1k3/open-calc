# Lesson 56: Dependency

**What you will build.** `order_lifecycle.Order.__init__` gains a new
required parameter, `placed_by`. A `checkout` function that constructs
`Order` objects directly breaks immediately, `TypeError`, missing
argument. A `cancellable_orders` reporting function, importing the exact
same module, doesn't break at all — it never constructs an `Order`
itself, only receives already-built ones and calls `can_transition` on
them. Both functions `import order_lifecycle`. Only one of them actually
*depends on* `Order.__init__`'s signature. This lesson names that
distinction precisely: a dependency is a relationship one piece of code
has with specific behaviors of another, not with the module as a whole,
and two modules that import the identical thing can have completely
different dependency surfaces on it.

**What you need to know first.** What Is a Module? (Lesson 52) — import
as the mechanism; this lesson distinguishes it from dependency, the
actual relationship the mechanism is used to build. Information Hiding
(Lesson 53) — `can_transition` as the interface `order_lifecycle.py`
actually promises to keep stable; this lesson names what it means for
other code to rely on that promise, precisely.

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

Still the **Design** stage. Carried through: every lesson so far in this
domain protected one specific relationship between pieces of code —
naming, hiding, encapsulating, or shaping an interface. This lesson
names the relationship itself, precisely, before the next several
lessons in this domain reason about which direction it should point and
how tightly it should bind.

**Terms introduced in this lesson.** One line each.

- **dependency** — a relationship where one piece of code requires
  another to exist and behave a certain way in order to work correctly
  itself. It's distinguished from "imports" on purpose: a module can
  `import` another module in full while depending on only a small,
  specific part of it — the import is a fact about source code; the
  dependency is a fact about which of the imported module's behaviors
  the importing code would actually break without.
- **dependency surface** — the specific set of names, signatures, and
  behaviors one piece of code actually relies on from another, which is
  often much smaller than everything the other module exposes. It's
  worth naming because it turns a vague question — "does this change
  affect anything that imports this module" — into a precise one: "does
  this change touch anything actually inside anyone's dependency
  surface."

**Objects and methods used.** None new — this lesson's demonstration
reuses `Order.__init__` and `can_transition`, both already established,
to show two different relationships to the same module.

## Concept Unit: Importing a Module Is Not the Same as Depending on It

### The Problem

`order_lifecycle.py`'s maintainer adds a new required field to `Order` —
`placed_by`, tracking which channel created the order (web, phone,
in-store). Two other functions both `import order_lifecycle`. A
`checkout` function constructs orders directly:

```python
def checkout(customer_id):
    return order_lifecycle.Order(order_id=501, customer_id=customer_id)


try:
    order = checkout(17)
    print("checkout succeeded")
except TypeError as e:
    print("checkout TypeError:", e)
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it against the updated `Order`
produces:

```
checkout TypeError: Order.__init__() missing 1 required positional argument: 'placed_by'
```

`checkout` breaks immediately — it depended on `Order.__init__`'s exact
parameter list, and that list changed. Now the reporting function from
Lesson 53, importing the identical module, run against an `Order` that
was already correctly constructed elsewhere:

```python
def cancellable_orders(orders):
    return [
        order.order_id
        for order in orders
        if order_lifecycle.can_transition(order.status, order_lifecycle.OrderStatus.CANCELLED)
    ]


existing_order = order_lifecycle.Order(order_id=502, customer_id=18, placed_by="web")
print("reporting still works on an existing order:", cancellable_orders([existing_order]))
```

The real output:

```
reporting still works on an existing order: [502]
```

`cancellable_orders` didn't break. It never called `Order(...)` itself —
it only ever receives `Order` objects someone else already built, and
calls `can_transition` and reads `.status`/`.order_id` on them, none of
which changed. Both functions `import order_lifecycle`. Only `checkout`
actually *depends on* `Order.__init__`'s signature; `cancellable_orders`
depends on `can_transition` and on `Order` having a `.status` and an
`.order_id` — a completely different, and in this case smaller, set of
facts about the same module.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `Order` example, not a port of an external
  reference codebase.
- **Files affected:** `order_lifecycle.py` (the change that exposes the
  distinction); `checkout.py` and the reporting module (unchanged
  themselves, but their reaction to the change is this lesson's actual
  subject).
- **Change type:** add — a new required parameter, `placed_by`, on
  `Order.__init__`.
- **Location:** `Order.__init__`'s parameter list.
- **Dependencies:** none.

### The New Code

The smallest new piece is the parameter itself:

```python
def __init__(self, order_id, customer_id, placed_by):
    ...
    self.placed_by = placed_by
```

### The Updated Project

`Order.__init__` gains the new parameter and stores it; nothing else
about `Order`, `can_transition`, or `_ORDER_TRANSITIONS` changes at all:

```python
class Order:
    def __init__(self, order_id, customer_id, placed_by):   # ← changed
        self.order_id = order_id
        self.customer_id = customer_id
        self.placed_by = placed_by                            # ← new
        self.status = OrderStatus.PENDING

    def transition_to(self, new_status):
        if not can_transition(self.status, new_status):
            raise InvalidTransition(f"{self.status} cannot transition to {new_status}")
        self.status = new_status


def can_transition(current_status, target_status):
    return target_status in _ORDER_TRANSITIONS[current_status]
```

One constructor parameter added; every other name `order_lifecycle.py`
exposes — `can_transition`, `OrderStatus`, `_ORDER_TRANSITIONS` (private
regardless) — is untouched, which is exactly why only code that
constructs `Order` objects directly is affected by this specific change.

### Mechanical Walkthrough

Working through the one new syntactic element in the code above:

- **`placed_by`** — a new, ordinary, required parameter added to
  `Order.__init__`'s existing parameter list, stored on `self` the same
  way `order_id` and `customer_id` already are. Nothing about this
  parameter is special syntax; what makes it worth a full walkthrough
  entry isn't its own mechanics, it's that adding *any* required
  parameter to an existing, widely-constructed class is exactly the kind
  of change whose real impact can only be judged by knowing who actually
  depends on the constructor's shape — which is precisely what this
  lesson's two functions, run side by side, make concrete instead of
  asserted.

### CS Lens

This is the distinction between a **coupling relationship declared in
source** (an `import` statement) and the **actual runtime dependency
surface** a piece of code exercises against what it imports — the same
gap a static analysis tool has to bridge when it tries to compute a real
"blast radius" for a proposed change: naively, every file that imports
`order_lifecycle` looks equally at risk; in reality, only the ones
touching the specific names that changed are. Call graphs and dependency
graphs in real tooling are built specifically to compute this narrower,
more useful relationship instead of stopping at the coarser "who imports
this file" question.

Also recognized in: semantic versioning's own distinction between a
package's full source and its declared public API (only changes to the
latter are supposed to require a major version bump), a database
migration tool computing which queries actually reference a column
being dropped rather than assuming every query against the table is at
risk, and a refactoring IDE's "find usages" feature, which locates the
real dependency surface of a symbol rather than every file that happens
to import its containing module.

### SE Lens

The principle is **know precisely what you depend on, not just what you
import** — the alternative, treating "imports this module" and "depends
on this module" as the same fact, leads to a real, common overreaction:
treating every change to a widely-imported module as equally risky to
every one of its importers, when in this lesson's own example, one of
two importers wasn't affected at all. That overreaction has a real cost
of its own — reviewing, testing, or coordinating a change against code
that was never actually going to break wastes real effort — but the
opposite mistake, assuming a change is safe because "it's just adding a
parameter" without checking who actually constructs the thing directly,
is the one that ships a real break. This lesson's own two functions are
small enough to reason about by eye; a real codebase with hundreds of
importers can't be, which is exactly why the next several lessons in
this domain build real vocabulary and real techniques for managing this
relationship deliberately instead of trusting anyone to track it by
memory.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running both functions against the updated module in the same script:

```python
try:
    order = checkout(17)
    print("checkout succeeded")
except TypeError as e:
    print("checkout TypeError:", e)

existing_order = order_lifecycle.Order(order_id=502, customer_id=18, placed_by="web")
print("reporting still works on an existing order:", cancellable_orders([existing_order]))
```

The real output:

```
checkout TypeError: Order.__init__() missing 1 required positional argument: 'placed_by'
reporting still works on an existing order: [502]
```

Both lines are real consequences of the exact same one-parameter change,
run against two different pieces of code that both import the same
module. The difference between them isn't luck — it's precisely which
part of `order_lifecycle`'s surface each one actually touches.

### Connecting Back

Where Lesson 53 decided which of a module's names are safe to depend on
at all, this lesson names what "depend on" itself actually means —
setting up the next several lessons' real question: given that
dependencies exist and are sometimes unavoidable, which *direction*
should they point, and how tightly should they bind.

## Connect the Pieces

`order_lifecycle.py` changed once — one new required parameter on
`Order.__init__` — and two functions that both import it reacted
differently, for a precise, checkable reason. `checkout`, which
constructs `Order` objects directly, broke immediately with a clear
`TypeError`. `cancellable_orders`, which only ever receives already-built
`Order` objects and calls `can_transition` on them, kept working,
producing the identical correct answer it always did. Neither outcome
was about how each function happened to be written stylistically — both
were a direct, provable consequence of which specific names each one's
own code actually touches.

## What Breaks Without This

Believing "imports the module" and "depends on the module" mean the
same thing leads to exactly the wrong conclusion about which code needed
fixing after this lesson's own change:

```python
def modules_that_need_fixing_naively():
    importers = ["checkout.py", "reporting.py"]
    return importers  # naive: "both import order_lifecycle, both are at risk"
```

Treating both as equally broken means reviewing, testing, or rewriting
`reporting.py` for a break that was never going to happen — real,
wasted effort spent on the wrong file, while the actual fix `checkout.py`
needs (supplying a real `placed_by` value) gets no more attention than
the false alarm sitting right next to it. The fix for *this* gap isn't
more code — it's the discipline this lesson's own two functions already
demonstrated: check the real dependency surface, not the import list,
before deciding what a change actually put at risk.

## Exercises

1. Add a third function, `resend_confirmation_email(order)`, that only
   reads `order.customer_id` and `order.order_id`. Predict, before
   running anything, whether it breaks against the `placed_by` change —
   then prove your prediction with real code and real output.
2. `cancellable_orders` depends on `Order` having a `.status` and an
   `.order_id`, and on `can_transition` existing. Write down its full
   dependency surface as a short list, the same precision this lesson
   used for `checkout`'s.
3. Imagine `order_lifecycle.py` instead *removed* `OrderStatus.RETURNED`
   entirely, rather than adding a parameter. Name, without running
   anything yet, which of this lesson's two functions you'd expect to be
   affected, and why — then check your reasoning by actually trying it.

## Definition of Done

- [ ] `Order.__init__` requires `placed_by`, and `self.placed_by` is
      stored.
- [ ] Both `checkout` and `cancellable_orders` have been run for real
      against the changed module, reproducing the break and the
      non-break shown here.
- [ ] You can state, in one sentence each, `checkout`'s and
      `cancellable_orders`'s real dependency surfaces on
      `order_lifecycle`.
- [ ] Commit, with a message stating *why*: something like `dependency:
      add required placed_by to Order, breaking direct constructors but
      not code that only reads already-built orders`, not `add field to
      Order`.

Up next: Lesson 57, Dependency Direction — given that a dependency
exists, which way should it point, and what goes wrong when that choice
is left to accident.
