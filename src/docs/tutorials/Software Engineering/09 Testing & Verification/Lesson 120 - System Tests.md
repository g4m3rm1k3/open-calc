# Lesson 120: System Tests

**What you will build.** `inventory_cli.py` — `inventory-report`'s
first real, external interface: a standalone program, run from a
terminal as `python3 inventory_cli.py 5`, rather than a function
imported into another Python file. Every check written across Lessons
115–119 reaches `inventory-report`'s code the same way: a Python
`import`, calling a function directly, inside the same process the
check itself is running in. None of them ever go through a real command
line at all. This lesson's first version of `inventory_cli.py` ships
with a real bug in exactly that boundary — forgetting to convert its
one command-line argument from text to a number — and every single
existing check in the project keeps passing, untouched, because none of
them were ever capable of reaching it. Only a new kind of check, one
that launches the assembled program as a genuinely separate process the
way an actual user actually would, catches it. The transferable
problem: an integration test (Lesson 119) proves real pieces cooperate
correctly when called together *in Python* — it still never touches the
actual, external interface a real user meets. That's a different
boundary, and it needs its own kind of test.

**What you need to know first.** Lesson 118 (Unit Tests) and Lesson 119
(Integration Tests) — specifically the distinction Lesson 119 already
drew between testing one piece alone and testing real pieces wired
together, which this lesson widens one step further. This lesson also
reuses `low_stock_items` from `inventory_report.py`, unchanged since
Lesson 117.

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

Still **Verification**, and this lesson deepens the **Integration**
placement Lesson 119 first made: where Lesson 119 combined two internal
functions inside one Python process, this lesson combines the *entire*
assembled program — every function it depends on, plus the real
command-line boundary in front of all of them — and runs it as its own,
separate process, the same way it would actually be integrated into a
real user's terminal or an automated pipeline. Concrete value carried
forward: `python3 inventory_cli.py 5`, invoked for real, from outside,
rather than any function called directly from inside another Python
file.

**Terms used in this lesson.**

- **System test** — a test that exercises a program as a whole, through
  the real, external interface an actual caller would use, rather than
  by importing and calling its internal pieces directly. Why it's
  distinct from an integration test: Lesson 119's own check still called
  `build_reorder_report` with a Python `import`, inside the same
  process — the exact command-line text a real user would type never
  entered the picture at all.
- **Process** — a running instance of a program, with its own memory
  and its own Python interpreter, entirely separate from whatever
  process launched it. Why it matters here: launching `inventory_cli.py`
  as a real, separate process is what makes this a genuinely different,
  stronger kind of evidence than an `import` ever could be — an
  `import` runs the target's code inside the *same* process as the
  test, never exercising the boundary a real, separately launched
  program actually has to cross.
- **Standard output (stdout) and standard error (stderr)** — the two
  separate output channels every process has: normal, intended output
  goes to stdout; error messages and tracebacks go to stderr. Why the
  distinction matters here: `check_inventory_cli`, this lesson's own new
  check, reads both separately, because a correct run and a crashed run
  can be told apart by *which* channel actually received something.
- **Exit code (return code)** — a single integer a process reports when
  it finishes, `0` conventionally meaning success and any nonzero value
  meaning failure. Why it matters here: it's the exact same
  zero-means-success convention `git` and `mypy` (Lesson 116) already
  use, and it's the first thing this lesson's own check inspects to know
  whether `inventory_cli.py` actually worked.

**Objects and methods used.**

