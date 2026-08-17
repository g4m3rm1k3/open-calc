# Lesson 130: Fuzz Testing

**What you will build.** `check_parse_inventory_fuzz.py` — a new check
that doesn't test one chosen property against well-shaped inputs the
way Lessons 128 and 129 both did. Instead, it hands `parse_inventory` a
mix of genuinely different JSON shapes — objects, lists, numbers,
strings, `null`, booleans — and only checks one broad, crude thing: does
this ever crash with something other than a clean, intentional
`ValueError`? Run against `parse_inventory` exactly as Lesson 129 left
it, `hypothesis` finds a real crash within its first attempts, shrunk
down to the smallest possible case: a JSON file containing nothing but
`null`. `parse_inventory` was never written with the assumption that a
JSON *file* might not even contain a JSON *object* at all — every
example, boundary, and property test so far always started from a real
dictionary. The fix is one explicit `isinstance` check. The transferable
problem this lesson names: Lessons 128 and 129 both asked "does this
rule hold for every *valid* input" — a narrower, more disciplined
question than the one fuzzing asks: "does this ever break in a way
nobody accounted for, for *any* input at all, valid-shaped or not."

**What you need to know first.** Lesson 128 (Property-Based Testing) and
Lesson 129 (Generative Testing) — `hypothesis`, `@given`, and
`hypothesis.strategies`, all reused here, applied to a genuinely
different kind of question. Lesson 127 (Contract Tests) — `load_
inventory`'s own published contract, which this lesson's real finding
extends.

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

Still **Verification**. Concrete value carried forward: `parse_
inventory`, fed a JSON file containing nothing but the literal text
`null` — the smallest, strangest input `hypothesis` could shrink its
way down to, and one no hand-written example, boundary case, or
property test in this entire domain had ever tried.

**Terms used in this lesson.**

- **Fuzz testing (fuzzing)** — testing that feeds a function
  deliberately varied, unstructured, or malformed input — including
  shapes nobody would think to construct by hand — specifically to find
  crashes or unexpected failures, rather than to verify one specific,
  chosen property. Why it's distinct from Lessons 128 and 129: both of
  those started from a rule about *valid* inputs and generated inputs
  meant to satisfy it; fuzzing deliberately throws invalid, wrongly-
  shaped input in too, and asks a cruder, broader question about all of
  it at once.
- **Controlled failure** — a function rejecting bad input on purpose,
  with a clear, intentional, documented exception — every
  `raise ValueError(...)` in this project since Lesson 121 is one.
- **Uncontrolled failure** — a function crashing in a way nobody
  anticipated or wrote code for — an exception type never mentioned in
  any contract, docstring, or `except` clause anywhere. Why the
  distinction matters here specifically: `parse_inventory` rejecting bad
  data with `ValueError` is working as intended; `parse_inventory`
  crashing with `AttributeError` because nobody considered a JSON file
  might not even contain an object is exactly the kind of failure
  fuzzing exists to surface.

**Objects and methods used.**

- **`hypothesis.strategies.one_of()`**
  - *What it is:* a strategy combinator from the `hypothesis.strategies`
    module.
  - *Implementation:* `st.one_of(strategy_a, strategy_b, ...)` returns a
    new strategy that, each time a value is generated, picks one of the
    given strategies at random and draws from it — producing a genuine
    mix of differently shaped values across many runs, rather than
    values that all share one fixed shape.
  - *Its use:* generates a real mix of JSON-shaped Python values —
    dictionaries, lists, integers, strings, `None`, booleans — so
    `parse_inventory` is tested against far more than the one shape
    (always a dictionary) every prior check in this project has used.

---

## Concept Unit: Fuzz Testing — Throwing Everything at the Boundary

### The Problem

Every check on `parse_inventory` so far — Lessons 121, 122, 126, and
127 — starts from a real JSON *object*: `{"widgets": 2}`, `{"widgets":
0}`, `{"widgets": -1}`. Every one of those objects might be malformed
*inside* — a bad count, a negative one — but every single one is still,
at its outermost level, a JSON object. `inventory.json` is a real file,
maintained by a real person, the same as it's been since Lesson 121.
What happens if that file, through some real mistake, doesn't contain
an object at all?

### Introduce the Concept in Isolation

