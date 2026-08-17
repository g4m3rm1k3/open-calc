# Lesson 128: Property-Based Testing

**What you will build.** Every check in this project through Lesson 127
has followed the identical shape: pick one specific input, by hand,
work out the one correct answer for it, assert. This lesson writes a
different kind of check for `reorder_suggestion`: not "given this exact
inventory, expect this exact result," but a general rule — *every
reorder quantity `reorder_suggestion` produces must be positive* — and
hands the actual choice of inputs to `hypothesis`, a real, standard
property-based testing library, which generates hundreds of different
inventories, thresholds, and targets automatically and checks the rule
against every one. Run against `reorder_suggestion` exactly as Lesson
127 left it — which enforces `target > threshold` on its own — the rule
holds, every time. Run with that constraint deliberately removed,
`hypothesis` finds a real violation within its very first attempts, and
automatically shrinks it down to the smallest possible failing case:
`{"a": 0}`, `threshold=1`, `target=0`. The transferable problem this
lesson names: hand-picked examples only ever test what a human thought
to try; a property, checked against machine-generated inputs, tests
what the rule actually claims — for far more inputs than any person
would ever type by hand.

**What you need to know first.** Lesson 119 (Integration Tests) —
`reorder_suggestion`'s own real arithmetic, `target - count`, and the
exact `target <= threshold` bug that lesson found and fixed by adding a
precondition to `build_reorder_report`. Lesson 127 (Contract Tests) —
the idea of a function's own explicit, stated promise, which this
lesson's property is really just a different, machine-checked way of
expressing.

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
`reorder_suggestion`'s own real return-value property — every quantity
positive — checked not against one inventory but against hundreds,
generated and shrunk automatically down to `{"a": 0}`, `threshold=1`,
`target=0` the moment the property genuinely doesn't hold.

**Terms used in this lesson.**

- **Property-based testing** — testing that checks a general rule holds
  across many automatically generated inputs, rather than asserting on
  one hand-picked input and its one hand-computed expected output. Why
  it's a different kind of evidence than everything else in this
  domain: every check through Lesson 127 specified one exact answer for
  one exact input a person chose; a property-based test specifies a
  *rule*, and a real library chooses the inputs — including ones no
  person writing the test would have thought to try.
- **Property** — a statement that should hold true for every valid
  input a function can receive, phrased as a rule rather than a
  specific answer — "every returned quantity is positive," not
  "`reorder_suggestion({"widgets": 3}, threshold=5, target=15)` returns
  `{"widgets": 12}`."
- **Shrinking** — once a property-based testing library finds an input
  that violates a property, it doesn't stop there — it automatically
  searches for a smaller, simpler input that still fails the identical
  way, and reports that instead. Why it matters: a randomly generated
  failing input might be a large, messy dictionary with awkward values;
  a shrunk one is usually the smallest, clearest case that still proves
  the same point.
- **Precondition (revisited)** — a condition that must hold of a
  function's inputs for its result to be meaningful, reappearing here
  from Lesson 119's own use of the term: `target > threshold` is
  exactly this, and this lesson's own property test has to account for
  it explicitly or risk treating a correctly rejected bad input as if
  it were a real property violation.

**Objects and methods used.**

- **`hypothesis.given`**
  - *What it is:* a decorator from the real, third-party `hypothesis`
    library.
  - *Implementation:* `@given(name=strategy, ...)`, placed directly
    above a function definition, turns that function into a
    property-based test: instead of being called with no arguments,
    `hypothesis` calls it many times, once per generated set of
    arguments, each one produced by the given strategies.
  - *Its use:* the mechanism that turns `check_reorder_quantities_
    always_positive` from an ordinary function into something
    `hypothesis` itself repeatedly calls with different, automatically
    chosen arguments.
