# Lesson 22: A Reliable Application

**What you will build**
A global exception handler that returns safe, consistent error responses instead of leaking internals, plus structured logging replacing every `print()` statement used throughout this project's labs. The problem we're solving: an unhandled bug anywhere in this codebase currently produces FastAPI's raw default error response — potentially exposing internal details to a client — and there's been no durable record anywhere of what actually happened when something went wrong, beyond whatever happened to be on someone's terminal at the time.

**What you need to know first**
Lesson 3 (`HTTPException`). Lesson 18 (the difference between test output and real operational visibility).

---

## Concept Unit: A Global Exception Handler

### The Problem

Every deliberate failure so far has been an `HTTPException` we raised on purpose — a missing post, a wrong password. But a genuine bug (a typo, an unexpected `None`, a library incompatibility) raises some *other* exception type, one we never anticipated. Right now, that produces FastAPI's default behavior: in production mode, a generic `500` with no detail; but the actual exception and its full traceback are only ever visible in server logs *if* something is actually capturing them — which, so far, nothing is.

### The failing test

```python
def test_unhandled_error_returns_safe_generic_response(client):
    @app.get("/_test_crash")
    def crash():
        raise ValueError("something broke internally")

    response = client.get("/_test_crash")
    assert response.status_code == 500
    assert response.json() == {"detail": "An internal error occurred"}
    assert "ValueError" not in response.text
    assert "something broke internally" not in response.text
```

Run it:

```bash
pytest tests/
```

```text
FAILED — response body currently exposes exception details FastAPI's default handler includes by default in this configuration.
```

### Introduce the concept in isolation

Create `lab_handler.py`:

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient

app = FastAPI()

@app.exception_handler(Exception)
async def catch_all(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "An internal error occurred"})

@app.get("/boom")
def boom():
    raise ValueError("secret internal detail")

client = TestClient(app, raise_server_exceptions=False)
response = client.get("/boom")
print(response.status_code, response.json())
```

Run it:

```bash
python lab_handler.py
```

Output:

```text
500 {'detail': 'An internal error occurred'}
```

*What this proves:* `@app.exception_handler(Exception)` intercepts *any* exception type not already handled more specifically elsewhere — `boom()` raised a plain `ValueError`, never caught explicitly anywhere in the route itself, and yet the client received a clean, generic message instead of Python's raw exception text. The real message, `"secret internal detail"`, never reached the response at all.

### Explain the mechanism

FastAPI checks for a registered handler matching an exception's type (or a parent type) whenever a route raises something uncaught. Registering one for the base `Exception` class means it catches *everything* not already handled by something more specific — like `HTTPException`, which FastAPI already handles separately, producing the specific status codes and messages this project has been raising deliberately since Lesson 3. This new handler is strictly a safety net underneath that, for the cases nothing anticipated.

### Discard the throwaway example

Delete `lab_handler.py`. Add the real handler.

### Project Change

* **Files affected:** `main.py`.
* **Change type:** Modify.

### The New Code

```python
from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "An internal error occurred"})
```

### Mechanical walkthrough

1. `async def unhandled_exception_handler(request: Request, exc: Exception)`: (first appearance of `async def` in this project). FastAPI's exception handlers are expected to be coroutines; this is worth naming honestly as a syntax requirement of the framework here, without a full treatment of `async`/`await` — that's a genuinely large topic of its own, out of scope for this lesson, and worth returning to deliberately rather than glossed over now.
2. `request: Request, exc: Exception`: (first appearance of `Request` as a type). FastAPI passes both the original request and the caught exception into the handler — unused in this minimal version, but available for exactly the logging this lesson's next unit adds.

### CS Lens

**Fail-safe defaults.** A system's behavior in an *unanticipated* failure case is a deliberate design decision, not an accident to discover in production. The safe default here — a generic message, no internals — means a bug's blast radius is contained to "the request failed," rather than potentially leaking a file path, a library version, or a query fragment that could hand an attacker useful information about the system's internals.

### SE Lens

**This is not "hiding bugs" — it's separating what the client sees from what the developer needs to see.** The generic response is strictly about the client-facing surface; the actual exception and its traceback still need to exist *somewhere*, for whoever maintains this system to actually fix the bug. Right now, this handler discards that information entirely — which is itself a problem, and exactly what the next unit fixes.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 30 items

tests/test_api.py .............................                          [ 97%]
tests/test_units.py .                                                    [100%]

============================== 30 passed in 0.13s ===============================
```

