# Lesson 124: Mocks

**What you will build.** A real, on-purpose bug is introduced into
`restock_alert`: the call `low_stock_items(inventory, threshold)`
becomes `low_stock_items(threshold, inventory)` — the two arguments
silently swapped. Lesson 123's own `check_restock_alert_isolated.py`,
run against this real bug, keeps passing — its fake substitute for
`low_stock_items` ignores whatever it's actually called with, so it
never notices the swap. A new check, `check_restock_alert_mock.py`,
catches it immediately, by building a substitute that does something
Lesson 123's never did: it *records* the exact arguments it was called
with, and the test asserts on that recording directly. The transferable
problem this lesson names: Lesson 123 proved a test double can isolate
one unit's own logic from a collaborator's correctness — it never
proved the unit was calling that collaborator *correctly* in the first
place. Those are two different claims, and this lesson's own real bug
proves a stub alone can be completely blind to the second one.

**What you need to know first.** Lesson 123 (Test Doubles) —
specifically `check_restock_alert_isolated.py`, its `fake_low_stock_
items` substitute, and the monkey-patching mechanism (`try`/`finally`
around a module attribute reassignment) reused here without change.

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

Still **Verification**. Concrete value carried forward:
`restock_alert({"widgets": 2}, threshold=5)`, checked not only for what
it *returns* — Lesson 123's own question — but for exactly what
arguments it actually passes to `low_stock_items` along the way, a
question Lesson 123 never asked at all.

**Terms used in this lesson.**

- **Mock** — a test double that, beyond controlling what it returns,
  records how it was actually called — its arguments, how many times —
  so a test can assert directly on that recording. Why it's distinct
  from Lesson 123's own test double: `fake_low_stock_items` returned a
  fixed value but paid no attention whatsoever to what it was called
  with; a mock's entire additional purpose is paying attention.
- **State verification** — a test that checks a value: what did this
  function return, what does this object now contain. Every check in
  this project, including Lesson 123's stub-based one, has been state
  verification.
- **Behavior verification** — a test that checks an interaction: was
  this specific collaborator called, with these specific arguments, this
  many times. Why the distinction matters, proven concretely by this
  lesson's own bug: a test can perform perfect state verification — the
  right final value comes back — while the actual interaction that
  produced it was completely wrong, if whatever received that
  interaction didn't care what it was given.

**Objects and methods used.** No new external class or method — this
lesson's new code reuses only constructs already given full treatment
in this project: function definition and call, closures (a function
defined inside another function, reused from the same shape Lesson 123's
own module-level functions didn't need but this lesson's recording
mechanism does), list `.append()`, tuples, `assert`.

---

## Concept Unit: Mocks — Verifying the Interaction, Not Just the Answer

### The Problem

Lesson 123's `check_restock_alert_isolated.py` proves `restock_alert`
returns `["fake_item"]` when `low_stock_items` is replaced with
something that always returns `["fake_item"]`. But look at what
`fake_low_stock_items` actually does with the arguments it receives:
nothing. It ignores `inventory` and `threshold` completely, no matter
what they are. If `restock_alert` called it with the right values,
the wrong values, or the values in the wrong order entirely, the fake
would respond exactly the same way every time. Has Lesson 123's own
check actually verified that `restock_alert` calls its collaborator
correctly — or only that `restock_alert` correctly uses whatever comes
back, regardless of what was sent?

### Introduce the Concept in Isolation

A small, throwaway, unrelated pair of functions — never part of
`inventory-report` — makes the gap concrete. `calculate` calls `add`:

```python
def add(a, b):
    return a + b

def calculate(x):
    return add(x, 10)

print(calculate(5))
```

Run so far:

```text
15
```

Now `add` is replaced, the same monkey-patching mechanism Lesson 123
already used — but this substitute does one thing Lesson 123's own
fake never did: it records every call it receives, in a list, before
returning its own fixed value:

```python
calls = []
def mock_add(a, b):
    calls.append((a, b))
    return 999

add = mock_add
print(calculate(5))
print(calls)
```

The real output, continuing the same run:

```text
999
[(5, 10)]
```

