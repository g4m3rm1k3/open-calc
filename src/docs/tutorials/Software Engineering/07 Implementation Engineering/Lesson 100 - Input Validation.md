# Lesson 100: Input Validation

**What you will build.** Continuing `pricing.py` from Lesson 99's final
state: a `validate_order_lines` function that checks every individual
line amount in an order — not just the list as a whole — naming the
exact position and value of the first bad one it finds, and a single
`item_count` validation added at `calculate_order_total`'s own boundary,
deliberately not repeated inside `calculate_bulk_handling_fee`.
Transferable problem: validating that a collection "looks like a list
of numbers" is a different, weaker check than validating that every
element in it actually is one — and once a value has been validated at
the one place it enters a system, re-checking it again at every
function it subsequently passes through is wasted work, not extra
safety.

**What you need to know first.** Lessons 93 through 99 — this lesson
continues the identical `pricing.py` file. Domain 3's Lessons 28
through 31 (Preconditions, Postconditions, Invariants, Design by
Contract) — this lesson's second unit makes explicit something that
domain already implied: once a precondition has been checked and
holds, code downstream of that check is entitled to assume it still
holds, without checking it again itself.

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

Still the **Implementation** stage. Carrying the same order forward,
this time as the three line amounts from Lesson 96 — $20.00, $15.50,
$6.50 — with one of them deliberately corrupted (a `None`, then a
negative amount) to see exactly what this lesson's own validation
catches, and exactly what it says when it does.

**Terms used in this lesson.**

- **Input validation** — checking that data received from outside a
  function's own trusted boundary actually satisfies the assumptions
  the code downstream of that check is about to rely on; it exists
  because a function's own logic is only correct *given* valid input —
  nothing about correct arithmetic protects against being handed a
  `None` where a number was expected.
- **Element-wise validation** — checking every individual item inside a
  collection, not just the collection's own type or length; it exists
  because a `list` can be a perfectly well-formed `list` while still
  containing exactly the wrong kind of value at exactly one position
  inside it.
- **Validate at the boundary, trust internally** — the principle that
  input should be validated once, at the specific point it crosses from
  untrusted to trusted (a function's outermost entry point, a system's
  own external boundary), and that code downstream of that point should
  rely on the validation already having happened rather than repeating
  it; it exists because repeated validation of the same already-trusted
  value adds real, measurable cost with no corresponding gain in
  correctness.

**Objects and methods used.**

- **`isinstance`** (a Python built-in function) —
  *What it is:* a function that checks whether an object is an instance
  of a given type (or one of several types).
  *Implementation:* called as `isinstance(object, type)`, returning
  `True` or `False`; unlike comparing `type(object) == type`, it also
  returns `True` for instances of a subclass of the given type, though
  this lesson uses it only against `Decimal` directly.
  *Its use:* `validate_order_lines` uses `isinstance(line_amount,
  Decimal)` specifically to catch a line amount that isn't a `Decimal`
  at all — a plain `float`, a `str`, or `None` — before it ever reaches
  an arithmetic operation that would either silently produce a subtly
  wrong result (a `float` mixed into otherwise-exact `Decimal`
  arithmetic) or crash with a confusing, low-level error far from where
  the bad value actually entered the system.
- **`enumerate`** (a Python built-in function) —
  *What it is:* a function that wraps an iterable, producing pairs of
  `(index, item)` instead of the bare items alone.
  *Implementation:* called as `enumerate(iterable)`, returning an
  iterator; each step of a `for` loop over it yields the current
  position (starting at `0`) alongside the current element.
  *Its use:* `validate_order_lines` uses `enumerate(order_lines)`
  specifically so a validation failure can name exactly which position
  in the list was invalid, not just that *some* element, somewhere, was.

---

## Concept Unit: Validating Every Element, Not Just the Collection

### The Problem

