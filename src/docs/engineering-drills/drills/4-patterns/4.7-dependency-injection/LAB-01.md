# Drill 4.7 — Dependency Injection: Explicit Dependencies

**Standalone drill. Prerequisites: basic Python and FastAPI — `pip install fastapi uvicorn`.**
**Time estimate:** 60–75 minutes
**Pattern category:** Non-GoF (implementation of Dependency Inversion Principle)
**What you will build:** A FastAPI endpoint that needs a database, a logger, and an email service — wired three ways: hardcoded (untestable), manually injected (testable), and through FastAPI's `Depends` (professional)
**What you will understand:** Why functions should declare dependencies rather than create them, and what FastAPI's `Depends()` is actually doing

---

## Quick Check

Answer these before starting. Answers at the bottom.

1. Your function calls `db = sqlite3.connect("prod.db")` at the start. What are two specific things you cannot do because the database is hardcoded inside the function?

2. "Dependency Injection" and "Dependency Inversion Principle" sound similar. What is the difference? Which is a design principle and which is an implementation technique?

3. FastAPI's `Depends(get_db)` calls `get_db()` and injects the result. If 100 requests arrive simultaneously and each needs a database connection, does FastAPI call `get_db()` 100 times or once?

4. `app.dependency_overrides[get_db] = get_test_db` — what does this line do in a test? Why is this valuable?

*(Answers at the bottom.)*

---

## The Concept: Dependency Injection

### Concept: Dependency Injection (DI)

**What it is:**
Dependency Injection means: a function or class declares what it needs (its dependencies) rather than creating those things itself. The caller (or a framework) provides the dependencies. The function never calls `sqlite3.connect()`, `Logger()`, or `requests.Session()` internally.

**The problem — hardcoded dependencies:**

```python
# Every function creates its own dependencies — untestable, unswappable
def get_user(user_id: int) -> dict:
    db = sqlite3.connect("prod.db")       # creates its own database connection
    logger = FileLogger("/var/log/app.log")  # creates its own logger
    email = EmailService("smtp.example.com") # creates its own email service
    # ...
    logger.info(f"Fetching user {user_id}")
    user = db.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    return dict(user)

# Problems:
# 1. In tests, this always connects to prod.db — you cannot substitute a test database
# 2. To change the logger, you must edit get_user() — it has two responsibilities
# 3. The email service is instantiated on every call — expensive and wasteful
```

**The solution — constructor injection:**

```python
# Dependencies declared in the constructor — provided by the caller
class UserService:
    def __init__(self, db: Database, logger: Logger, email: EmailService):
        self.db     = db      # injected — not created
        self.logger = logger
        self.email  = email

    def get_user(self, user_id: int) -> dict:
        self.logger.info(f"Fetching user {user_id}")
        # ...

# In tests: inject test doubles
service = UserService(db=InMemoryDatabase(), logger=NullLogger(), email=MockEmailService())

# In production: inject real implementations
service = UserService(db=PostgreSQLDatabase("prod"), logger=FileLogger(), email=SMTPEmailService())
```

**What it hides:**
The wiring. The function does not know or care WHERE its dependencies come from. It only knows WHAT interface they satisfy. The caller handles the wiring.

**The invariant:** A function that uses DI is completely decoupled from the implementation of its dependencies. Replacing a dependency (SQLite → PostgreSQL, real email → mock) requires zero changes to the function.

**FastAPI's `Depends`:**
FastAPI implements "IoC container injection" — the framework handles the wiring. You define dependency providers (functions that return dependencies), and declare them in endpoint signatures. FastAPI calls the providers and injects the results:

```python
def get_db():
    conn = sqlite3.connect("app.db")
    try:
        yield conn    # yield: the connection is available during the request
    finally:
        conn.close()  # cleanup runs after the response is sent

@app.get("/users/{user_id}")
def read_user(user_id: int, db = Depends(get_db)):
    # FastAPI called get_db() and injected the result as 'db'
    # When the response is sent, get_db()'s finally block closes the connection
    ...
```

**Constraints:**
- Dependencies injected via `Depends` are cached per-request by default — `get_db()` is called once per request, not once per function that needs it
- `yield` dependencies are generators — the code before `yield` is setup, after `yield` is teardown (cleanup)
- Nested dependencies are resolved automatically — if `get_current_user` depends on `get_db`, FastAPI calls both in the right order

**Failure modes:**
- Circular dependencies: A depends on B which depends on A — framework raises an error or hangs
- Missing teardown: a `yield` dependency that raises before the `yield` never reaches the `finally` block — resources leak
- Incorrect scope: a per-request database connection stored in a module-level variable gets shared across requests — data corruption under concurrent load

