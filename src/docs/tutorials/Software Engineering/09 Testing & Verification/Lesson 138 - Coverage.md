# Lesson 138: Coverage

**What you will build.** A real, run measurement of exactly how much of
`inventory_report.py` and `inventory_cli.py`'s own source code the
entire, now nineteen-file, twenty-eight-function check suite actually
executes — using `coverage.py`, a real line-coverage tool, run as a
single batched command across every `check_*.py` file. The transferable
problem underneath the number itself: a coverage tool can only see what
happens inside the one operating-system process it's directly attached
to, and this project's own check suite already, deliberately, crosses
that exact boundary — `check_inventory_cli.py` and
`check_inventory_end_to_end.py` launch `inventory_cli.py` as a separate
`subprocess.run` invocation specifically because that's what makes them
trustworthy system and end-to-end tests, not shortcuts. The first,
naive coverage run reports `inventory_cli.py`'s own `main()` function as
**0% executed** — flatly contradicting two checks that are both real,
verified, currently-passing proof it really does run — resolved by
wiring the subprocess itself to report its own coverage back, using
`coverage.py`'s own real subprocess-measurement machinery, not by
weakening the check suite's own honest process isolation to make the
number more convenient.

**What you need to know first.** Lesson 115's own re-placement of this
project onto the pipeline's Verification stage and its first real,
automated check. Lesson 120's introduction of `subprocess.run` to test
`inventory_cli.py` as a genuinely separate process rather than importing
its functions directly, and Lesson 121's real end-to-end file-I/O test
built the same way. Lesson 131's mutation-testing finding — a line
executing is not proof anything about its result was actually checked —
a related but different gap from this lesson's own (a line not
executing *at all*, invisibly, from a measurement tool's own point of
view, rather than a line executing under an assertion too weak to
matter). Lesson 137's `CHECK_DIR = os.path.dirname(os.path.abspath(__file__))`
fix and its `cwd=CHECK_DIR` argument to both subprocess-launching
checks, which this lesson's real fix depends on mechanically, not just
thematically.

**Terms used in this lesson.**

- **Line coverage (statement coverage)** — the percentage of a source
  file's own lines that were executed at least once during a given run;
  a binary per-line fact, "ran" or "didn't," never a measurement of
  whether anything about a line's result was actually checked by an
  assertion. It exists because a check suite can grow large enough —
  nineteen files, twenty-eight functions, here — that no one can
  reliably tell, by re-reading, whether every line of the real code it's
  supposed to be exercising still gets touched by something.
- **Branch coverage** — a stricter relative of line coverage: not just
  whether a line containing an `if`/`for`/`while` executed, but whether
  *every* branch it could take was actually taken by some run, in both
  directions. Named here for orientation, since `coverage.py` supports
  it directly, even though this lesson's own real, found gap turns out
  to be a plain line-coverage gap, not a branch one — a whole function
  never running once, not one direction of a branch inside a function
  that does.
- **Coverage gap** — any specific line (or, under branch coverage, any
  specific branch) a real, current run of the test/check suite never
  executes. It exists as a named idea because the only honest way to
  find one is to actually run an instrumentation tool against the real,
  current suite and read its report — never by re-reading the suite by
  eye and guessing, the same failure mode Lesson 131's own mutation
  testing was built to catch on the assertion-strength side of this
  same problem.
- **Process boundary** — the line an operating system draws around one
  running program, keeping its memory, its open files, and everything
  happening inside its own interpreter invisible to every other running
  program by default. It matters here because `coverage.py` (like most
  instrumentation-based tools — profilers, in-process debuggers)
  measures by watching one specific interpreter process from the
  inside, and stops seeing anything the instant execution crosses into
  a different one, unless that other process is deliberately wired to
  report back.

**Objects and methods used.**

- **`coverage erase`**
  - *What it is:* `coverage.py`'s own command for deleting any existing
    coverage data files before a fresh measurement run.
  - *Implementation:* `python3 -m coverage erase` — removes `.coverage`
    (or, under parallel mode, every `.coverage.*` file) from the current
    directory; takes no arguments.
  - *Its use:* run once at the start of every batch in this lesson so a
    stale data file from a previous, different run can never silently
    inflate this run's own real number.
