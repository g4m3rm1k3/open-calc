# Python Tool Database — LAB 25 — Test Fixtures and the Test Database

**Prerequisites:** Lab 24. You have a complete `test_tool_service.py` with a `_make_service()` helper function repeated at the top. Every test file that needs a database has its own version of this setup. You can see the duplication — now you fix it properly.

**What this lab adds:**
- `@pytest.fixture` — what it is and how pytest uses it
- `yield` in a fixture: setup before, teardown after
- `conftest.py` — the shared fixture file that all test files can use
- Fixture scope: `function` vs `session`
- Replacing `_make_service()` with a fixture in every test file
- An in-memory database that resets automatically between tests

**Time:** 45–55 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You have a `@pytest.fixture` that creates a database connection. What happens to the connection when the test finishes?
> 2. A fixture is declared with `scope="session"`. You have 30 tests that use this fixture. How many times is the fixture called?
> 3. A fixture is declared with `scope="function"` (the default). You have 30 tests that use it. How many times is the fixture called?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `conftest.py` at the root of `tests/`, shared by all test files:

```
tests/
    conftest.py             ← NEW: shared fixtures
    test_queries.py         ← UPDATED: use fixtures
    test_tool_service.py    ← UPDATED: use fixtures, remove _make_service()
    test_sfm.py             ← no database, no change needed
```

---

## Step 1 — The Problem: Setup Duplication

Look at your test files. `test_queries.py`, `test_tool_service.py`, `test_fk.py`, `test_junction.py`, and others all contain some version of:

```python
conn = sqlite3.connect(":memory:")
conn.execute(TOOLS_TABLE_SQL)
conn.execute(HOLDERS_TABLE_SQL)
# ... etc
```

This is 5–10 lines repeated in every test file, and sometimes repeated inside every test function. Changes ripple: add a new table to the schema, update six files. Forget to update one, and tests silently fail on a different test machine.

DRY — Don't Repeat Yourself — applies to test code as much as production code.

---

## Step 2 — What a Fixture Is

A fixture is a function that:
1. Pytest calls automatically before a test that requests it
2. Provides something the test needs (a connection, a service, a sample record)
3. Cleans up after the test finishes

The `@pytest.fixture` decorator marks it. The test receives the fixture's return value by declaring a parameter with the same name.

```python
# In conftest.py:
import pytest

@pytest.fixture
def my_value():
    return 42

# In test_something.py:
def test_uses_my_value(my_value):   # ← parameter name matches fixture name
    assert my_value == 42
```

pytest sees `my_value` as a parameter, looks for a fixture named `my_value`, calls it, and passes the result in. No import needed — pytest handles the wiring.

---

## Step 3 — `yield` for Setup and Teardown

For resources that need cleanup (database connections, file handles, network sockets), use `yield`:

```python
@pytest.fixture
def db_conn():
    conn = sqlite3.connect(":memory:")
    yield conn            # ← everything before here is setup
    conn.close()          # ← everything after here is teardown
```

The test receives the connection at `yield`. When the test finishes — whether it passed, failed, or raised an error — pytest resumes the fixture after `yield` and runs the cleanup.

This is equivalent to:

```python
conn = sqlite3.connect(":memory:")
try:
    run_the_test(conn)
finally:
    conn.close()
```

Except pytest handles the `try/finally` for you.

---

## Step 4 — RED: Write the Failing Tests First

Before writing `conftest.py`, write what you want the test to look like:

Open `tests/test_tool_service.py`. Delete the `_make_service()` helper and rewrite the first test to use a fixture parameter:

```python
# What we want — this will fail until conftest.py exists

def test_create_tool_returns_integer_id(tool_service):
    tool_id = tool_service.create_tool(
        name="1/2 Carbide EM",
        diameter_inches=0.5,
        material="carbide",
        tool_type="endmill",
    )
    assert isinstance(tool_id, int)
    assert tool_id >= 1
```

Run pytest:

```
pytest tests/test_tool_service.py::test_create_tool_returns_integer_id -v
```

Expected error:
```
ERRORS
fixture 'tool_service' not found
```

The test is failing because no fixture named `tool_service` exists. This is the Red step — the test is asking for something that doesn't exist yet.