- **`subprocess.run()`**
  - *What it is:* a function from Python's standard library `subprocess`
    module, used to launch another program as a real, separate process
    and wait for it to finish.
  - *Implementation:* `subprocess.run(args, capture_output=True,
    text=True)` takes `args` as a list of strings — the program to run,
    followed by its own command-line arguments, exactly as they'd be
    typed in a terminal. `capture_output=True` captures that process's
    stdout and stderr instead of letting them print directly;
    `text=True` decodes them as ordinary Python strings rather than raw
    bytes. It returns a single `CompletedProcess` object once the
    process has fully finished running — this call blocks until then.
    That returned object carries three parts this lesson actually uses:
    `.stdout` (the captured standard output, as a string), `.stderr`
    (the captured standard error, as a string), and `.returncode` (the
    process's real exit code, as an int).
  - *Its use:* this is the one call that turns "run this program the
    way a real user would" into something a check can invoke and
    inspect programmatically — the entire mechanism this lesson's system
    test is built on.
- **`sys.argv`**
  - *What it is:* a real, ordinary Python `list`, part of the standard
    library's `sys` module, automatically populated by the interpreter
    itself whenever a script is run.
  - *Implementation:* a list of strings. `sys.argv[0]` is always the
    script's own filename; `sys.argv[1]`, `sys.argv[2]`, and so on are
    whatever additional arguments were typed after it on the command
    line — always strings, regardless of what they look like, because a
    command line is just text.
  - *Its use:* `inventory_cli.py`'s `main` function reads `sys.argv[1]`
    to get the threshold a real caller typed — and this lesson's entire
    bug is a direct consequence of what "always strings" actually means
    in practice.

---

## Concept Unit: System Tests — Exercising the Assembled Program From Outside

### The Problem

`inventory-report` has never had a real, external interface. Every
check so far calls a function directly, in the same Python process,
using `import`. A real user, though, would never type
`from inventory_report import low_stock_items` — they'd run a program.
Giving `inventory-report` an actual command-line entry point means
writing new code specifically to bridge "text typed at a terminal" into
"arguments a Python function expects" — and that bridging code has never
been exercised by anything at all.

### Introduce the Concept in Isolation

A small, throwaway pair of files — never part of `inventory-report` —
makes the real mechanism concrete. One is a program that will be run as
a real, separate process; the other launches it and inspects what comes
back:

```python
# greet.py
print("hello from a separate process")
```

The second file launches the first one as its own, separate program,
rather than importing it:

```python
# run_greet.py
import subprocess

result = subprocess.run(["python3", "greet.py"], capture_output=True, text=True)
print("stdout:", repr(result.stdout))
print("returncode:", result.returncode)
```

`run_greet.py` never imports `greet.py` — there is no `import greet`
anywhere in it. Run directly:

```text
$ python3 run_greet.py
stdout: 'hello from a separate process\n'
returncode: 0
```

`greet.py` was launched as a genuinely separate program, exactly the
way typing `python3 greet.py` at a terminal would launch it, and its
real printed output was captured back into `result.stdout` — including
the trailing `\n` a real `print()` call actually produces, which is
part of why the string is shown with `repr()` here rather than printed
directly. `result.returncode` is `0`, `greet.py`'s own real, successful
exit code. This is called invoking a program as a real **process** —
distinct from, and a stronger kind of evidence than, importing its code
into the same process a check is already running in.

### Discard the Throwaway Example

`greet.py` and `run_greet.py` are not part of `inventory-report` and
will not appear in it. What survives is the mechanism: `subprocess.run`
launches a real, separate program and hands back its real stdout,
stderr, and exit code, all three inspectable afterward.

### Project Change

- **Reference Source.** No reference counterpart — `inventory_cli.py` is
  `inventory-report`'s first command-line entry point, a from-scratch
  addition.
- **Files affected.** `inventory_cli.py`, created. `check_inventory_
  cli.py`, created.
- **Change type.** Add.
- **Location.** Both are new, top-level files, alongside
  `inventory_report.py` and the project's existing `check_*.py` files.
- **Dependencies.** `inventory_cli.py` imports `low_stock_items` from
  `inventory_report.py`, already present.

### The New Code

```python
import sys
from inventory_report import low_stock_items

def main():
    threshold = sys.argv[1]
    inventory = {"widgets": 2, "gadgets": 5, "gizmos": 8}
    for name in low_stock_items(inventory, threshold):
        print(name)

if __name__ == "__main__":
    main()
```

Read the third line of `main` closely — `threshold = sys.argv[1]` — and
keep reading before assuming it's correct.

### The Updated Project

`inventory_cli.py`, in full — a fresh, freestanding file, so this is
already its complete shape:

```python
import sys
from inventory_report import low_stock_items

def main():
    threshold = sys.argv[1]
    inventory = {"widgets": 2, "gadgets": 5, "gizmos": 8}
    for name in low_stock_items(inventory, threshold):
        print(name)

if __name__ == "__main__":
    main()
```

### Mechanical Walkthrough

- **`import sys`** — imports Python's `sys` standard library module,
  making `sys.argv` (full treatment in the Header's Objects and methods
  section above) available.
- **`from inventory_report import low_stock_items`** — the same import
  pattern every check file already uses, here inside a program instead
  of a check.
- **`def main():`** — a function definition wrapping this program's
  real work. Giving it its own function, rather than writing this logic
  directly at the top level of the file, is what makes the
  `if __name__ == "__main__":` guard below meaningful at all.
- **`threshold = sys.argv[1]`** — reads the first real command-line
  argument (`sys.argv[0]` is always the script's own filename) and
  binds it to `threshold`, exactly as-is. This is the bug: `sys.argv`
  entries are always `str`, never `int`, no matter what characters they
  contain — typing `5` at a terminal produces the two-character string
  `"5"`, not the number `5`, and nothing here converts it.
- **`inventory = {"widgets": 2, "gadgets": 5, "gizmos": 8}`** — the same
  literal sample inventory `check_low_stock.py` already established.
- **`for name in low_stock_items(inventory, threshold):`** — calls the
  real, already-checked `low_stock_items`, given full treatment again
  here per the Repetition Rule: it returns the sorted names of every
  item whose count is strictly below `threshold`. With `threshold` still
  a string, its own internal `count < threshold` comparison is about to
  compare an `int` to a `str` — Python does not allow this at all.
- **`print(name)`** — prints each qualifying name, one per line, to
  standard output — the real, intended output a real user would read.
- **`if __name__ == "__main__":`** — a real Python idiom, not a
  language keyword: `__name__` is a special variable every module
  carries, automatically set by the interpreter to `"__main__"` when a
  file is executed directly, and to the module's own name when it's
  imported by something else instead. This condition is `True` only
  when `inventory_cli.py` is run directly — the way this lesson's own
  `check_inventory_cli.py` is about to run it, via `subprocess.run`, as
  a real, separate process.
- **`main()`** — called only inside that guard, so `main`'s own code
  never runs as a side effect of merely importing this file — a real
  possibility worth guarding against even here, since nothing stops a
  future lesson from wanting to `import inventory_cli` to test `main`
  directly, in-process, as a complement to this lesson's own
  out-of-process system test.

### CS Lens

```text
Also recognized in: a car's finished assembly line test — every
individual part already passed its own inspection, but the car still
gets started and driven for real before it ships, an API's own
integration tests passing internally while its publicly documented
HTTP endpoint has never actually been hit with a real request, a piece
of embedded firmware that passes every unit test on a development
machine but has never been flashed onto and run on the real target
hardware it's actually meant to run on
```

### SE Lens

The alternative is what every check through Lesson 119 already does:
import the function, call it directly, assert on the result. That
alternative is faster to write and faster to run — there's no process
to launch, no text to parse back out of captured output — and it's not
wrong; it's exactly how a unit test and an integration test should both
work. What it structurally cannot do, proven for real by this lesson's
own bug: exercise any code that only exists at the real, external
boundary — argument parsing, output formatting, exit codes — because an
`import` never goes anywhere near that boundary at all. The real cost a
system test adds: it's slower (a whole new process has to start and
finish), and when it fails, it says even less about *where* the fault
is than an integration test does — `check_inventory_cli` failing says
"something in the whole assembled program is wrong," full stop,
continuing the exact fault-localization tradeoff Lessons 118 and 119
already named, now widened one layer further.

### Commands Needed

`inventory_cli.py` itself, run directly, exactly the way a real user
would:

```text
$ python3 inventory_cli.py 5
```

- `python3` — the same interpreter every command in this curriculum has
  already used.
- `inventory_cli.py` — the program to run.
- `5` — this program's own first command-line argument, becoming
  `sys.argv[1]`.

`check_inventory_cli.py` itself needs no new command —
`python3 check_inventory_cli.py`, same as every other check file.

### Run It

`inventory_cli.py`, run directly, with the bug from the New Code step
still in place:

```text
$ python3 inventory_cli.py 5
Traceback (most recent call last):
  File "/path/to/inventory-report/inventory_cli.py", line 11, in <module>
    main()
  File "/path/to/inventory-report/inventory_cli.py", line 7, in main
    for name in low_stock_items(inventory, threshold):
                ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "/path/to/inventory-report/inventory_report.py", line 5, in low_stock_items
    if count < threshold:
       ^^^^^^^^^^^^^^^^^
TypeError: '<' not supported between instances of 'int' and 'str'
```

A real crash, the moment this program is actually run. First, every
existing check in the project, run in full, with this exact bug still
present:

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
```

Every single one still green — not one of them ever calls
`inventory_cli.py`, imports it, or touches `sys.argv` in any way, so
none of them could have caught this even in principle. Now,
`check_inventory_cli.py`, the new system test:

```python
import subprocess

def check_inventory_cli():
    result = subprocess.run(
        ["python3", "inventory_cli.py", "5"],
        capture_output=True,
        text=True,
    )
    print("returncode:", result.returncode)
    print("stdout:", repr(result.stdout))
    print("stderr:", result.stderr.splitlines()[-1] if result.stderr else "")
    assert result.returncode == 0
    assert result.stdout == "widgets\n"
    print("check_inventory_cli passed")

check_inventory_cli()
```

Run against the still-broken CLI:

```text
$ python3 check_inventory_cli.py
returncode: 1
stdout: ''
stderr: TypeError: '<' not supported between instances of 'int' and 'str'
Traceback (most recent call last):
  File "/path/to/inventory-report/check_inventory_cli.py", line 16, in <module>
    check_inventory_cli()
  File "/path/to/inventory-report/check_inventory_cli.py", line 12, in check_inventory_cli
    assert result.returncode == 0
           ^^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

`result.returncode` is `1` — `inventory_cli.py` crashed, exactly as the
direct run above already showed, and `subprocess.run` captured that
crash's real exit code instead of letting it propagate directly.
`result.stdout` is the empty string: nothing ever reached `print(name)`,
because the crash happened first. `result.stderr`'s last line holds the
real error message the crashed subprocess actually printed —
`TypeError: '<' not supported between instances of 'int' and 'str'`,
proving this is the exact same bug the direct run already exposed, now
caught by a check instead of only by a human running the program by
hand. The fix is the one-word conversion the Mechanical Walkthrough
already named:

```python
def main():
    threshold = int(sys.argv[1])
    inventory = {"widgets": 2, "gadgets": 5, "gizmos": 8}
    for name in low_stock_items(inventory, threshold):
        print(name)
```

`inventory_cli.py`, run directly, after the fix:

```text
$ python3 inventory_cli.py 5
widgets
```

`check_inventory_cli.py`, rerun, clean:

```text
$ python3 check_inventory_cli.py
returncode: 0
stdout: 'widgets\n'
stderr:
check_inventory_cli passed
```

### Connecting Back

The isolated `greet.py`/`run_greet.py` example proved `subprocess.run`
can launch a real, separate program and inspect its real output.
`inventory_cli.py` proved the identical mechanism catches a real,
run bug that lived entirely in a boundary — command-line argument
parsing — that no `import`-based check, however well written, could
ever have reached, because none of them go anywhere near a real command
line at all.

---

## Connect the Pieces

One concrete invocation, `python3 inventory_cli.py 5`, moving through
every piece this lesson built, start to finish:

1. `inventory_cli.py` is written as `inventory-report`'s first real,
   external entry point — but its own `main` reads `sys.argv[1]` as a
   raw string, unconverted.
2. Run directly, it crashes with a real `TypeError` — `low_stock_items`
   tries to compare an `int` count against a `str` threshold.
3. Every existing check in the project — five files, eight checks — is
   run in full and stays completely green, because not one of them
   touches `sys.argv`, `subprocess`, or `inventory_cli.py` at all.
4. `check_inventory_cli.py`, a new system test, launches
   `inventory_cli.py` as a real, separate process with `subprocess.run`
   and inspects its real `returncode`, `stdout`, and `stderr` — and
   fails, for the first time surfacing this exact bug as a check
   failure instead of only a manual crash.
5. The missing `int()` conversion is added to `main`.
6. `inventory_cli.py`, run directly, now prints `widgets` — the correct,
   real result. `check_inventory_cli.py`, rerun, passes cleanly, with a
   `returncode` of `0` and the exact expected `stdout`.

## What Breaks Without This

This lesson's own investigation already showed it directly: with only
unit and integration tests in place — Lessons 118 and 119's own real,
working checks — a real, run-crashing bug shipped in the one file meant
to be a real user's actual entry point into this program, and every
check in the project kept reporting success. Restated plainly: a unit
test proves one function is correct on its own; an integration test
proves real functions cooperate correctly when called together, inside
Python. Neither one, no matter how thorough, can prove that the actual
program a real user would run — command line included — works, because
neither one ever launches that program as a real, separate process the
way a real user actually would. Only a check built specifically to do
that could have caught this.

## Exercises

1. Add a second check to `check_inventory_cli.py` that runs
   `inventory_cli.py` with an argument that isn't a valid integer at
   all — `"abc"` instead of `"5"` — and inspect the real `returncode`
   and `stderr` that comes back. Decide, and justify in a comment,
   whether `inventory_cli.py`'s current behavior for that case (an
   unhandled `ValueError` from `int("abc")`) is acceptable for a real
   command-line tool, or whether it deserves the same kind of explicit,
   loud precondition Lesson 119 added to `build_reorder_report`.
