# Lesson 47: Business Rules

**What you will build.** Paying for an order should be refused when the
paying customer's account is suspended — but `Order.transition_to`,
built in the previous lesson, only ever looks at `self.status`; it has
no way to know anything about the `Customer` who owns the order at all.
This lesson extracts that check into its own named function,
`customer_can_pay`, and calls it from every place an order gets marked
paid, after first proving — for real, not hypothetically — what happens
when the same rule gets reimplemented separately at two different call
sites instead. The transferable problem: a lifecycle's own transition
table can only ever answer questions about *that one entity's* state;
the moment a rule needs a second entity's state too, it stops being
something `Order` can enforce on its own, and needs a home of its own
instead of being re-derived, slightly differently, everywhere it's
needed.

**What you need to know first.** Lifecycle Modeling (Lesson 46) —
`ORDER_TRANSITIONS` and `transition_to`, and specifically the limit
named at the end of that lesson: a transition table only ever consults
the one entity it belongs to. State (Lesson 45) — `OrderStatus` as a
closed set of named values, reused here as the thing `customer_can_pay`
ultimately gates access to. Relationships (Lesson 44) — `Order` and
`Customer` as two separate entities connected by `customer_id`, which is
exactly why `Order` can't answer a question about `Customer` from
inside itself.

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

Still the **Domain model** stage. Carried through: this is the first
lesson in this domain where the *Problem* being solved genuinely can't
be answered by looking at one entity alone — "can this order be paid"
depends on a fact that lives on `Customer`, not `Order`. That's a small,
early preview of a question the *Architecture* stage further down this
same pipeline will have to answer at a much larger scale: when a rule
needs facts that live in more than one place, where does the rule itself
get to live? This lesson answers it at the smallest possible scope — one
named function, called from every site that needs it — without yet
claiming that answer scales to a real distributed system; that's
further down the pipeline than this domain goes.

**Terms introduced in this lesson.** One line each.

- **business rule** — a piece of domain-specific decision logic that
  determines whether an action is allowed, computed from more than a
  single entity's own state. It's named separately from "invariant" or
  "state" because a business rule routinely depends on facts spread
  across more than one entity — naming it as its own thing is what makes
  it possible to give it one home instead of re-deriving it separately
  everywhere it's needed.
- **rule drift** — the specific failure where the same business rule
  gets implemented more than once, in more than one place, and the
  copies slowly stop agreeing with each other as one is updated and the
  others aren't. It's worth naming because it doesn't look like a bug at
  the moment it's introduced — both copies are correct on the day
  they're written — it becomes a bug later, silently, the first time
  only one of them changes.

**Objects and methods used.** None new. This lesson's only new piece,
`customer_can_pay`, is a from-scratch, domain-specific function, not a
language or library construct — its own full treatment lives in this
lesson's Concept Unit below, not here, which is reserved for real
external classes and methods.

## Concept Unit: Naming a Business Rule Once, Instead of Re-Deriving It

### The Problem

A suspended customer should never be able to pay for an order. That
sounds like it belongs inside `Order.transition_to` — except
`transition_to` only has access to `self`, an `Order`, and `Order` has
no `is_suspended` field; that fact lives on `Customer`, a different
entity, connected only by `customer_id`. So the check has to happen
somewhere that has *both* objects in hand — typically, at whatever code
actually calls `order.transition_to(OrderStatus.PAID)`. A real system
usually has more than one such call site: a customer paying through
checkout on the website is one path; a nightly batch job reconciling
payments that came in through a different channel is another. Here they
are, run for real, with a suspended customer:

```python
def mark_paid_via_web_checkout(order, customer):
    if customer.is_suspended:
        raise InvalidTransition(
            f"customer {customer.customer_id} is suspended, cannot pay"
        )
    order.transition_to(OrderStatus.PAID)


def mark_paid_via_batch_reconciliation(order, customer):
    order.transition_to(OrderStatus.PAID)


customer = Customer(customer_id=17, name="Dana")
customer.is_suspended = True
order = Order(order_id=501, customer_id=17)

try:
    mark_paid_via_web_checkout(order, customer)
except InvalidTransition as e:
    print("web checkout error:", e)

mark_paid_via_batch_reconciliation(order, customer)
print("status after batch reconciliation:", order.status)
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
web checkout error: customer 17 is suspended, cannot pay
status after batch reconciliation: OrderStatus.PAID
```