`calculate(5)` now returns `999` — `mock_add`'s own fixed value, proving
the substitution worked, exactly the way Lesson 123's fake already
proved. But `calls` now also holds `[(5, 10)]` — the *exact* arguments
`calculate` actually passed to `add`, captured and inspectable after the
fact. This substitute — one that records what it was called with, not
just what it returns — is called a **mock**. Lesson 123's own
`fake_low_stock_items` performed only **state verification**: checking
the value that eventually came back. `calls`, inspected here, makes
**behavior verification** possible: checking the interaction itself,
independent of whether the returned value happened to look right.

### Discard the Throwaway Example

`add`, `calculate`, `mock_add`, and `calls` are not part of
`inventory-report` and will not appear in it. What survives is the
mechanism: a substitute function can record its own calls in an
ordinary list, closed over by the substitute itself, available for a
test to inspect once the code under test has finished running.

### Project Change

- **Reference Source.** No reference counterpart — this is a new check,
  extending Lesson 123's own monkey-patching technique with call
  recording.
- **Files affected.** `check_restock_alert_mock.py`, created.
- **Change type.** Add.
- **Location.** A new top-level file, alongside Lesson 123's own
  `check_restock_alert_isolated.py`, left completely unchanged.
- **Dependencies.** None beyond what `inventory-report` already has.

### The New Code

```python
def make_recording_low_stock_items():
    calls = []
    def mock_low_stock_items(inventory, threshold):
        calls.append((inventory, threshold))
        return ["fake_item"]
    mock_low_stock_items.calls = calls
    return mock_low_stock_items
```

### The Updated Project

`check_restock_alert_mock.py`, in full — a fresh, freestanding file, so
this is already its complete shape:

```python
import inventory_report

def make_recording_low_stock_items():                       # ← new
    calls = []                                                # ← new
    def mock_low_stock_items(inventory, threshold):           # ← new
        calls.append((inventory, threshold))                  # ← new
        return ["fake_item"]                                  # ← new
    mock_low_stock_items.calls = calls                        # ← new
    return mock_low_stock_items                                # ← new

def check_restock_alert_calls_low_stock_items_correctly():
    real_low_stock_items = inventory_report.low_stock_items
    mock = make_recording_low_stock_items()
    inventory_report.low_stock_items = mock
    try:
        sample_inventory = {"widgets": 2}
        result = inventory_report.restock_alert(sample_inventory, threshold=5)
        assert result == ["fake_item"]
        assert mock.calls == [(sample_inventory, 5)]
    finally:
        inventory_report.low_stock_items = real_low_stock_items
    print("check_restock_alert_calls_low_stock_items_correctly passed")

check_restock_alert_calls_low_stock_items_correctly()
```

### Mechanical Walkthrough

- **`def make_recording_low_stock_items():`** — a function whose whole
  job is to build and return a fresh mock, rather than being the mock
  itself.
- **`calls = []`** — a new, empty list, created fresh each time
  `make_recording_low_stock_items` runs — this is what will hold every
  call the mock receives.
- **`def mock_low_stock_items(inventory, threshold):`** — a function
  definition written *inside* another function. This is called a
  **closure**: the inner function, `mock_low_stock_items`, can see and
  use `calls` from the enclosing function's own scope, even after
  `make_recording_low_stock_items` itself has already finished running
  and returned.
- **`calls.append((inventory, threshold))`** — records this call,
  before doing anything else: `(inventory, threshold)` builds a tuple
  from the exact two arguments this call actually received, in the
  exact order they arrived, and `.append()` adds that tuple to `calls`.
- **`return ["fake_item"]`** — the same fixed return value Lesson 123's
  own fake used; recording a call and controlling a return value are
  two separate jobs, both happening inside the same substitute function.
- **`mock_low_stock_items.calls = calls`** — attaches the same `calls`
  list as an attribute directly on the mock function itself, under the
  name `.calls`. Functions are real objects in Python, capable of
  carrying their own attributes exactly like any other object — this is
  what makes `mock.calls`, used below, able to reach the recorded calls
  from outside the closure that originally created them.
- **`return mock_low_stock_items`** — hands the finished mock back to
  whatever called `make_recording_low_stock_items`.
- **`mock = make_recording_low_stock_items()`** — builds one fresh mock,
  with its own fresh, empty `calls` list.
- **`inventory_report.low_stock_items = mock`** — the same monkey-patch
  mechanism Lesson 123 already used, substituting the mock in place of
  the real function.
