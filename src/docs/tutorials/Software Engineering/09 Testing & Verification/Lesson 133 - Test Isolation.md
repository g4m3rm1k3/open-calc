# Lesson 133: Test Isolation

**What you will build.** `apply_reorder`, a real, new function that
simulates stock actually arriving — it updates an inventory's counts in
place, unlike every function in this project so far, all of which only
ever read their `inventory` argument. Two checks are written for it,
sharing one module-level dictionary between them, the way sharing a
single fixture across checks might look like a reasonable way to avoid
repetition. Run in the order they're written, one fails — not because
either function is wrong, but because the first check's own side effect
silently corrupted the state the second check assumed it would still
see. Run in the opposite order, both pass. Same two checks, same real
code, two different verdicts — decided entirely by which one happened
to run first. The fix gives each check its own, fresh inventory,
built fresh every time. The transferable problem this lesson names:
every technique in this domain so far asked whether a test correctly
verifies the code under it — this lesson asks whether a test's own
result can be trusted regardless of what ran before it, a property
called test isolation, and shows, with real code, exactly how quietly
it can be lost.

**What you need to know first.** Lesson 118 (Unit Tests) — the word
"isolation" there meant isolating a unit *from its collaborators*; this
lesson uses the same word for a different, related idea: isolating one
*test* from another. This lesson also reuses `low_stock_items`,
unchanged since Lesson 131.

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

Still **Verification**. Concrete value carried forward: `{"widgets": 2,
"gadgets": 8}`, checked twice — once by a check that deliberately
mutates it via `apply_reorder`, once by a check that reads it via
`low_stock_items` — first sharing one dictionary between both checks,
then giving each its own.

**Terms used in this lesson.**

- **Test isolation** — the property that one test's outcome does not
  depend on whether, or in what order, any other test happened to run
  first. Why it matters: a test suite whose results depend on execution
  order isn't really testing the code at all in any of the runs where
  it happens to pass — it's testing code *plus* a specific, accidental
  sequence, which is not what any check in this project has ever
  claimed to be checking.
- **Shared mutable state** — a single, real piece of data — here, one
  dictionary object — that more than one test reads from or writes to,
  rather than each test working with its own independent copy. Why it's
  the real mechanism behind most isolation failures: a value one test
  reads is only trustworthy if nothing else could have changed it
  first, and shared mutable state is exactly what removes that
  guarantee.
- **Order-dependent test** — a test whose pass/fail result changes
  depending on what ran before it, even though nothing about the test's
  own code changed at all. This lesson's own real check is one, proven
  directly by running the identical two checks in both possible orders.

**Objects and methods used.** No new external class or method — this
lesson's new code reuses `dict.get()` (a real method, not yet given its
own dedicated entry in this project, though used informally before)
and ordinary dictionary item assignment, both explained fully below.

---

## Concept Unit: Test Isolation — When One Test's Side Effect Becomes Another Test's Bug

### The Problem

Every function in `inventory-report` so far only ever *reads* its
`inventory` argument — `low_stock_items`, `restock_alert`, `reorder_
suggestion`, none of them ever change the dictionary a caller passed
in. A new, genuinely useful feature changes that: after a reorder
report is generated, the inventory should actually be updated once the
new stock arrives. Writing a function that mutates its input on
purpose, for the first time in this project, means a real question has
to be asked: if two checks both touch the same real inventory object,
what happens to the second one if the first one already changed it?

### Introduce the Concept in Isolation

A small, throwaway, unrelated pair of checks — never part of
`inventory-report` — makes the real risk concrete. Both share one
dictionary, declared once, above both of them:

```python
account = {"balance": 100}

def deposit(amount):
    account["balance"] += amount
    return account["balance"]

def check_deposit_fifty():
    result = deposit(50)
    assert result == 150
    print("check_deposit_fifty passed")

def check_starting_balance_is_100():
    assert account["balance"] == 100
    print("check_starting_balance_is_100 passed")

check_deposit_fifty()
check_starting_balance_is_100()
```

Run exactly as written:

```text
$ python3 isolation_lab.py
check_deposit_fifty passed
Traceback (most recent call last):
  File "/path/to/lab/isolation_lab.py", line 17, in <module>
    check_starting_balance_is_100()
  File "/path/to/lab/isolation_lab.py", line 13, in check_starting_balance_is_100
    assert account["balance"] == 100
           ^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

`check_deposit_fifty` genuinely passed, and genuinely changed
`account["balance"]` from `100` to `150` while doing it —
`deposit`'s own real job. `check_starting_balance_is_100` never touches
`deposit` at all; it only reads `account["balance"]`, expecting the
value it was first declared with. But by the time it runs, that value
is gone. The exact same two check functions, called in the opposite
order:

```python
check_starting_balance_is_100()
check_deposit_fifty()
```

Run this reordered version:

```text
$ python3 isolation_lab_swap.py
check_starting_balance_is_100 passed
check_deposit_fifty passed
```

Both pass. Nothing about either check's own code changed between these
two runs — only the order they were called in. This is called an
**order-dependent test**, and the real cause underneath it is called
**shared mutable state**: one real dictionary, read by one check and
written by another, with nothing keeping them from interfering.

### Discard the Throwaway Example

`account`, `deposit`, and both checks are not part of `inventory-
report` and will not appear in it. What survives is the failure mode:
a test that mutates shared state can silently invalidate the
assumptions of a completely unrelated test that happens to run later.

### Project Change

- **Reference Source.** No reference counterpart — `apply_reorder` is a
  genuinely new, from-scratch feature: the first function in this
  project meant to mutate its own input.
- **Files affected.** `inventory_report.py`, modified — `apply_
  reorder` appended. `check_apply_reorder.py`, created.
- **Change type.** Add.
- **Location.** `apply_reorder` is appended to the end of
  `inventory_report.py`, after `build_reorder_report`.
- **Dependencies.** None beyond what `inventory-report` already has.

### The New Code

```python
def apply_reorder(inventory, suggestions):
    for name, qty in suggestions.items():
        inventory[name] = inventory.get(name, 0) + qty
    return inventory
```

### The Updated Project

`inventory_report.py`, in full, with the new function marked:

```python
def low_stock_items(inventory, threshold=3):
    """Return names of items strictly below the given threshold."""
    low = []
    for name, count in inventory.items():
        if count < threshold:
            low.append(name)
    return sorted(low)

def restock_alert(inventory, threshold=3):
    return [name for name in low_stock_items(inventory, threshold)]

def reorder_suggestion(inventory, threshold=3, target=15):
    if target <= threshold:
        raise ValueError("target must be greater than threshold")
    return {name: target - count for name, count in inventory.items() if count < threshold}

def format_reorder_line(name: str, qty: int) -> str:
    return name + ": reorder " + str(qty)

def format_reorder_line_priced(name: str, qty: int, unit_cost: float) -> str:
    return name + ": reorder " + str(qty) + " units at $" + str(unit_cost)

def build_reorder_report(inventory, threshold=3, target=15):
    suggestions = reorder_suggestion(inventory, threshold, target)
    lines = []
    for name, qty in sorted(suggestions.items()):
        lines.append(format_reorder_line(name, qty))
    return lines

def apply_reorder(inventory, suggestions):    # ← new
    for name, qty in suggestions.items():      # ← new
        inventory[name] = inventory.get(name, 0) + qty  # ← new
    return inventory                            # ← new