2. `inventory_cli.py` currently only ever prints `low_stock_items`'s own
   output. Extend `main` to also print `build_reorder_report`'s output,
   and extend `check_inventory_cli.py` to assert on that additional
   output too.
3. Every check file in this project is still run one at a time, by
   hand, with a separate `python3 check_<something>.py` command. Domain
   12 (Build & Dependency Engineering) and later lessons in this
   domain (Lesson 139, Testing Strategy) are where running an entire
   project's checks as one coordinated step gets real treatment — for
   now, just count: how many separate commands does fully verifying
   `inventory-report` currently take?

## Definition of Done

- [ ] `inventory_cli.py` exists, reads its threshold argument with
      `int(sys.argv[1])`, and is guarded by
      `if __name__ == "__main__":`.
- [ ] `python3 inventory_cli.py 5` prints exactly `widgets`.
- [ ] `check_inventory_cli.py` exists, launches `inventory_cli.py` with
      `subprocess.run`, and asserts on its real `returncode` and
      `stdout`.
- [ ] Every prior check file in the project still passes unchanged.
- [ ] `git status` shows a clean working tree after committing.
- [ ] A commit exists whose message explains *why* — for example:
      `add inventory_cli.py and check_inventory_cli; a real
      system-level test caught a missing int() at the CLI boundary
      that no unit or integration check could reach` — not `add CLI`.

Next: Lesson 121 — End-to-End Tests.