- **`coverage run`**
  - *What it is:* `coverage.py`'s own entry point for executing a
    Python script while recording which of its own lines, and which
    lines of whatever it imports, actually run.
  - *Implementation:* `python3 -m coverage run [options] script.py
    [args]`. Two option combinations matter this lesson: `--append`
    (used first) adds this run's own data into the single, shared
    `.coverage` file left by any prior run in the same batch instead of
    overwriting it; `-p` / `--parallel-mode` (used later, once
    subprocess measurement is wired in) writes this run's own data to a
    uniquely named file instead (`.coverage.<host>.<pid>.<random>`), so
    that many separate process runs can each keep their own data
    without one overwriting another's. Reads `source` and other
    settings from a `.coveragerc` file in the current directory, if one
    exists, instead of requiring every option on the command line.
  - *Its use:* the command that turns "did this line run" from a guess
    into a real, checkable fact, one `check_*.py` file at a time.
- **`coverage report -m`**
  - *What it is:* `coverage.py`'s own summary command, printing
    per-file statement counts and percentage covered.
  - *Implementation:* `python3 -m coverage report -m` reads whatever
    `.coverage` data is present in the current directory (after
    `coverage combine`, if parallel data files were used) and prints a
    table; the `-m` / `--show-missing` flag adds a `Missing` column
    listing the exact line numbers, or line ranges, that never
    executed.
  - *Its use:* the tool that turns `inventory_cli.py`'s real gap from
    an invisible fact into an exact, actionable pointer: `Missing
    30-33, 36`.
- **`.coveragerc`**
  - *What it is:* `coverage.py`'s own configuration file, an
    INI-format file `coverage run`, `coverage report`, and `coverage
    combine` all read automatically from the current directory with no
    flag needed to point at it.
  - *Implementation:* one section used this lesson, `[run]`, with two
    keys: `source = inventory_report, inventory_cli` (restricts every
    tracked module to just this project's own two source files, so a
    `check_*.py` file that only imports one of them doesn't get flagged
    as leaving the other "never imported") and `parallel = true` (added
    once subprocess measurement is wired in — switches every `coverage
    run` invocation from writing one shared `.coverage` file to writing
    its own uniquely named parallel file, which `coverage combine` then
    merges).
  - *Its use:* makes every one of the nineteen `coverage run`
    invocations in the batch use the identical, real settings without
    repeating `--source=inventory_report,inventory_cli` on each one by
    hand.
- **`coverage.process_startup()`**
  - *What it is:* a function `coverage.py` ships specifically to be
    called automatically at Python interpreter start-up, deciding
    whether the process that's just starting should measure its own
    coverage.
  - *Implementation, fetched and confirmed this session via
    `inspect.getsource`:* reads the `COVERAGE_PROCESS_START` (or
    `COVERAGE_PROCESS_CONFIG`) environment variable; if neither is set,
    returns `None` and does nothing at all. If one is set, it builds a
    real `Coverage(config_file=...)` instance using that file, turns
    off a few warnings that would otherwise fire for a background
    subprocess with no test suite of its own, sets an internal
    `_auto_save = True` flag so data gets written out at process exit
    even though nothing will ever call `.stop()` explicitly, and calls
    `.start()`. A module-level flag guards against the function running
    twice in the same process.
  - *Its use:* the one piece of real machinery that turns a plain
    `python3 inventory_cli.py ...` subprocess invocation into one that
    also measures and saves its own coverage — with zero change to
    `inventory_cli.py` itself.
- **`sitecustomize.py`**
  - *What it is:* a specific, reserved module name the Python
    interpreter itself looks for and imports automatically, silently,
    at start-up — before any of a program's own code runs — if a file
    with that exact name is importable from `sys.path`.
  - *Implementation:* any code written into a file named exactly
    `sitecustomize.py` executes automatically the moment the
    interpreter starts, with no `import sitecustomize` anywhere in the
    program, as long as that file's own directory is on `sys.path`.
  - *Its use:* the hook this lesson's fix relies on. Placed directly in
    `inventory-report/`, it becomes importable inside the
    `inventory_cli.py` subprocess for a mechanical reason Lesson 137
    already proved: `subprocess.run(["python3", "inventory_cli.py",
    ...], cwd=CHECK_DIR)` starts Python with its own working directory
    set to `inventory-report/`, and Python always prepends the
    directory holding the script it's running to `sys.path[0]` — so
    `sitecustomize.py`, sitting in that same directory, gets found and
    imported automatically, calling `coverage.process_startup()` before
    `inventory_cli.py`'s own first line even runs.