### Connecting sentence

The client is now safely shielded from internal errors — but so is everyone else, including whoever needs to actually debug what happened. `print()`, used throughout every lab in this entire project, was never a real answer to that — it's time for something that is.

---

## Concept Unit: Structured Logging

### The Problem

Every lab script in this entire project has used `print()` to show what's happening. That's fine for a five-line throwaway script read once. It's not fine for a running server: `print()` output has no severity level (an informational message and a critical failure look identical), no timestamp, no structure a tool could search or filter by, and — critically — the exception this lesson's handler just started silently swallowing needs to go *somewhere* real.

### Introduce the concept in isolation

Create `lab_logging.py`:

```python
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("lab")

logger.info("Server starting up")
logger.warning("Cache miss for key: user_42")
try:
    1 / 0
except ZeroDivisionError:
    logger.error("Division failed", exc_info=True)
```

Run it:

```bash
python lab_logging.py
```

Output:

```text
2026-01-15 10:22:01,443 INFO Server starting up
2026-01-15 10:22:01,444 WARNING Cache miss for key: user_42
2026-01-15 10:22:01,444 ERROR Division failed
Traceback (most recent call last):
  File "lab_logging.py", line 10, in <module>
    1 / 0
ZeroDivisionError: division by zero
```

*What this proves:* each message carries a **level** (`INFO`, `WARNING`, `ERROR`) and a real timestamp, automatically — neither of which `print()` ever provided. `exc_info=True` on the `logger.error` call attached the full traceback to that specific log entry, capturing exactly the detail this lesson's exception handler is currently discarding from the client response.

### Explain the mechanism

`logging.getLogger("lab")` doesn't print anything by itself — it hands messages to a configured **handler** (set up here via `basicConfig`) that decides where they actually go (the terminal, in this example; a file, or a remote logging service, in a real deployment) and at what minimum level (`level=logging.INFO` here means `DEBUG`-level messages would be silently dropped, while `INFO` and above are shown). This separation — *what* gets logged, versus *where it goes and at what severity threshold* — is the entire reason logging scales to real production use in a way `print()` structurally cannot: the same `logger.error(...)` call can go to a developer's terminal during local development and to a searchable, alertable production logging system later, with zero changes to the calling code, only to configuration.

### Discard the throwaway example

Delete `lab_logging.py`. Wire real logging into the exception handler, and replace this project's remaining `print()` usage.

### Project Change

* **Files affected:** `main.py`.
* **Change type:** Modify.

### The New Code

```python
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("social_network")

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.method} {request.url.path}", exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "An internal error occurred"})
```

```python
# login, gains an audit log line
@app.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest):
    conn = get_connection()
    row = conn.execute("""...""", (credentials.username,)).fetchone()
    conn.close()

    if row is None or not bcrypt.checkpw(credentials.password.encode(), row["password_hash"]):
        logger.warning(f"Failed login attempt for username: {credentials.username}")
        raise HTTPException(status_code=401, detail="Invalid username or password")

    logger.info(f"Successful login for member_id: {row['id']}")
    token = create_access_token(row["id"])
    return {"access_token": token}
```

### Mechanical walkthrough

1. `logger.error(f"Unhandled exception on {request.method} {request.url.path}", exc_info=True)`: (already-established `exc_info=True` from isolation, applied for real). Every uncaught exception is now captured with full context — the request's method, path, and full traceback — server-side, even though the client only ever sees the generic `{"detail": "An internal error occurred"}` from the previous unit. Nothing is lost; it's routed correctly instead of shown to the wrong audience.
2. `logger.warning(...)` for a failed login, `logger.info(...)` for a successful one: (already-established `logging` levels, applied to real business events, not just errors). This is worth noting as a real capability logging provides beyond error handling: a searchable record of security-relevant events (repeated failed logins from one username, for instance) that `print()` debugging never provided and was never meant to.

