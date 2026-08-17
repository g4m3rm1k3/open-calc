# Lesson 101: Configuration

**What you will build.** Continuing `pricing.py` from Lesson 100's
final state: `GOLD_TIER_DISCOUNT_RATE` becomes overridable through an
environment variable, read once at module load and converted to the
correct type immediately — and a new `describe_gold_tier_benefit`
function demonstrates, with a real, reproduced bug, what happens when a
second piece of code reads the same environment variable independently
instead of reusing the value that was already loaded. Transferable
problem: making a value configurable is not the same as making it
*safely* configurable — an environment variable is always a string, and
reading the same one in more than one place is an invitation for two
readings to quietly disagree.

**What you need to know first.** Lessons 93 through 100 — this lesson
continues the identical `pricing.py` file. Domain 5's Lesson 66
(Configuration vs Code) — that lesson taught the architectural
decision of whether a behavior belongs in code or in a config file, at
the scale of an entire feature (a fraud-spike payment-method disable).
This lesson works one level down: given a value that's already been
decided to be configurable, how does the code that reads it actually do
so safely.

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
order forward: this lesson asks what happens to that order's own
discount the moment the discount rate itself stops being a fixed number
in the source code and becomes something an operator can change without
a redeploy.

**Terms used in this lesson.**

- **Configuration** — a value that controls a program's behavior but is
  supplied from outside the program's own source code — an environment
  variable, a config file, a command-line flag — so that behavior can
  change between deployments or environments without changing and
  redeploying the code itself.
- **Environment variable** — a named value set in the operating
  environment a program runs in, read by the program at runtime; it
  exists as one of the simplest mechanisms for supplying configuration,
  widely supported across languages and deployment platforms with no
  extra tooling required.
- **Type coercion** — converting a value from one type to another,
  explicitly; it matters specifically for configuration because every
  environment variable's own value arrives as a plain string, regardless
  of what type the program actually needs it to be.
- **Configuration drift** — two or more places in a codebase that are
  each supposed to represent the identical configured value, silently
  disagreeing, because each one reads or defaults independently instead
  of sharing one single source; it's dangerous specifically because
  nothing crashes when it happens — both readings look individually
  correct, and only compiling them side by side reveals the mismatch.

**Objects and methods used.**

