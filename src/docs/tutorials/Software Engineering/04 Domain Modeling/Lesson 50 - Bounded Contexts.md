# Lesson 50: Bounded Contexts

**What you will build.** `Customer.is_suspended` means one precise thing
to Billing: payment is on hold. Support, needing some way to flag a
customer as worth extra care, reused that same field as a stand-in for
"at risk" — and the moment Billing starts flipping `is_suspended` for a
routine, temporary reason that has nothing to do with risk (re-verifying
a card on file), Support's dashboard starts lying. This lesson gives
Support its own field, `open_ticket_count`, and its own rule computed
from it, completely decoupled from anything Billing owns. The
transferable problem: two parts of a system can use the exact same word
— "suspended," "active," "at risk" — to mean two different things, and
sharing one field between them doesn't merge those meanings, it just
hides the fact that they were never the same question.

**What you need to know first.** Business Rules (Lesson 47) —
`customer_can_pay`, the specific, correct, *billing-owned* meaning of
`is_suspended` this lesson leaves untouched. Aggregates (Lesson 49) —
`Order` as a protected cluster with one door in; this lesson draws a
similar boundary, but between two different *purposes* for the same
entity rather than between an entity and outside code. Relationships
(Lesson 44) — `Customer` as an entity multiple other parts of the system
refer to, which is exactly why more than one part of the system can end
up reaching for the same field.

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

Still the **Domain model** stage, and the last lesson in this domain to
introduce a genuinely new shape of problem. Carried through: every
previous lesson in this domain drew a boundary around *one* model of
`Order` or `Customer` and protected it. This lesson is the first to ask
what happens when *two different, legitimate* models of the same entity
exist in the same system at once, for two different purposes — a
question the *Architecture* stage further down this pipeline will have
to answer at real scale, when "Billing's Customer" and "Support's
Customer" might not even live in the same service, let alone the same
class.

**Terms introduced in this lesson.** One line each.

- **bounded context** — an explicit boundary within which one particular
  model of the domain applies, outside of which the same real-world
  thing may be modeled differently for a different purpose. It's named
  because without it, two parts of a system quietly assume "the customer"
  means the same thing everywhere, when in practice each part is really
  answering its own, different question that happens to be asked about
  the same underlying entity.
- **context leakage** — when code belonging to one bounded context reads
  or depends on a field whose meaning and lifecycle actually belong to a
  different context, instead of computing its own answer from its own
  data. It's distinguished from ordinary coupling because the two sides
  don't just depend on each other structurally — they silently disagree
  about what the shared thing even *means*, which is what makes the
  failure look like correct code right up until the owning context
  changes the field for a reason the borrowing context never knew about.

**Objects and methods used.** None new. This lesson's fix, giving each
context its own field and its own function to compute from it, uses only
constructs already established in this domain — its own full treatment
is in this lesson's Concept Unit below.

## Concept Unit: One Field, One Owner

### The Problem

Support wants to flag customers worth extra care. `Customer` doesn't
have a field for that yet, but it does have `is_suspended`, sitting
right there, and "suspended sounds risky" — so Support's own
`support_is_high_risk` function reads `customer.is_suspended` directly,
without adding anything new. It works, right up until Billing does
something with `is_suspended` that has nothing to do with risk at all —
a routine, temporary hold while a customer's card on file gets
re-verified:

```python
class Customer:
    def __init__(self, customer_id, name):
        self.customer_id = customer_id
        self.name = name
        self.is_suspended = False  # billing meaning: payment on hold


def billing_start_card_refresh(customer):
    customer.is_suspended = True


def billing_finish_card_refresh(customer):
    customer.is_suspended = False


def support_is_high_risk(customer):
    return customer.is_suspended


customer = Customer(customer_id=17, name="Dana")

billing_start_card_refresh(customer)
print("support sees high risk during routine card refresh:", support_is_high_risk(customer))

billing_finish_card_refresh(customer)
print("support sees high risk after refresh completes:", support_is_high_risk(customer))
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
support sees high risk during routine card refresh: True
support sees high risk after refresh completes: False
```

