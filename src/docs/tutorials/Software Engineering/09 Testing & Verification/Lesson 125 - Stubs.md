# Lesson 125: Stubs

**What you will build.** Two new checks for `build_reorder_report`,
each substituting `reorder_suggestion` with a small function that
returns a fixed, hand-picked dictionary — no real inventory, no real
computation, just a direct, chosen answer. One check hands back
`{"zzz_item": 5, "aaa_item": 10}`, deliberately out of alphabetical
order; the other hands back `{}`, an empty result. Running the first
one surfaces a real, previously unnoticed inconsistency: `restock_
alert` (Lesson 105) always returns its names alphabetically sorted,
because `low_stock_items` explicitly sorts them — but `build_reorder_
report` (Lesson 119) just echoes whatever order `reorder_suggestion`
happens to hand it, with no sorting at all. The fix adds one call to
`sorted()`. The transferable problem this lesson names: Lesson 124
recorded *how* a collaborator was called; this lesson controls *what*
it hands back, on purpose, specifically to drive the code under test
through scenarios that would otherwise require carefully engineering
real input data just to coax the real dependency into producing them.

**What you need to know first.** Lesson 123 (Test Doubles) — the
monkey-patching mechanism (`try`/`finally` around a module attribute
reassignment) reused here without change. Lesson 124 (Mocks) — the
distinction this lesson sharpens further: a mock records an interaction
and asserts on it; this lesson's substitutes never look at what they're
called with at all, and exist purely to control what comes back. This
lesson also reuses `build_reorder_report` and `restock_alert`, both
unchanged since Lesson 119 and Lesson 105 respectively.

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
`build_reorder_report`, checked against a deliberately unsorted canned
dictionary, `{"zzz_item": 5, "aaa_item": 10}` — a scenario chosen
specifically because it's the one shape of input least likely to occur
by accident with real, alphabetically-typed sample data, and therefore
exactly the shape most likely to reveal an ordering assumption nobody
had actually verified.

**Terms used in this lesson.**

- **Stub** — a test double that returns a fixed, predetermined response,
  used to drive the code under test through a chosen scenario directly
  and cheaply, without engineering real input data to coax the real
  dependency into producing that exact scenario, and without any regard
  for what arguments it's actually called with. Why distinct from a
  mock: Lesson 124's mock recorded its calls specifically so a test
  could assert on them; a stub, by definition, doesn't bother — its
  only job is controlling the answer, not observing the question.
- **Canned response** — the literal, fixed value a stub is written to
  return, chosen deliberately by whoever writes the stub to represent
  one specific scenario, rather than computed for real from any actual
  input.

**Objects and methods used.** No new external class or method — this
lesson's new code reuses only constructs already given full treatment
in this project: function definition and call, dict literals, `sorted()`
(full treatment restated below, since it's applied to a new kind of
value here), `assert`.

---

## Concept Unit: Stubs — Driving Scenarios With Canned Responses

### The Problem

`build_reorder_report` has been checked exactly twice so far: once with
a real inventory (Lesson 119), once with `reorder_suggestion` and
`format_reorder_line` both running for real. Both checks used ordinary,
alphabetically-named sample data — `widgets`, `gadgets`, `gizmos` — the
same handful of names this entire project has reused since Lesson 105.
That's a narrow slice of what `reorder_suggestion` could actually hand
back. Constructing a real inventory specifically designed to make
`reorder_suggestion` return its items in some particular, chosen order
means understanding exactly how Python's own dictionaries preserve
insertion order and engineering the input dictionary's own key order by
hand — real, fiddly work, just to set up one test scenario.

### Introduce the Concept in Isolation

A small, throwaway, unrelated pair of functions — never part of
`inventory-report` — makes the alternative concrete:

```python
def format_scores(scores):
    return [str(name) + ": " + str(score) for name, score in scores]

def build_leaderboard(fetch_scores):
    scores = fetch_scores()
    return format_scores(scores)
```

`build_leaderboard` takes its data source as a parameter, rather than
calling one specific hardcoded function — a small, deliberate design
choice made purely to keep this throwaway example minimal; `inventory-
report`'s own functions, patched via `import inventory_report` instead,
use the same substitution mechanism Lessons 123 and 124 already
established. Three different scenarios, each a small function returning
a fixed, hand-picked answer:

```python
def stub_empty():
    return []

def stub_one():
    return [("alice", 90)]

def stub_many():
    return [("zeb", 70), ("amy", 95)]

print(build_leaderboard(stub_empty))
print(build_leaderboard(stub_one))
print(build_leaderboard(stub_many))
```

The real output:

```text
$ python3 stub_lab.py
[]
['alice: 90']
['zeb: 70', 'amy: 95']
```

