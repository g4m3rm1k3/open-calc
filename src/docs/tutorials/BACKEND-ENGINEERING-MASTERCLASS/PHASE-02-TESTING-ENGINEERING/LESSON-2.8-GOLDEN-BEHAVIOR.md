# Lesson 2.8: Golden Behavior

*File paths under backend/... refer to the real manufacturing-platform repository. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Five real, run checks fully characterizing this project's own real `GET /api/machines` and `POST /api/machines` routes - response shape, real ordering, real defaults, and two real edge cases with completely different outcomes, one of them a genuine, previously undiscovered crash in this project's own real code - plus real status codes and database side effects on both the success and failure paths of a real write.

**What you need to know first:** What a characterization test is and why it records observed behavior, not intended behavior; what a request's method, URL, headers, body, response, and status each are; what a database effect is and why a response body alone can't prove one happened.

## Terms used in this lesson

- **golden behavior (golden master)** — The complete, real, characterized record of everything a piece of software actually does for a given input - not one field, one status code, or one path through it, but the full, real picture, precise enough that any future run can be compared against it directly. It exists as the fully-characterized end state a characterization test only starts toward - a name for "done recording what this does," not partial notes.
- **response shape** — The complete, real structure of a response body - every top-level key, every nested field, not just the ones a particular check happens to look at. It exists because a caller depending on a field a test never checked can be broken by a real change nobody noticed, precisely because nothing ever characterized that field existed at all.
- **side effect** — A real, observable change a request causes somewhere other than its own direct response - a row written to a database, a file created, an event emitted. It exists as a distinct thing to characterize because a response can claim success while a real side effect silently failed, or vice versa - the two are genuinely separate real facts.
- **ordering** — Whether a collection of real results comes back in a specific, guaranteed sequence, or in whatever order happens to fall out of how the underlying system stores or retrieves them. It exists because "the same items, different order" can silently break a caller relying on position, even though every individual item is still, technically, correct.
- **default** — The real value or behavior a system falls back to when a caller specifies nothing. It exists because "optional" only fully means something once the real, specific fallback behavior is actually known - "optional, defaults to nothing" and "optional, defaults to everything" are two completely different real systems.
- **edge case** — A real, valid-looking input that sits at or past the boundary of what a system's own logic was actually built to expect - not necessarily wrong on its face, but exactly where real behavior most often reveals a gap nobody planned for. It exists as its own category because the "normal" cases of a system are usually the ones already well understood; the edge cases are where a characterization actually earns its keep.
- **unhandled exception** — A real, genuine error that propagates past a system's own intended error handling entirely - not a deliberate `400` or `404` a route's own code chose to return, but a real crash. In production, Flask normally turns this into a real `500` response; under this app's own `"testing"` config, Flask's real `PROPAGATE_EXCEPTIONS` behavior (on by default whenever `TESTING` is `True`) instead lets the real Python exception itself surface directly, specifically so a test can see the real traceback rather than only a generic status code.

## Objects and methods used

- **`get_machines`**
  - *What it is:* A real, existing Flask view function listing this project's real machines, with optional real filtering.
  - *Implementation:* `def get_machines(current_user): ...` (`backend/app/routes/machines.py:14-45`) - reads three optional real query parameters (`status`, `type`, `groupId`) off `request.args`, applies a real `.filter(...)` to `Machine.query` for each one that's present, orders the real result with `.order_by(Machine.name)`, and returns `{'data': [...], 'total': len(machines)}`.
  - *Its use:* This lesson calls it, unmodified, in three of its five units - to characterize its real response shape, its real ordering, its real defaults, and two real edge cases in how it filters.
  - *Type:* A Flask view function, decorated with `@token_required`.
  - *Responsibility:* Returning every real machine matching whichever real filters were actually given, in a consistent, real order.
  - *Depends on:* Zero or more real query parameters; a real, connected database.
  - *Connects to:* Builds its query from `Machine.query`, applying real `.filter` calls conditionally before a real `.order_by`.
  - *Shape:* Returns a real dict with exactly two keys, `data` (a list of real machine dicts) and `total` (an int) - confirmed this session, never a bare list, never additional top-level keys.

