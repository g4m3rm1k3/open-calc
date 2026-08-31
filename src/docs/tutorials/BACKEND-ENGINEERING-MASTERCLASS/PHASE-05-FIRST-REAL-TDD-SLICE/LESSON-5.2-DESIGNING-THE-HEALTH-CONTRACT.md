# Lesson 5.2: Designing the Health Contract

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Three real, run prototypes - not yet wired into this project's own real backend, since that's the next lesson's own job - deciding this project's actual, new health contract: real, direct proof that `/health` and `/api/health` are genuinely independent real routing entries sharing no code at all, which is what actually needs fixing; a real, proposed, flat response shape both endpoints will share; and, closing the lesson, a real health check that verifies something actually true - real database connectivity - proven against both a genuinely working real database and a real test double standing in for a genuine outage, the same real technique this curriculum's own Testing phase already taught for exactly this kind of hard-to-trigger real failure.

**What you need to know first:** Lesson 5.1's own real findings - the exact, current, disagreeing behavior of both real health endpoints; what a test double is and when using one is legitimate, not a shortcut; what the real HTTP status codes `200` and `503` mean.

## Terms used in this lesson

- **canonical endpoint (decision)** — The real, deliberate decision about which real URL(s) a resource lives at, and what real relationship multiple URLs answering the identical real question should have to each other - in this lesson's own case, keeping both real, existing URLs alive but making them share one real, unified implementation. It exists because "which URL is correct" and "should this URL even keep existing" are two genuinely different real questions, and conflating them risks breaking a real, legitimate caller for no real reason.
- **response contract (shape)** — The real, specific set of fields, and real value vocabulary, a response is guaranteed to carry - decided once, deliberately, rather than left to whichever real implementation happened to be written first. It exists so every real caller of this project's own health check, present or future, can rely on one real, documented shape, instead of needing to know which of two real, historical implementations they happened to hit.
- **health check semantics** — What "healthy" actually, verifiably means for a specific real endpoint - in this lesson's own design, whether this project's own real database is genuinely reachable right now, not merely whether the process can respond to an HTTP request at all. It exists because a health check that always reports success, regardless of real system state, provides no real, useful information to whatever real tool is asking.

## Objects and methods used