Three scenarios — no scores, one score, two scores in a specific,
deliberately chosen order — exercised in three lines, each one a fixed,
hand-picked answer rather than something computed from real data. Each
of `stub_empty`, `stub_one`, and `stub_many` is called a **stub**: a
substitute that returns a **canned response**, with no logic of its own
and no interest at all in how it was called.

### Discard the Throwaway Example

`format_scores`, `build_leaderboard`, and the three stub functions are
not part of `inventory-report` and will not appear in it. What survives
is the technique: writing several small, fixed, deliberately chosen
canned responses is often far cheaper than constructing real data
specifically engineered to produce each one.

### Project Change

- **Reference Source.** No reference counterpart — these are new
  checks, extending Lesson 123's own monkey-patching technique with
  chosen canned responses instead of a single fixed one.
- **Files affected.** `check_build_reorder_report_stub.py`, created.
  `inventory_report.py`, modified — one line inside `build_reorder_
  report`, once this unit's own investigation finds a real reason to
  change it.
- **Change type.** Add, then fix.
- **Location.** The new checks are a new top-level file; the fix lands
  inside `build_reorder_report`'s existing loop.
- **Dependencies.** None beyond what `inventory-report` already has.

### The New Code

```python
def stub_reorder_suggestion(inventory, threshold, target):
    return {"zzz_item": 5, "aaa_item": 10}
```

Read the two keys in this dictionary literal closely: `zzz_item` first,
`aaa_item` second — deliberately, not alphabetically, and not
accidentally.

### The Updated Project

`check_build_reorder_report_stub.py`, in full — a fresh, freestanding
file, so this is already its complete shape:

```python
import inventory_report

def stub_reorder_suggestion(inventory, threshold, target):  # ← new
    return {"zzz_item": 5, "aaa_item": 10}                   # ← new

def check_build_reorder_report_sorts_regardless_of_stub_order():
    real_reorder_suggestion = inventory_report.reorder_suggestion
    inventory_report.reorder_suggestion = stub_reorder_suggestion
    try:
        result = inventory_report.build_reorder_report({}, threshold=1, target=2)
        assert result == ["aaa_item: reorder 10", "zzz_item: reorder 5"]
    finally:
        inventory_report.reorder_suggestion = real_reorder_suggestion
    print("check_build_reorder_report_sorts_regardless_of_stub_order passed")

def stub_reorder_suggestion_empty(inventory, threshold, target):
    return {}

def check_build_reorder_report_handles_empty_suggestions():
    real_reorder_suggestion = inventory_report.reorder_suggestion
    inventory_report.reorder_suggestion = stub_reorder_suggestion_empty
    try:
        result = inventory_report.build_reorder_report({}, threshold=1, target=2)
        assert result == []
    finally:
        inventory_report.reorder_suggestion = real_reorder_suggestion
    print("check_build_reorder_report_handles_empty_suggestions passed")

check_build_reorder_report_sorts_regardless_of_stub_order()
check_build_reorder_report_handles_empty_suggestions()
```

### Mechanical Walkthrough

- **`def stub_reorder_suggestion(inventory, threshold, target):`** — a
  function matching `reorder_suggestion`'s own three-parameter shape,
  so it can be substituted for it without changing `build_reorder_
  report`'s own call site at all.
- **`return {"zzz_item": 5, "aaa_item": 10}`** — a dictionary literal, a
  construct this project has used since Lesson 105, here given a
  deliberately chosen key order rather than an ordinary, alphabetical
  one: `zzz_item` is written first, so it becomes the first entry
  `.items()` will yield later, exactly the way `reorder_suggestion`'s
  own real dict comprehension preserves whatever order `inventory`
  itself happened to be in.
- **`real_reorder_suggestion = inventory_report.reorder_suggestion`**
  and **`inventory_report.reorder_suggestion = stub_reorder_
  suggestion`** — the same monkey-patch pattern Lessons 123 and 124
  already established, here substituting `reorder_suggestion` instead
  of `low_stock_items`.
- **`result = inventory_report.build_reorder_report({}, threshold=1,
  target=2)`** — calls the real, unmodified `build_reorder_report`. The
  inventory argument, `{}`, doesn't matter at all here — it's never
  actually read, since the stub standing in for `reorder_suggestion`
  ignores it completely, exactly the way Lesson 123's own fake ignored
  its arguments. `threshold=1, target=2` satisfies `build_reorder_
  report`'s own existing precondition (`target > threshold`, Lesson
  119) without otherwise mattering either.
- **`assert result == [...]`** — checks the exact order `build_reorder_
  report`'s own output comes back in, against the stub's own
  deliberately chosen input order.
- **`finally: inventory_report.reorder_suggestion = real_reorder_
  suggestion`** — restores the real function, the same guaranteed-
  cleanup pattern Lesson 123 already established.