```

### Mechanical Walkthrough

- **`def apply_reorder(inventory, suggestions):`** — a function
  definition, two parameters: the inventory to update, and a dict of
  reorder quantities — exactly `reorder_suggestion`'s own return shape.
- **`for name, qty in suggestions.items():`** — the same iteration
  pattern used throughout this project, here walking the incoming
  suggestions rather than the inventory itself.
- **`inventory[name] = inventory.get(name, 0) + qty`** — the one line
  that makes this function genuinely different from everything else in
  the project: `inventory.get(name, 0)` (a real, standard dict method,
  used here for the first time with its own explanation) reads the
  current count for `name`, or `0` if `name` isn't in `inventory` at
  all, instead of raising a `KeyError` the way `inventory[name]` alone
  would; adding `qty` to that, then assigning it back to `inventory[
  name]`, **mutates the exact dictionary object that was passed in** —
  not a copy of it. Any other code holding a reference to that same
  dictionary sees this change immediately, whether that code expected
  to or not.
- **`return inventory`** — hands the same, now-mutated dictionary back,
  mostly for convenience; the mutation already happened before this
  line runs.

### CS Lens

```text
Also recognized in: two threads in the same running program reading
and writing one shared variable with no coordination between them, a
spreadsheet formula that reads a cell another formula is still in the
middle of updating, two people editing the same physical paper ledger
at the same time, unaware the other has already changed a number one
of them is about to read, a shared classroom whiteboard where one
group's diagram silently overwrites the exact space another group was
still using
```

### SE Lens

The alternative — sharing one dictionary across checks the way this
lesson's own throwaway example first did — looks like it saves real
repetition: write the sample inventory once, reuse it everywhere. That
alternative isn't a strawman; it's a genuinely tempting shortcut,
proven directly by this lesson's own investigation to produce a real,
order-dependent failure the moment any one of the sharing checks
mutates what's shared. The real cost of the fix — giving every check
its own fresh data — is a small amount of real repetition: `{"widgets":
2, "gadgets": 8}` typed twice instead of once. What it buys in return:
every check's result depends only on its own code and its own input,
never on which other checks happened to run, or in what order, or
whether a completely unrelated future check might someday be added that
mutates something this one silently depended on staying fixed. This is
exactly why every check written across this entire domain — with this
lesson's own first, deliberate exception — has always built its own
inventory literal fresh, inside its own function, rather than reaching
for one declared once and reused.

### Commands Needed

No new command — `python3 check_apply_reorder.py`, the same invocation
every check file in this project already uses.

### Run It

A temporary, throwaway diagnostic file, `check_apply_reorder_shared_
state.py` — never added to the project, only used here to investigate
— shares one inventory between both checks, exactly the shape this
lesson's own isolated lab already demonstrated is risky:

```python
shared_inventory = {"widgets": 2, "gadgets": 8}

def check_apply_reorder_updates_counts():
    apply_reorder(shared_inventory, {"widgets": 13})
    assert shared_inventory["widgets"] == 15
    print("check_apply_reorder_updates_counts passed")

def check_low_stock_items_still_flags_widgets():
    result = low_stock_items(shared_inventory, threshold=5)
    assert result == ["widgets"]
    print("check_low_stock_items_still_flags_widgets passed")

check_apply_reorder_updates_counts()
check_low_stock_items_still_flags_widgets()
```

Run exactly as written:

```text
$ python3 check_apply_reorder_shared_state.py
check_apply_reorder_updates_counts passed
Traceback (most recent call last):
  File "/path/to/inventory-report/check_apply_reorder_shared_state.py", line 16, in <module>
    check_low_stock_items_still_flags_widgets()
  File "/path/to/inventory-report/check_apply_reorder_shared_state.py", line 12, in check_low_stock_items_still_flags_widgets
    assert result == ["widgets"]
           ^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

`check_apply_reorder_updates_counts` genuinely passed, and genuinely
changed `shared_inventory["widgets"]` from `2` to `15` while doing it.
`check_low_stock_items_still_flags_widgets` never calls `apply_reorder`
at all — it only calls `low_stock_items`, expecting `widgets` to still
be below `threshold=5`. It isn't anymore; `15` is not less than `5`.
The exact same two functions, called in the opposite order:

```python
check_low_stock_items_still_flags_widgets()
check_apply_reorder_updates_counts()
```

Run this reordered version:

```text
$ python3 check_apply_reorder_reversed_order.py
check_low_stock_items_still_flags_widgets passed
check_apply_reorder_updates_counts passed
```

Both pass. The bug was never in `apply_reorder` or `low_stock_items` —
both worked exactly as written, in both runs. The fix removes the
shared dictionary entirely, giving each check its own:

```python
def check_apply_reorder_updates_counts():
    inventory = {"widgets": 2, "gadgets": 8}
    apply_reorder(inventory, {"widgets": 13})
    assert inventory["widgets"] == 15
    print("check_apply_reorder_updates_counts passed")

def check_low_stock_items_still_flags_widgets():
    inventory = {"widgets": 2, "gadgets": 8}
    result = low_stock_items(inventory, threshold=5)
    assert result == ["widgets"]
    print("check_low_stock_items_still_flags_widgets passed")

check_apply_reorder_updates_counts()
check_low_stock_items_still_flags_widgets()
```

Run in the original order:

```text
$ python3 check_apply_reorder.py
check_apply_reorder_updates_counts passed
check_low_stock_items_still_flags_widgets passed
```

