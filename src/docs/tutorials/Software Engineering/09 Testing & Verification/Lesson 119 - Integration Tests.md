# Lesson 119: Integration Tests

**What you will build.** `build_reorder_report`, a new function that
combines two pieces already proven correct on their own —
`reorder_suggestion` (Lesson 117, with its own passing derived-oracle
check) and `format_reorder_line` (Lesson 116, with its own passing
check). Both pass every existing check in the project. Combined, with a
`threshold`/`target` pair nothing currently forbids, they produce
`['widgets: reorder -1']` — a real, run, nonsensical line, since
reordering a negative quantity means nothing. Neither underlying
function's own existing check ever exercises this, because the flaw
isn't inside either one — it lives in an assumption neither one states:
that `target` is always greater than `threshold`. The transferable
problem this lesson names directly: passing unit tests on every
individual piece is a genuinely good sign, and it is never, by itself,
proof that the pieces work correctly *together* — that is a different
claim, requiring a different kind of test.

**What you need to know first.** Lesson 116 (Testing vs Verification)
and Lesson 117 (Test Oracles) — specifically `format_reorder_line` and
`reorder_suggestion` themselves, and the fact that both already have
their own passing, independent checks. Lesson 118 (Unit Tests) — the
fault-localization idea this lesson deliberately inverts: Lesson 118
showed a test that accidentally spanned two units when it should have
tested one; this lesson deliberately builds a test that spans two units
on purpose, because that's the only way to catch this specific class of
bug.

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

This lesson is the first in this domain to touch **two** stages at once.
It still sits at **Verification** — the same stage every lesson in this
domain has occupied — and it is also this curriculum's first concrete,
worked example of **Integration**, the very next stage in the diagram:
the point where separately built pieces are first exercised together
rather than each on its own. The concrete value carried through both
stages at once: `build_reorder_report({"widgets": 3, "gadgets": 8},
threshold=5, target=2)` — the exact combination of two already-verified
pieces that exposes a real problem existing only in how they meet.

**Terms used in this lesson.**

- **Integration test** — a test that deliberately exercises two or more
  real units working together, rather than any one of them in
  isolation, to check whether their combination behaves correctly. Why
  it needs its own name, distinct from a unit test: Lesson 118 defined a
  unit test as isolating a piece *from* its collaborators specifically
  so a failure localizes to one place; an integration test does the
  opposite on purpose — it keeps the real collaborators wired together,
  because the very thing being checked is whether that wiring itself is
  correct.
- **Implicit assumption** — an expectation one piece of code relies on
  about another, that isn't written down, checked, or enforced anywhere
  in either piece's own code. Why it matters here specifically: this
  lesson's entire bug is made of exactly one of these — `build_reorder_
  report` silently assumed `target` would always exceed `threshold`,
  and neither `reorder_suggestion` nor `format_reorder_line` was ever
  asked to promise or check that, because neither one individually has
  any reason to know the other exists.
- **Precondition** — a condition that must be true of a function's
  inputs before it runs, for its result to be meaningful; if the
  condition doesn't hold, the correct behavior is to say so, not to
  silently compute a number anyway. This term names the fix this
  lesson's own investigation arrives at: turning `build_reorder_report`'s
  unstated assumption about `target` and `threshold` into a real,
  checked condition at the top of the function, instead of leaving it
  implicit.

**Objects and methods used.**

- **`list.append()`**
  - *What it is:* a built-in method every Python `list` object carries.
  - *Implementation:* `some_list.append(value)` adds `value` to the end
    of `some_list`, in place, and returns `None` — it modifies the list
    it's called on directly rather than returning a new one.
  - *Its use:* `build_reorder_report`'s new code calls it once per
    reorder suggestion, building up the final list of formatted lines
    one at a time inside a loop.

---

## Concept Unit: Integration Tests — Checking That the Pieces Actually Fit Together

### The Problem

`reorder_suggestion` already has its own passing check
(`check_reorder_suggestion.py`, Lesson 117). `format_reorder_line`
already has its own passing check (`check_format_reorder_line.py`,
Lesson 116). A new report needs both: for every item that needs
reordering, produce one printable line. The obvious way to build it is
to call `reorder_suggestion` to get the quantities, then call
`format_reorder_line` on each one to turn them into text. Both pieces
are already proven correct, separately. Does that mean the function that
combines them is automatically safe?

### Introduce the Concept in Isolation

A small, throwaway, unrelated pair of functions — never part of
`inventory-report` — makes the question concrete. Each one is
individually correct; nothing is wrong with either on its own:

```python
def degrees_over_limit(current, limit):
    return current - limit

def format_alert(sensor, degrees):
    return sensor + " is " + str(degrees) + " degrees over limit"

def temperature_alert(sensor, current, limit):
    return format_alert(sensor, degrees_over_limit(current, limit))
