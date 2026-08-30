# Lesson 2.4: Test Isolation

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A real, deliberately broken pair of tests that interfere with each other through one shared database, fixed by changing nothing but a fixture's own scope; a real, six-times-run demonstration of a genuinely flaky test next to a real, seeded fix that stays consistent across the same number of real runs; and a real proof that this project's own safe-for-testing app config still leaves file storage pointed at a real, permanent, already-populated directory in the real repository.

**What you need to know first:** What a fixture is and how pytest injects one into a test by name; what a unit test, an integration test, and a system test each check; what pytest's own assertion rewriting shows on a real failure.

## Terms used in this lesson

- **shared state** — Data or a resource more than one test can read or write, where a value one test leaves behind can affect another test's own outcome. It exists to name exactly the property that makes two tests fail to be independent - not shared *code* (which is fine), but a shared, mutable, persisted resource sitting between them.
- **independent tests** — Tests whose outcome does not depend on whether, or in what order, any other test has already run. It exists because a suite where tests quietly depend on each other's side effects can pass or fail differently purely based on run order - a property invisible from reading any single test's own body in isolation.
- **deterministic test** — A test that, given the same real code, produces the same real result every single time it runs - regardless of when, how many times, or in what order it runs. It exists because a test whose result depends on something outside anyone's control (the current time, an unseeded random number, unordered iteration) cannot reliably distinguish "this broke" from "this was never guaranteed to begin with."
- **flaky test** — A real test that sometimes passes and sometimes fails against the exact same, completely unchanged code - the directly observable symptom of a test that isn't deterministic. It exists as the practical, felt cost of non-determinism: once a team stops trusting one test's own failure to mean something real, trust in the whole suite erodes with it.
- **temporary resource** — A real file, directory, or other durable resource created specifically for one test's own use and safely removed afterward, so nothing the test needed to run leaves anything permanent behind. It exists so tests that must do real I/O can still avoid the two real risks permanent test resources create: polluting real, permanent state, and leftover files quietly affecting a later run.
- **fixture scope** — How many times, and shared across how many tests, a fixture's own setup actually runs before being torn down - `function` (the default: fresh for every single test), `module` (once per file), `session` (once for a whole real run), among others. It exists because a fixture's own scope is the exact, real lever deciding whether two tests sharing it stay isolated from each other or not.
- **random seed** — A starting value handed to a pseudo-random number generator that makes its entire future sequence of "random" values fully reproducible - the same seed always produces the same sequence. It exists so code that genuinely needs randomness can still be tested deterministically, by controlling the one input that would otherwise make its output different every time.

## Objects and methods used

- **`pytest.fixture(scope=...)`**
  - *What it is:* The same real `pytest.fixture` decorator from an earlier lesson, now used with its real `scope` keyword argument.
  - *Implementation:* `@pytest.fixture(scope="module")` - accepts a real string (`"function"`, the default; `"module"`; `"class"`; `"session"`, among others) controlling how many real tests share one call to the fixture function before pytest tears it down and calls it again.
  - *Its use:* This lesson uses `scope="module"` first, deliberately, to make two tests share one real app and one real database - then removes it, returning to the bare `@pytest.fixture` default, to fix the exact same two tests.
  - *Type:* A decorator, called with a keyword argument, from the `pytest` package.
  - *Responsibility:* Controlling a fixture's own real lifetime - how long its setup stays valid, and how many real tests reuse that same setup before pytest builds a fresh one.
  - *Depends on:* A function definition to decorate; an optional `scope` string.
  - *Connects to:* Applied to this lesson's own `shared_app` fixture in its first, broken form; the second, fixed form drops the argument entirely, returning to the same bare `@pytest.fixture` an earlier lesson already used.
  - *Shape:* Decorates one function; the real difference `scope` makes is entirely in *when* pytest calls that function again, never in what the function itself returns or yields.

