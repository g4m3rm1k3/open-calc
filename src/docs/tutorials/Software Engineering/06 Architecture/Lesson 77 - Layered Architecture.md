# Lesson 77: Layered Architecture

**What you will build.** An admin panel needs a "quick fix" to mark a
stuck order paid, and the fastest path is calling
`db_set_order_status(order_id, "paid")` directly — skipping the business
logic layer entirely, straight into the data layer. It works, in the
sense that the row updates. It also marks a suspended customer's order
paid, silently, because `customer_can_pay` — the exact check that
exists specifically to stop that — lives in the layer this shortcut
skipped over. This lesson fixes it by routing the admin panel through
`mark_paid_via_business_logic`, the same function every other path to
"pay" already goes through, so the presentation layer never touches the
data layer directly again. The transferable problem: Lessons 72 and 73
each decided one pairwise boundary's direction; **layered architecture**
is the decision that applies to an entire system at once — every layer
may call the layer directly below it, and only that layer, so no future
shortcut can skip past a protection nobody remembered was there.

**What you need to know first.** What Is Architecture? (Lesson 72) —
one pairwise dependency decision; this lesson generalizes it into a rule
for an entire system's layers at once. Business Rules (Lesson 47) —
`customer_can_pay`, the exact protection this lesson's bug bypasses.
State Ownership (Lesson 68) — the identical shape of failure, a
duplicate or bypassed owner, now happening because of *which layer* a
caller lives in rather than which specific function it calls.

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

Still the **Architecture** stage. Carried through: Lessons 72 and 73
each decided one boundary; this lesson names the rule that decides every
boundary in a system at once — a fixed order of layers, each one only
reachable from directly above it.

**Terms introduced in this lesson.** One line each.

- **layered architecture** — organizing a system's modules into named,
  ordered layers — commonly presentation, business logic, and data
  access — where each layer is only allowed to call directly into the
  layer immediately below it, never skip a layer or call upward. It's
  the system-wide version of the pairwise direction decisions Lessons 72
  and 73 already made, applied once, as a rule, instead of decided pair
  by pair.
- **layer skipping** — when code in one layer calls directly into a
  layer more than one level below it, bypassing whatever validation or
  logic the skipped layer would otherwise have applied. It's named
  because the skip itself isn't the failure — the failure is that
  whatever the skipped layer was responsible for enforcing gets
  bypassed along with it, silently, exactly the way this lesson's admin
  panel bypassed `customer_can_pay`.

**Objects and methods used.** None new — this lesson's fix is calling
one function instead of a different one; what's new is naming the rule
that decides which calls are ever allowed to exist at all.

## Concept Unit: Skipping a Layer Skips What That Layer Was Protecting

### The Problem

An admin panel needs to mark a stuck order paid, quickly:

```python
_orders_table = {501: {"status": "pending", "customer_id": 17, "is_suspended": True}}


def db_set_order_status(order_id, status):
    _orders_table[order_id]["status"] = status


def admin_quick_fix_mark_paid(order_id):
    db_set_order_status(order_id, "paid")
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. The customer who owns this order is
suspended — `customer_can_pay`, defined in the business logic layer,
exists specifically to stop this exact case:

```python
def customer_can_pay(order_id):
    return not _orders_table[order_id]["is_suspended"]


def mark_paid_via_business_logic(order_id):
    if not customer_can_pay(order_id):
        raise ValueError("customer is suspended, cannot pay")
    db_set_order_status(order_id, "paid")


admin_quick_fix_mark_paid(501)
print("order status after admin quick fix, bypassing business logic layer:", _orders_table[501]["status"])
```

Running it produces:

```
order status after admin quick fix, bypassing business logic layer: paid
```

`mark_paid_via_business_logic` was never called. `admin_quick_fix_mark_
paid` called `db_set_order_status` directly — the data layer, two levels
below the presentation layer it lives in — and nothing about the data
layer itself knows or cares whether this customer is suspended; that
check was never its job. The suspension check exists, is correctly
written, and simply never runs, because the call that was supposed to
reach it went around it instead.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** the admin panel's own code, modified.
- **Change type:** refactor — replace the direct data-layer call with a
  call to the business logic layer.
- **Location:** `admin_quick_fix_mark_paid`'s own body.
- **Dependencies:** none.

### The New Code

The smallest new piece is the single call that replaces the shortcut:

```python
def admin_quick_fix_mark_paid(order_id):
    mark_paid_via_business_logic(order_id)
```

### The Updated Project

The admin panel's function body shrinks to one line, delegating to the
one business-logic function every other "mark paid" path already uses:

```python
def admin_quick_fix_mark_paid(order_id):                        # ← changed
    mark_paid_via_business_logic(order_id)                        # ← changed, replaces direct db_set_order_status call
```

`admin_quick_fix_mark_paid` no longer has any way to reach the data
layer except through the business logic layer — the exact rule this
lesson names: presentation calls business logic, business logic calls
data access, and nothing calls two layers down at once.

### Isolating the Concept: Each Layer Reachable Only From Directly Above

The mechanism this lesson enforces — a fixed calling order between named
layers, with no layer allowed to reach past the one directly below it —
is shown directly through the real admin-panel code above rather than a
separate, unrelated example, since a layering violation is, structurally,
already the smallest possible demonstration of what this lesson is
about. Running the fixed admin panel against the identical suspended
customer:

```python
try:
    admin_quick_fix_mark_paid(501)
except ValueError as e:
    print("ValueError:", e)
