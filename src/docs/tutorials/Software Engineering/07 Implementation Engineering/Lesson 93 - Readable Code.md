# Lesson 93: Readable Code

**What you will build.** A single pricing function — `calc_order_total`,
computing a customer's final charged total from their subtotal, item
count, and loyalty tier — carried through three passes of refactoring:
replacing nested conditionals with guard clauses, replacing magic
numbers with named constants, and replacing comments that restate code
with comments that explain a real business reason. None of the three
passes change what the function is supposed to compute. The
transferable problem: readability is not a matter of taste or
aesthetics — it is a measurable property of how much a reader has to
hold in their head at once to verify that code is correct, and this
lesson's own first refactoring pass exposes a real bug that had been
sitting, unnoticed, inside deeply nested logic.

**What you need to know first.** Lesson 4 (Essential vs. Accidental
Complexity) — this lesson's whole subject is a specific, concrete form
of accidental complexity: complexity a reader has to fight through that
the problem itself never required. Domain 6's closing lesson
(Architecture Evolution) — architecture decides *where* code lives;
this domain, starting here, decides what the code *inside* those
boundaries actually looks like.

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

This lesson works inside the **Implementation** stage — the first
lesson in this curriculum to make it its own explicit subject. Carrying
one concrete value through every stage built so far: a gold-tier
customer places an order with a $42.00 subtotal and one item.
**Problem** — customers report that some gold-tier orders aren't
receiving their discount. **Requirements** — a functional requirement
states gold-tier customers receive a 5% discount on every order,
regardless of subtotal. **Domain model** — this is a property of a
`Customer`'s loyalty tier applied against an `Order`'s subtotal.
**Specification** — the function computing the final total must satisfy
the postcondition that a gold-tier discount is applied whenever the
tier is gold, with no other condition gating it. **Architecture** —
this calculation lives inside the order-processing service's own
implementation layer, not scattered across the boundary code that talks
to it. **Implementation**, this lesson — the actual `calc_order_total`
function, and, as this lesson's own first Concept Unit shows, the exact
place a violation of that specification had been hiding.

**Terms used in this lesson.**

- **Readability** — how little effort a reader needs to correctly
  understand what code does and verify that it does it correctly; it
  exists because code is read far more often than it's written, and a
  correct piece of code that's expensive to verify carries a real,
  ongoing cost even when it has no bugs yet.
- **Accidental complexity** — complexity introduced by how a solution
  happens to be written, not required by the problem itself (reused
  from Lesson 4); this entire lesson is about removing it from one
  function without touching the problem it solves.
- **Nesting depth** — how many conditional blocks a reader has to stay
  inside, simultaneously, to reach a given line of code; it exists as a
  concept because each additional level is one more condition a reader
  must keep true in their head before that line's meaning is even
  valid.
- **Guard clause** — a conditional near the top of a function that
  checks for a case that doesn't need the function's main logic and
  returns immediately, instead of wrapping the main logic inside an
  `else` branch; it exists to let the common case read as a flat,
  linear sequence instead of the deepest-nested branch of a tree.
- **Magic number (magic literal)** — a literal value (a number or short
  string) written directly into logic with no name explaining what it
  represents or why it's that specific value; it's a problem because a
  reader meeting `100` in the middle of a calculation has no way to
  know, without asking someone, whether it's a dollar threshold, an
  item count, or an unrelated coincidence that happens to also be 100.
- **Named constant** — a value bound to a capitalized, descriptive name
  and declared once, in one place, instead of repeated as a literal
  everywhere it's used; it exists so a reader meeting the name instead
  of the number gets the meaning for free, and so changing the value
  later means editing one line instead of finding every occurrence.
- **Redundant comment (a "what"-comment)** — a comment that states only
  what the very next line of code already states in code, adding no
  information a competent reader of the language doesn't already have;
  it's a problem because it costs a reader's attention without paying
  anything back, and it's more likely to silently go stale than the
  code it's attached to.
- **Intent comment (a "why"-comment)** — a comment that states a reason
  the code is shaped the way it is that isn't recoverable by reading
  the code itself: a business rule, a regulatory requirement, a past
  incident, a constraint imposed by something outside this file; it
  exists because code can only ever show *what* it currently does,
  never *why* someone decided it should do that.

**Objects and methods used.**