**Operational reality:**
Every serious web framework has some form of DI: FastAPI's `Depends`, Flask's `g` and `current_app`, Django's request object, Spring Boot's `@Autowired`, ASP.NET Core's service provider. The concept is identical across all of them. Understanding DI in FastAPI gives you the mental model for DI anywhere.

**You will see this again in:**
FastAPI (Depends), Flask (application context), Django (request middleware), Angular (service injection), Spring Boot (autowiring), ASP.NET Core (IServiceProvider). Every enterprise framework uses this pattern.

**Watch for:**
`Depends()` with no argument to the outer function is a common mistake: `def endpoint(db = sqlite3.connect("app.db"))` — this creates the connection at import time, not at request time. Always use `Depends(provider_function)`.

---

## Step 1 — Hardcoded (the Problem)

Create `hardcoded.py`:

```python
# hardcoded.py — dependencies created inside functions (the wrong way)
# This version is correct but untestable and unswappable.
import sqlite3
from fastapi import FastAPI

app = FastAPI()

# ── Simulated "services" for this demo ──────────────────────────────────────────

class Logger:
    def info(self, msg: str) -> None:
        print(f"[LOG] {msg}")

class EmailService:
    def send(self, to: str, subject: str) -> None:
        print(f"[EMAIL] To: {to} | Subject: {subject}")


# ── Endpoint with hardcoded dependencies ──────────────────────────────────────

@app.get("/users/{user_id}")
def get_user(user_id: int):
    # PROBLEM: every call creates its own database connection — expensive
    conn   = sqlite3.connect(":memory:")   # hardcoded — always in-memory here for demo
    logger = Logger()                       # hardcoded — always FileLogger in real code
    email  = EmailService()                 # hardcoded — always SMTP in real code

    logger.info(f"Fetching user {user_id}")

    # Cannot test with a different database without modifying this function
    # Cannot swap Logger for a test double without modifying this function
    # Cannot test that email.send() was called without modifying this function

    return {"user_id": user_id, "name": f"User {user_id}"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

### SAVE AND TRY

```bash
python hardcoded.py
```

In a second terminal:
```bash
curl http://127.0.0.1:8000/users/42
```

**Expected:** `{"user_id": 42, "name": "User 42"}`

This works. But write a test for it:
```bash
python -c "
# Try to test 'get_user' — you cannot substitute the database
# The function creates sqlite3.connect() internally
# You would need to mock sqlite3.connect globally — messy and fragile
print('Test problem: get_user creates its own db connection internally.')
print('To test it, you must patch sqlite3.connect at module level — this is fragile.')
"
```

---

## Step 2 — Manual Injection (Testable)

Create `manual_di.py`:

```python
# manual_di.py — dependencies injected manually
from abc import ABC, abstractmethod
import sqlite3
from fastapi import FastAPI

app = FastAPI()

# ── Interfaces ─────────────────────────────────────────────────────────────────

class Database(ABC):
    @abstractmethod
    def execute(self, query: str, params: tuple = ()) -> list:
        ...

class Logger(ABC):
    @abstractmethod
    def info(self, msg: str) -> None:
        ...

class EmailService(ABC):
    @abstractmethod
    def send(self, to: str, subject: str) -> None:
        ...


# ── Implementations ────────────────────────────────────────────────────────────

class SQLiteDatabase(Database):
    def __init__(self, path: str):
        self._path = path

    def execute(self, query: str, params: tuple = ()) -> list:
        with sqlite3.connect(self._path) as conn:
            return conn.execute(query, params).fetchall()

class ConsoleLogger(Logger):
    def info(self, msg: str) -> None:
        print(f"[LOG] {msg}")

class SMTPEmailService(EmailService):
    def send(self, to: str, subject: str) -> None:
        print(f"[EMAIL] To: {to} | Subject: {subject}")


# ── Test doubles ───────────────────────────────────────────────────────────────

class InMemoryDatabase(Database):
    def __init__(self):
        self._data = {1: "Alice", 2: "Bob", 3: "Carol"}

    def execute(self, query: str, params: tuple = ()) -> list:
        # Simplified: only handles "get by id"
        return [(params[0], self._data.get(params[0], "Unknown"))]

class NullLogger(Logger):
    def info(self, msg: str) -> None:
        pass   # silence — tests don't want log noise

class CapturingEmailService(EmailService):
    def __init__(self):
        self.sent: list[tuple] = []   # records all sent emails
    def send(self, to: str, subject: str) -> None:
        self.sent.append((to, subject))


# ── Service ────────────────────────────────────────────────────────────────────

class UserService:
    """Dependencies are injected — service never creates them."""

    def __init__(self, db: Database, logger: Logger, email: EmailService):
        self._db     = db
        self._logger = logger
        self._email  = email

    def get_user(self, user_id: int) -> dict:
        self._logger.info(f"Fetching user {user_id}")
        rows = self._db.execute("SELECT id, name FROM users WHERE id=?", (user_id,))
        if not rows:
            return None
        return {"user_id": rows[0][0], "name": rows[0][1]}


