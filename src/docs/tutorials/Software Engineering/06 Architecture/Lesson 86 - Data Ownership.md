# Lesson 86: Data Ownership

**What you will build.** An orders service and a shipping service each
keep their own copy of a customer's address — convenient, since neither
has to call the other for it. A customer updates their address through
the orders service. The shipping service, still holding its own,
separately-maintained copy, ships to the old one. This lesson makes a
single customer service the address's one authoritative owner, and
rewrites shipping to query it directly instead of keeping a copy at
all — the identical update now reaches shipping correctly, the instant
it's asked for. The transferable problem: Lesson 68 named this exact
failure inside one process, where a single owning method closed the gap
cheaply; the identical failure, once services are genuinely separate
(Lessons 81 through 85), costs real, silent data corruption instead of
just a missed function call, because nothing forces two independent
services' own copies to ever be told about each other's updates.

**What you need to know first.** State Ownership (Lesson 68) — the
identical failure this lesson demonstrates at service scale instead of
within one process; the fix is structurally the same idea, applied
across a boundary that makes staying in sync much harder. Bounded
Contexts (Lesson 50) — two legitimately different models of "the same"
customer; this lesson is about a case where the address is *not*
legitimately different per context — it's the same fact, needed by two
services, that should never have had two owners.

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

Still the **Architecture** stage. Carried through: this lesson is the
service-scale version of a failure this curriculum has already named
once, at a smaller scale — proof that the underlying principle,
exactly one owner per fact, holds at every scale this curriculum has
built so far, from a single object's field to a whole service's own
database.

**Terms introduced in this lesson.** One line each.

- **data ownership** — the architectural decision that exactly one
  service is the single, authoritative source for a given piece of
  data, with every other service that needs it querying the owner
  rather than maintaining its own independently-updated copy. It's the
  service-scale version of Lesson 68's state ownership, now applied
  across a network boundary, where the cost of getting it wrong is
  measured in silently wrong answers rather than a missed function call.
- **data drift** — when two or more services each hold their own copy of
  what should be the same fact, and those copies silently diverge over
  time as one is updated and the others aren't. It's named because
  nothing crashes when it happens — both copies remain individually
  valid-looking data, and the only symptom is that they eventually
  disagree, discovered only when something depends on the answer being
  right.

**Objects and methods used.** None new — plain dicts and functions,
already established; what's new is deciding, deliberately, which
service's dict is allowed to be the real one.

## Concept Unit: Two Copies of the Same Fact Will Eventually Disagree

### The Problem

Orders and shipping each keep their own copy of a customer's address:

```python
orders_db = {17: {"name": "Dana", "address": "100 Main St"}}
shipping_db = {17: {"name": "Dana", "address": "100 Main St"}}


def update_customer_address(customer_id, new_address):
    orders_db[customer_id]["address"] = new_address


def ship_order(customer_id):
    address = shipping_db[customer_id]["address"]
    return f"shipping to {address}"
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. A customer updates their address, and
an order ships shortly after:

```python
update_customer_address(17, "200 Oak Ave")
print("orders service address:", orders_db[17]["address"])
print(ship_order(17))
```

Running it produces:

```
orders service address: 200 Oak Ave
shipping to 100 Main St
```

The address really did update — `orders_db` proves it. The shipment
goes to the old address anyway, because `shipping_db` was never told
about the change; it's a separate copy, updated by nothing, drifting
further out of sync with reality every time the real address changes
without shipping's own copy being told. This isn't a crash. It's a
package sent to the wrong place, with every individual piece of code
involved behaving exactly as written.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** `shipping_db` removed entirely; `ship_order`
  rewritten to query the one real owner.
- **Change type:** refactor — eliminate a duplicated copy, replace it
  with a query to the authoritative source.
- **Location:** `ship_order`'s own body.
- **Dependencies:** none.

### The New Code

The smallest new piece is the query function itself:

```python
def get_customer_address(customer_id):
    return customer_db[customer_id]["address"]
```

### The Updated Project

`shipping_db` is gone; a single `customer_db` is the one real source of
truth, and `ship_order` reads from it directly instead of from its own,
separately-maintained copy:

```python
customer_db = {17: {"name": "Dana", "address": "100 Main St"}}   # ← changed, replaces orders_db and shipping_db both


def update_customer_address(customer_id, new_address):
    customer_db[customer_id]["address"] = new_address              # ← changed


def get_customer_address(customer_id):                              # ← new
    return customer_db[customer_id]["address"]                        # ← new


def ship_order(customer_id):
    address = get_customer_address(customer_id)                      # ← changed
    return f"shipping to {address}"
