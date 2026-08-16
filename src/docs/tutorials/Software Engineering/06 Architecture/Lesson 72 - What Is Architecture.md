# Lesson 72: What Is Architecture?

**What you will build.** `arch_order.py` imports `reserve_stock` from
`arch_inventory.py` to reserve stock the moment an order is paid — a
perfectly ordinary, Domain-5-correct dependency, checked and pointed
deliberately. Separately, `arch_inventory.py` imports `Order` from
`arch_order.py` to build a return record — also, on its own, a
perfectly ordinary dependency. Neither engineer who wrote either import
did anything Domain 5 would flag. Importing either module on its own now
crashes: `ImportError: cannot import name 'Order' from 'arch_order'` —
a circular dependency neither individual decision was wrong enough, by
itself, to catch. This lesson fixes it by deciding, once, which
direction the dependency between these two subsystems is allowed to
point at all — `arch_order` may depend on `arch_inventory`,
`arch_inventory` may never depend on `arch_order` — and rewriting
`restock_from_return` to take a plain `order_id` instead of needing
`Order` at all. The transferable problem: Domain 5 gives real tools for
judging *one* dependency at a time; nothing in it asks what the *whole
system's* major parts are, or which of them are allowed to depend on
which others, before any individual dependency is even written.

**What you need to know first.** Stable Dependencies (Lesson 60) — the
instability calculation this lesson's fix applies at a larger scale;
`arch_inventory` earns the role of the more stable subsystem the same
way `order_lifecycle.py` did within Domain 5's own smaller example.
Dependency Direction (Lesson 57) — the specific, pairwise fix this
lesson's problem shows two individually-reasonable pairwise decisions
combining into a failure neither one alone would have caused.

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

This is the first lesson in this curriculum to work inside the
**Architecture** stage, having just closed out the *Design* stage in the
previous domain. Carried through: Domain 5 answered "how should this one
module, or this one pair of modules, be built and related"; this domain,
starting here, answers a question Domain 5 never asked — "what are this
system's major parts, and what's the rule for how they're allowed to
depend on each other, decided once, for the whole system, before any
individual module is written."

**Terms introduced in this lesson.** One line each.

- **architecture** — the largest-scale structural decisions in a system:
  what its major parts are, and how those parts are allowed to depend on
  each other. It's distinguished from Domain 5's design decisions by
  scope: design governs how *one* part is built internally; architecture
  is decided once, deliberately, for the *whole* system, and every
  module-level decision inside a given part has to live within it.
- **architectural boundary** — a line drawn between two major parts of a
  system, at the scale of "which subsystem is this" rather than "which
  class or module is this," with an explicit, decided rule for which
  side is allowed to depend on the other. It's distinguished from
  Domain 5's own module boundaries by the fact that Domain 5's tools —
  checking one dependency, one pair at a time — have no way to see
  across it; only a decision made about the whole system's shape can.

**Objects and methods used.** None new — `import` and `from ... import`
are already established; what's new is the system-wide decision this
lesson makes about which subsystem gets to use them on which other one.

## Concept Unit: Two Correct Decisions, One Undecided System

### The Problem

`arch_order.py` needs to reserve stock when an order is paid:

```python
from arch_inventory import reserve_stock


class Order:
    def __init__(self, order_id):
        self.order_id = order_id
        self.status = "pending"

    def mark_paid(self):
        reserve_stock(self.order_id)
        self.status = "paid"
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Separately, `arch_inventory.py` needs to
build a return record referencing the real `Order` that's being
restocked:

```python
from arch_order import Order


def reserve_stock(order_id):
    return f"reserved stock for order {order_id}"


def restock_from_return(order_id):
    order = Order(order_id)
    return f"restocked from return of order {order.order_id}"
```

Neither file, read on its own, does anything Domain 5 would flag —
each import is a real, needed dependency, pointed at a real, used name.
Importing either one at all:

```python
try:
    import arch_order
    print("imported fine")
except ImportError as e:
    print("ImportError:", str(e).split(" (consider")[0])
