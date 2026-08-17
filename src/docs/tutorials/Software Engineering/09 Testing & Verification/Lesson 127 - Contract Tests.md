# Lesson 127: Contract Tests

**What you will build.** `load_inventory` gets a real, written-down
**contract** — a docstring stating exactly what it promises callers:
returns a dict of non-negative `int` counts, raises `ValueError` for
anything else. A new file, `check_load_inventory_contract.py`, tests
only that promise — nothing about `parse_inventory`, nothing about
`json.load`, nothing about how the file gets opened. To prove this
check really is contract-level, not implementation-level, it's run
twice: once against Lesson 126's current, split implementation, and
once against Lesson 121's older, single-function version, restored
temporarily. It passes, unmodified, against both. Then a real,
plausible "improvement" — quietly removing the negative-count check,
the kind of well-intentioned leniency a future engineer might add
without thinking of it as a real change — is introduced, and the same
contract test catches it immediately. The transferable problem this
lesson names: every check built across this domain so far tested one
specific implementation's actual behavior; a contract test is written
and framed around the *promise itself*, so it can outlive any
particular way of keeping it.

**What you need to know first.** Lesson 126 (Fakes) — `load_inventory`
and `parse_inventory`, both reused unchanged. This lesson also revisits
**contract** and **published contract**, both real terms Domain 3
(Specification & Contracts, Lessons 28–39) already gave full treatment
to for a completely different codebase — this lesson gives them their
own full treatment again here, applied to `inventory-report`'s own
code, per this curriculum's own Repetition Rule.

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

Still **Verification**, and this lesson reaches back to touch
**Specification** as well — the stage Domain 3 occupies — since writing
`load_inventory`'s contract down explicitly, as a real docstring, is
itself an act of specification, not just testing. Concrete value
carried forward: `load_inventory`'s own promise — "a dict of
non-negative ints, or a `ValueError`" — checked identically against two
genuinely different real implementations of it.

**Terms used in this lesson.**

- **Contract** — an explicit, stated promise a function makes to its
  callers: what it requires of its inputs, and what it guarantees about
  its output or its failure behavior in return, treated as something
  callers are entitled to rely on regardless of how the function
  happens to be implemented. Why it matters here, specifically:
  `load_inventory`'s real behavior — reject non-numeric counts, reject
  negative ones — has existed since Lessons 121 and 122, but nothing
  ever wrote it down as a promise separate from whatever code happened
  to implement it, until this lesson.
- **Contract test** — a test written and framed around a function's
  published contract specifically, deliberately blind to its current
  implementation, so the identical test can verify any future
  implementation that still honors the same promise. Why it's distinct
  from every other check in this domain: Lesson 121's end-to-end test
  and Lesson 122's boundary tests both tested `load_inventory`'s real
  behavior too — but neither was ever written with the explicit goal of
  surviving unmodified across a real, unrelated rewrite of how that
  behavior is produced, and this lesson proves, concretely, that this
  one is.

**Objects and methods used.** No new external class or method — this
lesson's new code reuses only constructs already given full treatment
in this project: `import`, function definition and call, `assert`,
`try`/`except`, docstrings (the triple-quoted string immediately inside
a function, already used inside `low_stock_items` since Lesson 105,
given full treatment again here since this lesson's own docstring
serves a genuinely new purpose — stating a contract, not just
describing behavior).

---

## Concept Unit: Contract Tests — Verifying the Promise, Not the Implementation

### The Problem

`load_inventory` rejects bad data two ways: a non-numeric count, or a
negative one. Both behaviors are real and already checked — by Lesson
121's end-to-end test, and by Lesson 122's boundary tests. But neither
of those checks was ever written with an explicit goal in mind beyond
"does this specific version of `load_inventory` behave correctly right
now." If `load_inventory` were rewritten tomorrow — its internals
restructured again, the way Lesson 126 already restructured it once —
would those existing checks even notice if the *promise* itself quietly
changed along the way, as opposed to just the code that keeps it?

### Introduce the Concept in Isolation

A small, throwaway, unrelated pair of functions — never part of
`inventory-report` — makes the real distinction concrete. Both are
meant to keep the identical promise: return whether a number is even.

```python
def is_even_v1(n):
    return n % 2 == 0

def is_even_v2(n):
    return n & 1 == 0
```

One check, written once, run against both:

```python
def check_is_even_contract(is_even):
    assert is_even(4) is True
    assert is_even(7) is False
    assert is_even(0) is True
    print("contract check passed for", is_even.__name__)

check_is_even_contract(is_even_v1)
check_is_even_contract(is_even_v2)
```

The real output:

```text
$ python3 contract_lab.py
contract check passed for is_even_v1
contract check passed for is_even_v2
```

`check_is_even_contract` never mentions `%`, `&`, or anything else
about *how* either function decides evenness — it only asserts on the
promise both are meant to keep: even numbers return `True`, odd numbers
return `False`. The exact same check function runs, unmodified, against
two genuinely different, independently written implementations, and
passes against both. This is called a **contract test**: a test
written around the promise itself, blind to whichever implementation
happens to be honoring it at the moment.

### Discard the Throwaway Example

`is_even_v1`, `is_even_v2`, and `check_is_even_contract` are not part
of `inventory-report` and will not appear in it. What survives is the
method: write the check against the promise, not the code, and prove it
by actually running it against more than one real implementation of
that promise.

### Project Change

- **Reference Source.** No reference counterpart — this lesson writes
  `load_inventory`'s contract down explicitly for the first time and
  adds a dedicated test for it.
- **Files affected.** `inventory_cli.py`, modified — a real docstring
  added to `load_inventory`. `check_load_inventory_contract.py`,
  created.
- **Change type.** Add.
- **Location.** The docstring goes immediately inside `load_inventory`'s
  own `def` line, the same position Python docstrings always occupy.
- **Dependencies.** None beyond what `inventory-report` already has.

### The New Code

```python
    """Load an inventory from a JSON file at path.

    Contract:
    - Returns a dict mapping item name (str) to count (int, >= 0).
    - Raises ValueError if any count is not an int, or is negative.
    This contract must hold regardless of load_inventory's own
    internal implementation.
    """
```

### The Updated Project

`load_inventory`, in full, with the new docstring marked — the smallest
enclosing structure the new lines land inside:

```python
def load_inventory(path):
    """Load an inventory from a JSON file at path.                      # ← new

    Contract:                                                            # ← new
    - Returns a dict mapping item name (str) to count (int, >= 0).       # ← new
    - Raises ValueError if any count is not an int, or is negative.      # ← new
    This contract must hold regardless of load_inventory's own           # ← new
    internal implementation.                                             # ← new
    """                                                                  # ← new
    with open(path) as f:
        return parse_inventory(f)
```

### Mechanical Walkthrough

- **`"""Load an inventory from a JSON file at path. ... """`** — a
  docstring: a triple-quoted string written as the very first statement
  inside a function's body, the same construct `low_stock_items` has
  carried since Lesson 105. What's genuinely new here is not the
  syntax — it's the *purpose*: Lesson 105's own docstring described what
  the function does; this one states what it *promises*, phrased as
  requirements on the caller and guarantees in return, explicitly
  labeled "Contract," and explicitly stating that the promise, not the
  code beneath it, is what future changes are expected to preserve.
  Python itself treats this no differently than any other docstring —
  it's stored, inspectable via `load_inventory.__doc__`, and never
  enforced by the language itself; the enforcement is what this
  lesson's own new check file provides.

### CS Lens

```text
Also recognized in: a published HTTP API's own documented response
shape, which client applications are written against regardless of
which real backend implementation currently serves it, a hardware
interface specification (like USB or HDMI) that many different real
manufacturers build genuinely different, competing implementations
against, all expected to honor the identical published behavior, a
shipping company's stated delivery promise ("arrives within 3 days"),
checked against real outcomes regardless of which specific truck, route,
or driver actually made a given delivery
```

### SE Lens

The alternative is what every check in this project has done so far:
test the real, current implementation directly. That alternative isn't
wrong — it's exactly what proved `load_inventory`'s real behavior was
correct in the first place, in Lessons 121 and 122. What it doesn't do
on its own: signal, to a future engineer reading it, whether a given
assertion is testing an incidental detail of the current implementation
or an intentional, load-bearing promise other code depends on. The real
cost a contract test adds: writing the contract down explicitly, in
words, as this lesson's own docstring does — a real, ongoing commitment,
since a contract that's written down and then silently allowed to drift
from what the code actually does is arguably worse than no written
contract at all, an honest one. What it buys in return, proven directly
by this lesson's own investigation: a single test, written once, that
keeps testing the right thing even as the code underneath it legitimately
changes — exactly what let the identical `check_load_inventory_
contract.py` verify both Lesson 121's original implementation and
Lesson 126's split one, without a single line of the test itself
needing to change.

