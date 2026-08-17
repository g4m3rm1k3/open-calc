# Lesson 94: Naming

**What you will build.** Continuing `pricing.py` from Lesson 93's final
state: renaming `calc_order_total`'s cryptic single-letter parameters
and locals into intention-revealing names, establishing one consistent
vocabulary between `calculate_order_total` and a new receipt-formatting
helper that calls it, and fixing the function's own name to spell out
"calculate" instead of abbreviating it to "calc." Transferable problem:
a name is not decoration on top of working code — it's the entire
interface between a reader's mental model and what the code actually
does, and every rename in this lesson costs nothing at runtime while
changing how expensive the file is to understand correctly.

**What you need to know first.** Lesson 93 (Readable Code) — this
lesson continues the identical `pricing.py` file from exactly where
that one left it. Domain 4's closing lesson (Domain Language) —
"ubiquitous language," reused here at the scale of one file's own
vocabulary instead of an entire domain's.

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

Still the **Implementation** stage, same as Lesson 93. Carrying the
same concrete value forward: a gold-tier customer with a $42.00
subtotal and one item. Every earlier stage — Problem, Requirements,
Domain model, Specification, Architecture — is unchanged from Lesson
93's own account of it; nothing about *what* this system does moves in
this lesson, only how legible the Implementation stage's own code is to
a reader who wasn't there when it was written.

**Terms used in this lesson.**

- **Intention-revealing name** — an identifier whose name states what
  it holds or does clearly enough that a reader doesn't need to read
  the surrounding code to know; it exists because a name is read far
  more times than it's written, and a reader pays the cost of a bad
  name every single time they meet it, not just once.
