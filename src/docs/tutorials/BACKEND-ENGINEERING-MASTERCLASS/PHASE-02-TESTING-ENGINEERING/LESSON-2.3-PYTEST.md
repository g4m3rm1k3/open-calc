# Lesson 2.3: pytest

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Four real, run demonstrations against this project's own real `pytest` installation - proving exactly which files and functions pytest actually collects and which it silently skips, watching pytest's own assertion rewriting turn a bare `AssertionError` into a real value-by-value diff, replacing hand-written setup with a real shared fixture, and collapsing three separate hand-written checks from an earlier lesson into one real parametrized test function.

**What you need to know first:** What a unit test, an integration test, and a system test each check and why; what an `assert` statement does and what its own bare failure output actually shows; defining and calling plain Python functions and decorators.

## Terms used in this lesson

- **test discovery** — pytest's own process of scanning a directory tree for files and functions matching a plain naming convention, and collecting them as real tests to run - without any author registering each one by hand. It exists so a project never needs a manually-maintained list of "here are all my tests"; the naming convention itself is the registration.
- **assertion rewriting** — pytest's own technique of intercepting a plain `assert` statement at import time and rewriting its bytecode so that a failure reports the actual runtime values on both sides of the comparison, not just the literal source text. It exists because a bare Python `AssertionError` says nothing about what the real values actually were unless the author manually writes that into the message - assertion rewriting gets that for free, from ordinary `assert` syntax nobody had to change.
- **fixture** — A `@pytest.fixture`-decorated function that provides setup (and optional teardown) a test needs, made available to that test simply by naming the fixture as one of the test function's own parameters. It exists to separate "what does this test need to exist first" from "what does this test actually check," so many tests can share identical setup logic without copying it into every one of them.
- **fixture injection** — The mechanism by which pytest matches a test function's own parameter names against fixture names it already knows about, and calls the matching fixture function automatically before running the test - with no explicit wiring written by the test's own author. It exists so a test can simply ask for what it needs by name, rather than constructing that thing inline, itself, every single time.
- **parametrization** — `@pytest.mark.parametrize`, a real pytest decorator that runs one test function's body once per set of arguments supplied to it, generating a separate, individually-reported test case for each set. It exists so checking the same logic against several different real inputs never requires writing the same test body over and over, once per input.
- **test ID** — The real, readable name pytest generates for one specific test case, built from its function name and, for a parametrized case, the actual argument values used - `test_extract_operation_num[O1103-1]`, for instance. It exists so a reader of test output can tell, instantly, which specific case passed or failed, without having to guess from a bare line number.
- **mark (pytest marker)** — `@pytest.mark.X`, real pytest decorator syntax that attaches metadata to a test function for pytest itself (or a plugin) to inspect and act on - `parametrize` is one specific, built-in mark among several. It exists as one general mechanism for attaching many different real behaviors to a test (parametrizing it, skipping it, marking it as an expected failure) without a separate, one-off decorator syntax for each.
- **yield fixture** — A fixture written with `yield` in place of `return`, splitting its body into setup (everything before the `yield`) and teardown (everything after it); pytest runs the first half before the test and the second half after, automatically. It exists so cleanup code lives right next to the setup it's undoing, in one real function, instead of split into a separate teardown mechanism.
- **test function** — An ordinary Python function pytest recognizes, by its own naming convention, as a real test - called with no arguments (or with real fixtures injected as arguments), expected to raise nothing at all if what it checks holds true. It exists as the actual unit pytest's own discovery and reporting operate on - not a file, not a class, one specific function.
- **test session** — One full run of pytest, from the moment collection starts to the final pass/fail summary line it prints across every test it collected. It exists as the real unit pytest itself reports on - `"X passed in Y seconds"` describes one whole session, never any single test in isolation.

## Objects and methods used

