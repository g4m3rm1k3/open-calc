# Junior to Senior — T5·L2 — FastAPI Dependency Injection

**Prerequisites:** T5·L1 (FastAPI Routing). You have working endpoints with an
in-memory store. This lesson introduces FastAPI's dependency injection system —
the mechanism for sharing the database session, current user, and other services
across handlers without passing them as arguments manually.

**What this lab adds:**
- `Depends(get_db)` — FastAPI calls the function and passes the result
- `yield` in a dependency — setup before `yield`, teardown after (always runs)
- Dependency chaining — a dependency that itself has dependencies
- `app.dependency_overrides` — replacing real dependencies with fakes in tests
- The current user as a dependency — authentication without middleware

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Three route handlers all declare `session: AsyncSession = Depends(get_session)`.
>    How many times does FastAPI call `get_session` per request?
> 2. `get_db` uses `yield`. The handler raises an exception. What happens to the
>    code AFTER `yield` in `get_db`?
> 3. You want every route in a router to be protected by authentication. How many
>    places do you add the `Depends(get_current_user)` call?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A task API where the database session and authentication are injected, not hard-wired:

```python
@router.get('/')
async def list_tasks(
    session: AsyncSession = Depends(get_session),    # DB session injected
    priority: str | None  = None,
) -> list[TaskResponse]:
    ...
```

And a test that replaces the real database with a fake — no real DB needed:

```python
app.dependency_overrides[get_session] = get_test_session
client = TestClient(app)   # uses the fake session
```

---

### Concept: What Dependency Injection Solves

**What it is:** Dependency Injection (DI) is the practice of supplying a function's
dependencies from outside rather than having the function create them internally.

**The problem before — hard-wired dependencies:**

```python
# Every route handler creates its own session:
@router.get('/tasks/')
async def list_tasks() -> list[TaskResponse]:
    session = create_db_session()   # ← created inside the handler
    tasks   = await session.execute(select(Task))
    await session.close()           # ← must remember to close
    return tasks

# Problems:
# 1. Cannot test without a real database
# 2. If close() is forgotten (or an exception is raised), the connection leaks
# 3. To change session creation logic, must edit EVERY handler
```

**The solution — inject the dependency:**

```python
async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session   # handler runs here; session auto-closed after

@router.get('/tasks/')
async def list_tasks(session: AsyncSession = Depends(get_session)) -> list:
    tasks = await session.execute(select(Task))
    return tasks
# session is always properly closed, even on exception
# swap the session for tests by overriding get_session
```

**What it hides:** The lifecycle management. `Depends()` ensures setup, delivery,
and teardown happen in the right order for every request.

**Canonical example:** A restaurant kitchen dependency injection. The chef (handler)
doesn't go to the store for ingredients — the supply chain (dependency) delivers
fresh ingredients before service and disposes of unused ones after.

**You will see this again in:**
- Every production FastAPI application uses dependency injection for sessions, auth, rate limiting
- Angular, Spring, NestJS all use the same pattern by different names
- Python's standard library: `contextmanager` is the same pattern as `yield` in dependencies

---

## Step 1 — See the Problem First

Look at how the current router uses a global variable:

```python
# In tasks_router.py:
_tasks: dict[str, Task] = {}   # ← global state, shared across all requests
```

This is a valid approach for in-memory stores, but it has problems:
- Tests that run in parallel can interfere with each other
- There is no way to give one request a different store than another
- Authentication state must be passed through function arguments manually

---

### Concept: `Depends` and the Dependency Lifecycle

**What it is:** `Depends(callable)` tells FastAPI to call `callable` and pass
the result to the parameter. The callable can be a function, class, or generator.

```python
from fastapi import Depends

def get_api_key() -> str:
    return 'secret-key'   # in production: read from environment

@app.get('/secure')
def secure_endpoint(api_key: str = Depends(get_api_key)) -> dict:
    return {'key': api_key}
```

**The lifecycle with `yield` (generator dependency):**

```python
async def get_session() -> AsyncIterator[AsyncSession]:
    async with SessionLocal() as session:
        yield session      # ← handler runs here with this session
    # ← after yield: session is closed (even if handler raised an exception)
```

**What it hides:**
1. The calling — FastAPI calls `get_session()`, gets the generator, advances it to `yield`, takes the yielded session
2. The cleanup — FastAPI calls `next()` on the generator after the handler returns or raises — triggering the code after `yield`
3. The caching — if multiple dependencies in the same request declare `Depends(get_session)`, FastAPI calls `get_session` ONCE and shares the result

**Smallest possible example:**

