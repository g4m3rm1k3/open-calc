# Lesson 79: Ports and Adapters

**What you will build.** `OrderConfirmationService.confirm_from_request`
takes a `request_body` shaped exactly like the REST API's own nested
JSON: `request_body["data"]["attributes"]["order_id"]`. A CLI adapter,
needing to call the identical core logic, has to fake an entire
HTTP-shaped payload just to satisfy it — and when the REST API's own
JSON shape changes for a REST-specific reason, the CLI adapter breaks
too, `KeyError`, despite having nothing to do with REST at all. This
lesson fixes it by giving the core a plain port, `confirm(order_id,
customer_email)`, shaped around what the *core* actually needs, and
making both the REST adapter and the CLI adapter responsible for
translating their own external format into that plain shape themselves.
The transferable problem: Lesson 78 built one port correctly, without
ever asking who should get to decide its shape — this lesson answers
that directly: a port belongs to the core, defined in the core's own
vocabulary, never in whichever adapter happened to be written first.

**What you need to know first.** Hexagonal Architecture (Lesson 78) —
`OrderConfirmationService` and its mailer port; this lesson adds a
second kind of port to the same class, one the outside world calls
*into* rather than one the core calls *out* through. Boundary Design
(Lesson 69) — `order_to_shipping_payload`'s own translation technique,
the exact shape each adapter's own translation function reuses here.

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

Still the **Architecture** stage. Carried through: Lesson 78 kept the
core's *outbound* dependencies (the mailer) abstract; this lesson keeps
the core's *inbound* entry point abstract too — nothing about how the
core is called should leak any one caller's own transport format into
it.

**Terms introduced in this lesson.** One line each.

- **port ownership** — the rule that a port's shape is defined by what
  the core actually needs, expressed in the core's own domain
  vocabulary, never by whatever happened to be convenient for the first
  adapter that used it. It's named because the opposite mistake is easy
  to make without noticing: building a method's signature around one
  caller's transport format, the way `confirm_from_request` was shaped
  around REST's own nested JSON, is a completely ordinary way to write a
  method, right up until a second, differently-shaped caller needs it
  too.
- **adapter translation** — the work an adapter is responsible for:
  converting between its own external format — an HTTP request body, a
  CLI argument list — and the plain shape the core's port actually
  expects. It's named to make clear where format-specific logic belongs:
  inside each adapter, separately, never inside the core, and never
  leaking from one adapter's format into another's.

**Objects and methods used.** None new — plain function parameters and
dict indexing, already established; what's new is the discipline of
which side of a port is responsible for translating a specific format.

## Concept Unit: A Port Shaped Around One Adapter Betrays Every Other One

### The Problem

`OrderConfirmationService` grows a method shaped around exactly what the
REST API happens to send:

```python
class OrderConfirmationService:
    def __init__(self, mailer):
        self.mailer = mailer

    def confirm_from_request(self, request_body):
        order_id = request_body["data"]["attributes"]["order_id"]
        email = request_body["data"]["attributes"]["customer_email"]
        return self.mailer.send(email, f"Order {order_id} confirmed", "Thank you!")
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. A CLI adapter, needing the identical
logic, has no way to call it except by faking the same nested shape:

```python
def cli_confirm(order_id, email):
    fake_request = {"data": {"attributes": {"order_id": order_id, "customer_email": email}}}
    return service.confirm_from_request(fake_request)
```

Both work, today. Then the REST API's own JSON shape changes, for a
REST-specific reason — a v2 redesign flattening the payload:

```python
def confirm_from_request(self, request_body):
    order_id = request_body["data"]["order_id"]
    email = request_body["data"]["customer_email"]
    return self.mailer.send(email, f"Order {order_id} confirmed", "Thank you!")
```

Running the CLI adapter, completely unchanged, against the updated core:

```python
try:
    print(cli_confirm(502, "sam@example.com"))
except KeyError as e:
    print("KeyError:", e)
```

Running it produces:

```
KeyError: 'order_id'
```

`cli_confirm` never touched anything about REST. It broke anyway,
because it had to fake `confirm_from_request`'s exact expected shape,
and that shape was never actually the core's own — it was REST's,
borrowed by the core method by accident, the moment `request_body`
became the parameter's own name and structure.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** `OrderConfirmationService`, modified to accept a
  plain, domain-shaped port; the REST and CLI adapters, each now doing
  their own translation.
- **Change type:** refactor.
- **Location:** `OrderConfirmationService`'s own method; a new,
  separate `rest_confirm` translation function.
- **Dependencies:** none.

### The New Code

The smallest new piece is the core's own plain port:

```python
def confirm(self, order_id, customer_email):
    return self.mailer.send(customer_email, f"Order {order_id} confirmed", "Thank you!")
