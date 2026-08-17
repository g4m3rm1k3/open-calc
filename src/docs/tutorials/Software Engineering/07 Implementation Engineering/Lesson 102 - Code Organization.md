# Lesson 102: Code Organization

**What you will build.** Splitting `pricing.py` — one file, grown
across nine lessons to roughly fifteen functions — into two real,
separately importable files: `pricing_calculations.py`, holding every
pure calculation this domain has built since Lesson 93, and
`pricing_batch.py`, holding the batch-processing and audit-logging
functions from Lessons 97 through 99, importing what it needs from the
first. Transferable problem: a single file that keeps growing,
lesson after lesson, eventually mixes together pieces that don't
actually belong to the same responsibility — and nothing about Python
forces a reader to notice that until the file is organized to make it
visible.

**What you need to know first.** Lessons 93 through 101 — this lesson
reorganizes the identical code every one of those lessons already
built, without changing what any of it computes. Domain 5's Lessons 58
and 59 (Coupling and Cohesion) — this lesson draws the exact line those
two lessons taught how to recognize, now applied to decide where a real
file boundary belongs. Lesson 99 (Side Effects) — this lesson's own
split falls almost exactly along the functional-core/imperative-shell
line that lesson already established: pure calculation in one file,
everything that touches `audit_log` in the other.

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

Still the **Implementation** stage. Carrying the same four-order batch
from Lesson 97 forward, unchanged in every value it produces — this
lesson asks only which file each function that touches that batch
should actually live in.

**Terms used in this lesson.**

- **Module** — in Python, a single `.py` file, importable by name into
  another file; it exists as the language's own smallest unit of code
  organization, one level below a function and one level above a
  package of several modules grouped together.