For the entire duration of a completely routine, completely unrelated
billing operation, Support's dashboard reports Dana as high-risk —
nothing about her behavior changed; nothing support-related happened at
all. `support_is_high_risk` isn't buggy in the way earlier lessons' bugs
were buggy — it does exactly what it was written to do, faithfully
report `customer.is_suspended`. The actual defect is that it was
answering Support's question using Billing's field, and Billing never
agreed to keep that field's meaning stable for Support's sake — because
Billing never knew Support was reading it at all. This is **context
leakage**: not a shared object being misused, a shared object's *field*
being trusted across a boundary neither side drew on purpose.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `Customer` example, not a port of an external
  reference codebase.
- **Files affected:** `customers.py` (this domain's running `Customer`
  example, extended for the first time with a support-specific field).
- **Change type:** add — a new field, `open_ticket_count`, and a new
  function, `support_is_high_risk`, computed from it instead of from
  `is_suspended`.
- **Location:** `open_ticket_count` is added to `Customer.__init__`,
  alongside `is_suspended`; `support_is_high_risk`'s body is rewritten to
  read the new field instead of the old one.
- **Dependencies:** none.

### The New Code

The smallest new piece is Support's own field, and its own rule computed
from it:

```python
self.open_ticket_count = 0  # support's own concept

def support_is_high_risk(customer):
    return customer.open_ticket_count > 3
```

### The Updated Project

`Customer` now carries two fields side by side — one Billing owns, one
Support owns — and each context's own function reads only the field it
owns:

```python
class Customer:
    def __init__(self, customer_id, name):
        self.customer_id = customer_id
        self.name = name
        self.is_suspended = False       # billing's own concept
        self.open_ticket_count = 0      # ← new, support's own concept


def billing_start_card_refresh(customer):
    customer.is_suspended = True


def billing_finish_card_refresh(customer):
    customer.is_suspended = False


def support_is_high_risk(customer):
    return customer.open_ticket_count > 3   # ← changed, was customer.is_suspended
```

Billing's two functions are untouched — `is_suspended` still means
exactly what it always meant, and Billing never has to know Support
exists. `support_is_high_risk` now answers Support's own question from
Support's own data; nothing Billing does to `is_suspended` can move this
function's answer at all anymore.

### Isolating the Concept: Two Departments, Two Fields

The mechanism doing the real work above — giving each side of a boundary
its own field, computed and owned by that side alone, instead of one
side reading a field that belongs to the other — deserves to be seen on
its own. Here it is protecting a hotel room's booking status from its
own cleaning status:

```python
class Room:
    def __init__(self, room_number):
        self.room_number = room_number
        self.is_being_cleaned = False   # housekeeping's own concept
        self.reserved_slots = []        # front desk's own concept


def housekeeping_start_cleaning(room):
    room.is_being_cleaned = True


def housekeeping_finish_cleaning(room):
    room.is_being_cleaned = False


def front_desk_is_bookable(room, slot):
    return slot not in room.reserved_slots


room = Room(room_number=204)
housekeeping_start_cleaning(room)
print("bookable during routine cleaning:", front_desk_is_bookable(room, "2pm-3pm"))

room.reserved_slots.append("2pm-3pm")
print("bookable once actually reserved:", front_desk_is_bookable(room, "2pm-3pm"))

housekeeping_finish_cleaning(room)
```

Running it produces:

```
bookable during routine cleaning: True
bookable once actually reserved: False
```