- **`create_machine`**
  - *What it is:* A real, existing Flask view function creating a new machine in this project's own database.
  - *Implementation:* `def create_machine(current_user): ...` (`backend/app/routes/machines.py:118-169`) - reads a real JSON body, returns `400` if any of six real required fields (`id`, `name`, `category`, `subType`, `manufacturer`, `model`) is missing, checked in that real order, returns `400` if the given `id` already exists, otherwise constructs and commits a real `Machine` row and returns it with a real `201`.
  - *Its use:* This lesson calls it, unmodified, to characterize both its real success path (a real `201` and a real, persisted row) and two real distinct failure paths.
  - *Type:* A Flask view function, decorated with `@token_required` - unlike `get_machines`, its own `allowed_roles` does not include `'operator'`, so no real bypass applies here.
  - *Responsibility:* Validating a new machine's real, required fields, rejecting a duplicate real ID, and persisting exactly one new real row when both checks pass.
  - *Depends on:* A real, valid JSON body; a real, currently-unused machine ID; a real, authenticated caller with an allowed role.
  - *Connects to:* Constructs a real `Machine` object from the request body, then calls `db.session.add` and `db.session.commit` - the same real methods an earlier lesson's own integration test first used.
  - *Shape:* Returns a real `(dict, int)` tuple on any failure path, or a real `Flask` response with an explicit `201` on success - never a bare `200` for a successful creation.

- **`Query.filter (Machine.query.filter)`**
  - *What it is:* A real SQLAlchemy method, narrowing a query to rows matching a real condition.
  - *Implementation:* `query.filter(Model.column == value)` - returns a new, real `Query` object representing the original query narrowed by the given real condition; `Model.column` must be a real, declared column (or other mapped attribute) on that model, or Python itself raises a real `AttributeError` before any SQL is ever built.
  - *Its use:* This lesson's own edge-case unit relies on exactly that real requirement - `get_machines`'s own code calls `.filter(Machine.type == machine_type)`, and `Machine` has no real `type` column, confirmed this session to raise a genuine, unhandled `AttributeError`.
  - *Type:* A real instance method on SQLAlchemy's `Query` class.
  - *Responsibility:* Narrowing a query's real result set to only rows matching a given, real condition - and, just as importantly, failing loudly and immediately if that condition references something that isn't real.
  - *Depends on:* A real, existing `Query` object to narrow; a real, valid column reference on the model it queries.
  - *Connects to:* Called up to three times inside `get_machines`, once per real, present query parameter; this lesson's own edge-case unit exercises the one call (`Machine.type`) that references a column that was never actually declared.
  - *Shape:* Takes a real boolean-like SQLAlchemy expression in, returns a new, real `Query` object out - or raises, before returning anything at all, if the expression itself couldn't even be built.

## Concept Unit: Response Shape and Ordering - What Comes Back, and In What Order

### The Problem

This project's real `GET /api/machines` route returns real machines in some real shape and some real order. Is either one an accident of however the database happens to store rows, or a real, deliberate guarantee this project's own code actually makes?

Before reading on:

- If three real machines are inserted in the order Zeta, Alpha, Mid, what real order would you predict the API returns them in - and what, specifically, in `get_machines`'s own real code would you point to as evidence either way?
- `get_machines`'s own real response has exactly two top-level keys. If a caller depended on a third key existing, whose real mistake would that be - the route's, or the caller's, for assuming something this response never actually promised?

### Project Change

- **Reference Source:** No reference counterpart for this unit's own throwaway code. Real specimen: `backend/app/routes/machines.py:14-45` (`get_machines`), read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** Real `Machine` rows, inserted deliberately out of alphabetical order.

### The New Code

Three real machines, inserted Zeta, Alpha, Mid - deliberately not in the order the real response should return them:

**File:** `verification/phase-02/lab_pytest_demo/lab_golden_shape_ordering.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine

app = create_app("testing")
with app.app_context():
    db.session.add(Machine(id="M-3", name="Zeta Mill", category="mill", sub_type="3_axis", status="available"))
    db.session.add(Machine(id="M-1", name="Alpha Mill", category="mill", sub_type="3_axis", status="available"))
    db.session.add(Machine(id="M-2", name="Mid Mill", category="mill", sub_type="3_axis", status="available"))
    db.session.commit()

    client = app.test_client()
    response = client.get("/api/machines")
    body = response.get_json()

    print("status:", response.status_code)
    print("top-level keys:", sorted(body.keys()))
    print("total:", body["total"])
    print("names, in real response order:", [m["name"] for m in body["data"]])
    print("one real machine's own real field keys:", sorted(body["data"][0].keys()))

    assert response.status_code == 200
    assert sorted(body.keys()) == ["data", "total"]
    assert body["total"] == 3
    assert [m["name"] for m in body["data"]] == ["Alpha Mill", "Mid Mill", "Zeta Mill"]
    print("response shape confirmed, and real ordering is alphabetical by name - not insertion order")
```

