# Lesson 117: Test Oracles

**What you will build.** `reorder_suggestion` — one of `inventory-report`'s
three original functions, present since Lesson 105 — has never had a
check written against it at all. This lesson gives it one, but not in
the style every prior check in this project has used: instead of one
person hand-computing a single expected value and asserting against it,
`check_reorder_suggestion.py` builds a second, independently written
version of the same logic, `reorder_suggestion_naive`, and compares the
two directly, across more than one real inventory. Run for real against
`inventory-report`'s actual code, this immediately surfaces a genuine
disagreement — which turns out to trace back not to a bug in either
function's arithmetic, but to a docstring on `low_stock_items` that has
been quietly wrong, in this exact project, since before Lesson 115 ever
ran a check against it. The transferable problem: every check written
in this project so far has depended on one person already knowing the
right answer before writing the `assert`. This lesson names that
mechanism, shows exactly where it can go wrong without anyone noticing,
and builds a second kind of mechanism that doesn't require already
knowing the answer — along with its own honest limits.

**What you need to know first.** Lesson 115 (Why Test?) and Lesson 116
(Testing vs Verification) — specifically the `check_<something>`
pattern both already established and this lesson reuses without change:
a plain function that calls real project code, `assert`s a result,
prints a success line, and calls itself immediately at module scope.
This lesson also reuses `reorder_suggestion` and `low_stock_items` from
`inventory_report.py`, both present since Domain 8, and the same
`git add` / `git commit` sequence used throughout.

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

Still **Verification**, the same stage Lessons 115 and 116 both placed
`inventory-report` on. Lesson 115's concrete value there was
`low_stock_items` against `{"widgets": 2, "gadgets": 5, "gizmos": 8}`;
Lesson 116's was `format_reorder_line_priced("widgets", 12, 4.50)`. This
lesson's own concrete value at the same stage: `reorder_suggestion(
{"widgets": 3, "gadgets": 8})`, compared against a second, independent
computation of the identical thing rather than against one person's
hand-picked expected number.

**Terms used in this lesson.**

- **Test oracle** — the mechanism a test or check actually uses to
  decide whether the result it observed is correct. Why it needs a
  name: "does the output match what I expected" quietly hides a second
  question underneath it — expected according to what, decided how, and
  by whom — and every check written in this project so far has answered
  that second question the exact same way without ever naming it.
- **Human oracle** — an oracle where a person directly judges or
  computes, by hand, what the correct result of a given input should
  be. Every `assert result == <value>` written in Lessons 115 and 116
  is a human oracle: a person read the code, worked out what it should
  return, and wrote that answer into the check. Why it matters: it's
  fast and needs no extra code, but it inherits whatever the person
  writing it believes — including a belief that happens to be wrong in
  the exact same way the code itself is wrong.
- **Derived oracle** — an oracle produced by a second, independently
  written procedure that's meant to compute the same answer a different
  way, compared directly against the first instead of against one
  hand-picked value. Why it exists: a mistake now has to be made twice,
  independently, in the same direction, to survive comparison — far
  less likely than one person making it once while also writing the
  check meant to catch it.
- **Specified oracle** — an oracle derived from a formal or semi-formal
  written specification of intended behavior — a docstring, a contract,
  a requirements document — rather than from running or independently
  reimplementing any code. Why it matters here specifically: a
  specification is itself just a written claim, exactly as capable of
  being wrong as any other one, and this lesson's own real example
  turns out to prove precisely that.

**Objects and methods used.** No new external class or method is
introduced this lesson — `reorder_suggestion_naive`'s own code is built
entirely from constructs `inventory_report.py` already uses elsewhere
(`dict.items()`, a `for` loop, an `if` guard), each given full treatment
again below, per the Repetition Rule, at the point it appears in this
lesson's own new code.

---

## Concept Unit: Derived Oracles — Comparing Two Independent Answers Instead of Trusting One

### The Problem

`reorder_suggestion` has existed since Lesson 105. Nothing has ever
checked it. Writing a check for it the way every check in this project
has been written so far means picking a sample inventory, reading
`reorder_suggestion`'s own source code, working out by hand what it
should return for that inventory, and asserting against that hand-worked
answer. That's exactly what `check_low_stock_items`,
`check_format_reorder_line`, and `check_format_reorder_line_priced` all
already do. But look closely at what that process actually requires:
the person writing the check has to already know the right answer,
worked out using the same understanding of the requirement that
produced the code in the first place. If that understanding is wrong —
in the code and in the person's head, the same way — the check will
agree with the code. It will pass. And it will have proven nothing.

### Introduce the Concept in Isolation

A small, throwaway, unrelated pair of functions — never part of
`inventory-report` — makes the alternative concrete. Both are meant to
compute the sum of the even numbers in a list, written two different
ways, by two different (imagined) people, neither one checked against a
hand-picked expected value at all:

```python
def sum_of_evens_a(numbers):
    total = 0
    for n in numbers:
        if n % 2 == 0:
            total += n
    return total

