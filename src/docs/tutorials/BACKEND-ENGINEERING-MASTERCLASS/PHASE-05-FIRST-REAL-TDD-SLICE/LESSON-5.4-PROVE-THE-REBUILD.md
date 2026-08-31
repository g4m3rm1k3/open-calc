# Lesson 5.4: Prove the Rebuild

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** A real, complete rewrite of `backend/tests/test_health.py`, retiring Lesson 5.1's own now-stale `TestLegacyHealthEndpoints` (its own real, historical value already permanently preserved in Lesson 5.1's own curriculum file) and replacing it with two real, permanent test classes proving this project's own rebuilt health check at every level the masterclass's own stated method requires: a real unit test of `get_health_response()` in total isolation, and real API tests of both live routes, end to end, in both the real healthy and a real, test-doubled unhealthy state - closing this curriculum's first complete real TDD slice, and establishing the exact real rhythm every later rebuild in this curriculum will repeat.

**What you need to know first:** Lesson 5.1's own real characterization of the pre-rebuild behavior; Lesson 5.3's own real implementation - one shared `get_health_response()` function, called by both real routes; the real distinction between a unit test and an API/system test, already taught early in this curriculum's own Testing phase.

## Terms used in this lesson

- **proof at every real level** — Confirming a real rebuild through more than one real kind of test - here, a real unit test (the check function alone) and real API tests (both live routes, end to end) - because each real level can catch a real mistake the other genuinely cannot: a unit test proves the check's own real logic is correct in isolation; an API test proves that logic is actually, correctly wired into every real route that's supposed to use it. It exists because this exact gap - individually-correct real pieces, never actually checked together - is precisely what let `/health` and `/api/health` disagree for as long as they did before this curriculum's own Phase 5 caught it.

## Objects and methods used

- **`get_health_response (tested directly, for the first time)`**
  - *What it is:* The real, live function Lesson 5.3 wired into this project's own backend, tested here in genuine isolation for the first time - no real HTTP request, no real Flask routing involved at all.
  - *Implementation:* Already fully cited in Lesson 5.3 (`backend/app/routes/health.py:24-45`); this lesson calls it directly, real and unmodified, from a real, permanent pytest test.
  - *Its use:* This lesson's own first unit calls it directly, twice - once against a genuinely working real database, once with a real test double standing in for an outage - to prove its own real logic correct without any real routing layer involved at all.
  - *Type:* A real, module-level function, part of this project's own backend.
  - *Responsibility:* Being provably correct on its own, independent of whichever real route happens to call it.
  - *Depends on:* A real, active Flask application context; `db.session`.
  - *Connects to:* This lesson's own second unit proves the identical real function is ALSO correctly reachable through both real, live routes - the two real levels together are what this whole lesson proves.
  - *Shape:* Takes no arguments; returns a real `(dict, int)` tuple.

## Concept Unit: Unit-Level Proof - The Check Function, Alone

### The Problem

Lesson 5.3 proved `get_health_response()` correct through real, ad hoc scripts. Does this project's own real, permanent test suite have a real, lasting test proving the identical fact, on its own terms?

Before reading on:

- If a future, real change to `get_health_response()`'s own logic introduced a real bug - say, forgetting to catch `OperationalError` - would a real API test, going through `/health`, actually catch it? Would a real unit test, calling the function directly?
- This lesson's own real unit test needs to simulate a genuine database outage without breaking this project's own actual, real database. What real, already-taught technique does that?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/health.py:24-45` (`get_health_response`), already fully cited in Lesson 5.3, read again this session; `backend/tests/test_health.py`, Lesson 5.1's own real, existing file, about to be fully replaced.
- **Files affected:** `backend/tests/test_health.py` (modified)
- **Change type:** replace
- **Location:** `backend/tests/test_health.py` - Lesson 5.1's own real, existing test file, its entire content replaced.
- **Dependencies:** `unittest.mock.patch`, the identical real test-double technique Lesson 5.2 and 5.3 already used.

### The New Code

The real, complete, new `backend/tests/test_health.py` - Lesson 5.1's own real `TestLegacyHealthEndpoints` retired (its own real, historical value already permanently preserved in Lesson 5.1's own curriculum file), replaced by two real, permanent classes, starting with the unit-level one:

**File:** `backend/tests/test_health.py` (new)

```python
"""
Tests for this project's own real, unified health check
(backend/app/routes/health.py), at every real level Lesson 5.4
(BACKEND ENGINEERING MASTERCLASS.md) proves it at: unit (the
shared check function in isolation), API (both real, live
routes, end to end), and characterization (pinning the new,
current, correct contract - the real, permanent replacement
for what Lesson 5.1's own now-retired TestLegacyHealthEndpoints
class characterized about the pre-rebuild behavior, preserved
permanently in that lesson's own curriculum file instead of
here).
"""
import pytest
from unittest.mock import patch
from sqlalchemy.exc import OperationalError