- **Ubiquitous language** (reused from Domain 4's closing lesson) —
  using the exact same word for the exact same concept everywhere it
  appears in a codebase, rather than switching between synonyms
  depending on which file happens to be open; it exists because two
  different words for the same thing force a reader to first verify
  they actually mean the same thing before trusting anything else about
  the code.
- **Abbreviation, as a naming anti-pattern** — shortening a name to
  save the person typing it keystrokes, at the cost of every future
  reader having to already know the shorthand or guess at it; it's a
  problem specifically because the cost and the benefit land on two
  different people — the writer saves seconds once, every reader after
  them pays repeatedly.
- **Searchability** — how reliably a name can be found with a plain
  text search across a codebase; it exists because a single letter or
  an extremely common short word returns so many unrelated matches that
  searching for it is useless, while a specific, multi-word name
  returns almost nothing but its real uses.

**Objects and methods used.**

- **`Decimal`** (from Python's standard library `decimal` module) —
  *What it is:* an immutable numeric type built for exact base-10
  arithmetic, as opposed to `float`'s binary floating-point
  representation.
  *Implementation:* constructed as `Decimal(value)`, where `value` is a
  string, integer, or another `Decimal` — never a `float`. Supports the
  ordinary arithmetic operators (`+`, `-`, `*`, `/`) and comparisons
  (`>`, `>=`, `==`) directly, returning new `Decimal` values, since it's
  immutable.
  *Its use:* unchanged from Lesson 93 — every dollar amount in
  `pricing.py` is a `Decimal`, so this lesson's renames can be verified
  against exact values rather than values that might differ by an
  invisible rounding error depending on which name was used to compute
  them.

---

## Concept Unit: Intention-Revealing Names Replace Cryptic Ones

### The Problem

The pricing function this domain built in Lesson 93 is flat, its magic
numbers are named, and its two genuinely non-obvious rules are
explained in comments — but its own signature still reads
`calc_order_total(s, n, t)`, and its body still assigns to `d`, `sh`,
and `bf`. A reader who has never seen this file's business rules before
has no way to know, from the signature alone, that `s` is a subtotal,
`n` is an item count, or `t` is a loyalty tier — nor that `d` holds a
discounted subtotal, `sh` holds a shipping fee, or `bf` holds a
bulk-handling fee. Every one of Lesson 93's own three units had to
spell these meanings out in prose, in comments and in a Mechanical
Walkthrough, precisely because the identifiers themselves never did.

### Isolating the Concept: Intention-Revealing Name

Isolate this on a small, unrelated example — converting a Celsius
temperature to Fahrenheit:

```python
def f(x):
    return x * 9 / 5 + 32
```

`f` and `x` reveal nothing: a reader has to already know this formula
by sight to recognize what it computes, and the name `f` gives no clue
at all — it could just as easily be a different formula entirely. Here
is the identical computation with intention-revealing names:

```python
def celsius_to_fahrenheit(celsius):
    return celsius * 9 / 5 + 32
```

Run both against a few temperatures:

```python
for c in [0, 37, 100]:
    a = f(c)
    b = celsius_to_fahrenheit(c)
    print(f"celsius={c} -> f={a} celsius_to_fahrenheit={b} match={a == b}")
```

Running this against three temperatures produces:

```text
celsius=0 -> f=32.0 celsius_to_fahrenheit=32.0 match=True
celsius=37 -> f=98.6 celsius_to_fahrenheit=98.6 match=True
celsius=100 -> f=212.0 celsius_to_fahrenheit=212.0 match=True
```

Identical results for every temperature — renaming changed nothing
about what the function computes. `celsius_to_fahrenheit` and
`celsius` are **intention-revealing names**: a reader meeting the call
site `celsius_to_fahrenheit(37)` knows both what the function does and
what unit the argument is in, without opening the function body at all,
which `f(37)` could never tell them.

This throwaway example is discarded now — `f` and `celsius_to_fahrenheit`
exist only to demonstrate the construct in isolation and will not
appear in the pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`, exactly as Lesson 93 left it.
**Files affected:** `pricing.py`, modified. **Change type:** rename —
`calc_order_total`'s three parameters (`s`, `n`, `t`) and its three
intermediate local variables (`d`, `sh`, `bf`). **Location:** the
entire function body, every reference to each renamed identifier.
**Dependencies:** none.

`calc_order_total`, exactly as Lesson 93 left it:

```python
def calc_order_total(s, n, t):
    if s <= 0:
        return Decimal("0")

    if s > BULK_DISCOUNT_THRESHOLD:
        d = s * BULK_DISCOUNT_RATE
    else:
        d = s

    if t == "gold":
        d = d * GOLD_TIER_DISCOUNT_RATE

    if s >= FREE_SHIPPING_THRESHOLD:
        sh = Decimal("0")
    else:
        sh = STANDARD_SHIPPING_FEE

    if n > BULK_HANDLING_ITEM_THRESHOLD:
        bf = BULK_HANDLING_FEE
    else:
        bf = Decimal("0")

    total = d + sh + bf
    return total
```

Every one of `s`, `n`, `t`, `d`, `sh`, and `bf` is a single- or
double-letter name a reader has to hold a private decoder for — the
decoder this lesson's own header just had to supply in prose, because
the code never does.

### The New Code

The renamed signature and its six identifier substitutions:

```python
def calc_order_total(subtotal, item_count, loyalty_tier):
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


def calc_order_total(subtotal, item_count, loyalty_tier):        # ← new: renamed params
    if subtotal <= 0:
        return Decimal("0")

    if subtotal > BULK_DISCOUNT_THRESHOLD:
        discounted_subtotal = subtotal * BULK_DISCOUNT_RATE       # ← new: renamed local
    else:
        discounted_subtotal = subtotal

    # Marketing wants gold-tier spend to always feel cheaper, so this stacks
    # on top of the bulk discount instead of being replaced by it.
    if loyalty_tier == "gold":
        discounted_subtotal = discounted_subtotal * GOLD_TIER_DISCOUNT_RATE

    if subtotal >= FREE_SHIPPING_THRESHOLD:
        shipping_fee = Decimal("0")                                # ← new: renamed local
    else:
        shipping_fee = STANDARD_SHIPPING_FEE

    # Orders over 10 items require manual warehouse packing instead of the
    # automated line; this fee passes that extra labor cost to the customer.
    if item_count > BULK_HANDLING_ITEM_THRESHOLD:
        bulk_handling_fee = BULK_HANDLING_FEE                       # ← new: renamed local
    else:
        bulk_handling_fee = Decimal("0")

    total = discounted_subtotal + shipping_fee + bulk_handling_fee
    return total
```

The function computes the identical four rules as Lesson 93's own final
state; every parameter and intermediate value now states what it holds
in its own name, so a reader can follow `discounted_subtotal` and
`shipping_fee` accumulating into `total` without needing this lesson's
own prose to translate `d` and `sh` first.

### Mechanical Walkthrough

- **`subtotal` (was `s`)** — the function's first parameter; the name
  now states directly that this is a pre-discount dollar amount, which
  the comparisons against `BULK_DISCOUNT_THRESHOLD` and
  `FREE_SHIPPING_THRESHOLD` immediately make sense of without a reader
  needing to infer it from context.
- **`item_count` (was `n`)** — the second parameter; the name rules out
  the ambiguity `n` always carries in a function with more than one
  numeric input — is this a count, an index, a rate? — by stating
  exactly which one it is.
- **`loyalty_tier` (was `t`)** — the third parameter; the name states
  both that this is a customer property and specifically which one,
  distinguishing it from any other kind of "type" or "tag" a
  single-letter `t` could otherwise plausibly mean.
- **`discounted_subtotal` (was `d`)** — the running discounted value;
  the name states not just that it's a dollar amount but that it's the
  *post*-discount one, which matters because `subtotal` (the
  *pre*-discount one) is still in scope and still used, two lines
  later, in the shipping comparison — a single-letter `d` gave no way
  to tell these two related-but-different values apart at a glance.
- **`shipping_fee` (was `sh`)** — states directly what the value
  represents and that it's a fee, not a threshold or a rate.
- **`bulk_handling_fee` (was `bf`)** — same pattern, and specifically
  distinguishes this fee from `shipping_fee`, which `bf` alone, next to
  `sh`, made easy to transpose by accident while reading quickly.
- **`total`** — unchanged; it was already intention-revealing, sitting
  directly above a `return`, and Lesson 93's own Project Change field
  for this unit already named it as one of only two literals not
  renamed for exactly this reason.

### CS Lens

A name that reveals its own purpose is doing the same job as a
well-designed **API's own public signature**: a caller of a well-named
function or method should be able to guess its behavior correctly from
its name and parameter names alone, the same standard every well-formed
public interface is held to, whether it's a single local variable or an
entire library's own entry point.

```
Also recognized in: a database column named order_placed_at instead of
ts, a REST endpoint named /customers/{id}/orders instead of /c/{id}/o,
and a CLI flag named --dry-run instead of -n
```

Every one of those is the identical tradeoff this unit just made:
slightly more to type, in exchange for the reader — who is very often
not the writer, and very often not reading it the same day it was
written — never having to guess.

### SE Lens

The alternative not chosen is keeping short names on the argument that
they reduce visual clutter and are faster to type, especially inside a
function this short, where every identifier is visible on one screen
and arguably "obvious from context" to whoever just wrote it. The real
cost that argument ignores is exactly what Lesson 93's own opening
scenario demonstrated: a support ticket, investigated by someone who
did *not* just write this function, who has to reconstruct what `s`,
`d`, and `sh` mean from scratch before they can even start reasoning
about the actual bug. Short names are genuinely faster to write once;
long, intention-revealing names are read — by code review, by a future
maintainer, by a debugger months later — far more times than they're
written, and every one of those readings is where a short name's
one-time savings gets paid back with interest. The honest cost this
unit does carry: `discounted_subtotal` and `bulk_handling_fee` make
every line that uses them a few characters wider, and a function with
many more such values than this one risks lines so long they wrap
awkwardly — a real tension with line-level readability that a longer,
more heavily-abbreviated function might need to resolve by splitting
into smaller functions rather than by shortening names back down.

### Commands Needed

No new tooling — run the file directly, same as Lesson 93:

```bash
python pricing.py
```

### Run It

The same four cases as Lesson 93, run against the renamed function:

```text
A: subtotal=142.50 items=3 tier=gold -> total=121.83750
B: subtotal=42.00 items=1 tier=gold -> total=45.8900
C: subtotal=75.00 items=1 tier=gold -> total=71.2500
D: subtotal=250.00 items=15 tier=standard -> total=227.500
```

Identical to Lesson 93's own final output for all four cases —
renaming every parameter and local changed nothing about what the
function computes, only how much private knowledge a reader needs
before the code makes sense.

### Connecting Back

The values inside this one function now name themselves — but nothing
yet guarantees that some *other* piece of code calling into this file
uses the same words for the same concepts, which is exactly the gap the
next unit closes.

---

## Concept Unit: One Word Per Concept, Everywhere

### The Problem

`pricing.py` now has one internally consistent vocabulary:
`subtotal`, `item_count`, `loyalty_tier`. But nothing has been added to
this file yet that calls `calc_order_total` from anywhere else — and
nothing stops whoever writes that next piece of code from reaching for
different words for the identical concepts, the way a receipt-printing
helper somewhere else in this service might call the discount tier a
`customer_tier`, or the subtotal an `amount`. Two different words for
the same concept, sitting a few lines apart in the same codebase, force
a reader to stop and verify they actually mean the same thing before
trusting anything else — a cost `pricing.py`'s own internal consistency
doesn't yet protect against once a second function is added.

### Isolating the Concept: Ubiquitous Language

Isolate this on two small, unrelated functions meant to work together —
one that builds a customer record, one that greets the customer using
it:

```python
def build_customer_record_inconsistent(email):
    return {"email": email}


def send_welcome_email_inconsistent(record):
    return f"Welcome, {record['email_address']}"
```

Run them together:

```python
record = build_customer_record_inconsistent("a@example.com")
print(send_welcome_email_inconsistent(record))
```

Running this produces:

```text
KeyError: 'email_address'
```

`build_customer_record_inconsistent` stores the address under the key
`"email"`; `send_welcome_email_inconsistent` looks it up under
`"email_address"` — two different words for the identical concept,
chosen independently by whoever wrote each function, and the mismatch
only surfaces at runtime, as a crash, in whichever function runs
second. Here is the same pair of functions using one word for the
concept everywhere:

```python
def build_customer_record(email):
    return {"email": email}


def send_welcome_email(record):
    return f"Welcome, {record['email']}"
```

Running this against the same input produces:

```text
Welcome, a@example.com
```

No error, because both functions agree on the one word — `email` — for
the one concept. This shared, agreed-upon vocabulary is called
**ubiquitous language**: using the exact same word for the exact same
concept everywhere it appears, so that agreement never has to be
re-verified by the reader, or discovered by a crash.

This throwaway example is discarded now — both versions of
`build_customer_record`/`send_welcome_email` exist only to demonstrate
the concept and will not appear in the pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`. **Files affected:** `pricing.py`,
modified — a new function, `format_receipt_line`, added. **Change
type:** add. **Location:** below `calc_order_total`, at module level.
**Dependencies:** `calc_order_total`, already defined above it in the
same file.

### The New Code

A receipt-formatting helper that calls the pricing function, written
first the way an independent author, not paying attention to
`calc_order_total`'s own parameter names, might reasonably write it:

```python
def format_receipt_line(amount, qty, customer_tier):
    result = calc_order_total(amount, qty, customer_tier)
    return f"Total: ${result}"
```

This runs without error — `calc_order_total` doesn't care what its
caller's own parameters are named, only what order the arguments arrive
in — but a reader scanning both functions side by side has to notice,
unaided, that `amount` here means the same thing as `subtotal` two
functions up, that `qty` means `item_count`, and that `customer_tier`
means `loyalty_tier`. Rewritten to use the same three words `pricing.py`
already settled on:

```python
def format_receipt_line(subtotal, item_count, loyalty_tier):
    result = calc_order_total(subtotal, item_count, loyalty_tier)
    return f"Total: ${result}"
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


def calc_order_total(subtotal, item_count, loyalty_tier):
    if subtotal <= 0:
        return Decimal("0")

    if subtotal > BULK_DISCOUNT_THRESHOLD:
        discounted_subtotal = subtotal * BULK_DISCOUNT_RATE
    else:
        discounted_subtotal = subtotal

    # Marketing wants gold-tier spend to always feel cheaper, so this stacks
    # on top of the bulk discount instead of being replaced by it.
    if loyalty_tier == "gold":
        discounted_subtotal = discounted_subtotal * GOLD_TIER_DISCOUNT_RATE

    if subtotal >= FREE_SHIPPING_THRESHOLD:
        shipping_fee = Decimal("0")
    else:
        shipping_fee = STANDARD_SHIPPING_FEE

    # Orders over 10 items require manual warehouse packing instead of the
    # automated line; this fee passes that extra labor cost to the customer.
    if item_count > BULK_HANDLING_ITEM_THRESHOLD:
        bulk_handling_fee = BULK_HANDLING_FEE
    else:
        bulk_handling_fee = Decimal("0")

    total = discounted_subtotal + shipping_fee + bulk_handling_fee
    return total


def format_receipt_line(subtotal, item_count, loyalty_tier):    # ← new
    result = calc_order_total(subtotal, item_count, loyalty_tier)  # ← new
    return f"Total: ${result}"                                      # ← new
```

`format_receipt_line` now reads as an obvious, direct pass-through to
`calc_order_total` — same three words, same order — instead of
requiring a reader to mentally align two independently-invented
vocabularies before trusting that the two functions actually agree on
what they're each talking about.

### Mechanical Walkthrough

- **`def format_receipt_line(subtotal, item_count, loyalty_tier):`** —
  a new function definition, its three parameters named identically to
  `calc_order_total`'s own, by deliberate choice rather than
  coincidence.
- **`result = calc_order_total(subtotal, item_count, loyalty_tier)`** —
  a function call, passing all three parameters through positionally in
  the same order `calc_order_total` declares them. Because both
  functions use the same names, this line reads as "pass these three
  things straight through," which is literally and visibly what it
  does.
- **`return f"Total: ${result}"`** — an f-string, building a formatted
  string by substituting `result`'s value into the `{result}`
  placeholder; unrelated to this unit's own concept and unchanged by
  this refactor.

### CS Lens

One word per concept, enforced across every function that touches it,
is the identical discipline a **type system's own nominal typing**
enforces mechanically: two values of differently-named types aren't
interchangeable even if their underlying representation is identical,
specifically so that a mismatch is caught by name rather than
discovered by accident. Ubiquitous language is that same discipline
applied where no compiler can enforce it — a codebase's plain-English
vocabulary — which is exactly why it has to be a human discipline,
practiced deliberately, rather than a check any tool runs for you.

```
Also recognized in: a database schema using the same column name for a
foreign key everywhere it's referenced, an OpenAPI spec's shared schema
components reused instead of redefined per endpoint, and a design
system's own named tokens (space-md, color-danger) used identically
across every component instead of each one inventing its own name
```

### SE Lens

The alternative not chosen is letting each function's author pick
whatever local names feel natural to them, on the argument that a
parameter name is private to its own function and doesn't need to match
anything outside it — which is technically true; Python enforces
nothing here. The real cost is the one this unit's own isolated lab
demonstrated at its worst (a `KeyError`) and this unit's own project
change demonstrated at its mildest (no crash, just an unnecessary
mental translation tax on every reader): once the same concept has two
names in the same codebase, every reader has to independently verify,
every time, whether `amount` and `subtotal` really do mean the same
thing, or whether — this time — they don't. The alternative this unit
chose costs something too: enforcing one vocabulary means whoever
writes `format_receipt_line` next has to know `calc_order_total`'s own
parameter names already exist and deliberately match them, rather than
just picking names that feel natural in isolation — a small, ongoing
discipline cost, paid to avoid a much larger, compounding reading cost.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing.py
```

### Run It

Both the pricing calculation and the new receipt line, run against all
four cases:

```python
if __name__ == "__main__":
    cases = [
        ("A", Decimal("142.50"), 3, "gold"),
        ("B", Decimal("42.00"), 1, "gold"),
        ("C", Decimal("75.00"), 1, "gold"),
        ("D", Decimal("250.00"), 15, "standard"),
    ]
    for label, s, n, t in cases:
        result = calc_order_total(s, n, t)
        print(f"{label}: subtotal={s} items={n} tier={t} -> total={result}")
    for label, s, n, t in cases:
        print(f"{label}: {format_receipt_line(s, n, t)}")
```

Running `python pricing.py` produces:

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

The four `calc_order_total` results are identical to every prior run in
this lesson; the four `format_receipt_line` lines show the same numbers
again, formatted, confirming the receipt helper is a correct,
readable pass-through rather than a second, independently-drifting copy
of the pricing logic.

### Connecting Back

`pricing.py` now speaks one vocabulary throughout — but the function at
the center of it is still called `calc_order_total`, and `calc` is
exactly the kind of shorthand this domain's own vocabulary discipline
should catch next.

---

## Concept Unit: Abbreviations Cost the Reader What They Save the Writer

### The Problem

Every identifier inside `calc_order_total` now reveals its own
purpose, and `format_receipt_line` now matches its vocabulary exactly —
but the function's own name still starts with `calc`, an abbreviation
of "calculate" that saves its writer four characters, once, at the cost
of every reader either already knowing the shorthand or pausing to
expand it. `calc` is common enough to look unremarkable — which is
itself the problem: an abbreviation that looks normal is exactly the
kind that survives code review unchallenged, because "everyone knows
what `calc` means" quietly assumes every future reader shares the same
context as whoever wrote it first.

### Isolating the Concept: Abbreviation Cost

Isolate this on a small, unrelated example that computes a total with
tax:

```python
def calc(a, b, r):
    return (a + b) * r
```

`calc`, `a`, `b`, and `r` are all abbreviated — short for "calculate,"
some first argument, some second argument, and some rate — and none of
them say which. A reader has to open the function body and reason out
that `a` and `b` are being summed before a rate is applied, then guess
at what real-world quantities they represent. Here's the same
computation, spelled out:

```python
def calculate_total_with_tax(subtotal, shipping, tax_rate):
    return (subtotal + shipping) * tax_rate
```

Run both:

```python
a, b, r = 100, 5.99, 1.07
x = calc(a, b, r)
y = calculate_total_with_tax(a, b, r)
print(f"calc={x} calculate_total_with_tax={y} match={x == y}")
```

Running this produces:

```text
calc=113.4093 calculate_total_with_tax=113.4093 match=True
```

Identical results — spelling every name out in full changed nothing
about the computation. `calculate_total_with_tax` costs its writer a
few extra keystrokes, once; `calc` costs every reader who hasn't
memorized this exact function's own convention a guess, every time
they meet it.

This throwaway example is discarded now — `calc` and
`calculate_total_with_tax` exist only to demonstrate the cost of
abbreviation and will not appear in the pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`. **Files affected:** `pricing.py`,
modified. **Change type:** rename — `calc_order_total` at its
definition and at both of its call sites (inside `format_receipt_line`
and inside the `if __name__ == "__main__":` block). **Location:**
throughout the file, everywhere the name appears. **Dependencies:**
none.

### The New Code

The renamed definition:

```python
def calculate_order_total(subtotal, item_count, loyalty_tier):
    ...
```

And its call site inside `format_receipt_line`, renamed to match:

```python
def format_receipt_line(subtotal, item_count, loyalty_tier):
    result = calculate_order_total(subtotal, item_count, loyalty_tier)
    return f"Total: ${result}"
```

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


def calculate_order_total(subtotal, item_count, loyalty_tier):        # ← new: was calc_order_total
    if subtotal <= 0:
        return Decimal("0")

    if subtotal > BULK_DISCOUNT_THRESHOLD:
        discounted_subtotal = subtotal * BULK_DISCOUNT_RATE
    else:
        discounted_subtotal = subtotal

    # Marketing wants gold-tier spend to always feel cheaper, so this stacks
    # on top of the bulk discount instead of being replaced by it.
    if loyalty_tier == "gold":
        discounted_subtotal = discounted_subtotal * GOLD_TIER_DISCOUNT_RATE

    if subtotal >= FREE_SHIPPING_THRESHOLD:
        shipping_fee = Decimal("0")
    else:
        shipping_fee = STANDARD_SHIPPING_FEE

    # Orders over 10 items require manual warehouse packing instead of the
    # automated line; this fee passes that extra labor cost to the customer.
    if item_count > BULK_HANDLING_ITEM_THRESHOLD:
        bulk_handling_fee = BULK_HANDLING_FEE
    else:
        bulk_handling_fee = Decimal("0")

    total = discounted_subtotal + shipping_fee + bulk_handling_fee
    return total


def format_receipt_line(subtotal, item_count, loyalty_tier):
    result = calculate_order_total(subtotal, item_count, loyalty_tier)  # ← new: call site renamed
    return f"Total: ${result}"


if __name__ == "__main__":
    cases = [
        ("A", Decimal("142.50"), 3, "gold"),
        ("B", Decimal("42.00"), 1, "gold"),
        ("C", Decimal("75.00"), 1, "gold"),
        ("D", Decimal("250.00"), 15, "standard"),
    ]
    for label, s, n, t in cases:
        result = calculate_order_total(s, n, t)                          # ← new: call site renamed
        print(f"{label}: subtotal={s} items={n} tier={t} -> total={result}")
    for label, s, n, t in cases:
        print(f"{label}: {format_receipt_line(s, n, t)}")
```

Every rule this file computes is identical to every earlier version in
this lesson; the one remaining abbreviation in the file's own public
entry point is gone, and every call site agrees with the new name,
because a rename that misses even one call site is a `NameError`
waiting to happen the next time that line runs.

### Mechanical Walkthrough

- **`def calculate_order_total(...)` (was `calc_order_total`)** — the
  function's own definition; the full word "calculate" replaces the
  abbreviation "calc," costing four more characters at every call site
  in exchange for never requiring a reader to already know this
  particular shorthand.
- **`result = calculate_order_total(...)` inside `format_receipt_line`**
  — a call site, renamed to match the definition; Python resolves a
  function call by looking up the name in scope at the moment it runs,
  so this call site would raise `NameError: name 'calc_order_total' is
  not defined` if it were left unrenamed while the definition above it
  changed — the rename has to be applied everywhere the name is used,
  not just where it's declared.
- **`result = calculate_order_total(s, n, t)` inside the `__main__`
  block** — the second and last call site, renamed for the identical
  reason.

### CS Lens

A full, unabbreviated name that never assumes shared context is the
same discipline as **self-describing data formats** — a JSON payload
with a key literally named `"customerLoyaltyTier"` instead of `"clt"`
carries its own meaning wherever it travels, to any reader or system
that receives it, without needing a separate document decoding what
`"clt"` was supposed to mean.

```
Also recognized in: a URL path segment spelled out (/products instead of
/p), an environment variable named DATABASE_CONNECTION_TIMEOUT_SECONDS
instead of DB_TO, and a log field named request_duration_ms instead of
dur
```

Every one of those trades a few extra characters, paid once by whoever
writes the name, for zero required prior knowledge, paid never by
whoever reads it.

### SE Lens

The alternative not chosen is keeping `calc` on the argument that it's
such a common, widely-recognized abbreviation that no real reader would
be confused by it — a genuinely weaker version of the same argument
that defended `s`, `n`, `t`, `d`, `sh`, and `bf` at the start of this
lesson, but not a groundless one: `calc` really is more broadly
recognizable than a bare single letter. The real cost this unit's
rename accepts anyway is consistency: once `subtotal`, `item_count`,
`loyalty_tier`, `discounted_subtotal`, `shipping_fee`, and
`bulk_handling_fee` are all written out in full, a function still named
with a shorthand is the one remaining place in the file where a reader
has to switch back into "guess what this abbreviation means" mode — an
inconsistency that costs more, in practice, than `calc` would cost on
its own in an otherwise heavily-abbreviated file. The honest tradeoff:
this rename touched two call sites in a two-function file; the identical
rename in a service with fifty call sites across a dozen files is a
real, mechanical undertaking — still worth doing, but not free, which
is exactly why picking the right name the first time is cheaper than
renaming it later.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing.py
```

### Run It

The same eight lines of output as the previous unit — four
`calculate_order_total` results, four `format_receipt_line` lines — now
produced by the fully-renamed function:

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

Identical to the previous unit's own output — renaming the function
changed every place its name appears in the source, and nothing about
what any of those eight lines compute.

### Connecting Back

Every identifier in this file now names itself: three parameters, three
locals, one shared vocabulary between two functions, and one function
name spelled out in full — the same four business rules this domain has
carried since Lesson 93, now readable by someone who has never seen
this codebase before, without a single private decoder ring.

## Connect the Pieces

The same gold-tier, $42.00 case from this lesson's own header, traced
through all three units: Lesson 93 left `calc_order_total(s, n, t)`
computing `45.89` for that case, using names — `s`, `d`, `sh`, `bf` —
that gave no reader any way to know what any of them meant without
reading this lesson's own prose first. The first unit renamed every
parameter and local to state its own meaning — `subtotal`,
`item_count`, `loyalty_tier`, `discounted_subtotal`, `shipping_fee`,
`bulk_handling_fee` — producing the identical `45.89` under names that
no longer need a decoder. The second unit added `format_receipt_line`,
deliberately matching its own parameter names to the function it calls,
so the same value flows through two functions that visibly agree on
what they're each talking about, rather than requiring a reader to
verify two independently-invented vocabularies actually mean the same
thing. The third unit renamed `calc_order_total` itself to
`calculate_order_total`, closing the one remaining abbreviation in the
file and updating both of its call sites to match. Same four business
rules, same `45.89` for the header's own case, at every step — every
rename in this lesson was free at runtime and was never free for a
reader, which is exactly the cost this entire lesson exists to reduce.

## What Breaks Without This

Revert `format_receipt_line` to its first-draft vocabulary from this
lesson's second unit, while leaving `calculate_order_total` under its
current, correct name:

```python
def format_receipt_line(amount, qty, customer_tier):
    result = calculate_order_total(amount, qty, customer_tier)
    return f"Total: ${result}"
```

This still runs without error — Python resolves the call by argument
position, not by matching parameter names between caller and callee, so
`amount`, `qty`, and `customer_tier` reach `calculate_order_total` in
the right order regardless of what they're called locally. Nothing
crashes, and nothing about this lesson's own "Run It" output changes.
What breaks is something no test in this lesson catches: a future
reader — or a future editor using a plain-text "find every use of
`loyalty_tier`" search across this file — no longer finds this call
site at all, because it never uses that word. `loyalty_tier`'s own
**searchability**, the term defined in this lesson's own header, is
exactly what silently fails here: a rename anywhere else in this file
that's supposed to touch every place `loyalty_tier` is used will miss
this one, not because the code is wrong, but because the vocabulary
search that was supposed to find every affected line was never able to
see it. Restore the matching parameter names — `subtotal`, `item_count`,
`loyalty_tier` — before moving on.

## Exercises

1. Search this lesson's own final `pricing.py` for every place the word
   `"gold"` appears as a literal string. Decide, in your own words,
   whether `"gold"` itself needs a named constant the way `100` and
   `50` did in Lesson 93, or whether a string literal compared once, in
   one place, is different enough from a repeated numeric threshold
   that it doesn't need one — defend whichever answer you pick.
2. `discounted_subtotal` is reassigned twice — once by the bulk
   discount branch, once (conditionally) by the gold-tier check. Some
   engineers would call reusing one name for a value that changes
   partway through a function a readability problem in its own right.
   Rewrite the function using two distinctly-named intermediate values
   instead of reassigning `discounted_subtotal`, run it, confirm
   identical output, and then decide for yourself which version you
   find easier to trust at a glance.
3. Pick any function you've written recently with a parameter name
   under four characters that isn't a well-established convention like
   `i` in a short loop. Rename it to something intention-revealing and
   write one sentence on what information the old name was making a
   reader supply from outside the code.

## Definition of Done

- [ ] You can explain, in your own words, why `total` was the one
      original name in `calc_order_total` that this lesson's first unit
      chose not to rename.
- [ ] You can state what ubiquitous language means and point to the
      specific two function signatures in `pricing.py` that now
      demonstrate it.
- [ ] You can name one real, honest cost of preferring full names over
      abbreviations — not just the benefit.
- [ ] You've completed all three exercises.
- [ ] `pricing.py` matches this lesson's own final "Updated Project"
      state, and running it reproduces this lesson's own final "Run It"
      output exactly.
- [ ] Commit the file with a message explaining why the change was
      made — e.g. `git commit -m "Rename pricing.py identifiers to a
      consistent, unabbreviated vocabulary; no behavior change"` — not
      `git commit -m "cleanup names"`, which doesn't tell a future
      reader whether behavior was supposed to change or not.

Lesson 95, Function and Method Design, is next.