def sum_of_evens_b(numbers):
    return sum(n for n in numbers if n % 2 == 1)

sample = [1, 2, 3, 4, 5, 6]
result_a = sum_of_evens_a(sample)
result_b = sum_of_evens_b(sample)
print("sum_of_evens_a:", result_a)
print("sum_of_evens_b:", result_b)
print("agree:", result_a == result_b)
```

Run directly, the real output is:

```text
sum_of_evens_a: 12
sum_of_evens_b: 9
agree: False
```

Neither function was compared against a hand-picked "the answer should
be 12" — instead, two independent computations were run against the
same input and compared to *each other*. They disagree, and that
disagreement is itself real, useful information: something is wrong
between these two functions, discovered without anyone first having to
already know that the correct answer for `[1, 2, 3, 4, 5, 6]` is `12`.
This comparison mechanism — a second, independently computed answer,
checked against the first instead of against a fixed literal — is
called a **derived oracle**. (For the record, since the throwaway
example is about to be discarded and the answer matters for the point
being made: `sum_of_evens_b` has a real bug — `% 2 == 1` selects the
*odd* numbers, not the even ones — but nothing about running the
comparison itself required knowing that in advance. The disagreement is
what points at the problem; deciding *which side* is wrong still took a
moment of real reasoning about what "even" actually means.)

### Discard the Throwaway Example

`sum_of_evens_a` and `sum_of_evens_b` are not part of `inventory-report`
and will not appear in it. What survives is the mechanism: run two
independent computations, compare them to each other, and treat
disagreement itself as the signal — before, not instead of, working out
which one is actually right.

### Project Change

- **Reference Source.** No reference counterpart — `reorder_suggestion`
  has existed since Lesson 105 with no check of any kind; this is a
  from-scratch addition closing that gap.
- **Files affected.** `check_reorder_suggestion.py`, created. As this
  unit's own investigation below finds a real, separate problem, one
  further file — `inventory_report.py` — ends up modified too, but only
  after the new check exposes why.
- **Change type.** Add.
- **Location.** A new top-level file, alongside `check_low_stock.py`,
  `check_format_reorder_line.py`, and `check_format_reorder_line_priced.py`.
- **Dependencies.** None beyond what `inventory-report` already has.

### The New Code

```python
def reorder_suggestion_naive(inventory, threshold=3, target=15):
    result = {}
    for name, count in inventory.items():
        if count <= threshold:
            result[name] = target - count
    return result
```

This is written by consulting only `low_stock_items`'s own docstring —
`"""Return names of items at or below the given threshold."""` — not by
reading `reorder_suggestion`'s actual source, the same way a second
engineer, asked to independently implement "flag anything at or below
the threshold" from that written description alone, might.

### The Updated Project

`check_reorder_suggestion.py`, in full:

```python
from inventory_report import reorder_suggestion

