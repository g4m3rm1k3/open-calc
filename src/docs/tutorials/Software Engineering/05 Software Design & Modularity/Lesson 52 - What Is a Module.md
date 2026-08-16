# Lesson 52: What Is a Module?

**What you will build.** Two functions, both legitimately named
`is_active` — one asking whether an order hasn't finished its lifecycle
yet, one asking whether a customer has ordered recently — defined in the
same flat script. The second definition silently replaces the first,
and calling what looks like "the order one" actually calls the customer
one, crashing on a field orders don't have. This lesson splits the two
into their own files, `order_lifecycle.py` and `customer_activity.py`,
and shows both `is_active` functions coexisting correctly, reached
through each module's own name. The transferable problem: a name only
means one thing within whatever namespace it's defined in, and a single
flat script forces every name in the entire program to share one
namespace — a module is what lets two things that both deserve the same
obvious name actually have it, without colliding.

**What you need to know first.** Domain Language (Lesson 51) — naming a
concept precisely, now applied one level up: not just what a function is
called, but which namespace it lives in. Aggregates (Lesson 49) — a
single object's own boundary between what's exposed and what's
internal; this lesson draws the same kind of boundary around an entire
file instead of one object. Bounded Contexts (Lesson 50) — two parts of
a system legitimately disagreeing about what a word means; a module is
one of the actual mechanisms a real codebase uses to let that happen
without collision.

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
**Design** stage, having just closed out the *Domain model* stage in the
previous domain. Carried through: the previous domain answered "what
concepts exist, and what rules do they follow" for `Order` and
`Customer`; this domain, starting here, answers a different question
about the exact same concepts — "what files do they live in, and how do
those files relate to each other" — a question the *Domain model* stage
never had to ask, because it was reasoning about concepts, not about
where those concepts' code actually sits on disk.

**Terms introduced in this lesson.** One line each.

- **module** — a single file (or package) of related code that owns its
  own separate namespace, importable and referenceable as one distinct
  unit by other code. It's named separately from "file" because a
  module's defining property isn't that it's stored on disk — it's that
  it creates a namespace boundary a single flat script doesn't have.
- **namespace** — a named context that maps identifiers, like a
  function's name, to the objects they actually refer to, kept separate
  from every other namespace. It's the concept doing the real work in
  this lesson: two functions can share the exact name `is_active`
  without conflict specifically because each lives in a different
  namespace, not because either name was written any differently.
- **module boundary** — the line between what a module exposes for other
  code to import and use, and what stays internal to it. It's named
  separately from Lesson 49's object-level privacy because a module's
  boundary protects an entire cluster of names — classes, functions,
  constants together — not one object's own fields.

**Objects and methods used.**

- **`import <module>`**
  - *What it is:* the statement that loads another file as a module and
    makes its namespace reachable through one name.
  - *Implementation:* `import order_lifecycle` runs `order_lifecycle.py`
    top to bottom exactly once, then binds the name `order_lifecycle`,
    in the importing file, to the resulting module object. Every name
    defined at that file's top level — `Order`, `OrderStatus`,
    `is_active` — becomes reachable as `order_lifecycle.Order`,
    `order_lifecycle.OrderStatus`, `order_lifecycle.is_active`.
  - *Its use:* this lesson uses it as the form of import that keeps both
    modules' `is_active` fully separate and unambiguous — calling
    `order_lifecycle.is_active(order)` can never be confused with
    `customer_activity.is_active(customer)`, because they're reached
    through two different names.
- **`from <module> import <name>`**
  - *What it is:* an alternate import form that pulls one specific name
    directly out of a module's namespace into the importing file's own
    namespace, rather than requiring the module's own name as a prefix.
  - *Implementation:* `from customer_activity import is_active` binds
    the bare name `is_active`, in the current file, to whatever
    `customer_activity.is_active` refers to at import time. A later line
    doing the identical thing for a different module's own `is_active`
    binds the same bare name again, silently replacing the first
    binding — both were ever bound to one shared, local name.
  - *Its use:* this lesson uses it specifically to prove that a module
    boundary alone doesn't prevent the collision from the Problem
    section — it only prevents it when code reaches across that boundary
    through the module's own name, not when it pulls a name directly
    into its own namespace instead.

