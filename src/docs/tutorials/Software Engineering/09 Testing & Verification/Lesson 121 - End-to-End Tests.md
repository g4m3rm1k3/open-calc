# Lesson 121: End-to-End Tests

**What you will build.** `inventory_cli.py` is changed to read its
inventory from a real file on disk, `inventory.json`, instead of a
hardcoded Python dictionary baked into the program itself — the first
time anything in `inventory-report` has touched the real filesystem at
all. Lesson 120's own system test already proved the program's
command-line boundary works, using that same hardcoded, always-clean
dictionary; it never once touched a real file. This lesson writes a
real one, then simulates the most ordinary real-world mistake there is
— a person hand-editing that file and accidentally leaving a number in
quotes — and proves, with a real run, that the exact same, already
system-tested program crashes on it. The transferable problem: a system
test proves the assembled program's own code works. It says nothing
about what happens once that program meets the actual, uncontrolled
world it's going to run in — real files, real data, real mistakes —
because a system test's own inputs are still just as clean and
controlled as a unit test's. That's a different claim, and it needs a
different, final kind of test.

**What you need to know first.** Lesson 120 (System Tests) —
specifically `inventory_cli.py`'s existing shape, its `main` function,
and `check_inventory_cli.py`'s use of `subprocess.run` to launch it as
a real process, both extended without being rebuilt here. This lesson
also reuses `low_stock_items`, unchanged since Lesson 117.

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

Still **Verification**, completing the same **Integration** widening
Lessons 119 and 120 both extended: Lesson 119 combined two functions in
one process; Lesson 120 combined the whole assembled program behind its
real command-line boundary; this lesson combines the assembled program
with the actual, real, external thing it depends on in its real
environment — a file on disk — closing the gap between "the program
works" and "the program works against the real world it's going to run
in." Concrete value carried forward: `python3 inventory_cli.py
inventory.json 5`, now reading real, on-disk data rather than a value
written directly into the program's own source.

**Terms used in this lesson.**

- **End-to-end test** — a test that exercises the complete, real
  workflow a real user or caller would actually go through, including
  the real external things the system depends on in its real
  environment — not just the assembled program's own code. Why it's
  distinct from a system test: Lesson 120's system test already ran the
  real, assembled `inventory_cli.py` as a real process — but it still
  fed that process a clean, hardcoded Python dictionary. Nothing about
  a real file, subject to real editing mistakes, was ever part of it.
- **Context manager** — an object that defines what should happen right
  before a block of code starts and right after it ends, guaranteed to
  run even if the block raises an exception partway through. Why it
  exists: without one, a program that opens a file and then crashes
  before explicitly closing it again leaves that file open — a real,
  observable resource leak, not just an untidy habit.
- **JSON (JavaScript Object Notation)** — a real, standard, plain-text
  format for representing structured data (objects, lists, numbers,
  strings) as human-readable text, usable by nearly any programming
  language, not just JavaScript despite the name. Why it matters here:
  it's the concrete, real shape `inventory.json` is written in — an
  ordinary text file a person can open and hand-edit, which is
  precisely what makes this lesson's own bug realistic.

**Objects and methods used.**

- **`open()`**
  - *What it is:* a built-in Python function that opens a real file on
    the filesystem and returns an object representing it.
  - *Implementation:* `open(path)` takes a file path as a string and
    returns a file object, ready to be read from (by default). It does
    real work outside the Python process itself — asking the operating
    system for access to a real file — which is why it can fail for
    reasons no earlier function in this project ever could (the file
    doesn't exist, or the program lacks permission to read it).
  - *Its use:* the very first line of contact between this lesson's new
    code and the real filesystem.
- **`with` statement**
  - *What it is:* not a function or method — a real Python language
    construct, given its own header entry here (rather than under Terms
    used) because it's used together with `open()` at a specific,
    concrete call site worth showing directly, per this lesson's own
    "Objects and methods used, not extended" rule.
  - *Implementation:* `with open(path) as f:` opens the file, binds the
    resulting file object to `f` for the indented block that follows,
    and guarantees the file gets closed automatically once that block
    ends — whether it finished normally or raised an exception partway
    through. `open()`'s own return value is exactly what makes this
    possible: a file object is a real **context manager**, meaning it
    defines both "what to do when entering a `with` block" (here,
    nothing extra — the file is already open) and "what to do when
    leaving one" (close the file), and `with` is the syntax that invokes
    both automatically.
  - *Its use:* every file this lesson's code opens is opened this way,
    so a crash while reading `inventory.json` — exactly what this
    lesson's own bug produces — still leaves the file properly closed.
- **`json.load()`**
  - *What it is:* a function from Python's standard library `json`
    module.
  - *Implementation:* `json.load(f)` takes an already-open file object
    (exactly what `with open(path) as f:` provides) and parses its
    entire contents as JSON text, returning the equivalent Python data
    — a JSON object like `{"widgets": 2}` becomes a Python `dict` with
    the same keys and values.
  - *Its use:* the one call that turns `inventory.json`'s real, on-disk
    text into the same kind of `dict` every function in this project has
    already been built to accept.
- **`isinstance()`**
  - *What it is:* a built-in Python function for checking an object's
    type.
  - *Implementation:* `isinstance(value, int)` returns `True` if `value`
    is really an `int`, `False` otherwise.
  - *Its use:* this lesson's own validation step calls it once per
    inventory count, to catch exactly the kind of real-world mistake
    this lesson is built around — a number that arrived as text instead.

---

## Concept Unit: End-to-End Tests — Exercising the Real, External World

### The Problem

`inventory_cli.py`'s inventory is still `{"widgets": 2, "gadgets": 5,
"gizmos": 8}`, written directly into the program's own source code.
Lesson 120's system test already proved the whole assembled program,
run as a real process, correctly turns that dictionary into the right
printed output. But no real inventory system keeps its data inside the
program's own source file — a real one lives somewhere the program has
to go get it from: a file, typically, maintained and occasionally
hand-edited by a real person. Once that file is real, it can be wrong
in ways a Python literal, written once by a careful programmer and
never touched again, simply cannot be.

### Introduce the Concept in Isolation

A small, throwaway, unrelated file and script — never part of
`inventory-report` — make the real mechanism concrete:

```json
{"alice": 90, "bob": 85}
```

A separate script reads that real file back in:

```python
import json

