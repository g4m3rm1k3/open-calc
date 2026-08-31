# Lesson 5.1: Investigating /health

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** This curriculum's first real, PERMANENT test file - `backend/tests/test_health.py` - not a throwaway `verification/` lab like every earlier lesson, but real code that joins this project's own actual test suite. Seven real characterization tests, pinning down exactly what this project's own two, real, pre-rebuild health endpoints - `/health` and `/api/health` - actually do today: their real status codes, real `Content-Type`, and real, complete body shapes, closing on one real test proving directly what this whole slice exists to fix - the two endpoints disagree with each other about the identical real question.

**What you need to know first:** What characterization testing is and why it captures current, real behavior before changing anything (already studied, as a lab exercise, in an earlier phase); what pytest fixtures are; what the real WSGI application object and Flask routing this project's own backend uses actually do.

## Terms used in this lesson

- **characterization test (applied for real)** — A real, permanent test asserting exactly what a real, existing implementation currently does - not what it should do - written before that implementation changes, so any real deviation later is a deliberate, visible decision rather than an accidental, silent one. It exists, in this lesson specifically, as the first real application (not a lab exercise) of characterization testing anywhere in this curriculum - the real safety net this entire phase's own rebuild depends on.

## Objects and methods used

- **`health_check (the bare /health route)`**
  - *What it is:* A real, existing Flask view function, registered directly on the `app` object itself - not through a blueprint - already read in an earlier phase, characterized here for the first time with real, permanent tests.
  - *Implementation:* `@app.route('/health') def health_check(): return {'status': 'healthy', 'message': 'Manufacturing Platform API is running'}` (`backend/app/__init__.py:426-439`) - returns a real, bare Python dict, with no explicit status code and no `jsonify(...)` call, relying on Flask's own automatic dict-to-JSON conversion (already studied in Phase 4).
  - *Its use:* This lesson's own real tests call it directly, pinning its exact real status code, `Content-Type`, and body shape.
  - *Type:* A Flask view function, registered directly on `app`, not a blueprint.
  - *Responsibility:* Reporting this backend's own health, at the bare, real, infra-conventional URL (`/health`) real tools like Kubernetes and load balancers are documented, in this project's own real code comments, to expect.
  - *Depends on:* Nothing - a real, unconditional, hardcoded response.
  - *Connects to:* Registered with no `@token_required` decorator at all; this lesson's own real test file is the entire specimen this unit's characterization is built around.
  - *Shape:* Returns a real, bare `dict`; Flask converts it into a real response with an implicit `200`.

- **`health_check (the /api/health route, health_bp)`**
  - *What it is:* A real, existing Flask view function, registered through its own real blueprint, sharing its real Python function name with the bare `/health` route above (a genuine, harmless naming coincidence, since the two live in separate real modules).
  - *Implementation:* `health_bp = Blueprint('health', __name__)` `@health_bp.route('/health', methods=['GET']) def health_check(): return jsonify({'status': 'online', 'message': 'Manufacturing Data Platform Backend is ready.', 'version': '1.0.0'})` (`backend/app/routes/health.py:1-11`) - registered with a real `url_prefix='/api'` (`backend/app/routes/__init__.py:16`), producing the real, final URL `/api/health`.
  - *Its use:* This lesson's own real tests call it directly too, pinning its own, genuinely different real status code, `Content-Type`, and body shape.
  - *Type:* A Flask view function, registered through `health_bp`.
  - *Responsibility:* Reporting this backend's own health at the real, `/api`-prefixed URL every other real business route in this project also uses.
  - *Depends on:* Nothing - a real, unconditional, hardcoded response.
  - *Connects to:* Also registered with no `@token_required` decorator; its own real, different body shape from the bare `/health` route is the central real finding this entire lesson exists to document.
  - *Shape:* Returns a real, explicit `jsonify(...)` call; an implicit `200`.

## Concept Unit: Characterizing /health - The Bare, Infra-Conventional Endpoint

### The Problem

Before anything about this project's own two health endpoints changes, what real, exact, current behavior does the bare `/health` route actually have?

Before reading on:

- `health_check`'s own real code (`backend/app/__init__.py:426-439`) returns a bare dict with two real keys, `'status'` and `'message'`. Before running anything, what real, exact value would you predict for `'status'`, given its own real key name?
- This route is registered directly on `app`, never through a blueprint, with no `@token_required` decorator anywhere. What does that suggest about who this specific real endpoint is actually meant to be reachable by?

### Project Change

