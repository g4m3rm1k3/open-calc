# Lesson 49: Aggregates

**What you will build.** The previous lesson closed by naming the gap it
deliberately left open: `Order.total` can no longer disagree with
`Order.lines`, but `lines` itself is still an ordinary, publicly
mutable list — nothing stops `order.lines.append(...)` from adding a
line directly, or a negative-quantity line from being appended at all.
This lesson closes both: `lines` becomes a private `_lines`, reachable
from outside only through `add_line` (which now validates) or through a
`lines` property that hands back a read-only *copy*, not the real list.
The transferable problem: a single computed property can guarantee one
value stays consistent with its source, but it can't guarantee the
source itself is only ever changed through code that enforces the
domain's rules — that requires treating the whole cluster of related
objects as one protected unit, with exactly one door in.

**What you need to know first.** Domain Invariants (Lesson 48) — `total`
as a computed property, and the exact gap this lesson exists to close:
`lines` remaining directly mutable even after `total` stopped being able
to drift from it. Relationships (Lesson 44) — `Order` holding a
collection of other objects, the shape this lesson now protects.
Business Rules (Lesson 47) — validating an action before allowing it to
happen, the same shape `add_line`'s new quantity check reuses here.

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

Still the **Domain model** stage — and this lesson is the point where
this domain's own accumulated fixes (a closed set of states, a guarded
lifecycle, a single-source-of-truth business rule, a derived value) stop
being separate techniques and become one coherent claim about `Order`
as a whole: everything reachable from `Order` is now only reachable in
ways `Order` itself allows. That claim is a direct rehearsal, at the
smallest possible scale, of a question the *Architecture* stage further
down this pipeline asks about entire services: what's inside the
boundary, and what's the one sanctioned way in?

**Terms introduced in this lesson.** One line each.

- **aggregate** — a cluster of related objects — one entity plus
  everything it owns — treated as a single unit for enforcing
  consistency, with exactly one designated entry point external code is
  allowed to use to change anything inside it. It's named as its own
  concept because Lesson 48 already proved that protecting one derived
  value isn't the same as protecting the whole cluster it's derived
  from; an aggregate is the unit at which that protection is actually
  guaranteed.
- **aggregate root** — the one object in an aggregate that external code
  is allowed to hold a reference to and call methods on directly; `Order`
  is the aggregate root here, `OrderLine` is not. Every other object
  inside the aggregate is reached only through the root's own methods,
  never referenced or mutated from outside it directly.
- **consistency boundary** — the line drawn around a group of data within
  which every invariant is guaranteed to hold at every point outside
  code can observe it. A change that would leave anything inside that
  boundary invalid has to happen as one operation through the root,
  which can refuse it, rather than as a direct edit from outside that the
  root never gets a chance to check.

**Objects and methods used.**

- **`tuple(iterable)`** (Python's built-in immutable sequence
  constructor)
  - *What it is:* a built-in that builds a new, independent, ordered,
    immutable sequence from the elements of whatever iterable is passed
    to it.
  - *Implementation:* `tuple(self._lines)` copies the elements currently
    in `self._lines` into a brand-new tuple object at the moment it's
    called; a tuple has no `.append`, `.remove`, `.extend`, or any other
    mutating method that a list has — calling one raises `AttributeError`
    naming the missing method.
  - *Its use:* this lesson uses it to hand external code a safe *view* of
    `self._lines` rather than `self._lines` itself — a caller can read,
    iterate, or index the tuple they get back, but any attempt to mutate
    it fails immediately and loudly, and even a successful read of it is
    already a copy, disconnected from `self._lines`, so nothing done to
    it afterward can reach the real internal list at all.

## Concept Unit: One Root, One Door In

### The Problem

`Order.total` can no longer be wrong about `lines` — Lesson 48 already
fixed that. But `lines` is still exactly what it's always been: an
ordinary Python list, sitting on `self.lines`, fully public. Here's the
same bypass from the end of the previous lesson, run again, to keep the
failure concrete instead of asserted:

```python
class OrderLine:
    def __init__(self, item_id, quantity, unit_price):
        self.item_id = item_id
        self.quantity = quantity
        self.unit_price = unit_price


class Order:
    def __init__(self, order_id, customer_id):
        self.order_id = order_id
        self.customer_id = customer_id
        self.lines = []

    def add_line(self, line):
        self.lines.append(line)

    @property
    def total(self):
        return sum(line.quantity * line.unit_price for line in self.lines)


order = Order(order_id=501, customer_id=17)
order.lines.append(OrderLine(item_id="sku-1", quantity=-5, unit_price=25))
print("total with a directly-appended negative-quantity line:", order.total)
```

This is the same scenario the previous lesson already ran for real, kept
here as the concrete anchor for this lesson's own fix, not re-asserted
from memory. Running it produces:

```
total with a directly-appended negative-quantity line: -105
```

`total` is exactly right about what's in `lines` — the property does its
job. The actual defect is that anyone, anywhere, can reach
`order.lines` and call `.append` on it directly, adding whatever
`OrderLine` they want, including one `add_line` itself would have every
right to refuse. `add_line` isn't broken; it's just optional. Nothing
routes traffic through it.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `Order`/`OrderLine` example, not a port of an
  external reference codebase.
- **Files affected:** `orders.py` (same file as the previous four
  lessons), modified.
- **Change type:** refactor — `self.lines` is renamed to `self._lines`
  and stops being directly exposed; `add_line` gains a validation check;
  a new `lines` property replaces direct access to the underlying list.
- **Location:** inside `Order.__init__`, `Order.add_line`, and a new
  property added alongside the existing `total` property.
- **Dependencies:** none — `tuple` is a Python built-in, no import
  needed.

### The New Code

The smallest new piece is the read-only view itself:

```python
@property
def lines(self):
    return tuple(self._lines)
```

### The Updated Project

`Order` renames its internal list, adds a guard to `add_line`, and
replaces direct access to `lines` with the property above:

```python
class OrderLine:
    def __init__(self, item_id, quantity, unit_price):
        self.item_id = item_id
        self.quantity = quantity
        self.unit_price = unit_price


class Order:
    def __init__(self, order_id, customer_id):
        self.order_id = order_id
        self.customer_id = customer_id
        self._lines = []                                    # ← renamed from self.lines

    def add_line(self, line):
        if line.quantity <= 0:                               # ← new
            raise ValueError(                                 # ← new
                f"quantity must be positive, got {line.quantity}"  # ← new
            )                                                  # ← new
        self._lines.append(line)                              # ← changed, was self.lines

    @property                                                  # ← new
    def lines(self):                                           # ← new
        return tuple(self._lines)                              # ← new

    @property
    def total(self):
        return sum(line.quantity * line.unit_price for line in self._lines)  # ← changed, was self.lines
```

`Order` no longer has a public, mutable `lines` attribute anywhere:
`_lines` is the one real list, touched only inside `Order`'s own
methods; `add_line` is now the single door through which a new line can
be added, and it checks the line before letting it in; `lines`, read
from outside, hands back a copy that's safe to look at and useless to
mutate.

### Isolating the Concept: A Private List Behind a Guarded Door

The mechanism doing the real work above — an internal list nothing
outside the class can reach directly, a validating method as the only
way in, and a read-only copy as the only way to look — deserves to be
seen on its own. Here it is guarding a short to-do list instead of an
order's lines:

```python
class TodoList:
    def __init__(self):
        self._items = []

    def add_item(self, text):
        if not text.strip():
            raise ValueError("item text cannot be blank")
        self._items.append(text)

    @property
    def items(self):
        return tuple(self._items)


todo = TodoList()
todo.add_item("write lesson 49")
print("items:", todo.items)

try:
    todo.items.append("sneak this in")
except AttributeError as e:
    print("error:", e)

try:
    todo.add_item("   ")
except ValueError as e:
    print("error:", e)

print("items still:", todo.items)
```

Running it produces:

```
items: ('write lesson 49',)
error: 'tuple' object has no attribute 'append'
error: item text cannot be blank
items still: ('write lesson 49',)
```

This is exactly what `Order` is doing above, isolated: `_items` is the
real, private list; `add_item` is the one door in, and it refuses blank
text the same way `Order.add_line` refuses a non-positive quantity;
`items`, read from outside, is a tuple — `todo.items.append(...)` fails
immediately, because a tuple has no `append` at all, not because
anything is specifically watching for misuse. The final `print` proves
the attempted sneak-in never touched `_items`: the list is still exactly
one item long, the same as right after `add_item` first ran. This
throwaway example is now discarded; `TodoList` does not appear anywhere
else in this lesson or this project again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`@property`** — the same decorator this domain first used in the
  previous lesson: wraps the method immediately below it so that reading
  `order.lines`, with no parentheses, runs the method's body and returns
  its result, rather than returning the method object itself.