# ── Production wiring ──────────────────────────────────────────────────────────

prod_service = UserService(
    db     = SQLiteDatabase("app.db"),
    logger = ConsoleLogger(),
    email  = SMTPEmailService()
)

@app.get("/users/{user_id}")
def get_user_endpoint(user_id: int):
    user = prod_service.get_user(user_id)
    if not user:
        return {"error": "Not found"}, 404
    return user


if __name__ == "__main__":
    # Test with injected test doubles — no web server, no database, no email
    test_service = UserService(
        db     = InMemoryDatabase(),
        logger = NullLogger(),
        email  = CapturingEmailService()
    )

    user = test_service.get_user(1)
    print(f"Test result: {user}")
    assert user["name"] == "Alice", f"Expected Alice, got {user['name']}"
    print("Test passed!")

    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
```

### SAVE AND TRY

```bash
python manual_di.py
```

**Expected:**
```
Test result: {'user_id': 1, 'name': 'Alice'}
Test passed!
INFO:     Started server process
...
```

The test runs before the server starts. No database, no email, no HTTP server for the test itself.

---

## Step 3 — FastAPI Depends

Create `fastapi_di.py`:

```python
# fastapi_di.py — FastAPI's built-in dependency injection with Depends
import sqlite3
from fastapi import FastAPI, Depends
from typing import Generator

app = FastAPI()

# ── Dependency providers ───────────────────────────────────────────────────────

def get_db() -> Generator:
    """
    Dependency provider for the database connection.
    'yield' makes this a context manager — setup before yield, teardown after.
    FastAPI calls this once per request, injects the yielded value, then
    runs the finally block when the response is sent.
    """
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER, name TEXT)")
    conn.execute("INSERT OR IGNORE INTO users VALUES (1,'Alice'),(2,'Bob'),(3,'Carol')")
    conn.commit()
    try:
        yield conn          # the connection is injected here
    finally:
        conn.close()        # always runs after the response — no leaked connections


def get_logger():
    """Dependency provider for the logger."""
    class Logger:
        def info(self, msg: str): print(f"[LOG] {msg}")
    return Logger()


def get_current_user(db = Depends(get_db)):
    """
    Nested dependency — depends on get_db.
    FastAPI resolves the dependency tree: get_current_user needs get_db,
    so FastAPI calls get_db first, then injects the result here.
    In a real app, this would read from a JWT token and fetch the user.
    """
    user = db.execute("SELECT * FROM users WHERE id=1").fetchone()
    return {"id": user[0], "name": user[1]} if user else None


# ── Endpoints ──────────────────────────────────────────────────────────────────

@app.get("/users/{user_id}")
def read_user(
    user_id: int,
    db     = Depends(get_db),       # FastAPI calls get_db() and injects the connection
    logger = Depends(get_logger),   # FastAPI calls get_logger() and injects the logger
):
    logger.info(f"Reading user {user_id}")
    row = db.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
    if not row:
        return {"error": "Not found"}
    return {"user_id": row[0], "name": row[1]}


@app.get("/me")
def read_me(current_user = Depends(get_current_user)):
    # FastAPI resolves: get_current_user → get_db → connection
    # The full dependency tree is resolved automatically
    return current_user


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8002)
```

Create `test_fastapi_di.py`:

```python
# test_fastapi_di.py — override dependencies in tests
import pytest
from fastapi.testclient import TestClient
from fastapi_di import app, get_db
import sqlite3

# ── Test database override ─────────────────────────────────────────────────────

def get_test_db():
    """Test double for get_db — uses a separate in-memory database."""
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE users (id INTEGER, name TEXT)")
    conn.execute("INSERT INTO users VALUES (99, 'TestUser')")
    conn.commit()
    try:
        yield conn
    finally:
        conn.close()


# ── Override the dependency for all tests ─────────────────────────────────────

app.dependency_overrides[get_db] = get_test_db
# app.dependency_overrides: a dict that replaces dependencies during tests
# Key: the original dependency function (get_db)
# Value: the replacement function (get_test_db)
# FastAPI uses this map when resolving dependencies — every call to Depends(get_db)
# now calls get_test_db instead

client = TestClient(app)   # test client — no real HTTP, runs in-process


def test_read_existing_user():
    response = client.get("/users/99")   # user 99 is in test database
    assert response.status_code == 200
    assert response.json()["name"] == "TestUser"


def test_read_missing_user():
    response = client.get("/users/999")  # user 999 does not exist
    assert response.status_code == 200
    assert "error" in response.json()
