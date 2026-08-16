# Lesson 45: State

**What you will build.** `Order` currently tracks whether it has been
paid, shipped, delivered, or cancelled using four independent boolean
fields. This lesson replaces all four with one field, `status`, whose
only possible values are a closed, named list built with Python's
`Enum`. The transferable problem underneath the feature: an entity's
state is the part of it that changes over its life while its identity
stays fixed, and when that state is spread across several independent
fields instead of held as one explicit value, the code becomes able to
represent combinations that the business itself never intended to
allow — a gap between what the code *permits* and what the domain
*permits* that nothing forces anyone to notice until it's live.

**What you need to know first.** Entities (Lesson 41) — an entity is
something with a persistent identity that survives changes to its data;
this lesson is specifically about the data half of that split, the part
of an entity that *is* allowed to change without the entity becoming a
different thing. Invariants (Lesson 30) — a rule that must hold true for
an object at every point after construction, not just at the moment it's
built; this lesson treats "an order is never simultaneously shipped and
cancelled" as exactly that kind of rule, and asks where in the code such
a rule actually gets enforced. Local Reasoning (Lesson 10) — being able
to trust what a piece of code does by reading only that piece, not the
whole system around it; this lesson's fix is judged directly against
that bar.

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

This lesson works entirely inside the **Domain model** stage — third
from the top, right after Requirements and right before Specification is
asked to make anything precise and checkable. Carried through every
stage this curriculum has already given real depth: the *Problem* an
order-tracking system exists to solve is knowing, at a glance, what's
actually true about an order right now — paid, shipped, delivered,
cancelled — without the answer depending on which of several fields
someone remembers to check. The *Requirements* domain's own lesson on
precision already established that a stated requirement is only as good
as what it actually pins down; "track the order's status" reads as a
complete requirement and isn't, until someone is forced to say exactly
what values status can take. The *Specification* domain gave the
vocabulary for closing that gap: an invariant is a rule that must hold
at every point after construction, and "an order is never simultaneously
shipped and cancelled" is exactly that kind of rule, whether or not any
code actually enforces it yet. This lesson is where that invariant stops
being a sentence someone has to remember and starts being a fact
`OrderStatus` makes true by construction — which is the *Domain model*
stage's job in general: turning a real-world rule into a shape the data
itself can't violate.

**Terms introduced in this lesson.** One line each.

- **state** — the part of an object's data that is allowed to change over
  its lifetime while the object's own identity stays the same. It exists
  as its own idea, separate from identity, because the two need different
  guarantees: identity must stay stable under change, while state is
  specifically the thing that's expected *to* change — conflating them
  is what makes "did this become a different order, or the same order in
  a new condition?" a hard question to answer by accident.
- **state space** — the full set of combinations a piece of data could
  technically take on, whether or not each combination is one the
  business actually considers meaningful. It's worth naming because the
  gap between "what the code can hold" and "what the domain allows" is
  exactly the gap this lesson closes — you can't see that gap exists
  until you have a name for the larger set it's a subset of.
- **invalid state** — a combination of values the code will happily
  construct, store, and run with, that nevertheless violates a rule the
  domain requires (an order that is both `shipped` and `cancelled` at
  once). It's distinguished from a plain bug because nothing crashes when
  it happens — the program keeps running, just on data that shouldn't
  exist, which is what makes it dangerous.
- **enumeration** — a type whose complete set of possible values is fixed
  and named up front, closed to anything not on that list. It exists so
  that "the set of things this can be" is a fact the language itself can
  check, instead of a convention a team has to remember and re-verify by
  hand at every place the value is set.
- **member** — one of the fixed, named values an enumeration defines
  (`OrderStatus.PAID` is a member of `OrderStatus`). A member is compared
  by identity to the exact name it was given, not reconstructed from a
  string or number, which is what stops a near-duplicate ("`Paid`" vs
  `"paid"` vs `"PAID "`) from silently becoming a second, wrong state.

**Objects and methods used.**