- **`Decimal`** (from Python's standard library `decimal` module) —
  *What it is:* an immutable numeric type built for exact base-10
  arithmetic, as opposed to `float`'s binary floating-point
  representation.
  *Implementation:* constructed as `Decimal(value)`, where `value` is a
  string, integer, or another `Decimal` — never a `float`
  (`Decimal(0.1)` silently inherits `float`'s own binary rounding
  error; `Decimal("0.1")` does not). Supports the ordinary arithmetic
  operators (`+`, `-`, `*`, `/`) and comparisons (`>`, `>=`, `==`)
  directly, returning new `Decimal` values, since it's immutable.
  *Its use:* every dollar amount in this lesson's pricing function —
  subtotals, rates, fees, the final total — is a `Decimal`, so that a
  stack of small rounding errors invisible in any one test case never
  silently accumulates into a wrong total, which is exactly the kind of
  error a customer would notice on a receipt even though no single line
  looks wrong.

---

## Concept Unit: Guard Clauses Replace Nested Conditionals

### The Problem

Somewhere inside the order-processing service's implementation layer —
the layer Domain 6 decided this kind of logic belongs in, not scattered
across the code that talks to a database or a payment gateway — a
function computes a customer's final charged total. It has to apply
four independent business rules: a 10% discount on subtotals over $100,
an additional 5% discount for gold-tier customers, free shipping on
subtotals of $50 or more (a flat $5.99 fee otherwise), and a $2.50
handling fee on orders of more than 10 items. A developer wrote this
function, it passed its original tests, and it shipped. Recently, a
support ticket came in: a gold-tier customer with a $42.00 order didn't
receive their tier discount. Reviewing the function to find out why
means holding every one of those four rules, and the specific way
they're nested inside each other, in your head at the same time,
checking each combination by hand. That kind of review is exactly where
real bugs hide — not because anyone was careless, but because the shape
of the code itself made a mistake easy to write and hard to see.

### Isolating the Concept: Guard Clause

Before touching that function, isolate the one construct this unit is
actually about, in code that has nothing to do with pricing. Here's a
small, unrelated function that decides what access level a request
gets, given three independent flags:

```python
def access_level_nested(logged_in, banned, admin):
    if logged_in:
        if not banned:
            if admin:
                return "admin"
            else:
                return "user"
        else:
            return "banned"
    else:
        return "anonymous"
```

That's one function, and it's already three levels deep at its most
nested point — a reader reaching the `"admin"` case has to be holding
`logged_in` is `True`, `banned` is `False`, and `admin` is `True`, all
at once, tracked across three separate `if` blocks. Here's the same
logic, restructured:

```python
def access_level_guard(logged_in, banned, admin):
    if not logged_in:
        return "anonymous"
    if banned:
        return "banned"
    if admin:
        return "admin"
    return "user"
```

Each `if` here checks for one specific case and exits immediately if it
matches — none of them wrap the rest of the function inside an `else`.
Run both versions against the same four combinations of inputs:

```python
for logged_in, banned, admin in [
    (False, False, False),
    (True, True, False),
    (True, False, True),
    (True, False, False),
]:
    a = access_level_nested(logged_in, banned, admin)
    b = access_level_guard(logged_in, banned, admin)
    print(f"logged_in={logged_in} banned={banned} admin={admin} -> nested={a} guard={b} match={a == b}")
```

Running that loop against all four combinations produces:

```text
logged_in=False banned=False admin=False -> nested=anonymous guard=anonymous match=True
logged_in=True banned=True admin=False -> nested=banned guard=banned match=True
logged_in=True banned=False admin=True -> nested=admin guard=admin match=True
logged_in=True banned=False admin=False -> nested=user guard=user match=True
```

Both versions agree on every case — this proves the restructuring
changed nothing about *what* the function computes, only how many
nested levels a reader has to track to read it. Each early exit here is
called a **guard clause**: a check for a case that doesn't need the
rest of the function's logic, placed at the top, that returns
immediately instead of nesting everything else one level deeper inside
it.

This throwaway example is now discarded — `access_level_nested` and
`access_level_guard` exist only to demonstrate the guard clause
construct in isolation and will not appear in the pricing project.

### Project Change

**Reference Source:** no reference counterpart — `pricing.py` and the
function shown below are this lesson's own from-scratch illustration of
implementation-layer code, not a port of any external reference
implementation. **Files affected:** `pricing.py`, a new file inside the
order-processing service's implementation layer. **Change type:** the
file's own starting content, shown below, is a first draft — the
version a developer already wrote and shipped, described in "The
Problem" above — and this unit *replaces* that first draft's function
body. **Location:** the entire body of `calc_order_total`.
**Dependencies:** `Decimal`, from Python's standard library `decimal`
module — no install required.

The first draft, exactly as it currently reads:

```python
from decimal import Decimal


def calc_order_total(s, n, t):
    if s > 0:
        if s > 100:
            # discount for over 100
            d = s * Decimal("0.9")
            if t == "gold":
                # gold discount
                d = d * Decimal("0.95")
        else:
            d = s
            if t == "gold":
                if s > 50:
                    # gold discount
                    d = d * Decimal("0.95")
        if s >= 50:
            sh = Decimal("0")
        else:
            sh = Decimal("5.99")
        if n > 10:
            bf = Decimal("2.50")
        else:
            bf = Decimal("0")
        total = d + sh + bf
        return total
    else:
        return Decimal("0")
```

Look specifically at the gold-tier discount: it's written twice, once
inside the `s > 100` branch and once inside the `else`, and only the
second copy carries an extra condition, `if s > 50`. That's the support
ticket's exact bug, sitting in plain text — the fix is in the next
step.

### The New Code

Replace the whole function body with a flat sequence of guard-style
checks — no branch of this new version is nested inside another:

```python
def calc_order_total(s, n, t):
    if s <= 0:
        return Decimal("0")

    if s > 100:
        d = s * Decimal("0.9")
    else:
        d = s

    if t == "gold":
        d = d * Decimal("0.95")

    if s >= 50:
        sh = Decimal("0")
    else:
        sh = Decimal("5.99")

    if n > 10:
        bf = Decimal("2.50")
    else:
        bf = Decimal("0")

    total = d + sh + bf
    return total
```

### The Updated Project

`pricing.py`, in full, after this unit's change:

```python
from decimal import Decimal


def calc_order_total(s, n, t):
    if s <= 0:                              # ← new: guard clause replaces the old outer if/else
        return Decimal("0")

    if s > 100:
        d = s * Decimal("0.9")
    else:
        d = s

    if t == "gold":                         # ← new: one gold-tier check, not two
        d = d * Decimal("0.95")

    if s >= 50:
        sh = Decimal("0")
    else:
        sh = Decimal("5.99")

    if n > 10:
        bf = Decimal("2.50")
    else:
        bf = Decimal("0")

    total = d + sh + bf
    return total
```

The file now has one function, `calc_order_total`, that computes the
same four business rules as the first draft, but as a flat sequence a
reader can check top to bottom, one rule at a time, without needing to
keep an outer branch's condition in mind while reading an inner one —
and with the gold-tier discount written in exactly one place instead of
two.

### Mechanical Walkthrough

Every distinct syntactic element in the new function body, in order:

- **`if s <= 0:`** — a comparison producing a `bool`, feeding an `if`.
  This is the unit's own guard clause: the one case (a non-positive
  subtotal) that doesn't need any of the function's real pricing logic,
  checked first and exited immediately.