## Concept Unit: A Namespace Is What Actually Prevents Collision

### The Problem

`Order` needs a way to ask "is this order still active" — not delivered,
cancelled, or returned yet. `Customer` needs a completely unrelated way
to ask "is this customer still active" — ordered recently. Both
questions have the same obvious name. In one flat script, here's what
happens when both get written:

```python
def is_active(order):
    return order.status not in {
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
        OrderStatus.RETURNED,
    }


# ... many lines of unrelated code later, in the same file ...


def is_active(customer):
    return customer.last_order_days_ago < 30


order = Order(order_id=501, customer_id=17)
try:
    print("checking whether the order is active:", is_active(order))
except AttributeError as e:
    print("AttributeError:", e)
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
AttributeError: 'Order' object has no attribute 'last_order_days_ago'
```

Nothing about the first `is_active` was wrong when it was written. The
second definition, written later, further down the same file, for a
completely different purpose, happens to share its name — and in
Python, a `def` at module level doesn't add a second meaning for a name,
it *rebinds* the name, completely replacing whatever it pointed to
before. By the time `is_active(order)` runs, the name `is_active` no
longer refers to the order-checking function at all; it refers to the
customer-checking one, and calling it on an `Order` object crashes on
the first line that tries to read a field only `Customer` has.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `Order`/`Customer` example, not a port of an
  external reference codebase.
- **Files affected:** two new files, `order_lifecycle.py` and
  `customer_activity.py`, replacing a single growing script.
- **Change type:** split — `Order`, `OrderStatus`, and the
  order-checking `is_active` move into `order_lifecycle.py`; `Customer`
  and the customer-checking `is_active` move into `customer_activity.py`.
- **Location:** two new, separate files, each complete on its own.
- **Dependencies:** none new — this lesson's fix uses only Python's
  built-in module system, no external package.

### The New Code

The smallest new piece is the import statement that reaches into each
module by its own name, keeping both `is_active` functions fully
separate:

```python
import order_lifecycle
import customer_activity
```

### The Updated Project

Two small files replace the one growing script, and the calling code
reaches each `is_active` through its owning module's name:

```python
# order_lifecycle.py
from enum import Enum


class OrderStatus(Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"


class Order:
    def __init__(self, order_id, customer_id):
        self.order_id = order_id
        self.customer_id = customer_id
        self.status = OrderStatus.PENDING


def is_active(order):
    return order.status not in {
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
        OrderStatus.RETURNED,
    }
```

Everything `Order` needs lives in that one file now — `OrderStatus`,
`Order`, and the order-checking `is_active`, nothing about `Customer`
anywhere in it. `customer_activity.py`, alongside it, is just as
self-contained, this time with nothing about `Order` in it at all:

```python
# customer_activity.py
class Customer:
    def __init__(self, customer_id, name):
        self.customer_id = customer_id
        self.name = name
        self.last_order_days_ago = 5


def is_active(customer):
    return customer.last_order_days_ago < 30
```

Calling code reaches into each file through the `import` statement from
"The New Code," above, and every use of either `is_active` is now
written through its own module's name:

```python
# l52_fix.py
import order_lifecycle                                        # ← new
import customer_activity                                       # ← new

order = order_lifecycle.Order(order_id=501, customer_id=17)     # ← changed
customer = customer_activity.Customer(customer_id=17, name="Dana")  # ← changed

print("order is_active:", order_lifecycle.is_active(order))      # ← changed
print("customer is_active:", customer_activity.is_active(customer))  # ← changed
```