- **Reference Source:** Real specimen: `backend/app/__init__.py:426-439` (`health_check`), read again this session.
- **Files affected:** `backend/tests/test_health.py` (new)
- **Change type:** add
- **Location:** `backend/tests/` - this project's own real, existing test directory, already holding `test_operation_manager.py` and `test_part_model.py`.
- **Dependencies:** A real, running app built via `create_app("testing")`; `pytest`, already a real, installed dependency this project's own existing tests already use (in a real, older `unittest.TestCase` style this lesson deliberately does not copy - see this unit's own SE Lens).

### The New Code

Three real, permanent tests, pinning the bare `/health` route's exact current behavior:

**File:** `backend/tests/test_health.py` (new)

```python
import pytest

from app import create_app


@pytest.fixture
def client():
    app = create_app("testing")
    with app.app_context():
        yield app.test_client()


class TestLegacyHealthEndpoints:
    def test_bare_health_status_code(self, client):
        response = client.get("/health")
        assert response.status_code == 200

    def test_bare_health_content_type(self, client):
        response = client.get("/health")
        assert response.content_type == "application/json"

    def test_bare_health_body_shape(self, client):
        response = client.get("/health")
        assert response.get_json() == {
            "status": "healthy",
            "message": "Manufacturing Platform API is running",
        }
```

### Mechanical Walkthrough

- `@pytest.fixture def client(): app = create_app("testing"); with app.app_context(): yield app.test_client()` — A real, plain pytest fixture - not the `unittest.TestCase` `setUp`/`tearDown` style this project's own existing tests use - building a genuinely fresh real app and client for every real test function that requests it, matching this curriculum's own earlier, real testing lessons.
- `class TestLegacyHealthEndpoints:` — A real, deliberately-named class - "Legacy" marks these real tests as characterizing the pre-rebuild implementation specifically, not this project's own permanent, ongoing contract, which Lesson 5.4 is expected to test separately once the rebuild lands.
- `def test_bare_health_status_code(self, client): response = client.get("/health"); assert response.status_code == 200` — Pins the real, current status code - a real, concrete assertion a future reader (or a future accidental change) could break, and would immediately know it broke.
- `def test_bare_health_body_shape(self, client): assert response.get_json() == {"status": "healthy", "message": "..."}` — Pins the real, exact, complete body - every real key and every real value, not just "some real dict came back."

### CS Lens

This is **characterization testing, applied for real** - the identical real technique an earlier phase's own lab exercise taught, now protecting an actual, real, permanent piece of this project's own codebase for the first time. Also recognized in: a real "golden file" test suite, pinning a real, complex program's exact current output before a real refactor; a real API contract-testing tool, capturing a real, live service's actual responses as a real baseline; and, in this project's own domain, measuring a real, existing part's actual dimensions before attempting to improve the real process that makes it.

### SE Lens

The design principle behind writing these real tests as plain pytest, rather than matching this project's own existing `unittest.TestCase` style (already seen in `backend/tests/test_operation_manager.py`), is that this curriculum's own earlier testing phase already taught real pytest fixtures as the more capable, more idiomatic real approach - this lesson doesn't silently copy the older real style just because it's already present; it explains the real deviation directly, as the project's own stated rules require. The real alternative not chosen: matching the existing style for real, local consistency; the honest, real cost of diverging instead: this project's own real test suite now has two genuinely different real testing styles coexisting, until (or unless) a later phase unifies them.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest tests/test_health.py -v` — Runs this real, permanent test file from `backend/`, using this project's own real, installed pytest - the identical real command this project's own existing tests are run with.

### Verification

```text
============================= test session starts =============================
platform win32 -- Python 3.13.14, pytest-9.1.1, pluggy-1.6.0 -- C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\g4m3r\Documents\manufacturing-platform\backend
collecting ... collected 3 items

tests/test_health.py::TestLegacyHealthEndpoints::test_bare_health_status_code PASSED
tests/test_health.py::TestLegacyHealthEndpoints::test_bare_health_content_type PASSED
tests/test_health.py::TestLegacyHealthEndpoints::test_bare_health_body_shape PASSED

======================= 3 passed in 2.10s =======================
```

Full saved run: `verification/phase-05/lesson_5.1_characterization_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it opens this curriculum's first real (not lab) application of characterization testing.

## Concept Unit: Characterizing /api/health - The API-Conventional Twin

### The Problem

`/api/health` answers the identical real question as `/health` - "is this backend healthy?" What real, exact, current behavior does it actually have?

Before reading on:

- `health_bp`'s own real registration (`backend/app/routes/__init__.py:16`, `app.register_blueprint(health_bp, url_prefix='/api')`) gives this route the real `/api` prefix every other business route in this project also uses. Would you expect its own real response shape to match `/health`'s, or to follow whatever convention `/api/...` routes elsewhere in this project already established?
- `health.py`'s own real code (`backend/app/routes/health.py:5-11`) includes a real `'version'` field neither the bare `/health` route nor this curriculum's own earlier lessons have seen on any other health specimen. Before reading below, would you predict its real, exact value?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/health.py:1-11` (`health_check`) and `backend/app/routes/__init__.py:16`, both read again this session.
- **Files affected:** `backend/tests/test_health.py` (modified)
- **Change type:** add
- **Location:** `backend/tests/test_health.py`, inside the same real `TestLegacyHealthEndpoints` class the previous unit started.
- **Dependencies:** The identical real `client` fixture the previous unit already defined in this same real file.

### The New Code

Three more real, permanent tests, appended inside the identical real `TestLegacyHealthEndpoints` class the previous unit started (directly below its own three real tests, in the identical real file), pinning `/api/health`'s own exact current behavior:

**File:** `backend/tests/test_health.py` (already exists — read-only, nothing to type)

```python
def test_api_health_status_code(self, client):
    response = client.get("/api/health")
    assert response.status_code == 200

def test_api_health_content_type(self, client):
    response = client.get("/api/health")
    assert response.content_type == "application/json"

def test_api_health_body_shape(self, client):
    response = client.get("/api/health")
    assert response.get_json() == {
        "status": "online",
        "message": "Manufacturing Data Platform Backend is ready.",
        "version": "1.0.0",
    }
```

### Mechanical Walkthrough

- `def test_api_health_body_shape(self, client): assert response.get_json() == {"status": "online", "message": "...", "version": "1.0.0"}` — Pins the real, exact, three-key body - a genuinely different real shape from the bare `/health` route's own two-key body the previous unit already pinned, even though both routes answer the identical real question.

### CS Lens

This is the identical real **characterization testing** technique as the previous unit, applied to a second, real specimen - confirming the technique generalizes, not just working once by coincidence. Also recognized in: the same real, recurring patterns already named in this unit's own previous appearance in this lesson.

### SE Lens

The design principle is that characterizing BOTH real endpoints, not just one, is what actually makes the coming design decision (Lesson 5.2) honest - a rebuild that only accounted for `/health` could easily break `/api/health` silently, with no real test catching it. The real alternative not chosen: characterizing only the endpoint assumed to matter more, and treating the other as an afterthought; the honest, real cost of doing both, thoroughly, here: twice the real test-writing effort now, in exchange for a real, complete baseline neither endpoint can quietly regress against later.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest tests/test_health.py -v` — Runs the same real command as the previous unit; now collects six real tests instead of three.

### Verification

```text
tests/test_health.py::TestLegacyHealthEndpoints::test_api_health_status_code PASSED
tests/test_health.py::TestLegacyHealthEndpoints::test_api_health_content_type PASSED
tests/test_health.py::TestLegacyHealthEndpoints::test_api_health_body_shape PASSED
```

Full saved run: `verification/phase-05/lesson_5.1_characterization_output.txt`.

### Connection to the previous unit

The previous unit characterized the bare `/health` route; this unit characterizes its real, `/api`-prefixed twin, setting up the direct real comparison the lesson's own closing unit draws.

## Concept Unit: The Two Endpoints Disagree - The Real Finding This Slice Exists to Fix

### The Problem

Both `/health` and `/api/health` claim to answer "is this backend healthy?" Run side by side, does either real answer actually agree with the other?

Before reading on:

- `/health`'s own real body has two keys; `/api/health`'s own real body has three, and neither one uses the identical real word for `'status'` (`'healthy'` versus `'online'`). If a real caller checked `response['status'] == 'healthy'` against `/api/health`, what would that real check actually return?
- Neither real endpoint's own code checks anything about this project's own actual, real system state - no real database query, no real check of any kind. What does that suggest about what "healthy" and "online" even mean, in either real implementation, today?

### Project Change

- **Reference Source:** Real specimens: `backend/app/__init__.py:426-439` and `backend/app/routes/health.py:1-11`, both already cited in this lesson's own earlier units.
- **Files affected:** `backend/tests/test_health.py` (modified)
- **Change type:** add
- **Location:** `backend/tests/test_health.py`, the same real `TestLegacyHealthEndpoints` class, as its own final real test.
- **Dependencies:** The identical real `client` fixture and both real endpoints this lesson's own earlier units already characterized.

### The New Code

One real, final test, comparing both real responses directly:

**File:** `backend/tests/test_health.py` (already exists — read-only, nothing to type)

