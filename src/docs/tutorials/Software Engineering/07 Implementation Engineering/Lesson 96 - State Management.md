# Lesson 96: State Management

**What you will build.** Continuing `pricing.py` from Lesson 95's final
state: a new `calculate_subtotal` function that sums a real order's
individual line amounts using a local accumulator, and a
`build_order_summary` function that logs a note about each order it
processes — first written with a real, classic bug that leaks state
between unrelated calls, then fixed. Transferable problem: state — a
value that persists or changes across steps — is sometimes exactly what
a computation needs, and sometimes an accident that makes one call
silently depend on every call that happened before it; this lesson
teaches the difference between the two, concretely, with a bug that
actually reproduces.

**What you need to know first.** Lessons 93 through 95 — this lesson
continues the identical `pricing.py` file from exactly where Lesson 95
left it. Nothing else new; this domain's own vocabulary
(`calculate_order_total`, its four extracted rule functions, its
keyword-only signature) is assumed and reused without re-deriving it.

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
now expressed the way a real order actually arrives — not as one
already-known subtotal, but as three separate line amounts: $20.00,
$15.50, and $6.50, which this lesson's own first unit sums to the exact
$42.00 subtotal this domain has used as its running example since
Lesson 93.

**Terms used in this lesson.**

- **State** — a value that persists across steps of a computation,
  rather than existing only within one expression; it exists as a
  concept because some computations, like summing a list, genuinely
  require remembering something from each prior step to produce a
  correct final answer.
- **Local state** — state that lives only inside one function call, is
  created fresh every time that function runs, and disappears the
  moment it returns; it's the safe default form of state, because
  nothing outside that one call can see it, depend on it, or be
  corrupted by it.
- **Shared mutable state** — state that more than one call, or more
  than one part of a program, can see and change; it's a problem
  specifically when two things that shouldn't know about each other end
  up silently affecting each other through it.
- **Mutable default argument** — a default value for a function
  parameter that is itself a mutable object (a list, a dictionary); it
  exists as a specific, well-known trap in Python because a default
  value is created exactly once, when the function is *defined*, not
  fresh on every call — so a mutable default silently becomes shared
  state across every call that doesn't override it.

**Objects and methods used.**