A small, throwaway, unrelated function — never part of `inventory-
report` — makes the real risk concrete. `average_score` expects a list
of numbers:

```python
from hypothesis import given, strategies as st

def average_score(scores):
    return sum(scores) / len(scores)
```

A mix of genuinely different shapes — not just lists, the one shape
`average_score` was actually written for:

```python
json_like_values = st.one_of(
    st.lists(st.integers(), min_size=1, max_size=5),
    st.integers(),
    st.text(),
    st.none(),
)

@given(json_like_values)
def check_average_score(value):
    average_score(value)

check_average_score()
```

Run for real:

```text
$ python3 fuzz_lab.py
Traceback (most recent call last):
  File "/path/to/lab/fuzz_lab.py", line 15, in check_average_score
    average_score(value)
  File "/path/to/lab/fuzz_lab.py", line 4, in average_score
    return sum(scores) / len(scores)
           ^^^^^^^^^^^
TypeError: 'NoneType' object is not iterable
Failing test case: check_average_score(
    value=None,
)
```

`average_score` was never written with `None` in mind — nothing about
it rejects `None` on purpose; it simply crashes the moment `sum(None)`
is attempted, with an exception type nobody chose or documented. This
deliberate mixing of shapes — valid and invalid, expected and
unexpected alike — specifically to surface a crash like this one, is
called **fuzz testing**.

### Discard the Throwaway Example

`average_score` and `check_average_score` are not part of
`inventory-report` and will not appear in it. What survives is the
technique: generate a genuine mix of differently shaped values, not
just variations on one assumed shape, and treat any crash outside a
function's own documented, intentional failures as a real finding worth
investigating.

### Project Change

- **Reference Source.** No reference counterpart — this is a new check,
  and this lesson's own investigation additionally strengthens `parse_
  inventory` against a shape of input it was never written to expect.
- **Files affected.** `check_parse_inventory_fuzz.py`, created.
  `inventory_cli.py`, modified — a new `isinstance` check inside
  `parse_inventory`, and its contract docstring updated to state it.
- **Change type.** Add, then fix.
- **Location.** The new check is a new top-level file; the fix lands at
  the top of `parse_inventory`'s own body, before its existing loop.
- **Dependencies.** None beyond what Lesson 128 already installed.

### The New Code

```python
    if not isinstance(inventory, dict):
        raise ValueError("inventory file must contain a JSON object, got: " + repr(inventory))
```

### The Updated Project

`check_parse_inventory_fuzz.py`, in full — a fresh, freestanding file:

```python
import io
import json
from hypothesis import given, strategies as st
from inventory_cli import parse_inventory

json_like_values = st.one_of(                                                # ← new
    st.dictionaries(st.text(min_size=1, max_size=5), st.integers()),          # ← new
    st.lists(st.integers(), max_size=5),                                     # ← new
    st.integers(),                                                            # ← new
    st.text(),                                                                # ← new
    st.none(),                                                                # ← new
    st.booleans(),                                                            # ← new
)                                                                             # ← new

@given(json_like_values)
def check_parse_inventory_never_crashes_unexpectedly(value):
    fake_file = io.StringIO(json.dumps(value))
    try:
        parse_inventory(fake_file)
    except ValueError:
        pass

check_parse_inventory_never_crashes_unexpectedly()
print("check_parse_inventory_never_crashes_unexpectedly passed")
```

And `parse_inventory` itself, with the new guard marked:

```python
def parse_inventory(f):
    inventory = json.load(f)
    if not isinstance(inventory, dict):                                                        # ← new
        raise ValueError("inventory file must contain a JSON object, got: " + repr(inventory))  # ← new
    for name, count in inventory.items():
        if not isinstance(count, int):
            raise ValueError("inventory count for " + name + " is not a number: " + repr(count))
        if count < 0:
            raise ValueError("inventory count for " + name + " cannot be negative: " + repr(count))
    return inventory