- **`coverage combine`**
  - *What it is:* `coverage.py`'s own merge command, combining several
    separate parallel data files — one per process — into a single
    data set a report can be generated from.
  - *Implementation:* `python3 -m coverage combine` looks for every
    file matching `.coverage.*` in the current directory, merges their
    recorded line-hit data together into one `.coverage` file, and
    deletes the originals once merged.
  - *Its use:* the step that lets this lesson's real fix — a
    subprocess writing its own, separate coverage data file — actually
    count toward one combined, whole-project report, instead of being
    silently lost the moment that subprocess exits.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`subprocess.run`**
  - *What it is:* the standard-library function for launching another
    program as a fully separate operating-system process and waiting
    for it to finish.
  - *Implementation, verified this session via `inspect.signature`:*
    `subprocess.run(*popenargs, input=None, capture_output=False,
    timeout=None, check=False, **kwargs)` — the first positional
    argument is a list of strings: the program to run, followed by its
    own arguments, exactly as they'd be typed at a shell. Returns a
    `CompletedProcess` object once the child process exits, carrying
    its `returncode`, and, when `capture_output=True`, its `stdout` and
    `stderr` as captured text.
  - *Its use:* reappearing in this lesson's own throwaway probe lab,
    below, in exactly the shape Lessons 120, 121, and 137 already
    established for the real project — launching a separate `python3`
    process and inspecting what came back.

## Concept Unit: Line Coverage

### The Problem

Twenty-three lessons of writing `check_*.py` files by hand, one at a
time, has produced real, working verification — but no one has ever
asked, and nothing has ever answered, a much more basic question: of
all the actual lines inside `inventory_report.py` and `inventory_cli.py`,
how many does this check suite, taken as a whole, ever genuinely
execute? A single check file's own coverage of a single function is
easy to eyeball. Nineteen files' combined coverage of two whole source
files is not — a line could sit in a rarely-touched corner of one
function, real, shipped, and never once run by anything the project
actually runs, with nothing in nineteen separate files' worth of source
code making that fact visible.

### Project Change

- **Reference Source** — no reference counterpart; this is a
  from-scratch addition to `inventory-report/`'s own verification
  tooling, the same posture every lesson extending this project has
  taken since Lesson 105.
- **Files affected** — `.coveragerc`, created, in `inventory-report/`.
- **Change type** — add.
- **Location** — `inventory-report/.coveragerc`, a new file at the
  project's own top level, alongside `.gitignore` and `CODEOWNERS`.
- **Dependencies** — the `coverage` package, installed the same way
  `mypy` (Lesson 116) and `hypothesis` (Lesson 128) were: `pip install
  coverage`, into this machine's own global Python environment, not
  vendored into the project folder itself.

### The New Code

```
[run]
source = inventory_report, inventory_cli
```

### Mechanical Walkthrough

- `[run]` — an INI-format section header, coverage.py's own convention
  for grouping every setting that applies specifically to `coverage
  run` (as opposed to, say, a separate `[report]` section for
  `coverage report`-only settings, unused here). Everything until the
  next `[section]` header, or the end of the file, belongs to `run`.
- `source = inventory_report, inventory_cli` — a comma-separated list
  telling every `coverage run` invocation which modules to actually
  track. Without it, `coverage run check_low_stock.py` would, by
  default, track every module that check file happens to import,
  including the standard library's own — producing a report cluttered
  with irrelevant modules, and, separately, producing a real
  `CoverageWarning` every time one of the two named modules genuinely
  isn't imported by that particular check file (most check files import
  only `inventory_report`, a handful import only `inventory_cli`, and
  none import both) — expected, harmless noise from this point on,
  shown once, for real, below, then suppressed for the rest of this
  lesson's own commands the same way Lesson 105's own `git config
  core.autocrlf false` note silenced a different tool's own harmless
  noise.

### CS Lens