### Mechanical Walkthrough

- `db.session.add(Machine(id="M-3", name="Zeta Mill", ...)) (inserted first)` — Deliberately inserts the alphabetically-*last* machine *first* - if the real API response simply reflected insertion order, `"Zeta Mill"` would appear first in it.
- `sorted(body.keys())` — Sorts the response's own real top-level keys before comparing them - a defensive habit ensuring this check doesn't depend on Python dict key order, which is itself not something this unit is trying to characterize.
- `[m["name"] for m in body["data"]]` — A list comprehension (already familiar from earlier in this curriculum) extracting just the real `name` field, in response order, from every real machine dict in `body["data"]` - the exact real sequence this unit exists to check.
- `assert [m["name"] for m in body["data"]] == ["Alpha Mill", "Mid Mill", "Zeta Mill"]` — Confirms the real response order is alphabetical - `"Alpha Mill"` first, `"Zeta Mill"` last - directly contradicting the insertion order, and matching `get_machines`'s own real `.order_by(Machine.name)` call exactly.

### CS Lens

This is characterizing a **contract**, not just a value - what a caller can actually rely on, versus what merely happens to be true today. Also recognized in: an API's own published response schema, distinct from any one example response; a database index's own guaranteed sort order versus an unindexed table's genuinely undefined one; a function's documented return-type contract versus one specific observed return value; and, in this project's own domain, a part traveler's defined field layout, which every station on the floor can rely on staying the same, regardless of which specific part is on it.

### SE Lens

The design principle is that a contract worth relying on has to be characterized explicitly, not inferred from one lucky observation. The real alternative not chosen - leaving ordering unspecified and letting callers discover it empirically - would still "work" today, since `.order_by(Machine.name)` is real, deliberate code; the honest risk is that nothing currently *proves* that guarantee is real, so a future edit removing that one real line, for what looks like an unrelated reason, would silently change caller-visible behavior with no test anywhere to catch it. The cost paid here: real, deliberate setup (three machines, inserted out of order) to make sure this check couldn't pass by accident.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_golden_shape_ordering.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
status: 200
top-level keys: ['data', 'total']
total: 3
names, in real response order: ['Alpha Mill', 'Mid Mill', 'Zeta Mill']
one real machine's own real field keys: ['axes', 'category', 'createdAt', 'currentOperatorClientId', 'currentPartId', 'groupId', 'hasToolChanger', 'id', 'location', 'manufacturer', 'maxSpindleSpeed', 'model', 'name', 'operatorLastHeartbeatAt', 'serialNumber', 'spindleTaper', 'status', 'subType', 'toolChangerCapacity', 'updatedAt', 'xTravel', 'yTravel', 'zTravel']
response shape confirmed, and real ordering is alphabetical by name - not insertion order
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_golden_shape_ordering_output.txt`.

### Connection to the previous unit

This is the lesson's first unit - it establishes the real list endpoint every later unit in this lesson reuses, characterized across its first two real dimensions.

## Concept Unit: Defaults - What Happens When Nothing Is Specified

### The Problem

`get_machines` accepts three real, optional query parameters. What does "optional" actually mean, in terms of real behavior, when none of them are given at all?

Before reading on:

- If none of `status`, `type`, or `groupId` are present in a real request, what does `get_machines`'s own real code (`if status: ... if machine_type: ... if group_id: ...`) predict happens to the base `Machine.query`, before `.order_by` even runs?
- Is "return every real machine" the only reasonable real default a list endpoint could have chosen? What real alternative default can you name?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:27-38`, read again this session - the three real conditional filters, none of which apply when their own query parameter is absent.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** Three real `Machine` rows, with three different real, distinct status values.

### The New Code

Three real machines, three different real statuses, one real request with no filters at all:

**File:** `verification/phase-02/lab_pytest_demo/lab_golden_defaults.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine

app = create_app("testing")
with app.app_context():
    db.session.add(Machine(id="M-1", name="Available Mill", category="mill", sub_type="3_axis", status="available"))
    db.session.add(Machine(id="M-2", name="Running Mill", category="mill", sub_type="3_axis", status="running"))
    db.session.add(Machine(id="M-3", name="Offline Mill", category="mill", sub_type="3_axis", status="offline"))
    db.session.commit()

    client = app.test_client()
    response = client.get("/api/machines")
    body = response.get_json()

    print("no query params at all -> total:", body["total"])
    print("statuses returned:", sorted(m["status"] for m in body["data"]))

    assert body["total"] == 3
    assert sorted(m["status"] for m in body["data"]) == ["available", "offline", "running"]
    print("the real default, with no filter arguments given, is every real machine - nothing excluded")
```

### Mechanical Walkthrough

- `Machine(id="M-1", ..., status="available") / Machine(..., status="running") / Machine(..., status="offline")` — Three real machines with three deliberately different real `status` values - chosen specifically so a real filter, if one had been applied, would visibly exclude at least one of them.
- `client.get("/api/machines") (no query string at all)` — A real request to the bare route, with no `?status=...` or any other query parameter present - `request.args.get(...)` on the receiving end returns `None` for each of the three, so all three of `get_machines`'s own `if` conditions are `False`.
- `sorted(m["status"] for m in body["data"])` — A generator expression (already familiar from earlier in this curriculum) extracting each real machine's `status` field, sorted for a stable, order-independent comparison - deliberately not reusing the ordering check from the previous unit, since this unit is characterizing inclusion, not sequence.
- `assert sorted(...) == ["available", "offline", "running"]` — Confirms all three real, differently-statused machines came back - the real, concrete meaning of this route's own default: no filter given means no exclusion at all.

### CS Lens

This is characterizing an **implicit default**: behavior that exists only because of what a caller *didn't* say. Also recognized in: a function parameter's own default value, only observable by actually calling it without that argument; a config system falling back to a base config when no environment-specific override exists; a database column's own `DEFAULT` value, only visible on an insert that omits it; and, in this project's own domain, a machine left at its own default cutting feed rate whenever a program doesn't explicitly override it.

### SE Lens

The design principle is that "no filter" is itself a real, specific choice worth naming and checking, not an unremarkable absence. The real alternative this project's own code did not choose - requiring at least one real filter, or defaulting to an empty result with none given - would be an equally valid, real design; the honest cost of the one actually chosen here is that a caller who forgets to add a filter gets everything, silently, which could matter for a large real fleet of machines in a way it doesn't for this lesson's own three.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_golden_defaults.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
no query params at all -> total: 3
statuses returned: ['available', 'offline', 'running']
the real default, with no filter arguments given, is every real machine - nothing excluded
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_golden_defaults_output.txt`.

### Connection to the previous unit

The previous unit characterized what a response looks like and what order it comes in; this unit characterizes what's included in it by default, before this lesson's next unit starts deliberately excluding things.

## Concept Unit: Edge Cases - The Inputs Nobody Thinks to Try First

### The Problem

`?status=maintenance` and `?type=mill` are both real, plausible query strings a caller might reasonably send. This session's own real evidence shows they produce two completely different real outcomes - what actually explains the difference?

Before reading on:

- `Machine.status` is a real, declared column on `Machine`. Is `Machine.type`? Read `backend/app/models/machine.py` again if you're not sure, then predict what `query.filter(Machine.type == machine_type)` does if the answer is no.
- Two different "no real machine matches this filter" cases - one for a genuinely empty result, one for a query parameter that references a column that doesn't exist. Should a full characterization of this endpoint expect the same real outcome for both, or two different ones?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:27-38`, read again this session, alongside `backend/app/models/machine.py:41-80` - confirming, by reading it directly, that `Machine` declares no real `type` column (`type` belongs to the separate `MachineGroup` class in the same file).
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** One real `Machine` row.

### The New Code

Two real, plausible filters, tried one after another:

**File:** `verification/phase-02/lab_pytest_demo/lab_golden_edge_cases.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine

app = create_app("testing")
with app.app_context():
    db.session.add(Machine(id="M-1", name="Available Mill", category="mill", sub_type="3_axis", status="available"))
    db.session.commit()

    client = app.test_client()

    # Edge case 1: filtering by a real, but currently-unmatched, status value.
    r_no_match = client.get("/api/machines?status=maintenance")
    print("status=maintenance (no real machine has this) -> status:", r_no_match.status_code, "total:", r_no_match.get_json()["total"])
    assert r_no_match.status_code == 200
    assert r_no_match.get_json()["total"] == 0

    # Edge case 2: filtering by 'type' - a real query param this route's own
    # docstring documents, against a column Machine does not actually have.
    try:
        r_type_filter = client.get("/api/machines?type=mill")
        print("type=mill -> status:", r_type_filter.status_code, "body:", r_type_filter.get_json())
    except AttributeError as e:
        print("type=mill -> raised AttributeError:", e)

    print("two real 'unmatched filter' cases, two completely different real outcomes")
```

