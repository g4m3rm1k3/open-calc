# Lesson 95: Function and Method Design

**What you will build.** Continuing `pricing.py` from Lesson 94's final
state: splitting `calculate_order_total`'s single, four-rule body into
four small, independently-named functions it composes, and converting
its own public signature to keyword-only parameters after a real,
demonstrated bug shows what a positional call can silently get wrong.
Transferable problem: a function's *design* — how many things it does,
and how a caller is required to supply its inputs — is a decision with
real consequences, independent of whether every line inside it is
already readable and well-named.

**What you need to know first.** Lesson 93 (Readable Code) and Lesson
94 (Naming) — this lesson continues the identical `pricing.py` file
from exactly where Lesson 94 left it. Domain 1's Lesson 8 (Separation
of Concerns) — this lesson's first unit is that same principle, applied
at the scale of one function's own internal structure instead of a
whole module's.

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

Still the **Implementation** stage. Carrying the same concrete value
forward: a gold-tier customer with a $42.00 subtotal and one item.
Every earlier stage is unchanged from Lesson 93's own account of it;
this lesson's second unit specifically concerns itself with a new
failure mode that only exists at the **Implementation** stage's own
boundary — how a caller, elsewhere in this same stage, is allowed to
invoke this function.

**Terms used in this lesson.**

- **Single responsibility (at function scope)** — a function should
  have one reason to change: one rule, one calculation, one decision.
  It exists because a function computing several unrelated things
  forces every future change to one rule to touch code that also
  affects the others, and forces every reader trying to verify one rule
  to read past the other three first.
- **Function composition** — building a result by calling several small
  functions and combining their outputs, rather than writing all the
  logic those small functions would contain directly inline; it exists
  because a caller reading the composing function can trust each named
  call to do exactly what its name says, without re-verifying the logic
  inside it every time.
- **Positional argument** — an argument matched to a parameter by the
  order it's written in at the call site, not by name; it's a source of
  real bugs specifically when two or more parameters share a compatible
  type, because nothing stops them from being passed in the wrong
  order and nothing necessarily crashes when that happens.
- **Keyword-only parameter** — a parameter that can only be supplied by
  name at the call site (`name=value`), never by position, marked in a
  function's signature with a bare `*` before it; it exists specifically
  to make the positional-argument mistake above impossible, by removing
  position as a way to supply that parameter at all.

**Objects and methods used.**

