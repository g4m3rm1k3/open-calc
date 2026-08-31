# Lesson 2.9: TDD

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** One real, complete RED-GREEN-REFACTOR cycle, from scratch - a real test that fails because the code it checks doesn't exist yet, a real, minimal implementation that makes it pass, and a real internal rewrite that changes nothing the test can see - building a small, genuinely new, reusable version of validation logic this project's own real `update_machine_status` route already has to satisfy the exact same real requirement. Then, a direct comparison against this phase's own characterization testing, to settle when each real discipline actually applies.

**What you need to know first:** What a characterization test is, and why it records observed behavior instead of intended behavior; what refactoring safety means and how a test proves it; what pytest's own test discovery and parametrization do.

## Terms used in this lesson

- **test-driven development (TDD)** — A real development discipline where a failing test for a specific, wanted behavior is written *before* the code that satisfies it, and that test is what drives what gets built next - never the reverse. It exists to keep every real line of production code traceable to a specific, already-stated requirement, rather than writing code first and hoping tests catch up to it afterward.
- **RED** — The first real step of one TDD cycle: writing a test for behavior that doesn't exist yet, and confirming, by actually running it, that it fails - not skipped, not silently wrong, a real, observed failure. It exists to prove the test itself is genuinely capable of failing, before it's ever trusted to prove anything passing.
- **GREEN** — The second real step of one TDD cycle: writing the smallest real amount of production code that makes the currently-failing test pass, and nothing more. It exists to keep every real line of code justified by a specific, already-failing test, rather than building more than what's actually required right now.
- **REFACTOR** — The third real step of one TDD cycle: improving the real, already-passing code's own internal structure, with the exact same test suite, unedited, confirming nothing about its external behavior moved. It exists as the identical real discipline an earlier lesson already proved under the name refactoring safety, now scheduled as a deliberate, required step in every single TDD cycle, not an occasional afterthought.

## Objects and methods used

- **`is_valid_machine_status`**
  - *What it is:* A new, real, small function this lesson builds from nothing, through a real RED-GREEN-REFACTOR cycle - not a real, existing part of this project's backend, and never wired into it.
  - *Implementation:* Its first, GREEN real form: `def is_valid_machine_status(status): return status in ["available", "running", "offline", "maintenance"]`; its final, REFACTORED real form: `VALID_MACHINE_STATUSES = frozenset({"available", "running", "offline", "maintenance"})` followed by `def is_valid_machine_status(status): return status in VALID_MACHINE_STATUSES` - both real forms pass the identical real test suite.
  - *Its use:* This lesson builds it to do exactly what this project's own real `update_machine_status` route already checks inline (`backend/app/routes/machines.py:98-100`) - whether a given status string is one of four real allowed values - as a reusable, independently testable function.
  - *Type:* A module-level function, defined in a new, standalone module.
  - *Responsibility:* Answering one real, narrow question - is this string one of the four real, allowed machine statuses - with no side effects and no dependency on a database, an app, or any other real collaborator.
  - *Depends on:* Only its own `status` argument - a plain string.
  - *Connects to:* Not called from anywhere in the real backend - this lesson builds it as a genuinely new, standalone piece of logic, never wired into `update_machine_status` itself.
  - *Shape:* Takes one string in, returns one real `bool` out - `True` for exactly the same four real values this project's own route already treats as valid, `False` for anything else.

- **`ModuleNotFoundError`**
  - *What it is:* A real, built-in Python exception, raised when an `import` statement names a module Python cannot find anywhere on its search path.
  - *Implementation:* A subclass of Python's built-in `ImportError`; raised automatically by Python's own import machinery, carrying the real, missing module's name in its message.
  - *Its use:* This lesson's own first, RED run raises this real exception - confirmed this session - the moment pytest tries to import a test module that itself imports a function from a file that doesn't exist yet.
  - *Type:* A built-in exception class.
  - *Responsibility:* Reporting, specifically, that an entire named module could not be located - a more precise real signal than a generic `ImportError`, which also covers a module that *was* found but failed partway through importing.
  - *Depends on:* An `import` statement (or `from ... import ...`) naming a module Python's own import system genuinely cannot find.
  - *Connects to:* Raised while pytest is collecting `test_tdd_valid_status.py`, before a single real test in it ever runs - this lesson's own real RED state.
  - *Shape:* A single exception object, carrying a real message naming the missing module - not a return value; its presence is what stops collection entirely.

