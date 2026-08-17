# Lesson 131: Mutation Testing

**What you will build.** `low_stock_items`'s own `return sorted(low)` is
deliberately, temporarily changed to `return low` — a real, small,
syntactically valid variant of working code. Every single check in this
entire project — twenty-two checks, across sixteen lessons — is run
against it. Every one still passes. Not one of them ever noticed that
sorting was removed, because every existing check's own sample data
happens to have at most one item ever qualify as low stock, and sorting
a list of one item is never observable. The fix isn't a bug fix at all
— `low_stock_items` was never wrong — it's a new check, using an
inventory with two qualifying items in a deliberately unsorted order,
strong enough to actually notice. The transferable problem this lesson
names: every technique in this domain so far has asked whether the
*code* is correct. This lesson asks a different question entirely —
are the *tests* actually capable of noticing when the code isn't?

**What you need to know first.** Lesson 115 (Why Test?) — `check_low_
stock_items`, extended here rather than replaced. Lesson 117 (Test
Oracles) — its own real discovery of `low_stock_items`'s strictly-below
boundary, a genuine example of a small, targeted change catching
something a check hadn't yet verified, the same shape of investigation
this lesson performs deliberately and repeatably.

**Pipeline diagram.** This curriculum's full lifecycle:

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

Still **Verification** — but this lesson turns the whole domain's own
tools around to examine themselves: not "does `inventory-report` work,"
but "would this project's own test suite actually notice if it stopped
working." Concrete value carried forward: `low_stock_items({"zebra": 1,
"apple": 2}, threshold=5)` — the first inventory in this entire domain
with more than one qualifying low-stock item, chosen specifically
because every prior one, by coincidence, never had more than one.

**Terms used in this lesson.**

- **Mutation testing** — a technique that measures how good a test
  suite actually is, not whether the code it tests is correct, by
  automatically introducing small, deliberate faults into working code
  and rerunning the existing tests against each one. Why it's a
  fundamentally different question than everything else in this
  domain: every other lesson asked "is this code correct"; mutation
  testing asks "if this code stopped being correct, in some small,
  specific way, would anything actually notice."
- **Mutant** — one specific, small, syntactically valid variant of
  otherwise-working code — an operator swapped, a call removed —
  created only to probe the existing test suite, never meant to be kept.
- **Killed mutant** — a mutant that at least one existing test catches;
  its own introduction makes some check fail. A killed mutant is
  reassuring: it proves the test suite is sensitive to that specific
  kind of change.
- **Surviving mutant** — a mutant that every existing test misses; the
  entire suite keeps passing exactly as if nothing had changed. A
  surviving mutant is the real finding: it names a specific way the
  code could be silently broken with no test noticing at all.

**Objects and methods used.** No new external class or method — this
lesson's investigation uses only Python's own ordinary editing (a
temporary, one-line change to already-explained code) and the project's
own existing check-running convention.

---

## Concept Unit: Mutation Testing — Testing the Tests

### The Problem

`low_stock_items` calls `sorted(low)` on its very last line. Every
check in this project that exercises it — `check_low_stock_items`,
every check that calls `restock_alert`, everything downstream — has
passed, consistently, for sixteen lessons. Does that mean this
project's checks have actually verified that `sorted()` call does
anything at all, or only that they've never happened to ask?

### Introduce the Concept in Isolation

A small, throwaway, unrelated function — never part of `inventory-
report` — makes the real risk concrete. `clamp` is meant to keep a
number within a given range:

```python
def clamp(n, low, high):
    if n < low:
        return low
    if n > high:
        return high
    return n

def check_clamp():
    assert clamp(5, 0, 10) == 5
    print("check_clamp passed")

check_clamp()
```

Run so far, unremarkable:

```text
$ python3 mutation_lab.py
check_clamp passed
```

Now, a real, deliberate **mutant**: `clamp`'s upper-bound branch is
changed to forget to actually clamp:

```python
def clamp(n, low, high):
    if n < low:
        return low
    if n > high:
        return n  # mutant: forgot to actually clamp
    return n
```

The exact same check, run against this real mutant:

```text
$ python3 mutation_lab_mutant.py
check_clamp passed
```

Still green — a **surviving mutant**. `check_clamp` only ever calls
`clamp(5, 0, 10)`, and `5` never exceeds `10`, so the broken branch is
never even reached. The check is strengthened with a genuinely
out-of-range value:

```python
def check_clamp():
    assert clamp(5, 0, 10) == 5
    assert clamp(15, 0, 10) == 10
    print("check_clamp passed")