- **`return Decimal("0")`** — an early return. Because it exits the
  function immediately, everything below it in the function body
  executes only when `s > 0`, without needing an explicit `else` to say
  so — the guard clause *is* the `else`, expressed as "leave now"
  instead of "wrap everything else one level deeper."
- **`if s > 100:` / `else:`** — a plain two-way branch, unchanged in
  shape from the first draft, computing the bulk discount into `d`.
  This one wasn't nested to begin with, so nothing about it needed to
  change.
- **`d = s * Decimal("0.9")`** — a `Decimal` multiplication.
  `Decimal.__mul__` is called on `s` with `Decimal("0.9")` as the other
  operand, returning a new `Decimal` — `d` is a fresh value, not a
  mutation of `s`, because `Decimal` is immutable.
- **`if t == "gold":`** — a string equality comparison. This is the
  line that fixes the bug: in the first draft this exact check appeared
  twice, once unconditionally and once gated behind `s > 50`; here it
  appears once, applied uniformly regardless of which branch set `d`.
- **`d = d * Decimal("0.95")`** — the same kind of `Decimal`
  multiplication as above, now unconditionally reachable whenever
  `t == "gold"`, regardless of the subtotal.
- **`if s >= 50:` / `else:`** — a two-way branch computing shipping
  into `sh`, unchanged from the first draft.
- **`if n > 10:` / `else:`** — a two-way branch computing the
  bulk-handling fee into `bf`, unchanged from the first draft.
- **`total = d + sh + bf`** — two more `Decimal` additions, left to
  right, each returning a new `Decimal`.
- **`return total`** — the function's normal-case return, now reached
  only after every rule above has run exactly once.

### CS Lens

Reducing nesting depth this way is the same thing as reducing a
function's **cyclomatic complexity** — a real, computable number (the
count of independent linear paths through a function's control flow)
that's been used since the 1970s as a direct predictor of how hard a
function is to test and how likely it is to contain a bug, precisely
because each additional nested branch multiplies the number of paths a
reader — or a test suite — has to cover to be sure the whole function is
correct.

```
Also recognized in: precondition checks in Design by Contract, early-exit
loops using break/continue instead of nesting the remaining work inside
an if, and a parser's own error-recovery paths that reject a malformed
token immediately rather than threading a validity flag through every
later stage of parsing
```

Design by Contract's own precondition checks (this domain's own Lesson
28 through Lesson 31) are exactly this same shape, applied to a
function's public contract instead of its internal structure: reject
the invalid case immediately, rather than nesting the function's real
logic inside a validity check.

### SE Lens