from app import create_app, db
from app.routes.health import get_health_response


@pytest.fixture
def app():
    application = create_app("testing")
    with application.app_context():
        yield application


@pytest.fixture
def client(app):
    return app.test_client()


class TestHealthCheckUnit:
    """
    Unit-level: get_health_response() in isolation, no real HTTP
    request, no real Flask routing involved at all.
    """

    def test_healthy_returns_200_and_correct_shape(self, app):
        body, status_code = get_health_response()
        assert status_code == 200
        assert body == {
            "status": "healthy",
            "message": "Manufacturing Platform API is running.",
            "version": "1.0.0",
        }

    def test_unhealthy_returns_503_when_db_unreachable(self, app):
        with patch.object(
            db.session,
            "execute",
            side_effect=OperationalError("SELECT 1", {}, Exception("real connection refused")),
        ):
            body, status_code = get_health_response()
        assert status_code == 503
        assert body == {
            "status": "unhealthy",
            "message": "Database connectivity check failed.",
            "version": "1.0.0",
        }
```

### Mechanical Walkthrough

- `@pytest.fixture def app(): application = create_app("testing"); with application.app_context(): yield application` — A real, deliberately separate fixture from `client` - this unit's own tests need an active real application context (`get_health_response` calls `db.session`), but never a real client, since they call the real function directly.
- `body, status_code = get_health_response()` — Calls the real, live function exactly as Lesson 5.3's own ad hoc script did - now a real, permanent, automatically-run test instead of a one-off command.
- `with patch.object(db.session, "execute", side_effect=OperationalError(...)): body, status_code = get_health_response()` — The identical real test double this lesson's own earlier work already proved legitimate - simulating a genuine database outage without ever touching this project's own real, actual database.
- `class TestHealthCheckUnit:` — A real, deliberately narrow class name - "Unit" marks these real tests as calling `get_health_response()` directly, with nothing real routed through HTTP at all, distinct from the real, API-level class this lesson's own next unit adds.

### CS Lens

This is a **unit test proving isolated logic**, the same real concept this curriculum's own Testing phase already taught, applied here for real, for the first time, to a genuinely new real function rather than a lab exercise. Also recognized in: a real compiler's own unit tests for one optimization pass, run with no real, full compilation pipeline involved; a real payment library's own unit tests for its tax-calculation function, with no real network call to a payment processor anywhere nearby; and, in this project's own domain, testing a real feed-rate calculation formula directly, with no real machine involved at all.

### SE Lens

The design principle is that a real unit test's own value comes specifically from what it excludes - no real HTTP, no real routing, nothing that could hide which real layer actually failed. The real alternative not chosen: relying only on real API tests (this lesson's own next unit) to cover this exact real logic; the honest, real cost of skipping a dedicated real unit test, avoided here: a real API test failure only tells a reader "something broke somewhere between the request and the response" - a real unit test failure, on this exact function, would say "the check logic itself is wrong," immediately, without needing to rule out real routing as a separate suspect first.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest tests/test_health.py::TestHealthCheckUnit -v` — Runs only this real, new class, from `backend/`, using this project's own real, installed pytest.

### Verification