def reorder_suggestion_naive(inventory, threshold=3, target=15):  # ← new
    result = {}                                                    # ← new
    for name, count in inventory.items():                          # ← new
        if count <= threshold:                                     # ← new
            result[name] = target - count                          # ← new
    return result                                                   # ← new

def check_reorder_suggestion_matches_naive():                      # ← new
    inventory = {"widgets": 3, "gadgets": 8}                        # ← new
    real = reorder_suggestion(inventory)                            # ← new
    naive = reorder_suggestion_naive(inventory)                     # ← new
    print("reorder_suggestion:      ", real)                        # ← new
    print("reorder_suggestion_naive:", naive)                       # ← new
    assert real == naive                                            # ← new
    print("check_reorder_suggestion_matches_naive passed")          # ← new

check_reorder_suggestion_matches_naive()                            # ← new
```

This whole file is new — a fresh, freestanding check file — so there is
no larger, pre-existing structure to show it landing inside; the file
shown above, in full, is already the complete update.

### Mechanical Walkthrough

- **`from inventory_report import reorder_suggestion`** — an import
  statement, reused unchanged from every prior check file in this
  project: it makes the real, already-existing `reorder_suggestion`
  function available in this file under its own name, without copying
  its code.
- **`def reorder_suggestion_naive(inventory, threshold=3, target=15):`**
  — a function definition, with two parameters (`threshold`, `target`)
  given default values via `=`, the same default-parameter syntax
  `reorder_suggestion` itself already uses — calling
  `reorder_suggestion_naive(inventory)` alone is enough; `threshold` and
  `target` only need to be supplied when a caller wants something other
  than `3` and `15`.
- **`result = {}`** — creates a brand-new, empty dictionary and binds it
  to the name `result`. Unlike `reorder_suggestion`'s own single-
  expression dict comprehension, this function builds its dictionary up
  one entry at a time across a loop — a deliberately different shape of
  code computing what's meant to be the same thing, which is the entire
  point of a derived oracle: two implementations that don't share a
  single line of logic are far less likely to share a single mistake.
- **`for name, count in inventory.items():`** — the same iteration
  pattern `low_stock_items` already uses: `inventory.items()` returns
  the dictionary's key/value pairs, and each pair is unpacked into
  `name` and `count` on every trip through the loop.
- **`if count <= threshold:`** — the boundary condition this whole unit
  turns on. `<=` includes the case where `count` and `threshold` are
  exactly equal; `reorder_suggestion`'s own condition, shown further
  down as `if count < threshold`, does not.
- **`result[name] = target - count`** — dictionary item assignment:
  `result[name]` names a key (creating it, since `result` started
  empty), and `=` stores `target - count` as that key's value. This is
  the explicit, step-by-step equivalent of what
  `reorder_suggestion`'s dict comprehension does in one expression —
  same idea, spelled out one assignment at a time instead of built as a
  single literal.
- **`return result`** — hands the fully built dictionary back to
  whatever called this function.
- **`inventory = {"widgets": 3, "gadgets": 8}`** — a literal dictionary,
  the concrete sample input both implementations will be run against.
- **`real = reorder_suggestion(inventory)`** and
  **`naive = reorder_suggestion_naive(inventory)`** — the same input,
  run through both implementations, each result captured under its own
  name.
- **`print(...)`** (both calls) — prints each result plainly, before the
  comparison, so that if the two disagree, both actual values are
  already visible in the output rather than hidden behind a bare
  failure.
- **`assert real == naive`** — this is the derived oracle itself, in
  code: not `assert real == <some hand-picked literal>`, but a direct
  comparison between two independently produced answers.

### CS Lens

```text
Also recognized in: compiler test suites that run the same source
file through two independently written compilers (GCC and Clang) and
diff the results, cryptographic library test suites checked against
independently published reference vectors, financial systems running
an old and a new calculation engine side by side in production
("shadow mode") and diffing every output before trusting the new one,
early aerospace flight software historically built as multiple,
independently coded versions specifically so a shared misreading of
one requirement couldn't produce one silent, agreed-upon wrong answer
```

This general technique — comparing two or more independently produced
implementations against each other instead of against one fixed
expected value — is called **differential testing** in the software
testing literature, or **N-version programming** when it's built
directly into a running system rather than only used while testing one.

### SE Lens

The alternative — the one every check in this project used through
Lesson 116 — is a human oracle: faster to write, no second
implementation to build or maintain. That alternative isn't wrong; it's
how `check_low_stock_items`, `check_format_reorder_line`, and
`check_format_reorder_line_priced` all still work, unchanged, right now.
The real cost a derived oracle adds is concrete and ongoing: a second
piece of logic, `reorder_suggestion_naive`, now exists purely to test
the first, and if `reorder_suggestion`'s actual requirement ever
legitimately changes, both implementations have to be updated together
or the oracle itself becomes the thing that's wrong. What it buys in
return, proven for real by this exact unit: a mistake shared between a
human's belief and the code they wrote — the one blind spot a human
oracle structurally cannot see past — has to now be made independently,
twice, the same way, to survive. The honest limit, worth stating plainly
before this unit's own investigation resolves anything below: comparing
two implementations only tells you *that* they disagree, on *whatever
inputs actually get run*. It does not, by itself, say which one is
right — and it says nothing at all about an input neither implementation
was ever run against in the first place.

### Commands Needed

No new command — this check runs the same way every prior one has:
`python3 check_reorder_suggestion.py`.

### Run It

```text
$ python3 check_reorder_suggestion.py
reorder_suggestion:       {}
reorder_suggestion_naive: {'widgets': 12}
Traceback (most recent call last):
  File "/path/to/inventory-report/check_reorder_suggestion.py", line 19, in <module>
    check_reorder_suggestion_matches_naive()
  File "/path/to/inventory-report/check_reorder_suggestion.py", line 16, in check_reorder_suggestion_matches_naive
    assert real == naive
           ^^^^^^^^^^^^^
