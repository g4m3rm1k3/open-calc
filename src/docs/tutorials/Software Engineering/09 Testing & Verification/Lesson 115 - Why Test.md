# Lesson 115: Why Test?

**What you will build.** The first real, automated check against
`inventory-report/`'s own `low_stock_items` function — a small Python
function, `check_low_stock_items`, built entirely from Python's
`assert` statement, that runs the real function against a real input and
raises a real, visible error the instant its output stops matching what
it's supposed to. Then, on purpose, this lesson breaks `low_stock_items`
with a real, plausible regression and proves, concretely, the one thing
this entire lesson exists to argue: a person checking a function's
output once, by hand, and a computer checking the identical thing every
single time the code changes, are not the same activity, even when they
compute the identical comparison. The transferable problem this lesson
is actually about: every domain in this curriculum before this one has
shown code working, once, in a "Run It" step, and moved on. Nothing
before this lesson has ever gone back and re-checked that a Domain 7
lesson's own fix still holds after a Domain 8 lesson's own later change
touched the same file — an honest gap this domain exists to close.

**What you need to know first.** This domain, like Domain 7 (Implementation
Engineering) and Domain 8 (Version Control & Collaboration) before it,
does not reconstruct any other domain's own unseen final code state from
summary alone. It does, however, reuse `inventory-report/` — the real,
from-scratch project Domain 8 built and left in a fully known, fully
verified state, ending with `low_stock_items`, `restock_alert`, and
`reorder_suggestion` all committed to `main`. This lesson picks up that
exact, actually-read state directly, rather than starting a fourth fresh
example — the first time in this curriculum a new domain has been able
to do that, specifically because this session verified `inventory-report/`'s
own real content directly while building Domain 8, rather than working
from a summary of it. This lesson also assumes ordinary Python function
and dictionary fluency, established many domains ago.

**Pipeline diagram.** Restated in full, as every lesson touching a named
pipeline stage does:

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

This domain sits squarely at **Verification** — and it opens by
revisiting, not introducing, that stage. Lesson 12 already placed a real
example on it: running `is_username_available` by hand against the
literal inputs `"dave"` and `"alice"`, "one hand-checked example each,"
in that lesson's own words. That was genuinely Verification — it did
check the code actually worked — and this lesson's own first Concept
Unit argues directly that it was also exactly the fragile, one-time kind
this whole domain exists to replace: nothing about a hand check run once,
back in Domain 1, would have caught a later change, in some other
domain entirely, quietly breaking `is_username_available` months
afterward. This domain doesn't relitigate that specific function — it
demonstrates the identical failure, and its fix, on `low_stock_items`
instead, the real function this session actually has in hand, and
leaves the general lesson to transfer.

**Terms used in this lesson.**

- **manual verification** — checking that a piece of code produces the
  correct output by running it once, by hand, and looking at the
  result. It exists as the default, most obvious way to gain confidence
  code works, and every domain in this curriculum's own "Run It" steps
  have used exactly this, dozens of times, without yet naming it.
- **regression** — a piece of code that used to behave correctly and
  now doesn't, because of some later, usually unrelated change. The term
  exists specifically to distinguish this from a bug that was simply
  never fixed: a regression is a *loss* of previously working behavior,
  which matters here because manual verification, run once and never
  repeated, has no way to detect one.
- **automated test** — a piece of code, itself, that checks another
  piece of code's behavior and reports, automatically, whether it's
  still correct — re-runnable at any time, by anyone, with no need to
  remember what "correct" was supposed to look like. It exists as the
  direct answer to manual verification's own core limitation: automating
  the check makes re-running it as cheap as running it once was.
- **assertion** — a statement that declares something must be true at
  this point in a program, and stops the program immediately, with a
  reported error, if it isn't. It exists as the smallest possible unit
  an automated test can be built from: one specific, checkable claim
  about what a piece of code should have just done.

**Objects and methods used.**