- **`hypothesis.strategies`** (imported as `st`)
  - *What it is:* a module from the `hypothesis` library, a real
    collection of composable generators.
  - *Implementation:* `st.integers(min_value=0, max_value=100)`
    describes "a random integer in this range"; `st.text(alphabet=...,
    min_size=1, max_size=8)` describes "a random short string built
    from these characters"; `st.dictionaries(keys_strategy,
    values_strategy, max_size=5)` describes "a random dictionary whose
    keys and values each come from their own given strategy, with at
    most this many entries" — a compound strategy built directly out of
    two simpler ones, shown here in full since it's assembled from
    other strategies rather than being a single, standalone value.
  - *Its use:* each strategy passed to `@given` describes the shape of
    one argument `hypothesis` will generate — `inventory`, `threshold`,
    and `target` in this lesson's own check.
- **`hypothesis.assume()`**
  - *What it is:* a function from the `hypothesis` library, callable
    only from inside a `@given`-decorated function.
  - *Implementation:* `assume(condition)` checks `condition`; if it's
    `False`, the current generated input is discarded immediately —
    treated as never having happened at all, not as a failure — and
    `hypothesis` moves on to a different generated input.
  - *Its use:* tells `hypothesis` that a generated `threshold`/`target`
    pair violating `reorder_suggestion`'s own real precondition isn't a
    property violation to report — it's simply not a valid input to
    check the property against in the first place.

---

## Concept Unit: Property-Based Testing — Letting a Machine Choose the Inputs

### The Problem

Every existing check on `reorder_suggestion` — Lesson 117's derived-
oracle comparison, Lesson 119's precondition check — uses a small
handful of hand-typed inventories: `{"widgets": 3, "gadgets": 8}`,
`{"widgets": 2, "gadgets": 5, "gizmos": 8}`, always the same few
item names, always small, ordinary numbers. `reorder_suggestion`'s own
real promise is broader than any of these examples: for *any* valid
inventory, threshold, and target, every quantity it returns should be
positive — a target genuinely can't be reordered down to zero or
below and still mean "reorder this." Has that broader claim actually
been tested, or only ever exercised for a few inputs one person
happened to type?

### Introduce the Concept in Isolation

A small, throwaway, unrelated function — never part of `inventory-
report` — makes the real mechanism concrete. `my_abs` is meant to
return a number's absolute value — always non-negative, whatever the
input:

```python
from hypothesis import given, strategies as st

def my_abs(n):
    if n > 0:
        return n
    return n
```

Read that function closely — the bug is real, not contrived to look
easy. The property, expressed as a check `hypothesis` will run
repeatedly, with a different, automatically chosen `n` each time:

```python
@given(st.integers())
def check_abs_never_negative(n):
    assert my_abs(n) >= 0

check_abs_never_negative()
```

Run for real:

```text
$ python3 property_lab.py
Traceback (most recent call last):
  File "/path/to/lab/property_lab.py", line 10, in check_abs_never_negative
    assert my_abs(n) >= 0
           ^^^^^^^^^^^^^^
AssertionError
Failing test case: check_abs_never_negative(
    n=-1,
)
```

`hypothesis` never needed to be told to try `-1` — `st.integers()`
describes "any integer at all," and `hypothesis` searched that space
itself, found a real failure, and **shrunk** it down to the smallest
possible counterexample: not some large, awkward negative number, but
`-1`, the simplest one that still proves the point. Reading `my_abs`
confirms exactly why: its second branch, meant to handle non-positive
numbers, returns `n` itself instead of `-n` — for any `n` less than or
equal to `0`, this returns a value that's still negative, or `0`
(which is at least correct by coincidence). Fixing the missing negation
and rerunning:

```python
def my_abs(n):
    if n > 0:
        return n
    return -n