---

## Step 5 — GREEN: Create `conftest.py`

Create `tests/conftest.py`:

```python
import sqlite3
import pytest

from tooldb.repositories.tool_repository import ToolRepository
from tooldb.services.tool_service import ToolService
from tooldb.schema import (
    TOOLS_TABLE_SQL,
    HOLDERS_TABLE_SQL,
    ASSEMBLIES_TABLE_SQL,
    JOBS_TABLE_SQL,
    JOB_ASSEMBLIES_TABLE_SQL,
)


@pytest.fixture
def db_conn():
    """Fresh in-memory SQLite database with all tables created."""
    conn = sqlite3.connect(":memory:")
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute(TOOLS_TABLE_SQL)
    conn.execute(HOLDERS_TABLE_SQL)
    conn.execute(ASSEMBLIES_TABLE_SQL)
    conn.execute(JOBS_TABLE_SQL)
    conn.execute(JOB_ASSEMBLIES_TABLE_SQL)
    conn.commit()
    yield conn
    conn.close()


@pytest.fixture
def tool_repo(db_conn):
    """ToolRepository backed by the test database."""
    return ToolRepository(db_conn)


@pytest.fixture
def tool_service(tool_repo):
    """ToolService backed by the test repository."""
    return ToolService(tool_repo)
```

Three fixtures, each building on the previous one. `tool_service` depends on `tool_repo`, which depends on `db_conn`. pytest resolves the dependency chain automatically.

Run the test again:

```
pytest tests/test_tool_service.py::test_create_tool_returns_integer_id -v
```

Expected: `PASSED`.

---

## Step 6 — REFACTOR: Update All Tests in `test_tool_service.py`

Replace every `_make_service()` call with a `tool_service` fixture parameter. The pattern is mechanical:

**Before:**
```python
def test_create_tool_rejects_negative_diameter():
    service = _make_service()
    with pytest.raises(ValueError, match="diameter"):
        service.create_tool(...)
```

**After:**
```python
def test_create_tool_rejects_negative_diameter(tool_service):
    with pytest.raises(ValueError, match="diameter"):
        tool_service.create_tool(...)
```

Every test function gains a `tool_service` parameter. The `_make_service()` function and all its calls are deleted.

After the update, run:

```
pytest tests/test_tool_service.py -v
```

All tests should pass, and the file should be noticeably shorter.

---

## Step 7 — Update `test_queries.py`

The old tests in `test_queries.py` use a `seed_tools()` helper or manual setup. Update them to use `db_conn` from `conftest.py`:

```python
# tests/test_queries.py — before
def seed_tools(conn):
    conn.execute(TOOLS_TABLE_SQL)  # probably
    conn.execute(...)
    ...
    return conn

def test_find_carbide_tools():
    conn = seed_tools(sqlite3.connect(":memory:"))
    ...
```

```python
# tests/test_queries.py — after
def test_find_carbide_tools(db_conn):
    # db_conn already has tables; just insert data
    from tooldb.queries import insert_tool, find_carbide_tools
    insert_tool(db_conn, "Carbide Mill", 0.5, "carbide", "endmill")
    insert_tool(db_conn, "HSS Drill", 0.25, "HSS", "drill")
    db_conn.commit()

    result = find_carbide_tools(db_conn)
    assert len(result) == 1
    assert result[0]["name"] == "Carbide Mill"
```

The fixture provides the connection — the test only sets up the data it needs. No schema setup, no cleanup.

---

## Concept Block — Fixture Scope

```
SCOPE         CREATED              DESTROYED
---------     -------------------  -------------------
function      Before each test     After each test
class         Before first test    After last test
              in the class         in the class
module        Before first test    After last test
              in the file          in the file
session       Before first test    After last test
              in the entire run    in the entire run
```

**Which scope to use:**

- `function` (default): use for anything that writes to the database. Each test gets its own clean slate. Tests cannot affect each other.
- `session`: use for expensive read-only resources — a large dataset loaded from disk, a compiled Pydantic schema registry, a database connection that never writes. The risk: if any test *writes* to a session-scoped database, other tests see those writes.