```

Each piece, checked on its own:

```text
$ python3 -c "from integ_lab import degrees_over_limit, format_alert; print(degrees_over_limit(80, 75)); print(format_alert('sensor1', 5))"
5
sensor1 is 5 degrees over limit
```

Both are exactly right: `degrees_over_limit(80, 75)` correctly computes
`5`, and `format_alert('sensor1', 5)` correctly turns `5` into a
readable sentence. Now the two are combined, with a perfectly ordinary
call that neither isolated check above ever tried:

```text
$ python3 -c "from integ_lab import temperature_alert; print(temperature_alert('sensor1', 70, 75))"
sensor1 is -5 degrees over limit
```

A real sensor reading `70` against a limit of `75` is *under* the
limit, not over it — this sentence is nonsense, even though
`degrees_over_limit` computed `-5` exactly correctly (`70 - 75` really
is `-5`) and `format_alert` formatted `-5` exactly correctly. Neither
function is broken. The combination is, because `temperature_alert`
silently assumes it will only ever be called when `current` actually
exceeds `limit`, and nothing anywhere checks that assumption. A test
that deliberately calls the real, wired-together combination — not
either piece alone — is called an **integration test**, and this is
exactly the class of bug it exists to catch: not a broken unit, but a
broken assumption about how correct units fit together.

### Discard the Throwaway Example

`degrees_over_limit`, `format_alert`, and `temperature_alert` are not
part of `inventory-report` and will not appear in it. What survives is
the proof that two individually correct functions can still combine
into a nonsensical result, and that no unit-level check on either one,
by itself, would ever reveal it.

### Project Change

- **Reference Source.** No reference counterpart — `build_reorder_report`
  is a from-scratch addition, needed to turn `reorder_suggestion`'s raw
  quantities into the printable lines `format_reorder_line` already
  knows how to produce.
- **Files affected.** `inventory_report.py`, modified — a new function
  appended. `check_build_reorder_report.py`, created.
- **Change type.** Add.
- **Location.** Appended to the end of `inventory_report.py`, after
  `format_reorder_line_priced`.
- **Dependencies.** Calls `reorder_suggestion` and `format_reorder_line`,
  both already present in the same file.

### The New Code

```python
def build_reorder_report(inventory, threshold=3, target=15):
    suggestions = reorder_suggestion(inventory, threshold, target)
    lines = []
    for name, qty in suggestions.items():
        lines.append(format_reorder_line(name, qty))
    return lines
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
    return {name: target - count for name, count in inventory.items() if count < threshold}

def format_reorder_line(name: str, qty: int) -> str:
    return name + ": reorder " + str(qty)

def format_reorder_line_priced(name: str, qty: int, unit_cost: float) -> str:
    return name + ": reorder " + str(qty) + " units at $" + str(unit_cost)

def build_reorder_report(inventory, threshold=3, target=15):  # ← new
    suggestions = reorder_suggestion(inventory, threshold, target)  # ← new
    lines = []                                                  # ← new
    for name, qty in suggestions.items():                       # ← new
        lines.append(format_reorder_line(name, qty))            # ← new
    return lines                                                # ← new
