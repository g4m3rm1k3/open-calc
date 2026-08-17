# Lesson 97: Error Handling

**What you will build.** Continuing `pricing.py` from Lesson 96's final
state: `calculate_order_total` rejecting an unrecognized loyalty tier
by raising a specific, real exception instead of silently treating it
as "not gold," and a new `process_orders` function that catches that
exact exception at a batch boundary — recording which orders failed and
why, while still correctly processing every order that didn't. This
lesson also demonstrates, with real code, why catching a broad,
unspecific exception is a genuinely different and more dangerous choice
than catching a specific one. Transferable problem: an error that's
silently absorbed into "no discount applied" isn't handled — it's
hidden, and hidden errors surface later, further from their cause, as
much harder problems to diagnose.

**What you need to know first.** Lessons 93 through 96 — this lesson
continues the identical `pricing.py` file. Domain 3's Lessons 28
through 31 (Preconditions, Postconditions, Invariants, Design by
Contract) — this lesson's first unit is a precondition, enforced in
code for the first time in this domain, rather than only specified.
Domain 3's Lesson 35 (Error Contracts) — this lesson's whole subject is
how a violated contract actually gets communicated to a caller, in real
Python.

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

Still the **Implementation** stage. Carrying a variation of the same
order forward: this lesson's own concrete failure case is a gold-tier
order with the tier misspelled as `"glod"` — a single-character typo
that, before this lesson, would silently compute a wrong total with no
error at all.

**Terms used in this lesson.**

- **Exception** — an object Python raises to signal that normal
  execution can't continue as written, which interrupts the current
  function and propagates upward until something explicitly handles
  it; it exists so a function can report "I can't do what you asked, and
  here's why" as a distinct, first-class event, rather than smuggling
  that information through an ordinary return value a caller might not
  check.
- **Raising** — the act of creating and throwing an exception with the
  `raise` statement, immediately halting the current function's normal
  execution; it exists as the mechanism a function uses to actually
  report the "I can't do this" event named above.
- **`try`/`except`** — a block of code (`try`) whose exceptions are
  caught and handled by a following block (`except`), instead of being
  allowed to propagate further up and potentially crash the whole
  program; it exists to let a caller decide, deliberately, which
  failures it's prepared to recover from and how.
- **Catching a specific exception type** — writing `except
  SomeSpecificError:` rather than a bare `except:` or `except
  Exception:`; it exists because catching everything indiscriminately
  means catching failures the code was never designed to handle, up to
  and including genuine bugs unrelated to the failure the `try` block
  was written to guard against.

**Objects and methods used.**

- **`ValueError`** (a built-in Python exception type) —
  *What it is:* a standard-library exception representing "a function
  received an argument of the right type, but an inappropriate value."
  *Implementation:* constructed as `ValueError(message)`, where
  `message` is a string describing what went wrong; inherits from the
  built-in `Exception`, so it can be caught either specifically
  (`except ValueError:`) or as part of a broader `except Exception:`.
  *Its use:* `calculate_order_total` raises `ValueError` specifically
  because an unrecognized loyalty tier is exactly this case — the
  argument is the right type, a `str`, but not one of the values this
  function is actually prepared to compute a discount for.
- **`frozenset`** (a built-in Python immutable collection type) —
  *What it is:* an immutable, unordered collection of unique values —
  the read-only counterpart to Python's mutable `set`.
  *Implementation:* constructed as `frozenset(iterable)`; supports
  membership testing with `in`, in constant time on average, but no
  method that could modify its contents after construction (no
  `.add()`, no `.remove()`).
  *Its use:* `VALID_LOYALTY_TIERS` is a `frozenset` specifically because
  it's a fixed, module-level set of legal values that should never
  change while the program runs — a plain, mutable `set` would work
  identically for the membership check this lesson uses, but would
  falsely suggest the set of valid tiers is something this file's own
  code might legitimately add to at runtime.

---

## Concept Unit: Raising a Specific Exception for an Invalid Input

### The Problem