```

### The Updated Project

`OrderConfirmationService` keeps only the plain, domain-shaped method;
each adapter gets its own small translation function, responsible for
its own format alone:

```python
class OrderConfirmationService:
    def __init__(self, mailer):
        self.mailer = mailer

    def confirm(self, order_id, customer_email):                 # ← changed, replaces confirm_from_request
        return self.mailer.send(customer_email, f"Order {order_id} confirmed", "Thank you!")


def rest_confirm(request_body):                                    # ← new
    order_id = request_body["data"]["order_id"]                      # ← new
    email = request_body["data"]["customer_email"]                    # ← new
    return service.confirm(order_id, email)                            # ← new


def cli_confirm(order_id, email):                                   # ← changed
    return service.confirm(order_id, email)                           # ← changed, no more fake nested dict
```

`OrderConfirmationService.confirm` no longer knows REST's payload shape
exists at all — `rest_confirm` owns that translation entirely, and
`cli_confirm` never has to fake anything about it.

### Isolating the Concept: Each Adapter Translates Its Own Format, Nothing Else's

The mechanism doing the real work above — a plain core port, with each
adapter responsible for its own translation into it — is shown proving
its own resilience directly: a third, hypothetical REST version, with
yet another shape, touching only its own adapter:

```python
def rest_confirm_v3(request_body):
    order_id = request_body["orderId"]
    email = request_body["email"]
    return service.confirm(order_id, email)


rest_v3_payload = {"orderId": 503, "email": "lee@example.com"}
print(rest_confirm_v3(rest_v3_payload))
print("cli adapter, unaffected by the rest v3 shape change:", cli_confirm(504, "kim@example.com"))
```

Running it produces:

```
sent to lee@example.com: Order 503 confirmed
cli adapter, unaffected by the rest v3 shape change: sent to kim@example.com: Order 504 confirmed
```

A second REST format change happened, and `cli_confirm` needed zero
changes to keep working — proof, not assertion, that the core's port is
now genuinely shaped around its own domain need, immune to however many
times any one adapter's own external format changes.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`def confirm(self, order_id, customer_email):`** — a method taking
  two plain values, in the core's own domain vocabulary — an order's
  identifier and an email address — with no reference anywhere to HTTP,
  JSON, or any other transport concept.
- **`def rest_confirm(request_body):`** — a standalone function, living
  outside `OrderConfirmationService` entirely, whose only job is reading
  REST's own current payload shape and calling `service.confirm` with
  plain values.
- **`order_id = request_body["data"]["order_id"]`** — ordinary nested
  dict indexing, isolated inside `rest_confirm` alone; if this shape
  changes again, this is the only line in the entire system that needs
  to change to match it.

### CS Lens

This is **port ownership**, the specific discipline that makes Ports and
Adapters actually work: the port's shape is an **interface owned by the
core**, and every adapter — whether it calls *into* the core (an
inbound, or "driving," adapter like `rest_confirm`) or is called *by*
the core (an outbound, or "driven," adapter like Lesson 78's
`SmtpMailer`) — has to satisfy the core's own shape, never the reverse.
This is the identical discipline behind interface segregation in
statically-typed languages, where an interface is defined by what its
*consumers* need, not copied from whatever concrete implementation
happened to exist first — a mistake so common in real systems it has its
own name, an **anemic** or **leaky abstraction**.

Also recognized in: a payment gateway's SDK defining its own plain
`charge(amount, currency)` interface rather than exposing its internal
HTTP request format directly, GraphQL resolvers translating a specific
client query into a database call rather than the database schema
leaking into the API, and command-line tools and web UIs both calling
into the identical core library function of a real application, each
doing its own argument parsing before reaching it.

### SE Lens

The principle is **the core defines the contract; every caller adapts to
it, not the other way around** — the alternative that produced this
lesson's bug wasn't a deliberate choice; `confirm_from_request` was
written the ordinary, easiest way for its first and, at the time, only
caller — REST — and nobody asked whether that shape would still make
sense once a second, differently-shaped caller arrived. The real cost of
the fix: every adapter now needs its own translation function, real code
that didn't exist before, whose only job is format conversion — genuine,
if small, extra code, paid once per adapter, in exchange for the core
never needing to change again just because one specific caller's own
format evolves.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running both adapters against the fixed core, through their own,
separate translation functions:

```python
rest_payload = {"data": {"order_id": 501, "customer_email": "dana@example.com"}}
print(rest_confirm(rest_payload))
print(cli_confirm(502, "sam@example.com"))
```

The real output:

```
sent to dana@example.com: Order 501 confirmed
sent to sam@example.com: Order 502 confirmed
```

Both adapters succeed, through completely different external formats —
a nested REST payload, two plain CLI arguments — converging on the
identical core method, `confirm(order_id, customer_email)`, which never
needs to know either format exists.

### Connecting Back

Where Lesson 78 kept the core's own outbound infrastructure choices
abstract, this lesson keeps the core's own inbound entry point abstract
too — together, the two lessons mean nothing about how the core is
called, or what it calls out to, can leak in either direction across
either boundary.

## Connect the Pieces

Confirming orders `501` and `502` through REST and CLI, respectively,
was attempted twice in this lesson. First, with the core shaped around
REST's own nested payload: the CLI adapter had to fake that exact shape
to call in at all, and broke, `KeyError`, the moment REST's own format
changed for reasons that had nothing to do with the CLI. Second, with
the core shaped around a plain `order_id`/`customer_email` port: both
adapters succeeded, through their own separate translations, and a
second REST format change — proven, not assumed — left the CLI adapter
completely untouched.

## What Breaks Without This

Owning the core's port correctly doesn't guarantee every future adapter
respects it. A rushed new adapter can still reach for the same shortcut
this lesson just fixed once:

```python
def queue_confirm(message):
    # a background job processor, built the fast way
    return service.confirm(message["payload"]["order_id"], message["payload"]["customer_email"])