The web checkout path correctly refuses. The batch path, written
separately, simply forgot the check — nothing links the two functions
together, so nothing forced the second one to stay consistent with the
first. `order.status` ends up `PAID` for a suspended customer, through a
perfectly legal `ORDER_TRANSITIONS` move (`PENDING → PAID` really is
allowed) that the *lifecycle* rule from the previous lesson has no
grounds to reject — the rule that was actually violated lives one level
up, in the relationship between this order and its customer, and it was
only ever enforced in one of the two places that needed it. This is
**rule drift**: not a typo, not a crash, just the same rule, written
twice, quietly disagreeing with itself.

### Project Change

- **Reference Source:** none — a from-scratch addition continuing this
  curriculum's own running `Order`/`Customer` example, not a port of an
  external reference codebase.
- **Files affected:** `orders.py` (same file as the previous two
  lessons), modified.
- **Change type:** refactor — the suspension check moves out of
  `mark_paid_via_web_checkout`'s own body and into a new, shared
  function; `mark_paid_via_batch_reconciliation` is corrected to call
  that same shared function instead of skipping the check entirely.
- **Location:** `customer_can_pay` is added at module level, near
  `Customer`; both `mark_paid_via_*` functions are rewritten to call it
  first.
- **Dependencies:** none beyond what the previous two lessons already
  added.

### The New Code

The smallest new piece is the rule itself, extracted into its own named
function:

```python
def customer_can_pay(customer):
    return not customer.is_suspended
```

### The Updated Project

Both call sites now route through that one function instead of each
holding — or, in one case, forgetting — their own copy of the check:

```python
class Customer:
    def __init__(self, customer_id, name):
        self.customer_id = customer_id
        self.name = name
        self.is_suspended = False


def customer_can_pay(customer):                        # ← new
    return not customer.is_suspended                     # ← new


def mark_paid_via_web_checkout(order, customer):
    if not customer_can_pay(customer):                   # ← changed
        raise InvalidTransition(
            f"customer {customer.customer_id} is suspended, cannot pay"
        )
    order.transition_to(OrderStatus.PAID)


def mark_paid_via_batch_reconciliation(order, customer):
    if not customer_can_pay(customer):                   # ← new
        raise InvalidTransition(                          # ← new
            f"customer {customer.customer_id} is suspended, cannot pay"  # ← new
        )                                                  # ← new
    order.transition_to(OrderStatus.PAID)
```

Both functions now ask the exact same question, `customer_can_pay
(customer)`, before doing anything else — `mark_paid_via_batch_
reconciliation` no longer has its own, separate opinion about who's
allowed to pay; it defers to the one function that owns that opinion.

### Isolating the Concept: One Named Rule, Two Call Sites

The pattern doing the real work above — a boolean-returning function
named after the rule it represents, called from every site that needs
to enforce that rule, instead of each site testing the underlying
condition itself — deserves to be seen on its own. Here it is guarding
library checkout instead of order payment:

```python
class Patron:
    def __init__(self, patron_id):
        self.patron_id = patron_id
        self.owes_fines = False


def patron_can_borrow(patron):
    return not patron.owes_fines


def checkout_at_front_desk(patron, book_title):
    if not patron_can_borrow(patron):
        print(f"denied at front desk: {patron.patron_id} owes fines")
        return
    print(f"checked out '{book_title}' to {patron.patron_id} at front desk")


def checkout_at_kiosk(patron, book_title):
    if not patron_can_borrow(patron):
        print(f"denied at kiosk: {patron.patron_id} owes fines")
        return
    print(f"checked out '{book_title}' to {patron.patron_id} at kiosk")


dana = Patron(patron_id="dana")
dana.owes_fines = True

checkout_at_front_desk(dana, "Design Patterns")
checkout_at_kiosk(dana, "Design Patterns")
```

Running it produces:

```
denied at front desk: dana owes fines
denied at kiosk: dana owes fines
```

