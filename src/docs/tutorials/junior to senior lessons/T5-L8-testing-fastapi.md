# Junior to Senior — T5·L8 — Testing FastAPI With pytest

**Prerequisites:** T5·L7 (Authentication). You have a complete FastAPI application
with authentication. This lesson brings full TDD discipline to the API layer —
`TestClient`, database isolation, dependency overrides, and parametrised validation tests.

**What this lab adds:**
- `TestClient` vs `httpx.AsyncClient` — when to use each
- Database isolation: each test gets a fresh in-memory SQLite database
- `dependency_overrides` — replacing DB and auth with fakes
- `@pytest.mark.parametrize` — one test body, many input/expected pairs
- `conftest.py` — shared fixtures and factory helpers across test files
- Testing happy paths AND all error paths

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `TestClient` makes a request. The handler saves to the database. A second
>    `TestClient` request reads from the database. Both tests use the same database.
>    What problem can occur between tests?
> 2. `@pytest.mark.parametrize('title,expected', [('', 422), ('Valid', 201)])` —
>    how many test cases does this create?
> 3. A `conftest.py` fixture has `scope='session'`. Two test files use it. How many
>    times does the fixture setup run?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A test suite where:
- Each test starts with a clean state (no data leaks)
- Happy paths and all error paths are tested
- Parametrised validation tests reduce repetitive test code
- Factory helpers create test data with sensible defaults

```bash
$ pytest tests/ -v

tests/test_tasks_api.py::TestCreateTask::test_creates_task_returns_201 PASSED
tests/test_tasks_api.py::TestCreateTask::test_empty_title_returns_422[-422] PASSED
tests/test_tasks_api.py::TestCreateTask::test_empty_title_returns_422[   -422] PASSED
tests/test_tasks_api.py::TestCreateTask::test_invalid_priority_returns_422 PASSED
...
16 passed in 0.3s
```

---

### Concept: `TestClient` — Synchronous Testing Without a Running Server

**What it is:** `TestClient(app)` creates an HTTP client that makes requests
directly to the FastAPI application without starting a real HTTP server.
Requests are processed in-process, synchronously.

**The problem before — testing a running server:**

```python
# Test tries to connect to http://localhost:8000 — fails if server isn't running
import httpx

def test_list_tasks():
    response = httpx.get('http://localhost:8000/tasks/')   # ← requires server
    assert response.status_code == 200
```

**The solution:**

```python
from fastapi.testclient import TestClient
from src.main import app

client   = TestClient(app)
response = client.get('/tasks/')   # ← no server needed — in-process
assert response.status_code == 200
```

**What it hides:** The ASGI transport layer. `TestClient` uses `httpx` under the hood
with an ASGI transport that calls the FastAPI app directly. Requests, validation,
dependency injection, and response serialisation all work exactly as in production.

**`TestClient` vs `httpx.AsyncClient`:**

| `TestClient` | `httpx.AsyncClient` |
|---|---|
| Synchronous — no `await` needed | Requires `async def` tests |
| Simpler to write | More accurate simulation |
| Works for all FastAPI routes | Required when test setup is async |
| Most common in production test suites | Required for async database fixtures |

**Project application:** Use `TestClient` for most API tests. Use `AsyncClient` for
tests where the fixture itself needs to await database setup.

**You will see this again in:**
- Every FastAPI test suite uses `TestClient`
- Flask: `app.test_client()` is the equivalent
- Django: `Client()` from `django.test` is the equivalent

**Watch for:** `TestClient` handles `async def` route handlers correctly — even though
`TestClient` itself is synchronous, it uses an event loop internally to run async handlers.

---

## Step 1 — See the State Leakage Problem

```python
# Without isolation — tests can interfere:
def test_create_task():
    client.post('/tasks/', json={'title': 'Task 1'})
    tasks = client.get('/tasks/').json()
    assert len(tasks) == 1   # passes ✓ if run first

def test_list_tasks():
    tasks = client.get('/tasks/').json()
    assert len(tasks) == 0   # fails ✗ if test_create_task ran first
```

The solution is in `conftest.py` — reset state before each test.

---

### Concept: Shared Fixtures in `conftest.py`

**What it is:** `conftest.py` is a pytest configuration file that is automatically
loaded. Fixtures defined there are available to ALL test files in the same directory
and below — without any import.

**The problem before:**

```python
# Every test file repeats the same fixture:
# test_tasks.py:
@pytest.fixture
def client():
    return TestClient(app)

# test_auth.py:
@pytest.fixture
def client():      # duplicated!
    return TestClient(app)
```

**The solution:**

