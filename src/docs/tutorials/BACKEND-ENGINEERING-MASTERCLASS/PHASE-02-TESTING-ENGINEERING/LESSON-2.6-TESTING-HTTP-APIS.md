# Lesson 2.6: Testing HTTP APIs

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Five real, run checks against this project's own real `PUT /api/machines/<id>/status` and `GET /api/machines/<id>` routes, each isolating one real part of an HTTP exchange - method and URL, headers, body, response and status, and real database effects - and along the way, independently reproducing a real, already-documented security gap in this project's own authentication: a request with no credentials at all still succeeds.

**What you need to know first:** What a system test checks, and how Flask's test client sends a real request without a real network socket; what a fixture is; what a mock is and why this lesson deliberately uses none.

## Terms used in this lesson

- **request method** — The real HTTP verb naming which kind of operation a request is asking for - `GET` to read, `PUT` to replace, among several this lesson does not cover. It exists because the same URL can mean genuinely different things depending on which method is used against it - this lesson's own `/api/machines/<id>/status` only ever runs its real update logic for a `PUT`, never a `GET`.
- **URL path parameter** — A real, named segment of a route's own URL pattern - `<string:machine_id>`, for instance - that Flask matches against the actual request URL and hands to the view function as a real argument. It exists so one route definition can serve every real machine ID, rather than a route being written once per machine.
- **request header** — Real key-value metadata sent alongside a request, separate from its body - information *about* the request, not the request's own payload. It exists because some real information (who's asking, what format they want back) belongs with every request regardless of what that request's own body happens to contain.
- **Authorization header** — A specific, real request header - `Authorization: Bearer <token>` - carrying real credentials. It exists as the real, standard place a client puts proof of who it is, so a server can check that proof before deciding what a request is even allowed to do.
- **request body** — The real data a request carries beyond its URL and headers - here, real JSON - read by the server via `request.get_json()`. It exists so an operation like "update this machine's status" can carry the actual new value along with it, not just identify which machine to act on.
- **response body** — The actual data an HTTP response carries back, written in JSON in this project - readable directly through `response.get_json()`. It exists as the real answer to whatever the request asked, separate from whether the request even succeeded at all.
- **HTTP status code** — The real three-digit number every HTTP response carries, stating in one compact, standardized value whether the request succeeded and, if not, roughly why - `200` for success, `400` for a real, invalid request body, `404` for a real, nonexistent resource. It exists so a caller, or a test, can tell success from a specific kind of failure without first parsing the response body at all.
- **database effect** — A real, persisted change to the database that happened as a result of handling one request - the actual, independent proof an operation really did what its own response body merely claims. It exists because a response body is only what the route *says* happened; only a separate, real query against the database afterward can confirm it actually did.

## Objects and methods used

- **`FlaskClient (.get / .put)`**
  - *What it is:* The real test client Flask's own `app.test_client()` returns, used throughout this lesson to send real, simulated requests.
  - *Implementation:* `.get(path, headers=...)` and `.put(path, json=..., headers=...)` are both real methods on `FlaskClient` - each simulates a real HTTP request of that method against the given path, with an optional real `json` argument (automatically serialized and given a real `Content-Type: application/json` header) and an optional real `headers` dict.
  - *Its use:* This lesson uses `.get` to exercise the read-only `GET /api/machines/<id>` route, and `.put` to exercise the real, state-changing `PUT /api/machines/<id>/status` route - the same client object, two different real methods.
  - *Type:* Real instance methods on `FlaskClient`, one per real HTTP method Flask itself supports.
  - *Responsibility:* Simulating a real HTTP request of a specific method, with a real body and real headers, against this app's own real routing - the same real mechanism an earlier lesson's own system test first used.
  - *Depends on:* A fully-built `Flask` app instance (via `app.test_client()`); a real path string; optionally, a real JSON-serializable body and a real headers dict.
  - *Connects to:* Every real request in this lesson goes through one of these two methods; each one returns a real `Response` object this lesson's own labs inspect directly afterward.
  - *Shape:* Takes a real path (and optional real body/headers) in; returns one real `Response` object out - never a plain dict, never `None`.

