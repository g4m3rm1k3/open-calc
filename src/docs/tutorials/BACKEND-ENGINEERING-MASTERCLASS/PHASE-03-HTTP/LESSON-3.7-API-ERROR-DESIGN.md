# Lesson 3.7: API Error Design

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Four real, run checks closing this phase by directly addressing what every earlier lesson in it has been quietly documenting: this project's own real errors are represented inconsistently. A real catalog of three genuinely different real error shapes already living in this backend; a real, proposed, minimal contract with a shared baseline every one of them could keep; a real, external-client proof that one specific real failure (`500`) isn't even valid JSON at all; and that same proposed contract, applied against the identical real failures this lesson's own catalog found, collapsing three ad hoc real shapes into one real, shared baseline.

**What you need to know first:** What the real HTTP status codes, headers, and JSON response shapes this project's own backend actually returns look like; what an API contract and a response envelope are.

## Terms used in this lesson

- **error code** — A real, stable, machine-readable string identifying WHAT kind of failure occurred - `'MACHINE_NOT_FOUND'`, in this lesson's own proposed contract - kept separate from a real, human-readable message. It exists so a real caller's own code can branch on a failure's real kind (`if code == 'TOKEN_MISSING': ...`) without parsing a message string that might change wording at any time.
- **unified error contract** — A real, single, shared shape every error response in an API returns, regardless of which real route or failure produced it - this lesson's own proposed `build_error_response` function produces exactly one. It exists so a real caller writes one real block of error-handling code, once, instead of one per route.

## Objects and methods used

- **`get_machine`**
  - *What it is:* A real, existing Flask view function retrieving one machine by ID - already studied earlier in this phase, revisited here specifically for its real error shape.
  - *Implementation:* `def get_machine(current_user, machine_id: str): ...` (`backend/app/routes/machines.py:48-61`) returns `jsonify({'error': 'Machine not found'}), 404` when the real machine doesn't exist - a real, bare `{'error': str}` shape, no `'success'` key, no `'code'` key.
  - *Its use:* This lesson uses its real `404` as the first of three real, distinct error shapes its own catalog unit collects.
  - *Type:* A Flask view function, decorated with `@token_required`.
  - *Responsibility:* Reporting a real, missing machine using the plainest real shape this API's own error responses use anywhere.
  - *Depends on:* A real `machine_id` matched from the request URL.
  - *Connects to:* Its own real, bare shape is contrasted directly against `delete_machine`'s and `token_required`'s in this lesson's own catalog and applied-contract units.
  - *Shape:* Returns a real, `jsonify`-wrapped `{'error': str}` dict with an explicit `404` on failure.

- **`delete_machine`**
  - *What it is:* A real, existing Flask view function deleting a machine - already studied earlier in this phase, revisited here for its real error shape.
  - *Implementation:* `def delete_machine(current_user, machine_id: str): ...` (`backend/app/routes/machines.py:274-297`) returns `jsonify({'success': False, 'error': 'Machine not found'}), 404` when the real machine doesn't exist (`:286`) - a real, genuinely different shape from `get_machine`'s, despite reporting the identical real kind of failure.
  - *Its use:* This lesson uses its real `404` as the second of three real, distinct error shapes its own catalog unit collects.
  - *Type:* A Flask view function, decorated with `@token_required`.
  - *Responsibility:* Reporting a real, missing machine with an added real `'success'` flag `get_machine`'s own identical real failure never includes.
  - *Depends on:* A real `machine_id` matched from the request URL.
  - *Connects to:* Its own real shape, genuinely different from `get_machine`'s for the identical real kind of failure, is the central specimen this lesson's own catalog unit is built around.
  - *Shape:* Returns a real, `jsonify`-wrapped `{'success': bool, 'error': str}` dict with an explicit `404` on failure.