`calculate_subtotal` currently trusts that every element of
`order_lines` is a valid `Decimal` amount, with nothing checking that
assumption. A single bad element anywhere in the list — a `None` from a
field that failed to populate, a negative amount from an upstream
refund calculation gone wrong — doesn't fail cleanly. A `None` reaches
`subtotal = subtotal + line_amount` and raises a `TypeError` from deep
inside Python's own `Decimal` arithmetic, naming neither which order
nor which line caused it. A negative amount doesn't raise anything at
all — it silently reduces the subtotal below what the order's real
items actually cost, exactly the kind of quiet wrong number this domain
has been catching since Lesson 93.

### Isolating the Concept: Validate Every Element, Name the Bad One

Isolate this on a small, unrelated example — validating a list of ages:

```python
def validate_ages(ages):
    for index, age in enumerate(ages):
        if age < 0:
            raise ValueError(f"ages[{index}] cannot be negative: {age}")
    return ages
```

Run it against a valid list, then a list with one bad element:

```python
print(validate_ages([25, 30, 40]))
try:
    validate_ages([25, -3, 40])
except ValueError as e:
    print(f"ValueError: {e}")
```

Running this produces:

```text
[25, 30, 40]
ValueError: ages[1] cannot be negative: -3
```

The valid list passes through unchanged. The invalid list raises
immediately, naming both the exact position (`ages[1]`) and the exact
bad value (`-3`) — a caller reading this message knows precisely what
to fix, without having to search the whole list by hand to find the one
element that failed. This is **element-wise validation**: checking
every individual member of a collection against a rule, rather than
only checking a property of the collection as a whole (its length, its
type).

This throwaway example is discarded now — `validate_ages` exists only
to demonstrate element-wise validation and will not appear in the
pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`, exactly as Lesson 99 left it. **Files
affected:** `pricing.py`, modified. **Change type:** add a new
function, `validate_order_lines`, and call it from the top of
`calculate_subtotal`. **Location:** the new function added directly
above `calculate_subtotal`; a single new line added as
`calculate_subtotal`'s own first statement. **Dependencies:** none.

### The New Code

```python
def validate_order_lines(order_lines):
    for index, line_amount in enumerate(order_lines):
        if not isinstance(line_amount, Decimal):
            raise ValueError(f"order_lines[{index}] must be a Decimal, got {line_amount!r}")
        if line_amount < 0:
            raise ValueError(f"order_lines[{index}] cannot be negative: {line_amount}")
    return order_lines
```

And the one new line inside `calculate_subtotal`:

```python
    validate_order_lines(order_lines)
```

### The Updated Project

`pricing.py`'s relevant functions, in full, after this unit's change
(the complete file appears in this lesson's own final "Updated
Project," after both units):

```python
def validate_order_lines(order_lines):                                                   # ← new
    for index, line_amount in enumerate(order_lines):                                      # ← new
        if not isinstance(line_amount, Decimal):                                              # ← new
            raise ValueError(f"order_lines[{index}] must be a Decimal, got {line_amount!r}")     # ← new
        if line_amount < 0:                                                                       # ← new
            raise ValueError(f"order_lines[{index}] cannot be negative: {line_amount}")             # ← new
    return order_lines                                                                                # ← new


def calculate_subtotal(order_lines):
    validate_order_lines(order_lines)                                                                  # ← new
    subtotal = Decimal("0")
    for line_amount in order_lines:
        subtotal = subtotal + line_amount
    return subtotal
```

`calculate_subtotal` now refuses a malformed `order_lines` before its
own accumulator loop ever runs, with a message that names exactly which
position and which value caused the rejection — instead of either a
confusing low-level crash or a silently wrong total.

### Mechanical Walkthrough

- **`def validate_order_lines(order_lines):`** — a new function, taking
  the same list `calculate_subtotal` already receives.
- **`for index, line_amount in enumerate(order_lines):`** — a `for`
  loop over `enumerate(order_lines)`; each pass binds two names at
  once, `index` (starting at `0`) and `line_amount` (the element at
  that position), instead of binding only the element the way this
  domain's earlier loops (Lesson 96's own `calculate_subtotal`) have
  done.
- **`if not isinstance(line_amount, Decimal):`** — a type check; `not`
  negates `isinstance`'s own `True`/`False` result, so this branch
  triggers exactly when `line_amount` is *not* a `Decimal`.
- **`raise ValueError(f"order_lines[{index}] must be a Decimal, got
  {line_amount!r}")`** — raises immediately, naming the exact index and
  the exact bad value's own `repr()` (via `!r`, the same conversion
  Lesson 97 used for the same reason: making an easily-invisible value
  like an empty string or `None` clearly visible in the message).