```

### Mechanical Walkthrough

- **`def build_reorder_report(inventory, threshold=3, target=15):`** —
  a function definition with two default parameters, the same
  default-parameter syntax `reorder_suggestion` itself already uses,
  passed straight through to it below.
- **`suggestions = reorder_suggestion(inventory, threshold, target)`**
  — calls the real, already-checked `reorder_suggestion`, given full
  treatment again here per the Repetition Rule: it returns a
  dictionary mapping each low-stock item's name to a suggested reorder
  quantity, computed as `target - count` for every item whose count is
  strictly below `threshold`. The result is bound to `suggestions`.
- **`lines = []`** — creates a new, empty list, bound to `lines`, that
  the loop below will fill.
- **`for name, qty in suggestions.items():`** — the same iteration
  pattern `low_stock_items` already uses on `inventory`, here applied to
  `suggestions` instead: `.items()` returns the dictionary's key/value
  pairs, unpacked into `name` and `qty` on each pass.
- **`lines.append(format_reorder_line(name, qty))`** — two things
  happening on one line, evaluated inside-out. First,
  `format_reorder_line(name, qty)` — given full treatment again here per
  the Repetition Rule: the already-checked function from Lesson 116,
  which takes a name and a quantity and returns a formatted string like
  `"widgets: reorder 12"`, converting `qty` to text with `str()` before
  concatenating. Its result — a string — is then passed to
  **`lines.append(...)`** (full treatment in the Header's Objects and
  methods section above), which adds it to the end of `lines` in place.
- **`return lines`** — hands the finished list of formatted lines back
  to whatever called this function.

### CS Lens

```text
Also recognized in: two individually validated electrical components —
a battery rated for one voltage and a motor rated for a different one
— that damage each other the moment they're wired together, two
services that each pass their own team's full test suite but break in
production the moment one calls the other, because each team's own
tests only ever exercised their own understanding of the shared API,
a plumbing fitting and a pipe that each individually meet their own
manufacturing spec but leak the moment they're joined, because the
thread sizes were never actually checked against each other
```

### SE Lens

The alternative — trusting that "every unit test passes" is enough — is
not a strawman; it's exactly the state this project was in one step
before this lesson: `check_reorder_suggestion.py` and
`check_format_reorder_line.py` were both green, and `build_reorder_
report` still produced a nonsensical result the moment it combined
them. The real cost integration tests add: they're slower to write and
reason about than a unit test, because a failure in one doesn't
localize the way Lesson 118 showed a good unit test should — when
`check_build_reorder_report` fails, it says "the combination is wrong,"
not "here is the one line responsible," the same open question Lesson
118's own SE Lens named. Unit tests and integration tests are not
competitors; they answer two different questions that neither one can
answer for the other: "is this one piece correct on its own" and "do
these correct pieces actually agree with each other where they meet."
Worth naming honestly, too: at `inventory-report`'s current size, "two
functions calling each other in the same file" is integration testing
at its smallest possible scale. The identical concept — real components,
wired together for real, exercised on purpose — scales up to testing
two actual services or processes together, which is what the phrase
more commonly evokes in a larger system; the underlying question being
asked doesn't change, only the size and cost of setting the real
combination up.

### Commands Needed

No new command — `python3 check_build_reorder_report.py`, the same
invocation every check file in this project already uses.

### Run It

First, `build_reorder_report` exactly as written above, no guard against
a bad `threshold`/`target` pairing yet. A straightforward, working case:

```text
$ python3 check_build_reorder_report.py
check_build_reorder_report passed
```

Now, called directly with a `threshold`/`target` pairing that's
perfectly ordinary Python — nothing about the call itself looks wrong —
but that neither `check_reorder_suggestion.py` nor `check_format_
reorder_line.py` was ever written to try:

```text
$ python3 -c "from inventory_report import build_reorder_report; print(build_reorder_report({'widgets': 3, 'gadgets': 8}, threshold=5, target=2))"
['widgets: reorder -1']
```

`'widgets: reorder -1'` — a real, run result, and a nonsensical one:
`widgets`, at a count of `3`, is genuinely below `threshold=5`, so it's
correctly flagged as needing reorder; but with `target=2` lower than
that same `threshold`, `reorder_suggestion`'s own arithmetic,
`target - count`, comes out negative (`2 - 3 = -1`), and
`format_reorder_line` — correctly, per its own contract — turns
whatever integer it's handed into text, including `-1`. Neither
function did anything wrong by its own rules. The rule that's actually
missing belongs to neither of them individually: `target` has to be
greater than `threshold`, or the whole computation stops meaning
anything.

That missing rule is added as an explicit **precondition**, checked at
the top of `build_reorder_report` itself — the one place that actually
knows both values are about to be used together:

```python
def build_reorder_report(inventory, threshold=3, target=15):
    if target <= threshold:
        raise ValueError("target must be greater than threshold")
    suggestions = reorder_suggestion(inventory, threshold, target)
    lines = []
    for name, qty in suggestions.items():
        lines.append(format_reorder_line(name, qty))
    return lines
```

The same bad call, rerun after the fix:

```text
$ python3 -c "from inventory_report import build_reorder_report; build_reorder_report({'widgets': 3, 'gadgets': 8}, threshold=5, target=2)"
Traceback (most recent call last):
  File "<string>", line 1, in <module>
  File "/path/to/inventory-report/inventory_report.py", line 20, in build_reorder_report
    raise ValueError("target must be greater than threshold")
ValueError: target must be greater than threshold
```

Loud and immediate, instead of quiet and wrong. `check_build_reorder_
report.py` is extended with a second check that proves this failure is
real and expected, not accidental — deliberately calling the bad
combination and confirming it raises:

```python
def check_build_reorder_report_rejects_target_below_threshold():
    try:
        build_reorder_report({"widgets": 3, "gadgets": 8}, threshold=5, target=2)
        assert False, "expected ValueError, none was raised"
    except ValueError:
        print("check_build_reorder_report_rejects_target_below_threshold passed")
```

Reading this new check itself: `try:` opens a block whose exceptions get
caught rather than propagating immediately. Inside it, the bad call is
made on purpose. If it somehow *doesn't* raise, `assert False, "expected
ValueError, none was raised"` runs next — `assert False` always fails,
so this line exists specifically to turn "no exception happened" into a
loud, explicit check failure of its own, with the message explaining
what should have happened instead. `except ValueError:` only runs if a
`ValueError` really was raised — exactly the outcome now being deemed
correct — and prints the success line from inside the `except` block
itself, since that's the only path where the exception is known to have
actually occurred.