- **`Enum`** (from Python's standard-library `enum` module)
  - *What it is:* a base class that changes what a `class` statement
    means when a class inherits from it — instead of building an
    ordinary object blueprint, it builds a fixed, closed set of named
    constant members.
  - *Implementation:* imported with `from enum import Enum`; a class
    written as `class OrderStatus(Enum):` with uppercase attributes
    assigned in its body (`PENDING = "pending"`) turns each attribute
    into a distinct member, `OrderStatus.PENDING`, rather than a plain
    string attribute. Iterating the class itself, `list(OrderStatus)`,
    yields every member in the order it was declared.
  - *Its use:* this lesson uses it to replace four independent boolean
    fields on `Order` with one field whose only legal values are the
    five real order states, so a combination outside that list has no
    way to exist in memory at all.
- **`<member>.name`**
  - *What it is:* a read-only string every enum member carries, set to
    the identifier it was assigned to in the class body.
  - *Implementation:* for `OrderStatus.SHIPPED`, `.name` is the string
    `"SHIPPED"` — Python's enum machinery fills this in automatically
    when the class statement runs; nothing in the lesson's own code sets
    it by hand.
  - *Its use:* lets code or log output state which member something is
    by its written name, independent of whatever value backs it.
- **`<member>.value`**
  - *What it is:* a read-only attribute holding whatever was written on
    the right-hand side of that member's assignment.
  - *Implementation:* for `PAID = "paid"`, `.value` is the string
    `"paid"`. Any hashable object could sit on that right-hand side, not
    only strings — a number or a tuple works exactly the same way.
  - *Its use:* this lesson uses `.value` only where a stable, storable
    form of the member is needed (writing it to a file or a database
    row later); every comparison and every branch in this lesson's own
    logic is written against the member itself, `OrderStatus.SHIPPED`,
    never against `.value`.

## Concept Unit: Representing State as a Closed Set

### The Problem

`Order` needs to track where it is in its own fulfillment: has it been
paid for, shipped, delivered, cancelled? The obvious first move is one
boolean per fact — `is_paid`, `is_shipped`, `is_delivered`,
`is_cancelled` — because each fact, looked at alone, really is a
yes/no question. The trouble is that these four booleans are stored as
four *independent* fields. Nothing about how Python stores instance
attributes ties them together, so nothing stops all four from being set
in any combination whatsoever, including combinations that contradict
each other in the real world — an order that is both `is_shipped` and
`is_cancelled` at the same time describes something that should be
business-impossible (you cannot ship a cancelled order, and a shipped
order should never become cancelled by silently flipping a flag), but
the code has no opinion about that at all. Here it is, run for real:

```python
class Order:
    def __init__(self, order_id, customer_id):
        self.order_id = order_id
        self.customer_id = customer_id
        self.is_paid = False
        self.is_shipped = False
        self.is_delivered = False
        self.is_cancelled = False


def can_cancel(order):
    return not order.is_shipped and not order.is_delivered


order = Order(order_id=501, customer_id=17)
order.is_paid = True
order.is_shipped = True
order.is_cancelled = True

print("is_paid:", order.is_paid)
print("is_shipped:", order.is_shipped)
print("is_cancelled:", order.is_cancelled)
print("can_cancel(order):", can_cancel(order))
```

This is illustrative, hand-built for this lesson — not a quoted line
range from Lesson 44's own file, which this session did not reopen.
Running it produces:

```
is_paid: True
is_shipped: True
is_cancelled: True
can_cancel(order): False
```

Nothing raised an error. `order` now claims, simultaneously, to be
shipped and cancelled — two facts that should be mutually exclusive —
and the object is perfectly willing to keep running with both `True` at
once. `can_cancel` happens to return `False` here, but that's incidental:
it only ever checks two of the four flags, so it was never in a position
to notice the fifth-wheel contradiction sitting in the other two. With
four independent booleans, the *state space* — the set of combinations
the code can hold — is 2⁴, sixteen combinations, while the number the
business actually considers meaningful is five: pending, paid, shipped,
delivered, cancelled. Eleven of those sixteen reachable combinations are
*invalid states* — not crashes, just nonsense the code will hold and
run with regardless.

### Project Change

- **Reference Source:** none. This curriculum's domain-modeling lessons
  are not porting any specific external reference codebase — this is a
  from-scratch addition illustrating the general principle, not a port
  of a real system's `Order` class.
- **Files affected:** `orders.py` (continuing the `Order`/`orders`
  running example from the Relationships lesson), modified.
- **Change type:** refactor — the four boolean fields are replaced, not
  supplemented.
- **Location:** inside `Order.__init__`, removing `is_paid`,
  `is_shipped`, `is_delivered`, `is_cancelled` and adding one `status`
  field; `can_cancel`'s body is rewritten to check that field instead of
  two of the four old flags.
- **Dependencies:** the standard-library `enum` module — no install
  needed, it ships with Python.

### The New Code

The smallest new piece is the closed set of states itself, typed on its
own before it's wired into `Order`:

```python
from enum import Enum

class OrderStatus(Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
```

### The Updated Project

That new class now sits above the refactored `Order` and the rewritten
`can_cancel`, replacing every trace of the four booleans:

```python
from enum import Enum

class OrderStatus(Enum):              # ← new
    PENDING = "pending"                # ← new
    PAID = "paid"                      # ← new
    SHIPPED = "shipped"                # ← new
    DELIVERED = "delivered"            # ← new
    CANCELLED = "cancelled"            # ← new


class Order:
    def __init__(self, order_id, customer_id):
        self.order_id = order_id
        self.customer_id = customer_id
        self.status = OrderStatus.PENDING   # ← new, replaces four booleans


def can_cancel(order):
    return order.status not in {            # ← new, replaces boolean check
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
    }
```

`Order` now carries exactly one field describing where it is in its
fulfillment instead of four, and `can_cancel` now asks one question —
"is this order's single status one of the three that forbid
cancelling?" — instead of reasoning about two booleans and silently
ignoring the other two.

### Isolating the Concept: Enum

The mechanism doing the real work above — a class that builds a closed
set of named members instead of an ordinary object — deserves to be seen
on its own, away from `Order`, before trusting what it does inside it.
Here it is with an unrelated, throwaway example, a compass direction
instead of an order status:

```python
from enum import Enum


class Direction(Enum):
    NORTH = "north"
    SOUTH = "south"
    EAST = "east"
    WEST = "west"


d = Direction.NORTH
print(d)
print(d.name)
print(d.value)
print(d == Direction.NORTH)
print(d == Direction.SOUTH)
print(d == "north")
print(list(Direction))
```

Running it produces:

```
Direction.NORTH
NORTH
north
True
False
False
[<Direction.NORTH: 'north'>, <Direction.SOUTH: 'south'>, <Direction.EAST: 'east'>, <Direction.WEST: 'west'>]
```

This is exactly what `OrderStatus` in the code above is doing, isolated:
`Direction.NORTH` prints as `Direction.NORTH`, not just `NORTH` or
`"north"` — it's a distinct object, not a string wearing a label.
`d.name` and `d.value` recover the two separate things Python tracked
for it. `d == Direction.NORTH` is `True` because they're the identical
member; `d == Direction.SOUTH` is `False` because `Direction` has no
notion of "close enough." `d == "north"` is `False` too, which is the
line worth pausing on — a plain string, even the exact one used as this
member's `.value`, is never treated as equal to the member itself,
because they're different types with no automatic bridge between them.
`list(Direction)` walks all four members in the order they were
declared. This construct — a class that builds a fixed, closed set of
named members instead of an ordinary blueprint — is called an
**enumeration**. This throwaway example is now discarded; `Direction`
does not appear anywhere else in this lesson or this project again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`from enum import Enum`** — an import statement pulling the name
  `Enum` out of Python's standard-library `enum` module and binding it in
  this file. Without this line, `Enum` would be an undefined name the
  moment the next line tried to use it as a base class.
- **`class OrderStatus(Enum):`** — a class statement whose parenthesized
  parent is `Enum`. An ordinary `class Foo:` with no parent, or a plain
  inheritance parent, builds a normal object blueprint — instances get
  created by calling it. `Enum` as the parent changes that: Python's enum
  machinery intercepts the class body as it's built and turns each
  qualifying assignment inside it into a member of a closed set, rather
  than letting the class behave like an ordinary blueprint you'd
  instantiate with `OrderStatus(...)`.
- **`PENDING = "pending"`** — inside an `Enum` subclass's body, this is
  not an ordinary attribute assignment. Python's enum machinery reads
  `PENDING` as the member's name and `"pending"` as the value backing it,
  and produces a single object, `OrderStatus.PENDING`, that the rest of
  the program refers to by that dotted name. This is the mechanism this
  lesson exists to teach: a value that can only ever be one of a fixed,
  declared list, checkable by the language itself, not by convention.
- **`PAID = "paid"`, `SHIPPED = "shipped"`, `DELIVERED = "delivered"`,
  `CANCELLED = "cancelled"`** — each follows the identical mechanism
  just explained for `PENDING`: every line produces one more member —
  `OrderStatus.PAID`, `OrderStatus.SHIPPED`, `OrderStatus.DELIVERED`,
  `OrderStatus.CANCELLED` — closing the set at exactly five members, no
  more and no fewer than what's written here.

### CS Lens

The concept underneath `Enum` is the **finite state**: a value drawn from
a fixed, enumerable set, where the *entire* current condition of the
thing being modeled is captured by which one member it currently holds —
nothing else about its history matters to what happens next. That's the
formal definition of "state" in automata theory: the minimum information
that, combined with whatever happens next, determines what happens after
that. Four independent booleans give a *state space* of 2⁴ = 16 reachable
combinations for something the business only recognizes five meaningful
values in; naming the five states directly, as members of one
enumeration, collapses the state space to exactly the size of the
problem, with no room left over for the other eleven to be constructed
by accident.

Also recognized in: traffic-light controllers (red/yellow/green modeled
as one state, never as three independent "is-lit" booleans that could
all be true together), TCP's connection lifecycle (`LISTEN`,
`SYN-SENT`, `ESTABLISHED`, and the rest, formally defined as a single
finite automaton, not a bundle of independent flags), regex engines
(every position in a match is "in" exactly one state of the underlying
DFA), vending-machine and turnstile controllers, and video-game
character controllers (idle/walking/jumping/attacking as one current
state, because a character that is simultaneously "jumping" and "idle"
is exactly the kind of contradiction this lesson is about).