- **`build_health_response (proposed prototype)`**
  - *What it is:* A real, new, standalone Python function this lesson proposes - not yet wired into this project's own real backend, exactly matching the real pattern this curriculum's own Phase 3 closing lesson already established for a proposed-but-not-yet-applied real contract.
  - *Implementation:* `def build_health_response(status: str, message: str, version: str) -> dict: return {"status": status, "message": message, "version": version}` (`verification/phase-05/lab_health_response_shape.py:1-6`) - always the identical real three keys, regardless of which real values are passed.
  - *Its use:* This lesson calls it with both a real, healthy set of values and a real, unhealthy set, to prove the identical real shape holds either way.
  - *Type:* A real, standalone Python function (not yet part of this project's own backend).
  - *Responsibility:* Producing one, real, consistent shape for this project's own health response, whatever real status it's actually reporting.
  - *Depends on:* A real `status`, `message`, and `version` string.
  - *Connects to:* This lesson's own third unit builds a real, separate function deciding WHAT real `status` value to pass in, based on an actual, real check - this function's own job is only the real shape, not the real decision.
  - *Shape:* Takes three real strings in; returns one real, flat `dict` out, always carrying the identical three real keys.

- **`real_health_status (proposed prototype)`**
  - *What it is:* A real, new, standalone function proposing this project's own actual health-check logic - the real decision `build_health_response` itself deliberately doesn't make.
  - *Implementation:* `def real_health_status(session) -> tuple: try: session.execute(text("SELECT 1")); return "healthy", 200 except OperationalError: return "unhealthy", 503` (`verification/phase-05/lab_health_check_semantics.py:8-14`) - runs one real, minimal real SQL query (`SELECT 1`, the standard, real, minimal way to check "is this real connection alive" without depending on any specific real table existing) against a real, given SQLAlchemy session.
  - *Its use:* This lesson calls it against a genuinely working real database, and again with a real test double standing in for a genuine outage, to prove it reports two real, correctly different outcomes.
  - *Type:* A real, standalone Python function (not yet part of this project's own backend).
  - *Responsibility:* Deciding, based on one real, concrete check, whether this project's own backend should honestly report itself healthy or not.
  - *Depends on:* A real, active SQLAlchemy session; the real database it's bound to actually being reachable, or not.
  - *Connects to:* Its own real return value is exactly what the next lesson's own real implementation will pass into `build_health_response`.
  - *Shape:* Takes a real SQLAlchemy session in; returns a real `(status: str, http_code: int)` tuple out - always one of exactly two real, possible pairs.

## Concept Unit: Canonical Endpoint - Keep Both Real URLs, Unify What They Return

### The Problem

Lesson 5.1 proved `/health` and `/api/health` disagree. Does fixing that mean removing one of them?

Before reading on:

- `/health`'s own real code comments (already read in an earlier phase) explicitly name Kubernetes, Docker, and load balancers as real, expected callers of the bare, unprefixed URL. If that URL were removed, what real, external tooling - not this project's own code - might silently break?
- `/api/health` matches every other real business route's own `/api/...` convention (already studied in this curriculum's own Blueprints lesson). Is there a real reason to remove THAT one instead - or does keeping both, while fixing what they actually return, solve the real problem without removing anything a real caller might depend on?

### Project Change

- **Reference Source:** Real specimen: `backend/app/__init__.py:426-439` and `backend/app/routes/health.py:1-11`, both already cited in Lesson 5.1; `backend/app/routes/__init__.py:16`, read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** None.

### The New Code

This project's own real routing table, inspected directly, for both real health entries:

**File:** `verification/phase-05/lab_health_canonical_endpoint.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app

app = create_app("testing")

health_rules = sorted((str(r), r.endpoint) for r in app.url_map.iter_rules() if "health" in r.rule)
for rule, endpoint in health_rules:
    print(f"{rule:15s} -> {endpoint}")

assert health_rules == [("/api/health", "health.health_check"), ("/health", "health_check")]
print("two real, completely independent real routing-table entries, two real, separate endpoint names, zero real code shared between them - proof this project's own real bug isn't 'the wrong URL exists', it's 'two real implementations of the identical real idea never agreed with each other'")
```

### Mechanical Walkthrough

- `health_rules = sorted((str(r), r.endpoint) for r in app.url_map.iter_rules() if "health" in r.rule)` — Reuses the identical real `app.url_map` inspection technique this curriculum's own Flask phase already taught, filtered to just the two real, health-related rules.
- `assert health_rules == [("/api/health", "health.health_check"), ("/health", "health_check")]` — Confirms, for real, the exact real fact this unit's own decision rests on - two real, separate endpoint names, meaning two real, genuinely separate functions, not one function reused at two URLs.

### CS Lens

This is **decoupling identity from implementation**: a resource can be reachable at more than one real URL without those URLs needing to duplicate real logic, once a real, shared implementation exists underneath both. Also recognized in: a real CDN serving the identical real asset from multiple real, mirrored URLs; a real DNS CNAME record, letting one real hostname resolve through to another without duplicating any real content; and, in this project's own domain, two real work-order printouts (shop floor copy, office copy) both describing the identical real job, generated from one real, shared data source rather than two independently-typed real documents.

### SE Lens

The design principle is that removing a real URL is a real, hard-to-reverse decision with real, external consequences (a real caller this project's own code has no visibility into might depend on it), while unifying what TWO real URLs return is fully reversible and breaks nothing real that currently works. The real alternative considered and rejected: deleting `/health` (the bare, non-`/api` URL) for the sake of real consistency with every other route; the honest, real reason this lesson doesn't take that path: this project's own real code comments already document a real, external audience for that exact URL, and "matches this project's naming convention better" isn't a strong enough real reason to risk breaking a real, external monitoring tool this project's own author clearly anticipated.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-05/lab_health_canonical_endpoint.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
/api/health     -> health.health_check
/health         -> health_check
two real, completely independent real routing-table entries, two real, separate endpoint names, zero real code shared between them - proof this project's own real bug isn't 'the wrong URL exists', it's 'two real implementations of the identical real idea never agreed with each other'
```

Full saved run: `verification/phase-05/lab_health_canonical_endpoint_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it settles which real URLs survive before either of the next two units decide what they should actually return.

## Concept Unit: Response Shape - One Real, Flat Contract for Both URLs

### The Problem

With both real URLs staying alive, what real, shared shape should they both return, given neither existing real shape is preserved exactly?

Before reading on:

- Neither existing real implementation wraps its own body in a real `'data'` envelope, the convention this curriculum found elsewhere in this project's own real API. Is a health check genuinely "a resource" in that same real sense, or does it deserve its own, simpler, real shape?
- `/api/health`'s own real body includes a `'version'` field neither the bare `/health` route nor this lesson's own previous unit's findings say anything is wrong with. Should a real, harmless, useful field like that survive into the new, real, unified contract?

### Project Change

- **Reference Source:** No reference counterpart - this is a real, proposed design, not an existing file. Real evidence: both real bodies Lesson 5.1 already characterized.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** None beyond the standard library.

### The New Code

One real, small function, producing the identical real shape for two genuinely different real states:

**File:** `verification/phase-05/lab_health_response_shape.py` (new)

```python
def build_health_response(status: str, message: str, version: str) -> dict:
    return {
        "status": status,
        "message": message,
        "version": version,
    }


healthy = build_health_response("healthy", "Manufacturing Platform API is running.", "1.0.0")
print("real, proposed shape (healthy):", healthy)

unhealthy = build_health_response("unhealthy", "Database connectivity check failed.", "1.0.0")
print("real, proposed shape (unhealthy):", unhealthy)

assert set(healthy.keys()) == set(unhealthy.keys()) == {"status", "message", "version"}
assert healthy["status"] in {"healthy", "unhealthy"}
print("one real, flat, shared shape - no envelope, matching what both existing real implementations already do and what a health check conventionally looks like - with a real, two-value status vocabulary (healthy/unhealthy) instead of either existing implementation's own single, hardcoded word")
```

### Mechanical Walkthrough

- `def build_health_response(status: str, message: str, version: str) -> dict: return {...}` — A real, deliberately tiny function - its entire real job is guaranteeing the identical real shape, never deciding what real values to put in it.
- `healthy = build_health_response("healthy", ..., "1.0.0")` — A real, concrete example of the "everything is fine" real case.
- `unhealthy = build_health_response("unhealthy", ..., "1.0.0")` — A real, concrete example of the "something is actually wrong" real case - proving the identical real function handles both without any real, special-case branching of its own.
- `assert set(healthy.keys()) == set(unhealthy.keys()) == {"status", "message", "version"}` — Confirms, for real, the one real guarantee this unit exists to establish - the real shape never changes, no matter what real story it's telling.

### CS Lens

This is a **fixed schema with a variable payload**: the real structure stays constant; only the real content changes - already studied, in general form, in this curriculum's own JSON APIs lesson, applied here to a real design decision instead of an observed one. Also recognized in: a real log line's own fixed real field set (timestamp, level, message) regardless of what real event actually happened; a real HTTP response's own status-line-plus-headers-plus-body structure, identical whether the real request succeeded or failed; and, in this project's own domain, a real inspection report's own fixed real fields (part, dimension, tolerance, result), whatever the real measurement actually was.

### SE Lens

The design principle is deciding a real shape ONCE, deliberately, rather than letting it emerge implicitly from whichever real implementation got written first - exactly the real gap that let `/health` and `/api/health` drift apart in the first place. The real alternative not chosen: preserving one of the two real, existing shapes exactly (either `/health`'s two-key body or `/api/health`'s three-key one), which would avoid a real, technical debate but would arbitrarily privilege one real, historical accident over the other; the honest, real cost of designing a genuinely new, real shape instead: both existing real callers (if any exist) see the body change, even the one whose real URL didn't move.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-05/lab_health_response_shape.py` — Runs this as a plain script, from the repository root.

### Verification

```text
real, proposed shape (healthy): {'status': 'healthy', 'message': 'Manufacturing Platform API is running.', 'version': '1.0.0'}
real, proposed shape (unhealthy): {'status': 'unhealthy', 'message': 'Database connectivity check failed.', 'version': '1.0.0'}
one real, flat, shared shape - no envelope, matching what both existing real implementations already do and what a health check conventionally looks like - with a real, two-value status vocabulary (healthy/unhealthy) instead of either existing implementation's own single, hardcoded word
```

Full saved run: `verification/phase-05/lab_health_response_shape_output.txt`.

### Connection to the previous unit

The previous unit decided which real URLs survive; this unit decides the real shape they'll both share, before the final unit decides what actually determines their real content.

## Concept Unit: Semantics - Checking Something Actually Real

### The Problem

Neither existing real implementation checks anything about this project's own actual, real state - both report success unconditionally. What would a real, honest health check need to verify instead?

Before reading on:

- If this project's own real database were genuinely unreachable right now, what would either existing real implementation report? Does that real answer actually tell a caller anything useful?
- Deliberately taking down a real, production database just to test this one real code path would be destructive and irresponsible. What real, already-taught technique from this curriculum's own Testing phase exists specifically for exercising a real failure path without causing a real failure?

### Project Change

- **Reference Source:** No reference counterpart - this is a real, proposed design, checked directly with `sqlalchemy`, this project's own real ORM (already studied in an earlier phase reference, revisited here for its own real, minimal connectivity-check idiom).
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real, working `create_app("testing")` app; `unittest.mock.patch`, from the real standard library.

### The New Code

One real check function, proven against a genuinely working real database, then against a real test double standing in for an outage:

**File:** `verification/phase-05/lab_health_check_semantics.py` (new)

```python
import sys
from unittest.mock import patch
sys.path.insert(0, "backend")

from app import create_app, db
from sqlalchemy import text
from sqlalchemy.exc import OperationalError


def real_health_status(session) -> tuple:
    """The proposed real check: is the database actually reachable right now?"""
    try:
        session.execute(text("SELECT 1"))
        return "healthy", 200
    except OperationalError:
        return "unhealthy", 503


app = create_app("testing")
with app.app_context():
    status, code = real_health_status(db.session)
    print("real check, against a genuinely working real database -> status:", status, "code:", code)

    with patch.object(db.session, "execute", side_effect=OperationalError("SELECT 1", {}, Exception("real connection refused"))):
        outage_status, outage_code = real_health_status(db.session)
        print("real check, with a real test double standing in for a genuine DB outage -> status:", outage_status, "code:", outage_code)

    assert status == "healthy"
    assert code == 200
    assert outage_status == "unhealthy"
    assert outage_code == 503
    print("the identical real check function, given the identical real database session, reports two genuinely different real outcomes depending on whether the one real thing it actually checks is true - unlike either existing implementation, which reports the identical real 'healthy'/'online' regardless of whether anything real is actually working")
```

### Mechanical Walkthrough

- `session.execute(text("SELECT 1"))` — The real, minimal, standard way to check "is this real connection actually alive" - `SELECT 1` needs no real table to exist, so this check works identically regardless of this project's own, evolving real schema.
- `status, code = real_health_status(db.session)` — Calls the real check against `db.session`, genuinely bound to this app's own real, working, in-memory test database - succeeds, for real.
- `with patch.object(db.session, "execute", side_effect=OperationalError(...)): outage_status, outage_code = real_health_status(db.session)` — A real, deliberate test double - the identical real technique this curriculum's own Test Doubles lesson taught, substituted in specifically because a genuine real database outage is exactly the class of external-dependency failure that lesson named as a legitimate, real reason to use one.
- `assert outage_status == "unhealthy" / assert outage_code == 503` — Confirms, for real, that the identical real function reports genuinely different real outcomes depending on whether the one real thing it checks is actually true.

### Mental Model

```text
real_health_status(db.session)
      |
      v
session.execute(SELECT 1)
      |
real DB reachable? ----YES----> ("healthy", 200)
      |
      NO
      |
      v
OperationalError caught --> ("unhealthy", 503)
```

### CS Lens

This is a **meaningful liveness check**: verifying a real, specific, external dependency, rather than merely confirming the process itself can still execute code. Also recognized in: a real Kubernetes readiness probe checking a real backing service, not just whether the container process is running; a real circuit breaker's own periodic real health probe against the exact real downstream it protects; and, in this project's own domain, an operator's own real "cycle start" check verifying a real tool is actually loaded, not just that the control panel powers on.

### SE Lens

The design principle is that a health check's real value comes entirely from checking something that can actually fail - a process that can respond to HTTP at all has already proven the trivial part; checking real, external connectivity is what makes the real signal worth anything. The real alternative not chosen: leaving the check unconditional, the way both existing real implementations already do, which is simpler but reports the identical real "fine" regardless of real, actual system state; the honest, real cost of the check this lesson actually proposes: every real call to `/health` or `/api/health` now runs one real, extra database query it didn't before - a real, small, deliberate trade of a little real latency for a real, trustworthy signal.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-05/lab_health_check_semantics.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
real check, against a genuinely working real database -> status: healthy code: 200
real check, with a real test double standing in for a genuine DB outage -> status: unhealthy code: 503
the identical real check function, given the identical real database session, reports two genuinely different real outcomes depending on whether the one real thing it actually checks is true - unlike either existing implementation, which reports the identical real 'healthy'/'online' regardless of whether anything real is actually working
```

Full saved run: `verification/phase-05/lab_health_check_semantics_output.txt`.

### Connection to the previous unit

The previous unit decided the real shape both endpoints will share; this unit closes the lesson by deciding what actually determines which real content fills that shape - and proves the decision against both real outcomes it needs to handle correctly.

## Connect the pieces

Two real URLs, `/health` and `/api/health`, both kept alive, since real, external tooling this project's own code comments already document depends on the bare one, and this project's own `/api` convention depends on the other (canonical endpoint). One real, flat, shared shape - `status`, `message`, `version` - proven to hold identically whether it's reporting good real news or bad (response shape). And, closing the lesson, one real function checking one real, concrete fact - can this project's own database actually be reached right now - proven against a genuinely working real database AND a real test double standing in for the one real failure this project could never safely trigger for real (semantics). Together: a real health contract that, unlike either of this project's own two existing implementations, actually says something true.

**Next lesson:** Every real decision this lesson made stayed a real prototype, deliberately never touching this project's own actual backend source; next, this curriculum implements it for real - rebuilding both `/health` and `/api/health` around the identical, real, unified contract this lesson just designed and proved.