# Lesson 122: Test Boundaries

**What you will build.** `load_inventory` (Lesson 121) already rejects a
count that isn't a real number — `isinstance(count, int)` catches a
hand-edited `"5"` in quotes. This lesson asks a narrower, more pointed
question: is every value Python's own `int` type allows also a value
that makes sense for a real inventory count? Two new fixture files,
`inventory_zero.json` and `inventory_negative.json`, and a new check,
`check_load_inventory_boundaries.py`, test exactly that — and find a
real, silent gap: `load_inventory({"widgets": -5})` is accepted without
complaint, and `reorder_suggestion` turns that physically impossible
negative count into a real, printed recommendation to reorder `20`
units. `isinstance(count, int)` was never wrong; it just never claimed
to answer the question this lesson asks. The transferable problem: this
lesson names and formalizes exactly the technique Lesson 117 stumbled
into by accident — deliberately testing the specific values sitting
right at the edge of what's valid, not just typical, ordinary ones —
closing the forward reference Lesson 117 made two lessons ago.

**What you need to know first.** Lesson 117 (Test Oracles) —
specifically its own closing observation that reusing `reorder_
suggestion`'s default `threshold` as ordinary sample data happened, by
coincidence, to land exactly on a boundary, and its explicit promise
that choosing boundary values on purpose, instead of hoping to stumble
into one, would be this lesson's own subject. Lesson 121 (End-to-End
Tests) — `load_inventory`'s existing `isinstance(count, int)` check,
extended here rather than replaced.

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
`load_inventory` applied to two new, real, deliberately chosen files —
`{"widgets": 0}` (the last value that must still be accepted) and
`{"widgets": -1}` (the first value that must not be) — rather than
another arbitrary, ordinary-looking sample.

**Terms used in this lesson.**

- **Boundary value** — one of the specific values sitting right at the
  edge between what an input is meant to accept and what it's meant to
  reject. Why bugs cluster there: code that correctly handles the
  broad, typical middle of a valid range can still get the exact edge
  condition wrong — `<` instead of `<=`, or, this lesson's own case,
  no condition at all — in a way that never shows up unless a test
  actually lands on that exact value.
- **Boundary value analysis** — the deliberate technique of choosing
  test inputs specifically at and immediately around each identified
  boundary — the last value still considered valid, and the first value
  just beyond it that isn't — rather than only picking typical,
  comfortable, middle-of-the-range values. Why it needed naming here
  specifically: Lesson 117's own real disagreement was found entirely
  by accident, because a sample value happened to equal a default
  parameter; this lesson replaces that accident with a repeatable
  method.
- **Valid domain** — the actual, real-world set of values a piece of
  code is meant to correctly handle — often narrower than everything
  its own declared type technically permits. Why it matters here:
  Python's `int` type is perfectly happy with `-5`; nothing about the
  type system itself says an inventory count can't be negative — that's
  a fact about real inventories, not about integers, and no type
  checker can ever enforce a fact the type system was never told.

**Objects and methods used.** No new external class or method — this
lesson's new code reuses only constructs already given full treatment
in this project: `import`, function definition and call, `if`, `raise`,
`assert`, `try`/`except`.

---

## Concept Unit: Boundary Value Analysis — Testing the Edges on Purpose

### The Problem

`load_inventory` currently checks one thing about every count: is it
really an `int`? `-5` passes that check without any trouble at all —
`isinstance(-5, int)` is `True`, exactly as true as `isinstance(5, int)`
is. But a real inventory count describes how many physical items are
sitting on a real shelf, and there is no such thing as negative five
physical items. Nothing about `isinstance(count, int)` was ever built
to know that. Has anyone actually checked what this code does with a
negative count — or has everyone, including this project's own author,
just been assuming it would somehow be fine?

### Introduce the Concept in Isolation

A small, throwaway, unrelated function — never part of
`inventory-report` — makes the technique concrete. `is_valid_percentage`
is meant to accept `0` through `100`, inclusive, and reject everything
else:

```python
def is_valid_percentage(value):
    return 0 <= value <= 100

print("0:  ", is_valid_percentage(0))
print("-1: ", is_valid_percentage(-1))
print("100:", is_valid_percentage(100))
print("101:", is_valid_percentage(101))
print("50: ", is_valid_percentage(50))
```

Run directly, the real output is:

```text
$ python3 boundary_lab.py
0:   True
-1:  False
100: True
101: False
50:  True
```

Five values, deliberately chosen, not five random ones: `0` and `100`
are the two edges of the valid range itself — the last values still
accepted on each side — and `-1` and `101` are the very next value
just past each edge in either direction, the first values that must be
rejected. `50` is included only as a single, ordinary, middle-of-the-
range sanity check — the smallest part of this whole test, even though
it's the kind of value a less deliberate test would reach for first and
often stop at. This deliberate choice — the last valid value and the
first invalid one, on every edge a valid range actually has — is called
**boundary value analysis**.

### Discard the Throwaway Example