```

The identical mutant, run against the strengthened check:

```text
$ python3 mutation_lab_stronger.py
Traceback (most recent call last):
  File "/path/to/lab/mutation_lab_stronger.py", line 14, in <module>
    check_clamp()
  File "/path/to/lab/mutation_lab_stronger.py", line 11, in check_clamp
    assert clamp(15, 0, 10) == 10
           ^^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

A **killed mutant**. Nothing about `clamp`'s real code changed between
these two runs — only the check did. The mutant existed purely to
answer one question: is this specific kind of bug actually detectable
by what's already written? The first time, the honest answer was no.

### Discard the Throwaway Example

`clamp`, `check_clamp`, and the mutant are not part of `inventory-
report` and will not appear in it. What survives is the method:
deliberately break real code in one small way, rerun the existing
tests, and treat "nothing noticed" as a real finding about the tests,
not the code.

### Project Change

- **Reference Source.** No reference counterpart — this is a new check,
  written specifically because this lesson's own investigation finds a
  real gap.
- **Files affected.** `check_low_stock.py`, modified — one new check
  function added.
- **Change type.** Add.
- **Location.** Appended to the existing `check_low_stock.py`, directly
  after `check_low_stock_items`.
- **Dependencies.** None beyond what `inventory-report` already has.

A real, standard, automated mutation-testing tool for Python,
`mutmut`, exists — but does not run natively on this session's own
Windows environment without WSL, which this session doesn't have
available. Everything in this lesson is done by hand instead: exactly
what such a tool would automate, performed manually and transparently,
so nothing here depends on a tool this session can't actually run and
show real output from.

### The New Code

```python
def check_low_stock_items_returns_sorted_names():
    inventory = {"zebra": 1, "apple": 2}
    result = low_stock_items(inventory, threshold=5)
    assert result == ["apple", "zebra"]
    print("check_low_stock_items_returns_sorted_names passed")
```

### The Updated Project

`check_low_stock.py`, in full, with the new check marked:

```python
from inventory_report import low_stock_items

def check_low_stock_items():
    inventory = {"widgets": 2, "gadgets": 5, "gizmos": 8}
    result = low_stock_items(inventory, threshold=5)
    assert result == ["widgets"]
    print("check_low_stock_items passed")

def check_low_stock_items_returns_sorted_names():                       # ← new
    inventory = {"zebra": 1, "apple": 2}                                 # ← new
    result = low_stock_items(inventory, threshold=5)                     # ← new
    assert result == ["apple", "zebra"]                                  # ← new
    print("check_low_stock_items_returns_sorted_names passed")          # ← new

check_low_stock_items()
check_low_stock_items_returns_sorted_names()                            # ← new
```

### Mechanical Walkthrough

- **`inventory = {"zebra": 1, "apple": 2}`** — a literal dictionary,
  deliberately built with `zebra` written first and `apple` second —
  the opposite of alphabetical order — so that a correct, sorted result
  and an unsorted, insertion-order result are two visibly different
  lists, not coincidentally the same one.
- **`result = low_stock_items(inventory, threshold=5)`** — calls the
  real, already-checked `low_stock_items`; both `zebra` (count `1`) and
  `apple` (count `2`) are below `threshold=5`, so both qualify.
- **`assert result == ["apple", "zebra"]`** — the check itself: not
  just "did both items get flagged," which insertion order alone would
  already satisfy, but "did they come back in this exact, sorted
  order" — the one thing `sorted()`, specifically, is responsible for.

### CS Lens

```text
Also recognized in: a fire drill that tests whether an alarm system
actually notices smoke, not whether the building is currently on fire,
a security team's own red-team exercise, deliberately attempting a
real, chosen attack against production defenses specifically to find
out whether monitoring would actually notice, a manufacturing quality
process that deliberately introduces a small number of known-defective
parts into an inspection line to confirm the inspectors are actually
catching defects, not just waving parts through
```

### SE Lens

