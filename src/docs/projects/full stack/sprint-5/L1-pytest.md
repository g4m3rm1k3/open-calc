# Sprint 5 · Lesson 1 — pytest: test your FastAPI endpoints

## What you will build

By the end of this lesson, a test suite covers `GET /orders`, `POST /orders`, and `GET /orders/999` (404 case). Tests run against a real test database, not a mock. You will understand the arrange-act-assert structure, pytest fixtures, dependency overrides, and how to read a test failure. Every test is independent — running them in any order produces the same result.

---

## What you need to know first

- Sprint 3 L3: SQLAlchemy, `get_db`, `Base`, `engine`.
- Sprint 4 L3: Protected endpoints, `get_current_user`.
- Sprint 2 L3: Route handler logic.

---

## The lesson

---

### 1. What a test actually is

**The problem:** You have been testing manually — opening `/docs`, clicking buttons, checking responses. Manual testing is necessary but insufficient: it does not run automatically, it does not catch regressions (bugs introduced by later changes), and it does not scale. Every time you change `main.py`, you must re-verify every endpoint by hand. Automated tests do this for you.

**What a test is:** A test is a function that calls some code with known inputs, asserts that the output matches expectations, and reports pass or fail. Nothing more. The sophisticated test infrastructure around this basic idea — fixtures, parametrize, coverage reports — is scaffolding. The test itself is: call the thing, check the result.

**Arrange-Act-Assert:** Every test has three parts, in this order:

1. **Arrange** — set up the preconditions: create test data, configure dependencies, initialise state
2. **Act** — call the code being tested (in this case, send an HTTP request)
3. **Assert** — verify the result matches expectations: check the status code, check the response body

These three parts are so universal that they have names in every test framework: `Given/When/Then` in BDD, `setUp/test/assert` in unittest, `arrange/act/assert` in xUnit. The names change; the structure does not.