with open("scores.json") as f:
    scores = json.load(f)

print(scores)
print(type(scores))
```

Run directly, with `scores.json` sitting on disk next to it:

```text
$ python3 read_scores.py
{'alice': 90, 'bob': 85}
<class 'dict'>
```

`scores.json` is a real, plain-text file — nothing about it is Python
code at all. `with open("scores.json") as f:` opens it and guarantees
it will be closed again once the block underneath finishes, whatever
happens inside that block. `json.load(f)` reads that open file's real
contents and turns them into an ordinary Python `dict`, indistinguishable
from one written directly in source code — `type(scores)` confirms it's
a real `<class 'dict'>`, not some special "loaded from a file" type.

### Discard the Throwaway Example

`scores.json` and `read_scores.py` are not part of `inventory-report`
and will not appear in it. What survives is the mechanism: a real file's
text becomes a real Python value, through `open()` and `json.load()`
together, with `with` guaranteeing the file is properly closed no matter
how the block underneath it ends.

### Project Change

- **Reference Source.** No reference counterpart — reading a real
  inventory file is a from-scratch capability, replacing
  `inventory_cli.py`'s previously hardcoded dictionary.
- **Files affected.** `inventory_cli.py`, modified. `inventory.json`,
  created — the project's first real data file.
  `check_inventory_end_to_end.py`, created.
- **Change type.** Add (a new function, `load_inventory`) and refactor
  (`main`, to call it instead of using a literal dictionary).
- **Location.** `load_inventory` is added above `main`, inside
  `inventory_cli.py`; `main` itself changes to call it.
- **Dependencies.** Python's standard library `json` module — no new
  package to install, unlike `mypy` in Lesson 116.

### The New Code

```python
def load_inventory(path):
    with open(path) as f:
        inventory = json.load(f)
    for name, count in inventory.items():
        if not isinstance(count, int):
            raise ValueError("inventory count for " + name + " is not a number: " + repr(count))
    return inventory