- **`os.environ`** (from Python's standard library `os` module) —
  *What it is:* a dictionary-like object representing the current
  process's own environment variables.
  *Implementation:* supports `.get(key, default)`, returning the
  environment variable named `key` if it's set, or `default` if it's
  not — every value it returns, when the key exists, is a `str`, with
  no exception; there is no separate `os.environ.get_int(...)` or
  similar type-specific accessor.
  *Its use:* `pricing.py` reads `GOLD_TIER_DISCOUNT_RATE` from
  `os.environ` specifically so an operator can override the gold-tier
  discount rate for a specific deployment — a promotional period, an
  A/B test — without editing or redeploying this file.

---

## Concept Unit: Reading Configuration With the Correct Type

### The Problem

`GOLD_TIER_DISCOUNT_RATE` is currently a fixed `Decimal("0.95")`,
hardcoded directly in `pricing.py`'s own source. Changing it for any
reason — a promotional period, a controlled experiment comparing two
different rates — requires editing this file and redeploying it. The
order-processing service wants this specific value configurable through
an environment variable instead, so an operator can change it without
touching code at all. The naive way to read it —
`os.environ.get("GOLD_TIER_DISCOUNT_RATE", Decimal("0.95"))` — looks
reasonable and is subtly broken: `os.environ.get` always returns either
a `str` (if the variable is set) or exactly whatever default was
passed in (if it's not) — meaning the type of the result silently
depends on whether the environment variable happens to be set at all.

### Isolating the Concept: Environment Variables Are Always Strings

Isolate this on a small, unrelated example — reading a `MAX_RETRIES`
setting:

```python
import os

os.environ["MAX_RETRIES"] = "5"

max_retries_unset_default = os.environ.get("MAX_RETRIES_UNSET", 3)
print(f"unset var, int default: value={max_retries_unset_default!r} type={type(max_retries_unset_default).__name__}")

max_retries_broken = os.environ.get("MAX_RETRIES", 3)
print(f"set var 'MAX_RETRIES'=5, int default: value={max_retries_broken!r} type={type(max_retries_broken).__name__}")
```

Running this produces:

```text
unset var, int default: value=3 type=int
set var 'MAX_RETRIES'=5, int default: value='5' type=str
```

The exact same call, `os.environ.get(name, 3)`, returns an `int` when
the variable is unset (because the `int` default, `3`, is returned
untouched) and a `str` when it's set (because every environment
variable's value is a string, with no automatic conversion). Comparing
the two:

```python
try:
    if max_retries_broken > 3:
        print("this comparison worked")
except TypeError as e:
    print(f"TypeError: {e}")
```

Running this produces:

```text
TypeError: '>' not supported between instances of 'str' and 'int'
```

`'5' > 3` genuinely fails in Python — a `str` and an `int` can't be
compared with `>` at all — which means this specific bug doesn't even
wait for a wrong answer; it crashes the moment the variable is set to
anything, in code that ran perfectly fine in every test where the
variable happened to be unset. The fix: convert explicitly, and use a
string default so the type is identical either way:

```python
max_retries_fixed = int(os.environ.get("MAX_RETRIES", "3"))
print(f"fixed, set: value={max_retries_fixed!r} type={type(max_retries_fixed).__name__}")
```

Running this, and the same call with the variable unset, produces:

```text
fixed, set: value=5 type=int
fixed, unset: value=3 type=int
```

Both cases now return an `int`, regardless of whether the environment
variable was set — `int(...)` wraps the entire expression, converting
either the real string value or the string default the identical way.
This is **type coercion**: explicitly converting a value from the type
it arrived in (always `str`, for an environment variable) to the type
the program actually needs.

This throwaway example is discarded now — every line involving
`MAX_RETRIES` exists only to demonstrate the coercion gotcha and will
not appear in the pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`, exactly as Lesson 100 left it. **Files
affected:** `pricing.py`, modified. **Change type:** replace
`GOLD_TIER_DISCOUNT_RATE`'s hardcoded value with one read from an
environment variable, converted to `Decimal` immediately. **Location:**
the constants block, where `GOLD_TIER_DISCOUNT_RATE` is already
declared. **Dependencies:** Python's standard library `os` module,
imported at the top of the file alongside the existing `decimal`
import.

### The New Code

```python
import os
```

And the changed constant declaration:

```python
GOLD_TIER_DISCOUNT_RATE = Decimal(os.environ.get("GOLD_TIER_DISCOUNT_RATE", "0.95"))
```

### The Updated Project

`pricing.py`'s import block and constants, in full, after this unit's
change (the complete file appears in this lesson's own final "Updated
Project," after both units):

```python
import os                                                                        # ← new
from decimal import Decimal

BULK_DISCOUNT_THRESHOLD = Decimal("100.00")
BULK_DISCOUNT_RATE = Decimal("0.9")
GOLD_TIER_DISCOUNT_RATE = Decimal(os.environ.get("GOLD_TIER_DISCOUNT_RATE", "0.95"))  # ← new
FREE_SHIPPING_THRESHOLD = Decimal("50.00")
STANDARD_SHIPPING_FEE = Decimal("5.99")
BULK_HANDLING_ITEM_THRESHOLD = 10
BULK_HANDLING_FEE = Decimal("2.50")
VALID_LOYALTY_TIERS = frozenset({"standard", "gold"})
```

`GOLD_TIER_DISCOUNT_RATE` is now read once, when the module first
loads, either from an environment variable named
`GOLD_TIER_DISCOUNT_RATE` or from the string default `"0.95"` — and
either way, `Decimal(...)` wraps the entire result, guaranteeing the
constant is always a `Decimal`, never a `str`, regardless of which
branch of `os.environ.get` actually supplied the value.

### Mechanical Walkthrough

- **`import os`** — a new import, added because this unit's code calls
  `os.environ.get`, which lives in the standard library `os` module,
  not automatically available without importing it.
- **`os.environ.get("GOLD_TIER_DISCOUNT_RATE", "0.95")`** — a
  dictionary-style `.get()` call against `os.environ`; returns the
  string value of the `GOLD_TIER_DISCOUNT_RATE` environment variable if
  it's set in the current process's environment, or the literal string
  `"0.95"` if it's not. The default here is deliberately the *string*
  `"0.95"`, not the `Decimal` `Decimal("0.95")`, so both branches of
  this call return the identical type — a `str` — before the next step
  converts either one.
  `Decimal(...)`** — wraps the entire `os.environ.get(...)` call, so
  its own result — whichever branch produced it — is always converted
  to a `Decimal` before being assigned to `GOLD_TIER_DISCOUNT_RATE`.
  Because this line runs once, at module import time, the conversion
  happens exactly once per process, not on every call to a function
  that uses `GOLD_TIER_DISCOUNT_RATE`.

### CS Lens

Reading a value once at startup and converting it immediately to the
type the rest of the program expects is the same discipline as a
**parser's own lexical analysis phase**, converting raw source text
into typed tokens before anything downstream ever has to reason about
raw characters again — every later stage of the pipeline this
curriculum established back in Lesson 12 trusts that conversion already
happened, the same way every function in `pricing.py` downstream of
this one line trusts `GOLD_TIER_DISCOUNT_RATE` is already a real
`Decimal`.

```
Also recognized in: a web framework parsing a URL's own query string
parameters — always strings on the wire — into typed values (an int
page number, a bool flag) once, at the request boundary, a config file
loader converting a YAML file's own "true"/"false" text into real
booleans instead of leaving every consumer to re-parse the string, and
a CLI argument parser (like Python's own argparse) converting a
command-line flag's raw text into an int or float via its own type=
parameter, once, at parse time
```

### SE Lens

The alternative not chosen is reading `GOLD_TIER_DISCOUNT_RATE` as a
`Decimal`-typed default directly —
`os.environ.get("GOLD_TIER_DISCOUNT_RATE", Decimal("0.95"))` — which
looks more direct and avoids an extra `Decimal(...)` wrapper around the
whole expression. This unit's own isolated lab already proved exactly
why that's the wrong choice: the type of the result would then depend
on whether the environment variable happens to be set, which is exactly
the kind of inconsistency that passes every test run in an environment
where the variable is never set, and fails — sometimes with a crash,
sometimes with a silently wrong comparison — the moment it's actually
used the way it was built for. The cost of the safer version: a reader
has to notice that the default `"0.95"` is a string, not a `Decimal`,
and understand that the surrounding `Decimal(...)` call is what fixes
the type on both paths — a small amount of extra care required to read
correctly, purchased in exchange for a guarantee that holds regardless
of whether this specific environment variable is ever actually set in
any given deployment.

### Commands Needed

Setting an environment variable before running the script, to see the
override take effect — the exact syntax depends on the shell, shown
here for a POSIX shell:

```bash
GOLD_TIER_DISCOUNT_RATE=0.80 python pricing.py
```

`GOLD_TIER_DISCOUNT_RATE=0.80` sets the environment variable for the
duration of the `python pricing.py` command only, without permanently
changing the shell's own environment; `python pricing.py` then runs
with that variable visible to `os.environ.get` inside the script.

### Run It

The script's own gold-tier case, run twice — once with no environment
variable set, once with `GOLD_TIER_DISCOUNT_RATE` overridden to `0.80`:

```python
print("GOLD_TIER_DISCOUNT_RATE:", GOLD_TIER_DISCOUNT_RATE)
print(calculate_order_total(subtotal=Decimal("42.00"), item_count=1, loyalty_tier="gold"))
```

Running `python pricing.py` with no environment variable set produces:

```text
GOLD_TIER_DISCOUNT_RATE: 0.95
45.8900
```

Running `GOLD_TIER_DISCOUNT_RATE=0.80 python pricing.py` produces:

```text
GOLD_TIER_DISCOUNT_RATE: 0.80
44.8000
```

The default run matches every prior lesson's own `45.89` for this
case, unchanged. The overridden run applies an 80% rate instead of 95%
— a smaller discount, chosen entirely from outside the source code,
with no edit to `pricing.py` itself required to produce it.

### Connecting Back

`GOLD_TIER_DISCOUNT_RATE` is now safely configurable from outside the
code — but nothing yet stops a second piece of code from reading the
same environment variable independently, with its own separately
guessed default, which is exactly the risk the next unit demonstrates.

---

## Concept Unit: Load Once, Reuse — Never Re-Read the Same Setting Twice

### The Problem

Marketing wants a small helper, `describe_gold_tier_benefit`, that
generates a sentence stating the current gold-tier discount percentage
for use in promotional emails. A developer, not thinking to reuse the
`GOLD_TIER_DISCOUNT_RATE` constant already loaded at the top of the
file, writes it to read the same environment variable itself, with its
own separately-typed-out default. Both pieces of code look correct in
isolation. The moment anyone changes one default without remembering to
change the other, they silently stop agreeing — a promotional email
could describe a completely different discount than the one actually
applied at checkout, in the same deployment, at the same moment.

### Isolating the Concept: Configuration Drift Between Two Independent Reads

This unit's own concept doesn't need a fresh isolated lab — it's the
identical shape as Lesson 100's second unit ("Validate at the Boundary,
Trust Internally"), applied to configuration instead of input
validation: a value determined once, at one place, should be trusted
and reused everywhere else it's needed, rather than independently
re-derived at every point that needs it. The risk here is sharper than
Lesson 100's own, because the two independent reads aren't just
wasted work — they can produce two different values if their defaults
ever drift out of sync, which no test that only checks one of them in
isolation would ever catch.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`. **Files affected:** `pricing.py`,
modified — a new function, `describe_gold_tier_benefit`, added. **Change
type:** add. **Location:** below `apply_gold_tier_discount`.
**Dependencies:** `GOLD_TIER_DISCOUNT_RATE`, already loaded at module
level by this lesson's own first unit.

Here is the version that carries the exact drift risk this unit's own
problem describes — imagine a future edit changed
`GOLD_TIER_DISCOUNT_RATE`'s own default from `"0.95"` to `"0.90"`
(perhaps the business decided the standing discount should be more
generous), but this second function's own independently-typed default
was never updated to match:

```python
def describe_gold_tier_benefit_broken():
    rate = Decimal(os.environ.get("GOLD_TIER_DISCOUNT_RATE", "0.95"))
    discount_percent = (Decimal("1") - rate) * 100
    return f"Gold-tier members save {discount_percent}% on every order."
```

With `GOLD_TIER_DISCOUNT_RATE`'s own module-level default already
changed to `"0.90"` by this lesson's own first unit's imagined future
edit, calling both:

```python
print("module constant GOLD_TIER_DISCOUNT_RATE:", GOLD_TIER_DISCOUNT_RATE)
print(describe_gold_tier_benefit_broken())
```

produces:

```text
module constant GOLD_TIER_DISCOUNT_RATE: 0.90
Gold-tier members save 5.00% on every order.
```

The module's own real, applied rate is `0.90` — a 10% discount — but
`describe_gold_tier_benefit_broken`'s own separately-defaulted `"0.95"`
reports `5.00%`, computed from a rate that isn't the one actually
charged. Nothing crashed. Nothing looked wrong in either function read
on its own. The two numbers simply disagree, silently, because each one
was allowed to decide its own default independently.

### The New Code

```python
def describe_gold_tier_benefit():
    discount_percent = (Decimal("1") - GOLD_TIER_DISCOUNT_RATE) * 100
    return f"Gold-tier members save {discount_percent}% on every order."
```

### The Updated Project

`pricing.py`, in full, after both of this lesson's units — the final
state this lesson leaves the file in:

```python
import os
from decimal import Decimal

BULK_DISCOUNT_THRESHOLD = Decimal("100.00")
BULK_DISCOUNT_RATE = Decimal("0.9")
GOLD_TIER_DISCOUNT_RATE = Decimal(os.environ.get("GOLD_TIER_DISCOUNT_RATE", "0.95"))
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


def describe_gold_tier_benefit():                                             # ← new
    discount_percent = (Decimal("1") - GOLD_TIER_DISCOUNT_RATE) * 100           # ← new
    return f"Gold-tier members save {discount_percent}% on every order."          # ← new


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

`describe_gold_tier_benefit` now derives its own percentage directly
from the same `GOLD_TIER_DISCOUNT_RATE` every pricing calculation in
this file already uses — there is no second place left in this file
where `"0.95"`, or any other default, could silently drift out of sync
with the rate actually being charged.

### Mechanical Walkthrough

- **`def describe_gold_tier_benefit():`** — takes no parameters at
  all; unlike `describe_gold_tier_benefit_broken`, it has no default
  value of its own to keep in sync with anything, because it reads
  nothing independently.
- **`(Decimal("1") - GOLD_TIER_DISCOUNT_RATE) * 100`** — a `Decimal`
  subtraction, then a multiplication; `GOLD_TIER_DISCOUNT_RATE` is
  read directly from module scope, the identical object every other
  function in this file already reads, guaranteeing this calculation
  and `apply_gold_tier_discount`'s own multiplication are always
  working from the same underlying number.
- **`f"Gold-tier members save {discount_percent}% on every order."`** —
  unchanged in shape from every earlier lesson's own f-string
  formatting.

### CS Lens

Reusing one already-computed value everywhere it's needed, instead of
letting each consumer independently re-derive its own copy, is the
identical principle behind a **single source of truth** in database
design: a fact stored in exactly one place, with every other part of
the system referencing that one place rather than keeping its own
separate copy that has to be kept manually in sync. `GOLD_TIER_
DISCOUNT_RATE`, read once at module load, is this file's own single
source of truth for the gold-tier rate; `describe_gold_tier_benefit_
broken`'s own independent read was a second, unsynchronized copy of the
identical fact — the database equivalent of **denormalization**
introduced by accident, with none of denormalization's usual
justification (performance) and all of its usual risk (drift).

```
Also recognized in: a build system reading a project's own version
number from one file and stamping it into every artifact, instead of
each artifact hardcoding its own copy, a microservice architecture's
own config service (this domain's own Lesson 66, revisited) serving one
authoritative value to every consumer instead of each service reading
its own local file, and a spreadsheet formula referencing another
cell's own computed value instead of retyping that cell's formula a
second time
```

### SE Lens

The alternative not chosen — `describe_gold_tier_benefit_broken`'s own
approach — looks, on its own, like reasonable defensive programming:
"this function doesn't depend on any other function in the file, it's
fully self-contained." That instinct is exactly backwards for a
configured value: self-containment here doesn't remove a dependency, it
duplicates one, silently, in a form nothing forces to stay
synchronized. The real cost this unit's fix accepts:
`describe_gold_tier_benefit` can no longer be understood, or tested, in
complete isolation from the rest of the file — it depends on module-
level state (`GOLD_TIER_DISCOUNT_RATE`) that has to already be
correctly loaded before this function is called, which is a real,
if small, coupling cost, paid deliberately in exchange for the
guarantee that this file can never describe a discount it doesn't
actually apply.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing.py
```

### Run It

`describe_gold_tier_benefit`, run against both the default rate and an
overridden one:

```python
print(describe_gold_tier_benefit())
```

Running `python pricing.py` with no environment variable set produces:

```text
Gold-tier members save 5.0% on every order.
```

Running `GOLD_TIER_DISCOUNT_RATE=0.80 python pricing.py` produces:

```text
Gold-tier members save 20.0% on every order.
```

Both percentages are computed directly from the identical
`GOLD_TIER_DISCOUNT_RATE` that `apply_gold_tier_discount` itself uses
to compute a real order's total — there is no way for these two numbers
to disagree, because there is only one number, read once, that both of
them share.

### Connecting Back

`pricing.py` now loads its one configurable value safely — converted
to the correct type, exactly once — and every piece of this file that
needs that value reads the identical, already-loaded constant instead
of re-deriving its own copy — the same four business rules this domain
has carried since Lesson 93, now adjustable from outside the source
code without any risk of two parts of the file silently disagreeing
about what's actually configured.

## Connect the Pieces

This lesson's own gold-tier, $42.00 case, traced through both units:
the first unit replaced `GOLD_TIER_DISCOUNT_RATE`'s hardcoded
`Decimal("0.95")` with a value read from an environment variable,
converted to `Decimal` immediately regardless of whether the variable
was set — proving, with two real runs, that the default path produces
the identical `45.89` this domain has verified since Lesson 93, and
that setting `GOLD_TIER_DISCOUNT_RATE=0.80` in the environment changes
that total to `44.80` with no code edit at all. The second unit then
showed what happens when a second function reads that same environment
variable independently: a real, reproduced scenario where
`describe_gold_tier_benefit_broken`'s own separately-typed default
silently disagreed with the rate actually being applied, reporting
`5.00%` savings when the real, active rate was `10%` — fixed by having
`describe_gold_tier_benefit` reuse the identical, already-loaded
`GOLD_TIER_DISCOUNT_RATE` constant instead of reading the environment a
second time. Same four business rules, same correct total for every
case this domain has tracked since Lesson 93, and one configurable
value that can now change freely between deployments without ever
letting two parts of this file quietly stop agreeing about what that
value actually is.

## What Breaks Without This

Reintroduce `describe_gold_tier_benefit_broken`'s own independent
environment read, this time with the *opposite* drift — imagine
`GOLD_TIER_DISCOUNT_RATE`'s own default was correctly updated to
`"0.90"` at some point, but a hurried edit to
`describe_gold_tier_benefit_broken` copied the *old* default,
`"0.95"`, by hand, from an outdated code review comment instead of the
current source:

```python
def describe_gold_tier_benefit_broken():
    rate = Decimal(os.environ.get("GOLD_TIER_DISCOUNT_RATE", "0.95"))
    discount_percent = (Decimal("1") - rate) * 100
    return f"Gold-tier members save {discount_percent}% on every order."


print("real rate applied at checkout:", GOLD_TIER_DISCOUNT_RATE)
print("marketing email claims:", describe_gold_tier_benefit_broken())
```

With no environment variable set (`GOLD_TIER_DISCOUNT_RATE`'s own
module-level default already at `"0.90"`), running this produces:

```text
real rate applied at checkout: 0.90
marketing email claims: Gold-tier members save 5.00% on every order.
```

A customer's actual receipt reflects a 10% gold-tier discount; the
marketing copy generated by the very same codebase, at the very same
moment, claims 5% — a real, customer-visible discrepancy, caused by
nothing more than two defaults that were each typed out by hand, in two
different places, and never mechanically forced to agree. Restore
`describe_gold_tier_benefit`'s own version, reading
`GOLD_TIER_DISCOUNT_RATE` directly, before moving on.

## Exercises

1. `BULK_DISCOUNT_RATE` is still a hardcoded `Decimal("0.9")`, not
   configurable through an environment variable the way
   `GOLD_TIER_DISCOUNT_RATE` now is. Make it configurable, following
   this lesson's own exact pattern — a string default, wrapped in
   `Decimal(...)` — and confirm with a real run that the default,
   unset case still produces every total this domain has verified
   since Lesson 93.
2. `Decimal(os.environ.get("GOLD_TIER_DISCOUNT_RATE", "0.95"))` will
   raise a confusing `decimal.InvalidOperation` error if someone sets
   the environment variable to a non-numeric string, like
   `GOLD_TIER_DISCOUNT_RATE=fifty-percent`. Using Lesson 97's own
   discipline, wrap this line to catch that specific failure and raise
   a clearer `ValueError` naming exactly what was wrong.
3. Write down, in your own words, one real argument for *not* making
   `BULK_DISCOUNT_THRESHOLD` configurable through an environment
   variable, even though this lesson's own pattern would make it easy
   to do — using Domain 5's own Lesson 66 (Configuration vs Code) as
   your standard for what should and shouldn't be pulled out of code in
   the first place.

## Definition of Done

- [ ] You can explain, using this lesson's own real `TypeError`, why
      `os.environ.get(name, 3)` is a genuinely different — and more
      dangerous — mistake than `os.environ.get(name, "3")` without the
      surrounding `int(...)` or `Decimal(...)` conversion.
- [ ] You can state what configuration drift is, in your own words,
      using `describe_gold_tier_benefit_broken`'s own real,
      reproduced mismatch as your example.
- [ ] You can name, from memory, why `GOLD_TIER_DISCOUNT_RATE` is read
      exactly once, at module load, rather than being re-read inside
      every function that uses it.
- [ ] You've completed all three exercises.
- [ ] `pricing.py` matches this lesson's own final "Updated Project"
      state, and running it — both with and without
      `GOLD_TIER_DISCOUNT_RATE` set in the environment — reproduces
      this lesson's own final "Run It" output exactly.
- [ ] Commit the file with a message explaining why the change was
      made — e.g. `git commit -m "Make GOLD_TIER_DISCOUNT_RATE
      configurable via environment variable; ensure every consumer
      reads the same loaded value instead of re-deriving its own"` —
      not `git commit -m "add config support"`, which names neither
      the specific value nor the specific drift risk this change
      closes.

Lesson 102, Code Organization, is next.