- **`Decimal`** (from Python's standard library `decimal` module) —
  *What it is:* an immutable numeric type for exact base-10 arithmetic.
  *Implementation:* constructed as `Decimal(value)` from a string,
  integer, or another `Decimal`; supports `+`, `-`, `*`, `/`, and
  comparisons, each returning a new `Decimal`.
  *Its use:* unchanged from Lessons 93 and 94 — every dollar amount in
  `pricing.py` is still a `Decimal`, including inside each of this
  lesson's newly-extracted functions.

---

## Concept Unit: Extracting Functions for Single Responsibility

### The Problem

`calculate_order_total` reads cleanly now — flat, named, commented — but
it still does four separate things inside one function body: applies a
bulk discount, applies a gold-tier discount, computes a shipping fee,
and computes a bulk-handling fee. A reader who only wants to verify the
shipping rule still has to read past the discount logic and the
handling-fee logic to find it, and a future change to the bulk-discount
rate risks an edit landing inside code that also happens to compute
something unrelated, simply because both live in the same function
body.

### Isolating the Concept: Extract Function

Isolate this on a small, unrelated example — validating a password
against two independent rules:

```python
def is_valid_password_mixed(pw):
    if len(pw) < 8:
        return False
    has_digit = False
    for ch in pw:
        if ch.isdigit():
            has_digit = True
    return has_digit
```

This one function checks length *and* checks for a digit, using two
different techniques (a direct comparison, then a hand-rolled loop) a
reader has to parse separately to realize they're independent rules.
Here's the same validation, split into three functions:

```python
def has_min_length(pw, minimum=8):
    return len(pw) >= minimum


def has_digit(pw):
    return any(ch.isdigit() for ch in pw)


def is_valid_password(pw):
    return has_min_length(pw) and has_digit(pw)
```

Run both versions against three passwords:

```python
for pw in ["short1", "longenough", "longenough1"]:
    a = is_valid_password_mixed(pw)
    b = is_valid_password(pw)
    print(f"pw={pw!r} -> mixed={a} decomposed={b} match={a == b}")
```

Running this against all three passwords produces:

```text
pw='short1' -> mixed=False decomposed=False match=True
pw='longenough' -> mixed=False decomposed=False match=True
pw='longenough1' -> mixed=True decomposed=True match=True
```

Identical results in every case — splitting the function changed
nothing about which passwords pass. `has_min_length` and `has_digit`
each check exactly one rule and can be read, tested, and reused on
their own; `is_valid_password` reads as a direct statement of the
actual requirement — both rules must hold — by calling each one by
name instead of inlining its logic. This is called **extracting a
function**: pulling one self-contained piece of logic out of a larger
function into its own, separately named one.

This throwaway example is discarded now — all three password functions
exist only to demonstrate extraction and will not appear in the pricing
project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`, exactly as Lesson 94 left it. **Files
affected:** `pricing.py`, modified. **Change type:** refactor — extract
each of `calculate_order_total`'s four independent computations into
its own top-level function, then rewrite `calculate_order_total` to
call all four and combine their results. **Location:** four new
functions added above `calculate_order_total`; its own body replaced
with calls to them. **Dependencies:** none.

`calculate_order_total`, exactly as Lesson 94 left it:

```python
def calculate_order_total(subtotal, item_count, loyalty_tier):
    if subtotal <= 0:
        return Decimal("0")

    if subtotal > BULK_DISCOUNT_THRESHOLD:
        discounted_subtotal = subtotal * BULK_DISCOUNT_RATE
    else:
        discounted_subtotal = subtotal

    if loyalty_tier == "gold":
        discounted_subtotal = discounted_subtotal * GOLD_TIER_DISCOUNT_RATE

    if subtotal >= FREE_SHIPPING_THRESHOLD:
        shipping_fee = Decimal("0")
    else:
        shipping_fee = STANDARD_SHIPPING_FEE

    if item_count > BULK_HANDLING_ITEM_THRESHOLD:
        bulk_handling_fee = BULK_HANDLING_FEE
    else:
        bulk_handling_fee = Decimal("0")

    total = discounted_subtotal + shipping_fee + bulk_handling_fee
    return total
```

Four independent rules, each identifiable by which local variable it
assigns, all sharing one function body and one set of guard-clause-flat
`if`/`else` blocks that a reader has to visually separate from each
other by hand.

### The New Code

The four extracted functions, each responsible for exactly one rule:

```python
def apply_bulk_discount(subtotal):
    if subtotal > BULK_DISCOUNT_THRESHOLD:
        return subtotal * BULK_DISCOUNT_RATE
    return subtotal


def apply_gold_tier_discount(subtotal, loyalty_tier):
    if loyalty_tier == "gold":
        return subtotal * GOLD_TIER_DISCOUNT_RATE
    return subtotal


def calculate_shipping_fee(subtotal):
    if subtotal >= FREE_SHIPPING_THRESHOLD:
        return Decimal("0")
    return STANDARD_SHIPPING_FEE


def calculate_bulk_handling_fee(item_count):
    if item_count > BULK_HANDLING_ITEM_THRESHOLD:
        return BULK_HANDLING_FEE
    return Decimal("0")
```

And `calculate_order_total`'s own body, rewritten to call them:

```python
def calculate_order_total(subtotal, item_count, loyalty_tier):
    if subtotal <= 0:
        return Decimal("0")

    discounted_subtotal = apply_bulk_discount(subtotal)
    discounted_subtotal = apply_gold_tier_discount(discounted_subtotal, loyalty_tier)
    shipping_fee = calculate_shipping_fee(subtotal)
    bulk_handling_fee = calculate_bulk_handling_fee(item_count)

    return discounted_subtotal + shipping_fee + bulk_handling_fee
```

### The Updated Project

`pricing.py`, in full, after this unit's change:

```python
from decimal import Decimal

BULK_DISCOUNT_THRESHOLD = Decimal("100.00")
BULK_DISCOUNT_RATE = Decimal("0.9")
GOLD_TIER_DISCOUNT_RATE = Decimal("0.95")
FREE_SHIPPING_THRESHOLD = Decimal("50.00")
STANDARD_SHIPPING_FEE = Decimal("5.99")
BULK_HANDLING_ITEM_THRESHOLD = 10
BULK_HANDLING_FEE = Decimal("2.50")


def apply_bulk_discount(subtotal):                          # ← new
    if subtotal > BULK_DISCOUNT_THRESHOLD:
        return subtotal * BULK_DISCOUNT_RATE
    return subtotal


def apply_gold_tier_discount(subtotal, loyalty_tier):        # ← new
    # Marketing wants gold-tier spend to always feel cheaper, so this stacks
    # on top of the bulk discount instead of being replaced by it.
    if loyalty_tier == "gold":
        return subtotal * GOLD_TIER_DISCOUNT_RATE
    return subtotal


def calculate_shipping_fee(subtotal):                        # ← new
    if subtotal >= FREE_SHIPPING_THRESHOLD:
        return Decimal("0")
    return STANDARD_SHIPPING_FEE


def calculate_bulk_handling_fee(item_count):                  # ← new
    # Orders over 10 items require manual warehouse packing instead of the
    # automated line; this fee passes that extra labor cost to the customer.
    if item_count > BULK_HANDLING_ITEM_THRESHOLD:
        return BULK_HANDLING_FEE
    return Decimal("0")


def calculate_order_total(subtotal, item_count, loyalty_tier):
    if subtotal <= 0:
        return Decimal("0")

    discounted_subtotal = apply_bulk_discount(subtotal)                              # ← new
    discounted_subtotal = apply_gold_tier_discount(discounted_subtotal, loyalty_tier)  # ← new
    shipping_fee = calculate_shipping_fee(subtotal)                                    # ← new
    bulk_handling_fee = calculate_bulk_handling_fee(item_count)                        # ← new

    return discounted_subtotal + shipping_fee + bulk_handling_fee


def format_receipt_line(subtotal, item_count, loyalty_tier):
    result = calculate_order_total(subtotal, item_count, loyalty_tier)
    return f"Total: ${result}"
```

`calculate_order_total` now reads as five lines stating what it does —
guard against a non-positive subtotal, then apply each of four named
rules — with every rule's own actual logic living in its own function,
one level down, findable and testable on its own.

### Mechanical Walkthrough

- **`def apply_bulk_discount(subtotal):`** — a new function, taking
  only the one value it needs (`subtotal`), not the whole original
  parameter list; it has no way to accidentally depend on `item_count`
  or `loyalty_tier` because they're not in scope inside it at all.
- **`def apply_gold_tier_discount(subtotal, loyalty_tier):`** — takes
  the two values this specific rule needs; its own comment — carried
  over unchanged from Lesson 93 — now sits directly on the function
  that rule belongs to, rather than floating inside a larger function's
  body.
- **`def calculate_shipping_fee(subtotal):`**, **`def
  calculate_bulk_handling_fee(item_count):`** — same pattern, each
  taking exactly the one value its own rule depends on.
- **`discounted_subtotal = apply_bulk_discount(subtotal)`** — a
  function call, assigning its return value; this line and the next
  read, together, as "apply the bulk discount, then apply the gold-tier
  discount on top of whatever that produced" — the exact order the
  business rule requires, now stated as two calls instead of two nested
  reassignments.
- **`shipping_fee = calculate_shipping_fee(subtotal)`**, **`bulk_handling_fee
  = calculate_bulk_handling_fee(item_count)`** — two more calls, each
  independent of the discount calculation above them and of each
  other, which their separate function signatures make visible: neither
  one even accepts `loyalty_tier` as an argument, so nothing about
  either of them could depend on it.
- **`return discounted_subtotal + shipping_fee + bulk_handling_fee`** —
  unchanged in shape from Lesson 94's version, now summing four
  independently-computed values instead of four values computed inline.

### CS Lens

Extracting a function this way is the same operation as a compiler's
own **procedural abstraction**: naming a reusable computation once and
invoking it by name, so every call site can treat it as a single unit
of behavior instead of re-deriving what it does from its inlined
implementation each time. It's also the identical shape as **Separation
of Concerns**, this curriculum's own Lesson 8, applied one level down
from where that lesson first taught it: there, the concern being
separated was a whole responsibility split across modules; here, it's
four responsibilities that used to share one function body and now each
have their own.

```
Also recognized in: a build pipeline's own named stages (compile, test,
package) instead of one script running every step inline, a database
query planner breaking one query into named sub-plans it can reuse
across other queries, and a recipe's own numbered sub-steps ("make the
sauce," "prep the vegetables") instead of one unbroken paragraph
```

### SE Lens

The alternative not chosen is keeping all four rules inside one
function, on the argument that the whole calculation is genuinely one
cohesive concept — "the order total" — and splitting it scatters that
single concept across five function definitions a reader now has to
jump between instead of reading top to bottom in one place. That's a
real cost: this refactor trades local, linear readability (everything
in one place) for modular, composable readability (each piece on its
own, callable and testable independently) — and for a function this
small, the tradeoff is genuinely close, not an obvious win either way.
The concrete benefit this lesson's version buys: `apply_bulk_discount`
and the other three functions can now be tested, reused, or reasoned
about individually — a future lesson needing to verify only the
shipping rule can call `calculate_shipping_fee` directly, without
constructing a full order and reading through unrelated discount logic
to isolate its effect. The concrete cost: a reader who wants the whole
picture now has to open five function definitions instead of one, and
`discounted_subtotal`'s own value now depends on the order two separate
function calls happen to run in — a dependency that was visually
obvious as two adjacent lines inside one function body and is now
slightly less obvious spread across two call sites in
`calculate_order_total`'s own five-line body.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing.py
```