And with the two calls at the bottom swapped, to confirm order no
longer matters at all:

```text
$ python3 -c "from check_apply_reorder import check_apply_reorder_updates_counts, check_low_stock_items_still_flags_widgets; check_low_stock_items_still_flags_widgets(); check_apply_reorder_updates_counts()"
check_apply_reorder_updates_counts passed
check_low_stock_items_still_flags_widgets passed
check_low_stock_items_still_flags_widgets passed
check_apply_reorder_updates_counts passed
```

Both checks pass, regardless of which one runs first. And the rest of
the project's suite, confirmed undisturbed:

```text
$ python3 check_low_stock.py
check_low_stock_items passed
check_low_stock_items_returns_sorted_names passed
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

### Connecting Back

The isolated `account`/`deposit` example proved two checks sharing one
mutable dictionary can pass or fail depending entirely on which one
runs first. `check_apply_reorder.py` proved the identical thing about
real project code — the very first function in this project designed
to mutate its input turned out to be exactly the kind of code that
makes shared test data dangerous, and giving each check its own fresh
inventory removed the danger without changing what either check
actually verifies.

---

## Connect the Pieces

One dictionary, `{"widgets": 2, "gadgets": 8}`, moving through every
piece this lesson built, start to finish:

1. `apply_reorder` is added — the first function in this project that
   mutates its own `inventory` argument in place.
2. Two checks are written sharing one module-level `shared_inventory`.
3. Run in the order written, the first check's own mutation silently
   breaks the second check's assumption — a real `AssertionError`.
4. Run in the opposite order, both pass — proving the failure depends
   entirely on order, not on either function being wrong.
5. Each check is rewritten to build its own fresh `{"widgets": 2,
   "gadgets": 8}` dictionary.
6. Both checks now pass regardless of which one runs first, and the
   rest of the project's suite, rerun in full, confirms nothing else
   was disturbed.

## What Breaks Without This

This lesson's own investigation already showed it directly: the exact
same two checks, the exact same real code, produced two different
verdicts depending on nothing but call order. Restated plainly: a test
suite where results depend on execution order isn't fully trustworthy
in *any* of its passing runs — a check that only passes because
something else happened to run first isn't verifying its own claim, it's
verifying a coincidence. Without giving every check its own isolated
data, adding a single new mutating function to this project — exactly
what `apply_reorder` is — turns "which order do these checks happen to
run in" into a real variable that decides whether the suite reports
success or failure, for reasons that have nothing to do with whether
the code is actually correct.

## Exercises

1. `check_apply_reorder.py`'s two checks both build the identical
   literal, `{"widgets": 2, "gadgets": 8}`, by hand. Extract a small
   helper function, `fresh_inventory()`, that returns a new dictionary
   with those same values each time it's called, and confirm both
   checks still pass — while reasoning about why calling a function
   that returns a fresh dict each time is safe here, in a way sharing
   one dict declared once at module level is not.
2. `apply_reorder`'s own `inventory.get(name, 0)` means calling it with
   a `suggestions` entry for an item not yet in `inventory` silently
   adds a brand-new item. Write a check proving this, and decide
   whether that's the correct, intended behavior or a real gap worth
   guarding against.
3. This lesson's real bug depended on both checks running inside the
   *same* Python process, sharing the *same* module-level object. Every
   check file in this project is actually run as its own, separate
   `python3 check_X.py` invocation — a separate process each time.
   Explain, in a comment, why that project-wide convention has been
   quietly preventing this exact class of bug from ever occurring
   *between* different check files, even though it couldn't prevent it
   *within* one file, which is exactly what this lesson's own
   `check_apply_reorder_shared_state.py` demonstrated.

## Definition of Done

- [ ] `apply_reorder` exists in `inventory_report.py`, mutating its
      `inventory` argument in place using `dict.get()`.
- [ ] `check_apply_reorder.py` exists, with each check function
      building its own fresh inventory dictionary rather than sharing
      one declared at module level.
- [ ] Both checks in `check_apply_reorder.py` pass regardless of which
      one is called first (verified by hand, both orders).
- [ ] Every other check file in the project still passes unchanged.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `add apply_reorder and check_apply_reorder, each check building
      its own fresh inventory; a shared module-level dict made the
      same two checks pass or fail depending on call order` — not
      `add apply_reorder`.

Next: Lesson 134 — Determinism.
