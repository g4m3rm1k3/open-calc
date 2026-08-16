# Lesson 87: Service Boundaries

**What you will build.** Lesson 86 made the customer service the one
real owner of a customer's address — and a marketing service, wanting
the same data, reaches straight into `customer_db` directly, instead of
calling `get_customer_address`. It works, until the customer service
refactors its own internal storage for its own reasons — splitting one
`address` field into `shipping_address` and `billing_address` — and the
marketing service breaks, `KeyError`, while `ship_order`, which was
always calling through the real API, keeps working unmodified. This
lesson closes the gap: a service boundary isn't just about who *owns* a
fact, the way Lesson 86 established — it's a guarantee that nothing
outside a service ever reaches its storage directly, the same
underlying discipline Lesson 53 already proved for one Python module's
own internal dict, now enforced at the scale of an entire service's own
database.

**What you need to know first.** Data Ownership (Lesson 86) —
`customer_db` and `get_customer_address`, the exact owner this lesson's
own boundary violation reaches past. Information Hiding (Lesson 53) —
`_ORDER_TRANSITIONS`, the identical failure this lesson recreates at
service scale: a caller depending on an internal shape instead of a
published interface.

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

Still the **Architecture** stage. Carried through: this lesson closes
the gap between "one service owns this fact" (Lesson 86) and "nothing
outside that service can reach the fact except through its own
published API" — the second half of a real service boundary, without
which the first half is only a suggestion.

**Terms introduced in this lesson.** One line each.

- **service boundary** — the complete line around a service: which data
  it owns, which operations it exposes, and the guarantee that nothing
  outside it reaches its internal storage directly, through any path
  except its own published API. It's named as the *complete* boundary
  because a service can correctly own its data (Lesson 86) and still
  have that ownership undermined the moment its storage is reachable by
  anything that bypasses the API meant to protect it.
- **shared database anti-pattern** — when two or more services read or
  write the same underlying database or table directly, instead of one
  service owning it exclusively and exposing an API for anything else
  that needs it. It's named because it's a specific, common, well-known
  real-world failure — this lesson's own `marketing_send_campaign`
  reaching into `customer_db` directly is exactly this pattern, in
  miniature.

**Objects and methods used.** None new — this lesson's fix reuses
`get_customer_address` from Lesson 86, unchanged; what's new is the
discipline of never bypassing it, applied to a second, independent
consumer.

## Concept Unit: Owning Data Isn't Enough if Storage Isn't Actually Private

### The Problem

A marketing service, wanting a customer's address for a campaign
mailer, reaches directly into the customer service's own `customer_db`,
skipping `get_customer_address` entirely:

```python
customer_db = {17: {"name": "Dana", "address": "100 Main St"}}


def get_customer_address(customer_id):
    return customer_db[customer_id]["address"]


def marketing_send_campaign(customer_id):
    address = customer_db[customer_id]["address"]
    return f"campaign mailer sent to {address}"


print(marketing_send_campaign(17))
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
campaign mailer sent to 100 Main St
```

The customer service, later, refactors its own internal storage —
splitting one `address` field into `shipping_address` and
`billing_address`, a decision entirely internal to how it organizes its
own data, and updates its own API function to match:

```python
customer_db[17] = {"name": "Dana", "shipping_address": "100 Main St", "billing_address": "100 Main St"}

try:
    print(marketing_send_campaign(17))
except KeyError as e:
    print("KeyError:", e)
```

Running it produces:

```
KeyError: 'address'
```

`marketing_send_campaign` broke because it never went through
`get_customer_address` — the one place this exact internal change was
supposed to be absorbed. The customer service's own decision to
reorganize its own storage was a completely internal, reasonable choice;
it broke a service that was never supposed to know that storage's exact
shape existed at all.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** `marketing_send_campaign`, modified to call the
  real API instead of reaching into `customer_db`.
- **Change type:** refactor.
- **Location:** `marketing_send_campaign`'s own body.
- **Dependencies:** none.

### The New Code

The smallest new piece is the single call that replaces the direct
reach into storage:

```python
def marketing_send_campaign(customer_id):
    address = get_customer_address(customer_id)
    return f"campaign mailer sent to {address}"
```

### The Updated Project

`marketing_send_campaign` no longer references `customer_db` anywhere in
its own body — it calls the one published API function, the same way
`ship_order` already does:

```python
def get_customer_address(customer_id):                          # unchanged, updated to match new internal shape
    return customer_db[customer_id]["shipping_address"]


def ship_order(customer_id):
    return f"shipping to {get_customer_address(customer_id)}"


def marketing_send_campaign(customer_id):                        # ← changed
    address = get_customer_address(customer_id)                    # ← changed, replaces direct customer_db access
    return f"campaign mailer sent to {address}"
```

Both `ship_order` and `marketing_send_campaign` now go through the
identical single door into customer data — neither one has any
knowledge of `customer_db`'s own internal field names at all.

### Isolating the Concept: Two Consumers, One Real API, Zero Direct Access

The mechanism doing the real work above — every consumer of a service's
data routed through its own published function, never through direct
access to its storage — deserves to be seen proving its own real payoff
directly: running `ship_order`, which never bypassed the API in the
first place, through the identical schema change that broke marketing:

```python
print(ship_order(17))
```

Running it, after the internal schema change, produces:

```
shipping to 100 Main St
```

