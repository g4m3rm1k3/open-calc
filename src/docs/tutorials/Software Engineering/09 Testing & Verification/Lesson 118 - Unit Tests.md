# Lesson 118: Unit Tests

**What you will build.** `restock_alert` — present since Lesson 105,
still with no check of its own — gets one: `check_restock_alert.py`,
written in the exact same human-oracle style as every check so far. It
passes immediately. Then, on purpose, `low_stock_items` — a completely
different function `restock_alert` merely calls — is broken with a
one-character regression, while `restock_alert`'s own source is left
completely untouched. `check_restock_alert.py` fails anyway. The
transferable problem this lesson names directly: every check written in
this project so far has been informally called a "test," and this
lesson shows that being loosely correct is not the same as being a real
**unit test** — a test whose failure points at exactly one piece of
code, not at that piece of code *and* everything it happens to call.

**What you need to know first.** Lesson 115 (Why Test?) — the
`check_<something>` pattern reused unchanged again here. Lesson 117
(Test Oracles) — a human oracle, the kind `check_restock_alert.py`
itself uses. This lesson also reuses `restock_alert` and
`low_stock_items` from `inventory_report.py`, specifically the fact,
established when both were first written, that `restock_alert`'s own
body does nothing but call `low_stock_items` and pass its result
through.

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

Still **Verification** — the same stage every lesson in this domain has
placed `inventory-report` on so far. This lesson's own concrete value at
that stage: `restock_alert({"widgets": 2, "gadgets": 5, "gizmos": 8},
threshold=5)`, checked once while `low_stock_items` is correct, and
checked again, on purpose, while `low_stock_items` is broken — proving,
with a real run rather than an assertion about it, that this particular
check's pass/fail verdict was never actually isolated to `restock_alert`
alone.

**Terms used in this lesson.**

- **Unit** — the smallest piece of code being held responsible, on its
  own, for a given test's pass-or-fail verdict — in a project built
  entirely from plain functions like `inventory-report`, usually a
  single function. Why it needs a name: "test the code" doesn't say how
  small a slice of the code a given test is actually supposed to be
  judging.
- **Unit test** — a test that exercises exactly one unit, in isolation
  from whether the things that unit depends on are themselves correct,
  so that a failure points unambiguously at that one unit. Why the
  definition matters, not just the label: every check written in this
  project so far has been informally called a "unit test," and this
  lesson proves, with a real broken run, that at least one of them
  doesn't actually meet this definition — it just happened to agree
  with it as long as nothing else was ever wrong at the same time.
- **Collaborator** — a separate piece of code that a given unit depends
  on to do its own job — a function it calls, in this project's case —
  rather than something the unit defines or computes itself. Why it
  needs a name: "isolated from its collaborators" is meaningless without
  a word for the specific things being isolated *from*.
- **Regression** — a piece of code that used to behave correctly and
  now doesn't, because of a later change to it or to something it
  depends on. Why it matters here: the whole demonstration in this
  lesson is a deliberate, one-line regression, introduced on purpose and
  removed afterward, exactly the way Lesson 115 introduced one in
  `low_stock_items` to prove a different point.

**Objects and methods used.** No new external class or method — this
lesson's new code reuses only constructs already given full treatment
in this project: `import`, function definition and call, list
comprehension, `assert`, `print`.

---

## Concept Unit: A Test That Isn't Actually Isolated

### The Problem

`restock_alert` has existed since Lesson 105:

```python
def restock_alert(inventory, threshold=3):
    return [name for name in low_stock_items(inventory, threshold)]
```

It has never had a check written for it. Writing one the way every
other check in this project has been written is straightforward: pick
an inventory, work out by hand what `restock_alert` should return for
it, assert against that. But look at what `restock_alert`'s own body
actually does: it doesn't compute anything on its own at all — it
calls `low_stock_items` and passes the result straight through a list
comprehension that doesn't even filter or transform anything. So when a
check on `restock_alert` passes, what has actually been shown to be
correct: `restock_alert`'s own logic, `low_stock_items`'s logic, or
both at once, indistinguishably?

### Introduce the Concept in Isolation

A small, throwaway, unrelated pair of functions — never part of
`inventory-report` — makes the question concrete. `add_two` doesn't
compute anything on its own either; it calls `add_one` twice:

```python
def add_one(n):
    return n + 1

def add_two(n):
    return add_one(add_one(n))

def check_add_two():
    result = add_two(5)
    assert result == 7
    print("check_add_two passed")

check_add_two()
```

Run directly, this passes:

```text
$ python3 unit_lab.py
check_add_two passed
```

Now `add_one` — and only `add_one` — is deliberately broken, changing
`return n + 1` to `return n + 2`. `add_two`'s own source is not touched
at all:

```python
def add_one(n):
    return n + 2  # ← broken, on purpose

def add_two(n):
    return add_one(add_one(n))
```

Run again, with no other change:

```text
$ python3 unit_lab.py
Traceback (most recent call last):
  File "/path/to/lab/unit_lab.py", line 12, in <module>
    check_add_two()
  File "/path/to/lab/unit_lab.py", line 9, in check_add_two
    assert result == 7
           ^^^^^^^^^^^
AssertionError
```

`check_add_two` fails. `add_two`'s own code — one line, one function
call chain — never changed. The failure is real, but it does not, on
its own, say whether `add_two` is broken, whether `add_one` is broken,
or whether both are. This is exactly what makes a test a genuine **unit
test** or not: not whether it uses `assert`, not whether it's automated,
but whether a failure can be trusted to mean *this specific unit* is
wrong, as opposed to *something somewhere in this call chain* is wrong.
`check_add_two`, exactly as written, is not one — it's a test of
`add_two` and `add_one` together, whether that was intended or not.

### Discard the Throwaway Example

`add_one`, `add_two`, and `check_add_two` are not part of
`inventory-report` and will not appear in it. What survives is the
question just proven real: a passing or failing check on a function
that calls another function is a check on *both*, not on the outer one
alone, unless something specifically prevents that.

### Project Change

- **Reference Source.** No reference counterpart — `restock_alert` has
  existed since Lesson 105 with no check of any kind; this is a
  from-scratch addition.
- **Files affected.** `check_restock_alert.py`, created.
- **Change type.** Add.
- **Location.** A new top-level file, alongside the project's other
  `check_*.py` files.
- **Dependencies.** None beyond what `inventory-report` already has.

### The New Code

```python
def check_restock_alert():
    inventory = {"widgets": 2, "gadgets": 5, "gizmos": 8}
    result = restock_alert(inventory, threshold=5)
    assert result == ["widgets"]
    print("check_restock_alert passed")
```

### The Updated Project

`check_restock_alert.py`, in full — a fresh, freestanding file, so this
is already its complete, final shape:

```python
from inventory_report import restock_alert

def check_restock_alert():
    inventory = {"widgets": 2, "gadgets": 5, "gizmos": 8}
    result = restock_alert(inventory, threshold=5)
    assert result == ["widgets"]
    print("check_restock_alert passed")

check_restock_alert()
```

### Mechanical Walkthrough

- **`from inventory_report import restock_alert`** — an import
  statement, the same construct every prior check file already uses,
  making the real `restock_alert` function available here by name.
- **`def check_restock_alert():`** — a function definition, the same
  `check_<something>` naming and shape Lesson 115 established: a
  parameterless function meant to be called once, immediately, at the
  bottom of this file.
- **`inventory = {"widgets": 2, "gadgets": 5, "gizmos": 8}`** — a
  literal dictionary, reused as the exact sample inventory Lesson 115's
  own `check_low_stock_items` already used, so the expected result below
  can be reasoned about the same way it was there.
- **`result = restock_alert(inventory, threshold=5)`** — calls the real
  `restock_alert`, passing `inventory` and an explicit `threshold=5`
  (overriding its default of `3`), and binds whatever it returns to
  `result`.
- **`assert result == ["widgets"]`** — a human oracle, the same
  mechanism Lesson 117 named directly: `["widgets"]` is a value worked
  out by hand, reasoning through `restock_alert`'s call into
  `low_stock_items` (`widgets` at `2` is below `threshold=5`; `gadgets`
  at exactly `5` is not, matching the strictly-below rule Lesson 117
  already confirmed and fixed the documentation for; `gizmos` at `8` is
  not).
- **`print("check_restock_alert passed")`** — the same success-line
  convention every prior check file uses, printed only if the line
  above it didn't already stop execution.
- **`check_restock_alert()`** — calls the function immediately, at
  module scope, the same way every prior check file's own final line
  does.

### CS Lens