AssertionError
```

A real disagreement, on the very first run, on an inventory that was not
picked to be tricky — `{"widgets": 3, "gadgets": 8}` uses `3` for
`widgets` simply because `3` is `reorder_suggestion`'s own default
`threshold`, the same small-number style `check_low_stock.py` already
used for its own sample data. `widgets` sits exactly on the boundary
`count == threshold` by ordinary coincidence, not by deliberate design
— and that coincidence is exactly what exposes the gap: `reorder_
suggestion` returns `{}` for it (`3 < 3` is `False`, so `widgets` is
excluded), while `reorder_suggestion_naive` returns `{'widgets': 12}`
(`3 <= 3` is `True`, so it's included).

The derived oracle has done its job: it proved, without anyone first
having to know the "correct" answer, that something disagrees. It has
not yet said which side is wrong. Both readings are plausible on their
own — "at or below" (what `low_stock_items`'s own docstring literally
says) versus "strictly below" (what `reorder_suggestion`'s own code has
always done). Settling it means going back to a *third*, already-
verified source: Lesson 115's own `check_low_stock_items`, still
passing, right now, unchanged, in this same project. It runs
`low_stock_items` against `{"widgets": 2, "gadgets": 5, "gizmos": 8}`
with `threshold=5` and asserts the result is exactly `["widgets"]` —
`gadgets`, at exactly `5`, is *not* in that result. If "at or below"
were the real, intended rule, `gadgets` would have to be included too,
and `check_low_stock_items` would already be failing. It isn't. That
settles it: the strictly-below behavior is the one this project has
already committed to and already verified: `low_stock_items`'s own
docstring is what's wrong, not either function's code.

Two fixes follow directly from that conclusion. First,
`reorder_suggestion_naive` is corrected to match:

```python
def reorder_suggestion_naive(inventory, threshold=3, target=15):
    result = {}
    for name, count in inventory.items():
        if count < threshold:
            result[name] = target - count
    return result
