# Lesson 126: Fakes

**What you will build.** `load_inventory` (Lesson 121) currently does
two jobs in one function: opening a real file, and parsing and
validating whatever that file contains. This lesson splits it in two —
`parse_inventory(f)`, which does all the real logic and expects only
something it can read text from, and `load_inventory(path)`, now a thin
wrapper that just opens a real file and hands it to `parse_inventory`.
That split makes a new kind of check possible: `check_parse_inventory_
fake.py` hands `parse_inventory` an `io.StringIO` — a real, genuinely
working, in-memory stand-in for a file — instead of a real path on
disk. Nothing about `parse_inventory`'s own code changes, and nothing
about it is replaced or patched; it runs its real `json.load` and its
real validation loop, against a real (if memory-backed) file object.
The transferable problem this lesson names: Lessons 123 through 125 all
substituted a *function* the code under test calls. This lesson's
double substitutes a *file* — genuinely working, not canned, not
recording — closing out this domain's three-part taxonomy of test
doubles: stub, mock, fake.

**What you need to know first.** Lesson 121 (End-to-End Tests) — the
existing, single `load_inventory` function this lesson splits in two.
Lesson 125 (Stubs) — the distinction this lesson sharpens one step
further: a stub replaces logic with a fixed answer; a fake replaces one
real thing (a disk file) with a different real thing (a memory-backed
one) that genuinely does the same job.

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
`parse_inventory`, checked against `io.StringIO('{"widgets": 2,
"gadgets": 5}')` — the same JSON text `inventory.json` has held since
Lesson 121, now delivered through a real, in-memory substitute rather
than a real file on disk.

**Terms used in this lesson.**

- **Fake** — a test double with a genuinely working, if simplified or
  lightweight, implementation of the real thing it stands in for —
  distinct from a stub, which returns a fixed, canned answer with no
  real logic at all, and from a mock, which exists to record and assert
  on calls. Why it needed its own name, closing this domain's own
  three-part taxonomy: `io.StringIO`, used in this lesson, doesn't
  return one fixed value the way Lesson 125's stubs did — it really
  implements reading text, just backed by memory instead of a disk.
- **File-like object** — any object usable anywhere Python code expects
  "something to read text from," because it implements the same real
  methods a genuine open file does (`.read()`, iterating line by line),
  not because it shares some special declared type with one. Why it
  matters here: it's exactly what makes `io.StringIO` usable everywhere
  `open()`'s own return value already is, including inside
  `parse_inventory`, completely unchanged.

**Objects and methods used.**

- **`io.StringIO`**
  - *What it is:* a class from Python's standard library `io` module.
  - *Implementation:* `io.StringIO(text)` creates a real, in-memory
    object that behaves like an opened text file — it supports the same
    real reading operations a genuine file object does, including the
    ones `json.load` itself calls internally — except its contents live
    in memory, initialized directly from `text`, rather than being read
    from a real file on disk.
  - *Its use:* stands in for the real, on-disk `inventory.json` inside
    this lesson's new checks, letting `parse_inventory`'s real logic run
    against chosen, in-memory JSON text without creating a single real
    file.

---

## Concept Unit: Fakes — A Real, Working Substitute for a Real Dependency

### The Problem

`parse_inventory`'s own real logic — call `json.load`, then check every
count is a non-negative `int` — has been tested three ways so far:
against a real file with good data (Lesson 121), a real file with bad
data (Lesson 121), and two real files sitting exactly on the
zero/negative boundary (Lesson 122). Every one of those checks needed a
real file, sitting on the real filesystem, created ahead of time. Is
there a way to test `parse_inventory`'s own real parsing and validation
logic — the actual thing worth checking — without needing a real file
on disk for every single scenario?

### Introduce the Concept in Isolation

A small, throwaway, unrelated function — never part of `inventory-
report` — makes the real mechanism concrete:

```python
import io

def count_lines(f):
    return len(f.readlines())

fake_file = io.StringIO("line one\nline two\nline three\n")
print(count_lines(fake_file))
print(type(fake_file))
```

Run directly, the real output is:

```text
$ python3 fake_lab.py
3
<class '_io.StringIO'>
```

`count_lines`'s own code, `f.readlines()`, is never touched or patched —
it's the exact same code that would run against a real, opened file.
`fake_file` is a real `io.StringIO` object, not a plain string and not
a function returning a canned number — `type(fake_file)` confirms it's
its own genuine class, `_io.StringIO`. It genuinely implements
`.readlines()`, the same real method a real file object has, and
`count_lines` genuinely calls it and genuinely counts the real result.
Nothing here is canned; `count_lines(fake_file)` really computes `3`
by really reading the fake file's real, in-memory content. This is
called a **fake**: not a stand-in for `count_lines` itself, but a real,
working stand-in for the *file* `count_lines` reads from.

### Discard the Throwaway Example

`count_lines` and `fake_file` are not part of `inventory-report` and
will not appear in it. What survives is the mechanism: `io.StringIO`
genuinely behaves like a file, so any code written to accept "something
file-like" can be tested against it directly, with no disk involved at
all.

