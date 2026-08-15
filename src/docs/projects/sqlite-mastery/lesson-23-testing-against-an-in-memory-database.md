# Lesson 23: Testing Against an In-Memory Database

**What you will build:** a real, automated `pytest` suite for Lesson
22's own `parts_repository.py` — run entirely against a temporary,
in-RAM database that never touches `pocket_hardware.db`, plus a real,
non-obvious gotcha this project's own repository shape runs into the
instant naive in-memory testing meets it.

**What you need to know first:** [Lesson 22](lesson-22-a-repository-pattern-in-python.md)
— `parts_repository.py`'s own `get_connection`/`add_part`/
`get_part_by_name`, modified in this lesson to accept a real, injectable
database path instead of always using the hardcoded `DB_PATH` constant.

**Terms introduced in this lesson:**
- **In-memory database** — a real, genuine SQLite database that exists
  only in RAM, never written to any file, requested with the special
  filename `:memory:`.
- **Shared-cache URI** — a real, specific SQLite connection string,
  `file::memory:?cache=shared`, that lets more than one real connection
  share the *same* in-memory database, rather than each connection
  getting its own private, separate one.
- **Test fixture** — a real, `pytest`-specific mechanism: a function
  that sets up (and tears down) real state a test needs, injected into
  any test function that names it as a parameter.

**Objects and methods used:**

**`:memory:` (special SQLite filename)**
- *What it is:* a real, reserved filename SQLite recognizes specially.
- *Implementation:* `sqlite3.connect(":memory:")` — creates a real,
  fully-functional database that exists only for the lifetime of that
  one connection, and is permanently discarded — not merely closed —
  the instant that connection closes.
- *Its use:* this lesson's own first, real proof of what "in-memory"
  actually means.