`calculate_order_total` currently treats `loyalty_tier` as either
`"gold"` or "anything else" — `apply_gold_tier_discount`'s own `if
loyalty_tier == "gold":` check silently falls through to "no discount"
for any value that isn't the exact string `"gold"`. That includes a
genuinely different but valid tier like `"standard"`, which is correct.
It also includes `"Gold"` with a capital letter, `"glod"` with a typo,
or `None` from a field that was never filled in — every one of which
silently produces a real, wrong total with no indication anything went
wrong. A support ticket about a missing gold discount, this domain's
own running scenario since Lesson 93, could just as easily have been
caused by a typo like this as by the nested-conditional bug Lesson 93
actually found — and this version of the bug leaves no trace at all.

### Isolating the Concept: Raise a Specific Exception

Isolate this on a small, unrelated example — validating that an age is
not negative:

```python
def validate_age(age):
    if age < 0:
        raise ValueError(f"age cannot be negative: {age}")
    return age
```

Call it with a valid age, then an invalid one, catching the exception
where it's invalid:

```python
for age in [25, -5]:
    try:
        result = validate_age(age)
        print(f"age={age} -> valid, result={result}")
    except ValueError as e:
        print(f"age={age} -> ValueError: {e}")
```

Running this against both ages produces:

```text
age=25 -> valid, result=25
age=-5 -> ValueError: age cannot be negative: -5
```

`validate_age(25)` returns normally: the function's ordinary `return`
runs, and execution continues right after the call. `validate_age(-5)`
never reaches its own `return` at all — the `raise` statement
immediately halts `validate_age`'s own execution and hands control to
the nearest `except ValueError:` block that's waiting for it, which is
exactly what the `try`/`except` around this loop is doing. This is
called **raising** an exception: deliberately signaling "this input is
invalid, and here specifically is why," as a distinct kind of event a
caller has to explicitly choose to handle, rather than a return value a
caller could silently ignore.

This throwaway example is discarded now — `validate_age` exists only to
demonstrate raising a specific exception and will not appear in the
pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`, exactly as Lesson 96 left it. **Files
affected:** `pricing.py`, modified. **Change type:** add a new
module-level constant, `VALID_LOYALTY_TIERS`, and add a validation
check at the top of `calculate_order_total`. **Location:**
`VALID_LOYALTY_TIERS` declared alongside the other module-level
constants; the new check as the first line inside
`calculate_order_total`'s own body, before its existing guard clause.
**Dependencies:** none.

### The New Code

The new constant:

```python
VALID_LOYALTY_TIERS = frozenset({"standard", "gold"})
```

And the new check, as the first line of `calculate_order_total`'s body:

```python
    if loyalty_tier not in VALID_LOYALTY_TIERS:
        raise ValueError(f"Unknown loyalty tier: {loyalty_tier!r}")
```

### The Updated Project

`pricing.py`'s constants block and `calculate_order_total`, in full,
after this unit's change (every other function is unchanged from
Lesson 96 and omitted here only where explicitly noted, per this
lesson's own accumulated length — the complete file appears in this
lesson's own final "Updated Project," below, after both units):

```python
from decimal import Decimal

BULK_DISCOUNT_THRESHOLD = Decimal("100.00")
BULK_DISCOUNT_RATE = Decimal("0.9")
GOLD_TIER_DISCOUNT_RATE = Decimal("0.95")
FREE_SHIPPING_THRESHOLD = Decimal("50.00")
STANDARD_SHIPPING_FEE = Decimal("5.99")
BULK_HANDLING_ITEM_THRESHOLD = 10
BULK_HANDLING_FEE = Decimal("2.50")
VALID_LOYALTY_TIERS = frozenset({"standard", "gold"})          # ← new


def calculate_order_total(*, subtotal, item_count, loyalty_tier):
    if loyalty_tier not in VALID_LOYALTY_TIERS:                  # ← new
        raise ValueError(f"Unknown loyalty tier: {loyalty_tier!r}")  # ← new
    if subtotal <= 0:
        return Decimal("0")
    discounted_subtotal = apply_bulk_discount(subtotal)
    discounted_subtotal = apply_gold_tier_discount(discounted_subtotal, loyalty_tier)
    shipping_fee = calculate_shipping_fee(subtotal)
    bulk_handling_fee = calculate_bulk_handling_fee(item_count)
    return discounted_subtotal + shipping_fee + bulk_handling_fee
```

`calculate_order_total` now rejects an unrecognized tier immediately,
before computing anything, instead of silently proceeding as if no
discount applied — the same guard-clause discipline Lesson 93
established, now guarding against invalid input instead of a
non-positive subtotal.

### Mechanical Walkthrough

- **`VALID_LOYALTY_TIERS = frozenset({"standard", "gold"})`** — a
  module-level constant, following the same `SCREAMING_SNAKE_CASE`
  convention Lesson 93 established for every other named constant in
  this file; `{"standard", "gold"}` is a set literal, and wrapping it in
  `frozenset(...)` produces an immutable version of it.