### Project Change

- **Reference Source.** No reference counterpart — this lesson splits
  Lesson 121's own `load_inventory` in two, specifically to make this
  kind of check possible.
- **Files affected.** `inventory_cli.py`, modified — `load_inventory`
  split into `parse_inventory` and a thinner `load_inventory`.
  `check_parse_inventory_fake.py`, created.
- **Change type.** Refactor, then add.
- **Location.** The split happens where `load_inventory` currently
  stands, in `inventory_cli.py`.
- **Dependencies.** Python's standard library `io` module — no new
  package.

### The New Code

```python
def parse_inventory(f):
    inventory = json.load(f)
    for name, count in inventory.items():
        if not isinstance(count, int):
            raise ValueError("inventory count for " + name + " is not a number: " + repr(count))
        if count < 0:
            raise ValueError("inventory count for " + name + " cannot be negative: " + repr(count))
    return inventory
```

### The Updated Project

`inventory_cli.py`, in full, with the split marked — `load_inventory`'s
own real logic moved into the new `parse_inventory`, `load_inventory`
itself reduced to opening a real file and delegating:

```python
import sys
import json
from inventory_report import low_stock_items

def parse_inventory(f):                                                          # ← new
    inventory = json.load(f)                                                     # ← new
    for name, count in inventory.items():                                        # ← new
        if not isinstance(count, int):                                           # ← new
            raise ValueError("inventory count for " + name + " is not a number: " + repr(count))  # ← new
        if count < 0:                                                            # ← new
            raise ValueError("inventory count for " + name + " cannot be negative: " + repr(count))  # ← new
    return inventory                                                             # ← new

def load_inventory(path):                                                        # ← changed
    with open(path) as f:                                                        # ← changed
        return parse_inventory(f)                                                # ← changed

def main():
    inventory = load_inventory(sys.argv[1])
    threshold = int(sys.argv[2])
    for name in low_stock_items(inventory, threshold):
        print(name)

if __name__ == "__main__":
    main()
```

### Mechanical Walkthrough

- **`def parse_inventory(f):`** — a new function, taking `f` — anything
  file-like, not specifically a path — as its one parameter. Every line
  inside it is unchanged from Lesson 122's own `load_inventory`, moved
  here as-is: `json.load(f)`, the validation loop, `isinstance`, the two
  `raise ValueError` calls, all given full treatment already in Lessons
  121 and 122.
- **`def load_inventory(path):`** — the same name as before, now much
  smaller: it still takes a file *path*, a string, exactly as every
  caller of it already expects.
- **`with open(path) as f:`** — unchanged from Lesson 121: opens a real
  file, guaranteed to be closed afterward.
- **`return parse_inventory(f)`** — the one new line doing real work
  here: hands the real, open file object to `parse_inventory`, and
  returns whatever it returns. `main` itself, and every other caller of
  `load_inventory`, needs no change at all — `load_inventory(path)`
  still takes a path and still returns a validated inventory dictionary,
  exactly as it always has.

### CS Lens

```text
Also recognized in: a database's own in-memory test mode, offered by
several real database systems specifically so application code can be
tested against a real, working database engine without needing a real,
persistent server running anywhere, a flight simulator's real physics
engine, genuinely computing lift and drag in real time rather than
looking up a canned, pre-recorded flight path, an in-memory
implementation of a real caching interface, used in tests specifically
because it behaves exactly like the real cache for reading and writing,
just without a real network round-trip to a real cache server
```

### SE Lens

The alternative — every check written before this lesson — uses a real
file on disk, created ahead of time. That alternative is not wrong; it's
still the right choice for Lesson 121's own end-to-end tests
specifically, which exist to prove the real filesystem boundary itself
works, file and all. What a fake buys instead: `parse_inventory`'s own
logic can now be checked directly, with a chosen scenario expressed as a
one-line string, with no file to create, name, and later clean up. The
real cost this lesson paid to make that possible: `load_inventory` had
to be split in two, a real, deliberate design change to the code being
tested, made specifically because the original, single function
couldn't be tested this way at all — there was no way to hand
`json.load(f)`, buried inside a function that also called `open(path)`
itself, anything other than a real path. This is the same underlying
idea Domain 7's `pricing.py` split embodied: separating real logic from
the real, external side effect (there, side-effecting recordkeeping;
here, real file I/O) that makes the logic harder to test in isolation.
The honest limit: a fake is only as trustworthy as how faithfully it
actually behaves like the real thing. `io.StringIO` genuinely
implements the same reading interface `json.load` needs — that's not
assumed here, it's exactly what this lesson's own isolated lab already
proved by using it directly, the same discipline every test double in
this domain has required.

### Commands Needed

No new command — `python3 check_parse_inventory_fake.py`, the same
invocation every check file in this project already uses.

### Run It

`check_parse_inventory_fake.py`, in full:

```python
import io
from inventory_cli import parse_inventory

def check_parse_inventory_with_fake_file():
    fake_file = io.StringIO('{"widgets": 2, "gadgets": 5}')
    inventory = parse_inventory(fake_file)
    assert inventory == {"widgets": 2, "gadgets": 5}
    print("check_parse_inventory_with_fake_file passed")

def check_parse_inventory_fake_rejects_negative():
    fake_file = io.StringIO('{"widgets": -1}')
    try:
        parse_inventory(fake_file)
        assert False, "expected ValueError, none was raised"
    except ValueError:
        print("check_parse_inventory_fake_rejects_negative passed")

check_parse_inventory_with_fake_file()
check_parse_inventory_fake_rejects_negative()
```

Run for real:

```text
$ python3 check_parse_inventory_fake.py
check_parse_inventory_with_fake_file passed
check_parse_inventory_fake_rejects_negative passed
```

Both scenarios — good data, and the exact same negative-count boundary
Lesson 122 tested with a real file — proven here with two lines of
in-memory JSON text and zero real files. Confirming the real,
already-existing checks still work, since `load_inventory` itself, from
the outside, hasn't changed its own behavior at all:

```text
$ python3 inventory_cli.py inventory.json 5
widgets
$ python3 check_inventory_cli.py
check_inventory_cli passed
$ python3 check_inventory_end_to_end.py
check_inventory_end_to_end_rejects_bad_data passed
$ python3 check_load_inventory_boundaries.py
check_load_inventory_accepts_zero_count passed
check_load_inventory_rejects_negative_count passed
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
$ python3 -m mypy inventory_report.py
Success: no issues found in 1 source file
```

### Connecting Back

The isolated `count_lines`/`io.StringIO` example proved a fake can
supply a real, working substitute for a real dependency, letting the
code under test run completely unmodified against it.
`check_parse_inventory_fake.py` proved the identical mechanism against
real project code — made possible only because `load_inventory` was
first split so its own real logic could be reached without a real file
standing in the way.

---

## Connect the Pieces

One in-memory JSON string, `'{"widgets": 2, "gadgets": 5}'`, moving
through every piece this lesson built, start to finish:

1. `load_inventory`'s real logic is extracted into a new function,
   `parse_inventory(f)`, taking anything file-like rather than a path.
2. `load_inventory(path)` itself shrinks to opening a real file and
   delegating to `parse_inventory` — its own external behavior
   completely unchanged.
3. `io.StringIO('{"widgets": 2, "gadgets": 5}')` creates a real,
   in-memory, file-like object holding that exact text.
4. `parse_inventory(fake_file)` runs its real `json.load` and real
   validation loop against it, returning `{"widgets": 2, "gadgets":
   5}` — proven correct with no real file ever created.
5. A second fake, `io.StringIO('{"widgets": -1}')`, proves
   `parse_inventory` still rejects a negative count the same way
   Lesson 122's real file did.
6. The rest of the project's suite, rerun in full, confirms the split
   didn't change `load_inventory`'s own real, external behavior at all.

## What Breaks Without This

Without splitting `parse_inventory` out on its own, every scenario
worth testing about JSON parsing and count validation needs a real file
on disk, created ahead of time, named, and kept around — exactly what
Lessons 121 and 122 both did, and there was nothing wrong with either
one. Restated plainly: the limitation isn't that real-file checks are
invalid — Lesson 121's own end-to-end test still needs to be exactly
that, a real file, to prove the real filesystem boundary works at all.
The limitation is that *every* scenario being forced through a real file
makes each new scenario more expensive than it needs to be, for logic
that has nothing to do with the filesystem in the first place. Without
a fake, and without first separating the logic from the file-opening
that made a fake usable at all, that cost never goes away.

## Exercises

1. Write a third scenario for `check_parse_inventory_fake.py`: a fake
   file holding JSON with a count written as a string, the same
   mistake Lesson 121's own `inventory_bad.json` modeled, and confirm
   `parse_inventory` rejects it the same way.
2. `io.StringIO` can also be *written* to, not just read from — research
   its `.write()` method, and use it to build up a fake file's content
   across several calls, rather than passing the whole string to
   `io.StringIO(...)` all at once.
3. Not every real dependency can be faked as easily as a file. Discuss,
   without necessarily writing code: what would a fake for the real
   command-line `subprocess.run` call Lesson 120's `check_inventory_
   cli.py` uses actually need to do, to genuinely behave like launching
   a real process without launching one — and whether that's still
   simpler than Lesson 120's own real, working approach.

## Definition of Done

- [ ] `parse_inventory(f)` exists, containing all of `load_inventory`'s
      former validation logic, accepting any file-like object.
- [ ] `load_inventory(path)` still exists, now only opening a real file
      and delegating to `parse_inventory`.
- [ ] `check_parse_inventory_fake.py` exists, using `io.StringIO` for
      both a good-data and a negative-count scenario.
- [ ] `python3 inventory_cli.py inventory.json 5` still prints exactly
      `widgets`.
- [ ] Every other check file in the project still passes unchanged.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `split parse_inventory out of load_inventory so its own logic
      can be tested against a real, in-memory fake file instead of a
      real one on disk` — not `refactor load_inventory`.

Next: Lesson 127 — Contract Tests.