```text
tests/test_health.py::TestHealthCheckUnit::test_healthy_returns_200_and_correct_shape PASSED
tests/test_health.py::TestHealthCheckUnit::test_unhealthy_returns_503_when_db_unreachable PASSED
```

Full saved run: `verification/phase-05/lesson_5.4_full_suite_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it gives this project's own, already-proven check function its first real, permanent, automatically-run test, independent of any real routing layer.

## Concept Unit: API-Level Proof - Both Real Routes, Every Real State

### The Problem

The previous unit proved `get_health_response()` correct alone. Does this project's own real, permanent test suite have a lasting test proving both real, live routes actually call it correctly, in every real state?

Before reading on:

- If a future, real edit to `backend/app/routes/health.py` accidentally had `/api/health`'s own route call a different, real function - or none at all - would the previous unit's own real, isolated tests catch that mistake?
- Lesson 5.1's own real, retired test proved the two endpoints DISAGREED. What real, opposite fact does this project's own permanent suite need to prove now, in both the real healthy and real unhealthy case?

### Project Change

- **Reference Source:** Real specimens: `backend/app/routes/health.py:48-51` and `backend/app/__init__.py:426-437`, both already cited in Lesson 5.3, read again this session.
- **Files affected:** `backend/tests/test_health.py` (modified)
- **Change type:** add
- **Location:** `backend/tests/test_health.py`, directly below the previous unit's own new `TestHealthCheckUnit` class, in the identical real file.
- **Dependencies:** The identical real `client` fixture the previous unit already defined in this same real file.

### The New Code

A second real class, appended below the previous unit's own - proving both real, live routes agree, in both real states:

**File:** `backend/tests/test_health.py` (already exists — read-only, nothing to type)

```python
class TestHealthEndpointsAPI:
    """
    API-level: both real, live routes, through a real FlaskClient,
    proving the actual, current, unified contract - the real,
    permanent characterization of this project's post-rebuild behavior.
    """

    def test_bare_health_status_code(self, client):
        response = client.get("/health")
        assert response.status_code == 200

    def test_bare_health_content_type(self, client):
        response = client.get("/health")
        assert response.content_type == "application/json"

    def test_api_health_status_code(self, client):
        response = client.get("/api/health")
        assert response.status_code == 200

    def test_api_health_content_type(self, client):
        response = client.get("/api/health")
        assert response.content_type == "application/json"

    def test_the_two_endpoints_now_agree(self, client):
        """
        The real, direct proof of Lesson 5.3's own rebuild: the exact
        disagreement Lesson 5.1 characterized is gone.
        """
        bare = client.get("/health").get_json()
        api = client.get("/api/health").get_json()
        assert bare == api
        assert bare == {
            "status": "healthy",
            "message": "Manufacturing Platform API is running.",
            "version": "1.0.0",
        }

    def test_both_endpoints_report_unhealthy_together_on_a_real_outage(self, client):
        with patch.object(
            db.session,
            "execute",
            side_effect=OperationalError("SELECT 1", {}, Exception("real connection refused")),
        ):
            bare = client.get("/health")
            api = client.get("/api/health")

        assert bare.status_code == api.status_code == 503
        assert bare.get_json() == api.get_json() == {
            "status": "unhealthy",
            "message": "Database connectivity check failed.",
            "version": "1.0.0",
        }