- **`sample_inventory = {"widgets": 2}`** — a real dictionary, saved
  under its own name specifically so it can be referred to again later,
  in the assertion, by identity, not retyped as a second, separately
  constructed literal.
- **`result = inventory_report.restock_alert(sample_inventory,
  threshold=5)`** — calls the real, unmodified `restock_alert`.
- **`assert result == ["fake_item"]`** — the same state verification
  Lesson 123 already performed: the returned value is exactly what the
  mock was told to return.
- **`assert mock.calls == [(sample_inventory, 5)]`** — the new
  behavior verification this lesson adds: `mock.calls` should hold
  exactly one recorded call, `(sample_inventory, 5)` — proving
  `restock_alert` passed `inventory` first and `threshold` second, in
  that exact order, the same order `low_stock_items` itself declares
  them in.

### CS Lens

```text
Also recognized in: a wiretap that doesn't alter a phone call at all
but records every number dialed, so an investigation can later prove
who called whom, a flight data recorder that doesn't fly the plane but
logs every control input a pilot actually made, a network proxy placed
between two real services specifically to log every request one sends
the other, without changing how either one behaves
```

### SE Lens

The alternative — Lesson 123's own state-verification-only test double —
is not wrong; it's still in this project, still passing, still proving
something real: `restock_alert`'s own list-comprehension logic is
correct, given whatever `low_stock_items` returns. What it cannot do,
proven directly by this lesson's own bug, is say anything at all about
*how* `restock_alert` reaches out to that collaborator. The real cost a
mock adds beyond a plain stub: the test itself grows more specific,
and more brittle in one particular way — asserting on the *exact*
arguments a collaborator was called with means the test now depends on
a specific detail of *how* the code under test is currently written,
not just on what it ultimately produces. If `restock_alert` were later
rewritten to call `low_stock_items` with keyword arguments instead of
positional ones (`low_stock_items(inventory=inventory,
threshold=threshold)`), producing the exact same correct behavior, this
lesson's own mock assertion — expecting a plain positional tuple —
would have to be rewritten to match, even though nothing about
`restock_alert`'s actual correctness changed. State verification checks
what a function promises; behavior verification checks how it currently
keeps that promise — a stronger, more specific claim, worth exactly as
much extra maintenance as it costs.

### Commands Needed

No new command — `python3 check_restock_alert_mock.py`, the same
invocation every check file in this project already uses.

### Run It

First, the real, on-purpose bug: `restock_alert`'s own call to
`low_stock_items` has its two arguments silently swapped.

```python
def restock_alert(inventory, threshold=3):
    return [name for name in low_stock_items(threshold, inventory)]  # ← bug, on purpose
```

Lesson 123's own stub-based check, run against this real bug:

```text
$ python3 check_restock_alert_isolated.py
check_restock_alert_isolated passed
```

Still green — `fake_low_stock_items` never looked at what it was
called with, so the swap is completely invisible to it. This lesson's
own mock-based check, run against the identical bug:

```text
$ python3 check_restock_alert_mock.py
Traceback (most recent call last):
  File "/path/to/inventory-report/check_restock_alert_mock.py", line 24, in <module>
    check_restock_alert_calls_low_stock_items_correctly()
  File "/path/to/inventory-report/check_restock_alert_mock.py", line 19, in check_restock_alert_calls_low_stock_items_correctly
    assert mock.calls == [(sample_inventory, 5)]
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

A real failure. `mock.calls` actually holds `[(5, {'widgets': 2})]` —
`threshold` and `inventory` arrived in the swapped order the bug
introduced — which does not equal the expected `[(sample_inventory,
5)]`. As a second, independent confirmation that this bug is real and
not just a quirk of the mock, `check_restock_alert.py` — Lesson 118's
own, completely unmocked check — is run too:

```text
$ python3 check_restock_alert.py
Traceback (most recent call last):
  File "/path/to/inventory-report/check_restock_alert.py", line 9, in <module>
    check_restock_alert()
  File "/path/to/inventory-report/check_restock_alert.py", line 6, in check_restock_alert
    assert result == ["widgets"]
           ^^^^^^^^^^^^^^^^^^^^^