```

### The Updated Project

`inventory_cli.py`, in full, with the new function and the changed
`main` marked:

```python
import sys
import json                                                                     # ← new
from inventory_report import low_stock_items

def load_inventory(path):                                                       # ← new
    with open(path) as f:                                                       # ← new
        inventory = json.load(f)                                                # ← new
    for name, count in inventory.items():                                       # ← new
        if not isinstance(count, int):                                          # ← new
            raise ValueError("inventory count for " + name + " is not a number: " + repr(count))  # ← new
    return inventory                                                            # ← new

def main():
    inventory = load_inventory(sys.argv[1])                                     # ← changed
    threshold = int(sys.argv[2])                                                # ← changed
    for name in low_stock_items(inventory, threshold):
        print(name)

if __name__ == "__main__":
    main()
```

`main`'s own shape is otherwise unchanged from Lesson 120 — it still
calls `low_stock_items` and prints each qualifying name — but it now
takes *two* command-line arguments instead of one: a file path first,
then the threshold, matching the real order a caller would naturally
think in ("here's my data, here's my threshold").

### Mechanical Walkthrough

- **`import json`** — imports Python's standard library `json` module,
  making `json.load` (full treatment in the Header's Objects and
  methods section above) available.
- **`def load_inventory(path):`** — a new function definition, taking a
  file path as its one parameter.
- **`with open(path) as f:`** — opens the real file at `path` (full
  treatment of both `open()` and `with` in the Header above) and binds
  the resulting file object to `f` for the indented block beneath it.
- **`inventory = json.load(f)`** — parses `f`'s real contents as JSON
  and binds the resulting Python value to `inventory`. This line is
  still inside the `with` block, so the file stays open while this
  runs, and gets closed automatically the moment this block ends.
- **`for name, count in inventory.items():`** — the same iteration
  pattern used throughout this project, here walking the freshly loaded
  data to check it before trusting it.
- **`if not isinstance(count, int):`** — calls `isinstance()` (full
  treatment above) to check whether `count` is really a Python `int`.
  `not` inverts it: this branch runs specifically when `count` is
  *not* an `int` — exactly the case a hand-edited file with a quoted
  number produces, since JSON's own `"5"` parses as a Python `str`, not
  an `int`.
- **`raise ValueError("inventory count for " + name + " is not a number: " + repr(count))`**
  — raises a real exception, with a message built the same way this
  project has built every other message so far: plain string
  concatenation, including `repr(count)` specifically so the message
  shows *what kind* of wrong value was actually found (`repr('5')`
  prints as `'5'`, with the quotes visible, making the string-versus-
  number confusion immediately legible in the error itself).
- **`return inventory`** — reached only if every count passed the
  check above; hands the validated dictionary back to the caller.
- **`inventory = load_inventory(sys.argv[1])`** — `main`'s own first
  line, changed: `sys.argv[1]` is now the file path, not the threshold.
- **`threshold = int(sys.argv[2])`** — `sys.argv[2]` is now the
  threshold, at the position `sys.argv[1]` used to hold in Lesson 120.

### CS Lens

```text
Also recognized in: a payroll system that passes every internal test
with clean, synthetic employee records but has never once been run
against a real, messy export from the actual HR database it's meant to
read, a mobile app that works perfectly in every automated test run
against a fast, reliable test server but has never been tried on a
real, slow, occasionally-dropping cellular connection, a piece of
manufacturing software validated entirely against a simulated
production line that has never touched the real, physical sensors and
actuators it's ultimately meant to control
```

### SE Lens

The alternative is what Lesson 120's own system test already does:
exercise the whole, real, assembled program, but still feed it
controlled, clean, guaranteed-well-formed data. That alternative isn't
wrong — it's a genuinely useful, genuinely different kind of evidence
than an integration test, exactly as Lesson 120 argued. What it cannot
do, proven for real by this lesson's own bug: say anything at all about
the actual, external things the program depends on in its real
environment, because a hardcoded dictionary can never be wrong the way
a real file, maintained by a real person, actually can be. The real
cost an end-to-end test adds, beyond what a system test already costs:
it needs a real fixture — an actual file, in this case — that has to be
created, maintained, and kept in sync with whatever the code expects,
and it's testing the *edges* of the system as much as its logic: file
formats, real data quality, the actual, sometimes messy conditions code
meets once it leaves a controlled test environment. This lesson's own
validation step is a direct response to that cost: rather than letting
bad data crash somewhere deep inside `low_stock_items` with a confusing
`TypeError`, `load_inventory` catches it at the real boundary where the
real world actually enters the program, and reports it in a way that
names exactly which value was wrong and why.

### Commands Needed

No new command — `inventory_cli.py` is still run the same way, now with
one extra argument: `python3 inventory_cli.py inventory.json 5`.

### Run It

First, `inventory.json`, a real file, written with good, clean data:

```json
{
    "widgets": 2,
    "gadgets": 5,
    "gizmos": 8
}
```

Run for real, reading that real file:

```text
$ python3 inventory_cli.py inventory.json 5
widgets
```

`check_inventory_cli.py`, Lesson 120's own check, updated for the new,
two-argument interface:

```python
import subprocess