### Mechanical Walkthrough

- `client.get("/api/machines?status=maintenance")` — Sends a real, well-formed request with a query value that's genuinely valid (`"maintenance"` is one of the four values this route's own docstring names) but matches zero real rows in this unit's own tiny dataset.
- `assert r_no_match.status_code == 200 / assert ...["total"] == 0` — Confirms this first edge case is handled gracefully - a real `200`, with a real, empty `data` list and `total: 0` - the unmatched filter is a completely ordinary, well-behaved outcome.
- `try: r_type_filter = client.get("/api/machines?type=mill") except AttributeError as e:` — Wraps the second real request in a real `try`/`except`, deliberately, because this specific call is known, from this session's own earlier probing, to raise rather than return a normal response - a real, necessary adjustment to actually observe what happens instead of the script simply crashing.
- `except AttributeError as e: print("type=mill -> raised AttributeError:", e)` — Catches the real, genuine `AttributeError` `Machine.type` raises the moment `get_machines`'s own code tries to build a filter on it, and prints its real message - `"type object 'Machine' has no attribute 'type'"` - proof this is a real Python-level crash, not a handled `400` or `404` the route's own code chose to return.

### Execution Trace

1. `client.get("/api/machines?status=maintenance")` - real request reaches `get_machines`; `status` is truthy, so `query = query.filter(Machine.status == "maintenance")` runs successfully, since `Machine.status` is a real column; `machine_type` and `group_id` are both `None`, so neither of the next two `if` blocks runs.
2. The narrowed query, run against this unit's one real machine (whose own status is `"available"`, not `"maintenance"`), returns zero real rows - a completely ordinary, successful empty result.
3. `client.get("/api/machines?type=mill")` - real request reaches `get_machines` again; `machine_type` is truthy, so `query.filter(Machine.type == "mill")` is attempted.
4. Building that expression requires Python to first resolve `Machine.type` - and because no such real attribute exists on the class, Python raises `AttributeError` immediately, before any real SQL is ever built or run - the request never reaches `.order_by`, `jsonify`, or any of this route's own later real code at all.

### CS Lens

This is the real difference between a **handled failure** and an **unhandled exception** - `get_machines` was clearly written with *some* failure cases in mind (an unmatched filter, handled gracefully), but not this one. Also recognized in: a stack trace surfacing in production because an input path nobody anticipated slipped past every `try`/`except` in the code; a compiler's own distinction between a caught, reported error and an internal compiler crash; a fuzz tester's own real job being specifically to find inputs that trigger the second kind, not the first; and, in this project's own domain, a machine alarm the control software was actually programmed to raise, versus the control software itself locking up on an input its author never considered.

### SE Lens

The design principle is that a route's own docstring naming a query parameter is a real promise a caller reasonably relies on - `get_machines`'s own docstring lists `type` as a real, supported filter, and this unit's own real, run evidence shows using it crashes the request entirely. The real alternative not chosen - validating that every documented query parameter actually corresponds to a real column before filtering on it - was never built; the honest cost of that gap, made concrete here: any real caller who reads this route's own docstring and tries the exact filter it names gets a real, unhandled `AttributeError` instead of a normal response, in this project's real, currently-shipping code.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_golden_edge_cases.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
status=maintenance (no real machine has this) -> status: 200 total: 0
type=mill -> raised AttributeError: type object 'Machine' has no attribute 'type'
two real 'unmatched filter' cases, two completely different real outcomes
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_golden_edge_cases_output.txt`.

### Connection to the previous unit

The previous unit characterized the default, unfiltered case; this unit characterizes two real filtered edge cases, revealing that "unmatched filter" is not one single real behavior in this route at all.

## Concept Unit: Status Codes and Side Effects - What Changed, and How You'd Know

### The Problem

This project's real `POST /api/machines` claims, through its own response, that a new machine was created. What real, independent evidence would actually confirm that - and what specific real status code does this route use to signal it, rather than a bare success?

Before reading on:

- `create_machine`'s own real code returns `201`, not `200`, on success. What real, standard HTTP convention does that specific choice communicate that a bare `200` would not?
- If `create_machine`'s own code returned a real `201` but never actually called `db.session.commit()`, would checking only the response's status code catch that mistake?

### Project Change

- **Reference Source:** Real specimen: `backend/app/routes/machines.py:118-169` (`create_machine`), read again this session.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `User` row and a real token, since this route's own `allowed_roles` does not include `'operator'` - the real bypass an earlier lesson found does not apply here.

### The New Code

One real, valid creation request, checked against both its own response and a completely separate, real database query:

**File:** `verification/phase-02/lab_pytest_demo/lab_golden_status_side_effects.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine
from app.models.user import User
from app.utils.auth_utils import encode_auth_token