**Line coverage** is a form of **dynamic program analysis** — a fact
about a program discovered by actually running it and observing what
happens, as opposed to **static analysis** (Lesson 116's own `mypy`,
reasoning about the code without running it at all). Also recognized
in: JaCoCo instrumenting Java bytecode, Istanbul/`nyc` instrumenting
JavaScript, `gcov`/`lcov` instrumenting compiled C and C++, `SimpleCov`
for Ruby — every mainstream language ecosystem has its own version of
the identical idea, because the underlying question, "did the tests we
actually have touch this code," is not language-specific. It is also,
structurally, the same question Lesson 24's own requirements
traceability matrix asked one layer up the pipeline: not "did a test
touch this line" but "did some requirement get traced all the way to
some verification" — coverage is a traceability matrix built between a
test suite and a codebase, generated automatically instead of
maintained by hand.

### SE Lens

The real, honest tradeoff a coverage percentage represents: it is
**cheap to produce automatically** and **easy to satisfy without much
effort** — write any code path that runs, and it counts, regardless of
whether anything checked its result — against Lesson 131's own mutation
testing, which is **expensive to run** (hand-built on this machine,
specifically because the standard `mutmut` tool refuses to run natively
here) but answers a **much stronger** question: not "did this line
run," but "would this check suite actually notice if this line's own
logic were wrong." A team gating merges on "80% coverage" is optimizing
for the cheap, weaker signal; Lesson 131 already proved, on this exact
project, that a line can sit at 100% line coverage for sixteen lessons
straight while the one thing it does — `low_stock_items`'s own
`sorted()` call — goes completely unverified the entire time. This
lesson's own eventual 100% number, once earned honestly below, is not
a claim that every line's behavior is verified — only that every line
at least ran. Both facts are real and worth having; neither one implies
the other.

### Commands Needed

```bash
python3 -m coverage erase
python3 -m coverage run --append check_low_stock.py
```

The first command, `python3 -m coverage erase`, deletes any leftover
`.coverage` data file so this run starts from a genuinely clean slate.
The second, `python3 -m coverage run --append check_low_stock.py`, runs
just the first of the nineteen check files under measurement — run
alone, first, specifically to show the real, one-time `.coveragerc`
warning honestly before it's suppressed for the other eighteen:

```
/path/to/site-packages/coverage/inorout.py:558: CoverageWarning: Module inventory_cli was never imported. (module-not-imported); see https://coverage.readthedocs.io/en/7.15.4/messages.html#warning-module-not-imported
  self.warn(f"Module {pkg} was never imported.", slug="module-not-imported")
```

Exactly as predicted above: `check_low_stock.py` only imports
`inventory_report`, never `inventory_cli`, so `coverage` warns about the
half of `source` this one file's own run never touched — real,
expected, and, from here on, redirected to `/dev/null` rather than
repeated eighteen more times for the same reason. The remaining
eighteen files run the identical way, batched into one command,
followed by the report:

```bash
for f in check_apply_reorder.py check_build_reorder_report.py check_build_reorder_report_stub.py check_format_reorder_line.py check_format_reorder_line_priced.py check_inventory_cli.py check_inventory_end_to_end.py check_load_inventory_boundaries.py check_load_inventory_contract.py check_low_stock_across_stores.py check_low_stock_across_stores_casing.py check_parse_inventory_fake.py check_parse_inventory_fuzz.py check_reorder_suggestion.py check_reorder_suggestion_property.py check_restock_alert.py check_restock_alert_isolated.py check_restock_alert_mock.py; do
  python3 -m coverage run --append "$f" > /dev/null 2>/dev/null
done
python3 -m coverage report -m
```

### Run It

```
Name                  Stmts   Miss  Cover   Missing
---------------------------------------------------
inventory_cli.py         23      5    78%   30-33, 36
inventory_report.py      34      0   100%
---------------------------------------------------
TOTAL                    57      5    91%
```

Real, run output: `inventory_report.py` — every function this project
has built since Lesson 115, including Lesson 135's `low_stock_across_stores`
and its own `if key not in seen:` branch in both directions — sits at a
genuine 100%. `inventory_cli.py` sits at 78%, missing lines 30 through
33 and line 36. Read against the real file from Lesson 137: those are
`main()`'s own four-line body and the `if __name__ == "__main__":`
guard's own call to it — the exact code `check_inventory_cli.py` and
`check_inventory_end_to_end.py` are supposed to be proving works, both
of them currently green, both of them named directly in this lesson's
own "What you need to know first."