## Concept Unit: RED - A Failing Test for Something That Doesn't Exist Yet

### The Problem

This project's own real `update_machine_status` route checks a status string against four real allowed values, inline, every time it runs (`backend/app/routes/machines.py:98-100`). That same real check, worth reusing and testing on its own, doesn't exist as its own function anywhere yet. What does starting from a real test for code that isn't written yet actually look like?

Before reading on:

- A test importing `is_valid_machine_status` from a module named `valid_status` is about to run, but no file named `valid_status.py` exists yet anywhere this test can find it. What real kind of failure do you expect - a normal test failure, reported per case, or something that happens before any test case even runs?
- This unit's own real test already lists six real cases - four real, valid statuses and two real, invalid ones - before any implementation exists at all. What does writing the cases first, this way, force the test's own author to decide about the function's real behavior before writing a single line of it?

### Project Change

- **Reference Source:** No reference counterpart - this is a genuinely new, from-scratch function, not a port of anything already in `backend/`. Real motivating evidence: `backend/app/routes/machines.py:98-100`, read again this session - the real, inline check this new function is meant to reusably replace, never itself edited by this lesson.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone test file; no existing project structure to place it within.
- **Dependencies:** pytest, already installed in this project's backend virtual environment; deliberately, no real `valid_status` module yet.

### The New Code

A real test, for a real function that doesn't exist yet anywhere on disk:

**File:** `verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py` (new)

```python
import pytest
from valid_status import is_valid_machine_status


@pytest.mark.parametrize("status, expected", [
    ("available", True),
    ("running", True),
    ("offline", True),
    ("maintenance", True),
    ("not_a_real_status", False),
    ("", False),
])
def test_is_valid_machine_status(status, expected):
    assert is_valid_machine_status(status) == expected
```

### Mechanical Walkthrough

- `from valid_status import is_valid_machine_status` — An ordinary import statement - except, deliberately, at the moment this file is first written, no `valid_status.py` exists anywhere pytest can find it; this line is written first anyway, stating exactly what the not-yet-written code will be named and where it will live.
- `@pytest.mark.parametrize("status, expected", [("available", True), ..., ("", False)])` — The same real pytest construct reused from earlier lessons, now carrying six real cases decided *before* any real implementation exists - four of this project's own real, valid status strings, plus two real invalid ones, including a real, deliberately empty string.
- `def test_is_valid_machine_status(status, expected): assert is_valid_machine_status(status) == expected` — One real test function, calling a real function that doesn't exist yet - not a mistake, the entire real point of this step: the test states what's wanted before anything satisfies it.

### CS Lens

This is **RED**, TDD's own first real step - and specifically a real *collection* failure, not a *test* failure: pytest never gets as far as running any of the six real parametrized cases, because the module they depend on doesn't exist at all yet. Also recognized in: a compiler's own "undefined reference" error for a function declared but not yet implemented; an interface defined in a strongly-typed language before any class implements it; a project management practice of writing a ticket's acceptance criteria before any code against it exists; and, in this project's own domain, a part print's own dimensional tolerances specified before the first article is ever machined to check against them.

### SE Lens

The design principle is that a test's own real ability to fail is itself something worth proving, not assumed. The real alternative not chosen - writing `is_valid_machine_status` first, then writing a test against it afterward - risks a real, specific failure mode this step exists to rule out: a test that would pass regardless of whether the code under it is actually correct, because it was written to match whatever the code already did, rather than stating a real requirement independently first. The honest cost of RED: this step, by itself, produces nothing runnable yet - only a real, confirmed absence, which only pays off once the next two steps follow it.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py -v` — Runs this test under pytest, from the repository root, before `valid_status.py` exists anywhere in the real, committed project.

### Verification

