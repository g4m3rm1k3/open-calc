# Lesson 103: Code Smells

**What you will build.** Continuing `pricing_calculations.py` from
Lesson 102's final state: `calculate_order_total`,
`format_receipt_line`, and `preview_order_total` each currently repeat
the identical three-parameter signature — `subtotal`, `item_count`,
`loyalty_tier` — bundled instead into one new, immutable
`OrderRequest` value object, and then, to prove what that bundling
actually bought, a new field is added to the order in one place with
zero of those three function signatures needing to change at all.
Transferable problem: neither of this lesson's two code smells is a
bug — every case this domain has verified since Lesson 93 still
computes the identical total either way. A code smell is a warning sign
about a *future* cost, not a present incorrectness, and this lesson
makes that future cost concrete enough to measure instead of just
naming it.

**What you need to know first.** Lessons 93 through 102 — this lesson
continues the identical calculation logic, now living in
`pricing_calculations.py`. Domain 4's Lesson 42 (Value Objects) — that
lesson's `Money` value object is the direct ancestor of this lesson's
own `OrderRequest`: an immutable bundle of related values, treated as
one thing instead of several coincidentally-related ones.

**Pipeline diagram.** This curriculum's full pipeline, established in
Lesson 12:

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

Still the **Implementation** stage. Carrying the same gold-tier, $42.00
order forward, now packaged as a single object instead of three
separate values passed together, by convention, across every function
that needs all three.

**Terms used in this lesson.**

- **Code smell** — a pattern in working, correct code that signals a
  likely future maintenance cost, without being a bug in the present;
  it exists as a category because "this code is wrong" and "this code
  will become expensive to change" are different, equally real
  problems, and only the first one shows up as a failing test.