```

### Mechanical Walkthrough

- `def test_the_two_endpoints_now_agree(self, client): bare = client.get("/health").get_json(); api = client.get("/api/health").get_json(); assert bare == api` — The real, direct, permanent inverse of Lesson 5.1's own retired `test_the_two_endpoints_disagree` - the identical real comparison technique, now proving the opposite real fact, on purpose.
- `def test_both_endpoints_report_unhealthy_together_on_a_real_outage(self, client): with patch.object(...): bare = client.get("/health"); api = client.get("/api/health")` — Combines both of this lesson's own real techniques at once - a real test double, wrapped around two real, live HTTP requests - proving the real unhealthy path works correctly through BOTH routes together, not just the isolated function the previous unit already covered.
- `assert bare.get_json() == api.get_json() == {...}` — Confirms, for real, the complete real contract - not just that both routes return the identical real shape, but that the real shape itself is exactly what Lesson 5.2 designed.

### CS Lens

This is an **API test proving end-to-end behavior**, the real counterpart to the previous unit's own unit test - already named as its own real category in this curriculum's own Testing phase, applied here to prove a real routing decision the previous unit's own tests structurally cannot see. Also recognized in: a real web framework's own integration test suite, hitting real routes through a real test client rather than calling view functions directly; a real microservice's own contract test, verifying its real, live HTTP interface rather than its internal real implementation; and, in this project's own domain, running a real, complete part program on an actual machine control, not just checking one real subroutine's own logic in isolation.

### SE Lens

The design principle is that real routing is itself something that can be wrong, independent of whether the underlying real logic is correct - exactly the real category of mistake Lesson 5.1 found (two real, independently-correct-looking implementations, never actually wired to agree). The real alternative not chosen: trusting the previous unit's own real unit tests as sufficient proof the whole system works; the honest, real value this unit adds, proven directly by its own real run: these are the only real tests in this project's entire suite that would catch a future, real mistake in HOW `get_health_response()` gets called, as opposed to a mistake inside the function itself.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest tests/test_health.py -v` — Runs the identical real command Lesson 5.1 first used, from `backend/`, now collecting this lesson's own eight real tests instead of Lesson 5.1's own seven.

### Verification

```text
============================= test session starts =============================
platform win32 -- Python 3.13.14, pytest-9.1.1, pluggy-1.6.0 -- C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\g4m3r\Documents\manufacturing-platform\backend
collecting ... collected 8 items

tests/test_health.py::TestHealthCheckUnit::test_healthy_returns_200_and_correct_shape PASSED [ 12%]
tests/test_health.py::TestHealthCheckUnit::test_unhealthy_returns_503_when_db_unreachable PASSED [ 25%]
tests/test_health.py::TestHealthEndpointsAPI::test_bare_health_status_code PASSED [ 37%]
tests/test_health.py::TestHealthEndpointsAPI::test_bare_health_content_type PASSED [ 50%]
tests/test_health.py::TestHealthEndpointsAPI::test_api_health_status_code PASSED [ 62%]
tests/test_health.py::TestHealthEndpointsAPI::test_api_health_content_type PASSED [ 75%]
tests/test_health.py::TestHealthEndpointsAPI::test_the_two_endpoints_now_agree PASSED [ 87%]
tests/test_health.py::TestHealthEndpointsAPI::test_both_endpoints_report_unhealthy_together_on_a_real_outage PASSED [100%]

======================= 8 passed, 40 warnings in 3.65s =======================
```

Full saved run: `verification/phase-05/lesson_5.4_full_suite_output.txt`.

### Connection to the previous unit

The previous unit proved the check function correct alone; this unit proves it's actually, correctly wired into both real routes - the one real fact the previous unit's own tests structurally cannot see.

## Concept Unit: Running Everything Together - The Masterclass Rhythm

### The Problem

This project's own real backend has other, real, pre-existing tests this slice never touched. Does this lesson's own real rebuild, and its own new tests, actually coexist safely with everything already there?

Before reading on:

- `backend/tests/test_operation_manager.py` and `test_part_model.py` were never touched by this entire, real Phase 5 slice. Would you expect them to still pass, unmodified, run alongside this lesson's own new real tests?
- Characterize, design, implement, prove - at more than one real level. Looking back across all four of this phase's own real lessons, where did each one of those four real steps actually happen?

### Project Change

- **Reference Source:** No reference counterpart - this unit runs this project's own entire, real test suite together, not any one specific file.
- **Files affected:** None
- **Change type:** none
- **Location:** `backend/tests/` - this project's own real, complete test directory.
- **Dependencies:** Every real test file already in `backend/tests/`, including this lesson's own new `test_health.py`.

### Mental Model