```

### SAVE AND TRY

```bash
pytest test_fastapi_di.py -v
```

**Expected:**
```
test_fastapi_di.py::test_read_existing_user PASSED
test_fastapi_di.py::test_read_missing_user PASSED

2 passed in 0.21s
```

**The key line:** `app.dependency_overrides[get_db] = get_test_db`. One line substitutes the entire database for all tests. The endpoint code never changed.

---

## Challenge

**No solution provided. Requirements checklist only.**

Build a request-scoped rate limiter as a FastAPI dependency. Each request gets a `RateLimiter` object. The limiter checks if the client IP has made too many requests in the last minute.

**Requirements checklist:**

- [ ] `RateLimiter` class with `check(ip: str) -> bool` — returns `True` if the request is allowed
- [ ] `get_rate_limiter()` is a FastAPI dependency provider — returns a `RateLimiter`
- [ ] `/limited` endpoint uses `Depends(get_rate_limiter)` and returns 429 if rate limit exceeded
- [ ] `InMemoryRateLimiter` stores request counts per IP in a dict — used in both production and tests
- [ ] A test overrides the rate limiter with a `AlwaysAllowRateLimiter` that never rate-limits
- [ ] A second test uses the real `InMemoryRateLimiter` and verifies that after `max_requests` calls from the same IP, the next call returns 429
- [ ] `get_rate_limiter` is injectable — tests can substitute it via `app.dependency_overrides`

**Starter:**
```python
from fastapi import FastAPI, Depends, Request
from fastapi.responses import JSONResponse

app = FastAPI()

class RateLimiter:
    def check(self, ip: str) -> bool:
        raise NotImplementedError

class InMemoryRateLimiter(RateLimiter):
    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        # TODO: track request counts per IP with timestamps
        pass

    def check(self, ip: str) -> bool:
        # TODO: return True if under limit, False if exceeded
        pass

def get_rate_limiter() -> RateLimiter:
    return InMemoryRateLimiter(max_requests=5)

@app.get("/limited")
def limited_endpoint(request: Request, limiter: RateLimiter = Depends(get_rate_limiter)):
    ip = request.client.host
    if not limiter.check(ip):
        return JSONResponse(status_code=429, content={"error": "Rate limit exceeded"})
    return {"allowed": True}
```

**When you're done:** `pytest` passes with two tests. The rate-limited test sends 6 requests to `/limited` and asserts the 6th returns status 429. The override test sends 100 requests and all return 200 because `AlwaysAllowRateLimiter.check()` always returns `True`.

**Stuck?** Ask AI: "I'm building a FastAPI dependency that rate-limits by IP address. My `InMemoryRateLimiter` needs to track request timestamps per IP so it can count requests in a sliding 60-second window. How do I use `collections.deque` or a list to store timestamps and check if more than N requests happened in the last 60 seconds?"

---

## Quick Check Answers

**1. Two things you cannot do when the database is hardcoded inside the function?**
(1) You cannot test the function with a fake/test database — the function always connects to the hardcoded path, which may be a production database. You would need to patch `sqlite3.connect` globally, which is fragile and affects other tests. (2) You cannot swap the database implementation (SQLite → PostgreSQL) without editing the function — the function's single responsibility is now split between "retrieve a user" and "connect to SQLite specifically." Every function that touches the database must be edited when storage changes.

**2. Dependency Injection vs Dependency Inversion Principle — what's the difference?**
The **Dependency Inversion Principle** (DIP) is a design principle: high-level modules should not depend on low-level modules; both should depend on abstractions. It says WHAT direction dependencies should flow. **Dependency Injection** (DI) is an implementation technique: provide dependencies from outside rather than creating them internally. It says HOW to achieve that direction. DIP is the why; DI is the how. You can have DI without DIP (inject a concrete class), but you cannot achieve DIP without some form of DI (you must inject the abstraction somehow).

**3. Does FastAPI call `get_db()` 100 times for 100 simultaneous requests?**
Yes — once per request by default. FastAPI creates a new scope for each request and resolves each dependency fresh within that scope. If multiple route handlers in the same request both need `get_db`, FastAPI calls it only once per request and shares the result within that request (dependency caching). But across different requests, each gets its own database connection — which is correct, because sharing one connection across concurrent requests would cause data corruption.

**4. What does `app.dependency_overrides[get_db] = get_test_db` do in a test?**
It replaces the `get_db` dependency provider with `get_test_db` for all subsequent requests handled by the `TestClient`. When FastAPI encounters `Depends(get_db)` in any endpoint, it looks up `get_db` in `dependency_overrides` first — finds `get_test_db` — and calls that instead. The endpoint code is unchanged; only the wiring is different. This is the testing superpower of DI: you can substitute any dependency without touching the code being tested.