- **`Query (Machine.query / .count())`**
  - *What it is:* SQLAlchemy's real query interface, reached through a model class's own `.query` attribute.
  - *Implementation:* `Machine.query` returns a real SQLAlchemy `Query` object scoped to the `machines` table; `.count()` is a real method on that object, issuing a real `SELECT COUNT(*)`-shaped query and returning a plain integer.
  - *Its use:* This lesson uses `Machine.query.count()` to check, directly and numerically, exactly how many real rows exist in the database at a given moment - the precise question shared state either answers correctly or doesn't.
  - *Type:* A class-level attribute (`Machine.query`) returning an object (`Query`), with `.count()` as a real instance method on that object.
  - *Responsibility:* Letting real Python code ask real questions about a table's real current contents without writing raw SQL by hand.
  - *Depends on:* A live database connection and an active `app.app_context()` - the same real requirements every database-touching lab in this curriculum has needed since it was first introduced.
  - *Connects to:* Called directly inside both of this unit's real test functions, in both the broken and fixed versions - the only thing that differs between the two versions is what value it actually returns.
  - *Shape:* Takes nothing in beyond the query already built; returns one plain `int` out - never a list of rows, never `None`.

- **`create_app`**
  - *What it is:* This project's real Flask application factory function.
  - *Implementation:* `def create_app(config_name: str = None) -> Flask:` (`backend/app/__init__.py:172`) - builds a `Flask` instance, loads one of `config.py`'s real config classes by name, and initializes SQLAlchemy, among other real setup steps.
  - *Its use:* This lesson calls it with `"testing"` inside every fixture it builds, and separately uses it to prove a real gap in what that config name actually isolates.
  - *Type:* A module-level factory function (the Factory design pattern).
  - *Responsibility:* Producing one fully-configured, ready-to-use `Flask` application object from a bare config name.
  - *Depends on:* A config name string; with `"testing"`, real evidence in this lesson's own last unit shows it overrides `SQLALCHEMY_DATABASE_URI` but leaves `UPLOAD_FOLDER` completely untouched.
  - *Connects to:* Called inside every fixture this lesson defines; its real, returned `app.config` is inspected directly in this lesson's own temporary-resources unit.
  - *Shape:* Takes one optional string in, returns one fully-built `Flask` object out.

- **`random (seed / random)`**
  - *What it is:* Python's own standard library `random` module, providing a real pseudo-random number generator.
  - *Implementation:* `random.random() -> float` returns a real pseudo-random value in `[0.0, 1.0)`, drawing from the module's own internal, shared generator state; `random.seed(value)` resets that shared state so every subsequent call to `random.random()` (or any other function in the module) produces a fully reproducible sequence from that point on.
  - *Its use:* This lesson calls `random.random()` with no seed to build a genuinely, really flaky test, then calls `random.seed(42)` twice in a row, immediately before two separate calls to `random.random()`, to prove the exact same value comes back both times.
  - *Type:* A standard library module; `random` and `seed` are both real functions inside it.
  - *Responsibility:* Providing real pseudo-randomness by default, while still allowing that randomness to be made fully reproducible on demand.
  - *Depends on:* Nothing, for `random()`; one real seed value (any hashable object), for `seed()`.
  - *Connects to:* `random.random()` alone drives this lesson's flaky-test demonstration; `random.seed()` immediately before it is what turns the same underlying call deterministic in the fix that follows.
  - *Shape:* `random.random()` takes nothing in, returns one `float` out; `random.seed()` takes one value in, returns nothing (`None`).