This is exactly what `Customer` is doing above, isolated: `Room` carries
two fields, `is_being_cleaned` (housekeeping's own concept) and
`reserved_slots` (front desk's own concept), and `front_desk_is_bookable`
reads only the one front desk owns. The room is genuinely being cleaned
the entire time the first `print` runs, and `front_desk_is_bookable`
correctly reports `True` anyway, because whether a room is bookable was
never actually housekeeping's question to answer — the second `print`
shows the *real* front-desk event, an actual reservation, is what
correctly flips the answer to `False`. This throwaway example is now
discarded; `Room` does not appear anywhere else in this lesson or this
project again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`self.open_ticket_count = 0`** — an ordinary instance-attribute
  assignment inside `Customer.__init__`, the same mechanism `is_suspended`
  already uses one line above it. What's new isn't the syntax — it's the
  ownership: this field exists so that Support has *something of its
  own* to compute a rule from, rather than the only option being a field
  someone else already put there for a different reason.
- **`def support_is_high_risk(customer):`** — a function definition
  taking one parameter, unchanged in shape from its previous version;
  what changed is entirely inside the body, not the signature.
- **`return customer.open_ticket_count > 3`** — reads the new field and
  compares it against a literal threshold, `3`, returning the boolean
  result of that comparison directly. The threshold itself is Support's
  own judgment call, arrived at independently of anything Billing does —
  changing it later requires touching this one line and nothing on the
  Billing side at all.

### CS Lens

This is **bounded context**, a Domain-Driven Design term for drawing an
explicit line around where one particular model of a concept applies,
and treating what's on the other side of that line as a different model
of the same real-world thing rather than an extension of this one. It's
the same underlying idea as namespacing in a type system — two
different modules can each define something called `Status` without
colliding, because each `Status` is scoped to its own boundary — applied
to *meaning* instead of to *names*: `is_suspended` and
`open_ticket_count` don't collide as Python identifiers, they were never
going to; the actual risk was one context silently trusting the *other
context's* answer to a question only the second context was ever
supposed to answer.

Also recognized in: a single "Product" meaning something different to a
warehouse system (SKU, weight, bin location) than to a marketing system
(description, images, price display), the same "User" having entirely
separate models in an authentication system (credentials, sessions) and
a recommendation system (browsing history, preferences), organizational
department boundaries where "budget" means something different to
Finance than to Engineering, and API versioning, where `v1`'s and `v2`'s
models of the same resource are deliberately allowed to diverge rather
than forced to share one shape.

### SE Lens

The principle is **each context owns and computes its own answer** —
sharing an *entity* between two parts of a system is fine and often
necessary; sharing one *field's meaning* between two parts that have
different reasons to care about that entity is what actually causes
trouble, because the field's owner can change its meaning, its
lifecycle, or its temporary states for reasons that have nothing to do
with whoever else started relying on it. The alternative that was
rejected — leaving Support's rule reading `is_suspended` — isn't wrong on
the day it's written, the same honest caveat every earlier lesson in
this domain has had to make: it happens to produce the right answer for
as long as Billing's usage of `is_suspended` happens to correlate with
what Support actually cares about, and breaks the moment that
correlation stops holding, without either side's code changing at all.

The real cost of this fix: giving Support its own field means Support
now has to *populate* it correctly — `open_ticket_count` isn't
automatically kept accurate the way borrowing `is_suspended` felt free.
That's not a flaw in this lesson's fix; it's the honest price of not
getting a free, correlated answer from someone else's data. A rule
that's actually about Support's own concerns has to be fed by Support's
own facts, and maintaining that feed is real, ongoing work this lesson
doesn't make disappear — it just moves the work to the side of the
boundary where it actually belongs.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, the path to a `.py`
file, executes that file's statements top to bottom in a fresh
interpreter process. Success looks like exactly the `print(...)` output
appearing in order, with no traceback beneath it.

### Run It

Running the fixed version, through the identical routine billing event
that broke the borrowed version, plus a real support-owned event:

```python
customer = Customer(customer_id=17, name="Dana")

billing_start_card_refresh(customer)
print("support sees high risk during routine card refresh:", support_is_high_risk(customer))

customer.open_ticket_count = 5
print("support sees high risk with 5 open tickets:", support_is_high_risk(customer))

billing_finish_card_refresh(customer)
print("support sees high risk after refresh completes:", support_is_high_risk(customer))
```

The real output:

```
support sees high risk during routine card refresh: False
support sees high risk with 5 open tickets: True
support sees high risk after refresh completes: True
```

The first line is the fix, proven: the identical routine billing event
that used to make Support falsely report `True` now correctly reports
`False`, because `support_is_high_risk` never looks at `is_suspended`
anymore. The second line is the honest cost from the SE Lens made
concrete: Support's answer only changes once Support's *own* data
changes — five open tickets, a fact nothing about billing knows or
needs to know. The third line proves the two contexts are now genuinely
independent: billing's refresh finishing has no effect on Support's
answer at all, which stays `True` because the tickets are still open.

### Connecting Back

Where Lesson 49 protected `Order`'s data from being reached by *outside*
code at all, this lesson protects two *legitimate* parts of the system
from silently trusting each other's data for the wrong reason — the
boundary moves from "inside this aggregate versus outside it" to
"this context's meaning versus that context's meaning," even when both
contexts are looking at the exact same customer.

## Connect the Pieces

Customer `17` moved through this lesson twice, with the identical
routine billing event both times: a temporary, unrelated card-refresh
hold. First, with Support borrowing `is_suspended` directly: the
dashboard reported her high-risk for the full duration of that routine
hold, with nothing support-related actually happening. Second, with
Support computing its own answer from its own `open_ticket_count`: the
identical billing event produced no change in Support's answer at all —
`False` throughout, exactly correct, because a card refresh was never a
fact Support's question was ever supposed to depend on.

## What Breaks Without This

Giving Support its own field fixes the specific leak this lesson found.
It does nothing to stop a *third* context, added later, from making the
same mistake in the other direction — reading `open_ticket_count`,
Support's own field, as a shortcut for some new context's own question:

```python
def marketing_should_send_survey(customer):
    # marketing borrows support's field as a stand-in for "unhappy"
    return customer.open_ticket_count > 0


customer = Customer(customer_id=17, name="Dana")
customer.open_ticket_count = 1  # a single ticket, opened for a routine question

print("marketing thinks customer is unhappy:", marketing_should_send_survey(customer))
```

Run for real, this is what comes back:

```
marketing thinks customer is unhappy: True
```

One open ticket, for something completely routine — a shipping-address
question, say — and Marketing now believes Dana is unhappy enough to
need a satisfaction survey, purely because it reused Support's field the
same way Support once reused Billing's. Fixing one leak doesn't
immunize a codebase against the next one; it proves the pattern and the
fix, not a permanent guarantee that nobody will reach for someone else's
field again next quarter, for a new context this lesson never
anticipated.

## Exercises

1. Give Marketing its own field, `has_unresolved_complaint`, set only by
   Marketing's own logic (not derived from `open_ticket_count`), and
   rewrite `marketing_should_send_survey` to use it instead. Rerun the
   "What Breaks Without This" scenario's single-routine-ticket case and
   confirm, with real output, that Marketing no longer wrongly flags
   Dana.
2. `Room` and `Customer` both end up with exactly two fields, one per
   context. Write a third context for `Room` — a maintenance team that
   cares whether a room needs a repair — and prove, the same way this
   lesson did, that a routine housekeeping cleaning event has zero effect
   on maintenance's own answer.
3. Every bounded context in this lesson's examples happened to live in
   the same Python file, reading the same in-memory object. Write two or
   three sentences on what would have to change about how Billing and
   Support communicate if they were two entirely separate services that
   don't share memory at all — would `is_suspended` and
   `open_ticket_count` still make sense as fields on one shared object?

## Definition of Done

- [ ] `support_is_high_risk` reads only `open_ticket_count`, never
      `is_suspended`.
- [ ] The "Problem" scenario has been run against the *original*,
      borrowing version of `support_is_high_risk`, reproducing the real
      leakage bug, before you apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here.
- [ ] The "What Breaks Without This" Marketing scenario has been run
      against your own file, not just read, and you can state in one
      sentence which context's field it borrows and why that's the same
      mistake this lesson already fixed once.
- [ ] Commit, with a message stating *why*: something like `bounded
      contexts: give Support its own open_ticket_count instead of
      reading Billing's is_suspended, so a routine card refresh stops
      corrupting the support dashboard`, not `add open_ticket_count
      field`.

Up next: Lesson 51, Domain Language — closing this domain by naming the
other half of what a bounded context guarantees: not just that each
context owns its own data, but that a term used inside one context means
exactly one precise thing to everyone working in it.