```

### Mechanical Walkthrough

- **`json_like_values = st.one_of(...)`** — full treatment of
  `st.one_of()` above; the six strategies inside it, taken together,
  cover every kind of top-level value real JSON can actually represent:
  an object (`st.dictionaries(...)`), an array (`st.lists(...)`), a
  number (`st.integers()`), a string (`st.text()`), `null`
  (`st.none()`), and a boolean (`st.booleans()`).
- **`fake_file = io.StringIO(json.dumps(value))`** — `json.dumps(value)`
  (the real inverse of `json.load`, already used throughout this
  project) turns whatever Python value `hypothesis` generated back into
  real JSON text; `io.StringIO(...)` wraps that text as a real,
  in-memory fake file, the same technique Lesson 126 already
  established.
- **`try: parse_inventory(fake_file) except ValueError: pass`** — calls
  the real function under test, and explicitly accepts one, and only
  one, kind of failure: a `ValueError`, `parse_inventory`'s own
  documented, controlled way of rejecting bad input. Any *other*
  exception type is deliberately left uncaught here, so it propagates
  and fails the check — the entire point of this fuzz test is
  distinguishing an intentional rejection from an accidental crash.
- **`if not isinstance(inventory, dict):`** — the fix itself: checks,
  immediately after parsing, that the top-level JSON value really is an
  object (a Python `dict`), before anything else in this function
  assumes it is.
- **`raise ValueError("inventory file must contain a JSON object, got:
  " + repr(inventory))`** — the same message-building style this
  project has used since Lesson 121, naming exactly what was found
  instead of the object that was expected.

### CS Lens

```text
Also recognized in: a real security research technique of the same
name, feeding genuinely malformed or unexpected byte sequences into
file parsers, network protocol handlers, and image decoders
specifically to find crashes that might indicate a real, exploitable
vulnerability, an air traffic control system's own testing regime
deliberately including impossible or contradictory sensor readings, not
just realistic ones, to confirm the system fails safely rather than
unpredictably, a web form's own real-world testing including pasted
emoji, extremely long text, and other input real users genuinely type
by accident, not just the clean values a developer would think to try
```

### SE Lens

The alternative — every check through Lesson 129 — generates inputs
shaped the way the function under test was *designed* to receive them:
a real dictionary, real integers, a real valid `(threshold, target)`
pair. That alternative is exactly right for verifying a stated property
holds across the *valid* input space — Lesson 129's own SE Lens already
made this case directly. What it structurally cannot do: say anything
about what happens outside that space, because it was never designed to
go there. The real cost fuzzing adds: most of what it generates is
genuinely useless as realistic input — nobody's `inventory.json` will
ever really contain a bare JSON number — and a large fraction of fuzz
runs simply confirm a controlled `ValueError`, over and over, with
nothing new to report. What it buys in return, proven directly here: the
one shape nobody thought to try — a JSON file that isn't an object at
all — is precisely the shape that was still broken, invisible to every
other kind of test in this entire domain, because every one of them
started from an assumption fuzzing doesn't share.

### Commands Needed

No new command — `python3 check_parse_inventory_fuzz.py`, the same
invocation Lesson 128 already established for `hypothesis`-based
checks.

### Run It

`check_parse_inventory_fuzz.py`, run against `parse_inventory` exactly
as Lesson 129 left it — no guard against a non-object top level:

```text
$ python3 check_parse_inventory_fuzz.py
Traceback (most recent call last):
  File "/path/to/inventory-report/check_parse_inventory_fuzz.py", line 19, in check_parse_inventory_never_crashes_unexpectedly
    parse_inventory(fake_file)
  File "/path/to/inventory-report/inventory_cli.py", line 7, in parse_inventory
    for name, count in inventory.items():
                       ^^^^^^^^^^^^^^^
AttributeError: 'NoneType' object has no attribute 'items'
Failing test case: check_parse_inventory_never_crashes_unexpectedly(
    value=None,
)
```

Shrunk to the simplest possible failing case: a JSON file whose entire
content is the literal text `null`. `json.load` parses `null` into
Python's own `None`, exactly the way it correctly parses `{"widgets":
2}` into a real dictionary — nothing about the *parsing* is wrong.
`parse_inventory`'s own very next line, `inventory.items()`, simply
assumed `inventory` would always be something with an `.items()` method
at all. With the guard added:

```text
$ python3 check_parse_inventory_fuzz.py
check_parse_inventory_never_crashes_unexpectedly passed
```

`load_inventory`'s own published contract (Lesson 127) is updated to
state the new, real guarantee explicitly:

```python
def load_inventory(path):
    """Load an inventory from a JSON file at path.

    Contract:
    - Returns a dict mapping item name (str) to count (int, >= 0).
    - Raises ValueError if the file's own top-level JSON is not an
      object, or if any count is not an int, or is negative.
    This contract must hold regardless of load_inventory's own
    internal implementation.
    """