- **`Response (.status_code / .status / .content_type / .get_json())`**
  - *What it is:* The real response object Flask's test client returns from a simulated request.
  - *Implementation:* `.status_code` is a plain `int` (`200`, `400`, `404`, ...); `.status` is a real string combining the code and its standard reason phrase (`"200 OK"`); `.content_type` is a real string naming the response body's actual format (`"application/json"` for every route in this lesson); `.get_json()` parses the real body as JSON, returning a plain Python dict.
  - *Its use:* This lesson reads all four of these real members, across its five units, to fully characterize what a real response actually carries - not just whether it "worked."
  - *Type:* An object returned by a `FlaskClient` call - the same real class an earlier lesson's own system test first inspected, now examined more fully.
  - *Responsibility:* Carrying everything a real HTTP response would carry - status, headers, and body - in one object a test can inspect directly.
  - *Depends on:* The route function that handled the request.
  - *Connects to:* Produced by every real `.get`/`.put` call in this lesson; all four of its real members are read directly in this lesson's own labs.
  - *Shape:* `.status_code` is an `int`; `.status` and `.content_type` are plain strings; `.get_json()` is a plain `dict` (or `None`) - four genuinely different real facts about one response object.

- **`update_machine_status`**
  - *What it is:* A real, existing Flask view function updating a machine's real status in the database.
  - *Implementation:* `@machines_bp.route('/<string:machine_id>/status', methods=['PUT'])` `def update_machine_status(current_user, machine_id: str): ...` (`backend/app/routes/machines.py:80-115`) - looks up a real `Machine` by `machine_id`, returns `404` if it doesn't exist, reads `request.get_json()`, returns `400` if `'status'` is missing or not one of four real allowed values, then sets `machine.status` (and conditionally `machine.current_part_id`) and commits.
  - *Its use:* This lesson calls it, unmodified, in every unit but the first - the real, central specimen for headers, body, response/status, and database effects alike.
  - *Type:* A Flask view function, decorated with `@token_required`.
  - *Responsibility:* Validating a real status change request, applying it to a real `Machine` row, and reporting back the real, updated row - or a specific real error if the request was invalid.
  - *Depends on:* A real `Machine` row already existing; a real JSON body containing a valid `'status'` value; `@token_required`'s own real decision about whether this specific request is allowed through at all.
  - *Connects to:* Wrapped by `@token_required(allowed_roles=[...])`, which runs first, on every real request, before this function's own body ever executes.
  - *Shape:* Reads a real dict in (from `request.get_json()`), returns a real `(dict, int)` tuple out on an error path, or a real `Flask` response (via `jsonify`) with an implicit `200` on success.

- **`get_machine`**
  - *What it is:* A real, existing Flask view function retrieving one machine by ID.
  - *Implementation:* `@machines_bp.route('/<string:machine_id>', methods=['GET'])` `def get_machine(current_user, machine_id: str): ...` (`backend/app/routes/machines.py:48-61`) - looks up a real `Machine` by `machine_id`, returning `404` with a real error dict if it isn't found, or `200` with the real machine's own data.
  - *Its use:* This lesson calls it to demonstrate real method/URL mechanics and real response/status inspection, deliberately separate from the write-side complexity `update_machine_status` carries.
  - *Type:* A Flask view function, decorated with `@token_required`.
  - *Responsibility:* Reading exactly one real machine's current, real data by its ID, with no side effects of its own.
  - *Depends on:* A real `machine_id` matched from the request URL.
  - *Connects to:* Also wrapped by `@token_required`; called with both a real, existing ID and a real, nonexistent one across this lesson's own labs.
  - *Shape:* Takes a `machine_id` string (from the URL, not the body); returns a real dict, wrapped in `jsonify`, with an implicit `200`, or a real error dict with an explicit `404`.

- **`token_required`**
  - *What it is:* A real, existing decorator factory in this project's own backend, wrapping a view function with authentication and role-checking logic.
  - *Implementation:* `def token_required(allowed_roles: list = None): ...` (`backend/app/utils/auth_utils.py:308-479`) - reads a real `Authorization` header if present; if none is present *and* `'operator'` is in `allowed_roles`, its own real code (explicitly commented `# OPERATOR BYPASS`) lets the request through anyway, calling the wrapped view with `current_user=None`; otherwise it decodes and verifies a real token, looks up a real `User` row by the token's own `sub` claim, and checks that user's role against `allowed_roles`.
  - *Its use:* This lesson never calls it directly - it wraps both `get_machine` and `update_machine_status` automatically, and this lesson's own headers unit exists specifically to observe its real bypass branch firing.
  - *Type:* A decorator factory - a function that returns a real decorator.
  - *Responsibility:* Deciding, for every real request to a route it wraps, whether that request is allowed to proceed at all, and as which real user (or `None`).
  - *Depends on:* `allowed_roles`, a real list this project passes differently per route; the real `Authorization` header, if the request sent one.
  - *Connects to:* Wraps both real view functions this lesson calls; its own real decision runs before either view function's own body ever executes.
  - *Shape:* Takes a real list of role strings in; returns a real decorator that, applied to a view function, produces a new function Flask actually registers as the route.