```python
def test_the_two_endpoints_disagree(self, client):
    """
    The real, central finding this whole slice exists to fix: two
    endpoints, both claiming to report this backend's health,
    returning two genuinely different real shapes for the identical
    real question.
    """
    bare = client.get("/health").get_json()
    api = client.get("/api/health").get_json()
    assert bare.keys() != api.keys()
    assert bare["status"] != api["status"]
```

### Mechanical Walkthrough

- `bare = client.get("/health").get_json(); api = client.get("/api/health").get_json()` — Calls both real, already-characterized endpoints together, in the identical real test, specifically to compare their real outputs directly rather than trusting two, separate real assertions written in two different real tests.
- `assert bare.keys() != api.keys()` — Confirms, for real, the real, structural disagreement - different real key sets for the identical real concept.
- `assert bare["status"] != api["status"]` — Confirms the deeper, real, semantic disagreement - even the one real key both bodies happen to share, `'status'`, carries two genuinely different real vocabulary words (`'healthy'` vs `'online'`) for what should be the identical real fact.

### CS Lens

This is **characterization testing used to prove an inconsistency directly**, not just to pin one real implementation's own behavior in isolation - the same real technique this lesson's earlier units used, now pointed at the RELATIONSHIP between two real specimens instead of either one alone. Also recognized in: a real contract test comparing two real microservices' actual responses for the identical real logical request; a real database migration's own before/after comparison, checked directly against each other, not just independently validated; and, in this project's own domain, two real gauges measuring the identical real dimension on the identical real part, compared directly to catch real calibration drift neither gauge's own isolated reading would reveal.

### SE Lens

The design principle is that characterizing two related real specimens SEPARATELY (the previous two units) doesn't automatically reveal how they relate - this unit's own direct, real comparison is what actually proves the inconsistency, in one real, unambiguous assertion, rather than leaving a reader to notice it by eye. The real alternative not chosen: treating the previous two units' own six real tests as sufficient evidence on their own; the honest, real value this unit adds, proven directly by its own real run: a single, real, focused test now exists whose entire real job is proving the exact problem Lesson 5.2 is about to solve - if a future, real reader ever wonders "why does this project have two health endpoints with a design lesson about them," this one real test answers it immediately.

### Commands needed

- `backend/.venv/Scripts/python.exe -m pytest tests/test_health.py -v` — Runs the same real command once more; now collects all seven real tests this lesson has built.

### Verification

```text
============================= test session starts =============================
platform win32 -- Python 3.13.14, pytest-9.1.1, pluggy-1.6.0 -- C:\Users\g4m3r\Documents\manufacturing-platform\backend\.venv\Scripts\python.exe
cachedir: .pytest_cache
rootdir: C:\Users\g4m3r\Documents\manufacturing-platform\backend
collecting ... collected 7 items

tests/test_health.py::TestLegacyHealthEndpoints::test_bare_health_status_code PASSED [ 14%]
tests/test_health.py::TestLegacyHealthEndpoints::test_bare_health_content_type PASSED [ 28%]
tests/test_health.py::TestLegacyHealthEndpoints::test_bare_health_body_shape PASSED [ 42%]
tests/test_health.py::TestLegacyHealthEndpoints::test_api_health_status_code PASSED [ 57%]
tests/test_health.py::TestLegacyHealthEndpoints::test_api_health_content_type PASSED [ 71%]
tests/test_health.py::TestLegacyHealthEndpoints::test_api_health_body_shape PASSED [ 85%]
tests/test_health.py::TestLegacyHealthEndpoints::test_the_two_endpoints_disagree PASSED [100%]

======================= 7 passed, 35 warnings in 3.44s =======================
```

Full saved run: `verification/phase-05/lesson_5.1_characterization_output.txt`.

### Connection to the previous unit

The previous two units each characterized one real endpoint in isolation; this unit closes the lesson by putting them side by side, in one real test, proving directly the exact real problem the next lesson exists to solve.

## Connect the pieces

Two real health endpoints, both already living in this project's own real backend, characterized for the first time with real, permanent tests rather than a throwaway lab: `/health`'s own real, two-key body (`status: healthy`), and `/api/health`'s own real, three-key body (`status: online`, plus a real `version`). Six real tests pinning each one's own exact current behavior independently, and a seventh, real, closing test proving directly what both of them, together, actually mean: two real answers to the identical real question, genuinely disagreeing with each other, with neither one checking any real, actual system state at all.

**Next lesson:** This lesson found the real problem and pinned it down with real, permanent tests; next, this curriculum designs the actual fix - one real, canonical health contract, deciding what shape, what status code, and what real semantics this project's health check should actually have, before a single line of the real implementation changes.