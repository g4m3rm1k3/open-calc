# Lesson 99: Side Effects

**What you will build.** Continuing `pricing.py` from Lesson 98's final
state: pulling `process_order_and_log`'s two audit-log mutations out
into their own small, dedicated functions — `record_attempt` and
`record_success` — whose entire job is performing exactly one side
effect each, and a new `preview_order_total` function that reuses
`calculate_order_total` to quote a price with zero effect on the audit
log at all. Transferable problem: this domain already taught, in an
earlier lesson, that a function should either compute a value or change
something about the world, not both at once. This lesson asks the
question that one didn't: once a function legitimately needs to do
both, *where* should the world-changing part actually live — mixed
into the same lines as the calculation, or pulled out into its own,
separately named place?

**What you need to know first.** Lessons 93 through 98 — this lesson
continues the identical `pricing.py` file, and depends specifically on
Lesson 98's `process_order_and_log` and its `audit_log` dictionary.
Domain 5's Lesson 67 (Side Effects) — that lesson taught the
distinction between a pure function and one with a side effect, using
`.sort()` (mutates in place) against `sorted()` (returns a new list).
This lesson assumes that distinction and asks a different question:
given a function that legitimately needs to cause a side effect, where
in the code should that side effect actually be written.

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
order forward: this lesson asks which lines of code, exactly, are
allowed to touch `audit_log` — and shows that the answer, once decided
deliberately, makes a genuinely new capability possible: quoting a
customer's total without recording anything at all.

**Terms used in this lesson.**