```

Running it produces:

```
ImportError: cannot import name 'Order' from 'arch_order'
```

(Python's own full message names the exact file path involved; this
lesson trims that part for readability, since the message's substance —
a name that couldn't be resolved — is what matters, not the specific
absolute path on this one machine.) `arch_order.py` needs
`arch_inventory` to finish loading before it can finish loading itself;
`arch_inventory.py` needs `arch_order` to finish loading before *it* can
finish loading. Neither can go first. This is a **circular dependency**,
and it wasn't caused by either individual import being wrong — it was
caused by nobody ever deciding, for the system as a whole, which of
these two subsystems is allowed to depend on the other.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** `arch_inventory.py`, modified to remove its
  dependency on `arch_order`.
- **Change type:** refactor — `restock_from_return` takes a plain
  `order_id` instead of constructing an `Order`.
- **Location:** `arch_inventory.py`'s own top-level import and
  `restock_from_return`'s own body.
- **Dependencies:** none — this fix removes a dependency.

### The New Code

The smallest new piece is the decision itself, made explicit as a rule
before any code changes: `arch_order` may depend on `arch_inventory`;
`arch_inventory` may never depend on `arch_order`. The code that
satisfies it:

```python
def restock_from_return(order_id):
    return f"restocked from return of order {order_id}"
```

### The Updated Project

`arch_inventory.py` loses its import of `arch_order` entirely, and
`restock_from_return` no longer needs an `Order` instance to do its own
job:

```python
def reserve_stock(order_id):
    return f"reserved stock for order {order_id}"


def restock_from_return(order_id):                              # ← changed
    return f"restocked from return of order {order_id}"           # ← changed, no Order construction
```

`arch_order.py` keeps its own import of `reserve_stock` unchanged —
that direction was always correct. Only `arch_inventory.py`'s side of
the relationship changes, because the architectural decision names it,
specifically, as the side that isn't allowed to depend on the other.

### Isolating the Concept: A Decision Made Once, Not Rediscovered Per Import

The mechanism this lesson demonstrates — deciding a dependency's
direction for two entire subsystems at once, rather than catching each
individual import after the fact — is shown directly through the real
project code above rather than a separate, unrelated example, since a
circular import is, structurally, already the smallest possible
demonstration of what happens without an architectural decision. Running
the fixed pair together:

```python
order = Order(order_id=501)
order.mark_paid()
print("status:", order.status)
print(restock_from_return(501))
```

Running it produces:

```
status: paid
restocked from return of order 501
```

Both operations succeed, in the same program, with `arch_inventory.py`
never once importing anything from `arch_order.py`. The fix wasn't
finding and reversing one bad import — it was deciding, for the whole
relationship between these two subsystems, which direction is allowed at
all, so that no future addition to either file can recreate the cycle
by adding a new import Domain 5's own pairwise checks would have called
individually reasonable.

### Mechanical Walkthrough

Working through what actually changed:

- **the removed `from arch_order import Order` line** — deleting this
  import is the substantive fix; `arch_inventory.py` no longer has any
  name bound to anything in `arch_order.py`'s namespace.
- **`restock_from_return(order_id)`'s new parameter** — accepts the
  identifier it actually needs, `order_id`, instead of an entire `Order`
  object it only ever used for that same identifier. This is the same
  shape Lesson 69's boundary objects already used: taking exactly the
  fact needed, not the whole object it happened to be reachable from.

### CS Lens

This is a **circular dependency**, the identical failure mode a
compiler's own module system, a build system's dependency graph, or a
package manager's install order all have to detect and refuse — any
system built from parts that reference each other has to form a
directed graph with no cycles, or nothing in it can be built, loaded, or
reasoned about first. Python's own import system happens to allow some
circular imports to succeed by accident, depending on exactly which
names are needed before the cycle completes — which is arguably worse
than a hard failure, because it means the *same* circular structure can
work today and break tomorrow, the moment an unrelated change shifts
which name is needed first.

Also recognized in: two database tables each having a required foreign
key referencing the other, making it impossible to insert the first row
into either one; two build targets each listing the other as a
prerequisite; and two teams' services each calling one another
synchronously, meaning neither can start up without the other already
being up.

### SE Lens

The principle is **decide the shape of the whole system before any one
dependency inside it is written, not after one breaks** — the
alternative that produced this lesson's own bug wasn't carelessness; two
individually well-reasoned engineers each made a locally correct
decision, using exactly the judgment Domain 5 spent twenty lessons
building, and the combination still failed, because Domain 5's tools
were never designed to see the whole system's shape, only one
relationship at a time. The real cost of an architectural decision: it
has to be made explicit somewhere durable — not just fixed in code once
a cycle is discovered, the way this lesson's own fix was applied, but
written down and enforced going forward, so the *next* engineer adding a
dependency between these two subsystems knows the rule before writing
the import that would violate it.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py`, from the
directory containing both `arch_order.py` and `arch_inventory.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom, importing whatever local modules it names
along the way.

### Run It

Importing the fixed pair together and exercising both operations:

```python
import arch_order
import arch_inventory