- **`if loyalty_tier not in VALID_LOYALTY_TIERS:`** — a membership
  test. `in` (and its negation, `not in`) checks whether a value
  appears among a collection's elements; for a `frozenset`, this check
  runs in constant time on average, using the same hashing mechanism a
  dictionary's own key lookup uses, rather than checking each element
  one by one the way it would against a `list`.
- **`raise ValueError(f"Unknown loyalty tier: {loyalty_tier!r}")`** —
  constructs a new `ValueError` with a formatted message and
  immediately raises it, halting `calculate_order_total`'s own
  execution at this exact line; nothing below this `if` block runs when
  this branch is taken. `{loyalty_tier!r}` inside the f-string uses
  Python's `!r` conversion, which calls `repr()` on the value instead of
  `str()` — for a string like `"glod"`, this prints it with quotes
  (`'glod'`), which specifically matters here because it makes an
  accidental empty string or a value with invisible leading/trailing
  whitespace visible in the error message rather than silently
  indistinguishable from a normal one.

### CS Lens

Rejecting an invalid value immediately, at the exact point it's
received, rather than letting it flow further into a computation that
assumes it's valid, is the same discipline as a **compiler's own type
checker** rejecting a program at compile time instead of letting an
invalid operation run and produce garbage at some later, harder-to-trace
point. It's also the concrete, executable form of a **precondition** —
this domain's own Lesson 28 through Lesson 31 named and specified
preconditions as a function's own stated requirements on its inputs;
`raise ValueError(...)` here is exactly what enforcing one actually
looks like in running code, rather than only in a specification
document.

```
Also recognized in: a web form rejecting an invalid email address before
submission instead of silently storing a broken one, a network protocol
rejecting a malformed packet at the point it's received instead of
passing it deeper into the stack, and a database's own foreign key
constraint rejecting an insert that references a row that doesn't exist
```

### SE Lens

The alternative not chosen is exactly what this file did before this
unit: silently treat any non-`"gold"` value as "no discount," which
requires no new code at all and never interrupts a caller with an
exception. The real cost of that alternative is the entire scenario
this unit's own header describes — a single typo, `"glod"` instead of
`"gold"`, produces a real, wrong total, charged to a real customer, with
no error, no log entry, and no way to distinguish it after the fact
from a customer who genuinely wasn't gold tier. The cost this unit's
fix accepts in exchange: any caller of `calculate_order_total` that
isn't prepared to handle a `ValueError` will now crash on a bad tier,
where it previously would have silently kept running — which is a real
behavior change, not a pure improvement, and exactly why the next unit
exists: crashing an entire batch of orders because one of them has a
typo in its tier is not obviously better than silently undercharging
that one order, unless something at the boundary actually catches the
exception and decides what to do about it.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing.py
```

### Run It

A valid call, then an invalid one, letting the exception propagate
uncaught to see its own traceback:

```python
print(calculate_order_total(subtotal=Decimal("42.00"), item_count=1, loyalty_tier="gold"))
try:
    calculate_order_total(subtotal=Decimal("42.00"), item_count=1, loyalty_tier="glod")
except ValueError as e:
    print(f"ValueError: {e}")
```

Running this produces:

```text
45.8900
ValueError: Unknown loyalty tier: 'glod'
```

The valid call still returns `45.89`, matching every prior lesson's own
result for this exact case. The typo'd call raises immediately, with a
message naming the exact bad value it received — a real, specific
signal a caller can act on, in place of Lesson 93's own gold-tier bug's
silent, undetectable wrong answer.

### Connecting Back

`calculate_order_total` now refuses to guess at an unrecognized tier —
but nothing yet decides what should happen when a whole batch of orders
is being processed and one of them fails this check, which is the next
unit's own problem.

---

## Concept Unit: Catching a Specific Exception at a Batch Boundary

### The Problem

The order-processing service doesn't process orders one at a time in
isolation — a nightly batch job runs `calculate_order_total` across
every order placed that day. If even one order in that batch has an
invalid loyalty tier, the previous unit's own `raise ValueError(...)`
will propagate straight out of `calculate_order_total`, straight out of
whatever function called it, and crash the entire batch job — meaning
every other order in that batch, valid or not, fails to get its total
computed, purely because of one bad record sitting somewhere in the
list.

### Isolating the Concept: Catch a Specific Exception, Not a Broad One

Isolate this on a small, unrelated example that deliberately contains
two different problems at once: a real input-validation failure, *and*
an unrelated bug — a typo referencing a variable that doesn't exist:

```python
def process_item_specific(item):
    try:
        if item < 0:
            raise ValueError(f"item cannot be negative: {item}")
        return item_total  # bug: should be `item`, not `item_total`
    except ValueError as e:
        return f"handled: {e}"