- **Side effect** (reused from Domain 5's Lesson 67) — any change a
  function makes that's visible outside its own return value: mutating
  a shared data structure, writing to a file, printing to the screen,
  making a network call. It exists as a concept because two functions
  that look similar — same inputs, similar-looking bodies — behave
  completely differently for a caller depending on whether one of them
  quietly changes something the caller didn't ask it to change.
- **Command-query separation** — the principle that a function should
  either answer a question (a *query*, returning a value, causing no
  side effects) or carry out an action (a *command*, causing a side
  effect, not relied upon for its return value) — never meaningfully
  both in the same function. It exists because a function that does
  both forces every caller to either want both effects every time, or
  work around the one they don't.
- **Functional core** — the part of a program built entirely from pure
  functions — no side effects, same input always producing the same
  output — that a program's other, side-effecting parts call into. It
  exists as a design goal because a pure function is the easiest kind
  of code to test, reason about, and reuse safely in a context its
  original author never anticipated.

**Objects and methods used.**

- **`dict`** (Python's built-in mapping type) —
  *What it is:* an unordered (insertion-ordered since Python 3.7)
  collection of key-value pairs.
  *Implementation:* item assignment (`d[key] = value`) and item access
  (`d[key]`) both run in constant time on average; `dict(other_dict)`
  constructs a shallow copy of an existing dictionary.
  *Its use:* `audit_log` remains a `dict`, unchanged in shape from
  Lesson 98; this lesson's own "Run It" step also uses `dict(audit_log)`
  once, specifically to take a snapshot of its current contents before
  and after calling `preview_order_total`, in order to prove — not just
  claim — that nothing about it changed.

---

## Concept Unit: Extracting Side-Effect-Only Functions

### The Problem

`process_order_and_log`, as Lesson 98 left it, has three lines that
each do something meaningfully different: one increments
`audit_log["orders_attempted"]`, one calls `calculate_order_total` and
keeps its return value, and one increments
`audit_log["orders_succeeded"]`. A reader scanning this function has to
read each line individually to figure out which of the three kinds of
thing it's doing — mutate the log, compute a value, or mutate the log
again — because nothing about the function's own structure separates
"the part that computes" from "the part that changes something outside
this function."

### Isolating the Concept: Command-Query Separation

Isolate this on a small, unrelated example — a function that computes
an average and prints it, in one step:

```python
def get_and_print_average_mixed(numbers):
    average = sum(numbers) / len(numbers)
    print(f"average is {average}")
    return average
```

This function does two genuinely different things: it computes a
value, and it prints to the screen — a side effect entirely separate
from the value it returns. A caller who only wants the number, not the
printed line, has no way to get one without the other. Here's the same
behavior, split in two:

```python
def calculate_average(numbers):
    return sum(numbers) / len(numbers)


def print_average(numbers):
    average = calculate_average(numbers)
    print(f"average is {average}")
```

Run all three:

```python
mixed_result = get_and_print_average_mixed([10, 20, 30])
print(f"mixed version returned: {mixed_result}")
pure_result = calculate_average([10, 20, 30])
print(f"pure calculate_average returned (no print): {pure_result}")
print_average([10, 20, 30])
```

Running this produces:

```text
average is 20.0
mixed version returned: 20.0
pure calculate_average returned (no print): 20.0
average is 20.0
```

`calculate_average([10, 20, 30])` returns `20.0` with no printed output
at all — calling it produces nothing visible, only a value. `get_and_
print_average_mixed` and `print_average` both print `"average is
20.0"` and both return `20.0`, but only `print_average` gets there by
calling a pure function first and adding the side effect separately,
which means a caller who only wants the number now has
`calculate_average` available on its own. This split is called
**command-query separation**: `calculate_average` is a *query* — it
answers a question and causes nothing else to happen — and
`print_average` is a *command* — its entire purpose is the side effect,
built on top of a query it doesn't duplicate.

This throwaway example is discarded now — all three average-related
functions exist only to demonstrate command-query separation and will
not appear in the pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`, exactly as Lesson 98 left it. **Files
affected:** `pricing.py`, modified. **Change type:** refactor — extract
`process_order_and_log`'s two `audit_log` mutations into their own
functions, `record_attempt` and `record_success`, and rewrite
`process_order_and_log` to call them. **Location:** two new functions
added above `process_order_and_log`; its own body rewritten to call
them instead of mutating `audit_log` directly. **Dependencies:** none.

`process_order_and_log`, exactly as Lesson 98 left it:

```python
def process_order_and_log(order_id, subtotal, item_count, loyalty_tier, audit_log):
    audit_log["orders_attempted"] += 1
    total = calculate_order_total(
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
    audit_log["orders_succeeded"] += 1
    return total
```

Every line here reads correctly, in the right order — Lesson 98 already
fixed that — but the side effects and the calculation are still
interleaved in one function body, with nothing marking which lines are
which beyond reading each one individually.

### The New Code

Two new functions, each responsible for exactly one side effect and
nothing else:

```python
def record_attempt(audit_log):
    audit_log["orders_attempted"] += 1


def record_success(audit_log):
    audit_log["orders_succeeded"] += 1
```

### The Updated Project

`pricing.py`'s relevant functions, in full, after this unit's change
(the complete file appears in this lesson's own final "Updated
Project," after both units):

```python
def record_attempt(audit_log):                                                        # ← new
    audit_log["orders_attempted"] += 1                                                  # ← new


def record_success(audit_log):                                                          # ← new
    audit_log["orders_succeeded"] += 1                                                   # ← new


def process_order_and_log(order_id, subtotal, item_count, loyalty_tier, audit_log):
    record_attempt(audit_log)                                                            # ← new
    total = calculate_order_total(
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
    record_success(audit_log)                                                             # ← new
    return total
```

`process_order_and_log`'s own body now reads as three calls: cause one
effect, compute one value, cause another effect — each one named for
exactly what it does, rather than three lines a reader has to parse
individually to tell apart.

### Mechanical Walkthrough

- **`def record_attempt(audit_log):`** — a new function, taking the
  shared `audit_log` dict as its only parameter; it has no `return`
  statement, so calling it always produces `None` — a signal, visible
  in its own definition, that this function exists purely for its
  effect, not for any value it hands back.
- **`audit_log["orders_attempted"] += 1`** — the identical mutation as
  Lesson 98's own version, now living inside a function whose name
  already states what this line does, rather than requiring a reader
  to infer it from the surrounding context of a larger function.
- **`def record_success(audit_log):`**, **`audit_log["orders_succeeded"]
  += 1`** — the same pattern, for the second counter.
- **`record_attempt(audit_log)`** inside `process_order_and_log` — a
  call whose return value is never used (there isn't one worth using);
  this line's entire purpose is the side effect `record_attempt`
  performs.
- **`total = calculate_order_total(...)`** — unchanged from every
  earlier lesson; this is the one line in the function that computes
  and keeps a value, now visually distinct from the two calls around it
  because it's the only one of the three assigned to a variable.
- **`record_success(audit_log)`** — same pattern as `record_attempt`,
  called only after `calculate_order_total` has already returned
  normally, preserving Lesson 98's own ordering fix exactly.

### CS Lens

Splitting a query from a command this way is the same discipline behind
a **functional core, imperative shell** architecture: pure,
side-effect-free logic (`calculate_order_total`, already pure since
Lesson 93) sits at the center, and the parts of the program that
actually touch the outside world (`record_attempt`, `record_success`)
are pushed to the edges, each one doing nothing except the one effect
it's named for. The core stays trivially testable — call it, check the
return value, no setup or teardown of any external state required — and
every side-effecting piece is small enough to verify on its own, in
isolation from the calculation it surrounds.

```
Also recognized in: a web framework's own separation of a route handler
(which touches the request and response, both side effects) from a
service layer function it calls (which computes a result and returns
it), a game engine separating pure physics calculations from the
rendering calls that draw their results to the screen, and a spreadsheet
formula (a pure query) versus a macro that writes a formula's result
into a different cell (a command)
```

### SE Lens

The alternative not chosen is Lesson 98's own version: mutating
`audit_log` directly, inline, at the two points in
`process_order_and_log` where each mutation is supposed to happen. That
version isn't wrong — Lesson 98 already proved its ordering is correct
— but it commits `process_order_and_log` itself to always performing
both audit-log mutations, every time it's called, with no way to reuse
its own orchestration (attempt-then-compute-then-record) in a context
that doesn't want the audit-log side effect at all. The real cost this
unit's extraction accepts: two new functions, `record_attempt` and
`record_success`, each one line long, that a reader now has to look up
separately to understand fully — a small but real tax on a reader who
wants the complete picture of what one order-processing call does,
paid in exchange for each piece being independently reusable,
testable, and — as the next unit shows concretely — safely omittable.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing.py
```

### Run It

`process_order_and_log`, called once successfully and once against
Lesson 97's own `"glod"` typo:

```python
audit_log = {"orders_attempted": 0, "orders_succeeded": 0}
total1 = process_order_and_log("ORD-1", Decimal("42.00"), 1, "gold", audit_log)
print("process_order_and_log ORD-1:", total1, audit_log)

try:
    process_order_and_log("ORD-2", Decimal("42.00"), 1, "glod", audit_log)
except ValueError as e:
    print(f"ValueError: {e}")
print("audit_log after failed ORD-2:", audit_log)
```

Running this produces:

```text
process_order_and_log ORD-1: 45.8900 {'orders_attempted': 1, 'orders_succeeded': 1}
ValueError: Unknown loyalty tier: 'glod'
audit_log after failed ORD-2: {'orders_attempted': 2, 'orders_succeeded': 1}
```

Identical to Lesson 98's own final output — extracting `record_attempt`
and `record_success` changed nothing about what `process_order_and_log`
does or when; it changed only how clearly each of its three actions is
named.

### Connecting Back

Every side effect in this file now lives in its own dedicated function
— but `calculate_order_total` itself has been pure since Lesson 93, and
the next unit shows exactly what that buys once every side effect
around it is isolated too.

---

## Concept Unit: A Pure Preview, Enabled by Isolated Side Effects

### The Problem

The order-processing service wants a "quote" feature: let a customer
see what their total would be, before actually placing the order,
without that preview being recorded anywhere as a real attempt. Against
Lesson 98's own version of `process_order_and_log` — where
`audit_log["orders_attempted"] += 1` was interleaved directly into the
same function that computes the total — building this feature safely
would require either duplicating the calculation logic outside that
function (risking the two copies drifting apart, exactly as Lesson 93's
own duplicated gold-tier check once did) or calling
`process_order_and_log` itself and accepting that every "preview"
would incorrectly count as a real attempt.

### Isolating the Concept: Reuse a Pure Function With No Side Effects Attached

This unit's own concept doesn't need a fresh isolated lab — it's the
direct consequence of the previous unit's already-isolated construct,
applied here. `calculate_average`, from this lesson's own first unit,
already demonstrated the shape: because it causes no side effect at
all, it can be called anywhere a caller wants the number, including a
context that never wants `print_average`'s own printed line. The same
property is what this unit now exploits inside the real project,
instead of inside a throwaway example.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`. **Files affected:** `pricing.py`,
modified — a new function, `preview_order_total`, added. **Change
type:** add. **Location:** below `process_order_and_log`.
**Dependencies:** `calculate_order_total`, already defined above it —
specifically because it has been pure since Lesson 93, `preview_order_
total` can call it directly with no risk of triggering any audit-log
side effect.

### The New Code

```python
def preview_order_total(*, subtotal, item_count, loyalty_tier):
    return calculate_order_total(
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
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


def preview_order_total(*, subtotal, item_count, loyalty_tier):                # ← new
    return calculate_order_total(                                              # ← new
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
```

`preview_order_total` is a thin wrapper — today, its body does nothing
`calculate_order_total` doesn't already do on its own — but it exists
as its own, separately named entry point specifically so a caller
building a "quote" feature has an obviously side-effect-free function
to call, one that can grow its own preview-specific behavior later
without ever risking a real order's own audit trail.

### Mechanical Walkthrough

- **`def preview_order_total(*, subtotal, item_count, loyalty_tier):`**
  — a new function, matching `calculate_order_total`'s own
  keyword-only signature from Lesson 95, for the identical reason: a
  caller passing a `subtotal`/`item_count` pair in the wrong order
  should fail loudly here too, not just in the function it wraps.
- **`return calculate_order_total(subtotal=subtotal, item_count=item_count,
  loyalty_tier=loyalty_tier)`** — a direct call, forwarding every
  argument through by name and returning whatever it returns; nothing
  about `audit_log`, `record_attempt`, or `record_success` appears
  anywhere in this function's body, because none of them are imported,
  passed in, or referenced — there is no `audit_log` in scope here at
  all for a mistake to accidentally reach.

### CS Lens

A function that can be called freely, anywhere, without needing to
worry about what else it might change, is exactly what a **referentially
transparent** expression is in a purely functional language: an
expression that can be replaced by its own result anywhere it appears,
with no change in what the program does, because it has no side effects
to lose by doing so. `preview_order_total(subtotal=Decimal("42.00"),
item_count=1, loyalty_tier="gold")` could be replaced, anywhere it's
called, with the literal value `Decimal("45.8900")`, and the program's
behavior — including its effect on `audit_log` — would be identical
either way. `process_order_and_log`, by contrast, cannot be replaced by
its own return value without also losing its two real effects on
`audit_log` — it is not referentially transparent, and this lesson's
whole design deliberately keeps that property contained to the smallest
possible piece of code.

```
Also recognized in: a spreadsheet formula cell, safely copyable to
another cell with no effect beyond its own displayed value, a pure
"getter" method on an object versus a "setter" that changes the
object's own state, and memoization itself (this domain's own earlier
material) — which is only safe to apply to a function in the first
place because it's pure, exactly the property preview_order_total was
built to guarantee
```

### SE Lens

The alternative not chosen is skipping `preview_order_total` entirely
and simply telling a future "quote feature" developer to "just call
`calculate_order_total` directly, it's already pure." That would work —
`calculate_order_total` genuinely has no side effects to worry about —
but it leaves the guarantee implicit, resting on a future developer
correctly remembering, or correctly re-verifying, that
`calculate_order_total` still has no side effects the next time they
reach for it. Giving the preview its own named function makes the
guarantee explicit and load-bearing: `preview_order_total`'s own name
states the intent, and if `calculate_order_total` ever gained a side
effect in some future lesson, a reviewer would immediately have reason
to ask whether `preview_order_total` still deserves its own name. The
real cost accepted here: one more function in the file, doing nothing
today that calling `calculate_order_total` directly wouldn't already
do — a small amount of present-day duplication of intent, bought
deliberately, in exchange for a guarantee a future reader doesn't have
to re-derive from scratch.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing.py
```

### Run It

A snapshot of `audit_log` taken before and after calling
`preview_order_total`, to prove — not just claim — that the preview
leaves it untouched:

```python
before = dict(audit_log)
preview = preview_order_total(subtotal=Decimal("42.00"), item_count=1, loyalty_tier="gold")
after = dict(audit_log)
print("preview total:", preview)
print("audit_log unchanged by preview?", before == after, before, after)
```

Running this, immediately after this lesson's own first unit's "Run
It" step (so `audit_log` already holds `{'orders_attempted': 2,
'orders_succeeded': 1}` from the two prior calls), produces:

```text
preview total: 45.8900
audit_log unchanged by preview? True {'orders_attempted': 2, 'orders_succeeded': 1} {'orders_attempted': 2, 'orders_succeeded': 1}
```

`preview` correctly reads `45.89` — the identical total this domain has
verified for this exact case since Lesson 93 — and `before == after` is
`True`: calling `preview_order_total` computed a real, correct number
and changed nothing else about the program's state, exactly the
guarantee this unit set out to build.

### Connecting Back

`pricing.py` now has a real, verified boundary between the code that
computes and the code that changes something outside itself — every
side effect lives in its own small function, `calculate_order_total`
remains pure all the way down to `preview_order_total`'s own thin
wrapper around it, and a "quote" feature that would have been risky to
build safely against Lesson 98's own version is now one honest function
call away — the same four business rules this domain has carried since
Lesson 93, now cleanly separable into what they compute and what they
change.

## Connect the Pieces

The same gold-tier, $42.00 case from this lesson's own header, traced
through both units: Lesson 98 left `process_order_and_log` correctly
ordered but with its two `audit_log` mutations written inline,
interleaved with the call to `calculate_order_total`. This lesson's
first unit extracted those two mutations into `record_attempt` and
`record_success`, each one doing exactly one named thing and nothing
else, leaving `process_order_and_log`'s own body reading as three
distinct calls instead of three lines a reader had to parse
individually — with `orders_succeeded` still landing at `1` after one
real success and one real failure, unchanged from Lesson 98's own
correct count. The second unit then built `preview_order_total`,
reusing `calculate_order_total` — pure since Lesson 93 — with zero
audit-log involvement, and proved, with a real before/after snapshot,
that calling it left `audit_log` exactly as it was. Same four business
rules, same `45.89` for the header's own case, and a genuinely new
capability — a side-effect-free price quote — that was a real
architectural risk against Lesson 98's own version and a one-line
wrapper against this lesson's.

## What Breaks Without This

Give `preview_order_total` a bug that reintroduces exactly the coupling
this lesson's second unit exists to prevent — call `process_order_and_
log` from inside it instead of `calculate_order_total` directly,
reasoning (incorrectly) that they "do the same thing":

```python
def preview_order_total_broken(*, subtotal, item_count, loyalty_tier, audit_log):
    return process_order_and_log(
        "PREVIEW", subtotal, item_count, loyalty_tier, audit_log
    )


audit_log = {"orders_attempted": 0, "orders_succeeded": 0}
before = dict(audit_log)
preview = preview_order_total_broken(
    subtotal=Decimal("42.00"), item_count=1, loyalty_tier="gold", audit_log=audit_log
)
after = dict(audit_log)
print("preview total:", preview)
print("audit_log unchanged by preview?", before == after, before, after)
```

Running this produces:

```text
preview total: 45.8900
audit_log unchanged by preview? False {'orders_attempted': 0, 'orders_succeeded': 0} {'orders_attempted': 1, 'orders_succeeded': 1}
```

The preview's own returned total is still correct — `45.89` — which is
exactly what makes this bug dangerous: nothing about the number itself
looks wrong. But `audit_log` changed anyway, recording a customer's
mere price quote as a real, successful order attempt, silently
corrupting the same audit trail this domain spent Lesson 98 making
accurate in the first place. This is the whole reason
`preview_order_total` calls `calculate_order_total` and nothing else —
restore that before moving on.

## Exercises

1. `record_attempt` and `record_success` are both one-line functions.
   Write down a real argument for why extracting something this small
   into its own function is still worth doing, using this lesson's own
   CS Lens and SE Lens as your evidence — not just "because it's a good
   habit."
2. Add a third side-effect-only function, `record_failure(audit_log)`,
   that increments a new `"orders_failed"` counter, and call it from
   inside a `try`/`except` wrapped around `process_order_and_log`'s own
   call to `calculate_order_total`. Confirm, with a real run, that
   `orders_attempted`, `orders_succeeded`, and `orders_failed` are all
   internally consistent after processing one success and one failure.
3. `preview_order_total`'s own body today is identical, line for line,
   to simply calling `calculate_order_total` directly. Write one or two
   sentences arguing the *other* side of this lesson's own SE Lens —
   why a future reader might reasonably consider this an unnecessary
   layer of indirection, and what evidence would change your mind about
   which side is right for this specific file.

## Definition of Done

- [ ] You can name, from memory, which function in this lesson's
      final `pricing.py` state is the only one allowed to mutate
      `audit_log`, and explain why `preview_order_total` deliberately
      doesn't call it.
- [ ] You can state command-query separation in your own words, using
      `calculate_average` and `print_average` from this lesson's own
      isolated lab as your two examples.
- [ ] You can explain, using this lesson's own real before/after
      snapshot, what "referentially transparent" means for
      `preview_order_total` specifically.
- [ ] You've completed all three exercises.
- [ ] `pricing.py` matches this lesson's own final "Updated Project"
      state, and running it reproduces this lesson's own final "Run It"
      output exactly.
- [ ] Commit the file with a message explaining why the change was
      made — e.g. `git commit -m "Isolate audit-log side effects into
      record_attempt/record_success; add a pure preview_order_total for
      quoting without recording an attempt"` — not
      `git commit -m "refactor pricing.py"`, which doesn't tell a
      future reader which new capability this change actually enables.

Lesson 100, Input Validation, is next.