order = arch_order.Order(order_id=501)
order.mark_paid()
print("status:", order.status)
print(arch_inventory.restock_from_return(501))
```

The real output:

```
status: paid
restocked from return of order 501
```

Both subsystems work correctly, together, in the same program — the
identical two operations the broken version was trying to support, now
succeeding because the dependency between them points exactly one way,
decided once, rather than accumulating in whichever direction each new
feature happened to need it.

### Connecting Back

Where Domain 5 gave real tools for judging one dependency's direction at
a time, this lesson is the first place this curriculum decides a
dependency's direction for two entire subsystems at once — the same
underlying judgment, now made at the scale this domain exists to work
at.

## Connect the Pieces

Marking order `501` paid and restocking it from a return were both
attempted twice in this lesson. First, with `arch_inventory.py`
importing `Order` directly: neither module could even be imported,
`ImportError`, before either operation ever ran. Second, with the
dependency's direction decided — `arch_order` may depend on
`arch_inventory`, never the reverse — and `restock_from_return`
rewritten to need only an `order_id`: both operations succeeded, in the
same program, with the architectural decision never needing to be
rediscovered by whoever wrote either file.

## What Breaks Without This

Deciding this one boundary's direction doesn't decide every boundary a
growing system will eventually have. A third subsystem, added later,
without anyone extending the same decision to it, can recreate the
identical failure in a new pair:

```python
# a hypothetical arch_returns.py, added later
from arch_inventory import restock_from_return
from arch_order import Order  # reaches back across the same kind of boundary again
```

Nothing about fixing `arch_order`/`arch_inventory`'s own cycle stops a
third file from importing both in a way that recreates the identical
problem with a new pair of subsystems. Naming one architectural boundary
protects that one boundary; it doesn't install anything that
automatically extends the same discipline to every future subsystem a
growing system adds — that's a decision, and an enforcement mechanism,
this domain's own later lessons exist to build.

## Exercises

1. Add a third subsystem, `arch_returns.py`, that needs to call both
   `arch_inventory.restock_from_return` and read an order's status.
   Decide, using this lesson's own rule (`arch_order` may depend on
   `arch_inventory`, never the reverse), which direction
   `arch_returns.py`'s own dependency on `arch_order` should point, and
   write it so no cycle is possible.
2. `arch_order.mark_paid` still imports `reserve_stock` directly from
   `arch_inventory`. Using Lesson 61's dependency inversion technique,
   rewrite it so `arch_order` never imports `arch_inventory` at all, and
   decide whether that's actually a better architecture for this
   specific pair, or unnecessary structure for a dependency direction
   that was already correct.
3. Write down, in two or three sentences, the real difference between
   what Lesson 57 (Dependency Direction) fixed and what this lesson
   fixed. Both involve "which way should an import point" — what's
   actually different about the scale each one operates at?

## Definition of Done

- [ ] `arch_inventory.py` has no import of `arch_order` anywhere in it.
- [ ] `restock_from_return` takes a plain `order_id`, not an `Order`.
- [ ] The Problem section's `ImportError` has been reproduced for real,
      against the *original*, circular version, before you apply the
      fix.
- [ ] The "Run It" scenario above runs against your own fixed files and
      produces output matching what's pasted here.
- [ ] You can state, in one sentence, the architectural rule this lesson
      decided for `arch_order` and `arch_inventory`.
- [ ] Commit, with a message stating *why*: something like `architecture:
      decide arch_order may depend on arch_inventory but never the
      reverse, and remove the import that violated it`, not `fix
      circular import`.

Up next: Lesson 73, Architectural Drivers — what actually decides which
direction a boundary like this one should point, before a cycle forces
the question.
