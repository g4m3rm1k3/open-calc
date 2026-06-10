# Sprint 8 · Lesson 3 — Structured logging and Sentry

## What you will build

By the end of this lesson, FastAPI emits structured JSON logs with a correlation ID on every request. Sentry captures unhandled exceptions with full stack traces and request context. You understand log levels, why plaintext logs break at scale, what a correlation ID is, and how to find the logs for a single failing request. This is how you debug production without SSH.

---

## What you need to know first

- Sprint 8 L1: Docker Compose, the running backend.
- Sprint 6 L4: Environment variables.

---

## The lesson

---

### 1. Why logging matters in production

**The problem:** Your application is running on a server you do not sit in front of. When a user reports "the app crashed at 2pm yesterday," you have two debugging tools: logs and error tracking. Without them, you guess. With them, you see exactly what happened, what data the request contained, and what line of code failed.

**The two tools:**

**Structured logging:** Every significant event (incoming request, database query, error) emits a log line. Structured logs are JSON — not `"POST /orders 200 in 43ms"` but `{"timestamp": "...", "method": "POST", "path": "/orders", "status": 200, "duration_ms": 43, "user_id": 7, "correlation_id": "abc123"}`. JSON logs can be searched, filtered, and aggregated by log management systems (Datadog, CloudWatch, Loki). `"give me all failed requests by user 7 in the last hour"` is one query in a log aggregation system; it is impossible with plaintext logs.

**Sentry:** An error tracking service. When an unhandled exception occurs, Sentry captures it with the full stack trace, the request URL and method, the request headers and body, and the user context. You get an email or Slack notification. Sentry groups duplicate errors and shows how many users are affected.

---

### 2. Structured logging with Python's logging module

Install `python-json-logger`:

```
pip install python-json-logger
pip freeze > requirements.txt
```

Create `backend/logging_config.py`:

```python
import logging
import uuid
from pythonjsonlogger import jsonlogger
from contextvars import ContextVar

correlation_id_var: ContextVar[str] = ContextVar('correlation_id', default='')

def setup_logging():
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    handler = logging.StreamHandler()
    formatter = jsonlogger.JsonFormatter(
        fmt='%(asctime)s %(levelname)s %(name)s %(message)s',
        rename_fields={'asctime': 'timestamp', 'levelname': 'level', 'name': 'logger'}
    )
    handler.setFormatter(formatter)

    logger.handlers = [handler]
    return logger

def get_correlation_id() -> str:
    return correlation_id_var.get()
```

Update `backend/main.py` to add request logging middleware and correlation IDs:

```python
import logging
import uuid
from logging_config import setup_logging, correlation_id_var

setup_logging()
logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    correlation_id = str(uuid.uuid4())
    correlation_id_var.set(correlation_id)

    logger.info(
        "Incoming request",
        extra={
            "method": request.method,
            "path": request.url.path,
            "correlation_id": correlation_id,
        }
    )

    import time
    start = time.perf_counter()
    response = await call_next(request)
    duration_ms = round((time.perf_counter() - start) * 1000, 2)

    logger.info(
        "Request completed",
        extra={
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "duration_ms": duration_ms,
            "correlation_id": correlation_id,
        }
    )

    response.headers["X-Correlation-ID"] = correlation_id
    return response
```

Log inside a route handler:

```python
@app.post("/auth/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
    logger.info(
        "Login attempt",
        extra={"username": user_data.username, "correlation_id": get_correlation_id()}
    )
    user = db.query(UserModel).filter(UserModel.username == user_data.username).first()
    if user is None or not verify_password(user_data.password, user.hashed_password):
        logger.warning(
            "Failed login attempt",
            extra={"username": user_data.username, "correlation_id": get_correlation_id()}
        )
        raise HTTPException(status_code=401, detail="Incorrect username or password", headers={"WWW-Authenticate": "Bearer"})
    token = create_access_token({"sub": str(user.id)})
    logger.info("Login successful", extra={"user_id": user.id, "correlation_id": get_correlation_id()})
    return TokenResponse(access_token=token, token_type="bearer")
```

**Walkthrough:**

`python-json-logger` — a Python `logging` formatter that converts log records to JSON strings. The output is one JSON object per line — machine-parseable.