### SE Lens

The design principle here is sometimes phrased as *making illegal states
unrepresentable*: instead of allowing a bad combination to be
constructed and then trying to catch it afterward, the data's own shape
is narrowed so the bad combination has nowhere to live. The alternative
that was **not** chosen here is keeping the four booleans and adding
validation on top — a `validate(order)` function, or a property
setter, that checks for contradictions and raises an error when it finds
one. That alternative is real and sometimes appropriate, but it carries
a cost this lesson's fix doesn't: validation-after-construction only
works if every single place that mutates the object remembers to call
it, and "remembering to call it everywhere" is precisely the discipline
failure that produced the shipped-and-cancelled bug demonstrated above
in the first place. Consolidating into one `status` field removes the
need to remember anything at every mutation site, at the real cost of a
one-time migration: every place in a real project that used to read
`is_shipped` or `is_cancelled` directly has to be found and rewritten
against `status` instead, and that rewrite is not automatic or free.

The honest limit of this fix, worth stating plainly: `Enum` prevents an
*existing* field from holding a value outside its five members — it does
nothing to stop a future engineer from adding a *sixth*, brand-new
boolean field back onto `Order` later, under deadline pressure, instead
of adding a sixth `OrderStatus` member. `is_refunded = True` sitting next
to a `status` field would silently recreate the exact problem this
lesson just removed. The tool makes the correct shape cheap and obvious
to reach for; it doesn't enforce that every future change reaches for it.
That enforcement is a code-review and team-discipline question, not
something this Concept Unit's code can guarantee on its own.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, the path to a `.py`
file, executes that file's statements top to bottom in a fresh
interpreter process. Success looks like exactly the `print(...)` output
appearing in order, with no traceback beneath it; a traceback means an
exception propagated out of the script instead of being caught, and the
script stopped at that point rather than finishing.