```text
============================= test session starts =============================
platform win32 -- Python 3.13.14, pytest-9.1.1, pluggy-1.6.0 -- C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\g4m3r\Documents\manufacturing-platform
collecting ... collected 0 items / 1 error

=================================== ERRORS ====================================
_ ERROR collecting verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py _
ImportError while importing test module 'C:\Users\g4m3r\Documents\manufacturing-platform\verification\phase-02\lab_pytest_demo\test_tdd_valid_status.py'.
Hint: make sure your test modules/packages have valid Python names.
Traceback:
C:\Program Files\WindowsApps\PythonSoftwareFoundation.Python.3.13_3.13.3824.0_x64__qbz5n2kfra8p0\Lib\importlib\__init__.py:88: in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
verification\phase-02\lab_pytest_demo\test_tdd_valid_status.py:2: in <module>
    from valid_status import is_valid_machine_status
E   ModuleNotFoundError: No module named 'valid_status'
=========================== short test summary info ===========================
ERROR verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py
!!!!!!!!!!!!!!!!!!! Interrupted: 1 error during collection !!!!!!!!!!!!!!!!!!!!
============================== 1 error in 0.08s ==============================
```

Full saved run: `verification/phase-02/lab_pytest_demo/tdd_red_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it establishes the real requirement, stated as a real, currently-failing test, that every later unit in this lesson exists to satisfy.

## Concept Unit: GREEN - The Smallest Real Change That Passes

### The Problem

The previous unit's real test names exactly what's wanted, and currently can't even run. What is the smallest real amount of new code that turns that real failure into a real pass?

Before reading on:

- The previous unit's own six real cases are already fully known. Given that, what is the smallest real Python expression you can think of that would make all six pass, without writing more logic than those six cases actually require?
- "The smallest real change that passes" is a real constraint on this step, not just a matter of style. What real problem would writing much more code than necessary here - handling cases the current test never asks about - actually risk?

### Project Change

- **Reference Source:** No reference counterpart - this unit's own new file is the first real implementation, written specifically to satisfy the previous unit's already-written test.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone file; no existing project structure to place it within.
- **Dependencies:** The previous unit's own `test_tdd_valid_status.py`, unedited.

### The New Code

The smallest real function satisfying all six of the previous unit's own cases:

**File:** `verification/phase-02/lab_pytest_demo/valid_status.py` (new)

```python
def is_valid_machine_status(status):
    return status in ["available", "running", "offline", "maintenance"]
```

### Mechanical Walkthrough

- `def is_valid_machine_status(status):` — A real function definition, matching exactly the name and single-argument shape the previous unit's own test already imports and calls - nothing about its signature was invented independently of what the test already required.
- `return status in ["available", "running", "offline", "maintenance"]` — A real, literal list of exactly the four real strings the previous unit's own test expects `True` for; the real `in` operator checks real membership, returning `True` or `False` directly - genuinely the smallest real logic that satisfies all six of the previous unit's own cases, with nothing extra (no type checking, no case-insensitivity, no handling for `None`) added in anticipation of a case the current real test never asks about.

### CS Lens

This is **GREEN**, TDD's own second real step - and specifically an instance of **YAGNI** ("You Aren't Gonna Need It"), a real, named principle against building capability a currently-known requirement doesn't actually call for. Also recognized in: the broader real engineering habit of shipping the minimum real, working slice of a feature before its full, generalized version; a scientific experiment's own minimal apparatus, built only capable of testing the specific real hypothesis at hand; a prototype circuit built to prove one real signal path before a production board is designed around it; and, in this project's own domain, a first-article setup proving one specific real cut before a full production run is programmed around it.

### SE Lens

The design principle is that untested code is a real, unverified liability, so the honest goal of this step is passing the real test that exists, not anticipating tests that don't. The real alternative not chosen - writing a more "complete" real implementation up front (validating the input's real type, normalizing case, handling `None`) - might feel more professional, but every one of those real behaviors would be genuinely untested the moment this step ends, since none of them is checked by the previous unit's own six real cases. The honest cost of the minimal version actually written: it's real, deliberately unfinished-looking code - a hard-coded literal list, not yet a named constant - which is exactly what the next real step exists to address, on purpose, not by accident.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py -v` — The identical real command as the previous unit, from the repository root - now that `valid_status.py` exists.

### Verification

```text
============================= test session starts =============================
platform win32 -- Python 3.13.14, pytest-9.1.1, pluggy-1.6.0 -- C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\g4m3r\Documents\manufacturing-platform
collecting ... collected 6 items

verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py::test_is_valid_machine_status[available-True] PASSED [ 16%]
verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py::test_is_valid_machine_status[running-True] PASSED [ 33%]
verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py::test_is_valid_machine_status[offline-True] PASSED [ 50%]
verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py::test_is_valid_machine_status[maintenance-True] PASSED [ 66%]
verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py::test_is_valid_machine_status[not_a_real_status-False] PASSED [ 83%]
verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py::test_is_valid_machine_status[-False] PASSED [100%]

============================== 6 passed in 0.03s ==============================
```