- **`assert`** (this lesson's own subject)
  - *What it is:* a Python statement — not a function, not a method,
    and not an object with any methods of its own; a language-level
    keyword, evaluated directly by the Python interpreter itself.
  - *Implementation:* `assert <expression>` evaluates `<expression>`; if
    it's truthy, execution continues with no output at all; if it's
    falsy, Python immediately raises an `AssertionError` and execution
    stops at that exact line. `assert <expression>, "<message>"` — a
    second, optional form — attaches a custom message to the
    `AssertionError`, printed as part of the error if it fires.
  - *Its use:* this lesson uses it as the one and only building block of
    its own first real test — every check this domain performs, no
    matter how it's eventually organized or run, ultimately reduces to
    one or more of these.
- **`AssertionError`**
  - *What it is:* a built-in Python exception class, automatically
    raised by a failing `assert` statement — not something this lesson's
    own code constructs or raises directly.
  - *Implementation:* an ordinary Python exception, inheriting the same
    general exception machinery this curriculum's own earlier domains
    already covered for error handling; its only distinguishing feature
    is that Python itself, not any library or this project's own code,
    is the one that raises it, exclusively in response to a failed
    `assert`.
  - *Its use:* this lesson lets it propagate uncaught, on purpose, the
    one specific case in this entire curriculum where an uncaught
    traceback is the correct, intended behavior rather than a mistake to
    fix — explained directly in this lesson's own second Concept Unit.

---

## Concept Unit: The Assertion

### The Problem

Every "Run It" step in this curriculum's prior 114 lessons has done the
identical thing: run some code, look at the output, and, if it matched
what was expected, move on. That comparison — "does this output match
what I expected" — has never, in 114 lessons, been written down as code
itself; it's lived entirely in a person's own head, checked once, then
gone. Is there a way to write that comparison down, as real code, so it
can be checked again later without a person re-deriving what "correct"
was supposed to mean?

### Project Change

- **Reference Source.** No reference counterpart — this Concept Unit's
  own throwaway example is deliberately unrelated to `inventory-report/`,
  per the Concept Isolation Rule.
- **Files affected.** None yet — this Concept Unit's own code is
  throwaway, run directly and discarded, not saved into the project.
- **Change type.** N/A.
- **Location.** N/A.
- **Dependencies.** None beyond a working Python interpreter, already
  assumed by every prior domain in this curriculum.

### The New Code

```python
assert 2 + 2 == 4
```

### The Updated Project

Nothing to place this inside — a single, standalone statement, run
directly, covered fully in the Isolating step and the Run It step below.

### Isolating the Concept: A Claim That Can Pass or Fail

Run the smallest possible true assertion, and then the smallest possible
false one, to see both outcomes directly:

```python
assert 2 + 2 == 4
print("first assertion passed silently")
assert 2 + 2 == 5, "math is broken"
```

Running this prints:

```text
first assertion passed silently
Traceback (most recent call last):
  File "<string>", line 4, in <module>
AssertionError: math is broken
```

The first assertion, true, produced no output at all — nothing printed,
execution simply continued to the next line. The second, false,
immediately raised an `AssertionError`, halting execution before
anything after it could run, and the message supplied after the comma —
`"math is broken"` — appears directly in the error itself. This is
called an **assertion**, this lesson's own header term, seen here as
real, running code for the first time. Both lines are discarded now;
neither becomes part of any real project.

### Mechanical Walkthrough

Every distinct element of `assert`, walked through against both forms
shown above:

- **`assert`** — a Python keyword, evaluated by the language itself, not
  a call to any function or method — there is no object anywhere named
  `assert` to inspect or override; it is syntax, the same category as
  `if` or `for`, both already fully established many domains ago.
- **`2 + 2 == 4`** — the expression being asserted: an ordinary Python
  boolean expression, evaluated exactly as it would be anywhere else,
  producing `True` here.
- **The silent success case** — `assert` produces no output and no
  side effect at all when its expression is true; this is deliberate,
  not a limitation — a test suite, this domain's own later lessons show,
  may run thousands of assertions, and printing a confirmation for every
  single passing one would bury the handful that actually need
  attention.
- **`2 + 2 == 5, "math is broken"`** — the second form: the comma
  separates the asserted expression from an optional message, evaluated
  and attached to the raised `AssertionError` only if the assertion
  actually fails; the message is never even evaluated if the assertion
  passes.
- **`AssertionError: math is broken`** — the raised exception's own
  string form, printed as the last line of the traceback: `AssertionError`
  names the exception type; everything after the colon is the custom
  message supplied.

### CS Lens

An assertion is the smallest possible unit of a broader idea, **design
by contract**: stating explicitly, in code, what must be true at a
specific point in a program, rather than only hoping it's true and
finding out indirectly, later, when something downstream breaks in a
confusing way. Also recognized in: a bridge's own load rating, a
number that must hold true for the bridge to be safe, checked directly
by engineers rather than only discovered by watching whether it
collapses; a recipe's own "the internal temperature must reach 165°F"
instruction, an explicit, checkable claim rather than an assumption
about cooking time; and a spreadsheet's own data-validation rule on a
cell, rejecting an entry immediately rather than letting a bad value
silently propagate into every formula that reads it later.

### SE Lens

The alternative — never writing this specific comparison down as code at
all, relying purely on a person remembering to check it — is exactly
manual verification, this lesson's own header term, and it's not a
hypothetical alternative; it's the literal practice this entire
curriculum has used in every "Run It" step so far. The real cost `assert`
removes: once written, this exact check runs identically, correctly,
and instantly, as many times as needed, without depending on anyone's
memory of what "correct" meant. The real cost it doesn't remove: someone
still has to write the assertion once, correctly, in the first place —
`assert` makes a check repeatable; it does nothing to guarantee the
check itself is the right one to have written.

### Commands Needed

None beyond a Python interpreter, already available from every prior
domain in this curriculum.

### Run It

```bash
python3 -c "
assert 2 + 2 == 4
print('first assertion passed silently')
assert 2 + 2 == 5, 'math is broken'
"
```

prints:

```text
first assertion passed silently
Traceback (most recent call last):
  File "<string>", line 4, in <module>
AssertionError: math is broken
```

exactly matching the isolated example above — run here through
`python3 -c`, which reports its own source as `<string>` rather than a
real file path, keeping this specific run's own output identical no
matter whose machine it's run on.

### Connecting Back

`assert` can express one specific, checkable claim, and it fails loudly,
immediately, when that claim doesn't hold. The next Concept Unit puts a
real claim inside it — one about `inventory-report/`'s own
`low_stock_items` — and uses it to catch a real regression this lesson
introduces on purpose.

---

## Concept Unit: A Check That Outlives the Moment It Was Written

### The Problem

`low_stock_items`, as `inventory-report/` currently has it committed,
correctly excludes an item sitting exactly at the threshold — a gadget
count of `5`, checked against a threshold of `5`, is not "low stock,"
because `5` is not less than `5`. A person could confirm this by hand,
right now, the same way every prior domain's "Run It" steps have
confirmed things. Say, sometime later, someone "simplifies" the
function's own comparison — changes `count < threshold` to `count <=
threshold`, a one-character, entirely plausible mistake, easy to make
while refactoring something else nearby, and easy to miss in review
unless a reviewer happens to think specifically about this exact
boundary. Would anything catch it?

### Project Change

- **Reference Source.** No reference counterpart.
- **Files affected.** A new file, `check_low_stock.py`, added to
  `inventory-report/`.
- **Change type.** Add.
- **Location.** Created directly inside `inventory-report/`, alongside
  `inventory_report.py`.
- **Dependencies.** `inventory_report.py`'s own real, committed
  `low_stock_items` function.

### The New Code

```python
assert low_stock_items(inventory, threshold=5) == ["widgets"]
```

### The Updated Project

Placed inside a real, named function — not left as a bare statement the
way this lesson's first Concept Unit used one — so it can be called
again, deliberately, at any later point:

```python
from inventory_report import low_stock_items

def check_low_stock_items():
    inventory = {"widgets": 2, "gadgets": 5, "gizmos": 8}
    result = low_stock_items(inventory, threshold=5)  # ← new
    assert result == ["widgets"]                       # ← new
    print("check_low_stock_items passed")

check_low_stock_items()
```

Wrapping the assertion in a function this specific, named way turns a
single, one-off check into something with a name, `check_low_stock_items`,
that can be called again — by this same file, by a later lesson's own
test runner, or by a person typing its name directly — without retyping
the check itself. The `print` line at the end only ever runs if the
`assert` above it didn't fire, so seeing it is itself a second,
independent confirmation the check passed.

### Isolating the Concept: Skip — Already Anchored to Real Code

Per this schema's own reordering note for lessons written from this
point forward, this Concept Unit's own subject — a named function
wrapping an assertion — has no separate isolated form to demonstrate
before meeting the real project: the previous Concept Unit already
isolated `assert` itself in full, on unrelated throwaway code, and this
Concept Unit's own real value is specifically in applying it to real,
committed project code, not in isolating it a second time on a second
piece of throwaway code that would teach nothing new.

### Mechanical Walkthrough

Every distinct element of `check_low_stock.py`, in order:

- **`from inventory_report import low_stock_items`** — an ordinary
  Python import, already familiar from many prior domains, bringing the
  real, committed function into this new file rather than duplicating
  its logic.
- **`def check_low_stock_items():`** — an ordinary function definition,
  named descriptively for what it checks, following the same
  intention-revealing naming convention this curriculum's own Domain 7
  (Implementation Engineering) already gave full treatment to.
- **`inventory = {"widgets": 2, "gadgets": 5, "gizmos": 8}`** — a
  specific, concrete input, chosen deliberately to include a value sitting
  exactly at the threshold boundary (`gadgets: 5`, checked against
  `threshold=5`) — not a randomly chosen example, but one picked
  specifically because it's exactly the kind of input a `<` versus `<=`
  mistake would expose.
- **`result = low_stock_items(inventory, threshold=5)`** — calling the
  real function under test, storing its return value for the assertion
  below to check, rather than asserting on the call directly — a small
  choice that keeps the following line readable as a comparison, not a
  nested expression.
- **`assert result == ["widgets"]`** — the actual claim: this specific
  input should produce exactly this specific output, a list containing
  only `"widgets"` — `"gadgets"`, sitting exactly at the threshold,
  deliberately must not appear.
- **`print("check_low_stock_items passed")`** — reached only if the
  assertion above it didn't raise; a second, independent, human-readable
  confirmation, useful specifically because this lesson runs this file
  directly rather than through a dedicated test runner, which later
  lessons in this domain introduce.
- **`check_low_stock_items()`** — the actual call, at the bottom of the
  file; without this line, the function would be defined but never
  run, and the whole file would execute successfully while checking
  nothing at all — worth noting explicitly, since a defined-but-uncalled
  check is a real, easy mistake to make and a real, common cause of a
  test that silently checks nothing.

### CS Lens

Wrapping an assertion in a named, callable function is the smallest
possible instance of a **test case**: one specific, isolated, repeatable
scenario, with a concrete input and a concrete expected output, packaged
so it can be executed on demand rather than only once, inline, wherever
it happened to be written. Also recognized in: a pilot's own pre-flight
checklist, the identical set of checks run before every single flight,
not derived fresh from memory each time; a factory's quality-control
station, running the identical measurement on every unit off the line
rather than trusting that the first unit checked out fine so the rest
must too; and a chemistry lab's own control experiment, re-run
identically alongside every new trial specifically so a known, expected
result is always available to compare against.

### SE Lens

The alternative — checking `low_stock_items` by hand, once, and moving
on, exactly as this lesson's own Problem step described — costs nothing
extra up front and nothing at all if the function is never touched
again. Its real cost only appears the moment someone else, possibly
much later, changes code near it: nothing about a hand check performed
once warns that later editor their change broke something a person
already confirmed correct. `check_low_stock_items`, written once, costs
real time to write and real discipline to remember to re-run — a cost
this domain's own later lessons on test runners and continuous
integration exist specifically to reduce toward zero — but, unlike the
hand check, it can be re-run as many times as the code changes,
correctly, without depending on anyone remembering what correct used to
look like.

### Commands Needed

None beyond the Python interpreter already in use.

### Run It

From inside the real `inventory-report/` project, against the actual,
correct, committed code:

```bash
python3 check_low_stock.py
```

prints:

```text
check_low_stock_items passed
```

Now, reproduce the exact regression this Concept Unit's own Problem step
described — changing `count < threshold` to `count <= threshold` inside
`low_stock_items` — and run the identical, unchanged test file again,
with nothing about `check_low_stock.py` itself touched:

```bash
python3 check_low_stock.py
```

prints:

```text
Traceback (most recent call last):
  File "/path/to/inventory-report/check_low_stock.py", line 9, in <module>
    check_low_stock_items()
  File "/path/to/inventory-report/check_low_stock.py", line 6, in check_low_stock_items
    assert result == ["widgets"]
           ^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

and exits with a non-zero status. This traceback is shown in full, on
purpose, rather than caught and printed cleanly — the one deliberate
exception, in this entire curriculum, to the standing "never let an
uncaught traceback appear in lesson text" rule this session's own
handoff notes established for every domain before this one: an
`AssertionError`, allowed to propagate exactly like this, is not a
mistake to hide — it is precisely how a real automated test is supposed
to fail, loud and specific, naming the exact file, line, and expression
that stopped holding true. `/path/to/inventory-report/` stands in for
wherever the real project actually sits on a reader's own machine —
Python's own traceback always prints the *full, real path* to the file
it ran, exactly like Lesson 105's own `git init` confirmation message
already did, not a bare filename; the rest of the traceback — the line
numbers, the failing expression, and `AssertionError` itself — will
match exactly, regardless of whose machine it runs on.

### Connecting Back

The identical file, `check_low_stock.py`, unchanged, produced two
completely different results — a silent pass, then a loud, specific
failure — purely because the code it was checking changed underneath
it. That's the entire argument this lesson opened with, now proven
rather than asserted: a check written once and re-run is categorically
more useful than a check performed once and remembered.

---

## Connect the Pieces

`assert`, this lesson's own first Concept Unit, proved a single claim
can be written as real, executable code, passing silently or failing
loudly with no ambiguity about which happened. `check_low_stock_items`,
the second, wrapped that claim around `inventory-report/`'s own real,
committed `low_stock_items` function, with a specific input chosen
deliberately to sit exactly at the function's own threshold boundary —
and then this lesson broke that function on purpose, with a one-character
change entirely plausible as an honest refactoring mistake, and reran
the identical, unmodified test file. The result: a loud, specific,
immediate failure, naming the exact line and expression that stopped
holding, in place of the silence a hand-checked-once verification would
have offered instead. Lesson 12's own hand check of `is_username_available`,
restated in this lesson's own header, was real Verification — but it was
verification that happened exactly once, in one lesson, and had no way
to notice if any later domain's own changes broke it. This lesson's
own `check_low_stock_items` is the direct, concrete fix: the identical
kind of check, made permanent, made repeatable, and, this lesson's own
"What Breaks Without This" section proves one final time, made to fail
loudly the moment it stops being true.

## What Breaks Without This

Restore `low_stock_items` to its real, correct, committed form — undo
the `<=` regression — and confirm the test passes again, the concrete,
provable fix to the failure this lesson's own Run It step just caused on
purpose:

```bash
python3 check_low_stock.py
```

prints:

```text
check_low_stock_items passed
```

Now cause a different, equally real failure: delete `check_low_stock.py`
itself, and ask what would have happened, in the exact scenario this
lesson opened with, if it had never existed. Reintroduce the identical
`<=` regression one more time:

```bash
python3 -c "
p = 'inventory_report.py'
t = open(p).read()
t = t.replace('if count < threshold:', 'if count <= threshold:')
open(p, 'w').write(t)
"
python3 -c "
from inventory_report import low_stock_items
inventory = {'widgets': 2, 'gadgets': 5, 'gizmos': 8}
print(low_stock_items(inventory, threshold=5))
"
```

prints:

```text
['gadgets', 'widgets']
```

No error. No traceback. No warning of any kind — just a real, silent,
incorrect result, printed as calmly as a correct one would be, exactly
the failure mode this entire lesson exists to argue against: without an
automated check re-run against it, a regression like this one is
completely invisible, indistinguishable from correct behavior, right up
until someone downstream notices the actual consequence — a gadget that
was not, in fact, low on stock, showing up on a restock report it should
never have appeared on. Restore the correct comparison one final time:

```bash
python3 -c "
p = 'inventory_report.py'
t = open(p).read()
t = t.replace('if count <= threshold:', 'if count < threshold:')
open(p, 'w').write(t)
"
```

## Exercises

1. Write a second `assert`-based check function for `restock_alert`,
   following `check_low_stock_items`'s own structure exactly: a
   descriptive name, a concrete input, a call, and an assertion against
   the expected output. Run it once against the correct code, then
   introduce a plausible one-line regression into `restock_alert` itself
   and confirm your new check catches it.
2. Modify `check_low_stock_items`'s own assertion to use `<` instead of
   `==` — asserting `len(result) < 5`, for instance, instead of an exact
   match. Run it against both the correct code and the `<=` regression
   this lesson used, and explain, in your own words, why this weaker
   assertion fails to catch a regression the original, exact-match
   assertion did.
3. Without looking at this lesson's own text again, write, from memory,
   one sentence explaining why a check run once by hand and the
   identical check written as a re-runnable `assert` are not equally
   valuable, even when they compute the exact same comparison.

## Definition of Done

- [ ] `check_low_stock.py` exists in `inventory-report/`, runs cleanly
      against the real, correct code, and prints its own passing
      confirmation.
- [ ] The `<=` regression has been introduced on purpose, shown to
      produce a real, loud `AssertionError` when `check_low_stock.py` is
      rerun, and then reverted, with the test passing again afterward.
- [ ] The same regression has been shown, separately, to produce no
      error at all when checked only by a one-off manual `print`, not by
      the re-runnable test — the concrete proof this lesson's whole
      argument rests on.
- [ ] You can state, without looking anything up, the difference between
      manual verification and an automated test, in your own words, not
      this lesson's.

```bash
git add -A
git commit -m "add first automated check for low_stock_items and prove it catches a real regression"
```