### Run It

Running the full updated `Order`/`OrderStatus`/`can_cancel` code above,
with a short scenario exercising it — a fresh order, then paid, then
shipped, then cancelled:

```python
from enum import Enum


class OrderStatus(Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class Order:
    def __init__(self, order_id, customer_id):
        self.order_id = order_id
        self.customer_id = customer_id
        self.status = OrderStatus.PENDING


def can_cancel(order):
    return order.status not in {
        OrderStatus.SHIPPED,
        OrderStatus.DELIVERED,
        OrderStatus.CANCELLED,
    }


order = Order(order_id=501, customer_id=17)
print("new order status:", order.status)
print("can_cancel(order):", can_cancel(order))

order.status = OrderStatus.PAID
order.status = OrderStatus.SHIPPED
print("status after paid, then shipped:", order.status)
print("can_cancel(order):", can_cancel(order))

order.status = OrderStatus.CANCELLED
print("status after cancelling the shipped order:", order.status)
print("can_cancel(order):", can_cancel(order))
```

The real output:

```
new order status: OrderStatus.PENDING
can_cancel(order): True
status after paid, then shipped: OrderStatus.SHIPPED
can_cancel(order): False
status after cancelling the shipped order: OrderStatus.CANCELLED
can_cancel(order): False
```

`order.status` holds exactly one member at every line — there is no
point in this trace where it could be read as both `SHIPPED` and
`CANCELLED`, because a single Python attribute can only ever hold one
object at a time. That's worth sitting with: the fix isn't a new runtime
check catching a bad combination — it's that the bad combination has no
attribute to be stored in anymore. The last two lines also surface a
question this lesson is deliberately *not* answering: should a `SHIPPED`
order even be allowed to move to `CANCELLED` at all? `can_cancel` says
no in advance, but nothing yet stops the direct assignment
`order.status = OrderStatus.CANCELLED` from happening regardless — which
transitions between states are legal, as opposed to what the current
state even is, is a distinct question this lesson leaves for later,
generic ground: a later lesson in this domain covers which transitions
between states are actually allowed to happen.