Full saved run: `verification/phase-02/lab_pytest_demo/tdd_green_output.txt`.

### Connection to the previous unit

The previous unit stated the requirement as a real, failing test; this unit satisfies it with the smallest real amount of code that actually could.

## Concept Unit: REFACTOR - Improving the Code, Not the Behavior

### The Problem

The previous unit's own real implementation works, but its literal list of four real strings is repeated, unnamed, exactly where a future reader would have to recognize what it means without any label. Can it be restructured for real without touching what the previous two units already proved about its behavior?

Before reading on:

- A `frozenset` and a `list` both support the real `in` operator. Given this lesson's own earlier work on real, measured performance differences between approaches, what real advantage might a `frozenset` have here beyond just being "more readable"?
- This unit's own real test file is not going to change at all. Given that, what would count as real, honest proof that this step's own changes didn't alter the function's real, external behavior?

### Project Change

- **Reference Source:** No reference counterpart - this unit restructures the previous unit's own new file, not any real backend code.
- **Files affected:** None
- **Change type:** modify
- **Location:** `verification/phase-02/lab_pytest_demo/valid_status.py`, the previous unit's own file.
- **Dependencies:** The exact same, unedited test file from the first unit.

### The New Code

The same real behavior, restructured - a real, named constant replacing the previous unit's own bare literal list:

**File:** `verification/phase-02/lab_pytest_demo/valid_status.py` (already exists — modified)

```python
VALID_MACHINE_STATUSES = frozenset({"available", "running", "offline", "maintenance"})  # <- new


def is_valid_machine_status(status):
    return status in VALID_MACHINE_STATUSES  # <- new
```

### The Updated Project

The complete, real file after refactoring - both real lines replacing the previous unit's own two-line version entirely:

**File:** `verification/phase-02/lab_pytest_demo/valid_status.py`

```python
VALID_MACHINE_STATUSES = frozenset({"available", "running", "offline", "maintenance"})  # <- new


def is_valid_machine_status(status):
    return status in VALID_MACHINE_STATUSES  # <- new
```

### Mechanical Walkthrough