This is exactly what `customer_can_pay` is doing above, isolated:
`patron_can_borrow` is the rule, written once; `checkout_at_front_desk`
and `checkout_at_kiosk` are two independent call sites that each ask it
the same question instead of each maintaining their own copy of "does
this patron owe fines." Both correctly refuse Dana, for the identical
reason `mark_paid_via_web_checkout` and (the fixed) `mark_paid_via_
batch_reconciliation` both now correctly refuse a suspended customer —
not because each call site is careful, but because there is only one
place the actual rule could be wrong, and both call sites defer to it.
This throwaway example is now discarded; `Patron` does not appear
anywhere else in this lesson or this project again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`def customer_can_pay(customer):`** — a function definition taking
  one parameter, `customer`. Nothing about this line is new syntax on
  its own — function definitions are assumed prior knowledge in this
  curriculum — but the *role* this specific function plays is the whole
  subject of this lesson: it is the single, named home for one business
  rule, distinguishing it from an ordinary helper function by the fact
  that every place this rule needs enforcing is expected to call this
  exact function rather than re-testing `customer.is_suspended` itself.
- **`return not customer.is_suspended`** — reads the `is_suspended`
  attribute off the `customer` parameter and returns its logical
  negation. The rule is deliberately this small — one attribute, one
  `not` — because the size of the rule isn't the point; the point is
  that it exists in exactly one place, so a future change to *what
  counts as suspended* (adding a second condition, say) only has to
  happen here, once, and both call sites pick it up automatically the
  next time they run.

### CS Lens

Extracting `customer_can_pay` is an application of the same idea behind
a **pure function used as a single source of truth**: a computation with
no side effects, whose result depends only on its inputs, called from
multiple places that all agree to trust its answer rather than compute
their own. This is the same structural idea as a shared library function
versus copy-pasted logic, or a single validation function referenced by
both a client and a server instead of two independently-written
validators quietly drifting apart — the mechanism is always "one
computation, many callers," whether the callers are two functions in one
file or two entirely different services deployed separately.

Also recognized in: shared validation logic between a web form's
client-side and server-side checks, a single tax-calculation function
called by both an invoicing system and a reporting system, database
CHECK constraints as the single enforced copy of a rule an application
layer might otherwise reimplement inconsistently, and linter or
type-checker rules defined once and applied uniformly across an entire
codebase instead of enforced ad hoc by convention.

### SE Lens

The principle is **single source of truth**, applied specifically to
domain logic rather than to data: exactly one place in the codebase gets
to decide whether a customer can pay, and every other piece of code that
cares defers to it instead of holding its own opinion. The alternative
that was rejected — leaving the suspension check inline inside each
`mark_paid_via_*` function — isn't wrong on the day it's written; both
copies really were correct when `mark_paid_via_batch_reconciliation` was
first written without the check being needed yet. It becomes wrong
later, the moment the rule changes (say, a second condition for
suspension is added) and only one of the two copies gets updated —
exactly the "Problem" scenario demonstrated above, just one edit-cycle
removed from where drift actually shows up.

The real cost this fix doesn't eliminate: `customer_can_pay` only
protects the call sites that actually call it. Nothing about extracting
the function stops someone from writing a *third* function later — an
admin override, say — that calls `order.transition_to(OrderStatus.PAID)`
directly and never calls `customer_can_pay` at all, recreating the exact
bug this lesson just fixed, in a brand-new location instead of one of
the original two. Naming the rule makes it *possible* to enforce
consistently; it doesn't make inconsistency *impossible* the way Lesson
45's `Enum` made an invalid `OrderStatus` value impossible to construct
at all — this is a weaker, cheaper guarantee, and it's honest to be
clear about which kind this is.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, the path to a `.py`
file, executes that file's statements top to bottom in a fresh
interpreter process. Success looks like exactly the `print(...)` output
appearing in order, with no traceback beneath it.

### Run It

Running the corrected version, with the same suspended customer both
`mark_paid_via_*` functions now correctly refuse:

```python
customer = Customer(customer_id=17, name="Dana")
customer.is_suspended = True
order = Order(order_id=501, customer_id=17)

try:
    mark_paid_via_web_checkout(order, customer)
except InvalidTransition as e:
    print("web checkout error:", e)

try:
    mark_paid_via_batch_reconciliation(order, customer)
except InvalidTransition as e:
    print("batch reconciliation error:", e)

print("status:", order.status)
```