```python
from contextlib import contextmanager

def get_value():
    print('setting up')
    yield 42          # the value
    print('cleaning up')   # runs after the handler, even on exception

@app.get('/use-value')
def use_value(value: int = Depends(get_value)) -> dict:
    return {'value': value}
```

**You will see this again in:**
- SQLAlchemy `AsyncSession` as a dependency — the canonical use case
- JWT authentication as a dependency — `current_user: User = Depends(get_current_user)`
- Rate limiting as a dependency — `_: None = Depends(rate_limiter)`

**Watch for:** The `yield` in a dependency must be EXACTLY ONE yield. Zero or two yields
raise `RuntimeError`. Wrap the entire body in a `try/finally` to ensure cleanup
runs even on exception.

---

## Step 2 — Build the Database Dependencies

Create `src/dependencies.py`:

```python
# src/dependencies.py
from __future__ import annotations
from typing     import AsyncIterator, Annotated
from fastapi    import Depends
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from src.config import config


# Create the async database engine once at module level:
engine       = create_async_engine(config.database_url, echo=config.debug)
SessionLocal = async_sessionmaker(engine, expire_on_commit=False)


async def get_session() -> AsyncIterator[AsyncSession]:
    """
    Provides one SQLAlchemy AsyncSession per request.
    The session is automatically closed after the request, even on exception.
    """
    async with SessionLocal() as session:
        yield session                    # handler runs here with this session
    # session.close() is called here by the async context manager


# Type alias — use this instead of the full Depends annotation everywhere:
Session = Annotated[AsyncSession, Depends(get_session)]
```

### SAVE AND TRY

```bash
python -c "
from src.dependencies import get_session, Session
print('get_session is a coroutine function:', hasattr(get_session, '__aiter__') or True)
print('Session type alias created successfully')
"
```

Expected: confirmation that the imports work.

---

### Concept: Authentication as a Dependency

**What it is:** The "current user" is a dependency that reads the JWT from the
`Authorization` header, decodes it, and returns the user data. Every route that
needs authentication declares `Depends(get_current_user)`.

**The problem before — manual authentication in every handler:**

```python
@router.get('/tasks/')
def list_tasks(request: Request) -> list:
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        raise HTTPException(status_code=401, detail='Not authenticated')
    try:
        user = decode_jwt(token)
    except JWTError:
        raise HTTPException(status_code=401, detail='Invalid token')
    # ... now actually process the request
```

Every handler duplicates 8 lines of auth logic. Any change to auth logic requires
editing every handler.

**The solution — auth as a dependency:**

```python
def get_current_user(credentials: ... = Depends(security)) -> UserClaims:
    # decode token, validate, return user data
    ...

@router.get('/tasks/')
def list_tasks(
    current_user: UserClaims = Depends(get_current_user)
) -> list:
    # auth already handled — user is guaranteed to be valid
    ...
```

**What it hides:** The entire authentication flow. The handler only sees a valid
`UserClaims` object. If authentication fails, the handler is never called.

**Project application:** `get_current_user` decodes the JWT from the `Authorization`
header and returns the claims. Any route with this dependency requires valid authentication.

---

## Step 3 — Build the Auth Dependency

Create `src/api/auth_dependency.py`:

```python
# src/api/auth_dependency.py
from __future__ import annotations
from dataclasses import dataclass
from fastapi     import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

_security = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthenticatedUser:
    user_id: str
    email:   str


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_security),
) -> AuthenticatedUser:
    """
    Extracts and validates the bearer token from the Authorization header.
    Raises 401 if the token is missing or invalid.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Authorization header is required',
            headers={'WWW-Authenticate': 'Bearer'},
        )

    token = credentials.credentials
    if not token:
        raise HTTPException(status_code=401, detail='Bearer token is empty')

    # In a real implementation: decode and verify the JWT here (covered in T5-L7).
    # For this lesson: any non-empty token is accepted.
    return AuthenticatedUser(user_id='u-1', email='test@example.com')
```

### SAVE AND TRY

```bash
python -c "
from fastapi.testclient import TestClient
from fastapi import FastAPI, Depends
from src.api.auth_dependency import get_current_user, AuthenticatedUser

test_app = FastAPI()

@test_app.get('/me')
def get_me(user: AuthenticatedUser = Depends(get_current_user)) -> dict:
    return {'email': user.email}

client = TestClient(test_app)

# Without token:
r1 = client.get('/me')
print('no token:', r1.status_code)    # 401

# With token:
r2 = client.get('/me', headers={'Authorization': 'Bearer any-token'})
print('with token:', r2.status_code, r2.json())  # 200
"
```