```text
Also recognized in: a single failing light on a car's dashboard that
could mean the sensor is broken or the actual part it's monitoring is
broken, a factory inspection that only checks a finished product at
the very end of the assembly line and can't say which of twenty
upstream stations actually introduced the defect, a stack trace that
names the function where an exception was ultimately raised without
distinguishing whether the bug is really there or three calls further
up the chain
```

The general idea — a signal that something is wrong, without pinpointing
*where* along a chain of dependencies the actual fault lives — is
sometimes called the **fault localization problem**: a failing check is
only as useful as how precisely it narrows down where to look next.

### SE Lens

The alternative already exists and is exactly what got written first in
this unit: a check that calls `restock_alert` directly and asserts on
its result, the same shape every other check in this project uses. That
alternative is not wrong to write — it caught nothing false, and it
still passed when the code was actually correct. What it does not do,
proven with a real regression and a real failing run, is tell the
difference between "`restock_alert`'s own logic is wrong" and
"something `restock_alert` calls is wrong." The real cost of *not*
having that distinction: in a project this small, with one collaborator
one call deep, a human can still work out the real cause by reading the
traceback and reasoning about it, the way this lesson's own
investigation just did. That cost grows directly with the size of the
call chain underneath the unit actually being tested — a function three
or four collaborators deep, in a much larger project, produces the
identical kind of failure with far more places the real fault could be
hiding. Genuinely isolating a unit from a real collaborator — replacing
`low_stock_items` with a stand-in whose behavior is controlled directly
by the check itself, so a broken `low_stock_items` can no longer make
`check_restock_alert` fail at all — needs its own dedicated mechanism.
That mechanism is called a **test double**, and it is Lesson 123's own,
full subject; this lesson deliberately stops at naming the gap and
proving it's real, not closing it.

### Commands Needed

No new command — `python3 check_restock_alert.py`, the same invocation
every check file in this project already uses.

### Run It

First, with `inventory_report.py` exactly as Lesson 117 left it:

```text
$ python3 check_restock_alert.py
check_restock_alert passed
```

Now, `low_stock_items`'s own condition is changed from `count <
threshold` to `count > threshold` — a genuine, one-character regression,
with `restock_alert`'s own source left completely untouched:

```python
def low_stock_items(inventory, threshold=3):
    """Return names of items strictly below the given threshold."""
    low = []
    for name, count in inventory.items():
        if count > threshold:  # ← regression, on purpose
            low.append(name)
    return sorted(low)
```

`check_restock_alert.py`, run again, with no change to `restock_alert`
itself:

```text
$ python3 check_restock_alert.py
Traceback (most recent call last):
  File "/path/to/inventory-report/check_restock_alert.py", line 9, in <module>
    check_restock_alert()
  File "/path/to/inventory-report/check_restock_alert.py", line 6, in check_restock_alert
    assert result == ["widgets"]
           ^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

A real failure. Checking what `restock_alert` actually returned in this
broken state confirms exactly why:

```text
$ python3 -c "from inventory_report import restock_alert, low_stock_items; inventory = {'widgets': 2, 'gadgets': 5, 'gizmos': 8}; print('low_stock_items:', low_stock_items(inventory, threshold=5)); print('restock_alert:  ', restock_alert(inventory, threshold=5))"
low_stock_items: ['gizmos']
restock_alert:   ['gizmos']
```

`low_stock_items` now returns `['gizmos']` — `gizmos` at `8` is now
`> 5`, so it's wrongly included, while `widgets` at `2` is no longer
`> 5`, so it's wrongly excluded. `restock_alert` passes that broken
result straight through, unchanged, exactly as its own one-line body
always has. `check_low_stock.py`, run for comparison, fails with the
identical `AssertionError` shape, on the actual unit that's actually
broken:

```text
$ python3 check_low_stock.py
Traceback (most recent call last):
  File "/path/to/inventory-report/check_low_stock.py", line 9, in <module>
    check_low_stock_items()
  File "/path/to/inventory-report/check_low_stock.py", line 6, in check_low_stock_items
    assert result == ["widgets"]
           ^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

Two different check files, two identical-looking failures, from one
single-character regression in one function neither check file
directly modifies the source of. Nothing about reading
`check_restock_alert.py`'s own failure, on its own, distinguishes "I am
broken" from "something I called is broken." The regression is now
reverted, restoring `count < threshold`, and both checks are confirmed
passing again:

```text
$ python3 check_restock_alert.py
check_restock_alert passed
$ python3 check_low_stock.py
check_low_stock_items passed
```

### Connecting Back

The isolated `add_one`/`add_two` example proved, with a throwaway
regression, that a passing or failing test on a function that calls
another function is really a test of both together.
`check_restock_alert.py` proved the identical thing about real project
code: it is a genuine, useful check, and it is not, on its own, a fully
isolated unit test of `restock_alert` alone — a distinction this lesson
can now name precisely, even though closing the actual gap waits for
Lesson 123.

---

## Connect the Pieces

One concrete inventory, `{"widgets": 2, "gadgets": 5, "gizmos": 8}`,
moving through every piece this lesson built, start to finish:

1. `check_restock_alert.py` is written, human-oracle style, and passes
   against the real, correct project.
2. `low_stock_items`'s condition is changed from `count < threshold` to
   `count > threshold` — a real regression — with `restock_alert`'s own
   source left untouched.
3. `check_restock_alert.py`, rerun with no change to `restock_alert`
   itself, fails with a real `AssertionError`.
4. Calling both functions directly confirms why: `low_stock_items` now
   returns `['gizmos']` instead of `['widgets']`, and `restock_alert`
   passes that wrong value straight through, exactly as its own
   one-line body always does.
5. `check_low_stock.py`, `restock_alert`'s collaborator's own check,
   fails with the identical shape of error at the same moment — proving
   neither check file, read on its own, can distinguish which function
   actually caused the failure.
6. The regression is reverted, and both checks pass again — confirming
   the fault really was isolated to `low_stock_items` alone, even though
   neither check's own pass/fail verdict, by itself, ever said so.

## What Breaks Without This

This lesson's whole demonstration already *is* "what breaks" — a
regression in one function silently breaking the reported verdict of a
check that names a completely different function. Restated plainly,
because it's easy to read past: nothing here is a flaw in `assert`,
`check_restock_alert.py`, or the human-oracle value `["widgets"]`,
which was and still is correct. What's missing is a way to ask a
narrower question than "does `restock_alert` return the right final
answer" — specifically, "does `restock_alert`'s own logic behave
correctly, assuming whatever it calls behaves however it's told to,"
regardless of whether that assumption currently holds. Without a way to
make that assumption explicit and controllable, every check on
`restock_alert` will keep silently doubling as a check on
`low_stock_items` too, for as long as the one calls the other.

## Exercises

1. `restock_alert`'s own body, `[name for name in low_stock_items(
   inventory, threshold)]`, doesn't filter or transform anything the
   list comprehension wraps around it — try rewriting it as
   `return low_stock_items(inventory, threshold)` directly, rerun
   `check_restock_alert.py`, and confirm it still passes. (This doesn't
   change anything this lesson is about — it's a real, honest
   observation that the list comprehension was never doing any work —
   but it's worth seeing for yourself before moving on.)
2. Introduce a second, different regression — change `target - count`
   to `count - target` inside `reorder_suggestion` — and run every
   check file in the project (`check_low_stock.py`,
   `check_restock_alert.py`, `check_format_reorder_line.py`,
   `check_format_reorder_line_priced.py`, `check_reorder_suggestion.py`).
   Note exactly which ones fail and which ones stay green — and notice
   that this particular regression, unlike this lesson's own example,
   does *not* spread beyond the one function it's actually inside.
   Revert it afterward.
3. Without writing any code yet, describe in your own words what a
   stand-in for `low_stock_items` would need to do for
   `check_restock_alert.py` to keep passing regardless of whether the
   real `low_stock_items` is currently broken. Lesson 123 (Test Doubles)
   is where that description gets a real name and a real implementation.

## Definition of Done

- [ ] `check_restock_alert.py` exists, passes against the correct
      project, and uses the same `check_<something>` / `assert` /
      `print` shape as every other check file.
- [ ] The regression demonstrated in this lesson (`count > threshold`
      inside `low_stock_items`) is reverted — `inventory_report.py`
      matches Lesson 117's own ending state exactly.
- [ ] `check_low_stock.py`, `check_restock_alert.py`,
      `check_format_reorder_line.py`, `check_format_reorder_line_priced.py`,
      and `check_reorder_suggestion.py` all pass.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `add check_restock_alert; a regression in low_stock_items proved
      it isn't isolated from that collaborator yet` — not `add test`.

Next: Lesson 119 — Integration Tests.