```

Rerun against the same `check_abs_never_negative`, unchanged:

```text
$ python3 property_lab_fixed.py
check_abs_never_negative passed
```

### Discard the Throwaway Example

`my_abs` and `check_abs_never_negative` are not part of `inventory-
report` and will not appear in it. What survives is the method: state
the rule, describe the shape of valid inputs, and let `hypothesis`
search for a counterexample rather than hoping one gets typed by hand.

### Project Change

- **Reference Source.** No reference counterpart — this is a new check,
  and this lesson's own investigation additionally strengthens
  `reorder_suggestion` itself, moving `build_reorder_report`'s existing
  precondition down into the function it was actually protecting.
- **Files affected.** `check_reorder_suggestion_property.py`, created.
  `inventory_report.py`, modified — the `target > threshold` guard
  moved from `build_reorder_report` into `reorder_suggestion`.
- **Change type.** Add, then refactor.
- **Location.** The new check is a new top-level file; the guard moves
  to the top of `reorder_suggestion`'s own body.
- **Dependencies.** The real, third-party `hypothesis` package —
  `python3 -m pip install hypothesis` — the same kind of dependency
  Lesson 116 introduced for `mypy`.

### The New Code

```python
@given(
    inventory=st.dictionaries(
        st.text(alphabet="abcdefghij", min_size=1, max_size=8),
        st.integers(min_value=0, max_value=1000),
        max_size=5,
    ),
    threshold=st.integers(min_value=0, max_value=100),
    target=st.integers(min_value=0, max_value=100),
)
def check_reorder_quantities_always_positive(inventory, threshold, target):
    assume(target > threshold)
    suggestions = reorder_suggestion(inventory, threshold=threshold, target=target)
    for name, qty in suggestions.items():
        assert qty > 0
```

### The Updated Project

`check_reorder_suggestion_property.py`, in full — a fresh, freestanding
file, so this is already its complete shape:

```python
from hypothesis import given, assume, strategies as st
from inventory_report import reorder_suggestion

@given(                                                                            # ← new
    inventory=st.dictionaries(                                                     # ← new
        st.text(alphabet="abcdefghij", min_size=1, max_size=8),                    # ← new
        st.integers(min_value=0, max_value=1000),                                  # ← new
        max_size=5,                                                                # ← new
    ),                                                                             # ← new
    threshold=st.integers(min_value=0, max_value=100),                             # ← new
    target=st.integers(min_value=0, max_value=100),                                # ← new
)                                                                                   # ← new
def check_reorder_quantities_always_positive(inventory, threshold, target):        # ← new
    assume(target > threshold)                                                     # ← new
    suggestions = reorder_suggestion(inventory, threshold=threshold, target=target)  # ← new
    for name, qty in suggestions.items():                                          # ← new
        assert qty > 0                                                             # ← new

