# Lesson 69: Boundary Design

**What you will build.** An external shipping API needs order data as
JSON. The fastest way to get it there is `json.dumps(order.__dict__)` —
and it fails immediately, `TypeError`, because `order.status` is an
`OrderStatus` enum member, not something JSON knows how to represent.
Patching that crash by telling `json.dumps` to stringify anything it
doesn't recognize doesn't fix the real problem — it makes the payload
serialize successfully while leaking `internal_notes`, a field that was
never meant to leave this system at all, straight into an external API
call. This lesson replaces both attempts with `order_to_shipping_
payload`, a small function whose only job is naming exactly which facts
cross the boundary and in what shape — nothing pulled in automatically,
nothing leaked by accident. The transferable problem: a boundary between
two parts of a system — or between a system and the outside world — is
exactly the place an internal representation should never be assumed to
mean anything on the other side, and reaching straight through one,
even successfully, is different from designing it on purpose.

**What you need to know first.** Information Hiding (Lesson 53) —
deciding which names a module promises to keep stable; this lesson asks
the identical question about an entire object crossing all the way out
of the system. Encapsulation (Lesson 54) — a defensive copy protecting
one object's data from a caller; this lesson protects an external
consumer from ever seeing that data's real internal shape at all.

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

Still the **Design** stage — and the last lesson in this domain's own
long run on dependency and relationship questions (Lessons 56 through
69) before it turns to named patterns. Carried through: every one of
those lessons drew a boundary somewhere — between modules, between
objects, between a stable module and an unstable one. This lesson names
the discipline of drawing one *on purpose*, before code crosses it
badly, rather than discovering where it should have been afterward.

**Terms introduced in this lesson.** One line each.

- **boundary** — the line between one part of a system, or between a
  system and something external to it, where the assumptions, data
  shapes, and internal representations on one side are not guaranteed to
  mean anything, or even exist, on the other. It's worth naming
  precisely because a boundary is exactly where an internal
  representation stops being anyone else's business — code on one side
  should never assume it can see, or silently depend on, the internal
  shape of code on the other.
- **boundary object** — a small, explicit piece of code whose only job
  is converting data from one side of a boundary into exactly the shape
  the other side needs, and nothing more. It's the concrete technique
  this lesson uses to keep an external contract stable regardless of how
  either side's own internal representation changes later.

**Objects and methods used.**

- **`json.dumps(obj, default=...)`**
  - *What it is:* the standard-library function that serializes a Python
    value into a JSON-formatted string; `default` is an optional
    parameter naming a function to call on any value `json.dumps`
    doesn't natively know how to serialize.
  - *Implementation:* `json.dumps(order.__dict__, default=str)` calls
    `str(...)` on anything not natively JSON-serializable — an
    `OrderStatus` member, for instance — converting it to a string
    representation instead of raising `TypeError`.
  - *Its use:* this lesson uses it specifically to show what "fixing"
    the crash without fixing the actual boundary problem looks like —
    the payload serializes successfully, and still leaks internal fields
    and ugly internal representations straight into an external
    contract.

## Concept Unit: Crossing a Boundary Without Designing It

### The Problem

The fastest way to send an order to an external shipping API is to dump
the whole object as JSON:

```python
import json


def ship_order_via_external_api(order):
    payload = json.dumps(order.__dict__)
    return payload


order = Order(order_id=501, customer_id=17)
order.transition_to(OrderStatus.PAID)

try:
    print(ship_order_via_external_api(order))
except TypeError as e:
    print("TypeError:", e)
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
TypeError: Object of type OrderStatus is not JSON serializable
```

`order.__dict__` includes `status`, an `OrderStatus` enum member — a
perfectly meaningful internal representation `json.dumps` has no idea
how to turn into JSON. A tempting patch is telling `json.dumps` to
stringify anything it doesn't recognize:

```python
order.internal_notes = "flagged for manual review"
payload = json.dumps(order.__dict__, default=str)
print(payload)
```

Running it produces:

```
{"order_id": 501, "customer_id": 17, "status": "OrderStatus.PAID", "internal_notes": "flagged for manual review"}
```