- **`tempfile.TemporaryDirectory`**
  - *What it is:* A real class from Python's standard library `tempfile` module, used as a context manager to create and automatically remove a real, temporary directory on disk.
  - *Implementation:* `tempfile.TemporaryDirectory()` creates one real, uniquely-named directory (this session, under this machine's own real temp folder) the moment it's constructed; used in a `with` block, it yields that real directory's path as a string, and deletes the entire directory - and everything written into it - the moment the `with` block exits, even if an exception occurred inside it.
  - *Its use:* This lesson uses it to give a real file-writing check somewhere real to write to, without ever touching this project's own real, permanent `backend/uploads` directory.
  - *Type:* A class, used as a context manager (via Python's `with` statement).
  - *Responsibility:* Guaranteeing that a real, temporary directory used for exactly one block of code is genuinely gone afterward - not "probably cleaned up by a script remembering to delete it," but automatic, even on an error.
  - *Depends on:* A real, writable filesystem location for temporary files (this session, resolved to a path under this machine's own `AppData\Local\Temp`).
  - *Connects to:* Entered with `with tempfile.TemporaryDirectory() as tmp_dir:` in this lesson's own lab; `tmp_dir` is then assigned directly onto `app.config["UPLOAD_FOLDER"]`, real code this project already has (`cam_import_service.py:65`) reads from.
  - *Shape:* Yields one real directory path (a string) inside its `with` block; returns nothing once that block exits - the directory itself is gone, not just the reference to it.

## Concept Unit: Shared State - When Tests Quietly Interfere

### The Problem

This project already has a real, existing example of this problem at its most serious: `backend/test_schema.py`'s `test_xml_import` deletes and inserts real rows against whatever real database `create_app()`'s default happens to point at, every single time it runs. Two tests sharing one real database, without either one cleaning up after itself, is exactly this failure - built here at a small, safe scale to see precisely how it happens.

Before reading on:

- If two tests share the exact same real database connection, and the first one inserts a row, what should the second one see when it queries that same table - and does the honest answer depend on which one happens to run first?
- Given `@pytest.fixture(scope="module")` versus the bare `@pytest.fixture` an earlier lesson already used, what real difference do you expect in how many times the fixture function itself actually runs, across two tests that both request it?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Real, already-existing evidence of this exact failure, at full scale: `backend/test_schema.py:15-30` (`test_xml_import`), read again this session - it deletes from `Operation`, `Sequence`, `CAMFile`, `Part`, and `Machine` before inserting new rows, with no isolation between one run and the next at all.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone file; no existing project structure to place it within.
- **Dependencies:** pytest, already installed in this project's backend virtual environment.

### The New Code

One real database, shared across two tests on purpose, via a module-scoped fixture:

**File:** `verification/phase-02/lab_pytest_demo/shared_state_problem_lab.py` (new)

```python
import sys
sys.path.insert(0, "backend")

import pytest
from app import create_app, db
from app.models.machine import Machine


@pytest.fixture(scope="module")
def shared_app():
    app = create_app("testing")
    with app.app_context():
        yield app


def test_a_inserts_a_machine(shared_app):
    machine = Machine(id="M-SHARED-001", name="Shared Mill", category="mill", sub_type="3_axis")
    db.session.add(machine)
    db.session.commit()
    assert Machine.query.count() == 1


def test_b_expects_a_clean_database(shared_app):
    assert Machine.query.count() == 0
```

### Mechanical Walkthrough

- `@pytest.fixture(scope="module")` — Registers `shared_app` as a fixture, but with its scope set to `"module"` instead of the default - pytest will call this function only *once* for every test in this file that requests it, not once per test.
- `def shared_app(): app = create_app("testing") ... yield app` — The identical real setup an earlier lesson's own fixture used - a real app, a real in-memory database, entered inside `app.app_context()` - but because of `scope="module"` above, this whole block runs exactly once for this entire file, not once per test.
- `def test_a_inserts_a_machine(shared_app): ... assert Machine.query.count() == 1` — Inserts one real `Machine` row and confirms, via `Machine.query.count()`, that exactly one row exists - true, and passes, because this is the first test to touch this shared database.
- `def test_b_expects_a_clean_database(shared_app): assert Machine.query.count() == 0` — A second, separate test, also requesting `shared_app` - because the fixture is module-scoped, pytest hands it the *same* app and database `test_a_inserts_a_machine` already used, not a fresh one; this test's own expectation of a clean, empty database is honest, but wrong, given what the fixture's own real scope actually guarantees.

### Execution Trace

1. pytest collects both tests in this file, sees both name `shared_app`, and calls the fixture function once, because its scope is `"module"`.
2. `test_a_inserts_a_machine` runs first (real, in-file order), inserts a real `Machine` row into the one shared database, and its own `assert Machine.query.count() == 1` passes.
3. `test_b_expects_a_clean_database` runs next, requests `shared_app` again - pytest does **not** call the fixture function a second time; it hands back the exact same app and database from the first test, row and all.
4. `assert Machine.query.count() == 0` runs against that same, already-populated database, finds one real row, and fails - not because anything about `test_b_expects_a_clean_database`'s own code is wrong, but because the database it was handed was never actually clean.

### CS Lens

This is **shared mutable state**, one of the oldest, most general sources of bugs in all of software - two things reading and writing the same resource with no coordination between them. Also recognized in: race conditions between threads sharing a variable with no lock; two browser tabs both writing to the same `localStorage` key; a CI pipeline's cache directory carrying stale artifacts from a previous, unrelated build into the current one; and, in this project's own domain, two operators editing the same real `Machine` row's status from two different terminals with no coordination, each unaware of the other's change.

### SE Lens

The design principle is that a fixture's own scope is a real, deliberate decision about isolation, not a default to leave unexamined. The real alternative this unit deliberately used first - a module-scoped fixture, sharing one real database across every test in the file - has an honest upside: it only pays the real cost of building an app and a database once per file, not once per test, which matters when that cost is real and measured (an earlier lesson's own numbers put it at several hundred milliseconds). The honest cost, proven directly by this unit's own real, failing run: any test sharing that scope can see every earlier test's own leftover state, whether either author intended that or not - exactly the same shape of problem `test_xml_import`'s own real, unisolated deletes and inserts already have, at a scale this project actually runs against.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest verification/phase-02/lab_pytest_demo/shared_state_problem_lab.py -v` — Runs this one file under pytest explicitly, by its real path - named without a `test_` prefix on purpose, so this deliberately-failing demonstration is never picked up by a directory-wide discovery run.

### Verification

```text
============================= test session starts =============================
platform win32 -- Python 3.13.14, pytest-9.1.1, pluggy-1.6.0 -- C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\g4m3r\Documents\manufacturing-platform
collecting ... collected 2 items

verification/phase-02/lab_pytest_demo/shared_state_problem_lab.py::test_a_inserts_a_machine PASSED [ 50%]
verification/phase-02/lab_pytest_demo/shared_state_problem_lab.py::test_b_expects_a_clean_database FAILED [100%]

================================== FAILURES ===================================
_______________________ test_b_expects_a_clean_database _______________________

shared_app = <Flask 'app'>

    def test_b_expects_a_clean_database(shared_app):
>       assert Machine.query.count() == 0
E       assert 1 == 0
E        +  where 1 = count()
E        +    where count = <flask_sqlalchemy.query.Query object at 0x000002298C988050>.count
E        +      where <flask_sqlalchemy.query.Query object at 0x000002298C988050> = Machine.query

verification\phase-02\lab_pytest_demo\shared_state_problem_lab.py:24: AssertionError
=========================== short test summary info ===========================
FAILED verification/phase-02/lab_pytest_demo/shared_state_problem_lab.py::test_b_expects_a_clean_database
=================== 1 failed, 1 passed, 7 warnings in 1.03s ===================
```

Full saved run: `verification/phase-02/lab_pytest_demo/shared_state_problem_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it reproduces, at a small, safe scale, the exact real failure shape this project's own `test_xml_import` already has at full, destructive scale.

## Concept Unit: Independent Tests - Real Isolation, Proven

### The Problem

The previous unit's own two tests are not wrong in what they check - only in what they were handed to check it against. What happens if neither test's own body changes at all, and only the fixture's real scope changes back?

Before reading on:

- Before reading the real output below: if the only change from the previous unit is removing `scope="module"` from the fixture decorator, do you expect both tests to pass, both to fail, or one of each?
- What does the previous unit's failure, combined with this unit's real fix, actually prove about where the bug lived - in the tests' own logic, or somewhere else entirely?

### Project Change

- **Reference Source:** No reference counterpart - this unit's own code is the previous unit's identical two test bodies, unedited, with only the fixture's own decorator changed.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone file; no existing project structure to place it within.
- **Dependencies:** pytest, already installed in this project's backend virtual environment.

### The New Code

The identical two tests, with the fixture's scope removed - back to the default:

**File:** `verification/phase-02/lab_pytest_demo/test_independent_tests_fix.py` (new)

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


def test_a_inserts_a_machine(app):
    machine = Machine(id="M-SHARED-001", name="Shared Mill", category="mill", sub_type="3_axis")
    db.session.add(machine)
    db.session.commit()
    assert Machine.query.count() == 1


def test_b_expects_a_clean_database(app):
    assert Machine.query.count() == 0
```

### Mechanical Walkthrough

- `@pytest.fixture (no scope argument)` — The bare decorator, with no `scope` at all - by pytest's own default, this means `scope="function"`: a fresh call to this fixture function for every single test that requests it, with nothing shared between them.
- `def app(): app = create_app("testing") ... yield app` — The exact same setup code as the previous unit's `shared_app`, only renamed back to `app` - the real behavior difference here comes entirely from the missing `scope` argument above, not from anything in this function's own body.
- `def test_a_inserts_a_machine(app): ... assert Machine.query.count() == 1` — Identical to the previous unit's version, word for word; inserts one real row into its own fresh, private database and confirms it, and passes for the same reason as before.
- `def test_b_expects_a_clean_database(app): assert Machine.query.count() == 0` — Also identical to the previous unit's version, word for word - but this time, because `app` is function-scoped, pytest calls the fixture fresh for this test, handing it a brand-new, genuinely empty in-memory database that has never seen `test_a_inserts_a_machine`'s row at all. The exact same assertion that failed before now passes, honestly.

### Execution Trace

1. pytest collects both tests, sees both name `app`, and - because this fixture carries no `scope` argument - calls the fixture function fresh, separately, for each one.
2. `test_a_inserts_a_machine` runs against its own private, fresh database, inserts a row, and passes.
3. `test_b_expects_a_clean_database` runs against a *second*, completely separate fresh database, built by a second, real call to the `app` fixture - one that has never heard of the first test's row.
4. Both tests report PASSED - the same two `assert` statements, unedited, now both honestly true, because each one is finally being checked against what it always assumed it would get: a clean database of its own.

### CS Lens

This is **test isolation** demonstrated directly, not just defined: the exact same assertions, the exact same data, with only the *boundary* around what's shared changed. Also recognized in: a database transaction rolled back after every test instead of committed; a container spun up fresh per CI job instead of reused across builds; a virtual machine snapshot restored before every automated run; and, in this project's own domain, every real machine on the shop floor running its own program from its own controller's own memory, with no shared state between one machine's run and another's.

### SE Lens

The design principle is that isolation should be the default an author has to deliberately opt out of, not something they have to remember to opt into. pytest's own real default - `scope="function"` - embodies exactly that: writing a fixture with no scope argument at all, as an earlier lesson already did without even naming the concept, already gets this right by default. The real alternative this lesson's own previous unit chose on purpose - `scope="module"` - is not wrong in general; it is a real, honest tradeoff between real speed (paying setup cost once per file instead of once per test) and real safety (one test's own leftover state becoming another test's problem). Choosing it requires knowing, and accepting, exactly that tradeoff - not reaching for it as a default and discovering the cost later, the way this lesson's own previous unit did on purpose to prove the point.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest verification/phase-02/lab_pytest_demo/test_independent_tests_fix.py -v` — Runs both tests under pytest, from the repository root.

### Verification

```text
============================= test session starts =============================
platform win32 -- Python 3.13.14, pytest-9.1.1, pluggy-1.6.0 -- C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\g4m3r\Documents\manufacturing-platform
collecting ... collected 2 items

verification/phase-02/lab_pytest_demo/test_independent_tests_fix.py::test_a_inserts_a_machine PASSED [ 50%]
verification/phase-02/lab_pytest_demo/test_independent_tests_fix.py::test_b_expects_a_clean_database PASSED [100%]

============================== warnings summary ===============================
verification/phase-02/lab_pytest_demo/test_independent_tests_fix.py: 12 warnings
  C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Lib\site-packages\sqlalchemy\sql\schema.py:3623: DeprecationWarning: datetime.datetime.utcnow() is deprecated and scheduled for removal in a future version. Use timezone-aware objects to represent datetimes in UTC: datetime.datetime.now(datetime.UTC).
    return util.wrap_callable(lambda ctx: fn(), fn)  # type: ignore

-- Docs: https://docs.pytest.org/en/stable/how-to/capture-warnings.html
======================= 2 passed, 12 warnings in 1.29s ========================
```

Full saved run: `verification/phase-02/lab_pytest_demo/independent_tests_fix_output.txt`.

### Connection to the previous unit

The previous unit broke isolation on purpose to see the failure; this unit restores it with the smallest possible real change, proving the fixture's own scope - not either test's own logic - was the entire cause.

## Concept Unit: Deterministic Tests - Same Code, Same Result, Every Time

### The Problem

A test can be perfectly isolated from every other test and still not be trustworthy, if its own result depends on something outside anyone's control. What does that actually look like, in a real, repeatedly-run check?

Before reading on:

- `assert random.random() > 0.5` is `True` roughly half the time, by definition. If you ran a test containing exactly that line six separate times, what pattern of real pass/fail outcomes would you expect?
- `random.seed(42)` followed by `random.random()` always produces the identical real value. What does that suggest about how to make code that genuinely needs randomness still testable?

### Project Change

- **Reference Source:** No reference counterpart - a real, deliberately non-deterministic throwaway check, run several real times to prove it.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - two new, standalone files; no existing project structure to place them within.
- **Dependencies:** pytest, already installed in this project's backend virtual environment.

### The New Code

The smallest possible flaky test, run six real times, followed by the same underlying call made deterministic with a real seed:

**File:** `verification/phase-02/lab_pytest_demo/flaky_test_lab.py` (new)

```python
import random


def test_flaky():
    assert random.random() > 0.5
```

**File:** `verification/phase-02/lab_pytest_demo/test_deterministic_fix.py` (new)

```python
import random


def test_seeded_random_is_deterministic():
    random.seed(42)
    first = random.random()
    random.seed(42)
    second = random.random()
    assert first == second
```

### Mechanical Walkthrough

- `assert random.random() > 0.5 (flaky_test_lab.py)` — Calls the real, unseeded `random.random()`, which draws from Python's own shared, running random state - a genuinely different real value nearly every time this line executes, with no way for this test's own code to control which one it gets.
- `random.seed(42) (first call)` — Resets Python's shared random state to a fixed, known point, identified by the real value `42` - not a special number, just this lab's own chosen seed; any process that seeds with `42` reaches the identical internal state.
- `first = random.random()` — Draws the real next value from that freshly-seeded state, storing it - deterministic, because the state it's drawing from was just reset to a known point.
- `random.seed(42) (second call) / second = random.random()` — Resets the exact same shared state a second time, to the identical seed, then draws again - because the state is identical to the first time, this real value is guaranteed to be identical to `first` too.
- `assert first == second` — Compares the two separately-drawn, but identically-seeded, real values - `True`, and provably, deterministically so, every real time this test runs.

### Execution Trace

```
run 1: random.random() = 0.78... -> 0.78 > 0.5 -> PASSED
run 2: random.random() = 0.61... -> 0.61 > 0.5 -> PASSED
run 3: random.random() = 0.11... -> 0.11 > 0.5 -> FAILED
run 4: random.random() = 0.94... -> 0.94 > 0.5 -> PASSED
run 5: random.random() = 0.87... -> 0.87 > 0.5 -> PASSED
run 6: random.random() = 0.09... -> 0.09 > 0.5 -> FAILED
```

### CS Lens

This is **non-determinism**: a computation whose real output isn't fully determined by its own real inputs, because something else - here, an unseeded random generator's own internal, running state - also feeds into it. Also recognized in: a distributed system's own race between two servers racing to respond first; a hash-based collection's real iteration order varying between runs (already seen, in a different form, earlier in this curriculum); a test whose pass or fail depends on the real current date crossing a boundary at the exact moment it happens to run; and, in this project's own domain, cutting time varying slightly between two runs of the identical program because of real, physical machine variables no G-code line controls.

### SE Lens

The design principle is that a test's own result should be a pure function of the real code under test - nothing else. The real alternative this unit's own flaky test represents - leaving randomness unseeded inside something being tested - is not wrong everywhere; production code often genuinely needs real, unpredictable randomness. The honest cost when that same unseededness leaks into a *test*: this unit's own six real runs proved a completely unchanged piece of code can report two different verdicts, with nothing about the code itself ever having changed between them - exactly the property that makes a team stop trusting a failing test to mean something real. The fix's own honest cost: seeding seeds a specific, single point in the real possibility space; genuinely broad randomized testing (property- based testing, generating many seeds automatically) is a different, more thorough tool this lesson does not build.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest verification/phase-02/lab_pytest_demo/flaky_test_lab.py -q` — Runs the flaky test under pytest; run several real times in a row (this lesson's own saved output shows six) to actually see it disagree with itself.
- `backend/.venv/Scripts/python.exe -m pytest verification/phase-02/lab_pytest_demo/test_deterministic_fix.py -q` — Runs the seeded, fixed version - run four real times for this lesson's own saved output, passing identically every time.

### Verification

```text
=== run 1 ===
verification\phase-02\lab_pytest_demo\flaky_test_lab.py .                [100%]
1 passed in 0.02s
=== run 2 ===
verification\phase-02\lab_pytest_demo\flaky_test_lab.py .                [100%]
1 passed in 0.02s
=== run 3 ===
FAILED verification/phase-02/lab_pytest_demo/flaky_test_lab.py::test_flaky - ...
1 failed in 0.04s
=== run 4 ===
verification\phase-02\lab_pytest_demo\flaky_test_lab.py .                [100%]
1 passed in 0.01s
=== run 5 ===
verification\phase-02\lab_pytest_demo\flaky_test_lab.py .                [100%]
1 passed in 0.01s
=== run 6 ===
FAILED verification/phase-02/lab_pytest_demo/flaky_test_lab.py::test_flaky - ...
1 failed in 0.04s

Seeded fix, run 4 real times in a row:
1 passed in 0.02s
1 passed in 0.02s
1 passed in 0.01s
1 passed in 0.01s
```

Full saved run: `verification/phase-02/lab_pytest_demo/flaky_test_output.txt`.

### Connection to the previous unit

The previous unit isolated tests from *each other*; this unit isolates a test from something no other test was even involved in - proving independence from other tests and determinism against external randomness are two genuinely different real properties, a test can have one without the other.

## Concept Unit: Temporary Resources - Real I/O Without Real Consequences

### The Problem

This project's own real `CAMImportService.handle_xml_import` (`backend/app/services/cam_import_service.py:64-73`) writes a real XML file to disk, under `current_app.config['UPLOAD_FOLDER']`. This curriculum has used `create_app("testing")` since it introduced integration tests specifically because it's the safe pattern - but does `"testing"` actually make *every* real resource safe to touch, or only the database?

Before reading on:

- `backend/config.py`'s own `TestingConfig` overrides `SQLALCHEMY_DATABASE_URI` to a safe, in-memory value. Does it override `UPLOAD_FOLDER` or `STORAGE_PATH` anywhere in the real file? What would you expect to happen if it doesn't?
- If a test needs to write a real file to prove real code works, but writing that file somewhere permanent is unsafe, what real property would the *ideal* location for that file have?

### Project Change

- **Reference Source:** Real specimen: `backend/app/services/cam_import_service.py:64-73`, read again this session - real, existing code that writes a real file to `current_app.config['UPLOAD_FOLDER']`. Also: `backend/config.py:58-62` (`TestingConfig`), confirming, by reading it directly, that only `SQLALCHEMY_DATABASE_URI` is overridden there - `UPLOAD_FOLDER` is inherited, unchanged, from the base `Config` class.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** pytest, already installed in this project's backend virtual environment (not actually invoked as a test in this unit's own lab, which runs as a plain script to keep its real, printed findings visible).

### The New Code

First, the real gap - `UPLOAD_FOLDER` under the `"testing"` config, unmodified; then a real, temporary override that proves both a real write and a real, automatic cleanup:

**File:** `verification/phase-02/lab_pytest_demo/lab_temp_resources.py` (new)

```python
import sys
import os
import tempfile

sys.path.insert(0, "backend")

from app import create_app

app = create_app("testing")
print("UPLOAD_FOLDER with no override:", app.config["UPLOAD_FOLDER"])
print("is that the real repo's own backend/uploads directory?",
      str(app.config["UPLOAD_FOLDER"]).endswith(os.path.join("backend", "uploads")))

with tempfile.TemporaryDirectory() as tmp_dir:
    app.config["UPLOAD_FOLDER"] = tmp_dir
    test_file_path = os.path.join(str(app.config["UPLOAD_FOLDER"]), "test_upload.txt")
    with open(test_file_path, "w") as f:
        f.write("real file, written for real, inside a real temporary directory")
    assert os.path.exists(test_file_path)
    print("real temp file written and confirmed to exist at:", test_file_path)

assert not os.path.exists(tmp_dir)
print("temporary directory automatically removed once the 'with' block exited - nothing left behind")
```

### Mechanical Walkthrough

- `app = create_app("testing")` — The same safe-for-tests app this curriculum has built since it first introduced integration tests - the whole point of this unit is discovering exactly what "safe" does and doesn't cover.
- `app.config["UPLOAD_FOLDER"]` — Reads the real, live value Flask's own config dict holds for this key - a real `pathlib.Path` object (confirmed this session; `str(...)` is needed below because `Path` has no `.endswith` method), resolved from `config.py`'s own `STORAGE_PATH` default, completely independent of whichever database config was actually chosen.
- `str(app.config["UPLOAD_FOLDER"]).endswith(os.path.join("backend", "uploads"))` — Converts the real `Path` to a string, then checks whether it really ends with this project's own real, permanent `backend/uploads` path segment - `True`, confirmed by this unit's own real, saved run.
- `with tempfile.TemporaryDirectory() as tmp_dir:` — Creates one real, uniquely-named temporary directory on disk, and binds its real path to `tmp_dir` for the duration of this block only.
- `app.config["UPLOAD_FOLDER"] = tmp_dir` — Overrides the app's own config, in memory, for the rest of this process - real code reading `current_app.config['UPLOAD_FOLDER']` from this point on, inside this same app, would read the real temporary path instead of the real permanent one.
- `open(test_file_path, "w") as f: f.write(...)` — Writes one real file, with real content, into the real temporary directory - proving the override actually works for genuine file I/O, not just for reading the config value back.
- `assert os.path.exists(test_file_path)` — Confirms, for real, that the file genuinely exists on disk at that path - not merely that the `write` call didn't raise.
- `assert not os.path.exists(tmp_dir) (after the with block)` — Runs *after* the `with` block has already exited - by this point, `tempfile.TemporaryDirectory`'s own real cleanup has already deleted the entire directory, including the file just written into it; this assert would fail if any part of that cleanup hadn't genuinely happened.

### CS Lens

This is a **temporary resource** used correctly - a real dependency (here, the filesystem) provided in a form that's real enough to prove the code under test actually works, while being automatically reclaimed the moment it's no longer needed. Also recognized in: a database transaction opened and always rolled back, never committed, around a single test; a Docker container spun up fresh and destroyed per test run; a mock SMTP server listening on a real, ephemeral local port instead of sending real email; and, in this project's own domain, a test cut run on scrap material in a real machine instead of a customer's actual part.

### SE Lens

The design principle is that "safe for testing" has to be checked resource by resource, never assumed to cover everything just because one part of it (here, the database) was handled correctly. The real alternative not chosen - writing real test files directly into `backend/uploads` and trusting someone to delete them afterward - has an honest, familiar cost: exactly the same shape of risk `test_xml_import`'s own real, unisolated database writes already have, just for the filesystem instead of the database, and just as easy to overlook precisely because the `"testing"` config name *sounds* like it should already cover it. The fix's own honest cost: every real function that touches storage has to actually accept a configurable path (as `current_app.config['UPLOAD_FOLDER']` already does here) - code that hard-codes a real path instead can't be redirected into a temporary one at all, no matter how careful the test is.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_temp_resources.py` — Runs this as a plain script (not through pytest) so its real, printed findings about `UPLOAD_FOLDER` stay visible in the output, rather than only surfacing on a failure.

### Verification

```text
Seeding default users...
UPLOAD_FOLDER with no override: C:\Users\g4m3r\Documents\manufacturing-platform\backend\uploads
is that the real repo's own backend/uploads directory? True
real temp file written and confirmed to exist at: C:\Users\g4m3r\AppData\Local\Temp\tmplm6d7he5\test_upload.txt
temporary directory automatically removed once the 'with' block exited - nothing left behind
```

Full saved run: `verification/phase-02/lab_pytest_demo/temp_resources_output.txt`.

### Connection to the previous unit

The previous unit isolated a test from external randomness; this unit isolates a test from a real, permanent part of the filesystem - the same underlying discipline, applied to this lesson's third and last kind of thing a test can accidentally depend on.

## Connect the pieces

One real database, deliberately shared across two tests via a module-scoped fixture, produces a real, saved failure - `assert 1 == 0` - that has nothing to do with either test's own logic and everything to do with what they were handed (shared state). The identical two tests, unedited, both pass the moment the fixture's scope returns to its real default - proof the bug lived in the boundary, not the checks (independent tests). A test built around unseeded randomness genuinely disagrees with itself across six real, saved runs - three pass, two fail, one already shown above - while the same underlying call, seeded, agrees with itself across four more real runs in a row (deterministic tests). And this project's own real `UPLOAD_FOLDER`, confirmed this session to still point at a real, permanent, already-populated directory even under the `"testing"` config this curriculum has trusted since integration tests were introduced, gets safely redirected into a real temporary directory that cleans up after itself completely, proven by a real `assert` that only passes once the cleanup has already happened (temporary resources). Three real, different ways a test can quietly depend on something it shouldn't - and three real, verified fixes.

**Next lesson:** Every real dependency this lesson isolated - a database, a random number generator, a filesystem - was still the real thing, just given a safe, disposable form. The next real question this curriculum takes on is what to do when using the *real* thing at all isn't practical or safe even in a disposable form - and what a stand-in for it can and can't actually prove.