```

Second, since the wrong belief came from `low_stock_items`'s own
docstring, the actual documentation bug is fixed at its source:

```python
def low_stock_items(inventory, threshold=3):
    """Return names of items strictly below the given threshold."""
```

`check_reorder_suggestion.py` itself, extended with a second inventory
so the fixed oracle is proven to agree on more than the one case that
first exposed it, not just the boundary case that happened to catch it:

```python
from inventory_report import reorder_suggestion

def reorder_suggestion_naive(inventory, threshold=3, target=15):
    result = {}
    for name, count in inventory.items():
        if count < threshold:
            result[name] = target - count
    return result

def check_reorder_suggestion_matches_naive():
    inventory = {"widgets": 3, "gadgets": 8}
    real = reorder_suggestion(inventory)
    naive = reorder_suggestion_naive(inventory)
    assert real == naive
    print("check_reorder_suggestion_matches_naive passed")

def check_reorder_suggestion_matches_naive_second_inventory():
    inventory = {"widgets": 2, "gadgets": 5, "gizmos": 8}
    real = reorder_suggestion(inventory, threshold=5)
    naive = reorder_suggestion_naive(inventory, threshold=5)
    assert real == naive
    print("check_reorder_suggestion_matches_naive_second_inventory passed")

check_reorder_suggestion_matches_naive()
check_reorder_suggestion_matches_naive_second_inventory()
```

Run clean:

```text
$ python3 check_reorder_suggestion.py
check_reorder_suggestion_matches_naive passed
check_reorder_suggestion_matches_naive_second_inventory passed
```

And the rest of the project's own suite, confirmed undisturbed by either
fix — the docstring change touches no behavior, and `reorder_suggestion`
itself was never modified at all:

```text
$ python3 check_low_stock.py
check_low_stock_items passed
$ python3 check_format_reorder_line.py
check_format_reorder_line passed
$ python3 check_format_reorder_line_priced.py
check_format_reorder_line_priced passed
$ python3 -m mypy inventory_report.py
Success: no issues found in 1 source file
```

### Connecting Back

The isolated `sum_of_evens_a`/`sum_of_evens_b` example proved a
disagreement between two independent computations is real, useful
information even before anyone knows which side is right.
`reorder_suggestion_naive` proved the identical thing about real project
code — and, unlike the throwaway lab, its disagreement led somewhere
genuinely unexpected: not a bug in `reorder_suggestion`'s own logic at
all, but a docstring that had been silently wrong since before this
domain's very first check ever ran.

---

## Connect the Pieces

One concrete inventory, `{"widgets": 3, "gadgets": 8}`, moving through
every piece this lesson built, start to finish:

1. `reorder_suggestion_naive` is written independently, from
   `low_stock_items`'s own docstring wording ("at or below") rather than
   from `reorder_suggestion`'s actual source.
2. Both `reorder_suggestion` and `reorder_suggestion_naive` are run
   against `{"widgets": 3, "gadgets": 8}`. `reorder_suggestion` returns
   `{}`; `reorder_suggestion_naive` returns `{'widgets': 12}`.
3. `assert real == naive` fails — a real `AssertionError`, the derived
   oracle catching a genuine disagreement on the very first run.
4. The disagreement alone doesn't say which side is wrong. Lesson 115's
   own already-passing `check_low_stock_items` is consulted as a third,
   independent, already-verified source — and confirms the strictly-
   below reading is the one this project actually committed to.
5. `reorder_suggestion_naive` is corrected to `count < threshold`, and
   `low_stock_items`'s docstring is corrected to say what its code has
   always actually done.
6. `check_reorder_suggestion.py`, rerun on the same inventory plus a
   second one, passes cleanly — and the rest of the project's suite,
   rerun in full, confirms nothing else was disturbed.

## What Breaks Without This

`reorder_suggestion_naive`'s buggy, `<=` version is compared against a
different, deliberately *typical* inventory instead of the boundary one
— `{"widgets": 2, "gadgets": 8}`, values chosen the same unremarkable
way `check_low_stock.py`'s own sample data was chosen, with nothing
sitting exactly on `threshold`:

```python
def reorder_suggestion(inventory, threshold=3, target=15):
    return {name: target - count for name, count in inventory.items() if count < threshold}