### Run It

The same four cases, run against the decomposed version:

```text
A: subtotal=142.50 items=3 tier=gold -> total=121.83750
B: subtotal=42.00 items=1 tier=gold -> total=45.8900
C: subtotal=75.00 items=1 tier=gold -> total=71.2500
D: subtotal=250.00 items=15 tier=standard -> total=227.500
```

Identical to Lesson 94's own final output — splitting one function into
five changed nothing about what any of them compute together.

### Connecting Back

Each rule now lives in its own function, callable on its own — but
`calculate_order_total`'s own signature still accepts `subtotal`,
`item_count`, and `loyalty_tier` positionally, which is a real risk the
next unit demonstrates concretely, not just asserts.

---

## Concept Unit: Keyword-Only Parameters Prevent Positional Mistakes

### The Problem

`calculate_order_total(subtotal, item_count, loyalty_tier)` is called
positionally at both of its current call sites — inside
`format_receipt_line` and inside the `__main__` block's loop. Nothing
in Python's own function-call syntax stops a future caller from passing
those same three arguments in the wrong order. `subtotal` is a
`Decimal`, and `item_count` is a plain `int` — both are numbers, both
support comparison against the same kinds of thresholds inside this
function's own extracted helpers, so a swap between them wouldn't
necessarily crash. It could just as easily compute a wrong number
silently and ship it.