`ContextVar('correlation_id')` — a `contextvars.ContextVar` is a thread-local (actually coroutine-local) variable. In async Python, each request runs in a coroutine. The `ContextVar` stores a value scoped to the current coroutine. When a request starts, `correlation_id_var.set(uuid)` sets the ID for this request's coroutine. Any code that runs within this request's coroutine context can read the correlation ID with `correlation_id_var.get()`. Without `ContextVar`, multiple concurrent requests would overwrite a single global variable.

`correlation_id = str(uuid.uuid4())` — a UUID4 is 128 random bits, generating a unique ID per request. The probability of a collision is 1 in 2^122 — effectively zero.

`response.headers["X-Correlation-ID"] = correlation_id` — the correlation ID is returned in the response header. The browser can copy it from the Network tab and use it to search logs: `grep "abc-123-uuid" /var/log/app.log`. The same ID links the incoming request log, the completed request log, and any error logs in between.

**Sample output:**

```json
{"timestamp": "2026-06-10 14:32:01,234", "level": "INFO", "logger": "main", "message": "Incoming request", "method": "POST", "path": "/orders", "correlation_id": "a3f8b2d1-..."}
{"timestamp": "2026-06-10 14:32:01,277", "level": "INFO", "logger": "main", "message": "Request completed", "method": "POST", "path": "/orders", "status_code": 201, "duration_ms": 43.2, "correlation_id": "a3f8b2d1-..."}
```

Both lines share the same `correlation_id` — you can reconstruct the full lifecycle of one request from log search.

**CS lens — correlation IDs in distributed systems.** In a microservices architecture, one user action triggers multiple services. Service A calls Service B which calls Service C. A bug in Service C is hard to trace back to the user action that caused it. Correlation IDs solve this: each request generates a correlation ID; every service that handles the request adds it to its log lines. Searching for the correlation ID across all services' logs shows the complete call chain. This practice is called **distributed tracing**. OpenTelemetry is the standard library for propagating trace IDs across services.

**SE lens — log levels as triage filters.** Python's `logging` module has five levels: `DEBUG`, `INFO`, `WARNING`, `ERROR`, `CRITICAL`. In production, set the log level to `INFO` — debug logs are too verbose. Use each level correctly:

- `DEBUG`: detailed internal state, only in development
- `INFO`: normal operations (request received, request completed, user logged in)
- `WARNING`: unusual but handled events (failed login, rate limit hit, deprecated API used)
- `ERROR`: an unexpected error occurred, but the application continued (caught exception, failed third-party call)
- `CRITICAL`: the application cannot continue (database connection lost, out of disk space)

Log level filtering means: to investigate a production incident, filter to `WARNING` and above. To understand normal traffic patterns, look at `INFO`. Debug logs are never enabled in production — they contain sensitive data and produce too much volume.

---

### 3. Sentry integration

Sign up at sentry.io (free tier available). Create a Python/FastAPI project. Copy the DSN (Data Source Name — the URL that Sentry uses to receive events from your application).

```
pip install sentry-sdk[fastapi]
pip freeze > requirements.txt
```

Update `backend/.env`:

```
SENTRY_DSN=https://your-dsn@sentry.io/project-id
```

Update `backend/main.py`:

```python
import sentry_sdk
import os

sentry_dsn = os.environ.get("SENTRY_DSN")
if sentry_dsn:
    sentry_sdk.init(
        dsn=sentry_dsn,
        traces_sample_rate=0.1,  # 10% of transactions
        profiles_sample_rate=0.1,
        environment=os.environ.get("ENVIRONMENT", "development"),
        send_default_pii=False,  # do not send personally identifiable information
    )
```

**That's all.** Sentry's FastAPI integration automatically captures all unhandled exceptions. Test it: add a route that raises an exception, call it, and check the Sentry dashboard.

```python
@app.get("/debug-sentry")
def trigger_error():
    division_by_zero = 1 / 0  # raises ZeroDivisionError
    return {"result": division_by_zero}
```

Visit `/debug-sentry`. The route raises `ZeroDivisionError`. FastAPI handles it (returns 500). Sentry captures it with the full stack trace.

**Walkthrough:**

`traces_sample_rate=0.1` — captures 10% of requests as performance traces (showing database query time, external API calls, etc.). 100% would create too much data for a busy API. 10% is sufficient for identifying performance bottlenecks.

`send_default_pii=False` — disables sending personally identifiable information (IP addresses, user IDs) to Sentry. Required for GDPR compliance in most contexts. Sentry will still capture the exception, stack trace, and request URL.

