# Sprint 5 · Lesson 2 — Testing edge cases and validation errors

## What you will build

By the end of this lesson, the test suite covers: invalid payloads (Pydantic rejection), duplicate user registration (409), update and delete happy paths, the 404 case for update/delete, and parametrized tests for multiple invalid inputs. You will understand what to test and what not to test, and how to use `pytest.mark.parametrize` to eliminate repetitive test functions.

---

## What you need to know first

- Sprint 5 L1: `conftest.py`, `db_session`, `authenticated_client`, `TestClient`, arrange-act-assert.
- Sprint 2 L3: All 5 CRUD routes, `HTTPException`, status codes.
- Sprint 2 L2: Pydantic validation, `ValidationError`.

---

## The lesson

---

### 1. Test error paths, not just happy paths

**The problem:** The Sprint 5 L1 tests cover the happy path — sending valid inputs and receiving the expected success responses. But your code has error branches: what happens when the order ID does not exist? When the request body is missing a required field? When the same username registers twice? These branches need tests too. If you only test success paths, a bug in your error handling is invisible until a user hits it in production.

**The golden rule of error path testing:** Every `raise HTTPException(...)` or Pydantic validation error in your routes should have at least one test that exercises it.

Add to `backend/tests/test_orders.py`:

```python
def test_update_nonexistent_order_returns_404(authenticated_client: TestClient):
    # Arrange: no order with ID 99999 exists
    update_payload = {
        "title": "Updated title",
        "status": "in_progress",
        "priority": "low"
    }

    # Act
    response = authenticated_client.put("/orders/99999", json=update_payload)

    # Assert
    assert response.status_code == 404

def test_delete_nonexistent_order_returns_404(authenticated_client: TestClient):
    # Act
    response = authenticated_client.delete("/orders/99999")

    # Assert
    assert response.status_code == 404

def test_update_order_returns_updated_fields(authenticated_client: TestClient):
    # Arrange: create an order to update
    create_resp = authenticated_client.post("/orders", json={
        "title": "Old title",
        "status": "open",
        "priority": "low"
    })
    order_id = create_resp.json()["id"]

    # Act
    response = authenticated_client.put(f"/orders/{order_id}", json={
        "title": "New title",
        "status": "in_progress",
        "priority": "high"
    })

    # Assert
    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "New title"
    assert body["status"] == "in_progress"
    assert body["id"] == order_id

def test_delete_order_returns_204_and_subsequent_get_returns_404(authenticated_client: TestClient):
    # Arrange: create an order to delete
    create_resp = authenticated_client.post("/orders", json={
        "title": "To be deleted",
        "status": "open",
        "priority": "medium"
    })
    order_id = create_resp.json()["id"]

    # Act
    delete_response = authenticated_client.delete(f"/orders/{order_id}")

    # Assert
    assert delete_response.status_code == 204
    get_response = authenticated_client.get(f"/orders/{order_id}")
    assert get_response.status_code == 404
```

**Walkthrough — `test_delete_order_returns_204_and_subsequent_get_returns_404`:**

This test makes two HTTP requests — a DELETE then a GET. The test has one Act and two Asserts. The second Assert (the GET after DELETE) verifies that the deletion was durable: the order is gone, not just hidden. A test that only checks the 204 response is insufficient — it does not verify the side effect (actual deletion). When Act has a side effect, verify that the side effect happened.

**CS lens — testing side effects vs. outputs.** Pure functions (same input, same output, no side effects) are the easiest to test: call the function, check the return value. Route handlers are not pure — they mutate state (insert/update/delete database rows). For stateful code, you must test both the response (immediate output) and the resulting state (side effect). The `test_delete_order` test does exactly this.

**SE lens — test the contract, not the implementation.** Notice: these tests send HTTP requests. They do not import and call `db.query(WorkOrderModel).filter(...)` directly. Tests should test the contract (the HTTP interface) — not the implementation (the SQLAlchemy queries). If you refactor from SQLAlchemy to a different ORM, the tests should still pass unchanged because the HTTP contract has not changed. Testing the implementation couples tests to code structure, making refactoring harder.

**What breaks without this:** If your 404 branch has a bug — say, the filter uses `==` instead of `.first()` and raises an exception instead of returning None — only the error path test catches it. Happy path tests never exercise this code path.

---

### 2. Test validation errors