The alternative not chosen here is keeping the nested version, on the
argument that nesting visually groups related branches together — the
`s > 100` branch and its own gold-tier check do sit physically closer
to each other in the first draft than the flattened version's two
separate `if t == "gold"`-adjacent lines end up being. That's a real, if
modest, cost of flattening: a reader loses the visual grouping of
"everything that happens when the subtotal is large." The tradeoff this
lesson's own bug demonstrates is that the grouping nesting provides
isn't free — it's purchased by requiring every related branch to
independently repeat any shared logic, and repeated logic is exactly
what silently drifted out of sync here. Guard clauses aren't a universal
improvement, either: they work well when each checked case is genuinely
independent and terminal, the way every check in this function is. A
guard clause covering a case that actually needs shared cleanup —
closing a file, releasing a lock — before returning can quietly
duplicate that cleanup at every exit point unless it's factored out
separately, a real cost this function doesn't happen to carry but a
different one would.

### Commands Needed

This unit needs no new tooling — plain Python, already available. Run
the file directly:

```bash
python pricing.py
```

`python` is the interpreter; `pricing.py` is the script path. Success
looks like the four printed lines shown in "Run It," below, with no
traceback.

### Run It

`pricing.py` as it stands after this unit, run against the exact case
from this lesson's own header — a gold-tier customer, $42.00 subtotal,
one item — alongside three other cases, to see the fix against a range
of inputs, not just the one that was reported broken:

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
```

Running `python pricing.py` at this point in the lesson produces:

```text
A: subtotal=142.50 items=3 tier=gold -> total=121.83750
B: subtotal=42.00 items=1 tier=gold -> total=45.8900
C: subtotal=75.00 items=1 tier=gold -> total=71.2500
D: subtotal=250.00 items=15 tier=standard -> total=227.500
```

Compare case B against the first draft run with the identical input:
the first draft returns `47.99` for that exact case — no gold discount
applied, because $42.00 doesn't clear the first draft's accidental
`s > 50` condition. This version returns `45.89` — the gold discount
applied, because tier alone now determines it, matching the requirement
from this lesson's own header. Cases A, C, and D are unchanged from the
first draft: A and D never touch the buggy branch at all, and C's
subtotal of $75.00 happened to clear the accidental `s > 50` threshold
anyway, which is exactly why this bug shipped in the first place — most
gold-tier orders are large enough to hide it.

### Connecting Back

The function's control-flow shape is fixed, and fixing it exposed a
real bug the nested version was hiding — but every number inside it
(`100`, `0.9`, `0.95`, `50`, `5.99`, `10`, `2.50`) is still an
unexplained literal, which is the next problem.

---

## Concept Unit: Named Constants Replace Magic Numbers

### The Problem

The function from the previous unit is flat enough now to read top to
bottom without losing track of nested conditions, but a reader still
can't tell, from the code alone, what any of its literal numbers
actually mean. `100`, `50`, and `10` are all plain integers or decimals
sitting in comparisons — nothing marks that `100` is a dollar
threshold, `50` is a different dollar threshold, and `10` is an item
count, not a third kind of dollar amount. `0.9` and `0.95` look
unrelated at a glance, even though both are discount multipliers for
the same kind of rule. If the business ever changes the bulk-discount
threshold from $100 to $150, a reader has to find every place `100`
appears in this file and reason out, each time, whether that particular
`100` is the one that needs to change.

### Isolating the Concept: Named Constant

Isolate this construct on a small, unrelated example — a function
computing a circle's area:

```python
def circle_area_magic(radius):
    return 3.14159 * radius * radius
```

`3.14159` here is a **magic number**: a literal with no name explaining
what it represents, forcing a reader to already know it's an
approximation of π to make sense of the line. Here's the same function
with that value pulled out into a named constant:

```python
PI = 3.14159


def circle_area_named(radius):
    return PI * radius * radius
```

Run both versions against a few radii:

```python
for r in [1, 2.5, 10]:
    a = circle_area_magic(r)
    b = circle_area_named(r)
    print(f"r={r} -> magic={a} named={b} match={a == b}")
```

Running this against three different radii produces:

```text
r=1 -> magic=3.14159 named=3.14159 match=True
r=2.5 -> magic=19.6349375 named=19.6349375 match=True
r=10 -> magic=314.159 named=314.159 match=True
```

Identical results for every radius — pulling the literal out into a
name changed nothing about what the function computes. `PI` is a
**named constant**: a value bound to a capitalized, descriptive name
and declared once, so every reader meeting `PI` in the function body
gets its meaning immediately, without needing to already recognize
`3.14159` on sight, and so changing π's precision later means editing
the one line where `PI` is declared instead of finding every place
`3.14159` was typed by hand.

This throwaway example is discarded now — `circle_area_magic`,
`circle_area_named`, and `PI` exist only to demonstrate the
named-constant construct and will not appear in the pricing project.

### Project Change

**Reference Source:** no reference counterpart — this is a continuation
of this lesson's own from-scratch `pricing.py`. **Files affected:**
`pricing.py`, modified. **Change type:** refactor — add a block of
named constants at module level, and replace every magic number inside
`calc_order_total` with a reference to the matching constant.
**Location:** a new block above the function definition, plus every
literal currently inside the function body except the two
`Decimal("0")` values that represent "no discount"/"no fee"/"free,"
which are truly zero rather than a business-chosen threshold and don't
need a name to be understood. **Dependencies:** none beyond what the
previous unit already added.

### The New Code

The constants block, declared once at module level:

```python
BULK_DISCOUNT_THRESHOLD = Decimal("100.00")
BULK_DISCOUNT_RATE = Decimal("0.9")
GOLD_TIER_DISCOUNT_RATE = Decimal("0.95")
FREE_SHIPPING_THRESHOLD = Decimal("50.00")
STANDARD_SHIPPING_FEE = Decimal("5.99")
BULK_HANDLING_ITEM_THRESHOLD = 10
BULK_HANDLING_FEE = Decimal("2.50")
```

### The Updated Project

`pricing.py`, in full, after this unit's change:

```python
from decimal import Decimal