```

Nothing about this new adapter is wrong on its own — it correctly
translates its own message-queue format into the core's plain port,
exactly the discipline this lesson names. But nothing stops a *future*
version of `queue_confirm`, written under pressure, from reaching for
`service.confirm_from_request`-style shortcuts instead, if that method
still existed somewhere as old, unremoved code. Naming port ownership as
a principle doesn't enforce it automatically on the next adapter written
six months from now — that's a code-review and architecture-review
discipline, not something this lesson's fix can guarantee by itself.

## Exercises

1. Write `webhook_confirm(payload)`, a fourth adapter simulating a
   third-party webhook with its own flat, differently-named fields
   (`{"orderNumber": ..., "buyerEmail": ...}`). Prove, with real output,
   that it can call the core correctly without any change to
   `OrderConfirmationService` itself.
2. `rest_confirm`'s own translation logic currently has no error
   handling — a malformed `request_body` missing `"order_id"` raises a
   raw `KeyError`. Decide, and implement, what a REST adapter should
   actually do with a malformed request, keeping that decision entirely
   inside `rest_confirm`, not inside the core.
3. Name one place in this domain's own running example — `Order`,
   `Customer`, `payments.py` — where a method's own parameter shape
   might already be quietly borrowed from one specific caller's own
   format rather than the core's real domain need. Sketch what a
   genuinely core-owned version of it would look like instead.

## Definition of Done

- [ ] `OrderConfirmationService.confirm` takes plain `order_id` and
      `customer_email` parameters, with no reference to any transport
      format.
- [ ] `rest_confirm` and `cli_confirm` each own their own translation
      into that plain shape.
- [ ] The Problem section's `KeyError` has been reproduced for real,
      against the *original*, REST-shaped core method, before you apply
      the fix.
- [ ] The "Run It" scenario above runs against your own fixed files and
      produces output matching what's pasted here, and the third REST
      version's resilience has been proven for real too.
- [ ] Commit, with a message stating *why*: something like `ports and
      adapters: give the core a plain confirm(order_id, email) port
      instead of one shaped around REST's own payload, so other
      adapters stop breaking on REST-only changes`, not `refactor
      confirm method`.

Up next: Lesson 80, Modular Monoliths — building an entire system out of
many well-bounded pieces like this one, without splitting into separate
deployable services before there's a real, measured reason to.
