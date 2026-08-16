# Lesson 73: Architectural Drivers

**What you will build.** Two candidate ways to organize this system's
checkout logic into subsystems: split by *entity type* (an `orders`
subsystem, a `customers` subsystem), or split by *business capability*
(a `checkout` subsystem holding everything checkout actually touches).
Counting real cross-boundary calls for one ordinary paid-checkout
operation proves the difference isn't cosmetic: split by entity type,
completing a single checkout crosses a subsystem boundary twice, for
`customer_can_pay` and for `transition_to`, even though both happen
inside one atomic business operation a customer experiences as one
step. Split by capability, the identical operation crosses zero
boundaries. The transferable problem: Lesson 72 decided a boundary's
*direction*; this lesson asks what should decide *where the boundary
goes in the first place* — and "how the data happens to be modeled" is
a much weaker answer than "which pieces of behavior actually change and
execute together."

**What you need to know first.** What Is Architecture? (Lesson 72) —
the scale this lesson's boundary question operates at. Business Rules
(Lesson 47) — `customer_can_pay`, the real operation this lesson counts
crossing a boundary twice under one split and zero times under another.
Cohesion (Lesson 59) — the identical question, "do these things actually
belong together," now asked about subsystems instead of one module's own
contents.

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

Still the **Architecture** stage. Carried through: Lesson 72 decided
which way one boundary should point; this lesson asks what real,
checkable fact should decide where a boundary is drawn at all, before
its direction is even a question.

**Terms introduced in this lesson.** One line each.

- **architectural driver** — a real, checkable fact about a system —
  which operations happen together, which parts change together, which
  parts need to scale or fail independently — that a boundary decision
  should actually be justified by, rather than a boundary chosen because
  it matches how the data happens to be modeled. It's named because
  "orders" and "customers" being separate domain concepts (Lesson 40)
  doesn't automatically mean they should be separate architectural
  subsystems — that's a second, independent decision, driven by
  different facts.
- **common closure** — the principle that things which change for the
  same reason, at the same time, should live inside the same boundary,
  even if they represent different domain concepts — and things that
  change for different reasons should be free to live apart, even if
  they represent the same domain concept. It's the specific driver this
  lesson's own comparison is built around.

**Objects and methods used.** None new — this lesson's evidence is a
count of real calls across a hypothetical boundary, using functions
already established in this curriculum.

## Concept Unit: The Boundary Should Follow the Operation, Not the Entity

### The Problem

Splitting this system by entity type feels natural — `Order` and
`Customer` are already separate domain concepts, established all the
way back in Lesson 40. Organizing subsystems the same way looks like a
free, obvious decision:

```python
def checkout_pay_split_by_entity(order, customer):
    record_cross_boundary_call("checkout", "customers_subsystem")
    if not customer_can_pay(customer):
        return False
    record_cross_boundary_call("checkout", "orders_subsystem")
    order.transition_to(OrderStatus.PAID)
    return True
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running one ordinary, successful
checkout and counting what actually crossed a boundary:

```python
order = Order(order_id=501, customer_id=17)
customer = Customer(customer_id=17)
checkout_pay_split_by_entity(order, customer)
print("cross-boundary calls for one checkout:", CROSS_BOUNDARY_CALLS)
print("count:", len(CROSS_BOUNDARY_CALLS))
```

Running it produces:

```
cross-boundary calls for one checkout: [('checkout', 'customers_subsystem'), ('checkout', 'orders_subsystem')]
count: 2
```

One atomic operation a customer experiences as a single step — "pay for
my order" — crosses a subsystem boundary twice to complete. Every future
change to *how paying works* — a new eligibility rule, a new step in the
sequence — risks needing coordinated changes across two subsystems that
happen to be separated only because `Order` and `Customer` are separate
domain concepts, not because paying itself is naturally two things.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** none yet — this Concept Unit's own job is
  measuring the cost of the entity-based split before deciding to
  replace it.
- **Change type:** measurement, not yet a code change.
- **Location:** n/a.
- **Dependencies:** none.

### The New Code

The smallest new piece is the alternative split, organized by capability
instead of entity, run against the identical operation:

```python
def checkout_pay_split_by_capability(order, customer):
    if not customer_can_pay(customer):
        return False
    order.transition_to(OrderStatus.PAID)
    return True