The crash is gone. What's left is worse: `internal_notes`, a field an
internal team added for its own review workflow, just got sent to an
external shipping partner, who was never supposed to see it — and
`"status": "OrderStatus.PAID"` is Python's own internal `repr`-flavored
text, not the clean value, `"paid"`, an actual API contract should
promise. Nothing about `order.__dict__` was designed to be an external
contract; it just happened to be reachable, and reaching for it directly
made whatever `Order` currently contains, in full, the external API's
problem too.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** the shipping integration code, modified.
- **Change type:** add — a new `order_to_shipping_payload` function,
  replacing direct serialization of `order.__dict__`.
- **Location:** the shipping integration module, alongside
  `ship_order_via_external_api`.
- **Dependencies:** none.

### The New Code

The smallest new piece is the translation function itself:

```python
def order_to_shipping_payload(order):
    return {
        "order_ref": order.order_id,
        "ship_to_status": order.status.value,
    }
```

### The Updated Project

`ship_order_via_external_api` serializes the translated payload instead
of the order itself:

```python
def order_to_shipping_payload(order):                          # ← new
    return {                                                      # ← new
        "order_ref": order.order_id,                                # ← new
        "ship_to_status": order.status.value,                        # ← new
    }                                                              # ← new


def ship_order_via_external_api(order):
    payload = json.dumps(order_to_shipping_payload(order))       # ← changed
    return payload
```

Nothing about `Order`'s own internal shape — how many fields it has,
what type `status` is, whether `internal_notes` exists — can reach the
external payload anymore unless `order_to_shipping_payload` explicitly
names it. The boundary now has exactly one place that decides what
crosses it.

### Isolating the Concept: Naming Exactly What Crosses, Nothing Else

The mechanism doing the real work above — a small function naming
exactly which facts cross a boundary, built independently of whatever
the source object happens to contain — deserves to be seen on its own.
Here it is protecting an internal `Employee` record from leaking into a
public company directory:

```python
class Employee:
    def __init__(self, name, salary, ssn):
        self.name = name
        self.salary = salary
        self.ssn = ssn


def employee_to_directory_entry(employee):
    return {"name": employee.name}


employee = Employee(name="Dana", salary=95000, ssn="000-00-0000")
print("directory entry:", employee_to_directory_entry(employee))
print("full internal record:", employee.__dict__)
```

Running it produces:

```
directory entry: {'name': 'Dana'}
full internal record: {'name': 'Dana', 'salary': 95000, 'ssn': '000-00-0000'}
```

This is exactly what `order_to_shipping_payload` is doing above,
isolated: `employee_to_directory_entry` names exactly one fact, `name`,
that's allowed to cross into a public directory — `salary` and `ssn`
exist on the real object and never appear in what crosses the boundary,
not because they're hidden by an underscore, but because the boundary
function simply never mentions them. This throwaway example is now
discarded; `Employee` does not appear anywhere else in this lesson or
this project again.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`def order_to_shipping_payload(order):`** — a function taking one
  `Order` and returning a plain `dict` — deliberately not the order
  itself, not a copy of its `__dict__`, but a new structure built fact
  by fact.
- **`"order_ref": order.order_id`** — copies exactly one field,
  `order_id`, under a new name, `order_ref`, chosen to match whatever the
  external API's own contract actually calls it — the boundary doesn't
  even have to reuse `Order`'s own internal field names.
- **`"ship_to_status": order.status.value`** — reads `order.status`, an
  `OrderStatus` member, and takes its `.value` — the plain string
  `"paid"`, `"shipped"`, and so on, established all the way back in
  Lesson 45 — instead of the member itself, producing something
  `json.dumps` can serialize natively and an external partner can
  actually read without knowing anything about Python's `Enum`.

### CS Lens

This is a **boundary object**, sometimes called an **anti-corruption
layer** at the scale of a whole external integration: a translation step
whose entire job is making sure a change on one side of a boundary
doesn't automatically become a change on the other. The same idea shows
up as a database's own schema being distinct from an API's JSON
response shape (a column rename shouldn't have to be a client-facing
breaking change), a compiler's intermediate representation existing
specifically so a frontend language change doesn't ripple into the
backend code generator, and a translation layer between two
microservices' differing internal models of "the same" customer, the
same shape Lesson 50's bounded contexts already named at a smaller
scale.

Also recognized in: DTOs (data transfer objects) in enterprise software,
existing purely to cross a boundary without exposing a domain model's
real internals, GraphQL resolvers translating a database's own row shape
into exactly the fields a client asked for, and public API versioning,
which only works because the version's own response shape is decoupled
from whatever internal representation the server happens to use today.

### SE Lens

