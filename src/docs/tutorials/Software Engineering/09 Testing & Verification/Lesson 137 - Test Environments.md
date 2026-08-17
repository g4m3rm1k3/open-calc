# Lesson 137: Test Environments

**What you will build.** Two existing checks — `check_inventory_cli.py`
and `check_inventory_end_to_end.py` — will be fixed so they pass
identically no matter which directory they are launched from. Right now
both only pass when run from directly inside `inventory-report/`; run
either one from anywhere else and it fails with a real error that has
nothing to do with a regression in the code being tested. The
transferable problem underneath the fix: what a **test environment**
actually is — everything a test's own launch context quietly supplies
for free, without the test's own source ever naming it as a dependency —
and why a check that only passes from one specific launch location has
not actually verified the code under test. It has verified one specific
way of invoking it, and mistaken that for the same thing.

**What you need to know first.** Lesson 120 (System Tests) introduced
`subprocess.run`, spawning `inventory_cli.py` as a real, separate
operating-system process and inspecting its exit code and output.
Lesson 121 (End-to-End Tests) introduced the project's first real file
I/O, `load_inventory` reading `inventory.json` off disk. Both of this
lesson's own files reuse `subprocess.run` exactly as those two lessons
left it — nothing about the call itself changes; what changes is one
detail neither lesson ever had to think about, because both of them
happened to always be run from the same place.

**Pipeline diagram.** This curriculum's 17-stage lifecycle pipeline,
established in Lesson 12:

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
Verification  ← this lesson
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