```

### The Updated Project

Both `customer_can_pay` and `transition_to` are called from the same
function, inside the same subsystem — nothing here crosses a boundary at
all, because paying was never actually two things:

```python
def checkout_pay_split_by_capability(order, customer):           # ← new
    if not customer_can_pay(customer):                             # ← changed, no boundary crossed
        return False
    order.transition_to(OrderStatus.PAID)                            # ← changed, no boundary crossed
    return True
```

Nothing about `customer_can_pay` or `transition_to`'s own internal logic
changed at all — Lesson 47 and Lesson 46 both still apply, unmodified.
What changed is which subsystem the two calls happen inside, and
whether "paying for an order" is treated, architecturally, as one
capability or as two entities' worth of separately-owned code.

### Isolating the Concept: Count the Real Crossings, Don't Guess

The mechanism doing the real work above — counting actual crossings for
one real operation instead of judging a boundary by how the data looks
— deserves to be seen on its own. Here it is comparing two ways to split
a recipe app between "ingredients" and "instructions":

```python
CROSSINGS = []


def record(frm, to):
    CROSSINGS.append((frm, to))


def scale_recipe_split_by_entity(ingredients, instructions, factor):
    record("scaling", "ingredients_subsystem")
    scaled = [(name, qty * factor) for name, qty in ingredients]
    record("scaling", "instructions_subsystem")
    adjusted_instructions = [f"{step} (scaled x{factor})" for step in instructions]
    return scaled, adjusted_instructions


ingredients = [("flour", 2), ("sugar", 1)]
instructions = ["mix", "bake"]
scale_recipe_split_by_entity(ingredients, instructions, factor=2)
print("crossings:", CROSSINGS)
```

Running it produces:

```
crossings: [('scaling', 'ingredients_subsystem'), ('scaling', 'instructions_subsystem')]
```

Scaling a recipe is one operation, a cook thinks of as one step, and it
crosses two subsystem boundaries purely because "ingredients" and
"instructions" happen to be separate concepts in the data model — the
identical shape as `checkout_pay_split_by_entity`'s own two crossings.
This throwaway example is now discarded; the recipe scaler does not
appear anywhere else in this lesson or this project again.

### Mechanical Walkthrough

Working through the one meaningful difference between the two versions:

- **`checkout_pay_split_by_entity`'s two `record_cross_boundary_call`
  lines** — each one marks a point where control (and, in a real
  distributed system, potentially a network call) leaves one subsystem
  and enters another, purely because the function being called lives in
  a different subsystem than the caller.
- **`checkout_pay_split_by_capability`'s absence of either call** — the
  identical two function calls, `customer_can_pay` and `transition_to`,
  still happen — but both live inside the same subsystem as the caller,
  so nothing about invoking them constitutes crossing an architectural
  boundary at all.

### CS Lens

This is the **Common Closure Principle**: classes (or, at this domain's
scale, subsystems) that change for the same reasons, at the same times,
should be grouped together, even across different domain concepts —
and a single domain concept's own code should be free to split across
subsystems if different parts of it change for genuinely different
reasons. It directly generalizes Lesson 59's own cohesion test — "does
this belong here" — from the inside of one module to the boundary
between entire subsystems: the real question was never "is this an
`Order` or a `Customer`," it was "does this change, and get called, as
one thing or two."

Also recognized in: microservice boundaries drawn around business
capabilities ("checkout," "fulfillment") rather than around database
tables, monorepo package boundaries organized by feature rather than by
technical layer, and Conway's Law's own observation that a system's
structure tends to mirror the communication structure of the
organization that built it — a boundary drawn along a team's own
reporting lines is a driver too, whether or not anyone decided it on
purpose.

### SE Lens

The principle is **let real operational cohesion decide a boundary, not
how convenient the entity split looked on a whiteboard** — the
alternative that was measured and rejected, splitting by entity type,
isn't wrong because entities are a bad organizing idea in general; it's
wrong specifically for an operation like paying, which genuinely spans
both entities as one atomic unit of work every time it happens. The real
cost of the fix: a system organized by capability instead of by entity
means `Order`-related code can end up split across more than one
subsystem too, if different operations on it change for different
reasons — a real, ongoing design cost, traded for removing the
two-crossings tax this lesson just measured on the system's single most
frequent operation.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the capability-based version through the identical successful
checkout, with the same crossing-counter reset and watched:

```python
CROSS_BOUNDARY_CALLS.clear()
order = Order(order_id=501, customer_id=17)
customer = Customer(customer_id=17)
checkout_pay_split_by_capability(order, customer)
print("cross-boundary calls for one checkout:", CROSS_BOUNDARY_CALLS)
print("count:", len(CROSS_BOUNDARY_CALLS))
```

The real output:

```
cross-boundary calls for one checkout: []
count: 0
```

The identical checkout, producing the identical result — the order
really is paid either way — crosses zero subsystem boundaries this time,
because `customer_can_pay` and `transition_to` both live inside the one
subsystem that owns the capability they're both part of.

### Connecting Back

Where Lesson 72 decided which direction one already-drawn boundary
should point, this lesson decides where a boundary should actually go —
the question that has to be answered first, using a real, countable
driver, before direction is even a meaningful thing to ask about.

## Connect the Pieces

Paying for order `501` was measured twice in this lesson, with the
identical customer and the identical result both times. First, split by
entity type: two real crossings, `customers_subsystem` then
`orders_subsystem`, for one operation a customer experiences as a single
step. Second, split by capability: zero crossings, the identical two
underlying function calls now both living inside the one subsystem that
owns "paying" as a whole.

## What Breaks Without This

Organizing by capability fixes checkout's own boundary count. It says
nothing about whether every *other* operation in the system was measured
the same way before subsystems were drawn:

```python
def check_order_history_for_support(order, customer):
    record_cross_boundary_call("support_tools", "orders_subsystem")
    record_cross_boundary_call("support_tools", "customers_subsystem")
    return f"order {order.order_id} for {customer.customer_id}"