- **Primitive obsession** — representing a concept that has its own
  real identity (an order's request, an address, a date range) as
  several separate primitive values (a `str`, an `int`, a `Decimal`)
  passed around together, instead of as one named type; it's a smell
  because nothing enforces that every function receiving those
  primitives receives them in the right order, or even that they
  actually belong together at all, beyond convention.
- **Shotgun surgery** — a single conceptual change that requires
  editing many, scattered places in a codebase to actually make; it's a
  smell because the *size* of a change should reflect how big the
  underlying idea is, and a change that's conceptually small but
  mechanically scattered is a sign the code's own structure doesn't
  match the concepts it's meant to represent.

**Objects and methods used.**

- **`@dataclass`** (from Python's standard library `dataclasses`
  module) —
  *What it is:* a class decorator that automatically generates an
  `__init__` method, a readable `__repr__`, and (with `frozen=True`) an
  immutable instance, from a class's own declared fields.
  *Implementation:* applied as `@dataclass(frozen=True)` directly above
  a `class` statement whose body lists each field as a name followed by
  a type annotation (`subtotal: Decimal`); the generated `__init__`
  accepts each field as a keyword or positional argument, in
  declaration order, and `frozen=True` makes any later attempt to
  assign to a field raise `dataclasses.FrozenInstanceError`.
  *Its use:* `OrderRequest` uses `@dataclass(frozen=True)` specifically
  to get an immutable value object — matching Domain 4's own `Money`
  precedent — without hand-writing its own `__init__` and equality
  methods the way a plain `class` would require.

---

## Concept Unit: Primitive Obsession — Bundling Related Values Into a Named Type

### The Problem

`calculate_order_total`, `format_receipt_line`, and
`preview_order_total` each declare the identical signature:
`(*, subtotal, item_count, loyalty_tier)`. Nothing in Python enforces
that these three values, passed separately across three different
functions, actually represent one coherent thing — a single order
request — rather than three coincidentally-related parameters that
happen to travel together by convention. A future reader has no single
name to refer to "the thing `calculate_order_total` operates on"; they
have three names, and have to already know all three belong together to
understand any one function's own signature.

### Isolating the Concept: A Value Object Instead of Loose Primitives

Isolate this on a small, unrelated example — formatting a shipping
label from four separate strings:

```python
def format_shipping_label_primitive(street, city, state, zip_code):
    return f"{street}\n{city}, {state} {zip_code}"
```

Nothing about this signature says these four strings belong together
except that a reader has learned, by convention, to always pass them in
this exact order. Here's the same behavior, built on a real value
object instead:

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class Address:
    street: str
    city: str
    state: str
    zip_code: str


def format_shipping_label(address):
    return f"{address.street}\n{address.city}, {address.state} {address.zip_code}"
```

Run both, then confirm the new type is genuinely immutable:

```python
addr = Address("123 Main St", "Springfield", "IL", "62704")
print(format_shipping_label(addr))
try:
    addr.city = "Chicago"
except Exception as e:
    print(f"{type(e).__name__}: {e}")
```

Running this produces:

```text
123 Main St
Springfield, IL 62704
FrozenInstanceError: cannot assign to field 'city'
```

`format_shipping_label` now takes exactly one parameter,
`address`, whose own type — `Address` — already states that these four
values belong together; a reader doesn't have to already know the
convention, because the convention is now the type itself.
`addr.city = "Chicago"` raises `FrozenInstanceError` rather than
silently succeeding, the same immutability guarantee Domain 4's own
`Money` value object already established for this curriculum. This is
the fix for **primitive obsession**: replacing several loose
primitives, related only by convention, with one named type that makes
the relationship explicit and enforced.

This throwaway example is discarded now — `Address` and
`format_shipping_label` exist only to demonstrate the construct and
will not appear in the pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing_calculations.py`, exactly as Lesson 102 left
it. **Files affected:** `pricing_calculations.py`, modified. **Change
type:** add a new `OrderRequest` value object; change
`calculate_order_total`, `format_receipt_line`, and
`preview_order_total` to each accept one `OrderRequest` instead of
three separate keyword-only parameters. **Location:** `OrderRequest`
declared near the top of the file, alongside the existing constants;
each of the three functions' own signature and body updated to match.
**Dependencies:** Python's standard library `dataclasses` module,
imported alongside the existing `decimal` import.

`calculate_order_total`, exactly as Lesson 102 left it:

```python
def calculate_order_total(*, subtotal, item_count, loyalty_tier):
    if loyalty_tier not in VALID_LOYALTY_TIERS:
        raise ValueError(f"Unknown loyalty tier: {loyalty_tier!r}")
    if item_count < 0:
        raise ValueError(f"item_count cannot be negative: {item_count}")
    if subtotal <= 0:
        return Decimal("0")
    discounted_subtotal = apply_bulk_discount(subtotal)
    discounted_subtotal = apply_gold_tier_discount(discounted_subtotal, loyalty_tier)
    shipping_fee = calculate_shipping_fee(subtotal)
    bulk_handling_fee = calculate_bulk_handling_fee(item_count)
    return discounted_subtotal + shipping_fee + bulk_handling_fee
```

### The New Code

The new value object:

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class OrderRequest:
    subtotal: Decimal
    item_count: int
    loyalty_tier: str
```

And `calculate_order_total`'s own body, rewritten around it:

```python
def calculate_order_total(order_request):
    if order_request.loyalty_tier not in VALID_LOYALTY_TIERS:
        raise ValueError(f"Unknown loyalty tier: {order_request.loyalty_tier!r}")
    if order_request.item_count < 0:
        raise ValueError(f"item_count cannot be negative: {order_request.item_count}")
    if order_request.subtotal <= 0:
        return Decimal("0")
    discounted_subtotal = apply_bulk_discount(order_request.subtotal)
    discounted_subtotal = apply_gold_tier_discount(discounted_subtotal, order_request.loyalty_tier)
    shipping_fee = calculate_shipping_fee(order_request.subtotal)
    bulk_handling_fee = calculate_bulk_handling_fee(order_request.item_count)
    return discounted_subtotal + shipping_fee + bulk_handling_fee
```

### The Updated Project

`pricing_calculations.py`'s relevant parts, in full, after this unit's
change:

```python
from dataclasses import dataclass                                            # ← new
from decimal import Decimal

BULK_DISCOUNT_THRESHOLD = Decimal("100.00")
BULK_DISCOUNT_RATE = Decimal("0.9")
GOLD_TIER_DISCOUNT_RATE = Decimal("0.95")
FREE_SHIPPING_THRESHOLD = Decimal("50.00")
STANDARD_SHIPPING_FEE = Decimal("5.99")
BULK_HANDLING_ITEM_THRESHOLD = 10
BULK_HANDLING_FEE = Decimal("2.50")
VALID_LOYALTY_TIERS = frozenset({"standard", "gold"})


@dataclass(frozen=True)                                                       # ← new
class OrderRequest:                                                             # ← new
    subtotal: Decimal                                                           # ← new
    item_count: int                                                              # ← new
    loyalty_tier: str                                                            # ← new


def calculate_order_total(order_request):                                     # ← new signature
    if order_request.loyalty_tier not in VALID_LOYALTY_TIERS:                   # ← new
        raise ValueError(f"Unknown loyalty tier: {order_request.loyalty_tier!r}")
    if order_request.item_count < 0:                                              # ← new
        raise ValueError(f"item_count cannot be negative: {order_request.item_count}")
    if order_request.subtotal <= 0:                                                 # ← new
        return Decimal("0")
    discounted_subtotal = apply_bulk_discount(order_request.subtotal)                 # ← new
    discounted_subtotal = apply_gold_tier_discount(discounted_subtotal, order_request.loyalty_tier)  # ← new
    shipping_fee = calculate_shipping_fee(order_request.subtotal)                       # ← new
    bulk_handling_fee = calculate_bulk_handling_fee(order_request.item_count)             # ← new
    return discounted_subtotal + shipping_fee + bulk_handling_fee


def format_receipt_line(order_request):                                       # ← new signature
    result = calculate_order_total(order_request)                               # ← new
    return f"Total: ${result}"


def preview_order_total(order_request):                                       # ← new signature
    return calculate_order_total(order_request)                                 # ← new
```

Every one of these three functions now takes exactly one parameter, and
every one of them means the identical thing by it: one `OrderRequest`,
carrying every value together that this file's own business rules
actually need at once.

### Mechanical Walkthrough

- **`@dataclass(frozen=True)`** — a decorator, applied directly above
  `class OrderRequest:`; it runs once, when the class itself is
  defined, generating `__init__`, `__repr__`, `__eq__`, and — because
  `frozen=True` — a `__setattr__` that raises
  `dataclasses.FrozenInstanceError` on any attempt to assign to an
  already-constructed instance's own field.
- **`subtotal: Decimal`, `item_count: int`, `loyalty_tier: str`** —
  three field declarations, each a name followed by a type annotation;
  `@dataclass` reads these to build its generated `__init__`'s own
  parameter list, in this exact order.
- **`order_request.subtotal`, `order_request.item_count`,
  `order_request.loyalty_tier`** — attribute access, reading each
  field back out of the passed-in `OrderRequest` instance; every place
  this function previously read a bare parameter now reads the
  identical value through one shared object instead.

### CS Lens

Bundling several related primitives into one named type is the
identical move this curriculum already made once, generically, back in
Domain 4: an **aggregate** — several individually simple values,
combined into one structure that's meaningful as a whole, with its own
identity separate from any one of its parts. `OrderRequest` is that
exact shape, applied here specifically to solve primitive obsession:
the aggregate's own type is what a scattered group of primitives never
had — a name.

```
Also recognized in: a date range represented as a single DateRange
object instead of two loose start_date/end_date variables passed
everywhere together, an RGB color represented as one Color type instead
of three separate r, g, b integers, and a database's own composite
primary key, modeled as one conceptual identity even though it's
physically stored as more than one column
```

### SE Lens

The alternative not chosen is leaving `subtotal`, `item_count`, and
`loyalty_tier` as three separate parameters, on the argument that three
plain values are simpler to construct at a call site than one object —
`calculate_order_total(subtotal=s, item_count=n, loyalty_tier=t)`
doesn't require importing or instantiating anything beyond the values
already at hand. That's a real, if modest, cost this refactor accepts:
every existing call site now has to construct an `OrderRequest` first,
one extra step that plain keyword arguments didn't require. The benefit
this unit's own next section makes concrete, not just asserted: once
these three values are one type, a future change to what an order
request needs touches exactly one class definition, not every function
signature that happens to accept the same three primitives.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing_calculations.py
```

### Run It

Every case this domain has tracked since Lesson 93, now constructed
as `OrderRequest` instances:

```python
if __name__ == "__main__":
    cases = [
        ("A", Decimal("142.50"), 3, "gold"),
        ("B", Decimal("42.00"), 1, "gold"),
        ("C", Decimal("75.00"), 1, "gold"),
        ("D", Decimal("250.00"), 15, "standard"),
    ]
    for label, s, n, t in cases:
        request = OrderRequest(subtotal=s, item_count=n, loyalty_tier=t)
        result = calculate_order_total(request)
        print(f"{label}: subtotal={s} items={n} tier={t} -> total={result}")
```

Running this produces:

```text
A: subtotal=142.50 items=3 tier=gold -> total=121.83750
B: subtotal=42.00 items=1 tier=gold -> total=45.8900
C: subtotal=75.00 items=1 tier=gold -> total=71.2500
D: subtotal=250.00 items=15 tier=standard -> total=227.500
```

Identical to every prior lesson's own results — bundling three
parameters into one `OrderRequest` changed nothing about what any case
computes.

### Connecting Back

Every function that needs subtotal, item count, and loyalty tier
together now shares one type for referring to them — the next unit
proves, with a real change, exactly what that buys the moment one more
piece of information needs to join them.

---

## Concept Unit: Shotgun Surgery — What a Small Change Should Cost

### The Problem

Imagine the order-processing service adds gift wrapping: an order can
now optionally request it, and this fact needs to reach
`calculate_order_total`, `format_receipt_line`, and
`preview_order_total` alike, since all three work with the same
concept of "everything about this order request." Against Lesson 102's
own three-separate-parameter version, adding `gift_wrap` would mean
editing all three function signatures, plus every call site that calls
any of them — one small, conceptually simple change to what an order
request contains, mechanically scattered across every place that
concept appears.

### Isolating the Concept: One Small Change, Measured Two Ways

Isolate this on a small, unrelated example — three functions, each
formatting a contact a different way, all sharing the same three loose
parameters:

```python
def format_contact_card_primitive(name, email, phone):
    return f"{name} | {email} | {phone}"


def format_contact_short_primitive(name, email, phone):
    return f"{name} <{email}>"


def format_contact_dialer_primitive(name, email, phone):
    return f"Call {name}: {phone}"
```

Adding a `company` field here would require adding a fourth parameter
to all three signatures, whether or not each individual function
actually uses it. Here's the same three functions, built on a `Contact`
value object instead:

```python
from dataclasses import dataclass


@dataclass(frozen=True)
class Contact:
    name: str
    email: str
    phone: str


def format_contact_card(contact):
    return f"{contact.name} | {contact.email} | {contact.phone}"


def format_contact_short(contact):
    return f"{contact.name} <{contact.email}>"


def format_contact_dialer(contact):
    return f"Call {contact.name}: {contact.phone}"
```

Now add a `company` field, with a default so existing callers don't
break, to `Contact` alone:

```python
@dataclass(frozen=True)
class ContactWithCompany:
    name: str
    email: str
    phone: str
    company: str = ""
```

Run all three functions, unchanged, against an instance carrying the
new field:

```python
c2 = ContactWithCompany("Ana", "ana@example.com", "555-0100", company="Acme")
print(format_contact_card(c2))
print(format_contact_short(c2))
print(format_contact_dialer(c2))
```

Running this produces:

```text
Ana | ana@example.com | 555-0100
Ana <ana@example.com>
Call Ana: 555-0100
```

Every one of the three formatting functions runs completely unmodified
— `company` exists on the object being passed in, but none of these
three functions needed a single line changed to keep working, because
none of them read `company` in the first place. The primitive-parameter
version would have needed all three signatures edited just to accept
the new value, whether or not any individual function actually used
it. This is **shotgun surgery**, and its fix: a conceptual change (a
contact gained a new attribute) now costs exactly one edit (the value
object's own definition), not one edit per function that happens to
touch the concept.

This throwaway example is discarded now — `Contact`,
`ContactWithCompany`, and all three formatting functions exist only to
demonstrate the concept and will not appear in the pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing_calculations.py`, exactly as this lesson's
own first unit left it. **Files affected:** `pricing_calculations.py`,
modified. **Change type:** add one new field, `gift_wrap`, to
`OrderRequest`, with a default value so every existing call site keeps
working unchanged. **Location:** `OrderRequest`'s own class body.
**Dependencies:** none.

### The New Code

```python
    gift_wrap: bool = False
```

### The Updated Project

`OrderRequest`, in full, after this unit's change — the only part of
`pricing_calculations.py` this unit touches:

```python
@dataclass(frozen=True)
class OrderRequest:
    subtotal: Decimal
    item_count: int
    loyalty_tier: str
    gift_wrap: bool = False    # ← new
```

`calculate_order_total`, `format_receipt_line`, and
`preview_order_total` — every one of them still reading
`order_request.subtotal`, `order_request.item_count`, and
`order_request.loyalty_tier` exactly as this lesson's first unit left
them — need no edit at all to keep working with the new field present.

### Mechanical Walkthrough

- **`gift_wrap: bool = False`** — a fourth field declaration, with a
  default value; `@dataclass` places any field with a default after
  every field without one in the generated `__init__`'s own parameter
  list, so `OrderRequest(subtotal=..., item_count=..., loyalty_tier=...)`
  — every existing call site in this file — still works unchanged,
  with `gift_wrap` defaulting to `False`.
- **Every function signature in the file** — literally zero of them
  changed in this unit; the entire diff this unit introduces is the
  single new field line above.

### CS Lens

A change that costs exactly one edit, proportional to how conceptually
small it is, is the direct, practical payoff of **encapsulation** —
this curriculum's own Domain 5 vocabulary, now demonstrated with a
real, counted example instead of only defined. `OrderRequest`
encapsulates what an order request contains; every function that
merely *uses* an order request, rather than defining what one is,
never needed to know its exact shape changed at all.

```
Also recognized in: a database schema migration adding one nullable
column instead of requiring every query that touches that table to be
rewritten, an API adding one optional field to a request body without
breaking any client that doesn't yet send it, and a version-controlled
codebase's own diff size — this domain's own Lesson 89 already
established that a real, measured tradeoff (in that lesson's case,
architecture) is more convincing than an assumed one, and here the
measurement is simply "how many lines changed"
```

### SE Lens

The alternative this lesson's own first unit already rejected —
leaving three separate primitive parameters — is the version this
unit's own demonstration makes concrete: adding `gift_wrap` to that
version would have required a fourth parameter on
`calculate_order_total`, `format_receipt_line`, and
`preview_order_total` alike, plus updating every call site that
constructs a call to any of them, even the ones that have no reason to
care about gift wrapping at all. The real cost this unit's version
still carries, honestly: `OrderRequest` is now a shared type that every
function calling into this file depends on the shape of; a
*genuinely* breaking change to it — removing a field, not adding one —
would still need every consumer updated, the same as it always would.
What this unit's fix specifically buys is cheap, backward-compatible
growth: adding new, optional information to a concept that already has
a name, without that growth radiating out into every function that
merely uses the concept rather than defining it.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing_calculations.py
```

### Run It

`OrderRequest`, constructed both with and without the new `gift_wrap`
field, run through the unchanged `format_receipt_line` and
`preview_order_total`:

```python
request = OrderRequest(subtotal=Decimal("42.00"), item_count=1, loyalty_tier="gold", gift_wrap=True)
print("gift_wrap field accessible:", request.gift_wrap)
print(format_receipt_line(request))
print(preview_order_total(request))

request_default = OrderRequest(subtotal=Decimal("42.00"), item_count=1, loyalty_tier="gold")
print("default gift_wrap:", request_default.gift_wrap)
print(format_receipt_line(request_default))
```

Running this produces:

```text
gift_wrap field accessible: True
Total: $45.8900
45.8900
default gift_wrap: False
Total: $45.8900
```

Both requests — one explicitly gift-wrapped, one using the new field's
own default — produce the identical, correct `45.89` total this domain
has verified since Lesson 93; `format_receipt_line` and
`preview_order_total` needed no changes at all to keep working
correctly once `gift_wrap` existed.

### Connecting Back

`pricing_calculations.py` can now grow what an order request contains
without that growth radiating out into every function that merely uses
one — the same four business rules this domain has carried since
Lesson 93, now represented by a single named type that makes both this
lesson's own two smells, primitive obsession and shotgun surgery,
structurally harder to reintroduce than they were to fix.

## Connect the Pieces

The same gold-tier, $42.00 case, traced through both units: Lesson 102
left `calculate_order_total`, `format_receipt_line`, and
`preview_order_total` each independently declaring the identical
three-parameter signature, with nothing in the code itself stating that
`subtotal`, `item_count`, and `loyalty_tier` belonged together beyond
convention. This lesson's first unit replaced all three signatures with
one shared `OrderRequest` value object, producing the identical `45.89`
for the header's own case while giving every function that needs "an
order request" one name to ask for instead of three primitives to
remember in order. The second unit then added `gift_wrap` to
`OrderRequest` alone — one field, one line — and proved, by actually
running every affected function unchanged, that none of the three
needed to be touched at all, where the pre-refactor version would have
required editing every one of them. Same four business rules, same
`45.89` for the header's own case, and a real, measured difference
between a codebase where a small conceptual change costs one edit and
one where it costs several, scattered ones.

## What Breaks Without This

Revert `OrderRequest` to a plain, unfrozen class with no `@dataclass`
decorator at all — the shape a rushed refactor might reach for,
reasoning that "a frozen dataclass is more ceremony than a plain
class needs" — and demonstrate what that specific choice costs:

```python
class OrderRequestUnfrozen:
    def __init__(self, subtotal, item_count, loyalty_tier):
        self.subtotal = subtotal
        self.item_count = item_count
        self.loyalty_tier = loyalty_tier


request = OrderRequestUnfrozen(subtotal=Decimal("42.00"), item_count=1, loyalty_tier="gold")
total_before = calculate_order_total(request)

# somewhere else, far away, in a function that only meant to log the request
request.subtotal = Decimal("999999.00")

total_after = calculate_order_total(request)
print("total before the far-away mutation:", total_before)
print("total after the far-away mutation:", total_after)
```

Running this produces:

```text
total before the far-away mutation: 45.8900
total after the far-away mutation: 899995.30
```

Nothing about this code raised an error — a plain, unfrozen class lets
any code holding a reference to `request` reassign any of its fields at
any time, from anywhere, and `calculate_order_total`'s second call
silently computes a wildly different total from the exact same
variable name, because something far away, with no obvious connection
to pricing at all, mutated it first. This is exactly what `frozen=True`
was chosen to prevent — an `OrderRequest`, once constructed, is meant
to be trusted as unchanging for as long as any code holds a reference
to it, the same guarantee Domain 4's own `Money` value object already
established. Restore `@dataclass(frozen=True)` before moving on.

## Exercises

1. `build_order_summary` and `process_order_and_log`, in
   `pricing_batch.py`, still take `subtotal`, `item_count`, and
   `loyalty_tier` as separate values (alongside `order_lines` or
   `order_id`, which don't belong in `OrderRequest`). Decide whether
   either of them should be updated to accept an `OrderRequest` too,
   and write down your reasoning for each one individually — they
   don't have to reach the same answer.
2. Add a `discount_code: str | None = None` field to `OrderRequest`,
   following this lesson's own exact pattern, and confirm with a real
   run that every case in this lesson's own "Run It" step still
   produces its correct total, unchanged, with the new field simply
   unused so far.
3. Name one other primitive-obsession candidate elsewhere in this
   domain's own running example — three or more loose values that
   travel together across more than one function — and write, in your
   own words, whether bundling them into a value object would be worth
   it here, using this lesson's own SE Lens tradeoff (construction cost
   versus future-change cost) as your standard, not just "because value
   objects are good practice."

## Definition of Done

- [ ] You can explain, using this lesson's own real
      `FrozenInstanceError`, why `OrderRequest` uses
      `@dataclass(frozen=True)` instead of a plain class.
- [ ] You can state primitive obsession and shotgun surgery in your own
      words, and point to the specific line in this lesson's own
      "Updated Project" that fixes each one.
- [ ] You can explain, using this lesson's own real before/after
      output, why adding `gift_wrap` required editing zero function
      signatures once `OrderRequest` existed.
- [ ] You've completed all three exercises.
- [ ] `pricing_calculations.py` matches this lesson's own final state,
      and running it reproduces this lesson's own final "Run It" output
      exactly.
- [ ] Commit the file with a message explaining why the change was
      made — e.g. `git commit -m "Replace subtotal/item_count/
      loyalty_tier primitives with a frozen OrderRequest value object;
      fixes primitive obsession and shotgun surgery risk"` — not
      `git commit -m "refactor signatures"`, which names neither smell
      this change actually addresses.

Lesson 104, Engineering Conventions, is next — the last lesson of
Domain 7 (Implementation Engineering).