The full check file, run clean:

```text
$ python3 check_build_reorder_report.py
check_build_reorder_report passed
check_build_reorder_report_rejects_target_below_threshold passed
```

And the rest of the project's suite, confirmed undisturbed — the fix
only added a new check at the top of one new function; it didn't touch
`reorder_suggestion` or `format_reorder_line` at all:

```text
$ python3 check_low_stock.py
check_low_stock_items passed
$ python3 check_restock_alert.py
check_restock_alert passed
$ python3 check_format_reorder_line.py
check_format_reorder_line passed
$ python3 check_format_reorder_line_priced.py
check_format_reorder_line_priced passed
$ python3 check_reorder_suggestion.py
check_reorder_suggestion_matches_naive passed
check_reorder_suggestion_matches_naive_second_inventory passed
$ python3 -m mypy inventory_report.py
Success: no issues found in 1 source file
```

### Connecting Back

The isolated `temperature_alert` example proved two individually correct
functions can still combine into nonsense. `build_reorder_report` proved
the identical thing about real, already-checked project code — and the
fix didn't touch either already-correct piece; it named the one
assumption that lived only in the space between them, and made that
assumption a real, checked precondition instead of an implicit,
unverified hope.

---

## Connect the Pieces

One concrete call, `build_reorder_report({"widgets": 3, "gadgets": 8},
threshold=5, target=2)`, moving through every piece this lesson built,
start to finish:

1. `reorder_suggestion` and `format_reorder_line` are each already
   correct, each with its own passing check from Lessons 116 and 117.
2. `build_reorder_report` is written, combining both, with no guard on
   the relationship between `threshold` and `target`.
3. Called with `threshold=5, target=2`, it returns `['widgets: reorder
   -1']` — a real, run, nonsensical result, even though neither
   `reorder_suggestion` nor `format_reorder_line` did anything wrong by
   its own rules.
4. The missing rule — `target` must exceed `threshold` — is added as an
   explicit precondition at the top of `build_reorder_report`, the one
   place that actually holds both values together.
5. The same bad call now raises a real, immediate `ValueError` instead
   of silently returning nonsense.
6. `check_build_reorder_report.py` is extended with a second check that
   deliberately calls the bad combination and confirms the exception is
   the correct, expected outcome — and the rest of the project's suite,
   rerun in full, confirms nothing else was disturbed.

## What Breaks Without This

This lesson's own investigation already showed what breaks: two
functions, each individually verified by its own unit-level check,
producing a real, silently wrong result the moment they were combined
in an ordinary way neither check anticipated. Restated plainly: unit
tests, even perfectly written ones — and `check_reorder_suggestion.py`
and `check_format_reorder_line.py` both are — can only ever prove a
function behaves correctly according to its own contract, in isolation.
Neither contract here ever mentioned the other function at all. Without
a test that deliberately wires real pieces together and checks the
result of that combination, an assumption living only in the gap between
two correct functions has no test that could ever catch it — it isn't
inside either function for a unit test to find.

## Exercises

1. Add a second integration check to `check_build_reorder_report.py`
   using `format_reorder_line_priced` instead of `format_reorder_line`,
   combined with `reorder_suggestion` and a real `unit_cost` per item —
   write the combining function, `build_priced_reorder_report`, first.
2. `build_reorder_report`'s new precondition only guards against
   `target <= threshold`. Investigate, by direct experimentation the
   way this lesson did, whether a negative `threshold` on its own (with
   `target` still larger) produces a sensible result or a different,
   still-unguarded problem.
3. Every check written across Lessons 115–119 lives in this project's
   own top-level directory and is run with a separate `python3
   check_<something>.py` command. Try writing one small script that
   imports and calls every `check_` function from every file in the
   project in sequence, and reason about what would have to be true for
   that script to reliably tell you, on its own, whether the whole
   project is currently healthy.

## Definition of Done

- [ ] `build_reorder_report` exists in `inventory_report.py`, calling
      `reorder_suggestion` and `format_reorder_line`, guarded by a
      precondition that rejects `target <= threshold`.
- [ ] `check_build_reorder_report.py` has two checks: one confirming a
      correct combination produces the right formatted lines, one
      confirming the bad `threshold`/`target` combination raises
      `ValueError`.
- [ ] `check_low_stock.py`, `check_restock_alert.py`,
      `check_format_reorder_line.py`, `check_format_reorder_line_priced.py`,
      and `check_reorder_suggestion.py` all still pass, unchanged.
- [ ] `python3 -m mypy inventory_report.py` still reports success.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `add build_reorder_report with a target>threshold precondition;
      two individually correct functions produced a negative reorder
      quantity when combined without it` — not `add report function`.

Next: Lesson 120 — System Tests.