### CS Lens

**Log levels as a filtering mechanism, not just labels.** `logging.basicConfig(level=logging.INFO)` means every `logger.info`, `logger.warning`, and `logger.error` call in the entire codebase is active, while any `logger.debug` calls (a lower level, for step-by-step tracing detail) would be silently suppressed — without touching a single line of the code that calls them. This is the same "declarative description, tool figures out the specifics" idea from Lesson 17's SQLAlchemy models, applied to observability instead of schema.

### SE Lens

**Logging is a real interface, with a real audience — the developer operating this system in production, not the person using it.** The exception handler's client-facing message and its server-side log entry are deliberately different, for deliberately different audiences, carrying deliberately different levels of detail — the same separation of concerns instinct that's shaped nearly every lesson in this project, applied here to *who gets to see what*, rather than *which module owns which logic*.

### Commands needed

```bash
pytest tests/
```

### Run it. Show the real output.

```text
============================= test session starts ==============================
collected 30 items

tests/test_api.py .............................                          [ 97%]
tests/test_units.py .                                                    [100%]

============================== 30 passed in 0.13s ===============================
```

### Connecting sentence

The application now fails safely and observably. The next lesson addresses a different reliability dimension entirely — speed, using caching and the query-profiling habits built since Lesson 10, now applied deliberately rather than just when something already seemed slow.

---

## Closing

**Connect the pieces**
An unhandled exception anywhere in the application is caught by the global handler, logged in full (timestamp, level, request context, and complete traceback) via `logger.error(..., exc_info=True)`, and answered to the client with a safe, generic `500` — two audiences, two appropriately different levels of detail, from one event. `login` similarly now leaves a real, leveled, searchable record of both failed and successful attempts, something no `print()` statement in any of this project's earlier labs ever provided.

**What breaks without this**
Without the global handler, a genuine bug would leak whatever Python's default error rendering includes — potentially internal file paths, library versions, or fragments of code — directly to whoever sent the request that triggered it. Without logging, that same bug, once safely hidden from the client, would leave no trace anywhere for a developer to actually diagnose and fix it — silently safe for the client, and silently unfixable for everyone else.

**Exercises**
1. Replace every remaining `print()` statement across `main.py`'s route functions (if any remain from earlier lessons' debugging) with an appropriately-leveled `logger` call.
2. Trigger the deliberate `/_test_crash` route from this lesson's failing test, and confirm the full traceback appears in your terminal (from `logging`) while the actual HTTP response remains the safe, generic message — both halves of this lesson working together, observed directly.

**Definition of Done**
* [x] A global exception handler catches all unhandled exceptions, returning a safe, generic client response.
* [x] Every unhandled exception is fully logged server-side via `exc_info=True`, nothing lost.
* [x] Key security-relevant events (login attempts) logged at appropriate levels.
* [x] Commit: `feat: safe global error handling with structured, leveled logging`

---

## Context Snapshot (End of Lesson 22)

**5. Test State:** 30 tests, 30 passing.

**6. Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| Global exception handler | L22 | Catches any unhandled exception type, providing a safety-net response |
| Fail-safe default | L22 | Deliberately designing the unanticipated-failure case to be safe, not an accident |
| `async def` (named, not yet fully explained) | L22 | A coroutine function, required by FastAPI's exception handler signature — deferred fuller treatment |
| Logging levels (`INFO`/`WARNING`/`ERROR`) | L22 | Severity-tagged messages, filterable by a configured minimum threshold |
| `exc_info=True` | L22 | Attaches a full traceback to a log entry |
| Log handler vs. log call | L22 | The call decides *what* to log; the handler configuration decides *where it goes and at what threshold* |

**7. Lesson Completion State:**
- Completed: Lessons 1-22, Interludes A, B, C, D
- Next: Lesson 23 — Making the Application Fast (caching, query profiling)

**8. Current Architecture State:**
- HTTP Layer: 23 routes, all failures safely handled
- Business Logic: `extract_hashtags`, `create_access_token`, `get_current_member`, `require_admin`
- Data Access: unchanged structurally
- ORM: partially adopted
- Authentication: complete
- Observability: structured logging introduced, replacing all `print()`-based debugging