```

Call it with a valid, non-negative item:

```python
print(process_item_specific(5))
```

Running this produces:

```text
NameError: name 'item_total' is not defined
```

`except ValueError as e:` only catches a `ValueError` — the real bug on
the line above it, referencing an `item_total` that was never defined,
raises a `NameError`, an entirely different exception type, which this
`except` clause makes no attempt to catch. It propagates straight out
of the function, uncaught, exactly as it should: this bug has nothing
to do with the negative-item validation this function was written to
guard against, and it needs to be seen and fixed, not hidden. Now the
same function, written to catch everything instead:

```python
def process_item_bare(item):
    try:
        if item < 0:
            raise ValueError(f"item cannot be negative: {item}")
        return item_total  # the same bug
    except Exception:
        return "handled: something went wrong"
```

Running `process_item_bare(5)` produces:

```text
handled: something went wrong
```

No traceback, no error — just a vague, misleading message claiming the
input was "handled," when what actually happened is a real programming
bug (a typo) was silently caught by a `try` block that was never meant
to catch it. **Catching a specific exception type** — `except
ValueError:` instead of `except Exception:` — is what let the first
version's real bug surface where it could be noticed and fixed, and
what the second version's broad `except Exception:` actively prevented.

This throwaway example is discarded now — both versions of
`process_item` exist only to demonstrate the difference and will not
appear in the pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`. **Files affected:** `pricing.py`,
modified — a new function, `process_orders`, added. **Change type:**
add. **Location:** below `calculate_order_total`. **Dependencies:**
`calculate_order_total`, already defined above it.

### The New Code

```python
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


def process_orders(orders):                                              # ← new
    results = []                                                          # ← new
    errors = []                                                            # ← new
    for order_id, subtotal, item_count, loyalty_tier in orders:             # ← new
        try:                                                                 # ← new
            total = calculate_order_total(                                    # ← new
                subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
            )
            results.append((order_id, total))                                  # ← new
        except ValueError as e:                                                  # ← new
            errors.append((order_id, str(e)))                                     # ← new
    return results, errors                                                          # ← new
```

`process_orders` now processes an entire batch, collecting a successful
total for every valid order and a specific, readable error message for
every invalid one — one bad tier no longer stops the other three orders
in the same batch from being priced correctly.

### Mechanical Walkthrough

- **`def process_orders(orders):`** — a new function, taking a list of
  order tuples.