```python
# conftest.py (shared):
@pytest.fixture
def client() -> TestClient:
    return TestClient(app)

# test_tasks.py:
def test_list_tasks(client) -> None:     # ← automatically uses conftest fixture
    ...

# test_auth.py:
def test_register(client) -> None:      # ← same fixture, no import
    ...
```

**What it hides:** The fixture registration. pytest scans up the directory tree
for `conftest.py` files, collecting all fixtures. Any test in the project can use
any fixture defined in a parent `conftest.py`.

**Project application:** `conftest.py` holds the `reset_in_memory_store`, `client`,
and `authenticated_client` fixtures — shared across all test files.

**Smallest possible example:**

```python
# conftest.py:
import pytest
from fastapi.testclient import TestClient
from src.main import app

@pytest.fixture
def client() -> TestClient:
    return TestClient(app)

# test_example.py:
def test_health(client) -> None:     # no import needed
    assert client.get('/health').status_code == 200
```

**You will see this again in:**
- Every professional pytest suite has a `conftest.py` with shared fixtures
- Fixtures can have `scope='session'` (run once for the whole test run), `'module'`,
  `'class'`, or `'function'` (default — run once per test)

**Watch for:** Fixtures with `yield` must yield exactly once — same rule as
dependency injection functions with `yield`.

---

### Concept: `@pytest.mark.parametrize` — Data-Driven Tests

**What it is:** One test function, multiple data points. Each data point becomes a
separate test case in the output.

**The problem before — repeating the same test logic:**

```python
def test_empty_title_returns_422():
    response = client.post('/tasks/', json={'title': ''})
    assert response.status_code == 422

def test_whitespace_title_returns_422():   # same code, different data
    response = client.post('/tasks/', json={'title': '   '})
    assert response.status_code == 422

def test_valid_title_returns_201():        # same code, different expected
    response = client.post('/tasks/', json={'title': 'Valid'})
    assert response.status_code == 201
```

**The solution:**

```python
@pytest.mark.parametrize('title,expected', [
    ('',        422),   # empty
    ('   ',     422),   # whitespace only
    ('A' * 201, 422),   # too long (> 200 chars)
    ('Valid',   201),   # valid
])
def test_create_task_title_validation(client, title: str, expected: int) -> None:
    response = client.post('/tasks/', json={'title': title})
    assert response.status_code == expected
```

This generates 4 test cases. Adding a new test case is one new row in the list.

**What it hides:** The for-loop that would run the test with each data set.
pytest runs the function once per data set and names each case with its parameters.

**Project application:** Validation tests — multiple invalid inputs all produce 422.
Multiple valid inputs all produce 201. One parametrised test covers all cases.

**Smallest possible example:**

```python
@pytest.mark.parametrize('a,b,expected', [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_addition(a: int, b: int, expected: int) -> None:
    assert a + b == expected
```

**You will see this again in:**
- Validation testing: always use parametrize for multiple invalid inputs
- Edge case testing: zero, max, min, None, empty string
- Property-based testing (Hypothesis library) generates parametrize data automatically

**Watch for:** `@pytest.mark.parametrize('a,b', [(1, 2), (3, 4)])` — the string must
match the number of parameters. `'a,b'` requires 2-tuples. Wrong count raises an error.

---

## Step 2 — Build the Complete Test Fixture

Update `tests/conftest.py`:

```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.api.auth_dependency import get_current_user
from src.auth.tokens         import TokenClaims
import src.api.tasks_router  as tasks_module
import src.api.auth_router   as auth_module


# ── Factory helpers ────────────────────────────────────────────────────────

def make_task_body(
    title:    str = 'Test task',
    priority: str = 'medium',
    **kwargs,
) -> dict:
    """Creates a valid task request body with sensible defaults."""
    return {'title': title, 'priority': priority, **kwargs}


def make_user_body(
    email:    str = 'test@example.com',
    password: str = 'secret123',
) -> dict:
    return {'email': email, 'password': password}


# ── State reset ────────────────────────────────────────────────────────────

@pytest.fixture(autouse=True)
def reset_in_memory_stores() -> None:
    """Resets all in-memory stores before each test."""
    tasks_module._tasks.clear()
    tasks_module._next_id = 1
    auth_module._users.clear()
    yield


# ── Clients ────────────────────────────────────────────────────────────────

@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def authenticated_client() -> TestClient:
    """Client where get_current_user is overridden — no real token needed."""
    def fake_user() -> TokenClaims:
        return TokenClaims(user_id='u-test', email='test@example.com')

    app.dependency_overrides[get_current_user] = fake_user
    yield TestClient(app)
    app.dependency_overrides.clear()
```

---

## Step 3 — Write the Complete API Test Suite

Create `tests/test_tasks_api_complete.py`:

```python
# tests/test_tasks_api_complete.py
import pytest
from fastapi.testclient import TestClient


# ── Parametrised validation tests ─────────────────────────────────────────

@pytest.mark.parametrize('title,expected_status', [
    ('Valid task',   201),
    ('',             422),    # empty
    ('   ',          422),    # whitespace only
    ('a' * 201,      422),    # too long — > 200 chars
])
def test_create_task_title_validation(
    client:          TestClient,
    title:           str,
    expected_status: int,
) -> None:
    response = client.post('/tasks/', json={'title': title})
    assert response.status_code == expected_status


@pytest.mark.parametrize('priority,expected_status', [
    ('high',   201),
    ('medium', 201),
    ('low',    201),
    ('urgent', 422),    # invalid
    ('HIGH',   201),    # normalised — accepted
    ('',       422),    # empty
])
def test_create_task_priority_validation(
    client:          TestClient,
    priority:        str,
    expected_status: int,
) -> None:
    response = client.post('/tasks/', json={'title': 'Task', 'priority': priority})
    assert response.status_code == expected_status


# ── Happy path tests ───────────────────────────────────────────────────────

class TestCreateTask:

    def test_creates_task_with_id_and_defaults(self, client: TestClient) -> None:
        response = client.post('/tasks/', json={'title': 'Write tests', 'priority': 'high'})
        assert response.status_code == 201
        body = response.json()
        assert body['id']       == 't-1'
        assert body['title']    == 'Write tests'
        assert body['priority'] == 'high'
        assert body['done']     is False

    def test_sequential_ids_assigned(self, client: TestClient) -> None:
        r1 = client.post('/tasks/', json={'title': 'A'})
        r2 = client.post('/tasks/', json={'title': 'B'})
        assert r1.json()['id'] == 't-1'
        assert r2.json()['id'] == 't-2'

    def test_priority_is_normalised_to_lowercase(self, client: TestClient) -> None:
        response = client.post('/tasks/', json={'title': 'Task', 'priority': 'HIGH'})
        assert response.json()['priority'] == 'high'


class TestGetTask:

    def test_returns_task_by_id(self, client: TestClient) -> None:
        client.post('/tasks/', json={'title': 'Deploy'})
        response = client.get('/tasks/t-1')
        assert response.status_code == 200
        assert response.json()['title'] == 'Deploy'

    def test_returns_404_for_unknown_id(self, client: TestClient) -> None:
        response = client.get('/tasks/t-999')
        assert response.status_code == 404
        assert 'detail' in response.json()


class TestListTasks:

    def test_returns_empty_list_when_no_tasks(self, client: TestClient) -> None:
        assert client.get('/tasks/').json() == []

    def test_returns_all_tasks(self, client: TestClient) -> None:
        client.post('/tasks/', json={'title': 'A'})
        client.post('/tasks/', json={'title': 'B'})
        assert len(client.get('/tasks/').json()) == 2

    @pytest.mark.parametrize('priority,expected_count', [
        ('high',   1),
        ('low',    1),
        ('medium', 0),
    ])
    def test_filters_by_priority(
        self,
        client:         TestClient,
        priority:       str,
        expected_count: int,
    ) -> None:
        client.post('/tasks/', json={'title': 'H', 'priority': 'high'})
        client.post('/tasks/', json={'title': 'L', 'priority': 'low'})
        response = client.get(f'/tasks/?priority={priority}')
        assert response.status_code == 200
        assert len(response.json()) == expected_count


class TestUpdateTask:

    def test_updates_title(self, client: TestClient) -> None:
        client.post('/tasks/', json={'title': 'Old title'})
        response = client.patch('/tasks/t-1', json={'title': 'New title'})
        assert response.status_code == 200
        assert response.json()['title'] == 'New title'

    def test_marks_task_as_done(self, client: TestClient) -> None:
        client.post('/tasks/', json={'title': 'Write tests'})
        response = client.patch('/tasks/t-1', json={'done': True})
        assert response.json()['done'] is True

    def test_returns_404_for_unknown_task(self, client: TestClient) -> None:
        response = client.patch('/tasks/t-999', json={'title': 'New'})
        assert response.status_code == 404


class TestDeleteTask:

    def test_deletes_task_and_returns_204(self, client: TestClient) -> None:
        client.post('/tasks/', json={'title': 'Write tests'})
        response = client.delete('/tasks/t-1')
        assert response.status_code == 204
        assert client.get('/tasks/t-1').status_code == 404

    def test_returns_404_for_unknown_task(self, client: TestClient) -> None:
        assert client.delete('/tasks/t-999').status_code == 404


class TestAuthFlow:

    def test_full_register_login_flow(self, client: TestClient) -> None:
        """End-to-end: register → login → access."""
        # Register:
        reg = client.post('/auth/register', json={
            'email': 'alice@e.com', 'password': 'secret123'
        })
        assert reg.status_code == 201

        # Login:
        login = client.post('/auth/token', data={
            'username': 'alice@e.com', 'password': 'secret123'
        })
        assert login.status_code == 200
        assert 'access_token' in login.json()
```