### Isolating the Concept: Keyword-Only Parameter

Isolate this on a small, unrelated example — scheduling a meeting with
two independent boolean flags:

```python
def schedule_meeting_positional(is_recurring, is_private):
    return f"recurring={is_recurring} private={is_private}"
```

Call it as intended, then call it with the two arguments accidentally
swapped:

```python
intended = schedule_meeting_positional(True, False)
swapped = schedule_meeting_positional(False, True)
print(f"intended call schedule_meeting_positional(True, False) -> {intended}")
print(f"accidental swap schedule_meeting_positional(False, True) -> {swapped}")
```

Running this produces:

```text
intended call schedule_meeting_positional(True, False) -> recurring=True private=False
accidental swap schedule_meeting_positional(False, True) -> recurring=False private=True
```

Both calls run without error, and produce two completely different,
equally plausible-looking meetings — nothing about either call site
looks obviously wrong on its own; a reader has to already remember the
declared parameter order to catch the mistake. Here's the same function
with both parameters made keyword-only, using a bare `*` in the
signature to mark everything after it as name-only:

```python
def schedule_meeting(*, is_recurring, is_private):
    return f"recurring={is_recurring} private={is_private}"
```

Try calling it positionally, then call it correctly by name, in two
different argument orders:

```python
try:
    schedule_meeting(True, False)
except TypeError as e:
    print(f"TypeError: {e}")
print(schedule_meeting(is_recurring=True, is_private=False))
print(schedule_meeting(is_private=False, is_recurring=True))
```

Running this produces:

```text
TypeError: schedule_meeting() takes 0 positional arguments but 2 were given
recurring=True private=False
recurring=True private=False
```