BULK_DISCOUNT_THRESHOLD = Decimal("100.00")      # ← new
BULK_DISCOUNT_RATE = Decimal("0.9")               # ← new
GOLD_TIER_DISCOUNT_RATE = Decimal("0.95")         # ← new
FREE_SHIPPING_THRESHOLD = Decimal("50.00")        # ← new
STANDARD_SHIPPING_FEE = Decimal("5.99")           # ← new
BULK_HANDLING_ITEM_THRESHOLD = 10                 # ← new
BULK_HANDLING_FEE = Decimal("2.50")               # ← new


def calc_order_total(s, n, t):
    if s <= 0:
        return Decimal("0")

    if s > BULK_DISCOUNT_THRESHOLD:               # ← new: was 100
        d = s * BULK_DISCOUNT_RATE                 # ← new: was 0.9
    else:
        d = s

    if t == "gold":
        d = d * GOLD_TIER_DISCOUNT_RATE             # ← new: was 0.95

    if s >= FREE_SHIPPING_THRESHOLD:                # ← new: was 50
        sh = Decimal("0")
    else:
        sh = STANDARD_SHIPPING_FEE                  # ← new: was 5.99

    if n > BULK_HANDLING_ITEM_THRESHOLD:            # ← new: was 10
        bf = BULK_HANDLING_FEE                       # ← new: was 2.50
    else:
        bf = Decimal("0")

    total = d + sh + bf
    return total