### Connecting Back

A number that flatly contradicts two real, currently-passing checks is
not a bug in the checks — Lessons 120, 121, and 137 already proved,
independently, that `inventory_cli.py`'s `main()` really does run and
really does the right thing. It's the coverage tool itself missing
something, which is exactly what the next Concept Unit tracks down.

## Concept Unit: A Process Boundary Is Also a Measurement Boundary

### The Problem

`check_inventory_cli.py` calls `subprocess.run(["python3",
"inventory_cli.py", "inventory.json", "5"], ..., cwd=CHECK_DIR)` and
then asserts on the real `stdout` that comes back — a genuine,
currently-passing proof that `main()` runs, start to finish, for real.
Yet `coverage report -m`, run moments ago against that exact same check
file, says line 30 through 33 and line 36 never executed at all. Both
facts are true at once, which means the contradiction is not really
about `inventory_cli.py` — it's about what `coverage run` was actually
watching while `check_inventory_cli.py` ran.

### Isolating the Concept: Process-Boundary Coverage

A minimal, unrelated pair of files proves this concretely, with nothing
of the real project involved:

```python
# probe_child.py
print("child ran")
```

`probe_child.py` does exactly one thing: prints a line, so there's no
question later about whether it genuinely ran.

```python
# probe_parent.py
import subprocess
subprocess.run(["python3", "probe_child.py"])
print("parent ran")
```

Run under coverage, from the same directory as both files:

```bash
python3 -m coverage erase
python3 -m coverage run --source=. probe_parent.py
python3 -m coverage report -m
```

Real, run output:

```
child ran
parent ran
Name              Stmts   Miss  Cover   Missing
-----------------------------------------------
probe_child.py        1      1     0%   1
probe_parent.py       3      0   100%
-----------------------------------------------
TOTAL                 4      1    75%
```

The real order the two lines printed in — `child ran` before `parent
ran` — is itself part of the proof, not incidental, so it's worth
tracing what actually happens, statement by statement, rather than just
reading the output as two lines that happened to appear:

1. `subprocess.run(["python3", "probe_child.py"])` — launches a
   brand-new, separate `python3` process and **blocks**, right here,
   until that whole process finishes; nothing in `probe_parent.py`
   itself has run `coverage`-instrumented code yet at this point except
   this one call.
2. Inside that separate process, `probe_child.py`'s own single line,
   `print("child ran")`, runs to completion — this is a genuinely
   different Python interpreter than the one `coverage run` was
   launched against, with no memory of, or connection to, the parent's
   own instrumentation.
3. Only once that separate process exits does `subprocess.run` return
   control to `probe_parent.py`, which then reaches its own next line,
   `print("parent ran")` — explaining why `parent ran` prints second,
   always, not just this once.

`child ran` printed to the real terminal — proof, the same standard
this schema has held every claim of hidden behavior to since Lesson 6b,
that `probe_child.py`'s one line genuinely executed, in step 2 above.
And yet the report says `probe_child.py` is 0% covered, missing exactly
line 1 — the only line it has. This is called a **process boundary as a
measurement boundary**: `coverage run` instruments the one Python
interpreter process it was directly launched inside of, `probe_parent.py`'s
own — everything in step 1 and step 3, above. `subprocess.run` starts a
second, completely separate interpreter process to run `probe_child.py`
in step 2 — a real, independent Python interpreter with its own memory,
its own import machinery, and, critically, its own total ignorance that
any coverage measurement is happening anywhere. The parent's own
instrumentation was never attached to it, so nothing about the child's
own execution — however real — was ever visible to the tool watching
the parent.

`probe_parent.py` and `probe_child.py` are now discarded — two-file
demonstration, purpose-built to isolate this one fact, and they will
not appear in the project again. `inventory_cli.py` is not a two-line
toy, but the exact same mechanism explains its own 0%: `check_inventory_
cli.py`'s `subprocess.run(["python3", "inventory_cli.py", ...])` starts
`inventory_cli.py` the identical way `probe_parent.py` started
`probe_child.py` — a fresh, separate interpreter, invisible to whatever
coverage measurement is running in the check file's own process.

