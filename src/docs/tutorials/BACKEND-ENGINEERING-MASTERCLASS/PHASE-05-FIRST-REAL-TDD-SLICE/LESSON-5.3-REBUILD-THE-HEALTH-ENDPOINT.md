# Lesson 5.3: Rebuild the Health Endpoint

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** This curriculum's first real, permanent change to this project's own actual backend source - not a lab, not a prototype. Lesson 5.2's own proven design, wired in for real: one real, shared `get_health_response()` function in `backend/app/routes/health.py`, called by both `/api/health` (through `health_bp`) and the bare `/health` route (`backend/app/__init__.py`), replacing two real, independent, disagreeing implementations with one. Proven, end to end, through the real, live routes themselves, in both the real healthy state and a real, test-doubled unhealthy one - and closing honestly on the fact that Lesson 5.1's own characterization tests now fail, on purpose, because the real behavior they pinned has genuinely, deliberately changed.

**What you need to know first:** Lesson 5.2's own real, proven design - one shared, flat contract, and a real database-connectivity check distinguishing healthy from unhealthy; Lesson 5.1's own real characterization of the pre-rebuild behavior.

## Terms used in this lesson

- **rebuild (as this curriculum's own real term)** — Replacing a real, existing implementation with a genuinely new one that satisfies a real, deliberately-designed contract - not a cosmetic refactor, and not a change made to make a failing test pass by coincidence. It exists, in this lesson specifically, as this curriculum's own first real instance of the entire masterclass's own central method: characterize the old, design the new, implement it for real, then prove it.

## Objects and methods used

- **`get_health_response (real, now live)`**
  - *What it is:* The real function Lesson 5.2 only prototyped, now living for real in this project's own backend.
  - *Implementation:* `def get_health_response(): try: db.session.execute(text('SELECT 1')); return {'status': 'healthy', 'message': '...', 'version': API_VERSION}, 200 except OperationalError: return {'status': 'unhealthy', 'message': '...', 'version': API_VERSION}, 503` (`backend/app/routes/health.py:24-45`) - the identical real logic Lesson 5.2 proved, now the real, single source of truth both health routes actually call.
  - *Its use:* This lesson calls it, indirectly, through both real, live routes - never directly - specifically to prove the real wiring, not just the function in isolation (already proven in Lesson 5.2).
  - *Type:* A real, module-level function, now part of this project's own backend.
  - *Responsibility:* Being the one, real, actual source of truth both `/health` and `/api/health` now depend on for what "healthy" means.
  - *Depends on:* A real, active Flask application context; `db.session`, this project's own real, shared SQLAlchemy session.
  - *Connects to:* Called by `health_check` in `backend/app/routes/health.py:48-51` (the real `/api/health` route) and, indirectly, by `health_check` in `backend/app/__init__.py:426-437` (the real, bare `/health` route, via a real, local import).
  - *Shape:* Takes no arguments; returns a real `(dict, int)` tuple - always one of exactly two real, possible pairs, matching Lesson 5.2's own proven design exactly.

- **`health_check (both real routes, now unified)`**
  - *What it is:* The two, real, existing view functions Lesson 5.1 characterized as disagreeing - now both real, thin callers of the identical real `get_health_response()`.
  - *Implementation:* `backend/app/routes/health.py:48-51`: `@health_bp.route('/health', methods=['GET']) def health_check(): body, status_code = get_health_response(); return jsonify(body), status_code`; `backend/app/__init__.py:426-437`: `@app.route('/health') def health_check(): from app.routes.health import get_health_response; return get_health_response()` - the second one relies on Flask's own real, automatic `(dict, int)` tuple conversion (already studied in Phase 4), confirmed this session to work correctly even for a real, non-`200` status code.
  - *Its use:* This lesson calls both, together, in every real state this lesson's own units prove, to confirm the real wiring holds end-to-end.
  - *Type:* Two Flask view functions, one registered through `health_bp`, one directly on `app`.
  - *Responsibility:* Translating `get_health_response()`'s own real return value into an actual real HTTP response - nothing more; neither one makes any real decision of its own anymore.
  - *Depends on:* `get_health_response()`'s own real return value.
  - *Connects to:* Both now call the identical real function; this lesson's own closing unit is the real, direct proof that doing so actually closed the gap Lesson 5.1 found.
  - *Shape:* Both return a real HTTP response with `Content-Type: application/json`, and either a real `200` or a real `503`, matching `get_health_response()`'s own real, current decision.

## Concept Unit: One Real, Shared Check Function

### The Problem

Lesson 5.2 proved a real check function in isolation. Wired for real into this project's own backend, does it need to change at all?

Before reading on:

- Lesson 5.2's own real `real_health_status(session)` took a SQLAlchemy session as an explicit argument. This project's own real routes already have `db.session` available via `current_app`-style context access (already studied in this curriculum's own Flask phase). Does the real, live version still need that same real parameter?
- `backend/app/routes/health.py`'s own real, existing code already does `from app import db` at its own top level. Does the real, live check function need that real import passed in, or can it just use the identical real, already-imported name directly?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/health.py:1-11` (the real, pre-rebuild file, already read in Lesson 5.1), and `verification/phase-05/lab_health_check_semantics.py:8-14` (Lesson 5.2's own proven prototype), both read again this session.
- **Files affected:** `backend/app/routes/health.py` (modified)
- **Change type:** replace
- **Location:** `backend/app/routes/health.py` - this project's own real, existing health blueprint file, replacing its own previous, real, hardcoded implementation entirely.
- **Dependencies:** `sqlalchemy.text` and `sqlalchemy.exc.OperationalError`, real, already-installed dependencies this project's own code already uses elsewhere; the real, shared `db` object (`from app import db`), already this project's own established real pattern.

### The New Code

The real, complete, new `backend/app/routes/health.py` - replacing every line of the real, previous version Lesson 5.1 characterized, since the real change here touches the whole real file (new imports, a new real constant, a new real function, and a rewritten real route body), not one isolated fragment inside an otherwise-stable structure:

**File:** `backend/app/routes/health.py` (new)

```python
from flask import Blueprint, jsonify
from sqlalchemy import text
from sqlalchemy.exc import OperationalError

from app import db

health_bp = Blueprint('health', __name__)

API_VERSION = '1.0.0'


def get_health_response():
    try:
        db.session.execute(text('SELECT 1'))
        return {
            'status': 'healthy',
            'message': 'Manufacturing Platform API is running.',
            'version': API_VERSION,
        }, 200
    except OperationalError:
        return {
            'status': 'unhealthy',
            'message': 'Database connectivity check failed.',
            'version': API_VERSION,
        }, 503


@health_bp.route('/health', methods=['GET'])
def health_check():
    body, status_code = get_health_response()
    return jsonify(body), status_code
```

### Mechanical Walkthrough

- `API_VERSION = '1.0.0'` — A real, module-level constant - the identical real version string the pre-rebuild `/api/health` already used, now named once, real and shared, rather than typed twice.
- `db.session.execute(text('SELECT 1'))` — The identical real check Lesson 5.2 already proved - moved here, real and live, using this project's own already-imported real `db` object directly instead of a passed-in parameter.
- `except OperationalError: return {...}, 503` — The real, live failure branch - genuinely untested against a real, actual outage in THIS unit (that would require breaking this project's own real database), but already proven correct in isolation in Lesson 5.2, and proven again, end-to-end, through the real, live routes, in this lesson's own closing unit.
- `body, status_code = get_health_response(); return jsonify(body), status_code` — `/api/health`'s own real route, now reduced to two real lines - call the real, shared function, translate its real result into a real Flask response. All of its own real decision-making logic is gone; `get_health_response` owns it now.

### CS Lens

This is **extracting a shared decision out of duplicated call sites**: two real, independent implementations, each making the identical real kind of decision differently, replaced by one real function both now defer to. Also recognized in: a real compiler's own constant-folding pass, replacing two real, independently computed identical values with one, real, shared one; a real database's own foreign-key constraint, replacing two, real, independently-maintained copies of the same real fact with one, real, authoritative source; and, in this project's own domain, replacing two real, independently-maintained tool-length tables with one, real, shared source both real machines read from.

### SE Lens

The design principle is that once a real decision (Lesson 5.2's own health semantics) is made once, correctly, every real call site should defer to it rather than re-implementing it. The real alternative not chosen: copying the real check logic into BOTH real route functions separately, preserving the real, historical pattern of two real, independent implementations; the honest, real cost avoided by extracting one, real, shared function instead, proven directly by this unit's own real diff: a future, real change to this project's own health semantics now has exactly one, real place to happen, not two real places that could drift apart again exactly the way Lesson 5.1 found them already had.

### Commands needed

- `backend/.venv/Scripts/python.exe -c "import sys; sys.path.insert(0, 'backend'); from app import create_app; app = create_app('testing'); app.app_context().push(); from app.routes.health import get_health_response; print(get_health_response())"` — Runs the real, live function directly, from the repository root, confirming it returns the real, designed shape without going through either real route yet.

### Verification

```text
Seeding default users...
({'status': 'healthy', 'message': 'Manufacturing Platform API is running.', 'version': '1.0.0'}, 200)
```

Full saved run: `verification/phase-05/lesson_5.3_shared_function_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it moves Lesson 5.2's own, already-proven prototype into this project's own real, live backend for the first time.

## Concept Unit: Wiring the Bare /health Route to the Same Real Function

### The Problem

`/api/health` now calls the real, shared function. The bare `/health` route, registered directly in `backend/app/__init__.py`, still returns its own, real, separate, hardcoded dict. Does fixing it require duplicating the real check logic a second time?

Before reading on:

- `backend/app/__init__.py`'s own real `health_check` function currently returns a bare real dict directly (already studied in this curriculum's own Flask phase, as an example of Flask's own automatic response conversion). Could it instead just call `get_health_response()` and return whatever real value comes back?
- `get_health_response()` already returns a real `(dict, int)` tuple. Given what this curriculum's own Flask phase already proved about Flask converting bare tuples automatically, does `backend/app/__init__.py`'s own route need to unpack and re-wrap that real tuple at all?

### Project Change

- **Reference Source:** Real specimen: `backend/app/__init__.py:426-439` (the real, pre-rebuild bare `/health` route, already read in Lesson 5.1), read again this session.
- **Files affected:** `backend/app/__init__.py` (modified)
- **Change type:** replace
- **Location:** `backend/app/__init__.py`, the real, existing `health_check` function under its own real "STEP 11" comment block.
- **Dependencies:** `get_health_response`, the real function the previous unit just moved into `backend/app/routes/health.py`.

### The New Code

The real, complete, updated `health_check` function inside `create_app` - its own real docstring stays exactly as it already was; only the real body, at the bottom, changes:

**File:** `backend/app/__init__.py` (new)

```python
@app.route('/health')
def health_check():
    """
    Health check endpoint for monitoring and load balancers.

    WHY THIS EXISTS:
    ─────────────────
    - Kubernetes/Docker use this to check if container is alive
    - Load balancers use this to know if server can receive traffic
    - Monitoring tools use this to alert when API is down

    Returns minimal response to be FAST.
    """
    from app.routes.health import get_health_response
    return get_health_response()
```

### Mechanical Walkthrough

- `from app.routes.health import get_health_response` — A real, local import, inside the function body - matching this project's own already-established real pattern elsewhere in `create_app` (`register_routes` itself imports every blueprint the identical real, local way), avoiding a real, circular import between `app/__init__.py` and `app/routes/health.py`, which itself imports `db` from `app`.
- `return get_health_response()` — Returns the real `(dict, int)` tuple directly - Flask's own real, automatic conversion (confirmed this session to work correctly for a real, non-200 code too) handles the rest, identically to how this exact function already relied on automatic conversion before the rebuild, for its own, previous, real, bare-dict return.

### CS Lens

This is the identical real **shared-decision** pattern as the previous unit, applied to the second real call site - confirming the fix generalizes across a real, structural difference (one real route lives in a blueprint, the other directly on `app`) rather than only working for the specific real shape the first call site happened to have. Also recognized in: the same real, recurring pattern already named in its own previous appearance in this lesson.

### SE Lens

The design principle is that a real, shared fix has to actually reach every real call site, not just the more conveniently structured one - `/api/health`'s own fix, alone, would have left exactly the real gap Lesson 5.1 found still open at `/health`. The real alternative not chosen: leaving the bare `/health` route with its own, real, separate, hardcoded response, accepting that the two real endpoints would keep disagreeing; the honest, real value of finishing the real wiring here, proven directly by this lesson's own closing unit: both real, live routes now agree, completely, in both the real healthy and real unhealthy case.

### Commands needed

- `backend/.venv/Scripts/python.exe -c "import sys; sys.path.insert(0, 'backend'); from app import create_app; app = create_app('testing'); c = app.test_client(); r = c.get('/health'); print(r.status_code, r.get_json())"` — Runs the real, live, bare `/health` route through a real `FlaskClient`, from the repository root, confirming it now returns the identical real shape `/api/health` does.

### Verification

```text
Seeding default users...
200 {'message': 'Manufacturing Platform API is running.', 'status': 'healthy', 'version': '1.0.0'}
```

Full saved run: `verification/phase-05/lesson_5.3_bare_route_output.txt`.

### Connection to the previous unit

The previous unit fixed `/api/health`; this unit closes the real gap at the bare `/health` route too, using the identical real shared function, not a second, separate real implementation.

## Concept Unit: Real Proof, End to End - Both Real Routes, Both Real States

### The Problem

Both real routes now call the identical real function. Run together, through the real, live app - not the isolated function Lesson 5.2 already proved - do they actually agree, in both the real healthy and real unhealthy case?

Before reading on:

- Lesson 5.1's own real, permanent test file still asserts the OLD, pre-rebuild body shapes. Given this lesson's own real changes, would you expect those specific real assertions to still pass, or to now fail?
- If they now fail, does that mean this lesson's own real rebuild is broken - or does it mean something else, given characterization tests are supposed to pin down real behavior AT THE TIME they were written, not forever?

### Project Change

- **Reference Source:** Real specimens: `backend/app/routes/health.py` and `backend/app/__init__.py:426-439`, both already modified by this lesson's own earlier units.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** This project's own real, already-rebuilt `create_app` output; `unittest.mock.patch`, for the real, unhealthy-path proof.

### The New Code

Both real, live routes, called together, in both real states:

**File:** `verification/phase-05/lab_health_rebuild_proof.py` (new)

```python
import sys
from unittest.mock import patch
sys.path.insert(0, "backend")

from app import create_app, db
from sqlalchemy.exc import OperationalError

app = create_app("testing")
with app.app_context():
    client = app.test_client()

    r1 = client.get("/health")
    r2 = client.get("/api/health")
    print("/health     (healthy) -> status:", r1.status_code, "body:", r1.get_json())
    print("/api/health (healthy) -> status:", r2.status_code, "body:", r2.get_json())

    with patch.object(db.session, "execute", side_effect=OperationalError("SELECT 1", {}, Exception("real connection refused"))):
        r1_down = client.get("/health")
        r2_down = client.get("/api/health")
        print("/health     (real, test-doubled outage) -> status:", r1_down.status_code, "body:", r1_down.get_json())
        print("/api/health (real, test-doubled outage) -> status:", r2_down.status_code, "body:", r2_down.get_json())

    assert r1.get_json() == r2.get_json()
    assert r1.status_code == r2.status_code == 200
    assert r1_down.get_json() == r2_down.get_json()
    assert r1_down.status_code == r2_down.status_code == 503
    print("both real, live routes agree completely, in both real states - the exact real gap Lesson 5.1 found is now closed")
```

### Mechanical Walkthrough

- `client = app.test_client()` — Builds one real `FlaskClient` - this lesson's own first construction of it, since the previous two units checked the real, live behavior through smaller, direct calls instead.
- `r1 = client.get("/health"); r2 = client.get("/api/health")` — Calls both real, live, now-rebuilt routes, through a real `FlaskClient`, with a genuinely working real database.
- `with patch.object(db.session, "execute", side_effect=OperationalError(...)): r1_down = client.get("/health"); r2_down = client.get("/api/health")` — The identical real test double Lesson 5.2 already proved in isolation, now applied around two real, live HTTP requests - proof the real wiring, not just the bare function, correctly reports a real outage.
- `assert r1.get_json() == r2.get_json()` — Confirms, for real, the central real fact this entire slice exists to establish - the two real endpoints now agree.
- `assert r1_down.status_code == r2_down.status_code == 503` — Confirms the identical real agreement holds in the real, unhealthy case too - not just the easy, happy-path case.

### CS Lens

This is **integration proof**: confirming real, separately-verified pieces (the check function, Lesson 5.2; each route's own real wiring, this lesson's earlier units) actually work correctly TOGETHER, through the real, live app - not just independently. Also recognized in: a real unit test suite passing while a real integration test still catches a real wiring mistake between two, individually-correct real components; a real hardware sub-assembly test followed by a real, full-system test after final assembly; and, in this project's own domain, individually calibrated real machine axes, re-verified together once a real program actually runs a real cut using all of them at once.

### SE Lens

The design principle behind this closing, real, end-to-end proof is that neither of this lesson's own earlier units, alone, fully proves the fix - each one only showed ITS OWN real route calling the real, shared function correctly, never both together, and never the real, unhealthy path through the real, live app at all. The real alternative not chosen: treating the two, earlier, real, per-route checks as sufficient; the honest, real value this unit adds, proven directly by its own real run: real, genuine confidence that Lesson 5.1's own central finding - two real endpoints disagreeing - is now, verifiably, actually closed, not just individually patched in two real places that were never actually checked together.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-05/lab_health_rebuild_proof.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
/health     (healthy) -> status: 200 body: {'message': 'Manufacturing Platform API is running.', 'status': 'healthy', 'version': '1.0.0'}
/api/health (healthy) -> status: 200 body: {'message': 'Manufacturing Platform API is running.', 'status': 'healthy', 'version': '1.0.0'}
/health     (real, test-doubled outage) -> status: 503 body: {'message': 'Database connectivity check failed.', 'status': 'unhealthy', 'version': '1.0.0'}
/api/health (real, test-doubled outage) -> status: 503 body: {'message': 'Database connectivity check failed.', 'status': 'unhealthy', 'version': '1.0.0'}
both real, live routes agree completely, in both real states - the exact real gap Lesson 5.1 found is now closed
```

Full saved run: `verification/phase-05/lab_health_rebuild_proof_output.txt`.

### Connection to the previous unit

The previous two units fixed each real route in turn; this unit closes the lesson with the one real check that actually matters - both together, in both real states, proving the fix is complete, not just plausible.

## Connect the pieces

One real, shared function, `get_health_response()`, holding Lesson 5.2's own proven health-check logic, now living for real in `backend/app/routes/health.py` (one real, shared check). The bare `/health` route, wired to call that identical real function instead of its own, separate, hardcoded dict (the second real route, closed). And, closing the lesson, both real, live routes, called together through a real `FlaskClient`, agreeing completely in both the real healthy case and a real, test-doubled outage - the exact real disagreement Lesson 5.1 found, now verifiably gone. One honest, real loose end remains, on purpose: Lesson 5.1's own characterization tests, still asserting the pre-rebuild shapes, now fail - not because anything is broken, but because the real behavior they pinned has genuinely, deliberately changed.

**Next lesson:** This lesson proved the rebuild works through ad hoc, real scripts; next, this curriculum makes that proof permanent - revising Lesson 5.1's own real test file to test the new, current, correct contract, adding real tests for the unhealthy path this project's own test suite has never checked before, and running everything together as this curriculum's own first real, complete TDD proof.