check_reorder_quantities_always_positive()
print("check_reorder_quantities_always_positive passed")
```

### Mechanical Walkthrough

- **`from hypothesis import given, assume, strategies as st`** — an
  import statement, the same construct every file in this project
  already uses, here pulling in three real names from the `hypothesis`
  package: `given` and `assume` (full treatment above), and
  `strategies`, imported under the shorter name `st` — a real,
  ordinary Python `import ... as` rename, not special `hypothesis`
  syntax.
- **`@given(inventory=..., threshold=..., target=...)`** — the
  decorator itself (full treatment above), here given three named
  strategies, one per parameter `check_reorder_quantities_always_
  positive` declares below it.
- **`st.dictionaries(st.text(...), st.integers(...), max_size=5)`** —
  the compound strategy for `inventory` (full treatment above): keys
  are short strings built only from the letters `a` through `j`, values
  are integers from `0` to `1000`, and the whole dictionary has at most
  `5` entries — deliberately small and simple, since the property being
  tested doesn't need large, realistic inventories to fail if it's
  going to fail at all.
- **`st.integers(min_value=0, max_value=100)`** — used twice, once each
  for `threshold` and `target`: any integer in that range, independent
  of one another — including, on purpose, combinations where `target`
  isn't actually greater than `threshold`.
- **`def check_reorder_quantities_always_positive(inventory, threshold,
  target):`** — a function definition whose three parameters exactly
  match `@given`'s own three named strategies; `hypothesis` fills each
  one in on every call.
- **`assume(target > threshold)`** — the first line inside the
  function: if `hypothesis` happened to generate a `target`/`threshold`
  pair that violates `reorder_suggestion`'s own real precondition, this
  call discards that specific attempt immediately, before it can be
  mistaken for a genuine property violation.
- **`suggestions = reorder_suggestion(inventory, threshold=threshold,
  target=target)`** — calls the real, already-checked
  `reorder_suggestion`, given full treatment again here per the
  Repetition Rule: returns a dict mapping each low-stock item's name to
  a suggested reorder quantity.
- **`for name, qty in suggestions.items():`** and
  **`assert qty > 0`** — the property itself, stated directly: every
  single quantity `reorder_suggestion` returned, for this one generated
  input, must be positive.

### CS Lens

```text
Also recognized in: a compiler's own test suite generating millions of
small, random, syntactically valid programs specifically to find inputs
that crash the compiler itself, cryptographic library testing that
generates random byte strings to confirm an encoding function and its
own matching decoding function always undo each other exactly, a
physics engine's own regression suite generating random starting
positions and velocities to confirm energy is never created or
destroyed by the simulation, no matter the specific numbers involved
```

### SE Lens

The alternative is every check already in this project: pick a few
representative inputs by hand, assert the exact expected answer for
each. That alternative isn't wrong — it's precise, easy to read, and
exactly right when there's one specific scenario worth naming and
protecting, the way Lesson 117's boundary case or Lesson 119's
precondition check both still are. What property-based testing adds:
the space of inputs `hypothesis` actually tries is far larger than any
person would type by hand, run after run, and it specifically searches
for the input that breaks the stated rule rather than confirming the
rule for whatever a person already believed was true. The real cost:
writing a genuine property is harder than writing one example — it
requires stating something true for *every* valid input, not just a
convenient one, and getting the valid-input boundary itself wrong (as
this lesson's own first attempt at this check, without `assume()`,
would have) produces confusing, misleading failures that look like real
bugs but are really just invalid inputs never excluded. A property-
based test is not a replacement for example-based checks — `hypothesis`
itself cannot know that `{"widgets": 3, "gadgets": 8}` is a
particularly meaningful inventory to a human reading this project;
only a hand-picked example, like every one already in this project, can
communicate that.

### Commands Needed

```text
$ python3 -m pip install hypothesis
```

The same `pip install <package>` shape Lesson 116 already used for
`mypy` — a third-party package, not part of Python's standard library,
installed once per environment.

### Run It

First, `reorder_suggestion` exactly as Lesson 127 left it — no guard
of its own; only `build_reorder_report` checks `target > threshold`,
one call away. A temporary, throwaway diagnostic script,
`check_reorder_property_no_guard.py` — never added to the project, only
used here to investigate — written *without* `assume()`, generating
`threshold` and `target` completely independently, on purpose, to probe
whether `reorder_suggestion` protects itself when called directly:

```text
$ python3 check_reorder_property_no_guard.py
Traceback (most recent call last):
  File "/path/to/inventory-report/check_reorder_property_no_guard.py", line 16, in check_reorder_quantities_always_positive_no_guard
    assert qty > 0
           ^^^^^^^
AssertionError
Failing test case: check_reorder_quantities_always_positive_no_guard(
    inventory={'a': 0},
    threshold=1,
    target=0,
)
```

Shrunk down to the smallest case that still fails: a single item,
`'a'`, with a count of `0`. `0 < threshold` (`0 < 1`) is `True`, so it's
correctly flagged as low stock — but `target - count` is `0 - 0`, which
is `0`, not positive. Calling `reorder_suggestion` directly — bypassing
`build_reorder_report`'s own guard entirely, exactly the way this
generated test case did — confirms it:

```text
$ python3 -c "from inventory_report import reorder_suggestion; print(reorder_suggestion({'a': 0}, threshold=1, target=0))"
{'a': 0}
```

`reorder_suggestion`, called directly, silently returns `{'a': 0}` —
"reorder `0` units" — nonsensical, and reachable by any caller other
than `build_reorder_report`, which is the only thing in this project
that happened to add a guard. The fix moves that guard to where it
actually belongs — inside the function whose own arithmetic depends on
it being true:

```python
def reorder_suggestion(inventory, threshold=3, target=15):
    if target <= threshold:
        raise ValueError("target must be greater than threshold")
    return {name: target - count for name, count in inventory.items() if count < threshold}

def build_reorder_report(inventory, threshold=3, target=15):
    suggestions = reorder_suggestion(inventory, threshold, target)
    lines = []
    for name, qty in sorted(suggestions.items()):
        lines.append(format_reorder_line(name, qty))
    return lines