`ship_order` never noticed anything changed — the exact resilience
Lesson 53 already proved once for a single module's own internal dict,
now holding at the scale of an entire service's own database.

### Mechanical Walkthrough

Working through the one syntactic element that actually changed:

- **`address = get_customer_address(customer_id)`** — replaces
  `customer_db[customer_id]["address"]` with a call to the one function
  that's allowed to know `customer_db`'s real shape. Nothing about this
  line names any field of `customer_db` directly; whatever internal
  shape the customer service chooses is now entirely its own business.

### CS Lens

This is the **service boundary** made complete: Lesson 86 established
*who owns* a fact; this lesson establishes that ownership only means
anything if the owner's storage is genuinely private, reachable only
through the interface it publishes. The **shared database anti-pattern**
— two services reading or writing the same table directly — is one of
the most common, most damaging real-world architecture mistakes,
precisely because it looks harmless at first: both services get correct
data, right up until either one's own internal schema needs to change
for a reason that has nothing to do with the other.

Also recognized in: two microservices both connecting directly to the
same PostgreSQL database instead of one exposing a gRPC or REST API to
the other, a mobile app querying a backend's database directly instead
of through a documented API (a common real cause of apps breaking on a
routine backend schema migration), and library consumers reaching into
a package's private, undocumented internals instead of its published
public interface — the identical failure, at the scale of a single
codebase instead of a distributed system.

### SE Lens

The principle is **a service's storage is not its interface** — the
alternative that produced this lesson's bug, the marketing service
reading `customer_db` directly, wasn't malicious or even unusual; it's
often the *fastest* path to working code, especially when both services
happen to share the same database instance for purely operational
convenience. The real cost of the fix: `get_customer_address` now has to
exist, be documented, and be genuinely used by every consumer, forever
— a real, ongoing API-maintenance obligation the customer service didn't
have when other services could just read its table directly. That
obligation is exactly the trade this lesson makes on purpose: real,
ongoing API discipline, in exchange for the customer service being free
to change its own internal storage whenever it needs to, without
breaking anything outside it.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running both fixed consumers through the identical post-refactor schema:

```python
print(ship_order(17))
print(marketing_send_campaign(17))
```

The real output:

```
shipping to 100 Main St
campaign mailer sent to 100 Main St
```

Both consumers now produce correct results against the customer
service's new internal shape, and neither one's own source code names
`shipping_address`, `billing_address`, or any other detail of how
`customer_db` actually stores that fact — both go through
`get_customer_address`, and only `get_customer_address` had to change.

### Connecting Back

Where Lesson 86 decided which service owns a fact, this lesson makes
that decision actually hold — nothing outside the owning service can
reach the fact except through the door the owner built for it, the same
completed boundary Lesson 69 already built for external partners,
proven again here between two services inside the same system.

## Connect the Pieces

A customer service's internal schema changed once in this lesson — one
`address` field split into two — and two consumers were checked against
it. First, `marketing_send_campaign`, reaching into `customer_db`
directly: broke immediately, `KeyError`, on a change that had nothing to
do with marketing's own logic. Second, both `marketing_send_campaign`
and `ship_order`, rewritten to call `get_customer_address`: both
survived the identical schema change untouched, because the one place
that needed to know the new shape — the API function itself — was the
only place that changed.

## What Breaks Without This

Fixing marketing's own access pattern doesn't prevent a *third* consumer
from making the identical mistake independently:

```python
def analytics_customer_report(customer_id):
    return f"report for {customer_db[customer_id]['shipping_address']}"


print(analytics_customer_report(17))
```

This happens to work today, because it was written *after* the schema
change and matches the current internal field name — but it's the
identical anti-pattern, waiting for the *next* internal refactor to
break it the same way marketing already broke once. Fixing one
violation doesn't install anything that prevents the next team from
reaching for the same shortcut; that requires either code-review
discipline or, in a real system, actual infrastructure — a database the
other services genuinely cannot connect to at all, forcing every
consumer through the API by construction rather than by convention.

## Exercises

1. Fix `analytics_customer_report` the same way this lesson fixed
   marketing, and prove with real output that it survives a third,
   hypothetical schema change unmodified.
2. Design, without necessarily implementing it, what would need to be
   true infrastructurally — not just as a coding convention — to make it
   *impossible* for a different service to connect to `customer_db`
   directly, the way a leading underscore alone never stopped direct
   access to `Order._lines` in Lesson 49.
3. Using Lesson 86's own data-ownership vocabulary alongside this
   lesson's service-boundary one, write two or three sentences defining,
   precisely, what it means for a service's boundary to be "complete" —
   what two separate guarantees does it actually require?

## Definition of Done

- [ ] `marketing_send_campaign` calls `get_customer_address`; it
      contains no direct reference to `customer_db`.
- [ ] The Problem section's `KeyError` has been reproduced for real,
      against the *original*, direct-access version, before applying the
      fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here, for both consumers,
      after the schema change.
- [ ] The "What Breaks Without This" `analytics_customer_report` gap has
      been run against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `service
      boundaries: route marketing through get_customer_address instead
      of reading customer_db directly, so internal schema changes can't
      break it`, not `fix marketing service`.

Up next: Lesson 88, Architecture Decision Records — writing down why a
boundary like this one was drawn the way it was, so the next engineer
doesn't have to rediscover the reasoning the hard way.