```

The function computes exactly the same four rules as before; every
threshold and rate now has a name a reader can read without already
knowing the business rule by heart, and every place a given number is
used now shares one declaration instead of repeating a bare literal.

### Mechanical Walkthrough

Every new or changed element, in order:

- **`BULK_DISCOUNT_THRESHOLD = Decimal("100.00")`** — a module-level
  assignment. Python has no dedicated `const` keyword; a named constant
  here is a plain variable, distinguished from an ordinary one only by
  convention — `SCREAMING_SNAKE_CASE` and a declaration at module
  scope, signaling to every reader "this is meant to be treated as
  fixed," even though nothing in the language actually prevents
  reassigning it.
- **`BULK_DISCOUNT_RATE = Decimal("0.9")`**, **`GOLD_TIER_DISCOUNT_RATE
  = Decimal("0.95")`** — the same kind of assignment, giving the two
  previously unrelated-looking multipliers (`0.9` and `0.95`) names
  that make clear both are discount rates, just for different rules.
- **`FREE_SHIPPING_THRESHOLD = Decimal("50.00")`**,
  **`STANDARD_SHIPPING_FEE = Decimal("5.99")`** — same pattern, for the
  shipping rule.
- **`BULK_HANDLING_ITEM_THRESHOLD = 10`** — a plain `int`, not a
  `Decimal`, because it's compared against an item count, not a dollar
  amount; naming it makes that distinction explicit where the bare
  literal `10` didn't.
- **`BULK_HANDLING_FEE = Decimal("2.50")`** — same pattern, for the
  handling fee.
- **`if s > BULK_DISCOUNT_THRESHOLD:`** — the same comparison as
  before, now reading as "is the subtotal over the bulk discount
  threshold" instead of "is `s` greater than `100`," without changing
  what value it actually compares against.
- **`d = s * BULK_DISCOUNT_RATE`**, **`d = d * GOLD_TIER_DISCOUNT_RATE`**,
  **`sh = STANDARD_SHIPPING_FEE`**, **`if n > BULK_HANDLING_ITEM_THRESHOLD:`**,
  **`bf = BULK_HANDLING_FEE`** — each one the identical operation as the
  previous unit's version, with a name substituted for the literal it
  referred to; none of these changes the value being computed, only
  what a reader has to already know to understand why that value is
  there.

### CS Lens

Naming a literal this way is the same idea as a compiler's own **symbol
table** — the internal structure every compiler builds mapping a name
to the value or memory location it refers to, so the rest of the
program can refer to a name instead of repeating a raw value
everywhere. A named constant is a reader-facing version of exactly that
idea: one declaration is the single source of truth for a value, and
every use site refers to the name instead of duplicating the value
itself.

```
Also recognized in: a spreadsheet's own named ranges standing in for a
repeated cell reference, a build system's version variables defined once
and referenced everywhere a dependency version is needed, and a game
engine's tunable constants (GRAVITY, MAX_HEALTH) letting a designer find
and change the one number governing a rule without hunting for it
```

Every one of those exists for the identical reason a named constant
does here: one authoritative place to change a value, instead of a
search-and-hope across every file it might have been copied into.

### SE Lens

The alternative not chosen is leaving literals inline, on the argument
that for a small function like this one, a developer who wrote it (or
has read it recently) already knows what `100` and `50` mean, so naming
them is unnecessary ceremony. The real cost that argument ignores is
that code is read far more often by people who *didn't* write it, or by
the same developer months later with the context gone — and the
specific bug this lesson's first unit found is a direct consequence of
that gap: two copies of "if gold tier, discount 5%" were written, and
nothing about bare literals made it obvious the two copies needed to
agree. Named constants don't prevent every such bug, but they make the
values themselves inspectable at a glance and centralize any future
change to exactly one line — a real, ongoing maintenance benefit
purchased at the real, one-time cost of a few extra lines of
declaration.

### Commands Needed

No new tooling beyond the previous unit's `python pricing.py`.

### Run It

Run the file again, with the exact same four cases as before, to
confirm naming the constants didn't change what the function computes:

```text
A: subtotal=142.50 items=3 tier=gold -> total=121.83750
B: subtotal=42.00 items=1 tier=gold -> total=45.8900
C: subtotal=75.00 items=1 tier=gold -> total=71.2500
D: subtotal=250.00 items=15 tier=standard -> total=227.500
```

Identical to the previous unit's output, for all four cases — naming
the constants changed which characters appear in the file, not what the
file computes.

### Connecting Back

Every threshold and rate now has a name, but nothing in the file yet
says *why* $100 is the bulk-discount threshold, or why orders over 10
items carry an extra fee — that's what a comment is actually for, and
the next unit is about using one correctly.

---

## Concept Unit: Comments That Explain Why, Not What

### The Problem

The function is flat and its constants are named, but two of the first
draft's original comments are still sitting in the code: `# discount
for over 100` directly above `if s > BULK_DISCOUNT_THRESHOLD:`, and
`# gold discount` directly above `d = d * GOLD_TIER_DISCOUNT_RATE`. Now
that the constant names already say exactly that —
`BULK_DISCOUNT_THRESHOLD` already says "this is the bulk discount
threshold" — those two comments add nothing a reader doesn't already
have from the code itself. Meanwhile, the actual open question a new
reader would have — *why* does an order of more than 10 items carry a
$2.50 fee, and *why* is the gold-tier discount applied on top of the
bulk discount instead of replacing it — has no comment answering it
anywhere, because that reasoning was never written in code at all; it
lives only in whichever meeting decided the business rule.

### Isolating the Concept: Intent Comment

Isolate this on two small, unrelated functions that compute the
identical result:

```python
def add_tax_what_comment(price):
    # add tax to price
    return price * 1.07
```

That comment states exactly what the very next line already states — a
reader who can read `price * 1.07` learns nothing new from `# add tax
to price`. Here's the same computation with a different comment:

```python
def add_tax_why_comment(price):
    # State law requires tax collected at the point of sale, not invoiced later
    return price * 1.07
```

Run both:

```python
for p in [10, 19.99]:
    a = add_tax_what_comment(p)
    b = add_tax_why_comment(p)
    print(f"price={p} -> what_comment={a} why_comment={b} match={a == b}")
```

Running both functions against two prices produces:

```text
price=10 -> what_comment=10.700000000000001 why_comment=10.700000000000001 match=True
price=19.99 -> what_comment=21.3893 why_comment=21.3893 match=True
```

Identical results either way — this proves a comment's text has no
effect on what the code actually does; Python discards comments
entirely before running anything, exactly the same as any other
language's comment syntax. What differs is only what the *reader* gets.
The first comment is a **redundant comment** (a "what"-comment): it
restates code a competent Python reader can already read directly. The
second is an **intent comment** (a "why"-comment): it states a fact — a
state tax law — that isn't recoverable from `price * 1.07` no matter
how carefully it's read, because nothing about that expression says
*why* 1.07 specifically, or why tax is computed here instead of
somewhere else.

This throwaway example is discarded now — `add_tax_what_comment` and
`add_tax_why_comment` exist only to demonstrate the distinction and
will not appear in the pricing project.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
lesson's own from-scratch `pricing.py`. **Files affected:**
`pricing.py`, modified. **Change type:** refactor — remove the two
redundant comments left over from the first draft, and add comments
stating the actual business reasoning behind the bulk-handling fee and
the gold-tier discount's stacking behavior. **Location:** immediately
above `if n > BULK_HANDLING_ITEM_THRESHOLD:` and immediately above
`if t == "gold":`. **Dependencies:** none.

### The New Code

The first of the two intent comments being added, placed above the
bulk-handling check:

```python
    # Orders over 10 items require manual warehouse packing instead of the
    # automated line; this fee passes that extra labor cost to the customer.
    if n > BULK_HANDLING_ITEM_THRESHOLD:
        bf = BULK_HANDLING_FEE
```

And the second, placed above the gold-tier check:

```python
    # Marketing wants gold-tier spend to always feel cheaper, so this stacks
    # on top of the bulk discount instead of being replaced by it.
    if t == "gold":
        d = d * GOLD_TIER_DISCOUNT_RATE
```

### The Updated Project

`pricing.py`, in full, after this unit's change — the last state this
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


def calc_order_total(s, n, t):
    if s <= 0:
        return Decimal("0")

    if s > BULK_DISCOUNT_THRESHOLD:
        d = s * BULK_DISCOUNT_RATE
    else:
        d = s

    # Marketing wants gold-tier spend to always feel cheaper, so this stacks
    # on top of the bulk discount instead of being replaced by it.          # ← new
    if t == "gold":
        d = d * GOLD_TIER_DISCOUNT_RATE

    if s >= FREE_SHIPPING_THRESHOLD:
        sh = Decimal("0")
    else:
        sh = STANDARD_SHIPPING_FEE

    # Orders over 10 items require manual warehouse packing instead of the
    # automated line; this fee passes that extra labor cost to the customer.  # ← new
    if n > BULK_HANDLING_ITEM_THRESHOLD:
        bf = BULK_HANDLING_FEE
    else:
        bf = Decimal("0")

    total = d + sh + bf
    return total
```

The function's computation hasn't changed at all since the previous
unit; what changed is that a reader meeting the gold-tier check or the
bulk-handling fee now learns *why* each rule exists, not only *that* it
exists — the two comments carried over from the first draft, which only
repeated what the constant names already said, are gone.

### Mechanical Walkthrough

- **The removed `# discount for over 100` and `# gold discount`
  comments** — both deleted. Per the previous unit's own constant
  names, both had become strictly redundant: `BULK_DISCOUNT_THRESHOLD`
  and `GOLD_TIER_DISCOUNT_RATE` already say what these comments said,
  so keeping them would only add two more lines that could drift out of
  sync with the code the next time it changes.
- **The gold-tier intent comment** — placed immediately above the
  `if t == "gold":` check it explains, not further away, so a reader
  encountering the check and wanting to know why doesn't have to search
  for the explanation.
- **The bulk-handling intent comment** — same placement discipline,
  immediately above `if n > BULK_HANDLING_ITEM_THRESHOLD:`.
- **`#` itself** — Python's comment syntax: everything from a `#` to
  the end of the line is discarded before the code runs, which is
  exactly what the isolated lab proved by showing identical output
  regardless of which comment text was present.

### CS Lens

The distinction between a "what"-comment and a "why"-comment is the
same distinction a compiler makes between **syntax and semantics that
live outside the language**: the code itself is the complete,
authoritative record of *what* runs — a compiler needs nothing else —
but *why* it was written that way is metadata no compiler can recover,
because it was never encoded in a form the language can express in the
first place.

```
Also recognized in: a git commit message explaining why a change was
made (which a diff alone never can), an API's own changelog entry
explaining why a breaking change happened, and a scientific paper's
discussion section, separate from its results
```

A `diff` shows exactly what changed, the same way `price * 1.07` shows
exactly what's computed; in both cases, *why* has to live somewhere the
mechanism itself can't carry it.

### SE Lens

The alternative not chosen is writing no comments at all, on the
argument that well-named constants and flat control flow (this lesson's
own first two units) make the code self-explanatory. That argument is
correct for *what* the code does — a reader genuinely doesn't need a
comment to understand that `BULK_DISCOUNT_THRESHOLD` gates a discount —
but it's never true for *why* a specific business rule exists, because
no amount of good naming can encode "Marketing wants gold-tier spend to
always feel cheaper" into an identifier without the identifier becoming
a full sentence. The real cost this lesson's version accepts is that
these two comments can now go stale: if Marketing's reasoning changes,
or the warehouse automates bulk packing and the fee's justification
disappears, nobody is forced to update the comment the way changing
`BULK_HANDLING_FEE`'s value would force a review of the line it sits
on. A "why"-comment is worth that risk because the alternative — the
reasoning existing nowhere but a meeting nobody who reads this file
attended — guarantees the knowledge is lost the moment the people in
that meeting move on; a comment that occasionally goes stale is still
more recoverable than a reason that was never written down anywhere at
all.

### Commands Needed

No new tooling beyond `python pricing.py`, unchanged from the previous
two units.

### Run It

Run the file one final time, same four cases, to confirm the comment
changes left the computation untouched:

```text
A: subtotal=142.50 items=3 tier=gold -> total=121.83750
B: subtotal=42.00 items=1 tier=gold -> total=45.8900
C: subtotal=75.00 items=1 tier=gold -> total=71.2500
D: subtotal=250.00 items=15 tier=standard -> total=227.500
```