The alternative is what this project has done for sixteen lessons:
trust that a growing pile of passing checks means growing real
protection. That trust isn't baseless — most of those checks really did
catch real things, across this entire domain, when they were first
written. What it can't do on its own: distinguish a check that's
protecting something real from one that's only ever exercising a code
path without actually verifying its behavior — exactly the gap this
lesson's own investigation found in `check_low_stock_items` itself,
which called `low_stock_items` for sixteen lessons without ever
happening to ask about sort order. The real cost of mutation testing:
someone has to actually think of the mutant, in a codebase without an
automated tool to generate hundreds of them — the biggest reason a real
tool like `mutmut` is worth reaching for once an environment supports
it, rather than relying on manual investigation indefinitely. What it
buys, proven directly here: a concrete, specific answer to "would my
tests actually catch this," for a class of question code coverage alone
can't answer — a line can be executed by a test, and still have its
real behavior go completely unverified, exactly the way `sorted(low)`
was executed by every check that called `low_stock_items`, sixteen
lessons running, without a single one of them checking what it
actually did.

### Commands Needed

No new command — `python3 check_low_stock.py`, the same invocation
established since Lesson 115.

### Run It

First, a mutant most of this project's checks *would* catch — restoring
context for what "killed" looks like. `low_stock_items`'s own boundary
condition, already the exact subject of Lesson 117's real investigation,
mutated from `<` to `<=`:

```python
def low_stock_items(inventory, threshold=3):
    """Return names of items strictly below the given threshold."""
    low = []
    for name, count in inventory.items():
        if count <= threshold:  # mutant
            low.append(name)
    return sorted(low)
```

Run against it:

```text
$ python3 check_low_stock.py
Traceback (most recent call last):
  File "/path/to/inventory-report/check_low_stock.py", line 15, in <module>
    check_low_stock_items()
  File "/path/to/inventory-report/check_low_stock.py", line 6, in check_low_stock_items
    assert result == ["widgets"]
           ^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

Killed immediately — `gadgets`, at exactly `5`, is now wrongly included,
exactly the boundary Lesson 117 already established this project
depends on. The mutant is reverted. Now, the real mutant this lesson is
actually built around — `sorted(low)` changed to `low`:

```python
def low_stock_items(inventory, threshold=3):
    """Return names of items strictly below the given threshold."""
    low = []
    for name, count in inventory.items():
        if count < threshold:
            low.append(name)
    return low  # mutant: sorted() removed
```

Every single check in the project, run in full, against this mutant:

```text
$ python3 check_low_stock.py
check_low_stock_items passed
$ python3 check_restock_alert.py
check_restock_alert passed
$ python3 check_restock_alert_isolated.py
check_restock_alert_isolated passed
$ python3 check_restock_alert_mock.py
check_restock_alert_calls_low_stock_items_correctly passed
$ python3 check_format_reorder_line.py
check_format_reorder_line passed
$ python3 check_format_reorder_line_priced.py
check_format_reorder_line_priced passed
$ python3 check_reorder_suggestion.py
check_reorder_suggestion_matches_naive passed
check_reorder_suggestion_matches_naive_second_inventory passed
$ python3 check_build_reorder_report.py
check_build_reorder_report passed
check_build_reorder_report_rejects_target_below_threshold passed
$ python3 check_build_reorder_report_stub.py
check_build_reorder_report_sorts_regardless_of_stub_order passed
check_build_reorder_report_handles_empty_suggestions passed
$ python3 check_inventory_cli.py
check_inventory_cli passed
$ python3 check_inventory_end_to_end.py
check_inventory_end_to_end_rejects_bad_data passed
$ python3 check_load_inventory_boundaries.py
check_load_inventory_accepts_zero_count passed
check_load_inventory_rejects_negative_count passed
$ python3 check_parse_inventory_fake.py
check_parse_inventory_with_fake_file passed
check_parse_inventory_fake_rejects_negative passed
$ python3 check_load_inventory_contract.py
check_load_inventory_contract_accepts_good_data passed
check_load_inventory_contract_rejects_non_numeric passed
check_load_inventory_contract_rejects_negative passed
$ python3 check_reorder_suggestion_property.py
check_reorder_quantities_always_positive passed
$ python3 check_parse_inventory_fuzz.py
check_parse_inventory_never_crashes_unexpectedly passed
$ python3 -m mypy inventory_report.py
Success: no issues found in 1 source file
```

Every check passes. A surviving mutant, sitting undetected across the
entire suite. `low_stock_items` is restored, and this lesson's new
check is added. The identical mutant is reintroduced one more time,
against the now-strengthened `check_low_stock.py`:

```text
$ python3 check_low_stock.py
check_low_stock_items passed
Traceback (most recent call last):
  File "/path/to/inventory-report/check_low_stock.py", line 16, in <module>
    check_low_stock_items_returns_sorted_names()
  File "/path/to/inventory-report/check_low_stock.py", line 12, in check_low_stock_items_returns_sorted_names
    assert result == ["apple", "zebra"]
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

