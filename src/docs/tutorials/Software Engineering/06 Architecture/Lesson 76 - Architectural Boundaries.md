# Lesson 76: Architectural Boundaries

**What you will build.** `order_to_shipping_payload`, from Lesson 69,
gains a new field — `customer_email` — and nobody thinks to mask it,
because the only masking function this system has, `masked_card_number`
from Lesson 75, lives in a completely different file, protecting a
completely different kind of data. The email crosses the shipping
boundary in full: `{'contact_email': 'dana@example.com'}`, an unmasked
address handed to an external partner. This lesson fixes it with a
single, declared `BOUNDARY_FIELD_POLICY` — naming, once, which fields
are sensitive and how each one should be transformed — so a brand-new
boundary function, written later by someone who's never seen
`order_to_shipping_payload`, automatically gets the correct protection
for free. The transferable problem: Lessons 69 and 75 each built a real,
correct boundary function, separately, with no shared knowledge between
them about what "sensitive" even means in this system — and the moment
a second boundary needed the same protection a first one already had,
nothing connected the two.

**What you need to know first.** Boundary Design (Lesson 69) —
`order_to_shipping_payload`, the exact function this lesson's new field
was added to. Architectural Constraints (Lesson 75) — `masked_card_
number`, the exact protection this lesson generalizes so it isn't
reinvented per field, per boundary. Business Rules (Lesson 47) — rule
drift, the identical shape of failure this lesson demonstrates one level
up: not a business rule reimplemented inconsistently, a *sensitivity*
policy reimplemented inconsistently.

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

Still the **Architecture** stage. Carried through: Lessons 69 and 75
each protected one boundary correctly, in isolation; this lesson makes
"what's sensitive" a fact about the system as a whole, declared once,
rather than a fact each boundary function has to separately rediscover.

**Terms introduced in this lesson.** One line each.

- **boundary policy** — a centrally declared rule about how a specific
  kind of data must be treated whenever it crosses *any* boundary in a
  system, rather than a rule reimplemented separately at each individual
  crossing point. It's named because sensitivity is a property of the
  *data* — a card number, an email address — not a property of any one
  function that happens to touch it, and treating it as the latter is
  exactly what let `customer_email` cross a boundary unprotected while
  `card_number` didn't.

**Objects and methods used.** None new — a module-level dict and
functions, the same registry shape Lesson 65 already established;
what's new is applying that shape specifically to a policy about
sensitive data, checked at every boundary rather than looked up once per
feature.

## Concept Unit: Sensitivity Is a Fact About the Data, Not About One Function

### The Problem

`order_to_shipping_payload` gains a new field, added the ordinary way,
by someone who has no reason to know `masked_card_number` exists at all:

```python
def order_to_shipping_payload(order_id, status, customer_email):
    return {
        "order_ref": order_id,
        "ship_to_status": status,
        "contact_email": customer_email,
    }


payload = order_to_shipping_payload(501, "paid", "dana@example.com")
print("shipping payload:", payload)
```

This is illustrative, hand-built for this lesson, not a quoted line
range from any external system. Running it produces:

```
shipping payload: {'order_ref': 501, 'ship_to_status': 'paid', 'contact_email': 'dana@example.com'}
```

A real customer's real email address just crossed an external boundary,
unmasked, in full — the identical shape of leak Lesson 75 already fixed
once, for a different field, in a different file. Nothing about this
function is wrong the way Lesson 69's original `__dict__`-dumping
version was wrong; `order_to_shipping_payload` still names exactly what
crosses, deliberately, the way that lesson's own fix taught. It simply
never occurred to whoever added `customer_email` that email addresses
needed the same treatment card numbers already got — because nothing in
this system says so in one place.

### Project Change

- **Reference Source:** none — a from-scratch addition, not a port of
  an external reference codebase.
- **Files affected:** a new module declaring the boundary policy;
  `order_to_shipping_payload`, modified to consult it.
- **Change type:** add — `BOUNDARY_FIELD_POLICY`,
  `declare_sensitive_field`, and `apply_boundary_policy`.
- **Location:** a new, dedicated module; `order_to_shipping_payload`'s
  own body.
- **Dependencies:** none.

### The New Code

The smallest new piece is the declaration itself:

```python
BOUNDARY_FIELD_POLICY = {}


def declare_sensitive_field(field_name, mask_fn):
    BOUNDARY_FIELD_POLICY[field_name] = mask_fn
```

### The Updated Project

