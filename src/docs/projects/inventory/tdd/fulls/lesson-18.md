# Lesson 18: Advanced Testing Capabilities

**What you will build**
A pytest fixture that gives every test a fresh, isolated database — finally separating test runs from the real `social.db` they've been silently mutating since Lesson 1 — plus a mocked unit test that verifies route logic without touching a database at all. The problem we're solving: Lesson 17 ended by naming it directly — every test in this project has been running against the same real database file every other lesson also wrote to, which means test runs have never been fully independent or repeatable.

**What you need to know first**
Lesson 16 (`Depends()`, repositories). Lesson 17 (the flagged shared-database problem).

---

## Concept Unit: Fixtures and an Isolated Test Database

### The Problem

Every test so far calls `get_connection()`, which always opens the real `social.db`. Running the test suite twice in a row can behave differently depending on what earlier runs left behind (Lesson 17's `duplicate_test` username, for instance, is now permanently in that file). Tests should be independent and repeatable — the same suite, run any number of times, should behave identically every time.

### Introduce the concept in isolation

Create `lab_fixture.py`:

```python
import pytest

@pytest.fixture
def fresh_list():
    print("\n[setup] creating a fresh list")
    data = []
    yield data
    print("[teardown] list is discarded")

def test_append_one(fresh_list):
    fresh_list.append("a")
    assert fresh_list == ["a"]

def test_append_another(fresh_list):
    fresh_list.append("b")
    assert fresh_list == ["b"]
```

Run it:

```bash
pytest lab_fixture.py -v -s
```

Output:

```text
[setup] creating a fresh list
lab_fixture.py::test_append_one PASSED
[teardown] list is discarded

[setup] creating a fresh list
lab_fixture.py::test_append_another PASSED
[teardown] list is discarded
```

*What this proves:* each test received its own fresh `fresh_list`, not one shared across both — if `test_append_another` had seen `test_append_one`'s leftover `"a"`, its assertion would fail. `yield` (already seen in Lesson 16's generator-based dependencies) plays the identical role here: code before `yield` is setup, code after is teardown, and pytest runs the whole cycle once per test that requests this fixture by parameter name.

### Explain the mechanism

A **fixture** is pytest's mechanism for exactly this: reusable setup/teardown, injected by naming it as a test function's parameter — the same dependency-injection idea from `Depends()`, applied to tests instead of routes. Any test that lists `fresh_list` as a parameter gets its own fresh instance, automatically, without writing setup code inside every single test function.

### Discard the throwaway example

Delete `lab_fixture.py`. Build a real fixture isolating the actual project database.

### Project Change

* **Files affected:** Create `conftest.py`. Modify `tests/test_api.py`.
* **Change type:** Add + Modify.

### The New Code

```python
# conftest.py — pytest automatically discovers fixtures defined here
import pytest
import sqlite3
from main import app
from db import init_db_schema  # extracted from init_db: schema only, no seed data

@pytest.fixture
def client():
    test_conn = sqlite3.connect(":memory:")
    test_conn.row_factory = sqlite3.Row
    init_db_schema(test_conn)

    def get_test_connection():
        return test_conn

    from db import get_connection
    app.dependency_overrides[get_connection] = get_test_connection

    from fastapi.testclient import TestClient
    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    test_conn.close()
```

```python
# tests/test_api.py — every test now requests `client` as a fixture, instead of a module-level TestClient
def test_homepage_returns_200(client):
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Developer Social Network"}
```

*(Every other existing test is updated the same way — adding `client` as a parameter, using it instead of the old module-level `client` variable.)*

### Mechanical walkthrough