This lesson touches **Verification**, the same stage Lesson 115 first
revisited for this project, and the same stage Lesson 12 originally
placed using `is_username_available` (Lesson 2's username-availability
check) — hand-run once, by eye, against the literal inputs `"dave"` and
`"alice"`. Carried through every other stage Lesson 12 itself reached:
**Problem** ("can two people register conflicting accounts," implied by
the task, never stated outright), **Requirements** (Lesson 2's own
opening line, "say whether it's available"), **Specification** (Lesson
2's case-sensitivity gap — is `"Dave"` the same username as `"dave"`?),
**Implementation** (Lesson 2's three-line function), **Architecture /
Design** (Lesson 3 placing it inside `accounts.py`, owned by a team,
with a formal boundary to `growth_signup.py`), **Operations /
Observation** (Lesson 3's on-call engineer, paged at 3 a.m.), and
**Change** (Lesson 9's internal `_accounts` restructuring, absorbed
without breaking `get_account_status`). Lesson 115 deepened Verification
itself with this project's own running example, replacing that original
fragile hand-check with a real, automated `check_low_stock_items`. This
lesson deepens Verification a second time, on a different axis
entirely: Lesson 115 asked whether a check's own *assertion* was
actually correct; this lesson asks whether a check's own *result* can be
trusted regardless of *where* it was run — a passing check whose pass
depends on an unstated launch location is not stronger evidence than the
fragile hand-check Lesson 115 already replaced once.

**Terms used in this lesson.**

- **test environment** — everything about the machine and its state a
  test runs inside, beyond the code under test itself: the process's
  working directory, the interpreter and version actually invoked,
  installed packages, environment variables, the surrounding filesystem
  layout. It has its own name because two runs of the byte-for-byte
  identical test file can produce different results, and when that
  happens the difference is never explainable by reading the test's own
  source — only by knowing what else was different about where and how
  it ran.
- **working directory (cwd)** — the filesystem location a running
  process treats as its own "here" for resolving any relative path it's
  given. Every relative path, in every language, is secretly relative to
  this, even when nothing in the code that uses it ever names it — a
  process does not choose its own working directory; whatever launched
  it does, and the process inherits that choice silently.
- **absolute path** — a path that names a location starting from the
  filesystem's own root, unambiguous regardless of which directory is
  currently "here." A path like
  `C:\Users\...\inventory-report\inventory.json` means exactly one file,
  no matter what process reads it or from where.
- **relative path** — a path that names a location only in terms of the
  current working directory, meaning nothing on its own. `"inventory.json"`
  alone could refer to any number of different real files depending
  entirely on an ambient fact — the working directory — that the path
  itself never states.
- **ambient dependency** — something a program's correct behavior
  silently relies on without ever declaring it as an input: a global, an
  environment variable, a working directory, a piece of installed
  software assumed to already be there. The opposite of an explicit
  dependency (a parameter, an import, a documented configuration value),
  which is easy to see and easy to get wrong on purpose to test; an
  ambient one is easy to get wrong by accident, because nothing about
  reading the code that depends on it reveals that it depends on
  anything at all.

**Objects and methods used.**

- **`__file__`**
  - *What it is:* a module-level variable Python's own import system
    sets automatically on every module it loads, holding the path used
    to locate that module — no code inside the module ever assigns it
    itself.
  - *Implementation:* a plain `str`. For the script actually launched
    (`__main__`), it holds the path the interpreter was invoked with.
    Real output later in this lesson (both runs, same directory)
    confirms it already comes out as a full absolute path on this
    project's own Python (confirmed 3.11.9, via `python3 --version`) —
    but nothing in this lesson's own code assumes that holds on every
    interpreter it might ever run under; see `os.path.abspath`, next.
  - *Its use:* the one honest way a running script can answer "where do
    I myself live on disk" — every fix in this lesson starts from this
    single value.
- **`os.path.abspath`**
  - *What it is:* a function, part of the standard library's `os.path`
    submodule, that converts any path — relative or already absolute —
    into an absolute one.
  - *Implementation:* real, fetched signature this session, via
    `help(os.path.abspath)`: `abspath(path)` → `str`, "Return the
    absolute version of a path." It joins a relative `path` onto the
    process's own current working directory (the one real system call
    involved, asking the operating system what that directory currently
    is) and normalizes the result, collapsing any `.`/`..` segments — it
    never checks whether anything actually exists at the resulting path.
  - *Its use:* applied to `__file__` here, purely defensively. This
    project's own real output (below) shows `__file__` was already
    absolute in both runs — `abspath` had nothing to fix this time.
    Keeping the call anyway means the code no longer depends on that
    being true; it produces the same guarantee itself, in one function
    call, rather than trusting an interpreter behavior nothing in this
    file ever verified.
- **`os.path.dirname`**
  - *What it is:* a function, also in `os.path`, that returns the
    directory portion of a path, discarding the filename at the end.
  - *Implementation:* real, fetched signature this session, via
    `help(os.path.dirname)`: `dirname(p)` → `str`, "Returns the
    directory component of a pathname." Pure string manipulation —
    splits on the path separator and returns everything before the last
    one, touching neither the filesystem nor the operating system at
    all.
  - *Its use:* `__file__` names a specific *file* (`check_inventory_cli.py`
    itself); the check needs the *folder* that file lives in, to hand to
    the subprocess it launches next.
- **`subprocess.run`'s `cwd` keyword argument**
  - *What it is:* a parameter of `subprocess.run` (forwarded straight
    through to `subprocess.Popen`, which actually does the work) that
    sets the working directory of the *child* process being started,
    before that child runs a single line of its own code.
  - *Implementation:* real, fetched signature this session, via
    `inspect.signature(subprocess.Popen.__init__)`. The full signature
    lists eighteen parameters; the one this lesson depends on is
    `cwd=None`. Default `None` means "inherit the parent process's own
    current working directory" — the exact silent behavior this
    lesson's bug came from. Passing a real path overrides it.
  - *Its use:* forces the child `python3 inventory_cli.py ...` process
    launched by each check to resolve its own relative arguments
    (`inventory_cli.py` the script, `inventory.json` the data file)
    against `check_inventory_cli.py`'s own folder — never against
    whatever directory happened to launch the check itself.

**Everything else in the file, not this lesson's subject but still
explained.**

- **`subprocess.run`**
  - *What it is:* a standard-library function, first used in this
    project by Lesson 120, that starts a real, separate program as its
    own operating-system process, waits for it to finish, and returns an
    object describing what happened.
  - *Implementation:* real, fetched signature this session, via
    `help(subprocess.run)`: `run(*popenargs, input=None,
    capture_output=False, timeout=None, check=False, **kwargs)` →
    `CompletedProcess`. Its first positional argument is a list of
    strings — the program to launch, then each of its own command-line
    arguments, one list element per argument, never one string with
    spaces inside it.
  - *Its use:* both checks in this lesson use it exactly as Lesson 120
    left it, to run `inventory_cli.py` as a real process and inspect
    what it actually did — not to call any Python function inside it
    directly, which would only prove the function works when imported,
    not when run the way a real user would run it from a terminal.
- **`capture_output=True`**
  - *What it is:* a keyword argument to `subprocess.run`.
  - *Implementation:* `bool`, default `False`. When `True`, it redirects
    the child process's own standard output and standard error into the
    returned `CompletedProcess` object instead of letting them print
    directly to the terminal the check itself is running in.
  - *Its use:* lets each check inspect exactly what the child process
    printed, programmatically, instead of only seeing it scroll past.
- **`text=True`**
  - *What it is:* a keyword argument to `subprocess.run`.
  - *Implementation:* `bool`, default `False`. When `True`, the captured
    `stdout`/`stderr` come back as `str`; left `False`, they come back
    as raw `bytes` instead.
  - *Its use:* both checks compare `result.stdout` directly against a
    plain string (`"widgets\n"`) and check for a substring
    (`"gadgets" in result.stderr`) — neither comparison works against
    raw `bytes` without this.
- **`subprocess.CompletedProcess`**
  - *What it is:* the object `subprocess.run` returns once the child
    process it started has finished.
  - *Implementation:* real, fetched shape this session, via
    `help(subprocess.CompletedProcess)`: a plain class holding `args`,
    `returncode`, `stdout`, and `stderr` as real attributes, no methods
    either check calls.
    - `.returncode` — the child process's own real exit code; `0`
      conventionally means success, any other integer means failure, by
      a convention the child process itself chooses, not something
      `subprocess` invents.
    - `.stdout` — everything the child process printed to its own
      standard output, captured because `capture_output=True` was
      passed.
    - `.stderr` — everything the child process printed to its own
      standard error, captured the same way.
  - *Its use:* both checks in this lesson read `.returncode` to decide
    pass/fail, and read `.stdout`/`.stderr` to confirm the *reason* was
    the one actually expected, not merely that *something* failed.

## Concept Unit: Anchoring a Check's Own Working Directory

### The Problem

Both `check_inventory_cli.py` and `check_inventory_end_to_end.py` have
passed every time they've been run so far in this curriculum — because
every time, without anyone deciding this on purpose, they were run from
directly inside `inventory-report/`. Neither file's own source says
anywhere that this has to be true. Running either one from
`inventory-report/`'s own parent directory instead proves it, for real:

```text
$ python3 check_inventory_cli.py
check_inventory_cli passed
```

That's the familiar result — this check, launched the way every prior
lesson has launched it, from inside `inventory-report/` itself. Now the
exact same file, unmodified, launched one directory up instead:

```text
$ python3 inventory-report/check_inventory_cli.py
Traceback (most recent call last):
  File "/path/to/inventory-report/check_inventory_cli.py", line 13, in <module>
    check_inventory_cli()
  File "/path/to/inventory-report/check_inventory_cli.py", line 9, in check_inventory_cli
    assert result.returncode == 0
           ^^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

Nothing about `inventory_cli.py`, `load_inventory`, or any function this
project has built changed between these two runs — the second command
launches the literal same, unedited file as the first. What changed is
only the directory the command itself was typed from. Digging one level
deeper, reproducing exactly what `check_inventory_cli`'s own
`subprocess.run` call does internally, shows why:

```text
$ python3 -c "
import subprocess
result = subprocess.run(['python3', 'inventory_cli.py', 'inventory.json', '5'], capture_output=True, text=True)
print(result.returncode, result.stderr)
"
2 python3: can't open file '/path/to/inventory_cli.py': [Errno 2] No such file or directory
```

The check's own `subprocess.run` call asks for a program literally named
`"inventory_cli.py"` — a relative path — trusting it to resolve to the
one sitting next to the check inside `inventory-report/`. It never does
that on its own; a relative path always resolves against whichever
directory the *check itself* happens to be running in at that exact
moment, and this check never controls that directory, it only inherits
it from whatever launched it. Launched from inside `inventory-report/`,
that inherited directory happens to already be the right one, by
accident. Launched from one level up, it isn't, and `python3` reports
exactly what it found: no file named `inventory_cli.py` sitting in the
directory it was told to look in. This is the **test environment** —
everything the check's own launch context supplied for free, without
the check's own source ever naming it as something it depends on — and
right now it is silently doing half of this check's own job.

### Project Change

- **Reference Source.** No reference counterpart — `inventory-report/`
  is a from-scratch project, not ported from any external reference
  implementation. This unit modifies two of the project's own
  already-existing, already-verified files directly.
- **Files affected.** `inventory-report/check_inventory_cli.py`
  (modify) and `inventory-report/check_inventory_end_to_end.py`
  (modify) — both get the identical fix, since both share the identical
  bug.
- **Change type.** Add (one new import, one new module-level constant)
  plus configure (one new keyword argument on an already-existing
  `subprocess.run` call in each file).
- **Location.** In each file: the new `import os` line goes directly
  after the existing `import subprocess` line, already present in both
  files; the new `CHECK_DIR` constant goes immediately below the
  imports, before either file's own check function; the new
  `cwd=CHECK_DIR` argument goes inside each file's existing
  `subprocess.run(...)` call, as a fourth argument alongside
  `capture_output=True` and `text=True`, both already there.
- **Dependencies.** None beyond what's already installed — `os` is part
  of Python's own standard library, already present in every environment
  this project has run in.

### The New Code

```python
import os

CHECK_DIR = os.path.dirname(os.path.abspath(__file__))
```

The one-line addition inside each file's existing `subprocess.run` call:

```python
        cwd=CHECK_DIR,
```

### The Updated Project

`check_inventory_cli.py`, in full, with both new pieces marked:

```python
import subprocess
import os  # ← new

CHECK_DIR = os.path.dirname(os.path.abspath(__file__))  # ← new

def check_inventory_cli():
    result = subprocess.run(
        ["python3", "inventory_cli.py", "inventory.json", "5"],
        capture_output=True,
        text=True,
        cwd=CHECK_DIR,  # ← new
    )
    assert result.returncode == 0
    assert result.stdout == "widgets\n"
    print("check_inventory_cli passed")

check_inventory_cli()
```

This check now does exactly what it always did — launch
`inventory_cli.py` against `inventory.json`, asking for every item under
a threshold of `5`, and confirm the one expected low-stock item,
`"widgets"`, comes back — except the subprocess it launches to do that
is now told explicitly where to look for both `inventory_cli.py` and
`inventory.json`, instead of guessing from whatever directory happened
to launch the check.

The identical fix lands in `check_inventory_end_to_end.py`, in full:

```python
import subprocess
import os  # ← new

CHECK_DIR = os.path.dirname(os.path.abspath(__file__))  # ← new

def check_inventory_end_to_end_rejects_bad_data():
    result = subprocess.run(
        ["python3", "inventory_cli.py", "inventory_bad.json", "5"],
        capture_output=True,
        text=True,
        cwd=CHECK_DIR,  # ← new
    )
    assert result.returncode == 1
    assert result.stdout == ""
    assert "gadgets" in result.stderr
    print("check_inventory_end_to_end_rejects_bad_data passed")

check_inventory_end_to_end_rejects_bad_data()
```

Same reasoning, same fix, against `inventory_bad.json` instead —
confirming `inventory_cli.py` rejects malformed data with a real,
specific message, no matter where the confirming check itself was
launched from.

### Isolating the Concept: A Script's Own Directory, Independent of the Caller

The two lines added above —
`CHECK_DIR = os.path.dirname(os.path.abspath(__file__))`, then handing
`CHECK_DIR` to `subprocess.run` as `cwd=` — are worth proving in
complete isolation, away from `inventory-report/` entirely, before
trusting them inside a real check. A throwaway scratch folder, outside
this project, holds two tiny files. The first, `child.py`, just prints
one line:

```python
print("hello from child")
```

The second, `probe.py`, sits in the same folder and does the real work:

```python
import subprocess
import os

HERE = os.path.dirname(os.path.abspath(__file__))
print("HERE:", HERE)

no_cwd = subprocess.run(["python3", "child.py"], capture_output=True, text=True)
print("without cwd=, returncode:", no_cwd.returncode)
if no_cwd.returncode != 0:
    print("  stderr:", no_cwd.stderr.strip())

with_cwd = subprocess.run(["python3", "child.py"], capture_output=True, text=True, cwd=HERE)
print("with cwd=HERE, returncode:", with_cwd.returncode, "stdout:", repr(with_cwd.stdout))
```

Run once from directly inside that scratch folder:

```text
$ python3 probe.py
HERE: /path/to/scratch/lesson137_lab
without cwd=, returncode: 0
with cwd=HERE, returncode: 0 stdout: 'hello from child\n'
```

Then the identical, unmodified `probe.py`, run again from one directory
up, addressed by its relative path instead:

```text
$ python3 lesson137_lab/probe.py
HERE: /path/to/scratch/lesson137_lab
without cwd=, returncode: 2
  stderr: python3: can't open file '/path/to/scratch/child.py': [Errno 2] No such file or directory
with cwd=HERE, returncode: 0 stdout: 'hello from child\n'
```

`HERE` printed the identical absolute path both times — this is called
**anchoring a path to the script's own location**: `os.path.dirname(os.path.abspath(__file__))`
answers "what folder am I myself sitting in," and that answer does not
change depending on which directory the command happened to be typed
from, only on where the file itself actually is on disk. The
`without cwd=` line is the one that moves: `0` (succeeded) from inside
the folder, `2` (failed, the identical "can't open file" shape already
seen against the real project above) from one level up — proving the
plain `subprocess.run(["python3", "child.py"], ...)` call, with no
`cwd=`, inherits whatever directory launched `probe.py` itself, exactly
as `check_inventory_cli.py`'s own unfixed call did. The `with cwd=HERE`
line never moves — `0`, succeeding, both times — because `HERE` was
computed from `__file__`, not inherited from anywhere. This is exactly
what `CHECK_DIR` in the real project code above is doing, isolated down
to the smallest possible pair of files that can prove it.

This throwaway pair, `child.py` and `probe.py`, is now discarded — it
never becomes part of `inventory-report/`; it existed only to prove, in
isolation and away from any of this project's own real complexity, that
`__file__`-anchored `cwd=` behaves identically regardless of caller
location, before trusting that same idiom inside a real check.

### Mechanical Walkthrough

Enumerating every distinct syntactic element of the New Code fragment
above, in order:

- **`import os`** — a module import, run once, the first time this file
  is loaded, making the standard library's `os` module — a collection of
  operating-system-related functions, `os.path` among them — available
  under the name `os` for the rest of the file. Already-familiar syntax
  (this project has imported `subprocess`, `sys`, and `json` before this
  line), still worth its own sentence here: it's the reason
  `os.path.dirname`/`os.path.abspath`, two lines down, can be called at
  all.
- **`os.path`** — attribute access on the `os` module, reaching into a
  *submodule* nested inside it, not a method call by itself — `os.path`
  by itself is a module object, the same kind of thing `os` itself is,
  just one level deeper. Every path-manipulation function this lesson
  uses lives inside it, not directly on `os`.
- **`.dirname(...)`** — a method-style call on that `os.path` submodule,
  taking one argument (a path, as a string) and returning the directory
  portion of it, discarding whatever comes after the last path
  separator. Explained fully in the Objects and methods section above;
  called here as the outermost of the two nested calls, so it runs last,
  on whatever `os.path.abspath(__file__)` (next) already produced.
- **`os.path.abspath(...)`** — the inner of the two nested calls,
  running first. Takes `__file__` as its one argument and returns the
  absolute version of it. Explained fully above; the real, run proof
  that this call is currently a no-op on this project's own Python is in
  the isolated lab just shown — `HERE` printed the same absolute path
  `abspath` would have produced even without it, because `__file__`
  already was absolute. The call stays anyway, because "already true
  today, on this one interpreter" and "guaranteed" are not the same
  claim, and this entire lesson is about code that stopped noticing the
  difference between them.
- **`__file__`** — the innermost value, evaluated first of everything on
  this line. A string, set automatically by Python's own import system
  the moment the module is loaded, naming the path used to reach it.
  Explained fully above.
- **`CHECK_DIR = ...`** — an assignment, binding the name `CHECK_DIR` to
  whatever `os.path.dirname(os.path.abspath(__file__))` evaluates to.
  Written in capital letters, matching this project's own established
  convention for a value computed once, at module load time, and never
  reassigned afterward — a reader seeing `CHECK_DIR` used anywhere below
  already knows, from the name's own casing alone, not to look for
  anywhere it might change.
- **`cwd=CHECK_DIR`** — a keyword argument added to the already-existing
  `subprocess.run(...)` call, passing the constant just computed as the
  value of `subprocess.run`'s `cwd` parameter. Explained fully in the
  Objects and methods section above — this is the one line that actually
  changes the child process's own behavior; everything else in the New
  Code exists only to compute the value handed to it.

### CS Lens

An unstated, ambient input to a function call is exactly an unlisted
parameter — the same idea computer science names **referential
transparency**: a call is only guaranteed to produce the same result
from the same declared inputs when nothing *outside* those declared
inputs can change the outcome. `open("inventory.json")` looks
referentially transparent — same string in, same file opened, every
time — right up until the process's own current working directory,
never listed anywhere in that call, turns out to be a second, hidden
input controlling which real file it actually opens. Nothing about the
five characters `"inventory.json"` changed between a passing run and a
failing one; the hidden input did.

```text
Also recognized in: containerization (a Docker image bundles its
own filesystem specifically so a build never secretly depends on
whatever is installed on the host machine building it), chroot
jails (a Unix process given a deliberately narrowed view of the
filesystem it cannot silently reach outside of), Bazel's and
Nix's own named build philosophy of hermeticity (a build that
produces identical output regardless of which machine ran it, by
refusing every ambient input that isn't explicitly declared), a
CI runner starting every job from a freshly cloned checkout (so a
build can never accidentally depend on a leftover file an
unrelated earlier job left behind), and date/time code that
silently reads a host machine's own local time zone instead of an
explicitly passed one
```

### SE Lens

The alternative not chosen here: leave both checks exactly as they
already were, and instead document, somewhere, that anyone running them
has to `cd` into `inventory-report/` first. That costs nothing to write
and is a real, legitimate option on its own. Its real failure mode is
that it only protects a caller who has already read that documentation,
at the exact moment they need it — the same shape of protection an
unenforced comment or naming convention gives: real for as long as
everyone remembers to honor it, and silently gone the moment anyone
doesn't. Every other real caller this project might eventually gain — an
IDE's own "run test" button, typically launched from a project's root
rather than the specific file being run; a future coordinated command
running every check at once instead of one `python3 check_X.py`
invocation at a time; a CI system executing from whatever directory it
happens to configure — would silently inherit the exact bug this lesson
fixes, with nothing about either check's own source warning it in
advance. Anchoring the directory inside each check's own code, once,
protects every one of those callers identically, without requiring any
of them to already know this project's own launch convention.

The real, honestly-still-open cost: `cwd=CHECK_DIR` fixes exactly one
ambient dependency — the working directory — and stops there. Both
checks still assume a program literally named `python3` is reachable at
all, with no particular version pinned or checked; they still assume
`inventory_cli.py` itself never moves to a different subdirectory
relative to the check that launches it, which would break `CHECK_DIR`'s
own usefulness immediately, since it only knows where the *check* lives,
not where every file the check depends on lives. Fixing one silent
assumption is real, verified progress — it is not proof every silent
assumption this project still carries has been found.

### Commands Needed

No new commands or tools — both checks still run the exact same way they
always have, `python3 check_inventory_cli.py` and
`python3 check_inventory_end_to_end.py`. What's new is only that the
directory they're launched *from* no longer matters, which the next
section proves directly.

### Run It

From directly inside `inventory-report/`, exactly as every prior lesson
has run these two checks:

```text
$ python3 check_inventory_cli.py
check_inventory_cli passed
$ python3 check_inventory_end_to_end.py
check_inventory_end_to_end_rejects_bad_data passed
```

From `inventory-report/`'s own parent directory — the exact command that
produced the real `AssertionError` shown at the start of this lesson,
now against the fixed files:

```text
$ python3 inventory-report/check_inventory_cli.py
check_inventory_cli passed
$ python3 inventory-report/check_inventory_end_to_end.py
check_inventory_end_to_end_rejects_bad_data passed
```

Both checks now pass identically from both locations — real, run proof
that the fix actually closes the gap the opening of this lesson
demonstrated, not just a claim that it should.

### Connecting Back

The isolated `child.py`/`probe.py` pair proved, away from any of this
project's own real complexity, exactly the mechanism `CHECK_DIR` and
`cwd=CHECK_DIR` now apply for real inside both of `inventory-report/`'s
own subprocess-launching checks — the same fix, the same two-line idiom,
now protecting the exact two files it was built to protect.

## Connect the Pieces

One concrete trace through everything this lesson built:
`check_inventory_cli.py` is loaded by the Python interpreter → `__file__`
is set automatically, before any of the file's own code runs, to this
file's own path → `os.path.abspath(__file__)` turns it into an absolute
path (a no-op today, on this project's own Python, but no longer an
assumption) → `os.path.dirname(...)` strips the filename off, leaving
only the folder → that folder is bound to `CHECK_DIR`, computed exactly
once, at import time → `check_inventory_cli()` runs, and its own
`subprocess.run` call reads `CHECK_DIR` and passes it as `cwd=` → the
operating system starts a brand-new `python3` process with its working
directory forced to `CHECK_DIR`, before that new process reads a single
line of `inventory_cli.py` → both of that new process's own relative
arguments, `"inventory_cli.py"` and `"inventory.json"`, resolve against
`CHECK_DIR` instead of whatever directory the outer check inherited →
`result.returncode` comes back `0`, `result.stdout` comes back
`"widgets\n"`, and `assert result.returncode == 0` — the exact assertion
that failed at the top of this lesson when launched from one directory
up — now holds, from anywhere.

## What Breaks Without This

Removing exactly the `cwd=CHECK_DIR,` line from `check_inventory_cli.py`
— nothing else — and running it, unmodified otherwise, from
`inventory-report/`'s own parent directory:

```text
$ python3 inventory-report/check_inventory_cli.py
Traceback (most recent call last):
  File "/path/to/inventory-report/check_inventory_cli.py", line 16, in <module>
    check_inventory_cli()
  File "/path/to/inventory-report/check_inventory_cli.py", line 12, in check_inventory_cli
    assert result.returncode == 0
           ^^^^^^^^^^^^^^^^^^^^^^
AssertionError
```

The exact same failure this lesson opened with, reproduced on purpose,
confirming the `cwd=CHECK_DIR` argument — not `CHECK_DIR`'s own
computation, not anything else changed in this lesson — is the specific
line actually holding the fix up. Restoring it:

```text
$ python3 inventory-report/check_inventory_cli.py
check_inventory_cli passed
$ python3 check_inventory_cli.py
check_inventory_cli passed
$ python3 check_inventory_end_to_end.py
check_inventory_end_to_end_rejects_bad_data passed
```

restored to passing, from `inventory-report/`'s own parent directory and
from directly inside it alike.

## Exercises

1. `detect_flaky_tests.py` (Lesson 135) takes a `check_path` argument and
   runs `subprocess.run(["python3", check_path], ...)` with no `cwd=` of
   its own. Run it against `check_low_stock_across_stores.py` from
   `inventory-report/`'s own parent directory, passing a relative
   `check_path` that assumed the caller was already inside
   `inventory-report/`. Does it fail the same way this lesson's two
   checks did, a different way, or not at all — and why might a fix
   shaped exactly like this lesson's own `CHECK_DIR` not be the right
   one for this particular file, given `check_path` is a caller-supplied
   argument rather than a name baked into the file itself?
2. Temporarily delete the `os.path.abspath(...)` call, leaving
   `CHECK_DIR = os.path.dirname(__file__)`. Rerun both checks from both
   directories. Do they still pass? Given the real, run proof in this
   lesson's own isolated lab that `__file__` was already absolute on
   this machine, what would have to be different about the machine or
   the way the script is launched for this missing call to actually
   matter?
3. Change `CHECK_DIR`'s own computation to point one directory higher
   than `inventory-report/` (wrap one more `os.path.dirname(...)` around
   it). Predict what the resulting `cwd=` will cause `python3` to report
   when it tries to open `"inventory_cli.py"`, then run it and check the
   real error against the prediction.

## Definition of Done

- [ ] `check_inventory_cli.py` and `check_inventory_end_to_end.py` both
      import `os` and compute `CHECK_DIR = os.path.dirname(os.path.abspath(__file__))`
      once, at module load time.
- [ ] Both files' own `subprocess.run` calls pass `cwd=CHECK_DIR`.
- [ ] Both checks pass when run directly from inside `inventory-report/`.
- [ ] Both checks pass when run from `inventory-report/`'s own parent
      directory — verified for real, this lesson, not assumed.
- [ ] The break/restore cycle in "What Breaks Without This" was actually
      reproduced, not paraphrased from memory of an earlier run.
- [ ] `git commit -m "Anchor subprocess checks to their own directory,
      independent of the caller's working directory"` — the message
      states why the checks needed a `cwd=` at all, not just that one
      was added.

Next: Lesson 138, Coverage.