```

A support-tools operation that genuinely needs facts about both an order
and a customer, for a completely different reason than checkout does,
may legitimately cross two boundaries — and forcing it into the
`checkout` subsystem just to avoid a crossing would recreate Lesson 59's
own low-cohesion mistake in a new place, bundling an unrelated
responsibility into a subsystem that was never meant to own it. Common
closure isn't "minimize crossings everywhere at any cost" — it's
"group what actually changes together," and some operations honestly
don't share a reason to change with anything else, which is exactly
where a real boundary crossing is the correct answer, not a smell to
eliminate.

## Exercises

1. Measure a third real operation from this curriculum's own running
   example — cancelling an order (Lesson 46), or updating a shipping
   address (Lesson 54) — under both the entity-based and
   capability-based splits. Does either split reduce this operation's
   own crossing count to zero, or does it genuinely need to cross a
   boundary either way?
2. `check_order_history_for_support`, above, crosses two boundaries
   under either split. Using this lesson's own Common Closure test,
   argue whether that's a sign the boundaries are wrong, or a sign this
   operation genuinely belongs to neither subsystem and needs its own.
3. Name one real system you use or have built where the boundaries
   (services, packages, teams) were drawn by entity type rather than by
   what actually changes together. What's the real, observable cost —
   not a guess — that this lesson's own crossing-count technique would
   have caught before the boundaries were drawn?

## Definition of Done

- [ ] Both `checkout_pay_split_by_entity` and
      `checkout_pay_split_by_capability` have been run for real, with
      `CROSS_BOUNDARY_CALLS` actually counted, not estimated.
- [ ] The Problem section's two-crossing count has been reproduced for
      real before comparing it to the capability-based version.
- [ ] The "Run It" scenario above runs against your own code and
      produces output matching what's pasted here.
- [ ] You can state, in one sentence, what the Common Closure Principle
      says a boundary should actually be driven by.
- [ ] Commit, with a message stating *why*: something like `architecture:
      organize checkout by capability instead of by entity, cutting
      cross-boundary calls for the most frequent operation from two to
      zero`, not `reorganize modules`.

Up next: Lesson 74, Quality Attributes — the other major category of
architectural driver besides how operations are grouped: what a system
has to be good at, measured, not assumed.