- **`pytest.fixture`**
  - *What it is:* A real decorator, provided by the `pytest` package, that marks a function as a fixture pytest can inject into any test naming it.
  - *Implementation:* `@pytest.fixture` (bare) or `@pytest.fixture(scope=..., params=...)` (with real, optional arguments this lesson does not use yet) - applied directly above a function definition; by default, pytest calls the decorated function fresh for every single test that requests it.
  - *Its use:* This lesson uses it, bare, above a function that builds a real `Flask` app and enters its `app_context`, so any test naming `app` as a parameter gets that same setup automatically.
  - *Type:* A decorator function, imported from the `pytest` package.
  - *Responsibility:* Registering a function with pytest as a real, injectable source of setup (and, for a `yield`-based fixture, teardown), keyed by that function's own name.
  - *Depends on:* A function definition to decorate; nothing else.
  - *Connects to:* Applied to this lesson's own `app` fixture function; pytest itself calls that function automatically whenever a test function's own parameter list names `app`.
  - *Shape:* Decorates one function, returns a real pytest-internal fixture object wrapping it - not the function's own return value.

- **`pytest.mark.parametrize`**
  - *What it is:* A real decorator, provided by the `pytest` package, that runs one test function once per real set of arguments supplied to it.
  - *Implementation:* `@pytest.mark.parametrize("names, ...", [(values, ...), ...])` - the first argument names the test function's own parameters as a comma-separated string; the second is a real list of tuples, one tuple of real values per case pytest should generate.
  - *Its use:* This lesson uses it to run one real test function against three separate, real, already-established inputs to `STLScaffoldService._extract_operation_num`, instead of writing three near-identical test functions or three separate `assert` lines inside one.
  - *Type:* A decorator (technically a mark, accessed as `pytest.mark.parametrize`).
  - *Responsibility:* Turning one written test function into several real, independently reported test cases, each bound to its own real set of arguments.
  - *Depends on:* A test function whose parameter names match the string given as this decorator's first argument.
  - *Connects to:* Applied directly above `test_extract_operation_num`; pytest calls that function three separate times, once per real tuple in the list, each time injecting that case's own `subprogram` and `expected` values as real arguments.
  - *Shape:* Takes a parameter-name string and a list of value-tuples in; produces one real, separately-reported test case per tuple - never one merged result for the whole list.

- **`STLScaffoldService._extract_operation_num`**
  - *What it is:* A real, existing static method on this project's own `STLScaffoldService`, extracting a subprogram's leading operation-number digit from a string.
  - *Implementation:* `@staticmethod def _extract_operation_num(subprogram: str) -> str:` (`backend/app/services/stl_scaffold_service.py:231-246`) - strips a leading `O`/`o` off `subprogram`, then returns its first character if that character is a digit, otherwise the literal fallback `"0"`.
  - *Its use:* This lesson reuses it as the same real, still-untested specimen from the previous lesson, now checked under `pytest` itself instead of with a bare `assert` run directly.
  - *Type:* A `@staticmethod` on the `STLScaffoldService` class - callable directly on the class itself, with no instance ever constructed.
  - *Responsibility:* Turning a raw subprogram-name string into the single digit identifying which numbered operation it belongs to, tolerating an optional leading `O`.
  - *Depends on:* Only its own `subprogram` argument - a plain string.
  - *Connects to:* Called directly, by name, in both this lesson's assertion-rewriting lab and its parametrization lab - the same real function, checked two different ways.
  - *Shape:* Takes one string in, returns one short string out - a single digit normally, or the literal fallback `"0"` - never a list, never `None`.

- **`create_app`**
  - *What it is:* This project's real Flask application factory function.
  - *Implementation:* `def create_app(config_name: str = None) -> Flask:` (`backend/app/__init__.py:172`) - builds a `Flask` instance, loads one of `config.py`'s real config classes by name, initializes SQLAlchemy, creates database tables, seeds default users, and registers every real blueprint through `register_routes`.
  - *Its use:* This lesson calls it with the real `"testing"` config name inside its own `app` fixture, so every test that names `app` gets a fresh instance without calling this function itself.
  - *Type:* A module-level factory function (the Factory design pattern).
  - *Responsibility:* Producing one fully-configured, ready-to-use `Flask` application object from a bare config name, with no caller-visible global state left behind.
  - *Depends on:* A config name string; with none given at all, it defaults to `"development"`.
  - *Connects to:* Called once inside this lesson's own `app` fixture function, which wraps its result in `app.app_context()` before yielding it out to whichever test requested it.
  - *Shape:* Takes one optional string in, returns one fully-built `Flask` object out.

