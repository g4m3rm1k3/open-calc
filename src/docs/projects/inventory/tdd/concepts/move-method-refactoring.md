# Concept: Move Method (Refactoring)

**What you'll understand by the end:** the real, named refactoring for
relocating a method whose logic depends entirely on one class's own
data, from wherever it was originally written, to live directly on the
class it actually belongs to — and how this is a genuinely different
question from *whether* to extract a function at all.

**Prerequisites:** `python-classes-instances.md`.

## Setup

None — plain Python, no packages.

## The Problem

A piece of logic sometimes ends up living somewhere other than the
class its own data actually comes from — written inline in whatever
code happened to need it first, reading that class's fields directly
from the outside. As a codebase grows, this creates a real, awkward
gap: understanding what an object "is" and "does" requires reading
code scattered across unrelated files, not just the class's own
definition.

## The Isolated Example

Before — logic living outside the class it depends on entirely:

```python
class Order:
    def __init__(self, items, tax_rate):
        self.items = items
        self.tax_rate = tax_rate


def describe_order_before(order):
    """BEFORE: logic that only touches Order's own data, living elsewhere."""
    subtotal = sum(item["price"] for item in order.items)
    return f"{len(order.items)} items, total ${subtotal * (1 + order.tax_rate):.2f}"
```

After — the identical logic, moved onto the class it actually belongs
to:

```python
class OrderAfter:
    def __init__(self, items, tax_rate):
        self.items = items
        self.tax_rate = tax_rate

    def describe(self):
        """AFTER: moved onto the class whose own data it actually depends on."""
        subtotal = sum(item["price"] for item in self.items)
        return f"{len(self.items)} items, total ${subtotal * (1 + self.tax_rate):.2f}"


order = Order([{"price": 10.0}, {"price": 5.0}], 0.08)
order_after = OrderAfter([{"price": 10.0}, {"price": 5.0}], 0.08)

print(describe_order_before(order))
print(order_after.describe())
print(describe_order_before(order) == order_after.describe())
```

**Real output, run this session:**
```
2 items, total $16.20
2 items, total $16.20
True
```

**What this proves:** both versions produce the identical real result
— this is a real, pure refactoring: observable behavior is completely
unchanged (`True`), only *where the code lives* changed. `describe()`
reads `self.items`/`self.tax_rate` directly, with no external
`order` parameter needed at all, because it now lives on the exact
object whose data it was always really about.

## Mechanical Walkthrough

- **Move Method** relocates a method's body from wherever it currently
  lives to a new home — usually the class whose fields the method's own
  logic reads the most, or exclusively.
- The telltale real sign a method wants to move: it takes an instance
  of some class as a parameter (`order` above) and then does nothing
  but read that instance's own fields — the function is conceptually
  "about" that class already, just not physically located on it.
- After the move, every reference to the parameter (`order.items`)
  becomes a reference to `self` (`self.items`) — the method no longer
  needs the object handed to it externally, since it now runs *as* a
  method of that exact object.
- Every real caller of the old, external function must be updated to
  call the new method instead (`describe_order_before(order)` becomes
  `order.describe()`) — a real, mechanical step, usually safe to
  automate with a modern IDE's own refactoring tools.

## CS Lens

This is one of Martin Fowler's original, named refactorings — a
**behavior-preserving** transformation: the program's observable output
is provably unchanged (confirmed directly above), while its internal
structure improves. Move Method specifically targets **feature
envy** — a real, named code smell where a piece of logic seems more
interested in another class's data than in the class or module it
currently lives inside.

Also recognized in: `guard-clause-early-return.md`'s own refactoring
(from the same Fowler catalog, a different transformation entirely);
IDE "refactor > move method" commands across virtually every modern
language tooling ecosystem, automating exactly this mechanical
relocation.

## SE Lens

The real, practical payoff: after the move, understanding everything
`Order` can do only requires reading `Order`'s own class body — no
external functions elsewhere in the codebase secretly depend on its
internals. This is a genuinely different question from
`avoid-premature-abstraction.md`'s own concern: that file asks *whether*
a piece of duplicated logic has earned its own extracted function at
all; Move Method assumes the logic is already reasonably extracted and
asks a separate question — *where*, among the classes that already
exist, does it actually belong?

## Connection

Builds on `python-classes-instances.md`. A real, applied instance in
this project's own history: string-building logic that only ever
touched one class's own fields, originally written inline in an event
handler elsewhere, moved onto that class directly — the identical real
shape as this file's own before/after example, and the same real payoff
`layered-architecture-dependency-direction.md` already names (logic
depending only on data it can reach without crossing into a different,
higher layer).

## Try It Yourself

1. Add a second, similar function reading a different class's fields
   externally, and perform the identical Move Method refactoring on it
   — confirm the same real, mechanical pattern applies regardless of
   what the specific logic does.
2. Find a real function in a codebase you have access to that takes one
   object as its main parameter and does little else but read that
   object's own fields — a real, live candidate for this exact
   refactoring.
3. Explain, in your own words, why moving `describe_order_before` onto
   `Order` doesn't change `describe_order_before(order) ==
   order_after.describe()`'s result — what specifically stays invariant
   across a real, correct Move Method refactoring, and what's allowed
   to change?