Every sensitive field this system knows about gets declared once, and
`order_to_shipping_payload` applies the policy generically instead of
naming any specific field's own protection inline:

```python
BOUNDARY_FIELD_POLICY = {}                                       # ← new


def declare_sensitive_field(field_name, mask_fn):                 # ← new
    BOUNDARY_FIELD_POLICY[field_name] = mask_fn                     # ← new


def apply_boundary_policy(fields):                                 # ← new
    result = {}                                                      # ← new
    for name, value in fields.items():                                # ← new
        if name in BOUNDARY_FIELD_POLICY:                              # ← new
            result[name] = BOUNDARY_FIELD_POLICY[name](value)            # ← new
        else:                                                           # ← new
            result[name] = value                                        # ← new
    return result                                                        # ← new


def mask_email(email):                                             # ← new
    local, _, domain = email.partition("@")                          # ← new
    return f"{local[0]}***@{domain}"                                  # ← new


declare_sensitive_field("contact_email", mask_email)                # ← new
declare_sensitive_field("card_number", masked_card_number)           # ← new, from Lesson 75


def order_to_shipping_payload(order_id, status, customer_email):
    return apply_boundary_policy({                                   # ← changed
        "order_ref": order_id,
        "ship_to_status": status,
        "contact_email": customer_email,
    })
```

`order_to_shipping_payload` no longer decides, on its own, what counts
as sensitive — it hands its output through `apply_boundary_policy`,
which consults the one shared declaration every boundary in this system
is now expected to go through.

### Isolating the Concept: One Declaration, Every Boundary Protected

The mechanism doing the real work above — declaring a policy once,
applied generically by every boundary rather than reimplemented by each
one — deserves to be seen proving its own real payoff: a second,
brand-new boundary function, written by someone who has never seen
`order_to_shipping_payload` at all, using the identical declared policy:

```python
def order_to_analytics_event(order_id, customer_email):
    return apply_boundary_policy({"order_id": order_id, "contact_email": customer_email})


event = order_to_analytics_event(501, "dana@example.com")
print("analytics event:", event)
```

Running it produces:

```
analytics event: {'order_id': 501, 'contact_email': 'd***@example.com'}
```

`order_to_analytics_event` never calls `mask_email` by name, never
imports it, never knows it exists — it only calls
`apply_boundary_policy`, and the email comes out correctly masked
anyway, because the *policy*, not the individual function, is what knows
email addresses are sensitive. This is the real payoff a per-function
approach can never provide: protection that's automatic for code that
hasn't been written yet.

### Mechanical Walkthrough

Working through every distinct syntactic element of the New Code block
above, in order:

- **`BOUNDARY_FIELD_POLICY = {}`** — a module-level dict, the shared
  declaration every boundary function in this system will read from.
- **`def declare_sensitive_field(field_name, mask_fn):`** — a function
  taking a field's name and the function that should transform it,
  storing the pair in the shared dict — the same registration shape
  Lesson 65 already established for payment methods, reused here for a
  different purpose.
- **`def apply_boundary_policy(fields):`** — takes a plain dict of
  whatever fields a boundary function wants to send, and returns a new
  dict, checking each field name against the declared policy and
  applying its mask function if one exists, or passing the value through
  unchanged if it isn't declared as sensitive at all.
- **`local, _, domain = email.partition("@")`** — splits an email
  address into everything before `@`, the separator itself (discarded
  into `_`, a name conventionally used for a value nobody needs), and
  everything after; `mask_email` uses only the first character of
  `local` and the full `domain`, discarding the rest of the local part.

### CS Lens

This is a **centralized policy enforcement point**: instead of every
individual boundary crossing implementing its own version of a rule,
every crossing routes through one shared checkpoint that knows the rule
completely. The same shape appears in a firewall's own centralized
rule table (individual applications don't each decide what traffic is
allowed), a database's row-level security policy (individual queries
don't each check permissions themselves), and a web framework's
centralized input-sanitization middleware, applied to every incoming
request rather than reimplemented in every handler.

Also recognized in: GDPR and CCPA-style data classification systems that
tag a field as "PII" once, centrally, and let every system touching that
field inherit the same handling rules automatically, and API gateways
that strip or mask sensitive headers before a request ever reaches an
individual service's own code.

### SE Lens