### Project Change

- **Reference Source** — no reference counterpart; a from-scratch
  addition to `inventory-report/`'s own verification tooling.
- **Files affected** — `sitecustomize.py`, created, in
  `inventory-report/`; `.coveragerc`, modified, in `inventory-report/`;
  `.gitignore`, modified, in `inventory-report/`.
- **Change type** — add (`sitecustomize.py`), configure (`.coveragerc`,
  `.gitignore`).
- **Location** — all three files sit at `inventory-report/`'s own top
  level, alongside `inventory_cli.py` itself — `sitecustomize.py`'s
  location is not incidental; it has to be importable from
  `inventory_cli.py`'s own subprocess, and Lesson 137's `cwd=CHECK_DIR`
  is exactly what makes that true, explained fully below.
- **Dependencies** — the same `coverage` package already installed for
  the previous Concept Unit; no new package.

### The New Code

```python
import coverage
coverage.process_startup()
```

### The Updated Project

`.coveragerc` gains one new key inside the same `[run]` section built
in the previous Concept Unit:

```
[run]
source = inventory_report, inventory_cli
parallel = true
```

`.gitignore` gains three new lines, alongside the existing `*.log`
already there since Lesson 105:

```
*.log
.coverage
.coverage.*
htmlcov/
```

### Mechanical Walkthrough

- `import coverage` — an ordinary import of the same third-party
  package already used, as a command-line tool, in the previous Concept
  Unit; here it's imported as a real Python module instead, because
  `sitecustomize.py`'s own job is to call one specific function inside
  it.
- `coverage.process_startup()` — already given full treatment in this
  lesson's own Header, restated here at its point of use: reads
  `COVERAGE_PROCESS_START` from the environment; if it's set (to
  `inventory-report/.coveragerc`'s own path, set below in Commands
  Needed), builds a real `Coverage` instance from that config file and
  starts measuring immediately, before `sitecustomize.py`'s own two
  lines have even finished running, let alone before `inventory_cli.py`'s
  own first line does.
- `parallel = true` — a new key inside the already-explained `[run]`
  section. Without it, every process that calls `coverage.start()` —
  now including `inventory_cli.py`'s own subprocess, not just the
  check file that launched it — would write to the identical, single
  `.coverage` file, each one overwriting whatever the last process
  wrote instead of adding to it. `parallel = true` switches every
  process, parent and subprocess alike, to writing its own uniquely
  named `.coverage.<host>.<pid>.<random>` file, none of which collide.
- `.coverage`, `.coverage.*`, `htmlcov/` — three new `.gitignore`
  patterns. `.coverage` matches the single combined data file
  `coverage combine` produces; `.coverage.*` matches every one of the
  parallel data files before they're combined; `htmlcov/` matches the
  directory `coverage html` (not run this lesson, left as an exercise)
  would generate — all three are real, regenerable data, the same
  category of file `__pycache__/`, `.hypothesis/`, and `.mypy_cache/`
  already belonged to per this project's own standing verification
  gotchas, never committed alongside the source they were generated
  from.

### CS Lens

**Process isolation** — the same OS-level guarantee that made
`probe_child.py`'s own execution invisible to `probe_parent.py`'s
coverage measurement — is not a limitation unique to `coverage.py`; it
is deliberately built into every operating system for a reason that has
nothing to do with testing. Also recognized in: container and sandbox
boundaries, which exist specifically to make one process's memory and
files invisible to another, for security rather than convenience;
distributed tracing (Lesson 199, not yet built) needing an explicit
correlation ID threaded through every network call specifically because
each microservice hop (Lessons 82–87) is its own separate process,
often on a separate machine, with no shared memory a tracer could
observe directly; a debugger needing an explicit "attach to process"
step before it can see anything happening inside a program that's
already running; and, at the operating-system level itself, `LD_PRELOAD`
on Linux or a JVM `-javaagent` flag — both real mechanisms for
deliberately injecting instrumentation into a process at start-up,
which is precisely what `sitecustomize.py` plus `COVERAGE_PROCESS_START`
does for Python. The pattern recurring across every one of these: you
can only observe what you are inside of, or what you have explicitly
arranged, in advance, to report back out.