```

`build_reorder_report`'s own separate check is removed — `reorder_
suggestion` now raises the identical `ValueError` on the very first
line it would have reached anyway, so `check_build_reorder_report_
rejects_target_below_threshold` (Lesson 119) needs no change at all.
This lesson's own new, `assume()`-guarded property test, run against
the fixed code:

```text
$ python3 check_reorder_suggestion_property.py
check_reorder_quantities_always_positive passed
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
$ python3 -m mypy inventory_report.py
Success: no issues found in 1 source file
```

### Connecting Back

The isolated `my_abs` example proved `hypothesis` can find and shrink a
real counterexample without any input being hand-picked by a person.
This lesson's own investigation proved the identical thing about real
project code — finding a real gap in `reorder_suggestion`'s own
self-protection that every hand-picked example in Lessons 117 and 119
had simply never happened to reach, since none of them ever called
`reorder_suggestion` directly with a bad `target`/`threshold` pair.

---

## Connect the Pieces

One machine-found, machine-shrunk counterexample, `{"a": 0}`,
`threshold=1`, `target=0`, moving through every piece this lesson
built, start to finish:

1. A property is stated: every quantity `reorder_suggestion` returns
   must be positive.
2. `hypothesis`, given strategies describing valid-shaped inventories,
   thresholds, and targets — deliberately generated independently of
   each other at first — searches for a counterexample.
3. It finds one within its very first attempts and shrinks it down to
   the smallest failing case: a single item with count `0`, `threshold=
   1`, `target=0`.
4. Calling `reorder_suggestion` directly with that exact input confirms
   it for real: `{'a': 0}` — a nonsensical "reorder zero units," and
   proof `reorder_suggestion` doesn't protect itself, relying entirely
   on `build_reorder_report`'s own separate guard.
5. The guard moves into `reorder_suggestion` itself, and `build_
   reorder_report`'s own redundant copy is removed.
6. The property test, now written with `assume(target > threshold)` to
   correctly exclude invalid inputs rather than mistake them for
   violations, passes — and the rest of the project's suite, rerun in
   full, confirms nothing else was disturbed.

## What Breaks Without This

Every check on `reorder_suggestion` before this lesson used a small,
fixed set of hand-typed examples, and every one of them happened to
call it either directly with a valid `target`/`threshold` pair, or
through `build_reorder_report`, which happened to guard it. Restated
plainly: "every example anyone tried worked" and "the function is
correct for every input" are different claims, and the gap between them
is exactly where `reorder_suggestion`'s own missing self-protection was
hiding — reachable the moment any future caller, anywhere in a larger
system, calls it directly instead of going through `build_reorder_
report`. Without generating inputs nobody thought to type by hand, that
gap had no real chance of being found before a real, wrong report
actually shipped to someone.

## Exercises

1. `low_stock_items` has its own real property, never yet stated as
   one: every name in its returned list should actually correspond to
   an item whose count is below the given threshold. Write a
   `hypothesis`-based property test for it, using a strategy shaped
   like this lesson's own `inventory` strategy.
2. This lesson's `inventory` strategy limits values to `0`–`1000` and
   keys to eight lowercase letters. Loosen both — allow larger integers,
   longer and more varied strings — rerun the property test, and note
   whether `hypothesis` finds anything new, or whether the property
   holds regardless of how extreme the generated inventory gets.
3. `build_reorder_report` no longer has its own `target > threshold`
   guard, since `reorder_suggestion` now enforces it before `build_
   reorder_report` ever gets the chance to fail on its own. Read
   through `check_build_reorder_report_rejects_target_below_threshold`
   (Lesson 119) once more and confirm, in a comment, exactly which
   function's `raise` statement that check is now actually exercising.

## Definition of Done

- [ ] `reorder_suggestion` raises `ValueError` directly when `target <=
      threshold`; `build_reorder_report` no longer duplicates that
      check.
- [ ] `check_reorder_suggestion_property.py` exists, using `hypothesis`
      with `assume(target > threshold)`, and passes.
- [ ] Calling `reorder_suggestion` directly with an invalid
      `target`/`threshold` pair raises `ValueError` immediately, not
      just when called through `build_reorder_report`.
- [ ] Every other check file in the project still passes unchanged.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `move the target>threshold guard into reorder_suggestion itself;
      a hypothesis-generated counterexample found it was silently
      wrong when called directly, bypassing build_reorder_report's
      own separate check` — not `add property test`.

Next: Lesson 129 — Generative Testing.