- **`if line_amount < 0:`** — reached only for elements that already
  passed the type check above; a second, independent rule about the
  same element.
- **`raise ValueError(f"order_lines[{index}] cannot be negative:
  {line_amount}")`** — a second, differently-worded message for a
  different failure reason, at the identical position-naming
  discipline as the first.
- **`return order_lines`** — returns the same list unchanged; this
  function's entire purpose is to raise if something's wrong, not to
  transform anything.
- **`validate_order_lines(order_lines)`** inside `calculate_subtotal` —
  a call whose return value is discarded; exactly like Lesson 99's own
  `record_attempt` and `record_success`, this line's entire purpose is
  what happens if it *doesn't* return normally, not the value it hands
  back.

### CS Lens

Checking every element of a collection against a rule, rather than
trusting the collection's own type to guarantee its contents are valid,
is the identical distinction between Python's own **duck typing** ("if
it has the methods I need, I'll use it") and genuine, verified
correctness: a `list` being a `list` says nothing about whether every
element inside it is the specific kind of value a function actually
needs, the same way an object merely *having* a `.charge()` method
(Domain 5's own polymorphic payment methods) says nothing about whether
calling it will actually succeed.

```
Also recognized in: a CSV parser validating every row's own column
count and types individually, not just confirming the file opened
successfully, a form validator checking every individual field (a
malformed email in field three doesn't excuse a missing required field
in field seven), and a compiler's own type checker verifying every
individual expression in a function body, not just that the function
as a whole has a plausible-looking signature
```

### SE Lens

The alternative not chosen is checking only that `order_lines` is a
`list` (or skipping validation of its contents entirely, as this file
did through Lesson 99), on the argument that this is an internal
project and every caller can be trusted to pass well-formed data. The
real cost that argument ignores is exactly what this lesson's own
opening scenario described: a `None` from a genuinely upstream data
problem — a field that failed to populate somewhere else in the
service — doesn't announce itself as "upstream data problem" when it
reaches `subtotal + None`; it announces itself as an opaque `TypeError`
inside `Decimal` arithmetic, in a file that has nothing to do with
wherever the `None` actually came from. The cost this unit's validation
accepts: every call to `calculate_subtotal` now pays the price of a
full pass over `order_lines` before its own accumulator loop even
starts — a real, measurable cost for a long list, purchased in exchange
for failing at the actual point of entry, with a specific, actionable
message, instead of failing later, deeper, and less informatively.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing.py
```

### Run It

`calculate_subtotal`, called against a list containing a `None`, then
against a list containing a negative amount:

```python
try:
    calculate_subtotal([Decimal("20.00"), None, Decimal("6.50")])
except ValueError as e:
    print(f"ValueError: {e}")
try:
    calculate_subtotal([Decimal("20.00"), Decimal("-5.00"), Decimal("6.50")])
except ValueError as e:
    print(f"ValueError: {e}")
```

Running this produces:

```text
ValueError: order_lines[1] must be a Decimal, got None
ValueError: order_lines[1] cannot be negative: -5.00
```

Both failures name the exact position, `order_lines[1]`, and the exact
value that triggered them — a `None`, then a `Decimal("-5.00")` —
instead of either an opaque `TypeError` or a silently wrong subtotal.

### Connecting Back

`calculate_subtotal` now validates every element of `order_lines` at
the exact point it receives them — but `calculate_order_total` still
has no check on `item_count` at all, and the next unit asks not just
whether to add one, but specifically where.

---

## Concept Unit: Validate at the Boundary, Trust Internally

### The Problem

`item_count` flows into `calculate_order_total`, then into
`calculate_bulk_handling_fee`, with no validation anywhere along that
path — a negative `item_count` (nonsensical: an order can't contain
negative-three items) silently reaches `item_count >
BULK_HANDLING_ITEM_THRESHOLD` and simply evaluates to `False`, adding
no handling fee, with no indication anything was wrong. Adding a check
is the easy part; the real question is where it belongs. A check inside
`calculate_bulk_handling_fee` would catch it, but that function might
be called from more than one place in the future, and repeating the
identical check at every one of those call sites is real, avoidable
work — this unit's own isolated lab, below, measures exactly how much.

### Isolating the Concept: Validate Once, Not at Every Layer

Isolate this on a small, unrelated example — a two-step pipeline that
doubles a number, with a validation check repeated at every step:

```python
validation_count_revalidating = 0


def step_two_revalidating(item):
    global validation_count_revalidating
    validation_count_revalidating += 1
    if item < 0:
        raise ValueError(f"item cannot be negative: {item}")
    return item * 2


def step_one_revalidating(item):
    global validation_count_revalidating
    validation_count_revalidating += 1
    if item < 0:
        raise ValueError(f"item cannot be negative: {item}")
    return step_two_revalidating(item)


def process_batch_revalidating(items):
    return [step_one_revalidating(item) for item in items]
```

Run it against three items, counting how many times the check itself
actually runs:

```python
result = process_batch_revalidating([1, 2, 3])
print(f"result={result} validation_count={validation_count_revalidating} for 3 items")
```

Running this produces:

```text
result=[2, 4, 6] validation_count=6 for 3 items
```

Six checks for three items — every item is checked twice, once by each
function it passes through, even though nothing about `item`'s own
value changes between `step_one_revalidating` and
`step_two_revalidating`. Here's the same pipeline, validated once, at
its own single entry point:

```python
validation_count_boundary = 0


def step_two_trusting(item):
    return item * 2


def step_one_trusting(item):
    return step_two_trusting(item)


def process_batch_boundary(items):
    global validation_count_boundary
    for index, item in enumerate(items):
        validation_count_boundary += 1
        if item < 0:
            raise ValueError(f"items[{index}] cannot be negative: {item}")
    return [step_one_trusting(item) for item in items]
```

Running the same three items against this version produces:

```text
result=[2, 4, 6] validation_count=3 for 3 items
```

Half as many checks — three, exactly one per item — for the identical,
correct result. `step_one_trusting` and `step_two_trusting` perform no
validation of their own at all; they trust that `process_batch_
boundary`, the one place `items` enters this pipeline from the outside,
already confirmed every element is valid before either of them ever
sees it. This is **validating at the boundary**: checking a value
exactly once, at the specific point it crosses from untrusted to
trusted, and relying on that single check everywhere downstream instead
of repeating it.

This throwaway example is discarded now — every function in both
versions of this pipeline exists only to demonstrate the difference and
will not appear in the pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`. **Files affected:** `pricing.py`,
modified. **Change type:** add a single validation check to
`calculate_order_total`'s own body; explicitly add no corresponding
check to `calculate_bulk_handling_fee`. **Location:**
`calculate_order_total`'s body, alongside its existing `loyalty_tier`
check from Lesson 97. **Dependencies:** none.

### The New Code

```python
    if item_count < 0:
        raise ValueError(f"item_count cannot be negative: {item_count}")
```

### The Updated Project

`pricing.py`, in full, after both of this lesson's units — the final
state this lesson leaves the file in:

```python
from decimal import Decimal

BULK_DISCOUNT_THRESHOLD = Decimal("100.00")
BULK_DISCOUNT_RATE = Decimal("0.9")
GOLD_TIER_DISCOUNT_RATE = Decimal("0.95")
FREE_SHIPPING_THRESHOLD = Decimal("50.00")
STANDARD_SHIPPING_FEE = Decimal("5.99")
BULK_HANDLING_ITEM_THRESHOLD = 10
BULK_HANDLING_FEE = Decimal("2.50")
VALID_LOYALTY_TIERS = frozenset({"standard", "gold"})


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
    # item_count is already validated by calculate_order_total, its only
    # caller, before this function is ever reached — no re-check here.
    if item_count > BULK_HANDLING_ITEM_THRESHOLD:
        return BULK_HANDLING_FEE
    return Decimal("0")


def validate_order_lines(order_lines):
    for index, line_amount in enumerate(order_lines):
        if not isinstance(line_amount, Decimal):
            raise ValueError(f"order_lines[{index}] must be a Decimal, got {line_amount!r}")
        if line_amount < 0:
            raise ValueError(f"order_lines[{index}] cannot be negative: {line_amount}")
    return order_lines


def calculate_subtotal(order_lines):
    validate_order_lines(order_lines)
    subtotal = Decimal("0")
    for line_amount in order_lines:
        subtotal = subtotal + line_amount
    return subtotal


def calculate_order_total(*, subtotal, item_count, loyalty_tier):
    if loyalty_tier not in VALID_LOYALTY_TIERS:
        raise ValueError(f"Unknown loyalty tier: {loyalty_tier!r}")
    if item_count < 0:                                                    # ← new
        raise ValueError(f"item_count cannot be negative: {item_count}")   # ← new
    if subtotal <= 0:
        return Decimal("0")
    discounted_subtotal = apply_bulk_discount(subtotal)
    discounted_subtotal = apply_gold_tier_discount(discounted_subtotal, loyalty_tier)
    shipping_fee = calculate_shipping_fee(subtotal)
    bulk_handling_fee = calculate_bulk_handling_fee(item_count)
    return discounted_subtotal + shipping_fee + bulk_handling_fee


def format_receipt_line(*, subtotal, item_count, loyalty_tier):
    result = calculate_order_total(
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
    return f"Total: ${result}"


def build_order_summary(order_lines, item_count, loyalty_tier, notes=None):
    if notes is None:
        notes = []
    subtotal = calculate_subtotal(order_lines)
    total = calculate_order_total(
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
    notes.append(f"subtotal={subtotal} total={total}")
    return total, notes


def process_orders(orders):
    results = []
    errors = []
    for order_id, subtotal, item_count, loyalty_tier in orders:
        try:
            total = calculate_order_total(
                subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
            )
            results.append((order_id, total))
        except ValueError as e:
            errors.append((order_id, str(e)))
    return results, errors


def record_attempt(audit_log):
    audit_log["orders_attempted"] += 1


def record_success(audit_log):
    audit_log["orders_succeeded"] += 1


def process_order_and_log(order_id, subtotal, item_count, loyalty_tier, audit_log):
    record_attempt(audit_log)
    total = calculate_order_total(
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
    record_success(audit_log)
    return total


def preview_order_total(*, subtotal, item_count, loyalty_tier):
    return calculate_order_total(
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
```

`calculate_bulk_handling_fee` gains no new check at all — its own
comment now states explicitly why, rather than leaving a reader to
wonder whether the omission was an oversight or a deliberate choice.

### Mechanical Walkthrough

- **`if item_count < 0:`** — a comparison, placed inside
  `calculate_order_total`, alongside its existing `loyalty_tier` check
  from Lesson 97 — both checks now guard the same single entry point,
  together.
- **`raise ValueError(f"item_count cannot be negative: {item_count}")`**
  — raises immediately, before `subtotal <= 0`'s own existing guard
  clause even runs, so an invalid `item_count` is rejected before any
  other logic in the function executes.
- **The new comment inside `calculate_bulk_handling_fee`** — not
  executable code; a deliberate, explicit statement of this unit's own
  design decision, written at the exact place a future reader might
  otherwise wonder why no check exists there.

### CS Lens

Checking a value once, at the boundary where it enters a trusted
region, and treating everything inside that region as safe to use
without re-checking, is the same shape as a **sanitized input
boundary** in any system that separates trusted from untrusted data — a
web application validating and escaping a user's input once, at the
point it's received, rather than re-validating it at every single
function that later touches it. It's also a direct, executable
consequence of Domain 3's own preconditions: once
`calculate_order_total`'s precondition on `item_count` has been
checked and holds, every function it calls afterward is entitled to
rely on that precondition already having been established, exactly the
way a mathematical proof doesn't re-derive an already-established lemma
every time it's used again.

```
Also recognized in: a REST API validating a request body once, at its
own outermost handler, rather than in every internal service function
that later touches the same parsed data, a compiler's own type checker
verifying a value's type once, so every later stage of compilation can
trust that type without re-inspecting the value at runtime, and a
database transaction's own isolation level, guaranteeing a value read
once inside a transaction won't change underneath the code that keeps
using it
```

### SE Lens

The alternative not chosen — repeating the same `item_count`
validation inside `calculate_bulk_handling_fee` too, "just in case" —
is this unit's own isolated lab made concrete: this lesson's own
`step_one_revalidating`/`step_two_revalidating` pair proved, with a
real, counted number, that redundant validation isn't free — it's
double the checks for the identical guarantee. The real risk this
unit's single-boundary approach accepts in exchange: `calculate_bulk_
handling_fee` is only actually safe to call with an already-validated
`item_count` *because* `calculate_order_total` is its only caller in
this file today — if a future lesson ever calls
`calculate_bulk_handling_fee` directly, from somewhere that hasn't
already validated `item_count`, this unit's own comment is the one
thing standing between that new caller and the exact silent bug this
lesson's own header describes. This is a real, honest tradeoff, not a
free win: validating once is cheaper and clearer as long as every path
into the trusted region actually goes through the one checked boundary
— a guarantee that has to be maintained deliberately as a codebase
grows, not assumed to hold forever just because it holds today.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing.py
```

### Run It

`calculate_order_total`, called with a negative `item_count`:

```python
try:
    calculate_order_total(subtotal=Decimal("42.00"), item_count=-1, loyalty_tier="gold")
except ValueError as e:
    print(f"ValueError: {e}")
```

Running this, alongside this lesson's own first unit's two failures and
a final confirmation that valid data still works, produces:

```text
A: subtotal=142.50 items=3 tier=gold -> total=121.83750
B: subtotal=42.00 items=1 tier=gold -> total=45.8900
C: subtotal=75.00 items=1 tier=gold -> total=71.2500
D: subtotal=250.00 items=15 tier=standard -> total=227.500
ValueError: order_lines[1] must be a Decimal, got None
ValueError: order_lines[1] cannot be negative: -5.00
ValueError: item_count cannot be negative: -1
42.00
```

The first four lines match every prior lesson's own results exactly —
validation changed nothing about a valid order's total. The three
`ValueError` lines each name a different, specific failure at a
different, specific boundary, and the final `42.00` confirms a
genuinely valid `order_lines` list still computes correctly after all
of this lesson's own new checks were added.

### Connecting Back

`pricing.py` now validates both of its two real inputs — an order's
line amounts and its item count — each exactly once, at the specific
point each one enters a function that's about to trust it, with every
downstream function relying on that single check instead of repeating
it — the same four business rules this domain has carried since Lesson
93, now protected at every real entry point without paying for the same
protection twice.

## Connect the Pieces

This lesson's own header case — the same three line amounts from
Lesson 96, $20.00, $15.50, $6.50, deliberately corrupted two different
ways — traced through both units: the first unit's `validate_order_
lines` rejected a `None` in place of the second line amount with
`order_lines[1] must be a Decimal, got None`, and rejected a negative
`Decimal("-5.00")` in the same position with `order_lines[1] cannot be
negative: -5.00` — two different rules, both naming the exact position
and value that failed, both catching the problem at `calculate_
subtotal`'s own entry point rather than letting a bad value reach its
accumulator loop. The second unit added a single `item_count`
validation to `calculate_order_total`'s own boundary, and — using a
separate, real, counted isolated lab — proved that adding the identical
check again inside `calculate_bulk_handling_fee` would have doubled the
validation work for zero additional safety, as long as
`calculate_order_total` remains its only caller. Same four business
rules, same correct totals for every valid input, and every invalid
input this lesson considered now rejected at the one place it actually
enters the system, named specifically enough that whoever sees the
error knows exactly what to fix.

## What Breaks Without This

Remove `validate_order_lines`'s call from `calculate_subtotal`, leaving
the function itself still defined but never invoked, and pass it the
same corrupted list from this lesson's own "Run It" step:

```python
def calculate_subtotal_broken(order_lines):
    subtotal = Decimal("0")
    for line_amount in order_lines:
        subtotal = subtotal + line_amount
    return subtotal


try:
    calculate_subtotal_broken([Decimal("20.00"), None, Decimal("6.50")])
except TypeError as e:
    print(f"TypeError: {e}")
print(calculate_subtotal_broken([Decimal("20.00"), Decimal("-5.00"), Decimal("6.50")]))
```

Running this produces:

```text
TypeError: unsupported operand type(s) for +: 'decimal.Decimal' and 'NoneType'
21.00
```

The `None` case still fails — but with a low-level `TypeError` naming
`decimal.Decimal` and `NoneType`, nothing about which order, which
line, or which position caused it; a real production incident debugged
from this message alone would need to work backward from a stack trace
to even find `order_lines`, let alone which element inside it was bad.
The negative case is worse: it doesn't fail at all. `21.00` is a real,
wrong subtotal — the true sum of three valid items would have been
$42.00; a stray `-5.00` silently reduced it by ten dollars with no
error, no warning, and no way to distinguish this order's own receipt
from one that was correctly charged less because of an actual,
legitimate discount. Restore the call to `validate_order_lines` before
moving on.

## Exercises

1. `validate_order_lines` currently stops at the *first* invalid
   element it finds. Rewrite it to collect every invalid element's own
   error message into a list and raise one `ValueError` naming all of
   them, instead of stopping at the first — then decide, and write
   down your reasoning, which behavior you'd actually prefer for a real
   order-processing system, and why.
2. This lesson's own second unit chose not to add a validation check
   inside `calculate_bulk_handling_fee`. Find one other function in
   `pricing.py` that similarly trusts an already-validated value with
   no check of its own, name which upstream function is responsible
   for that validation, and write the comment this lesson's own style
   would add to make that trust explicit, the way `calculate_bulk_
   handling_fee`'s own comment does.
3. `calculate_order_total`'s own boundary now validates `loyalty_tier`
   and `item_count`, but not `subtotal` itself — a `subtotal` that's
   `None`, or a plain `float` instead of a `Decimal`, would still reach
   `subtotal <= 0` and fail with a low-level error, not a clear one.
   Add a validation check for `subtotal`'s own type, following this
   lesson's own established pattern, and confirm with a real run that
   every existing case in `pricing.py` still produces its correct
   total afterward.

## Definition of Done

- [ ] You can explain, using this lesson's own real error messages, why
      `order_lines[1] must be a Decimal, got None` is more useful to a
      developer than the raw `TypeError` this lesson's own "What
      Breaks Without This" section produced instead.
- [ ] You can state, in your own words, why `calculate_bulk_handling_
      fee` doesn't validate `item_count` itself, and what has to remain
      true elsewhere in the file for that decision to stay safe.
- [ ] You can name, from memory, the real, measured cost this lesson's
      own second isolated lab found for validating at every layer
      instead of once at the boundary.
- [ ] You've completed all three exercises.
- [ ] `pricing.py` matches this lesson's own final "Updated Project"
      state, and running it reproduces this lesson's own final "Run It"
      output exactly.
- [ ] Commit the file with a message explaining why the change was
      made — e.g. `git commit -m "Validate order_lines element-wise and
      item_count once at calculate_order_total's boundary; catch bad
      data at the point it enters instead of where it eventually
      breaks"` — not `git commit -m "add validation"`, which names
      neither what's being validated nor where.

Lesson 101, Configuration, is next.