- **`Decimal`** (from Python's standard library `decimal` module) —
  *What it is:* an immutable numeric type for exact base-10 arithmetic.
  *Implementation:* constructed as `Decimal(value)` from a string,
  integer, or another `Decimal`; supports `+`, `-`, `*`, `/`, and
  comparisons, each returning a new `Decimal` rather than modifying an
  existing one.
  *Its use:* `calculate_subtotal`'s own accumulator in this lesson
  depends specifically on `Decimal`'s immutability — each `+` produces
  a brand-new `Decimal`, so reassigning the accumulator variable to
  that new value, on every loop iteration, is the only way its running
  total actually changes.
- **`list`** (Python's built-in mutable sequence type) —
  *What it is:* an ordered, mutable collection of values.
  *Implementation:* created with `[]` or `list(...)`; supports
  `.append(item)`, which adds `item` to the end of the list *in place*,
  modifying the existing list object rather than returning a new one,
  and returns `None`.
  *Its use:* this lesson's second unit depends specifically on the fact
  that `.append` mutates the list it's called on instead of creating a
  new one — that's the exact mechanism the mutable-default-argument bug
  exploits.

---

## Concept Unit: Loop-Carried Local State

### The Problem

Every lesson in this domain so far has treated an order's `subtotal` as
a single value that arrives already computed. A real order doesn't
start that way — it starts as a list of individual line amounts (one
per product purchased), and something has to add them together to
produce the subtotal `calculate_order_total` has always expected as its
own input. Adding a list of amounts together requires remembering a
running sum as each amount is processed — a value that has to persist
and change across steps, which is a genuinely new kind of thing for
this file to need, not just a new function.

### Isolating the Concept: Accumulator

Isolate this on a small, unrelated example — summing a list of test
scores:

```python
def total_score(scores):
    total = 0
    for score in scores:
        total = total + score
    return total
```

Run it against a few lists:

```python
for scores in [[10, 20, 30], [5], []]:
    print(f"scores={scores} -> total={total_score(scores)}")
```

Running this against three different lists produces:

```text
scores=[10, 20, 30] -> total=60
scores=[5] -> total=5
scores=[] -> total=0
```

Trace `total_score([10, 20, 30])` step by step to see exactly how
`total` gets to `60`:

```
Iteration 1: score = 10, total 0 → 10 — the loop's first pass; total
  starts at 0 (the initial value assigned before the loop) and gains
  the first element, 10, because `total = total + score` runs once per
  element, in order.
Iteration 2: score = 20, total 10 → 30 — total already held the sum of
  everything seen so far (10); adding the second element, 20, extends
  that running sum rather than starting over, because `total` is
  reassigned, not redeclared, each pass.
Iteration 3: score = 30, total 30 → 60 — same mechanism, third and
  final element; the loop ends because the list is exhausted, and `60`
  is what `total` holds at that exact moment.
```

`total` here is called an **accumulator**: a variable that starts at a
known initial value and is reassigned once per loop iteration,
building up a final result by remembering everything processed so far.
This throwaway example is discarded now — `total_score` exists only to
demonstrate the accumulator construct and will not appear in the
pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`, exactly as Lesson 95 left it. **Files
affected:** `pricing.py`, modified. **Change type:** add — a new
function, `calculate_subtotal`, taking a list of line amounts instead
of one already-known subtotal. **Location:** below the four existing
rule functions, above `calculate_order_total`. **Dependencies:** none.

### The New Code

```python
def calculate_subtotal(order_lines):
    subtotal = Decimal("0")
    for line_amount in order_lines:
        subtotal = subtotal + line_amount
    return subtotal
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


def calculate_subtotal(order_lines):        # ← new
    subtotal = Decimal("0")                  # ← new
    for line_amount in order_lines:           # ← new
        subtotal = subtotal + line_amount      # ← new
    return subtotal                            # ← new


def calculate_order_total(*, subtotal, item_count, loyalty_tier):
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
```

`calculate_subtotal` now sits directly above `calculate_order_total`,
producing the exact value `calculate_order_total`'s own `subtotal`
parameter expects — a real order's line amounts can now flow all the
way from a list of individual purchases through to a final charged
total.

### Mechanical Walkthrough

- **`def calculate_subtotal(order_lines):`** — a new function, taking
  one parameter, a list of amounts.
- **`subtotal = Decimal("0")`** — the accumulator's initial value,
  assigned before the loop begins; `Decimal("0")` specifically, not
  Python's bare `0`, because every value it will be added to is a
  `Decimal`, and adding a `Decimal` to a bare `int` works in Python but
  would be a type mismatch worth avoiding on principle in a function
  whose whole purpose is exact currency arithmetic.
- **`for line_amount in order_lines:`** — a `for` loop, binding
  `line_amount` to each element of `order_lines` in turn, one full pass
  per element, in the order the list holds them.
- **`subtotal = subtotal + line_amount`** — the accumulator step,
  identical in shape to the isolated lab's own `total = total + score`:
  reads `subtotal`'s current value, adds the current `line_amount`, and
  reassigns the result back to `subtotal` — this is what makes it an
  accumulator rather than a fresh, unrelated calculation on every pass.
  Because `Decimal` is immutable, this line doesn't modify the old
  `Decimal` object `subtotal` used to point to; it creates an entirely
  new one and rebinds the name `subtotal` to it.
- **`return subtotal`** — runs once, after the loop finishes, returning
  whatever `subtotal` holds at that point — every line amount's
  contribution, added in.

### CS Lens

An accumulator variable, reassigned once per loop iteration to build a
final result, is the identical shape as a **fold** (also called
`reduce` in many languages): a general operation that combines every
element of a collection into one result by repeatedly applying a
combining step, carrying an accumulated value forward. `total_score`'s
own `total = total + score` and `calculate_subtotal`'s own `subtotal =
subtotal + line_amount` are both, underneath the `for` loop syntax, the
same fold — Python's own built-in `sum()` function is a fold
specialized to addition, and this lesson could have used it directly
in place of a hand-written loop.

```
Also recognized in: a running balance in an accounting ledger, a
compiler's own symbol table built up one declaration at a time while
scanning source code top to bottom, and a video game's own score
counter incrementing across every point-earning event in a play session
```

### SE Lens

The alternative not chosen here is `sum(order_lines, Decimal("0"))` —
Python's own built-in fold, which would compute the identical result in
one line instead of four. The real reason to still write the loop out
explicitly, at least once, in a lesson whose subject is state
management, is pedagogical rather than practical: `sum()` hides the
exact mechanism this lesson exists to teach — an accumulator being
reassigned once per element — behind a single function call, which is
exactly the right choice in production code once a reader already
understands what's happening inside it, and exactly the wrong choice
for a first, isolated demonstration of the concept itself. The real,
ongoing cost of the hand-written version, honestly stated: it's four
lines a future maintainer has to read and trust are correct, where
`sum(order_lines, Decimal("0"))` is one line whose correctness is
Python's own standard library's responsibility, not this file's.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing.py
```

### Run It

`calculate_subtotal`, run against this lesson's own header case — an
order made of three separate line amounts that should sum to exactly
the $42.00 this domain has used since Lesson 93:

```python
order_lines = [Decimal("20.00"), Decimal("15.50"), Decimal("6.50")]
print("calculate_subtotal:", calculate_subtotal(order_lines))
```

Running this produces:

```text
calculate_subtotal: 42.00
```

Exactly $42.00 — the same subtotal every prior lesson's case B has used
as an already-known input, now derived from three individual line
amounts instead of assumed as a given.

### Connecting Back

`calculate_subtotal` uses local state safely — its accumulator is
created fresh on every call and is invisible outside that call — but
the next unit introduces a second kind of state, this time attached
directly to a function's own signature, that isn't safe by default at
all.

---

## Concept Unit: The Mutable Default Argument Trap

### The Problem

The order-processing service wants a function that computes an order's
final total *and* keeps a running note describing what it computed, for
a debug log. A natural first attempt gives the function a `notes`
parameter defaulting to an empty list, so a caller who doesn't care
about the notes can just omit it. That default value — `[]`, written
directly in the function's own signature — turns out not to behave the
way it looks like it should.

### Isolating the Concept: Mutable Default Argument

Isolate this on a small, unrelated example — a function that tags an
item, defaulting to a fresh empty list of tags:

```python
def add_tag_broken(item, tags=[]):
    tags.append(item)
    return tags
```

Call it twice, with no `tags` argument supplied either time:

```python
result1 = add_tag_broken("first-call-item")
print(f"first call  -> {result1}")
result2 = add_tag_broken("second-call-item")
print(f"second call -> {result2}")
print(f"same list object? {result1 is result2}")
```

Running this produces:

```text
first call  -> ['first-call-item']
second call -> ['first-call-item', 'second-call-item']
same list object? True
```

The second call's result still contains the first call's item, even
though neither call passed `tags` explicitly, and even though nothing
about reading `def add_tag_broken(item, tags=[])` suggests two separate
calls could ever see each other's data. `result1 is result2` confirms
why: both calls returned the exact same list object. Python evaluates a
default value's expression exactly once, at the moment the `def`
statement itself runs, not fresh on every call — `[]` here creates one
list, that list becomes the permanent default value baked into the
function itself, and every call that doesn't override `tags` shares
that identical object. Here's the fix — default to `None`, a genuinely
immutable value, and build a fresh list inside the function body only
when needed:

```python
def add_tag_fixed(item, tags=None):
    if tags is None:
        tags = []
    tags.append(item)
    return tags
```

Running the same two calls against this version produces:

```text
first call  -> ['first-call-item']
second call -> ['second-call-item']
```

Each call now gets its own fresh list, because `tags = []` runs fresh,
inside the function body, every single time the function is called —
unlike a default value in the signature, which runs exactly once, at
definition time. This is called the **mutable default argument trap**:
using a mutable object directly as a default value, which silently
turns that default into shared state across every call that relies on
it.

This throwaway example is discarded now — both versions of
`add_tag_broken`/`add_tag_fixed` exist only to demonstrate the trap and
will not appear in the pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`. **Files affected:** `pricing.py`,
modified. **Change type:** add — a new function, `build_order_summary`,
which combines `calculate_subtotal` and `calculate_order_total` and
logs a note about the result. **Location:** below
`calculate_order_total`. **Dependencies:** `calculate_subtotal` and
`calculate_order_total`, both already defined above it in the same
file.

Here is the version that carries the exact trap this unit's isolated
lab just demonstrated — a plausible, easy-to-write first draft:

```python
def build_order_summary(order_lines, item_count, loyalty_tier, notes=[]):
    subtotal = calculate_subtotal(order_lines)
    total = calculate_order_total(
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
    notes.append(f"subtotal={subtotal} total={total}")
    return total, notes
```

Called twice, for two entirely unrelated orders, with neither call
passing its own `notes`:

```python
total1, notes1 = build_order_summary(order_lines, 1, "gold")
print("call 1 notes:", notes1)
total2, notes2 = build_order_summary(order_lines, 1, "gold")
print("call 2 notes:", notes2)
```

Running this against the broken version produces:

```text
call 1 notes: ['subtotal=42.00 total=45.8900']
call 2 notes: ['subtotal=42.00 total=45.8900', 'subtotal=42.00 total=45.8900']
```

The second, entirely separate call to `build_order_summary` returns a
notes list that already contains the first call's own note — the exact
same failure the isolated lab just proved, now happening inside this
project's own code, with two calls that have no business knowing
anything about each other silently sharing state through a list
sitting in the function's own signature.

### The New Code

```python
def build_order_summary(order_lines, item_count, loyalty_tier, notes=None):
    if notes is None:
        notes = []
    subtotal = calculate_subtotal(order_lines)
    total = calculate_order_total(
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
    notes.append(f"subtotal={subtotal} total={total}")
    return total, notes
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


def build_order_summary(order_lines, item_count, loyalty_tier, notes=None):  # ← new
    if notes is None:                                                        # ← new
        notes = []                                                            # ← new
    subtotal = calculate_subtotal(order_lines)                                 # ← new
    total = calculate_order_total(                                             # ← new
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
    notes.append(f"subtotal={subtotal} total={total}")                          # ← new
    return total, notes                                                          # ← new
```

`build_order_summary` now gives every call its own fresh `notes` list
unless a caller deliberately passes one in to accumulate notes across
several related calls on purpose — the difference between state that's
shared because a caller chose to share it, and state that was shared by
accident because of where an empty list happened to be written.

### Mechanical Walkthrough

- **`def build_order_summary(order_lines, item_count, loyalty_tier,
  notes=None):`** — four parameters; the first three positional (this
  is a new, additional function, not `calculate_order_total` itself, so
  Lesson 95's own keyword-only fix doesn't automatically apply to it —
  a real, honest scope boundary, revisited in this lesson's own
  exercises). `notes=None` is the fix: `None` is immutable, so there's
  nothing for two separate calls to accidentally share by both
  receiving the same default.
- **`if notes is None:`** — an identity check against `None`,
  specifically using `is` rather than `==`, the conventional way to
  test for `None` in Python, because `None` is a singleton — there is
  only ever one `None` object in a running program, so identity and
  equality mean the same thing here, and `is` states that intent
  explicitly.
- **`notes = []`** — runs fresh, inside the function body, every time
  this branch is reached — unlike the broken version's `tags=[]`
  sitting in the signature, this `[]` is a new expression evaluated on
  every call that needs it, creating a brand-new list each time.
- **`subtotal = calculate_subtotal(order_lines)`** — a call to this
  lesson's own first unit's function, computing the subtotal from the
  raw line amounts.
- **`total = calculate_order_total(...)`** — a call to
  `calculate_order_total`, using the keyword arguments Lesson 95's own
  unit required.
- **`notes.append(f"subtotal={subtotal} total={total}")`** — mutates
  whichever list `notes` currently refers to — the caller's own list,
  if one was passed in, or the fresh one just created, if not.
- **`return total, notes`** — returns two values as a tuple; Python
  packs `total` and `notes` together automatically when a `return`
  statement lists more than one value separated by commas.

### CS Lens

The distinction this unit's whole lab and project change turns on — a
default evaluated once at definition time versus state created fresh
per call — is the identical distinction between **static (class-level)
state and instance state** in an object-oriented language: a mutable
value attached directly to a class definition is shared by every
instance of that class, the same way Python's own mutable default
argument is shared by every call that doesn't override it, for the
identical underlying reason — the value was created once, at
definition time, not once per use.

```
Also recognized in: a web server accidentally sharing one global
database connection object across every incoming request instead of
opening one per request, a game engine's shared "default inventory"
template object silently mutated by one player's own item pickup, and
a spreadsheet's own named range pointing at literal cells instead of a
formula, so every sheet referencing it sees the same stale value
```

### SE Lens

The alternative not chosen — `notes=[]`, directly in the signature — is
genuinely the more natural-looking code to write first; nothing about
Python's own syntax visually distinguishes a default value that's safe
(`notes=None`, an immutable sentinel) from one that's dangerous
(`notes=[]`, a mutable object silently shared). That's the real reason
this trap catches experienced engineers, not just beginners: the buggy
version reads as perfectly ordinary Python, passes a casual code
review, and only fails when two calls that don't know about each other
both happen to skip the `notes` argument — exactly the scenario this
unit's own two-call demonstration reproduced. The cost of the fix is
two extra lines (`if notes is None: notes = []`) in exchange for making
this entire category of cross-call state leakage impossible, the same
kind of unconditional guarantee Lesson 93's guard clauses and Lesson
95's keyword-only parameters each bought this file, one bug class at a
time.

### Commands Needed

No new tooling — run the file directly:

```bash
python pricing.py
```

### Run It

Both versions, called twice each with no `notes` argument, to see the
leak and the fix side by side:

```python
order_lines = [Decimal("20.00"), Decimal("15.50"), Decimal("6.50")]

total1, notes1 = build_order_summary(order_lines, 1, "gold")
print("call 1 notes:", notes1)
total2, notes2 = build_order_summary(order_lines, 1, "gold")
print("call 2 notes:", notes2)
print("same list object?", notes1 is notes2)
```

Running this against the fixed version produces:

```text
call 1 notes: ['subtotal=42.00 total=45.8900']
call 2 notes: ['subtotal=42.00 total=45.8900']
same list object? False
```

Each call's own `notes` list contains exactly one entry — its own — and
`notes1 is notes2` is `False`: two calls to `build_order_summary`, with
identical arguments, now produce two independent results instead of one
call silently polluting the other's.

### Connecting Back

`pricing.py` now handles state two different ways, deliberately:
`calculate_subtotal`'s accumulator is local, safe, and disappears the
instant the function returns; `build_order_summary`'s `notes` list is
shared only when a caller explicitly chooses to share it, never by
accident — the same four business rules this domain has carried since
Lesson 93, now able to process a real, multi-line order without a
single piece of state leaking anywhere it wasn't deliberately allowed
to.

## Connect the Pieces

The same $42.00 case from this lesson's own header, now expressed as
three separate line amounts and traced through both units:
`calculate_subtotal([Decimal("20.00"), Decimal("15.50"),
Decimal("6.50")])` accumulates those three amounts, one loop iteration
at a time, into exactly `42.00` — the identical subtotal every earlier
lesson in this domain has used as case B. `build_order_summary` then
takes that same list of line amounts, along with an item count of `1`
and a `"gold"` loyalty tier, and produces `45.89` — the same final
total this domain has verified since Lesson 93 — while also appending
one note describing that computation to a `notes` list. The first unit
proved that kind of state, an accumulator local to one function call,
is safe by construction: nothing outside `calculate_subtotal` can see
or corrupt it. The second unit proved the opposite is true by default
for a mutable default argument: two unrelated calls to the broken
`build_order_summary` silently shared one `notes` list, and fixing it
required deliberately creating a fresh list inside the function body
instead of trusting a `[]` written once in the signature. Same $42.00
order, same $45.89 total, and two different kinds of state — one safe
by default, one dangerous by default — both now handled correctly and
deliberately, not by accident.

## What Breaks Without This

Revert `build_order_summary` to its broken, mutable-default-argument
form, and call it once for a "gold" order and once for an entirely
unrelated "standard" order, neither one passing `notes`:

```python
def build_order_summary(order_lines, item_count, loyalty_tier, notes=[]):
    subtotal = calculate_subtotal(order_lines)
    total = calculate_order_total(
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
    notes.append(f"subtotal={subtotal} total={total}")
    return total, notes


gold_total, gold_notes = build_order_summary(
    [Decimal("20.00"), Decimal("15.50"), Decimal("6.50")], 1, "gold"
)
standard_total, standard_notes = build_order_summary(
    [Decimal("300.00")], 1, "standard"
)
print("gold_notes:", gold_notes)
print("standard_notes:", standard_notes)
print("same list object?", gold_notes is standard_notes)
```

Running this reproduces the bug against two genuinely unrelated orders:

```text
gold_notes: ['subtotal=42.00 total=45.8900']
standard_notes: ['subtotal=42.00 total=45.8900', 'subtotal=300.00 total=270.00']
```

The `"standard"` order's own notes list contains the `"gold"` order's
note too — two customers' orders, processed independently, whose debug
notes are now permanently tangled together in the same list, for no
reason connected to either order itself. In a real debug log this is
exactly the kind of bug that's nearly impossible to reproduce
intentionally and devastating to diagnose in production, because it
depends entirely on which unrelated calls happened to run before it and
in what order — restore the `notes=None` fix before moving on.

## Exercises

1. This lesson's own Mechanical Walkthrough flagged that
   `build_order_summary`'s first three parameters are still positional,
   not keyword-only like `calculate_order_total`'s. Decide whether they
   should be, using Lesson 95's own SE Lens reasoning as your standard,
   and either make the change (updating this lesson's own two call
   sites to match) or write down a specific reason not to.
2. Rewrite `calculate_subtotal` to use Python's built-in `sum()`
   function instead of a hand-written loop — `sum(order_lines,
   Decimal("0"))` — run it against this lesson's own three-line order,
   and confirm it still produces `42.00`.
3. Write a third, deliberately broken function,
   `apply_bulk_discount_broken`, using a mutable default argument in a
   context where — unlike `notes=[]` — the mistake wouldn't actually
   cause a bug. (Hint: think about what specifically makes a mutable
   default dangerous, from this lesson's own CS Lens, and construct a
   case where that specific condition doesn't hold.) Explain, in your
   own words, why it's safe in your version but wasn't in
   `build_order_summary`'s.

## Definition of Done

- [ ] You can explain, using this lesson's own real output, why
      `result1 is result2` printed `True` for the broken version and
      `False` for the fixed one.
- [ ] You can state, from memory, exactly when Python evaluates a
      function's default argument values — once, or once per call —
      and why that answer is the entire reason this lesson's bug
      exists.
- [ ] You can name the difference between local state and shared
      mutable state in your own words, using `calculate_subtotal` and
      `build_order_summary` as your own two examples.
- [ ] You've completed all three exercises.
- [ ] `pricing.py` matches this lesson's own final "Updated Project"
      state, and running it reproduces this lesson's own final "Run It"
      output exactly.
- [ ] Commit the file with a message explaining why the change was
      made — e.g. `git commit -m "Add calculate_subtotal and
      build_order_summary; fix mutable default argument that leaked
      notes across unrelated orders"` — not
      `git commit -m "add new functions"`, which says nothing about the
      real bug this change prevents.

Lesson 97, Error Handling, is next.