The principle is **never let an internal representation become an
external contract by accident** — the alternative that was rejected,
serializing `order.__dict__` directly, ties an external partner's
integration to *every* field `Order` happens to have, forever, whether
or not that field was ever meant to be visible outside this system.
Adding a genuinely internal field to `Order` in the future — a caching
hint, a debug flag — would silently start appearing in the external
payload the moment it's added, with nobody having decided that should
happen. The real cost of the fix: every new fact the external API
legitimately needs has to be added to `order_to_shipping_payload`
deliberately, by hand — a small, real amount of extra work for every
change, in exchange for the guarantee that nothing crosses the boundary
that wasn't put there on purpose.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the fixed version, including the exact new internal field that
leaked before:

```python
order = Order(order_id=501, customer_id=17)
order.transition_to(OrderStatus.PAID)
order.internal_notes = "flagged for manual review"

print(ship_order_via_external_api(order))
```

The real output:

```
{"order_ref": 501, "ship_to_status": "paid"}
```

`internal_notes` never appears — `order_to_shipping_payload` was never
told to include it, so it doesn't, regardless of what else `Order`
happens to carry. `ship_to_status` reads `"paid"`, a clean, stable
value, not `"OrderStatus.PAID"`. The boundary now shows exactly what was
decided should cross it, nothing more, no matter what changes on
`Order`'s own side of the line.

### Connecting Back

Where Lesson 68 made sure only one piece of code owns a change to
internal state, this lesson makes sure only one piece of code decides
what that state looks like to anything outside the system entirely —
the same discipline, applied at the outermost boundary this domain's
running example has reached yet.

## Connect the Pieces

An order with an added `internal_notes` field was serialized for
shipping twice in this lesson. First, dumping `order.__dict__` directly:
a `TypeError` on the enum, and — once patched with `default=str` — a
payload that leaked `internal_notes` and an ugly internal representation
of `status` straight into an external API call. Second, through
`order_to_shipping_payload`: a clean, minimal payload containing exactly
two named facts, with `internal_notes` never appearing at all, because
the boundary function was never told it existed.

## What Breaks Without This

`order_to_shipping_payload` protects the *shipping* boundary. It does
nothing for a *second* integration that reaches for the same shortcut
independently:

```python
def send_to_analytics_platform(order):
    return json.dumps(order.__dict__, default=str)


print(send_to_analytics_platform(order))
```

Run for real, this is what comes back:

```
{"order_id": 501, "customer_id": 17, "status": "OrderStatus.PAID", "internal_notes": "flagged for manual review"}
```

The identical leak recurs, in a completely different integration, the
moment a second piece of code reaches for `order.__dict__` directly
instead of routing through a boundary function of its own. Fixing one
integration's boundary design doesn't prevent the next integration from
skipping the discipline entirely — every boundary a system has needs
this same, deliberate treatment, one at a time, and nothing about fixing
the shipping integration enforces it anywhere else.

## Exercises

1. Write `order_to_analytics_payload(order)`, following
   `order_to_shipping_payload`'s own shape, naming exactly the facts an
   analytics platform should legitimately see (perhaps `order_id`,
   `status`, and a coarse-grained `is_active` flag — not
   `internal_notes`). Rewrite `send_to_analytics_platform` to use it, and
   prove the leak is gone.
2. `order_to_shipping_payload` currently has no way to signal "this
   order doesn't have a valid status yet" if `status` were ever `None`.
   Decide what should happen at the boundary in that case, and write the
   check.
3. Name one place in this domain's own running example — besides
   shipping — where an object might plausibly cross a real boundary
   (a database write, a UI display, a different bounded context from
   Lesson 50). Sketch, in a few lines, what its own boundary object
   would need to name and what it would need to leave out.

## Definition of Done

- [ ] `order_to_shipping_payload` exists and is the only thing
      `ship_order_via_external_api` serializes.
- [ ] The Problem section's `TypeError` and the `internal_notes` leak
      have both been reproduced for real, against the *original*,
      `__dict__`-based versions, before you apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here, including a field
      that was never designed to cross the boundary.
- [ ] The "What Breaks Without This" analytics-platform leak has been
      run against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `boundary
      design: translate Order through an explicit payload function
      instead of serializing __dict__ directly, so internal fields can't
      leak to external partners`, not `fix json serialization`.

Up next: Lesson 70, Design Patterns — naming the recurring shapes this
domain's own fixes have already been examples of, before this domain
closes with the judgment for choosing between them.