**The problem:** Pydantic validates incoming request bodies. What happens when a client sends a request missing required fields? You expect a 422 (Unprocessable Entity) — but does your application actually return 422, or does it crash?

Add to `backend/tests/test_orders.py`:

```python
def test_create_order_missing_title_returns_422(authenticated_client: TestClient):
    # Arrange: missing required "title" field
    invalid_payload = {
        "status": "open",
        "priority": "high"
        # no "title"
    }

    # Act
    response = authenticated_client.post("/orders", json=invalid_payload)

    # Assert
    assert response.status_code == 422
    body = response.json()
    assert "detail" in body

def test_create_order_empty_body_returns_422(authenticated_client: TestClient):
    # Act
    response = authenticated_client.post("/orders", json={})

    # Assert
    assert response.status_code == 422
```

**Walkthrough:**

`422 Unprocessable Entity` — FastAPI and Pydantic automatically return 422 when a request body fails validation. The response body is a structured error: `{"detail": [{"loc": ["body", "title"], "msg": "field required", "type": "value_error.missing"}]}`. You do not write this logic — it is built in to FastAPI's integration with Pydantic.

`assert "detail" in body` — this is an intentionally loose assertion. You are not asserting the exact error message — only that the response has a `detail` field (which is FastAPI's error shape). Asserting exact Pydantic error message strings is brittle: the message text changes between Pydantic versions, causing tests to fail on a library upgrade even though the code is correct.

**CS lens — 422 vs. 400.** HTTP 400 (Bad Request) means the request was syntactically malformed — unparseable JSON, wrong Content-Type. HTTP 422 (Unprocessable Entity) means the request was syntactically valid (parseable JSON) but semantically invalid (missing required fields, wrong types). FastAPI uses 422 for Pydantic validation failures because the JSON was valid — the content was not. Some frameworks use 400 for both; FastAPI follows the stricter HTTP specification.

**SE lens — Pydantic as a validation boundary.** The 422 errors in these tests are generated entirely by Pydantic, not by your code. This is the value of validating at the HTTP boundary: your route handlers receive already-validated, typed data. They never need to check `if "title" not in data`. The boundary does this. Testing the 422 response confirms the boundary is in place — if someone removed the `title: str` field from `WorkOrderCreate`, this test would fail.

**What breaks without this:** If someone changes `WorkOrderCreate` to make `title` optional with a default, the 422 test fails — alerting you that the schema changed. Without the test, the schema change silently ships and clients start receiving orders with blank titles.

---

### 3. Use `parametrize` to test multiple inputs without repetition

**The problem:** You want to verify that several different invalid payloads all return 422. Writing one test function per invalid payload produces repetitive code that is hard to maintain. `pytest.mark.parametrize` runs the same test function with different arguments, producing separate test entries in the output.

Add to `backend/tests/test_orders.py`:

```python
import pytest

@pytest.mark.parametrize("invalid_payload,description", [
    ({}, "empty body"),
    ({"status": "open"}, "missing title and priority"),
    ({"title": "X", "status": "open"}, "missing priority"),
    ({"title": "X", "priority": "high"}, "missing status"),
])
def test_create_order_invalid_payloads_return_422(
    authenticated_client: TestClient,
    invalid_payload: dict,
    description: str
):
    response = authenticated_client.post("/orders", json=invalid_payload)
    assert response.status_code == 422, f"Expected 422 for: {description}"
```

Run `pytest tests/ -v`. Output now includes:

```
tests/test_orders.py::test_create_order_invalid_payloads_return_422[invalid_payload0-empty body] PASSED
tests/test_orders.py::test_create_order_invalid_payloads_return_422[invalid_payload1-missing title and priority] PASSED
tests/test_orders.py::test_create_order_invalid_payloads_return_422[invalid_payload2-missing priority] PASSED
tests/test_orders.py::test_create_order_invalid_payloads_return_422[invalid_payload3-missing status] PASSED
```

Each parameter combination becomes a separate test entry. If one fails, pytest shows exactly which parameters caused the failure — not just that the function failed.

**Walkthrough:**

`@pytest.mark.parametrize("invalid_payload,description", [...])` — the first argument is a comma-separated string naming the parameters (must match the function signature). The second argument is a list of tuples, one per test case.

`assert response.status_code == 422, f"Expected 422 for: {description}"` — the second argument to `assert` is the failure message. When the assertion fails, pytest prints this message. The `description` parameter explains which case failed without needing to read the parameters.

`description` is not used in the assertion logic — it only exists as a human-readable label for the test ID. pytest uses it to name the test case in the output.

**CS lens — parametrize as data-driven testing.** Data-driven testing separates test logic (the assertions) from test data (the inputs). The same assertion runs on multiple inputs. This is the test equivalent of a function — instead of writing `test_422_empty`, `test_422_missing_title`, `test_422_missing_status`, you write the assertion once and provide the data separately. The data is easy to extend: adding a new invalid case is one tuple added to the list.

**SE lens — parametrize vs. loops in tests.** A common anti-pattern is writing a loop inside a test: `for payload in invalid_payloads: response = client.post(...); assert ...`. This is wrong for two reasons: (1) if one iteration fails, the loop stops — you cannot see which later cases also fail; (2) the test output shows one test, not one test per case. `parametrize` solves both: each case is independent, and each case appears separately in the output.

---

### 4. Test the user registration error path

Create `backend/tests/test_auth.py`:

```python
from fastapi.testclient import TestClient

def test_register_returns_201_with_username(client: TestClient):
    # Arrange
    payload = {"username": "newuser", "password": "securepass"}

    # Act
    response = client.post("/auth/register", json=payload)

    # Assert
    assert response.status_code == 201
    body = response.json()
    assert body["username"] == "newuser"
    assert "hashed_password" not in body
    assert "password" not in body

def test_register_duplicate_username_returns_409(client: TestClient):
    # Arrange: register once
    client.post("/auth/register", json={"username": "duplicate", "password": "pass1"})

    # Act: register again with the same username
    response = client.post("/auth/register", json={"username": "duplicate", "password": "pass2"})

    # Assert
    assert response.status_code == 409
    assert "already" in response.json()["detail"].lower()

def test_login_wrong_password_returns_401(client: TestClient):
    # Arrange: register a user
    client.post("/auth/register", json={"username": "logintest", "password": "correct"})

    # Act: login with wrong password
    response = client.post("/auth/login", json={"username": "logintest", "password": "wrong"})

    # Assert
    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"].lower()

def test_login_nonexistent_username_returns_401(client: TestClient):
    # Act: login with a username that never existed
    response = client.post("/auth/login", json={"username": "nobody", "password": "any"})

    # Assert
    assert response.status_code == 401

def test_login_wrong_and_nonexistent_return_same_error_message(client: TestClient):
    # Arrange: one user exists
    client.post("/auth/register", json={"username": "exists", "password": "correct"})

    # Act: wrong password vs non-existent user
    wrong_password = client.post("/auth/login", json={"username": "exists", "password": "wrong"})
    no_user = client.post("/auth/login", json={"username": "nobody", "password": "any"})

    # Assert: both return the same error message (prevent username enumeration)
    assert wrong_password.json()["detail"] == no_user.json()["detail"]
```

**Walkthrough — `test_register_duplicate_username_returns_409`:**

The first `client.post("/auth/register", ...)` runs and succeeds (the transaction hasn't been rolled back yet — rollback happens after the test function returns). The second `client.post("/auth/register", ...)` runs within the same test function, still within the same transaction. The duplicate username violates the `UNIQUE` constraint on the `username` column. The register endpoint catches `IntegrityError` and raises `HTTPException(409)`.

This works because both requests use the same `db_session` (provided by the `client` fixture). The first insert is visible to the second within the same transaction.

**Walkthrough — `test_login_wrong_and_nonexistent_return_same_error_message`:**

This test has two Acts and one combined Assert. It verifies a security property: that the error messages are identical. If someone changed the register endpoint to return `"Username already exists"` for wrong-password and `"User not found"` for unknown username, this test would fail, alerting that username enumeration is now possible.

**CS lens — 409 Conflict as semantic HTTP.** 409 Conflict means: "the request could not be completed due to a conflict with the current state of the target resource." Duplicate username is a state conflict: the user already exists. This is semantically more precise than 400 (syntactically wrong request) or 422 (validation failed). A client receiving 409 knows to present the message "username already taken" — distinct from "you're missing fields" (422) or "server error" (500).

**SE lens — security tests are tests too.** `test_login_wrong_and_nonexistent_return_same_error_message` is a security test. It asserts that a specific vulnerability (username enumeration) does not exist. Without this test, a refactor that accidentally exposes different error messages for different failure modes would not be caught. Security properties should be expressed as automated tests — not just verified once during development and trusted forever.

**What breaks without this:** If the 409 handler is removed from the register route (someone simplifies the code and forgets the IntegrityError catch), registration with a duplicate username would return 500 (unhandled exception) instead of 409. Only the `test_register_duplicate_username_returns_409` test catches this regression.

---

### 5. What not to test

**The problem:** Knowing what to test is as important as knowing how to test. Testing the wrong things wastes time writing and maintaining tests that do not catch bugs.

**Do not test:**

**Library internals.** Do not write `test_bcrypt_hashes_password_correctly` that calls `hash_password("x")` and checks the hash starts with `$2b$`. You are testing bcrypt — not your code. If bcrypt breaks, you have bigger problems than a failing unit test. Your test for registration verifies that a user can log in after registering — that is sufficient coverage of the hashing.

**FastAPI's own validation.** Do not write a test that verifies FastAPI returns 422 for a missing Content-Type header. FastAPI does this by default. You are testing the framework, not your application. Test your business logic and your HTTP contracts.

**Trivial getters.** Do not test `WorkOrder.title` returns the value you set it to. SQLAlchemy models are not logic — testing them is testing the ORM.

**Implementation details.** Do not test that `db.add()` was called. That is the ORM call inside your handler — test the HTTP response, not the internal steps. If you refactor from `db.add()` to a repository class, the test should still pass unchanged.

**Do test:**

- Every branch of your route handlers that raises `HTTPException`
- Authentication and authorisation enforcement (which endpoints require a token)
- Validation boundaries (required fields, type constraints)
- Side effects: after a DELETE, the resource is gone; after an UPDATE, the new values are returned
- Security properties: duplicate username detection, unified error messages for auth failures

**The test hierarchy:**

```
More coverage, more value:
  Integration tests (TestClient → real DB)     ← what you're writing now
  Unit tests (pure functions with no I/O)       ← useful for complex logic
  Mocked DB tests                               ← avoid in this stack
```

With FastAPI + SQLAlchemy, integration tests (TestClient + real test DB) provide the best return on investment. They test your HTTP contract, your Pydantic models, your ORM queries, and your database constraints in one test.

**CS lens — the oracle problem.** Every test assertion is an oracle: a claim that "this output is correct." Writing good tests requires knowing what correct means — a prerequisite that is harder than it sounds. For trivial code (getters, framework behaviour), the oracle is just "the library works." Testing this adds noise. For business logic (authentication, data validation, error handling), the oracle is your specification. Testing this adds signal. Write tests where you have something to say — where the correct output is not obvious from reading the framework documentation.

**SE lens — tests as regression detectors.** The primary value of a test suite is not finding bugs today — it is catching regressions tomorrow. A regression is a bug introduced by a change that broke previously-working functionality. Tests for edge cases and error paths are the most valuable regression detectors because they test branches that are not exercised in normal usage. When someone refactors the error handling code in Sprint 7, these tests are the net that catches the regressions.

---

## Connect the pieces

The test suite now covers:
- Happy path CRUD (Lesson 1)
- All error paths: 404 on missing resources, 422 on invalid payloads, 409 on duplicates
- Authentication enforcement: 401 without token, same error for all auth failures
- Parametrized input testing without function repetition
- The security property that authentication failures are indistinguishable

Lesson 3 adds React frontend tests with React Testing Library. Lesson 4 runs everything in GitHub Actions on every push.

---

## What breaks without this

**Testing `hashed_password` not in response body:** If the registration endpoint accidentally starts returning `hashed_password` in the response (e.g., someone changes `UserPublic` to include the field), only `test_register_returns_201_with_username` catches it — specifically the `assert "hashed_password" not in body` line. Without this assertion, a sensitive data leak in the API response is invisible.

---

## Definition of done

- [ ] `pytest tests/ -v` shows all tests passing, including the 4 parametrized cases
- [ ] `test_register_duplicate_username_returns_409` fails if you remove the `IntegrityError` handler from the register route
- [ ] `test_login_wrong_and_nonexistent_return_same_error_message` fails if the login route returns different messages for wrong password vs. unknown user
- [ ] You can explain the difference between testing your code and testing a library
- [ ] You can explain why `assert "hashed_password" not in body` is a useful assertion

**Git commit:**

```
git add backend/tests/
git commit -m "Add edge case tests: error paths, validation failures, auth security properties, parametrized inputs"
```