app = create_app("testing")
with app.app_context():
    user = User(id="U-PROG-001", email="programmer@example.com", name="Test Programmer", role="programming")
    db.session.add(user)
    db.session.commit()
    token = encode_auth_token("U-PROG-001", "programming")

    client = app.test_client()

    real_count_before = Machine.query.count()
    print("real Machine rows before the request:", real_count_before)

    response = client.post(
        "/api/machines",
        json={
            "id": "M-NEW-001",
            "name": "New Mill",
            "category": "mill",
            "subType": "3_axis",
            "manufacturer": "Haas",
            "model": "VF-2",
        },
        headers={"Authorization": f"Bearer {token}"},
    )
    print("POST /api/machines -> status:", response.status_code)
    print("response body:", response.get_json())

    real_count_after = Machine.query.count()
    persisted = db.session.get(Machine, "M-NEW-001")
    print("real Machine rows after the request:", real_count_after)
    print("real, independently-queried row:", persisted.name if persisted else None)

    assert response.status_code == 201
    assert real_count_before == 0
    assert real_count_after == 1
    assert persisted is not None
    assert persisted.name == "New Mill"
    print("status code AND a real database row both confirm the same real creation")
```

### Mechanical Walkthrough

- `user = User(id="U-PROG-001", ..., role="programming") / token = encode_auth_token(...)` — Builds a real user with the `"programming"` role and a real, valid token for them - required here because `create_machine`'s own `allowed_roles=['programming', 'admin']` never includes `'operator'`, so the header-optional bypass an earlier lesson found does not apply to this specific route.
- `real_count_before = Machine.query.count()` — A real, independent baseline query, run *before* the request - establishing a real fact (zero rows) this unit can later compare against, the same discipline an earlier lesson's own integration test first used.
- `response = client.post("/api/machines", json={...}, headers={...})` — One real, complete request - a real body with all six required real fields, and a real `Authorization` header.
- `assert response.status_code == 201` — Confirms the real, specific success code this route's own code chose - `201 Created`, the standard real HTTP convention for "a new resource now exists," distinct from the plain `200` every read-only route in this lesson has used so far.
- `persisted = db.session.get(Machine, "M-NEW-001")` — A second, real, independent query, run *after* the request - not reusing anything the response itself returned, so this genuinely re-confirms what's actually in the database.
- `assert real_count_after == 1 / assert persisted is not None / assert persisted.name == "New Mill"` — Three separate real assertions, all against the independent query above, none of them trusting the response body alone - the real proof this unit exists to demonstrate.

### CS Lens

This is characterizing **status code semantics**, not just status code values - `201` specifically means "a new resource was created," a real, narrower claim than `200`'s "this succeeded." Also recognized in: REST's own broader status code conventions (`204` for a real success with no body, `202` for real, accepted- but-not-yet-complete work); a compiler's own distinct exit codes for "succeeded," "warned," and "failed" instead of one pass/fail bit; a shipping carrier's own separate real tracking states for "label created" versus "package received"; and, in this project's own domain, a machine alarm code distinguishing "operation complete" from "operation complete with warnings."

### SE Lens

The design principle is that a specific status code is itself part of a route's real, characterized contract - not an arbitrary choice interchangeable with any other "it worked" code. The real alternative this project's own code did not choose - returning a bare `200` for every real success, write or read alike - would still be caller-usable, but would throw away real, standard information a caller could otherwise rely on without even parsing the body. The honest cost of checking a real database row on top of the status code, as this unit does: real, extra setup and a real, second query, paid specifically because a status code alone is a claim, not proof - this lesson's own database-effects work, repeated here on a fresh, real specimen.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_golden_status_side_effects.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
real Machine rows before the request: 0
POST /api/machines -> status: 201
response body: {'data': {'axes': 3, 'category': 'mill', 'createdAt': '2026-08-31T00:12:58.053515', 'currentOperatorClientId': None, 'currentPartId': None, 'groupId': None, 'hasToolChanger': False, 'id': 'M-NEW-001', 'location': None, 'manufacturer': 'Haas', 'maxSpindleSpeed': None, 'model': 'VF-2', 'name': 'New Mill', 'operatorLastHeartbeatAt': None, 'serialNumber': None, 'spindleTaper': None, 'status': 'available', 'subType': '3_axis', 'toolChangerCapacity': None, 'updatedAt': '2026-08-31T00:12:58.053517', 'xTravel': None, 'yTravel': None, 'zTravel': None}}
real Machine rows after the request: 1
real, independently-queried row: New Mill
status code AND a real database row both confirm the same real creation
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_golden_status_side_effects_output.txt`.