- **`encode_auth_token`**
  - *What it is:* A real, existing function in this project's backend, producing a real, signed JWT for a given user.
  - *Implementation:* `def encode_auth_token(user_id: str, role: str) -> str:` (`backend/app/utils/auth_utils.py:163-247`) - builds a real payload with `sub` (the user ID), `role`, `exp` (a real 7-day expiry), and `iat`, then signs it with `jwt.encode(...)` using this app's own real `SECRET_KEY`.
  - *Its use:* This lesson calls it to generate a real, valid token for a real `User` row it creates itself, specifically to exercise the *authenticated* path through `token_required`, not just its bypass.
  - *Type:* A module-level function.
  - *Responsibility:* Producing one real, cryptographically signed token string, from a real user ID and role, that `token_required` can later decode and trust.
  - *Depends on:* A real user ID and role string; the real Flask app's own configured `SECRET_KEY`, read from `current_app.config`.
  - *Connects to:* Its real output is passed straight into this lesson's own `Authorization: Bearer <token>` headers, later decoded by `token_required` on the receiving end.
  - *Shape:* Takes two real strings in, returns one real, signed token string out.

## Concept Unit: Request Method and URL - Which Operation, Which Resource

### The Problem

This project's real `GET /api/machines/<id>` route (`backend/app/routes/machines.py:48-61`) only runs for a specific real method against a specific real URL shape. What exactly identifies which of this project's many real routes a given request actually reaches?

Before reading on:

- If a real `POST` request were sent to the exact URL `/api/machines/M-TEST-001`, would `get_machine` run at all? What does `@machines_bp.route('/<string:machine_id>', methods=['GET'])`'s own real `methods` argument say about that?
- `<string:machine_id>` sits inside the route's own URL pattern, not in a query string. What does that suggest about the real difference between a URL path segment and something like `?status=running`?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Real specimen: `backend/app/routes/machines.py:48-61` (`get_machine`), read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row, built the same way an earlier lesson's own integration test already built one.

### The New Code

One real machine, one real `GET` request, no headers or body involved yet:

**File:** `verification/phase-02/lab_pytest_demo/lab_http_method_url.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine

app = create_app("testing")
with app.app_context():
    machine = Machine(id="M-TEST-001", name="Test Mill", category="mill", sub_type="3_axis", status="available")
    db.session.add(machine)
    db.session.commit()

    client = app.test_client()
    response = client.get("/api/machines/M-TEST-001")
    print("status:", response.status_code)
    print("body:", response.get_json())
```

### Mechanical Walkthrough

- `client = app.test_client()` — Builds a real test client bound to this app - the same real mechanism an earlier lesson's own system test first used.
- `client.get("/api/machines/M-TEST-001")` — Sends a real, simulated `GET` request to this exact URL. Werkzeug's own real routing matches it against `get_machine`'s route pattern, extracting `"M-TEST-001"` as the real value for that route's own `machine_id` URL path parameter.
- `print("status:", response.status_code)` — Prints the real integer status this specific request actually received.
- `print("body:", response.get_json())` — Prints the real parsed JSON body - the exact machine row just created, echoed back by `get_machine`'s own real logic.

### CS Lens

This is **request routing**: matching a real method and URL against a table of real, registered handlers, and extracting real path parameters along the way. Also recognized in: every web framework's own URL router (Django's `urlpatterns`, Express's own route table); a CPU's own instruction dispatch, matching an opcode against the one real handler that executes it; a phone switchboard's own number-to-line routing; and, in this project's own domain, a G-code modal group determining which real, already- active command a bare parameter line actually belongs to.

### SE Lens