- **`Session (db.session)`**
  - *What it is:* SQLAlchemy's real database session object, `db.session`, already wired up by this app's own `create_app`.
  - *Implementation:* An instance of SQLAlchemy's `Session` class, reached through Flask-SQLAlchemy's `db.session` proxy. `.add(obj)` stages a new object for insertion; `.commit()` writes every staged change to the real database in one real transaction; `.get(Model, primary_key)` fetches one row by primary key, or `None` if it doesn't exist.
  - *Its use:* This lesson's fixture-based tests use all three again, now inside real pytest test functions instead of a standalone script, to prove a `Machine` row persists - and, in a second real test, that a nonexistent one genuinely returns `None`.
  - *Type:* A real, stateful object (SQLAlchemy's `Session`).
  - *Responsibility:* Tracking every object added to it, and coordinating a real transaction against the real (here, in-memory) database whenever told to commit.
  - *Depends on:* A live database connection, already configured by `create_app`; an active `app.app_context()` at the moment any of these are called - here, provided by this lesson's own `app` fixture.
  - *Connects to:* `.add` and `.commit` are called in `test_machine_persists`; `.get` is called in both of this lesson's fixture-based tests.
  - *Shape:* `.add` and `.commit` return nothing (`None`); `.get` returns either one real model instance or `None` - never a list.

## Concept Unit: Test Discovery - How pytest Decides What to Run

### The Problem

Every check built in the previous lesson had to be run by hand, by naming its exact file path on the command line. A real project with hundreds of test files can't work that way - something has to decide, automatically, which files and functions actually count as tests. pytest does this with a plain naming convention, not a manually-maintained list - but what exactly does that convention require, and what happens to code that doesn't match it?

Before reading on:

- Given a directory containing `test_file_naming.py` and `not_test_prefixed.py` - both containing a function starting with `test_` - which do you expect pytest to actually run if you point it at the whole directory, rather than either file by name?
- Inside one properly-named file, one function is named `test_this_gets_collected` and another is named `this_does_not_get_collected` - both contain real, executable code. What do you expect happens to the second one when pytest runs this file?

### Project Change

- **Reference Source:** No reference counterpart - a real, deliberately minimal set of files, built specifically to demonstrate pytest's own real discovery rules against itself.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - three new, standalone files; no existing project structure to place them within.
- **Dependencies:** pytest itself, already installed in this project's own backend virtual environment (version 9.1.1, confirmed this session).

### The New Code

Two properly-named files, each containing one function pytest should collect and one it should not - by function name in the first case, by file name in the second:

**File:** `verification/phase-02/lab_pytest_demo/test_function_naming.py` (new)

```python
def test_this_gets_collected():
    assert 1 + 1 == 2


def this_does_not_get_collected():
    assert 1 + 1 == 3
```

**File:** `verification/phase-02/lab_pytest_demo/test_file_naming.py` (new)

```python
def test_this_file_gets_collected():
    assert 1 + 1 == 2
```

**File:** `verification/phase-02/lab_pytest_demo/not_test_prefixed.py` (new)

```python
def test_this_file_never_gets_imported():
    assert 1 + 1 == 3
```

### Mechanical Walkthrough

- `def test_this_gets_collected(): assert 1 + 1 == 2` — A function whose name starts with `test_`, inside a file whose name also starts with `test_` - matching both of pytest's own real naming rules, so it gets collected and run; its own `assert` is deliberately correct, so it passes.
- `def this_does_not_get_collected(): assert 1 + 1 == 3` — A function in the same, already-imported file, but its own name does not start with `test_` - pytest never calls it at all, even though the file containing it was imported; its `assert` is deliberately wrong (`1 + 1 == 3`), specifically so a passing overall run proves this function's body never actually executed.
- `def test_this_file_gets_collected(): assert 1 + 1 == 2` — A second file, matching the same function-naming rule; shown separately from the first to demonstrate file-level discovery working the same way across more than one file at once.
- `def test_this_file_never_gets_imported(): assert 1 + 1 == 3 (not_test_prefixed.py)` — A function whose own name DOES start with `test_`, but it lives inside a file named `not_test_prefixed.py` - failing pytest's file-level naming rule. pytest never even imports this file during discovery, so this function's real, deliberately-wrong `assert` is never reached at all.

### Execution Trace

1. pytest scans the given path(s) for files matching its own naming rule (`test_*.py` or `*_test.py`) - `not_test_prefixed.py` fails this and is never imported, so `test_this_file_never_gets_imported`'s real, wrong `assert` is never even seen.
2. Inside each file that does match, pytest imports it and looks for functions whose own names start with `test_` - `test_this_gets_collected` matches; `this_does_not_get_collected`, in the same already-imported file, does not, and is never called.
3. pytest reports `collected 2 items` - exactly `test_this_gets_collected` and `test_this_file_gets_collected` - and actually runs both, in that order.
4. Both pass, and the real session ends with `2 passed` - neither of the two intentionally-wrong functions on disk ever executed, which is exactly why a real, wrong `assert` sitting right there in the same files did not fail this run.

### CS Lens

This is **convention over configuration**: behavior determined by following a plain, agreed-upon naming pattern, instead of an explicit list someone has to keep updated by hand. Also recognized in: Python's own `unittest` module's discovery rules (a real precursor to pytest's); Ruby on Rails' file-naming-based routing and model conventions; Maven and Gradle's standard project directory layouts; and, in this project's own domain, a CNC control's convention for naming subprograms so a main program can call them by a predictable number, with no separate lookup table to maintain.

### SE Lens

The design principle is that zero-configuration discovery reduces the chance a real test is ever accidentally left out of a run - no list to forget to update. The real alternative not chosen - a manually-maintained registry, importing and calling each test by hand - has a real, honest cost: a test can be written and simply never added to that list, silently never running, with no error from anything to notice. But the convention-based approach chosen here has its own honest, opposite failure mode: a typo in a test's own name (`tset_something` instead of `test_something`) makes pytest silently collect one fewer test than its author believes exists - with no error printed anywhere, because as far as pytest can tell, that function was simply never a test at all.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest verification/phase-02/lab_pytest_demo/test_function_naming.py verification/phase-02/lab_pytest_demo/test_file_naming.py -v` — Runs pytest, via this project's own backend virtual environment, against both properly-named files explicitly (not `not_test_prefixed.py`, which is only cited here to show what discovery skips); `-v` prints one line per collected test instead of only a summary.

### Verification

```text
============================= test session starts =============================
platform win32 -- Python 3.13.14, pytest-9.1.1, pluggy-1.6.0 -- C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\g4m3r\Documents\manufacturing-platform
collecting ... collected 2 items

verification/phase-02/lab_pytest_demo/test_function_naming.py::test_this_gets_collected PASSED [ 50%]
verification/phase-02/lab_pytest_demo/test_file_naming.py::test_this_file_gets_collected PASSED [100%]

============================== 2 passed in 0.02s ==============================
```

Full saved run: `verification/phase-02/lab_pytest_demo/discovery_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it establishes that everything pytest does from here on only ever applies to code it actually collected in the first place.

## Concept Unit: Assertions - What pytest Adds to a Bare assert

### The Problem

A previous lesson's own bare `assert` failures reported nothing about the actual wrong value unless the author manually wrote it into the message string by hand. pytest is a real testing framework, not merely a way to run scripts - what does it actually add on top of Python's own `assert` statement, for the exact same syntax, with nothing rewritten by the author at all?

Before reading on:

- Recall a bare `assert`'s own failure traceback: what specific information did it show about the actual wrong value, versus what only appeared because a message string happened to be written by hand?
- If you wrote an `assert` with a deliberately wrong expected value and ran it under `pytest`, what do you expect the failure output to show that running the same file with plain `python` would not?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Real specimen: `STLScaffoldService._extract_operation_num` again (`backend/app/services/stl_scaffold_service.py:231-246`), deliberately checked against a wrong expected value this time, specifically to observe pytest's own real failure output.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone file; no existing project structure to place it within.
- **Dependencies:** pytest, already installed in this project's backend virtual environment.

### The New Code

A deliberately wrong expectation, written once, run under `pytest` instead of directly with `python` - the point of this specimen is watching it fail:

**File:** `verification/phase-02/lab_pytest_demo/assertion_rewriting_lab.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app.services.stl_scaffold_service import STLScaffoldService


def test_deliberately_wrong_expectation():
    assert STLScaffoldService._extract_operation_num("O1103") == "9"
```

### Mechanical Walkthrough

- `sys.path.insert(0, "backend")` — The same real mechanism used throughout this curriculum's own labs so far: inserts `"backend"` at the front of Python's own import search path, so the real project package resolves without being installed.
- `from app.services.stl_scaffold_service import STLScaffoldService` — Imports the real, unmodified class this unit is about to call a method on - the same class every earlier lesson using this specimen has imported.
- `def test_deliberately_wrong_expectation():` — A real test function: an ordinary Python function whose name starts with `test_`, taking no arguments, that pytest will call with no setup of its own required.
- `assert STLScaffoldService._extract_operation_num("O1103") == "9"` — Calls the real function with `"O1103"` (whose genuinely correct answer is `"1"`), then compares the result to the deliberately wrong literal `"9"` - ordinary `assert` syntax, unchanged from every bare-assert lab in this curriculum so far; what differs is only how pytest itself is about to report its failure.

### CS Lens

This is the real difference between a bare language primitive and a **test framework** built around it: pytest's own official documentation names this specific feature "assertion rewriting" - intercepting a module's plain `assert` statements at import time and rewriting them so a failure captures both operands' real runtime values, not just the source text. Also recognized in: any xUnit-family framework's own rich assertion or matcher library (Jest's `expect(...).toBe(...)`, JUnit's `assertEquals` with its own generated diff); a debugger's live variable-inspection view versus a bare stack trace with no values attached; and, in this project's own domain, a CNC control's alarm log recording the actual out-of-range value that tripped an alarm, rather than a single generic warning light with no detail behind it.

### SE Lens

The design principle is minimizing the distance between "something is wrong" and "here is exactly what, and why." The real alternative - bare `assert`, exactly as used throughout this curriculum up to this lesson - has real, already-saved evidence of its own limit: `verification/phase-02/lab_correctness_output.txt` shows `AssertionError: expected 10 total minutes`, with the actual wrong value (`6`) visible at all only because a `print` statement one line above it happened to also show it - the `assert` failure itself carried none of that. The honest cost of bare `assert`: the burden of surfacing real values falls entirely on the author remembering to write them in by hand. The honest cost on the other side: assertion rewriting only activates for files pytest itself imports through its own import hook - the identical tiny scripts run directly with `python`, exactly as every earlier lesson's labs were, get none of this benefit; it comes from running under `pytest` specifically, not from `assert` as a language feature on its own.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest verification/phase-02/lab_pytest_demo/assertion_rewriting_lab.py -v` — Runs this one file under pytest explicitly, by its real path; pytest collects and runs the real `test_`-prefixed function inside it even though the file's own name doesn't start with `test_` - naming rules govern automatic directory discovery, not a file passed directly on the command line.

### Verification

```text
============================= test session starts =============================
platform win32 -- Python 3.13.14, pytest-9.1.1, pluggy-1.6.0 -- C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\g4m3r\Documents\manufacturing-platform
collecting ... collected 1 item

verification/phase-02/lab_pytest_demo/assertion_rewriting_lab.py::test_deliberately_wrong_expectation FAILED [100%]

================================== FAILURES ===================================
_____________________ test_deliberately_wrong_expectation _____________________

    def test_deliberately_wrong_expectation():
>       assert STLScaffoldService._extract_operation_num("O1103") == "9"
E       AssertionError: assert '1' == '9'
E
E         - 9
E         + 1

verification\phase-02\lab_pytest_demo\assertion_rewriting_lab.py:8: AssertionError
=========================== short test summary info ===========================
FAILED verification/phase-02/lab_pytest_demo/assertion_rewriting_lab.py::test_deliberately_wrong_expectation
============================== 1 failed in 0.54s ==============================
```

Full saved run: `verification/phase-02/lab_pytest_demo/assertion_rewriting_output.txt`.

### Connection to the previous unit

The previous unit showed pytest deciding what to run; this unit shows what pytest actually does once it runs it - the same `assert` syntax, with real, automatic value reporting bare Python never gave it.

## Concept Unit: Fixtures - Setup Without Repeating Yourself

### The Problem

An earlier lesson's own integration-level check had to build a real app, enter its app context, and set up a real database connection by hand, inside the one script that needed it. A real project with many tests needing that same setup would end up copying those same lines into every single one. pytest's fixtures exist to solve exactly this.

Before reading on:

- If two separate test functions both need a real, freshly-built app before they can run, what real problem occurs if each one builds its own copy of that setup code inline, separately?
- A fixture function is written with `yield` instead of `return`. Given what you already know about generators, what do you expect happens to the code written *after* the `yield` line, and when?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Real specimens, both reused fresh from an earlier lesson's own integration-level check: `create_app` (`backend/app/__init__.py:172`) and `Machine` (`backend/app/models/machine.py:41-80`), both read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone file; no existing project structure to place it within.
- **Dependencies:** pytest, already installed in this project's backend virtual environment.

### The New Code

One real fixture, building a real app once, shared by two real test functions that each ask for it by name:

**File:** `verification/phase-02/lab_pytest_demo/test_fixture_demo.py` (new)

```python
import sys
sys.path.insert(0, "backend")

import pytest
from app import create_app, db
from app.models.machine import Machine


@pytest.fixture
def app():
    app = create_app("testing")
    with app.app_context():
        yield app


def test_machine_persists(app):
    machine = Machine(id="M-FIXTURE-001", name="Fixture Mill", category="mill", sub_type="3_axis")
    db.session.add(machine)
    db.session.commit()

    fetched = db.session.get(Machine, "M-FIXTURE-001")
    assert fetched is not None
    assert fetched.name == "Fixture Mill"


def test_missing_machine_returns_none(app):
    fetched = db.session.get(Machine, "M-DOES-NOT-EXIST")
    assert fetched is None
```

### Mechanical Walkthrough

- `import pytest` — Imports the real `pytest` package itself - needed here, unlike this lesson's earlier units, because this file uses `pytest.fixture` directly by name.
- `@pytest.fixture` — Marks the function immediately below it as a real fixture, registered under the name `app` - the function's own name is what a test later requests it by.
- `def app(): app = create_app("testing")` — Builds one real `Flask` app using `TestingConfig`'s in-memory database - the identical call an earlier lesson's integration check made directly inside its own script, now isolated inside a fixture instead.
- `with app.app_context(): yield app` — Enters the app's context, then `yield`s the app out instead of `return`ing it - this is a **yield fixture**: everything before `yield` is setup, and because nothing follows the `yield` here, there's no explicit teardown code, but the `with` block itself still exits (leaving the app context) once the test that requested this fixture finishes.
- `def test_machine_persists(app):` — A real test function whose own parameter list names `app` - pytest matches that name against the fixture above and **injects** its yielded value automatically; this function never calls `create_app` itself.
- `machine = Machine(...) / db.session.add / db.session.commit / db.session.get` — The identical real persist-then-read sequence an earlier lesson's own integration check already used, now running inside a real pytest test function instead of a standalone script.
- `def test_missing_machine_returns_none(app):` — A second, separate test function, also naming `app` as a parameter - pytest calls the `app` fixture again, fresh, for this test too; by default a fixture reruns for every test that requests it, so this test gets its own brand-new, empty in-memory database, not the one the previous test already wrote a row into.
- `assert fetched is None` — Confirms that querying for a machine ID this test never inserted really does return `None` - true here specifically because this test's own fresh `app` fixture gave it a database with nothing in it yet, not the other test's row.

### Execution Trace

1. pytest collects both `test_machine_persists` and `test_missing_machine_returns_none`, and sees that each names `app` as a parameter.
2. For `test_machine_persists`, pytest calls the `app` fixture function fresh, runs it up to its `yield`, and passes the yielded app into the test as its own `app` argument.
3. `test_machine_persists` runs, builds and commits a real `Machine` row into that fixture's own fresh, in-memory database, and passes.
4. For `test_missing_machine_returns_none`, pytest calls the `app` fixture function *again*, from scratch - a second, brand-new `Flask` app with its own brand-new, empty in-memory database, completely unrelated to the first test's own.
5. `test_missing_machine_returns_none` queries that fresh, untouched database for a machine ID that was only ever inserted into the *other* test's own database, gets `None`, and passes.

### CS Lens

This is **dependency injection**: a piece of code declaring what it needs, by name, and letting something else supply it, instead of constructing that thing itself. Also recognized in: any modern web framework's own request-scoped dependency system (FastAPI's own `Depends`, for instance); a constructor accepting its collaborators as parameters instead of `new`-ing them up inside itself; JUnit 5's own `@ExtendWith`-based parameter resolution; and, in this project's own domain, a CNC program calling a tool by its assigned tool number instead of hard-coding which physical tool holder to reach for.

### SE Lens

The design principle is separating setup from the check itself, so setup logic exists in exactly one place no matter how many tests need it. The real alternative not chosen - each test function building its own app inline, the way an earlier lesson's own standalone integration script did - has a real, honest cost: any future change to how a test app gets built (a new required argument, an extra setup step) means editing every single test that duplicated that setup, one at a time. The honest cost on the other side, made concrete by this exact unit's own real behavior: a function-scoped fixture reruns its setup for every test that asks for it - real isolation between tests, which this unit's own second test genuinely depends on to pass, but also real, repeated cost paid once per test rather than once per whole run; a later lesson in this curriculum takes on exactly that scope-versus-cost tradeoff directly.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest verification/phase-02/lab_pytest_demo/test_fixture_demo.py -v` — Runs both real tests in this file under pytest, from the repository root.

### Verification

```text
============================= test session starts =============================
platform win32 -- Python 3.13.14, pytest-9.1.1, pluggy-1.6.0 -- C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\g4m3r\Documents\manufacturing-platform
collecting ... collected 2 items

verification/phase-02/lab_pytest_demo/test_fixture_demo.py::test_machine_persists PASSED [ 50%]
verification/phase-02/lab_pytest_demo/test_fixture_demo.py::test_missing_machine_returns_none PASSED [100%]

============================== warnings summary ===============================
verification/phase-02/lab_pytest_demo/test_fixture_demo.py: 12 warnings
  C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Lib\site-packages\sqlalchemy\sql\schema.py:3623: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
    return util.wrap_callable(lambda ctx: fn(), fn)  # type: ignore

-- Docs: https://docs.pytest.org/en/stable/how-to/capture-warnings.html
======================= 2 passed, 12 warnings in 1.24s ========================
```

Full saved run: `verification/phase-02/lab_pytest_demo/fixture_demo_output.txt`.

### Connection to the previous unit

The previous unit showed pytest reporting a single check's failure richly; this unit shows pytest managing what happens *before* a check even runs - and, as a real side effect of how fixtures work, quietly proves two tests stayed fully isolated from each other without either one asking for that directly.

## Concept Unit: Parametrization - One Test Function, Many Real Cases

### The Problem

An earlier lesson's own unit-level check needed three separate, hand-written `assert` lines to check `STLScaffoldService._extract_operation_num` against three real inputs. Every one of those lines repeats the same call, the same comparison, differing only in which two literal values it uses.

Before reading on:

- Given three real inputs and three real expected outputs for the same function, what would you have to change if you wanted to add a fourth real case using three separate `assert` lines, versus using one single, data-driven test?
- If one of those three real cases fails, would you rather see one combined pass/fail result for all three, or three separate, individually-named results? What does pytest's own parametrization actually give you?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Real specimen: `STLScaffoldService._extract_operation_num` again (`backend/app/services/stl_scaffold_service.py:231-246`), checked against the identical three real inputs an earlier lesson's own unit-test lab already used - `"O1103"`, `"O2104"`, and `"1103"`.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone file; no existing project structure to place it within.
- **Dependencies:** pytest, already installed in this project's backend virtual environment.

### The New Code

The same three real cases an earlier lesson checked with three separate `assert` lines, collapsed into one real, parametrized test function:

**File:** `verification/phase-02/lab_pytest_demo/test_parametrize_demo.py` (new)

```python
import sys
sys.path.insert(0, "backend")

import pytest
from app.services.stl_scaffold_service import STLScaffoldService


@pytest.mark.parametrize("subprogram, expected", [
    ("O1103", "1"),
    ("O2104", "2"),
    ("1103", "1"),
])
def test_extract_operation_num(subprogram, expected):
    assert STLScaffoldService._extract_operation_num(subprogram) == expected
```

### Mechanical Walkthrough

- `@pytest.mark.parametrize("subprogram, expected", [...])` — Names the test function's own two parameters, `subprogram` and `expected`, as a string, then supplies a real list of three tuples - one tuple per real case this test should be run against.
- `("O1103", "1"), ("O2104", "2"), ("1103", "1")` — Three real tuples, each supplying one real value for `subprogram` and the one real value `expected` should equal for that specific input - the identical three cases an earlier lesson's own hand-written `assert` lines already checked.
- `def test_extract_operation_num(subprogram, expected):` — A single test function definition, written once; its parameter names, `subprogram` and `expected`, match the string given to `parametrize` above - pytest calls this one function body three separate times, once per real tuple.
- `assert STLScaffoldService._extract_operation_num(subprogram) == expected` — Calls the real function using whichever real `subprogram` value the current case supplied, and compares it against that same case's own real `expected` value - one line of real logic, exercised three separate, real times.

### Execution Trace

```
case 1: subprogram="O1103", expected="1" -> _extract_operation_num("O1103") = "1" -> PASSED [test_extract_operation_num[O1103-1]]
case 2: subprogram="O2104", expected="2" -> _extract_operation_num("O2104") = "2" -> PASSED [test_extract_operation_num[O2104-2]]
case 3: subprogram="1103", expected="1" -> _extract_operation_num("1103") = "1" -> PASSED [test_extract_operation_num[1103-1]]
```

### CS Lens

This is **data-driven testing**: separating a test's own fixed logic from the varying data it runs against, so adding a new real case never means writing new test logic. Also recognized in: JUnit 5's own `@ParameterizedTest`; table-driven tests in Go's standard testing idiom; property-based testing frameworks that generate hundreds of real cases from a single stated property; and, in this project's own domain, running the exact same proveout procedure against several different real part numbers on the same machine, rather than writing a separate procedure per part.

### SE Lens

The design principle is that test logic and test data are two genuinely different things, and keeping them separate makes both easier to grow independently. The real alternative not chosen - three separate `assert` lines inside one test function, exactly as an earlier lesson's own unit-test lab wrote them - has a real, already-observed cost: if the first of those three `assert`s ever fails, Python raises immediately and the other two never even run in that session, so one failing case can hide whether the remaining cases would have passed or failed too. This unit's own real, saved output shows the honest difference: three separately reported results, `test_extract_operation_num[O1103-1]`, `[O2104-2]`, and `[1103-1]`, each independently PASSED - if one of the three had failed, the other two would still have run and still have been reported, on their own.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest verification/phase-02/lab_pytest_demo/test_parametrize_demo.py -v` — Runs the real parametrized test under pytest, from the repository root; `-v` shows each generated case's own real test ID on its own line.

### Verification

```text
============================= test session starts =============================
platform win32 -- Python 3.13.14, pytest-9.1.1, pluggy-1.6.0 -- C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\g4m3r\Documents\manufacturing-platform
collecting ... collected 3 items

verification/phase-02/lab_pytest_demo/test_parametrize_demo.py::test_extract_operation_num[O1103-1] PASSED [ 33%]
verification/phase-02/lab_pytest_demo/test_parametrize_demo.py::test_extract_operation_num[O2104-2] PASSED [ 66%]
verification/phase-02/lab_pytest_demo/test_parametrize_demo.py::test_extract_operation_num[1103-1] PASSED [100%]

============================== 3 passed in 0.47s ==============================
```

Full saved run: `verification/phase-02/lab_pytest_demo/parametrize_demo_output.txt`.

### Connection to the previous unit

The previous unit removed repeated setup code with a shared fixture; this unit removes repeated test *logic* the same way, with shared data instead - the same underlying idea, "stop repeating yourself," applied to the other half of a test.

## Connect the pieces

A directory holding two correctly-named real files and two deliberately-wrong functions that should never run - pytest collects exactly the two that follow its own naming convention, and reports `2 passed`, proving the other two never executed at all (test discovery). The same real, currently-untested `_extract_operation_num`, checked against a deliberately wrong value - not with a hand-written message, but with pytest's own assertion rewriting automatically reporting the real `'1' == '9'` comparison and a real diff (assertions). One real `app` fixture, built once, requested by name from two separate real tests - one persisting a `Machine` row, the other proving a completely fresh, untouched database backs the second test, with no isolation code written by hand (fixtures). And the exact same three real inputs an earlier lesson checked with three separate `assert` lines, now run as three separately reported real cases from one written test function (parametrization). Four real pytest features, each one solving a real, already-felt gap this curriculum's own earlier bare-`assert` labs left open.

**Next lesson:** This lesson's own fixture unit already surfaced something real and a little surprising: two tests requesting the same fixture got two completely separate, unrelated databases, with no shared state between them at all. Next, that real behavior - and what happens when a test's own setup *isn't* that clean, whether it depends on something left over from a previous run or shares a resource another test is also touching - gets a name, and a real, deliberate treatment of its own.