Killed. The mutant is reverted a final time, restoring `sorted(low)`,
and the full check confirmed clean:

```text
$ python3 check_low_stock.py
check_low_stock_items passed
check_low_stock_items_returns_sorted_names passed
```

### Connecting Back

The isolated `clamp` example proved a mutant can survive a real,
existing, passing check — and that strengthening the check, not the
code, is what closes the gap. `check_low_stock_items_returns_sorted_
names` proved the identical thing about real project code: `low_stock_
items` was never broken, and an entire domain's worth of checks had
still never actually verified one specific, real thing it promises to
do.

---

## Connect the Pieces

One deliberately unsorted inventory, `{"zebra": 1, "apple": 2}`, moving
through every piece this lesson built, start to finish:

1. `low_stock_items`'s `sorted(low)` is changed to `low` — a real
   mutant.
2. Every check in the entire project, twenty-two checks across sixteen
   lessons, is run against it. All twenty-two pass.
3. `check_low_stock_items_returns_sorted_names` is written, using two
   qualifying items in deliberately unsorted order.
4. Run against the real, correct code, it passes.
5. Run against the reintroduced mutant, it fails — the first check in
   this entire project actually sensitive to whether `sorted()` runs at
   all.
6. The mutant is permanently reverted, and the strengthened `check_low_
   stock.py` is confirmed passing against the real, correct code one
   final time.

## What Breaks Without This

This lesson's own investigation already showed it directly: sixteen
lessons of real, honest, verified testing work — unit tests,
integration tests, system tests, end-to-end tests, boundary tests, test
doubles, contract tests, property-based tests, fuzz tests — and every
single one of them, taken together, never happened to notice that
`sorted()` could be deleted from `low_stock_items` with zero observable
effect on any of them. Restated plainly: a large number of passing
tests is not the same claim as a suite capable of catching every real
class of mistake. Without deliberately breaking real code on purpose
and watching to see whether anything notices, a gap exactly this size —
invisible, silent, sitting inside a project with real, extensive test
coverage — has no way to be found before a real change, someday,
quietly relies on behavior nothing is actually protecting.

## Exercises

1. `format_reorder_line`'s own `+` between `name` and `": reorder "`
   has never been mutated and checked. Try changing it to a different
   string (say, swapping the space after the colon) and determine, by
   hand, whether the existing `check_format_reorder_line` check would
   catch it. If it wouldn't, decide whether that's worth a new check or
   an acceptable gap.
2. `build_reorder_report`'s own `sorted(suggestions.items())` (Lesson
   125) is exactly the kind of call this lesson's real mutant targeted
   in `low_stock_items`. Mutate it the same way — remove the `sorted()`
   — and determine whether `check_build_reorder_report_sorts_
   regardless_of_stub_order` (Lesson 125) actually kills it, or whether
   it survives too.
3. Not every mutant can be killed — some produce code that behaves
   identically to the original for every possible input, no matter how
   the test suite is strengthened. Try mutating `reorder_suggestion`'s
   `target - count` to `-(count - target)` — mathematically identical —
   and confirm no test could ever distinguish it, explaining in a
   comment why strengthening the tests further would never help.

## Definition of Done

- [ ] `check_low_stock_items_returns_sorted_names` exists, using an
      inventory with two qualifying items in non-alphabetical order.
- [ ] Reintroducing `sorted(low)` → `low` in `low_stock_items` (verified
      by hand, then reverted) causes this new check, specifically, to
      fail.
- [ ] `low_stock_items` itself is unchanged from Lesson 130 — this
      lesson found a test gap, not a code bug.
- [ ] Every other check file in the project still passes unchanged.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `add check_low_stock_items_returns_sorted_names; a mutation test
      found the entire suite never actually verified low_stock_items'
      own sorted() call did anything` — not `add sort test`.

Next: Lesson 132 — Regression Testing.