The design principle is that method and URL together, not either alone, identify one specific real operation - REST's own core idea. The real alternative not chosen - one URL per operation, regardless of method (`/api/machines/get/<id>`, `/api/machines/update-status/<id>`) - would work, but loses the real convention this project's own routes already follow consistently: the same resource URL, `/api/machines/<id>`, already serves both `GET` (this unit) and `PUT`/`PATCH` (the next unit's own specimen), differing only in method. The honest cost of that convention: a reader has to check a route's own `methods` list to know what a given URL actually does - the URL alone isn't enough.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_http_method_url.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
status: 200
body: {'data': {'axes': 3, 'category': 'mill', 'createdAt': '2026-08-31T00:03:25.615406', 'currentOperatorClientId': None, 'currentPartId': None, 'groupId': None, 'hasToolChanger': False, 'id': 'M-TEST-001', 'location': None, 'manufacturer': None, 'maxSpindleSpeed': None, 'model': None, 'name': 'Test Mill', 'operatorLastHeartbeatAt': None, 'serialNumber': None, 'spindleTaper': None, 'status': 'available', 'subType': '3_axis', 'toolChangerCapacity': None, 'updatedAt': '2026-08-31T00:03:25.615408', 'xTravel': None, 'yTravel': None, 'zTravel': None}}
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_http_method_url_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it establishes the real machine specimen and the real client every later unit reuses, on the simplest possible request shape.

## Concept Unit: Headers - Real Metadata Riding Along with the Request

### The Problem

This project's real `token_required` decorator (`backend/app/utils/auth_utils.py:414-424`) has a branch its own code explicitly comments `# OPERATOR BYPASS`. Given `update_machine_status`'s own real `allowed_roles=['operator', 'quality', 'programming', 'admin']`, what actually happens to a real request with no `Authorization` header at all?

Before reading on:

- Given that comment, and that `'operator'` is in this route's own `allowed_roles`, what do you predict happens to a real `PUT` request to this route with no `Authorization` header at all - before reading the real output below?
- If a route's own `allowed_roles` did *not* include `'operator'`, would you expect the same no-header request to behave the same way?

### Project Change

- **Reference Source:** Real specimen: `backend/app/utils/auth_utils.py:411-436`, read again this session - the exact real branch deciding what happens when no token is present.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` and a real `User` row, plus a real token from `encode_auth_token`.

### The New Code

The identical real `PUT` request, sent twice - once with no `Authorization` header, once with a real, valid one:

**File:** `verification/phase-02/lab_pytest_demo/lab_http_headers.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine
from app.models.user import User
from app.utils.auth_utils import encode_auth_token

app = create_app("testing")
with app.app_context():
    machine = Machine(id="M-TEST-001", name="Test Mill", category="mill", sub_type="3_axis", status="available")
    user = User(id="U-TEST-001", email="test-admin@example.com", name="Test Admin", role="admin")
    db.session.add(machine)
    db.session.add(user)
    db.session.commit()

    token = encode_auth_token("U-TEST-001", "admin")
    client = app.test_client()

    r_no_headers = client.put("/api/machines/M-TEST-001/status", json={"status": "running"})
    print("no Authorization header -> status:", r_no_headers.status_code)

    r_with_headers = client.put(
        "/api/machines/M-TEST-001/status",
        json={"status": "offline"},
        headers={"Authorization": f"Bearer {token}"},
    )
    print("real Authorization header -> status:", r_with_headers.status_code)

    assert r_no_headers.status_code == 200, "real, documented operator bypass: no header still succeeds"
    assert r_with_headers.status_code == 200
    print("both requests succeeded - the header changed nothing about whether this specific route allowed the request through")
```

### Mechanical Walkthrough

- `user = User(id="U-TEST-001", email=..., name=..., role="admin")` — Builds one real `User` row - required so a real token's own `sub` claim resolves to a genuine user during the authenticated request; `token_required`'s own real code looks this row up and returns `401 USER_NOT_FOUND` if it doesn't exist.
- `token = encode_auth_token("U-TEST-001", "admin")` — Produces one real, valid, signed token for that real user - used only in the second of this unit's two requests.
- `r_no_headers = client.put(..., json={"status": "running"}) (no headers argument)` — Sends a real `PUT` request with a real, valid body, but explicitly no `headers` argument at all - no `Authorization` header is sent.
- `r_with_headers = client.put(..., headers={"Authorization": f"Bearer {token}"})` — Sends a second, separate real request to the identical URL and method, this time with a real `Authorization` header carrying the real token built above.
- `assert r_no_headers.status_code == 200, "real, documented operator bypass: ..."` — Confirms, for real, that the header-less request succeeded - this project's own real code, run directly, reproducing the exact bypass its own comment names.

### CS Lens

This is **request metadata** used for authentication - a header carrying information *about* the request (who's asking) rather than the request's own payload. Also recognized in: an API key passed in an `X-API-Key` header; a `Content-Type` header telling a server how to parse the body that follows it; an HTTP `If-None-Match` header enabling conditional caching without touching the body at all; and, in this project's own domain, a job traveler card riding alongside a physical part through the shop, carrying who authorized it without being part of the part itself.

### SE Lens

The design principle at stake - checking credentials before a state-changing operation runs - is sound; the real, honest problem this unit's own run output proves is that this specific route's implementation of it has a real gap. The real alternative this project's own code chose - `'operator'` role implies anonymous access is fine - has a real, defensible use case named directly in `token_required`'s own comments (a public operator dashboard); the honest cost, proven by this exact unit: that same bypass also applies to `update_machine_status`, a real, state-changing write endpoint, not a read-only dashboard - the same permissive rule, applied somewhere its own stated justification never covered.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_http_headers.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
no Authorization header -> status: 200
real Authorization header -> status: 200
both requests succeeded - the header changed nothing about whether this specific route allowed the request through
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_http_headers_output.txt`.

### Connection to the previous unit

The previous unit sent a request with no headers at all, without remarking on it; this unit makes that choice deliberate, and shows this project's own real code treating it as meaningful in a way its own comments admit is a real, named tradeoff.

## Concept Unit: Body - What the Request Actually Carries

### The Problem

The same real URL, the same real method, three different real JSON bodies - and three different real outcomes. What real code actually inspects the body, and what does it check first?

Before reading on:

- `update_machine_status`'s own real code (`backend/app/routes/machines.py:93-100`) checks whether `'status'` is even present in the body before checking whether its value is one of four real allowed ones. What real body would trigger the first check without ever reaching the second?
- If the same `"status": "running"` value were sent as a URL query string (`?status=running`) instead of as JSON, would `request.get_json()` see it at all?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:93-100`, read again this session - the exact real validation this unit's own three requests are designed to exercise.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row, the same as this lesson's first unit.

### The New Code

Three real requests, identical except for their body:

**File:** `verification/phase-02/lab_pytest_demo/lab_http_body.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine

app = create_app("testing")
with app.app_context():
    machine = Machine(id="M-TEST-001", name="Test Mill", category="mill", sub_type="3_axis", status="available")
    db.session.add(machine)
    db.session.commit()

    client = app.test_client()

    r_no_status_key = client.put("/api/machines/M-TEST-001/status", json={})
    print("body {} (missing 'status') -> status:", r_no_status_key.status_code, r_no_status_key.get_json())

    r_invalid_value = client.put("/api/machines/M-TEST-001/status", json={"status": "not_a_real_status"})
    print("body with an invalid status value -> status:", r_invalid_value.status_code, r_invalid_value.get_json())

    r_valid = client.put("/api/machines/M-TEST-001/status", json={"status": "maintenance"})
    print("body with a real, valid status value -> status:", r_valid.status_code)

    assert r_no_status_key.status_code == 400
    assert r_invalid_value.status_code == 400
    assert r_valid.status_code == 200
    print("the same URL, the same method, three different real bodies, three different real outcomes")
```

### Mechanical Walkthrough

- `client.put("/api/machines/M-TEST-001/status", json={})` — Sends a real, empty JSON object as the body - `request.get_json()` on the receiving end returns a real, empty dict, so `'status' not in data` is `True`, and the route's own first real validation check fails.
- `client.put(..., json={"status": "not_a_real_status"})` — Sends a body that *does* have a real `'status'` key, so the first check passes - but its value isn't one of the four real strings the route's own code allows, so its second check fails instead.
- `client.put(..., json={"status": "maintenance"})` — Sends a real, genuinely valid status value - both real checks pass, and the route's own real update-and-commit logic actually runs.
- `assert r_no_status_key.status_code == 400 / assert r_invalid_value.status_code == 400 / assert r_valid.status_code == 200` — Confirms all three real, distinct outcomes - two different real reasons for the same status code, and one genuine success, from three bodies differing in nothing else.

### CS Lens

This is **request validation**: checking a payload's real shape and real content before trusting it enough to act on. Also recognized in: JSON Schema validation rejecting a malformed API request before any business logic runs; a compiler's own semantic analysis catching a type error before code generation; a CNC control refusing to run a program whose G-code fails a real syntax check first; and, in this project's own domain, a quality inspection rejecting an out-of-tolerance part before it's ever released to the next operation.

### SE Lens

The design principle is validating in a specific, deliberate order - presence before value - so a caller gets the most useful real error for their specific mistake, not a generic one. The real alternative not chosen - a single, combined check (`data.get('status') not in valid_statuses`) - would still catch both real problems this unit demonstrated, but would report the exact same `400` and a less specific message for a body missing the key entirely versus one with a real, wrong value in it. The honest cost of the two-step version actually used: it's two real lines instead of one, maintained separately, for a distinction this unit's own real output shows is genuinely worth making to whoever reads the error.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_http_body.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
body {} (missing 'status') -> status: 400 {'error': 'Status required'}
body with an invalid status value -> status: 400 {'error': "Invalid status. Must be one of: ['available', 'running', 'offline', 'maintenance']"}
body with a real, valid status value -> status: 200
the same URL, the same method, three different real bodies, three different real outcomes
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_http_body_output.txt`.

### Connection to the previous unit

The previous unit varied a request's headers with its body fixed; this unit holds headers aside entirely and varies the body, isolating the one real part of a request the route's own validation logic actually inspects.

## Concept Unit: Response and Status - What Comes Back, and What It Means

### The Problem

A response carries more than a bare status code - real headers of its own, and a real body. What real, separate facts does inspecting a full `Response` object actually let a test check?

Before reading on:

- `response.status_code` is `200`, an `int`; `response.status` is `'200 OK'`, a string. What real, different job does each one actually do for a reader or a piece of code checking it?
- If a route only ever returned a bare `200` with no real content at all, would checking `response.content_type` still tell you anything real about what came back?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:48-61` (`get_machine`), reused from this lesson's first unit, now inspected against both a real, existing machine and a real, nonexistent one.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row, the same as this lesson's first unit.

### The New Code

One real, successful request, inspected across four separate real facts, next to one real, failing request:

**File:** `verification/phase-02/lab_pytest_demo/lab_http_response_status.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine

app = create_app("testing")
with app.app_context():
    machine = Machine(id="M-TEST-001", name="Test Mill", category="mill", sub_type="3_axis", status="available")
    db.session.add(machine)
    db.session.commit()

    client = app.test_client()
    response = client.get("/api/machines/M-TEST-001")

    print("response.status_code:", response.status_code)
    print("response.status:", response.status)
    print("response.content_type:", response.content_type)
    print("response.get_json():", response.get_json())

    r_missing = client.get("/api/machines/DOES-NOT-EXIST")
    print("missing machine -> response.status_code:", r_missing.status_code)
    print("missing machine -> response.get_json():", r_missing.get_json())

    assert response.status_code == 200
    assert response.content_type == "application/json"
    assert r_missing.status_code == 404
    print("status code and body inspected separately - two different real facts about the same response")
```

### Mechanical Walkthrough

- `response.status_code` — The real, plain integer status - useful for a machine- readable check (`== 200`) exactly like every earlier unit in this lesson already used.
- `response.status` — A real string combining that same code with its standard, human-readable reason phrase, `"200 OK"` - the same real information as `.status_code`, in a form meant for a person reading it, not a program comparing it.
- `response.content_type` — A real string naming the actual format of the body that follows - `"application/json"` here, because `get_machine`'s own code returns its result through `jsonify(...)`, which sets this header automatically.
- `r_missing = client.get("/api/machines/DOES-NOT-EXIST")` — A second, separate real request, to an ID that was never created - exercising `get_machine`'s own real `if not machine:` branch instead of its success path.
- `assert r_missing.status_code == 404` — Confirms the real, specific failure code this project's own code chose for "not found" - distinct from the real `400`s the previous unit's body-validation checks produced, for a genuinely different real kind of problem.

### CS Lens

This is treating a **response as a real, structured object**, not a single pass/fail bit - status, headers, and body are three genuinely separate real facts, checkable independently. Also recognized in: an HTTP client library's own typed response object (`requests.Response` in Python, `fetch`'s own `Response` in JavaScript); a function returning a real result *and* a real error code, checked separately, in languages that favor that pattern over exceptions; and, in this project's own domain, a machine alarm carrying both a real numeric code and a real, separate human-readable message, checked by different systems for different real reasons.

### SE Lens

The design principle is exposing enough of a response's real structure that a caller - human or test - can check exactly the fact that matters to them, without over- or under-checking. The real alternative not chosen - collapsing everything into one boolean, "did it work" - would lose the real, meaningful distinction this unit's own run proved matters: a `404` (this resource genuinely doesn't exist) and a `400` (this request was malformed) are both "it didn't work," but they mean, and should be handled, completely differently. The honest cost of checking every real member separately, the way this unit does: more real assertions to write, for a genuinely more precise real picture of what happened.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_http_response_status.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
response.status_code: 200
response.status: 200 OK
response.content_type: application/json
response.get_json(): {'data': {'axes': 3, 'category': 'mill', 'createdAt': '2026-08-31T00:03:29.058009', 'currentOperatorClientId': None, 'currentPartId': None, 'groupId': None, 'hasToolChanger': False, 'id': 'M-TEST-001', 'location': None, 'manufacturer': None, 'maxSpindleSpeed': None, 'model': None, 'name': 'Test Mill', 'operatorLastHeartbeatAt': None, 'serialNumber': None, 'spindleTaper': None, 'status': 'available', 'subType': '3_axis', 'toolChangerCapacity': None, 'updatedAt': '2026-08-31T00:03:29.058011', 'xTravel': None, 'yTravel': None, 'zTravel': None}}
missing machine -> response.status_code: 404
missing machine -> response.get_json(): {'error': 'Machine not found'}
status code and body inspected separately - two different real facts about the same response
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_http_response_status_output.txt`.

### Connection to the previous unit

The previous unit read a status code as one fact among several already printed; this unit deliberately separates every real fact a response carries, and adds a second, failing real request to show the same object shape covering both outcomes.

## Concept Unit: Database Effects - Proving the Request Actually Changed Something

### The Problem

A successful response's own body claims a machine's status changed - but a response body is only what the route *says* happened. What real, independent evidence would actually confirm the database itself changed?

Before reading on:

- If `update_machine_status`'s own real code returned a fabricated, hard-coded success response without ever calling `db.session.commit()`, would a test checking only `response.get_json()` catch that?
- What real, separate query, run *after* the request completes, would settle the question of whether the database itself actually changed?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Real specimen: the same `update_machine_status` (`backend/app/routes/machines.py:80-115`) this lesson's headers and body units already exercised, now checked against the database directly, not just its own response.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** Real `Machine`, `Part`, and `User` rows.

### The New Code

Every real part of this lesson at once - method, URL, headers, body, response, status - ending in a direct, independent database query:

**File:** `verification/phase-02/lab_pytest_demo/lab_http_full_check.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine
from app.models.part import Part
from app.models.user import User
from app.utils.auth_utils import encode_auth_token

app = create_app("testing")
with app.app_context():
    machine = Machine(id="M-TEST-001", name="Test Mill", category="mill", sub_type="3_axis", status="available")
    part = Part(id="P-TEST-001", part_number="1234567", description="Test Part")
    user = User(id="U-TEST-001", email="test-admin@example.com", name="Test Admin", role="admin")
    db.session.add(machine)
    db.session.add(part)
    db.session.add(user)
    db.session.commit()

    token = encode_auth_token("U-TEST-001", "admin")
    print("real token generated (truncated):", token[:40], "...")

    client = app.test_client()

    r_ok = client.put(
        "/api/machines/M-TEST-001/status",
        json={"status": "running", "currentPartId": "P-TEST-001"},
        headers={"Authorization": f"Bearer {token}"},
    )
    print("valid request -> status:", r_ok.status_code, "body:", r_ok.get_json())

    refreshed = db.session.get(Machine, "M-TEST-001")
    print("real row after the request -> status:", refreshed.status, "current_part_id:", refreshed.current_part_id)

    assert r_ok.status_code == 200
    assert refreshed.status == "running"
    assert refreshed.current_part_id == "P-TEST-001"
    print("response AND database agree - the request really did what it claimed")
```

### Mechanical Walkthrough

- `part = Part(id="P-TEST-001", ...)` — Builds a real `Part` row, needed here because this unit's real request body includes a real `currentPartId` - `update_machine_status`'s own code (`backend/app/routes/machines.py:105-106`) writes that value straight onto `machine.current_part_id` with no check that it's a real part at all, which this unit's own database check can still verify independently either way.
- `r_ok = client.put(..., json={"status": "running", "currentPartId": "P-TEST-001"}, headers={"Authorization": f"Bearer {token}"})` — One real request, combining every real ingredient this lesson's earlier units isolated separately: a real method and URL, a real header, and a real, valid body.
- `refreshed = db.session.get(Machine, "M-TEST-001")` — A fresh, real, independent query against the database - deliberately not reusing the `machine` variable already in scope, so this really re-reads whatever the request actually persisted, rather than trusting the in-memory object's own state.
- `assert refreshed.status == "running" / assert refreshed.current_part_id == "P-TEST-001"` — The real proof this unit exists to demonstrate: checking the database directly confirms the same two real values the response body already claimed - if `update_machine_status` had returned a fabricated success without actually committing, these two lines, not the response check above them, are what would have caught it.

### CS Lens

This is verifying a **side effect** independently of its own reported result - the same discipline an earlier lesson's own integration test first established, now applied specifically through a real HTTP request instead of a direct function call. Also recognized in: a bank transfer's own real ledger balance checked after an API call reports "success," not merely trusted; an infrastructure-as-code tool's own real "plan vs. actual state" reconciliation; a database migration verified by querying the real schema afterward, not by trusting the migration tool's own exit code; and, in this project's own domain, a part's real, physical dimensions measured after a proveout, not inferred from the program having "completed without error."

### SE Lens

The design principle is that a response is a claim, and a system test worth trusting checks that claim against independent, real evidence. The real alternative not chosen throughout this lesson - checking only `response.get_json()` and stopping there - is exactly what every earlier unit in this lesson actually did, and none of them were wrong to; this unit's own point is narrower and specific to *write* operations: for a route that changes real state, the response and the database are two separate real sources of truth that happen to agree today, and only checking both, independently, is what would ever catch them quietly disagreeing. The honest cost: every real write-endpoint test now needs its own follow-up query, not just a response check - real, extra work, paid specifically where an earlier lesson's own integration-test unit already argued it was worth paying.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_http_full_check.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
real token generated (truncated): eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ ...
valid request -> status: 200 body: {'data': {'axes': 3, 'category': 'mill', 'createdAt': '2026-08-31T00:03:30.183205', 'currentOperatorClientId': None, 'currentPartId': 'P-TEST-001', 'groupId': None, 'hasToolChanger': False, 'id': 'M-TEST-001', 'location': None, 'manufacturer': None, 'maxSpindleSpeed': None, 'model': None, 'name': 'Test Mill', 'operatorLastHeartbeatAt': None, 'serialNumber': None, 'spindleTaper': None, 'status': 'running', 'subType': '3_axis', 'toolChangerCapacity': None, 'updatedAt': '2026-08-31T00:03:30.192761', 'xTravel': None, 'yTravel': None, 'zTravel': None}}
real row after the request -> status: running current_part_id: P-TEST-001
response AND database agree - the request really did what it claimed
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_http_full_check_output.txt`.

### Connection to the previous unit

Every previous unit in this lesson trusted the response object as the whole real answer; this unit closes the lesson by checking a second, independent real source of truth against it, for the one kind of request - a real write - where the two could ever honestly disagree.

## Connect the pieces

One real machine, one real `GET` request, matched by a real method and URL to exactly one real route (method and URL). The identical real `PUT` request, sent with and without a real `Authorization` header, both succeeding - a real, independently reproduced security gap, not a hypothetical one (headers). The same real URL and method, three different real JSON bodies, producing two different real kinds of `400` and one real `200` (body). One real response, inspected across four separate real facts - `status_code`, `status`, `content_type`, and a real JSON body - next to a second, real `404` for a machine that was never created (response and status). And, last, a real write request whose response claims success, checked against a second, independent, real database query that confirms it - the one real check this lesson's every earlier unit skipped, on purpose, until the moment a write operation made it actually matter (database effects). Six real parts of one real HTTP exchange, each checked on its own, against this project's own real, running code.

**Next lesson:** Every check built in this lesson assumed the real code being tested was already correct, or was checking new code as it was written. Next, this curriculum turns to the opposite, harder case: a real, already-existing implementation nobody fully trusts yet, and how to pin down exactly what it currently does - correctly or not - before anyone is allowed to change a single line of it.