```

And the rest of the project's suite, confirmed undisturbed:

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
$ python3 -m mypy inventory_report.py
Success: no issues found in 1 source file
```

### Connecting Back

The isolated `average_score` example proved a genuine mix of shapes,
not just variations on one assumed one, can find a crash no hand-picked
example would. `check_parse_inventory_fuzz.py` proved the identical
thing about real project code — finding, and fixing, a real gap in
`parse_inventory`'s own defenses that had survived every example,
boundary, and property test written across ten prior lessons in this
domain, because every one of them, without exception, always started
from a real JSON object.

---

## Connect the Pieces

One shrunk, minimal, genuinely unexpected input — a JSON file
containing only `null` — moving through every piece this lesson built,
start to finish:

1. `json_like_values` is built from six different strategies, covering
   every shape real JSON can take at its top level, not just objects.
2. `check_parse_inventory_never_crashes_unexpectedly` accepts a
   `ValueError` as a correct, controlled outcome, and lets anything
   else propagate as a real failure.
3. `hypothesis` finds a real crash and shrinks it to the simplest case:
   `value=None`, meaning the fake file's own content is `null`.
4. `parse_inventory`'s real `inventory.items()` call crashes with
   `AttributeError` — an exception type nobody wrote code for anywhere
   in this project.
5. An `isinstance(inventory, dict)` guard is added, and `load_
   inventory`'s own published contract is updated to name the new
   guarantee explicitly.
6. The fuzz check passes, and the rest of the project's suite, rerun in
   full, confirms nothing else was disturbed.

## What Breaks Without This

Ten lessons' worth of checks on `parse_inventory` and its collaborators
— examples, boundaries, fakes, a written contract, properties — all
shared one silent, unexamined assumption: that whatever comes back from
`json.load` will always be a dictionary. Restated plainly: every one of
those techniques is genuinely good at the question it was built to
answer, and none of them was ever asking the question fuzzing asks.
Without deliberately including shapes of input nobody assumed would
show up, a real crash — reachable by nothing more exotic than a JSON
file that happens to contain `null`, `42`, or `[1, 2, 3]` instead of an
object — has no test in this project capable of finding it before a
real file, edited by a real person one day, does.

## Exercises

1. `check_parse_inventory_fuzz.py`'s own `json_like_values` strategy
   never generates deeply nested structures — a list of lists, or a
   dictionary whose values are themselves dictionaries. Extend it with
   `st.recursive()` (research its real signature in `hypothesis`'s own
   documentation) and see whether any new, unexpected crash turns up.
2. `main` itself, in `inventory_cli.py`, has never been fuzzed at the
   command-line level the way Lesson 120's own system test exercised it
   normally. Using `subprocess.run`, write a fuzz test that generates
   random short strings for the `threshold` command-line argument (not
   just valid integers) and confirms `inventory_cli.py` always exits
   with a real, controlled error message rather than an unhandled
   traceback reaching the terminal.
3. This lesson's fix accepts a `ValueError` as always correct, without
   checking its actual message. Extend `check_parse_inventory_never_
   crashes_unexpectedly` to also assert that the raised message
   actually mentions the real value that was rejected, the same
   standard Lesson 121's own error messages were held to.

## Definition of Done

- [ ] `parse_inventory` raises `ValueError` immediately if the parsed
      JSON is not a `dict`, before attempting `.items()` on it.
- [ ] `load_inventory`'s own contract docstring states this guarantee
      explicitly.
- [ ] `check_parse_inventory_fuzz.py` exists, using `st.one_of()` to
      generate a genuine mix of JSON-shaped values, and passes.
- [ ] Every other check file in the project still passes unchanged.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `reject non-object JSON in parse_inventory; a fuzz test found a
      bare null crashed with AttributeError instead of the documented
      ValueError` — not `add fuzz test`.

Next: Lesson 131 — Mutation Testing.
