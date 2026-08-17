# Lesson 98: Failure Semantics

**What you will build.** Continuing `pricing.py` from Lesson 97's final
state: a `process_order_and_log` function whose first draft corrupts
its own audit counters the instant an order fails, fixed by reordering
when a side effect is allowed to run relative to the operation that
might fail — and a real demonstration that retrying
`calculate_order_total`'s own `ValueError` is never useful, contrasted
against a genuinely transient failure where retrying is exactly the
right response. Transferable problem: catching an exception (Lesson
97's own subject) answers "what do we do when this fails?" — it doesn't
answer the two harder questions this lesson exists to teach: what state
does a failure leave behind, and is this specific failure even the kind
that trying again could ever fix?

**What you need to know first.** Lessons 93 through 97 — this lesson
continues the identical `pricing.py` file, and depends specifically on
Lesson 97's `ValueError`-raising validation and its `except ValueError:`
handling pattern.

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

Still the **Implementation** stage. Carrying the same `"glod"` typo'd
order from Lesson 97 forward: this lesson asks what else, besides the
order's own total, that one bad order is allowed to affect when it
fails — and whether trying it again would ever help.

**Terms used in this lesson.**

- **Failure semantics** — the guarantees a piece of code makes about
  what state the rest of the system is left in when an operation fails,
  and about which kinds of failure are ever worth retrying; it exists
  as its own concern, separate from error handling, because correctly
  catching an exception says nothing on its own about whether anything
  else was left half-done first.
- **Partial failure** — a failure that occurs after some, but not all,
  of an operation's effects have already happened; it's dangerous
  specifically when those already-happened effects are visible to the
  rest of the system and nothing rolls them back.
- **Deterministic failure** — a failure that will happen again, every
  time, given the identical input, because the failure is caused by
  something about the input itself, not by a passing external
  condition; it exists as a category because recognizing one tells you
  immediately that retrying it, unchanged, is a waste of effort.
- **Transient failure** — a failure caused by a temporary external
  condition (a dropped network connection, a service that's briefly
  overloaded) that may no longer hold true moments later; it exists as
  a category because, unlike a deterministic failure, retrying it
  really can succeed, precisely because the thing that caused it isn't
  guaranteed to still be true on the next attempt.

**Objects and methods used.**

- **`Exception`** (Python's base exception class) —
  *What it is:* the root class nearly every exception in Python
  ultimately inherits from, including `ValueError` and every built-in
  exception this domain has used so far.
  *Implementation:* user-defined exception types are created by
  subclassing `Exception` (or one of its own subclasses) with a `class`
  statement; an empty body (`pass`) is enough to create a distinct,
  catchable exception type with no new behavior beyond its own name.
  *Its use:* this lesson defines `TransientServiceError` as a direct
  subclass of `Exception`, giving a simulated transient failure its own
  distinct, specific type — separate from `ValueError` — so that a
  retry loop can catch exactly the failures worth retrying and nothing
  else.
- **`dict`** (Python's built-in mapping type) —
  *What it is:* an unordered (as of insertion order being preserved
  since Python 3.7, effectively ordered) collection of key-value pairs.
  *Implementation:* created with `{}` or `dict(...)`; supports item
  access and assignment with `d[key]` and `d[key] = value`, both
  running in constant time on average.
  *Its use:* this lesson's `audit_log` is a `dict` tracking two running
  counts, `"orders_attempted"` and `"orders_succeeded"`, mutated in
  place by every call that processes an order — exactly the kind of
  shared, mutable state this lesson's first unit shows can be corrupted
  by a careless ordering decision around a failure.

---

## Concept Unit: Ordering Side Effects Around a Possible Failure

### The Problem

The order-processing service wants to track a simple audit count: how
many orders were attempted, and how many actually succeeded, across a
whole batch. A natural first attempt writes a function that increments
both counts up front, then computes the order's total — on the
reasoning that "we're about to process this order, so count it as
processed." When `calculate_order_total` raises, because the order's
own loyalty tier is invalid, that reasoning turns out to have already
done real, visible damage: the audit log now claims a failed order
succeeded, and nothing about the function that failed knows to undo it.

### Isolating the Concept: Side Effects Ordered Around a Failure

Isolate this on a small, unrelated example — doubling a number, while
tracking how many items were successfully processed:

```python
def record_and_process_broken(item, counter):
    counter["processed"] += 1
    if item < 0:
        raise ValueError(f"invalid item: {item}")
    return item * 2
```

Process one valid item, then one invalid item, sharing the same
counter:

```python
counter = {"processed": 0}
try:
    record_and_process_broken(5, counter)
    record_and_process_broken(-1, counter)
except ValueError as e:
    print(f"ValueError: {e}")
print(f"counter after 1 success + 1 failure: {counter}")
```

Running this produces:

```text
ValueError: invalid item: -1
counter after 1 success + 1 failure: {'processed': 2}
```

`counter["processed"]` reads `2` after exactly one success and one
failure — the failed call still incremented it, because
`counter["processed"] += 1` runs *before* the validation check that
raises. Here's the identical function with its two lines reordered:

```python
def record_and_process(item, counter):
    if item < 0:
        raise ValueError(f"invalid item: {item}")
    result = item * 2
    counter["processed"] += 1
    return result
```

Running the same two calls against this version produces:

```text
ValueError: invalid item: -1
counter after 1 success + 1 failure: {'processed': 1}
```

`counter["processed"]` now correctly reads `1` — only the successful
call incremented it, because the increment moved to *after* the point
where a failure could occur, and Python never reaches a line following
a `raise` that already happened above it. Nothing about `try`/`except`
changed between these two versions; the entire fix was choosing, on
purpose, which side of a possible failure a given side effect is
allowed to run on.

This throwaway example is discarded now — both versions of
`record_and_process` exist only to demonstrate the ordering concept and
will not appear in the pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`, exactly as Lesson 97 left it. **Files
affected:** `pricing.py`, modified — a new function,
`process_order_and_log`, added. **Change type:** add. **Location:**
below `process_orders`. **Dependencies:** `calculate_order_total`,
already defined above it.

Here is the version that carries the exact ordering bug this unit's
isolated lab just demonstrated:

```python
def process_order_and_log_broken(order_id, subtotal, item_count, loyalty_tier, audit_log):
    audit_log["orders_attempted"] += 1
    audit_log["orders_succeeded"] += 1
    total = calculate_order_total(
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
    return total
```

Called for one valid order and one order carrying Lesson 97's own
`"glod"` typo, sharing one `audit_log`:

```python
audit_log = {"orders_attempted": 0, "orders_succeeded": 0}
try:
    process_order_and_log_broken("ORD-1", Decimal("42.00"), 1, "gold", audit_log)
    process_order_and_log_broken("ORD-2", Decimal("42.00"), 1, "glod", audit_log)
except ValueError as e:
    print(f"ValueError: {e}")
print(f"audit_log: {audit_log}")
```

Running this against the broken version produces:

```text
ValueError: Unknown loyalty tier: 'glod'
audit_log: {'orders_attempted': 2, 'orders_succeeded': 2}
```

`orders_succeeded` reads `2`, even though exactly one order, `ORD-1`,
actually succeeded — `ORD-2`'s own failed call still incremented it,
for the identical reason the isolated lab's broken version did.

### The New Code

```python
def process_order_and_log(order_id, subtotal, item_count, loyalty_tier, audit_log):
    audit_log["orders_attempted"] += 1
    total = calculate_order_total(
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
    audit_log["orders_succeeded"] += 1
    return total
```

### The Updated Project

`pricing.py`'s new function, in its corrected form (the complete file
appears in this lesson's own final "Updated Project," after both
units):

```python
def process_order_and_log(order_id, subtotal, item_count, loyalty_tier, audit_log):  # ← new
    audit_log["orders_attempted"] += 1                                                # ← new
    total = calculate_order_total(                                                     # ← new
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
    audit_log["orders_succeeded"] += 1                                                  # ← new
    return total                                                                          # ← new
```

`orders_attempted` still increments before the call that might fail —
that count is honestly meant to track every attempt, successful or
not, so incrementing it early is correct. `orders_succeeded` now
increments only after `calculate_order_total` has already returned
normally, meaning a failed call, by construction, can never reach that
line.

### Mechanical Walkthrough

- **`audit_log["orders_attempted"] += 1`** — runs unconditionally, as
  the function's first line; this is the one increment in this
  function that's supposed to happen regardless of success or failure,
  so placing it first is correct, not a repeat of the earlier bug.
- **`total = calculate_order_total(...)`** — the call that might raise.
  Everything written after this line only runs if this call returns
  normally; if it raises, execution leaves `process_order_and_log`
  immediately, and nothing below this line executes at all.
- **`audit_log["orders_succeeded"] += 1`** — placed after the call
  that might fail, specifically so this exact line is only reachable
  once `calculate_order_total` has already succeeded — the single
  change that fixes the bug, expressed as a matter of line order, not
  new logic.
- **`return total`** — unchanged in shape from every earlier lesson's
  own return statements; reached only on the success path, same as the
  `orders_succeeded` increment directly above it.

### CS Lens

Choosing which side of a possible failure a side effect is allowed to
run on is a hand-written, local version of what a database's own
**transaction** guarantees automatically: either every effect inside a
transaction happens, or none of them do, with no state visible to
anyone else in between. `process_order_and_log`'s own fix doesn't use a
real transaction — Python has no built-in mechanism forcing
`orders_succeeded`'s increment to be atomic with `calculate_order_total`'s
own success — it achieves the identical guarantee for this one, simple
case entirely through statement order, which is exactly why the ordering
itself is the whole lesson.

```
Also recognized in: a bank transfer debiting one account only after
confirming the destination account can accept the credit, a file save
writing to a temporary file and only replacing the original after the
write fully succeeds, and a shipping system marking a package "shipped"
only after a carrier's own pickup confirmation, not at the moment a
shipping label is printed
```

### SE Lens

The alternative not chosen is the broken version's own instinct:
"count the order as being processed as soon as we start working on it,"
which reads naturally and matches how a person might narrate what's
happening in the moment — "we're now processing this order" — without
distinguishing "started" from "succeeded." The real cost that framing
hides: any monitoring or reporting built on top of `orders_succeeded`
would report an inflated, wrong success rate, silently, with no crash
and no error anywhere to notice — the exact same *shape* of danger
Lesson 93's nesting bug and Lesson 96's mutable-default-argument bug
each carried: correct-looking code producing a wrong number nobody is
prompted to double-check. The cost this fix accepts: `orders_attempted`
and `orders_succeeded` are no longer updated in the same, single place
in the function's own text — a reader has to notice that one line sits
before the risky call and the other after, rather than reading them as
one obviously-paired unit, which is a real, if modest, readability cost
purchased in exchange for correctness.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing.py
```

### Run It

The fixed version, run against the identical one-success, one-failure
scenario as the broken version above:

```text
ValueError: Unknown loyalty tier: 'glod'
audit_log: {'orders_attempted': 2, 'orders_succeeded': 1}
```

`orders_attempted` still correctly reads `2` — both orders were
genuinely attempted. `orders_succeeded` now correctly reads `1` —
exactly `ORD-1`, the one order that actually succeeded, matching what
actually happened rather than what the broken version merely hoped
would happen.

### Connecting Back

`process_order_and_log` now leaves an honest, accurate audit trail
behind a failure — but nothing yet asks whether a failed order is even
worth trying again, which is a genuinely different question from
whether its failure was handled cleanly.

---

## Concept Unit: Not Every Failure Is Worth Retrying

### The Problem

A batch job that hits a failed order has an obvious-sounding option:
try that order again. For some kinds of failure, that's exactly the
right move — a network call to a tax-rate service that's briefly
unreachable really might succeed on a second or third attempt, once
whatever caused the first failure has passed. For `calculate_order_total`'s
own `ValueError` on an invalid loyalty tier, retrying accomplishes
nothing at all: the tier is still `"glod"` on the second attempt, and
the third, because nothing about calling the function again changes
what the caller passed to it.

### Isolating the Concept: Deterministic vs. Transient Failure

Isolate this on two small, unrelated functions — one simulating a
flaky external service that fails twice before succeeding, one that
always fails on invalid input, no matter how many times it's called:

```python
class TransientServiceError(Exception):
    pass


def lookup_tax_rate(state):
    state["calls"] += 1
    if state["calls"] < 3:
        raise TransientServiceError(f"tax service unavailable, call {state['calls']}")
    return Decimal("1.07")
```

A small retry helper, catching only the specific exception it's told to
expect:

```python
def retry(fn, arg, max_attempts, expected_exception):
    last_error = None
    for attempt in range(1, max_attempts + 1):
        try:
            return fn(arg), attempt
        except expected_exception as e:
            last_error = e
            continue
    raise last_error
```

Run the retry helper against the flaky service:

```python
call_state = {"calls": 0}
rate, attempts = retry(lookup_tax_rate, call_state, 5, TransientServiceError)
print(f"tax rate={rate} after {attempts} attempts")
```

Running this produces:

```text
tax rate=1.07 after 3 attempts
```

The first two attempts genuinely fail — `state["calls"]` is `1` and
then `2`, both less than `3` — and the third succeeds, because the
condition that caused the failure (`state["calls"] < 3`) is no longer
true by the third call. This is a **transient failure**: whatever
caused it can stop being true, so retrying can genuinely help. Now the
same retry helper, aimed at a deterministic failure instead:

```python
def always_fails(age):
    if age < 0:
        raise ValueError(f"age cannot be negative: {age}")
    return age
```

Run the same retry helper against it:

```python
try:
    retry(always_fails, -5, 5, ValueError)
except ValueError as e:
    print(f"gave up after 5 attempts, still: ValueError: {e}")
```

Running this produces:

```text
gave up after 5 attempts, still: ValueError: age cannot be negative: -5
```

Every one of the five attempts fails identically, because `-5` is still
`-5` on every attempt — nothing about calling `always_fails` again
changes the one fact that caused it to fail the first time. This is a
**deterministic failure**: the cause is a property of the input itself,
not of some external, possibly-temporary condition, so retrying it
unchanged can never succeed.

This throwaway example is discarded now — `TransientServiceError`,
`lookup_tax_rate`, `retry`, and `always_fails` exist only to demonstrate
the distinction and will not appear in the pricing project in this
form.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`. **Files affected:** `pricing.py`,
modified — no new function added; this unit demonstrates, directly
against `calculate_order_total` itself, that retrying its own
`ValueError` is futile, and states that conclusion as the reason this
file adds no retry logic around it at all. **Change type:**
demonstration only — no code added to the file. **Location:** n/a.
**Dependencies:** none.

### The New Code

The demonstration against this project's own real function, not an
isolated stand-in:

```python
last_error = None
for attempt in range(1, 4):
    try:
        calculate_order_total(subtotal=Decimal("42.00"), item_count=1, loyalty_tier="glod")
        break
    except ValueError as e:
        last_error = e
        print(f"attempt {attempt}: ValueError: {e}")
print(f"gave up after 3 identical attempts, still failing: {last_error}")
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
    if item_count > BULK_HANDLING_ITEM_THRESHOLD:
        return BULK_HANDLING_FEE
    return Decimal("0")


def calculate_subtotal(order_lines):
    subtotal = Decimal("0")
    for line_amount in order_lines:
        subtotal = subtotal + line_amount
    return subtotal


def calculate_order_total(*, subtotal, item_count, loyalty_tier):
    if loyalty_tier not in VALID_LOYALTY_TIERS:
        raise ValueError(f"Unknown loyalty tier: {loyalty_tier!r}")
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


def process_order_and_log(order_id, subtotal, item_count, loyalty_tier, audit_log):  # ← new
    audit_log["orders_attempted"] += 1                                                # ← new
    total = calculate_order_total(                                                     # ← new
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
    audit_log["orders_succeeded"] += 1                                                  # ← new
    return total                                                                          # ← new
```

`process_order_and_log` joins this file's other functions unchanged
from Lesson 97; no retry wrapper was added around
`calculate_order_total` anywhere in this file, and this lesson's own
second unit is the reason why, stated as a demonstrated fact rather than
an assumed one.

### Mechanical Walkthrough

- **`last_error = None`** — initialized before the loop, so a name
  exists to hold the most recent failure regardless of how many
  attempts run.
- **`for attempt in range(1, 4):`** — three attempts, numbered `1`
  through `3`; `range(1, 4)` produces `1, 2, 3` — the upper bound, `4`,
  is exclusive, a detail this curriculum's own earlier lessons already
  established and this lesson reuses without re-deriving Python's
  `range` semantics from scratch.
- **`calculate_order_total(subtotal=Decimal("42.00"), item_count=1,
  loyalty_tier="glod")`** — the identical call, with the identical
  arguments, on every single attempt; nothing in this loop changes what
  gets passed in between attempts.
- **`break`** — would exit the loop immediately on success; never
  reached in this run, because every attempt fails.
- **`except ValueError as e:`** — catches the specific exception this
  unit already knows to expect, consistent with Lesson 97's own
  discipline.
- **`print(f"attempt {attempt}: ValueError: {e}")`** — reports each
  failed attempt individually, making the repetition visible rather
  than only reporting the final outcome.

### CS Lens

Distinguishing a deterministic failure from a transient one before
deciding whether to retry is the identical judgment a **network
protocol's own retry logic** has to make, formally: TCP retransmits a
lost packet because packet loss is a transient condition of the
network, but a protocol correctly does not retry a connection that was
actively refused by the remote host, because a refused connection is
often a deterministic signal (nothing is listening on that port) that
retrying, unchanged, will not fix.

```
Also recognized in: an HTTP client retrying a request that returned a
503 Service Unavailable but not one that returned a 400 Bad Request, a
CI pipeline automatically re-running a test flagged as flaky but not
one that fails the same assertion every single time, and a printer
driver retrying a paper-jam-cleared print job but not resubmitting a
document that failed because the file itself was corrupted
```

### SE Lens

The alternative not chosen is wrapping every call to
`calculate_order_total` in a generic retry loop "just in case," on the
argument that retrying is cheap and can only help. This unit's own
demonstration shows exactly why that reasoning is wrong for a
deterministic failure: three identical attempts produced three
identical failures, at the cost of three times the wasted computation,
with zero chance of a different outcome — and if `calculate_order_total`
ever gained a real side effect in the future (writing to a database, for
example), blindly retrying a failure after that side effect had already
partially run could risk exactly the kind of corruption this lesson's
first unit spent its own effort preventing. The real cost of *not*
retrying, honestly stated: a batch job that gives up on a bad order
immediately, rather than trying again, requires a human or an upstream
system to actually notice and fix the bad data — Lesson 97's own
`process_orders` already surfaces that need, by recording the specific
error message in its own `errors` list, which is the correct response
to a deterministic failure: report it precisely, don't retry it
blindly.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing.py
```

### Run It

The retry demonstration against `calculate_order_total` itself, run to
completion:

```text
attempt 1: ValueError: Unknown loyalty tier: 'glod'
attempt 2: ValueError: Unknown loyalty tier: 'glod'
attempt 3: ValueError: Unknown loyalty tier: 'glod'
gave up after 3 identical attempts, still failing: Unknown loyalty tier: 'glod'
```

Three attempts, three byte-for-byte identical failures — concrete proof
that retrying this specific kind of failure never changes the outcome,
matching this unit's own isolated lab exactly.

### Connecting Back

`pricing.py` now leaves an accurate audit trail behind every order it
processes, whether that order succeeds or fails, and deliberately makes
no attempt to retry the one kind of failure this file can produce,
because this lesson's own second unit proved, concretely, that doing so
would only waste effort — the same four business rules this domain has
carried since Lesson 93, now honest about both what a failure leaves
behind and what trying again could actually accomplish.

## Connect the Pieces

The same `"glod"` typo from Lesson 97, traced through both of this
lesson's units: the first unit showed that `process_order_and_log`'s
own first draft, run against one valid order and one `"glod"` order,
left `audit_log` claiming `2` successes when only `1` order actually
succeeded — a real, silent corruption caused entirely by incrementing
`orders_succeeded` before `calculate_order_total` had actually
succeeded. Reordering that single increment to run only after the call
returns fixed it: `orders_attempted` reads `2`, `orders_succeeded`
reads `1`, matching what genuinely happened. The second unit then asked
whether that same `"glod"` order was worth retrying at all, and
answered it with a real run: three identical attempts against the
identical bad tier produced three identical failures, proving — not
merely asserting — that `calculate_order_total`'s own validation
failures are deterministic and gain nothing from a retry loop, unlike
this unit's own isolated `lookup_tax_rate` example, where a genuinely
transient condition made a third attempt succeed where the first two
failed. Same four business rules, same accurate audit trail, and a
clear, demonstrated answer to a question error handling alone
(Lesson 97) never actually asked: what should happen next, after a
failure has already been caught?

## What Breaks Without This

Revert `process_order_and_log` to its broken ordering from this
lesson's first unit, and wrap it in a retry loop that assumes every
failure is worth retrying — the natural, if wrong, combination of both
mistakes this lesson exists to prevent:

```python
def process_order_and_log_broken(order_id, subtotal, item_count, loyalty_tier, audit_log):
    audit_log["orders_attempted"] += 1
    audit_log["orders_succeeded"] += 1
    total = calculate_order_total(
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
    return total


audit_log = {"orders_attempted": 0, "orders_succeeded": 0}
for attempt in range(1, 4):
    try:
        process_order_and_log_broken("ORD-2", Decimal("42.00"), 1, "glod", audit_log)
        break
    except ValueError:
        continue
print(f"audit_log after 3 retried attempts on one bad order: {audit_log}")
```

Running this produces:

```text
audit_log after 3 retried attempts on one bad order: {'orders_attempted': 3, 'orders_succeeded': 3}
```

One order, which never actually succeeded even once, is now recorded as
`3` separate successes — the ordering bug from this lesson's first unit
and the retry-everything mistake from its second unit compound each
other: every wasted retry attempt against a deterministic failure adds
another false success to an already-corrupted audit log. Restore both
fixes — the corrected increment order, and no retry logic around a
`ValueError` — before moving on.

## Exercises

1. `process_order_and_log`'s own `audit_log["orders_attempted"] += 1`
   still runs even for an order that turns out to have an invalid
   tier. Decide whether that's correct behavior for a count meant to
   track "attempts," or whether it should also only increment on
   success — defend your answer using this lesson's own distinction
   between what each specific counter is supposed to measure.
2. Write a function, `process_orders_with_audit`, that combines
   `process_orders`'s own batch-processing loop (Lesson 97) with
   `process_order_and_log`'s audit-log tracking (this lesson), so a
   whole batch of orders produces both a `results`/`errors` pair and an
   accurate `audit_log`, for one batch, in one pass. Run it against
   this lesson's own four-order batch from Lesson 97 and confirm
   `audit_log["orders_succeeded"]` reads `3`.
3. Name one real failure this project's own pricing logic could
   plausibly encounter in production that would be genuinely transient
   — not `calculate_order_total`'s own `ValueError` — and explain, in
   one or two sentences, what specifically about it makes it different
   from a deterministic failure.

## Definition of Done

- [ ] You can explain, using this lesson's own real `audit_log`
      output, why `orders_succeeded` read `2` in the broken version and
      `1` in the fixed one, for the identical two calls.
- [ ] You can state the difference between a deterministic failure and
      a transient failure in your own words, and name which one
      `calculate_order_total`'s `ValueError` is.
- [ ] You can explain why blindly retrying every failure is not simply
      "extra safety with no downside" — using this lesson's own "What
      Breaks Without This" demonstration as your evidence.
- [ ] You've completed all three exercises.
- [ ] `pricing.py` matches this lesson's own final "Updated Project"
      state, and running it reproduces this lesson's own final "Run It"
      output exactly.
- [ ] Commit the file with a message explaining why the change was
      made — e.g. `git commit -m "Fix audit log corruption from
      failed orders; confirm ValueError from invalid tiers is
      deterministic and not worth retrying"` — not
      `git commit -m "improve failure handling"`, which names no
      specific bug and no specific evidence.

Lesson 99, Side Effects, is next.