print("order status:", _orders_table[501]["status"])
```

Running it produces:

```
ValueError: customer is suspended, cannot pay
order status: pending
```

The identical "quick fix" call, from the identical presentation-layer
function, now correctly refuses — not because the admin panel itself
learned anything new about suspension, but because it's no longer able
to reach the data layer without going through the layer that knows to
check.

### Mechanical Walkthrough

Working through the one syntactic element that actually changed:

- **`mark_paid_via_business_logic(order_id)`** — a single function call,
  replacing `db_set_order_status(order_id, "paid")`. Nothing about this
  line is new syntax; what changed is which layer's function
  `admin_quick_fix_mark_paid` is now allowed to name at all.

### CS Lens

This is **layered architecture**, one of the oldest and most widely used
architectural patterns, closely related to the **OSI network model**'s
own strict layering: each layer in a network stack only ever hands data
to the layer directly above or below it, never skipping straight from
the application layer to the physical layer — the identical discipline
this lesson applies to a presentation/business-logic/data-access stack.
Layer skipping is the same category of failure as a network application
trying to write raw bits directly to a network card instead of going
through the transport and network layers that handle addressing,
retries, and error correction on its behalf.

Also recognized in: a web application's MVC framework, where a
controller is expected to call a service layer rather than an ORM model
directly, mobile app architectures with a strict UI-layer /
domain-layer / data-layer separation, and any codebase with a linter
rule enforcing "no direct database imports outside the repository
layer."

### SE Lens

The principle is **a layer's protections only apply to callers that
actually go through it** — the alternative that produced this lesson's
bug, a "quick fix" reaching straight into the data layer, wasn't
malicious or even careless in an obvious way; it was the fastest path to
a real, urgent goal (unstick this order right now), and nothing about
the data layer's own code signaled that skipping business logic was
dangerous. The real cost of enforcing strict layering: a genuinely
urgent admin fix that doesn't fit any existing business-logic function
now has no fast path at all — it has to go through, or extend, the
business logic layer properly, which is slower under pressure, in
exchange for never again silently bypassing a check the data layer was
never responsible for making.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the fixed admin panel against a *non*-suspended customer, to
confirm the fix doesn't just refuse everything:

```python
_orders_table[502] = {"status": "pending", "customer_id": 18, "is_suspended": False}
admin_quick_fix_mark_paid(502)
print("order 502 status:", _orders_table[502]["status"])
```

The real output:

```
order 502 status: paid
```

A legitimate quick fix, for a customer who's actually allowed to pay,
still succeeds through the same layered path — the fix isn't "admins
can't fix anything anymore," it's "every fix goes through the layer
that knows the real rules," and a customer with nothing suspicious
about their account still gets marked paid correctly.

### Connecting Back

Where Lesson 76 declared one shared policy every boundary in a system
inherits automatically, this lesson declares one shared *order* every
layer in a system must call in — the same underlying goal, protection
that doesn't depend on every caller remembering it by hand, applied to
the sequence of calls instead of to a specific field.

## Connect the Pieces

Order `501`, owned by a suspended customer, was marked paid twice in
this lesson through the identical "quick fix" call. First, reaching
straight into the data layer: `paid`, silently, with the suspension
check never running at all. Second, routed through the business logic
layer: `ValueError`, correctly refused, with the order staying
`pending` — the same admin action, the same customer, the only
difference being which layer the call was allowed to reach.

## What Breaks Without This

Fixing the admin panel closes this one shortcut. It says nothing about a
*different* piece of code reaching for the identical convenience later:

```python
def batch_reconcile_stuck_orders(order_ids):
    for order_id in order_ids:
        db_set_order_status(order_id, "paid")  # the same shortcut, in a new place
```

Nothing about this lesson's fix prevents a batch job, written later by
someone who never saw the admin panel's own history, from reaching
directly into the data layer the identical way. Naming the rule — every
layer calls only the layer directly below it — doesn't enforce it by
itself; a real system needs either code review discipline or actual
tooling (an import-linter rule restricting which modules the data
layer's functions can be called from) to catch this before it ships,
the same honest gap every structural fix in this curriculum has had
since its very first one.

## Exercises

1. Fix `batch_reconcile_stuck_orders` the same way this lesson fixed the
   admin panel, and prove with real output that a suspended customer in
   the batch is correctly skipped instead of silently marked paid.
2. Add a fourth layer, a caching layer, sitting between business logic
   and data access. Decide, using this lesson's own rule, which layer is
   allowed to call it, and rewrite `mark_paid_via_business_logic` to use
   it without letting the presentation layer reach it directly.
3. Not every "layer skip" is wrong — a read-only reporting query that
   only ever selects data, with no business rule to enforce, is a common
   real exception many layered systems explicitly allow. Write two or
   three sentences on how you'd decide, for a specific operation,
   whether it's safe to skip a layer or whether this lesson's own bug is
   waiting to happen.

## Definition of Done

- [ ] `admin_quick_fix_mark_paid` calls `mark_paid_via_business_logic`,
      never `db_set_order_status` directly.
- [ ] The Problem section's silent bypass has been reproduced for real,
      against the *original* version, before you apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here, for both a suspended
      and a non-suspended customer.
- [ ] The "What Breaks Without This" `batch_reconcile_stuck_orders`
      shortcut has been run against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `layered
      architecture: route the admin quick-fix through business logic
      instead of the data layer, so suspended customers can't bypass
      customer_can_pay`, not `fix admin panel`.

Up next: Lesson 78, Hexagonal Architecture — a different, more flexible
way to arrange a system's layers, built around a core that depends on
nothing outside itself at all.