def check_inventory_cli():
    result = subprocess.run(
        ["python3", "inventory_cli.py", "inventory.json", "5"],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0
    assert result.stdout == "widgets\n"
    print("check_inventory_cli passed")

check_inventory_cli()
```

Run against the real, good file:

```text
$ python3 check_inventory_cli.py
check_inventory_cli passed
```

Now, a second real file, `inventory_bad.json`, written the way a real
person actually might — by hand, quickly, making the single most
ordinary mistake there is when editing a JSON file: quoting a number
that shouldn't be quoted.

```json
{
    "widgets": 2,
    "gadgets": "5",
    "gizmos": 8
}
```

Run directly, against this real, slightly wrong file:

```text
$ python3 inventory_cli.py inventory_bad.json 5
Traceback (most recent call last):
  File "/path/to/inventory-report/inventory_cli.py", line 20, in <module>
    main()
  File "/path/to/inventory-report/inventory_cli.py", line 13, in main
    inventory = load_inventory(sys.argv[1])
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/path/to/inventory-report/inventory_cli.py", line 9, in load_inventory
    raise ValueError("inventory count for " + name + " is not a number: " + repr(count))
ValueError: inventory count for gadgets is not a number: '5'
```

A real, clear, immediate failure — naming exactly which item's count is
wrong, and exactly what the actual bad value looks like. This is the
new **end-to-end test**, `check_inventory_end_to_end.py`, proving that
exact behavior is real and repeatable, not a one-time manual discovery:

```python
import subprocess

def check_inventory_end_to_end_rejects_bad_data():
    result = subprocess.run(
        ["python3", "inventory_cli.py", "inventory_bad.json", "5"],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 1
    assert result.stdout == ""
    assert "gadgets" in result.stderr
    print("check_inventory_end_to_end_rejects_bad_data passed")

check_inventory_end_to_end_rejects_bad_data()
```

Run against the real, hand-mistaken file:

```text
$ python3 check_inventory_end_to_end.py
check_inventory_end_to_end_rejects_bad_data passed
```

And the rest of the project's suite, confirmed undisturbed — nothing
about validating real file data touched `low_stock_items`,
`reorder_suggestion`, or any of the functions those checks already
cover:

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
$ python3 -m mypy inventory_report.py
Success: no issues found in 1 source file
```

### Connecting Back

The isolated `scores.json`/`read_scores.py` example proved a real file's
text becomes a real Python value through `open()` and `json.load()`
together. `inventory_cli.py`'s own `load_inventory` proved the identical
mechanism, now guarding the real boundary where `inventory-report` meets
the actual, external world it depends on — and, unlike Lesson 120's
system test, this lesson's own check exercises a real file capable of
being wrong in a way no hardcoded Python literal ever could be.

---

## Connect the Pieces

Two real files, `inventory.json` and `inventory_bad.json`, moving
through every piece this lesson built, start to finish:

1. `inventory_cli.py`'s hardcoded dictionary is replaced with
   `load_inventory`, which opens a real file, parses it as JSON, and
   validates every count is really an `int`.
2. `inventory.json`, written with clean, correct data, is read for
   real: `python3 inventory_cli.py inventory.json 5` prints `widgets`,
   exactly as before.
3. `check_inventory_cli.py` is updated for the new, two-argument
   interface, and passes.
4. `inventory_bad.json`, written the way a real person might actually
   make a mistake — a quoted number — is read for real:
   `python3 inventory_cli.py inventory_bad.json 5` crashes with a
   real, clear `ValueError` naming `gadgets` specifically.
5. `check_inventory_end_to_end.py` proves that exact failure is real
   and repeatable — the correct, intended response to bad real-world
   data, not an accident.
6. The rest of the project's suite, rerun in full, confirms nothing
   about validating real file data disturbed any of the pure-function
   logic those checks already cover.

## What Breaks Without This

This lesson's own investigation already showed it directly: Lesson
120's system test, thorough as it was, used a hardcoded dictionary that
could never be wrong the way `inventory_bad.json` actually is. Restated
plainly: a system test proves the assembled program's own code — its
argument parsing, its wiring between functions — works correctly. It
says nothing about what happens once real, external data, maintained by
a real person, actually reaches that program, because a system test's
own fixtures are still just as clean and controlled as a unit test's.
Without a test that goes through a real file — not a Python literal
standing in for one — the exact mistake a real person makes while
hand-editing `inventory.json` someday has no check that could ever have
caught it in advance.

## Exercises

1. Create a third real file, `inventory_missing_field.json`, with one
   item's count left out of the JSON entirely rather than
   miswritten, and run `inventory_cli.py` against it directly. Decide
   whether the current code's behavior for that case is acceptable, or
   whether `load_inventory` needs another explicit check.
2. `load_inventory` currently raises `ValueError` if `open(path)` itself
   fails — try running `python3 inventory_cli.py does_not_exist.json 5`
   and read the real exception Python raises on its own. Decide whether
   that default behavior is clear enough for a real user, or whether it
   deserves the same kind of explicit, named handling this lesson gave
   bad count values.
3. Write a second bad-data file where *every* count is a string, not
   just one, and extend `check_inventory_end_to_end.py` with a check
   proving `load_inventory` still reports only the *first* bad value it
   finds, not all of them — then decide, in a comment, whether that's
   the right behavior for a real user trying to fix their own file.

## Definition of Done

- [ ] `inventory_cli.py` loads its inventory from a real file via
      `load_inventory`, validating every count is an `int` before use.
- [ ] `inventory.json` exists with clean, correct data; `python3
      inventory_cli.py inventory.json 5` prints exactly `widgets`.
- [ ] `inventory_bad.json` exists with one count written as a quoted
      string; running the CLI against it raises a `ValueError` naming
      the specific bad field.
- [ ] `check_inventory_cli.py` is updated for the two-argument CLI and
      passes; `check_inventory_end_to_end.py` exists and passes.
- [ ] Every other check file in the project still passes unchanged.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `read inventory from a real file; validate counts so a
      hand-edited data mistake fails loudly instead of crashing deep
      inside low_stock_items` — not `add file loading`.

Next: Lesson 122 — Test Boundaries.