### Connection to the previous unit

The previous three units all characterized a real, read-only route; this unit moves to a real write, where a status code's own claim and a database's own real state can, in principle, disagree - and this unit's own real check confirms, this time, that they don't.

## Concept Unit: Error Behavior - Characterizing Failure as Carefully as Success

### The Problem

Two genuinely different real reasons a `POST` to `create_machine` can fail - both return the identical real status code, `400`. What does characterizing failure "as carefully as success" actually demand, beyond confirming both requests failed?

Before reading on:

- Both of this unit's own two failing requests return the exact same real status code. What real, additional fact would a caller actually need in order to tell the two failures apart?
- Neither of these two failed requests leaves any real trace in the database. Is that itself something worth explicitly characterizing with its own real assertion, or does it not need saying?

### Project Change

- **Reference Source:** Real specimen: the same `create_machine` (`backend/app/routes/machines.py:118-169`) as the previous unit, now exercised along its two real, distinct `400` paths instead of its success path.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A - a new, standalone script; no existing project structure to place it within.
- **Dependencies:** A real `Machine` row (to collide with), a real `User`, and a real token.

### The New Code

Two real, separately broken requests against the same real route:

**File:** `verification/phase-02/lab_pytest_demo/lab_golden_error_behavior.py` (new)

```python
import sys
sys.path.insert(0, "backend")

from app import create_app, db
from app.models.machine import Machine
from app.models.user import User
from app.utils.auth_utils import encode_auth_token

app = create_app("testing")
with app.app_context():
    db.session.add(Machine(id="M-EXISTING", name="Existing Mill", category="mill", sub_type="3_axis", status="available"))
    user = User(id="U-PROG-001", email="programmer@example.com", name="Test Programmer", role="programming")
    db.session.add(user)
    db.session.commit()
    token = encode_auth_token("U-PROG-001", "programming")
    auth = {"Authorization": f"Bearer {token}"}

    client = app.test_client()

    # Missing a real, required field.
    r_missing_field = client.post("/api/machines", json={"id": "M-A", "name": "A Mill"}, headers=auth)
    print("missing required fields -> status:", r_missing_field.status_code, "body:", r_missing_field.get_json())

    # A real, valid body, but an id that already exists.
    r_duplicate_id = client.post(
        "/api/machines",
        json={"id": "M-EXISTING", "name": "Dup Mill", "category": "mill", "subType": "3_axis", "manufacturer": "Haas", "model": "VF-2"},
        headers=auth,
    )
    print("duplicate id -> status:", r_duplicate_id.status_code, "body:", r_duplicate_id.get_json())

    assert r_missing_field.status_code == 400
    assert "Missing required field" in r_missing_field.get_json()["error"]
    assert r_duplicate_id.status_code == 400
    assert r_duplicate_id.get_json()["error"] == "Machine ID already exists"

    real_count = Machine.query.count()
    print("real Machine rows after both failed requests:", real_count)
    assert real_count == 1
    print("two real, distinct 400s, with two real, distinct messages - and neither one left a real side effect behind")
```

### Mechanical Walkthrough