Identical to both previous units — comments carry zero runtime
behavior, exactly as the isolated lab proved; only a human reading the
file gets anything different out of this change.

### Connecting Back

The function is now flat, its numbers are named, and its two genuinely
non-obvious rules are explained — the same four business rules as the
first draft, computing the same values for every case except the one
the first draft got wrong, now readable top to bottom without a reader
needing to reconstruct any of it by hand.

## Connect the Pieces

One value, the same one from this lesson's own header, traced through
every unit built here: a gold-tier customer with a $42.00 subtotal and
one item. In the first draft, `calc_order_total(Decimal("42.00"), 1,
"gold")` returned `47.99` — no gold discount, because $42.00 didn't
clear an accidental `s > 50` condition that had no business reason to
exist and only appeared because the gold-tier check was written twice.
The first unit replaced nested conditionals with guard clauses and, in
doing so, collapsed that duplicated check into one — the same input now
returns `45.89`, the gold discount correctly applied regardless of
subtotal. The second unit replaced every magic number in the function —
`100`, `0.9`, `0.95`, `50`, `5.99`, `10`, `2.50` — with a named
constant, changing nothing about the `45.89` result but letting a
reader understand every comparison without memorizing what each bare
literal meant. The third unit removed two comments that had become
redundant once those constants existed, and added two comments stating
the actual business reasoning — gold-tier stacking, bulk-handling labor
cost — that no amount of naming could ever encode into an identifier.
Three passes, one unchanged (corrected) output, and a function that
went from requiring a careful manual trace to being readable in one
pass, top to bottom.

## What Breaks Without This

Revert `calc_order_total` to the first draft's own nested shape and run
the exact case from this lesson's header again:

```python
def calc_order_total(s, n, t):
    if s > 0:
        if s > 100:
            d = s * Decimal("0.9")
            if t == "gold":
                d = d * Decimal("0.95")
        else:
            d = s
            if t == "gold":
                if s > 50:
                    d = d * Decimal("0.95")
        if s >= 50:
            sh = Decimal("0")
        else:
            sh = Decimal("5.99")
        if n > 10:
            bf = Decimal("2.50")
        else:
            bf = Decimal("0")
        total = d + sh + bf
        return total
    else:
        return Decimal("0")


print(calc_order_total(Decimal("42.00"), 1, "gold"))
```

Running this against the header's own gold-tier, $42.00 case produces:

```text
47.99
```

The bug is back — $42.00 at gold tier returns `47.99`, missing the tier
discount, the exact behavior the support ticket in this lesson's own
opening reported. Nothing about the business rules changed between this
version and the guard-clause version; only the control-flow shape did.
That's the whole point this lesson exists to make concretely, not just
assert: the bug was never really about the number `50`, or about
`Decimal` arithmetic, or about the gold-tier rate — it was about a shape
that let the identical rule be written twice, in two places, with no
mechanism forcing the two copies to agree. Restore the guard-clause
version — the one shown in this lesson's own final "Updated Project" —
before moving on.

## Exercises

1. Add a fifth test case to the `cases` list in "Run It" — one where the
   subtotal is exactly `Decimal("100.00")` (not over it) and the tier
   is `"gold"`. Predict the output by hand first, then actually run it
   and check.
2. The first draft's bug survived its own original tests. Write down,
   in your own words, what a test case would have needed to look like
   to have caught it before it shipped — you don't need to write the
   actual test code, just describe the specific input that would have
   exposed it.
3. `BULK_HANDLING_ITEM_THRESHOLD` and `BULK_DISCOUNT_THRESHOLD` are both
   named "threshold," but one compares an item count and the other
   compares a dollar amount. Rewrite both names so that a reader could
   never confuse which kind of threshold either one is, without reading
   its declared value.
4. Find one comment in any code you've written or worked in recently
   that restates what the very next line already says. Rewrite it as
   either a real "why"-comment or delete it — whichever is honest,
   given whether a real, non-obvious reason actually exists.

## Definition of Done

- [ ] You can explain, in your own words, why the first draft's bug was
      a direct consequence of its nested shape, not an unrelated
      mistake that happened to occur in nested code.
- [ ] You can state the difference between a guard clause and an
      ordinary early return used for some other reason.
- [ ] You can name, from memory, at least one real cost of flattening
      nested conditionals into guard clauses — not just the benefit.
- [ ] You've completed all four exercises.
- [ ] `pricing.py` matches this lesson's own final "Updated Project"
      state, and running it reproduces this lesson's own "Run It"
      output exactly.
- [ ] Commit the file with a message explaining why the change was
      made — e.g. `git commit -m "Flatten calc_order_total's nesting;
      fixes gold-tier discount silently not applying under $50"` — not
      `git commit -m "refactor pricing.py"`, which says nothing a
      reader couldn't already see from the diff itself.

Lesson 94, Naming, is next.