AttributeError: 'int' object has no attribute 'items'
```

A real crash, for a different, cruder reason: with real arguments
actually swapped, `low_stock_items` receives `threshold` (an `int`) in
the position it expects `inventory` (a `dict`), and its own
`inventory.items()` call fails outright. The bug is reverted, restoring
the correct argument order, and every check is confirmed passing again:

```python
def restock_alert(inventory, threshold=3):
    return [name for name in low_stock_items(inventory, threshold)]
```

All three checks, rerun clean:

```text
$ python3 check_restock_alert.py
check_restock_alert passed
$ python3 check_restock_alert_isolated.py
check_restock_alert_isolated passed
$ python3 check_restock_alert_mock.py
check_restock_alert_calls_low_stock_items_correctly passed
```

### Connecting Back

The isolated `calculate`/`add`/`mock_add` example proved a substitute
can record what it's called with, not just control what it returns.
`check_restock_alert_mock.py` proved the identical mechanism catches a
real bug — arguments passed in the wrong order — that Lesson 123's own
stub-based check, checking only the final answer, was structurally
incapable of ever noticing.

---

## Connect the Pieces

One deliberately swapped call, `low_stock_items(threshold, inventory)`
instead of `low_stock_items(inventory, threshold)`, moving through
every piece this lesson built, start to finish:

1. The bug is introduced into `restock_alert`'s own single line of
   logic.
2. Lesson 123's `check_restock_alert_isolated.py`, run against it,
   passes — its fake ignores its own arguments entirely, so the swap
   is invisible to it.
3. This lesson's `check_restock_alert_mock.py`, run against the
   identical bug, fails — `mock.calls` records the real, swapped
   arguments, and the assertion comparing them to the expected order
   catches the mismatch directly.
4. `check_restock_alert.py`, Lesson 118's own unmocked check, is run
   as a second, independent confirmation — it crashes outright, for a
   cruder but related reason: the real, swapped-in `threshold` genuinely
   isn't a dictionary.
5. The bug is reverted, and all three checks — state-verifying,
   behavior-verifying, and fully real — pass again.

## What Breaks Without This

Lesson 123's own stub proved `restock_alert`'s logic is correct *given*
some fixed, assumed response from `low_stock_items` — a genuinely useful
and still-valid claim. What it never claimed, and what this lesson's
own bug exploits directly: that `restock_alert` actually reaches out to
`low_stock_items` the right way in the first place. Restated plainly:
state verification alone is blind to any bug that lives entirely in how
a collaborator is called, as long as the collaborator itself doesn't
care what it receives — which is exactly what a plain stub, by design,
never does. Without recording and asserting on the interaction itself,
a real, meaningful class of bug — wrong arguments, wrong order, a
collaborator called the wrong number of times — has no test in this
project capable of catching it, no matter how many state-verifying
checks already exist.

## Exercises

1. `check_restock_alert_mock.py` currently asserts `mock.calls` holds
   *exactly one* call. Call `restock_alert` a second time inside the
   same check, with a different sample inventory, and extend the
   assertion to confirm `mock.calls` now holds both recorded calls, in
   order.
2. Write a mock for `format_reorder_line`, patched into
   `build_reorder_report`'s own dependency, and assert on the exact
   `(name, qty)` pairs it was called with for a multi-item inventory —
   proving `build_reorder_report`'s loop visits every reorder
   suggestion, not just the first one.
3. This lesson's mock records calls in a plain Python list of tuples,
   built and maintained by hand. Research Python's own standard library
   `unittest.mock.Mock` class and identify what built-in attributes or
   methods it provides for the exact same purpose — call recording and
   call-count assertions — without necessarily rewriting this lesson's
   check to use it yet.

## Definition of Done

- [ ] `check_restock_alert_mock.py` exists, using
      `make_recording_low_stock_items` to build a mock that records
      every call it receives.
- [ ] The check asserts both on `restock_alert`'s returned value and on
      the exact arguments recorded in `mock.calls`.
- [ ] `check_restock_alert_mock.py` fails when `restock_alert`'s
      arguments to `low_stock_items` are deliberately swapped
      (verified, then reverted), while `check_restock_alert_isolated.py`
      does not.
- [ ] `restock_alert` calls `low_stock_items(inventory, threshold)`,
      in that order, and every check in the project passes.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `add check_restock_alert_mock; a recording test double caught a
      swapped-argument bug that Lesson 123's stub-based check couldn't
      see` — not `add mock test`.

Next: Lesson 125 — Stubs.