- **`def lines(self):`** — a method taking only `self`, the shape
  `@property` requires; it takes no arguments because it's triggered by
  plain attribute access, which has no way to pass any.
- **`return tuple(self._lines)`** — calls the built-in `tuple`
  constructor with `self._lines`, the real internal list, as its
  argument. `tuple` walks that list's current elements and builds a new,
  separate, immutable sequence containing copies of the same references
  — the object returned is not `self._lines`; it is a different object
  that happens to currently hold the same `OrderLine` references
  `self._lines` holds at the exact moment this method ran. Because it's
  a different object, nothing done to it afterward — including calling
  `.append` on it — has any way to reach or change `self._lines`.

### CS Lens

This is **encapsulation** applied specifically to a *cluster* of objects
rather than to a single one: not just hiding one field behind a method,
but drawing a boundary around an entire group of related objects
(`Order` and every `OrderLine` it owns) and guaranteeing that every
change crossing that boundary passes through code that can check it
first. In Domain-Driven Design, this specific shape — one root object,
everything else reachable only through it, one consistency boundary for
the whole cluster — is called an **aggregate**, and `Order` is playing
the role of its **aggregate root**. The read-only `tuple` view is a
second, related idea: returning a *defensive copy* instead of the real
internal reference, so that even code that only wants to *read* the
data has no accidental way to *change* it.

Also recognized in: a bank account object that exposes a `transactions`
history only as a read-only view while `deposit`/`withdraw` remain the
only ways to add one, a game engine's `Level` object owning every
`Entity` inside it and refusing direct access to its internal entity
list, a document object model's node tree where child nodes are added
through parent methods rather than by direct list manipulation, and
version-control repository objects that expose commit history for
reading but only accept new commits through their own guarded API.

### SE Lens

The principle is **the boundary of protection has to match the boundary
of the invariant** — Lesson 48 proved that protecting `total` alone
wasn't enough, because the invariant "an order's data makes business
sense" spans `total` *and* `lines` *and* every `OrderLine` inside
`lines`, not just the one derived value. The alternative that was
rejected: keep patching individual symptoms — a validated `add_line`
here, a computed `total` there — while leaving the underlying list
reachable by anyone. That approach can chase individual bugs forever
without ever closing the actual gap, because the gap was never about any
one field; it was about `Order` never having full control over its own
data in the first place. Making `_lines` private and `lines` read-only
closes it for the whole cluster in one change, at a real cost: any
existing code that used to write `order.lines.append(...)` directly
now breaks loudly instead of corrupting state silently — which is the
trade this lesson is explicitly making, a loud failure at the boundary
instead of a silent one deep inside a derived value three lessons later.

The honest limit here: Python's privacy is convention, not enforcement.
A single leading underscore, `_lines`, is a signal to other programmers
— "this is internal, don't touch it" — not a language-level lock; code
outside `Order` can still write `order._lines.append(...)` directly if
it chooses to ignore that signal, and Python will not stop it. This
lesson's real guarantee is against the *ordinary, sanctioned* way code
reaches an order's lines — `order.lines` — not against code that
deliberately reaches past the underscore to defeat the convention on
purpose.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, the path to a `.py`
file, executes that file's statements top to bottom in a fresh
interpreter process. Success looks like exactly the `print(...)` output
appearing in order, with no traceback beneath it.

### Run It

Running the fixed `Order`, attempting both of the previous lesson's own
open bypasses against it:

```python
order = Order(order_id=501, customer_id=17)
order.add_line(OrderLine(item_id="sku-1", quantity=2, unit_price=10))
print("total after add_line:", order.total)
print("line count:", len(order.lines))

try:
    order.lines.append(OrderLine(item_id="sku-2", quantity=1, unit_price=25))
except AttributeError as e:
    print("error:", e)

print("total after attempted bypass:", order.total)

try:
    order.add_line(OrderLine(item_id="sku-3", quantity=-5, unit_price=25))
except ValueError as e:
    print("error:", e)

print("total after rejected negative-quantity line:", order.total)
```