`environment=os.environ.get("ENVIRONMENT", "development")` — tags the event with the environment. Sentry lets you filter errors by environment: see only production errors, not development mistakes.

**Manual error capture:** For handled exceptions you want to track:

```python
import sentry_sdk

try:
    result = external_api.call()
except ExternalAPIError as e:
    sentry_sdk.capture_exception(e)
    logger.error("External API failed", extra={"error": str(e), "correlation_id": get_correlation_id()})
    raise HTTPException(status_code=503, detail="External service unavailable")
```

`sentry_sdk.capture_exception(e)` sends the exception to Sentry even though it was handled. You handle it (return a useful error response to the user) AND you track it (investigate the failure pattern).

**CS lens — Sentry as an error aggregation system.** Sentry receives individual error events and aggregates them into issues. An "issue" groups identical exceptions (same stack trace, same error type). If `ZeroDivisionError` at line 47 occurs 1,000 times in an hour, Sentry shows one issue with a count of 1,000 — not 1,000 separate alerts. This signal-to-noise improvement is essential: raw exception logs in a busy system are unreadable; aggregated issues are actionable. Sentry's grouping algorithm normalises variable parts of error messages (e.g., `"Order 7 not found"` and `"Order 42 not found"` are grouped as one issue).

**SE lens — alerting thresholds.** Sentry can send email/Slack alerts when a new issue appears, or when an issue's event count spikes. Configure alerts thoughtfully: alert on new issues (might be a regression just deployed), alert when a known issue's count spikes unexpectedly (might indicate a system failure). Do not alert on every occurrence — alert fatigue makes engineers ignore alerts. The goal is: every alert requires action; if it does not, reduce its severity or disable it.

---

### 4. What to log and what not to log

**Log these:**

- Request/response: method, path, status, duration, correlation ID
- Authentication events: login success, login failure (with username, not password), registration
- Business events: work order created, deleted (with IDs, not content)
- Errors: exception type, message, correlation ID
- External service calls: which service, duration, success/failure

**Never log:**

- Passwords: never, not even hashed
- Authorization tokens (JWT tokens) — they are credentials
- Full request bodies — may contain PII (personally identifiable information), API keys
- Credit card numbers, social security numbers, health data

**Add context, not data dumps.** Log `user_id: 7` not `user: {id: 7, username: alice, email: alice@example.com, hashed_password: $2b$...}`. Log the identifier that lets you look up the full record if needed.

**CS lens — log as an append-only event stream.** A log is an append-only sequence of timestamped events. This is the same data structure as a database's write-ahead log (WAL), Kafka's topics, and event sourcing's event store. The immutable, ordered sequence of events is a fundamental data structure in distributed systems: it provides a complete audit trail, supports replaying events to rebuild state, and can be processed by multiple consumers independently. Structured logs make this stream queryable.

---

## Connect the pieces

Production observability is now in place:
- Structured JSON logs with correlation IDs on every request
- Log levels: `INFO` for normal operations, `WARNING` for failures, `ERROR` for exceptions
- Sentry captures and aggregates unhandled exceptions with full context
- The correlation ID links logs to Sentry events to browser Network tab entries

Lesson 4 is the final lesson: where to go from here — Celery/Redis, WebSockets, GraphQL, microservices, and Kubernetes.

---

## What breaks without this

**Logging inside an async route handler without ContextVar:** If `correlation_id` is a global variable (not a `ContextVar`), concurrent requests overwrite each other's IDs. Two concurrent requests see each other's correlation IDs in their logs. Fix: always use `ContextVar` for request-scoped state in async Python.

---

## Definition of done

- [ ] `docker compose logs -f backend` shows JSON log lines for each request
- [ ] Each log line includes `correlation_id`
- [ ] Two lines (incoming + completed) share the same correlation ID for one request
- [ ] Hitting `/debug-sentry` creates an event in the Sentry dashboard
- [ ] `SENTRY_DSN` is in `.env` (not hardcoded)
- [ ] You can explain what `ContextVar` is and why a global variable would break concurrent request logging
- [ ] You can explain what Sentry aggregates and why that is valuable

**Git commit:**

```
git add backend/logging_config.py backend/main.py backend/requirements.txt
git commit -m "Add structured JSON logging with correlation IDs and Sentry error tracking"
```