### Commands Needed

No new command — `python3 check_load_inventory_contract.py`, the same
invocation every check file in this project already uses.

### Run It

`check_load_inventory_contract.py`, in full:

```python
from inventory_cli import load_inventory

def check_load_inventory_contract_accepts_good_data():
    inventory = load_inventory("inventory.json")
    assert inventory == {"widgets": 2, "gadgets": 5, "gizmos": 8}
    for count in inventory.values():
        assert isinstance(count, int) and count >= 0
    print("check_load_inventory_contract_accepts_good_data passed")

def check_load_inventory_contract_rejects_non_numeric():
    try:
        load_inventory("inventory_bad.json")
        assert False, "expected ValueError, none was raised"
    except ValueError:
        print("check_load_inventory_contract_rejects_non_numeric passed")

def check_load_inventory_contract_rejects_negative():
    try:
        load_inventory("inventory_negative.json")
        assert False, "expected ValueError, none was raised"
    except ValueError:
        print("check_load_inventory_contract_rejects_negative passed")

check_load_inventory_contract_accepts_good_data()
check_load_inventory_contract_rejects_non_numeric()
check_load_inventory_contract_rejects_negative()
```

Run against `inventory_cli.py` exactly as Lesson 126 left it:

```text
$ python3 check_load_inventory_contract.py
check_load_inventory_contract_accepts_good_data passed
check_load_inventory_contract_rejects_non_numeric passed
check_load_inventory_contract_rejects_negative passed
```

Now, to prove this check is genuinely contract-level, `inventory_
cli.py`'s `load_inventory` and `parse_inventory` are temporarily
replaced with Lesson 121's own older, single-function version — a real,
different implementation of the identical contract, with `parse_
inventory` folded back into `load_inventory` directly:

```python
def load_inventory(path):
    """Load an inventory from a JSON file at path.

    Contract:
    - Returns a dict mapping item name (str) to count (int, >= 0).
    - Raises ValueError if any count is not an int, or is negative.
    This contract must hold regardless of load_inventory's own
    internal implementation.
    """
    with open(path) as f:
        inventory = json.load(f)
    for name, count in inventory.items():
        if not isinstance(count, int):
            raise ValueError("inventory count for " + name + " is not a number: " + repr(count))
        if count < 0:
            raise ValueError("inventory count for " + name + " cannot be negative: " + repr(count))
    return inventory
```

The exact same, unmodified `check_load_inventory_contract.py`, run
against this genuinely different implementation:

```text
$ python3 check_load_inventory_contract.py
check_load_inventory_contract_accepts_good_data passed
check_load_inventory_contract_rejects_non_numeric passed
check_load_inventory_contract_rejects_negative passed
```

Identical result. Not one line of the check changed, and it couldn't
tell the difference — because it was never testing `parse_inventory`'s
existence in the first place, only the promise both versions equally
keep. Lesson 126's split version is restored. Now, a real, plausible,
well-intentioned change: a future engineer, reasoning that rejecting a
negative count feels overly strict, quietly removes that check:

```python
def parse_inventory(f):
    inventory = json.load(f)
    for name, count in inventory.items():
        if not isinstance(count, int):
            raise ValueError("inventory count for " + name + " is not a number: " + repr(count))
        # negative-count check removed, on purpose - a well-intentioned "leniency" change
    return inventory
```

The same contract test, run against this real change:

```text
$ python3 check_load_inventory_contract.py
check_load_inventory_contract_accepts_good_data passed
check_load_inventory_contract_rejects_non_numeric passed
Traceback (most recent call last):
  File "/path/to/inventory-report/check_load_inventory_contract.py", line 26, in <module>
    check_load_inventory_contract_rejects_negative()
  File "/path/to/inventory-report/check_load_inventory_contract.py", line 20, in check_load_inventory_contract_rejects_negative
    assert False, "expected ValueError, none was raised"
           ^^^^^
AssertionError: expected ValueError, none was raised
```