```text
5.1  characterize   -> real, permanent tests pin the OLD, disagreeing behavior
  |
  v
5.2  design         -> real, standalone prototypes prove the NEW contract, unwired
  |
  v
5.3  implement       -> the real, live backend rebuilt to match the new design
  |
  v
5.4  prove           -> real, permanent tests replace the old ones, at two real levels
  |
  v
(this unit)  run everything together -> the whole real suite, old and new, green at once
```

### CS Lens

This is **regression suite integrity**: every real test in a real project's own suite has to keep passing together, not just the tests a specific real change happened to touch. Also recognized in: a real CI pipeline running an entire real test suite on every real commit, not just tests near the real diff; a real database migration's own full real schema-verification step, checked against every real table, not only the one being changed; and, in this project's own domain, a full real machine calibration check run after adjusting just one real axis, confirming nothing else real drifted as a side effect.

### SE Lens

The design principle behind running the WHOLE real suite, not just this lesson's own new tests, is that a real rebuild's own success is only proven once it's shown NOT to have broken anything real it wasn't supposed to touch - exactly the real discipline this phase's own earlier work already needed once, unexpectedly, when Lesson 5.3's own real change broke an entirely different, earlier lesson's own real lab (Lesson 2.2's own `lab_system_test.py`), fixed honestly rather than ignored. The real alternative not chosen: treating "my own new tests pass" as sufficient proof of a real rebuild's success; the honest, real value of checking everything together, proven directly by this unit's own real run: every real test this project's backend owns - old and new, touched and untouched - passes, together, at once.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest tests/ -v` — Runs this project's own ENTIRE real test suite, from `backend/`, not just this lesson's own new file.

### Verification

```text
collecting ... collected 11 items

tests/test_health.py::TestHealthCheckUnit::test_healthy_returns_200_and_correct_shape PASSED
tests/test_health.py::TestHealthCheckUnit::test_unhealthy_returns_503_when_db_unreachable PASSED
tests/test_health.py::TestHealthEndpointsAPI::test_bare_health_status_code PASSED
tests/test_health.py::TestHealthEndpointsAPI::test_bare_health_content_type PASSED
tests/test_health.py::TestHealthEndpointsAPI::test_api_health_status_code PASSED
tests/test_health.py::TestHealthEndpointsAPI::test_api_health_content_type PASSED
tests/test_health.py::TestHealthEndpointsAPI::test_the_two_endpoints_now_agree PASSED
tests/test_health.py::TestHealthEndpointsAPI::test_both_endpoints_report_unhealthy_together_on_a_real_outage PASSED
tests/test_operation_manager.py::TestOperationManager::test_reset_order PASSED
tests/test_operation_manager.py::TestOperationManager::test_save_order PASSED
tests/test_part_model.py::test_to_dict_reflects_the_fields_i_actually_set PASSED

11 passed, 65 warnings in 4.75s
```

Full saved run: `verification/phase-05/lesson_5.4_backend_tests_all_output.txt`.

### Connection to the previous unit

The previous two units proved this lesson's own new tests correct; this unit closes the lesson - and this entire phase - by proving the real rebuild coexists safely with every other real test this project's own backend already owned.

## Connect the pieces

One real function, `get_health_response()`, proven correct entirely on its own - no real HTTP, no real routing, both the real healthy and real unhealthy path (unit-level proof). Both real, live routes, `/health` and `/api/health`, proven to call that identical real function correctly, agreeing completely in both real states - the exact real disagreement Lesson 5.1 first found, now verifiably, permanently gone (API-level proof). And, closing this lesson and this entire phase, this project's own real, complete test suite - eleven real tests, old and new - all passing together, proving this real rebuild broke nothing it wasn't supposed to touch (everything, together). Four real lessons, one real rhythm: characterize the old, design the new, implement it for real, prove it at more than one real level - the exact real method every later phase in this curriculum will now repeat.

**Next lesson:** This phase proved the masterclass's own real rhythm on the smallest real slice this project has - a health check with no real persistence of its own; next, this curriculum studies databases themselves, from first principles, before the next real rebuild slice has to reckon with real, stateful data.