### SE Lens

The real tradeoff, stated plainly: the exact process isolation that
makes `check_inventory_cli.py` and `check_inventory_end_to_end.py`
trustworthy system and end-to-end tests — testing the real, separately
invoked command-line entry point, not an in-process shortcut that could
hide a real integration bug the way Lesson 118 once found one — is the
identical isolation that made coverage blind to them by default. There
was no design mistake anywhere in Lessons 120, 121, or 137; the
measurement tool simply hadn't yet been told how to see across a
boundary those lessons deliberately built for a different, good reason.
The fix carries its own honest, still-open cost: `sitecustomize.py`'s
own discoverability depends entirely on `inventory_cli.py`'s subprocess
starting with `inventory-report/` as its own working directory, which
today holds only because Lesson 137's `cwd=CHECK_DIR` fix is still in
place in both subprocess-launching checks. A future lesson that changed
how either check launches `inventory_cli.py` — invoking it as
`python3 -m inventory_cli` instead of by its own file path, say, or
moving it to a different subdirectory relative to the checks that
launch it, both risks Lesson 137's own SE Lens already flagged as
unaddressed — would silently stop finding `sitecustomize.py` too, with
no error anywhere, only this exact coverage gap quietly reappearing
with nothing pointing back at the cause. Not fixed this lesson; named
honestly, the same way Lesson 134 left its own seeded-check gap open
rather than pretending the fix had no edges.

### Commands Needed

```bash
export COVERAGE_PROCESS_START="$(pwd)/.coveragerc"
```

Sets the one environment variable `coverage.process_startup()` reads,
to the absolute path of the same `.coveragerc` already built. Every
subprocess launched from this shell from now on inherits it
automatically — including, eventually, the `python3 inventory_cli.py
...` subprocess two of the check files launch — because a child process
inherits its parent's environment variables unless something explicitly
overrides them, and neither `check_inventory_cli.py` nor
`check_inventory_end_to_end.py`'s own `subprocess.run` call passes an
`env=` argument that would.

```bash
python3 -m coverage erase
for f in check_*.py; do
  python3 -m coverage run -p "$f" > /dev/null 2>/dev/null
done
python3 -m coverage combine > /dev/null
python3 -m coverage report -m
```

The same batched loop as the previous Concept Unit, with one real
change: `-p` (parallel mode) instead of `--append`, now that
`.coveragerc` sets `parallel = true` and `--append` no longer applies —
`coverage` itself refuses the combination outright, confirmed for real
this session: `Can't append to data files in parallel mode.` This time
the glob covers all nineteen files in one pass, since the one-time
warning was already shown honestly, above. `coverage combine`, run once
after the batch, merges every parallel data file — the nineteen from
each check file's own direct run, plus, now, one more written by
`inventory_cli.py`'s own subprocess, for each of the two checks that
launch it — into a single data set before the final report.

### Run It

```
Name                  Stmts   Miss  Cover   Missing
---------------------------------------------------
inventory_cli.py         23      0   100%
inventory_report.py      34      0   100%
---------------------------------------------------
TOTAL                    57      0   100%
```

Real, run output, this session: `inventory_cli.py`'s own `main()` and
its `if __name__ == "__main__":` guard now read 100%, closed for real —
not by loosening what the check suite was already honestly doing, but
by finally letting the subprocess it already launches report its own,
already-real execution back to the tool that had been blind to it.

### Connecting Back

The 91% this lesson opened with and the 100% it closes with describe
the identical check suite, running the identical checks, finding the
identical real bugs Lessons 115 through 137 already found and fixed —
only the measurement changed, from one that stopped at a process
boundary to one that was deliberately wired across it.

## Connect the Pieces