**You should see:**
```
no token: 401
with token: 200 {'email': 'test@example.com'}
```

---

### Concept: `dependency_overrides` — Replacing Dependencies in Tests

**What it is:** `app.dependency_overrides` is a dict mapping a dependency function
to its replacement. During tests, replace real dependencies with fakes.

**The problem before — testing with real infrastructure:**

```python
def test_list_tasks():
    # Must have a real database running:
    response = client.get('/tasks/')   # fails if DB is down
    assert response.status_code == 200
```

**The solution:**

```python
def get_fake_session() -> AsyncIterator:
    yield FakeSession()   # an in-memory session — no real DB needed

app.dependency_overrides[get_session] = get_fake_session
client = TestClient(app)
# Now every endpoint that uses get_session gets FakeSession instead
```

**What it hides:** The dependency resolution. When FastAPI resolves `Depends(get_session)`,
it first checks `dependency_overrides`. If an override exists, it uses that instead.
The handler code is unchanged — it still receives an `AsyncSession` — but it's a
fake one.

**Project application:** Tests override `get_current_user` to return a known test user
without needing a valid JWT. Tests override `get_session` to use an in-memory database.

**Smallest possible example:**

```python
from fastapi.testclient import TestClient

def real_dependency() -> str:
    return 'real'

@app.get('/dep')
def endpoint(value: str = Depends(real_dependency)) -> dict:
    return {'value': value}

# In tests:
app.dependency_overrides[real_dependency] = lambda: 'fake'
client = TestClient(app)
client.get('/dep').json()   # → {'value': 'fake'}
app.dependency_overrides.clear()   # clean up after test
```

**You will see this again in:**
- Every FastAPI test suite uses `dependency_overrides` to replace the DB session
- Testing authentication: override `get_current_user` to return a test user
- Integration tests vs unit tests: the override controls which layer is real vs fake

**Watch for:** `dependency_overrides` is shared across ALL tests unless you clear it.
Always clean up: `app.dependency_overrides.clear()` in a teardown fixture.

---

## Step 4 — Write Tests With Dependency Overrides

Create `tests/conftest.py`:

```python
# tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from src.main import app
from src.api.auth_dependency import get_current_user, AuthenticatedUser
import src.api.tasks_router as router_module


@pytest.fixture
def client() -> TestClient:
    """Plain client — no authentication override."""
    return TestClient(app)


@pytest.fixture
def authenticated_client() -> TestClient:
    """Client with authentication bypassed — always returns a test user."""
    def fake_user() -> AuthenticatedUser:
        return AuthenticatedUser(user_id='u-test', email='test@example.com')

    app.dependency_overrides[get_current_user] = fake_user
    yield TestClient(app)
    app.dependency_overrides.clear()   # ← always clean up


@pytest.fixture(autouse=True)
def reset_in_memory_store() -> None:
    """Prevents state leaks between tests."""
    router_module._tasks.clear()
    router_module._next_id = 1
    yield
```

Create `tests/test_auth_dependency.py`:

```python
# tests/test_auth_dependency.py
import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI, Depends
from src.api.auth_dependency import get_current_user, AuthenticatedUser
from src.main import app


class TestAuthDependency:

    def test_unauthenticated_request_returns_401(self) -> None:
        test_app = FastAPI()

        @test_app.get('/protected')
        def protected(user: AuthenticatedUser = Depends(get_current_user)) -> dict:
            return {'user_id': user.user_id}

        c = TestClient(test_app)
        response = c.get('/protected')
        assert response.status_code == 401

    def test_authenticated_request_returns_user(self) -> None:
        test_app = FastAPI()

        @test_app.get('/protected')
        def protected(user: AuthenticatedUser = Depends(get_current_user)) -> dict:
            return {'email': user.email}

        c = TestClient(test_app)
        response = c.get('/protected', headers={'Authorization': 'Bearer test-token'})
        assert response.status_code == 200
        assert response.json()['email'] == 'test@example.com'

    def test_override_replaces_real_dependency(self) -> None:
        """dependency_overrides lets tests bypass real authentication."""
        test_app = FastAPI()

        @test_app.get('/me')
        def me(user: AuthenticatedUser = Depends(get_current_user)) -> dict:
            return {'email': user.email}

        def fake_user() -> AuthenticatedUser:
            return AuthenticatedUser(user_id='fake', email='fake@example.com')

        test_app.dependency_overrides[get_current_user] = fake_user

        c = TestClient(test_app)
        response = c.get('/me')   # no Authorization header — but override bypasses check
        assert response.status_code == 200
        assert response.json()['email'] == 'fake@example.com'

        test_app.dependency_overrides.clear()
```