- **Cohesion** (reused from Domain 5's Lesson 59) — how closely the
  responsibilities inside one unit of code (here, one file) actually
  belong together; it exists as a concept because a file can be
  syntactically valid and still bundle together things that have no
  real reason to be edited, tested, or understood as one piece.
- **Circular import** — a situation where module A imports from module
  B, and module B also imports from module A, either directly or
  through a longer chain; it exists as a specific, real failure mode
  in Python because a module's own top-level code has to finish running
  before its names are available to import, and two modules each
  waiting on the other to finish first can never both succeed.

**Objects and methods used.**

- **`import` / `from ... import ...`** (Python's own import statements)
  —
  *What it is:* the language's built-in mechanism for making names
  defined in one module available inside another.
  *Implementation:* `from module_name import name` binds one specific
  name from `module_name` into the current file's own namespace,
  running `module_name`'s entire top-level code once, the first time
  it's imported, and reusing the already-loaded module on every
  subsequent import in the same process — not re-running it each time.
  *Its use:* `pricing_batch.py` uses `from pricing_calculations import
  calculate_order_total` to reuse the identical, already-defined
  function, rather than duplicating its logic into a second copy.

---

## Concept Unit: Splitting One File Into Modules by Responsibility

### The Problem

`pricing.py` currently holds two genuinely different kinds of
function, side by side, in the order each lesson happened to add them:
pure calculation (`calculate_order_total` and everything it calls,
unchanged and side-effect-free since Lesson 93) and batch orchestration
with a real side effect (`process_orders`, `process_order_and_log`, and
the `audit_log`-mutating functions Lesson 99 extracted). A reader who
only wants to understand or reuse the pricing math has to scroll past
audit-logging code to find it, and a reader who only wants to
understand the batch-processing logic has to scroll past low-level
discount arithmetic to find that. Nothing about one growing file
signals where one responsibility ends and the other begins.

### Isolating the Concept: Two Files, One Import

Isolate this on a small, unrelated example — a rectangle's area,
computed in one file and reported in another. `geometry.py`:

```python
def calculate_rectangle_area(width, height):
    return width * height
```

`geometry_report.py`, in the same directory:

```python
from geometry import calculate_rectangle_area


def print_area_report(width, height):
    area = calculate_rectangle_area(width, height)
    print(f"a {width}x{height} rectangle has area {area}")


if __name__ == "__main__":
    print_area_report(4, 5)
```

Running `python geometry_report.py` produces:

```text
a 4x5 rectangle has area 20
```

`geometry_report.py` never defines `calculate_rectangle_area` itself —
`from geometry import calculate_rectangle_area` makes the name defined
in `geometry.py` available here, and calling it runs the identical
function, in the identical file it was originally written in. This is
a **module**: `geometry.py`, a single file, importable by its own
filename (without the `.py` extension) from any other file in the same
directory.

This throwaway example is discarded now — `geometry.py` and
`geometry_report.py` exist only to demonstrate a minimal two-file
import and will not appear in the pricing project in this form.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own `pricing.py`, exactly as Lesson 101 left it. **Files
affected:** `pricing.py` is split into two new files,
`pricing_calculations.py` and `pricing_batch.py`; the original
`pricing.py` is retired. **Change type:** reorganize — every function's
own body is moved unchanged; nothing about any function's own logic is
edited. **Location:** `pricing_calculations.py` receives every constant
and every function through `calculate_order_total` (everything pure,
Lessons 93 through 96's `calculate_subtotal`, and Lesson 100's
`validate_order_lines`); `pricing_batch.py` receives `process_orders`,
`record_attempt`, `record_success`, and `process_order_and_log` from
Lessons 97 through 99. **Dependencies:** `pricing_batch.py` depends on
`pricing_calculations.py`, imported explicitly.

### The New Code

`pricing_batch.py`'s own new import line, the one piece of code this
split actually adds (every function's own body is unchanged, only its
file location moves):

```python
from pricing_calculations import calculate_order_total
```

### The Updated Project

`pricing_calculations.py`, in full — every constant and pure
calculation function this domain has built since Lesson 93, unchanged
in behavior, gathered into one file:

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


def describe_gold_tier_benefit():
    discount_percent = (Decimal("1") - GOLD_TIER_DISCOUNT_RATE) * 100
    return f"Gold-tier members save {discount_percent}% on every order."


def calculate_shipping_fee(subtotal):
    if subtotal >= FREE_SHIPPING_THRESHOLD:
        return Decimal("0")
    return STANDARD_SHIPPING_FEE


def calculate_bulk_handling_fee(item_count):
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


def preview_order_total(*, subtotal, item_count, loyalty_tier):
    return calculate_order_total(
        subtotal=subtotal, item_count=item_count, loyalty_tier=loyalty_tier
    )
```

`pricing_batch.py`, in full — every batch-processing and audit-logging
function this domain has built since Lesson 97, now importing the one
function it actually needs from the file above instead of duplicating
or redefining it:

```python
from pricing_calculations import calculate_order_total    # ← new


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
```

`pricing_calculations.py` now contains every function this domain has
ever needed to call without touching `audit_log`; `pricing_batch.py`
contains every function whose whole purpose depends on it — a reader
who opens either file alone now sees only the one responsibility that
file exists for.

### Mechanical Walkthrough

- **`from pricing_calculations import calculate_order_total`** — a
  new import statement, the first line of `pricing_batch.py`; Python
  resolves `pricing_calculations` by looking for a file named
  `pricing_calculations.py` in the same directory (or elsewhere on its
  own module search path), runs that file's own top-level code exactly
  once if it hasn't already run in this process, and binds the name
  `calculate_order_total` from inside it into `pricing_batch.py`'s own
  namespace.
- **Every function body, in both files** — unchanged, character for
  character, from Lesson 101's own final `pricing.py`; this unit is a
  pure reorganization, and every one of this lesson's own "Run It"
  results, below, exists specifically to prove that claim rather than
  merely assert it.
- **`calculate_order_total(...)` calls inside `pricing_batch.py`'s own
  three functions** — resolve to the identical function object
  imported at the top of the file; calling it here is indistinguishable,
  at runtime, from calling it inside `pricing_calculations.py` itself.

### CS Lens

Splitting one file along the boundary between "what has no side
effects" and "what does" is a direct, file-level application of Domain
5's own Lesson 59 (Cohesion): a module is cohesive when everything
inside it is there for one related reason, and `pricing_calculations.py`
and `pricing_batch.py` each pass that test in a way the single,
combined `pricing.py` no longer did once it grew to fifteen functions.
It's also the identical shape as a **compilation unit** in a language
with an explicit module system: each file becomes independently
readable, independently testable, and — critically — independently
reusable, since another file could now import only
`pricing_calculations.py` without pulling in any batch-processing code
it doesn't need.

```
Also recognized in: a large codebase's own separation between a
`models` directory and a `services` directory, a game engine's own split
between a physics module (pure simulation) and a rendering module
(side-effecting draw calls) that reads the physics module's own
results, and a standard library's own internal organization — Python's
`decimal` module doesn't also define `os.environ`-reading utilities,
even though a real program frequently uses both together
```

### SE Lens

The alternative not chosen is leaving everything in one, ever-growing
`pricing.py`, on the argument that one file is simpler to navigate than
two — a single `Ctrl+F` search finds everything, with no need to
remember which file a given function lives in. That's a real cost this
split accepts: a reader who genuinely needs both the calculation logic
and the batch logic together now has to hold two open files instead of
one, and has to learn (or be told) which file a given function lives
in before searching for it. The benefit this split buys in exchange:
each file can now be read start to finish by someone who only cares
about one responsibility, each file's own future growth is
independently bounded — `pricing_calculations.py` gaining a fifth
discount rule doesn't make `pricing_batch.py` any longer to read — and
the exact functional-core/imperative-shell boundary Lesson 99 already
established in the code's own *behavior* is now visible in the
project's own *file structure*, not just in a careful reader's mental
model of it.

### Commands Needed

Both files need to be run from the same directory, so Python's own
import resolution can find `pricing_calculations.py` when
`pricing_batch.py` imports it:

```bash
python pricing_batch.py
```

No install step — both modules are plain, local `.py` files; Python's
own default import search path already includes the directory the
running script lives in.

### Run It

`pricing_batch.py`, run directly, exercising both `process_orders` and
`process_order_and_log`:

```python
if __name__ == "__main__":
    orders = [
        ("ORD-1", Decimal("142.50"), 3, "gold"),
        ("ORD-2", Decimal("42.00"), 1, "glod"),
        ("ORD-3", Decimal("75.00"), 1, "gold"),
        ("ORD-4", Decimal("250.00"), 15, "standard"),
    ]
    results, errors = process_orders(orders)
    print("results:", results)
    print("errors:", errors)

    audit_log = {"orders_attempted": 0, "orders_succeeded": 0}
    total = process_order_and_log("ORD-1", Decimal("42.00"), 1, "gold", audit_log)
    print("process_order_and_log:", total, audit_log)
```

Running `python pricing_batch.py` produces:

```text
results: [('ORD-1', Decimal('121.83750')), ('ORD-3', Decimal('71.2500')), ('ORD-4', Decimal('227.500'))]
errors: [('ORD-2', "Unknown loyalty tier: 'glod'")]
process_order_and_log: 45.8900 {'orders_attempted': 1, 'orders_succeeded': 1}
```

Every value here is identical to Lesson 97's own batch results and
Lesson 99's own `process_order_and_log` output — splitting the file in
two changed nothing about what any function computes, confirmed by
running the actual split files, not merely asserted from reading them.

### Connecting Back

`pricing_calculations.py` and `pricing_batch.py` now exist as two
separately readable files with a clear, one-directional dependency
between them — but nothing yet stops a future edit from importing in
the *other* direction, which is a real, specific way this split could
break, demonstrated next.

---

## Concept Unit: Import Direction Matters — Avoiding a Circular Import

### The Problem

`pricing_batch.py` imports from `pricing_calculations.py`. Nothing in
Python's own syntax prevents a future edit from adding the reverse: if
`pricing_calculations.py` ever needed something from `pricing_batch.py`
— say, a shared helper someone adds to `pricing_batch.py` without
noticing it would fit more naturally in the calculations file — the
two files would import from each other, in both directions, at once.

### Isolating the Concept: A Circular Import Fails to Even Start

This unit's own concept doesn't need a fresh isolated lab — the two
real files this lesson already split, `pricing_calculations.py` and
`pricing_batch.py`, are the demonstration. Add an import to
`pricing_calculations.py` reaching back into `pricing_batch.py`:

```python
from pricing_batch import process_orders
```

placed as the new first line of `pricing_calculations.py`, with
`pricing_batch.py`'s own existing `from pricing_calculations import
calculate_order_total` left exactly as this lesson's first unit wrote
it. Attempting to run `python pricing_batch.py` now produces:

```text
ImportError: cannot import name 'process_orders' from 'pricing_batch' (consider renaming 'pricing_batch.py' if it has the same name as a library you intended to import)
```

Running `pricing_batch.py` starts executing its own top-level code, and
its first line tries to import `calculate_order_total` from
`pricing_calculations.py` — which, in turn, now tries to import
`process_orders` from `pricing_batch.py`, the very module that's still
in the middle of loading and hasn't defined `process_orders` yet.
Python has no way to finish either import first, because each one is
waiting on the other. This is a **circular import**: two modules,
directly or through a longer chain, each depending on the other having
already finished loading before either one actually has.

### Project Change

**Reference Source:** no reference counterpart — continuation of this
curriculum's own two-file split. **Files affected:** none — this unit
adds no permanent code to either file; it demonstrates a failure mode
and states the rule that prevents it. **Change type:** demonstration
only. **Location:** n/a. **Dependencies:** none.

### The New Code

The rule this unit establishes, stated directly rather than as new
code: `pricing_calculations.py` must never import anything from
`pricing_batch.py`, in either its current form or any future edit.
Dependencies between these two files flow one way only — `pricing_
batch.py` may depend on `pricing_calculations.py`, never the reverse.

### The Updated Project

Both files are unchanged from this lesson's own first unit — this
unit's contribution is the rule stated above, not new code. The
complete, correct state of both files is exactly as shown in this
lesson's first unit's own "Updated Project" section.

### Mechanical Walkthrough

- **`from pricing_batch import process_orders`** (the version
  deliberately added to `pricing_calculations.py` to demonstrate the
  failure, then removed again) — syntactically identical to any other
  `from ... import ...` statement; nothing about its own syntax marks
  it as dangerous. Its problem is entirely about *what it would create*
  — a cycle — not about anything wrong with the statement in isolation.
- **`ImportError: cannot import name 'process_orders' from
  'pricing_batch'`** — Python's own reported failure; it names the
  specific function (`process_orders`) that couldn't be found, and the
  specific module (`pricing_batch`) it was expected to come from,
  because that module's own execution hadn't reached the line defining
  `process_orders` yet when the circular import was attempted.

### CS Lens

A circular import is the exact same shape as a **deadlock** between two
threads each waiting on a lock the other one holds: two things, each
requiring the other to finish first, with no way for either one to make
progress. Python's own module system doesn't detect this ahead of time
the way a build system's own dependency graph might; it discovers the
problem only when it actually tries to run both modules' top-level
code and finds neither can complete.

```
Also recognized in: a Makefile with two targets each listed as a
prerequisite of the other, a spreadsheet formula that references a cell
whose own formula refers back to the first cell, and a class hierarchy
where two classes each try to inherit from the other, which every
mainstream object-oriented language's own compiler rejects outright,
for the identical underlying reason
```

### SE Lens

The alternative not chosen — allowing dependencies to flow freely in
both directions between these two files, "just this once, because it's
convenient right here" — is exactly how a circular import gets
introduced in a real codebase: not as a deliberate design decision, but
as a small, locally reasonable-looking edit that doesn't account for
the direction a dependency already flows elsewhere in the same two
files. The discipline this unit establishes — `pricing_calculations.py`
never imports from `pricing_batch.py`, full stop — costs something
real: a future function that would naturally belong in
`pricing_calculations.py` but happens to need something from `pricing_
batch.py` can't simply import it; it has to be redesigned, likely by
moving the shared logic somewhere both files can depend on, or by
restructuring which file owns which responsibility. That's a real
constraint on future changes, deliberately accepted now, specifically
because the alternative — discovering a circular import only once it
actually breaks a real import at runtime — is a strictly worse time to
learn about it.

### Commands Needed

No new tooling — the failure in this unit's own demonstration is
triggered simply by running the file, the identical command as before:

```bash
python pricing_batch.py
```

### Run It

With the circular import from this unit's own demonstration removed
again — `pricing_calculations.py` restored to its correct, one-way-
dependency state — running `pricing_batch.py` produces the identical
output as this lesson's first unit:

```text
results: [('ORD-1', Decimal('121.83750')), ('ORD-3', Decimal('71.2500')), ('ORD-4', Decimal('227.500'))]
errors: [('ORD-2', "Unknown loyalty tier: 'glod'")]
process_order_and_log: 45.8900 {'orders_attempted': 1, 'orders_succeeded': 1}
```

### Connecting Back

`pricing_calculations.py` and `pricing_batch.py` now form a clean,
one-directional dependency, with a real, demonstrated failure mode
named and deliberately avoided — the same four business rules this
domain has carried since Lesson 93, now organized into two files that
each read as one coherent responsibility, in a structure that stays
importable as long as the one-way rule this unit established holds.

## Connect the Pieces

The same four-order batch from Lesson 97, traced through both units:
the first unit split one growing `pricing.py` into
`pricing_calculations.py` (every pure function, from
`apply_bulk_discount` through `preview_order_total`) and
`pricing_batch.py` (`process_orders`, `record_attempt`,
`record_success`, `process_order_and_log`), connected by a single
import — and running the split files produced the exact same batch
results and audit log this domain has verified since Lessons 97 and
99, proving the reorganization changed nothing about behavior. The
second unit then asked what would happen if that one import ran in
both directions at once, deliberately introduced the reverse import to
find out, and reproduced a real `ImportError` — not a hypothetical
one — before removing it again and stating the rule that prevents it:
dependencies between these two files flow one way, from
`pricing_batch.py` toward `pricing_calculations.py`, never the
reverse. Same four business rules, same verified batch results, and a
file structure that now makes each responsibility's own boundary
visible to any reader who opens either file — not just something a
careful reader could infer from a single growing file's own contents.

## What Breaks Without This

Leave both files split, but move `describe_gold_tier_benefit` — a
function this lesson's first unit correctly kept in
`pricing_calculations.py`, since it depends only on
`GOLD_TIER_DISCOUNT_RATE` — into `pricing_batch.py` instead, on the
reasoning that "it's used for marketing reporting, which sounds
batch-related":

```python
# inside pricing_batch.py, added carelessly
from pricing_calculations import calculate_order_total, GOLD_TIER_DISCOUNT_RATE
from decimal import Decimal


def describe_gold_tier_benefit():
    discount_percent = (Decimal("1") - GOLD_TIER_DISCOUNT_RATE) * 100
    return f"Gold-tier members save {discount_percent}% on every order."
```

This doesn't crash — `pricing_batch.py` can import
`GOLD_TIER_DISCOUNT_RATE` alongside `calculate_order_total` without
creating a circular import, because the dependency still only flows one
way. What breaks is this lesson's own first unit's entire reason for
splitting the files in the first place: `describe_gold_tier_benefit`
has no side effect, touches no `audit_log`, and has nothing to do with
batch processing — it's pure calculation, exactly like every other
function in `pricing_calculations.py`, misplaced into the file whose
whole identity is "code that isn't." A reader who opens
`pricing_batch.py` expecting to find only side-effecting, audit-related
code now finds one function that doesn't belong, and the file's own
cohesion — the entire property this lesson's CS Lens named as the
reason for the split — is already quietly eroding. Move
`describe_gold_tier_benefit` back to `pricing_calculations.py` before
moving on.

## Exercises

1. `preview_order_total` currently lives in `pricing_calculations.py`.
   Make an argument for why it belongs there rather than in `pricing_
   batch.py`, using this lesson's own cohesion-based reasoning, not
   just "because that's where this lesson put it."
2. Add a third file, `pricing_reports.py`, containing only `format_
   receipt_line` and `build_order_summary`, importing what it needs
   from `pricing_calculations.py`. Decide, and write down your
   reasoning, whether this third split is a genuine improvement in
   cohesion or unnecessary fragmentation of a file that was already
   small enough to read in one sitting.
3. This lesson's own second unit demonstrated a circular import by
   editing `pricing_calculations.py` directly. Without running
   anything, read `pricing_batch.py`'s own final version and identify,
   by name, every single function or constant it imports from
   `pricing_calculations.py` — then confirm your answer by actually
   checking the file.

## Definition of Done

- [ ] You can explain, in your own words, why
      `pricing_calculations.py` and `pricing_batch.py` split roughly
      along the same line Lesson 99's own functional-core/imperative-
      shell distinction already drew.
- [ ] You can state what a circular import is and reproduce this
      lesson's own real `ImportError` from memory, including which
      specific line of which specific file would need to exist to
      trigger it.
- [ ] You can name the one-directional rule this lesson established
      between these two files, and explain what evidence — not just a
      feeling — should ever justify redesigning it.
- [ ] You've completed all three exercises.
- [ ] `pricing_calculations.py` and `pricing_batch.py` match this
      lesson's own final "Updated Project" state, and running `python
      pricing_batch.py` reproduces this lesson's own final "Run It"
      output exactly.
- [ ] Commit both files with a message explaining why the change was
      made — e.g. `git commit -m "Split pricing.py into
      pricing_calculations.py and pricing_batch.py along the pure/
      side-effecting boundary established in Lesson 99"` — not
      `git commit -m "reorganize files"`, which names neither the
      boundary nor the reason it was chosen.

Lesson 103, Code Smells, is next.