- **`token_required`**
  - *What it is:* The real, existing decorator factory deciding whether a request is allowed to reach the view function it wraps - already studied extensively earlier in this curriculum, revisited here for its real error shape.
  - *Implementation:* `def token_required(allowed_roles: list = None): ...` (`backend/app/utils/auth_utils.py:308-488`) returns `jsonify({'error': ..., 'code': 'TOKEN_MISSING', 'path': request.path}), 401` (`:432-436`) when no real token is present - a real, third shape, carrying both a `'code'` AND a `'path'` key neither `get_machine`'s nor `delete_machine`'s own real shape includes.
  - *Its use:* This lesson uses its real `401` as the third of three real, distinct error shapes its own catalog unit collects - and as the one real, existing shape already closest to what this lesson's own proposed contract recommends.
  - *Type:* A decorator factory - a function that returns a real decorator.
  - *Responsibility:* Reporting a real, missing credential with real, machine-readable context (`code`, `path`) neither of this lesson's other two real specimens include.
  - *Depends on:* The real `Authorization` header, if present.
  - *Connects to:* Its own real `'code'` field is the one piece of this lesson's proposed contract already present, in some real form, somewhere in this project's own existing code.
  - *Shape:* Returns a real, `jsonify`-wrapped `{'error': str, 'code': str, 'path': str}` dict with an explicit `401`.