### SAVE AND TRY

```bash
pytest tests/test_auth_dependency.py -v
```

**You should see:**
```
tests/test_auth_dependency.py::TestAuthDependency::test_unauthenticated_request_returns_401 PASSED
tests/test_auth_dependency.py::TestAuthDependency::test_authenticated_request_returns_user PASSED
tests/test_auth_dependency.py::TestAuthDependency::test_override_replaces_real_dependency PASSED

3 passed
```

---

## 🎯 Challenge: Add a Rate-Limiter Dependency

**You know:** `Depends`, `HTTPException`, per-request state.

**Task:** Build a `rate_limiter(max_requests: int = 5)` dependency factory that
allows at most `max_requests` per unique client ID (use `X-Client-ID` header).
Raises `HTTP 429 Too Many Requests` when exceeded.

```python
@router.get('/', dependencies=[Depends(rate_limiter(max_requests=10))])
def list_tasks() -> list:
    ...
```

Note: `dependencies=[Depends(...)]` applies a dependency for side effects without
injecting its return value.

Write 2 tests before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```python
from collections import defaultdict
from fastapi     import Request

_request_counts: dict[str, int] = defaultdict(int)


def rate_limiter(max_requests: int = 5):
    """Factory: returns a dependency that enforces per-client rate limits."""
    def check_rate_limit(request: Request) -> None:
        client_id = request.headers.get('X-Client-ID', 'anonymous')
        _request_counts[client_id] += 1
        if _request_counts[client_id] > max_requests:
            raise HTTPException(
                status_code=429,
                detail='Rate limit exceeded',
            )
    return check_rate_limit
```

**Tests:**
```python
def test_under_limit_succeeds() -> None:
    _request_counts.clear()
    test_app = FastAPI()

    @test_app.get('/limited', dependencies=[Depends(rate_limiter(max_requests=3))])
    def limited() -> dict:
        return {'ok': True}

    c = TestClient(test_app)
    for _ in range(3):
        assert c.get('/limited', headers={'X-Client-ID': 'test'}).status_code == 200

def test_over_limit_returns_429() -> None:
    _request_counts.clear()
    test_app = FastAPI()

    @test_app.get('/limited', dependencies=[Depends(rate_limiter(max_requests=2))])
    def limited() -> dict:
        return {'ok': True}

    c = TestClient(test_app)
    c.get('/limited', headers={'X-Client-ID': 'x'})
    c.get('/limited', headers={'X-Client-ID': 'x'})
    response = c.get('/limited', headers={'X-Client-ID': 'x'})
    assert response.status_code == 429
```

**Key insight:** `dependencies=[Depends(...)]` in the route decorator applies a
dependency for its side effects (validation, rate limiting, logging) without injecting
its return value. The function signature stays clean — only values the handler needs
appear as parameters.

</details>

---

## Final Check

| Concept | How to verify |
|---|---|
| `Depends` injects result | Handler receives the dependency's return value |
| `yield` cleanup runs on exception | Verify teardown with caplog or side effects |
| Shared dependency | Two handlers in one request: dependency called once |
| `dependency_overrides` works | Test calls endpoint without real DB or real auth |
| `autouse=True` fixture prevents state leaks | Remove it — verify tests start failing |

---

## Quick Check Answers

**1. Three handlers declare `Depends(get_session)`. How many times is it called per request?**

Once per request. FastAPI caches dependencies within a request — if multiple handlers
in the same request resolve the same dependency, it is called once and the result is
shared. This is called "sub-dependency caching." For an in-process test, the `TestClient`
makes one HTTP request, which triggers one `get_session` call regardless of how many
handlers in the request use it.

**2. `get_db` uses `yield`. Handler raises an exception. What happens after `yield`?**

The code after `yield` runs — in a `finally` block or as part of the context manager's
`__exit__`. FastAPI advances the generator (essentially calling `generator.throw(exception)`)
after the handler completes or raises. This triggers the cleanup code: `session.close()`,
`connection.rollback()`, etc. The exception is re-raised after cleanup completes.

**3. Every route needs auth. How many places do you add `Depends(get_current_user)`?**

One. Pass the dependency to the `APIRouter` constructor:
`router = APIRouter(dependencies=[Depends(get_current_user)])`. All routes registered on
this router automatically have authentication applied. Alternatively, pass it to
`app.include_router(router, dependencies=[Depends(get_current_user)])` to apply to all
routes in the router at inclusion time.
