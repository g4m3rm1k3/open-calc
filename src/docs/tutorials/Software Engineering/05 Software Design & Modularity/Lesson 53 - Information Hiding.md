# Lesson 53: Information Hiding

**What you will build.** `order_lifecycle.ORDER_TRANSITIONS` is a public
module-level dict — nothing stops another module, like a reporting
function, from reading it directly to answer its own question ("is this
order cancellable"). That works, right up until `order_lifecycle.py`'s
own maintainer makes a completely reasonable internal change — renaming
the dict to `_ORDER_TRANSITIONS` and exposing a `can_transition`
function instead — and every piece of code that reached directly into
the old name breaks. The transferable problem: a module boundary
(Lesson 52) stops two names from colliding, but it does nothing to stop
other code from depending on a name that was never meant to be a
promise. Information hiding is the deliberate choice about which of a
module's names *are* that promise, and which are free to change.

**What you need to know first.** What Is a Module? (Lesson 52) — a
module as a namespace boundary; this lesson asks a different question
about the same boundary: not "does this name collide," but "should this
name be depended on at all." Aggregates (Lesson 49) — the identical
principle at the level of one object's own fields (`Order._lines`);
this lesson applies it to an entire module's internal data instead.
Lifecycle Modeling (Lesson 46) — `ORDER_TRANSITIONS`, the exact piece of
data this lesson now hides behind a function.

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

Still the **Design** stage. Carried through: Lesson 52 answered "which
namespace does a name live in"; this lesson answers "which of a
namespace's names is anyone outside it actually allowed to depend on" —
the same question the *Architecture* stage further down this pipeline
will ask again about entire services instead of one module's own
internal dict.

**Terms introduced in this lesson.** One line each.

- **information hiding** — the design principle of hiding a module's
  internal implementation decisions behind a stable interface, so other
  code depends on what a module does, not how it does it internally.
  It's named separately from a module boundary because a boundary alone
  doesn't stop external code from reaching into and depending on
  whatever it happens to be able to see — information hiding is the
  deliberate choice about which visible names are actually promised to
  stay stable.
- **implementation detail** — a design decision inside a module that's
  free to change without breaking anything outside it, as long as the
  module's public interface keeps behaving the same way. It's worth
  naming because a maintainer can only change something with confidence
  once they know whether it's this — free to change — or a promise
  someone else's code already depends on.
- **public interface** (of a module) — the specific names a module
  intends for other code to depend on, where changing one is considered
  a breaking change. It's distinguished from everything else a module
  happens to expose only because Python itself doesn't force anything to
  be hidden — the interface is a decision the module's author makes, not
  a fact the language enforces for them.

**Objects and methods used.** None new — this lesson's fix reuses the
leading-underscore convention already established for a single object's
own fields (Lesson 49), applied here to a module-level name instead.

## Concept Unit: A Public Name Is a Promise

### The Problem

`order_lifecycle.py` exposes `ORDER_TRANSITIONS` as an ordinary,
public, module-level dict. A reporting function, in a different module,
wants to know which orders are still cancellable — and rather than
asking `order_lifecycle` for an answer, it reaches directly into the
dict itself:

```python
import order_lifecycle


def cancellable_orders(orders):
    return [
        order
        for order in orders
        if order_lifecycle.OrderStatus.CANCELLED
        in order_lifecycle.ORDER_TRANSITIONS[order.status]
    ]


order1 = order_lifecycle.Order(order_id=501, customer_id=17)
order2 = order_lifecycle.Order(order_id=502, customer_id=18)
order2.transition_to(order_lifecycle.OrderStatus.PAID)
order2.transition_to(order_lifecycle.OrderStatus.SHIPPED)

result = cancellable_orders([order1, order2])
print("cancellable order ids:", [o.order_id for o in result])
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
cancellable order ids: [501]
```

Correct — order `501` is still `PENDING`, order `502` has already
shipped. Nothing here is a bug yet. But `order_lifecycle.py`'s own
maintainer, for a real and legitimate reason — say, deciding that
`can_transition` deserves to be a proper function instead of a bare
dict lookup other modules keep re-implementing themselves — renames
`ORDER_TRANSITIONS` to `_ORDER_TRANSITIONS` and adds a `can_transition`
function on top of it. Rerunning the exact same reporting code against
that new version:

```python
import order_lifecycle3 as order_lifecycle


def cancellable_orders(orders):
    return [
        order
        for order in orders
        if order_lifecycle.OrderStatus.CANCELLED
        in order_lifecycle.ORDER_TRANSITIONS[order.status]
    ]


order1 = order_lifecycle.Order(order_id=501, customer_id=17)
try:
    result = cancellable_orders([order1])
    print("cancellable order ids:", [o.order_id for o in result])
except AttributeError as e:
    print("AttributeError:", e)
```

The real output:

```
AttributeError: module 'order_lifecycle3' has no attribute 'ORDER_TRANSITIONS'
```

Nothing about `order_lifecycle.py`'s actual behavior changed — every
transition it allows or forbids is identical to before. The reporting
code broke anyway, because it never depended on `order_lifecycle`'s
*behavior*; it depended on one specific internal name the module never
promised to keep.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `order_lifecycle` module, not a port of an
  external reference codebase.
- **Files affected:** `order_lifecycle.py`, modified; the reporting
  function, modified to match.
- **Change type:** refactor — `ORDER_TRANSITIONS` is renamed to
  `_ORDER_TRANSITIONS`; a new `can_transition` function is added as the
  module's real public interface for this question.
- **Location:** module level in `order_lifecycle.py`, alongside the
  existing `OrderStatus` and `Order`; `Order.transition_to` itself is
  also updated to call the new function instead of touching the dict
  directly, so there's exactly one place the check is implemented.
- **Dependencies:** none.

### The New Code

The smallest new piece is the function that becomes the module's real,
stable answer to "is this transition legal":

```python
def can_transition(current_status, target_status):
    return target_status in _ORDER_TRANSITIONS[current_status]
```

### The Updated Project

`_ORDER_TRANSITIONS` becomes private; `can_transition` becomes the one
sanctioned way anything — inside the module or outside it — asks
whether a move is legal, and `transition_to` itself is rewritten to use
it instead of duplicating the check:

```python
_ORDER_TRANSITIONS = {                                              # ← renamed from ORDER_TRANSITIONS
    OrderStatus.PENDING: {OrderStatus.PAID, OrderStatus.CANCELLED},
    OrderStatus.PAID: {OrderStatus.SHIPPED, OrderStatus.CANCELLED},
    OrderStatus.SHIPPED: {OrderStatus.DELIVERED},
    OrderStatus.DELIVERED: {OrderStatus.RETURNED},
    OrderStatus.CANCELLED: set(),
    OrderStatus.RETURNED: set(),
}


class Order:
    def __init__(self, order_id, customer_id):
        self.order_id = order_id
        self.customer_id = customer_id
        self.status = OrderStatus.PENDING

    def transition_to(self, new_status):
        if not can_transition(self.status, new_status):            # ← changed
            raise InvalidTransition(
                f"{self.status} cannot transition to {new_status}"
            )
        self.status = new_status


def can_transition(current_status, target_status):                  # ← new
    return target_status in _ORDER_TRANSITIONS[current_status]       # ← new
```

`_ORDER_TRANSITIONS`'s exact shape — a dict of sets — is now something
only this file's own code ever touches directly; `transition_to` and
`can_transition` both read it, and nothing outside `order_lifecycle.py`
has any reason to know it's a dict of sets at all instead of, say, a
database query or a different data structure entirely.

### Isolating the Concept: Same Question, Stable Interface

The mechanism doing the real work above — an internal name renamed with
a leading underscore, and a function that answers the same question the
dict used to answer directly — is the reporting function's own fix,
shown directly rather than through a separate, unrelated example: the
same `cancellable_orders`, rewritten to go through `can_transition`
instead of `ORDER_TRANSITIONS`:

```python
import order_lifecycle3 as order_lifecycle


def cancellable_orders(orders):
    return [
        order
        for order in orders
        if order_lifecycle.can_transition(order.status, order_lifecycle.OrderStatus.CANCELLED)
    ]


order1 = order_lifecycle.Order(order_id=501, customer_id=17)
order2 = order_lifecycle.Order(order_id=502, customer_id=18)
order2.transition_to(order_lifecycle.OrderStatus.PAID)
order2.transition_to(order_lifecycle.OrderStatus.SHIPPED)

result = cancellable_orders([order1, order2])
print("cancellable order ids:", [o.order_id for o in result])
```

Running it produces:

```
cancellable order ids: [501]
```

Identical output to the very first, pre-refactor run — the reporting
function's actual answer never changed, because `can_transition`'s
*behavior* is exactly what `ORDER_TRANSITIONS[status]` used to compute
directly. What changed is that `cancellable_orders` no longer knows or
cares whether that answer comes from a dict of sets, a database call, or
anything else `order_lifecycle.py` might become internally in the
future.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`def can_transition(current_status, target_status):`** — a function
  definition taking two parameters, the same shape as `customer_can_pay`
  from Lesson 47: a named, callable answer to one specific question,
  rather than a fact left for callers to compute themselves.
- **`return target_status in _ORDER_TRANSITIONS[current_status]`** —
  looks up `current_status` in the now-private `_ORDER_TRANSITIONS`
  dict, exactly as `transition_to`'s own guard already did before this
  lesson, and checks whether `target_status` is a member of the
  resulting set. The mechanics are unchanged from Lesson 46; what moved
  is which code is allowed to run this exact line — now only code inside
  `order_lifecycle.py` itself, since `_ORDER_TRANSITIONS` carries the
  underscore that signals "internal" the same way `Order._lines` did in
  Lesson 49.

### CS Lens

This is **information hiding**, first named by David Parnas: a module
should be designed around the design decisions most likely to change,
hiding each one behind an interface stable enough that the rest of the
system never has to know when the decision changes. `_ORDER_TRANSITIONS`
being a dict of sets is exactly this kind of decision — a reasonable
choice today, but not a fact worth the rest of the system depending on,
the same way a database's own internal storage format isn't something
application code should ever directly parse, or a compiled library's
private memory layout isn't something calling code should ever reach
into instead of using its published API.

Also recognized in: a database's row storage format hidden behind SQL,
a library's public API hiding its internal data structures behind
documented function calls, an operating system's file system hiding
disk block layout behind a `read`/`write` interface, and a REST API
hiding its own database schema behind versioned JSON responses.

### SE Lens

The principle is **hide what's likely to change, expose what other code
actually needs** — the alternative that was in place before this lesson,
a fully public `ORDER_TRANSITIONS`, isn't wrong on the day it's written,
the same honest caveat this domain and the last one have both had to
make repeatedly: it works exactly as well as the hidden-interface
version, right up until the internal representation changes for a real
reason, at which point every piece of code that reached past the
interface breaks, not because it was used incorrectly, but because it
was never told which names were safe to depend on. The real cost of the
fix: `can_transition` has to be actively maintained as a real,
documented promise now — if `order_lifecycle.py`'s maintainer ever wants
to change *its* behavior, not just its internals, that's now understood
to be a breaking change to every module that depends on it, which is
exactly the tradeoff information hiding is making on purpose: fewer
things are free to change without warning, in exchange for the ones that
are being genuinely, safely free.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py`, run from
the directory containing `order_lifecycle.py` — the `python` program,
given one positional argument, executes that file's statements top to
bottom, importing whatever other local modules it names along the way.

### Run It

Running the fixed reporting function against the refactored module:

```python
import order_lifecycle3 as order_lifecycle


def cancellable_orders(orders):
    return [
        order
        for order in orders
        if order_lifecycle.can_transition(order.status, order_lifecycle.OrderStatus.CANCELLED)
    ]


order1 = order_lifecycle.Order(order_id=501, customer_id=17)
order2 = order_lifecycle.Order(order_id=502, customer_id=18)
order2.transition_to(order_lifecycle.OrderStatus.PAID)
order2.transition_to(order_lifecycle.OrderStatus.SHIPPED)

result = cancellable_orders([order1, order2])
print("cancellable order ids:", [o.order_id for o in result])
```

The real output:

```
cancellable order ids: [501]
```

Exactly the same real answer as the very first version of this lesson's
own reporting function, before anything about `order_lifecycle.py`
changed internally — proving the fix doesn't just avoid the
`AttributeError`, it preserves the correct behavior across a real
internal refactor, which is the entire point of hiding the
implementation in the first place.

### Connecting Back

Where Lesson 52 made sure two names in two different modules couldn't
collide, this lesson makes sure a name inside one module can change
without breaking every other module that happened to be able to see it
— the same instinct as drawing a boundary, now applied to *which* names
crossing that boundary are actually promises.

## Connect the Pieces

The question "is order `501` cancellable" was answered three times in
this lesson, always correctly, through two different mechanisms. First,
directly against `ORDER_TRANSITIONS`: correct, and silently coupled to
the dict's exact shape. Second, against the identical direct-dict code
after `order_lifecycle.py`'s internals changed: an `AttributeError`,
proving the coupling was real. Third, against `can_transition`, both
before and after the same internal change: correct both times, with
identical output, because the reporting code was never touching
anything but the one interface `order_lifecycle.py` actually promised to
keep stable.

## What Breaks Without This

`can_transition` protects against the *sanctioned* boundary. Nothing
stops code that already knows about `_ORDER_TRANSITIONS`'s real name
from reaching past the underscore anyway — the identical honest limit
Lesson 49 already proved for `Order._lines`:

```python
import order_lifecycle3 as order_lifecycle

order1 = order_lifecycle.Order(order_id=501, customer_id=17)
print(
    "reaching past the underscore:",
    order_lifecycle.OrderStatus.CANCELLED
    in order_lifecycle._ORDER_TRANSITIONS[order1.status],
)
```

Run for real, this is what comes back:

```
reaching past the underscore: True
```

It still works — Python's underscore convention was never a lock, here
any more than it was on a single object's own fields. `_ORDER_TRANSITIONS`
is reachable, readable, and even mutable from outside the module, by
anyone willing to type the underscore deliberately. This lesson's real
guarantee protects code that goes through `can_transition`, the way it's
supposed to be reached; it protects nothing from a caller who decides
the leading underscore is a suggestion rather than a boundary.

## Exercises

1. Change `_ORDER_TRANSITIONS`'s internal shape a second time — from a
   dict of sets to a dict of dicts, where each value maps a legal target
   status to a short reason string (`{OrderStatus.CANCELLED: "customer
   request"}`). Update `can_transition` to match, and rerun this lesson's
   own "Run It" scenario unchanged, proving the reporting function still
   produces identical output despite the deeper internal change.
2. Add a second public function, `legal_next_statuses(status)`, returning
   the set of statuses reachable from a given one, without exposing
   `_ORDER_TRANSITIONS` itself. Use it to rewrite Lesson 46's own
   exercise-2 `legal_next_states` function so it no longer needs to know
   `_ORDER_TRANSITIONS` exists at all.
3. `customer_activity.py`, from the previous lesson, has no private data
   yet. Add an internal detail to it (say, the exact threshold used to
   decide "recent") behind a leading underscore, expose a
   `days_considered_recent()` function instead of the bare number, and
   prove, by changing the threshold, that external code reading it
   through the function picks up the change automatically.

## Definition of Done

- [ ] `order_lifecycle.py`'s transition data is named with a leading
      underscore, and `can_transition` is the one public function
      answering "is this transition legal."
- [ ] The Problem section's breakage has been reproduced for real, using
      the *pre-refactor* reporting code against the *renamed* internal
      dict, before you apply the interface-based fix.
- [ ] The "Run It" scenario above runs against your own refactored
      module and produces output matching what's pasted here.
- [ ] The "What Breaks Without This" underscore-bypass has been run
      against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `information
      hiding: expose can_transition instead of the raw transitions dict,
      so order_lifecycle's internal representation can change without
      breaking every caller`, not `rename dict, add function`.

Up next: Lesson 54, Encapsulation — the same principle this lesson
applied to a module's own data, now formalized as the general practice
of bundling data with the behavior that's allowed to touch it.