The real output:

```
web checkout error: customer 17 is suspended, cannot pay
batch reconciliation error: customer 17 is suspended, cannot pay
status: OrderStatus.PENDING
```

Both call sites now reject the same suspended customer, for the same
reason, with the same message — because both are asking the same
question, `customer_can_pay(customer)`, instead of each maintaining its
own answer. `order.status` never leaves `PENDING`: neither rejected call
reached `order.transition_to` at all, so there's nothing for the
lifecycle's own transition table, from the previous lesson, to even
weigh in on.

### Connecting Back

Where the previous lesson made an order's own next move impossible to
misroute using only facts `Order` already had, this lesson reaches past
`Order`'s own boundary for a fact only `Customer` has — the two lessons
together cover both "what can this entity do on its own" and "what
does it need someone else's state to decide."

## Connect the Pieces

Order `501` moved through this lesson twice, with the identical
suspended customer both times. First, with the rule duplicated: the web
checkout path caught it, the batch reconciliation path didn't, and the
order ended up `PAID` anyway — one rule, two implementations, one of
them wrong. Second, with the rule extracted into `customer_can_pay` and
both call sites rewritten to defer to it: both paths caught it, for the
identical reason, and the order stayed `PENDING`. Nothing about
`Order`'s own `ORDER_TRANSITIONS` table changed between the two runs —
what changed was where the *customer*-level rule lived, and how many
places had their own copy of it.

## What Breaks Without This

Extracting `customer_can_pay` fixed the two call sites that already
existed. It does nothing to stop a third one that never calls it:

```python
def mark_paid_via_admin_override(order, customer):
    order.transition_to(OrderStatus.PAID)


customer = Customer(customer_id=17, name="Dana")
customer.is_suspended = True
order = Order(order_id=501, customer_id=17)

mark_paid_via_admin_override(order, customer)
print("status after admin override, skipping customer_can_pay:", order.status)
```

Run for real, this is what comes back:

```
status after admin override, skipping customer_can_pay: OrderStatus.PAID
```

The suspended customer's order is `PAID` again — not because
`customer_can_pay` was wrong, but because this new function never
called it. A single source of truth only works for the call sites that
actually consult it; it can't reach out and stop a call site that was
never written to ask. That gap — making it structurally hard to change
an order's payment status *without* going through a rule check, rather
than merely making the correct check convenient to call — is a design
question for later in this curriculum, past what naming one function
can guarantee on its own.

## Exercises

1. Add a second condition to `customer_can_pay` — a customer with an
   order total over some threshold might also require a `verified_email`
   flag to be `True` before paying. Update the rule in one place, rerun
   both `mark_paid_via_web_checkout` and `mark_paid_via_batch_
   reconciliation` against an unverified, non-suspended customer, and
   paste the real output proving both call sites picked up the new
   condition automatically.
2. Write `mark_paid_via_admin_override` so that it *does* call
   `customer_can_pay` correctly, and rerun the "What Breaks Without
   This" scenario to prove a suspended customer is refused through all
   three paths now.
3. `patron_can_borrow` and `customer_can_pay` are structurally identical
   functions — one parameter, one attribute, one `not`. Write a short
   paragraph on why this lesson still treats them as two separate
   examples rather than claiming one taught the other for free.

## Definition of Done

- [ ] `customer_can_pay` exists as one function, and both `mark_paid_
      via_web_checkout` and `mark_paid_via_batch_reconciliation` call it
      before calling `order.transition_to`.
- [ ] The "Problem" scenario has been run against your own file with the
      *un*-fixed batch function, reproducing the real drift bug, before
      you apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here.
- [ ] The "What Breaks Without This" admin-override bypass has been run
      against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `business
      rules: extract customer_can_pay so payment eligibility can't drift
      between checkout and batch reconciliation`, not `add helper
      function`.

Up next: Lesson 48, Domain Invariants — rules that must hold for an
entity or a group of entities at every point, not just at the moment one
specific action is attempted.