The positional call now fails immediately and loudly, before it can
compute a wrong result silently. Both keyword calls succeed and agree,
regardless of which order the two keyword arguments are written in at
the call site — because a keyword argument is matched to its parameter
by name, not by position, the order they're written in no longer
matters at all. The bare `*` marking this is called a **keyword-only
parameter** boundary: every parameter after it can only be supplied by
name.

This throwaway example is discarded now — both versions of
`schedule_meeting` exist only to demonstrate keyword-only parameters
and will not appear in the pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`. **Files affected:** `pricing.py`,
modified. **Change type:** refactor — add a bare `*` to
`calculate_order_total`'s signature, making all three of its parameters
keyword-only, and update both existing call sites
(`format_receipt_line` and the `__main__` block) to pass all three
arguments by name. **Location:** `calculate_order_total`'s own
definition, plus every call to it. **Dependencies:** none.

Before this change, here's the exact bug this unit exists to prevent,
demonstrated against `calculate_order_total` itself — a caller
accidentally swapping `subtotal` and `item_count`, both of which are
plain numbers `calculate_order_total`'s current positional signature
has no way to tell apart:

```python
print(calculate_order_total(Decimal("42.00"), 1, "gold"))
print(calculate_order_total(3, Decimal("42.00"), "gold"))
```

Running this against `calculate_order_total`'s current, positional
signature produces:

```text
45.8900
11.34
```

The correct call returns `45.89`, matching every prior run in this
lesson. The swapped call — subtotal and item count reversed — doesn't
crash. It silently returns `11.34`: a real, wrong, shippable dollar
amount, computed because `3` (meant to be an item count) was accepted
as a subtotal, and `Decimal("42.00")` (meant to be a subtotal) was
accepted as an item count, and neither of `calculate_order_total`'s
extracted helper functions has any way to notice the swap, because both
values are legitimately numbers.

### The New Code

`calculate_order_total`'s signature, with a bare `*` making every
parameter keyword-only:

```python
def calculate_order_total(*, subtotal, item_count, loyalty_tier):
```

The body underneath it is unchanged — only the signature line differs.

### The Updated Project

`pricing.py`, in full, after this unit's change — the final state this
lesson leaves the file in:

```python
from decimal import Decimal

BULK_DISCOUNT_THRESHOLD = Decimal("100.00")
BULK_DISCOUNT_RATE = Decimal("0.9")
GOLD_TIER_DISCOUNT_RATE = Decimal("0.95")
FREE_SHIPPING_THRESHOLD = Decimal("50.00")
STANDARD_SHIPPING_FEE = Decimal("5.99")
BULK_HANDLING_ITEM_THRESHOLD = 10
BULK_HANDLING_FEE = Decimal("2.50")


def apply_bulk_discount(subtotal):
    if subtotal > BULK_DISCOUNT_THRESHOLD:
        return subtotal * BULK_DISCOUNT_RATE
    return subtotal


def apply_gold_tier_discount(subtotal, loyalty_tier):
    # Marketing wants gold-tier spend to always feel cheaper, so this stacks
    # on top of the bulk discount instead of being replaced by it.
    if loyalty_tier == "gold":
        return subtotal * GOLD_TIER_DISCOUNT_RATE
    return subtotal


def calculate_shipping_fee(subtotal):
    if subtotal >= FREE_SHIPPING_THRESHOLD:
        return Decimal("0")
    return STANDARD_SHIPPING_FEE


def calculate_bulk_handling_fee(item_count):
    # Orders over 10 items require manual warehouse packing instead of the
    # automated line; this fee passes that extra labor cost to the customer.
    if item_count > BULK_HANDLING_ITEM_THRESHOLD:
        return BULK_HANDLING_FEE
    return Decimal("0")


def calculate_order_total(*, subtotal, item_count, loyalty_tier):     # ← new: keyword-only
    if subtotal <= 0:
        return Decimal("0")

    discounted_subtotal = apply_bulk_discount(subtotal)
    discounted_subtotal = apply_gold_tier_discount(discounted_subtotal, loyalty_tier)
    shipping_fee = calculate_shipping_fee(subtotal)
    bulk_handling_fee = calculate_bulk_handling_fee(item_count)

    return discounted_subtotal + shipping_fee + bulk_handling_fee


