# Lesson 132: Regression Testing

**What you will build.** Two checks already in this project —
`check_build_reorder_report_sorts_regardless_of_stub_order` (Lesson
125) and `check_low_stock_items_returns_sorted_names` (Lesson 131) —
get a real comment added above each one, naming the specific, real bug
each one exists to keep fixed, tying it to the lesson and commit where
that bug was actually found. Then, this project's own real `git`
history — eighteen real commits, accumulated across this entire domain
— is used directly: the exact code change Lesson 125 made is undone by
hand, `git diff` shows precisely what changed, and the still-present
`check_build_reorder_report_stub.py` — never touched by this lesson at
all — catches it immediately. The transferable problem this lesson
names: every check in this project already *is*, in effect, a
regression test the moment it outlives the bug it was written for —
this lesson makes that fact explicit, names it, and proves, using this
project's own real history, that it actually works.

**What you need to know first.** Lesson 125 (Stubs) and Lesson 131
(Mutation Testing) — the two specific, real historical fixes this
lesson names and protects explicitly. This lesson also reuses the real
`git log`, `git diff`, and `git checkout` commands established across
Domain 8 (Version Control & Collaboration).

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

Still **Verification**, and this lesson leans directly on **Change** —
a regression, by definition, is only meaningful relative to a real,
prior state something used to be in, which is exactly what version
control records. Concrete value carried forward: `build_reorder_
report`'s own `sorted(suggestions.items())` call, the exact real change
Lesson 125 made, reproduced by hand against the current project and
caught by the exact check that lesson wrote to protect it.

**Terms used in this lesson.**