Install pytest and `httpx` (the HTTP client that FastAPI's test client uses):

```
pip install pytest httpx
pip freeze > requirements.txt
```

---

### 2. Set up the test database

**The problem:** Tests must not write to the development database — test data would pollute real data, and tests that delete data would destroy real records. Tests need their own isolated database.

Create `backend/conftest.py`:

```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from database import Base, get_db
from main import app
from orm_models import WorkOrderModel, UserModel  # noqa: F401
from auth import hash_password

TEST_DATABASE_URL = "postgresql://devuser:devpassword@localhost:5432/workorders_test"

test_engine = create_engine(TEST_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)

@pytest.fixture
def db_session():
    Base.metadata.create_all(bind=test_engine)
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

@pytest.fixture
def authenticated_client(client, db_session):
    test_user = UserModel(
        username="testuser",
        hashed_password=hash_password("testpass")
    )
    db_session.add(test_user)
    db_session.flush()

    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "testpass"
    })
    token = response.json()["access_token"]
    client.headers = {"Authorization": f"Bearer {token}"}
    return client
```

**Before running tests, create the test database:**

```
docker exec -it fullstack-project-database-1 psql -U devuser -c "CREATE DATABASE workorders_test;"
```

**Walkthrough:**

`TEST_DATABASE_URL` — a separate database URL pointing to `workorders_test`. This database is entirely separate from `workorders` (the development database). Test writes do not affect development data.

**The `setup_test_database` fixture** with `scope="session"`:

`scope="session"` means this fixture runs once for the entire test session — not once per test. `Base.metadata.create_all(bind=test_engine)` creates all tables in the test database. The `yield` runs all tests. `Base.metadata.drop_all(bind=test_engine)` drops all tables at the end. Clean slate every session.

A **pytest fixture** is a function decorated with `@pytest.fixture`. Tests declare what fixtures they need by naming them as parameters. pytest injects them automatically. This is the same dependency injection pattern as FastAPI's `Depends` — declare what you need; the framework provides it.

**The `db_session` fixture:**

`connection = test_engine.connect()` — opens a raw SQLAlchemy connection.

`transaction = connection.begin()` — starts a transaction **before** the test runs.

`session = TestingSessionLocal(bind=connection)` — creates a session bound to this specific connection (not the pool). This means the session and the test use the same transaction.

`yield session` — the test runs here, with `db_session` available. The test's writes (inserts, updates) happen inside the transaction started above.

`transaction.rollback()` — after the test finishes, rolls back all changes. The database is restored to its pre-test state. This makes every test independent: one test's writes cannot affect the next test.

**The `client` fixture:**

`app.dependency_overrides[get_db] = override_get_db` — **dependency override**. FastAPI allows replacing a dependency with a different function for testing. Here, `get_db` is replaced with `override_get_db`, which yields the test `db_session` instead of a production session. Every route that depends on `get_db` now receives the test session — and therefore operates within the test transaction that will be rolled back.

`TestClient(app)` — FastAPI's test client. Sends HTTP requests directly to your FastAPI app without a running server. Requests are synchronous (no `await`), making tests simpler to write.

`app.dependency_overrides.clear()` — restores all overrides after the test, so other test files are not affected.

**The `authenticated_client` fixture:**

Creates a test user, logs in, and sets the `Authorization` header on every subsequent request through that client. Tests that need authentication use `authenticated_client`; tests that verify 401 responses use `client`.

**CS lens — transactions as test isolation.** The rollback pattern gives every test a clean database state without recreating the schema on every test. This works because SQLAlchemy's transaction isolation: writes during the test are visible within the same transaction (the test can verify them), but are not committed, so they disappear on rollback. This is O(1) cleanup — rollback is faster than `DELETE FROM work_orders`.

**SE lens — the test database is infrastructure.** The test database is not mocked — it is a real Postgres instance with the real schema. This means tests verify the actual SQL your ORM generates against a real database engine. Mocking the database would miss bugs in SQLAlchemy queries, missing indexes, and constraint violations. Real database tests are slower than mock tests but catch more real bugs.

---

### 3. Write the first tests

Create `backend/tests/test_orders.py`:

```python
import pytest
from fastapi.testclient import TestClient

def test_list_orders_returns_empty_list(authenticated_client: TestClient):
    # Arrange: no orders in the database (transaction is empty)

    # Act
    response = authenticated_client.get("/orders")

    # Assert
    assert response.status_code == 200
    assert response.json() == []

def test_create_order_returns_201_with_id(authenticated_client: TestClient):
    # Arrange
    order_payload = {
        "title": "Fix conveyor belt",
        "status": "open",
        "priority": "high"
    }

    # Act
    response = authenticated_client.post("/orders", json=order_payload)

    # Assert
    assert response.status_code == 201
    body = response.json()
    assert body["title"] == "Fix conveyor belt"
    assert body["status"] == "open"
    assert body["priority"] == "high"
    assert "id" in body
    assert isinstance(body["id"], int)

def test_get_order_returns_created_order(authenticated_client: TestClient):
    # Arrange: create an order first
    create_response = authenticated_client.post("/orders", json={
        "title": "Lubricate pump",
        "status": "open",
        "priority": "medium"
    })
    order_id = create_response.json()["id"]

    # Act
    response = authenticated_client.get(f"/orders/{order_id}")

    # Assert
    assert response.status_code == 200
    assert response.json()["id"] == order_id
    assert response.json()["title"] == "Lubricate pump"

def test_get_nonexistent_order_returns_404(authenticated_client: TestClient):
    # Arrange: no order with ID 99999 exists

    # Act
    response = authenticated_client.get("/orders/99999")

    # Assert
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()

def test_orders_requires_authentication(client: TestClient):
    # Arrange: client has no Authorization header

    # Act
    response = client.get("/orders")

    # Assert
    assert response.status_code == 401
```

Run the tests:

```
cd backend
pytest tests/ -v
```

Expected output:
```
tests/test_orders.py::test_list_orders_returns_empty_list PASSED
tests/test_orders.py::test_create_order_returns_201_with_id PASSED
tests/test_orders.py::test_get_order_returns_created_order PASSED
tests/test_orders.py::test_get_nonexistent_order_returns_404 PASSED
tests/test_orders.py::test_orders_requires_authentication PASSED

5 passed in 3.21s
```

**Walkthrough — reading a failure before it happens:**

If `test_create_order_returns_201_with_id` fails with a 401 instead of 201, the output looks like:

```
FAILED tests/test_orders.py::test_create_order_returns_201_with_id - AssertionError: assert 401 == 201
```

The failure shows: the test name, the file, the assertion that failed, and the actual vs expected values. To see more: `pytest tests/ -v --tb=short` adds a short traceback showing the exact line in the test that failed.

**CS lens — test as specification.** Each test is a specification: `test_create_order_returns_201_with_id` says "when you POST a valid order, you should receive 201 and the response body should contain an integer `id`." If the implementation changes to return 200 (incorrect for creation), the test catches it immediately. The test suite is machine-executable documentation that the implementation must satisfy.

**SE lens — test independence as a constraint.** The `db_session` transaction rollback is not just a cleanup mechanism — it is an isolation guarantee. Tests that run in a shared database and leave data behind cause **test pollution**: test B fails because test A left unexpected data. Rollback guarantees that every test starts from the same baseline. Test independence means you can run any subset of tests, in any order, and get the same results.

**What breaks without this:** If you forget to add `authenticated_client` to a test parameter and use an unauthenticated `client` instead, the test that calls a protected endpoint receives 401 and fails — even though the endpoint logic is correct. The failure message tells you: `assert 401 == 200`. Check the fixture being used.

---

### 4. Read a failing test and diagnose it

**The problem:** Tests will fail. Reading the failure message quickly is a skill.

Introduce a deliberate bug: temporarily change the `create_order` route to return `status_code=200` instead of `201`. Run the tests.

```
FAILED tests/test_orders.py::test_create_order_returns_201_with_id
  AssertionError: assert 201 == 200
   +  where 200 = <Response [200 OK]>.status_code
```

**Reading this output:**

- `FAILED` — the test did not pass
- `test_create_order_returns_201_with_id` — the failing test's name
- `AssertionError: assert 201 == 200` — the assert statement wrote `assert response.status_code == 201`; the actual value was 200
- `where 200 = <Response [200 OK]>.status_code` — the right side of the comparison: `response.status_code` evaluated to `200`

The failure message tells you exactly what was wrong without reading the test code. Revert the change. Run the tests again — all pass.

**CS lens — assertion as invariant checking.** An assertion is a runtime check that a condition must be true. In tests, assertions check postconditions: after calling the code, certain things must be true. When an assertion fails, it means the invariant was violated — the code does not satisfy its contract. This is the same principle as database constraints (which assert invariants at the data layer) and Pydantic validators (which assert invariants at the HTTP boundary).

---

## Connect the pieces

You now have a test suite that:
- Uses a real Postgres test database (catches database bugs)
- Rolls back every test transaction (ensures test independence)
- Overrides `get_db` with a test session (controls the database used)
- Tests authentication enforcement (verifies the 401 guard)

Lesson 2 adds tests for error cases and edge conditions. Lesson 3 adds React frontend tests. Lesson 4 runs everything in GitHub Actions on every push.

---

## What breaks without this

**Tests share state:** If you do not use the transaction rollback pattern and tests insert data, one test's data is visible in the next test. A test that expects an empty list fails because a previous test left data behind. Fix: the transaction rollback pattern in `db_session`.

**`app.dependency_overrides.clear()` missing:** If you forget to clear overrides, the override persists across test files. Other test files may unexpectedly receive the test database session. Fix: `app.dependency_overrides.clear()` in the `client` fixture after `yield`.

---

## Definition of done

- [ ] `pytest tests/ -v` shows 5 tests passing
- [ ] Tests run against `workorders_test`, not `workorders`
- [ ] Each test function has visible Arrange/Act/Assert sections (comments or whitespace)
- [ ] `test_orders_requires_authentication` fails if you remove `Depends(get_current_user)` from the list route
- [ ] You can explain what a pytest fixture is and what `scope="session"` means
- [ ] You can read a failing test output and identify the asserted value vs actual value

**Git commit:**

```
git add backend/conftest.py backend/tests/
git commit -m "Add pytest test suite: order CRUD and authentication tests against real test database with transaction rollback"
```