The principle is **declare what's sensitive once, as a fact about the
data, and let every boundary inherit it — never re-decide it per
function** — the alternative that was in place before this lesson,
`masked_card_number` living inside the payments logging code with no
connection to anything else, isn't wrong on its own; it's incomplete the
moment a second, unrelated boundary needs the same kind of protection
for a different field, and nothing connects the two decisions. The real
cost of the fix: every future boundary function in this system now has
an obligation to route its output through `apply_boundary_policy`
instead of building its own dict directly — a real, ongoing discipline
requirement, the same honest limit this lesson's own "What Breaks
Without This" section proves directly.

### Commands Needed

Running any of this lesson's scripts is `python <filename>.py` — the
`python` program, given one positional argument, executes that file's
statements top to bottom in a fresh interpreter process.

### Run It

Running the fixed `order_to_shipping_payload`, with `customer_email` now
covered by the declared policy:

```python
payload = order_to_shipping_payload(501, "paid", "dana@example.com")
print("shipping payload:", payload)
```

The real output:

```
shipping payload: {'order_ref': 501, 'ship_to_status': 'paid', 'contact_email': 'd***@example.com'}
```

The identical function, the identical call, now correctly masks the
email — not because `order_to_shipping_payload` itself learned anything
new about email addresses, but because it routes through a policy that
already knew.

### Connecting Back

Where Lessons 69 and 75 each built one correct, isolated boundary fix,
this lesson connects them into one shared fact about the system — what's
sensitive is now something the architecture itself knows, not something
scattered across whichever functions happened to need it first.

## Connect the Pieces

A customer's email crossed the shipping boundary twice in this lesson,
alongside the identical order data both times. First, with no shared
policy: the email crossed in full, unmasked, an unnoticed leak
mirroring the exact failure Lesson 75 had already fixed for card
numbers, just for a field the fix never reached. Second, through
`apply_boundary_policy`: the identical email, correctly masked,
`d***@example.com` — and a completely new boundary function, written
afterward with no knowledge of `mask_email`'s existence, inherited the
identical protection automatically.

## What Breaks Without This

`apply_boundary_policy` only protects the boundaries that actually call
it. A boundary that builds its own dict directly, bypassing the shared
policy, reproduces the original leak exactly:

```python
def order_to_debug_dump(order_id, customer_email):
    return {"order_id": order_id, "email": customer_email}  # bypasses apply_boundary_policy


print("debug dump:", order_to_debug_dump(501, "dana@example.com"))
```

Run for real, this is what comes back:

```
debug dump: {'order_id': 501, 'email': 'dana@example.com'}
```

The declared policy exists, and correctly protects `contact_email` —
but `order_to_debug_dump` never asked it to, because it builds its own
plain dict directly instead of calling `apply_boundary_policy`. A shared
policy only works for code that's written to use it; it can't reach out
and protect a boundary function that was never told the policy exists,
the same honest limit every centralized mechanism in this curriculum has
had since Lesson 61's own listener registry.

## Exercises

1. Fix `order_to_debug_dump` the same way this lesson fixed
   `order_to_shipping_payload`, and prove with real output that the
   email is now masked there too.
2. Add a third sensitive field, `phone_number`, with its own mask
   function, declared once. Write two boundary functions that both use
   it, and prove, with real output, that neither one needed to know how
   phone numbers are actually masked.
3. `apply_boundary_policy` silently passes through any field not in
   `BOUNDARY_FIELD_POLICY`. Argue, in two or three sentences, whether
   that's the right default for a system handling regulated data, or
   whether it should instead refuse to pass through any field it doesn't
   recognize as either explicitly sensitive or explicitly safe.

## Definition of Done

- [ ] `BOUNDARY_FIELD_POLICY`, `declare_sensitive_field`, and
      `apply_boundary_policy` exist, and both `card_number` and
      `contact_email` are declared through them.
- [ ] `order_to_shipping_payload` routes its output through
      `apply_boundary_policy` instead of building its own dict directly.
- [ ] The Problem section's unmasked email has been reproduced for real,
      against the *original* version, before you apply the fix.
- [ ] The "Run It" scenario above runs against your own fixed file and
      produces output matching what's pasted here, and the new
      `order_to_analytics_event` boundary has been run too, proving
      automatic protection.
- [ ] The "What Breaks Without This" `order_to_debug_dump` bypass has
      been run against your own file, not just read.
- [ ] Commit, with a message stating *why*: something like `boundaries:
      declare sensitive fields once in a shared policy instead of
      reimplementing masking per boundary function`, not `add email
      masking`.

Up next: Lesson 77, Layered Architecture — organizing an entire system's
modules into named layers, each one only allowed to depend on the layer
below it, generalizing the single-boundary decisions this lesson and the
last two made into a rule for the whole system's shape.