- `r_missing_field = client.post("/api/machines", json={"id": "M-A", "name": "A Mill"}, headers=auth)` — Sends a real, authenticated request missing four of the route's six real required fields; `create_machine`'s own code checks them in a fixed real order and reports the first one it finds missing - `"category"`, confirmed by this unit's own real, saved output.
- `assert "Missing required field" in r_missing_field.get_json()["error"]` — Checks for a real, stable substring rather than the exact full message - deliberately, since the *specific* missing field named depends on which real fields this unit's own body happened to include, while the general shape of the message is the real, stable fact worth pinning down.
- `r_duplicate_id = client.post("/api/machines", json={"id": "M-EXISTING", ...}, headers=auth)` — Sends a second, separately real request - this time with every real required field present and valid, but reusing `"M-EXISTING"`, an ID this unit already inserted directly into the database beforehand.
- `assert r_duplicate_id.get_json()["error"] == "Machine ID already exists"` — Checks the *exact* real message this time, since this unit's own input is fixed and known - a genuinely different, real, distinguishable failure reason from the first request, even though both share the identical real `400` status code.
- `real_count = Machine.query.count() / assert real_count == 1` — A real, independent database check confirming neither failed request left any real trace behind - the count stays at `1` (the one machine this unit inserted directly), proving both real failures were genuinely rejected before any write ever happened.

### CS Lens

This is characterizing **error taxonomy**: distinguishing genuinely different real failure reasons that happen to share a status code, rather than treating "not 200" as one undifferentiated bucket. Also recognized in: a compiler's own distinct diagnostic codes for different real syntax errors, all still "compilation failed"; an HTTP API's own machine-readable `error.code` field alongside a shared status code (this project's own real `'code': 'TOKEN_MISSING'`, seen in an earlier lesson, is exactly this pattern); a database's own distinct constraint-violation error codes, all reported under one broad "insert failed" outcome; and, in this project's own domain, two different real alarm conditions that both halt a machine, distinguished only by which specific alarm code actually fired.

### SE Lens

The design principle is that "it failed" is rarely the complete real answer a caller - or a test - actually needs; *why* it failed is a separate, real fact worth characterizing on its own. The real alternative not chosen - checking only `status_code == 400` for both requests and calling the error path "characterized" - would pass today, but would fail to notice a real, future change that swapped these two messages, or merged them into one generic string, since neither would change the shared status code at all. The honest cost of characterizing both messages separately, as this unit does: two real, distinct assertions instead of one shared one, for two real failure reasons this project's own code already, deliberately, tells apart.

### Commands needed

- `backend/.venv/Scripts/python.exe verification/phase-02/lab_pytest_demo/lab_golden_error_behavior.py` — Runs this as a plain script, from the repository root.

### Verification

```text
Seeding default users...
missing required fields -> status: 400 body: {'error': 'Missing required field: category'}
duplicate id -> status: 400 body: {'error': 'Machine ID already exists'}
real Machine rows after both failed requests: 1
two real, distinct 400s, with two real, distinct messages - and neither one left a real side effect behind
```

Full saved run: `verification/phase-02/lab_pytest_demo/lab_golden_error_behavior_output.txt`.

### Connection to the previous unit

The previous unit characterized what a real success looks like, status code and side effect together; this unit closes the lesson by characterizing failure with the same real care - two distinct real reasons, one shared code, and a real, confirmed absence of any side effect either way.

## Connect the pieces

One real list endpoint, characterized across every real dimension this lesson set out to cover: its exact real response shape (`data` and `total`, nothing else), its real, deliberate alphabetical ordering (proven against machines inserted out of that order), its real default of excluding nothing when no filter is given, and two real edge cases - one an ordinary empty result, the other a genuine, previously undiscovered `AttributeError` this project's own `?type=` filter has been shipping with the whole time. And one real write endpoint, characterized just as fully: a real `201`, backed by a real, independently-queried database row proving the claim true, and two real, distinct `400` failures, sharing one status code but carrying two genuinely different real messages, both confirmed to leave the database exactly as they found it. This is what "golden behavior" actually means: not one field checked once, but the whole real, observable shape of what a system does - success, failure, and the edges in between - recorded precisely enough that nothing about it can change again without a real test noticing.

**Next lesson:** Every real behavior this lesson characterized already existed, unplanned, in code nobody set out to write a certain way on purpose. Next, this curriculum reverses the order completely: writing a real test *first*, for behavior that doesn't exist yet, and letting that test drive the real code that makes it pass - the real discipline this whole phase has been building toward.