Caught immediately — not because the new code crashes, or behaves
obviously wrong, but because it silently stopped keeping a promise this
lesson wrote down and gave its own dedicated test. The change is
reverted, restoring the negative-count check, and every check in the
project is confirmed passing:

```text
$ python3 check_load_inventory_contract.py
check_load_inventory_contract_accepts_good_data passed
check_load_inventory_contract_rejects_non_numeric passed
check_load_inventory_contract_rejects_negative passed
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
$ python3 -m mypy inventory_report.py
Success: no issues found in 1 source file
```

### Connecting Back

The isolated `is_even_v1`/`is_even_v2` example proved one check can
verify a shared promise across two genuinely different implementations.
`check_load_inventory_contract.py` proved the identical thing about
real project code — passing unmodified against both Lesson 121's
original implementation and Lesson 126's split one — and then proved
its own real worth by catching a plausible, silent, well-intentioned
change that quietly broke the promise neither implementation's own
code, read casually, would obviously look wrong for having made.

---

## Connect the Pieces

One written-down promise — "non-negative `int` counts, or a
`ValueError`" — moving through every piece this lesson built, start to
finish:

1. `load_inventory` gets a real docstring, explicitly labeled
   "Contract," stating that promise in words for the first time.
2. `check_load_inventory_contract.py` is written to test only that
   promise, never referencing `parse_inventory` or any other
   implementation detail.
3. Run against Lesson 126's current, split implementation, it passes.
4. Run again, unmodified, against Lesson 121's older, single-function
   implementation, restored temporarily, it passes identically —
   proving it's genuinely testing the promise, not the code.
5. A real, plausible, well-intentioned change — silently removing the
   negative-count rejection — is introduced. The same contract test
   fails immediately, naming exactly which promise was broken.
6. The change is reverted, and the full project suite, rerun in full,
   confirms nothing else was disturbed.

## What Breaks Without This

Without a contract explicitly written down, and a test built
specifically to protect it, "the code currently behaves this way" and
"the code is promised to behave this way, forever, for anyone relying
on it" are indistinguishable — both look like ordinary passing tests.
Restated plainly: this lesson's own investigation already showed the
consequence directly. A real, plausible, one-line change — the kind
that could pass a casual code review, since nothing about it looks
obviously wrong — silently broke a promise this project depends on,
and every prior check in the project, tuned to Lesson 121 and Lesson
122's own specific scenarios, still would have needed to be the one
that happened to test that exact scenario to catch it. A dedicated
contract test doesn't depend on that coincidence; it exists
specifically, and only, to protect the promise.

## Exercises

1. `low_stock_items` has never had its own contract written down
   explicitly, even though its real behavior — "returns a sorted list
   of names, strictly below `threshold`" — has been stable since Lesson
   105. Write that contract as a real docstring, then write
   `check_low_stock_items_contract.py`, and prove it passes unchanged
   whether or not `low_stock_items`'s own internal loop is rewritten as
   a list comprehension instead (try rewriting it, temporarily, to
   confirm).
2. This lesson's contract for `load_inventory` says nothing about what
   happens if `path` doesn't exist at all. Decide whether that's a real
   gap in the written contract or an intentional omission, and if it's
   a gap, add it explicitly, then extend the contract test to cover it.
3. Contract tests and Lesson 125's own stubs share something in common:
   both are written around a promise rather than one specific real
   scenario. Explain, in your own words, why a stub (used to isolate
   the *caller*, replacing what it depends on) and a contract test
   (used to protect the *callee*, verifying what it promises) are
   solving two different problems, even though both involve reasoning
   about a function's stated behavior rather than its literal code.

## Definition of Done

- [ ] `load_inventory` has a real docstring, explicitly labeled
      "Contract," stating what it returns and what it raises.
- [ ] `check_load_inventory_contract.py` exists, testing only the
      published contract, with no reference to `parse_inventory` or any
      other implementation detail.
- [ ] The same contract test file, run against Lesson 121's original,
      unsplit implementation (verified, then reverted), passes
      unmodified.
- [ ] The same contract test file, run against a version with the
      negative-count check removed (verified, then reverted), fails.
- [ ] Every other check file in the project still passes unchanged.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `write load_inventory's contract explicitly and test it
      directly; the same test now verifies any implementation that
      honors the promise, not just the current one` — not `add
      contract test`.

Next: Lesson 128 — Property-Based Testing.