- **Regression** (revisited from Lesson 118's own use of the term) — a
  piece of code that used to behave correctly and no longer does,
  because of a later change to it or to something it depends on.
- **Regression test** — an ordinary test, distinguished not by any
  special mechanism but by its stated purpose: it exists specifically
  to prevent one particular, real, previously found bug from silently
  reappearing. Why the distinction is worth naming explicitly, even
  though nothing about the code changes: a future reader who sees
  `check_build_reorder_report_stub.py` without knowing it exists
  because of Lesson 125's own real, historical fix might reasonably
  wonder whether it's safe to simplify or remove — the comment this
  lesson adds is what answers that question before it's ever asked.

**Objects and methods used.** No new external class or method — this
lesson reuses `git log`, `git diff`, and `git checkout`, all already
given full treatment in Domain 8, and Python's own comment syntax
(`#`), used throughout this project since Lesson 118's own regression
demonstration.

---

## Concept Unit: Regression Testing — Naming What a Test Actually Protects

### The Problem

`check_build_reorder_report_sorts_regardless_of_stub_order` exists
because Lesson 125 found a real, previously invisible bug: `build_
reorder_report` didn't sort its own output, disagreeing with
`restock_alert`'s alphabetical convention. Reading that check's own code
today shows exactly what it asserts — nothing about *why* it exists, or
what specific, real incident it's protecting against. Would a future
engineer, skimming this file months from now, know this check isn't
just an arbitrary extra case, but the only thing standing between a
real, already-happened bug and its own silent return?

### Introduce the Concept in Isolation

A small, throwaway, unrelated project — never part of `inventory-
report`, given its own real `git` history — makes the real mechanism
concrete. `apply_discount` ships with a genuine bug: treating `percent`
as though it were already a fraction, rather than dividing by `100`:

```python
def apply_discount(price, percent):
    return price - (price * percent)  # bug: percent treated as already a fraction
```

Run directly:

```text
$ python3 -c "from discount import apply_discount; print(apply_discount(10, 20))"
-190
```

Twenty percent off ten dollars should be `8.0`, not `-190`. The fix,
committed together with a regression test naming the exact incident it
protects:

```python
def apply_discount(price, percent):
    return price - (price * percent / 100)
```

Committed alongside a regression test naming the incident directly:

```python
from discount import apply_discount

def check_apply_discount_twenty_percent_off_ten_dollars():
    # Regression test: an earlier version treated `percent` as already
    # a fraction (missing the /100), so apply_discount(10, 20) returned
    # -190 instead of 8.0. This pins the real, correct answer down.
    assert apply_discount(10, 20) == 8.0
    print("check_apply_discount_twenty_percent_off_ten_dollars passed")

check_apply_discount_twenty_percent_off_ten_dollars()
```

Months later, in this same throwaway history, an unrelated cleanup
touches `apply_discount` again — and silently reintroduces the exact
same bug:

```python
def apply_discount(price, percent):
    discount_amount = price * percent  # "simplified" during an unrelated cleanup - lost the /100
    return price - discount_amount
```

The regression test, never touched, run against this new change:

```text
$ python3 check_discount.py
Traceback (most recent call last):
  File "/path/to/lab/check_discount.py", line 10, in <module>
    check_apply_discount_twenty_percent_off_ten_dollars()
  File "/path/to/lab/check_discount.py", line 7, in check_apply_discount_twenty_percent_off_ten_dollars
    assert apply_discount(10, 20) == 8.0
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

`git diff`, run against the real, committed history, shows exactly what
changed:

```text
$ git diff discount.py
diff --git a/discount.py b/discount.py
index 4599be3..efd6041 100644
--- a/discount.py
+++ b/discount.py
@@ -1,2 +1,3 @@
 def apply_discount(price, percent):
-    return price - (price * percent / 100)
+    discount_amount = price * percent  # "simplified" during an unrelated cleanup - lost the /100
+    return price - discount_amount
```

`git checkout -- discount.py`, the same real command Domain 8 already
established, restores the last committed, correct version:

```text
$ git checkout -- discount.py
$ python3 check_discount.py
check_apply_discount_twenty_percent_off_ten_dollars passed
```

The check's own comment — written once, at the moment the fix was made
— is what let this whole sequence be understood immediately: not "some
test failed," but "the exact bug from before is back."

### Discard the Throwaway Example

`apply_discount`, its check, and this throwaway repository are not part
of `inventory-report` and will not appear in it. What survives is the
practice: name the specific, real incident a test protects, at the
moment the fix is made, so a future reader — and a future regression —
both get the context they need immediately.

### Project Change

- **Reference Source.** No reference counterpart — this lesson adds
  documentation to two already-correct, already-existing checks, tying
  each to the real, specific commit that introduced it.
- **Files affected.** `check_build_reorder_report_stub.py`, modified —
  a comment added above `check_build_reorder_report_sorts_regardless_
  of_stub_order`. `check_low_stock.py`, modified — a comment added
  above `check_low_stock_items_returns_sorted_names`.
- **Change type.** Add (comments only — no behavior changes).
- **Location.** Directly above each check function's own `def` line.
- **Dependencies.** None.

### The New Code

```python
    # Regression test: Lesson 125 found build_reorder_report echoing
    # reorder_suggestion's own unsorted dict order, disagreeing with
    # restock_alert's alphabetical convention. This pins down sorted
    # output regardless of what order the underlying dict happens to be in.
```

### The Updated Project

`check_build_reorder_report_stub.py`, with the new comment marked:

```python
import inventory_report

def stub_reorder_suggestion(inventory, threshold, target):
    return {"zzz_item": 5, "aaa_item": 10}

# Regression test: Lesson 125 found build_reorder_report echoing            # ← new
# reorder_suggestion's own unsorted dict order, disagreeing with            # ← new
# restock_alert's alphabetical convention. This pins down sorted            # ← new
# output regardless of what order the underlying dict happens to be in.    # ← new
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

`check_low_stock.py`, with its own new comment marked:

```python
from inventory_report import low_stock_items

def check_low_stock_items():
    inventory = {"widgets": 2, "gadgets": 5, "gizmos": 8}
    result = low_stock_items(inventory, threshold=5)
    assert result == ["widgets"]
    print("check_low_stock_items passed")

# Regression test: Lesson 131's own mutation test found that every           # ← new
# existing check happened to use inventories with only one qualifying       # ← new
# item, so removing low_stock_items' sorted() call was never noticed.       # ← new
# This uses two items, deliberately out of order, to actually verify it.   # ← new
def check_low_stock_items_returns_sorted_names():
    inventory = {"zebra": 1, "apple": 2}
    result = low_stock_items(inventory, threshold=5)
    assert result == ["apple", "zebra"]
    print("check_low_stock_items_returns_sorted_names passed")

check_low_stock_items()
check_low_stock_items_returns_sorted_names()
```

### Mechanical Walkthrough

- **`# Regression test: ...`** (both locations) — a comment, the same
  `#`-prefixed syntax used since Lesson 118's own regression
  demonstration, here given a genuinely new purpose: not explaining
  *what* the check does — its own code already does that — but *why*
  it exists, naming the specific lesson and the specific bug, so a
  future reader never has to guess whether this check is protecting
  something real.

### CS Lens

```text
Also recognized in: a "lessons learned" section attached directly to an
incident postmortem, naming exactly what changed to prevent that
specific failure from recurring, an aircraft maintenance log recording
not just what was repaired but which prior failure the repair was
responding to, a changelog entry that names the specific bug a release
fixes, not just "various improvements," a scar — a real, physical
record on the body of a specific past injury, still there long after
the wound itself has healed
```

### SE Lens

The alternative — every check in this project until this lesson —
works exactly as well without the comment; nothing about the code's
actual behavior depends on it. What the comment buys, proven directly
by this lesson's own isolated lab: the difference between a future
engineer seeing a failing test and immediately understanding "this
specific historical bug is back" versus seeing a failing test and
having to reconstruct that context from scratch — or worse, not
bothering to, and treating the check itself as the thing to delete
rather than the regression as the thing to fix. The real cost is small
and one-time: a few lines of comment, written once, at the moment a fix
is actually made, when the context is freshest and cheapest to record.
The honest limit: a comment is not code — nothing enforces that it
stays accurate if the check itself is later changed for an unrelated
reason, the same honest limit every piece of documentation in this
curriculum has already carried since Lesson 88's own Architecture
Decision Records.

### Commands Needed

No new command — `git diff`, `git checkout`, and `git log`, all already
established in Domain 8.

### Run It

This project's own real history, `git log`, confirming the exact commit
where Lesson 125's fix landed:

```text
$ git log --oneline | grep "sort build_reorder_report"
246f86b sort build_reorder_report's output; a stub with deliberately unsorted keys found it disagreed with restock_alert's own alphabetical convention
```

The exact change that commit made to `inventory_report.py`:

```text
$ git show 246f86b -- inventory_report.py
-    for name, qty in suggestions.items():
+    for name, qty in sorted(suggestions.items()):
```

That exact change is undone by hand, against the current project — not
by reverting the whole commit, which would remove the protecting check
along with the fix, but the way a real, unrelated future change might
accidentally touch the same line:

```python
def build_reorder_report(inventory, threshold=3, target=15):
    suggestions = reorder_suggestion(inventory, threshold, target)
    lines = []
    for name, qty in suggestions.items():  # regression: Lesson 125 fix silently undone
        lines.append(format_reorder_line(name, qty))
    return lines
```

`check_build_reorder_report_stub.py` — unmodified by this exact
regression, still holding the comment this lesson just added — run
against it:

```text
$ python3 check_build_reorder_report_stub.py
Traceback (most recent call last):
  File "/path/to/inventory-report/check_build_reorder_report_stub.py", line 33, in <module>
    check_build_reorder_report_sorts_regardless_of_stub_order()
  File "/path/to/inventory-report/check_build_reorder_report_stub.py", line 15, in check_build_reorder_report_sorts_regardless_of_stub_order
    assert result == ["aaa_item: reorder 10", "zzz_item: reorder 5"]
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

Caught immediately, and the comment now sitting directly above this
exact check explains precisely what just happened, to anyone who reads
it. `git diff`, run against the real project's own tracked history,
shows the regression exactly:

```text
$ git diff inventory_report.py
-    for name, qty in sorted(suggestions.items()):
+    for name, qty in suggestions.items():  # regression: Lesson 125 fix silently undone
```

`git checkout -- inventory_report.py` restores the real, correct,
committed version:

```text
$ git checkout -- inventory_report.py
$ python3 check_build_reorder_report_stub.py
check_build_reorder_report_sorts_regardless_of_stub_order passed
check_build_reorder_report_handles_empty_suggestions passed
```

### Connecting Back

The isolated `apply_discount` example proved a comment naming a
specific incident, written once at fix time, turns a future failure
into an immediately understood regression instead of a mystery.
Applying it to `check_build_reorder_report_stub.py` and `check_low_
stock.py` proved the same practice, using this project's own real,
eighteen-commit history — and reproducing Lesson 125's exact fix, by
hand, against the current tree confirmed the check it originally
motivated still catches it today, comment and all.

---

## Connect the Pieces

One real historical commit, `246f86b`, moving through every piece this
lesson built, start to finish:

1. `git log` and `git show` recover the exact real change that commit
   made — the addition of `sorted()` inside `build_reorder_report`.
2. A comment is added above `check_build_reorder_report_sorts_
   regardless_of_stub_order`, naming that commit's own real incident
   explicitly.
3. The exact regression — `sorted()` removed again — is reproduced by
   hand against the current project.
4. The unmodified, already-existing check catches it immediately, its
   new comment now explaining exactly why to anyone reading the
   failure.
5. `git diff` confirms precisely what changed; `git checkout --` restores
   the real, correct, committed version.
6. The identical treatment is applied to `check_low_stock_items_
   returns_sorted_names`, naming Lesson 131's own real mutation-testing
   finding.

## What Breaks Without This

Nothing about this project's actual behavior depends on the comments
this lesson added — every check already worked exactly as well without
them. What's missing without this practice is context, and context is
precisely what erodes fastest over a project's real lifetime. Restated
plainly: this lesson's own isolated lab and its real project
demonstration both proved the checks themselves already catch a real
regression, comment or not. What the comment protects against is a
different, quieter failure: a future engineer, looking at a check that
seems to duplicate or overlap with another one, deciding — with no
record of why it exists — that it's safe to simplify away, precisely
because nothing told them it was standing guard over something that
already happened once.

## Exercises

1. `check_load_inventory_boundaries.py` (Lesson 122) and `check_
   restock_alert_isolated.py` (Lesson 123) both exist because of real,
   specific findings too. Add the same kind of comment to each,
   naming the lesson and the real gap each one closed.
2. Using `git log --oneline`, find one commit message in this project's
   own real history that does *not* clearly explain why its change was
   made — if every one already does, explain, in a comment, what makes
   a commit message like `add reorder_suggestion_naive as a derived
   oracle; fix low_stock_items docstring, which the oracle disagreement
   traced back to` (Lesson 117) more useful to a future reader than a
   message that only says what changed.
3. Reproduce Lesson 120's own real regression (`sys.argv[1]` used
   without `int()` inside `inventory_cli.py`'s `main`) by hand against
   the current project, confirm `check_inventory_cli.py` catches it,
   and add the same kind of naming comment to that check before
   reverting the change.

## Definition of Done

- [ ] `check_build_reorder_report_sorts_regardless_of_stub_order` has a
      comment naming Lesson 125 and the real bug it protects.
- [ ] `check_low_stock_items_returns_sorted_names` has a comment naming
      Lesson 131 and the real gap it closed.
- [ ] Reproducing Lesson 125's own regression by hand against the
      current project (verified, then reverted via `git checkout --`)
      causes `check_build_reorder_report_stub.py` to fail.
- [ ] Every other check file in the project still passes unchanged.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `name the specific historical bug each of these two checks
      protects against, directly in a comment above each one` — not
      `add comments`.

Next: Lesson 133 — Test Isolation.