Neither `is_active` function's own body changed at all — the fix is
entirely about which namespace each one lives in, and how the calling
code reaches into that namespace explicitly instead of relying on one
shared, flat set of names.

### Isolating the Concept: Two Files, Two Namespaces

The mechanism doing the real work above — splitting code across files so
that identically-named functions each get their own namespace instead of
sharing one — is small enough to see directly in the real code above
without a separate, unrelated throwaway example; the two files
themselves, `order_lifecycle.py` and `customer_activity.py`, already are
the isolated demonstration. Running the fixed version:

```
order is_active: True
customer is_active: True
```

Both calls succeed. `order_lifecycle.is_active` and
`customer_activity.is_active` are two entirely separate function
objects, each reachable only through its own module's name — Python
never has to choose between them, because nothing ever asked it to treat
them as the same name.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`import order_lifecycle`** — an import statement naming a module by
  its filename without the `.py` extension. Python locates
  `order_lifecycle.py`, executes every top-level statement in it exactly
  once — including both class definitions and the `is_active` def — and
  binds the name `order_lifecycle` to the resulting module object.
- **`import customer_activity`** — the identical mechanism, for the
  second file. Because this is a *second*, separate `import` statement
  naming a *different* module, it creates a second, separate binding —
  `customer_activity` — rather than colliding with `order_lifecycle` at
  all; two module objects, two names, no shared namespace between them.

### CS Lens

A module is Python's mechanism for creating a new **namespace**: a
distinct mapping from names to objects, isolated from every other
namespace unless something explicitly reaches across the boundary. This
is the identical idea behind a compiler's own scoping rules — a local
variable inside one function never collides with an identically-named
local variable inside a different function, for exactly the same
structural reason two module-level `is_active` functions in two
different files don't collide: each one's name only means one specific
thing *within its own namespace*, and nothing outside that namespace is
forced to agree.

Also recognized in: separate Java or C# packages allowing two classes
named identically as long as their fully-qualified package paths differ,
separate database schemas allowing two tables both named `orders` without
conflict, and separate DNS zones allowing two organizations to each own
a hostname like `mail` without collision, because each is scoped to its
own domain.

### SE Lens

The principle is **group related code by what it's responsible for, not
by when it happened to be written** — the growing single-file version of
this domain's code was never wrong on the day any one line was added to
it; it became a liability specifically because nothing about a single
flat file signals which parts are related to `Order` and which are
related to `Customer`, so nothing warns a reader — or the language
itself — when a name gets reused across those two unrelated concerns.
Splitting into modules is a real, ongoing cost, not a one-time fix:
every future addition now has to be placed in the *correct* file, and a
codebase with many modules has to answer a harder question this lesson's
two-file example doesn't yet raise — which module should a piece of
code that touches *both* `Order` and `Customer`, like Lesson 47's
`customer_can_pay`, actually live in? That question is exactly what the
rest of this domain exists to answer.

The honest limit proven in "What Breaks Without This," below: splitting
into modules only protects a name if the calling code reaches into each
module through its own name. `import order_lifecycle` and `import
customer_activity`, used as shown above, do that correctly — but nothing
about Python's own import system forces every caller to do it that way.

### Commands Needed

Running the fixed version now requires the interpreter to find all three
files in the same working directory — `python l52_fix.py`, run from the
directory containing `order_lifecycle.py` and `customer_activity.py`.
Python resolves a bare `import order_lifecycle` by searching, among
other places, the directory the running script itself lives in; if
`order_lifecycle.py` isn't there, the import fails with
`ModuleNotFoundError` instead of the output shown below.

### Run It

Running the fixed three-file version:

```python
import order_lifecycle
import customer_activity

order = order_lifecycle.Order(order_id=501, customer_id=17)
customer = customer_activity.Customer(customer_id=17, name="Dana")

print("order is_active:", order_lifecycle.is_active(order))
print("customer is_active:", customer_activity.is_active(customer))
```