For this project, `scope="function"` is correct for all database fixtures. The in-memory database is cheap to create. The isolation is worth it.

---

## Step 8 — SAVE AND TRY: Full Suite with Isolation Proof

Run the full suite:

```
pytest -v
```

Now prove isolation. Add this test temporarily:

```python
def test_isolation_proof_a(tool_service):
    tool_service.create_tool("Shared-Tool", 0.5, "carbide", "endmill")
    result = tool_service.get_tools()
    assert len(result) == 1


def test_isolation_proof_b(tool_service):
    # If the fixture isn't isolated, "Shared-Tool" from test_a would appear here
    result = tool_service.get_tools()
    assert len(result) == 0  # blank database — no tools yet
```

Run both tests. Both should pass. `test_isolation_proof_b` gets a fresh `tool_service` with an empty database — it never sees the tool created in `test_isolation_proof_a`.

Delete both isolation proof tests before committing.

---

## Step 9 — `conftest.py` Scope

`conftest.py` is automatically loaded by pytest — you don't import it. A `conftest.py` in `tests/` provides fixtures to all test files in `tests/`. A `conftest.py` at the project root (`python-tooldb/conftest.py`) provides fixtures to all test files everywhere.

Fixture resolution order if there are multiple `conftest.py` files:
1. The test file's own fixtures
2. The nearest `conftest.py`
3. Parent `conftest.py` files, up to the root

For this project, one `tests/conftest.py` is enough.

---

## Challenge

Add a `sample_tool_id` fixture to `conftest.py` that creates one tool and returns its ID:

```python
@pytest.fixture
def sample_tool_id(tool_service):
    return tool_service.create_tool(
        name="Sample Mill",
        diameter_inches=0.5,
        material="carbide",
        tool_type="endmill",
    )
```

Then write a test that uses it:

```python
def test_get_tool_with_sample_fixture(tool_service, sample_tool_id):
    result = tool_service.get_tool(sample_tool_id)
    assert result["name"] == "Sample Mill"
```

Notice: the test uses both `tool_service` and `sample_tool_id` as parameters. `sample_tool_id` itself depends on `tool_service`. pytest automatically ensures both use the *same* `tool_service` instance — the dependency chain is resolved correctly.

<details>
<summary>Answer</summary>

**`tests/conftest.py` addition:**

```python
@pytest.fixture
def sample_tool_id(tool_service):
    return tool_service.create_tool(
        name="Sample Mill",
        diameter_inches=0.5,
        material="carbide",
        tool_type="endmill",
    )
```

**Test:**

```python
def test_get_tool_with_sample_fixture(tool_service, sample_tool_id):
    result = tool_service.get_tool(sample_tool_id)
    assert result["name"] == "Sample Mill"
```

This works because pytest is smart about shared fixture instances within a single test. Both `tool_service` and `sample_tool_id` are `scope="function"` (default), so they are created fresh for this test. But since `sample_tool_id` depends on `tool_service`, pytest gives both parameters the same `tool_service` instance — not two separate ones. The tool created in `sample_tool_id` is visible to `tool_service.get_tool()` because they share one database.

</details>

---

## Final Check

| I can... | Yes / Not yet |
|----------|--------------|
| Write a `@pytest.fixture` function that returns a value | |
| Use `yield` to separate setup from teardown | |
| Create a `conftest.py` and put fixtures in it | |
| Request a fixture in a test function by parameter name | |
| Explain what `scope="function"` vs `scope="session"` does | |
| Explain why function-scope fixtures are correct for database tests | |
| Prove that two tests using the same fixture do not share state | |

---

## Quick Check Answers

1. **When the test finishes, pytest resumes the fixture after the `yield` and runs the cleanup code.** If the fixture does not use `yield` (just `return`), there is no teardown — the object is garbage-collected eventually. For database connections, always use `yield` and explicitly close the connection.

2. **Once.** A `scope="session"` fixture is called once per test session and reused by all 30 tests. The same object is shared. This is efficient but dangerous for anything that writes state.

3. **30 times.** A `scope="function"` fixture is called once per test. Each test gets its own fresh instance. This is slower but completely safe — tests cannot interfere with each other.