`is_valid_percentage` and this scratch script are not part of
`inventory-report` and will not appear in it. What survives is the
method: identify every real edge a valid input range has, and test
right at each one, deliberately, rather than trusting that typical
values are representative of edge behavior too.

### Project Change

- **Reference Source.** No reference counterpart — this lesson extends
  `load_inventory`'s existing validation, added in Lesson 121, with a
  boundary it didn't yet check.
- **Files affected.** `inventory_cli.py`, modified — one new
  condition inside `load_inventory`. `inventory_zero.json` and
  `inventory_negative.json`, created — two new, deliberately chosen
  fixture files. `check_load_inventory_boundaries.py`, created.
- **Change type.** Add.
- **Location.** The new condition is added directly after the existing
  `isinstance` check, inside `load_inventory`'s own loop.
- **Dependencies.** None beyond what `inventory-report` already has.

### The New Code

```python
        if count < 0:
            raise ValueError("inventory count for " + name + " cannot be negative: " + repr(count))
```

### The Updated Project

`load_inventory`, in full, with the new condition marked — the smallest
enclosing structure the new lines land inside:

```python
def load_inventory(path):
    with open(path) as f:
        inventory = json.load(f)
    for name, count in inventory.items():
        if not isinstance(count, int):
            raise ValueError("inventory count for " + name + " is not a number: " + repr(count))
        if count < 0:                                                                          # ← new
            raise ValueError("inventory count for " + name + " cannot be negative: " + repr(count))  # ← new
    return inventory
```

### Mechanical Walkthrough

- **`if count < 0:`** — a second condition, checked immediately after
  the existing type check, for every item in the loop. `0` itself is
  not `< 0`, so a count of exactly zero does not trigger this branch —
  zero stock is real and valid; only a count strictly below it is not.
- **`raise ValueError(...)`** — the same pattern the line above it
  already uses, given full treatment again here per the Repetition
  Rule: raises a real exception rather than silently continuing, with a
  message built from the same string-concatenation-plus-`repr()` style
  every error message in this project has used since Lesson 121, naming
  both which item is wrong and what its actual bad value was.

### CS Lens

```text
Also recognized in: an array index check that correctly rejects an
index past the end of a list but forgets to reject a negative one,
a date-of-birth field that correctly rejects a year in the far future
but silently accepts a year before anyone alive could have been born,
a temperature sensor reading validated for "is this a number" but
never for "is this a number physically possible for this sensor to
produce," a login form that correctly enforces a maximum password
length but was never tested against a password of exactly zero
characters
```

Every one of these shares the identical shape as this lesson's own bug:
a check that's completely correct about the property it actually tests,
paired with a silent gap at the one specific value nobody thought to
try.

### SE Lens

The alternative — testing with typical, comfortable, everyday values
like `{"widgets": 2, "gadgets": 5}` — is not wrong, and every check
written from Lesson 115 through Lesson 121 has done exactly that,
usefully. What it structurally cannot do, proven again by this lesson's
own real gap: reveal a mistake that only exists at an edge those
typical values never touch. The real cost of boundary value analysis is
small and mechanical, not conceptual: for every input with a real,
meaningful valid range, identify each edge, and write a test for the
last accepted value and the first rejected one — a fixed, learnable
procedure, not a matter of getting lucky the way Lesson 117's own
discovery was. The honest limit: this technique only finds what it's
deliberately pointed at. It requires first correctly identifying *which*
values actually bound the valid domain — "a count can't be negative" had
to be recognized as a real requirement before any boundary around it
could be tested at all, and nothing about this technique itself
generates that recognition automatically.

### Commands Needed

No new command — `python3 check_load_inventory_boundaries.py`, the same
invocation every check file in this project already uses.

### Run It

The two fixture files, written to sit deliberately on either side of
the boundary being tested. `inventory_zero.json` — the last value that
must remain valid:

```json
{
    "widgets": 0,
    "gadgets": 8
}
```

`inventory_negative.json` — the first value just past it, which must
not be:

```json
{
    "widgets": -1,
    "gadgets": 8
}
```

`check_load_inventory_boundaries.py`, run against the project *before*
this lesson's own fix — the existing `isinstance` check from Lesson 121
still in place, nothing more:

```text
$ python3 check_load_inventory_boundaries.py
check_load_inventory_accepts_zero_count passed
Traceback (most recent call last):
  File "/path/to/inventory-report/check_load_inventory_boundaries.py", line 16, in <module>
    check_load_inventory_rejects_negative_count()
  File "/path/to/inventory-report/check_load_inventory_boundaries.py", line 11, in check_load_inventory_rejects_negative_count
    assert False, "expected ValueError, none was raised"
           ^^^^^
AssertionError: expected ValueError, none was raised
```

The zero-count boundary was already handled correctly — it passes
immediately, with no code changes needed at all, real confidence
replacing an assumption. The negative-count boundary fails: no
`ValueError` was raised, meaning `load_inventory` genuinely, silently
accepted `-1`. Confirming what that silent acceptance actually leads to,
downstream, with the real count from the Problem step above:

```text
$ python3 -c "from inventory_report import low_stock_items, reorder_suggestion; inventory = {'widgets': -5, 'gadgets': 8}; print('low_stock_items:', low_stock_items(inventory, threshold=3)); print('reorder_suggestion:', reorder_suggestion(inventory, threshold=3, target=15))"
low_stock_items: ['widgets']
reorder_suggestion: {'widgets': 20}
```

`reorder_suggestion` recommends reordering `20` units of `widgets` —
`target - count` computed as `15 - (-5)`, a real number, correctly
arithmetic, and completely meaningless: no physical inventory system
can have `-5` items on a shelf for that number to even describe. With
the fix from the New Code step in place, the same check file, rerun:

```text
$ python3 check_load_inventory_boundaries.py
check_load_inventory_accepts_zero_count passed
check_load_inventory_rejects_negative_count passed
```

And the rest of the project's suite, confirmed undisturbed — the fix
only tightened one function's own validation; it didn't touch
`low_stock_items`, `reorder_suggestion`, or any of the functions those
checks already cover:

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
$ python3 check_build_reorder_report.py
check_build_reorder_report passed
check_build_reorder_report_rejects_target_below_threshold passed
$ python3 check_inventory_cli.py
check_inventory_cli passed
$ python3 check_inventory_end_to_end.py
check_inventory_end_to_end_rejects_bad_data passed
$ python3 -m mypy inventory_report.py
Success: no issues found in 1 source file
```

### Connecting Back

The isolated `is_valid_percentage` example proved boundary value
analysis as a repeatable method: identify every edge, test the last
valid value and the first invalid one. `load_inventory`'s own
`count < 0` check proved the identical method finds a real gap in real
project code — one that had been sitting there, unnoticed, since the
validation was first written in Lesson 121, invisible to every check
that came before this one because none of them ever happened to try
exactly `-1`.

---

## Connect the Pieces

Two deliberately chosen values, `0` and `-1`, moving through every
piece this lesson built, start to finish:

1. `inventory_zero.json` (`widgets: 0`) and `inventory_negative.json`
   (`widgets: -1`) are written specifically because `0` is the last
   value a real inventory count can validly hold and `-1` is the first
   one it cannot — not because either is a typical, ordinary sample.
2. Run against `load_inventory` as Lesson 121 left it, the zero case
   passes and the negative case reveals a real, silent gap: no
   `ValueError`, meaning `-1` was accepted.
3. Calling `reorder_suggestion` directly with a negative count confirms
   what that silent acceptance produces: a real, printed recommendation
   to reorder `20` units, computed correctly and meaning nothing.
4. `if count < 0: raise ValueError(...)` is added to `load_inventory`,
   directly beside its existing type check.
5. Both boundary checks now pass — `0` still accepted, `-1` now
   correctly rejected — and the rest of the project's suite, rerun in
   full, confirms nothing else was disturbed.

## What Breaks Without This

This lesson's own investigation already showed it directly:
`isinstance(count, int)`, exactly as written since Lesson 121, is
completely correct at the one thing it checks, and that correctness
created a false sense that "count validation" was already handled.
Restated plainly: a type check answers "is this the right kind of
value," never "is this a value that could ever really occur." Without
deliberately testing the specific boundary where a count stops being
physically possible, `-5` sails through every check in this project
exactly as cleanly as `5` does, and comes out the other side as a real,
printed, nonsensical business recommendation — not a crash, not an
error, just a wrong answer confidently delivered.

## Exercises

1. `threshold` and `target`, both read from the command line as
   `int(sys.argv[...])`, have never had their own boundaries tested
   either. Identify what a negative `threshold` should mean (if
   anything), write a fixture or a direct call proving what actually
   happens today, and decide whether it needs the same kind of explicit
   guard this lesson just added for `count`.
2. `build_reorder_report`'s existing precondition (Lesson 119) rejects
   `target <= threshold`. Using boundary value analysis deliberately,
   test `target` set to exactly one more than `threshold` — the first
   value that boundary is supposed to *accept* — and confirm it behaves
   correctly, rather than assuming the existing guard's own boundary is
   right just because it was written carefully.
3. `inventory_zero.json` tests the lower edge of what a count can be.
   Real inventory counts don't have a stated *upper* boundary anywhere
   in this project's code. Discuss, without necessarily writing code,
   whether that absence is a real gap the way the negative-count one
   was, or a legitimate case where no meaningful upper boundary exists
   to test.

## Definition of Done

- [ ] `load_inventory` rejects any count `< 0` with a clear
      `ValueError` naming the specific item and value.
- [ ] `inventory_zero.json` and `inventory_negative.json` exist, and
      `check_load_inventory_boundaries.py` tests both directly against
      `load_inventory`.
- [ ] Both checks in `check_load_inventory_boundaries.py` pass.
- [ ] Every other check file in the project still passes unchanged.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `reject negative inventory counts; a boundary check found that
      isinstance(count, int) alone let a physically impossible value
      through` — not `add validation`.

Next: Lesson 123 — Test Doubles.