- **`build_error_response`**
  - *What it is:* A real, new, standalone Python function this lesson proposes - not yet wired into this project's own real backend, since Flask's own error-handling mechanics (`@app.errorhandler`) aren't taught until this curriculum's next phase.
  - *Implementation:* `def build_error_response(code: str, message: str, status: int, **extra) -> tuple: body = {"success": False, "code": code, "message": message}; body.update(extra); return body, status` (`verification/phase-03/lab_error_contract_design.py:1-4`) - always includes the identical real three keys (`success`, `code`, `message`), and accepts any real, additional keyword arguments as case-specific extra context, merged in afterward.
  - *Its use:* This lesson calls it to produce a real, proposed shape for every real failure its own catalog unit already found, specifically to compare the real, current shapes against one real, unified alternative.
  - *Type:* A real, standalone Python function (not yet part of this project's own backend).
  - *Responsibility:* Producing one real, consistent baseline shape for any error, while still allowing real, case-specific extra fields when a specific failure genuinely needs one.
  - *Depends on:* A real `code`, `message`, and `status`; any real, additional keyword arguments the caller wants included.
  - *Connects to:* Called directly by this lesson's own contract-design and contract-applied units; produces the real shape those two units compare against this project's own real, existing error responses.
  - *Shape:* Takes a real `code`, `message`, `status`, and optional real keyword arguments in; returns a real `(dict, int)` tuple out - the dict always a superset of `{'success', 'code', 'message'}`.

## Concept Unit: Cataloging the Real Inconsistency

### The Problem

This phase has already found `get_machine`, `delete_machine`, and `token_required` each returning a genuinely different real error shape, in three separate, earlier lessons. Run together, in one real script, does that inconsistency actually hold up?

Before reading on:

- `get_machine`'s own real `404` and `delete_machine`'s own real `404` both report "this machine doesn't exist." Before running anything, would you expect a caller's own error-handling code, written once, to work correctly against both?
- If a real caller's code checked `response['success'] is False` to detect an error, would that real check work against `get_machine`'s own real response at all?

### Project Change

- **Reference Source:** Real specimens: `backend/app/routes/machines.py:48-61` (`get_machine`), `:274-297` (`delete_machine`), and `backend/app/utils/auth_utils.py:401-436` (`token_required`'s own no-token branch), all read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row; a real `User` row with an `admin` role and token.

### The New Code

Three real failures, three real, distinct shapes, collected together for the first time:

**File:** `verification/phase-03/lab_error_catalog.py` (new)

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
    admin_user = User(id="U-TEST-002", email="test-admin@example.com", name="Test Admin", role="admin")
    db.session.add(machine)
    db.session.add(admin_user)
    db.session.commit()

    admin_token = encode_auth_token("U-TEST-002", "admin")
    client = app.test_client()

    real_errors = {
        "get_machine 404": client.get("/api/machines/NOPE").get_json(),
        "delete_machine 404": client.delete("/api/machines/NOPE", headers={"Authorization": f"Bearer {admin_token}"}).get_json(),
        "token_required 401": client.post("/api/machines", json={}).get_json(),
    }

    real_shapes = set()
    for label, body in real_errors.items():
        keys = tuple(sorted(body.keys()))
        real_shapes.add(keys)
        print(f"{label:28s} -> real keys: {keys}")

    print("distinct real shapes found:", len(real_shapes))
    assert len(real_shapes) >= 3
    print("this project's own real error responses use at least three genuinely different real shapes, for the identical real kind of thing: telling a caller a request failed")
```

### Mechanical Walkthrough

- `client = app.test_client()` — Builds one real `FlaskClient` - this lesson's own first construction of it; this lesson's own last unit builds its own fresh copy the same way.
- `client.get("/api/machines/NOPE").get_json()` — Triggers `get_machine`'s own real, bare `{'error': str}` branch.
- `client.delete("/api/machines/NOPE", headers={"Authorization": f"Bearer {admin_token}"}).get_json()` — Triggers `delete_machine`'s own real branch - the identical real kind of failure as the line above, reported with a genuinely different real shape.
- `client.post("/api/machines", json={}).get_json()` — Triggers `token_required`'s own real `TOKEN_MISSING` branch - a third, real, genuinely different shape again.
- `real_shapes = set(); for label, body in real_errors.items(): keys = tuple(sorted(body.keys())); real_shapes.add(keys)` — Collects each real response's own real, sorted key tuple into a real `set` - three genuinely different tuples collapse into three real, distinct entries, never fewer, if the shapes genuinely differ.
- `assert len(real_shapes) >= 3` — Confirms, for real, the honest finding this unit exists to establish, run fresh in one place rather than recalled from three separate, earlier lessons.

### CS Lens

This is **shape auditing**: collecting real, observed outputs across multiple real code paths and comparing their actual structure, rather than assuming consistency from having read the code once. Also recognized in: a real API contract-testing tool that runs live requests against every documented endpoint and diffs the real response against a real schema; a real linter's own cross-file consistency check (do all real exported functions in a module follow the identical real naming convention); and, in this project's own domain, an incoming-inspection audit checking whether every real part on a shop floor actually matches its own documented real tolerance, rather than trusting the drawing alone.

### SE Lens

The design principle behind auditing real, observed behavior (rather than reasoning about it from memory) is that inconsistency hides easily across files nobody reads side by side - each of these three real routes was written correctly, in isolation, by whoever wrote it; the real inconsistency only becomes visible once their real outputs are collected together. The real alternative not chosen anywhere in this project's own code: a single, shared real helper every route calls to build its own error response, which would make this kind of drift structurally impossible rather than merely undiscovered; the honest cost of the ad hoc approach this project's own code actually uses, proven directly by this unit's own real run: three genuinely different real shapes, for the identical real purpose, each locally reasonable, none of them coordinated with the other two.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_error_catalog.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
get_machine 404              -> real keys: ('error',)
delete_machine 404           -> real keys: ('error', 'success')
token_required 401           -> real keys: ('code', 'error', 'path')
distinct real shapes found: 3
this project's own real error responses use at least three genuinely different real shapes, for the identical real kind of thing: telling a caller a request failed
```

Full saved run: `verification/phase-03/lab_error_catalog_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it re-verifies, in one real place, the real inconsistency this entire phase has been quietly accumulating evidence of.

## Concept Unit: Designing a Real, Minimal Contract

### The Problem

Given three real, genuinely different error shapes, what real, minimal set of fields would every one of them need to share, while still allowing real, case-specific context like `token_required`'s own `'path'`?

Before reading on:

- A caller needs, at minimum, a real way to know a request failed, a real, machine-readable reason why, and a real, human-readable explanation. Which of `get_machine`'s, `delete_machine`'s, and `token_required`'s own real shapes already provides all three?
- If every error kept an identical real baseline, but `token_required`'s own real `'path'` field stayed too, would that still count as "one real contract," or would it need to become "one real contract, minus the one exception"?

### Project Change

- **Reference Source:** No reference counterpart - this is a real, proposed design, not an existing file. Real evidence: this lesson's own previous unit's real catalog.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** None beyond the standard library.

### The New Code

One real, small function, producing a consistent real baseline for three genuinely different real errors:

**File:** `verification/phase-03/lab_error_contract_design.py` (new)

```python
def build_error_response(code: str, message: str, status: int, **extra) -> tuple:
    body = {"success": False, "code": code, "message": message}
    body.update(extra)
    return body, status


status_required = build_error_response("STATUS_REQUIRED", "Status required", 400)
machine_not_found = build_error_response("MACHINE_NOT_FOUND", "Machine not found", 404)
token_missing = build_error_response("TOKEN_MISSING", "Authentication token required", 401, path="/api/machines")

print("real proposed shape (status_required):  ", status_required)
print("real proposed shape (machine_not_found):", machine_not_found)
print("real proposed shape (token_missing):    ", token_missing)

real_baseline = {"success", "code", "message"}
real_shapes = {tuple(sorted(body.keys())) for body, _ in [status_required, machine_not_found]}
assert len(real_shapes) == 1
assert real_baseline.issubset(token_missing[0].keys())
assert status_required[1] == 400
assert machine_not_found[1] == 404
print("three genuinely different real errors, one real, shared baseline every one of them keeps - success, code, and message present every single time, with status kept separate from the body, and real, case-specific context (like token_missing's own 'path') added alongside that baseline, never replacing it")
```

### Mechanical Walkthrough

- `def build_error_response(code: str, message: str, status: int, **extra) -> tuple:` — A real, plain function, deliberately not yet a Flask decorator or error handler - this curriculum hasn't taught `@app.errorhandler` yet, so this stays a real, standalone proposal, provable on its own terms first.
- `body = {"success": False, "code": code, "message": message}` — The real, fixed baseline - every real call to this function starts from the identical real three keys, no matter what else gets added.
- `body.update(extra)` — Merges in any real, case-specific keyword arguments after the baseline is already set - real extra context never overwrites or replaces the shared real keys, since none of `status_required`'s or `machine_not_found`'s calls pass any.
- `return body, status` — Returns the real body and the real HTTP status separately - mirroring `jsonify(...), <code>`'s own real, existing pattern every route in this project already uses, so adopting this function wouldn't require changing how a route returns its result, only what it returns.
- `real_shapes = {tuple(sorted(body.keys())) for body, _ in [status_required, machine_not_found]}; assert len(real_shapes) == 1` — Confirms, for real, that two calls with no extra context produce the identical real shape.

### CS Lens

This is a **shared baseline with extensible context** - the same real design shape this curriculum's own earlier work already named (a base contract, plus optional per-case fields), now applied specifically to errors. Also recognized in: a real logging library's own base log record (timestamp, level, message) plus arbitrary real extra fields a specific call site adds; a real exception class hierarchy, where every exception shares a base `message` attribute while subclasses add their own; and, in this project's own domain, every real quality issue report sharing a base set of fields (part, machine, date) while a specific issue type adds its own real, additional ones.

### SE Lens

The design principle is that a real contract's own strength comes from what it GUARANTEES, not from forbidding anything extra - `build_error_response`'s own real `**extra` keeps `token_required`'s own useful `'path'` context possible, without forcing every OTHER error to carry a real, meaningless empty `'path'` field just to keep the shapes identical. The real alternative not chosen: a strict, closed schema with no real extension point at all, which would force a choice between losing real, useful per-case context or bloating every error with fields most of them don't need; the honest cost of the flexible baseline this lesson actually proposes: a caller can still write code that only checks the guaranteed real fields, but nothing stops a future, real author from adding a new, ad hoc extra field with a name that collides with, or duplicates, one already used elsewhere - the identical real coordination problem this unit's own design is trying to solve, one level down.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_error_contract_design.py` — Runs this as a plain script, from the repository root.

### Verification

```text
real proposed shape (status_required):   ({'success': False, 'code': 'STATUS_REQUIRED', 'message': 'Status required'}, 400)
real proposed shape (machine_not_found): ({'success': False, 'code': 'MACHINE_NOT_FOUND', 'message': 'Machine not found'}, 404)
real proposed shape (token_missing):     ({'success': False, 'code': 'TOKEN_MISSING', 'message': 'Authentication token required', 'path': '/api/machines'}, 401)
three genuinely different real errors, one real, shared baseline every one of them keeps - success, code, and message present every single time, with status kept separate from the body, and real, case-specific context (like token_missing's own 'path') added alongside that baseline, never replacing it
```

Full saved run: `verification/phase-03/lab_error_contract_design_output.txt`.

### Connection to the previous unit

The previous unit cataloged the real problem; this unit proposes a real, minimal, standalone answer to it, provable entirely on its own before it ever touches this project's own real routes.

## Concept Unit: The One Real Error That Isn't Even JSON

### The Problem

Every real error this lesson's own catalog collected was at least valid JSON, however inconsistently shaped. This project's own already-documented `500` crash returns real HTML instead. Does that actually matter to a real caller?

Before reading on:

- A real client library's own `.json()` method (Python's `requests`, or a browser's `fetch`) parses a response body as JSON and raises a real error if it can't. If a real caller wrote one generic real error-handling function assuming every failure is JSON, what would happen the one real time it hit this project's own `500`?
- This curriculum already tested this exact crash using Flask's own in-process test client. Would a genuinely external real client - not running in the same process as the server at all - necessarily see the identical real behavior?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:35-36` (the real `?type=` crash), read again this session; this project's own real `TestingConfig` (`config.py:58-62`).
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real `backend/run.py`, started as a genuinely separate process, launched with `FLASK_ENV=testing` so it uses a real, in-memory database rather than this project's own real development data.

### The New Code

A real, external client, hitting this project's own real, running server - one real failure that's valid JSON, one that isn't:

**File:** `verification/phase-03/lab_error_non_json.py` (new)

```python
import os
import subprocess
import sys
import time

import requests

env = dict(os.environ)
env["FLASK_ENV"] = "testing"

server = subprocess.Popen(
    [sys.executable, "run.py"],
    cwd="backend",
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    env=env,
)

try:
    deadline = time.time() + 20
    while time.time() < deadline:
        try:
            requests.get("http://127.0.0.1:5000/health", timeout=1)
            break
        except requests.exceptions.ConnectionError:
            time.sleep(0.5)

    r_500 = requests.get("http://127.0.0.1:5000/api/machines?type=3-axis")
    print("500 real status:", r_500.status_code, "real Content-Type:", r_500.headers.get("Content-Type"))
    try:
        r_500.json()
        print("500 real .json() succeeded (unexpected)")
    except requests.exceptions.JSONDecodeError as e:
        print("500 real .json() raised:", type(e).__name__)

    r_401 = requests.post("http://127.0.0.1:5000/api/machines", json={})
    print("401 real status:", r_401.status_code, "real Content-Type:", r_401.headers.get("Content-Type"))
    print("401 real .json() succeeded:", r_401.json())

    assert r_500.status_code == 500
    assert "html" in r_500.headers.get("Content-Type", "")
    assert r_401.status_code == 401
    assert r_401.headers.get("Content-Type") == "application/json"
    print("a real external client calling .json() on every real error this project returns would succeed every time except one: the one real case (500) where the server's own code crashed before this project's own JSON error handling ever ran at all")
finally:
    server.terminate()
    server.wait(timeout=10)
```

### Mechanical Walkthrough

- `env = dict(os.environ); env["FLASK_ENV"] = "testing"` — Launches this project's own real server against a real, in-memory database instead of its real development data - `run.py`'s own real `create_app()` call (`backend/run.py:7`) reads `FLASK_ENV` with no argument, so this environment variable is the only real way to control which config it loads from outside the process itself.
- `r_500 = requests.get("http://127.0.0.1:5000/api/machines?type=3-axis")` — A real, genuinely external request - the `requests` library opens its own real socket, exactly the way this curriculum's earlier client/server work did, reaching this project's own real, running server, not an in-process test double.
- `r_500.json() (inside try/except requests.exceptions.JSONDecodeError)` — Calls the real, standard way any Python HTTP client parses a JSON response - raises a genuine, real exception here, because the real body is HTML, not JSON at all.
- `r_401 = requests.post("http://127.0.0.1:5000/api/machines", json={})` — The real control case - `create_machine` has no `'operator'` bypass, so this real, credential-less request genuinely fails, but with a real, valid JSON body `.json()` parses without incident.
- `assert "html" in r_500.headers.get("Content-Type", "")` — Confirms, for real, the structural fact underlying the whole unit - this one real failure was never JSON to begin with, not merely inconsistently shaped JSON like every other error this lesson studies.

### CS Lens

This is an **unhandled exception crossing a format boundary**: a real crash deep inside application code propagating all the way out to the real HTTP response, in whatever real format the framework's own default crash page happens to use - not the format the rest of the API promises. Also recognized in: a real web server returning its own generic real crash page for an unhandled exception, breaking a REST API client that assumed every response would be JSON; a real mobile app crashing outright, rather than showing an error screen, when a background real exception is never caught; and, in this project's own domain, a machine control's own real fault stopping the machine entirely, rather than reporting a specific, structured real alarm code the operator's own screen could interpret.

### SE Lens

The design principle every OTHER error in this project's own code already follows - explicit `try`/`except` blocks returning a real, deliberate JSON error - is exactly what `get_machines`'s own real `?type=` filter skips. The real alternative not implemented anywhere in this project yet: a real, global Flask error handler (`@app.errorhandler(Exception)`, a mechanism this curriculum's next phase actually teaches) that would catch ANY unhandled real exception and convert it into this lesson's own proposed, real, consistent JSON shape, instead of Flask's own generic HTML page; the honest cost of not having one yet, proven directly by this unit's own real, external client run: this is the one real failure in this entire project where a caller's own generic `response.json()` error-handling code would itself crash, on top of the original real failure.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_error_non_json.py` — Runs this as a plain script, from the repository root; starts and stops the real server process itself.

### Verification

```text
500 real status: 500 real Content-Type: text/html; charset=utf-8
500 real .json() raised: JSONDecodeError
401 real status: 401 real Content-Type: application/json
401 real .json() succeeded: {'code': 'TOKEN_MISSING', 'error': 'Authentication token required', 'path': '/api/machines'}
a real external client calling .json() on every real error this project returns would succeed every time except one: the one real case (500) where the server's own code crashed before this project's own JSON error handling ever ran at all
```

Full saved run: `verification/phase-03/lab_error_non_json_output.txt`.

### Connection to the previous unit

The previous unit proposed a real, consistent shape for errors that are already JSON; this unit finds a real error that never even gets that far - a genuinely more severe kind of inconsistency than any shape mismatch.

## Concept Unit: One Real Contract, Applied to Every Real Case

### The Problem

This lesson has cataloged three real, inconsistent shapes and proposed one real, shared baseline. Applied to the identical three real failures, does the proposal actually hold?

Before reading on:

- `get_machine`'s real `404` and `delete_machine`'s real `404` report the identical real fact with two different real shapes. Under this lesson's own proposed contract, would they still differ at all?
- `token_required`'s own real `'path'` context is genuinely useful - would forcing every error into a rigid, identical real shape lose it, or does this lesson's own proposed design already have a real answer for that?

### Project Change

- **Reference Source:** No reference counterpart for the real comparison itself - real evidence: this lesson's own first unit's real catalog, and its own second unit's real `build_error_response` function, both reused here.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row; a real `User` row with an `admin` role and token.

### The New Code

The identical three real failures from this lesson's own first unit, next to what the proposed contract would have returned instead:

**File:** `verification/phase-03/lab_error_contract_applied.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine
from app.models.user import User
from app.utils.auth_utils import encode_auth_token


def build_error_response(code: str, message: str, status: int, **extra) -> tuple:
    body = {"success": False, "code": code, "message": message}
    body.update(extra)
    return body, status


app = create_app("testing")
with app.app_context():
    machine = Machine(id="M-TEST-001", name="Test Mill", category="mill", sub_type="3_axis", status="available")
    admin_user = User(id="U-TEST-002", email="test-admin@example.com", name="Test Admin", role="admin")
    db.session.add(machine)
    db.session.add(admin_user)
    db.session.commit()

    admin_token = encode_auth_token("U-TEST-002", "admin")
    client = app.test_client()

    real_current = {
        "get_machine 404": client.get("/api/machines/NOPE").get_json(),
        "delete_machine 404": client.delete("/api/machines/NOPE", headers={"Authorization": f"Bearer {admin_token}"}).get_json(),
        "token_required 401": client.post("/api/machines", json={}).get_json(),
    }

    real_proposed = {
        "get_machine 404": build_error_response("MACHINE_NOT_FOUND", "Machine not found", 404)[0],
        "delete_machine 404": build_error_response("MACHINE_NOT_FOUND", "Machine not found", 404)[0],
        "token_required 401": build_error_response("TOKEN_MISSING", "Authentication token required", 401, path="/api/machines")[0],
    }

    real_current_shapes = {tuple(sorted(b.keys())) for b in real_current.values()}
    real_baseline = {"success", "code", "message"}

    print("real, current shapes in this project today: ", len(real_current_shapes), "distinct shapes")
    print("real, shared baseline every proposed shape actually keeps:", sorted(real_baseline))

    for label in real_current:
        print(f"{label:28s} current: {sorted(real_current[label].keys())}  ->  proposed: {sorted(real_proposed[label].keys())}")

    assert len(real_current_shapes) == 3
    assert all(real_baseline.issubset(body.keys()) for body in real_proposed.values())
    print("the identical three real failures, reported today through three real, ad hoc shapes - every one of them now keeping the identical real baseline (success, code, message), whatever extra, case-specific real context is added alongside it")
```

### Mechanical Walkthrough

- `real_current = {"get_machine 404": client.get(...).get_json(), ...}` — Re-collects the identical three real failures this lesson's own first unit already cataloged - the real, current, ad hoc shapes.
- `real_proposed = {"get_machine 404": build_error_response(...), ...}` — Builds what each identical real failure would return under this lesson's own proposed contract instead - the real, hypothetical replacement, not yet wired into any real route.
- `real_current_shapes = {tuple(sorted(b.keys())) for b in real_current.values()}` — Confirms the real, current inconsistency still holds, run fresh a second time in this unit.
- `assert all(real_baseline.issubset(body.keys()) for body in real_proposed.values())` — Confirms, for real, that every one of the three proposed shapes keeps the identical real baseline, even though `token_required`'s own proposed shape carries one real, extra field the other two don't.

### CS Lens

This is **contract migration proof**: demonstrating a proposed design actually satisfies the real cases it's meant to replace, before touching any real, existing code. Also recognized in: a real database migration's own dry-run mode, applying proposed schema changes against a real copy of production data first; a type system's own real, structural check that a new implementation still satisfies an existing real interface; and, in this project's own domain, proving a new real G-code post-processor produces the identical real toolpath on a known-good part before trusting it on a new one.

### SE Lens

The design principle is proving a proposed contract against real, already-known cases before adopting it - exactly what this unit does, and exactly what this curriculum's own real rebuild rhythm (test the old, explain it, build a better new version that passes the same test) depends on more generally. The real alternative not chosen here: adopting `build_error_response` directly into this project's own real routes, right now; the honest reason this lesson stops short of that, proven by what it hasn't shown: doing so safely needs Flask's own real error-handling mechanics (`@app.errorhandler`, request context, the application factory pattern) - real tools this curriculum's next phase, on Flask itself, hasn't taught yet. This lesson proves the real DESIGN is sound; wiring it into this project's own real backend is real, deliberately deferred work.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-03/lab_error_contract_applied.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
real, current shapes in this project today:  3 distinct shapes
real, shared baseline every proposed shape actually keeps: ['code', 'message', 'success']
get_machine 404              current: ['error']  ->  proposed: ['code', 'message', 'success']
delete_machine 404           current: ['error', 'success']  ->  proposed: ['code', 'message', 'success']
token_required 401           current: ['code', 'error', 'path']  ->  proposed: ['code', 'message', 'path', 'success']
the identical three real failures, reported today through three real, ad hoc shapes - every one of them now keeping the identical real baseline (success, code, message), whatever extra, case-specific real context is added alongside it
```

Full saved run: `verification/phase-03/lab_error_contract_applied_output.txt`.

### Connection to the previous unit

The previous unit found one real failure so severe it broke the JSON promise entirely; this unit closes the lesson - and this phase - by proving the real, proposed fix for the failures that remain actually works against the real cases that motivated it.

## Connect the pieces

Three real failures - `get_machine`'s missing machine, `delete_machine`'s identical missing machine, and `token_required`'s missing credential - collected together for the first time and found to carry three genuinely different real shapes (the catalog). One real, small, standalone function, proposing a real baseline every one of them could share, while still leaving room for `token_required`'s own useful `'path'` context (the design). A real, external client - not this curriculum's own in-process test double - proving one real failure among all of them isn't even JSON at all, a genuinely more severe real problem than any shape mismatch (the one that isn't JSON). And, closing both this lesson and Phase 3 itself, the identical three real failures, shown once more, now carrying the identical real baseline under the proposed contract - real, direct proof the design holds, deliberately stopped short of touching this project's own real backend until this curriculum has actually taught the real tools that would make doing so safe.

**Next lesson:** Every real route this phase studied was already written in Flask, used but never explained; next, this curriculum turns to Flask itself - WSGI, the application object, routing, and the real mechanics (including `@app.errorhandler`) this lesson's own proposed error contract will finally have a real, correct way to reach.