def format_receipt_line(*, subtotal, item_count, loyalty_tier):        # ← new: keyword-only
    result = calculate_order_total(                                    # ← new: keyword call
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
    return f"Total: ${result}"
```

`calculate_order_total` and `format_receipt_line` both now require
every argument to be named at the call site — the exact swap that
silently produced `11.34` above is no longer possible to write by
accident; writing it at all now raises `TypeError` immediately.

### Mechanical Walkthrough

- **`*` in `def calculate_order_total(*, subtotal, item_count,
  loyalty_tier):`** — not a parameter itself; a bare separator marking
  every parameter after it as keyword-only. Python's own parser treats
  this as part of the function's signature, not as an argument a caller
  ever supplies.
- **`subtotal`, `item_count`, `loyalty_tier` (after the `*`)** — the
  same three parameters as before, now reachable only by
  `name=value` at the call site; positional arguments passed to this
  function raise `TypeError` before the function body ever runs.
- **`def format_receipt_line(*, subtotal, item_count, loyalty_tier):`**
  — the same `*` marker, applied here too, so the mistake this unit
  fixes can't be reintroduced one call site up, at `format_receipt_line`'s
  own boundary.
- **`calculate_order_total(subtotal=subtotal, item_count=item_count,
  loyalty_tier=loyalty_tier)`** — a keyword call, explicitly naming
  each argument being passed through; `subtotal=subtotal` here is not a
  typo or self-reference — the left-hand `subtotal` is
  `calculate_order_total`'s own parameter name, and the right-hand
  `subtotal` is the value of `format_receipt_line`'s own local
  parameter of the same name, being forwarded.

### CS Lens

Requiring arguments to be matched by name rather than position is the
identical idea behind **named parameters in a database query** or a
**struct literal with named fields**, both of which exist for the exact
same reason: a positional tuple of values is only as safe as every
caller's memory of the exact declared order, while a name-value pairing
makes the association explicit at the point of use, immune to reordering.

```
Also recognized in: a SQL INSERT statement naming its columns explicitly
instead of relying on table column order, a JSON payload's own named
keys instead of a bare array of values, and a CLI tool's long flags
(--input, --output) instead of relying on positional argument order
```

### SE Lens

The alternative not chosen is leaving `calculate_order_total`
positional, on the argument that a three-parameter function is short
enough that any caller can simply remember the declared order, and that
keyword-only parameters add a few extra characters to every call site
(`subtotal=` before every value, instead of the bare value). The real
cost that argument ignores is exactly the one this unit's own Project
Change section demonstrated with a real number: `11.34`, computed with
no error, no warning, and nothing about the call site
`calculate_order_total(3, Decimal("42.00"), "gold")` that looks wrong
to a reader who hasn't memorized the parameter order by heart. The cost
this unit's fix does carry: every existing call site had to be
rewritten to pass arguments by name, and any future call site
forgetting to do so fails loudly rather than working — a real
migration cost, paid once, in exchange for making an entire category of
silent, wrong-number bugs structurally impossible to write from this
point forward, exactly as Lesson 93's guard clauses made a specific
class of nesting-induced bugs impossible rather than merely less likely.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing.py
```

### Run It

The same eight lines of output as Lesson 94's final run — four
`calculate_order_total` results, four `format_receipt_line` lines — now
produced entirely through keyword calls:

```text
A: subtotal=142.50 items=3 tier=gold -> total=121.83750
B: subtotal=42.00 items=1 tier=gold -> total=45.8900
C: subtotal=75.00 items=1 tier=gold -> total=71.2500
D: subtotal=250.00 items=15 tier=standard -> total=227.500
A: Total: $121.83750
B: Total: $45.8900
C: Total: $71.2500
D: Total: $227.500
```

Identical to every prior run in this lesson — making the parameters
keyword-only changed how a caller is required to supply them, not what
any of the four cases compute.

### Connecting Back

`calculate_order_total` is now decomposed into four independently
testable rules and structurally protected against the exact positional
mistake this unit demonstrated with a real, silently wrong number — the
same four business rules this domain has carried since Lesson 93, now
both readable and harder to call incorrectly by accident.

## Connect the Pieces

The same gold-tier, $42.00 case from this lesson's own header, traced
through both units: Lesson 94 left `calculate_order_total(subtotal,
item_count, loyalty_tier)` as one function computing all four business
rules inline, returning `45.89` for that case when called correctly.
The first unit split those four rules into `apply_bulk_discount`,
`apply_gold_tier_discount`, `calculate_shipping_fee`, and
`calculate_bulk_handling_fee`, each independently callable, with
`calculate_order_total` reduced to five lines composing their results —
still `45.89` for the identical case. The second unit demonstrated,
with a real run, that the decomposed function's positional signature
could still silently return a wrong number — `11.34` instead of
`45.89` — if `subtotal` and `item_count` were ever passed in the wrong
order, then closed that exact gap by making every parameter
keyword-only, on both `calculate_order_total` and the
`format_receipt_line` that calls it. Same four business rules, same
correct `45.89` for every properly-named call, and an entire category
of silent mistake removed from what the function's own signature will
even allow.

## What Breaks Without This

Revert `calculate_order_total`'s signature to positional, leaving every
other change from this lesson — the four extracted functions — in
place:

```python
def calculate_order_total(subtotal, item_count, loyalty_tier):
    if subtotal <= 0:
        return Decimal("0")
    discounted_subtotal = apply_bulk_discount(subtotal)
    discounted_subtotal = apply_gold_tier_discount(discounted_subtotal, loyalty_tier)
    shipping_fee = calculate_shipping_fee(subtotal)
    bulk_handling_fee = calculate_bulk_handling_fee(item_count)
    return discounted_subtotal + shipping_fee + bulk_handling_fee


print(calculate_order_total(3, Decimal("42.00"), "gold"))
```

Running this reproduces the exact silent bug from this lesson's own
second unit:

```text
11.34
```

No traceback, no warning — a real dollar amount, wrong by more than
$34 against the correct `45.89`, computed and ready to be charged to a
customer, with nothing about the call site itself signaling anything
went wrong. This is the whole reason this lesson's second unit exists:
extracting `calculate_order_total`'s logic into four clean, well-named
functions (this lesson's own first unit) made every individual rule
easy to verify in isolation — and did nothing at all to protect the one
place all four rules' inputs actually arrive, the function's own
outermost signature. Restore the keyword-only `*` before moving on.

## Exercises

1. `apply_bulk_discount` and `calculate_shipping_fee` both take a
   single `subtotal` parameter, positionally. Should they also be made
   keyword-only, the way `calculate_order_total` was? Write down a real
   argument for and against, specifically for a single-parameter
   function, not a three-parameter one like `calculate_order_total`.
2. Add a fifth case to the `cases` list in "Run It" using explicit
   keyword arguments at the call site itself, in a different order than
   `subtotal, item_count, loyalty_tier` — e.g.
   `calculate_order_total(loyalty_tier="standard", item_count=2,
   subtotal=Decimal("60.00"))`. Predict the result by hand first, then
   run it and check.
3. Write a fifth extracted function, `validate_subtotal(subtotal)`,
   that raises a `ValueError` if `subtotal` is negative, and call it
   from inside `calculate_order_total` before any of the other four
   calls. Decide, and write down your reasoning, whether this new
   function should have its own isolated lab under the Concept
   Isolation Rule this curriculum has followed in every lesson so far,
   or whether it's simple enough to not need one — there's a real
   answer, not just an opinion, based on what that rule actually
   requires.

## Definition of Done

- [ ] You can name, from memory, all four functions this lesson
      extracted from `calculate_order_total`, and what single rule each
      one is responsible for.
- [ ] You can explain, using this lesson's own real `11.34` result, why
      a positional-argument mistake between `subtotal` and `item_count`
      doesn't raise an error on its own.
- [ ] You can state what a bare `*` does in a Python function signature,
      without looking it up.
- [ ] You've completed all three exercises.
- [ ] `pricing.py` matches this lesson's own final "Updated Project"
      state, and running it reproduces this lesson's own final "Run It"
      output exactly.
- [ ] Commit the file with a message explaining why the change was
      made — e.g. `git commit -m "Extract calculate_order_total's four
      rules into named functions; make its parameters keyword-only to
      prevent a silent subtotal/item_count swap"` — not
      `git commit -m "refactor and cleanup"`, which tells a future
      reader nothing about which bug this change actually closes.

Lesson 96, State Management, is next.