### Connecting Back

Where Lesson 44 established `Order` as one honest side of a relationship
to `Customer`, this lesson narrows what `Order` is allowed to *say about
itself* at any given moment, from sixteen technically-reachable
combinations down to exactly the five the business recognizes.

## Connect the Pieces

Order `501` moved through this lesson twice. First, as four independent
booleans, it reached `is_shipped=True, is_cancelled=True` simultaneously
— a state nothing in the code considered invalid, because nothing in the
code considered the combination at all. Second, as a single
`OrderStatus` field, the same order moved `PENDING → PAID → SHIPPED →
CANCELLED`, one member at a time, every step fully replacing the one
before it — the same underlying business scenario, but the second
version has no attribute capable of expressing "shipped and cancelled"
as one simultaneous fact, because there is exactly one `status`
attribute and it holds exactly one member.

## What Breaks Without This

Swap `OrderStatus` back out for a plain string field — no enum, just
`self.status = "pending"` — and mistype a transition:

```python
class Order:
    def __init__(self, order_id, customer_id):
        self.order_id = order_id
        self.customer_id = customer_id
        self.status = 'pending'

order = Order(order_id=501, customer_id=17)
order.status = 'shiped'
print('status:', order.status)
print('status == "shipped":', order.status == 'shipped')
```

Run for real, this is what comes back:

```
status: shiped
status == "shipped": False
```

No error, anywhere — `order.status` is now permanently `"shiped"`, a
fourth, accidental, meaningless state that will silently fail every
comparison against the real `"shipped"` string forever, or until someone
notices by hand. Restore the enum and make the identical mistake —
referencing a member that doesn't exist, `OrderStatus.SHIPED` instead of
`OrderStatus.SHIPPED`:

```python
from enum import Enum

class OrderStatus(Enum):
    PENDING = 'pending'
    PAID = 'paid'
    SHIPPED = 'shipped'
    DELIVERED = 'delivered'
    CANCELLED = 'cancelled'

x = OrderStatus.SHIPED
```

This time, real output:

```
AttributeError: type object 'OrderStatus' has no attribute 'SHIPED'
```

The typo is now impossible to miss — it fails immediately, loudly, at
the exact line the mistake was made, instead of getting stored
successfully and failing silently somewhere else, later, against a
completely different piece of code that had no way to know a typo ever
happened.

## Exercises

1. Add a sixth real business state, `RETURNED`, as a member of
   `OrderStatus`, and update `can_cancel` if returned orders should
   also be uncancellable. Run the same scenario from "Run It" but end it
   in `RETURNED` instead of `CANCELLED`, and paste the real output.
2. Write a `can_ship(order)` predicate, following the same shape as
   `can_cancel`, that returns `True` only when `order.status` is
   `OrderStatus.PAID`. Prove, by running it, that a `PENDING` order
   cannot ship.
3. Delete the `Enum` import and rewrite `OrderStatus` as five plain
   module-level string constants (`PENDING = "pending"`, etc.) instead
   of enum members. Run the exact "what breaks without this" typo
   scenario again against this version and compare the real output to
   both versions shown above.

## Definition of Done

- [ ] `OrderStatus` replaces all four boolean fields on `Order`, with no
      boolean fulfillment flags left anywhere in the file.
- [ ] `can_cancel` reads only `order.status`, never a boolean flag.
- [ ] The "Run It" scenario above runs against your own file and
      produces output matching what's pasted here.
- [ ] The typo comparison in "What breaks without this" has been run
      against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `state:
      collapse Order's four fulfillment booleans into one closed
      OrderStatus so a shipped+cancelled order can no longer be
      constructed`, not `add enum`.

Up next: Lesson 46, Lifecycle Modeling — which transitions between these
five states are actually legal, and where that rule should live.