- **`results = []`**, **`errors = []`** — two fresh local lists,
  created once per call (unlike Lesson 96's own mutable-default-argument
  trap, these are plain local variables, not default parameter values,
  so there's no risk of them being shared across calls).
- **`for order_id, subtotal, item_count, loyalty_tier in orders:`** — a
  `for` loop with **tuple unpacking**: each element of `orders` is
  itself a four-item tuple, and this single line binds all four of its
  positions to four separate names in one step, rather than indexing
  into the tuple manually (`order[0]`, `order[1]`, and so on).
- **`try:`** — opens a block whose exceptions will be caught by the
  `except` clause that follows it, rather than propagating out of
  `process_orders` entirely.
- **`total = calculate_order_total(...)`** — the call that might raise;
  everything from here forward inside the `try` block only runs if this
  call succeeds.
- **`results.append((order_id, total))`** — only reached when
  `calculate_order_total` returns normally; records a successful order
  as an `(order_id, total)` pair.
- **`except ValueError as e:`** — catches specifically a `ValueError` —
  and, per this unit's own isolated lab, nothing else; a genuine bug
  inside `calculate_order_total` that happened to raise some other
  exception type would still propagate out of `process_orders`
  uncaught, exactly as it should. `as e` binds the caught exception
  object itself to the local name `e`, making its message available.
- **`errors.append((order_id, str(e)))`** — records the failure;
  `str(e)` converts the exception object to its own message string —
  the same text that was passed to `ValueError(...)` when it was
  raised.
- **`return results, errors`** — returns both lists as a tuple, giving
  the caller both the successes and the failures from one call, rather
  than forcing a choice between "raise on the first failure" and
  "silently skip failures with no record of them."

### CS Lens

Catching exactly one exception type and letting every other type
propagate is the identical discipline as **exhaustive pattern
matching** in languages that have it: handling the specific cases a
function actually knows how to handle, and treating anything outside
that explicitly enumerated set as a case the function was never
designed for — which should surface as a visible failure, not be
silently absorbed into a generic catch-all. `process_orders`'s own
`except ValueError:` is doing exactly this: `ValueError` is the one
"case" this function was written to expect and recover from; anything
else is a signal that something has gone wrong in a way this function's
own author never anticipated, and hiding that behind a broad `except`
would remove the one honest signal a maintainer would otherwise get
that something needs their attention.

```
Also recognized in: a REST API returning a specific 400 Bad Request for
a validated input error while letting an unrelated 500 Internal Server
Error surface distinctly instead of masking both as the same generic
failure, a compiler's own distinct error codes for "type mismatch"
versus "undefined variable" instead of one undifferentiated "something's
wrong" message, and a circuit breaker in a distributed system tripping
specifically on a downstream timeout, not on every possible exception a
request could ever raise
```

### SE Lens

The alternative not chosen is `except Exception:` (or a bare `except:`,
which is even broader, also catching things like a user pressing
Ctrl-C mid-run) around the call to `calculate_order_total` — which
would, on the surface, seem like the more defensive choice: "catch
anything that could go wrong, keep the batch running no matter what."
This unit's own isolated lab proved exactly why that instinct is
backwards: a broad `except` doesn't distinguish "an order had an
invalid tier, which this function was designed to expect" from "there's
a real bug somewhere in this code," and silently converts both into the
identical, unhelpful "errors" entry — a maintainer investigating a
spike in `process_orders`'s own error list would see the same shape of
failure whether the cause was a customer's typo or a genuine defect
newly introduced in `calculate_order_total` itself. The real cost this
unit's narrower `except ValueError:` accepts: if a future change to
`calculate_order_total` introduces a genuinely new exception type for
some other failure this function should also recover from, someone has
to remember to widen `process_orders`'s own `except` clause to match —
narrow exception handling requires the two pieces of code to be kept
deliberately in sync, where a broad catch-all would have silently
"handled" the new case too, correctly or not, without anyone noticing
either way.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing.py
```

### Run It

A batch of four orders, one of them carrying the same `"glod"` typo
from this unit's own header:

```python
orders = [
    ("ORD-1", Decimal("142.50"), 3, "gold"),
    ("ORD-2", Decimal("42.00"), 1, "glod"),
    ("ORD-3", Decimal("75.00"), 1, "gold"),
    ("ORD-4", Decimal("250.00"), 15, "standard"),
]
results, errors = process_orders(orders)
print("results:", results)
print("errors:", errors)
```

Running this produces:

```text
results: [('ORD-1', Decimal('121.83750')), ('ORD-3', Decimal('71.2500')), ('ORD-4', Decimal('227.500'))]
errors: [('ORD-2', "Unknown loyalty tier: 'glod'")]
```

Three of the four orders — every one with a valid tier — computed
correctly, matching every value this domain has verified since Lesson
93. The fourth, `ORD-2`, appears only in `errors`, with the exact
message `calculate_order_total` raised, naming both which order failed
and specifically why — instead of either crashing the entire batch or
silently computing a wrong total for a misspelled tier.

### Connecting Back

`pricing.py` now refuses to guess at an invalid loyalty tier, and a
whole batch of orders can be processed with one bad record cleanly
separated from the rest, by name, with its own real reason attached —
the same four business rules this domain has carried since Lesson 93,
now honest about the one input they were never actually validating
until this lesson.

## Connect the Pieces

This lesson's own header case, `"glod"` instead of `"gold"`, traced
through both units: before this lesson, that typo would have silently
computed a total with no gold-tier discount applied and no indication
anything was wrong — the identical *symptom* as Lesson 93's own bug,
from an entirely different cause. The first unit closed that gap by
raising a specific `ValueError` the instant `calculate_order_total`
receives a tier outside `VALID_LOYALTY_TIERS`, turning a silent wrong
answer into an immediate, specific, named failure. The second unit
proved that fix alone would have been a regression for a batch job — one
bad tier, left to propagate uncaught, would crash every order in the
same batch — and closed that gap with `process_orders`, catching
specifically `ValueError` (never a broader exception type, per this
unit's own isolated lab) so that one order's bad data produces one
error entry, by order ID, with the failing order's own real reason
attached, while every other order in the same batch still computes
correctly. Same four business rules, same `45.89` for every valid gold
order, and a typo that used to hide silently now surfaces immediately,
specifically, and without taking down anything it doesn't need to.

## What Breaks Without This

Revert `process_orders`'s own `except ValueError:` to a bare `except:`,
leaving `calculate_order_total`'s validation from this lesson's first
unit in place:

```python
def process_orders(orders):
    results = []
    errors = []
    for order_id, subtotal, item_count, loyalty_tier in orders:
        try:
            total = calculate_order_totl(  # bug: typo, should be calculate_order_total
                subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
            )
            results.append((order_id, total))
        except:
            errors.append((order_id, "unknown error"))
    return results, errors


orders = [
    ("ORD-1", Decimal("142.50"), 3, "gold"),
    ("ORD-2", Decimal("42.00"), 1, "glod"),
    ("ORD-3", Decimal("75.00"), 1, "gold"),
]
results, errors = process_orders(orders)
print("results:", results)
print("errors:", errors)
```

A real typo was deliberately introduced above —
`calculate_order_totl`, missing its final `a` — the kind of mistake
that's easy to make and, with a bare `except:` in place, impossible to
notice from this function's own output:

```text
results: []
errors: [('ORD-1', 'unknown error'), ('ORD-2', 'unknown error'), ('ORD-3', 'unknown error')]
```

Every single order failed — including two perfectly valid ones — and
the error list gives no hint why: `NameError: name
'calculate_order_totl' is not defined` was raised for every order, and
the bare `except:` caught and discarded all three, replacing a real,
diagnosable bug with the identical, useless `"unknown error"` a genuine
invalid tier would have produced. This is the exact failure this
lesson's own second unit exists to prevent: a broad `except` doesn't
just risk hiding rare edge cases — it makes an obvious, total, function-
breaking bug look identical to ordinary, expected user error. Restore
`except ValueError:` and the correct spelling of `calculate_order_total`
before moving on.

## Exercises

1. `calculate_subtotal` currently has no validation at all — it will
   happily sum a list containing a `None`, raising a confusing
   `TypeError` deep inside the loop rather than a clear message naming
   what was wrong. Add a check that raises a `ValueError` naming the
   specific invalid line amount, and write one test case that triggers
   it.
2. `process_orders`'s own `errors` list currently stores plain
   `(order_id, message)` tuples. Rewrite it to store a specific,
   importable exception type instead — for example, a class named
   `InvalidLoyaltyTierError` that inherits from `ValueError` and adds no
   new behavior beyond a distinct name — and explain, in your own
   words, one real scenario where a caller further up the stack would
   benefit from being able to catch `InvalidLoyaltyTierError`
   specifically, rather than catching `ValueError` and having to
   inspect its message string to know what kind of validation failure
   actually happened.
3. This lesson's own "What Breaks Without This" section showed a bare
   `except:` swallowing a `NameError` caused by a typo. Write down, from
   memory, the name of at least one other built-in Python exception
   type — not `ValueError`, not `NameError` — that a bare `except:`
   would also silently swallow, and describe a real situation where
   raising it would be the correct behavior, not a bug.

## Definition of Done

- [ ] You can explain, in your own words, the specific difference
      between this lesson's `"glod"` bug and Lesson 93's own
      nested-conditional bug — both silently produced a wrong gold-tier
      total, but for entirely different reasons.
- [ ] You can state why `process_orders` catches `ValueError`
      specifically instead of `Exception`, using this lesson's own
      "What Breaks Without This" demonstration as your evidence, not
      just a rule you're repeating.
- [ ] You can name, from memory, what happens to the rest of a `try`
      block's code the instant a `raise` statement runs inside it.
- [ ] You've completed all three exercises.
- [ ] `pricing.py` matches this lesson's own final "Updated Project"
      state, and running it reproduces this lesson's own final "Run It"
      output exactly.
- [ ] Commit the file with a message explaining why the change was
      made — e.g. `git commit -m "Reject unrecognized loyalty tiers
      with a specific ValueError; add process_orders to handle batch
      failures without crashing the whole batch"` — not
      `git commit -m "add error handling"`, which doesn't tell a future
      reader which specific silent failure this change closes.

Lesson 98, Failure Semantics, is next.