- **`stub_reorder_suggestion_empty`** and its own check — the same
  pattern again, with a second, differently chosen canned response: an
  empty dictionary, proving `build_reorder_report` correctly returns an
  empty list when there's nothing to report, without needing a real
  inventory where literally every item happens to be well-stocked.

### CS Lens

```text
Also recognized in: a flight simulator's own instructor console,
letting a trainer inject a specific, chosen engine-failure scenario on
demand rather than waiting for a real one to happen during training, a
video game's own debug menu, letting a developer jump straight to a
specific chosen level or inventory state instead of playing the entire
game for real each time, a chaos-engineering tool that deliberately
returns a canned "service unavailable" response from one dependency,
specifically to observe how the rest of a real system reacts to it
```

### SE Lens

The alternative — constructing a real inventory dictionary whose own
key order happens to produce a specific scenario — is not impossible;
Python dictionaries preserve insertion order predictably enough that it
could genuinely be done. What it costs, compared to a stub: real
understanding of an implementation detail (dict insertion order) that
has nothing to do with what's actually being tested (whether `build_
reorder_report`'s own output order is correct), and a test that would
be far less obvious to a future reader about *why* that specific,
oddly-ordered inventory was chosen. A stub states the scenario directly
— `{"zzz_item": 5, "aaa_item": 10}`, in that order, on purpose — with
nothing to reverse-engineer. The real cost, same as every test double
in this domain so far: a stub only proves the code under test behaves
correctly for the exact canned scenarios actually written. It says
nothing about scenarios nobody thought to construct — precisely why
Lesson 122's own boundary-value discipline is worth applying to
*choosing which stubs to write*, not just to choosing real test data.

### Commands Needed

No new command — `python3 check_build_reorder_report_stub.py`, the same
invocation every check file in this project already uses.

### Run It

Run against `build_reorder_report` exactly as Lesson 119 left it — no
sorting of its own:

```text
$ python3 check_build_reorder_report_stub.py
Traceback (most recent call last):
  File "/path/to/inventory-report/check_build_reorder_report_stub.py", line 16, in <module>
    check_build_reorder_report_sorts_regardless_of_stub_order()
  File "/path/to/inventory-report/check_build_reorder_report_stub.py", line 11, in check_build_reorder_report_sorts_regardless_of_stub_order
    assert result == ["aaa_item: reorder 10", "zzz_item: reorder 5"]
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

A real failure — `build_reorder_report` actually returned
`["zzz_item: reorder 5", "aaa_item: reorder 10"]`, echoing the stub's
own deliberately unsorted order exactly. Comparing that directly against
`restock_alert`, which this lesson's own investigation now checks for
the first time:

```text
$ python3 -c "from inventory_report import restock_alert, build_reorder_report; inventory = {'widgets': 1, 'gadgets': 2}; print('restock_alert:       ', restock_alert(inventory, threshold=5)); print('build_reorder_report:', build_reorder_report(inventory, threshold=5, target=15))"
restock_alert:        ['gadgets', 'widgets']
build_reorder_report: ['widgets: reorder 14', 'gadgets: reorder 13']
```

A real, previously unnoticed inconsistency: `restock_alert` names
`gadgets` before `widgets` — alphabetical, because `low_stock_items`
explicitly calls `sorted()` on its own result — while `build_reorder_
report` names `widgets` first, simply because that's the order they
happened to appear in `inventory`. Two functions describing the same
underlying idea, "which items need attention," with no agreed-upon
order between them at all. The fix adds one explicit `sorted()` call,
directly where the New Code step already pointed:

```python
def build_reorder_report(inventory, threshold=3, target=15):
    if target <= threshold:
        raise ValueError("target must be greater than threshold")
    suggestions = reorder_suggestion(inventory, threshold, target)
    lines = []
    for name, qty in sorted(suggestions.items()):
        lines.append(format_reorder_line(name, qty))
    return lines
```

`sorted(suggestions.items())` — given full treatment here since it's
applied to a new kind of value in this project: `suggestions.items()`
yields `(name, qty)` tuples; `sorted()`, already used inside `low_stock_
items` on a plain list of names, works the same way on a list of
tuples, comparing them element by element — first by `name`, and only by
`qty` if two names were ever equal, which they never are here, since
dictionary keys are always unique. The stub-based checks, updated to
expect the new, correct behavior:

```text
$ python3 check_build_reorder_report_stub.py
check_build_reorder_report_sorts_regardless_of_stub_order passed
check_build_reorder_report_handles_empty_suggestions passed
```

The same real, direct comparison, rerun after the fix:

```text
$ python3 -c "from inventory_report import restock_alert, build_reorder_report; inventory = {'widgets': 1, 'gadgets': 2}; print('restock_alert:       ', restock_alert(inventory, threshold=5)); print('build_reorder_report:', build_reorder_report(inventory, threshold=5, target=15))"
restock_alert:        ['gadgets', 'widgets']
build_reorder_report: ['gadgets: reorder 13', 'widgets: reorder 14']
```

Both now agree: `gadgets` before `widgets`, every time, regardless of
`inventory`'s own key order. And the rest of the project's suite,
confirmed undisturbed:

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
$ python3 check_inventory_cli.py
check_inventory_cli passed
$ python3 check_inventory_end_to_end.py
check_inventory_end_to_end_rejects_bad_data passed
$ python3 check_load_inventory_boundaries.py
check_load_inventory_accepts_zero_count passed
check_load_inventory_rejects_negative_count passed
$ python3 -m mypy inventory_report.py
Success: no issues found in 1 source file
```

### Connecting Back

The isolated `build_leaderboard`/stub example proved a handful of
cheap, hand-picked canned responses can exercise several scenarios at
once, faster than constructing real data for each. `check_build_
reorder_report_stub.py` proved the identical technique surfaces a real,
previously invisible inconsistency in this project's own code — one
that a real inventory dictionary, typed the ordinary way this project's
sample data always has been, would likely never have exposed by
accident.

---

## Connect the Pieces

One deliberately unsorted canned response,
`{"zzz_item": 5, "aaa_item": 10}`, moving through every piece this
lesson built, start to finish:

1. `stub_reorder_suggestion` is written to return that exact
   dictionary, keys in a deliberately chosen, non-alphabetical order.
2. Patched in place of the real `reorder_suggestion`, `build_reorder_
   report({}, threshold=1, target=2)` echoes that same order back,
   unsorted — a real failure against the check's own expectation of
   sorted output.
3. A direct, real comparison against `restock_alert` confirms this
   isn't just the stub being unusual: the two functions genuinely
   disagree on ordering, using real, ordinary sample data.
4. `sorted(suggestions.items())` is added to `build_reorder_report`.
5. The stub-based checks, updated to expect sorted output, pass — and
   the direct comparison against `restock_alert` now agrees on both
   sides.
6. The rest of the project's suite, rerun in full, confirms nothing
   else was disturbed by a change to output order alone.

## What Breaks Without This

Every check on `build_reorder_report` before this lesson used real
sample inventories whose own key order happened to already be
alphabetical — not because anyone verified that mattered, but because
that's simply how this project's own sample data has always been
typed. Restated plainly: a stub's entire value is stating a scenario
directly, on purpose, rather than hoping real data happens to exercise
it. Without deliberately constructing the one canned response least
likely to occur by accident — keys in the opposite of alphabetical
order — this project's own two, subtly disagreeing ideas of "which
items need attention first" could have shipped, unnoticed, for as long
as every real inventory anyone happened to type in also happened to be
alphabetical.

## Exercises

1. `stub_reorder_suggestion_empty`'s own scenario, an empty dictionary,
   turned out not to reveal anything new — `build_reorder_report`
   already handled it correctly both before and after this lesson's
   fix. Write a third stub returning a dictionary with exactly one
   entry, and decide, honestly, whether it's worth keeping as its own
   check or whether the two already written cover everything a
   single-entry case would.
2. `format_reorder_line_priced` has never been driven through a stub
   the way `reorder_suggestion` has here. Write a stub for it, patched
   into `build_reorder_report`'s own collaborators (a version that
   calls the priced formatter, from Lesson 119's own exercise 1, if
   completed), returning a fixed string regardless of its arguments,
   and use it to prove `build_reorder_report` correctly passes through
   whatever that formatter returns.
3. This lesson's fix sorts by `name` (the tuple's first element,
   comparing `(name, qty)` pairs lexicographically). Using a stub with
   two entries that share the *same* name but different `qty` values —
   a scenario that can't happen for real, since dictionary keys are
   always unique — predict what `sorted()` would do, then explain, in a
   comment, why this scenario is worth reasoning about even though a
   stub is the only way to construct it at all.

## Definition of Done

- [ ] `build_reorder_report` sorts its output with
      `sorted(suggestions.items())`, matching `restock_alert`'s own
      alphabetical convention.
- [ ] `check_build_reorder_report_stub.py` exists, with two checks: one
      proving sorted output regardless of the stub's own key order, one
      proving an empty result is handled correctly.
- [ ] A direct call comparing `restock_alert` and `build_reorder_report`
      against the same real inventory shows matching name order.
- [ ] Every other check file in the project still passes unchanged.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `sort build_reorder_report's output; a stub with deliberately
      unsorted keys found it disagreed with restock_alert's own
      alphabetical convention` — not `add sorting`.

Next: Lesson 126 — Fakes.