- `VALID_MACHINE_STATUSES = frozenset({"available", "running", "offline", "maintenance"})` — A real, module-level named constant, in real `UPPER_SNAKE_CASE` (the same convention this project's own real code, such as `ALLOWED_MODEL_EXTENSIONS` in `backend/config.py`, already follows) - giving the previous unit's own bare list of four real strings an actual name a reader can recognize, and a real `frozenset` instead of a `list`, whose own real membership check (`in`) runs in real, constant time regardless of size, rather than checking each element in turn.
- `def is_valid_machine_status(status): return status in VALID_MACHINE_STATUSES` — The identical real function signature and real `in` check as the previous unit's own version - only what's on the right-hand side of `in` changed, from a literal list written inline to a real, named reference to the constant just defined above it.

### Execution Trace

1. The previous unit's own real test suite - six parametrized cases, completely unedited - is re-run against this real, restructured file.
2. Each of the six real calls to `is_valid_machine_status` now checks membership against `VALID_MACHINE_STATUSES` (a real `frozenset`) instead of the previous unit's own inline list - real, different internal work, for the identical real strings being asked about.
3. All six real results are identical to the previous unit's own run - `True` for the same four real values, `False` for the same two - because the real *set* of values checked against never changed, only its own real, internal representation did.
4. pytest reports `6 passed` again, with the exact same real test IDs as the previous unit's own run - the concrete, real proof this restructuring changed nothing this test suite can observe.

### CS Lens

This is **REFACTOR**, TDD's own third real step - the identical real discipline an earlier lesson in this curriculum already named refactoring safety, now made a required, scheduled part of every single TDD cycle rather than something reached for only when a change already feels risky. Also recognized in: a compiler's own optimization passes, required to preserve a program's exact real semantics while changing its real, generated instructions; a database index added to speed up a real query with no change to that query's own real results; a code review practice explicitly separating "does this still work" from "is this well-written," checked one after the other; and, in this project's own domain, a fixture redesigned for faster real changeovers between parts, while still holding every part to the exact same real tolerances as before.

### SE Lens

The design principle is that "working" and "well-structured" are two genuinely separate real properties, and TDD's own cycle checks them at two separate, deliberate moments rather than trying to get both at once. The real alternative not chosen - writing the `frozenset`-based version directly, back in the GREEN step - would have worked too, but blurs exactly the two real questions this three-step cycle exists to keep separate: "does this satisfy the requirement" and "is this the best real shape for that logic," answered together instead of in sequence. The honest cost of refactoring as its own, separate, required step: it's real, additional real effort spent on code that already passes every real test it has - effort that pays off specifically in how readable and maintainable the real result is, not in any new real behavior it adds.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py -v` — The identical real command as the previous two units, from the repository root - re-run one final time against the refactored file.

### Verification

```text
============================= test session starts =============================
platform win32 -- Python 3.13.14, pytest-9.1.1, pluggy-1.6.0 -- C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\g4m3r\Documents\manufacturing-platform
collecting ... collected 6 items

verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py::test_is_valid_machine_status[available-True] PASSED [ 16%]
verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py::test_is_valid_machine_status[running-True] PASSED [ 33%]
verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py::test_is_valid_machine_status[offline-True] PASSED [ 50%]
verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py::test_is_valid_machine_status[maintenance-True] PASSED [ 66%]
verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py::test_is_valid_machine_status[not_a_real_status-False] PASSED [ 83%]
verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py::test_is_valid_machine_status[-False] PASSED [100%]

============================== 6 passed in 0.03s ==============================
```

Full saved run: `verification/phase-02/lab_pytest_demo/tdd_refactor_output.txt`.

### Connection to the previous unit

The previous unit made the test pass with the smallest real amount of code; this unit improves that code's own real shape without touching what "pass" means at all - completing this lesson's own first full, real cycle.

## Concept Unit: TDD vs. Characterization - Two Different Real Starting Points

### The Problem

This lesson's own three units and this phase's own characterization testing both start by writing a real test before touching the code it concerns. Given that surface similarity, what actually tells them apart?

Before reading on:

- This lesson's own RED test named exactly six cases, decided entirely by the test's own author, before any implementation existed. Could a characterization test for an already-existing function ever be written the same way - deciding its expected values without first running the real code?
- If `is_valid_machine_status` had already existed, untested, with some real, surprising behavior nobody had verified - the same real shape as `_extract_operation_num`'s own `"O99" -> "9"` result - would writing tests for it still count as this lesson's own kind of RED?

### Project Change

- **Reference Source:** No reference counterpart - this unit compares two already-real, already-shown pieces of evidence: this lesson's own `test_tdd_valid_status.py` (Unit 1, above) and `test_characterize_extract_operation_num.py`, the real, parametrized characterization test built earlier in this same phase.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a comparison unit; no new code is written here.
- **Dependencies:** Both real files already exist and are unedited by this unit.

### The New Code

The two real test files' own defining lines, side by side - both already shown in full elsewhere in this curriculum, neither edited here:

**File:** `verification/phase-02/lab_pytest_demo/test_tdd_valid_status.py` (already exists — read-only, nothing to type)

```python
@pytest.mark.parametrize("status, expected", [
    ("available", True),
    ("running", True),
    ("offline", True),
    ("maintenance", True),
    ("not_a_real_status", False),
    ("", False),
])
def test_is_valid_machine_status(status, expected):
    assert is_valid_machine_status(status) == expected
```

**File:** `verification/phase-02/lab_pytest_demo/test_characterize_extract_operation_num.py` (already exists — read-only, nothing to type)

```python
@pytest.mark.parametrize("subprogram, current_real_behavior", [
    ("O1103", "1"),
    ("1103", "1"),
    ("OAB", "0"),       # no digit after stripping O/o - falls back to "0"
    ("", "0"),          # empty string - falls back to "0"
    ("O", "0"),         # just the letter - falls back to "0"
    ("ooo5", "5"),      # lstrip("o") strips ALL leading lowercase o's, not one
    ("O99", "9"),       # only the FIRST digit is kept - "99" becomes "9", not "99"
    ("0123", "0"),      # a leading real zero is itself treated as the operation number
])
def test_extract_operation_num_current_behavior(subprogram, current_real_behavior):
    assert S._extract_operation_num(subprogram) == current_real_behavior
```

### Mechanical Walkthrough

- `test_is_valid_machine_status: expected values decided before is_valid_machine_status existed at all` — Every real expected value in this file's own parametrize list was written down *before* any implementation existed to run against - `("available", True)` states a real requirement, not an observation; nothing about it could have been discovered by running code, because there was no code yet to run.
- `test_extract_operation_num_current_behavior: expected values decided by running already-existing code` — Every real expected value in this second file's own parametrize list - including the genuinely surprising `("O99", "9")` - was written down *after* actually running the real, already-existing `_extract_operation_num` and observing what it did; none of these six values were decided by an author's own intention first.
- `inline comments present only in the characterization file` — The characterization test carries real, explanatory comments next to several of its own cases (`# only the FIRST digit is kept...`) - present specifically because those real values needed explaining once they were discovered; the TDD test's own six cases need no such comments, because each one is already exactly what its author meant by writing it.

### Mental Model

```text
TDD (this lesson's own Units 1-3)          Characterization (this phase's own earlier lesson)
       |                                            |
       v                                            v
no implementation exists yet                real implementation already exists, untested
       |                                            |
       v                                            v
author DECIDES expected values              author RUNS the real code to OBSERVE actual values
       |                                            |
       v                                            v
RED: test fails - code is missing            test passes immediately - it only records what's real
       |                                            |
       v                                            v
GREEN: write code to match the test           (nothing to write - the test already matches reality)
       |                                            |
       v                                            v
REFACTOR: restructure, same test stays green   REFACTOR: only safe once real callers are known
```

### CS Lens

This is the real, structural difference between **specification- first** and **observation-first** testing - both are real disciplines that put a test before a code change, but they answer two genuinely different questions: "what should this do" versus "what does this actually do." Also recognized in: a formal specification written before an implementation (specification- first) versus reverse-engineering a spec from an already-shipped, undocumented binary (observation-first); a new API designed test-first against a not-yet-built service, versus a contract test written against an already-live one; and, in this project's own domain, a new part designed to a print's own stated tolerances before it exists, versus measuring an already-manufactured part with unknown provenance to find out what it actually is.

### SE Lens

The design principle is that the right real discipline depends entirely on whether the code already exists and already has real callers. TDD's own real alternative - writing `is_valid_machine_status` first, then testing it - was specifically rejected by this lesson's own Unit 1, for genuinely new code with no real behavior yet to observe. The characterization alternative - deciding what `_extract_operation_num` *should* do and writing a test asserting that, ignoring its real, current behavior - would have been actively dangerous for that specimen: this phase's own earlier lesson showed a "should" test would have silently conflicted with real, existing behavior nobody had confirmed was safe to change, with no real caller's assumptions accounted for. The honest, combined cost: a real project needs both disciplines, applied to the right real code - using TDD on already-existing, unowned behavior risks quietly overwriting something a real caller depends on; using characterization on brand-new code makes no sense at all, since there is nothing yet to observe.

### Verification

This unit draws only on two real test files' own already-run, already-saved output, both shown and verified earlier in this curriculum - no new code is written or executed here to compare them.

### Connection to the previous unit

The previous three units completed one full, real TDD cycle; this unit places that entire cycle side by side with this phase's own earlier characterization work, closing the lesson - and this phase - by naming exactly what separates them.

## Connect the pieces

One real test, importing a function that exists nowhere yet, failing with a real `ModuleNotFoundError` before a single one of its six parametrized cases ever runs (RED). The smallest real function that satisfies all six - a bare, literal list of four real strings - turning that same real failure into `6 passed` (GREEN). That same real function, restructured into a named `frozenset` constant, run against the identical, unedited real test suite, still `6 passed` - real proof its internal shape changed while its real, external behavior did not (REFACTOR). And, last, that same real cycle held up next to this phase's own earlier characterization test on `_extract_operation_num`: one test whose real, expected values were decided before any code existed to check them against, the other whose real, expected values - including a genuinely surprising one - were only ever discoverable by running code that was already there (TDD vs. characterization). Two real, complementary disciplines, each answering a different real question, and this whole phase's own real argument for asking either one in a form a machine actually checks, rather than trusting either answer from memory.

**Next lesson:** Every real check this phase built - correctness, isolation, doubles, HTTP behavior, golden behavior, and now two complete, real testing disciplines - has been in service of one goal: knowing exactly what this project's real backend does before anything about it changes. That is the real foundation the next phase of this curriculum builds its first real rebuild on top of.