**`pytest.fixture`**
- *What it is:* a real decorator from the `pytest` testing framework
  (`pip install pytest`, not part of Python's own standard library).
- *Implementation:* `@pytest.fixture` above a function that `yield`s a
  value — every real test function that names that fixture as a
  parameter receives the yielded value, and code after the `yield`
  runs automatically once that test finishes, real setup and teardown
  bracketing each test.
- *Its use:* seeding a real, shared in-memory database once per test,
  and closing it again afterward.

---

## Concept Unit: `:memory:` — Real Data, Zero Persistence

### The Problem

Every real script in Lessons 17–22 touched the real, permanent
`pocket_hardware.db` — including this project's own genuine data.
Automated tests need to run repeatedly, freely, including deliberately
bad input, without any real risk to that permanent file.

### Introduce the Concept in Isolation

A real, genuine SQLite database, proven to hold real data — and proven
to vanish completely the instant its one connection closes:

```python
import sqlite3

conn = sqlite3.connect(":memory:")
conn.execute("CREATE TABLE probe (id INTEGER PRIMARY KEY, label TEXT)")
conn.execute("INSERT INTO probe (label) VALUES ('first')")
print(conn.execute("SELECT * FROM probe").fetchall())
conn.close()

conn2 = sqlite3.connect(":memory:")
print(conn2.execute("SELECT name FROM sqlite_master WHERE type = 'table'").fetchall())
```

```
$ python memory_probe.py
[(1, 'first')]
[]
```

The first connection's own real table and row are proven real —
`CREATE TABLE` and `INSERT` behave exactly like every earlier lesson's
own real, file-backed database. The second, completely separate
`:memory:` connection then proves the real, defining fact: it opens a
genuinely brand-new, empty database — not even `probe`'s own table
definition survived, because `:memory:` was never really a *shared*
database at all; it was one connection's own private, temporary one,
gone the moment `conn.close()` ran.

### Discard

`memory_probe.py` is real, disposable proof — no `:memory:` database
from it survives past the script itself, which is exactly the real
point.

### Mechanical Walkthrough

- `sqlite3.connect(":memory:")` — **(a) first appearance** of the
  special `:memory:` filename, full treatment above; `sqlite3.connect`
  itself — **(b) hard concept reappearing**, Lesson 17's own call,
  unchanged.
- `conn2 = sqlite3.connect(":memory:")` — **(c) already basic**, the
  identical call; the real point is that it produces a genuinely
  different, independent database, not a syntactic difference.

### CS Lens

A real `:memory:` database is **volatile storage**: real, correct,
fully-functional data that exists only as long as its own process (here,
its own connection) keeps it alive, with no real persistence layer
underneath at all.

Also recognized in: an ordinary in-process cache (real data, gone on
restart), a Redis instance configured with persistence disabled,
volatile RAM itself versus a real disk — the same underlying tradeoff,
speed and simplicity in exchange for nothing surviving past the
process's own lifetime.

### SE Lens

The real reason this matters for testing specifically: a real,
automated test suite that runs against a real file risks two genuine
problems this lesson's own `:memory:` database has neither of — tests
polluting real project data (a test's own `INSERT` accidentally
becoming a permanent, real row), and tests interfering with *each
other* if run concurrently against the same real file. A fresh
`:memory:` database, created and destroyed per test, structurally
cannot have either problem — there's no real file for two tests to
collide on.

## Concept Unit: Testing the Repository — a Real Gotcha, Then the Real Fix

### The Problem

`parts_repository.py`'s own functions each open a fresh connection and
close it again (Lesson 22's own `try`/`finally` shape) — correct for a
real, persistent file, where closing and reopening the same path
reaches the same real data. Does that identical pattern work correctly
against `:memory:`?

### Introduce the Concept in Isolation

First, `parts_repository.py` gets one real, small change: every
function accepts an optional `db_path`, defaulting to the original
constant, instead of always using it directly —

```python
def get_connection(db_path=DB_PATH):
    conn = sqlite3.connect(db_path, uri=db_path.startswith("file:"))
    conn.row_factory = sqlite3.Row
    return conn


def add_part(name, price, quantity, supplier_id=None, db_path=DB_PATH):
    conn = get_connection(db_path)
    try:
        with conn:
            conn.execute(
                "INSERT INTO parts (name, price, quantity, supplier_id) VALUES (?, ?, ?, ?)",
                (name, price, quantity, supplier_id),
            )
    finally:
        conn.close()


def get_part_by_name(name, db_path=DB_PATH):
    conn = get_connection(db_path)
    try:
        return conn.execute(
            "SELECT * FROM parts WHERE name = ?", (name,)
        ).fetchone()
    finally:
        conn.close()
```

Real, direct proof of the gotcha — plain `:memory:`, passed straight
through:

```python
import parts_repository as repo

repo.add_part("Test Widget", 9.99, 3, db_path=":memory:")
part = repo.get_part_by_name("Test Widget", db_path=":memory:")
print(part)
```

```
$ python naive_memory_test.py
Traceback (most recent call last):
  ...
sqlite3.OperationalError: no such table: parts
```

A real, genuine failure — not a bug in the repository's own logic.
`add_part` opened its own private `:memory:` database, wrote a real row
into it, then closed it — destroying that entire database, row and all
— before `get_part_by_name` ever ran. `get_part_by_name` then opened a
*second*, completely separate, empty `:memory:` database, one that
never even had a real `parts` table created in it at all. This is the
identical real fact this lesson's first unit already proved, now
surfaced as a genuine test failure: `:memory:` is never shared between
separate connections by default, no matter how quickly one opens after
another closes.

The real fix — SQLite's own documented **shared-cache URI**, plus one
real connection kept open for the duration to keep the shared database
alive:

```python
import sqlite3
import pytest
import parts_repository as repo

SCHEMA = """
CREATE TABLE parts (
    id INTEGER PRIMARY KEY,
    name TEXT,
    price REAL,
    quantity INTEGER,
    supplier_id INTEGER
);
"""

TEST_DB = "file::memory:?cache=shared"


@pytest.fixture
def test_db():
    keepalive = sqlite3.connect(TEST_DB, uri=True)
    keepalive.execute(SCHEMA)
    keepalive.commit()
    yield TEST_DB
    keepalive.close()


def test_add_and_get_part(test_db):
    repo.add_part("Test Widget", 9.99, 3, db_path=test_db)
    part = repo.get_part_by_name("Test Widget", db_path=test_db)
    assert part["name"] == "Test Widget"
    assert part["price"] == 9.99
```

```
$ pytest test_parts_repository.py -v
test_parts_repository.py::test_add_and_get_part PASSED
```

A real, passing test. `file::memory:?cache=shared` is SQLite's own
real, documented URI form telling every connection using it to attach
to the *same* named in-memory database rather than a private one each
— and `keepalive`, the fixture's own connection, is what keeps that
shared database alive for the whole test, since a shared in-memory
database is still destroyed the instant its *last* open connection
closes; `keepalive` simply never closes until `yield`'s own caller (the
test) finishes.

### Discard

`naive_memory_test.py` is real, disposable proof of the real gotcha —
never the project's own real test code; `test_parts_repository.py`,
using the real shared-cache fix, is this lesson's own permanent,
correct test suite.

### Mechanical Walkthrough

- `db_path=db_path.startswith("file:")` inside `get_connection` — **(a)
  first appearance** of `uri=` as a real, conditional keyword argument
  to `sqlite3.connect`, needed specifically because a shared-cache
  connection string requires it, while an ordinary file path does not.
- `"file::memory:?cache=shared"` — **(a) first appearance**, full
  treatment above.
- `@pytest.fixture` / `yield TEST_DB` / `keepalive.close()` — **(a)
  first appearance** of a real `pytest` fixture, full treatment above;
  the code after `yield` — real, guaranteed teardown, run once the test
  using this fixture finishes, regardless of whether it passed or
  failed.
- `def test_add_and_get_part(test_db): ...` — **(a) first appearance**
  of a real `pytest` test function: `pytest` discovers it automatically
  by its `test_` name prefix, and supplies `test_db`'s own yielded
  value because the parameter name matches the fixture's own name.
- `assert part["name"] == "Test Widget"` — **(a) first appearance** of
  Python's own `assert` statement used as a real test check: `pytest`
  reports a failed `assert` as a real, specific test failure, showing
  both sides of the comparison.

### CS Lens

The shared-cache `:memory:` database, kept alive by one held-open
connection while others attach to it, is a real instance of
**reference-counted lifetime**: the underlying resource survives exactly
as long as at least one real reference to it exists, and is reclaimed
the instant the last one goes away — the identical idea behind
reference-counted garbage collection in general-purpose languages,
applied here to a database's own real existence instead of a heap
object's.

### SE Lens

The real, honest lesson embedded in this unit's own gotcha: code
correct for one storage model (a real, persistent file, safely
reopenable by path) is not automatically correct for a superficially
similar one (`:memory:`, private per connection) — a real reminder that
"just swap the connection string" is not always a safe assumption when
adapting code for testing, and that the real fix sometimes has to
account for a genuine, documented difference in the underlying
system's own behavior, not just a naming convention.

## Connect the pieces

One real repository, `parts_repository.py`, given one real
capability — an injectable `db_path` — and tested two ways: naive
`:memory:`, proven to fail with a genuine `no such table: parts` error
because each of the repository's own connections opened and closed its
own private, separate database; then the real, documented shared-cache
URI, `file::memory:?cache=shared`, held alive by one fixture-owned
connection for a test's own duration, proven to pass. Neither test ever
touched `pocket_hardware.db`.

## What breaks without this

Let the fixture's own `keepalive` connection close *before* the test
body runs, by restructuring the fixture without `yield` at all —
closing immediately after seeding:

```python
@pytest.fixture
def broken_test_db():
    keepalive = sqlite3.connect(TEST_DB, uri=True)
    keepalive.execute(SCHEMA)
    keepalive.commit()
    keepalive.close()
    return TEST_DB


def test_with_broken_fixture(broken_test_db):
    repo.add_part("Test Widget", 9.99, 3, db_path=broken_test_db)
```

```
$ pytest test_parts_repository.py::test_with_broken_fixture -v
FAILED test_parts_repository.py::test_with_broken_fixture - sqlite3.OperationalError: no such table: parts
```

The real, identical failure as this lesson's own opening gotcha —
`keepalive.close()`, called before the test body ever runs, destroyed
the shared in-memory database the instant no connection held it open
anymore, exactly as this lesson's own first unit already proved
`:memory:` behaves. This is direct, real proof that the shared-cache
fix's own correctness depends specifically on `keepalive` staying open
for the fixture's *entire* real duration — `yield` (not `return`) is
what makes that true, pausing the fixture function mid-execution rather
than letting it finish and close the connection early.

## Exercises

1. Write a second real test, `test_get_all_parts_starts_empty`, using
   the correct `test_db` fixture, confirming `repo.get_all_parts` (with
   its own `db_path` parameter added, following this lesson's own
   pattern) returns a real, empty list against a freshly-seeded test
   database — proof each test gets genuinely fresh state, unpolluted by
   this lesson's own earlier `test_add_and_get_part`.
2. Deliberately write a failing `assert` (comparing `part["price"]`
   against the *wrong* real number) and run `pytest` again. Read the
   real failure output `pytest` produces, and confirm it shows both the
   expected and actual real values without you needing to add any
   `print()` statement yourself.

## Definition of Done

- [ ] You proved `:memory:` databases are private per connection, not
      shared, with a real, direct two-connection test.
- [ ] You added a real, injectable `db_path` parameter to
      `parts_repository.py`.
- [ ] You reproduced the real "no such table: parts" failure from naive
      `:memory:` testing, and understand exactly why it happens.
- [ ] You fixed it with the real shared-cache URI and a `pytest`
      fixture, and got a real, passing test.
- [ ] You reproduced the real failure from closing the fixture's own
      connection too early, and understand why `yield` (not `return`)
      is required.
- [ ] You completed both exercises.

## Next

[Lesson 24 — Hand-Rolled Schema Migrations](lesson-24-hand-rolled-schema-migrations.md)
closes Arc 2 with a real, versioned way to change `parts`' own schema
after real data already exists in it — the exact scenario Lesson 08's
own `ALTER TABLE ADD COLUMN` already did once, by hand, at the CLI.