def reorder_suggestion_naive_buggy(inventory, threshold=3, target=15):
    result = {}
    for name, count in inventory.items():
        if count <= threshold:
            result[name] = target - count
    return result

typical_inventory = {"widgets": 2, "gadgets": 8}
real = reorder_suggestion(typical_inventory)
buggy_naive = reorder_suggestion_naive_buggy(typical_inventory)
print("real:       ", real)
print("buggy_naive:", buggy_naive)
print("agree on typical input:", real == buggy_naive)
```

Run for real:

```text
real:        {'widgets': 13}
buggy_naive: {'widgets': 13}
agree on typical input: True
```

They agree. The exact same bug that a boundary input exposed a moment
ago is completely invisible here — `2 < 3` and `2 <= 3` are both `True`,
`8 < 3` and `8 <= 3` are both `False`, so the two rules produce identical
results on every input that isn't sitting exactly on `threshold` itself.
A derived oracle is not magic: it only reveals a disagreement between
two implementations on the inputs it's actually given, exactly the same
honest limit this lesson's own SE Lens already named. What made this
lesson's real disagreement surface at all was a small, ordinary
coincidence — reusing `reorder_suggestion`'s own default `threshold`
value as sample data happened to land exactly on the boundary. Choosing
boundary values on purpose, instead of hoping to stumble into one, is
its own full subject — Lesson 122 (Test Boundaries) and Lesson 128
(Property-Based Testing) are where that gets real, dedicated treatment.

## Exercises

1. Add a third check to `check_reorder_suggestion.py` using an inventory
   where every item's count is well above `threshold` (nothing reordered
   at all) and confirm both implementations still agree — a case this
   lesson's own two checks don't cover.
2. `restock_alert` also has never had a derived-oracle check written for
   it. Write `restock_alert_naive`, built independently (an explicit
   loop instead of `restock_alert`'s existing list comprehension calling
   `low_stock_items`), and compare the two the same way this lesson
   compared `reorder_suggestion` and `reorder_suggestion_naive`.
3. `reorder_suggestion_naive`, even after this lesson's fix, still isn't
   typed the way Lesson 116 typed `format_reorder_line` and
   `format_reorder_line_priced`. Add type hints to it and run `mypy`
   against `check_reorder_suggestion.py` to confirm it's clean.

## Definition of Done

- [ ] `check_reorder_suggestion.py` exists, comparing `reorder_suggestion`
      against an independently written `reorder_suggestion_naive` across
      at least two inventories, one of them the boundary case
      `{"widgets": 3, "gadgets": 8}`.
- [ ] `reorder_suggestion_naive` uses `count < threshold`, matching
      `reorder_suggestion`'s own real behavior.
- [ ] `low_stock_items`'s docstring says "strictly below," not "at or
      below."
- [ ] `python3 check_reorder_suggestion.py` prints both `passed` lines
      with no `AssertionError`.
- [ ] `check_low_stock.py`, `check_format_reorder_line.py`, and
      `check_format_reorder_line_priced.py` still all pass unchanged.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `add reorder_suggestion_naive as a derived oracle; fix
      low_stock_items docstring, which the oracle disagreement traced
      back to` — not `add test and fix docstring`.

Next: Lesson 118 — Unit Tests.