The real output:

```
order is_active: True
customer is_active: True
```

Both `is_active` calls now succeed, in the same program, on the exact
same two kinds of object that crashed in the Problem section. Nothing
about either function's logic changed — a fresh order really is active,
and a customer who ordered five days ago really is active too. What
changed is that Python was never asked to store two different meanings
under one shared name.

### Connecting Back

Where Lesson 49 protected one object's own internal data from being
reached the wrong way, this lesson protects an entire file's worth of
names from being confused with a different file's names — the same
underlying instinct, drawing a deliberate boundary around what belongs
together, now applied to an entire module instead of a single class.

## Connect the Pieces

`is_active` moved through this lesson twice, checking the exact same
fresh order both times. First, as two functions sharing one flat
script's namespace: the second definition silently replaced the first,
and calling `is_active(order)` crashed with an `AttributeError` on a
field only `Customer` has. Second, as two functions in two separate
modules: `order_lifecycle.is_active(order)` and
`customer_activity.is_active(customer)` both succeeded, in the same
program, because each was reached through the one name that actually
disambiguates it — its owning module.

## What Breaks Without This

Splitting into modules only helps if code reaches across the module
boundary by the module's own name. Reach into both modules the other
way — pulling each `is_active` directly into the current file's own
namespace — and the exact same collision from the Problem section comes
back, module boundary or not:

```python
from order_lifecycle import is_active, Order
from customer_activity import is_active, Customer

order = Order(order_id=501, customer_id=17)
try:
    print("order is_active:", is_active(order))
except AttributeError as e:
    print("AttributeError:", e)
```

Run for real, this is what comes back:

```
AttributeError: 'Order' object has no attribute 'last_order_days_ago'
```

The two `is_active` functions really do live in two separate module
namespaces now — `order_lifecycle.py` and `customer_activity.py` never
stopped being correct. But `from customer_activity import is_active`,
run after `from order_lifecycle import is_active`, binds the bare name
`is_active`, in *this* file, a second time, silently replacing the
first binding — reproducing the identical collision from before the fix,
inside the one file that chose to flatten both modules' names back into
its own namespace. The module boundary was never the whole guarantee; it
only holds as far as the code on the other side of it respects it.

## Exercises

1. Add a third module, `reporting.py`, with its own `is_active(report)`
   function meaning something else again (a report is "active" if it
   hasn't been archived). Import all three modules by name in one script
   and call all three `is_active` functions correctly, proving three-way
   coexistence, not just two.
2. Rewrite the "What Breaks Without This" scenario using `from
   customer_activity import is_active as customer_is_active` instead of
   a bare `import`. Run it for real and explain, in one sentence, why
   `as` fixes the collision without giving up the shorter, unqualified
   call syntax.
3. `order_lifecycle.py` and `customer_activity.py` both currently have to
   sit in the same directory as whatever script imports them. Look up,
   in Python's own documentation, one real mechanism for organizing
   several related modules into a single importable package, and write
   two sentences on what problem it solves that a flat directory of
   individual `.py` files doesn't.

## Definition of Done

- [ ] `order_lifecycle.py` and `customer_activity.py` exist as two
      separate files, each with its own `is_active` function.
- [ ] The Problem section's collision has been reproduced for real,
      against a single flat script, before you split it into modules.
- [ ] The "Run It" scenario above runs against your own two-module
      version and produces output matching what's pasted here.
- [ ] The "What Breaks Without This" `from`-import collision has been
      run against your own files, not just read, and you can state in
      one sentence why the module boundary didn't prevent it.
- [ ] Commit, with a message stating *why*: something like `modularity:
      split order and customer activity checks into separate modules so
      both can be named is_active without colliding`, not `split file
      into two files`.

Up next: Lesson 53, Information Hiding — not just which module a name
lives in, but which of a module's own names it should expose to other
modules at all.