1. `sqlite3.connect(":memory:")`: (already-established from Lessons 2 and 15's isolation labs). An in-memory database, discarded automatically the moment the connection closes — nothing here ever touches `social.db`.
2. `app.dependency_overrides[get_connection] = get_test_connection`: (first appearance of `dependency_overrides` in this project — the same FastAPI mechanism from your earlier NexusInventory practice, applied for real here). Intercepts every route's `Depends(get_connection)` call for the duration of this fixture, redirecting it to the in-memory test database instead of the real one.
3. `app.dependency_overrides.clear()`: (first appearance). Undoes the override after each test — critical, since without it, the override from one test could silently leak into the next test's run.
4. `client` as a test parameter: (already-established fixture-injection pattern from the isolation example). Every test using it gets its own fresh in-memory database and its own correctly-scoped override, automatically.

### CS Lens

**Test isolation as a specific instance of the aliasing problem from Interlude A.** Tests sharing one real database is structurally the same failure mode as two variables aliasing one mutable list — one test's changes are visible, unexpectedly, to another. Fixtures don't eliminate mutable shared state in general; they make each test's state genuinely private, the same fix (`.copy()`, back in Interlude A) applied at the scale of an entire test run instead of one function call.

### SE Lens

**Isolated tests are what makes "the test suite passed" actually mean something.** Before this lesson, a passing suite proved the code worked *given whatever `social.db` happened to already contain* — which is not a real guarantee about the code's correctness, just a fact about one specific, accumulating file's current state. Lesson 16's repository refactor could only be trusted based on "the same 23 tests still pass" because those tests were, even then, running against genuinely inconsistent shared state — this lesson is what makes that kind of claim actually reliable going forward.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 24 items

tests/test_api.py ........................                               [100%]

============================== 24 passed in 0.09s ===============================
```

*Notice the runtime: 0.09s, down from 0.26s* — an in-memory database is also simply faster than a real file, a side benefit of fixing the isolation problem.

### Connecting sentence

Fixtures solve integration-style tests — real routes, real (if fake) database, real HTTP simulation via `TestClient`. Not every test needs all of that machinery; some logic is worth testing in complete isolation from the database entirely.

---

## Concept Unit: Mocking and Unit vs. Integration Tests

### The Problem

Every test so far — even with a fixture — still exercises the *entire* pipeline: HTTP layer, dependency injection, repository, database. That's appropriate for confirming an endpoint works end-to-end, but it's a heavy, indirect way to test one narrow piece of logic, like `PostRepository.can_modify`'s specific branching, in complete isolation from everything else.

### Introduce the concept in isolation

Create `lab_mock.py`:

```python
from unittest.mock import MagicMock

fake_repo = MagicMock()
fake_repo.can_modify.return_value = (False, "forbidden")

result = fake_repo.can_modify(post_id=1, member_id=99, role="member")
print(result)

fake_repo.can_modify.assert_called_once_with(post_id=1, member_id=99, role="member")
print("Call was verified")
```

Run it:

```bash
python lab_mock.py
```

Output:

```text
(False, 'forbidden')
Call was verified
```

*What this proves:* `fake_repo` is not a real `PostRepository` — it's a `MagicMock`, an object that accepts *any* method call and records it, returning whatever you've told it to return (`return_value`). No database, no real class, exists anywhere in this example. `assert_called_once_with` then verifies not the *result* of some computation, but the *fact that a specific call happened*, with specific arguments — a fundamentally different kind of check than every `assert response.json() == ...` written so far.

### Explain the mechanism

This is a **mock** — a fake stand-in for a real dependency, used to test code that *calls* something without needing the real thing to exist or behave correctly. `MagicMock` accepts any method or attribute access dynamically and quietly logs everything that happens to it, which is what makes `assert_called_once_with` possible afterward: the mock remembers exactly how it was used.

### Discard the throwaway example

Delete `lab_mock.py`. Write a real unit test for a route's logic, mocking the repository entirely.

### Project Change

* **Files affected:** `tests/test_units.py` (new file, deliberately separate from `tests/test_api.py`).
* **Change type:** Add.

### The New Code

```python
# tests/test_units.py
from unittest.mock import MagicMock
from main import delete_post

def test_delete_post_returns_403_when_not_authorized():
    mock_repo = MagicMock()
    mock_repo.can_modify.return_value = (False, "forbidden")

    from fastapi import HTTPException
    import pytest
    with pytest.raises(HTTPException) as exc_info:
        delete_post(post_id=1, current_member={"id": 99, "role": "member"}, posts=mock_repo)

    assert exc_info.value.status_code == 403
    mock_repo.delete.assert_not_called()
```

### Mechanical walkthrough

1. `from main import delete_post`: (first appearance of calling a route function *directly*, as a plain Python function, bypassing `TestClient`, HTTP, and FastAPI's routing entirely). This works because `delete_post` is, underneath the `@app.delete` decorator, still an ordinary Python function that can be called with explicit arguments.
2. `posts=mock_repo`: (first appearance of manually supplying a `Depends()` value directly, rather than letting FastAPI resolve it). Calling the function directly sidesteps dependency injection entirely — you're providing exactly what `Depends(get_post_repository)` would have provided, by hand.
3. `mock_repo.delete.assert_not_called()`: (already-established mock verification, applied for real). Proves not just that a `403` was raised, but that the deletion never even attempted to happen — a stronger, more specific check than the status code alone would give.

### CS Lens

**Unit tests vs. integration tests — testing a component in isolation vs. testing a real chain of components together.** This lesson's fixture-based tests are integration tests: real routing, real (if fake) database, the full pipeline. This mock-based test is a unit test: exactly one function (`delete_post`), with every dependency faked, testing nothing but that one function's own logic. Both kinds are legitimate and complementary — integration tests catch problems in how pieces fit together; unit tests catch problems in one piece's own logic, faster and with a much narrower, more specific failure signal when they fail.

### SE Lens

**Mocking is only trustworthy because of Lesson 16's Dependency Inversion — this is the concrete payoff promised back then.** `delete_post` could be tested this way specifically *because* it depends on `PostRepository`'s abstract interface (`can_modify`, `delete`), not on concrete SQL. A route still directly calling `conn.execute(...)` itself couldn't be unit-tested like this at all — there'd be nothing abstract to substitute a mock for. This is the entire reason Lesson 16's refactor mattered beyond just "less duplicated code."

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 25 items

tests/test_api.py ........................                               [ 96%]
tests/test_units.py .                                                    [100%]

============================== 25 passed in 0.09s ===============================
```

### Connecting sentence

Phase 6 is complete — routes are decoupled from raw SQL, schema changes are versioned and safe, and tests are genuinely isolated. Phase 7 returns to features, using SQL capabilities more advanced than anything used so far: aggregation, subqueries, and window functions.

---

## Closing

**Connect the pieces**
The `client` fixture gives every test in `test_api.py` its own in-memory database via `dependency_overrides`, making the whole suite independent of `social.db` and of each other. `test_delete_post_returns_403_when_not_authorized` goes further, calling `delete_post` directly with a `MagicMock` standing in for `PostRepository` entirely — verifying the route's own authorization-branching logic without a database, an HTTP client, or even FastAPI's routing machinery involved at all.

**What breaks without this**
Without fixture-based isolation, a test suite passing today provides no real guarantee it'll pass tomorrow, once `social.db` has accumulated more state from manual testing, other lessons' exercises, or a colleague's local run — exactly the "how many rows does this table actually have right now" uncertainty this project has been quietly carrying since Lesson 1.

**Exercises**
1. Write a second unit test, `test_delete_post_succeeds_for_owner`, mocking `can_modify` to return `(True, None)` and confirming `mock_repo.delete.assert_called_once_with(1)`.
2. Deliberately remove `app.dependency_overrides.clear()` from the `client` fixture, run the suite twice in a row, and observe what breaks — direct, hands-on proof of why that line exists.

**Definition of Done**
* [x] Every test in `test_api.py` runs against an isolated in-memory database via a fixture.
* [x] A unit test verifies `delete_post`'s logic using a mocked repository, with no real database involved.
* [x] Full suite passes, faster and independent of any shared file state.
* [x] Commit: `test: isolate integration tests with fixtures, add mocked unit test for route authorization logic`

---

## Context Snapshot (End of Lesson 18)

**1. File Tree (additions):** `conftest.py`, `tests/test_units.py`.

**5. Test State:** 25 tests, 25 passing — fully isolated from `social.db` and from each other.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Fixture | L18 | Reusable, injected setup/teardown for tests, via `yield` |
| `dependency_overrides` | L18 | Redirects a FastAPI `Depends()` to a different implementation, for tests |
| Mock (`MagicMock`) | L18 | A fake object standing in for a real dependency, recording how it was used |
| Unit test vs. integration test | L18 | Testing one component in isolation vs. testing a real chain of components together |

**7. Lesson Completion State:**
- Completed: Lessons 1-18, Interludes A, B, C, D — **Phase 6 complete**
- Next: Lesson 19 — Seeing Trending Posts (`COUNT`, `GROUP BY`, CTEs)

**8. Current Architecture State:**
- HTTP Layer: 20 routes
- Business Logic: `extract_hashtags`, `create_access_token`, `get_current_member`
- Data Access: `db.py`, `repositories.py`, `models.py`
- ORM: introduced, partially adopted
- Authentication: complete
- Testing: fully isolated, unit and integration tests both present