The real output:

```
total after add_line: 20
line count: 1
error: 'tuple' object has no attribute 'append'
total after attempted bypass: 20
error: quantity must be positive, got -5
total after rejected negative-quantity line: 20
```

Both of the previous lesson's open threads are closed against real,
executed attempts, not just described: `order.lines.append(...)` now
fails with `AttributeError` before it can touch anything, and
`order.total` stays `20` afterward, proving the attempted line never
got in. `order.add_line` with a negative quantity now fails with
`ValueError` instead of silently succeeding, and `total` stays `20`
again. Every value in this trace is exactly what it was before either
attack was attempted — the aggregate held.

### Connecting Back

Where Lesson 48 guaranteed one derived value could never disagree with
its source, this lesson guarantees the source itself can't be reached
except through code that's allowed to say no — together, the two
lessons close both "is this number right" and "is this data even
allowed to exist."

## Connect the Pieces

Order `501` moved through this lesson with the exact two attacks the
previous lesson left standing. First, `order.lines.append(...)`,
direct list mutation from outside — this used to succeed silently and
leave `total` stale; now it fails immediately, `AttributeError`, before
touching anything, because `lines` no longer returns the real list.
Second, `order.add_line` with a negative quantity — this used to
succeed and produce a real, negative `total`; now it fails immediately,
`ValueError`, before the bad line is ever appended to `_lines`. Both
failures happen at the one door into the aggregate, `Order`'s own
methods, instead of three steps later when someone finally notices
`total` doesn't make sense.

## What Breaks Without This

The SE Lens above already named the honest limit: Python's underscore
convention is a signal, not a lock. Prove it — reach past the
convention on purpose, the way disciplined code never would but careless
code sometimes does:

```python
order = Order(order_id=501, customer_id=17)
order._lines.append(OrderLine(item_id="sku-2", quantity=-5, unit_price=25))
print("total after reaching past the underscore:", order.total)
```

Run for real, this is what comes back:

```
total after reaching past the underscore: -105
```

`order._lines` is still an ordinary, real, mutable list — the leading
underscore never stopped Python from letting outside code touch it, it
only asked politely not to. This lesson's real guarantee protects the
*sanctioned* path, `order.lines` and `order.add_line`, completely; it
protects against a caller who deliberately writes `order._lines` not at
all. That's not a bug in this lesson's fix — it's the actual, documented
boundary of what a naming convention can promise in a language that
doesn't enforce access control, and it's worth knowing exactly where
that boundary sits rather than assuming `_lines` means the same thing a
hard language-level guarantee would.

## Exercises

1. Add a `remove_line(item_id)` method to `Order` that removes a line by
   its `item_id`, raising a `ValueError` if no line with that ID exists.
   Prove, by calling it and then printing `order.total`, that removal
   updates the derived total the same way addition does.
2. `TodoList.items` and `Order.lines` both return `tuple(self._x)`. Write
   a `has_item(text)` method on `TodoList` that checks membership without
   ever calling `self.items` — should it check `self._items` or
   `self.items`, and does the answer change anything about correctness,
   only performance, or both? Justify your answer with the real
   mechanics of what `tuple(self._items)` does on every call.
3. Reach past the underscore on the `TodoList` lab the same way "What
   Breaks Without This" did for `Order` — append directly to
   `todo._items` — and confirm for real that it succeeds exactly the
   same way `order._lines.append(...)` did.

## Definition of Done

- [ ] `Order._lines` is the only real list; nothing outside `Order`'s own
      methods reads or writes it directly through the sanctioned `lines`
      property.
- [ ] `add_line` rejects a non-positive quantity with `ValueError` before
      appending anything.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here, including both
      rejected attacks.
- [ ] The "What Breaks Without This" underscore-bypass has been run
      against your own file, not just read, and you can state in one
      sentence why Python allows it.
- [ ] Commit, with a message stating *why*: something like `aggregates:
      make Order the sole entry point for its lines, closing the direct-
      mutation and invalid-quantity gaps left open by the last two
      lessons`, not `add validation`.

Up next: Lesson 50, Bounded Contexts — where one aggregate's boundary
ends and a different part of the system's own, possibly conflicting,
model of the same real-world thing begins.