```

There is now exactly one dict holding a customer's address, and exactly
one function, `update_customer_address`, that's allowed to change it —
`ship_order` reads it fresh, every time, through `get_customer_address`,
with no copy of its own left anywhere to go stale.

### Isolating the Concept: One Dict, Two Consumers, Never Two Copies

The mechanism doing the real work above — collapsing two independently-
maintained copies into one owned source, queried by every consumer —
deserves to be seen proving its own real payoff directly: running the
identical update-then-ship sequence against the fixed version:

```python
update_customer_address(17, "200 Oak Ave")
print(ship_order(17))
```

Running it produces:

```
shipping to 200 Oak Ave
```

The identical update, the identical shipment, now correctly reaching
the customer's real, current address — not because `ship_order` got
smarter, but because there was never a second, stale copy left for it
to accidentally read from.

### Mechanical Walkthrough

Working through the one syntactic element that actually changed:

- **`def get_customer_address(customer_id): return customer_db[customer_id]["address"]`**
  — an ordinary function, reading directly from the one dict that's
  allowed to hold this fact. Every caller that needs a customer's
  address now goes through this one function, rather than reading from
  whatever local copy each service happened to have kept.

### CS Lens

This is **data ownership**, the distributed-systems version of Lesson
68's own single-writer principle: exactly one service (or, in this
simplified simulation, one dict) is the **system of record** for a given
fact, and every other consumer treats it as read-only, querying the
owner rather than caching an independently-updatable copy. This is the
same underlying discipline behind database normalization (storing a fact
in exactly one place, referenced rather than duplicated), and the
"single source of truth" principle applied at the scale of an entire
distributed system rather than one database schema.

Also recognized in: a customer relationship management (CRM) system
being the sole owner of contact information that a billing system and a
support system both query rather than each storing their own copy, DNS
acting as the single authoritative source for a domain's IP address
rather than every client caching one forever, and event sourcing
(Lesson 84's own durable log, generalized), where a system's event log
is the sole owner of what actually happened, with every other view
derived from it rather than independently maintained.

### SE Lens

The principle is **query the owner, don't cache and hope** — the
alternative that produced this lesson's bug, `shipping_db` keeping its
own copy for convenience, isn't wrong on the day it's written; it's
wrong the first time the address changes anywhere else and nothing
tells shipping. The real cost of the fix: `ship_order` now depends
directly on `customer_db` being reachable every time it runs — a real,
new coupling (Lesson 56's own vocabulary) that a locally cached copy
didn't have. That's a genuine tradeoff, not a free win: a real,
separately-deployed customer service being briefly unreachable now
blocks shipping from looking up an address at all, the exact
partial-failure risk Lesson 80 already named — the fix for *staleness*
introduces a new, real dependency on *availability*, and a production
system needs a deliberate answer for both, not just one.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running a second update, proving the fix holds for more than one change,
not just the first:

```python
update_customer_address(17, "300 Elm St")
print(ship_order(17))
```

The real output:

```
shipping to 300 Elm St
```

A second address change reaches shipping correctly too, without any
special handling — because `ship_order` was never trusting a snapshot
from the past; it asks the one real owner fresh, every single time.

### Connecting Back

Where Lesson 68 named this failure inside a single process, this lesson
proves the identical discipline holds once the failure crosses a real
service boundary — the same principle, the same fix, at every scale this
curriculum has built so far.

## Connect the Pieces

Dana's address was updated and then used to ship an order, twice, in
this lesson. First, with orders and shipping each keeping their own
copy: the update reached `orders_db` correctly, and `ship_order`,
reading `shipping_db`, shipped to the stale address anyway — a real,
silent, wrong answer. Second, with one owned `customer_db`: the
identical update, read fresh by `ship_order` through
`get_customer_address`, correctly reached the new address, with no
second copy anywhere left to disagree with it.

## What Breaks Without This

Owning the data correctly fixes staleness. It introduces the exact
availability tradeoff the SE Lens already named — a fact this lesson's
own simulation can prove concretely:

```python
def get_customer_address_unreliable(customer_id):
    raise ConnectionError("customer service unreachable")


def ship_order_unreliable(customer_id):
    address = get_customer_address_unreliable(customer_id)
    return f"shipping to {address}"


try:
    ship_order_unreliable(17)
except ConnectionError as e:
    print("ConnectionError:", e)
```

Run for real, this is what comes back:

```
ConnectionError: customer service unreachable
```

Shipping can no longer function at all if the customer service that
owns the address is down — a real, new failure mode the old, cached
`shipping_db` never had, because it never needed the customer service
to be reachable to ship anything. Removing data drift traded it for a
real availability dependency; a production system needs a deliberate
answer for this too — a short-lived cache with a known staleness window,
or a documented, accepted dependency — not an assumption that the
owning service is always reachable.

## Exercises

1. Add a short-lived cache to `get_customer_address` — store the last
   looked-up address with a timestamp, and reuse it if less than 5
   seconds old, refetching otherwise. Measure, the way Lesson 74 did,
   the real tradeoff between staleness window and call frequency this
   introduces.
2. Using this lesson's own `ship_order_unreliable` scenario, decide and
   implement what shipping should actually do if the customer service is
   unreachable — refuse to ship, or fall back to a last-known address
   with an explicit staleness warning. Justify your choice.
3. Name one other pair of concepts in this curriculum's own running
   example — `Order`/`Customer`, `payments.py`/`order_lifecycle.py` —
   where two services might plausibly be tempted to each keep their own
   copy of the same fact. Decide, using this lesson's own test, which
   one should own it.

## Definition of Done

- [ ] `customer_db` is the only place a customer's address is stored;
      `shipping_db` no longer exists.
- [ ] `ship_order` calls `get_customer_address` rather than reading any
      local copy.
- [ ] The Problem section's stale-address shipment has been reproduced
      for real, against the *original*, two-copy version, before
      applying the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here, for at least two
      separate address updates.
- [ ] The "What Breaks Without This" unreachable-service scenario has
      been run against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `data
      ownership: make customer service the sole owner of addresses, so
      shipping can no longer ship to a stale, independently-cached copy`,
      not `remove duplicate database`.

Up next: Lesson 87, Service Boundaries — drawing the full boundary
around a service, not just around one piece of data it owns, using
every technique this domain has built so far together.