### SAVE AND TRY

```bash
pytest tests/test_tasks_api_complete.py -v
```

**You should see:**
```
tests/test_tasks_api_complete.py::test_create_task_title_validation[Valid task-201] PASSED
tests/test_tasks_api_complete.py::test_create_task_title_validation[-422] PASSED
tests/test_tasks_api_complete.py::test_create_task_title_validation[   -422] PASSED
tests/test_tasks_api_complete.py::test_create_task_title_validation[aaa...-422] PASSED
...
tests/test_tasks_api_complete.py::TestAuthFlow::test_full_register_login_flow PASSED

22 passed
```

**Change something:** Remove `autouse=True` from `reset_in_memory_stores` in `conftest.py`.
Run the tests again. Expected: some tests fail because state from earlier tests leaks into
later tests. Put `autouse=True` back.

---

## 🎯 Challenge: Test the Full Authenticated API Flow

**You know:** `TestClient`, `dependency_overrides`, `conftest.py`, `parametrize`.

**Task:** Write a test that:
1. Registers a user
2. Logs in and gets a token
3. Uses the token to access a protected endpoint (add auth to `/tasks/`)
4. Verifies that accessing without a token returns 401

You'll need to update `tasks_router.py` to require authentication.

Write 4 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

**Update `tasks_router.py` to require auth:**
```python
from src.auth.tokens         import TokenClaims
from src.api.auth_dependency import get_current_user

@router.get('/', response_model=list[TaskResponse])
def list_tasks(
    current_user: TokenClaims = Depends(get_current_user),  # ← add auth
    priority: str | None = None,
    done:     bool | None = None,
) -> list[TaskResponse]:
    ...
```

**Tests:**
```python
def test_list_tasks_requires_authentication(client: TestClient) -> None:
    response = client.get('/tasks/')   # no auth header
    assert response.status_code == 401

def test_list_tasks_works_with_valid_token(client: TestClient) -> None:
    # Register and login:
    client.post('/auth/register', json={'email': 'a@e.com', 'password': 'secret123'})
    login    = client.post('/auth/token', data={'username': 'a@e.com', 'password': 'secret123'})
    token    = login.json()['access_token']
    response = client.get('/tasks/', headers={'Authorization': f'Bearer {token}'})
    assert response.status_code == 200

def test_create_task_requires_auth(client: TestClient) -> None:
    response = client.post('/tasks/', json={'title': 'Write tests'})
    assert response.status_code == 401

def test_authenticated_client_fixture_bypasses_auth(authenticated_client: TestClient) -> None:
    response = authenticated_client.get('/tasks/')   # override bypasses real auth
    assert response.status_code == 200
```

</details>

---

## Final Check

| Test pattern | When to use |
|---|---|
| `TestClient` (sync) | Almost all API tests — simpler, no `await` |
| `autouse=True` fixture | State cleanup that must run for EVERY test |
| `dependency_overrides` | Replace DB, auth, or any dependency with a fake |
| `@parametrize` | Same assertion, many inputs (especially validation) |
| Factory helpers in `conftest.py` | Create test data with defaults — one-line setup |
| `httpx.AsyncClient` | When test SETUP itself needs to be async |

---

## Quick Check Answers

**1. Two tests share the same database. What problem can occur?**

State leakage. If test A creates a task and test B checks that the task list is empty,
test B fails when run after test A. Test results depend on execution order, which is
non-deterministic. The fix: `autouse=True` fixtures that reset state before each test,
or database-level isolation (each test gets a fresh in-memory SQLite database, dropped after).

**2. `@parametrize('title,expected', [('', 422), ('Valid', 201)])` — how many test cases?**

Two — one for each tuple in the list. pytest runs the function twice with different
parameter values and names each: `test_...[title0-422]` and `test_...[Valid-201]`.
If you have multiple `@parametrize` decorators on the same function, the total is the
product: `@parametrize('a', [1, 2])` × `@parametrize('b', ['x', 'y'])` = 4 test cases.

**3. `scope='session'` fixture. Two test files use it. How many times does setup run?**

Once — for the entire test session. `scope='session'` means the fixture is created at
the start of the test session and shared across ALL tests that use it. The setup runs
once; teardown runs once (after all tests complete). Compare: `scope='function'` (default)
runs setup and teardown for every single test that uses the fixture.