One thread, start to finish: `coverage erase` clears the slate →
`coverage run --append` measures all nineteen check files, one real
`.coveragerc` warning shown honestly and then suppressed → `coverage
report -m` reports a real, run 91%, with `inventory_cli.py`'s own
`main()` at a flat 0%, lines 30–33 and 36 — a direct contradiction of
Lessons 120, 121, and 137's own already-passing proof that exact code
runs → the throwaway `probe_parent.py`/`probe_child.py` pair proves,
in isolation, that a subprocess's own real execution is invisible to a
parent process's coverage measurement by default, the identical
mechanism behind `inventory_cli.py`'s own gap → `sitecustomize.py`,
`coverage.process_startup()`, `COVERAGE_PROCESS_START`, and `parallel =
true` wire the real subprocess to measure and report its own coverage
back → the identical nineteen-file batch, rerun with nothing else
changed, reports a real, run 100% — the same check suite, now fully
accounted for by the tool measuring it.

## What Breaks Without This

Removing the fix, live, on the real project — `COVERAGE_PROCESS_START`
simply unset, `sitecustomize.py` left in place but now inert:

```bash
unset COVERAGE_PROCESS_START
python3 -m coverage erase
for f in check_*.py; do
  python3 -m coverage run -p "$f" > /dev/null 2>/dev/null
done
python3 -m coverage combine > /dev/null
python3 -m coverage report -m
```

Real, run output:

```
Name                  Stmts   Miss  Cover   Missing
---------------------------------------------------
inventory_cli.py         23      5    78%   30-33, 36
inventory_report.py      34      0   100%
---------------------------------------------------
TOTAL                    57      5    91%
```

The exact original gap, reproduced on demand, real, twice now across
this lesson — confirming the fix is genuinely load-bearing, not a
coincidence of some other change. Restored:

```bash
export COVERAGE_PROCESS_START="$(pwd)/.coveragerc"
python3 -m coverage erase
for f in check_*.py; do
  python3 -m coverage run -p "$f" > /dev/null 2>/dev/null
done
python3 -m coverage combine > /dev/null
python3 -m coverage report -m
```

Real, run output:

```
Name                  Stmts   Miss  Cover   Missing
---------------------------------------------------
inventory_cli.py         23      0   100%
inventory_report.py      34      0   100%
---------------------------------------------------
TOTAL                    57      0   100%
```

Back to 100%, real, confirmed a second time.

## Exercises

1. Add `branch = true` to `.coveragerc`'s own `[run]` section, rerun
   the identical batch, and read the new `Missing` column with `-m` —
   does `low_stock_across_stores`'s own `if key not in seen:` (Lesson
   135) genuinely get exercised in both directions across the whole
   suite, or only one? Work it out from the real report, not from
   re-reading the check files by eye.
2. Run `python3 -m coverage html` after a real, combined run and open
   the generated `htmlcov/index.html` in a browser — the same data
   `coverage report -m` prints as line numbers, shown instead as the
   real source with executed and missing lines colored directly on top
   of it.
3. Lesson 137's own SE Lens named a gap this lesson's SE Lens repeats:
   neither fix protects against `inventory_cli.py` being invoked a
   different way (`python3 -m inventory_cli` instead of by file path)
   or moved to a different directory. Don't fix it — write down, in one
   or two sentences, exactly what observable symptom would show up
   first if it happened, and in which of this lesson's own two files
   (`.coveragerc` or `sitecustomize.py`) the actual failure would
   originate.

## Definition of Done

- [ ] `inventory-report/.coveragerc` exists, with `source =
      inventory_report, inventory_cli` and `parallel = true` under
      `[run]`.
- [ ] `inventory-report/sitecustomize.py` exists, containing `import
      coverage` and `coverage.process_startup()`.
- [ ] `inventory-report/.gitignore` excludes `.coverage`, `.coverage.*`,
      and `htmlcov/`, alongside the pre-existing `*.log`.
- [ ] With `COVERAGE_PROCESS_START` set and all nineteen `check_*.py`
      files run under `coverage run -p`, followed by `coverage combine`
      and `coverage report -m`, both `inventory_report.py` and
      `inventory_cli.py` show a real, run 100%.
- [ ] Unsetting `COVERAGE_PROCESS_START` and rerunning the identical
      batch reproduces the original 78% / 91% gap, confirmed this
      session, proving the fix is real and not coincidental.
- [ ] `git add .coveragerc sitecustomize.py .gitignore && git commit
      -m` with a message explaining *why*: closing the coverage tool's
      own blind spot at a process boundary two already-passing checks
      cross on purpose, not adding a new check or changing any of the
      project's own behavior.
